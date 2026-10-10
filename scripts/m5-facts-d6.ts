// M5 FACTS PROBE d6 — Window frames & running totals receipts (db/custom.db, readonly copy).
// Feeds the window-frames drill set (dr5-wf-*). Every numeric claim in the set cites these outputs.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5d6.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string, max = 20) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const shown = rows.slice(0, max).map(r => Object.values(r).map(v =>
      v === null ? "NULL" : typeof v === "number" ? String(v) : String(v)
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

console.log("version:", db.query("SELECT sqlite_version() v").get());

// ================= A — grand totals =================
q("A1 grand stats", `SELECT COUNT(*) n, SUM(total) s, ROUND(AVG(total),2) a, MIN(total) mn, MAX(total) mx FROM orders`);

// ================= B — raw order totals in id order =================
q("B1 totals id 1..10", `SELECT id, total FROM orders ORDER BY id LIMIT 10`);
q("B2 totals id 99..103", `SELECT id, total FROM orders ORDER BY id DESC LIMIT 5`);

// ================= C — running total =================
q("C1 running SUM OVER (ORDER BY id), first 8", `SELECT id, total, ROUND(SUM(total) OVER (ORDER BY id),2) run FROM orders ORDER BY id LIMIT 8`);
q("C2 running raw float id 1..6", `SELECT id, SUM(total) OVER (ORDER BY id) run FROM orders ORDER BY id LIMIT 6`);
q("C3 running tail id 101..103", `SELECT id, ROUND(SUM(total) OVER (ORDER BY id),2) run FROM orders ORDER BY id DESC LIMIT 3`);

// ================= D — moving averages =================
q("D1 movavg 1 PRECEDING raw", `SELECT id, AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) ma FROM orders ORDER BY id LIMIT 5`);
q("D2 movavg 1 PRECEDING rounded", `SELECT id, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW),2) ma FROM orders ORDER BY id LIMIT 5`);
q("D3 movavg 2 PRECEDING raw", `SELECT id, AVG(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) ma FROM orders ORDER BY id LIMIT 5`);
q("D4 movavg 2 PRECEDING rounded", `SELECT id, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW),2) ma FROM orders ORDER BY id LIMIT 5`);

// ================= E — "everything before me" frames =================
q("E1 AVG UNBOUNDED PRECEDING AND 1 PRECEDING raw", `SELECT id, AVG(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) v FROM orders ORDER BY id LIMIT 4`);
q("E2 SUM UNBOUNDED PRECEDING AND 1 PRECEDING raw", `SELECT id, SUM(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) v FROM orders ORDER BY id LIMIT 5`);

// ================= F — tail frame =================
q("F1 SUM CURRENT ROW AND UNBOUNDED FOLLOWING raw", `SELECT id, SUM(total) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) v FROM orders ORDER BY id LIMIT 4`);

// ================= G — default frame equivalence =================
q("G1 default vs explicit RANGE — mismatch count", `SELECT COUNT(*) n FROM (SELECT SUM(total) OVER (ORDER BY id) a, SUM(total) OVER (ORDER BY id RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) b FROM orders) WHERE a != b`);
q("G2 single-bound shorthand vs default — mismatch count", `SELECT COUNT(*) n FROM (SELECT SUM(total) OVER (ORDER BY id) a, SUM(total) OVER (ORDER BY id ROWS UNBOUNDED PRECEDING) b FROM orders) WHERE a != b`);

// ================= H — LAST_VALUE / FIRST_VALUE =================
q("H1 LAST_VALUE default frame", `SELECT id, total, LAST_VALUE(total) OVER (ORDER BY id) lv FROM orders ORDER BY id LIMIT 4`);
q("H2 LAST_VALUE full frame distinct", `SELECT DISTINCT LAST_VALUE(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) lv FROM orders`);
q("H3 FIRST_VALUE asc distinct", `SELECT DISTINCT FIRST_VALUE(total) OVER (ORDER BY id) fv FROM orders`);
q("H4 FIRST_VALUE desc distinct", `SELECT DISTINCT FIRST_VALUE(total) OVER (ORDER BY id DESC) fv FROM orders`);

