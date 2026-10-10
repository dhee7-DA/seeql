// M3 wave 5 (cases-s5.ts, cs-801–850) ground-truth probes.
// Topics this wave: s1 ×8, s2 ×8, s3 ×8, s4 ×8, s5 ×5 (Set chains), s6 ×13.
// Read-only copy. Run: bun scripts/m3-facts-s5w.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3w5.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());

console.log("== S5 CHAINS ==");
console.log("P01 statuses∪regions∪methods 3-arm:", one(`SELECT COUNT(*) AS n FROM (SELECT status AS v FROM orders UNION SELECT region FROM customers UNION SELECT method FROM payments)`));
console.log("P02 statuses∪regions∩cities left-assoc:", one(`SELECT COUNT(*) AS n FROM (SELECT status AS v FROM orders UNION SELECT region FROM customers INTERSECT SELECT city FROM customers)`));
console.log("P03 standard reading A∪(B∩C) for P02:", one(`SELECT COUNT(*) AS n FROM (SELECT status AS v FROM orders UNION SELECT region FROM (SELECT region FROM customers INTERSECT SELECT city FROM customers))`));
console.log("P04 statuses∪regions∖cities:", one(`SELECT COUNT(*) AS n FROM (SELECT status AS v FROM orders UNION SELECT region FROM customers EXCEPT SELECT city FROM customers)`));
console.log("P05 statuses∩regions∪cities:", one(`SELECT COUNT(*) AS n FROM (SELECT status AS v FROM orders INTERSECT SELECT region FROM customers UNION SELECT city FROM customers)`));
console.log("P06 delivered∪cancelled∩pending ids:", one(`SELECT COUNT(*) AS n, GROUP_CONCAT(v) AS ids FROM (SELECT DISTINCT customer_id AS v FROM orders WHERE status='delivered' UNION SELECT DISTINCT customer_id FROM orders WHERE status='cancelled' INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status='pending')`));
console.log("P06b delivered∪cancelled∩pending proper:", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id AS v FROM orders WHERE status='delivered' UNION SELECT DISTINCT customer_id FROM orders WHERE status='cancelled' INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status='pending')`));
console.log("P07 delivered∩pending:", one(`SELECT COUNT(*) AS n, GROUP_CONCAT(v) AS ids FROM (SELECT DISTINCT customer_id AS v FROM orders WHERE status='delivered' INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status='pending')`));
console.log("P08 delivered∩cancelled:", one(`SELECT COUNT(*) AS n, GROUP_CONCAT(v) AS ids FROM (SELECT DISTINCT customer_id AS v FROM orders WHERE status='delivered' INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status='cancelled')`));
console.log("P09 ALL-chain trailing UNION sweep:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION ALL SELECT status FROM orders UNION ALL SELECT status FROM orders UNION SELECT region FROM suppliers)`));
console.log("P10 same pile pure ALL:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION ALL SELECT status FROM orders UNION ALL SELECT status FROM orders UNION ALL SELECT region FROM suppliers)`));
console.log("P11 statuses ALL-chain then final UNION:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders UNION ALL SELECT status FROM orders UNION SELECT region FROM suppliers)`));
console.log("P12 cust∖EU∖APAC chain:", one(`SELECT GROUP_CONCAT(v) AS ids FROM (SELECT name AS v FROM customers EXCEPT SELECT name FROM customers WHERE region='EU' EXCEPT SELECT name FROM customers WHERE region='APAC')`));
console.log("P13 chain ORDER BY LIMIT 3:", one(`SELECT v FROM (SELECT region AS v FROM customers UNION SELECT status FROM orders UNION SELECT method FROM payments) ORDER BY v LIMIT 3`));
console.log("P14 chain tail LIMIT 2:", one(`SELECT v FROM (SELECT status AS v FROM orders UNION SELECT region FROM customers UNION SELECT method FROM payments) ORDER BY v DESC LIMIT 2`));
console.log("P15 3-arm labeled money stack ALL:", one(`SELECT 'max_order' AS k, ROUND(MAX(total),2) AS v FROM orders UNION ALL SELECT 'max_invoice', ROUND(MAX(amount_cents)/100.0,2) FROM invoices UNION ALL SELECT 'max_expense', ROUND(MAX(amount_cents)/100.0,2) FROM expenses`));
console.log("P16 4-arm id chains union:", one(`SELECT COUNT(*) AS n FROM (SELECT id AS v FROM customers UNION SELECT id FROM suppliers UNION SELECT id FROM products UNION SELECT id FROM orders)`));
console.log("P17 id chains sum:", one(`SELECT (SELECT COUNT(*) FROM customers)+(SELECT COUNT(*) FROM suppliers)+(SELECT COUNT(*) FROM products)+(SELECT COUNT(*) FROM orders) AS n`));
console.log("P18 customers∩suppliers ids:", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM customers INTERSECT SELECT id FROM suppliers)`));
console.log("P19 orders∪invoices statuses pile:", one(`SELECT COUNT(*) AS n FROM (SELECT status AS v FROM orders UNION SELECT status FROM invoices)`));
console.log("P20 pile with labels + ORDER:", one(`SELECT v FROM (SELECT status AS v FROM orders UNION SELECT status FROM invoices UNION SELECT method FROM payments) ORDER BY v`));
console.log("P21 invoice∖order statuses:", one(`SELECT GROUP_CONCAT(v) AS vs FROM (SELECT status AS v FROM invoices EXCEPT SELECT status FROM orders)`));
console.log("P22 order∖invoice statuses:", one(`SELECT GROUP_CONCAT(v) AS vs FROM (SELECT status AS v FROM orders EXCEPT SELECT status FROM invoices)`));
console.log("P23 methods∖invoice statuses:", one(`SELECT COUNT(*) AS n FROM (SELECT method AS v FROM payments EXCEPT SELECT status FROM invoices)`));
console.log("P24 products∖expenses cats names:", one(`SELECT GROUP_CONCAT(v) AS vs FROM (SELECT category AS v FROM products EXCEPT SELECT category FROM expenses)`));
console.log("P25 expense∖product cats:", one(`SELECT GROUP_CONCAT(v) AS vs FROM (SELECT category AS v FROM expenses EXCEPT SELECT category FROM products)`));
console.log("P26 order dates∩expense dates list:", one(`SELECT GROUP_CONCAT(v) AS ds FROM (SELECT DISTINCT created_at AS v FROM orders INTERSECT SELECT spent_on FROM expenses)`));
console.log("P27 ledger∖order dates:", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT entry_date AS v FROM ledger_entries EXCEPT SELECT created_at FROM orders)`));
console.log("P28 ledger dates count:", one(`SELECT COUNT(DISTINCT entry_date) AS n FROM ledger_entries`));
console.log("P29 self-INTERSECT cities:", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT city AS v FROM customers INTERSECT SELECT city FROM customers)`));
console.log("P30 supplier regions∩customer regions:", one(`SELECT COUNT(*) AS n FROM (SELECT region AS v FROM suppliers INTERSECT SELECT region FROM customers)`));
console.log("P31 invoices∖pending customers (ids):", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id AS v FROM invoices EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='pending')`));
console.log("P32 pending customers:", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id AS v FROM orders WHERE status='pending')`));
console.log("P33 invoiced customers:", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id AS v FROM invoices)`));

