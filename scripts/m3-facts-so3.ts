// M3 set-ordering round 3 — pin down compound ORDER BY name resolution + boundaries.
// Run: bun scripts/m3-facts-so3.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3fso3.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const err = (sql: string, n = 200) => {
  try { return JSON.stringify(db.prepare(sql).all()).slice(0, n); } catch (e) { return "ERR " + String(e).slice(0, 90); }
};

console.log("== WHO GETS THE SORT KEY? (invoices open/paid/void vs customers regions) ==");
// Alphabetically regions (APAC..) sort BEFORE invoice statuses (open, paid, void).
console.log("Q1 ORDER BY status (arm-1 input name):", err(`SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers ORDER BY status`, 260));
console.log("Q4 ORDER BY s (arm-1 output alias):", err(`SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers ORDER BY s`, 260));
console.log("Q5 ORDER BY region (arm-2 input name):", err(`SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers ORDER BY region`, 260));
console.log("Q6 ORDER BY amount (arm-1 input col, not output):", err(`SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers ORDER BY amount`, 120));
console.log("Q7 ORDER BY email (arm-2 input col, not output):", err(`SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers ORDER BY email`, 120));
console.log("Q8 ORDER BY no-such-name:", err(`SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers ORDER BY banana`, 120));
console.log("Q9 bare v in subquery (compound col names):", one(`SELECT v FROM (SELECT status AS v FROM invoices UNION ALL SELECT region FROM customers) LIMIT 2`));
console.log("Q10 v-sort reference (full 8):", err(`SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers ORDER BY s`, 260));
console.log("Q11 DESC full 8:", err(`SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers ORDER BY s DESC`, 260));
console.log("Q12 ordinal 1 full 8:", err(`SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers ORDER BY 1`, 260));

console.log("\n== boundary rows for >= vs > drills ==");
console.log("stock census:", one(`SELECT SUM(stock = 150) AS eq150, SUM(stock >= 150) AS ge, SUM(stock > 150) AS gt, SUM(stock < 150) AS lt FROM products`));
console.log("price census:", one(`SELECT SUM(price = 50) AS eq50, SUM(price = 120) AS eq120, SUM(price = 100) AS eq100, SUM(price = 80) AS eq80 FROM products`));
console.log("invoice cents boundary:", one(`SELECT SUM(amount_cents = 100000) AS eq1000, MIN(amount_cents) AS lo, MAX(amount_cents) AS hi FROM invoices`));

db.close();
rmSync(COPY);
console.log("done — copy removed");
