/// <reference types="bun-types" />
/** Wave-2 facts round 2 — names, multi-level shapes, decoy-safety counts. */
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
let n = 0;
function q(label: string, sql: string) {
  n++;
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const flat = rows.length <= 14 ? JSON.stringify(rows) : `(${rows.length} rows)`;
    console.log(`Q${String(n).padStart(2, "0")} ${label}: ${flat}`);
  } catch (e) {
    console.log(`Q${String(n).padStart(2, "0")} ${label}: ERROR ${(e as Error).message}`);
  }
}

q("customer roster", "SELECT id, name, region, city, active FROM customers ORDER BY id");
q("orders w/ supplier1 prods", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN
    (SELECT id FROM products WHERE supplier_id = 1))`);
q("orders w/ electronics", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN
    (SELECT id FROM products WHERE category = 'Electronics'))`);
q("orders w/ video", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN
    (SELECT id FROM products WHERE category = 'Video'))`);
q("orders w/ wearables", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN
    (SELECT id FROM products WHERE category = 'Wearables'))`);
q("orders w/ apparel", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN
    (SELECT id FROM products WHERE category = 'Apparel'))`);
q("orders w/ accessories", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN
    (SELECT id FROM products WHERE category = 'Accessories'))`);
q("orders w/ fitness", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN
    (SELECT id FROM products WHERE category = 'Fitness'))`);
q("invoices of 5+-order custs", `SELECT COUNT(*) c, ROUND(SUM(amount_cents)/100.0,2) s FROM invoices
  WHERE customer_id IN (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 5)`);
q("5+-order custs", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM customers WHERE id IN
  (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 5)`);
q("wire on US inv", `SELECT COUNT(*) c FROM payments WHERE method = 'wire' AND invoice_id IN
  (SELECT id FROM invoices WHERE customer_id IN (SELECT id FROM customers WHERE region = 'US'))`);
q("paid APAC inv", `SELECT COUNT(*) c FROM invoices WHERE status = 'paid' AND customer_id IN
  (SELECT id FROM customers WHERE region = 'APAC')`);
q("APAC multi-invoice custs", `SELECT COUNT(*) c FROM customers WHERE id IN
  (SELECT customer_id FROM invoices GROUP BY customer_id HAVING COUNT(*) >= 2)
  AND id IN (SELECT id FROM customers WHERE region = 'APAC')`);
q("suppliers w/ pricey prods", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM suppliers
  WHERE id IN (SELECT supplier_id FROM products WHERE price > 100)`);
q("pricey prods", "SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM products WHERE price > 100");
q("EU cust multi-inv", `SELECT COUNT(*) c FROM customers WHERE region = 'EU' AND id IN
  (SELECT customer_id FROM invoices GROUP BY customer_id HAVING COUNT(*) >= 2)`);
q("ads on order days", `SELECT COUNT(*) c, ROUND(SUM(amount_cents)/100.0,2) s FROM expenses
  WHERE category = 'Ads' AND spent_on IN (SELECT created_at FROM orders)`);
q("rent days w/ orders", `SELECT COUNT(*) c FROM orders
  WHERE created_at IN (SELECT spent_on FROM expenses WHERE category = 'Rent')`);
q("ads days w/ orders", `SELECT COUNT(*) c FROM orders
  WHERE created_at IN (SELECT spent_on FROM expenses WHERE category = 'Ads')`);
q("tools on order days", `SELECT COUNT(*) c FROM expenses
  WHERE category = 'Tools' AND spent_on IN (SELECT created_at FROM orders)`);
q("travel on order days", `SELECT COUNT(*) c FROM expenses
  WHERE category = 'Travel' AND spent_on IN (SELECT created_at FROM orders)`);
q("distinct prods EU orders", `SELECT COUNT(DISTINCT product_id) c FROM order_items
  WHERE order_id IN (SELECT id FROM orders WHERE customer_id IN
    (SELECT id FROM customers WHERE region = 'EU'))`);
q("distinct prods US orders", `SELECT COUNT(DISTINCT product_id) c FROM order_items
  WHERE order_id IN (SELECT id FROM orders WHERE customer_id IN
    (SELECT id FROM customers WHERE region = 'US'))`);
q("EU custs w/ orders count", `SELECT COUNT(*) c FROM customers WHERE id IN
  (SELECT DISTINCT customer_id FROM orders) AND region = 'EU'`);
q("EU cust names w/ invoices", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM customers
  WHERE region = 'EU' AND id IN (SELECT customer_id FROM invoices)`);
q("delivered EU", `SELECT COUNT(*) c FROM orders WHERE status = 'delivered' AND customer_id IN
  (SELECT id FROM customers WHERE region = 'EU')`);
