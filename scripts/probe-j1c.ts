// Probe for j1c batch (cs-218..225) — run: cd /home/z/my-project && bun scripts/probe-j1c.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-j1c.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label} ==`);
  try {
    console.log(JSON.stringify(q(sql)));
  } catch (e) {
    console.log("ERR:", e instanceof Error ? e.message : e);
  }
};

// --- schema sanity
show("tables", `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`);
show("known: settled total", `SELECT COUNT(*), ROUND(SUM(amount),2) FROM payments WHERE status='settled'`);
show("known: order 33 payments", `SELECT id, amount, method FROM payments WHERE order_id=33`);
show("known: carriers", `SELECT carrier, COUNT(*) FROM shipments GROUP BY carrier ORDER BY carrier`);
show("known: employees", `SELECT id, name, role, manager_id, region FROM employees ORDER BY id`);

// --- A. shipments -> orders (cs-218 DHL bill)
show("A1 DHL rows", `SELECT o.id, o.total, s.cost, s.shipped_at FROM shipments s JOIN orders o ON o.id = s.order_id WHERE s.carrier='DHL' ORDER BY s.cost DESC`);
show("A2 shipments matched?", `SELECT COUNT(*) FROM shipments s JOIN orders o ON o.id = s.order_id`);
show("A3 DHL vs s.id collision (ON o.id = s.id)", `SELECT COUNT(*) FROM shipments s JOIN orders o ON o.id = s.id`);
show("A4 DHL costs distinct/ties", `SELECT s.cost, COUNT(*) FROM shipments s WHERE s.carrier='DHL' GROUP BY s.cost HAVING COUNT(*)>1`);
show("A5 DHL cost>12 count", `SELECT COUNT(*) FROM shipments s JOIN orders o ON o.id=s.order_id WHERE s.carrier='DHL' AND s.cost>12`);

// --- B. payments -> orders (cs-219 pending chase)
show("B1 pending payments", `SELECT p.id, o.id AS order_id, o.total, p.method, p.amount FROM payments p JOIN orders o ON o.id = p.order_id WHERE p.status='pending' ORDER BY p.id`);
show("B2 pending by method", `SELECT method, COUNT(*), ROUND(SUM(amount),2) FROM payments WHERE status='pending' GROUP BY method`);
show("B3 orders with no payment rows", `SELECT COUNT(*) FROM orders o JOIN payments p ON p.order_id=o.id`);
show("B4 do cancelled orders have payments?", `SELECT o.status, COUNT(DISTINCT o.id) FROM orders o JOIN payments p ON p.order_id=o.id GROUP BY o.status`);
show("B5 pending total", `SELECT COUNT(*), ROUND(SUM(amount),2) FROM payments WHERE status='pending'`);
show("B6 ON p.id = p.order_id probe", `SELECT COUNT(*) FROM payments p JOIN orders o ON p.id = p.order_id WHERE p.status='pending'`);

// --- C. acquisitions -> customers (cs-220 referral)
show("C1 channels", `SELECT channel, COUNT(*), ROUND(SUM(spend),2) FROM acquisitions GROUP BY channel`);
show("C2 referral rows w/ customer", `SELECT c.name, c.region, a.channel, a.spend FROM customers c JOIN acquisitions a ON c.id = a.customer_id WHERE a.channel='referral' ORDER BY a.spend DESC`);
show("C3 customers without acquisitions", `SELECT c.name FROM customers c LEFT JOIN acquisitions a ON a.customer_id = c.id WHERE a.id IS NULL`);
show("C4 join row count", `SELECT COUNT(*) FROM customers c JOIN acquisitions a ON c.id = a.customer_id`);
show("C5 referral total spend", `SELECT COUNT(*), ROUND(SUM(spend),2) FROM acquisitions WHERE channel='referral'`);

// --- D. refunds -> employees (cs-221) + refunds->orders->customers (cs-225)
show("D1 reasons", `SELECT reason, COUNT(*), ROUND(SUM(amount),2) FROM refunds GROUP BY reason`);
show("D2 refunds by processor w/ role", `SELECT e.name, e.role, COUNT(*) AS n, ROUND(SUM(r.amount),2) FROM refunds r JOIN employees e ON e.id = r.processed_by GROUP BY e.id ORDER BY n DESC`);
show("D3 NULL processed_by?", `SELECT COUNT(*) FROM refunds WHERE processed_by IS NULL`);
show("D4 refund join count vs refunds", `SELECT (SELECT COUNT(*) FROM refunds), (SELECT COUNT(*) FROM refunds r JOIN employees e ON e.id = r.processed_by)`);
show("D5 wrong_item rows 2-hop", `SELECT r.id, r.amount, c.name, o.id FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id WHERE r.reason='wrong_item'`);
show("D6 refunds by role", `SELECT e.role, COUNT(*) FROM refunds r JOIN employees e ON e.id = r.processed_by GROUP BY e.role`);
show("D7 leads detail", `SELECT e.name, e.role, e.region, r.id, r.amount, r.reason FROM refunds r JOIN employees e ON e.id = r.processed_by WHERE e.role='lead' ORDER BY r.id`);

