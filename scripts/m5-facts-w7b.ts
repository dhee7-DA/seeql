/// <reference types="bun-types" />
// m5-c7 wave probe round 2 — verifies every correct fill for cases-w7.ts
// (cs-1425…cs-1460) plus the specific distractor landings cited in prose.
// Same self-deleting COPY pattern as m5-facts-w7.ts. Run: bun scripts/m5-facts-w7b.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w7b.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string, max = 20) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const shown = rows.slice(0, max).map(r => Object.values(r).map(v =>
      v === null ? "NULL" : typeof v === "object" ? JSON.stringify(v) : String(v)
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

console.log("version:", db.query("SELECT sqlite_version() v").get().v);

// ---- cs-1425 shelf label ----
q("1425 fill", `SELECT name, price, CAST(price AS INTEGER) AS shelf FROM products WHERE price = 199.99`);
q("1425 d:149.99", `SELECT name, price, CAST(price AS INTEGER) AS shelf FROM products WHERE price = 149.99`);

// ---- cs-1426 stock average floor ----
q("1426 fill (HAVING alias)", `SELECT AVG(stock) AS raw, CAST(AVG(stock) AS INTEGER) AS floored, typeof(AVG(stock)) AS cls FROM products HAVING floored = 177`);
q("1426 d:ROUND slot2", `SELECT AVG(stock) AS raw, CAST(AVG(stock) AS INTEGER) AS floored, ROUND(AVG(stock)) AS cls FROM products HAVING floored = 177`);
q("1426 d:178", `SELECT AVG(stock) AS raw, CAST(AVG(stock) AS INTEGER) AS floored, typeof(AVG(stock)) AS cls FROM products HAVING floored = 178`);

// ---- cs-1427 half-dollar debit ----
q("1427 fill", `SELECT id, entry_date, debit_cents, typeof(debit_cents) AS cls, debit_cents / 100 AS whole_dollars, debit_cents / 100.0 AS exact_dollars FROM ledger_entries WHERE id = 43 AND debit_cents = 625450`);
q("1427 d:100", `SELECT id, entry_date, debit_cents, typeof(debit_cents) AS cls, debit_cents / 100 AS whole_dollars, debit_cents / 100 AS exact_dollars FROM ledger_entries WHERE id = 43 AND debit_cents = 625450`);
q("1427 d:49", `SELECT id, entry_date, debit_cents, typeof(debit_cents) AS cls, debit_cents / 100 AS whole_dollars, debit_cents / 100.0 AS exact_dollars FROM ledger_entries WHERE id = 49 AND debit_cents = 625450`);

// ---- cs-1428 text-sorted whale ----
q("1428 fill", `SELECT MAX(total) AS num_max, MAX(PRINTF('%.2f', total)) AS text_max, typeof(MAX(total)) AS cls FROM orders HAVING num_max = 1088.44`);
q("1428 d:ROUND fmt", `SELECT MAX(total) AS num_max, MAX(ROUND('%.2f', total)) AS text_max, typeof(MAX(total)) AS cls FROM orders HAVING num_max = 1088.44`);

// ---- cs-1429 whole-money tickets ----
q("1429 fill", `SELECT id, total, CAST(total AS INTEGER) AS whole, typeof(total) AS cls FROM orders WHERE total = CAST(total AS INTEGER) AND id = 35`);
q("1429 both rows", `SELECT id, total, CAST(total AS INTEGER) AS whole FROM orders WHERE total = CAST(total AS INTEGER) ORDER BY id`);

// ---- cs-1430 star census ----
q("1430 fill", `SELECT CAST(rating AS INTEGER) AS stars, COUNT(*) AS partners FROM suppliers GROUP BY stars HAVING partners = 5 AND stars = 4`);
q("1430 full census", `SELECT CAST(rating AS INTEGER) AS stars, COUNT(*) AS partners FROM suppliers GROUP BY stars`);
q("1430 d:TEXT", `SELECT COUNT(*) n FROM (SELECT CAST(rating AS TEXT) AS stars, COUNT(*) AS partners FROM suppliers GROUP BY stars HAVING partners = 5 AND stars = 4)`);
q("1430 d:REAL", `SELECT COUNT(*) n FROM (SELECT CAST(rating AS REAL) AS stars, COUNT(*) AS partners FROM suppliers GROUP BY stars HAVING partners = 5 AND stars = 4)`);

// ---- cs-1431 numeric cohort key ----
q("1431 fill", `SELECT typeof(SUBSTR(created_at, 1, 4)) AS raw_cls, CAST(SUBSTR(created_at, 1, 4) AS INTEGER) AS yr, COUNT(*) AS tickets FROM orders GROUP BY yr HAVING yr = 2024`);
q("1431 d:strftime slot1", `SELECT typeof(SUBSTR(created_at, 1, 4)) AS raw_cls, CAST(strftime(created_at, 1, 4) AS INTEGER) AS yr, COUNT(*) AS tickets FROM orders GROUP BY yr HAVING yr = 2024`);
q("1431 strftimeNULLgroup", `SELECT CAST(strftime(created_at, 1, 4) AS INTEGER) yr, COUNT(*) n FROM orders GROUP BY yr`);

