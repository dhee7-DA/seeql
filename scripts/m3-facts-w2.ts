// M3 waves 2-6 supplementary ground-truth receipts (expenses, ledger_entries,
// stacked reports, CASE bands/pivots variety, set chains). Read-only copy.
// Run: bun scripts/m3-facts-w2.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3w2.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());

console.log("== EXPENSES ==");
console.log("rows:", one(`SELECT COUNT(*) AS n, COUNT(DISTINCT vendor) AS vendors, ROUND(SUM(amount_cents)/100.0,2) AS total FROM expenses`));
console.log("categories:", one(`SELECT category, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM expenses GROUP BY category ORDER BY money DESC`));
console.log("vendors list:", one(`SELECT vendor FROM expenses GROUP BY vendor ORDER BY vendor`));
console.log("amount bands >=100k/50k:", one(`SELECT CASE WHEN amount_cents >= 100000 THEN 'big' WHEN amount_cents >= 50000 THEN 'mid' ELSE 'small' END AS band, COUNT(*) AS n FROM expenses GROUP BY band ORDER BY n DESC`));
console.log("max/min/avg:", one(`SELECT ROUND(MAX(amount_cents)/100.0,2) AS mx, ROUND(MIN(amount_cents)/100.0,2) AS mn, ROUND(AVG(amount_cents)/100.0,2) AS avg FROM expenses`));
console.log("months:", one(`SELECT substr(spent_on,1,7) AS m, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM expenses GROUP BY m ORDER BY m`));
console.log("months count distinct:", one(`SELECT COUNT(DISTINCT substr(spent_on,1,7)) AS n, MIN(spent_on) AS lo, MAX(spent_on) AS hi FROM expenses`));
console.log("rent rows:", one(`SELECT vendor, ROUND(amount_cents/100.0,2) AS amt, spent_on FROM expenses WHERE category='Rent' ORDER BY spent_on`));
console.log("top 3 expenses:", one(`SELECT category, vendor, ROUND(amount_cents/100.0,2) AS amt FROM expenses ORDER BY amount_cents DESC LIMIT 3`));
console.log("cats ∩ order statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT category FROM expenses INTERSECT SELECT status FROM orders)`));
console.log("cats ∪ order statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT category FROM expenses UNION SELECT status FROM orders)`));
console.log("cats ∖ statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT category FROM expenses EXCEPT SELECT status FROM orders)`));

console.log("\n== LEDGER ==");
console.log("rows:", one(`SELECT COUNT(*) AS n, COUNT(DISTINCT account) AS accounts, MIN(entry_date) AS lo, MAX(entry_date) AS hi FROM ledger_entries`));
console.log("accounts:", one(`SELECT account, COUNT(*) AS n, ROUND(SUM(debit_cents)/100.0,2) AS debits, ROUND(SUM(credit_cents)/100.0,2) AS credits FROM ledger_entries GROUP BY account ORDER BY account`));
console.log("totals:", one(`SELECT ROUND(SUM(debit_cents)/100.0,2) AS debits, ROUND(SUM(credit_cents)/100.0,2) AS credits, SUM(credit_cents > 0) AS credit_rows, SUM(debit_cents > 0) AS debit_rows FROM ledger_entries`));
console.log("accounts ∩ payment methods:", one(`SELECT COUNT(*) AS n FROM (SELECT account FROM ledger_entries INTERSECT SELECT method FROM payments)`));
console.log("accounts ∪ methods:", one(`SELECT COUNT(*) AS n FROM (SELECT account FROM ledger_entries UNION SELECT method FROM payments)`));
console.log("accounts ∖ methods:", one(`SELECT COUNT(*) AS n FROM (SELECT account FROM ledger_entries EXCEPT SELECT method FROM payments)`));
console.log("accounts ∩ expense cats:", one(`SELECT COUNT(*) AS n FROM (SELECT account FROM ledger_entries INTERSECT SELECT category FROM expenses)`));
console.log("months:", one(`SELECT substr(entry_date,1,7) AS m, COUNT(*) AS n FROM ledger_entries GROUP BY m ORDER BY m`));
console.log("memo kinds:", one(`SELECT COUNT(DISTINCT memo) AS memos FROM ledger_entries`));
console.log("even ids:", one(`SELECT SUM(CASE WHEN id % 2 = 0 THEN 1 ELSE 0 END) AS even, COUNT(*) AS n FROM ledger_entries`));
console.log("account bands by rows:", one(`SELECT CASE WHEN COUNT(*) >= 10 THEN 'busy' WHEN COUNT(*) >= 5 THEN 'steady' ELSE 'quiet' END AS band, COUNT(*) AS accounts FROM ledger_entries GROUP BY account ORDER BY accounts`));

console.log("\n== MORE SET-OP RECEIPTS ==");
console.log("invoice statuses ∪ ledger accounts:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM invoices UNION SELECT account FROM ledger_entries)`));
console.log("invoice statuses ∩ ledger accounts:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM invoices INTERSECT SELECT account FROM ledger_entries)`));
console.log("methods ∪ invoice statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT method FROM payments UNION SELECT status FROM invoices)`));
console.log("expense cats ∪ ledger accounts (counts):", one(`SELECT v, COUNT(*) AS n FROM (SELECT category AS v FROM expenses UNION SELECT account AS v FROM ledger_entries) GROUP BY v ORDER BY v`));
console.log("expense cats ∩ ledger accounts:", one(`SELECT COUNT(*) AS n FROM (SELECT category FROM expenses INTERSECT SELECT account FROM ledger_entries)`));
console.log("product cats ∖ expense cats:", one(`SELECT COUNT(*) AS n FROM (SELECT category FROM products EXCEPT SELECT category FROM expenses)`));
console.log("product cats ∪ expense cats:", one(`SELECT COUNT(*) AS n FROM (SELECT category FROM products UNION SELECT category FROM expenses)`));
console.log("regions ∪ methods ∪ statuses 3-arm:", one(`SELECT COUNT(*) AS n FROM (SELECT region AS v FROM customers UNION SELECT method FROM payments UNION SELECT status FROM orders)`));
console.log("4-arm cats∪accounts∪methods∪statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT category AS v FROM expenses UNION SELECT account FROM ledger_entries UNION SELECT method FROM payments UNION SELECT status FROM orders)`));
console.log("trailing UNION dedups accumulated ALL: 206-rows?:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION ALL SELECT region FROM customers UNION ALL SELECT status FROM invoices UNION ALL SELECT method FROM payments UNION SELECT region FROM suppliers)`));
console.log("same pile pure ALL:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION ALL SELECT region FROM customers UNION ALL SELECT status FROM invoices UNION ALL SELECT method FROM payments UNION ALL SELECT region FROM suppliers)`));
console.log("cities ∖ statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers EXCEPT SELECT status FROM orders)`));
console.log("cities ∩ statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers INTERSECT SELECT status FROM orders)`));
console.log("statuses ∪ cities:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION SELECT city FROM customers)`));
console.log("vendors ∖ supplier names:", one(`SELECT COUNT(*) AS n FROM (SELECT vendor FROM expenses EXCEPT SELECT name FROM suppliers)`));
console.log("vendors ∪ supplier names:", one(`SELECT COUNT(*) AS n FROM (SELECT vendor FROM expenses UNION SELECT name FROM suppliers)`));
console.log("vendors ∩ supplier names:", one(`SELECT COUNT(*) AS n FROM (SELECT vendor FROM expenses INTERSECT SELECT name FROM suppliers)`));
console.log("vendors ∩ customer names:", one(`SELECT COUNT(*) AS n FROM (SELECT vendor FROM expenses INTERSECT SELECT name FROM customers)`));
console.log("vendors ∪ customer names:", one(`SELECT COUNT(*) AS n FROM (SELECT vendor FROM expenses UNION SELECT name FROM customers)`));
console.log("vendors count:", one(`SELECT COUNT(DISTINCT vendor) AS n FROM expenses`));
console.log("order dates ∩ expense dates:", one(`SELECT COUNT(*) AS n FROM (SELECT created_at FROM orders INTERSECT SELECT spent_on FROM expenses)`));
console.log("order dates ∖ expense dates:", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT created_at FROM orders EXCEPT SELECT spent_on FROM expenses)`));
console.log("order dates count distinct:", one(`SELECT COUNT(DISTINCT created_at) AS n FROM orders`));
console.log("expense dates count:", one(`SELECT COUNT(DISTINCT spent_on) AS n, COUNT(*) AS rows FROM expenses`));
console.log("ledger dates ∩ order dates:", one(`SELECT COUNT(*) AS n FROM (SELECT entry_date FROM ledger_entries INTERSECT SELECT created_at FROM orders)`));

console.log("\n== MORE CASE RECEIPTS ==");
console.log("orders total bands 500/200:", one(`SELECT CASE WHEN total >= 500 THEN 'xl' WHEN total >= 200 THEN 'big' ELSE 'rest' END AS band, COUNT(*) AS n FROM orders GROUP BY band ORDER BY n DESC`));
console.log("orders total bands 300/150:", one(`SELECT CASE WHEN total >= 300 THEN 'a' WHEN total >= 150 THEN 'b' ELSE 'c' END AS band, COUNT(*) AS n FROM orders GROUP BY band ORDER BY n DESC`));
console.log("invoice amount bands 3k/1k:", one(`SELECT CASE WHEN amount_cents >= 300000 THEN 'jumbo' WHEN amount_cents >= 100000 THEN 'mid' ELSE 'small' END AS band, COUNT(*) AS n FROM invoices GROUP BY band ORDER BY n DESC`));
console.log("payment amount bands 3k:", one(`SELECT CASE WHEN amount_cents >= 300000 THEN 'large' ELSE 'standard' END AS band, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM payments GROUP BY band`));
console.log("product stock bands:", one(`SELECT CASE WHEN stock >= 100 THEN 'deep' WHEN stock >= 40 THEN 'ok' ELSE 'thin' END AS band, COUNT(*) AS n FROM products GROUP BY band ORDER BY n DESC`));
console.log("stock minmax:", one(`SELECT MIN(stock) AS lo, MAX(stock) AS hi, SUM(CASE WHEN stock < 30 THEN 1 ELSE 0 END) AS low_stock FROM products`));
console.log("product price bands 100/50:", one(`SELECT CASE WHEN price >= 100 THEN 'premium' WHEN price >= 50 THEN 'core' ELSE 'budget' END AS band, COUNT(*) AS n FROM products GROUP BY band ORDER BY n DESC`));
console.log("customers active:", one(`SELECT active, COUNT(*) AS n FROM customers GROUP BY active`));
console.log("customers created years:", one(`SELECT substr(created_at,1,4) AS y, COUNT(*) AS n FROM customers GROUP BY y ORDER BY y`));
console.log("orders created months:", one(`SELECT substr(created_at,1,7) AS m, COUNT(*) AS n FROM orders GROUP BY m ORDER BY m`));
console.log("orders created quarters:", one(`SELECT CASE WHEN substr(created_at,6,2) IN ('01','02','03') THEN 'Q1' WHEN substr(created_at,6,2) IN ('04','05','06') THEN 'Q2' WHEN substr(created_at,6,2) IN ('07','08','09') THEN 'Q3' ELSE 'Q4' END AS q, COUNT(*) AS n FROM orders GROUP BY q ORDER BY q`));
console.log("invoices issued months:", one(`SELECT substr(issued_on,1,7) AS m, COUNT(*) AS n FROM invoices GROUP BY m ORDER BY m`));
console.log("payments months:", one(`SELECT substr(paid_on,1,7) AS m, COUNT(*) AS n FROM payments GROUP BY m ORDER BY m`));
console.log("pivot invoices status x region:", one(`SELECT c.region, COUNT(*) AS inv, ROUND(SUM(CASE WHEN i.status='paid' THEN i.amount_cents ELSE 0 END)/100.0,2) AS paid_money, ROUND(SUM(CASE WHEN i.status='open' THEN i.amount_cents ELSE 0 END)/100.0,2) AS open_money FROM invoices i JOIN customers c ON c.id=i.customer_id GROUP BY c.region ORDER BY inv DESC`));
console.log("pivot expense cat x band:", one(`SELECT category, SUM(CASE WHEN amount_cents >= 100000 THEN 1 ELSE 0 END) AS big, SUM(CASE WHEN amount_cents < 100000 THEN 1 ELSE 0 END) AS other FROM expenses GROUP BY category ORDER BY category`));
console.log("pivot ledger debit/credit rows by account:", one(`SELECT account, SUM(CASE WHEN debit_cents > 0 THEN 1 ELSE 0 END) AS dr, SUM(CASE WHEN credit_cents > 0 THEN 1 ELSE 0 END) AS cr FROM ledger_entries GROUP BY account ORDER BY account`));
console.log("pivot orders status x size (CASE):", one(`SELECT status, SUM(CASE WHEN total >= 150 THEN 1 ELSE 0 END) AS big, SUM(CASE WHEN total < 150 THEN 1 ELSE 0 END) AS small FROM orders GROUP BY status ORDER BY status`));
console.log("pivot products cat x price band:", one(`SELECT category, SUM(CASE WHEN price >= 100 THEN 1 ELSE 0 END) AS premium, SUM(CASE WHEN price >= 50 AND price < 100 THEN 1 ELSE 0 END) AS core, SUM(CASE WHEN price < 50 THEN 1 ELSE 0 END) AS budget FROM products GROUP BY category ORDER BY category`));
console.log("CASE custom sort expense cats:", one(`SELECT category FROM expenses GROUP BY category ORDER BY CASE category WHEN 'Rent' THEN 0 WHEN 'Ads' THEN 1 WHEN 'Travel' THEN 2 ELSE 3 END`));
console.log("CASE pivot payments method x band:", one(`SELECT method, COUNT(*) AS n, ROUND(SUM(CASE WHEN amount_cents >= 300000 THEN amount_cents ELSE 0 END)/100.0,2) AS big_money, ROUND(SUM(CASE WHEN amount_cents < 300000 THEN amount_cents ELSE 0 END)/100.0,2) AS std_money FROM payments GROUP BY method`));
console.log("region pivot status counts (SUM CASE 4col):", one(`SELECT c.region, SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) AS p, SUM(CASE WHEN o.status='shipped' THEN 1 ELSE 0 END) AS s, SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END) AS d, SUM(CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END) AS x FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region`));
console.log("stacked labeled: orders vs invoices counts:", one(`SELECT 'orders' AS src, COUNT(*) AS n FROM orders UNION ALL SELECT 'invoices', COUNT(*) FROM invoices UNION ALL SELECT 'payments', COUNT(*) FROM payments UNION ALL SELECT 'expenses', COUNT(*) FROM expenses UNION ALL SELECT 'ledger', COUNT(*) FROM ledger_entries`));
console.log("stacked region/status money arms:", one(`SELECT 'region' AS kind, region AS key, ROUND(SUM(total),2) AS money FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY region UNION ALL SELECT 'status', status, ROUND(SUM(total),2) FROM orders GROUP BY status`));
console.log("max total:", one(`SELECT ROUND(MAX(total),2) AS mx, ROUND(MIN(total),2) AS mn FROM orders`));
console.log("email domains:", one(`SELECT substr(email, instr(email,'@')+1) AS dom, COUNT(*) AS n FROM customers GROUP BY dom ORDER BY n DESC`));
console.log("domains ∪ regions:", one(`SELECT COUNT(*) AS n FROM (SELECT substr(email, instr(email,'@')+1) AS v FROM customers UNION SELECT region FROM customers)`));
console.log("domains ∩ regions:", one(`SELECT COUNT(*) AS n FROM (SELECT substr(email, instr(email,'@')+1) AS v FROM customers INTERSECT SELECT region FROM customers)`));

db.close();
rmSync(COPY);
