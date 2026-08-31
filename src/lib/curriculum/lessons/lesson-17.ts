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
    { kind: "diagram", figure: "s9-union-vs-all" },
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
    {
      kind: "dialect",
      db: "sqlite",
      text: "`UNION` / `UNION ALL` work identically in SQLite, Postgres and MySQL — the safest ground in this module.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "Names from the first arm, single trailing `ORDER BY`: same in all three engines.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Per-arm `LIMIT`: Postgres and MySQL allow parenthesized arms; **SQLite does not** — wrap the arm in `SELECT * FROM (…)`. One habit covers all engines.",
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
      notes: [
        { choice: 0, why: "4 is the *deduped* UNION answer — UNION ALL never dedupes, so the pile keeps all 16 + 6 rows." },
      ],
    },
    {
      id: "l17-q2",
      prompt: "Same two arms joined with plain `UNION` instead — how many rows now?",
      choices: ["4", "8", "16", "22"],
      answer: 0,
      why: "Both tables only contain the regions EU, APAC, US and LATAM. After the dedupe pass the pile collapses to 4 distinct rows.",
      notes: [
        { choice: 3, why: "22 is the raw UNION ALL pile — plain UNION's dedupe pass compares whole rows, and both arms only ever produce the same four regions." },
      ],
    },
    {
      id: "l17-q3",
      prompt: "In `SELECT name AS n1 FROM customers UNION ALL SELECT name AS n2 FROM suppliers`, what is the output column called?",
      choices: ["n1", "n2", "name", "It has no name"],
      answer: 0,
      why: "Column names always come from the FIRST arm. The second arm's aliases are ignored — worth remembering when your app reads results by column name.",
      notes: [
        { choice: 1, why: "The second arm's aliases are parsed and then discarded — naming rights belong to the first arm alone." },
      ],
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
      notes: [
        { choice: 0, why: "A bare ORDER BY after an intermediate arm is a syntax error — to sort just one slice, wrap that arm in a FROM subquery." },
      ],
    },
  ],
  problems: [
    {
      id: "l17-p1",
      title: "Statuses and categories, deduped",
      brief: "Stack every order `status` on every product `category` — deduplicated. Output one column named `status`, sorted alphabetically. Should be 4 statuses + 7 categories.",
      hints: [
        "Deduplicated is the keyword — that's plain UNION between the two arms, and the single ORDER BY goes after the last arm.",
        "Shape: SELECT status FROM orders UNION SELECT category FROM products ORDER BY <column>;",
      ],
      difficulty: "easy",
      solution:
        "SELECT status FROM orders\nUNION\nSELECT category FROM products\nORDER BY status;",
      mistakes: [
        { test: "\\bunion\\s+all\\b", message: "UNION ALL appends without deduping — the brief wants duplicates removed, which is plain UNION's job." },
        { test: "\\border\\s+by\\b[^;]*\\bunion\\b", message: "A compound takes one ORDER BY, written after the last arm — an ORDER BY in the middle sorts nothing and is a syntax error." },
        { test: "^select\\b(?:(?!\\bunion\\b).)*$", message: "The brief stacks two lists — one status arm, one category arm — combined with UNION; a single SELECT can't see both tables' values." },
      ],
      expected: EXPECTED["l17-p1"],
      ordered: true,
    },
    {
      id: "l17-p2",
      title: "Count the raw pile",
      brief: "How many rows does the *un-deduplicated* stack of all order statuses and all product categories contain? Output a single row, single column named `pile`.",
      hints: [
        "The pile is the raw UNION ALL stack — count its rows by wrapping the stack in a FROM subquery.",
        "Shape: SELECT COUNT(*) AS pile FROM (<stack A> UNION ALL <stack B>);",
      ],
      difficulty: "easy",
      solution:
        "SELECT COUNT(*) AS pile FROM (\n  SELECT status FROM orders\n  UNION ALL\n  SELECT category FROM products\n);",
      mistakes: [
        { test: "\\bcount\\s*\\(\\s*distinct", message: "COUNT(DISTINCT …) dedupes before counting — the brief wants the raw pile's size, so COUNT(*) the UNION ALL stack." },
        { test: "\\bunion\\b(?!\\s+all\\b)", message: "Plain UNION dedupes before the count — the brief asks for the *un-deduplicated* pile, so keep UNION ALL (103 + 16 = 119)." },
        { test: "^select\\s+status\\b", message: "That returns the raw rows — the brief wants one number: wrap the stack in a FROM subquery and COUNT(*) it as pile." },
      ],
      expected: EXPECTED["l17-p2"],
    },
    {
      id: "l17-p3",
      title: "Region roll-up across both tables",
      brief: "Stack customers' regions on suppliers' regions, then report how many rows each region contributes to the pile. Output: `region`, `n` — ordered by region.",
      hints: [
        "Aggregate the combined pile, not each table: stack the raw regions with UNION ALL inside a FROM subquery, then GROUP BY region outside it.",
        "Shape: SELECT region, COUNT(*) AS n FROM (<customers stack> UNION ALL <suppliers stack>) GROUP BY region ORDER BY region;",
      ],
      difficulty: "medium",
      solution:
        "SELECT region, COUNT(*) AS n FROM (\n  SELECT region FROM customers\n  UNION ALL\n  SELECT region FROM suppliers\n) GROUP BY region\nORDER BY region;",
      mistakes: [
        { test: "\\bgroup\\s+by\\b[^;]*\\bunion\\b", message: "Each arm is aggregating its own table — that reports two counts per region. Wrap the raw UNION ALL stack in a FROM subquery and run one GROUP BY over the combined pile." },
        { test: "\\bunion\\b(?!\\s+all\\b)", message: "Plain UNION dedupes the pile first, so every region would report 1 — stack raw rows with UNION ALL so each region's true contribution survives." },
        { test: "^select\\b(?:(?!\\bgroup\\s+by\\b).)*$", message: "The brief wants per-region counts — GROUP BY region (with COUNT(*) AS n) after the wrapped stack." },
      ],
      expected: EXPECTED["l17-p3"],
      ordered: true,
    },
    {
      id: "l17-p4",
      title: "What dedupe removed",
      brief: "Stack every order `status` on every supplier `region`. How many rows does `UNION ALL` produce that `UNION` does not? Output one column named `dupes`.",
      hints: [
        "One number: the raw pile minus the deduped pile. Count each stack in its own scalar subquery, then subtract.",
        "Shape: SELECT (SELECT COUNT(*) FROM (<stack> UNION ALL <stack>)) - (SELECT COUNT(*) FROM (<stack> UNION <stack>)) AS dupes;",
      ],
      difficulty: "hard",
      solution:
        "SELECT\n  (SELECT COUNT(*) FROM (\n     SELECT status FROM orders\n     UNION ALL\n     SELECT region FROM suppliers\n   ))\n- (SELECT COUNT(*) FROM (\n     SELECT status FROM orders\n     UNION\n     SELECT region FROM suppliers\n   )) AS dupes;",
      mistakes: [
        { test: "\\bunion\\s+all\\b[^;]*\\bunion\\s+all\\b", message: "Both stacks are UNION ALL, so the two counts come out equal and the difference is 0 — the second count must use plain UNION, since the dedupe pass is exactly what you're measuring." },
        { test: "\\bunion\\b(?!\\s+all\\b)[^;]*\\bunion\\b(?!\\s+all\\b)", message: "Two plain UNIONs dedupe twice — you'd get 8 − 8 = 0. The first count must be the raw UNION ALL pile (103 + 6 = 109)." },
        { test: "^select\\b(?![^;]*-)[^;]*\\bcount\\b[^;]*\\bunion\\b", message: "One count alone can't answer this — count the raw stack and the deduped stack in two scalar subqueries, then subtract them." },
      ],
      expected: EXPECTED["l17-p4"],
    },
  ],
  takeaway: "UNION ALL appends and UNION appends-then-dedupes whole rows; arms must match in column count, the pile takes the first arm's names, and one ORDER BY — at the very end — sorts the combined result.",
};
