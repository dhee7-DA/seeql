// Keyword Mastery bank — NTILE MCQs (kb-nt-q01..q10).
// Facts probed via scripts/m5-facts.ts: NTILE(4) over 16 customers = 4/4/4/4;
// NTILE(5) over 16 = 4/3/3/3/3; NTILE(10) over 16 = 2,2,2,2,2,2,1,1,1,1;
// NTILE(3) over 103 orders = 35/34/34; NTILE(4) over 103 = 26/26/26/25;
// total-desc tile bounds 489.33+/285.10+/136.11+/25.47+.
import type { Mcq } from "../types";

export const windowMcqsNt: Mcq[] = [
  {
    id: "kb-nt-q01", difficulty: "easy",
    prompt: "What does NTILE(4) OVER (ORDER BY total DESC) assign to each row?",
    choices: [
      "The row's rank among all rows",
      "A bucket number 1–4, splitting the rows into four roughly equal tiles",
      "The row's percentage position",
      "The quartile value of the total column",
    ],
    answer: 1,
    why: "NTILE(n) is the bucket-distributor window function: it numbers rows 1..n across the window so each tile holds roughly the same count. NTILE(4) builds quartiles — the top quarter of orders, the second quarter, and so on — regardless of the totals' actual values. It distributes POSITIONS, not values.",
  },
  {
    id: "kb-nt-q02", difficulty: "easy",
    prompt: "NTILE(4) over the 16-customer directory splits it how?",
    choices: ["5/5/5/1", "4/4/4/4", "6/6/6/-2", "Depends on the data values"],
    answer: 1,
    why: "16 rows into 4 tiles divides evenly: 4/4/4/4. NTILE's whole contract is equal-count tiles when the division is clean — it never looks at the values, only at positions within the window ORDER BY. The tile membership depends on the ordering; the counts depend on the arithmetic.",
  },
  {
    id: "kb-nt-q03", difficulty: "medium",
    prompt: "NTILE(5) over those same 16 customers splits how?",
    choices: ["4/3/3/3/3", "3/3/3/3/4 — same thing, order differs", "5/5/5/5/−4", "Cannot split 16 into 5 — it errors"],
    answer: 0,
    why: "With 16 rows and 5 tiles, the remainder 1 is distributed from the FRONT: the first tile gets the extra row (16 = 3×5 + 1 → tiles of 4,3,3,3,3). NTILE's rule: every tile gets ⌊16/5⌋ = 3 rows, and the first ⌈16 mod 5⌉ = 1 tile gets one more. Earlier tiles are always the larger ones.",
  },
  {
    id: "kb-nt-q04", difficulty: "medium",
    prompt: "NTILE(3) over the 103 orders yields which tile sizes?",
    choices: ["34/34/35 — last tile largest", "35/34/34 — first tile largest", "33/35/35", "103/0/0"],
    answer: 1,
    why: "103 = 34×3 + 1, so every tile gets 34 rows and the FIRST tile absorbs the remainder: 35/34/34. The front-loading rule is consistent — remainders flow to the earliest tiles, never the last. Over 103 orders NTILE(4) similarly reads 26/26/26/25.",
  },
  {
    id: "kb-nt-q05", difficulty: "medium",
    prompt: "What happens when NTILE(10) runs over only 16 rows?",
    choices: [
      "Error — more tiles than rows",
      "Tiles 1–6 get 2 rows each, tiles 7–10 get 1 each — every tile stays non-empty",
      "The first 10 rows are numbered, the rest NULL",
      "NTILE caps at 4",
    ],
    answer: 1,
    why: "NTILE tolerates n > row count: 16 = 6×2 + 4 → the first six tiles take the extra (2,2,2,2,2,2) and the remaining four tiles get one row each. No tile is ever empty when rows exist — the bucket arithmetic just runs out of surplus. Only NTILE(0) or a negative errors.",
  },
  {
    id: "kb-nt-q06", difficulty: "medium",
    prompt: "The top quartile by total (NTILE(4), total DESC) starts at what minimum on the seed's 103 orders?",
    choices: ["489.33", "338.19 (the average)", "285.10", "1088.44"],
    answer: 0,
    why: "The first tile holds the 26 biggest orders, and its cheapest member — the quartile's floor — is 489.33. Note the contrast with percentile thinking: the average total (338.19) is a VALUE landmark, while the NTILE boundary is a COUNT landmark. The top quartile's floor sits well above the average because big orders outnumber the middle. Tile 2 starts at 285.10.",
    notes: [{ choice: 2, why: "285.10 is the second tile's floor — where the second quartile begins, not the first." }],
  },
  {
    id: "kb-nt-q07", difficulty: "easy",
    prompt: "Which problem is NTILE built for?",
    choices: [
      "Finding the single maximum row",
      "Chopping a ranked population into equal-count segments — top quarter, middle half, bottom quarter",
      "Removing duplicate rows",
      "Padding result sets to a fixed size",
    ],
    answer: 1,
    why: "NTILE answers segmentation questions: quartiles, deciles, terciles — any equal-count chopping of a ranked population. The lifetime-spend quartiles on this seed put Alice Chen's 7262.35 crowd in tile 1 and the 444.80-floor crowd in tile 4. Extremes are MAX/row_number work; segments are NTILE work.",
  },
  {
    id: "kb-nt-q08", difficulty: "hard",
    prompt: "Why do NTILE quartiles of lifetime spend NOT align with value thresholds like 'spend > 1000'?",
    choices: [
      "Because NTILE is probabilistic",
      "Because tiles are equal-COUNT slices of the ranking while thresholds are equal-VALUE slices — a spend threshold can leave any number of rows on either side",
      "Because NTILE ignores the ORDER BY",
      "They always align by construction",
    ],
    answer: 1,
    why: "NTILE(4) guarantees four groups of (here) 4 customers each; a value cut at 1000.00 splits wherever the values happen to fall — on this seed that cut catches far fewer than half the customers. Equal-count and equal-value segmentation are different contracts, and reports that conflate them mislabel their audiences. When the brief says 'top quartile', NTILE is the faithful reading; when it says 'spenders over X', WHERE is.",
  },
  {
    id: "kb-nt-q09", difficulty: "medium",
    prompt: "How does PARTITION BY interact with NTILE?",
    choices: [
      "It does not — NTILE is always global",
      "Tiles re-form inside each partition: NTILE(4) PARTITION BY region splits each region's rows into its own four tiles",
      "It sums the tiles across partitions",
      "It turns NTILE into RANK",
    ],
    answer: 1,
    why: "The window definition scopes everything: NTILE(4) OVER (PARTITION BY region ORDER BY total DESC) numbers tiles 1–4 independently inside each region — EU's 8 customers tile 2/2/2/2 while LATAM's single customer is tile 1 and there is no tile 2 there. Each partition runs its own bucket arithmetic from 1.",
  },
  {
    id: "kb-nt-q10", difficulty: "medium",
    prompt: "NTILE(4) OVER (ORDER BY total ASC) versus the same with DESC — what changes?",
    choices: [
      "Nothing, tiles are order-independent",
      "Tile numbers flip: the smallest totals take tile 1 under ASC, the biggest take tile 1 under DESC",
      "Tile sizes change",
      "DESC is illegal in a window ORDER BY",
    ],
    answer: 1,
    why: "The tile arithmetic (26/26/26/25 over 103 orders) is fixed, but membership follows the window ORDER BY direction: ASC puts the 25.47 floor-crowd in tile 1, DESC puts the 1088.44 ceiling-crowd in tile 1. Direction decides WHO is 'top' — the one part of the semantics the analyst must get right, because the tile label '1' is where dashboards look first.",
  },
];
