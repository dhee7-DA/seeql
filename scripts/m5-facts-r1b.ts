/// <reference types="bun-types" />
// m5-c-r1 supplementary probe tool — read-only COPY of db/custom.db, self-deleting.
// Second wave of receipts for cases-r1.ts figures not covered by m5-facts-r1.out.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5c-r1.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  console.log(JSON.stringify(q(sql)));
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- customers: reshapes needed by the wave ----
show("handle length distribution", "SELECT LENGTH(SUBSTR(email, 1, INSTR(email, '@') - 1)) hl, COUNT(*) n FROM customers GROUP BY hl ORDER BY hl");
show("handle length 12 rows", "SELECT SUBSTR(email, 1, INSTR(email, '@') - 1) h FROM customers WHERE LENGTH(SUBSTR(email, 1, INSTR(email, '@') - 1)) = 12 ORDER BY h");
show("handle length top8", "SELECT SUBSTR(email, 1, INSTR(email, '@') - 1) h, LENGTH(SUBSTR(email, 1, INSTR(email, '@') - 1)) hl FROM customers ORDER BY hl DESC, h LIMIT 8");
show("handle length bottom4", "SELECT SUBSTR(email, 1, INSTR(email, '@') - 1) h, LENGTH(SUBSTR(email, 1, INSTR(email, '@') - 1)) hl FROM customers ORDER BY hl, h LIMIT 4");
show("city first-letter census", "SELECT SUBSTR(city, 1, 1) ch, COUNT(*) n FROM customers GROUP BY ch ORDER BY ch");
show("city 2-letter tags", "SELECT SUBSTR(city, 1, 2) tag, COUNT(*) n FROM customers GROUP BY tag ORDER BY tag");
show("city length census", "SELECT LENGTH(city) cl, COUNT(*) n FROM customers GROUP BY cl ORDER BY cl");
show("city length 6 towns", "SELECT GROUP_CONCAT(city) towns FROM customers WHERE LENGTH(city) = 6");
show("customer cohort year", "SELECT SUBSTR(created_at, 1, 4) yr, COUNT(*) n FROM customers GROUP BY yr ORDER BY yr");
show("handle vs name mismatch", "SELECT name, SUBSTR(email, 1, INSTR(email, '@') - 1) h FROM customers WHERE SUBSTR(email, 1, INSTR(email, '@') - 1) <> LOWER(REPLACE(name, ' ', '.')) ORDER BY h");
show("emails <= 20", "SELECT name, email, LENGTH(email) elen FROM customers WHERE LENGTH(email) <= 20 ORDER BY elen, name");
show("email length 23 who", "SELECT GROUP_CONCAT(name) who FROM customers WHERE LENGTH(email) = 23");
show("name len 12 who", "SELECT GROUP_CONCAT(name) who FROM customers WHERE LENGTH(name) = 12");
show("name len 11 who", "SELECT GROUP_CONCAT(name) who FROM customers WHERE LENGTH(name) = 11");
show("region census desc", "SELECT UPPER(region) block, COUNT(*) n FROM customers GROUP BY block ORDER BY n DESC");
show("domain census", "SELECT SUBSTR(email, INSTR(email, '@') + 1) dom, COUNT(*) n FROM customers GROUP BY dom");

// ---- orders joins ----
show("orders per customer full", "SELECT c.name, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY n DESC, c.name");
show("customers without orders", "SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)");
show("cancelled ordered", "SELECT o.id, c.name, ROUND(o.total, 2) t FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' ORDER BY t DESC, o.id");
show("pending top5 named", "SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'pending' ORDER BY o.total DESC LIMIT 5");

// ---- invoices ----
show("invoice year census", "SELECT SUBSTR(number, 6, 4) yr, COUNT(*) n FROM invoices GROUP BY yr ORDER BY yr");
show("invoice open by year", "SELECT SUBSTR(number, 6, 4) yr, COUNT(*) n FROM invoices WHERE status = 'open' GROUP BY yr");
show("invoice open top3", "SELECT number, customer_id, amount_cents FROM invoices WHERE status = 'open' ORDER BY amount_cents DESC LIMIT 3");
show("invoice void row", "SELECT number, SUBSTR(number, 10) seq, REPLACE(number, '-', '/') slash, PRINTF('%.2f', amount_cents / 100.0) amt FROM invoices WHERE status = 'void'");
show("invoice distinct customers", "SELECT COUNT(DISTINCT customer_id) n FROM invoices");

