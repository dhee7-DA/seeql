/// <reference types="bun-types" />
// j2b probe — verify every figure before authoring cs-235..cs-242 (topic j2 LEFT JOIN).
// Copies db/custom.db to a readonly scratch copy, queries it, deletes the copy.

import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-j2b.db";
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

// --- baseline / known figures re-verified
q("table counts", `SELECT
  (SELECT COUNT(*) FROM customers) customers,
  (SELECT COUNT(*) FROM suppliers) suppliers,
  (SELECT COUNT(*) FROM products) products,
  (SELECT COUNT(*) FROM orders) orders,
  (SELECT COUNT(*) FROM order_items) order_items,
  (SELECT COUNT(*) FROM payments) payments,
  (SELECT COUNT(*) FROM refunds) refunds,
  (SELECT COUNT(*) FROM shipments) shipments,
  (SELECT COUNT(*) FROM acquisitions) acquisitions,
  (SELECT COUNT(*) FROM employees) employees`);
q("pending orders count/value", `SELECT COUNT(*) n, ROUND(SUM(total),2) v FROM orders WHERE status='pending'`);
q("cancelled orders count", `SELECT COUNT(*) n FROM orders WHERE status='cancelled'`);
q("orders w/ no payment row", `SELECT COUNT(*) n, ROUND(SUM(o.total),2) v FROM orders o LEFT JOIN payments p ON p.order_id=o.id WHERE p.id IS NULL`);
q("pending payment rows", `SELECT COUNT(*) n, ROUND(SUM(amount),2) v FROM payments WHERE status='pending'`);
q("orders never shipped", `SELECT COUNT(*) n FROM orders o LEFT JOIN shipments s ON s.order_id=o.id WHERE s.id IS NULL`);
q("shipments in transit", `SELECT COUNT(*) n FROM shipments WHERE delivered_at IS NULL`);
q("employee refund tally incl zeros", `SELECT e.name, COUNT(r.id) n FROM employees e LEFT JOIN refunds r ON r.processed_by=e.id GROUP BY e.id ORDER BY n DESC, e.name`);
q("managers w/ NULL manager_id", `SELECT id, name, role FROM employees WHERE manager_id IS NULL`);
q("zero-refund customers", `SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id=c.id LEFT JOIN refunds r ON r.order_id=o.id GROUP BY c.id HAVING COUNT(r.id)=0`);
q("delivered zero-claim orders", `SELECT COUNT(*) n, ROUND(SUM(o.total),2) v FROM orders o LEFT JOIN refunds r ON r.order_id=o.id WHERE o.status='delivered' GROUP BY o.id HAVING COUNT(r.id)=0`);

// --- cs-235: customers x orders, arm o.status='pending', COUNT(o.id) honesty
q("235 pending count per customer (correct fill)", `SELECT c.name, COUNT(o.id) AS open_tickets
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'
GROUP BY c.id
ORDER BY open_tickets DESC, c.name`);
q("235 COUNT(*) variant", `SELECT c.name, COUNT(*) AS open_tickets
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'
GROUP BY c.id
ORDER BY open_tickets DESC, c.name`);
q("235 COUNT(c.id) variant", `SELECT c.name, COUNT(c.id) AS open_tickets
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'
GROUP BY c.id
ORDER BY open_tickets DESC, c.name`);
q("235 'delivered' arm variant", `SELECT c.name, COUNT(o.id) AS open_tickets
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'
GROUP BY c.id
ORDER BY open_tickets DESC, c.name`);
q("235 INNER variant (row count)", `SELECT COUNT(*) n FROM (
SELECT c.name FROM customers c
JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'
GROUP BY c.id)`);
q("pending ticket value top", `SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.status='pending' ORDER BY o.total DESC`);

// --- cs-236: suppliers x products, arm p.price>=100, count zeros included
q("236 premium counts per supplier (correct fill)", `SELECT s.name, COUNT(p.id) AS premium_items
FROM suppliers s
LEFT JOIN products p ON p.supplier_id = s.id AND p.price >= 100
GROUP BY s.id
ORDER BY premium_items DESC`);
q("236 WHERE-placement variant", `SELECT s.name, COUNT(p.id) AS premium_items
FROM suppliers s
LEFT JOIN products p ON p.supplier_id = s.id
WHERE p.price >= 100
GROUP BY s.id
ORDER BY premium_items DESC`);
q("236 thresholds 50/60/150/200", `SELECT
  (SELECT COUNT(*) FROM products WHERE price>=50) t50,
  (SELECT COUNT(*) FROM products WHERE price>=60) t60,
  (SELECT COUNT(*) FROM products WHERE price>=100) t100,
  (SELECT COUNT(*) FROM products WHERE price>=150) t150,
  (SELECT COUNT(*) FROM products WHERE price>=200) t200`);
