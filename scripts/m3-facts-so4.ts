// M3 set-ordering round 4 — final ORDER BY-name-resolution matrix.
// Run: bun scripts/m3-facts-so4.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3fso4.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const err = (sql: string, n = 150) => {
  try { return JSON.stringify(db.prepare(sql).all()).slice(0, n); } catch (e) { return "ERR " + String(e).slice(0, 95); }
};

// invoice statuses (open, paid, void) + customer regions (APAC, EU, LATAM, US).
// Alphabetical v-sort: APAC, EU, LATAM, US, open, paid, void.
console.log("T1 ORDER BY amount_cents (arm-1 input col, NOT output):", err(`SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers ORDER BY amount_cents`));
console.log("T2 ORDER BY city (arm-2 input col, NOT output):", err(`SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers ORDER BY city`));
console.log("T3 ORDER BY upper(s) (expression over output alias):", err(`SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers ORDER BY upper(s)`, 120));
console.log("T4 ORDER BY upper(status) (expression over arm-1 input):", err(`SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers ORDER BY upper(status)`, 120));
console.log("T5 qualified ORDER BY invoices.status:", err(`SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers ORDER BY invoices.status`));
console.log("T6 both arms output 'status':", err(`SELECT status AS s FROM invoices UNION ALL SELECT status FROM orders ORDER BY status`, 150));
console.log("T7 subquery exposes which names?:", err(`SELECT status FROM (SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers) LIMIT 1`));
console.log("T8 subquery exposes region?:", err(`SELECT region FROM (SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers) LIMIT 1`));
console.log("T9 subquery exposes s?:", err(`SELECT s FROM (SELECT status AS s FROM invoices UNION ALL SELECT region FROM customers) LIMIT 1`));
console.log("T10 ORDER BY 2 DESC on 2-col stack:", one(`SELECT status AS s, COUNT(*) AS n FROM invoices GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY 2 DESC, 1 LIMIT 3`));
console.log("T11 GROUP BY the OUTPUT alias of compound wrap:", one(`SELECT v, COUNT(*) AS n FROM (SELECT status AS v FROM orders UNION ALL SELECT region AS v FROM customers) GROUP BY v ORDER BY n DESC, v`));
console.log("T12 ORDER BY alias v DESC full 8 rows:", err(`SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY v DESC`, 320));

db.close();
rmSync(COPY);
console.log("done — copy removed");
