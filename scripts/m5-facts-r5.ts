/// <reference types="bun-types" />
// m5-c-r5 probe tool — read-only COPY of db/custom.db, self-deleting.
// Every figure used in cases-r5.ts must trace to this output.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5cr5.db";
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

console.log("version:", db.query("SELECT sqlite_version() v").get());

// ================= A — schema inventory =================
q("A1 table list", `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`);
q("A2 ledger count + span", `SELECT COUNT(*) n, MIN(entry_date) mn, MAX(entry_date) mx FROM ledger_entries`);
q("A3 products count", `SELECT COUNT(*) n, SUM(price) sp, SUM(stock) st FROM products`);
q("A4 order_items cols", `SELECT * FROM order_items LIMIT 3`);
q("A5 invoices count", `SELECT COUNT(*) n, MIN(issued_on) mn, MAX(issued_on) mx FROM invoices`);
q("A6 payments count", `SELECT COUNT(*) n, MIN(paid_on) mn, MAX(paid_on) mx FROM payments`);
q("A7 ledger accounts", `SELECT account, COUNT(*) n, SUM(debit_cents) d, SUM(credit_cents) c FROM ledger_entries GROUP BY account ORDER BY account`);
q("A8 ledger id vs date order", `SELECT COUNT(*) mism FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY entry_date, id) rn FROM ledger_entries) WHERE id <> rn`);
q("A9 ledger entry_date ties", `SELECT entry_date, COUNT(*) n FROM ledger_entries GROUP BY entry_date HAVING n > 1 ORDER BY n DESC LIMIT 8`);
q("A10 ledger date-tie census", `SELECT COUNT(*) tie_dates, SUM(n) rows_on_them FROM (SELECT entry_date, COUNT(*) n FROM ledger_entries GROUP BY entry_date HAVING n > 1)`);

// ================= B — ledger running (month-close) =================
q("B1 full-ledger running net head 8", `SELECT id, entry_date, ROUND(SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) bal FROM ledger_entries ORDER BY id LIMIT 8`, 8);
q("B2 running bal = 7076 rows", `SELECT id, entry_date, ROUND(SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) bal FROM ledger_entries ORDER BY id`, 200);
q("B3 final row", `SELECT id, entry_date, ROUND(SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) bal FROM ledger_entries ORDER BY id DESC LIMIT 2`, 2);
q("B4 ORDER BY id only — differs from date order?", `SELECT id, ROUND(SUM(debit_cents - credit_cents) OVER (ORDER BY id) / 100.0, 2) bal FROM ledger_entries ORDER BY id LIMIT 8`, 8);
q("B5 /100 integer-division head", `SELECT id, SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100 bal_int FROM ledger_entries ORDER BY id LIMIT 8`, 8);
q("B6 opex-only rows", `SELECT COUNT(*) n, SUM(debit_cents) d, SUM(credit_cents) c, MIN(entry_date) mn, MAX(entry_date) mx FROM ledger_entries WHERE account = 'operating_expenses'`);
q("B7 opex running head 6", `SELECT id, entry_date, ROUND(SUM(debit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) run FROM ledger_entries WHERE account = 'operating_expenses' ORDER BY id LIMIT 6`, 6);
q("B8 opex running tail", `SELECT id, entry_date, ROUND(SUM(debit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) run FROM ledger_entries WHERE account = 'operating_expenses' ORDER BY id DESC LIMIT 3`, 3);
q("B9 per-account partition nets", `SELECT DISTINCT account, ROUND(SUM(debit_cents - credit_cents) OVER (PARTITION BY account) / 100.0, 2) net FROM ledger_entries ORDER BY account`);
q("B10 opex staged months", `WITH opex AS (SELECT strftime('%Y-%m', entry_date) AS mo, SUM(debit_cents)/100.0 AS amt FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY strftime('%Y-%m', entry_date)) SELECT mo, amt, ROUND(SUM(amt) OVER (ORDER BY mo), 2) run FROM opex ORDER BY mo`, 20);
q("B11 ledger head raw (no round)", `SELECT id, SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0 bal FROM ledger_entries ORDER BY id LIMIT 4`, 4);
q("B12 credit running head 6", `SELECT id, entry_date, ROUND(SUM(credit_cents) OVER (ORDER BY id) / 100.0, 2) run FROM ledger_entries ORDER BY id LIMIT 6`, 6);

