// Quick harness to validate the QueryPlan builder against sample queries.
// Run: bun scripts/test-parser.ts
import { buildQueryPlan } from "../src/lib/sql-parser";
import type { Dialect } from "../src/lib/sql-parser";

const samples: Array<{ name: string; dialect: Dialect; sql: string }> = [
  {
    name: "Simple lookup",
    dialect: "postgresql",
    sql: "SELECT id, name, email FROM users WHERE active = 1 ORDER BY name LIMIT 20;",
  },
  {
    name: "Join + aggregation",
    dialect: "postgresql",
    sql: `SELECT c.name, o.status, COUNT(*) AS order_count, SUM(o.total) AS revenue
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id
WHERE o.created_at >= '2024-01-01'
GROUP BY c.name, o.status
HAVING COUNT(*) > 5
ORDER BY revenue DESC;`,
  },
  {
    name: "Star schema multi-join",
    dialect: "postgresql",
    sql: `SELECT c.region, p.category, COUNT(DISTINCT o.id) AS orders, SUM(oi.quantity * oi.unit_price) AS sales
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
    name: "CTE + window function",
    dialect: "postgresql",
    sql: `WITH monthly AS (
  SELECT customer_id, DATE_TRUNC('month', created_at) AS month, SUM(total) AS spend
  FROM orders GROUP BY customer_id, DATE_TRUNC('month', created_at)
)
SELECT m.month, m.spend, m.customer_id,
       RANK() OVER (PARTITION BY m.month ORDER BY m.spend DESC) AS spend_rank
FROM monthly m
WHERE m.spend > 100
ORDER BY m.month, spend_rank;`,
  },
  {
    name: "UNION set-op",
    dialect: "postgresql",
    sql: `SELECT name, 'customer' AS source FROM customers WHERE region = 'EU'
UNION
SELECT name, 'supplier' AS source FROM suppliers WHERE region = 'EU'
ORDER BY name;`,
  },
  {
    name: "Correlated subquery",
    dialect: "postgresql",
    sql: `SELECT p.name, p.price
FROM products p
WHERE p.price > (SELECT AVG(price) FROM products pr WHERE pr.category = p.category)
ORDER BY p.price DESC;`,
  },
  {
    name: "UPDATE statement",
    dialect: "mysql",
    sql: "UPDATE products SET price = price * 1.1 WHERE category = 'toys';",
  },
  {
    name: "Syntax error",
    dialect: "postgresql",
    sql: "SELECT FROM WHERE",
  },
];

for (const s of samples) {
  const plan = buildQueryPlan(s.sql, s.dialect);
  if (!plan.ok) {
    console.log(`\n=== ${s.name} === ERROR: ${plan.error.slice(0, 140)}`);
    continue;
  }
  console.log(`\n=== ${s.name} ===`);
  console.log(
    JSON.stringify(
      {
        type: plan.statementType,
        tables: plan.tables.map((t) => `${t.name}${t.alias ? `/${t.alias}` : ""}[${t.kind}]join=${t.joinType}->${t.joinsTo}`),
        joins: plan.joins.map((j) => `${j.left} -${j.type}-> ${j.right} ON ${j.on}`),
        columns: plan.columns.map((c) => c.text),
        where: plan.where,
        groupBy: plan.groupBy,
        having: plan.having,
        orderBy: plan.orderBy,
        limit: plan.limit,
        setOps: plan.setOps,
        ctes: plan.ctes,
        stats: plan.stats,
      },
      null,
      1,
    ),
  );
}