// ================= I — partition constants =================
q("I1 AVG OVER (PARTITION BY region) distinct", `SELECT DISTINCT region, ROUND(AVG(total) OVER (PARTITION BY region),2) a FROM orders o JOIN customers c ON c.id = o.customer_id`);
q("I2 SUM OVER (PARTITION BY customer_id) — Alice", `SELECT COUNT(*) n, COUNT(DISTINCT s) d, MIN(s) mn FROM (SELECT SUM(total) OVER (PARTITION BY customer_id) s FROM orders WHERE customer_id = 1)`);
q("I3 Alice grand share", `SELECT ROUND(100.0 * 7262.35 / 34833.28, 2) pct`);
q("I4 COUNT(*) OVER (PARTITION BY region) distinct", `SELECT DISTINCT region, COUNT(*) OVER (PARTITION BY region) n FROM orders o JOIN customers c ON c.id = o.customer_id`);
q("I5 SUM(total) OVER () distinct", `SELECT DISTINCT SUM(total) OVER () s FROM orders`);
q("I6 COUNT(*) OVER () distinct", `SELECT DISTINCT COUNT(*) OVER () n FROM orders`);

// ================= J — window after WHERE =================
q("J1 pending crowd COUNT(*) OVER ()", `SELECT COUNT(*) n, COUNT(DISTINCT COUNT(*) OVER ()) d, MIN(COUNT(*) OVER ()) mn, MAX(COUNT(*) OVER ()) mx FROM orders WHERE status = 'pending'`);

// ================= K — per-customer running =================
q("K1 Alice running (PARTITION BY customer_id ORDER BY id)", `SELECT id, total, ROUND(SUM(total) OVER (PARTITION BY customer_id ORDER BY id),2) run FROM orders WHERE customer_id = 1 ORDER BY id LIMIT 6`);
q("K2 Alice own totals", `SELECT id, total FROM orders WHERE customer_id = 1 ORDER BY id LIMIT 6`);

// ================= L — empty input =================
q("L1 window on empty input", `SELECT COUNT(*) n FROM (SELECT SUM(total) OVER () s FROM orders WHERE 1 = 0)`);
q("L2 empty window query direct", `SELECT SUM(total) OVER () s FROM orders WHERE 1 = 0`);

// ================= M — RANGE vs ROWS on tied keys (calendar day) =================
q("M1 day census head", `SELECT date(created_at) d, COUNT(*) n, ROUND(SUM(total),2) daysum FROM orders GROUP BY d ORDER BY d LIMIT 6`);
q("M2 RANGE vs ROWS running over date(created_at)", `SELECT id, date(created_at) d, ROUND(SUM(total) OVER (ORDER BY date(created_at)),2) range_run, ROUND(SUM(total) OVER (ORDER BY date(created_at) ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW),2) rows_run FROM orders ORDER BY id LIMIT 12`);

// ================= N — expense running line =================
q("N1 expense month sums", `SELECT strftime('%Y-%m', spent_on) mo, SUM(amount_cents)/100 amt FROM expenses GROUP BY mo ORDER BY mo LIMIT 6`);
q("N2 expense running SUM OVER (ORDER BY mo)", `SELECT mo, ROUND(SUM(amt) OVER (ORDER BY mo),2) run FROM (SELECT strftime('%Y-%m', spent_on) mo, SUM(amount_cents)/100.0 amt FROM expenses GROUP BY mo) ORDER BY mo LIMIT 6`);
q("N3 expense running in cents", `SELECT mo, SUM(amt_cents) OVER (ORDER BY mo) run_cents FROM (SELECT strftime('%Y-%m', spent_on) mo, SUM(amount_cents) amt_cents FROM expenses GROUP BY mo) ORDER BY mo LIMIT 6`);

// ================= O — % of grand total =================
q("O1 share of total, first 4", `SELECT id, ROUND(100.0 * total / SUM(total) OVER (), 2) pct FROM orders ORDER BY id LIMIT 4`);

// ================= P — region-partition running restart =================
q("P1 partition running restart", `SELECT o.id, c.region, ROUND(SUM(total) OVER (PARTITION BY region ORDER BY o.id),2) run FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY o.id LIMIT 10`);

// ================= Q — duplicate totals (tie check) =================
q("Q1 any duplicate totals?", `SELECT total, COUNT(*) n FROM orders GROUP BY total HAVING n > 1 LIMIT 5`);

