// MCQ bank for Lesson 2 (SELECT & FROM).
// Existing inline MCQs are l2-q1..q4 — new items continue from q5.

import type { MCQ } from "../types";

export const mcqs02: MCQ[] = [
  {
    id: "l2-q5",
    prompt: "What is the minimum a SELECT query needs in SQLite?",
    options: [
      "SELECT and WHERE only",
      "A SELECT clause — even SELECT 1+1 runs with no FROM",
      "FROM first, then SELECT",
      "SELECT, FROM, and ORDER BY",
    ],
    answer: 1,
    explanation:
      "SELECT 1+1 returns one row, one column without touching any table. FROM is only needed when you read table data.",
  },
  {
    id: "l2-q6",
    prompt: "SELECT full_name, city FROM customers returns how many columns?",
    options: ["10 — the whole table", "2", "40", "Depends on the rows"],
    answer: 1,
    explanation:
      "The SELECT list defines the output columns: exactly full_name and city, one column each, in the order written.",
  },
  {
    id: "l2-q7",
    prompt: "SELECT city, full_name vs SELECT full_name, city — do they differ?",
    options: [
      "No, column order in SELECT is ignored",
      "Yes — output columns come back in the order you wrote them",
      "Yes — the second one is invalid syntax",
      "Only if the table has more than 5 columns",
    ],
    answer: 1,
    explanation:
      "Projection preserves your order. Same data, different column arrangement — which matters for CSV exports and human reading.",
  },
  {
    id: "l2-q8",
    prompt: "How many rows does SELECT full_name FROM customers return?",
    options: ["1", "40 — one per customer", "10", "0"],
    answer: 1,
    explanation:
      "Projection never removes rows — every row of customers (all 40) contributes one output row. Filtering is WHERE's job (Lesson 3).",
  },
  {
    id: "l2-q9",
    prompt: "What does SELECT * FROM products actually produce?",
    options: [
      "Every table in the database",
      "All 8 columns of products for all 32 products",
      "Only the primary key",
      "A random sample of products",
    ],
    answer: 1,
    explanation:
      "* expands to every column in schema order: id, product_name, category, price, cost, stock_quantity, supplier, listed_at.",
  },
  {
    id: "l2-q10",
    prompt: "Why do analysts prefer naming columns over SELECT * in reports?",
    options: [
      "* is slower to type",
      "Named columns document intent, avoid dragging unneeded data, and survive schema changes better",
      "* returns wrong values",
      "Named columns sort faster",
    ],
    answer: 1,
    explanation:
      "A report asking for exactly price and product_name keeps working when a column is added later; SELECT * output shape silently changes.",
  },
  {
    id: "l2-q11",
    prompt: "SELECT price * 0.9 FROM products — the result contains…",
    options: [
      "the price column renamed to 0.9",
      "one new column: each product's price discounted by 10%",
      "only prices equal to 0.9",
      "an error — math is not allowed in SELECT",
    ],
    answer: 1,
    explanation:
      "Expressions are evaluated per row. The output is a computed column (unnamed unless aliased). NULL prices stay NULL — arithmetic with NULL yields NULL.",
  },
  {
    id: "l2-q12",
    prompt: "What does AS do in SELECT price * 0.9 AS sale_price?",
    options: [
      "Filters prices below the sale price",
      "Names the computed column sale_price in the output",
      "Sorts by sale price",
      "Saves the query for later",
    ],
    answer: 1,
    explanation:
      "AS is an alias — a label for the output column. It changes nothing in the table and (Lesson 8 preview) is visible to ORDER BY but not to WHERE.",
  },
  {
    id: "l2-q13",
    prompt: "Which alias style is the good habit?",
    options: [
      "AS 'Sale Price' with spaces",
      "AS sale_price — one snake_case token",
      "AS 123total",
      "AS price+tax",
    ],
    answer: 1,
    explanation:
      "Aliases are single tokens; snake_case is the convention. Quoted aliases with spaces work but are fragile in tools and joins.",
  },
  {
    id: "l2-q14",
    prompt: "SELECT product_name, price FROM products WHERE price > 100 returns…",
    options: [
      "2 columns, only products priced over 100",
      "2 columns, all 32 products",
      "1 column, products over 100",
      "8 columns",
    ],
    answer: 0,
    explanation:
      "SELECT picks the columns (2 here); WHERE picks the rows. They compose: a slimmer table of a filtered subset.",
  },
  {
    id: "l2-q15",
    prompt: "In SQLite, are SQL keywords like SELECT case-sensitive?",
    options: [
      "Yes — select fails",
      "No — select/SELECT/Select all work; UPPERCASE is a readability convention",
      "Only the first keyword is",
      "Yes, but only inside quotes",
    ],
    answer: 1,
    explanation:
      "Keywords and table names are case-insensitive in SQLite. Careful: string VALUES like 'delivered' ARE case-sensitive.",
  },
  {
    id: "l2-q16",
    prompt: "Semicolons at the end of a statement are…",
    options: [
      "mandatory in every SQL tool",
      "optional for a single statement — a good habit for separating statements",
      "only for UPDATE statements",
      "illegal in SQLite",
    ],
    answer: 1,
    explanation:
      "One statement per run needs no semicolon, but typing it is a good habit — it cleanly separates multiple statements in scripts.",
  },
  {
    id: "l2-q17",
    prompt: "What does SELECT 'hello' FROM customers return?",
    options: [
      "an error — literals are not allowed",
      "40 rows, each containing just the text hello",
      "one row only",
      "the customer named hello",
    ],
    answer: 1,
    explanation:
      "A literal in SELECT is computed per row: 40 identical hello values. Useful for labels, confusing if accidental.",
  },
  {
    id: "l2-q18",
    prompt: "SELECT product_name, price FROM products ORDER BY price — which product row appears LAST?",
    options: [
      "the priciest product (the 1790 outlier)",
      "alphabetically first name",
      "it's random",
      "the NULL-price product",
    ],
    answer: 0,
    explanation:
      "ORDER BY defaults to ascending, so the most expensive row lands last. (NULL placement is Lesson 5's surprise.)",
  },
  {
    id: "l2-q19",
    prompt: "How many NULL prices exist in products right now?",
    options: ["0", "1", "5", "32"],
    answer: 1,
    explanation:
      "Exactly one product (Studio Desktop Mic) has a NULL price, and a different product has price = 0.00. Two different defects.",
  },
  {
    id: "l2-q20",
    prompt: "SELECT full_name AS name FROM customers — the original column full_name…",
    options: [
      "is renamed permanently in the database",
      "is unchanged; only this query's output uses the alias",
      "is deleted",
      "becomes NULL",
    ],
    answer: 1,
    explanation:
      "SELECT never mutates the table. Aliases live and die with the query result — changing data needs UPDATE, not SELECT.",
  },
  {
    id: "l2-q21",
    prompt: "Which query lists each review's rating next to a constant label column?",
    options: [
      "SELECT rating, 'review' FROM reviews",
      "SELECT rating FROM reviews LABEL 'review'",
      "SELECT rating AND 'review' FROM reviews",
      "SELECT rating + 'review' FROM reviews",
    ],
    answer: 0,
    explanation:
      "Mixing a column and a string literal in the SELECT list is legal: every output row shows the rating plus the constant text.",
  },
  {
    id: "l2-q22",
    prompt: "SELECT unit_price, discount, unit_price * quantity FROM order_items — the third column…",
    options: [
      "repeats unit_price",
      "computes a line subtotal per row (unnamed until aliased)",
      "sums the whole table",
      "causes a syntax error",
    ],
    answer: 1,
    explanation:
      "Row-wise arithmetic: unit_price × quantity for each of the 328 line items. Name it AS line_total for readability.",
  },
  {
    id: "l2-q23",
    prompt: "A query returns 328 rows and you only wanted 10. Which clause did you forget?",
    options: ["WHERE", "LIMIT", "ORDER BY", "AS"],
    answer: 1,
    explanation:
      "LIMIT caps output rows (Lesson 5). WHERE also cuts rows, but only when you have a condition — LIMIT is the pure 'show me less' tool.",
  },
  {
    id: "l2-q24",
    prompt: "Why does SELECT * FROM order_items feel overwhelming to read?",
    options: [
      "It's sorted randomly",
      "6 columns × 328 rows of raw values is hard to scan — project fewer columns",
      "SQLite limits it to 100 rows",
      "It shows hidden system tables",
    ],
    answer: 1,
    explanation:
      "Raw dumps are for peeking. Analysis selects the few columns that answer the question — the projection mindset.",
  },
  {
    id: "l2-q25",
    prompt: "Which FROM clause is valid for our sandbox?",
    options: [
      "FROM Customers — invalid, wrong case",
      "FROM customers — valid (table names resolve case-insensitively here)",
      "FROM 'customers table'",
      "FROM customer",
    ],
    answer: 1,
    explanation:
      "SQLite resolves table names case-insensitively, so FROM Customers works — but stick to the stored name to avoid surprises in other engines.",
  },
  {
    id: "l2-q26",
    prompt: "SELECT price, price FROM products returns…",
    options: [
      "an error — duplicate columns",
      "two identical price columns, both from the source",
      "one column",
      "price and its square",
    ],
    answer: 1,
    explanation:
      "The SELECT list is free-form; repeating an expression is legal (alias them to tell them apart). Handy for raw vs transformed comparisons.",
  },
  {
    id: "l2-q27",
    prompt: "You want lifetime_value shown in thousands (2410.5 → 2.4105). Which SELECT line does it?",
    options: [
      "SELECT lifetime_value / 1000 AS ltv_k FROM customers",
      "SELECT lifetime_value % 1000 FROM customers",
      "SELECT LTV(lifetime_value) FROM customers",
      "SELECT lifetime_value, 1000 FROM customers",
    ],
    answer: 0,
    explanation:
      "Scalar arithmetic reshapes values per row. / is division; % is remainder — a frequent beginner mix-up.",
  },
  {
    id: "l2-q28",
    prompt: "The NULL you see printed in the results grid is…",
    options: [
      "the four-character text 'NULL' stored in the cell",
      "the app's rendering of a true SQL NULL — absence of a value",
      "the number zero",
      "an empty string",
    ],
    answer: 1,
    explanation:
      "Our UI renders NULL cells in amber italics. A genuine text value 'NULL' would look like normal text — a subtle but important difference.",
  },
  {
    id: "l2-q29",
    prompt: "Which SELECT outputs product name and stock value (price × stock) with readable names?",
    options: [
      "SELECT product_name price * stock_quantity FROM products",
      "SELECT product_name, price * stock_quantity AS stock_value FROM products",
      "SELECT * FROM products WHERE stock_value",
      "SELECT product_name + price * stock_quantity FROM products",
    ],
    answer: 1,
    explanation:
      "Comma-separate the two expressions and alias the computed one. Option D attempts to add text and numbers — not what we want.",
  },
  {
    id: "l2-q30",
    prompt: "Running SELECT 5/2 in SQLite returns 2. Why?",
    options: [
      "SQLite always rounds down on display",
      "Integer division: both operands are INTEGERs, so the fraction is truncated",
      "5/2 is invalid",
      "Because of locale settings",
    ],
    answer: 1,
    explanation:
      "INTEGER ÷ INTEGER truncates: 5/2 = 2. Use 5.0/2 for decimals. A silent source of wrong rates in reports.",
  },
];
