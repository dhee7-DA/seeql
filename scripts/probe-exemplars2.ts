import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const q = (sql: string) => {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`--- ${sql}\n${JSON.stringify(rows.slice(0, 10), null, 1)}${rows.length > 10 ? `\n... ${rows.length} rows` : ""}`);
  } catch (e) {
    console.log(`--- ${sql}\nERROR: ${e}`);
  }
};

// j2: customers whose orders were never refunded (ghost-row COUNT territory)
q(`SELECT c.name, COUNT(r.id) AS refunds FROM customers c LEFT JOIN orders o ON o.customer_id = c.id LEFT JOIN refunds r ON r.order_id = o.id GROUP BY c.id HAVING COUNT(r.id) = 0`);
q(`SELECT COUNT(*) AS n FROM (SELECT c.id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id LEFT JOIN refunds r ON r.order_id = o.id GROUP BY c.id HAVING COUNT(r.id) = 0)`);

// j7 fan-out: revenue measured through the settled-payments join (inflated by split payments, population shifted)
q(`SELECT ROUND(SUM(o.total), 2) AS inflated FROM orders o JOIN payments p ON p.order_id = o.id WHERE p.status = 'settled'`);
q(`SELECT ROUND(SUM(p.amount), 2) AS cash FROM payments p WHERE p.status = 'settled'`);
q(`SELECT ROUND(SUM(o.total), 2) AS refunded_order_value FROM orders o JOIN refunds r ON r.order_id = o.id`);
q(`SELECT COUNT(DISTINCT r.order_id) AS orders_touched FROM refunds r`);
q(`SELECT id, total FROM orders WHERE id IN (SELECT order_id FROM refunds GROUP BY order_id HAVING COUNT(*) > 1)`);

// Alice acquisitions fan-out (growth board)
q(`SELECT c.name, ROUND(SUM(a.spend), 2) AS spend_all_touches, COUNT(a.id) AS touches FROM customers c JOIN acquisitions a ON a.customer_id = c.id GROUP BY c.id HAVING COUNT(a.id) > 1`);
q(`SELECT a.id, a.customer_id, a.channel, a.spend FROM acquisitions a WHERE a.customer_id = 1`);

// split-payment orders (cash desk fan-out)
q(`SELECT p.order_id, COUNT(*) AS n, GROUP_CONCAT(p.status) AS statuses FROM payments p GROUP BY p.order_id HAVING COUNT(*) > 1`);

// j1: supplier join figure (supplier audit) — EU supplier products
q(`SELECT COUNT(*) AS n FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.region = 'EU'`);

db.close();
rmSync(COPY, { force: true });
