// M5 FACTS PROBE w5b — addendum receipts for cases-w5.ts distractor claims and
// products-based re-points. Same pattern as m5-facts-w5.ts: readonly COPY of
// db/custom.db, self-deleting. Run: bun scripts/m5-facts-w5b.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w5b.db";
rmSync(COPY, { force: true });
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

// P1 — products FIRST_VALUE anchors (cs-1372 re-point to catalog/products)
q("P1 FIRST_VALUE(price) DESC/ASC at ids 1,16", `WITH f AS (SELECT id, name, price, FIRST_VALUE(price) OVER (ORDER BY id DESC) a_desc, FIRST_VALUE(price) OVER (ORDER BY id ASC) a_asc FROM products) SELECT id, name, price, ROUND(a_desc,2) a_desc, ROUND(a_asc,2) a_asc FROM f WHERE id IN (1, 16) ORDER BY id`);

// P2/P3 — products prior-frame (cs-1388 re-point to catalog/products)
q("P2 prior stock frame ids 1,2,3,16", `WITH w AS (SELECT id, name, stock, SUM(stock) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) prior FROM products) SELECT id, name, stock, prior FROM w WHERE id IN (1,2,3,16) ORDER BY id`);
q("P3a prior with 2 PRECEDING at id3", `WITH w AS (SELECT id, SUM(stock) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 2 PRECEDING) prior FROM products) SELECT id, prior FROM w WHERE id = 3`);
q("P3b prior with 0 PRECEDING at id3 (legality+value)", `WITH w AS (SELECT id, SUM(stock) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 0 PRECEDING) prior FROM products) SELECT id, prior FROM w WHERE id = 3`);
q("P3c prior COUNT variant at ids 1,3", `WITH w AS (SELECT id, COUNT(stock) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) prior FROM products) SELECT id, prior FROM w WHERE id IN (1,3) ORDER BY id`);

// P4 — region running sets: does 852.44 appear outside LATAM (cs-1384 'US' distractor safety)
q("P4 region runs containing 852.44", `WITH w AS (SELECT o.id, c.region, SUM(o.total) OVER (PARTITION BY c.region ORDER BY o.id) run FROM orders o JOIN customers c ON c.id = o.customer_id) SELECT region, COUNT(*) n, SUM(ABS(run - 852.44) < 0.005) hits_852, MIN(ROUND(run,2)) min_run, MAX(ROUND(run,2)) max_run FROM w GROUP BY region ORDER BY region`);

// P5 — ma3 alternatives at March (cs-1366 distractors)
q("P5 ma3 alt frames at 2024-03", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon), w AS (SELECT mon, ROUND(AVG(n) OVER (ORDER BY mon ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING), 2) ma_fwd, ROUND(AVG(n) OVER (ORDER BY mon ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) ma2 FROM m) SELECT mon, ma_fwd, ma2 FROM w WHERE mon = '2024-03'`);

// P6 — products unwind 1 PRECEDING start at id16 (cs-1373 distractor)
q("P6 products 1 PRECEDING AND UNBOUNDED FOLLOWING at id16", `WITH r AS (SELECT id, stock, SUM(stock) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND UNBOUNDED FOLLOWING) rem FROM products) SELECT id, rem FROM r WHERE id = 16`);

// P7 — band alternates at id3 (cs-1380 distractors)
q("P7a band CURRENT ROW AND 1 FOLLOWING at id3", `WITH w AS (SELECT id, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND 1 FOLLOWING), 2) band FROM orders) SELECT id, band FROM w WHERE id = 3`);
e("P7b UNBOUNDED FOLLOWING as start bound", `SELECT id, AVG(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED FOLLOWING AND CURRENT ROW) b FROM orders`);
q("P7c band UNBOUNDED PRECEDING AND 1 FOLLOWING at id3", `WITH w AS (SELECT id, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 FOLLOWING), 2) band FROM orders) SELECT id, band FROM w WHERE id = 3`);
q("P7d band at ids 2,4 (CTE-wrapped 1P/1F)", `WITH w AS (SELECT id, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING), 2) band FROM orders) SELECT id, band FROM w WHERE id IN (2,4) ORDER BY id`);

// P8 — expenses frame variants at Feb (cs-1386 distractors)
q("P8 expenses frame variants at 2024-02", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents)/100.0 AS spend FROM expenses GROUP BY mo), w AS (SELECT mo, ROUND(SUM(spend) OVER (ORDER BY mo ROWS BETWEEN 1 FOLLOWING AND UNBOUNDED FOLLOWING), 2) r_fwd, ROUND(SUM(spend) OVER (ORDER BY mo ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING), 2) r_all, ROUND(SUM(spend) OVER (ORDER BY mo ROWS BETWEEN 1 PRECEDING AND UNBOUNDED FOLLOWING), 2) r_1p FROM m) SELECT mo, r_fwd, r_all, r_1p FROM w WHERE mo = '2024-02'`);

