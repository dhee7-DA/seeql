// Drill set — Window judgment (Module 5, secondary, 40 questions).
// Engine-verified receipts (db/custom.db, SQLite 3.53): the spend leaderboard
// runs Alice Chen 7262.35 → Olivia Brown 444.80 over 16 customers with zero
// ties (RANK == DENSE_RANK == ROW_NUMBER on every row); rank by region NAME
// engineers a 5-way APAC tie at rank 1 with the EU block at RANK 6 /
// DENSE_RANK 2; the staged top-1-per-customer query (ROW_NUMBER in a CTE,
// WHERE rn = 1 outside) returns 16 rows led by Farid's order 74 at 1088.44 —
// the same-level alias filter dies verbatim "misuse of aliased window
// function rn", the inline one "misuse of window function ROW_NUMBER()";
// WHERE and HAVING window calls refuse "misuse of window function RANK()";
// RANK() without OVER → the same message; bare NTILE(4) → "misuse of window
// function NTILE()"; NTILE(0) → "argument of ntile must be a positive
// integer"; an aggregate wrapped around a window → "misuse of window
// function SUM()"; SUM(total) OVER () stamps 34833.28 on all 103 rows and
// the running SUM(total) OVER (ORDER BY id) ends there too = plain SUM
// (Alice's partition-scoped run ends 7262.35); PARTITION BY makes the
// denominator a constant — all 24 of Alice's rows divide by 7262.35, her top
// order is a 10.6% share, order 74 is 3.1% of the store, and staged shares
// sum to exactly 1; GROUP BY collapses 103 → 16 while the window keeps 103;
// COUNT(*) OVER () after WHERE status='pending' = 14 and the crowd's
// AVG(total) OVER () = 436.64 vs the storewide 338.19 (order 74 — the
// store's biggest order — is itself pending); MoM: 14 staged month buckets,
// LAG deltas 5 up / 8 down / 1 NULL, Feb −122.33, biggest drop Nov −1326.87,
// biggest jump Aug +1158.21 (+97%), first month NULL, LEAD's last NULL;
// NTILE(4) over 103 orders = 26/26/26/25 (extras to the earliest tiles),
// over 16 spenders 4/4/4/4 (tile 1: Alice/Emma/Grace/Maya), NTILE(3) =
// 6/5/5, NTILE(100) clamps to 16 singleton tiles, NTILE(1) = one tile of
// 16, NTILE(2.5) coerces to 2 (8/8); month-count rank blocks RANK 1/3/7/12
// vs DENSE 1–4 (9:×2, 8:×4, 7:×5, 6:×3); LAG per customer → 16 NULLs, a
// single walk → 1 NULL, LAG over ORDER BY shipped_at → 22 NULLs (the 21
// unshipped sort first ascending); the self-join 'predecessors' spelling
// fans out to 624 pairs vs correlated MAX = 103 rows / 16 NULLs = LAG;
// windows on empty input → 0 rows and never add rows; DISTINCT RANK()
// OVER () = 1 (all peers); the ship-lag metric 2.98 days runs over
// COUNT(shipped_at) = 82 of 103 rows; status census cancelled 7 / delivered
// 52 / pending 14 / shipped 30.

import type { DrillQ } from "../types";

const KW = "Window judgment";