// ---- cs-1432 whole-dollar pots (growth) ----
q("1432 fill", `SELECT status, SUM(total) AS pool, CAST(SUM(total) AS INTEGER) AS whole FROM orders GROUP BY status HAVING status = 'delivered' AND whole = 15571`);
q("1432 d:BOOLEAN", `SELECT CAST(15571.07 AS BOOLEAN) w, typeof(CAST(15571.07 AS BOOLEAN)) c`);
q("1432 d:TEXT", `SELECT status, SUM(total) AS pool, CAST(SUM(total) AS TEXT) AS whole FROM orders GROUP BY status HAVING status = 'delivered' AND whole = 15571`);

// ---- cs-1433 keyboard dust ----
q("1433 fill", `SELECT id, name, price, CAST(price AS INTEGER) AS shelf, ROUND(price - CAST(price AS INTEGER), 2) AS dust FROM products WHERE id = 1`);
q("1433 d:0 digits", `SELECT id, name, price, CAST(price AS INTEGER) AS shelf, ROUND(price - CAST(price AS INTEGER), 0) AS dust FROM products WHERE id = 1`);
q("1433 d:id3", `SELECT id, name, price, CAST(price AS INTEGER) AS shelf, ROUND(price - CAST(price AS INTEGER), 2) AS dust FROM products WHERE id = 3`);
q("1433 raw dust value", `SELECT price - CAST(price AS INTEGER) dust_raw, price * 100 raw_cents, CAST(price * 100 AS INTEGER) clip_cents, CAST(ROUND(price * 100) AS INTEGER) safe_cents FROM products WHERE id = 1`);

// ---- cs-1434 EU activation floor ----
q("1434 fill", `SELECT region, COUNT(*) AS customers, SUM(active) AS activated, CAST(AVG(active) AS INTEGER) AS rate_floor FROM customers GROUP BY region HAVING region = 'EU' AND activated = 7`);

// ---- cs-1435 hub bin math ----
q("1435 fill", `SELECT name, stock, stock / 2 AS per_bin, typeof(stock) AS cls FROM products WHERE stock % 2 = 1 AND stock = 85`);
q("1435 d:2.0", `SELECT name, stock, stock / 2.0 AS per_bin, typeof(stock) AS cls FROM products WHERE stock % 2 = 1 AND stock = 85`);
q("1435 d:95", `SELECT name, stock, stock / 2 AS per_bin, typeof(stock) AS cls FROM products WHERE stock % 2 = 1 AND stock = 95`);

// ---- cs-1436 invoice junk number ----
q("1436 fill", `SELECT id, number, typeof(number) AS cls, number + 0 AS num FROM invoices WHERE id = 1`);
q("1436 d:+1", `SELECT id, number, typeof(number) AS cls, number + 1 AS num FROM invoices WHERE id = 1`);
q("1436 ABS/UPPER landings", `SELECT ABS(number) a, UPPER(number) u FROM invoices WHERE id = 1`);

// ---- cs-1437 dusty second rung ----
q("1437 fill", `WITH w AS (SELECT id, total, SUM(total) OVER (ORDER BY id) AS rung FROM orders)\nSELECT id, total, ROUND(rung, 2) AS clean, typeof(rung) AS cls FROM w WHERE id = 2`);
q("1437 d:AVG", `WITH w AS (SELECT id, total, AVG(total) OVER (ORDER BY id) AS rung FROM orders)\nSELECT id, total, ROUND(rung, 2) AS clean, typeof(rung) AS cls FROM w WHERE id = 2`);
q("1437 d:MIN", `WITH w AS (SELECT id, total, MIN(total) OVER (ORDER BY id) AS rung FROM orders)\nSELECT id, total, ROUND(rung, 2) AS clean, typeof(rung) AS cls FROM w WHERE id = 2`);
q("1437 d:id3", `WITH w AS (SELECT id, total, SUM(total) OVER (ORDER BY id) AS rung FROM orders)\nSELECT id, total, ROUND(rung, 2) AS clean, typeof(rung) AS cls FROM w WHERE id = 3`);

// ---- cs-1438 cancelled pot clipped ----
q("1438 fill", `SELECT COUNT(*) AS tickets, SUM(total) AS pool, CAST(SUM(total) AS INTEGER) AS whole FROM orders WHERE status = 'cancelled' HAVING pool = 1152.49`);
q("1438 d:ROUND slot1", `SELECT COUNT(*) AS tickets, SUM(total) AS pool, CAST(SUM(total) AS ROUND) AS whole FROM orders WHERE status = 'cancelled' HAVING pool = 1152.49`);
q("1438 d:shipped", `SELECT COUNT(*) AS tickets, SUM(total) AS pool, CAST(SUM(total) AS INTEGER) AS whole FROM orders WHERE status = 'shipped' HAVING pool = 1152.49`);

