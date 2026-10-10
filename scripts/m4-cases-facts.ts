/// <reference types="bun-types" />
/**
 * M4 case receipts — wave 1 (q1 IN / q2 scalar / q3 EXISTS / q4 correlated).
 * Every figure quoted in a case brief/why/walkthrough is probed here so the
 * prose stays honest; case-audit.ts re-verifies slot figures mechanically.
 * Run: bun scripts/m4-cases-facts.ts
 */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m4cases.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

let n = 0;
function probe(label: string, sql: string) {
  n++;
  try {
    const rows = db.query(sql).all();
    console.log(`C${String(n).padStart(2, "0")} ${label}: ${JSON.stringify(rows)}`);
  } catch (e) {
    console.log(`C${String(n).padStart(2, "0")} ${label}: ERROR ${e instanceof Error ? e.message : e}`);
  }
}

// --- base distributions -----------------------------------------------------
probe("status counts", "SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY n DESC, status");
probe("region counts", "SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY n DESC, region");
probe("category counts", "SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY n DESC, category");
probe("category avgs", "SELECT category, ROUND(AVG(price),2) avg_price FROM products GROUP BY category ORDER BY avg_price DESC");
probe("invoice statuses", "SELECT status, COUNT(*) n FROM invoices GROUP BY status ORDER BY n DESC, status");
probe("supplier ratings", "SELECT name, rating FROM suppliers ORDER BY rating DESC");
probe("supplier regions", "SELECT region, COUNT(*) n FROM suppliers GROUP BY region ORDER BY n DESC, region");
probe("expense categories", "SELECT category, ROUND(SUM(amount_cents)/100.0, 2) total FROM expenses GROUP BY category ORDER BY total DESC");

// --- q1 IN shapes -----------------------------------------------------------
probe("cancelled-club names", "SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'cancelled') ORDER BY name");
probe("cancelled-club count", "SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'cancelled')");
probe("NOT IN cancelled-club count", "SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled')");
probe("pending-club names", "SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'pending') ORDER BY name");
probe("pending-club count", "SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'pending')");
probe("EU+APAC customers", "SELECT COUNT(*) n FROM customers WHERE region IN ('EU', 'APAC')");
probe("EU-only customers", "SELECT COUNT(*) n FROM customers WHERE region = 'EU'");
probe("audio products", "SELECT name, price FROM products WHERE category = 'Audio' ORDER BY price");
probe("orders of audio products", "SELECT COUNT(*) n FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category = 'Audio')");
probe("distinct orders w/ audio", "SELECT COUNT(DISTINCT order_id) n FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category = 'Audio')");
probe("wearables product ids", "SELECT id, name, price FROM products WHERE category = 'Wearables' ORDER BY id");
probe("orders w/ wearable items", "SELECT COUNT(DISTINCT order_id) n FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category = 'Wearables')");
probe("products over 150 ids", "SELECT id, name, price FROM products WHERE price > 150 ORDER BY id");
probe("row-value IN #74", "SELECT id, customer_id, status FROM orders WHERE (customer_id, status) IN ((1, 'shipped'))");
probe("IN literal cities", "SELECT COUNT(*) n FROM customers WHERE city IN ('Berlin', 'London')");
probe("city list", "SELECT DISTINCT city FROM customers ORDER BY city");
probe("NOT IN guarded 12 names", "SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled' AND customer_id IS NOT NULL) ORDER BY name");
probe("shipped-not-cancelled customers", "SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'shipped')");
probe("multi-status IN", "SELECT COUNT(*) n FROM orders WHERE status IN ('pending', 'cancelled')");
probe("IN invoice-paid customers", "SELECT COUNT(DISTINCT customer_id) n FROM invoices WHERE status = 'paid'");
probe("invoices of cancelled-club", "SELECT COUNT(*) n FROM invoices WHERE customer_id IN (SELECT customer_id FROM orders WHERE status = 'cancelled')");
probe("paid invoices of pending-club", "SELECT COUNT(*) n FROM invoices WHERE status = 'paid' AND customer_id IN (SELECT customer_id FROM orders WHERE status = 'pending')");
probe("open invoices EU", "SELECT COUNT(*) n FROM invoices WHERE status = 'open' AND customer_id IN (SELECT id FROM customers WHERE region = 'EU')");
probe("avg invoice amount", "SELECT ROUND(AVG(amount_cents)/100.0, 2) avg_amt FROM invoices");
probe("biggest invoice", "SELECT number, ROUND(amount_cents/100.0, 2) amt FROM invoices WHERE amount_cents = (SELECT MAX(amount_cents) FROM invoices)");
probe("expenses travel rows", "SELECT COUNT(*) n FROM expenses WHERE category = 'Travel'");
probe("expenses above avg", "SELECT COUNT(*) n FROM expenses WHERE amount_cents > (SELECT AVG(amount_cents) FROM expenses)");
probe("avg expense", "SELECT ROUND(AVG(amount_cents)/100.0, 2) avg_amt FROM expenses");
probe("biggest expense", "SELECT vendor, ROUND(amount_cents/100.0, 2) amt FROM expenses WHERE amount_cents = (SELECT MAX(amount_cents) FROM expenses)");
probe("min expense", "SELECT vendor, ROUND(amount_cents/100.0, 2) amt FROM expenses WHERE amount_cents = (SELECT MIN(amount_cents) FROM expenses)");

