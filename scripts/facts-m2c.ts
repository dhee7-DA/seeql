// Module 2 (Joins) MCQ + case-study fact pool — everything verified live
// against db/custom.db (the same db scripts/case-audit.ts trusts).
// Run: bun scripts/facts-m2c.ts
import { Database } from "bun:sqlite";

const db = new Database("db/custom.db", { readonly: true });
const q = (sql: string): unknown[] => db.query(sql).all() as unknown[];
const out: Record<string, unknown> = {};

// ---------- schema ----------
out.schema = {};
for (const t of ["customers", "orders", "products", "suppliers", "order_items"]) {
  out.schema[t] = db.query(`PRAGMA table_info(${t})`).all();
}

// ---------- base tables ----------
out.customers = q(`SELECT * FROM customers ORDER BY id`);
out.products = q(`SELECT * FROM products ORDER BY id`);
out.suppliers = q(`SELECT * FROM suppliers ORDER BY id`);
out.orderStatusCounts = q(`SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY status`);
out.orderStats = q(`SELECT COUNT(*) n, COUNT(DISTINCT customer_id) buyers, MIN(total) lo, MAX(total) hi,
  ROUND(SUM(total),2) sum_total, MIN(created_at) first_o, MAX(created_at) last_o FROM orders`);
out.itemStats = q(`SELECT COUNT(*) n, MIN(quantity) minq, MAX(quantity) maxq, MIN(unit_price) minp, MAX(unit_price) maxp,
  ROUND(SUM(quantity*unit_price),2) line_grain_sum FROM order_items`);
out.linesPerOrder = q(`SELECT lines, COUNT(*) orders FROM (
  SELECT order_id, COUNT(*) lines FROM order_items GROUP BY order_id) GROUP BY lines ORDER BY lines`);
out.regionCounts = q(`SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY region`);
out.cityCounts = q(`SELECT city, COUNT(*) n FROM customers GROUP BY city ORDER BY n DESC, city`);
out.activeCounts = q(`SELECT active, COUNT(*) n FROM customers GROUP BY active`);
out.categoryCounts = q(`SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY category`);

// ---------- cartesian / pair factory ----------
out.cartesian_customers_orders = q(`SELECT COUNT(*) n FROM customers, orders`);
out.cartesian_products_suppliers = q(`SELECT COUNT(*) n FROM products, suppliers`);
out.id_collision = q(`SELECT o.id, c.name FROM orders o JOIN customers c ON o.id = c.id ORDER BY o.id`);
out.eq_fk_orders_customers = q(`SELECT COUNT(*) n FROM orders o JOIN customers c ON o.customer_id = c.id`);
out.eq_fk_items_products = q(`SELECT COUNT(*) n FROM order_items oi JOIN products p ON oi.product_id = p.id`);
out.eq_fk_orders_items = q(`SELECT COUNT(*) n FROM orders o JOIN order_items oi ON oi.order_id = o.id`);

// ---------- ambiguity probes ----------
out.bare_name_orders_customers = (() => {
  try { q(`SELECT name FROM orders o JOIN customers c ON o.customer_id = c.id LIMIT 1`); return "resolves"; }
  catch (e) { return `error: ${(e as Error).message}`; }
})();
out.bare_name_products_suppliers = (() => {
  try { q(`SELECT name FROM products p JOIN suppliers s ON p.supplier_id = s.id LIMIT 1`); return "resolves"; }
  catch (e) { return `error: ${(e as Error).message}`; }
})();
out.bare_id_orders_customers = (() => {
  try { q(`SELECT id FROM orders o JOIN customers c ON o.customer_id = c.id LIMIT 1`); return "resolves"; }
  catch (e) { return `error: ${(e as Error).message}`; }
})();
out.bare_created_at_orders_customers = (() => {
  try { q(`SELECT created_at FROM orders o JOIN customers c ON o.customer_id = c.id LIMIT 1`); return "resolves"; }
  catch (e) { return `error: ${(e as Error).message}`; }
})();
out.bare_price_items_products = (() => {
  try { q(`SELECT price FROM order_items oi JOIN products p ON oi.product_id = p.id LIMIT 1`); return "resolves"; }
  catch (e) { return `error: ${(e as Error).message}`; }
})();
out.bare_total_orders_customers = (() => {
  try { q(`SELECT total FROM orders o JOIN customers c ON o.customer_id = c.id LIMIT 1`); return "resolves"; }
  catch (e) { return `error: ${(e as Error).message}`; }
})();