// ================= C — orders running lines =================
q("C1 running by id head 8 (reconfirm)", `SELECT id, total, ROUND(SUM(total) OVER (ORDER BY id), 2) run FROM orders ORDER BY id LIMIT 8`, 8);
q("C2 running by date,id — first 12 by id", `SELECT id, date(created_at) d, ROUND(SUM(total) OVER (ORDER BY date(created_at), id), 2) run FROM orders ORDER BY id LIMIT 12`, 12);
q("C3 day staged running head 10", `WITH days AS (SELECT date(created_at) AS d, SUM(total) AS s FROM orders GROUP BY date(created_at)) SELECT d, ROUND(SUM(s) OVER (ORDER BY d), 2) run FROM days ORDER BY d LIMIT 10`, 10);
q("C4 day count", `SELECT COUNT(*) days FROM (SELECT date(created_at) FROM orders GROUP BY date(created_at))`);
q("C5 month staged sums + running (all)", `WITH mon AS (SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS s FROM orders GROUP BY strftime('%Y-%m', created_at)) SELECT mo, ROUND(s, 2) s, ROUND(SUM(s) OVER (ORDER BY mo), 2) cum FROM mon ORDER BY mo`, 20);
q("C6 month counts + cumulative (all)", `WITH mon AS (SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n FROM orders GROUP BY strftime('%Y-%m', created_at)) SELECT mo, n, SUM(n) OVER (ORDER BY mo) cum FROM mon ORDER BY mo`, 20);
q("C7 created_at tie groups", `SELECT date(created_at) d, COUNT(*) n, GROUP_CONCAT(id) ids, ROUND(SUM(total),2) daysum FROM orders GROUP BY date(created_at) HAVING n > 1 ORDER BY d`, 20);
q("C8 RANGE vs ROWS deterministic (ids 1..12)", `SELECT id, date(created_at) d, ROUND(SUM(total) OVER (ORDER BY date(created_at), id), 2) range_run, ROUND(SUM(total) OVER (ORDER BY date(created_at), id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) rows_run FROM orders ORDER BY id LIMIT 12`, 12);
q("C9 3-order days detail", `SELECT id, date(created_at) d, total FROM orders WHERE date(created_at) IN ('2024-05-12','2024-10-13') ORDER BY d, id`, 10);
q("C10 RANGE vs ROWS at 3-order days (rows_run col)", `SELECT id, date(created_at) d, ROUND(SUM(total) OVER (ORDER BY date(created_at), id), 2) range_run, ROUND(SUM(total) OVER (ORDER BY date(created_at), id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) rows_run FROM orders WHERE id IN (5,7,6,1) OR date(created_at) IN ('2024-05-12','2024-10-13') ORDER BY d, id`, 15);
q("C11 moving 2 PRECEDING sum head 6", `SELECT id, total, ROUND(SUM(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) tri FROM orders ORDER BY id LIMIT 6`, 6);
q("C12 moving 1 PRECEDING sum head 6", `SELECT id, total, ROUND(SUM(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) pair FROM orders ORDER BY id LIMIT 6`, 6);
q("C13 moving 1 PRECEDING avg head 6", `SELECT id, total, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) mv FROM orders ORDER BY id LIMIT 6`, 6);
q("C14 moving avg ROUND digits differ?", `SELECT id, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 1) r1, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 3) r3 FROM orders ORDER BY id LIMIT 6`, 6);
q("C15 before-frame SUM head 5 (reconfirm)", `SELECT id, ROUND(SUM(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 2) prior FROM orders ORDER BY id LIMIT 5`, 5);
q("C16 tail frame head 4 (reconfirm)", `SELECT id, ROUND(SUM(total) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING), 2) rest FROM orders ORDER BY id LIMIT 4`, 4);
q("C17 CURRENT ROW AND 2 FOLLOWING head+tail", `SELECT id, ROUND(SUM(total) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING), 2) tri FROM orders ORDER BY id LIMIT 4`, 4);
q("C18 same tail 3", `SELECT id, ROUND(SUM(total) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING), 2) tri FROM orders ORDER BY id DESC LIMIT 3`, 3);
q("C19 running MAX head 8", `SELECT id, total, MAX(total) OVER (ORDER BY id) peak FROM orders ORDER BY id LIMIT 8`, 8);
q("C20 new-peak rows", `WITH peaks AS (SELECT id, total, MAX(total) OVER (ORDER BY id) AS peak FROM orders) SELECT id, total, peak FROM peaks WHERE total = peak ORDER BY id`, 20);
q("C21 Alice running head 6 + tail", `SELECT id, total, ROUND(SUM(total) OVER (ORDER BY id), 2) run FROM orders WHERE customer_id = 1 ORDER BY id LIMIT 6`, 6);
q("C22 Alice running tail", `SELECT id, ROUND(SUM(total) OVER (ORDER BY id), 2) run FROM orders WHERE customer_id = 1 ORDER BY id DESC LIMIT 2`, 2);
q("C23 Alice count + region", `SELECT COUNT(*) n FROM orders WHERE customer_id = 1`);
q("C24 region partition sums", `SELECT DISTINCT c.region, ROUND(SUM(o.total) OVER (PARTITION BY c.region), 2) rsum FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY c.region`);
q("C25 status partition counts painted", `SELECT DISTINCT status, COUNT(*) OVER (PARTITION BY status) n FROM orders ORDER BY status`);
q("C26 pending ids/totals", `SELECT id, total, date(created_at) d FROM orders WHERE status = 'pending' ORDER BY id`, 20);
q("C27 pending crowd + mv 2 PRECEDING head", `SELECT id, total, COUNT(*) OVER () crowd, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) mv FROM orders WHERE status = 'pending' ORDER BY id LIMIT 6`, 6);
q("C28 cancelled rows", `SELECT id, total, date(created_at) d FROM orders WHERE status = 'cancelled' ORDER BY id`, 10);
q("C29 cancelled sum + share head", `WITH c AS (SELECT id, total, SUM(total) OVER () AS bucket FROM orders WHERE status = 'cancelled') SELECT id, total, bucket, ROUND(100.0 * total / bucket, 2) share FROM c ORDER BY share DESC LIMIT 4`, 4);
q("C30 cancelled running", `SELECT id, total, ROUND(SUM(total) OVER (ORDER BY id), 2) run FROM orders WHERE status = 'cancelled' ORDER BY id`, 10);
q("C31 shipped running top 5 by run", `WITH r AS (SELECT id, total, SUM(total) OVER (ORDER BY id) AS raw FROM orders WHERE status = 'shipped') SELECT id, total, ROUND(raw, 2) run FROM r ORDER BY raw DESC LIMIT 5`, 5);
q("C32 shipped count", `SELECT COUNT(*) n, SUM(total) s FROM orders WHERE status = 'shipped'`);
q("C33 share of grand head 4 (reconfirm)", `SELECT id, ROUND(100.0 * total / SUM(total) OVER (), 2) pct FROM orders ORDER BY id LIMIT 4`, 4);
q("C34 LAST_VALUE repaired by date,id", `SELECT DISTINCT LAST_VALUE(total) OVER (ORDER BY date(created_at), id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) lv FROM orders`);
q("C35 running count by date,id head 10", `SELECT id, date(created_at) d, COUNT(*) OVER (ORDER BY date(created_at), id) so_far FROM orders ORDER BY id LIMIT 10`, 10);
q("C36 pending created_at ties?", `SELECT date(created_at) d, COUNT(*) n FROM orders WHERE status = 'pending' GROUP BY d HAVING n > 1`);
q("C37 cancelled created_at ties?", `SELECT date(created_at) d, COUNT(*) n FROM orders WHERE status = 'cancelled' GROUP BY d HAVING n > 1`);

