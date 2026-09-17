/// <reference types="bun-types" />
/** Wave-3 fact receipts, batch 2 — ambiguity pre-checks + walkthrough color. */
import { Database } from "bun:sqlite";

const db = new Database("db/custom.db", { readonly: true });
let n = 104;
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

probe("orders on peak day 2024-10-04", `SELECT id, customer_id, ROUND(total,2) AS total FROM orders WHERE date(created_at)='2024-10-04'`);
probe("union club names 1000/500k", `SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE total > 1000 UNION SELECT customer_id FROM invoices WHERE amount_cents > 500000)`);
probe("union club 800/500k", `SELECT COUNT(*) AS n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE total > 800 UNION SELECT customer_id FROM invoices WHERE amount_cents > 500000)`);
probe("union club 500/500k", `SELECT COUNT(*) AS n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE total > 500 UNION SELECT customer_id FROM invoices WHERE amount_cents > 500000)`);
probe("status peaks correlated aliased", `SELECT o.status, ROUND((SELECT MAX(total) FROM orders o2 WHERE o2.status = o.status),2) AS peak FROM orders o GROUP BY o.status`);
probe("above own-region avg via derived joins", `SELECT c.name, ROUND(sp.spend,2) AS spend, ROUND(ra.ra,2) AS region_avg FROM customers c JOIN (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) sp ON sp.customer_id = c.id JOIN (SELECT c2.region, AVG(r2.spend) AS ra FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) r2 JOIN customers c2 ON c2.id = r2.customer_id GROUP BY c2.region) ra ON ra.region = c.region WHERE sp.spend > ra.ra`);
probe("above own-region avg count derived joins", `SELECT COUNT(*) AS n FROM customers c JOIN (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) sp ON sp.customer_id = c.id JOIN (SELECT c2.region, AVG(r2.spend) AS ra FROM (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) r2 JOIN customers c2 ON c2.id = r2.customer_id GROUP BY c2.region) ra ON ra.region = c.region WHERE sp.spend > ra.ra`);
probe("cats avg above 100", `WITH cat AS (SELECT category, AVG(price) AS ap FROM products GROUP BY category HAVING AVG(price) > 100) SELECT COUNT(*) AS n FROM cat`);
probe("cats avg above 80", `WITH cat AS (SELECT category, AVG(price) AS ap FROM products GROUP BY category HAVING AVG(price) > 80) SELECT COUNT(*) AS n FROM cat`);
probe("cats avg above 50", `WITH cat AS (SELECT category, AVG(price) AS ap FROM products GROUP BY category HAVING AVG(price) > 50) SELECT COUNT(*) AS n FROM cat`);
probe("products bought by over-1000 club", `SELECT COUNT(DISTINCT product_id) AS n FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id IN (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) > 1000))`);
probe("products bought by over-3000 club", `SELECT COUNT(DISTINCT product_id) AS n FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id IN (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) > 3000))`);
probe("underpaid invoices", `SELECT COUNT(*) AS n FROM invoices i WHERE (SELECT COALESCE(SUM(amount_cents),0) FROM payments p WHERE p.invoice_id=i.id) < i.amount_cents`);
probe("open+void billed", `SELECT status, ROUND(SUM(amount_cents)/100.0,2) AS t, COUNT(*) AS n FROM invoices GROUP BY status`);
probe("payments on non-paid invoices", `SELECT ROUND(SUM(p.amount_cents)/100.0,2) AS t FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.status <> 'paid'`);
probe("vendor totals", `SELECT vendor, COUNT(*) AS receipts, ROUND(SUM(amount_cents)/100.0,2) AS t FROM expenses GROUP BY vendor ORDER BY t DESC`);
probe("invoice ladder +1 month", `WITH RECURSIVE days(d) AS (SELECT date((SELECT MIN(issued_on) FROM invoices)) UNION ALL SELECT date(d,'+1 month') FROM days WHERE d < date((SELECT MAX(issued_on) FROM invoices))) SELECT COUNT(*) AS n FROM days`);
probe("invoice ladder +7 day", `WITH RECURSIVE days(d) AS (SELECT date((SELECT MIN(issued_on) FROM invoices)) UNION ALL SELECT date(d,'+7 day') FROM days WHERE d < date((SELECT MAX(issued_on) FROM invoices))) SELECT COUNT(*) AS n FROM days`);
probe("order-count stage >=10", `SELECT COUNT(*) AS n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n >= 10`);
probe("order-count stage >=13", `SELECT COUNT(*) AS n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n >= 13`);
probe("order-count stage >=14", `SELECT COUNT(*) AS n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n >= 14`);
probe("order-count avg bar", `SELECT ROUND(AVG(n),2) AS bar FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`);
probe("above order-count bar", `SELECT COUNT(*) AS n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n > (SELECT AVG(n) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id))`);
probe("ledger accounts census", `SELECT account, COUNT(*) AS n, ROUND(SUM(debit_cents)/100.0,2) AS debits, ROUND(SUM(credit_cents)/100.0,2) AS credits FROM ledger_entries GROUP BY account`);
probe("order 74 items", `SELECT p.name, oi.quantity, ROUND(oi.unit_price,2) AS unit FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = 74`);
probe("per-day order count distribution", `SELECT n, COUNT(*) AS days FROM (SELECT date(created_at) AS d, COUNT(*) AS n FROM orders GROUP BY date(created_at)) GROUP BY n`);
probe("buyers of US-sourced products", `SELECT COUNT(DISTINCT o.customer_id) AS n FROM orders o JOIN order_items oi ON oi.order_id=o.id WHERE oi.product_id IN (SELECT id FROM products WHERE supplier_id IN (SELECT id FROM suppliers WHERE region='US'))`);
probe("buyers of APAC-sourced products", `SELECT COUNT(DISTINCT o.customer_id) AS n FROM orders o JOIN order_items oi ON oi.order_id=o.id WHERE oi.product_id IN (SELECT id FROM products WHERE supplier_id IN (SELECT id FROM suppliers WHERE region='APAC'))`);
probe("AVG items per order", `SELECT ROUND(AVG(n),2) AS bar FROM (SELECT order_id, COUNT(*) AS n FROM order_items GROUP BY order_id)`);
probe("days with 2+ orders", `SELECT COUNT(*) AS n FROM (SELECT date(created_at) AS d, COUNT(*) AS n FROM orders GROUP BY date(created_at)) WHERE n >= 2`);
probe("farid spend", `SELECT c.name, ROUND(SUM(o.total),2) AS spend FROM customers c JOIN orders o ON o.customer_id=c.id WHERE c.name='Farid Nasser' GROUP BY c.id`);
probe("invoice 500k+ list", `SELECT number, customer_id, ROUND(amount_cents/100.0,2) AS amt, status FROM invoices WHERE amount_cents > 500000`);
probe("vip spend stage join names", `WITH vip AS (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) > 2000) SELECT c.name FROM vip JOIN customers c ON c.id = vip.customer_id ORDER BY c.name`);

console.log(`--- ${n} probes done (batch 2)`);
db.close();
