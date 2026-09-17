// j7-a probe 1 — customer-axis anti-join corridors (cs-251..258 candidates).
// Runs against a COPY of db/custom.db (scripts/.tmp-j7a.db). Never touches the original.

import { Database } from "bun:sqlite";

const db = new Database(".tmp-j7a.db", { readonly: true });

function q(label: string, sql: string, limit = 40) {
  try {
    const rows = db.query(sql).all();
    const out = rows.length > limit ? rows.slice(0, limit) : rows;
    console.log(`\n== ${label} ==`);
    console.log(JSON.stringify(out));
    if (rows.length > limit) console.log(`(${rows.length} rows total, showing ${limit})`);
  } catch (e) {
    console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// --- baseline
q("customers", `SELECT id, name, city, region, active, created_at FROM customers ORDER BY id`);
q("acquisitions all", `SELECT id, customer_id, channel, spend, acquired_at FROM acquisitions ORDER BY id`);

// --- A/B: status-based customer anti-joins
q("A customers w/ no delivered orders", `
SELECT c.id, c.name, c.active FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'
WHERE o.id IS NULL ORDER BY c.id`);
q("A2 customers w/ no delivered orders (count)", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'
WHERE o.id IS NULL`);
q("B customers w/ no shipped orders", `
SELECT c.id, c.name, c.active FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'
WHERE o.id IS NULL ORDER BY c.id`);
q("C customers w/ no cancelled orders (count)", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled'
WHERE o.id IS NULL`);
q("C2 customers WITH cancelled orders", `
SELECT c.name, COUNT(*) n, SUM(o.total) v FROM customers c
JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled'
GROUP BY c.id ORDER BY v DESC`);
q("D customers w/ no pending orders (count)", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'
WHERE o.id IS NULL`);

// --- order activity context
q("orders per status per customer (delivered/shipped)", `
SELECT c.name,
 SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END) del,
 SUM(CASE WHEN o.status='shipped' THEN 1 ELSE 0 END) shp,
 SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) pnd,
 SUM(CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END) cxl
FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id ORDER BY c.id`);

// --- E/F/G/H/I: payments 3-hop customer anti-joins
q("E no card payments", `
SELECT c.id, c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id AND p.method = 'card'
WHERE p.id IS NULL ORDER BY c.id`);
q("F no wallet payments", `
SELECT c.id, c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id AND p.method = 'wallet'
WHERE p.id IS NULL ORDER BY c.id`);
q("G no bank_transfer payments", `
SELECT c.id, c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id AND p.method = 'bank_transfer'
WHERE p.id IS NULL ORDER BY c.id`);
q("H no settled payments", `
SELECT c.id, c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
WHERE p.id IS NULL ORDER BY c.id`);
q("I no payment rows at all", `
SELECT c.id, c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id
WHERE p.id IS NULL ORDER BY c.id`);
q("I2 their orders detail", `
SELECT c.name, o.id, o.total, o.status FROM customers c
JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id
WHERE p.id IS NULL ORDER BY c.name, o.id`);
q("method mix per customer", `
SELECT c.name,
 SUM(CASE WHEN p.method='card' THEN 1 ELSE 0 END) card,
 SUM(CASE WHEN p.method='wallet' THEN 1 ELSE 0 END) wallet,
 SUM(CASE WHEN p.method='bank_transfer' THEN 1 ELSE 0 END) bank
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id
GROUP BY c.id ORDER BY c.id`);

// --- J/K/L/M: acquisitions variants
q("J no search touch", `
SELECT c.id, c.name FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'search'
WHERE a.id IS NULL ORDER BY c.id`);
q("K1 no social touch (count)", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'social'
WHERE a.id IS NULL`);
q("K2 no retargeting touch", `
SELECT c.id, c.name FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'retargeting'
WHERE a.id IS NULL ORDER BY c.id`);
q("K3 no affiliate / no referral / no email (counts)", `
SELECT
 (SELECT COUNT(*) FROM customers c LEFT JOIN acquisitions a ON a.customer_id=c.id AND a.channel='affiliate' WHERE a.id IS NULL) affiliate,
 (SELECT COUNT(*) FROM customers c LEFT JOIN acquisitions a ON a.customer_id=c.id AND a.channel='referral' WHERE a.id IS NULL) referral,
 (SELECT COUNT(*) FROM customers c LEFT JOIN acquisitions a ON a.customer_id=c.id AND a.channel='email' WHERE a.id IS NULL) email`);
