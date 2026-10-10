/// <reference types="bun-types" />
// m5-c-r1 probe tool — read-only COPY of db/custom.db, self-deleting.
// Every figure used in cases-r1.ts must trace to this output.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5r1.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  console.log(JSON.stringify(q(sql)));
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- customers ----
show("customers dump", "SELECT id, name, email, city, region, active, created_at FROM customers ORDER BY id");
show("region census", "SELECT UPPER(region) rk, COUNT(*) n FROM customers GROUP BY rk ORDER BY rk");
show("active census", "SELECT active, COUNT(*) n, GROUP_CONCAT(name) names FROM customers GROUP BY active");
show("LENGTH(name) distribution", "SELECT LENGTH(name) len, COUNT(*) n FROM customers GROUP BY len ORDER BY len");
show("LENGTH(name) avg/min/max", "SELECT ROUND(AVG(LENGTH(name)),2) avg_len, MIN(LENGTH(name)) mn, MAX(LENGTH(name)) mx FROM customers");
show("longest/shortest names", "SELECT name, LENGTH(name) len FROM customers WHERE LENGTH(name) IN (9, 14) ORDER BY len, name");
show("12-char names", "SELECT name FROM customers WHERE LENGTH(name) = 12 ORDER BY name");
show("9-char names", "SELECT name FROM customers WHERE LENGTH(name) = 9 ORDER BY name");
show("last names", "SELECT SUBSTR(name, INSTR(name, ' ') + 1) AS surname, COUNT(*) n FROM customers GROUP BY surname ORDER BY surname");
show("email lengths", "SELECT LENGTH(email) len, COUNT(*) n FROM customers GROUP BY len ORDER BY len");
show("longest emails", "SELECT email, LENGTH(email) len FROM customers WHERE LENGTH(email) >= 23 ORDER BY len DESC, email");
show("@ positions", "SELECT name, INSTR(email, '@') at_pos, LENGTH(email) elen FROM customers ORDER BY id");
show("domains", "SELECT SUBSTR(email, INSTR(email, '@') + 1) dom, COUNT(*) n FROM customers GROUP BY dom");
show("cities", "SELECT city, LOWER(city) lc, LENGTH(city) clen FROM customers ORDER BY city");
show("city census", "SELECT COUNT(DISTINCT city) n FROM customers");
show("handles", "SELECT SUBSTR(email, 1, INSTR(email, '@') - 1) h FROM customers ORDER BY h");

// ---- products ----
show("products dump", "SELECT id, name, category, price, stock, supplier_id FROM products ORDER BY id");
show("product heads 4", "SELECT SUBSTR(name, 1, 4) head, COUNT(*) n FROM products GROUP BY head ORDER BY head");
show("product heads 3", "SELECT SUBSTR(name, 1, 3) head, COUNT(*) n FROM products GROUP BY head ORDER BY head");
show("longest product names", "SELECT name, LENGTH(name) len FROM products ORDER BY len DESC, name LIMIT 5");
show("product name len distribution", "SELECT LENGTH(name) len, COUNT(*) n FROM products GROUP BY len ORDER BY len");
show("categories", "SELECT category, UPPER(category) uc, LENGTH(category) clen, COUNT(*) n FROM products GROUP BY category ORDER BY category");
show("prices whole", "SELECT name, price FROM products WHERE price = CAST(price AS INTEGER) ORDER BY price");
show("prices with cents", "SELECT COUNT(*) n FROM products WHERE price <> CAST(price AS INTEGER)");
show("digit-start products", "SELECT name, SUBSTR(name, 1, 1) ch FROM products WHERE SUBSTR(name, 1, 1) BETWEEN '0' AND '9'");
show("uppercase-in-name products", "SELECT name FROM products WHERE name <> UPPER(name) AND name <> LOWER(name) LIMIT 20");
show("stock census", "SELECT COUNT(*) n, MIN(stock) mn, MAX(stock) mx FROM products");

// ---- orders ----
show("orders per customer", "SELECT c.name, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY n DESC, c.name LIMIT 6");
show("status census", "SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY status");
show("orders per region", "SELECT c.region, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY n DESC");
show("cancelled orders detail", "SELECT o.id, c.name, o.total, o.created_at FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' ORDER BY o.id");
show("pending count", "SELECT COUNT(*) n FROM orders WHERE status = 'pending'");
show("pending totals", "SELECT o.id, o.total FROM orders o WHERE o.status = 'pending' ORDER BY o.total DESC LIMIT 5");
show("order span", "SELECT MIN(created_at) mn, MAX(created_at) mx, COUNT(*) n FROM orders");

