import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson22: Lesson = {
  id: "lesson-22",
  num: 22,
  title: "CASE WHEN: branching inside a query",
  blurb: "An IF that lives in SQL — first matching branch wins, and a forgotten ELSE leaks NULL",
  minutes: 12,
  blocks: [
    {
      kind: "p",
      text: "**CASE** is SQL's expression-level branch: for every row it walks a list of conditions and returns the value of the **first one that matches**. It is not a statement — it produces a *scalar per row*, which means it can live anywhere an expression can.",
    },
    { kind: "diagram", figure: "s6-case-switch" },
    {
      kind: "code",
      caption: "Searched CASE — each status gets a human label",
      sql: `SELECT status,
       CASE WHEN status = 'delivered' THEN 'done'
            WHEN status = 'shipped'   THEN 'on its way'
            WHEN status = 'pending'   THEN 'waiting'
            ELSE 'dead end'
       END AS label
FROM orders
GROUP BY status, label
ORDER BY status;    -- 4 rows, every order accounted for`,
    },
    { kind: "h", text: "Two forms, one rule" },
    {
      kind: "bullets",
      items: [
        "**Searched CASE** (`CASE WHEN cond THEN v …`) tests arbitrary conditions per branch — ranges, LIKE, cross-column logic. **Simple CASE** (`CASE expr WHEN val THEN v …`) only does equality against one expression.",
        "Branch order is semantics: the **first matching branch wins** and the rest are never evaluated. On this db, `WHEN status LIKE '%pend%'` placed *before* `WHEN status = 'pending'` relabels all 14 pending orders `first-match`; swapped, the same 14 rows read `exact`. Same rows, different labels — yours to choose.",
        "No branch matching and **no ELSE → NULL**. With only `WHEN status = 'cancelled' THEN 'dead'`, the other **96 of 103 orders** come out NULL. The ELSE is not decoration; it is the default branch.",
      ],
    },
    { kind: "code",
      caption: "Simple CASE — equality dispatch, one column",
      sql: `SELECT CASE status
         WHEN 'delivered' THEN 1
         WHEN 'shipped'   THEN 1
         ELSE 0
       END AS closed,
       COUNT(*) AS n
FROM orders
GROUP BY closed
ORDER BY closed;    -- 0 → 21 (pending + cancelled), 1 → 82`,
    },
    { kind: "h", text: "An expression, not a statement" },
    {
      kind: "bullets",
      items: [
        "CASE goes **anywhere an expression goes**: in SELECT for labels, in WHERE for rule-shaped filters, in ORDER BY for custom ordering (next lesson), even inside aggregates — where it becomes the pivot machine.",
        "Branches may return **different types** and SQLite shrugs (dynamic typing). Postgres and MySQL instead find one common type for the whole CASE — a branch returning 1 and another returning 'none' is fine in SQLite and a cast surprise elsewhere.",
        "CASE stops at the first true branch — evaluations after it never happen. Unlike most SQL, **order inside CASE is control flow**.",
      ],
    },
    { kind: "h", text: "Dialect watch" },
    {
      kind: "bullets",
      items: [
        "Searched and simple CASE work identically in **SQLite, Postgres, MySQL** — CASE is fully standard and fully portable.",
        "Shortcuts differ: **MySQL** has `IF(cond, a, b)` and `IFNULL(x, y)`; **SQLite** has `IIF(cond, a, b)` (since 3.32); **Postgres** deliberately offers neither — CASE is the only spelling there. Write CASE and you never have to remember which engine has which shortcut.",
        "The NULL-picker is `COALESCE(a, b, …)` — standard, everywhere, and often the cleaner *replacement* for a CASE whose only job is substituting NULLs.",
      ],
    },
    {
      kind: "tip",
      text: "Simple CASE can never match NULL: `CASE status WHEN NULL THEN …` is dead code, because NULL ≠ NULL under comparison. Testing for NULL is a searched-CASE job: `CASE WHEN status IS NULL THEN …`.",
    },
    {
      kind: "warn",
      text: "A missing ELSE is the quietest bug in SQL reporting: the query succeeds, the report fills with NULLs, and only a user notices. If the WHEN list does not cover every possibility, write the ELSE even when it feels obvious.",
    },
  ],
  mcqs: [
    {
      id: "l22-q1",
      prompt: "In a searched CASE, two WHEN branches both match a row. What comes back?",
      choices: [
        "An error — branches must be mutually exclusive",
        "The value of the LAST matching branch",
        "The value of the FIRST matching branch",
        "Both values, concatenated",
      ],
      answer: 2,
      why: "CASE is first-match-wins and stops evaluating. That is why branch order is part of the query's meaning — verified on the 14 pending orders relabeled by swapping two branches.",
    },
    {
      id: "l22-q2",
      prompt: "`CASE WHEN status = 'cancelled' THEN 'dead' END` runs on all 103 orders. What do the 96 non-cancelled rows get?",
      choices: ["'other' — implied", "0", "NULL — there is no ELSE branch", "An error — coverage is required"],
      answer: 2,
      why: "Without ELSE, a non-matching row yields NULL. 96 NULL labels are exactly the silent-report bug this lesson warns about; write ELSE explicitly.",
    },
    {
      id: "l22-q3",
      prompt: "Why does `CASE status WHEN NULL THEN 'missing' ELSE 'present' END` never output 'missing'?",
      choices: [
        "NULL branches are optimized away",
        "Simple CASE uses equality, and NULL = NULL is not true — the comparison never matches",
        "status can never be NULL",
        "The ELSE always wins in simple CASE",
      ],
      answer: 1,
      why: "Simple CASE compares with equality semantics, where NULL never equals anything, including NULL. Test for NULL with the searched form: WHEN status IS NULL.",
    },
    {
      id: "l22-q4",
      prompt: "Which engine has neither `IF()` nor `IIF()` — making CASE the only branching spelling?",
      choices: ["MySQL", "SQLite", "Postgres", "All three have both"],
      answer: 2,
      why: "MySQL ships IF(cond,a,b), SQLite added IIF in 3.32 — Postgres offers neither and CASE is the standard, portable answer everywhere.",
    },
  ],
  problems: [
    {
      id: "l22-p1",
      title: "Four labels, no NULLs",
      brief: "Give every order status a label: delivered → `done`, shipped → `on its way`, pending → `waiting`, everything else → `dead end`. Output: `status`, `label` — one row per distinct status, ordered by `status`.",
      hint: "SELECT DISTINCT status, CASE … END AS label FROM orders ORDER BY status — the DISTINCT keeps it at 4 rows.",
      difficulty: "easy",
      solution:
        "SELECT DISTINCT status,\n  CASE WHEN status = 'delivered' THEN 'done'\n       WHEN status = 'shipped'   THEN 'on its way'\n       WHEN status = 'pending'   THEN 'waiting'\n       ELSE 'dead end'\n  END AS label\nFROM orders\nORDER BY status;",
      expected: EXPECTED["l22-p1"],
      ordered: true,
    },
    {
      id: "l22-p2",
      title: "Count the silent NULLs",
      brief: "Using `CASE WHEN status = 'cancelled' THEN 'dead' END` (no ELSE) over all orders, count how many rows come out NULL. Output one column `unlabeled`.",
      hint: "Wrap the CASE in a FROM subquery and count WHERE the tag IS NULL.",
      difficulty: "easy",
      solution:
        "SELECT COUNT(*) AS unlabeled FROM (\n  SELECT CASE WHEN status = 'cancelled' THEN 'dead' END AS tag\n  FROM orders\n) WHERE tag IS NULL;",
      expected: EXPECTED["l22-p2"],
    },
    {
      id: "l22-p3",
      title: "Closed or open",
      brief: "Classify each order with a simple CASE: delivered and shipped are `1`, everything else `0`. Report `closed`, `n` per group, ordered by `closed`. Expect 0 → 21, 1 → 82.",
      hint: "CASE status WHEN 'delivered' THEN 1 WHEN 'shipped' THEN 1 ELSE 0 END, then GROUP BY closed.",
      difficulty: "medium",
      solution:
        "SELECT CASE status\n         WHEN 'delivered' THEN 1\n         WHEN 'shipped'   THEN 1\n         ELSE 0\n       END AS closed,\n       COUNT(*) AS n\nFROM orders\nGROUP BY closed\nORDER BY closed;",
      expected: EXPECTED["l22-p3"],
      ordered: true,
    },
    {
      id: "l22-p4",
      title: "First match wins, witnessed",
      brief: "In one query, produce two labelings of the pending orders: `v1` puts `WHEN status LIKE '%pend%'` first, `v2` puts `WHEN status = 'pending'` first; both fall through to no ELSE. Output `v1`, `v2`, `n` — one row per distinct pair, ordered by `n`.",
      hint: "Two CASE expressions side by side in SELECT, then GROUP BY v1, v2 — expect (NULL, NULL, 89) and ('first-match', 'exact', 14).",
      difficulty: "hard",
      solution:
        "SELECT\n  CASE WHEN status LIKE '%pend%' THEN 'first-match'\n       WHEN status = 'pending'   THEN 'exact' END AS v1,\n  CASE WHEN status = 'pending'   THEN 'exact'\n       WHEN status LIKE '%pend%' THEN 'first-match' END AS v2,\n  COUNT(*) AS n\nFROM orders\nGROUP BY v1, v2\nORDER BY n;",
      expected: EXPECTED["l22-p4"],
      ordered: true,
    },
  ],
};
