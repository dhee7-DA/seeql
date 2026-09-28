// Facts probe for Module 11 (Query Performance & Index Design) authoring.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function main() {
  await resetDatabase();
  const q = async (sql: string) => (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  const one = async (sql: string) => (await q(sql))[0];

  console.log("distinct statuses:", await one(`SELECT COUNT(DISTINCT status) AS n FROM orders`));
  console.log("distinct customers in orders:", await one(`SELECT COUNT(DISTINCT customer_id) AS n FROM orders`));
  console.log("invoice number dup groups:", await one(`SELECT COUNT(*) AS n FROM (SELECT number FROM invoices GROUP BY number HAVING COUNT(*) > 1)`));
  console.log("orders 2024 vs 2025:", await one(`SELECT SUM(CASE WHEN created_at < '2025-01-01' THEN 1 ELSE 0 END) AS y2024, SUM(CASE WHEN created_at >= '2025-01-01' THEN 1 ELSE 0 END) AS y2025 FROM orders`));
  console.log("pending+shipped:", await one(`SELECT COUNT(*) AS n FROM orders WHERE status IN ('pending','shipped')`));
  console.log("customers A%:", await one(`SELECT COUNT(*) AS n FROM customers WHERE name LIKE 'A%'`));
  console.log("customers %a%:", await one(`SELECT COUNT(*) AS n FROM customers WHERE name LIKE '%a%'`));
  console.log("june 2024 orders:", await one(`SELECT COUNT(*) AS n FROM orders WHERE created_at >= '2024-06-01' AND created_at < '2024-07-01'`));
  console.log("july 2024 orders:", await one(`SELECT COUNT(*) AS n FROM orders WHERE created_at >= '2024-07-01' AND created_at < '2024-08-01'`));
  console.log("indexes in schema:", await one(`SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'index'`));
  console.log("autoindex rows:", await q(`SELECT name, tbl_name FROM sqlite_master WHERE type = 'index'`));
  console.log("cust1 orders:", await one(`SELECT COUNT(*) AS n, ROUND(SUM(total),2) AS s FROM orders WHERE customer_id = 1`));
  console.log("top3 totals:", await q(`SELECT id, total FROM orders ORDER BY total DESC LIMIT 3`));
  console.log("avg total by status:", await q(`SELECT status, COUNT(*) AS n, ROUND(AVG(total),2) AS avg_total FROM orders GROUP BY status ORDER BY status`));
  console.log("eqp status filter:", await q(`EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'shipped'`));
  console.log("eqp group month:", await q(`EXPLAIN QUERY PLAN SELECT SUBSTR(created_at,1,7) AS m, COUNT(*) FROM orders GROUP BY m`));
  console.log("eqp order by total:", await q(`EXPLAIN QUERY PLAN SELECT id, total FROM orders ORDER BY total DESC LIMIT 3`));
  console.log("eqp pk lookup:", await q(`EXPLAIN QUERY PLAN SELECT * FROM orders WHERE id = 42`));
  console.log("eqp join:", await q(`EXPLAIN QUERY PLAN SELECT o.id FROM orders o JOIN order_items oi ON oi.order_id = o.id`));
  console.log("eqp substr filter:", await q(`EXPLAIN QUERY PLAN SELECT id FROM orders WHERE SUBSTR(created_at,1,7) = '2024-07'`));
  console.log("eqp between filter:", await q(`EXPLAIN QUERY PLAN SELECT id FROM orders WHERE created_at BETWEEN '2024-06-01' AND '2024-06-30'`));
  console.log("eqp two-table join subq:", await q(`EXPLAIN QUERY PLAN SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE total > 100)`));
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