// ================= D — products / suppliers (pricing, supplier, catalog, inventory) =================
q("D1 products dump", `SELECT id, name, category, price, stock, supplier_id FROM products ORDER BY id`, 30);
q("D2 price running head 8", `SELECT id, name, price, ROUND(SUM(price) OVER (ORDER BY id), 2) run FROM products ORDER BY id LIMIT 8`, 8);
q("D3 price ties?", `SELECT price, COUNT(*) n FROM products GROUP BY price HAVING n > 1`);
q("D4 stock ties?", `SELECT stock, COUNT(*) n FROM products GROUP BY stock HAVING n > 1`);
q("D5 stock running head 8", `SELECT id, name, stock, SUM(stock) OVER (ORDER BY id) run FROM products ORDER BY id LIMIT 8`, 8);
q("D6 pair sum 1 PRECEDING head 6", `SELECT id, stock, SUM(stock) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) pair FROM products ORDER BY id LIMIT 6`, 6);
q("D7 moving avg stock 2 PRECEDING", `SELECT id, stock, ROUND(AVG(stock) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) mv FROM products ORDER BY id LIMIT 8`, 8);
q("D8 per-supplier sku counts painted", `SELECT id, name, supplier_id, COUNT(*) OVER (PARTITION BY supplier_id) skus FROM products ORDER BY id`, 30);
q("D9 per-supplier stock painted", `SELECT id, name, supplier_id, stock, SUM(stock) OVER (PARTITION BY supplier_id) sup_stock FROM products ORDER BY id`, 30);
q("D10 supplier roster", `SELECT id, name, region, rating FROM suppliers ORDER BY id`);
q("D11 catalog value constant", `SELECT DISTINCT ROUND(SUM(price) OVER (), 2) cv FROM products`);
q("D12 category partition price sums", `SELECT DISTINCT category, ROUND(SUM(price) OVER (PARTITION BY category), 2) csum FROM products ORDER BY category`);
q("D13 share of catalog staged", `WITH p AS (SELECT id, name, price, ROUND(100.0 * price / SUM(price) OVER (), 2) AS share FROM products) SELECT id, name, price, share FROM p ORDER BY share DESC LIMIT 6`, 6);
q("D14 share threshold census", `WITH p AS (SELECT id, price, ROUND(100.0 * price / SUM(price) OVER (), 2) AS share FROM products) SELECT COUNT(*) n FROM p WHERE share > 6`);
q("D15 cat share Audio", `SELECT id, name, price, ROUND(100.0 * price / SUM(price) OVER (PARTITION BY category), 2) cat_share FROM products WHERE category = 'Audio' ORDER BY cat_share DESC`, 10);
q("D16 categories census", `SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY category`);
q("D17 FIRST_VALUE floor by price", `SELECT DISTINCT FIRST_VALUE(price) OVER (ORDER BY price) fv FROM products`);
q("D18 FIRST_VALUE by id", `SELECT DISTINCT FIRST_VALUE(price) OVER (ORDER BY id) fv FROM products`);
q("D19 LAST_VALUE by price full frame", `SELECT DISTINCT LAST_VALUE(name) OVER (ORDER BY price ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) lv FROM products`);
q("D20 LAST_VALUE default frame degenerate sample", `SELECT id, name, LAST_VALUE(name) OVER (ORDER BY price) lv FROM products ORDER BY price LIMIT 4`, 4);
q("D21 RANGE vs ROWS by category (products)", `SELECT id, category, price, ROUND(SUM(price) OVER (ORDER BY category), 2) range_run, ROUND(SUM(price) OVER (ORDER BY category ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) rows_run FROM products ORDER BY id`, 30);
q("D22 products by price head 6", `SELECT id, name, price FROM products ORDER BY price LIMIT 6`, 6);
q("D23 cheapest 5 cumulative", `SELECT id, price, ROUND(SUM(price) OVER (ORDER BY price), 2) run FROM products ORDER BY price LIMIT 5`, 5);
q("D24 running count products head 6", `SELECT id, name, COUNT(*) OVER (ORDER BY id) so_far FROM products ORDER BY id LIMIT 6`, 6);

// ================= E — expenses (expense universe) =================
q("E1 expenses dump head 8", `SELECT id, category, vendor, spent_on, amount_cents FROM expenses ORDER BY id LIMIT 8`, 8);
q("E2 expense month staged running (reconfirm)", `WITH mon AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents)/100.0 AS amt FROM expenses GROUP BY strftime('%Y-%m', spent_on)) SELECT mo, amt, ROUND(SUM(amt) OVER (ORDER BY mo), 2) run FROM mon ORDER BY mo`, 20);
q("E3 cents running head 6", `SELECT id, spent_on, SUM(amount_cents) OVER (ORDER BY id) cents FROM expenses ORDER BY id LIMIT 6`, 6);
q("E4 Rent rows", `SELECT id, vendor, spent_on, amount_cents FROM expenses WHERE category = 'Rent' ORDER BY id`, 20);
q("E5 Rent running", `SELECT id, vendor, ROUND(SUM(amount_cents) OVER (ORDER BY id) / 100.0, 2) run FROM expenses WHERE category = 'Rent' ORDER BY id`, 20);
q("E6 category partition sums painted", `SELECT DISTINCT category, ROUND(SUM(amount_cents) OVER (PARTITION BY category) / 100.0, 2) cat_total FROM expenses ORDER BY category`);
q("E7 expense count running head 8", `SELECT id, spent_on, category, COUNT(*) OVER (ORDER BY id) so_far FROM expenses ORDER BY id LIMIT 8`, 8);
q("E8 expense row count", `SELECT COUNT(*) n FROM expenses`);

// ================= F — invoices (month-close medium) =================
q("F1 invoices dump", `SELECT id, customer_id, number, issued_on, due_on, amount_cents, status FROM invoices ORDER BY id`, 30);
q("F2 invoice issued_on ties?", `SELECT issued_on, COUNT(*) n FROM invoices GROUP BY issued_on HAVING n > 1 ORDER BY issued_on`);
q("F3 invoice running head 8", `SELECT id, issued_on, ROUND(SUM(amount_cents) OVER (ORDER BY issued_on, id) / 100.0, 2) run FROM invoices ORDER BY id LIMIT 8`, 8);
q("F4 invoice running tail", `SELECT id, issued_on, ROUND(SUM(amount_cents) OVER (ORDER BY issued_on, id) / 100.0, 2) run FROM invoices ORDER BY id DESC LIMIT 2`, 2);
q("F5 RANGE vs ROWS invoices (if ties)", `SELECT id, issued_on, ROUND(SUM(amount_cents) OVER (ORDER BY issued_on, id) / 100.0, 2) range_run, ROUND(SUM(amount_cents) OVER (ORDER BY issued_on, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) / 100.0, 2) rows_run FROM invoices ORDER BY id`, 30);
q("F6 invoice sum", `SELECT SUM(amount_cents) s FROM invoices`);

