// M5 C7 probe — engine-verified receipts for the w7 "Type & cast" wave
// (cases cs-1427…cs-1464, 38 cases). Run: bun scripts/m5-facts-c7.ts
// Read-only COPY of db/custom.db (.m5c7.db), removed on exit.
// Every numeric claim in cases-w7.ts must trace to this output or m5-facts-r7.ts.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const TMP = ".m5c7.db";
rmSync(TMP, { force: true });
copyFileSync("db/custom.db", TMP);
const db = new Database(TMP, { readonly: true });

console.log("SQLite", (db.prepare("SELECT sqlite_version() AS v").get() as any).v);

const q = (label: string, sql: string, max = 30) => {
  console.log(`\n## ${label}\n   ${sql.replace(/\s+/g, " ")}`);
  try {
    const rows = db.prepare(sql).all() as Record<string, unknown>[];
    const shown = rows.slice(0, max).map(r => Object.values(r).map(v =>
      v === null ? "NULL" : String(v)
    ).join(" | "));
    console.log(`   (${rows.length} rows)`);
    shown.forEach(s => console.log("   " + s));
    if (rows.length > max) console.log(`   … +${rows.length - max} more`);
  } catch (e) {
    console.log("   ERROR: " + (e as Error).message);
  }
};
const err = (label: string, sql: string) => q("ERR·" + label, sql);

// ===== C01 typeof census over every table's money/date columns =====
q("C01 typeof orders cols", `SELECT typeof(id) a, typeof(customer_id) b, typeof(status) c, typeof(total) d, typeof(created_at) e, typeof(shipped_at) f FROM orders WHERE shipped_at IS NOT NULL LIMIT 1`);
q("C02 typeof orders shipped_at NULL", `SELECT typeof(shipped_at) f, shipped_at FROM orders WHERE shipped_at IS NULL LIMIT 1`);
q("C03 typeof invoices cols", `SELECT typeof(id) a, typeof(customer_id) b, typeof(number) c, typeof(issued_on) d, typeof(due_on) e, typeof(amount_cents) f, typeof(status) g FROM invoices LIMIT 1`);
q("C04 typeof payments cols", `SELECT typeof(id) a, typeof(invoice_id) b, typeof(paid_on) c, typeof(amount_cents) d, typeof(method) e FROM payments LIMIT 1`);
q("C05 typeof expenses cols", `SELECT typeof(id) a, typeof(category) b, typeof(vendor) c, typeof(spent_on) d, typeof(amount_cents) e FROM expenses LIMIT 1`);
q("C06 typeof order_items cols", `SELECT typeof(quantity) a, typeof(unit_price) b, typeof(product_id) c FROM order_items LIMIT 1`);
q("C07 typeof products cols", `SELECT typeof(price) a, typeof(stock) b, typeof(category) c FROM products LIMIT 1`);
q("C08 typeof suppliers cols", `SELECT typeof(rating) a, typeof(name) b, typeof(region) c FROM suppliers LIMIT 1`);

// ===== C09 invoices census + number format =====
q("C09 invoices count + cents", `SELECT COUNT(*) n, SUM(amount_cents) cents, MIN(amount_cents) lo, MAX(amount_cents) hi FROM invoices`);
q("C10 invoice rows", `SELECT id, number, amount_cents, status, issued_on FROM invoices ORDER BY id`, 30);
q("C11 invoice number +0", `SELECT number, number + 0 AS num_plus, typeof(number + 0) cls, typeof(number) raw_cls FROM invoices ORDER BY id LIMIT 5`);
q("C12 invoice cents non-round", `SELECT COUNT(*) n FROM invoices WHERE amount_cents % 100 != 0`);
q("C13 invoice division trap", `SELECT id, amount_cents, amount_cents / 100 int_div, amount_cents / 100.0 real_div FROM invoices WHERE amount_cents % 100 != 0 ORDER BY id LIMIT 10`);
q("C14 invoice printf label", `SELECT number, PRINTF('%.2f', amount_cents / 100.0) label, typeof(PRINTF('%.2f', amount_cents / 100.0)) cls FROM invoices ORDER BY id LIMIT 6`);
q("C15 invoice label min/max as text", `SELECT MIN(PRINTF('%.2f', amount_cents / 100.0)) tmin, MAX(PRINTF('%.2f', amount_cents / 100.0)) tmax, MIN(amount_cents / 100.0) nmin, MAX(amount_cents / 100.0) nmax FROM invoices`);

