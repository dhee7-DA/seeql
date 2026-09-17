// Drill set — Window frames & running totals (Module 5, secondary, 45 questions).
// Engine-verified receipts (db/custom.db, SQLite 3.53): grand totals SUM 34833.28 /
// 103 orders / AVG 338.19 / MIN 25.47 / MAX 1088.44; order totals in id order start
// 576.54, 416.81, 767.64, 158.48, 725.34, 752.96 … and end 115.06 (id 102), 324.16
// (id 103); running SUM(total) OVER (ORDER BY id) = 576.54, 993.35, 1760.99, 1919.47,
// 2644.81, 3397.77 … 34509.12 (id 102) … 34833.28 (id 103 = the plain SUM — the
// reconciliation); raw float dust is real (id 2 accumulates to 993.3499999999999);
// COUNT(*) OVER () = 103 on every row, and 14 on the 14 pending rows after WHERE
// status='pending' (census delivered 52 / shipped 30 / pending 14 / cancelled 7);
// SUM(total) OVER () = 34833.28 constant; running COUNT = 1, 2, 3 …;
// AVG(total) OVER (PARTITION BY region): LATAM 426.22, US 383.48, EU 335.32, APAC
// 313.66 (SELECT DISTINCT dedupes to 4 rows); COUNT(*) OVER (PARTITION BY region):
// EU 45 / APAC 37 / US 19 / LATAM 2; Alice's 24 rows all carry SUM OVER (PARTITION BY
// customer_id) = 7262.35 (20.85% of the grand total) and her per-customer running
// line is 767.64, 920.16, 1552.45, 2257.68, 2575.17, 2711.28 … 7262.35 (ids 3, 7, 13,
// 14, 19, 21 …); AVG OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW):
// 576.54, 496.67, 592.23, 463.06, 441.91; ROWS BETWEEN 2 PRECEDING AND CURRENT ROW:
// 576.54, 496.67, 587.00, 447.64, 550.49 (frames clip at the boundary — row 1
// averages one value); AVG OVER (UNBOUNDED PRECEDING AND 1 PRECEDING): id1 NULL,
// id2 576.54, id3 496.67, id4 587.00; SUM variant: id2 576.54, id3 993.35, id4
// 1760.99 (row 1 NULL — even SUM returns NULL on the empty before-frame); SUM OVER
// (ORDER BY id ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING): 34833.28, 34256.74,
// 33839.93; default frame with ORDER BY = RANGE UNBOUNDED PRECEDING AND CURRENT ROW
// (0 mismatches vs the explicit spelling; the single-bound shorthand ROWS UNBOUNDED
// PRECEDING also matches 103/103); running AVG (default frame): 576.54, 496.67,
// 587.00, 479.87; RANGE treats tied peers as one step — two orders share day
// 2024-01-02 (ids 5, 7; day sums 2024-01-01 752.96, 2024-01-02 877.86): id 5 shows
// 1630.82 under RANGE vs 1478.30 under ROWS, id 7 shows 1630.82 under both;
// LAST_VALUE(total) OVER (ORDER BY id) returns each row's own total (576.54, 416.81,
// 767.64 …) under the default frame but 324.16 everywhere with ROWS BETWEEN UNBOUNDED
// PRECEDING AND UNBOUNDED FOLLOWING; FIRST_VALUE = 576.54 (ORDER BY id) / 324.16
// (ORDER BY id DESC); windows never add or remove rows (103 in → 103 out; WHERE 1=0
// → 0 rows); ROWS offset frames run without ORDER BY (legal, physical order — no
// error); verbatim errors: 'unsupported frame specification' (ROWS BETWEEN 2
// FOLLOWING AND 1 PRECEDING, and 2 FOLLOWING AND CURRENT ROW), near "PARTITION":
// syntax error (ORDER BY before PARTITION BY), near "AND": syntax error (BETWEEN
// omitted), near "PRECEDING": syntax error (ROWS keyword omitted; UNBOUNDED
// PRECEDING as an end bound), near "FROM": syntax error (OVER without parens),
// misuse of window function COUNT() (window in WHERE), misuse of window function
// SUM() (aggregate around a window), RANGE with offset PRECEDING/FOLLOWING requires
// one ORDER BY expression; staged expense month sums 1719, 1440, 1917, 1749, 1480 …
// running SUM OVER (ORDER BY mo) = 1719, 3159, 5076, 6825, 8305 … (grand expense
// total 25416); 100.0*total/SUM(total) OVER (): 1.66, 1.2, 2.2, 0.45 … (order 1
// carries 1.66% of lifetime revenue); no two orders share an exact total.

import type { DrillQ } from "../types";

const KW = "Frames & running totals";

