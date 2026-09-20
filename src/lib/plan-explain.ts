// Plan-explain — turn raw EXPLAIN QUERY PLAN rows into structured steps with
// plain-English explanations. Client-safe: pure string parsing, no imports.
//
// SQLite detail lines this understands (seen in the wild on the storefront):
//   SCAN orders                          SCAN p
//   SEARCH orders USING INDEX idx (customer_id=?)
//   SEARCH orders USING COVERING INDEX idx (status=?)
//   SEARCH s USING INTEGER PRIMARY KEY (rowid=?)
//   USE TEMP B-TREE FOR ORDER BY / GROUP BY / RIGHT PART OF ORDER BY / DISTINCT
//   SCALAR SUBQUERY 2 / LIST SUBQUERY 1 / CORRELATED SCALAR SUBQUERY 3
//   MATERIALIZE xxx  ·  COMPOUND QUERY  ·  LEFT-JOIN

import type { PlanRow } from "@/lib/sql-types";

export type PlanOp = "scan" | "search" | "temp" | "subquery" | "materialize" | "join" | "compound" | "other";

export interface PlanStep {
  id: number;
  parent: number | null;
  raw: string;
  op: PlanOp;
  /** Table or alias the step reads (null for non-table steps). */
  table: string | null;
  indexName: string | null;
  /** COVERING — the index alone satisfies the query, no table visit. */
  covering: boolean;
  /** USING INTEGER PRIMARY KEY — direct rowid lookup. */
  pkLookup: boolean;
  /** Constraint list, e.g. "customer_id=?" (parens stripped). */
  constraints: string | null;
  /** What a TEMP B-TREE is used for, e.g. "ORDER BY". */
  tempFor: string | null;
  /** Subquery number, when the line names one. */
  subqueryNo: number | null;
  /** True when a SCAN reads the whole table with no index involved. */
  bareScan: boolean;
}

