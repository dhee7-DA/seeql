import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";
const COPY = "scripts/.m2f3.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const Q: Record<string, string> = {
  lj_customers_invoices_rows: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id`,
  lj_count_star_vs_col: `SELECT COUNT(*) AS rows_n, COUNT(i.id) AS matched FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id`,
  lj_pending_on_rows: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'`,
  lj_pending_on_null: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL`,
  lj_shipped_null_fill: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.shipped_at IS NULL`,
  lj_sum_null_fill: `SELECT ROUND(SUM(o.total),2) AS s FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled'`,
  cancelled_count: `SELECT COUNT(*) AS n FROM orders WHERE status = 'cancelled'`,
  lj_left_products_never_sold: `SELECT p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL`,
  inv_per_customer_top: `SELECT c.name, COUNT(i.id) AS n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id GROUP BY c.id ORDER BY n DESC, c.name LIMIT 4`,
};
for (const [name, sql] of Object.entries(Q)) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`== ${name} ==  ` + rows.map(r=>JSON.stringify(r)).join(" "));
  } catch (e) { console.log(`== ${name} == ERROR: ${(e as Error).message}`); }
}
rmSync(COPY);
