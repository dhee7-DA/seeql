// Probe 2 for j1c — distractor consequence pre-checks
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-j1c.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label} ==`);
  try { console.log(JSON.stringify(q(sql))); } catch (e) { console.log("ERR:", e instanceof Error ? e.message : e); }
};

// cs-218: does ON o.id = s.id (with DHL filter) change CONTENT?
show("T1 true DHL", `SELECT o.id, o.total, s.cost FROM shipments s JOIN orders o ON o.id = s.order_id WHERE s.carrier='DHL' ORDER BY s.cost DESC`);
show("T2 s.id collision DHL", `SELECT o.id, o.total, s.cost FROM shipments s JOIN orders o ON o.id = s.id WHERE s.carrier='DHL' ORDER BY s.cost DESC`);
show("T3 ORDER BY o.total vs s.cost first cells", `SELECT o.id FROM shipments s JOIN orders o ON o.id = s.order_id WHERE s.carrier='DHL' ORDER BY o.total DESC LIMIT 3`);

// cs-219: ON o.customer_id = p.order_id with pending
show("U1 true pending", `SELECT o.total, p.method, p.amount FROM payments p JOIN orders o ON o.id = p.order_id WHERE p.status='pending' ORDER BY p.id`);
show("U2 cust_id collision pending", `SELECT o.total, p.method, p.amount FROM payments p JOIN orders o ON o.customer_id = p.order_id WHERE p.status='pending' ORDER BY p.id`);
show("U3 failed payments exist?", `SELECT COUNT(*) FROM payments WHERE status='failed'`);

// cs-220: acquisition ON distractors
show("V1 true referral", `SELECT c.name, c.region, a.channel, a.spend FROM customers c JOIN acquisitions a ON c.id = a.customer_id WHERE a.channel='referral' ORDER BY a.spend DESC`);
show("V2 a.id collision", `SELECT c.name, c.region, a.channel, a.spend FROM customers c JOIN acquisitions a ON a.id = a.customer_id WHERE a.channel='referral' ORDER BY a.spend DESC`);
show("V3 a.customer_id self", `SELECT COUNT(*) FROM customers c JOIN acquisitions a ON a.customer_id = a.customer_id WHERE a.channel='referral'`);

// cs-221: refunds direction probes
show("W1 true leads", `SELECT e.name, e.role, r.reason, r.amount FROM employees e JOIN refunds r ON r.processed_by = e.id WHERE e.role='lead' ORDER BY r.id`);
show("W2 r.id collision leads", `SELECT e.name, e.role, r.reason, r.amount FROM employees e JOIN refunds r ON r.id = e.id WHERE e.role='lead' ORDER BY r.id`);
show("W3 employees w/ refunds count", `SELECT COUNT(DISTINCT e.id) FROM employees e JOIN refunds r ON r.processed_by = e.id`);
show("W4 manager literal count", `SELECT COUNT(*) FROM employees e JOIN refunds r ON r.processed_by = e.id WHERE e.role='manager'`);

// cs-222: order_items ON distractors under Audio
show("X1 true audio count", `SELECT COUNT(*) FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE p.category='Audio'`);
show("X2 oi.id collision", `SELECT COUNT(*) FROM order_items oi JOIN products p ON oi.id = oi.product_id WHERE p.category='Audio'`);
show("X3 oi.order_id collision", `SELECT COUNT(*) FROM order_items oi JOIN products p ON oi.order_id = oi.product_id WHERE p.category='Audio'`);
show("X4 p.supplier_id collision", `SELECT COUNT(*) FROM order_items oi JOIN products p ON p.supplier_id = oi.product_id WHERE p.category='Audio'`);

// cs-224: o.id = o.customer_id collision under filters; order 83 status
show("Y1 o.id=o.customer_id APAC>300", `SELECT COUNT(*) FROM orders o JOIN customers c ON o.id = o.customer_id WHERE c.region='APAC' AND o.total > 300`);
show("Y2 order 83", `SELECT id, status, total FROM orders WHERE id=83`);
show("Y3 true APAC>300 top rows", `SELECT o.id, o.total, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region='APAC' AND o.total > 300 ORDER BY o.total DESC LIMIT 4`);

// cs-225: 2-hop distractor probes under wrong_item
show("Z1 true wrong_item", `SELECT r.id, r.amount, c.name FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id WHERE r.reason='wrong_item'`);
show("Z2 o.customer_id collision", `SELECT r.id, r.amount, c.name FROM refunds r JOIN orders o ON o.customer_id = r.order_id JOIN customers c ON c.id = o.customer_id WHERE r.reason='wrong_item'`);
show("Z3 r.id collision", `SELECT r.id, r.amount, c.name FROM refunds r JOIN orders o ON r.id = r.order_id JOIN customers c ON c.id = o.customer_id WHERE r.reason='wrong_item'`);
show("Z4 r.order_id=cust collision", `SELECT r.id, r.amount, c.name FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON r.order_id = o.customer_id WHERE r.reason='wrong_item'`);

// cs-223: APAC ON distractors
show("P1 oi.order_id coll APAC", `SELECT COUNT(*) FROM order_items oi JOIN products p ON oi.order_id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.region='APAC'`);
show("P2 s.id=oi.product_id APAC", `SELECT COUNT(*) FROM order_items oi JOIN products p ON s.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.region='APAC'`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe2 done");
