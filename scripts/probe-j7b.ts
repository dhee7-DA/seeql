// probe-j7b — corridor verification for j3 anti-join cases cs-259..266 (order/payment/shipment axis)
import { Database } from "bun:sqlite";
const db = new Database(".tmp-j7b.db", { readonly: true });
const q = (sql: string) => console.log(sql, "\n->", JSON.stringify(db.query(sql).all(), null, 0), "\n");

console.log("== A. paid_at hygiene by status ==");
q(`SELECT status, COUNT(*) n, SUM(paid_at IS NULL) null_dates, ROUND(SUM(amount),2) v FROM payments GROUP BY status`);

console.log("== B. C1 self-anti: attempts on tickets with NO dated payment ==");
q(`SELECT p.id, p.order_id oid, p.amount, p.method, p.status, o.status ostatus, c.name
FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments s ON s.order_id = p.order_id AND s.paid_at IS NOT NULL
WHERE s.id IS NULL ORDER BY p.id`);

console.log("== B2. C1 variant arm s.status='settled' — same rows? ==");
q(`SELECT COUNT(*) n, ROUND(SUM(p.amount),2) v FROM payments p
LEFT JOIN payments s ON s.order_id = p.order_id AND s.status = 'settled'
WHERE s.id IS NULL`);

console.log("== B3. C1 method/status mix + totals ==");
q(`SELECT p.status, p.method, COUNT(*) n, ROUND(SUM(p.amount),2) v FROM payments p
LEFT JOIN payments s ON s.order_id = p.order_id AND s.paid_at IS NOT NULL
WHERE s.id IS NULL GROUP BY p.status, p.method ORDER BY n DESC`);

console.log("== C. pending payment rows per order + order status ==");
q(`SELECT p.order_id, o.status ostatus, o.total, c.name, COUNT(*) rows, ROUND(SUM(p.amount),2) held
FROM payments p JOIN orders o ON o.id=p.order_id JOIN customers c ON c.id=o.customer_id
WHERE p.status='pending' GROUP BY p.order_id ORDER BY held DESC`);

console.log("== D. C2 pending tickets with NO payment row ==");
q(`SELECT o.id, c.name, o.total, o.created_at
FROM orders o JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.status='pending' AND p.id IS NULL ORDER BY o.id`);

console.log("== D2. C2 sum + collision p.id=o.id probe ==");
q(`SELECT COUNT(*) n, ROUND(SUM(o.total),2) v FROM orders o
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.status='pending' AND p.id IS NULL`);
q(`SELECT COUNT(*) n FROM orders o
LEFT JOIN payments p ON p.id = o.id
WHERE o.status='pending' AND p.id IS NULL`);

console.log("== E. C3 cancelled tickets with NO payment row ==");
q(`SELECT o.id, c.name, o.total, o.created_at
FROM orders o JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.status='cancelled' AND p.id IS NULL ORDER BY o.id`);
q(`SELECT COUNT(*) n, ROUND(SUM(o.total),2) v FROM orders o
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.status='cancelled' AND p.id IS NULL`);

console.log("== E2. cancelled ticket WITH payment (order 82?) ==");
q(`SELECT o.id, c.name, o.total, p.id pid, p.amount, p.method, p.status, (SELECT COUNT(*) FROM shipments s WHERE s.order_id=o.id) legs, (SELECT COUNT(*) FROM refunds r WHERE r.order_id=o.id) claims
FROM orders o JOIN customers c ON c.id=o.customer_id JOIN payments p ON p.order_id=o.id
WHERE o.status='cancelled'`);

console.log("== F. C4 money attempted on never-dispatched tickets ==");
q(`SELECT o.id, c.name, o.status, o.total, COUNT(p.id) attempts, ROUND(SUM(p.amount),2) held,
  p_max.status max_status
FROM orders o
JOIN customers c ON c.id=o.customer_id
JOIN payments p ON p.order_id = o.id
LEFT JOIN shipments s ON s.order_id = o.id
LEFT JOIN payments p_max ON 0
WHERE s.id IS NULL GROUP BY o.id ORDER BY held DESC`);

console.log("== F2. C4 plain (no p_max) ==");
q(`SELECT o.id, c.name, o.status, o.total, COUNT(p.id) attempts, ROUND(SUM(p.amount),2) held
FROM orders o
JOIN customers c ON c.id=o.customer_id
JOIN payments p ON p.order_id = o.id
LEFT JOIN shipments s ON s.order_id = o.id
WHERE s.id IS NULL GROUP BY o.id ORDER BY held DESC`);

