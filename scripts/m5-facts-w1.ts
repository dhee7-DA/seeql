/// <reference types="bun-types" />
// m5-c1 (w1 text transforms) probe tool — read-only COPY of db/custom.db, self-deleting.
// Every figure cited in cases-w1.ts must trace to this output or m5-facts-r1*.out.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w1.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  try {
    console.log(JSON.stringify(q(sql)));
  } catch (e) {
    console.log(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- exact filled queries per case (correct answers baked in) ----
show("cs-1203 filled", `SELECT name, UPPER(name) AS shout, LENGTH(name) AS len FROM products WHERE category = 'Audio' ORDER BY len DESC LIMIT 1`);
show("cs-1204 filled", `SELECT SUBSTR(created_at, 1, 4) AS yr, COUNT(*) AS signups FROM customers GROUP BY yr ORDER BY yr`);
show("cs-1205 filled", `SELECT number, REPLACE(number, '-', '/') AS readable FROM invoices WHERE status = 'void'`);
show("cs-1206 filled", `SELECT o.id, c.name, ROUND(o.total, 2) AS total, UPPER(o.status) AS flag FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' ORDER BY total DESC LIMIT 3`);
show("cs-1207 filled", `SELECT name, INSTR(email, '@') AS at_pos, LENGTH(email) AS elen FROM customers WHERE name = 'Alice Chen'`);
show("cs-1208 filled", `SELECT name, price, PRINTF('%.2f', price) AS shelf FROM products WHERE name = 'Smart Watch S'`);
show("cs-1209 filled", `SELECT REPLACE(vendor, ' ', '-') AS slug, COUNT(*) AS n FROM expenses WHERE category = 'Rent' GROUP BY slug`);
show("cs-1210 filled", `SELECT name, LENGTH(name) AS len FROM products WHERE LENGTH(name) = 13 ORDER BY name LIMIT 2`);
show("cs-1210 len14 twin", `SELECT name, LENGTH(name) AS len FROM products WHERE LENGTH(name) = 14`);
show("cs-1211 filled", `SELECT LENGTH(name) AS ln, COUNT(*) AS n FROM customers GROUP BY ln HAVING ln = 12 AND n = 5`);
show("cs-1211 eleven", `SELECT LENGTH(name) AS ln, COUNT(*) AS n FROM customers GROUP BY ln HAVING ln = 11 AND n = 3`);
show("cs-1212 filled", `SELECT o.id, c.name || ' — ' || UPPER(o.status) AS line, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.total = 1088.44`);
show("cs-1213 filled", `SELECT name, region, PRINTF('%.2f', rating) AS plate FROM suppliers WHERE rating = 4.8`);
show("cs-1214 filled", `SELECT name, LOWER(city) AS tag, LENGTH(city) AS cl FROM customers WHERE region = 'APAC' ORDER BY tag`);
show("cs-1215 filled", `SELECT UPPER(name) AS who, LENGTH(email) AS elen FROM customers WHERE LENGTH(email) = 23 ORDER BY who`);
show("cs-1216 filled", `SELECT s.name, p.name AS product, LENGTH(s.name) AS ln FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE SUBSTR(s.name, LENGTH(s.name) - 3) = 'GmbH' AND ln = 17 ORDER BY product`);
show("cs-1217 filled", `SELECT SUBSTR(number, 5, 4) AS yr, COUNT(*) AS n, SUM(amount_cents) AS cents FROM invoices GROUP BY yr HAVING yr = '2025'`);
show("cs-1217 2024 twin", `SELECT SUBSTR(number, 5, 4) AS yr, COUNT(*) AS n, SUM(amount_cents) AS cents FROM invoices GROUP BY yr HAVING yr = '2024'`);
show("cs-1218 filled", `SELECT name, LENGTH(name) - LENGTH(REPLACE(name, ' ', '')) AS spaces FROM customers WHERE name = 'Liam O''Brien'`);
show("cs-1219 filled", `SELECT category, COUNT(*) AS n, PRINTF('%.2f', SUM(amount_cents) / 100.0) AS spend FROM expenses GROUP BY category HAVING category = 'Travel'`);
show("cs-1220 filled", `SELECT c.name || ' — ' || c.email AS contact, COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id HAVING n = 24`);
show("cs-1221 filled", `SELECT id, UPPER(SUBSTR(name, 1, 3)) || '-' || PRINTF('%02d', id) AS sku FROM products WHERE id = 7`);
show("cs-1222 filled", `SELECT 'ORD-' || PRINTF('%03d', o.id) AS ref, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' ORDER BY ref`);
show("cs-1223 filled", `SELECT LENGTH(name) AS ln, COUNT(*) AS n FROM products GROUP BY ln HAVING n = 3 ORDER BY ln`);
show("cs-1223 who", `SELECT name, LENGTH(name) ln FROM products WHERE LENGTH(name) = 17 ORDER BY name`);
show("cs-1224 filled", `SELECT SUBSTR(created_at, 1, 4) || '-intake' AS cohort, COUNT(*) AS n FROM customers GROUP BY cohort HAVING cohort = '2023-intake'`);
show("cs-1225 filled", `SELECT name || ' — $' || PRINTF('%.2f', price) AS tag FROM products ORDER BY price DESC LIMIT 3`);
show("cs-1226 filled", `SELECT name, INSTR(email, '@') AS at_pos, LENGTH(email) - REPLACE(email, '@', '') AS broken FROM customers WHERE name = 'Alice Chen'`);
show("cs-1227 filled", `SELECT UPPER(s.name) AS partner, LENGTH(s.name) AS ln, COUNT(p.id) AS items FROM suppliers s JOIN products p ON p.supplier_id = s.id GROUP BY s.id HAVING ln = 17 ORDER BY partner`);
show("cs-1228 filled", `SELECT UPPER(account) AS acct, COUNT(*) AS entries, PRINTF('%.2f', (SUM(debit_cents) - SUM(credit_cents)) / 100.0) AS net FROM ledger_entries WHERE account = 'cash' GROUP BY account`);
show("cs-1229 filled", `SELECT number, SUBSTR(number, 10) AS seq, PRINTF('%.2f', amount_cents / 100.0) AS amt, LENGTH(number) AS ln FROM invoices WHERE status = 'void' AND LENGTH(number) = 12`);
show("cs-1230 filled", `SELECT c.name, COUNT(*) AS n, SUM(o.total) AS pool, PRINTF('%.2f', MAX(o.total)) AS biggest FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' GROUP BY c.id HAVING n = 2 ORDER BY pool DESC`);
show("cs-1230 pending twin", `SELECT c.name, COUNT(*) AS n, SUM(o.total) AS pool, PRINTF('%.2f', MAX(o.total)) AS biggest FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'pending' GROUP BY c.id HAVING n = 2`);
show("cs-1231 filled", `SELECT UPPER(category) AS cat, LENGTH(category) AS cl, COUNT(*) AS n FROM products GROUP BY cat HAVING cl = 11 AND n = 3`);
show("cs-1232 filled", `SELECT REPLACE(vendor, ' ', '-') AS slug, SUBSTR(vendor, 1, 1) AS ch, COUNT(*) AS n, PRINTF('%.2f', SUM(amount_cents) / 100.0) AS spend FROM expenses GROUP BY vendor HAVING ch = 'S' AND n = 3`);
show("cs-1233 filled", `SELECT name, INSTR(email, '@') AS at_pos, LENGTH(email) - REPLACE(email, '@', '') AS broken, LENGTH(email) - LENGTH(REPLACE(email, '@', '')) AS fixed FROM customers WHERE UPPER(name) = 'ALICE CHEN'`);
show("cs-1234 filled", `SELECT name, SUBSTR(email, 1, INSTR(email, '@') - 1) AS handle, LOWER(REPLACE(name, ' ', '.')) AS guess FROM customers WHERE handle <> guess ORDER BY handle`);
show("cs-1235 filled", `SELECT name || ' x' || stock AS tag, LENGTH(name) AS ln FROM products WHERE stock <= 100 ORDER BY stock DESC, tag`);
show("cs-1236 filled", `SELECT SUBSTR(name, 1, 1) AS ch, COUNT(*) AS with_cents, PRINTF('%.2f', AVG(price)) AS avg_price FROM products WHERE price <> ROUND(price, 0) GROUP BY ch HAVING ch = 'R'`);
show("cs-1236 S twin", `SELECT SUBSTR(name, 1, 1) AS ch, COUNT(*) AS with_cents, PRINTF('%.2f', AVG(price)) AS avg_price FROM products WHERE price <> ROUND(price, 0) GROUP BY ch HAVING ch = 'S'`);
show("cs-1237 filled", `SELECT s.name, LENGTH(s.name) AS ln, COUNT(p.id) AS items, PRINTF('%.2f', s.rating) AS plate FROM suppliers s JOIN products p ON p.supplier_id = s.id GROUP BY s.id HAVING ln = 16 ORDER BY plate DESC`);
show("cs-1238 filled", `SELECT SUBSTR(memo, 1, 7) AS mon, COUNT(*) AS entries, PRINTF('%.2f', SUM(debit_cents) / 100.0) AS debits FROM ledger_entries GROUP BY mon HAVING mon = '2025-01'`);
show("cs-1238 2024-01 twin", `SELECT SUBSTR(memo, 1, 7) AS mon, COUNT(*) AS entries, PRINTF('%.2f', SUM(debit_cents) / 100.0) AS debits FROM ledger_entries GROUP BY mon HAVING mon = '2024-01'`);
show("cs-1239 filled", `SELECT name || ' — ' || city AS base, LENGTH(city) AS cl, SUBSTR(created_at, 1, 4) || ' cohort' AS cohort FROM customers WHERE SUBSTR(created_at, 1, 4) = '2024' AND LENGTH(city) = 5 ORDER BY base`);
show("cs-1239 len6 twin", `SELECT name || ' — ' || city AS base, LENGTH(city) AS cl FROM customers WHERE SUBSTR(created_at, 1, 4) = '2024' AND LENGTH(city) = 6 ORDER BY base`);
show("cs-1240 filled", `SELECT number, REPLACE(number, 'INV-', '') AS bare, SUBSTR(number, 1, 3) AS head FROM invoices WHERE LENGTH(number) = 12 AND head = 'INV' ORDER BY bare`);
show("cs-1240 census", `SELECT SUBSTR(number, 1, 3) pre, LENGTH(number) ln, COUNT(*) n FROM invoices GROUP BY pre, ln`);

// ---- behavior / distractor-consequence probes ----
show("REPLACE empty pattern", `SELECT REPLACE('Atlas Property GmbH', '', '-') a, REPLACE(vendor, '', '-') b FROM expenses LIMIT 1`);
show("TRIM 3 args", `SELECT TRIM('INV-2024-011', '-', '/') a`);
show("SUBSTR 1 arg", `SELECT SUBSTR('hello') a`);
show("SUBSTR email 2-arg @", `SELECT SUBSTR(email, '@') a FROM customers LIMIT 1`);
show("ROUND format-first", `SELECT ROUND('%.2f', 4.8) a, ROUND('%.2f', 199.99) b, ROUND('%.2f', 2521.0) c`);
show("printf 199.99 trio", `SELECT PRINTF('%.2f', 199.99) a, PRINTF('%.0f', 199.99) b, PRINTF('%d', 199.99) c`);
show("printf 7 trio", `SELECT PRINTF('%03d', 7) a, PRINTF('%02d', 7) b, PRINTF('%d', 7) c`);
show("printf avg R raw", `SELECT AVG(price) raw FROM products WHERE SUBSTR(name, 1, 1) = 'R' AND price <> ROUND(price, 0)`);
show("MAX 2-arg scalar", `SELECT MAX('Noise-Canceling Headset', 'Noise-Canceling Headset') a`);
show("UPPER 2 args", `SELECT UPPER(name, 1) a FROM customers LIMIT 1`);
show("maya cancelled exact", `SELECT SUM(o.total) pool, MAX(o.total) mx FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' AND c.name = 'Maya Patel'`);
show("emma pending exact", `SELECT SUM(o.total) pool, MAX(o.total) mx, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'pending' AND c.name = 'Emma Wilson'`);
show("order 74 by total", `SELECT o.id, o.status, o.total FROM orders o WHERE o.total = 1088.44`);
show("order 43 by total", `SELECT o.id, c.name, o.status, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.total = 945.21`);
show("alice cancelled pool", `SELECT SUM(o.total) pool FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' AND c.name = 'Alice Chen'`);
show("2023 cohort who", `SELECT name FROM customers WHERE SUBSTR(created_at, 1, 4) = '2023' ORDER BY name`);
show("2024 len5 who", `SELECT name, city FROM customers WHERE SUBSTR(created_at, 1, 4) = '2024' AND LENGTH(city) = 5 ORDER BY name`);
show("2023 cities", `SELECT name, city, LENGTH(city) cl FROM customers WHERE SUBSTR(created_at, 1, 4) = '2023' ORDER BY name`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
