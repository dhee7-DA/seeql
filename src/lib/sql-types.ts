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
}

export interface ParseError {
  ok: false;
  error: string;
  hint?: string;
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
