// M3 cases wave-6 (cs-851–900) fact probes — fresh receipts for cases-s6.ts.
// Run: bun scripts/m3-facts-s6w.ts   (copy of db, read-only)
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3w6.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
let n = 0;
function q(label: string, sql: string) {
  n++;
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const flat = JSON.stringify(rows);
    console.log(`A${String(n).padStart(2, "0")} ${label}: ${flat.length > 700 ? flat.slice(0, 700) + "…" : flat}`);
  } catch (e) {
    console.log(`A${String(n).padStart(2, "0")} ${label}: ERROR ${(e as Error).message}`);
  }
}

console.log("== S1/S2 STACKS ==");
q("invoiced/collected/spent totals", `SELECT 'invoiced' AS k, ROUND(SUM(amount_cents)/100.0,2) AS v FROM invoices UNION ALL SELECT 'collected', ROUND(SUM(amount_cents)/100.0,2) FROM payments UNION ALL SELECT 'spent', ROUND(SUM(amount_cents)/100.0,2) FROM expenses`);
q("ledger dr/cr row counts", `SELECT 'debit_rows' AS k, COUNT(*) AS n FROM ledger_entries WHERE debit_cents > 0 UNION ALL SELECT 'credit_rows', COUNT(*) FROM ledger_entries WHERE credit_cents > 0`);
q("orders vs invoices status counts", `SELECT 'orders' AS src, status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT 'invoices', status, COUNT(*) FROM invoices GROUP BY status ORDER BY src DESC, n DESC`);
q("invoice status money 3-arm", `SELECT 'paid' AS lane, ROUND(SUM(amount_cents)/100.0,2) AS money FROM invoices WHERE status='paid' UNION ALL SELECT 'open', ROUND(SUM(amount_cents)/100.0,2) FROM invoices WHERE status='open' UNION ALL SELECT 'void', ROUND(SUM(amount_cents)/100.0,2) FROM invoices WHERE status='void'`);
q("quarter money 4-arm stack", `SELECT 'Q1' AS q, ROUND(SUM(total),2) AS money FROM orders WHERE substr(created_at,6,2) IN ('01','02','03') UNION ALL SELECT 'Q2', ROUND(SUM(total),2) FROM orders WHERE substr(created_at,6,2) IN ('04','05','06') UNION ALL SELECT 'Q3', ROUND(SUM(total),2) FROM orders WHERE substr(created_at,6,2) IN ('07','08','09') UNION ALL SELECT 'Q4', ROUND(SUM(total),2) FROM orders WHERE substr(created_at,6,2) IN ('10','11','12')`);
q("expense big/small arms", `SELECT 'big' AS k, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM expenses WHERE amount_cents >= 100000 UNION ALL SELECT 'small', COUNT(*), ROUND(SUM(amount_cents)/100.0,2) FROM expenses WHERE amount_cents < 100000`);
q("expense month detail+total", `SELECT substr(spent_on,1,7) AS m, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM expenses GROUP BY m UNION ALL SELECT 'total', COUNT(*), ROUND(SUM(amount_cents)/100.0,2) FROM expenses ORDER BY m`);
q("status money 4-arm", `SELECT 'delivered' AS k, ROUND(SUM(total),2) AS money FROM orders WHERE status='delivered' UNION ALL SELECT 'shipped', ROUND(SUM(total),2) FROM orders WHERE status='shipped' UNION ALL SELECT 'pending', ROUND(SUM(total),2) FROM orders WHERE status='pending' UNION ALL SELECT 'cancelled', ROUND(SUM(total),2) FROM orders WHERE status='cancelled'`);
q("ledger debits vs credits totals", `SELECT 'debits' AS side, ROUND(SUM(debit_cents)/100.0,2) AS money FROM ledger_entries UNION ALL SELECT 'credits', ROUND(SUM(credit_cents)/100.0,2) FROM ledger_entries`);
q("roster live/churned", `SELECT 'live' AS k, COUNT(*) AS n FROM customers WHERE active = 1 UNION ALL SELECT 'churned', COUNT(*) FROM customers WHERE active = 0`);
q("order bookends", `SELECT 'floor' AS k, ROUND(MIN(total),2) AS v FROM orders UNION ALL SELECT 'ceiling', ROUND(MAX(total),2) FROM orders`);