// ---- products / suppliers ----
show("product first-letter census", "SELECT SUBSTR(name, 1, 1) ch, COUNT(*) n FROM products GROUP BY ch ORDER BY ch");
show("product cents initial census", "SELECT SUBSTR(name, 1, 1) ini, COUNT(*) n FROM products WHERE price <> ROUND(price, 0) GROUP BY ini ORDER BY ini");
show("product cents by category", "SELECT category, COUNT(*) n FROM products WHERE price <> ROUND(price, 0) GROUP BY category ORDER BY category");
show("product cents by cat-length", "SELECT LENGTH(category) cl, COUNT(*) n FROM products WHERE price <> ROUND(price, 0) GROUP BY cl ORDER BY cl");
show("products per supplier", "SELECT s.name, COUNT(*) n FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY n DESC, s.name");
show("supplier region product rollup", "SELECT UPPER(s.region) block, COUNT(*) n, GROUP_CONCAT(s.name) partners FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY block ORDER BY n DESC");
show("gmbh join", "SELECT s.name || ' · ' || p.name AS line FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE SUBSTR(s.name, -4) = 'GmbH' ORDER BY line");
show("supplier tails", "SELECT name, SUBSTR(name, -4) tail FROM suppliers ORDER BY name");
show("low stock", "SELECT name, stock FROM products WHERE stock <= 100 ORDER BY stock, name");
show("stock top5", "SELECT name, stock FROM products ORDER BY stock DESC LIMIT 5");
show("audio tags", "SELECT name || ' x' || stock AS tag FROM products WHERE category = 'Audio' ORDER BY tag");
show("longest5", "SELECT name, LENGTH(name) len FROM products ORDER BY len DESC, name LIMIT 5");
show("shortest5", "SELECT name, LENGTH(name) len FROM products ORDER BY len, name LIMIT 5");
show("sku sample", "SELECT UPPER(SUBSTR(name, 1, 3)) || '-' || PRINTF('%02d', id) AS sku FROM products ORDER BY sku LIMIT 8");
show("price tag sample", "SELECT name || ' — $' || PRINTF('%.2f', price) AS tag FROM products ORDER BY tag LIMIT 6");
show("cast text compare", "SELECT COUNT(*) n FROM products WHERE price = CAST(price AS TEXT)");
show("cast real compare", "SELECT COUNT(*) n FROM products WHERE price = CAST(price AS REAL)");
show("cast boolean compare", "SELECT COUNT(*) n FROM products WHERE price = CAST(price AS BOOLEAN)");
show("printf edges", "SELECT PRINTF('%d', 89.99) a, PRINTF('%.1f', 89.99) b, PRINTF('%.0f', 89.99) c, PRINTF('%d', 452.0) dd, PRINTF('%02d', 7) e, PRINTF('%03d', 1) f, PRINTF('%d', 32) g");
show("top price", "SELECT name, price, UPPER(SUBSTR(name, 1, 3)) head FROM products ORDER BY price DESC LIMIT 1");

// ---- expenses ----
show("expense vendor slug census", "SELECT REPLACE(vendor, ' ', '-') slug, COUNT(*) n FROM expenses GROUP BY slug ORDER BY slug");
show("expense vendor initial census", "SELECT SUBSTR(vendor, 1, 1) ch, COUNT(*) n, SUM(amount_cents) s FROM expenses GROUP BY ch ORDER BY ch");
show("expense per vendor printf", "SELECT vendor, COUNT(*) n, PRINTF('%.2f', SUM(amount_cents) / 100.0) spend FROM expenses GROUP BY vendor ORDER BY vendor");
show("ads vendor row", "SELECT vendor, COUNT(*) n, PRINTF('%.2f', SUM(amount_cents) / 100.0) spend FROM expenses WHERE category = 'Ads' GROUP BY vendor");
show("travel max row", "SELECT category, vendor, spent_on, amount_cents FROM expenses WHERE amount_cents = 168000");

// ---- ledger ----
show("ledger month census", "SELECT SUBSTR(memo, 1, 7) mon, COUNT(*) n, SUM(debit_cents) deb FROM ledger_entries GROUP BY mon ORDER BY mon");
show("ledger memo length census", "SELECT LENGTH(memo) ml, COUNT(*) n FROM ledger_entries GROUP BY ml ORDER BY ml");
show("ledger cash row", "SELECT UPPER(account) acct, COUNT(*) n, SUM(debit_cents) deb, PRINTF('%.2f', (SUM(debit_cents) - SUM(credit_cents)) / 100.0) net FROM ledger_entries WHERE account = 'cash' GROUP BY account");
show("ledger AR row", "SELECT UPPER(account) acct, SUM(debit_cents) deb, SUM(credit_cents) cred, PRINTF('%.2f', (SUM(debit_cents) - SUM(credit_cents)) / 100.0) net FROM ledger_entries WHERE account = 'accounts_receivable' GROUP BY account");
show("ledger AR upper census", "SELECT UPPER(account) acct, COUNT(*) n, SUM(debit_cents) deb FROM ledger_entries GROUP BY account ORDER BY deb DESC");

// ---- payments (spare) ----
show("payments per method", "SELECT method, COUNT(*) n, SUM(amount_cents) s FROM payments GROUP BY method");

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
