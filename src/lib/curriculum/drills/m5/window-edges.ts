// Drill set — Window edges (Module 5, secondary, 45 questions).
// Engine-verified receipts (db/custom.db, SQLite 3.53): window calls are
// banned in WHERE/HAVING/GROUP BY — `WHERE RANK() OVER (ORDER BY total) = 1`,
// the HAVING twin, `GROUP BY RANK() OVER (...)` and bare `RANK()` (missing
// OVER) all die verbatim with "misuse of window function RANK()"; filtering a
// same-level window alias (`WHERE rn = 1` against rn = ROW_NUMBER() OVER …)
// errors "misuse of aliased window function rn"; windows ARE legal in the
// outer ORDER BY; nested windows and windows inside aggregates error
// "misuse of window function ROW_NUMBER()/RANK()"; typos report plainly
// (RAN() OVER (...) → "no such function: RAN", DENSE_RNK → "no such
// function: DENSE_RNK"); RANK() OVER () and DENSE_RANK() OVER () are legal —
// all 103 orders get 1 (ROW_NUMBER() OVER () hands out arbitrary-unique
// 1..103) and SUM(total) OVER () stamps 34833.28 on every row; the backwards
// frame ROWS BETWEEN 2 FOLLOWING AND 1 PRECEDING → "unsupported frame
// specification", missing BETWEEN → near "AND": syntax error, frame typed
// before ORDER BY → near "ORDER": syntax error, while the one-bound shorthand
// `ROWS 1 PRECEDING` is legal; NTILE(0) and NTILE(-2) → "argument of ntile
// must be a positive integer" but NTILE(2.5) silently coerces to 2 (8/8
// buckets over 16 customers); NTILE(4): 16→4/4/4/4, 103→26/26/26/25,
// NTILE(3) 16→6/5/5, NTILE(5) 103→21/21/21/20/20, NTILE(1)→103 in one bucket;
// LAST_VALUE(total) OVER (ORDER BY id) returns each row's OWN total (576.54,
// 416.81, 767.64 — default frame RANGE UNBOUNDED PRECEDING AND CURRENT ROW)
// and with ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING → 324.16
// everywhere (order 103's total), while FIRST_VALUE is fine by default
// (576.54 everywhere); LAG moves by row, value-agnostic — order 5's
// shipped_at is NULL and order 6's LAG(shipped_at) is NULL; LAG(total, -1)
// silently acts as LEAD (row 1 shows 416.81), LAG(total, 0) is self
// (576.54), LAG(total, 2) NULLs the first two rows, LAG(total, 1, 0) fills
// row 1 with 0, LEAD is NULL on order 103, per-customer LAG NULLs exactly 16
// rows; windows see only post-WHERE survivors — COUNT(*) OVER () after
// WHERE status='pending' reads 14 (not 103), after total > 1000 reads 1 —
// and windows never add rows: on WHERE 1=0 the windowed query returns 0
// rows while plain SUM returns 1 row of NULL; status ties (cancelled 7,
// delivered 52, pending 14, shipped 30) give RANK blocks 1/8/60/74 and
// DENSE_RANK 1..4; the RANGE default folds tied ORDER BY keys:
// COUNT(*) OVER (ORDER BY status) = 7/59/73/103 (ROWS variant counts 1..103
// one row at a time) and SUM = 1152.49/16723.56/22836.56/34833.28; spend has
// zero ties (RANK == DENSE_RANK == ROW_NUMBER 1..16 over 16 customers; zero
// duplicate order totals among 103); SUM(total) OVER (PARTITION BY
// customer_id) repeats 7262.35 on all 24 Alice rows (COUNT stamp 24);
// running total by id: 576.54 → 993.35 → 1760.99 … 34833.28 = plain
// SUM(total); running MAX(total) first hits 1088.44 at order 74 and stays;
// AVG(total) OVER () = 338.19.

import type { DrillQ } from "../types";

const KW = "Window edges";

