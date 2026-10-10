// M4 day-2 receipt tool — EXISTS + correlated subqueries (task m4-d2).
// Run: bun scripts/m4-facts-d2.ts
// Read-only COPY of db/custom.db (never touches the live db).
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync, existsSync } from "node:fs";

const SRC = "db/custom.db";
const COPY = "db/.m4d2.db";
if (existsSync(COPY)) rmSync(COPY);
copyFileSync(SRC, COPY);
const db = new Database(COPY, { readonly: true });

let n = 0;
function q(label: string, sql: string): unknown {
  n++;
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const one = db.query(sql).get() as Record<string, unknown> | null;
    console.log(`${String(n).padStart(2, "0")}. ${label}\n    -> ${JSON.stringify(one)}`);
    return rows;
  } catch (e) {
    console.log(`${String(n).padStart(2, "0")}. ${label}\n    -> ERROR: ${(e as Error).message}`);
    return null;
  }
}
function err(label: string, sql: string): void {
  n++;
  try {
    db.query(sql).all();
    console.log(`${String(n).padStart(2, "0")}. ${label}\n    -> NO ERROR (unexpected)`);
  } catch (e) {
    console.log(`${String(n).padStart(2, "0")}. ${label}\n    -> ERROR: ${(e as Error).message}`);
  }
}

console.log("=== A. census / fact-sheet verification ===");
q("customers count", "SELECT COUNT(*) AS n FROM customers");
q("orders count", "SELECT COUNT(*) AS n FROM orders");
q("products count", "SELECT COUNT(*) AS n FROM products");
q("suppliers count", "SELECT COUNT(*) AS n FROM suppliers");
q("invoices count", "SELECT COUNT(*) AS n FROM invoices");
q("orders by status (all rows)", "SELECT group_concat(status || '=' || n, ', ') AS s FROM (SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY status)");
q("pending+shipped", "SELECT COUNT(*) AS n FROM orders WHERE status IN ('pending','shipped')");
q("region counts (all rows)", "SELECT group_concat(region || '=' || n, ', ') AS s FROM (SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY region)");
q("orders.customer_id NULLs", "SELECT COUNT(*) AS n FROM orders WHERE customer_id IS NULL");
q("orders.customer_id distinct", "SELECT COUNT(DISTINCT customer_id) AS n FROM orders");
q("per-customer histogram (all rows)", "SELECT group_concat(cnt || 'x' || custs, ', ') AS s FROM (SELECT cnt, COUNT(*) AS custs FROM (SELECT customer_id, COUNT(*) AS cnt FROM orders GROUP BY customer_id) GROUP BY cnt ORDER BY cnt)");
q("mean orders/customer", "SELECT AVG(cnt) AS mean FROM (SELECT COUNT(*) AS cnt FROM orders GROUP BY customer_id)");
q("customers > mean", "SELECT COUNT(*) AS n FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) > (SELECT AVG(cnt) FROM (SELECT COUNT(*) AS cnt FROM orders GROUP BY customer_id))");
q("customers <5 orders", "SELECT COUNT(*) AS n FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) < 5");
q("customers >=20 orders", "SELECT COUNT(*) AS n FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) >= 20");
q("top-3 orderers by name (all rows)", "SELECT group_concat(name || '=' || n, ', ') AS s FROM (SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n FROM customers c ORDER BY n DESC, c.name LIMIT 3)");
q("top-3 avg", "SELECT AVG(n) AS a FROM (SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n FROM customers c ORDER BY n DESC, c.name LIMIT 3)");

