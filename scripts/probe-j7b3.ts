// probe-j7b3 — round 3: distractor consequence verification + refund-timing corridor
import { Database } from "bun:sqlite";
const db = new Database(".tmp-j7b.db", { readonly: true });
const n = (label: string, sql: string) => {
  try {
    const r = db.query(sql).all() as Record<string, unknown>[];
    const c = r.length === 1 ? JSON.stringify(r[0]) : `${r.length} rows`;
    console.log(label, "->", c);
  } catch (e) {
    console.log(label, "-> ERROR", String(e).split("\n")[0]);
  }
};

console.log("--- refund timing: claims filed before the delivery scan ---");
n("claims-with-no-scan-predating", `SELECT r.id, r.order_id, c.name, r.amount, r.refunded_at,
 (SELECT MIN(s.delivered_at) FROM shipments s WHERE s.order_id=r.order_id) delivered_at
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id=o.customer_id
LEFT JOIN shipments s ON s.order_id = r.order_id AND s.delivered_at <= r.refunded_at
WHERE s.id IS NULL ORDER BY r.id`);

console.log("--- cs-266 candidate: delivered tickets, zero claims (listing) ---");
n("count/value", `SELECT COUNT(*) n, ROUND(SUM(o.total),2) v FROM orders o
LEFT JOIN refunds r ON r.order_id = o.id
WHERE o.status='delivered' AND r.id IS NULL`);
n("top5", `SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id=o.customer_id
LEFT JOIN refunds r ON r.order_id = o.id
WHERE o.status='delivered' AND r.id IS NULL ORDER BY o.total DESC LIMIT 5`);
n("claim-side", `SELECT COUNT(*) n FROM orders o LEFT JOIN refunds r ON r.order_id = o.id
WHERE o.status='delivered' AND r.id IS NOT NULL`);
n("shipped-arm", `SELECT COUNT(*) n FROM orders o LEFT JOIN refunds r ON r.order_id = o.id
WHERE o.status='shipped' AND r.id IS NULL`);

console.log("--- C1 slot-4 (ON key) distractors ---");
n("p.id = p.order_id", `SELECT COUNT(*) n, COUNT(DISTINCT p.id) dp FROM payments p
LEFT JOIN payments s ON p.id = p.order_id AND s.paid_at IS NOT NULL
WHERE s.id IS NULL`);
n("o.customer_id = p.order_id", `SELECT COUNT(*) n FROM payments p
JOIN orders o ON o.id = p.order_id
LEFT JOIN payments s ON o.customer_id = p.order_id AND s.paid_at IS NOT NULL
WHERE s.id IS NULL`);

console.log("--- C2 slot-2 o.id (always-true join) ---");
n("o.id=o.id pending", `SELECT COUNT(*) n FROM orders o
LEFT JOIN payments p ON o.id = o.id
WHERE o.status='pending' AND p.id IS NULL`);

console.log("--- C3 slot-3/4 odd chips ---");
n("p.'pending' IS NULL", `SELECT COUNT(*) n FROM orders o
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.status='cancelled' AND p.'pending' IS NULL`);
n("p.id IS paid_at", `SELECT COUNT(*) n FROM orders o
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.status='cancelled' AND p.id IS paid_at`);

console.log("--- C4 slot-4 / slot-3 variants ---");
n("s.id IS p.id", `SELECT COUNT(*) n FROM payments p
JOIN orders o ON o.id = p.order_id
LEFT JOIN shipments s ON s.order_id = o.id
WHERE s.id IS p.id`);
n("s.id IS NOT NULL", `SELECT COUNT(*) n FROM payments p
JOIN orders o ON o.id = p.order_id
LEFT JOIN shipments s ON s.order_id = o.id
WHERE s.id IS NOT NULL`);

console.log("--- C6 'cancelled' arm board ---");
n("arm cancelled", `SELECT s.carrier, COUNT(s.id) open_legs FROM shipments s
LEFT JOIN orders o ON o.id = s.order_id AND o.status = 'cancelled'
WHERE o.id IS NULL GROUP BY s.carrier ORDER BY open_legs DESC`);

console.log("--- C7 slot-3 OR / slot-4 '=' ---");
n("OR in arm", `SELECT COUNT(*) n FROM orders o
JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments p ON p.order_id = o.id OR p.paid_at IS NOT NULL
WHERE p.id IS NULL AND c.active = 0`);
n("IS NOT =", `SELECT COUNT(*) n FROM orders o
JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments p ON p.order_id = o.id AND p.paid_at IS NOT =
WHERE p.id IS NULL AND c.active = 0`);
n("p.amount slot-1", `SELECT o.id, c.name, o.status, p.amount FROM orders o
JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments p ON p.order_id = o.id AND p.paid_at IS NOT NULL
WHERE p.id IS NULL AND c.active = 0 ORDER BY o.id`);

console.log("--- C8 slot-3 distractors ---");
n("p.id = o.id (paid_at arm)", `SELECT COUNT(*) n FROM orders o
LEFT JOIN payments p ON p.id = o.id AND p.paid_at IS NOT NULL
WHERE p.id IS NULL`);
n("o.total = o.id", `SELECT COUNT(*) n FROM orders o
LEFT JOIN payments p ON o.total = o.id AND p.paid_at IS NOT NULL
WHERE p.id IS NULL`);

console.log("--- C1 filled + collision row-set equality checks ---");
n("C1 correct count", `SELECT COUNT(*) n FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments s ON s.order_id = p.order_id AND s.paid_at IS NOT NULL
WHERE s.id IS NULL`);
n("C6 correct", `SELECT s.carrier, COUNT(s.id) AS unconfirmed_legs, ROUND(SUM(s.cost), 2) AS open_freight
FROM shipments s
LEFT JOIN orders o ON o.id = s.order_id AND o.status = 'delivered'
WHERE o.id IS NULL
GROUP BY s.carrier
ORDER BY unconfirmed_legs DESC`);

db.close();