// ---------- wrong keys ----------
out.wrong_key_o_id_c_id_plausible_rows = q(`SELECT COUNT(*) n FROM orders o JOIN customers c ON o.id = c.id`);
out.wrong_key_customer_id_to_id = q(`SELECT COUNT(*) n FROM orders o JOIN customers c ON o.customer_id = c.id`);
out.items_to_orders_wrong_dir = q(`SELECT COUNT(*) n FROM order_items oi JOIN orders o ON oi.id = o.id`);

// ---------- LEFT JOIN ghosts ----------
out.lj_customers_delivered = q(`SELECT COUNT(*) n FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'`);
out.lj_customers_delivered_matches = q(`SELECT COUNT(*) n FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'`);
out.lj_customers_delivered_ghosts = q(`SELECT c.name FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'
  WHERE o.id IS NULL ORDER BY c.name`);
out.lj_customers_shipped = q(`SELECT COUNT(*) n FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'`);
out.lj_customers_shipped_matches = q(`SELECT COUNT(*) n FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'`);
out.lj_customers_shipped_ghosts = q(`SELECT c.name FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'
  WHERE o.id IS NULL ORDER BY c.name`);
out.lj_customers_pending = q(`SELECT COUNT(*) n FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'`);
out.lj_customers_pending_matches = q(`SELECT COUNT(*) n FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'`);
out.lj_customers_pending_ghosts = q(`SELECT c.name FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'
  WHERE o.id IS NULL ORDER BY c.name`);
out.lj_where_collapse_delivered = q(`SELECT COUNT(*) n FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'delivered'`);
out.customers_no_orders = q(`SELECT c.name FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL ORDER BY c.name`);
out.products_never_ordered = q(`SELECT p.name FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL ORDER BY p.name`);
out.orders_no_items = q(`SELECT o.id FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id WHERE oi.id IS NULL ORDER BY o.id`);
out.suppliers_no_sales = q(`SELECT s.name FROM suppliers s
  LEFT JOIN products p ON p.supplier_id = s.id
  LEFT JOIN order_items oi ON oi.product_id = p.id
  WHERE p.id IS NULL OR oi.id IS NULL GROUP BY s.id ORDER BY s.name`);

// ---------- aggregates over joins ----------
out.spend_leaderboard = q(`SELECT c.name, ROUND(SUM(o.total),2) spend, COUNT(o.id) orders
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id ORDER BY spend DESC`);
out.category_revenue = q(`SELECT p.category, COUNT(*) lines, ROUND(SUM(oi.quantity*oi.unit_price),2) revenue
  FROM order_items oi JOIN products p ON p.id = oi.product_id
  GROUP BY p.category ORDER BY revenue DESC`);
out.category_status_revenue = q(`SELECT p.category, o.status, ROUND(SUM(oi.quantity*oi.unit_price),2) revenue
  FROM order_items oi JOIN products p ON p.id = oi.product_id
  JOIN orders o ON o.id = oi.order_id
  GROUP BY p.category, o.status ORDER BY p.category, revenue DESC`);
out.delivered_revenue = q(`SELECT ROUND(SUM(oi.quantity*oi.unit_price),2) rev FROM order_items oi
  JOIN orders o ON o.id = oi.order_id WHERE o.status = 'delivered'`);
out.pending_revenue = q(`SELECT ROUND(SUM(oi.quantity*oi.unit_price),2) rev FROM order_items oi
  JOIN orders o ON o.id = oi.order_id WHERE o.status = 'pending'`);
out.shipped_revenue = q(`SELECT ROUND(SUM(oi.quantity*oi.unit_price),2) rev FROM order_items oi
  JOIN orders o ON o.id = oi.order_id WHERE o.status = 'shipped'`);
