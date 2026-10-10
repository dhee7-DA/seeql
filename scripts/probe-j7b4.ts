// probe-j7b4 — refund-timing corridor detail (cs-266 candidate)
import { Database } from "bun:sqlite";
const db = new Database(".tmp-j7b.db", { readonly: true });
const q = (sql: string) => console.log(sql, "\n->", JSON.stringify(db.query(sql).all(), null, 0), "\n");

console.log("== the 3 claims filed before the delivery scan ==");
q(`SELECT r.id, r.order_id AS oid, c.name, r.amount, r.reason, r.refunded_at, o.total,
 (SELECT s.delivered_at FROM shipments s WHERE s.order_id=r.order_id) delivered_at,
 (SELECT s.carrier FROM shipments s WHERE s.order_id=r.order_id) carrier,
 (SELECT GROUP_CONCAT(p.status||':'||p.amount) FROM payments p WHERE p.order_id=r.order_id) pays
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
LEFT JOIN shipments s ON s.order_id = r.order_id AND s.delivered_at <= r.refunded_at
WHERE s.id IS NULL ORDER BY r.id`);

console.log("== distractor: inverted arm >= ==");
q(`SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
LEFT JOIN shipments s ON s.order_id = r.order_id AND s.delivered_at >= r.refunded_at
WHERE s.id IS NULL`);

console.log("== distractor: arm delivered_at IS NOT NULL (no timing) ==");
q(`SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
LEFT JOIN shipments s ON s.order_id = r.order_id AND s.delivered_at IS NOT NULL
WHERE s.id IS NULL`);

console.log("== distractor: ghost col r.refunded_at / s.cost ==");
q(`SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
LEFT JOIN shipments s ON s.order_id = r.order_id AND s.delivered_at <= r.refunded_at
WHERE r.refunded_at IS NULL`);
q(`SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
LEFT JOIN shipments s ON s.order_id = r.order_id AND s.delivered_at <= r.refunded_at
WHERE s.cost IS NULL`);

console.log("== distractor: collision s.id = r.order_id ==");
q(`SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
LEFT JOIN shipments s ON s.id = r.order_id AND s.delivered_at <= r.refunded_at
WHERE s.id IS NULL`);

console.log("== distractor: INNER join ==");
q(`SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN shipments s ON s.order_id = r.order_id AND s.delivered_at <= r.refunded_at
WHERE s.id IS NULL`);

console.log("== all 25 refunds timing scan (prose context) ==");
q(`SELECT r.id, r.order_id, r.refunded_at,
 (SELECT s.delivered_at FROM shipments s WHERE s.order_id=r.order_id) delivered_at
FROM refunds r ORDER BY r.id`);

db.close();
