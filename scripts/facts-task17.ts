// Task 17 fact sheet — batched verification (plain-SQL forms, no compound derived tables).
import { PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();
  const q = async (sql: string) =>
    (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  const out: Record<string, unknown> = {};

  /* L9 */
  out.l9_p8 = await q(`SELECT c.name, o.id FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status='pending' ORDER BY c.name, o.id`);
  /* L10 */
  out.l10_p7_top3 = await q(`SELECT p.name, s.name supplier, ROUND(p.price*p.stock,2) shelf FROM products p JOIN suppliers s ON s.id=p.supplier_id ORDER BY shelf DESC, p.name LIMIT 3`);
  out.l10_p6_top3 = await q(`SELECT oi.id, p.name, ROUND(oi.quantity*oi.unit_price,2) line_total FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE oi.quantity>=3 ORDER BY line_total DESC, oi.id LIMIT 3`);
  /* L11 */
  out.l11_p7 = (await q(`SELECT COUNT(*) n FROM order_items oi JOIN orders o ON o.id=oi.order_id JOIN customers c ON c.id=o.customer_id WHERE c.city='Berlin' AND o.total>500`))[0].n;
  out.l11_p8 = await q(`SELECT DISTINCT s.region FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN suppliers s ON s.id=p.supplier_id WHERE p.category='Audio' ORDER BY s.region`);
  /* L12 */
  out.l12_p6_rows = (await q(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='shipped'`))[0].n;
  out.l12_p7_rows = (await q(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='pending'`))[0].n;
  out.l12_p8_rows = (await q(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.total>800`))[0].n;
  /* L13 */
  out.l13_p5 = await q(`SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='cancelled' WHERE o.id IS NULL AND c.active=1 ORDER BY c.name`);
  out.l13_p6 = (await q(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='delivered' WHERE o.id IS NULL`))[0].n;
  out.l13_p7 = await q(`SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status IN ('pending','shipped') WHERE o.id IS NULL ORDER BY c.name`);
  out.l13_p8 = (await q(`SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status<>'delivered' WHERE o.id IS NULL`))[0].n;
  /* L14 */
  out.l14_p5_list = await q(`SELECT c1.name a, c2.name b, c1.region FROM customers c1 JOIN customers c2 ON c1.region=c2.region AND c1.id<c2.id WHERE c1.active=1 AND c2.active=1 ORDER BY c1.region, c1.name`);
  out.l14_p6 = (await q(`SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o1.id<o2.id AND DATE(o1.created_at)=DATE(o2.created_at)`))[0].n;
  out.l14_p6b = (await q(`SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o1.id<o2.id AND o1.total=o2.total`))[0].n;
  out.l14_p7 = (await q(`SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category=p2.category AND p1.id<p2.id WHERE p1.price=p2.price`))[0].n;
  out.l14_p7b = (await q(`SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category=p2.category AND p1.id<p2.id WHERE ABS(p1.price-p2.price)<5`))[0].n;
  out.l14_p8 = (await q(`SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.region=c2.region AND c1.id<c2.id JOIN customers c3 ON c2.region=c3.region AND c2.id<c3.id`))[0].n;
  out.l14_q7_us = (await q(`SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.region=c2.region AND c1.id<c2.id WHERE c1.region='US'`))[0].n;
  /* L15 */
  out.l15_p5 = await q(`SELECT c.name, ROUND(AVG(o.total),2) avg_order FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.id ORDER BY avg_order DESC, c.name LIMIT 5`);
  out.l15_p6 = await q(`SELECT category, ROUND(MIN(price),2) min_price, ROUND(MAX(price),2) max_price FROM products GROUP BY category ORDER BY category`);
  out.l15_p8 = await q(`SELECT s.name, COUNT(*) products, SUM(p.stock) total_stock, ROUND(AVG(p.price),2) avg_price FROM products p JOIN suppliers s ON s.id=p.supplier_id GROUP BY s.id HAVING COUNT(*)>=3 ORDER BY total_stock DESC, s.name`);
  /* L16 */
  out.l16_p6_totals_distinct = (await q(`SELECT COUNT(DISTINCT total) n FROM orders`))[0].n;
  out.l16_p6_orders_distinct = (await q(`SELECT COUNT(DISTINCT o.id) n FROM orders o JOIN order_items oi ON oi.order_id=o.id`))[0].n;

  /* L17 — collisions via plain joins */
  out.l17_p5_collisions = (await q(`SELECT COUNT(*) n FROM customers c JOIN products p ON p.name = c.name`))[0].n;
  out.l17_p7_coll = (await q(`SELECT COUNT(*) n FROM customers a JOIN customers b ON a.region = b.city`))[0].n;
  /* L18 */
  out.l18_p6 = (await q(`SELECT COUNT(*) n FROM customers WHERE city='Berlin'`))[0].n;
  out.l18_p8 = await q(`SELECT * FROM (SELECT c.name entity, ROUND(o.total,2) score FROM orders o JOIN customers c ON c.id=o.customer_id UNION ALL SELECT s.name entity, s.rating score FROM suppliers s) t ORDER BY score DESC, entity LIMIT 5`);
  out.l18_p8_max_rating = (await q(`SELECT MAX(rating) m FROM suppliers`))[0].m;
  /* L19 — AND forms (names unique per table) */
  out.l19_names_dup = (await q(`SELECT COUNT(*) n FROM (SELECT name FROM products GROUP BY name HAVING COUNT(*)>1)`))[0].n;
  out.l19_p7 = (await q(`SELECT COUNT(*) n FROM products WHERE price>100 AND stock<50`))[0].n;
  out.l19_p7b = (await q(`SELECT COUNT(*) n FROM products WHERE price>100 AND stock<80`))[0].n;
  out.l19_p8_triple = (await q(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.status='delivered') AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.status='pending') AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.status='cancelled')`))[0].n;
  out.l19_p8_fallback = (await q(`SELECT COUNT(*) n FROM orders o WHERE o.total>800 AND (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id=o.id)>=3`))[0].n;
  /* L20 */
  out.l20_p5 = (await q(`SELECT COUNT(*) n FROM customers c WHERE c.id IN (SELECT customer_id FROM orders WHERE status='pending') AND c.id NOT IN (SELECT customer_id FROM orders WHERE status='delivered')`))[0].n;
  out.l20_p6_arm1 = (await q(`SELECT COUNT(*) n FROM (SELECT order_id FROM order_items GROUP BY order_id HAVING COUNT(*)>=3) t`))[0].n;
  out.l20_p6 = (await q(`SELECT COUNT(*) n FROM (SELECT order_id FROM order_items GROUP BY order_id HAVING COUNT(*)>=3) t WHERE t.order_id NOT IN (SELECT id FROM orders WHERE status='pending')`))[0].n;
  out.l20_p7 = await q(`SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status='shipped') ORDER BY id DESC LIMIT 3`);

  /* L23 */
  out.l23_p5_berlin = await q(`SELECT SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END) delivered, SUM(CASE WHEN o.status='shipped' THEN 1 ELSE 0 END) shipped, SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) pending, SUM(CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END) cancelled, COUNT(*) total FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.city='Berlin'`);
  out.l23_p6_eu = await q(`SELECT SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END) delivered, SUM(CASE WHEN o.status='shipped' THEN 1 ELSE 0 END) shipped, SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) pending, SUM(CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END) cancelled, COUNT(*) total FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='EU'`);
  out.l23_p7_all = await q(`SELECT c.region, SUM(CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END) cancelled, SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) pending FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY c.region`);
  out.l23_p8 = await q(`SELECT c.name, SUM(CASE WHEN o.total>500 THEN 1 ELSE 0 END) big, COUNT(*) n FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.id ORDER BY big DESC, c.name LIMIT 5`);
  /* L24 */
  out.l24_p5_high = (await q(`SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id HAVING SUM(total)>=3000) t`))[0].n;
  out.l24_p6 = await q(`SELECT c.name, ROUND(SUM(oi.quantity*oi.unit_price),2) revenue FROM customers c JOIN orders o ON o.customer_id=c.id JOIN order_items oi ON oi.order_id=o.id GROUP BY c.id ORDER BY revenue DESC, c.name LIMIT 5`);
  out.l24_p7 = await q(`SELECT c.region, SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) open_orders, SUM(CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END) lost_orders, ROUND(SUM(o.total),2) revenue FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY revenue DESC`);
  out.l24_p8_top3 = await q(`SELECT id, ROUND(total,2) total FROM orders WHERE status='delivered' ORDER BY total DESC, id ASC LIMIT 3`);

  console.log(JSON.stringify(out, (_k, v) => (typeof v === "bigint" ? Number(v) : v), 1));
  await db.$disconnect();
}
main();
