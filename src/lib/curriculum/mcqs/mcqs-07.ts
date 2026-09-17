// MCQ bank for Lesson 7 (aggregate functions).
// Existing inline MCQs are l7-q1..q4 — new items continue from q5.

import type { MCQ } from "../types";

export const mcqs07: MCQ[] = [
  {
    id: "l7-q5",
    prompt: "What does an aggregate function return for a group of rows?",
    options: [
      "One row per input row",
      "A single value summarizing the group",
      "The first row of the group",
      "A list of all values",
    ],
    answer: 1,
    explanation:
      "Collapse semantics: COUNT/SUM/AVG/MIN/MAX read a whole set of values and answer with one number. Without GROUP BY, the set is the entire table.",
  },
  {
    id: "l7-q6",
    prompt: "SELECT COUNT(*) FROM customers returns…",
    options: ["40", "37", "10", "1 row with 40"],
    answer: 3,
    explanation:
      "It returns ONE row containing the value 40 — a scalar answer, not 40 rows. (Both A and D are half-right; D is the precise one.)",
  },
  {
    id: "l7-q7",
    prompt: "The order count by clean status: delivered 55, shipped 36, pending 15. What does SUM of those three tell you?",
    options: [
      "nothing — you can't sum counts",
      "106 orders are in those three states (of 150) — a coverage check",
      "the average status",
      "106 distinct statuses",
    ],
    answer: 1,
    explanation:
      "Summing GROUP BY counts tells you how much of the table your three buckets cover: 106/150 — the remaining 44 are cancelled, returned, and all the messy variants.",
  },
  {
    id: "l7-q8",
    prompt: "AVG(total_amount) on all orders is ~483. AVG over only non-NULL totals uses which divisor?",
    options: [
      "150 — all rows",
      "144 — known totals only",
      "6",
      "it varies by query plan",
    ],
    answer: 1,
    explanation:
      "AVG = SUM(col)/COUNT(col): NULLs are excluded from BOTH parts. The average you report silently ignores 6 orders — say so in the footnote.",
  },
  {
    id: "l7-q9",
    prompt: "Which returns the count of DISTINCT products that appear in order_items?",
    options: [
      "COUNT(product_id)",
      "COUNT(DISTINCT product_id)",
      "SUM(DISTINCT product_id)",
      "DISTINCT COUNT(*)",
    ],
    answer: 1,
    explanation:
      "COUNT(product_id) counts lines (with duplicates); COUNT(DISTINCT product_id) counts unique products actually sold — a merchandising KPI.",
  },
  {
    id: "l7-q10",
    prompt: "MIN(signup_date) returns '2023-01-01'. Why does MIN work on dates here?",
    options: [
      "Dates are ISO text, so text MIN/MAX equals chronological MIN/MAX",
      "MIN only works on numbers — this is luck",
      "SQLite converts TEXT to DATE automatically",
      "MIN sorts by column length",
    ],
    answer: 0,
    explanation:
      "The ISO YYYY-MM-DD payoff again: lexicographic extremes are the chronological extremes. (MAX gives 2024-13-45 — an impossible date leaks out through MAX!)",
  },
  {
    id: "l7-q11",
    prompt: "MAX(lifetime_value) = 999999. Why is this MAX misleading as 'our best customer'?",
    options: [
      "MAX never lies",
      "One data-entry outlier dominates; the next-highest values are thousands — verify extremes before narrating",
      "MAX ignores REAL columns",
      "It counts NULLs",
    ],
    answer: 1,
    explanation:
      "Extremes are where data errors live. A robust follow-up: ORDER BY lifetime_value DESC LIMIT 5 and eyeball the top rows (Lesson 5 pattern).",
  },
  {
    id: "l7-q12",
    prompt: "MIN(total_amount) on orders is -155.11. As an analyst this tells you…",
    options: [
      "we owe a customer money — a refund/returns artifact, worth investigating",
      "totals can't be negative — the query is broken",
      "MIN is broken",
      "nothing",
    ],
    answer: 0,
    explanation:
      "MIN/MAX are your impossibility detectors: negative totals (returns logged as negative?), rating 99, stock -3. Each extreme is a thread to pull.",
  },
  {
    id: "l7-q13",
    prompt: "COUNT(*) - COUNT(phone) on customers equals…",
    options: ["0", "13 — the missing phone count", "40", "27"],
    answer: 1,
    explanation:
      "The NULL audit one-liner: rows minus known values = missing values. Run it for every column you care about — 10 seconds, permanent insight.",
  },
  {
    id: "l7-q14",
    prompt: "Why does SUM(quantity) with quantity NULL rows still return a number?",
    options: [
      "NULLs count as 0 in SUM",
      "SUM simply skips NULL rows — conceptually like ignoring them, not adding 0",
      "quantity has no NULLs",
      "SUM errors but recovers",
    ],
    answer: 1,
    explanation:
      "Subtle difference: SUM doesn't add 0s, it ignores the rows. The practical effect matches 'treat as 0', but for COUNT the same rule changes the denominator — that's where it bites.",
  },
  {
    id: "l7-q15",
    prompt: "SELECT SUM(price * stock_quantity) FROM products returns ~714432. Which products contributed?",
    options: [
      "all 32 products",
      "only the ~26 with BOTH price and stock known — NULL on either side nullifies the product's contribution",
      "only Electronics",
      "only products with stock > 0",
    ],
    answer: 1,
    explanation:
      "price × stock is NULL if either operand is NULL (1 NULL price, 5 NULL stocks). The 'inventory value' skips those rows — a material footnote for finance.",
  },
  {
    id: "l7-q16",
    prompt: "AVG(rating) on reviews is 4.44, but AVG over valid 1–5 ratings is 3.49. The gap exists because…",
    options: [
      "impossible ratings (99, 7, 6, 0) entered the first average",
      "AVG ignores NULLs — so that's not it",
      "ratings are text",
      "rounding",
    ],
    answer: 0,
    explanation:
      "The 99 rating alone adds ~0.5 to the raw average. Lesson: aggregate over a VALIDITY filter (WHERE rating BETWEEN 1 AND 5), not the raw column.",
  },
  {
    id: "l7-q17",
    prompt: "Which single SELECT returns both the total order count and the count with known totals?",
    options: [
      "SELECT COUNT(*), COUNT(total_amount) FROM orders",
      "SELECT COUNT(*) FROM orders AND COUNT(total_amount)",
      "two queries are the only way",
      "SELECT COUNT(*) + COUNT(total_amount) FROM orders",
    ],
    answer: 0,
    explanation:
      "Multiple aggregates in one SELECT are fine — each collapses independently. The 150/144 pair IS the missing-data report.",
  },
  {
    id: "l7-q18",
    prompt: "What does AVG(quantity) = 1.92 on order_items hide?",
    options: [
      "the 6 NULL quantities and the 13 zero/negative rows still inside the math",
      "nothing — 1.92 is exact",
      "the average is of DISTINCT values",
      "NULLs divide by zero",
    ],
    answer: 0,
    explanation:
      "AVG skips the 6 NULLs but INCLUDES the 0 and -1 quantities, dragging the average down. Filter to quantity > 0 for 'real basket size'.",
  },
  {
    id: "l7-q19",
    prompt: "ROUND(AVG(total_amount), 2) — what changed vs plain AVG?",
    options: [
      "the underlying data",
      "only the display precision of the aggregate result",
      "which rows are included",
      "nothing at all",
    ],
    answer: 1,
    explanation:
      "ROUND wraps the aggregate and formats the answer (432.29 instead of 432.2933...). Wrapping functions around aggregates is the normal pattern.",
  },
  {
    id: "l7-q20",
    prompt: "COUNT(DISTINCT city) on customers returns 24ish messy values. What's the analyst read?",
    options: [
      "we serve 24 cities",
      "overstated — case/space variants inflate it; the true number of distinct cities is lower",
      "cities are broken beyond repair",
      "COUNT DISTINCT is unreliable",
    ],
    answer: 1,
    explanation:
      "' Madrid', 'MADRID', 'Madrid ' each count. The distinct count is an UPPER BOUND on reality — report it as such until cleaned.",
  },
  {
    id: "l7-q21",
    prompt: "Which computes revenue per line item correctly (ignoring discount complexity)?",
    options: [
      "SELECT SUM(unit_price * quantity) AS gross FROM order_items",
      "SELECT unit_price * quantity FROM order_items",
      "SELECT SUM(unit_price) + SUM(quantity) FROM order_items",
      "SELECT SUM(unit_price * quantity, 2) FROM order_items",
    ],
    answer: 0,
    explanation:
      "Aggregate the row-wise product: SUM over the computed line values. B returns 328 rows (no collapse); C adds a price to a quantity (nonsense units); D's extra arg is invalid.",
  },
  {
    id: "l7-q22",
    prompt: "Aggregates without GROUP BY treat the whole table as…",
    options: [
      "an error",
      "one single group",
      "one group per row",
      "NULL",
    ],
    answer: 1,
    explanation:
      "SELECT COUNT(*) FROM orders collapses all 150 rows into one answer row. GROUP BY (Lesson 8) splits the table into many groups, one answer each.",
  },
  {
    id: "l7-q23",
    prompt: "How many aggregate functions does Foundations cover, and which is NOT among them?",
    options: [
      "COUNT, SUM, AVG, MIN, MAX — and RANK is not",
      "COUNT, SUM, JOIN, AVG, MAX",
      "SUM, COUNT, WHERE, MIN",
      "AVG, MEDIAN, MODE, COUNT",
    ],
    answer: 0,
    explanation:
      "The Big Five aggregates cover most analyst questions at this level. RANK and window functions belong to a later module.",
  },
  {
    id: "l7-q24",
    prompt: "SELECT COUNT(*) FROM orders WHERE is_gift = 1 returns 24. SELECT COUNT(is_gift) FROM orders returns 110. What does 110 - 24 NOT tell you?",
    options: [
      "non-gift orders with a known flag (86)",
      "it mixes categories: COUNT(is_gift) includes non-gift AND gift rows with known flags",
      "the number of NULL flags (40) comes from COUNT(*) - COUNT(is_gift)",
      "nothing — all three statements are derivable",
    ],
    answer: 3,
    explanation:
      "Trick question — all statements hold: 150 total, 110 known flags, 40 NULL flags, 24 gifts, 86 non-gifts. Multi-aggregate thinking keeps your counts honest.",
  },
  {
    id: "l7-q25",
    prompt: "Why is COUNT(DISTINCT customer_id) = 42 ≠ COUNT(*) FROM customers = 40?",
    options: [
      "SQLite miscounts",
      "Distinct ids in ORDERS count only customers who ordered (42 unique stored ids incl. orphans?) — different populations per table, plus orphan id 999 isn't a real customer",
      "40 is wrong",
      "DISTINCT adds one per NULL",
    ],
    answer: 1,
    explanation:
      "Populations differ: customers table lists 40 shoppers; distinct customer_ids in orders reflect who actually bought (plus defects like 999). Cross-table counting needs JOINs — Module 2.",
  },
  {
    id: "l7-q26",
    prompt: "Which is the correct way to average only DELIVERED order totals?",
    options: [
      "SELECT AVG(total_amount) FROM orders WHERE status = 'delivered' AND total_amount IS NOT NULL",
      "SELECT AVG(total_amount) FROM orders HAVING status = 'delivered'",
      "SELECT AVG(status) FROM orders",
      "SELECT AVG(total_amount) FROM delivered",
    ],
    answer: 0,
    explanation:
      "Filter rows first (WHERE), then aggregate. The IS NOT NULL guard is optional (AVG skips NULLs) but documents intent. HAVING before grouping is illegal here.",
  },
  {
    id: "l7-q27",
    prompt: "SUM(discount) on order_items returns a big number that means nothing. Why?",
    options: [
      "SUM is broken",
      "Mixed scales: fractions (0.15 = 15%) and whole numbers (15 = 15%?) and 120s — summing mixed units is meaningless",
      "NULLs poisoned it",
      "discount is text",
    ],
    answer: 1,
    explanation:
      "Aggregates assume consistent units. Our discount column mixes fraction-scale and percent-scale values — SUM/AVG output looks plausible and is garbage. Detect first (MIN/MAX/DISTINCT), then clean.",
  },
  {
    id: "l7-q28",
    prompt: "Which query answers 'how many distinct suppliers do we actually buy from?' most honestly?",
    options: [
      "COUNT(DISTINCT supplier) — 12ish, inflated by spelling variants",
      "COUNT(DISTINCT LOWER(TRIM(supplier))) — normalizes case/spaces first",
      "COUNT(supplier)",
      "MAX(supplier)",
    ],
    answer: 1,
    explanation:
      "A small taste of cleaning inside the aggregate: LOWER(TRIM(...)) merges 'Acme Corp'/'acme corp' before counting. (Full cleaning needs CASE/GROUP BY — later modules.)",
  },
  {
    id: "l7-q29",
    prompt: "What's the fastest health report for reviews.rating?",
    options: [
      "SELECT COUNT(*), COUNT(rating), MIN(rating), MAX(rating), ROUND(AVG(rating),2) FROM reviews",
      "SELECT * FROM reviews",
      "SELECT rating FROM reviews ORDER BY rating",
      "SELECT SUM(rating) FROM reviews",
    ],
    answer: 0,
    explanation:
      "One row: 110 total · 107 known · min 0 (!) · max 99 (!) · avg 4.44 (skewed). Five numbers that scream 'data needs a validity filter' — the professional opening move.",
  },
  {
    id: "l7-q30",
    prompt: "MIN and MAX on order_date return '2024-01-11' and '2025-08-26'. What business window does that give you?",
    options: [
      "The dataset spans ~20 months of order activity — useful for defining reporting periods",
      "Nothing — dates have no extremes",
      "Two broken dates only",
      "The average order date",
    ],
    answer: 0,
    explanation:
      "MIN/MAX on dates = your data's time envelope. Every 'monthly trend' or 'Q1 vs Q2' question starts by knowing the envelope (and spotting the 2024-13-45 weirdo in signup_date).",
  },
];
