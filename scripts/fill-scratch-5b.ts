// Task 5-b scratch: verify facts used in m02 fill "why" texts against the fresh seed.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const QUERIES: Array<[string, string]> = [
  ["counts", `SELECT (SELECT COUNT(*) FROM customers) AS customers, (SELECT COUNT(*) FROM orders) AS orders, (SELECT COUNT(*) FROM order_items) AS items, (SELECT COUNT(*) FROM products) AS products, (SELECT COUNT(*) FROM suppliers) AS suppliers`],
  ["status_counts", `SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY status`],
  ["honest_revenue", `SELECT ROUND(SUM(total), 2) AS revenue FROM orders`],
  ["inflated_revenue", `SELECT ROUND(SUM(o.total), 2) AS inflated FROM orders o JOIN order_items oi ON oi.order_id = o.id`],
  ["region_pairs", `SELECT COUNT(*) AS pairs FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id`],
  ["region_sizes", `SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY region`],
  ["no_shipped", `SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NULL ORDER BY c.name`],
  ["no_delivered", `SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' WHERE o.id IS NULL ORDER BY c.name`],
  ["no_cancelled", `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled' WHERE o.id IS NULL`],
  ["no_pending", `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL`],
  ["berlin_delivered", `SELECT o.id FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.city = 'Berlin' AND o.status = 'delivered' ORDER BY o.id`],
  ["inactive_orders", `SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.active = 0 ORDER BY o.id`],
  ["top_orderer", `SELECT c.name, COUNT(o.id) AS orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY orders DESC, c.name LIMIT 5`],
  ["wearables_lines", `SELECT COUNT(*) AS n FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.category = 'Wearables'`],
  ["audio_regions", `SELECT DISTINCT s.region FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE p.category = 'Audio' ORDER BY s.region`],
  ["eu_products", `SELECT p.name FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.region = 'EU' ORDER BY p.name`],
  ["ambiguity_check", `SELECT name FROM orders o JOIN customers c ON c.id = o.customer_id LIMIT 1`],
  ["same_city_pairs", `SELECT COUNT(*) AS n FROM customers a JOIN customers b ON a.city = b.city AND a.id < b.id`],
  ["supplier_twins", `SELECT COUNT(*) AS n FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.id < s2.id`],
  ["same_month_doubles", `SELECT COUNT(*) AS n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id AND SUBSTR(o1.created_at,1,7) = SUBSTR(o2.created_at,1,7)`],
  ["category_siblings", `SELECT COUNT(*) AS n FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id`],
  ["pending_orders", `SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'`],
  ["distinct_total_check", `SELECT COUNT(DISTINCT total) AS n FROM orders`],
  ["first_join_rows", `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id`],
  ["cartesian", `SELECT COUNT(*) AS n FROM orders o JOIN customers c`],
  ["items_join_orders", `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id`],
  ["no_on_join", `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2`],
  ["berlin_names", `SELECT name, region FROM customers WHERE city = 'Berlin'`],
  ["order_88", `SELECT oi.id, p.name, oi.quantity, oi.unit_price FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = 88 ORDER BY oi.id`],
  ["l15_top_spend", `SELECT c.name, ROUND(SUM(o.total),2) AS spend FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY spend DESC LIMIT 3`],
  ["l15_orders_gt10", `SELECT c.name, COUNT(o.id) AS n FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(o.id) > 10 ORDER BY n DESC`],
  ["l15_avg_gt400", `SELECT c.name, ROUND(AVG(o.total),2) AS a FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id HAVING AVG(o.total) > 400 ORDER BY a DESC`],
  ["l36_top5_count", `SELECT c.name, COUNT(o.id) AS order_count FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY order_count DESC, c.name LIMIT 5`],
  ["l36_no_pend_products", `SELECT p.name FROM products p LEFT JOIN (SELECT DISTINCT oi.product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status = 'pending') pend ON pend.product_id = p.id WHERE pend.product_id IS NULL ORDER BY p.name`],
  ["l36_region_pairs_val", `SELECT COUNT(*) AS region_pairs FROM customers a JOIN customers b ON a.region = b.region AND a.id < b.id`],
  ["l36_clean_customers", `SELECT COUNT(*) AS clean_customers FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status <> 'delivered' WHERE o.id IS NULL`],
  ["big_orders_gt500", `SELECT COUNT(*) AS n FROM orders WHERE total > 500`],
  ["big_orders_gt800", `SELECT o.id, o.total FROM orders o WHERE o.total > 800 ORDER BY o.total DESC`],
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
