// Pass B: ALL figures for cases-chb2 (cs-291..300) + semantic distractor checks. READ-ONLY.
import { Database } from "bun:sqlite";
const db = new Database("scripts/.probe-hb2.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  try { console.log(`\n## ${label}\n` + JSON.stringify(q(sql))); }
  catch (e) { console.log(`\n## ${label} ERROR: ${e instanceof Error ? e.message : e}`); }
};

// ---- cs-291 month-close l3 ----
const c291 = `SELECT id, customer_id, total FROM orders
WHERE status IN ('pending', 'cancelled') AND total BETWEEN 100 AND 500 AND created_at LIKE '2024-1-%'
ORDER BY total DESC LIMIT 5`;
show("291 result", c291);
show("291 count no LIMIT", `SELECT COUNT(*) n FROM orders WHERE status IN ('pending','cancelled') AND total BETWEEN 100 AND 500 AND created_at LIKE '2024-1-%'`);
show("291 stage counts", `SELECT status, COUNT(*) n FROM orders WHERE status IN ('pending','cancelled') AND total BETWEEN 100 AND 500 GROUP BY status`);
show("291 HAVING fill", `SELECT id, customer_id, total FROM orders HAVING status IN ('pending', 'cancelled') AND total BETWEEN 100 AND 500 AND created_at LIKE '2024-1-%' ORDER BY total DESC LIMIT 5`);
show("291 = fill", `SELECT id, customer_id, total FROM orders WHERE status = ('pending', 'cancelled') AND total BETWEEN 100 AND 500 AND created_at LIKE '2024-1-%' ORDER BY total DESC LIMIT 5`);

// ---- cs-292 refund-audit l4 ----
show("292 base", `SELECT customer_id, COUNT(*) placed, COUNT(shipped_at) dispatched FROM orders GROUP BY customer_id ORDER BY placed DESC`);
show("292 gap>=2", `SELECT customer_id, COUNT(*) placed, COUNT(shipped_at) dispatched FROM orders GROUP BY customer_id HAVING COUNT(*) - COUNT(shipped_at) >= 2 ORDER BY placed DESC`);
show("292 gap>=3", `SELECT customer_id, COUNT(*) placed, COUNT(shipped_at) dispatched FROM orders GROUP BY customer_id HAVING COUNT(*) - COUNT(shipped_at) >= 3 ORDER BY placed DESC`);
show("292 gap>=4", `SELECT customer_id, COUNT(*) placed, COUNT(shipped_at) dispatched FROM orders GROUP BY customer_id HAVING COUNT(*) - COUNT(shipped_at) >= 4 ORDER BY placed DESC`);
show("292 COUNT(total) fill", `SELECT customer_id, COUNT(*) placed, COUNT(total) dispatched FROM orders GROUP BY customer_id HAVING COUNT(*) - COUNT(total) >= 3 ORDER BY placed DESC`);
show("292 ORDER-then-HAVING fill", `SELECT customer_id, COUNT(*) placed, COUNT(shipped_at) dispatched FROM orders ORDER BY customer_id HAVING COUNT(*) - COUNT(shipped_at) >= 3 ORDER BY placed DESC`);

// ---- cs-293 pricing l5 ----
show("293 full sorted", `SELECT name, price FROM products WHERE price BETWEEN 30 AND 130 ORDER BY price DESC`);
show("293 count", `SELECT COUNT(*) n FROM products WHERE price BETWEEN 30 AND 130`);
show("293 window", `SELECT name, price FROM products WHERE price BETWEEN 30 AND 130 ORDER BY price DESC LIMIT 4 OFFSET 3`);
show("293 asc window", `SELECT name, price FROM products WHERE price BETWEEN 30 AND 130 ORDER BY price ASC LIMIT 4 OFFSET 3`);

// ---- cs-294 inventory l7 ----
show("294 per-category", `SELECT category, COUNT(*) skus, SUM(stock) units, ROUND(AVG(stock),1) avg_depth FROM products GROUP BY category ORDER BY units DESC`);
show("294 gate 300", `SELECT category, COUNT(*) skus, SUM(stock) units, ROUND(AVG(stock),1) avg_depth FROM products GROUP BY category HAVING COUNT(*) >= 2 AND SUM(stock) >= 300 ORDER BY units DESC`);
show("294 gate 200", `SELECT category, COUNT(*) skus, SUM(stock) units FROM products GROUP BY category HAVING COUNT(*) >= 2 AND SUM(stock) >= 200 ORDER BY units DESC`);
show("294 gate 500", `SELECT category, COUNT(*) skus, SUM(stock) units FROM products GROUP BY category HAVING COUNT(*) >= 2 AND SUM(stock) >= 500 ORDER BY units DESC`);

// ---- cs-295 funnel l7 (customers) ----
show("295 customers months", `SELECT strftime('%Y-%m', created_at) month, COUNT(*) signups, SUM(active) activated FROM customers GROUP BY month ORDER BY month`);
show("295 gate 3", `SELECT strftime('%Y-%m', created_at) month, COUNT(*) signups, SUM(active) activated FROM customers GROUP BY month HAVING COUNT(*) >= 3 ORDER BY activated DESC, month`);
show("295 gate 2", `SELECT strftime('%Y-%m', created_at) month, COUNT(*) signups FROM customers GROUP BY month HAVING COUNT(*) >= 2 ORDER BY month`);
show("295 %Y fill", `SELECT strftime('%Y', created_at) month, COUNT(*) signups, SUM(active) activated FROM customers GROUP BY month HAVING COUNT(*) >= 3 ORDER BY activated DESC, month`);
show("295 customers range", `SELECT MIN(created_at) a, MAX(created_at) b FROM customers`);
show("295 active by month detail", `SELECT strftime('%Y-%m', created_at) month, COUNT(*) signups, SUM(active) activated FROM customers GROUP BY month HAVING COUNT(*) >= 3 ORDER BY signups DESC, month`);

