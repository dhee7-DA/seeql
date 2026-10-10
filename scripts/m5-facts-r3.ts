/// <reference types="bun-types" />
// m5-c-r3 probe tool — read-only COPY of db/custom.db, self-deleting.
// Every figure used in cases-r3.ts must trace to this output.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5c-r3.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  console.log(JSON.stringify(q(sql)));
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- status + region re-verification (brief vs facts2 conflict) ----
show("status census", "SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY n DESC");
show("region order counts", "SELECT c.region, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY n DESC");

// ---- plain-column rankers (easy) ----
show("suppliers dump", "SELECT id, name, region, rating FROM suppliers ORDER BY id");
show("supplier rating rank", "SELECT name, rating, RANK() OVER (ORDER BY rating DESC) rk FROM suppliers");
show("supplier rating ties", "SELECT rating, COUNT(*) n FROM suppliers GROUP BY rating HAVING n > 1");
show("products price rank full", "SELECT name, price, RANK() OVER (ORDER BY price DESC) rk FROM products");
show("products stock rank full", "SELECT name, stock, RANK() OVER (ORDER BY stock DESC) rk FROM products");
show("products stock ties", "SELECT stock, COUNT(*) n FROM products GROUP BY stock HAVING n > 1");
show("pending ranked by total", "SELECT id, total, RANK() OVER (ORDER BY total DESC) rk FROM orders WHERE status = 'pending'");
show("invoices amount rank top6", "SELECT id, number, amount_cents, RANK() OVER (ORDER BY amount_cents DESC) rk FROM invoices LIMIT 6");
show("invoice amount ties", "SELECT amount_cents, COUNT(*) n FROM invoices GROUP BY amount_cents HAVING n > 1");
show("payments dump", "SELECT id, invoice_id, amount_cents, method FROM payments ORDER BY id LIMIT 12");
show("payments count", "SELECT COUNT(*) n, MAX(amount_cents) mx FROM payments");
show("expenses amount rank top6", "SELECT id, category, vendor, amount_cents, RANK() OVER (ORDER BY amount_cents DESC) rk FROM expenses LIMIT 6");
show("expense spent_on ties", "SELECT spent_on, COUNT(*) n FROM expenses GROUP BY spent_on HAVING n > 1 ORDER BY spent_on");
show("ledger debit rank top5", "SELECT id, account, entry_date, debit_cents, RANK() OVER (ORDER BY debit_cents DESC) rk FROM ledger_entries LIMIT 5");
show("customer name-length rank", "SELECT name, LENGTH(name) len, RANK() OVER (ORDER BY LENGTH(name) DESC) rk, DENSE_RANK() OVER (ORDER BY LENGTH(name) DESC) drk FROM customers ORDER BY rk, name");
show("order_items unit_price rank top6", "SELECT oi.id, oi.unit_price, oi.quantity, RANK() OVER (ORDER BY oi.unit_price DESC) rk FROM order_items oi LIMIT 6");
show("order_items quantity ties", "SELECT quantity, COUNT(*) n FROM order_items GROUP BY quantity ORDER BY quantity");
show("invoice issued_on ties", "SELECT issued_on, COUNT(*) n FROM invoices GROUP BY issued_on HAVING n > 1");

