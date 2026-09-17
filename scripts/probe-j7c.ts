/// <reference types="bun-types" />
// probe-j7c — verifies every figure for joins-deck batch j3c (cs-267..cs-275).
// Runs against a COPY of the seed db (scripts/.tmp-j7c.db) — never the original.
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

// ---- sanity / roster -------------------------------------------------------
q("counts", `SELECT (SELECT COUNT(*) FROM customers) customers, (SELECT COUNT(*) FROM suppliers) suppliers,
  (SELECT COUNT(*) FROM products) products, (SELECT COUNT(*) FROM orders) orders,
  (SELECT COUNT(*) FROM order_items) order_items, (SELECT COUNT(*) FROM payments) payments,
  (SELECT COUNT(*) FROM refunds) refunds, (SELECT COUNT(*) FROM shipments) shipments,
  (SELECT COUNT(*) FROM acquisitions) acquisitions, (SELECT COUNT(*) FROM employees) employees`);
q("employees roster", `SELECT id, name, role, region, manager_id FROM employees ORDER BY id`);
q("refund totals", `SELECT COUNT(*) n, COUNT(DISTINCT order_id) orders, ROUND(SUM(amount),2) total FROM refunds`);
q("carrier legs", `SELECT carrier, COUNT(*) n FROM shipments GROUP BY carrier ORDER BY n DESC`);

// ---- cs-267: suppliers never refunded (4-hop chain-zeros) -------------------
q("267 per-supplier refund tally (fill context)",
  `SELECT s.id, s.name, s.region, COUNT(r.id) refunded_lines, COUNT(DISTINCT o.id) refunded_orders,
          ROUND(SUM(r.amount),2) refunded_amount
   FROM suppliers s
   LEFT JOIN products p ON p.supplier_id = s.id
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN refunds r ON r.order_id = o.id
   GROUP BY s.id ORDER BY s.id`);
q("267 FILL: suppliers never refunded",
  `SELECT s.name, s.region, COUNT(r.id) AS refunded_lines
   FROM suppliers s
   LEFT JOIN products p ON p.supplier_id = s.id
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN refunds r ON r.order_id = o.id
   GROUP BY s.id HAVING COUNT(r.id) = 0 ORDER BY s.name`);
q("267 naive WHERE-IS-NULL chain (over-report check)",
  `SELECT COUNT(DISTINCT s.id) n FROM suppliers s
   LEFT JOIN products p ON p.supplier_id = s.id
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN refunds r ON r.order_id = o.id
   WHERE r.id IS NULL`);
q("267 suppliers never cancelled-line (fallback corridor)",
  `SELECT s.name FROM suppliers s
   LEFT JOIN products p ON p.supplier_id = s.id
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'cancelled'
   GROUP BY s.id HAVING COUNT(o.id) = 0 ORDER BY s.name`);

// ---- cs-268: products never sold above catalog (1-hop IS NULL) --------------
q("268 line price-vs-catalog spread",
  `SELECT SUM(CASE WHEN oi.unit_price > p.price THEN 1 ELSE 0 END) above,
          SUM(CASE WHEN oi.unit_price = p.price THEN 1 ELSE 0 END) equal,
          SUM(CASE WHEN oi.unit_price < p.price THEN 1 ELSE 0 END) below,
          COUNT(*) total
   FROM order_items oi JOIN products p ON p.id = oi.product_id`);
q("268 FILL: products never sold above catalog",
  `SELECT p.name, p.price
   FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.unit_price > p.price
   WHERE oi.id IS NULL
   ORDER BY p.name`);
q("268 per-product markup lines (context)",
  `SELECT p.id, p.name, COUNT(oi.id) markup_lines
   FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.unit_price > p.price
   GROUP BY p.id ORDER BY markup_lines DESC, p.name`);
q("268 fallback: products never sold below catalog",
  `SELECT p.name FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.unit_price < p.price
   WHERE oi.id IS NULL ORDER BY p.name`);
q("268 fallback: products never bought in multiples",
  `SELECT p.name FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.quantity > 1
   WHERE oi.id IS NULL ORDER BY p.name`);
q("268 multiples context: products with multi-unit lines",
  `SELECT COUNT(DISTINCT oi.product_id) n FROM order_items oi WHERE oi.quantity > 1`);
q("268 max markup pct",
  `SELECT p.name, p.price, oi.unit_price, ROUND(100.0*oi.unit_price/p.price - 100, 1) pct
   FROM order_items oi JOIN products p ON p.id = oi.product_id
   ORDER BY oi.unit_price - p.price DESC LIMIT 5`);

