// Problem bank for Lesson 7 — aggregate functions.
// Existing: l7-p1 (easy), l7-p2 (medium), l7-p3 (medium). New: l7-p4..p15.

import type { QueryProblem } from "../types";

export const problems07: QueryProblem[] = [
  {
    id: "l7-p4",
    prompt: "Voice count: how many reviews exist? One row, one column: `review_count`.",
    tables: ["reviews"],
    difficulty: "easy",
    hints: ["COUNT(*) counts rows."],
    solution: "SELECT COUNT(*) AS review_count\nFROM reviews;",
  },
  {
    id: "l7-p5",
    prompt: "Units moved: the grand total of all ordered quantities. One row, one column: `total_units`.",
    tables: ["order_items"],
    difficulty: "easy",
    hints: ["SUM(quantity) over all 328 lines.", "NULL quantities are skipped by the sum."],
    solution: "SELECT SUM(quantity) AS total_units\nFROM order_items;",
  },
  {
    id: "l7-p6",
    prompt: "Biggest basket: the single highest `total_amount` in orders. One row, one column: `biggest_order`.",
    tables: ["orders"],
    difficulty: "easy",
    hints: ["MAX(total_amount).", "9999.99 — a beautifully suspicious round number."],
    solution: "SELECT MAX(total_amount) AS biggest_order\nFROM orders;",
  },
  {
    id: "l7-p7",
    prompt: "Floor rating: the lowest rating ever given. One row, one column: `lowest_rating`. (Interpret the result — is 0 even valid?)",
    tables: ["reviews"],
    difficulty: "easy",
    hints: ["MIN(rating).", "It returns 0 — an impossible rating, exposed by MIN. Data-quality in one number."],
    solution: "SELECT MIN(rating) AS lowest_rating\nFROM reviews;",
  },
  {
    id: "l7-p8",
    prompt: "Typical price: average product `price`, rounded to 2. One row, one column: `avg_price`.",
    tables: ["products"],
    difficulty: "medium",
    hints: ["ROUND(AVG(price), 2).", "AVG skips the one NULL price — divisor is 31."],
    solution: "SELECT ROUND(AVG(price), 2) AS avg_price\nFROM products;",
  },
  {
    id: "l7-p9",
    prompt: "Assortment breadth: how many **distinct products** were actually ordered (appear in order_items)? One row, one column: `products_sold`.",
    tables: ["order_items"],
    difficulty: "medium",
    hints: ["COUNT(DISTINCT product_id) — duplicates collapse.", "NULL product_ids are ignored by DISTINCT counting."],
    solution: "SELECT COUNT(DISTINCT product_id) AS products_sold\nFROM order_items;",
  },
  {
    id: "l7-p10",
    prompt: "Trustworthy mood: average rating over **valid ratings only** (1–5), rounded to 2. One row, one column: `avg_valid_rating`.",
    tables: ["reviews"],
    difficulty: "medium",
    hints: ["Filter first: WHERE rating BETWEEN 1 AND 5.", "Then ROUND(AVG(rating), 2).", "3.49 — compare with the raw 4.44 to see the outlier damage."],
    solution: "SELECT ROUND(AVG(rating), 2) AS avg_valid_rating\nFROM reviews\nWHERE rating BETWEEN 1 AND 5;",
  },
  {
    id: "l7-p11",
    prompt: "Line audit: one row — `total_lines` (all order_items), `known_qty` (lines with a quantity), `missing_qty` (the gap).",
    tables: ["order_items"],
    difficulty: "hard",
    hints: [
      "Three aggregates: COUNT(*), COUNT(quantity), COUNT(*) - COUNT(quantity).",
      "328 / 322 / 6.",
    ],
    solution: "SELECT COUNT(*) AS total_lines, COUNT(quantity) AS known_qty, COUNT(*) - COUNT(quantity) AS missing_qty\nFROM order_items;",
  },
  {
    id: "l7-p12",
    prompt: "Clean revenue: SUM of totals for orders with a **positive** total (refunds/negatives excluded), rounded to 2. One row: `clean_revenue`.",
    tables: ["orders"],
    difficulty: "hard",
    hints: [
      "WHERE total_amount > 0 — drops the negatives AND the NULLs (both fail the test).",
      "ROUND(SUM(total_amount), 2).",
    ],
    solution: "SELECT ROUND(SUM(total_amount), 2) AS clean_revenue\nFROM orders\nWHERE total_amount > 0;",
  },
  {
    id: "l7-p13",
    prompt: "Budget shelf value: total `price × stock_quantity` for products priced **under 50**, rounded to 2. One row: `cheap_inventory`.",
    tables: ["products"],
    difficulty: "hard",
    hints: [
      "Filter rows first: WHERE price < 50 (NULL prices fail it — they drop too).",
      "Aggregate the expression: ROUND(SUM(price * stock_quantity), 2).",
    ],
    solution: "SELECT ROUND(SUM(price * stock_quantity), 2) AS cheap_inventory\nFROM products\nWHERE price < 50;",
  },
  {
    id: "l7-p14",
    prompt: "Real supplier count: how many **normalized** suppliers exist — count DISTINCT LOWER(TRIM(supplier)). One row: `real_suppliers`.",
    tables: ["products"],
    difficulty: "hard",
    hints: [
      "DISTINCT over an expression: COUNT(DISTINCT LOWER(TRIM(supplier))).",
      "Raw spelling count was 12; normalized it collapses much further — that gap IS the mess, quantified.",
    ],
    solution: "SELECT COUNT(DISTINCT LOWER(TRIM(supplier))) AS real_suppliers\nFROM products;",
  },
  {
    id: "l7-p15",
    prompt: "Time envelope: one row with `first_order` (earliest order_date) and `last_order` (latest).",
    tables: ["orders"],
    difficulty: "hard",
    hints: ["MIN(order_date), MAX(order_date) — ISO text makes date extremes work.", "Every trend report starts with this envelope."],
    solution: "SELECT MIN(order_date) AS first_order, MAX(order_date) AS last_order\nFROM orders;",
  },
];
