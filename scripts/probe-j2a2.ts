/// <reference types="bun-types" />
// j2a probe 2 — distractor consequences + remaining shape candidates.

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

// --- cs-232: delivered orders with zero refunds (proper GROUP BY o.id)
q("delivered zero-refund count+value", `SELECT COUNT(*) n, ROUND(SUM(o.total),2) v FROM (
  SELECT o.id, o.total FROM orders o
  LEFT JOIN refunds r ON r.order_id = o.id
  WHERE o.status = 'delivered'
  GROUP BY o.id HAVING COUNT(r.id) = 0) x`);
q("delivered zero-refund list top", `SELECT o.id, c.name, o.total FROM orders o
  JOIN customers c ON c.id = o.customer_id
  LEFT JOIN refunds r ON r.order_id = o.id
  WHERE o.status = 'delivered'
  GROUP BY o.id HAVING COUNT(r.id) = 0 ORDER BY o.total DESC LIMIT 8`);
q("shipped zero-refund count (distractor)", `SELECT COUNT(*) n FROM (
  SELECT o.id FROM orders o
  LEFT JOIN refunds r ON r.order_id = o.id
  WHERE o.status = 'shipped'
  GROUP BY o.id HAVING COUNT(r.id) = 0) x`);
q("pending zero-refund count (distractor)", `SELECT COUNT(*) n FROM (
  SELECT o.id FROM orders o
  LEFT JOIN refunds r ON r.order_id = o.id
  WHERE o.status = 'pending'
  GROUP BY o.id HAVING COUNT(r.id) = 0) x`);
q("delivered zero-refund totals unique?", `SELECT o.total, COUNT(*) c FROM (
  SELECT o.id, o.total FROM orders o
  LEFT JOIN refunds r ON r.order_id = o.id
  WHERE o.status = 'delivered'
  GROUP BY o.id HAVING COUNT(r.id) = 0) x GROUP BY o.total HAVING c > 1`);
// distractor r.id = o.id collision in ON
q("cs-232 distractor r.id = o.id", `SELECT COUNT(*) n FROM orders o
  LEFT JOIN refunds r ON r.id = o.id
  WHERE o.status = 'delivered'
  GROUP BY o.id HAVING COUNT(r.id) = 0`);
q("cs-232 distractor o.customer_id = o.id", `SELECT COUNT(*) n FROM orders o
  LEFT JOIN refunds r ON o.customer_id = o.id
  WHERE o.status = 'delivered'
  GROUP BY o.id HAVING COUNT(r.id) = 0`);
q("cs-232 distractor r.processed_by = o.id", `SELECT COUNT(*) n FROM orders o
  LEFT JOIN refunds r ON r.processed_by = o.id
  WHERE o.status = 'delivered'
  GROUP BY o.id HAVING COUNT(r.id) = 0`);

// --- cs-230: shipped-orders distractor + customers of orders 10/52
q("shipped orders w/ no settled payment (distractor)", `SELECT COUNT(*) n FROM orders o
  LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
  WHERE o.status = 'shipped' AND p.id IS NULL`);
q("orders 10/52 customers", `SELECT o.id, c.name, o.total, p.status, p.method FROM orders o
  JOIN customers c ON c.id = o.customer_id
  LEFT JOIN payments p ON p.order_id = o.id
  WHERE o.id IN (10, 52)`);
q("failed payment row", `SELECT p.id, p.order_id, p.amount, p.method, o.status, c.name FROM payments p
  JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id WHERE p.status = 'failed'`);

// --- cs-227: duplicate totals in the 15-row list? + customer tally
q("no-payment dup totals?", `SELECT o.total, COUNT(*) c FROM orders o
  LEFT JOIN payments p ON p.order_id = o.id WHERE p.id IS NULL GROUP BY o.total HAVING c > 1`);
q("no-payment by customer", `SELECT c.name, COUNT(*) n, ROUND(SUM(o.total),2) v FROM orders o
  JOIN customers c ON c.id = o.customer_id
  LEFT JOIN payments p ON p.order_id = o.id WHERE p.id IS NULL GROUP BY c.id ORDER BY v DESC`);

