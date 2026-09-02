import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson32: Lesson = {
  id: "lesson-32",
  num: 32,
  title: "Windows II — offsets & running totals",
  blurb: "LAG and LEAD read neighboring rows, SUM OVER accumulates, frames define the window, NTILE buckets",
  minutes: 14,
  blocks: [
    {
      kind: "p",
      text: "Ranking asks *where do I stand?* This lesson's windows ask *how did we get here?* **LAG** reads the previous row, **LEAD** the next, `SUM(…) OVER` accumulates as it walks, and **frames** decide exactly how much context each row sees. Put them on the month buckets from lesson 30 and you get the two queries every dashboard on earth repeats: month-over-month change and the running total.",
    },
    { kind: "diagram", figure: "t4-window" },
    {
      kind: "code",
      caption: "Month-over-month, the LAG way — prev is the whole trick",
      sql: `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n
  FROM orders GROUP BY mon
)
SELECT mon, n,
       LAG(n) OVER (ORDER BY mon) AS prev,
       n - LAG(n) OVER (ORDER BY mon) AS delta
FROM monthly
ORDER BY mon;   -- 2024-01 prev NULL · 2024-02 9 vs 8 → +1 …`,
    },
    { kind: "h", text: "LAG and LEAD — the row offsets" },
    {
      kind: "bullets",
      items: [
        "`LAG(x) OVER (ORDER BY mon)` — the previous row's `x`. First row has no predecessor: **NULL**, and any arithmetic on it inherits NULL (the delta column simply starts blank).",
        "`LEAD(x) OVER (…)` is the mirror — the NEXT row's value, NULL on the last row. Same rules, opposite direction.",
        "Both take options: `LAG(n, 2)` reads two rows back; `LAG(n, 1, 0)` supplies 0 as the default instead of NULL.",
        "**The ORDER BY inside OVER is mandatory here.** 'Previous' is meaningless without an order — a LAG over unordered rows is a random-number generator with extra steps.",
      ],
    },
    { kind: "diagram", figure: "t8-running-total" },
    { kind: "h", text: "The running total — SUM that remembers" },
    {
      kind: "code",
      caption: "Each month's revenue plus everything before it — 34833.28 at the end",
      sql: `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev
  FROM orders GROUP BY mon
)
SELECT mon, rev,
       SUM(rev) OVER (ORDER BY mon) AS running
FROM monthly
ORDER BY mon;   -- 3731.97 → 7341.61 → … → 34833.28`,
    },
    {
      kind: "bullets",
      items: [
        "The last row's running total **equals the plain SUM** — 34833.28, the store's lifetime revenue. Same truth, but every intermediate step is preserved: that's what makes it a report.",
        "With ORDER BY and no explicit frame, the default window is *everything from the first row to the current row* — exactly the running-total behavior.",
        "`PARTITION BY` works here too: `SUM(rev) OVER (PARTITION BY region ORDER BY mon)` restarts the accumulation per region.",
      ],
    },
    { kind: "h", text: "Frames — deciding how much each row sees" },
    {
      kind: "code",
      caption: "A 3-month moving average: the window shrinks to a sliding slice",
      sql: `SELECT mon, n,
       ROUND(AVG(n) OVER (ORDER BY mon
         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3
FROM monthly ORDER BY mon;
-- 2024-01: 8.00 (only itself) · 02: 8.50 · 03: 8.33 · 04: 8.00 …`,
    },
    {
      kind: "bullets",
      items: [
        "`ROWS BETWEEN a PRECEDING AND b FOLLOWING` — the frame is a sliding band of rows: `UNBOUNDED PRECEDING`, `n PRECEDING`, `CURRENT ROW`, `n FOLLOWING`, `UNBOUNDED FOLLOWING`.",
        "Frame edges clip at the data boundary: January's moving average averages ONE month, February's two — the first rows are honest but different.",
        "`NTILE(4) OVER (ORDER BY spend DESC)` cuts the rows into 4 equal buckets — with 16 customers, exactly 4 per quartile. Alice, Emma, Grace and Maya form the top quartile.",
      ],
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "Full frame support (ROWS and RANGE) since 3.28; LAG/LEAD since 3.25. The engine in this app handles every query in this lesson natively.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL 8.0 supports the same syntax, with one quirk: its default frame with ORDER BY is RANGE, like SQLite's — but NULL-keyed ordering behaves differently. Keep ORDER BY columns NOT NULL and the two engines agree.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres adds `GROUPS` frames and `RANGE BETWEEN INTERVAL`-style bounds over true timestamps. On plain counts and sums, the three engines' results are identical.",
    },
    {
      kind: "warn",
      text: "ROWS vs RANGE matters with ties: ROWS counts PHYSICAL rows (a 5-way tie occupies 5 slots), RANGE treats tied peers as one step (all 5 sit inside the same frame edge). On tie-free ORDER BY keys — month buckets, ids — they agree; on ties they quietly diverge.",
    },
    {
      kind: "tip",
      text: "You now own the dashboard pair: LAG for the change column, SUM OVER for the cumulative column — both built on the same month-bucket CTE. When a stakeholder asks 'are we trending up?', that query is the answer, and you wrote it from scratch.",
    },
  ],
  mcqs: [
    {
      id: "l32-q1",
      prompt: "The very first month (2024-01) runs `LAG(n) OVER (ORDER BY mon)`. What comes back?",
      choices: ["0", "NULL", "8 — itself", "An error — no previous row"],
      answer: 1,
      why: "No predecessor exists, so LAG returns NULL — and `n - LAG(n)` inherits it, which is why the delta column starts blank rather than at 0.",
      notes: [
        { choice: 0, why: "0 is a VALUE and would fake a trend ('flat first month'). NULL honestly says 'no comparison possible'. LAG(n, 1, 0) is how you'd opt INTO the zero." },
      ],
    },
    {
      id: "l32-q2",
      prompt: "With ORDER BY mon and no explicit frame, what does `SUM(rev) OVER (ORDER BY mon)` accumulate?",
      choices: [
        "All rows — the same total on every row",
        "From the first row through the current row — a running total",
        "Just the current row",
        "Undefined — a frame is required",
      ],
      answer: 1,
      why: "The default frame with ORDER BY is RANGE UNBOUNDED PRECEDING AND CURRENT ROW: everything up to now. That's why the bare spelling IS the running total.",
      notes: [
        { choice: 0, why: "That's the no-ORDER-BY window: the whole partition as one grand total per row. ORDER BY is what makes the boundary crawl forward." },
      ],
    },
    {
      id: "l32-q3",
      prompt: "The last row's running total (34833.28) equals what other query's answer?",
      choices: [
        "AVG(rev) — the average month",
        "SUM(rev) — the plain storewide total",
        "COUNT(rev) — the number of months",
        "Nothing — they're independent numbers",
      ],
      answer: 1,
      why: "The running total at the end has absorbed every row: exactly the plain SUM. Two shapes, one truth — the window version just keeps the journey visible.",
      notes: [
        { choice: 2, why: "COUNT would give 14 (months). The running total's final value is a SUM in window clothing — a useful self-check when a report looks off." },
      ],
    },
    {
      id: "l32-q4",
      prompt: "Why is `LAG(n) OVER ()` — no ORDER BY — dangerous?",
      choices: [
        "It's a syntax error",
        "'Previous row' is undefined without an order — you get an arbitrary neighbor",
        "It always returns NULL",
        "It duplicates every row",
      ],
      answer: 1,
      why: "Offsets are defined BY an order. Without one, the engine picks a physical order that can change between runs — LAG becomes a nondeterministic shuffle.",
      notes: [
        { choice: 0, why: "It parses fine — that's the trap. It runs, returns plausible numbers, and means nothing. Offsets demand ORDER BY inside OVER." },
      ],
    },
    {
      id: "l32-q5",
      prompt: "A 3-month moving average over 14 months: what does the FIRST row average?",
      choices: [
        "Three months — the frame borrows from the future",
        "Just itself — the frame clips at the data edge",
        "NULL — not enough history",
        "0",
      ],
      answer: 1,
      why: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW has nothing before the first row, so the window shrinks to one row: ma3 for January is 8.00, honest and different in kind.",
      notes: [
        { choice: 2, why: "No — the window still computes with what exists. NULL would be a design choice (many reports do prefer waiting for full windows — but that's explicit, not default)." },
      ],
    },
    {
      id: "l32-q6",
      prompt: "`NTILE(4) OVER (ORDER BY spend DESC)` over 16 customers gives…",
      choices: [
        "16 rows all labeled 1",
        "4 rows per bucket, 1 through 4 — Alice, Emma, Grace, Maya in bucket 1",
        "An error — 16 isn't divisible by 4",
        "Buckets sized 5, 5, 4, 3",
      ],
      answer: 1,
      why: "NTILE divides rows into N near-equal buckets — 16/4 is exactly 4 each, ordered by the window's ORDER BY (best spenders in bucket 1).",
      notes: [
        { choice: 3, why: "That's what uneven division produces — e.g. NTILE(4) over 10 rows gives 3, 3, 2, 2. With 16 rows the split is clean." },
      ],
    },
    {
      id: "l32-q7",
      prompt: "ROWS vs RANGE — where do they disagree?",
      choices: [
        "On tie-free ORDER BY keys",
        "On ties: ROWS counts physical rows, RANGE folds tied peers into one frame step",
        "Never — they're synonyms",
        "Only on the last row",
      ],
      answer: 1,
      why: "A 5-way tie spans 5 physical rows (ROWS) but one RANGE step — moving averages and running sums over tied keys diverge. Month buckets and ids are tie-free, so this course's queries agree.",
      notes: [
        { choice: 0, why: "Opposite — tie-free keys are exactly where they AGREE. The divergence hides in duplicate ORDER BY values." },
      ],
    },
    {
      id: "l32-q8",
      prompt: "Which window answers 'did this month beat the same-sized window last month' — the change column?",
      choices: [
        "n - LAG(n) OVER (ORDER BY mon)",
        "n - MIN(n) OVER ()",
        "n - FIRST_VALUE(n) OVER ()",
        "SUM(n) OVER (ORDER BY mon)",
      ],
      answer: 0,
      why: "LAG fetches the immediately previous bucket; the subtraction is the delta. FIRST_VALUE/MIN anchor to a fixed row (the first or smallest overall) — a different comparison.",
      notes: [
        { choice: 3, why: "That's the running total — cumulative, not comparative. The delta needs a NEIGHBOR (LAG), not an accumulation." },
      ],
    },
  ],
  problems: [
    {
      id: "l32-p1",
      title: "Every month meets its past",
      brief: "Monthly order counts with the previous month beside them: output `mon`, `n`, and `prev` = LAG(n) OVER (ORDER BY mon), calendar order. First prev is NULL.",
      hints: [
        "Bucket months in a CTE, then LAG over the bucket key in the outer query.",
        "Shape: WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon) SELECT mon, n, LAG(n) OVER (ORDER BY mon) AS prev FROM monthly ORDER BY mon;",
      ],
      difficulty: "easy",
      solution:
        "WITH monthly AS (\n  SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n\n  FROM orders GROUP BY mon\n)\nSELECT mon, n, LAG(n) OVER (ORDER BY mon) AS prev\nFROM monthly\nORDER BY mon;",
      mistakes: [
        { test: "\\blead\\s*\\(", message: "LEAD reads the NEXT month — the brief wants the previous one: LAG." },
        { test: "over\\s*\\(\\s*\\)", message: "An empty OVER leaves 'previous' undefined — LAG needs ORDER BY mon to know which row comes before." },
        { test: "lag\\s*\\(\\s*\\)\\s+over", message: "LAG takes the column to fetch: LAG(n) — empty parentheses fetch nothing." },
      ],
      expected: EXPECTED["l32-p1"],
      ordered: true,
    },
    {
      id: "l32-p2",
      title: "The revenue snowball",
      brief: "Running revenue total: output `mon`, `rev` (2 decimals), and `running` = SUM(rev) OVER (ORDER BY mon), calendar order. The last row reads 34833.28.",
      hints: [
        "Monthly revenue CTE, then the bare ORDER BY window — the default frame is the running total.",
        "Shape: WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev FROM orders GROUP BY mon) SELECT mon, rev, SUM(rev) OVER (ORDER BY mon) AS running FROM monthly ORDER BY mon;",
      ],
      difficulty: "easy",
      solution:
        "WITH monthly AS (\n  SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev\n  FROM orders GROUP BY mon\n)\nSELECT mon, rev, SUM(rev) OVER (ORDER BY mon) AS running\nFROM monthly\nORDER BY mon;",
      mistakes: [
        { test: "sum\\s*\\(\\s*rev\\s*\\)\\s+over\\s*\\(\\s*\\)", message: "An empty OVER puts the grand total (34833.28) on every row — the running total needs ORDER BY mon inside the OVER so the boundary crawls forward." },
        { test: "rows\\s+between", message: "No explicit frame needed — with ORDER BY mon the default window already runs from the first row to the current one. (Adding the explicit spelling is fine; the brief's shape is the bare one.)" },
        { test: "order\\s+by\\s+rev\\s+desc", message: "Calendar order — the running total only means something when the months walk in sequence." },
      ],
      expected: EXPECTED["l32-p2"],
      ordered: true,
    },
    {
      id: "l32-p3",
      title: "The delta column",
      brief: "Month-over-month change in order count: output `mon`, `n`, and `delta` = n − LAG(n) OVER (ORDER BY mon), calendar order.",
      hints: [
        "LAG appears TWICE — once to display prev is not needed; the delta is the column's own arithmetic over the offset value.",
        "Shape: WITH monthly AS (…) SELECT mon, n, n - LAG(n) OVER (ORDER BY mon) AS delta FROM monthly ORDER BY mon;",
      ],
      difficulty: "medium",
      solution:
        "WITH monthly AS (\n  SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n\n  FROM orders GROUP BY mon\n)\nSELECT mon, n, n - LAG(n) OVER (ORDER BY mon) AS delta\nFROM monthly\nORDER BY mon;",
      mistakes: [
        { test: "\\babs\\s*\\(", message: "No absolute value — the sign IS the story: +1 grew, −2 shrank. ABS would erase the direction the brief wants." },
        { test: "delta\\s*=\\s*n\\s*-\\s*prev", message: "There's no prev column in this output — reference the window directly: n - LAG(n) OVER (ORDER BY mon)." },
        { test: "\\blead\\s*\\(", message: "LEAD compares against the FUTURE month — the brief's delta is against the previous one." },
      ],
      expected: EXPECTED["l32-p3"],
      ordered: true,
    },
    {
      id: "l32-p4",
      title: "The smoothing pass",
      brief: "Three-month moving average of order counts: output `mon` and `ma3` = ROUND(AVG(n) OVER (ORDER BY mon ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2), calendar order.",
      hints: [
        "The frame is the whole exercise: 2 PRECEDING AND CURRENT ROW turns AVG into a sliding window that clips at the start.",
        "Shape: WITH monthly AS (…) SELECT mon, ROUND(AVG(n) OVER (ORDER BY mon ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3 FROM monthly ORDER BY mon;",
      ],
      difficulty: "medium",
      solution:
        "WITH monthly AS (\n  SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n\n  FROM orders GROUP BY mon\n)\nSELECT mon,\n  ROUND(AVG(n) OVER (ORDER BY mon\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3\nFROM monthly\nORDER BY mon;",
      mistakes: [
        { test: "unbounded\\s+preceding", message: "UNBOUNDED PRECEDING is the running-total frame — the moving average slides: 2 PRECEDING AND CURRENT ROW." },
        { test: "rows\\s+between\\s+2\\s+following", message: "FOLLOWING looks ahead — the brief's smoothing window trails the current month: 2 PRECEDING." },
        { test: "\\bround\\s*\\(\\s*avg\\s*\\(\\s*n\\s*\\)\\s*,\\s*2\\s*\\)\\s+as\\s+ma3\\s+from\\s+orders", message: "A plain AVG rounds the whole-table mean — the window form AVG(n) OVER (…) averages each sliding slice." },
      ],
      expected: EXPECTED["l32-p4"],
      ordered: true,
    },
    {
      id: "l32-p5",
      title: "Peek ahead",
      brief: "The mirror offset: output `mon`, `n`, and `nxt` = LEAD(n) OVER (ORDER BY mon), calendar order. The last month's nxt is NULL.",
      hints: [
        "LEAD is LAG's twin — same ORDER BY, opposite direction.",
        "Shape: WITH monthly AS (…) SELECT mon, n, LEAD(n) OVER (ORDER BY mon) AS nxt FROM monthly ORDER BY mon;",
      ],
      difficulty: "medium",
      solution:
        "WITH monthly AS (\n  SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n\n  FROM orders GROUP BY mon\n)\nSELECT mon, n, LEAD(n) OVER (ORDER BY mon) AS nxt\nFROM monthly\nORDER BY mon;",
      mistakes: [
        { test: "\\blag\\s*\\(", message: "LAG looks backward — the brief peeks at the NEXT month: LEAD." },
        { test: "lead\\s*\\(\\s*n\\s*,\\s*2\\s*\\)", message: "The 2 would skip a month — the default offset of 1 is the adjacent neighbor." },
        { test: "order\\s+by\\s+mon\\s+desc", message: "Descending order flips time — LEAD would then read backward and the calendar walk breaks." },
      ],
      expected: EXPECTED["l32-p5"],
      ordered: true,
    },
    {
      id: "l32-p6",
      title: "Spender quartiles",
      brief: "Cut the 16 customers into 4 spend buckets: output `name` and `quartile` from NTILE(4) OVER (ORDER BY spend DESC), sorted by quartile then biggest spend first. Alice leads bucket 1.",
      hints: [
        "Build per-customer spend in a CTE, then NTILE over the spend ranking.",
        "Shape: WITH spend AS (SELECT c.name AS name, SUM(o.total) AS s FROM customers c JOIN orders o ON … GROUP BY c.id) SELECT name, NTILE(4) OVER (ORDER BY s DESC) AS quartile FROM spend ORDER BY quartile, s DESC;",
      ],
      difficulty: "hard",
      solution:
        "WITH spend AS (\n  SELECT c.name AS name, SUM(o.total) AS s\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.id\n  GROUP BY c.id\n)\nSELECT name, NTILE(4) OVER (ORDER BY s DESC) AS quartile\nFROM spend\nORDER BY quartile, s DESC;",
      mistakes: [
        { test: "\\brank\\s*\\(|row_number", message: "Ranks number every row — NTILE assigns BUCKETS: 16 customers over 4 tiles, four per tile." },
        { test: "ntile\\s*\\(\\s*4\\s*\\)\\s+over\\s*\\(\\s*\\)", message: "An empty OVER can't order the customers — NTILE needs ORDER BY s DESC to know who lands in bucket 1." },
        { test: "order\\s+by\\s+s\\s+asc", message: "Ascending spend would put the smallest spenders in bucket 1 — the brief's top quartile is the biggest spenders: DESC." },
      ],
      expected: EXPECTED["l32-p6"],
      ordered: true,
    },
    {
      id: "l32-p7",
      title: "The shrinking months",
      brief: "Which months took LESS revenue than the month before? CTE with LAG, then keep the negative deltas. Output `mon`, `rev` (2 decimals), `prev_rev` (2 decimals), calendar order.",
      hints: [
        "Stage one: monthly revenue plus LAG(rev). Stage two: WHERE rev < prev_rev — the filter lives OUTSIDE the window.",
        "Shape: WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev, LAG(ROUND(SUM(total), 2)) OVER (ORDER BY mon) AS prev_rev FROM orders GROUP BY mon) SELECT mon, rev, prev_rev FROM m WHERE rev < prev_rev ORDER BY mon;",
      ],
      difficulty: "hard",
      solution:
        "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS mon,\n    ROUND(SUM(total), 2) AS rev,\n    LAG(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS prev_rev\n  FROM orders\n  GROUP BY strftime('%Y-%m', created_at)\n)\nSELECT mon, ROUND(rev, 2) AS rev, ROUND(prev_rev, 2) AS prev_rev\nFROM m\nWHERE rev < prev_rev\nORDER BY mon;",
      mistakes: [
        { test: "where\\s+rev\\s*<\\s*prev_rev[^;]*\\blag\\s*\\(", message: "Same-level filtering again — the LAG-computed column doesn't exist until after WHERE. Compute in the CTE, filter in the outer query." },
        { test: "\\blead\\s*\\(", message: "Comparing each month to the NEXT one asks 'will we shrink?' — the brief compares to the previous month: LAG." },
        { test: "\\bgroup\\s+by\\s+mon\\b", message: "Inside the CTE, group by the EXPRESSION strftime('%Y-%m', created_at) — the alias is defined in the same SELECT and isn't available to its own GROUP BY portably." },
      ],
      expected: EXPECTED["l32-p7"],
      ordered: true,
    },
    {
      id: "l32-p8",
      title: "Streak breakers",
      brief: "Per customer, in order of their orders: find the orders that took LESS than that customer's previous order. Output `id`, `customer_id`, `total`, and `prev_total` = LAG(total) OVER (PARTITION BY customer_id ORDER BY id), filtered to the drops, ordered by id.",
      hints: [
        "Stage one: per-customer time line (PARTITION BY customer_id ORDER BY id) with LAG(total). Stage two: keep total < prev_total.",
        "Shape: WITH t AS (SELECT id, customer_id, total, LAG(total) OVER (PARTITION BY customer_id ORDER BY id) AS prev_total FROM orders) SELECT id, customer_id, total, prev_total FROM t WHERE total < prev_total ORDER BY id;",
      ],
      difficulty: "hard",
      solution:
        "WITH t AS (\n  SELECT id, customer_id, total,\n    LAG(total) OVER (PARTITION BY customer_id ORDER BY id) AS prev_total\n  FROM orders\n)\nSELECT id, customer_id, total, prev_total\nFROM t\nWHERE total < prev_total\nORDER BY id;",
      mistakes: [
        { test: "partition\\s+by\\s+customer_id\\s+order\\s+by\\s+total", message: "Ordering by total inside the partition breaks the time line — 'previous order' means chronological: ORDER BY id." },
        { test: "over\\s*\\(\\s*order\\s+by\\s+id\\s*\\)\\s+as\\s+prev_total", message: "Without PARTITION BY customer_id, order #2's 'previous order' belongs to a different customer — the partition is what makes each customer's timeline independent." },
        { test: "\\bmax\\s*\\(|\\bmin\\s*\\(", message: "MIN/MAX compare against extremes — the brief compares against the IMMEDIATELY PREVIOUS order, which is LAG's exact job." },
      ],
      expected: EXPECTED["l32-p8"],
      ordered: true,
    },
  ],
  takeaway: "LAG/LEAD read neighbors (first/last row gets NULL), SUM OVER accumulates to a running total whose last row equals the plain SUM, frames slide the window, and NTILE buckets the field — the dashboard pair, built from scratch.",
};
