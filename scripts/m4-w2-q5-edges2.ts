/// <reference types="bun-types" />
/** Wave-2 q5 second edge batch (distractor outcomes that must differ). */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.q5edge2.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

let n = 0;
function probe(label: string, sql: string) {
  n++;
  try {
    console.log(`F${String(n).padStart(2, "0")} ${label}: ${JSON.stringify(db.query(sql).all())}`);
  } catch (e) {
    console.log(`F${String(n).padStart(2, "0")} ${label}: ERROR ${e instanceof Error ? e.message : e}`);
  }
}

probe("shipped-only stage >2000", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders WHERE status = 'shipped' GROUP BY customer_id) s WHERE spend > 2000");
probe("cancelled stage >2000", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders WHERE status IN ('cancelled') GROUP BY customer_id) s WHERE spend > 2000");
probe("premium sum", "SELECT ROUND(SUM(p.price), 2) s FROM products p JOIN (SELECT category, AVG(price) avg_price FROM products GROUP BY category) ca ON ca.category = p.category WHERE p.price > ca.avg_price");
probe("premium avg", "SELECT ROUND(AVG(p.price), 2) s FROM products p JOIN (SELECT category, AVG(price) avg_price FROM products GROUP BY category) ca ON ca.category = p.category WHERE p.price > ca.avg_price");
probe("HAVING count>2 cats", "SELECT COUNT(*) n FROM (SELECT category, AVG(price) a FROM products GROUP BY category HAVING COUNT(*) > 2) x");
probe("suppliers beat-region count", "SELECT COUNT(*) n FROM suppliers s JOIN (SELECT region, AVG(rating) region_avg FROM suppliers GROUP BY region) ra ON ra.region = s.region WHERE s.rating > ra.region_avg");
probe("cs952 broken stitch", "SELECT COUNT(*) n FROM customers c JOIN (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) s ON c.id = c.id");
probe("distinct vendors", "SELECT COUNT(DISTINCT vendor) n FROM expenses");
probe("COUNT(total) per-customer min", "SELECT MIN(spend) FROM (SELECT COUNT(total) spend FROM orders GROUP BY customer_id)");
probe("COUNT-total stage >1000", "SELECT COUNT(*) n FROM (SELECT customer_id, COUNT(total) spend FROM orders GROUP BY customer_id) s WHERE spend > 1000");
probe("cs963 per-customer rows", "SELECT COUNT(*) n FROM (SELECT c.region, c.name, SUM(o.total) spend FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.region, c.name) t GROUP BY t.name");
probe("cs963 city version error", "SELECT region FROM (SELECT c.city, c.name, SUM(o.total) spend FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.city, c.name) t GROUP BY region");
probe("invoices COUNT per cust top2", "SELECT c.name, p.paid FROM customers c JOIN (SELECT customer_id, COUNT(*) paid FROM invoices WHERE status = 'paid' GROUP BY customer_id) p ON p.customer_id = c.id ORDER BY p.paid DESC LIMIT 2");
probe("spend != 3000 count", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) t WHERE spend <> 3000");
probe("spend < 500 count", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) t WHERE spend < 500");
probe("spend between 500 and 1000", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) t WHERE spend BETWEEN 500 AND 1000");
probe("shipped stage where-clause order err", "SELECT customer_id, SUM(total) spend FROM orders ORDER BY total WHERE status = 'shipped' GROUP BY customer_id");
probe("inner name instead of category err", "SELECT COUNT(*) n FROM products p JOIN (SELECT name, AVG(price) avg_price FROM products GROUP BY name) ca ON ca.category = p.category WHERE p.price > ca.avg_price");
probe("AVG per customer stage avg", "SELECT ROUND(AVG(spend),2) FROM (SELECT customer_id, AVG(total) spend FROM orders GROUP BY customer_id)");
probe("COUNT as outer over stage", "SELECT COUNT(spend) FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id)");

rmSync(COPY, { force: true });
console.log(`--- ${n} probes done`);
