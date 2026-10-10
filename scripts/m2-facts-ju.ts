// Ground-truth receipts for join-judgment.ts (Module 2 "Choosing joins" drills).
// Run: bun scripts/m2-facts-ju.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2ff.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const QUERIES: Record<string, string> = {
  // --- join vs IN-subquery for pure filters ---
  pending_distinct_cust: `SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE status = 'pending'`,
  pending_in_subq: `SELECT COUNT(*) AS n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'pending')`,
  pending_join_rows: `SELECT COUNT(*) AS n FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status = 'pending'`,
  pending_join_dupes: `SELECT c.name, COUNT(*) AS n FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status = 'pending' GROUP BY c.id ORDER BY n DESC, c.name LIMIT 3`,
  delivered_distinct_cust: `SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE status = 'delivered'`,
  cancelled_distinct_cust: `SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE status = 'cancelled'`,
  cancelled_in_subq: `SELECT COUNT(*) AS n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'cancelled')`,
  cancelled_join_rows: `SELECT COUNT(*) AS n FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status = 'cancelled'`,
  eu_orders_in_subq: `SELECT COUNT(*) AS n FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU')`,
  // --- anchor table / report grain ---
  cust_left_invoices: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id`,
  cust_left_invoices_matched: `SELECT COUNT(i.id) AS n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id`,
  cust_no_invoices_names: `SELECT c.name, c.region FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE i.id IS NULL ORDER BY c.name`,
  invoices_per_cust_top: `SELECT c.name, COUNT(i.id) AS n FROM customers c JOIN invoices i ON i.customer_id = c.id GROUP BY c.id ORDER BY n DESC, c.name LIMIT 4`,
  supp_left_products: `SELECT COUNT(*) AS n FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id`,
  supp_no_products: `SELECT COUNT(*) AS n FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id WHERE p.id IS NULL`,
  cust_left_orders: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id`,
  cust_no_orders: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`,
  // --- debugging wrong numbers: count at each hop ---
  hop_items: `SELECT COUNT(*) AS n FROM order_items`,
  hop_items_orders: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id`,
  hop_items_orders_cust: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id`,
  sum_total_flat: `SELECT ROUND(SUM(total),2) AS s FROM orders`,
  sum_total_after_items: `SELECT ROUND(SUM(o.total),2) AS s FROM orders o JOIN order_items oi ON oi.order_id = o.id`,
  count_star_vs_distinct: `SELECT COUNT(*) AS all_rows, COUNT(DISTINCT o.id) AS real_orders FROM orders o JOIN order_items oi ON oi.order_id = o.id`,
  alice_orders: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Alice Chen'`,
  // --- match-rule vs filter predicates (LEFT JOIN) ---
  left_pending_in_on: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'`,
  left_pending_in_on_nulls: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL`,
  left_pending_in_where: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'pending'`,
  // --- deliberate CROSS JOIN ---
  coverage_matrix: `SELECT COUNT(*) AS n FROM products p CROSS JOIN suppliers s`,
  // --- LEFT vs INNER coincide on this db? ---
  orders_left_vs_inner_items: `SELECT (SELECT COUNT(*) FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id) AS left_n, (SELECT COUNT(*) FROM orders o JOIN order_items oi ON oi.order_id = o.id) AS inner_n`,
  // --- money domain judgment ---
  invoice_status_split: `SELECT status, COUNT(*) AS n FROM invoices GROUP BY status ORDER BY n DESC`,
  unpaid_amount_cents: `SELECT SUM(amount_cents) AS s FROM invoices WHERE status = 'open'`,
  open_void_vs_paid: `SELECT ROUND(SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END)/100.0,2) AS paid_units FROM invoices`,
  void_invoice: `SELECT number, amount_cents FROM invoices WHERE status = 'void'`,
  // --- never-sold / anti-join judgment ---
  products_never_sold: `SELECT COUNT(*) AS n FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL`,
  unshipped_orders: `SELECT COUNT(*) AS n FROM orders WHERE shipped_at IS NULL`,
  region_cust_vs_orders: `SELECT c.region, COUNT(DISTINCT c.id) AS cust, COUNT(*) AS order_rows FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY order_rows DESC`,
  active_split: `SELECT active, COUNT(*) AS n FROM customers GROUP BY active`,
  active_cust_orders: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.active = 1`,
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
