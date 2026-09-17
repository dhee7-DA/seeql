// j7-a probe 3 — true (fan-out-safe) derived-rollup anti-joins + remaining distractor checks.
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

// --- cs-251 settled
q("S1 true never-settled (derived anti)", `
SELECT c.name, c.region FROM customers c
LEFT JOIN (SELECT DISTINCT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id WHERE p.status = 'settled') s
ON s.customer_id = c.id
WHERE s.customer_id IS NULL ORDER BY c.name`);
q("S2 settled payers count", `
SELECT COUNT(DISTINCT o.customer_id) n FROM orders o JOIN payments p ON p.order_id = o.id WHERE p.status = 'settled'`);
q("S3 never-settled 'pending' arm anti count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT DISTINCT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id WHERE p.status = 'pending') s
ON s.customer_id = c.id WHERE s.customer_id IS NULL`);
q("S4 pending payers", `
SELECT DISTINCT c.name FROM customers c
JOIN orders o ON o.customer_id = c.id JOIN payments p ON p.order_id = o.id WHERE p.status = 'pending' ORDER BY c.name`);
q("S5 never-settled 'failed' arm anti count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT DISTINCT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id WHERE p.status = 'failed') s
ON s.customer_id = c.id WHERE s.customer_id IS NULL`);
q("S6 failed payment detail", `
SELECT p.id, p.amount, p.method, o.id, c.name FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id WHERE p.status = 'failed'`);
q("S7 settled payer list", `
SELECT DISTINCT c.name FROM customers c
JOIN orders o ON o.customer_id = c.id JOIN payments p ON p.order_id = o.id WHERE p.status = 'settled' ORDER BY c.name`);

