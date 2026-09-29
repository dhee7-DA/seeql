// Keyword Mastery bank — PERCENT_RANK & CUME_DIST MCQs, part A (kb-pr-q01..q14).
// Facts probed via scripts/m5-facts.ts: lifetime-spend ranking (16 customers,
// desc): Alice 7262.35 pr 0.0 / cd 0.0625; Emma 6640.56 pr 0.0667 / cd 0.125;
// Grace 4574.23 pr 0.1333 / cd 0.1875; Maya 3644.56 pr 0.2 / cd 0.25. Top-row
// cume_dist over 103 orders = 1/103 ≈ 0.009709. All 103 totals distinct.
import type { Mcq } from "../types";

export const windowMcqsPrA: Mcq[] = [
  {
    id: "kb-pr-q01", difficulty: "easy",
    prompt: "What range does PERCENT_RANK() span across a partition?",
    choices: ["1 to 100", "0 to 1 inclusive — best row is 0", "0 to 1, best row is 1", "-1 to 1"],
    answer: 1,
    why: "PERCENT_RANK is a window function computing (rank − 1) / (rows − 1): the FIRST row of the ordering gets 0 and the last gets 1. Under an ORDER BY total DESC, the champion carries percent_rank 0 — 'zero rows are better than this one'. Read it as 'share of rows strictly below me'.",
  },
  {
    id: "kb-pr-q02", difficulty: "easy",
    prompt: "CUME_DIST() answers which question?",
    choices: [
      "The cumulative sum of the value column",
      "The fraction of rows in the partition at or below the current row's window position — 'cumulative distribution'",
      "The count of distinct values",
      "The average of everything so far",
    ],
    answer: 1,
    why: "CUME_DIST counts the rows ≤ (or ≥, under DESC) the current position — peers INCLUDED — divided by the partition size. It is the running percentile: the top spender of 16 customers carries 1/16 = 0.0625, the top two carry 2/16 = 0.125. Nothing sums — it is a position census, not an aggregate.",
  },
  {
    id: "kb-pr-q03", difficulty: "medium",
    prompt: "On the seed's 16-customer lifetime-spend ranking (DESC), CUME_DIST for the top spender is…",
    choices: ["0", "0.0625", "0.125", "1.0"],
    answer: 1,
    why: "One of sixteen customers sits at or above the top spot: 1/16 = 0.0625. The same row's PERCENT_RANK is 0 — the pair differs by their tie philosophy: percent_rank excludes the row itself from the count, cume_dist includes it. Alice Chen's 7262.35 opens the distribution at exactly one-sixteenth.",
  },
  {
    id: "kb-pr-q04", difficulty: "medium",
    prompt: "Second place (Emma, 6640.56 of 16 customers) carries which pair?",
    choices: [
      "percent_rank 0.0667, cume_dist 0.125",
      "percent_rank 0.125, cume_dist 0.0667",
      "percent_rank 1, cume_dist 1",
      "percent_rank 0, cume_dist 0",
    ],
    answer: 0,
    why: "percent_rank = (2−1)/(16−1) = 1/15 ≈ 0.0667; cume_dist = 2/16 = 0.125. The denominators differ — percent_rank divides by rows MINUS one, cume_dist by rows — so the two curves drift apart and only meet at the extremes… actually they meet only at the bottom (both 1). The percentile pair is a two-dial instrument: relative standing versus cumulative share.",
  },
  {
    id: "kb-pr-q05", difficulty: "easy",
    prompt: "What does PERCENT_RANK() return for the LAST row of any ordering?",
    choices: ["0", "0.5", "1", "It depends on the data"],
    answer: 2,
    why: "The last row's rank equals the row count, so (n − 1)/(n − 1) = 1 — always. The distribution's endpoints are structural, not data-driven: percent_rank 0 at the head, 1 at the tail, every row mapped linearly between. CUME_DIST also ends at 1 (n/n) — but its head is 1/n, not 0.",
  },
  {
    id: "kb-pr-q06", difficulty: "medium",
    prompt: "The key behavioral difference between the two: with TIED values, which function gives ties the SAME number?",
    choices: [
      "CUME_DIST — ties share the cumulative position (all peers get the same value)",
      "PERCENT_RANK — ties share the rank-derived value",
      "Both do",
      "Neither — both are unique per row",
    ],
    answer: 2,
    why: "Both are tie-aware, but differently: PERCENT_RANK derives from RANK, so all tied rows share one value (peers count once as 'rank', then the count of peers folds into the cumulative number for cume_dist). CUME_DIST gives all peers the value at the TOP of their tie block — the last peer's cumulative share. Distinct-value columns (like this seed's 103 distinct totals) hide the difference; tie-heavy data exposes it.",
  },
  {
    id: "kb-pr-q07", difficulty: "medium",
    prompt: "Over the 103 orders ordered by total DESC, the champion's CUME_DIST is…",
    choices: ["0", "1/103 ≈ 0.0097", "0.5", "1"],
    answer: 1,
    why: "One row of 103 sits at or above the top: 1/103 ≈ 0.009709. Compare with its PERCENT_RANK of exactly 0 — the head row is where the two functions are furthest apart in spirit (zero standing versus one-ten-thousandth share). The probed value is a nice engine receipt: DISTINCT totals mean every cume_dist step is exactly k/103.",
  },
  {
    id: "kb-pr-q08", difficulty: "medium",
    prompt: "Which problem is the PERCENT_RANK/CUME_DIST pair built for that NTILE cannot answer precisely?",
    choices: [
      "Equal-count segmentation",
      "Continuous relative standing — 'this customer is richer than 87.5% of the base' — with no bucket boundaries",
      "Running totals",
      "Finding the maximum",
    ],
    answer: 1,
    why: "NTILE chops into fixed-count buckets (quartiles: 4/4/4/4 customers); the percentile pair gives every row its exact continuous position — 0.0625, 0.125, 0.1875… When the brief says 'top 6.25% of customers', that IS cume_dist ≤ 0.0625 with no bucket rounding. Buckets summarize; percentiles locate.",
  },
  {
    id: "kb-pr-q09", difficulty: "hard",
    prompt: "Pareto check: you want the share of revenue coming from the top 25% of orders. Which window composition is honest?",
    choices: [
      "CUME_DIST() OVER (ORDER BY total DESC) <= 0.25 flags the top-25% cohort in a derived table, then SUM over the flag — the concentration read",
      "PERCENT_RANK alone computes the revenue share directly",
      "NTILE(4) returns the share in tile 1 automatically",
      "AVG(total) * 0.25",
    ],
    answer: 0,
    why: "CUME_DIST over total DESC labels each row with its cumulative population share; rows at or under 0.25 form the top quartile cohort, and summing their totals against the grand 34833.28 yields the concentration. The functions LOCATE rows; the revenue share is a follow-on aggregation over the located cohort. percent_rank would work too (its ≤-semantics differ only at ties), but ntile's 26/26/26/25 split approximates the quartile by count — fine here, but the percentile is the exact statement.",
  },
  {
    id: "kb-pr-q10", difficulty: "medium",
    prompt: "Both functions require which clause, always?",
    choices: ["GROUP BY", "An OVER clause — they are window functions", "JOIN", "DISTINCT"],
    answer: 1,
    why: "PERCENT_RANK and CUME_DIST are pure window functions: no OVER, no value — the parser rejects them. Their entire meaning (partition, ordering, ties) lives in the OVER clause, exactly like ROW_NUMBER and the value functions. Writing them without a window is a syntax error, not a NULL.",
  },
  {
    id: "kb-pr-q11", difficulty: "medium",
    prompt: "With PARTITION BY status in the window, CUME_DIST resets how?",
    choices: [
      "It never resets",
      "Each status group runs its own distribution: the top row of each partition carries 1/partition_size, and every partition ends at 1",
      "It sums across partitions",
      "It returns NULL outside the first partition",
    ],
    answer: 1,
    why: "PARTITION BY scopes the census: pending's 14 orders produce a distribution ending at 1 with head 1/14; delivered's 52 orders do the same at 1/52 granularity. Two rows with identical totals in different partitions carry different cume_dists — the window definition (partition + ordering) defines the population being positioned.",
  },
  {
    id: "kb-pr-q12", difficulty: "easy",
    prompt: "Which output format do both functions share?",
    choices: ["Integers", "Doubles between 0 and 1", "Percent strings like '42%'", "Dates"],
    answer: 1,
    why: "Both return floating-point shares — 0.0625, 0.125, 0.009709 — never formatted percent strings. Multiply by 100 and ROUND at the display layer if the deck wants '6.25%'. Keeping them as raw shares in SQL means they compose: cume_dist ≤ 0.25 is a filterable fact, not a string to parse.",
  },
  {
    id: "kb-pr-q13", difficulty: "hard",
    prompt: "A single-row partition (LATAM, one customer) — what do the two functions return there?",
    choices: [
      "percent_rank 0, cume_dist 1",
      "Both 0",
      "Both 1",
      "NULL — percentiles need many rows",
    ],
    answer: 0,
    why: "percent_rank = (1−1)/(1−1) — the engine defines 0/0 as 0, so the sole row reads 0 ('nothing below me'). cume_dist = 1/1 = 1 ('everyone at or above me is me'). The endpoints differ even in degenerate partitions: percent_rank anchors at zero, cume_dist at full share. Both are defined — no NULL escape hatch.",
  },
  {
    id: "kb-pr-q14", difficulty: "medium",
    prompt: "PERCENT_RANK's denominator is (rows − 1). With 16 customers, what fraction does the 9th-ranked spender carry?",
    choices: ["9/16", "8/15 ≈ 0.5333", "8/16 = 0.5", "1/9"],
    answer: 1,
    why: "Rank 9 → (9 − 1)/(16 − 1) = 8/15 ≈ 0.5333 — just past the median. CUME_DIST for the same row reads 9/16 = 0.5625. The one-row denominator offset keeps the two percentiles close but never equal above the head; knowing which denominator each uses turns 'why don't these match?' from a mystery into arithmetic.",
  },
];
