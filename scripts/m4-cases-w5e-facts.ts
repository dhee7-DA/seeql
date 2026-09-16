/// <reference types="bun-types" />
/**
 * Wave-5 supplement e: distractor-safety closure for cs-1101..1150.
 * Run: bun scripts/m4-cases-w5e-facts.ts 2>&1 | tee scripts/m4-cases-w5e-out.txt
 */
import { Database } from "bun:sqlite";

const db = new Database("db/custom.db", { readonly: true });

const probes: Array<[string, string]> = [
  ["Y01 delivered-club EU", `SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status='delivered') AND region='EU'`],
  ["Y02 shipped-club APAC", `SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status='shipped') AND region='APAC'`],
  ["Y03 paid-invoice-club EU", `SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM invoices WHERE status='paid') AND region='EU'`],
  ["Y04 void holder regions", `SELECT c.region, COUNT(*) n FROM customers c WHERE c.id IN (SELECT customer_id FROM invoices WHERE status='void') GROUP BY c.region`],
  ["Y05 Accessories+Audio baskets", `SELECT COUNT(DISTINCT order_id) n FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category IN ('Accessories','Audio'))`],
  ["Y06 Fitness+Video baskets", `SELECT COUNT(DISTINCT order_id) n FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category IN ('Fitness','Video'))`],
  ["Y07 Accessories+Video baskets", `SELECT COUNT(DISTINCT order_id) n FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category IN ('Accessories','Video'))`],
  ["Y08 open-club orders", `SELECT COUNT(*) n FROM orders WHERE customer_id IN (SELECT customer_id FROM invoices WHERE status='open')`],
  ["Y09 suppliers columns", `SELECT name FROM pragma_table_info('suppliers')`],
  ["Y10 expense vendor sums", `SELECT vendor, SUM(amount_cents) s, COUNT(*) n FROM expenses GROUP BY vendor ORDER BY s DESC`],
  ["Y11 vendors any expense >100000", `SELECT COUNT(DISTINCT vendor) n FROM expenses WHERE amount_cents > 100000`],
  ["Y12 fitness-never-wearables", `SELECT COUNT(*) n FROM customers WHERE id IN (
    SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category='Fitness')))
    AND id NOT IN (
    SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category='Wearables')))`],
  ["Y13 audio-never-apparel", `SELECT COUNT(*) n FROM customers WHERE id IN (
    SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category='Audio')))
    AND id NOT IN (
    SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category='Apparel')))`],
  ["Y14 fitness-never-apparel", `SELECT COUNT(*) n FROM customers WHERE id IN (
    SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category='Fitness')))
    AND id NOT IN (
    SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category='Apparel')))`],
  ["Y15 apparel-never-wearables", `SELECT COUNT(*) n FROM customers WHERE id IN (
    SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category='Apparel')))
    AND id NOT IN (
    SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category='Wearables')))`],
  ["Y16 invoice at overall avg", `SELECT COUNT(*) n FROM invoices WHERE amount_cents = (SELECT AVG(amount_cents) FROM invoices)`],
  ["Y17 expense min", `SELECT MIN(amount_cents) m FROM expenses`],
  ["Y18 expenses > max/2", `SELECT COUNT(*) n FROM expenses WHERE amount_cents > (SELECT MAX(amount_cents)/2 FROM expenses)`],
  ["Y19 expenses > avg/4", `SELECT COUNT(*) n FROM expenses WHERE amount_cents > (SELECT AVG(amount_cents)/4 FROM expenses)`],
  ["Y20 min product price", `SELECT MIN(price) m FROM products`],
  ["Y21 band .8-1.1", `SELECT COUNT(*) n FROM orders WHERE total BETWEEN (SELECT AVG(total)*0.8 FROM orders) AND (SELECT AVG(total)*1.1 FROM orders)`],
  ["Y22 band .9-1.2", `SELECT COUNT(*) n FROM orders WHERE total BETWEEN (SELECT AVG(total)*0.9 FROM orders) AND (SELECT AVG(total)*1.2 FROM orders)`],
  ["Y23 orders < shipped avg", `SELECT COUNT(*) n FROM orders WHERE total < (SELECT AVG(total) FROM orders WHERE status='shipped')`],
  ["Y24 orders < pending avg", `SELECT COUNT(*) n FROM orders WHERE total < (SELECT AVG(total) FROM orders WHERE status='pending')`],
  ["Y25 orders < cancelled avg", `SELECT COUNT(*) n FROM orders WHERE total < (SELECT AVG(total) FROM orders WHERE status='cancelled')`],
  ["Y26 shipped share pct", `SELECT ROUND((SELECT SUM(total) FROM orders WHERE status='shipped')/(SELECT SUM(total) FROM orders)*100,1) p`],
  ["Y27 pending share pct", `SELECT ROUND((SELECT SUM(total) FROM orders WHERE status='pending')/(SELECT SUM(total) FROM orders)*100,1) p`],
  ["Y28 payments avg spread", `SELECT ROUND((SELECT AVG(amount_cents)/100.0 FROM payments)-(SELECT AVG(total) FROM orders),2) v`],
  ["Y29 pending orders > shipped avg", `SELECT COUNT(*) n FROM orders WHERE status='pending' AND total > (SELECT AVG(total) FROM orders WHERE status='shipped')`],
  ["Y30 delivered > cancelled avg", `SELECT COUNT(*) n FROM orders WHERE status='delivered' AND total > (SELECT AVG(total) FROM orders WHERE status='cancelled')`],
  ["Y31 paid non-EU", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id=c.id AND i.status='paid') AND c.region != 'EU'`],
  ["Y32 open non-US", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id=c.id AND i.status='open') AND c.region != 'US'`],
  ["Y33 no-open non-EU", `SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id=c.id AND i.status='open') AND c.region != 'EU'`],
  ["Y34 invoices > 600 euros", `SELECT COUNT(*) n FROM invoices WHERE amount_cents > 60000`],
  ["Y35 cancelled+delivered customers", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.status='cancelled') AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id=c.id AND o2.status='delivered')`],
  ["Y36 shipped+delivered customers", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.status='shipped') AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id=c.id AND o2.status='delivered')`],
  ["Y37 pending+shipped customers", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.status='pending') AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id=c.id AND o2.status='shipped')`],
  ["Y38 void+open customers", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id=c.id AND i.status='void') AND EXISTS (SELECT 1 FROM invoices i2 WHERE i2.customer_id=c.id AND i2.status='open')`],
  ["Y39 paid-club customers", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id=c.id AND i.status='paid')`],
  ["Y40 paid AND no-open", `SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id=c.id AND i.status='open') AND EXISTS (SELECT 1 FROM invoices i2 WHERE i2.customer_id=c.id AND i2.status='paid')`],
  ["Y41 Electronics EU", `SELECT COUNT(*) n FROM customers c WHERE c.region='EU' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category='Electronics')))`],
  ["Y42 Wearables APAC", `SELECT COUNT(*) n FROM customers c WHERE c.region='APAC' AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category='Wearables')))`],
  ["Y43 never-video", `SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category='Video')))`],
  ["Y44 own-avg 1x", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.total > 1*(SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id=c.id))`],
  ["Y45 own-avg 3x", `SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.total > 3*(SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id=c.id))`],
  ["Y46 no-void AND paid", `SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id=c.id AND i.status='void') AND EXISTS (SELECT 1 FROM invoices i2 WHERE i2.customer_id=c.id AND i2.status='paid')`],
  ["Y47 no-open AND void", `SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id=c.id AND i.status='open') AND EXISTS (SELECT 1 FROM invoices i2 WHERE i2.customer_id=c.id AND i2.status='void')`],
  ["Y48 product 2 lines", `SELECT name, (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id=p.id) lines FROM products p WHERE p.id=2`],
  ["Y49 top delivered stamp", `SELECT c.name, (SELECT ROUND(SUM(o.total),2) FROM orders o WHERE o.customer_id=c.id AND o.status='delivered') sh FROM customers c ORDER BY sh DESC LIMIT 1`],
  ["Y50 top pending stamp", `SELECT c.name, (SELECT ROUND(SUM(o.total),2) FROM orders o WHERE o.customer_id=c.id AND o.status='pending') sh FROM customers c ORDER BY sh DESC LIMIT 1`],
  ["Y51 expense categories", `SELECT category, COUNT(*) n FROM expenses GROUP BY category`],
  ["Y52 vendors of Fitness+Tools", `SELECT COUNT(DISTINCT vendor) n FROM expenses WHERE category IN ('Fitness','Tools')`],
  ["Y53 > own-category-min", `SELECT COUNT(*) n FROM expenses e WHERE e.amount_cents > (SELECT MIN(e2.amount_cents) FROM expenses e2 WHERE e2.category=e.category)`],
  ["Y54 p2.sup=p.id rows", `SELECT COUNT(*) n FROM products p WHERE p.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.supplier_id=p.id)`],
  ["Y55 p2.sup=p.price rows", `SELECT COUNT(*) n FROM products p WHERE p.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.supplier_id=p.price)`],
  ["Y56 top3 delivered stamps", `SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id=c.id AND o.status='delivered') d FROM customers c ORDER BY d DESC, c.name LIMIT 3`],
  ["Y57 top3 pending stamps", `SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id=c.id AND o.status='pending') d FROM customers c ORDER BY d DESC, c.name LIMIT 3`],
  ["Y58 paid>open", `SELECT COUNT(*) n FROM customers c WHERE (SELECT COUNT(*) FROM invoices i WHERE i.customer_id=c.id AND i.status='paid') > (SELECT COUNT(*) FROM invoices i2 WHERE i2.customer_id=c.id AND i2.status='open')`],
  ["Y59 open>void", `SELECT COUNT(*) n FROM customers c WHERE (SELECT COUNT(*) FROM invoices i WHERE i.customer_id=c.id AND i.status='open') > (SELECT COUNT(*) FROM invoices i2 WHERE i2.customer_id=c.id AND i2.status='void')`],
  ["Y60 void>paid", `SELECT COUNT(*) n FROM customers c WHERE (SELECT COUNT(*) FROM invoices i WHERE i.customer_id=c.id AND i.status='void') > (SELECT COUNT(*) FROM invoices i2 WHERE i2.customer_id=c.id AND i2.status='paid')`],
  ["Y61 s2.region=s.id rows", `SELECT s.name FROM suppliers s WHERE s.rating=(SELECT MAX(s2.rating) FROM suppliers s2 WHERE s2.region=s.id)`],
  ["Y62 s2.region=s.name rows", `SELECT s.name FROM suppliers s WHERE s.rating=(SELECT MAX(s2.rating) FROM suppliers s2 WHERE s2.region=s.name)`],
  ["Y63 Video stamps", `SELECT p.name, (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id=p.id) lines FROM products p WHERE p.category='Video' ORDER BY lines DESC, p.name`],
  ["Y64 Fitness stamps", `SELECT p.name, (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id=p.id) lines FROM products p WHERE p.category='Fitness' ORDER BY lines DESC, p.name`],
  ["Y65 runner-up MIN inner", `SELECT COUNT(*) n FROM orders o WHERE o.total=(SELECT MAX(o2.total) FROM orders o2 WHERE o2.customer_id=o.customer_id AND o2.total < (SELECT MIN(o3.total) FROM orders o3 WHERE o3.customer_id=o.customer_id))`],
  ["Y66 runner-up AVG inner", `SELECT COUNT(*) n FROM orders o WHERE o.total=(SELECT MAX(o2.total) FROM orders o2 WHERE o2.customer_id=o.customer_id AND o2.total < (SELECT AVG(o3.total) FROM orders o3 WHERE o3.customer_id=o.customer_id))`],
  ["Y67 invoice = own max", `SELECT COUNT(*) n FROM invoices i WHERE i.amount_cents=(SELECT MAX(i2.amount_cents) FROM invoices i2 WHERE i2.customer_id=i.customer_id)`],
  ["Y68 invoice = own min", `SELECT COUNT(*) n FROM invoices i WHERE i.amount_cents=(SELECT MIN(i2.amount_cents) FROM invoices i2 WHERE i2.customer_id=i.customer_id)`],
  ["Y69 invoice = own count", `SELECT COUNT(*) n FROM invoices i WHERE i.amount_cents=(SELECT COUNT(i2.amount_cents) FROM invoices i2 WHERE i2.customer_id=i.customer_id)`],
  ["Y70 invoice own-key=id rows", `SELECT COUNT(*) n FROM invoices i WHERE i.amount_cents=(SELECT AVG(i2.amount_cents) FROM invoices i2 WHERE i2.customer_id=i.id)`],
  ["Y71 expense vendors count", `SELECT COUNT(DISTINCT vendor) n FROM expenses`],
  ["Y72 vendors of Ads", `SELECT DISTINCT vendor FROM expenses WHERE category='Ads'`],
  ["Y73 vendor avg > 100000", `SELECT COUNT(*) n FROM (SELECT vendor FROM expenses GROUP BY vendor HAVING AVG(amount_cents) > 100000)`],
  ["Y74 pending avg", `SELECT ROUND(AVG(total),2) v FROM orders WHERE status='pending'`],
  ["Y75 cancelled avg", `SELECT ROUND(AVG(total),2) v FROM orders WHERE status='cancelled'`],
  ["Y76 min order total", `SELECT MIN(total) m FROM orders`],
  ["Y77 shipped club total", `SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status='shipped')`],
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