// ---- cs-1439 catalog cast dust ----
q("1439 fill", `SELECT cls, raw_shelf, clipped, ROUND(raw_shelf - clipped, 2) AS dust FROM (SELECT typeof(SUM(price)) AS cls, SUM(price) AS raw_shelf, SUM(CAST(price AS INTEGER)) AS clipped FROM products) WHERE clipped = 1140 AND ROUND(raw_shelf - clipped, 2) = 8.43`);
q("1439 d:REAL slot2", `SELECT cls, raw_shelf, clipped, ROUND(raw_shelf - clipped, 2) AS dust FROM (SELECT typeof(SUM(price)) AS cls, SUM(price) AS raw_shelf, SUM(CAST(price AS REAL)) AS clipped FROM products) WHERE clipped = 1140 AND ROUND(raw_shelf - clipped, 2) = 8.43`);

// ---- cs-1440 rent in dollars ----
q("1440 fill", `SELECT COUNT(*) AS bills, SUM(amount_cents) / 100.0 AS dollars, typeof(SUM(amount_cents) / 100.0) AS cls, PRINTF('%.2f', SUM(amount_cents) / 100.0) AS plate FROM expenses WHERE category = 'Rent' HAVING bills = 14`);
q("1440 d:Ads", `SELECT COUNT(*) AS bills, SUM(amount_cents) / 100.0 AS dollars, typeof(SUM(amount_cents) / 100.0) AS cls, PRINTF('%.2f', SUM(amount_cents) / 100.0) AS plate FROM expenses WHERE category = 'Ads' HAVING bills = 14`);

// ---- cs-1441 k$ dial ----
q("1441 fill", `SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) AS yr, COUNT(*) AS tickets, CAST(SUM(total) / 1000 AS INTEGER) AS k_usd FROM orders GROUP BY yr HAVING COUNT(*) = 90`);
q("1441 d:100", `SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) AS yr, COUNT(*) AS tickets, CAST(SUM(total) / 100 AS INTEGER) AS k_usd FROM orders GROUP BY yr HAVING COUNT(*) = 90`);
q("1441 d:10000", `SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) AS yr, COUNT(*) AS tickets, CAST(SUM(total) / 10000 AS INTEGER) AS k_usd FROM orders GROUP BY yr HAVING COUNT(*) = 90`);
q("1441 d:13", `SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) AS yr, COUNT(*) AS tickets, CAST(SUM(total) / 1000 AS INTEGER) AS k_usd FROM orders GROUP BY yr HAVING COUNT(*) = 13`);

// ---- cs-1442 price bands (inventory) ----
q("1442 fill", `SELECT CAST(price / 10 AS INTEGER) AS band, COUNT(*) AS skus, SUM(stock) AS units FROM products GROUP BY band HAVING skus = 3 AND units = 670`);
q("1442 d:1", `SELECT CAST(price / 1 AS INTEGER) AS band, COUNT(*) AS skus, SUM(stock) AS units FROM products GROUP BY band HAVING skus = 3 AND units = 670`);
q("1442 d:2", `SELECT CAST(price / 2 AS INTEGER) AS band, COUNT(*) AS skus, SUM(stock) AS units FROM products GROUP BY band HAVING skus = 3 AND units = 670`);
q("1442 d:670 slot1", `SELECT CAST(price / 670 AS INTEGER) AS band, COUNT(*) AS skus, SUM(stock) AS units FROM products GROUP BY band HAVING skus = 3 AND units = 670`);

// ---- cs-1443 pools read real ----
q("1443 fill", `SELECT status, typeof(SUM(total)) AS cls, COUNT(*) AS tickets FROM orders GROUP BY status HAVING tickets = 14`);
q("1443 d:COUNT slot2", `SELECT status, typeof(COUNT(total)) AS cls, COUNT(*) AS tickets FROM orders GROUP BY status HAVING tickets = 14`);
q("1443 d:LENGTH slot2", `SELECT status, typeof(LENGTH(total)) AS cls, COUNT(*) AS tickets FROM orders GROUP BY status HAVING tickets = 14`);
q("1443 d:7", `SELECT status, typeof(SUM(total)) AS cls, COUNT(*) AS tickets FROM orders GROUP BY status HAVING tickets = 7`);

// ---- cs-1444 whole-price survivors (pricing) ----
q("1444 fill", `SELECT COUNT(*) AS keepers, MIN(price) AS floor_price FROM products WHERE price = CAST(price AS INTEGER) HAVING keepers = 6 AND floor_price = 32`);
q("1444 d:TEXT", `SELECT COUNT(*) AS keepers, MIN(price) AS floor_price FROM products WHERE price = CAST(price AS TEXT) HAVING keepers = 6 AND floor_price = 32`);
q("1444 d:REAL", `SELECT COUNT(*) AS keepers, MIN(price) AS floor_price FROM products WHERE price = CAST(price AS REAL) HAVING keepers = 6 AND floor_price = 32`);

