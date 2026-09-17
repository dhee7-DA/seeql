// MCQ bank for Lesson 4 (NULL handling).
// Existing inline MCQs are l4-q1..q4 — new items continue from q5.

import type { MCQ } from "../types";

export const mcqs04: MCQ[] = [
  {
    id: "l4-q5",
    prompt: "A comparison like total_amount > 100 where total_amount is NULL evaluates to…",
    options: ["TRUE", "FALSE", "UNKNOWN — the third logical state", "0"],
    answer: 2,
    explanation:
      "Any comparison with a NULL operand yields UNKNOWN. It is not FALSE — that distinction is exactly why NULL rows silently vanish from WHERE results.",
  },
  {
    id: "l4-q6",
    prompt: "How many orders have a NULL total_amount?",
    options: ["0", "6", "13", "150"],
    answer: 1,
    explanation:
      "6 of 150 orders. Any aggregate or filter on total_amount quietly ignores them unless you look for them explicitly.",
  },
  {
    id: "l4-q7",
    prompt: "WHERE discount >= 0.5 keeps the discount = 120 rows. What about rows with discount NULL?",
    options: [
      "kept — NULL is treated as very large",
      "kept — NULL fails the >= test as FALSE",
      "dropped — the comparison is UNKNOWN, and WHERE only keeps TRUE",
      "an error is raised",
    ],
    answer: 2,
    explanation:
      "UNKNOWN is neither TRUE nor FALSE — it never passes WHERE. 183 order lines have NULL discount; they vanish from every discount comparison.",
  },
  {
    id: "l4-q8",
    prompt: "UNKNOWN AND TRUE equals…",
    options: ["TRUE", "FALSE", "UNKNOWN — it could still go either way", "NULL text"],
    answer: 2,
    explanation:
      "One TRUE isn't enough for AND; the unknown side could still be FALSE. But UNKNOWN OR TRUE is TRUE — one TRUE settles an OR.",
  },
  {
    id: "l4-q9",
    prompt: "NOT (discount > 0.5) on a row where discount is NULL gives…",
    options: ["TRUE", "FALSE", "UNKNOWN", "an error"],
    answer: 2,
    explanation:
      "The inner test is UNKNOWN; NOT UNKNOWN is UNKNOWN. This kills the tempting bug WHERE NOT (x > 100) to 'find small or missing values' — missing ones still don't show.",
  },
  {
    id: "l4-q10",
    prompt: "Which query actually returns the 13 customers without a phone number?",
    options: [
      "WHERE phone = NULL",
      "WHERE phone IS NULL",
      "WHERE phone = 'NULL'",
      "WHERE NOT phone",
    ],
    answer: 1,
    explanation:
      "IS NULL is the dedicated emptiness test. A returns nothing (comparison with NULL is UNKNOWN), C compares against a 4-letter text, D is not a condition.",
  },
  {
    id: "l4-q11",
    prompt: "How many orders have no customer attached (customer_id IS NULL)?",
    options: ["6", "7", "13", "1"],
    answer: 1,
    explanation:
      "7 orders have customer_id NULL (guest/unknown). Separately, 6 more point at customer ids that don't exist — two different defects: NULL vs orphan.",
  },
  {
    id: "l4-q12",
    prompt: "NULL vs orphan — which pair describes our orders correctly?",
    options: [
      "7 NULL customer_ids, 6 orphaned ids (like 999)",
      "6 NULL customer_ids, 7 orphans",
      "13 orphans, 0 NULLs",
      "0 defects",
    ],
    answer: 0,
    explanation:
      "NULL = the slot is empty. Orphan = a value is present but points nowhere. Both break joins differently — NULLs drop out of inner joins, orphans silently match nothing.",
  },
  {
    id: "l4-q13",
    prompt: "COUNT(*) vs COUNT(total_amount) on orders returns…",
    options: [
      "150 and 144 — the count of a column skips its NULLs",
      "150 and 150 — identical always",
      "144 and 150",
      "6 and 6",
    ],
    answer: 0,
    explanation:
      "COUNT(*) counts rows; COUNT(col) counts known values. The 6-row gap IS the NULL total count — a handy auditing trick.",
  },
  {
    id: "l4-q14",
    prompt: "AVG(total_amount) over orders divides by…",
    options: [
      "150 — all rows",
      "144 — only rows with a known total",
      "6 — the NULLs",
      "0 — it errors",
    ],
    answer: 1,
    explanation:
      "SUM and AVG skip NULLs, so the divisor is the non-NULL count (144), not the row count. Your average silently ignores 6 orders.",
  },
  {
    id: "l4-q15",
    prompt: "SUM(total_amount) treats the 6 NULL totals as…",
    options: [
      "0 — they add nothing but don't poison the sum",
      "NULL — the whole result becomes NULL",
      "the average of the others",
      "an error",
    ],
    answer: 0,
    explanation:
      "Aggregates skip NULLs: SUM works and returns the sum of known values. Contrast with scalar math: NULL + 100 IS NULL. Aggregates forgive; arithmetic propagates.",
  },
  {
    id: "l4-q16",
    prompt: "How many reviews have no rating at all (rating IS NULL)?",
    options: ["0", "3", "12", "110"],
    answer: 1,
    explanation:
      "3 reviews. Note the histogram also contains impossible ratings: 0 (×3), 6, 7, and 99 — NULLs are only ONE flavor of dirty rating.",
  },
  {
    id: "l4-q17",
    prompt: "Which counts reviews that DID choose a rating (any value, even 99)?",
    options: [
      "COUNT(*)",
      "COUNT(rating)",
      "COUNT(DISTINCT rating)",
      "SUM(rating)",
    ],
    answer: 1,
    explanation:
      "COUNT(rating) counts non-NULL ratings: 107 of 110. COUNT(*) would also count the 3 rating-less rows; DISTINCT counts unique values.",
  },
  {
    id: "l4-q18",
    prompt: "Why does WHERE NOT (status = 'delivered') fail to list the 4 NULL-status orders?",
    options: [
      "It lists them — the claim is wrong",
      "status = 'delivered' is UNKNOWN for them, and NOT UNKNOWN is UNKNOWN — still not TRUE",
      "NULL statuses were deleted",
      "NOT only works on numbers",
    ],
    answer: 1,
    explanation:
      "The three-valued logic trap: negating 'delivered?' doesn't create 'everything else' — the unknown rows stay in limbo. Add OR status IS NULL explicitly.",
  },
  {
    id: "l4-q19",
    prompt: "A WHERE clause has two sides: is_gift = 1 AND total_amount > 200. A row with is_gift NULL and total 300…",
    options: [
      "passes — 300 > 200 is TRUE",
      "fails — UNKNOWN AND TRUE is UNKNOWN",
      "passes — OR was meant",
      "errors",
    ],
    answer: 1,
    explanation:
      "AND needs BOTH sides TRUE. One UNKNOWN poisons it (40 orders have NULL is_gift — many silently disappear from such filters).",
  },
  {
    id: "l4-q20",
    prompt: "IS NOT NULL is best described as…",
    options: [
      "the opposite of IS NULL — TRUE when the value exists",
      "a comparison against the text 'NOT NULL'",
      "the same as != NULL",
      "a sorting command",
    ],
    answer: 0,
    explanation:
      "IS NOT NULL returns TRUE exactly when a real value is present. It's the standard guard before top-N lists (as in our LTV ranking case study).",
  },
  {
    id: "l4-q21",
    prompt: "Why did the top-LTV case study filter lifetime_value IS NOT NULL before ranking?",
    options: [
      "NULLs would sort as the biggest values in DESC order",
      "NULLs would crash ORDER BY",
      "To hide poor customers",
      "NULLs sort first in DESC here — they'd hijack the top of the list",
    ],
    answer: 3,
    explanation:
      "In SQLite, NULLs sort FIRST ascending and LAST descending... in practice we exclude them because 'unknown' is not a rank. 8 customers have NULL LTV.",
  },
  {
    id: "l4-q22",
    prompt: "Two NULL cells appear in one column. Are they 'equal' to each other?",
    options: [
      "Yes — NULL = NULL is TRUE",
      "No — each comparison with NULL yields UNKNOWN, even NULL vs NULL",
      "They merge automatically",
      "Only in GROUP BY",
    ],
    answer: 1,
    explanation:
      "Comparisons never see through NULLs — yet GROUP BY and DISTINCT DO treat NULLs as one group/value. Comparison says unknown; grouping says same. A famous asymmetry.",
  },
  {
    id: "l4-q23",
    prompt: "Which expression safely converts a NULL discount to 0 for math (COALESCE)?",
    options: [
      "COALESCE(discount, 0)",
      "discount + 0",
      "ISNULL(discount) — SQLite spelling",
      "discount OR 0",
    ],
    answer: 0,
    explanation:
      "COALESCE(a, b) returns the first non-NULL argument. discount + 0 stays NULL. (SQLite also accepts IFNULL — COALESCE is the portable standard.)",
  },
  {
    id: "l4-q24",
    prompt: "The email column has 3 NULLs and 1 value 'not-an-email'. Which statement is TRUE?",
    options: [
      "All 4 rows are unusable",
      "NULL emails and malformed emails are different defects needing different handling",
      "'not-an-email' is a NULL",
      "Emails are always valid",
    ],
    answer: 1,
    explanation:
      "Missing (IS NULL) vs malformed (present but wrong) are distinct data-quality classes with different fixes — detection queries must cover both.",
  },
  {
    id: "l4-q25",
    prompt: "SELECT COUNT(*) FROM reviews WHERE rating = 99 returns 1. What does COUNT(*) FROM reviews WHERE rating != 99 return?",
    options: ["109 — everything except that one", "106 — the NULL ratings also fail != ", "110", "99"],
    answer: 1,
    explanation:
      "107 non-NULL ratings minus the 99-row = 106. The 3 NULL-rating rows fail rating != 99 (UNKNOWN), so they're excluded too. NULLs break negation intuition.",
  },
  {
    id: "l4-q26",
    prompt: "Which is TRUE about ORDER BY and NULLs in SQLite?",
    options: [
      "NULLs sort first ascending, last descending — always at an extreme",
      "NULLs sort in the middle",
      "NULLs cause an error",
      "NULLs are randomly placed",
    ],
    answer: 0,
    explanation:
      "SQLite pins NULLs at one end (you can override with NULLS FIRST/LAST). When scanning a ranked list, check the extreme for a NULL cluster.",
  },
  {
    id: "l4-q27",
    prompt: "How many order lines have NULL unit_price?",
    options: ["0", "6", "13", "183"],
    answer: 1,
    explanation:
      "6 lines. Their line value (unit_price × quantity) computes to NULL — so SUMs of line values undercount revenue slightly, silently.",
  },
  {
    id: "l4-q28",
    prompt: "You want 'orders with missing totals OR missing customers' in one count. Which WHERE works?",
    options: [
      "WHERE total_amount IS NULL AND customer_id IS NULL",
      "WHERE total_amount IS NULL OR customer_id IS NULL",
      "WHERE total_amount = NULL OR customer_id = NULL",
      "WHERE NULL IN (total_amount, customer_id)",
    ],
    answer: 1,
    explanation:
      "'Either kind of missing' = OR of the two IS NULL tests. AND would demand both missing in the same row (rarer). Try it: the OR version counts 13 rows.",
  },
  {
    id: "l4-q29",
    prompt: "Why is '= NULL' the most dangerous bug in this lesson?",
    options: [
      "It errors loudly, stopping your work",
      "It returns zero rows SILENTLY — no error, just wrong-looking empty results",
      "It deletes data",
      "It converts NULLs to zeros",
    ],
    answer: 1,
    explanation:
      "Silent wrongness is the worst failure mode for analysis. If a query returns 'suspiciously nothing', check for = NULL first.",
  },
  {
    id: "l4-q30",
    prompt: "Data-quality habit of the lesson: for any numeric column you report on, first run…",
    options: [
      "SELECT * and read every row",
      "COUNT(*), COUNT(col), MIN, MAX — the gap between the two counts and absurd extremes reveal NULLs and outliers",
      "ORDER BY RANDOM",
      "nothing — trust the schema",
    ],
    answer: 1,
    explanation:
      "The 4-number health check: COUNT(*) - COUNT(col) = missing count; MIN/MAX expose impossibles (rating 99, LTV 999999, total -155.11). Ten seconds that save reports.",
  },
];
