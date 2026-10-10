/// <reference types="bun-types" />
/**
 * Facts pool for case-file authoring — runs a broad battery of single-table
 * queries against a READ-ONLY COPY of the seed db and dumps every result to
 * scripts/case-facts-out.json. Authors copy numbers from here; case-audit.ts
 * re-verifies them mechanically afterwards.
 *
 * Usage: bun scripts/case-facts.ts
 */
import { Database } from "bun:sqlite";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";

mkdirSync("scripts", { recursive: true });
copyFileSync("db/custom.db", "scripts/.facts.db");
const db = new Database("scripts/.facts.db", { readonly: true });

interface Fact {
  id: string;
  topic: string;
  sql: string;
  cols: string[];
  rows: unknown[][];
}

const facts: Fact[] = [];
function F(topic: string, id: string, sql: string) {
  const res = db.query(sql).all() as Record<string, unknown>[];
  if (res.length === 0) {
    facts.push({ id, topic, sql, cols: [], rows: [] });
    return;
  }
  const cols = Object.keys(res[0]);
  facts.push({ id, topic, sql, cols, rows: res.map((r) => cols.map((c) => r[c])) });
}

// ---- l1 · tables & keys ----
F("l1", "counts-customers", "SELECT COUNT(*) AS customers FROM customers");
F("l1", "counts-products", "SELECT COUNT(*) AS products FROM products");
F("l1", "counts-suppliers", "SELECT COUNT(*) AS suppliers FROM suppliers");
F("l1", "counts-orders", "SELECT COUNT(*) AS orders FROM orders");
F("l1", "counts-items", "SELECT COUNT(*) AS line_items FROM order_items");
F("l1", "max-ids", "SELECT (SELECT MAX(id) FROM customers) c, (SELECT MAX(id) FROM products) p, (SELECT MAX(id) FROM orders) o, (SELECT MAX(id) FROM suppliers) s");
F("l1", "active-counts", "SELECT active, COUNT(*) AS n FROM customers GROUP BY active");
F("l1", "inactive-names", "SELECT name, region, city FROM customers WHERE active = 0");
F("l1", "suppliers-all", "SELECT name, region, rating FROM suppliers ORDER BY id");
F("l1", "products-per-supplier", "SELECT supplier_id, COUNT(*) AS n FROM products GROUP BY supplier_id ORDER BY supplier_id");
F("l1", "first3-customers", "SELECT id, name, city, region FROM customers ORDER BY id LIMIT 3");
F("l1", "first3-products", "SELECT id, name, category, price FROM products ORDER BY id LIMIT 3");
F("l1", "first3-orders", "SELECT id, customer_id, status, total FROM orders ORDER BY id LIMIT 3");
F("l1", "fk-orphan-check", "SELECT COUNT(*) AS orphan_orders FROM orders WHERE customer_id NOT IN (SELECT id FROM customers)");

// ---- l2 · SELECT & FROM ----
F("l2", "all-customers", "SELECT id, name, city, region, active FROM customers ORDER BY id");
F("l2", "all-products", "SELECT id, name, category, price, stock FROM products ORDER BY id");
F("l2", "all-suppliers", "SELECT id, name, region, rating FROM suppliers ORDER BY id");
F("l2", "orders-head", "SELECT id, customer_id, status, ROUND(total,2) AS total, created_at FROM orders ORDER BY id LIMIT 8");
F("l2", "email-list", "SELECT name, email FROM customers ORDER BY id");
F("l2", "price-with-tax", "SELECT name, ROUND(price * 1.08, 2) AS with_tax FROM products ORDER BY id LIMIT 6");
F("l2", "items-sample", "SELECT id, order_id, product_id, quantity, unit_price FROM order_items ORDER BY id LIMIT 6");
F("l2", "line-revenue-sample", "SELECT id, quantity, unit_price, ROUND(quantity * unit_price, 2) AS line_revenue FROM order_items ORDER BY id LIMIT 6");
F("l2", "express-alias", "SELECT name AS product, price AS msrp FROM products ORDER BY id LIMIT 5");
F("l2", "total-rows-orders", "SELECT COUNT(*) AS row_count FROM orders");