q("cancelled active", `SELECT COUNT(*) c FROM orders WHERE status = 'cancelled' AND customer_id IN
  (SELECT id FROM customers WHERE active = 1)`);
q("payments >= 2 on EU inv", `SELECT COUNT(*) c FROM payments WHERE invoice_id IN
  (SELECT id FROM invoices WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU'))
  AND invoice_id IN (SELECT id FROM invoices GROUP BY customer_id HAVING COUNT(*) >= 1)`);
q("void inv region", "SELECT i.number, c.region FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'void'");
q("open inv regions", `SELECT c.region, COUNT(*) c FROM invoices i JOIN customers c ON c.id = i.customer_id
  WHERE i.status = 'open' GROUP BY c.region`);
q("lead big entries", `SELECT COUNT(*) c, ROUND(SUM(debit_cents)/100.0,2) s FROM ledger_entries
  WHERE account IN (SELECT account FROM ledger_entries GROUP BY account HAVING SUM(debit_cents) > 500000)
  AND debit_cents > 400000`);
q("AR entries big", `SELECT COUNT(*) c FROM ledger_entries WHERE account = 'accounts_receivable' AND debit_cents > 400000`);
q("wire payments sum EU", `SELECT ROUND(SUM(amount_cents)/100.0,2) s FROM payments WHERE method = 'wire' AND invoice_id IN
  (SELECT id FROM invoices WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU'))`);
q("card payments sum EU", `SELECT ROUND(SUM(amount_cents)/100.0,2) s FROM payments WHERE method = 'card' AND invoice_id IN
  (SELECT id FROM invoices WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU'))`);
q("2024 active pending sum", `SELECT ROUND(SUM(total),2) s FROM orders WHERE status = 'pending' AND created_at < '2025-01-01'
  AND customer_id IN (SELECT id FROM customers WHERE active = 1)`);
q("2025 active pending", `SELECT COUNT(*) c, ROUND(SUM(total),2) s FROM orders WHERE status = 'pending' AND created_at >= '2025-01-01'
  AND customer_id IN (SELECT id FROM customers WHERE active = 1)`);
q("US names", "SELECT id, name FROM customers WHERE region = 'US'");
q("APAC names", "SELECT id, name FROM customers WHERE region = 'APAC'");
q("EU invoiceless overlap", `SELECT name FROM customers WHERE region = 'EU' AND id NOT IN (SELECT customer_id FROM invoices)`);
q("APAC orderless?", `SELECT COUNT(*) c FROM customers WHERE region = 'APAC' AND id NOT IN (SELECT customer_id FROM orders)`);
q("supplier pricey names", `SELECT DISTINCT s.name FROM suppliers s WHERE s.id IN
  (SELECT supplier_id FROM products WHERE price > 100)`);
q("supplier4 prods", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM products WHERE supplier_id = 4`);
q("supplier5 prods", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM products WHERE supplier_id = 5`);
q("orders w/ supplier5 prods", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE supplier_id = 5))`);
q("orders w/ supplier2 prods", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE supplier_id = 2))`);
q("orders w/ supplier3 prods", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE supplier_id = 3))`);
q("orders w/ supplier4 prods", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE supplier_id = 4))`);
q("orders w/ supplier6 prods", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE supplier_id = 6))`);
q("EU orders 2025 list", `SELECT id, total FROM orders WHERE created_at >= '2025-01-01'
  AND customer_id IN (SELECT id FROM customers WHERE region = 'EU') ORDER BY total DESC`);
q("inactive names", "SELECT id, name, region FROM customers WHERE active = 0");
q("invoices of inactive", `SELECT COUNT(*) c FROM invoices WHERE customer_id IN
  (SELECT id FROM customers WHERE active = 0)`);
q("payments of inactive", `SELECT COUNT(*) c FROM payments WHERE invoice_id IN
  (SELECT id FROM invoices WHERE customer_id IN (SELECT id FROM customers WHERE active = 0))`);
q("US delivered", `SELECT COUNT(*) c FROM orders WHERE status = 'delivered' AND customer_id IN
  (SELECT id FROM customers WHERE region = 'US')`);
q("EUR avg EU", "SELECT ROUND(AVG(total),2) a, COUNT(*) c FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU')");
q("US avg", "SELECT ROUND(AVG(total),2) a, COUNT(*) c FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'US')");
q("APAC avg", "SELECT ROUND(AVG(total),2) a, COUNT(*) c FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'APAC')");
q("order count cust 5-8", `SELECT customer_id, COUNT(*) c FROM orders WHERE customer_id IN (5,6,7,8) GROUP BY customer_id`);
db.close();
console.log(`\n${n} probes done`);
