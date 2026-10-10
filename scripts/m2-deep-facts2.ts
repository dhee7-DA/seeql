// Supplementary M2 probes — schema-truth checks + remaining deep-dive numbers.
import { execSync } from "node:child_process";

const QUERIES: Record<string, string> = {
  amb_created_at: `SELECT created_at FROM orders o JOIN customers c ON c.id = o.customer_id LIMIT 1`,
  amb_id: `SELECT id FROM orders o JOIN customers c ON c.id = o.customer_id LIMIT 1`,
  bare_name_resolves: `SELECT name FROM orders o JOIN customers c ON c.id = o.customer_id LIMIT 1`,
  l12_no_shipped_full: `SELECT c.name, COUNT(o.id) AS shipped FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' GROUP BY c.id HAVING COUNT(o.id) = 0 ORDER BY c.name`,
  l15_ghost_delivered: `SELECT c.name, COUNT(*) AS count_star, COUNT(o.id) AS count_col FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' GROUP BY c.id HAVING COUNT(o.id) = 0`,
  l15_zeros_shipped: `SELECT c.name, COUNT(*) AS count_star, COUNT(o.id) AS count_col FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' GROUP BY c.id HAVING COUNT(o.id) = 0 ORDER BY c.name`,
  l16_line_counts: `SELECT n AS lines, COUNT(*) AS orders FROM (SELECT COUNT(*) AS n FROM order_items GROUP BY order_id) GROUP BY n ORDER BY n`,
  l16_biggest_orders: `SELECT order_id, COUNT(*) AS lines FROM order_items GROUP BY order_id ORDER BY lines DESC, order_id LIMIT 4`,
  l13_pending_missing_names: `SELECT p.name FROM products p LEFT JOIN (SELECT DISTINCT oi.product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status = 'pending') pend ON pend.product_id = p.id WHERE pend.product_id IS NULL ORDER BY p.name`,
  l14_apac_names: `SELECT name FROM customers WHERE region = 'APAC' ORDER BY name`,
  l14_latam_name: `SELECT name FROM customers WHERE region = 'LATAM'`,
  l12_liam_orders: `SELECT o.id, o.status FROM customers c JOIN orders o ON o.customer_id = c.id WHERE c.name = 'Liam O''Brien' ORDER BY o.id`,
  l9_alice: `SELECT COUNT(*) AS n, ROUND(SUM(total),2) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Alice Chen'`,
};

for (const [name, sql] of Object.entries(QUERIES)) {
  const out = execSync(
    `curl -s -m 20 -X POST http://localhost:3000/api/query -H "Content-Type: application/json" -d '${JSON.stringify({ sql }).replace(/'/g, "'\\''")}'`,
    { encoding: "utf8" },
  );
  try {
    const j = JSON.parse(out);
    console.log(`== ${name} ==`);
    if (j.ok) {
      console.log("  cols:", JSON.stringify(j.columns));
      for (const r of j.rows) console.log("  ", JSON.stringify(r));
    } else {
      console.log("  ERROR:", j.error);
    }
  } catch {
    console.log(`== ${name} == RAW:`, out.slice(0, 200));
  }
}