export const WINDOW_FRAMES_DRILL: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr5-wf-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which query computes a running total of order amounts, walking in id order?",
    choices: [
      "`SELECT id, SUM(total) FROM orders ORDER BY id`",
      "`SELECT id, SUM(total) OVER (PARTITION BY id) FROM orders`",
      "`SELECT id, SUM(total) OVER (ORDER BY id) FROM orders`",
      "`SELECT id, SUM(total ORDER BY id) FROM orders`",
    ],
    answer: 2,
    why: "The window spell: OVER (ORDER BY id) makes SUM accumulate as it walks — probed 576.54 → 993.35 → 1760.99 → … → 34833.28. A bare SUM is a one-row aggregate no matter how you sort the output.",
    notes: [
      { choice: 0, why: "ORDER BY only sorts the result; without OVER the SUM still folds all 103 orders into a single row." },
      { choice: 1, why: "PARTITION BY id puts every order in its own partition — the 'running' total would equal each row's own amount forever." },
    ],
  },
  { id: "dr5-wf-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "A per-customer running total of order amounts. Which OVER clause is correct?",
    choices: [
      "`OVER (ORDER BY id PARTITION BY customer_id)`",
      "`OVER (PARTITION BY customer_id ORDER BY id)`",
      "`OVER (PARTITION BY customer_id)`",
      "`OVER (ORDER BY customer_id)`",
    ],
    answer: 1,
    why: "PARTITION first, ORDER second — probed, Alice's line restarts inside her 24 orders (767.64 → 920.16 → 1552.45 …) and EU's walk runs 576.54 → 1344.18 independently of APAC's.",
    notes: [
      { choice: 0, why: "Probed verbatim: near \"PARTITION\": syntax error — ORDER BY always trails PARTITION BY inside OVER." },
      { choice: 2, why: "Legal, but with no ORDER BY the frame is the whole partition: a constant per customer, not a walk." },
    ],
  },
  { id: "dr5-wf-03", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "You want a 3-row sliding window — two rows back through the current row. Which spelling is correct?",
    choices: [
      "`ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`",
      "`ORDER BY id ROWS 2 PRECEDING AND CURRENT ROW`",
      "`ORDER BY id ROWS BETWEEN 2 FOLLOWING AND CURRENT ROW`",
      "`ORDER BY id BETWEEN 2 PRECEDING AND CURRENT ROW`",
    ],
    answer: 0,
    why: "Frame grammar: the BETWEEN…AND pair brackets the band, each edge written as UNBOUNDED/n PRECEDING, CURRENT ROW, or n/UNBOUNDED FOLLOWING — and the ROWS keyword names the frame unit.",
    notes: [
      { choice: 1, why: "Probed verbatim: near \"AND\": syntax error — a BETWEEN frame needs the BETWEEN." },
      { choice: 2, why: "Parses, but probed verbatim: unsupported frame specification — the start edge may not come after the end edge (2 FOLLOWING is ahead of CURRENT ROW)." },
      { choice: 3, why: "Probed verbatim: near \"PRECEDING\": syntax error — without the ROWS/RANGE keyword the parser never enters frame mode." },
    ],
  },
  { id: "dr5-wf-04", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "`SUM(total) OVER (ORDER BY id ROWS UNBOUNDED PRECEDING)` — what does the single-bound shorthand mean?",
    choices: [
      "The whole partition on every row — start to UNBOUNDED FOLLOWING",
      "Only the current row — a frame of one",
      "Shorthand for UNBOUNDED PRECEDING AND CURRENT ROW — the running total, identical to the default",
      "It's a syntax error; only the BETWEEN form is legal",
    ],
    answer: 2,
    why: "A one-edge frame ends at CURRENT ROW by definition. Probed: 0 mismatching rows across all 103 orders vs the default frame — which itself is the RANGE UNBOUNDED PRECEDING AND CURRENT ROW spelling (also 0 mismatches).",
    notes: [
      { choice: 0, why: "That's the separate spelling ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING — the whole-partition frame, no crawl." },
    ],
  },
  { id: "dr5-wf-05", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "A report must show the total order count on every row. Which spelling produces it?",
    choices: [
      "`COUNT(*)`",
      "`COUNT(*) OVER ()`",
      "`COUNT(*) OVER (ORDER BY id)`",
      "`COUNT(*) OVER (COUNT(*))`",
    ],
    answer: 1,
    why: "The empty OVER () takes the whole row set as one partition: probed, all 103 rows carry 103. The parentheses stay even when there's nothing inside them.",
    notes: [
      { choice: 0, why: "The plain aggregate folds the query to a single row — the opposite of keeping detail." },
      { choice: 2, why: "Legal, but with ORDER BY the count crawls: 1, 2, 3 … 103 — a running count, not the constant." },
    ],
  },

  // ---------- semantics ----------
  { id: "dr5-wf-06", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "Why does bare `SUM(total) OVER (ORDER BY id)` accumulate instead of repeating 34833.28 on every row?",
    choices: [
      "ORDER BY installs the default frame — RANGE UNBOUNDED PRECEDING AND CURRENT ROW — so each row sums everything up to itself",
      "SUM is order-sensitive: it adds the values in id order",
      "OVER always forces running behavior on aggregates",
      "id is the primary key, so SQLite chains the additions",
    ],
    answer: 0,
    why: "The crawling boundary is a FRAME, not addition order: with ORDER BY and no explicit frame, the window runs from the first row to the current one — probed 576.54 → 993.35 → …, and 0 mismatches vs the explicit RANGE spelling.",
    notes: [
      { choice: 1, why: "REAL addition here is order-insensitive at 2 decimals — drop the ORDER BY and the same SUM prints the constant 34833.28 on every row." },
      { choice: 2, why: "OVER with no ORDER BY gives whole-set constants; only ORDER BY makes the frame edge crawl." },
    ],
  },
  { id: "dr5-wf-07", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`SUM(total) OVER (PARTITION BY customer_id)` (no ORDER BY) — what lands on Alice's 24 rows?",
    choices: [
      "Her running total, growing from 767.64 to 7262.35",
      "34833.28 on every row — the storewide total",
      "7262.35 on every one of her rows — her partition total, repeated",
      "24 different values, one per order",
    ],
    answer: 2,
    why: "No ORDER BY means no crawling edge: the frame is the whole partition. Probed: 24 rows, exactly 1 distinct value, 7262.35 — the denominator every %-of-customer-spending report divides by.",
    notes: [
      { choice: 0, why: "The walk needs ORDER BY id inside OVER: her running line runs 767.64 → 920.16 → … → 7262.35, ending where the constant version starts." },
      { choice: 1, why: "34833.28 is what OVER () — no partition — yields; PARTITION BY customer_id shrinks the frame to each customer's own orders." },
    ],
  },
  { id: "dr5-wf-08", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`COUNT(*) OVER ()` on the orders table — what does each of the 103 rows carry?",
    choices: [
      "1 — each row counts only itself",
      "A growing count: 1 on the first row, 103 on the last",
      "NULL — COUNT has nothing to group",
      "103 — the whole set's count, same on every row",
    ],
    answer: 3,
    why: "Empty OVER () = one partition containing everything. Probed: exactly one distinct value across all rows — 103. Windows annotate rows; they never collapse them the way the plain aggregate does.",
    notes: [
      { choice: 1, why: "That crawl is COUNT(*) OVER (ORDER BY id) — the ORDER BY is what makes the frame grow." },
    ],
  },
  { id: "dr5-wf-09", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)` — what does each row average?",
    choices: [
      "Every row up to and including itself",
      "The entire table",
      "Itself plus the row after it",
      "Itself plus the row before it — a 2-row sliding band",
    ],
    answer: 3,
    why: "The band starts 1 PRECEDING and stops at CURRENT ROW: probed id2 = (576.54+416.81)/2 = 496.67, id3 = (416.81+767.64)/2 = 592.23 — each row's answer slides forward with it.",
    notes: [
      { choice: 0, why: "That's the default frame — the running average: probed 587.00 at id 3, where THREE rows are averaged, not the 2-row band's 592.23." },
    ],
  },
  { id: "dr5-wf-10", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`SUM(total) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING)` — id 2's value is 34256.74. What is that?",
    choices: [
      "Everything before id 2",
      "Everything from id 2 to the end — the remaining tail of revenue",
      "id 2's own total, repeated",
      "The grand total, same on every row",
    ],
    answer: 1,
    why: "The frame starts at the current row and runs to the last: probed 34833.28, 34256.74 (= 34833.28 − 576.54), 33839.93 … The tail is the running total's mirror image — the countdown, not the accumulation.",
    notes: [
      { choice: 0, why: "'Everything before me' is the UNBOUNDED PRECEDING AND 1 PRECEDING frame — probed 993.35 at id 3, 1760.99 at id 4." },
    ],
  },
  { id: "dr5-wf-11", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`LAST_VALUE(total) OVER (ORDER BY id)` returns 576.54 on row 1, 416.81 on row 2, 767.64 on row 3. Why each row's OWN total?",
    choices: [
      "LAST_VALUE is broken in SQLite and returns the first value",
      "The window ignores ORDER BY when looking up values",
      "It only finds the true last row on the query's final row",
      "The default frame ends at CURRENT ROW — the last row of a 1-row-so-far window is yourself",
    ],
    answer: 3,
    why: "Probed exactly that pattern. With ORDER BY and no explicit frame, the frame's right edge is CURRENT ROW, so the 'last' value in frame is always the current row — LAST_VALUE silently degenerates unless you widen the frame.",
    notes: [
      { choice: 2, why: "True on row 103 (324.16) — but by position, not by correctness; every earlier row is its own LAST_VALUE." },
    ],
  },
  { id: "dr5-wf-12", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`FIRST_VALUE(total) OVER (ORDER BY id)` is 576.54 on every row. What does `FIRST_VALUE(total) OVER (ORDER BY id DESC)` return?",
    choices: [
      "576.54 still — FIRST_VALUE ignores sort direction",
      "NULL — DESC windows have no first row",
      "324.16 everywhere — the anchor flips to the highest id (order 103)",
      "103 — the id of the last row",
    ],
    answer: 2,
    why: "Probed: one distinct value, 324.16 — order 103's total, now first in walk order. Reversing the sort is the classic repair for the LAST_VALUE default-frame trap: anchor from the back.",
    notes: [
      { choice: 3, why: "FIRST_VALUE reads a VALUE of its column (total), not the sort key — 103 is an id, not a total." },
    ],
  },
  { id: "dr5-wf-13", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "Orders 5 and 7 share the day 2024-01-02. With `SUM(total) OVER (ORDER BY date(created_at))` (default frame), what does order 5 show — and why not 1478.30?",
    choices: [
      "1630.82 — RANGE's CURRENT ROW means the whole peer group, so the full 2024-01-02 day (877.86) is inside the frame",
      "1478.30 — the day's second order hasn't happened yet in walk order",
      "752.96 — only the previous day",
      "NULL — a tie makes the frame ambiguous",
    ],
    answer: 0,
    why: "Probed on the same row: RANGE 1630.82 vs ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW 1478.30 (= 752.96 from earlier days + its own 725.34). RANGE adds every peer sharing the sort key — the whole 877.86 day — while ROWS counts physical rows.",
    notes: [
      { choice: 1, why: "That's the ROWS spelling's answer — and order 7, the day's second row, shows 1630.82 under both." },
    ],
  },
  { id: "dr5-wf-14", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`SUM(total) OVER (PARTITION BY region ORDER BY id)` — order 3 is EU's second order (767.64). What's its running value?",
    choices: [
      "1760.99 — the storewide running total continues through it",
      "1344.18 — EU's walk restarted at its first order (576.54) and added 767.64",
      "576.54 — EU's total frozen at its first order",
      "416.81 — it inherits order 2's APAC total",
    ],
    answer: 1,
    why: "Probed: EU runs 576.54 → 1344.18 while APAC independently runs 416.81 → 575.29. PARTITION BY splits the ordering into per-region sequences; the storewide 1760.99 only exists in the unpartitioned version.",
    notes: [
      { choice: 0, why: "1760.99 is SUM(total) OVER (ORDER BY id) at id 3 — drop the PARTITION BY and the walk runs straight through every region." },
    ],
  },

  // ---------- edge ----------
  { id: "dr5-wf-15", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`AVG(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` — what happens on rows 1 and 2, before the band is full?",
    choices: [
      "SQLite errors — the frame extends past the data",
      "Rows 1 and 2 return NULL until three rows exist",
      "SQLite pads the missing rows with 0, dragging the average down",
      "The frame clips to what exists: row 1 averages one value (576.54), row 2 two (496.67), row 3 onward three (587.00)",
    ],
    answer: 3,
    why: "Frames clip at the partition's edge — never an error, never padding. Probed: 576.54, 496.67, 587.00, 447.64, 550.49. Early rows are honest but computed over fewer rows; dashboards must expect a ramp-up.",
    notes: [
      { choice: 1, why: "NULL requires an EMPTY frame — the before-only shape (…AND 1 PRECEDING) at row 1. Here the current row always exists, so the frame is never empty." },
    ],
  },
  { id: "dr5-wf-16", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "A stakeholder wants the running-total report to end with a grand-total row, spreadsheet-style. What does the window query actually return?",
    choices: [
      "104 rows: the 103 running rows plus a grand-total row",
      "1 row — the grand total",
      "The same 103 rows, no extra footer — the last row's running value (34833.28) IS the total",
      "An error — totals and detail can't share a result set",
    ],
    answer: 2,
    why: "Windows reshape values, never row counts: probed, 103 rows in → 103 rows out, and on empty input (WHERE 1=0) the window query returns 0 rows. The reconciliation — last running value 34833.28 = plain SUM — is the report's built-in footer check.",
    notes: [
      { choice: 3, why: "The whole point of the window is detail AND total in one pass — no error, no second query." },
    ],
  },
  { id: "dr5-wf-17", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`SELECT COUNT(*) OVER () FROM orders WHERE status = 'pending'` — what lands on each output row?",
    choices: [
      "103 — windows always see the full table",
      "14 — the window evaluates after WHERE, so the 'whole set' is the 14 survivors",
      "1 — each row counts itself",
      "14 on the first row, 1 on the last",
    ],
    answer: 1,
    why: "Probed: 14 rows out, every one carrying 14. The window's universe is whatever survived the filters — great for 'how big is my current crowd', a trap if you meant all 103 orders.",
    notes: [
      { choice: 0, why: "To count rows the WHERE removed, compute the universe before filtering — a staged CTE or a separate query — not inside this one." },
    ],
  },
  { id: "dr5-wf-18", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Alice's first order (767.64) starts her per-customer running column at 767.64 — while the storewide running total at the same id is already 1760.99. Why?",
    choices: [
      "PARTITION BY customer_id gives each customer a fresh walk — partitions don't inherit each other's sums",
      "Alice's earlier orders were filtered out by the window",
      "The window sorted Alice's rows before everyone else's",
      "767.64 is wrong — the first row of any running column is NULL",
    ],
    answer: 0,
    why: "Probed: Alice's line starts 767.64, 920.16, 1552.45 … at ids 3, 7, 13 — restart semantics, not a bug. The 1760.99 belongs to the unpartitioned walk, where every order accumulates into one sequence.",
    notes: [
      { choice: 3, why: "NULL on row 1 needs an empty frame — the …AND 1 PRECEDING shape (probed). The running frame always contains the current row." },
    ],
  },
  { id: "dr5-wf-19", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "What does `LAST_VALUE(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)` return?",
    choices: [
      "Each row's own total, like the default frame",
      "NULL — LAST_VALUE can't use explicit frames",
      "1088.44 — the maximum total",
      "324.16 on every row — the frame now reaches the true last order",
    ],
    answer: 3,
    why: "Probed: exactly one distinct value across all 103 rows — 324.16, order 103's total. Widening the right edge past CURRENT ROW is what makes LAST_VALUE mean 'last'; the default frame was the trap, not the function.",
    notes: [
      { choice: 2, why: "1088.44 is MAX(total) — the biggest order, not the positional last (probed: MAX 1088.44 vs the last id's 324.16)." },
    ],
  },
  { id: "dr5-wf-20", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`SUM(total) OVER (ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)` — no ORDER BY. What does SQLite do?",
    choices: [
      "Errors — frame offsets require ORDER BY",
      "Runs it — but 'the row before' is whatever physical order the engine walks, so results aren't stable",
      "Treats the frame as the whole table",
      "Returns NULL on every row",
    ],
    answer: 1,
    why: "Probed: no error. ROWS offsets count physical rows, which exist even unordered — unlike RANGE offsets, which error with 'RANGE with offset PRECEDING/FOLLOWING requires one ORDER BY expression'. Legal and meaningless without an order you trust.",
    notes: [
      { choice: 0, why: "Only the RANGE flavor demands ORDER BY — that's the probed error's exact wording. ROWS is silently nondeterministic instead, which is worse." },
    ],
  },
  { id: "dr5-wf-21", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Your running total prints 993.3499999999999 on order 2 — the books say 993.35. What happened?",
    choices: [
      "Binary floating-point accumulation dust on 2-decimal REALs — display with ROUND(SUM(total) OVER (ORDER BY id), 2)",
      "The window summed the wrong rows",
      "SQLite's SUM OVER accumulates in text, losing digits",
      "The ORDER BY id corrupted the arithmetic",
    ],
    answer: 0,
    why: "Probed: the raw window value at id 2 really is 993.3499999999999 — and ROUND(…,2) gives 993.35. The window added nothing wrong; REAL money arithmetic just carries binary representation noise.",
    notes: [
      { choice: 1, why: "Check the frame, not the paranoia: 576.54 + 416.81 are exactly the two rows in frame — the total is right, the representation is binary." },
    ],
  },
  { id: "dr5-wf-22", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`AVG(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING)` — what does row 1 return?",
    choices: [
      "576.54 — the row itself",
      "0 — an empty frame averages to zero",
      "NULL — the frame excludes the current row, and nothing exists before row 1",
      "An error — the frame is empty",
    ],
    answer: 2,
    why: "Probed: NULL, 576.54, 496.67, 587.00 for rows 1–4. This 'everything before me' frame is the no-LAG way to see the past — and its first row is honestly empty, because the current row is excluded by design.",
    notes: [
      { choice: 0, why: "That's the default frame's row-1 answer (current row included). The 1 PRECEDING end is what empties row 1's frame — probed, row 2 then shows 576.54, row 1's value." },
      { choice: 1, why: "AVG of nothing has no denominator — and probed, even SUM returns NULL on the empty before-frame, not 0." },
    ],
  },

  // ---------- errors ----------
  { id: "dr5-wf-23", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SUM(total) OVER (ORDER BY id ROWS BETWEEN 2 FOLLOWING AND 1 PRECEDING)` — what does SQLite say?",
    choices: [
      "unsupported frame specification — the start edge may not come after the end edge",
      "no such function: SUM",
      "near \"FOLLOWING\": syntax error",
      "It runs, returning each row's own total",
    ],
    answer: 0,
    why: "Probed verbatim. BETWEEN 2 FOLLOWING AND 1 PRECEDING asks for a band that ends before it starts — the grammar accepts the words, the frame check rejects the geometry. Same error probed for BETWEEN 2 FOLLOWING AND CURRENT ROW.",
    notes: [
      { choice: 3, why: "An empty frame computes quietly (SUM = NULL, probed on the before-frame), but reversed edges are refused outright — geometry, not emptiness." },
    ],
  },
  { id: "dr5-wf-24", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SUM(total) OVER (ORDER BY id PARTITION BY customer_id)` fails with near \"PARTITION\": syntax error. What's the fix?",
    choices: [
      "Drop the PARTITION BY — windows can't partition",
      "Swap the clauses: OVER (PARTITION BY customer_id ORDER BY id)",
      "Replace PARTITION BY with GROUP BY inside OVER",
      "Add a comma between the two clauses",
    ],
    answer: 1,
    why: "Probed verbatim: near \"PARTITION\": syntax error. OVER's grammar is a fixed sequence — PARTITION BY, then ORDER BY, then the frame — and the parser trips the moment ORDER BY is followed by anything that isn't a frame.",
    notes: [
      { choice: 2, why: "GROUP BY doesn't exist inside OVER — partitioning windows is PARTITION BY's only job." },
    ],
  },
  { id: "dr5-wf-25", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT id FROM orders WHERE COUNT(*) OVER () > 1` — what happens?",
    choices: [
      "It runs, keeping rows whose set holds more than one order",
      "near \"OVER\": syntax error",
      "misuse of window function COUNT() — windows evaluate after WHERE and can't filter rows",
      "It runs but returns no rows",
    ],
    answer: 2,
    why: "Probed verbatim: misuse of window function COUNT(). Windows are SELECT-stage annotations over the post-WHERE survivors — letting them back into WHERE would be circular. Filter first, or wrap the windowed query in a subquery and filter its output.",
    notes: [
      { choice: 0, why: "Even setting the error aside, windows can't filter — the engine refuses rather than return a filtered set. Per-customer counting needs PARTITION BY customer_id staged first, then HAVING." },
    ],
  },
  { id: "dr5-wf-26", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SUM(total) OVER (RANGE BETWEEN 1 PRECEDING AND CURRENT ROW)` — no ORDER BY. The engine answers:",
    choices: [
      "RANGE with offset PRECEDING/FOLLOWING requires one ORDER BY expression",
      "unsupported frame specification",
      "It runs — RANGE offsets don't need an order",
      "near \"RANGE\": syntax error",
    ],
    answer: 0,
    why: "Probed verbatim. A RANGE offset is a VALUE distance ('1 key-unit back'), which is meaningless without a sort key to measure against. The ROWS flavor runs order-free (probed) because row counts don't need a key — but don't rely on it.",
    notes: [
      { choice: 1, why: "That's the reversed-edges error (2 FOLLOWING AND 1 PRECEDING family) — a different diagnosis: geometry, not a missing key." },
    ],
  },
  { id: "dr5-wf-27", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT SUM(total) OVER ORDER BY id FROM orders` — what does SQLite say?",
    choices: [
      "It runs like OVER (ORDER BY id)",
      "no such function: OVER",
      "near \"ORDER\": syntax error",
      "near \"FROM\": syntax error — OVER's parentheses are mandatory, even when empty",
    ],
    answer: 3,
    why: "Probed: near \"FROM\": syntax error. Without the parens the parser sees a bare reference named OVER, then chokes when ORDER BY arrives. OVER () with empty parens is legal (probed: the constant-103 count); OVER without parens never is.",
    notes: [
      { choice: 2, why: "The complaint lands at FROM, not ORDER — by then the parser had already given up on the select list. The missing pair of () is the actual defect." },
    ],
  },
  { id: "dr5-wf-28", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT SUM(SUM(total) OVER ()) FROM orders` — what happens?",
    choices: [
      "It returns 34833.28 — the sums compose",
      "misuse of window function SUM() — you can't nest a window call inside an aggregate",
      "It returns 34833.28 squared",
      "near \"OVER\": syntax error",
    ],
    answer: 1,
    why: "Probed verbatim: misuse of window function SUM(). Aggregates fold rows; windows annotate them — one pass can't do both in the same call stack. If you truly need an aggregate OF a window result, stage the windowed rows in a subquery or CTE first.",
    notes: [
      { choice: 0, why: "SUM(total) OVER () does equal 34833.28 on every row — but the outer SUM can't consume a window call (probed refusal)." },
    ],
  },

  // ---------- predict ----------
  { id: "dr5-wf-29", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict the first three values of `SELECT ROUND(SUM(total) OVER (ORDER BY id), 2) FROM orders`.",
    choices: [
      "576.54, 416.81, 767.64 — the raw order totals",
      "34833.28, 34833.28, 34833.28",
      "576.54, 993.35, 1760.99",
      "1919.47, 2644.81, 3397.77",
    ],
    answer: 2,
    why: "Probed: 576.54 → 993.35 (+416.81) → 1760.99 (+767.64) → 1919.47 → 2644.81 → 3397.77 … The running column sums as it walks; choice A lists the steps, not the accumulation.",
    notes: [
      { choice: 1, why: "That's SUM(total) OVER () — no ORDER BY, no crawl: the constant 34833.28." },
      { choice: 3, why: "Real running values — but rows 4–6, not 1–3; the walk starts at the first order's own total." },
    ],
  },
  { id: "dr5-wf-30", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict the LAST row of `SELECT ROUND(SUM(total) OVER (ORDER BY id), 2) FROM orders`.",
    choices: [
      "34833.28 — equal to the plain SUM(total), the reconciliation",
      "338.19 — the average order",
      "324.16 — the last order's own total",
      "103 — the row count",
    ],
    answer: 0,
    why: "Probed: the walk ends 34509.12 (id 102) → 34833.28 (id 103) — identical to SUM(total) over the table. Every windowed report carries this free checksum: if the final running value ≠ the plain SUM, a filter or frame is lying.",
    notes: [
      { choice: 2, why: "324.16 is id 103's total — the last STEP, not the accumulated distance." },
    ],
  },
  { id: "dr5-wf-31", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Order 102's running total is 34509.12; order 103's own total is 324.16. What is order 103's running total?",
    choices: ["34509.12", "34833.28", "115.06", "103"],
    answer: 1,
    why: "Probed: 34509.12 + 324.16 = 34833.28 — the last running value absorbs the last order and lands on the storewide SUM. Running totals compose: each row's value is the previous value plus its own total.",
    notes: [
      { choice: 0, why: "That's id 102's running value — the walk takes one more step, adding 324.16." },
      { choice: 2, why: "115.06 is order 102's own total — a step size, not a position in the walk." },
    ],
  },
  { id: "dr5-wf-32", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict the distinct values of `SELECT DISTINCT region, ROUND(AVG(total) OVER (PARTITION BY region), 2) FROM orders o JOIN customers c ON c.id = o.customer_id`.",
    choices: [
      "LATAM 426.22, US 383.48, EU 335.32, APAC 313.66",
      "One value: 338.19 — the storewide average on every row",
      "EU 335.32 only — the biggest region wins",
      "103 different averages, one per order",
    ],
    answer: 0,
    why: "Probed via SELECT DISTINCT: exactly 4 rows — LATAM 426.22, US 383.48, EU 335.32, APAC 313.66. The partition average is constant within each region; DISTINCT collapses the annotation back to a readable census.",
    notes: [
      { choice: 1, why: "338.19 is AVG(total) with no partition — the grand average; the partition version ranges 313.66 to 426.22." },
    ],
  },
  { id: "dr5-wf-33", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Alice has 24 of the 103 orders. Predict `SELECT DISTINCT SUM(total) OVER (PARTITION BY customer_id)` restricted to her rows.",
    choices: [
      "338.19 — the average order",
      "34833.28 — the storewide total",
      "1088.44 — the biggest order in the store",
      "7262.35 — her lifetime spend, 20.85% of the store's 34833.28",
    ],
    answer: 3,
    why: "Probed: her 24 rows carry exactly one distinct partition sum, 7262.35 — and 100.0 × 7262.35 / 34833.28 = 20.85. This constant-per-partition column is the denominator that turns any order row into a %-of-customer-share.",
    notes: [
      { choice: 1, why: "34833.28 is what OVER () — no partition — yields on every row of the table." },
    ],
  },
  { id: "dr5-wf-34", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) FROM orders WHERE id = 3` — ids 2 and 3 total 416.81 and 767.64.",
    choices: ["496.67", "587.00", "767.64", "592.23"],
    answer: 3,
    why: "Probed: (416.81 + 767.64) / 2 = 592.23. The band holds exactly two rows — ids 2 and 3. 496.67 is id 2's answer ((576.54+416.81)/2), and 587.00 is the THREE-row band's (2 PRECEDING) answer at id 3.",
    notes: [
      { choice: 2, why: "767.64 is id 3's own total — what a CURRENT-ROW-only frame would give. The band here holds two rows." },
    ],
  },
  { id: "dr5-wf-35", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) FROM orders WHERE id = 5` — ids 3, 4, 5 total 767.64, 158.48, 725.34.",
    choices: ["441.91", "587.00", "550.49", "725.34"],
    answer: 2,
    why: "Probed: (767.64 + 158.48 + 725.34) / 3 = 550.49 — the band at id 5 holds exactly ids 3–5. 441.91 is id 5's one-row-narrower 1-PRECEDING answer; 587.00 is this band's answer back at id 3.",
    notes: [
      { choice: 0, why: "That's the 1 PRECEDING band at id 5: (158.48 + 725.34) / 2 — the same row, one row narrower." },
      { choice: 3, why: "725.34 is id 5's own total — what a CURRENT-ROW-only frame would give." },
    ],
  },
  { id: "dr5-wf-36", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT ROUND(SUM(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 2) FROM orders WHERE id = 4` — ids 1–3 total 576.54, 416.81, 767.64.",
    choices: [
      "1919.47 — everything through id 4",
      "1760.99 — everything BEFORE id 4",
      "NULL — the frame is empty",
      "767.64 — only id 3",
    ],
    answer: 1,
    why: "Probed: the before-frame sums 576.54 (id 2), 993.35 (id 3), 1760.99 (id 4) — the current row is excluded, so id 4's answer is the running total through id 3. 1919.47 is the default frame's answer — the current row included.",
    notes: [
      { choice: 2, why: "NULL only happens while the frame is empty — row 1's case (probed). By id 4 there are three rows to sum." },
    ],
  },
  { id: "dr5-wf-37", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT ROUND(SUM(total) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING), 2) FROM orders WHERE id = 3` — the grand total is 34833.28 and ids 1–2 total 576.54, 416.81.",
    choices: ["993.35", "34833.28", "1760.99", "33839.93"],
    answer: 3,
    why: "Probed: the tail at id 3 = 34833.28 − 576.54 − 416.81 = 33839.93 — everything from id 3 to the end. 993.35 is the BEFORE-frame's answer at the same id: same row, opposite window.",
    notes: [
      { choice: 2, why: "1760.99 is the running total THROUGH id 3 (default frame) — the accumulation, not the countdown." },
    ],
  },
  { id: "dr5-wf-38", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict the third row of the expense dashboard: `SELECT mo, SUM(amt) OVER (ORDER BY mo) FROM (SELECT strftime('%Y-%m', spent_on) mo, SUM(amount_cents)/100.0 amt FROM expenses GROUP BY mo)`.",
    choices: [
      "1917 — the month's own spend",
      "3159 — February's running value",
      "5076 — 1719 + 1440 + 1917",
      "25416 — every month at once",
    ],
    answer: 2,
    why: "Probed: month sums 1719, 1440, 1917, 1749, 1480 … and the running line 1719, 3159, 5076, 6825, 8305 … — the third month's value absorbs all three. Staging the month sums first keeps the window's grain monthly instead of per-expense-row.",
    notes: [
      { choice: 3, why: "That's SUM(amt) OVER () on the staged rows — no ORDER BY: the constant 25416 (probed grand total of expenses)." },
    ],
  },
  { id: "dr5-wf-39", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT ROUND(100.0 * total / SUM(total) OVER (), 2) FROM orders WHERE id = 1` — id 1's total is 576.54.",
    choices: [
      "0.97 — that's 100 divided by the 103-row count",
      "576.54 — the division didn't happen",
      "33.19 — the average order's size",
      "1.66 — id 1's share of lifetime revenue",
    ],
    answer: 3,
    why: "Probed: 100.0 × 576.54 / 34833.28 = 1.66. The window hands every row the same denominator (the grand constant) while the numerator stays the row's own — the %-of-total idiom. Shares run 1.66, 1.2, 2.2, 0.45 … across the first orders.",
    notes: [
      { choice: 2, why: "338.19 is the average order's SIZE in dollars — a share of total revenue is a different question entirely." },
    ],
  },

  // ---------- judgment ----------
  { id: "dr5-wf-40", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "The dashboard needs month-over-month change AND cumulative revenue. Which window goes in which column?",
    choices: [
      "LAG(rev) OVER (ORDER BY mon) for the change; SUM(rev) OVER (ORDER BY mon) for the cumulative",
      "SUM for both — one frame can produce both shapes",
      "LAG for both — offsets can produce totals too",
      "Neither: windows can't do either — use GROUP BY twice",
    ],
    answer: 0,
    why: "Offsets read ONE neighbor (the delta); the accumulating SUM keeps the whole path — the lesson's dashboard pair, both on the same month-bucket CTE. Probed shapes: the running line ends 34833.28; the delta column just starts blank where LAG finds no predecessor.",
    notes: [
      { choice: 1, why: "SUM's answer at row n is the total of the path; the CHANGE needs the previous value — a different read, LAG's job." },
    ],
  },
  { id: "dr5-wf-41", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "You need every order row PLUS its share of the customer's lifetime spend. Why is `total / SUM(total) OVER (PARTITION BY customer_id)` the right shape?",
    choices: [
      "GROUP BY customer_id with total/SUM(total) does the same in one query",
      "The window keeps all 103 rows AND provides the per-customer denominator inline — detail and total in one pass",
      "JOINing orders to a grouped copy of itself is the only way to get both",
      "Windows are faster than any alternative — always prefer them",
    ],
    answer: 1,
    why: "Probed: the partition constant is 7262.35 on all 24 of Alice's rows while her individual orders stay distinct — divide one by the other and every row gets its share (20.85% overall for Alice). GROUP BY would collapse to one row per customer and lose the detail this report is about.",
    notes: [
      { choice: 2, why: "The self-join works but pays a second scan and more SQL; the window is the honest one-pass shape here." },
      { choice: 3, why: "Speed isn't the argument — shape is: 103 annotated rows vs a collapsed summary. Pick by the output the report needs." },
    ],
  },
  { id: "dr5-wf-42", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Spec says: 'a 3-month moving average, current month included'. Which frame implements it?",
    choices: [
      "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW",
      "ROWS BETWEEN 3 PRECEDING AND CURRENT ROW",
      "ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING",
      "The default frame — it already means exactly this",
    ],
    answer: 0,
    why: "Three rows INCLUDING the current one = two rows back. Probed: the band yields 576.54, 496.67, 587.00, 447.64, 550.49 as it slides. '3-month window' in specs almost always means 'window of 3 ending at today', not '3 rows after'.",
    notes: [
      { choice: 1, why: "That band holds FOUR rows (3 back + current) — off-by-one is the classic frame bug; count the current row." },
      { choice: 3, why: "The default frame grows unboundedly — that's the running average (probed 576.54, 496.67, 587.00, 479.87 …), not a fixed 3-row band." },
    ],
  },
  { id: "dr5-wf-43", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A teammate's 'latest order so far' column using LAST_VALUE shows each row's own total. What's the durable fix?",
    choices: [
      "Order the rows differently and hope the frame follows",
      "Replace LAST_VALUE with MAX — same thing, safer",
      "FIRST_VALUE(total) OVER (ORDER BY id DESC) — anchor from the back, where FIRST has the honest meaning",
      "Add DISTINCT to the window call",
    ],
    answer: 2,
    why: "Probed: FIRST_VALUE over DESC gives 324.16 on every row — the true latest order — while default-frame LAST_VALUE can't escape CURRENT ROW. Reverse-anchor FIRST_VALUE is the habit that survives engines' default frames.",
    notes: [
      { choice: 1, why: "MAX is a comparison, not a position — probed MAX(total) = 1088.44, while the positional latest order is 324.16. Different questions." },
    ],
  },
  { id: "dr5-wf-44", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "The ask: 'monthly running spend'. Why stage month sums before windowing the expenses table?",
    choices: [
      "The window must walk the ASKED grain — staged month sums give a clean monthly walk (1719 → 3159 → 5076 …) instead of a noisy per-row one",
      "Windows only work on small tables — staging is a size limit",
      "SUM OVER can't be written directly on the expenses table",
      "GROUP BY mo already produces the running total",
    ],
    answer: 0,
    why: "Probed recipe: stage `strftime('%Y-%m', spent_on) mo, SUM(amount_cents)/100.0` then `SUM(amt) OVER (ORDER BY mo)` → 1719, 3159, 5076, 6825, 8305 … Window the grain you report at; windowing raw expense rows would sum line items in arrival order, not months.",
    notes: [
      { choice: 3, why: "GROUP BY gives the month sums but loses the walk — the running column is the window ON TOP of the staging." },
    ],
  },
  { id: "dr5-wf-45", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Report A wants one row per customer with lifetime spend. Report B wants every order row annotated with lifetime spend. Which tool for which?",
    choices: [
      "A: GROUP BY customer_id. B: SUM(total) OVER (PARTITION BY customer_id) — collapse vs annotate",
      "Both A and B: GROUP BY — it's always the aggregate tool",
      "Both A and B: the window — GROUP BY is legacy",
      "A: the window; B: GROUP BY — windows for summaries, groups for detail",
    ],
    answer: 0,
    why: "Output shape decides: GROUP BY folds to one row per customer; the window keeps all 103 order rows and repeats each partition's constant (Alice: 7262.35 on all 24, probed). Choosing by shape, not habit, is the judgment this module drills.",
    notes: [
      { choice: 3, why: "Backwards: the window is the detail-preserving tool — GROUP BY is the one that collapses." },
    ],
  },
];
