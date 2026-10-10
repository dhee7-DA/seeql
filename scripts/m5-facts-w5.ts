// M5 FACTS PROBE w5 — Frames & running case wave (cs-1353..1388), readonly COPY of db/custom.db.
// Every numeric claim in cases-w5.ts must trace to this output. Run: bun scripts/m5-facts-w5.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w5.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string, max = 30) {
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

console.log("version:", JSON.stringify(db.query("SELECT sqlite_version() v").get()));

// ============ A — case fills (exact filled templates) ============
const fills: Array<[string, string]> = [
  ["cs-1353 fill", `SELECT id, total, ROUND(SUM(total) OVER (ORDER BY id), 2) AS running FROM orders ORDER BY id DESC LIMIT 1`],
  ["cs-1354 fill", `SELECT id, total, COUNT(*) OVER () AS crowd, ROUND(SUM(total) OVER (), 2) AS pot FROM orders WHERE status = 'pending' ORDER BY total DESC LIMIT 3`],
  ["cs-1355 fill", `SELECT id, total, ROUND(100.0 * total / SUM(total) OVER (), 2) AS share FROM orders WHERE id <= 3 ORDER BY share DESC`],
  ["cs-1356 fill", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents)/100.0 AS spend FROM expenses GROUP BY mo), p AS (SELECT mo, spend, SUM(spend) OVER () AS grand FROM m) SELECT mo, spend, ROUND(grand, 2) AS grand FROM p WHERE spend = 3210`],
  ["cs-1357 fill", `SELECT id, name, ROUND(100.0 * price / SUM(price) OVER (), 2) AS share FROM products WHERE id = 16`],
  ["cs-1358 fill", `SELECT id, name, stock, SUM(stock) OVER (ORDER BY id) AS running_stock FROM products ORDER BY id DESC LIMIT 1`],
  ["cs-1359 fill", `SELECT s.name, s.rating, COUNT(*) AS n, SUM(COUNT(*)) OVER () AS items FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY s.id LIMIT 1`],
  ["cs-1360 fill", `SELECT id, name, ROUND(100.0 * stock / SUM(stock) OVER (), 2) AS share FROM products WHERE id = 9`],
  ["cs-1361 fill", `WITH s AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM customers GROUP BY mon), c AS (SELECT mon, n, SUM(n) OVER (ORDER BY mon) AS cum FROM s) SELECT mon, n, cum FROM c WHERE cum = 16`],
  ["cs-1362 fill", `SELECT id, total, COUNT(*) OVER (ORDER BY id) AS walked FROM orders ORDER BY id DESC LIMIT 1`],
  ["cs-1363 fill", `WITH c AS (SELECT id, total, ROUND(100.0 * total / SUM(total) OVER (), 1) AS share FROM orders WHERE status = 'cancelled') SELECT id, ROUND(total, 2) AS total, share FROM c WHERE share = 34.5`],
  ["cs-1364 fill", `SELECT c.region, COUNT(*) AS n, SUM(COUNT(*)) OVER () AS all_orders FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY n DESC LIMIT 1`],
  ["cs-1365 fill", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev FROM orders GROUP BY mon), r AS (SELECT mon, rev, SUM(rev) OVER (ORDER BY mon) AS running FROM m) SELECT mon, rev, ROUND(running, 2) AS running FROM r WHERE mon = '2024-02' AND ROUND(running, 2) = 7341.61`],
  ["cs-1366 fill", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon), w AS (SELECT mon, n, ROUND(AVG(n) OVER (ORDER BY mon ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3 FROM m) SELECT mon, n, ma3 FROM w WHERE mon = '2024-03' AND ma3 = 8.33`],
  ["cs-1367 fill", `WITH x AS (SELECT c.name, ROUND(SUM(o.total), 2) AS exposure FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status IN ('cancelled', 'pending') GROUP BY c.id), s AS (SELECT name, exposure, ROUND(100.0 * exposure / SUM(exposure) OVER (), 1) AS pct FROM x) SELECT name, exposure, pct FROM s WHERE pct = 22.2`],
  ["cs-1368 fill", `WITH s AS (SELECT c.name, ROUND(SUM(o.total), 2) AS spend, ROUND(100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (), 2) AS pct FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id) SELECT name, spend, pct FROM s WHERE pct = 20.85 ORDER BY spend DESC`],
  ["cs-1369 fill", `WITH r AS (SELECT id, total, SUM(total) OVER (ORDER BY id) AS run FROM orders) SELECT id, total, run FROM r WHERE id <= 3`],
  ["cs-1370 fill", `SELECT supplier_id, SUM(stock) AS stock_sum, SUM(SUM(stock)) OVER () AS all_stock FROM products GROUP BY supplier_id ORDER BY stock_sum DESC LIMIT 1`],
  ["cs-1371 fill", `WITH c AS (SELECT category, ROUND(SUM(price), 2) AS cat_price, ROUND(100.0 * SUM(price) / SUM(SUM(price)) OVER (), 1) AS pct FROM products GROUP BY category) SELECT category, cat_price, pct FROM c WHERE pct = 28.6`],
  ["cs-1372 fill", `WITH f AS (SELECT id, total, FIRST_VALUE(total) OVER (ORDER BY id DESC) AS anchor FROM orders) SELECT id, ROUND(total, 2) AS total, ROUND(anchor, 2) AS anchor FROM f WHERE id = 103`],
  ["cs-1373 fill", `WITH r AS (SELECT id, name, stock, SUM(stock) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) AS remaining FROM products) SELECT id, name, stock, remaining FROM r WHERE id = 16`],
  ["cs-1374 fill", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents)/100.0 AS spend FROM expenses GROUP BY mo), r AS (SELECT mo, spend, ROUND(SUM(spend) OVER (ORDER BY mo), 2) AS running FROM m) SELECT mo, spend, running FROM r WHERE running = 8305`],
  ["cs-1375 fill", `WITH r AS (SELECT c.region AS region, COUNT(*) AS n, ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region) SELECT region, n, pct FROM r WHERE pct = 43.7 ORDER BY n DESC`],
  ["cs-1376 fill", `WITH d AS (SELECT id, total, ROUND(SUM(total) OVER (ORDER BY id), 2) AS run FROM orders WHERE status = 'delivered') SELECT id, total, run FROM d WHERE run = 1977.74`],
  ["cs-1377 fill", `WITH w AS (SELECT id, total, SUM(total) OVER (ORDER BY created_at RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run FROM orders) SELECT id, ROUND(total, 2) AS total, ROUND(run, 2) AS run FROM w WHERE id = 5 AND ROUND(run, 2) = 1630.82`],
  ["cs-1378 fill", `WITH d AS (SELECT id, total, LAST_VALUE(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lv FROM orders) SELECT id, ROUND(total, 2) AS total, ROUND(lv, 2) AS lv FROM d WHERE id = 1 AND ROUND(lv, 2) = 324.16`],
  ["cs-1379 fill", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev FROM orders GROUP BY mon), r AS (SELECT mon, rev, SUM(rev) OVER (ORDER BY mon RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running FROM m) SELECT mon, rev, ROUND(running, 2) AS running FROM r WHERE mon = '2024-03' AND ROUND(running, 2) = 9958.69`],
  ["cs-1380 fill", `WITH w AS (SELECT id, total, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING), 2) AS band FROM orders) SELECT id, total, band FROM w WHERE id = 3 AND band = 447.64`],
  ["cs-1381 fill", `WITH w AS (SELECT id, status, COUNT(*) OVER () AS seen, SUM(total) OVER () AS pot FROM orders WHERE status = 'pending') SELECT id, status, seen, ROUND(pot, 2) AS pot FROM w WHERE seen = 14 LIMIT 3`],
  ["cs-1382 fill", `WITH s AS (SELECT c.name, ROUND(SUM(o.total), 2) AS spend, ROUND(100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (), 2) AS pct FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id), t AS (SELECT name, spend, pct, RANK() OVER (ORDER BY spend DESC) AS rk FROM s) SELECT name, spend, pct, rk FROM t WHERE pct = 20.85 AND rk = 1`],
  ["cs-1383 fill", `WITH a AS (SELECT customer_id, id, total, SUM(total) OVER (PARTITION BY customer_id ORDER BY id) AS run FROM orders WHERE customer_id = 1) SELECT customer_id, id, ROUND(total, 2) AS total, ROUND(run, 2) AS run FROM a WHERE ROUND(run, 2) = 7262.35`],
  ["cs-1384 fill", `WITH w AS (SELECT o.id, c.region, o.total, SUM(o.total) OVER (PARTITION BY c.region ORDER BY o.id) AS run FROM orders o JOIN customers c ON c.id = o.customer_id) SELECT id, region, ROUND(total, 2) AS total, ROUND(run, 2) AS run FROM w WHERE region = 'LATAM' AND ROUND(run, 2) = 852.44`],
  ["cs-1385 fill", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon), w AS (SELECT mon, n, SUM(n) OVER (ORDER BY mon ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS roll FROM m) SELECT mon, n, roll FROM w WHERE mon = '2024-06' AND roll = 14`],
  ["cs-1386 fill", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS spend FROM orders GROUP BY mon), w AS (SELECT mon, spend, ROUND(SUM(spend) OVER (ORDER BY mon ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING), 2) AS remaining FROM m) SELECT mon, spend, remaining FROM w WHERE mon = '2024-02' AND remaining = 31101.31`],
  ["cs-1387 fill", `WITH w AS (SELECT id, customer_id, COUNT(*) OVER (PARTITION BY customer_id ORDER BY id) AS walked FROM orders) SELECT id, customer_id, walked FROM w WHERE id = 100 AND walked = 24`],
  ["cs-1388 fill", `WITH w AS (SELECT id, total, SUM(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS prior FROM orders) SELECT id, ROUND(total, 2) AS total, prior FROM w WHERE id = 1 AND prior IS NULL`],
];
for (const [label, sql] of fills) q(label, sql, 6);

// ============ B — cited figure lines ============
q("B1 signup cum line (cs-1361)", `WITH s AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM customers GROUP BY mon) SELECT mon, n, SUM(n) OVER (ORDER BY mon) cum FROM s ORDER BY mon`);
q("B2 signup cum=n rows (cs-1361 distractor n)", `WITH s AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM customers GROUP BY mon), c AS (SELECT mon, n, SUM(n) OVER (ORDER BY n) AS cum FROM s) SELECT mon, n, cum FROM c WHERE cum = n`);
q("B3 ma3 line head (cs-1366)", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon) SELECT mon, n, ROUND(AVG(n) OVER (ORDER BY mon ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) ma3 FROM m ORDER BY mon LIMIT 5`);
q("B4 ma3 March under 1P/3P frames (cs-1366 distractors)", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon) SELECT mon, ROUND(AVG(n) OVER (ORDER BY mon ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) ma2, ROUND(AVG(n) OVER (ORDER BY mon ROWS BETWEEN 3 PRECEDING AND CURRENT ROW), 2) ma4 FROM m WHERE mon = '2024-03'`);
q("B5 month roll 1P line (cs-1385)", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon) SELECT mon, n, SUM(n) OVER (ORDER BY mon ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) roll FROM m ORDER BY mon`);
q("B6 month roll 2P at June (cs-1385 distractor)", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon) SELECT mon, SUM(n) OVER (ORDER BY mon ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) roll3 FROM m WHERE mon = '2024-06'`);
q("B7 month unwind line (cs-1386)", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS spend FROM orders GROUP BY mon) SELECT mon, spend, ROUND(SUM(spend) OVER (ORDER BY mon ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING), 2) remaining FROM m ORDER BY mon`);
q("B8 unwind Feb under default frame (cs-1386 distractor)", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS spend FROM orders GROUP BY mon) SELECT mon, ROUND(SUM(spend) OVER (ORDER BY mon), 2) run FROM m WHERE mon = '2024-02'`);
q("B9 stock walk head/tail + total (cs-1358)", `SELECT id, name, stock, SUM(stock) OVER (ORDER BY id) running_stock FROM products ORDER BY id LIMIT 3`);
q("B10 stock reverse remaining head (cs-1373)", `SELECT id, name, stock, SUM(stock) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) remaining FROM products ORDER BY id LIMIT 3`);
q("B11 stock remaining id16 default-frame (cs-1373 distractor)", `SELECT id, stock, SUM(stock) OVER (ORDER BY id) running FROM products WHERE id = 16`);
q("B12 product price total + shares (cs-1357/1360)", `SELECT id, name, price, ROUND(100.0*price/SUM(price) OVER (), 2) share FROM products WHERE id IN (1, 9, 16) ORDER BY id`);
q("B13 supplier stock piles (cs-1370)", `SELECT supplier_id, SUM(stock) stock_sum, SUM(SUM(stock)) OVER () all_stock FROM products GROUP BY supplier_id ORDER BY stock_sum DESC`);
q("B14 supplier piles under category fold (cs-1370 distractor)", `SELECT category, SUM(stock) stock_sum, SUM(SUM(stock)) OVER () all_stock FROM products GROUP BY category ORDER BY stock_sum DESC LIMIT 1`);
q("B15 supplier SKU counts (cs-1359)", `SELECT s.name, s.rating, COUNT(*) n, SUM(COUNT(*)) OVER () items, COUNT(COUNT(*)) OVER () sup_n FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY s.id`);
q("B16 category price census (cs-1371)", `SELECT category, ROUND(SUM(price),2) cat_price, ROUND(100.0*SUM(price)/SUM(SUM(price)) OVER (), 1) pct FROM products GROUP BY category ORDER BY cat_price DESC`);
q("B17 supplier-fold pcts (cs-1371 distractor)", `SELECT supplier_id, ROUND(100.0*SUM(price)/SUM(SUM(price)) OVER (), 1) pct FROM products GROUP BY supplier_id`);
q("B18 cancelled book + shares (cs-1363)", `WITH c AS (SELECT id, total, ROUND(100.0*total/SUM(total) OVER (), 1) share FROM orders WHERE status='cancelled') SELECT id, ROUND(total,2) total, share FROM c ORDER BY total DESC`);
q("B19 cancelled under 'pending' (cs-1363 distractor)", `WITH c AS (SELECT id, total, ROUND(100.0*total/SUM(total) OVER (), 1) share FROM orders WHERE status='pending') SELECT COUNT(*) n FROM c WHERE share = 34.5`);
q("B20 exposure book + top slices (cs-1367)", `WITH x AS (SELECT c.name, ROUND(SUM(o.total),2) exposure FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.status IN ('cancelled','pending') GROUP BY c.id) SELECT name, exposure, ROUND(100.0*exposure/SUM(exposure) OVER (), 1) pct FROM x ORDER BY exposure DESC LIMIT 6`);
q("B21 pending-only re-based Emma pct (cs-1367 distractor 17.7)", `WITH x AS (SELECT c.name, ROUND(SUM(o.total),2) exposure FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.status IN (17.7, 'pending') GROUP BY c.id) SELECT name, exposure, ROUND(100.0*exposure/SUM(exposure) OVER (), 1) pct FROM x WHERE name = 'Emma Wilson'`);
q("B22 delivered run head (cs-1376)", `SELECT id, total, ROUND(SUM(total) OVER (ORDER BY id), 2) run FROM orders WHERE status='delivered' ORDER BY id LIMIT 5`);
q("B23 Alice partition rungs + tail (cs-1383)", `SELECT customer_id, id, total, ROUND(SUM(total) OVER (PARTITION BY customer_id ORDER BY id), 2) run FROM orders WHERE customer_id = 1 ORDER BY id`);
q("B24 Alice mean (cs-1383 why)", `SELECT ROUND(AVG(total), 2) mean, COUNT(*) n FROM orders WHERE customer_id = 1`);
q("B25 Alice rungs under AVG (cs-1383 distractor AVG)", `SELECT id, ROUND(AVG(total) OVER (PARTITION BY customer_id ORDER BY id), 2) run FROM orders WHERE customer_id = 1 ORDER BY id DESC LIMIT 1`);
q("B26 LATAM orders detail (cs-1384)", `SELECT o.id, c.region, o.total, ROUND(SUM(o.total) OVER (PARTITION BY c.region ORDER BY o.id), 2) run FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = 'LATAM' ORDER BY o.id`);
q("B27 LATAM first rung figure (cs-1384 why)", `SELECT ROUND(SUM(total) OVER (PARTITION BY c.region ORDER BY o.id), 2) run FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = 'LATAM' ORDER BY o.id LIMIT 1`);
q("B28 band line head (cs-1380)", `SELECT id, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING), 2) band FROM orders ORDER BY id LIMIT 5`);
q("B29 band id3 under 1P-only frame (cs-1380 distractor)", `SELECT id, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) band FROM orders WHERE id = 3`);
q("B30 prior-frame line head (cs-1388)", `SELECT id, ROUND(total,2) total, SUM(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) prior FROM orders ORDER BY id LIMIT 4`);
q("B31 prior-frame under CURRENT ROW end (cs-1388 distractor)", `SELECT id, SUM(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) prior FROM orders WHERE id = 1`);
q("B32 tie-day receipts id5/id7 (cs-1377)", `SELECT id, created_at, total FROM orders WHERE id IN (5, 7)`);
q("B33 running by created_at RANGE at id5/id7 (cs-1377)", `SELECT id, created_at, ROUND(SUM(total) OVER (ORDER BY created_at RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) run FROM orders WHERE id IN (5, 7) ORDER BY id`);
q("B34 running by created_at ROWS at id5/id7 (cs-1377 distractor)", `SELECT id, ROUND(SUM(total) OVER (ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) run FROM orders WHERE id IN (5, 7) ORDER BY id`);
q("B35 running by created_at RANGE all-day sums (cs-1377 why)", `SELECT created_at, ROUND(SUM(total), 2) daysum FROM orders WHERE created_at <= '2024-01-02' GROUP BY created_at ORDER BY created_at`);
q("B36 LAST_VALUE full frame vs default (cs-1378)", `SELECT id, ROUND(LAST_VALUE(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING), 2) lv_full, ROUND(LAST_VALUE(total) OVER (ORDER BY id), 2) lv_default FROM orders WHERE id IN (1, 103) ORDER BY id`);
q("B37 expense ladder head (cs-1374/1356)", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents)/100.0 AS spend FROM expenses GROUP BY mo) SELECT mo, spend, ROUND(SUM(spend) OVER (ORDER BY mo), 2) running FROM m ORDER BY mon LIMIT 6`);
q("B38 expense strftime int-literal probe (cs-1356 distractor 1719)", `WITH m AS (SELECT strftime('%Y-%m', 1719) AS mo, SUM(amount_cents)/100.0 AS spend FROM expenses GROUP BY mo), p AS (SELECT mo, spend, SUM(spend) OVER () AS grand FROM m) SELECT mo, spend, ROUND(grand, 2) AS grand FROM p WHERE spend = 3210`);
q("B39 month ladder Feb/Mar (cs-1365/1379)", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS rev FROM orders GROUP BY mon), r AS (SELECT mon, rev, SUM(rev) OVER (ORDER BY mon) AS running FROM m) SELECT mon, rev, ROUND(running,2) running FROM r WHERE mon IN ('2024-01','2024-02','2024-03') ORDER BY mon`);
q("B40 full-frame month paint at March (cs-1379 distractor)", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS rev FROM orders GROUP BY mon), r AS (SELECT mon, rev, SUM(rev) OVER (ORDER BY mon RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS running FROM m) SELECT mon, ROUND(running,2) running FROM r WHERE mon = '2024-03'`);
q("B41 pending pot/avg (cs-1354/1381)", `SELECT COUNT(*) crowd, ROUND(SUM(total) OVER (), 2) pot, ROUND(AVG(total) OVER (), 2) avg_t FROM orders WHERE status = 'pending' LIMIT 1`);
q("B42 cancelled pot (cs-1363)", `SELECT COUNT(*) crowd, ROUND(SUM(total) OVER (), 2) pot FROM orders WHERE status = 'cancelled' LIMIT 1`);
q("B43 dust walk raw (cs-1369)", `SELECT id, total, SUM(total) OVER (ORDER BY id) run FROM orders ORDER BY id LIMIT 3`);
q("B44 per-id partition echo (cs-1369 distractor PARTITION BY)", `SELECT id, total, SUM(total) OVER (PARTITION BY id) run FROM orders WHERE id <= 3`);
q("B45 region census paint (cs-1364)", `SELECT c.region, COUNT(*) n, SUM(COUNT(*)) OVER () all_orders, MIN(COUNT(*)) OVER () min_paint, AVG(COUNT(*)) OVER () avg_paint FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY n DESC`);
q("B46 region share census (cs-1375)", `SELECT c.region, COUNT(*) n, ROUND(100.0*COUNT(*)/SUM(COUNT(*)) OVER (), 1) pct FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY n DESC`);
q("B47 board shares 2dp (cs-1368/1382)", `SELECT c.name, ROUND(SUM(o.total),2) spend, ROUND(100.0*SUM(o.total)/SUM(SUM(o.total)) OVER (), 2) pct FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.id ORDER BY spend DESC LIMIT 3`);
q("B48 exposure check: count per status (cs-1367 why)", `SELECT status, COUNT(*) n, ROUND(SUM(total),2) pot FROM orders WHERE status IN ('cancelled','pending') GROUP BY status`);

