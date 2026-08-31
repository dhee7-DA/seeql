// Mistake coach — turns failed problem attempts into targeted teaching.
//
// Two layers of coaching rules are tested against the learner's SQL:
//   1. Problem-specific `mistakes` — authored per problem for its known traps.
//   2. GLOBAL_MISTAKES — high-precision, engine-wide patterns (NULL comparison
//      myths, classic typos, HAVING/GROUP BY confusion).
//
// The coach is advisory: it never blocks grading, it only annotates a failed
// run with a human explanation of the most likely misconception. At most one
// rule fires per run — the first match wins, so order rules from specific
// to general.

import type { ProblemMistake } from "./types";

/** Collapse a query into a canonical, regex-testable form:
 *  lowercase, all whitespace runs → single space, punctuation hugged. */
export function normalizeSql(sql: string): string {
  return sql
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*([(),;])\s*/g, "$1 ")
    .trim();
}

export function firstMistake(
  sql: string,
  problemMistakes: ProblemMistake[] | undefined,
): string | null {
  const norm = normalizeSql(sql);
  const layers: ProblemMistake[][] = [];
  if (problemMistakes?.length) layers.push(problemMistakes);
  layers.push(GLOBAL_MISTAKES);
  for (const layer of layers) {
    for (const rule of layer) {
      try {
        if (new RegExp(rule.test, "i").test(norm)) return rule.message;
      } catch {
        // A bad authored regex must never break grading — skip it.
      }
    }
  }
  return null;
}

/**
 * Global coaching rules. Every pattern must be HIGH precision: a false hit
 * on a legitimate query erodes trust in the coach. Patterns run against the
 * normalized SQL (lowercased, whitespace collapsed, `(),;` hugged), so use
 * `\s*` wherever optional spaces are possible.
 */
export const GLOBAL_MISTAKES: ProblemMistake[] = [
  {
    test: `!=\\s*null\\b|<>\\s*null\\b`,
    message:
      "`x != NULL` filters out every row — comparing against NULL yields unknown, not true or false. Use `x IS NOT NULL` to keep rows where the value exists.",
  },
  {
    test: `=\\s*null\\b`,
    message:
      "NULL never equals anything — `x = NULL` is not true for any row, not even for NULL itself. Use `x IS NULL` (or `x IS NOT NULL`) to test for a missing value.",
  },
  {
    test: `=\\s*'null'`,
    message:
      "You're comparing against the three-letter string 'null', not the NULL value. Drop the quotes and use `x IS NULL` / `x IS NOT NULL`.",
  },
  {
    test: /\bselec\b|\bslect\b|\bselectt\b|\bselect s\b/.source,
    message:
      "Typo in the SELECT keyword — SQL only understands the exact spelling `SELECT`.",
  },
  {
    test: /\bform\s+(customers|suppliers|products|orders|order_items)\b/.source,
    message:
      "`FORM` is a typo for `FROM` — the clause that names the table is spelled FROM.",
  },
  {
    test: /^(?:(?!\bgroup\s+by\b).)*\bhaving\b/.source,
    message:
      "HAVING without GROUP BY treats the whole table as one group. If you meant to filter rows before aggregation, that's WHERE; if you meant to filter groups, write the GROUP BY first.",
  },
  {
    test: /\bgroup by\b[^;]*\bwhere\b/.source,
    message:
      "WHERE must come before GROUP BY: the logical order is WHERE → GROUP BY → HAVING → ORDER BY → LIMIT. An out-of-order clause is a syntax error.",
  },
  {
    test: /\blimt\b|\blimi\b(?![a-z])/.source,
    message: "Typo near the row cap — the keyword is spelled `LIMIT <number>`.",
  },
];
