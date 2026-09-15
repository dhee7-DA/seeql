/// <reference types="bun-types" />
/**
 * M4 case receipts — wave 2 (q5 derived / q6 CTE / q7 recursive / q8 capstone).
 * Every figure quoted in a wave-2 case brief/why/walkthrough is probed here so
 * the prose stays honest; case-audit.ts re-verifies slot figures mechanically.
 * Complements wave-1 receipts (m4-cases-facts.ts C01–C100) and the drill-bank
 * receipts (m4-facts-out.txt P01–P56).
 * Run: bun scripts/m4-cases-w2-facts.ts | tee scripts/m4-cases-w2-out.txt
 */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m4casesw2.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

let n = 0;
function probe(label: string, sql: string) {
  n++;
  try {
    const rows = db.query(sql).all();
    console.log(`W${String(n).padStart(2, "0")} ${label}: ${JSON.stringify(rows)}`);
  } catch (e) {
    console.log(`W${String(n).padStart(2, "0")} ${label}: ERROR ${e instanceof Error ? e.message : e}`);
  }
}

// --- q5 derived-table shapes -------------------------------------------------
probe("stage rowcount per-customer", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) s");
probe("stage joined top5", "SELECT c.name, ROUND(s.spend, 2) spend FROM customers c JOIN (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) s ON s.customer_id = c.id ORDER BY s.spend DESC LIMIT 5");
probe("stage filtered >2000", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) s WHERE s.spend > 2000");
probe("stage filtered >3000", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) s WHERE s.spend > 3000");
probe("stage filtered >4500 names", "SELECT c.name FROM customers c JOIN (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) s ON s.customer_id = c.id WHERE s.spend > 4500 ORDER BY c.name");
probe("outer agg over stage", "SELECT ROUND(AVG(spend), 2) avg_spend, ROUND(MIN(spend), 2) min_spend, ROUND(MAX(spend), 2) max_spend FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) s");
probe("derived top3 orders", "SELECT id, customer_id, total FROM (SELECT * FROM orders ORDER BY total DESC LIMIT 3) t ORDER BY t.id");
probe("derived alias-less parses", "SELECT COUNT(*) FROM (SELECT SUM(total) FROM orders)");
probe("derived col-name-1", "SELECT SUM(total) FROM orders LIMIT 1");
probe("pushdown equivalence", "SELECT COUNT(*) n FROM customers WHERE (SELECT SUM(total) FROM orders WHERE customer_id = customers.id) > 1000");
probe("derived equivalence >1000", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) s WHERE s.spend > 1000");
probe("derived below store-bar count", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) s WHERE s.spend < 338.19");
probe("derived below bar names", "SELECT c.name, ROUND(s.spend,2) spend FROM customers c JOIN (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) s ON s.customer_id = c.id WHERE s.spend < 338.19 ORDER BY s.spend");
probe("products cat-avg derived join", "SELECT p.name, p.price, ROUND(ca.avg_price, 2) cat_avg FROM products p JOIN (SELECT category, AVG(price) avg_price FROM products GROUP BY category) ca ON ca.category = p.category WHERE p.price > ca.avg_price ORDER BY p.price DESC");
probe("products above cat-avg count", "SELECT COUNT(*) n FROM products p JOIN (SELECT category, AVG(price) avg_price FROM products GROUP BY category) ca ON ca.category = p.category WHERE p.price > ca.avg_price");
probe("invoices paid stage", "SELECT c.name, ROUND(s.paid, 2) paid FROM customers c JOIN (SELECT customer_id, SUM(amount_cents)/100.0 paid FROM invoices WHERE status = 'paid' GROUP BY customer_id) s ON s.customer_id = c.id ORDER BY s.paid DESC LIMIT 4");
probe("expenses cat stage", "SELECT category, ROUND(total, 2) FROM (SELECT category, SUM(amount_cents)/100.0 total FROM expenses GROUP BY category) e ORDER BY total DESC");
probe("suppliers region-avg derived", "SELECT s.name, s.rating, ROUND(ra.region_avg, 2) region_avg FROM suppliers s JOIN (SELECT region, AVG(rating) region_avg FROM suppliers GROUP BY region) ra ON ra.region = s.region WHERE s.rating > ra.region_avg ORDER BY s.rating DESC");
probe("derived inner-ref-alias error", "SELECT * FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) s WHERE s.spend > (SELECT AVG(s2.spend) FROM s2)");
probe("derived error no-such-table", "SELECT x.spend FROM (SELECT SUM(total) spend FROM orders) y");

