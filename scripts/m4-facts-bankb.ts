// Extra probes for Task m4-bank-b (drill sets dr4-exi + dr4-cor).
// Complements scripts/m4-facts.ts (P01–P56). READ-ONLY — bun:sqlite only.
// Run: bun scripts/m4-facts-bankb.ts
import { Database } from "bun:sqlite";

const db = new Database("/home/z/my-project/db/custom.db", { readonly: true });

type Row = Record<string, unknown>;
const run = (label: string, sql: string) => {
  try {
    const rows = db.query(sql).all() as Row[];
    console.log(`${label}: ${JSON.stringify(rows)}`);
  } catch (e) {
    console.log(`${label}: ERROR ${(e as Error).message}`);
  }
};

// ---------- EXISTS set extras ----------
run("B1 eqp EXISTS shipped", `EXPLAIN QUERY PLAN SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped')`);
run("B2 NOT IN over NULL-shipped owners (expect 12?)", `SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE shipped_at IS NULL)`);
run("B3 distinct customers holding a NULL-shipped order", `SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE shipped_at IS NULL`);
run("B4 EXISTS pending", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending')`);
run("B5 NOT EXISTS pending", `SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending')`);
run("B6 EXISTS cancelled", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')`);
run("B7 NOT EXISTS cancelled", `SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')`);
run("B8 EXISTS delivered", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')`);
run("B9 NOT EXISTS any order", `SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`);
run("B10 NOT EXISTS any invoice", `SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id)`);
run("B11 double neg: all orders shipped", `SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status <> 'shipped')`);
run("B12 EXISTS as SELECT-list flag", `SELECT COUNT(*) AS n, SUM(CASE WHEN EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) THEN 1 ELSE 0 END) AS ones FROM customers c`);
run("B13 err no such column cust.id", `SELECT name FROM customers WHERE EXISTS (SELECT 1 FROM orders o WHERE cust.id = o.customer_id)`);
run("B14 err EXISTS without parens", `SELECT name FROM customers c WHERE EXISTS SELECT 1 FROM orders o WHERE o.customer_id = c.id`);
run("B15 err EXISTS empty parens", `SELECT name FROM customers c WHERE EXISTS ()`);
run("B16 err aggregate in inner WHERE", `SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND COUNT(*) > 1)`);
run("B17 err dangling AND in inner", `SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND)`);
run("B18 err EXISTS (table)", `SELECT c.name FROM customers c WHERE EXISTS (orders)`);
run("B19 err EXISTS NOT", `SELECT name FROM customers c WHERE EXISTS NOT (SELECT 1 FROM orders o)`);
run("B20 EXISTS LIMIT 0 inner", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id LIMIT 0)`);
run("B21 uncorrelated TRUE probe", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.status = 'shipped')`);
run("B22 bare-aggregate inner tautology", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.total > 800)`);
run("B23 EXISTS jumbo >= 1000", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.total >= 1000)`);
run("B24 EXISTS total > 500", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.total > 500)`);
run("B25 NOT EXISTS shipped — the 6 names", `SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.shipped_at IS NOT NULL)`);
run("B26 no-shipped-and-no-pending customers", `SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE status IN ('shipped','pending')`);
run("B27 EQP uncorrelated EXISTS probe", `EXPLAIN QUERY PLAN SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.status = 'shipped')`);

// ---------- correlated set extras ----------
run("C1 solo-order customers", `SELECT c.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id HAVING COUNT(*) = 1`);
run("C2 own-avg > 400", `SELECT COUNT(*) AS n FROM customers c WHERE (SELECT AVG(o.total) FROM orders o WHERE o.customer_id = c.id) > 400`);
run("C3 own-avg > 500", `SELECT COUNT(*) AS n FROM customers c WHERE (SELECT AVG(o.total) FROM orders o WHERE o.customer_id = c.id) > 500`);
run("C4 own-avg > store 338.19", `SELECT COUNT(*) AS n FROM customers c WHERE (SELECT AVG(o.total) FROM orders o WHERE o.customer_id = c.id) > 338.19`);
run("C5 EXISTS + HAVING SUM >= 6000", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT o.customer_id FROM orders o WHERE o.customer_id = c.id GROUP BY o.customer_id HAVING SUM(o.total) >= 6000)`);
run("C6 EXISTS + HAVING COUNT >= 20", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT o.customer_id FROM orders o WHERE o.customer_id = c.id GROUP BY o.customer_id HAVING COUNT(*) >= 20)`);
run("C7 shadow no-op: customer_id = id", `SELECT COUNT(*) AS n FROM customers WHERE (SELECT AVG(total) FROM orders WHERE customer_id = id) > 400`);
run("C8 err ambiguous created_at", `SELECT c.name FROM customers c WHERE (SELECT o.total FROM orders o WHERE o.customer_id = c.id AND created_at > '2024-06-01' LIMIT 1) IS NOT NULL`);
run("C9 distinct own-avg stamps", `SELECT COUNT(DISTINCT av) AS n FROM (SELECT (SELECT ROUND(AVG(o.total), 2) FROM orders o WHERE o.customer_id = c.id) AS av FROM customers c)`);
run("C10 distinct per-customer order-count stamps", `SELECT COUNT(DISTINCT cnt) AS n FROM (SELECT (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS cnt FROM customers c)`);
run("C11 above own avg — customers (expect 14)", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = c.id))`);
run("C12 err misuse AVG one level", `SELECT name, total FROM orders WHERE total > AVG(total)`);
run("C13 orders above store avg (expect 42)", `SELECT COUNT(*) AS n FROM orders WHERE total > (SELECT AVG(total) FROM orders)`);
run("C14 >= own avg variant (expect 47?)", `SELECT COUNT(*) AS n FROM orders o WHERE o.total >= (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`);
run("C15 own-max rows count", `SELECT COUNT(*) AS n FROM orders o WHERE o.total = (SELECT MAX(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`);
run("C16 bare COUNT(*) = 4 customers", `SELECT COUNT(*) AS n FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) = 4`);
run("C17 COUNT(DISTINCT status) = 4 veterans", `SELECT COUNT(*) AS n FROM customers c WHERE (SELECT COUNT(DISTINCT o.status) FROM orders o WHERE o.customer_id = c.id) = 4`);
run("C18 orders from inactive customers (reverse correlation)", `SELECT COUNT(*) AS n FROM orders o WHERE EXISTS (SELECT 1 FROM customers c WHERE c.id = o.customer_id AND c.active = 0)`);
run("C19 err subquery missing FROM", `SELECT c.name FROM customers c WHERE (SELECT AVG(o2.total) WHERE o2.customer_id = c.id) > 400`);
run("C20 err undeclared outer alias in outer WHERE", `SELECT o.id FROM orders o WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) AND c.active = 1`);
run("C21 uncorrelated scalar stamps all rows (verify P15 shape)", `SELECT COUNT(*) AS n, COUNT(DISTINCT s) AS d FROM (SELECT (SELECT ROUND(AVG(total), 2) FROM orders) AS s FROM customers c)`);
run("C22 EQP correlated scalar own-avg", `EXPLAIN QUERY PLAN SELECT c.name, (SELECT ROUND(AVG(o2.total), 2) FROM orders o2 WHERE o2.customer_id = c.id) AS own_avg FROM customers c`);

db.close();
console.log("--- bank-b probes done");