// ---- aggregate ranks (medium) ----
show("customer spend league full", "SELECT c.name, ROUND(SUM(o.total),2) spend, RANK() OVER (ORDER BY SUM(o.total) DESC) rk FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY rk");
show("spend league HAVING > 1000", "SELECT c.name, ROUND(SUM(o.total),2) spend, RANK() OVER (ORDER BY SUM(o.total) DESC) rk FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id HAVING SUM(o.total) > 1000 ORDER BY rk");
show("month spend ranked", "SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total),2) spend, RANK() OVER (ORDER BY SUM(total) DESC) rk FROM orders GROUP BY mon ORDER BY rk");
show("region order-count ranked", "SELECT c.region, COUNT(*) n, RANK() OVER (ORDER BY COUNT(*) DESC) rk FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY rk");
show("category product-count ranked", "SELECT category, COUNT(*) n, RANK() OVER (ORDER BY COUNT(*) DESC) rk FROM products GROUP BY category ORDER BY rk");
show("supplier product-count ranked", "SELECT s.name, COUNT(p.id) n, RANK() OVER (ORDER BY COUNT(p.id) DESC) rk FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY rk, s.name");
show("customer order-count ladder full", "SELECT c.name, COUNT(*) n, RANK() OVER (ORDER BY COUNT(*) DESC) rk, DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) drk, ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC, c.name) rn FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY rk, c.name");
show("customer order-count census", "SELECT COUNT(*) n, COUNT(*) c FROM orders GROUP BY customer_id");
show("expense month ranked", "SELECT strftime('%Y-%m', spent_on) mon, ROUND(SUM(amount_cents)/100.0,2) spend, RANK() OVER (ORDER BY SUM(amount_cents) DESC) rk FROM expenses GROUP BY mon ORDER BY rk");
show("expense category ranked", "SELECT category, ROUND(SUM(amount_cents)/100.0,2) spend, COUNT(*) n, RANK() OVER (ORDER BY SUM(amount_cents) DESC) rk FROM expenses GROUP BY category ORDER BY rk");
show("status value ranked", "SELECT status, ROUND(SUM(total),2) value, COUNT(*) n, RANK() OVER (ORDER BY SUM(total) DESC) rk FROM orders GROUP BY status ORDER BY rk");
show("invoice count per customer ranked", "SELECT c.name, COUNT(*) n, RANK() OVER (ORDER BY COUNT(*) DESC) rk FROM invoices i JOIN customers c ON c.id = i.customer_id GROUP BY c.id ORDER BY rk, c.name");
show("per-customer max order ranked", "SELECT c.name, ROUND(MAX(o.total),2) mx, RANK() OVER (ORDER BY MAX(o.total) DESC) rk FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY rk LIMIT 6");
show("max-order ties", "SELECT mx, COUNT(*) c FROM (SELECT MAX(total) mx, customer_id FROM orders GROUP BY customer_id) GROUP BY mx HAVING c > 1");
show("per-customer avg order ranked", "SELECT c.name, ROUND(AVG(o.total),2) avg_order, RANK() OVER (ORDER BY AVG(o.total) DESC) rk FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY rk LIMIT 6");
show("per-product order-items count ranked", "SELECT p.name, COUNT(*) n, RANK() OVER (ORDER BY COUNT(*) DESC) rk FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id ORDER BY rk, p.name LIMIT 10");
show("per-product revenue ranked", "SELECT p.name, ROUND(SUM(oi.quantity*oi.unit_price),2) rev, RANK() OVER (ORDER BY SUM(oi.quantity*oi.unit_price) DESC) rk FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id ORDER BY rk LIMIT 6");
show("revenue ties", "SELECT ROUND(SUM(quantity*unit_price),2) rev, COUNT(*) c FROM order_items GROUP BY product_id HAVING c > 1");

// ---- partitions (medium) ----
show("customer spend rank within region", "SELECT c.name, c.region, ROUND(SUM(o.total),2) spend, RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) rk FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY c.region, rk");
show("order total rank within status", "SELECT status, id, total, RANK() OVER (PARTITION BY status ORDER BY total DESC) rk FROM orders WHERE total > 900");
show("order rn within customer top6", "SELECT customer_id, id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) rn FROM orders WHERE customer_id IN (1,5) ORDER BY customer_id, rn");
show("product price rank within category", "SELECT category, name, price, RANK() OVER (PARTITION BY category ORDER BY price DESC) rk FROM products ORDER BY category, rk");
show("supplier rating rank within region", "SELECT s.region, s.name, s.rating, RANK() OVER (PARTITION BY s.region ORDER BY s.rating DESC) rk FROM suppliers s ORDER BY s.region, rk");
show("supplier regions", "SELECT region, COUNT(*) n FROM suppliers GROUP BY region");

// ---- NTILE / quartiles ----
show("ntile4 customers by spend", "SELECT name, ROUND(SUM(o.total),2) spend, NTILE(4) OVER (ORDER BY SUM(o.total) DESC) tile FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY tile, spend DESC");
show("ntile4 census + spans", "SELECT tile, COUNT(*) n, MIN(t) mn, MAX(t) mx FROM (SELECT total t, NTILE(4) OVER (ORDER BY total DESC) tile FROM orders) GROUP BY tile ORDER BY tile");
show("ntile5 census", "SELECT tile, COUNT(*) n FROM (SELECT NTILE(5) OVER (ORDER BY total) tile FROM orders) GROUP BY tile ORDER BY tile");
show("ntile2 census", "SELECT tile, COUNT(*) n FROM (SELECT NTILE(2) OVER (ORDER BY total) tile FROM orders) GROUP BY tile ORDER BY tile");
show("ntile4 products by price", "SELECT name, price, NTILE(4) OVER (ORDER BY price DESC) tile FROM products ORDER BY tile, price DESC");
show("ntile4 expense months", "SELECT mon, ROUND(s/100.0,2) spend, NTILE(4) OVER (ORDER BY s DESC) tile FROM (SELECT strftime('%Y-%m', spent_on) mon, SUM(amount_cents) s FROM expenses GROUP BY mon) ORDER BY tile, spend DESC");
show("ntile4 invoices by amount", "SELECT tile, COUNT(*) n, MIN(a) mn, MAX(a) mx FROM (SELECT amount_cents a, NTILE(4) OVER (ORDER BY amount_cents DESC) tile FROM invoices) GROUP BY tile ORDER BY tile");
show("orders >= 489.33 count", "SELECT COUNT(*) n, MIN(total) mn, MAX(total) mx FROM orders WHERE total >= 489.33");
show("totals near 489 boundary", "SELECT id, total FROM orders WHERE total BETWEEN 440 AND 500 ORDER BY total DESC");

