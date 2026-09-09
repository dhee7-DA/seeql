/// <reference types="bun-types" />
// HB probe round 2 — distractor consequence checks.
import { Database } from "bun:sqlite";
const db = new Database("scripts/.probe-hb.db", { readonly: true });

const Q: Array<[string, string]> = [
  ["285.distinct-status-ge2", `SELECT COUNT(*) FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(DISTINCT status) >= 2)`],
  ["285.distinct-status-ge4", `SELECT customer_id, COUNT(DISTINCT status) AS stages FROM orders GROUP BY customer_id HAVING COUNT(DISTINCT status) >= 4 ORDER BY customer_id`],
  ["289.total-ge-700", `SELECT status, COUNT(*) AS n, ROUND(SUM(total),2) AS value FROM orders WHERE total >= 700 GROUP BY status ORDER BY value DESC`],
  ["289.total-ge-800-having1", `SELECT status, COUNT(*) AS n FROM orders WHERE total >= 800 GROUP BY status HAVING COUNT(*) >= 1`],
  ["299.orderid-productid-pairs", `SELECT COUNT(*) AS pairs FROM (SELECT order_id, product_id FROM order_items GROUP BY order_id, product_id HAVING COUNT(*) >= 3)`],
  ["296.between-450-500", `SELECT supplier_id, SUM(stock) AS units FROM products GROUP BY supplier_id HAVING SUM(stock) BETWEEN 450 AND 500 ORDER BY units DESC`],
  ["296.between-700-500", `SELECT supplier_id FROM products GROUP BY supplier_id HAVING SUM(stock) BETWEEN 700 AND 500`],
  ["296.count-stock-bucket", `SELECT supplier_id FROM products GROUP BY supplier_id HAVING COUNT(stock) BETWEEN 300 AND 500`],
  ["283.max-ge-120", `SELECT supplier_id FROM products GROUP BY supplier_id HAVING MAX(price) >= 120`],
  ["283.max-ge-200", `SELECT supplier_id FROM products GROUP BY supplier_id HAVING MAX(price) >= 200`],
  ["284.price-lt-40", `SELECT category, COUNT(*) AS items FROM products WHERE price < 40 GROUP BY category HAVING COUNT(*) >= 2`],
  ["284.having-ge-3", `SELECT category, COUNT(*) AS items FROM products WHERE price < 50 GROUP BY category HAVING COUNT(*) >= 3 ORDER BY items DESC LIMIT 2`],
  ["288.limit5-offset10", `SELECT id, name, created_at FROM customers ORDER BY created_at DESC, id LIMIT 5 OFFSET 10`],
  ["291.having-ge-3000", `SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total),2) AS revenue FROM orders WHERE shipped_at IS NOT NULL GROUP BY month HAVING SUM(total) >= 3000 ORDER BY revenue DESC LIMIT 3`],
  ["293.avg-gt-75", `SELECT supplier_id FROM products GROUP BY supplier_id HAVING COUNT(*) = 2 AND AVG(price) > 75`],
  ["295.sum-active-ge5", `SELECT region, COUNT(*) AS members, SUM(active) AS activated FROM customers GROUP BY region HAVING SUM(active) >= 5 ORDER BY activated DESC, members DESC`],
  ["290.min-ge-90", `SELECT category, MIN(stock) AS floor_units FROM products GROUP BY category HAVING MIN(stock) >= 90 ORDER BY MIN(stock) DESC`],
  ["290.max-ge-100", `SELECT category, MAX(stock) AS top_units FROM products GROUP BY category HAVING MAX(stock) >= 100 ORDER BY MAX(stock) DESC`],
  ["300.price-lt-150", `SELECT category, COUNT(*) AS skus, ROUND(AVG(price),2) AS avg_price FROM products WHERE price < 150 GROUP BY category HAVING COUNT(*) >= 2 ORDER BY avg_price DESC LIMIT 2`],
  ["300.price-lt-50", `SELECT category, COUNT(*) AS skus, ROUND(AVG(price),2) AS avg_price FROM products WHERE price < 50 GROUP BY category HAVING COUNT(*) >= 2 ORDER BY avg_price DESC LIMIT 2`],
  ["287.date-probe", `SELECT DATE('%Y-%m', shipped_at) AS d, COUNT(*) AS n FROM orders GROUP BY d ORDER BY d LIMIT 5`],
  ["281.count-total", `SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS booked, COUNT(total) AS dispatched FROM orders GROUP BY month HAVING COUNT(*) <> COUNT(total) ORDER BY month`],
  ["286.price-ge-60", `SELECT name, price, stock FROM products WHERE supplier_id IN (1, 2, 3, 5) AND price >= 60 AND stock <= 110 ORDER BY stock ASC`],
  ["286.or-version", `SELECT name, price, stock FROM products WHERE supplier_id IN (1, 2, 3, 5) AND price >= 45 OR stock <= 110 ORDER BY stock ASC`],
  ["280.like-version", `SELECT COUNT(*) AS n FROM products WHERE price BETWEEN 30 AND 100 AND stock >= 60 AND category NOT LIKE ('Accessories')`],
  ["280.between-50-100", `SELECT COUNT(*) AS n FROM products WHERE price BETWEEN 50 AND 100 AND stock >= 60 AND category NOT IN ('Accessories')`],
  ["280.between-30-50", `SELECT COUNT(*) AS n FROM products WHERE price BETWEEN 30 AND 50 AND stock >= 60 AND category NOT IN ('Accessories')`],
  ["294.limit3", `SELECT order_id, product_id, quantity, unit_price FROM order_items ORDER BY quantity DESC, unit_price DESC LIMIT 3`],
  ["285.sum-status", `SELECT customer_id, SUM(status) AS s FROM orders GROUP BY customer_id LIMIT 3`],
  ["297.product-id-spend", `SELECT product_id, COUNT(*) AS lines, ROUND(SUM(product_id * unit_price), 2) AS spend FROM order_items WHERE quantity >= 2 GROUP BY product_id HAVING SUM(quantity * unit_price) > 300 ORDER BY spend DESC LIMIT 3`],
];

for (const [tag, sql] of Q) {
  try {
    const res = db.query(sql).all() as Record<string, unknown>[];
    const cols = res.length ? Object.keys(res[0]) : [];
    console.log(`## ${tag}`);
    if (!res.length) console.log("   (0 rows)");
    for (const r of res.slice(0, 12)) {
      console.log("   " + cols.map((c) => `${c}=${JSON.stringify(r[c])}`).join(" | "));
    }
    if (res.length > 12) console.log(`   ... total ${res.length} rows`);
  } catch (e) {
    console.log(`## ${tag}\n   ERROR: ${e instanceof Error ? e.message : e}`);
  }
}
db.close();
