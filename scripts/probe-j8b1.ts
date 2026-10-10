/// <reference types="bun-types" />
// probe-j8b1.ts — j8-b batch 4 (multi-table money chains) corridor sweep.
// Read-only probe against the COPY scripts/.tmp-j8b.db. Run from PROJECT ROOT.
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j8b.db", { readonly: true });

function q(title: string, sql: string) {
  console.log(`\n=== ${title} ===`);
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    if (rows.length === 0) {
      console.log("(0 rows)");
      return;
    }
    const cols = Object.keys(rows[0]);
    console.log(cols.join(" | "));
    for (const r of rows) console.log(cols.map((c) => r[c]).join(" | "));
    console.log(`(${rows.length} rows)`);
  } catch (e) {
    console.log("ERR:", e instanceof Error ? e.message : String(e));
  }
}

// ---- baseline
q("customer regions", `SELECT region, COUNT(*) n FROM customers GROUP BY region`);
q("statuses", `SELECT status, COUNT(*) n, ROUND(SUM(total),2) s FROM orders GROUP BY status`);

// ---- cs-284 (cash): settled money by method x region, chain payments->orders->customers
q("cs-284 fill: settled money per region x method", `
SELECT c.region, p.method, COUNT(*) AS payment_rows, ROUND(SUM(p.amount), 2) AS settled
FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN customers c ON c.id = o.customer_id
WHERE p.status = 'settled'
GROUP BY c.region, p.method
ORDER BY c.region, p.method`);
q("cs-284 distractor o.total per region x method (fan-out)", `
SELECT c.region, p.method, ROUND(SUM(o.total), 2) AS settled
FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN customers c ON c.id = o.customer_id
WHERE p.status = 'settled'
GROUP BY c.region, p.method
ORDER BY c.region, p.method`);
q("cs-284 arm pending variant", `
SELECT c.region, p.method, COUNT(*) AS n, ROUND(SUM(p.amount), 2) AS amt
FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN customers c ON c.id = o.customer_id
WHERE p.status = 'pending'
GROUP BY c.region, p.method
ORDER BY c.region, p.method`);
q("cs-284 group by method only (region dropped)", `
SELECT p.method, COUNT(*) AS n, ROUND(SUM(p.amount), 2) AS settled
FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN customers c ON c.id = o.customer_id
WHERE p.status = 'settled'
GROUP BY p.method ORDER BY p.method`);

// ---- cs-285 (refund-audit): refund money per region, refunds->orders->customers
q("cs-285 fill: refund money per region", `
SELECT c.region, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
GROUP BY c.region
ORDER BY c.region`);
q("cs-285 damaged arm per region", `
SELECT c.region, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'damaged'
GROUP BY c.region
ORDER BY c.region`);
q("cs-285 late_delivery arm per region", `
SELECT c.region, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'late_delivery'
GROUP BY c.region
ORDER BY c.region`);
q("cs-285 wrong_item arm per region", `
SELECT c.region, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'wrong_item'
GROUP BY c.region
ORDER BY c.region`);
q("cs-285 distractor o.total per region (fan-out)", `
SELECT c.region, COUNT(r.id) AS claims, ROUND(SUM(o.total), 2) AS refunded
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
GROUP BY c.region
ORDER BY c.region`);

// ---- cs-286 (logistics): freight vs refund money per carrier, shipments->orders->refunds
q("cs-286 fill: freight + refund money per carrier (LEFT)", `
SELECT s.carrier, COUNT(DISTINCT s.id) AS legs, ROUND(SUM(s.cost), 2) AS freight,
       COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
LEFT JOIN refunds r ON r.order_id = o.id
GROUP BY s.carrier
ORDER BY s.carrier`);
q("cs-286 INNER variant", `
SELECT s.carrier, COUNT(DISTINCT s.id) AS legs, ROUND(SUM(s.cost), 2) AS freight,
       COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
INNER JOIN refunds r ON r.order_id = o.id
GROUP BY s.carrier
ORDER BY s.carrier`);
q("cs-286 refunds on never-dispatched orders (ghost side)", `
SELECT r.id, r.order_id, r.amount, r.reason FROM refunds r
LEFT JOIN shipments s ON s.order_id = r.order_id
WHERE s.id IS NULL`);
q("cs-286 refunds on in-transit legs", `
SELECT s.carrier, COUNT(r.id) n, ROUND(SUM(r.amount),2) amt FROM refunds r
JOIN shipments s ON s.order_id = r.order_id
WHERE s.delivered_at IS NULL GROUP BY s.carrier`);
q("cs-286 reversed: refunds->orders->shipments per carrier with ghosts", `
SELECT s.carrier, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN orders o ON o.id = r.order_id
LEFT JOIN shipments s ON s.order_id = o.id
GROUP BY s.carrier
ORDER BY s.carrier`);

