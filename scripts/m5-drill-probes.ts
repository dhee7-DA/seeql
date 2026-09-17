/// <reference types="bun-types" />
/**
 * M5 drill probes — engine receipts for the Module 5 drill bank
 * (text funcs, CAST, date buckets, date math, rank family, partitions,
 * LAG/LEAD, frames, NTILE, ops calendar). Read-only copy of db/custom.db;
 * deletes itself after.
 */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m5d.db";
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

console.log("== data shapes ==");
one("SELECT created_at, shipped_at FROM orders WHERE shipped_at IS NOT NULL LIMIT 2", "created-at-format");
one("SELECT typeof(created_at) a, typeof(total) b, typeof(id) c, typeof(customer_id) d FROM orders LIMIT 1", "typeof-cols");
one("SELECT COUNT(*) n FROM orders WHERE shipped_at IS NULL", "unshipped-count");
one("SELECT COUNT(DISTINCT region) n FROM customers", "region-count");
one("SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY region", "region-census");

console.log("== text functions ==");
one("SELECT UPPER(name) u, LOWER(name) l FROM customers WHERE id = 1", "upper-lower-name");
one("SELECT COUNT(*) n FROM customers WHERE UPPER(name) = 'ALICE CHEN'", "upper-match");
one("SELECT COUNT(*) n FROM customers WHERE name = 'alice chen'", "lower-match-false");
one("SELECT LENGTH(name) n, name FROM customers ORDER BY LENGTH(name) DESC LIMIT 3", "longest-names");
one("SELECT LENGTH(name) n FROM customers WHERE id = 2", "name-len-2");
one("SELECT COUNT(*) n FROM customers WHERE LENGTH(name) > 12", "names-over-12");
one("SELECT SUBSTR(name, 1, 1) i FROM customers WHERE id = 1", "substr-initial");
one("SELECT SUBSTR('2024-03-15', 1, 7) ym, SUBSTR('2024-03-15', 6, 2) mm", "substr-date-parts");
one("SELECT name, SUBSTR(name, 1, INSTR(name, ' ') - 1) first FROM customers WHERE id IN (1, 2, 3)", "substr-instr-first-name");
one("SELECT city, UPPER(SUBSTR(city, 1, 3)) tag FROM customers WHERE id IN (1, 5, 9)", "city-tags");
one("SELECT city || ', ' || region cr FROM customers WHERE id = 1", "concat-city-region");
one("SELECT 'Total: ' || 5 t, 1 || 2 n, 'a' || NULL x", "concat-coercion");
one("SELECT REPLACE('2024-01-05', '-', '/') r", "replace-dashes");
one("SELECT COUNT(*) n FROM customers WHERE REPLACE(city, ' ', '') = UPPER(city)", "replace-weird");
one("SELECT TRIM('  pad  ') a, LENGTH(TRIM('  pad  ')) b", "trim-basic");
one("SELECT COUNT(*) n FROM orders WHERE TRIM(status) != status", "status-needs-trim");
one("SELECT INSTR('Alice Chen', ' ') sp, INSTR('Alice Chen', 'z') miss", "instr-spaces");
one("SELECT COUNT(*) n FROM customers WHERE INSTR(name, ' ') > 0", "names-with-space");
one("SELECT name FROM customers WHERE LENGTH(name) = (SELECT MAX(LENGTH(name)) FROM customers)", "max-len-name");

console.log("== cast & coercion ==");
one("SELECT CAST('7' AS INTEGER) + 1 v", "cast-string-add");
one("SELECT '7' + 1 v, typeof('7' + 1) t", "plus-coerce");
one("SELECT 'abc' + 1 v, '12abc' + 1 v2, CAST('12abc' AS INTEGER) v3", "plus-cast-garbage");
one("SELECT CAST(3.7 AS INTEGER) a, CAST(-3.7 AS INTEGER) b, CAST('3.7' AS REAL) c", "cast-truncate");
one("SELECT CAST(34.5 AS TEXT) t, LENGTH(CAST(34.5 AS TEXT)) l", "cast-to-text");
one("SELECT CAST(NULL AS INTEGER) v", "cast-null");
one("SELECT total, CAST(total AS INTEGER) t FROM orders WHERE id IN (1, 2)", "cast-money-loses-cents");
one("SELECT typeof(1) a, typeof(1.5) b, typeof('1') c, typeof(NULL) d, typeof(x'00') e", "typeof-zoo");
one("SELECT COUNT(*) n FROM orders WHERE status = 1", "status-vs-int");
one("SELECT '5' = 5 eq, typeof('5' = 5) t", "affinity-eq");
one("SELECT COALESCE(NULL, NULL, 'fallback') f", "coalesce-chain");
one("SELECT COUNT(*) n FROM orders WHERE COALESCE(shipped_at, 'never') = 'never'", "coalesce-fill-count");
one("SELECT NULLIF('pending', 'pending') a, NULLIF('paid', 'pending') b", "nullif-twin");
one("SELECT id, total, IFNULL(shipped_at, 'pending ship') s FROM orders WHERE id = 2", "ifnull-fill");