// ---- cs-1445 alpine badge ----
q("1445 fill", `SELECT name, rating, typeof(rating) AS cls, CAST(rating AS INTEGER) AS stars, PRINTF('%.0f', rating) AS badge FROM suppliers WHERE name = 'Alpine Audio GmbH' AND rating = 4.8`);
q("1445 d:MAX slot1", `SELECT name, rating, typeof(rating) AS cls, CAST(rating AS INTEGER) AS stars, MAX('%.0f', rating) AS badge FROM suppliers WHERE name = 'Alpine Audio GmbH' AND rating = 4.8`);
q("1445 d:ABS slot1", `SELECT name, rating, typeof(rating) AS cls, CAST(rating AS INTEGER) AS stars, ABS('%.0f', rating) AS badge FROM suppliers WHERE name = 'Alpine Audio GmbH' AND rating = 4.8`);

// ---- cs-1446 august cash out ----
q("1446 fill", `WITH m AS (SELECT strftime('%Y-%m', entry_date) AS mon, SUM(debit_cents) AS cents FROM ledger_entries WHERE account = 'cash' GROUP BY mon)\nSELECT mon, dollars, cls FROM (SELECT mon, cents / 100.0 AS dollars, typeof(cents) AS cls FROM m) WHERE mon = '2024-08' AND dollars = 6254.5`);
q("1446 d:100", `WITH m AS (SELECT strftime('%Y-%m', entry_date) AS mon, SUM(debit_cents) AS cents FROM ledger_entries WHERE account = 'cash' GROUP BY mon)\nSELECT mon, dollars, cls FROM (SELECT mon, cents / 100 AS dollars, typeof(cents) AS cls FROM m) WHERE mon = '2024-08' AND dollars = 6254.5`);
q("1446 d:opex", `WITH m AS (SELECT strftime('%Y-%m', entry_date) AS mon, SUM(debit_cents) AS cents FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY mon)\nSELECT mon, dollars, cls FROM (SELECT mon, cents / 100.0 AS dollars, typeof(cents) AS cls FROM m) WHERE mon = '2024-08' AND dollars = 6254.5`);

// ---- cs-1447 spike month typed ----
q("1447 fill", `SELECT strftime('%Y-%m', spent_on) AS mon, COUNT(*) AS bills, SUM(amount_cents) AS cents, typeof(SUM(amount_cents) / 100.0) AS cls FROM expenses GROUP BY mon HAVING mon = '2024-08' AND bills = 3`);
q("1447 d:2024-09", `SELECT strftime('%Y-%m', spent_on) AS mon, COUNT(*) AS bills, SUM(amount_cents) AS cents, typeof(SUM(amount_cents) / 100.0) AS cls FROM expenses GROUP BY mon HAVING mon = '2024-09' AND bills = 3`);
q("1447 LENGTH landing", `SELECT LENGTH(3210.0) l`);

// ---- cs-1448 2023 intake floor ----
q("1448 fill", `SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) AS yr, COUNT(*) AS signups, SUM(active) AS activated, CAST(AVG(active) AS INTEGER) AS floored FROM customers GROUP BY yr HAVING yr = 2023 AND activated = 3`);
q("1448 d:2024", `SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) AS yr, COUNT(*) AS signups, SUM(active) AS activated, CAST(AVG(active) AS INTEGER) AS floored FROM customers GROUP BY yr HAVING yr = 2024 AND activated = 3`);
q("1448 ROUND digits probe", `SELECT ROUND(0.875, 2) r2, ROUND(0.875, 1) r1, CAST(0.875 AS INTEGER) fl`);

// ---- cs-1449 walk rung ----
q("1449 fill", `WITH walk AS (SELECT id, entry_date, SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) AS bal_cents FROM ledger_entries)\nSELECT id, entry_date, dollars, cls FROM (SELECT id, entry_date, bal_cents / 100.0 AS dollars, typeof(bal_cents) AS cls FROM walk) WHERE id = 79 AND dollars = 7076`);
q("1449 tail rows", `WITH walk AS (SELECT id, entry_date, SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) AS bal_cents FROM ledger_entries)\nSELECT id, bal_cents, typeof(bal_cents) cls FROM walk WHERE id >= 78`);
q("1449 d:80", `WITH walk AS (SELECT id, entry_date, SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) AS bal_cents FROM ledger_entries)\nSELECT id, entry_date, dollars, cls FROM (SELECT id, entry_date, bal_cents / 100.0 AS dollars, typeof(bal_cents) AS cls FROM walk) WHERE id = 80 AND dollars = 7076`);
q("1449 d:COUNT slot1", `WITH walk AS (SELECT id, entry_date, COUNT(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) AS bal_cents FROM ledger_entries)\nSELECT id, entry_date, dollars, cls FROM (SELECT id, entry_date, bal_cents / 100.0 AS dollars, typeof(bal_cents) AS cls FROM walk) WHERE id = 79 AND dollars = 7076`);

