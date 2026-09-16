// Wave-6 probe batch 2 — slice figures for q5/q6/q8 case designs.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();

console.log("X1a paid pot:", q(`SELECT SUM(amount_cents) s FROM invoices WHERE status='paid'`));
console.log("X1b open pot:", q(`SELECT SUM(amount_cents) s FROM invoices WHERE status='open'`));
console.log("X2 category baskets:", q(`SELECT p.category c, COUNT(DISTINCT o.id) n FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN orders o ON o.id=oi.order_id GROUP BY p.category ORDER BY n DESC`));
console.log("X3 category avg price:", q(`SELECT category, ROUND(AVG(price),2) a, COUNT(*) n FROM products GROUP BY category ORDER BY a DESC`));
console.log("X4 payment methods:", q(`SELECT method, ROUND(AVG(amount_cents),2) a, COUNT(*) n FROM payments GROUP BY method`));
console.log("X5 supplier max price:", q(`SELECT supplier_id, MAX(price) mx FROM products GROUP BY supplier_id ORDER BY mx DESC`));
console.log("X6 customers >20 orders:", q(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) > 20)`));
console.log("X7 region shipped sums:", q(`SELECT c.region r, ROUND(SUM(o.total),2) s FROM customers c JOIN orders o ON o.customer_id=c.id WHERE o.status='shipped' GROUP BY c.region ORDER BY s DESC`));
console.log("X8 delivered above own staged mean:", q(`SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) s FROM orders WHERE status='delivered' GROUP BY customer_id) WHERE s > (SELECT AVG(s) FROM (SELECT customer_id, SUM(total) s FROM orders WHERE status='delivered' GROUP BY customer_id))`));
console.log("X9a open-sums vs all-mean:", q(`SELECT COUNT(*) n FROM (SELECT customer_id, SUM(amount_cents) s FROM invoices WHERE status='open' GROUP BY customer_id) WHERE s > (SELECT AVG(s) FROM (SELECT SUM(amount_cents) s FROM invoices GROUP BY customer_id))`));
console.log("X9b paid-sums vs all-mean:", q(`SELECT COUNT(*) n FROM (SELECT customer_id, SUM(amount_cents) s FROM invoices WHERE status='paid' GROUP BY customer_id) WHERE s > (SELECT AVG(s) FROM (SELECT SUM(amount_cents) s FROM invoices GROUP BY customer_id))`));
console.log("X10 invoice months:", q(`SELECT COUNT(*) n FROM (SELECT strftime('%Y-%m', issued_on) m, COUNT(*) n FROM invoices GROUP BY m)`));
console.log("X11a APAC whales >2000:", q(`SELECT COUNT(*) n FROM customers c, (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id) sp WHERE c.id=sp.customer_id AND c.region='APAC' AND s > 2000`));
console.log("X11b EU whales >1000:", q(`SELECT COUNT(*) n FROM customers c, (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id) sp WHERE c.id=sp.customer_id AND c.region='EU' AND s > 1000`));
console.log("X12a US shipped rows:", q(`SELECT COUNT(*) n FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='US' AND o.status='shipped'`));
console.log("X12b APAC delivered rows:", q(`SELECT COUNT(*) n FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='APAC' AND o.status='delivered'`));
console.log("X13 VIP >1000 count+pot:", q(`SELECT COUNT(*) n, SUM(s) p FROM (SELECT customer_id, SUM(total) s FROM orders GROUP BY customer_id) WHERE s > 1000`));
console.log("X14a open > 0.9x bar:", q(`SELECT COUNT(*) n FROM invoices WHERE status='open' AND amount_cents > 0.9*(SELECT AVG(amount_cents) FROM invoices)`));
console.log("X14b open > 1.5x bar:", q(`SELECT COUNT(*) n FROM invoices WHERE status='open' AND amount_cents > 1.5*(SELECT AVG(amount_cents) FROM invoices)`));
console.log("X15a products > 2x supplier avg:", q(`SELECT COUNT(*) n FROM products p WHERE price > 2*(SELECT AVG(price) FROM products p2 WHERE p2.supplier_id=p.supplier_id)`));
console.log("X15b products > 3x supplier avg:", q(`SELECT COUNT(*) n FROM products p WHERE price > 3*(SELECT AVG(price) FROM products p2 WHERE p2.supplier_id=p.supplier_id)`));
console.log("X16 cross ladder max:", q(`WITH RECURSIVE x(n,m) AS (SELECT 1,1 UNION ALL SELECT n+1, m*2 FROM x WHERE n < 6) SELECT COUNT(*) rows, MAX(m) mx FROM x`));
console.log("X17 avg-ticket 350/450:", q(`SELECT (SELECT COUNT(*) FROM (SELECT customer_id, AVG(total) a, COUNT(*) c FROM orders GROUP BY customer_id) WHERE a > 350 AND c > 1) n350, (SELECT COUNT(*) FROM (SELECT customer_id, AVG(total) a, COUNT(*) c FROM orders GROUP BY customer_id) WHERE a > 450 AND c > 1) n450`));
console.log("X18 open top invoice:", q(`SELECT customer_id, amount_cents FROM invoices WHERE status='open' ORDER BY amount_cents DESC LIMIT 1`));
