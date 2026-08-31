// Client-side auto-grading for curriculum query problems.
// Strategy: run the learner's query AND the model solution against the same
// live SQLite database, then compare the result sets. This stays correct even
// if the sample data is ever regenerated, and accepts any query that produces
// the same answer — not just the model syntax.

import type { ExecResponse, ExecResult } from "@/lib/sql-types";

export interface CheckResult {
  status: "pass" | "fail" | "error";
  title: string;
  detail?: string;
  /** Result of the learner's own query, for display */
  userResult: ExecResponse | null;
}

const READ_RE = /^\s*(select|with|explain|pragma|values)\b/i;

export function looksLikeRead(sql: string): boolean {
  return READ_RE.test(sql);
}

export async function runSql(sql: string): Promise<ExecResponse> {
  const res = await fetch("/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });
  return (await res.json()) as ExecResponse;
}

/** SQLite REAL arithmetic can wobble — round floats before comparing. */
function normalizeCell(v: ExecResult["rows"][number][number]): string {
  if (v === null) return "\u0000null";
  if (typeof v === "number") {
    if (Number.isInteger(v)) return String(v);
    return String(Math.round(v * 10000) / 10000);
  }
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

function normalizeRows(res: ExecResult): string[][] {
  return res.rows.map((r) => r.map(normalizeCell));
}

function compare(
  a: string[][],
  b: string[][],
  orderMatters: boolean,
): boolean {
  if (a.length !== b.length) return false;
  if (orderMatters) {
    return a.every((row, i) =>
      row.length === b[i].length && row.every((c, j) => c === b[i][j]),
    );
  }
  const key = (row: string[]) => JSON.stringify(row);
  const sa = [...a].map(key).sort();
  const sb = [...b].map(key).sort();
  return sa.every((k, i) => k === sb[i]);
}

/**
 * Grade a learner query against the model solution.
 * Both queries run back-to-back on the same sandbox database.
 */
export async function checkProblem(
  userSql: string,
  solutionSql: string,
  orderMatters: boolean,
): Promise<CheckResult> {
  const trimmed = userSql.trim();
  if (!trimmed) {
    return {
      status: "error",
      title: "Write a query first",
      detail: "Type your SQL in the editor, then press Run & check.",
      userResult: null,
    };
  }
  if (!looksLikeRead(trimmed)) {
    return {
      status: "error",
      title: "Read-only practice zone",
      detail: "Practice problems accept SELECT queries only (start with SELECT or WITH). The data is shared with the playground, so writes are blocked here.",
      userResult: null,
    };
  }

  const [user, solution] = await Promise.all([runSql(trimmed), runSql(solutionSql)]);

  if (!user.ok) {
    const detail =
      "hint" in user && user.hint ? `${user.error}\n\nHint: ${user.hint}` : user.error;
    return {
      status: "error",
      title: "Your query did not run",
      detail,
      userResult: user,
    };
  }
  if (!solution.ok) {
    return {
      status: "error",
      title: "Grading failed on our side",
      detail: solution.error,
      userResult: user,
    };
  }

  const userCols = user.columns.length;
  const solCols = solution.columns.length;
  if (userCols !== solCols) {
    return {
      status: "fail",
      title: "Not quite — column count differs",
      detail: `Your query returns ${userCols} column${userCols === 1 ? "" : "s"}, the task expects ${solCols}. Check the SELECT list (watch out for SELECT *).`,
      userResult: user,
    };
  }

  const a = normalizeRows(user as ExecResult);
  const b = normalizeRows(solution as ExecResult);

  if (compare(a, b, orderMatters)) {
    return {
      status: "pass",
      title: "Correct — your result matches the expected answer",
      detail: `${user.rowCount} row${user.rowCount === 1 ? "" : "s"} · ${user.durationMs} ms · nice ${/\bgroup\s+by\b/i.test(trimmed) ? "aggregation" : "query"}.`,
      userResult: user,
    };
  }

  let detail: string;
  if (a.length !== b.length) {
    detail = `Your query returned ${a.length} row${a.length === 1 ? "" : "s"}, the expected answer has ${b.length}. Re-read the task — filters (WHERE), duplicates (DISTINCT) or grouping may differ.`;
  } else if (orderMatters) {
    const firstBad = a.findIndex((row, i) => JSON.stringify(row) !== JSON.stringify(b[i]));
    detail = `Row ${firstBad + 1} is out of order (or differs). This task checks row order — revisit your ORDER BY, including the tiebreaker.`;
  } else {
    detail = "The right rows are here but some values differ. Compare your columns with the task description (rounding? which column? which filter?).";
  }
  return { status: "fail", title: "Not quite yet", detail, userResult: user };
}
