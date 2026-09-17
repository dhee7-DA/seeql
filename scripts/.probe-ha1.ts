import { Database } from "bun:sqlite";
const db = new Database("scripts/.probe-ha1.db", { readonly: true });
const q = (sql: string) => { try { return { ok: true, rows: db.query(sql).all() }; } catch (e) { return { ok: false, err: String(e) }; } };
const show = (label: string, sql: string) => {
  const r = q(sql);
  console.log(`\n## ${label}\nSQL: ${sql}`);
  if (!r.ok) console.log("ERR: " + r.err);
  else for (const row of r.rows) console.log("  " + JSON.stringify(row));
};

show("expenses schema", "SELECT name, type FROM pragma_table_info('expenses')");
show("expenses sample", "SELECT * FROM expenses ORDER BY id LIMIT 6");
show("expenses count", "SELECT COUNT(*), MIN(amount_cents), MAX(amount_cents) FROM expenses");

// cs-259 fraud l3
show("259 correct", "SELECT id, total, status, created_at FROM orders WHERE status IN ('pending', 'cancelled') AND total BETWEEN 400 AND 900 AND created_at LIKE '2024-0%'");
show("259 count-check", "SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'cancelled') AND total BETWEEN 400 AND 900 AND created_at LIKE '2024-0%'");
show("259 NOTIN variant", "SELECT COUNT(*) FROM orders WHERE status NOT IN ('pending', 'cancelled') AND total BETWEEN 400 AND 900 AND created_at LIKE '2024-0%'");
show("259 2024-1% variant", "SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'cancelled') AND total BETWEEN 400 AND 900 AND created_at LIKE '2024-1%'");
show("259 GLOB probe", "SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'cancelled') AND total BETWEEN 400 AND 900 AND created_at GLOB '2024-0%'");
show("259 OR-in-AND probe", "SELECT id FROM orders WHERE status IN ('pending', 'cancelled') AND total BETWEEN 400 OR 900 AND created_at LIKE '2024-0%'");

// cs-260 catalog l8a
show("260 correct", "SELECT category, COUNT(*) AS skus, SUM(stock) AS units FROM products WHERE price <= 65 GROUP BY category HAVING SUM(stock) >= 400 ORDER BY units DESC");
show("260 gate500", "SELECT category, SUM(stock) AS units FROM products WHERE price <= 65 GROUP BY category HAVING SUM(stock) >= 500 ORDER BY units DESC");
show("260 lt65", "SELECT COUNT(*) FROM products WHERE price < 65");
show("260 HAVING-first probe", "SELECT category, SUM(stock) AS units FROM products HAVING price <= 65 GROUP BY category");
show("260 ORDER-then-HAVING probe", "SELECT category, SUM(stock) AS units FROM products WHERE price <= 65 GROUP BY category ORDER BY units HAVING SUM(stock) >= 400");

// cs-261 month-close l4a
show("261 correct", "SELECT status, COUNT(*) AS orders, COUNT(shipped_at) AS dispatched FROM orders GROUP BY status HAVING COUNT(shipped_at) < COUNT(*) ORDER BY orders DESC");
show("261 full census", "SELECT status, COUNT(*) AS orders, COUNT(shipped_at) AS dispatched FROM orders GROUP BY status ORDER BY orders DESC");
show("261 COUNT(total) variant", "SELECT status, COUNT(*) AS orders, COUNT(total) AS dispatched FROM orders GROUP BY status HAVING COUNT(total) < COUNT(*) ORDER BY orders DESC");
show("261 COUNT(status) variant", "SELECT COUNT(*) FROM orders GROUP BY status HAVING COUNT(status) < COUNT(*)");
show("261 SUM-in-COUNT probe", "SELECT status, COUNT(*) AS orders, COUNT(SUM(shipped_at)) AS dispatched FROM orders GROUP BY status HAVING COUNT(SUM(shipped_at)) < COUNT(*) ORDER BY orders DESC");

// cs-262 refund l7c
show("262 correct", "SELECT SUM(total) AS refund_pool, COUNT(*) AS tickets FROM orders WHERE status = 'cancelled' AND total > 400");
show("262 gate300", "SELECT SUM(total) AS refund_pool, COUNT(*) AS tickets FROM orders WHERE status = 'cancelled' AND total > 300");
show("262 gate200", "SELECT SUM(total) AS refund_pool, COUNT(*) AS tickets FROM orders WHERE status = 'cancelled' AND total > 200");
show("262 gate100", "SELECT SUM(total) AS refund_pool, COUNT(*) AS tickets FROM orders WHERE status = 'cancelled' AND total > 100");
show("262 TOTAL fn", "SELECT TOTAL(total) AS refund_pool, COUNT(*) AS tickets FROM orders WHERE status = 'cancelled' AND total > 400");
show("262 pending gate400", "SELECT ROUND(SUM(total),2) AS refund_pool, COUNT(*) AS tickets FROM orders WHERE status = 'pending' AND total > 400");

// cs-263 pricing l5a
show("263 correct", "SELECT name, category, price FROM products ORDER BY category ASC, price DESC LIMIT 8");
show("263 ASC variant", "SELECT name, category, price FROM products ORDER BY category ASC, price ASC LIMIT 8");
show("263 name-first", "SELECT name, category, price FROM products ORDER BY name ASC, price DESC LIMIT 8");
show("263 stock-first", "SELECT name, category, price FROM products ORDER BY stock ASC, price DESC LIMIT 8");
show("263 limit6", "SELECT name, price FROM products ORDER BY category ASC, price DESC LIMIT 6");

