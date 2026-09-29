// M3 pass fact probe #2 — overlap/exception facts for hard MCQs + problems.
// Run: npx tsx scripts/m3-facts2.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return (await db.$queryRawUnsafe(sql)) as T[];
}
async function one(sql: string): Promise<Record<string, unknown>> {
  const rows = await q(sql);
  return rows[0] ?? {};
}

async function main() {
  await resetDatabase();

  console.log("== customer status overlaps ==");
  console.log("delivered∩shipped customers:", await one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders WHERE status='delivered' INTERSECT SELECT customer_id FROM orders WHERE status='shipped')`));
  console.log("pending∩cancelled customers:", await one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders WHERE status='pending' INTERSECT SELECT customer_id FROM orders WHERE status='cancelled')`));
  console.log("delivered∩shipped∩cancelled:", await one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders WHERE status='delivered' INTERSECT SELECT customer_id FROM orders WHERE status='shipped' INTERSECT SELECT customer_id FROM orders WHERE status='cancelled')`));
  console.log("delivered∩cancelled:", await one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders WHERE status='delivered' INTERSECT SELECT customer_id FROM orders WHERE status='cancelled')`));
  console.log("shipped∩cancelled:", await one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders WHERE status='shipped' INTERSECT SELECT customer_id FROM orders WHERE status='cancelled')`));
  console.log("shipped∩pending:", await one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders WHERE status='shipped' INTERSECT SELECT customer_id FROM orders WHERE status='pending')`));
  console.log("no delivered order (EXCEPT):", await q(`SELECT name FROM customers EXCEPT SELECT c.name FROM orders o INNER JOIN customers c ON o.customer_id=c.id WHERE o.status='delivered'`));
  console.log("customers EXCEPT pending-havers:", await q(`SELECT name FROM customers EXCEPT SELECT c.name FROM orders o INNER JOIN customers c ON o.customer_id=c.id WHERE o.status='pending' ORDER BY name`));
  console.log("customers EXCEPT cancelled-havers count:", await one(`SELECT COUNT(*) n FROM (SELECT id FROM customers EXCEPT SELECT customer_id FROM orders WHERE status='cancelled')`));

  console.log("\n== spend / size exceptions ==");
  console.log("customers with an order >= 500:", await one(`SELECT COUNT(DISTINCT customer_id) n FROM orders WHERE total >= 500`));
  console.log("customers EXCEPT big-order-havers count:", await one(`SELECT COUNT(*) n FROM (SELECT id FROM customers EXCEPT SELECT customer_id FROM orders WHERE total >= 500)`));
  console.log("orders >= 500 count:", await one(`SELECT COUNT(*) n FROM orders WHERE total >= 500`));

  console.log("\n== product quantity / drift facts ==");
  console.log("products with any qty>=2 line:", await q(`SELECT p.name FROM order_items oi INNER JOIN products p ON oi.product_id=p.id WHERE oi.quantity >= 2 GROUP BY p.id ORDER BY p.name`));
  console.log("products always qty=1 (EXCEPT qty>=2):", await q(`SELECT name FROM products EXCEPT SELECT p.name FROM order_items oi INNER JOIN products p ON oi.product_id=p.id WHERE oi.quantity >= 2 ORDER BY name`));
  console.log("products with any qty>=3 line:", await q(`SELECT DISTINCT p.name FROM order_items oi INNER JOIN products p ON oi.product_id=p.id WHERE oi.quantity >= 3 ORDER BY p.name`));
  console.log("premium products (>=100):", await q(`SELECT name, price FROM products WHERE price >= 100 ORDER BY name`));
  console.log("products with any drifted line:", await q(`SELECT DISTINCT p.name FROM order_items oi INNER JOIN products p ON oi.product_id=p.id WHERE oi.unit_price <> p.price ORDER BY p.name`));
  console.log("products with any drifted line count:", await one(`SELECT COUNT(DISTINCT product_id) n FROM order_items WHERE unit_price <> (SELECT price FROM products WHERE id = product_id)`));
  console.log("premium ∧ drifted intersect:", await q(`SELECT name FROM products WHERE price >= 100 INTERSECT SELECT p.name FROM order_items oi INNER JOIN products p ON oi.product_id=p.id WHERE oi.unit_price <> p.price ORDER BY 1`));
  console.log("categories EXCEPT premium-categories:", await q(`SELECT DISTINCT category FROM products EXCEPT SELECT DISTINCT category FROM products WHERE price >= 100 ORDER BY 1`));
  console.log("categories with premium products:", await q(`SELECT DISTINCT category FROM products WHERE price >= 100 ORDER BY 1`));

  console.log("\n== basket pairs (orders containing both categories) ==");
  console.log("orders w/ Electronics:", await one(`SELECT COUNT(DISTINCT o.id) n FROM orders o INNER JOIN order_items oi ON oi.order_id=o.id INNER JOIN products p ON p.id=oi.product_id WHERE p.category='Electronics'`));
  console.log("orders w/ Audio:", await one(`SELECT COUNT(DISTINCT o.id) n FROM orders o INNER JOIN order_items oi ON oi.order_id=o.id INNER JOIN products p ON p.id=oi.product_id WHERE p.category='Audio'`));
  console.log("orders w/ both Electronics∩Audio:", await one(`SELECT COUNT(*) n FROM (SELECT order_id FROM order_items oi INNER JOIN products p ON p.id=oi.product_id WHERE p.category='Electronics' INTERSECT SELECT order_id FROM order_items oi INNER JOIN products p ON p.id=oi.product_id WHERE p.category='Audio')`));
  console.log("orders w/ both Accessories∩Apparel:", await one(`SELECT COUNT(*) n FROM (SELECT order_id FROM order_items oi INNER JOIN products p ON p.id=oi.product_id WHERE p.category='Accessories' INTERSECT SELECT order_id FROM order_items oi INNER JOIN products p ON p.id=oi.product_id WHERE p.category='Apparel')`));

  console.log("\n== supplier / region confirms ==");
  console.log("EU suppliers of ordered products:", await q(`SELECT s.name FROM order_items oi INNER JOIN products p ON p.id=oi.product_id INNER JOIN suppliers s ON s.id=p.supplier_id WHERE s.region='EU' GROUP BY s.id ORDER BY s.name`));
  console.log("non-EU suppliers:", await q(`SELECT name FROM suppliers WHERE region <> 'EU' ORDER BY name`));
  console.log("supplier names EXCEPT ordered-supplier names:", await one(`SELECT COUNT(*) n FROM (SELECT name FROM suppliers EXCEPT SELECT s.name FROM order_items oi INNER JOIN products p ON p.id=oi.product_id INNER JOIN suppliers s ON s.id=p.supplier_id)`));
  console.log("products >= 50 count:", await one(`SELECT COUNT(*) n FROM products WHERE price >= 50`));
  console.log("pending-status set EXCEPT cancelled-status set:", await q(`SELECT DISTINCT status FROM orders WHERE status='pending' EXCEPT SELECT DISTINCT status FROM orders WHERE status='cancelled'`));
  console.log("union regions EXCEPT LATAM:", await q(`SELECT region FROM customers UNION SELECT region FROM suppliers EXCEPT SELECT region FROM customers WHERE region='LATAM' ORDER BY 1`));
  console.log("pending∪cancelled totals count:", await one(`SELECT COUNT(*) n FROM (SELECT total FROM orders WHERE status='pending' UNION ALL SELECT total FROM orders WHERE status='cancelled')`));
  console.log("pending∪cancelled totals UNION dedupe:", await one(`SELECT COUNT(*) n FROM (SELECT total FROM orders WHERE status='pending' UNION SELECT total FROM orders WHERE status='cancelled')`));
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