// ---- top-N-per-group (hard) ----
show("top-3 orders per region", "SELECT region, name, id, ROUND(total,2) total, rn FROM (SELECT c.region region, c.name name, o.id id, o.total total, ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY o.total DESC, o.id) rn FROM orders o JOIN customers c ON c.id = o.customer_id) WHERE rn <= 3 ORDER BY region, rn");
show("top-1 order per customer full", "SELECT name, id, ROUND(total,2) total, rn FROM (SELECT c.name name, o.id id, o.total total, ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.total DESC, o.id) rn FROM orders o JOIN customers c ON c.id = o.customer_id) WHERE rn = 1 ORDER BY total DESC");
show("top-2 per customer count", "SELECT COUNT(*) n FROM (SELECT ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) rn FROM orders) WHERE rn <= 2");
show("top-2 orders per region", "SELECT region, id, ROUND(total,2) total, rn FROM (SELECT c.region region, o.id id, o.total total, ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY o.total DESC, o.id) rn FROM orders o JOIN customers c ON c.id = o.customer_id) WHERE rn <= 2 ORDER BY region, rn");
show("top product per category", "SELECT category, name, price, rk FROM (SELECT category, name, price, RANK() OVER (PARTITION BY category ORDER BY price DESC) rk FROM products) WHERE rk = 1 ORDER BY category");
show("top-1 customer per region (W05 check)", "SELECT region, name, ROUND(spend,2), rk FROM (SELECT c.region region, c.name name, SUM(o.total) spend, RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) rk FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id) WHERE rk = 1 ORDER BY region");
show("top-1 per status by total", "SELECT status, id, ROUND(total,2) total FROM (SELECT status, id, total, RANK() OVER (PARTITION BY status ORDER BY total DESC) rk FROM orders) WHERE rk = 1 ORDER BY total DESC");
show("cheapest 5 orders", "SELECT id, total, ROW_NUMBER() OVER (ORDER BY total ASC) rn FROM orders ORDER BY rn LIMIT 5");

// ---- created_at tie discipline (hard) ----
show("shared-date census", "SELECT created_at, COUNT(*) n, GROUP_CONCAT(id) ids FROM orders GROUP BY created_at HAVING n > 1 ORDER BY created_at");
show("rank blocks on shared dates", "SELECT created_at, n, MIN(rk) mn, MAX(rk) mx FROM (SELECT created_at, RANK() OVER (ORDER BY created_at) rk FROM orders) JOIN (SELECT created_at, COUNT(*) n FROM orders GROUP BY created_at HAVING n > 1) USING(created_at) GROUP BY created_at ORDER BY created_at");
show("2024-05-12 detail", "SELECT id, customer_id, total, created_at FROM orders WHERE created_at = '2024-05-12' ORDER BY id");
show("2024-10-13 detail", "SELECT id, customer_id, total, created_at FROM orders WHERE created_at = '2024-10-13' ORDER BY id");
show("rankers on created_at top6", "SELECT id, created_at, RANK() OVER (ORDER BY created_at) rk, DENSE_RANK() OVER (ORDER BY created_at) drk, ROW_NUMBER() OVER (ORDER BY created_at, id) rn FROM orders ORDER BY rk, id LIMIT 8");
show("rn by created_at,id on 05-12", "SELECT id, total, ROW_NUMBER() OVER (ORDER BY created_at, id) rn FROM orders WHERE created_at = '2024-05-12'");
show("rn by created_at,id on 10-13", "SELECT id, total, ROW_NUMBER() OVER (ORDER BY created_at, id) rn FROM orders WHERE created_at = '2024-10-13'");
show("rn by created_at,total on 05-12", "SELECT id, total, ROW_NUMBER() OVER (ORDER BY created_at, total DESC) rn FROM orders WHERE created_at = '2024-05-12'");
show("total ties recheck", "SELECT total, COUNT(*) n FROM orders GROUP BY total HAVING n > 1");
show("order count distinct", "SELECT COUNT(DISTINCT created_at) dates, COUNT(*) rows FROM orders");

