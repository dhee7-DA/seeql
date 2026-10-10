/// <reference types="bun-types" />
// probe-j8a — batch-4 corridor discovery for topic j4 (multi-table chains),
// cs-276..cs-283. Runs against a READ-ONLY COPY of the seed db
// (scripts/.tmp-j8a.db, copied from project root). Never opens db/custom.db.
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

// ---- A. baseline counts ------------------------------------------------------
q("counts", `SELECT (SELECT COUNT(*) FROM customers) customers, (SELECT COUNT(*) FROM suppliers) suppliers,
 (SELECT COUNT(*) FROM products) products, (SELECT COUNT(*) FROM orders) orders,
 (SELECT COUNT(*) FROM order_items) order_items, (SELECT COUNT(*) FROM employees) employees,
 (SELECT COUNT(*) FROM payments) payments, (SELECT COUNT(*) FROM refunds) refunds,
 (SELECT COUNT(*) FROM shipments) shipments, (SELECT COUNT(*) FROM acquisitions) acquisitions`);

// ---- B. cs-276: one customer's supplier bench (5-table chain) ----------------
q("B Emma Wilson identity", `SELECT id, name, city, region FROM customers WHERE name = 'Emma Wilson'`);
q("B Emma orders", `SELECT COUNT(*) n, SUM(total) v FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.name='Emma Wilson'`);
q("B Emma lines", `SELECT COUNT(*) n FROM customers c JOIN orders o ON o.customer_id=c.id JOIN order_items oi ON oi.order_id=o.id WHERE c.name='Emma Wilson'`);
q("B Emma supplier bench (FILL draft)", `SELECT s.name, s.region
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
WHERE c.name = 'Emma Wilson'
GROUP BY s.id ORDER BY s.name`);
q("B Emma full-join row count (fan-out)", `SELECT COUNT(*) n FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
WHERE c.name = 'Emma Wilson'`);
q("B Emma per-supplier line counts", `SELECT s.name, COUNT(*) lines, COUNT(DISTINCT o.id) tickets
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
WHERE c.name = 'Emma Wilson' GROUP BY s.id ORDER BY s.name`);
q("B Emma bench by c.id filter", `SELECT COUNT(DISTINCT s.id) n FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id WHERE c.id = 1`);
// collision distractor probes for the far link
q("B far-link s.id = p.id", `SELECT COUNT(DISTINCT s.id) n FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.id
WHERE c.name = 'Emma Wilson'`);
q("B far-link s.id = oi.id", `SELECT COUNT(DISTINCT s.id) n FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = oi.id
WHERE c.name = 'Emma Wilson'`);
q("B line-link oi.id = o.id (collision)", `SELECT COUNT(*) n FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
WHERE c.name = 'Emma Wilson'`);
q("B prod-link p.id = oi.id (collision)", `SELECT COUNT(*) n FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.id
JOIN suppliers s ON s.id = p.supplier_id
WHERE c.name = 'Emma Wilson'`);
q("B cust-link o.id = c.id (collision)", `SELECT COUNT(*) n FROM customers c
JOIN orders o ON o.id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
WHERE c.name = 'Emma Wilson'`);
q("B which suppliers does each region-16 customer touch (for walkthrough)", `SELECT c.name, COUNT(DISTINCT s.id) suppliers, COUNT(DISTINCT o.id) tickets, COUNT(*) lines
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
GROUP BY c.id ORDER BY c.name`);

// ---- C. cs-277: EU demand per supplier (reverse 5-table chain) ---------------
q("C per-supplier EU lines vs tickets", `SELECT s.name, COUNT(*) lines, COUNT(DISTINCT o.id) tickets
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'EU'
GROUP BY s.id ORDER BY s.name`);
q("C per-supplier ALL-region lines vs tickets", `SELECT s.name, COUNT(*) lines, COUNT(DISTINCT o.id) tickets
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
GROUP BY s.id ORDER BY s.name`);
q("C EU value per supplier", `SELECT s.name, ROUND(SUM(oi.unit_price*oi.quantity),2) v
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region='EU' GROUP BY s.id ORDER BY s.name`);
q("C region variants (tickets per supplier)", `SELECT c.region, COUNT(DISTINCT s.id) suppliers_touched FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
GROUP BY c.region`);
q("C EU buyers", `SELECT c.name, COUNT(*) lines FROM customers c JOIN orders o ON o.customer_id=c.id JOIN order_items oi ON oi.order_id=o.id WHERE c.region='EU' GROUP BY c.id`);
q("C EU distractor 'US' per-supplier tickets", `SELECT s.name, COUNT(DISTINCT o.id) tickets FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'US' GROUP BY s.id ORDER BY s.name`);
q("C 'LATAM' variant", `SELECT s.name, COUNT(DISTINCT o.id) tickets FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'LATAM' GROUP BY s.id ORDER BY s.name`);

