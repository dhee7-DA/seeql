// M4 wave-1 fact probe — scalar subqueries (topic q1, L25).
// Every figure cited in cases-q1.ts (cs-901…cs-950) comes from this run;
// scripts/case-audit.ts re-verifies slot figures mechanically.

import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m4w1.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

let n = 0;
function q(label: string, sql: string) {
  n++;
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const flat = rows
      .map((r) => Object.entries(r).map(([k, v]) => `${k}=${v}`).join(" "))
      .join(" | ");
    console.log(`P${n} ${label}: ${flat.slice(0, 900) || "(empty)"}`);
  } catch (e) {
    console.log(`P${n} ${label}: ERROR ${e instanceof Error ? e.message : e}`);
  }
}

// ---- baseline aggregates (the "ask in two steps" step one) -----------------
q("avg product price", "SELECT ROUND(AVG(price),2) a, MIN(price) lo, MAX(price) hi, COUNT(*) n FROM products");
q("avg order total", "SELECT ROUND(AVG(total),2) a, MIN(total) lo, MAX(total) hi, COUNT(*) n FROM orders");
q("avg invoice cents", "SELECT ROUND(AVG(amount_cents),2) a, MIN(amount_cents) lo, MAX(amount_cents) hi FROM invoices");
q("avg stock", "SELECT ROUND(AVG(stock),2) a, MIN(stock) lo, MAX(stock) hi FROM products");
q("avg supplier rating", "SELECT ROUND(AVG(rating),2) a, MIN(rating) lo, MAX(rating) hi FROM suppliers");
q("avg payment cents", "SELECT ROUND(AVG(amount_cents),2) a, MAX(amount_cents) hi FROM payments");
q("avg expense cents", "SELECT ROUND(AVG(amount_cents),2) a, MAX(amount_cents) hi FROM expenses");
q("avg unit_price items", "SELECT ROUND(AVG(unit_price),2) a FROM order_items");
q("avg ledger debit", "SELECT ROUND(AVG(debit_cents),2) a, MAX(debit_cents) hi FROM ledger_entries");

// ---- easy: column > (SELECT AVG ...) ---------------------------------------
q("products above avg price", `SELECT name, price FROM products
WHERE price > (SELECT AVG(price) FROM products) ORDER BY price DESC`);
q("products above avg price n", `SELECT COUNT(*) n FROM products WHERE price > (SELECT AVG(price) FROM products)`);
q("orders above avg total", `SELECT id, ROUND(total,2) t FROM orders
WHERE total > (SELECT AVG(total) FROM orders) ORDER BY total DESC`);
q("orders above avg total n", `SELECT COUNT(*) n FROM orders WHERE total > (SELECT AVG(total) FROM orders)`);
q("invoices above avg cents", `SELECT number, amount_cents FROM invoices
WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices) ORDER BY amount_cents DESC`);
q("invoices above avg n", `SELECT COUNT(*) n FROM invoices WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices)`);
q("stock below avg n", `SELECT COUNT(*) n FROM products WHERE stock < (SELECT AVG(stock) FROM products)`);
q("stock below avg ids", `SELECT id, name, stock FROM products WHERE stock < (SELECT AVG(stock) FROM products) ORDER BY stock`);
q("suppliers above avg rating", `SELECT name, rating FROM suppliers WHERE rating > (SELECT AVG(rating) FROM suppliers) ORDER BY rating DESC`);
q("payments above avg n", `SELECT COUNT(*) n, MAX(amount_cents) hi FROM payments WHERE amount_cents > (SELECT AVG(amount_cents) FROM payments)`);
q("expenses above avg n", `SELECT COUNT(*) n FROM expenses WHERE amount_cents > (SELECT AVG(amount_cents) FROM expenses)`);
q("items above avg unit", `SELECT COUNT(*) n FROM order_items WHERE unit_price > (SELECT AVG(unit_price) FROM order_items)`);
q("ledger debit above avg n", `SELECT COUNT(*) n FROM ledger_entries WHERE debit_cents > (SELECT AVG(debit_cents) FROM ledger_entries)`);