console.log("== date buckets ==");
one("SELECT strftime('%Y', created_at) y, COUNT(*) n FROM orders GROUP BY y ORDER BY y", "year-buckets");
one("SELECT strftime('%Y-%m', created_at) m, COUNT(*) n FROM orders GROUP BY m ORDER BY m LIMIT 5", "month-buckets-head");
one("SELECT COUNT(*) n FROM (SELECT strftime('%Y-%m', created_at) m FROM orders GROUP BY m)", "month-bucket-count");
one("SELECT strftime('%Y-%m', created_at) m, COUNT(*) n FROM orders GROUP BY m ORDER BY n DESC LIMIT 3", "busiest-months");
one("SELECT strftime('%w', created_at) w, COUNT(*) n FROM orders GROUP BY w ORDER BY w", "weekday-codes");
one("SELECT strftime('%Y-%m-%d', created_at) d, COUNT(*) n FROM orders GROUP BY d ORDER BY d LIMIT 3", "day-buckets-head");
one("SELECT COUNT(*) n FROM (SELECT strftime('%Y-%m-%d', created_at) d FROM orders GROUP BY d)", "distinct-days");
one("SELECT strftime('%H', created_at) h, COUNT(*) n FROM orders GROUP BY h ORDER BY h LIMIT 4", "hour-buckets");
one("SELECT strftime('%M', created_at) m, COUNT(*) n FROM orders GROUP BY m ORDER BY m LIMIT 3", "minute-buckets");
one("SELECT strftime('%Y%m', created_at) m FROM orders WHERE id = 1", "compact-month");
one("SELECT strftime('%Y-%m', created_at) a, SUBSTR(created_at, 1, 7) b FROM orders WHERE id = 1", "strftime-vs-substr");
one("SELECT GROUP_CONCAT(DISTINCT strftime('%Y', created_at)) ys FROM orders", "years-list");
one("SELECT COUNT(*) n FROM orders WHERE strftime('%Y', created_at) = '2024'", "orders-2024");
one("SELECT COUNT(*) n FROM orders WHERE created_at LIKE '2024-%'", "like-year");

console.log("== date math ==");
one("SELECT date('2024-01-05', '+7 days') a, date('2024-01-05', '-7 days') b", "plus-minus-days");
one("SELECT date('2024-01-31', '+1 month') a, date('2024-03-31', '+1 month') b, date('2024-02-29', '+1 year') c", "month-end-overflow");
one("SELECT date('2024-01-05', '+1 month') a, date('2024-01-05', '+30 days') b", "month-vs-30d");
one("SELECT julianday('2024-01-05') j, julianday('2024-01-01') j0, julianday('2024-01-05') - julianday('2024-01-01') diff", "julianday-diff");
one("SELECT julianday(created_at) j FROM orders WHERE id = 1", "julianday-real");
one("SELECT julianday('2024-01-05 12:00:00') - julianday('2024-01-05 00:00:00') half", "julianday-time");
one("SELECT COUNT(*) n, ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) avg_d, MAX(julianday(shipped_at) - julianday(created_at)) max_d FROM orders WHERE shipped_at IS NOT NULL", "ship-speed");
one("SELECT COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL AND julianday(shipped_at) - julianday(created_at) > 3", "slow-ships");
one("SELECT COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL AND julianday(shipped_at) - julianday(created_at) = 0", "same-day-ships");
one("SELECT date(created_at, '+7 days') due FROM orders WHERE id = 1", "column-date-math");
one("SELECT COUNT(*) n FROM orders WHERE date(created_at, '+7 days') < date('now')", "now-dependent");
one("SELECT julianday('not a date') j", "julianday-garbage");
one("SELECT date(created_at) d FROM orders WHERE id = 1", "date-strip-time");

