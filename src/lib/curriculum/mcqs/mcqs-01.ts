// MCQ bank for Lesson 1 (databases, tables, keys, types, NULL intro).
// Existing inline MCQs are l1-q1..q4 — new items continue from q5.

import type { MCQ } from "../types";

export const mcqs01: MCQ[] = [
  {
    id: "l1-q5",
    prompt: "Which statement about tables vs spreadsheets is TRUE?",
    options: [
      "A table is exactly like a spreadsheet — any cell can hold anything",
      "A table enforces structure: every row has the same columns with fixed types",
      "Tables store only numbers; text must be kept in files",
      "A table can have a different number of columns per row",
    ],
    answer: 1,
    explanation:
      "Relational tables are strict grids: every row carries the same columns with consistent types. That structure is what makes SQL queries reliable.",
  },
  {
    id: "l1-q6",
    prompt: "In our storefront, the orders table has 150 rows. What does each row represent?",
    options: [
      "One product",
      "One checkout event — an order",
      "One customer",
      "One line item inside an order",
    ],
    answer: 1,
    explanation:
      "One row per checkout. Individual products inside a checkout live in order_items (328 rows), which is why one order can span several rows there.",
  },
  {
    id: "l1-q7",
    prompt: "Why can one customer appear in many orders without duplicating their data?",
    options: [
      "Because orders store the customer's name and email again",
      "Because orders store just the customer's id as a foreign key",
      "Because customers and orders are the same table",
      "Because SQL copies the customer row automatically",
    ],
    answer: 1,
    explanation:
      "orders.customer_id holds the customer's primary key. The customer's details live once in customers — the FK is a precise pointer, not a copy.",
  },
  {
    id: "l1-q8",
    prompt: "The column customers.email is TEXT. Which value can it legally hold?",
    options: [
      "Only valid email addresses — the database checks the format",
      "Any text, including 'not-an-email' — TEXT has no format rules",
      "Only lowercase text",
      "Nothing longer than 10 characters",
    ],
    answer: 1,
    explanation:
      "TEXT means 'any string'. Our data really contains the value not-an-email. Format checking is the analyst's job, not SQLite's.",
  },
  {
    id: "l1-q9",
    prompt: "Why is '2024-13-45' a dangerous value in the signup_date column?",
    options: [
      "It is stored as TEXT, so SQLite happily accepts it — and it is not a real date",
      "SQLite rejected it and stored NULL instead",
      "It will crash any query that touches the column",
      "TEXT columns cannot hold digits",
    ],
    answer: 0,
    explanation:
      "Dates are TEXT in ISO form. SQLite does not validate them, so the impossible 13th month and 45th day sit quietly in the data until a query or chart misbehaves.",
  },
  {
    id: "l1-q10",
    prompt: "What makes id a good primary key for the customers table?",
    options: [
      "It is short and easy to type",
      "It uniquely identifies exactly one row and is never missing",
      "It is the first column, and primary keys must come first",
      "It always equals the customer's row position in every query result",
    ],
    answer: 1,
    explanation:
      "A PK must uniquely and reliably reference one row. 'First column' and 'row position in results' are not data properties — and result positions change with ORDER BY.",
  },
  {
    id: "l1-q11",
    prompt: "orders.customer_id pointing at id 999 (no such customer) is called…",
    options: [
      "a primary key violation",
      "an orphaned foreign key — a broken reference",
      "a NULL value",
      "an index",
    ],
    answer: 1,
    explanation:
      "The FK points at a row that does not exist: an orphan. This database does not enforce FKs, so 6 such orders really exist in our sandbox.",
  },
  {
    id: "l1-q12",
    prompt: "How many customers in our sandbox are inactive (is_active = 0)?",
    options: ["0", "10", "27", "40"],
    answer: 1,
    explanation:
      "27 are active (is_active = 1), 10 are inactive (0), and 3 rows have NULL is_active — the flag itself is unknown for them.",
  },
  {
    id: "l1-q13",
    prompt: "A colleague says 'customer 17 has no phone, so their phone is 0'. Correct?",
    options: [
      "Yes — missing numbers default to 0",
      "No — the phone is NULL: no value is known, which is not the number 0",
      "Yes — 0 and NULL are the same thing in SQL",
      "No — it would be an empty string instead",
    ],
    answer: 1,
    explanation:
      "NULL means absent; 0 is a real number. Conflating them produces wrong averages and wrong filters — Lesson 4 is dedicated to this.",
  },
  {
    id: "l1-q14",
    prompt: "Why does the text '2025-03-14' sort before '2025-10-02' correctly?",
    options: [
      "For ISO YYYY-MM-DD strings, character-by-character comparison matches date order",
      "SQLite detects dates and converts them automatically",
      "It doesn't — '10' sorts before '03' as text",
      "Because the column type is DATE",
    ],
    answer: 0,
    explanation:
      "ISO dates are zero-padded, so text comparison equals chronological comparison. That's exactly why we store dates as YYYY-MM-DD TEXT.",
  },
  {
    id: "l1-q15",
    prompt: "How many distinct stored spellings exist in loyalty_tier (counting NULL as a state)?",
    options: ["3 — gold, silver, bronze", "10", "11 including NULL", "40"],
    answer: 2,
    explanation:
      "silver, bronze, gold, NULL, BRONZE, 'bronze ', GOLD, 'silver ', 'gold ', 'SILVER ', SILVER — 11 distinct stored states for what should be 3 tiers plus unknown.",
  },
  {
    id: "l1-q16",
    prompt: "GROUP BY loyalty_tier would produce how many groups on our raw data?",
    options: ["3", "4", "11", "40"],
    answer: 2,
    explanation:
      "Grouping uses exact stored values: 'bronze' and 'BRONZE ' are different groups. That's why the messy count is 11 — a preview of why data cleaning matters.",
  },
  {
    id: "l1-q17",
    prompt: "Which is the safest way to reference one specific order in a query?",
    options: [
      "WHERE full_name = 'Alice Chen'",
      "WHERE id = 1042",
      "WHERE total_amount = 84.50",
      "WHERE order_date = '2025-01-11'",
    ],
    answer: 1,
    explanation:
      "Only the PK guarantees exactly one row. Names duplicate, totals collide, dates repeat — Alice Chen even appears with messy spacing in this dataset.",
  },
  {
    id: "l1-q18",
    prompt: "customers has 40 rows; order_items has 328. What does that ratio reflect?",
    options: [
      "Customers buy items roughly 8 at a time",
      "One-to-many chains: 40 shoppers produced 150 checkouts containing 328 product lines",
      "The database is broken",
      "order_items rows are bigger than customer rows",
    ],
    answer: 1,
    explanation:
      "The 1—N chain customers → orders → order_items fans rows out: 40 → 150 → 328. Foreign keys are what make that fan-out meaningful.",
  },
  {
    id: "l1-q19",
    prompt: "Which column pair is a foreign key relationship?",
    options: [
      "customers.id → customers.full_name",
      "orders.customer_id → customers.id",
      "orders.total_amount → order_items.unit_price",
      "products.price → products.cost",
    ],
    answer: 1,
    explanation:
      "A FK is a column storing another table's PK. orders.customer_id stores customers.id values. Same-table references and numeric coincidences are not relationships.",
  },
  {
    id: "l1-q20",
    prompt: "What does reviews.product_id enable?",
    options: [
      "Storing the review text",
      "Linking each review to the product it rates",
      "Counting reviews per product",
      "Ranking products by rating",
    ],
    answer: 1,
    explanation:
      "reviews.product_id points at products.id — that link is what lets a later module compute 'average rating per product'.",
  },
  {
    id: "l1-q21",
    prompt: "Which is TRUE about NULL phones in this dataset?",
    options: [
      "13 of 40 customers have no phone on file",
      "Every customer has a phone",
      "NULL phones were auto-filled with 'unknown'",
      "Only 1 customer lacks a phone",
    ],
    answer: 0,
    explanation:
      "phone is NULL for 13 of 40 customers (32.5%) — realistic for shops that don't require a number at checkout.",
  },
  {
    id: "l1-q22",
    prompt: "The highest lifetime_value is 999999. As an analyst you should…",
    options: [
      "celebrate — a legendary whale customer",
      "suspect a data-entry error and verify before reporting",
      "delete the row",
      "round it to 1000000",
    ],
    answer: 1,
    explanation:
      "Extreme values are usually entry errors (fat-fingered digits). The true next-highest LTV is a few thousand — never present 999999 unverified.",
  },
  {
    id: "l1-q23",
    prompt: "lifetime_value is REAL. What follows for AVG(lifetime_value)?",
    options: [
      "REAL columns cannot be averaged",
      "The result is decimal — reports usually ROUND(..., 2)",
      "It forces the average to be a whole number",
      "REAL values sort as text",
    ],
    answer: 1,
    explanation:
      "Averages of REAL values are decimals (ours is 31814.80!) — and note how the 999999 outlier drags it: averages need scrutiny, not just rounding.",
  },
  {
    id: "l1-q24",
    prompt: "A customer's full_name is stored as '  Bob   Martin ' (extra spaces). Filtering WHERE full_name = 'Bob Martin'…",
    options: [
      "matches — SQL trims automatically",
      "does NOT match — text comparison is exact, spaces included",
      "crashes the query",
      "matches only on Sundays",
    ],
    answer: 1,
    explanation:
      "Text equality is character-exact. Leading, trailing and doubled spaces all break matches — a classic real-world reporting bug.",
  },
  {
    id: "l1-q25",
    prompt: "Which statement about this sandbox's foreign keys is TRUE?",
    options: [
      "Inserting an order with customer_id 999 is impossible",
      "FKs are declared but not enforced here — orphan rows exist on purpose",
      "FKs are enforced with a 24-hour delay",
      "Orphan rows are deleted nightly",
    ],
    answer: 1,
    explanation:
      "We inserted 6 orphan orders deliberately. Real production databases accumulate exactly this rot when enforcement is off or pipelines misbehave.",
  },
  {
    id: "l1-q26",
    prompt: "You need the exact number of rows in orders right now. Best first instinct?",
    options: [
      "Count them by eye in the Schema tab",
      "Write SELECT COUNT(*) FROM orders and run it",
      "Assume 150 because the docs say so",
      "Estimate from the file size",
    ],
    answer: 1,
    explanation:
      "Trust queries, not assumptions. (It is 150 today — but data changes, and the habit of measuring is what makes an analyst reliable.)",
  },
  {
    id: "l1-q27",
    prompt: "Why keep supplier as a plain TEXT column on products instead of a separate suppliers table here?",
    options: [
      "TEXT columns are faster",
      "It mirrors messy reality: 5 real companies appear under 12+ spellings, which you'll learn to detect",
      "SQLite forbids new tables",
      "Suppliers cannot be numbered",
    ],
    answer: 1,
    explanation:
      "products.supplier holds 'Acme Corp', 'acme corp', 'WAYNE LOGISTICS', 'globex ltd.'… Keeping the mess visible makes the data-cleaning lessons honest.",
  },
  {
    id: "l1-q28",
    prompt: "Which value would NOT fit an INTEGER column?",
    options: ["-1", "0", "19.5", "2025"],
    answer: 2,
    explanation:
      "19.5 has a fractional part — INTEGER columns hold whole numbers. Decimals belong in REAL columns like price or total_amount.",
  },
  {
    id: "l1-q29",
    prompt: "Two customers share the same email address but stored with different casing. COUNT(DISTINCT email) counts them as…",
    options: [
      "one value — emails are case-insensitive everywhere",
      "two different values if the stored text differs",
      "an error",
      "NULL",
    ],
    answer: 1,
    explanation:
      "DISTINCT compares stored text exactly: 'Ana@X.com' and 'ana@x.com' are 2 values. Normalizing (LOWER/TRIM) before counting is an analyst reflex — Lesson 7 revisits it.",
  },
  {
    id: "l1-q30",
    prompt: "What does every row of the same table have in common, by design?",
    options: [
      "The same values in every column",
      "The same set of columns (attributes), each with a fixed type",
      "The same primary key value",
      "The same creation date",
    ],
    answer: 1,
    explanation:
      "Rows share structure, not content. Content differs per record — that's the whole point. The PK value must differ, in fact.",
  },
];
