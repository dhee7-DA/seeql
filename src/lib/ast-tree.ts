// AST → generic TreeNode converter for the "Parse Tree" view.
// Server-side: consumes the raw node-sql-parser AST and produces a compact,
// collapsible tree. Unknown node types fall through to a defensive generic
// walker, so any dialect/statement still renders something meaningful.

import { Parser } from "node-sql-parser";
import type { TreeNode } from "./sql-types";

const MAX_NODES = 800;
const MAX_DEPTH = 24;

const SKIP_KEYS = new Set([
  "type",
  "loc",
  "_parentheses",
  "_next",
  "_dataType",
  "collate",
  "prefix",
  "suffix",
  "parentheses",
  "tableList",
  "columnList",
  "options",
]);

class Builder {
  private count = 0;
  private counter = 0;

  budget(): boolean {
    return this.count < MAX_NODES;
  }

  make(label: string, type: string, detail?: string, children: TreeNode[] = []): TreeNode {
    this.count++;
    return { id: `n${this.counter++}`, label, type, detail, children };
  }
}

/* ---------------- scalar helpers ---------------- */

function recValue(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "string") return `'${v.replace(/'/g, "''")}'`;
  if (typeof v === "object") {
    const rec = v as Record<string, unknown>;
    if ("value" in rec) return recValue(rec.value);
    if ("expr" in rec) return recExpr(rec.expr);
    if ("type" in rec) return String(rec.type);
    return "…";
  }
  return String(v);
}

function namePath(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map(namePath).join(".");
  const rec = v as Record<string, unknown>;
  if ("value" in rec && (typeof rec.value === "string" || typeof rec.value === "number"))
    return String(rec.value);
  if ("name" in rec) return namePath(rec.name);
  if ("expr" in rec) return namePath(rec.expr);
  return "";
}

function columnLabel(node: Record<string, unknown>): string {
  const table = node.table === null || node.table === undefined ? null : namePath(node.table);
  const colRaw = node.column;
  let col = "";
  if (colRaw === "*") col = "*";
  else if (colRaw !== null && typeof colRaw === "object")
    col = namePath((colRaw as Record<string, unknown>).expr ?? colRaw);
  else if (typeof colRaw === "string") col = colRaw;
  return table ? `${table}.${col}` : col || "?";
}

function isSubqueryWrapper(n: Record<string, unknown>): boolean {
  return !("type" in n) && "ast" in n && typeof n.ast === "object" && n.ast !== null;
}

/* ---------------- expression → compact label ---------------- */

export function recExpr(node: unknown): string {
  if (node === null || node === undefined) return "?";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(recExpr).join(", ");
  const n = node as Record<string, unknown>;
  if (isSubqueryWrapper(n)) return "(subquery)";
  if ("type" in n && n.type === "select") return "(subquery)";
  switch (n.type) {
    case "number":
    case "single_quote_string":
    case "double_quote_string":
    case "string":
      return recValue(n.value);
    case "bool":
      return n.value === true || n.value === "true" ? "TRUE" : "FALSE";
    case "null":
      return "NULL";
    case "column_ref":
      return columnLabel(n);
    case "star":
      return typeof n.value === "string" && n.value !== "*" ? `${namePath(n.value)}.*` : "*";
    case "binary_expr": {
      const op = String(n.operator ?? "?");
      return `${recExpr(n.left)} ${op} ${recExpr(n.right)}`;
    }
    case "unary_expr":
      return `${String(n.operator ?? "")}${recExpr(n.expr)}`;
    case "aggr_func": {
      const name = namePath(n.name) || "AGG";
      const args = (n.args ?? {}) as Record<string, unknown>;
      const inner = args.expr ? recExpr(args.expr) : "*";
      const distinct = args.distinct === true ? "DISTINCT " : "";
      return `${name}(${distinct}${inner})`;
    }
    case "function": {
      const name = namePath(n.name) || "FUNC";
      const args = (n.args ?? {}) as Record<string, unknown>;
      const list = Array.isArray(args.value) ? (args.value as unknown[]).map(recExpr) : [];
      return `${name}(${list.join(", ")})`;
    }
    case "window_func": {
      const name = namePath(n.name) || "WINDOW";
      return `${name}() OVER (…)`;
    }
    case "case": {
      const whens = Array.isArray(n.whens) ? n.whens.length : 0;
      return `CASE (${whens} branch${whens === 1 ? "" : "es"})`;
    }
    case "cast":
      return `CAST(${recExpr(n.expr)} AS ${namePath(n.target ?? n.data_type ?? "?")})`;
    case "expr_list":
      return `(${Array.isArray(n.value) ? (n.value as unknown[]).map(recExpr).join(", ") : "…"})`;
    default: {
      if ("value" in n && !("type" in n)) return recValue(n.value);
      return namePath(n.name) || String(n.type ?? "expr");
    }
  }
}

