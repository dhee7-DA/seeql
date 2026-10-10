// Window-functions problem bank E — wf-p241…wf-p300.
// G9 "Windows + GROUP BY / CTE staging" (p241–270): rank-then-filter,
//     percent-of-total after aggregation, above-average sieves.
// G10 "Finance windows" (p271–300): AR aging, balances, cash cadence,
//     concentration — the money layer on window functions.
// Reference date for aging math is FIXED (2025-03-01) so grading is stable.
import type { Problem } from "../types";
import { EXPECTED_WF } from "./expected-wf";

export const problemsWfE: Problem[] = [
  {
    id: "wf-p241",
    title: "Top 3 delivered-revenue customers",
    brief:
      "Stage each customer's DELIVERED revenue (join orders, filter status, group), then rank and keep the top 3. Return name, revenue (2 decimals), and rn, ordered by rn.",
    difficulty: "hard",
    hints: [
      "Two CTEs: spend (GROUP BY customer) then ranked (ROW_NUMBER OVER (ORDER BY revenue DESC, name ASC)).",
      "Filter rn <= 3 only in the final SELECT — never in the same level as the window.",
    ],
    solution:
      "WITH s AS (\n  SELECT c.name, SUM(o.total) AS revenue\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  WHERE o.status = 'delivered'\n  GROUP BY c.id, c.name\n),\nr AS (\n  SELECT name, revenue, ROW_NUMBER() OVER (ORDER BY revenue DESC, name ASC) AS rn\n  FROM s\n)\nSELECT name, ROUND(revenue, 2) AS revenue, rn\nFROM r\nWHERE rn <= 3\nORDER BY rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p241"],
  },
  {
    id: "wf-p242",
    title: "Biggest average baskets",
    brief:
      "Stage each customer's average order value (2 decimals), rank from highest, keep the top 5. Return name, avg_order, and rn, ordered by rn. Ties: alphabetical name.",
    difficulty: "hard",
    hints: [
      "CTE 1: AVG(total) per customer. CTE 2: ROW_NUMBER over avg DESC.",
      "WHERE rn <= 5 in the outer query.",
    ],
    solution:
      "WITH s AS (\n  SELECT c.name, ROUND(AVG(o.total), 2) AS avg_order\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n),\nr AS (\n  SELECT name, avg_order, ROW_NUMBER() OVER (ORDER BY avg_order DESC, name ASC) AS rn\n  FROM s\n)\nSELECT name, avg_order, rn\nFROM r\nWHERE rn <= 5\nORDER BY rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p242"],
  },
  {
    id: "wf-p243",
    title: "Category standing and share",
    brief:
      "Stage per-category revenue; add pct (share of all revenue, 2 decimals) and rk (RANK from biggest). Return category, revenue, pct, rk, ordered by rk.",
    difficulty: "hard",
    hints: [
      "CTE: category revenue. Outer: 100.0 * revenue / SUM(revenue) OVER () and RANK() OVER (ORDER BY revenue DESC).",
      "The empty-window SUM is the grand total even after GROUP BY staging.",
    ],
    solution:
      "WITH rev AS (\n  SELECT p.category, SUM(oi.quantity * oi.unit_price) AS revenue\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.category\n)\nSELECT category, ROUND(revenue, 2) AS revenue,\n       ROUND(100.0 * revenue / SUM(revenue) OVER (), 2) AS pct,\n       RANK() OVER (ORDER BY revenue DESC, category ASC) AS rk\nFROM rev\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p243"],
  },
  {
    id: "wf-p244",
    title: "Months that beat average",
    brief:
      "Stage monthly revenue; keep only months whose revenue is strictly above the AVERAGE month's revenue (an empty-window AVG). Return month, revenue (2 decimals), and avg_revenue (2 decimals), ordered by revenue DESC.",
    difficulty: "hard",
    hints: [
      "AVG(revenue) OVER () over the staged months is the mean month.",
      "Filter in the outer layer: WHERE revenue > avg_revenue.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n),\nc AS (\n  SELECT month, revenue, AVG(revenue) OVER () AS avg_revenue\n  FROM m\n)\nSELECT month, ROUND(revenue, 2) AS revenue, ROUND(avg_revenue, 2) AS avg_revenue\nFROM c\nWHERE revenue > avg_revenue\nORDER BY revenue DESC, month ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p244"],
  },
  {
    id: "wf-p245",
    title: "Each customer's slice of the company",
    brief:
      "Stage per-customer spend and show share — the customer's percent of total company revenue (2 decimals). Return name, spend (2 decimals), share, ordered by share DESC, name.",
    difficulty: "medium",
    hints: [
      "100.0 * spend / SUM(spend) OVER () over the staged rows.",
      "The shares sum to (approximately) 100.",
    ],
    solution:
      "WITH s AS (\n  SELECT c.name, SUM(o.total) AS spend\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n)\nSELECT name, ROUND(spend, 2) AS spend, ROUND(100.0 * spend / SUM(spend) OVER (), 2) AS share\nFROM s\nORDER BY share DESC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p245"],
  },
  {
    id: "wf-p246",
    title: "Revenue kings of each region's cities",
    brief:
      "Stage revenue per region-and-city (2 decimals); within each region rank cities by revenue and keep rn = 1. Return region, city, revenue, ordered by region then revenue DESC.",
    difficulty: "hard",
    hints: [
      "CTE: GROUP BY region, city. Then ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC, city ASC), filter rn = 1.",
      "Staging first keeps the window honest — windows see the aggregated rows.",
    ],
    solution:
      "WITH rc AS (\n  SELECT c.region, c.city, SUM(o.total) AS revenue\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region, c.city\n),\nr AS (\n  SELECT region, city, revenue, ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC, city ASC) AS rn\n  FROM rc\n)\nSELECT region, city, ROUND(revenue, 2) AS revenue\nFROM r\nWHERE rn = 1\nORDER BY region, revenue DESC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p246"],
  },
  {
    id: "wf-p247",
    title: "Busiest weekdays",
    brief:
      "Stage order counts per weekday (strftime '%w' of created_at, '0' = Sunday … '6' = Saturday); DENSE_RANK the weekdays from busiest (ties share, earlier weekday first) and keep the top 3. Return weekday, orders, and drk, ordered by drk.",
    difficulty: "medium",
    hints: [
      "CTE groups by strftime('%w', created_at); DENSE_RANK() OVER (ORDER BY orders DESC, weekday ASC) outside.",
      "Filter drk <= 3 in a staged layer — the rank can't be filtered in its own SELECT.",
    ],
    solution:
      "WITH w AS (\n  SELECT strftime('%w', created_at) AS weekday, COUNT(*) AS orders\n  FROM orders\n  GROUP BY weekday\n),\nr AS (\n  SELECT weekday, orders, DENSE_RANK() OVER (ORDER BY orders DESC, weekday ASC) AS drk\n  FROM w\n)\nSELECT weekday, orders, drk\nFROM r\nWHERE drk <= 3\nORDER BY drk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p247"],
  },
  {
    id: "wf-p248",
    title: "Unit champion of each category",
    brief:
      "Stage units sold per product (SUM of order_items.quantity); within each category keep the top seller. Return category, name, units, ordered by category then units DESC.",
    difficulty: "hard",
    hints: [
      "CTE: JOIN, GROUP BY product. Then ROW_NUMBER() OVER (PARTITION BY category ORDER BY units DESC, name ASC), filter rn = 1.",
      "Ties on units break alphabetically.",
    ],
    solution:
      "WITH u AS (\n  SELECT p.category, p.name, SUM(oi.quantity) AS units\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.id, p.category, p.name\n),\nr AS (\n  SELECT category, name, units, ROW_NUMBER() OVER (PARTITION BY category ORDER BY units DESC, name ASC) AS rn\n  FROM u\n)\nSELECT category, name, units\nFROM r\nWHERE rn = 1\nORDER BY category, units DESC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p248"],
  },
  {
    id: "wf-p249",
    title: "Above the typical basket",
    brief:
      "Stage per-customer average order value; keep customers whose average strictly exceeds the COMPANY-WIDE average order value (an empty-window AVG over staged rows). Return name, avg_order (2 decimals), ordered by avg_order DESC.",
    difficulty: "hard",
    hints: [
      "CTE 1: AVG(total) per customer. CTE 2 adds AVG(avg_order) OVER ().",
      "Filter WHERE avg_order > company_avg outside.",
    ],
    solution:
      "WITH s AS (\n  SELECT c.name, AVG(o.total) AS avg_order\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n),\nc AS (\n  SELECT name, avg_order, AVG(avg_order) OVER () AS company_avg\n  FROM s\n)\nSELECT name, ROUND(avg_order, 2) AS avg_order\nFROM c\nWHERE avg_order > company_avg\nORDER BY avg_order DESC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p249"],
  },
  {
    id: "wf-p250",
    title: "Cumulative revenue contribution",
    brief:
      "Categories from biggest to smallest with cum_share — the running percent of total revenue they account for (2 decimals). The last category's cum_share is 100. Return category, revenue, cum_share, ordered by revenue DESC.",
    difficulty: "hard",
    hints: [
      "CTE: category revenue. Outer: running SUM over revenue DESC frame, times 100.0 / grand total.",
      "ROUND(100.0 * SUM(revenue) OVER (ORDER BY revenue DESC, category ASC ROWS UNBOUNDED PRECEDING…) / SUM(revenue) OVER (), 2)",
    ],
    solution:
      "WITH rev AS (\n  SELECT p.category, SUM(oi.quantity * oi.unit_price) AS revenue\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.category\n)\nSELECT category, ROUND(revenue, 2) AS revenue,\n       ROUND(100.0 * SUM(revenue) OVER (ORDER BY revenue DESC, category ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) / SUM(revenue) OVER (), 2) AS cum_share\nFROM rev\nORDER BY revenue DESC, category ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p250"],
  },
  {
    id: "wf-p251",
    title: "Status board",
    brief:
      "Stage per-status revenue; show status, revenue (2 decimals), pct (share of total, 2 decimals) and rk (rank from biggest). Ordered by rk.",
    difficulty: "medium",
    hints: [
      "Two window shapes on one staged set: the empty-window SUM for pct, RANK for rk.",
      "SELECT status, ROUND(revenue, 2) …, ROUND(100.0 * revenue / SUM(revenue) OVER (), 2), RANK() OVER (ORDER BY revenue DESC) …",
    ],
    solution:
      "WITH s AS (\n  SELECT status, SUM(total) AS revenue\n  FROM orders\n  GROUP BY status\n)\nSELECT status, ROUND(revenue, 2) AS revenue,\n       ROUND(100.0 * revenue / SUM(revenue) OVER (), 2) AS pct,\n       RANK() OVER (ORDER BY revenue DESC, status ASC) AS rk\nFROM s\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p251"],
  },
  {
    id: "wf-p252",
    title: "Louder months",
    brief:
      "Stage monthly order counts; keep months whose count is at or above the AVERAGE month's count. Return month, orders, avg_orders (2 decimals), ordered by orders DESC, month.",
    difficulty: "medium",
    hints: [
      "AVG(orders) OVER () over the staged counts; filter orders >= avg_orders outside.",
      "Inclusive comparison — equal months stay.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS orders\n  FROM orders\n  GROUP BY month\n),\nc AS (\n  SELECT month, orders, AVG(orders) OVER () AS avg_orders\n  FROM m\n)\nSELECT month, orders, ROUND(avg_orders, 2) AS avg_orders\nFROM c\nWHERE orders >= avg_orders\nORDER BY orders DESC, month ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p252"],
  },
  {
    id: "wf-p253",
    title: "City quality ladder",
    brief:
      "Stage per-city average order value (2 decimals) and rank cities from highest. Return city, avg_order, and rk, ordered by rk.",
    difficulty: "medium",
    hints: [
      "CTE: JOIN, GROUP BY city, AVG(total). Then RANK() OVER (ORDER BY avg_order DESC, city ASC).",
      "Ties share a rank — cities are small groups so ties happen.",
    ],
    solution:
      "WITH t AS (\n  SELECT c.city, AVG(o.total) AS avg_order\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.city\n)\nSELECT city, ROUND(avg_order, 2) AS avg_order, RANK() OVER (ORDER BY avg_order DESC, city ASC) AS rk\nFROM t\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p253"],
  },
  {
    id: "wf-p254",
    title: "Product revenue league",
    brief:
      "Stage revenue per product (2 decimals, from order_items joined to products); rank and keep the top 8. Return name, revenue, and rn, ordered by rn.",
    difficulty: "hard",
    hints: [
      "CTE: SUM(quantity * unit_price) GROUP BY product. ROW_NUMBER over revenue DESC, keep rn <= 8.",
      "Ties: alphabetical name.",
    ],
    solution:
      "WITH s AS (\n  SELECT p.name, SUM(oi.quantity * oi.unit_price) AS revenue\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.id, p.name\n),\nr AS (\n  SELECT name, revenue, ROW_NUMBER() OVER (ORDER BY revenue DESC, name ASC) AS rn\n  FROM s\n)\nSELECT name, ROUND(revenue, 2) AS revenue, rn\nFROM r\nWHERE rn <= 8\nORDER BY rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p254"],
  },
  {
    id: "wf-p255",
    title: "Supplier concentration",
    brief:
      "Stage revenue per supplier (2 decimals via join to products); show share — each supplier's percent of all revenue (2 decimals). Return supplier, revenue, share, ordered by share DESC.",
    difficulty: "hard",
    hints: [
      "CTE: order_items → products → suppliers, GROUP BY supplier name. Then 100.0 * revenue / SUM(revenue) OVER ().",
      "Concentration reports live on this pattern.",
    ],
    solution:
      "WITH s AS (\n  SELECT sup.name AS supplier, SUM(oi.quantity * oi.unit_price) AS revenue\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  JOIN suppliers sup ON sup.id = p.supplier_id\n  GROUP BY sup.name\n)\nSELECT supplier, ROUND(revenue, 2) AS revenue, ROUND(100.0 * revenue / SUM(revenue) OVER (), 2) AS share\nFROM s\nORDER BY share DESC, supplier ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p255"],
  },
  {
    id: "wf-p256",
    title: "Customer volume tiers",
    brief:
      "Stage per-customer order counts and split into 3 tiers (NTILE(3), most orders = tier 3): show name, orders, and tier, ordered by orders DESC, name.",
    difficulty: "hard",
    hints: [
      "CTE: COUNT per customer joined to names. NTILE(3) OVER (ORDER BY orders DESC, name ASC).",
      "16 customers split into 6/5/5.",
    ],
    solution:
      "WITH t AS (\n  SELECT c.name, COUNT(*) AS orders\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n)\nSELECT name, orders, NTILE(3) OVER (ORDER BY orders DESC, name ASC) AS tier\nFROM t\nORDER BY orders DESC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p256"],
  },
  {
    id: "wf-p257",
    title: "Heaviest order months by units",
    brief:
      "Stage units sold per month (join order_items to orders for the date); rank months by units and keep the top 5. Return month, units, and rn, ordered by rn.",
    difficulty: "hard",
    hints: [
      "CTE: GROUP BY strftime('%Y-%m', o.created_at), SUM(oi.quantity). ROW_NUMBER over units DESC, month ASC.",
      "Filter rn <= 5 in the outer SELECT.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', o.created_at) AS month, SUM(oi.quantity) AS units\n  FROM order_items oi\n  JOIN orders o ON o.id = oi.order_id\n  GROUP BY month\n),\nr AS (\n  SELECT month, units, ROW_NUMBER() OVER (ORDER BY units DESC, month ASC) AS rn\n  FROM m\n)\nSELECT month, units, rn\nFROM r\nWHERE rn <= 5\nORDER BY rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p257"],
  },
  {
    id: "wf-p258",
    title: "Each region's anchor customer",
    brief:
      "Stage spend per region-and-customer; within each region keep the biggest spender. Return region, name, spend (2 decimals), ordered by region then spend DESC.",
    difficulty: "hard",
    hints: [
      "CTE: GROUP BY region, customer. ROW_NUMBER() OVER (PARTITION BY region ORDER BY spend DESC, name ASC), keep rn = 1.",
      "Ties break alphabetically.",
    ],
    solution:
      "WITH rc AS (\n  SELECT c.region, c.name, SUM(o.total) AS spend\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region, c.id, c.name\n),\nr AS (\n  SELECT region, name, spend, ROW_NUMBER() OVER (PARTITION BY region ORDER BY spend DESC, name ASC) AS rn\n  FROM rc\n)\nSELECT region, name, ROUND(spend, 2) AS spend\nFROM r\nWHERE rn = 1\nORDER BY region, spend DESC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p258"],
  },
  {
    id: "wf-p259",
    title: "Busiest weeks",
    brief:
      "Stage order counts per ISO-ish week (strftime '%W' of created_at; label it week); rank weeks by count and keep the top 5. Ties: earlier week number first. Return week, orders, and rn, ordered by rn.",
    difficulty: "medium",
    hints: [
      "strftime('%W', created_at) gives the week number 00–53.",
      "CTE groups by week; ROW_NUMBER over orders DESC, week ASC; rn <= 5 outside.",
    ],
    solution:
      "WITH w AS (\n  SELECT strftime('%W', created_at) AS week, COUNT(*) AS orders\n  FROM orders\n  GROUP BY week\n),\nr AS (\n  SELECT week, orders, ROW_NUMBER() OVER (ORDER BY orders DESC, week ASC) AS rn\n  FROM w\n)\nSELECT week, orders, rn\nFROM r\nWHERE rn <= 5\nORDER BY rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p259"],
  },
  {
    id: "wf-p260",
    title: "Category line-value quality",
    brief:
      "Stage the average line value (quantity * unit_price) per category (2 decimals); rank from highest. Return category, avg_line, and rk, ordered by rk.",
    difficulty: "medium",
    hints: [
      "CTE: JOIN, GROUP BY category, AVG(quantity * unit_price). RANK over avg_line DESC.",
      "Ties: alphabetical category.",
    ],
    solution:
      "WITH t AS (\n  SELECT p.category, AVG(oi.quantity * oi.unit_price) AS avg_line\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.category\n)\nSELECT category, ROUND(avg_line, 2) AS avg_line, RANK() OVER (ORDER BY avg_line DESC, category ASC) AS rk\nFROM t\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p260"],
  },
  {
    id: "wf-p261",
    title: "Frequent-flyer customers",
    brief:
      "Stage per-customer order counts; keep customers whose count is strictly above the AVERAGE customer's count (empty-window AVG). Return name, orders, avg_orders (2 decimals), ordered by orders DESC, name.",
    difficulty: "hard",
    hints: [
      "CTE 1 counts per customer; CTE 2 adds AVG(orders) OVER ().",
      "Filter orders > avg_orders in the outer layer.",
    ],
    solution:
      "WITH t AS (\n  SELECT c.name, COUNT(*) AS orders\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n),\nc AS (\n  SELECT name, orders, AVG(orders) OVER () AS avg_orders\n  FROM t\n)\nSELECT name, orders, ROUND(avg_orders, 2) AS avg_orders\nFROM c\nWHERE orders > avg_orders\nORDER BY orders DESC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p261"],
  },
  {
    id: "wf-p262",
    title: "Status volume and standing",
    brief:
      "Stage per-status order counts; show status, orders, pct (share of all orders, 2 decimals) and drk (DENSE_RANK from busiest). Ordered by drk.",
    difficulty: "medium",
    hints: [
      "100.0 * orders / SUM(orders) OVER () plus DENSE_RANK() OVER (ORDER BY orders DESC).",
      "One staged set, two windows.",
    ],
    solution:
      "WITH s AS (\n  SELECT status, COUNT(*) AS orders\n  FROM orders\n  GROUP BY status\n)\nSELECT status, orders,\n       ROUND(100.0 * orders / SUM(orders) OVER (), 2) AS pct,\n       DENSE_RANK() OVER (ORDER BY orders DESC, status ASC) AS drk\nFROM s\nORDER BY drk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p262"],
  },
  {
    id: "wf-p263",
    title: "Two revenue stars per category",
    brief:
      "Stage revenue per product; within each category keep the top 2 earners. Return category, name, revenue (2 decimals), and rn, ordered by category then rn.",
    difficulty: "hard",
    hints: [
      "ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC, name ASC), filter rn <= 2.",
      "Category revenue is computed per product first, then ranked inside the partition.",
    ],
    solution:
      "WITH s AS (\n  SELECT p.category, p.name, SUM(oi.quantity * oi.unit_price) AS revenue\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.id, p.category, p.name\n),\nr AS (\n  SELECT category, name, revenue, ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC, name ASC) AS rn\n  FROM s\n)\nSELECT category, name, ROUND(revenue, 2) AS revenue, rn\nFROM r\nWHERE rn <= 2\nORDER BY category, rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p263"],
  },
  {
    id: "wf-p264",
    title: "The month dashboard",
    brief:
      "One staged set, three lenses: monthly revenue with rk (rank from biggest), cum_revenue (running sum, 2 decimals), and growth (MoM percent, 2 decimals, NULL first). Return month, revenue, rk, cum_revenue, growth, ordered by month.",
    difficulty: "hard",
    hints: [
      "Stage months in a CTE with LAG already applied, then rank and run in the outer layer.",
      "WITH d AS (SELECT month, revenue, LAG(revenue) OVER (ORDER BY month) AS prev FROM m) SELECT … RANK() OVER (ORDER BY revenue DESC) …, SUM(revenue) OVER (ORDER BY month ROWS …) …, 100.0 * (revenue - prev) / prev …",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n),\nd AS (\n  SELECT month, revenue, LAG(revenue) OVER (ORDER BY month ASC) AS prev\n  FROM m\n)\nSELECT month, ROUND(revenue, 2) AS revenue,\n       RANK() OVER (ORDER BY revenue DESC, month ASC) AS rk,\n       ROUND(SUM(revenue) OVER (ORDER BY month ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS cum_revenue,\n       CASE WHEN prev IS NULL THEN NULL ELSE ROUND(100.0 * (revenue - prev) / prev, 2) END AS growth\nFROM d\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p264"],
  },
  {
    id: "wf-p265",
    title: "Spend pillars",
    brief:
      "Stage per-category expense totals with pct — each category's share of ALL expense spend (2 decimals; compute the share in the staged layer with SUM(SUM(amount_cents)) OVER ()). Then keep only the top 3 categories by spend. Return category, spend, pct, ordered by spend DESC.",
    difficulty: "medium",
    hints: [
      "Windows run AFTER GROUP BY: SUM(SUM(amount_cents)) OVER () inside the grouped CTE is the grand total.",
      "Rank the staged rows and filter rk <= 3 in an outer layer.",
    ],
    solution:
      "WITH s AS (\n  SELECT category, SUM(amount_cents) AS spend,\n         ROUND(100.0 * SUM(amount_cents) / SUM(SUM(amount_cents)) OVER (), 2) AS pct\n  FROM expenses\n  GROUP BY category\n),\nr AS (\n  SELECT category, spend, pct, RANK() OVER (ORDER BY spend DESC, category ASC) AS rk\n  FROM s\n)\nSELECT category, spend, pct\nFROM r\nWHERE rk <= 3\nORDER BY spend DESC, category ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p265"],
  },
  {
    id: "wf-p266",
    title: "Spend rank inside my city",
    brief:
      "Stage spend per city-and-customer; on each row add city_rk — the customer's spend rank within their city (ties alphabetical). Return city, name, spend (2 decimals), city_rk, ordered by city then city_rk.",
    difficulty: "hard",
    hints: [
      "CTE: GROUP BY city, customer. RANK() OVER (PARTITION BY city ORDER BY spend DESC, name ASC) in the outer layer.",
      "Cities with one customer read rk = 1 trivially.",
    ],
    solution:
      "WITH cc AS (\n  SELECT c.city, c.name, SUM(o.total) AS spend\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.city, c.id, c.name\n)\nSELECT city, name, ROUND(spend, 2) AS spend,\n       RANK() OVER (PARTITION BY city ORDER BY spend DESC, name ASC) AS city_rk\nFROM cc\nORDER BY city, city_rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p266"],
  },
  {
    id: "wf-p267",
    title: "Region ladder with cumulative share",
    brief:
      "Stage per-region revenue; DENSE_RANK regions from biggest and add cum_share — the running percent of revenue accounted for (2 decimals). Return region, revenue, drk, cum_share, ordered by drk.",
    difficulty: "hard",
    hints: [
      "DENSE_RANK() OVER (ORDER BY revenue DESC) plus the running-sum share over revenue DESC frame.",
      "Four regions — the last one completes 100%.",
    ],
    solution:
      "WITH r AS (\n  SELECT c.region, SUM(o.total) AS revenue\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n)\nSELECT region, ROUND(revenue, 2) AS revenue,\n       DENSE_RANK() OVER (ORDER BY revenue DESC, region ASC) AS drk,\n       ROUND(100.0 * SUM(revenue) OVER (ORDER BY revenue DESC, region ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) / SUM(revenue) OVER (), 2) AS cum_share\nFROM r\nORDER BY drk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p267"],
  },
  {
    id: "wf-p268",
    title: "Two largest invoices per customer",
    brief:
      "For each customer, their two largest invoices. Return customer_id, number, amount_cents, and rn, ordered by customer_id then rn.",
    difficulty: "medium",
    hints: [
      "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount_cents DESC, id ASC), keep rn <= 2.",
      "Customers with a single invoice show just one row.",
    ],
    solution:
      "WITH r AS (\n  SELECT customer_id, number, amount_cents,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount_cents DESC, id ASC) AS rn\n  FROM invoices\n)\nSELECT customer_id, number, amount_cents, rn\nFROM r\nWHERE rn <= 2\nORDER BY customer_id, rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p268"],
  },
  {
    id: "wf-p269",
    title: "Demand standing of every product",
    brief:
      "Stage units sold per product; on each row add units_cd — CUME_DIST over units ascending (4 decimals). Return name, units, units_cd, ordered by units then name.",
    difficulty: "hard",
    hints: [
      "CTE sums quantity per product; CUME_DIST() OVER (ORDER BY units ASC, name ASC) in the outer layer.",
      "The best seller's distribution reads 1.0.",
    ],
    solution:
      "WITH u AS (\n  SELECT p.name, SUM(oi.quantity) AS units\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.id, p.name\n)\nSELECT name, units, ROUND(CUME_DIST() OVER (ORDER BY units ASC, name ASC), 4) AS units_cd\nFROM u\nORDER BY units ASC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p269"],
  },
  {
    id: "wf-p270",
    title: "Delivered months, ranked",
    brief:
      "Stage monthly DELIVERED revenue only; rank months from biggest (ties share). Return month, revenue (2 decimals), and rk, ordered by rk then month.",
    difficulty: "medium",
    hints: [
      "Filter status = 'delivered' in the staging CTE; RANK over revenue DESC, month ASC.",
      "Delivered-only totals differ from the all-status rankings.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  WHERE status = 'delivered'\n  GROUP BY month\n)\nSELECT month, ROUND(revenue, 2) AS revenue, RANK() OVER (ORDER BY revenue DESC, month ASC) AS rk\nFROM m\nORDER BY rk, month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p270"],
  },
  {
    id: "wf-p271",
    title: "Worst offenders first",
    brief:
      "Open invoices, aged against the FIXED reference date 2025-03-01: show number, customer_id, due_on, and days_past_due (julianday('2025-03-01') - julianday(due_on), cast to INTEGER; can be negative for not-yet-due). Rank worst-first with rk. Ordered by rk.",
    difficulty: "hard",
    hints: [
      "WHERE status = 'open'; days_past_due = CAST(julianday('2025-03-01') - julianday(due_on) AS INTEGER).",
      "RANK() OVER (ORDER BY days_past_due DESC) — stage the days in a CTE first.",
    ],
    solution:
      "WITH a AS (\n  SELECT number, customer_id, due_on,\n         CAST(julianday('2025-03-01') - julianday(due_on) AS INTEGER) AS days_past_due\n  FROM invoices\n  WHERE status = 'open'\n)\nSELECT number, customer_id, due_on, days_past_due,\n       RANK() OVER (ORDER BY days_past_due DESC, number ASC) AS rk\nFROM a\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p271"],
  },
  {
    id: "wf-p272",
    title: "The aging ladder",
    brief:
      "Bucket open invoices by age at 2025-03-01: bucket is 'current' when days_past_due <= 0, '1-30' up to 30, '31-60' up to 60, else '60+'. Show number, amount_cents, and bucket, ordered by bucket then amount DESC.",
    difficulty: "hard",
    hints: [
      "Compute days in a CTE (same julianday math), CASE in the outer layer.",
      "Bucket strings exactly: 'current', '1-30', '31-60', '60+'.",
    ],
    solution:
      "WITH a AS (\n  SELECT number, amount_cents,\n         CAST(julianday('2025-03-01') - julianday(due_on) AS INTEGER) AS days_past_due\n  FROM invoices\n  WHERE status = 'open'\n)\nSELECT number, amount_cents,\n       CASE WHEN days_past_due <= 0 THEN 'current'\n            WHEN days_past_due <= 30 THEN '1-30'\n            WHEN days_past_due <= 60 THEN '31-60'\n            ELSE '60+' END AS bucket\nFROM a\nORDER BY bucket, amount_cents DESC, number ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p272"],
  },
  {
    id: "wf-p273",
    title: "Receivables leaderboard",
    brief:
      "Stage each customer's total OPEN invoice cents; rank from biggest (ties share, alphabetical tiebreak). Return customer_id, owed, and rk, ordered by rk.",
    difficulty: "medium",
    hints: [
      "CTE: SUM(amount_cents) WHERE status = 'open' GROUP BY customer_id. RANK() OVER (ORDER BY owed DESC, customer_id ASC).",
      "Customers with no open invoices simply don't appear.",
    ],
    solution:
      "WITH o AS (\n  SELECT customer_id, SUM(amount_cents) AS owed\n  FROM invoices\n  WHERE status = 'open'\n  GROUP BY customer_id\n)\nSELECT customer_id, owed, RANK() OVER (ORDER BY owed DESC, customer_id ASC) AS rk\nFROM o\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p273"],
  },
  {
    id: "wf-p274",
    title: "Billed-so-far, customer by customer",
    brief:
      "Per customer, invoices in issue order: show id, customer_id, issued_on, amount_cents, and billed_running — the running billed cents. Ordered by customer_id then issued_on.",
    difficulty: "medium",
    hints: [
      "SUM(amount_cents) OVER (PARTITION BY customer_id ORDER BY issued_on ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
      "The AR sibling of the running spend meter.",
    ],
    solution:
      "SELECT id, customer_id, issued_on, amount_cents,\n       SUM(amount_cents) OVER (PARTITION BY customer_id ORDER BY issued_on ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS billed_running\nFROM invoices\nORDER BY customer_id, issued_on ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p274"],
  },
  {
    id: "wf-p275",
    title: "Collections clock",
    brief:
      "Stage monthly PAID cents (payments.paid_on), then show month, collected, and cum_collected — the running total (2 decimals not needed; cents are integers). Ordered by month.",
    difficulty: "medium",
    hints: [
      "CTE: GROUP BY strftime('%Y-%m', paid_on), SUM(amount_cents). Running SUM over month order.",
      "Cash-in clock: each month adds to the pot.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', paid_on) AS month, SUM(amount_cents) AS collected\n  FROM payments\n  GROUP BY month\n)\nSELECT month, collected,\n       SUM(collected) OVER (ORDER BY month ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_collected\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p275"],
  },
  {
    id: "wf-p276",
    title: "Smoothed spend curve",
    brief:
      "Stage monthly expense totals; add ma3 — the trailing 3-month average (2 decimals). Return month, spend, ma3, ordered by month.",
    difficulty: "medium",
    hints: [
      "AVG(spend) OVER (ORDER BY month ASC ROWS BETWEEN 2 PRECEDING AND CURRENT ROW).",
      "Smoothing exposes the trend under the monthly noise.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', spent_on) AS month, SUM(amount_cents) AS spend\n  FROM expenses\n  GROUP BY month\n)\nSELECT month, spend, ROUND(AVG(spend) OVER (ORDER BY month ASC ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p276"],
  },
  {
    id: "wf-p277",
    title: "Daily net and running balance",
    brief:
      "Stage the net movement per ledger day (entry_date): net = SUM(debit) - SUM(credit) for the day; then balance — the running net across days (ordered by day). Return day, net, balance, ordered by day.",
    difficulty: "hard",
    hints: [
      "CTE: GROUP BY entry_date, SUM(debit_cents) - SUM(credit_cents) AS net.",
      "Balance: SUM(net) OVER (ORDER BY day ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
    ],
    solution:
      "WITH d AS (\n  SELECT entry_date AS day, SUM(debit_cents) - SUM(credit_cents) AS net\n  FROM ledger_entries\n  GROUP BY entry_date\n)\nSELECT day, net,\n       SUM(net) OVER (ORDER BY day ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS balance\nFROM d\nORDER BY day;",
    ordered: true,
    expected: EXPECTED_WF["wf-p277"],
  },
  {
    id: "wf-p278",
    title: "Days to pay, slowest first",
    brief:
      "Join payments to invoices; for each payment compute days_to_pay = julianday(paid_on) - julianday(issued_on), cast to INTEGER. Show payment id, invoice number, days_to_pay, and rk — ranked slowest first. Ordered by rk.",
    difficulty: "hard",
    hints: [
      "CTE does the join + julianday math; RANK() OVER (ORDER BY days_to_pay DESC, payment_id ASC) outside.",
      "Big days_to_pay = the slowest payers.",
    ],
    solution:
      "WITH t AS (\n  SELECT p.id AS payment_id, i.number, p.paid_on, i.issued_on,\n         CAST(julianday(p.paid_on) - julianday(i.issued_on) AS INTEGER) AS days_to_pay\n  FROM payments p\n  JOIN invoices i ON i.id = p.invoice_id\n)\nSELECT payment_id, number, days_to_pay,\n       RANK() OVER (ORDER BY days_to_pay DESC, payment_id ASC) AS rk\nFROM t\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p278"],
  },
  {
    id: "wf-p279",
    title: "Payment speed percentiles",
    brief:
      "Same days_to_pay figure, but statistical: show payment id, days_to_pay, pr (PERCENT_RANK, 4 decimals) and cd (CUME_DIST, 4 decimals) over the ascending walk. Ordered by days_to_pay then payment id.",
    difficulty: "hard",
    hints: [
      "Two windows over ORDER BY days_to_pay ASC, payment_id ASC in the staged CTE.",
      "pr starts at 0, cd at 1/n.",
    ],
    solution:
      "WITH t AS (\n  SELECT p.id AS payment_id,\n         CAST(julianday(p.paid_on) - julianday(i.issued_on) AS INTEGER) AS days_to_pay\n  FROM payments p\n  JOIN invoices i ON i.id = p.invoice_id\n)\nSELECT payment_id, days_to_pay,\n       ROUND(PERCENT_RANK() OVER (ORDER BY days_to_pay ASC, payment_id ASC), 4) AS pr,\n       ROUND(CUME_DIST() OVER (ORDER BY days_to_pay ASC, payment_id ASC), 4) AS cd\nFROM t\nORDER BY days_to_pay ASC, payment_id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p279"],
  },
  {
    id: "wf-p280",
    title: "Vendor concentration",
    brief:
      "Stage per-vendor expense totals; rank them and show share — percent of all expense spend (2 decimals). Return vendor, spend, share, and rk, ordered by rk.",
    difficulty: "hard",
    hints: [
      "CTE stages vendor totals + share via SUM(SUM(amount_cents)) OVER ().",
      "Outer layer adds RANK() OVER (ORDER BY spend DESC) and filters nothing — all vendors, ranked.",
    ],
    solution:
      "WITH v AS (\n  SELECT vendor, SUM(amount_cents) AS spend,\n         ROUND(100.0 * SUM(amount_cents) / SUM(SUM(amount_cents)) OVER (), 2) AS share\n  FROM expenses\n  GROUP BY vendor\n)\nSELECT vendor, spend, share, RANK() OVER (ORDER BY spend DESC, vendor ASC) AS rk\nFROM v\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p280"],
  },
  {
    id: "wf-p281",
    title: "Billed versus collected, by month",
    brief:
      "Stage monthly invoiced cents (invoices.issued_on) and monthly paid cents (payments.paid_on); align them by month with a LEFT JOIN from the invoiced months. Return month, billed, paid (NULL when nothing was paid that month), ordered by month.",
    difficulty: "hard",
    hints: [
      "Two CTEs grouped by month, then LEFT JOIN ON month — windows aren't needed for the join, but stage each series first.",
      "Actually keep it window-flavored: after the join, add cum_billed — running SUM(billed) OVER (ORDER BY month).",
    ],
    solution:
      "WITH b AS (\n  SELECT strftime('%Y-%m', issued_on) AS month, SUM(amount_cents) AS billed\n  FROM invoices\n  GROUP BY month\n),\np AS (\n  SELECT strftime('%Y-%m', paid_on) AS month, SUM(amount_cents) AS paid\n  FROM payments\n  GROUP BY month\n)\nSELECT b.month, b.billed, p.paid,\n       SUM(b.billed) OVER (ORDER BY b.month ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_billed\nFROM b\nLEFT JOIN p ON p.month = b.month\nORDER BY b.month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p281"],
  },
  {
    id: "wf-p282",
    title: "Fastest payers",
    brief:
      "Stage each customer's average days-to-pay across their PAID invoices (join invoices→payments→customers; avg of julianday differences). Rank fastest first. Return name, avg_days (2 decimals), and rk, ordered by rk.",
    difficulty: "hard",
    hints: [
      "CTE: AVG(CAST(julianday(paid_on) - julianday(issued_on) AS INTEGER)) grouped by customer name.",
      "RANK() OVER (ORDER BY avg_days ASC, name ASC).",
    ],
    solution:
      "WITH t AS (\n  SELECT c.name, AVG(CAST(julianday(p.paid_on) - julianday(i.issued_on) AS REAL)) AS avg_days\n  FROM payments p\n  JOIN invoices i ON i.id = p.invoice_id\n  JOIN customers c ON c.id = i.customer_id\n  GROUP BY c.id, c.name\n)\nSELECT name, ROUND(avg_days, 2) AS avg_days, RANK() OVER (ORDER BY avg_days ASC, name ASC) AS rk\nFROM t\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p282"],
  },
  {
    id: "wf-p283",
    title: "Flagship invoice per customer",
    brief:
      "One row per customer: their largest invoice (amount ties: alphabetically first number). Return customer_id, number, and amount_cents, ordered by customer_id.",
    difficulty: "easy",
    hints: [
      "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount_cents DESC, number ASC), keep rn = 1.",
      "The invoice-table twin of the biggest-basket pattern.",
    ],
    solution:
      "WITH r AS (\n  SELECT customer_id, number, amount_cents,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount_cents DESC, number ASC) AS rn\n  FROM invoices\n)\nSELECT customer_id, number, amount_cents\nFROM r\nWHERE rn = 1\nORDER BY customer_id;",
    ordered: true,
    expected: EXPECTED_WF["wf-p283"],
  },
  {
    id: "wf-p284",
    title: "Cash position clock",
    brief:
      "Stage monthly paid cents; add cum_collected (running sum) and pct_of_cash — each month's share of ALL collections (2 decimals). Return month, collected, cum_collected, pct_of_cash, ordered by month.",
    difficulty: "hard",
    hints: [
      "Running SUM over month order; share via 100.0 * collected / SUM(collected) OVER ().",
      "Both windows live in the same outer SELECT.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', paid_on) AS month, SUM(amount_cents) AS collected\n  FROM payments\n  GROUP BY month\n)\nSELECT month, collected,\n       SUM(collected) OVER (ORDER BY month ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_collected,\n       ROUND(100.0 * collected / SUM(collected) OVER (), 2) AS pct_of_cash\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p284"],
  },
  {
    id: "wf-p285",
    title: "Rent's monthly bite",
    brief:
      "Per month, show total spend and rent_share — the Rent category's percent of that month's expense spend (2 decimals). Only months WITH Rent rows appear naturally from the partitioned sum; compute on ALL expenses grouped by month with an empty-window Rent sum via FILTER. Return month, spend, rent_share, ordered by month.",
    difficulty: "hard",
    hints: [
      "CTE by month: SUM(amount_cents) AS spend, SUM(amount_cents) FILTER (WHERE category = 'Rent') AS rent.",
      "Share: 100.0 * rent / spend, rounded, in the outer layer.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', spent_on) AS month,\n         SUM(amount_cents) AS spend,\n         SUM(amount_cents) FILTER (WHERE category = 'Rent') AS rent\n  FROM expenses\n  GROUP BY month\n)\nSELECT month, spend, ROUND(100.0 * rent / spend, 2) AS rent_share\nFROM m\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p285"],
  },
  {
    id: "wf-p286",
    title: "Account movement ranks",
    brief:
      "Stage per-account net movement (SUM(debit) - SUM(credit)); rank accounts from most positive net. Return account, net, and rk, ordered by rk.",
    difficulty: "medium",
    hints: [
      "CTE: GROUP BY account with the net expression. RANK() OVER (ORDER BY net DESC, account ASC).",
      "Negative nets sink to the bottom ranks.",
    ],
    solution:
      "WITH a AS (\n  SELECT account, SUM(debit_cents) - SUM(credit_cents) AS net\n  FROM ledger_entries\n  GROUP BY account\n)\nSELECT account, net, RANK() OVER (ORDER BY net DESC, account ASC) AS rk\nFROM a\nORDER BY rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p286"],
  },
  {
    id: "wf-p287",
    title: "Ads spend, month over month",
    brief:
      "Stage the Ads category's monthly spend (filter category = 'Ads'); add prev_spend (LAG) and growth (MoM percent, 2 decimals, NULL first). Return month, spend, prev_spend, growth, ordered by month.",
    difficulty: "hard",
    hints: [
      "LAG in a staging CTE; the percent in the outer layer guards the NULL first month.",
      "100.0 * (spend - prev) / prev.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', spent_on) AS month, SUM(amount_cents) AS spend\n  FROM expenses\n  WHERE category = 'Ads'\n  GROUP BY month\n),\nd AS (\n  SELECT month, spend, LAG(spend) OVER (ORDER BY month ASC) AS prev_spend\n  FROM m\n)\nSELECT month, spend, prev_spend,\n       CASE WHEN prev_spend IS NULL THEN NULL ELSE ROUND(100.0 * (spend - prev_spend) / prev_spend, 2) END AS growth\nFROM d\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p287"],
  },
  {
    id: "wf-p288",
    title: "Invoice tiles inside each status",
    brief:
      "Within each invoice status, bucket into 3 amount tiles (ascending): show number, status, amount_cents, and tile — NTILE(3) partitioned by status. Ordered by status then amount.",
    difficulty: "medium",
    hints: [
      "NTILE(3) OVER (PARTITION BY status ORDER BY amount_cents ASC, id ASC).",
      "The void status has one invoice — its tile is 1.",
    ],
    solution:
      "SELECT number, status, amount_cents, NTILE(3) OVER (PARTITION BY status ORDER BY amount_cents ASC, id ASC) AS tile\nFROM invoices\nORDER BY status, amount_cents ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p288"],
  },
  {
    id: "wf-p289",
    title: "Payment-speed bands",
    brief:
      "Stage each payment's days_to_pay (julianday(paid_on) - julianday(invoices.issued_on), cast to INTEGER), then bucket into 4 bands: show payment id, days_to_pay, and band — NTILE(4) over days ascending. Ordered by days then id.",
    difficulty: "hard",
    hints: [
      "CTE joins and computes; NTILE(4) OVER (ORDER BY days_to_pay ASC, payment_id ASC) outside.",
      "Fast payers land in band 1.",
    ],
    solution:
      "WITH t AS (\n  SELECT p.id AS payment_id,\n         CAST(julianday(p.paid_on) - julianday(i.issued_on) AS INTEGER) AS days_to_pay\n  FROM payments p\n  JOIN invoices i ON i.id = p.invoice_id\n)\nSELECT payment_id, days_to_pay, NTILE(4) OVER (ORDER BY days_to_pay ASC, payment_id ASC) AS band\nFROM t\nORDER BY days_to_pay ASC, payment_id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p289"],
  },
  {
    id: "wf-p290",
    title: "Three vendor giants per category",
    brief:
      "Stage spend per category-and-vendor; within each category rank vendors and keep the top 3. Return category, vendor, spend, and rn, ordered by category then rn.",
    difficulty: "hard",
    hints: [
      "CTE: GROUP BY category, vendor. ROW_NUMBER() OVER (PARTITION BY category ORDER BY spend DESC, vendor ASC), filter rn <= 3.",
      "Categories with fewer vendors show fewer rows.",
    ],
    solution:
      "WITH cv AS (\n  SELECT category, vendor, SUM(amount_cents) AS spend\n  FROM expenses\n  GROUP BY category, vendor\n),\nr AS (\n  SELECT category, vendor, spend, ROW_NUMBER() OVER (PARTITION BY category ORDER BY spend DESC, vendor ASC) AS rn\n  FROM cv\n)\nSELECT category, vendor, spend, rn\nFROM r\nWHERE rn <= 3\nORDER BY category, rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p290"],
  },
  {
    id: "wf-p291",
    title: "Low-water marks",
    brief:
      "Walk the ledger chronologically (entry_date ASC, id ASC): show id, entry_date, balance (running net, 2 decimals not needed) and new_low — 'yes' when the balance is strictly below every earlier balance (balance = MIN(balance) OVER the running frame), else 'no'. Ordered by the walk.",
    difficulty: "hard",
    hints: [
      "Stage the running balance first; compare with MIN(balance) OVER (ORDER BY … ROWS UNBOUNDED PRECEDING…) in the outer layer.",
      "The first row is always a new low (there was nothing before it) — its balance equals its own running min.",
    ],
    solution:
      "WITH w AS (\n  SELECT id, entry_date,\n         SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS balance\n  FROM ledger_entries\n)\nSELECT id, entry_date, balance,\n       CASE WHEN balance <= MIN(balance) OVER (ORDER BY entry_date ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) THEN 'yes' ELSE 'no' END AS new_low\nFROM w\nORDER BY entry_date ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p291"],
  },
  {
    id: "wf-p292",
    title: "Customer AR with dense standing",
    brief:
      "Stage per-customer open amount and open count; DENSE_RANK customers by owed amount from biggest. Return customer_id, owed, open_count, and drk, ordered by drk.",
    difficulty: "medium",
    hints: [
      "CTE: SUM + COUNT filtered to open invoices, grouped by customer.",
      "DENSE_RANK() OVER (ORDER BY owed DESC, customer_id ASC).",
    ],
    solution:
      "WITH o AS (\n  SELECT customer_id, SUM(amount_cents) AS owed, COUNT(*) AS open_count\n  FROM invoices\n  WHERE status = 'open'\n  GROUP BY customer_id\n)\nSELECT customer_id, owed, open_count, DENSE_RANK() OVER (ORDER BY owed DESC, customer_id ASC) AS drk\nFROM o\nORDER BY drk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p292"],
  },
  {
    id: "wf-p293",
    title: "Payment method of the month",
    brief:
      "Stage payment counts per month-and-method; within each month rank methods by count (ties: alphabetical method). Return month, method, payments, and rk, ordered by month then rk.",
    difficulty: "hard",
    hints: [
      "CTE: GROUP BY month, method. RANK() OVER (PARTITION BY month ORDER BY payments DESC, method ASC) outside.",
      "Each month crowns its own champion rail.",
    ],
    solution:
      "WITH mm AS (\n  SELECT strftime('%Y-%m', paid_on) AS month, method, COUNT(*) AS payments\n  FROM payments\n  GROUP BY month, method\n)\nSELECT month, method, payments,\n       RANK() OVER (PARTITION BY month ORDER BY payments DESC, method ASC) AS rk\nFROM mm\nORDER BY month, rk;",
    ordered: true,
    expected: EXPECTED_WF["wf-p293"],
  },
  {
    id: "wf-p294",
    title: "Spend months, percentile standing",
    brief:
      "Stage monthly expense totals; add pr (PERCENT_RANK, 4 decimals) and cd (CUME_DIST, 4 decimals) over the ascending walk. Return month, spend, pr, cd, ordered by spend then month.",
    difficulty: "medium",
    hints: [
      "Both windows over ORDER BY spend ASC, month ASC in the outer layer.",
      "Same statistics as the revenue version — different table.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', spent_on) AS month, SUM(amount_cents) AS spend\n  FROM expenses\n  GROUP BY month\n)\nSELECT month, spend,\n       ROUND(PERCENT_RANK() OVER (ORDER BY spend ASC, month ASC), 4) AS pr,\n       ROUND(CUME_DIST() OVER (ORDER BY spend ASC, month ASC), 4) AS cd\nFROM m\nORDER BY spend ASC, month ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p294"],
  },
  {
    id: "wf-p295",
    title: "The chase list",
    brief:
      "Open invoices past due at 2025-03-01 (days_past_due > 0), worst first, top 10: show number, due_on, days_past_due, and rn. Ordered by rn.",
    difficulty: "hard",
    hints: [
      "CTE computes days (julianday('2025-03-01') - due_on) and filters status + positivity.",
      "ROW_NUMBER() OVER (ORDER BY days_past_due DESC, number ASC), keep rn <= 10.",
    ],
    solution:
      "WITH a AS (\n  SELECT number, due_on,\n         CAST(julianday('2025-03-01') - julianday(due_on) AS INTEGER) AS days_past_due\n  FROM invoices\n  WHERE status = 'open'\n),\nr AS (\n  SELECT number, due_on, days_past_due,\n         ROW_NUMBER() OVER (ORDER BY days_past_due DESC, number ASC) AS rn\n  FROM a\n  WHERE days_past_due > 0\n)\nSELECT number, due_on, days_past_due, rn\nFROM r\nWHERE rn <= 10\nORDER BY rn;",
    ordered: true,
    expected: EXPECTED_WF["wf-p295"],
  },
  {
    id: "wf-p296",
    title: "Monthly net movement",
    brief:
      "Stage the ledger's net movement per month (SUM(debit) - SUM(credit) grouped by entry_date month); add prev_net (LAG) and step (net - prev_net). Return month, net, prev_net, step, ordered by month.",
    difficulty: "hard",
    hints: [
      "LAG in a staging CTE; step = net - prev_net in the outer layer (NULL on the first month).",
      "Movement accounting at month grain.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', entry_date) AS month, SUM(debit_cents) - SUM(credit_cents) AS net\n  FROM ledger_entries\n  GROUP BY month\n),\nd AS (\n  SELECT month, net, LAG(net) OVER (ORDER BY month ASC) AS prev_net\n  FROM m\n)\nSELECT month, net, prev_net, net - prev_net AS step\nFROM d\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p296"],
  },
  {
    id: "wf-p297",
    title: "Lifetime-value bands",
    brief:
      "Stage per-customer spend; split into 3 bands with labels: band 'low' (tile 1), 'mid' (tile 2), 'high' (tile 3) via NTILE(3) over spend DESC. Return name, spend (2 decimals), band, ordered by spend DESC, name.",
    difficulty: "hard",
    hints: [
      "CASE NTILE(3) OVER (ORDER BY spend DESC, name ASC) WHEN 1 THEN 'low' WHEN 2 THEN 'mid' ELSE 'high' END.",
      "DESC ranking makes tile 1 the smallest spenders.",
    ],
    solution:
      "WITH s AS (\n  SELECT c.name, SUM(o.total) AS spend\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n)\nSELECT name, ROUND(spend, 2) AS spend,\n       CASE NTILE(3) OVER (ORDER BY spend DESC, name ASC) WHEN 1 THEN 'low' WHEN 2 THEN 'mid' ELSE 'high' END AS band\nFROM s\nORDER BY spend DESC, name ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p297"],
  },
  {
    id: "wf-p298",
    title: "Biggest expense of each month",
    brief:
      "One row per month (with expenses): its single largest expense that month (ties: smaller id). Return month, id, vendor, and amount_cents, ordered by month.",
    difficulty: "medium",
    hints: [
      "ROW_NUMBER() OVER (PARTITION BY strftime('%Y-%m', spent_on) ORDER BY amount_cents DESC, id ASC), keep rn = 1.",
      "Alias the month expression as month and select it.",
    ],
    solution:
      "WITH r AS (\n  SELECT strftime('%Y-%m', spent_on) AS month, id, vendor, amount_cents,\n         ROW_NUMBER() OVER (PARTITION BY strftime('%Y-%m', spent_on) ORDER BY amount_cents DESC, id ASC) AS rn\n  FROM expenses\n)\nSELECT month, id, vendor, amount_cents\nFROM r\nWHERE rn = 1\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p298"],
  },
  {
    id: "wf-p299",
    title: "Cash halves",
    brief:
      "Split payments into 2 amount halves (ascending): show id, method, amount_cents, and half — NTILE(2); plus cd — CUME_DIST (4 decimals). Ordered by amount then id.",
    difficulty: "medium",
    hints: [
      "NTILE(2) and CUME_DIST over the same ORDER BY amount_cents ASC, id ASC.",
      "Odd counts give the extra row to half 1.",
    ],
    solution:
      "SELECT id, method, amount_cents,\n       NTILE(2) OVER (ORDER BY amount_cents ASC, id ASC) AS half,\n       ROUND(CUME_DIST() OVER (ORDER BY amount_cents ASC, id ASC), 4) AS cd\nFROM payments\nORDER BY amount_cents ASC, id ASC;",
    ordered: true,
    expected: EXPECTED_WF["wf-p299"],
  },
  {
    id: "wf-p300",
    title: "The revenue command board",
    brief:
      "The capstone read: monthly revenue with rk (rank from biggest), cum_revenue (running total, 2 decimals), and growth (MoM percent, 2 decimals, NULL first) — but ONLY the months ranked in the top 5. Return month, revenue, rk, cum_revenue, growth, ordered by month.",
    difficulty: "hard",
    hints: [
      "Stage months + LAG in one CTE; compute rk, running sum, growth in a second; filter rk <= 5 in a third.",
      "The filter must come after every window — one more CTE layer.",
    ],
    solution:
      "WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n),\nd AS (\n  SELECT month, revenue, LAG(revenue) OVER (ORDER BY month ASC) AS prev\n  FROM m\n),\nx AS (\n  SELECT month, revenue, prev,\n         RANK() OVER (ORDER BY revenue DESC, month ASC) AS rk,\n         ROUND(SUM(revenue) OVER (ORDER BY month ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS cum_revenue,\n         CASE WHEN prev IS NULL THEN NULL ELSE ROUND(100.0 * (revenue - prev) / prev, 2) END AS growth\n  FROM d\n)\nSELECT month, ROUND(revenue, 2) AS revenue, rk, cum_revenue, growth\nFROM x\nWHERE rk <= 5\nORDER BY month;",
    ordered: true,
    expected: EXPECTED_WF["wf-p300"],
  },
];