export const WINDOW_EDGES_DRILL: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr5-we-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which call correctly ranks orders by total, highest first?",
    choices: [
      "`RANK() OVER (ORDER BY total DESC)`",
      "`RANK(ORDER BY total DESC)`",
      "`RANK() (ORDER BY total DESC)`",
      "`OVER (ORDER BY total DESC) RANK()`",
    ],
    answer: 0,
    why: "A window call is fn() OVER (spec): empty argument parens, then the OVER clause carrying the ORDER BY. Probed shape of the lesson's leaderboard: RANK() OVER (ORDER BY SUM(total) DESC).",
    notes: [
      { choice: 1, why: "RANK takes zero arguments — its ordering lives inside OVER, not inside its own parens. That spelling is a syntax error." },
    ],
  },
  { id: "dr5-we-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which of these queries is legal as written?",
    choices: [
      "`SELECT id FROM orders WHERE RANK() OVER (ORDER BY total) = 1`",
      "`SELECT id, RANK() OVER (ORDER BY total) AS rk FROM orders ORDER BY rk`",
      "`SELECT customer_id FROM orders GROUP BY customer_id HAVING RANK() OVER (ORDER BY COUNT(*)) = 1`",
      "`SELECT id FROM orders GROUP BY RANK() OVER (ORDER BY total)`",
    ],
    answer: 1,
    why: "Window functions are legal in the SELECT list and the outer ORDER BY (probed: both run). WHERE, HAVING and GROUP BY all reject them — probed verbatim: misuse of window function RANK() — because windows evaluate after those stages run.",
    notes: [
      { choice: 0, why: "The parser kills it before any rows move. Filtering a rank is the two-step: compute rk in a CTE or derived table, filter the alias outside." },
    ],
  },
  { id: "dr5-we-03", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Rank each order within its customer's timeline — which OVER clause is correct?",
    choices: [
      "`OVER PARTITION BY customer_id (ORDER BY id)`",
      "`ORDER BY id PARTITION BY customer_id OVER ()`",
      "`OVER (ORDER BY id PARTITION BY customer_id)`",
      "`OVER (PARTITION BY customer_id ORDER BY id)`",
    ],
    answer: 3,
    why: "Inside OVER, PARTITION BY comes first and ORDER BY second: OVER (PARTITION BY customer_id ORDER BY id). That one spelling powers the entire top-N-per-group pattern from lesson 31.",
    notes: [
      { choice: 2, why: "Reversed order is a syntax error — the engine reads PARTITION first to slice the rows into leagues, then ORDER to rank inside each slice." },
    ],
  },
  { id: "dr5-we-04", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which is a valid two-row sliding frame for a running sum?",
    choices: [
      "`SUM(total) OVER (ROWS BETWEEN 2 PRECEDING AND CURRENT ROW ORDER BY id)`",
      "`SUM(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`",
      "`SUM(total) OVER (ORDER BY id ROWS 2 PRECEDING AND CURRENT ROW)`",
      "`SUM(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING TO CURRENT ROW)`",
    ],
    answer: 1,
    why: "Frame grammar is ROWS BETWEEN <start> AND <end>, and it follows the ORDER BY inside OVER. Probed failures nearby: dropping BETWEEN dies with near \"AND\": syntax error, and typing the frame before ORDER BY dies with near \"ORDER\": syntax error.",
    notes: [
      { choice: 2, why: "BETWEEN is what pairs the two bounds. Without it, ROWS 2 PRECEDING is already a complete one-bound frame — the stray AND is unparseable." },
    ],
  },
  { id: "dr5-we-05", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Fetch each order's previous total, substituting 0 when no previous row exists?",
    choices: [
      "`LAG(total)[1, 0] OVER (ORDER BY id)`",
      "`LAG(total, 0, 1) OVER (ORDER BY id)`",
      "`LAG(total, 1, 0) OVER (ORDER BY id)`",
      "`PREV(total, 1, 0) OVER (ORDER BY id)`",
    ],
    answer: 2,
    why: "LAG takes (column, offset, default): LAG(total, 1, 0) reads one row back and substitutes 0 when there is no row. Probed row 1: 0 — where plain LAG(total) would hand NULL.",
    notes: [
      { choice: 1, why: "Arguments are positional: LAG(total, 0, 1) means offset 0 — yourself — with a default of 1 that can never fire. Every row would show its own total." },
    ],
  },

  // ---------- semantics ----------
  { id: "dr5-we-06", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`SELECT COUNT(*) OVER (), COUNT(*) FROM orders` — what is the difference between the two columns?",
    choices: [
      "None — both return one row reading 103",
      "The window stamps 103 on each of 103 rows; the aggregate folds to a single row",
      "The window returns one row; the aggregate returns 103",
      "The window counts columns, the aggregate counts rows",
    ],
    answer: 1,
    why: "COUNT(*) OVER () is annotation: 103 rows in, 103 rows out, each carrying the full-table count. The bare COUNT(*) collapses everything to one row. Same arithmetic — different shape, and shape is what windows are for.",
    notes: [
      { choice: 0, why: "The row COUNTS differ: 103 vs 1. The values agree, but the window never collapses — preserving rows is the whole point of OVER." },
    ],
  },
  { id: "dr5-we-07", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`RANK() OVER (ORDER BY status)` over the 103 orders — what does the rank column look like?",
    choices: [
      "1..103, unique on every row",
      "1..4 — one rank per status",
      "1 on all cancelled, 8 on delivered, 60 on pending, 74 on shipped — ties share, then RANK skips",
      "NULL everywhere — text columns can't be ranked",
    ],
    answer: 2,
    why: "RANK counts rows strictly ahead plus one. The 7 cancelled orders share rank 1; the 52 delivered start at 8; pending at 60; shipped at 74 (probed blocks 1 / 8 / 60 / 74). The gaps ARE the tie sizes — 52 rows occupy positions 8–59.",
    notes: [
      { choice: 1, why: "1..4 is DENSE_RANK's output. Same input, one word apart — the tie policy is the entire difference between the two rankers." },
    ],
  },
  { id: "dr5-we-08", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "Same data, `DENSE_RANK() OVER (ORDER BY status)` — how do you read the output?",
    choices: [
      "1..4 with no gaps — each status is the next level number",
      "1 / 8 / 60 / 74 — identical to RANK",
      "1..103, unique per row",
      "All 1s — DENSE_RANK ignores ORDER BY",
    ],
    answer: 0,
    why: "DENSE_RANK numbers tie groups consecutively: cancelled 1, delivered 2, pending 3, shipped 4 (probed). No gaps, no skipped levels — the tier-and-level flavor of ranking from lesson 31.",
    notes: [
      { choice: 1, why: "1/8/60/74 is RANK's ledger of positions. DENSE_RANK's numbers count tie GROUPS, not rows ahead — that's why nothing is skipped." },
    ],
  },
  { id: "dr5-we-09", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`SUM(total) OVER (PARTITION BY customer_id)` — no ORDER BY. What lands on each row?",
    choices: [
      "A running total within the customer's orders",
      "The storewide grand total on every row",
      "NULL — PARTITION BY needs ORDER BY to aggregate",
      "That customer's lifetime total, repeated on every one of their rows",
    ],
    answer: 3,
    why: "Without ORDER BY the frame is the whole partition: probed, all 24 of Alice's rows carry 7262.35 — her lifetime spend stamped on every order. This is the '% of customer total' pattern: total / SUM(total) OVER (PARTITION BY customer_id).",
    notes: [
      { choice: 1, why: "The storewide 34833.28 is what OVER () (no partition) stamps. PARTITION BY customer_id re-scopes the frame to one customer's rows." },
    ],
  },
  { id: "dr5-we-10", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`SUM(total) OVER (ORDER BY id)` — what does it compute?",
    choices: [
      "The grand total, identical on every row",
      "A running total that grows row by row; the last row equals the plain SUM",
      "Each row's own total",
      "An error — SUM over a window needs GROUP BY",
    ],
    answer: 1,
    why: "With ORDER BY and no explicit frame, the default window is RANGE UNBOUNDED PRECEDING AND CURRENT ROW — everything from the start through the current row. Probed: 576.54, 993.35, 1760.99 … ending at 34833.28 on order 103, exactly the bare SUM(total).",
    notes: [
      { choice: 0, why: "Grand-total-everywhere is the OVER () spelling — no ORDER BY, whole partition as frame. The inner ORDER BY is what makes the boundary crawl forward." },
    ],
  },
  { id: "dr5-we-11", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does `LAG(shipped_at) OVER (ORDER BY id)` return for each order?",
    choices: [
      "The previous ROW's shipped_at in that ordering — NULLs included, nothing skipped",
      "The last non-NULL shipped_at before this row",
      "The minimum shipped_at so far",
      "The first order's shipped_at, anchored at the start",
    ],
    answer: 0,
    why: "LAG moves by ROW, not by value. Probed: order 5's shipped_at is NULL and order 6's LAG faithfully returns NULL — the empty row is a perfectly good neighbor. 'Previous' means previous in the OVER's ORDER BY, whatever the values are.",
    notes: [
      { choice: 1, why: "Nothing is skipped — the NULL IS the previous row's value. 'Last non-NULL' needs staged non-NULL rows (a filtered CTE), not a LAG option; SQLite has no IGNORE NULLS (probed: near \"NULLS\": syntax error)." },
    ],
  },
  { id: "dr5-we-12", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "ROW_NUMBER, RANK and DENSE_RANK, each `OVER (ORDER BY spend DESC)` over the 16 customers' totals. The outputs?",
    choices: [
      "Three different sequences — that's why three functions exist",
      "Identical: exactly 1..16 on all three, because spend has zero ties",
      "RANK and DENSE_RANK match; ROW_NUMBER returns fractional ranks",
      "Only ROW_NUMBER runs — the other two require ties to work",
    ],
    answer: 1,
    why: "Probed: the 16 per-customer spends form zero tie groups, and per-row the three rankers agree — 16 equal values running 1..16. The functions differ only on ties; the tie policy is their entire job description.",
    notes: [
      { choice: 0, why: "A difference needs duplicate ORDER BY keys. This seed has none among customers' spends — and none among the 103 order totals either (probed)." },
    ],
  },
  { id: "dr5-we-13", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`NTILE(4) OVER (ORDER BY spend DESC)` over 16 customers — what does bucket 1 contain?",
    choices: [
      "The four biggest spenders",
      "The four smallest spenders",
      "The four customers that hold rank 1",
      "A quarter of customers chosen at random",
    ],
    answer: 0,
    why: "NTILE deals ordered rows into N buckets: rows 1–4 of the DESC spend order land in bucket 1 — the top quartile. With 16 rows and 4 tiles it splits 4/4/4/4 (probed); buckets follow the OVER's ORDER BY, not the value scale.",
  },
  { id: "dr5-we-14", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What changes for an aggregate like SUM when you add ORDER BY inside its OVER?",
    choices: [
      "Nothing — SUM is SUM either way",
      "It sorts the final output of the query",
      "ORDER BY inside OVER is illegal for aggregates",
      "Without it every row sees the whole partition; with it the frame ends at the current row — cumulative",
    ],
    answer: 3,
    why: "OVER () gives the whole-partition stamp (probed: SUM(total) OVER () = 34833.28 on all 103 rows). Adding ORDER BY makes the default frame 'start through current row' — the running total. One clause, two completely different reports.",
    notes: [
      { choice: 1, why: "The outer ORDER BY still owns presentation order. The inner one defines the frame boundary — two independent sorts with two independent jobs." },
    ],
  },

  // ---------- edge ----------
  { id: "dr5-we-15", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`RANK() OVER ()` — empty OVER, no ORDER BY — over the 103 orders. What comes back?",
    choices: [
      "An error — RANK needs an ORDER BY",
      "Every row gets rank 1 — all 103 of them",
      "Ranks 1..103 in scan order",
      "NULL on every row",
    ],
    answer: 1,
    why: "Probed: RANK() OVER () is legal — with no ORDER BY everything is one tie group, so all 103 rows read 1 (DENSE_RANK() OVER () too). ROW_NUMBER() OVER () is also legal and hands out arbitrary-but-unique 1..103.",
    notes: [
      { choice: 2, why: "Uniqueness is ROW_NUMBER's contract, not RANK's — and with no ordering its sequence follows the engine's walk, not any meaningful sort. Never rely on it." },
    ],
  },
  { id: "dr5-we-16", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`LEAD(id) OVER (PARTITION BY customer_id ORDER BY id)` over all 103 orders — how many NULLs does it produce?",
    choices: [
      "1 — only the very last order in the table",
      "16 — one per customer: LEAD never crosses the partition boundary",
      "103 — LEAD always NULLs the last row per partition plus the first",
      "0 — LEAD wraps around inside each partition",
    ],
    answer: 1,
    why: "Probed: exactly 16 NULLs — each customer's final order has no next neighbor INSIDE its partition, and LEAD refuses to reach into the next customer's rows. Partition walls stop LEAD just like they stop LAG (whose census is also 16, at the first order of each customer).",
    notes: [
      { choice: 0, why: "That's the unpartitioned LEAD(total) OVER (ORDER BY id) census — exactly 1 NULL on order 103. Partitioning multiplies the boundary NULLs to one per group." },
    ],
  },
  { id: "dr5-we-17", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`LAG(total, -1) OVER (ORDER BY id)` — what does it do?",
    choices: [
      "Errors — offsets must be positive",
      "Returns the row's own total",
      "NULL on every row — negative offsets disqualify the window",
      "Silently acts as LEAD: row 1 shows 416.81, the NEXT order's total",
    ],
    answer: 3,
    why: "Probed: no error — LAG(total, -1) mirrors into the future, row 1 showing 416.81 (order 2's total), row 2 showing 767.64. The other degenerate offset, LAG(total, 0), makes every row read itself (576.54 on row 1). A negative offset usually means you wanted LEAD — or a DESC sort.",
    notes: [
      { choice: 1, why: "Self is offset 0, probed 576.54 → 576.54. Offsets move by rows in the CURRENT sort — -1 just walks the same sort the other way." },
    ],
  },
  { id: "dr5-we-18", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Orders 1–3 have totals 576.54, 416.81, 767.64. What does `LAST_VALUE(total) OVER (ORDER BY id)` return on them?",
    choices: [
      "767.64 on every row — the latest total so far",
      "576.54 on every row — the first order's total",
      "NULL — LAST_VALUE requires an explicit frame",
      "576.54, 416.81, 767.64 — each row's OWN total",
    ],
    answer: 3,
    why: "The classic trap, probed: 576.54, 416.81, 767.64 — each row sees itself as the 'last' value. The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, so the frame's end IS the current row.",
    notes: [
      { choice: 0, why: "That's what people EXPECT LAST_VALUE to return — and what it returns only after the frame is widened to the whole partition." },
    ],
  },
  { id: "dr5-we-19", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Which frame makes LAST_VALUE actually see the end of the partition?",
    choices: [
      "`ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`",
      "`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`",
      "`ROWS BETWEEN CURRENT ROW AND CURRENT ROW`",
      "None — LAST_VALUE is broken; use MAX instead",
    ],
    answer: 0,
    why: "Probed: with ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING, LAST_VALUE(total) returns 324.16 on every row — order 103's total, the true last order. FIRST_VALUE never needed the fix: the default frame already reaches the start (probed 576.54 everywhere).",
    notes: [
      { choice: 1, why: "That's the default frame written out — explicit but unchanged. The end bound must move to UNBOUNDED FOLLOWING for 'last' to mean last." },
    ],
  },
  { id: "dr5-we-20", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`NTILE(2.5) OVER (ORDER BY id)` over the 16 customers — what happens?",
    choices: [
      "An error — NTILE demands an integer",
      "It runs: 2.5 rounds up to 3, producing 6/5/5 buckets",
      "It runs: 2.5 silently coerces to 2, producing 8/8 buckets",
      "NULL bucket labels — fractions poison the division",
    ],
    answer: 2,
    why: "Probed: no error — SQLite coerces the fractional argument to 2 and the 16 customers split 8/8. NTILE's contract says 'positive integer', but only the positive half is enforced; fractional values are truncated without a whisper.",
    notes: [
      { choice: 1, why: "No rounding ever happens — truncation only. The 6/5/5 split is what NTILE(3) over 16 really produces (probed)." },
    ],
  },
  { id: "dr5-we-21", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`NTILE(4) OVER (ORDER BY id)` over the 103 orders — how do the buckets size out?",
    choices: [
      "25/26/26/26 — the last buckets absorb the remainder",
      "26/26/26/25 — as even as possible, extras dealt to the earliest buckets",
      "26/26/26 plus 25 NULL rows",
      "An error — 103 isn't divisible by 4",
    ],
    answer: 1,
    why: "103 = 4 × 25 + 3, and NTILE deals the remainder into the FRONT buckets: probed 26/26/26/25. Any quartile cut over a real row count hits this — the first quartile is one row deeper than the last.",
    notes: [
      { choice: 0, why: "Bucket 1 is the one that grows, same law as NTILE(5) over 103 → 21/21/21/20/20 (probed). The remainder is dealt round-robin starting at bucket 1." },
    ],
  },
  { id: "dr5-we-22", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`SELECT SUM(total) OVER () FROM orders WHERE 1=0` — how many rows come out?",
    choices: [
      "1 row holding NULL — like a plain SUM on empty input",
      "1 row holding 0",
      "0 rows — with no surviving rows there is nothing to annotate",
      "An error — OVER () can't run on an empty set",
    ],
    answer: 2,
    why: "Probed: 0 rows. Windows never add rows — they annotate rows that survived the filter, and WHERE 1=0 leaves none. Contrast the bare aggregate: SUM(total) WHERE 1=0 returns exactly 1 row holding NULL. Same empty input, different shape contracts.",
    notes: [
      { choice: 0, why: "That's the plain-aggregate contract (one row even from nothing). The moment SUM wears OVER, it's per-row annotation — annotating zero rows yields zero rows." },
    ],
  },

  // ---------- errors ----------
  { id: "dr5-we-23", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT id FROM orders WHERE RANK() OVER (ORDER BY total) = 1` — what does SQLite say?",
    choices: [
      "'misuse of window function RANK()'",
      "'no such function: RANK'",
      "'near \"OVER\": syntax error'",
      "Nothing — it runs and returns the rank-1 orders",
    ],
    answer: 0,
    why: "Verbatim, probed: misuse of window function RANK(). WHERE runs before windows are computed, so a window can't be filtered there. The fix is structural: compute the rank in a CTE or derived table, filter the alias outside. Same verbatim error in HAVING and GROUP BY (probed).",
    notes: [
      { choice: 3, why: "It refuses at prepare time — and even the alias route fails at the same level: WHERE rn = 1 against a same-level window alias errors 'misuse of aliased window function rn' (probed)." },
    ],
  },
  { id: "dr5-we-24", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT RANK() FROM orders` — RANK with no OVER at all. The error?",
    choices: [
      "'misuse of window function RANK()' — OVER is what makes it a window",
      "'wrong number of arguments to function RANK()'",
      "'no such function: RANK'",
      "It runs — RANK defaults to ranking by rowid",
    ],
    answer: 0,
    why: "Probed verbatim: misuse of window function RANK(). The engine knows the name but a ranking function without OVER is a category error. The message names the function each time: DENSE_RANK() or LAG() without OVER → 'misuse of window function DENSE_RANK()' / 'misuse of window function LAG()' (probed).",
    notes: [
      { choice: 3, why: "There is no implicit rowid ranking — the engine refuses rather than inventing an order. Every window call carries its OVER, even the argument-less ones." },
    ],
  },
  { id: "dr5-we-25", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT RAN() OVER (ORDER BY id) FROM orders` — a typo'd name. The error?",
    choices: [
      "'misuse of window function RAN()'",
      "'unsupported frame specification'",
      "'no such function: RAN'",
      "It runs — SQLite fuzzy-matches RAN to RANK",
    ],
    answer: 2,
    why: "Probed verbatim: no such function: RAN. The OVER clause doesn't rescue an unknown name — SQLite resolves function names first, window or not. The same class: DENSE_RNK() OVER (…) → 'no such function: DENSE_RNK' (probed).",
    notes: [
      { choice: 0, why: "'Misuse of window function' is reserved for real window functions used in the wrong place. RAN isn't a function at all, so you get the plain missing-function error." },
    ],
  },
  { id: "dr5-we-26", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SUM(total) OVER (ROWS BETWEEN 1 PRECEDING AND CURRENT ROW ORDER BY id)` — what does SQLite say?",
    choices: [
      "It runs — OVER lets you list the frame before the sort",
      "'unsupported frame specification'",
      "'near \"ORDER\": syntax error' — the frame may only follow ORDER BY (or stand alone)",
      "'near \"ROWS\": syntax error'",
    ],
    answer: 2,
    why: "Probed verbatim: near \"ORDER\": syntax error. OVER's grammar is PARTITION BY → ORDER BY → frame — the bracket can only be built once the rows are lined up. Same family as the backwards frame (2 FOLLOWING AND 1 PRECEDING), which parses but fails with 'unsupported frame specification' instead.",
    notes: [
      { choice: 1, why: "Different defect: that error fires when the frame's geometry points backwards, not when it's merely in the wrong grammatical slot." },
    ],
  },
  { id: "dr5-we-27", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`NTILE(0) OVER (ORDER BY id)` — what happens?",
    choices: [
      "It runs and labels every row bucket 0",
      "'near \"0\": syntax error'",
      "'argument of ntile must be a positive integer'",
      "It divides by zero silently and returns NULLs",
    ],
    answer: 2,
    why: "Probed verbatim: argument of ntile must be a positive integer. Zero buckets make 'which bucket?' unanswerable, so the engine rejects outright — NTILE(-2) gets the same message (probed). It's the one argument check NTILE performs: NTILE(2.5) slides through as 2.",
    notes: [
      { choice: 0, why: "Bucket numbers start at 1 by contract; a 0 bucket count is a shape with no members, not a degenerate labeling the engine will emit." },
    ],
  },
  { id: "dr5-we-28", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT id, ROW_NUMBER() OVER (ORDER BY total DESC) AS rn FROM orders WHERE rn = 1` — the error?",
    choices: [
      "'misuse of window function ROW_NUMBER()'",
      "'no such column: rn'",
      "No error — it returns the biggest-total order",
      "'misuse of aliased window function rn'",
    ],
    answer: 3,
    why: "Probed verbatim: misuse of aliased window function rn. SQLite spots that rn names a same-level window alias consumed by WHERE, and reports the misuse directly. The repair is the two-step: wrap the windowed SELECT in a CTE, filter WHERE rn = 1 in the outer query.",
    notes: [
      { choice: 1, why: "Plausible — aliases normally don't exist at WHERE time — but the real message names the window misuse, which tells you the true cause: windows evaluate after WHERE." },
    ],
  },

  // ---------- predict ----------
  { id: "dr5-we-29", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT COUNT(*) OVER () FROM orders WHERE status='pending'`. The window column reads…",
    choices: [
      "103 on every row",
      "14 on every row",
      "14 on the first row, 103 on the rest",
      "NULL — windows can't run after a WHERE",
    ],
    answer: 1,
    why: "Probed: 14. Windows see only the post-WHERE survivors — the window is computed over the 14 pending orders, not the underlying 103. To stand the ALL-orders count beside a filtered set, the total must come from somewhere unfiltered (a scalar subquery).",
    notes: [
      { choice: 0, why: "103 would be the unfiltered stamp — exactly the assumption this query breaks. Same law for any filter: WHERE total > 1000 leaves COUNT(*) OVER () reading 1 (probed)." },
    ],
  },
  { id: "dr5-we-30", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT DISTINCT status, COUNT(*) OVER (ORDER BY status) FROM orders`. The four rows read…",
    choices: [
      "cancelled 1 / delivered 2 / pending 3 / shipped 4",
      "cancelled 7 / delivered 52 / pending 14 / shipped 30",
      "cancelled 7 / delivered 59 / pending 73 / shipped 103",
      "cancelled 103 / delivered 103 / pending 103 / shipped 103",
    ],
    answer: 2,
    why: "Probed: 7 / 59 / 73 / 103. The default frame is RANGE … CURRENT ROW, and RANGE treats tied ORDER BY keys as one step — each status's stamp includes ALL its peers: 7, then 7+52=59, then +14=73, then +30=103. The cumulative fold, tie group by tie group.",
    notes: [
      { choice: 1, why: "Those are the group sizes — the PARTITION-style stamp. ORDER BY makes the frame cumulative, and RANGE makes each step swallow the whole tie group in one bite." },
    ],
  },
  { id: "dr5-we-31", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT id, SUM(total) OVER (ORDER BY id) FROM orders` — the first three rows (totals 576.54, 416.81, 767.64).",
    choices: [
      "576.54 / 416.81 / 767.64",
      "34833.28 / 34833.28 / 34833.28",
      "576.54 / 993.35 / 1760.99",
      "NULL / 576.54 / 993.35",
    ],
    answer: 2,
    why: "Probed: 576.54, 993.35, 1760.99 — the running total. The default frame reaches from the first row through the current row, so each stamp absorbs one more order. The 34833.28-everywhere version is the ORDER-BY-less OVER ().",
    notes: [
      { choice: 3, why: "Off by one frame — the running total includes the CURRENT row, so row 1 already shows its own 576.54. Only LAG-style neighbors start with NULL." },
    ],
  },
  { id: "dr5-we-32", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: the LAST row of `SUM(total) OVER (ORDER BY id)` over all 103 orders — what does it read, and what does it equal?",
    choices: [
      "324.16 — order 103's own total",
      "338.19 — the average order total",
      "Whatever the frame clips to — not predictable",
      "34833.28 — exactly the plain SUM(total)",
    ],
    answer: 3,
    why: "Probed: the final running total is 34833.28, byte-identical to the bare SUM(total). The last row's frame has absorbed every row. That's the checksum habit: if a running total's last row doesn't reconcile with the plain aggregate, the frame is wrong.",
    notes: [
      { choice: 0, why: "324.16 is the LAST_VALUE answer — the last row's own total. SUM has been accumulating all along; it ends at the grand total, not at the last order." },
    ],
  },
  { id: "dr5-we-33", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT id, LAG(total) OVER (ORDER BY id) FROM orders` — the first three rows (totals 576.54, 416.81, 767.64).",
    choices: [
      "576.54 / 576.54 / 576.54",
      "416.81 / 767.64 / NULL",
      "NULL / NULL / NULL",
      "NULL / 576.54 / 416.81",
    ],
    answer: 3,
    why: "Probed: NULL, then 576.54, then 416.81 — each row carries its predecessor's total, and row 1, with no predecessor, carries NULL. Read the column as the values shifted DOWN one output row.",
    notes: [
      { choice: 1, why: "That's LEAD's column — the next row's value, NULL on the last row. Same ORDER BY, opposite direction, mirror-image NULL edge." },
    ],
  },
  { id: "dr5-we-34", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `LAG(total, 2) OVER (ORDER BY id)` — the first four rows (totals 576.54, 416.81, 767.64, 158.48).",
    choices: [
      "NULL / 576.54 / 416.81 / 767.64",
      "NULL / NULL / 576.54 / 416.81",
      "576.54 / 416.81 / 767.64 / 158.48",
      "NULL / 416.81 / NULL / 158.48",
    ],
    answer: 1,
    why: "Probed: NULL, NULL, 576.54, 416.81. The offset 2 reaches two rows back, so the first TWO rows have no neighbor; row 3 finally sees row 1. The offset shifts both the values and the NULL edge down by that many rows.",
    notes: [
      { choice: 0, why: "That's LAG(total, 1)'s pattern — one NULL then the chain. The 2-row offset starts the chain two rows later." },
    ],
  },
  { id: "dr5-we-35", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `MAX(total) OVER (ORDER BY id)` — what does order 74 (total 1088.44, the store's biggest) and every row after it show?",
    choices: [
      "1088.44 — the running max has peaked for good",
      "Each later row's own total — MAX resets every row",
      "NULL — the maximum lies behind those rows",
      "The next bigger total — which never comes, so 0",
    ],
    answer: 0,
    why: "Probed: the running maximum first hits 1088.44 at order 74 and stays there — every later row still shows 1088.44. The frame only ever grows with ORDER BY, so a max can't decrease; MIN mirrors it with a floor that never rises.",
    notes: [
      { choice: 1, why: "Frame growth is one-way: each row sees strictly MORE history than the last, never less. A per-row reset would need a different frame entirely." },
    ],
  },
  { id: "dr5-we-36", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `FIRST_VALUE(total) OVER (ORDER BY id)` — what do the 103 rows show?",
    choices: [
      "Each row's own total",
      "324.16 on every row",
      "NULL everywhere except the first row",
      "576.54 on every row — the first order's total",
    ],
    answer: 3,
    why: "Probed: 576.54 everywhere — order 1's total. FIRST_VALUE reads the frame's first row, and the default frame (UNBOUNDED PRECEDING … CURRENT ROW) always includes the start. The mirror image of the LAST_VALUE trap: first is fine by default, last needs the widened frame.",
    notes: [
      { choice: 1, why: "324.16 is order 103 — the LAST order. That's LAST_VALUE with the fixed frame; FIRST_VALUE with any frame reaching the start gives 576.54." },
    ],
  },
  { id: "dr5-we-37", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: RANK(), DENSE_RANK() and ROW_NUMBER(), each `OVER (ORDER BY spend DESC)` over the 16 per-customer spend totals. The three columns…",
    choices: [
      "Three different sequences — each function imposes its own tie policy even without ties",
      "RANK and DENSE_RANK match; ROW_NUMBER alone runs 1..16",
      "All three read exactly 1..16 — identical, because spend has zero ties",
      "Only ROW_NUMBER produces output — the rankers error without ties",
    ],
    answer: 2,
    why: "Probed: the 16 customer spends form zero tie groups, and per-row all three rankers agree — 16 equal values running 1..16. The tie policies (gaps, density, uniqueness) only diverge when duplicate ORDER BY keys force them to.",
    notes: [
      { choice: 0, why: "The policy is about ties, not general philosophy. Zero ties here (and zero duplicate order totals among the 103 orders, probed) means zero disagreement." },
    ],
  },
  { id: "dr5-we-38", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `NTILE(3) OVER (ORDER BY id)` over the 16 customers — the bucket sizes.",
    choices: [
      "6/5/5 — the first bucket takes the remainder",
      "5/5/6 — the last bucket takes the remainder",
      "5.33/5.33/5.33 — fractional buckets",
      "16/0/0 — everything lands in bucket 1",
    ],
    answer: 0,
    why: "Probed: 6/5/5. 16 = 3 × 5 + 1, and NTILE deals the extra row into bucket 1 — the earliest buckets absorb remainders. NTILE(5) over 103 shows the same law: 21/21/21/20/20 (probed).",
    notes: [
      { choice: 1, why: "Exactly backwards — remainder rows are dealt round-robin starting at bucket 1, so the FRONT buckets grow. Same reason 103 orders over NTILE(4) split 26/26/26/25." },
    ],
  },
  { id: "dr5-we-39", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT COUNT(*) OVER (PARTITION BY customer_id) FROM orders WHERE customer_id = 1` — Alice's 24 rows. The column reads…",
    choices: [
      "1 on every row",
      "103 on every row",
      "1, 2, 3 … 24 — counting up through her orders",
      "24 on every row",
    ],
    answer: 3,
    why: "Probed: a constant 24 — Alice's order count stamped on each of her 24 rows. The partition re-scopes the frame to her orders, and with no ORDER BY the whole partition is every row's frame. Pair it with SUM(total) OVER (PARTITION BY customer_id) = 7262.35 (probed) for per-order share of lifetime spend.",
    notes: [
      { choice: 2, why: "Counting up is ROW_NUMBER's job. COUNT without ORDER BY sees the partition all at once — the stamp never changes inside the partition." },
    ],
  },

  // ---------- judgment ----------
  { id: "dr5-we-40", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "You need each customer's top-3 orders by total. Where does the `rn <= 3` filter go?",
    choices: [
      "In the same WHERE clause as the ROW_NUMBER call — one query, one level",
      "In a CTE holding ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY …), filtered in the outer query",
      "Inside the OVER clause as a LIMIT",
      "In HAVING, since it's a group-level condition",
    ],
    answer: 1,
    why: "WHERE evaluates before windows — the rank doesn't exist when filtering happens, and same-level attempts error (probed: 'misuse of aliased window function rn'). The two-step shape — window inside a CTE or derived table, filter outside — is the top-N-per-group law from lesson 31, not a style choice.",
    notes: [
      { choice: 3, why: "HAVING is also pre-window (same misuse error there, probed) — and GROUP BY would collapse the very orders you're trying to rank." },
    ],
  },
  { id: "dr5-we-41", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A dashboard wants each order's share of its customer's lifetime spend. Which expression is the right tool?",
    choices: [
      "`total / COUNT(*) OVER ()`",
      "`RANK() OVER (PARTITION BY customer_id ORDER BY total DESC)`",
      "`total / SUM(total)` under GROUP BY customer_id — the collapsed version",
      "`total / SUM(total) OVER (PARTITION BY customer_id)`",
    ],
    answer: 3,
    why: "The partition-wide constant does it in one pass: probed, all 24 of Alice's rows carry SUM = 7262.35, so every order divides by her true lifetime total while keeping its own identity. GROUP BY would collapse to 16 summary rows — the per-order rows you're annotating would vanish.",
    notes: [
      { choice: 0, why: "COUNT(*) OVER () counts ORDERS (103), not money — dividing a total by a row count gives neither a share nor an average. The denominator must be the customer's SUM." },
    ],
  },
  { id: "dr5-we-42", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A teammate writes `WHERE COUNT(*) OVER () > 50` to keep only busy slices. Verdict?",
    choices: [
      "Fine — windows work wherever aggregates do",
      "Wrong twice over: windows can't live in WHERE, and 'keep bigger slices' is GROUP BY + HAVING territory",
      "Almost right — just change WHERE to HAVING and it works",
      "Right idea, wrong function — use ROW_NUMBER() OVER () instead",
    ],
    answer: 1,
    why: "WHERE rejects window calls outright (probed: misuse of window function…), and the goal — keep slices larger than 50 — is a collapsed-slice question: GROUP BY … HAVING COUNT(*) > 50. Windows shine when rows must SURVIVE annotated; when you want fewer rows out, plain aggregates are the honest tool.",
    notes: [
      { choice: 2, why: "Right instinct on the clause, still broken: the window spelling errors in HAVING too (probed). Drop the OVER and let the aggregate be an aggregate." },
    ],
  },
  { id: "dr5-we-43", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A report filters to pending orders (14 of them) and needs each pending order's share of ALL 103 orders. The sound design?",
    choices: [
      "`total / SUM(total) OVER ()` — the window sees the whole table anyway",
      "Reach outside the filter: compute the unfiltered total separately (scalar subquery, or the window in a pre-filter CTE)",
      "Use a RANGE frame — it can see past the WHERE clause",
      "Add DISTINCT to the window to widen its view",
    ],
    answer: 1,
    why: "Probed: after WHERE status='pending', COUNT(*) OVER () reads 14, not 103 — windows are computed over post-filter survivors and cannot see rows WHERE removed. Denominators spanning the whole table must come from outside the filter: a scalar subquery, or a CTE that stamps totals before the WHERE runs.",
    notes: [
      { choice: 0, why: "That OVER () is scoped to the filtered set — 14 rows' money, not the store's. Frames reach within surviving rows, never around a WHERE." },
    ],
  },
  { id: "dr5-we-44", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "The report must also run on MySQL 5.7 (pre-window). The honest port for top-1-per-group?",
    choices: [
      "Ship it as written — windows are universal now",
      "Swap ROW_NUMBER for RANK — older engines support the simpler rankers",
      "Rewrite with the module-4 spellings: a correlated MAX subquery or a self-join",
      "Wrap each window call in a stored procedure for compatibility",
    ],
    answer: 2,
    why: "Windows landed in SQLite 3.25 and MySQL 8.0 — both 2018. MySQL 5.7 has none of them, not even RANK. The pre-window fallbacks you already own (correlated MAX per group, self-joins) answer the same questions — which is exactly why lessons 26–28 double as the legacy dialect.",
    notes: [
      { choice: 1, why: "There's no 'partial' window support to downgrade into — the ranking family ships as one feature set. The correlated-subquery spelling is the fallback, not another window." },
    ],
  },
  { id: "dr5-we-45", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "You're building a 3-row moving average over `ORDER BY status` — a key with big tie groups. Which frame, and why?",
    choices: [
      "The default (RANGE) — folding the ties is what a moving average wants",
      "No frame needed — three rows is the default window size",
      "`ROWS BETWEEN 2 FOLLOWING AND 1 PRECEDING` — a centered bracket around the current row",
      "Explicit `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` — you want physical rows, and RANGE would treat tied peers as one step",
    ],
    answer: 3,
    why: "RANGE folds tied ORDER BY keys into one frame step (probed: COUNT(*) OVER (ORDER BY status) jumps 7 → 59 → 73 → 103), so a RANGE moving average over status would average ragged, tie-sized chunks. ROWS counts physical rows — the honest sliding band. On tie-free keys (ids, month buckets) the two agree, which is why lesson 32's date queries never hit this.",
    notes: [
      { choice: 2, why: "That bracket points backwards — start (2 FOLLOWING) after end (1 PRECEDING) — and errors with 'unsupported frame specification' (probed). A centered window needs a FOLLOWING end after a PRECEDING start." },
    ],
  },
];