// ---- l3 · WHERE ----
F("l3", "orders-by-status", "SELECT status, COUNT(*) AS n FROM orders GROUP BY status");
F("l3", "customers-by-region", "SELECT region, COUNT(*) AS n FROM customers GROUP BY region");
F("l3", "customers-by-city", "SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC, city");
F("l3", "products-by-category", "SELECT category, COUNT(*) AS n FROM products GROUP BY category");
F("l3", "price-over-100", "SELECT COUNT(*) AS n FROM products WHERE price > 100");
F("l3", "price-over-200", "SELECT COUNT(*) AS n FROM products WHERE price > 200");
F("l3", "price-over-300", "SELECT COUNT(*) AS n FROM products WHERE price > 300");
F("l3", "price-over-400", "SELECT COUNT(*) AS n FROM products WHERE price > 400");
F("l3", "price-over-500", "SELECT COUNT(*) AS n FROM products WHERE price > 500");
F("l3", "price-under-50", "SELECT COUNT(*) AS n FROM products WHERE price < 50");
F("l3", "price-under-100", "SELECT COUNT(*) AS n FROM products WHERE price < 100");
F("l3", "price-100-300", "SELECT COUNT(*) AS n FROM products WHERE price >= 100 AND price <= 300");
F("l3", "orders-over-300", "SELECT COUNT(*) AS n FROM orders WHERE total > 300");
F("l3", "orders-over-500", "SELECT COUNT(*) AS n FROM orders WHERE total > 500");
F("l3", "orders-over-800", "SELECT COUNT(*) AS n FROM orders WHERE total > 800");
F("l3", "orders-over-1000", "SELECT COUNT(*) AS n FROM orders WHERE total > 1000");
F("l3", "orders-under-100", "SELECT COUNT(*) AS n FROM orders WHERE total < 100");
F("l3", "eu-customers", "SELECT name, city FROM customers WHERE region = 'EU' ORDER BY name");
F("l3", "apac-customers", "SELECT name, city FROM customers WHERE region = 'APAC' ORDER BY name");
F("l3", "us-latam-customers", "SELECT name, city, region FROM customers WHERE region IN ('US', 'LATAM') ORDER BY name");
F("l3", "orders-by-month", "SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS n FROM orders GROUP BY month ORDER BY month");
F("l3", "cancelled-2024-03", "SELECT COUNT(*) AS n FROM orders WHERE status = 'cancelled' AND strftime('%Y-%m', created_at) = '2024-03'");
F("l3", "delivered-over-300", "SELECT COUNT(*) AS n FROM orders WHERE status = 'delivered' AND total > 300");
F("l3", "stock-zero", "SELECT COUNT(*) AS n FROM products WHERE stock = 0");
F("l3", "stock-under-10", "SELECT COUNT(*) AS n FROM products WHERE stock < 10");
F("l3", "stock-under-25", "SELECT COUNT(*) AS n FROM products WHERE stock < 25");
F("l3", "qty-ge-3", "SELECT COUNT(*) AS n FROM order_items WHERE quantity >= 3");
F("l3", "qty-eq-5", "SELECT COUNT(*) AS n FROM order_items WHERE quantity = 5");
F("l3", "pending-not-shipped-month", "SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS n FROM orders WHERE status = 'pending' GROUP BY month ORDER BY month");
F("l3", "big-tickets-status", "SELECT status, COUNT(*) AS n FROM orders WHERE total > 500 GROUP BY status");
F("l3", "like-son", "SELECT name FROM customers WHERE name LIKE '%son%'");
F("l3", "like-a-start", "SELECT name FROM customers WHERE name LIKE 'A%'");
F("l3", "category-electronics-accessories", "SELECT COUNT(*) AS n FROM products WHERE category IN ('Electronics', 'Accessories')");

// ---- l4 · NULL ----
F("l4", "unshipped-count", "SELECT COUNT(*) AS unshipped FROM orders WHERE shipped_at IS NULL");
F("l4", "shipped-count", "SELECT COUNT(*) AS shipped FROM orders WHERE shipped_at IS NOT NULL");
F("l4", "count-star-vs-col", "SELECT COUNT(*) AS all_rows, COUNT(shipped_at) AS with_timestamp FROM orders");
F("l4", "unshipped-sum", "SELECT ROUND(SUM(total), 2) AS value_at_risk FROM orders WHERE shipped_at IS NULL");
F("l4", "unshipped-avg", "SELECT ROUND(AVG(total), 2) AS avg_unshipped FROM orders WHERE shipped_at IS NULL");
F("l4", "unshipped-max", "SELECT ROUND(MAX(total), 2) AS biggest_unshipped FROM orders WHERE shipped_at IS NULL");
F("l4", "shipped-sum", "SELECT ROUND(SUM(total), 2) AS shipped_value FROM orders WHERE shipped_at IS NOT NULL");
F("l4", "shipped-avg", "SELECT ROUND(AVG(total), 2) AS avg_shipped FROM orders WHERE shipped_at IS NOT NULL");
F("l4", "unshipped-by-month", "SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS n FROM orders WHERE shipped_at IS NULL GROUP BY month ORDER BY month");
F("l4", "unshipped-first5", "SELECT id, customer_id, ROUND(total,2) AS total, created_at FROM orders WHERE shipped_at IS NULL ORDER BY id LIMIT 5");
F("l4", "unshipped-over-500", "SELECT COUNT(*) AS n FROM orders WHERE shipped_at IS NULL AND total > 500");
F("l4", "cancelled-unshipped", "SELECT COUNT(*) AS n FROM orders WHERE status = 'cancelled' AND shipped_at IS NULL");
F("l4", "null-trap-eq", "SELECT COUNT(*) AS n FROM orders WHERE shipped_at = NULL");
F("l4", "delivered-shipped-split", "SELECT status, COUNT(*) AS n, COUNT(shipped_at) AS with_ts FROM orders GROUP BY status");
F("l4", "unshipped-cancelled-pending", "SELECT status, COUNT(*) AS n FROM orders WHERE shipped_at IS NULL GROUP BY status");