// ---- cs-269: products never shipped via carrier X (4-hop chain-zeros) -------
for (const car of ["DHL", "UPS", "FedEx", "LocalPost"]) {
  q(`269 FILL never via ${car}`,
    `SELECT p.name, p.category, COUNT(s.id) AS legs
     FROM products p
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o ON o.id = oi.order_id
     LEFT JOIN shipments s ON s.order_id = o.id AND s.carrier = '${car}'
     GROUP BY p.id HAVING COUNT(s.id) = 0 ORDER BY p.name`);
}
q("269 per-product carrier mix (context)",
  `SELECT p.name,
     SUM(CASE WHEN s.carrier='DHL' THEN 1 ELSE 0 END) dhl,
     SUM(CASE WHEN s.carrier='UPS' THEN 1 ELSE 0 END) ups,
     SUM(CASE WHEN s.carrier='FedEx' THEN 1 ELSE 0 END) fedex,
     SUM(CASE WHEN s.carrier='LocalPost' THEN 1 ELSE 0 END) localpost
   FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN shipments s ON s.order_id = o.id
   GROUP BY p.id ORDER BY p.name`);

// ---- cs-270: refunds on tickets that never shipped (2-hop IS NULL) ----------
q("270 FILL: refunds with no shipment at all",
  `SELECT r.id, r.reason, r.amount, o.id AS order_id, o.status, c.name
   FROM refunds r
   JOIN orders o ON o.id = r.order_id
   JOIN customers c ON c.id = o.customer_id
   LEFT JOIN shipments s ON s.order_id = o.id
   WHERE s.id IS NULL
   ORDER BY r.id`);
q("270 variant: refunds with no DELIVERED shipment",
  `SELECT r.id, o.status FROM refunds r
   JOIN orders o ON o.id = r.order_id
   LEFT JOIN shipments s ON s.order_id = o.id AND s.delivered_at IS NOT NULL
   WHERE s.id IS NULL ORDER BY r.id`);
q("270 refunds by order status (context)",
  `SELECT o.status, COUNT(*) n, ROUND(SUM(r.amount),2) amt
   FROM refunds r JOIN orders o ON o.id = r.order_id GROUP BY o.status`);
q("270 orders never shipped (context)", `SELECT COUNT(*) n FROM orders o LEFT JOIN shipments s ON s.order_id = o.id WHERE s.id IS NULL`);

// ---- cs-271: employees never a [region] refund (4-hop chain-zeros) ----------
q("271 per-employee region matrix (context)",
  `SELECT e.id, e.name, e.role,
     SUM(CASE WHEN c.region='EU' THEN 1 ELSE 0 END) eu,
     SUM(CASE WHEN c.region='US' THEN 1 ELSE 0 END) us,
     SUM(CASE WHEN c.region='APAC' THEN 1 ELSE 0 END) apac,
     SUM(CASE WHEN c.region='LATAM' THEN 1 ELSE 0 END) latam
   FROM employees e
   LEFT JOIN refunds r ON r.processed_by = e.id
   LEFT JOIN orders o ON o.id = r.order_id
   LEFT JOIN customers c ON c.id = o.customer_id
   GROUP BY e.id ORDER BY e.id`);
for (const reg of ["US", "EU", "APAC", "LATAM"]) {
  q(`271 FILL never a ${reg} refund`,
    `SELECT e.name, e.role
     FROM employees e
     LEFT JOIN refunds r ON r.processed_by = e.id
     LEFT JOIN orders o ON o.id = r.order_id
     LEFT JOIN customers c ON c.id = o.customer_id AND c.region = '${reg}'
     GROUP BY e.id HAVING COUNT(c.id) = 0 ORDER BY e.name`);
}

// ---- cs-272: products never bought by churned customers (4-hop) -------------
q("272 churned buyers' product sets (context)",
  `SELECT c.id, c.name, c.active, COUNT(DISTINCT p.id) products, COUNT(*) lines
   FROM customers c
   JOIN orders o ON o.customer_id = c.id
   JOIN order_items oi ON oi.order_id = o.id
   JOIN products p ON p.id = oi.product_id
   WHERE c.active = 0 GROUP BY c.id`);
q("272 FILL: products never bought by churned customers",
  `SELECT p.name, p.category, COUNT(c.id) AS churned_lines
   FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN customers c ON c.id = o.customer_id AND c.active = 0
   GROUP BY p.id HAVING COUNT(c.id) = 0
   ORDER BY p.name`);
