// M3 UNION drill receipts — probed on read-only copy of db/custom.db.
// Run: bun scripts/m3-facts-un.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3fu.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const q = (sql: string) => db.prepare(sql).all();
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const cols = (sql: string) => JSON.stringify(Object.keys(q(sql)[0]));
const err = (sql: string) => { try { q(sql); return "NO ERROR"; } catch (e) { return String(e).slice(0, 110); } };

console.log("== UNION COUNTS ==");
console.log("status ∪ status (distinct):", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT status FROM orders)`));
console.log("status UNION ALL status:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION ALL SELECT status FROM orders)`));
console.log("status ∪ invoice statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT status FROM invoices)`));
console.log("status UNION ALL invoice statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION ALL SELECT status FROM invoices)`));
console.log("region ∪ supplier regions:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers UNION SELECT region FROM suppliers)`));
console.log("region UNION ALL supplier regions:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers UNION ALL SELECT region FROM suppliers)`));
console.log("status ∪ shipped_at:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT shipped_at FROM orders)`));
console.log("id orders ∪ id order_items:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders UNION SELECT id FROM order_items)`));
console.log("id orders ∪ id suppliers:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders UNION SELECT id FROM suppliers)`));
console.log("id orders ∪ name customers (mixed types):", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders UNION SELECT name FROM customers)`));
console.log("distinct totals:", one(`SELECT COUNT(DISTINCT total) AS n FROM orders`));
console.log("distinct (customer_id,status) pairs:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id, status FROM orders UNION SELECT customer_id, status FROM orders)`));
console.log("3-arm status∪region∪city:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT region FROM customers UNION SELECT city FROM customers)`));
console.log("city ∪ city ∪ city:", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers UNION SELECT city FROM customers UNION SELECT city FROM customers)`));

console.log("\n== UNION EDGES ==");
console.log("shipped_at UNION ALL shipped_at rows:", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders UNION ALL SELECT shipped_at FROM orders)`));
console.log("shipped_at UNION ALL shipped_at nulls:", one(`SELECT SUM(shipped_at IS NULL) AS nulls FROM (SELECT shipped_at FROM orders UNION ALL SELECT shipped_at FROM orders)`));
console.log("empty arm ∪ full:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers WHERE 1=0 UNION SELECT region FROM suppliers)`));
console.log("both arms empty:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers WHERE 1=0 UNION SELECT region FROM suppliers WHERE 1=0)`));
console.log("big ∪ small ids (disjoint bands):", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders WHERE total >= 200 UNION SELECT id FROM orders WHERE total < 80)`));
console.log("big ids >= 200:", one(`SELECT COUNT(*) AS n FROM orders WHERE total >= 200`));
console.log("small ids < 80:", one(`SELECT COUNT(*) AS n FROM orders WHERE total < 80`));
console.log("orders total >= 500:", one(`SELECT COUNT(*) AS n FROM orders WHERE total >= 500`));
console.log("pending AND unshipped:", one(`SELECT COUNT(*) AS n FROM orders WHERE status='pending' AND shipped_at IS NULL`));

console.log("\n== UNION COHORTS / IN ==");
console.log("IN (EU ids ∪ US ids) orders:", one(`SELECT COUNT(*) AS n FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region='EU' UNION SELECT id FROM customers WHERE region='US')`));
console.log("IN (EU ids UNION ALL US ids) orders:", one(`SELECT COUNT(*) AS n FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region='EU' UNION ALL SELECT id FROM customers WHERE region='US')`));
console.log("pending cust ids ∩ invoice-having:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders WHERE status='pending' INTERSECT SELECT customer_id FROM invoices)`));
console.log("pending cust ids ∩ invoice-less:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders WHERE status='pending' INTERSECT SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM invoices))`));
console.log("EU cust ∩ delivered-order cust:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM customers WHERE region='EU' INTERSECT SELECT customer_id FROM orders WHERE status='delivered')`));
console.log("delivered ids ∩ pending ids:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders WHERE status='delivered' INTERSECT SELECT id FROM orders WHERE status='pending')`));
console.log("delivered ids ∩ big(>=200) ids:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders WHERE status='delivered' INTERSECT SELECT id FROM orders WHERE total >= 200)`));

console.log("\n== UNION SHAPE / NAMING ==");
console.log("cols: first-arm alias sticks:", cols(`SELECT status AS v FROM orders UNION SELECT region FROM customers`));
console.log("cols: first arm bare, second aliased:", cols(`SELECT status FROM orders UNION SELECT region AS r FROM customers`));
console.log("cols: both aliased, first wins:", cols(`SELECT status AS s FROM orders UNION SELECT region AS r FROM customers`));
console.log("LIMIT 5 after compound:", one(`SELECT COUNT(*) FROM (SELECT status FROM orders UNION ALL SELECT region FROM customers LIMIT 5)`));
console.log("ORDER BY v DESC LIMIT 3:", one(`SELECT v FROM (SELECT status AS v FROM orders UNION SELECT region FROM customers ORDER BY v DESC LIMIT 3)`));
console.log("ORDER BY 2 DESC,1 LIMIT 3 (compound w/ counts):", one(`SELECT v, n FROM (SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY 2 DESC, 1 LIMIT 3)`));
console.log("per-arm LIMIT via subquery wrap:", one(`SELECT COUNT(*) AS n FROM (SELECT status AS v FROM (SELECT status FROM orders LIMIT 3) UNION ALL SELECT v2 FROM (SELECT region AS v2 FROM customers LIMIT 2))`));
console.log("GROUP BY per arm is legal:", one(`SELECT v, n FROM (SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) AS n FROM customers GROUP BY region) LIMIT 2`));

console.log("\n== UNION ERRORS ==");
console.log("mismatch 1 vs 2:", err(`SELECT status FROM orders UNION SELECT region, city FROM customers`));
console.log("mismatch inside FROM subquery:", err(`SELECT * FROM (SELECT status FROM orders UNION SELECT region, city FROM customers)`));
console.log("ORDER BY before final arm:", err(`SELECT status FROM orders ORDER BY status UNION SELECT region FROM customers`));
console.log("ORDER BY second-arm alias:", err(`SELECT status AS a FROM orders UNION SELECT region AS b FROM customers ORDER BY b`));
console.log("ORDER BY non-output column:", err(`SELECT status FROM orders UNION SELECT region FROM customers ORDER BY region`));
console.log("ORDER BY 3 out of range:", err(`SELECT status FROM orders UNION SELECT region FROM customers ORDER BY 3`));
console.log("parens around compound operand:", err(`SELECT status FROM orders EXCEPT (SELECT region FROM customers UNION SELECT city FROM customers)`));
console.log("parens around simple arm:", err(`(SELECT status FROM orders) UNION (SELECT region FROM customers)`));
console.log("UNION DISTINCT spelled out:", err(`SELECT status FROM orders UNION DISTINCT SELECT region FROM customers`));
console.log("INTERSECT ALL spelled out:", err(`SELECT status FROM orders INTERSECT ALL SELECT status FROM orders`));
console.log("missing second SELECT:", err(`SELECT COUNT(*) FROM orders UNION customers`));
console.log("semicolon splits statement:", err(`SELECT status FROM orders; UNION SELECT region FROM customers`));
console.log("INTERSECT mismatch error text:", err(`SELECT status FROM orders INTERSECT SELECT region, city FROM customers`));

console.log("\n== PRECEDENCE RE-CHECK (left-to-right proof) ==");
console.log("a UNION b INTERSECT c (raw):", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT region FROM customers INTERSECT SELECT city FROM customers)`));
console.log("(a UNION b) INTERSECT c wrapped:", one(`SELECT COUNT(*) AS n FROM (SELECT v FROM (SELECT status AS v FROM orders UNION SELECT region AS v FROM customers) INTERSECT SELECT city FROM customers)`));
console.log("a UNION (b INTERSECT c) wrapped:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT v FROM (SELECT region AS v FROM customers INTERSECT SELECT city AS v FROM customers))`));

db.close();
rmSync(COPY);