out.delivered_orders_total_sum = q(`SELECT ROUND(SUM(total),2) s, COUNT(*) n FROM orders WHERE status='delivered'`);
out.pending_orders_total_sum = q(`SELECT ROUND(SUM(total),2) s, COUNT(*) n FROM orders WHERE status='pending'`);
out.shipped_orders_total_sum = q(`SELECT ROUND(SUM(total),2) s, COUNT(*) n FROM orders WHERE status='shipped'`);
out.units_by_category = q(`SELECT p.category, SUM(oi.quantity) units FROM order_items oi
  JOIN products p ON p.id = oi.product_id GROUP BY p.category ORDER BY units DESC`);
out.product_line_counts = q(`SELECT p.name, COUNT(oi.id) lines, COALESCE(SUM(oi.quantity),0) units,
  ROUND(COALESCE(SUM(oi.quantity*oi.unit_price),0),2) revenue
  FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id
  GROUP BY p.id ORDER BY revenue DESC`);
out.supplier_sales = q(`SELECT s.name, COUNT(DISTINCT p.id) products, COUNT(oi.id) lines,
  COALESCE(SUM(oi.quantity),0) units, ROUND(COALESCE(SUM(oi.quantity*oi.unit_price),0),2) revenue
  FROM suppliers s
  LEFT JOIN products p ON p.supplier_id = s.id
  LEFT JOIN order_items oi ON oi.product_id = p.id
  GROUP BY s.id ORDER BY revenue DESC`);
out.customer_order_counts = q(`SELECT c.name, COUNT(o.id) orders, ROUND(COALESCE(SUM(o.total),0),2) spend
  FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id ORDER BY orders DESC, c.name`);
out.ghost_bucket_liam = q(`SELECT c.name, COUNT(*) star, COUNT(o.id) oid, COUNT(o.status) ostatus,
  ROUND(SUM(o.total),2) s, ROUND(AVG(o.total),2) a
  FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'
  GROUP BY c.id HAVING COUNT(o.id) = 0`);
out.ghost_bucket_delivered = q(`SELECT c.name, COUNT(*) star, COUNT(o.id) oid,
  ROUND(SUM(o.total),2) s, ROUND(AVG(o.total),2) a
  FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'
  GROUP BY c.id HAVING COUNT(o.id) = 0`);
out.having_count_zero_all = q(`SELECT c.name, COUNT(o.id) n FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(o.id) = 0`);

// ---------- fan-out / grain ----------
out.fanout_sum_total = q(`SELECT ROUND(SUM(o.total),2) inflated FROM orders o
  JOIN order_items oi ON oi.order_id = o.id`);
out.fanout_avg_total = q(`SELECT ROUND(AVG(o.total),2) inflated_avg FROM orders o
  JOIN order_items oi ON oi.order_id = o.id`);
out.true_avg_total = q(`SELECT ROUND(AVG(total),2) true_avg FROM orders`);
out.fanout_count = q(`SELECT COUNT(*) n FROM orders o JOIN order_items oi ON oi.order_id = o.id`);
out.sum_distinct_total = q(`SELECT ROUND(SUM(DISTINCT o.total),2) s FROM orders o
  JOIN order_items oi ON oi.order_id = o.id`);
out.duplicate_totals_exist = q(`SELECT total, COUNT(*) n FROM orders GROUP BY total HAVING n > 1`);
out.aggregate_first_fix = q(`SELECT ROUND(SUM(ot),2) s FROM (
  SELECT SUM(total) ot FROM orders GROUP BY id)`);
out.fanout_per_customer = q(`SELECT c.name, ROUND(SUM(o.total),2) inflated
  FROM customers c JOIN orders o ON o.customer_id = c.id
  JOIN order_items oi ON oi.order_id = o.id
  GROUP BY c.id ORDER BY inflated DESC LIMIT 3`);
out.line_grain_total = q(`SELECT ROUND(SUM(oi.quantity*oi.unit_price),2) s FROM order_items oi`);
out.line_vs_order_gap = q(`SELECT ROUND(SUM(oi.quantity*oi.unit_price),2) line_s, ROUND(SUM(o.total),2) order_s
  FROM order_items oi JOIN orders o ON o.id = oi.order_id`);