q("236 per-supplier @50", `SELECT s.name, COUNT(p.id) n FROM suppliers s LEFT JOIN products p ON p.supplier_id=s.id AND p.price>=50 GROUP BY s.id ORDER BY n DESC, s.name`);
q("236 per-supplier @150", `SELECT s.name, COUNT(p.id) n FROM suppliers s LEFT JOIN products p ON p.supplier_id=s.id AND p.price>=150 GROUP BY s.id ORDER BY n DESC, s.name`);
q("236 supplier catalog sizes", `SELECT s.name, COUNT(p.id) n FROM suppliers s LEFT JOIN products p ON p.supplier_id=s.id GROUP BY s.id ORDER BY n DESC, s.name`);

// --- cs-237: employees x refunds arm reason='damaged', DISTINCT anti-join
q("237 correct fill (DISTINCT zeros list)", `SELECT DISTINCT e.name, e.role
FROM employees e
LEFT JOIN refunds r ON r.processed_by = e.id AND r.reason = 'damaged'
WHERE r.id IS NULL
ORDER BY e.name`);
q("237 ALL variant (duplicate ghosts)", `SELECT ALL e.name, e.role
FROM employees e
LEFT JOIN refunds r ON r.processed_by = e.id AND r.reason = 'damaged'
WHERE r.id IS NULL
ORDER BY e.name`);
q("237 wrong_item zeros", `SELECT DISTINCT e.name FROM employees e LEFT JOIN refunds r ON r.processed_by=e.id AND r.reason='wrong_item' WHERE r.id IS NULL ORDER BY e.name`);
q("237 late_delivery zeros", `SELECT DISTINCT e.name FROM employees e LEFT JOIN refunds r ON r.processed_by=e.id AND r.reason='late_delivery' WHERE r.id IS NULL ORDER BY e.name`);
q("237 damaged per employee", `SELECT e.name, COUNT(r.id) n FROM employees e LEFT JOIN refunds r ON r.processed_by=e.id AND r.reason='damaged' GROUP BY e.id ORDER BY n DESC, e.name`);
q("reason counts", `SELECT reason, COUNT(*) n, ROUND(SUM(amount),2) v FROM refunds GROUP BY reason`);

// --- cs-238: orders x order_items arm unit_price>=100, HAVING COUNT=0
q("238 correct fill (no premium line, top)", `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN order_items oi ON oi.order_id = o.id AND oi.unit_price >= 100
GROUP BY o.id
HAVING COUNT(oi.id) = 0
ORDER BY o.total DESC`);
q("238 count+value of result", `SELECT COUNT(*) n, ROUND(SUM(total),2) v FROM (
SELECT o.id, o.total FROM orders o
LEFT JOIN order_items oi ON oi.order_id=o.id AND oi.unit_price>=100
GROUP BY o.id HAVING COUNT(oi.id)=0)`);
q("238 threshold variants 60/150/200", `SELECT
  (SELECT COUNT(*) FROM (SELECT o.id FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id AND oi.unit_price>=60 GROUP BY o.id HAVING COUNT(oi.id)=0)) t60,
  (SELECT COUNT(*) FROM (SELECT o.id FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id AND oi.unit_price>=150 GROUP BY o.id HAVING COUNT(oi.id)=0)) t150,
  (SELECT COUNT(*) FROM (SELECT o.id FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id AND oi.unit_price>=200 GROUP BY o.id HAVING COUNT(oi.id)=0)) t200`);
q("238 WHERE-placement variant count", `SELECT COUNT(*) n FROM (
SELECT o.id FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE oi.unit_price >= 100
GROUP BY o.id HAVING COUNT(oi.id)=0)`);
q("238 OR-arm variant count", `SELECT COUNT(*) n FROM (
SELECT o.id FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id OR oi.unit_price >= 100
GROUP BY o.id HAVING COUNT(oi.id)=0)`);
q("238 max unit_price", `SELECT MAX(unit_price) mx, MIN(unit_price) mn FROM order_items`);

// --- cs-239: customers x acquisitions pure anti-join (organics)
q("239 correct fill", `SELECT c.name, c.city FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id
WHERE a.id IS NULL
ORDER BY c.name`);
q("239 a.id=c.id coincidence check (match set)", `SELECT a.id, a.customer_id, c.name FROM acquisitions a JOIN customers c ON a.id = c.id`);
q("239 a.id=c.id anti-join result", `SELECT c.name FROM customers c LEFT JOIN acquisitions a ON a.id = c.id WHERE a.id IS NULL ORDER BY c.name`);
q("239 spend NULLs?", `SELECT COUNT(*) n FROM acquisitions WHERE spend IS NULL`);
q("239 acquisition rows", `SELECT a.id, a.customer_id, c.name, a.channel, a.spend FROM acquisitions a JOIN customers c ON a.customer_id=c.id ORDER BY a.id`);
q("239 c.name IS NULL variant", `SELECT COUNT(*) n FROM customers c LEFT JOIN acquisitions a ON a.customer_id=c.id WHERE c.name IS NULL`);

