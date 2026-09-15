/// <reference types="bun-types" />
/**
 * Wave-5 supplement d: walkthrough details, distractor-safety probes, gap angles.
 * Run: bun scripts/m4-cases-w5d-facts.ts 2>&1 | tee scripts/m4-cases-w5d-out.txt
 */
import { Database } from "bun:sqlite";

const db = new Database("db/custom.db", { readonly: true });

const probes: Array<[string, string]> = [
  // sanity / global flavor
  ["X01 customers + regions", `SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY n DESC`],
  ["X02 Berlin/Austin/Tokyo/Osaka city counts", `SELECT city, COUNT(*) n FROM customers WHERE city IN ('Berlin','Austin','Tokyo','Osaka','Seoul') GROUP BY city`],
  ["X03 store max order + status", `SELECT id, status, total, customer_id FROM orders ORDER BY total DESC LIMIT 3`],
  ["X04 order 51", `SELECT id, total, status, customer_id FROM orders WHERE id = 51`],
  // 1101 distractor safety: EU count, US count
  ["X05 EU customers", `SELECT COUNT(*) n FROM customers WHERE region IN ('EU')`],
  ["X06 US customers", `SELECT COUNT(*) n FROM customers WHERE region IN ('US')`],
  // 1102 distractor safety: add Osaka → ?
  ["X07 city IN +Osaka", `SELECT COUNT(*) n FROM customers WHERE city IN ('Berlin','Austin','Tokyo','Osaka')`],
  ["X08 city IN +Seoul", `SELECT COUNT(*) n FROM customers WHERE city IN ('Berlin','Austin','Tokyo','Seoul')`],
  // 1103 walkthrough: expense categories of the two vendors
  ["X09 Travel+Tools vendor rows", `SELECT vendor, category, amount_cents FROM expenses WHERE category IN ('Travel','Tools') ORDER BY vendor`],
  ["X10 all vendors count", `SELECT COUNT(DISTINCT vendor) n FROM expenses`],
  // 1112 exact-double distractor safety
  ["X11 double-match variants", `SELECT
    (SELECT COUNT(*) FROM orders WHERE total IN (SELECT total*2 FROM orders WHERE id=51)) d2,
    (SELECT COUNT(*) FROM orders WHERE total IN (SELECT total*3 FROM orders WHERE id=51)) d3,
    (SELECT COUNT(*) FROM orders WHERE total IN (SELECT total/2 FROM orders WHERE id=51)) dh,
    (SELECT COUNT(*) FROM orders WHERE total IN (SELECT SUM(total) FROM orders WHERE id=51)) ds,
    (SELECT COUNT(*) FROM orders WHERE total IN (SELECT total*2 FROM orders WHERE id=52)) o52`],
  // 1113 cross-domain IN distractor safety
  ["X12 expense cents in orders totals", `SELECT COUNT(*) n FROM expenses WHERE amount_cents IN (SELECT total FROM orders)`],
  ["X13 expense cents in payment cents", `SELECT COUNT(*) n FROM expenses WHERE amount_cents IN (SELECT amount_cents FROM payments)`],
  ["X14 payments table columns", `SELECT name FROM pragma_table_info('payments')`],
  // 1114 audio-never-wearables names
  ["X15 audio club members", `SELECT DISTINCT c.name FROM customers c WHERE c.id IN (
    SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (
      SELECT id FROM products WHERE category = 'Audio'))) ORDER BY c.name`],
  ["X16 wearables club members", `SELECT DISTINCT c.name FROM customers c WHERE c.id IN (
    SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (
      SELECT id FROM products WHERE category = 'Wearables'))) ORDER BY c.name`],
  // 1115 big-expense flavor: the >1500 rows
  ["X17 expenses above 1500", `SELECT vendor, category, amount_cents FROM expenses WHERE amount_cents > 150000 ORDER BY amount_cents DESC`],
  // q2 gap angles
  ["X18 delivered orders beating shipped avg", `SELECT COUNT(*) n FROM orders WHERE status = 'delivered' AND total > (SELECT AVG(total) FROM orders WHERE status = 'shipped')`],
  ["X19 shipped avg", `SELECT ROUND(AVG(total),2) v FROM orders WHERE status = 'shipped'`],
  ["X20 delivered avg", `SELECT ROUND(AVG(total),2) v FROM orders WHERE status = 'delivered'`],
  ["X21 invoice status avgs", `SELECT status, ROUND(AVG(amount_cents)/100.0,2) a, COUNT(*) n FROM invoices GROUP BY status ORDER BY a DESC`],
  ["X22 overall invoice avg", `SELECT ROUND(AVG(amount_cents)/100.0,2) v FROM invoices`],
  ["X23 overall order avg + min", `SELECT ROUND(AVG(total),2) a, ROUND(MIN(total),2) m FROM orders`],
  ["X24 statuses above store avg", `SELECT status, ROUND(AVG(amount_cents)/100.0,2) a FROM invoices GROUP BY status HAVING AVG(amount_cents) > (SELECT AVG(amount_cents) FROM invoices) ORDER BY a DESC`],
  ["X25 avg invoice vs avg order raw", `SELECT ROUND(AVG(amount_cents)/100.0,2) inv, (SELECT ROUND(AVG(total),2) FROM orders) ord FROM invoices`],
  ["X26 max supplier rating + who", `SELECT name, rating FROM suppliers WHERE rating = (SELECT MAX(rating) FROM suppliers)`],
  ["X27 rating spread", `SELECT name, rating, region FROM suppliers ORDER BY rating DESC`],
  ["X28 cheapest above-avg products", `SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products) ORDER BY price ASC LIMIT 3`],
  ["X29 avg product price", `SELECT ROUND(AVG(price),2) v FROM products`],
  ["X30 expense avg + half-bar count check", `SELECT ROUND(AVG(amount_cents)/100.0,2) a, (SELECT COUNT(*) FROM expenses WHERE amount_cents > (SELECT AVG(amount_cents)/2 FROM expenses)) n FROM expenses`],
  // q3 gap angle: clean-paper (no open invoice), and no-open+paid
  ["X31 no-open-invoice customers", `SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status = 'open')`],
  ["X32 no-open AND paid customers", `SELECT COUNT(*) n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status = 'open') AND EXISTS (SELECT 1 FROM invoices i2 WHERE i2.customer_id = c.id AND i2.status = 'paid')`],
  ["X33 no-open AND paid names", `SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status = 'open') AND EXISTS (SELECT 1 FROM invoices i2 WHERE i2.customer_id = c.id AND i2.status = 'paid') ORDER BY c.name`],
  // walkthrough detail for EXISTS receipts
  ["X34 big-invoice >6000 who", `SELECT i.number, i.amount_cents/100.0 v, c.name FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.amount_cents > 600000`],
  ["X35 never-apparel names", `SELECT c.name FROM customers c WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category = 'Apparel'))) ORDER BY c.name`],
  ["X36 Electronics+APAC names", `SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category = 'Electronics')) AND c.region = 'APAC') ORDER BY c.name`],
  ["X37 own-avg-bar 7 names", `SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.total > 2 * (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = c.id)) ORDER BY c.name`],
  ["X38 cancelled>500 check", `SELECT COUNT(*) n FROM orders WHERE status = 'cancelled' AND total > 500`],
  ["X39 cancelled rows", `SELECT id, total FROM orders WHERE status = 'cancelled'`],
  ["X40 open non-EU who", `SELECT c.name, c.region FROM customers c WHERE EXISTS (SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status = 'open') AND c.region != 'EU'`],
  // q4 walkthrough detail
  ["X41 W539 above-supplier-avg list", `SELECT p.name, p.price, p.supplier_id FROM products p WHERE p.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.supplier_id = p.supplier_id) ORDER BY p.supplier_id, p.price DESC`],
  ["X42 supplier avgs", `SELECT s.name, ROUND(AVG(p.price),2) sup_avg, COUNT(*) n FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY p.supplier_id ORDER BY s.name`],
  ["X43 W543 region-max detail", `SELECT s.name, s.rating, s.region FROM suppliers s WHERE s.rating = (SELECT MAX(s2.rating) FROM suppliers s2 WHERE s2.region = s.region) ORDER BY s.region`],
  ["X44 W544 open>paid names", `SELECT c.name FROM customers c WHERE (SELECT COUNT(*) FROM invoices i WHERE i.customer_id = c.id AND i.status = 'open') > (SELECT COUNT(*) FROM invoices i2 WHERE i2.customer_id = c.id AND i2.status = 'paid') ORDER BY c.name`],
  ["X45 W545 runner-up sample", `SELECT o.id, o.customer_id, o.total FROM orders o WHERE o.total = (SELECT MAX(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id AND o2.total < (SELECT MAX(o3.total) FROM orders o3 WHERE o3.customer_id = o.customer_id)) ORDER BY o.customer_id LIMIT 6`],
  ["X46 W550 which invoices", `SELECT i.number, i.customer_id, i.amount_cents, (SELECT AVG(i2.amount_cents) FROM invoices i2 WHERE i2.customer_id = i.customer_id) cavg FROM invoices i WHERE i.amount_cents = (SELECT AVG(i2.amount_cents) FROM invoices i2 WHERE i2.customer_id = i.customer_id)`],
  ["X47 W542 next after Maya", `SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped') sh FROM customers c ORDER BY sh DESC, c.name LIMIT 5`],
  ["X48 W541 bottom3 check", `SELECT c.name, (SELECT MIN(o.created_at) FROM orders o WHERE o.customer_id = c.id) first_order FROM customers c ORDER BY first_order ASC, c.name LIMIT 4`],
  ["X49 W527 K1 lines", `SELECT p.name, (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) lines FROM products p WHERE p.id = 1`],
  ["X50 Audio line stamps full", `SELECT p.name, (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) lines FROM products p WHERE p.category = 'Audio' ORDER BY lines DESC, p.name`],
  // 1110 flavor: suppliers per region
  ["X51 suppliers by region", `SELECT region, COUNT(*) n, GROUP_CONCAT(name) names FROM suppliers GROUP BY region`],
  ["X52 customers in Berlin", `SELECT name, region FROM customers WHERE city = 'Berlin'`],
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
