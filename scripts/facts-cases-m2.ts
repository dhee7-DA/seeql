// Ground-truth probe for Module 2 case files (joins). Every figure cited in
// an M2 case brief must come from this output (facts-cases-m2-out.txt).
// Run: bunx tsx scripts/facts-cases-m2.ts | tee scripts/facts-cases-m2-out.txt
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const q = async (sql: string) =>
  (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;

async function main() {
  const counts = await resetDatabase();
  console.log("seeded:", JSON.stringify(counts));

  // A. revenue: honest vs fan-out inflated
  console.log("\n-- A. revenue --");
  console.log("plain_sum_total:", await q(`SELECT ROUND(SUM(total),2) AS v FROM orders`));
  console.log(
    "fanout_sum:",
    await q(
      `SELECT ROUND(SUM(o.total),2) AS v, COUNT(*) AS rows FROM orders o JOIN order_items oi ON oi.order_id = o.id`,
    ),
  );
  console.log(
    "delivered_sum:",
    await q(`SELECT ROUND(SUM(total),2) AS v, COUNT(*) AS n FROM orders WHERE status='delivered'`),
  );
  console.log(
    "items_revenue_honest:",
    await q(`SELECT ROUND(SUM(quantity*unit_price),2) AS v FROM order_items`),
  );
  console.log(
    "items_revenue_fanout_via_orders:",
    await q(`SELECT ROUND(SUM(oi.quantity*oi.unit_price),2) AS v FROM orders o JOIN order_items oi ON oi.order_id=o.id`),
  );

  // B. per-status census
  console.log("\n-- B. status --");
  console.log(
    await q(`SELECT status, COUNT(*) AS n, ROUND(SUM(total),2) AS revenue FROM orders GROUP BY status ORDER BY status`),
  );

  // C. anti-join universes
  console.log("\n-- C. anti-join --");
  console.log("customers_no_orders:", await q(
    `SELECT c.id, c.name, c.city, c.region, c.active FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL ORDER BY c.id`),
  );
  console.log("customers_no_delivered:", await q(
    `SELECT c.id, c.name FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='delivered' WHERE o.id IS NULL ORDER BY c.id`),
  );
  console.log("products_never_sold:", await q(
    `SELECT p.id, p.name, p.category, p.price, p.stock, p.supplier_id FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL ORDER BY p.id`),
  );
  console.log("suppliers_never_sold_products:", await q(
    `SELECT s.id, s.name FROM suppliers s JOIN products p ON p.supplier_id = s.id
     LEFT JOIN order_items oi ON oi.product_id = p.id
     GROUP BY s.id HAVING COUNT(oi.id)=0`),
  );
  console.log("orders_no_items:", await q(
    `SELECT o.id FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id WHERE oi.id IS NULL`),
  );
  console.log("customers_no_2025_orders:", await q(
    `SELECT c.id, c.name FROM customers c
     LEFT JOIN orders o ON o.customer_id=c.id AND o.created_at >= '2025-01-01'
     WHERE o.id IS NULL ORDER BY c.id`),
  );

  // D. left-join row arithmetic
  console.log("\n-- D. left join arithmetic --");
  console.log("cust_left_orders_count_star:", await q(
    `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id`),
  );
  console.log("cust_left_orders_count_oid:", await q(
    `SELECT COUNT(o.id) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id`),
  );
  console.log("cust_left_orders_count_distinct_cust:", await q(
    `SELECT COUNT(DISTINCT c.id) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id`),
  );
  console.log("distinct_ordering_customers:", await q(
    `SELECT COUNT(DISTINCT customer_id) AS n FROM orders`),
  );
  console.log("distinct_products_sold:", await q(
    `SELECT COUNT(DISTINCT product_id) AS n FROM order_items`),
  );

  // E. aggregates across joins
  console.log("\n-- E. aggregates across joins --");
  console.log("spend_per_customer_top6:", await q(
    `SELECT c.name, COUNT(o.id) AS orders, ROUND(SUM(o.total),2) AS spend
     FROM customers c JOIN orders o ON o.customer_id = c.id
     GROUP BY c.id ORDER BY spend DESC LIMIT 6`),
  );
  console.log("spend_per_customer_bottom4:", await q(
    `SELECT c.name, COUNT(o.id) AS orders, ROUND(SUM(o.total),2) AS spend
     FROM customers c JOIN orders o ON o.customer_id = c.id
     GROUP BY c.id ORDER BY spend ASC LIMIT 4`),
  );
  console.log("region_revenue_delivered:", await q(
    `SELECT c.region, ROUND(SUM(o.total),2) AS v FROM customers c
     JOIN orders o ON o.customer_id = c.id
     WHERE o.status='delivered' GROUP BY c.region ORDER BY v DESC`),
  );
  console.log("region_orders_all:", await q(
    `SELECT c.region, COUNT(*) AS n FROM customers c
     JOIN orders o ON o.customer_id = c.id GROUP BY c.region ORDER BY n DESC`),
  );
  console.log("category_revenue_3hop:", await q(
    `SELECT p.category, ROUND(SUM(oi.quantity*oi.unit_price),2) AS v, SUM(oi.quantity) AS units
     FROM order_items oi JOIN products p ON p.id = oi.product_id
     GROUP BY p.category ORDER BY v DESC`),
  );
  console.log("category_revenue_delivered_only:", await q(
    `SELECT p.category, ROUND(SUM(oi.quantity*oi.unit_price),2) AS v
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     JOIN orders o ON o.id = oi.order_id
     WHERE o.status='delivered'
     GROUP BY p.category ORDER BY v DESC`),
  );
  console.log("supplier_product_counts:", await q(
    `SELECT s.name, COUNT(p.id) AS products FROM suppliers s
     JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY s.id`),
  );
  console.log("supplier_revenue_agg_first:", await q(
    `SELECT s.name, ROUND(SUM(x.rev),2) AS v FROM suppliers s
     JOIN products p ON p.supplier_id = s.id
     JOIN (SELECT oi.product_id, SUM(oi.quantity*oi.unit_price) AS rev
           FROM order_items oi GROUP BY oi.product_id) x ON x.product_id = p.id
     GROUP BY s.id ORDER BY v DESC`),
  );
  console.log("lines_per_order_stats:", await q(
    `SELECT COUNT(*) AS orders, ROUND(AVG(n),2) AS avg_lines, MAX(n) AS max_lines, MIN(n) AS min_lines
     FROM (SELECT order_id, COUNT(*) AS n FROM order_items GROUP BY order_id)`),
  );
  console.log("max_lines_one_order:", await q(
    `SELECT order_id, COUNT(*) AS n FROM order_items GROUP BY order_id ORDER BY n DESC, order_id ASC LIMIT 3`),
  );

  // F. self-join universes
  console.log("\n-- F. self-join --");
  console.log("same_region_customer_pairs:", await q(
    `SELECT c1.name AS a, c2.name AS b, c1.region FROM customers c1
     JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id
     ORDER BY c1.region, a`),
  );
  console.log("same_region_pair_count:", await q(
    `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region=c2.region AND c1.id<c2.id`),
  );
  console.log("same_city_pairs:", await q(
    `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.city=c2.city AND c1.id<c2.id`),
  );
  console.log("region_member_counts:", await q(
    `SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY n DESC`),
  );
  console.log("same_supplier_product_pairs:", await q(
    `SELECT COUNT(*) AS n FROM products p1 JOIN products p2 ON p1.supplier_id=p2.supplier_id AND p1.id<p2.id`),
  );
  console.log("same_supplier_supplier2_detail:", await q(
    `SELECT p1.name AS a, p2.name AS b FROM products p1
     JOIN products p2 ON p1.supplier_id=p2.supplier_id AND p1.id<p2.id
     WHERE p1.supplier_id = 2 ORDER BY a`),
  );
  console.log("same_region_supplier_pairs:", await q(
    `SELECT s1.name AS a, s2.name AS b, s1.region FROM suppliers s1
     JOIN suppliers s2 ON s1.region=s2.region AND s1.id<s2.id`),
  );
  console.log("repeat_buyer_order_pairs:", await q(
    `SELECT COUNT(*) AS n FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o1.id<o2.id`),
  );

  // G. specific hops for briefs
  console.log("\n-- G. hops --");
  console.log("supplier_of_each_product:", await q(
    `SELECT p.id, p.name, s.name AS supplier FROM products p JOIN suppliers s ON s.id = p.supplier_id ORDER BY p.id`),
  );
  console.log("who_bought_keyboard_k1:", await q(
    `SELECT c.name, oi.quantity, oi.unit_price, o.status FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN customers c ON c.id = o.customer_id
     JOIN products p ON p.id = oi.product_id
     WHERE p.name = 'Mechanical Keyboard K1'`),
  );
  console.log("orders_containing_headset:", await q(
    `SELECT COUNT(*) AS n FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE p.name='Noise-Canceling Headset'`),
  );
  console.log("customer_who_bought_most_lines:", await q(
    `SELECT c.name, COUNT(oi.id) AS lines FROM customers c
     JOIN orders o ON o.customer_id=c.id
     JOIN order_items oi ON oi.order_id=o.id
     GROUP BY c.id ORDER BY lines DESC LIMIT 3`),
  );
  console.log("watch_buyers_delivered:", await q(
    `SELECT c.name, o.status FROM order_items oi
     JOIN orders o ON o.id=oi.order_id
     JOIN customers c ON c.id=o.customer_id
     JOIN products p ON p.id=oi.product_id
     WHERE p.name='Smart Watch S'`),
  );
  console.log("pending_orders_with_customers:", await q(
    `SELECT c.name, o.id, o.total FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.status='pending' ORDER BY o.id`),
  );

  // H. retention (capstone L36)
  console.log("\n-- H. retention --");
  console.log("cust_both_2024_2025:", await q(
    `SELECT c.name FROM customers c
     JOIN orders o24 ON o24.customer_id=c.id AND o24.created_at LIKE '2024%'
     JOIN orders o25 ON o25.customer_id=c.id AND o25.created_at LIKE '2025%'
     GROUP BY c.id ORDER BY c.name`),
  );
  console.log("cust_2024_only_count:", await q(
    `SELECT COUNT(*) AS n FROM (
       SELECT c.id FROM customers c JOIN orders o ON o.customer_id=c.id
       GROUP BY c.id
       HAVING MAX(o.created_at) < '2025-01-01') t`),
  );
  console.log("cust_2024_only_names:", await q(
    `SELECT c.name, COUNT(o.id) AS orders, ROUND(SUM(o.total),2) AS spend FROM customers c JOIN orders o ON o.customer_id=c.id
     GROUP BY c.id HAVING MAX(o.created_at) < '2025-01-01' ORDER BY spend DESC`),
  );
  console.log("cust_2025_only_names:", await q(
    `SELECT c.name, COUNT(o.id) AS orders FROM customers c JOIN orders o ON o.customer_id=c.id
     GROUP BY c.id HAVING MIN(o.created_at) >= '2025-01-01' ORDER BY c.name`),
  );
  console.log("active_customers:", await q(`SELECT COUNT(*) AS n FROM customers WHERE active=1`));
  console.log("inactive_with_orders:", await q(
    `SELECT c.name, COUNT(o.id) AS n FROM customers c JOIN orders o ON o.customer_id=c.id
     WHERE c.active=0 GROUP BY c.id`),
  );

  // I. EU / region hops for chains
  console.log("\n-- I. chains --");
  console.log("eu_customers_delivered_revenue:", await q(
    `SELECT ROUND(SUM(o.total),2) AS v, COUNT(*) AS n FROM orders o
     JOIN customers c ON c.id=o.customer_id
     WHERE c.region='EU' AND o.status='delivered'`),
  );
  console.log("items_on_pending_orders:", await q(
    `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.status='pending'`),
  );
  console.log("products_from_eu_suppliers:", await q(
    `SELECT COUNT(*) AS n, GROUP_CONCAT(p.name) AS names FROM products p
     JOIN suppliers s ON s.id=p.supplier_id WHERE s.region='EU'`),
  );
  console.log("apac_supplier_products_never_sold:", await q(
    `SELECT p.name FROM products p JOIN suppliers s ON s.id=p.supplier_id
     LEFT JOIN order_items oi ON oi.product_id=p.id
     WHERE s.region='APAC' AND oi.id IS NULL`),
  );
  console.log("avg_order_total_by_region:", await q(
    `SELECT c.region, ROUND(AVG(o.total),2) AS avg_total, COUNT(*) AS n FROM customers c
     JOIN orders o ON o.customer_id=c.id GROUP BY c.region ORDER BY avg_total DESC`),
  );
  console.log("champion_order:", await q(
    `SELECT o.id, c.name, o.total, o.status FROM orders o JOIN customers c ON c.id=o.customer_id ORDER BY o.total DESC LIMIT 3`),
  );
  console.log("smallest_order:", await q(
    `SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id=o.customer_id ORDER BY o.total ASC LIMIT 2`),
  );

  await db.$disconnect?.();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
