// SQL → QueryPlan compiler. Runs on the server (API route) using node-sql-parser.
// The walker is intentionally defensive: the AST shape varies across dialects
// and parser versions, so every access is optional-chained with sane fallbacks.

import { Parser } from "node-sql-parser";
import type {
  ColumnInfo,
  CteInfo,
  JoinInfo,
  OrderItem,
  PlanStats,
  QueryPlan,
  TableInfo,
} from "./sql-types";

export { DIALECTS as SUPPORTED_DIALECTS } from "./sql-types";
import type { DialectName } from "./sql-types";

export type { DialectName as Dialect };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Normalize identifier-ish values: "x" | {value:"x"} | null → string|null */
function nameOf(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object") {
    const rec = val as Record<string, unknown>;
    if ("value" in rec && typeof rec.value !== "object")
      return rec.value === null ? null : String(rec.value);
    if ("name" in rec) return nameOf(rec.name);
  }
  return null;
}

function funcName(node: Record<string, unknown>): string {
  const raw = node.name;
  const direct = nameOf(raw);
  if (direct) return direct;
  if (Array.isArray(raw)) {
    const parts = (raw as Array<Record<string, unknown>>)
      .map((p) => nameOf(p) ?? "")
      .filter(Boolean);
    if (parts.length) return parts.join(".");
  }
  if (raw && typeof raw === "object") {
    const inner = (raw as Record<string, unknown>).name;
    if (Array.isArray(inner)) {
      const parts = (inner as Array<Record<string, unknown>>)
        .map((p) => nameOf(p) ?? "")
        .filter(Boolean);
      if (parts.length) return parts.join(".");
    }
  }
  return "FUNC";
}

function argsToArray(args: unknown): Record<string, unknown>[] {
  if (!args) return [];
  if (Array.isArray(args)) return args as Record<string, unknown>[];
  const a = args as Record<string, unknown>;
  if (a.expr) return [a.expr as Record<string, unknown>];
  if (a.value !== undefined) return [].concat(a.value as never) as Record<string, unknown>[];
  return [];
}

/** Render an OVER (...) clause of a window function */
function overToString(over: unknown): string {
  if (!over || typeof over !== "object") return "";
  const o = over as Record<string, unknown>;
  if (o.type === "window") {
    const specWrapper = o.as_window_specification as Record<string, unknown> | undefined;
    const spec = (specWrapper?.window_specification ?? specWrapper) as
      | Record<string, unknown>
      | undefined;
    if (!spec) return " OVER (...)";
    const parts: string[] = [];
    const pb = spec.partitionby;
    if (Array.isArray(pb) && pb.length) {
      parts.push(
        `PARTITION BY ${pb
          .map((p: Record<string, unknown>) => exprToString(p?.expr ?? p))
          .join(", ")}`,
      );
    }
    const ob = spec.orderby;
    if (Array.isArray(ob) && ob.length) {
      parts.push(
        `ORDER BY ${ob
          .map((x: Record<string, unknown>) =>
            [exprToString(x.expr), x.type ? String(x.type) : ""].filter(Boolean).join(" "),
          )
          .join(", ")}`,
      );
    }
    const frame = spec.window_frame_clause;
    if (frame) {
      const frameText =
        typeof frame === "string" ? frame.toUpperCase() : exprToString(frame);
      if (frameText && frameText !== "?") parts.push(frameText);
    }
    return ` OVER (${parts.join(" ")})`;
  }
  if (nameOf(o.type)) return ` OVER ${nameOf(o.type)}`;
  return " OVER (...)";
}

/* ------------------------------------------------------------------ */
/* Expression → readable SQL text                                      */
/* ------------------------------------------------------------------ */

