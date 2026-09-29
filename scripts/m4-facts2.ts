// M4 pass edge-fact probe #2 — SQLite gotchas for MCQ/error decoys.
// Run: npx tsx scripts/m4-facts2.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return (await db.$queryRawUnsafe(sql)) as T[];
}
async function one(sql: string): Promise<Record<string, unknown>> {
  const rows = await q(sql);
  return rows[0] ?? {};
}

async function main() {
  await resetDatabase();

  console.log("== scalar multi-row behavior ==");
  console.log("multi-row scalar equality probe:", await q(`SELECT id, total FROM orders WHERE total = (SELECT total FROM orders) LIMIT 3`).catch((e) => "ERROR: " + String(e).slice(0, 160)));
  console.log("order 1 total:", await one(`SELECT total FROM orders WHERE id = 1`));
  console.log("bare scalar subquery 2 rows in SELECT:", await q(`SELECT (SELECT total FROM orders LIMIT 2) v`).catch((e) => "ERROR: " + String(e).slice(0, 160)));
  console.log("sqlite version:", await one(`SELECT sqlite_version() v`));

  console.log("\n== empty subquery IN / NOT IN ==");
  console.log("NOT IN empty set:", await one(`SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'returned')`));
  console.log("IN empty set:", await one(`SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'returned')`));
  console.log("NULL scalar comparison:", await one(`SELECT COUNT(*) n FROM orders WHERE total > (SELECT NULL)`));
  console.log("NOT IN with NULL (direct):", await one(`SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT NULL)`));
  console.log("IN with NULL inside list:", await one(`SELECT COUNT(*) n FROM customers WHERE region IN ('EU', NULL)`));
  console.log("NOT IN list with NULL:", await one(`SELECT COUNT(*) n FROM customers WHERE region NOT IN ('EU', NULL)`));

  console.log("\n== boundary checks ==");
  console.log("orders exactly at avg:", await one(`SELECT COUNT(*) n FROM orders WHERE total = (SELECT AVG(total) FROM orders)`));
  console.log("products exactly at avg:", await one(`SELECT COUNT(*) n FROM products WHERE price = (SELECT AVG(price) FROM products)`));
  console.log("spend exactly 2000:", await one(`SELECT COUNT(*) n FROM (SELECT SUM(total) s FROM orders GROUP BY customer_id) WHERE s = 2000`));
  console.log("order counts > 6 boundary (=6):", await one(`SELECT COUNT(*) n FROM (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) WHERE n = 6`));
  console.log("order counts >= 5:", await one(`SELECT COUNT(*) n FROM (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) WHERE n >= 5`));
  console.log("line_sum exactly 1000:", await one(`SELECT COUNT(*) n FROM (SELECT SUM(unit_price*quantity) s FROM order_items GROUP BY order_id) WHERE s = 1000`));
  console.log("orders 2025:", await one(`SELECT COUNT(*) n FROM orders WHERE strftime('%Y', created_at) = '2025'`));
  console.log("heavy order-count names:", await q(`SELECT c.name, COUNT(*) n FROM orders o INNER JOIN customers c ON c.id = o.customer_id GROUP BY c.id HAVING COUNT(*) > 6 ORDER BY n DESC`));

  console.log("\n== EXISTS row-source semantics ==");
  console.log("EXISTS uncorrelated with LIMIT 0:", await one(`SELECT COUNT(*) n FROM customers WHERE EXISTS (SELECT 1 FROM orders LIMIT 0)`));
  console.log("EXISTS referencing outer alias only:", await one(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 WHERE c.region = 'EU')`));
  console.log("EU count:", await one(`SELECT COUNT(*) n FROM customers WHERE region = 'EU'`));
  console.log("IN vs EXISTS equivalence (EU orders):", await one(`SELECT COUNT(*) n FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU')`));
  console.log("EXISTS variant EU orders:", await one(`SELECT COUNT(*) n FROM orders o WHERE EXISTS (SELECT 1 FROM customers c WHERE c.id = o.customer_id AND c.region = 'EU')`));
  console.log("derived alias required probe (aliased):", await one(`SELECT COUNT(*) n FROM (SELECT customer_id cid, COUNT(*) n FROM orders GROUP BY customer_id) t WHERE t.n > 6`));

  console.log("\n== CTE semantics ==");
  console.log("CTE referenced twice (materialized once):", await q(`WITH heavy AS (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id HAVING COUNT(*) > 6) SELECT (SELECT COUNT(*) FROM heavy) a, (SELECT SUM(n) FROM heavy) b`));
  console.log("CTE shadows real table probe:", await q(`WITH customers AS (SELECT name FROM suppliers) SELECT COUNT(*) n FROM customers`).catch((e) => "ERROR: " + String(e).slice(0, 140)));
  console.log("recursive without terminator but aggregate outer (known hang — skip)");
  console.log("recursive 1..5 rows:", await q(`WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM c WHERE x < 5) SELECT * FROM c`));
  console.log("recursive with UNION dedupe 1..5 again:", await q(`WITH RECURSIVE c(x) AS (SELECT 1 UNION SELECT x+1 FROM c WHERE x < 5) SELECT * FROM c`));
  console.log("two recursive CTEs in one WITH:", await q(`WITH RECURSIVE a(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM a WHERE x < 3), b(y) AS (SELECT 10 UNION ALL SELECT y+10 FROM b WHERE y < 30) SELECT (SELECT MAX(x) FROM a) mx, (SELECT MAX(y) FROM b) my`));
  console.log("recursive date spine months over orders:", await q(`WITH RECURSIVE m(m) AS (SELECT '2024-01' UNION ALL SELECT strftime('%Y-%m', date(m || '-01', '+1 month')) FROM m WHERE m < strftime('%Y-%m', (SELECT MAX(created_at) FROM orders))) SELECT COUNT(*) n, MAX(m) last_m FROM m`));
  console.log("orders per month count range:", await q(`SELECT strftime('%Y-%m', created_at) m, COUNT(*) n FROM orders GROUP BY m ORDER BY m LIMIT 3`));
  console.log("ORDER BY inside CTE is honored by outer? probe:", await q(`WITH top AS (SELECT name, price FROM products ORDER BY price DESC LIMIT 3) SELECT * FROM top`));
  console.log("nested WITH (WITH inside subquery):", await one(`SELECT COUNT(*) n FROM (WITH t AS (SELECT id FROM orders WHERE status = 'pending') SELECT * FROM t)`));
  console.log("WITH after UNION probe (misplaced):", await q(`SELECT 1 UNION WITH x AS (SELECT 2) SELECT * FROM x`).catch((e) => "ERROR: " + String(e).slice(0, 140)));

  console.log("\n== derived table semantics ==");
  console.log("derived column alias via expression name:", await q(`SELECT d.n_orders, COUNT(*) customers FROM (SELECT customer_id, COUNT(*) AS n_orders FROM orders GROUP BY customer_id) d GROUP BY d.n_orders ORDER BY d.n_orders LIMIT 4`));
  console.log("derived in WHERE (scalar from derived):", await one(`SELECT COUNT(*) n FROM orders WHERE total > (SELECT AVG(t) FROM (SELECT MAX(total) AS t FROM orders GROUP BY customer_id))`));
  console.log("max-per-customer list:", await q(`SELECT ROUND(MAX(total),2) t FROM orders GROUP BY customer_id ORDER BY t DESC LIMIT 5`));
  console.log("derived vs HAVING same answer check:", await one(`SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id) WHERE s > 2177.08`));
  console.log("spend > 2177.08 count (exact avg):", await one(`SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id) WHERE s > (SELECT AVG(s) FROM (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id))`));
  console.log("correlated vs derived equivalence:", await one(`SELECT COUNT(*) n FROM products p WHERE p.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category = p.category)`));
  console.log("derived-join variant:", await one(`SELECT COUNT(*) n FROM products p INNER JOIN (SELECT category, AVG(price) ap FROM products GROUP BY category) c ON c.category = p.category WHERE p.price > c.ap`));
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
