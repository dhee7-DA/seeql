/// <reference types="bun-types" />
// probe-j8a2 — round 2: cs-282 referral cohort, cs-283 pending-on-dispatched,
// plus exact distractor-consequence checks (audit-style full-result comparison)
// for the risky id-collision chips flagged in round 1. Read-only COPY only.
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j8a.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all();
    console.log(`\n== ${label} ==`);
    console.log(JSON.stringify(rows));
  } catch (e) {
    console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// ---- H. cs-282: referral cohort basket (5-table chain, channel start) --------
q("H referral cohort detail", `SELECT a.id, c.name, a.spend FROM acquisitions a JOIN customers c ON c.id = a.customer_id WHERE a.channel = 'referral' ORDER BY a.id`);
q("H referral cohort customers/orders/lines", `SELECT c.name, COUNT(DISTINCT o.id) tickets, COUNT(*) lines
FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE a.channel = 'referral'
GROUP BY c.id ORDER BY c.name`);
q("H referral per-product lines (FILL draft)", `SELECT p.name, COUNT(*) AS lines
FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE a.channel = 'referral'
GROUP BY p.id
ORDER BY p.name`);
q("H referral distinct products", `SELECT COUNT(DISTINCT p.id) n FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE a.channel = 'referral'`);
q("H 'affiliate' variant", `SELECT p.name, COUNT(*) AS lines FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE a.channel = 'affiliate' GROUP BY p.id ORDER BY p.name`);
q("H 'social' variant count", `SELECT COUNT(*) n FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE a.channel = 'social'`);
q("H 'email' variant count", `SELECT COUNT(*) n FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE a.channel = 'email'`);
q("H collision a.id = c.id (full per-product set)", `SELECT p.name, COUNT(*) AS lines FROM acquisitions a
JOIN customers c ON c.id = a.id
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE a.channel = 'referral' GROUP BY p.id ORDER BY p.name`);
q("H collision o.id = c.id count", `SELECT COUNT(*) n FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE a.channel = 'referral'`);
q("H collision oi.id = o.id count", `SELECT COUNT(*) n FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.id = o.id
JOIN products p ON p.id = oi.product_id
WHERE a.channel = 'referral'`);
q("H collision oi.product_id = p.id becomes oi.id = p.id count", `SELECT COUNT(*) n FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.id
WHERE a.channel = 'referral'`);

// ---- I. cs-283: pending money on dispatched orders (3-table chain) -----------
q("I pending payments by order (multi rows?)", `SELECT o.id, COUNT(*) p_rows, ROUND(SUM(p.amount),2) v
FROM payments p JOIN orders o ON o.id = p.order_id
WHERE p.status = 'pending' GROUP BY o.id HAVING COUNT(*) > 1`);
q("I pending on dispatched (FILL draft)", `SELECT p.id, p.amount, o.id AS ticket, s.carrier
FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN shipments s ON s.order_id = o.id
WHERE p.status = 'pending'
ORDER BY p.id`);
q("I pending on dispatched count+money", `SELECT COUNT(*) n, ROUND(SUM(p.amount),2) v FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN shipments s ON s.order_id = o.id
WHERE p.status = 'pending'`);
q("I pending total", `SELECT COUNT(*) n, ROUND(SUM(p.amount),2) v FROM payments p WHERE p.status='pending'`);
q("I 'settled' variant count", `SELECT COUNT(*) n, ROUND(SUM(p.amount),2) v FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN shipments s ON s.order_id = o.id
WHERE p.status = 'settled'`);
q("I 'failed' variant count", `SELECT COUNT(*) n FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN shipments s ON s.order_id = o.id
WHERE p.status = 'failed'`);
q("I unfiltered fan count (all payments x shipments)", `SELECT COUNT(*) n FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN shipments s ON s.order_id = o.id`);
q("I multi-payment orders detail", `SELECT o.id, COUNT(*) p_rows FROM payments p JOIN orders o ON o.id = p.order_id GROUP BY o.id HAVING COUNT(*) > 1`);
q("I collision s.id = o.id (full listing)", `SELECT p.id, p.amount, o.id AS ticket, s.carrier
FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN shipments s ON s.id = o.id
WHERE p.status = 'pending'
ORDER BY p.id`);
q("I collision p.id = o.id count", `SELECT COUNT(*) n FROM payments p
JOIN orders o ON o.id = p.id
JOIN shipments s ON s.order_id = o.id
WHERE p.status = 'pending'`);
q("I pending on never-dispatched (complement)", `SELECT COUNT(*) n, ROUND(SUM(p.amount),2) v FROM payments p
JOIN orders o ON o.id = p.order_id
LEFT JOIN shipments s ON s.order_id = o.id
WHERE p.status = 'pending' AND s.id IS NULL`);

// ---- Extra facts for memos ---------------------------------------------------
q("Alice settled cash", `SELECT ROUND(SUM(p.amount),2) v FROM customers c JOIN orders o ON o.customer_id=c.id JOIN payments p ON p.order_id=o.id WHERE c.name='Alice Chen' AND p.status='settled'`);
q("Alice all payments", `SELECT p.id, p.order_id, p.amount, p.status, p.method FROM payments p JOIN orders o ON o.id=p.order_id JOIN customers c ON c.id=o.customer_id WHERE c.name='Alice Chen' ORDER BY p.id`);
q("employee regions", `SELECT id, name, role, region FROM employees ORDER BY id`);
q("Emma cancelled order detail", `SELECT o.id, o.status, o.total, c.name FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.name='Emma Wilson' AND o.status='cancelled'`);
q("Emma order 82 lines+suppliers", `SELECT oi.id, p.name, s.name FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id JOIN suppliers s ON s.id=p.supplier_id WHERE o.id=82`);
q("cs-276 'delivered' arm bench", `SELECT s.name, COUNT(*) lines FROM customers c
JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
WHERE c.name = 'Emma Wilson' GROUP BY s.id ORDER BY s.name`);
q("cs-276 'cancelled' arm bench", `SELECT s.name, COUNT(*) lines FROM customers c
JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled'
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
WHERE c.name = 'Emma Wilson' GROUP BY s.id ORDER BY s.name`);
q("cs-276 'pending' arm bench", `SELECT s.name, COUNT(*) lines FROM customers c
JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
WHERE c.name = 'Emma Wilson' GROUP BY s.id ORDER BY s.name`);
q("cs-277 'APAC' per-supplier tickets", `SELECT s.name, COUNT(DISTINCT o.id) tickets FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'APAC' GROUP BY s.id ORDER BY s.name`);
q("cs-277 COUNT(o.id) vs DISTINCT set check", `SELECT s.name, COUNT(o.id) lines FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'EU' GROUP BY s.id ORDER BY s.name`);
q("cs-281 collision oi.id = o.id listing", `SELECT p.name, s.name, oi.quantity FROM orders o
JOIN order_items oi ON oi.id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
WHERE o.status='cancelled'`);
q("cs-278 Ingrid collision r.order_id = e.id customer set", `SELECT c.name FROM employees e
JOIN refunds r ON r.order_id = e.id
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE e.name = 'Ingrid Larsen' ORDER BY c.name`);
q("cs-278 role='rep' full set", `SELECT c.name, c.region FROM employees e
JOIN refunds r ON r.processed_by = e.id
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE e.role = 'rep'
GROUP BY c.id ORDER BY c.name`);
q("cs-278 collision r.id = e.id under Ingrid filter", `SELECT c.name, c.region FROM employees e
JOIN refunds r ON r.id = e.id
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE e.name = 'Ingrid Larsen'
GROUP BY c.id ORDER BY c.name`);

db.close();
console.log("\nprobe-j8a2 done");