// ---- cs-287 (funnel): orders per acquisition channel, acquisitions->customers->orders
q("cs-287 fill: per channel orders COUNT(*) vs COUNT(DISTINCT o.id) vs spend", `
SELECT a.channel, COUNT(*) AS joined_rows, COUNT(DISTINCT o.id) AS orders,
       ROUND(SUM(a.spend), 2) AS spend
FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
GROUP BY a.channel
ORDER BY a.channel`);
q("cs-287 per channel settled-money (bonus context)", `
SELECT a.channel, COUNT(DISTINCT o.id) AS orders, ROUND(SUM(o.total),2) AS book
FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
GROUP BY a.channel ORDER BY a.channel`);
q("cs-287 Alice Chen acquisitions + orders", `
SELECT a.id, a.customer_id, a.channel, a.spend, a.acquired_at FROM acquisitions a
JOIN customers c ON c.id = a.customer_id WHERE c.name = 'Alice Chen'`);
q("cs-287 Alice Chen orders", `SELECT id, status, total FROM orders WHERE customer_id = (SELECT id FROM customers WHERE name='Alice Chen')`);
q("cs-287 total rows naive", `
SELECT COUNT(*) AS naive_rows FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id`);
q("cs-287 customers with no acquisition (ghost check)", `
SELECT c.name FROM customers c LEFT JOIN acquisitions a ON a.customer_id = c.id WHERE a.id IS NULL`);

// ---- cs-288 (supplier): refund claims per supplier, 4-JOIN chain
q("cs-288 fill: distinct refund claims per supplier", `
SELECT s.name, COUNT(r.id) AS joined_claims, COUNT(DISTINCT r.id) AS claims
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN refunds r ON r.order_id = o.id
GROUP BY s.id
ORDER BY s.name`);
q("cs-288 same with SUM(r.amount) multiplied vs distinct-order dedupe", `
SELECT s.name, ROUND(SUM(r.amount), 2) AS multiplied_money
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN refunds r ON r.order_id = o.id
GROUP BY s.id
ORDER BY s.name`);
q("cs-288 honest refunded money per supplier (dedupe by order)", `
SELECT s.name, COUNT(DISTINCT r.id) AS claims, ROUND(SUM(DISTINCT 0),2) AS dummy
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN refunds r ON r.order_id = o.id
GROUP BY s.id ORDER BY s.name`);
q("cs-288 suppliers full roster", `SELECT id, name, region, rating FROM suppliers ORDER BY id`);

// ---- cs-289 (pricing): charged line revenue per category, region arm
q("cs-289 per-category charged revenue (chain oi->products + oi->orders->customers)", `
SELECT p.category, COUNT(oi.id) AS lines, ROUND(SUM(oi.unit_price * oi.quantity), 2) AS charged
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'EU'
GROUP BY p.category
ORDER BY charged DESC`);
q("cs-289 same for APAC", `
SELECT p.category, COUNT(oi.id) AS lines, ROUND(SUM(oi.unit_price * oi.quantity), 2) AS charged
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'APAC'
GROUP BY p.category
ORDER BY charged DESC`);
q("cs-289 same for US", `
SELECT p.category, COUNT(oi.id) AS lines, ROUND(SUM(oi.unit_price * oi.quantity), 2) AS charged
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'US'
GROUP BY p.category
ORDER BY charged DESC`);
q("cs-289 same for LATAM", `
SELECT p.category, COUNT(oi.id) AS lines, ROUND(SUM(oi.unit_price * oi.quantity), 2) AS charged
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'LATAM'
GROUP BY p.category
ORDER BY charged DESC`);
q("cs-289 catalog-price variant EU (p.price vs unit_price)", `
SELECT p.category, ROUND(SUM(p.price * oi.quantity), 2) AS catalog_value
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'EU'
GROUP BY p.category ORDER BY catalog_value DESC`);

