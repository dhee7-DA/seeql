// Task 54 fact probe — receipts for the straggler top-up banks
// (LIKE & wildcards, AND/OR/NOT, COALESCE, HAVING, GROUP_CONCAT).
// Run: npx tsx scripts/m8b-facts.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return (await db.$queryRawUnsafe(sql)) as T[];
}

async function main() {
  const counts = await resetDatabase();
  console.log("seeded:", counts, "\n");

  console.log("== LIKE receipts ==");
  console.log("Keyboard%:", await q(`SELECT name, price FROM products WHERE name LIKE '%Keyboard%'`));
  console.log("_SB%:", await q(`SELECT name, price FROM products WHERE name LIKE '_SB%'`));
  console.log("Pro%:", await q(`SELECT name FROM products WHERE name LIKE 'Pro%'`));
  console.log("%Lite:", await q(`SELECT name FROM products WHERE name LIKE '%Lite'`));
  console.log("%Pro%:", await q(`SELECT COUNT(*) n FROM products WHERE name LIKE '%Pro%'`));
  console.log("NOT LIKE %Pro%:", await q(`SELECT COUNT(*) n FROM products WHERE name NOT LIKE '%Pro%'`));
  console.log("case-insens:", await q(`SELECT COUNT(*) a, (SELECT COUNT(*) FROM products WHERE name LIKE 'KEYBOARD%') b FROM products WHERE name LIKE '%keyboard%'`));
  console.log("%e_ (2nd-last e):", await q(`SELECT name FROM products WHERE name LIKE '%e_'`));
  console.log("email LIKE %.com:", await q(`SELECT COUNT(*) n FROM customers WHERE email LIKE '%.com'`));
  console.log("email NOT gmail/outlook:", await q(`SELECT COUNT(*) n FROM customers WHERE email NOT LIKE '%gmail%' AND email NOT LIKE '%outlook%'`));
  console.log("city _a%:", await q(`SELECT DISTINCT city FROM customers WHERE city LIKE '_a%' ORDER BY city`));
  console.log("%er son:", await q(`SELECT name FROM customers WHERE name LIKE '%son'`));
  console.log("LIKE with underscore literal:", await q(`SELECT COUNT(*) n FROM products WHERE name LIKE '%\_%' ESCAPE '\\'`));
  console.log("last char digit:", await q(`SELECT name FROM products WHERE name LIKE '%' || '7'`));
  console.log("categories LIKE %s%:", await q(`SELECT DISTINCT category FROM products WHERE category LIKE '%s%' ORDER BY category`));
  console.log("name 4+ words:", await q(`SELECT name FROM products WHERE name LIKE '% % %' ORDER BY name`));

  console.log("\n== AND / OR / NOT receipts ==");
  console.log("price>100 AND stock<40:", await q(`SELECT name, price, stock FROM products WHERE price > 100 AND stock < 40`));
  console.log("price<30 OR price>120:", await q(`SELECT COUNT(*) n FROM products WHERE price < 30 OR price > 120`));
  console.log("NOT (price<30 OR price>120):", await q(`SELECT COUNT(*) n FROM products WHERE NOT (price < 30 OR price > 120)`));
  console.log("BETWEEN 30..120:", await q(`SELECT COUNT(*) n FROM products WHERE price BETWEEN 30 AND 120`));
  console.log("precedence a OR b AND c:", await q(`SELECT COUNT(*) n FROM products WHERE category = 'Audio' OR category = 'Accessories' AND price < 50`));
  console.log("parens (a OR b) AND c:", await q(`SELECT COUNT(*) n FROM products WHERE (category = 'Audio' OR category = 'Accessories') AND price < 50`));
  console.log("region IN (EU,US) AND active:", await q(`SELECT COUNT(*) n FROM customers WHERE region IN ('EU','US') AND active = 1`));
  console.log("NOT IN (EU,US):", await q(`SELECT COUNT(*) n FROM customers WHERE region NOT IN ('EU','US')`));
  console.log("NOT IN with NULL list:", await q(`SELECT COUNT(*) n FROM customers WHERE region NOT IN ('EU','US',NULL)`));
  console.log("status delivered AND total>300:", await q(`SELECT COUNT(*) n FROM orders WHERE status = 'delivered' AND total > 300`));
  console.log("pending OR cancelled:", await q(`SELECT COUNT(*) n FROM orders WHERE status = 'pending' OR status = 'cancelled'`));
  console.log("NOT delivered:", await q(`SELECT COUNT(*) n FROM orders WHERE NOT status = 'delivered'`));
  console.log("shipped_at IS NULL AND delivered? none:", await q(`SELECT COUNT(*) n FROM orders WHERE status = 'delivered' AND shipped_at IS NULL`));
  console.log("NOT (active=1):", await q(`SELECT name FROM customers WHERE NOT active = 1 ORDER BY id`));
  console.log("three-valued: NOT (shipped_at = 'x'):", await q(`SELECT COUNT(*) n FROM orders WHERE NOT (shipped_at = 'x')`));
  console.log("three-valued: shipped_at != 'x':", await q(`SELECT COUNT(*) n FROM orders WHERE shipped_at != 'x'`));
  console.log("boolean OR NULL:", await q(`SELECT COUNT(*) n FROM orders WHERE status = 'delivered' OR shipped_at = 'x'`));

  console.log("\n== COALESCE receipts ==");
  console.log("COALESCE(shipped_at,'in pipeline'):", await q(`SELECT status, COUNT(*) n FROM orders GROUP BY status, COALESCE(shipped_at,'in pipeline') ORDER BY status LIMIT 8`));
  console.log("COALESCE count distinct:", await q(`SELECT COUNT(*) n FROM orders WHERE COALESCE(shipped_at,'none') = 'none'`));
  console.log("shipped_at IS NULL by status:", await q(`SELECT status, COUNT(*) n FROM orders WHERE shipped_at IS NULL GROUP BY status ORDER BY status`));
  console.log("COALESCE on all-NULL col:", await q(`SELECT COALESCE(NULL, NULL, 7) v`));
  console.log("NULLIF(0,0):", await q(`SELECT NULLIF(0, 0) a, NULLIF(5, 0) b`));
  console.log("avg rating coalesce:", await q(`SELECT ROUND(AVG(COALESCE(rating, 0)), 2) avg FROM suppliers`));
  console.log("IFNULL:", await q(`SELECT IFNULL(NULL, 'x') v`));
  console.log("COALESCE(total,0) sum:", await q(`SELECT ROUND(SUM(COALESCE(total, 0)), 2) s FROM orders WHERE status = 'pending'`));

  console.log("\n== HAVING receipts ==");
  console.log("customers per region HAVING >=5:", await q(`SELECT region, COUNT(*) n FROM customers GROUP BY region HAVING COUNT(*) >= 5 ORDER BY n DESC`));
  console.log("categories with >1 product:", await q(`SELECT category, COUNT(*) n FROM products GROUP BY category HAVING COUNT(*) > 1 ORDER BY n DESC, category`));
  console.log("avg price > 80:", await q(`SELECT category, ROUND(AVG(price),2) avg_price FROM products GROUP BY category HAVING AVG(price) > 80 ORDER BY avg_price DESC`));
  console.log("suppliers products >= 3:", await q(`SELECT s.name, COUNT(*) n FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id HAVING COUNT(*) >= 3 ORDER BY n DESC`));
  console.log("HAVING on SUM:", await q(`SELECT customer_id, ROUND(SUM(total),2) spend FROM orders GROUP BY customer_id HAVING SUM(total) > 1500 ORDER BY spend DESC`));
  console.log("HAVING COUNT(*) = 1 regions:", await q(`SELECT region FROM customers GROUP BY region HAVING COUNT(*) = 1`));

  console.log("\n== GROUP_CONCAT receipts ==");
  console.log("regions list:", await q(`SELECT GROUP_CONCAT(DISTINCT region) regions FROM customers`));
  console.log("per-category names:", await q(`SELECT category, GROUP_CONCAT(name) names FROM products GROUP BY category ORDER BY category`));
  console.log("per-category names sorted:", await q(`SELECT category, GROUP_CONCAT(name) names FROM (SELECT category, name FROM products ORDER BY category, name) GROUP BY category ORDER BY category`));
  console.log("status list with counts:", await q(`SELECT status || ': ' || COUNT(*) FROM orders GROUP BY status ORDER BY COUNT(*) DESC`));
  console.log("separator custom:", await q(`SELECT GROUP_CONCAT(region, ' | ') regs FROM (SELECT DISTINCT region FROM customers ORDER BY region)`));
  console.log("group_concat length:", await q(`SELECT LENGTH(GROUP_CONCAT(name)) len FROM products`));
  console.log("customer order-status fold:", await q(`SELECT customer_id, GROUP_CONCAT(DISTINCT status) statuses FROM orders GROUP BY customer_id ORDER BY customer_id LIMIT 6`));
}

main().catch((e) => { console.error(e); process.exit(1); });