// --- E. order_items -> products (cs-222 Audio)
show("E1 categories", `SELECT category, COUNT(*) FROM products GROUP BY category`);
show("E2 Audio lines", `SELECT p.name, oi.quantity, oi.unit_price, p.price FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.category='Audio' ORDER BY oi.id`);
show("E3 Audio unit != catalog count", `SELECT COUNT(*) FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.category='Audio' AND oi.unit_price != p.price`);
show("E4 Audio line count", `SELECT COUNT(*) FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.category='Audio'`);
show("E5 Wearables lines for distractor check", `SELECT COUNT(*) FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.category='Wearables'`);

// --- F. order_items -> products -> suppliers (cs-223 APAC)
show("F1 suppliers", `SELECT id, name, region, rating FROM suppliers ORDER BY id`);
show("F2 APAC lines", `SELECT p.name, s.name, oi.quantity FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.region='APAC' ORDER BY oi.id`);
show("F3 APAC line count", `SELECT COUNT(*) FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.region='APAC'`);
show("F4 EU line count (distractor)", `SELECT COUNT(*) FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.region='EU'`);
show("F5 s.id = p.id collision probe", `SELECT COUNT(*) FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.id WHERE s.region='APAC'`);
show("F6 supplier rating>=4.5 lines", `SELECT s.name, COUNT(*) FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.rating >= 4.5 GROUP BY s.id`);

// --- G. orders -> customers (cs-224 fraud)
show("G1 regions", `SELECT region, COUNT(*) FROM customers GROUP BY region`);
show("G2 APAC big tickets >300", `SELECT o.id, o.total, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region='APAC' AND o.total > 300 ORDER BY o.total DESC`);
show("G3 >300 APAC count; >500; >150", `SELECT (SELECT COUNT(*) FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='APAC' AND o.total>300), (SELECT COUNT(*) FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='APAC' AND o.total>500), (SELECT COUNT(*) FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='APAC' AND o.total>150)`);
show("G4 ON o.id = c.id collision", `SELECT COUNT(*) FROM orders o JOIN customers c ON o.id = c.id WHERE c.region='APAC' AND o.total > 300`);
show("G5 city list", `SELECT city, COUNT(*) FROM customers GROUP BY city ORDER BY COUNT(*) DESC`);

// --- H. syntax traps
show("H1 NATURAL JOIN with ON", `SELECT COUNT(*) FROM shipments s NATURAL JOIN orders o ON o.id = s.order_id`);
show("H2 INNER without JOIN", `SELECT COUNT(*) FROM shipments s INNER orders o ON o.id = s.order_id`);
show("H3 CROSS with ON", `SELECT COUNT(*) FROM shipments s CROSS JOIN orders o ON o.id = s.order_id WHERE s.carrier='DHL'`);
show("H4 DHL with CROSS ON count vs INNER", `SELECT COUNT(*) FROM shipments s JOIN orders o ON o.id = s.order_id WHERE s.carrier='DHL'`);
show("H5 LEFT JOIN DHL (same?)", `SELECT COUNT(*) FROM shipments s LEFT JOIN orders o ON o.id = s.order_id WHERE s.carrier='DHL'`);

// --- I. misc verifications for walkthrough prose
show("I1 in-transit 2-hop rows", `SELECT c.name, o.id, s.carrier FROM shipments s JOIN orders o ON o.id = s.order_id JOIN customers c ON c.id = o.customer_id WHERE s.delivered_at IS NULL ORDER BY c.name`);
show("I2 in-transit count", `SELECT COUNT(*) FROM shipments WHERE delivered_at IS NULL`);
show("I3 pending payments join count", `SELECT COUNT(*) FROM payments p JOIN orders o ON o.id = p.order_id WHERE p.status='pending'`);
show("I4 delivery method settled by card count", `SELECT COUNT(*), ROUND(SUM(amount),2) FROM payments WHERE status='settled' AND method='card'`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
