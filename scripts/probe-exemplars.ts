// Probe exact figures for the three deck-2 exemplar cases.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`--- ${sql}\n${JSON.stringify(rows.slice(0, 12), null, 1)}${rows.length > 12 ? `\n... ${rows.length} rows total` : ""}`);
  } catch (e) {
    console.log(`--- ${sql}\nERROR: ${e}`);
  }
};

// j1 INNER exemplar — cash desk: settled payments with the customer's name
q(`SELECT COUNT(*) AS n FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id WHERE p.status = 'settled'`);
q(`SELECT p.id, c.name, p.amount, p.method FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id WHERE p.status = 'settled' ORDER BY p.id LIMIT 8`);

// j2 LEFT exemplar — receivables: customers whose delivered orders never settled
q(`SELECT c.name, COUNT(p.id) AS settled_payments FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled' GROUP BY c.id HAVING COUNT(p.id) = 0`);
q(`SELECT c.name, COUNT(p.id) AS settled FROM customers c LEFT JOIN payments p ON p.order_id = c.id GROUP BY c.id ORDER BY settled DESC LIMIT 4`);

// j7 fan-out exemplar — marketing: SUM(spend) inflated for Alice (2 acquisition rows)
q(`SELECT c.name, SUM(a.spend) AS inflated_spend, COUNT(a.id) AS touches FROM customers c JOIN acquisitions a ON a.customer_id = c.id GROUP BY c.id ORDER BY inflated_spend DESC LIMIT 5`);
q(`SELECT c.name, ROUND(SUM(a.spend), 2) AS honest_spend FROM customers c JOIN (SELECT customer_id, MAX(id) AS keep_id FROM acquisitions GROUP BY customer_id) k ON k.customer_id = c.id JOIN acquisitions a ON a.id = k.keep_id WHERE c.id = 1`);
q(`SELECT ROUND(SUM(amount), 2) AS cash_collected FROM payments WHERE status = 'settled'`);
q(`SELECT COUNT(*) AS n, ROUND(SUM(amount), 2) AS total FROM payments WHERE status = 'settled'`);

// general M2 figure pool
q(`SELECT COUNT(*) AS n FROM shipments WHERE delivered_at IS NULL`);
q(`SELECT carrier, COUNT(*) AS n, ROUND(SUM(cost), 2) AS spend FROM shipments GROUP BY carrier ORDER BY spend DESC`);
q(`SELECT reason, COUNT(*) AS n, ROUND(SUM(amount), 2) AS value FROM refunds GROUP BY reason ORDER BY value DESC`);
q(`SELECT e.name, COUNT(r.id) AS processed FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id WHERE e.role != 'manager' GROUP BY e.id ORDER BY processed DESC LIMIT 5`);
q(`SELECT c.name, o.id, o.total FROM orders o JOIN customers c ON c.id = o.customer_id LEFT JOIN shipments s ON s.order_id = o.id WHERE s.id IS NULL AND o.status != 'cancelled' ORDER BY o.id LIMIT 8`);

db.close();
rmSync(COPY, { force: true });
