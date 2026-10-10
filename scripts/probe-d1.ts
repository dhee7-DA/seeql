// m4-bank-d probes — readonly, bun:sqlite only
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });

const probes: Array<[string, string]> = [
  // ---- set 1 (rec) ----
  ["A1 counter 1..5", `WITH RECURSIVE counter(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM counter WHERE n < 5) SELECT group_concat(n) AS g FROM counter`],
  ["A2 RECURSIVE on plain CTE", `WITH RECURSIVE ghosts AS (SELECT 'ghost row' AS name) SELECT name FROM ghosts`],
  ["A3 wrong placement", `WITH counter RECURSIVE AS (SELECT 1 AS n) SELECT * FROM counter`],
  ["A4 missing RECURSIVE", `WITH counter(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM counter WHERE n < 5) SELECT * FROM counter`],
  ["A6 UNION flavor", `WITH RECURSIVE c(n) AS (SELECT 1 UNION SELECT n+1 FROM c WHERE n < 5) SELECT group_concat(n) AS g FROM c`],
  ["A7 powers of two", `WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n*2 FROM c WHERE n < 16) SELECT group_concat(n) AS g FROM c`],
  ["A8 loose guard n<=5", `WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM c WHERE n <= 5) SELECT group_concat(n) AS g FROM c`],
  ["A9 guard never passes", `WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM c WHERE n < 0) SELECT count(*) AS n FROM c`],
  ["A10 empty anchor", `WITH RECURSIVE c(n) AS (SELECT 1 AS n WHERE 0 UNION ALL SELECT n+1 FROM c WHERE n < 5) SELECT count(*) AS n FROM c`],
  ["A11 order date range", `SELECT MIN(created_at) AS mn, MAX(created_at) AS mx, COUNT(DISTINCT date(created_at)) AS ddays FROM orders`],
  ["A12 date ladder days", `WITH RECURSIVE days(d) AS (SELECT date((SELECT MIN(created_at) FROM orders)) AS d UNION ALL SELECT date(d, '+1 day') FROM days WHERE d < date((SELECT MAX(created_at) FROM orders))) SELECT COUNT(*) AS n_days FROM days`],
  ["A13 ladder join products", `WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n*2 FROM c WHERE n < 16) SELECT group_concat(p.name) AS names FROM c JOIN products p ON p.id = c.n`],
  ["A14 LIMIT after ladder", `WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM c WHERE n < 5) SELECT n FROM c ORDER BY n DESC LIMIT 2`],
  ["A15 descending counter", `WITH RECURSIVE c(n) AS (SELECT 5 UNION ALL SELECT n-1 FROM c WHERE n > 1) SELECT group_concat(n) AS g FROM c`],
  ["A16 running sums", `WITH RECURSIVE c(n, s) AS (SELECT 1, 1 UNION ALL SELECT n+1, s+n FROM c WHERE n < 5) SELECT group_concat(s) AS g FROM c`],
  ["A17 NULL anchor chain", `WITH RECURSIVE c(n) AS (SELECT NULL AS n UNION ALL SELECT n+1 FROM c WHERE n < 5) SELECT count(*) AS n FROM c`],
  ["A18 two seeds count", `WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT 10 UNION ALL SELECT n+1 FROM c WHERE n < 12) SELECT count(*) AS n FROM c`],
  ["A20 ORDER BY inside parens", `WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM c WHERE n < 5 ORDER BY n) SELECT * FROM c`],
  ["A21 no column list", `WITH RECURSIVE c AS (SELECT 1 UNION ALL SELECT n+1 FROM c WHERE n < 3) SELECT * FROM c`],
  ["A22 EQP recursive", `EXPLAIN QUERY PLAN WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM c WHERE n < 5) SELECT * FROM c`],
  ["A23 no small cap 1e6", `WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM c WHERE n < 1000000) SELECT count(*) AS n FROM c`],
  ["A24 column list wins header", `WITH RECURSIVE c(x) AS (SELECT 1 AS n UNION ALL SELECT n+1 FROM c WHERE n < 3) SELECT * FROM c LIMIT 1`],
  ["A26 ladder join customers", `WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n*2 FROM c WHERE n < 16) SELECT COUNT(*) AS n FROM c JOIN customers ON customers.id = c.n`],
  // ---- set 2 (edg) ----
  ["B1 NOT IN cancelled club", `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status='cancelled')`],
  ["B2 IN pending customers", `SELECT COUNT(*) AS n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status='pending')`],
  ["B3 first pending row customer", `SELECT id, name FROM customers WHERE id = (SELECT customer_id FROM orders WHERE status='pending')`],
  ["B4 stamp distinct", `SELECT COUNT(DISTINCT (SELECT ROUND(AVG(total),2) FROM orders)) AS stamp FROM customers`],
  ["B5 scalar NULL propagation", `SELECT COUNT(*) AS n FROM customers c WHERE (SELECT MAX(shipped_at) FROM orders o WHERE o.customer_id = c.id) IS NULL`],
  ["B6 NOT IN all orders", `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)`],
  ["B7 alias shadow inner c", `SELECT COUNT(*) AS n FROM customers c WHERE c.id IN (SELECT c.id FROM orders c WHERE c.total > 900)`],
  ["B8 equal to MAX", `SELECT COUNT(*) AS n FROM orders WHERE total = (SELECT MAX(total) FROM orders)`],
  ["B8b above MAX", `SELECT COUNT(*) AS n FROM orders WHERE total > (SELECT MAX(total) FROM orders)`],
  ["B9 invoice-less NULL stamps", `SELECT COUNT(*) AS n FROM customers c WHERE (SELECT SUM(amount_cents) FROM invoices i WHERE i.customer_id = c.id) IS NULL`],
  ["B10 literal NULL in list", `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (1, 13, 5, 11, NULL)`],
  ["B11 one-level aggregate", `SELECT id FROM orders WHERE total > AVG(total)`],
  ["B12 two-column IN", `SELECT COUNT(*) FROM customers WHERE id IN (SELECT id, customer_id FROM orders)`],
  ["B13 typo in correlated col", `SELECT COUNT(*) FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customr_id = c.id)`],
  ["B14 ambiguous name", `SELECT name FROM customers, suppliers WHERE name = name`],
  ["B15 derived no alias", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders)`],
  ["B16 region counts", `SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY region`],
  ["B17 orders over 900", `SELECT COUNT(*) AS n FROM orders WHERE total > 900`],
  ["B18 over-900 order ids <=16", `SELECT group_concat(id) AS ids FROM (SELECT id FROM orders WHERE total > 900 AND id <= 16)`],
  ["B20 cancelled via EXISTS", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='cancelled')`],
  ["B26 correlated NOT IN empty", `SELECT COUNT(*) AS n FROM customers c WHERE c.id NOT IN (SELECT o.customer_id FROM orders o WHERE o.customer_id = c.id AND o.status='pending')`],
  ["B32 orders customer_id NULLs", `SELECT COUNT(*) AS n FROM orders WHERE customer_id IS NULL`],
  ["B34 NOT IN unguarded shipped_at", `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT shipped_at FROM orders)`],
  ["B35 NOT IN guarded shipped_at", `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT shipped_at FROM orders WHERE shipped_at IS NOT NULL)`],
  ["B36 scalar IS NOT NULL", `SELECT COUNT(*) AS n FROM customers c WHERE (SELECT MAX(shipped_at) FROM orders o WHERE o.customer_id = c.id) IS NOT NULL`],
];

for (const [label, sql] of probes) {
  try {
    console.log(label, "=>", JSON.stringify(db.query(sql).all()));
  } catch (e: any) {
    console.log(label, "=> ERROR:", e.message);
  }
}
