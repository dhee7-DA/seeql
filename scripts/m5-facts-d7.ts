// M5 FACTS PROBE — window-edges drill (task m5-d7). Read-only COPY of db/custom.db.
// Every numeric/verbatim claim in drills/m5/window-edges.ts cites one of these labeled outputs.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5d7.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string, max = 20) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`\n[${label}]  (${rows.length} rows)`);
    rows.slice(0, max).forEach(r => console.log("  " + Object.values(r).map(v => v === null ? "NULL" : String(v)).join(" | ")));
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

// ---------- A. windows banned in WHERE / HAVING / GROUP BY; missing OVER; typos ----------
e("A01 rank in WHERE", `SELECT id FROM orders WHERE RANK() OVER (ORDER BY total) = 1`);
e("A02 rank in HAVING", `SELECT customer_id FROM orders GROUP BY customer_id HAVING RANK() OVER (ORDER BY COUNT(*)) = 1`);
e("A03 rank missing OVER", `SELECT RANK() FROM orders`);
e("A04 dense_rank missing OVER", `SELECT DENSE_RANK() FROM orders LIMIT 1`);
e("A05 lag missing OVER", `SELECT LAG(total) FROM orders LIMIT 1`);
e("A06 rank in GROUP BY clause", `SELECT id FROM orders GROUP BY RANK() OVER (ORDER BY total)`);
e("A07 typo RAN over", `SELECT RAN() OVER (ORDER BY id) FROM orders LIMIT 1`);
e("A08 typo dense_rnk over", `SELECT DENSE_RNK() OVER (ORDER BY id) FROM orders LIMIT 1`);
e("A09 rank in same-level WHERE via alias", `SELECT id, ROW_NUMBER() OVER (ORDER BY total DESC) rn FROM orders WHERE rn = 1`);
e("A10 window in ORDER BY clause of outer query (expect legal)", `SELECT id, total FROM orders ORDER BY RANK() OVER (ORDER BY total) LIMIT 2`);
e("A11 nested window fns", `SELECT RANK() OVER (ORDER BY ROW_NUMBER() OVER (ORDER BY id)) FROM orders LIMIT 1`);
e("A12 window inside aggregate", `SELECT SUM(RANK() OVER (ORDER BY id)) FROM orders`);

// ---------- B. OVER () with no ORDER BY ----------
q("B01 rank over empty distinct", `SELECT DISTINCT RANK() OVER () v, DENSE_RANK() OVER () dv FROM orders`);
q("B02 count rank-over-empty rows", `SELECT COUNT(*) n FROM (SELECT RANK() OVER () r FROM orders) WHERE r = 1`);
q("B03 row_number over empty (arbitrary but unique)", `SELECT id, ROW_NUMBER() OVER () rn FROM orders LIMIT 3`);
q("B04 sum over empty (grand stamp)", `SELECT COUNT(*) n, ROUND(MIN(s),2) lo, ROUND(MAX(s),2) hi FROM (SELECT SUM(total) OVER () s FROM orders)`);

// ---------- C. LAST_VALUE / FIRST_VALUE default-frame trap ----------
q("C01 last_value default frame", `SELECT id, total, LAST_VALUE(total) OVER (ORDER BY id) lv FROM orders ORDER BY id LIMIT 3`);
q("C02 last_value fixed frame", `SELECT DISTINCT LAST_VALUE(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) lv FROM orders`);
q("C03 first_value default frame", `SELECT DISTINCT FIRST_VALUE(total) OVER (ORDER BY id) fv FROM orders`);
q("C04 order 103 total", `SELECT id, total FROM orders ORDER BY id DESC LIMIT 1`);