// ---- easy: = (SELECT MAX / MIN ...) ----------------------------------------
q("priciest product", `SELECT name, price FROM products WHERE price = (SELECT MAX(price) FROM products)`);
q("cheapest product", `SELECT name, price FROM products WHERE price = (SELECT MIN(price) FROM products)`);
q("biggest order", `SELECT id, ROUND(total,2) t FROM orders WHERE total = (SELECT MAX(total) FROM orders)`);
q("smallest order", `SELECT id, ROUND(total,2) t FROM orders WHERE total = (SELECT MIN(total) FROM orders)`);
q("biggest invoice", `SELECT number, amount_cents FROM invoices WHERE amount_cents = (SELECT MAX(amount_cents) FROM invoices)`);
q("cheapest item line", `SELECT COUNT(*) n FROM order_items WHERE unit_price = (SELECT MIN(unit_price) FROM order_items)`);

// ---- medium: scalar + extra filter ------------------------------------------
q("pending above avg", `SELECT id, ROUND(total,2) t FROM orders
WHERE status = 'pending' AND total > (SELECT AVG(total) FROM orders)`);
q("pending n / stats", `SELECT status, COUNT(*) n, ROUND(AVG(total),2) a FROM orders GROUP BY status`);
q("active customers above avg-price basket? n/a — use spend", `SELECT 1`);
q("open invoices above open-avg", `SELECT number, amount_cents FROM invoices
WHERE status = 'open' AND amount_cents > (SELECT AVG(amount_cents) FROM invoices WHERE status = 'open')`);
q("open invoices avg-open", `SELECT COUNT(*) n, ROUND(AVG(amount_cents),2) a FROM invoices WHERE status = 'open'`);
q("in-stock products above avg price", `SELECT name, price, stock FROM products
WHERE stock > 0 AND price > (SELECT AVG(price) FROM products) ORDER BY price DESC`);
q("orders after first payment", `SELECT id, created_at FROM orders
WHERE created_at > (SELECT MIN(paid_on) FROM payments)`);
q("min paid_on / max issued_on", `SELECT (SELECT MIN(paid_on) FROM payments) fp, (SELECT MAX(issued_on) FROM invoices) li, (SELECT MIN(created_at) FROM orders) fo, (SELECT MAX(created_at) FROM orders) lo`);
q("orders before last invoice", `SELECT COUNT(*) n FROM orders WHERE created_at < (SELECT MAX(issued_on) FROM invoices)`);
q("expenses above max ledger debit", `SELECT category, amount_cents FROM expenses
WHERE amount_cents > (SELECT MAX(debit_cents) FROM ledger_entries)`);
q("max ledger debit", `SELECT MAX(debit_cents) hi FROM ledger_entries`);
q("orders > 2x avg total", `SELECT id, ROUND(total,2) t FROM orders
WHERE total > 2 * (SELECT AVG(total) FROM orders)`);
q("2x avg total val", `SELECT ROUND(2 * (SELECT AVG(total) FROM orders),2) v`);
q("suppliers above rating of supplying suppliers", `SELECT name, rating FROM suppliers
WHERE rating > (SELECT AVG(rating) FROM suppliers WHERE id IN (SELECT supplier_id FROM products))`);
q("avg rating supplying suppliers", `SELECT ROUND(AVG(rating),2) a FROM suppliers WHERE id IN (SELECT supplier_id FROM products)`);
q("which suppliers have no products", `SELECT name FROM suppliers WHERE id NOT IN (SELECT supplier_id FROM products)`);
q("EU orders above global avg", `SELECT o.id, ROUND(o.total,2) t FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'EU' AND o.total > (SELECT AVG(total) FROM orders)`);
q("EU orders n", `SELECT COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU'`);
q("customers with orders above avg per-customer count", `SELECT COUNT(*) n, (SELECT COUNT(*) FROM orders) tot, 16 denom FROM orders GROUP BY customer_id HAVING COUNT(*) > (SELECT COUNT(*) / 16.0 FROM orders)`);
q("avg orders per customer", `SELECT ROUND(COUNT(*) / 16.0, 3) v FROM orders`);

