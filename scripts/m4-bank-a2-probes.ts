// Extra receipts for the m4 bank-A2 draft (scalar-sub.ts).
// bun:sqlite ONLY, readonly. Run: bun scripts/m4-bank-a2-probes.ts
import { Database } from "bun:sqlite";

const db = new Database("db/custom.db", { readonly: true });
let n = 0;
const q = (label: string, sql: string) => {
  try {
    console.log(`${label}: ${JSON.stringify(db.query(sql).all())}`);
  } catch (e: any) {
    console.log(`${label}: ERROR "${e.message}"`);
  }
};

// ---- identity & roster color ----
q("C01 product 1", `SELECT id, name, price FROM products WHERE id = 1`);
q("C02 cheapest products", `SELECT name, price FROM products ORDER BY price LIMIT 2`);
q("C03 customer 16", `SELECT id, name, region FROM customers WHERE id = 16`);
q("C04 first customer natural order", `SELECT (SELECT name FROM customers) first_row`);
q("C05 supplier roster", `SELECT id, name, rating FROM suppliers ORDER BY id`);
q("C06 min spend customer", `SELECT c.name, ROUND(SUM(o.total),2) s FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY s LIMIT 1`);
q("C07 max spend customer", `SELECT c.name, ROUND(SUM(o.total),2) s FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY s DESC LIMIT 1`);

// ---- scalar bars ----
q("C08 at-or-below avg products", `SELECT COUNT(*) n FROM products WHERE price <= (SELECT AVG(price) FROM products)`);
q("C09 price exactly avg", `SELECT COUNT(*) n FROM products WHERE price = (SELECT AVG(price) FROM products)`);
q("C10 orders below storewide avg", `SELECT COUNT(*) n FROM orders WHERE total < (SELECT AVG(total) FROM orders)`);
q("C11 orders above delivered-only avg", `SELECT COUNT(*) n FROM orders WHERE total > (SELECT AVG(total) FROM orders WHERE status='delivered')`);
q("C12 products above Audio avg", `SELECT COUNT(*) n FROM products WHERE price > (SELECT AVG(price) FROM products WHERE category='Audio')`);
q("C13 suppliers above avg rating", `SELECT name, rating FROM suppliers WHERE rating > (SELECT AVG(rating) FROM suppliers)`);
q("C14 avg rating", `SELECT ROUND(AVG(rating),2) v FROM suppliers`);
q("C15 customers under VIP bar", `SELECT COUNT(*) n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) < (SELECT SUM(total)/16 FROM orders))`);
q("C16 correlated scalar above storewide bar", `SELECT COUNT(*) n FROM customers c WHERE (SELECT SUM(total) FROM orders o WHERE o.customer_id = c.id) > (SELECT AVG(total) FROM orders)`);
q("C17 invoices above own avg", `SELECT COUNT(*) n FROM invoices WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices)`);
q("C18 expenses above own avg", `SELECT COUNT(*) n FROM expenses WHERE amount_cents > (SELECT AVG(amount_cents) FROM expenses)`);
q("C19 min product price", `SELECT MIN(price) p, MAX(price) q FROM products`);
q("C20 IS NULL detects empty scalar", `SELECT COUNT(*) n FROM orders WHERE (SELECT MAX(total) FROM orders WHERE 1=0) IS NULL`);

// ---- legality & shape ----
q("C21 scalar in ORDER BY runs", `SELECT id, name FROM suppliers ORDER BY (SELECT AVG(rating) FROM suppliers) DESC LIMIT 2`);
q("C22 scalar minus column per row", `SELECT id, ROUND(price - (SELECT AVG(price) FROM products), 2) gap FROM products ORDER BY gap DESC LIMIT 1`);
q("C23 scalar with LIMIT 1 deterministic", `SELECT (SELECT customer_id FROM orders WHERE status='pending' ORDER BY id LIMIT 1) v`);
q("C24 scalar stamp over GROUP BY status", `SELECT status, (SELECT ROUND(AVG(total),2) FROM orders) bar FROM orders GROUP BY status ORDER BY status`);
q("C25 aliased scalar in ORDER BY legal", `SELECT name, price - (SELECT AVG(price) FROM products) AS gap FROM products ORDER BY gap LIMIT 1`);
q("C26 nested scalar", `SELECT (SELECT MAX(price) FROM products WHERE price < (SELECT AVG(price) FROM products)) v`);
q("C27 scalar equality on MAX", `SELECT COUNT(*) n FROM products WHERE price = (SELECT MAX(price) FROM products)`);
q("C28 scalar vs literal avg bar parity", `SELECT COUNT(*) a FROM products WHERE price > (SELECT AVG(price) FROM products)`);
q("C29 HAVING scalar full list", `SELECT category, ROUND(AVG(price),2) avg_p FROM products GROUP BY category HAVING AVG(price) > (SELECT AVG(price) FROM products) ORDER BY avg_p DESC`);
q("C30 pending club names", `SELECT c.name, COUNT(*) n FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status='pending' GROUP BY c.id ORDER BY c.name`);

console.log("--- probes done");
