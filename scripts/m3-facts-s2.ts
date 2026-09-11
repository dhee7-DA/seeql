// M3 wave-2 case specs — targeted receipts for cases-s2.ts (cs-651..cs-700).
// Run: bun scripts/m3-facts-s2.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3s2.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());

console.log("a) order_items id census:", one(`SELECT COUNT(*) AS n, MIN(id) AS lo, MAX(id) AS hi FROM order_items`));
console.log("b) product cats INTERSECT expense cats:", one(`SELECT COUNT(*) AS n FROM (SELECT category FROM products INTERSECT SELECT category FROM expenses)`));
console.log("c) invoice statuses EXCEPT ledger accounts:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM invoices EXCEPT SELECT account FROM ledger_entries)`));
console.log("d) ledger accounts EXCEPT expense cats:", one(`SELECT COUNT(*) AS n FROM (SELECT account FROM ledger_entries EXCEPT SELECT category FROM expenses)`));
console.log("e) expense months INTERSECT ledger months:", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT substr(spent_on,1,7) FROM expenses INTERSECT SELECT substr(entry_date,1,7) FROM ledger_entries)`));
console.log("e2) expense months rows:", one(`SELECT COUNT(*) AS n FROM (SELECT substr(spent_on,1,7) FROM expenses UNION SELECT substr(entry_date,1,7) FROM ledger_entries)`));
console.log("f) 3-arm census statuses+regions+invoice-statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT region FROM customers UNION SELECT status FROM invoices)`));
console.log("g) pending UNION cancelled shipped_at (all NULL):", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders WHERE status='pending' UNION SELECT shipped_at FROM orders WHERE status='cancelled')`));
console.log("h) delivered regions EXCEPT pending regions:", one(`SELECT COUNT(*) AS n, GROUP_CONCAT(region) AS who FROM (SELECT c.region FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.status='delivered' EXCEPT SELECT c.region FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.status='pending')`));
console.log("i) ledger debit-accounts INTERSECT credit-accounts:", one(`SELECT (SELECT COUNT(*) FROM (SELECT account FROM ledger_entries WHERE debit_cents > 0 INTERSECT SELECT account FROM ledger_entries WHERE credit_cents > 0)) AS both_sides, (SELECT COUNT(*) FROM (SELECT account FROM ledger_entries WHERE debit_cents > 0 EXCEPT SELECT account FROM ledger_entries WHERE credit_cents > 0)) AS debit_only, (SELECT COUNT(*) FROM (SELECT account FROM ledger_entries WHERE credit_cents > 0 EXCEPT SELECT account FROM ledger_entries WHERE debit_cents > 0)) AS credit_only`));
console.log("j) pending/delivered money-by-region stack:", one(`SELECT COUNT(*) AS rows FROM (SELECT c.region FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.status='pending' GROUP BY c.region UNION ALL SELECT c.region FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.status='delivered' GROUP BY c.region)`));
console.log("j2) pending money by region rows:", one(`SELECT c.region, ROUND(SUM(o.total),2) AS money FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.status='pending' GROUP BY c.region ORDER BY c.region`));
console.log("k) year cohorts customers:", one(`SELECT substr(created_at,1,4) AS y, COUNT(*) AS n FROM customers GROUP BY y ORDER BY y`));
console.log("l) statuses+regions stack full listing:", one(`SELECT v, COUNT(*) AS n FROM (SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region) GROUP BY v ORDER BY v`));
console.log("m) id census stack rows:", one(`SELECT * FROM (SELECT MIN(id) AS lo, MAX(id) AS hi FROM orders UNION ALL SELECT MIN(id), MAX(id) FROM customers UNION ALL SELECT MIN(id), MAX(id) FROM order_items)`));
console.log("n) one-row id compare:", one(`SELECT (SELECT COUNT(*) FROM (SELECT id FROM orders INTERSECT SELECT id FROM customers)) AS shared, (SELECT COUNT(*) FROM (SELECT id FROM orders EXCEPT SELECT id FROM customers)) AS only_orders`));
console.log("o) date compare:", one(`SELECT (SELECT COUNT(*) FROM (SELECT created_at FROM orders INTERSECT SELECT spent_on FROM expenses)) AS shared, (SELECT COUNT(*) FROM (SELECT created_at FROM orders EXCEPT SELECT spent_on FROM expenses)) AS only_orders`));
console.log("p) vendor listing except suppliers:", one(`SELECT vendor FROM expenses EXCEPT SELECT name FROM suppliers ORDER BY 1`));
console.log("q) methods except accounts listing:", one(`SELECT method FROM payments EXCEPT SELECT account FROM ledger_entries ORDER BY 1 DESC`));
console.log("r) accounts except cats listing:", one(`SELECT account FROM ledger_entries EXCEPT SELECT category FROM expenses ORDER BY 1`));
console.log("s) statuses except invoice statuses listing:", one(`SELECT status FROM orders EXCEPT SELECT status FROM invoices ORDER BY 1`));
console.log("t) invoice statuses except order statuses listing:", one(`SELECT status FROM invoices EXCEPT SELECT status FROM orders ORDER BY 1`));
console.log("u) invoice status money stack rows:", one(`SELECT status, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM invoices GROUP BY status ORDER BY status`));
console.log("v) 3-ledger ranking:", one(`SELECT v, n FROM (SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region UNION ALL SELECT status, COUNT(*) FROM invoices GROUP BY status) ORDER BY n DESC, v LIMIT 9`));
console.log("w) active-union listing:", one(`SELECT active AS v FROM customers UNION SELECT status FROM invoices ORDER BY v`));
console.log("x) cities+statuses count:", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers UNION SELECT status FROM orders)`));
console.log("y) expense stat stack:", one(`SELECT MAX(amount_cents)/100.0 AS v FROM expenses UNION ALL SELECT MIN(amount_cents)/100.0 FROM expenses UNION ALL SELECT AVG(amount_cents)/100.0 FROM expenses`));
console.log("z) region+method+status 3-arm listing:", one(`SELECT v FROM (SELECT region AS v FROM customers UNION SELECT method FROM payments UNION SELECT status FROM orders) ORDER BY v`));
console.log("z2) 4-arm vocab count:", one(`SELECT COUNT(*) AS n FROM (SELECT category AS v FROM expenses UNION SELECT account FROM ledger_entries UNION SELECT method FROM payments UNION SELECT status FROM orders)`));
console.log("aa) trailing-union pile:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION ALL SELECT region FROM customers UNION ALL SELECT status FROM invoices UNION ALL SELECT method FROM payments UNION SELECT region FROM suppliers)`));
console.log("ab) null-union shipped:", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders UNION SELECT shipped_at FROM orders)`));
console.log("ac) chain intersect-then-union:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders INTERSECT SELECT region FROM customers UNION SELECT city FROM customers)`));
console.log("ad) chain union-except:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT region FROM customers EXCEPT SELECT city FROM customers)`));
console.log("ae) chain except-union:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders EXCEPT SELECT region FROM customers UNION SELECT city FROM customers)`));
console.log("af) first-10 shipped intersect:", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders WHERE id <= 10 INTERSECT SELECT shipped_at FROM orders WHERE id <= 10)`));
console.log("ag) order-by-compound top3:", one(`SELECT v, n FROM (SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region) ORDER BY 2 DESC, 1 LIMIT 3`));
console.log("ah) ids intersect listing check:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders INTERSECT SELECT id FROM customers)`));
console.log("ai) regions intersect suppliers:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers INTERSECT SELECT region FROM suppliers)`));
console.log("aj) cohort pending-union-invoiceless:", one(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders WHERE status='pending' UNION SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM invoices))`));
console.log("aj2) pending arm alone:", one(`SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE status='pending'`));
console.log("aj3) invoiceless arm alone:", one(`SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM invoices)`));
console.log("ak) invoiced vs collected:", one(`SELECT 'invoiced' AS line, ROUND(SUM(amount_cents)/100.0,2) AS money FROM invoices UNION ALL SELECT 'collected', ROUND(SUM(amount_cents)/100.0,2) FROM payments`));
console.log("al) categories + total:", one(`SELECT category AS line, ROUND(SUM(amount_cents)/100.0,2) AS money FROM expenses GROUP BY category UNION ALL SELECT 'all', ROUND(SUM(amount_cents)/100.0,2) FROM expenses ORDER BY money DESC`));

db.close();
rmSync(COPY);