// ---- l5 · ORDER BY & LIMIT ----
F("l5", "top5-price", "SELECT name, price FROM products ORDER BY price DESC LIMIT 5");
F("l5", "top3-price", "SELECT name, price FROM products ORDER BY price DESC LIMIT 3");
F("l5", "bottom3-price", "SELECT name, price FROM products ORDER BY price ASC LIMIT 3");
F("l5", "top3-orders", "SELECT id, ROUND(total,2) AS total, status FROM orders ORDER BY total DESC LIMIT 3");
F("l5", "top5-orders", "SELECT id, ROUND(total,2) AS total, status FROM orders ORDER BY total DESC LIMIT 5");
F("l5", "cheapest5-instock", "SELECT name, price, stock FROM products WHERE stock > 0 ORDER BY price ASC LIMIT 5");
F("l5", "alpha-first-last", "SELECT (SELECT name FROM customers ORDER BY name LIMIT 1) AS first_name, (SELECT name FROM customers ORDER BY name DESC LIMIT 1) AS last_name");
F("l5", "page2-products", "SELECT name, price FROM products ORDER BY price DESC LIMIT 5 OFFSET 5");
F("l5", "top5-delivered", "SELECT id, ROUND(total,2) AS total FROM orders WHERE status = 'delivered' ORDER BY total DESC LIMIT 5");
F("l5", "max-stock-product", "SELECT name, stock FROM products ORDER BY stock DESC LIMIT 1");
F("l5", "latest3-orders", "SELECT id, status, created_at FROM orders ORDER BY created_at DESC LIMIT 3");
F("l5", "oldest-order", "SELECT id, created_at, ROUND(total,2) AS total FROM orders ORDER BY created_at ASC LIMIT 1");
F("l5", "top3-cancelled", "SELECT id, ROUND(total,2) AS total FROM orders WHERE status = 'cancelled' ORDER BY total DESC LIMIT 3");
F("l5", "bottom5-stock", "SELECT name, stock FROM products ORDER BY stock ASC LIMIT 5");
F("l5", "top5-big-spenders-orders", "SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id ORDER BY orders DESC, customer_id LIMIT 5");

// ---- l6 · DISTINCT ----
F("l6", "distinct-cities", "SELECT COUNT(DISTINCT city) AS cities FROM customers");
F("l6", "distinct-regions", "SELECT COUNT(DISTINCT region) AS regions FROM customers");
F("l6", "distinct-statuses", "SELECT COUNT(DISTINCT status) AS statuses FROM orders");
F("l6", "distinct-categories", "SELECT COUNT(DISTINCT category) AS categories FROM products");
F("l6", "category-list", "SELECT DISTINCT category FROM products ORDER BY category");
F("l6", "distinct-suppliers-used", "SELECT COUNT(DISTINCT supplier_id) AS suppliers FROM products");
F("l6", "distinct-months", "SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) AS months FROM orders");
F("l6", "distinct-quantities", "SELECT DISTINCT quantity FROM order_items ORDER BY quantity");
F("l6", "distinct-prices", "SELECT COUNT(DISTINCT price) AS prices FROM products");
F("l6", "distinct-cities-eu", "SELECT COUNT(DISTINCT city) AS eu_cities FROM customers WHERE region = 'EU'");
F("l6", "distinct-cities-active", "SELECT COUNT(DISTINCT city) AS active_cities FROM customers WHERE active = 1");
F("l6", "distinct-statuses-delivered", "SELECT COUNT(DISTINCT status) AS s FROM orders WHERE status = 'delivered'");
F("l6", "distinct-categories-over-100", "SELECT COUNT(DISTINCT category) AS c FROM products WHERE price > 100");
F("l6", "distinct-customers-ordering", "SELECT COUNT(DISTINCT customer_id) AS buyers FROM orders");
F("l6", "distinct-products-sold", "SELECT COUNT(DISTINCT product_id) AS sold_products FROM order_items");
F("l6", "city-list", "SELECT DISTINCT city FROM customers ORDER BY city");
F("l6", "distinct-order-month-list", "SELECT DISTINCT strftime('%Y-%m', created_at) AS month FROM orders ORDER BY month");

