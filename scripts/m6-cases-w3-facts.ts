/// <reference types="bun-types" />
/** M6 wave-3 facts probe — x6 CROSS JOIN + x7 non-equi join grounds. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.m6w3-facts.db");
const db = new Database("scripts/.m6w3-facts.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(JSON.stringify(rows).slice(0, 1100));
  } catch (e) {
    console.log(`## ${label}\nERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// X6 grounds
q("X6 sizes", `SELECT (SELECT COUNT(*) FROM products) AS products, (SELECT COUNT(*) FROM suppliers) AS suppliers, (SELECT COUNT(*) FROM customers) AS customers, (SELECT COUNT(DISTINCT status) FROM orders) AS order_lanes, (SELECT COUNT(DISTINCT category) FROM products) AS categories`);
q("X6 categories", `SELECT DISTINCT category FROM products ORDER BY category`);
q("X6 supplier ratings", `SELECT name, rating, region FROM suppliers ORDER BY rating DESC`);
// deliberate pairing: product × same-region supplier
q("X6 cross same-region pairs", `SELECT COUNT(*) AS pairs FROM products p CROSS JOIN suppliers s WHERE p.supplier_id = s.id`);
q("X6 cross grid skeleton", `SELECT COUNT(*) AS cells FROM (SELECT DISTINCT strftime('%Y-%m', created_at) AS mo FROM orders) m CROSS JOIN (SELECT DISTINCT category FROM products) c`);
q("X6 cross pairs of lanes", `SELECT COUNT(*) AS combos FROM (SELECT DISTINCT status FROM orders) a CROSS JOIN (SELECT DISTINCT status FROM orders) b`);
q("X6 cross region-method", `SELECT COUNT(*) AS cells FROM (SELECT DISTINCT region FROM customers) r CROSS JOIN (SELECT DISTINCT method FROM payments) m`);
q("X6 cross price-x-supplier", `SELECT COUNT(*) AS cells FROM products p CROSS JOIN suppliers s WHERE s.rating >= 4`);
q("X6 cross cheap-vs-dear per pair", `SELECT COUNT(*) AS pairs FROM products a CROSS JOIN products b WHERE a.price < b.price`);
q("X6 cross same-cat pairs", `SELECT COUNT(*) AS pairs FROM products a CROSS JOIN products b WHERE a.category = b.category AND a.id < b.id`);
q("X6 cross max cell", `SELECT p.name, s.name AS supplier, ROUND(p.price * s.rating, 2) AS weighted FROM products p CROSS JOIN suppliers s ORDER BY weighted DESC LIMIT 3`);
q("X6 cross min cell", `SELECT p.name, s.name AS supplier, ROUND(p.price * s.rating, 2) AS weighted FROM products p CROSS JOIN suppliers s ORDER BY weighted ASC LIMIT 2`);

// X7 grounds (non-equi)
q("X7 price-ladder pairs", `SELECT COUNT(*) AS pairs FROM products a JOIN products b ON a.price < b.price`);
q("X7 biggest price gap pair", `SELECT a.name AS cheaper, b.name AS dearer, ROUND(b.price - a.price, 2) AS gap FROM products a JOIN products b ON a.price < b.price ORDER BY gap DESC LIMIT 3`);
q("X7 self-consecutive orders", `SELECT COUNT(*) AS seq_pairs FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.created_at < b.created_at`);
q("X7 per-customer max seq", `SELECT c.name, COUNT(*) AS pairs FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.created_at < b.created_at JOIN customers c ON c.id = a.customer_id GROUP BY a.customer_id ORDER BY pairs DESC, c.name LIMIT 5`);
q("X7 invoice-after-order fanout", `SELECT COUNT(*) AS matches FROM orders o JOIN invoices i ON i.customer_id = o.customer_id AND i.issued_on >= date(o.created_at)`);
q("X7 customers with such matches", `SELECT COUNT(DISTINCT o.customer_id) AS members FROM orders o JOIN invoices i ON i.customer_id = o.customer_id AND i.issued_on >= date(o.created_at)`);
q("X7 expense-ledger date overlap", `SELECT COUNT(*) AS hits FROM expenses e JOIN ledger_entries l ON l.entry_date = e.spent_on AND l.debit_cents > 0`);
q("X7 order-shipped latency bands", `SELECT COUNT(*) AS pairs FROM orders o JOIN orders o2 ON o.customer_id = o2.customer_id AND julianday(o2.created_at) - julianday(o.created_at) BETWEEN 0 AND 30`);
q("X7 rating-band products", `SELECT COUNT(*) AS hits FROM products p JOIN suppliers s ON p.price BETWEEN 10 * s.rating AND 40 * s.rating`);
q("X7 rating-band by supplier", `SELECT s.name, COUNT(*) AS hits FROM products p JOIN suppliers s ON p.price BETWEEN 10 * s.rating AND 40 * s.rating GROUP BY s.id ORDER BY hits DESC LIMIT 4`);
q("X7 price-below-stock-ratio", `SELECT COUNT(*) AS pairs FROM products a JOIN products b ON a.price < b.price AND a.category = b.category`);
q("X7 lag-style nearest pair", `SELECT COUNT(*) AS adj FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.created_at < b.created_at WHERE NOT EXISTS (SELECT 1 FROM orders m WHERE m.customer_id = a.customer_id AND m.created_at > a.created_at AND m.created_at < b.created_at)`);

db.close();
