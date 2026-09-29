// M4 pass fact probe — engine receipts for the Subqueries & CTEs keyword
// banks and the Module-4 gauntlet (IN subqueries, scalar subqueries, EXISTS,
// correlated subqueries, derived tables, WITH / WITH RECURSIVE).
// Run: npx tsx scripts/m4-facts.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return (await db.$queryRawUnsafe(sql)) as T[];
}
async function one(sql: string): Promise<Record<string, unknown>> {
  const rows = await q(sql);
  return rows[0] ?? {};
}
const n = (v: unknown) => Math.round(Number(v) * 100) / 100;

async function main() {
  const counts = await resetDatabase();
  console.log("seeded:", counts, "\n");

  console.log("== IN subqueries ==");
  console.log("customers with orders (IN):", await one(`SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders)`));
  console.log("customers with NO orders (NOT IN):", await one(`SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)`));
  console.log("no-order names:", await q(`SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders) ORDER BY name`));
  console.log("NULL trap: NOT IN (… UNION SELECT NULL):", await one(`SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders UNION SELECT NULL)`));
  console.log("products never ordered (NOT IN):", await one(`SELECT COUNT(*) n FROM products WHERE id NOT IN (SELECT product_id FROM order_items)`));
  console.log("never-ordered names:", await q(`SELECT name, price FROM products WHERE id NOT IN (SELECT product_id FROM order_items) ORDER BY name`));
  console.log("products in Electronics:", await one(`SELECT COUNT(*) n FROM products WHERE category IN (SELECT 'Electronics')`));
  console.log("orders of EU customers (IN subquery):", await one(`SELECT COUNT(*) n FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU')`));
  console.log("orders of US customers (IN):", await one(`SELECT COUNT(*) n FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'US')`));
  console.log("delivered orders of EU customers:", await one(`SELECT COUNT(*) n FROM orders WHERE status = 'delivered' AND customer_id IN (SELECT id FROM customers WHERE region = 'EU')`));
  console.log("suppliers with no sold products (NOT IN):", await one(`SELECT COUNT(*) n FROM suppliers WHERE id NOT IN (SELECT p.supplier_id FROM products p INNER JOIN order_items oi ON oi.product_id = p.id)`));
  console.log("suppliers with sold products (IN):", await one(`SELECT COUNT(*) n FROM suppliers WHERE id IN (SELECT p.supplier_id FROM products p INNER JOIN order_items oi ON oi.product_id = p.id)`));
  console.log("IN list vs IN subquery equivalence (EU):", await one(`SELECT COUNT(*) n FROM customers WHERE region IN (SELECT 'EU')`));
  console.log("multi-column IN not supported? (probe):", await q(`SELECT COUNT(*) n FROM orders WHERE (customer_id, status) IN (SELECT 1, 'delivered') LIMIT 1`).catch((e) => String(e).slice(0, 120)));
  console.log("distinct customer_ids in orders:", await one(`SELECT COUNT(DISTINCT customer_id) n FROM orders`));
  console.log("products above avg price (scalar+IN mix):", await one(`SELECT COUNT(*) n FROM products WHERE price > (SELECT AVG(price) FROM products)`));
  console.log("customers who ordered Electronics (IN nested):", await q(`SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category = 'Electronics'))) ORDER BY name`));

  console.log("\n== scalar subqueries ==");
  console.log("avg order total:", await one(`SELECT ROUND(AVG(total),2) v FROM orders`));
  console.log("max total:", await one(`SELECT MAX(total) v FROM orders`));
  console.log("min total:", await one(`SELECT MIN(total) v FROM orders`));
  console.log("orders above avg total:", await one(`SELECT COUNT(*) n FROM orders WHERE total > (SELECT AVG(total) FROM orders)`));
  console.log("orders below avg total:", await one(`SELECT COUNT(*) n FROM orders WHERE total < (SELECT AVG(total) FROM orders)`));
  console.log("avg product price:", await one(`SELECT ROUND(AVG(price),4) v FROM products`));
  console.log("products above avg price:", await one(`SELECT COUNT(*) n FROM products WHERE price > (SELECT AVG(price) FROM products)`));
  console.log("products below avg price:", await one(`SELECT COUNT(*) n FROM products WHERE price < (SELECT AVG(price) FROM products)`));
  console.log("max product price:", await one(`SELECT MAX(price) v FROM products`));
  console.log("avg supplier rating:", await one(`SELECT ROUND(AVG(rating),4) v FROM suppliers`));
  console.log("suppliers above avg rating:", await one(`SELECT COUNT(*) n FROM suppliers WHERE rating > (SELECT AVG(rating) FROM suppliers)`));
  console.log("suppliers below avg rating:", await one(`SELECT COUNT(*) n FROM suppliers WHERE rating < (SELECT AVG(rating) FROM suppliers)`));
  console.log("scalar in SELECT: customer + order count (first 6):", await q(`SELECT name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n FROM customers c ORDER BY c.id LIMIT 6`));
  console.log("scalar multi-row error probe:", await q(`SELECT id FROM orders WHERE total = (SELECT total FROM orders) LIMIT 1`).catch((e) => String(e).slice(0, 140)));
  console.log("scalar empty → NULL (customer w/o orders):", await q(`SELECT c.name, (SELECT SUM(o.total) FROM orders o WHERE o.customer_id = c.id) AS spend FROM customers c WHERE c.id NOT IN (SELECT customer_id FROM orders)`));
  console.log("overall customer count scalar:", await one(`SELECT (SELECT COUNT(*) FROM customers) customers, (SELECT COUNT(*) FROM products) products, (SELECT COUNT(*) FROM orders) orders, (SELECT COUNT(*) FROM suppliers) suppliers`));
  console.log("max total order (scalar in WHERE equality):", await q(`SELECT id, customer_id, total FROM orders WHERE total = (SELECT MAX(total) FROM orders)`));
  console.log("min rating suppliers:", await q(`SELECT name, rating FROM suppliers WHERE rating = (SELECT MIN(rating) FROM suppliers)`));
  console.log("max rating suppliers:", await q(`SELECT name, rating FROM suppliers WHERE rating = (SELECT MAX(rating) FROM suppliers)`));
  console.log("pending above avg total:", await one(`SELECT COUNT(*) n FROM orders WHERE status = 'pending' AND total > (SELECT AVG(total) FROM orders WHERE status = 'pending')`));
  console.log("pending avg total:", await one(`SELECT ROUND(AVG(total),2) v FROM orders WHERE status = 'pending'`));
  console.log("delivered avg total:", await one(`SELECT ROUND(AVG(total),2) v FROM orders WHERE status = 'delivered'`));
  console.log("delivered above own avg:", await one(`SELECT COUNT(*) n FROM orders WHERE status = 'delivered' AND total > (SELECT AVG(total) FROM orders WHERE status = 'delivered')`));

  console.log("\n== EXISTS ==");
  console.log("EXISTS customers with orders:", await one(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`));
  console.log("NOT EXISTS customers with no orders:", await one(`SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`));
  console.log("no-order names (NOT EXISTS):", await q(`SELECT name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) ORDER BY name`));
  console.log("uncorrelated EXISTS (all rows pass):", await one(`SELECT COUNT(*) n FROM customers WHERE EXISTS (SELECT 1 FROM suppliers)`));
  console.log("EXISTS SELECT * vs SELECT 1:", await one(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT * FROM orders o WHERE o.customer_id = c.id)`));
  console.log("products never ordered (NOT EXISTS):", await q(`SELECT name FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id) ORDER BY name`));
  console.log("products ordered (EXISTS):", await one(`SELECT COUNT(*) n FROM products p WHERE EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id)`));
  console.log("suppliers with sold products (EXISTS):", await one(`SELECT COUNT(*) n FROM suppliers s WHERE EXISTS (SELECT 1 FROM products p INNER JOIN order_items oi ON oi.product_id = p.id WHERE p.supplier_id = s.id)`));
  console.log("suppliers without sold products (NOT EXISTS):", await q(`SELECT name FROM suppliers s WHERE NOT EXISTS (SELECT 1 FROM products p INNER JOIN order_items oi ON oi.product_id = p.id WHERE p.supplier_id = s.id) ORDER BY name`));
  console.log("customers with delivered orders (EXISTS):", await one(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')`));
  console.log("customers with pending orders (EXISTS):", await one(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending')`));
  console.log("customers with cancelled orders:", await one(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')`));
  console.log("customers with shipped orders:", await one(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped')`));
  console.log("categories never sold (NOT EXISTS):", await q(`SELECT DISTINCT category FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items oi INNER JOIN products p2 ON p2.id = oi.product_id WHERE p2.category = p.category) ORDER BY category`));
  console.log("customers with BOTH delivered and pending (double EXISTS):", await q(`SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'pending') ORDER BY name`));
  console.log("count of double-EXISTS customers:", await one(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'pending')`));

  console.log("\n== correlated subqueries ==");
  console.log("per-customer avg order vs their max (top5 by avg):", await q(`SELECT c.name, ROUND((SELECT AVG(total) FROM orders o WHERE o.customer_id = c.id),2) avg_t, ROUND((SELECT MAX(total) FROM orders o WHERE o.customer_id = c.id),2) max_t FROM customers c WHERE c.id IN (SELECT customer_id FROM orders) ORDER BY avg_t DESC LIMIT 5`));
  console.log("orders above their customer's own average (correlated):", await one(`SELECT COUNT(*) n FROM orders o WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`));
  console.log("products above their category average:", await one(`SELECT COUNT(*) n FROM products p WHERE p.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category = p.category)`));
  console.log("products above category avg (names+prices):", await q(`SELECT p.name, p.price, p.category, ROUND((SELECT AVG(p2.price) FROM products p2 WHERE p2.category = p.category),2) cat_avg FROM products p WHERE p.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category = p.category) ORDER BY p.price DESC LIMIT 8`));
  console.log("customers whose total spend > overall avg customer spend:", await one(`SELECT ROUND(AVG(spend),2) avg_spend, COUNT(*) above FROM (SELECT c.id, SUM(o.total) spend FROM customers c INNER JOIN orders o ON o.customer_id = c.id GROUP BY c.id)`));
  console.log("customer order counts distribution:", await q(`SELECT n, COUNT(*) customers FROM (SELECT c.id, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) n FROM customers c) GROUP BY n ORDER BY n`));
  console.log("customers with > 6 orders (correlated HAVING-style):", await q(`SELECT name FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) > 6 ORDER BY name`));
  console.log("customers with >= 6 orders:", await one(`SELECT COUNT(*) n FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) >= 6`));
  console.log("second-highest total via correlated count:", await q(`SELECT DISTINCT total FROM orders o WHERE (SELECT COUNT(DISTINCT o2.total) FROM orders o2 WHERE o2.total > o.total) = 1 ORDER BY total DESC LIMIT 3`));
  console.log("each customer's latest order date (correlated max):", await q(`SELECT c.name, (SELECT MAX(o.created_at) FROM orders o WHERE o.customer_id = c.id) latest FROM customers c WHERE c.id IN (SELECT customer_id FROM orders) ORDER BY latest DESC LIMIT 6`));
  console.log("orders in 2024:", await one(`SELECT COUNT(*) n FROM orders WHERE strftime('%Y', created_at) = '2024'`));
  console.log("orders in 2025:", await one(`SELECT COUNT(*) n FROM orders WHERE strftime('%Y', created_at) = '2025'`));
  console.log("created_at range:", await one(`SELECT MIN(created_at) lo, MAX(created_at) hi FROM orders`));

  console.log("\n== derived tables ==");
  console.log("per-customer spend derived joined back (top5):", await q(`SELECT c.name, d.spend FROM customers c INNER JOIN (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) d ON d.customer_id = c.id ORDER BY d.spend DESC LIMIT 5`));
  console.log("derived without alias error probe:", await q(`SELECT * FROM (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id) WHERE s > 2000 LIMIT 3`).catch((e) => String(e).slice(0, 140)));
  console.log("customers whose derived spend > 2000:", await q(`SELECT c.name, d.spend FROM customers c INNER JOIN (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) d ON d.customer_id = c.id WHERE d.spend > 2000 ORDER BY d.spend DESC`));
  console.log("count spend > 2000:", await one(`SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) WHERE spend > 2000`));
  console.log("per-category avg price derived:", await q(`SELECT d.category, ROUND(d.avg_price,2) avg_price, COUNT(p.id) n_products FROM (SELECT category, AVG(price) AS avg_price FROM products GROUP BY category) d INNER JOIN products p ON p.category = d.category GROUP BY d.category ORDER BY avg_price DESC`));
  console.log("two derived tables joined:", await q(`SELECT a.region, a.customers, COALESCE(b.revenue, 0) revenue FROM (SELECT region, COUNT(*) customers FROM customers GROUP BY region) a LEFT JOIN (SELECT c.region, SUM(o.total) revenue FROM orders o INNER JOIN customers c ON o.customer_id = c.id GROUP BY c.region) b ON b.region = a.region ORDER BY a.region`));
  console.log("derived order counts bucketed:", await q(`SELECT CASE WHEN n >= 8 THEN 'heavy' WHEN n >= 5 THEN 'steady' ELSE 'light' END bucket, COUNT(*) customers FROM (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) GROUP BY bucket ORDER BY bucket`));
  console.log("order count distribution for buckets:", await q(`SELECT MIN(n) lo, MAX(n) hi FROM (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id)`));
  console.log("avg line items per order (derived):", await one(`SELECT ROUND(AVG(n),4) v FROM (SELECT order_id, COUNT(*) n FROM order_items GROUP BY order_id)`));
  console.log("orders with most line items:", await q(`SELECT order_id, n FROM (SELECT order_id, COUNT(*) n FROM order_items GROUP BY order_id) ORDER BY n DESC LIMIT 5`));

  console.log("\n== WITH / WITH RECURSIVE ==");
  console.log("simple CTE customer spend (top3):", await q(`WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id) SELECT c.name, s.s FROM customers c INNER JOIN spend s ON s.customer_id = c.id ORDER BY s.s DESC LIMIT 3`));
  console.log("counter 1..10:", await q(`WITH RECURSIVE cnt(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM cnt WHERE x < 10) SELECT COUNT(*) n, MAX(x) mx FROM cnt`));
  console.log("sum 1..100:", await q(`WITH RECURSIVE cnt(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM cnt WHERE x < 100) SELECT SUM(x) s, COUNT(*) n FROM cnt`));
  console.log("evens below 20:", await q(`WITH RECURSIVE ev(x) AS (SELECT 2 UNION ALL SELECT x + 2 FROM ev WHERE x < 18) SELECT GROUP_CONCAT(x) vals FROM ev`));
  console.log("doubling until >= 100:", await q(`WITH RECURSIVE dbl(x) AS (SELECT 1 UNION ALL SELECT x * 2 FROM dbl WHERE x * 2 < 100) SELECT GROUP_CONCAT(x) vals FROM dbl`));
  console.log("UNION dedupe terminates walk:", await q(`WITH RECURSIVE w(x) AS (SELECT 1 UNION SELECT (x + 1) % 5 FROM w) SELECT GROUP_CONCAT(x) vals FROM w`));
  console.log("LIMIT stops recursion early (bare select, no aggregate):", await q(`WITH RECURSIVE cnt(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM cnt) SELECT x FROM cnt LIMIT 5`));
  console.log("date spine over order range:", await q(`WITH RECURSIVE spine(d) AS (SELECT (SELECT MIN(date(created_at)) FROM orders) UNION ALL SELECT date(d, '+1 day') FROM spine WHERE d < (SELECT MAX(date(created_at)) FROM orders)) SELECT COUNT(*) days, MIN(d) lo, MAX(d) hi FROM spine`));
  console.log("min/max order dates:", await one(`SELECT date(MIN(created_at)) lo, date(MAX(created_at)) hi FROM orders`));
  console.log("CTE chain (two CTEs):", await q(`WITH eu AS (SELECT id, name FROM customers WHERE region = 'EU'), eu_orders AS (SELECT o.id, o.total, o.customer_id FROM orders o INNER JOIN eu ON eu.id = o.customer_id) SELECT COUNT(*) n, ROUND(SUM(total),2) revenue FROM eu_orders`));
  console.log("CTE + JOIN back to base:", await q(`WITH per_order AS (SELECT order_id, SUM(unit_price * quantity) AS line_sum FROM order_items GROUP BY order_id) SELECT COUNT(*) n FROM per_order po INNER JOIN orders o ON o.id = po.order_id WHERE po.line_sum > 1000`));
  console.log("orders whose line sum > 1000:", await q(`SELECT order_id, ROUND(SUM(unit_price * quantity),2) ls FROM order_items GROUP BY order_id HAVING SUM(unit_price * quantity) > 1000 ORDER BY ls DESC`));
  console.log("recursive month spine:", await q(`WITH RECURSIVE months(m) AS (SELECT '2024-01' UNION ALL SELECT strftime('%Y-%m', date(m || '-01', '+1 month')) FROM months WHERE m < '2025-06') SELECT COUNT(*) n FROM months`));
  console.log("status list via recursive concat:", await q(`WITH RECURSIVE st(i, txt) AS (SELECT 1, 'a' UNION ALL SELECT i + 1, txt FROM st WHERE i < 3) SELECT * FROM st`));

  console.log("\n== decoy ammo ==");
  console.log("avg line total per order:", await one(`SELECT ROUND(AVG(total),2) v FROM orders`));
  console.log(">= vs > avg products (boundary):", await one(`SELECT COUNT(*) n FROM products WHERE price >= (SELECT AVG(price) FROM products)`));
  console.log("suppliers rating >= avg:", await one(`SELECT COUNT(*) n FROM suppliers WHERE rating >= (SELECT AVG(rating) FROM suppliers)`));
  console.log("ratings list:", await q(`SELECT rating, COUNT(*) n FROM suppliers GROUP BY rating ORDER BY rating`));
  console.log("prices list:", await q(`SELECT price FROM products ORDER BY price`));
  console.log("spend per customer exact:", await q(`SELECT c.name, ROUND(SUM(o.total),2) spend FROM customers c INNER JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY spend DESC`));
  console.log("order-count per customer exact:", await q(`SELECT c.name, COUNT(o.id) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY n DESC, c.name`));
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