console.log("== G. C5 refunds on tickets with NO dated payment ==");
q(`SELECT r.id, r.order_id oid, r.amount, r.reason, c.name, o.total, o.status ostatus
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments s ON s.order_id = r.order_id AND s.paid_at IS NOT NULL
WHERE s.id IS NULL ORDER BY r.id`);

console.log("== G2. refunds on tickets whose money is still pending (any status) ==");
q(`SELECT r.id, r.order_id, c.name, r.amount, o.status, (SELECT GROUP_CONCAT(status) FROM payments p WHERE p.order_id=r.order_id) pay_status
FROM refunds r JOIN orders o ON o.id=r.order_id JOIN customers c ON c.id=o.customer_id
ORDER BY r.id`);

console.log("== H. P55 churned accounts (active=0): open money ==");
q(`SELECT c.id, c.name FROM customers c WHERE c.active=0`);
q(`SELECT o.id, c.name, o.status, o.total,
  (SELECT GROUP_CONCAT(p.status||':'||p.amount) FROM payments p WHERE p.order_id=o.id) pays,
  (SELECT COUNT(*) FROM shipments s WHERE s.order_id=o.id) legs,
  (SELECT COUNT(*) FROM refunds r WHERE r.order_id=o.id) claims
FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.active=0 ORDER BY o.id`);

console.log("== H2. churned accounts, tickets with no dated payment (anti) ==");
q(`SELECT o.id, c.name, o.status, o.total
FROM orders o
JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments p ON p.order_id = o.id AND p.paid_at IS NOT NULL
WHERE p.id IS NULL AND c.active = 0 ORDER BY o.id`);

console.log("== I. settled money on pending/cancelled tickets ==");
q(`SELECT o.id, o.status, p.id, p.amount, p.method FROM orders o JOIN payments p ON p.order_id=o.id
WHERE o.status IN ('pending','cancelled') AND p.status='settled'`);

console.log("== J. multi-payment orders ==");
q(`SELECT p.order_id, COUNT(*) n, GROUP_CONCAT(p.status||':'||p.amount) mix
FROM payments p GROUP BY p.order_id HAVING n > 1 ORDER BY p.order_id`);

console.log("== K. orders with no order_items / overpayments ==");
q(`SELECT COUNT(*) n FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id WHERE oi.id IS NULL`);
q(`SELECT p.id, p.order_id, p.amount, o.total FROM payments p JOIN orders o ON o.id=p.order_id WHERE p.amount > o.total`);

console.log("== L. delivered tickets with no delivery scan (expect 0) ==");
q(`SELECT COUNT(*) n FROM orders o LEFT JOIN shipments s ON s.order_id=o.id
WHERE o.status='delivered' AND s.delivered_at IS NULL`);

console.log("== M. in-transit board per carrier ==");
q(`SELECT s.carrier, COUNT(*) n, ROUND(SUM(s.cost),2) freight
FROM shipments s WHERE s.delivered_at IS NULL GROUP BY s.carrier ORDER BY n DESC`);

console.log("== M2. aggregate anti-join board: legs whose ticket is not delivered ==");
q(`SELECT s.carrier, COUNT(s.id) open_legs, ROUND(SUM(s.cost),2) open_freight
FROM shipments s
LEFT JOIN orders o ON o.id = s.order_id AND o.status = 'delivered'
WHERE o.id IS NULL
GROUP BY s.carrier ORDER BY open_legs DESC`);

console.log("== M3. same board, arm 'shipped' / 'pending' (distractor checks) ==");
q(`SELECT s.carrier, COUNT(s.id) open_legs FROM shipments s
LEFT JOIN orders o ON o.id = s.order_id AND o.status = 'shipped'
WHERE o.id IS NULL GROUP BY s.carrier ORDER BY open_legs DESC`);
q(`SELECT s.carrier, COUNT(s.id) open_legs FROM shipments s
LEFT JOIN orders o ON o.id = s.order_id AND o.status = 'pending'
WHERE o.id IS NULL GROUP BY s.carrier ORDER BY open_legs DESC`);

console.log("== M4. board with INNER join / ghost col variants ==");
q(`SELECT s.carrier, COUNT(s.id) n FROM shipments s
JOIN orders o ON o.id = s.order_id AND o.status = 'delivered'
WHERE o.id IS NULL GROUP BY s.carrier`);
q(`SELECT s.carrier, COUNT(s.id) n FROM shipments s
LEFT JOIN orders o ON o.id = s.order_id AND o.status = 'delivered'
WHERE s.id IS NULL GROUP BY s.carrier`);

