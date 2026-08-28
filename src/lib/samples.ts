import type { Dialect } from "./sql-parser";

export interface SampleQuery {
  id: string;
  name: string;
  description: string;
  dialect: Dialect;
  sql: string;
}

export const SAMPLE_QUERIES: SampleQuery[] = [
  {
    id: "join-agg",
    name: "Join + aggregation",
    description: "2 tables, INNER JOIN, GROUP BY, HAVING",
    dialect: "postgresql",
    sql: `SELECT c.name,
       o.status,
       COUNT(*) AS order_count,
       SUM(o.total) AS revenue
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id
WHERE o.created_at >= '2024-01-01'
GROUP BY c.name, o.status
HAVING COUNT(*) > 5
ORDER BY revenue DESC;`,
  },
  {
    id: "star-schema",
    name: "Star schema (4-way join)",
    description: "Fact table joined to 3 dimensions",
    dialect: "postgresql",
    sql: `SELECT c.region,
       p.category,
       COUNT(DISTINCT o.id) AS orders,
       SUM(oi.quantity * oi.unit_price) AS sales
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
LEFT JOIN customers c ON c.id = o.customer_id
WHERE o.status IN ('shipped', 'delivered')
GROUP BY c.region, p.category
ORDER BY sales DESC
LIMIT 25;`,
  },
  {
    id: "cte-window",
    name: "CTE + window function",
    description: "WITH clause feeding a RANK() window",
    dialect: "postgresql",
    sql: `WITH monthly AS (
  SELECT customer_id,
         DATE_TRUNC('month', created_at) AS month,
         SUM(total) AS spend
  FROM orders
  GROUP BY customer_id, DATE_TRUNC('month', created_at)
)
SELECT m.month,
       m.customer_id,
       m.spend,
       RANK() OVER (PARTITION BY m.month ORDER BY m.spend DESC) AS spend_rank
FROM monthly m
WHERE m.spend > 100
ORDER BY m.month, spend_rank;`,
  },
  {
    id: "subquery",
    name: "Correlated subquery",
    description: "Per-row comparison against an aggregate",
    dialect: "postgresql",
    sql: `SELECT p.name, p.price
FROM products p
WHERE p.price > (
  SELECT AVG(pr.price)
  FROM products pr
  WHERE pr.category = p.category
)
ORDER BY p.price DESC;`,
  },
  {
    id: "union",
    name: "UNION set operation",
    description: "Two sources merged, then sorted",
    dialect: "postgresql",
    sql: `SELECT name, 'customer' AS source
FROM customers
WHERE region = 'EU'
UNION
SELECT name, 'supplier' AS source
FROM suppliers
WHERE region = 'EU'
ORDER BY name;`,
  },
  {
    id: "simple",
    name: "Simple filtered lookup",
    description: "Single table, WHERE, ORDER BY, LIMIT",
    dialect: "postgresql",
    sql: `SELECT id, name, email
FROM users
WHERE active = 1 AND created_at > '2024-06-01'
ORDER BY name
LIMIT 20;`,
  },
];

export const DEFAULT_SAMPLE = SAMPLE_QUERIES[0];