// --- q2 scalar shapes --------------------------------------------------------
probe("store avg order", "SELECT ROUND(AVG(total), 2) bar FROM orders");
probe("orders above store avg", "SELECT COUNT(*) n FROM orders WHERE total > (SELECT AVG(total) FROM orders)");
probe("orders below store avg", "SELECT COUNT(*) n FROM orders WHERE total < (SELECT AVG(total) FROM orders)");
probe("max order", "SELECT id, customer_id, total FROM orders WHERE total = (SELECT MAX(total) FROM orders)");
probe("min order", "SELECT id, customer_id, total FROM orders WHERE total = (SELECT MIN(total) FROM orders)");
probe("max price product", "SELECT name, price FROM products WHERE price = (SELECT MAX(price) FROM products)");
probe("min price product", "SELECT name, price FROM products WHERE price = (SELECT MIN(price) FROM products)");
probe("avg price products", "SELECT ROUND(AVG(price), 2) avg_price FROM products");
probe("products above avg price", "SELECT COUNT(*) n FROM products WHERE price > (SELECT AVG(price) FROM products)");
probe("HAVING category beats catalog avg", "SELECT category, ROUND(AVG(price), 2) avg_price FROM products GROUP BY category HAVING AVG(price) > (SELECT AVG(price) FROM products)");
probe("customer bar avg-order", "SELECT ROUND(AVG(total), 2) bar FROM orders");
probe("customers above VIP bar 2177.08", "SELECT COUNT(*) n FROM customers WHERE (SELECT SUM(total) FROM orders WHERE customer_id = customers.id) > 2177.08");
probe("top spender", "SELECT name, (SELECT SUM(total) FROM orders WHERE customer_id = customers.id) spend FROM customers ORDER BY spend DESC LIMIT 1");
probe("orders count scalar stamp", "SELECT COUNT(*) n, (SELECT COUNT(*) FROM orders) total_orders FROM customers");
probe("max supplier rating", "SELECT name, rating FROM suppliers WHERE rating = (SELECT MAX(rating) FROM suppliers)");
probe("orders above 2x avg", "SELECT COUNT(*) n FROM orders WHERE total > 2 * (SELECT AVG(total) FROM orders)");
probe("delivered-only avg", "SELECT ROUND(AVG(total), 2) bar FROM orders WHERE status = 'delivered'");
probe("above delivered avg", "SELECT COUNT(*) n FROM orders WHERE total > (SELECT AVG(total) FROM orders WHERE status = 'delivered')");
probe("avg supplier rating", "SELECT ROUND(AVG(rating), 2) r FROM suppliers");
probe("suppliers above own avg", "SELECT COUNT(*) n FROM suppliers WHERE rating > (SELECT AVG(rating) FROM suppliers)");
probe("pending avg", "SELECT ROUND(AVG(total), 2) bar FROM orders WHERE status = 'pending'");
probe("avg lifetime spend", "SELECT ROUND((SELECT SUM(total) FROM orders) / 16.0, 2) avg_spend");