/* ---------------- generic AST node → TreeNode ---------------- */

function convert(node: unknown, b: Builder, depth: number): TreeNode | null {
  if (!b.budget() || depth > MAX_DEPTH) return b.make("… (truncated)", "truncated");

  if (node === null || node === undefined) return null;
  if (typeof node === "string" || typeof node === "number")
    return b.make(recValue(node), "literal");

  if (Array.isArray(node)) {
    const children = node
      .map((item) => convert(item, b, depth + 1))
      .filter((x): x is TreeNode => x !== null);
    return b.make(`list (${node.length})`, "list", undefined, children);
  }

  if (typeof node !== "object") return b.make(String(node), "literal");
  const n = node as Record<string, unknown>;

  // {tableList, columnList, ast} subquery wrappers → unwrap to the inner SELECT
  if (isSubqueryWrapper(n)) return convert(n.ast, b, depth + 1);

  // {expr, as} column items — the sqlite dialect omits the type:'expr' wrapper
  if (!("type" in n) && "expr" in n && "as" in n) {
    const child = convert(n.expr, b, depth + 1);
    if (!child) return null;
    const alias = n.as ? namePath(n.as) : null;
    if (alias) child.detail = `alias: ${alias}`;
    return child;
  }

  const type = typeof n.type === "string" ? n.type : "node";

  switch (type) {
    case "select":
      return convertSelect(n, b, depth);
    case "expr": {
      // {type:'expr', expr, as} column-list items → readable label + alias detail
      const alias = n.as ? namePath(n.as) : null;
      const child = convert(n.expr, b, depth + 1);
      if (!child) return b.make("?", "expr");
      if (alias) child.detail = `alias: ${alias}`;
      return child;
    }
    case "column_ref":
      return b.make(columnLabel(n), "column_ref");
    case "binary_expr": {
      const op = String(n.operator ?? "?");
      const children = [n.left, n.right]
        .map((c) => convert(c, b, depth + 1))
        .filter((x): x is TreeNode => x !== null);
      return b.make(op, "binary_expr", undefined, children);
    }
    case "unary_expr": {
      const child = convert(n.expr, b, depth + 1);
      return b.make(String(n.operator ?? ""), "unary_expr", undefined, child ? [child] : []);
    }
    case "aggr_func":
    case "function": {
      const label = recExpr(n);
      const children: TreeNode[] = [];
      const args = (n.args ?? {}) as Record<string, unknown>;
      if (Array.isArray(args.value)) {
        for (const a of args.value as unknown[]) {
          const c = convert(a, b, depth + 1);
          if (c) children.push(c);
        }
      } else if (args.expr) {
        const c = convert(args.expr, b, depth + 1);
        if (c) children.push(c);
      }
      if (n.over) {
        const c = convert(n.over, b, depth + 1);
        if (c) children.push(c);
      }
      return b.make(label, type, undefined, children);
    }
    case "window_func": {
      const children: TreeNode[] = [];
      const over = (n.over ?? {}) as Record<string, unknown>;
      const spec = (over.as_window_specification ?? over) as Record<string, unknown>;
      const ws = (spec.window_specification ?? spec) as Record<string, unknown>;
      if (Array.isArray(ws.partitionby) && ws.partitionby.length > 0) {
        const items = (ws.partitionby as unknown[])
          .map((p) => recExpr((p as Record<string, unknown>).expr ?? p))
          .join(", ");
        children.push(b.make(`PARTITION BY ${items}`, "clause"));
      }
      if (Array.isArray(ws.orderby) && ws.orderby.length > 0) {
        const items = (ws.orderby as unknown[]).map(orderLabel).join(", ");
        children.push(b.make(`ORDER BY ${items}`, "clause"));
      }
      return b.make(recExpr(n), "window_func", undefined, children);
    }
    case "case": {
      const children: TreeNode[] = [];
      if (n.operand) children.push(b.make(`operand: ${recExpr(n.operand)}`, "literal"));
      for (const w of (Array.isArray(n.whens) ? n.whens : []) as Array<Record<string, unknown>>) {
        children.push(b.make(`WHEN ${recExpr(w.cond)} THEN ${recExpr(w.result)}`, "when"));
      }
      if (n.else) children.push(b.make(`ELSE ${recExpr(n.else)}`, "when"));
      return b.make("CASE", "case", undefined, children);
    }
    case "cast":
      return b.make(recExpr(n), "cast");
    case "expr_list": {
      const children = (Array.isArray(n.value) ? (n.value as unknown[]) : [])
        .map((v) => convert(v, b, depth + 1))
        .filter((x): x is TreeNode => x !== null);
      return b.make("value list", "expr_list", undefined, children);
    }
    case "table": {
      const name = namePath(n.name) || "?";
      const alias = n.as ? ` AS ${namePath(n.as)}` : "";
      return b.make(`${name}${alias}`, "table");
    }
    case "union":
    case "intersect":
    case "except": {
      const children: TreeNode[] = [];
      for (const key of ["left", "right", "_left", "_right"]) {
        if (n[key]) {
          const c = convert(n[key], b, depth + 1);
          if (c) children.push(c);
        }
      }
      return b.make(type.toUpperCase(), "setop", undefined, children);
    }
    default:
      return convertGeneric(n, b, depth, type);
  }
}