// ================= G — error/consequence receipts for planned distractors =================
e("G1 ROWS BETWEEN UNBOUNDED FOLLOWING AND CURRENT ROW", `SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED FOLLOWING AND CURRENT ROW) FROM orders`);
e("G2 ROWS BETWEEN 2 FOLLOWING AND CURRENT ROW", `SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN 2 FOLLOWING AND CURRENT ROW) FROM orders`);
e("G3 ROWS BETWEEN CURRENT ROW AND UNBOUNDED PRECEDING", `SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND UNBOUNDED PRECEDING) FROM orders`);
e("G4 missing ROWS keyword", `SELECT SUM(total) OVER (ORDER BY id BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM orders`);
e("G5 SUM(*) illegal", `SELECT SUM(*) OVER () FROM orders`);
e("G6 AVG(*) illegal", `SELECT AVG(*) OVER () FROM orders`);
e("G7 MIN(*) illegal", `SELECT MIN(*) OVER () FROM orders`);
e("G8 COUNT(*) vs COUNT(total) same here?", `SELECT COUNT(*) OVER () a, COUNT(total) OVER () b FROM orders LIMIT 1`);
q("G9 ROUND 2 vs 3 on running SUM differ?", `SELECT COUNT(*) mism FROM (SELECT ROUND(SUM(total) OVER (ORDER BY id), 2) a, ROUND(SUM(total) OVER (ORDER BY id), 3) b FROM orders) WHERE a <> b`);
q("G10 ROUND 2 vs 4 on running SUM differ?", `SELECT COUNT(*) mism FROM (SELECT ROUND(SUM(total) OVER (ORDER BY id), 2) a, ROUND(SUM(total) OVER (ORDER BY id), 4) b FROM orders) WHERE a <> b`);
q("G11 ROUND 2 vs 1 on running SUM differ?", `SELECT COUNT(*) mism FROM (SELECT ROUND(SUM(total) OVER (ORDER BY id), 2) a, ROUND(SUM(total) OVER (ORDER BY id), 1) b FROM orders) WHERE a <> b`);
q("G12 ROUND 2 vs 0 on running SUM differ?", `SELECT COUNT(*) mism FROM (SELECT ROUND(SUM(total) OVER (ORDER BY id), 2) a, ROUND(SUM(total) OVER (ORDER BY id), 0) b FROM orders) WHERE a <> b`);
q("G13 /100 vs /100.0 on opex running differ?", `SELECT COUNT(*) mism FROM (SELECT SUM(debit_cents) OVER (ORDER BY entry_date, id) / 100 a, SUM(debit_cents) OVER (ORDER BY entry_date, id) / 100.0 b FROM ledger_entries WHERE account = 'operating_expenses') WHERE a <> b`);
q("G14 /100 vs /100.0 on full ledger running differ?", `SELECT COUNT(*) mism FROM (SELECT SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100 a, SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0 b FROM ledger_entries) WHERE a <> b`);
q("G15 opex credit_cents all zero?", `SELECT SUM(credit_cents) c FROM ledger_entries WHERE account = 'operating_expenses'`);
q("G16 Rent amounts whole dollars?", `SELECT COUNT(*) n FROM expenses WHERE category = 'Rent' AND amount_cents % 100 <> 0`);
q("G17 ledger credit running /100 vs /100.0", `SELECT COUNT(*) mism FROM (SELECT SUM(credit_cents) OVER (ORDER BY id) / 100 a, SUM(credit_cents) OVER (ORDER BY id) / 100.0 b FROM ledger_entries) WHERE a <> b`);
q("G18 strftime single-arg (now-month) GROUP BY shape", `SELECT strftime('%Y-%m') mo, COUNT(*) n FROM orders GROUP BY strftime('%Y-%m')`);
q("G19 created_at text == date(created_at)?", `SELECT COUNT(*) n FROM orders WHERE created_at <> date(created_at)`);
q("G20 RANGE BETWEEN UP AND UF vs default differ (orders by date,id)?", `SELECT COUNT(*) mism FROM (SELECT SUM(total) OVER (ORDER BY date(created_at), id) a, SUM(total) OVER (ORDER BY date(created_at), id RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) b FROM orders) WHERE a <> b`);
q("G21 ROWS vs RANGE chip swap differs (orders)?", `SELECT COUNT(*) mism FROM (SELECT SUM(total) OVER (ORDER BY date(created_at), id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) a, SUM(total) OVER (ORDER BY date(created_at), id) b FROM orders) WHERE a <> b`);
q("G22 ROWS vs RANGE swap differs (products by category)?", `SELECT COUNT(*) mism FROM (SELECT SUM(price) OVER (ORDER BY category ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) a, SUM(price) OVER (ORDER BY category) b FROM products) WHERE a <> b`);
q("G23 ORDER BY id vs entry_date,id ledger running differ?", `SELECT COUNT(*) mism FROM (SELECT SUM(debit_cents - credit_cents) OVER (ORDER BY id) a, SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) b FROM ledger_entries) WHERE a <> b`);
q("G24 ORDER BY id vs entry_date,id — same sequence?", `SELECT COUNT(*) mism FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY entry_date, id) rn FROM ledger_entries) WHERE id <> rn`);
q("G25 ORDER BY total inside OVER differs (products)?", `SELECT COUNT(*) mism FROM (SELECT SUM(stock) OVER (ORDER BY id) a, SUM(stock) OVER (ORDER BY stock) b FROM products) WHERE a <> b`);
q("G26 SUM(s) vs SUM(mo) staged differ (expenses)?", `SELECT COUNT(*) mism FROM (WITH mon AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents)/100.0 AS amt FROM expenses GROUP BY strftime('%Y-%m', spent_on)) SELECT SUM(amt) OVER (ORDER BY mo) a, SUM(mo) OVER (ORDER BY mo) b FROM mon) WHERE a <> b`);
e("G27 COUNT(raw, 2) wrong args", `WITH r AS (SELECT SUM(total) OVER (ORDER BY id) AS raw FROM orders) SELECT COUNT(raw, 2) FROM r`);
e("G28 AVG(raw, 2) wrong args", `WITH r AS (SELECT SUM(total) OVER (ORDER BY id) AS raw FROM orders) SELECT AVG(raw, 2) FROM r`);
q("G29 MAX(raw, 2) scalar runs", `WITH r AS (SELECT SUM(total) OVER (ORDER BY id) AS raw FROM orders) SELECT MAX(raw, 2) m FROM r LIMIT 3`);
q("G30 SUM(x) vs TOTAL(x) identical?", `SELECT COUNT(*) mism FROM (SELECT SUM(total) OVER (ORDER BY id) a, TOTAL(total) OVER (ORDER BY id) b FROM orders) WHERE a <> b`);
q("G31 status chip swap differs (partition counts)?", `SELECT COUNT(*) mism FROM (SELECT COUNT(*) OVER (PARTITION BY status) a, COUNT(*) OVER (PARTITION BY customer_id) b FROM orders) WHERE a <> b`);
q("G32 category vs supplier_id partition differs (products)?", `SELECT COUNT(*) mism FROM (SELECT COUNT(*) OVER (PARTITION BY category) a, COUNT(*) OVER (PARTITION BY supplier_id) b FROM products) WHERE a <> b`);
q("G33 1 vs 2 PRECEDING pair-sum differ (products)?", `SELECT COUNT(*) mism FROM (SELECT SUM(stock) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) a, SUM(stock) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) b FROM products) WHERE a <> b`);
q("G34 UNBOUNDED vs 1 PRECEDING differ (orders)?", `SELECT COUNT(*) mism FROM (SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) a, SUM(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) b FROM orders) WHERE a <> b`);
q("G35 LAST_VALUE CURRENT ROW end vs UNBOUNDED FOLLOWING differ?", `SELECT COUNT(*) mism FROM (SELECT LAST_VALUE(name) OVER (ORDER BY price ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) a, LAST_VALUE(name) OVER (ORDER BY price ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) b FROM products) WHERE a <> b`);
q("G36 1 FOLLOWING end differs (orders before-frame)?", `SELECT COUNT(*) mism FROM (SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) a, SUM(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 FOLLOWING) b FROM orders) WHERE a <> b`);
q("G37 OVER (ORDER BY id) vs OVER (ORDER BY created_at) running differ?", `SELECT COUNT(*) mism FROM (SELECT SUM(total) OVER (ORDER BY id) a, SUM(total) OVER (ORDER BY created_at) b FROM orders) WHERE a <> b`);
q("G38 DESC vs ASC month running differ?", `WITH mon AS (SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS s FROM orders GROUP BY strftime('%Y-%m', created_at)) SELECT COUNT(*) mism FROM (SELECT SUM(s) OVER (ORDER BY mo DESC) a, SUM(s) OVER (ORDER BY mo) b FROM mon) WHERE a <> b`);
q("G39 customer 1 vs 2 filter differs?", `SELECT (SELECT COUNT(*) FROM orders WHERE customer_id = 1) a, (SELECT COUNT(*) FROM orders WHERE customer_id = 2) b`);
q("G40 'Audio' category exists / products", `SELECT COUNT(*) n FROM products WHERE category = 'Audio'`);
q("G41 LIMIT 5 vs 8 differ trivially (orders head)?", `SELECT (SELECT COUNT(*) FROM (SELECT id FROM orders LIMIT 5)) a, (SELECT COUNT(*) FROM (SELECT id FROM orders LIMIT 8)) b`);
q("G42 ROUND(SUM,2) head for 1375/1385 (verify noVerify need)", `SELECT COUNT(*) cells FROM ledger_entries WHERE CAST(id AS TEXT) = '2'`);
q("G43 pending stage_share head", `WITH painted AS (SELECT id, status, total, COUNT(*) OVER (PARTITION BY status) AS stage_n, SUM(total) OVER (PARTITION BY status) AS stage_sum FROM orders) SELECT id, total, stage_n, ROUND(100.0 * total / stage_sum, 2) share FROM painted WHERE status = 'pending' ORDER BY total DESC LIMIT 5`, 5);
q("G44 pending sum", `SELECT ROUND(SUM(total), 2) s FROM orders WHERE status = 'pending'`);
q("G45 product share threshold 6 census", `WITH p AS (SELECT id, name, price, ROUND(100.0 * price / SUM(price) OVER (), 2) AS share FROM products) SELECT id, name, price, share FROM p WHERE share > 6 ORDER BY share DESC`, 10);
q("G46 shipped+pending staged top", `WITH r AS (SELECT id, total, status, SUM(total) OVER (ORDER BY id) AS raw FROM orders WHERE status = 'shipped') SELECT id, total, status, ROUND(raw, 2) run FROM r ORDER BY raw DESC LIMIT 4`, 4);
q("G47 supplier JOIN painted counts sample", `SELECT p.id, p.name, s.name supplier, COUNT(*) OVER (PARTITION BY p.supplier_id) skus FROM products p JOIN suppliers s ON s.id = p.supplier_id ORDER BY p.id LIMIT 8`, 8);
q("G48 funnel stage paint first 10 ids", `SELECT o.id, c.name, o.status, COUNT(*) OVER (PARTITION BY o.status) stage FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY o.id LIMIT 10`, 10);
q("G49 Alice named running head", `SELECT o.id, c.name, o.total, ROUND(SUM(o.total) OVER (ORDER BY o.id), 2) run FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.customer_id = 1 ORDER BY o.id LIMIT 4`, 4);
q("G50 cancelled named running", `SELECT o.id, c.name, o.total, ROUND(SUM(o.total) OVER (ORDER BY o.id), 2) run FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' ORDER BY o.id`, 10);
q("G51 inventory supplier stock first 6", `SELECT id, name, stock, SUM(stock) OVER (PARTITION BY supplier_id) sup_stock FROM products ORDER BY id LIMIT 6`, 6);
q("G52 products by price tail (LAST_VALUE target)", `SELECT id, name, price FROM products ORDER BY price DESC LIMIT 3`, 3);

