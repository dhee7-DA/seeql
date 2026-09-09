// Verify every number used in Module 1 deep-dive prose against the live engine.
import { execSync } from "node:child_process";

const QUERIES: Record<string, string> = {
  counts: `SELECT
    (SELECT COUNT(*) FROM customers)  AS customers,
    (SELECT COUNT(*) FROM products)   AS products,
    (SELECT COUNT(*) FROM suppliers)  AS suppliers,
    (SELECT COUNT(*) FROM orders)     AS orders,
    (SELECT COUNT(*) FROM order_items) AS order_items`,
  status: `SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY n DESC`,
  nulls: `SELECT
    SUM(CASE WHEN shipped_at IS NULL THEN 1 ELSE 0 END) AS null_shipped,
    SUM(CASE WHEN shipped_at IS NOT NULL THEN 1 ELSE 0 END) AS has_shipped,
    COUNT(*) AS total FROM orders`,
  distinct_cities: `SELECT COUNT(DISTINCT city) AS cities, COUNT(DISTINCT region) AS regions FROM customers`,
  price_range: `SELECT MIN(price) AS min_p, MAX(price) AS max_p, ROUND(AVG(price),2) AS avg_p FROM products`,
  stock: `SELECT MIN(stock) AS min_s, MAX(stock) AS max_s, ROUND(AVG(stock),1) AS avg_s, SUM(stock) AS total_units FROM products`,
  top3_price: `SELECT name, price FROM products ORDER BY price DESC LIMIT 3`,
  null_rating: `SELECT SUM(CASE WHEN rating IS NULL THEN 1 ELSE 0 END) AS null_ratings, COUNT(*) AS n FROM suppliers`,
  regions: `SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY n DESC`,
  like_demo: `SELECT COUNT(*) AS k_products FROM products WHERE name LIKE '%Pro%'`,
  order_value: `SELECT ROUND(AVG(quantity * unit_price), 2) AS avg_line_value, MIN(quantity*unit_price) AS min_line, MAX(quantity*unit_price) AS max_line FROM order_items`,
  cities_list: `SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC LIMIT 6`,
  total_gt_400: `SELECT COUNT(*) AS n FROM orders WHERE total > 400`,
  pending_and_big: `SELECT COUNT(*) AS n FROM orders WHERE status = 'pending' AND total > 400`,
  pending_or_shipped: `SELECT COUNT(*) AS n FROM orders WHERE status = 'pending' OR status = 'shipped'`,
  price_ties: `SELECT price, COUNT(*) AS n FROM products GROUP BY price HAVING COUNT(*) > 1 ORDER BY price`,
  like_lowercase: `SELECT COUNT(*) AS n FROM products WHERE name LIKE '%pro%'`,
  between_50_100: `SELECT COUNT(*) AS n FROM products WHERE price BETWEEN 50 AND 100`,
  region_in: `SELECT COUNT(*) AS n FROM customers WHERE region IN ('US', 'LATAM')`,
  nulls_first_asc: `SELECT id, status, shipped_at FROM orders ORDER BY shipped_at, id LIMIT 4`,
  expr_prec: `SELECT COUNT(*) AS n FROM orders WHERE status = 'pending' AND total > 400 OR status = 'cancelled'`,
  prec_fixed: `SELECT COUNT(*) AS n FROM orders WHERE status = 'pending' AND (total > 400 OR status = 'cancelled')`,
  count_star_vs_col: `SELECT COUNT(*) AS all_rows, COUNT(shipped_at) AS non_null_only FROM orders`,
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
