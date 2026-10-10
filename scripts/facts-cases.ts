// Ground-truth probe for the Foundations case-study wave (200 scenarios).
// Every figure cited in a case brief must trace to this output (or to
// scripts/facts-m1-500-out.txt, the earlier canonical sheet).
// Run: cd /home/z/my-project && bun scripts/facts-cases.ts > scripts/facts-cases-out.txt
import { db } from "../src/lib/db";
import { ensureDatabase } from "../src/lib/sample-db";

const q = async (label: string, sql: string) => {
  try {
    const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
    const slim = rows.map((r) =>
      Object.fromEntries(
        Object.entries(r).map(([k, v]) => [k, typeof v === "bigint" ? Number(v) : v]),
      ),
    );
    console.log(`## ${label}`);
    console.log(JSON.stringify(slim.slice(0, 40)));
    if (rows.length > 40) console.log(`… ${rows.length} rows total`);
  } catch (e) {
    console.log(`## ${label}\nERROR: ${(e as Error).message}`);
  }
};

async function main() {
  await ensureDatabase();

  // L3 — WHERE window facts
  await q("feb2024 orders", `SELECT COUNT(*) n FROM orders WHERE created_at LIKE '2024-02%'`);
  await q("q1 2024 orders", `SELECT COUNT(*) n FROM orders WHERE created_at BETWEEN '2024-01-01' AND '2024-03-31'`);
  await q("pending and >500", `SELECT COUNT(*) n FROM orders WHERE status = 'pending' AND total > 500`);
  await q("pending and >=500", `SELECT COUNT(*) n FROM orders WHERE status = 'pending' AND total >= 500`);
  await q("total >= 1000", `SELECT COUNT(*) n FROM orders WHERE total >= 1000`);
  await q("total > 1000", `SELECT COUNT(*) n FROM orders WHERE total > 1000`);
  await q("total >= 800", `SELECT COUNT(*) n FROM orders WHERE total >= 800`);
  await q("total NOT BETWEEN 50 AND 200", `SELECT COUNT(*) n FROM orders WHERE total NOT BETWEEN 50 AND 200`);
  await q("orders 2025 window", `SELECT COUNT(*) n FROM orders WHERE created_at >= '2025-01-01'`);
  await q("DELIVERED case trap", `SELECT COUNT(*) n FROM orders WHERE status = 'DELIVERED'`);
  await q("delivered and 2024", `SELECT COUNT(*) n FROM orders WHERE status = 'delivered' AND created_at LIKE '2024%'`);
  await q("cancelled 2025", `SELECT COUNT(*) n FROM orders WHERE status = 'cancelled' AND created_at >= '2025-01-01'`);
  await q("status in list not null", `SELECT COUNT(*) n FROM orders WHERE status IN ('delivered','shipped') AND shipped_at IS NOT NULL`);
  await q("austin or chicago", `SELECT COUNT(*) n FROM customers WHERE city = 'Austin' OR city = 'Chicago'`);
  await q("region US LATAM", `SELECT COUNT(*) n FROM customers WHERE region IN ('US','LATAM')`);
  await q("region NOT IN EU APAC", `SELECT COUNT(*) n FROM customers WHERE region NOT IN ('EU','APAC')`);
  await q("email domain sweep", `SELECT COUNT(*) n FROM customers WHERE email LIKE '%@example.com'`);

  // L4 — ORDER BY facts
  await q("cheapest 3 orders", `SELECT id, total FROM orders ORDER BY total ASC LIMIT 3`);
  await q("latest order", `SELECT id, created_at, total FROM orders ORDER BY created_at DESC LIMIT 1`);
  await q("earliest order", `SELECT id, created_at, total FROM orders ORDER BY created_at ASC LIMIT 1`);
  await q("priciest product", `SELECT id, name, price FROM products ORDER BY price DESC LIMIT 1`);
  await q("cheapest product", `SELECT id, name, price FROM products ORDER BY price ASC LIMIT 1`);
  await q("first name alpha", `SELECT id, name FROM products ORDER BY name ASC LIMIT 2`);
  await q("top rated supplier", `SELECT id, name, rating FROM suppliers ORDER BY rating DESC LIMIT 2`);
  await q("nulls first on shipped_at asc", `SELECT id, status, shipped_at FROM orders ORDER BY shipped_at ASC LIMIT 2`);
  await q("top 3 orders desc", `SELECT id, total FROM orders ORDER BY total DESC LIMIT 3`);
  await q("orders by total asc top3 (bottom-N)", `SELECT id, total FROM orders ORDER BY total LIMIT 3`);

  // L5 — DISTINCT / pagination facts
  await q("distinct status orders", `SELECT DISTINCT status FROM orders ORDER BY status`);
  await q("distinct region customers", `SELECT DISTINCT region FROM customers ORDER BY region`);
  await q("distinct category products", `SELECT DISTINCT category FROM products ORDER BY category`);
  await q("distinct quantity items", `SELECT DISTINCT quantity FROM order_items ORDER BY quantity`);
  await q("distinct city count", `SELECT COUNT(*) n FROM (SELECT DISTINCT city FROM customers)`);
  await q("distinct customer in orders", `SELECT COUNT(*) n FROM (SELECT DISTINCT customer_id FROM orders)`);
  await q("distinct region active pairs", `SELECT COUNT(*) n FROM (SELECT DISTINCT region, active FROM customers)`);
  await q("page 21 (offset 100)", `SELECT COUNT(*) n FROM (SELECT id FROM orders ORDER BY id LIMIT 5 OFFSET 100)`);
  await q("page 1 (limit 5)", `SELECT COUNT(*) n FROM (SELECT id FROM orders ORDER BY id LIMIT 5 OFFSET 0)`);
  await q("pages for 103 at 5", `SELECT CAST((COUNT(*) + 4) / 5 AS INT) pages FROM orders`);

  // L6 — aggregate facts
  await q("aggregates orders", `SELECT COUNT(*) n, ROUND(SUM(total),2) s, ROUND(AVG(total),2) a, MIN(total) mn, MAX(total) mx FROM orders`);
  await q("count variants", `SELECT COUNT(*) n_all, COUNT(shipped_at) n_ship, COUNT(DISTINCT status) n_status, COUNT(DISTINCT customer_id) n_cust FROM orders`);
  await q("aggregates products", `SELECT COUNT(*) n, ROUND(SUM(price),2) s, ROUND(AVG(price),2) a, MIN(price) mn, MAX(price) mx, SUM(stock) stock_sum FROM products`);
  await q("aggregates suppliers", `SELECT COUNT(*) n, ROUND(AVG(rating),2) a, MIN(rating) mn, MAX(rating) mx FROM suppliers`);
  await q("aggregates items", `SELECT COUNT(*) n, SUM(quantity) q, ROUND(AVG(quantity),2) a, MIN(unit_price) mn, MAX(unit_price) mx FROM order_items`);
  await q("distinct region customers n", `SELECT COUNT(DISTINCT region) n FROM customers`);
  await q("avg delivered only", `SELECT ROUND(AVG(total),2) a FROM orders WHERE status = 'delivered'`);
  await q("sum 2024", `SELECT ROUND(SUM(total),2) s FROM orders WHERE created_at LIKE '2024%'`);
  await q("avg pending", `SELECT ROUND(AVG(total),2) a FROM orders WHERE status = 'pending'`);
  await q("min max shipped", `SELECT MIN(shipped_at) mn, MAX(shipped_at) mx FROM orders`);

  // L7 — GROUP BY facts
  await q("group status", `SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY n DESC`);
  await q("group region customers", `SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY n DESC`);
  await q("group category products", `SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY n DESC`);
  await q("group supplier products", `SELECT supplier_id, COUNT(*) n FROM products GROUP BY supplier_id ORDER BY supplier_id`);
  await q("top customers by orders", `SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id ORDER BY n DESC LIMIT 5`);
  await q("group year", `SELECT substr(created_at,1,4) y, COUNT(*) n FROM orders GROUP BY substr(created_at,1,4) ORDER BY y`);
  await q("group quantity items", `SELECT quantity, COUNT(*) n FROM order_items GROUP BY quantity ORDER BY quantity`);
  await q("group month 2025", `SELECT substr(created_at,1,7) m, COUNT(*) n FROM orders WHERE created_at >= '2025-01-01' GROUP BY substr(created_at,1,7) ORDER BY m`);
  await q("avg total per status", `SELECT status, ROUND(AVG(total),2) a FROM orders GROUP BY status ORDER BY a DESC`);
  await q("sum total per status", `SELECT status, ROUND(SUM(total),2) s FROM orders GROUP BY status ORDER BY s DESC`);

  // L8 — HAVING facts
  await q("having count >= 20 (status)", `SELECT status, COUNT(*) n FROM orders GROUP BY status HAVING COUNT(*) >= 20 ORDER BY n DESC`);
  await q("having count >= 14 (status)", `SELECT status, COUNT(*) n FROM orders GROUP BY status HAVING COUNT(*) >= 14 ORDER BY n DESC`);
  await q("having count >= 3 (category)", `SELECT category, COUNT(*) n FROM products GROUP BY category HAVING COUNT(*) >= 3 ORDER BY n DESC`);
  await q("having count >= 5 (region)", `SELECT region, COUNT(*) n FROM customers GROUP BY region HAVING COUNT(*) >= 5 ORDER BY n DESC`);
  await q("having sum > 5000 (status)", `SELECT status, ROUND(SUM(total),2) s FROM orders GROUP BY status HAVING SUM(total) > 5000 ORDER BY s DESC`);
  await q("having avg > 350 (status)", `SELECT status, ROUND(AVG(total),2) a FROM orders GROUP BY status HAVING AVG(total) > 350 ORDER BY a DESC`);
  await q("having count >= 13 (customer)", `SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id HAVING COUNT(*) >= 13 ORDER BY n DESC`);
  await q("having count >= 2 (quantity)", `SELECT quantity, COUNT(*) n FROM order_items GROUP BY quantity HAVING COUNT(*) >= 2 ORDER BY quantity`);
  await q("lines per order >= 3 groups", `SELECT COUNT(*) n FROM (SELECT order_id FROM order_items GROUP BY order_id HAVING COUNT(*) >= 3)`);
  await q("lines per order = 1 groups", `SELECT COUNT(*) n FROM (SELECT order_id FROM order_items GROUP BY order_id HAVING COUNT(*) = 1)`);
  await q("having avg > 4.3 (supplier products)", `SELECT supplier_id, ROUND(AVG(price),2) a, COUNT(*) n FROM products GROUP BY supplier_id HAVING AVG(price) > 100 ORDER BY a DESC`);

  // L1/L2 spot checks
  await q("products stock > 200", `SELECT COUNT(*) n FROM products WHERE stock > 200`);
  await q("products stock > 200 price < 50", `SELECT COUNT(*) n FROM products WHERE stock > 200 AND price < 50`);
  await q("suppliers rating >= 4.4", `SELECT COUNT(*) n FROM suppliers WHERE rating >= 4.4`);
  await q("products price >= 100", `SELECT COUNT(*) n FROM products WHERE price >= 100`);
  await q("audio and stock > 100", `SELECT COUNT(*) n FROM products WHERE category = 'Audio' AND stock > 100`);
  await q("av cheap stock < 100 (parens)", `SELECT COUNT(*) n FROM products WHERE (category = 'Audio' OR category = 'Video') AND stock < 100`);
  await q("audio or video-and-cheap (no parens)", `SELECT COUNT(*) n FROM products WHERE category = 'Audio' OR category = 'Video' AND stock < 100`);
  await q("electronics pricey stocked", `SELECT COUNT(*) n FROM products WHERE category = 'Electronics' AND price > 50 AND stock > 100`);
  await q("price between 30 80", `SELECT COUNT(*) n FROM products WHERE price BETWEEN 30 AND 80`);
  await q("supplier in 1 2", `SELECT COUNT(*) n FROM products WHERE supplier_id IN (1, 2)`);
  await q("name S%", `SELECT COUNT(*) n FROM products WHERE name LIKE 'S%'`);
  await q("name %USB%", `SELECT COUNT(*) n FROM products WHERE name LIKE '%USB%'`);
  await q("name %Pro", `SELECT COUNT(*) n FROM products WHERE name LIKE '%Pro'`);
  await q("not audio", `SELECT COUNT(*) n FROM products WHERE NOT category = 'Audio'`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
