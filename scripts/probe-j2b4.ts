/// <reference types="bun-types" />
// probe-j2b4.ts — remaining j2b figures + distractor-consequence pre-checks
// (runs on a COPY of db/custom.db, readonly; copy self-deletes).
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-j2b4.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string, max = 40) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`\n## ${label}  (${rows.length} rows)`);
    for (const r of rows.slice(0, max)) console.log(JSON.stringify(r));
  } catch (e) {
    console.log(`\n## ${label} — ERROR: ${e instanceof Error ? e.message : e}`);
  }
}

// cs-235 extras
q("235 'cancelled' arm variant", `
SELECT c.name, COUNT(o.id) AS open_tickets FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled'
GROUP BY c.id ORDER BY open_tickets DESC, c.name`);
q("235 pending exact total", `SELECT COUNT(*) n, ROUND(SUM(total),2) v FROM orders WHERE status = 'pending'`);
q("235 INNER variant rows", `
SELECT c.name, COUNT(o.id) AS open_tickets FROM customers c
JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'
GROUP BY c.id ORDER BY open_tickets DESC, c.name`);
q("235 WHERE-placement rows", `
SELECT c.name, COUNT(o.id) AS open_tickets FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'pending'
GROUP BY c.id ORDER BY open_tickets DESC, c.name`);

// cs-236 extras
q("236 products price >= 100", `
SELECT p.name, p.price, s.name AS supplier FROM products p JOIN suppliers s ON s.id = p.supplier_id
WHERE p.price >= 100 ORDER BY p.price DESC`);
q("236 INNER variant count", `
SELECT COUNT(*) n FROM suppliers s JOIN products p ON p.supplier_id = s.id AND p.price >= 100`);
q("236 min/max catalog price", `SELECT MIN(price) mn, MAX(price) mx FROM products`);

// cs-237 extras
q("237 INNER variant (complement)", `
SELECT e.name, e.role FROM employees e
JOIN refunds r ON r.processed_by = e.id AND r.reason = 'damaged'
GROUP BY e.id ORDER BY e.name`);
q("237 IS NOT NULL variant count", `
SELECT COUNT(*) n FROM employees e
LEFT JOIN refunds r ON r.processed_by = e.id AND r.reason = 'damaged'
WHERE r.id IS NOT NULL`);

// cs-238 extras
q("238 orders with zero lines", `
SELECT COUNT(*) n FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id WHERE oi.id IS NULL`);
q("238 INNER variant count", `
SELECT COUNT(*) n FROM orders o
JOIN order_items oi ON oi.order_id = o.id AND oi.unit_price >= 100`);
q("238 AND-arm variant count", `
SELECT COUNT(*) n FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id AND oi.unit_price >= 100 AND oi.id IS NULL`);

// cs-240 extras
q("240 shipped arm count", `
SELECT COUNT(*) n FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.method = 'card' WHERE o.status = 'shipped'`);
q("240 delivered arm count", `
SELECT COUNT(*) n FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.method = 'card' WHERE o.status = 'delivered'`);
q("240 cancelled arm count", `
SELECT COUNT(*) n FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.method = 'card' WHERE o.status = 'cancelled'`);
q("240 o12 status", `SELECT o.id, o.status, o.total FROM orders o WHERE o.id = 12`);
q("240 pending total exact", `SELECT ROUND(SUM(total),2) v FROM orders WHERE status = 'pending'`);

// cs-241 extras
q("241 r.id=e.id collision (named rows)", `
SELECT r.id, e.name FROM refunds r
LEFT JOIN employees e ON e.id = r.id AND e.role = 'rep'
WHERE e.name IS NOT NULL ORDER BY r.id`);
q("241 r.id=e.id collision (all rows sample)", `
SELECT r.id, r.amount, e.name FROM refunds r
LEFT JOIN employees e ON e.id = r.id AND e.role = 'rep' ORDER BY r.id`, 12);

// cs-242 extras
q("242 correct fill bar 4.5 (full)", `
SELECT p.name, s.name AS supplier, s.rating FROM products p
LEFT JOIN suppliers s ON s.id = p.supplier_id AND s.rating >= 4.5
WHERE s.id IS NULL ORDER BY p.name`);
q("242 bar 4.4 count", `
SELECT COUNT(*) n FROM products p
LEFT JOIN suppliers s ON s.id = p.supplier_id AND s.rating >= 4.4 WHERE s.id IS NULL`);
q("242 bar 4.8 count", `
SELECT COUNT(*) n FROM products p
LEFT JOIN suppliers s ON s.id = p.supplier_id AND s.rating >= 4.8 WHERE s.id IS NULL`);
q("242 s.id=p.id collision count", `
SELECT COUNT(*) n FROM products p
LEFT JOIN suppliers s ON s.id = p.id AND s.rating >= 4.5 WHERE s.id IS NULL`);
q("242 p.price arm variant count", `
SELECT COUNT(*) n FROM products p
LEFT JOIN suppliers s ON s.id = p.supplier_id AND p.price >= 4.5 WHERE s.id IS NULL`);
q("242 min catalog price", `SELECT MIN(price) mn FROM products`);
q("242 products with NULL supplier_id", `SELECT COUNT(*) n FROM products WHERE supplier_id IS NULL`);

// global sanity
q("orders statuses", `SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY n DESC`);

db.close();
rmSync(COPY, { force: true });
console.log("\n(probe copy deleted)");