console.log("\n== S1/S2 STACKS ==");
console.log("P34 stack table counts:", one(`SELECT 'products' AS src, COUNT(*) AS n FROM products UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers UNION ALL SELECT 'customers', COUNT(*) FROM customers UNION ALL SELECT 'orders', COUNT(*) FROM orders`));
console.log("P35 stack status totals money:", one(`SELECT 'delivered' AS k, ROUND(SUM(total),2) AS v FROM orders WHERE status='delivered' UNION ALL SELECT 'pending', ROUND(SUM(total),2) FROM orders WHERE status='pending' UNION ALL SELECT 'shipped', ROUND(SUM(total),2) FROM orders WHERE status='shipped' UNION ALL SELECT 'cancelled', ROUND(SUM(total),2) FROM orders WHERE status='cancelled'`));
console.log("P36 stack region order counts:", one(`SELECT c.region AS k, COUNT(*) AS n FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region` ??""));
console.log("P36b stack region order counts UNION:", one(`SELECT 'EU' AS k, COUNT(*) AS n FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='EU' UNION ALL SELECT 'APAC', COUNT(*) FROM orders o2 JOIN customers c2 ON c2.id=o2.customer_id WHERE c2.region='APAC' UNION ALL SELECT 'US', COUNT(*) FROM orders o3 JOIN customers c3 ON c3.id=o3.customer_id WHERE c3.region='US' UNION ALL SELECT 'LATAM', COUNT(*) FROM orders o4 JOIN customers c4 ON c4.id=o4.customer_id WHERE c4.region='LATAM'`));
console.log("P37 stack method money:", one(`SELECT method AS k, ROUND(SUM(amount_cents)/100.0,2) AS v FROM payments GROUP BY method`));
console.log("P38 stack invoice status money:", one(`SELECT status AS k, ROUND(SUM(amount_cents)/100.0,2) AS v, COUNT(*) AS n FROM invoices GROUP BY status`));
console.log("P39 stack cat expenses:", one(`SELECT 'Ads' AS k, ROUND(SUM(amount_cents)/100.0,2) AS v FROM expenses WHERE category='Ads' UNION ALL SELECT 'Rent', ROUND(SUM(amount_cents)/100.0,2) FROM expenses WHERE category='Rent' UNION ALL SELECT 'Tools', ROUND(SUM(amount_cents)/100.0,2) FROM expenses WHERE category='Tools' UNION ALL SELECT 'Travel', ROUND(SUM(amount_cents)/100.0,2) FROM expenses WHERE category='Travel'`));
console.log("P40 stack scalar min/max:", one(`SELECT 'max' AS k, ROUND(MAX(total),2) AS v FROM orders UNION ALL SELECT 'min', ROUND(MIN(total),2) FROM orders`));
console.log("P41 stack active counts:", one(`SELECT 'active' AS k, COUNT(*) AS n FROM customers WHERE active=1 UNION ALL SELECT 'inactive', COUNT(*) FROM customers WHERE active=0`));
console.log("P42 stack ledger dr/cr:", one(`SELECT 'debits' AS k, ROUND(SUM(debit_cents)/100.0,2) AS v FROM ledger_entries UNION ALL SELECT 'credits', ROUND(SUM(credit_cents)/100.0,2) FROM ledger_entries`));
console.log("P43 stack years orders:", one(`SELECT 'y2024' AS k, COUNT(*) AS n FROM orders WHERE created_at LIKE '2024%' UNION ALL SELECT 'y2025', COUNT(*) FROM orders WHERE created_at LIKE '2025%'`));
console.log("P44 stack paid vs open money:", one(`SELECT 'paid' AS k, ROUND(SUM(amount_cents)/100.0,2) AS v FROM invoices WHERE status='paid' UNION ALL SELECT 'open', ROUND(SUM(amount_cents)/100.0,2) FROM invoices WHERE status='open' UNION ALL SELECT 'void', ROUND(SUM(amount_cents)/100.0,2) FROM invoices WHERE status='void'`));