// ---- cs-1450 january dust bucket ----
q("1450 fill", `SELECT strftime('%m', created_at) AS mo, COUNT(*) AS n, PRINTF('%.2f', SUM(total)) AS pot, typeof(SUM(total)) AS cls FROM orders WHERE status = 'cancelled' GROUP BY mo HAVING n = 2`);
q("1450 raw '01' sum", `SELECT strftime('%m', created_at) mo, SUM(total) raw FROM orders WHERE status='cancelled' GROUP BY mo HAVING mo = '01'`);
q("1450 d:%d slot1", `SELECT strftime('%d', created_at) AS mo, COUNT(*) AS n, PRINTF('%.2f', SUM(total)) AS pot, typeof(SUM(total)) AS cls FROM orders WHERE status = 'cancelled' GROUP BY mo HAVING n = 2`);
q("1450 d:1", `SELECT strftime('%m', created_at) AS mo, COUNT(*) AS n, PRINTF('%.2f', SUM(total)) AS pot, typeof(SUM(total)) AS cls FROM orders WHERE status = 'cancelled' GROUP BY mo HAVING n = 1`);

// ---- cs-1451 cast first sum second ----
q("1451 fill", `SELECT COUNT(*) AS skus, CAST(SUM(price) AS INTEGER) AS cast_sum, SUM(CAST(price AS INTEGER)) AS sum_cast, typeof(SUM(price)) AS cls FROM products HAVING skus = 16 AND cast_sum = 1148`);
q("1451 d:MAX slot1", `SELECT COUNT(*) AS skus, CAST(MAX(price) AS INTEGER) AS cast_sum, SUM(CAST(price AS INTEGER)) AS sum_cast, typeof(SUM(price)) AS cls FROM products HAVING skus = 16 AND cast_sum = 1148`);
q("1451 d:AVG slot1", `SELECT COUNT(*) AS skus, CAST(AVG(price) AS INTEGER) AS cast_sum, SUM(CAST(price AS INTEGER)) AS sum_cast, typeof(SUM(price)) AS cls FROM products HAVING skus = 16 AND cast_sum = 1148`);
q("1451 d:ROUND slot2", `SELECT COUNT(*) AS skus, CAST(SUM(price) AS INTEGER) AS cast_sum, SUM(CAST(price AS INTEGER)) AS sum_cast, ROUND(SUM(price)) AS cls FROM products HAVING skus = 16 AND cast_sum = 1148`);
q("1451 d:1140", `SELECT COUNT(*) AS skus, CAST(SUM(price) AS INTEGER) AS cast_sum, SUM(CAST(price AS INTEGER)) AS sum_cast, typeof(SUM(price)) AS cls FROM products HAVING skus = 16 AND cast_sum = 1140`);
q("1451 d:10", `SELECT COUNT(*) AS skus, CAST(SUM(price) AS INTEGER) AS cast_sum, SUM(CAST(price AS INTEGER)) AS sum_cast, typeof(SUM(price)) AS cls FROM products HAVING skus = 10 AND cast_sum = 1148`);

// ---- cs-1452 void text crown ----
q("1452 fill", `WITH league AS (SELECT number, status, amount_cents / 100.0 AS dollars, PRINTF('%.2f', amount_cents / 100.0) AS plate, typeof(amount_cents / 100.0) AS cls, MAX(amount_cents / 100.0) OVER () AS true_max FROM invoices)\nSELECT number, status, dollars, plate, cls, true_max FROM league WHERE true_max = 6148 ORDER BY plate DESC LIMIT 1`);
q("1452 d:%.0f", `WITH league AS (SELECT number, status, amount_cents / 100.0 AS dollars, PRINTF('%.0f', amount_cents / 100.0) AS plate, typeof(amount_cents / 100.0) AS cls, MAX(amount_cents / 100.0) OVER () AS true_max FROM invoices)\nSELECT number, status, dollars, plate, cls, true_max FROM league WHERE true_max = 6148 ORDER BY plate DESC LIMIT 1`);
q("1452 d:ASC", `WITH league AS (SELECT number, status, amount_cents / 100.0 AS dollars, PRINTF('%.2f', amount_cents / 100.0) AS plate, typeof(amount_cents / 100.0) AS cls, MAX(amount_cents / 100.0) OVER () AS true_max FROM invoices)\nSELECT number, status, dollars, plate, cls, true_max FROM league WHERE true_max = 6148 ORDER BY plate ASC LIMIT 1`);
q("1452 d:3", `WITH league AS (SELECT number, status, amount_cents / 100.0 AS dollars, PRINTF('%.2f', amount_cents / 100.0) AS plate, typeof(amount_cents / 100.0) AS cls, MAX(amount_cents / 100.0) OVER () AS true_max FROM invoices)\nSELECT number, status, dollars, plate, cls, true_max FROM league WHERE true_max = 6148 ORDER BY plate DESC LIMIT 3`);
q("1452 d:925", `WITH league AS (SELECT number, status, amount_cents / 100.0 AS dollars, PRINTF('%.2f', amount_cents / 100.0) AS plate, typeof(amount_cents / 100.0) AS cls, MAX(amount_cents / 100.0) OVER () AS true_max FROM invoices)\nSELECT number, status, dollars, plate, cls, true_max FROM league WHERE true_max = 925 ORDER BY plate DESC LIMIT 1`);

