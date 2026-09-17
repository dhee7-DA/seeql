// M4 facts d5 — engine-verified receipts for the subquery-judgment +
// sub-capstone drill files (Module 4). Run: bun scripts/m4-facts-d5.ts
// Operates on a READ-ONLY COPY of db/custom.db (rmSync + copyFileSync).
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync, existsSync } from "node:fs";
const SRC = "db/custom.db", COPY = ".m4d5.db";
if (existsSync(COPY)) rmSync(COPY);
copyFileSync(SRC, COPY);
const db = new Database(COPY, { readonly: true });
const q = (sql: string): any => db.query(sql).all();
const one = (sql: string): any => db.query(sql).get();
const L = (label: string, v: any) => console.log(label.padEnd(48), JSON.stringify(v));

console.log("== shape cost: JOIN vs IN ==");
L("JOIN customers-orders row count", one(`SELECT COUNT(*) c FROM customers c JOIN orders o ON o.customer_id = c.id`).c);
L("IN (SELECT customer_id) row count", one(`SELECT COUNT(*) c FROM customers WHERE id IN (SELECT customer_id FROM orders)`).c);
L("EXISTS any-order row count", one(`SELECT COUNT(*) c FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`).c);
L("JOIN fan-out SUM(total)", one(`SELECT ROUND(SUM(total),2) s FROM orders`).s);
L("orders of VIP (n>=20) rows", one(`SELECT COUNT(*) c FROM orders WHERE customer_id IN (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 20)`).c);
L("distinct customers among VIP orders", one(`SELECT COUNT(DISTINCT customer_id) c FROM orders WHERE customer_id IN (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 20)`).c);

console.log("== scalar station ==");
L("first region by id", q(`SELECT region FROM customers ORDER BY id LIMIT 1`));
L("customers in first region", one(`SELECT COUNT(*) c FROM customers WHERE region = (SELECT region FROM customers ORDER BY id LIMIT 2)`).c);
L("= uncorrelated first-row customer", one(`SELECT COUNT(*) c FROM customers WHERE id = (SELECT customer_id FROM orders)`).c);
L("> scalar over empty set keeps 0 rows", one(`SELECT COUNT(*) c FROM orders WHERE total > (SELECT MAX(total) FROM orders WHERE status='nope')`).c);
L("scalar in SELECT list (id=1)", q(`SELECT name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) n FROM customers c WHERE c.id = 1`));
L("count > avg-total via scalar", one(`SELECT COUNT(*) c FROM orders WHERE total > (SELECT AVG(total) FROM orders)`).c);
L("count > 2x avg-total", one(`SELECT COUNT(*) c FROM orders WHERE total > 2 * (SELECT AVG(total) FROM orders)`).c);
L("avg order total", one(`SELECT ROUND(AVG(total),2) a FROM orders`).a);
L("staged avg counts = population avg", one(`SELECT ROUND(AVG(n),4) a FROM (SELECT COUNT(*) n FROM orders GROUP BY customer_id)`).a);
L("> staged mean (CTE form)", one(`WITH per AS (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) SELECT COUNT(*) c FROM per WHERE n > (SELECT AVG(n) FROM per)`).c);

console.log("== doorbell station (EXISTS) ==");
L("EXISTS ghost status", one(`SELECT COUNT(*) c FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='ghost')`).c);
L("NOT EXISTS cancelled (spotless)", one(`SELECT COUNT(*) c FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='cancelled')`).c);
L("EXISTS delivered", one(`SELECT COUNT(*) c FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='delivered')`).c);
L("NOT EXISTS delivered", q(`SELECT name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='delivered')`));
L("EXISTS delivered AND EXISTS cancelled", one(`SELECT COUNT(*) c FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='delivered') AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='cancelled')`).c);
L("EXISTS pending AND NOT EXISTS shipped", one(`SELECT COUNT(*) c FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='pending') AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='shipped')`).c);

console.log("== breadth station (COUNT DISTINCT) ==");
L("distinct statuses in orders", one(`SELECT COUNT(DISTINCT status) c FROM orders`).c);
L("distinct regions in customers", one(`SELECT COUNT(DISTINCT region) c FROM customers`).c);
L("distinct customers with cancelled order", one(`SELECT COUNT(DISTINCT customer_id) c FROM orders WHERE status='cancelled'`).c);
L("per-customer distinct-status breadth", q(`SELECT ds, COUNT(*) people FROM (SELECT customer_id, COUNT(DISTINCT status) ds FROM orders GROUP BY customer_id) GROUP BY ds ORDER BY ds`));
L("customers hitting all 4 statuses", one(`SELECT COUNT(*) c FROM customers c WHERE (SELECT COUNT(DISTINCT status) FROM orders o WHERE o.customer_id = c.id) = 4`).c);
L("names of all-4-status customers", q(`SELECT name FROM customers c WHERE (SELECT COUNT(DISTINCT status) FROM orders o WHERE o.customer_id = c.id) = 4`));