// ---------- D. LAG row-based movement / offsets ----------
q("D08 lag shipped_at unfiltered rows 3-7", `SELECT id, shipped_at, LAG(shipped_at) OVER (ORDER BY id) prev FROM orders WHERE id <= 7 ORDER BY id`);
q("D01 lag shipped_at rows 4-7", `SELECT id, shipped_at, LAG(shipped_at) OVER (ORDER BY id) prev FROM orders WHERE id BETWEEN 4 AND 7 ORDER BY id`);
q("D02 lag neg offset rows 1-3", `SELECT id, total, LAG(total, -1) OVER (ORDER BY id) neg FROM orders ORDER BY id LIMIT 3`);
q("D03 lag zero offset row 1", `SELECT id, total, LAG(total, 0) OVER (ORDER BY id) same FROM orders ORDER BY id LIMIT 2`);
q("D04 lag 2 offset rows 1-4", `SELECT id, total, LAG(total, 2) OVER (ORDER BY id) prev2 FROM orders ORDER BY id LIMIT 4`);
q("D05 lag default 0 row 1", `SELECT id, LAG(total, 1, 0) OVER (ORDER BY id) prev FROM orders ORDER BY id LIMIT 2`);
q("D06 lead last row", `SELECT id, LEAD(total) OVER (ORDER BY id) nxt FROM orders ORDER BY id DESC LIMIT 1`);
q("D07 lag partition null census", `SELECT COUNT(*) n FROM (SELECT LAG(total) OVER (PARTITION BY customer_id ORDER BY id) p FROM orders) WHERE p IS NULL`);

// ---------- E. windows see post-WHERE survivors; empty input ----------
q("E01 count over after pending filter", `SELECT COUNT(*) OVER () n FROM orders WHERE status='pending' LIMIT 1`);
q("E02 pending plain count", `SELECT COUNT(*) n FROM orders WHERE status='pending'`);
q("E03 count over after >1000 filter", `SELECT COUNT(*) OVER () n FROM orders WHERE total > 1000 LIMIT 1`);
q("E04 windowed empty input", `SELECT COUNT(*) OVER () n FROM orders WHERE 1=0`);
q("E05 plain aggregate empty input", `SELECT SUM(total) s FROM orders WHERE 1=0`);

// ---------- F. tie census: spend + order totals ----------
q("F01 spend tie census", `SELECT COUNT(*) tie_groups FROM (SELECT SUM(total) s FROM orders GROUP BY customer_id) GROUP BY s HAVING COUNT(*) > 1`);
q("F02 order-total tie census", `SELECT COUNT(*) tie_groups FROM (SELECT total FROM orders) GROUP BY total HAVING COUNT(*) > 1`);
q("F03 three rankers over 16 spenders", `SELECT COUNT(DISTINCT rk) distinct_ranks, MAX(rk) max_rank FROM (SELECT RANK() OVER (ORDER BY s DESC) rk FROM (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id))`);
q("F04 rankers equal check", `SELECT COUNT(*) n FROM (SELECT RANK() OVER (ORDER BY s DESC) rk, DENSE_RANK() OVER (ORDER BY s DESC) drk, ROW_NUMBER() OVER (ORDER BY s DESC) rn FROM (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id)) WHERE rk = drk AND drk = rn`);

// ---------- G. status ties: rank blocks + dense + RANGE folding ----------
q("G01 status census", `SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY status`);
q("G02 status rank blocks", `SELECT DISTINCT RANK() OVER (ORDER BY status) rk, DENSE_RANK() OVER (ORDER BY status) drk, status, COUNT(*) OVER (PARTITION BY status) n FROM orders ORDER BY rk`);
q("G03 count over order by status (RANGE default)", `SELECT DISTINCT status, COUNT(*) OVER (ORDER BY status) running_n FROM orders ORDER BY status`);
q("G04 count over order by status ROWS", `SELECT status, COUNT(*) OVER (ORDER BY status ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) running_n FROM orders ORDER BY id LIMIT 9`);
q("G05 sum over order by status (RANGE default)", `SELECT DISTINCT status, ROUND(SUM(total) OVER (ORDER BY status), 2) running_s FROM orders ORDER BY status`);
q("G06 per-status sums", `SELECT status, ROUND(SUM(total),2) s FROM orders GROUP BY status ORDER BY status`);

// ---------- H. partition constants ----------
q("H01 alice partition stamp", `SELECT COUNT(*) rows_seen, COUNT(DISTINCT c) distinct_vals FROM (SELECT SUM(total) OVER (PARTITION BY customer_id) c FROM orders WHERE customer_id = 1)`);
q("H02 alice total + orders", `SELECT COUNT(*) n, ROUND(SUM(total),2) s FROM orders WHERE customer_id = 1`);
q("H03 count over partition cust alice", `SELECT DISTINCT COUNT(*) OVER (PARTITION BY customer_id) n FROM orders WHERE customer_id = 1`);