// ---- invoices ----
show("invoices dump", "SELECT id, customer_id, number, issued_on, due_on, amount_cents, status FROM invoices ORDER BY id");
show("invoice statuses", "SELECT status, COUNT(*) n FROM invoices GROUP BY status");
show("invoice number sample", "SELECT number, LENGTH(number) ln, REPLACE(number, '-', '/') slash, SUBSTR(number, 1, 3) pre FROM invoices ORDER BY id LIMIT 8");
show("invoice number census", "SELECT SUBSTR(number, 1, 3) pre, COUNT(*) n FROM invoices GROUP BY pre");

// ---- expenses ----
show("expenses dump", "SELECT id, category, vendor, spent_on, amount_cents FROM expenses ORDER BY id");
show("expense categories", "SELECT category, COUNT(*) n, SUM(amount_cents) sum_c FROM expenses GROUP BY category");
show("travel rows", "SELECT vendor, spent_on, amount_cents FROM expenses WHERE category = 'Travel'");
show("expense vendors", "SELECT vendor, COUNT(*) n FROM expenses GROUP BY vendor ORDER BY vendor");
show("expense amounts distinct", "SELECT amount_cents, COUNT(*) n FROM expenses GROUP BY amount_cents ORDER BY amount_cents");

// ---- suppliers ----
show("suppliers dump", "SELECT id, name, region, rating FROM suppliers ORDER BY id");
show("supplier regions", "SELECT region, COUNT(*) n FROM suppliers GROUP BY region");
show("supplier by rating", "SELECT name, region, rating, PRINTF('%.2f', rating) r2 FROM suppliers ORDER BY rating DESC LIMIT 6");
show("supplier name lengths", "SELECT name, LENGTH(name) ln FROM suppliers ORDER BY ln DESC, name");

// ---- ledger ----
show("ledger accounts", "SELECT account, UPPER(account) ua, COUNT(*) n, SUM(debit_cents) d, SUM(credit_cents) c FROM ledger_entries GROUP BY account");
show("ledger sample", "SELECT id, entry_date, account, debit_cents, credit_cents, memo, LENGTH(memo) mlen FROM ledger_entries ORDER BY id LIMIT 10");
show("ledger memo lengths", "SELECT MIN(LENGTH(memo)) mn, MAX(LENGTH(memo)) mx FROM ledger_entries");
show("padded memos?", "SELECT COUNT(*) n FROM ledger_entries WHERE memo <> TRIM(memo)");
show("ledger debit>0 census", "SELECT COUNT(*) n FROM ledger_entries WHERE debit_cents > 0");
show("ledger credit>0 census", "SELECT COUNT(*) n FROM ledger_entries WHERE credit_cents > 0");

// ---- payments ----
show("payment methods", "SELECT method, COUNT(*) n FROM payments GROUP BY method");
show("payments sample", "SELECT id, invoice_id, paid_on, amount_cents, method FROM payments ORDER BY id LIMIT 6");

// ---- literal edges (brief receipts) ----
show("substr edges", `SELECT SUBSTR('hello', 0, 2) a, SUBSTR('hello', -3) b, SUBSTR('hello', 10, 3) c, SUBSTR('hello', 2) d`);
show("instr miss + nulls", `SELECT INSTR('hello', 'z') a, LENGTH(NULL) b, UPPER(NULL) c, ('on ' || NULL) d`);
show("concat receipt", `SELECT 'Alice Chen #1' a, ('Alice Chen' || ' #' || 1) b`);
show("trim receipt", `SELECT TRIM('  padded  ') a, LENGTH(TRIM('  padded  ')) b, LENGTH('  padded  ') c`);
show("printf receipts", `SELECT PRINTF('%.2f', 1088.44) a, PRINTF('%04d', 1) b, PRINTF('%.2f', 7262.352) c, PRINTF('%.0f', 199.99) d`);
show("replace receipt", `SELECT REPLACE('2024-03-15', '-', '/') a, REPLACE('INV-2024-007', 'INV-', '') b`);
show("typeof receipt", "SELECT typeof(total) t1, typeof(status) t2, typeof(created_at) t3 FROM orders LIMIT 1");
show("typeof customers", "SELECT typeof(active) t1, typeof(region) t2, typeof(created_at) t3 FROM customers LIMIT 1");
show("coercion receipts", `SELECT '8' = 8 a, 'EU' + 0 b, name + 0 c FROM customers LIMIT 1`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
