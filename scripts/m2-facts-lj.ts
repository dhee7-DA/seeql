// Ground-truth probes for the LEFT JOIN drill set (m2-w2a).
// Run: bun scripts/m2-facts-lj.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2fa.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const QUERIES: Record<string, string> = {
  // --- baseline preservation ---
  lj_c_left_orders: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id`,
  lj_c_inner_orders: `SELECT COUNT(*) AS n FROM customers c JOIN orders o ON o.customer_id = c.id`,
  lj_orders_left_customers: `SELECT COUNT(*) AS n FROM orders o LEFT JOIN customers c ON c.id = o.customer_id`,
  lj_products_left_suppliers: `SELECT COUNT(*) AS n FROM products p LEFT JOIN suppliers s ON s.id = p.supplier_id`,
  lj_left_outer_keyword: `SELECT COUNT(*) AS n FROM customers c LEFT OUTER JOIN orders o ON o.customer_id = c.id`,
  // --- COUNT(*) vs COUNT(right.col) ---
  lj_c_left_invoices_counts: `SELECT COUNT(*) AS star, COUNT(i.id) AS inv, COUNT(DISTINCT c.id) AS custs FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id`,
  lj_invoices_left_payments_counts: `SELECT COUNT(*) AS star, COUNT(p.id) AS pay FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id`,
  lj_chain_c_i_p_counts: `SELECT COUNT(*) AS star, COUNT(i.id) AS inv, COUNT(p.id) AS pay FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id LEFT JOIN payments p ON p.invoice_id = i.id`,
  // --- who is NULL-filled (anti-join) ---
  lj_customers_no_invoices_names: `SELECT c.name, c.region FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE i.id IS NULL ORDER BY c.name`,
  lj_customers_no_invoices_count: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE i.id IS NULL`,
  lj_anti_pending: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL`,
  lj_anti_void: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id AND i.status = 'void' WHERE i.id IS NULL`,
  lj_suppliers_left_products: `SELECT s.name, s.region, COUNT(p.id) AS products FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY products, s.name`,
  lj_zero_bucket_invoices: `SELECT COUNT(*) AS n FROM (SELECT c.id FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id GROUP BY c.id HAVING COUNT(i.id) = 0)`,
  // --- predicate in ON vs WHERE ---
  lj_pending_in_on: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'`,
  lj_pending_in_where: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'pending'`,
  lj_unshipped_in_on: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.shipped_at IS NULL`,
  lj_unshipped_in_where: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.shipped_at IS NULL`,
  lj_cancelled_in_on: `SELECT COUNT(*) AS rows_n, COUNT(o.id) AS matched, ROUND(SUM(o.total),2) AS sum_total FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled'`,
  lj_cancelled_distinct_customers: `SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE status = 'cancelled'`,
  lj_pending_in_on_sum: `SELECT COUNT(o.id) AS matched, ROUND(SUM(o.total),2) AS sum_pending FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'`,
  lj_total_gt100_inner: `SELECT COUNT(*) AS n FROM orders WHERE total > 100`,
  lj_total_gt100_left_where: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.total > 100`,
  lj_left_where_id_not_null: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NOT NULL`,
  // --- aggregates over NULL-filled rows ---
  lj_sum_invoices_left_vs_inner: `SELECT (SELECT ROUND(SUM(i.amount_cents),2) FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id) AS left_sum, (SELECT ROUND(SUM(amount_cents),2) FROM invoices) AS bare_sum`,
  lj_avg_invoices_left: `SELECT ROUND(AVG(i.amount_cents),2) AS avg_ignores_nulls, ROUND(SUM(i.amount_cents)*1.0/COUNT(*),2) AS sum_over_count_star FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id`,
  lj_avg_invoices_bare: `SELECT ROUND(AVG(amount_cents),2) AS bare_avg, ROUND(SUM(amount_cents)*1.0/COUNT(*),2) AS bare_ratio FROM invoices`,
  // --- zero-bucket GROUP BY reports ---
  lj_group_per_customer_invoices: `SELECT MIN(cnt) AS mn, MAX(cnt) AS mx FROM (SELECT c.id, COUNT(i.id) AS cnt FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id GROUP BY c.id)`,
  lj_group_per_customer_orders: `SELECT MIN(cnt) AS mn, MAX(cnt) AS mx FROM (SELECT c.id, COUNT(o.id) AS cnt FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id)`,
  lj_region_buckets: `SELECT c.region, COUNT(*) AS rows_n, COUNT(o.id) AS with_orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.region ORDER BY rows_n DESC`,
  lj_top_invoice_customers: `SELECT c.name, COUNT(i.id) AS n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id GROUP BY c.id ORDER BY n DESC, c.name LIMIT 4`,
  // --- misc edges ---
  lj_orphan_payments: `SELECT COUNT(*) AS n FROM payments p LEFT JOIN invoices i ON i.id = p.invoice_id WHERE i.id IS NULL`,
  lj_orphan_orders_left: `SELECT COUNT(*) AS n FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE c.id IS NULL`,
  lj_double_null_fill: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON 1 = 0`,
  lj_left_join_no_on: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o`,
};

for (const [name, sql] of Object.entries(QUERIES)) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`== ${name} ==`);
    for (const r of rows.slice(0, 10)) console.log("  ", JSON.stringify(r));
    if (rows.length > 10) console.log(`   ... ${rows.length} rows`);
  } catch (e) {
    console.log(`== ${name} == ERROR: ${(e as Error).message}`);
  }
}
rmSync(COPY);
