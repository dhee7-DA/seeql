import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const QUERIES: Array<[string, string]> = [
  ["berlin_big_lines", `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id WHERE c.city = 'Berlin' AND o.total > 500`],
  ["berlin_big_orders", `SELECT COUNT(*) AS n FROM (SELECT DISTINCT o.id FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.city = 'Berlin' AND o.total > 500)`],
  ["active_nocancel", `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled' WHERE o.id IS NULL AND c.active = 1`],
  ["line_rev_top3", `SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price),2) AS revenue FROM customers c JOIN orders o ON o.customer_id=c.id JOIN order_items oi ON oi.order_id=o.id GROUP BY c.id ORDER BY revenue DESC LIMIT 3`],
  ["sum_total_order_items_err", `SELECT (SELECT SUM(total) FROM order_items) AS x`],
  ["selfjoin_left_ghost", `SELECT COUNT(*) AS n FROM customers a LEFT JOIN customers b ON a.region = b.region AND a.id < b.id`],
  ["selfjoin_neq", `SELECT COUNT(*) AS n FROM customers a JOIN customers b ON a.region = b.region AND a.id <> b.id`],
  ["selfjoin_eq", `SELECT COUNT(*) AS n FROM customers a JOIN customers b ON a.region = b.region AND a.id = b.id`],
  ["ratio", `SELECT ROUND(103244.55 / 34833.28, 2) AS ratio`],
  ["l10_lines_gt500_check", `SELECT COUNT(*) AS n FROM orders WHERE total > 500`],
  ["wearable_check", `SELECT COUNT(*) AS n FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.category = 'Wearables'`],
  ["l13_pending_products_count", `SELECT COUNT(*) AS n FROM products p LEFT JOIN (SELECT DISTINCT oi.product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status = 'pending') pend ON pend.product_id = p.id WHERE pend.product_id IS NULL`],
  ["l9_suppliers_head", `SELECT p.name, s.name AS supplier FROM products p JOIN suppliers s ON s.id = p.supplier_id ORDER BY p.name LIMIT 3`],
  ["no_on_join_where", `SELECT COUNT(*) AS n FROM orders o JOIN customers c WHERE c.id = o.customer_id`],
  ["count_distinct_oid", `SELECT COUNT(DISTINCT o.id) AS n FROM orders o JOIN order_items oi ON oi.order_id = o.id`],
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
      console.log(`${label}: ${preview.length > 400 ? preview.slice(0, 400) + "…" : preview}`);
    } catch (err) {
      console.log(`${label}: ERROR ${(err as Error).message.split("\n")[0]}`);
    }
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
