// M3 wave-4 receipts — candidate facts for cases-s4.ts (cs-751..cs-800):
// s1 finishers, s5 chain variety, s6 CASE WHEN mechanics.
// Run: bun scripts/m3-facts-s4.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3s4.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());

console.log("a) statuses UNION expense categories:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT category FROM expenses)`));
console.log("b) regions UNION invoice statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers UNION SELECT status FROM invoices)`));
console.log("c) vendor names UNION customer names:", one(`SELECT COUNT(*) AS n FROM (SELECT vendor FROM expenses UNION SELECT name FROM customers)`));
console.log("d) scalar MAX stack orders/invoices/expenses:", one(`SELECT ROUND(MAX(total),2) AS v FROM orders UNION ALL SELECT ROUND(MAX(amount_cents)/100.0,2) FROM invoices UNION ALL SELECT ROUND(MAX(amount_cents)/100.0,2) FROM expenses`));
console.log("e) product names UNION categories:", one(`SELECT COUNT(*) AS n FROM (SELECT name FROM products UNION SELECT category FROM products)`));
console.log("f) AVG stack orders/invoices/expenses:", one(`SELECT ROUND(AVG(total),2) AS v FROM orders UNION ALL SELECT ROUND(AVG(amount_cents)/100.0,2) FROM invoices UNION ALL SELECT ROUND(AVG(amount_cents)/100.0,2) FROM expenses`));
console.log("g) simple CASE buckets orders:", one(`SELECT CASE status WHEN 'pending' THEN 'open' WHEN 'cancelled' THEN 'dead' ELSE 'closed' END AS bucket, COUNT(*) AS n FROM orders GROUP BY bucket ORDER BY n DESC`));
console.log("h) searched bands:", one(`SELECT CASE WHEN total >= 200 THEN 'big' WHEN total >= 80 THEN 'mid' ELSE 'small' END AS size, COUNT(*) AS n FROM orders GROUP BY size ORDER BY n DESC`));
console.log("i) no-ELSE NULL receipt:", one(`SELECT SUM(CASE WHEN status='pending' THEN 1 END) AS nullable, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS zeroed FROM orders`));
console.log("j) COUNT vs SUM wrapper:", one(`SELECT COUNT(CASE WHEN status='pending' THEN 1 END) AS cnt, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS s FROM orders`));
console.log("k) eq-null trap:", one(`SELECT SUM(CASE WHEN shipped_at = NULL THEN 1 ELSE 0 END) AS eq, SUM(CASE WHEN shipped_at IS NULL THEN 1 ELSE 0 END) AS is_null FROM orders`));
console.log("l) first-match trap:", one(`SELECT CASE WHEN total >= 80 THEN 'a-80plus' WHEN total >= 200 THEN 'b-never' ELSE 'c-under80' END AS band, COUNT(*) AS n FROM orders GROUP BY band`));
console.log("m) custom sort:", one(`SELECT status FROM orders GROUP BY status ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'shipped' THEN 1 WHEN 'delivered' THEN 2 ELSE 3 END`));
console.log("n) even ids:", one(`SELECT SUM(CASE WHEN id % 2 = 0 THEN 1 ELSE 0 END) AS even, COUNT(*) AS total FROM orders`));
console.log("o) two-counter:", one(`SELECT SUM(CASE WHEN total >= 150 THEN 1 ELSE 0 END) AS big, SUM(CASE WHEN total < 150 THEN 1 ELSE 0 END) AS small FROM orders`));
console.log("p) iif:", one(`SELECT SUM(IIF(total >= 150, 1, 0)) AS big FROM orders`));
console.log("q) region x status counts pivot:", one(`SELECT c.region, SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) AS p, SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END) AS d FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY c.region`));
console.log("r) invoice buckets:", one(`SELECT CASE status WHEN 'open' THEN 'needs-chase' WHEN 'paid' THEN 'done' ELSE 'written-off' END AS bucket, COUNT(*) AS n FROM invoices GROUP BY bucket ORDER BY n DESC`));
console.log("s) rent fixed vs variable:", one(`SELECT SUM(CASE WHEN category='Rent' THEN 1 ELSE 0 END) AS fixed, SUM(CASE WHEN category!='Rent' THEN 1 ELSE 0 END) AS variable FROM expenses`));
console.log("t) expense bands 100k:", one(`SELECT CASE WHEN amount_cents >= 100000 THEN 'big' ELSE 'small' END AS band, COUNT(*) AS n FROM expenses GROUP BY band`));
console.log("u) ledger account class:", one(`SELECT CASE WHEN account IN ('cash','accounts_receivable') THEN 'asset' WHEN account='operating_expenses' THEN 'expense' ELSE 'revenue' END AS klass, COUNT(*) AS n FROM ledger_entries GROUP BY klass ORDER BY n DESC`));
console.log("v) status x size pivot:", one(`SELECT status, SUM(CASE WHEN total >= 150 THEN 1 ELSE 0 END) AS big, SUM(CASE WHEN total < 150 THEN 1 ELSE 0 END) AS small FROM orders GROUP BY status ORDER BY status`));
console.log("w) payments method x band:", one(`SELECT method, SUM(CASE WHEN amount_cents >= 300000 THEN 1 ELSE 0 END) AS large, SUM(CASE WHEN amount_cents < 300000 THEN 1 ELSE 0 END) AS standard FROM payments GROUP BY method ORDER BY method`));
console.log("x) active labels:", one(`SELECT CASE active WHEN 1 THEN 'active' ELSE 'churned' END AS state, COUNT(*) AS n FROM customers GROUP BY state`));
console.log("y) cats EXCEPT statuses UNION methods:", one(`SELECT COUNT(*) AS n FROM (SELECT category FROM expenses EXCEPT SELECT status FROM orders UNION SELECT method FROM payments)`));
console.log("z) regions UNION methods UNION invoice statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers UNION SELECT method FROM payments UNION SELECT status FROM invoices)`));
console.log("za) cities UNION statuses UNION methods:", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers UNION SELECT status FROM orders UNION SELECT method FROM payments)`));
console.log("zb) statuses EXCEPT regions UNION invoice statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders EXCEPT SELECT region FROM customers UNION SELECT status FROM invoices)`));
console.log("zc) cats UNION accounts UNION invoice statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT category FROM expenses UNION SELECT account FROM ledger_entries UNION SELECT status FROM invoices)`));
console.log("zd) methods UNION regions UNION cities:", one(`SELECT COUNT(*) AS n FROM (SELECT method FROM payments UNION SELECT region FROM customers UNION SELECT city FROM customers)`));
console.log("ze) statuses UNION methods EXCEPT invoice statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT method FROM payments EXCEPT SELECT status FROM invoices)`));
console.log("zf) cities EXCEPT statuses UNION regions:", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers EXCEPT SELECT status FROM orders UNION SELECT region FROM customers)`));
console.log("zg) accounts EXCEPT cats UNION statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT account FROM ledger_entries EXCEPT SELECT category FROM expenses UNION SELECT status FROM orders)`));
console.log("zh) cities UNION invoice statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers UNION SELECT status FROM invoices)`));
console.log("zi) product cats UNION expense cats UNION accounts:", one(`SELECT COUNT(*) AS n FROM (SELECT category FROM products UNION SELECT category FROM expenses UNION SELECT account FROM ledger_entries)`));
console.log("zj) paid-cust UNION delivered-cust:", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT i.customer_id FROM invoices i JOIN payments p ON p.invoice_id=i.id UNION SELECT DISTINCT customer_id FROM orders WHERE status='delivered')`));
console.log("zk) statuses chained with WHERE arms:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders WHERE total >= 150 UNION SELECT status FROM orders WHERE total < 150)`));
console.log("zl) expense vendor UNION supplier names listing:", one(`SELECT v FROM (SELECT vendor AS v FROM expenses UNION SELECT name FROM suppliers) ORDER BY v`));
console.log("zm) CASE in WHERE:", one(`SELECT COUNT(*) AS n FROM orders WHERE CASE WHEN status='pending' THEN 1 ELSE 0 END = 1`));
console.log("zn) expense cat x band pivot:", one(`SELECT category, SUM(CASE WHEN amount_cents >= 100000 THEN 1 ELSE 0 END) AS big, SUM(CASE WHEN amount_cents < 100000 THEN 1 ELSE 0 END) AS small FROM expenses GROUP BY category ORDER BY category`));
console.log("zo) products band pivot:", one(`SELECT category, SUM(CASE WHEN price >= 100 THEN 1 ELSE 0 END) AS premium, SUM(CASE WHEN price < 100 THEN 1 ELSE 0 END) AS basic FROM products GROUP BY category ORDER BY category`));
console.log("zp) bands with BETWEEN-style arms in CASE on invoices:", one(`SELECT CASE WHEN amount_cents >= 300000 THEN 'jumbo' WHEN amount_cents >= 100000 THEN 'mid' ELSE 'small' END AS band, COUNT(*) AS n FROM invoices GROUP BY band ORDER BY n DESC`));
console.log("zq) pending∩paid-cust:", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='pending' INTERSECT SELECT DISTINCT i.customer_id FROM invoices i JOIN payments p ON p.invoice_id=i.id)`));

db.close();
rmSync(COPY);