// P9 — month roll UNBOUNDED at June (cs-1385 distractor)
q("P9 month roll UNBOUNDED PRECEDING line head+June", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon), w AS (SELECT mon, n, SUM(n) OVER (ORDER BY mon ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) roll FROM m) SELECT mon, n, roll FROM w WHERE mon IN ('2024-01','2024-06') ORDER BY mon`);

// P10 — signup cum ORDER BY n variant (cs-1361 'n' distractor landing)
q("P10 signup cum ORDER BY n, cum=16 row", `WITH s AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM customers GROUP BY mon), c AS (SELECT mon, n, SUM(n) OVER (ORDER BY n) AS cum FROM s) SELECT mon, n, cum FROM c WHERE cum = 16`);

// P11 — cs-1355 COUNT-paint variant rows at ids 1..3
q("P11 share with COUNT(total) OVER () denominator", `WITH s AS (SELECT id, total, ROUND(100.0 * total / COUNT(total) OVER (), 2) AS share FROM orders) SELECT id, total, share FROM s WHERE id <= 3 ORDER BY share DESC`);

// P12 — MAX-paint variants (cs-1357/1360 distractors)
q("P12a price share MAX paint at id16", `WITH p AS (SELECT id, ROUND(100.0 * price / MAX(price) OVER (), 2) AS share FROM products) SELECT id, share FROM p WHERE id = 16`);
q("P12b stock share MAX paint at id9", `WITH p AS (SELECT id, ROUND(100.0 * stock / MAX(stock) OVER (), 2) AS share FROM products) SELECT id, share FROM p WHERE id = 9`);

// P13 — cs-1364 GROUP BY c.id landing row
q("P13 region census folded by c.id, top by n", `SELECT c.region, COUNT(*) AS n, SUM(COUNT(*)) OVER () AS all_orders FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY n DESC LIMIT 1`);

// P14 — cs-1370 constant-pile variant
q("P14 SUM(695) OVER () as all_stock", `SELECT supplier_id, SUM(stock) AS stock_sum, SUM(695) OVER () AS all_stock FROM products GROUP BY supplier_id ORDER BY stock_sum DESC LIMIT 1`);

// P15/P16 — delivered/shipped walk pins (cs-1376 distractors)
q("P15 delivered walk: any rung 1977.74 under AVG?", `WITH d AS (SELECT id, total, ROUND(AVG(total) OVER (ORDER BY id), 2) AS run FROM orders WHERE status = 'delivered') SELECT COUNT(*) n FROM d WHERE run = 1977.74`);
q("P16a shipped walk at 1977.74", `WITH d AS (SELECT id, total, ROUND(SUM(total) OVER (ORDER BY id), 2) AS run FROM orders WHERE status = 'shipped') SELECT COUNT(*) n FROM d WHERE run = 1977.74`);
q("P16b shipped top-3 by total", `SELECT id, total FROM orders WHERE status = 'shipped' ORDER BY total DESC LIMIT 3`);

// P17 — cs-1377 ROWS landing at ids 5,7 (CTE-wrapped)
q("P17 ROWS running by created_at at ids 5,7", `WITH w AS (SELECT id, total, SUM(total) OVER (ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run FROM orders) SELECT id, ROUND(total,2) total, ROUND(run,2) run FROM w WHERE id IN (5,7) ORDER BY id`);

// P20 — partition walked at ids 100,101 (cs-1387)
q("P20 walked rungs at ids 100,101,103", `WITH w AS (SELECT id, customer_id, COUNT(*) OVER (PARTITION BY customer_id ORDER BY id) AS walked FROM orders) SELECT id, customer_id, walked FROM w WHERE id IN (100,101,103) ORDER BY id`);

// P21 — running COUNT at id 102 (cs-1362 distractor claim)
q("P21 running COUNT at id 102", `WITH w AS (SELECT id, COUNT(*) OVER (ORDER BY id) AS walked FROM orders) SELECT id, walked FROM w WHERE id = 102`);

// P25 — ORDER BY SUM inside OVER (cs-1361 distractor path)
e("P25 ORDER BY SUM inside OVER", `WITH s AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM customers GROUP BY mon) SELECT mon, SUM(n) OVER (ORDER BY SUM) cum FROM s`);

// P26 — MAX(*) verbatim error (cs-1359 distractor)
e("P26 MAX(*) invalid", `SELECT MAX(*) FROM products`);

// P28 — Alice partition under AVG last rung (cs-1383 distractor)
q("P28 Alice AVG-partition last rung", `WITH a AS (SELECT id, ROUND(AVG(total) OVER (PARTITION BY customer_id ORDER BY id), 2) AS run FROM orders WHERE customer_id = 1) SELECT id, run FROM a ORDER BY id DESC LIMIT 1`);

// P30 — cs-1354 'shipped' variant top rows (consequence citation)
q("P30 shipped crowd/pot", `SELECT COUNT(*) crowd, ROUND(SUM(total) OVER (), 2) pot FROM orders WHERE status = 'shipped' LIMIT 1`);

// P31 — cs-1358 MAX/COUNT variants at id16 (consequence values)
q("P31 stock walk MAX/COUNT at id16", `WITH w AS (SELECT id, MAX(stock) OVER (ORDER BY id) mx, COUNT(stock) OVER (ORDER BY id) ct FROM products) SELECT id, mx, ct FROM w WHERE id = 16`);

// P32 — cs-1365 MAX/AVG rungs at Feb (consequence values)
q("P32 month walk MAX/AVG at 2024-02", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev FROM orders GROUP BY mon), r AS (SELECT mon, MAX(rev) OVER (ORDER BY mon) mx, ROUND(AVG(rev) OVER (ORDER BY mon), 2) av FROM m) SELECT mon, mx, av FROM r WHERE mon = '2024-02'`);