// ============ C — verbatim error probes cited in whys ============
e("C1 unsupported frame (cs-1380 distractor)", `SELECT id, AVG(total) OVER (ORDER BY id ROWS BETWEEN 2 FOLLOWING AND 1 PRECEDING) b FROM orders`);
e("C2 ORDER-before-PARTITION (cs-1387 distractor)", `SELECT id, COUNT(*) OVER (ORDER BY customer_id PARTITION BY id) w FROM orders`);
e("C3 double ORDER BY in OVER (cs-1383 distractor)", `SELECT id, SUM(total) OVER (ORDER BY customer_id ORDER BY id) w FROM orders`);
e("C4 WHERE id <= MAX (cs-1355 distractor)", `SELECT id FROM orders WHERE id <= MAX`);
e("C5 ORDER BY 5 out of range (cs-1358 distractor)", `SELECT id, name, stock, SUM(stock) OVER (ORDER BY 5) r FROM products`);
e("C6 ORDER BY 9 out of range, 2 cols (cs-1361 distractor)", `SELECT mon, n FROM (SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM customers GROUP BY mon) ORDER BY 9`);
e("C7 strftime over COUNT (cs-1361 distractor)", `SELECT strftime('%Y-%m', COUNT(*)) FROM customers`);
e("C8 SUM(*) invalid (cs-1375 distractor)", `SELECT 100.0 * SUM(*) / 2 FROM orders`);
e("C9 SUM(MIN(*)) invalid (cs-1364 distractor path)", `SELECT SUM(MIN(*)) OVER () FROM orders`);
e("C10 NTILE() no args (cs-1382 distractor)", `SELECT NTILE() OVER (ORDER BY total) FROM orders`);
e("C11 LAG() no args (cs-1382 distractor)", `SELECT LAG() OVER (ORDER BY total) FROM orders`);
e("C12 misuse of aggregate: COUNT in ORDER BY (cs-1361 distractor)", `SELECT mon, SUM(n) OVER (ORDER BY COUNT) c FROM (SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM customers GROUP BY mon)`);
e("C13 expenses has no created_at (cs-1356 distractor)", `SELECT created_at FROM expenses`);
e("C14 'no such function: n' path (cs-1361 distractor)", `SELECT n(n) FROM customers`);

rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");

// ============ D — ROUND 2: fixed fills after WHERE-collapse traps ============
q("D1 cs-1355 fixed fill", `WITH s AS (SELECT id, total, ROUND(100.0 * total / SUM(total) OVER (), 2) AS share FROM orders) SELECT id, total, share FROM s WHERE id <= 3 ORDER BY share DESC`);
q("D2 cs-1355 MAX-distractor fill", `WITH s AS (SELECT id, total, ROUND(100.0 * total / MAX(total) OVER (), 2) AS share FROM orders) SELECT id, total, share FROM s WHERE id <= 3 ORDER BY share DESC`);
e("D3 cs-1355 'share 10' order probe", `WITH s AS (SELECT id, total, ROUND(100.0 * total / SUM(total) OVER (), 2) AS share FROM orders) SELECT id, total, share FROM s WHERE id <= 3 ORDER BY share 10`);
q("D4 cs-1357 fixed fill", `WITH p AS (SELECT id, name, price, ROUND(100.0 * price / SUM(price) OVER (), 2) AS share FROM products) SELECT id, name, share FROM p WHERE id = 16 AND share = 17.41`);
q("D5 cs-1357 share line 1/16 (distractor rows)", `WITH p AS (SELECT id, name, price, ROUND(100.0 * price / SUM(price) OVER (), 2) AS share FROM products) SELECT id, name, share FROM p WHERE id IN (1, 16) ORDER BY id`);
q("D6 cs-1360 fixed fill", `WITH p AS (SELECT id, name, stock, ROUND(100.0 * stock / SUM(stock) OVER (), 2) AS share FROM products) SELECT id, name, share FROM p WHERE id = 9 AND share = 17.57`);
q("D7 cs-1360 share line 1/9/16", `WITH p AS (SELECT id, name, stock, ROUND(100.0 * stock / SUM(stock) OVER (), 2) AS share FROM products) SELECT id, name, share FROM p WHERE id IN (1, 9, 16) ORDER BY id`);
q("D8 cs-1366 ma2/ma4 at March (CTE-wrapped)", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon), w AS (SELECT mon, ROUND(AVG(n) OVER (ORDER BY mon ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) ma2, ROUND(AVG(n) OVER (ORDER BY mon ROWS BETWEEN 3 PRECEDING AND CURRENT ROW), 2) ma4 FROM m) SELECT mon, ma2, ma4 FROM w WHERE mon = '2024-03'`);
q("D9 cs-1377 ROWS-distractor fill (CTE-wrapped)", `WITH w AS (SELECT id, total, SUM(total) OVER (ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run FROM orders) SELECT id, ROUND(run, 2) AS run FROM w WHERE id = 5 AND ROUND(run, 2) = 1630.82`);
q("D10 cs-1380 1P-band at id3 (CTE-wrapped)", `WITH w AS (SELECT id, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) AS band FROM orders) SELECT id, band FROM w WHERE id = 3`);
q("D11 cs-1385 2P roll at June (CTE-wrapped)", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon), w AS (SELECT mon, SUM(n) OVER (ORDER BY mon ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS roll FROM m) SELECT mon, roll FROM w WHERE mon = '2024-06'`);
q("D12 cs-1387 fixed fill (id 101)", `WITH w AS (SELECT id, customer_id, COUNT(*) OVER (PARTITION BY customer_id ORDER BY id) AS walked FROM orders) SELECT id, customer_id, walked FROM w WHERE id = 101 AND walked = 24`);
q("D13 cs-1381 fill without limit", `WITH w AS (SELECT id, status, COUNT(*) OVER () AS seen, SUM(total) OVER () AS pot FROM orders WHERE status = 'pending') SELECT id, status, seen, ROUND(pot, 2) AS pot FROM w WHERE seen = 14`);
q("D14 expense ladder (alias fixed)", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents)/100.0 AS spend FROM expenses GROUP BY mo), r AS (SELECT mo, spend, ROUND(SUM(spend) OVER (ORDER BY mo), 2) AS running FROM m) SELECT mo, spend, running FROM r ORDER BY mo LIMIT 6`);
q("D15 cs-1383 AVG-distractor last rung", `WITH a AS (SELECT id, ROUND(AVG(total) OVER (PARTITION BY customer_id ORDER BY id), 2) AS run FROM orders WHERE customer_id = 1) SELECT id, run FROM a ORDER BY id DESC LIMIT 1`);
q("D16 cs-1358 stock-ORDER walk at id16 (distractor check)", `WITH w AS (SELECT id, stock, SUM(stock) OVER (ORDER BY stock) AS running_stock FROM products) SELECT id, running_stock FROM w WHERE id = 16`);
q("D17 pending-only re-based exposure pcts (cs-1367 distractor check)", `WITH x AS (SELECT c.name, ROUND(SUM(o.total),2) AS exposure FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.status IN ('pending') GROUP BY c.id), s AS (SELECT name, exposure, ROUND(100.0 * exposure / SUM(exposure) OVER (), 1) AS pct FROM x) SELECT name, exposure, pct FROM s WHERE pct = 22.2`);
q("D18 cs-1369 PARTITION-distractor fill rows", `WITH r AS (SELECT id, total, SUM(total) OVER (PARTITION BY id) AS run FROM orders) SELECT id, total, run FROM r WHERE id <= 3`);
q("D19 cs-1373 frame-distractor fill at id16", `WITH r AS (SELECT id, name, stock, SUM(stock) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS remaining FROM products) SELECT id, name, stock, remaining FROM r WHERE id = 16`);
q("D20 cs-1388 COUNT-distractor fill at id1", `WITH w AS (SELECT id, total, COUNT(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS prior FROM orders) SELECT id, ROUND(total, 2) AS total, prior FROM w WHERE id = 1 AND prior IS NULL`);
q("D21 cs-1378 default-frame-distractor fill at id1", `WITH d AS (SELECT id, total, LAST_VALUE(total) OVER (ORDER BY id) AS lv FROM orders) SELECT id, ROUND(lv, 2) AS lv FROM d WHERE id = 1 AND ROUND(lv, 2) = 324.16`);
q("D22 cs-1384 US-distractor sanity (region runs)", `WITH w AS (SELECT o.id, c.region, ROUND(SUM(o.total) OVER (PARTITION BY c.region ORDER BY o.id), 2) AS run FROM orders o JOIN customers c ON c.id = o.customer_id) SELECT region, run FROM w WHERE region = 'US' ORDER BY run LIMIT 3`);
rmSync(COPY, { force: true });
console.log("round 2 done, copy removed");
