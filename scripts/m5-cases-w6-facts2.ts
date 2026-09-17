/// <reference types="bun-types" />
/** M5 wave-6 facts probe round 2 — fresh partition grounds. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.w6-facts4.db");
const db = new Database("scripts/.w6-facts4.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(JSON.stringify(rows).slice(0, 800));
  } catch (e) {
    console.log(`## ${label}\nERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// t6 fresh grounds
q("P1 max ticket per status lane", `SELECT status, name, total FROM (SELECT o.status, c.name, o.total, MAX(o.total) OVER (PARTITION BY o.status) AS top FROM orders o JOIN customers c ON c.id = o.customer_id) WHERE total = top ORDER BY total DESC`);
q("P2 products per supplier bench", `SELECT s.name, COUNT(*) AS bench FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY bench DESC, s.name`);
q("P3 max price per supplier", `SELECT s.name, p.name AS product, p.price FROM (SELECT p.supplier_id, p.name, p.price, MAX(p.price) OVER (PARTITION BY p.supplier_id) AS top FROM products p) p JOIN suppliers s ON s.id = p.supplier_id WHERE p.price = p.top ORDER BY p.price DESC`.replace("p.name AS product, p.price", "p.price, p.name AS product").replace("SELECT s.name, ", "SELECT s.name AS supplier, "));
q("P4 city census", `SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC, city`);
q("P5 open invoice pot per region", `SELECT c.region, SUM(i.amount_cents) AS pot, COUNT(*) AS n FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'open' GROUP BY c.region ORDER BY pot DESC`);
q("P6 paid invoice pot per region", `SELECT c.region, SUM(i.amount_cents) AS pot FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'paid' GROUP BY c.region ORDER BY pot DESC`);
q("P7 payment running per method (finals)", `SELECT method, run FROM (SELECT method, ROUND(SUM(SUM(amount_cents)) OVER (PARTITION BY method ORDER BY paid_on), 2) / 100 AS run FROM payments GROUP BY method, paid_on) WHERE 1=1 GROUP BY method HAVING MAX(run)`.replace("WHERE 1=1 GROUP BY method HAVING MAX(run)", "").replace("SELECT method, run", "SELECT method, run") + " ");
q("P7b wire/card final pots", `SELECT method, SUM(amount_cents) AS pot FROM payments GROUP BY method`);
q("P8 min expense per category", `SELECT category, MIN(amount_cents) AS min_c, MAX(amount_cents) AS max_c, COUNT(*) AS n FROM expenses GROUP BY category`);
q("P9 expense month pots full", `SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents) AS pot FROM expenses GROUP BY mo ORDER BY mo`);
q("P10 stock ladder global", `SELECT name, stock, ROW_NUMBER() OVER (ORDER BY stock DESC) AS rn FROM products ORDER BY rn`);
q("P11 video/wearables stock", `SELECT name, category, stock FROM products WHERE category IN ('Video', 'Wearables')`);
q("P12 customer quartile pots", `SELECT q, ROUND(SUM(spend), 2) AS pot, COUNT(*) AS n FROM (SELECT ROUND(SUM(total), 2) AS spend, NTILE(4) OVER (ORDER BY SUM(total)) AS q FROM orders GROUP BY customer_id) GROUP BY q ORDER BY q`);
q("P13 gaps > 60 and > 20", `SELECT SUM(CASE WHEN gap > 60 THEN 1 ELSE 0 END) AS g60, SUM(CASE WHEN gap > 20 THEN 1 ELSE 0 END) AS g20, COUNT(*) AS total_gaps FROM (SELECT julianday(created_at) - LAG(julianday(created_at)) OVER (PARTITION BY customer_id ORDER BY created_at) AS gap FROM orders) WHERE gap IS NOT NULL`);
q("P14 invoice terms census", `SELECT julianday(due_on) - julianday(issued_on) AS terms, COUNT(*) AS n FROM invoices GROUP BY terms ORDER BY n DESC`);
q("P15 settlement max per method", `SELECT p2.method, MAX(p2.days) AS max_days FROM (SELECT p.method, p.invoice_id, julianday(p.paid_on) - julianday(i.issued_on) AS days FROM payments p JOIN invoices i ON i.id = p.invoice_id) p2 GROUP BY p2.method`);
q("P16 bruno gaps", `SELECT c.name, julianday(o.created_at) - LAG(julianday(o.created_at)) OVER (PARTITION BY o.customer_id ORDER BY o.created_at) AS gap FROM customers c JOIN orders o ON o.customer_id = c.id WHERE c.name = 'Bruno Silva'`.replace("WHERE c.name = 'Bruno Silva'", " WHERE c.name = 'Bruno Silva' ORDER BY o.created_at"));
q("P17 customers per city partition rows", `SELECT name, city, COUNT(*) OVER (PARTITION BY city) AS bench FROM customers ORDER BY bench DESC LIMIT 6`);

db.close();
