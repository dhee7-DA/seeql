import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson17: Lesson = {
  id: "lesson-17",
  num: 17,
  title: "UNION & UNION ALL: stack result sets",
  blurb: "Two queries, one answer — append results vertically and control which duplicates survive",
  minutes: 12,
  blocks: [
    {
      kind: "p",
      text: "So far every query read from **one shape of data**. A **compound SELECT** runs two queries and stacks the second's rows under the first's — one combined result. `UNION ALL` appends everything; `UNION` appends and then **removes duplicate rows**.",
    },
    { kind: "diagram", figure: "s1-union" },
    {
      kind: "code",
      caption: "Same column, two stacks — 103 raw status rows vs 4 distinct",
      sql: `SELECT status FROM orders
UNION ALL
SELECT status FROM orders;   -- 103 + 103, nothing removed

SELECT status FROM orders
UNION
SELECT status FROM orders;   -- deduped: 4 rows`,
    },
    { kind: "h", text: "The rule that makes stacking legal" },
    {
      kind: "bullets",
      items: [
        "**Every arm must produce the same number of columns.** Stack a 2-column arm on a 3-column arm and SQLite stops you with *\"SELECTs to the left and right of UNION do not have the same number of result columns\"*.",
        "**Column names come from the first arm.** Run `SELECT name AS first_col FROM customers UNION ALL SELECT name FROM suppliers` and the combined pile is named `first_col` — the second arm's names are ignored everywhere.",
        "**Types should line up, but SQLite is forgiving.** Its dynamic typing will stack a number on a text value without complaint; Postgres and MySQL instead pick a common type and coerce. Don't ship a query that depends on the difference.",
      ],
    },
    { kind: "h", text: "Dedupe is the whole difference" },
    {
      kind: "bullets",
      items: [
        "`UNION ALL` is a pure append — nothing is inspected, nothing removed. Customers' 16 regions stacked on suppliers' 6 regions is **22 rows** (EU 10 · APAC 7 · US 3 · LATAM 2).",
        "`UNION` feeds the whole pile through a dedupe pass — on the same pile, **4 rows**. That pass compares *entire rows*, across and within arms, so an arm that repeats itself gets collapsed too.",
        "The dedupe costs a sort or hash under the hood. On big results that is real time — **reach for `UNION ALL` first and upgrade to `UNION` only when duplicates actually hurt**.",
      ],
    },
    { kind: "code",
      caption: "The classic pile: stack, then summarize outside",
      sql: `SELECT region, COUNT(*) AS n FROM (
  SELECT region FROM customers
  UNION ALL
  SELECT region FROM suppliers
) GROUP BY region
ORDER BY region;   -- APAC 7 · EU 10 · LATAM 2 · US 3`,
    },
    { kind: "h", text: "One ORDER BY, at the very end" },
    {
      kind: "bullets",
      items: [
        "A compound SELECT takes **one `ORDER BY`, written after the last arm**, and it sorts the *combined* result — you are ordering the pile, not the arms.",
        "Want a single arm sorted and limited? **Wrap it in a FROM subquery**: `SELECT * FROM (SELECT id, total FROM orders ORDER BY total DESC LIMIT 3) UNION ALL …`. Portable and explicit.",
        "Postgres and MySQL also accept parentheses around an arm — `(SELECT … LIMIT 3) UNION ALL …`. **SQLite rejects that with a syntax error** (verified on this db), so the FROM-subquery form is the one to habitually write.",
      ],
    },
    { kind: "h", text: "Dialect watch" },
    {
      kind: "bullets",
      items: [
        "`UNION` / `UNION ALL` work identically in **SQLite, Postgres and MySQL** — the safest ground in this module.",
        "Names from the first arm, single trailing `ORDER BY`: same in all three engines.",
        "Per-arm `LIMIT`: Postgres and MySQL allow parenthesized arms; **SQLite does not** — wrap the arm in `SELECT * FROM (…)`. One habit covers all engines.",
      ],
    },
    {
      kind: "tip",
      text: "Set operations are a *reporting* tool: stack two lists, then aggregate the stack. If you find yourself stacking more than three or four arms, a `GROUP BY` with a `CASE` label column (lesson 23) is usually the cleaner query.",
    },
  ],
  mcqs: [
    {
      id: "l17-q1",
      prompt: "How many rows does `SELECT region FROM customers UNION ALL SELECT region FROM suppliers` return on this store?",
      choices: ["4", "16", "22", "38"],
      answer: 2,
      why: "UNION ALL appends without dedupe: 16 customer rows + 6 supplier rows = 22. The deduped UNION would give 4.",
    },
    {
      id: "l17-q2",
      prompt: "Same two arms joined with plain `UNION` instead — how many rows now?",
      choices: ["4", "8", "16", "22"],
      answer: 0,
      why: "Both tables only contain the regions EU, APAC, US and LATAM. After the dedupe pass the pile collapses to 4 distinct rows.",
    },
    {
      id: "l17-q3",
      prompt: "In `SELECT name AS n1 FROM customers UNION ALL SELECT name AS n2 FROM suppliers`, what is the output column called?",
      choices: ["n1", "n2", "name", "It has no name"],
      answer: 0,
      why: "Column names always come from the FIRST arm. The second arm's aliases are ignored — worth remembering when your app reads results by column name.",
    },
    {
      id: "l17-q4",
      prompt: "Where may ORDER BY appear in a compound SELECT?",
      choices: [
        "After any arm, sorting just that arm",
        "Once, after the last arm — sorting the whole combined result",
        "Both before and after each arm",
        "Nowhere — compounds cannot be sorted",
      ],
      answer: 1,
      why: "One ORDER BY, at the very end, applies to the entire pile. To sort and limit a single arm, wrap that arm in a FROM subquery.",
    },
  ],
  problems: [
    {
      id: "l17-p1",
      title: "Statuses and categories, deduped",
      brief: "Stack every order `status` on every product `category` — deduplicated. Output one column named `status`, sorted alphabetically. Should be 4 statuses + 7 categories.",
      hint: "SELECT status FROM orders UNION SELECT category FROM products ORDER BY status; — the trailing ORDER BY sorts the whole pile.",
      difficulty: "easy",
      solution:
        "SELECT status FROM orders\nUNION\nSELECT category FROM products\nORDER BY status;",
      expected: EXPECTED["l17-p1"],
      ordered: true,
    },
    {
      id: "l17-p2",
      title: "Count the raw pile",
      brief: "How many rows does the *un-deduplicated* stack of all order statuses and all product categories contain? Output a single row, single column named `pile`.",
      hint: "Wrap the UNION ALL stack in a FROM subquery and COUNT(*) it: SELECT COUNT(*) AS pile FROM (… UNION ALL …).",
      difficulty: "easy",
      solution:
        "SELECT COUNT(*) AS pile FROM (\n  SELECT status FROM orders\n  UNION ALL\n  SELECT category FROM products\n);",
      expected: EXPECTED["l17-p2"],
    },
    {
      id: "l17-p3",
      title: "Region roll-up across both tables",
      brief: "Stack customers' regions on suppliers' regions, then report how many rows each region contributes to the pile. Output: `region`, `n` — ordered by region.",
      hint: "SELECT region, COUNT(*) AS n FROM (SELECT region FROM customers UNION ALL SELECT region FROM suppliers) GROUP BY region ORDER BY region.",
      difficulty: "medium",
      solution:
        "SELECT region, COUNT(*) AS n FROM (\n  SELECT region FROM customers\n  UNION ALL\n  SELECT region FROM suppliers\n) GROUP BY region\nORDER BY region;",
      expected: EXPECTED["l17-p3"],
      ordered: true,
    },
    {
      id: "l17-p4",
      title: "What dedupe removed",
      brief: "Stack every order `status` on every supplier `region`. How many rows does `UNION ALL` produce that `UNION` does not? Output one column named `dupes`.",
      hint: "Two counts, subtracted: SELECT (SELECT COUNT(*) FROM (… UNION ALL …)) - (SELECT COUNT(*) FROM (… UNION …)) AS dupes.",
      difficulty: "hard",
      solution:
        "SELECT\n  (SELECT COUNT(*) FROM (\n     SELECT status FROM orders\n     UNION ALL\n     SELECT region FROM suppliers\n   ))\n- (SELECT COUNT(*) FROM (\n     SELECT status FROM orders\n     UNION\n     SELECT region FROM suppliers\n   )) AS dupes;",
      expected: EXPECTED["l17-p4"],
    },
  ],
};