// ================= ROUND 2 — exact case queries + stability =================
console.log("\n===== ROUND 2 =====");

const canon = (rows: Record<string, unknown>[]) => JSON.stringify(rows);
function stable(label: string, sql: string, runs = 3) {
  let first: string | null = null;
  let ok = true;
  for (let i = 0; i < runs; i++) {
    const j = canon(db.query(sql).all() as Record<string, unknown>[]);
    if (first === null) first = j;
    else if (j !== first) ok = false;
  }
  console.log(`[STAB ${label}]  ${ok ? "STABLE x" + runs : "UNSTABLE"}`);
}

// P1 — 1376 moving avg price
q("P1a movavg price head 8", `SELECT id, price, ROUND(AVG(price) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) mv FROM products ORDER BY id LIMIT 8`, 8);
q("P1b movavg price ROUND mismatches (vs 2)", `SELECT
  (SELECT COUNT(*) FROM (SELECT ROUND(AVG(price) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) a, ROUND(AVG(price) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 0) b FROM products) WHERE a <> b) r0,
  (SELECT COUNT(*) FROM (SELECT ROUND(AVG(price) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) a, ROUND(AVG(price) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 1) b FROM products) WHERE a <> b) r1,
  (SELECT COUNT(*) FROM (SELECT ROUND(AVG(price) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) a, ROUND(AVG(price) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 3) b FROM products) WHERE a <> b) r3`);

// P2/P3/P4/P5 — the four tie queries, exact + stability
const TIE_ORDERS = `SELECT id, date(created_at) AS d, ROUND(SUM(total) OVER (ORDER BY date(created_at)), 2) AS range_run, ROUND(SUM(total) OVER (ORDER BY date(created_at) ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS rows_run FROM orders ORDER BY id LIMIT 12`;
q("P2a orders tie LIMIT 12", TIE_ORDERS, 12);
q("P2b orders tie mismatch counts", `SELECT
  (SELECT COUNT(*) FROM (SELECT SUM(total) OVER (ORDER BY date(created_at) ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) a, SUM(total) OVER (ORDER BY date(created_at)) b FROM orders) WHERE a <> b) rows_vs_range,
  (SELECT COUNT(*) FROM (SELECT SUM(total) OVER (ORDER BY date(created_at) ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) a, SUM(total) OVER (ORDER BY date(created_at) ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) b FROM orders) WHERE a <> b) vs_1prec,
  (SELECT COUNT(*) FROM (SELECT SUM(total) OVER (ORDER BY date(created_at)) a, SUM(total) OVER (ORDER BY id) b FROM orders) WHERE a <> b) datekey_vs_id,
  (SELECT COUNT(*) FROM (SELECT SUM(total) OVER (ORDER BY date(created_at)) a, SUM(total) OVER (ORDER BY shipped_at) b FROM orders) WHERE a <> b) datekey_vs_ship`);
stable("P2c orders tie", TIE_ORDERS);

const TIE_PENDING = `SELECT o.id, c.name, date(o.created_at) AS d, o.total, ROUND(SUM(o.total) OVER (ORDER BY date(o.created_at)), 2) AS range_run, ROUND(SUM(o.total) OVER (ORDER BY date(o.created_at) ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS rows_run FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'pending' ORDER BY o.id`;
q("P3a pending tie all 14", TIE_PENDING, 16);
stable("P3b pending tie", TIE_PENDING);