export function parsePlan(rows: PlanRow[]): PlanStep[] {
  return rows.map((r) => {
    const raw = r.detail.trim();
    const step: PlanStep = {
      id: r.id,
      parent: r.parent,
      raw,
      op: "other",
      table: null,
      indexName: null,
      covering: false,
      pkLookup: false,
      constraints: null,
      tempFor: null,
      subqueryNo: null,
      bareScan: false,
    };

    const cons = raw.match(/\(([^()]*)\)\s*$/);
    if (cons) step.constraints = cons[1].trim();

    let m: RegExpMatchArray | null;
    if ((m = raw.match(/^SCAN\s+([^\s]+)/i))) {
      step.op = "scan";
      step.table = m[1];
      if ((m = raw.match(/USING\s+COVERING\s+INDEX\s+([^\s(]+)/i))) {
        step.covering = true;
        step.indexName = m[1];
      } else if ((m = raw.match(/USING\s+INDEX\s+([^\s(]+)/i))) {
        step.indexName = m[1];
      } else {
        step.bareScan = true;
      }
    } else if ((m = raw.match(/^SEARCH\s+([^\s]+)/i))) {
      step.op = "search";
      step.table = m[1];
      if (/USING\s+INTEGER\s+PRIMARY\s+KEY|USING\s+PRIMARY\s+KEY|USING\s+ROWID\s+SEARCH/i.test(raw)) {
        step.pkLookup = true;
      }
      if ((m = raw.match(/USING\s+COVERING\s+INDEX\s+([^\s(]+)/i))) {
        step.covering = true;
        step.indexName = m[1];
      } else if ((m = raw.match(/USING\s+INDEX\s+([^\s(]+)/i))) {
        step.indexName = m[1];
      }
    } else if ((m = raw.match(/^USE\s+TEMP\s+B-TREE\s+FOR\s+(.+)$/i))) {
      step.op = "temp";
      step.tempFor = m[1].trim();
    } else if (/SUBQUERY/i.test(raw)) {
      step.op = "subquery";
      step.subqueryNo = Number(raw.match(/SUBQUERY\s+(\d+)/i)?.[1] ?? 0) || null;
    } else if (/^MATERIALIZE/i.test(raw)) {
      step.op = "materialize";
    } else if (/^(LEFT|RIGHT|CROSS)[- ]JOIN/i.test(raw)) {
      step.op = "join";
    } else if (/^COMPOUND/i.test(raw)) {
      step.op = "compound";
    }
    return step;
  });
}

/** Tables whose full-sweep hurts first (row counts on the storefront). */
const BIG_TABLES = new Set(["orders", "order_items", "ledger_entries", "invoices", "payments", "expenses"]);

export function isBigTable(name: string | null): boolean {
  return name !== null && BIG_TABLES.has(name);
}

/** One-line plain-English account of what a plan step does. */
export function stepStory(step: PlanStep): string {
  const t = step.table ?? "the input";
  switch (step.op) {
    case "scan":
      if (step.covering && step.indexName) {
        return `Sweeps the ${step.indexName} B-tree instead of the table — every column this branch needs already lives in the index.`;
      }
      if (step.indexName) {
        return `Walks the ${step.indexName} index end-to-end — cheaper than the table when the index is smaller.`;
      }
      if (isBigTable(t)) {
        return `Reads every single row of ${t}, top to bottom — a full table sweep with no index to help. Instant here, a career problem at scale.`;
      }
      return `Reads every row of ${t}. Small table, so SQLite shrugs — but it has no way to jump.`;
    case "search":
      if (step.pkLookup) {
        return `Jumps straight to one row of ${t} by the integer primary key — the fastest lookup SQLite can do.`;
      }
      if (step.covering && step.indexName) {
        return `Descends ${step.indexName} to ${step.constraints ?? "the match"} — and never touches the table, because all the columns live in the index.`;
      }
      if (step.indexName) {
        return `Descends ${step.indexName} to ${step.constraints ?? "the match"}, then hops to the table row for the remaining columns.`;
      }
      return "Targeted descent — the engine goes straight for the rows it needs.";
    case "temp":
      return `Spins up a temporary B-tree to ${step.tempFor?.toLowerCase() ?? "stage rows"} — scratch-memory work that an index could make unnecessary.`;
    case "subquery":
      return step.subqueryNo
        ? /CORRELATED/i.test(step.raw)
          ? `Runs subquery ${step.subqueryNo} once per outer row — correlated subqueries can multiply work fast.`
          : `Runs subquery ${step.subqueryNo} once, then feeds the result to the rest of the plan.`
        : "Runs a subquery as part of this branch.";
    case "materialize":
      return "Builds an internal temporary table first, then reads from that instead of re-running the source.";
    case "join":
      return "This join pass runs without an index on the outer side — worth a look if the branch touches a big table.";
    case "compound":
      return "Combines two queries (UNION / INTERSECT / EXCEPT) — each side is planned separately.";
    default:
      return "Engine bookkeeping for this branch.";
  }
}

export interface PlanReport {
  steps: number;
  scans: number;
  searches: number;
  sorts: number;
  covering: number;
  pkLookups: number;
}

export function reportPlan(steps: PlanStep[]): PlanReport {
  return {
    steps: steps.length,
    scans: steps.filter((s) => s.op === "scan").length,
    searches: steps.filter((s) => s.op === "search").length,
    sorts: steps.filter((s) => s.op === "temp" && /ORDER\s+BY/i.test(s.tempFor ?? "")).length,
    covering: steps.filter((s) => s.covering).length,
    pkLookups: steps.filter((s) => s.pkLookup).length,
  };
}

/** Detail strings of a plan, joined — the grader's haystack. */
export function planText(rows: PlanRow[]): string {
  return rows.map((r) => r.detail).join("\n");
}

/** Table/alias names that get a bare (indexless) SCAN. */
export function bareScannedTables(steps: PlanStep[]): string[] {
  return steps.filter((s) => s.bareScan && s.table).map((s) => s.table as string);
}

/** Compare two plans by detail text — what disappeared, what appeared. */
export function diffPlans(before: PlanRow[], after: PlanRow[]): { removed: string[]; added: string[] } {
  const b = new Set(before.map((r) => r.detail));
  const a = new Set(after.map((r) => r.detail));
  return {
    removed: [...b].filter((d) => !a.has(d)),
    added: [...a].filter((d) => !b.has(d)),
  };
}
