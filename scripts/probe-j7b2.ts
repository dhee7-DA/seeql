// probe-j7b2 — round 2: remaining corridors + distractor consequence checks
import { Database } from "bun:sqlite";
const db = new Database(".tmp-j7b.db", { readonly: true });
const q = (sql: string) => console.log(sql, "\n->", JSON.stringify(db.query(sql).all(), null, 0), "\n");

console.log("== 1. C8 full-book: tickets with NO dated money ==");
q(`SELECT o.id, c.name, o.status, o.total,
  (SELECT GROUP_CONCAT(p.status||':'||p.amount) FROM payments p WHERE p.order_id=o.id) pays
FROM orders o JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments p ON p.order_id = o.id AND p.paid_at IS NOT NULL
WHERE p.id IS NULL ORDER BY o.id`);

console.log("== 1b. C8 count/value/status mix ==");
q(`SELECT o.status, COUNT(*) n, ROUND(SUM(o.total),2) v FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.paid_at IS NOT NULL
WHERE p.id IS NULL GROUP BY o.status`);

console.log("== 2. C9 delivered-before-paid: delivered tickets where no dated payment predates delivery ==");
q(`SELECT o.id, c.name, o.total,
  (SELECT GROUP_CONCAT(p.paid_at) FROM payments p WHERE p.order_id=o.id AND p.paid_at IS NOT NULL) dated,
  (SELECT s.delivered_at FROM shipments s WHERE s.order_id=o.id) delivered_at
FROM orders o
JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments p ON p.order_id = o.id AND p.paid_at IS NOT NULL AND p.paid_at <= (SELECT s.delivered_at FROM shipments s WHERE s.order_id=o.id)
WHERE o.status='delivered' AND p.id IS NULL ORDER BY o.id`);

console.log("== 3. C1 slot-3 collision: s.id = p.order_id ==");
q(`SELECT COUNT(*) n FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments s ON s.id = p.order_id AND s.paid_at IS NOT NULL
WHERE s.id IS NULL`);
q(`SELECT p.id, p.order_id FROM payments p
JOIN orders o ON o.id = p.order_id
LEFT JOIN payments s ON s.id = p.order_id AND s.paid_at IS NOT NULL
WHERE s.id IS NULL ORDER BY p.id LIMIT 20`);

console.log("== 4. C1 arm-value distractors ==");
q(`SELECT COUNT(*) n FROM payments p
LEFT JOIN payments s ON s.order_id = p.order_id AND s.status='pending'
WHERE s.id IS NULL`);
q(`SELECT COUNT(*) n FROM payments p
LEFT JOIN payments s ON s.order_id = p.order_id AND s.status='failed'
WHERE s.id IS NULL`);
q(`SELECT COUNT(*) n FROM payments p
LEFT JOIN payments s ON s.order_id = p.order_id AND s.status='shipped'
WHERE s.id IS NULL`);

console.log("== 5. C1 OR-in-arm + IS = NULL syntax ==");
try {
  const r = db.query(`SELECT COUNT(*) n FROM payments p
LEFT JOIN payments s ON s.order_id = p.order_id OR s.paid_at IS NOT NULL
WHERE s.id IS NULL`).all();
  console.log("OR-in-arm ->", JSON.stringify(r));
} catch (e) { console.log("OR-in-arm -> ERROR", String(e)); }
try {
  const r = db.query(`SELECT COUNT(*) n FROM payments p
LEFT JOIN payments s ON s.order_id = p.order_id AND s.paid_at IS NOT NULL
WHERE s.id IS = NULL`).all();
  console.log("IS = NULL ->", JSON.stringify(r));
} catch (e) { console.log("IS = NULL -> ERROR", String(e)); }
q(`SELECT COUNT(*) n FROM payments p
LEFT JOIN payments s ON s.order_id = p.order_id AND s.paid_at IS NOT NULL
WHERE s.id IS NOT NULL`);

console.log("== 6. C2 arm variants ==");
q(`SELECT COUNT(*) n FROM orders o LEFT JOIN payments p ON p.order_id=o.id
WHERE o.status='shipped' AND p.id IS NULL`);
q(`SELECT COUNT(*) n FROM orders o LEFT JOIN payments p ON p.order_id=o.id
WHERE o.status='delivered' AND p.id IS NULL`);
q(`SELECT COUNT(*) n FROM orders o LEFT JOIN payments p ON p.order_id=o.id
WHERE o.status='pending' AND p.id IS NOT NULL`);

