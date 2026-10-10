/// <reference types="bun-types" />
/** Wave-2 facts round 3 — hard-tier shapes + decoy-safety verifications. */
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
let n = 0;
function q(label: string, sql: string) {
  n++;
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const flat = rows.length <= 14 ? JSON.stringify(rows) : `(${rows.length} rows)`;
    console.log(`R${String(n).padStart(2, "0")} ${label}: ${flat}`);
  } catch (e) {
    console.log(`R${String(n).padStart(2, "0")} ${label}: ERROR ${(e as Error).message}`);
  }
}

q("A no-audio orders", `SELECT COUNT(*) c FROM orders WHERE id NOT IN
  (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category = 'Audio'))`);
q("B active never-invoiced", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM customers
  WHERE active = 1 AND id NOT IN (SELECT customer_id FROM invoices)`);
q("C EU-supplier orders", `SELECT COUNT(*) c FROM orders WHERE id IN (SELECT order_id FROM order_items
  WHERE product_id IN (SELECT id FROM products WHERE supplier_id IN (SELECT id FROM suppliers WHERE region = 'EU')))`);
q("D headset AND webcam", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE name = 'Noise-Canceling Headset'))
  AND id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE name = '4K Webcam Pro'))`);
q("E expenses on US-order days", `SELECT COUNT(*) c FROM expenses WHERE spent_on IN
  (SELECT created_at FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'US'))`);
q("F >=3-invoice names", `SELECT GROUP_CONCAT(name) names FROM customers WHERE id IN
  (SELECT customer_id FROM invoices GROUP BY customer_id HAVING COUNT(*) >= 3)`);
q("G vendor sums", "SELECT vendor, ROUND(SUM(amount_cents)/100.0,2) s, COUNT(*) n FROM expenses GROUP BY vendor ORDER BY s DESC");
q("H APAC payments by method", `SELECT method, COUNT(*) c FROM payments WHERE invoice_id IN
  (SELECT id FROM invoices WHERE customer_id IN (SELECT id FROM customers WHERE region = 'APAC')) GROUP BY method`);
q("I payments on >=3-inv custs", `SELECT COUNT(*) c, ROUND(SUM(amount_cents)/100.0,2) s FROM payments WHERE invoice_id IN
  (SELECT id FROM invoices WHERE customer_id IN (SELECT customer_id FROM invoices GROUP BY customer_id HAVING COUNT(*) >= 3))`);
q("J products per supplier 2/3/6", `SELECT
  (SELECT COUNT(*) FROM products WHERE supplier_id = 2) s2,
  (SELECT COUNT(*) FROM products WHERE supplier_id = 3) s3,
  (SELECT COUNT(*) FROM products WHERE supplier_id = 6) s6`);
q("K ledger >3M decoy", `SELECT COUNT(*) c FROM ledger_entries WHERE account IN
  (SELECT account FROM ledger_entries GROUP BY account HAVING SUM(debit_cents) > 3000000)`);
q("L stock>20 count", "SELECT COUNT(*) c FROM products WHERE stock > 20");
q("M suppliers >50", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM suppliers
  WHERE id IN (SELECT supplier_id FROM products WHERE price > 50)`);
q("N expenses on cust-created days", `SELECT COUNT(*) c FROM expenses WHERE spent_on IN
  (SELECT created_at FROM customers)`);
q("O distinct paid invoices", "SELECT COUNT(DISTINCT invoice_id) c FROM payments");
q("P card on APAC", `SELECT COUNT(*) c FROM payments WHERE method = 'card' AND invoice_id IN
  (SELECT id FROM invoices WHERE customer_id IN (SELECT id FROM customers WHERE region = 'APAC'))`);
q("Q orders >1000", "SELECT COUNT(*) c FROM orders WHERE total > 1000");
q("R LATAM distinct prods", `SELECT COUNT(DISTINCT product_id) c FROM order_items WHERE order_id IN
  (SELECT id FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'LATAM'))`);
q("S invoices of 10+-order custs", `SELECT COUNT(*) c, ROUND(SUM(amount_cents)/100.0,2) s FROM invoices
  WHERE customer_id IN (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 10)`);
q("T paid US verify", `SELECT COUNT(*) c FROM invoices WHERE status = 'paid' AND customer_id IN
  (SELECT id FROM customers WHERE region = 'US')`);
q("U expenses on APAC-order days", `SELECT COUNT(*) c FROM expenses WHERE spent_on IN
  (SELECT created_at FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'APAC'))`);
q("W suppliers >149", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM suppliers
  WHERE id IN (SELECT supplier_id FROM products WHERE price > 149)`);
