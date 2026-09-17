// Scratch: verify every number cited in m03 fill "why"/notes texts.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

type Case = [label: string, sql: string];

const CASES: Case[] = [
  // lesson 17
  ["l17 statuses UNION categories (deduped)", "SELECT COUNT(*) FROM (SELECT status FROM orders UNION SELECT category FROM products)"],
  ["l17 statuses UNION ALL categories (raw)", "SELECT COUNT(*) FROM (SELECT status FROM orders UNION ALL SELECT category FROM products)"],
  ["l17 city/region stack raw", "SELECT COUNT(*) FROM (SELECT city FROM customers UNION ALL SELECT region FROM suppliers)"],
  ["l17 ORDER BY city on compound", "SELECT city FROM customers UNION ALL SELECT region FROM suppliers ORDER BY city LIMIT 3"],
  ["l17 name directory 22?", "SELECT COUNT(*) FROM (SELECT name FROM customers UNION ALL SELECT name FROM suppliers)"],
  ["l17 labeled arm2 fix", "SELECT COUNT(*) FROM (SELECT name, 'customer' AS kind FROM customers UNION ALL SELECT name, 'supplier' FROM suppliers)"],
  // lesson 18
  ["l18 kind counts", "SELECT kind, COUNT(*) AS n FROM (SELECT 'customer' AS kind FROM customers UNION ALL SELECT 'supplier' FROM suppliers) GROUP BY kind ORDER BY kind"],
  ["l18 triple pile", "SELECT COUNT(*) FROM (SELECT 'customer' AS kind FROM customers UNION ALL SELECT 'supplier' FROM suppliers UNION ALL SELECT 'product' FROM products)"],
  ["l18 supplier slice", "SELECT kind, COUNT(*) AS n FROM (SELECT 'customer' AS kind FROM customers UNION ALL SELECT 'supplier' FROM suppliers) WHERE kind = 'supplier' GROUP BY kind"],
  ["l18 top3 wrap runs", "SELECT COUNT(*) FROM (SELECT id, total, 'top' AS tag FROM (SELECT id, total FROM orders ORDER BY total DESC, id ASC LIMIT 3) UNION ALL SELECT id, total, 'bottom' FROM orders ORDER BY tag DESC, total DESC)"],
  // lesson 19
  ["l19 delivered INTERSECT cancelled", "SELECT COUNT(*) FROM (SELECT DISTINCT customer_id FROM orders WHERE status='delivered' INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status='cancelled')"],
  ["l19 both ids", "SELECT GROUP_CONCAT(customer_id) FROM (SELECT DISTINCT customer_id FROM orders WHERE status='delivered' INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status='cancelled')"],
  ["l19 cheap<50 n stocked>100", "SELECT COUNT(*) FROM (SELECT name FROM products WHERE price < 50 INTERSECT SELECT name FROM products WHERE stock > 100)"],
  ["l19 names delivered n pending", "SELECT COUNT(*) FROM (SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status='delivered') INTERSECT SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status='pending'))"],
  ["l19 NULL INTERSECT NULL", "SELECT COUNT(*) FROM (SELECT NULL INTERSECT SELECT NULL)"],
  ["l19 triple overlap", "SELECT COUNT(*) FROM (SELECT DISTINCT customer_id FROM orders WHERE status='delivered' INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status='pending' INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status='cancelled')"],
  ["l19 delivered UNION pending", "SELECT COUNT(*) FROM (SELECT DISTINCT customer_id FROM orders WHERE status='delivered' UNION SELECT DISTINCT customer_id FROM orders WHERE status='pending')"],
  // lesson 20
  ["l20 customers EXCEPT shipped", "SELECT COUNT(*) FROM (SELECT id FROM customers EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='shipped')"],
  ["l20 quiet ids", "SELECT GROUP_CONCAT(id) FROM (SELECT id FROM customers EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='shipped')"],
  ["l20 quiet top3 desc", "SELECT GROUP_CONCAT(id) FROM (SELECT id FROM customers EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='shipped' ORDER BY id DESC LIMIT 3)"],
  ["l20 >100 EXCEPT audio", "SELECT COUNT(*) FROM (SELECT name FROM products WHERE price > 100 EXCEPT SELECT name FROM products WHERE category = 'Audio')"],
  ["l20 delivered EXCEPT cancelled", "SELECT COUNT(*) FROM (SELECT DISTINCT customer_id FROM orders WHERE status='delivered' EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='cancelled')"],
  ["l20 cancelled EXCEPT delivered", "SELECT COUNT(*) FROM (SELECT DISTINCT customer_id FROM orders WHERE status='cancelled' EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status='delivered')"],
  ["l20 A EXCEPT A", "SELECT COUNT(*) FROM (SELECT status FROM orders EXCEPT SELECT status FROM orders)"],
  // lesson 21
  ["l21 (A u B) n C", "SELECT COUNT(*) FROM (SELECT * FROM (SELECT DISTINCT customer_id AS v FROM orders WHERE status='delivered' UNION SELECT DISTINCT customer_id AS v FROM orders WHERE status='cancelled') INTERSECT SELECT DISTINCT customer_id AS v FROM orders WHERE status='pending')"],
  ["l21 suppliers ALL suppliers UNION customers", "SELECT COUNT(*) FROM (SELECT region FROM suppliers UNION ALL SELECT region FROM suppliers UNION SELECT region FROM customers)"],
  ["l21 4 regions wrap count", "SELECT COUNT(*) FROM (SELECT region FROM customers UNION SELECT region FROM suppliers)"],
  ["l21 delivered EXCEPT cancelled UNION ALL pending distinct", "SELECT COUNT(*) FROM (SELECT v FROM (SELECT DISTINCT customer_id AS v FROM orders WHERE status='delivered' EXCEPT SELECT DISTINCT customer_id AS v FROM orders WHERE status='cancelled') UNION ALL SELECT DISTINCT customer_id AS v FROM orders WHERE status='pending')"],
  ["l21 statuses+regions distinct", "SELECT COUNT(*) FROM (SELECT status AS value FROM orders UNION SELECT region AS value FROM suppliers UNION SELECT region FROM customers)"],
  ["l21 top3 alphabetical", "SELECT GROUP_CONCAT(value) FROM (SELECT status AS value FROM orders UNION SELECT region AS value FROM suppliers UNION SELECT region FROM customers ORDER BY value LIMIT 3)"],
  // lesson 22
  ["l22 cancelled count / non-cancelled", "SELECT SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END), COUNT(*) FROM orders"],
  ["l22 unlabeled count", "SELECT COUNT(*) FROM (SELECT CASE WHEN status='cancelled' THEN 'dead' END AS tag FROM orders) WHERE tag IS NULL"],
  ["l22 closed buckets", "SELECT CASE status WHEN 'delivered' THEN 1 WHEN 'shipped' THEN 1 ELSE 0 END AS closed, COUNT(*) AS n FROM orders GROUP BY closed ORDER BY closed"],
  ["l22 IS NULL ship_band runs", "SELECT COUNT(*) FROM orders WHERE shipped_at IS NULL"],
  // lesson 23
  ["l23 KPI", "SELECT COUNT(*) AS all_orders, SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) AS delivered, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending FROM orders"],
  ["l23 shipped total", "SELECT SUM(CASE WHEN status='shipped' THEN 1 ELSE 0 END) FROM orders"],
  ["l23 COUNT with ELSE 0", "SELECT COUNT(CASE WHEN status='pending' THEN 1 ELSE 0 END) FROM orders"],
  ["l23 delivered pct", "SELECT ROUND(AVG(CASE WHEN status='delivered' THEN 1.0 ELSE 0 END) * 100, 1) FROM orders"],
  ["l23 pending share pct", "SELECT ROUND(SUM(CASE WHEN status='pending' THEN 1.0 ELSE 0 END) * 100 / COUNT(*), 1) FROM orders"],
  // lesson 37
  ["l37 in_flight/complete", "SELECT label, n FROM (SELECT 'in_flight' AS label, COUNT(*) AS n FROM orders WHERE status IN ('pending','shipped') UNION ALL SELECT 'complete', COUNT(*) FROM orders WHERE status='delivered') ORDER BY label"],
  ["l37 alice/emma categories", "SELECT COUNT(*) FROM (SELECT DISTINCT p.category FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id JOIN customers c ON c.id=o.customer_id WHERE c.name='Alice Chen')"],
  ["l37 alice INTERSECT emma", "SELECT COUNT(*) FROM (SELECT DISTINCT p.category FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id JOIN customers c ON c.id=o.customer_id WHERE c.name='Alice Chen' INTERSECT SELECT DISTINCT p.category FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id JOIN customers c ON c.id=o.customer_id WHERE c.name='Emma Wilson')"],
  ["l37 value census", "SELECT ROUND(SUM(CASE WHEN status='delivered' THEN total ELSE 0 END),2) AS d, ROUND(SUM(CASE WHEN status='shipped' THEN total ELSE 0 END),2) AS s, ROUND(SUM(CASE WHEN status='pending' THEN total ELSE 0 END),2) AS p, ROUND(SUM(CASE WHEN status='cancelled' THEN total ELSE 0 END),2) AS c, ROUND(SUM(total),2) AS t FROM orders"],
  ["l19 names delivered UNION pending", "SELECT COUNT(*) FROM (SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status='delivered') UNION SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status='pending'))"],
  ["l20 >100 EXCEPT audio names", "SELECT name FROM (SELECT name FROM products WHERE price > 100 EXCEPT SELECT name FROM products WHERE category='Audio') ORDER BY name"],
  ["l22 ship_band unshipped count", "SELECT COUNT(*) FROM orders WHERE shipped_at IS NULL"],
  ["l37 tiers", "SELECT tier, COUNT(*) AS customers FROM (SELECT CASE WHEN SUM(o.total) >= 3000 THEN 'high' WHEN SUM(o.total) >= 1000 THEN 'mid' ELSE 'low' END AS tier FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id) GROUP BY tier ORDER BY customers DESC, tier"],
];

async function main() {
  await resetDatabase();
  const seen = (v: unknown): string =>
    JSON.stringify(v, (_k, x) => (typeof x === "bigint" ? Number(x) : x));
  for (const [label, sql] of CASES) {
    try {
      const rows = (await db.$queryRawUnsafe(sql)) as unknown[];
      console.log(`OK  ${label}  =>  ${seen(rows)}`);
    } catch (e) {
      console.log(`ERR ${label}  =>  ${(e as Error).message.split("\n")[0]}`);
    }
  }
  process.exit(0);
}
main();
