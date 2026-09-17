/// <reference types="bun-types" />
/**
 * M4/M5 drill batch-2 probes — edge/error receipts for remaining drill sets.
 * Read-only copy of db/custom.db; deletes itself after.
 */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m45d2.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const one = (sql: string, label: string) => {
  try {
    const r = db.query(sql).all();
    console.log(`${label} =`, JSON.stringify(r).slice(0, 300));
  } catch (e) {
    console.log(`${label} ERR:`, e instanceof Error ? e.message : String(e));
  }
};

console.log("== M4 batch2 ==");
one("SELECT COUNT(*) n FROM customers WHERE (id, name) IN (SELECT id, name FROM customers)", "row-value-in");
one("SELECT COUNT(*) n FROM customers WHERE id IN (SELECT id, customer_id FROM orders)", "in-two-columns");
one("SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE 0)", "not-in-empty");
one("SELECT COUNT(*) n FROM customers WHERE name IN ('Alice Chen', NULL)", "in-list-with-null");
one("SELECT COUNT(*) n FROM customers WHERE id = ANY (SELECT 1)", "any-keyword");
one("SELECT COUNT(*) n FROM orders WHERE customer_id IN (SELECT customer_id FROM (SELECT customer_id, SUM(total) t FROM orders GROUP BY customer_id) WHERE t > 5000)", "in-over-derived");
one("SELECT COUNT(*) n FROM customers WHERE id IN ('1')", "in-affinity");
one("SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'pending' ORDER BY customer_id)", "in-subquery-orderby");
one("SELECT COUNT(*) n FROM orders WHERE total IN (SELECT MAX(total) FROM orders)", "in-max");
one("SELECT COUNT(*) n FROM customers WHERE EXISTS (SELECT 1 FROM orders WHERE total > 900)", "exists-uncorrelated");
one("SELECT COUNT(*) n FROM customers WHERE NOT EXISTS (SELECT 1 FROM orders WHERE 0)", "not-exists-empty");
one("SELECT COUNT(*) n FROM orders WHERE (SELECT MAX(total) FROM orders WHERE status = 'void') IS NULL", "scalar-empty-is-null");
one("SELECT COUNT(*) n FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending') = 0", "correlated-count-zero");
one("SELECT COUNT(*) n FROM orders o WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.order_id = o.id)", "orders-with-invoice");
one("SELECT COUNT(*) n FROM orders o WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.order_id = o.id)", "orders-no-invoice");
one("SELECT COUNT(*) n FROM (SELECT region FROM customers GROUP BY region)", "derived-simple");
one("SELECT COUNT(*) n FROM (SELECT * FROM orders WHERE total > 800) WHERE total > 900", "derived-nested-filter");
one("SELECT COUNT(*) n FROM orders WHERE total > 900", "direct-filter-900");
one("SELECT x.t FROM (SELECT customer_id, SUM(total) t FROM orders GROUP BY customer_id) x WHERE x.t > 5000 ORDER BY x.t DESC", "derived-alias-where");
one("SELECT COUNT(*) n FROM (SELECT 1)", "unnamed-derived");
one("WITH t(a, b) AS (SELECT 1, 2) SELECT a + b v FROM t", "cte-column-aliases");
one("WITH big AS (SELECT * FROM orders WHERE total > 800) SELECT (SELECT COUNT(*) FROM big) + (SELECT COUNT(*) FROM big) n", "cte-double-reference");
one("WITH big AS (SELECT * FROM orders WHERE total > 800 ORDER BY total DESC) SELECT COUNT(*) n FROM big", "cte-inner-orderby");
one("WITH cnt(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM cnt WHERE x < 5) SELECT COUNT(*) n FROM cnt", "recursive-without-keyword");
one("WITH big AS MATERIALIZED (SELECT * FROM orders WHERE total > 800) SELECT COUNT(*) n FROM big", "cte-materialized");
one("SELECT * FROM (WITH x AS (SELECT 1 AS v) SELECT v FROM x)", "with-inside-subquery");
one("WITH RECURSIVE d(d) AS (SELECT date('2024-01-01') UNION ALL SELECT date(d, '+1 day') FROM d WHERE d < '2024-01-05') SELECT COUNT(*) n FROM d", "recursive-dates");
one("SELECT COUNT(*) n FROM orders o WHERE (SELECT SUM(total) FROM orders o2 WHERE o2.customer_id = o.customer_id) > 5000", "scalar-correlated-filter");

