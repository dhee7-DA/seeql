// Query funnel: answers "how did 150 rows become 5?" by rebuilding the
// query's AST and running cumulative COUNT(*) probes against the live
// sample database. Server-only.
//
// Strategy: clone the parsed AST, strip/keep clauses to isolate each
// pipeline stage, render back to SQL with parser.sqlify(), wrap in
// SELECT COUNT(*) and execute. Every probe is best-effort — a probe that
// fails simply reports null instead of failing the whole funnel.

import { Parser } from "node-sql-parser";
import { db } from "@/lib/db";
import { ensureDatabase } from "@/lib/sample-db";
import { exprToString, type Dialect } from "./sql-parser";
import type {
  FilterProbe,
  FunnelResponse,
  FunnelResult,
  FunnelStage,
  JoinProbe,
} from "./sql-types";

type AstNode = Record<string, unknown>;

const MAX_FILTER_PROBES = 8;
const MAX_JOIN_PROBES = 6;

function nameOf(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object") {
    const rec = val as AstNode;
    if ("value" in rec && typeof rec.value !== "object")
      return rec.value === null ? null : String(rec.value);
    if ("name" in rec) return nameOf(rec.name);
  }
  return null;
}

function cloneAst(node: AstNode): AstNode {
  return JSON.parse(JSON.stringify(node)) as AstNode;
}

/** Remove every clause except FROM/JOIN/WITH so only the row source remains. */
function stripToRowSource(node: AstNode) {
  delete node.where;
  delete node.groupby;
  delete node.having;
  delete node.orderby;
  delete node.limit;
  delete node.distinct;
}

const SAFE_IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

async function countOf(parser: Parser, sqlText: string, dialect: Dialect): Promise<number | null> {
  try {
    const wrapped = `SELECT COUNT(*) AS n FROM (${sqlText}) AS __probe`;
    const res = (await db.$queryRawUnsafe(wrapped)) as Array<Record<string, unknown>>;
    const n = Number(res[0]?.n);
    return Number.isFinite(n) ? n : null;
  } catch {
    // Probes run on SQLite even when the query was parsed as another dialect;
    // a dialect-specific construct may fail here — report null, not an error.
    void parser;
    void dialect;
    return null;
  }
}

/** Split a WHERE AST on top-level ANDs into condition nodes. */
function flattenAnd(node: unknown, acc: unknown[]): void {
  if (!node || typeof node !== "object") return;
  const rec = node as AstNode;
  if (rec.type === "binary_expr" && rec.operator === "AND") {
    flattenAnd(rec.left, acc);
    flattenAnd(rec.right, acc);
  } else {
    acc.push(node);
  }
}

function extractLimitText(root: AstNode): string | null {
  const lim = root.limit;
  const arr = Array.isArray(lim)
    ? (lim as AstNode[])
    : lim && typeof lim === "object"
      ? [lim as AstNode]
      : [];
  const parts: string[] = [];
  for (const l of arr) {
    const vals = Array.isArray(l.value) ? (l.value as AstNode[]) : [];
    const nums = vals.map((v) => nameOf(v?.value) ?? exprToString(v)).filter(Boolean);
    const sep = String(l.seperator ?? l.separator ?? "").toLowerCase();
    if (sep === "offset") {
      if (nums[0] && !parts.length) parts.push(`LIMIT ${nums[0]}`);
      if (nums[1]) parts.push(`OFFSET ${nums[1]}`);
    } else if (sep === "," || sep === "comma") {
      if (nums[0]) parts.push(`OFFSET ${nums[0]}`);
      if (nums[1]) parts.push(`LIMIT ${nums[1]}`);
    } else if (nums[0]) {
      parts.push(`LIMIT ${nums[0]}`);
      if (nums[1]) parts.push(`OFFSET ${nums[1]}`);
    }
  }
  return parts.length ? parts.join(" ") : null;
}

function fmtDelta(prev: number | null, cur: number | null): string | undefined {
  if (prev === null || cur === null || prev <= 0) return undefined;
  const pct = Math.round(((cur - prev) / prev) * 100);
  if (pct === 0) return "±0%";
  return `${pct > 0 ? "+" : "-"}${Math.abs(pct)}%`;
}

