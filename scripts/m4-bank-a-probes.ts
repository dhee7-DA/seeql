// Extra receipts for the m4 bank-A draft (in-subquery.ts + scalar-sub.ts).
// bun:sqlite ONLY, readonly. Run: bun scripts/m4-bank-a-probes.ts
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

// ---- rosters & tallies ----
q("A01 roster", `SELECT id, name, region, active FROM customers ORDER BY id`);
q("A02 region tallies", `SELECT region, COUNT(*) n, GROUP_CONCAT(id) ids FROM customers GROUP BY region ORDER BY region`);
q("A03 product top3", `SELECT name, price FROM products ORDER BY price DESC LIMIT 3`);
q("A04 category tallies", `SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY category`);
q("A05 invoice status tallies", `SELECT status, COUNT(*) n FROM invoices GROUP BY status`);

// ---- IN-set receipts ----
q("A06 region IN suppliers", `SELECT COUNT(*) n FROM customers WHERE region IN (SELECT region FROM suppliers)`);
q("A07 city IN supplier names", `SELECT COUNT(*) n FROM customers WHERE city IN (SELECT name FROM suppliers)`);
q("A08 status IN invoice statuses", `SELECT COUNT(*) n FROM orders WHERE status IN (SELECT status FROM invoices)`);
q("A09 void-invoice customers", `SELECT COUNT(DISTINCT customer_id) n FROM invoices WHERE status='void'`);
q("A10 void-club names", `SELECT name FROM customers WHERE id IN (SELECT customer_id FROM invoices WHERE status='void') ORDER BY name`);
q("A11 EU orders via IN", `SELECT COUNT(*) n FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region='EU')`);
q("A12 US orders via IN", `SELECT COUNT(*) n FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region='US')`);
q("A13 IN dup list", `SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders)`);
q("A14 shipped_at IN full list", `SELECT COUNT(*) n FROM orders WHERE shipped_at IN (SELECT shipped_at FROM orders)`);
q("A15 NOT IN collapse orders-level", `SELECT COUNT(*) n FROM orders WHERE shipped_at NOT IN (SELECT shipped_at FROM orders)`);
q("A16 guarded orders-level", `SELECT COUNT(*) n FROM orders WHERE shipped_at NOT IN (SELECT shipped_at FROM orders WHERE shipped_at IS NOT NULL)`);
q("A17 guarded customer-level", `SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE shipped_at IS NULL)`);
q("A18 IN empty subquery", `SELECT COUNT(*) n FROM customers WHERE id IN (SELECT id FROM customers WHERE 1=0)`);
q("A19 NOT IN empty subquery", `SELECT COUNT(*) n FROM customers WHERE id NOT IN (SELECT id FROM customers WHERE 1=0)`);
q("A20 HAVING-IN categories", `SELECT category, ROUND(AVG(price),2) avg_p FROM products GROUP BY category HAVING category IN (SELECT category FROM products GROUP BY category HAVING AVG(price) > (SELECT AVG(price) FROM products))`);
q("A21 expensive-club items", `SELECT COUNT(*) n FROM order_items WHERE product_id IN (SELECT id FROM products WHERE price > (SELECT AVG(price) FROM products))`);
q("A22 row-value IN literal pairs", `SELECT COUNT(*) n FROM orders WHERE (customer_id, status) IN ((1,'pending'), (2,'shipped'))`);
q("A23 row-value IN subquery pairs", `SELECT COUNT(*) n FROM orders WHERE (customer_id, status) IN (SELECT customer_id, status FROM orders WHERE total >= 1000)`);
q("A24 orders >= 1000", `SELECT COUNT(*) n FROM orders WHERE total >= 1000`);
q("A25 IN over MAX scalar", `SELECT COUNT(*) n FROM customers WHERE id IN (SELECT MAX(id) FROM customers)`);
q("A26 NOT id IN equivalent", `SELECT COUNT(*) n FROM customers WHERE NOT id IN (SELECT customer_id FROM orders WHERE status='cancelled')`);
q("A27 IN (SELECT..., 99) legality", `SELECT COUNT(*) n FROM customers WHERE id IN (SELECT id FROM customers WHERE region='EU', 99)`);
q("A28 paren scalar in value list", `SELECT COUNT(*) n FROM customers WHERE id IN ((SELECT MIN(id) FROM customers), 99)`);
q("A29 ORDER BY inside IN-subquery", `SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders ORDER BY total DESC)`);
q("A30 IN-subquery with LIMIT", `SELECT COUNT(*) n FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region='EU' LIMIT 5)`);

