import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const QUERIES: Array<[string, string]> = [
  ["ambig_products_suppliers", `SELECT name FROM products p JOIN suppliers s ON s.id = p.supplier_id LIMIT 1`],
  ["ambig_selfjoin", `SELECT name FROM customers c1 JOIN customers c2 ON c1.id < c2.id LIMIT 1`],
  ["cartesian_products_suppliers", `SELECT COUNT(*) AS n FROM products p JOIN suppliers s`],
  ["orders_no_name_col", `SELECT COUNT(*) AS n FROM orders WHERE name IS NULL`],
  ["l36_category_revenue", `SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category ORDER BY revenue DESC`],
  ["l16_first10_rebuild", `SELECT o.id, o.total, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS items_revenue FROM orders o JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id ORDER BY o.id LIMIT 3`],
  ["l15_region_revenue", `SELECT c.region, COUNT(*) AS orders, ROUND(SUM(o.total), 2) AS revenue FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY revenue DESC`],
  ["l10_line_total_top", `SELECT oi.id, p.name, ROUND(oi.quantity * oi.unit_price, 2) AS line_total FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.quantity >= 3 ORDER BY line_total DESC, oi.id LIMIT 3`],
  ["l11_full_chain_head", `SELECT oi.id, c.name AS customer, p.name AS product FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id JOIN products p ON p.id = oi.product_id ORDER BY oi.id LIMIT 3`],
  ["l12_shipped_rows", `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'`],
  ["l13_pending_products_list", `SELECT p.name FROM products p LEFT JOIN (SELECT DISTINCT oi.product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status = 'pending') pend ON pend.product_id = p.id WHERE pend.product_id IS NULL ORDER BY p.name`],
  ["l14_us_pair", `SELECT c1.name AS pair_a, c2.name AS pair_b FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id WHERE c1.region = 'US'`],
  ["l9_order_alias_head", `SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY o.id LIMIT 3`],
  ["l9_supplier_join_head", `SELECT p.name, s.name AS supplier, s.region FROM products p JOIN suppliers s ON s.id = p.supplier_id ORDER BY p.name LIMIT 3`],
  ["l12_gap_left", `SELECT c.name, o.id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.total > 800 ORDER BY c.name LIMIT 5`],
  ["l16_distinct_totals", `SELECT COUNT(*) AS rows_joined, COUNT(DISTINCT o.id) AS orders_distinct, COUNT(DISTINCT o.total) AS totals_distinct FROM orders o JOIN order_items oi ON oi.order_id = o.id`],
  ["dup_totals", `SELECT total, COUNT(*) AS n FROM orders GROUP BY total HAVING COUNT(*) > 1`],
];

async function main() {
  await resetDatabase();
  for (const [label, sql] of QUERIES) {
    try {
      const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
      const preview = JSON.stringify(rows.map((r) => {
        const o: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(r)) o[k] = typeof v === "bigint" ? Number(v) : v;
        return o;
      }));
      console.log(`${label}: ${preview.length > 500 ? preview.slice(0, 500) + "…" : preview}`);
    } catch (err) {
      console.log(`${label}: ERROR ${(err as Error).message.split("\n")[0]}`);
    }
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