// --- cs-240: orders x payments arm method='card', pending chase lens
q("240 correct fill (pending tickets, card lens)", `SELECT o.id, c.name, p.method, p.amount
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments p ON p.order_id = o.id AND p.method = 'card'
WHERE o.status = 'pending'
ORDER BY o.id`);
q("240 WHERE-placement variant", `SELECT o.id, c.name, p.method, p.amount
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments p ON p.order_id = o.id
WHERE p.method = 'card' AND o.status = 'pending'
ORDER BY o.id`);
q("240 'wallet' arm variant", `SELECT o.id, p.method, p.amount FROM orders o LEFT JOIN payments p ON p.order_id=o.id AND p.method='wallet' WHERE o.status='pending' AND p.id IS NOT NULL ORDER BY o.id`);
q("240 'bank_transfer' arm variant", `SELECT o.id, p.method, p.amount FROM orders o LEFT JOIN payments p ON p.order_id=o.id AND p.method='bank_transfer' WHERE o.status='pending' AND p.id IS NOT NULL ORDER BY o.id`);
q("240 pending payment method mix", `SELECT p.method, COUNT(*) n, ROUND(SUM(p.amount),2) v FROM orders o JOIN payments p ON p.order_id=o.id WHERE o.status='pending' GROUP BY p.method`);
q("240 OR-arm variant", `SELECT o.id, p.method, p.amount FROM orders o LEFT JOIN payments p ON p.order_id=o.id OR p.method='card' WHERE o.status='pending' AND p.id IS NOT NULL ORDER BY o.id`);

// --- cs-241: refunds x employees arm e.role='rep'
q("241 correct fill (blanks = lead-signed)", `SELECT r.id, r.amount, r.reason, e.name
FROM refunds r
LEFT JOIN employees e ON r.processed_by = e.id AND e.role = 'rep'
ORDER BY r.id`);
q("241 INNER variant count", `SELECT COUNT(*) n FROM refunds r JOIN employees e ON r.processed_by=e.id AND e.role='rep'`);
q("241 'lead' arm variant", `SELECT COUNT(*) n FROM refunds r LEFT JOIN employees e ON r.processed_by=e.id AND e.role='lead' WHERE e.id IS NOT NULL`);
q("241 'manager' arm variant", `SELECT COUNT(*) n FROM refunds r LEFT JOIN employees e ON r.processed_by=e.id AND e.role='manager' WHERE e.id IS NOT NULL`);
q("241 r.order_id=e.id collision", `SELECT COUNT(*) n FROM refunds r LEFT JOIN employees e ON r.order_id = e.id AND e.role='rep' WHERE e.id IS NOT NULL`);
q("241 r.order_id=e.id anti result", `SELECT r.id FROM refunds r LEFT JOIN employees e ON r.order_id=e.id AND e.role='rep' WHERE e.id IS NULL ORDER BY r.id`);
q("241 lead-signed refunds", `SELECT r.id, r.amount, r.reason, e.name FROM refunds r JOIN employees e ON r.processed_by=e.id WHERE e.role='lead' ORDER BY r.id`);
q("roles", `SELECT role, COUNT(*) n FROM employees GROUP BY role`);

// --- cs-242: products x suppliers arm rating>=4.5 anti-join
q("242 correct fill (below-the-bar makers)", `SELECT p.name, s.name AS supplier, s.rating
FROM products p
LEFT JOIN suppliers s ON s.id = p.supplier_id AND s.rating >= 4.5
WHERE s.id IS NULL
ORDER BY p.name`);
q("242 ratings", `SELECT id, name, rating FROM suppliers ORDER BY rating DESC`);
q("242 threshold 4.0 variant", `SELECT COUNT(*) n FROM products p LEFT JOIN suppliers s ON s.id=p.supplier_id AND s.rating>=4.0 WHERE s.id IS NULL`);
q("242 4.0 result", `SELECT p.name FROM products p LEFT JOIN suppliers s ON s.id=p.supplier_id AND s.rating>=4.0 WHERE s.id IS NULL ORDER BY p.name`);
q("242 p.id=p.supplier_id collision", `SELECT COUNT(*) n FROM products p LEFT JOIN suppliers s ON p.id = p.supplier_id AND s.rating>=4.5 WHERE s.id IS NULL`);
q("242 s.rating=p.supplier_id collision", `SELECT COUNT(*) n FROM products p LEFT JOIN suppliers s ON s.rating = p.supplier_id AND s.rating>=4.5 WHERE s.id IS NULL`);
q("242 products per supplier", `SELECT s.name, s.rating, COUNT(p.id) n FROM suppliers s LEFT JOIN products p ON p.supplier_id=s.id GROUP BY s.id ORDER BY s.rating DESC`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
