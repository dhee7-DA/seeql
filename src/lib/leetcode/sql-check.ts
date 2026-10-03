// Client-side grading for LeetCode SQL 50 problems.
// The user's query runs in /api/lc-sql against the problem's seeded schema
// (a rolled-back transaction), and the resulting rows are compared with the
// engine-verified snapshot in sql-expected.ts. Any query that produces the
// same answer passes — not just the model syntax.

import type { ExecResult } from "@/lib/sql-types";
import type { LcSqlExpected } from "@/lib/leetcode/types";

export interface SqlCheckOutcome {
  status: "pass" | "fail" | "error";
  title: string;
  detail: string;
}

/** Floats wobble in the last bits — round to 4dp before comparing. */
function normalizeCell(v: ExecResult["rows"][number][number]): string {
  if (v === null) return "\u0000null";
  if (typeof v === "number") {
    return Number.isInteger(v) ? String(v) : String(Math.round(v * 10000) / 10000);
  }
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

function compareRows(a: string[][], b: string[][], orderMatters: boolean): boolean {
  if (a.length !== b.length) return false;
  if (orderMatters) {
    return a.every((row, i) => row.length === b[i].length && row.every((c, j) => c === b[i][j]));
  }
  const key = (row: string[]) => JSON.stringify(row);
  const sa = [...a].map(key).sort();
  const sb = [...b].map(key).sort();
  return sa.every((k, i) => k === sb[i]);
}

/**
 * Grade a user's result set against the problem's expected snapshot.
 * `user` is the ExecResult from /api/lc-sql (rows already cell-normalized).
 */
export function gradeSqlResult(user: ExecResult, expected: LcSqlExpected): SqlCheckOutcome {
  const a = user.rows.map((r) => r.map(normalizeCell));
  const b = expected.rows.map((r) => r.map(normalizeCell));

  if (compareRows(a, b, expected.order === "exact")) {
    return {
      status: "pass",
      title: "Correct — your result matches the expected answer",
      detail: `${user.rowCount} row${user.rowCount === 1 ? "" : "s"} · ${user.durationMs} ms · solved right here in the sandbox.`,
    };
  }

  if (a.length !== b.length) {
    return {
      status: "fail",
      title: "Not quite — row count differs",
      detail: `Your query returned ${a.length} row${a.length === 1 ? "" : "s"}, the expected answer has ${b.length}. Re-check the joins (LEFT vs INNER) and the grouping.`,
    };
  }
  if (expected.order === "exact") {
    const firstBad = a.findIndex((row, i) => JSON.stringify(row) !== JSON.stringify(b[i]));
    return {
      status: "fail",
      title: "Not quite — rows differ",
      detail: `Row ${firstBad + 1} differs (or is out of order). This task checks row order — revisit your ORDER BY.`,
    };
  }
  return {
    status: "fail",
    title: "Not quite — values differ",
    detail: "The right rows are here but some values differ. Compare your columns with the task (NULL handling? which column? rounding?).",
  };
}
