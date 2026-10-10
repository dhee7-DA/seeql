// M5-D9 probe — engine-verified receipts for the toolkit-capstone drill set.
// Run: bun scripts/m5-facts-d9.ts   (works on a read-only COPY of db/custom.db;
// removes .m5d9.db on exit). Every numeric claim in drills/m5/toolkit-capstone.ts
// must trace to this output.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const TMP = ".m5d9.db";
rmSync(TMP, { force: true });
copyFileSync("db/custom.db", TMP);
const db = new Database(TMP, { readonly: true });

console.log("SQLite", (db.prepare("SELECT sqlite_version() AS v").get() as any).v);

const q = (label: string, sql: string) => {
  console.log(`\n## ${label}\n   ${sql.replace(/\s+/g, " ")}`);
  try {
    const rows = db.prepare(sql).all();
    console.log("   " + JSON.stringify(rows));
  } catch (e) {
    console.log("   ERROR: " + (e as Error).message);
  }
};
const err = (label: string, sql: string) => q("ERR·" + label, sql);

// ---------- schemas ----------
q("ledger columns", "SELECT name FROM pragma_table_info('ledger_entries')");
q("orders columns", "SELECT name FROM pragma_table_info('orders')");

// ---------- month census (slice -> fold) ----------
q("month census: count + spend", `SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n, ROUND(SUM(total),2) spend FROM orders GROUP BY mon ORDER BY mon`);

// ---------- running line (stage -> measure) ----------
q("running line (staged)", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev FROM orders GROUP BY mon) SELECT mon, ROUND(rev,2) rev, ROUND(SUM(rev) OVER (ORDER BY mon),2) running FROM m ORDER BY mon`);
q("grand totals", `SELECT COUNT(*) n, ROUND(AVG(total),2) avg_total, ROUND(MIN(total),2) min_total, ROUND(MAX(total),2) max_total, ROUND(SUM(total),2) sum_total FROM orders`);
q("reconciliation: last running vs plain SUM", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev FROM orders GROUP BY mon), r AS (SELECT ROUND(SUM(rev) OVER (ORDER BY mon),2) last_run FROM m ORDER BY mon DESC LIMIT 1) SELECT last_run, (SELECT ROUND(SUM(total),2) FROM orders) plain_sum FROM r`);
q("one-liner SUM(SUM(total)) OVER", `SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)),2) running FROM orders GROUP BY mon ORDER BY mon`);
q("one-liner with alias inside OVER (leniency check)", `SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(SUM(total)) OVER (ORDER BY mon),2) running FROM orders GROUP BY mon ORDER BY mon LIMIT 2`);
q("OVER () with no ORDER BY = whole-partition frame", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev FROM orders GROUP BY mon), f AS (SELECT SUM(rev) OVER () flat FROM m) SELECT ROUND(MIN(flat),2) lo, ROUND(MAX(flat),2) hi, COUNT(*) n FROM f`);

// ---------- MoM deltas (LAG on the stage) ----------
q("MoM delta line", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev FROM orders GROUP BY mon) SELECT mon, ROUND(rev,2) rev, ROUND(rev - LAG(rev) OVER (ORDER BY mon),2) delta FROM m ORDER BY mon`);
q("extreme deltas + pct", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev FROM orders GROUP BY mon), d AS (SELECT mon, rev, rev - LAG(rev) OVER (ORDER BY mon) delta FROM m) SELECT mon, ROUND(delta,2) delta, ROUND(100.0*delta/(rev-delta),0) pct FROM d WHERE delta IN ((SELECT MIN(delta) FROM d), (SELECT MAX(delta) FROM d)) ORDER BY delta`);

// ---------- shipping speed (julianday + NULL fence) ----------
q("shipping counts", `SELECT COUNT(*) all_orders, SUM(shipped_at IS NULL) unshipped, SUM(shipped_at IS NOT NULL) shipped FROM orders`);
q("shipping lag stats", `SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)),2) avg_lag, MIN(julianday(shipped_at) - julianday(created_at)) min_lag, MAX(julianday(shipped_at) - julianday(created_at)) max_lag, COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL`);
q("lag day distribution", `SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) day, COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL GROUP BY day ORDER BY day`);
q("fractional lags", `SELECT COUNT(*) fractional FROM orders WHERE shipped_at IS NOT NULL AND (julianday(shipped_at) - julianday(created_at)) <> CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER)`);
q("typeof julianday diff", `SELECT typeof(julianday(shipped_at) - julianday(created_at)) t FROM orders WHERE shipped_at IS NOT NULL LIMIT 1`);

// ---------- order rhythm (LAG per customer) ----------
q("alice order count", `SELECT COUNT(*) n FROM orders WHERE customer_id = 1`);
q("alice gaps (first 6)", `SELECT strftime('%Y-%m-%d', created_at) d, CAST(julianday(created_at) - LAG(julianday(created_at)) OVER (ORDER BY created_at, id) AS INTEGER) gap FROM orders WHERE customer_id = 1 ORDER BY created_at, id LIMIT 6`);

// ---------- quartiles (NTILE) ----------
q("NTILE(4) asc over 103 orders", `SELECT t, COUNT(*) n FROM (SELECT NTILE(4) OVER (ORDER BY total) t FROM orders) GROUP BY t ORDER BY t`);
q("NTILE(4) DESC over 103 orders (which tile holds the max)", `SELECT t, COUNT(*) n, ROUND(MIN(total),2) lo, ROUND(MAX(total),2) hi FROM (SELECT NTILE(4) OVER (ORDER BY total DESC) t, total FROM orders) GROUP BY t ORDER BY t`);
q("NTILE(4) over the 14 month buckets", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev FROM orders GROUP BY mon) SELECT t, COUNT(*) n FROM (SELECT NTILE(4) OVER (ORDER BY mon) t FROM m) GROUP BY t ORDER BY t`);

