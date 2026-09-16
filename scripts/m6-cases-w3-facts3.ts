/// <reference types="bun-types" />
/** M6 wave-3 probe round 3 — h-case figures. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.m6w3-facts3.db");
const db = new Database("scripts/.m6w3-facts3.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(JSON.stringify(rows).slice(0, 1100));
  } catch (e) {
    console.log(`## ${label}\nERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// Q1: year-bridge pairs (2024 cheaper x 2025 dearer)
q("Q1 year-bridge", `SELECT COUNT(*) AS n FROM invoices a JOIN invoices b ON a.amount_cents < b.amount_cents AND strftime('%Y', a.issued_on) = '2024' AND strftime('%Y', b.issued_on) = '2025'`);
q("Q1b alt 2025x2024", `SELECT COUNT(*) AS n FROM invoices a JOIN invoices b ON a.amount_cents < b.amount_cents AND strftime('%Y', a.issued_on) = '2025' AND strftime('%Y', b.issued_on) = '2024'`);
// Q2: invoice-after-order per-member top
q("Q2 fanout per member", `SELECT c.name, COUNT(*) AS matches FROM orders o JOIN invoices i ON i.customer_id = o.customer_id AND i.issued_on >= date(o.created_at) JOIN customers c ON c.id = o.customer_id GROUP BY o.customer_id ORDER BY matches DESC, c.name LIMIT 4`);
// Q3: delivered-delivered per-member top
q("Q3 delivered pairs per member", `SELECT c.name, COUNT(*) AS pairs FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.created_at < b.created_at AND a.status = 'delivered' AND b.status = 'delivered' JOIN customers c ON c.id = a.customer_id GROUP BY a.customer_id ORDER BY pairs DESC, c.name LIMIT 4`);
// Q4: quick-bill bands
q("Q4 bill 0-30d", `SELECT COUNT(*) AS n FROM orders o JOIN invoices i ON i.customer_id = o.customer_id AND julianday(i.issued_on) - julianday(o.created_at) BETWEEN 0 AND 30`);
q("Q4b bill 0-7d", `SELECT COUNT(*) AS n FROM orders o JOIN invoices i ON i.customer_id = o.customer_id AND julianday(i.issued_on) - julianday(o.created_at) BETWEEN 0 AND 7`);
q("Q4c bill 0-60d", `SELECT COUNT(*) AS n FROM orders o JOIN invoices i ON i.customer_id = o.customer_id AND julianday(i.issued_on) - julianday(o.created_at) BETWEEN 0 AND 60`);
// Q5: nearest pairs per member (fixed)
q("Q5 nearest per member", `SELECT c.name, COUNT(*) AS steps FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.created_at < b.created_at JOIN customers c ON c.id = a.customer_id WHERE NOT EXISTS (SELECT 1 FROM orders m WHERE m.customer_id = a.customer_id AND m.created_at > a.created_at AND m.created_at < b.created_at) GROUP BY a.customer_id ORDER BY steps DESC, c.name LIMIT 3`);
// Q6: biggest silence check
q("Q6 max silence", `SELECT c.name, ROUND(MAX(julianday(b.created_at) - julianday(a.created_at))) AS silence FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.created_at < b.created_at JOIN customers c ON c.id = a.customer_id WHERE NOT EXISTS (SELECT 1 FROM orders m WHERE m.customer_id = a.customer_id AND m.created_at > a.created_at AND m.created_at < b.created_at) GROUP BY a.customer_id ORDER BY silence DESC LIMIT 2`);
// Q7: ratio ladder top
q("Q7 ratio top", `SELECT a.name AS cheap, b.name AS dear, ROUND(b.price / a.price, 2) AS ratio FROM products a JOIN products b ON a.price < b.price ORDER BY ratio DESC LIMIT 2`);
// Q8: supplier rating distance top
q("Q8 distance top", `SELECT a.name AS lower, b.name AS higher, ROUND(b.rating - a.rating, 2) AS distance FROM suppliers a JOIN suppliers b ON a.rating < b.rating ORDER BY distance DESC LIMIT 2`);

db.close();