const TIE_LEDGER = `SELECT id, entry_date, ROUND(SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date) / 100.0, 2) AS day_fold, ROUND(SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) / 100.0, 2) AS row_run FROM ledger_entries ORDER BY id LIMIT 12`;
q("P4a ledger posting-day tie LIMIT 12", TIE_LEDGER, 12);
q("P4b ledger tie mismatches", `SELECT
  (SELECT COUNT(*) FROM (SELECT SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) a, SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date) b FROM ledger_entries) WHERE a <> b) rows_vs_range,
  (SELECT COUNT(*) FROM (SELECT SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date) a, SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) b FROM ledger_entries) WHERE a <> b) fold_vs_tiebreak,
  (SELECT COUNT(*) FROM (SELECT SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) a, SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) b FROM ledger_entries) WHERE a <> b) vs_1prec`);
stable("P4c ledger tie", TIE_LEDGER);

const TIE_PRODUCTS = `SELECT id, category, price, ROUND(SUM(price) OVER (ORDER BY category), 2) AS range_run, ROUND(SUM(price) OVER (ORDER BY category ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS rows_run FROM products ORDER BY id`;
q("P5a products category tie all 16", TIE_PRODUCTS, 16);
q("P5b products tie mismatches", `SELECT
  (SELECT COUNT(*) FROM (SELECT SUM(price) OVER (ORDER BY category ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) a, SUM(price) OVER (ORDER BY category ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) b FROM products) WHERE a <> b) vs_1prec,
  (SELECT COUNT(*) FROM (SELECT SUM(price) OVER (ORDER BY category) a, SUM(price) OVER (ORDER BY price) b FROM products) WHERE a <> b) catkey_vs_price`);
stable("P5c products tie", TIE_PRODUCTS);

// P6 — ledger rows painted
q("P6 ledger COUNT(*) OVER () distinct", `SELECT DISTINCT COUNT(*) OVER () n FROM ledger_entries`);

// P7 — stock shares
q("P7 stock shares top 5", `SELECT id, name, stock, ROUND(100.0 * stock / SUM(stock) OVER (), 2) share FROM products ORDER BY stock DESC LIMIT 5`, 5);

// P8 — growth dual running
q("P8 growth dual running", `WITH mon AS (SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n, SUM(total) AS s FROM orders GROUP BY strftime('%Y-%m', created_at)) SELECT mo, n, SUM(n) OVER (ORDER BY mo) cum_n, ROUND(SUM(s) OVER (ORDER BY mo), 2) cum_s FROM mon ORDER BY mo`, 16);

// P9 — supplier partition running full
q("P9 supplier running full", `SELECT p.id, p.name, s.name AS supplier, SUM(p.stock) OVER (PARTITION BY p.supplier_id ORDER BY p.id) AS sup_run, COUNT(*) OVER (PARTITION BY p.supplier_id) AS sup_skus FROM products p JOIN suppliers s ON s.id = p.supplier_id ORDER BY p.id`, 16);
q("P9b join-key distractor", `SELECT COUNT(*) n FROM products p JOIN suppliers s ON s.id = p.id`);

// P10 — expenses GROUP BY spent_on uniqueness
q("P10 spent_on buckets", `SELECT COUNT(*) n FROM (SELECT spent_on FROM expenses GROUP BY spent_on)`);

// P11 — cash staged months (distractor for opex case)
q("P11 cash months", `WITH cash AS (SELECT strftime('%Y-%m', entry_date) AS mo, SUM(debit_cents - credit_cents)/100.0 AS amt FROM ledger_entries WHERE account = 'cash' GROUP BY strftime('%Y-%m', entry_date)) SELECT mo, amt, ROUND(SUM(amt) OVER (ORDER BY mo), 2) run FROM cash ORDER BY mo`, 16);

// P12 — 1409 distractor keys
q("P12 so_far distractor mismatches", `SELECT
  (SELECT COUNT(*) FROM (SELECT COUNT(*) OVER (ORDER BY date(created_at), id) a, COUNT(*) OVER (ORDER BY shipped_at, id) b FROM orders) WHERE a <> b) vs_shipped,
  (SELECT COUNT(*) FROM (SELECT COUNT(*) OVER (ORDER BY date(created_at), id) a, MIN(id) OVER (ORDER BY date(created_at), id) b FROM orders) WHERE a <> b) vs_minid,
  (SELECT COUNT(*) FROM (SELECT COUNT(*) OVER (ORDER BY date(created_at), id) a, COUNT(*) OVER (ORDER BY total, id) b FROM orders) WHERE a <> b) vs_total`);

// P14 — 1396 cheap build-up ROUND1 mismatch
q("P14 cheap build ROUND mismatches", `SELECT
  (SELECT COUNT(*) FROM (SELECT ROUND(SUM(price) OVER (ORDER BY price), 2) a, ROUND(SUM(price) OVER (ORDER BY price), 1) b FROM products) WHERE a <> b) r1,
  (SELECT COUNT(*) FROM (SELECT ROUND(SUM(price) OVER (ORDER BY price), 2) a, ROUND(SUM(price) OVER (ORDER BY price), 0) b FROM products) WHERE a <> b) r0,
  (SELECT COUNT(*) FROM (SELECT SUM(price) OVER (ORDER BY price) a, SUM(price) OVER (ORDER BY id) b FROM products) WHERE a <> b) keymis`);

// P15 — catalog avg
q("P15 AVG(price) OVER () distinct", `SELECT DISTINCT ROUND(AVG(price) OVER (), 2) a FROM products`);

// P16 — 1391 end-bound mismatches
q("P16 pair end mismatches", `SELECT
  (SELECT COUNT(*) FROM (SELECT SUM(stock) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) a, SUM(stock) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) b FROM products) WHERE a <> b) f1,
  (SELECT COUNT(*) FROM (SELECT SUM(stock) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) a, SUM(stock) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND UNBOUNDED FOLLOWING) b FROM products) WHERE a <> b) uf,
  (SELECT COUNT(*) FROM (SELECT SUM(stock) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) a, SUM(stock) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) b FROM products) WHERE a <> b) p2`);

// P17/P18 — ROUND digit consequences on moving averages
q("P17 stock movavg ROUND mismatches (correct 1)", `SELECT
  (SELECT COUNT(*) FROM (SELECT ROUND(AVG(stock) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) a, ROUND(AVG(stock) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 0) b FROM products) WHERE a <> b) r0,
  (SELECT COUNT(*) FROM (SELECT ROUND(AVG(stock) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) a, ROUND(AVG(stock) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) b FROM products) WHERE a <> b) r2`);
q("P18 orders movavg ROUND mismatches (correct 2)", `SELECT
  (SELECT COUNT(*) FROM (SELECT ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) a, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 0) b FROM orders) WHERE a <> b) r0,
  (SELECT COUNT(*) FROM (SELECT ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) a, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 1) b FROM orders) WHERE a <> b) r1,
  (SELECT COUNT(*) FROM (SELECT ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2) a, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 3) b FROM orders) WHERE a <> b) r3`);

