/// <reference types="bun-types" />
/**
 * Wave-3 receipt batch (cs-1001–1050, deepening q1–q4).
 * Fresh angles only — no overlap with wave-1 C01–C85 or wave-2 W01–W63.
 * Run: bun scripts/m4-cases-w3-facts.ts 2>&1 | tee scripts/m4-cases-w3-out.txt
 */
import { Database } from "bun:sqlite";

const db = new Database("db/custom.db", { readonly: true });

const probes: Array<[string, string]> = [
  // ---- q1 IN deepening ----
  ["V01 fitness-club customers (3-hop IN)", `SELECT COUNT(*) n FROM customers WHERE id IN (
  SELECT customer_id FROM orders WHERE id IN (
    SELECT order_id FROM order_items WHERE product_id IN (
      SELECT id FROM products WHERE category = 'Fitness'
    )
  )
)`],
  ["V02 fitness-club names", `SELECT name FROM customers WHERE id IN (
  SELECT customer_id FROM orders WHERE id IN (
    SELECT order_id FROM order_items WHERE product_id IN (
      SELECT id FROM products WHERE category = 'Fitness'
    )
  )
) ORDER BY name`],
  ["V03 electronics baskets distinct", `SELECT COUNT(DISTINCT order_id) n FROM order_items WHERE product_id IN (
  SELECT id FROM products WHERE category = 'Electronics')`],
  ["V04 at-risk orders pending+cancelled", `SELECT COUNT(*) n FROM orders WHERE status IN ('pending','cancelled')`],
  ["V05 void-invoice customer", `SELECT name FROM customers WHERE id IN (SELECT customer_id FROM invoices WHERE status = 'void')`],
  ["V06 video two-hop customers", `SELECT COUNT(*) n FROM customers WHERE id IN (
  SELECT customer_id FROM orders WHERE id IN (
    SELECT order_id FROM order_items WHERE product_id IN (
      SELECT id FROM products WHERE category = 'Video'
    )
  )
)`],
  ["V07 products never ordered", `SELECT name FROM products WHERE id NOT IN (SELECT product_id FROM order_items)`],
  ["V08 invoices never paid", `SELECT COUNT(*) n FROM invoices WHERE id NOT IN (SELECT invoice_id FROM payments)`],
  ["V09 orders that are their customer's biggest (row-value IN over aggregate)", `SELECT COUNT(*) n FROM orders WHERE (customer_id, total) IN (
  SELECT customer_id, MAX(total) FROM orders GROUP BY customer_id)`],
  ["V10 shipped-or-delivered club", `SELECT COUNT(*) n FROM customers WHERE id IN (
  SELECT customer_id FROM orders WHERE status IN ('shipped','delivered'))`],
  ["V11 multi-unit baskets qty>=3", `SELECT COUNT(*) n FROM orders WHERE id IN (
  SELECT order_id FROM order_items WHERE quantity >= 3)`],
  ["V12 cancelled revenue", `SELECT ROUND(SUM(total),2) v FROM orders WHERE status = 'cancelled'`],
  ["V13 apparel baskets", `SELECT COUNT(DISTINCT order_id) n FROM order_items WHERE product_id IN (
  SELECT id FROM products WHERE category = 'Apparel')`],
  ["V14 accessories customers", `SELECT COUNT(*) n FROM customers WHERE id IN (
  SELECT customer_id FROM orders WHERE id IN (
    SELECT order_id FROM order_items WHERE product_id IN (
      SELECT id FROM products WHERE category = 'Accessories'
    )
  )
)`],

  // ---- q2 scalar deepening ----
  ["V15 shipped-only avg", `SELECT ROUND(AVG(total),2) bar FROM orders WHERE status = 'shipped'`],
  ["V16 orders above shipped avg", `SELECT COUNT(*) n FROM orders WHERE total > (SELECT AVG(total) FROM orders WHERE status = 'shipped')`],
  ["V17 avg open invoice (units)", `SELECT ROUND(AVG(amount_cents)/100.0,2) bar FROM invoices WHERE status = 'open'`],
  ["V18 invoices above open-avg", `SELECT COUNT(*) n FROM invoices WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices WHERE status = 'open')`],
  ["V19 orders under half-bar", `SELECT COUNT(*) n FROM orders WHERE total < (SELECT AVG(total)/2 FROM orders)`],
  ["V20 top-3 gaps vs store avg", `SELECT id, ROUND(total - (SELECT AVG(total) FROM orders), 2) gap FROM orders ORDER BY gap DESC LIMIT 3`],
  ["V21 bottom gap (most below bar)", `SELECT id, ROUND(total - (SELECT AVG(total) FROM orders), 2) gap FROM orders ORDER BY gap ASC LIMIT 1`],
  ["V22 nested scalar: best price under catalog avg", `SELECT ROUND(MAX(price),2) v FROM products WHERE price < (SELECT AVG(price) FROM products)`],
  ["V23 customers whose cancelled-MAX is NULL (IS NULL guard)", `SELECT COUNT(*) n FROM customers c WHERE (
  SELECT MAX(total) FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled'
) IS NULL`],
  ["V24 complement: has a cancelled max", `SELECT COUNT(*) n FROM customers c WHERE (
  SELECT MAX(total) FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled'
) IS NOT NULL`],
  ["V25 wearables stamp vs catalog avg", `SELECT name, price, (SELECT ROUND(AVG(price),2) FROM products) catalog_avg FROM products WHERE category = 'Wearables'`],
  ["V26 suppliers above global 4.3", `SELECT name, rating FROM suppliers WHERE rating > (SELECT AVG(rating) FROM suppliers)`],
  ["V27 categories above catalog avg (HAVING scalar)", `SELECT category, ROUND(AVG(price),2) avg_price FROM products GROUP BY category
HAVING AVG(price) > (SELECT AVG(price) FROM products)`],
  ["V28 biggest invoice raw", `SELECT number, amount_cents FROM invoices ORDER BY amount_cents DESC LIMIT 1`],
  ["V29 invoices above avg invoice", `SELECT COUNT(*) n FROM invoices WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices)`],
  ["V30 expenses below avg", `SELECT COUNT(*) n FROM expenses WHERE amount_cents < (SELECT AVG(amount_cents) FROM expenses)`],
  ["V31 avg expense (units)", `SELECT ROUND(AVG(amount_cents)/100.0,2) bar FROM expenses`],
  ["V32 orders above 3x bar", `SELECT COUNT(*) n FROM orders WHERE total > 3 * (SELECT AVG(total) FROM orders)`],
  ["V33 min order id + gap", `SELECT id, total, ROUND(total - (SELECT AVG(total) FROM orders),2) gap FROM orders ORDER BY total ASC LIMIT 1`],
  ["V34 product count under catalog avg", `SELECT COUNT(*) n FROM products WHERE price < (SELECT AVG(price) FROM products)`],

  // ---- q3 EXISTS deepening ----
  ["V35 open-invoice customers", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (
  SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status = 'open')`],
  ["V36 open-invoice names", `SELECT c.name FROM customers c WHERE EXISTS (
  SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status = 'open'
) ORDER BY c.name`],
  ["V37 never-delivered customers", `SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')`],
  ["V38 never-delivered names", `SELECT c.name FROM customers c WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered'
) ORDER BY c.name`],
  ["V39 both pending AND cancelled", `SELECT COUNT(*) n FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending')
  AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'cancelled')`],
  ["V40 uncorrelated EXISTS true trap", `SELECT COUNT(*) n FROM customers WHERE EXISTS (
  SELECT 1 FROM expenses WHERE category = 'Travel')`],
  ["V41 uncorrelated EXISTS false", `SELECT COUNT(*) n FROM customers WHERE EXISTS (
  SELECT 1 FROM expenses WHERE category = 'Legal')`],
  ["V42 max order date", `SELECT MAX(created_at) d FROM orders`],
  ["V43 min order date", `SELECT MIN(created_at) d FROM orders`],
  ["V44 customers with order in final 30 days", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id
    AND o.created_at >= (SELECT date(MAX(created_at), '-29 day') FROM orders))`],
  ["V45 EXISTS aggregate-inner always-true", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (
  SELECT MAX(o.total) FROM orders o WHERE o.customer_id = c.id)`],
  ["V46 never-shipped (shipped+delivered absent)", `SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status IN ('shipped','delivered'))`],
  ["V47 paid-invoice EXISTS customers", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (
  SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status = 'paid')`],
  ["V48 cancelled-order EXISTS club", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')`],

  // ---- q4 correlated deepening ----
  ["V49 invoice-count stamp top5", `SELECT c.name, (SELECT COUNT(*) FROM invoices i WHERE i.customer_id = c.id) bills
FROM customers c ORDER BY bills DESC, c.name LIMIT 5`],
  ["V50 min-order floor bottom5", `SELECT c.name, (SELECT MIN(o.total) FROM orders o WHERE o.customer_id = c.id) floor_order
FROM customers c ORDER BY floor_order ASC LIMIT 5`],
  ["V51 products below own-category avg", `SELECT COUNT(*) n FROM products p WHERE p.price < (
  SELECT AVG(p2.price) FROM products p2 WHERE p2.category = p.category)`],
  ["V52 products below list", `SELECT p.name, p.price, (SELECT ROUND(AVG(p2.price),2) FROM products p2 WHERE p2.category = p.category) cat_avg
FROM products p WHERE p.price < (SELECT AVG(p2.price) FROM products p2 WHERE p2.category = p.category)`],
  ["V53 suppliers below region avg", `SELECT s.name, s.rating, (SELECT ROUND(AVG(s2.rating),2) FROM suppliers s2 WHERE s2.region = s.region) region_avg
FROM suppliers s WHERE s.rating < (SELECT AVG(s2.rating) FROM suppliers s2 WHERE s2.region = s.region)`],
  ["V54 every order above store bar", `SELECT COUNT(*) n FROM customers c WHERE (
  SELECT MIN(o.total) FROM orders o WHERE o.customer_id = c.id
) > (SELECT AVG(total) FROM orders)`],
  ["V55 biggest-order-above-store-bar", `SELECT COUNT(*) n FROM orders o WHERE o.total = (
  SELECT MAX(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id
) AND o.total > (SELECT AVG(total) FROM orders)`],
  ["V56 own-max rows count (ties?)", `SELECT COUNT(*) n FROM orders o WHERE o.total = (
  SELECT MAX(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`],
  ["V57 customers whose max beats 800", `SELECT COUNT(*) n FROM customers c WHERE (
  SELECT MAX(o.total) FROM orders o WHERE o.customer_id = c.id) > 800`],
  ["V58 own 2x avg blowouts", `SELECT COUNT(*) n FROM orders o WHERE o.total > 2 * (
  SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`],
  ["V59 last-order stamp top3", `SELECT c.name, (SELECT MAX(o.created_at) FROM orders o WHERE o.customer_id = c.id) last_order
FROM customers c ORDER BY last_order DESC LIMIT 3`],
  ["V60 delivered-spend top3 correlated", `SELECT c.name, (SELECT ROUND(SUM(o.total),2) FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') d_spend
FROM customers c ORDER BY d_spend DESC LIMIT 3`],
  ["V61 invoices-per-customer max", `SELECT c.name, (SELECT COUNT(*) FROM invoices i WHERE i.customer_id = c.id) bills
FROM customers c ORDER BY bills DESC, c.name LIMIT 1`],
  ["V62 customers with more cancelled than delivered", `SELECT COUNT(*) n FROM customers c WHERE
  (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled')
> (SELECT COUNT(*) FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'delivered')`],
];

for (const [label, sql] of probes) {
  const id = label.slice(0, label.indexOf(" "));
  try {
    const rows = db.query(sql).all();
    console.log(`${label}: ${JSON.stringify(rows)}`);
  } catch (e) {
    console.log(`${label}: ERROR ${e instanceof Error ? e.message : String(e)}`);
  }
}
console.log(`--- ${probes.length} probes done`);
db.close();
