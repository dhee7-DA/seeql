// M4 deep-dive probe — engine receipts for L25–L28 + L38 deep blocks.
// Every number quoted in a deep-dive block must appear in this output.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
let n = 0;
function q(label: string, sql: string) {
  n++;
  const rows = db.query(sql).all() as Record<string, unknown>[];
  const flat = rows.length <= 14 ? JSON.stringify(rows) : `(${rows.length} rows)`;
  console.log(`P${String(n).padStart(2, "0")} ${label}: ${flat}`);
}

// ---------- L25: WHERE subqueries ----------
q("L25 avg price", `SELECT ROUND(AVG(price),2) AS avg_price FROM products`);
q("L25 above-avg products", `SELECT COUNT(*) AS n FROM products WHERE price > (SELECT AVG(price) FROM products)`);
q("L25 cancelled orders rows", `SELECT COUNT(*) AS n FROM orders WHERE status='cancelled'`);
q("L25 cancelled distinct customers", `SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE status='cancelled'`);
q("L25 cancelled list raw", `SELECT customer_id FROM orders WHERE status='cancelled'`);
q("L25 cancelled IN names", `SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status='cancelled') ORDER BY name`);
q("L25 NOT IN clean count", `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status='cancelled')`);
q("L25 pending orders x customers", `SELECT COUNT(*) AS orders_n, COUNT(DISTINCT customer_id) AS cust_n FROM orders WHERE status='pending'`);
q("L25 NULL collapse: NOT IN over shipped_at", `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT shipped_at FROM orders)`);
q("L25 shipped_at NULL rows", `SELECT COUNT(*) AS n FROM orders WHERE shipped_at IS NULL`);
q("L25 NULL collapse graded: NOT IN over nullable customer view", `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE customer_id IS NOT NULL AND status='cancelled')`);
q("L25 IN empty set", `SELECT COUNT(*) AS n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status='refunded')`);
q("L25 NOT IN empty set", `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status='refunded')`);
q("L25 scalar multi-row first-row", `SELECT (SELECT customer_id FROM orders WHERE status='pending') AS first_row_silently`);
q("L25 scalar-in-SELECT stamps", `SELECT COUNT(*) AS rows_out, COUNT(DISTINCT (SELECT AVG(price) FROM products)) AS distinct_stamp FROM products`);
q("L25 HAVING scalar: categories above catalog avg", `SELECT category, ROUND(AVG(price),2) AS avg_price FROM products GROUP BY category HAVING AVG(price) > (SELECT AVG(price) FROM products) ORDER BY avg_price DESC`);
q("L25 EQP uncorrelated IN", `EXPLAIN QUERY PLAN SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status='cancelled')`);

// ---------- L26: EXISTS & correlated ----------
q("L26 EXISTS shipped count", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='shipped')`);
q("L26 EXISTS shipped names", `SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='shipped') ORDER BY c.name`);
q("L26 NOT EXISTS count", `SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='shipped')`);
q("L26 EXISTS impossible probe", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='refunded')`);
q("L26 NOT EXISTS impossible probe", `SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='refunded')`);
q("L26 EXISTS select-1-vs-star-vs-null", [
  `SELECT COUNT(*) AS a FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.status='shipped')`,
  `SELECT COUNT(*) AS b FROM customers c WHERE EXISTS (SELECT * FROM orders o WHERE o.customer_id=c.id AND o.status='shipped')`,
  `SELECT COUNT(*) AS c2 FROM customers c WHERE EXISTS (SELECT NULL FROM orders o WHERE o.customer_id=c.id AND o.status='shipped')`,
].join(" UNION ALL "));
q("L26 correlated above-own-avg orders", `SELECT COUNT(*) AS n FROM orders o WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`);
q("L26 correlated vs storewide cross", `SELECT
  SUM(CASE WHEN o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id=o.customer_id) AND o.total > (SELECT AVG(total) FROM orders) THEN 1 ELSE 0 END) AS both_bars,
  SUM(CASE WHEN o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id=o.customer_id) AND o.total <= (SELECT AVG(total) FROM orders) THEN 1 ELSE 0 END) AS own_only,
  SUM(CASE WHEN o.total <= (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id=o.customer_id) AND o.total > (SELECT AVG(total) FROM orders) THEN 1 ELSE 0 END) AS store_only
FROM orders o`);
q("L26 storewide avg order", `SELECT ROUND(AVG(total),2) AS store_avg FROM orders`);
q("L26 per-customer avg sample c1-c4", `SELECT customer_id, COUNT(*) AS n_orders, ROUND(AVG(total),2) AS own_avg FROM orders WHERE customer_id IN (1,2,3,4) GROUP BY customer_id ORDER BY customer_id`);
q("L26 orders above own avg per c1-c4", `SELECT o.customer_id, COUNT(*) AS stellar FROM orders o WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id=o.customer_id) AND o.customer_id IN (1,2,3,4) GROUP BY o.customer_id ORDER BY o.customer_id`);
q("L26 solo-order customers", `SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*)=1)`);
q("L26 solo customers contribute 0 stellar", `SELECT COUNT(*) AS n FROM orders o WHERE (SELECT COUNT(*) FROM orders o3 WHERE o3.customer_id=o.customer_id)=1 AND o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id=o.customer_id)`);
q("L26 EXISTS short-circuit demo: orders per c2", `SELECT COUNT(*) AS c2_orders, SUM(status='shipped') AS shipped_rows FROM orders WHERE customer_id=2`);
q("L26 EQP correlated scalar", `EXPLAIN QUERY PLAN SELECT o.id FROM orders o WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`);

