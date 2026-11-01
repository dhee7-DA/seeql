// Shared types for the SQL visualizer — used by the API route and UI components.

/** Dialects offered in the UI (client-safe; no parser import) */
export const DIALECTS = ["postgresql", "mysql", "sqlite", "transactsql", "bigquery"] as const;
export type DialectName = (typeof DIALECTS)[number];

export interface TableInfo {
  /** Unique id within the plan: alias if present, otherwise the table name */
  id: string;
  /** Real table name (or label like "(derived)") */
  name: string;
  alias: string | null;
  /** table = base FROM table, subquery = derived table, cte = CTE reference */
  kind: "table" | "subquery" | "cte";
  /** Join keyword for non-main tables, e.g. "INNER JOIN", "LEFT JOIN" */
  joinType: string | null;
  /** ON condition as readable SQL */
  onText: string | null;
  /** Tables referenced in the ON condition (ids) */
  joinsTo: string[];
  /** SELECT list columns that reference this table */
  columns: string[];
  /** Depth for derived tables (0 = top level) */
  depth: number;
}

export interface JoinInfo {
  left: string;
  right: string;
  type: string;
  on: string;
}

export interface ColumnInfo {
  /** Readable SQL text of the expression */
  text: string;
  alias: string | null;
  table: string | null;
  /** Aggregation function name if the expression aggregates, e.g. "SUM" */
  aggregation: string | null;
  isStar: boolean;
}

export interface CteInfo {
  name: string;
  /** Column list declared in the WITH clause, if any */
  declaredColumns: string[] | null;
  /** Tables referenced inside the CTE body */
  tablesUsed: string[];
  /** Human-readable summary of the CTE body */
  summary: string;
}

export interface OrderItem {
  text: string;
  direction: "ASC" | "DESC" | null;
}

export interface PlanStats {
  tables: number;
  joins: number;
  filters: number;
  aggregations: number;
  ctes: number;
  subqueries: number;
  complexity: number;
  label: "Simple" | "Moderate" | "Complex";
}

export interface QueryPlan {
  ok: true;
  statementType: string;
  dialect: string;
  distinct: boolean;
  ctes: CteInfo[];
  tables: TableInfo[];
  joins: JoinInfo[];
  columns: ColumnInfo[];
  where: string[];
  groupBy: string[];
  having: string[];
  orderBy: OrderItem[];
  limit: string | null;
  offset: string | null;
  setOps: string[];
  hasSubquery: boolean;
  stats: PlanStats;
  /** Collapsible AST tree (null when it could not be derived) */
  tree?: TreeNode | null;
}

export interface ParseError {
  ok: false;
  error: string;
  hint?: string;
  /** Character offsets into the SQL text where parsing failed (best effort) */
  location?: { start: number; end: number };
}

export type ParseResult = QueryPlan | ParseError;

/** One step of the logical execution pipeline */
export interface PipelineStep {
  key: string;
  title: string;
  keyword: string;
  description: string;
  accent: string; // tailwind color name for accents
  present: boolean;
  chips: string[];
  count: number;
}

/* ---------------- execution (Run) types ---------------- */

export type CellValue = string | number | boolean | null;

/** One EXPLAIN QUERY PLAN row */
export interface PlanRow {
  id: number;
  parent: number | null;
  detail: string;
}

export interface ExecResult {
  ok: true;
  statementType: string;
  columns: string[];
  rows: CellValue[][];
  rowCount: number;
  durationMs: number;
  /** Rows affected for write statements */
  changes: number | null;
  /** Payload was capped at MAX_ROWS */
  truncated: boolean;
  /** EXPLAIN QUERY PLAN output for read statements (null when unavailable) */
  plan: PlanRow[] | null;
}

export interface ExecError {
  ok: false;
  error: string;
  hint?: string;
}

export type ExecResponse = ExecResult | ExecError;

/* ---------------- query funnel (stage-by-stage row counts) ---------------- */

/** One cumulative COUNT(*) probe — a stage of the SELECT pipeline. */
export interface FunnelStage {
  key: "from" | "where" | "group" | "having" | "distinct" | "order" | "result";
  label: string;
  detail: string;
  /** Rows (or groups) after this stage — null when the probe failed. */
  count: number | null;
  kind: "rows" | "groups" | "final";
  /** Percent change vs the previous stage, e.g. "±0%", "-62%". */
  delta?: string;
}

/** One WHERE condition probed alone and cumulatively. */
export interface FilterProbe {
  text: string;
  /** Rows passing this condition alone. */
  individual: number | null;
  /** Rows passing this condition and every earlier one. */
  cumulative: number | null;
}

/** One JOIN probed: row counts before/after it joined in. */
export interface JoinProbe {
  left: string;
  right: string;
  type: string;
  on: string;
  before: number | null;
  after: number | null;
  /** after / before, rounded to 2 dp — the fan-out multiplier. */
  multiplier: number | null;
  /** Left rows with no matching right row (LEFT JOIN preservation audit). */
  unmatchedLeft: number | null;
}

/** A successful funnel run. `applicable: false` means the query shape is
 *  supported for the final count only — `reason` says why the stages are
 *  empty (set operations, derived tables, non-SELECT). */
export interface FunnelResult {
  ok: true;
  applicable: boolean;
  reason?: string;
  baseRows: number | null;
  finalRows: number | null;
  stages: FunnelStage[];
  filters: FilterProbe[];
  joins: JoinProbe[];
}

export type FunnelResponse = FunnelResult | { ok: false; error: string };

/* ---------------- parse tree (AST) types ---------------- */

export interface TreeNode {
  id: string;
  /** Short human label, e.g. "INNER JOIN" or "SUM(...)" */
  label: string;
  /** Raw AST node type, e.g. binary_expr / aggr_func / table */
  type: string;
  /** Optional extra info shown as a subtitle */
  detail?: string;
  children: TreeNode[];
}

/* ---------------- schema (sample DB metadata) ---------------- */

export interface SchemaColumn {
  name: string;
  type: string;
  pk?: boolean;
  fk?: { table: string; column: string };
}

export interface SchemaTable {
  name: string;
  description: string;
  columns: SchemaColumn[];
}

export interface SchemaRelationship {
  from: { table: string; column: string };
  to: { table: string; column: string };
  label: string;
}