// ================= R — error receipts =================
e("R1 ROWS 2 FOLLOWING AND 1 PRECEDING", `SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN 2 FOLLOWING AND 1 PRECEDING) FROM orders`);
e("R2 ROWS CURRENT ROW AND UNBOUNDED PRECEDING", `SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND UNBOUNDED PRECEDING) FROM orders`);
e("R3 ORDER BY before PARTITION BY inside OVER", `SELECT SUM(total) OVER (ORDER BY id PARTITION BY customer_id) FROM orders`);
e("R4 window function in WHERE", `SELECT id FROM orders WHERE COUNT(*) OVER () > 1`);
e("R5 RANGE 1 PRECEDING without ORDER BY", `SELECT SUM(total) OVER (RANGE BETWEEN 1 PRECEDING AND CURRENT ROW) FROM orders`);
e("R6 RANGE 1 PRECEDING with text ORDER BY", `SELECT SUM(total) OVER (ORDER BY created_at RANGE BETWEEN 1 PRECEDING AND CURRENT ROW) FROM orders`);
e("R7 OVER without parens", `SELECT SUM(total) OVER ORDER BY id FROM orders`);
e("R8 ROWS 1 PRECEDING without ORDER BY", `SELECT SUM(total) OVER (ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) FROM orders`);
e("R9 duplicate frame bounds order (1 PRECEDING AND 2 PRECEDING)", `SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 2 PRECEDING) FROM orders`);
e("R10 PARTITION BY with empty list", `SELECT SUM(total) OVER (PARTITION BY ORDER BY id) FROM orders`);
e("R11 window inside plain aggregate arg", `SELECT SUM(SUM(total) OVER ()) FROM orders`);

// ================= round 2 — follow-ups =================
console.log("\n===== ROUND 2 =====");

// window after WHERE (clean form, no implicit grouping)
q("S1 pending crowd with COUNT(*) OVER ()", `SELECT COUNT(*) OVER () c FROM orders WHERE status = 'pending'`, 3);
q("S2 status census", `SELECT status, COUNT(*) n FROM orders GROUP BY status`);

// error-text confirmations for distractors
e("S3 ROWS BETWEEN 2 FOLLOWING AND CURRENT ROW", `SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN 2 FOLLOWING AND CURRENT ROW) FROM orders`);
e("S4 ROWS 2 PRECEDING AND CURRENT ROW (no BETWEEN)", `SELECT SUM(total) OVER (ORDER BY id ROWS 2 PRECEDING AND CURRENT ROW) FROM orders`);
e("S5 ORDER BY id BETWEEN ... (missing ROWS keyword)", `SELECT SUM(total) OVER (ORDER BY id BETWEEN 2 PRECEDING AND CURRENT ROW) FROM orders`);
e("S6 1 PRECEDING AND 2 PRECEDING (tolerated — avoid as distractor)", `SELECT id, SUM(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 2 PRECEDING) v FROM orders ORDER BY id LIMIT 3`);

// running average / count with default frame
q("S7 running AVG default frame", `SELECT id, ROUND(AVG(total) OVER (ORDER BY id),2) ra FROM orders ORDER BY id LIMIT 4`);
q("S8 running COUNT", `SELECT id, COUNT(*) OVER (ORDER BY id) rc FROM orders ORDER BY id LIMIT 3`);

// partition count for Alice; row preservation; rounded before-frames
q("S9 Alice partition count distinct", `SELECT DISTINCT COUNT(*) OVER (PARTITION BY customer_id) n FROM orders WHERE customer_id = 1`);
q("S10 window row preservation", `SELECT COUNT(*) n FROM (SELECT id, SUM(total) OVER () s FROM orders)`);
q("S11 before-AVG rounded", `SELECT id, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING),2) v FROM orders ORDER BY id LIMIT 4`);
q("S12 before-SUM rounded", `SELECT id, ROUND(SUM(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING),2) v FROM orders ORDER BY id LIMIT 4`);

// expense grand total (sum of staged month sums = 25416) + Alice running endpoint
q("S13 expense grand total", `SELECT SUM(amount_cents)/100 total FROM expenses`);
q("S14 Alice running last", `SELECT ROUND(SUM(total) OVER (PARTITION BY customer_id ORDER BY id),2) run FROM orders WHERE customer_id = 1 ORDER BY id DESC LIMIT 1`);

// RANGE offset on numeric id — no error, equals ROWS on tie-free keys
q("S15 RANGE 1 PRECEDING on id", `SELECT id, ROUND(AVG(total) OVER (ORDER BY id RANGE BETWEEN 1 PRECEDING AND CURRENT ROW),2) v FROM orders ORDER BY id LIMIT 4`);

db.close();
rmSync(COPY);
console.log("\nprobe done, copy removed");
