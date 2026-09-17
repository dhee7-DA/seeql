// probe-j7b5 — final distractor confirmations
import { Database } from "bun:sqlite";
const db = new Database(".tmp-j7b.db", { readonly: true });
const q = (label: string, sql: string) => {
  try {
    console.log(label, "->", JSON.stringify(db.query(sql).all(), null, 0));
  } catch (e) {
    console.log(label, "-> ERROR", String(e).split("\n")[0]);
  }
};

console.log("--- cs-266 slot-4 distractors ---");
q("o.total = r.order_id", `SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
LEFT JOIN shipments s ON o.total = r.order_id AND s.delivered_at <= r.refunded_at
WHERE s.id IS NULL`);
q("s.cost = r.order_id", `SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
LEFT JOIN shipments s ON s.cost = r.order_id AND s.delivered_at <= r.refunded_at
WHERE s.id IS NULL`);
q("r.reason = r.order_id", `SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
LEFT JOIN shipments s ON r.reason = r.order_id AND s.delivered_at <= r.refunded_at
WHERE s.id IS NULL`);

console.log("--- cs-266 slot-1 s.cost consequence (cells) ---");
q("s.cost in slot1", `SELECT r.id, o.id AS order_id, c.name, s.cost FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
LEFT JOIN shipments s ON s.order_id = r.order_id AND s.delivered_at <= r.refunded_at
WHERE s.id IS NULL ORDER BY r.id`);
q("correct slot1 r.amount", `SELECT r.id, o.id AS order_id, c.name, r.amount FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
LEFT JOIN shipments s ON s.order_id = r.order_id AND s.delivered_at <= r.refunded_at
WHERE s.id IS NULL ORDER BY r.id`);

console.log("--- C7 slot-2 INNER ---");
q("INNER", `SELECT o.id, c.name, o.status, o.total FROM orders o
JOIN customers c ON c.id=o.customer_id
JOIN payments p ON p.order_id = o.id AND p.paid_at IS NOT NULL
WHERE p.id IS NULL AND c.active = 0 ORDER BY o.id`);

console.log("--- C2 sorted by created_at (oldest chase first) ---");
q("C2 ordered", `SELECT o.id, c.name, o.total, o.created_at FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.status='pending' AND p.id IS NULL ORDER BY o.created_at`);

console.log("--- C8 ordered by total desc top 6 (prose) ---");
q("C8 top", `SELECT o.id, c.name, o.status, o.total FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments p ON p.order_id = o.id AND p.paid_at IS NOT NULL
WHERE p.id IS NULL ORDER BY o.total DESC LIMIT 6`);
q("C8 value", `SELECT COUNT(*) n, ROUND(SUM(o.total),2) v FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.paid_at IS NOT NULL
WHERE p.id IS NULL`);

console.log("--- C4 ordered rows (prose) ---");
q("C4 rows", `SELECT p.id, o.id AS order_id, c.name, p.amount, p.status FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN customers c ON c.id = o.customer_id
LEFT JOIN shipments s ON s.order_id = o.id
WHERE s.id IS NULL ORDER BY p.amount DESC`);

console.log("--- C3 ordered rows (prose) ---");
q("C3 rows", `SELECT o.id, c.name, o.total, o.created_at FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.status='cancelled' AND p.id IS NULL ORDER BY o.total DESC`);

console.log("--- C1 duplicate-slot sanity: p.status/o.status equivalence on non-o82 rows only? ---");
q("o.status vs p.status cells", `SELECT p.id, p.status, o.status FROM payments p
JOIN orders o ON o.id = p.order_id
LEFT JOIN shipments s ON s.order_id = o.id
WHERE s.id IS NULL ORDER BY p.id`);

db.close();
