// Round-3 probes for Task m4-bank-b. READ-ONLY.
import { Database } from "bun:sqlite";
const db = new Database("/home/z/my-project/db/custom.db", { readonly: true });
type Row = Record<string, unknown>;
const run = (label: string, sql: string) => {
  try { console.log(`${label}: ${JSON.stringify((db.query(sql).all() as Row[]))}`); }
  catch (e) { console.log(`${label}: ERROR ${(e as Error).message}`); }
};

run("R1 outer WHERE reaches into subquery alias", `SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o) AND o.status = 'shipped'`);
run("R2 comparison without parens", `SELECT customer_id FROM orders WHERE total > SELECT AVG(total) FROM orders`);
run("R3 AVG of outer column inside inner", `SELECT COUNT(*) AS n FROM orders o WHERE o.total > (SELECT AVG(o.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`);
run("R4 cancelled AND pending clubs", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled') AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'pending')`);
run("R5 Liam's single order", `SELECT id, status, total FROM orders WHERE customer_id = 12`);
run("R6 Olivia's single order", `SELECT id, status, total FROM orders WHERE customer_id = 15`);
run("R7 HAVING runs-and-lies count", `SELECT COUNT(*) AS n FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING SUM(o.total) > AVG(o.total)`);
run("R8 delivered-only names", `SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status <> 'delivered')`);
run("R9 shipped-and-pending-excluded names", `SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status IN ('shipped','pending'))`);
run("R10 EXISTS-flag stamp for shipped", `SELECT COUNT(*) AS rows_out, SUM(s) AS trues FROM (SELECT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped') AS s FROM customers c)`);

db.close();
console.log("--- round-3 probes done");