// ---- IN error probes ----
q("A31 2-col inner", `SELECT COUNT(*) n FROM customers WHERE id IN (SELECT id, region FROM customers)`);
q("A32 bare column in IN", `SELECT COUNT(*) n FROM customers WHERE id IN (customer_id)`);
q("A33 missing SELECT in parens", `SELECT COUNT(*) n FROM customers WHERE id IN (orders WHERE status='cancelled')`);
q("A34 missing closing paren", `SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders`);
q("A35 aggregate as bare list", `SELECT COUNT(*) n FROM customers WHERE id IN (COUNT(*))`);

// ---- scalar-set receipts ----
q("B01 zero-row scalar", `SELECT (SELECT total FROM orders WHERE id > 10000) t`);
q("B02 COUNT over empty", `SELECT (SELECT COUNT(*) FROM orders WHERE 1=0) n`);
q("B03 MAX over empty", `SELECT (SELECT MAX(total) FROM orders WHERE 1=0) m`);
q("B04 NULL bar kills all", `SELECT COUNT(*) n FROM products WHERE price > (SELECT MAX(price) FROM products WHERE 1=0)`);
q("B05 double parens", `SELECT COUNT(*) n FROM products WHERE price > ((SELECT AVG(price) FROM products))`);
q("B06 2-col scalar error", `SELECT name FROM customers WHERE id = (SELECT id, region FROM customers LIMIT 1)`);
q("B07 stamp over GROUP BY", `SELECT status, (SELECT COUNT(*) FROM customers) heads FROM orders GROUP BY status ORDER BY status`);
q("B08 stamp 16 rows 1 distinct", `SELECT COUNT(*) n, COUNT(DISTINCT (SELECT ROUND(AVG(total),2) FROM orders)) d FROM customers`);
q("B09 per-row scalar ORDER BY top3", `SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) n FROM customers c ORDER BY n DESC, c.name LIMIT 3`);
q("B10 LIMIT-1 scalar", `SELECT (SELECT customer_id FROM orders ORDER BY total DESC LIMIT 1) top_id`);
q("B11 = MAX total", `SELECT id, customer_id, total FROM orders WHERE total = (SELECT MAX(total) FROM orders)`);
q("B12 >= MAX vs > MAX", `SELECT (SELECT COUNT(*) FROM orders WHERE total >= (SELECT MAX(total) FROM orders)) ge, (SELECT COUNT(*) FROM orders WHERE total > (SELECT MAX(total) FROM orders)) gt`);
q("B13 scalar-in-HAVING VIP bar", `SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) > (SELECT SUM(total)/16 FROM orders)`);
q("B14 SUM/16 value", `SELECT ROUND(SUM(total)/16, 2) v FROM orders`);
q("B15 orders above storewide avg", `SELECT COUNT(*) n FROM orders WHERE total > (SELECT AVG(total) FROM orders)`);
q("B16 tautology correlated", `SELECT COUNT(*) n FROM orders WHERE total > (SELECT AVG(total) FROM orders WHERE customer_id = customer_id)`);
q("B17 delivered-only avg", `SELECT ROUND(AVG(total),2) v FROM orders WHERE status='delivered'`);
q("B18 EU-only avg", `SELECT ROUND(AVG(total),2) v FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region='EU')`);
q("B19 unaliased scalar header", `SELECT (SELECT ROUND(AVG(price),2) FROM products) FROM suppliers LIMIT 1`);
q("B20 alias self-reference error", `SELECT price - (SELECT AVG(price) FROM products) AS gap, 1 FROM products ORDER BY gap LIMIT 1`);
q("B21 scalar 2-col in SELECT position", `SELECT (SELECT id, region FROM customers LIMIT 1) FROM customers LIMIT 1`);
q("B22 bare AVG in WHERE error", `SELECT COUNT(*) n FROM orders WHERE total > AVG(total)`);
q("B23 typo column inside inner", `SELECT COUNT(*) n FROM orders WHERE total > (SELECT AVG(totl) FROM orders)`);
q("B24 empty parens subquery", `SELECT COUNT(*) n FROM orders WHERE total > (SELECT)`);
q("B25 pending first row", `SELECT id, customer_id, total FROM orders WHERE status='pending' LIMIT 1`);
q("B26 avg by status ordered", `SELECT status, ROUND(AVG(total),2) a FROM orders GROUP BY status ORDER BY status`);
q("B27 scalar over grouped first-row", `SELECT (SELECT ROUND(AVG(total),2) FROM orders GROUP BY status ORDER BY status) v`);
q("B28 above-avg product names", `SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products) ORDER BY price DESC`);
q("B29 pending club", `SELECT COUNT(DISTINCT customer_id) n FROM orders WHERE status='pending'`);
q("B30 cancelled club names", `SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status='cancelled') ORDER BY name`);
q("B31 EXISTS-IN parity shipped", `SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE shipped_at IS NOT NULL)`);
q("B32 join fan-out shipped", `SELECT COUNT(*) n FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.shipped_at IS NOT NULL`);
q("B33 top order counts", `SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id ORDER BY n DESC, customer_id LIMIT 4`);

console.log("--- probes done");