// ---- l7 · aggregates ----
F("l7", "grand-totals", "SELECT ROUND(SUM(total),2) AS revenue, ROUND(AVG(total),2) AS avg_order, ROUND(MIN(total),2) AS smallest, ROUND(MAX(total),2) AS biggest, COUNT(*) AS orders FROM orders");
F("l7", "totals-by-status", "SELECT status, COUNT(*) AS n, ROUND(SUM(total),2) AS revenue, ROUND(AVG(total),2) AS avg_order FROM orders GROUP BY status");
F("l7", "price-aggregates", "SELECT ROUND(AVG(price),2) AS avg_price, ROUND(MIN(price),2) AS min_price, ROUND(MAX(price),2) AS max_price, COUNT(*) AS n FROM products");
F("l7", "stock-aggregates", "SELECT SUM(stock) AS units, ROUND(AVG(stock),1) AS avg_stock, MAX(stock) AS max_stock, MIN(stock) AS min_stock FROM products");
F("l7", "items-aggregates", "SELECT SUM(quantity) AS units_sold, ROUND(AVG(quantity),2) AS avg_qty, MAX(quantity) AS max_qty, COUNT(*) AS lines FROM order_items");
F("l7", "items-revenue", "SELECT ROUND(SUM(quantity * unit_price),2) AS line_revenue FROM order_items");
F("l7", "delivered-aggregates", "SELECT COUNT(*) AS n, ROUND(SUM(total),2) AS revenue, ROUND(AVG(total),2) AS avg_order FROM orders WHERE status = 'delivered'");
F("l7", "pending-aggregates", "SELECT COUNT(*) AS n, ROUND(SUM(total),2) AS pipeline FROM orders WHERE status = 'pending'");
F("l7", "cancelled-aggregates", "SELECT COUNT(*) AS n, ROUND(SUM(total),2) AS lost_value, ROUND(MAX(total),2) AS biggest_loss FROM orders WHERE status = 'cancelled'");
F("l7", "sum-where-500", "SELECT ROUND(SUM(total),2) AS big_money FROM orders WHERE total > 500");
F("l7", "avg-where-under-100", "SELECT ROUND(AVG(total),2) AS avg_small FROM orders WHERE total < 100");
F("l7", "sum-empty-is-null", "SELECT SUM(total) AS s FROM orders WHERE total > 99999");
F("l7", "count-empty", "SELECT COUNT(*) AS n FROM orders WHERE total > 99999");
F("l7", "stock-by-zero-check", "SELECT COUNT(*) AS zero_stock FROM products WHERE stock = 0");
F("l7", "revenue-2024-01", "SELECT ROUND(SUM(total),2) AS jan_revenue FROM orders WHERE strftime('%Y-%m', created_at) = '2024-01'");
F("l7", "max-order-row", "SELECT id, customer_id, ROUND(total,2) AS total, status FROM orders ORDER BY total DESC LIMIT 1");
F("l7", "min-order-row", "SELECT id, customer_id, ROUND(total,2) AS total, status FROM orders ORDER BY total ASC LIMIT 1");