// ---- cs-1453 floor vs round ----
q("1453 fill", `WITH r AS (SELECT region, COUNT(*) AS customers, SUM(active) AS activated, AVG(active) AS rate FROM customers GROUP BY region)\nSELECT region, customers, activated, CAST(rate AS INTEGER) AS rate_floor, ROUND(rate, 2) AS rounded FROM r WHERE region = 'EU' AND activated = 7`);
q("1453 d:1 digit", `WITH r AS (SELECT region, COUNT(*) AS customers, SUM(active) AS activated, AVG(active) AS rate FROM customers GROUP BY region)\nSELECT region, customers, activated, CAST(rate AS INTEGER) AS rate_floor, ROUND(rate, 1) AS rounded FROM r WHERE region = 'EU' AND activated = 7`);
q("1453 d:APAC", `WITH r AS (SELECT region, COUNT(*) AS customers, SUM(active) AS activated, AVG(active) AS rate FROM customers GROUP BY region)\nSELECT region, customers, activated, CAST(rate AS INTEGER) AS rate_floor, ROUND(rate, 2) AS rounded FROM r WHERE region = 'APAC' AND activated = 7`);

// ---- cs-1454 star census + badge ----
q("1454 fill", `WITH s AS (SELECT name, rating, CAST(rating AS INTEGER) AS stars FROM suppliers)\nSELECT stars, COUNT(*) AS partners, MAX(rating) AS top_rating FROM s GROUP BY stars HAVING stars = 4 AND top_rating = 4.8`);
q("1454 d:AVG", `WITH s AS (SELECT name, rating, CAST(rating AS INTEGER) AS stars FROM suppliers)\nSELECT stars, COUNT(*) AS partners, AVG(rating) AS top_rating FROM s GROUP BY stars HAVING stars = 4 AND top_rating = 4.8`);
q("1454 d:MIN", `WITH s AS (SELECT name, rating, CAST(rating AS INTEGER) AS stars FROM suppliers)\nSELECT stars, COUNT(*) AS partners, MIN(rating) AS top_rating FROM s GROUP BY stars HAVING stars = 4 AND top_rating = 4.8`);
q("1454 d:TEXT", `WITH s AS (SELECT name, rating, CAST(rating AS TEXT) AS stars FROM suppliers)\nSELECT stars, COUNT(*) AS partners, MAX(rating) AS top_rating FROM s GROUP BY stars HAVING stars = 4 AND top_rating = 4.8`);
q("1454 d:3", `WITH s AS (SELECT name, rating, CAST(rating AS INTEGER) AS stars FROM suppliers)\nSELECT stars, COUNT(*) AS partners, MAX(rating) AS top_rating FROM s GROUP BY stars HAVING stars = 3 AND top_rating = 4.8`);

// ---- cs-1455 cash months over the line ----
q("1455 fill", `WITH m AS (SELECT strftime('%Y-%m', entry_date) AS mon, SUM(debit_cents) AS cents FROM ledger_entries WHERE account = 'cash' GROUP BY mon),\nd AS (SELECT mon, cents / 100.0 AS dollars, typeof(cents) AS cls FROM m)\nSELECT mon, dollars, cls FROM d WHERE dollars >= 1959`);
q("1455 d:opex", `WITH m AS (SELECT strftime('%Y-%m', entry_date) AS mon, SUM(debit_cents) AS cents FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY mon),\nd AS (SELECT mon, cents / 100.0 AS dollars, typeof(cents) AS cls FROM m)\nSELECT mon, dollars, cls FROM d WHERE dollars >= 1959`);
q("1455 d:100", `WITH m AS (SELECT strftime('%Y-%m', entry_date) AS mon, SUM(debit_cents) AS cents FROM ledger_entries WHERE account = 'cash' GROUP BY mon),\nd AS (SELECT mon, cents / 100 AS dollars, typeof(cents) AS cls FROM m)\nSELECT mon, dollars, cls FROM d WHERE dollars >= 1959`);
q("1455 d:2000", `WITH m AS (SELECT strftime('%Y-%m', entry_date) AS mon, SUM(debit_cents) AS cents FROM ledger_entries WHERE account = 'cash' GROUP BY mon),\nd AS (SELECT mon, cents / 100.0 AS dollars, typeof(cents) AS cls FROM m)\nSELECT mon, dollars, cls FROM d WHERE dollars >= 2000`);
q("1455 ABS slot3", `WITH m AS (SELECT strftime('%Y-%m', entry_date) AS mon, SUM(debit_cents) AS cents FROM ledger_entries WHERE account = 'cash' GROUP BY mon),\nd AS (SELECT mon, cents / 100.0 AS dollars, ABS(cents) AS cls FROM m)\nSELECT mon, dollars, cls FROM d WHERE dollars >= 1959`);

