// Wave-6 probe round 2 — tie-checks, identity checks, replacement receipts.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3w6b.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
let n = 0;
function q(label: string, sql: string) {
  n++;
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`B${String(n).padStart(2, "0")} ${label}: ${JSON.stringify(rows).slice(0, 500)}`);
  } catch (e) {
    console.log(`B${String(n).padStart(2, "0")} ${label}: ERROR ${(e as Error).message}`);
  }
}

q("a ledger∩expense dates", `SELECT COUNT(*) AS n FROM (SELECT entry_date FROM ledger_entries INTERSECT SELECT spent_on FROM expenses)`);
q("a2 ledger∖expense dates", `SELECT COUNT(*) AS n FROM (SELECT entry_date FROM ledger_entries EXCEPT SELECT spent_on FROM expenses)`);
q("b customers∩suppliers names", `SELECT COUNT(*) AS n FROM (SELECT name FROM customers INTERSECT SELECT name FROM suppliers)`);
q("c shipped buyers", `SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE status='shipped'`);
q("d pending∩invoiced", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='pending' INTERSECT SELECT DISTINCT customer_id FROM invoices)`);
q("e delivered∩invoiced", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='delivered' INTERSECT SELECT DISTINCT customer_id FROM invoices)`);
q("f invoiced∩delivered-buyers", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM invoices INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status='delivered')`);
q("g delivered buyers", `SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE status='delivered'`);
q("h due months∩paid months", `SELECT COUNT(*) AS n FROM (SELECT substr(due_on,1,7) AS m FROM invoices INTERSECT SELECT substr(paid_on,1,7) FROM payments)`);
q("i issued months∩spent months", `SELECT COUNT(*) AS n FROM (SELECT substr(issued_on,1,7) AS m FROM invoices INTERSECT SELECT substr(spent_on,1,7) FROM expenses)`);
q("j shared invoice∩pay months list+min", `SELECT COUNT(*) AS n, MIN(m) AS first_m, GROUP_CONCAT(m) AS ms FROM (SELECT substr(issued_on,1,7) AS m FROM invoices INTERSECT SELECT substr(paid_on,1,7) FROM payments)`);
q("j2 shared order∩invoice months list+min", `SELECT COUNT(*) AS n, MIN(m) AS first_m, GROUP_CONCAT(m) AS ms FROM (SELECT substr(created_at,1,7) AS m FROM orders INTERSECT SELECT substr(issued_on,1,7) FROM invoices)`);
q("k shared 2025 date", `SELECT GROUP_CONCAT(v) AS ds FROM (SELECT created_at AS v FROM orders WHERE created_at >= '2025-01-01' INTERSECT SELECT spent_on FROM expenses WHERE spent_on >= '2025-01-01')`);
q("k2 shipped-2025∩expense-2025", `SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders WHERE shipped_at >= '2025-01-01' INTERSECT SELECT spent_on FROM expenses WHERE spent_on >= '2025-01-01')`);
q("l inactive∖invoiced", `SELECT COUNT(*) AS n FROM (SELECT id FROM customers WHERE active=0 EXCEPT SELECT DISTINCT customer_id FROM invoices)`);
q("m invoiced∖cancelled-buyers", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM invoices EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='cancelled')`);
q("n invoiced∖delivered-buyers", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM invoices EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='delivered')`);
q("o invoiced∖shipped-buyers", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM invoices EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='shipped')`);
q("p distinct debit_cents", `SELECT COUNT(DISTINCT debit_cents) AS n FROM ledger_entries`);
q("q ledger∖customer-created dates", `SELECT COUNT(*) AS n FROM (SELECT entry_date FROM ledger_entries EXCEPT SELECT created_at FROM customers)`);
q("r shipped∖invoiced id", `SELECT GROUP_CONCAT(v) AS ids FROM (SELECT DISTINCT customer_id AS v FROM orders WHERE status='shipped' EXCEPT SELECT DISTINCT customer_id FROM invoices)`);
q("s pending∖invoiced", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='pending' EXCEPT SELECT DISTINCT customer_id FROM invoices)`);
q("t delivered∖invoiced", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='delivered' EXCEPT SELECT DISTINCT customer_id FROM invoices)`);
q("u cancelled∖invoiced", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders WHERE status='cancelled' EXCEPT SELECT DISTINCT customer_id FROM invoices)`);
q("v custs ≥500000 cents", `SELECT COUNT(DISTINCT customer_id) AS n FROM invoices WHERE amount_cents >= 500000`);
q("w custs ≥300000 cents", `SELECT COUNT(DISTINCT customer_id) AS n FROM invoices WHERE amount_cents >= 300000`);
q("w2 jumbo∖open", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM invoices WHERE amount_cents >= 300000 EXCEPT SELECT DISTINCT customer_id FROM invoices WHERE status='open')`);
q("y newcomer id (2025 only)", `SELECT GROUP_CONCAT(v) AS ids FROM (SELECT DISTINCT customer_id AS v FROM orders WHERE created_at >= '2025-01-01' EXCEPT SELECT DISTINCT customer_id FROM orders WHERE created_at < '2025-01-01')`);
q("z ≥2025-02 buyers∖2024", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders WHERE created_at >= '2025-02-01' EXCEPT SELECT DISTINCT customer_id FROM orders WHERE created_at < '2025-01-01')`);
q("bb 3-arm cats∪cats∪statuses", `SELECT COUNT(*) AS n FROM (SELECT category AS v FROM products UNION SELECT category FROM expenses UNION SELECT status FROM invoices)`);
q("cc (delivered∪shipped)∩pending custs", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id AS v FROM orders WHERE status='delivered' UNION SELECT DISTINCT customer_id FROM orders WHERE status='shipped' INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status='pending')`);
q("dd EU vs non-EU", `SELECT CASE WHEN region='EU' THEN 'home' ELSE 'export' END AS mkt, COUNT(*) AS n FROM customers GROUP BY mkt ORDER BY mkt`);
q("ee shelf units", `SELECT CASE WHEN stock >= 100 THEN 'stocked' ELSE 'thin' END AS shelf, COUNT(*) AS n, SUM(stock) AS units FROM products GROUP BY shelf ORDER BY shelf`);
q("ff orders 200-299", `SELECT COUNT(*) AS n FROM orders WHERE total >= 200 AND total < 300`);
q("gg wires ≥5000", `SELECT COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM payments WHERE method='wire' AND amount_cents >= 500000`);
q("hh void invoice detail", `SELECT id, customer_id, ROUND(amount_cents/100.0,2) AS money, status FROM invoices WHERE status='void'`);
q("ii card/wire counts", `SELECT method, COUNT(*) AS n FROM payments GROUP BY method ORDER BY method`);
q("jj ordered∖budget movers + priciest", `SELECT COUNT(*) AS movers, MAX(v) AS priciest FROM (SELECT product_id AS v FROM order_items EXCEPT SELECT id FROM products WHERE price < 50)`);
q("kk ordered∖premium movers", `SELECT COUNT(*) AS movers FROM (SELECT product_id FROM order_items EXCEPT SELECT id FROM products WHERE price >= 100)`);
q("ll EU∖invoiced count", `SELECT COUNT(*) AS n FROM (SELECT id FROM customers WHERE region='EU' EXCEPT SELECT DISTINCT customer_id FROM invoices)`);
q("mm ledger∖order months", `SELECT COUNT(*) AS n FROM (SELECT substr(entry_date,1,7) FROM ledger_entries EXCEPT SELECT substr(created_at,1,7) FROM orders)`);

db.close();
rmSync(COPY);
console.log(`\n${n} probes done`);