// ===== C16 payments =====
q("C16 payments census", `SELECT COUNT(*) n, SUM(amount_cents) cents, MIN(amount_cents) lo, MAX(amount_cents) hi FROM payments`);
q("C17 payments methods", `SELECT method, COUNT(*) n, SUM(amount_cents) cents FROM payments GROUP BY method ORDER BY n DESC`);
q("C18 payments avg trio", `SELECT AVG(amount_cents) raw, CAST(AVG(amount_cents) AS INTEGER) fl, ROUND(AVG(amount_cents)) rd, typeof(AVG(amount_cents)) ar, typeof(SUM(amount_cents)) sr FROM payments`);
q("C19 payments vs invoices", `SELECT (SELECT SUM(amount_cents) FROM invoices) inv_cents, (SELECT SUM(amount_cents) FROM payments) pay_cents`);

// ===== C20 expenses =====
q("C20 expenses census", `SELECT COUNT(*) n, SUM(amount_cents) cents, MIN(amount_cents) lo, MAX(amount_cents) hi FROM expenses`);
q("C21 expenses non-round cents", `SELECT COUNT(*) n FROM expenses WHERE amount_cents % 100 != 0`);
q("C22 expenses division trap", `SELECT id, category, amount_cents, amount_cents / 100 int_div, amount_cents / 100.0 real_div FROM expenses WHERE amount_cents % 100 != 0 ORDER BY id LIMIT 12`);
q("C23 expenses category cents", `SELECT category, COUNT(*) n, SUM(amount_cents) cents FROM expenses GROUP BY category ORDER BY cents DESC`);
q("C24 expenses avg trio", `SELECT AVG(amount_cents) raw, CAST(AVG(amount_cents) AS INTEGER) fl, ROUND(AVG(amount_cents)) rd, typeof(AVG(amount_cents)) cls FROM expenses`);

// ===== C25 ledger division traps row-level =====
q("C25 ledger debit non-round rows", `SELECT COUNT(*) n FROM ledger_entries WHERE debit_cents % 100 != 0`);
q("C26 ledger debit trap rows", `SELECT id, entry_date, account, debit_cents, debit_cents / 100 int_div, debit_cents / 100.0 real_div FROM ledger_entries WHERE debit_cents % 100 != 0 ORDER BY id LIMIT 12`);
q("C27 ledger credit non-round rows", `SELECT COUNT(*) n FROM ledger_entries WHERE credit_cents % 100 != 0`);
q("C28 ledger accounts cents", `SELECT account, COUNT(*) n, SUM(debit_cents) deb, SUM(credit_cents) cred, SUM(debit_cents - credit_cents) net FROM ledger_entries GROUP BY account ORDER BY net DESC`);
q("C29 ledger debits minus credits grand", `SELECT SUM(debit_cents - credit_cents) net, typeof(SUM(debit_cents - credit_cents)) cls, SUM(debit_cents) / 100 int_k, SUM(debit_cents) / 100.0 real_k FROM ledger_entries`);
q("C30 ledger memo sample", `SELECT id, memo, SUBSTR(memo, 1, 4) yr_text, CAST(SUBSTR(memo, 1, 4) AS INTEGER) yr FROM ledger_entries ORDER BY id LIMIT 8`);