console.log("\n== S6 CASE ==");
console.log("P45 order size bands 250:", one(`SELECT CASE WHEN total >= 250 THEN 'large' WHEN total >= 100 THEN 'mid' ELSE 'small' END AS band, COUNT(*) AS n FROM orders GROUP BY band ORDER BY band`));
console.log("P46 invoice bands 2000/800:", one(`SELECT CASE WHEN amount_cents >= 200000 THEN 'a' WHEN amount_cents >= 80000 THEN 'b' ELSE 'c' END AS band, COUNT(*) AS n FROM invoices GROUP BY band ORDER BY band`));
console.log("P47 expense size buckets 1000:", one(`SELECT CASE WHEN amount_cents >= 100000 THEN 'big' ELSE 'small' END AS band, COUNT(*) AS n FROM expenses GROUP BY band ORDER BY band`));
console.log("P48 quarter pivot orders money:", one(`SELECT CASE WHEN substr(created_at,6,2) IN ('01','02','03') THEN 'Q1' WHEN substr(created_at,6,2) IN ('04','05','06') THEN 'Q2' WHEN substr(created_at,6,2) IN ('07','08','09') THEN 'Q3' ELSE 'Q4' END AS q, ROUND(SUM(total),2) AS money FROM orders GROUP BY q ORDER BY q`));
console.log("P49 pivot status x region counts:", one(`SELECT c.region, SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END) AS d, SUM(CASE WHEN o.status<>'delivered' THEN 1 ELSE 0 END) AS other FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY c.region`));
console.log("P50 pivot supplier rating bands:", one(`SELECT CASE WHEN rating >= 4.5 THEN 'elite' WHEN rating >= 4 THEN 'solid' ELSE 'basic' END AS band, COUNT(*) AS n FROM suppliers GROUP BY band ORDER BY band`));
console.log("P51 pivot stock bands 200/100:", one(`SELECT CASE WHEN stock >= 200 THEN 'deep' WHEN stock >= 100 THEN 'mid' ELSE 'lean' END AS band, COUNT(*) AS n FROM products GROUP BY band ORDER BY band`));
console.log("P52 pivot payments method counts:", one(`SELECT method, SUM(CASE WHEN amount_cents >= 300000 THEN 1 ELSE 0 END) AS big, SUM(CASE WHEN amount_cents < 300000 THEN 1 ELSE 0 END) AS small FROM payments GROUP BY method ORDER BY method`));
console.log("P53 pivot ledger account money:", one(`SELECT account, ROUND(SUM(CASE WHEN debit_cents > 0 THEN debit_cents ELSE 0 END)/100.0,2) AS dr, ROUND(SUM(CASE WHEN credit_cents > 0 THEN credit_cents ELSE 0 END)/100.0,2) AS cr FROM ledger_entries GROUP BY account ORDER BY account`));
console.log("P54 CASE custom sort suppliers:", one(`SELECT name FROM suppliers ORDER BY CASE WHEN name LIKE 'B%' THEN 0 WHEN name LIKE 'K%' THEN 1 ELSE 2 END, name`));
console.log("P55 pivot products price x stock:", one(`SELECT CASE WHEN price >= 100 THEN 'premium' ELSE 'standard' END AS tier, SUM(CASE WHEN stock >= 100 THEN 1 ELSE 0 END) AS deep, SUM(CASE WHEN stock < 100 THEN 1 ELSE 0 END) AS lean FROM products GROUP BY tier ORDER BY tier`));
console.log("P56 pivot invoices month-half:", one(`SELECT CASE WHEN substr(issued_on,6,2) <= '06' THEN 'H1' ELSE 'H2' END AS half, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM invoices GROUP BY half ORDER BY half`));
console.log("P57 pivot customers region x active:", one(`SELECT region, SUM(CASE WHEN active=1 THEN 1 ELSE 0 END) AS on_, SUM(CASE WHEN active=0 THEN 1 ELSE 0 END) AS off_ FROM customers GROUP BY region ORDER BY region`));
console.log("P58 pivot expense month-end big:", one(`SELECT category, ROUND(SUM(CASE WHEN amount_cents >= 100000 THEN amount_cents ELSE 0 END)/100.0,2) AS big_money, ROUND(SUM(CASE WHEN amount_cents < 100000 THEN amount_cents ELSE 0 END)/100.0,2) AS small_money FROM expenses GROUP BY category ORDER BY category`));

db.close();
rmSync(COPY);