console.log("== M5 batch2 ==");
one("SELECT SUBSTR('2024-01-05', 6, 2) m", "substr-month");
one("SELECT LENGTH(NULL) a, UPPER(NULL) b, 'x' || NULL c", "null-propagation");
one("SELECT INSTR('hello', 'z') a, INSTR('hello', 'l') b", "instr-miss-hit");
one("SELECT TRIM('xxpadxx', 'x') t, REPLACE('aaa', 'a', 'bb') r", "trim-replace");
one("SELECT CAST(3.7 AS INTEGER) a, CAST(-3.7 AS INTEGER) b, CAST(NULL AS INTEGER) c", "cast-truncate");
one("SELECT '5' = 5 eq, '5' + 1 s, typeof('5' + 1) t", "affinity-eq-add");
one("SELECT strftime('%d', '2024-01-05') d, strftime('%Y', '2024-01-05') y", "strftime-d-y");
one("SELECT date('2024-01-31', '+1 month') a, date('2024-02-01', '-1 day') b, date('2024-03-31', '+1 month') c", "month-end-overflow");
one("SELECT julianday('2024-01-05') - julianday('2024-01-01') gap", "julianday-gap");
one("SELECT COUNT(*) n FROM orders WHERE strftime('%H', created_at) != '00'", "time-part-nonzero");
one("SELECT MIN(created_at) mn, MAX(created_at) mx FROM orders", "date-range");
one("SELECT COUNT(DISTINCT strftime('%w', created_at)) n FROM orders", "distinct-weekdays");
one("SELECT COUNT(*) n FROM orders WHERE created_at LIKE '2025%'", "like-2025");
one("SELECT MIN(substr(created_at, 1, 7)) a, MAX(substr(created_at, 1, 7)) b FROM orders", "substr-minmax");
one("SELECT COUNT(*) n FROM (SELECT customer_id, RANK() OVER (PARTITION BY customer_id ORDER BY total DESC) r FROM orders) WHERE r = 1", "rank-partition-top1");
one("SELECT total FROM (SELECT total, ROW_NUMBER() OVER (ORDER BY total DESC) rn FROM orders) WHERE rn = 2", "rownum-2-total");
one("SELECT LEAD(total, 2) OVER (ORDER BY id) v FROM orders WHERE id = 1", "lead-offset2");
one("SELECT LAG(total, 1, 0) OVER (ORDER BY id) v FROM orders WHERE id = 1", "lag-with-default");
one("SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND CURRENT ROW) v FROM orders WHERE id = 1", "frame-current-only");
one("SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) v FROM orders WHERE id = 1", "frame-3-wide-first");
one("SELECT NTILE(1) OVER (ORDER BY id) v FROM orders WHERE id <= 2", "ntile-1");
one("SELECT NTILE(0) OVER (ORDER BY id) v FROM orders LIMIT 1", "ntile-zero");
one("SELECT COUNT(*) n FROM orders WHERE RANK() OVER (ORDER BY total) = 1", "window-in-where");
one("SELECT COUNT(*) n FROM (SELECT DENSE_RANK() OVER (ORDER BY s) d FROM (SELECT substr(created_at,1,7) m, SUM(total) s FROM orders GROUP BY m)) WHERE d = 1", "dense-1-month");
one("SELECT COUNT(*) n FROM (SELECT customer_id, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) rn FROM orders) WHERE rn <= 2", "top2-per-customer");

db.close();
rmSync(COPY, { force: true });
