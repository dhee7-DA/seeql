// MCQ bank for Lesson 6 (DISTINCT).
// Existing inline MCQs are l6-q1..q4 — new items continue from q5.

import type { MCQ } from "../types";

export const mcqs06: MCQ[] = [
  {
    id: "l6-q5",
    prompt: "SELECT DISTINCT country FROM customers returns 26 rows from 40 customers. What does 26 count?",
    options: [
      "customers with a country",
      "unique stored spellings of country — including chaos variants",
      "countries per customer",
      "the most frequent country",
    ],
    answer: 1,
    explanation:
      "DISTINCT dedupes exact stored text. 26 spellings exist because 'US', 'usa', 'United States' etc. all count separately — mess inflates distinct counts.",
  },
  {
    id: "l6-q6",
    prompt: "How many unique stored city values start with 'Berlin' or a variant of it (e.g. 'berlin ')?",
    options: ["1", "2", "3 including 'berlin ' with a trailing space", "5"],
    answer: 2,
    explanation:
      "'Berlin', 'Berlin ' (trailing space… stored variants include 'berlin ') — DISTINCT sees every character, so near-duplicates stay separate values.",
  },
  {
    id: "l6-q7",
    prompt: "DISTINCT applies to…",
    options: [
      "the first column only",
      "the entire selected row combination",
      "NULLs are never deduped",
      "only numeric columns",
    ],
    answer: 1,
    explanation:
      "SELECT DISTINCT city, tier removes rows where BOTH repeat. 'Berlin·gold' and 'Berlin·silver' are distinct pairs even though Berlin repeats.",
  },
  {
    id: "l6-q8",
    prompt: "What does SELECT DISTINCT loyalty_tier FROM customers return here — and what's the count?",
    options: [
      "gold, silver, bronze — 3 rows",
      "11 rows: every stored spelling plus one NULL row",
      "40 rows",
      "an error",
    ],
    answer: 1,
    explanation:
      "DISTINCT keeps one row per stored value: 10 spelling variants + NULL (which DISTINCT treats as its own single value). Counting rows in DISTINCT output is a quick mess-detector.",
  },
  {
    id: "l6-q9",
    prompt: "Which counts unique countries correctly AND shows how many customers map to each?",
    options: [
      "SELECT DISTINCT country, COUNT(*) FROM customers",
      "SELECT country, COUNT(*) FROM customers GROUP BY country",
      "SELECT COUNT(DISTINCT country) FROM customers GROUP BY country",
      "SELECT UNIQUE country FROM customers",
    ],
    answer: 1,
    explanation:
      "'Unique values with counts' is GROUP BY territory (Lesson 8). DISTINCT alone can't attach aggregates — option A is the classic beginner error.",
  },
  {
    id: "l6-q10",
    prompt: "COUNT(DISTINCT country) returns 26. After a future cleanup merges spellings, the same query returns 12. What changed?",
    options: [
      "The query",
      "The data — same query, fewer distinct stored values after normalization",
      "The database engine",
      "Nothing — DISTINCT is random",
    ],
    answer: 1,
    explanation:
      "Distinct counts are a data-quality metric: watching 26 → 12 over time proves your cleaning worked. Analysts track this number per column.",
  },
  {
    id: "l6-q11",
    prompt: "How does DISTINCT treat NULL?",
    options: [
      "Every NULL is its own row — never deduped",
      "All NULLs collapse into ONE NULL row",
      "NULLs are dropped",
      "NULLs error",
    ],
    answer: 1,
    explanation:
      "The asymmetry from Lesson 4: comparisons can't equate NULLs, but DISTINCT and GROUP BY treat them as one value. SELECT DISTINCT phone shows one NULL row for the 13 missing phones.",
  },
  {
    id: "l6-q12",
    prompt: "Which columns would make the most useful DISTINCT for 'how many real cities do we serve?'",
    options: [
      "DISTINCT city — raw",
      "None — city needs cleaning first; a raw distinct count of 24+ overstates reality",
      "DISTINCT customer_id",
      "DISTINCT country, city, tier",
    ],
    answer: 1,
    explanation:
      "' Madrid' vs 'Madrid' vs 'MADRID' inflate the raw count. Knowing WHEN a distinct count is lying is more valuable than running it.",
  },
  {
    id: "l6-q13",
    prompt: "SELECT DISTINCT product_id FROM reviews — what does its row count represent?",
    options: [
      "total reviews",
      "the number of distinct products that received at least one review",
      "average reviews per product",
      "products with 5 stars",
    ],
    answer: 1,
    explanation:
      "One row per reviewed product. Pairing with COUNT(*) on products (32) tells you how many products were never reviewed — coverage analysis with two queries.",
  },
  {
    id: "l6-q14",
    prompt: "DISTINCT city returns 'New York' and 'new york' as two rows. Which statement is TRUE?",
    options: [
      "A bug — DISTINCT must be case-insensitive",
      "Correct — DISTINCT dedupes by exact stored text; case differs, values differ",
      "New York should be NULL",
      "Only GROUP BY dedupes case",
    ],
    answer: 1,
    explanation:
      "Exactness is the feature: DISTINCT never silently merges. Cleanup (LOWER/TRIM) is an explicit decision — nothing hides it from you.",
  },
  {
    id: "l6-q15",
    prompt: "Which is TRUE about SELECT DISTINCT * FROM orders?",
    options: [
      "It dedupes only the id column",
      "It removes rows where ALL columns are identical — here, nothing (ids are unique), so all 150 rows return",
      "It's invalid syntax",
      "It sorts the output",
    ],
    answer: 1,
    explanation:
      "With a unique PK in the list, no full-row duplicates can exist. DISTINCT * is almost always a mistake or a no-op — dedupe the columns you mean.",
  },
  {
    id: "l6-q16",
    prompt: "You want the pair-list of (payment_method, status) actually present in orders. Best query?",
    options: [
      "SELECT payment_method, status FROM orders LIMIT 50",
      "SELECT DISTINCT payment_method, status FROM orders",
      "SELECT payment_method + status FROM orders",
      "SELECT DISTINCT payment_method FROM orders, SELECT DISTINCT status FROM orders",
    ],
    answer: 1,
    explanation:
      "DISTINCT over two columns yields unique combinations — including NULL-payment/NULL-status pairs. That combination grid is your de facto data dictionary.",
  },
  {
    id: "l6-q17",
    prompt: "DISTINCT output order is…",
    options: [
      "alphabetical by definition",
      "not guaranteed — add ORDER BY when the order matters",
      "insertion order",
      "random",
    ],
    answer: 1,
    explanation:
      "DISTINCT never promises order (it often arrives sorted by the engine's hash/group step — never rely on it). DISTINCT + ORDER BY is the complete recipe.",
  },
  {
    id: "l6-q18",
    prompt: "Which query finds whether any two customers share an email (raw, stored text)?",
    options: [
      "SELECT email FROM customers",
      "SELECT email, COUNT(*) FROM customers GROUP BY email HAVING COUNT(*) > 1",
      "SELECT DISTINCT email FROM customers",
      "SELECT COUNT(email) FROM customers",
    ],
    answer: 1,
    explanation:
      "DISTINCT alone hides duplicates; GROUP BY + HAVING (Lesson 8) exposes them. Our raw data has 2 duplicated email groups — try the B pattern.",
  },
  {
    id: "l6-q19",
    prompt: "How many DISTINCT stored status values does orders have (incl. NULL)?",
    options: ["5", "17", "18", "150"],
    answer: 2,
    explanation:
      "18: 5 clean values × casing/space variants + 'cancelld' + NULL. COUNT(DISTINCT status) vs the '5 expected' is exactly how you detect enum chaos.",
  },
  {
    id: "l6-q20",
    prompt: "Why is DISTINCT often a symptom of a missing GROUP BY (for analysts)?",
    options: [
      "DISTINCT is slower",
      "When you next want counts/sums per unique value, you must re-switch to GROUP BY — DISTINCT answers only 'which values exist?'",
      "GROUP BY is deprecated",
      "They're identical; style only",
    ],
    answer: 1,
    explanation:
      "DISTINCT = unique listing. GROUP BY = unique listing + per-group aggregates. Reaching for DISTINCT when the question says 'how many of each' means you'll rewrite it anyway.",
  },
  {
    id: "l6-q21",
    prompt: "SELECT DISTINCT supplier FROM products returns 12 rows for 5 real companies. The extra 7 are…",
    options: [
      "7 extra suppliers",
      "case/space variants like 'acme corp' and 'WAYNE LOGISTICS' — same companies, different text",
      "NULLs",
      "product names",
    ],
    answer: 1,
    explanation:
      "Supplier chaos in miniature: Acme Corp ×5 plus 'acme corp' ×1, etc. A distinct-count vs expected-count gap is a data-quality alarm.",
  },
  {
    id: "l6-q22",
    prompt: "Which returns each city ONCE with a stable alphabetical order?",
    options: [
      "SELECT DISTINCT city FROM customers ORDER BY city",
      "SELECT city FROM customers ORDER BY city",
      "SELECT DISTINCT city FROM customers SORTED",
      "SELECT UNIQUE city FROM customers",
    ],
    answer: 0,
    explanation:
      "DISTINCT for uniqueness + ORDER BY for determinism. Option B returns 40 rows (duplicates included). UNIQUE is not a SQLite SELECT keyword.",
  },
  {
    id: "l6-q23",
    prompt: "DISTINCT on order_items.discount shows 49 rows. What does that reveal?",
    options: [
      "49 discount rates — including the mixed-scale mess (0.05…0.29 fractions AND 11…120 whole numbers)",
      "49 orders",
      "the max discount",
      "nothing useful",
    ],
    answer: 0,
    explanation:
      "A 'simple' column should hold 2–3 distinct discounts. 49 distinct values (183 NULLs aside) screams inconsistent capture — visible in one DISTINCT.",
  },
  {
    id: "l6-q24",
    prompt: "Which counts how many products have NEVER been reviewed?",
    options: [
      "32 - COUNT(DISTINCT product_id FROM reviews) — coverage gap via two counts",
      "SELECT COUNT(*) FROM reviews",
      "SELECT DISTINCT COUNT(*) FROM products",
      "COUNT(product_id) FROM products",
    ],
    answer: 0,
    explanation:
      "Catalog size (32) minus reviewed-product count. (The exact comparison needs JOIN/NOT EXISTS — Module 2 — but the two-count framing works today.)",
  },
  {
    id: "l6-q25",
    prompt: "SELECT DISTINCT rating FROM reviews ORDER BY rating returns how many rows, and what's at the bottom (DESC)?",
    options: [
      "10 rows; NULL last in DESC with 99 just above it",
      "5 rows; 5 last",
      "9 rows; error on NULL",
      "3 rows; NULL first",
    ],
    answer: 0,
    explanation:
      "Ratings present: 0,1,2,3,4,5,6,7,99 = 9 non-NULL + 1 NULL = 10 rows; in DESC, NULL lands last, with the impossible 99 right above it.",
  },
  {
    id: "l6-q26",
    prompt: "Which pair of queries proves phone-number format chaos?",
    options: [
      "SELECT DISTINCT phone FROM customers — one glance at 27 unique formats",
      "SELECT phone FROM customers LIMIT 5",
      "COUNT(phone) and COUNT(*)",
      "SELECT MAX(phone) FROM customers",
    ],
    answer: 0,
    explanation:
      "DISTINCT phone lists every stored variant: '+1 212…', '(030) …', '090-…', etc. Formats that should follow one standard show up as dozens of distinct strings.",
  },
  {
    id: "l6-q27",
    prompt: "For a dropdown UI of valid status filters, you'd run…",
    options: [
      "SELECT * FROM orders",
      "SELECT DISTINCT status FROM orders ORDER BY status — then curate the real values from the mess",
      "SELECT COUNT(status) FROM orders",
      "SELECT status FROM orders LIMIT 18",
    ],
    answer: 1,
    explanation:
      "Real analyst workflow: DISTINCT the column, recognize the 5 canonical values among 18 spellings, and document the mapping for the team.",
  },
  {
    id: "l6-q28",
    prompt: "DISTINCT city, country returns fewer rows than DISTINCT city alone when…",
    options: [
      "never — more columns can only add or keep combinations",
      "the country is always the same",
      "there are no NULLs",
      "cities repeat across countries",
    ],
    answer: 0,
    explanation:
      "Adding columns refines the uniqueness grain: combinations can only multiply. (It can't reduce below the single-column count — a quick mental check on any DISTINCT.)",
  },
  {
    id: "l6-q29",
    prompt: "How many distinct is_gift values exist in orders?",
    options: ["2 — 0 and 1", "3 — 0, 1 and NULL", "1", "24"],
    answer: 1,
    explanation:
      "0 (×86), 1 (×24) and NULL (×40). A two-state flag with 27% unknowns — DISTINCT exposes the third, undocumented state instantly.",
  },
  {
    id: "l6-q30",
    prompt: "The one-line summary of DISTINCT for analysts:",
    options: [
      "DISTINCT removes rows randomly to speed queries",
      "DISTINCT answers 'which exact values/combinations exist?' — and its row count is a data-quality signal",
      "DISTINCT replaces GROUP BY for aggregates",
      "DISTINCT only works on numbers",
    ],
    answer: 1,
    explanation:
      "Use it to enumerate (dropdowns, dictionaries, coverage checks) and to sense mess (distinct-count inflation). Aggregates need GROUP BY — next lesson.",
  },
];