console.log("== 7. C3 variants ==");
q(`SELECT COUNT(*) n FROM orders o LEFT JOIN payments p ON p.order_id=o.id
WHERE o.status='cancelled' AND p.id IS NOT NULL`);
q(`SELECT COUNT(*) n FROM orders o LEFT JOIN payments p ON p.order_id=o.id
WHERE o.status='delivered' AND p.id IS NULL`);
q(`SELECT COUNT(*) n FROM orders o
LEFT JOIN payments p ON p.id = o.id
WHERE o.status='cancelled' AND p.id IS NULL`);

console.log("== 8. C4 collision p.id=o.id in payments join ==");
q(`SELECT COUNT(*) n FROM (
SELECT o.id FROM orders o
JOIN customers c ON c.id=o.customer_id
JOIN payments p ON p.id = o.id
LEFT JOIN shipments s ON s.order_id = o.id
WHERE s.id IS NULL GROUP BY o.id)`);

console.log("== 9. C6 carrier x scan detail (for prose) ==");
q(`SELECT s.carrier, COUNT(*) legs, SUM(s.delivered_at IS NOT NULL) scanned, SUM(o.status='delivered') ticket_delivered
FROM shipments s JOIN orders o ON o.id=s.order_id GROUP BY s.carrier`);

console.log("== 10. fallback: expensive never-dispatched pile ==");
q(`SELECT COUNT(*) n, ROUND(SUM(o.total),2) v FROM orders o LEFT JOIN shipments s ON s.order_id=o.id
WHERE s.id IS NULL AND o.total >= 500`);
q(`SELECT o.id, c.name, o.status, o.total FROM orders o JOIN customers c ON c.id=o.customer_id LEFT JOIN shipments s ON s.order_id=o.id
WHERE s.id IS NULL AND o.total >= 500 ORDER BY o.total DESC`);

console.log("== 11. C7 arm/status variants ==");
q(`SELECT COUNT(*) n FROM orders o
JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
WHERE p.id IS NULL AND c.active = 0`);
q(`SELECT COUNT(*) n FROM orders o
JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments p ON p.order_id = o.id AND p.paid_at IS NOT NULL
WHERE p.id IS NULL AND c.active = 1`);

console.log("== 12. C8 ship: status mix detail + top rows ==");
q(`SELECT o.id, c.name, o.status, o.total FROM orders o JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments p ON p.order_id = o.id AND p.paid_at IS NOT NULL
WHERE p.id IS NULL ORDER BY o.total DESC LIMIT 8`);

console.log("== 13. C8 noVerify check: does 'settled' arm change C8? ==");
q(`SELECT COUNT(*) n FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
WHERE p.id IS NULL`);

console.log("== 14. pending tickets WITH attempts (C2 contrast) ==");
q(`SELECT o.id, c.name, o.total, p.amount, p.method, p.status FROM orders o
JOIN customers c ON c.id=o.customer_id JOIN payments p ON p.order_id=o.id
WHERE o.status='pending' ORDER BY o.id`);

console.log("== 15. Alice/Maya/Emma/Chloe/Keiko chase exposure in C2/C3 prose ==");
q(`SELECT c.name, COUNT(*) n, ROUND(SUM(o.total),2) v FROM orders o
JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments p ON p.order_id=o.id
WHERE o.status='pending' AND p.id IS NULL GROUP BY c.name ORDER BY v DESC`);
q(`SELECT c.name, COUNT(*) n, ROUND(SUM(o.total),2) v FROM orders o
JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments p ON p.order_id=o.id
WHERE o.status='cancelled' AND p.id IS NULL GROUP BY c.name ORDER BY v DESC`);

console.log("== 16. C1 top rows for prose ==");
q(`SELECT p.id, p.order_id, c.name, p.amount, p.method, p.status, o.status ostatus FROM payments p
JOIN orders o ON o.id=p.order_id JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments s ON s.order_id = p.order_id AND s.paid_at IS NOT NULL
WHERE s.id IS NULL ORDER BY p.amount DESC`);

db.close();
