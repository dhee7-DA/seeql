/// <reference types="bun-types" />
/** Wave-2 q5 edge-consequence probes (distractor outcomes + hard-case figures). */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.q5edge.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

let n = 0;
function probe(label: string, sql: string) {
  n++;
  try {
    console.log(`E${String(n).padStart(2, "0")} ${label}: ${JSON.stringify(db.query(sql).all())}`);
  } catch (e) {
    console.log(`E${String(n).padStart(2, "0")} ${label}: ERROR ${e instanceof Error ? e.message : e}`);
  }
}

probe("stage GROUP BY total rows", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY total)");
probe("stage GROUP BY shipped_at rows", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY shipped_at)");
probe("expenses GROUP BY vendor top1", "SELECT category, ROUND(total,2) FROM (SELECT category, SUM(amount_cents)/100.0 total FROM expenses GROUP BY vendor) e ORDER BY total DESC LIMIT 1");
probe("expenses AVG per category top1", "SELECT category, ROUND(total,2) FROM (SELECT category, AVG(amount_cents)/100.0 total FROM expenses GROUP BY category) e ORDER BY total DESC LIMIT 1");
probe("suppliers cross-join rating>anyavg", "SELECT COUNT(*) n FROM suppliers s JOIN (SELECT region, AVG(rating) region_avg FROM suppliers GROUP BY region) ra WHERE s.rating > ra.region_avg");
probe("products cross-join price>catavg", "SELECT COUNT(*) n FROM products p JOIN (SELECT category, AVG(price) avg_price FROM products GROUP BY category) ca WHERE p.price > ca.avg_price");
probe("top3 orders by id desc", "SELECT id, total FROM (SELECT * FROM orders ORDER BY id DESC LIMIT 3) t ORDER BY id");
probe("top3 orders by quantity? via order_items join", "SELECT o.id, o.total FROM (SELECT order_id, SUM(quantity) q FROM order_items GROUP BY order_id ORDER BY q DESC LIMIT 3) t JOIN orders o ON o.id = t.order_id ORDER BY o.id");
probe("HAVING count>1 categories", "SELECT category FROM (SELECT category, AVG(price) a, COUNT(*) n FROM products GROUP BY category HAVING COUNT(*) > 1) x");
probe("premium in multi-product cats", "SELECT COUNT(*) n FROM products p JOIN (SELECT category, AVG(price) a, COUNT(*) n FROM products GROUP BY category HAVING COUNT(*) > 1) ca ON ca.category = p.category WHERE p.price > ca.a");
probe("per-region top customer spend", "SELECT region, ROUND(MAX(spend),2) top FROM (SELECT c.region region, c.name, SUM(o.total) spend FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.region, c.name) t GROUP BY region ORDER BY top DESC");
probe("delivered+shipped stage >2000", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders WHERE status IN ('delivered','shipped') GROUP BY customer_id) s WHERE spend > 2000");
probe("delivered+shipped stage >2500", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders WHERE status IN ('delivered','shipped') GROUP BY customer_id) s WHERE spend > 2500");
probe("bottom5 spenders", "SELECT c.name, ROUND(s.spend,2) spend FROM customers c JOIN (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) s ON s.customer_id = c.id ORDER BY s.spend LIMIT 5");
probe("invoices open stage top2", "SELECT c.name, ROUND(p.paid,2) FROM customers c JOIN (SELECT customer_id, SUM(amount_cents)/100.0 paid FROM invoices WHERE status = 'open' GROUP BY customer_id) p ON p.customer_id = c.id ORDER BY p.paid DESC LIMIT 2");
probe("spend < 3000 count", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) t WHERE spend < 3000");
probe("spend > 338.19 count", "SELECT COUNT(*) n FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) t WHERE spend > 338.19");
probe("top3 by created_at desc", "SELECT id, total FROM (SELECT * FROM orders ORDER BY created_at DESC LIMIT 3) t ORDER BY id");
probe("stage alias s vs missing", "SELECT COUNT(*) FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id)");
probe("AVG over stage vs SUM", "SELECT ROUND(SUM(spend),2) FROM (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id)");

rmSync(COPY, { force: true });
console.log(`--- ${n} edge probes done`);
