/// <reference types="bun-types" />
/**
 * P2(M4/M5) deep-dive probes — engine receipts for lessons 25–32, 38, 39.
 * Read-only copy of db/custom.db; deletes itself after.
 */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m45deep.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const one = (sql: string, label: string) => {
  try {
    const r = db.query(sql).all();
    console.log(`${label} =`, JSON.stringify(r).slice(0, 400));
  } catch (e) {
    console.log(`${label} ERR:`, e instanceof Error ? e.message : String(e));
  }
};

console.log("== M4: subqueries ==");
one("SELECT ROUND(AVG(total),2) a, COUNT(*) n FROM orders", "avg-order");
one("SELECT COUNT(*) n FROM orders WHERE total > (SELECT AVG(total) FROM orders)", "above-avg");
one("SELECT COUNT(*) n FROM orders WHERE total = (SELECT MAX(total) FROM orders)", "at-max");
one("SELECT ROUND(AVG(t),4) a FROM (SELECT customer_id, SUM(total) t FROM orders GROUP BY customer_id) x", "avg-per-customer-spend");
one("SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'pending')", "not-in-pending");
one("SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'pending' UNION SELECT NULL)", "not-in-with-null-injected");
one("SELECT COUNT(*) n FROM customers WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = customers.id AND o.status = 'pending')", "not-exists-pending");
one("SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE total > 900)", "in-big-spenders");
one("SELECT name FROM customers ORDER BY (SELECT COUNT(*) FROM orders o WHERE o.customer_id = customers.id) DESC LIMIT 1", "correlated-order-top");
one("SELECT total, ROUND((SELECT AVG(total) FROM orders),2) a FROM orders WHERE id = 1", "scalar-in-select");
one("SELECT COUNT(*) n FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU')", "in-eu-orders");
try {
  db.query("SELECT total FROM orders WHERE id = (SELECT id FROM orders WHERE status = 'pending' LIMIT 2)").all();
} catch (e) {
  console.log("scalar-multi-row ERR:", e instanceof Error ? e.message : String(e));
}
one("WITH big AS (SELECT * FROM orders WHERE total > 800) SELECT COUNT(*) n FROM big", "cte-basic");
one("WITH big AS (SELECT * FROM orders WHERE total > 800), eu AS (SELECT * FROM big WHERE customer_id IN (SELECT id FROM customers WHERE region='EU')) SELECT COUNT(*) n FROM eu", "cte-chain");
one("WITH orders AS (SELECT 1 AS marker) SELECT marker FROM orders", "cte-shadows-table");
one("WITH RECURSIVE cnt(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM cnt WHERE x < 5) SELECT COUNT(*) n FROM cnt", "recursive-5");
one("WITH eu_c AS (SELECT id, name FROM customers WHERE region='EU') SELECT COUNT(*) n FROM orders o JOIN eu_c ON eu_c.id = o.customer_id", "cte-join");
console.log("== M5: text / dates / windows ==");
one("SELECT LENGTH('São Paulo') n", "length-unicode");
one("SELECT UPPER(name) FROM customers WHERE id = 1", "upper");
one("SELECT name, LENGTH(name) n FROM customers ORDER BY n DESC LIMIT 1", "longest-name");
one("SELECT 'a' || 'b' x, 'n=' || 7 y", "concat");
one("SELECT CAST('7' AS INTEGER) + 1 n, 'abc' + 1 m, CAST('12abc' AS INTEGER) k", "cast-coerce");
one("SELECT COALESCE(NULL, NULL, 'x') v, COALESCE(shipped_at, 'not shipped') FROM orders WHERE shipped_at IS NULL LIMIT 1", "coalesce");
one("SELECT COUNT(*) n FROM orders WHERE substr(created_at, 1, 7) = '2024-01'", "jan-orders");
one("SELECT substr(created_at, 1, 7) m, COUNT(*) n FROM orders GROUP BY m ORDER BY m", "month-buckets");
one("SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) d FROM orders WHERE shipped_at IS NOT NULL", "avg-ship-days");
one("SELECT COUNT(*) n FROM orders WHERE julianday(shipped_at) - julianday(created_at) > 30", "slow-ships");
one("SELECT ROUND(MAX(julianday(shipped_at) - julianday(created_at)),1) d FROM orders WHERE shipped_at IS NOT NULL", "max-ship-days");
one("SELECT date(created_at, '+7 days') d FROM orders WHERE id = 1", "date-plus7");
one("SELECT strftime('%w', created_at) wd, COUNT(*) n FROM orders GROUP BY wd ORDER BY n DESC LIMIT 2", "busiest-weekdays");
one("SELECT COUNT(*) n FROM (SELECT total, COUNT(*) c FROM orders GROUP BY total HAVING c > 1) t", "duplicate-total-values");
one("SELECT COUNT(*) n FROM (SELECT total, COUNT(*) c FROM orders GROUP BY total HAVING c > 1 AND COUNT(*) > 2) t", "triple-totals");
one("SELECT rn FROM (SELECT ROW_NUMBER() OVER (ORDER BY total DESC, id) rn FROM orders) WHERE rn = 1", "rownum-1");
one("SELECT DISTINCT r FROM (SELECT RANK() OVER (ORDER BY total DESC) r FROM orders) WHERE r <= 5 ORDER BY r", "rank-first5-distinct");
one("SELECT DISTINCT d FROM (SELECT DENSE_RANK() OVER (ORDER BY total DESC) d FROM orders) WHERE d <= 3 ORDER BY d", "dense3");
one("SELECT t, rn, rk FROM (SELECT total t, ROW_NUMBER() OVER (ORDER BY total DESC) rn, RANK() OVER (ORDER BY total DESC) rk FROM orders LIMIT 12) WHERE rn != rk LIMIT 3", "rn-vs-rank-gap");
one("SELECT n FROM (SELECT NTILE(4) n FROM orders) GROUP BY n", "ntile4-buckets");
one("SELECT n FROM (SELECT NTILE(5) n FROM orders) GROUP BY n", "ntile5-buckets");
one("SELECT nt FROM (SELECT NTILE(2) OVER (PARTITION BY region) nt, region FROM orders o JOIN customers c ON c.id=o.customer_id WHERE region='LATAM') GROUP BY nt", "ntile2-latam");
one("SELECT t, lag_t, lead_t FROM (SELECT total t, LAG(total) OVER (ORDER BY id) lag_t, LEAD(total) OVER (ORDER BY id) lead_t FROM orders WHERE id <= 3) ", "lag-lead-edges");
one("SELECT COUNT(*) n FROM (SELECT LAG(total) OVER (ORDER BY id) l FROM orders) WHERE l IS NULL", "lag-null-count");
one("SELECT SUM(total) OVER (ORDER BY id) rt FROM orders WHERE id = 103", "running-total-last");
one("SELECT SUM(total) OVER (ORDER BY total) rt FROM orders WHERE total = (SELECT MAX(total) FROM orders) LIMIT 1", "range-frame-peers");
one("SELECT SUM(total) OVER () allsum FROM orders LIMIT 1", "whole-partition-sum");
one("SELECT ROUND(SUM(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW),2) FROM orders WHERE id = 103", "rows-frame-last");
one("SELECT ROUND(SUM(total) OVER (ORDER BY id RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW),2) FROM orders WHERE id = 103", "range-ordered-by-id-last");
one("SELECT region, rn, name FROM (SELECT c.region region, c.name name, ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY o.total DESC) rn FROM orders o JOIN customers c ON c.id = o.customer_id) WHERE rn = 1 ORDER BY region", "top-per-region");
one("SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) t FROM orders GROUP BY customer_id) x WHERE t > 5000", "customers-over-5k");

