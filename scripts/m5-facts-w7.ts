/// <reference types="bun-types" />
// m5-c7 (w7 Type & cast) probe tool — read-only COPY of db/custom.db, self-deleting.
// Every figure used in cases-w7.ts must trace to this output (plus the shared
// m5-facts-d1.ts / m5-facts-c7.ts / m5-facts-r5.ts receipts).
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w7.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string, max = 24) {
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

console.log("version:", db.query("SELECT sqlite_version() v").get().v);

// ================= P1 whole-dollar orders (cs-1429) =================
q("P1 whole-dollar orders", `SELECT id, total, typeof(total) cls FROM orders WHERE total = CAST(total AS INTEGER) ORDER BY id`);
q("P1b whole-ticket MAX", `SELECT COUNT(*) n, MAX(total) mx, SUM(total) s FROM orders WHERE total = CAST(total AS INTEGER)`);
q("P1c CAST AS REAL keeps all?", `SELECT COUNT(*) n FROM orders WHERE total = CAST(total AS REAL)`);
q("P1d CAST AS TEXT keeps all?", `SELECT COUNT(*) n FROM orders WHERE total = CAST(total AS TEXT)`);

// ================= P2 suppliers (cs-1430/1435/1445/1454) =================
q("P2 suppliers by rating DESC + stars", `SELECT name, rating, CAST(rating AS INTEGER) stars, PRINTF('%.0f', rating) bar, typeof(rating) cls FROM suppliers ORDER BY rating DESC`);
q("P2b rating >= 4 census", `SELECT COUNT(*) n FROM suppliers WHERE rating >= 4`);
q("P2c rating >= 3 / >= 5", `SELECT (SELECT COUNT(*) FROM suppliers WHERE rating >= 3) ge3, (SELECT COUNT(*) FROM suppliers WHERE rating >= 5) ge5`);
q("P2d fractional ratings", `SELECT COUNT(*) n FROM suppliers WHERE rating != CAST(rating AS INTEGER)`);
q("P2e rating = CAST rating", `SELECT COUNT(*) n FROM suppliers WHERE rating = CAST(rating AS INTEGER)`);
q("P2f rating < CAST (sanity)", `SELECT COUNT(*) n FROM suppliers WHERE rating < CAST(rating AS INTEGER)`);
q("P2g rating vs CAST AS TEXT affinity", `SELECT COUNT(*) n FROM suppliers WHERE rating = CAST(rating AS TEXT)`);
q("P2h rating != CAST AS TEXT affinity", `SELECT COUNT(*) n FROM suppliers WHERE rating != CAST(rating AS TEXT)`);
q("P2i CAST rating AS REAL on row", `SELECT name, CAST(rating AS REAL) r FROM suppliers WHERE rating = 4.8`);

// ================= P3 customers region/active (cs-1434/1453/1460) =================
q("P3 region active census", `SELECT region, COUNT(*) customers, SUM(active) active_n, AVG(active) rate_raw, CAST(AVG(active) AS INTEGER) rate_floor, CAST(100.0 * SUM(active) / COUNT(*) AS INTEGER) active_pct FROM customers GROUP BY region ORDER BY region`);
q("P3b customers by signup year", `SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) yr, COUNT(*) signups, SUM(active) activated, CAST(AVG(active) AS INTEGER) rate_floor FROM customers GROUP BY yr ORDER BY yr`);
q("P3c EU customers cell", `SELECT COUNT(*) c, SUM(active) a FROM customers WHERE region = 'EU'`);
q("P3d LATAM row", `SELECT region, COUNT(*) c, SUM(active) a FROM customers WHERE region = 'LATAM' GROUP BY region`);
q("P3e US row", `SELECT region, COUNT(*) c, SUM(active) a FROM customers WHERE region = 'US' GROUP BY region`);

// ================= P4 products casts (cs-1425/1433/1442/1444/1451/1458) =================
q("P4 whole-price keepers", `SELECT id, name, price, CAST(price AS INTEGER) shelf FROM products WHERE price = CAST(price AS INTEGER) ORDER BY price DESC`);
q("P4b keepers vs CAST REAL", `SELECT COUNT(*) n FROM products WHERE price = CAST(price AS REAL)`);
q("P4c keepers vs CAST TEXT", `SELECT COUNT(*) n FROM products WHERE price = CAST(price AS TEXT)`);
q("P4d price > CAST (fractional)", `SELECT COUNT(*) n FROM products WHERE price > CAST(price AS INTEGER)`);
q("P4e price < CAST", `SELECT COUNT(*) n FROM products WHERE price < CAST(price AS INTEGER)`);
q("P4f price != CAST (fractional)", `SELECT COUNT(*) n FROM products WHERE price != CAST(price AS INTEGER)`);
q("P4g fractional ORDER BY id LIMIT 4", `SELECT name, price, typeof(price) cls, CAST(price AS INTEGER) shelf FROM products WHERE price != CAST(price AS INTEGER) ORDER BY id LIMIT 4`);
q("P4h price tag printf id1/id3", `SELECT id, name, PRINTF('%.2f', price) tag, typeof(PRINTF('%.2f', price)) tcls FROM products WHERE id IN (1, 3)`);
q("P4i cents on the wire id1/id2", `SELECT id, price, price * 100 raw_cents, typeof(price * 100) raw_cls, ROUND(price * 100) rounded, CAST(ROUND(price * 100) AS INTEGER) cents, typeof(CAST(ROUND(price * 100) AS INTEGER)) ccls FROM products WHERE id IN (1, 2)`);
q("P4j dust sum trio", `SELECT SUM(price) raw_catalog, SUM(CAST(price AS INTEGER)) clipped, SUM(price) - SUM(CAST(price AS INTEGER)) dust_raw, ROUND(SUM(price) - SUM(CAST(price AS INTEGER)), 2) dust_2, ROUND(SUM(price) - SUM(CAST(price AS INTEGER)), 0) dust_0, ROUND(SUM(price) - SUM(CAST(price AS INTEGER)), 1) dust_1, ROUND(SUM(price) - SUM(CAST(price AS INTEGER)), 3) dust_3 FROM products`);
q("P4k AVG(price)", `SELECT AVG(price) raw, CAST(AVG(price) AS INTEGER) fl FROM products`);
q("P4l price bands /10", `SELECT CAST(price / 10 AS INTEGER) band, COUNT(*) skus, SUM(stock) units FROM products GROUP BY band ORDER BY band`);
q("P4m bands /10 with skus=3", `SELECT CAST(price / 10 AS INTEGER) band, COUNT(*) skus, SUM(stock) units FROM products GROUP BY band HAVING COUNT(*) = 3 AND SUM(stock) = 482`);
q("P4n whole keepers by price DESC top3 tags", `SELECT name, PRINTF('%.2f', price) tag, CAST(price AS INTEGER) shelf FROM products WHERE price = CAST(price AS INTEGER) ORDER BY price DESC LIMIT 3`);
q("P4o same ORDER BY tag DESC (text sort)", `SELECT name, PRINTF('%.2f', price) tag FROM products WHERE price = CAST(price AS INTEGER) ORDER BY tag DESC LIMIT 3`);
q("P4p tag-text sort vs price differs?", `SELECT COUNT(*) n FROM (SELECT name FROM products WHERE price = CAST(price AS INTEGER) ORDER BY price DESC LIMIT 6) a JOIN (SELECT name FROM products WHERE price = CAST(price AS INTEGER) ORDER BY PRINTF('%.2f', price) DESC LIMIT 6) b ON a.name = b.name`);

// ================= P5 orders status pools (cs-1432/1443) =================
q("P5 status pools", `SELECT status, SUM(total) pool, CAST(SUM(total) AS INTEGER) whole, CAST(SUM(total) AS TEXT) as_text, COUNT(*) tickets FROM orders GROUP BY status ORDER BY tickets DESC`);
q("P5b pending raw precision", `SELECT SUM(total) s, ROUND(SUM(total), 10) s10, typeof(SUM(total)) cls FROM orders WHERE status = 'pending'`);
q("P5c cancelled pool trio", `SELECT SUM(total) pool, CAST(SUM(total) AS INTEGER) whole, CAST(SUM(total) AS REAL) as_real, COUNT(*) tickets, AVG(total) mean FROM orders WHERE status = 'cancelled'`);

// ================= P6 cancelled by month (cs-1450/1459) =================
q("P6 cancelled by month", `SELECT strftime('%Y-%m', created_at) mon, SUM(total) pool, CAST(SUM(total) AS INTEGER) whole, COUNT(*) n FROM orders WHERE status = 'cancelled' GROUP BY mon ORDER BY mon`);
q("P6b cancelled n=2 months", `SELECT strftime('%Y-%m', created_at) mon, SUM(total) pool, CAST(SUM(total) AS INTEGER) whole, COUNT(*) n FROM orders WHERE status = 'cancelled' GROUP BY mon HAVING COUNT(*) = 2 ORDER BY mon`);
q("P6c cancelled n=1 months", `SELECT COUNT(*) n FROM (SELECT strftime('%Y-%m', created_at) mon FROM orders WHERE status='cancelled' GROUP BY mon HAVING COUNT(*) = 1)`);
q("P6d %m merged cancelled", `SELECT strftime('%m', created_at) m, SUM(total) pool, COUNT(*) n FROM orders WHERE status='cancelled' GROUP BY m ORDER BY m`);
q("P6e %y-%M NULL group", `SELECT strftime('%y-%M', created_at) mon, SUM(total) pool, COUNT(*) n FROM orders WHERE status='cancelled' GROUP BY mon`);

// ================= P7 opex ledger by month (cs-1455) =================
q("P7 opex monthly dollars", `SELECT strftime('%Y-%m', entry_date) mon, COUNT(*) bills, SUM(debit_cents) / 100.0 dollars FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY mon ORDER BY mon`);
q("P7b opex months >= 1959", `SELECT strftime('%Y-%m', entry_date) mon, COUNT(*) bills, SUM(debit_cents) / 100.0 dollars FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY mon HAVING SUM(debit_cents) / 100.0 >= 1959 ORDER BY mon`);
q("P7c cash monthly >= 1959 (distractor check)", `SELECT strftime('%Y-%m', entry_date) mon, SUM(debit_cents) / 100.0 dollars FROM ledger_entries WHERE account = 'cash' GROUP BY mon HAVING SUM(debit_cents) / 100.0 >= 1959 ORDER BY mon`);
q("P7d sales_revenue months >= 1959", `SELECT COUNT(*) n FROM (SELECT SUM(debit_cents) d FROM ledger_entries WHERE account = 'sales_revenue' GROUP BY strftime('%Y-%m', entry_date) HAVING SUM(debit_cents)/100.0 >= 1959)`);
q("P7e opex dollars >= 2000", `SELECT COUNT(*) n FROM (SELECT strftime('%Y-%m', entry_date) mon FROM ledger_entries WHERE account='operating_expenses' GROUP BY mon HAVING SUM(debit_cents)/100.0 >= 2000)`);

// ================= P8 orders year + LIKE (cs-1431/1446/1456) =================
q("P8 year buckets orders", `SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) yr, COUNT(*) n, SUM(total) spend, PRINTF('%.2f', SUM(total)) label, typeof(PRINTF('%.2f', SUM(total))) lcls FROM orders GROUP BY yr ORDER BY yr`);
q("P8b LIKE year", `SELECT COUNT(*) n, CAST(SUM(total) / 1000 AS INTEGER) k_usd FROM orders WHERE created_at LIKE '2024-%'`);
q("P8c = '2024-%' (no wildcard)", `SELECT COUNT(*) n FROM orders WHERE created_at = '2024-%'`);
q("P8d GLOB '2024-%'", `SELECT COUNT(*) n FROM orders WHERE created_at GLOB '2024-%'`);
q("P8e > '2024-%' text compare", `SELECT COUNT(*) n FROM orders WHERE created_at > '2024-%'`);
q("P8f % text modulo", `SELECT COUNT(*) n FROM orders WHERE created_at % '2024-%'`);
q("P8g * text multiply", `SELECT COUNT(*) n FROM orders WHERE created_at * '2024-%'`);
q("P8h k_usd = / vs = 1000", `SELECT CAST(SUM(total) / 1000 AS INTEGER) div_k, CAST(SUM(total) = 1000 AS INTEGER) eq_k FROM orders WHERE created_at LIKE '2024-%'`);
q("P8i 2024/2025 k both", `SELECT CAST(SUBSTR(created_at,1,4) AS INTEGER) yr, CAST(SUM(total) / 1000 AS INTEGER) k FROM orders GROUP BY yr ORDER BY yr`);

// ================= P9 running SUM + typeof window (cs-1437) =================
q("P9 running head 3 raw vs rounded", `SELECT id, total, SUM(total) OVER (ORDER BY id) run_raw, ROUND(SUM(total) OVER (ORDER BY id), 2) run2, ROUND(SUM(total) OVER (ORDER BY id), 1) run1, ROUND(SUM(total) OVER (ORDER BY id), 0) run0 FROM orders WHERE id <= 3`);
q("P9b typeof running", `SELECT typeof(SUM(total) OVER (ORDER BY id)) cls FROM orders WHERE id <= 1`);
q("P9c MIN running", `SELECT id, MIN(total) OVER (ORDER BY id) run_min FROM orders WHERE id <= 3`);
q("P9d raw dust cell at id2", `SELECT PRINTF('%.13f', SUM(total) OVER (ORDER BY id)) dust FROM orders WHERE id = 2`);

// ================= P10 stock stats (cs-1426/1439) =================
q("P10 stock stats", `SELECT AVG(stock) raw, CAST(AVG(stock) AS INTEGER) floored, ROUND(AVG(stock)) rounded, typeof(AVG(stock)) cls, SUM(stock) total_units FROM products`);
q("P10b odd stock rows", `SELECT name, stock, CAST(stock / 2 AS INTEGER) per_bin, stock / 2.0 exact FROM products WHERE stock % 2 = 1 ORDER BY stock`);
q("P10c odd stock %2=0 count", `SELECT COUNT(*) n FROM products WHERE stock % 2 = 0`);
q("P10d hub row", `SELECT name, stock, CAST(stock / 2 AS INTEGER) per_bin FROM products WHERE stock % 2 = 1 AND stock = 85`);
q("P10e stock=95 row", `SELECT name, stock, CAST(stock / 2 AS INTEGER) per_bin FROM products WHERE stock % 2 = 1 AND stock = 95`);
q("P10f CAST AS REAL per_bin", `SELECT stock, CAST(stock / 2 AS REAL) per_bin FROM products WHERE stock = 85`);
q("P10g typeof(stock) vs AVG", `SELECT typeof(stock) s, typeof(AVG(stock)) a FROM products LIMIT 1`);

// ================= P11 expenses (cs-1427/1440/1447) =================
q("P11 Rent bills", `SELECT COUNT(*) bills, SUM(amount_cents) cents, SUM(amount_cents) / 100.0 dollars, typeof(SUM(amount_cents) / 100.0) cls FROM expenses WHERE category = 'Rent'`);
q("P11b Rent rows sample", `SELECT id, category, vendor, spent_on, amount_cents, PRINTF('%.2f', amount_cents / 100.0) line FROM expenses WHERE category = 'Rent' ORDER BY id LIMIT 3`);
q("P11c vendor = 'Rent'?", `SELECT COUNT(*) n FROM expenses WHERE vendor = 'Rent'`);
q("P11d vendor Atlas dollars", `SELECT COUNT(*) n, SUM(amount_cents) / 100.0 dollars FROM expenses WHERE vendor = 'Atlas Property GmbH'`);
q("P11e 2024-08 spike", `SELECT strftime('%Y-%m', spent_on) mon, COUNT(*) bills, SUM(amount_cents) / 100.0 dollars FROM expenses GROUP BY mon HAVING mon = '2024-08'`);
q("P11f 2024-09 row", `SELECT strftime('%Y-%m', spent_on) mon, COUNT(*) bills, SUM(amount_cents) / 100.0 dollars FROM expenses GROUP BY mon HAVING mon = '2024-09'`);
q("P11g unpadded '2024-8'", `SELECT COUNT(*) n FROM (SELECT strftime('%Y-%m', spent_on) mon FROM expenses GROUP BY mon HAVING mon = '2024-8')`);
q("P11h Travel/Ads/Tools dollars", `SELECT category, COUNT(*) bills, SUM(amount_cents) / 100.0 dollars FROM expenses GROUP BY category ORDER BY dollars DESC`);
q("P11i expenses % 100 nonzero", `SELECT COUNT(*) n FROM expenses WHERE amount_cents % 100 != 0`);

// ================= P12 printf/typeof traps (cs-1441/1456/1457/1458) =================
q("P12 printf text-sort top3 orders", `SELECT id, total, PRINTF('%.2f', total) label FROM orders ORDER BY PRINTF('%.2f', total) DESC LIMIT 3`);
q("P12b numeric-sort top3", `SELECT id, total, PRINTF('%.2f', total) label FROM orders ORDER BY total DESC LIMIT 3`);
q("P12c totals > 500 count", `SELECT COUNT(*) n FROM orders WHERE total > 500`);
q("P12d totals > 800 / > 400", `SELECT (SELECT COUNT(*) FROM orders WHERE total > 800) gt800, (SELECT COUNT(*) FROM orders WHERE total > 400) gt400`);
q("P12e ROUND with text digits arg", `SELECT ROUND(576.54, '%.2f') r, typeof(ROUND(576.54, '%.2f')) cls`);
q("P12f PRINTF('%d', real)", `SELECT PRINTF('%d', 4.7) d, PRINTF('%.0f', 4.7) f0, PRINTF('%.2f', 4.7) f2`);
q("P12g PRINTF numeric format arg", `SELECT PRINTF(2025, 1) x`);
q("P12h strftime numeric format", `SELECT strftime(206.19, created_at) s FROM orders LIMIT 1`);
q("P12i MAX scalar two args rows", `SELECT COUNT(*) n FROM (SELECT MAX(total, 2) m FROM orders)`);
q("P12j MAX scalar sample", `SELECT MAX(total, 2) m FROM orders LIMIT 1`);
q("P12k total > 500 top row", `SELECT id, total, PRINTF('%.2f', total) label, CAST(total AS INTEGER) whole FROM orders WHERE total > 500 ORDER BY total DESC LIMIT 3`);
q("P12l > TEXT affinity rows", `SELECT COUNT(*) n FROM orders WHERE total > '500'`);

// ================= P13 misc coercion/diagnostics (cs-1428/1436/1438/1460) =================
q("P13 typeof total census", `SELECT typeof(total) cls, COUNT(*) n, SUM(total) s FROM orders GROUP BY cls`);
q("P13b LENGTH(total) groups", `SELECT LENGTH(total) l, COUNT(*) n FROM orders GROUP BY l ORDER BY n DESC LIMIT 6`);
q("P13c AVG trio orders", `SELECT AVG(total) raw, CAST(AVG(total) AS INTEGER) fl, ROUND(AVG(total), 2) r2, MAX(total) mx, COUNT(total) cn FROM orders`);
q("P13d MAX scalar vs aggregate rows", `SELECT COUNT(*) n FROM (SELECT MAX(total, 2) m FROM orders)`);
q("P13e UPPER(created_at, 1, 4)", `SELECT UPPER(created_at, 1, 4) u FROM customers LIMIT 1`);
q("P13f SUM(created_at, 1, 4)", `SELECT SUM(created_at, 1, 4) s FROM customers LIMIT 1`);
q("P13g strftime(created_at, 1, 4)", `SELECT strftime(created_at, 1, 4) s, CAST(strftime(created_at, 1, 4) AS INTEGER) c FROM customers LIMIT 1`);
q("P13h SUBSTR pos 6/9 year", `SELECT SUBSTR(created_at, 1, 4) a, SUBSTR(created_at, 6, 4) b, SUBSTR(created_at, 9, 4) c, CAST(SUBSTR(created_at, 6, 4) AS INTEGER) n6 FROM customers LIMIT 1`);
q("P13i MAX(created_at, 1, 4) group shape", `SELECT CAST(MAX(created_at, 1, 4) AS INTEGER) yr, COUNT(*) n FROM orders GROUP BY yr`);
q("P13j typeof comparisons", `SELECT typeof(region = 'EU') cmp, typeof(CAST(AVG(active) AS INTEGER)) fl FROM customers`);
q("P13k customers signup year raw", `SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) yr, COUNT(*) n FROM customers GROUP BY yr ORDER BY yr`);

// ================= P14 ledger account nets (cs-1449) =================
q("P14 account nets", `SELECT account, COUNT(*) entries, SUM(debit_cents - credit_cents) / 100.0 net_dollars, typeof(SUM(debit_cents)) cls FROM ledger_entries GROUP BY account ORDER BY account`);
q("P14b cash row exact", `SELECT account, COUNT(*) entries, SUM(debit_cents - credit_cents) / 100.0 net_dollars, typeof(SUM(debit_cents)) = 'integer' class_ok FROM ledger_entries WHERE account = 'cash' GROUP BY account`);
q("P14c AR row", `SELECT account, COUNT(*) entries, SUM(debit_cents - credit_cents) / 100.0 net FROM ledger_entries WHERE account = 'accounts_receivable' GROUP BY account`);
q("P14d ledger % 100 nonzero debits", `SELECT id, debit_cents, debit_cents / 100 int_d, debit_cents / 100.0 real_d, typeof(debit_cents / 100) t1, typeof(debit_cents / 100.0) t2 FROM ledger_entries WHERE debit_cents % 100 != 0 ORDER BY id`);
q("P14e concat classes", `SELECT typeof(debit_cents / 100) || typeof(debit_cents / 100.0) both, typeof(debit_cents / 100) + typeof(debit_cents / 100.0) summed FROM ledger_entries WHERE id = 43`);

// ================= P15 window/func errors used as distractor consequences =====
function e(label: string, sql: string) {
  try {
    db.query(sql).all();
    console.log(`\n[ERR ${label}]  no error`);
  } catch (err) {
    console.log(`\n[ERR ${label}]  ${err instanceof Error ? err.message : err}`);
  }
}
e("E1 typeof(SUM(total) OVER ()) replaced by MIN", `SELECT MIN(SUM(total) OVER (ORDER BY id)) FROM orders WHERE id <= 2`);
e("E2 MAX(AVG(stock)) nested", `SELECT MAX(AVG(stock)) FROM products`);
e("E3 CAST(SUM(total) AS SUM(total))", `SELECT CAST(SUM(total) AS SUM(total)) FROM orders`);
e("E4 PRINTF(SUM(total), '%.2f')", `SELECT PRINTF(SUM(total), '%.2f') FROM orders`);
e("E5 ROUND(SUM(total), '%.2f')", `SELECT ROUND(SUM(total), '%.2f') FROM orders`);
e("E6 UPPER(active) then CAST", `SELECT CAST(UPPER(active) AS INTEGER) FROM customers LIMIT 1`);
e("E7 SUM(*) wrong args", `SELECT SUM(*) FROM orders`);
e("E8 MAX(*) wrong args", `SELECT MAX(*) FROM orders`);
e("E9 COUNT(id, 2) wrong args", `SELECT COUNT(id, 2) FROM orders`);
e("E10 LENGTH bare column", `SELECT LENGTH AS n FROM orders`);
e("E11 SUBSTR('%Y-%m', created_at)", `SELECT SUBSTR('%Y-%m', created_at) s FROM orders LIMIT 1`);
e("E12 date('%Y-%m', entry_date)", `SELECT date('%Y-%m', entry_date) d FROM ledger_entries LIMIT 1`);
e("E13 ROUND(price*100) AS REAL vs INT on id1", `SELECT CAST(ROUND(price * 100) AS REAL) r, CAST(ROUND(price * 100) AS INTEGER) i FROM products WHERE id = 1`);
e("E14 typeof vs TYPEOF case", `SELECT TYPEOF(total) t FROM orders LIMIT 1`);

rmSync(COPY, { force: true });
console.log("\nDONE m5-facts-w7 (temp db removed)");