// cs-264 inventory l7a
show("264 correct", "SELECT category, COUNT(*) AS skus, SUM(stock) AS units, ROUND(AVG(stock), 1) AS avg_units FROM products GROUP BY category ORDER BY units DESC, category");
show("264 round2", "SELECT category, ROUND(AVG(stock), 2) AS avg_units FROM products GROUP BY category ORDER BY units DESC, category");
show("264 order-by-skus", "SELECT category, COUNT(*) AS skus, SUM(stock) AS units, ROUND(AVG(stock), 1) AS avg_units FROM products GROUP BY category ORDER BY 2 DESC, category");
show("264 order-by-avg", "SELECT category, COUNT(*) AS skus, SUM(stock) AS units, ROUND(AVG(stock), 1) AS avg_units FROM products GROUP BY category ORDER BY avg_units DESC, category");

// cs-265 funnel l7b
show("265 per-month avg excl cancelled", "SELECT strftime('%Y-%m', created_at) AS month, ROUND(AVG(total), 2) AS avg_basket, COUNT(*) AS n FROM orders WHERE status != 'cancelled' GROUP BY month ORDER BY avg_basket DESC");
show("265 gate350", "SELECT strftime('%Y-%m', created_at) AS month, ROUND(AVG(total), 2) AS avg_basket FROM orders WHERE status != 'cancelled' GROUP BY month HAVING AVG(total) > 350 ORDER BY avg_basket DESC");
show("265 gate375", "SELECT strftime('%Y-%m', created_at) AS month, ROUND(AVG(total), 2) AS avg_basket FROM orders WHERE status != 'cancelled' GROUP BY month HAVING AVG(total) > 375 ORDER BY avg_basket DESC");
show("265 gate300", "SELECT COUNT(*) FROM (SELECT strftime('%Y-%m', created_at) AS month FROM orders WHERE status != 'cancelled' GROUP BY month HAVING AVG(total) > 300)");
show("265 eq-cancelled", "SELECT COUNT(*) FROM (SELECT strftime('%Y-%m', created_at) AS m FROM orders WHERE status = 'cancelled' GROUP BY m)");
show("265 lt-cancelled", "SELECT COUNT(*) FROM (SELECT strftime('%Y-%m', created_at) AS m FROM orders WHERE status < 'cancelled' GROUP BY m)");
show("265 sum-gate", "SELECT COUNT(*) FROM (SELECT strftime('%Y-%m', created_at) AS m FROM orders WHERE status != 'cancelled' GROUP BY m HAVING SUM(total) > 350)");
show("265 year-bucket", "SELECT strftime('%Y', created_at) AS y, ROUND(AVG(total), 2) AS avg_basket FROM orders WHERE status != 'cancelled' GROUP BY y ORDER BY avg_basket DESC");
show("265 order-by-const probe", "SELECT strftime('%Y-%m', created_at) AS month, ROUND(AVG(total), 2) AS avg_basket FROM orders WHERE status != 'cancelled' GROUP BY month HAVING AVG(total) > 350 ORDER BY 'x'");

// cs-266 supplier l8b
show("266 correct", "SELECT supplier_id, COUNT(*) AS skus, ROUND(AVG(price), 2) AS avg_price FROM products GROUP BY supplier_id HAVING avg_price >= 60 ORDER BY avg_price DESC");
show("266 full", "SELECT supplier_id, COUNT(*) AS skus, ROUND(AVG(price), 2) AS avg_price, ROUND(SUM(price),2) AS sum_p, ROUND(MAX(price),2) AS max_p, ROUND(MIN(price),2) AS min_p FROM products GROUP BY supplier_id ORDER BY avg_price DESC");
show("266 gate40", "SELECT supplier_id, COUNT(*) AS skus, ROUND(AVG(price), 2) AS avg_price FROM products GROUP BY supplier_id HAVING avg_price >= 40 ORDER BY avg_price DESC");
show("266 WHERE-alias-agg probe", "SELECT supplier_id, COUNT(*) AS skus, ROUND(AVG(price), 2) AS avg_price FROM products WHERE avg_price >= 60 GROUP BY supplier_id");

// cs-268 growth l8c
show("268 correct", "SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id HAVING COUNT(*) >= 5 ORDER BY orders DESC, customer_id");
show("268 gate14", "SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id HAVING COUNT(*) >= 14 ORDER BY orders DESC, customer_id");
show("268 gate4", "SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id HAVING COUNT(*) >= 4 ORDER BY orders DESC, customer_id");
show("268 asc", "SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id HAVING COUNT(*) >= 5 ORDER BY orders ASC, customer_id");

// cs-269 fraud l4b
show("269 correct", "SELECT status, COUNT(*) AS orders, COALESCE(MAX(shipped_at), 'never') AS last_dispatch FROM orders GROUP BY status HAVING COUNT(*) >= 8 ORDER BY orders DESC");
show("269 all4", "SELECT status, COUNT(*) AS orders, COALESCE(MAX(shipped_at), 'never') AS last_dispatch FROM orders GROUP BY status ORDER BY orders DESC");
show("269 MIN variant", "SELECT status, COALESCE(MIN(shipped_at), 'never') AS last_dispatch FROM orders GROUP BY status ORDER BY orders DESC");
show("269 SUM variant", "SELECT status, COALESCE(SUM(shipped_at), 'never') AS last_dispatch FROM orders GROUP BY status ORDER BY orders DESC");
db.close();
