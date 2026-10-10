/// <reference types="bun-types" />
/**
 * Probe pass 1 for batch j2c (cs-243..cs-250, topic j2 LEFT JOIN).
 * Copies db/custom.db to scripts/.probe-j2c.db (readonly), runs every figure
 * the batch wants to quote + every risky distractor substitution, prints a
 * fact sheet. The db copy is deleted at the end; this script stays.
 */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-j2c.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(sql: string, label = ""): any[] {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`\n== ${label || sql.slice(0, 90)}`);
    console.log(JSON.stringify(rows, (_, v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v)));
    return rows;
  } catch (e) {
    console.log(`\n== ${label || sql.slice(0, 90)}\nERROR: ${e instanceof Error ? e.message : e}`);
    return [];
  }
}

// ---------- baseline counts ----------
q(`SELECT (SELECT COUNT(*) FROM customers) c, (SELECT COUNT(*) FROM orders) o,
        (SELECT COUNT(*) FROM payments) p, (SELECT COUNT(*) FROM refunds) r,
        (SELECT COUNT(*) FROM shipments) s, (SELECT COUNT(*) FROM employees) e,
        (SELECT COUNT(*) FROM acquisitions) a, (SELECT COUNT(*) FROM products) pr,
        (SELECT COUNT(*) FROM suppliers) sup, (SELECT COUNT(*) FROM order_items) oi`,
  "table counts");

// ---------- cs-243: orders never shipped (LEFT JOIN shipments + IS NULL) ----------
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN shipments s ON s.order_id = o.id
   WHERE s.id IS NULL`, "cs-243 never-shipped orders (count)");
q(`SELECT o.id, c.name, o.status, o.total FROM orders o
   JOIN customers c ON c.id = o.customer_id
   LEFT JOIN shipments s ON s.order_id = o.id
   WHERE s.id IS NULL ORDER BY o.id LIMIT 30`, "cs-243 never-shipped list w/ names");
q(`SELECT o.status, COUNT(*) n FROM orders o
   LEFT JOIN shipments s ON s.order_id = o.id
   WHERE s.id IS NULL GROUP BY o.status`, "cs-243 never-shipped by status");
// distractor probes
q(`SELECT COUNT(*) n FROM orders o
   JOIN customers c ON c.id = o.customer_id
   JOIN shipments s ON s.id = o.id
   WHERE s.id IS NULL`, "cs-243 trap: INNER JOIN + s.id=o.id + IS NULL");
q(`SELECT COUNT(*) n FROM orders o
   JOIN customers c ON c.id = o.customer_id
   LEFT JOIN shipments s ON s.id = o.id
   WHERE s.id IS NULL`, "cs-243 trap: LEFT JOIN ON s.id=o.id + IS NULL");
q(`SELECT COUNT(*) n FROM orders o
   JOIN customers c ON c.id = o.customer_id
   LEFT JOIN shipments s ON s.order_id = o.id
   WHERE s.id = NULL`, "cs-243 trap: = NULL");
q(`SELECT COUNT(*) n FROM orders o
   JOIN customers c ON c.id = o.customer_id
   LEFT JOIN shipments s ON s.order_id = o.id
   WHERE s.id IS NOT NULL`, "cs-243 trap: IS NOT NULL");
q(`SELECT COUNT(*) n FROM orders o
   JOIN customers c ON c.id = o.customer_id
   LEFT JOIN shipments s ON c.id = o.id
   WHERE s.id IS NULL`, "cs-243 trap: ON c.id=o.id");
q(`SELECT COUNT(*) n FROM orders o
   JOIN customers c ON c.id = o.customer_id
   LEFT JOIN shipments s ON s.order_id = o.id
   WHERE s.order_id IS NULL`, "cs-243 trap: s.order_id IS NULL");
q(`SELECT COUNT(*) n FROM orders o
   JOIN customers c ON c.id = o.customer_id
   LEFT JOIN shipments s ON s.order_id = o.id
   WHERE o.id IS NULL`, "cs-243 trap: o.id IS NULL");

// ---------- cs-244: delivered orders with no SETTLED payment (arm filter in ON) ----------
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
   WHERE o.status = 'delivered' AND p.id IS NULL`, "cs-244 delivered w/o settled payment (count)");
q(`SELECT o.id, o.total FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
   WHERE o.status = 'delivered' AND p.id IS NULL ORDER BY o.id`, "cs-244 delivered w/o settled list");