// ---- cs-290 (people-ops): late_delivery money per rep, refunds->orders->customers + refunds->employees
q("cs-290 fill: per-rep late_delivery claims with region detail", `
SELECT e.name, e.role, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN employees e ON e.id = r.processed_by
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'late_delivery'
GROUP BY e.id
ORDER BY refunded DESC`);
q("cs-290 all-reasons per rep (context)", `
SELECT e.name, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r JOIN employees e ON e.id = r.processed_by
GROUP BY e.id ORDER BY e.name`);
q("cs-290 late_delivery rows in full", `
SELECT r.id, r.order_id, r.amount, r.refunded_at, r.processed_by, c.name AS buyer, c.region
FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'late_delivery' ORDER BY r.id`);
q("cs-290 damaged per rep", `
SELECT e.name, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN employees e ON e.id = r.processed_by
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'damaged'
GROUP BY e.id ORDER BY refunded DESC`);

// ---- cs-291 (fraud): double-refunded tickets through the chain
q("cs-291 fill: tickets refunded more than once", `
SELECT o.id, c.name, o.status, o.total, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
GROUP BY o.id
HAVING COUNT(r.id) > 1
ORDER BY o.id`);
q("cs-291 threshold 2 variant", `
SELECT o.id, c.name, COUNT(r.id) AS claims FROM refunds r
JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
GROUP BY o.id HAVING COUNT(r.id) > 2`);
q("cs-291 HAVING = 1", `
SELECT COUNT(*) AS single_refund_tickets FROM (
SELECT o.id FROM refunds r JOIN orders o ON o.id = r.order_id GROUP BY o.id HAVING COUNT(r.id) = 1)`);
q("cs-291 all refunded orders", `
SELECT o.id, c.name, o.status, o.total, COUNT(r.id) AS claims, ROUND(SUM(r.amount),2) AS refunded
FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
GROUP BY o.id ORDER BY o.id`);

// ---- alternative fraud: settled money on never-shipped tickets (payments->orders->shipments)
q("alt-fraud: settled money per carrier incl never-shipped ghost", `
SELECT s.carrier, COUNT(p.id) AS payments, ROUND(SUM(p.amount), 2) AS settled
FROM payments p
JOIN orders o ON o.id = p.order_id
LEFT JOIN shipments s ON s.order_id = o.id
WHERE p.status = 'settled'
GROUP BY s.carrier
ORDER BY settled DESC`);
q("alt-fraud: settled payments on orders with no shipment row", `
SELECT o.id, c.name, o.status, o.total, p.method, p.amount
FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id
LEFT JOIN shipments s ON s.order_id = o.id
WHERE p.status = 'settled' AND s.id IS NULL`);

// ---- id-space collisions relevant to my chains (recheck on live copy)
q("collisions: o.id = c.id pairs", `SELECT COUNT(*) n FROM orders o JOIN customers c ON c.id = o.id`);
q("collisions: p.id = o.id pairs", `SELECT COUNT(*) n FROM payments p JOIN orders o ON o.id = p.id`);
q("collisions: r.id = o.id pairs", `SELECT COUNT(*) n FROM refunds r JOIN orders o ON o.id = r.id`);
q("collisions: s.id = o.id pairs", `SELECT COUNT(*) n FROM shipments s JOIN orders o ON o.id = s.id`);
q("collisions: a.id = c.id pairs", `SELECT COUNT(*) n FROM acquisitions a JOIN customers c ON c.id = a.id`);
q("collisions: oi.id = o.id pairs", `SELECT COUNT(*) n FROM order_items oi JOIN orders o ON o.id = oi.id`);
q("collisions: e.id = r.processed_by ids", `SELECT COUNT(*) n FROM refunds r JOIN employees e ON e.id = r.id`);

db.close();
console.log("\nprobe-j8b1 done");
