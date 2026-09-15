// Wave-6 probes: q5 derived / q6 CTE / q7 recursive / q8 capstone figures.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();

// q5 derived shapes
console.log("V1 status stage >7:", q(`SELECT COUNT(*) n FROM (SELECT status, COUNT(*) n FROM orders GROUP BY status) WHERE n > 7`));
console.log("V2 status stage =7:", q(`SELECT COUNT(*) n FROM (SELECT status, COUNT(*) n FROM orders GROUP BY status) WHERE n = 7`));
console.log("V3 region spend stage:", q(`SELECT region, ROUND(SUM(t),2) s FROM (SELECT c.region region, o.total t FROM customers c JOIN orders o ON o.customer_id=c.id) GROUP BY region ORDER BY s DESC`));
console.log("V4 month stage count:", q(`SELECT COUNT(*) n FROM (SELECT strftime('%Y-%m', created_at) m, COUNT(*) n FROM orders GROUP BY m)`));
console.log("V5 month stage top:", q(`SELECT m, n FROM (SELECT strftime('%Y-%m', created_at) m, COUNT(*) n FROM orders GROUP BY m) ORDER BY n DESC, m LIMIT 1`));
console.log("V6 month stage >10:", q(`SELECT COUNT(*) n FROM (SELECT strftime('%Y-%m', created_at) m, COUNT(*) n FROM orders GROUP BY m) WHERE n > 10`));
console.log("V7 avg-ticket >400:", q(`SELECT COUNT(*) n FROM (SELECT customer_id, AVG(total) a, COUNT(*) c FROM orders GROUP BY customer_id) WHERE a > 400`));
console.log("V8 avg-ticket >400 busy:", q(`SELECT COUNT(*) n FROM (SELECT customer_id, AVG(total) a, COUNT(*) c FROM orders GROUP BY customer_id) WHERE a > 400 AND c > 1`));
console.log("V9 invoice-sum stage >10000:", q(`SELECT COUNT(*) n FROM (SELECT customer_id, SUM(amount_cents) s FROM invoices GROUP BY customer_id) WHERE s > 1000000`));
console.log("V10 invoice-sum top:", q(`SELECT customer_id, s FROM (SELECT customer_id, SUM(amount_cents) s FROM invoices GROUP BY customer_id) ORDER BY s DESC LIMIT 1`));
console.log("V11 vendor-avg stage >400:", q(`SELECT COUNT(*) n FROM (SELECT vendor, AVG(amount_cents) a FROM expenses GROUP BY vendor) WHERE a > 40000`));
console.log("V12 product-stage per supplier max:", q(`SELECT COUNT(*) n FROM (SELECT supplier_id, MAX(price) mx FROM products GROUP BY supplier_id) WHERE mx > 100`));
console.log("V13 category basket stage min:", q(`SELECT category, n FROM (SELECT p.category category, COUNT(DISTINCT o.id) n FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN orders o ON o.id=oi.order_id GROUP BY p.category) ORDER BY n ASC LIMIT 1`));
console.log("V14 two-deep region gate EU:", q(`SELECT ROUND(s,2) v FROM (SELECT region, SUM(t) s FROM (SELECT c.region region, o.total t FROM customers c JOIN orders o ON o.customer_id=c.id WHERE o.status='shipped') GROUP BY region) WHERE region='EU'`));
console.log("V15 stage-with-having:", q(`SELECT COUNT(*) n FROM (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id HAVING COUNT(*) > 5)`));

// q6 CTE shapes
console.log("W1 statuses >20 via CTE:", q(`WITH s AS (SELECT status, COUNT(*) n FROM orders GROUP BY status) SELECT COUNT(*) n FROM s WHERE n > 20`));
console.log("W2 top month via CTE:", q(`WITH m AS (SELECT strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY mo) SELECT mo, n FROM m ORDER BY n DESC, mo LIMIT 1`));
console.log("W3 chain above-avg spenders:", q(`WITH t AS (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id), a AS (SELECT AVG(s) v FROM t) SELECT COUNT(*) n FROM t, a WHERE s > v`));
console.log("W4 twice-referenced vip:", q(`WITH v AS (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id HAVING SUM(total) > 1000) SELECT (SELECT COUNT(*) FROM v) + (SELECT SUM(s) FROM v) n`));
console.log("W5 region podium via CTE:", q(`WITH r AS (SELECT c.region region, SUM(o.total) s FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.region) SELECT region, ROUND(s,2) v FROM r ORDER BY s DESC LIMIT 1`));
console.log("W6 shadow-error:", q(`SELECT COUNT(*) n FROM (WITH orders AS (SELECT customer_id FROM invoices) SELECT * FROM orders)`));