// ---- D. cs-278: employee attribution chain (employees→refunds→orders→customers)
q("D employees roster", `SELECT id, name, role FROM employees ORDER BY id`);
q("D Ingrid refunds", `SELECT r.id, r.order_id, r.amount, r.reason FROM refunds r JOIN employees e ON e.id = r.processed_by WHERE e.name='Ingrid Larsen' ORDER BY r.id`);
q("D Ingrid claimed customers (FILL draft)", `SELECT c.name, c.region
FROM employees e
JOIN refunds r ON r.processed_by = e.id
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE e.name = 'Ingrid Larsen'
GROUP BY c.id ORDER BY c.name`);
q("D Ingrid raw rows (fan-out)", `SELECT COUNT(*) n FROM employees e
JOIN refunds r ON r.processed_by = e.id
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE e.name = 'Ingrid Larsen'`);
q("D collision r.id = e.id chain", `SELECT e.name, c.name FROM employees e
JOIN refunds r ON r.id = e.id
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id`);
q("D collision r.order_id = e.id", `SELECT COUNT(*) n FROM employees e
JOIN refunds r ON r.order_id = e.id
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id`);
q("D collision o.customer_id = e.id mid-chain", `SELECT COUNT(*) n FROM employees e
JOIN refunds r ON r.processed_by = e.id
JOIN orders o ON o.customer_id = e.id
JOIN customers c ON c.id = o.customer_id`);
q("D per-processor claimed customers", `SELECT e.name, COUNT(DISTINCT c.id) customers, COUNT(DISTINCT r.id) claims
FROM employees e
JOIN refunds r ON r.processed_by = e.id
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
GROUP BY e.id ORDER BY e.name`);
q("D rep-arm (role='rep') claimed customers", `SELECT e.name, COUNT(DISTINCT c.id) customers
FROM employees e
JOIN refunds r ON r.processed_by = e.id
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE e.role = 'rep' GROUP BY e.id ORDER BY e.name`);

// ---- E. cs-279: settled cash per acquisition channel -------------------------
q("E channel settled cash (FILL draft)", `SELECT a.channel, ROUND(SUM(p.amount),2) cash
FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
JOIN payments p ON p.order_id = o.id
WHERE p.status = 'settled'
GROUP BY a.channel ORDER BY a.channel`);
q("E channel settled cash + ticket count", `SELECT a.channel, ROUND(SUM(p.amount),2) cash, COUNT(p.id) pay_rows
FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
JOIN payments p ON p.order_id = o.id
WHERE p.status = 'settled'
GROUP BY a.channel ORDER BY a.channel`);
q("E organics settled cash", `SELECT c.name, ROUND(SUM(p.amount),2) cash
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN payments p ON p.order_id = o.id
WHERE p.status='settled' AND c.name IN ('Noah Meyer','Pedro Alvarez')
GROUP BY c.id`);
q("E all-channel total", `SELECT ROUND(SUM(p.amount),2) v FROM payments p WHERE p.status='settled'`);
q("E 'pending' arm variant", `SELECT a.channel, ROUND(SUM(p.amount),2) cash
FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
JOIN payments p ON p.order_id = o.id
WHERE p.status = 'pending'
GROUP BY a.channel ORDER BY a.channel`);
q("E collision a.id = c.id", `SELECT a.channel, ROUND(SUM(p.amount),2) cash
FROM acquisitions a
JOIN customers c ON c.id = a.id
JOIN orders o ON o.customer_id = c.id
JOIN payments p ON p.order_id = o.id
WHERE p.status = 'settled'
GROUP BY a.channel ORDER BY a.channel`);
q("E collision a.customer_id = o.customer_id without customers", `SELECT COUNT(*) n FROM acquisitions a
JOIN orders o ON o.customer_id = a.customer_id
JOIN payments p ON p.order_id = o.id
WHERE p.status='settled'`);
q("E collision o.customer_id = c.id becomes o.id = c.id", `SELECT a.channel, ROUND(SUM(p.amount),2) cash
FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.id = c.id
JOIN payments p ON p.order_id = o.id
WHERE p.status = 'settled'
GROUP BY a.channel ORDER BY a.channel`);
q("E collision p.order_id = o.id becomes p.id = o.id", `SELECT a.channel, ROUND(SUM(p.amount),2) cash
FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
JOIN payments p ON p.id = o.id
WHERE p.status = 'settled'
GROUP BY a.channel ORDER BY a.channel`);
q("E SUM(o.total) variant per channel", `SELECT a.channel, ROUND(SUM(o.total),2) v
FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
JOIN payments p ON p.order_id = o.id
WHERE p.status = 'settled'
GROUP BY a.channel ORDER BY a.channel`);
q("E acquisitions detail", `SELECT a.id, c.name, a.channel, a.spend FROM acquisitions a JOIN customers c ON c.id=a.customer_id ORDER BY a.id`);