// ---- cs-1456 2025 pot tail ----
q("1456 fill", `WITH y AS (SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) AS yr, COUNT(*) AS tickets, SUM(total) AS pot FROM orders GROUP BY yr)\nSELECT yr, tickets, pot, PRINTF('%.2f', pot) AS plate, typeof(pot) AS cls FROM y WHERE yr = 2025`);
q("1456 d:%.1f", `WITH y AS (SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) AS yr, COUNT(*) AS tickets, SUM(total) AS pot FROM orders GROUP BY yr)\nSELECT yr, tickets, pot, PRINTF('%.1f', pot) AS plate, typeof(pot) AS cls FROM y WHERE yr = 2025`);
q("1456 d:2024", `WITH y AS (SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) AS yr, COUNT(*) AS tickets, SUM(total) AS pot FROM orders GROUP BY yr)\nSELECT yr, tickets, pot, PRINTF('%.2f', pot) AS plate, typeof(pot) AS cls FROM y WHERE yr = 2024`);
q("1456 d:ROUND slot2", `WITH y AS (SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) AS yr, COUNT(*) AS tickets, SUM(total) AS pot FROM orders GROUP BY yr)\nSELECT yr, tickets, pot, PRINTF('%.2f', pot) AS plate, ROUND(pot) AS cls FROM y WHERE yr = 2025`);

// ---- cs-1457 bin math clips ----
q("1457 fill", `WITH odd AS (SELECT name, stock, stock / 2 AS per_bin, CAST(stock AS REAL) / 2 AS exact FROM products WHERE stock % 2 = 1)\nSELECT name, stock, per_bin, exact, typeof(per_bin) AS cls FROM odd WHERE stock = 85`);
q("1457 d:INTEGER", `WITH odd AS (SELECT name, stock, stock / 2 AS per_bin, CAST(stock AS INTEGER) / 2 AS exact FROM products WHERE stock % 2 = 1)\nSELECT name, stock, per_bin, exact, typeof(per_bin) AS cls FROM odd WHERE stock = 85`);
q("1457 d:2.0", `WITH odd AS (SELECT name, stock, stock / 2.0 AS per_bin, CAST(stock AS REAL) / 2 AS exact FROM products WHERE stock % 2 = 1)\nSELECT name, stock, per_bin, exact, typeof(per_bin) AS cls FROM odd WHERE stock = 85`);
q("1457 d:95", `WITH odd AS (SELECT name, stock, stock / 2 AS per_bin, CAST(stock AS REAL) / 2 AS exact FROM products WHERE stock % 2 = 1)\nSELECT name, stock, per_bin, exact, typeof(per_bin) AS cls FROM odd WHERE stock = 95`);

// ---- cs-1458 tag league text crown ----
q("1458 fill", `WITH keep AS (SELECT name, price, CAST(price AS INTEGER) AS shelf, PRINTF('%.2f', price) AS tag FROM products WHERE price = CAST(price AS INTEGER))\nSELECT name, price, shelf, tag, typeof(tag) AS cls FROM keep ORDER BY tag DESC LIMIT 3`);
q("1458 d:%.0f", `WITH keep AS (SELECT name, price, CAST(price AS INTEGER) AS shelf, PRINTF('%.0f', price) AS tag FROM products WHERE price = CAST(price AS INTEGER))\nSELECT name, price, shelf, tag, typeof(tag) AS cls FROM keep ORDER BY tag DESC LIMIT 3`);
q("1458 d:price", `WITH keep AS (SELECT name, price, CAST(price AS INTEGER) AS shelf, PRINTF('%.2f', price) AS tag FROM products WHERE price = CAST(price AS INTEGER))\nSELECT name, price, shelf, tag, typeof(tag) AS cls FROM keep ORDER BY price DESC LIMIT 3`);
q("1458 d:name", `WITH keep AS (SELECT name, price, CAST(price AS INTEGER) AS shelf, PRINTF('%.2f', price) AS tag FROM products WHERE price = CAST(price AS INTEGER))\nSELECT name, price, shelf, tag, typeof(tag) AS cls FROM keep ORDER BY name DESC LIMIT 3`);
q("1458 d:1", `WITH keep AS (SELECT name, price, CAST(price AS INTEGER) AS shelf, PRINTF('%.2f', price) AS tag FROM products WHERE price = CAST(price AS INTEGER))\nSELECT name, price, shelf, tag, typeof(tag) AS cls FROM keep ORDER BY tag DESC LIMIT 1`);