console.log("== S3 FRESH INTERSECTS ==");
q("both-kind customers delivered∩pending", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='delivered' INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status='pending')`);
q("invoiced∩orderers", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM invoices INTERSECT SELECT DISTINCT customer_id FROM orders)`);
q("ledger dates∩order dates", `SELECT COUNT(*) AS n FROM (SELECT entry_date FROM ledger_entries INTERSECT SELECT created_at FROM orders)`);
q("active∩EU customers", `SELECT COUNT(*) AS n FROM (SELECT id FROM customers WHERE active=1 INTERSECT SELECT id FROM customers WHERE region='EU')`);
q("popular∩premium products", `SELECT COUNT(*) AS n FROM (SELECT product_id FROM order_items INTERSECT SELECT id FROM products WHERE price >= 100)`);
q("order months∩invoice months", `SELECT COUNT(*) AS n FROM (SELECT substr(created_at,1,7) AS m FROM orders INTERSECT SELECT substr(issued_on,1,7) FROM invoices)`);
q("invoice months∩payment months", `SELECT COUNT(*) AS n FROM (SELECT substr(issued_on,1,7) AS m FROM invoices INTERSECT SELECT substr(paid_on,1,7) FROM payments)`);
q("shippers∩invoiced customers", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='shipped' INTERSECT SELECT DISTINCT customer_id FROM invoices)`);
q("2025 order dates∩2025 expense dates", `SELECT COUNT(*) AS n FROM (SELECT created_at FROM orders WHERE created_at >= '2025-01-01' INTERSECT SELECT spent_on FROM expenses WHERE spent_on >= '2025-01-01')`);
q("customers∩invoiced", `SELECT COUNT(*) AS n FROM (SELECT id FROM customers INTERSECT SELECT DISTINCT customer_id FROM invoices)`);
q("suppliers columns", `SELECT name FROM pragma_table_info('suppliers')`);
q("payments columns", `SELECT name FROM pragma_table_info('payments')`);
q("invoices columns", `SELECT name FROM pragma_table_info('invoices')`);

console.log("== S4 FRESH EXCEPTS ==");
q("invoiced∖pending-orderers", `SELECT GROUP_CONCAT(v) AS ids FROM (SELECT DISTINCT customer_id AS v FROM invoices EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='pending')`);
q("invoiced∖pending count", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id AS v FROM invoices EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='pending')`);
q("order months∖expense months", `SELECT COUNT(*) AS n FROM (SELECT substr(created_at,1,7) AS m FROM orders EXCEPT SELECT substr(spent_on,1,7) FROM expenses)`);
q("invoice months∖payment months", `SELECT COUNT(*) AS n FROM (SELECT substr(issued_on,1,7) AS m FROM invoices EXCEPT SELECT substr(paid_on,1,7) FROM payments)`);
q("customers∖EU∖APAC", `SELECT GROUP_CONCAT(v) AS names FROM (SELECT name AS v FROM customers EXCEPT SELECT name FROM customers WHERE region='EU' EXCEPT SELECT name FROM customers WHERE region='APAC')`);
q("ledger dates∖order dates", `SELECT COUNT(*) AS n FROM (SELECT entry_date FROM ledger_entries EXCEPT SELECT created_at FROM orders)`);
q("shipped∖invoiced customers", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='shipped' EXCEPT SELECT DISTINCT customer_id FROM invoices)`);
q("active∖invoiced customers", `SELECT COUNT(*) AS n FROM (SELECT id FROM customers WHERE active=1 EXCEPT SELECT DISTINCT customer_id FROM invoices)`);
q("jumbo-invoiced∖paid-any customers", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM invoices WHERE amount_cents >= 300000 EXCEPT SELECT DISTINCT customer_id FROM invoices WHERE status='paid')`);
q("2025-only orderers∖2024", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders WHERE created_at >= '2025-01-01' EXCEPT SELECT DISTINCT customer_id FROM orders WHERE created_at < '2025-01-01')`);
q("EU∖invoiced customers", `SELECT GROUP_CONCAT(v) AS names FROM (SELECT name AS v FROM customers WHERE region='EU' EXCEPT SELECT DISTINCT customer_id FROM invoices JOIN customers ON customers.id = customer_id WHERE region='EU')`);
q("ordered∖premium products", `SELECT COUNT(*) AS n FROM (SELECT product_id FROM order_items EXCEPT SELECT id FROM products WHERE price >= 100)`);

console.log("== S5 CHAINS ==");
q("statuses∪methods DESC LIMIT 2", `SELECT v FROM (SELECT status AS v FROM orders UNION SELECT method FROM payments) ORDER BY v DESC LIMIT 2`);
q("product cats∪expense cats", `SELECT GROUP_CONCAT(v) AS vs FROM (SELECT category AS v FROM products UNION SELECT category FROM expenses)`);
q("delivered∪cancelled∩pending ids", `SELECT COUNT(*) AS n FROM (SELECT id FROM orders WHERE status='delivered' UNION SELECT id FROM orders WHERE status='cancelled' INTERSECT SELECT id FROM orders WHERE status='pending')`);
q("regions∪methods∪statuses LIMIT 3", `SELECT v FROM (SELECT region AS v FROM customers UNION SELECT status AS v FROM orders UNION SELECT method FROM payments) ORDER BY v LIMIT 3`);
q("cats∪accounts pile", `SELECT COUNT(*) AS n FROM (SELECT category AS v FROM expenses UNION SELECT account FROM ledger_entries)`);

console.log("== S6 CASE ==");
q("payment rail flip", `SELECT CASE method WHEN 'wire' THEN 'bank transfer' ELSE 'card network' END AS rail, COUNT(*) AS n FROM payments GROUP BY rail ORDER BY rail`);
q("customer cohorts", `SELECT CASE WHEN created_at LIKE '2023%' THEN 'founding' ELSE 'scale-up' END AS cohort, COUNT(*) AS n FROM customers GROUP BY cohort ORDER BY cohort`);
q("ledger side flag", `SELECT CASE WHEN debit_cents > 0 THEN 'debit' ELSE 'credit' END AS side, COUNT(*) AS n FROM ledger_entries GROUP BY side ORDER BY side`);
q("invoice lifecycle lanes", `SELECT CASE status WHEN 'paid' THEN 'banked' WHEN 'open' THEN 'watch' ELSE 'dead' END AS lane, COUNT(*) AS n FROM invoices GROUP BY lane ORDER BY lane`);
q("shelf stocked/thin", `SELECT CASE WHEN stock >= 100 THEN 'stocked' ELSE 'thin' END AS shelf, COUNT(*) AS n FROM products GROUP BY shelf ORDER BY shelf`);
q("quarter buckets counts", `SELECT CASE WHEN substr(created_at,6,2) IN ('01','02','03') THEN 'Q1' WHEN substr(created_at,6,2) IN ('04','05','06') THEN 'Q2' WHEN substr(created_at,6,2) IN ('07','08','09') THEN 'Q3' ELSE 'Q4' END AS q, COUNT(*) AS n FROM orders GROUP BY q ORDER BY q`);
q("fixed vs variable money", `SELECT ROUND(SUM(CASE WHEN category='Rent' THEN amount_cents ELSE 0 END)/100.0,2) AS fixed, ROUND(SUM(CASE WHEN category!='Rent' THEN amount_cents ELSE 0 END)/100.0,2) AS variable FROM expenses`);
q("rating bands", `SELECT CASE WHEN rating >= 4.5 THEN 'elite' WHEN rating >= 4.0 THEN 'solid' ELSE 'basic' END AS band, COUNT(*) AS n FROM suppliers GROUP BY band ORDER BY band`);
q("whale/dolphin/minnow", `SELECT CASE WHEN total >= 300 THEN 'whale' WHEN total >= 150 THEN 'dolphin' ELSE 'minnow' END AS pod, COUNT(*) AS n FROM orders GROUP BY pod ORDER BY pod`);
q("status×size money grid", `SELECT status, ROUND(SUM(CASE WHEN total>=150 THEN total ELSE 0 END),2) AS big_money, ROUND(SUM(CASE WHEN total<150 THEN total ELSE 0 END),2) AS small_money FROM orders GROUP BY status ORDER BY status`);
q("quarter money 4-col pivot", `SELECT ROUND(SUM(CASE WHEN substr(created_at,6,2) IN ('01','02','03') THEN total ELSE 0 END),2) AS q1, ROUND(SUM(CASE WHEN substr(created_at,6,2) IN ('04','05','06') THEN total ELSE 0 END),2) AS q2, ROUND(SUM(CASE WHEN substr(created_at,6,2) IN ('07','08','09') THEN total ELSE 0 END),2) AS q3, ROUND(SUM(CASE WHEN substr(created_at,6,2) IN ('10','11','12') THEN total ELSE 0 END),2) AS q4 FROM orders`);
q("region×status 4-col pivot", `SELECT c.region, SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) AS p, SUM(CASE WHEN o.status='shipped' THEN 1 ELSE 0 END) AS s, SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END) AS d, SUM(CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END) AS x FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY c.region`);
q("invoice status×region money", `SELECT c.region, ROUND(SUM(CASE WHEN i.status='paid' THEN i.amount_cents ELSE 0 END)/100.0,2) AS paid_money, ROUND(SUM(CASE WHEN i.status='open' THEN i.amount_cents ELSE 0 END)/100.0,2) AS open_money FROM invoices i JOIN customers c ON c.id=i.customer_id GROUP BY c.region ORDER BY c.region`);
q("price×stock 2x2", `SELECT CASE WHEN price >= 100 THEN 'premium' ELSE 'standard' END AS tier, SUM(CASE WHEN stock >= 100 THEN 1 ELSE 0 END) AS deep, SUM(CASE WHEN stock < 100 THEN 1 ELSE 0 END) AS lean FROM products GROUP BY tier ORDER BY tier`);
q("custom sort expense cats", `SELECT DISTINCT category FROM expenses ORDER BY CASE category WHEN 'Rent' THEN 0 WHEN 'Ads' THEN 1 WHEN 'Travel' THEN 2 ELSE 3 END`);
q("custom sort + money DESC", `SELECT category, ROUND(SUM(amount_cents)/100.0,2) AS money FROM expenses GROUP BY category ORDER BY CASE WHEN category='Rent' THEN 0 ELSE 1 END, money DESC`);
q("HAVING on CASE alias", `SELECT region, SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS off FROM customers GROUP BY region HAVING off > 0 ORDER BY region`);
q("method×band money pivot", `SELECT method, COUNT(*) AS n, ROUND(SUM(CASE WHEN amount_cents >= 300000 THEN amount_cents ELSE 0 END)/100.0,2) AS big_money, ROUND(SUM(CASE WHEN amount_cents < 300000 THEN amount_cents ELSE 0 END)/100.0,2) AS std_money FROM payments GROUP BY method ORDER BY method`);

db.close();
rmSync(COPY);
console.log(`\n${n} probes done`);
