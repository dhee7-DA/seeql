/// <reference types="bun-types" />
// j2a probe — verify every figure before authoring cs-227..cs-234 (topic j2 LEFT JOIN).
// Copies db/custom.db to a readonly scratch copy, queries it, deletes the copy.

import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-j2a.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`\n== ${label} ==`);
    console.log(JSON.stringify(rows));
  } catch (e) {
    console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : e}`);
  }
}

// --- baseline counts
q("table counts", `SELECT
  (SELECT COUNT(*) FROM customers) customers,
  (SELECT COUNT(*) FROM orders) orders,
  (SELECT COUNT(*) FROM order_items) order_items,
  (SELECT COUNT(*) FROM payments) payments,
  (SELECT COUNT(*) FROM refunds) refunds,
  (SELECT COUNT(*) FROM shipments) shipments,
  (SELECT COUNT(*) FROM acquisitions) acquisitions,
  (SELECT COUNT(*) FROM employees) employees`);

// --- cs-227: orders with no payment row at all (anti-join LEFT + IS NULL)
q("orders w/ no payment row (anti-join)", `SELECT o.id, c.name, o.total, o.status
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments p ON p.order_id = o.id
WHERE p.id IS NULL
ORDER BY o.id`);
q("count no-payment orders + total value", `SELECT COUNT(*) n, ROUND(SUM(o.total),2) v
FROM orders o
LEFT JOIN payments p ON p.order_id = o.id
WHERE p.id IS NULL`);
q("no-payment orders by status", `SELECT o.status, COUNT(*) n FROM orders o
LEFT JOIN payments p ON p.order_id = o.id WHERE p.id IS NULL GROUP BY o.status`);
// distractor: p.id = o.id id-collision rule
q("DISTRACTOR p.id = o.id (no-payment query)", `SELECT COUNT(*) FROM orders o
LEFT JOIN payments p ON p.id = o.id WHERE p.id IS NULL`);
q("DISTRACTOR o.customer_id = o.id (no-payment)", `SELECT COUNT(*) FROM orders o
LEFT JOIN payments p ON p.order_id = o.customer_id WHERE p.id IS NULL`);
q("DISTRACTOR INNER (no-payment)", `SELECT COUNT(*) FROM orders o
JOIN payments p ON p.order_id = o.id WHERE p.id IS NULL`);
q("payment ids contiguous?", `SELECT MIN(id) mn, MAX(id) mx, COUNT(DISTINCT id) n FROM payments`);

// --- cs-228: orders with no delivery scan (never shipped + in transit)
q("orders w/ no delivery scan (44?)", `SELECT COUNT(*) n FROM orders o
LEFT JOIN shipments s ON s.order_id = o.id
WHERE s.delivered_at IS NULL`);
q("no-delivery-scan by status", `SELECT o.status, COUNT(*) n FROM orders o
LEFT JOIN shipments s ON s.order_id = o.id
WHERE s.delivered_at IS NULL GROUP BY o.status`);
q("DISTRACTOR AND (arm-filter) version rows", `SELECT COUNT(*) n FROM orders o
LEFT JOIN shipments s ON s.order_id = o.id AND s.delivered_at IS NULL`);
q("DISTRACTOR IS NOT NULL version rows", `SELECT COUNT(*) n FROM orders o
LEFT JOIN shipments s ON s.order_id = o.id
WHERE s.delivered_at IS NOT NULL`);
q("DISTRACTOR = NULL version rows", `SELECT COUNT(*) n FROM orders o
LEFT JOIN shipments s ON s.order_id = o.id
WHERE s.delivered_at = NULL`);
q("never shipped (no shipment row)", `SELECT COUNT(*) n FROM orders o
LEFT JOIN shipments s ON s.order_id = o.id WHERE s.id IS NULL`);
q("in transit (matched, delivered_at NULL)", `SELECT COUNT(*) n FROM shipments s WHERE s.delivered_at IS NULL`);
q("top costs in no-delivery-scan list", `SELECT o.id, o.status, s.carrier, s.cost, o.total
FROM orders o LEFT JOIN shipments s ON s.order_id = o.id
WHERE s.delivered_at IS NULL ORDER BY o.total DESC LIMIT 5`);

// --- cs-229: per-employee refund counts incl. zeros
q("per-employee refund counts (LEFT)", `SELECT e.id, e.name, e.role, COUNT(r.id) n, ROUND(COALESCE(SUM(r.amount),0),2) total
FROM employees e
LEFT JOIN refunds r ON r.processed_by = e.id
GROUP BY e.id ORDER BY n DESC, e.id`);
q("zero-refund employees", `SELECT e.name, e.role FROM employees e
LEFT JOIN refunds r ON r.processed_by = e.id
GROUP BY e.id HAVING COUNT(r.id) = 0`);
q("DISTRACTOR COUNT(*) per employee (top)", `SELECT e.name, COUNT(*) n FROM employees e
LEFT JOIN refunds r ON r.processed_by = e.id GROUP BY e.id ORDER BY n DESC, e.id LIMIT 6`);
q("DISTRACTOR SUM(r.id) runs?", `SELECT e.name, SUM(r.id) s FROM employees e
LEFT JOIN refunds r ON r.processed_by = e.id GROUP BY e.id ORDER BY s DESC LIMIT 3`);
q("DISTRACTOR INNER join employee count rows", `SELECT COUNT(*) FROM refunds r JOIN employees e ON r.processed_by = e.id`);
q("DISTRACTOR r.order_id = e.id matches?", `SELECT COUNT(*) FROM employees e
LEFT JOIN refunds r ON r.order_id = e.id`);

// --- cs-230: delivered orders with no settled payment (arm-filter in ON)
q("delivered w/ no settled payment (arm-filter)", `SELECT o.id, o.total, p.status
FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
WHERE o.status = 'delivered' AND p.id IS NULL
ORDER BY o.id`);
q("delivered w/ no settled payment count+value", `SELECT COUNT(*) n, ROUND(SUM(o.total),2) v FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
WHERE o.status = 'delivered' AND p.id IS NULL`);
q("DISTRACTOR WHERE placement (same pred)", `SELECT COUNT(*) FROM orders o
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.status = 'delivered' AND p.status = 'settled' AND p.id IS NULL`);
q("DISTRACTOR arm literal 'pending'", `SELECT COUNT(*) FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'pending'
WHERE o.status = 'delivered' AND p.id IS NULL`);
q("delivered+pending-only orders", `SELECT o.id, o.total FROM orders o
JOIN payments p ON p.order_id = o.id
WHERE o.status = 'delivered' AND p.status = 'pending'
AND NOT EXISTS (SELECT 1 FROM payments q WHERE q.order_id = o.id AND q.status = 'settled')`);

// --- cs-231: customers LEFT JOIN acquisitions, email touches (AND vs WHERE)
q("customers x email acquisitions (arm-filter)", `SELECT c.name, a.channel, a.spend
FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'email'
ORDER BY c.name`);
q("count rows arm-filter version", `SELECT COUNT(*) FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'email'`);
q("WHERE version rows", `SELECT COUNT(*) FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id
WHERE a.channel = 'email'`);
q("email acquisitions list", `SELECT a.id, c.name, a.spend FROM acquisitions a JOIN customers c ON c.id = a.customer_id WHERE a.channel = 'email' ORDER BY a.spend DESC`);
q("channel mix", `SELECT channel, COUNT(*) n FROM acquisitions GROUP BY channel ORDER BY n DESC`);
q("DISTRACTOR OR in ON", `SELECT COUNT(*) FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id OR a.channel = 'email'`);
q("DISTRACTOR c.id = c.id fanout", `SELECT COUNT(*) FROM customers c
LEFT JOIN acquisitions a ON c.id = c.id`);
q("DISTRACTOR a.id collision", `SELECT COUNT(*) FROM customers c
LEFT JOIN acquisitions a ON a.id = c.id`);
q("DISTRACTOR 'referral' literal arm", `SELECT COUNT(*) FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'referral'`);

// --- cs-232 candidates: zeros lists on other left tables
q("products with zero order lines", `SELECT p.name FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id GROUP BY p.id HAVING COUNT(oi.id) = 0`);
q("suppliers with zero products", `SELECT s.name FROM suppliers s
LEFT JOIN products p ON p.supplier_id = s.id GROUP BY s.id HAVING COUNT(p.id) = 0`);
q("customers with zero orders", `SELECT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(o.id) = 0`);
q("delivered orders with zero refunds", `SELECT COUNT(*) n, ROUND(SUM(o.total),2) v FROM orders o
LEFT JOIN refunds r ON r.order_id = o.id
WHERE o.status = 'delivered'
GROUP BY o.status HAVING COUNT(r.id) = 0`);
q("delivered zero-refund sample", `SELECT o.id, c.name, o.total FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN refunds r ON r.order_id = o.id
WHERE o.status = 'delivered'
GROUP BY o.id HAVING COUNT(r.id) = 0 ORDER BY o.total DESC LIMIT 6`);
q("all orders zero-refund count", `SELECT COUNT(*) FROM (SELECT o.id FROM orders o
LEFT JOIN refunds r ON r.order_id = o.id GROUP BY o.id HAVING COUNT(r.id) = 0)`);

// --- cs-233: acquisitions LEFT JOIN customers, active filter (WHERE vs ON)
q("acquisitions w/ arm active=1 (ON version)", `SELECT a.id, a.channel, a.spend, c.name, c.active
FROM acquisitions a
LEFT JOIN customers c ON a.customer_id = c.id AND c.active = 1
ORDER BY a.id`);
q("acquisitions for inactive customers", `SELECT a.id, a.channel, a.spend, c.name, c.active
FROM acquisitions a JOIN customers c ON c.id = a.customer_id WHERE c.active = 0`);
q("DISTRACTOR WHERE c.active=1", `SELECT COUNT(*) FROM acquisitions a
LEFT JOIN customers c ON a.customer_id = c.id
WHERE c.active = 1`);
q("DISTRACTOR INNER", `SELECT COUNT(*) FROM acquisitions a
JOIN customers c ON a.customer_id = c.id AND c.active = 1`);
q("DISTRACTOR c.active=0 arm", `SELECT COUNT(*) FROM acquisitions a
LEFT JOIN customers c ON a.customer_id = c.id AND c.active = 0 WHERE c.name IS NOT NULL`);
q("DISTRACTOR a.id=c.id collision", `SELECT COUNT(*) FROM acquisitions a
LEFT JOIN customers c ON a.id = c.id AND c.active = 1`);

// --- cs-234 candidates: products-left with ghosts
q("products w/ zero delivered-order lines (chain)", `SELECT p.name, COUNT(o.id) n FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'delivered'
GROUP BY p.id ORDER BY n, p.id`);
q("products w/ zero lines on delivered (alt shape)", `SELECT p.name FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'delivered'
GROUP BY p.id HAVING COUNT(o.id) = 0`);
q("per-product delivered line counts", `SELECT p.name, COUNT(o.id) n FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'delivered'
GROUP BY p.id ORDER BY n DESC, p.id`);

// --- misc verification of known facts
q("employees roster", `SELECT id, name, role, manager_id, region FROM employees ORDER BY id`);
q("order statuses", `SELECT status, COUNT(*) n FROM orders GROUP BY status`);
q("settled payments total", `SELECT COUNT(*), ROUND(SUM(amount),2) FROM payments WHERE status='settled'`);
q("no-payment order ids", `SELECT o.id FROM orders o LEFT JOIN payments p ON p.order_id = o.id WHERE p.id IS NULL ORDER BY o.id`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