// ---------- anti-join / NOT IN ----------
out.notin_null_mine = q(`SELECT COUNT(*) n FROM orders WHERE customer_id NOT IN (
  SELECT customer_id FROM orders WHERE shipped_at IS NULL)`);
out.notin_guarded = q(`SELECT COUNT(*) n FROM orders WHERE customer_id NOT IN (
  SELECT customer_id FROM orders WHERE customer_id IS NOT NULL AND status = 'shipped')`);
out.orders_of_never_shipped = q(`SELECT COUNT(*) n FROM orders WHERE customer_id NOT IN (
  SELECT DISTINCT customer_id FROM orders WHERE status='shipped' AND customer_id IS NOT NULL)`);
out.never_shipped_customers = q(`SELECT name FROM customers WHERE id NOT IN (
  SELECT DISTINCT customer_id FROM orders WHERE status='shipped' AND customer_id IS NOT NULL)
  ORDER BY name`);
out.never_delivered_customers = q(`SELECT name FROM customers WHERE id NOT IN (
  SELECT DISTINCT customer_id FROM orders WHERE status='delivered')
  ORDER BY name`);
out.exists_vs_in_counts = q(`SELECT
  (SELECT COUNT(*) FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)) a,
  (SELECT COUNT(*) FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)) b`);
out.shipped_at_null_count = q(`SELECT COUNT(*) n FROM orders WHERE shipped_at IS NULL`);

// ---------- self-joins ----------
out.self_region_ordered = q(`SELECT COUNT(*) n FROM customers a JOIN customers b ON a.region = b.region`);
out.self_region_ne = q(`SELECT COUNT(*) n FROM customers a JOIN customers b ON a.region = b.region AND a.name <> b.name`);
out.self_region_lt = q(`SELECT COUNT(*) n FROM customers a JOIN customers b ON a.region = b.region AND a.id < b.id`);
out.self_region_pairs = q(`SELECT a.region, COUNT(*) n FROM customers a JOIN customers b
  ON a.region = b.region AND a.id < b.id GROUP BY a.region ORDER BY n DESC`);
out.self_city_pairs = q(`SELECT COUNT(*) n FROM customers a JOIN customers b
  ON a.city = b.city AND a.id < b.id`);
out.self_city_named = q(`SELECT a.city, a.name, b.name FROM customers a JOIN customers b
  ON a.city = b.city AND a.id < b.id ORDER BY a.city`);
out.self_products_category_lt = q(`SELECT COUNT(*) n FROM products a JOIN products b
  ON a.category = b.category AND a.id < b.id`);
out.self_products_category_pairs = q(`SELECT a.category, COUNT(*) n FROM products a JOIN products b
  ON a.category = b.category AND a.id < b.id GROUP BY a.category ORDER BY n DESC`);
out.self_suppliers_region = q(`SELECT COUNT(*) n FROM suppliers a JOIN suppliers b
  ON a.region = b.region AND a.id < b.id`);
out.self_suppliers_region_named = q(`SELECT a.region, a.name, b.name, a.rating, b.rating
  FROM suppliers a JOIN suppliers b ON a.region = b.region AND a.id < b.id ORDER BY a.region`);
out.same_price_products = q(`SELECT COUNT(*) n FROM products a JOIN products b
  ON a.price = b.price AND a.id < b.id`);
out.same_price_named = q(`SELECT a.price, a.name, b.name FROM products a JOIN products b
  ON a.price = b.price AND a.id < b.id ORDER BY a.price`);
out.same_total_orders = q(`SELECT COUNT(*) n FROM orders a JOIN orders b
  ON a.total = b.total AND a.id < b.id`);

// ---------- useful filtered joins for cases ----------
out.berlin_buyers = q(`SELECT c.name, COUNT(o.id) n, ROUND(COALESCE(SUM(o.total),0),2) spend
  FROM customers c JOIN orders o ON o.customer_id = c.id
  WHERE c.city = 'Berlin' GROUP BY c.id ORDER BY spend DESC`);