// ---------- L27: derived tables ----------
q("L27 inner stage rows", `SELECT COUNT(*) AS n FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id)`);
q("L27 over-1000 club", `SELECT c.name, ROUND(d.spend,2) AS spend FROM customers c JOIN (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) d ON d.customer_id=c.id WHERE d.spend > 1000 ORDER BY d.spend DESC`);
q("L27 over-1000 count", `SELECT COUNT(*) AS n FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) WHERE spend > 1000`);
q("L27 pushdown same answer", `SELECT COUNT(*) AS n FROM customers c JOIN (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id HAVING SUM(total) > 1000) d ON d.customer_id=c.id`);
q("L27 derived LIMIT top3 orders", `SELECT o.id, c.name, ROUND(o.total,2) AS total FROM (SELECT id, customer_id, total FROM orders ORDER BY total DESC LIMIT 3) o JOIN customers c ON c.id=o.customer_id ORDER BY o.total DESC`);
q("L27 outer aggregates the stage", `SELECT ROUND(AVG(spend),2) AS avg_customer_spend, ROUND(MIN(spend),2) AS min_spend, ROUND(MAX(spend),2) AS max_spend FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id)`);
q("L27 no-alias derived column name", `SELECT * FROM (SELECT 1)`);
q("L27 no-alias real table", `SELECT d.name FROM (SELECT name FROM customers LIMIT 1) d`);
q("L27 EQP uncorrelated derived", `EXPLAIN QUERY PLAN SELECT c.name, d.spend FROM customers c JOIN (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) d ON d.customer_id=c.id`);

// ---------- L28: CTEs ----------
q("L28 region chain", `WITH region_spend AS (SELECT c.region AS region, SUM(o.total) AS spend FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region) SELECT region, ROUND(spend,2) AS spend FROM region_spend ORDER BY spend DESC`);
q("L28 two-stage big spenders", `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id), big AS (SELECT * FROM spend WHERE s > 2000) SELECT c.name, ROUND(b.s,2) AS s FROM big b JOIN customers c ON c.id=b.customer_id ORDER BY b.s DESC`);
q("L28 CTE referenced twice", `WITH s AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) SELECT (SELECT COUNT(*) FROM s WHERE spend > 1000) AS over_1000, (SELECT COUNT(*) FROM s WHERE spend > 2000) AS over_2000`);
q("L28 CTE shadows real table", `WITH customers AS (SELECT 'ghost row' AS name) SELECT name FROM customers`);
q("L28 recursive counter", `WITH RECURSIVE cnt(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM cnt WHERE x < 5) SELECT GROUP_CONCAT(x) AS one_to_five FROM cnt`);
q("L28 CTE single ref vs inline", `WITH s AS (SELECT COUNT(*) AS n FROM orders) SELECT n FROM s`);
q("L28 EQP twice-referenced CTE", `EXPLAIN QUERY PLAN WITH s AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) SELECT (SELECT COUNT(*) FROM s WHERE spend > 1000) AS a, (SELECT COUNT(*) FROM s WHERE spend > 2000) AS b`);

// ---------- L38: VIP case study ----------
q("L38 store totals", `SELECT ROUND(SUM(total),2) AS store_total, COUNT(*) AS order_n FROM orders`);
q("L38 two bars", `SELECT ROUND(AVG(total),2) AS avg_order, (SELECT ROUND(AVG(spend),2) FROM (SELECT SUM(total) AS spend FROM orders GROUP BY customer_id)) AS avg_customer FROM orders`);
q("L38 vips the five", `WITH spends AS (SELECT c.id, c.name, SUM(o.total) AS spend FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id) SELECT name, ROUND(spend,2) AS spend FROM spends WHERE spend > (SELECT AVG(spend) FROM spends) ORDER BY spend DESC`);
q("L38 above-order-avg customers", `SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE total > (SELECT AVG(total) FROM orders)`);
q("L38 veterans distinct=4", `SELECT c.name FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id HAVING COUNT(DISTINCT o.status)=4 ORDER BY c.name`);
q("L38 veterans bare-count=4 false-positives", `SELECT c.name FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id HAVING COUNT(o.status)=4 ORDER BY c.name`);
q("L38 one-level aggregate error", `SELECT name FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id HAVING SUM(o.total) > AVG(o.total)`);
q("L38 above-own-avg top4", `SELECT c.name, COUNT(*) AS stellar_orders FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id=o.customer_id) GROUP BY c.id ORDER BY stellar_orders DESC, c.name LIMIT 4`);

console.log(`--- ${n} probes done`);
