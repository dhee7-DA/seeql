// SQL Error Coach — turns a graded miss into a targeted, human nudge.
// gradeSqlResult already tells the learner WHAT differs (rows / order /
// values); the coach reads the user's actual SQL text alongside the result
// sets and guesses WHY — fan-out from a one-to-many join, a missing LEFT,
// NULL comparisons never matching, integer division flooring, an
// over-tight WHERE. Heuristics, not guarantees: every line is phrased as
// a nudge ("check…", "try…"), never a verdict.

import type { ExecResult } from "@/lib/sql-types";
import type { LcSqlExpected } from "./types";

export interface CoachTip {
  /** short machine-ish tag for styling/grouping */
  tag: string;
  /** the human line shown under the failure banner */
  line: string;
}

function norm(v: ExecResult["rows"][number][number]): string {
  if (v === null) return "\u0000null";
  if (typeof v === "number") {
    return Number.isInteger(v) ? String(v) : String(Math.round(v * 10000) / 10000);
  }
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

function multisetEq(a: string[][], b: string[][]) {
  if (a.length !== b.length) return false;
  const key = (row: string[]) => JSON.stringify(row);
  const sa = [...a].map(key).sort();
  const sb = [...b].map(key).sort();
  return sa.every((k, i) => k === sb[i]);
}

export function coachSqlMiss(sql: string, user: ExecResult, expected: LcSqlExpected): CoachTip {
  const a = user.rows.map((r) => r.map(norm));
  const b = expected.rows.map((r) => r.map(norm));
  const upper = sql.toUpperCase();

  // same rows as a set → order or duplicate problem
  if (a.length > 0 && multisetEq(a, b)) {
    if (expected.order === "exact") {
      return {
        tag: "order",
        line: "Right rows, wrong sequence — this task checks ordering. Match the ORDER BY exactly: the task's named column and direction.",
      };
    }
    return {
      tag: "dupes",
      line: "Every row is correct as a set, but duplicates (or one missing copy) differ — check the join keys for fan-out, or collapse with DISTINCT.",
    };
  }

  // zero rows — something filtered everything away
  if (a.length === 0) {
    if (/LIKE/.test(upper)) {
      return {
        tag: "zero",
        line: "Zero rows with a LIKE filter — check the pattern (% placement, wildcards) and whether NULL rows in that column are silently dropping out.",
      };
    }
    if (/JOIN/.test(upper) && !/LEFT\s+(OUTER\s+)?JOIN|FULL/i.test(sql)) {
      return {
        tag: "zero",
        line: "Zero rows from an INNER JOIN — one side has no match under the current filters. Try a LEFT JOIN, or loosen a WHERE condition.",
      };
    }
    return {
      tag: "zero",
      line: "Zero rows back — a WHERE filter is too tight, or a literal doesn't match the seed data (date format, case, trailing spaces).",
    };
  }

  // row-count mismatch — the classic join/aggregate failures
  if (a.length !== b.length) {
    if (a.length > b.length) {
      if (!/GROUP\s+BY/i.test(upper) && /JOIN/.test(upper)) {
        return {
          tag: "fanout",
          line: `Too many rows (${a.length} vs ${b.length}) — a one-to-many join is fanning out. Aggregate with GROUP BY, or pick one row per key (window + filter).`,
        };
      }
      if (!/DISTINCT/i.test(upper)) {
        return {
          tag: "fanout",
          line: `Too many rows (${a.length} vs ${b.length}) — duplicate pairs from a join. DISTINCT may collapse them, or re-check the grain you're grouping at.`,
        };
      }
      return {
        tag: "fanout",
        line: `Too many rows (${a.length} vs ${b.length}) — the grouping grain is too fine: group by fewer columns, or filter rows before aggregating.`,
      };
    }
    return {
      tag: "missing",
      line: `Too few rows (${a.length} vs ${b.length}) — a filter or INNER JOIN is dropping matches. LEFT JOIN keeps the unmatched side, and watch for a WHERE clause that filters the kept rows back out.`,
    };
  }

  // same count, values differ — NULL and arithmetic traps first
  if (/NULL/.test(upper) && !/COALESCE|IFNULL/.test(upper)) {
    return {
      tag: "nulls",
      line: "Values differ and your SQL compares or joins on a nullable column without COALESCE/IFNULL — NULL never equals anything, not even NULL. Wrap it.",
    };
  }
  if (!/ROUND/.test(upper) && /AVG\s*\(|SUM\s*\(|\/(?!\*)/.test(upper)) {
    return {
      tag: "rounding",
      line: "Values differ on computed numbers — check ROUND(x, 2) and integer division: SQLite's '/' between two INTEGERs floors. Multiply by 1.0 to force REAL math.",
    };
  }
  const firstBad = a.findIndex((row, i) => JSON.stringify(row) !== JSON.stringify(b[i]));
  if (firstBad !== -1) {
    const got = a[firstBad].join(" | ");
    const want = b[firstBad].join(" | ");
    return {
      tag: "values",
      line: `Row ${firstBad + 1} differs — got "${got}", expected "${want}". Compare the SELECT list column-by-column against the task (right column? right alias order? NULL padding on outer joins?).`,
    };
  }
  return {
    tag: "values",
    line: "Close — some values differ. Compare your columns against the task one by one: NULL handling, rounding, and which column was actually asked for.",
  };
}