out.region_business = q(`SELECT c.region, COUNT(o.id) orders, ROUND(COALESCE(SUM(o.total),0),2) spend,
  COUNT(DISTINCT c.id) customers
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.region ORDER BY spend DESC`);
out.eu_delivered = q(`SELECT COUNT(*) n, ROUND(COALESCE(SUM(o.total),0),2) spend
  FROM customers c JOIN orders o ON o.customer_id = c.id
  WHERE c.region = 'EU' AND o.status = 'delivered'`);
out.apac_orders = q(`SELECT COUNT(*) n, ROUND(COALESCE(SUM(o.total),0),2) spend
  FROM customers c JOIN orders o ON o.customer_id = c.id WHERE c.region = 'APAC'`);
out.inactive_buyers = q(`SELECT c.name, COUNT(o.id) n, ROUND(SUM(o.total),2) spend
  FROM customers c JOIN orders o ON o.customer_id = c.id
  WHERE c.active = 0 GROUP BY c.id`);
out.top_order_rows = q(`SELECT o.id, c.name, o.status, o.total FROM orders o
  JOIN customers c ON c.id = o.customer_id ORDER BY o.total DESC LIMIT 8`);
out.audio_products = q(`SELECT p.id, p.name, p.price, p.stock FROM products p WHERE p.category='Audio' ORDER BY p.id`);
out.big_lines = q(`SELECT oi.id, p.name, oi.quantity, oi.unit_price, ROUND(oi.quantity*oi.unit_price,2) line_total
  FROM order_items oi JOIN products p ON p.id = oi.product_id
  ORDER BY oi.quantity DESC LIMIT 8`);
out.big_baskets = q(`SELECT o.id, c.name, COUNT(*) lines, ROUND(SUM(oi.quantity*oi.unit_price),2) basket
  FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id
  GROUP BY o.id HAVING COUNT(*) >= 4 ORDER BY basket DESC`);
out.pricey_supplier_products = q(`SELECT s.name, p.name, p.price FROM products p
  JOIN suppliers s ON s.id = p.supplier_id WHERE p.price >= 300 ORDER BY p.price DESC`);
out.cheapest_supplier_products = q(`SELECT s.name, p.name, p.price FROM products p
  JOIN suppliers s ON s.id = p.supplier_id WHERE p.price <= 25 ORDER BY p.price`);
out.stock_above_200 = q(`SELECT p.name, p.stock, s.name supplier FROM products p
  JOIN suppliers s ON s.id = p.supplier_id WHERE p.stock >= 200 ORDER BY p.stock DESC`);
out.verified_delivered_by_category = q(`SELECT p.category, COUNT(*) lines
  FROM order_items oi JOIN products p ON p.id = oi.product_id
  JOIN orders o ON o.id = oi.order_id
  WHERE o.status = 'delivered' GROUP BY p.category ORDER BY lines DESC`);
out.pending_lines_by_customer = q(`SELECT c.name, COUNT(*) lines, SUM(oi.quantity) units
  FROM customers c JOIN orders o ON o.customer_id = c.id
  JOIN order_items oi ON oi.order_id = o.id
  WHERE o.status = 'pending' GROUP BY c.id ORDER BY lines DESC`);
out.shipped_by_region = q(`SELECT c.region, COUNT(*) n FROM customers c
  JOIN orders o ON o.customer_id = c.id WHERE o.status = 'shipped'
  GROUP BY c.region ORDER BY n DESC`);
out.orders_over_400 = q(`SELECT COUNT(*) n FROM orders WHERE total > 400`);
out.orders_over_400_named = q(`SELECT o.id, c.name, o.total FROM orders o
  JOIN customers c ON c.id = o.customer_id WHERE o.total > 400 ORDER BY o.total DESC`);
out.distinct_products_per_customer = q(`SELECT c.name, COUNT(DISTINCT oi.product_id) prods
  FROM customers c JOIN orders o ON o.customer_id = c.id
  JOIN order_items oi ON oi.order_id = o.id
  GROUP BY c.id ORDER BY prods DESC LIMIT 6`);

console.log(JSON.stringify(out, (_k, v) => (typeof v === "bigint" ? Number(v) : v), 1));
db.close();