export function exprToString(e: unknown): string {
  if (e === null || e === undefined) return "";
  if (typeof e === "string") return e;
  if (typeof e === "number") return String(e);
  if (typeof e !== "object") return String(e);
  const node = e as Record<string, unknown>;

  // Sub-selects inside expressions arrive wrapped as { tableList, columnList, ast }
  if (!node.type && node.ast && typeof node.ast === "object") {
    return exprToString(node.ast);
  }

  switch (node.type) {
    case "expr":
      return exprToString(node.expr);
    case "default":
      return String(node.value ?? "");
    case "column_ref": {
      const table = nameOf(node.table);
      // "t.*" arrives as a column_ref whose column is the string "*"
      if (node.column === "*") return table ? `${table}.*` : "*";
      const col =
        nameOf(node.column) ??
        (node.column && typeof node.column === "object"
          ? exprToString(node.column)
          : "?");
      return table ? `${table}.${col}` : col;
    }
    case "star": {
      const table = nameOf(node.table);
      return table ? `${table}.*` : "*";
    }
    case "number":
    case "integer":
    case "double":
    case "float":
      return String(node.value);
    case "string":
    case "single_quote_string":
    case "double_quote_string":
    case "backticks_quote_string":
      return `'${String(node.value ?? "")}'`;
    case "bool":
      return String(node.value);
    case "null":
      return "NULL";
    case "param":
      return "?";
    case "expr_list":
    case "value_list": {
      const inner = argsToArray(node.value)
        .map(exprToString)
        .join(", ");
      return `(${inner})`;
    }
    case "binary_expr": {
      const left = exprToString(node.left);
      const right = exprToString(node.right);
      return `${left} ${String(node.operator ?? "")} ${right}`;
    }
    case "unary_expr":
      return `${String(node.operator ?? "")}${String(node.operator) === "-" ? "" : " "}${exprToString(node.expr)}`;
    case "aggr_func": {
      const args = node.args as Record<string, unknown> | undefined;
      const distinct = args?.distinct ? "DISTINCT " : "";
      let inner = "*";
      if (args?.expr) inner = exprToString(args.expr);
      else if (args?.args)
        inner = argsToArray(args.args)
          .map(exprToString)
          .join(", ");
      return `${funcName(node)}(${distinct}${inner})${overToString(node.over)}`;
    }
    case "window_func": {
      const inner = argsToArray(node.args)
        .map(exprToString)
        .join(", ");
      return `${funcName(node)}(${inner})${overToString(node.over)}`;
    }
    case "function":
    case "scalar_function": {
      const inner = argsToArray(node.args)
        .map(exprToString)
        .join(", ");
      return `${funcName(node)}(${inner})${overToString(node.over)}`;
    }
    case "case": {
      const operand = node.operand ? exprToString(node.operand) : "";
      const whens = Array.isArray(node.whens)
        ? (node.whens as Array<Record<string, unknown>>)
            .map((w) => {
              const cond = w.cond ?? w.when;
              const result = w.result ?? w.then;
              return `WHEN ${exprToString(cond)} THEN ${exprToString(result)}`;
            })
            .join(" ")
        : "";
      const els = node.else ? ` ELSE ${exprToString(node.else)}` : "";
      return `CASE ${operand ? `${operand} ` : ""}${whens}${els} END`;
    }
    case "cast": {
      const target = node.target as Record<string, unknown> | undefined;
      const dataType = nameOf(target?.dataType) ?? "";
      const expr = exprToString(node.expression ?? node.expr);
      return `CAST(${expr} AS ${dataType})`;
    }
    case "exprlist":
      return argsToArray(node.value)
        .map(exprToString)
        .join(", ");
    case "select": {
      const cols = Array.isArray(node.columns)
        ? (node.columns as Array<Record<string, unknown>>)
        : [];
      const colTexts = cols
        .slice(0, 2)
        .map((c) => exprToString(c?.expr ?? c))
        .filter(Boolean);
      const fromArr = Array.isArray(node.from)
        ? (node.from as Array<Record<string, unknown>>)
            .map((f) => nameOf(f.table))
            .filter((n): n is string => !!n)
        : [];
      let text = `SELECT ${colTexts.join(", ") || "…"}`;
      if (colTexts.length > 1 || cols.length > 2) text += ", …";
      if (fromArr.length) text += ` FROM ${fromArr.join(", ")}`;
      return `(${text})`;
    }
    case "interval": {
      const unit = nameOf(node.unit) ?? "";
      return `INTERVAL ${exprToString(node.value)} ${unit}`.trim();
    }
    default: {
      if (node.value !== undefined && typeof node.value !== "object")
        return String(node.value);
      if (node.expr) return exprToString(node.expr);
      if (node.column) return exprToString(node.column);
      const viaName = nameOf(node.name);
      if (viaName) {
        const inner = argsToArray(node.args)
          .map(exprToString)
          .join(", ");
        return `${viaName}(${inner})`;
      }
      return "?";
    }
  }
}

