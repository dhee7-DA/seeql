// Window-functions problem bank B — wf-p061…wf-p120.
// G3 "RANK & DENSE_RANK" (p061–090): tie semantics, gaps, leaderboards.
// G4 "PARTITION BY" (p091–120): window resets, per-group context on every row.
import type { Problem } from "../types";
import { EXPECTED_WF } from "./expected-wf";

export const problemsWfB: Problem[] = [
  {
    id: "wf-p061",
    title: "Busiest months, ties allowed",
    brief:
      "Count orders per month (strftime '%Y-%m'), then RANK the months from busiest down. Months with the same order count share a rank and the next rank is skipped — that gap is RANK's signature. Return month, orders, and rk, ordered by rk then month.",
    difficulty: "medium",
    hints: [
      "Stage the month counts in a CTE, then RANK() OVER (ORDER BY orders DESC, month ASC) over it.",
      "WITH m AS (SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS orders FROM orders GROUP BY month) SELECT month, orders, RANK() OVER (ORDER BY orders DESC, month ASC) AS rk FROM m …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS orders\n  FROM orders\n  GROUP BY month\n)\nSELECT month, orders, RANK() OVER (ORDER BY orders DESC, month ASC) AS rk\nFROM m\nORDER BY rk, month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p061"],
  },
  {
    id: "wf-p062",
    title: "Same months, no gaps",
    brief:
      "Count orders per month again, but this time DENSE_RANK them from busiest down: tied months share a rank and the NEXT count gets the immediately following rank — no gaps. Return month, orders, and drk, ordered by drk then month.",
    difficulty: "medium",
    hints: [
      "DENSE_RANK() OVER (ORDER BY orders DESC, month ASC) — identical shape to RANK, different tie arithmetic.",
      "WITH m AS (… GROUP BY month) SELECT month, orders, DENSE_RANK() OVER (ORDER BY orders DESC, month ASC) AS drk FROM m …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS orders\n  FROM orders\n  GROUP BY month\n)\nSELECT month, orders, DENSE_RANK() OVER (ORDER BY orders DESC, month ASC) AS drk\nFROM m\nORDER BY drk, month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p062"],
  },
  {
    id: "wf-p063",
    title: "RANK versus DENSE_RANK",
    brief:
      "The contrast, side by side: count orders per month and show BOTH rk (RANK, gaps after ties) and drk (DENSE_RANK, no gaps) on each row. Ordered by rk then month.",
    difficulty: "medium",
    hints: [
      "Two window calls over the same CTE — the tie groups make the difference visible.",
      "SELECT month, orders, RANK() OVER (ORDER BY orders DESC) AS rk, DENSE_RANK() OVER (ORDER BY orders DESC) AS drk FROM m …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS orders\n  FROM orders\n  GROUP BY month\n)\nSELECT month, orders,\n       RANK() OVER (ORDER BY orders DESC, month ASC) AS rk,\n       DENSE_RANK() OVER (ORDER BY orders DESC, month ASC) AS drk\nFROM m\nORDER BY rk, month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p063"],
  },
  {
    id: "wf-p064",
    title: "RANK the order counts",
    brief:
      "Count each customer's orders, then RANK customers from most orders (rk = 1). Customers tied on order count share a rank. Return customer_id, orders, and rk, ordered by rk then customer_id.",
    difficulty: "medium",
    hints: [
      "CTE: GROUP BY customer_id and count; then RANK() OVER (ORDER BY orders DESC, customer_id ASC).",
      "WITH t AS (SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id) SELECT … RANK() OVER (…) AS rk FROM t …",
    ],
    solution:
      "WITH t AS (\n  SELECT customer_id, COUNT(*) AS orders\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT customer_id, orders, RANK() OVER (ORDER BY orders DESC, customer_id ASC) AS rk\nFROM t\nORDER BY rk, customer_id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p064"],
  },
  {
    id: "wf-p065",
    title: "DENSE_RANK the order counts",
    brief:
      "Same customer order counts, but DENSE_RANK: after a tie group the next rank continues without gaps. Return customer_id, orders, and drk, ordered by drk then customer_id.",
    difficulty: "medium",
    hints: [
      "DENSE_RANK() OVER (ORDER BY orders DESC, customer_id ASC) over the same CTE.",
      "WITH t AS (…) SELECT customer_id, orders, DENSE_RANK() OVER (…) AS drk FROM t …",
    ],
    solution:
      "WITH t AS (\n  SELECT customer_id, COUNT(*) AS orders\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT customer_id, orders, DENSE_RANK() OVER (ORDER BY orders DESC, customer_id ASC) AS drk\nFROM t\nORDER BY drk, customer_id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p065"],
  },
  {
    id: "wf-p066",
    title: "Two leaderboards, one query",
    brief:
      "Show every customer's order count with rk (RANK) and drk (DENSE_RANK) side by side — the tie groups prove why the two functions differ. Ordered by rk then customer_id.",
    difficulty: "medium",
    hints: [
      "Call both functions over the same ORDER BY in one SELECT.",
      "SELECT customer_id, orders, RANK() OVER (ORDER BY orders DESC) AS rk, DENSE_RANK() OVER (ORDER BY orders DESC) AS drk FROM t …",
    ],
    solution:
      "WITH t AS (\n  SELECT customer_id, COUNT(*) AS orders\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT customer_id, orders,\n       RANK() OVER (ORDER BY orders DESC, customer_id ASC) AS rk,\n       DENSE_RANK() OVER (ORDER BY orders DESC, customer_id ASC) AS drk\nFROM t\nORDER BY rk, customer_id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p066"],
  },
  {
    id: "wf-p067",
    title: "Price ladder, ranked",
    brief:
      "RANK all products from cheapest (rk = 1) to dearest, alphabetical name as tiebreaker. With no price ties the ranks run 1…N contiguously — RANK and ROW_NUMBER agree. Return name, price, and rk, ordered by rk.",
    difficulty: "easy",
    hints: [
      "RANK() OVER (ORDER BY price ASC, name ASC).",
      "SELECT name, price, RANK() OVER (ORDER BY price ASC, name ASC) AS rk FROM products …",
    ],
    solution:
      "SELECT name, price, RANK() OVER (ORDER BY price ASC, name ASC) AS rk\nFROM products\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p067"],
  },
  {
    id: "wf-p068",
    title: "Category revenue leaderboard",
    brief:
      "Sum revenue per product category (2 decimals) and RANK categories from highest revenue. Return category, revenue, and rk, ordered by rk.",
    difficulty: "medium",
    hints: [
      "CTE with the JOIN + GROUP BY first, then RANK the aggregated rows.",
      "WITH rev AS (SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category) …",
    ],
    solution:
      "WITH rev AS (\n  SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.category\n)\nSELECT category, revenue, RANK() OVER (ORDER BY revenue DESC, category ASC) AS rk\nFROM rev\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p068"],
  },
  {
    id: "wf-p069",
    title: "Category revenue, dense",
    brief:
      "Same category revenue leaderboard, but DENSE_RANK (no rank gaps after ties). Return category, revenue, and drk, ordered by drk.",
    difficulty: "medium",
    hints: [
      "Swap RANK for DENSE_RANK in the same CTE pattern.",
      "WITH rev AS (…) SELECT category, revenue, DENSE_RANK() OVER (ORDER BY revenue DESC) AS drk FROM rev …",
    ],
    solution:
      "WITH rev AS (\n  SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.category\n)\nSELECT category, revenue, DENSE_RANK() OVER (ORDER BY revenue DESC, category ASC) AS drk\nFROM rev\nORDER BY drk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p069"],
  },
  {
    id: "wf-p070",
    title: "City order counts, ranked",
    brief:
      "Count orders per customer city and RANK cities from most orders; ties share a rank (break display order alphabetically). Return city, orders, and rk, ordered by rk then city.",
    difficulty: "medium",
    hints: [
      "CTE: JOIN orders to customers, GROUP BY city. Then RANK() OVER (ORDER BY orders DESC, city ASC).",
      "WITH t AS (SELECT c.city, COUNT(*) AS orders FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.city) …",
    ],
    solution:
      "WITH t AS (\n  SELECT c.city, COUNT(*) AS orders\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.city\n)\nSELECT city, orders, RANK() OVER (ORDER BY orders DESC, city ASC) AS rk\nFROM t\nORDER BY rk, city;",
    ordered: true,
    expected: EXPECTED_WF["wf-p070"],
  },
  {
    id: "wf-p071",
    title: "Region volume, both ranks",
    brief:
      "Count orders per customer region and show rk (RANK) and drk (DENSE_RANK) side by side. Return region, orders, rk, and drk, ordered by rk.",
    difficulty: "medium",
    hints: [
      "One CTE, two window calls with the same ORDER BY.",
      "WITH t AS (…) SELECT region, orders, RANK() OVER (…) AS rk, DENSE_RANK() OVER (…) AS drk FROM t …",
    ],
    solution:
      "WITH t AS (\n  SELECT c.region, COUNT(*) AS orders\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n)\nSELECT region, orders,\n       RANK() OVER (ORDER BY orders DESC, region ASC) AS rk,\n       DENSE_RANK() OVER (ORDER BY orders DESC, region ASC) AS drk\nFROM t\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p071"],
  },
  {
    id: "wf-p072",
    title: "Spend categories ranked",
    brief:
      "Total the expense cents per category and RANK categories from biggest spend. Return category, spend, and rk, ordered by rk.",
    difficulty: "easy",
    hints: [
      "CTE: GROUP BY category, SUM(amount_cents). Then RANK() OVER (ORDER BY spend DESC).",
      "WITH s AS (SELECT category, SUM(amount_cents) AS spend FROM expenses GROUP BY category) …",
    ],
    solution:
      "WITH s AS (\n  SELECT category, SUM(amount_cents) AS spend\n  FROM expenses\n  GROUP BY category\n)\nSELECT category, spend, RANK() OVER (ORDER BY spend DESC, category ASC) AS rk\nFROM s\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p072"],
  },
  {
    id: "wf-p073",
    title: "Payment rails ranked",
    brief:
      "Total the paid cents per payment method and RANK the methods from biggest. Return method, total_cents, and rk, ordered by rk.",
    difficulty: "easy",
    hints: [
      "Only card and wire exist — the CTE will have two rows; rank them by SUM(amount_cents) DESC.",
      "WITH m AS (SELECT method, SUM(amount_cents) AS total_cents FROM payments GROUP BY method) …",
    ],
    solution:
      "WITH m AS (\n  SELECT method, SUM(amount_cents) AS total_cents\n  FROM payments\n  GROUP BY method\n)\nSELECT method, total_cents, RANK() OVER (ORDER BY total_cents DESC, method ASC) AS rk\nFROM m\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p073"],
  },
  {
    id: "wf-p074",
    title: "Status mix, ranked",
    brief:
      "Count orders per status and RANK statuses from most common. Return status, orders, and rk, ordered by rk.",
    difficulty: "easy",
    hints: [
      "Four statuses exist; counts are distinct so ranks run 1–4 with no ties.",
      "WITH s AS (SELECT status, COUNT(*) AS orders FROM orders GROUP BY status) SELECT … RANK() OVER (ORDER BY orders DESC) AS rk …",
    ],
    solution:
      "WITH s AS (\n  SELECT status, COUNT(*) AS orders\n  FROM orders\n  GROUP BY status\n)\nSELECT status, orders, RANK() OVER (ORDER BY orders DESC, status ASC) AS rk\nFROM s\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p074"],
  },
  {
    id: "wf-p075",
    title: "Suppliers by catalog depth",
    brief:
      "Count products per supplier and RANK suppliers from most products (ties share a rank; order ties by supplier name). Return supplier, products, and rk, ordered by rk then supplier.",
    difficulty: "medium",
    hints: [
      "CTE: JOIN products to suppliers, GROUP BY supplier name. Then RANK over the counts.",
      "WITH t AS (SELECT s.name AS supplier, COUNT(*) AS products FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.name) …",
    ],
    solution:
      "WITH t AS (\n  SELECT s.name AS supplier, COUNT(*) AS products\n  FROM products p\n  JOIN suppliers s ON s.id = p.supplier_id\n  GROUP BY s.name\n)\nSELECT supplier, products, RANK() OVER (ORDER BY products DESC, supplier ASC) AS rk\nFROM t\nORDER BY rk, supplier;",
    ordered: true,
    expected: EXPECTED_WF["wf-p075"],
  },
  {
    id: "wf-p076",
    title: "Stock depth chart",
    brief:
      "RANK products from deepest stock (rk = 1) down; alphabetical name breaks ties. Return name, stock, and rk, ordered by rk (limit the display to the first 8).",
    difficulty: "easy",
    hints: [
      "RANK() OVER (ORDER BY stock DESC, name ASC) then a derived-table filter rn <= 8 or ORDER BY rk LIMIT 8.",
      "SELECT name, stock, RANK() OVER (ORDER BY stock DESC, name ASC) AS rk FROM products ORDER BY rk LIMIT 8;",
    ],
    solution:
      "SELECT name, stock, RANK() OVER (ORDER BY stock DESC, name ASC) AS rk\nFROM products\nORDER BY rk\nLIMIT 8;",
    ordered: true,
    expected: EXPECTED_WF["wf-p076"],
  },
  {
    id: "wf-p077",
    title: "Invoice size ranks",
    brief:
      "RANK invoices from largest amount_cents (rk = 1); ties broken by smaller id. Return number, amount_cents, and rk for the top 8, ordered by rk.",
    difficulty: "easy",
    hints: [
      "RANK() OVER (ORDER BY amount_cents DESC, id ASC), display with ORDER BY rk LIMIT 8.",
      "SELECT number, amount_cents, RANK() OVER (ORDER BY amount_cents DESC, id ASC) AS rk FROM invoices ORDER BY rk LIMIT 8;",
    ],
    solution:
      "SELECT number, amount_cents, RANK() OVER (ORDER BY amount_cents DESC, id ASC) AS rk\nFROM invoices\nORDER BY rk\nLIMIT 8;",
    ordered: true,
    expected: EXPECTED_WF["wf-p077"],
  },
  {
    id: "wf-p078",
    title: "Months by revenue",
    brief:
      "Sum order revenue per month (2 decimals) and RANK months from highest revenue; ties share a rank. Return month, revenue, and rk, ordered by rk then month.",
    difficulty: "medium",
    hints: [
      "CTE groups by strftime('%Y-%m', created_at) and sums total; RANK over revenue DESC.",
      "WITH m AS (SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue FROM orders GROUP BY month) …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, revenue, RANK() OVER (ORDER BY revenue DESC, month ASC) AS rk\nFROM m\nORDER BY rk, month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p078"],
  },
  {
    id: "wf-p079",
    title: "Spend leaderboard",
    brief:
      "Rank customers by lifetime spend (2 decimals) — rk = 1 is the biggest spender; ties share a rank. Return name, spend, and rk for the top 8, ordered by rk then name.",
    difficulty: "medium",
    hints: [
      "CTE: JOIN + GROUP BY customer, ROUND(SUM(total), 2) AS spend; then RANK and LIMIT 8 via ORDER BY rk.",
      "WITH s AS (SELECT c.name, ROUND(SUM(o.total), 2) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id, c.name) …",
    ],
    solution:
      "WITH s AS (\n  SELECT c.name, ROUND(SUM(o.total), 2) AS spend\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n)\nSELECT name, spend, RANK() OVER (ORDER BY spend DESC, name ASC) AS rk\nFROM s\nORDER BY rk\nLIMIT 8;",
    ordered: true,
    expected: EXPECTED_WF["wf-p079"],
  },
  {
    id: "wf-p080",
    title: "Busiest ledger accounts",
    brief:
      "Count entries per ledger account and RANK accounts from busiest; ties share a rank. Return account, entries, and rk, ordered by rk then account.",
    difficulty: "easy",
    hints: [
      "CTE: GROUP BY account, COUNT(*). Then RANK() OVER (ORDER BY entries DESC, account ASC).",
      "WITH t AS (SELECT account, COUNT(*) AS entries FROM ledger_entries GROUP BY account) …",
    ],
    solution:
      "WITH t AS (\n  SELECT account, COUNT(*) AS entries\n  FROM ledger_entries\n  GROUP BY account\n)\nSELECT account, entries, RANK() OVER (ORDER BY entries DESC, account ASC) AS rk\nFROM t\nORDER BY rk, account;",
    ordered: true,
    expected: EXPECTED_WF["wf-p080"],
  },
  {
    id: "wf-p081",
    title: "Gapped leaderboard",
    brief:
      "Among customers with at least 3 orders, RANK by order count. The tie group in the middle creates the tell-tale rank GAP — that's the answer to 'what does RANK do after ties?'. Return customer_id, orders, and rk, ordered by rk then customer_id.",
    difficulty: "medium",
    hints: [
      "Filter inside the CTE (HAVING COUNT(*) >= 3), then RANK the remaining rows.",
      "WITH t AS (SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id HAVING COUNT(*) >= 3) …",
    ],
    solution:
      "WITH t AS (\n  SELECT customer_id, COUNT(*) AS orders\n  FROM orders\n  GROUP BY customer_id\n  HAVING COUNT(*) >= 3\n)\nSELECT customer_id, orders, RANK() OVER (ORDER BY orders DESC, customer_id ASC) AS rk\nFROM t\nORDER BY rk, customer_id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p081"],
  },
  {
    id: "wf-p082",
    title: "Catalog depth, two ways",
    brief:
      "Count products per category and show rk (RANK) and drk (DENSE_RANK) side by side — several categories tie, so the two columns diverge exactly at the ties. Ordered by rk then category.",
    difficulty: "medium",
    hints: [
      "CTE counts per category; the SELECT adds both RANK and DENSE_RANK over product count DESC.",
      "WITH t AS (SELECT category, COUNT(*) AS products FROM products GROUP BY category) SELECT …",
    ],
    solution:
      "WITH t AS (\n  SELECT category, COUNT(*) AS products\n  FROM products\n  GROUP BY category\n)\nSELECT category, products,\n       RANK() OVER (ORDER BY products DESC, category ASC) AS rk,\n       DENSE_RANK() OVER (ORDER BY products DESC, category ASC) AS drk\nFROM t\nORDER BY rk, category;",
    ordered: true,
    expected: EXPECTED_WF["wf-p082"],
  },
  {
    id: "wf-p083",
    title: "Vendor spend ranks",
    brief:
      "Total spend per expense vendor and RANK vendors from biggest; ties share a rank. Return vendor, spend, and rk for the top 10, ordered by rk then vendor.",
    difficulty: "medium",
    hints: [
      "CTE: GROUP BY vendor, SUM(amount_cents). RANK over spend DESC, display ORDER BY rk LIMIT 10.",
      "WITH v AS (SELECT vendor, SUM(amount_cents) AS spend FROM expenses GROUP BY vendor) …",
    ],
    solution:
      "WITH v AS (\n  SELECT vendor, SUM(amount_cents) AS spend\n  FROM expenses\n  GROUP BY vendor\n)\nSELECT vendor, spend, RANK() OVER (ORDER BY spend DESC, vendor ASC) AS rk\nFROM v\nORDER BY rk\nLIMIT 10;",
    ordered: true,
    expected: EXPECTED_WF["wf-p083"],
  },
  {
    id: "wf-p084",
    title: "Revenue months, dense",
    brief:
      "Sum revenue per month (2 decimals) and DENSE_RANK the months from highest; ties share a rank with no gaps. Return month, revenue, and drk, ordered by drk then month.",
    difficulty: "easy",
    hints: [
      "DENSE_RANK() OVER (ORDER BY revenue DESC, month ASC) over the month-revenue CTE.",
      "WITH m AS (SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue FROM orders GROUP BY month) …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, revenue, DENSE_RANK() OVER (ORDER BY revenue DESC, month ASC) AS drk\nFROM m\nORDER BY drk, month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p084"],
  },
  {
    id: "wf-p085",
    title: "Best sellers ranked",
    brief:
      "Sum units sold per product, RANK from most units; ties share a rank. Return name, units, and rk for the top 6, ordered by rk then name.",
    difficulty: "hard",
    hints: [
      "CTE: JOIN order_items to products, GROUP BY product, SUM(quantity). RANK over units DESC.",
      "WITH s AS (SELECT p.name, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id, p.name) …",
    ],
    solution:
      "WITH s AS (\n  SELECT p.name, SUM(oi.quantity) AS units\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.id, p.name\n)\nSELECT name, units, RANK() OVER (ORDER BY units DESC, name ASC) AS rk\nFROM s\nORDER BY rk\nLIMIT 6;",
    ordered: true,
    expected: EXPECTED_WF["wf-p085"],
  },
  {
    id: "wf-p086",
    title: "Top four revenue months",
    brief:
      "Rank months by revenue (RANK, ties share) and keep only ranks 1–4. Return month, revenue, and rk, ordered by rk. Filter the rank in a second stage — WHERE can't see window results.",
    difficulty: "medium",
    hints: [
      "CTE 1: month revenue. CTE 2 (or derived table): RANK. Outer: WHERE rk <= 4.",
      "WITH m AS (…), r AS (SELECT month, revenue, RANK() OVER (ORDER BY revenue DESC) AS rk FROM m) SELECT … WHERE rk <= 4 …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n),\nr AS (\n  SELECT month, revenue, RANK() OVER (ORDER BY revenue DESC, month ASC) AS rk\n  FROM m\n)\nSELECT month, revenue, rk\nFROM r\nWHERE rk <= 4\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p086"],
  },
  {
    id: "wf-p087",
    title: "Three numberings, one table",
    brief:
      "For every customer's order count, show seq (ROW_NUMBER), rk (RANK), and drk (DENSE_RANK) — all over orders DESC, customer_id ASC. The three columns agree only where there are no ties. Ordered by rk then customer_id.",
    difficulty: "hard",
    hints: [
      "Three window functions over the same CTE with the same ORDER BY.",
      "SELECT customer_id, orders, ROW_NUMBER() OVER (…) AS seq, RANK() OVER (…) AS rk, DENSE_RANK() OVER (…) AS drk FROM t …",
    ],
    solution:
      "WITH t AS (\n  SELECT customer_id, COUNT(*) AS orders\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT customer_id, orders,\n       ROW_NUMBER() OVER (ORDER BY orders DESC, customer_id ASC) AS seq,\n       RANK() OVER (ORDER BY orders DESC, customer_id ASC) AS rk,\n       DENSE_RANK() OVER (ORDER BY orders DESC, customer_id ASC) AS drk\nFROM t\nORDER BY rk, customer_id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p087"],
  },
  {
    id: "wf-p088",
    title: "Status value ranks",
    brief:
      "Sum order revenue per status (2 decimals) and RANK statuses from most valuable. Return status, revenue, and rk, ordered by rk.",
    difficulty: "easy",
    hints: [
      "CTE: GROUP BY status, ROUND(SUM(total), 2). RANK over revenue DESC.",
      "WITH s AS (SELECT status, ROUND(SUM(total), 2) AS revenue FROM orders GROUP BY status) …",
    ],
    solution:
      "WITH s AS (\n  SELECT status, ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY status\n)\nSELECT status, revenue, RANK() OVER (ORDER BY revenue DESC, status ASC) AS rk\nFROM s\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p088"],
  },
  {
    id: "wf-p089",
    title: "Category unit race, dense",
    brief:
      "Sum units sold per category (JOIN order_items to products), then DENSE_RANK categories from most units. Return category, units, and drk, ordered by drk.",
    difficulty: "hard",
    hints: [
      "CTE joins and groups by category; DENSE_RANK over SUM(quantity) DESC.",
      "WITH u AS (SELECT p.category, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category) …",
    ],
    solution:
      "WITH u AS (\n  SELECT p.category, SUM(oi.quantity) AS units\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.category\n)\nSELECT category, units, DENSE_RANK() OVER (ORDER BY units DESC, category ASC) AS drk\nFROM u\nORDER BY drk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p089"],
  },
  {
    id: "wf-p090",
    title: "Region customer counts",
    brief:
      "Count customers per region and RANK regions from most customers. Return region, customers, and rk, ordered by rk. Count from the customers table itself — no join needed.",
    difficulty: "easy",
    hints: [
      "CTE: SELECT region, COUNT(*) AS customers FROM customers GROUP BY region. Then RANK.",
      "WITH t AS (…) SELECT region, customers, RANK() OVER (ORDER BY customers DESC, region ASC) AS rk FROM t …",
    ],
    solution:
      "WITH t AS (\n  SELECT region, COUNT(*) AS customers\n  FROM customers\n  GROUP BY region\n)\nSELECT region, customers, RANK() OVER (ORDER BY customers DESC, region ASC) AS rk\nFROM t\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p090"],
  },
  {
    id: "wf-p091",
    title: "Category context on every product",
    brief:
      "For every product show name, category, price, and cat_avg — the AVERAGE price within its own category (2 decimals). PARTITION BY category keeps all 16 product rows while recomputing the mean per group. Ordered by id.",
    difficulty: "medium",
    hints: [
      "AVG(price) OVER (PARTITION BY category) resets the average at each category boundary.",
      "SELECT name, category, price, ROUND(AVG(price) OVER (PARTITION BY category), 2) AS cat_avg FROM products …",
    ],
    solution:
      "SELECT name, category, price, ROUND(AVG(price) OVER (PARTITION BY category), 2) AS cat_avg\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p091"],
  },
  {
    id: "wf-p092",
    title: "How big is this customer?",
    brief:
      "On every order show id, customer_id, and cust_orders — how many orders THAT customer has placed (a windowed COUNT partitioned by customer). Ordered by id.",
    difficulty: "easy",
    hints: [
      "COUNT(*) OVER (PARTITION BY customer_id) counts within each customer's slice.",
      "SELECT id, customer_id, COUNT(*) OVER (PARTITION BY customer_id) AS cust_orders FROM orders …",
    ],
    solution:
      "SELECT id, customer_id, COUNT(*) OVER (PARTITION BY customer_id) AS cust_orders\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p092"],
  },
  {
    id: "wf-p093",
    title: "Status group size",
    brief:
      "On every order show id, status, and status_orders — the number of orders sharing that same status. Ordered by id.",
    difficulty: "easy",
    hints: [
      "PARTITION BY status makes COUNT(*) count each status group on every of its rows.",
      "SELECT id, status, COUNT(*) OVER (PARTITION BY status) AS status_orders FROM orders ORDER BY id;",
    ],
    solution:
      "SELECT id, status, COUNT(*) OVER (PARTITION BY status) AS status_orders\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p093"],
  },
  {
    id: "wf-p094",
    title: "Gap to category ceiling",
    brief:
      "For every product show name, category, price, and below_cat_top — the distance from its category's most expensive product (2 decimals). Ordered by id.",
    difficulty: "medium",
    hints: [
      "MAX(price) OVER (PARTITION BY category) - price, rounded.",
      "SELECT name, category, price, ROUND(MAX(price) OVER (PARTITION BY category) - price, 2) AS below_cat_top FROM products …",
    ],
    solution:
      "SELECT name, category, price, ROUND(MAX(price) OVER (PARTITION BY category) - price, 2) AS below_cat_top\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p094"],
  },
  {
    id: "wf-p095",
    title: "Category spend per line",
    brief:
      "For every expense show id, category, amount_cents, and cat_total — the sum of THAT category's spend. Ordered by id.",
    difficulty: "easy",
    hints: [
      "SUM(amount_cents) OVER (PARTITION BY category).",
      "SELECT id, category, amount_cents, SUM(amount_cents) OVER (PARTITION BY category) AS cat_total FROM expenses …",
    ],
    solution:
      "SELECT id, category, amount_cents, SUM(amount_cents) OVER (PARTITION BY category) AS cat_total\nFROM expenses\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p095"],
  },
  {
    id: "wf-p096",
    title: "Slice of the category pie",
    brief:
      "For every expense show id, category, and cat_pct — the expense's amount_cents as a percent of its own category's total (2 decimals). Ordered by id.",
    difficulty: "medium",
    hints: [
      "100.0 * amount_cents / SUM(amount_cents) OVER (PARTITION BY category).",
      "SELECT id, category, ROUND(100.0 * amount_cents / SUM(amount_cents) OVER (PARTITION BY category), 2) AS cat_pct FROM expenses …",
    ],
    solution:
      "SELECT id, category, ROUND(100.0 * amount_cents / SUM(amount_cents) OVER (PARTITION BY category), 2) AS cat_pct\nFROM expenses\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p096"],
  },
  {
    id: "wf-p097",
    title: "Lifetime spend on each order",
    brief:
      "On every order show id, customer_id, total, and cust_spend — that customer's lifetime revenue (sum of their totals, 2 decimals). Ordered by id.",
    difficulty: "medium",
    hints: [
      "SUM(total) OVER (PARTITION BY customer_id) walks each customer's slice.",
      "SELECT id, customer_id, total, ROUND(SUM(total) OVER (PARTITION BY customer_id), 2) AS cust_spend FROM orders …",
    ],
    solution:
      "SELECT id, customer_id, total, ROUND(SUM(total) OVER (PARTITION BY customer_id), 2) AS cust_spend\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p097"],
  },
  {
    id: "wf-p098",
    title: "Invoiced per customer",
    brief:
      "For every invoice show number, customer_id, amount_cents, and cust_billed — the customer's total invoiced cents. Ordered by id.",
    difficulty: "easy",
    hints: [
      "SUM(amount_cents) OVER (PARTITION BY customer_id) over invoices.",
      "SELECT number, customer_id, amount_cents, SUM(amount_cents) OVER (PARTITION BY customer_id) AS cust_billed FROM invoices …",
    ],
    solution:
      "SELECT number, customer_id, amount_cents, SUM(amount_cents) OVER (PARTITION BY customer_id) AS cust_billed\nFROM invoices\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p098"],
  },
  {
    id: "wf-p099",
    title: "Paid so far per invoice",
    brief:
      "For every payment show id, invoice_id, amount_cents, and invoice_paid — the total paid on THAT invoice across all its payments. Ordered by id.",
    difficulty: "easy",
    hints: [
      "PARTITION BY invoice_id — the window resets per invoice.",
      "SELECT id, invoice_id, amount_cents, SUM(amount_cents) OVER (PARTITION BY invoice_id) AS invoice_paid FROM payments …",
    ],
    solution:
      "SELECT id, invoice_id, amount_cents, SUM(amount_cents) OVER (PARTITION BY invoice_id) AS invoice_paid\nFROM payments\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p099"],
  },
  {
    id: "wf-p100",
    title: "Account debit totals",
    brief:
      "For every ledger entry show id, account, debit_cents, and account_debits — the account's total debits. Ordered by id.",
    difficulty: "easy",
    hints: [
      "SUM(debit_cents) OVER (PARTITION BY account).",
      "SELECT id, account, debit_cents, SUM(debit_cents) OVER (PARTITION BY account) AS account_debits FROM ledger_entries …",
    ],
    solution:
      "SELECT id, account, debit_cents, SUM(debit_cents) OVER (PARTITION BY account) AS account_debits\nFROM ledger_entries\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p100"],
  },
  {
    id: "wf-p101",
    title: "Supplier shelf size",
    brief:
      "For every product show name, supplier_id, and supplier_products — how many products that supplier provides. Ordered by id.",
    difficulty: "easy",
    hints: [
      "COUNT(*) OVER (PARTITION BY supplier_id) counts each supplier's slice.",
      "SELECT name, supplier_id, COUNT(*) OVER (PARTITION BY supplier_id) AS supplier_products FROM products …",
    ],
    solution:
      "SELECT name, supplier_id, COUNT(*) OVER (PARTITION BY supplier_id) AS supplier_products\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p101"],
  },
  {
    id: "wf-p102",
    title: "Order rank inside each customer",
    brief:
      "For every order show id, customer_id, total, and rk — the order's rank by total WITHIN its customer (biggest = 1, ties by smaller id). Ordered by customer_id then rk.",
    difficulty: "medium",
    hints: [
      "RANK() OVER (PARTITION BY customer_id ORDER BY total DESC, id ASC) — rank resets per customer.",
      "SELECT id, customer_id, total, RANK() OVER (PARTITION BY customer_id ORDER BY total DESC, id ASC) AS rk FROM orders …",
    ],
    solution:
      "SELECT id, customer_id, total, RANK() OVER (PARTITION BY customer_id ORDER BY total DESC, id ASC) AS rk\nFROM orders\nORDER BY customer_id, rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p102"],
  },
  {
    id: "wf-p103",
    title: "Price rank within category",
    brief:
      "For every product show name, category, price, and cat_rk — its price rank within its category (dearest = 1, ties alphabetical). Ordered by category then cat_rk.",
    difficulty: "medium",
    hints: [
      "RANK() OVER (PARTITION BY category ORDER BY price DESC, name ASC).",
      "SELECT name, category, price, RANK() OVER (PARTITION BY category ORDER BY price DESC, name ASC) AS cat_rk FROM products …",
    ],
    solution:
      "SELECT name, category, price, RANK() OVER (PARTITION BY category ORDER BY price DESC, name ASC) AS cat_rk\nFROM products\nORDER BY category, cat_rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p103"],
  },
  {
    id: "wf-p104",
    title: "Orders in the same city",
    brief:
      "Join orders to customers; on every order show order id, city, and city_orders — how many orders were placed from that city. Ordered by order id.",
    difficulty: "medium",
    hints: [
      "After the join, partition by city: COUNT(*) OVER (PARTITION BY c.city).",
      "SELECT o.id, c.city, COUNT(*) OVER (PARTITION BY c.city) AS city_orders FROM orders o JOIN customers c ON c.id = o.customer_id …",
    ],
    solution:
      "SELECT o.id, c.city, COUNT(*) OVER (PARTITION BY c.city) AS city_orders\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nORDER BY o.id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p104"],
  },
  {
    id: "wf-p105",
    title: "Typical basket of my status",
    brief:
      "On every order show id, status, total, and status_avg — the AVERAGE total of orders with the same status (2 decimals). Ordered by id.",
    difficulty: "easy",
    hints: [
      "AVG(total) OVER (PARTITION BY status).",
      "SELECT id, status, total, ROUND(AVG(total) OVER (PARTITION BY status), 2) AS status_avg FROM orders …",
    ],
    solution:
      "SELECT id, status, total, ROUND(AVG(total) OVER (PARTITION BY status), 2) AS status_avg\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p105"],
  },
  {
    id: "wf-p106",
    title: "Share of my status's revenue",
    brief:
      "On every order show id, status, and status_pct — the order's total as a percent of its status group's revenue (2 decimals). Ordered by id.",
    difficulty: "medium",
    hints: [
      "100.0 * total / SUM(total) OVER (PARTITION BY status), rounded.",
      "SELECT id, status, ROUND(100.0 * total / SUM(total) OVER (PARTITION BY status), 2) AS status_pct FROM orders …",
    ],
    solution:
      "SELECT id, status, ROUND(100.0 * total / SUM(total) OVER (PARTITION BY status), 2) AS status_pct\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p106"],
  },
  {
    id: "wf-p107",
    title: "Category price corridor",
    brief:
      "For every product show name, category, price, cat_min (cheapest in category) and cat_max (dearest in category). Ordered by id.",
    difficulty: "easy",
    hints: [
      "MIN and MAX with the same PARTITION BY category, side by side.",
      "SELECT name, category, price, MIN(price) OVER (PARTITION BY category) AS cat_min, MAX(price) OVER (PARTITION BY category) AS cat_max FROM products …",
    ],
    solution:
      "SELECT name, category, price, MIN(price) OVER (PARTITION BY category) AS cat_min, MAX(price) OVER (PARTITION BY category) AS cat_max\nFROM products\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p107"],
  },
  {
    id: "wf-p108",
    title: "Company of my month",
    brief:
      "On every order show id, month (strftime '%Y-%m' of created_at), and month_orders — how many orders share that month. Ordered by id.",
    difficulty: "medium",
    hints: [
      "Partition by the month expression: COUNT(*) OVER (PARTITION BY strftime('%Y-%m', created_at)).",
      "SELECT id, strftime('%Y-%m', created_at) AS month, COUNT(*) OVER (PARTITION BY strftime('%Y-%m', created_at)) AS month_orders FROM orders …",
    ],
    solution:
      "SELECT id, strftime('%Y-%m', created_at) AS month, COUNT(*) OVER (PARTITION BY strftime('%Y-%m', created_at)) AS month_orders\nFROM orders\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p108"],
  },
  {
    id: "wf-p109",
    title: "Account net on each entry",
    brief:
      "For every ledger entry show id, account, net (debit - credit), and account_net — the net summed across the account's entries. Ordered by id.",
    difficulty: "medium",
    hints: [
      "SUM(debit_cents - credit_cents) OVER (PARTITION BY account).",
      "SELECT id, account, debit_cents - credit_cents AS net, SUM(debit_cents - credit_cents) OVER (PARTITION BY account) AS account_net FROM ledger_entries …",
    ],
    solution:
      "SELECT id, account, debit_cents - credit_cents AS net, SUM(debit_cents - credit_cents) OVER (PARTITION BY account) AS account_net\nFROM ledger_entries\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p109"],
  },
  {
    id: "wf-p110",
    title: "My customer's open invoices",
    brief:
      "For open invoices only (status = 'open'), show number, customer_id, and cust_open — how many open invoices that customer has. Ordered by id.",
    difficulty: "medium",
    hints: [
      "WHERE status = 'open' first; then COUNT(*) OVER (PARTITION BY customer_id).",
      "SELECT number, customer_id, COUNT(*) OVER (PARTITION BY customer_id) AS cust_open FROM invoices WHERE status = 'open' …",
    ],
    solution:
      "SELECT number, customer_id, COUNT(*) OVER (PARTITION BY customer_id) AS cust_open\nFROM invoices\nWHERE status = 'open'\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p110"],
  },
  {
    id: "wf-p111",
    title: "Vendor totals per line",
    brief:
      "For every expense show id, vendor, amount_cents, and vendor_total — the vendor's total spend across the book. Ordered by id.",
    difficulty: "easy",
    hints: [
      "SUM(amount_cents) OVER (PARTITION BY vendor).",
      "SELECT id, vendor, amount_cents, SUM(amount_cents) OVER (PARTITION BY vendor) AS vendor_total FROM expenses …",
    ],
    solution:
      "SELECT id, vendor, amount_cents, SUM(amount_cents) OVER (PARTITION BY vendor) AS vendor_total\nFROM expenses\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p111"],
  },
  {
    id: "wf-p112",
    title: "Product demand on each line",
    brief:
      "For every order_items row show id, product_id, quantity, and product_units — the total units ever sold of THAT product. Ordered by id.",
    difficulty: "medium",
    hints: [
      "SUM(quantity) OVER (PARTITION BY product_id).",
      "SELECT id, product_id, quantity, SUM(quantity) OVER (PARTITION BY product_id) AS product_units FROM order_items …",
    ],
    solution:
      "SELECT id, product_id, quantity, SUM(quantity) OVER (PARTITION BY product_id) AS product_units\nFROM order_items\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p112"],
  },
  {
    id: "wf-p113",
    title: "Slice of category revenue",
    brief:
      "Join order_items to products; for each line show line id, category, line revenue (quantity * unit_price, 2 decimals), and cat_pct — the line's share of its category's revenue (2 decimals). Ordered by line id.",
    difficulty: "hard",
    hints: [
      "Partition by p.category and divide the line value by the windowed category sum, times 100.0.",
      "SELECT oi.id, p.category, ROUND(100.0 * oi.quantity * oi.unit_price / SUM(oi.quantity * oi.unit_price) OVER (PARTITION BY p.category), 2) AS cat_pct …",
    ],
    solution:
      "SELECT oi.id, p.category,\n       ROUND(100.0 * oi.quantity * oi.unit_price / SUM(oi.quantity * oi.unit_price) OVER (PARTITION BY p.category), 2) AS cat_pct\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nORDER BY oi.id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p113"],
  },
  {
    id: "wf-p114",
    title: "Alphabetical inside my region",
    brief:
      "For every customer show name, region, and region_seq — their alphabetical position within their region (1 = first). Ordered by region then region_seq.",
    difficulty: "medium",
    hints: [
      "ROW_NUMBER() OVER (PARTITION BY region ORDER BY name ASC).",
      "SELECT name, region, ROW_NUMBER() OVER (PARTITION BY region ORDER BY name ASC) AS region_seq FROM customers …",
    ],
    solution:
      "SELECT name, region, ROW_NUMBER() OVER (PARTITION BY region ORDER BY name ASC) AS region_seq\nFROM customers\nORDER BY region, region_seq;",
    ordered: true,
    expected: EXPECTED_WF["wf-p114"],
  },
  {
    id: "wf-p115",
    title: "Status timelines",
    brief:
      "For every order show id, status, created_at, and status_seq — its chronological position within its status group (1 = earliest, ties by id). Ordered by status then status_seq.",
    difficulty: "medium",
    hints: [
      "ROW_NUMBER() OVER (PARTITION BY status ORDER BY created_at ASC, id ASC).",
      "SELECT id, status, created_at, ROW_NUMBER() OVER (PARTITION BY status ORDER BY created_at ASC, id ASC) AS status_seq FROM orders …",
    ],
    solution:
      "SELECT id, status, created_at, ROW_NUMBER() OVER (PARTITION BY status ORDER BY created_at ASC, id ASC) AS status_seq\nFROM orders\nORDER BY status, status_seq;",
    ordered: true,
    expected: EXPECTED_WF["wf-p115"],
  },
  {
    id: "wf-p116",
    title: "Payment rank within method",
    brief:
      "For every payment show id, method, amount_cents, and method_rk — its size rank within its method (biggest = 1, ties by smaller id). Ordered by method then method_rk.",
    difficulty: "easy",
    hints: [
      "RANK() OVER (PARTITION BY method ORDER BY amount_cents DESC, id ASC).",
      "SELECT id, method, amount_cents, RANK() OVER (PARTITION BY method ORDER BY amount_cents DESC, id ASC) AS method_rk FROM payments …",
    ],
    solution:
      "SELECT id, method, amount_cents, RANK() OVER (PARTITION BY method ORDER BY amount_cents DESC, id ASC) AS method_rk\nFROM payments\nORDER BY method, method_rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p116"],
  },
  {
    id: "wf-p117",
    title: "Stock rank within category",
    brief:
      "For every product show name, category, stock, and cat_stock_rk — deepest stock in the category ranks 1 (ties alphabetical). Ordered by category then cat_stock_rk.",
    difficulty: "easy",
    hints: [
      "RANK() OVER (PARTITION BY category ORDER BY stock DESC, name ASC).",
      "SELECT name, category, stock, RANK() OVER (PARTITION BY category ORDER BY stock DESC, name ASC) AS cat_stock_rk FROM products …",
    ],
    solution:
      "SELECT name, category, stock, RANK() OVER (PARTITION BY category ORDER BY stock DESC, name ASC) AS cat_stock_rk\nFROM products\nORDER BY category, cat_stock_rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p117"],
  },
  {
    id: "wf-p118",
    title: "Delivered orders per customer",
    brief:
      "For delivered orders only, show id, customer_id, and delivered_by_cust — how many DELIVERED orders that customer has. Ordered by id.",
    difficulty: "medium",
    hints: [
      "WHERE status = 'delivered' scopes the partitions to delivered rows only.",
      "SELECT id, customer_id, COUNT(*) OVER (PARTITION BY customer_id) AS delivered_by_cust FROM orders WHERE status = 'delivered' …",
    ],
    solution:
      "SELECT id, customer_id, COUNT(*) OVER (PARTITION BY customer_id) AS delivered_by_cust\nFROM orders\nWHERE status = 'delivered'\nORDER BY id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p118"],
  },
  {
    id: "wf-p119",
    title: "Expense rank in category",
    brief:
      "For every expense show id, category, amount_cents, and cat_rk — biggest expense of the category ranks 1 (ties by smaller id). Ordered by category then cat_rk.",
    difficulty: "easy",
    hints: [
      "RANK() OVER (PARTITION BY category ORDER BY amount_cents DESC, id ASC).",
      "SELECT id, category, amount_cents, RANK() OVER (PARTITION BY category ORDER BY amount_cents DESC, id ASC) AS cat_rk FROM expenses …",
    ],
    solution:
      "SELECT id, category, amount_cents, RANK() OVER (PARTITION BY category ORDER BY amount_cents DESC, id ASC) AS cat_rk\nFROM expenses\nORDER BY category, cat_rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p119"],
  },
  {
    id: "wf-p120",
    title: "My region's revenue",
    brief:
      "Join orders to customers; on every order show order id, region, and region_revenue — the region's total order revenue (2 decimals). Ordered by order id.",
    difficulty: "medium",
    hints: [
      "After the join, SUM(o.total) OVER (PARTITION BY c.region), rounded.",
      "SELECT o.id, c.region, ROUND(SUM(o.total) OVER (PARTITION BY c.region), 2) AS region_revenue FROM orders o JOIN customers c ON c.id = o.customer_id …",
    ],
    solution:
      "SELECT o.id, c.region, ROUND(SUM(o.total) OVER (PARTITION BY c.region), 2) AS region_revenue\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nORDER BY o.id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p120"],
  },
];