/// <reference types="bun-types" />
/**
 * Wave-5 receipt batch (cs-1101–1150, third pass on q1–q4).
 * Fresh angles only vs waves 1+3. Run: bun scripts/m4-cases-w5-facts.ts 2>&1 | tee scripts/m4-cases-w5-out.txt
 */
import { Database } from "bun:sqlite";

const db = new Database("db/custom.db", { readonly: true });

const probes: Array<[string, string]> = [
  // q1 IN third pass
  ["W501 vendors of Travel+Tools", `SELECT DISTINCT vendor FROM expenses WHERE category IN ('Travel','Tools') ORDER BY vendor`],
  ["W502 APAC+LATAM customers", `SELECT COUNT(*) n FROM customers WHERE region IN ('APAC','LATAM')`],
  ["W503 suppliers in Berlin's region", `SELECT name FROM suppliers WHERE region IN (SELECT region FROM customers WHERE city = 'Berlin')`],
  ["W504 shipped-club EU members", `SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'shipped') AND region IN ('EU')`],
  ["W505 exact-double order (IN expression)", `SELECT COUNT(*) n FROM orders WHERE total IN (SELECT total * 2 FROM orders WHERE id = 51)`],
  ["W506 open-invoice EU customers", `SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM invoices WHERE status = 'open') AND region = 'EU'`],
  ["W507 big-expense vendors", `SELECT DISTINCT vendor FROM expenses WHERE amount_cents IN (SELECT amount_cents FROM expenses WHERE amount_cents > 150000) ORDER BY vendor`],
  ["W508 cable+accessory baskets", `SELECT COUNT(DISTINCT order_id) n FROM order_items WHERE product_id IN (
  SELECT id FROM products WHERE category IN ('Accessories','Fitness'))`],
  ["W509 orders from paid-club customers", `SELECT COUNT(*) n FROM orders WHERE customer_id IN (SELECT customer_id FROM invoices WHERE status = 'paid')`],
  ["W510 Wearables+Audio customer club", `SELECT COUNT(*) n FROM customers WHERE id IN (
  SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (
    SELECT id FROM products WHERE category IN ('Wearables','Audio'))))`],
  ["W511 pending-club EU members", `SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'pending') AND region = 'EU'`],
  ["W512 Audio+Video baskets", `SELECT COUNT(DISTINCT order_id) n FROM order_items WHERE product_id IN (
  SELECT id FROM products WHERE category IN ('Audio','Video'))`],
  ["W513 vendors above 1000 euros", `SELECT COUNT(*) n FROM expenses WHERE vendor IN (
  SELECT vendor FROM expenses GROUP BY vendor HAVING SUM(amount_cents) > 100000)`],
  ["W514 three-city customers", `SELECT COUNT(*) n FROM customers WHERE city IN ('Berlin','Austin','Tokyo')`],

  // q2 scalar third pass
  ["W515 orders above the minimum", `SELECT COUNT(*) n FROM orders WHERE total > (SELECT MIN(total) FROM orders)`],
  ["W516 suppliers at the top rating", `SELECT COUNT(*) n FROM suppliers WHERE rating = (SELECT MAX(rating) FROM suppliers)`],
  ["W517 cheapest above-avg product", `SELECT ROUND(MIN(price),2) v FROM products WHERE price > (SELECT AVG(price) FROM products)`],
  ["W518 within-10%-of-bar band", `SELECT COUNT(*) n FROM orders WHERE total BETWEEN (SELECT AVG(total) * 0.9 FROM orders) AND (SELECT AVG(total) * 1.1 FROM orders)`],
  ["W519 invoice statuses below avg", `SELECT status, ROUND(AVG(amount_cents)/100.0,2) a FROM invoices GROUP BY status HAVING AVG(amount_cents) < (SELECT AVG(amount_cents) FROM invoices)`],
  ["W520 max-minus-avg gap", `SELECT ROUND((SELECT MAX(total) FROM orders) - (SELECT AVG(total) FROM orders), 2) v`],
  ["W521 expenses above half-bar", `SELECT COUNT(*) n FROM expenses WHERE amount_cents > (SELECT AVG(amount_cents)/2 FROM expenses)`],
  ["W522 delivered total vs store scalar", `SELECT ROUND((SELECT SUM(total) FROM orders WHERE status = 'delivered') / (SELECT SUM(total) FROM orders) * 100, 1) pct`],
  ["W523 min paid invoice scalar", `SELECT number, ROUND(amount_cents/100.0,2) v FROM invoices WHERE amount_cents = (SELECT MIN(amount_cents) FROM invoices)`],
  ["W524 orders below delivered-bar via scalar", `SELECT COUNT(*) n FROM orders WHERE total < (SELECT AVG(total) FROM orders WHERE status = 'delivered')`],
  ["W525 biggest pending ticket", `SELECT id, total FROM orders WHERE total = (SELECT MAX(total) FROM orders WHERE status = 'pending')`],
  ["W526 shipped max scalar", `SELECT COUNT(*) n FROM orders WHERE total > (SELECT MAX(total) FROM orders WHERE status = 'pending')`],
  ["W527 per-product line-count stamp", `SELECT name, (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) AS lines FROM products p WHERE id = 1`],
  ["W528 avg invoice vs avg order", `SELECT ROUND((SELECT AVG(amount_cents)/100.0 FROM invoices) - (SELECT AVG(total) FROM orders), 2) v`],

  // q3 EXISTS third pass
  ["W529 big-invoice customers", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.amount_cents > 600000)`],
  ["W530 never-apparel customers", `SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category = 'Apparel')))`],
  ["W531 paid AND open customers", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status = 'paid') AND EXISTS (SELECT 1 FROM invoices i2 WHERE i2.customer_id = c.id AND i2.status = 'open')`],
  ["W532 paid-open names", `SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status = 'paid') AND EXISTS (SELECT 1 FROM invoices i2 WHERE i2.customer_id = c.id AND i2.status = 'open') ORDER BY c.name`],
  ["W533 shipped>delivered customers", `SELECT COUNT(*) n FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped') > (SELECT COUNT(*) FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'delivered')`],
  ["W534 cancelled-club big-order members", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled' AND o.total > 500)`],
  ["W535 EXISTS inner with own-avg bar", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.total > 2 * (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = c.id))`],
  ["W536 Electronics-region customers", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category = 'Electronics')) AND c.region = 'APAC')`],
  ["W537 open-invoice non-EU members", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status = 'open') AND c.region != 'EU'`],
  ["W538 pending-club with delivered history", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending') AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'delivered')`],

  // q4 correlated third pass
  ["W539 products above supplier avg", `SELECT COUNT(*) n FROM products p WHERE p.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.supplier_id = p.supplier_id)`],
  ["W540 products above supplier list", `SELECT p.name, p.price, (SELECT ROUND(AVG(p2.price),2) FROM products p2 WHERE p2.supplier_id = p.supplier_id) sup_avg FROM products p WHERE p.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.supplier_id = p.supplier_id) ORDER BY p.price DESC`],
  ["W541 oldest-order stamp bottom3", `SELECT c.name, (SELECT MIN(o.created_at) FROM orders o WHERE o.customer_id = c.id) first_order FROM customers c ORDER BY first_order ASC LIMIT 3`],
  ["W542 shipped-count stamps top3", `SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped') sh FROM customers c ORDER BY sh DESC, c.name LIMIT 3`],
  ["W543 suppliers at region max", `SELECT s.name FROM suppliers s WHERE s.rating = (SELECT MAX(s2.rating) FROM suppliers s2 WHERE s2.region = s.region)`],
  ["W544 open>paid customers", `SELECT COUNT(*) n FROM customers c WHERE (SELECT COUNT(*) FROM invoices i WHERE i.customer_id = c.id AND i.status = 'open') > (SELECT COUNT(*) FROM invoices i2 WHERE i2.customer_id = c.id AND i2.status = 'paid')`],
  ["W545 order-just-below-own-max", `SELECT COUNT(*) n FROM orders o WHERE o.total = (SELECT MAX(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id AND o2.total < (SELECT MAX(o3.total) FROM orders o3 WHERE o3.customer_id = o.customer_id))`],
  ["W546 region-max customers", `SELECT c.name, (SELECT MAX(o.total) FROM orders o JOIN customers c2 ON c2.id = o.customer_id WHERE c2.region = c.region) region_top FROM customers c WHERE c.id IN (SELECT customer_id FROM orders WHERE total > 1000) ORDER BY region_top DESC LIMIT 4`],
  ["W547 lines-per-order correlated stamp", `SELECT p.name, (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) lines FROM products p WHERE p.category = 'Audio' ORDER BY lines DESC`],
  ["W548 expenses vs own-category avg", `SELECT COUNT(*) n FROM expenses e WHERE e.amount_cents > (SELECT AVG(e2.amount_cents) FROM expenses e2 WHERE e2.category = e.category)`],
  ["W549 shipped-total top stamp", `SELECT c.name, (SELECT ROUND(SUM(o.total),2) FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped') sh FROM customers c ORDER BY sh DESC LIMIT 1`],
  ["W550 invoices at own-customer avg", `SELECT COUNT(*) n FROM invoices i WHERE i.amount_cents = (SELECT AVG(i2.amount_cents) FROM invoices i2 WHERE i2.customer_id = i.customer_id)`],
];

let i = 0;
for (const [label, sql] of probes) {
  i++;
  try {
    const rows = db.query(sql).all();
    console.log(`${label}: ${JSON.stringify(rows)}`);
  } catch (e) {
    console.log(`${label}: ERROR ${e instanceof Error ? e.message : String(e)}`);
  }
}
console.log(`--- ${probes.length} probes done`);
db.close();