// ---------- bucket-key design ----------
q("SUBSTR key census (identical to strftime?)", `SELECT SUBSTR(created_at,1,7) k, COUNT(*) n FROM orders GROUP BY k ORDER BY k`);
q("bare %m census (cross-year merge)", `SELECT strftime('%m', created_at) k, COUNT(*) n FROM orders GROUP BY k ORDER BY k`);
q("julianday on label vs full date", `SELECT JULIANDAY('2024-01') jd_label, JULIANDAY('2024-01-01') jd_date`);

// ---------- expense ledger (same spine, cents; schema: debit_cents/credit_cents/account) ----------
q("all tables", `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`);
q("ledger sample rows", `SELECT * FROM ledger_entries ORDER BY entry_date, id LIMIT 6`);
q("typeof cents columns", `SELECT typeof(debit_cents) d, typeof(credit_cents) c FROM ledger_entries LIMIT 1`);
q("ledger grand debit/credit", `SELECT ROUND(SUM(debit_cents)/100.0,2) deb, ROUND(SUM(credit_cents)/100.0,2) cred, ROUND(SUM(debit_cents-credit_cents)/100.0,2) net FROM ledger_entries`);
q("ledger accounts (dollars)", `SELECT account k, ROUND(SUM(debit_cents-credit_cents)/100.0,2) total FROM ledger_entries GROUP BY k ORDER BY total DESC`);
q("opex by memo (dollars)", `SELECT memo k, ROUND(SUM(debit_cents)/100.0,2) total FROM ledger_entries WHERE account='operating_expenses' GROUP BY k ORDER BY total DESC`);
q("opex monthly debits (dollars)", `SELECT strftime('%Y-%m', entry_date) mo, ROUND(SUM(debit_cents)/100.0,2) spend FROM ledger_entries WHERE account='operating_expenses' GROUP BY mo ORDER BY mo`);
q("opex monthly RUNNING (dollars)", `WITH e AS (SELECT strftime('%Y-%m', entry_date) mo, SUM(debit_cents) s FROM ledger_entries WHERE account='operating_expenses' GROUP BY mo) SELECT mo, ROUND(SUM(s) OVER (ORDER BY mo)/100.0,2) running FROM e ORDER BY mo`);
q("ledger final rows in running order", `WITH r AS (SELECT entry_date, id, ROUND(SUM(debit_cents-credit_cents) OVER (ORDER BY entry_date, id)/100.0,2) bal FROM ledger_entries) SELECT * FROM r ORDER BY entry_date DESC, id DESC LIMIT 4`);
q("expenses table columns", `SELECT name FROM pragma_table_info('expenses')`);
q("expenses sample", `SELECT * FROM expenses ORDER BY 1 LIMIT 4`);
q("expenses categories (dollars)", `SELECT category k, ROUND(SUM(amount_cents)/100.0,2) total FROM expenses GROUP BY k ORDER BY total DESC`);
q("expenses monthly running (dollars)", `WITH e AS (SELECT strftime('%Y-%m', spent_on) mo, SUM(amount_cents) s FROM expenses GROUP BY mo) SELECT mo, ROUND(SUM(s) OVER (ORDER BY mo)/100.0,2) running FROM e ORDER BY mo`);
q("expenses row count + monthly spends", `SELECT COUNT(*) n FROM expenses`);
q("ledger row count", `SELECT COUNT(*) n FROM ledger_entries`);
q("opex row count", `SELECT COUNT(*) n FROM ledger_entries WHERE account='operating_expenses'`);