// ---- hard: bands, two subqueries, nested scalars -----------------------------
q("price band avg..max", `SELECT name, price FROM products
WHERE price > (SELECT AVG(price) FROM products) AND price < (SELECT MAX(price) FROM products)`);
q("second-priciest product", `SELECT name, price FROM products
WHERE price = (SELECT MAX(price) FROM products WHERE price < (SELECT MAX(price) FROM products))`);
q("price census top4", `SELECT name, price FROM products ORDER BY price DESC LIMIT 4`);
q("second-biggest order", `SELECT id, ROUND(total,2) t FROM orders
WHERE total = (SELECT MAX(total) FROM orders WHERE total < (SELECT MAX(total) FROM orders))`);
q("order totals top3 distinct", `SELECT DISTINCT ROUND(total,2) t FROM orders ORDER BY t DESC LIMIT 3`);
q("between avg and max orders", `SELECT COUNT(*) n FROM orders
WHERE total BETWEEN (SELECT AVG(total) FROM orders) AND (SELECT MAX(total) FROM orders)`);
q("big order per region above global", `SELECT c.region, COUNT(*) n, ROUND(MAX(o.total),2) mx
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.region HAVING MAX(o.total) > (SELECT AVG(total) FROM orders)`);
q("customers spend above global avg order", `SELECT c.name, ROUND(SUM(o.total),2) s
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.id HAVING SUM(o.total) > (SELECT AVG(total) FROM orders) ORDER BY s DESC`);
q("n customers above avg order spend", `SELECT COUNT(*) n FROM (
  SELECT c.id FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.id HAVING SUM(o.total) > (SELECT AVG(total) FROM orders))`);
q("avg customer lifetime", `SELECT ROUND(AVG(s),2) v FROM (
  SELECT SUM(total) s FROM orders GROUP BY customer_id)`);
q("orders above avg of own region? (correlated — skip)", `SELECT 1`);
q("paid-invoice customers above avg invoice", `SELECT c.name, COUNT(*) n FROM customers c
WHERE c.id IN (SELECT customer_id FROM invoices WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices))
GROUP BY c.id ORDER BY n DESC, c.name LIMIT 8`);
q("invoices-above-avg per customer census", `SELECT customer_id, COUNT(*) n FROM invoices
WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices) GROUP BY customer_id ORDER BY n DESC LIMIT 6`);
q("expenses above avg expense by category", `SELECT category, COUNT(*) n, ROUND(AVG(amount_cents),2) a
FROM expenses GROUP BY category HAVING AVG(amount_cents) > (SELECT AVG(amount_cents) FROM expenses)`);
q("expense category avgs", `SELECT category, ROUND(AVG(amount_cents),2) a FROM expenses GROUP BY category ORDER BY a DESC`);
q("orders above avg AND below 2x avg", `SELECT COUNT(*) n FROM orders
WHERE total > (SELECT AVG(total) FROM orders) AND total < 2 * (SELECT AVG(total) FROM orders)`);
q("invoices open above global avg", `SELECT number, amount_cents FROM invoices
WHERE status = 'open' AND amount_cents > (SELECT AVG(amount_cents) FROM invoices)`);
q("pending orders above pending avg (self-scope)", `SELECT id, ROUND(total,2) t FROM orders
WHERE status = 'pending' AND total > (SELECT AVG(total) FROM orders WHERE status = 'pending')`);
q("avg pending total", `SELECT ROUND(AVG(total),2) a, COUNT(*) n FROM orders WHERE status = 'pending'`);
q("shipped above avg vs all avg", `SELECT COUNT(*) n FROM orders
WHERE status = 'shipped' AND total > (SELECT AVG(total) FROM orders WHERE status = 'shipped')`);
q("avg shipped total", `SELECT ROUND(AVG(total),2) a, COUNT(*) n FROM orders WHERE status = 'shipped'`);
q("deposits: ledger debit above avg credit", `SELECT memo, debit_cents FROM ledger_entries
WHERE debit_cents > (SELECT AVG(credit_cents) FROM ledger_entries)`);
q("avg credit", `SELECT ROUND(AVG(credit_cents),2) a, MAX(credit_cents) hi FROM ledger_entries`);

rmSync(COPY, { force: true });