// q7 recursive shapes
console.log("R1 countdown 20 step 3:", q(`WITH RECURSIVE c(n) AS (SELECT 20 UNION ALL SELECT n-3 FROM c WHERE n > 3) SELECT COUNT(*) n FROM c`));
console.log("R2 doubling <100:", q(`WITH RECURSIVE d(n) AS (SELECT 1 UNION ALL SELECT n*2 FROM d WHERE n < 100) SELECT COUNT(*) n FROM d`));
console.log("R3 halving 5000 to 1:", q(`WITH RECURSIVE h(n) AS (SELECT 5000 UNION ALL SELECT n/2 FROM h WHERE n > 1) SELECT COUNT(*) n FROM h`));
console.log("R4 week ladder Q1:", q(`WITH RECURSIVE w(d) AS (SELECT '2024-01-01' UNION ALL SELECT date(d,'+7 day') FROM w WHERE d < '2024-03-01') SELECT COUNT(*) n FROM w`));
console.log("R5 month ticks 13:", q(`WITH RECURSIVE m(d) AS (SELECT '2024-01-15' UNION ALL SELECT date(d,'+1 month') FROM m WHERE d < '2025-01-15') SELECT COUNT(*) n FROM m`));
console.log("R6 triangle 10:", q(`WITH RECURSIVE t(n,s) AS (SELECT 1,1 UNION ALL SELECT n+1, s+n+1 FROM t WHERE n < 10) SELECT s FROM t ORDER BY n DESC LIMIT 1`));
console.log("R7 overshoot 512:", q(`WITH RECURSIVE o(n) AS (SELECT 1 UNION ALL SELECT n*2 FROM o WHERE n <= 500) SELECT MAX(n) m FROM o`));
console.log("R8 countdown rungs >8:", q(`WITH RECURSIVE c(n) AS (SELECT 30 UNION ALL SELECT n-4 FROM c WHERE n > 4) SELECT COUNT(*) n FROM c`));
console.log("R9 year ticks:", q(`WITH RECURSIVE y(d) AS (SELECT '2024-01-01' UNION ALL SELECT date(d,'+1 year') FROM y WHERE d < '2030-01-01') SELECT COUNT(*) n FROM y`));
console.log("R10 halving bound 100:", q(`WITH RECURSIVE h(n) AS (SELECT 900 UNION ALL SELECT n/3 FROM h WHERE n > 100) SELECT COUNT(*) n FROM h`));

// q8 capstone shapes
console.log("Z1 paid-billing podium top:", q(`SELECT c.name name, ROUND(SUM(i.amount_cents)/100.0,2) v FROM customers c JOIN invoices i ON i.customer_id=c.id WHERE i.status='paid' GROUP BY c.name ORDER BY SUM(i.amount_cents) DESC LIMIT 1`));
console.log("Z2 payments per invoice stage:", q(`SELECT COUNT(*) n FROM (SELECT invoice_id, COUNT(*) n FROM payments GROUP BY invoice_id) WHERE n > 1`));
console.log("Z3 whale-in-cohort Farid check:", q(`SELECT COUNT(*) n FROM customers c WHERE (SELECT SUM(total) FROM orders WHERE customer_id=c.id) > 1000 AND c.region='APAC'`));
console.log("Z4 expense-vs-invoice overlap vendors:", q(`SELECT COUNT(*) n FROM expenses WHERE amount_cents > 2*(SELECT AVG(amount_cents) FROM expenses)`));
console.log("Z5 US delivered sample:", q(`SELECT COUNT(*) n FROM customers c JOIN orders o ON o.customer_id=c.id WHERE c.region='US' AND o.status='delivered'`));