// --- q6 CTE shapes -----------------------------------------------------------
probe("CTE twice over_1000/2000", "WITH s AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) SELECT (SELECT COUNT(*) FROM s WHERE spend > 1000) over_1000, (SELECT COUNT(*) FROM s WHERE spend > 2000) over_2000");
probe("CTE over2000 names", "WITH s AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) SELECT c.name FROM customers c JOIN s ON s.customer_id = c.id WHERE s.spend > 2000 ORDER BY c.name");
probe("CTE shadow real table", "WITH orders AS (SELECT 1 AS id, 'ghost row' AS status) SELECT status FROM orders");
probe("CTE region chain", "WITH region_spend AS (SELECT c.region, SUM(o.total) spend FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.region) SELECT region, ROUND(spend, 2) FROM region_spend ORDER BY spend DESC");
probe("CTE two-stage vip", "WITH spend AS (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id) SELECT c.name, ROUND(sp.s, 2) s FROM customers c JOIN spend sp ON sp.customer_id = c.id WHERE sp.s > 1000 ORDER BY sp.s DESC");
probe("CTE chain two deep", "WITH totals AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id), avg_bar AS (SELECT AVG(spend) bar FROM totals) SELECT COUNT(*) n FROM totals, avg_bar WHERE spend > bar");
probe("CTE chain bar value", "WITH totals AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id), avg_bar AS (SELECT AVG(spend) bar FROM totals) SELECT ROUND(bar, 2) FROM avg_bar");
probe("CTE above chain-bar names", "WITH totals AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id), avg_bar AS (SELECT AVG(spend) bar FROM totals) SELECT c.name FROM customers c JOIN totals t ON t.customer_id = c.id JOIN avg_bar b ON t.spend > b.bar ORDER BY c.name");
probe("unreferenced CTE legal", "WITH unused AS (SELECT 1 AS x) SELECT COUNT(*) n FROM orders");
probe("CTE single ref", "WITH paid AS (SELECT customer_id FROM invoices WHERE status = 'paid') SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM paid)");
probe("CTE pending club", "WITH club AS (SELECT customer_id FROM orders WHERE status = 'pending') SELECT COUNT(DISTINCT customer_id) n FROM orders WHERE id IN (SELECT rowid FROM club) OR customer_id IN (SELECT customer_id FROM club)");
probe("CTE invoices paid count", "WITH paid AS (SELECT customer_id, SUM(amount_cents)/100.0 amt FROM invoices WHERE status = 'paid' GROUP BY customer_id) SELECT COUNT(*) n FROM paid WHERE amt > 300");
probe("CTE expense travel total", "WITH t AS (SELECT SUM(amount_cents)/100.0 amt FROM expenses WHERE category = 'Travel') SELECT ROUND(amt, 2) FROM t");
probe("CTE trailing comma error", "WITH s AS (SELECT 1 AS x), SELECT COUNT(*) FROM s");
probe("CTE dup name error", "WITH s AS (SELECT 1 AS x), s AS (SELECT 2 AS y) SELECT * FROM s");
probe("CTE forward ref resolves", "WITH a AS (SELECT * FROM b), b AS (SELECT 42 AS v) SELECT v FROM a");
probe("CTE EQP twice-referenced", "EXPLAIN QUERY PLAN WITH s AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) SELECT (SELECT COUNT(*) FROM s WHERE spend > 1000) a, (SELECT COUNT(*) FROM s WHERE spend > 2000) b");

