/// <reference types="bun-types" />
/**
 * Wave-2 facts (q2 — IN subqueries, cs-951–1000).
 * Every figure cited in cases-q2.ts must come out of this run.
 */
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
let n = 0;
function q(label: string, sql: string) {
  n++;
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const flat = rows.length <= 12 ? JSON.stringify(rows) : `(${rows.length} rows)`;
    console.log(`P${String(n).padStart(2, "0")} ${label}: ${flat}`);
  } catch (e) {
    console.log(`P${String(n).padStart(2, "0")} ${label}: ERROR ${(e as Error).message}`);
  }
}

// ---- 0. shape census -------------------------------------------------------
q("null fk census", `SELECT
  (SELECT COUNT(*) FROM orders WHERE customer_id IS NULL) ord_cust,
  (SELECT COUNT(*) FROM order_items WHERE order_id IS NULL) oi_ord,
  (SELECT COUNT(*) FROM order_items WHERE product_id IS NULL) oi_prod,
  (SELECT COUNT(*) FROM invoices WHERE customer_id IS NULL) inv_cust,
  (SELECT COUNT(*) FROM payments WHERE invoice_id IS NULL) pay_inv,
  (SELECT COUNT(*) FROM products WHERE supplier_id IS NULL) prod_sup`);
q("created_at sample", "SELECT id, created_at, status FROM orders ORDER BY id LIMIT 3");
q("active census", "SELECT active, COUNT(*) c, GROUP_CONCAT(id) ids FROM customers GROUP BY active");
q("regions", "SELECT region, COUNT(*) c, GROUP_CONCAT(id) ids FROM customers GROUP BY region ORDER BY region");
q("cities", "SELECT COUNT(*) cities, COUNT(DISTINCT city) uniq FROM customers");
q("order status", "SELECT status, COUNT(*) c FROM orders GROUP BY status");
q("invoice status", "SELECT status, COUNT(*) c FROM invoices GROUP BY status");
q("product cats", "SELECT category, COUNT(*) c FROM products GROUP BY category");
q("suppliers", "SELECT id, name, region, rating FROM suppliers ORDER BY id");
q("vendor list", "SELECT DISTINCT vendor FROM expenses ORDER BY vendor");
q("expense cats", "SELECT category, COUNT(*) c FROM expenses GROUP BY category ORDER BY category");
q("ledger accounts", "SELECT account, COUNT(*) c FROM ledger_entries GROUP BY account ORDER BY account");

// ---- 1. orders IN customer sets --------------------------------------------
q("EU orders", "SELECT COUNT(*) c FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU')");
q("US orders", "SELECT COUNT(*) c FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'US')");
q("APAC orders", "SELECT COUNT(*) c FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'APAC')");
q("LATAM orders", "SELECT COUNT(*) c FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'LATAM')");
q("active orders", "SELECT COUNT(*) c FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE active = 1)");
q("inactive orders", "SELECT COUNT(*) c FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE active = 0)");
q("EU order sum", "SELECT ROUND(SUM(total),2) s, ROUND(AVG(total),2) a FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU')");
q("active-pending", "SELECT COUNT(*) c, ROUND(SUM(total),2) s FROM orders WHERE status = 'pending' AND customer_id IN (SELECT id FROM customers WHERE active = 1)");
q("EU pending", "SELECT COUNT(*) c FROM orders WHERE status = 'pending' AND customer_id IN (SELECT id FROM customers WHERE region = 'EU')");
q("US big orders", "SELECT COUNT(*) c FROM orders WHERE total > 500 AND customer_id IN (SELECT id FROM customers WHERE region = 'US')");
q("EU names top3", `SELECT o.id, o.total FROM orders o WHERE o.customer_id IN
  (SELECT id FROM customers WHERE region = 'EU') ORDER BY o.total DESC LIMIT 3`);
q("active count", "SELECT COUNT(*) c FROM customers WHERE active = 1");

// ---- 2. NOT IN (null-safe columns only) ------------------------------------
q("never-sold products", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM products
  WHERE id NOT IN (SELECT product_id FROM order_items)`);
q("never-ordered customers", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM customers
  WHERE id NOT IN (SELECT customer_id FROM orders)`);
q("products never ordered qty>=2", `SELECT COUNT(*) c FROM products
  WHERE id NOT IN (SELECT product_id FROM order_items WHERE quantity >= 2)`);
q("customers w/o invoice", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM customers
  WHERE id NOT IN (SELECT customer_id FROM invoices)`);
q("NOT IN landmine demo", `SELECT COUNT(*) c_all, (SELECT COUNT(*) FROM invoices WHERE customer_id IS NULL) inv_nulls FROM customers
  WHERE id NOT IN (SELECT customer_id FROM invoices)`);

// ---- 3. products / order_items ---------------------------------------------
q("distinct sold products", "SELECT COUNT(DISTINCT product_id) c FROM order_items");
q("products with qty>=3 lines", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM products
  WHERE id IN (SELECT product_id FROM order_items WHERE quantity >= 3)`);
