/// <reference types="bun-types" />
// probe-j7c-2 — replacement corridors + walkthrough context figures.
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j7c.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all();
    console.log(`\n== ${label} ==`);
    console.log(JSON.stringify(rows));
  } catch (e) {
    console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// ---- cs-267 context: cancelled lines per supplier ---------------------------
q("267 per-supplier cancelled-line tally (FILL context)",
  `SELECT s.id, s.name, COUNT(o.id) cancelled_lines, COUNT(DISTINCT p.id) products_hit
   FROM suppliers s
   LEFT JOIN products p ON p.supplier_id = s.id
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'cancelled'
   GROUP BY s.id ORDER BY s.id`);
q("267 FILL: suppliers never hit by a cancellation",
  `SELECT s.name, s.region, COUNT(o.id) AS cancelled_lines
   FROM suppliers s
   LEFT JOIN products p ON p.supplier_id = s.id
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'cancelled'
   GROUP BY s.id HAVING COUNT(o.id) = 0 ORDER BY s.name`);
q("267 cancelled-line products (context)",
  `SELECT p.name, s.name AS supplier, COUNT(*) lines
   FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id
   JOIN suppliers s ON s.id = p.supplier_id
   WHERE o.status = 'cancelled' GROUP BY p.id ORDER BY lines DESC, p.name`);
q("267 total cancelled lines (context)",
  `SELECT COUNT(*) lines, COUNT(DISTINCT o.id) orders FROM orders o
   JOIN order_items oi ON oi.order_id = o.id WHERE o.status = 'cancelled'`);

// ---- category-grain corridors ------------------------------------------------
q("268? per-category refund tally",
  `SELECT p.category, COUNT(r.id) refunded_lines, COUNT(DISTINCT o.id) refunded_orders,
          ROUND(SUM(r.amount),2) refunded_amt
   FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN refunds r ON r.order_id = o.id
   GROUP BY p.category ORDER BY p.category`);
q("268? FILL: categories with no refunded line",
  `SELECT p.category, COUNT(r.id) AS refunded_lines
   FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN refunds r ON r.order_id = o.id
   GROUP BY p.category HAVING COUNT(r.id) = 0 ORDER BY p.category`);
q("268? per-category cancelled tally",
  `SELECT p.category, COUNT(o.id) cancelled_lines
   FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'cancelled'
   GROUP BY p.category ORDER BY p.category`);

// ---- product-grain refund anti -----------------------------------------------
q("270? FILL: products never refunded",
  `SELECT p.name, p.category, COUNT(r.id) AS refunded_lines
   FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN refunds r ON r.order_id = o.id
   GROUP BY p.id HAVING COUNT(r.id) = 0 ORDER BY p.name`);
q("270? products on refunded orders (context)",
  `SELECT COUNT(DISTINCT p.id) n FROM refunds r
   JOIN orders o ON o.id = r.order_id JOIN order_items oi ON oi.order_id = o.id
   JOIN products p ON p.id = oi.product_id`);

// ---- products never bought by region X (product-grain, region arm) -----------
for (const reg of ["US", "EU", "APAC", "LATAM"]) {
  q(`270? products never bought by ${reg} customers`,
    `SELECT COUNT(*) n FROM (
     SELECT p.id FROM products p
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o ON o.id = oi.order_id
     LEFT JOIN customers c ON c.id = o.customer_id AND c.region = '${reg}'
     GROUP BY p.id HAVING COUNT(c.id) = 0)`);
}

// ---- reason-arm employees (cs-270 fallback) ----------------------------------
q("reason x processor matrix",
  `SELECT e.name, e.role,
     SUM(CASE WHEN r.reason='damaged' THEN 1 ELSE 0 END) damaged,
     SUM(CASE WHEN r.reason='late_delivery' THEN 1 ELSE 0 END) late_delivery,
     SUM(CASE WHEN r.reason='changed_mind' THEN 1 ELSE 0 END) changed_mind,
     SUM(CASE WHEN r.reason='wrong_item' THEN 1 ELSE 0 END) wrong_item
   FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id
   GROUP BY e.id ORDER BY e.id`);
q("wrong_item refund rows", `SELECT r.id, r.amount, e.name FROM refunds r JOIN employees e ON e.id = r.processed_by WHERE r.reason='wrong_item' ORDER BY r.id`);
q("late_delivery refund rows", `SELECT r.id, r.amount, e.name FROM refunds r JOIN employees e ON e.id = r.processed_by WHERE r.reason='late_delivery' ORDER BY r.id`);

// ---- cs-271 context: the two US refunds ---------------------------------------
q("271 US refund rows (context)",
  `SELECT r.id, r.amount, r.reason, r.refunded_at, e.name AS processor, c.name AS buyer, o.id AS order_id
   FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
   JOIN employees e ON e.id = r.processed_by
   WHERE c.region = 'US' ORDER BY r.id`);
q("271 EU/APAC/LATAM refund counts (context)",
  `SELECT c.region, COUNT(*) n, ROUND(SUM(r.amount),2) amt FROM refunds r
   JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id GROUP BY c.region`);

// ---- cs-272 context: churned pair baskets ------------------------------------
q("272 Dmitri basket", `SELECT p.name FROM customers c JOIN orders o ON o.customer_id=c.id
   JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id
   WHERE c.name='Dmitri Volkov' GROUP BY p.id ORDER BY p.name`);
q("272 Keiko basket", `SELECT p.name FROM customers c JOIN orders o ON o.customer_id=c.id
   JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id
   WHERE c.name='Keiko Sato' GROUP BY p.id ORDER BY p.name`);
q("272 churned order counts", `SELECT c.name, COUNT(*) orders FROM customers c JOIN orders o ON o.customer_id=c.id WHERE c.active=0 GROUP BY c.id`);

// ---- cs-274 context: email pair baskets --------------------------------------
q("274 email arrivals (context)", `SELECT c.name, a.spend, a.acquired_at FROM acquisitions a JOIN customers c ON c.id=a.customer_id WHERE a.channel='email'`);
q("274 Isabella basket", `SELECT p.name FROM customers c JOIN orders o ON o.customer_id=c.id
   JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id
   WHERE c.name='Isabella Rossi' GROUP BY p.id ORDER BY p.name`);
q("274 Liam basket", `SELECT p.name FROM customers c JOIN orders o ON o.customer_id=c.id
   JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id
   WHERE c.name='Liam O''Brien' GROUP BY p.id ORDER BY p.name`);

// ---- cs-269 context: UPS legs of the two never-products ----------------------
q("269 Smart Watch S legs by carrier", `SELECT s.carrier, COUNT(*) n FROM shipments s
   JOIN orders o ON o.id=s.order_id JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id
   WHERE p.name='Smart Watch S' GROUP BY s.carrier`);
q("269 Cycling Jersey legs by carrier", `SELECT s.carrier, COUNT(*) n FROM shipments s
   JOIN orders o ON o.id=s.order_id JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id
   WHERE p.name='Cycling Jersey Pro' GROUP BY s.carrier`);
q("269 UPS legs total / distinct products", `SELECT COUNT(*) legs, COUNT(DISTINCT p.id) products FROM shipments s
   JOIN orders o ON o.id=s.order_id JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id
   WHERE s.carrier='UPS'`);

// ---- cs-273 context: LATAM lines detail --------------------------------------
q("273 LATAM lines (context)", `SELECT s.name AS supplier, c.name AS buyer, oi.quantity, p.name AS product
   FROM order_items oi JOIN orders o ON o.id=oi.order_id JOIN customers c ON c.id=o.customer_id
   JOIN products p ON p.id=oi.product_id JOIN suppliers s ON s.id=p.supplier_id
   WHERE c.region='LATAM' ORDER BY s.name`);

// ---- cs-275 context: the twelve >=100 refunds --------------------------------
q("275 refunds >=100 by processor", `SELECT e.name, COUNT(*) n, ROUND(SUM(r.amount),2) amt
   FROM refunds r JOIN employees e ON e.id=r.processed_by WHERE r.amount >= 100 GROUP BY e.id ORDER BY amt DESC`);
q("275 Carla + Tomas refunds", `SELECT e.name, r.amount, r.reason FROM refunds r JOIN employees e ON e.id=r.processed_by WHERE e.name IN ('Carla Dominguez','Tomas Ruiz') ORDER BY r.amount`);

db.close();
console.log("\nprobe-j7c-2 done");