// ---------- I. NTILE edge cases ----------
q("I01 ntile4 over 16", `SELECT t, COUNT(*) n FROM (SELECT NTILE(4) OVER (ORDER BY id) t FROM customers) GROUP BY t ORDER BY t`);
q("I02 ntile4 over 103", `SELECT t, COUNT(*) n FROM (SELECT NTILE(4) OVER (ORDER BY id) t FROM orders) GROUP BY t ORDER BY t`);
q("I03 ntile3 over 16", `SELECT t, COUNT(*) n FROM (SELECT NTILE(3) OVER (ORDER BY id) t FROM customers) GROUP BY t ORDER BY t`);
q("I04 ntile5 over 103", `SELECT t, COUNT(*) n FROM (SELECT NTILE(5) OVER (ORDER BY id) t FROM orders) GROUP BY t ORDER BY t`);
q("I05 ntile2.5 over 16", `SELECT t, COUNT(*) n FROM (SELECT NTILE(2.5) OVER (ORDER BY id) t FROM customers) GROUP BY t ORDER BY t`);
q("I06 ntile1 over 103", `SELECT t, COUNT(*) n FROM (SELECT NTILE(1) OVER (ORDER BY id) t FROM orders) GROUP BY t ORDER BY t`);
e("I07 ntile zero", `SELECT NTILE(0) OVER (ORDER BY id) FROM orders LIMIT 1`);
e("I08 ntile negative", `SELECT NTILE(-2) OVER (ORDER BY id) FROM orders LIMIT 1`);

// ---------- J. running totals / running max ----------
q("J01 running total rows 1-3", `SELECT id, total, ROUND(SUM(total) OVER (ORDER BY id), 2) run FROM orders ORDER BY id LIMIT 3`);
q("J02 running total final", `SELECT id, ROUND(SUM(total) OVER (ORDER BY id), 2) run FROM orders ORDER BY id DESC LIMIT 1`);
q("J03 plain grand total", `SELECT ROUND(SUM(total),2) grand FROM orders`);
q("J04 max total + owner", `SELECT id, total FROM orders ORDER BY total DESC LIMIT 1`);
q("J05 running max first hit", `SELECT MIN(id) first_id FROM (SELECT id, MAX(total) OVER (ORDER BY id) m FROM orders) WHERE m = (SELECT MAX(total) FROM orders)`);
q("J06 running max rows 1-2", `SELECT id, ROUND(MAX(total) OVER (ORDER BY id), 2) mx FROM orders ORDER BY id LIMIT 2`);
q("J07 avg over empty", `SELECT ROUND(AVG(total) OVER (), 2) a FROM orders LIMIT 1`);
q("J08 month running total", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, ROUND(SUM(total),2) rev FROM orders GROUP BY mo) SELECT mo, rev, ROUND(SUM(rev) OVER (ORDER BY mo),2) running FROM m ORDER BY mo LIMIT 3`);

// ---------- K. frame grammar probes ----------
q("K01 rows shorthand start only", `SELECT id, ROUND(SUM(total) OVER (ORDER BY id ROWS 1 PRECEDING), 2) s FROM orders ORDER BY id LIMIT 2`);
e("K02 missing BETWEEN", `SELECT SUM(total) OVER (ORDER BY id ROWS 2 PRECEDING AND CURRENT ROW) FROM orders LIMIT 1`);
e("K03 frame before ORDER BY", `SELECT SUM(total) OVER (ROWS BETWEEN 2 PRECEDING AND CURRENT ROW ORDER BY id) FROM orders LIMIT 1`);
e("K04 backwards rows frame", `SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN 2 FOLLOWING AND 1 PRECEDING) FROM orders LIMIT 1`);
e("K05 both-preceding reversed", `SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 2 PRECEDING) FROM orders LIMIT 1`);
e("K06 range offset on text key", `SELECT SUM(total) OVER (ORDER BY status RANGE BETWEEN 1 PRECEDING AND CURRENT ROW) FROM orders LIMIT 1`);
e("K07 lag without over in WHERE", `SELECT id FROM orders WHERE LAG(total) OVER (ORDER BY id) > 0`);

db.close();
rmSync(COPY, { force: true });
console.log("\nDONE m5-facts-d7");
