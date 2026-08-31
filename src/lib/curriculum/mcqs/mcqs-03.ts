// MCQ bank for Lesson 3 (WHERE filtering).
// Existing inline MCQs are l3-q1..q4 — new items continue from q5.

import type { MCQ } from "../types";

export const mcqs03: MCQ[] = [
  {
    id: "l3-q5",
    prompt: "WHERE runs on…",
    options: [
      "the whole table once, as a batch",
      "each row individually, keeping only rows where the condition is TRUE",
      "only the first 100 rows",
      "columns, not rows",
    ],
    answer: 1,
    explanation:
      "WHERE is a per-row test. Of 150 orders, each is evaluated independently; only TRUE rows survive into the rest of the query.",
  },
  {
    id: "l3-q6",
    prompt: "How many rows does WHERE status = 'delivered' keep in orders?",
    options: ["150", "55", "66 including 'delivered ' and 'DELIVERED'", "0"],
    answer: 1,
    explanation:
      "Exactly 55 — text comparison is case- and space-exact. The variants 'delivered ', 'DELIVERED' and 'Delivered' do NOT match (they add to 66 total).",
  },
  {
    id: "l3-q7",
    prompt: "WHERE country = 'US' on customers returns 0 rows. The 2 US-based customers are stored as…",
    options: [
      "'USA'",
      "'United States' — the stored spelling differs from your guess",
      "NULL",
      "There are no US customers",
    ],
    answer: 1,
    explanation:
      "Our data stores the full name 'United States'. Enumerate the actual values (or use LIKE / GROUP BY) before assuming codes — a daily analyst lesson.",
  },
  {
    id: "l3-q8",
    prompt: "Which condition finds orders worth more than 500?",
    options: [
      "WHERE total_amount > 500",
      "WHERE total_amount = >500",
      "WHERE 500 < total_amount > 1000",
      "WHERE total_amount MORE 500",
    ],
    answer: 0,
    explanation:
      "Standard comparison operators: > >= < <= = != (or <>). Chained math like option C is not SQL.",
  },
  {
    id: "l3-q9",
    prompt: "country = 'DE' AND city = 'Berlin' keeps a row only when…",
    options: [
      "at least one condition holds",
      "both conditions hold for that same row",
      "neither condition holds",
      "the row is from Switzerland",
    ],
    answer: 1,
    explanation:
      "AND is strict: both sides must be TRUE for the row. One FALSE (or UNKNOWN) fails the whole test.",
  },
  {
    id: "l3-q10",
    prompt: "OR is more generous than AND. status = 'returned' OR status = 'cancelled' keeps…",
    options: [
      "only orders that are both",
      "orders in either state — 7 + 9 = 16 rows here",
      "everything except those two",
      "nothing — OR needs parentheses",
    ],
    answer: 1,
    explanation:
      "OR passes if ANY side is TRUE: returned (7) + cancelled (9) = 16 rows in the clean spellings.",
  },
  {
    id: "l3-q11",
    prompt: "NOT country = 'DE' is best read as…",
    options: [
      "keep rows where country is not exactly 'DE'",
      "delete German rows from the table",
      "keep only German rows",
      "convert DE to uppercase",
    ],
    answer: 0,
    explanation:
      "NOT negates the test per row. Careful: rows where country is NULL fail this too — NOT UNKNOWN is still UNKNOWN (Lesson 4).",
  },
  {
    id: "l3-q12",
    prompt: "price BETWEEN 10 AND 30 includes which endpoints?",
    options: [
      "neither 10 nor 30",
      "only 30",
      "both 10 and 30 — it is a closed range",
      "it depends on the column type",
    ],
    answer: 2,
    explanation:
      "BETWEEN is inclusive on both ends: price >= 10 AND price <= 30. To exclude, write explicit > and < comparisons.",
  },
  {
    id: "l3-q13",
    prompt: "Which is equivalent to country IN ('DE', 'AT', 'CH')?",
    options: [
      "country = 'DE' AND country = 'AT' AND country = 'CH'",
      "country = 'DE' OR country = 'AT' OR country = 'CH'",
      "country LIKE 'DE AT CH'",
      "country BETWEEN 'DE' AND 'CH'",
    ],
    answer: 1,
    explanation:
      "IN is shorthand for a chain of ORs on the same column — one value from the set. ANDing would demand three countries at once (impossible).",
  },
  {
    id: "l3-q14",
    prompt: "email LIKE '%@example.com' matches…",
    options: [
      "emails starting with @example.com",
      "emails ending in @example.com",
      "any email containing example somewhere",
      "exactly the text @example.com",
    ],
    answer: 1,
    explanation:
      "% matches any run of characters (even empty), so the pattern anchors on the ending. For 'contains', use %term%.",
  },
  {
    id: "l3-q15",
    prompt: "In LIKE patterns, what does the underscore _ match?",
    options: [
      "any run of characters",
      "exactly one character",
      "a literal underscore only — never",
      "whitespace",
    ],
    answer: 1,
    explanation:
      "_ = exactly one character (city LIKE '_ondon' matches London). To match a literal underscore, escape it — rarely needed here.",
  },
  {
    id: "l3-q16",
    prompt: "In SQLite, payment_method LIKE '%card%' matches 'Credit Card' and 'CREDITCARD' too. Why?",
    options: [
      "LIKE is case-insensitive for ASCII letters by default in SQLite",
      "The data is normalized",
      "LIKE ignores spaces",
      "% matches any single letter",
    ],
    answer: 0,
    explanation:
      "SQLite's LIKE ignores ASCII case — '%card%' catches all 70 card-ish orders (credit_card, debit_card, Credit Card, CREDITCARD). Equality (=) stays case-sensitive — a crucial asymmetry.",
  },
  {
    id: "l3-q17",
    prompt: "WHERE discount > 0.5 on order_items also catches the discount = 120 rows. What are those?",
    options: [
      "generous holiday discounts",
      "mixed-scale data corruption: some rows store 0.15 (15%), others store 15 or 120 as whole numbers",
      "percentage points stored correctly",
      "NULL stand-ins",
    ],
    answer: 1,
    explanation:
      "Our order_items.discount mixes fraction-scale (0.05–0.29) and percent-scale (11–120) values — 53 rows are >= 1. Filtering surfaces the mess; cleaning is a later module.",
  },
  {
    id: "l3-q18",
    prompt: "Which query finds orders that are gifts AND were delivered?",
    options: [
      "WHERE is_gift = 1 AND status = 'delivered' — 10 rows here",
      "WHERE is_gift = 1 OR status = 'delivered'",
      "WHERE is_gift LIKE 'delivered'",
      "WHERE is_gift AND status",
    ],
    answer: 0,
    explanation:
      "Both facts must hold → AND. Option D is a classic bug: bare columns aren't conditions (SQLite may silently coerce, other engines error).",
  },
  {
    id: "l3-q19",
    prompt: "What does this return: SELECT COUNT(*) FROM orders WHERE total_amount > 500 OR status = 'shipped'?",
    options: [
      "rows that are BOTH expensive and shipped",
      "the union: expensive orders plus shipped orders (with double-counting removed by counting rows once)",
      "an error — OR needs AND first",
      "the average of the two counts",
    ],
    answer: 1,
    explanation:
      "OR unions the two row-sets; each row is counted once even if it satisfies both sides. Try it: the count sits between each side's individual count and their sum.",
  },
  {
    id: "l3-q20",
    prompt: "country = 'DE' OR city = 'Berlin' AND price < 20 — SQL evaluates this as…",
    options: [
      "(country = 'DE' OR city = 'Berlin') AND price < 20",
      "country = 'DE' OR (city = 'Berlin' AND price < 20) — AND binds tighter",
      "left to right, like reading",
      "randomly",
    ],
    answer: 1,
    explanation:
      "AND has higher precedence than OR. If you meant the first reading, add parentheses. This is the single most common WHERE logic bug.",
  },
  {
    id: "l3-q21",
    prompt: "Which finds products whose name starts with 'USB'?",
    options: [
      "product_name = 'USB%'",
      "product_name LIKE 'USB%'",
      "product_name LIKE '%USB'",
      "product_name IN ('USB')",
    ],
    answer: 1,
    explanation:
      "LIKE 'USB%' anchors the prefix: USB-C Hub 7-in-1 and USB-C Cable 2m match. = 'USB%' compares against the literal text including the percent sign.",
  },
  {
    id: "l3-q22",
    prompt: "signup_date LIKE '2023%' matches how many customers?",
    options: ["0", "37", "40", "3"],
    answer: 1,
    explanation:
      "37 customers signed up in 2023 (dates are ISO text, so the prefix pattern works). LIKE is the go-to tool for year/month prefixes on ISO date strings.",
  },
  {
    id: "l3-q23",
    prompt: "Which returns the SAME rows as WHERE quantity >= 1?",
    options: [
      "WHERE quantity > 1",
      "WHERE NOT quantity < 1",
      "WHERE quantity = 1 OR quantity > 0",
      "WHERE quantity BETWEEN 0 AND 1",
    ],
    answer: 1,
    explanation:
      "NOT quantity < 1 is quantity >= 1 (for non-NULL values). A: excludes exactly 1; C: is everything positive plus 1; D: includes 0. Only B matches.",
  },
  {
    id: "l3-q24",
    prompt: "Why does WHERE rating BETWEEN 1 AND 5 exclude the rating = 0 and rating = 99 rows in reviews?",
    options: [
      "BETWEEN caps values at 5 automatically",
      "0 < 1 fails the lower bound; 99 > 5 fails the upper bound — out-of-range rows simply don't pass",
      "Ratings are text",
      "It doesn't exclude them",
    ],
    answer: 1,
    explanation:
      "Plain range logic. That's why BETWEEN 1 AND 5 is also your data-quality filter: 98 of 110 reviews pass, exposing 12 suspicious ratings.",
  },
  {
    id: "l3-q25",
    prompt: "status IN ('pending', 'shipped') on orders matches 15 + 36 rows. Why NOT the 'pending ' rows (trailing space)?",
    options: [
      "IN ignores trailing spaces",
      "IN compares exact text — 'pending ' is a different value",
      "Trailing spaces are illegal in SQLite",
      "It does match them",
    ],
    answer: 1,
    explanation:
      "Exact comparison again: 'pending ' (2 rows) is a distinct spelling. Enumerate or normalize — never assume textual equality beyond the characters.",
  },
  {
    id: "l3-q26",
    prompt: "Which WHERE clause safely expresses 'unknown shipping city'?",
    options: [
      "WHERE shipping_city = NULL",
      "WHERE shipping_city IS NULL",
      "WHERE shipping_city = 'NULL'",
      "WHERE NOT shipping_city",
    ],
    answer: 1,
    explanation:
      "IS NULL is the only test that returns TRUE for missing values. = NULL yields UNKNOWN for every row (23 shipping cities are NULL here).",
  },
  {
    id: "l3-q27",
    prompt: "How many order lines have a quantity problem (NULL, zero or negative)?",
    options: ["0", "13", "19", "328"],
    answer: 2,
    explanation:
      "6 NULL + 7 zero/negative = 13 fail quantity <= 0 checks; counting NULLs too gives 19 problem lines. WHERE quantity <= 0 silently drops the 6 NULLs!",
  },
  {
    id: "l3-q28",
    prompt: "total_amount BETWEEN 100 AND 500 matches how many orders?",
    options: ["70", "37", "12", "150"],
    answer: 0,
    explanation:
      "70 orders sit in the closed range [100, 500]. (37 are above 500; some are NULL and fail any comparison.)",
  },
  {
    id: "l3-q29",
    prompt: "Which query lists cancelled OR returned orders with their ids, newest first?",
    options: [
      "SELECT id, status FROM orders WHERE status IN ('cancelled','returned') ORDER BY order_date DESC",
      "SELECT id, status FROM orders WHERE status = 'cancelled' AND 'returned'",
      "SELECT id, status FROM orders ORDER BY status WHERE returned",
      "SELECT * FROM orders WHERE status LIKE 'cancel%' OR 'return%'",
    ],
    answer: 0,
    explanation:
      "IN for the two states, ORDER BY ... DESC for newest first. Option D is doubly broken: LIKE on the right side of OR needs its own column.",
  },
  {
    id: "l3-q30",
    prompt: "A filter returns suspiciously FEW rows — fewer than expected. Which habit finds the bug fastest?",
    options: [
      "Delete the WHERE clause and blame the data",
      "Test each condition separately: run the query with one predicate at a time and compare counts",
      "Add more AND conditions",
      "Switch = to LIKE everywhere",
    ],
    answer: 1,
    explanation:
      "Divide and conquer: isolate predicates, check NULL traps (= NULL, NOT on NULLs), check spelling variants, check precedence. The funnel visual in this lesson mirrors exactly that debugging.",
  },
];