/** Recursively collect referenced table/alias names inside an expression */
function collectTableRefs(node: unknown, acc: Set<string>): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((n) => collectTableRefs(n, acc));
    return;
  }
  const rec = node as Record<string, unknown>;
  if (rec.type === "column_ref" || ("column" in rec && "table" in rec)) {
    const t = nameOf(rec.table);
    if (t) acc.add(t);
  }
  for (const key of Object.keys(rec)) {
    if (key === "type" || key === "location" || key === "range") continue;
    const val = rec[key];
    if (val && typeof val === "object") collectTableRefs(val, acc);
  }
}

/** Recursively find every SELECT node and collect its FROM-clause tables */
function collectTablesDeep(node: unknown, acc: Set<string>, depth = 0): void {
  if (!node || typeof node !== "object" || depth > 8) return;
  if (Array.isArray(node)) {
    node.forEach((n) => collectTablesDeep(n, acc, depth));
    return;
  }
  const rec = node as Record<string, unknown>;
  if (Array.isArray(rec.from)) {
    for (const f of rec.from as Array<Record<string, unknown>>) {
      const t = nameOf(f.table);
      if (t) acc.add(f.as ? `${t} (${nameOf(f.as) ?? f.as})` : t);
      else if (f.expr) {
        acc.add(`(subquery)${f.as ? ` AS ${nameOf(f.as) ?? f.as}` : ""}`);
        collectTablesDeep(f.expr, acc, depth + 1);
      }
    }
  }
  for (const key of Object.keys(rec)) {
    if (key === "type" || key === "location" || key === "range") continue;
    const val = rec[key];
    if (val && typeof val === "object") collectTablesDeep(val, acc, depth + 1);
  }
}

/** Check if any nested expression contains an aggregation or a subquery */
function scanFlags(
  node: unknown,
  flags: { aggr: boolean; subquery: boolean; window: boolean },
): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((n) => scanFlags(n, flags));
    return;
  }
  const rec = node as Record<string, unknown>;
  if (rec.type === "aggr_func") flags.aggr = true;
  if (rec.type === "window_func") flags.window = true;
  if (rec.type === "select") flags.subquery = true;
  for (const key of Object.keys(rec)) {
    if (key === "type" || key === "location" || key === "range") continue;
    const val = rec[key];
    if (val && typeof val === "object") scanFlags(val, flags);
  }
}

/* ------------------------------------------------------------------ */
/* Condition flattening                                                */
/* ------------------------------------------------------------------ */

function flattenConditions(node: unknown, acc: string[]): void {
  if (!node) return;
  const rec = node as Record<string, unknown>;
  if (rec.type === "binary_expr" && rec.operator === "AND") {
    flattenConditions(rec.left, acc);
    flattenConditions(rec.right, acc);
  } else {
    acc.push(exprToString(node));
  }
}

/* ------------------------------------------------------------------ */
/* SELECT statement walker                                             */
/* ------------------------------------------------------------------ */

interface WalkCtx {
  tables: Map<string, TableInfo>;
  joins: JoinInfo[];
  columns: ColumnInfo[];
  where: string[];
  groupBy: string[];
  having: string[];
  orderBy: OrderItem[];
  limit: string | null;
  offset: string | null;
  distinct: boolean;
  setOps: string[];
  ctes: CteInfo[];
  cteNames: Set<string>;
  flags: { aggr: boolean; subquery: boolean; window: boolean };
  depth: number;
}

function upsertTable(ctx: WalkCtx, info: TableInfo): void {
  const existing = ctx.tables.get(info.id);
  if (existing) {
    existing.joinType = existing.joinType ?? info.joinType;
    existing.onText = existing.onText ?? info.onText;
    existing.joinsTo = Array.from(new Set([...existing.joinsTo, ...info.joinsTo]));
    existing.columns = Array.from(new Set([...existing.columns, ...info.columns]));
    return;
  }
  ctx.tables.set(info.id, info);
}

