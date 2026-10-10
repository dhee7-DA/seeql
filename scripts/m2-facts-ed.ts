// Ground-truth receipts for join-edges.ts (Module 2 "Join edge cases" drills).
// Run: bun scripts/m2-facts-ed.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2fd.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const QUERIES: Record<string, string> = {
  // --- NULL join keys never match ---
  null_key_inner: `WITH t(k) AS (VALUES (1),(NULL),(3)) SELECT COUNT(*) AS n FROM t JOIN customers c ON c.id = t.k`,
  null_null_join: `WITH a(k) AS (VALUES (NULL),(NULL),(7)) SELECT COUNT(*) AS n FROM a JOIN a a2 ON a.k = a2.k`,
  null_key_left: `WITH t(k) AS (VALUES (1),(NULL),(3)) SELECT COUNT(*) AS n FROM t LEFT JOIN customers c ON c.id = t.k`,
  null_key_left_matched: `WITH t(k) AS (VALUES (1),(NULL),(3)) SELECT COUNT(c.id) AS n FROM t LEFT JOIN customers c ON c.id = t.k`,
  // --- empty right table ---
  empty_right_inner: `SELECT COUNT(*) AS n FROM orders o JOIN (SELECT * FROM customers WHERE 1 = 0) c ON c.id = o.customer_id`,
  empty_right_left: `SELECT COUNT(*) AS n FROM orders o LEFT JOIN (SELECT * FROM customers WHERE 1 = 0) c ON c.id = o.customer_id`,
  empty_right_cross: `SELECT COUNT(*) AS n FROM (SELECT * FROM customers WHERE 1 = 0) c CROSS JOIN products p`,
  // --- case sensitivity of text keys ---
  case_eq_lower: `SELECT COUNT(*) AS n FROM customers WHERE region = 'eu'`,
  case_eq_upper: `SELECT COUNT(*) AS n FROM customers WHERE region = 'EU'`,
  case_eq_mixed: `SELECT COUNT(*) AS n FROM customers WHERE region = 'Eu'`,
  case_like_lower: `SELECT COUNT(*) AS n FROM customers WHERE region LIKE 'eu'`,
  case_nocase: `SELECT COUNT(*) AS n FROM customers WHERE region = 'eu' COLLATE NOCASE`,
  case_upper_join: `SELECT COUNT(*) AS n FROM customers a JOIN customers b ON UPPER(a.region) = UPPER(b.region) AND a.id < b.id`,
  case_self_lower_join: `SELECT COUNT(*) AS n FROM customers a JOIN customers b ON a.region = 'eu'`,
  supplier_regions: `SELECT region, COUNT(*) AS n FROM suppliers GROUP BY region ORDER BY n DESC`,
  // --- computed expression joins ---
  computed_parity: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id % 2 = o.customer_id % 2`,
  computed_times1: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id * 1 = oi.order_id`,
  coincidence_id_id: `SELECT COUNT(*) AS n FROM orders o JOIN order_items oi ON o.id = oi.id`,
  coincidence_year: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON CAST(strftime('%Y', o.created_at) AS INTEGER) = c.id`,
  upper_self_pairs: `SELECT COUNT(*) AS n FROM customers a JOIN customers b ON UPPER(a.city) = UPPER(b.city) AND a.id < b.id`,
  // --- unit/currency mismatch (cents vs units) ---
  sum_orders_total: `SELECT ROUND(SUM(total),2) AS s FROM orders`,
  sum_invoice_cents: `SELECT ROUND(SUM(amount_cents)/100.0,2) AS s FROM invoices`,
  invoices_fanout_join: `SELECT COUNT(*) AS n FROM invoices i JOIN orders o ON o.customer_id = i.customer_id`,
  money_eq_accident: `SELECT COUNT(*) AS n FROM invoices i JOIN orders o ON i.amount_cents = o.total * 100`,
  money_eq_cast: `SELECT COUNT(*) AS n FROM invoices i JOIN orders o ON i.amount_cents = CAST(o.total * 100 AS INTEGER)`,
  cents_join_units_equal: `SELECT COUNT(*) AS n FROM invoices i JOIN orders o ON i.amount_cents = o.total`,
  // --- REAL equality joins ---
  real_ties_items: `SELECT COUNT(*) AS n FROM order_items a JOIN order_items b ON a.unit_price = b.unit_price AND a.id < b.id`,
  real_ties_products: `SELECT COUNT(*) AS n FROM products a JOIN products b ON a.price = b.price AND a.id < b.id`,
  distinct_unit_prices: `SELECT COUNT(DISTINCT unit_price) AS n FROM order_items`,
  distinct_product_prices: `SELECT COUNT(DISTINCT price) AS n FROM products`,
  rounded_key_join: `SELECT COUNT(*) AS n FROM order_items a JOIN order_items b ON ROUND(a.unit_price,1) = ROUND(b.unit_price,1) AND a.id < b.id`,
  // --- duplicate keys fan out ---
  fanout_invoices_per_customer: `SELECT c.name, COUNT(i.id) AS n FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id GROUP BY c.id ORDER BY n DESC, c.name LIMIT 5`,
  fanout_invoices_join_rows: `SELECT COUNT(*) AS n FROM customers c JOIN invoices i ON i.customer_id = c.id`,
  fanout_items_per_order_top: `SELECT order_id, COUNT(*) AS n FROM order_items GROUP BY order_id ORDER BY n DESC, order_id LIMIT 3`,
  fanout_payments_per_invoice: `SELECT invoice_id, COUNT(*) AS n FROM payments GROUP BY invoice_id ORDER BY n DESC, invoice_id LIMIT 3`,
  invoices_multi_paid: `SELECT COUNT(*) AS n FROM (SELECT invoice_id FROM payments GROUP BY invoice_id HAVING COUNT(*) > 1)`,
  supplier_product_counts: `SELECT s.name, COUNT(p.id) AS n FROM suppliers s JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY n DESC, s.name`,
  // --- one row matching many partners ---
  alice_rows_after_join: `SELECT COUNT(*) AS n FROM customers c JOIN orders o ON o.customer_id = c.id WHERE c.name = 'Alice Chen'`,
  max_items_one_order: `SELECT MAX(n) AS mx FROM (SELECT COUNT(*) AS n FROM order_items GROUP BY order_id)`,
  // --- accidental cross joins / row-count signatures ---
  cross_orders_customers: `SELECT COUNT(*) AS n FROM orders, customers`,
  cross_products_suppliers: `SELECT COUNT(*) AS n FROM products, suppliers`,
  cross_orders_order_items: `SELECT COUNT(*) AS n FROM orders, order_items`,
  cross_customers_products: `SELECT COUNT(*) AS n FROM customers, products`,
  cross_invoices_payments: `SELECT COUNT(*) AS n FROM invoices, payments`,
  cross_suppliers_customers_11: `SELECT COUNT(*) AS n FROM suppliers s JOIN customers c ON 1 = 1`,
  // --- type affinity surprises ---
  affinity_expr_7_vs_7: `SELECT COUNT(*) AS n FROM (SELECT 7 AS a) x JOIN (SELECT '7' AS b) y ON x.a = y.b`,
  affinity_col_vs_text_val: `WITH t(k) AS (VALUES ('7')) SELECT COUNT(*) AS n FROM t JOIN orders o ON o.id = t.k`,
  affinity_col_vs_text_cast: `WITH t(k) AS (VALUES ('7')) SELECT COUNT(*) AS n FROM t JOIN orders o ON o.id = CAST(t.k AS INTEGER)`,
  affinity_where_text_literal: `SELECT COUNT(*) AS n FROM orders WHERE id = '7'`,
  affinity_text_col_join_int_col: `WITH t(k) AS (VALUES ('7')) SELECT COUNT(*) AS n FROM t JOIN orders o ON t.k = o.id AND o.id IS NOT NULL`,
  affinity_compare_bare: `SELECT '7' = 7 AS bare, '7' = CAST(7 AS TEXT) AS both_text`,
  affinity_zero_padded: `WITH t(k) AS (VALUES ('07')) SELECT COUNT(*) AS n FROM t JOIN orders o ON o.id = t.k`,
  // --- follow-ups ---
  sum_invoice_cents_exact: `SELECT SUM(amount_cents) AS s, COUNT(*) AS n FROM invoices`,
  sum_paid_cents_exact: `SELECT SUM(amount_cents) AS s FROM invoices WHERE status = 'paid'`,
  cust_supplier_region_join: `SELECT COUNT(*) AS n FROM customers c JOIN suppliers s ON s.region = c.region`,
  cust_supplier_region_join_lower: `SELECT COUNT(*) AS n FROM customers c JOIN suppliers s ON s.region = 'eu'`,
  open_invoice_count: `SELECT COUNT(*) AS n FROM invoices WHERE status = 'open'`,
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
