/// <reference types="bun-types" />
/**
 * Wave-4 receipt batch (cs-1051–1100, deepening q5 derived / q6 CTE / q7 recursive / q8 capstone).
 * Fresh angles only vs wave-2 W01–W63 + E/F/G/H edges.
 * Run: bun scripts/m4-cases-w4-facts.ts 2>&1 | tee scripts/m4-cases-w4-out.txt
 */
import { Database } from "bun:sqlite";

const db = new Database("db/custom.db", { readonly: true });

const probes: Array<[string, string]> = [
  // q5 derived fresh
  ["W401 region of each VIP (>2000 spend)", `SELECT c.region, COUNT(*) n FROM customers c
WHERE c.id IN (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) > 2000)
GROUP BY c.region ORDER BY n DESC`],
  ["W402 per-region top customer spend (derived)", `SELECT c.region, MAX(s.spend) top FROM (
  SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id
) s JOIN customers c ON c.id = s.customer_id
GROUP BY c.region ORDER BY top DESC`],
  ["W403 customers with avg ticket > 400 (derived)", `SELECT COUNT(*) n FROM (
  SELECT customer_id, AVG(total) t FROM orders GROUP BY customer_id
) s WHERE t > 400`],
  ["W404 avg-ticket > 400 names", `SELECT c.name, ROUND(s.t,2) t FROM (
  SELECT customer_id, AVG(total) t FROM orders GROUP BY customer_id
) s JOIN customers c ON c.id = s.customer_id WHERE s.t > 400 ORDER BY s.t DESC`],
  ["W405 category basket stage > 20", `SELECT COUNT(*) n FROM (
  SELECT p.category, COUNT(DISTINCT oi.order_id) baskets
  FROM order_items oi JOIN products p ON p.id = oi.product_id
  GROUP BY p.category
) t WHERE baskets > 20`],
  ["W406 category basket stage full", `SELECT p.category, COUNT(DISTINCT oi.order_id) baskets
  FROM order_items oi JOIN products p ON p.id = oi.product_id
  GROUP BY p.category ORDER BY baskets DESC`],
  ["W407 vendor totals top2", `SELECT vendor, ROUND(SUM(amount_cents)/100.0,2) v FROM expenses GROUP BY vendor ORDER BY v DESC LIMIT 2`],
  ["W408 sum of floors (per-customer MIN join-back)", `SELECT ROUND(SUM(o.total),2) v FROM orders o JOIN (
  SELECT customer_id, MIN(total) mn FROM orders GROUP BY customer_id
) f ON f.customer_id = o.customer_id AND o.total = f.mn`],
  ["W409 two-deep derived: regions > 10000", `SELECT region, ROUND(region_total,2) FROM (
  SELECT c.region region, SUM(s.spend) region_total FROM (
    SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id
  ) s JOIN customers c ON c.id = s.customer_id
  GROUP BY c.region
) t WHERE region_total > 10000 ORDER BY region_total DESC`],
  ["W410 invoice-count stage max", `SELECT MAX(bills) mx, COUNT(*) holders FROM (
  SELECT customer_id, COUNT(*) bills FROM invoices GROUP BY customer_id
)`],
  ["W411 order-count stage: customers with >= 20 orders", `SELECT COUNT(*) n FROM (
  SELECT customer_id, COUNT(*) n_orders FROM orders GROUP BY customer_id
) s WHERE n_orders >= 20`],
  ["W412 lines-per-product stage avg", `SELECT ROUND(AVG(n),2) a, MAX(n) mx FROM (
  SELECT product_id, COUNT(*) n FROM order_items GROUP BY product_id
)`],

  // q6 CTE fresh
  ["W413 spend BETWEEN 1000 and 2000", `WITH s AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id)
SELECT COUNT(*) n FROM s WHERE spend BETWEEN 1000 AND 2000`],
  ["W414 big-orders status mix (CTE + GROUP BY)", `WITH big AS (SELECT * FROM orders WHERE total > (SELECT AVG(total) FROM orders))
SELECT status, COUNT(*) n FROM big GROUP BY status ORDER BY n DESC`],
  ["W415 products shadow CTE > 100", `WITH products AS (SELECT * FROM products WHERE price > 100)
SELECT COUNT(*) n FROM products`],
  ["W416 CTE chain > 2500", `WITH t1 AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id),
t2 AS (SELECT customer_id FROM t1 WHERE spend > 2500)
SELECT COUNT(*) n FROM t2`],
  ["W417 CTE + NOT IN complement of vip", `WITH vip AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id HAVING SUM(total) > 2177.08)
SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM vip)`],
  ["W418 two CTEs joined by region", `WITH s AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id),
r AS (SELECT id, region FROM customers)
SELECT r.region, COUNT(*) n FROM s JOIN r ON r.id = s.customer_id WHERE s.spend > 2000 GROUP BY r.region ORDER BY n DESC`],
  ["W419 CTE pending orders totals", `WITH p AS (SELECT total FROM orders WHERE status = 'pending')
SELECT ROUND(SUM(total),2) v, COUNT(*) n FROM p`],
  ["W420 CTE avg per-customer spend", `WITH s AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id)
SELECT ROUND(AVG(spend),2) a, ROUND(MAX(spend),2) mx FROM s`],

  // q7 recursive fresh
  ["W421 countdown 10 step1", `WITH RECURSIVE c(n) AS (SELECT 10 UNION ALL SELECT n - 1 FROM c WHERE n > 1)
SELECT COUNT(*) n FROM c`],
  ["W422 countdown 30 step3", `WITH RECURSIVE c(n) AS (SELECT 30 UNION ALL SELECT n - 3 FROM c WHERE n > 1)
SELECT COUNT(*) n FROM c`],
  ["W423 halving from 100", `WITH RECURSIVE h(n) AS (SELECT 100 UNION ALL SELECT n / 2 FROM h WHERE n >= 1)
SELECT COUNT(*) n FROM h`],
  ["W424 halving strict guard > 2", `WITH RECURSIVE h(n) AS (SELECT 100 UNION ALL SELECT n / 2 FROM h WHERE n > 2)
SELECT COUNT(*) n FROM h`],
  ["W425 odd counter 1..9 step2", `WITH RECURSIVE o(n) AS (SELECT 1 UNION ALL SELECT n + 2 FROM o WHERE n < 9)
SELECT COUNT(*) n FROM o`],
  ["W426 pow3 bound 100", `WITH RECURSIVE p(n) AS (SELECT 1 UNION ALL SELECT n * 3 FROM p WHERE n < 100)
SELECT COUNT(*) n FROM p`],
  ["W427 pow2 from 3 bound 200", `WITH RECURSIVE p(n) AS (SELECT 3 UNION ALL SELECT n * 2 FROM p WHERE n < 200)
SELECT COUNT(*) n FROM p`],
  ["W428 running-sum accumulator 1..10", `WITH RECURSIVE s(n, total) AS (SELECT 1, 1 UNION ALL SELECT n + 1, total + n FROM s WHERE n < 10)
SELECT MAX(total) v, COUNT(*) n FROM s`],
  ["W429 invoice date span", `SELECT MIN(issued_on) mn, MAX(issued_on) mx FROM invoices`],
  ["W430 invoice date ladder days", `WITH RECURSIVE d(day) AS (
  SELECT (SELECT MIN(issued_on) FROM invoices)
  UNION ALL SELECT date(day, '+1 day') FROM d WHERE day < (SELECT MAX(issued_on) FROM invoices)
) SELECT COUNT(*) n FROM d`],
  ["W431 ladder + products join bound 12", `WITH RECURSIVE nums(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM nums WHERE n < 12)
SELECT COUNT(*) n FROM nums JOIN products ON products.id = nums.n`],
  ["W432 ladder +2 over products bound 12", `WITH RECURSIVE nums(n) AS (SELECT 1 UNION ALL SELECT n + 2 FROM nums WHERE n < 12)
SELECT COUNT(*) n FROM nums JOIN products ON products.id = nums.n`],
  ["W433 order dates in final 9 months ladder", `WITH RECURSIVE d(day) AS (
  SELECT date((SELECT MAX(created_at) FROM orders), '-9 month')
  UNION ALL SELECT date(day, '+1 day') FROM d WHERE day < (SELECT MAX(created_at) FROM orders)
) SELECT COUNT(*) n FROM d WHERE day IN (SELECT created_at FROM orders)`],
  ["W434 ladder +7 over invoices paid-on? span", `WITH RECURSIVE d(day) AS (
  SELECT (SELECT MIN(issued_on) FROM invoices)
  UNION ALL SELECT date(day, '+7 day') FROM d WHERE day < (SELECT MAX(issued_on) FROM invoices)
) SELECT COUNT(*) n FROM d`],
  ["W435 countdown step -2 from 40", `WITH RECURSIVE c(n) AS (SELECT 40 UNION ALL SELECT n - 2 FROM c WHERE n > 1)
SELECT COUNT(*) n FROM c`],

  // q8 capstone fresh
  ["W436 vip count via CTE HAVING 2177.08", `WITH vip AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id HAVING SUM(total) > 2177.08)
SELECT COUNT(*) n FROM vip`],
  ["W437 US-region orders count", `SELECT COUNT(*) n FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'US')`],
  ["W438 customers with any above-bar order", `SELECT COUNT(*) n FROM customers WHERE id IN (
  SELECT customer_id FROM orders WHERE total > (SELECT AVG(total) FROM orders))`],
  ["W439 spenders > 3000 names", `WITH s AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id)
SELECT c.name FROM customers c WHERE EXISTS (
  SELECT 1 FROM s WHERE s.customer_id = c.id AND s.spend > 3000
) ORDER BY c.name`],
  ["W440 crowns via CTE row-value", `WITH crowns AS (SELECT customer_id, MAX(total) mt FROM orders GROUP BY customer_id)
SELECT COUNT(*) n FROM orders WHERE (customer_id, total) IN (SELECT customer_id, mt FROM crowns)`],
  ["W441 top billed customers", `SELECT c.name, ROUND(t.billed/100.0,2) billed FROM (
  SELECT customer_id, SUM(amount_cents) billed FROM invoices GROUP BY customer_id
) t JOIN customers c ON c.id = t.customer_id
WHERE t.billed > 100000 ORDER BY t.billed DESC LIMIT 3`],
  ["W442 ledger total billed", `SELECT ROUND(SUM(amount_cents)/100.0,2) v FROM invoices`],
  ["W443 big-orders status mix > delivered bar 299.44", `WITH big AS (SELECT * FROM orders WHERE total > (SELECT AVG(total) FROM orders WHERE status = 'delivered'))
SELECT COUNT(*) n FROM big`],
  ["W444 expense categories stage + outer WHERE", `WITH cats AS (SELECT category, SUM(amount_cents)/100.0 total FROM expenses GROUP BY category)
SELECT COUNT(*) n FROM cats WHERE total > 2000`],
  ["W445 EU spend via stage", `WITH s AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id)
SELECT ROUND(SUM(spend),2) v FROM s JOIN customers c ON c.id = s.customer_id WHERE c.region = 'EU'`],
];

let i = 0;
for (const [label, sql] of probes) {
  i++;
  try {
    const rows = db.query(sql).all();
    console.log(`${label}: ${JSON.stringify(rows)}`);
  } catch (e) {
    console.log(`${label}: ERROR ${e instanceof Error ? e.message : String(e)}`);
  }
}
console.log(`--- ${probes.length} probes done`);
db.close();
