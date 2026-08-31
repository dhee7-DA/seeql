import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson21: Lesson = {
  id: "lesson-21",
  num: 21,
  title: "Chains & precedence: who evaluates first",
  blurb: "Mix UNION with INTERSECT and the answer depends on your engine — prove it, then defuse it",
  minutes: 13,
  blocks: [
    {
      kind: "p",
      text: "Set operators chain: `A UNION B INTERSECT C` is legal SQL. It is also a **portability landmine** — engines disagree on which operator binds first, and on this very database the two readings differ by **7 rows**.",
    },
    { kind: "diagram", figure: "s5-precedence" },
    {
      kind: "code",
      caption: "The three sets we will chain — all real",
      sql: `SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'delivered';  -- A: 15
SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'cancelled';  -- B: 4
SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'pending';    -- C: 8`,
    },
    { kind: "h", text: "SQLite goes left to right" },
    {
      kind: "bullets",
      items: [
        "In SQLite all four operators have **equal precedence** and the chain evaluates **left to right**: `A UNION B INTERSECT C` means `(A ∪ B) ∩ C`. We verified this empirically on the seeded store — the bare chain returns **8 ids**: 1, 3, 5, 6, 7, 11, 13, 16.",
        "That is `(delivered ∪ cancelled) ∩ pending`. Since every cancelled-order customer also has a delivered one, `A ∪ B` is just A — so the answer is *delivered customers who also wait*: 8.",
        "The chained mixed form `suppliers UNION ALL suppliers UNION customers` dedupes only where a `UNION` sits: the final pass collapses the whole pile to **4** regions. `ALL` binds an arm to its neighbor; the last `UNION` still sweeps everything.",
      ],
    },
    { kind: "h", text: "The standard says INTERSECT first" },
    {
      kind: "bullets",
      items: [
        "The SQL standard — followed by **Postgres, MySQL 8.0.31+, SQL Server** — gives `INTERSECT` **higher precedence** than `UNION`/`EXCEPT`: `A UNION B INTERSECT C` means `A ∪ (B ∩ C)`.",
        "On our sets that is `delivered ∪ (cancelled ∩ pending)` = delivered ∪ {1,5,11,13} = **15 ids**. **Same query text: 8 rows in SQLite, 15 rows in the typed engines.** This is not theory — it is the same SELECT, two engines, different answers.",
        "Neither reading is a bug. The lesson: **mixed-operator chains are ambiguous prose** — treat them like unparenthesized `a and b or c`, and never ship one.",
      ],
    },
    { kind: "h", text: "Parens: the portability maze" },
    {
      kind: "bullets",
      items: [
        "The obvious fix — grouping with parentheses — is itself non-portable. **Postgres and MySQL** accept `(SELECT …) UNION (SELECT …)`; **SQLite rejects parentheses around compound arms outright** (both `(A) INTERSECT (B)` and a `((A ∪ B) ∩ C)` FROM-wrap failed with syntax errors on this db).",
        "The form that parses **everywhere**: give each arm its own scope as a **FROM subquery** — `SELECT * FROM (A UNION B) INTERSECT SELECT … C`, or fully nested: `… FROM (SELECT * FROM (A) UNION SELECT * FROM (B))`.",
        "Bonus: the FROM-subquery style is **self-documenting**. The grouping you wrote is the grouping you meant — no engine gets a vote.",
      ],
    },
    { kind: "code",
      caption: "Both readings, stated explicitly — portable on every engine",
      sql: `-- left-to-right reading (what SQLite does): 8
SELECT COUNT(*) FROM (
  SELECT * FROM (
    SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'delivered'
    UNION
    SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'cancelled'
  )
  INTERSECT
  SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'pending'
);

-- standard reading (INTERSECT first): 15
SELECT COUNT(*) FROM (
  SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'delivered'
  UNION
  SELECT * FROM (
    SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'cancelled'
    INTERSECT
    SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'pending'
  )
);`,
    },
    { kind: "h", text: "Dialect watch" },
    {
      kind: "bullets",
      items: [
        "**Precedence**: SQLite left-to-right (equal precedence) · standard/Postgres/MySQL: `INTERSECT` before `UNION`/`EXCEPT`. `EXCEPT` and `UNION` share the lower tier everywhere.",
        "**Parenthesized arms**: Postgres ✓ (also allows per-arm `ORDER BY`/`LIMIT` inside) · MySQL ✓ · SQLite ✗ — syntax error. The FROM-subquery wrap is the universal spelling.",
        "Evaluation order is also **visible in column naming**: with mixed arms the output columns always come from the *first* arm of the *leftmost* pair — one more reason to keep arms shape-identical.",
      ],
    },
    {
      kind: "warn",
      text: "Interview and exam questions love `A UNION B EXCEPT C`. Walk in with the rule — INTERSECT binds first in the standard, SQLite runs left to right — and the habit: rewrite as explicit FROM-subqueries before answering either way.",
    },
  ],
  mcqs: [
    {
      id: "l21-q1",
      prompt: "On this store, what does SQLite return for `A UNION B INTERSECT C` where A=delivered (15), B=cancelled (4), C=pending (8)?",
      choices: ["15", "8", "4", "19"],
      answer: 1,
      why: "SQLite evaluates left to right: (A ∪ B) ∩ C. Since B ⊆ A, that's A ∩ C = the 8 delivered customers who also have a pending order.",
    },
    {
      id: "l21-q2",
      prompt: "Same query, same data — what does Postgres return, following the standard?",
      choices: ["8 — identical to SQLite", "19", "15 — INTERSECT binds tighter: A ∪ (B ∩ C)", "4"],
      answer: 2,
      why: "Standard engines evaluate B ∩ C first (which is just B here), then union it into A: 15 rows. Same text as SQLite's 8 — the portability landmine this lesson is about.",
    },
    {
      id: "l21-q3",
      prompt: "Why wrap each arm in a FROM subquery instead of using parentheses like `(A) UNION (B)`?",
      choices: [
        "It is faster",
        "Parenthesized arms are a syntax error in SQLite, while the FROM-wrap parses on every engine",
        "FROM subqueries can skip the ORDER BY rule",
        "Parentheses change the column names",
      ],
      answer: 1,
      why: "SQLite rejects parens around compound arms (verified on this db). The FROM-subquery form is legal in SQLite, Postgres and MySQL — and states your intended grouping explicitly.",
    },
    {
      id: "l21-q4",
      prompt: "`suppliers UNION ALL suppliers UNION customers` — what does the final result contain?",
      choices: [
        "22 rows — UNION ALL protects the whole chain from dedupe",
        "12 rows — the trailing customers cancel suppliers out",
        "4 rows — the final UNION dedupes the entire pile so far",
        "An error — ALL and plain UNION cannot mix",
      ],
      answer: 2,
      why: "Mixing is legal; ALL only affects its adjacent pair. The last UNION runs a full dedupe over the accumulated pile — 22 raw rows collapse to the 4 distinct regions.",
    },
  ],
  problems: [
    {
      id: "l21-p1",
      title: "State the grouping, get 8",
      brief: "Customers with a **pending** order whose id also appears among delivered-or-cancelled customers — written so the grouping is explicit (the union wrapped as a FROM subquery, then INTERSECT). Output `customer_id` ascending: 8 rows.",
      hint: "SELECT customer_id FROM (…delivered UNION …cancelled) INTERSECT SELECT customer_id FROM orders WHERE status='pending' ORDER BY customer_id.",
      difficulty: "medium",
      solution:
        "SELECT customer_id FROM (\n  SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\n  UNION\n  SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\n)\nINTERSECT\nSELECT DISTINCT customer_id FROM orders WHERE status = 'pending'\nORDER BY customer_id;",
      expected: EXPECTED["l21-p1"],
      ordered: true,
    },
    {
      id: "l21-p2",
      title: "The union wing",
      brief: "How many distinct customers have a delivered **or** a cancelled order? Output one column `either`.",
      hint: "Count the FROM-wrapped union of the two DISTINCT sets.",
      difficulty: "easy",
      solution:
        "SELECT COUNT(*) AS either FROM (\n  SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\n  UNION\n  SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\n);",
      expected: EXPECTED["l21-p2"],
    },
    {
      id: "l21-p3",
      title: "Chain reaction",
      brief: "Run `SELECT region FROM suppliers UNION ALL SELECT region FROM suppliers UNION SELECT region FROM customers` and report the final row count as a single column `survivors`.",
      hint: "Wrap the whole chain in a FROM subquery: SELECT COUNT(*) AS survivors FROM ( …chain… ).",
      difficulty: "medium",
      solution:
        "SELECT COUNT(*) AS survivors FROM (\n  SELECT region FROM suppliers\n  UNION ALL\n  SELECT region FROM suppliers\n  UNION\n  SELECT region FROM customers\n);",
      expected: EXPECTED["l21-p3"],
    },
    {
      id: "l21-p4",
      title: "Two engines, one row",
      brief: "Prove the landmine in a single row: `sqlite_way` = count of the left-to-right reading of A∪B∩C; `standard_way` = count of the INTERSECT-first reading. Both computed with explicit FROM-subqueries.",
      hint: "sqlite_way: (SELECT COUNT(*) FROM (SELECT * FROM (A UNION B) INTERSECT …C)). standard_way: A UNION SELECT * FROM (B INTERSECT C) — each wrapped and counted.",
      difficulty: "hard",
      solution:
        "SELECT\n  (SELECT COUNT(*) FROM (\n     SELECT * FROM (\n       SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'delivered'\n       UNION\n       SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'cancelled'\n     )\n     INTERSECT\n     SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'pending'\n   )) AS sqlite_way,\n  (SELECT COUNT(*) FROM (\n     SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'delivered'\n     UNION\n     SELECT * FROM (\n       SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'cancelled'\n       INTERSECT\n       SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'pending'\n     )\n   )) AS standard_way;",
      expected: EXPECTED["l21-p4"],
    },
  ],
};
