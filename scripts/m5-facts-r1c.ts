/// <reference types="bun-types" />
// m5-c-r1 third probe — final spot receipts (year slice index, alias-in-WHERE,
// DISTINCT concat rollup, digit-start listing). Read-only COPY, self-deleting.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5c-r1c.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  console.log(JSON.stringify(q(sql)));
};

show("invoice year slice 5,4", "SELECT SUBSTR(number, 5, 4) yr, COUNT(*) n FROM invoices GROUP BY yr ORDER BY yr");
show("invoice open by year 5,4", "SELECT SUBSTR(number, 5, 4) yr, COUNT(*) n FROM invoices WHERE status = 'open' GROUP BY yr ORDER BY yr");
show("alias in WHERE works", "SELECT name AS n FROM customers WHERE n = 'Alice Chen'");
show("digit-start via INSTR", "SELECT name, INSTR('0123456789', SUBSTR(name, 1, 1)) AS pos FROM products WHERE pos = 4");
show("supplier rollup distinct concat", "SELECT UPPER(s.region) block, COUNT(*) n, GROUP_CONCAT(DISTINCT s.name) partners FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY block ORDER BY n DESC");
show("supplier 17 who", "SELECT name, LENGTH(name) ln, region, rating FROM suppliers WHERE LENGTH(name) = 17 ORDER BY rating");
show("orders region census", "SELECT UPPER(c.region) block, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY block ORDER BY n DESC");
show("per-customer contact top5", "SELECT c.name || ' — ' || c.email AS contact, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY n DESC LIMIT 5");
show("city length 9 row", "SELECT city, LENGTH(city) cl, GROUP_CONCAT(city) towns FROM customers WHERE LENGTH(city) = 9");
show("ledger month 2025-01 row", "SELECT SUBSTR(memo, 1, 7) mon, COUNT(*) n, SUM(debit_cents) deb FROM ledger_entries GROUP BY mon HAVING mon = '2025-01'");
show("handle mismatch ordered", "SELECT name, SUBSTR(email, 1, INSTR(email, '@') - 1) h FROM customers WHERE SUBSTR(email, 1, INSTR(email, '@') - 1) <> LOWER(REPLACE(name, ' ', '.')) ORDER BY h");
show("active zero handles", "SELECT name, SUBSTR(email, 1, INSTR(email, '@') - 1) h FROM customers WHERE active = 0 ORDER BY h");
show("open invoices slice", "SELECT number, customer_id, PRINTF('%.2f', amount_cents / 100.0) amt FROM invoices WHERE status = 'open' ORDER BY amount_cents DESC LIMIT 3");
show("cancelled desc", "SELECT o.id, c.name, ROUND(o.total, 2) total, UPPER(o.status) flag FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' ORDER BY total DESC, o.id");

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
