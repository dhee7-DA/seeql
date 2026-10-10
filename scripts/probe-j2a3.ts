/// <reference types="bun-types" />
// j2a probe 3 — exact correct fills for all 8 cases + cs-234 shape decision.

import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-j2a.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`\n== ${label} == (${rows.length} rows)`);
    console.log(JSON.stringify(rows.slice(0, 20)));
  } catch (e) {
    console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : e}`);
  }
}

// --- cs-232 exact count + value
q("cs-232 correct", `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN refunds r ON r.order_id = o.id
WHERE o.status = 'delivered'
GROUP BY o.id
HAVING COUNT(r.id) = 0
ORDER BY o.total DESC`);
q("cs-232 total value", `SELECT ROUND(SUM(total),2) v, COUNT(*) n FROM (
  SELECT o.total FROM orders o
  LEFT JOIN refunds r ON r.order_id = o.id
  WHERE o.status = 'delivered'
  GROUP BY o.id HAVING COUNT(r.id) = 0) sub`);
// how many delivered orders DO have refunds (for prose)
q("delivered orders with refunds", `SELECT COUNT(DISTINCT r.order_id) n FROM refunds r
  JOIN orders o ON o.id = r.order_id WHERE o.status = 'delivered'`);

// --- cs-234 exact query + variants
q("cs-234 correct (cancelled chain)", `SELECT p.name, COUNT(o.id) AS cancelled_lines
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'cancelled'
GROUP BY p.id
ORDER BY cancelled_lines DESC, p.name`);
q("cs-234 INNER variant", `SELECT COUNT(*) n FROM (
  SELECT p.name FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  INNER JOIN orders o ON o.id = oi.order_id AND o.status = 'cancelled'
  GROUP BY p.id) sub`);
q("cs-234 'delivered' variant", `SELECT COUNT(*) n FROM (
  SELECT p.name, COUNT(o.id) c FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'delivered'
  GROUP BY p.id HAVING c = 0) sub`);
q("cs-234 'shipped' variant", `SELECT COUNT(*) n FROM (
  SELECT p.name, COUNT(o.id) c FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'shipped'
  GROUP BY p.id HAVING c = 0) sub`);
q("cs-234 sum of cancelled lines", `SELECT COUNT(*) n FROM refunds r JOIN orders o ON o.id = r.order_id WHERE o.status='cancelled'`);
q("cs-234 cancelled order lines", `SELECT COUNT(*) n FROM order_items oi
  JOIN orders o ON o.id = oi.order_id WHERE o.status = 'cancelled'`);
q("cs-234 SUM variant rows", `SELECT p.name, SUM(o.id) s FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'cancelled'
  GROUP BY p.id ORDER BY p.id LIMIT 6`);
q("cs-234 ASC variant first rows", `SELECT p.name, COUNT(o.id) c FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'cancelled'
  GROUP BY p.id ORDER BY c ASC, p.name LIMIT 4`);

// --- exact correct fills for remaining cases (execution check)
q("cs-227 correct", `SELECT o.id, c.name, o.total, o.status
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments p ON p.order_id = o.id
WHERE p.id IS NULL
ORDER BY o.total DESC`);
q("cs-228 correct", `SELECT o.id, o.status, s.carrier, s.cost
FROM orders o
LEFT JOIN shipments s ON s.order_id = o.id
WHERE s.delivered_at IS NULL
ORDER BY o.total DESC`);
q("cs-229 correct", `SELECT e.name, e.role, COUNT(r.id) AS refunds_processed
FROM employees e
LEFT JOIN refunds r ON r.processed_by = e.id
GROUP BY e.id
ORDER BY refunds_processed DESC, e.name`);
q("cs-230 correct", `SELECT o.id, c.name, o.total, p.status
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
WHERE o.status = 'delivered' AND p.id IS NULL
ORDER BY o.total DESC`);
q("cs-231 correct", `SELECT c.name, a.spend, a.acquired_at
FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'email'
ORDER BY c.name`);
q("cs-233 correct", `SELECT a.id, a.channel, a.spend, c.name
FROM acquisitions a
LEFT JOIN customers c ON a.customer_id = c.id AND c.active = 1
ORDER BY a.id`);

// --- distractor dry-runs flagged risky
q("cs-234 COUNT(*) vs COUNT(o.id) same-zero check", `SELECT COUNT(*) n FROM (
  SELECT p.name FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'cancelled'
  GROUP BY p.id HAVING COUNT(*) = 0) sub`);
q("cs-228 o.customer_id = o.id rows", `SELECT COUNT(*) n FROM orders o
  LEFT JOIN shipments s ON o.customer_id = o.id
  WHERE s.delivered_at IS NULL`);
q("cs-228 s.id = o.id rows", `SELECT COUNT(*) n FROM orders o
  LEFT JOIN shipments s ON s.id = o.id
  WHERE s.delivered_at IS NULL`);
q("cs-227 p.id IS o.id rows", `SELECT COUNT(*) n FROM orders o
  JOIN customers c ON c.id = o.customer_id
  LEFT JOIN payments p ON p.order_id = o.id
  WHERE p.id IS o.id`);
q("cs-227 o.customer_id IS NULL rows", `SELECT COUNT(*) n FROM orders o
  JOIN customers c ON c.id = o.customer_id
  LEFT JOIN payments p ON p.order_id = o.id
  WHERE o.customer_id IS NULL`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe3 done, copy removed");