// --- q7 recursive shapes -----------------------------------------------------
probe("recursive counter 1..5", "WITH RECURSIVE cnt(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM cnt WHERE n < 5) SELECT group_concat(n) one_to_five FROM cnt");
probe("recursive counter 1..10", "WITH RECURSIVE cnt(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM cnt WHERE n < 10) SELECT group_concat(n) s FROM cnt");
probe("recursive countdown 5..1", "WITH RECURSIVE cnt(n) AS (SELECT 5 UNION ALL SELECT n - 1 FROM cnt WHERE n > 1) SELECT group_concat(n) s FROM cnt");
probe("recursive pow2 rows", "WITH RECURSIVE p(n) AS (SELECT 1 UNION ALL SELECT n * 2 FROM p WHERE n < 1000) SELECT COUNT(*) rows_n, MAX(n) max_n FROM p");
probe("recursive pow2 list", "WITH RECURSIVE p(n) AS (SELECT 1 UNION ALL SELECT n * 2 FROM p WHERE n < 1000) SELECT group_concat(n) s FROM p");
probe("recursive id ladder", "WITH RECURSIVE ids(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM ids WHERE n < 16) SELECT COUNT(*) n FROM ids WHERE n IN (SELECT id FROM customers)");
probe("recursive date ladder", "WITH RECURSIVE days(d) AS (SELECT date((SELECT MIN(created_at) FROM orders)) UNION ALL SELECT date(d, '+1 day') FROM days WHERE d < date((SELECT MAX(created_at) FROM orders))) SELECT COUNT(*) total_days FROM days");
probe("distinct order dates", "SELECT COUNT(DISTINCT date(created_at)) n FROM orders");
probe("recursive union dedup", "WITH RECURSIVE d(n) AS (SELECT 1 UNION SELECT 1 UNION SELECT n + 1 FROM d WHERE n < 3) SELECT group_concat(n) s FROM d");
probe("recursive no RECURSIVE legal", "WITH cnt(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM cnt WHERE n < 3) SELECT group_concat(n) s FROM cnt");
probe("recursive two refs error", "WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT (SELECT MAX(n) FROM t) + (SELECT COUNT(*) FROM t) FROM t WHERE n < 3) SELECT MAX(n) FROM t");
probe("recursive circular error", "WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT (SELECT n FROM t) FROM t WHERE n < 3) SELECT * FROM t");
probe("recursive infinite arm rows", "WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT n FROM t) SELECT n FROM t LIMIT 5");
probe("recursive col mismatch error", "WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT 2, 3 FROM t WHERE n < 3) SELECT * FROM t");
probe("recursive date ladder over orders", "WITH RECURSIVE days(d) AS (SELECT date((SELECT MIN(created_at) FROM orders)) UNION ALL SELECT date(d, '+1 day') FROM days WHERE d < date((SELECT MAX(created_at) FROM orders))) SELECT COUNT(*) n FROM days WHERE d IN (SELECT DISTINCT created_at FROM orders)");
probe("orders span days", "SELECT COUNT(*) n FROM (SELECT DISTINCT date(created_at) d FROM orders)");

// --- q8 capstone shapes ------------------------------------------------------
probe("two bars", "SELECT ROUND((SELECT AVG(total) FROM orders), 2) avg_order, ROUND((SELECT AVG(spend) FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id)), 2) avg_customer");
probe("vip five via CTE", "WITH spend AS (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id) SELECT c.name FROM customers c JOIN spend ON spend.customer_id = c.id WHERE spend.s > 2000 ORDER BY spend.s DESC");
probe("store totals", "SELECT ROUND(SUM(total), 2) store_total, COUNT(*) order_n FROM orders");
probe("veterans distinct-4", "SELECT c.name FROM customers c WHERE (SELECT COUNT(DISTINCT status) FROM orders WHERE customer_id = c.id) = 4 ORDER BY c.name");
probe("veterans bare-count-4", "SELECT c.name FROM customers c WHERE (SELECT COUNT(*) FROM orders WHERE customer_id = c.id) = 4 ORDER BY c.name");
probe("above-own-avg top4", "SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = c.id)) stellar FROM customers c ORDER BY stellar DESC, c.name LIMIT 4");
probe("above-both-bars orders", "SELECT COUNT(*) n FROM orders o WHERE o.total > (SELECT AVG(total) FROM orders) AND o.customer_id IN (SELECT customer_id FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) s WHERE spend > 2177.08)");
probe("customers above 2x store bar", "SELECT COUNT(*) n FROM customers WHERE (SELECT SUM(total) FROM orders WHERE customer_id = customers.id) > 2 * (SELECT AVG(total) FROM orders)");
probe("biggest single order", "SELECT id, customer_id, ROUND(total, 2) total FROM orders WHERE total = (SELECT MAX(total) FROM orders)");
probe("orderless customers", "SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders WHERE customer_id = c.id)");

rmSync(COPY, { force: true });
console.log(`--- ${n} probes done`);