// ---- cs-1459 july pair ----
q("1459 fill", `WITH j AS (SELECT id, total, CAST(total AS INTEGER) AS whole, PRINTF('%.2f', total) AS plate, typeof(total) AS cls FROM orders WHERE status = 'cancelled' AND strftime('%Y-%m', created_at) = '2024-07')\nSELECT id, total, whole, plate, cls FROM j ORDER BY total DESC`);
q("1459 d:2024-11", `WITH j AS (SELECT id, total, CAST(total AS INTEGER) AS whole, PRINTF('%.2f', total) AS plate, typeof(total) AS cls FROM orders WHERE status = 'cancelled' AND strftime('%Y-%m', created_at) = '2024-11')\nSELECT id, total, whole, plate, cls FROM j ORDER BY total DESC`);
q("1459 d:ASC", `WITH j AS (SELECT id, total, CAST(total AS INTEGER) AS whole, PRINTF('%.2f', total) AS plate, typeof(total) AS cls FROM orders WHERE status = 'cancelled' AND strftime('%Y-%m', created_at) = '2024-07')\nSELECT id, total, whole, plate, cls FROM j ORDER BY total ASC`);

// ---- cs-1460 zero-proof board ----
q("1460 fill", `WITH nets AS (SELECT account, SUM(debit_cents - credit_cents) AS net_cents FROM ledger_entries GROUP BY account),\np AS (SELECT account, net_cents, net_cents / 100.0 AS dollars, typeof(net_cents) AS cls, SUM(net_cents) OVER () AS grand FROM nets)\nSELECT account, net_cents, dollars, cls, grand FROM p ORDER BY net_cents DESC LIMIT 1`);
q("1460 d:COUNT slot2", `WITH nets AS (SELECT account, SUM(debit_cents - credit_cents) AS net_cents FROM ledger_entries GROUP BY account),\np AS (SELECT account, net_cents, net_cents / 100.0 AS dollars, typeof(net_cents) AS cls, COUNT(net_cents) OVER () AS grand FROM nets)\nSELECT account, net_cents, dollars, cls, grand FROM p ORDER BY net_cents DESC LIMIT 1`);
q("1460 d:ABS slot2", `WITH nets AS (SELECT account, SUM(debit_cents - credit_cents) AS net_cents FROM ledger_entries GROUP BY account),\np AS (SELECT account, net_cents, net_cents / 100.0 AS dollars, typeof(net_cents) AS cls, ABS(net_cents) OVER () AS grand FROM nets)\nSELECT account, net_cents, dollars, cls, grand FROM p ORDER BY net_cents DESC LIMIT 1`);
q("1460 d:ASC", `WITH nets AS (SELECT account, SUM(debit_cents - credit_cents) AS net_cents FROM ledger_entries GROUP BY account),\np AS (SELECT account, net_cents, net_cents / 100.0 AS dollars, typeof(net_cents) AS cls, SUM(net_cents) OVER () AS grand FROM nets)\nSELECT account, net_cents, dollars, cls, grand FROM p ORDER BY net_cents ASC LIMIT 1`);
q("1460 d:2", `WITH nets AS (SELECT account, SUM(debit_cents - credit_cents) AS net_cents FROM ledger_entries GROUP BY account),\np AS (SELECT account, net_cents, net_cents / 100.0 AS dollars, typeof(net_cents) AS cls, SUM(net_cents) OVER () AS grand FROM nets)\nSELECT account, net_cents, dollars, cls, grand FROM p ORDER BY net_cents DESC LIMIT 2`);

// ---- shared error receipts ----
e("ROUND(price AS INTEGER)", `SELECT ROUND(price AS INTEGER) FROM products`);
e("PRINTF(price AS INTEGER)", `SELECT PRINTF(price AS INTEGER) FROM products`);
e("CAST(rung, 2)", `WITH w AS (SELECT SUM(total) OVER (ORDER BY id) AS rung FROM orders) SELECT CAST(rung, 2) FROM w`);
e("MIN(rung, 2) scalar", `WITH w AS (SELECT SUM(total) OVER (ORDER BY id) AS rung FROM orders) SELECT MIN(rung, 2) m FROM w`);
e("SUM(SUM(amount_cents)/100.0)", `SELECT SUM(SUM(amount_cents) / 100.0) FROM expenses`);
e("typeof(COUNT(total))", `SELECT typeof(COUNT(total)) c FROM orders`);
e("PRINTF(total) 1-arg", `SELECT PRINTF(total) p FROM orders LIMIT 1`);
e("CAST(89.99*100 AS INTEGER)", `SELECT CAST(89.99 * 100 AS INTEGER) a, CAST(ROUND(89.99 * 100) AS INTEGER) b FROM products LIMIT 1`);

rmSync(COPY, { force: true });
console.log("\nDONE m5-facts-w7b (temp db removed)");