q("272 HAVING=1 variant", `SELECT COUNT(*) n FROM (
   SELECT p.id FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN customers c ON c.id = o.customer_id AND c.active = 0
   GROUP BY p.id HAVING COUNT(c.id) = 1)`);
q("272 HAVING=2 variant", `SELECT COUNT(*) n FROM (
   SELECT p.id FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN customers c ON c.id = o.customer_id AND c.active = 0
   GROUP BY p.id HAVING COUNT(c.id) = 2)`);
q("272 naive WHERE-IS-NULL (over-report check)", `SELECT COUNT(DISTINCT p.id) n FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN customers c ON c.id = o.customer_id AND c.active = 0
   WHERE c.id IS NULL`);

// ---- cs-273: suppliers with no US sales (5-hop chain-zeros) -----------------
q("273 per-supplier region matrix (context)",
  `SELECT s.id, s.name, s.region,
     SUM(CASE WHEN c.region='EU' THEN 1 ELSE 0 END) eu_lines,
     SUM(CASE WHEN c.region='US' THEN 1 ELSE 0 END) us_lines,
     SUM(CASE WHEN c.region='APAC' THEN 1 ELSE 0 END) apac_lines,
     SUM(CASE WHEN c.region='LATAM' THEN 1 ELSE 0 END) latam_lines
   FROM suppliers s
   LEFT JOIN products p ON p.supplier_id = s.id
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN customers c ON c.id = o.customer_id
   GROUP BY s.id ORDER BY s.id`);
for (const reg of ["US", "EU", "APAC", "LATAM"]) {
  q(`273 FILL suppliers with no ${reg} sales`,
    `SELECT s.name, s.region, COUNT(c.id) AS reg_lines
     FROM suppliers s
     LEFT JOIN products p ON p.supplier_id = s.id
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o ON o.id = oi.order_id
     LEFT JOIN customers c ON c.id = o.customer_id AND c.region = '${reg}'
     GROUP BY s.id HAVING COUNT(c.id) = 0 ORDER BY s.name`);
}

// ---- cs-274: products never bought by referral arrivals (5-hop) -------------
q("274 referral buyers' product sets (context)",
  `SELECT c.id, c.name, COUNT(DISTINCT p.id) products
   FROM customers c
   JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'referral'
   JOIN orders o ON o.customer_id = c.id
   JOIN order_items oi ON oi.order_id = o.id
   JOIN products p ON p.id = oi.product_id
   GROUP BY c.id`);
q("274 FILL: products never bought by referral arrivals",
  `SELECT p.name, COUNT(a.id) AS referral_lines
   FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN customers c ON c.id = o.customer_id
   LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'referral'
   GROUP BY p.id HAVING COUNT(a.id) = 0
   ORDER BY p.name`);
for (const ch of ["social", "email", "search"]) {
  q(`274 variant never bought by ${ch} arrivals`,
    `SELECT COUNT(*) n FROM (
     SELECT p.id FROM products p
     LEFT JOIN order_items oi ON oi.product_id = p.id
     LEFT JOIN orders o ON o.id = oi.order_id
     LEFT JOIN customers c ON c.id = o.customer_id
     LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = '${ch}'
     GROUP BY p.id HAVING COUNT(a.id) = 0)`);
}
q("274 channel mix (context)", `SELECT channel, COUNT(*) n, ROUND(SUM(spend),2) spend FROM acquisitions GROUP BY channel`);

// ---- cs-275: employees never signed a >=100 refund (1-hop IS NULL) ----------
q("275 per-employee amount matrix (context)",
  `SELECT e.id, e.name, e.role, COUNT(r.id) refunds, ROUND(SUM(r.amount),2) total,
     SUM(CASE WHEN r.amount >= 100 THEN 1 ELSE 0 END) ge100, ROUND(MAX(r.amount),2) max_amt
   FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id
   GROUP BY e.id ORDER BY e.id`);
for (const thr of [50, 100, 150, 200]) {
  q(`275 FILL never signed >= ${thr}`,
    `SELECT e.name, e.role
     FROM employees e
     LEFT JOIN refunds r ON r.processed_by = e.id AND r.amount >= ${thr}
     WHERE r.id IS NULL
     ORDER BY e.name`);
}
q("275 refunds >=100 count (context)", `SELECT COUNT(*) n, ROUND(SUM(amount),2) amt FROM refunds WHERE amount >= 100`);

// ---- cs-271 extras: total per-region refund counts (context) ----------------
q("refund lines by customer region", `SELECT c.region, COUNT(*) n, ROUND(SUM(r.amount),2) amt
   FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id GROUP BY c.region`);

db.close();
console.log("\nprobe-j7c done");
