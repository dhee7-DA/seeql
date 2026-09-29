// Keyword Mastery bank — Subqueries MCQs, part K (WITH RECURSIVE kb-rc-q01..q20).
// Facts probed via scripts/m4-facts{,2}.ts: counter 1..10 → 10 rows, sum 1..100
// = 5050, evens 2..18, doubling 1..64, UNION-dedupe walk 1,2,3,4,0, bare LIMIT
// stops at 5 but an AGGREGATE over unbounded recursion hangs (verified hang,
// killed), date spine 424 days (2024-01-01..2025-02-27), month spine 14
// (2024-01..2025-02), EU CTE chain 45/15089.23, per_order > 1000 = 1 (order
// 74), heavy CTE referenced twice → 4 rows / SUM 68, CTE shadows base table,
// two recursive CTEs coexist (mx 3 / my 30), nested WITH works (14 pending),
// WITH after UNION is a syntax error.
import type { Mcq } from "../types";

export const subqueryMcqsK: Mcq[] = [
  {
    id: "kb-rc-q01", difficulty: "easy",
    prompt: "What three parts does every recursive CTE have?",
    choices: [
      "A base case (seed rows), UNION ALL (or UNION), and a recursive step referencing the CTE's own name",
      "GROUP BY, HAVING, ORDER BY",
      "A stored procedure body",
      "JOIN, WHERE, LIMIT",
    ],
    answer: 0,
    why: "`WITH RECURSIVE cnt(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM cnt WHERE x < 10)` — the anchor SELECT 1 seeds the queue, UNION ALL pipes results back, and the recursive arm re-reads cnt. The WHERE is the termination guard, not a structural part — but forgetting it is the classic infinite loop.",
  },
  {
    id: "kb-rc-q02", difficulty: "easy",
    prompt: "`WITH RECURSIVE cnt(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM cnt WHERE x < 10) SELECT COUNT(*) n, MAX(x) mx FROM cnt` returns…",
    choices: ["n = 10, mx = 10", "n = 9, mx = 9", "n = 100, mx = 10", "Infinite loop"],
    answer: 0,
    why: "The seed 1 enters the queue; each pass appends x + 1 while x < 10. Values run 1 through 10 — ten rows, max 10. The guard stops the NEXT step at 10 (10 < 10 is false), so the sequence is inclusive of the boundary.",
  },
  {
    id: "kb-rc-q03", difficulty: "medium",
    prompt: "Why does the seed row need no FROM clause — `SELECT 1` — in a counter CTE?",
    choices: [
      "The anchor just manufactures the starting value from nothing; no table is involved in generating a constant",
      "It is shorthand for FROM dual",
      "SQLite requires literal-only anchors",
      "The FROM is inherited from the recursive step",
    ],
    answer: 0,
    why: "Recursion here is data-generated, not table-driven: the anchor emits a literal row, and each step transforms the previous value. Table-driven recursion (org charts, bill-of-materials) seeds FROM a table instead — the anchor is whatever rows start the walk. The recursive CTE's anchor manufactures its own seed rows.",
  },
  {
    id: "kb-rc-q04", difficulty: "medium",
    prompt: "Sum 1..100 via recursive CTE returns which pair?",
    choices: ["s = 5050, n = 100", "s = 4950, n = 99", "s = 10100, n = 100", "s = NULL"],
    answer: 0,
    why: "The walk produces each integer 1..100 exactly once (100 rows), and SUM(x) aggregates to 5050 — Gauss's classic, computed by a queue. The seed-plus-increment shape turns any arithmetic series into a two-line CTE.",
  },
  {
    id: "kb-rc-q05", difficulty: "medium",
    prompt: "Evens below 20: `WITH RECURSIVE ev(x) AS (SELECT 2 UNION ALL SELECT x + 2 FROM ev WHERE x < 18) …` yields which set?",
    choices: ["2, 4, …, 18 — nine rows", "2, 4, …, 20 — ten rows", "1, 3, 5, …, 19", "Infinite"],
    answer: 0,
    why: "The step adds 2; the guard x < 18 refuses to continue FROM 18, so the walk emits 2, 4, …, 18 — nine rows. The anchor is 2, not 1, which makes every value even from the start.",
    notes: [{ choice: 1, why: "20 would require the guard x < 20 — boundary arithmetic: the last emitted value is the first value whose CONTINUATION fails the guard." }],
  },
  {
    id: "kb-rc-q06", difficulty: "hard",
    prompt: "Doubling walk: `SELECT 1 UNION ALL SELECT x * 2 FROM dbl WHERE x * 2 < 100` emits which sequence?",
    choices: ["1, 2, 4, 8, 16, 32, 64", "1, 2, 4, 8, 16, 32, 64, 128", "2, 4, 8, …", "64, 32, …, 1"],
    answer: 0,
    why: "Each step doubles; the guard tests the NEXT value (x * 2 < 100), so 64 survives (its double 128 fails) and 128 never emits. Seven rows. Testing the successor against the boundary is the guard style that keeps the emitted set clean of overshoot. The doubling recursive CTE tests the successor against the boundary.",
  },
  {
    id: "kb-rc-q07", difficulty: "medium",
    prompt: "UNION instead of UNION ALL in `WITH RECURSIVE w(x) AS (SELECT 1 UNION SELECT (x + 1) % 5 FROM w)` — why does it terminate?",
    choices: [
      "UNION deduplicates each new row against everything emitted; once the cycle 1,2,3,4,0 repeats 1, the duplicate is dropped and the queue drains",
      "UNION adds a LIMIT",
      "SQLite detects cycles heuristically",
      "It does not terminate",
    ],
    answer: 0,
    why: "The modulo walk never satisfies any WHERE guard — but UNION's dedupe refuses re-emitting 1. No new rows, queue empty, walk over: 1, 2, 3, 4, 0. UNION ALL would run forever; the dedupe IS the termination mechanism for cyclic walks.",
  },
  {
    id: "kb-rc-q08", difficulty: "easy",
    prompt: "What happens WITHOUT any guard or dedupe — `SELECT 1 UNION ALL SELECT x + 1 FROM cnt` — aggregated with SUM over the whole CTE?",
    choices: [
      "The recursion never stops and the aggregate waits forever — a hang (verified in this project's probe, which had to be killed)",
      "It returns NULL",
      "SQLite raises an error at parse time",
      "It returns 0",
    ],
    answer: 0,
    why: "No guard, no dedupe, and an aggregate that must consume every row before LIMIT could apply — the queue grows forever. The probe literally hung and had to be killed. Rule: every UNION ALL recursive CTE carries either a WHERE guard or a bounded outer consumer (bare SELECT … LIMIT).",
  },
  {
    id: "kb-rc-q09", difficulty: "hard",
    prompt: "`WITH RECURSIVE cnt(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM cnt) SELECT x FROM cnt LIMIT 5` — why does THIS terminate at 1..5 while the aggregate version hangs?",
    choices: [
      "A bare outer SELECT with LIMIT stops PULLING rows after 5 — the lazy queue simply stops being drained; an aggregate must consume the entire (infinite) queue first",
      "LIMIT kills the recursion server-side",
      "It also hangs",
      "The CTE is bounded by default",
    ],
    answer: 0,
    why: "Recursive CTEs stream: rows are produced on demand. LIMIT 5 tells the outer query to stop demanding after 5, so the recursion freezes mid-walk. Aggregates (SUM/COUNT/GROUP_CONCAT) must see every row to compute — with an infinite queue, 'every row' never arrives. Probed: 1, 2, 3, 4, 5.",
  },
  {
    id: "kb-rc-q10", difficulty: "medium",
    prompt: "Date spine: the CTE walks `date(d, '+1 day')` from the earliest order date to the latest. How many days does the order history span?",
    choices: ["424", "103", "14", "365"],
    answer: 0,
    why: "Orders run 2024-01-01 through 2025-02-27 — 424 consecutive days, each emitted once by the spine. The anchor pulls MIN(date(created_at)) via a scalar subquery; the step adds a day while d < MAX(date). Calendar spines turn sparse facts into continuous timelines for joins. The recursive CTE walks the calendar one date() step at a time.",
  },
  {
    id: "kb-rc-q11", difficulty: "medium",
    prompt: "Month spine `WITH RECURSIVE m(m) AS (SELECT '2024-01' UNION ALL SELECT strftime('%Y-%m', date(m || '-01', '+1 month')) FROM m WHERE m < '2025-02')` — how many rows to the data's last month?",
    choices: ["12", "14", "18", "24"],
    answer: 1,
    why: "From 2024-01 through 2025-02 inclusive — fourteen month labels. The step appends '-01', advances one month, and reformats; the guard compares TEXT month codes, which sort chronologically. Fourteen months cover the order history (424 days).",
  },
  {
    id: "kb-rc-q12", difficulty: "hard",
    prompt: "Why is TEXT comparison safe for month guards (`WHERE m < '2025-02'`) but risky for day guards?",
    choices: [
      "Zero-padded YYYY-MM codes sort chronologically as text; day math crosses month/year boundaries that naive text arithmetic mishandles — hence date() functions for days",
      "Text comparison is never safe",
      "Only ISO years sort correctly",
      "Days cannot be compared at all",
    ],
    answer: 0,
    why: "'2024-12' < '2025-01' holds because zero-padding aligns digits with significance. But '2024-02-28' + 1 day as text would be '2024-02-29' (wrong — not a leap year); date(d, '+1 day') knows the calendar. Months need no calendar knowledge; days do — use the date functions. Zero-padded month codes sort chronologically — the recursive CTE's TEXT-guard safety.",
  },
  {
    id: "kb-rc-q13", difficulty: "easy",
    prompt: "Which is the correct spelling for a recursive CTE named cnt with column x?",
    choices: [
      "WITH RECURSIVE cnt(x) AS (…)",
      "WITH cnt RECURSIVE (x) AS (…)",
      "WITH RECURSIVE cnt AS (x …)",
      "RECURSIVE WITH cnt(x) AS (…)",
    ],
    answer: 0,
    why: "The RECURSIVE keyword sits between WITH and the name; the column list follows the name in parentheses. One RECURSIVE token covers ALL CTEs in that WITH clause — recursive and plain CTEs can coexist under a single WITH RECURSIVE.",
  },
  {
    id: "kb-rc-q14", difficulty: "medium",
    prompt: "Can one WITH RECURSIVE clause define two independent recursive CTEs?",
    choices: [
      "Yes — probed: `WITH RECURSIVE a(x) AS (…), b(y) AS (…)` ran both walks (maxes 3 and 30)",
      "No — one recursive CTE per clause",
      "Only in Postgres",
      "Yes, but they cannot both be referenced",
    ],
    answer: 0,
    why: "Comma-separated definitions under one WITH RECURSIVE: a counts 1..3, b counts 10..30 by tens. Each may reference itself (and earlier-defined CTEs); the final SELECT consumes both. Verified on the seed engine: mx 3, my 30.",
  },
  {
    id: "kb-rc-q15", difficulty: "hard",
    prompt: "Name shadowing: `WITH customers AS (SELECT name FROM suppliers) SELECT COUNT(*) FROM customers` returns…",
    choices: [
      "6 — the CTE shadows the real customers table inside this statement",
      "16 — the real table wins",
      "An error — shadowing is illegal",
      "22 — both merged",
    ],
    answer: 0,
    why: "The CTE's name takes precedence for the statement's duration: the outer query reads the six supplier names. Legal but dangerous — shadowing a real table with a same-named CTE reads like the base table while meaning something else. Pick names that cannot collide. The CTE shadows the base table — the same statement scope the recursive CTE syntax uses.",
  },
  {
    id: "kb-rc-q16", difficulty: "medium",
    prompt: "CTE chain: `WITH eu AS (SELECT id, name FROM customers WHERE region = 'EU'), eu_orders AS (SELECT o.id, o.total FROM orders o INNER JOIN eu ON eu.id = o.customer_id) SELECT COUNT(*), SUM(total) FROM eu_orders` returns…",
    choices: ["45 orders, 15089.23", "8 orders, 15089.23", "103 orders", "0"],
    answer: 0,
    why: "The first CTE stages the 8 EU ids; the second consumes it like a table, joining orders. The chain reads top-down: filter the directory, then match the ledger — 45 orders worth 15089.23. Each stage stays small and legible. The two-stage chain — WITH RECURSIVE shares this staging syntax — reads top-down: filter the directory, match the ledger.",
  },
  {
    id: "kb-rc-q17", difficulty: "medium",
    prompt: "A CTE referenced twice in one statement — `WITH heavy AS (… HAVING COUNT(*) > 6) SELECT (SELECT COUNT(*) FROM heavy) a, (SELECT SUM(n) FROM heavy) b` — returns…",
    choices: ["a = 4, b = 68", "a = 4, b = 4", "a = 68, b = 68", "error — single reference only"],
    answer: 0,
    why: "Four heavy customers (Alice 24, Emma 17, Grace 14, Maya 13); their counts sum to 68. One definition, two consumers — the named-stage advantage over derived tables. (Engines may materialize or inline; semantics are single-definition either way.) One named stage, two consumers — the reuse the WITH RECURSIVE family's naming buys.",
  },
  {
    id: "kb-rc-q18", difficulty: "hard",
    prompt: "Nested WITH: `SELECT COUNT(*) n FROM (WITH t AS (SELECT id FROM orders WHERE status = 'pending') SELECT * FROM t)` returns…",
    choices: ["14 — WITH is legal inside a derived subquery", "A syntax error", "103", "0"],
    answer: 0,
    why: "SQLite accepts WITH at subquery depth: the parenthesized query declares its own private CTE scope and selects from it. Fourteen pending orders. Readability usually favors top-level WITH, but the nesting is real, legal, and occasionally the cleanest shape for staged logic inside a larger expression. WITH — WITH RECURSIVE included — is legal at subquery depth: a private CTE inside the derived table.",
  },
  {
    id: "kb-rc-q19", difficulty: "medium",
    prompt: "Misplaced WITH: `SELECT 1 UNION WITH x AS (SELECT 2) SELECT * FROM x` — what happens?",
    choices: [
      "Syntax error near WITH — a compound's arms are full SELECTs, and WITH belongs BEFORE the whole statement, not inside an arm",
      "It stacks 1 and 2",
      "It returns 2",
      "It silently ignores the WITH",
    ],
    answer: 0,
    why: "WITH is a statement-level prefix: it introduces named stages for the entire query. Inside a UNION arm it has no grammatical home — probed, SQLite throws 'near \"WITH\": syntax error'. The fix: WITH x AS (…) above the whole compound. WITH is a statement prefix, not an arm — the misplaced WITH RECURSIVE clause errors.",
  },
  {
    id: "kb-rc-q20", difficulty: "easy",
    prompt: "Which census keyword owns recursive walk items?",
    choices: [
      "WITH RECURSIVE — tagged by the 'with recursive'/'recursive cte' tokens",
      "WITH (CTE) only",
      "Derived tables",
      "Views",
    ],
    answer: 0,
    why: "The taxonomy splits named stages into WITH (CTE) for plain stages and WITH RECURSIVE for self-feeding ones. Note the matcher detail: `WITH RECURSIVE cnt(x) AS` does NOT match the plain CTE pattern (WITH name AS) — the RECURSIVE token sits between the name slots — so the two keywords count separately.",
  },
];
