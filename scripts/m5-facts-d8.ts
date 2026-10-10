// M5 FACTS PROBE — window-judgment drill set (task m5-d8), db/custom.db readonly copy.
// Receipts for the judgment set: staging law, ranker choice, NTILE splits,
// % of total constants, post-filter crowds, LAG vs self-join, MoM pipeline.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5d8.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string, max = 20) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const shown = rows.slice(0, max).map(r => Object.values(r).map(v =>
      v === null ? "NULL" : String(v)
    ).join(" | "));
    console.log(`\n[${label}]  (${rows.length} rows)`);
    shown.forEach(s => console.log("  " + s));
    if (rows.length > max) console.log(`  … +${rows.length - max} more`);
  } catch (e) {
    console.log(`\n[${label}]  ERROR: ${e instanceof Error ? e.message : e}`);
  }
}

function e(label: string, sql: string) {
  try {
    db.query(sql).all();
    console.log(`\n[ERR ${label}]  no error`);
  } catch (err) {
    console.log(`\n[ERR ${label}]  ${err instanceof Error ? err.message : err}`);
  }
}

// ---------- staging law: the rn=1 filter must live OUTSIDE the window level ----------
e("J1 where rn alias same level", `SELECT id, ROW_NUMBER() OVER (ORDER BY total DESC) AS rn FROM orders WHERE rn = 1`);
e("J2 where row_number inline", `SELECT id FROM orders WHERE ROW_NUMBER() OVER (ORDER BY total DESC) = 1`);
q("J3 top-1-per-group count", `WITH ranked AS (SELECT o.customer_id, o.id, o.total, ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.total DESC, o.id) rn FROM orders o) SELECT COUNT(*) n, ROUND(MAX(total),2) biggest FROM ranked WHERE rn = 1`);

// ---------- NTILE splits ----------
q("J4 ntile4 over 103 orders", `SELECT t, COUNT(*) n FROM (SELECT NTILE(4) OVER (ORDER BY id) t FROM orders) GROUP BY t`);
q("J5 ntile1 over 16", `SELECT t, COUNT(*) n FROM (SELECT NTILE(1) OVER (ORDER BY id) t FROM customers) GROUP BY t`);
q("J6 ntile100 over 16", `SELECT COUNT(DISTINCT t) buckets, MIN(n) mn, MAX(n) mx FROM (SELECT t, COUNT(*) n FROM (SELECT NTILE(100) OVER (ORDER BY id) t FROM customers) GROUP BY t)`);

// ---------- % of total (partition-wide constant) ----------
q("J7 alice rows and constant", `SELECT COUNT(*) rows, COUNT(DISTINCT cust_total) distinct_vals, ROUND(MAX(cust_total),2) val FROM (SELECT customer_id, SUM(total) OVER (PARTITION BY customer_id) cust_total FROM orders WHERE customer_id = 1)`);
q("J8 alice biggest share", `SELECT ROUND(100.0 * total / SUM(total) OVER (PARTITION BY customer_id), 1) pct FROM orders WHERE customer_id = 1 ORDER BY pct DESC LIMIT 1`);
q("J9 global biggest share", `SELECT id, ROUND(100.0 * total / SUM(total) OVER (), 1) pct FROM orders ORDER BY pct DESC LIMIT 1`);
q("J10 shares sum to one", `SELECT ROUND(SUM(total / SUM(total) OVER ()), 4) one FROM orders`);
q("J11 customer pct of store", `SELECT c.name, ROUND(SUM(o.total),2) spend, ROUND(100.0*SUM(o.total)/SUM(SUM(o.total)) OVER (), 1) pct FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.id ORDER BY pct DESC LIMIT 3`);

// ---------- window vs GROUP BY: keep rows vs collapse ----------
q("J12 window keeps 103", `SELECT COUNT(*) n FROM (SELECT SUM(total) OVER (PARTITION BY customer_id) s FROM orders)`);
q("J13 groupby collapses 16", `SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id)`);
q("J14 status partition census", `SELECT status, COUNT(*) OVER (PARTITION BY status) grp_n, COUNT(*) OVER () total_rows FROM orders GROUP BY status, grp_n, total_rows ORDER BY grp_n DESC`);

// ---------- post-filter crowds ----------
q("J15 count over after where", `SELECT COUNT(*) OVER () survivors FROM orders WHERE status='pending' LIMIT 1`);
q("J16 pending top orders", `SELECT id, total, RANK() OVER (ORDER BY total DESC) rk_in_crowd FROM orders WHERE status='pending' ORDER BY total DESC LIMIT 3`);
q("J17 pending max plain", `SELECT ROUND(MAX(total),2) mx, COUNT(*) n FROM orders WHERE status='pending'`);