function convertGeneric(
  n: Record<string, unknown>,
  b: Builder,
  depth: number,
  type: string,
): TreeNode {
  if (!b.budget() || depth > MAX_DEPTH) return b.make("… (truncated)", "truncated");

  // untyped {db, table, as} / {column} objects (update/insert targets etc.)
  if (type === "node" && typeof n.table === "string") {
    const alias = n.as ? ` AS ${namePath(n.as)}` : "";
    return b.make(`${String(n.table)}${alias}`, "table");
  }

  const children: TreeNode[] = [];
  const details: string[] = [];

  for (const [key, value] of Object.entries(n)) {
    if (SKIP_KEYS.has(key)) continue;
    if (value === null || value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === "object") {
      const child = convert(value, b, depth + 1);
      if (child) children.push(b.make(key, "group", undefined, [child]));
    } else {
      details.push(`${key}: ${String(value)}`);
    }
  }
  const label = type === "node" ? "node" : type;
  return b.make(label, type, details.length ? details.join(" · ") : undefined, children);
}

function orderLabel(item: unknown): string {
  const o = item as Record<string, unknown>;
  return `${recExpr(o.expr)}${typeof o.type === "string" ? ` ${o.type}` : ""}`;
}

function clauseNode(
  title: string,
  value: unknown,
  b: Builder,
  depth: number,
): TreeNode | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value) && value.length === 0) return null;
  const child = convert(value, b, depth + 1);
  if (!child) return null;
  const inner = child.type === "list" ? child.children : [child];
  if (inner.length === 0) return null;
  return b.make(title, "clause", undefined, inner);
}

/** Convert one FROM-list entry: base table, joined table or derived table. */
function convertFromEntry(entry: unknown, b: Builder, depth: number): TreeNode | null {
  if (!b.budget() || depth > MAX_DEPTH) return b.make("… (truncated)", "truncated");
  if (entry === null || entry === undefined) return null;
  if (typeof entry !== "object") return convert(entry, b, depth + 1);
  const e = entry as Record<string, unknown>;

  // Derived table: { expr: { tableList, columnList, ast }, as }
  const wrapped = (e.expr ?? e.table) as Record<string, unknown> | undefined;
  if (wrapped && typeof wrapped === "object" && "ast" in wrapped) {
    const inner = convert(wrapped.ast, b, depth + 1);
    const alias = e.as ? ` AS ${namePath(e.as)}` : "";
    const label = `${e.join ? `${String(e.join)} ` : ""}(derived)${alias}`;
    return b.make(label, "table", undefined, inner ? [inner] : []);
  }

  const tableName =
    typeof e.table === "string"
      ? e.table
      : typeof e.table === "object" && e.table !== null
        ? namePath(e.table)
        : namePath(e.expr);
  const alias = e.as ? ` AS ${namePath(e.as)}` : "";
  const dbPrefix = e.db && typeof e.db === "string" ? `${e.db}.` : "";
  const label = `${e.join ? `${String(e.join)} ` : ""}${dbPrefix}${tableName || "?"}${alias}`;

  const children: TreeNode[] = [];
  if (e.on) {
    const on = convert(e.on, b, depth + 1);
    if (on) children.push(b.make(`ON ${recExpr(e.on)}`, "clause", undefined, on.children));
  }
  if (e.using && Array.isArray(e.using)) {
    children.push(
      b.make(`USING (${(e.using as unknown[]).map(namePath).join(", ")})`, "clause"),
    );
  }
  return b.make(label, "table", undefined, children);
}

