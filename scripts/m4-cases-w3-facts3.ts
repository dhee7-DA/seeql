/// <reference types="bun-types" />
/** Wave-3 fact receipts, batch 3 — final pre-write checks for hard cases. */
import { Database } from "bun:sqlite";

const db = new Database("db/custom.db", { readonly: true });
let n = 137;
function probe(label: string, sql: string) {
  n++;
  const tag = `R${String(n).padStart(3, "0")}`;
  try {
    const rows = db.query(sql).all();
    console.log(`${tag} ${label}: ${JSON.stringify(rows)}`);
  } catch (e) {
    console.log(`${tag} ${label}: ERROR ${(e as Error).message}`);
  }
}

// cs-1007 sub-4.0 supply avoidance
probe("buyers of sub-4.0-sourced products (<4.0 = Pacific only)", `SELECT COUNT(DISTINCT o.customer_id) AS n FROM orders o JOIN order_items oi ON oi.order_id=o.id WHERE oi.product_id IN (SELECT id FROM products WHERE supplier_id IN (SELECT id FROM suppliers WHERE rating < 4.0))`);
probe("buyers of <=4.0-sourced products (Pacific+Andes)", `SELECT COUNT(DISTINCT o.customer_id) AS n FROM orders o JOIN order_items oi ON oi.order_id=o.id WHERE oi.product_id IN (SELECT id FROM products WHERE supplier_id IN (SELECT id FROM suppliers WHERE rating <= 4.0))`);
probe("buyers of >4.0-sourced products", `SELECT COUNT(DISTINCT o.customer_id) AS n FROM orders o JOIN order_items oi ON oi.order_id=o.id WHERE oi.product_id IN (SELECT id FROM products WHERE supplier_id IN (SELECT id FROM suppliers WHERE rating > 4.0))`);
probe("never-exposed customer names (<4.0)", `SELECT name FROM customers WHERE id NOT IN (SELECT o.customer_id FROM orders o JOIN order_items oi ON oi.order_id=o.id WHERE oi.product_id IN (SELECT id FROM products WHERE supplier_id IN (SELECT id FROM suppliers WHERE rating < 4.0)))`);
probe("Pacific Textiles products", `SELECT p.id, p.name FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.rating = 3.9`);
// cs-1001 distractor checks
probe("products in shipped items", `SELECT COUNT(DISTINCT product_id) AS n FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE status='shipped')`);
probe("products whose id matches an order_items id", `SELECT COUNT(*) AS n FROM products WHERE id IN (SELECT id FROM order_items)`);
// q3 hard candidates
probe("all-orders-delivered customers", `SELECT COUNT(*) AS n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status <> 'delivered')`);
probe("all-delivered names", `SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status <> 'delivered')`);
probe("suppliers clean of cancelled", `SELECT s.name FROM suppliers s WHERE NOT EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE p.supplier_id = s.id AND o.status = 'cancelled')`);
probe("suppliers touched by cancelled", `SELECT DISTINCT p.supplier_id, s.name FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE o.status = 'cancelled'`);
// cs-1031 settle-stage
probe("max payment bundle", `SELECT ROUND(MAX(paid)/100.0,2) AS mx FROM (SELECT invoice_id, SUM(amount_cents) AS paid FROM payments GROUP BY invoice_id)`);
probe("max payments per invoice", `SELECT MAX(n) AS mx FROM (SELECT invoice_id, COUNT(*) AS n FROM payments GROUP BY invoice_id)`);
probe("invoices with payments", `SELECT COUNT(DISTINCT invoice_id) AS n FROM payments`);
// cs-1023 distractor
probe("products with times < 15", `SELECT COUNT(*) AS n FROM products p WHERE (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) < 15`);
// cs-1036 region split of >800 orders
probe("orders >800 by region", `SELECT c.region, COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.total > 800 GROUP BY c.region`);
// cs-1048 quantity distractor
probe("items whose product_id in quantity values", `SELECT COUNT(*) AS n FROM order_items WHERE product_id IN (SELECT quantity FROM order_items)`);
probe("sum of product_id over VIP items", `SELECT SUM(product_id) AS s FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id IN (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) > 2000))`);
// cs-1050 vip∩heavy
probe("vip∩delivered>500", `WITH vip AS (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) > 2000), heavy AS (SELECT customer_id FROM orders WHERE status = 'delivered' AND total > 500) SELECT COUNT(*) AS n FROM vip WHERE customer_id IN (SELECT customer_id FROM heavy)`);
probe("vip names", `SELECT c.name FROM customers c WHERE c.id IN (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) > 2000)`);
// cs-1034 >400/>800 order counts overall
probe("orders >400 count", `SELECT COUNT(*) AS n FROM orders WHERE total > 400`);
probe("orders >800 count", `SELECT COUNT(*) AS n FROM orders WHERE total > 800`);
// cs-1010 cancelled avg (AVG rows differ check for cs-1025)
probe("cancelled avg", `SELECT ROUND(AVG(total),2) AS bar FROM orders WHERE status='cancelled'`);
// cs-1029 min day take (MIN distractor)
probe("min day take", `SELECT ROUND(MIN(daily),2) AS mn FROM (SELECT date(created_at) AS d, SUM(total) AS daily FROM orders GROUP BY date(created_at))`);
// cs-1031 COUNT-per-invoice distractor shape
probe("bundle stage as counts max", `SELECT MAX(n) AS mx FROM (SELECT invoice_id, COUNT(*) AS n FROM payments GROUP BY invoice_id)`);
// cs-1036 'US' at bar 800 EU-alternative figure via CTE form
probe("big∧US CTE form 800", `WITH big AS (SELECT customer_id, total FROM orders WHERE total > 800), us AS (SELECT id FROM customers WHERE region = 'US') SELECT COUNT(*) AS n FROM big JOIN us ON us.id = big.customer_id`);
probe("big∧LATAM CTE form 800", `WITH big AS (SELECT customer_id, total FROM orders WHERE total > 800), la AS (SELECT id FROM customers WHERE region = 'LATAM') SELECT COUNT(*) AS n FROM big JOIN la ON la.id = big.customer_id`);
probe("big∧APAC CTE form 800", `WITH big AS (SELECT customer_id, total FROM orders WHERE total > 800), ap AS (SELECT id FROM customers WHERE region = 'APAC') SELECT COUNT(*) AS n FROM big JOIN ap ON ap.id = big.customer_id`);

console.log(`--- ${n} probes done (batch 3)`);
db.close();
