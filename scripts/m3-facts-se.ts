// M3 set-edges drill receipts (dr3-se) — probed on a read-only copy.
// Run: bun scripts/m3-facts-se.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3fse.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const q = (sql: string) => db.prepare(sql).all();
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const err = (sql: string) => {
  try { q(sql); return "NO ERROR"; }
  catch (e) { return String(e).replace("SQLiteError: ", "").slice(0, 120); }
};

console.log("== SE: DEDUP & SHAPE ==");
console.log("status UNION itself:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT status FROM orders)`));
console.log("status UNION ALL itself:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION ALL SELECT status FROM orders)`));
console.log("region UNION itself:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers UNION SELECT region FROM customers)`));
console.log("(region,city) UNION identical 2-col:", one(`SELECT COUNT(*) AS n FROM (SELECT region, city FROM customers UNION SELECT region, city FROM customers)`));
console.log("(region,city) UNION ALL identical 2-col:", one(`SELECT COUNT(*) AS n FROM (SELECT region, city FROM customers UNION ALL SELECT region, city FROM customers)`));
console.log("shipped_at UNION ALL itself:", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders UNION ALL SELECT shipped_at FROM orders)`));
console.log("shipped_at UNION itself (NULL dedups to 1):", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders UNION SELECT shipped_at FROM orders)`));
console.log("statuses ∪ invoice statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT status FROM invoices)`));
console.log("statuses EXCEPT invoice statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders EXCEPT SELECT status FROM invoices)`));
console.log("invoice statuses EXCEPT order statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM invoices EXCEPT SELECT status FROM orders)`));
console.log("invoices id ∪ payments id (UNION ALL):", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM invoices UNION ALL SELECT id FROM payments)`));
console.log("invoices id ∪ payments id (UNION):", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM invoices UNION SELECT id FROM payments)`));
console.log("orders.customer_id ∪ customers.id:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders UNION SELECT id FROM customers)`));
console.log("orders.customer_id ∩ customers.id:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders INTERSECT SELECT id FROM customers)`));
console.log("int id ∪ text id (types don't fold):", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM customers UNION SELECT CAST(id AS TEXT) FROM customers)`));
console.log("int id ∩ text id:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM customers INTERSECT SELECT CAST(id AS TEXT) FROM customers)`));

console.log("\n== SE: EMPTY ARMS ==");
console.log("statuses EXCEPT empty-right:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders EXCEPT SELECT region FROM customers WHERE 1=0)`));
console.log("statuses INTERSECT empty:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders INTERSECT SELECT region FROM customers WHERE 1=0)`));
console.log("statuses UNION empty-right:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT region FROM customers WHERE 1=0)`));
console.log("empty-left EXCEPT invoices:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers WHERE 1=0 EXCEPT SELECT status FROM invoices)`));
console.log("empty-left UNION invoices:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers WHERE 1=0 UNION SELECT status FROM invoices)`));
console.log("EXCEPT distinct demo (14 pending rows in):", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders WHERE status='pending' EXCEPT SELECT region FROM customers WHERE 1=0)`));

console.log("\n== SE: NULL AS VALUE IN DIFF/INTERSECT ==");
console.log("shipped_at EXCEPT first-10 (NULL removed too):", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders EXCEPT SELECT shipped_at FROM orders WHERE id <= 10)`));
console.log("first-10 distinct incl NULL:", one(`SELECT COUNT(DISTINCT shipped_at) AS n, SUM(shipped_at IS NULL) AS nulls FROM orders WHERE id <= 10`));
console.log("NOT IN over NULL list collapses:", one(`SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT shipped_at FROM orders)`));
console.log("EXCEPT same shape NULL-safe:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM customers EXCEPT SELECT shipped_at FROM orders)`));

console.log("\n== SE: ERRORS (exact messages) ==");
console.log("EXCEPT col-count mismatch:", err(`SELECT status FROM orders EXCEPT SELECT region, city FROM customers`));
console.log("INTERSECT col-count mismatch:", err(`SELECT status FROM orders INTERSECT SELECT region, city FROM customers`));
console.log("UNION ALL col-count mismatch:", err(`SELECT status FROM orders UNION ALL SELECT region, city FROM customers`));
console.log("EXCEPT ALL:", err(`SELECT status FROM orders EXCEPT ALL SELECT status FROM orders`));
console.log("INTERSECT ALL:", err(`SELECT status FROM orders INTERSECT ALL SELECT status FROM orders`));
console.log("UNION ALL ALL:", err(`SELECT status FROM orders UNION ALL ALL SELECT status FROM orders`));
console.log("two ORDER BYs:", err(`SELECT status AS v FROM orders UNION ALL SELECT region AS w FROM customers ORDER BY v ORDER BY w`));
console.log("ORDER BY second-arm alias w:", err(`SELECT status AS v FROM orders UNION ALL SELECT region AS w FROM customers ORDER BY w`));
console.log("ORDER BY bare col only in 2nd arm:", err(`SELECT status AS v FROM orders UNION ALL SELECT region AS v FROM customers ORDER BY region`));
console.log("ORDER BY ordinal out of range:", err(`SELECT status AS v FROM orders UNION ALL SELECT region AS w FROM customers ORDER BY 3`));
console.log("LIMIT in left arm before UNION:", err(`SELECT status FROM orders LIMIT 2 UNION ALL SELECT region FROM customers`));
console.log("WHERE after full compound (binds to last arm!):", err(`SELECT status FROM orders UNION ALL SELECT region FROM customers WHERE region='EU'`));
console.log("LIMIT-then-ORDER reversed:", err(`SELECT status AS v FROM orders UNION ALL SELECT region AS w FROM customers LIMIT 3 ORDER BY v`));
console.log("bare compound as FROM w/o wrap:", err(`SELECT * FROM SELECT status FROM orders UNION ALL SELECT region FROM customers`));
console.log("ORDER BY between arms:", err(`SELECT status AS v FROM orders UNION ALL SELECT region AS w FROM customers ORDER BY v UNION ALL SELECT city FROM suppliers`));

console.log("\n== SE: PRECEDENCE (left-to-right receipts) ==");
console.log("statuses UNION regions INTERSECT cities:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT region FROM customers INTERSECT SELECT city FROM customers)`));
console.log("statuses EXCEPT regions UNION cities:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders EXCEPT SELECT region FROM customers UNION SELECT city FROM customers)`));
console.log("statuses UNION regions EXCEPT cities:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT region FROM customers EXCEPT SELECT city FROM customers)`));
console.log("subquery-wrap grouping (statuses EXCEPT (regions∪cities)):", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders EXCEPT SELECT v FROM (SELECT region AS v FROM customers UNION SELECT city AS v FROM customers))`));
console.log("INTERSECT chains assoc (a∪b)∩c style:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers INTERSECT SELECT region FROM suppliers UNION ALL SELECT 'zzz')`));

console.log("\n== SE: STACKED AGGREGATES & LABELS ==");
console.log("two per-arm counts with literal labels:", one(`SELECT 'orders' AS src, COUNT(*) AS n FROM orders UNION ALL SELECT 'customers', COUNT(*) FROM customers`));
console.log("per-arm GROUP BY then compound:", one(`SELECT COUNT(*) AS n FROM (SELECT status, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region)`));
console.log("3-arm min/max/avg stack:", one(`SELECT 'min' AS stat, MIN(total) AS v FROM orders UNION ALL SELECT 'max', MAX(total) FROM orders UNION ALL SELECT 'avg', ROUND(AVG(total),2) FROM orders`));
console.log("region stack EU/APAC ids:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM customers WHERE region='EU' UNION ALL SELECT id FROM customers WHERE region='APAC')`));
console.log("pending+shipped stack:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders WHERE status='pending' UNION ALL SELECT id FROM orders WHERE status='shipped')`));
console.log("IN-list twin:", one(`SELECT COUNT(*) AS n FROM orders WHERE status IN ('pending','shipped')`));

console.log("\n== SE: LIMIT/ORDER ON COMPOUND ==");
console.log("LIMIT 3 after UNION ALL (no dedup before slice):", one(`SELECT status AS v FROM orders UNION ALL SELECT region FROM customers LIMIT 3`));
console.log("LIMIT 6 after bare UNION (dedup then slice):", one(`SELECT v FROM (SELECT status AS v FROM orders UNION SELECT region FROM customers) LIMIT 6`));
console.log("ORDER BY 2 DESC on compound:", one(`SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY 2 DESC, 1 LIMIT 3`));
console.log("whole-row NULL pair dedup (region,shipped_at):", one(`SELECT COUNT(*) AS n FROM (SELECT region, shipped_at FROM customers JOIN orders ON orders.customer_id=customers.id UNION SELECT region, shipped_at FROM customers JOIN orders ON orders.customer_id=customers.id)`));

db.close();
rmSync(COPY);
console.log("\n(copy removed)");