console.log("=== B. EXISTS censuses ===");
q("customers with >=1 cancelled (EXISTS)", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')");
q("NOT EXISTS cancelled", "SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')");
q("customers with >=1 pending (EXISTS)", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending')");
q("NOT EXISTS pending", "SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending')");
q("customers with >=1 delivered (EXISTS)", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')");
q("NOT EXISTS delivered -> who", "SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')");
q("EXISTS any order", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)");
q("NOT EXISTS any order", "SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)");
q("SELECT 1 vs * vs NULL equivalence (delivered)", "SELECT (SELECT COUNT(*) FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='delivered')) AS one, (SELECT COUNT(*) FROM customers c WHERE EXISTS (SELECT * FROM orders o WHERE o.customer_id = c.id AND o.status='delivered')) AS star, (SELECT COUNT(*) FROM customers c WHERE EXISTS (SELECT NULL FROM orders o WHERE o.customer_id = c.id AND o.status='delivered')) AS nullproj");
q("EXISTS empty filter (Mars region orders)", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND 1 = 0)");
q("NOT EXISTS empty filter", "SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND 1 = 0)");
q("EXISTS(SELECT NULL) no FROM", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT NULL)");
q("EXISTS(SELECT 1/0) div-by-zero is NULL row", "SELECT EXISTS (SELECT 1/0) AS e, (SELECT 1/0) AS v");
q("orders MAX/MIN total", "SELECT MAX(total) AS mx, MIN(total) AS mn FROM orders");

console.log("=== C. NOT IN landmine + invoices ===");
q("invoices.customer_id NULLs", "SELECT COUNT(*) AS n FROM invoices WHERE customer_id IS NULL");
q("NOT IN orders list (all match)", "SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)");
q("NOT IN empty subquery", "SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE 1 = 0)");
q("NOT IN literal list with NULL", "SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (1, 2, NULL)");
q("NOT EXISTS invoices (uninvoiced)", "SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id)");
q("NOT IN invoices", "SELECT COUNT(*) AS n FROM customers WHERE id NOT IN (SELECT customer_id FROM invoices)");
q("invoice statuses", "SELECT status, COUNT(*) AS n FROM invoices GROUP BY status ORDER BY status");

console.log("=== D. correlated scalars ===");
q("checksum: correlated counts sum", "SELECT SUM((SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id)) AS s FROM customers c");
q("avg of correlated counts", "SELECT AVG((SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id)) AS a FROM customers c");
q("WHERE 5 > correlated count", "SELECT COUNT(*) AS n FROM customers c WHERE 5 > (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id)");
q("WHERE 24 > correlated count", "SELECT COUNT(*) AS n FROM customers c WHERE 24 > (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id)");
q("WHERE 24 = correlated count -> who", "SELECT c.name FROM customers c WHERE 24 = (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id)");
q("WHERE 13 = correlated count -> who", "SELECT c.name FROM customers c WHERE 13 = (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id)");
q("correlated count BETWEEN 13 AND 17", "SELECT COUNT(*) AS n FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) BETWEEN 13 AND 17");
q("correlated count = 0 (none possible)", "SELECT COUNT(*) AS n FROM customers c WHERE 0 = (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id)");
q("scalar COUNT on impossible id", "SELECT (SELECT COUNT(*) FROM orders WHERE customer_id = 999) AS z");
q("orders above own customer's avg total", "SELECT COUNT(*) AS n FROM orders o WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)");
q("orders below-or-equal own avg", "SELECT COUNT(*) AS n FROM orders o WHERE o.total <= (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)");
q("customers: 5 > correlated cancelled-count? (COUNT never NULL)", "SELECT COUNT(*) AS n FROM customers c WHERE 0 < (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')");
q("correlated AVG over empty set -> NULL exclusion", "SELECT COUNT(*) AS n FROM customers c WHERE 0 < (SELECT AVG(o.total) FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')");
q("correlated AVG IS NULL for who (no cancelled)", "SELECT COUNT(*) AS n FROM customers c WHERE (SELECT AVG(o.total) FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled') IS NULL");
q("EU customers above EU per-customer mean (corr into FROM sub)", "SELECT COUNT(*) AS n FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) > (SELECT AVG(cnt) FROM (SELECT COUNT(*) AS cnt FROM orders o2 JOIN customers c2 ON o2.customer_id = c2.id WHERE c2.region = c.region GROUP BY c2.id))");
q("EU per-customer mean order count", "SELECT AVG(cnt) AS m FROM (SELECT COUNT(*) AS cnt FROM orders o2 JOIN customers c2 ON o2.customer_id = c2.id WHERE c2.region = 'EU' GROUP BY c2.id)");

console.log("=== E. resolution / scalar-subquery behavior ===");
q("ambiguity trap: unqualified id inside EXISTS", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders WHERE customer_id = id)");
q("orders where customer_id = id", "SELECT COUNT(*) AS n FROM orders WHERE customer_id = id");
q("correct correlation with alias", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)");
q("multi-row scalar takes FIRST row", "SELECT (SELECT customer_id FROM orders) AS first_row_scalar");
q("multi-row scalar in WHERE (equality to first row)", "SELECT COUNT(*) AS n FROM customers WHERE id = (SELECT customer_id FROM orders)");
err("EXISTS(bare expression) syntax", "SELECT c.name FROM customers c WHERE EXISTS (o.customer_id = c.id)");
err("EXIST missing S", "SELECT c.name FROM customers c WHERE EXIST (SELECT 1 FROM orders o)");
err("NOT EXISTS empty parens", "SELECT c.name FROM customers c WHERE NOT EXISTS ()");
err("outer alias missing -> no such column", "SELECT name FROM customers WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)");
err("typo outer col -> no such column", "SELECT c.nam FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)");
err("scalar sub 2 columns", "SELECT (SELECT customer_id, total FROM orders) FROM customers LIMIT 1");
err("EXISTS inside SELECT list positions ok? (control)", "SELECT c.name, EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) AS flag FROM customers c LIMIT 1");

console.log("=== F. misc predict seeds ===");
q("customers with exactly 1 order -> names", "SELECT c.name FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) = 1");
q("customers with 2 orders count", "SELECT COUNT(*) AS n FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) = 2");
q("EXISTS uncorrelated (total > 1e9) -> none", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.total > 1000000000)");
q("EXISTS uncorrelated (total > 0) -> all", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.total > 0)");
q("NOT EXISTS uncorrelated (total > 0) -> none", "SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.total > 0)");
q("EXISTS subquery with ORDER BY + LIMIT 1 legal", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id ORDER BY o.total DESC LIMIT 1)");
q("correlated in SELECT list per-row counts", "SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n_orders FROM customers c ORDER BY n_orders DESC, c.name LIMIT 4");
q("APAC customers with delivered orders (EXISTS+region)", "SELECT COUNT(*) AS n FROM customers c WHERE c.region = 'APAC' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')");
q("US customers with delivered orders", "SELECT COUNT(*) AS n FROM customers c WHERE c.region = 'US' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')");
q("LATAM customers with delivered orders", "SELECT COUNT(*) AS n FROM customers c WHERE c.region = 'LATAM' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')");
q("EU customers with >=1 pending", "SELECT COUNT(*) AS n FROM customers c WHERE c.region = 'EU' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending')");
q("customers with >=1 shipped (EXISTS)", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped')");
q("NOT EXISTS shipped", "SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped')");
q("customers with >=1 invoice (EXISTS)", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id)");
q("EU customers with >=1 cancelled", "SELECT COUNT(*) AS n FROM customers c WHERE c.region = 'EU' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')");
q("APAC customers with >=1 cancelled", "SELECT COUNT(*) AS n FROM customers c WHERE c.region = 'APAC' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')");
q("US customers with >=1 cancelled", "SELECT COUNT(*) AS n FROM customers c WHERE c.region = 'US' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')");
q("LATAM customers with >=1 cancelled", "SELECT COUNT(*) AS n FROM customers c WHERE c.region = 'LATAM' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')");
q("EU customers with >=1 shipped", "SELECT COUNT(*) AS n FROM customers c WHERE c.region = 'EU' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped')");
q("APAC customers with >=1 shipped", "SELECT COUNT(*) AS n FROM customers c WHERE c.region = 'APAC' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped')");
q("pending shipped_at NULLs", "SELECT COUNT(*) AS n FROM orders WHERE status = 'pending' AND shipped_at IS NULL");
q("cancelled shipped_at NULLs", "SELECT COUNT(*) AS n FROM orders WHERE status = 'cancelled' AND shipped_at IS NULL");

console.log("=== G. extra syntax/edge probes (round 2) ===");
err("EXISTS without parens", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS SELECT 1 FROM orders o WHERE o.customer_id = c.id");
err("EXISTS NOT ( ... )", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS NOT (SELECT 1 FROM orders o WHERE o.customer_id = c.id)");
q("EXISTS multi-column select list legal?", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT o.customer_id, o.total FROM orders o WHERE o.customer_id = c.id)");
q("pending doorbell rings even when projected value is NULL", "SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT o.shipped_at FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending')");
err("aggregate in plain WHERE", "SELECT name FROM customers WHERE COUNT(*) > 5");
err("inner alias typo in scalar", "SELECT COUNT(*) AS n FROM customers c WHERE 5 > (SELECT COUNT(*) FROM orders ord WHERE o.customer_id = c.id)");
err("outer scope escape after subquery", "SELECT COUNT(*) AS n FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) > 5 AND o.total > 100");
q("scalar 0 rows -> NULL", "SELECT (SELECT customer_id FROM orders WHERE customer_id = 999) AS v");
q("constant scalar: 5 > total orders", "SELECT COUNT(*) AS n FROM customers c WHERE 5 > (SELECT COUNT(*) FROM orders)");
q("NOT IN orders but NOT EXISTS style (uninvoiced five who)", "SELECT group_concat(name, ', ') AS s FROM customers c WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id)");

console.log("=== H. round-3 seeds ===");
q("EU customers above own-region mean (filtered)", "SELECT COUNT(*) AS n FROM customers c WHERE c.region = 'EU' AND (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) > (SELECT AVG(cnt) FROM (SELECT COUNT(*) AS cnt FROM orders o2 JOIN customers c2 ON o2.customer_id = c2.id WHERE c2.region = c.region GROUP BY c2.id))");
q("APAC customers above own-region mean (filtered)", "SELECT COUNT(*) AS n FROM customers c WHERE c.region = 'APAC' AND (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) > (SELECT AVG(cnt) FROM (SELECT COUNT(*) AS cnt FROM orders o2 JOIN customers c2 ON o2.customer_id = c2.id WHERE c2.region = c.region GROUP BY c2.id))");
q("US customers above own-region mean (filtered)", "SELECT COUNT(*) AS n FROM customers c WHERE c.region = 'US' AND (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) > (SELECT AVG(cnt) FROM (SELECT COUNT(*) AS cnt FROM orders o2 JOIN customers c2 ON o2.customer_id = c2.id WHERE c2.region = c.region GROUP BY c2.id))");
q("LATAM customers above own-region mean (filtered)", "SELECT COUNT(*) AS n FROM customers c WHERE c.region = 'LATAM' AND (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) > (SELECT AVG(cnt) FROM (SELECT COUNT(*) AS cnt FROM orders o2 JOIN customers c2 ON o2.customer_id = c2.id WHERE c2.region = c.region GROUP BY c2.id))");
q("count-form: delivered count = 0", "SELECT COUNT(*) AS n FROM customers c WHERE 0 = (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')");
q("6 > correlated count", "SELECT COUNT(*) AS n FROM customers c WHERE 6 > (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id)");
q("invoice count-form anti-join", "SELECT COUNT(*) AS n FROM customers c WHERE 0 = (SELECT COUNT(*) FROM invoices i WHERE i.customer_id = c.id)");
q("scalar count=1 tier for Liam (name-filtered)", "SELECT (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n_orders FROM customers c WHERE c.name = 'Liam O''Brien'");

db.close();
console.log(`\nprobes run: ${n} (copy ${COPY} removed on next run; live db untouched)`);
