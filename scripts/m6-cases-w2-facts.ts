/// <reference types="bun-types" />
/** M6 wave-2 facts probe — RIGHT JOIN (x4) + FULL OUTER JOIN (x5) grounds. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.m6w2-facts.db");
const db = new Database("scripts/.m6w2-facts.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(JSON.stringify(rows).slice(0, 1100));
  } catch (e) {
    console.log(`## ${label}\nERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// ---- version + schema ----
q("sqlite version", "SELECT sqlite_version() AS v");
for (const t of ["customers", "orders", "invoices", "payments", "products", "suppliers", "order_items"]) {
  q(`schema ${t}`, `SELECT name FROM pragma_table_info('${t}')`);
}

// ---- RIGHT JOIN grounds ----
// R1: customers who never ordered (orders RIGHT JOIN customers)
q("R1 no-order customers", `SELECT c.name, c.region FROM orders o
  RIGHT JOIN customers c ON o.customer_id = c.id
  WHERE o.id IS NULL ORDER BY c.name`);
q("R2 no-order count", `SELECT COUNT(*) AS never_ordered FROM orders o
  RIGHT JOIN customers c ON o.customer_id = c.id WHERE o.id IS NULL`);
q("R3 no-order by region", `SELECT c.region, COUNT(*) AS ghosts FROM orders o
  RIGHT JOIN customers c ON o.customer_id = c.id
  WHERE o.id IS NULL GROUP BY c.region ORDER BY ghosts DESC`);
// R4: right-join per-customer order tally incl zeros
q("R4 order tally incl zero", `SELECT c.name, COUNT(o.id) AS n FROM orders o
  RIGHT JOIN customers c ON o.customer_id = c.id
  GROUP BY c.id HAVING n = 0 ORDER BY c.name`);
// R5: products never ordered (order_items RIGHT JOIN products)
q("R5 never-ordered products", `SELECT p.name, p.stock FROM order_items oi
  RIGHT JOIN products p ON oi.product_id = p.id
  WHERE oi.id IS NULL ORDER BY p.name`);
q("R6 never-ordered count", `SELECT COUNT(*) AS shelf_queens FROM order_items oi
  RIGHT JOIN products p ON oi.product_id = p.id WHERE oi.id IS NULL`);
// R7: suppliers with no products
q("R7 idle suppliers", `SELECT s.name FROM products p
  RIGHT JOIN suppliers s ON p.supplier_id = s.id
  WHERE p.id IS NULL ORDER BY s.name`);
// R8: customers with no invoices
q("R8 no-invoice customers", `SELECT c.name, c.region FROM invoices i
  RIGHT JOIN customers c ON i.customer_id = c.id
  WHERE i.id IS NULL ORDER BY c.name`);
// R9: right join keeps all customers even matched — total rows
q("R9 right-join row count", `SELECT COUNT(*) AS rows_all FROM orders o
  RIGHT JOIN customers c ON o.customer_id = c.id`);
// R10: matched only (inner equivalence)
q("R10 matched customers", `SELECT COUNT(DISTINCT c.id) AS matched FROM orders o
  RIGHT JOIN customers c ON o.customer_id = c.id WHERE o.id IS NOT NULL`);

// ---- FULL OUTER JOIN grounds ----
// F1: per-customer orders vs invoices (two-sided census)
q("F1 orders-vs-invoices full", `SELECT c.name,
    COALESCE(o.n, 0) AS orders_n, COALESCE(i.n, 0) AS invoices_n
  FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) o
  FULL OUTER JOIN (SELECT customer_id, COUNT(*) AS n FROM invoices GROUP BY customer_id) i
    ON o.customer_id = i.customer_id
  JOIN customers c ON c.id = COALESCE(o.customer_id, i.customer_id)
  WHERE COALESCE(o.n,0) = 0 OR COALESCE(i.n,0) = 0
  ORDER BY c.name`);
// F2: matched both sides count
q("F2 both-sides count", `SELECT COUNT(*) AS both_sides FROM
  (SELECT customer_id FROM orders GROUP BY customer_id) o
  FULL OUTER JOIN (SELECT customer_id FROM invoices GROUP BY customer_id) i
    ON o.customer_id = i.customer_id
  WHERE o.customer_id IS NOT NULL AND i.customer_id IS NOT NULL`);
// F3: left-only / right-only orphans
q("F3 orphans both sides", `SELECT
    SUM(CASE WHEN i.customer_id IS NULL THEN 1 ELSE 0 END) AS orders_only,
    SUM(CASE WHEN o.customer_id IS NULL THEN 1 ELSE 0 END) AS invoices_only
  FROM (SELECT DISTINCT customer_id FROM orders) o
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices) i
    ON o.customer_id = i.customer_id`);
// F4: products FULL OUTER order_items — never sold + dangling items
q("F4 product orphans", `SELECT
    SUM(CASE WHEN oi.product_id IS NULL THEN 1 ELSE 0 END) AS never_sold,
    SUM(CASE WHEN p.id IS NULL THEN 1 ELSE 0 END) AS dangling
  FROM (SELECT DISTINCT product_id FROM order_items) oi
  FULL OUTER JOIN products p ON oi.product_id = p.id`);
// F5: payments vs invoices per customer
q("F5 payments-vs-invoices", `SELECT
    SUM(CASE WHEN p.customer_id IS NULL THEN 1 ELSE 0 END) AS inv_only,
    SUM(CASE WHEN i.customer_id IS NULL THEN 1 ELSE 0 END) AS pay_only
  FROM (SELECT DISTINCT customer_id FROM payments) p
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices) i
    ON p.customer_id = i.customer_id`);
// F6: full outer row math
q("F6 full total rows", `SELECT COUNT(*) AS total FROM
  (SELECT DISTINCT customer_id FROM orders) o
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices) i
    ON o.customer_id = i.customer_id`);
// F7: revenue vs invoice amount per customer full-outer mismatch
q("F7 revenue-vs-billed gap", `SELECT c.name, COALESCE(o.rev,0) AS rev, COALESCE(i.billed,0) AS billed
  FROM (SELECT customer_id, ROUND(SUM(total),2) AS rev FROM orders GROUP BY customer_id) o
  FULL OUTER JOIN (SELECT customer_id, ROUND(SUM(amount_cents)/100.0,2) AS billed FROM invoices GROUP BY customer_id) i
    ON o.customer_id = i.customer_id
  JOIN customers c ON c.id = COALESCE(o.customer_id, i.customer_id)
  WHERE COALESCE(o.rev,0) = 0 OR COALESCE(i.billed,0) = 0 ORDER BY c.name LIMIT 8`);

db.close();
