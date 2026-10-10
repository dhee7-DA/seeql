/// <reference types="bun-types" />
/** Wave-2 q6 edge-consequence probes. */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.q6edge.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

let n = 0;
function probe(label: string, sql: string) {
  n++;
  try {
    console.log(`G${String(n).padStart(2, "0")} ${label}: ${JSON.stringify(db.query(sql).all())}`);
  } catch (e) {
    console.log(`G${String(n).padStart(2, "0")} ${label}: ERROR ${e instanceof Error ? e.message : e}`);
  }
}

probe("stage GROUP BY total >1000 count", "WITH s AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY total) SELECT COUNT(*) n FROM s WHERE spend > 1000");
probe("stage GROUP BY shipped_at >1000 count", "WITH s AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY shipped_at) SELECT COUNT(*) n FROM s WHERE spend > 1000");
probe("open-club customers", "SELECT COUNT(DISTINCT customer_id) n FROM invoices WHERE status = 'open'");
probe("id IN invoice customers", "SELECT COUNT(*) n FROM customers WHERE id IN (SELECT customer_id FROM invoices)");
probe("cross-join region chain", "WITH rs AS (SELECT c.region, SUM(o.total) spend FROM customers c CROSS JOIN orders o ON o.customer_id = c.id GROUP BY c.region) SELECT region, ROUND(spend,2) FROM rs ORDER BY spend DESC LIMIT 4");
probe("status-fold region chain", "WITH rs AS (SELECT c.region, SUM(o.total) spend FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY o.status) SELECT region, ROUND(spend,2) FROM rs ORDER BY spend DESC LIMIT 4");
probe("SUM bar above count", "WITH t AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id), bar AS (SELECT SUM(spend) b FROM t) SELECT COUNT(*) n FROM t, bar WHERE spend > b");
probe("MIN bar above count", "WITH t AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id), bar AS (SELECT MIN(spend) b FROM t) SELECT COUNT(*) n FROM t, bar WHERE spend > b");
probe("quantity>3 rows", "SELECT COUNT(*) n FROM order_items WHERE quantity > 3");
probe("rating > any region_avg", "WITH ra AS (SELECT region, AVG(rating) region_avg FROM suppliers GROUP BY region) SELECT COUNT(*) n FROM suppliers s JOIN ra WHERE s.rating > ra.region_avg");
probe("SUM distinct customer top3", "WITH top3 AS (SELECT * FROM orders ORDER BY total DESC LIMIT 3) SELECT SUM(DISTINCT customer_id) s FROM top3");
probe("broken stitch join-back >1000", "WITH t AS (SELECT customer_id, SUM(total) spend FROM orders GROUP BY customer_id) SELECT COUNT(*) n FROM t JOIN customers c ON c.id = c.id WHERE t.spend > 1000");
probe("travel COUNT", "SELECT COUNT(*) n FROM expenses WHERE category = 'Travel'");
probe("unused CTE outer count", "WITH unused AS (SELECT order_id FROM order_items WHERE quantity > 3) SELECT COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL");
probe("unused CTE from unused", "WITH unused AS (SELECT order_id FROM order_items WHERE quantity > 3) SELECT COUNT(*) n FROM unused");
probe("b standalone", "WITH a AS (SELECT * FROM b), b AS (SELECT 42 AS v) SELECT v FROM b");
probe("per-name region chain", "WITH rs AS (SELECT c.region, SUM(o.total) spend FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.name) SELECT region, ROUND(spend,2) FROM rs ORDER BY spend DESC LIMIT 4");
probe("ASC paid join-back", "WITH paid AS (SELECT customer_id, SUM(amount_cents)/100.0 amt FROM invoices WHERE status = 'paid' GROUP BY customer_id) SELECT c.name, ROUND(p.amt,2) paid FROM customers c JOIN paid p ON p.customer_id = c.id ORDER BY p.paid LIMIT 2");

rmSync(COPY, { force: true });
console.log(`--- ${n} probes done`);
