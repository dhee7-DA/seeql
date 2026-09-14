// Follow-up probes for Task m4-bank-b (round 2). READ-ONLY.
import { Database } from "bun:sqlite";
const db = new Database("/home/z/my-project/db/custom.db", { readonly: true });
type Row = Record<string, unknown>;
const run = (label: string, sql: string) => {
  try { console.log(`${label}: ${JSON.stringify((db.query(sql).all() as Row[]))}`); }
  catch (e) { console.log(`${label}: ERROR ${(e as Error).message}`); }
};

run("D1 rows where customer_id = id (shadow mechanism)", `SELECT COUNT(*) AS n FROM orders WHERE customer_id = id`);
run("D2 those rows", `SELECT id, customer_id, total FROM orders WHERE customer_id = id ORDER BY id LIMIT 20`);
run("D3 no-op customer_id = customer_id variant", `SELECT COUNT(*) AS n FROM customers WHERE (SELECT AVG(total) FROM orders WHERE customer_id = customer_id) > 400`);
run("D4 shipped_at-bearing statuses", `SELECT DISTINCT status FROM orders WHERE shipped_at IS NOT NULL`);
run("D5 customers with a shipped_at-bearing order", `SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE shipped_at IS NOT NULL`);
run("D6 the one customer with no delivered order", `SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')`);
run("D7 one-level misuse AVG with valid columns", `SELECT customer_id, total FROM orders WHERE total > AVG(total)`);
run("D8 created_at binding 3-way for c1", `SELECT (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND created_at > '2024-06-01') AS unq, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.created_at > '2024-06-01') AS innerq, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND c.created_at > '2024-06-01') AS outerq FROM customers c WHERE c.id = 1`);
run("D9 unq vs innerq per customer equal?", `SELECT COUNT(*) AS n FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND created_at > '2024-06-01') = (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.created_at > '2024-06-01')`);
run("D10 true same-FROM ambiguity inside subquery", `SELECT c.name FROM customers c WHERE (SELECT ROUND(AVG(o2.total), 2) FROM orders o2 JOIN customers c2 ON c2.id = o2.customer_id WHERE o2.customer_id = c.id AND created_at > '2024-01-01') > 400`);
run("D11 VIP via correlated SUM > 2177.08", `SELECT COUNT(*) AS n FROM customers c WHERE (SELECT SUM(o.total) FROM orders o WHERE o.customer_id = c.id) > 2177.08`);
run("D12 correlated SUM stamp min/max sanity", `SELECT MIN(s) AS lo, MAX(s) AS hi FROM (SELECT (SELECT SUM(o.total) FROM orders o WHERE o.customer_id = c.id) AS s FROM customers c)`);
run("D13 all-orders-shipped customer name", `SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status <> 'shipped')`);
run("D14 EXISTS shipped vs shipped_at contrast", `SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.shipped_at IS NOT NULL)`);
run("D15 per-customer order counts (for count-stamp story)", `SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id ORDER BY n DESC LIMIT 6`);
run("D16 no-pending-no-shipped-no-cancelled (delivered-only customers)", `SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status <> 'delivered')`);
run("D17 Emma/Grace/Maya own avgs", `SELECT customer_id, COUNT(*) AS n_orders, ROUND(AVG(total),2) AS own_avg FROM orders WHERE customer_id IN (5,7,13) GROUP BY customer_id`);
run("D18 above-own AND above-store vs receipts", `SELECT SUM(CASE WHEN o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id=o.customer_id) THEN 1 ELSE 0 END) AS above_own, SUM(CASE WHEN o.total > (SELECT AVG(total) FROM orders) THEN 1 ELSE 0 END) AS above_store FROM orders o`);

db.close();
console.log("--- round-2 probes done");
