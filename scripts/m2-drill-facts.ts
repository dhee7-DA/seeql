// Ground-truth receipts for Module 2 JOIN drill-bank MCQs.
// Run: bun scripts/m2-drill-facts.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2facts.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const QUERIES: Record<string, string> = {
  // --- inner join basics ---
  ij_orders_customers: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id`,
  ij_distinct_customers: `SELECT COUNT(DISTINCT o.customer_id) AS n FROM orders o JOIN customers c ON c.id = o.customer_id`,
  ij_orphan_orders: `SELECT COUNT(*) AS n FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE c.id IS NULL`,
  ij_cross_orders_customers: `SELECT COUNT(*) AS n FROM orders, customers`,
  ij_cross_products_suppliers: `SELECT COUNT(*) AS n FROM products, suppliers`,
  // --- who has no orders (anti-join) ---
  aj_customers_no_orders: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`,
  aj_who: `SELECT c.name, c.region FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL ORDER BY c.name`,
  aj_orders_per_customer: `SELECT c.name, COUNT(o.id) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY n DESC, c.name LIMIT 6`,
  aj_zero_group: `SELECT COUNT(*) AS n FROM (SELECT c.id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(o.id) = 0)`,
  aj_suppliers_no_products: `SELECT COUNT(*) AS n FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id WHERE p.id IS NULL`,
  aj_which_suppliers: `SELECT s.name, s.region FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id WHERE p.id IS NULL ORDER BY s.name`,
  // --- left join preservation ---
  lj_left_customers_orders: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id`,
  lj_inner_equiv: `SELECT COUNT(*) AS n FROM customers c JOIN orders o ON o.customer_id = c.id`,
  lj_null_fill_sample: `SELECT c.name, o.id, o.total FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL ORDER BY c.name LIMIT 3`,
  lj_active_split: `SELECT c.active, COUNT(*) AS n, COUNT(o.id) AS with_orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.active`,
  lj_left_products_suppliers: `SELECT COUNT(*) AS n FROM products p LEFT JOIN suppliers s ON s.id = p.supplier_id`,
  lj_region_no_orders: `SELECT c.region, COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL GROUP BY c.region ORDER BY n DESC`,
  // --- multi-hop chains ---
  mj_items_orders_customers: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id`,
  mj_items_products: `SELECT COUNT(*) AS n FROM order_items oi JOIN products p ON p.id = oi.product_id`,
  mj_items_orders_products: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id`,
  mj_distinct_products_sold: `SELECT COUNT(DISTINCT oi.product_id) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id`,
  mj_all_products_sold: `SELECT COUNT(*) AS sold_products FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id -- count products with at least one line`,
  mj_products_never_sold: `SELECT COUNT(*) AS n FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL`,
  mj_never_sold_names: `SELECT p.name, p.category FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL ORDER BY p.name`,
  mj_revenue_by_region: `SELECT c.region, ROUND(SUM(oi.quantity * oi.unit_price),2) AS rev, COUNT(*) AS lines FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY rev DESC`,
  mj_top_product_units: `SELECT p.name, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id ORDER BY units DESC LIMIT 3`,
  // --- fan-out / join+aggregate ---
  fa_sum_total_raw: `SELECT ROUND(SUM(total),2) AS s FROM orders`,
  fa_sum_total_after_items_join: `SELECT ROUND(SUM(o.total),2) AS s, COUNT(*) AS n FROM orders o JOIN order_items oi ON oi.order_id = o.id`,
  fa_inflation_ratio_rows: `SELECT (SELECT COUNT(*) FROM order_items) * 1.0 / (SELECT COUNT(*) FROM orders) AS ratio`,
  fa_count_star_vs_distinct: `SELECT COUNT(*) AS rows_n, COUNT(DISTINCT o.id) AS orders_n FROM orders o JOIN order_items oi ON oi.order_id = o.id`,
  fa_customer_top_spend: `SELECT c.name, COUNT(*) AS n, ROUND(SUM(o.total),2) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY spend DESC LIMIT 3`,
  fa_items_per_order_dist: `SELECT MIN(n) AS mn, MAX(n) AS mx, ROUND(AVG(n),2) AS avg FROM (SELECT order_id, COUNT(*) AS n FROM order_items GROUP BY order_id)`,
  fa_orders_one_item: `SELECT COUNT(*) AS n FROM (SELECT order_id FROM order_items GROUP BY order_id HAVING COUNT(*) = 1)`,
  fa_region_counts_join: `SELECT c.region, COUNT(*) AS order_rows, COUNT(DISTINCT c.id) AS customers FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY order_rows DESC`,
  fa_avg_total_per_region: `SELECT c.region, ROUND(AVG(o.total),2) AS avg_total FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY avg_total DESC`,
  // --- self-join ---
  sj_same_region_pairs: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id`,
  sj_no_guard: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region`,
  sj_with_self_pairs: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id <= c2.id`,
  sj_region_sizes: `SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY n DESC`,
  sj_pair_math: `SELECT region, COUNT(*)*(COUNT(*)-1)/2 AS pairs FROM customers GROUP BY region ORDER BY pairs DESC`,
  sj_city_mates: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.city = c2.city AND c1.id < c2.id`,
  // --- ON vs WHERE / misc ---
  ow_inner_on_vs_where: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'pending'`,
  ow_pending: `SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'`,
  ow_left_where_vs_on: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'`,
  ow_left_where_filter: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'pending'`,
  ow_left_pending_nulls: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL`,
  ow_delivered_join: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'delivered'`,
  // --- edges ---
  ed_products_without_supplier_match: `SELECT COUNT(*) AS n FROM products p JOIN suppliers s ON s.id = p.supplier_id`,
  ed_distinct_status: `SELECT DISTINCT status FROM orders ORDER BY status`,
  ed_region_values: `SELECT DISTINCT region FROM customers ORDER BY region`,
  ed_supplier_regions: `SELECT DISTINCT region FROM suppliers ORDER BY region`,
  ed_natural_products_suppliers: `SELECT COUNT(*) AS n FROM products NATURAL JOIN suppliers`,
  ed_using_fail_tables: `SELECT COUNT(*) AS n FROM orders JOIN order_items ON order_items.order_id = orders.id`,
  ed_dup_join_key_products: `SELECT COUNT(*) AS n FROM (SELECT supplier_id FROM products GROUP BY supplier_id HAVING COUNT(*) > 1)`,
  ed_items_unit_price_var: `SELECT COUNT(*) AS n FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.unit_price <> p.price`,
  ed_items_equal_price: `SELECT COUNT(*) AS n FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.unit_price = p.price`,
  // --- invoices as second FK source (judgment set) ---
  inv_join_customers: `SELECT COUNT(*) AS n FROM invoices i JOIN customers c ON c.id = i.customer_id`,
  inv_status_breakdown: `SELECT status, COUNT(*) AS n FROM invoices GROUP BY status ORDER BY n DESC`,
  inv_customers_no_invoices: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE i.id IS NULL`,
  inv_paid_multi: `SELECT COUNT(*) AS n FROM (SELECT invoice_id FROM payments GROUP BY invoice_id HAVING COUNT(*) > 1)`,
};

for (const [name, sql] of Object.entries(QUERIES)) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`== ${name} ==`);
    for (const r of rows.slice(0, 8)) console.log("  ", JSON.stringify(r));
    if (rows.length > 8) console.log(`   ... ${rows.length} rows`);
  } catch (e) {
    console.log(`== ${name} == ERROR: ${(e as Error).message}`);
  }
}
rmSync(COPY);