// --- q3 EXISTS shapes --------------------------------------------------------
probe("EXISTS pending customers", "SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending')");
probe("EXISTS pending names", "SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending') ORDER BY c.name");
probe("NOT EXISTS shipped", "SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped')");
probe("NOT EXISTS shipped names", "SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped') ORDER BY c.name");
probe("EXISTS impossible", "SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'returned')");
probe("EXISTS EU+pending", "SELECT COUNT(*) n FROM customers c WHERE c.region = 'EU' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending')");
probe("EXISTS audio order", "SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE o.customer_id = c.id AND p.category = 'Audio')");
probe("EXISTS big order 1000", "SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.total > 1000) ORDER BY c.name");
probe("EXISTS >1000 count", "SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.total > 1000)");
probe("NOT EXISTS >1000", "SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.total > 1000)");
probe("EXISTS expense travel", "SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM expenses e WHERE e.category = 'Travel')");
probe("veterans 4+ delivered", "SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') ORDER BY n DESC, c.name");

// --- q4 correlated shapes ----------------------------------------------------
probe("own-avg stellar total", "SELECT COUNT(*) n FROM orders o WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)");
probe("own-avg per-customer stellar", "SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = c.id)) stellar FROM customers c ORDER BY stellar DESC, c.name LIMIT 8");
probe("both bars", "SELECT COUNT(*) n FROM orders o WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) AND o.total > (SELECT AVG(total) FROM orders)");
probe("own-only", "SELECT COUNT(*) n FROM orders o WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) AND o.total <= (SELECT AVG(total) FROM orders)");
probe("store-only", "SELECT COUNT(*) n FROM orders o WHERE o.total <= (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) AND o.total > (SELECT AVG(total) FROM orders)");
probe("correlated spend stamp", "SELECT name, (SELECT SUM(total) FROM orders WHERE customer_id = customers.id) spend FROM customers WHERE customers.id IN (1,2,3) ");
probe("correlated count stamp", "SELECT name, (SELECT COUNT(*) FROM orders WHERE customer_id = customers.id) n FROM customers ORDER BY n DESC LIMIT 5");
probe("correlated max order per cust stamp", "SELECT c.name, (SELECT MAX(total) FROM orders o WHERE o.customer_id = c.id) biggest FROM customers c ORDER BY biggest DESC LIMIT 5");
probe("customers w/ above-own-avg order", "SELECT COUNT(DISTINCT customer_id) n FROM orders o WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)");
probe("solo customers", "SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) n FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) = 1");
probe(" correlated price vs category avg", "SELECT p.name, p.price, ROUND((SELECT AVG(p2.price) FROM products p2 WHERE p2.category = p.category), 2) cat_avg FROM products p WHERE p.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category = p.category) ORDER BY p.price DESC");
probe("above category avg count", "SELECT COUNT(*) n FROM products p WHERE p.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category = p.category)");
probe("suppliers above region avg", "SELECT s.name, s.rating, ROUND((SELECT AVG(s2.rating) FROM suppliers s2 WHERE s2.region = s.region), 2) region_avg FROM suppliers s WHERE s.rating > (SELECT AVG(s2.rating) FROM suppliers s2 WHERE s2.region = s.region)");

rmSync(COPY, { force: true });
console.log(`--- ${n} probes done`);