// ---------- text polish in the pipeline ----------
q("printf polish pair", `SELECT PRINTF('%.2f', 1088.44) money, PRINTF('%04d', 1) padded, PRINTF('%d', 1) bare`);
q("alice handle", `SELECT SUBSTR(email, 1, INSTR(email,'@')-1) handle, INSTR(email,'@') at_pos FROM customers WHERE id = 1`);
q("domain census", `SELECT COUNT(DISTINCT SUBSTR(email, INSTR(email,'@')+1)) domains, COUNT(*) n FROM customers`);
q("%y-%M demo (wrong codes)", `SELECT created_at ts, strftime('%y-%M', created_at) wrong_codes, strftime('%Y-%m', created_at) good_code FROM orders LIMIT 1`);
q("window fn on the raw table w/o stage: LAG without OVER", `SELECT LAG(total) FROM orders LIMIT 1`);

// ---------- extra census for distractors ----------
q("top months by avg order", `SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n, ROUND(AVG(total),2) avg_order FROM orders GROUP BY mon ORDER BY avg_order DESC LIMIT 4`);
q("thresholds: months >3000 / <2000 / n=9", `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, SUM(total) rev, COUNT(*) n FROM orders GROUP BY mon) SELECT (SELECT COUNT(*) FROM m WHERE rev > 3000) over_3k, (SELECT COUNT(*) FROM m WHERE rev < 2000) under_2k, (SELECT COUNT(*) FROM m WHERE n = 9) nine_months`);
q("year split", `SELECT strftime('%Y', created_at) y, COUNT(*) n, ROUND(SUM(total),2) spend FROM orders GROUP BY y ORDER BY y`);
q("max order lives in", `SELECT strftime('%Y-%m', created_at) mon, ROUND(total,2) total FROM orders ORDER BY total DESC LIMIT 1`);
q("duplicate created_at values", `SELECT COUNT(*) shared_ts FROM (SELECT created_at FROM orders GROUP BY created_at HAVING COUNT(*) > 1)`);

// ---------- verbatim errors ----------
err("rev outside the stage", `SELECT SUM(rev) OVER (ORDER BY mon) FROM orders`);
err("NTILE in WHERE", `SELECT COUNT(*) FROM orders WHERE NTILE(4) OVER (ORDER BY total) = 4`);
err("NTILE(0)", `SELECT NTILE(0) OVER (ORDER BY total) FROM orders LIMIT 1`);
err("OVER misplaced inside LAG args", `SELECT LAG(julianday(created_at) OVER (ORDER BY created_at)) FROM orders LIMIT 1`);
err("GROUP BY aggregate alias", `SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM orders GROUP BY n`);
err("LAG without OVER", `SELECT LAG(total) FROM orders LIMIT 1`);

db.close();
rmSync(TMP, { force: true });
console.log("\n(done — temp db removed)");