// ---- cs-296 supplier l8 ----
show("296 where lt150", `SELECT supplier_id, COUNT(*) skus, ROUND(AVG(price),2) avg_price FROM products WHERE price < 150 GROUP BY supplier_id ORDER BY avg_price DESC`);
show("296 lt150 avg>60", `SELECT supplier_id, COUNT(*) skus, ROUND(AVG(price),2) avg_price FROM products WHERE price < 150 GROUP BY supplier_id HAVING AVG(price) > 60 ORDER BY skus DESC, supplier_id`);
show("296 between40-150", `SELECT supplier_id, COUNT(*) skus, ROUND(AVG(price),2) avg_price FROM products WHERE price BETWEEN 40 AND 150 GROUP BY supplier_id ORDER BY avg_price DESC`);
show("296 b40-150 avg>60", `SELECT supplier_id, COUNT(*) skus, ROUND(AVG(price),2) avg_price FROM products WHERE price BETWEEN 40 AND 150 GROUP BY supplier_id HAVING AVG(price) > 60 ORDER BY skus DESC, supplier_id`);
show("296 b40-150 avg>60 gate40", `SELECT supplier_id, COUNT(*) skus FROM products WHERE price BETWEEN 40 AND 150 GROUP BY supplier_id HAVING AVG(price) > 40 ORDER BY skus DESC`);
show("296 b40-150 cnt>=2", `SELECT supplier_id, COUNT(*) skus FROM products WHERE price BETWEEN 40 AND 150 GROUP BY supplier_id HAVING COUNT(*) >= 2 ORDER BY skus DESC`);

// ---- cs-297 expense l8 ----
show("297 per-category", `SELECT category, COUNT(*) entries, MAX(amount_cents) ceiling_cents, MIN(amount_cents) floor_cents FROM expenses GROUP BY category ORDER BY ceiling_cents DESC`);
show("297 max>=50000", `SELECT category, COUNT(*) entries, MAX(amount_cents) ceiling_cents FROM expenses GROUP BY category HAVING MAX(amount_cents) >= 50000 ORDER BY ceiling_cents DESC`);
show("297 max>=20000", `SELECT category, COUNT(*) entries, MAX(amount_cents) ceiling_cents FROM expenses GROUP BY category HAVING MAX(amount_cents) >= 20000 ORDER BY ceiling_cents DESC`);
show("297 max>=30000", `SELECT category, COUNT(*) entries, MAX(amount_cents) ceiling_cents FROM expenses GROUP BY category HAVING MAX(amount_cents) >= 30000 ORDER BY ceiling_cents DESC`);

// ---- cs-298 growth l8 ----
show("298 base", `SELECT customer_id, COUNT(*) orders, SUM(total) spend FROM orders WHERE status NOT IN ('cancelled') GROUP BY customer_id ORDER BY spend DESC`);
show("298 gate4", `SELECT customer_id, COUNT(*) orders, SUM(total) spend FROM orders WHERE status NOT IN ('cancelled') GROUP BY customer_id HAVING COUNT(*) >= 4 ORDER BY spend DESC`);
show("298 gate3", `SELECT customer_id, COUNT(*) orders FROM orders WHERE status NOT IN ('cancelled') GROUP BY customer_id HAVING COUNT(*) >= 3 ORDER BY spend DESC`);
show("298 OR fill", `SELECT customer_id, COUNT(*) orders FROM orders WHERE status OR ('cancelled') GROUP BY customer_id HAVING COUNT(*) >= 4`);

// ---- cs-299 fraud cap ----
show("299 nov base", `SELECT customer_id, COUNT(*) orders, ROUND(SUM(total),2) spend, MAX(total) biggest FROM orders WHERE created_at LIKE '2024-11-%' GROUP BY customer_id ORDER BY orders DESC, spend DESC`);
show("299 dec base", `SELECT customer_id, COUNT(*) orders, ROUND(SUM(total),2) spend, MAX(total) biggest FROM orders WHERE created_at LIKE '2024-12-%' GROUP BY customer_id ORDER BY orders DESC, spend DESC`);
show("299 nov cnt", `SELECT COUNT(*) n, SUM(total) t FROM orders WHERE created_at LIKE '2024-11-%'`);

// ---- cs-300 catalog cap ----
show("300 band survivors", `SELECT category, COUNT(*) skus, ROUND(AVG(price),2) avg_price, MAX(price) ceiling FROM products WHERE price NOT BETWEEN 25 AND 100 GROUP BY category ORDER BY avg_price DESC`);
show("300 gate2", `SELECT category, COUNT(*) skus, ROUND(AVG(price),2) avg_price, MAX(price) ceiling FROM products WHERE price NOT BETWEEN 25 AND 100 GROUP BY category HAVING COUNT(*) >= 2 ORDER BY avg_price DESC`);
show("300 gate1", `SELECT category, COUNT(*) skus FROM products WHERE price NOT BETWEEN 25 AND 100 GROUP BY category HAVING COUNT(*) >= 1 ORDER BY avg_price DESC`);
show("300 gate3", `SELECT category, COUNT(*) skus FROM products WHERE price NOT BETWEEN 25 AND 100 GROUP BY category HAVING COUNT(*) >= 3 ORDER BY avg_price DESC`);
show("300 band list", `SELECT name, category, price FROM products WHERE price NOT BETWEEN 25 AND 100 ORDER BY price`);

db.close();