console.log("== M4 drill extras ==");
one("SELECT COUNT(*) n FROM customers WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = customers.id) = 0", "customers-zero-orders");
one("SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'pending')", "in-pending");
one("SELECT COUNT(*) n FROM customers WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = customers.id AND o.status = 'pending')", "exists-pending");
one("SELECT name FROM customers WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = customers.id AND o.status = 'pending') ORDER BY name", "no-pending-names");
one("SELECT c.name, ROUND(x.t,2) t FROM (SELECT customer_id, SUM(total) t FROM orders GROUP BY customer_id) x JOIN customers c ON c.id = x.customer_id ORDER BY x.t DESC LIMIT 3", "derived-top-spenders");
one("SELECT COUNT(*) n FROM customers c JOIN (SELECT customer_id, SUM(total) t FROM orders GROUP BY customer_id) x ON x.customer_id = c.id", "derived-join-rowcount");
one("SELECT COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id", "raw-join-rowcount");
one("SELECT id, total FROM orders WHERE total > 800 ORDER BY total DESC", "big-orders");
one("SELECT o.id, o.total, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.total > 800 AND c.region = 'EU'", "eu-big");
one("SELECT m, n, ROUND(SUM(s) OVER (ORDER BY m),2) run FROM (SELECT substr(created_at,1,7) m, COUNT(*) n, SUM(total) s FROM orders GROUP BY m) WHERE m >= '2024-11'", "month-running-tail");
one("SELECT SUM(s) OVER (PARTITION BY m) peer FROM (SELECT substr(created_at,1,7) m, SUM(total) s FROM orders GROUP BY m) WHERE m = '2025-02'", "month-peer-sum");
one("SELECT nt, COUNT(*) c FROM (SELECT NTILE(4) OVER (ORDER BY m) nt FROM (SELECT substr(created_at,1,7) m FROM orders GROUP BY m)) GROUP BY nt ORDER BY nt", "ntile4-months");
one("SELECT COUNT(*) n FROM (SELECT LAG(total) OVER (PARTITION BY customer_id ORDER BY id) l FROM orders) WHERE l IS NULL", "lag-null-per-customer");
one("SELECT ROUND(SUM(total),2) s FROM orders WHERE status = 'pending'", "pending-sum");
one("SELECT COUNT(*) n FROM orders WHERE total > (SELECT AVG(total) FROM orders WHERE status = 'delivered')", "above-delivered-avg");
one("SELECT ROUND(AVG(total),2) a FROM orders WHERE status = 'delivered'", "delivered-avg");
one("SELECT COUNT(*) n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) > (SELECT AVG(total) FROM orders)) x", "having-scalar-count");
one("SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) t FROM orders GROUP BY customer_id) WHERE t > 2000", "spenders-over-2000");
one("SELECT c.name FROM customers c WHERE c.id = (SELECT customer_id FROM orders GROUP BY customer_id ORDER BY SUM(total) DESC LIMIT 1)", "scalar-name-top");
one("SELECT COUNT(DISTINCT customer_id) n FROM orders WHERE total > (SELECT AVG(total) FROM orders)", "distinct-customers-above-avg");

