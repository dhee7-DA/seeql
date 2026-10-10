// j7-a probe 2 — DISTINCT customer lists + distractor-consequence pre-verification.
// Runs against a COPY of db/custom.db (scripts/.tmp-j7a.db).

import { Database } from "bun:sqlite";

const db = new Database(".tmp-j7a.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all();
    console.log(`\n== ${label} ==`);
    console.log(JSON.stringify(rows));
  } catch (e) {
    console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// --- exact DISTINCT lists for candidate cases
q("H1 no-settled DISTINCT list", `
SELECT DISTINCT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
WHERE p.id IS NULL ORDER BY c.name`);
q("H2 no-settled arm 'pending' DISTINCT", `
SELECT DISTINCT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'pending'
WHERE p.id IS NULL ORDER BY c.name`);
q("H3 no-settled arm 'failed' DISTINCT", `
SELECT DISTINCT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'failed'
WHERE p.id IS NULL ORDER BY c.name`);
q("H4 no-settled with arm in WHERE (count)", `
SELECT COUNT(*) n FROM (SELECT DISTINCT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id
WHERE p.status = 'settled' AND p.id IS NULL)`);
q("H5 no-settled p.id=o.id collision DISTINCT", `
SELECT DISTINCT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.id = o.id AND p.status = 'settled'
WHERE p.id IS NULL ORDER BY c.name`);
q("H6 their open exposure (orders w/o settled payment, value)", `
SELECT c.name, COUNT(*) unpaid_orders, ROUND(SUM(o.total),2) value
FROM customers c
JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
WHERE p.id IS NULL GROUP BY c.id ORDER BY value DESC`);

q("F1 no-wallet DISTINCT list", `
SELECT DISTINCT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id AND p.method = 'wallet'
WHERE p.id IS NULL ORDER BY c.name`);
q("F2 no-card DISTINCT list", `
SELECT DISTINCT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id AND p.method = 'card'
WHERE p.id IS NULL ORDER BY c.name`);
q("F3 no-bank_transfer DISTINCT list", `
SELECT DISTINCT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id AND p.method = 'bank_transfer'
WHERE p.id IS NULL ORDER BY c.name`);
q("F4 wallet payers (9 expected)", `
SELECT c.name, COUNT(*) n, ROUND(SUM(p.amount),2) v FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN payments p ON p.order_id = o.id AND p.method = 'wallet'
GROUP BY c.id ORDER BY v DESC`);
q("F5 no-wallet INNER (count)", `
SELECT COUNT(*) n FROM (SELECT DISTINCT c.name FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN payments p ON p.order_id = o.id AND p.method = 'wallet')`);

q("B1 no-shipped with 'delivered' arm", `
SELECT DISTINCT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'
WHERE o.id IS NULL ORDER BY c.name`);
q("B2 no-shipped 'pending' arm count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'
WHERE o.id IS NULL`);
q("B3 no-shipped 'cancelled' arm count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled'
WHERE o.id IS NULL`);
q("B4 shipped orders have shipped_at?", `
SELECT COUNT(*) n FROM orders WHERE status = 'shipped' AND shipped_at IS NULL`);
q("B5 the six: their order profile", `
SELECT c.name, c.city, c.region, COUNT(o.id) orders, ROUND(SUM(o.total),2) value
FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
WHERE c.id IN (2,3,4,6,11,15) GROUP BY c.id ORDER BY value DESC`);
q("B6 no-shipped c.id=o.id count (distractor)", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN orders o ON c.id = o.id AND o.status = 'shipped'
WHERE o.id IS NULL`);

q("C1 no-cancelled full list", `
SELECT c.name, c.city FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled'
WHERE o.id IS NULL ORDER BY c.name`);
q("C2 no-cancelled 'pending' arm count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'
WHERE o.id IS NULL`);
q("C3 no-cancelled 'shipped' arm count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'
WHERE o.id IS NULL`);
q("C4 cancelled book by customer (detail)", `
SELECT c.name, COUNT(*) n, ROUND(SUM(o.total),2) v FROM customers c
JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled'
GROUP BY c.id ORDER BY v DESC`);
q("C5 no-cancelled c.id=o.id count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN orders o ON c.id = o.id AND o.status = 'cancelled'
WHERE o.id IS NULL`);

q("J1 no-search full list + city", `
SELECT c.name, c.city FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'search'
WHERE a.id IS NULL ORDER BY c.name`);
q("J2 no-email list (same count, different 14?)", `
SELECT c.name FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'email'
WHERE a.id IS NULL ORDER BY c.name`);
q("J3 no-search 'referral' arm count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'referral'
WHERE a.id IS NULL`);
q("J4 no-search 'retargeting' arm count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'retargeting'
WHERE a.id IS NULL`);
q("J5 search touches detail", `
SELECT a.id, c.name, a.spend, a.acquired_at FROM acquisitions a
JOIN customers c ON c.id = a.customer_id WHERE a.channel = 'search'`);
q("J6 no-search a.id=c.id collision list", `
SELECT c.name FROM customers c
LEFT JOIN acquisitions a ON a.id = c.id AND a.channel = 'search'
WHERE a.id IS NULL ORDER BY c.name`);

q("L1 no touch since 2024-04-01 full list", `
SELECT c.name, c.region FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.acquired_at >= '2024-04-01'
WHERE a.id IS NULL ORDER BY c.name`);
q("L2 touches since 2024-04-01 detail", `
SELECT a.id, c.name, a.channel, a.spend, a.acquired_at FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
WHERE a.acquired_at >= '2024-04-01' ORDER BY a.id`);
q("L3 since '2024-05-01' count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.acquired_at >= '2024-05-01'
WHERE a.id IS NULL`);
q("L4 since '2024-03-01' count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.acquired_at >= '2024-03-01'
WHERE a.id IS NULL`);
q("L5 spends since 2024-04-01 sum", `
SELECT ROUND(SUM(spend),2) v, COUNT(*) n FROM acquisitions WHERE acquired_at >= '2024-04-01'`);

q("O1 no wrong_item DISTINCT list", `
SELECT DISTINCT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN refunds r ON r.order_id = o.id AND r.reason = 'wrong_item'
WHERE r.id IS NULL ORDER BY c.name`);
q("O2 no wrong_item 'damaged' arm DISTINCT count", `
SELECT COUNT(DISTINCT c.name) n FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN refunds r ON r.order_id = o.id AND r.reason = 'damaged'
WHERE r.id IS NULL`);
q("O3 no wrong_item 'late_delivery' arm DISTINCT count", `
SELECT COUNT(DISTINCT c.name) n FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN refunds r ON r.order_id = o.id AND r.reason = 'late_delivery'
WHERE r.id IS NULL`);
q("O4 wrong_item claims detail", `
SELECT r.id, c.name, r.amount, o.id order_id, r.refunded_at FROM refunds r
JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'wrong_item'`);
q("O5 no wrong_item r.id=o.id collision DISTINCT", `
SELECT DISTINCT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN refunds r ON r.id = o.id AND r.reason = 'wrong_item'
WHERE r.id IS NULL ORDER BY c.name`);

q("P1 fixed split-anti (customer level)", `
SELECT c.name FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.customer_id HAVING COUNT(*) > 1) s
ON s.customer_id = c.id
WHERE s.customer_id IS NULL ORDER BY c.name`);
q("P2 split-anti count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.customer_id HAVING COUNT(*) > 1) s
ON s.customer_id = c.id
WHERE s.customer_id IS NULL`);
q("P3 split-anti HAVING >= 1 (distractor)", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.customer_id HAVING COUNT(*) >= 1) s
ON s.customer_id = c.id
WHERE s.customer_id IS NULL`);
q("P4 split-anti HAVING > 2 (distractor)", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.customer_id HAVING COUNT(*) > 2) s
ON s.customer_id = c.id
WHERE s.customer_id IS NULL`);
q("P5 split-anti COUNT(p.id) vs COUNT(*) ambiguity check", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.customer_id HAVING COUNT(p.id) > 1) s
ON s.customer_id = c.id
WHERE s.customer_id IS NULL`);
q("P6 split-anti GROUP BY o.id (distractor)", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.id HAVING COUNT(*) > 1) s
ON s.customer_id = c.id
WHERE s.customer_id IS NULL`);
q("P7 split-anti INNER (distractor)", `
SELECT COUNT(*) n FROM customers c
JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.customer_id HAVING COUNT(*) > 1) s
ON s.customer_id = c.id`);
q("P8 split-anti s.customer_id = c.active (distractor)", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.customer_id HAVING COUNT(*) > 1) s
ON s.customer_id = c.active
WHERE s.customer_id IS NULL`);
q("P9 split-anti ghost c.id IS NULL (distractor)", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.customer_id HAVING COUNT(*) > 1) s
ON s.customer_id = c.id
WHERE c.id IS NULL`);
q("P10 the three splitters", `
SELECT c.name, o.id, o.total, COUNT(*) np, ROUND(SUM(p.amount),2) sp
FROM customers c JOIN orders o ON o.customer_id = c.id
JOIN payments p ON p.order_id = o.id
GROUP BY o.id HAVING COUNT(*) > 1 ORDER BY o.id`);
q("P11 o100 installments", `SELECT id, amount, method, status FROM payments WHERE order_id = 100`);
q("P12 o81 installments", `SELECT id, amount, method, status FROM payments WHERE order_id = 81`);

q("M1 no touch spend>=30 full list", `
SELECT c.name FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.spend >= 30
WHERE a.id IS NULL ORDER BY c.name`);
q("M2 spend>=30 touches", `
SELECT a.id, c.name, a.channel, a.spend FROM acquisitions a
JOIN customers c ON c.id = a.customer_id WHERE a.spend >= 30 ORDER BY a.spend DESC`);

// cross-check: total customers w/ no acquisition since date arm sanity
q("Z1 customers with no orders (should be empty)", `
SELECT COUNT(*) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`);

db.close();