// P19 — 1389 bucket distractor shapes
q("P19 bucket shapes", `SELECT
  (SELECT COUNT(*) FROM (SELECT created_at FROM orders GROUP BY created_at)) a,
  (SELECT COUNT(*) FROM (SELECT strftime('%Y', created_at) FROM orders GROUP BY strftime('%Y', created_at))) b,
  (SELECT COUNT(*) FROM (SELECT strftime('%Y-%m', created_at) FROM orders GROUP BY strftime('%Y-%m', created_at))) c`);

// P20 — 1400 100 vs 100.0
q("P20 cancelled share 100 vs 100.0", `SELECT COUNT(*) mism FROM (WITH pool AS (SELECT id, total, SUM(total) OVER () AS bucket FROM orders WHERE status = 'cancelled') SELECT ROUND(100 * total / bucket, 2) a, ROUND(100.0 * total / bucket, 2) b FROM pool) WHERE a <> b`);

// P21 — Apparel shares (distractor)
q("P21 Apparel cat shares", `SELECT id, name, price, ROUND(100.0 * price / SUM(price) OVER (PARTITION BY category), 2) share FROM products WHERE category = 'Apparel' ORDER BY share DESC`, 4);

// P22/P25 — 1393/1413 peaks distractors
q("P22 MIN trough rows", `WITH t AS (SELECT id, total, MIN(total) OVER (ORDER BY id) AS low FROM orders) SELECT COUNT(*) n FROM t WHERE total = low`);
q("P25 SUM=total rows (ORDER BY id)", `WITH t AS (SELECT id, total, SUM(total) OVER (ORDER BY id) AS run FROM orders) SELECT COUNT(*) n FROM t WHERE total = run`);
q("P25b peak rows ORDER BY total inside OVER", `WITH t AS (SELECT id, total, MAX(total) OVER (ORDER BY total) AS peak FROM orders) SELECT COUNT(*) n FROM t WHERE total = peak`);

// P23 — LAST_VALUE by id full frame
q("P23 LAST_VALUE by id full frame", `SELECT DISTINCT LAST_VALUE(name) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) lv FROM products`);

// P24 — 1383 start=end frame + prior AVG
e("P24a BETWEEN 1 PRECEDING AND 1 PRECEDING", `SELECT SUM(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 PRECEDING) FROM orders`);
q("P24b prior AVG head 4", `SELECT id, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 2) prior FROM orders ORDER BY id LIMIT 4`, 4);

// P32 — 1407 pending mv ROUND mismatches (correct 2)
q("P32 pending mv ROUND mismatches", `SELECT
  (SELECT COUNT(*) FROM (SELECT ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) a, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 0) b FROM orders WHERE status = 'pending') WHERE a <> b) r0,
  (SELECT COUNT(*) FROM (SELECT ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) a, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) b FROM orders WHERE status = 'pending') WHERE a <> b) r1,
  (SELECT COUNT(*) FROM (SELECT ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) a, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 3) b FROM orders WHERE status = 'pending') WHERE a <> b) r3`);

// P33/P34 — running-line ROUND mismatches
q("P33 cancelled running ROUND mismatches", `SELECT
  (SELECT COUNT(*) FROM (SELECT ROUND(SUM(total) OVER (ORDER BY id), 2) a, ROUND(SUM(total) OVER (ORDER BY id), 1) b FROM orders WHERE status = 'cancelled') WHERE a <> b) r1,
  (SELECT COUNT(*) FROM (SELECT ROUND(SUM(total) OVER (ORDER BY id), 2) a, ROUND(SUM(total) OVER (ORDER BY id), 0) b FROM orders WHERE status = 'cancelled') WHERE a <> b) r0`);
q("P34 Alice running ROUND mismatches", `SELECT
  (SELECT COUNT(*) FROM (SELECT ROUND(SUM(total) OVER (ORDER BY id), 2) a, ROUND(SUM(total) OVER (ORDER BY id), 1) b FROM orders WHERE customer_id = 1) WHERE a <> b) r1,
  (SELECT COUNT(*) FROM (SELECT ROUND(SUM(total) OVER (ORDER BY id), 2) a, ROUND(SUM(total) OVER (ORDER BY id), 0) b FROM orders WHERE customer_id = 1) WHERE a <> b) r0`);

// P36 — 1385 memo order mismatch
q("P36 opex memo-order mismatch", `SELECT COUNT(*) mism FROM (SELECT SUM(debit_cents) OVER (ORDER BY entry_date, id) a, SUM(debit_cents) OVER (ORDER BY memo) b FROM ledger_entries WHERE account = 'operating_expenses') WHERE a <> b`);

// P37 — 1394 name-key floor
q("P37 floor by name", `SELECT DISTINCT FIRST_VALUE(price) OVER (ORDER BY name) fv FROM products`);

// P47 — 1392 opex staged exact + amt-order distractor
q("P47a opex staged (exact template)", `WITH opex AS (SELECT strftime('%Y-%m', entry_date) AS mo, SUM(debit_cents)/100.0 AS amt FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY strftime('%Y-%m', entry_date)) SELECT mo, amt, ROUND(SUM(amt) OVER (ORDER BY mo), 2) AS run FROM opex ORDER BY mo`, 16);
q("P47b opex amt-order mismatch", `WITH opex AS (SELECT strftime('%Y-%m', entry_date) AS mo, SUM(debit_cents)/100.0 AS amt FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY strftime('%Y-%m', entry_date)) SELECT COUNT(*) mism FROM (SELECT SUM(amt) OVER (ORDER BY mo) a, SUM(amt) OVER (ORDER BY amt) b FROM opex) WHERE a <> b`);
q("P47c strftime-on-memo bucket", `SELECT COUNT(*) n FROM (SELECT strftime('%Y-%m', memo) m FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY strftime('%Y-%m', memo))`);

// P55 — 1413 peaks exact (staged)
q("P55 peaks exact", `WITH peaks AS (SELECT id, total, MAX(total) OVER (ORDER BY id) AS peak FROM orders) SELECT id, total, peak FROM peaks WHERE total = peak ORDER BY id`, 8);

// P56 — 1410 shipped_at key head (distractor values)
q("P56 shipped_at key head 4", `SELECT id, date(created_at) d, ROUND(SUM(total) OVER (ORDER BY shipped_at), 2) run FROM orders ORDER BY id LIMIT 4`, 4);

// P57 — 1380 cancelled named running ROUND mismatch (correct 2)
q("P57 cancelled named ROUND r1/r0", `SELECT
  (SELECT COUNT(*) FROM (SELECT ROUND(SUM(o.total) OVER (ORDER BY o.id), 2) a, ROUND(SUM(o.total) OVER (ORDER BY o.id), 1) b FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled') WHERE a <> b) r1,
  (SELECT COUNT(*) FROM (SELECT ROUND(SUM(o.total) OVER (ORDER BY o.id), 2) a, ROUND(SUM(o.total) OVER (ORDER BY o.id), 0) b FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled') WHERE a <> b) r0`);

