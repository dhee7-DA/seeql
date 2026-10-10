// probe-sb.ts — verify landing-sandbox starter queries (readonly copy, self-cleaning).
import { copyFileSync, rmSync } from "node:fs";
import { Database } from "bun:sqlite";

const COPY = "scripts/.tmp-sb.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const STARTERS: Array<[string, string]> = [
  ["status buckets (hero parity + ORDER BY)", `SELECT status, COUNT(*) AS n FROM orders GROUP BY status HAVING COUNT(*) > 10 ORDER BY n DESC`],
  ["revenue by region", `SELECT c.region, ROUND(SUM(o.total), 2) AS revenue FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY revenue DESC`],
  ["anti-join: customers with no refunds", `SELECT c.name, c.region FROM customers c LEFT JOIN refunds r ON r.order_id IN (SELECT id FROM orders WHERE customer_id = c.id) WHERE r.id IS NULL`],
  ["anti-join alt: customers never acquired", `SELECT c.name FROM customers c LEFT JOIN acquisitions a ON a.customer_id = c.id WHERE a.id IS NULL`],
  ["anti-join alt2: products never ordered", `SELECT p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL`],
  ["refund ledger by rep", `SELECT e.name, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded FROM refunds r JOIN employees e ON e.id = r.processed_by GROUP BY e.name ORDER BY refunded DESC`],
  ["split-payment fan-out", `SELECT o.id AS order_id, COUNT(p.id) AS payment_rows, ROUND(SUM(p.amount), 2) AS paid FROM payments p JOIN orders o ON o.id = p.order_id GROUP BY o.id HAVING COUNT(p.id) > 1 ORDER BY o.id`],
  ["plain SELECT * FROM orders LIMIT 5", `SELECT * FROM orders LIMIT 5`],
];

for (const [title, sql] of STARTERS) {
  console.log(`\n## ${title}`);
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    if (rows.length === 0) { console.log("(0 rows)"); continue; }
    const slim = rows.slice(0, 8).map((r) => Object.values(r).map((v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v)));
    console.log(`(${rows.length} rows) ${JSON.stringify(slim)}`);
  } catch (e) {
    console.log(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}

db.close();
rmSync(COPY);
console.log("\ncopy cleaned");