// ---- ledger + misc for medium variants ----
show("ledger account nets ranked", "SELECT account, ROUND(SUM(debit_cents-credit_cents)/100.0,2) net, RANK() OVER (ORDER BY ABS(SUM(debit_cents-credit_cents)) DESC) rk FROM ledger_entries GROUP BY account ORDER BY rk");
show("customers city census", "SELECT city, COUNT(*) n FROM customers GROUP BY city ORDER BY n DESC, city");

// ---- wave-specific follow-ups ----
show("customers tenure list", "SELECT id, name, created_at FROM customers ORDER BY created_at, id LIMIT 6");
show("customers newest", "SELECT id, name, created_at FROM customers ORDER BY created_at DESC, id LIMIT 4");
show("customers created_at ties", "SELECT created_at, COUNT(*) n FROM customers GROUP BY created_at HAVING n > 1");
show("expenses recent 4", "SELECT id, category, vendor, spent_on, amount_cents FROM expenses ORDER BY spent_on DESC, id LIMIT 4");
show("order_items unit_price ties", "SELECT unit_price, COUNT(*) n FROM order_items GROUP BY unit_price HAVING n > 1");
show("ledger debit ties", "SELECT debit_cents, COUNT(*) n FROM ledger_entries GROUP BY debit_cents HAVING n > 1");
show("stock >= 150 rows", "SELECT category, name, stock, NTILE(4) OVER (ORDER BY stock DESC) tile FROM products WHERE stock >= 150 ORDER BY stock DESC");
show("top product per supplier", "SELECT supplier, name, price FROM (SELECT s.name AS supplier, p.name, p.price, RANK() OVER (PARTITION BY p.supplier_id ORDER BY p.price DESC) rk FROM products p JOIN suppliers s ON s.id = p.supplier_id) WHERE rk = 1 ORDER BY supplier");
show("top vendor per category", "SELECT category, vendor, amount_cents, rk FROM (SELECT category, vendor, amount_cents, RANK() OVER (PARTITION BY category ORDER BY amount_cents DESC) rk FROM expenses) WHERE rk = 1 ORDER BY amount_cents DESC");
show("vendor census", "SELECT COUNT(DISTINCT vendor) n FROM expenses");
show("top-2 products per category", "SELECT category, name, price, rn FROM (SELECT category, name, price, ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC, name) rn FROM products) WHERE rn <= 2 ORDER BY category, rn");
show("spend league > 500 count", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id) WHERE s > 500");
show("ntile4 orders asc tile1 span", "SELECT MIN(t) mn, MAX(t) mx, COUNT(*) n FROM (SELECT total t, NTILE(4) OVER (ORDER BY total ASC) tile FROM orders) WHERE tile = 1");
show("ntile2 stock150", "SELECT tile, COUNT(*) n FROM (SELECT NTILE(2) OVER (ORDER BY stock DESC) tile FROM products WHERE stock >= 150) GROUP BY tile");
show("pending cheapest", "SELECT id, total FROM orders WHERE status = 'pending' ORDER BY total ASC LIMIT 2");

// ---- verbatim error re-verification ----
const errs: Array<[string, string]> = [
  ["NTILE(0)", "SELECT NTILE(0) OVER (ORDER BY total) t FROM orders LIMIT 1"],
  ["NTILE in WHERE", "SELECT id FROM orders WHERE NTILE(4) OVER (ORDER BY total) = 1 LIMIT 1"],
  ["bare RANK()", "SELECT RANK() FROM orders LIMIT 1"],
  ["alias inside OVER", "SELECT total AS t, RANK() OVER (ORDER BY t) rk FROM orders LIMIT 1"],
  ["window fn wrapped by aggregate", "SELECT SUM(RANK() OVER (ORDER BY total)) FROM orders LIMIT 1"],
  ["RANK vs DENSE vs ROW on total", "SELECT COUNT(DISTINCT r) FROM (SELECT RANK() OVER (ORDER BY total) r FROM orders)"],
];
for (const [label, sql] of errs) {
  try {
    db.query(sql).all();
    console.log(`ERRPROBE ${label}: no error`);
  } catch (e) {
    console.log(`ERRPROBE ${label}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