// P58 — 1377 exact 6-slot output
q("P58 funnel staged exact", `WITH painted AS (SELECT id, status, total, COUNT(*) OVER (PARTITION BY status) AS stage_n, SUM(total) OVER (PARTITION BY status) AS stage_sum FROM orders) SELECT id, total, stage_n, ROUND(100.0 * total / stage_sum, 2) AS share FROM painted WHERE status = 'pending' ORDER BY total DESC LIMIT 5`, 6);

// P59 — 1389 exact + order-key distractor
q("P59a growth dual exact", `WITH mon AS (SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n, SUM(total) AS s FROM orders GROUP BY strftime('%Y-%m', created_at)) SELECT mo, n, SUM(n) OVER (ORDER BY mo) AS cum_n, ROUND(SUM(s) OVER (ORDER BY mo), 2) AS cum_s FROM mon ORDER BY mo`, 16);
q("P59b growth n-order mismatch", `WITH mon AS (SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n, SUM(total) AS s FROM orders GROUP BY strftime('%Y-%m', created_at)) SELECT COUNT(*) mism FROM (SELECT SUM(n) OVER (ORDER BY mo) a, SUM(n) OVER (ORDER BY n) b FROM mon) WHERE a <> b`);

// P60 — 1416 exact + key distractor (have P5a) — outer order check
q("P60 products tie outer-order mismatch", `SELECT COUNT(*) mism FROM (SELECT id FROM (SELECT id, SUM(price) OVER (ORDER BY category) r FROM products ORDER BY id) ) `);

// P61 — 1384 name-order rows
q("P61 products by name head 3", `SELECT id, name, COUNT(*) OVER (ORDER BY id) so_far FROM products ORDER BY name LIMIT 3`, 3);

// P62 — 1386 exact
q("P62 pricing share exact", `WITH p AS (SELECT id, name, price, ROUND(100.0 * price / SUM(price) OVER (), 2) AS share FROM products) SELECT id, name, price, share FROM p WHERE share > 6 ORDER BY share DESC`, 8);

// P63 — 1400 exact
q("P63 refund share exact", `WITH pool AS (SELECT id, total, SUM(total) OVER () AS bucket FROM orders WHERE status = 'cancelled') SELECT id, total, ROUND(100.0 * total / bucket, 2) AS share FROM pool ORDER BY share DESC LIMIT 4`, 4);

// P64 — 1411 exact
q("P64 stock share exact", `SELECT id, name, stock, ROUND(100.0 * stock / SUM(stock) OVER (), 2) AS stock_share FROM products ORDER BY stock DESC LIMIT 5`, 5);

// P65 — 1412 Rent running exact + id-distractor
q("P65a Rent running exact", `SELECT id, vendor, ROUND(SUM(amount_cents) OVER (ORDER BY id) / 100.0, 2) AS rent_run FROM expenses WHERE category = 'Rent' ORDER BY id LIMIT 6`, 6);
q("P65b Rent id-sum mismatch", `SELECT COUNT(*) mism FROM (SELECT SUM(amount_cents) OVER (ORDER BY id) a, SUM(id) OVER (ORDER BY id) b FROM expenses WHERE category = 'Rent') WHERE a <> b`);

// P66 — 1382 exact + spent_on key
q("P66a expense month staged exact", `WITH mon AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents)/100.0 AS amt FROM expenses GROUP BY strftime('%Y-%m', spent_on)) SELECT mo, amt, ROUND(SUM(amt) OVER (ORDER BY mo), 2) AS run FROM mon ORDER BY mo LIMIT 6`, 6);
q("P66b expense spent_on-key mismatch", `WITH mon AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents)/100.0 AS amt FROM expenses GROUP BY strftime('%Y-%m', spent_on)) SELECT COUNT(*) mism FROM (SELECT SUM(amt) OVER (ORDER BY mo) a, SUM(amt) OVER (ORDER BY amt) b FROM mon) WHERE a <> b`);

// P67 — 1375 exact + distractor mismatches
q("P67a ledger net running exact", `SELECT id, entry_date, ROUND(SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) AS bal FROM ledger_entries ORDER BY id LIMIT 8`, 8);
q("P67b ledger distractor mismatches", `SELECT
  (SELECT COUNT(*) FROM (SELECT SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) a, SUM(debit_cents) OVER (ORDER BY entry_date, id) b FROM ledger_entries) WHERE a <> b) vs_debit,
  (SELECT COUNT(*) FROM (SELECT SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) a, SUM(credit_cents - debit_cents) OVER (ORDER BY entry_date, id) b FROM ledger_entries) WHERE a <> b) vs_flip,
  (SELECT COUNT(*) FROM (SELECT SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) a, SUM(debit_cents - credit_cents) OVER (ORDER BY memo) b FROM ledger_entries) WHERE a <> b) vs_memo,
  (SELECT COUNT(*) FROM (SELECT SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) a, SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date DESC, id) b FROM ledger_entries) WHERE a <> b) vs_desc`);

// P68 — 1385 exact + distractors
q("P68a opex running exact", `SELECT id, entry_date, ROUND(SUM(debit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) AS opex_run FROM ledger_entries WHERE account = 'operating_expenses' ORDER BY id`, 16);
q("P68b opex MAX-running head 3", `SELECT id, MAX(debit_cents) OVER (ORDER BY entry_date, id) mx FROM ledger_entries WHERE account = 'operating_expenses' ORDER BY id LIMIT 3`, 3);

// P69 — 1409 exact
q("P69 running count by date exact", `SELECT id, date(created_at) AS d, COUNT(*) OVER (ORDER BY date(created_at), id) AS so_far FROM orders ORDER BY id LIMIT 10`, 10);

// P70 — 1398 exact
q("P70 supplier exact", `SELECT p.id, p.name, s.name AS supplier, SUM(p.stock) OVER (PARTITION BY p.supplier_id ORDER BY p.id) AS sup_run, COUNT(*) OVER (PARTITION BY p.supplier_id) AS sup_skus FROM products p JOIN suppliers s ON s.id = p.supplier_id ORDER BY p.id`, 16);

// P71 — 1404 exact + id-key variant
q("P71a LAST_VALUE repair exact", `SELECT id, name, price, LAST_VALUE(name) OVER (ORDER BY price ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_by_price FROM products ORDER BY price`, 16);
q("P71b LAST_VALUE by id key", `SELECT DISTINCT LAST_VALUE(name) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) lv FROM products`);

// P72 — 1379 exact
q("P72 month staged exact", `WITH mon AS (SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS s FROM orders GROUP BY strftime('%Y-%m', created_at)) SELECT mo, ROUND(SUM(s) OVER (ORDER BY mo), 2) AS cum FROM mon ORDER BY mo`, 16);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