console.log("== rank family ==");
one("WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) t FROM orders GROUP BY mo) SELECT mo, t, ROW_NUMBER() OVER (ORDER BY t DESC) rn, RANK() OVER (ORDER BY t DESC) rk, DENSE_RANK() OVER (ORDER BY t DESC) dr FROM m ORDER BY rn LIMIT 8", "rank-months-head");
one("WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) t FROM orders GROUP BY mo) SELECT COUNT(*) n FROM m", "month-count");
one("WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) t FROM orders GROUP BY mo) SELECT COUNT(DISTINCT t) n FROM m", "distinct-month-totals");
one("WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) t FROM orders GROUP BY mo) SELECT GROUP_CONCAT(rk) rks FROM (SELECT RANK() OVER (ORDER BY t DESC) rk FROM m)", "rank-list");
one("WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) t FROM orders GROUP BY mo) SELECT GROUP_CONCAT(dr) drs FROM (SELECT DENSE_RANK() OVER (ORDER BY t DESC) dr FROM m)", "dense-list");
one("WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) t FROM orders GROUP BY mo) SELECT mo, t FROM m WHERE RANK() OVER (ORDER BY t DESC) = 1", "window-in-where");
one("WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) t FROM orders GROUP BY mo), r AS (SELECT mo, t, RANK() OVER (ORDER BY t DESC) rk FROM m) SELECT mo, t FROM r WHERE rk = 1", "rank-via-cte");
one("WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) t FROM orders GROUP BY mo) SELECT mo, t, ROW_NUMBER() OVER (ORDER BY t DESC) rn FROM m ORDER BY rn LIMIT 1", "top-month");
one("WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) t FROM orders GROUP BY mo) SELECT COUNT(*) tied FROM (SELECT t FROM m GROUP BY t HAVING COUNT(*) > 1)", "tie-groups");
one("SELECT id, total, RANK() OVER (ORDER BY total DESC) rk FROM orders WHERE id <= 3", "rank-order-totals");
one("SELECT COUNT(*) n FROM (SELECT total FROM orders GROUP BY total HAVING COUNT(*) > 1)", "duplicate-totals");

console.log("== partitions ==");
one("SELECT c.region, c.name, SUM(o.total) t, RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) rk FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region, c.name ORDER BY c.region, rk LIMIT 10", "per-region-ranks");
one("SELECT c.region, COUNT(DISTINCT c.id) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region", "region-order-counts");
one("WITH s AS (SELECT c.region, c.name, SUM(o.total) t FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region, c.name), r AS (SELECT region, name, t, RANK() OVER (PARTITION BY region ORDER BY t DESC) rk FROM s) SELECT region, name, t FROM r WHERE rk = 1 ORDER BY region", "top-per-region");
one("WITH s AS (SELECT c.region, c.name, SUM(o.total) t FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region, c.name), r AS (SELECT region, name, t, RANK() OVER (PARTITION BY region ORDER BY t DESC) rk FROM s) SELECT COUNT(*) n FROM r WHERE rk <= 2", "top2-per-region");
one("SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY n DESC", "region-cust-census");
one("SELECT SUM(total) OVER (PARTITION BY customer_id) pt, total FROM orders WHERE customer_id = 1 ORDER BY total LIMIT 3", "partition-sum-stamp");
one("SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) t, COUNT(*) c FROM orders GROUP BY customer_id HAVING c >= 20)", "heavy-customers");
one("SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) t, COUNT(*) c FROM orders GROUP BY customer_id HAVING c = 1)", "single-order-customers");