// decomposition
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id
   WHERE p.id IS NULL`, "orders with NO payment row at all");
q(`SELECT o.status, COUNT(*) n FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id
   WHERE p.id IS NULL GROUP BY o.status`, "no-payment orders by status");
q(`SELECT o.id, o.total FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id
   WHERE o.status = 'delivered' AND p.id IS NULL AND
         o.id NOT IN (SELECT o2.id FROM orders o2 JOIN payments p2 ON p2.order_id=o2.id) 
   ORDER BY o.id`, "delivered orders with no payment row (prose only)");
q(`SELECT o.id, p.status, p.amount FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id
   WHERE o.status = 'delivered' AND p.id IS NOT NULL AND p.status = 'pending'`, "delivered orders with a pending payment");
// distractor probes
q(`SELECT COUNT(*) n FROM orders o
   JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
   WHERE o.status = 'delivered' AND p.id IS NULL`, "cs-244 trap: INNER + IS NULL");
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id AND o.status = 'settled'
   WHERE o.status = 'delivered' AND p.id IS NULL`, "cs-244 trap: o.status='settled' in ON");
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
   WHERE o.status = 'delivered' AND p.id IS NOT NULL`, "cs-244 trap: IS NOT NULL");
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'pending'
   WHERE o.status = 'delivered' AND p.id IS NULL`, "cs-244 trap: 'pending' arm");
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'failed'
   WHERE o.status = 'delivered' AND p.id IS NULL`, "cs-244 trap: 'failed' arm");
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
   WHERE o.status = 'shipped' AND p.id IS NULL`, "cs-244 trap: 'shipped' status filter");
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled'
   WHERE o.status = 'delivered' AND p.amount IS NULL`, "cs-244 trap: p.amount IS NULL");

// ---------- cs-245: month-close, in-transit legs (real NULLs, not ghosts) ----------
q(`SELECT COUNT(*) n FROM shipments s
   LEFT JOIN orders o ON o.id = s.order_id
   WHERE s.delivered_at IS NULL`, "cs-245 in-transit shipments (count)");
q(`SELECT s.carrier, COUNT(*) n, ROUND(SUM(s.cost),2) exposure, ROUND(MIN(s.cost),2) lo, ROUND(MAX(s.cost),2) hi
   FROM shipments s LEFT JOIN orders o ON o.id = s.order_id
   WHERE s.delivered_at IS NULL GROUP BY s.carrier`, "cs-245 in-transit by carrier");
q(`SELECT s.id, s.carrier, s.cost, o.total FROM shipments s
   LEFT JOIN orders o ON o.id = s.order_id
   WHERE s.delivered_at IS NULL AND s.carrier = 'DHL' ORDER BY s.cost DESC`, "cs-245 DHL in-transit list");
// distractor probes
q(`SELECT COUNT(*) n FROM shipments s LEFT JOIN orders o ON o.id = s.order_id
   WHERE o.total IS NULL AND s.carrier='DHL'`, "cs-245 trap: o.total IS NULL");
q(`SELECT COUNT(*) n FROM shipments s LEFT JOIN orders o ON o.id = s.order_id
   WHERE s.cost IS NULL AND s.carrier='DHL'`, "cs-245 trap: s.cost IS NULL");
q(`SELECT COUNT(*) n FROM shipments s LEFT JOIN orders o ON o.id = s.order_id
   WHERE s.delivered_at IS NOT NULL AND s.carrier='DHL'`, "cs-245 trap: IS NOT NULL");
q(`SELECT COUNT(*) n, ROUND(SUM(s.cost),2) FROM shipments s LEFT JOIN orders o ON o.id = s.order_id
   WHERE s.delivered_at IS NULL AND s.carrier='UPS'`, "cs-245 trap: 'UPS'");
q(`SELECT COUNT(*) n FROM shipments s LEFT JOIN orders o ON o.id = s.order_id
   WHERE s.delivered_at IS NULL AND s.carrier='FedEx'`, "cs-245 trap: 'FedEx'");
q(`SELECT COUNT(*) n FROM shipments s LEFT JOIN orders o ON o.id = s.order_id
   WHERE s.delivered_at IS NULL AND o.status = 'shipped'`, "cs-245 in-transit on shipped orders (context)");

// ---------- cs-246: org chart, managers without a manager (self LEFT JOIN) ----------
q(`SELECT id, name, role, manager_id, region FROM employees ORDER BY id`, "cs-246 roster");
q(`SELECT e.name, e.role, m.name AS manager_name FROM employees e
   LEFT JOIN employees m ON e.manager_id = m.id ORDER BY e.id`, "cs-246 LEFT self-join");
q(`SELECT COUNT(*) n FROM employees e
   JOIN employees m ON e.manager_id = m.id`, "cs-246 trap: INNER self-join");
q(`SELECT e.name, e.role, e.name AS manager_name FROM employees e
   LEFT JOIN employees m ON e.manager_id = m.id ORDER BY e.id LIMIT 4`, "cs-246 trap: e.name as manager");
q(`SELECT e.name, e.role, m.name FROM employees e
   LEFT JOIN employees m ON e.id = m.id ORDER BY e.id LIMIT 4`, "cs-246 trap: ON e.id=m.id");
q(`SELECT COUNT(*) n FROM employees e
   LEFT JOIN employees m ON m.manager_id = m.id`, "cs-246 trap: ON m.manager_id=m.id (no match)");
q(`SELECT e.name, m.name FROM employees e
   RIGHT JOIN employees m ON e.manager_id = m.id ORDER BY e.id`, "cs-246 context: RIGHT JOIN shape");

// ---------- cs-247: growth, referral arm-filter, organics kept ----------
q(`SELECT c.name, a.channel, a.spend FROM customers c
   LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'referral'
   ORDER BY c.id`, "cs-247 LEFT + referral arm (all customers)");
q(`SELECT COUNT(*) n FROM customers c
   JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'referral'`, "cs-247 trap: INNER");
q(`SELECT COUNT(*) n FROM customers c
   LEFT JOIN acquisitions a ON a.id = c.id AND a.channel = 'referral'`, "cs-247 trap: ON a.id=c.id");
q(`SELECT c.name, a.channel, a.spend FROM customers c
   LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'social' LIMIT 6`, "cs-247 trap: 'social' arm");
q(`SELECT COUNT(*) n FROM customers c
   LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'email'`, "cs-247 context: 'email' arm count");
q(`SELECT COUNT(*) n FROM customers c
   LEFT JOIN acquisitions a ON a.customer_id = c.id
   WHERE a.channel = 'referral'`, "cs-247 placement flip: channel in WHERE -> 4 rows");
q(`SELECT c.name, a.channel, a.spend FROM customers c
   LEFT JOIN acquisitions a ON a.customer_id = c.id
   ORDER BY a.spend DESC LIMIT 6`, "cs-247 ORDER BY a.spend DESC head (NULLs last)");
q(`SELECT c.name, a.channel, a.spend FROM customers c
   LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel='referral'
   ORDER BY c.name LIMIT 6`, "cs-247 ORDER BY c.name head");

// ---------- cs-248: cash, never-paid orders (HAVING COUNT(p.id)=0) ----------
q(`SELECT o.id, o.total, COUNT(p.id) AS payment_rows FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id
   GROUP BY o.id HAVING COUNT(p.id) = 0 ORDER BY o.id`, "cs-248 never-paid list");
q(`SELECT COUNT(*) n FROM orders o
   JOIN payments p ON p.order_id = o.id
   GROUP BY o.id HAVING COUNT(p.id) = 0`, "cs-248 trap: INNER -> empty");
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id
   GROUP BY o.id HAVING COUNT(*) = 0`, "cs-248 trap: COUNT(*)");
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id
   GROUP BY o.id HAVING COUNT(o.id) = 0`, "cs-248 trap: COUNT(o.id)");
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON p.id = o.id
   GROUP BY o.id HAVING COUNT(p.id) = 0`, "cs-248 trap: ON p.id=o.id");
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON o.id = o.id
   GROUP BY o.id HAVING COUNT(p.id) = 0`, "cs-248 trap: ON o.id=o.id fan-out");
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id
   GROUP BY o.id HAVING COUNT(p.id) = 1`, "cs-248 trap: =1");
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id
   GROUP BY o.id HAVING COUNT(p.id) = 2`, "cs-248 context: =2 (installments)");
q(`SELECT COUNT(*) n FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id
   GROUP BY o.id HAVING COUNT(p.id) = 3`, "cs-248 trap: =3");
q(`SELECT o.id, o.total, COUNT(p.id) AS payment_rows FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id
   GROUP BY o.id HAVING COUNT(p.id) = 0 ORDER BY o.id LIMIT 5`, "cs-248 head rows (cells contain 0)");
q(`SELECT ROUND(SUM(o.total),2) FROM orders o
   LEFT JOIN payments p ON p.order_id = o.id
   GROUP BY o.id HAVING COUNT(p.id) = 0`, "cs-248 never-paid exposure");

// ---------- cs-249: refund-audit, double-refunded tickets ----------
q(`SELECT o.id, c.name, COUNT(r.id) AS refund_rows, ROUND(SUM(r.amount),2) refunded
   FROM orders o
   JOIN customers c ON c.id = o.customer_id
   LEFT JOIN refunds r ON r.order_id = o.id
   GROUP BY o.id HAVING COUNT(r.id) = 2 ORDER BY o.id`, "cs-249 double-refunded list");
q(`SELECT COUNT(*) n FROM orders o
   JOIN customers c ON c.id = o.customer_id
   LEFT JOIN refunds r ON r.order_id = o.id
   GROUP BY o.id HAVING COUNT(r.id) = 1`, "cs-249 trap: =1");
q(`SELECT COUNT(*) n FROM orders o
   JOIN customers c ON c.id = o.customer_id
   LEFT JOIN refunds r ON r.order_id = o.id
   GROUP BY o.id HAVING COUNT(r.id) = 3`, "cs-249 trap: =3");
q(`SELECT o.id, c.name, COUNT(*) AS refund_rows FROM orders o
   JOIN customers c ON c.id = o.customer_id
   LEFT JOIN refunds r ON r.order_id = o.id
   GROUP BY o.id HAVING COUNT(*) = 2 ORDER BY o.id`, "cs-249 trap: COUNT(*) (=2)");
q(`SELECT o.id, c.name, COUNT(r.id) AS refund_rows FROM orders o
   JOIN customers c ON c.id = o.customer_id
   LEFT JOIN refunds r ON r.id = o.id
   GROUP BY o.id HAVING COUNT(r.id) = 2 ORDER BY o.id`, "cs-249 trap: ON r.id=o.id");
q(`SELECT o.id, c.name, SUM(r.id) AS x FROM orders o
   JOIN customers c ON c.id = o.customer_id
   LEFT JOIN refunds r ON r.order_id = o.id
   GROUP BY o.id HAVING SUM(r.id) = 2 ORDER BY o.id`, "cs-249 trap: SUM(r.id)=2");
q(`SELECT COUNT(*) n, ROUND(SUM(r.amount),2) FROM refunds`, "refund totals context");
q(`SELECT o.id, o.status FROM orders o
   JOIN refunds r ON r.order_id = o.id GROUP BY o.id HAVING COUNT(r.id) >= 2`, "double-refunded order statuses");

// ---------- cs-250: fraud, arrived-but-still-shipped data-quality ----------
q(`SELECT s.id, s.carrier, s.cost, o.id AS order_id, o.status, s.delivered_at
   FROM shipments s
   LEFT JOIN orders o ON o.id = s.order_id
   WHERE s.delivered_at IS NOT NULL AND o.status = 'shipped' ORDER BY s.id`, "cs-250 DQ rows");
q(`SELECT COUNT(*) n FROM shipments s
   JOIN orders o ON o.id = s.order_id
   WHERE s.delivered_at IS NOT NULL AND o.status = 'shipped'`, "cs-250 context: INNER same count");
q(`SELECT COUNT(*) n FROM shipments s
   LEFT JOIN orders o ON o.id = s.order_id
   WHERE o.shipped_at IS NOT NULL AND o.status = 'shipped'`, "cs-250 trap: o.shipped_at IS NOT NULL");
q(`SELECT COUNT(*) n FROM shipments s
   LEFT JOIN orders o ON s.id = s.order_id
   WHERE s.delivered_at IS NOT NULL AND o.status = 'shipped'`, "cs-250 trap: ON s.id=s.order_id");
q(`SELECT COUNT(*) n FROM shipments s
   LEFT JOIN orders o ON s.cost = s.order_id
   WHERE s.delivered_at IS NOT NULL AND o.status = 'shipped'`, "cs-250 trap: ON s.cost=s.order_id");
q(`SELECT COUNT(*) n FROM shipments s
   LEFT JOIN orders o ON o.id = s.order_id
   WHERE s.delivered_at IS NOT NULL AND o.status = 'delivered'`, "cs-250 trap: 'delivered'");
q(`SELECT COUNT(*) n FROM shipments s
   LEFT JOIN orders o ON o.id = s.order_id
   WHERE s.delivered_at IS NOT NULL AND o.status = 'pending'`, "cs-250 trap: 'pending'");
q(`SELECT COUNT(*) n FROM shipments s
   LEFT JOIN orders o ON o.id = s.order_id
   WHERE s.delivered_at IS NOT NULL AND s.carrier = 'shipped'`, "cs-250 trap: s.carrier = 'shipped'");
q(`SELECT COUNT(*) n FROM shipments s
   LEFT JOIN orders o ON o.id = s.order_id
   WHERE s.cost IS NOT NULL AND o.status = 'shipped'`, "cs-250 trap: s.cost IS NOT NULL");
q(`SELECT COUNT(*) n FROM shipments s
   LEFT JOIN orders o ON o.id = s.order_id
   WHERE o.total IS NOT NULL AND o.status = 'shipped'`, "cs-250 trap: o.total IS NOT NULL");
q(`SELECT o.status, COUNT(*) n FROM orders o WHERE o.shipped_at IS NULL GROUP BY o.status`, "context: orders.shipped_at NULL by status");

// ---------- extra context for prose ----------
q(`SELECT status, COUNT(*) n FROM orders GROUP BY status`, "order status mix");
q(`SELECT status, COUNT(*) n FROM payments GROUP BY status`, "payment status mix");
q(`SELECT reason, COUNT(*) n FROM refunds GROUP BY reason`, "refund reason mix");

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe copy deleted.");