// ---- l8 · GROUP BY & HAVING ----
F("l8", "orders-by-status-gb", "SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY n DESC");
F("l8", "customers-by-region-gb", "SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY n DESC");
F("l8", "customers-by-active-gb", "SELECT active, COUNT(*) AS n FROM customers GROUP BY active");
F("l8", "products-by-category-gb", "SELECT category, COUNT(*) AS n, ROUND(AVG(price),2) AS avg_price, ROUND(MIN(price),2) AS min_price, ROUND(MAX(price),2) AS max_price FROM products GROUP BY category ORDER BY n DESC");
F("l8", "products-by-supplier-gb", "SELECT supplier_id, COUNT(*) AS n FROM products GROUP BY supplier_id ORDER BY n DESC, supplier_id");
F("l8", "orders-by-month-gb", "SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS n FROM orders GROUP BY month ORDER BY month");
F("l8", "revenue-by-month-gb", "SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total),2) AS revenue FROM orders GROUP BY month ORDER BY month");
F("l8", "orders-by-customer-gb", "SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id ORDER BY n DESC, customer_id");
F("l8", "items-by-product-gb", "SELECT product_id, COUNT(*) AS lines, SUM(quantity) AS units FROM order_items GROUP BY product_id ORDER BY lines DESC, product_id LIMIT 8");
F("l8", "having-avg-price-200", "SELECT category, ROUND(AVG(price),2) AS avg_price FROM products GROUP BY category HAVING AVG(price) > 200");
F("l8", "having-avg-price-150", "SELECT category, ROUND(AVG(price),2) AS avg_price FROM products GROUP BY category HAVING AVG(price) > 150");
F("l8", "having-avg-price-100", "SELECT category, ROUND(AVG(price),2) AS avg_price FROM products GROUP BY category HAVING AVG(price) > 100");
F("l8", "having-cities-multi", "SELECT city, COUNT(*) AS n FROM customers GROUP BY city HAVING COUNT(*) > 1 ORDER BY n DESC, city");
F("l8", "having-months-10plus", "SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS n FROM orders GROUP BY month HAVING COUNT(*) >= 10 ORDER BY month");
F("l8", "having-months-8plus", "SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS n FROM orders GROUP BY month HAVING COUNT(*) >= 8 ORDER BY month");
F("l8", "having-suppliers-2plus", "SELECT supplier_id, COUNT(*) AS n FROM products GROUP BY supplier_id HAVING COUNT(*) >= 2 ORDER BY n DESC, supplier_id");
F("l8", "having-suppliers-3plus", "SELECT supplier_id, COUNT(*) AS n FROM products GROUP BY supplier_id HAVING COUNT(*) >= 3 ORDER BY n DESC, supplier_id");
F("l8", "having-status-20plus", "SELECT status, COUNT(*) AS n FROM orders GROUP BY status HAVING COUNT(*) > 20");
F("l8", "group-region-orders-single", "SELECT COUNT(*) AS n, ROUND(SUM(total),2) AS revenue FROM orders");
F("l8", "items-lines-by-order-gb", "SELECT order_id, COUNT(*) AS lines FROM order_items GROUP BY order_id ORDER BY lines DESC, order_id LIMIT 6");
F("l8", "revenue-by-status-desc", "SELECT status, ROUND(SUM(total),2) AS revenue FROM orders GROUP BY status ORDER BY revenue DESC");

// ---- cap · capstone combos ----
F("cap", "top-month-revenue", "SELECT strftime('%Y-%m', created_at) AS month, ROUND(SUM(total),2) AS revenue FROM orders GROUP BY month ORDER BY revenue DESC LIMIT 1");
F("cap", "top-month-orders", "SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS n FROM orders GROUP BY month ORDER BY n DESC LIMIT 1");
F("cap", "top-category-avg", "SELECT category, ROUND(AVG(price),2) AS avg_price FROM products GROUP BY category ORDER BY avg_price DESC LIMIT 1");
F("cap", "unshipped-share", "SELECT ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM orders), 1) AS pct_unshipped FROM orders WHERE shipped_at IS NULL");
F("cap", "top-buyer-orders", "SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id ORDER BY n DESC LIMIT 1");
F("cap", "delivered-monthly", "SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS n, ROUND(SUM(total),2) AS revenue FROM orders WHERE status = 'delivered' GROUP BY month ORDER BY month");
F("cap", "top-line-revenue-items", "SELECT product_id, ROUND(SUM(quantity * unit_price),2) AS line_revenue FROM order_items GROUP BY product_id ORDER BY line_revenue DESC LIMIT 5");

// ---- reference lists for authoring ----
F("meta", "ref-customers", "SELECT id, name, city, region, active, created_at FROM customers ORDER BY id");
F("meta", "ref-products", "SELECT id, name, category, price, stock, supplier_id FROM products ORDER BY id");
F("meta", "ref-suppliers", "SELECT id, name, region, rating FROM suppliers ORDER BY id");
F("meta", "ref-date-range", "SELECT MIN(created_at) AS first_order, MAX(created_at) AS last_order FROM orders");

db.close();

const summary: Record<string, number> = {};
for (const f of facts) summary[f.topic] = (summary[f.topic] ?? 0) + 1;
writeFileSync("scripts/case-facts-out.json", JSON.stringify({ summary, facts }, null, 2));
console.log("facts written:", summary);