export const WINDOW_JUDGMENT_DRILL: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr5-wj-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "You want each customer's biggest order. Which query is legal exactly as written?",
    choices: [
      "`WITH ranked AS (SELECT id, customer_id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) rn FROM orders) SELECT id, total FROM ranked WHERE rn = 1`",
      "`SELECT id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) rn FROM orders WHERE rn = 1`",
      "`SELECT id FROM orders WHERE ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) = 1`",
      "`SELECT customer_id FROM orders GROUP BY customer_id HAVING ROW_NUMBER() OVER (ORDER BY total DESC) = 1`",
    ],
    answer: 0,
    why: "The window computes in the CTE; the rn = 1 filter runs in the outer query — the two-step top-1 shape. Probed: it returns 16 rows, one winner per customer, led by Farid's 1088.44. Every same-level variant is refused by the evaluation-order law.",
    notes: [
      { choice: 1, why: "Probed verbatim: 'misuse of aliased window function rn' — WHERE runs before the window exists, alias or not." },
      { choice: 2, why: "Inlined into WHERE it's 'misuse of window function ROW_NUMBER()' — same law, no alias to blame." },
      { choice: 3, why: "HAVING refuses it identically: probed 'misuse of window function ROW_NUMBER()'. Gates run before windows on every engine." },
    ],
  },
  { id: "dr5-wj-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which OVER spelling makes a ROW_NUMBER-based dedupe repeatable — the same winner every run?",
    choices: [
      "`OVER ()`",
      "`OVER (ORDER BY total DESC, id)` — the key plus a unique tiebreaker",
      "`OVER (ORDER BY total DESC)`",
      "`OVER (PARTITION BY customer_id)`",
    ],
    answer: 1,
    why: "ROW_NUMBER is unique but arbitrary on ties; a fully deterministic ORDER BY — ranking key, then a unique column like id — pins which row takes rn 1. Probed: order totals never tie in this store, but the id guard is what makes the contract explicit instead of lucky.",
    notes: [
      { choice: 0, why: "Empty OVER still hands out unique numbers — but 'row 1' means nothing, and the physical walk order can change between runs." },
      { choice: 3, why: "PARTITION alone doesn't order anything inside the partition — ROW_NUMBER would number an unordered crowd, still arbitrary." },
    ],
  },
  { id: "dr5-wj-03", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which line deals the 16 customers into four near-equal spend quartiles?",
    choices: [
      "`NTILE(4)`",
      "`QUARTILE(spend) OVER (ORDER BY spend DESC)`",
      "`NTILE(4) OVER (ORDER BY spend DESC)`",
      "`NTILE() OVER (ORDER BY spend DESC)`",
    ],
    answer: 2,
    why: "NTILE takes the bucket count as its argument and the ranking inside OVER: probed, NTILE(4) over the 16 spenders deals 4/4/4/4 with Alice, Emma, Grace and Maya in tile 1. SQLite has no QUARTILE function — that's Excel spelling.",
    notes: [
      { choice: 0, why: "Missing OVER is refused verbatim: 'misuse of window function NTILE()'. The OVER clause is what makes any window function a window." },
      { choice: 3, why: "The argument can't be empty — NTILE must be told how many buckets to deal." },
    ],
  },
  { id: "dr5-wj-04", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Where is a window function allowed to live in a SELECT query?",
    choices: [
      "In WHERE, to filter on the rank directly",
      "In HAVING, to keep the rank-1 groups",
      "In the SELECT list — and in the outer ORDER BY",
      "Anywhere a column name would work",
    ],
    answer: 2,
    why: "Windows are computed in the SELECT stage — after WHERE and HAVING have finished, alongside GROUP BY's aggregates. Probed: `ORDER BY RANK() OVER (ORDER BY total)` runs fine, while the same call inside WHERE or HAVING dies with 'misuse of window function RANK()'.",
    notes: [
      { choice: 3, why: "The tempting half-truth: windows do behave like columns — but only AFTER the filter stages are done. That's why filtering on one always takes a wrap." },
    ],
  },

  // ---------- semantics ----------
  { id: "dr5-wj-05", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`SUM(total) OVER (PARTITION BY customer_id)` vs `SUM(total) … GROUP BY customer_id` — same arithmetic. What differs?",
    choices: [
      "The window errors — SUM needs GROUP BY",
      "The window returns 16 rows too, just unsorted",
      "GROUP BY keeps the rows; the window collapses them",
      "Row count: the window keeps all 103 order rows, GROUP BY emits 16 summary rows",
    ],
    answer: 3,
    why: "Probed: the windowed query counts 103 rows; the GROUP BY version counts 16. Same per-customer values, opposite shapes — the window annotates, GROUP BY collapses. Choose by the shape the report needs, not by which looks faster.",
    notes: [
      { choice: 2, why: "Backwards — the classic mix-up. An aggregate without OVER collapses; adding OVER keeps every row and stamps the group's value on each." },
    ],
  },
  { id: "dr5-wj-06", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does `SELECT id, SUM(total) OVER () FROM orders` put on each row?",
    choices: [
      "That order's own total",
      "34833.28 — the storewide grand total, identical on every row",
      "A running total that grows row by row",
      "NULL — an empty OVER has nothing to sum",
    ],
    answer: 1,
    why: "Empty OVER makes the whole table one partition where every row is a peer: probed, all 103 rows carry 34833.28. Add ORDER BY and the boundary crawls (running total); add PARTITION BY and it re-bases per group. The clause inside OVER IS the semantics.",
    notes: [
      { choice: 2, why: "That's what ORDER BY inside OVER adds — without it there's no walking boundary, just one grand constant stamped everywhere." },
    ],
  },
  { id: "dr5-wj-07", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "Each order's share of its customer's spend: `total / SUM(total) OVER (PARTITION BY customer_id)`. What is true of the denominator?",
    choices: [
      "It varies row by row — it's a running total",
      "It's the storewide 34833.28 on every row",
      "It's one constant per customer: all 24 of Alice's rows divide by 7262.35",
      "It's NULL unless you GROUP BY first",
    ],
    answer: 2,
    why: "PARTITION BY turns SUM into a partition-wide constant: probed, Alice's 24 rows all see 7262.35, so her biggest order (767.64) computes a 10.6% share. That constant-per-partition behavior is exactly what makes '% of group total' a one-liner.",
    notes: [
      { choice: 1, why: "The storewide constant is what `OVER ()` (no partition) gives — swapping the scope silently changes whose total you're measuring against." },
    ],
  },
  { id: "dr5-wj-08", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "The running total `SUM(total) OVER (ORDER BY id)` ends at 34833.28. What else equals that number?",
    choices: [
      "The plain `SUM(total)` — the window has absorbed every row by the end",
      "AVG(total) — the mean order",
      "COUNT(*) — the 103 orders",
      "Nothing — the running total drifts from the real sum",
    ],
    answer: 0,
    why: "Probed reconciliation: the last running value equals the plain storewide SUM, 34833.28. Same truth, two shapes — the window just keeps every intermediate step visible, which is what makes it a report instead of a number.",
    notes: [
      { choice: 2, why: "COUNT(*) gives 103 (rows). The final running value is a SUM in window clothing — a free checksum whenever a cumulative report looks off." },
    ],
  },
  { id: "dr5-wj-09", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`LAG(id) OVER (PARTITION BY customer_id ORDER BY id)` over all 103 orders — how many rows get NULL?",
    choices: [
      "0 — LAG wraps around to the customer's last order",
      "1 — the store's very first order",
      "16 — each customer's first order",
      "103 — LAG is NULL without a default",
    ],
    answer: 2,
    why: "PARTITION BY fences the offset: LAG walks each customer's sequence independently, so all 16 first orders have no predecessor. Probed: 16 NULLs. Drop the PARTITION and the whole table becomes one walk — a single NULL, and every later customer's first order reads some other customer's order instead.",
    notes: [
      { choice: 1, why: "That's the no-PARTITION census. The partition boundary is what multiplies the 'no previous row' edges to one per customer." },
    ],
  },
  { id: "dr5-wj-10", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`SELECT COUNT(*) OVER () FROM orders WHERE status = 'pending'` — what does the window count?",
    choices: [
      "103 — windows always see the whole table",
      "14 — the rows that survived WHERE",
      "30 — every order that ever shipped",
      "0 — windows can't run after a filter",
    ],
    answer: 1,
    why: "WHERE runs first; the window is computed on the survivors. Probed: 14, the pending crowd — not the table's 103. Every window on a filtered query is a window over the post-filter crowd: a feature for crowd stats, a trap for anyone assuming table-wide numbers.",
    notes: [
      { choice: 0, why: "Backwards — and it's why an AVG(total) OVER () on a filtered query silently re-bases: the pending crowd averages 436.64, not the storewide 338.19." },
    ],
  },
  { id: "dr5-wj-11", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "NTILE(4) over the 16 spenders vs CASE bands on spend — what's the fundamental difference?",
    choices: [
      "None — they're two spellings of the same quartiles",
      "CASE bands split by count; NTILE uses the thresholds you name",
      "NTILE splits by COUNT — 4 rows per tile here; CASE bands split by VALUE lines you draw",
      "NTILE works only on money columns",
    ],
    answer: 2,
    why: "Probed: NTILE(4) deals 4/4/4/4 — equal COUNTS whatever the values (Alice, Emma, Grace, Maya in tile 1). A CASE like `spend >= 5000` draws value lines and lands wherever the data falls. Equal-sized segments → NTILE; business-meaningful cut points → CASE.",
    notes: [
      { choice: 0, why: "They agree only by coincidence: the value band spend >= 5000 holds just Alice and Emma — two rows — while NTILE's tile 1 always holds four." },
    ],
  },
  { id: "dr5-wj-12", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "The MoM recipe stages month buckets in a CTE, then LAGs in the outer query. What does the outer LAG actually walk?",
    choices: [
      "All 103 orders, one LAG per order",
      "Only the months that grew vs last month",
      "The raw created_at strings, sorted",
      "The 14 staged month rows — one value per bucket",
    ],
    answer: 3,
    why: "Staging separates two aggregations: GROUP BY folds 103 orders into 14 monthly rows, then LAG walks those 14. Probed: February reads 3609.64 against January's 3731.97 for a −122.33 delta. LAG directly over raw orders would find the previous ORDER — some other customer's, some other day.",
    notes: [
      { choice: 0, why: "That's the wrong-grain bug: the 'previous month' would actually be another order. Buckets first, offsets second." },
    ],
  },

  // ---------- edge ----------
  { id: "dr5-wj-13", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "In the MoM delta `spend - LAG(spend) OVER (ORDER BY mon)`, what does the first month's delta show?",
    choices: [
      "0 — a flat start",
      "The first month's own spend",
      "An error — the neighbor is missing",
      "NULL — there is no previous month",
    ],
    answer: 3,
    why: "LAG's first row has no predecessor: NULL, and the subtraction inherits it. Probed over the 14 staged months: 5 ups, 8 downs, and that 1 honest blank at 2024-01. NULL keeps 'no comparison possible' distinct from 'no change'.",
    notes: [
      { choice: 0, why: "Zero is a value you'd be inventing — it fakes a flat month. LAG(spend, 1, 0) is how you opt INTO a zero when you truly want one." },
    ],
  },
  { id: "dr5-wj-14", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`NTILE(4) OVER (ORDER BY id)` across 103 orders — how do the tiles size out?",
    choices: [
      "26 / 26 / 26 / 25 — the extras go to the earliest tiles",
      "25 / 25 / 25 / 28 — the extras go to the last tile",
      "It errors — 103 isn't divisible by 4",
      "All four tiles get 25.75 rows",
    ],
    answer: 0,
    why: "103 = 4×25 + 3, and NTILE deals the remainder to the front buckets: probed 26/26/26/25. Any 'top quartile' cut over this table is 26 rows deep — the boundary sits inside tile 1's last row, not at a clean 25.75.",
    notes: [
      { choice: 1, why: "Extras land EARLY, not late — bucket 1 grows. Quartile membership flips if you assume the remainder lands at the end." },
    ],
  },
  { id: "dr5-wj-15", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "The pending orders are all gone. What does `SELECT id, RANK() OVER (ORDER BY total) FROM orders WHERE 1=0` return?",
    choices: [
      "One row with rank 0",
      "An error — windows need rows to rank",
      "Zero rows — windows never add rows",
      "103 rows of NULLs",
    ],
    answer: 2,
    why: "Probed: windows over empty input produce zero rows — a window decorates rows that exist, it never manufactures them. That's unlike a bare aggregate, which returns one row (SUM = NULL) over an empty set; windows have no such degenerate row.",
    notes: [
      { choice: 1, why: "Not so — the query runs clean and hands back nothing. That 0-row silence is why a 'top 3 pending' report can legitimately come back empty." },
    ],
  },
  { id: "dr5-wj-16", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`LAG(shipped_at) OVER (ORDER BY shipped_at)` over all 103 orders — where do the 21 unshipped rows (NULL shipped_at) land, and what do they do?",
    choices: [
      "They're skipped — LAG ignores NULL values",
      "They sort last and break the chain",
      "They error — LAG can't order NULLs",
      "They sort first (ascending) and hand NULL to the row behind them — 22 NULL LAG values",
    ],
    answer: 3,
    why: "SQLite sorts NULLs first ascending, so the 21 NULL ship dates occupy positions 1–21; their own LAGs are NULL, and row 22's LAG reads the last NULL too. Probed: 22 NULLs. A missing-value cluster quietly poisons its innocent neighbor — check what the NULLs did to the walk.",
    notes: [
      { choice: 0, why: "LAG doesn't skip anything — it returns the previous row's value, and NULL IS that value. NULLS LAST in the ORDER BY is how you move the hole to the end instead." },
    ],
  },
  { id: "dr5-wj-17", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Rank the customers by region NAME: five APAC rows tie at rank 1. What does the EU block get?",
    choices: [
      "RANK 6 and DENSE_RANK 2 — gap vs no gap",
      "RANK 2 and DENSE_RANK 2 — a tie is a tie",
      "RANK 6 and DENSE_RANK 6 — both count positions",
      "An error — a five-way tie overflows RANK",
    ],
    answer: 0,
    why: "Probed: the five APAC customers share rank 1; the eight EU customers land at RANK 6 (positions 1–5 consumed) but DENSE_RANK 2 (second tie group). Same data, one word apart — the ranker choice changes the story the numbers tell.",
    notes: [
      { choice: 1, why: "That's the DENSE side only. RANK's gap IS the message: 'five tied ahead of you' versus 'you're in the second tier'." },
    ],
  },
  { id: "dr5-wj-18", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`NTILE(100) OVER (ORDER BY id)` over the 16 customers — what comes back?",
    choices: [
      "An error — more tiles than rows",
      "16 buckets of exactly 1 row; tiles 17–100 don't exist",
      "100 buckets, most of them empty",
      "One bucket holding all 16",
    ],
    answer: 1,
    why: "Probed: tiles clamp to the row count — 16 rows yield 16 singleton buckets numbered 1..16. The mirror case, NTILE(1), puts all 16 rows in a single bucket. NTILE never errors on a strange N; it just deals with the rows it has.",
    notes: [
      { choice: 2, why: "Empty tiles are never emitted — a tile with no rows simply doesn't appear. Percentile-style requests on tiny tables degrade to plain row numbers." },
    ],
  },
  { id: "dr5-wj-19", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`SELECT DISTINCT RANK() OVER () FROM orders` — what does it return?",
    choices: [
      "1 — with no ORDER BY, every row is everyone's peer",
      "103 — one rank per row",
      "NULL — no ORDER BY, no rank",
      "An error — RANK requires an ORDER BY",
    ],
    answer: 0,
    why: "With nothing inside OVER, all 103 rows form one peer group: probed, the single distinct value is 1. ORDER BY inside OVER is what creates differentiation — no order, no competition, everyone ties for first. Legal, plausible, and meaningless.",
    notes: [
      { choice: 1, why: "Numbers-everywhere is ROW_NUMBER's behavior; RANK over an unordered window has nothing to differentiate, so it hands out one shared rank." },
    ],
  },

  // ---------- errors ----------
  { id: "dr5-wj-20", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT id, ROW_NUMBER() OVER (ORDER BY total DESC) rn FROM orders WHERE rn = 1` — what does SQLite say?",
    choices: [
      "'no such column: rn' — rename the alias",
      "'wrong number of arguments to ROW_NUMBER'",
      "It runs and returns the 16 cheapest orders",
      "'misuse of aliased window function rn' — stage the window, filter outside",
    ],
    answer: 3,
    why: "Probed verbatim. WHERE runs before windows are computed, and an alias pointing at one is refused by name. The fix is structural, not cosmetic: put ROW_NUMBER in a CTE or derived table, filter rn = 1 outside — probed, that shape returns 16 rows.",
    notes: [
      { choice: 0, why: "The message would be kinder if it were that — SQLite explicitly names the WINDOW alias to point at the real law: evaluation order, not naming." },
    ],
  },
  { id: "dr5-wj-21", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT id FROM orders WHERE RANK() OVER (ORDER BY total) = 1` — the error, and what does the HAVING twin say?",
    choices: [
      "'syntax error near OVER' — windows aren't allowed in predicates",
      "'misuse of window function RANK()' — the identical message from HAVING",
      "'no such function: RANK'",
      "It runs but returns every row",
    ],
    answer: 1,
    why: "Probed verbatim at both gates: WHERE and HAVING reject the window with 'misuse of window function RANK()'. The wording is the diagnosis — the function is fine; its position misuses it. Wrap the windowed query and filter outside.",
    notes: [
      { choice: 0, why: "Nothing wrong syntactically — it parses. The refusal is semantic: the filters run before the rank exists to be filtered on." },
    ],
  },
  { id: "dr5-wj-22", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT RANK() FROM orders` — RANK with no OVER clause. What happens?",
    choices: [
      "Returns 1 for every row — an empty window means no competition",
      "Returns NULL — nothing to rank",
      "'misuse of window function RANK()' — OVER is what makes it a window",
      "'syntax error near FROM'",
    ],
    answer: 2,
    why: "Probed: without OVER, SQLite refuses the call with 'misuse of window function RANK()'. The legal everyone-ties form is `RANK() OVER ()` — the clause itself is never optional, and its emptiness (not its absence) is what means 'all peers'.",
    notes: [
      { choice: 0, why: "That's what RANK() OVER () gives — but it needs the OVER. The bare spelling never runs." },
    ],
  },
  { id: "dr5-wj-23", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`NTILE(0) OVER (ORDER BY id)` — what does the engine say?",
    choices: [
      "Returns every row in tile 0",
      "Silently treats 0 as 1",
      "'no such function: NTILE'",
      "'argument of ntile must be a positive integer'",
    ],
    answer: 3,
    why: "Probed verbatim: NTILE's argument must be a positive integer — zero buckets is a contradiction the engine refuses outright. NTILE(2.5) by contrast sails through, coerced to 2 (probed 8/8 over 16 rows), so it's zero and negatives that die.",
    notes: [
      { choice: 1, why: "No silent fix-ups here — unlike the fractional case, zero gets a hard error. Read it as the engine defending the meaning of 'bucket'." },
    ],
  },
  { id: "dr5-wj-24", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT SUM(total / SUM(total) OVER ()) FROM orders` — one query, share-of-revenue folded into a grand sum. Why does it fail?",
    choices: [
      "'division by zero' — the window returns 0",
      "'no such column: total' — the inner SUM hides it",
      "'misuse of window function SUM()' — an aggregate can't wrap a window; stage the shares first",
      "It works and returns 1.0",
    ],
    answer: 2,
    why: "Probed verbatim: the outer SUM is a plain aggregate, and aggregates may not swallow window calls. The working shape stages first: `WITH s AS (SELECT total, total / SUM(total) OVER () AS share FROM orders) SELECT SUM(share) FROM s` — probed, exactly 1.0.",
    notes: [
      { choice: 3, why: "The number is right — probed, the 103 staged shares sum to exactly 1 — but only through the staged shape. The one-liner is refused, not rewarded." },
    ],
  },

  // ---------- predict ----------
  { id: "dr5-wj-25", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: the staged top-1-per-customer query (ROW_NUMBER PARTITION BY customer_id, outer WHERE rn = 1) — how many rows, and who owns the biggest winner?",
    choices: [
      "1 row — Alice's biggest order, 767.64",
      "103 rows — every order survives",
      "16 rows — Farid Nasser's order 74 at 1088.44 tops them",
      "24 rows — one per Alice order",
    ],
    answer: 2,
    why: "rn = 1 exists once per partition: 16 customers → 16 rows. Probed winners' board: Farid's 1088.44 is the biggest single order in the store, then Chloe's 945.21 and Emma's 845.92. PARTITION + rn filter is the per-group champion machine.",
  },
  { id: "dr5-wj-26", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: Alice tops the spend leaderboard at 7262.35. What are her RANK(), DENSE_RANK() and ROW_NUMBER()?",
    choices: [
      "1, 1, 2 — the rankers disagree at the top",
      "1, 2, 1",
      "1, 1, NULL",
      "1, 1, 1 — no ties anywhere, all three agree",
    ],
    answer: 3,
    why: "Probed: all 16 spends are distinct (the tie census over per-customer sums comes back empty), so RANK = DENSE_RANK = ROW_NUMBER for every row — Alice 1/1/1 down to Olivia's 444.80 at 16/16/16. Ranker choice only matters when ties appear.",
    notes: [
      { choice: 0, why: "Disagreement needs a tie. With 16 distinct values the three contracts coincide exactly — this leaderboard is ranker-proof." },
    ],
  },
  { id: "dr5-wj-27", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `NTILE(4) OVER (ORDER BY spend DESC)` over the 16 customers — who lands in tile 1?",
    choices: [
      "Olivia, Dmitri, Jamal, Liam — the bottom four spenders",
      "One customer per tile",
      "All 16 — one tile",
      "Alice, Emma, Grace, Maya — the top four spenders",
    ],
    answer: 3,
    why: "Probed: 4/4/4/4 with tile 1 = Alice (7262.35), Emma (6640.56), Grace (4574.23), Maya (3644.56). DESC ordering makes tile 1 the top quartile; flip the ORDER BY and tile 1 becomes the budget quartile instead.",
  },
  { id: "dr5-wj-28", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT COUNT(*) OVER (), AVG(total) OVER () FROM orders WHERE status = 'pending'`.",
    choices: [
      "103 and 338.19 — the whole table",
      "14 and 436.64 — the pending crowd's own size and average",
      "14 and 338.19",
      "0 and NULL",
    ],
    answer: 1,
    why: "The window sees the post-filter crowd: probed, 14 pending rows averaging 436.64 — well above the storewide 338.19, because the pending pile contains the store's biggest order (1088.44). Filter first, and every window statistic silently re-bases to the survivors.",
    notes: [
      { choice: 0, why: "That's what the numbers would be without the WHERE. The filter re-bases both statistics — the count AND the average." },
    ],
  },
  { id: "dr5-wj-29", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict the row count: `SELECT COUNT(*) FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND b.id < a.id` — the self-join spelling of 'every order with its predecessors'.",
    choices: [
      "103 — one pair per order",
      "624 — every within-customer pair fans out",
      "16 — one per customer",
      "0 — the ON clause kills it",
    ],
    answer: 1,
    why: "Probed: 624. The self-join doesn't find THE previous order — it finds ALL earlier orders per customer (Alice's 24 orders alone contribute 276 pairs). LAG answers 'previous' in one pass over 103 rows; the bare join answers 'all ancestors', 624 rows of them.",
    notes: [
      { choice: 0, why: "One row per order is LAG's contract — or the correlated MAX(id) spelling, which probed also lands on 103 rows with 16 NULLs. The bare self-join fans out." },
    ],
  },
  { id: "dr5-wj-30", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: rank the 14 months by order count DESC (counts: two 9s, four 8s, five 7s, three 6s). What does RANK() hand the two 9-order months, and the first 8-order month?",
    choices: [
      "1 and 1 — the tie merges the groups",
      "1, 1, then 3 — the tie group consumes positions 1–2",
      "1, 2 — ROW_NUMBER spelling",
      "1, 1, then 14 — RANK counts from the bottom",
    ],
    answer: 1,
    why: "Probed blocks: the two 9-order months (2024-02 and 2024-09) share rank 1; the four 8-order months land at rank 3; then 7-order months at 7 and 6-order months at 12. DENSE_RANK would say 1, 2, 3, 4 — the gap arithmetic is RANK's whole message.",
    notes: [
      { choice: 0, why: "RANK never merges tie groups into one number — it keeps them EQUAL and then skips ahead. Distinct rank values: 1, 3, 7, 12." },
    ],
  },
  { id: "dr5-wj-31", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: each customer's share of storewide revenue via `100.0 * SUM(total) / SUM(SUM(total)) OVER ()` with GROUP BY customer_id — Alice's slice?",
    choices: [
      "100% — the window constant is her own spend",
      "20.8% — 7262.35 of the store's 34833.28",
      "3.1% — her biggest order's share",
      "6.4% — her order count over 103",
    ],
    answer: 1,
    why: "Probed: the GROUP BY folds spends first (Alice 7262.35), then SUM(SUM(total)) OVER () stamps the storewide 34833.28 on every group — 20.8% for Alice, 19.1% Emma, 13.1% Grace. Windows in a GROUP BY query compute AFTER the collapse, so they see the 16 group rows.",
    notes: [
      { choice: 2, why: "3.1% is the biggest single ORDER's share of the store (1088.44 of 34833.28) — per-order grain, not per-customer." },
    ],
  },
  { id: "dr5-wj-32", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict the MoM revenue deltas from the staged 14-month pipeline: February, the biggest drop, the biggest jump.",
    choices: [
      "Feb +122.33; biggest drop Aug; biggest jump Nov",
      "Feb −122.33; biggest drop Mar (−992.56); biggest jump Sep (+763.97)",
      "Feb 0 — the first month starts flat",
      "Feb −122.33; biggest drop Nov (−1326.87); biggest jump Aug (+1158.21, +97%)",
    ],
    answer: 3,
    why: "Probed: February reads 3609.64 against January's 3731.97 → −122.33; November's −1326.87 (2975.67 → 1648.80) is the deepest cut; August's +1158.21 (1193.86 → 2352.07) is the biggest jump, a +97% month. Sign census over 14 months: 5 ups, 8 downs, 1 NULL.",
    notes: [
      { choice: 2, why: "The first month's delta is NULL, not 0 — 'no previous month' is not 'no change'. The 5/8/1 census counts that blank separately." },
    ],
  },
  { id: "dr5-wj-33", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT COUNT(*) FROM (SELECT LAG(id) OVER (ORDER BY id) p FROM orders) WHERE p IS NULL`.",
    choices: [
      "1 — only the store's first order",
      "16 — one per customer",
      "0 — LAG never returns NULL",
      "103",
    ],
    answer: 0,
    why: "Probed: 1. A single walk over ORDER BY id has exactly one row with no predecessor. The 16-NULL census appears only once you PARTITION BY customer_id — the partition count IS the NULL count at the walk's edges. Counting the NULLs tells you the window's shape.",
    notes: [
      { choice: 1, why: "That's the PARTITION BY customer_id census — the fence creates one 'no previous row' per customer. No partition, one walk, one NULL." },
    ],
  },

  // ---------- judgment ----------
  { id: "dr5-wj-34", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Ops wants every order row kept, each stamped with its customer's lifetime spend. Which tool?",
    choices: [
      "GROUP BY customer_id — one row per customer is cleaner",
      "DISTINCT — dedupe to one row per customer",
      "SUM(total) OVER (PARTITION BY customer_id) — annotate without collapsing",
      "A correlated subquery — windows are only for ranks",
    ],
    answer: 2,
    why: "The brief says 'every order row kept' — that's the window's contract: probed, 103 rows out, each carrying its customer's constant (7262.35 on all 24 of Alice's). GROUP BY answers the other brief ('totals per customer') with 16 rows. Match the tool to the required shape.",
    notes: [
      { choice: 0, why: "It computes the same 7262.35 — then deletes 87 rows the brief asked you to keep. Shape first, arithmetic second." },
    ],
  },
  { id: "dr5-wj-35", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Three jobs: a sports-style leaderboard, a deterministic top-1-per-group filter, membership tiers with no skipped numbers. Which ranker for each?",
    choices: [
      "RANK / ROW_NUMBER / DENSE_RANK",
      "ROW_NUMBER / RANK / DENSE_RANK",
      "DENSE_RANK / RANK / ROW_NUMBER",
      "Any of them — they're interchangeable",
    ],
    answer: 0,
    why: "RANK's gaps tell the leaderboard story (after a 5-way tie at 1, next is 6 — probed on the region ranking); ROW_NUMBER's uniqueness is what rn = 1 filtering needs; DENSE_RANK's gapless 1, 2 matches tiers (EU lands at 2, not 6). Same input, three different truth-tellings.",
    notes: [
      { choice: 3, why: "Interchangeable only with zero ties — probed, all three agree 1..16 on the distinct spend leaderboard. The 5-way APAC tie is exactly where the choice starts to matter." },
    ],
  },
  { id: "dr5-wj-36", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A teammate calls the CTE before `WHERE rn <= 3` 'optional style' and tries to inline the filter. Verdict?",
    choices: [
      "Fair — CTEs are cosmetic; the inline version works",
      "The wrap is the law: WHERE runs before windows exist, so filtering on rn REQUIRES the two-step shape",
      "It matters only for ROW_NUMBER, not other rankers",
      "It matters only on big tables — a performance nicety",
    ],
    answer: 1,
    why: "This isn't taste. Probed: the same-level attempt dies with 'misuse of aliased window function rn', the inlined call with 'misuse of window function ROW_NUMBER()'. The CTE isn't decoration — it's the staging the evaluation order demands, on every engine.",
    notes: [
      { choice: 2, why: "The law is ranker-agnostic: RANK, DENSE_RANK, NTILE, LAG — any window result you filter on needs the wrap. The function name in the error changes; the law doesn't." },
    ],
  },
  { id: "dr5-wj-37", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "'What was this customer's previous order total?' — three candidate tools. Which is the right first reach?",
    choices: [
      "LAG(total) OVER (PARTITION BY customer_id ORDER BY id) — the neighbor tool",
      "A self-join on customer_id — joins are the default",
      "A CROSS JOIN with a WHERE — maximal flexibility",
      "GROUP BY customer_id — collapse, then compare",
    ],
    answer: 0,
    why: "LAG walks one partition's sorted rows in a single pass: probed, 103 rows with 16 honest NULLs at the walk's starts. The self-join needs an ON condition to even mean 'previous' — and without a MAX/< guard it fans out to 624 pairs; the correlated MAX spelling works but is the pre-window fallback. Neighbor question, offset tool.",
    notes: [
      { choice: 1, why: "The join answers a different question — 'all earlier orders' — unless you add the correlated MAX guard, at which point you've hand-built LAG the hard way." },
    ],
  },
  { id: "dr5-wj-38", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "The dashboard shows revenue by month. When does it need `SUM(rev) OVER (ORDER BY mon)` instead of a plain `SUM(total)`?",
    choices: [
      "Never — the two return the same thing",
      "Only when the data has NULLs",
      "When each month's row must carry the cumulative-to-date line — the journey, not just one grand number",
      "Only past 100 rows",
    ],
    answer: 2,
    why: "Plain SUM folds to one number (34833.28); the window version puts a value on every month — 3731.97, 7341.61, … — and lands on 34833.28 at the end (probed reconciliation). Grand total only → plain SUM, one fold. The trail matters → the window, per-row accumulation.",
    notes: [
      { choice: 0, why: "The final rows agree — the other 13 don't. The window's payload is precisely the 13 intermediate values the plain SUM throws away." },
    ],
  },
  { id: "dr5-wj-39", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Marketing wants 'spend tiers': under 500 = bronze, 500–2000 = silver, above 2000 = gold. Right tool?",
    choices: [
      "NTILE(3) — three tiers, as requested",
      "CASE WHEN on spend bands — tiers must follow VALUE lines you can name",
      "ROW_NUMBER() OVER (ORDER BY spend) — take the top third",
      "DENSE_RANK() OVER (ORDER BY spend)",
    ],
    answer: 1,
    why: "Named value thresholds are CASE territory. NTILE(3) would deal rows into equal COUNTS — probed 6/5/5 over the 16 spenders — ignoring where the 500 and 2000 lines fall. If the spec says 'under 500', the tool is a value comparison, not a bucket dealer.",
    notes: [
      { choice: 0, why: "NTILE's tiers are equal-sized crowds, not value bands — probed, tile 4 spans 705.39 down to 444.80 while tile 3 still holds 737.68. That's segmentation by count, not the spec's segmentation by value." },
    ],
  },
  { id: "dr5-wj-40", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Ops reports 'average shipping delay: 2.98 days' from a query over the orders table. What must the fine print say?",
    choices: [
      "Nothing — 2.98 is the whole story",
      "That the average is over all 103 orders",
      "That windows always ignore NULLs, everywhere, by design",
      "The denominator: the figure runs over the 82 orders that shipped — the 21 unshipped (NULL shipped_at) contribute nothing",
    ],
    answer: 3,
    why: "Probed census: COUNT(*) = 103 but COUNT(shipped_at) = 82 — julianday(NULL) is NULL and AVG skips it, so 2.98 days describes the shipped population only. Window-based crowd stats inherit the post-filter, post-NULL crowd; a metric without its denominator is a claim waiting to be misquoted.",
    notes: [
      { choice: 1, why: "AVG skips the NULLs whether or not you filter, so the number looks table-wide while its denominator is 82 — which is exactly why naming it matters." },
    ],
  },
];