// ---- F. cs-280: mispick refunds traced to products ---------------------------
q("F wrong_item claims", `SELECT r.id, r.order_id, r.amount, c.name buyer FROM refunds r JOIN orders o ON o.id=r.order_id JOIN customers c ON c.id=o.customer_id WHERE r.reason='wrong_item' ORDER BY r.id`);
q("F lines on wrong_item orders (FILL draft)", `SELECT r.id claim, o.id ticket, p.name product, oi.quantity, oi.unit_price
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE r.reason = 'wrong_item'
ORDER BY r.id, oi.id`);
q("F collision oi.id = o.id", `SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN order_items oi ON oi.id = o.id
JOIN products p ON p.id = oi.product_id
WHERE r.reason = 'wrong_item'`);
q("F collision oi.id = o.id listing", `SELECT r.id claim, o.id ticket, p.name product
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN order_items oi ON oi.id = o.id
JOIN products p ON p.id = oi.product_id
WHERE r.reason = 'wrong_item'`);
q("F collision p.id = oi.id", `SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.id
WHERE r.reason = 'wrong_item'`);
q("F collision r.id = o.id", `SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE r.reason = 'wrong_item'`);
q("F collision r.order_id = oi.order_id (wrong rule)", `SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN order_items oi ON oi.order_id = r.order_id
JOIN products p ON p.id = oi.product_id
WHERE r.reason = 'wrong_item'`);
q("F 'damaged' arm listing count", `SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE r.reason = 'damaged'`);
q("F 'late_delivery' arm listing count", `SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE r.reason = 'late_delivery'`);
q("F changed_mind arm listing count", `SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE r.reason = 'changed_mind'`);

// ---- G. cs-281: cancelled-line shelf from the fact side ----------------------
q("G cancelled lines listing (FILL draft)", `SELECT o.id ticket, oi.id line, p.name product, s.name supplier, oi.quantity, oi.unit_price
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
WHERE o.status = 'cancelled'
ORDER BY o.id, oi.id`);
q("G cancelled counts", `SELECT COUNT(*) lines, COUNT(DISTINCT o.id) tickets, COUNT(DISTINCT s.id) suppliers, ROUND(SUM(oi.unit_price*oi.quantity),2) value FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
WHERE o.status='cancelled'`);
q("G 'pending' variant", `SELECT COUNT(*) n FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
WHERE o.status='pending'`);
q("G 'delivered' variant", `SELECT COUNT(*) n FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
WHERE o.status='delivered'`);
q("G collision p.id = oi.id listing", `SELECT COUNT(*) n FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.id
JOIN suppliers s ON s.id = p.supplier_id
WHERE o.status='cancelled'`);
q("G collision s.id = p.id", `SELECT COUNT(*) n FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.id
WHERE o.status='cancelled'`);
q("G collision o.id = oi.order_id flip (same)", `SELECT COUNT(*) n FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
WHERE o.status='cancelled'`);
q("G collision oi.product_id = p.supplier_id (skip a table)", `SELECT COUNT(*) n FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = oi.product_id
WHERE o.status='cancelled'`);

db.close();
console.log("\nprobe-j8a done");