q("X invoices >300k of EU", `SELECT COUNT(*) c FROM invoices WHERE amount_cents > 300000 AND customer_id IN
  (SELECT id FROM customers WHERE region = 'EU')`);
q("Y orders w/ wearables by name", `SELECT COUNT(*) c FROM orders WHERE id IN (SELECT order_id FROM order_items
  WHERE product_id IN (SELECT id FROM products WHERE category = 'Wearables'))`);
q("Z EU 2025 pending-ish", `SELECT COUNT(*) c FROM orders WHERE created_at >= '2025-01-01' AND customer_id IN
  (SELECT id FROM customers WHERE region = 'US')`);
q("AA wire invoices >300k", `SELECT COUNT(*) c FROM payments WHERE method = 'wire' AND invoice_id IN
  (SELECT id FROM invoices WHERE amount_cents > 300000)`);
q("AB shipped inactive", `SELECT COUNT(*) c FROM orders WHERE status = 'shipped' AND customer_id IN
  (SELECT id FROM customers WHERE active = 0)`);
q("AC delivered inactive", `SELECT COUNT(*) c FROM orders WHERE status = 'delivered' AND customer_id IN
  (SELECT id FROM customers WHERE active = 0)`);
q("AD US shipped", `SELECT COUNT(*) c FROM orders WHERE status = 'shipped' AND customer_id IN
  (SELECT id FROM customers WHERE region = 'US')`);
q("AE APAC shipped", `SELECT COUNT(*) c FROM orders WHERE status = 'shipped' AND customer_id IN
  (SELECT id FROM customers WHERE region = 'APAC')`);
q("AF APAC pending", `SELECT COUNT(*) c FROM orders WHERE status = 'pending' AND customer_id IN
  (SELECT id FROM customers WHERE region = 'APAC')`);
q("AG cancelled EU", `SELECT COUNT(*) c FROM orders WHERE status = 'cancelled' AND customer_id IN
  (SELECT id FROM customers WHERE region = 'EU')`);
q("AH cancel APAC/US/LATAM", `SELECT
  (SELECT COUNT(*) FROM orders WHERE status='cancelled' AND customer_id IN (SELECT id FROM customers WHERE region='APAC')) apac,
  (SELECT COUNT(*) FROM orders WHERE status='cancelled' AND customer_id IN (SELECT id FROM customers WHERE region='US')) us,
  (SELECT COUNT(*) FROM orders WHERE status='cancelled' AND customer_id IN (SELECT id FROM customers WHERE region='LATAM')) latam`);
q("AI US pending", `SELECT COUNT(*) c FROM orders WHERE status = 'pending' AND customer_id IN
  (SELECT id FROM customers WHERE region = 'US')`);
q("AJ LATAM pending/shipped/delivered", `SELECT
  (SELECT COUNT(*) FROM orders WHERE status='pending' AND customer_id IN (SELECT id FROM customers WHERE region='LATAM')) pend,
  (SELECT COUNT(*) FROM orders WHERE status='shipped' AND customer_id IN (SELECT id FROM customers WHERE region='LATAM')) ship,
  (SELECT COUNT(*) FROM orders WHERE status='delivered' AND customer_id IN (SELECT id FROM customers WHERE region='LATAM')) delv`);
db.close();
console.log(`\n${n} probes done`);