// ===== C31 literal CAST / typeof demos =====
q("C31 cast literals", `SELECT CAST(7262.35 AS INTEGER) a, CAST(1088.44 AS INTEGER) b, CAST(-1326.87 AS INTEGER) c, ROUND(-1326.87) d, CAST(0.875 AS INTEGER) e, typeof(CAST(0.875 AS INTEGER)) f`);
q("C32 text compare traps", `SELECT '9' > '10' t1, '1088.44' < '25.47' t2, '999.99' > '1088.44' t3, '9' + 0 n1, '10' + 0 n2`);
q("C33 money text max/min", `SELECT MAX(PRINTF('%.2f', total)) tmax, MAX(total) nmax, MIN(PRINTF('%.2f', total)) tmin, MIN(total) nmin FROM orders`);
q("C34 printf-sorted top3 trap", `SELECT id, PRINTF('%.2f', total) label FROM orders ORDER BY PRINTF('%.2f', total) DESC LIMIT 3`);
q("C35 numeric-sorted top3", `SELECT id, PRINTF('%.2f', total) label FROM orders ORDER BY total DESC LIMIT 3`);
q("C36 grand total cast trio", `SELECT SUM(total) raw, CAST(SUM(total) AS INTEGER) fl, ROUND(SUM(total)) rd, typeof(SUM(total)) cls, ROUND(SUM(total), 2) r2 FROM orders`);
q("C37 avg total trio", `SELECT AVG(total) raw, CAST(AVG(total) AS INTEGER) fl, ROUND(AVG(total)) rd, ROUND(AVG(total), 2) r2 FROM orders`);
q("C38 pending sum is REAL", `SELECT SUM(total) s, typeof(SUM(total)) cls, CAST(SUM(total) AS INTEGER) fl, ROUND(SUM(total), 2) r2 FROM orders WHERE status = 'pending'`);
q("C39 typeof strftime", `SELECT typeof(strftime('%Y-%m', created_at)) a, strftime('%y-%M', created_at) b, typeof(JULIANDAY(created_at)) c FROM orders ORDER BY id LIMIT 3`);
q("C40 typeof printf/concat", `SELECT typeof(PRINTF('%.2f', total)) a, typeof(total || '') b, typeof(CAST(total AS INTEGER)) c, typeof(ROUND(total, 2)) d FROM orders LIMIT 1`);

// ===== C41 products full roster (whole-price keepers) =====
q("C41 products price stock", `SELECT id, name, price, CAST(price AS INTEGER) clipped, price - CAST(price AS INTEGER) dust, stock FROM products ORDER BY id`);
q("C42 dust sum", `SELECT ROUND(SUM(price) - SUM(CAST(price AS INTEGER)), 2) dust, SUM(price) raw, SUM(CAST(price AS INTEGER)) clipped FROM products`);
q("C43 whole-price keepers list", `SELECT id, name, price FROM products WHERE price = CAST(price AS INTEGER) ORDER BY id`);
q("C44 stock div census", `SELECT COUNT(*) n FROM products WHERE stock % 2 != 0`);

// ===== C45 CAST in WHERE vs text compare =====
q("C45 cast where vs text where", `SELECT COUNT(*) n FROM orders WHERE CAST(total AS INTEGER) >= 500`);
q("C46 cast as real keep", `SELECT id, total, CAST(total AS REAL) r, typeof(CAST(total AS REAL)) cls FROM orders WHERE id IN (74, 1, 103)`);
q("C47 cast text of total", `SELECT id, CAST(total AS TEXT) t, typeof(CAST(total AS TEXT)) cls FROM orders WHERE id IN (74, 1)`);
q("C48 int text sort via cast", `SELECT id, CAST(id AS TEXT) t FROM customers ORDER BY CAST(id AS TEXT) LIMIT 4`);
q("C49 numeric id order", `SELECT id FROM customers ORDER BY id LIMIT 4`);

// ===== C50 typeof in aggregate / group contexts =====
q("C50 typeof per status group", `SELECT status, typeof(SUM(total)) cls, COUNT(*) n FROM orders GROUP BY status ORDER BY n DESC`);
q("C51 cast group key", `SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) yr, COUNT(*) n, SUM(CAST(SUBSTR(created_at, 1, 4) AS INTEGER) = 2024) is24 FROM orders GROUP BY yr ORDER BY yr`);
q("C52 month text key unpadded day", `SELECT SUBSTR(created_at, 9, 2) day_text, COUNT(*) n FROM orders GROUP BY day_text ORDER BY day_text`, 32);

// ===== errors for distractors =====
err("C53 cast no type", `SELECT CAST(total) FROM orders LIMIT 1`);
err("C54 postgres style", `SELECT total::TEXT FROM orders LIMIT 1`);
err("C55 typeof two args", `SELECT typeof(total, status) FROM orders LIMIT 1`);
err("C56 typeif typo", `SELECT typeif(total) FROM orders LIMIT 1`);

db.close();
rmSync(TMP, { force: true });
console.log("\nDONE m5-facts-c7 (temp db removed)");