// --- cs-228: dup totals among the 44?
q("no-delivery-scan dup totals?", `SELECT o.total, COUNT(*) c FROM orders o
  LEFT JOIN shipments s ON s.order_id = o.id WHERE s.delivered_at IS NULL GROUP BY o.total HAVING c > 1`);
q("no-delivery-scan status+carrier sample", `SELECT o.id, o.status, s.carrier FROM orders o
  LEFT JOIN shipments s ON s.order_id = o.id WHERE s.delivered_at IS NULL ORDER BY o.id LIMIT 50`);

// --- cs-234 candidates: products-left ghosts via arm filters
q("products w/ zero multi-unit lines (qty>=2)", `SELECT p.name, COUNT(oi.id) n FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.quantity >= 2
  GROUP BY p.id ORDER BY n, p.id`);
q("products w/ zero cancelled-order lines", `SELECT p.name, COUNT(oi.id) n FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'cancelled'
  GROUP BY p.id ORDER BY n, p.id`);
q("products w/ zero shipped-order lines", `SELECT COUNT(*) FROM (
  SELECT p.id FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'shipped'
  GROUP BY p.id HAVING COUNT(o.id) = 0) x`);
q("customers w/ no settled payment anywhere", `SELECT c.name FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id
  LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
  GROUP BY c.id HAVING COUNT(p.id) = 0`);

// --- cs-233: spends equal 1? active values
q("acquisition spend range", `SELECT MIN(spend) mn, MAX(spend) mx FROM acquisitions`);
q("customer active mix", `SELECT active, COUNT(*) n FROM customers GROUP BY active`);
q("cs-233 arm a.spend = 1 rows", `SELECT COUNT(*) n, SUM(c.name IS NULL) blanks FROM acquisitions a
  LEFT JOIN customers c ON a.customer_id = c.id AND a.spend = 1`);
q("cs-233 arm c.id = 1 rows", `SELECT a.id, c.name FROM acquisitions a
  LEFT JOIN customers c ON a.customer_id = c.id AND c.id = 1`);

// --- cs-229: exact result rows for walkthrough; SUM NULL behavior
q("cs-229 correct rows", `SELECT e.name, e.role, COUNT(r.id) n
  FROM employees e
  LEFT JOIN refunds r ON r.processed_by = e.id
  GROUP BY e.id
  ORDER BY COUNT(r.id) DESC, e.name`);
q("cs-229 SUM(r.id) rows", `SELECT e.name, SUM(r.id) s
  FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id
  GROUP BY e.id ORDER BY e.id`);
q("cs-229 e.manager_id ON rows", `SELECT e.name, COUNT(r.id) n
  FROM employees e LEFT JOIN refunds r ON e.manager_id = e.id
  GROUP BY e.id ORDER BY e.id`);
q("cs-229 r.order_id = e.id ON rows", `SELECT e.name, COUNT(r.id) n
  FROM employees e LEFT JOIN refunds r ON r.order_id = e.id
  GROUP BY e.id ORDER BY n DESC, e.id`);

// --- cs-231: full correct + WHERE rows for walkthrough
q("cs-231 correct rows", `SELECT c.name, a.channel, a.spend
  FROM customers c
  LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'email'
  ORDER BY c.name`);
q("cs-231 WHERE rows", `SELECT c.name, a.channel, a.spend
  FROM customers c
  LEFT JOIN acquisitions a ON a.customer_id = c.id
  WHERE a.channel = 'email' ORDER BY c.name`);
q("cs-231 'search' arm rows", `SELECT COUNT(*) n, SUM(a.channel IS NOT NULL) filled FROM customers c
  LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'search'`);
q("cs-231 OR rows", `SELECT COUNT(*) n FROM customers c
  LEFT JOIN acquisitions a ON a.customer_id = c.id OR a.channel = 'email'`);

// --- cs-227: filled result for walkthrough (top rows)
q("cs-227 top rows", `SELECT o.id, c.name, o.total, o.status FROM orders o
  JOIN customers c ON c.id = o.customer_id
  LEFT JOIN payments p ON p.order_id = o.id
  WHERE p.id IS NULL ORDER BY o.total DESC`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe2 done, copy removed");