console.log("== staging station (CTE / derived) ==");
L("VIP n>=20 count + name", q(`WITH per AS (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id), vip AS (SELECT customer_id, n FROM per WHERE n >= 20) SELECT c.name, v.n FROM vip v JOIN customers c ON c.id = v.customer_id`));
L("top-3 orderers", q(`SELECT c.name, t.n FROM (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id ORDER BY n DESC LIMIT 3) t JOIN customers c ON c.id = t.customer_id ORDER BY t.n DESC`));
L("names above staged mean", q(`WITH per AS (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) SELECT c.name, p.n FROM per p JOIN customers c ON c.id = p.customer_id WHERE p.n > (SELECT AVG(n) FROM per) ORDER BY p.n DESC`));
L("cte referenced twice COUNT/MAX", q(`WITH per AS (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) SELECT (SELECT COUNT(*) FROM per) a, (SELECT MAX(n) FROM per) m`));
L("empty CTE count", one(`WITH vip AS (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 100) SELECT COUNT(*) c FROM vip`).c);
L("NOT IN over empty CTE -> 16", one(`WITH vip AS (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 100) SELECT COUNT(*) c FROM customers WHERE id NOT IN (SELECT customer_id FROM vip)`).c);
L("staged n>=5 count (complement of <5)", one(`SELECT COUNT(*) c FROM (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) WHERE n >= 5`).c);
L("exactly 4 orders count", one(`SELECT COUNT(*) c FROM (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) WHERE n = 4`).c);
L("staged n>10 count", one(`SELECT COUNT(*) c FROM (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) WHERE n > 10`).c);

console.log("== errors (verbatim) ==");
const errs: Array<[string, string]> = [
  ["scalar given 2 columns", `SELECT name FROM customers WHERE id = (SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id)`],
  ["IN given 2 columns", `SELECT name FROM customers WHERE id IN (SELECT customer_id, region FROM customers)`],
  ["missing WITH keyword", `per AS (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) SELECT COUNT(*) FROM per`],
  ["CTE name misspelled", `WITH per AS (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) SELECT COUNT(*) c FROM per2`],
  ["FROM SELECT without parens", `SELECT * FROM SELECT status FROM orders`],
  ["subquery col missing", `SELECT name FROM customers WHERE id IN (SELECT nope FROM orders)`],
  ["outer sees inner alias only", `SELECT name FROM (SELECT customer_id FROM orders)`],
  ["WITH after semicolon ORDER", `SELECT 1; WITH per AS (SELECT 1 AS x) SELECT * FROM per`],
];
for (const [lbl, sql] of errs) {
  try { db.query(sql).all(); L("OK   " + lbl, "ran"); }
  catch (e: any) { L("ERR  " + lbl, String(e.message).slice(0, 120)); }
}

console.log("== extra error receipts (d5) ==");
const errs2: Array<[string, string]> = [
  ["double WITH in one statement", `WITH per AS (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) WITH vip AS (SELECT customer_id FROM per WHERE n >= 20) SELECT COUNT(*) FROM vip`],
  ["wrong staged column in outer", `WITH per AS (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) SELECT COUNT(*) c FROM per WHERE cnt > 5`],
  ["aggregate in WHERE (outer)", `WITH per AS (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) SELECT COUNT(*) c FROM per WHERE COUNT(*) > 5`],
  ["comma after last CTE", `WITH per AS (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id), SELECT COUNT(*) c FROM per`],
  ["EXISTS without parens", `SELECT COUNT(*) c FROM customers c WHERE EXISTS SELECT 1 FROM orders o WHERE o.customer_id = c.id`],
  ["scalar multi-row no ORDER (SQLite takes first)", `SELECT COUNT(*) c FROM customers WHERE region = (SELECT region FROM customers)`],
  ["first region by id asc", `SELECT region FROM customers ORDER BY id LIMIT 1`],
  ["EXISTS status IN (delivered,cancelled)", `SELECT COUNT(*) c FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status IN ('delivered','cancelled'))`],
  ["uncorrelated NOT EXISTS cancelled", `SELECT COUNT(*) c FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.status = 'cancelled')`],
  ["bare AVG in WHERE", `SELECT COUNT(*) c FROM orders WHERE total > AVG(total)`],
  ["HAVING on CTE without GROUP BY", `WITH per AS (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) SELECT customer_id FROM per HAVING n > 5`],
  ["staged n >= 13 vs > 13", `SELECT (SELECT COUNT(*) FROM (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) WHERE n >= 13) a, (SELECT COUNT(*) FROM (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) WHERE n > 13) b`],
  ["staged n > mean vs >= mean", `WITH per AS (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) SELECT (SELECT COUNT(*) FROM per WHERE n > (SELECT AVG(n) FROM per)) a, (SELECT COUNT(*) FROM per WHERE n >= (SELECT AVG(n) FROM per)) b`],
];
for (const [lbl, sql] of errs2) {
  try { db.query(sql).all(); L("OK   " + lbl, "ran"); }
  catch (e: any) { L("ERR  " + lbl, String(e.message).slice(0, 120)); }
}

console.log("== misc ==");
L("sqlite version", one(`SELECT sqlite_version() v`).v);
L("EXISTS SELECT * vs SELECT 1", one(`SELECT COUNT(*) c FROM customers c WHERE EXISTS (SELECT * FROM orders o WHERE o.customer_id = c.id AND o.status='delivered')`).c);
L("EXISTS status IN (delivered,cancelled)", one(`SELECT COUNT(*) c FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status IN ('delivered','cancelled'))`).c);
L("uncorrelated NOT EXISTS cancelled", one(`SELECT COUNT(*) c FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.status = 'cancelled')`).c);
L("IN literal list pending+shipped", one(`SELECT COUNT(*) c FROM orders WHERE status IN ('pending','shipped')`).c);
L("correlated per-row counts checksum", one(`SELECT SUM(n) s FROM (SELECT (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) n FROM customers c)`).s);
db.close();