// ---------- LAG vs self-join vs correlated ----------
q("J18 self-join fanout pairs", `SELECT COUNT(*) pairs FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND b.id < a.id`);
q("J19 correlated prev count", `SELECT COUNT(*) rows, SUM(CASE WHEN prev IS NULL THEN 1 ELSE 0 END) nulls FROM (SELECT o1.id, (SELECT MAX(o2.id) FROM orders o2 WHERE o2.customer_id = o1.customer_id AND o2.id < o1.id) prev FROM orders o1)`);
q("J20 lag per-customer nulls", `SELECT COUNT(*) nulls FROM (SELECT LAG(id) OVER (PARTITION BY customer_id ORDER BY id) p FROM orders) WHERE p IS NULL`);
q("J21 lag over shipped_at nulls", `SELECT COUNT(*) nulls FROM (SELECT LAG(shipped_at) OVER (ORDER BY shipped_at) p FROM orders) WHERE p IS NULL`);

// ---------- ranker choice ----------
q("J22 month-count rank blocks", `SELECT DISTINCT RANK() OVER (ORDER BY n DESC) rk, DENSE_RANK() OVER (ORDER BY n DESC) drk, n FROM (SELECT strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY mo) ORDER BY rk`);
q("J23 order-count buckets", `SELECT n, COUNT(*) customers FROM (SELECT COUNT(*) n FROM orders GROUP BY customer_id) GROUP BY n ORDER BY n`);
q("J24 order-count rank blocks", `SELECT DISTINCT RANK() OVER (ORDER BY n DESC) rk, DENSE_RANK() OVER (ORDER BY n DESC) drk, n FROM (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) ORDER BY rk`);

// ---------- running total / reconciliation ----------
q("J25 running ends at plain sum", `SELECT ROUND(SUM(total) OVER (ORDER BY id), 2) last_run FROM orders ORDER BY id DESC LIMIT 1`);
q("J26 plain sum", `SELECT ROUND(SUM(total), 2) plain FROM orders`);
q("J27 alice running last", `SELECT ROUND(SUM(total) OVER (PARTITION BY customer_id ORDER BY id), 2) run FROM orders WHERE customer_id = 1 ORDER BY id DESC LIMIT 1`);

// ---------- MoM pipeline ----------
q("J28 delta sign census", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) s FROM orders GROUP BY mo), d AS (SELECT s - LAG(s) OVER (ORDER BY mo) delta FROM m) SELECT SUM(CASE WHEN delta > 0 THEN 1 ELSE 0 END) ups, SUM(CASE WHEN delta < 0 THEN 1 ELSE 0 END) downs, SUM(CASE WHEN delta IS NULL THEN 1 ELSE 0 END) nulls FROM d`);
q("J29 lead last month null", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, COUNT(*) n FROM orders GROUP BY mo) SELECT mo, LEAD(n) OVER (ORDER BY mo) nxt FROM m ORDER BY mo DESC LIMIT 1`);
q("J29b pending crowd avg", `SELECT ROUND(AVG(total) OVER (), 2) crowd_avg FROM orders WHERE status='pending' LIMIT 1`);
q("J29c shares staged sum", `WITH s AS (SELECT total, total / SUM(total) OVER () share FROM orders) SELECT ROUND(SUM(share), 4) one FROM s`);

// ---------- empty input / never adds rows ----------
q("J30 window on empty input", `SELECT COUNT(*) n FROM (SELECT RANK() OVER (ORDER BY total) r FROM orders WHERE 1=0)`);
q("J31 window never adds rows", `SELECT COUNT(*) n FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY total) rn, COUNT(*) OVER () crowd FROM orders)`);
q("J32 rank over empty over", `SELECT DISTINCT RANK() OVER () v FROM orders`);

// ---------- errors (verbatim) ----------
e("J33 ntile zero", `SELECT NTILE(0) OVER (ORDER BY id) FROM orders LIMIT 1`);
e("J34 frame mixed direction", `SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN 2 FOLLOWING AND 1 PRECEDING) FROM orders LIMIT 1`);
e("J35 typo window fn", `SELECT ROW_NUBMER() OVER (ORDER BY id) FROM orders LIMIT 1`);
e("J36 ignore nulls", `SELECT FIRST_VALUE(total) IGNORE NULLS OVER (ORDER BY id) FROM orders LIMIT 1`);
e("J37 window in where rank", `SELECT id FROM orders WHERE RANK() OVER (ORDER BY total) = 1`);
e("J38 window in having", `SELECT customer_id FROM orders GROUP BY customer_id HAVING RANK() OVER (ORDER BY COUNT(*)) = 1`);

// ---------- NULLS LAST support + denominator honesty ----------
q("J39 nulls last supported", `SELECT id, shipped_at FROM orders ORDER BY shipped_at NULLS LAST, id LIMIT 1`);
q("J40 denominator census", `SELECT COUNT(*) all_rows, COUNT(shipped_at) shipped_rows FROM orders`);
q("J41 order 74 status", `SELECT id, status, total FROM orders WHERE id = 74`);
q("J42 alice order count", `SELECT COUNT(*) n FROM orders WHERE customer_id = 1`);
e("J43 bare ntile", `SELECT NTILE(4) FROM orders LIMIT 1`);
e("J44 row_number in having", `SELECT id FROM orders GROUP BY id HAVING ROW_NUMBER() OVER (ORDER BY total) = 1`);
e("J45 lag no order by", `SELECT id, LAG(total) OVER () prev FROM orders LIMIT 2`);

db.close();
rmSync(COPY, { force: true });
console.log("\nDONE m5-facts-d8");
