/// <reference types="bun-types" />
// m5-c1 (w1 text transforms) probe ADDENDUM — receipts for every prose citation
// in cases-w1.ts that m5-facts-w1.out does not already cover.
// Read-only COPY of db/custom.db, self-deleting. Same pattern as m5-facts-w1.ts.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w1b.db";
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

// cs-1203: Audio shelf census + Video shelf twin
show("cs-1203 audio census", `SELECT name, LENGTH(name) AS len FROM products WHERE category = 'Audio' ORDER BY len DESC`);
show("cs-1203 video twin", `SELECT name, LENGTH(name) AS len FROM products WHERE category = 'Video' ORDER BY len DESC`);

// cs-1205/cs-1229: invoice status census
show("cs-1205 status census", `SELECT status, COUNT(*) AS n FROM invoices GROUP BY status ORDER BY n DESC`);

// cs-1206: cancelled top-5 (LIMIT-5 consequence check)
show("cs-1206 cancelled top5", `SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' ORDER BY o.total DESC LIMIT 5`);
show("cs-1206 cancelled count", `SELECT COUNT(*) AS n FROM orders WHERE status = 'cancelled'`);

// cs-1207/cs-1226: Grace Kim twin
show("cs-1207 grace twin", `SELECT name, INSTR(email, '@') AS at_pos, LENGTH(email) AS elen FROM customers WHERE name = 'Grace Kim'`);

// cs-1209: Ads category vendor
show("cs-1209 ads vendor", `SELECT vendor, COUNT(*) AS n FROM expenses WHERE category = 'Ads' GROUP BY vendor`);

// cs-1211: name-length rosters
show("cs-1211 len12 who", `SELECT name, LENGTH(name) AS ln FROM customers WHERE LENGTH(name) = 12 ORDER BY name`);
show("cs-1211 len11 who", `SELECT name, LENGTH(name) AS ln FROM customers WHERE LENGTH(name) = 11 ORDER BY name`);

// cs-1213/cs-1237: supplier roster (ratings + name widths)
show("cs-1213 suppliers all", `SELECT name, rating, LENGTH(name) AS ln FROM suppliers ORDER BY rating DESC`);

// cs-1215: email band 24 roster
show("cs-1215 band24 who", `SELECT name FROM customers WHERE LENGTH(email) = 24 ORDER BY name`);

// cs-1216/cs-1221/cs-1236: product roster (names, lengths, categories, prices)
show("cs-1216 products all", `SELECT id, name, LENGTH(name) AS ln, category, price, stock FROM products ORDER BY id`);
show("cs-1223 len census", `SELECT LENGTH(name) AS ln, COUNT(*) AS n FROM products GROUP BY ln ORDER BY ln`);
show("cs-1223 n2 bands", `SELECT LENGTH(name) AS ln, COUNT(*) AS n FROM products GROUP BY ln HAVING n = 2 ORDER BY ln`);
show("cs-1216 gmbh tail", `SELECT name, SUBSTR(name, LENGTH(name) - 3) AS tail FROM suppliers`);
show("cs-1236 r cents who", `SELECT name, price FROM products WHERE SUBSTR(name, 1, 1) = 'R' AND price <> ROUND(price, 0)`);
show("cs-1236 cents split", `SELECT (price <> ROUND(price, 0)) AS is_cent, COUNT(*) AS n FROM products GROUP BY is_cent`);

// cs-1219: Travel biggest row
show("cs-1219 travel rows", `SELECT vendor, amount_cents, category FROM expenses WHERE category = 'Travel' ORDER BY amount_cents DESC`);

// cs-1220: top order counts
show("cs-1220 top counts", `SELECT c.name, COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY n DESC LIMIT 2`);

// cs-1228: ledger account census
show("cs-1228 accounts", `SELECT account, COUNT(*) AS entries, PRINTF('%.2f', (SUM(debit_cents) - SUM(credit_cents)) / 100.0) AS net FROM ledger_entries GROUP BY account ORDER BY entries DESC`);

// cs-1231: category census (upper + width + count)
show("cs-1231 category census", `SELECT UPPER(category) AS cat, LENGTH(category) AS cl, COUNT(*) AS n FROM products GROUP BY cat ORDER BY cat`);

// cs-1232: vendor initials + row counts
show("cs-1232 vendors", `SELECT vendor, SUBSTR(vendor, 1, 1) AS ch, COUNT(*) AS n FROM expenses GROUP BY vendor ORDER BY vendor`);

// cs-1230: cancelled n=1 crowd
show("cs-1230 n1 crowd", `SELECT c.name, COUNT(*) AS n, SUM(o.total) AS pool FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' GROUP BY c.id HAVING n = 1`);

// cs-1238: memo slice-8 consequence
show("cs-1238 memo head", `SELECT memo, SUBSTR(memo, 1, 7) AS mon7, SUBSTR(memo, 1, 8) AS mon8 FROM ledger_entries LIMIT 1`);

// cs-1234: drift census with counts (verify 16-row consequences)
show("cs-1234 upper flags all", `SELECT COUNT(*) AS n FROM customers WHERE SUBSTR(email, 1, INSTR(email, '@') - 1) <> UPPER(REPLACE(name, ' ', '.'))`);
show("cs-1234 dash flags all", `SELECT COUNT(*) AS n FROM customers WHERE SUBSTR(email, 1, INSTR(email, '@') - 1) <> LOWER(REPLACE(name, '-', '.'))`);

// cs-1235: thin-shelf name sort order (name DESC consequence)
show("cs-1235 name desc first", `SELECT name FROM products WHERE stock <= 100 ORDER BY name DESC LIMIT 1`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