console.log("== lag & lead ==");
one("SELECT id, total, LAG(total) OVER (ORDER BY id) prev FROM orders WHERE id <= 4", "lag-head");
one("SELECT COUNT(*) n FROM (SELECT LAG(total) OVER (ORDER BY id) prev FROM orders) WHERE prev IS NULL", "lag-null-count");
one("SELECT id, total, LAG(total, 1, 0) OVER (ORDER BY id) prev FROM orders WHERE id = 1", "lag-default-zero");
one("SELECT id, total, LEAD(total) OVER (ORDER BY id) next FROM orders WHERE id >= 102", "lead-tail");
one("SELECT COUNT(*) n FROM (SELECT LEAD(total) OVER (ORDER BY id) nx FROM orders) WHERE nx IS NULL", "lead-null-count");
one("SELECT id, total, LEAD(total, 2) OVER (ORDER BY id) nx FROM orders WHERE id = 1", "lead-2-step");
one("SELECT id, total, total - LAG(total) OVER (ORDER BY id) delta FROM orders WHERE id <= 3", "delta-col");
one("SELECT id, total, LAG(total) OVER (ORDER BY id) prev FROM orders WHERE id = 1", "where-shrinks");
one("SELECT name, LAG(name) OVER (ORDER BY id) prev FROM customers WHERE id <= 2", "lag-text");
one("WITH r AS (SELECT id, total, LAG(total) OVER (ORDER BY id) prev FROM orders) SELECT COUNT(*) n FROM r WHERE prev IS NOT NULL AND total > prev", "streak-ups");

console.log("== frames & running ==");
one("SELECT id, total, SUM(total) OVER (ORDER BY id) running FROM orders WHERE id <= 5", "running-default");
one("SELECT id, total, SUM(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) running FROM orders WHERE id <= 5", "running-rows-unbounded");
one("SELECT SUM(total) OVER () grand FROM orders WHERE id = 1", "over-empty-grand");
one("SELECT COUNT(*) n FROM (SELECT SUM(total) OVER () grand FROM orders) WHERE grand = 34833.28", "grand-stamped");
one("SELECT id, total, SUM(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) w FROM orders WHERE id <= 3", "frame-3wide");
one("SELECT id, total, AVG(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) ma FROM orders WHERE id <= 4", "moving-avg");
one("SELECT id, total, SUM(total) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) reverse FROM orders WHERE id <= 3", "reverse-running");
one("SELECT id, total, COUNT(*) OVER (ORDER BY id) c FROM orders WHERE id <= 3", "count-running");
one("SELECT id, total, MIN(total) OVER (ORDER BY id) mn, MAX(total) OVER (ORDER BY id) mx FROM orders WHERE id <= 3", "minmax-running");
one("SELECT ROUND(SUM(total) OVER (), 2) g FROM orders LIMIT 1", "grand-total");
one("SELECT id, total, SUM(total) OVER (ORDER BY id) running FROM orders WHERE id = 103", "where-shrinks-running");

console.log("== ntile ==");
one("WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) t FROM orders GROUP BY mo) SELECT NTILE(4) OVER (ORDER BY t DESC) q, COUNT(*) n FROM m GROUP BY q ORDER BY q", "ntile4-months");
one("SELECT NTILE(4) OVER (ORDER BY id) q, COUNT(*) n FROM orders GROUP BY q ORDER BY q", "ntile4-orders");
one("SELECT NTILE(3) OVER (ORDER BY id) q, COUNT(*) n FROM orders GROUP BY q ORDER BY q", "ntile3-orders");
one("SELECT NTILE(1) OVER (ORDER BY id) q, COUNT(*) n FROM orders GROUP BY q", "ntile1");
one("SELECT NTILE(150) OVER (ORDER BY id) q, COUNT(*) n FROM orders GROUP BY q ORDER BY q LIMIT 3", "ntile-overcount");
one("SELECT NTILE(0) OVER (ORDER BY id) q FROM orders LIMIT 1", "ntile-zero");
one("SELECT NTILE(2) OVER (ORDER BY id) q FROM orders LIMIT 1", "ntile-works");
one("SELECT NTILE(2) FROM orders LIMIT 1", "ntile-no-over");

console.log("== ops calendar synthesis ==");
one("SELECT strftime('%Y-%m', created_at) mo, SUM(total) t FROM orders GROUP BY mo ORDER BY mo LIMIT 3", "cal-months");
one("SELECT ROUND(SUM(total), 2) g FROM orders", "grand");
one("WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) t FROM orders GROUP BY mo) SELECT ROUND(SUM(t) OVER (ORDER BY mo), 2) running, mo, ROUND(t, 2) t FROM m ORDER BY mo LIMIT 3", "cal-running");
one("SELECT COUNT(*) n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 20)", "rhythm-20plus");
one("SELECT c.name, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY n DESC LIMIT 4", "rhythm-leaders");
one("SELECT COUNT(*) n FROM orders WHERE status = 'pending'", "pending-count");

db.close();
rmSync(COPY);
console.log("(copy deleted)");