console.log("== M5 drill extras ==");
one("SELECT UPPER(name) u, LOWER(city) l FROM customers WHERE id = 1", "upper-lower-id1");
one("SELECT substr('Isabella Rossi', 1, 8) a, substr('Isabella Rossi', -5) b, substr('Alice Chen', 7) c", "substr-slices");
one("SELECT COUNT(*) n FROM customers WHERE substr(name, 1, 1) = 'A'", "initial-a");
one("SELECT REPLACE('2024-01', '2024', 'FY24') x, TRIM('  pad  ') y, INSTR('support@seeql.dev', '@') z, INSTR('Alice Chen', ' ') p", "text-utils");
one("SELECT strftime('%w', created_at) wd, COUNT(*) n FROM orders GROUP BY wd ORDER BY wd", "weekday-all");
one("SELECT substr(created_at, 1, 7) m, COUNT(*) n, ROUND(SUM(total),2) s FROM orders GROUP BY m ORDER BY m", "month-buckets-full");
one("SELECT COUNT(DISTINCT substr(created_at, 1, 4)) y FROM orders", "distinct-years");
one("SELECT id, total FROM orders ORDER BY total DESC LIMIT 3", "top3-totals");
one("SELECT id, total, created_at FROM orders ORDER BY id LIMIT 3", "first3-by-id");
one("SELECT id, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) ma FROM orders WHERE id <= 3", "moving-avg-2");
one("SELECT DISTINCT c.region, ROUND(SUM(o.total) OVER (PARTITION BY c.region), 2) s FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY s DESC", "region-window-sums");
one("SELECT date(created_at, '+7 days') d, created_at FROM orders WHERE id = 1", "date-plus7-id1");
one("SELECT COUNT(*) n FROM (SELECT NTILE(4) n FROM (SELECT substr(created_at,1,7) m FROM orders GROUP BY m)) GROUP BY n", "ntile4-months");
one("SELECT COUNT(*) n FROM (SELECT LEAD(total) OVER (ORDER BY id) l FROM orders) WHERE l IS NULL", "lead-null-count");
one("SELECT ROUND(SUM(total) OVER (ORDER BY id), 2) rt FROM orders WHERE id = 5", "running-at-5");
one("SELECT COUNT(*) n FROM orders WHERE julianday(shipped_at) - julianday(created_at) <= 1", "ships-within-1day");
one("SELECT total, RANK() OVER (ORDER BY total DESC) r FROM orders LIMIT 1", "rank-1-total");
one("SELECT name FROM (SELECT c.name, SUM(o.total) t, NTILE(4) OVER (ORDER BY SUM(o.total)) q FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) WHERE q = 4 ORDER BY t DESC", "top-quartile-names");
one("SELECT name FROM (SELECT c.name name, SUM(o.total) t FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) WHERE t > 5000 ORDER BY t DESC", "over-5k-names");
one("SELECT COUNT(*) n FROM invoices", "invoice-count");
one("SELECT id, amount_cents, CAST(amount_cents AS REAL) / 100 dollars FROM invoices LIMIT 2", "cents-to-dollars");
one("SELECT COUNT(*) n FROM orders WHERE strftime('%Y', created_at) = '2025'", "orders-2025");
one("SELECT COUNT(*) n FROM orders WHERE strftime('%Y', created_at) = '2024'", "orders-2024");

db.close();
rmSync(COPY, { force: true });