// --- cs-254 wallet
q("W1 true never-wallet (derived anti)", `
SELECT c.name, c.city FROM customers c
LEFT JOIN (SELECT DISTINCT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id WHERE p.method = 'wallet') w
ON w.customer_id = c.id
WHERE w.customer_id IS NULL ORDER BY c.name`);
q("W2 derived without DISTINCT -> same final?", `
SELECT c.name FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id WHERE p.method = 'wallet') w
ON w.customer_id = c.id
WHERE w.customer_id IS NULL ORDER BY c.name`);
q("W3 'card' arm anti list", `
SELECT c.name FROM customers c
LEFT JOIN (SELECT DISTINCT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id WHERE p.method = 'card') w
ON w.customer_id = c.id WHERE w.customer_id IS NULL ORDER BY c.name`);
q("W4 'bank_transfer' arm anti list", `
SELECT c.name FROM customers c
LEFT JOIN (SELECT DISTINCT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id WHERE p.method = 'bank_transfer') w
ON w.customer_id = c.id WHERE w.customer_id IS NULL ORDER BY c.name`);
q("W5 wallet INNER count", `
SELECT COUNT(*) n FROM customers c JOIN (SELECT DISTINCT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id WHERE p.method = 'wallet') w ON w.customer_id = c.id`);
q("W6 ghost c.id IS NULL count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT DISTINCT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id WHERE p.method = 'wallet') w
ON w.customer_id = c.id WHERE c.id IS NULL`);
q("W7 wallet book total", `
SELECT COUNT(*) n, ROUND(SUM(p.amount),2) v FROM payments p WHERE p.method = 'wallet'`);

// --- cs-257 wrong_item
q("R1 true never-wrong_item (derived anti)", `
SELECT c.name, c.city FROM customers c
LEFT JOIN (SELECT DISTINCT o.customer_id AS customer_id FROM orders o JOIN refunds r ON r.order_id = o.id WHERE r.reason = 'wrong_item') x
ON x.customer_id = c.id
WHERE x.customer_id IS NULL ORDER BY c.name`);
q("R2 'damaged' arm anti list", `
SELECT c.name FROM customers c
LEFT JOIN (SELECT DISTINCT o.customer_id AS customer_id FROM orders o JOIN refunds r ON r.order_id = o.id WHERE r.reason = 'damaged') x
ON x.customer_id = c.id WHERE x.customer_id IS NULL ORDER BY c.name`);
q("R3 'late_delivery' arm anti list", `
SELECT c.name FROM customers c
LEFT JOIN (SELECT DISTINCT o.customer_id AS customer_id FROM orders o JOIN refunds r ON r.order_id = o.id WHERE r.reason = 'late_delivery') x
ON x.customer_id = c.id WHERE x.customer_id IS NULL ORDER BY c.name`);
q("R4 wrong_item INNER count", `
SELECT COUNT(*) n FROM customers c JOIN (SELECT DISTINCT o.customer_id AS customer_id FROM orders o JOIN refunds r ON r.order_id = o.id WHERE r.reason = 'wrong_item') x ON x.customer_id = c.id`);
q("R5 damaged claim customers (color)", `
SELECT DISTINCT c.name FROM customers c JOIN orders o ON o.customer_id = c.id JOIN refunds r ON r.order_id = o.id WHERE r.reason = 'damaged' ORDER BY c.name`);
q("R6 late_delivery claim customers (color)", `
SELECT DISTINCT c.name FROM customers c JOIN orders o ON o.customer_id = c.id JOIN refunds r ON r.order_id = o.id WHERE r.reason = 'late_delivery' ORDER BY c.name`);
q("R7 changed_mind claim customers (color)", `
SELECT DISTINCT c.name FROM customers c JOIN orders o ON o.customer_id = c.id JOIN refunds r ON r.order_id = o.id WHERE r.reason = 'changed_mind' ORDER BY c.name`);

// --- cs-258 split (correct derived: group by ORDER)
q("D1 true never-split anti (GROUP BY o.id, o.customer_id)", `
SELECT c.name FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.id, o.customer_id HAVING COUNT(*) > 1) s
ON s.customer_id = c.id
WHERE s.customer_id IS NULL ORDER BY c.name`);
q("D2 INNER count (splitters)", `
SELECT COUNT(*) n FROM customers c
JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.id, o.customer_id HAVING COUNT(*) > 1) s
ON s.customer_id = c.id`);
q("D3 HAVING > 2 anti count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.id, o.customer_id HAVING COUNT(*) > 2) s
ON s.customer_id = c.id WHERE s.customer_id IS NULL`);
q("D4 HAVING >= 1 anti count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.id, o.customer_id HAVING COUNT(*) >= 1) s
ON s.customer_id = c.id WHERE s.customer_id IS NULL`);
q("D5 ghost c.id IS NULL count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.id, o.customer_id HAVING COUNT(*) > 1) s
ON s.customer_id = c.id WHERE c.id IS NULL`);
q("D6 join key s.customer_id = c.active anti count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.id, o.customer_id HAVING COUNT(*) > 1) s
ON s.customer_id = c.active WHERE s.customer_id IS NULL`);
q("D7 join key s.customer_id = c.created_at anti count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.id, o.customer_id HAVING COUNT(*) > 1) s
ON s.customer_id = c.created_at WHERE s.customer_id IS NULL`);
q("D8 HAVING COUNT(*) = 1 anti count", `
SELECT COUNT(*) n FROM customers c
LEFT JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.id, o.customer_id HAVING COUNT(*) = 1) s
ON s.customer_id = c.id WHERE s.customer_id IS NULL`);
q("D9 splitters detail", `
SELECT c.name, o.id, o.total, o.status FROM customers c
JOIN (SELECT o.customer_id AS customer_id, o.id AS oid FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.id, o.customer_id HAVING COUNT(*) > 1) s
ON s.customer_id = c.id JOIN orders o ON o.id = s.oid ORDER BY o.id`);
q("D10 settled split money", `
SELECT ROUND(SUM(total),2) v FROM orders WHERE id IN (33,81,100)`);

// --- cs-255/256 arm extras
q("A1 'affiliate' arm anti count", `
SELECT COUNT(*) n FROM customers c LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'affiliate' WHERE a.id IS NULL`);
q("A2 'social' arm anti count", `
SELECT COUNT(*) n FROM customers c LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'social' WHERE a.id IS NULL`);

db.close();
