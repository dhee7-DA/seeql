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
    { kind: "diagram", figure: "s13-eval-order" },
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
    {
      kind: "dialect",
      db: "postgres",
      text: "**Precedence**: SQLite left-to-right (equal precedence) · standard/Postgres/MySQL: `INTERSECT` before `UNION`/`EXCEPT`. `EXCEPT` and `UNION` share the lower tier everywhere.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "**Parenthesized arms**: Postgres ✓ (also allows per-arm `ORDER BY`/`LIMIT` inside) · MySQL ✓ · SQLite ✗ — syntax error. The FROM-subquery wrap is the universal spelling.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "Evaluation order is also **visible in column naming**: with mixed arms the output columns always come from the *first* arm of the *leftmost* pair — one more reason to keep arms shape-identical.",
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
      notes: [
        { choice: 0, why: "15 is the standard-engine reading (INTERSECT first) — SQLite runs the chain left to right: (A ∪ B) ∩ C = 8." },
      ],
    },
    {
      id: "l21-q2",
      prompt: "Same query, same data — what does Postgres return, following the standard?",
      choices: ["8 — identical to SQLite", "19", "15 — INTERSECT binds tighter: A ∪ (B ∩ C)", "4"],
      answer: 2,
      why: "Standard engines evaluate B ∩ C first (which is just B here), then union it into A: 15 rows. Same text as SQLite's 8 — the portability landmine this lesson is about.",
      notes: [
        { choice: 0, why: "Trusting SQLite's answer to travel *is* the landmine — standard engines bind INTERSECT tighter and return 15 on identical text." },
      ],
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
      notes: [
        { choice: 0, why: "Speed isn't the issue — bare parentheses simply don't parse in SQLite, while the FROM-wrap states your grouping and runs on every engine." },
      ],
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
      notes: [
        { choice: 0, why: "ALL only shields its own adjacent pair — the final plain UNION still sweeps the entire accumulated pile through the dedupe pass." },
      ],
    },
  ],
  problems: [
    {
      id: "l21-p1",
      title: "State the grouping, get 8",
      brief: "Customers with a **pending** order whose id also appears among delivered-or-cancelled customers — written so the grouping is explicit (the union wrapped as a FROM subquery, then INTERSECT). Output `customer_id` ascending: 8 rows.",
      hints: [
        "Make the left-to-right reading explicit: union the delivered and cancelled sets inside a FROM subquery first, and only then intersect the pending set.",
        "Shape: SELECT customer_id FROM (<delivered set> UNION <cancelled set>) INTERSECT SELECT customer_id FROM orders WHERE status = '<s>' ORDER BY customer_id;",
      ],
      difficulty: "medium",
      solution:
        "SELECT customer_id FROM (\n  SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\n  UNION\n  SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\n)\nINTERSECT\nSELECT DISTINCT customer_id FROM orders WHERE status = 'pending'\nORDER BY customer_id;",
      mistakes: [
        { test: "^\\(\\s*select|\\bunion\\s*\\(\\s*select|\\bintersect\\s*\\(\\s*select", message: "SQLite rejects parentheses around compound arms — state the grouping with a FROM subquery instead: SELECT customer_id FROM (A UNION B) INTERSECT …." },
        { test: "\\bunion\\b[^;]*from\\s*\\(", message: "That's the standard reading — B ∩ C first — which returns 15 here. The brief wants the left-to-right grouping: union delivered with cancelled first, then intersect the pending set." },
        { test: "^select\\b(?:(?!\\border\\s+by\\b).)*$", message: "The ids must come out ascending — one ORDER BY customer_id at the very end of the compound." },
      ],
      expected: EXPECTED["l21-p1"],
      ordered: true,
    },
    {
      id: "l21-p2",
      title: "The union wing",
      brief: "How many distinct customers have a delivered **or** a cancelled order? Output one column `either`.",
      hints: [
        "'Or' across two sets is exactly UNION — count the wrapped union of the distinct delivered and cancelled customer sets.",
        "Shape: SELECT COUNT(*) AS either FROM (<delivered set> UNION <cancelled set>);",
      ],
      difficulty: "easy",
      solution:
        "SELECT COUNT(*) AS either FROM (\n  SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\n  UNION\n  SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\n);",
      mistakes: [
        { test: "\\bunion\\s+all\\b", message: "UNION ALL keeps the duplicates — a cancelled customer who also delivered would count twice. Plain UNION dedupes: 15." },
        { test: "status\\s*=\\s*'delivered'\\s+or\\b|status\\s*=\\s*'cancelled'\\s+or\\b", message: "That counts order rows, not people — one customer can hold several qualifying orders. Count the wrapped UNION of the two distinct customer sets." },
        { test: "status\\s*=\\s*'delivered'\\s+and\\s+status|status\\s*=\\s*'cancelled'\\s+and\\s+status", message: "No order is both delivered and cancelled — 'or' spans two sets, which is the UNION of the two customer lists, not one impossible filter." },
      ],
      expected: EXPECTED["l21-p2"],
    },
    {
      id: "l21-p3",
      title: "Chain reaction",
      brief: "Run `SELECT region FROM suppliers UNION ALL SELECT region FROM suppliers UNION SELECT region FROM customers` and report the final row count as a single column `survivors`.",
      hints: [
        "ALL only binds its neighboring arms — the final plain UNION still dedupes the whole accumulated pile. Wrap the chain and count it.",
        "Shape: SELECT COUNT(*) AS survivors FROM (<stack A> UNION ALL <stack B> UNION <stack C>);",
      ],
      difficulty: "medium",
      solution:
        "SELECT COUNT(*) AS survivors FROM (\n  SELECT region FROM suppliers\n  UNION ALL\n  SELECT region FROM suppliers\n  UNION\n  SELECT region FROM customers\n);",
      mistakes: [
        { test: "\\bunion\\s+all\\b[^;]*\\bunion\\s+all\\b", message: "Both joins are UNION ALL, so nothing ever dedupes and the pile counts 28 rows — the final UNION must stay plain: that's the pass that collapses the pile to the 4 regions." },
        { test: "\\bunion\\b[^;]*\\bunion\\s+all\\b", message: "ALL is attached to the wrong pair — the dedupe has to come last: … UNION ALL … UNION customers." },
        { test: "^select\\s+region\\b", message: "That returns the raw rows — the brief wants one number: wrap the whole chain in a FROM subquery and COUNT(*) it as survivors." },
      ],
      expected: EXPECTED["l21-p3"],
    },
    {
      id: "l21-p4",
      title: "Two engines, one row",
      brief: "Prove the landmine in a single row: `sqlite_way` = count of the left-to-right reading of A∪B∩C; `standard_way` = count of the INTERSECT-first reading. Both computed with explicit FROM-subqueries.",
      hints: [
        "Two scalar subqueries, one per reading: sqlite_way counts (A ∪ B) ∩ C and standard_way counts A ∪ (B ∩ C) — each grouping stated with a FROM subquery, each wrapped in its own COUNT.",
        "Shape: SELECT (SELECT COUNT(*) FROM (<(A ∪ B) ∩ C, FROM-wrapped>)) AS sqlite_way, (SELECT COUNT(*) FROM (<A ∪ (B ∩ C), FROM-wrapped>)) AS standard_way;",
      ],
      difficulty: "hard",
      solution:
        "SELECT\n  (SELECT COUNT(*) FROM (\n     SELECT * FROM (\n       SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'delivered'\n       UNION\n       SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'cancelled'\n     )\n     INTERSECT\n     SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'pending'\n   )) AS sqlite_way,\n  (SELECT COUNT(*) FROM (\n     SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'delivered'\n     UNION\n     SELECT * FROM (\n       SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'cancelled'\n       INTERSECT\n       SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'pending'\n     )\n   )) AS standard_way;",
      mistakes: [
        { test: "^\\(\\s*select|\\bunion\\s*\\(\\s*select|\\bintersect\\s*\\(\\s*select", message: "SQLite rejects parentheses around compound arms — state each grouping with a FROM subquery: SELECT * FROM (A UNION B), or nest the wraps." },
        { test: "^(?![^;]*\\bstandard_way\\b)[^;]*\\bcount\\b", message: "One row, two numbers — sqlite_way and standard_way each need their own scalar subquery: (A ∪ B) ∩ C and A ∪ (B ∩ C)." },
        { test: "^(?![^;]*\\bintersect\\b)[^;]*\\bunion\\b", message: "Both readings lean on INTERSECT — sqlite_way needs (A ∪ B) ∩ C and standard_way needs A ∪ (B ∩ C); neither appears yet." },
      ],
      expected: EXPECTED["l21-p4"],
    },
  ],
  takeaway: "Mixed set-operator chains are ambiguous prose — SQLite reads left to right while the standard binds INTERSECT first, and since SQLite bans parenthesized arms, FROM-subquery wrapping is the portable way to state your grouping.",
};