function walkSelect(select: Record<string, unknown>, ctx: WalkCtx): void {
  // ---- CTEs -------------------------------------------------------
  const withs = select.with as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(withs) && ctx.depth === 0) {
    for (const w of withs) {
      const name = nameOf(w.name) ?? "cte";
      const stmt = w.stmt as Record<string, unknown> | undefined;
      const tablesUsed = new Set<string>();
      if (stmt) collectTablesDeep(stmt, tablesUsed);
      const declCols = Array.isArray(w.columns)
        ? (w.columns as Array<Record<string, unknown>>)
            .map((c) => nameOf(c?.column ?? c))
            .filter((c): c is string => !!c)
        : null;
      ctx.ctes.push({
        name,
        declaredColumns: declCols,
        tablesUsed: Array.from(tablesUsed).slice(0, 8),
        summary: summarizeSelect(stmt),
      });
      ctx.cteNames.add(name);
    }
  }

  // ---- FROM / JOIN ------------------------------------------------
  const from = (select.from as Array<Record<string, unknown>> | undefined) ?? [];
  const seenIds: string[] = [];

  from.forEach((f, index) => {
    if ((f.type as string | undefined) === "dual") return;

    let id: string;
    let name: string;
    let kind: TableInfo["kind"];

    if (f.expr && (f.expr as Record<string, unknown>).type === "select") {
      kind = "subquery";
      name = "(derived table)";
      id = String(f.as ?? `sub${ctx.tables.size}`);
      ctx.flags.subquery = true;
      scanFlags(f.expr, ctx.flags);
      walkSelect(f.expr as Record<string, unknown>, {
        ...ctx,
        depth: ctx.depth + 1,
      });
    } else {
      const db = nameOf(f.db);
      name = `${db ? `${db}.` : ""}${nameOf(f.table) ?? "?"}`;
      kind = ctx.cteNames.has(name) ? "cte" : "table";
      id = String(nameOf(f.as) ?? name);
    }

    const joinRaw = index === 0 ? null : nameOf(f.join) ?? null;
    const joinType = joinRaw ? joinRaw.replace(/_/g, " ").toUpperCase() : null;

    const onRefs = new Set<string>();
    let onText: string | null = null;
    if (f.on) {
      onText = exprToString(f.on);
      collectTableRefs(f.on, onRefs);
    } else if (Array.isArray(f.using)) {
      const cols = (f.using as Array<Record<string, unknown>>)
        .map((u) => nameOf(u?.column ?? u) ?? "")
        .filter(Boolean);
      onText = `USING (${cols.join(", ")})`;
    }

    upsertTable(ctx, {
      id,
      name,
      alias: nameOf(f.as),
      kind,
      joinType,
      onText,
      joinsTo: [],
      columns: [],
      depth: ctx.depth,
    });
    if (!seenIds.includes(id)) seenIds.push(id);

    if (joinType) {
      const resolved = new Set<string>();
      for (const ref of onRefs) {
        if (ctx.tables.has(ref) && ref !== id) resolved.add(ref);
      }
      if (resolved.size === 0 && seenIds.length > 1) {
        const prev = seenIds[seenIds.length - 2];
        if (prev !== id) resolved.add(prev);
      }
      const left = Array.from(resolved)[0] ?? seenIds[seenIds.length - 2];
      if (left && left !== id) {
        ctx.joins.push({
          left,
          right: id,
          type: joinType,
          on: onText ?? "(condition not available)",
        });
        const leftInfo = ctx.tables.get(left);
        if (leftInfo)
          leftInfo.joinsTo = Array.from(new Set([...leftInfo.joinsTo, id]));
        const rightInfo = ctx.tables.get(id);
        if (rightInfo)
          rightInfo.joinsTo = Array.from(new Set([...rightInfo.joinsTo, left]));
      }
    }
  });

  // ---- SELECT list ------------------------------------------------
  const rawColumns = select.columns;
  const colList = Array.isArray(rawColumns)
    ? (rawColumns as Array<Record<string, unknown>>)
    : rawColumns === "*"
      ? [{ expr: { type: "star" } }]
      : [];

  for (const c of colList) {
    const expr = (c.expr ?? c) as Record<string, unknown> | undefined;
    if (!expr || typeof expr !== "object") continue;
    scanFlags(expr, ctx.flags);
    const alias = nameOf(c.as);
    const isStar =
      expr.type === "star" ||
      (expr.type === "column_ref" && expr.column === "*");
    const text = exprToString(expr);

    let tableRef: string | null = null;
    if (expr.type === "column_ref") tableRef = nameOf(expr.table);
    else if (expr.type === "star") tableRef = nameOf(expr.table);
    else {
      const refs = new Set<string>();
      collectTableRefs(expr, refs);
      const known = Array.from(refs).find((r) => ctx.tables.has(r));
      if (known) tableRef = known;
    }
    // Unqualified column (e.g. `SELECT id`): if exactly one table is in
    // scope at this depth, the column can only belong to it.
    if (!tableRef && expr.type === "column_ref") {
      const scopeTables = Array.from(ctx.tables.values()).filter(
        (t) => t.depth === ctx.depth,
      );
      if (scopeTables.length === 1) tableRef = scopeTables[0].id;
    }

    const innerAggr = { aggr: false, subquery: false, window: false };
    if (expr.type !== "aggr_func") scanFlags(expr, innerAggr);

    ctx.columns.push({
      text: alias ? `${text} AS ${alias}` : text,
      alias,
      table: tableRef,
      aggregation:
        expr.type === "aggr_func"
          ? funcName(expr)
          : innerAggr.aggr
            ? "AGG"
            : null,
      isStar,
    });

    if (isStar && !tableRef) {
      for (const t of ctx.tables.values()) {
        if (t.depth === ctx.depth) t.columns.push("*");
      }
    } else if (tableRef) {
      const t = ctx.tables.get(tableRef);
      const label =
        alias ??
        (tableRef && text.startsWith(`${tableRef}.`)
          ? text.slice(tableRef.length + 1)
          : text);
      if (t && !t.columns.includes(label)) t.columns.push(label);
    }
  }

  // ---- WHERE ------------------------------------------------------
  if (select.where) {
    flattenConditions(select.where, ctx.where);
    scanFlags(select.where, ctx.flags);
  }

  // ---- GROUP BY / HAVING ------------------------------------------
  const gb = select.groupby;
  const gbList: unknown[] = Array.isArray(gb)
    ? gb
    : gb && typeof gb === "object" && Array.isArray((gb as Record<string, unknown>).columns)
      ? ((gb as Record<string, unknown>).columns as unknown[])
      : [];
  for (const g of gbList) ctx.groupBy.push(exprToString(g));

  if (select.having) {
    flattenConditions(select.having, ctx.having);
    scanFlags(select.having, ctx.flags);
  }

  // ---- ORDER BY ---------------------------------------------------
  if (Array.isArray(select.orderby)) {
    for (const o of select.orderby as Array<Record<string, unknown>>) {
      ctx.orderBy.push({
        text: exprToString(o.expr),
        direction: (nameOf(o.type) as OrderItem["direction"]) ?? null,
      });
    }
  }

  // ---- LIMIT / OFFSET --------------------------------------------
  const lim = select.limit;
  const limArr = Array.isArray(lim)
    ? (lim as Array<Record<string, unknown>>)
    : lim && typeof lim === "object"
      ? [lim as Record<string, unknown>]
      : [];
  for (const l of limArr) {
    const vals = Array.isArray(l.value)
      ? (l.value as Array<Record<string, unknown>>)
      : [];
    const nums = vals.map((v) => nameOf(v?.value) ?? exprToString(v));
    const sep = String(l.seperator ?? l.separator ?? "").toLowerCase();
    if (sep === "offset") {
      if (nums[0] && ctx.limit === null) ctx.limit = nums[0];
      if (nums[1]) ctx.offset = nums[1];
    } else if (sep === "," || sep === "comma") {
      // MySQL: LIMIT offset, count
      if (nums[0]) ctx.offset = nums[0];
      if (nums[1]) ctx.limit = nums[1];
    } else if (nums[0] && ctx.limit === null) {
      ctx.limit = nums[0];
      if (nums[1]) ctx.offset = nums[1];
    }
  }

  // ---- DISTINCT ---------------------------------------------------
  const dist = select.distinct;
  if (dist) {
    if (typeof dist === "string") ctx.distinct = true;
    else if (typeof dist === "object" && nameOf((dist as Record<string, unknown>).type))
      ctx.distinct = true;
  }

  // ---- SET OPERATIONS (UNION / INTERSECT / EXCEPT) ----------------
  let next = select._next as Record<string, unknown> | undefined;
  let guard = 0;
  while (next && guard < 8) {
    guard += 1;
    const op = String(next.union ?? next.setop ?? "UNION").toUpperCase();
    ctx.setOps.push(op);
    if (next.type === "select") {
      walkSelect(next, ctx);
      break;
    }
    next = next._next as Record<string, unknown> | undefined;
  }
}

