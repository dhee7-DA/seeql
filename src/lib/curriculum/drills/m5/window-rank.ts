// Drill set — Ranking windows (Module 5, core, 50 questions).
// Engine-verified receipts (db/custom.db, SQLite 3.53): the spend leaderboard
// (RANK() OVER (ORDER BY SUM(total) DESC) per customer) runs Alice Chen
// 7262.35 #1, Emma Wilson 6640.56 #2, Grace Kim 4574.23 #3 … Olivia Brown
// 444.80 #16 with ZERO spend ties — so RANK, DENSE_RANK and ROW_NUMBER all
// read 1..16 identically; rank by region name and the 5 APAC customers tie at
// RANK 1, the 8 EU customers all sit at RANK 6 / DENSE_RANK 2, LATAM at 14/3,
// the 2 US customers tie at 15/4 (ROW_NUMBER instead deals APAC 1–5, EU 6–13,
// LATAM 14, US 15–16); rank the 103 orders by status and the blocks are
// cancelled RANK 1 (7 rows), delivered 8 (52), pending 60 (14), shipped 74
// (30), DENSE_RANK 1,2,3,4 — all 52 delivered rows share the single rank 8;
// PARTITION BY region ORDER BY spend DESC restarts ranks 1..N per region and
// crowns four number-1s: Grace Kim (APAC), Alice Chen (EU), Bruno Silva
// (LATAM), Emma Wilson (US); top-1 order per customer via staged ROW_NUMBER
// (PARTITION BY customer_id ORDER BY total DESC, id), outer rn = 1: Farid #74
// 1088.44, Chloe #43 945.21, Emma #39 845.92, Grace #15 826.03, Alice #3
// 767.64 (16 rows) — and top-2 yields 30 rows, NOT 32, because two customers
// have a single order; NTILE(4) over 16 spenders deals exact 4/4/4/4 (tile 1
// = Alice, Emma, Grace, Maya), NTILE(3) = 6/5/5 (tile 1 adds Chloe and
// Pedro), NTILE(5) over 103 = 21/21/21/20/20, NTILE(2.5) silently coerces to
// 2 (8/8) while NTILE(0)/NTILE(-2) error 'argument of ntile must be a
// positive integer'; RANK() OVER () with no ORDER BY hands every one of the
// 103 rows rank 1 (DENSE_RANK() OVER () too) but ROW_NUMBER() OVER () still
// numbers 1..103 uniquely in arbitrary order; PERCENT_RANK = (rank−1)/
// (rows−1): Alice 0, Emma 0.0667 (1/15), Dmitri 0.9333, Olivia 1; CUME_DIST
// = share at-or-below: Alice 0.0625 (1/16), Emma 0.125, Dmitri 0.9375, last
// row 1.0, and Bruno's single-row LATAM partition reads 0 and 1; product
// prices have no ties — ROW_NUMBER() OVER (ORDER BY price DESC, id): Smart
// Watch S 199.99 #1, Noise-Canceling Headset 149.99 #2, 4K Webcam Pro 129
// #3, Studio Desktop Mic 119 #4, Mechanical Keyboard K1 89.99 #5; stock rank
// (no ties in the top block): HDMI 2.1 Cable 2m 500 #1, Running Socks
// 3-pack 400 #2, Wireless Mouse M3 300 #3, Desk Mat Extended 260 #4, Yoga
// Mat Eco 6mm 220 #5, Bluetooth Speaker Mini 210 #6; windows over GROUP BY
// results rank the 16 folded counts (Alice 24 #1, Emma 17 #2, Grace 14 #3,
// Maya 13 #4) where the four 4-order customers share RANK 6 (DENSE 6; count
// 3 next reads RANK 10 / DENSE 7); COUNT(*) OVER (PARTITION BY customer_id)
// returns all 103 rows stamped with their owner's count (Alice's 24 rows all
// read 24; 9 distinct values 1..24); verbatim errors: window in WHERE or
// HAVING, or bare RANK() → 'misuse of window function RANK()' (ROW_NUMBER
// likewise), a window alias in WHERE → 'misuse of aliased window function
// rn', a SELECT alias inside OVER's ORDER BY → 'no such column: spend', a
// sibling window alias inside OVER → 'no such window: rk', NTILE() → 'wrong
// number of arguments to function NTILE()'; ORDER BY RANK() OVER (ORDER BY
// total) in the outer ORDER BY is legal and returns the cheapest orders
// first (#51 25.47, #72 30.24). Counts: 16 customers, 103 orders, 16
// products.

import type { DrillQ } from "../types";

const KW = "Ranking windows";