function convertSelect(n: Record<string, unknown>, b: Builder, depth: number): TreeNode {
  if (!b.budget() || depth > MAX_DEPTH) return b.make("… (truncated)", "truncated");
  const children: TreeNode[] = [];

  if (n.with) {
    const list = Array.isArray(n.with) ? n.with : [n.with];
    const cteNodes: TreeNode[] = [];
    for (const w of list as Array<Record<string, unknown>>) {
      const name = namePath(w.name) || "cte";
      const stmt = convert(w.stmt, b, depth + 1);
      cteNodes.push(b.make(name, "cte", undefined, stmt ? [stmt] : []));
    }
    if (cteNodes.length) children.push(b.make("WITH", "clause", undefined, cteNodes));
  }

  // SELECT list — label each item as readable SQL with alias detail
  const rawColumns = Array.isArray(n.columns) ? n.columns : null;
  if (rawColumns && rawColumns.length > 0) {
    const items: TreeNode[] = [];
    for (const c of rawColumns) {
      const converted = convert(c, b, depth + 1);
      if (converted) items.push(converted);
    }
    if (items.length) {
      const distinctObj = n.distinct as Record<string, unknown> | null | undefined;
      const isDistinct = Boolean(distinctObj) && typeof distinctObj?.type === "string";
      children.push(
        b.make(isDistinct ? "SELECT DISTINCT" : "SELECT list", "clause", undefined, items),
      );
    }
  }

  if (Array.isArray(n.from) && n.from.length > 0) {
    const fromChildren = n.from
      .map((f) => convertFromEntry(f, b, depth + 1))
      .filter((x): x is TreeNode => x !== null);
    if (fromChildren.length) children.push(b.make("FROM", "clause", undefined, fromChildren));
  }

  const whereNode = clauseNode("WHERE", n.where, b, depth);
  if (whereNode) children.push(whereNode);

  const groupby = n.groupby as Record<string, unknown> | undefined;
  const groupNode = clauseNode("GROUP BY", groupby?.columns ?? groupby, b, depth);
  if (groupNode) children.push(groupNode);

  const havingNode = clauseNode("HAVING", n.having, b, depth);
  if (havingNode) children.push(havingNode);

  if (Array.isArray(n.orderby) && n.orderby.length > 0) {
    const items = (n.orderby as Array<Record<string, unknown>>)
      .map((o) => {
        const child = convert(o.expr, b, depth + 2);
        return b.make(
          orderLabel(o),
          "expr",
          undefined,
          child ? [child] : [],
        );
      })
      .filter((x): x is TreeNode => x !== null);
    if (items.length) children.push(b.make("ORDER BY", "clause", undefined, items));
  }

  const limit = n.limit as Record<string, unknown> | undefined;
  if (limit && Array.isArray(limit.value) && limit.value.length > 0) {
    const vals = limit.value as unknown[];
    const text = vals.map(recExpr).join(" OFFSET ");
    children.push(b.make(`LIMIT / OFFSET ${text}`, "clause"));
  }

  return b.make("SELECT", "statement", undefined, children);
}

/** Build the collapsible AST tree for a SQL string. Null when unparseable. */
export function buildAstTree(sql: string, dialect: string): TreeNode | null {
  try {
    const parser = new Parser();
    const ast = parser.astify(sql, { database: dialect });
    const b = new Builder();
    const list = Array.isArray(ast) ? ast : [ast];
    const roots = list
      .map((item) => convert(item, b, 0))
      .filter((x): x is TreeNode => x !== null);
    if (roots.length === 0) return null;
    if (roots.length === 1) return roots[0];
    return b.make("statements", "root", undefined, roots);
  } catch {
    return null;
  }
}
