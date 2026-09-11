// M3 set-judgment drill receipts (dr3-sj) — probed on a read-only copy.
// Run: bun scripts/m3-facts-sj.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3fsj.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const q = (sql: string) => db.prepare(sql).all();
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const err = (sql: string) => {
  try { q(sql); return "NO ERROR"; }
  catch (e) { return String(e).replace("SQLiteError: ", "").slice(0, 120); }
};

console.log("== SJ: COHORT SCENARIOS (set ops vs anti-join) ==");
console.log("invoiced customers ids (∩-able):", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM customers INTERSECT SELECT customer_id FROM invoices)`));
console.log("ordered-but-uninvoiced EXCEPT:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM customers EXCEPT SELECT customer_id FROM invoices)`));
console.log("ordered-but-uninvoiced NOT IN:", one(`SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM invoices)`));
console.log("ordered-but-uninvoiced anti-join:", one(`SELECT COUNT(*) AS n FROM customers c LEFT JOIN invoices i ON i.customer_id=c.id WHERE i.id IS NULL`));
console.log("names of the EXCEPT five:", one(`SELECT c.name FROM customers c WHERE c.id IN (SELECT id FROM customers EXCEPT SELECT customer_id FROM invoices) ORDER BY c.name`));
console.log("pending ids ∪ invoice-less ids:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders WHERE status='pending' UNION SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM invoices))`));
console.log("pending ids ∩ invoice-less ids:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders WHERE status='pending' INTERSECT SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM invoices))`));
console.log("names of pending ∩ invoice-less:", one(`SELECT c.name FROM customers c WHERE c.id IN (SELECT customer_id FROM orders WHERE status='pending' INTERSECT SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM invoices)) ORDER BY c.name`));
console.log("customers with ≥1 cancelled (distinct):", one(`SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE status='cancelled'`));
console.log("names of cancelled-order customers:", one(`SELECT DISTINCT c.name FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.status='cancelled' ORDER BY c.name`));
console.log("customers minus cancelled-customer ids EXCEPT:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM customers EXCEPT SELECT customer_id FROM orders WHERE status='cancelled')`));
console.log("paid invoices w/o payment rows (anti-join):", one(`SELECT COUNT(*) AS n FROM invoices i WHERE i.status='paid' AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id=i.id)`));
console.log("invoice ids EXCEPT payment invoice_ids (all statuses):", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM invoices EXCEPT SELECT invoice_id FROM payments)`));
console.log("products never sold EXCEPT / NOT EXISTS:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM products EXCEPT SELECT product_id FROM order_items)`));

console.log("\n== SJ: STACK vs PIVOT vs JOIN ==");
console.log("orders⋈items rows (join fan-out):", one(`SELECT COUNT(*) AS n FROM orders o JOIN order_items oi ON oi.order_id=o.id`));
console.log("orders UNION ALL items (meaningless stack):", one(`SELECT COUNT(*) AS n FROM (SELECT id, total FROM orders UNION ALL SELECT order_id, quantity*unit_price FROM order_items)`));
console.log("stacked per-arm region pending sums (LATAM arm NULL!):", one(`SELECT 'EU' AS region, ROUND(SUM(o.total),2) AS pending_money FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='EU' AND o.status='pending' UNION ALL SELECT 'LATAM', ROUND(SUM(o.total),2) FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='LATAM' AND o.status='pending'`));
console.log("CASE pivot same numbers (ELSE 0 honest zero):", one(`SELECT c.region, ROUND(SUM(CASE WHEN o.status='pending' THEN o.total ELSE 0 END),2) AS pending_money FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region HAVING c.region IN ('EU','LATAM')`));
console.log("two-arm stack of counts with labels:", one(`SELECT 'orders' AS src, COUNT(*) AS n FROM orders UNION ALL SELECT 'customers', COUNT(*) FROM customers`));
console.log("EU+APAC one-column stack:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM customers WHERE region='EU' UNION ALL SELECT id FROM customers WHERE region='APAC')`));
console.log("IN-list twin:", one(`SELECT COUNT(*) AS n FROM customers WHERE region IN ('EU','APAC')`));
console.log("names census UNION ALL customers+suppliers:", one(`SELECT COUNT(*) AS n FROM (SELECT name FROM customers UNION ALL SELECT name FROM suppliers)`));
console.log("names census bare UNION:", one(`SELECT COUNT(*) AS n FROM (SELECT name FROM customers UNION SELECT name FROM suppliers)`));

console.log("\n== SJ: CASE RECEIPTS (for scenario questions) ==");
console.log("bands 200/80:", one(`SELECT CASE WHEN total >= 200 THEN 'big' WHEN total >= 80 THEN 'mid' ELSE 'small' END AS band, COUNT(*) FROM orders GROUP BY band ORDER BY 2 DESC`));
console.log("bands 150 split:", one(`SELECT COUNT(*) FROM orders WHERE total >= 150`));
console.log("first-match overlapping bands:", one(`SELECT CASE WHEN total >= 80 THEN 'a-80plus' WHEN total >= 200 THEN 'b-200plus-never' ELSE 'c-under80' END AS band, COUNT(*) FROM orders GROUP BY band`));
console.log("= NULL vs IS NULL:", one(`SELECT SUM(CASE WHEN shipped_at = NULL THEN 1 ELSE 0 END) AS eq_never, SUM(CASE WHEN shipped_at IS NULL THEN 1 ELSE 0 END) AS is_null FROM orders`));
console.log("IIF count:", one(`SELECT COUNT(*) FROM orders WHERE IIF(total >= 150, 1, 0) = 1`));
console.log("workflow sort:", one(`SELECT status FROM orders GROUP BY status ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'shipped' THEN 1 WHEN 'delivered' THEN 2 ELSE 3 END`));

console.log("\n== SJ: ERRORS (exact messages) ==");
console.log("arm+aggregate col mismatch:", err(`SELECT status, COUNT(*) FROM orders GROUP BY status UNION SELECT region FROM customers`));
console.log("dangling UNION (no second arm):", err(`SELECT status FROM orders UNION`));
console.log("WHERE directly after UNION ALL:", err(`SELECT status FROM orders UNION ALL WHERE status='pending'`));
console.log("UNION in WHERE (illegal):", err(`SELECT id FROM orders WHERE status='pending' UNION status='shipped'`));
console.log("second arm GROUP BY fine:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders WHERE status='pending' UNION ALL SELECT region FROM customers GROUP BY region)`));

console.log("\n== SJ: PREDICT-STYLE CONCRETE NUMBERS ==");
console.log("statuses∪regions = 8; ∪ALL = 119:", one(`SELECT (SELECT COUNT(*) FROM (SELECT status AS v FROM orders UNION SELECT region FROM customers)) AS u, (SELECT COUNT(*) FROM (SELECT status AS v FROM orders UNION ALL SELECT region FROM customers)) AS uall`));
console.log("customer_id ∪ customers.id = 103:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders UNION SELECT id FROM customers)`));
console.log("invoice statuses census:", one(`SELECT status, COUNT(*) FROM invoices GROUP BY status`));
console.log("invoices/payments counts:", one(`SELECT (SELECT COUNT(*) FROM invoices) AS inv, (SELECT COUNT(*) FROM payments) AS pay`));
console.log("supplier regions:", one(`SELECT region FROM suppliers ORDER BY region`));
console.log("customers∖suppliers regions ∅:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers EXCEPT SELECT region FROM suppliers)`));

db.close();
rmSync(COPY);
console.log("\n(copy removed)");
