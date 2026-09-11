// M3 wave-3 receipts — candidate facts for cases-s3.ts (cs-701..cs-750).
// Run: bun scripts/m3-facts-s3.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3s3.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());

console.log("1) order years:", one(`SELECT substr(created_at,1,4) AS y, COUNT(*) AS n FROM orders GROUP BY y ORDER BY y`));
console.log("2) invoice months INTERSECT payment months:", one(`SELECT COUNT(*) AS n FROM (SELECT substr(issued_on,1,7) FROM invoices INTERSECT SELECT substr(paid_on,1,7) FROM payments)`));
console.log("3) invoice months INTERSECT expense months:", one(`SELECT COUNT(*) AS n FROM (SELECT substr(issued_on,1,7) FROM invoices INTERSECT SELECT substr(spent_on,1,7) FROM expenses)`));
console.log("4) ledger months INTERSECT payment months:", one(`SELECT COUNT(*) AS n FROM (SELECT substr(entry_date,1,7) FROM ledger_entries INTERSECT SELECT substr(paid_on,1,7) FROM payments)`));
console.log("5) order dates INTERSECT invoice dates:", one(`SELECT COUNT(*) AS n FROM (SELECT created_at FROM orders INTERSECT SELECT issued_on FROM invoices)`));
console.log("6) pending customers INTERSECT invoiceless:", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='pending' INTERSECT SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM invoices))`));
console.log("7) delivered-cust INTERSECT paid-invoice-cust:", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='delivered' INTERSECT SELECT DISTINCT i.customer_id FROM invoices i JOIN payments p ON p.invoice_id=i.id WHERE i.status='paid')`));
console.log("8) expense dates INTERSECT ledger dates:", one(`SELECT COUNT(*) AS n FROM (SELECT spent_on FROM expenses INTERSECT SELECT entry_date FROM ledger_entries)`));
console.log("9) orders.id INTERSECT order_items.order_id:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders INTERSECT SELECT order_id FROM order_items)`));
console.log("10) invoiced-cust INTERSECT paid-via-payment-cust:", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM invoices INTERSECT SELECT DISTINCT i.customer_id FROM invoices i JOIN payments p ON p.invoice_id=i.id)`));
console.log("11) expense months EXCEPT invoice months:", one(`SELECT COUNT(*) AS n, GROUP_CONCAT(m) AS who FROM (SELECT substr(spent_on,1,7) AS m FROM expenses EXCEPT SELECT substr(issued_on,1,7) FROM invoices)`));
console.log("12) order dates EXCEPT invoice dates:", one(`SELECT COUNT(*) AS n FROM (SELECT created_at FROM orders EXCEPT SELECT issued_on FROM invoices)`));
console.log("13) delivered-cust EXCEPT paid-cust:", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='delivered' EXCEPT SELECT DISTINCT i.customer_id FROM invoices i JOIN payments p ON p.invoice_id=i.id WHERE i.status='paid')`));
console.log("14) pending-cust EXCEPT invoiceless:", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='pending' EXCEPT SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM invoices))`));
console.log("15) invoiceless actives:", one(`SELECT COUNT(*) AS n FROM customers WHERE active=1 AND id NOT IN (SELECT customer_id FROM invoices)`));
console.log("16) city EXCEPT region:", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers EXCEPT SELECT region FROM customers)`));
console.log("17) cats EXCEPT accounts UNION methods:", one(`SELECT COUNT(*) AS n FROM (SELECT category FROM expenses EXCEPT SELECT account FROM ledger_entries UNION SELECT method FROM payments)`));
console.log("18) methods UNION statuses EXCEPT regions:", one(`SELECT COUNT(*) AS n FROM (SELECT method FROM payments UNION SELECT status FROM orders EXCEPT SELECT region FROM customers)`));
console.log("19) cats UNION accounts INTERSECT methods:", one(`SELECT COUNT(*) AS n FROM (SELECT category FROM expenses UNION SELECT account FROM ledger_entries INTERSECT SELECT method FROM payments)`));
console.log("20) accounts UNION methods UNION invoice statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT account FROM ledger_entries UNION SELECT method FROM payments UNION SELECT status FROM invoices)`));
console.log("21) cities UNION statuses UNION methods ORDER BY 1 LIMIT 4:", one(`SELECT v FROM (SELECT city AS v FROM customers UNION SELECT status FROM orders UNION SELECT method FROM payments) ORDER BY v LIMIT 4`));
console.log("22) statuses EXCEPT regions EXCEPT cities:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders EXCEPT SELECT region FROM customers EXCEPT SELECT city FROM customers)`));
console.log("23) regions INTERSECT regions UNION cities:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers INTERSECT SELECT region FROM customers UNION SELECT city FROM customers)`));
console.log("24) invoice months EXCEPT payment months:", one(`SELECT COUNT(*) AS n FROM (SELECT substr(issued_on,1,7) FROM invoices EXCEPT SELECT substr(paid_on,1,7) FROM payments)`));
console.log("25) expense months listing:", one(`SELECT substr(spent_on,1,7) AS m FROM expenses GROUP BY m ORDER BY m`));
console.log("26) order month INTERSECT expense month:", one(`SELECT COUNT(*) AS n FROM (SELECT substr(created_at,1,7) FROM orders INTERSECT SELECT substr(spent_on,1,7) FROM expenses)`));
console.log("27) order month EXCEPT expense month:", one(`SELECT COUNT(*) AS n FROM (SELECT substr(created_at,1,7) FROM orders EXCEPT SELECT substr(spent_on,1,7) FROM expenses)`));
console.log("28) region-orders stack:", one(`SELECT c.region, COUNT(*) AS n FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region UNION ALL SELECT c.region, COUNT(*) FROM invoices i JOIN customers c ON c.id=i.customer_id GROUP BY c.region ORDER BY 1`));
console.log("29) shipped vs delivered shipped_at INTERSECT:", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders WHERE status='shipped' INTERSECT SELECT shipped_at FROM orders WHERE status='delivered')`));
console.log("30) region-invoice-money stack:", one(`SELECT c.region, ROUND(SUM(i.amount_cents)/100.0,2) AS money FROM invoices i JOIN customers c ON c.id=i.customer_id GROUP BY c.region UNION ALL SELECT 'all', ROUND(SUM(amount_cents)/100.0,2) FROM invoices`));
console.log("31) expense vendor rows:", one(`SELECT vendor, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM expenses GROUP BY vendor ORDER BY vendor`));
console.log("32) ledger debit money by account:", one(`SELECT account, ROUND(SUM(debit_cents)/100.0,2) AS dr FROM ledger_entries GROUP BY account ORDER BY account`));
console.log("33) travel rows:", one(`SELECT vendor, ROUND(amount_cents/100.0,2) AS amt, spent_on FROM expenses WHERE category='Travel' ORDER BY amount_cents DESC`));
console.log("34) pending-cust listing:", one(`SELECT DISTINCT customer_id FROM orders WHERE status='pending' ORDER BY customer_id`));
console.log("35) invoiceless listing:", one(`SELECT id, name FROM customers WHERE id NOT IN (SELECT customer_id FROM invoices) ORDER BY id`));

db.close();
rmSync(COPY);