function summarizeSelect(select: Record<string, unknown> | undefined): string {
  if (!select) return "(empty)";
  const parts: string[] = [];
  const cols = Array.isArray(select.columns) ? select.columns.length : 1;
  parts.push(`SELECT ${cols > 0 ? `${cols} column${cols > 1 ? "s" : ""}` : "*"}`);
  const from = (select.from as Array<Record<string, unknown>> | undefined) ?? [];
  const fromNames = from
    .map((f) => nameOf(f.table) ?? (f.expr ? "(subquery)" : "?"))
    .filter((n) => n !== "?");
  if (fromNames.length) {
    parts.push(
      `FROM ${fromNames[0]}${fromNames.length > 1 ? ` + ${fromNames.length - 1} more` : ""}`,
    );
  }
  if (select.where) parts.push("filtered");
  if (select.groupby) parts.push("grouped");
  return parts.join(" · ");
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */

export function buildQueryPlan(
  sql: string,
  dialect: Dialect,
): QueryPlan | { ok: false; error: string; hint?: string } {
  const trimmed = sql.trim();
  if (!trimmed) {
    return { ok: false, error: "Query is empty. Write or pick a SQL query first." };
  }

  const parser = new Parser();
  let ast: unknown;
  try {
    ast = parser.astify(trimmed, { database: dialect });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const hint =
      "Check for missing commas, keywords or unbalanced parentheses. Some functions are dialect-specific — try switching the dialect.";
    return { ok: false, error: message, hint };
  }

  if (Array.isArray(ast)) ast = ast[0];
  const root = ast as Record<string, unknown> | null;
  if (!root) {
    return { ok: false, error: "Could not parse the statement." };
  }

  const statementType = String(root.type ?? "unknown").toUpperCase();

  const ctx: WalkCtx = {
    tables: new Map(),
    joins: [],
    columns: [],
    where: [],
    groupBy: [],
    having: [],
    orderBy: [],
    limit: null,
    offset: null,
    distinct: false,
    setOps: [],
    ctes: [],
    cteNames: new Set(),
    flags: { aggr: false, subquery: false, window: false },
    depth: 0,
  };

  if (statementType === "SELECT") {
    walkSelect(root, ctx);
  } else {
    // Non-SELECT: extract whatever we can (target + referenced tables).
    const tablesAcc = new Set<string>();
    collectTablesDeep(root, tablesAcc);
    const targetArr = root.table as Array<Record<string, unknown>> | undefined;
    const targetName =
      (targetArr && targetArr.length > 0
        ? nameOf(targetArr[0].table) ?? nameOf(targetArr[0].expr)
        : null) ??
      Array.from(tablesAcc)[0] ??
      "(unknown)";
    const ensure = (id: string) => {
      if (!ctx.tables.has(id))
        ctx.tables.set(id, {
          id,
          name: id,
          alias: null,
          kind: "table",
          joinType: null,
          onText: null,
          joinsTo: [],
          columns: [],
          depth: 0,
        });
    };
    ensure(targetName);
    for (const t of tablesAcc) ensure(t);
  }

  const tables = Array.from(ctx.tables.values());
  const stats = computeStats(tables, ctx);

  return {
    ok: true,
    statementType,
    dialect,
    distinct: ctx.distinct,
    ctes: ctx.ctes,
    tables,
    joins: ctx.joins,
    columns: ctx.columns,
    where: ctx.where,
    groupBy: ctx.groupBy,
    having: ctx.having,
    orderBy: ctx.orderBy,
    limit: ctx.limit,
    offset: ctx.offset,
    setOps: ctx.setOps,
    hasSubquery: ctx.flags.subquery,
    stats,
  };
}

function computeStats(tables: TableInfo[], ctx: WalkCtx): PlanStats {
  const joinCount = ctx.joins.length;
  const filters = ctx.where.length + ctx.having.length;
  const aggregations = ctx.columns.filter((c) => c.aggregation).length;
  const ctes = ctx.ctes.length;

  const complexity =
    tables.length * 2 +
    joinCount * 2 +
    filters +
    aggregations +
    ctes * 4 +
    (ctx.flags.subquery ? 3 : 0) +
    (ctx.flags.window ? 2 : 0) +
    ctx.groupBy.length +
    ctx.orderBy.length +
    ctx.setOps.length * 3;

  const label: PlanStats["label"] =
    complexity <= 7 ? "Simple" : complexity <= 16 ? "Moderate" : "Complex";

  return {
    tables: tables.length,
    joins: joinCount,
    filters,
    aggregations,
    ctes,
    subqueries: ctx.flags.subquery ? 1 : 0,
    complexity,
    label,
  };
}