// P33 — cs-1374 MAX rung at May (consequence value)
q("P33 expense walk MAX at 2024-05", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents)/100.0 AS spend FROM expenses GROUP BY mo), r AS (SELECT mo, ROUND(MAX(spend) OVER (ORDER BY mo), 2) mx FROM m) SELECT mo, mx FROM r WHERE mo = '2024-05'`);

// P34 — cs-1381 'cancelled' paint values (consequence citation)
q("P34 cancelled crowd/pot", `SELECT COUNT(*) crowd, ROUND(SUM(total) OVER (), 2) pot FROM orders WHERE status = 'cancelled' LIMIT 1`);

// P35 — cs-1378 default-frame lv at id 103 (both frames agree)
q("P35 LAST_VALUE frames at id 103", `WITH d AS (SELECT id, total, ROUND(LAST_VALUE(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING), 2) lv_full, ROUND(LAST_VALUE(total) OVER (ORDER BY id), 2) lv_def FROM orders) SELECT id, lv_full, lv_def FROM d WHERE id = 103`);

// P36 — cs-1383 Bruno/Emma rung tails (distractor citations)
q("P36 partition run tails for customers 2,5", `WITH w AS (SELECT customer_id, id, ROUND(SUM(total) OVER (PARTITION BY customer_id ORDER BY id), 2) AS run FROM orders WHERE customer_id IN (2, 5)) SELECT customer_id, MAX(id) last_id, MAX(run) tail FROM w GROUP BY customer_id ORDER BY customer_id`);

// P37 — expense unwind line (cs-1386 re-point to expenses)
q("P37 expense unwind line (CURRENT ROW AND UNBOUNDED FOLLOWING)", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents)/100.0 AS spend FROM expenses GROUP BY mo) SELECT mo, spend, ROUND(SUM(spend) OVER (ORDER BY mo ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING), 2) remaining FROM m ORDER BY mo`);
// P38 — expense unwind with 1 FOLLOWING end at Feb (cs-1386 distractor landing)
q("P38 expense unwind 1 FOLLOWING end at Feb", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents)/100.0 AS spend FROM expenses GROUP BY mo), w AS (SELECT mo, ROUND(SUM(spend) OVER (ORDER BY mo ROWS BETWEEN CURRENT ROW AND 1 FOLLOWING), 2) remaining FROM m) SELECT mo, remaining FROM w WHERE mo = '2024-02'`);

rmSync(COPY, { force: true });
console.log("\nprobe w5b done, copy removed");
