// M3 INTERSECT drill receipts — probed on read-only copy of db/custom.db.
// Run: bun scripts/m3-facts-is.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3fi.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const q = (sql: string) => db.prepare(sql).all();
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const cols = (sql: string) => JSON.stringify(Object.keys(q(sql)[0]));
const err = (sql: string) => { try { q(sql); return "NO ERROR"; } catch (e) { return String(e).slice(0, 110); } };

console.log("== INTERSECT COUNTS ==");
console.log("status ∩ status (dedup):", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders INTERSECT SELECT status FROM orders)`));
console.log("status ∩ regions:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders INTERSECT SELECT region FROM customers)`));
console.log("status ∩ invoice statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders INTERSECT SELECT status FROM invoices)`));
console.log("region ∩ supplier regions:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers INTERSECT SELECT region FROM suppliers)`));
console.log("city ∩ supplier names:", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers INTERSECT SELECT name FROM suppliers)`));
console.log("customer names ∩ supplier names:", one(`SELECT COUNT(*) AS n FROM (SELECT name FROM customers INTERSECT SELECT name FROM suppliers)`));
console.log("product names ∩ supplier names:", one(`SELECT COUNT(*) AS n FROM (SELECT name FROM products INTERSECT SELECT name FROM suppliers)`));
console.log("city ∩ city WHERE 1=0 (empty arm):", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers INTERSECT SELECT city FROM customers WHERE 1=0)`));
console.log("both arms empty:", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers WHERE 1=0 INTERSECT SELECT city FROM customers WHERE 1=0)`));
console.log("email ∩ email:", one(`SELECT COUNT(*) AS n FROM (SELECT email FROM customers INTERSECT SELECT email FROM customers)`));

console.log("\n== INTERSECT ID OVERLAPS ==");
console.log("id orders ∩ id customers:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders INTERSECT SELECT id FROM customers)`));
console.log("id orders ∩ id order_items:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders INTERSECT SELECT id FROM order_items)`));
console.log("id orders ∩ id suppliers:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders INTERSECT SELECT id FROM suppliers)`));
console.log("id orders ∩ id customers ∩ id suppliers (chain):", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders INTERSECT SELECT id FROM customers INTERSECT SELECT id FROM suppliers)`));
console.log("customer_id orders ∩ supplier_id products:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders INTERSECT SELECT supplier_id FROM products)`));
console.log("customer_id invoices ∩ id customers:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM invoices INTERSECT SELECT id FROM customers)`));
console.log("pending cust ∩ invoice-having:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders WHERE status='pending' INTERSECT SELECT customer_id FROM invoices)`));
console.log("pending cust ∩ invoice-less:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders WHERE status='pending' INTERSECT SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM invoices))`));
console.log("EU cust ∩ delivered cust:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM customers WHERE region='EU' INTERSECT SELECT customer_id FROM orders WHERE status='delivered')`));
console.log("EU cust ∩ pending cust:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM customers WHERE region='EU' INTERSECT SELECT customer_id FROM orders WHERE status='pending')`));
console.log("big(>=200) ∩ >=80 (nested bands):", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders WHERE total >= 200 INTERSECT SELECT id FROM orders WHERE total >= 80)`));
console.log("big(>=200) ∩ <80 (disjoint):", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders WHERE total >= 200 INTERSECT SELECT id FROM orders WHERE total < 80)`));
console.log("delivered ids ∩ pending ids:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders WHERE status='delivered' INTERSECT SELECT id FROM orders WHERE status='pending')`));
console.log("total >= 500 cust ∩ EU cust:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders WHERE total >= 500 INTERSECT SELECT id FROM customers WHERE region='EU')`));
console.log("distinct customers with order >= 500:", one(`SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE total >= 500`));

console.log("\n== INTERSECT NULL EDGES ==");
console.log("shipped_at ∩ shipped_at (itself):", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders INTERSECT SELECT shipped_at FROM orders)`));
console.log("shipped_at ∩ shipped_at WHERE id<=10:", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders WHERE id <= 10 INTERSECT SELECT shipped_at FROM orders WHERE id <= 10)`));
console.log("pending shipped_at ∩ all-NULL set:", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders WHERE status='pending' INTERSECT SELECT shipped_at FROM orders WHERE shipped_at IS NULL)`));
console.log("UNION version of same for contrast:", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders WHERE status='pending' UNION SELECT shipped_at FROM orders WHERE shipped_at IS NULL)`));
console.log("pending rows w/ NULL shipped_at:", one(`SELECT COUNT(*) AS n FROM orders WHERE status='pending' AND shipped_at IS NULL`));
console.log("shipped_at IS NULL total:", one(`SELECT COUNT(*) AS n FROM orders WHERE shipped_at IS NULL`));
console.log("shipped rows w/ NULL shipped_at (sanity):", one(`SELECT COUNT(*) AS n FROM orders WHERE shipped_at IS NOT NULL AND status='shipped'`));

console.log("\n== INTERSECT SHAPE ==");
console.log("cols: first-arm alias sticks:", cols(`SELECT region AS v FROM suppliers INTERSECT SELECT region FROM customers`));
console.log("symmetry b ∩ a:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers INTERSECT SELECT region FROM suppliers)`));
console.log("a ∩ b vs b ∩ a (names):", one(`SELECT COUNT(*) AS n FROM (SELECT name FROM suppliers INTERSECT SELECT name FROM customers)`));
console.log("INTERSECT with GROUP BY arm:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id INTERSECT SELECT id, 7 FROM customers)`));
console.log("IN (a INTERSECT b):", one(`SELECT COUNT(*) AS n FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region='EU' INTERSECT SELECT customer_id FROM orders WHERE status='pending')`));

console.log("\n== INTERSECT ERRORS ==");
console.log("mismatch 1 vs 2:", err(`SELECT status FROM orders INTERSECT SELECT region, city FROM customers`));
console.log("mismatch 2 vs 1 (reversed):", err(`SELECT region, city FROM customers INTERSECT SELECT status FROM orders`));
console.log("ORDER BY before final arm:", err(`SELECT status FROM orders INTERSECT SELECT region FROM customers ORDER BY status ORDER BY status`));
console.log("ORDER BY mid-compound (classic):", err(`SELECT status FROM orders ORDER BY status INTERSECT SELECT region FROM customers`));
console.log("ORDER BY second-arm alias:", err(`SELECT status AS a FROM orders INTERSECT SELECT region AS b FROM customers ORDER BY b`));
console.log("parens around compound operand:", err(`SELECT status FROM orders INTERSECT (SELECT region FROM customers UNION SELECT city FROM customers)`));
console.log("parens around simple arm:", err(`(SELECT status FROM orders) INTERSECT (SELECT region FROM customers)`));
console.log("INTERSECT ALL:", err(`SELECT status FROM orders INTERSECT ALL SELECT status FROM orders`));
console.log("no-such-column in arm 2:", err(`SELECT name FROM customers INTERSECT SELECT city FROM orders`));

db.close();
rmSync(COPY);
