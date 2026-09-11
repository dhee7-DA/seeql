// Ground-truth probes for the Multi-table joins drill set (m2-w2a).
// Run: bun scripts/m2-facts-mj.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2fa.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const QUERIES: Record<string, string> = {
  // --- chains and grain ---
  mj_chain_ioc: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id`,
  mj_chain_hop_swap: `SELECT COUNT(*) AS n FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id`,
  mj_chain_4table: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id JOIN products p ON p.id = oi.product_id`,
  mj_chain_5table: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id`,
  mj_left_inside_chain: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id LEFT JOIN order_items oi ON oi.order_id = o.id`,
  mj_left_tail_never_fires: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id LEFT JOIN products p ON p.id = oi.product_id WHERE p.id IS NULL`,
  // --- junction ---
  mj_distinct_order_product_pairs: `SELECT COUNT(*) AS n FROM (SELECT DISTINCT order_id, product_id FROM order_items)`,
  mj_orders_with_dup_product: `SELECT COUNT(*) AS n FROM (SELECT order_id, product_id FROM order_items GROUP BY order_id, product_id HAVING COUNT(*) > 1)`,
  mj_products_per_order: `SELECT MIN(np) AS mn, MAX(np) AS mx FROM (SELECT order_id, COUNT(DISTINCT product_id) AS np FROM order_items GROUP BY order_id)`,
  // --- wrong-grain join (invoices hang off customers, not orders) ---
  mj_wrong_grain_fanout: `SELECT COUNT(*) AS rows_n, ROUND(SUM(o.total),2) AS inflated_sum FROM orders o JOIN customers c ON c.id = o.customer_id LEFT JOIN invoices i ON i.customer_id = c.id`,
  // --- one table joined twice (self-pairs) ---
  mj_orders_self_pairs: `SELECT COUNT(*) AS n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id`,
  mj_orders_self_pairs_per_cust_max: `SELECT MAX(pairs) AS mx FROM (SELECT o1.customer_id, COUNT(*) AS pairs FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id GROUP BY o1.customer_id)`,
  // --- payments → invoices → customers chain ---
  mj_pay_inv_cust: `SELECT COUNT(*) AS n FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON c.id = i.customer_id`,
  mj_pay_by_region: `SELECT c.region, COUNT(*) AS pays, ROUND(SUM(p.amount_cents)/100.0, 2) AS euros FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON c.id = i.customer_id GROUP BY c.region ORDER BY euros DESC`,
  mj_multi_pay_invoices: `SELECT COUNT(*) AS n FROM (SELECT invoice_id FROM payments GROUP BY invoice_id HAVING COUNT(*) > 1)`,
  // --- reading 3-table queries ---
  mj_order1_items: `SELECT p.name, oi.quantity, oi.unit_price FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE o.id = 1 ORDER BY oi.id`,
  mj_region_line_counts: `SELECT c.region, COUNT(*) AS lines FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY lines DESC`,
  mj_region_revenue: `SELECT c.region, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS rev, COUNT(*) AS lines FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY rev DESC`,
  // --- aggregates through the chain ---
  mj_top_products_full: `SELECT p.name, COUNT(DISTINCT oi.order_id) AS orders_n, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id ORDER BY units DESC LIMIT 3`,
  mj_units_by_supplier_region: `SELECT s.region, COUNT(*) AS lines, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.region ORDER BY units DESC`,
  mj_distinct_products_sold: `SELECT COUNT(DISTINCT oi.product_id) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id`,
  mj_products_sold_latam: `SELECT COUNT(DISTINCT oi.product_id) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id WHERE c.region = 'LATAM'`,
  mj_avg_order_by_region: `SELECT c.region, ROUND(AVG(o.total), 2) AS avg_total FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY avg_total DESC`,
  mj_eu_pending: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU' AND o.status = 'pending'`,
  mj_invoices_join_customers: `SELECT COUNT(*) AS n FROM invoices i JOIN customers c ON c.id = i.customer_id`,
  // --- chained aliases reading check ---
  mj_distinct_cities_3table: `SELECT COUNT(DISTINCT c.city) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id`,
  // --- round 2: writing-support facts ---
  mj_pending_lines: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status = 'pending'`,
  mj_alice_lines: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Alice Chen'`,
  mj_order1_units: `SELECT SUM(oi.quantity) AS units, COUNT(DISTINCT oi.product_id) AS distinct_products FROM order_items oi WHERE oi.order_id = 1`,
  mj_line_revenue_total: `SELECT ROUND(SUM(oi.quantity * oi.unit_price), 2) AS rev FROM order_items oi`,
  mj_self_pairs_no_guard: `SELECT SUM(n * n) AS no_guard FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`,
  mj_self_pairs_le_guard: `SELECT (SUM(n * n) + 103) / 2 AS le_guard FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`,
  mj_desk_mat_lines: `SELECT COUNT(*) AS lines FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.name = 'Desk Mat Extended'`,
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