export const WINDOW_RANK_DRILL: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr5-wr-01", keyword: KW, tier: "core", aspect: "syntax",
    prompt: "Which snippet adds a leaderboard rank column to the per-customer spend summary?",
    choices: [
      "`RANK() OVER (ORDER BY SUM(o.total) DESC) AS rk`",
      "`RANK(ORDER BY SUM(o.total) DESC) AS rk`",
      "`OVER (ORDER BY SUM(o.total) DESC) RANK() AS rk`",
      "`RANK() (ORDER BY SUM(o.total) DESC) AS rk`",
    ],
    answer: 0,
    why: "Every window call is fn() OVER (...): the function keeps its empty parens, OVER opens the window, and PARTITION BY / ORDER BY live inside it. Probed shape from the leaderboard: this ranks Alice Chen 7262.35 #1 down to Olivia Brown 444.80 #16.",
    notes: [
      { choice: 1, why: "The sort goes INSIDE the OVER parens — RANK() itself always takes no arguments." },
      { choice: 3, why: "Parens right after RANK() aren't enough — the OVER keyword is what opens the window definition." },
    ],
  },
  { id: "dr5-wr-02", keyword: KW, tier: "core", aspect: "syntax",
    prompt: "Where does PARTITION BY belong in a window call?",
    choices: [
      "Inside the OVER parens, before ORDER BY: `RANK() OVER (PARTITION BY region ORDER BY spend DESC)`",
      "Between the function and OVER: `RANK() PARTITION BY region OVER (ORDER BY spend DESC)`",
      "In a standalone clause after FROM, before WHERE",
      "Inside the function's parens: `RANK(region) OVER (ORDER BY spend DESC)`",
    ],
    answer: 0,
    why: "OVER () is the window's container — both PARTITION BY and ORDER BY live inside it, PARTITION first. Probed: RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) restarts the race per region — Grace Kim #1 APAC, Alice Chen #1 EU, Bruno Silva #1 LATAM, Emma Wilson #1 US.",
    notes: [
      { choice: 3, why: "RANK() takes no arguments — the partition column is not a parameter; the window definition carries the grouping." },
    ],
  },
  { id: "dr5-wr-03", keyword: KW, tier: "core", aspect: "syntax",
    prompt: "Which call splits the 16 spenders into 4 spend tiers?",
    choices: [
      "`NTILE(4) OVER (ORDER BY spend DESC)`",
      "`NTILE() OVER (ORDER BY spend DESC BUCKETS 4)`",
      "`NTILE(4) (ORDER BY spend DESC)`",
      "`NTILE(spend, 4) OVER (ORDER BY spend DESC)`",
    ],
    answer: 0,
    why: "NTILE takes the bucket count as its argument and the sort inside OVER: probed, NTILE(4) OVER (ORDER BY spend DESC) deals the 16 spenders into exact 4/4/4/4 quartiles, with Alice, Emma, Grace and Maya drawing tile 1.",
    notes: [
      { choice: 1, why: "There is no BUCKETS keyword — and NTILE() with no argument fails outright: probed verbatim 'wrong number of arguments to function NTILE()'." },
    ],
  },
  { id: "dr5-wr-04", keyword: KW, tier: "core", aspect: "syntax",
    prompt: "You want RANK and DENSE_RANK side by side over the same sort. Which SELECT is valid?",
    choices: [
      "`SELECT name, RANK() OVER (ORDER BY region) rk, DENSE_RANK() OVER (ORDER BY region) drk FROM customers`",
      "`SELECT name, RANK() OVER (ORDER BY region) rk, DENSE_RANK() drk FROM customers`",
      "`SELECT name, RANK() OVER (ORDER BY region) rk, DENSE_RANK() OVER (rk) drk FROM customers`",
      "`SELECT name, RANK(ORDER BY region) rk, DENSE_RANK(ORDER BY region) drk FROM customers`",
    ],
    answer: 0,
    why: "Each window call carries its own full OVER clause — two windows in one SELECT is fine, sharing one is not. Probed pair over region: RANK puts the 8 EU customers at 6, DENSE_RANK puts them at 2 — same rows, two tie policies.",
    notes: [
      { choice: 2, why: "An OVER that isn't a window dies immediately — probed verbatim 'no such window: rk'; sibling window aliases can't be referenced inside another OVER." },
    ],
  },
  { id: "dr5-wr-05", keyword: KW, tier: "core", aspect: "syntax",
    prompt: "Which query correctly returns each customer's single biggest order?",
    choices: [
      "A CTE computes `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) AS rn`; the outer query filters `WHERE rn = 1`",
      "`SELECT …, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) AS rn FROM orders WHERE rn = 1`",
      "`SELECT customer_id, MAX(total) FROM orders GROUP BY customer_id`",
      "`SELECT … FROM orders LIMIT 1 PER CUSTOMER`",
    ],
    answer: 0,
    why: "Top-1-per-group is always two steps: the window computes rn in a CTE or derived table, the outer query filters rn = 1. Probed winners: Farid's order #74 at 1088.44, Chloe's #43 at 945.21, Emma's #39 at 845.92 — 16 rows.",
    notes: [
      { choice: 1, why: "WHERE runs before windows compute — filtering rn on the same level fails (probed: 'misuse of aliased window function rn'). The filter lives one level above." },
      { choice: 2, why: "MAX finds the value but not WHICH order it came from — GROUP BY emits one value-less-of-context row per customer, losing the order id the window keeps." },
    ],
  },
  { id: "dr5-wr-06", keyword: KW, tier: "core", aspect: "syntax",
    prompt: "The leaderboard ranks by spend, but spend is SUM(o.total) computed by the query. Which OVER clause is legal?",
    choices: [
      "`RANK() OVER (ORDER BY SUM(o.total) DESC)` — the window sorts by the same aggregate the query computes",
      "`RANK() OVER (ORDER BY spend DESC)` — referencing the query's SELECT alias",
      "`RANK(SUM(o.total)) OVER (ORDER BY SUM(o.total) DESC)`",
      "`RANK() OVER ()` — the aggregate is picked up automatically",
    ],
    answer: 0,
    why: "Inside OVER you order by the aggregate expression itself: probed, RANK() OVER (ORDER BY SUM(o.total) DESC) ranks the 16 folded rows Alice 7262.35 #1 … Olivia 444.80 #16. The SELECT alias is invisible there.",
    notes: [
      { choice: 1, why: "Window definitions resolve columns and expressions, not SELECT-list aliases — probed verbatim 'no such column: spend'. Repeat the SUM(o.total) spelling." },
    ],
  },

  // ---------- semantics ----------
  { id: "dr5-wr-07", keyword: KW, tier: "core", aspect: "semantics",
    prompt: "`SELECT c.name, SUM(o.total) AS spend, RANK() OVER (ORDER BY SUM(o.total) DESC) AS rk FROM … GROUP BY c.id` — how many rows come out?",
    choices: [
      "1 — RANK collapses like an aggregate",
      "16 — the window ranks the 16 grouped rows and keeps every one",
      "103 — the window sees the raw orders",
      "0 — windows and GROUP BY cancel out",
    ],
    answer: 1,
    why: "Windows compute across rows without collapsing: GROUP BY folds 103 orders into 16 customer rows, and the window stamps each with its rank — probed 1..16, Alice Chen 7262.35 first, Olivia Brown 444.80 sixteenth. Aggregates collapse; windows annotate.",
    notes: [
      { choice: 2, why: "By the time windows run, GROUP BY has already folded the rows — the race is over the 16 spends, never the 103 raw orders." },
    ],
  },
  { id: "dr5-wr-08", keyword: KW, tier: "core", aspect: "semantics",
    prompt: "Ranking customers by region, the 5 APAC customers tie at rank 1. What RANK does the first EU customer get?",
    choices: ["2", "5", "6", "15"],
    answer: 2,
    why: "RANK counts positions, not tie groups: the 5 APAC rows occupy positions 1–5, so EU starts at 6 — probed, all 8 EU customers sit at RANK 6. The gap IS the message: five rows tied ahead of you.",
    notes: [
      { choice: 0, why: "That's DENSE_RANK — the second tie group is simply 2. RANK skips; DENSE_RANK packs." },
    ],
  },
  { id: "dr5-wr-09", keyword: KW, tier: "core", aspect: "semantics",
    prompt: "Same region ranking with DENSE_RANK() OVER (ORDER BY region): what does the first EU customer get?",
    choices: ["2", "6", "13", "9"],
    answer: 0,
    why: "DENSE_RANK numbers tie groups consecutively, no gaps: APAC is 1, EU is 2 — probed, all 8 EU rows read DENSE_RANK 2 even though they start at position 6. Levels and tiers, not positions.",
    notes: [
      { choice: 1, why: "6 is RANK's answer. The two functions disagree only where ties exist — and region is all ties." },
    ],
  },
  { id: "dr5-wr-10", keyword: KW, tier: "core", aspect: "semantics",
    prompt: "What does `ROW_NUMBER() OVER (ORDER BY region)` do to the 5 APAC customers who tie on region?",
    choices: [
      "Gives all five the number 1",
      "Numbers them 1–5 — unique, in arbitrary internal order",
      "Skips four of them",
      "Errors — ROW_NUMBER can't handle ties",
    ],
    answer: 1,
    why: "ROW_NUMBER's contract is uniqueness: probed, the blocks land APAC 1–5, EU 6–13, LATAM 14, US 15–16 — no repeats, no gaps. Which APAC row draws which number is unspecified unless you add a tiebreaker to OVER's ORDER BY.",
    notes: [
      { choice: 0, why: "All-1s is RANK/DENSE_RANK behavior. ROW_NUMBER never repeats a number — that's why top-N filters can use rn = 1." },
    ],
  },
  { id: "dr5-wr-11", keyword: KW, tier: "core", aspect: "semantics",
    prompt: "What does PARTITION BY change about a ranking?",
    choices: [
      "It sorts the final output",
      "It restarts the ranking inside each group — each partition is its own league",
      "It removes ties from the data",
      "It collapses each partition to one row",
    ],
    answer: 1,
    why: "PARTITION BY slices the rows into independent leagues, each ranked from 1: probed, PARTITION BY region crowns four number-1s — Grace Kim (APAC), Alice Chen (EU), Bruno Silva (LATAM), Emma Wilson (US) — with sequences running 1..5, 1..8, 1..1, 1..2 inside.",
    notes: [
      { choice: 0, why: "Presentation order is still the outer ORDER BY's job. PARTITION only defines the scope the ranking resets within." },
    ],
  },
  { id: "dr5-wr-12", keyword: KW, tier: "core", aspect: "semantics",
    prompt: "`SELECT customer_id, COUNT(*) OVER (PARTITION BY customer_id) AS n FROM orders` — what comes back?",
    choices: [
      "16 rows — one count per customer",
      "103 rows — every order, each stamped with its owner's order count",
      "1 row — the grand total",
      "An error — COUNT needs GROUP BY",
    ],
    answer: 1,
    why: "The window counts within each customer's partition and annotates every row: probed, all 103 orders return, Alice's 24 rows each wearing 24. Nine distinct values appear (counts run 1..24) — GROUP BY would have shown only the 16 summary rows.",
    notes: [
      { choice: 0, why: "16 rows is the GROUP BY shape. The window's whole point is keeping the rows underneath — same arithmetic, no collapse." },
    ],
  },
  { id: "dr5-wr-13", keyword: KW, tier: "core", aspect: "semantics",
    prompt: "In `SELECT customer_id, COUNT(*) n, RANK() OVER (ORDER BY COUNT(*) DESC) rk FROM orders GROUP BY customer_id` — what exactly does the window rank?",
    choices: [
      "The 103 raw orders",
      "The 16 folded per-customer counts — windows run after GROUP BY",
      "The 4 status groups",
      "Nothing — windows and GROUP BY can't coexist",
    ],
    answer: 1,
    why: "Windows evaluate after grouping, so they rank the folded rows: probed, Alice's 24 orders take rank 1, Emma's 17 rank 2, Grace's 14 rank 3, Maya's 13 rank 4. One query, two stages — fold first, rank second.",
    notes: [
      { choice: 3, why: "They coexist fine — the window sees the grouped result. What fails is filtering the window in WHERE: 'misuse of window function RANK()'." },
    ],
  },
  { id: "dr5-wr-14", keyword: KW, tier: "core", aspect: "semantics",
    prompt: "A query computes `RANK() OVER (ORDER BY total DESC) AS rk` and ends with `ORDER BY id`. What does the output look like?",
    choices: [
      "Sorted by total; rk is ignored",
      "Sorted by id; rk still reflects the total ranking — two independent sorts",
      "Error — the two ORDER BYs conflict",
      "Sorted by id; rk restarts per id",
    ],
    answer: 1,
    why: "OVER's ORDER BY ranks; the query's ORDER BY presents. Rows can walk out in id order while rk reads 1 for the biggest total, 2 for the next — the two sorts never touch each other, and both are usually wanted.",
    notes: [
      { choice: 0, why: "The inside-OVER sort isn't discarded — it decides the rank numbers even when presentation runs by id." },
    ],
  },
  { id: "dr5-wr-15", keyword: KW, tier: "core", aspect: "semantics",
    prompt: "What does PERCENT_RANK() compute?",
    choices: [
      "(rank − 1) / (rows − 1) — share of rows strictly ahead; the leader reads 0",
      "rank / rows — the leader gets a positive fraction",
      "rank / 100 — a literal percentage",
      "COUNT(*) OVER () / rank",
    ],
    answer: 0,
    why: "Probed ladder on the spend leaderboard: Alice (rank 1) = 0, Emma (rank 2) = 1/15 = 0.0667, Dmitri (rank 15) = 0.9333, Olivia (rank 16) = 15/15 = 1 exactly. Percent standing among peers, anchored at 0 and ending at 1.",
    notes: [
      { choice: 1, why: "rank/rows would push the leader off 0 — the convention is leader 0, last row exactly 1, via the minus-ones in the formula." },
    ],
  },
  { id: "dr5-wr-16", keyword: KW, tier: "core", aspect: "semantics",
    prompt: "What does NTILE(4) do to the 16 ranked spenders?",
    choices: [
      "Deals rows into 4 buckets in rank order — first 4 spenders into tile 1 (probed 4/4/4/4)",
      "Ranks by spend value into 4 equal spend ranges",
      "Gives every row a random value 1..4",
      "Collapses the 16 rows into 4 summary rows",
    ],
    answer: 0,
    why: "NTILE deals positions into buckets honoring OVER's ORDER BY: probed, tile 1 = Alice, Emma, Grace, Maya (the top four spenders), tiles running 4/4/4/4. Quartiles by COUNT, not by value.",
    notes: [
      { choice: 1, why: "Equal-value ranges are CASE-band territory. NTILE guarantees equal counts — the spend boundaries fall wherever the deal puts them." },
    ],
  },

  // ---------- edge ----------
  { id: "dr5-wr-17", keyword: KW, tier: "core", aspect: "edge",
    prompt: "What does `SELECT RANK() OVER () FROM orders` return?",
    choices: [
      "1 for every one of the 103 rows",
      "1..103 uniquely",
      "NULL for every row",
      "An error — OVER needs ORDER BY",
    ],
    answer: 0,
    why: "Empty OVER is legal: with no sort there are no ties to break and nobody is ahead of anybody — probed, all 103 rows read rank 1 (DENSE_RANK() OVER () too). It's almost always a bug where the ORDER BY got lost.",
    notes: [
      { choice: 1, why: "That's ROW_NUMBER() OVER () — still 1..103 unique. RANK with no ORDER BY has nothing to differentiate rows, so everyone ties at 1." },
    ],
  },
  { id: "dr5-wr-18", keyword: KW, tier: "core", aspect: "edge",
    prompt: "`SELECT ROW_NUMBER() OVER () rn FROM orders` — what does rn look like?",
    choices: [
      "All 1s — no ORDER BY, no differentiation",
      "1..103 — unique numbers, assigned in arbitrary order",
      "NULLs",
      "Error — ROW_NUMBER requires ORDER BY",
    ],
    answer: 1,
    why: "Probed: ROW_NUMBER() OVER () still produces 103 distinct numbers 1..103 — the uniqueness contract holds even without a sort — but which row gets which number is unspecified. Contrast RANK() OVER (), where every row ties at 1.",
    notes: [
      { choice: 0, why: "Unique-always is the contract; ORDER BY just makes the assignment deterministic instead of arbitrary." },
    ],
  },
  { id: "dr5-wr-19", keyword: KW, tier: "core", aspect: "edge",
    prompt: "16 spenders, `NTILE(3) OVER (ORDER BY spend DESC)` — how do the buckets fall?",
    choices: [
      "5/5/5 with 1 row left over",
      "6/5/5 — earlier tiles absorb the remainder",
      "6/6/4",
      "Error — 16 doesn't divide by 3",
    ],
    answer: 1,
    why: "Probed: 6/5/5 — when the row count doesn't divide evenly, the EARLIER tiles come out bigger. Tile 1 holds the top six spenders: Alice, Emma, Grace, Maya, Chloe, Pedro.",
    notes: [
      { choice: 2, why: "The remainder is dealt one row each to the earliest tiles — 16 = 6+5+5, not 6+6+4." },
    ],
  },
  { id: "dr5-wr-20", keyword: KW, tier: "core", aspect: "edge",
    prompt: "`NTILE(5) OVER (ORDER BY id)` across the 103 orders — bucket sizes?",
    choices: ["21/21/21/20/20", "20/20/20/21/21", "Five buckets of 20, 3 rows dropped", "Error — 103 isn't divisible by 5"],
    answer: 0,
    why: "Probed: 21/21/21/20/20 — 103 = 5×20 + 3, so the first three tiles take one extra row each. NTILE never drops rows and never errors on indivisible counts.",
    notes: [
      { choice: 1, why: "Remainder rows go to the FRONT tiles, not the back — the reverse of most rounding habits." },
    ],
  },
  { id: "dr5-wr-21", keyword: KW, tier: "core", aspect: "edge",
    prompt: "You write `NTILE(2.5) OVER (ORDER BY spend DESC)` over the 16 spenders. What happens?",
    choices: [
      "Error — bucket counts must be whole",
      "Three buckets: 6/5/5",
      "Silently coerced to NTILE(2) — two buckets of 8/8",
      "Two buckets of 8/8 plus a half-filled third bucket",
    ],
    answer: 2,
    why: "Probed: no error, buckets 8/8 — SQLite coerces the 2.5 argument to integer 2. A computed bucket count can silently lie to you; only non-positive counts are rejected outright.",
    notes: [
      { choice: 0, why: "NTILE(0) and negatives raise 'argument of ntile must be a positive integer' — fractional values just floor without a peep." },
    ],
  },
  { id: "dr5-wr-22", keyword: KW, tier: "core", aspect: "edge",
    prompt: "Ranking customers by region, what do the 2 US customers get from RANK() and from DENSE_RANK()?",
    choices: [
      "RANK 15 and 16; DENSE 4 and 5",
      "Both RANK 15; both DENSE 4",
      "One gets 15, the other NULL",
      "RANK 15 and 15; DENSE 5 and 5",
    ],
    answer: 1,
    why: "Tied rows share the same number in both functions: probed, both US customers read RANK 15 (behind 5 APAC + 8 EU + 1 LATAM = 14 rows) and both read DENSE_RANK 4. ROW_NUMBER is the only ranker that would split them.",
    notes: [
      { choice: 0, why: "RANK gives tied rows EQUAL numbers, then skips — the row after the tie would be 17. There is no row after the US block here." },
    ],
  },
  { id: "dr5-wr-23", keyword: KW, tier: "core", aspect: "edge",
    prompt: "The 16 lifetime spends have zero ties. What do RANK, DENSE_RANK and ROW_NUMBER return over `ORDER BY spend DESC`?",
    choices: [
      "Three different sequences — RANK has gaps by definition",
      "All identical: 1..16",
      "RANK and DENSE_RANK identical; ROW_NUMBER off by one",
      "RANK errors without ties",
    ],
    answer: 1,
    why: "Probed tie census: zero duplicated spends — so every ranker reads 1,2,3,…,16 identically, Alice 7262.35 through Olivia 444.80. The three functions differ ONLY where ties exist; the gap appears on tie-prone columns like region or status.",
    notes: [
      { choice: 0, why: "No ties → no gaps. RANK == DENSE_RANK == ROW_NUMBER is the tie-free signature." },
    ],
  },
  { id: "dr5-wr-24", keyword: KW, tier: "core", aspect: "edge",
    prompt: "Bruno Silva is the only LATAM customer. Partitioned by region, what do PERCENT_RANK() and CUME_DIST() read on his row?",
    choices: ["0 and 1", "1 and 0", "NULL and NULL", "0.5 and 0.5"],
    answer: 0,
    why: "Probed: in a single-row partition PERCENT_RANK = 0 (nobody is ahead; the formula guards to 0) and CUME_DIST = 1 (his row is 1 of 1). Percent standing is degenerate but well-defined in a league of one.",
    notes: [
      { choice: 2, why: "No NULLs — both functions always return a fraction in [0, 1], even for tiny partitions." },
    ],
  },
  { id: "dr5-wr-25", keyword: KW, tier: "core", aspect: "edge",
    prompt: "Top-2 orders per customer via staged `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id)` filtered `rn <= 2` — how many rows?",
    choices: ["32 — 16 customers × 2", "30 — two customers have only one order", "103", "26"],
    answer: 1,
    why: "Probed: 30. Per-customer order counts run 1..24, and two customers have a single order — their partitions contribute one rn=1 row and no rn=2. Per-group top-N sizes track the partition contents, not N × groups.",
    notes: [
      { choice: 0, why: "32 would need every partition to hold ≥ 2 rows — the count census bottoms out at 1, breaking the symmetry." },
    ],
  },

  // ---------- errors ----------
  { id: "dr5-wr-26", keyword: KW, tier: "core", aspect: "errors",
    prompt: "`SELECT id FROM orders WHERE RANK() OVER (ORDER BY total) = 1` fails. What's the verbatim error and the fix?",
    choices: [
      "'misuse of window function RANK()' — stage the window in a CTE, filter rk = 1 outside",
      "'no such column: rank' — alias the column first",
      "'wrong number of arguments to function RANK()' — pass the column in",
      "No error — it returns the biggest order",
    ],
    answer: 0,
    why: "Probed verbatim: misuse of window function RANK(). WHERE runs before windows are computed, so ranking inside a filter is time travel. The fix is structural: wrap the window in a CTE or derived table and filter its output outside.",
    notes: [
      { choice: 1, why: "No alias helps — WHERE can't see window results on any spelling. The same ban covers HAVING." },
    ],
  },
  { id: "dr5-wr-27", keyword: KW, tier: "core", aspect: "errors",
    prompt: "`SELECT customer_id FROM orders GROUP BY customer_id HAVING RANK() OVER (ORDER BY COUNT(*)) = 1` — what happens?",
    choices: [
      "Works — HAVING can filter window results",
      "'misuse of window function RANK()' — same ban as WHERE; stage it in a CTE",
      "Returns the top customer by order count",
      "Returns all 16 customers",
    ],
    answer: 1,
    why: "Probed verbatim: misuse of window function RANK() — HAVING is as off-limits as WHERE because windows run after both. Filter the CTE's output instead: WITH r AS (…ranked counts…) SELECT … FROM r WHERE rk = 1.",
    notes: [
      { choice: 2, why: "The intent is right but the engine rejects the spelling before any logic runs — two steps or nothing." },
    ],
  },
  { id: "dr5-wr-28", keyword: KW, tier: "core", aspect: "errors",
    prompt: "`SELECT RANK() FROM orders` — no OVER at all. What does SQLite say?",
    choices: [
      "'misuse of window function RANK()' — a window function without OVER isn't a window function",
      "'no such function: RANK'",
      "Returns 103 — the row count",
      "Treats it as a scalar and returns 1",
    ],
    answer: 0,
    why: "Probed verbatim: misuse of window function RANK(). RANK is ONLY a window function, so the missing OVER is a misuse — not an unknown name (a true typo like RAN() dies differently: 'no such function: RAN').",
    notes: [
      { choice: 1, why: "The function exists — the CONTEXT is wrong. That's why the message says 'misuse', not 'no such function'." },
    ],
  },
  { id: "dr5-wr-29", keyword: KW, tier: "core", aspect: "errors",
    prompt: "`SELECT NTILE(0) OVER (ORDER BY id) FROM orders` — what happens?",
    choices: [
      "Every row gets 0",
      "Error: 'argument of ntile must be a positive integer'",
      "Silently treated as NTILE(1)",
      "Every row gets NULL",
    ],
    answer: 1,
    why: "Probed verbatim: argument of ntile must be a positive integer. Zero and negative bucket counts are the one argument family NTILE rejects — fractional values like 2.5 just coerce silently to 2.",
    notes: [
      { choice: 2, why: "NTILE(1) is legal (one bucket of everything), but 0 never downgrades to it — it errors." },
    ],
  },
  { id: "dr5-wr-30", keyword: KW, tier: "core", aspect: "errors",
    prompt: "`SELECT id, ROW_NUMBER() OVER (ORDER BY total DESC) rn FROM orders WHERE rn = 1` — what's the verbatim failure?",
    choices: [
      "'misuse of aliased window function rn' — WHERE can't see the window alias; stage it in a CTE",
      "'no such column: rn' — a typo'd alias",
      "'misuse of window function ROW_NUMBER()'",
      "Runs and returns the biggest order",
    ],
    answer: 0,
    why: "Probed verbatim: misuse of aliased window function rn. SQLite recognizes that rn IS a window alias and refuses — filtering on it in WHERE is the same time travel as calling the function there. Fix: compute rn in a CTE, filter rn = 1 outside.",
    notes: [
      { choice: 1, why: "The spelling is fine — the LAYER is wrong. The error names the alias misuse, not a missing column." },
    ],
  },
  { id: "dr5-wr-31", keyword: KW, tier: "core", aspect: "errors",
    prompt: "`SELECT customer_id, SUM(total) AS spend, RANK() OVER (ORDER BY spend DESC) rk FROM orders GROUP BY customer_id` — what happens?",
    choices: [
      "Works — OVER resolves the alias spend",
      "Error: 'no such column: spend' — repeat the aggregate: ORDER BY SUM(total) DESC",
      "Error: 'misuse of window function RANK()'",
      "Ranks by customer_id instead",
    ],
    answer: 1,
    why: "Probed verbatim: no such column: spend. Window definitions resolve base columns and expressions — never SELECT-list aliases. The leaderboard spelling is RANK() OVER (ORDER BY SUM(total) DESC), which probed-ranks Alice 7262.35 #1 … Olivia 444.80 #16.",
    notes: [
      { choice: 0, why: "The alias leniency exists for the outer ORDER BY (and SQLite's GROUP BY) — but not inside OVER. Repeat the expression." },
    ],
  },

  // ---------- predict ----------
  { id: "dr5-wr-32", keyword: KW, tier: "core", aspect: "predict",
    prompt: "Predict the first two rows of the spend leaderboard (RANK() OVER (ORDER BY SUM(o.total) DESC) … GROUP BY c.id ORDER BY rk).",
    choices: [
      "Alice Chen 7262.35, then Emma Wilson 6640.56",
      "Emma Wilson 6640.56, then Alice Chen 7262.35",
      "Alice Chen 7262.35, then Grace Kim 4574.23",
      "Alice Chen 7262.35, then Chloe Dubois 2667.93",
    ],
    answer: 0,
    why: "Probed: Alice Chen 7262.35 #1, Emma Wilson 6640.56 #2, then Grace 4574.23, Maya 3644.56, Chloe 2667.93 … down to Olivia Brown 444.80 #16. Spend DESC puts the biggest wallet first.",
  },
  { id: "dr5-wr-33", keyword: KW, tier: "core", aspect: "predict",
    prompt: "Predict: rank the 103 orders by status (`RANK() OVER (ORDER BY status)`) — what rank does the first pending order carry?",
    choices: ["3", "60", "74", "14"],
    answer: 1,
    why: "Probed blocks: cancelled ranks 1–7 (7 rows), delivered 8–59 (52), pending 60–73 (14), shipped 74–103 (30). Position 60 = 7 + 52 + 1 — the first pending order carries every row ahead of it, plus one.",
    notes: [
      { choice: 0, why: "3 is the DENSE_RANK of pending — block numbers collapse to 1,2,3,4; RANK keeps the positional gaps." },
    ],
  },
  { id: "dr5-wr-34", keyword: KW, tier: "core", aspect: "predict",
    prompt: "Same status ranking — what RANK values do the 52 delivered orders carry?",
    choices: [
      "52 distinct values, 8..59",
      "One value — all 52 read RANK 8",
      "Two values, 8 and 9",
      "52 distinct values, 1..52",
    ],
    answer: 1,
    why: "All 52 delivered rows tie on the sort key, so they share one rank: probed, delivered is RANK 8 (and DENSE_RANK 2), MIN = MAX across the whole block. Status has exactly four tie groups — cancelled 1, delivered 8, pending 60, shipped 74.",
    notes: [
      { choice: 0, why: "52 distinct ranks is ROW_NUMBER's dealing. RANK never splits a tie group." },
    ],
  },
  { id: "dr5-wr-35", keyword: KW, tier: "core", aspect: "predict",
    prompt: "Predict: `RANK() OVER (ORDER BY region)` over the 16 customers — what does the EU block read?",
    choices: [
      "All 8 EU customers read RANK 6",
      "Ranks 6..13 — one per EU customer",
      "All 8 read RANK 2",
      "Ranks 2..9",
    ],
    answer: 0,
    why: "Probed census: APAC's 5 rows tie at 1, so the 8 EU rows all sit at RANK 6 (DENSE_RANK 2), LATAM reads 14/3, the 2 US customers read 15/4. Ranking by a low-cardinality column makes blocks, not ladders.",
    notes: [
      { choice: 1, why: "6..13 is ROW_NUMBER's deal. RANK lets the whole EU block share 6 — the jump to LATAM's 14 is the 8-row tie's footprint." },
    ],
  },
  { id: "dr5-wr-36", keyword: KW, tier: "core", aspect: "predict",
    prompt: "Predict: top-1 order per customer (staged ROW_NUMBER, rn = 1, sorted by total DESC) — who leads, and where is Alice Chen's best order?",
    choices: [
      "Farid Nasser #74 1088.44 leads; Alice's best is 5th at 767.64",
      "Alice Chen leads with 767.64 — she's the top spender",
      "Farid Nasser leads; Alice's best is 2nd",
      "Emma Wilson #39 845.92 leads",
    ],
    answer: 0,
    why: "Probed winners: Farid #74 1088.44, Chloe #43 945.21, Emma #39 845.92, Grace #15 826.03, Alice #3 767.64 — 16 rows total. Biggest SPENDER ≠ biggest ORDER: Alice's single best purchase only ranks 5th among the per-customer champions.",
    notes: [
      { choice: 1, why: "Alice's 7262.35 is a SUM across 24 orders — the leaderboard and the best-order list measure different things." },
    ],
  },
  { id: "dr5-wr-37", keyword: KW, tier: "core", aspect: "predict",
    prompt: "Predict: `NTILE(4) OVER (ORDER BY spend DESC)` over the 16 spenders — who lands in tile 1?",
    choices: [
      "Alice, Emma, Grace, Maya",
      "Alice, Emma, Grace, Maya, Chloe, Pedro",
      "Olivia, Dmitri, Jamal, Liam",
      "Everyone with above-average spend",
    ],
    answer: 0,
    why: "Probed: an exact 4/4/4/4 deal — tile 1 = Alice 7262.35, Emma 6640.56, Grace 4574.23, Maya 3644.56; tile 4 ends with Liam 705.39, Jamal 645.6, Dmitri 599.26, Olivia 444.8. The top quartile is the top four spenders, by count.",
    notes: [
      { choice: 3, why: "Above-mean membership isn't the deal — NTILE slices positions after sorting, 4 rows per tile here; the mean is irrelevant." },
    ],
  },
  { id: "dr5-wr-38", keyword: KW, tier: "core", aspect: "predict",
    prompt: "Predict: `PERCENT_RANK() OVER (ORDER BY SUM(o.total) DESC)` on the spend leaderboard — Emma Wilson's value?",
    choices: ["0.0667", "0", "0.125", "0.0625"],
    answer: 0,
    why: "Probed: Emma is rank 2 of 16 → (2−1)/(16−1) = 1/15 = 0.0667. Alice anchors at 0; the last row (Olivia) reads exactly 1. CUME_DIST would read 0.125 (2/16) — a different denominator.",
    notes: [
      { choice: 3, why: "0.0625 = 1/16 is Alice's CUME_DIST — percent_rank divides by rows−1, cume_dist by rows." },
    ],
  },
  { id: "dr5-wr-39", keyword: KW, tier: "core", aspect: "predict",
    prompt: "Predict: `CUME_DIST() OVER (ORDER BY SUM(o.total) DESC)` on the 16 spenders — Alice's value, and the last row's?",
    choices: [
      "Alice 0.0625 (1/16); last row 1.0",
      "Alice 0; last row 0.9375",
      "Alice 1/16; last row 15/16",
      "Alice 0.0667; last row 1.0",
    ],
    answer: 0,
    why: "Probed: CUME_DIST is the share of rows at or below — Alice 1/16 = 0.0625, Emma 2/16 = 0.125, Dmitri 0.9375, Olivia 16/16 = 1.0 exactly. The cumulative share always ends at 1; PERCENT_RANK is the one anchored at 0.",
    notes: [
      { choice: 1, why: "0 and 15/16 are PERCENT_RANK territory (Dmitri reads 0.9333 there) — different denominators, different anchors." },
    ],
  },
  { id: "dr5-wr-40", keyword: KW, tier: "core", aspect: "predict",
    prompt: "Predict: `SELECT id, total FROM orders ORDER BY RANK() OVER (ORDER BY total) LIMIT 2` — what comes back?",
    choices: [
      "The two cheapest orders: 25.47, then 30.24",
      "The two biggest orders: 1088.44, then 945.21",
      "An error — windows are banned in ORDER BY",
      "Two arbitrary rows",
    ],
    answer: 0,
    why: "Windows are legal in the outer ORDER BY (only WHERE/HAVING ban them): probed, the rank orders by total ASC, so sorting by it yields the cheapest first — order #51 at 25.47, then #72 at 30.24. A quirky but valid 'cheapest first' spelling.",
    notes: [
      { choice: 2, why: "The ban is WHERE/HAVING-specific. The outer ORDER BY evaluates the window like any other SELECT-stage result." },
    ],
  },
  { id: "dr5-wr-41", keyword: KW, tier: "core", aspect: "predict",
    prompt: "Predict: `ROW_NUMBER() OVER (ORDER BY price DESC, id)` over the 16 products — which product is #3?",
    choices: [
      "4K Webcam Pro (129)",
      "Noise-Canceling Headset (149.99)",
      "Studio Desktop Mic (119)",
      "Mechanical Keyboard K1 (89.99)",
    ],
    answer: 0,
    why: "Probed ladder: Smart Watch S 199.99 #1, Noise-Canceling Headset 149.99 #2, 4K Webcam Pro 129 #3, Studio Desktop Mic 119 #4, Mechanical Keyboard K1 89.99 #5. Prices have zero ties here, so the `, id` tiebreaker never fires — it's insurance.",
    notes: [
      { choice: 1, why: "149.99 is #2 — the headset sits between the watch and the webcam in the price league." },
    ],
  },
  { id: "dr5-wr-42", keyword: KW, tier: "core", aspect: "predict",
    prompt: "Predict: `RANK() OVER (ORDER BY stock DESC)` over products — where does Wireless Mouse M3 (300) land?",
    choices: ["3", "1", "6", "10"],
    answer: 0,
    why: "Probed stock ladder: HDMI 2.1 Cable 2m 500 #1, Running Socks 3-pack 400 #2, Wireless Mouse M3 300 #3, Desk Mat Extended 260 #4, Yoga Mat Eco 6mm 220 #5, Bluetooth Speaker Mini 210 #6. No stock ties in the top block, so RANK walks 1,2,3,… cleanly.",
    notes: [
      { choice: 2, why: "6 is Bluetooth Speaker Mini's rank — one position and 90 units behind the mouse." },
    ],
  },
  { id: "dr5-wr-43", keyword: KW, tier: "core", aspect: "predict",
    prompt: "Predict: `RANK() OVER (ORDER BY COUNT(*) DESC)` after `GROUP BY customer_id` — four customers have exactly 4 orders. What rank do they share?",
    choices: ["6", "4", "9", "Each gets 6, 7, 8, 9"],
    answer: 0,
    why: "Probed count ladder: 24→1 (Alice), 17→2 (Emma), 14→3 (Grace), 13→4 (Maya), 5→5, then all four 4-order customers read RANK 6 (DENSE_RANK 6 too). Ranks 7–9 don't exist — the tie consumes them; the next count, 3, reads RANK 10 (DENSE 7).",
    notes: [
      { choice: 3, why: "Splitting the tie is ROW_NUMBER's doing. RANK shares 6, then jumps to 10 — the gap encodes 'four rows tied here'." },
    ],
  },

  // ---------- judgment ----------
  { id: "dr5-wr-44", keyword: KW, tier: "core", aspect: "judgment",
    prompt: "A raffle must pick exactly one winning entry per tied score — no arbitrary output. Which spelling?",
    choices: [
      "`ROW_NUMBER() OVER (ORDER BY score DESC, entry_id)` — unique numbers with a deterministic tiebreaker",
      "`RANK() OVER (ORDER BY score DESC)` — ties share the number",
      "`ROW_NUMBER() OVER ()` — no sort needed",
      "`NTILE(1) OVER (ORDER BY score DESC)`",
    ],
    answer: 0,
    why: "ROW_NUMBER guarantees uniqueness; the appended entry_id makes WHICH tied row wins deterministic instead of engine-whim. Probed contrast: RANK() OVER () collapses to all-1s and ROW_NUMBER() OVER () deals 1..103 arbitrarily — neither is controllable.",
    notes: [
      { choice: 1, why: "Shared ranks mean multiple winners on a tie — fine for leaderboards, wrong for 'exactly one winner'." },
      { choice: 2, why: "Without ORDER BY the assignment is arbitrary (probed: 1..103 in unspecified order) — the opposite of 'no arbitrary output'." },
    ],
  },
  { id: "dr5-wr-45", keyword: KW, tier: "core", aspect: "judgment",
    prompt: "The dashboard needs a per-customer lifetime-spend summary — nothing else. Window or GROUP BY?",
    choices: [
      "`GROUP BY customer_id` — 16 summary rows; the window shape would drag all 103 order rows along",
      "`SUM(total) OVER (PARTITION BY customer_id)` — windows are always the better tool",
      "Both, glued with UNION",
      "GROUP BY plus a RANK() OVER column",
    ],
    answer: 0,
    why: "Same arithmetic, different output shape: GROUP BY emits 16 rows; the window annotates all 103 orders with their owner's total (probed: 103 rows, Alice's 24 each reading 24). When the summary alone is the deliverable, the collapse IS the point — reach for GROUP BY.",
    notes: [
      { choice: 1, why: "The window earns its keep when per-row context matters — rank, share, running total. A bare summary doesn't need it." },
    ],
  },
  { id: "dr5-wr-46", keyword: KW, tier: "core", aspect: "judgment",
    prompt: "QA asks for 'each customer's biggest order'. Teammate A writes a global `ORDER BY total DESC LIMIT 16`; teammate B stages ROW_NUMBER per customer and filters rn = 1. Whose query answers the question?",
    choices: [
      "B — per-group winners; A's global cut is provably wrong here (Alice's best, 767.64, misses A's list)",
      "A — LIMIT 16 covers everyone",
      "Neither — MAX per customer is the only way",
      "B, but only because windows are newer",
    ],
    answer: 0,
    why: "Probed: the global top-5 orders are #74 1088.44, #43 945.21, #39 845.92, #15 826.03, #57 785.79 — Alice's biggest order (767.64) doesn't even make that cut. Top-1-per-group needs the PARTITION; LIMIT only answers 'biggest orders overall'.",
    notes: [
      { choice: 2, why: "MAX(total) GROUP BY customer finds the value but loses the order id — the window keeps row identity. The correlated form is the pre-window fallback when only the value is needed." },
    ],
  },
  { id: "dr5-wr-47", keyword: KW, tier: "core", aspect: "judgment",
    prompt: "Marketing wants the customer base split into spend quartiles for a campaign. Which tool?",
    choices: [
      "`NTILE(4) OVER (ORDER BY spend DESC)` — equal-COUNT quartiles by position",
      "`RANK() OVER (ORDER BY spend DESC)` and hand-pick ranks 1–4",
      "`WHERE spend > AVG(spend)` in the same query",
      "`CUME_DIST() < 4`",
    ],
    answer: 0,
    why: "A quartile is a quarter of the ROWS, and NTILE(4) deals exactly that: probed 4/4/4/4 on the 16 spenders, tile 1 = Alice, Emma, Grace, Maya. RANK names positions; NTILE names the bucket.",
    notes: [
      { choice: 2, why: "Beyond the WHERE-vs-aggregate failure, 'above average' isn't a quartile — probed, only 5 of the 16 spenders sit above their own mean, an uneven split by construction." },
    ],
  },
  { id: "dr5-wr-48", keyword: KW, tier: "core", aspect: "judgment",
    prompt: "A loyalty program must hand members a tier NUMBER (1, 2, 3, …) with no skipped level, even when many members tie. Which ranker?",
    choices: [
      "DENSE_RANK() — tie groups pack consecutively, no gaps",
      "RANK() — the gaps keep tiers exclusive",
      "ROW_NUMBER() — one tier per person",
      "NTILE(3) — exactly three tiers",
    ],
    answer: 0,
    why: "DENSE_RANK numbers tie groups 1, 2, 3 with nothing skipped: probed on region, the 8-customer EU tie reads DENSE 2 right after APAC's five-way 1 — while RANK jumps to 6, implying levels 3–5 that nobody holds.",
    notes: [
      { choice: 1, why: "RANK's gap is a feature for leaderboards (it says how many tied ahead) and a bug for tier labels (a level nobody occupies)." },
    ],
  },
  { id: "dr5-wr-49", keyword: KW, tier: "core", aspect: "judgment",
    prompt: "You need the five biggest orders overall — just id and total. Window or not?",
    choices: [
      "`ORDER BY total DESC LIMIT 5` — simpler; a window adds nothing when no rank column or per-group scope is needed",
      "Staged `ROW_NUMBER() OVER (ORDER BY total DESC)` filtered rn <= 5 — windows are the modern choice everywhere",
      "`NTILE(5) OVER (ORDER BY total DESC)` filtered tile = 1",
      "`DENSE_RANK()` filtered drk <= 5",
    ],
    answer: 0,
    why: "Probed top five: #74 1088.44, #43 945.21, #39 845.92, #15 826.03, #57 785.79 — plain LIMIT delivers them in one clause. Windows shine for rankings across groups or when the rank itself is the output; a global top-N with no displayed rank is LIMIT's job.",
    notes: [
      { choice: 1, why: "It works (same five rows) but pays a CTE plus a window for nothing — the rn never reaches the output." },
    ],
  },
  { id: "dr5-wr-50", keyword: KW, tier: "core", aspect: "judgment",
    prompt: "Your app must run top-1-per-customer on MySQL 5.7 (pre-8.0, no window functions). Which fallback?",
    choices: [
      "The pre-window spellings: correlated MAX subquery or self-join — e.g. `total = (SELECT MAX(total) FROM orders o2 WHERE o2.customer_id = o1.customer_id)`",
      "`NTILE(1)` — empty-bucket tricks work everywhere",
      "`RANK() OVER ()` — an empty OVER works on old engines",
      "Reorder the query's clauses until the window parses",
    ],
    answer: 0,
    why: "Windows landed in SQLite 3.25 and MySQL 8.0 — both in 2018. Lesson 26's correlated-MAX and self-join patterns are the faithful emulation: same winner rows, no window syntax. Reach for windows when you need the RANKING itself; the correlated form still finds the winner's row.",
    notes: [
      { choice: 2, why: "Empty-OVER RANK needs window support too — and even where it works it hands every row rank 1 (probed: all 103), answering nothing." },
    ],
  },
];
