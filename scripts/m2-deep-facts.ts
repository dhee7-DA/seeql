// Verify every number used in Module 2 deep-dive prose against the live engine.
import { execSync } from "node:child_process";

const QUERIES: Record<string, string> = {
  // ---- lesson 09: the FK walk ----
  l9_join_count: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id`,
  l9_fk_integrity: `SELECT COUNT(*) AS orphans FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE c.id IS NULL`,
  l9_null_fk: `SELECT COUNT(*) AS null_fk FROM orders WHERE customer_id IS NULL`,
  l9_customers_covered: `SELECT COUNT(DISTINCT customer_id) AS buyers FROM orders`,
  l9_reverse_rows: `SELECT COUNT(*) AS n FROM customers c JOIN orders o ON o.customer_id = c.id`,
  l9_busiest: `SELECT c.name, COUNT(*) AS orders FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY orders DESC LIMIT 3`,
  l9_ambiguous_probe: `SELECT name FROM orders o JOIN customers c ON c.id = o.customer_id LIMIT 1`,

  // ---- lesson 10: cartesian + pairing ----
  l10_cartesian_oc: `SELECT COUNT(*) AS n FROM orders, customers`,
  l10_cartesian_ps: `SELECT COUNT(*) AS n FROM products, suppliers`,
  l10_join_ps: `SELECT COUNT(*) AS n FROM products p JOIN suppliers s ON s.id = p.supplier_id`,
  l10_suppliers_used: `SELECT COUNT(DISTINCT supplier_id) AS used FROM products`,
  l10_id_collision: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON o.id = c.id`,
  l10_unmatched_sides: `SELECT
    (SELECT COUNT(*) FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE c.id IS NULL) AS unmatched_orders,
    (SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL) AS unmatched_customers`,

  // ---- lesson 11: chains ----
  l11_items_orders: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id`,
  l11_full_chain: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id`,
  l11_items_products: `SELECT COUNT(*) AS n FROM order_items oi JOIN products p ON p.id = oi.product_id`,
  l11_five_chain: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id JOIN products p ON p.id = oi.product_id`,
  l11_chain_sample: `SELECT oi.id, c.name AS customer, p.name AS product FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id JOIN products p ON p.id = oi.product_id ORDER BY oi.id LIMIT 3`,

  // ---- lesson 12: LEFT JOIN preservation ----
  l12_no_delivered: `SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' WHERE o.id IS NULL ORDER BY c.name`,
  l12_no_delivered_n: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' WHERE o.id IS NULL`,
  l12_where_collapses: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' WHERE o.status = 'delivered'`,
  l12_on_keeps: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'`,
  l12_products_never_ordered: `SELECT p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL ORDER BY p.name`,
  l12_shipped_gap: `SELECT c.name, o.id AS order_id, o.status FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NULL ORDER BY c.name LIMIT 6`,

  // ---- lesson 13: anti-joins ----
  l13_never_ordered_n: `SELECT COUNT(*) AS n FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL`,
  l13_never_in_pending: `SELECT COUNT(*) AS n FROM products p LEFT JOIN (SELECT DISTINCT oi.product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status = 'pending') pend ON pend.product_id = p.id WHERE pend.product_id IS NULL`,
  l13_not_in_null_trap: `SELECT COUNT(*) AS n FROM orders WHERE total NOT IN (SELECT shipped_at FROM orders)`,
  l13_not_in_safe: `SELECT COUNT(*) AS n FROM orders WHERE total NOT IN (SELECT shipped_at FROM orders WHERE shipped_at IS NOT NULL)`,
  l13_customers_no_pending: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL`,

  // ---- lesson 14: self-join ----
  l14_regions: `SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY n DESC`,
  l14_pairs_39: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id`,
  l14_pairs_by_region: `SELECT c1.region, COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id GROUP BY c1.region ORDER BY n DESC`,
  l14_no_guard: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region`,
  l14_neq_guard: `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id <> c2.id`,
  l14_sample_pairs: `SELECT c1.name AS pair_a, c2.name AS pair_b, c1.region FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id ORDER BY c1.region, pair_a LIMIT 4`,
  l14_product_pairs: `SELECT COUNT(*) AS n FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id`,

  // ---- lesson 15: aggregates across joins ----
  l15_top_spend: `SELECT c.name, ROUND(SUM(o.total), 2) AS spend, COUNT(o.id) AS orders FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY spend DESC LIMIT 3`,
  l15_reconcile: `SELECT ROUND(SUM(spend),2) AS total FROM (SELECT SUM(o.total) AS spend FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id)`,
  l15_count_trap: `SELECT p.name, COUNT(*) AS rows_seen, COUNT(oi.id) AS lines FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id GROUP BY p.id HAVING COUNT(oi.id) = 0`,
  l15_ghost_row: `SELECT p.name, COUNT(*) AS count_star, COUNT(oi.id) AS count_col FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id GROUP BY p.id HAVING COUNT(oi.id) = 0 LIMIT 1`,
  l15_grain: `SELECT COUNT(*) AS customers_n FROM (SELECT c.id FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id)`,

  // ---- lesson 16: fan-out ----
  l16_honest_sum: `SELECT ROUND(SUM(total), 2) AS s FROM orders`,
  l16_inflated_sum: `SELECT ROUND(SUM(o.total), 2) AS s FROM orders o JOIN order_items oi ON oi.order_id = o.id`,
  l16_factor: `SELECT ROUND(SUM(o.total) / (SELECT SUM(total) FROM orders), 4) AS f FROM orders o JOIN order_items oi ON oi.order_id = o.id`,
  l16_line_revenue: `SELECT ROUND(SUM(quantity * unit_price), 2) AS s FROM order_items`,
  l16_agg_first: `SELECT COUNT(*) AS n, ROUND(SUM(items_rev),2) AS s FROM (SELECT o.id, SUM(oi.quantity * oi.unit_price) AS items_rev FROM orders o JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id)`,
  l16_items_per_order: `SELECT MIN(n) AS min_lines, MAX(n) AS max_lines, ROUND(AVG(n), 2) AS avg_lines FROM (SELECT COUNT(*) AS n FROM order_items GROUP BY order_id)`,
  l16_distinct_totals: `SELECT COUNT(*) AS dup_totals FROM (SELECT total FROM orders GROUP BY total HAVING COUNT(*) > 1)`,
  l16_order1: `SELECT o.id, o.total, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS items_revenue FROM orders o JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id ORDER BY o.id LIMIT 3`,
};

for (const [name, sql] of Object.entries(QUERIES)) {
  const out = execSync(
    `curl -s -m 20 -X POST http://localhost:3000/api/query -H "Content-Type: application/json" -d '${JSON.stringify({ sql }).replace(/'/g, "'\\''")}'`,
    { encoding: "utf8" },
  );
  try {
    const j = JSON.parse(out);
    console.log(`== ${name} ==`);
    if (j.ok) {
      console.log("  cols:", JSON.stringify(j.columns));
      for (const r of j.rows) console.log("  ", JSON.stringify(r));
    } else {
      console.log("  ERROR:", j.error);
    }
  } catch {
    console.log(`== ${name} == RAW:`, out.slice(0, 200));
  }
}