q("L acquisitions date range", `SELECT MIN(acquired_at) mn, MAX(acquired_at) mx FROM acquisitions`);
q("L2 no touch since 2024-04-01", `
SELECT c.id, c.name FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.acquired_at >= '2024-04-01'
WHERE a.id IS NULL ORDER BY c.id`);
q("L3 no touch since 2024-03-01", `
SELECT c.id, c.name FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.acquired_at >= '2024-03-01'
WHERE a.id IS NULL ORDER BY c.id`);
q("M no touch with spend >= 30", `
SELECT c.id, c.name FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.spend >= 30
WHERE a.id IS NULL ORDER BY c.id`);
q("M2 no touch with spend >= 20", `
SELECT c.id, c.name FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.spend >= 20
WHERE a.id IS NULL ORDER BY c.id`);

// --- N: inactive customers detail
q("N inactive customers", `SELECT id, name, city, region FROM customers WHERE active = 0`);
q("N2 inactive: their orders", `
SELECT c.name, o.id, o.total, o.status FROM customers c
JOIN orders o ON o.customer_id = c.id WHERE c.active = 0 ORDER BY c.name, o.id`);
q("N3 inactive: their payments", `
SELECT c.name, p.id, p.amount, p.method, p.status FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN payments p ON p.order_id = o.id WHERE c.active = 0 ORDER BY c.name, p.id`);

// --- O: refund reason arms at customer level
q("O1 no damaged-claim customers", `
SELECT c.id, c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN refunds r ON r.order_id = o.id AND r.reason = 'damaged'
WHERE r.id IS NULL ORDER BY c.id`);
q("O2 no wrong_item-claim customers", `
SELECT c.id, c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN refunds r ON r.order_id = o.id AND r.reason = 'wrong_item'
WHERE r.id IS NULL ORDER BY c.id`);
q("O3 no refund at all (cs-226 check)", `
SELECT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN refunds r ON r.order_id = o.id
WHERE r.id IS NULL GROUP BY c.id ORDER BY c.name`);
q("O4 no late_delivery customers", `
SELECT c.id, c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN refunds r ON r.order_id = o.id AND r.reason = 'late_delivery'
WHERE r.id IS NULL ORDER BY c.id`);

// --- P: split payments
q("P split orders (>1 payment row)", `
SELECT o.id, c.name, o.total, COUNT(*) np, SUM(p.amount) sum_paid
FROM orders o JOIN customers c ON c.id = o.customer_id
JOIN payments p ON p.order_id = o.id
GROUP BY o.id HAVING COUNT(*) > 1`);
q("P2 customers with no split (derived anti)", `
SELECT DISTINCT c.name FROM customers c
JOIN orders o ON o.customer_id = c.id
LEFT JOIN (SELECT order_id FROM payments GROUP BY order_id HAVING COUNT(*) > 1) s ON s.order_id = o.id
WHERE s.order_id IS NULL ORDER BY c.name`);

// --- collisions / distractor probes
q("X1 no-card anti but join p.id=o.id", `
SELECT c.id, c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.id = o.id AND p.method = 'card'
WHERE p.id IS NULL ORDER BY c.id`);
q("X2 no-shipped anti but c.id=o.id", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN orders o ON c.id = o.id AND o.status = 'shipped'
WHERE o.id IS NULL`);
q("X3 no-shipped anti INNER", `
SELECT COUNT(*) n FROM customers c
JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'`);
q("X4 no-search INNER count", `
SELECT COUNT(*) n FROM customers c
JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'search'`);

// --- misc context for walkthroughs
q("order status counts", `SELECT status, COUNT(*) n, ROUND(SUM(total),2) v FROM orders GROUP BY status`);
q("payment method mix", `SELECT method, COUNT(*) n, ROUND(SUM(amount),2) v FROM payments GROUP BY method`);
q("customers count active split", `SELECT active, COUNT(*) n FROM customers GROUP BY active`);
q("regions", `SELECT region, COUNT(*) n FROM customers GROUP BY region`);

db.close();