q("qty>=3 max", "SELECT MAX(quantity) mx FROM order_items");
q("sold above 100", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM products
  WHERE price > 100 AND id IN (SELECT product_id FROM order_items)`);
q("supplier1 products", "SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM products WHERE supplier_id = 1");
q("supplier1 sold", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM products
  WHERE supplier_id = 1 AND id IN (SELECT product_id FROM order_items)`);
q("orders w/ prod 7", "SELECT COUNT(DISTINCT order_id) c FROM order_items WHERE product_id = 7");
q("orders w/ prod 7 in list", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id = 7)`);
q("orders w/ headset", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE name LIKE '%Headset%'))`);
q("product 7 name", "SELECT id, name, price, stock, supplier_id FROM products WHERE id IN (5,7,9)");
q("shipped EU", "SELECT COUNT(*) c FROM orders WHERE status = 'shipped' AND customer_id IN (SELECT id FROM customers WHERE region = 'EU')");
q("EU shipped sum", "SELECT ROUND(SUM(total),2) s FROM orders WHERE status = 'shipped' AND customer_id IN (SELECT id FROM customers WHERE region = 'EU')");
q("2024 orders EU", "SELECT COUNT(*) c FROM orders WHERE created_at < '2025-01-01' AND customer_id IN (SELECT id FROM customers WHERE region = 'EU')");
q("2025 orders EU", "SELECT COUNT(*) c FROM orders WHERE created_at >= '2025-01-01' AND customer_id IN (SELECT id FROM customers WHERE region = 'EU')");

// ---- 4. heavy customers (IN + HAVING) --------------------------------------
q("cust order counts", "SELECT customer_id, COUNT(*) c FROM orders GROUP BY customer_id ORDER BY c DESC, customer_id");
q("custs >=10 orders", `SELECT COUNT(*) c, GROUP_CONCAT(id) ids FROM customers WHERE id IN
  (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 10)`);
q("custs >=15 orders", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM customers WHERE id IN
  (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 15)`);
q("custs spend >=2000", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM customers WHERE id IN
  (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) >= 2000)`);
q("custs spend >=3000", `SELECT COUNT(*) c FROM customers WHERE id IN
  (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) >= 3000)`);
q("custs spend >=2500", `SELECT COUNT(*) c FROM customers WHERE id IN
  (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) >= 2500)`);
q("top spender", "SELECT customer_id, ROUND(SUM(total),2) s FROM orders GROUP BY customer_id ORDER BY s DESC LIMIT 2");

// ---- 5. invoices / payments -------------------------------------------------
q("inv per cust", "SELECT customer_id, COUNT(*) c FROM invoices GROUP BY customer_id ORDER BY c DESC LIMIT 5");
q("US invoices", `SELECT COUNT(*) c, ROUND(SUM(amount_cents)/100.0,2) s FROM invoices
  WHERE customer_id IN (SELECT id FROM customers WHERE region = 'US')`);
q("EU invoices", `SELECT COUNT(*) c, ROUND(SUM(amount_cents)/100.0,2) s FROM invoices
  WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU')`);
q("paid invoices EU", `SELECT COUNT(*) c FROM invoices
  WHERE status = 'paid' AND customer_id IN (SELECT id FROM customers WHERE region = 'EU')`);
q("open invoices US", `SELECT COUNT(*) c FROM invoices
  WHERE status = 'open' AND customer_id IN (SELECT id FROM customers WHERE region = 'US')`);
q("payments on EU inv", `SELECT COUNT(*) c, ROUND(SUM(amount_cents)/100.0,2) s FROM payments
  WHERE invoice_id IN (SELECT id FROM invoices WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU'))`);
q("payments on big inv", `SELECT COUNT(*) c FROM payments WHERE invoice_id IN
  (SELECT id FROM invoices WHERE amount_cents > 300000)`);
q("invoices >300k", "SELECT COUNT(*) c FROM invoices WHERE amount_cents > 300000");
q("payments on card", `SELECT COUNT(*) c FROM payments WHERE method = 'card' AND invoice_id IN
  (SELECT id FROM invoices WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU'))`);
q("methods", "SELECT method, COUNT(*) c FROM payments GROUP BY method");
q("big inv count 250k", "SELECT COUNT(*) c FROM invoices WHERE amount_cents > 250000");
q("payments on 250k inv", "SELECT COUNT(*) c FROM payments WHERE invoice_id IN (SELECT id FROM invoices WHERE amount_cents > 250000)");

