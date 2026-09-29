// M1 Gauntlet fact probe — engine receipts for authoring the Module-1
// gauntlet banks (MCQ predict items, case walkthroughs, problem solutions).
// Run: npx tsx scripts/m1-gauntlet-facts.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return (await db.$queryRawUnsafe(sql)) as T[];
}
async function one(sql: string): Promise<Record<string, unknown>> {
  const rows = await q(sql);
  return rows[0] ?? {};
}
const n = (v: unknown) => Math.round(Number(v) * 100) / 100;

async function main() {
  const counts = await resetDatabase();
  console.log("seeded:", counts, "\n");

  console.log("== volumes ==");
  console.log(await one(`SELECT (SELECT COUNT(*) FROM customers) c, (SELECT COUNT(*) FROM products) p, (SELECT COUNT(*) FROM orders) o, (SELECT COUNT(*) FROM order_items) oi, (SELECT COUNT(*) FROM suppliers) s`));

  console.log("\n== products ==");
  console.log("categories:", await q(`SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY category`));
  console.log("price:", await one(`SELECT ROUND(MIN(price),2) mn, ROUND(MAX(price),2) mx, ROUND(AVG(price),2) avg FROM products`));
  console.log("price>100:", await one(`SELECT COUNT(*) n FROM products WHERE price > 100`));
  console.log("price>=30 <=60:", await one(`SELECT COUNT(*) n FROM products WHERE price BETWEEN 30 AND 60`));
  console.log("stock=0:", await one(`SELECT COUNT(*) n FROM products WHERE stock = 0`));
  console.log("stock<15:", await one(`SELECT COUNT(*) n FROM products WHERE stock < 15`));
  console.log("LIKE Keyboard:", await q(`SELECT name, price FROM products WHERE name LIKE '%Keyboard%'`));
  console.log("LIKE Pro%:", await q(`SELECT name FROM products WHERE name LIKE 'Pro%'`));
  console.log("LIKE %Lite:", await q(`SELECT name FROM products WHERE name LIKE '%Lite'`));
  console.log("LIKE _SB%", await q(`SELECT name FROM products WHERE name LIKE '_SB%'`));
  console.log("top5 price:", await q(`SELECT name, price FROM products ORDER BY price DESC, id ASC LIMIT 5`));
  console.log("bottom3 price:", await q(`SELECT name, price FROM products ORDER BY price ASC, id ASC LIMIT 3`));
  console.log("category IN Audio,Accessories:", await one(`SELECT COUNT(*) n FROM products WHERE category IN ('Audio','Accessories')`));
  console.log("NOT IN:", await one(`SELECT COUNT(*) n FROM products WHERE category NOT IN ('Audio','Accessories')`));
  console.log("cheaper than 30 or over 120:", await one(`SELECT COUNT(*) n FROM products WHERE price < 30 OR price > 120`));
  console.log("NOT LIKE %Pro%:", await one(`SELECT COUNT(*) n FROM products WHERE name NOT LIKE '%Pro%'`));
  console.log("by category avg:", await q(`SELECT category, COUNT(*) n, ROUND(AVG(price),2) avg_price FROM products GROUP BY category ORDER BY category`));
  console.log("having avg>60:", await q(`SELECT category, ROUND(AVG(price),2) avg_price FROM products GROUP BY category HAVING AVG(price) > 60 ORDER BY category`));
  console.log("having n>=6:", await q(`SELECT category, COUNT(*) n FROM products GROUP BY category HAVING COUNT(*) >= 6 ORDER BY category`));
  console.log("group_concat cats:", await one(`SELECT GROUP_CONCAT(category) g FROM (SELECT DISTINCT category FROM products ORDER BY category)`));
  console.log("stock sum by cat:", await q(`SELECT category, SUM(stock) s FROM products GROUP BY category ORDER BY s DESC`));

  console.log("\n== customers ==");
  console.log("regions:", await q(`SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY region`));
  console.log("distinct cities:", await one(`SELECT COUNT(DISTINCT city) n FROM customers`));
  console.log("distinct city,region:", await one(`SELECT COUNT(*) n FROM (SELECT DISTINCT city, region FROM customers)`));
  console.log("inactive:", await one(`SELECT COUNT(*) n FROM customers WHERE active = 0`));
  console.log("gmail:", await one(`SELECT COUNT(*) n FROM customers WHERE email LIKE '%@gmail.com'`));
  console.log("A% names:", await q(`SELECT name FROM customers WHERE name LIKE 'A%' ORDER BY name`));
  console.log("created min/max:", await one(`SELECT MIN(created_at) mn, MAX(created_at) mx FROM customers`));
  console.log("2024 signups:", await one(`SELECT COUNT(*) n FROM customers WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'`));
  console.log("region NOT EU:", await one(`SELECT COUNT(*) n FROM customers WHERE region NOT IN ('EU')`));
  console.log("EU+NA:", await one(`SELECT COUNT(*) n FROM customers WHERE region IN ('EU','NA')`));
  console.log("name LIKE %a%:", await one(`SELECT COUNT(*) n FROM customers WHERE name LIKE '%a%'`));
  console.log("active=1 regions:", await q(`SELECT region, COUNT(*) n FROM customers WHERE active = 1 GROUP BY region ORDER BY region`));

  console.log("\n== orders ==");
  console.log("status:", await q(`SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY status`));
  console.log("shipped NULL:", await one(`SELECT COUNT(*) n FROM orders WHERE shipped_at IS NULL`));
  console.log("shipped NOT NULL:", await one(`SELECT COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL`));
  console.log("total stats:", await one(`SELECT ROUND(MIN(total),2) mn, ROUND(MAX(total),2) mx, ROUND(AVG(total),2) avg, ROUND(SUM(total),2) sum FROM orders`));
  console.log("total>200:", await one(`SELECT COUNT(*) n FROM orders WHERE total > 200`));
  console.log("total>=100 <=200:", await one(`SELECT COUNT(*) n FROM orders WHERE total BETWEEN 100 AND 200`));
  console.log("march delivered:", await one(`SELECT COUNT(*) n FROM orders WHERE status = 'delivered' AND created_at BETWEEN '2024-03-01' AND '2024-03-31'`));
  console.log("top3 total:", await q(`SELECT id, total FROM orders ORDER BY total DESC, id ASC LIMIT 3`));
  console.log("top5 total:", await q(`SELECT id, customer_id, total FROM orders ORDER BY total DESC, id ASC LIMIT 5`));
  console.log("distinct cust:", await one(`SELECT COUNT(DISTINCT customer_id) n FROM orders`));
  console.log("distinct status:", await one(`SELECT COUNT(DISTINCT status) n FROM orders`));
  console.log("pending+shipped:", await one(`SELECT COUNT(*) n FROM orders WHERE status IN ('pending','shipped')`));
  console.log("2024 Q1:", await one(`SELECT COUNT(*) n FROM orders WHERE created_at >= '2024-01-01' AND created_at < '2024-04-01'`));
  console.log("per-status sums:", await q(`SELECT status, COUNT(*) n, ROUND(SUM(total),2) revenue FROM orders GROUP BY status ORDER BY status`));
  console.log("having n>30:", await q(`SELECT status, COUNT(*) n FROM orders GROUP BY status HAVING COUNT(*) > 30 ORDER BY status`));
  console.log("cust spend top3:", await q(`SELECT customer_id, ROUND(SUM(total),2) spend, COUNT(*) orders FROM orders GROUP BY customer_id ORDER BY spend DESC, customer_id ASC LIMIT 3`));
  console.log("jan orders:", await one(`SELECT COUNT(*) n FROM orders WHERE created_at LIKE '2024-01%'`));
  console.log("avg items per order:", await one(`SELECT ROUND(AVG(n),2) avg FROM (SELECT COUNT(*) n FROM order_items GROUP BY order_id)`));
  console.log("cancelled total:", await one(`SELECT COUNT(*) n, ROUND(COALESCE(SUM(total),0),2) lost FROM orders WHERE status = 'cancelled'`));

  console.log("\n== NULL + COALESCE ==");
  console.log("coalesce ship:", await one(`SELECT COUNT(*) n FROM orders WHERE COALESCE(shipped_at, '1970-01-01') = '1970-01-01'`));
  console.log("NULLIF x:", await one(`SELECT COUNT(*) n FROM orders WHERE NULLIF(status, 'delivered') IS NULL`));
  console.log("avg shipped days-sample:", await one(`SELECT COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL AND status = 'delivered'`));
  console.log("ifnull demo:", await q(`SELECT id, total, COALESCE(shipped_at, 'not shipped') ship FROM orders WHERE shipped_at IS NULL ORDER BY id LIMIT 3`));

  console.log("\n== order_items ==");
  console.log("qty stats:", await one(`SELECT COUNT(*) n, SUM(quantity) sq, ROUND(AVG(quantity),2) aq, MAX(quantity) mx FROM order_items`));
  console.log("qty>=3:", await one(`SELECT COUNT(*) n FROM order_items WHERE quantity >= 3`));
  console.log("distinct products sold:", await one(`SELECT COUNT(DISTINCT product_id) n FROM order_items`));

  console.log("\n== ORDER BY edge facts ==");
  console.log("top3 by total asc:", await q(`SELECT id, total FROM orders ORDER BY total ASC, id ASC LIMIT 3`));
  console.log("products price desc name asc top4:", await q(`SELECT name, price FROM products ORDER BY price DESC, name ASC LIMIT 4`));
  console.log("orders limit offset 3 totals:", await q(`SELECT id, total FROM orders ORDER BY total DESC, id ASC LIMIT 3 OFFSET 3`));
  console.log("distinct regions only:", await q(`SELECT DISTINCT region FROM customers ORDER BY region`));
  console.log("distinct statuses:", await q(`SELECT DISTINCT status FROM orders ORDER BY status`));

  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
