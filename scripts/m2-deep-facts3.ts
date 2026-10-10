// Final M2 probes — edge-case gallery numbers for the deep dives.
import { execSync } from "node:child_process";

const QUERIES: Record<string, string> = {
  l9_active_only: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.active = 1`,
  l10_eu_on: `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id AND c.region = 'EU'`,
  l11_apac_lines: `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id WHERE c.region = 'APAC'`,
  l12_on_shipped_total: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'`,
  l12_where_shipped: `SELECT COUNT(*) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.status = 'shipped'`,
  l13_not_exists_pending: `SELECT COUNT(*) AS n FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.product_id = p.id AND o.status = 'pending')`,
  l14_categories: `SELECT COUNT(DISTINCT category) AS cats FROM products`,
  l15_liam_avg: `SELECT c.name, ROUND(AVG(o.total), 2) AS avg_total, ROUND(SUM(o.total), 2) AS sum_total FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' GROUP BY c.id HAVING COUNT(o.id) = 0`,
  l16_sum_distinct: `SELECT ROUND(SUM(DISTINCT o.total), 2) AS s FROM orders o JOIN order_items oi ON oi.order_id = o.id`,
  l9_cross_join_kw: `SELECT COUNT(*) AS n FROM orders o CROSS JOIN customers c`,
};

for (const [name, sql] of Object.entries(QUERIES)) {
  const out = execSync(
    `curl -s -m 20 -X POST http://localhost:3000/api/query -H "Content-Type: application/json" -d '${JSON.stringify({ sql }).replace(/'/g, "'\\''")}'`,
    { encoding: "utf8" },
  );
  try {
    const j = JSON.parse(out);
    console.log(`== ${name} ==`);
    if (j.ok) { console.log("  cols:", JSON.stringify(j.columns)); for (const r of j.rows) console.log("  ", JSON.stringify(r)); }
    else console.log("  ERROR:", j.error);
  } catch { console.log(`== ${name} == RAW:`, out.slice(0, 200)); }
}