/** Best-effort count of left rows with no matching right row for LEFT JOINs. */
async function unmatchedLeftCount(
  leftEntries: AstNode[],
  rightEntry: AstNode,
  onText: string,
): Promise<number | null> {
  // Both sides must be plain physical tables (no subqueries), and the ON
  // condition must be a simple "a.col = b.col" equality.
  if (rightEntry.expr) return null;
  const eq = onText.match(/^\s*([A-Za-z_][\w.]*)\s*=\s*([A-Za-z_][\w.]*)\s*$/);
  if (!eq) return null;

  const resolveSide = (side: string): { table: string; col: string } | null => {
    const parts = side.trim().split(".");
    if (parts.length !== 2 || parts.some((p) => !SAFE_IDENT.test(p))) return null;
    return { table: parts[0], col: parts[1] };
  };
  const a = resolveSide(eq[1]);
  const b = resolveSide(eq[2]);
  if (!a || !b) return null;

  const rightLabel = nameOf(rightEntry.as) ?? nameOf(rightEntry.table);
  if (!rightLabel) return null;
  const rightSide = a.table === rightLabel ? a : b.table === rightLabel ? b : null;
  const leftSide = rightSide === a ? b : rightSide === b ? a : null;
  if (!rightSide || !leftSide) return null;

  const rightPhys = nameOf(rightEntry.table);
  if (!rightPhys || !SAFE_IDENT.test(rightPhys)) return null;

  // find the physical table behind the left-side alias/name
  let leftPhys: string | null = null;
  for (const entry of leftEntries) {
    if (entry.expr) continue;
    const label = nameOf(entry.as) ?? nameOf(entry.table);
    const phys = nameOf(entry.table);
    if (label === leftSide.table && phys && SAFE_IDENT.test(phys)) {
      leftPhys = phys;
      break;
    }
  }
  if (!leftPhys) return null;

  try {
    const res = (await db.$queryRawUnsafe(
      `SELECT COUNT(*) AS n FROM (SELECT 1 FROM ${leftPhys} WHERE NOT EXISTS ` +
        `(SELECT 1 FROM ${rightPhys} WHERE ${rightPhys}.${rightSide.col} = ${leftPhys}.${leftSide.col})) AS __u`,
    )) as Array<Record<string, unknown>>;
    const n = Number(res[0]?.n);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function runFunnel(rawSql: string, dialect: Dialect): Promise<FunnelResponse> {
  const sql = rawSql.trim().replace(/;+\s*$/, "");
  if (!sql) return { ok: false, error: "Query is empty." };

  const parser = new Parser();
  let ast: unknown;
  try {
    ast = parser.astify(sql, { database: dialect });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
  if (Array.isArray(ast)) ast = ast[0];
  const root = ast as AstNode | null;
  if (!root) return { ok: false, error: "Could not parse the statement." };

  const statementType = String(root.type ?? "").toUpperCase();

  const emptyResult = (applicable: false, reason: string, finalRows: number | null = null): FunnelResponse => ({
    ok: true,
    applicable,
    reason,
    baseRows: null,
    finalRows,
    stages: [],
    filters: [],
    joins: [],
  });

  if (statementType !== "SELECT") {
    return emptyResult(false, `The funnel probes SELECT pipelines — this is a ${statementType || "unknown"} statement.`);
  }
  if (root._next) {
    const finalRows = await countOf(
      parser,
      parser.sqlify(root as never, { database: dialect }),
      dialect,
    );
    return emptyResult(false, "Set operations (UNION / INTERSECT / EXCEPT) are not funnel-supported yet — here is the final row count.", finalRows);
  }

  const fromEntries = (Array.isArray(root.from) ? root.from : []) as AstNode[];
  if (fromEntries.length === 0 || fromEntries.some((f) => f.expr)) {
    return emptyResult(false, "The funnel needs a plain FROM clause (derived tables are not supported yet).");
  }

  await ensureDatabase();

  const sqlify = (node: AstNode) => parser.sqlify(node as never, { database: dialect });

  /** FROM slice 0..n (clauses stripped, SELECT *) as SQL text */
  const fromSliceSql = (n: number): string => {
    const c = cloneAst(root);
    stripToRowSource(c);
    c.columns = [{ expr: { type: "star" }, as: null }];
    c.from = fromEntries.slice(0, n);
    return sqlify(c);
  };

  /* ---- stage probes ------------------------------------------------ */

  const baseRows = await countOf(parser, fromSliceSql(fromEntries.length), dialect);

  const whereNodes: unknown[] = [];
  if (root.where) flattenAnd(root.where, whereNodes);

  let afterWhere: number | null = null;
  if (root.where) {
    const c = cloneAst(root);
    delete c.groupby;
    delete c.having;
    delete c.orderby;
    delete c.limit;
    delete c.distinct;
    // star columns — the original list may contain aggregates that would
    // collapse everything into a single row without GROUP BY
    c.columns = [{ expr: { type: "star" }, as: null }];
    afterWhere = await countOf(parser, sqlify(c), dialect);
  }

  const gb = root.groupby;
  const hasGroup = Boolean(gb && (!Array.isArray(gb) || (gb as AstNode[]).length > 0));
  const groupKeys: string[] = [];
  if (hasGroup) {
    const gbList: unknown[] = Array.isArray(gb)
      ? (gb as unknown[])
      : Array.isArray((gb as AstNode).columns)
        ? ((gb as AstNode).columns as unknown[])
        : [];
    for (const g of gbList) groupKeys.push(exprToString(g));
  }

  let afterGroup: number | null = null;
  if (hasGroup) {
    const c = cloneAst(root);
    delete c.having;
    delete c.orderby;
    delete c.limit;
    delete c.distinct;
    afterGroup = await countOf(parser, sqlify(c), dialect);
  }

  let afterHaving: number | null = null;
  if (hasGroup && root.having) {
    const c = cloneAst(root);
    delete c.orderby;
    delete c.limit;
    delete c.distinct;
    afterHaving = await countOf(parser, sqlify(c), dialect);
  }

  let afterDistinct: number | null = null;
  if (root.distinct) {
    const c = cloneAst(root);
    delete c.orderby;
    delete c.limit;
    const inner = sqlify(c);
    afterDistinct = await countOf(parser, `SELECT DISTINCT * FROM (${inner}) AS __p`, dialect);
  }

  const limitText = extractLimitText(root);
  const finalRows = await countOf(parser, sqlify(root), dialect);

  /* ---- assemble stages ---------------------------------------------- */

  const stages: FunnelStage[] = [];
  stages.push({
    key: "from",
    label: "FROM & JOINs",
    detail: `${fromEntries.length} table${fromEntries.length === 1 ? "" : "s"} combined`,
    count: baseRows,
    kind: "rows",
  });

  let prev: number | null = baseRows;
  const push = (stage: FunnelStage) => {
    stage.delta = fmtDelta(prev, stage.count);
    stages.push(stage);
    if (stage.count !== null) prev = stage.count;
  };

  if (root.where) {
    push({
      key: "where",
      label: "WHERE",
      detail: `${whereNodes.length} condition${whereNodes.length === 1 ? "" : "s"} applied`,
      count: afterWhere,
      kind: "rows",
    });
  }
  if (hasGroup) {
    push({
      key: "group",
      label: "GROUP BY",
      detail: groupKeys.length ? `by ${groupKeys.join(", ")}` : "rows collapse into groups",
      count: afterGroup,
      kind: "groups",
    });
  }
  if (root.having) {
    push({
      key: "having",
      label: "HAVING",
      detail: "groups filtered",
      count: afterHaving,
      kind: "groups",
    });
  }
  if (root.distinct) {
    push({
      key: "distinct",
      label: "DISTINCT",
      detail: "duplicate rows removed",
      count: afterDistinct,
      kind: "rows",
    });
  }
  if (Array.isArray(root.orderby) && root.orderby.length > 0) {
    push({
      key: "order",
      label: "ORDER BY",
      detail: "sorts rows — count unchanged",
      count: prev,
      kind: "rows",
    });
  }
  push({
    key: "result",
    label: limitText ? `Final result · ${limitText}` : "Final result",
    detail: limitText ? "after LIMIT/OFFSET" : "rows returned to you",
    count: finalRows,
    kind: "final",
  });

  /* ---- filter probes ------------------------------------------------- */

  const filters: FilterProbe[] = [];
  const condTexts = whereNodes
    .map((n) => exprToString(n))
    .filter((t) => t && t !== "?")
    .slice(0, MAX_FILTER_PROBES);
  if (condTexts.length > 0 && baseRows !== null) {
    const baseSql = fromSliceSql(fromEntries.length);
    for (let i = 0; i < condTexts.length; i++) {
      const individual = await countOf(parser, `${baseSql} WHERE ${condTexts[i]}`, dialect);
      const cumulative = await countOf(
        parser,
        `${baseSql} WHERE ${condTexts.slice(0, i + 1).join(" AND ")}`,
        dialect,
      );
      filters.push({ text: condTexts[i], individual, cumulative });
    }
  }

  /* ---- join probes ---------------------------------------------------- */

  const joins: JoinProbe[] = [];
  const joinCount = Math.min(fromEntries.length - 1, MAX_JOIN_PROBES);
  let before = joinCount >= 1 ? await countOf(parser, fromSliceSql(1), dialect) : null;
  for (let k = 1; k <= joinCount; k++) {
    const entry = fromEntries[k];
    const after = await countOf(parser, fromSliceSql(k + 1), dialect);

    const joinRaw = nameOf(entry.join) ?? "join";
    const joinType = joinRaw.replace(/_/g, " ").toUpperCase();

    let onText: string;
    if (entry.on) onText = exprToString(entry.on);
    else if (Array.isArray(entry.using)) {
      const cols = (entry.using as AstNode[])
        .map((u) => nameOf(u?.column ?? u) ?? "")
        .filter(Boolean);
      onText = `USING (${cols.join(", ")})`;
    } else onText = "(condition not available)";

    const prevEntry = fromEntries[k - 1];
    const leftLabel = nameOf(prevEntry?.as) ?? nameOf(prevEntry?.table) ?? "?";
    const rightLabel = nameOf(entry.as) ?? nameOf(entry.table) ?? "?";

    const multiplier =
      before !== null && after !== null && before > 0
        ? Math.round((after / before) * 100) / 100
        : null;

    const unmatchedLeft =
      joinType.startsWith("LEFT") && entry.on
        ? await unmatchedLeftCount(fromEntries.slice(0, k), entry, onText)
        : null;

    joins.push({ left: leftLabel, right: rightLabel, type: joinType, on: onText, before, after, multiplier, unmatchedLeft });
    before = after;
  }

  const result: FunnelResult = {
    ok: true,
    applicable: true,
    baseRows,
    finalRows,
    stages,
    filters,
    joins,
  };
  return result;
}