console.log("== N. refunds issued before any dated payment on the ticket ==");
q(`SELECT r.id, r.order_id, c.name, r.amount, r.refunded_at,
 (SELECT MIN(p.paid_at) FROM payments p WHERE p.order_id=r.order_id AND p.paid_at IS NOT NULL) first_dated
FROM refunds r JOIN orders o ON o.id=r.order_id JOIN customers c ON c.id=o.customer_id
WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.order_id=r.order_id AND p.paid_at IS NOT NULL AND p.paid_at <= r.refunded_at)
ORDER BY r.id`);

console.log("== O. C1 collision + placement distractor checks ==");
q(`SELECT COUNT(*) n FROM payments p
LEFT JOIN payments s ON s.id = p.id AND s.paid_at IS NOT NULL
WHERE s.id IS NULL`);
q(`SELECT COUNT(*) n FROM payments p
LEFT JOIN payments s ON s.order_id = p.order_id AND s.paid_at IS NOT NULL
WHERE s.order_id IS NULL`);

console.log("== P. shipped tickets with pending attempts (C1 prose) ==");
q(`SELECT p.order_id, c.name, o.status, p.amount, p.method FROM payments p
JOIN orders o ON o.id=p.order_id JOIN customers c ON c.id=o.customer_id
WHERE p.status='pending' AND o.status='shipped' ORDER BY p.order_id`);

console.log("== Q. C1 total value + count ==");
q(`SELECT COUNT(*) n, ROUND(SUM(p.amount),2) v FROM payments p
LEFT JOIN payments s ON s.order_id = p.order_id AND s.paid_at IS NOT NULL
WHERE s.id IS NULL`);

console.log("== R. shipped-no-settled tickets (contrast prose) ==");
q(`SELECT o.id, c.name, o.total, (SELECT GROUP_CONCAT(p.status||':'||p.amount) FROM payments p WHERE p.order_id=o.id) pays, s.carrier, s.cost
FROM orders o JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments st ON st.order_id=o.id AND st.paid_at IS NOT NULL
LEFT JOIN shipments s ON s.order_id=o.id
WHERE o.status='shipped' AND st.id IS NULL ORDER BY o.id`);

console.log("== S. pending-no-attempt 9: oldest created_at; C3 6: same ==");
q(`SELECT MIN(o.created_at) oldest, MAX(o.created_at) newest FROM orders o
LEFT JOIN payments p ON p.order_id=o.id WHERE o.status='pending' AND p.id IS NULL`);

console.log("== T. verify classic figures ==");
q(`SELECT COUNT(*) n, ROUND(SUM(o.total),2) v FROM orders o LEFT JOIN payments p ON p.order_id=o.id WHERE p.id IS NULL`);
q(`SELECT COUNT(*) n FROM orders o LEFT JOIN shipments s ON s.order_id=o.id WHERE s.id IS NULL`);
q(`SELECT COUNT(*) n FROM shipments s WHERE s.delivered_at IS NULL`);
q(`SELECT COUNT(*) n, ROUND(SUM(amount),2) v FROM payments WHERE status='pending'`);
q(`SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.id IN (43,74,82,10,52,12,25,79,97)`);

console.log("== U. churned-open-money value + who ==");
q(`SELECT COUNT(*) n, ROUND(SUM(o.total),2) v FROM orders o
JOIN customers c ON c.id=o.customer_id
LEFT JOIN payments p ON p.order_id = o.id AND p.paid_at IS NOT NULL
WHERE p.id IS NULL AND c.active = 0`);

console.log("== V. C4 collision probe: s.id=o.id in C4 shape ==");
q(`SELECT COUNT(*) n FROM (
SELECT o.id FROM orders o
JOIN payments p ON p.order_id = o.id
LEFT JOIN shipments s ON s.id = o.id
WHERE s.id IS NULL GROUP BY o.id)`);

console.log("== W. C5 with INNER-join variant (for coaching) ==");
q(`SELECT COUNT(*) n FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN payments s ON s.order_id = r.order_id AND s.paid_at IS NOT NULL`);

console.log("== X. C2 with arm-shape probe: LEFT JOIN payments p AND p.status='settled' on pending ==");
q(`SELECT COUNT(*) n FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.paid_at IS NOT NULL
WHERE o.status='pending' AND p.id IS NULL`);
q(`SELECT COUNT(*) n FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.status='settled'
WHERE o.status='pending' AND p.id IS NULL`);

db.close();
