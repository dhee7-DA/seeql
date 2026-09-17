// Problem bank for Lesson 8 — GROUP BY, HAVING, execution order.
// Existing: l8-p1 (medium), l8-p2 (medium), l8-p3 (easy). New: l8-p4..p16.

import type { QueryProblem } from "../types";

export const problems08: QueryProblem[] = [
  {
    id: "l8-p4",
    prompt: "Payment mix: count orders per `payment_method` **as stored** — columns `payment_method`, `order_count`, biggest count first (ties: method A→Z).",
    tables: ["orders"],
    difficulty: "easy",
    hints: [
      "GROUP BY payment_method with COUNT(*) AS order_count.",
      "ORDER BY order_count DESC, payment_method.",
      "The NULL bucket shows as an empty method cell — leave it in.",
    ],
    solution: "SELECT payment_method, COUNT(*) AS order_count\nFROM orders\nGROUP BY payment_method\nORDER BY order_count DESC, payment_method;",
  },
  {
    id: "l8-p5",
    prompt: "Where our shoppers live: count customers per `country` as stored — `country`, `customers`, biggest first (ties: country A→Z).",
    tables: ["customers"],
    difficulty: "easy",
    hints: ["GROUP BY country, COUNT(*) AS customers.", "ORDER BY customers DESC, country.", "26 buckets — spelling chaos at full size."],
    solution: "SELECT country, COUNT(*) AS customers\nFROM customers\nGROUP BY country\nORDER BY customers DESC, country;",
  },
  {
    id: "l8-p6",
    prompt: "Catalog census: count products per `category` as stored, alphabetical by category.",
    tables: ["products"],
    difficulty: "easy",
    hints: ["GROUP BY category, COUNT(*) — alias it AS products.", "ORDER BY category."],
    solution: "SELECT category, COUNT(*) AS products\nFROM products\nGROUP BY category\nORDER BY category;",
  },
  {
    id: "l8-p7",
    prompt: "Rating distribution: count reviews per `rating` as stored, ordered by rating ascending (NULL row included).",
    tables: ["reviews"],
    difficulty: "easy",
    hints: ["GROUP BY rating ORDER BY rating.", "The distribution exposes 0, 6, 7 and 99 instantly."],
    solution: "SELECT rating, COUNT(*) AS reviews\nFROM reviews\nGROUP BY rating\nORDER BY rating;",
  },
  {
    id: "l8-p8",
    prompt: "Major statuses only: count orders per status (as stored) but keep **only statuses with at least 2 orders** — biggest first, ties A→Z.",
    tables: ["orders"],
    difficulty: "medium",
    hints: [
      "GROUP BY status HAVING COUNT(*) >= 2.",
      "ORDER BY order_count DESC, status.",
      "Thresholds are how you filter the long tail of one-off spellings.",
    ],
    solution: "SELECT status, COUNT(*) AS order_count\nFROM orders\nGROUP BY status\nHAVING COUNT(*) >= 2\nORDER BY order_count DESC, status;",
  },
  {
    id: "l8-p9",
    prompt: "Frequent buyers: `customer_id` and `orders` count for customers with **5 or more orders** (known ids only) — biggest count first, ties by smaller id.",
    tables: ["orders"],
    difficulty: "medium",
    hints: [
      "WHERE customer_id IS NOT NULL first.",
      "GROUP BY customer_id HAVING COUNT(*) >= 5.",
      "ORDER BY orders DESC, customer_id — 7 rows.",
    ],
    solution: "SELECT customer_id, COUNT(*) AS orders\nFROM orders\nWHERE customer_id IS NOT NULL\nGROUP BY customer_id\nHAVING COUNT(*) >= 5\nORDER BY orders DESC, customer_id;",
  },
  {
    id: "l8-p10",
    prompt: "Clean categories: count products per **normalized** category — GROUP BY LOWER(TRIM(category)). Show the normalized value as `category` and `products` count, alphabetical.",
    tables: ["products"],
    difficulty: "medium",
    hints: [
      "Group by the expression: GROUP BY LOWER(TRIM(category)).",
      "Select the same expression AS category (or the alias) — the raw spellings collapse to ~6 buckets.",
      "ORDER BY category.",
    ],
    solution: "SELECT LOWER(TRIM(category)) AS category, COUNT(*) AS products\nFROM products\nGROUP BY LOWER(TRIM(category))\nORDER BY category;",
  },
  {
    id: "l8-p11",
    prompt: "Top spenders: `customer_id` and `spent` = SUM(total_amount) rounded to 2, for known customers, **top 5** by spent (ties: smaller id).",
    tables: ["orders"],
    difficulty: "hard",
    hints: [
      "WHERE customer_id IS NOT NULL; GROUP BY customer_id.",
      "SUM inside ROUND: ROUND(SUM(total_amount), 2) AS spent.",
      "ORDER BY spent DESC, customer_id LIMIT 5.",
    ],
    solution: "SELECT customer_id, ROUND(SUM(total_amount), 2) AS spent\nFROM orders\nWHERE customer_id IS NOT NULL\nGROUP BY customer_id\nORDER BY spent DESC, customer_id\nLIMIT 5;",
    orderMatters: true,
  },
  {
    id: "l8-p12",
    prompt: "Crowded cities: `city` and `customers` count for cities with **at least 2 customers** (as stored, NULLs excluded) — biggest first, ties A→Z.",
    tables: ["customers"],
    difficulty: "hard",
    hints: [
      "WHERE city IS NOT NULL, GROUP BY city, HAVING COUNT(*) >= 2.",
      "ORDER BY customers DESC, city.",
      "3 rows — and two of them are variants (' Madrid', 'berlin ')! The HAVING found mess magnets.",
    ],
    solution: "SELECT city, COUNT(*) AS customers\nFROM customers\nWHERE city IS NOT NULL\nGROUP BY city\nHAVING COUNT(*) >= 2\nORDER BY customers DESC, city;",
  },
  {
    id: "l8-p13",
    prompt: "Monthly rhythm: count orders per month — bucket with `substr(order_date, 1, 7)` (gives 'YYYY-MM'), show as `month` and `order_count`, chronological order.",
    tables: ["orders"],
    difficulty: "hard",
    hints: [
      "substr(order_date, 1, 7) keeps the first 7 characters: '2025-01'.",
      "GROUP BY substr(order_date, 1, 7) ORDER BY month — ISO text sorts chronologically.",
      "About 20 months of history.",
    ],
    solution: "SELECT substr(order_date, 1, 7) AS month, COUNT(*) AS order_count\nFROM orders\nGROUP BY substr(order_date, 1, 7)\nORDER BY month;",
    orderMatters: true,
  },
  {
    id: "l8-p14",
    prompt: "Well-reviewed products: for each product with **at least 5 valid ratings** (1–5), show `product_id`, `reviews` count and `avg_rating` (2 dp) — most reviews first, ties by product_id.",
    tables: ["reviews"],
    difficulty: "hard",
    hints: [
      "WHERE rating BETWEEN 1 AND 5 filters to valid ratings BEFORE grouping.",
      "GROUP BY product_id HAVING COUNT(*) >= 5.",
      "ORDER BY reviews DESC, product_id — 4 products qualify.",
    ],
    solution: "SELECT product_id, COUNT(*) AS reviews, ROUND(AVG(rating), 2) AS avg_rating\nFROM reviews\nWHERE rating BETWEEN 1 AND 5\nGROUP BY product_id\nHAVING COUNT(*) >= 5\nORDER BY reviews DESC, product_id;",
  },
  {
    id: "l8-p16",
    prompt: "High-value accounts: `customer_id` and `spent` = SUM(total_amount) (2 dp) for known customers whose **lifetime spend exceeds 1500** — biggest spend first, ties by smaller id.",
    tables: ["orders"],
    difficulty: "hard",
    hints: [
      "Aggregate first in your head: GROUP BY customer_id, then HAVING SUM(total_amount) > 1500.",
      "11 customers qualify.",
      "ORDER BY spent DESC, customer_id.",
    ],
    solution: "SELECT customer_id, ROUND(SUM(total_amount), 2) AS spent\nFROM orders\nWHERE customer_id IS NOT NULL\nGROUP BY customer_id\nHAVING SUM(total_amount) > 1500\nORDER BY spent DESC, customer_id;",
  },
];
