/// <reference types="bun-types" />
// m5-c7a pre-write structural checks (self-deleting COPY pattern)
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w7a-chk.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string, max = 8) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const shown = rows.slice(0, max).map(r => Object.values(r).map(v =>
      v === null ? "NULL" : String(v)
    ).join(" | "));
    console.log(`\n[${label}]  (${rows.length} rows)`);
    shown.forEach(s => console.log("  " + s));
  } catch (e) {
    console.log(`\n[${label}]  ERROR: ${e instanceof Error ? e.message : e}`);
  }
}

// aggregate-less HAVING without GROUP BY (structure for 1425/1435/1436/1440)
q("A1 having-no-groupby", `SELECT name, price, CAST(price AS INTEGER) AS shelf FROM products WHERE price = 199.99 HAVING shelf = 199`);
q("A2 having-no-groupby 2cond", `SELECT name, stock, stock / 2 AS per_bin, typeof(stock) AS cls FROM products WHERE stock % 2 = 1 HAVING per_bin = 42 AND stock = 85`);
q("A3 having on cte (1440 shape)", `WITH rent AS (SELECT COUNT(*) AS bills, SUM(amount_cents) / 100.0 AS dollars FROM expenses WHERE category = 'Rent') SELECT bills, dollars, typeof(dollars) AS cls, PRINTF('%.2f', dollars) AS plate FROM rent HAVING bills = 14 AND dollars = 16800`);
q("A4 1436 shape", `SELECT id, number, typeof(number) AS cls, number + 0 AS num FROM invoices WHERE id = 1 HAVING cls = 'text'`);

// unprobed distractor landings
q("B1 1429 TEXT cast", `SELECT id, total, whole, cls FROM (SELECT id, total, CAST(total AS TEXT) AS whole, typeof(total) AS cls FROM orders) WHERE total = whole AND id = 35`);
q("B2 1437 ROW_NUMBER(total)", `WITH w AS (SELECT id, total, ROW_NUMBER(total) OVER (ORDER BY id) AS rung FROM orders) SELECT id, total, ROUND(rung, 2) AS clean, typeof(rung) AS cls FROM w WHERE id = 2`);
q("B3 1434 SUM landing", `SELECT region, COUNT(*) AS customers, SUM(active) AS activated, CAST(SUM(active) AS INTEGER) AS rate_floor FROM customers GROUP BY region HAVING region = 'EU' AND activated = 7`);
q("B4 1432 BOOLEAN in-slot", `SELECT status, SUM(total) AS pool, CAST(SUM(total) AS BOOLEAN) AS whole FROM orders GROUP BY status HAVING status = 'delivered' AND whole = 15571 AND pool = 15571.07`);
q("B5 1438 TEXT in-slot", `SELECT status, typeof(SUM(total)) AS cls, COUNT(*) AS tickets, CAST(SUM(total) AS TEXT) AS whole FROM orders GROUP BY status HAVING tickets = 7 AND whole = 1152`);
q("B6 1431 TEXT in-slot", `SELECT typeof(SUBSTR(created_at, 1, 4)) AS raw_cls, CAST(SUBSTR(created_at, 1, 4) AS TEXT) AS yr, COUNT(*) AS tickets FROM orders GROUP BY yr HAVING yr = 2024 AND tickets = 90`);
q("B7 1442 band 67", `SELECT CAST(price / 67 AS INTEGER) AS band, COUNT(*) AS skus, SUM(stock) AS units FROM products GROUP BY band HAVING skus = 3 AND units = 670`);
q("B8 1442 skus=1", `SELECT CAST(price / 10 AS INTEGER) AS band, COUNT(*) AS skus, SUM(stock) AS units FROM products GROUP BY band HAVING skus = 1 AND units = 670`);
q("B9 1428 UPPER 2arg", `SELECT MAX(total) AS num_max, MAX(UPPER('%.2f', total)) AS text_max, typeof(MAX(total)) AS cls FROM orders HAVING num_max = 1088.44`);
q("B10 1428 %.0f plate", `SELECT MAX(total) AS num_max, MAX(PRINTF('%.0f', total)) AS text_max, typeof(MAX(total)) AS cls FROM orders HAVING num_max = 1088.44`);
q("B11 1427 /1000", `SELECT id, entry_date, debit_cents, typeof(debit_cents) AS cls, debit_cents / 1000 AS whole_dollars, debit_cents / 100.0 AS exact_dollars FROM ledger_entries WHERE id = 43 AND debit_cents = 625450`);
q("B12 1441 SUBSTR pos 2", `SELECT CAST(SUBSTR(created_at, 2, 4) AS INTEGER) AS yr, COUNT(*) AS tickets, CAST(SUM(total) / 1000 AS INTEGER) AS k_usd FROM orders GROUP BY yr HAVING tickets = 90 AND k_usd = 30`);
q("B13 1437 ORDER BY total", `WITH w AS (SELECT id, total, SUM(total) OVER (ORDER BY total) AS rung FROM orders) SELECT id, total, ROUND(rung, 2) AS clean, typeof(rung) AS cls FROM w WHERE id = 2`);
q("B14 1433 dust alias in HAVING", `SELECT id, name, price, CAST(price AS INTEGER) AS shelf, ROUND(price - CAST(price AS INTEGER), 2) AS dust FROM products WHERE id = 1 HAVING shelf = 89 AND dust = 0.99`);
q("B15 1433 digits 149.99", `SELECT id, name, price, CAST(price AS INTEGER) AS shelf, ROUND(price - CAST(price AS INTEGER), 149.99) AS dust FROM products WHERE id = 1 HAVING shelf = 89 AND dust = 0.99`);
q("B16 1426 REAL in-slot", `SELECT AVG(stock) AS raw, CAST(AVG(stock) AS REAL) AS floored, typeof(AVG(stock)) AS cls FROM products HAVING floored = 177`);

rmSync(COPY, { force: true });
console.log("\nDONE m5-facts-w7a-chk (temp db removed)");