// ---- 6. expenses / ledger / cross-domain ------------------------------------
q("vendor lead counts", `SELECT COUNT(*) c, ROUND(SUM(amount_cents)/100.0,2) s FROM expenses
  WHERE vendor IN (SELECT vendor FROM expenses GROUP BY vendor HAVING COUNT(*) >= 5)`);
q("vendor counts", "SELECT vendor, COUNT(*) c FROM expenses GROUP BY vendor ORDER BY c DESC, vendor");
q(">=5-vendor list", "SELECT vendor FROM expenses GROUP BY vendor HAVING COUNT(*) >= 5");
q("cat spend", "SELECT category, ROUND(SUM(amount_cents)/100.0,2) s FROM expenses GROUP BY category ORDER BY s DESC");
q("ledger debit big", "SELECT COUNT(*) c FROM ledger_entries WHERE debit_cents > 400000");
q("ledger accounts big", "SELECT account, COUNT(*) c FROM ledger_entries WHERE debit_cents > 400000 GROUP BY account");
q("expense days with orders", `SELECT COUNT(*) c FROM expenses
  WHERE spent_on IN (SELECT created_at FROM orders)`);
q("expense vendors on order days", `SELECT COUNT(*) c FROM expenses
  WHERE spent_on IN (SELECT created_at FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU'))`);
q("orders on expense days", `SELECT COUNT(*) c FROM orders
  WHERE created_at IN (SELECT spent_on FROM expenses WHERE category = 'Software')`);
q("software spend days", "SELECT COUNT(DISTINCT spent_on) d FROM expenses WHERE category = 'Software'");
q("stocky products in orders", `SELECT COUNT(*) c FROM products
  WHERE stock > 40 AND id IN (SELECT product_id FROM order_items)`);
q("stock>40 count", "SELECT COUNT(*) c FROM products WHERE stock > 40");
q("suppliers of sold items", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM suppliers
  WHERE id IN (SELECT supplier_id FROM products WHERE id IN (SELECT product_id FROM order_items))`);
q("suppliers of never-sold", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM suppliers
  WHERE id IN (SELECT supplier_id FROM products WHERE id NOT IN (SELECT product_id FROM order_items))`);
q("suppliers low stock", `SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM suppliers
  WHERE id IN (SELECT supplier_id FROM products WHERE stock < 15)`);
q("stock<15 count", "SELECT COUNT(*) c FROM products WHERE stock < 15");
q("APAC inv sum", `SELECT COUNT(*) c, ROUND(SUM(amount_cents)/100.0,2) s FROM invoices
  WHERE customer_id IN (SELECT id FROM customers WHERE region = 'APAC')`);
q("APAC payments", `SELECT COUNT(*) c FROM payments WHERE invoice_id IN
  (SELECT id FROM invoices WHERE customer_id IN (SELECT id FROM customers WHERE region = 'APAC'))`);
q("EU orders 2025 pending", `SELECT COUNT(*) c FROM orders WHERE status = 'pending' AND created_at >= '2025-01-01'
  AND customer_id IN (SELECT id FROM customers WHERE region = 'EU')`);
q("ledger cash-outs", `SELECT COUNT(*) c, ROUND(SUM(debit_cents)/100.0,2) s FROM ledger_entries
  WHERE account IN (SELECT account FROM ledger_entries GROUP BY account HAVING SUM(debit_cents) > 500000)`);
q("acct debit sums", "SELECT account, ROUND(SUM(debit_cents)/100.0,2) s FROM ledger_entries GROUP BY account ORDER BY s DESC");
q("invoice custs multi", `SELECT COUNT(*) c FROM customers WHERE id IN
  (SELECT customer_id FROM invoices GROUP BY customer_id HAVING COUNT(*) >= 2)`);
q("multi-inv custs", "SELECT customer_id, COUNT(*) c FROM invoices GROUP BY customer_id ORDER BY c DESC LIMIT 8");
q("US 2025 orders", `SELECT COUNT(*) c FROM orders WHERE created_at >= '2025-01-01'
  AND customer_id IN (SELECT id FROM customers WHERE region = 'US')`);
q("product 5 details", "SELECT id, name, price, stock, supplier_id, category FROM products WHERE id IN (2,5,11)");
q("orders w product5", "SELECT COUNT(*) c FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id = 5)");
q("cat list", "SELECT DISTINCT category FROM products ORDER BY category");
q("audio sold", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category = 'Audio'))`);
q("audio products", "SELECT COUNT(*) c, GROUP_CONCAT(name) names FROM products WHERE category = 'Audio'");
q("peripherals sold", `SELECT COUNT(*) c FROM orders WHERE id IN
  (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category = 'Peripherals'))`);
q("cats", "SELECT DISTINCT category FROM products");
db.close();
console.log(`\n${n} probes done`);
