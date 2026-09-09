/// <reference types="bun-types" />
// HB probe — read-only figures for cases cs-280..300. DELETE AFTER USE.
import { Database } from "bun:sqlite";
const db = new Database("scripts/.probe-hb.db", { readonly: true });

const Q: Array<[string, string]> = [
  ["280.products-midband", `SELECT name, category, price, stock FROM products WHERE price BETWEEN 30 AND 100 AND stock >= 60 AND category NOT IN ('Accessories') ORDER BY price DESC`],
  ["280.alt-count", `SELECT COUNT(*) FROM products WHERE price BETWEEN 30 AND 100 AND stock >= 60 AND category NOT IN ('Accessories')`],
  ["281.month-dispatch-split", `SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS booked, COUNT(shipped_at) AS dispatched FROM orders GROUP BY month HAVING COUNT(*) <> COUNT(shipped_at) ORDER BY month`],
  ["281.month-dispatch-all", `SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS booked, COUNT(shipped_at) AS dispatched FROM orders GROUP BY month ORDER BY month`],
  ["282.cancelled-desc-all", `SELECT id, ROUND(total,2) AS total, status FROM orders WHERE status = 'cancelled' ORDER BY total DESC`],
  ["282.cancelled-page2", `SELECT id, ROUND(total,2) AS total FROM orders WHERE status = 'cancelled' ORDER BY total DESC LIMIT 4 OFFSET 2`],
  ["283.supplier-price-census", `SELECT supplier_id, COUNT(*) AS skus, ROUND(AVG(price),2) AS avg_price, ROUND(MAX(price),2) AS top_price FROM products GROUP BY supplier_id ORDER BY avg_price DESC`],
  ["284.entry-shelves", `SELECT category, COUNT(*) AS items FROM products WHERE price < 50 GROUP BY category HAVING COUNT(*) >= 2 ORDER BY items DESC LIMIT 2`],
  ["285.distinct-status-per-customer", `SELECT customer_id, COUNT(DISTINCT status) AS stages, COUNT(*) AS orders FROM orders GROUP BY customer_id HAVING COUNT(DISTINCT status) >= 3 ORDER BY orders DESC, customer_id`],
  ["286.sourcing-shortlist", `SELECT name, supplier_id, price, stock FROM products WHERE supplier_id IN (1, 2, 3, 5) AND price >= 45 AND stock <= 120 ORDER BY stock ASC`],
  ["286.alt-stockorder", `SELECT name, price, stock FROM products WHERE supplier_id IN (1, 2, 3, 5) AND price >= 45 AND stock <= 120 ORDER BY stock ASC`],
  ["287.billing-ladder", `SELECT COALESCE(strftime('%Y-%m', shipped_at), 'unbilled') AS billing_month, COUNT(*) AS orders, ROUND(SUM(total), 2) AS value FROM orders GROUP BY billing_month ORDER BY billing_month`],
  ["288.customers-page2", `SELECT id, name, created_at FROM customers ORDER BY created_at DESC, id LIMIT 6 OFFSET 6`],
  ["288.customers-allsorted", `SELECT id, created_at FROM customers ORDER BY created_at DESC`],
  ["289.big-ticket-by-status", `SELECT status, COUNT(*) AS n, ROUND(SUM(total),2) AS value FROM orders WHERE total >= 800 GROUP BY status ORDER BY value DESC`],
  ["289.big-ticket-800list", `SELECT id, total, status FROM orders WHERE total >= 800 ORDER BY total DESC`],
  ["290.deep-shelves", `SELECT category, MIN(stock) AS floor_units, COUNT(*) AS skus FROM products GROUP BY category HAVING MIN(stock) >= 100 ORDER BY MIN(stock) DESC`],
  ["291.dispatched-month-revenue", `SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS orders, ROUND(SUM(total),2) AS revenue FROM orders WHERE shipped_at IS NOT NULL GROUP BY month HAVING SUM(total) >= 2500 ORDER BY revenue DESC LIMIT 3`],
  ["291.dispatched-month-all", `SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total),2) AS revenue FROM orders WHERE shipped_at IS NOT NULL GROUP BY month ORDER BY revenue DESC`],
  ["292.refund-sweep", `SELECT COUNT(*) AS flagged, ROUND(SUM(total), 2) AS exposure FROM orders WHERE status = 'refunded' HAVING COUNT(*) = 0`],
  ["293.two-sku-suppliers", `SELECT supplier_id, COUNT(*) AS skus, ROUND(AVG(price),2) AS avg_price FROM products GROUP BY supplier_id HAVING COUNT(*) = 2 AND AVG(price) > 60 ORDER BY avg_price DESC`],
  ["293.supplier-avg-all", `SELECT supplier_id, COUNT(*) AS skus, ROUND(AVG(price),2) AS avg_price FROM products GROUP BY supplier_id ORDER BY avg_price DESC`],
  ["294.heavy-lines", `SELECT order_id, product_id, quantity, unit_price FROM order_items ORDER BY quantity DESC, unit_price DESC, product_id LIMIT 5`],
  ["295.activation-by-region", `SELECT region, COUNT(*) AS members, SUM(active) AS activated FROM customers GROUP BY region HAVING SUM(active) >= 4 ORDER BY activated DESC, members DESC`],
  ["296.supplier-stock-bands", `SELECT supplier_id, COUNT(*) AS skus, SUM(stock) AS units FROM products GROUP BY supplier_id HAVING SUM(stock) BETWEEN 300 AND 500 ORDER BY units DESC`],
  ["296.supplier-stock-all", `SELECT supplier_id, SUM(stock) AS units FROM products GROUP BY supplier_id ORDER BY units DESC`],
  ["297.bulk-line-spend", `SELECT product_id, COUNT(*) AS lines, ROUND(SUM(quantity * unit_price), 2) AS spend FROM order_items WHERE quantity >= 2 GROUP BY product_id HAVING SUM(quantity * unit_price) > 300 ORDER BY spend DESC LIMIT 3`],
  ["297.bulk-line-alt", `SELECT product_id, ROUND(SUM(quantity * unit_price), 2) AS spend FROM order_items WHERE quantity >= 2 GROUP BY product_id ORDER BY spend DESC`],
  ["298.month-avg-tickets", `SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS orders, ROUND(AVG(total),2) AS avg_ticket FROM orders GROUP BY month ORDER BY avg_ticket DESC, month LIMIT 4`],
  ["298.month-avg-all", `SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS orders, ROUND(AVG(total),2) AS avg_ticket FROM orders GROUP BY month ORDER BY avg_ticket DESC, month`],
  ["299.twokey-cust-status", `SELECT customer_id, status, COUNT(*) AS n FROM orders GROUP BY customer_id, status HAVING COUNT(*) >= 3 ORDER BY n DESC, customer_id`],
  ["300.price-test-shelves", `SELECT category, COUNT(*) AS skus, ROUND(AVG(price),2) AS avg_price FROM products WHERE price < 100 GROUP BY category HAVING COUNT(*) >= 2 ORDER BY AVG(price) DESC LIMIT 2`],
  ["300.price-test-all", `SELECT category, COUNT(*) AS skus, ROUND(AVG(price),2) AS avg_price FROM products WHERE price < 100 GROUP BY category HAVING COUNT(*) >= 2 ORDER BY AVG(price) DESC`],
  ["ctx.totals-ge800-count", `SELECT COUNT(*) FROM orders WHERE total >= 800`],
];

for (const [tag, sql] of Q) {
  try {
    const res = db.query(sql).all() as Record<string, unknown>[];
    const cols = res.length ? Object.keys(res[0]) : [];
    console.log(`## ${tag}`);
    console.log(`   ${sql.replace(/\s+/g, " ")}`);
    if (!res.length) console.log("   (0 rows)");
    for (const r of res.slice(0, 20)) {
      console.log("   " + cols.map((c) => `${c}=${JSON.stringify(r[c])}`).join(" | "));
    }
    if (res.length > 20) console.log(`   ... ${res.length - 20} more rows (total ${res.length})`);
  } catch (e) {
    console.log(`## ${tag}\n   ERROR: ${e instanceof Error ? e.message : e}`);
  }
}
db.close();
