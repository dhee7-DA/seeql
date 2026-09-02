// Fact harvest for Task 21 — verify every number used in new MCQs / case studies.
// Run: bun scripts/facts-t21.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const q = async (sql: string) =>
  (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
const one = async (sql: string) => (await q(sql))[0];

async function main() {
  await resetDatabase();
  const F: Record<string, unknown> = {};

  /* ---- text function facts (L29 MCQs) ---- */
  F.prodNameLen = await one(`SELECT MIN(LENGTH(name)) AS minL, MAX(LENGTH(name)) AS maxL FROM products`);
  F.longestProducts = await q(`SELECT name, LENGTH(name) AS L FROM products ORDER BY L DESC, name LIMIT 3`);
  F.custNameLen = await one(`SELECT MIN(LENGTH(name)) AS minL, MAX(LENGTH(name)) AS maxL FROM customers`);
  F.longestCustomer = await q(`SELECT name, LENGTH(name) AS L FROM customers ORDER BY L DESC, name LIMIT 2`);
  F.atPositions = await q(`SELECT name, INSTR(email, '@') AS at FROM customers ORDER BY id LIMIT 4`);
  F.domains = await q(`SELECT DISTINCT SUBSTR(email, INSTR(email, '@') + 1) AS domain FROM customers`);
  F.lowerCities = await q(`SELECT DISTINCT LOWER(city) AS lc FROM customers ORDER BY lc`);
  F.upperRegionStable = await one(`SELECT COUNT(*) AS n FROM customers WHERE UPPER(region) = region`);
  F.trimNeeded = await one(`SELECT SUM(name != TRIM(name)) AS padded FROM customers`);
  F.castAvgPrice = await one(`SELECT CAST(AVG(price) AS INTEGER) AS trunc, ROUND(AVG(price), 2) AS rounded FROM products`);
  F.castMaxPrice = await one(`SELECT name, price, CAST(price AS INTEGER) AS whole FROM products ORDER BY price DESC LIMIT 1`);
  F.castStockSum = await one(`SELECT SUM(CAST(price * 100 AS INTEGER)) AS cents_sum FROM products`);
  F.concatSample = await q(`SELECT name || ' — ' || city || ' (' || region || ')' AS tag FROM customers ORDER BY id LIMIT 2`);
  F.priceBandCounts = await q(`SELECT CASE WHEN price < 50 THEN 'under50' WHEN price < 100 THEN 'mid' ELSE 'over100' END AS band, COUNT(*) AS n FROM products GROUP BY band`);

  /* ---- date facts (L30 MCQs) ---- */
  F.orderSpan = await one(`SELECT MIN(created_at) AS first, MAX(created_at) AS last,
    CAST(julianday(MAX(created_at)) - julianday(MIN(created_at)) AS INTEGER) AS days FROM orders`);
  F.signupSpan = await one(`SELECT MIN(created_at) AS first, MAX(created_at) AS last FROM customers`);
  F.monthBuckets = await q(`SELECT strftime('%Y-%m', created_at) AS m, COUNT(*) AS n FROM orders GROUP BY m ORDER BY m`);
  F.shipDelay = await one(`SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) AS avg_days,
    COUNT(*) AS shipped_n FROM orders WHERE shipped_at IS NOT NULL`);
  F.maxDelay = await q(`SELECT id, julianday(shipped_at) - julianday(created_at) AS days FROM orders
    WHERE shipped_at IS NOT NULL ORDER BY days DESC LIMIT 2`);
  F.nullShipped = await one(`SELECT COUNT(*) AS n FROM orders WHERE shipped_at IS NULL`);

  /* ---- case-study facts ---- */
  F.zeroOrderCustomers = await one(`SELECT COUNT(*) AS n FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`);
  F.inactive = await q(`SELECT name FROM customers WHERE active = 0`);
  F.noDelivered = await q(`SELECT c.name FROM customers c WHERE NOT EXISTS
    (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')`);
  F.noShipped = await q(`SELECT c.name FROM customers c WHERE NOT EXISTS
    (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped') ORDER BY c.name`);
  F.statusCounts = await q(`SELECT status, COUNT(*) AS n, ROUND(SUM(total), 2) AS value FROM orders GROUP BY status ORDER BY n DESC`);
  F.regionCustomers = await q(`SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY n DESC`);
  F.categoryRevenue = await q(`SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS rev
    FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category ORDER BY rev DESC`);
  F.spendTop3 = await q(`SELECT c.name, ROUND(SUM(o.total), 2) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id
    GROUP BY c.id ORDER BY spend DESC LIMIT 3`);
  F.spendBottom = await q(`SELECT c.name, ROUND(SUM(o.total), 2) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id
    GROUP BY c.id ORDER BY spend ASC, c.name LIMIT 2`);
  F.aboveOwnAvg = await one(`SELECT COUNT(*) AS n FROM orders o WHERE o.total >
    (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`);
  F.allFourStatuses = await q(`SELECT c.name FROM customers c JOIN orders o ON o.customer_id = c.id
    GROUP BY c.id HAVING COUNT(DISTINCT o.status) = 4 ORDER BY c.name`);
  F.ntile4 = await q(`SELECT ntile, COUNT(*) AS n FROM
    (SELECT NTILE(4) OVER (ORDER BY total) AS ntile FROM orders) GROUP BY ntile ORDER BY ntile`);
  F.apacRank = await q(`SELECT name, region, ROW_NUMBER() OVER (ORDER BY orders_n DESC) AS rn,
    RANK() OVER (ORDER BY orders_n DESC) AS rk, DENSE_RANK() OVER (ORDER BY orders_n DESC) AS drk FROM
    (SELECT c.name, c.region, COUNT(o.id) AS orders_n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id)
    WHERE region = 'APAC' ORDER BY rn`);
  F.ordersPerCustomer = await q(`SELECT COUNT(*) AS custs, SUM(CASE WHEN n >= 5 THEN 1 ELSE 0 END) AS five_plus FROM
    (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`);
  F.avgOrdersPerCustomer = await one(`SELECT ROUND(AVG(n), 2) AS avg_n FROM
    (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`);

  /* ---- join variant facts (L34 / L14 MCQs) ---- */
  F.rightCancelledRows = await one(`SELECT COUNT(*) AS n FROM orders o RIGHT JOIN customers c
    ON c.id = o.customer_id AND o.status = 'cancelled'`);
  F.fullCancelledRows = await one(`SELECT COUNT(*) AS n FROM order_items oi FULL OUTER JOIN orders o ON o.id = oi.order_id
    JOIN customers c ON c.id = o.customer_id AND o.status = 'cancelled'`);
  F.crossProductsSuppliers = await one(`SELECT COUNT(*) AS n FROM products CROSS JOIN suppliers`);
  F.bands = await q(`SELECT band, COUNT(*) AS n FROM (SELECT o.id, CASE WHEN o.total < 100 THEN 'a_under100'
    WHEN o.total < 300 THEN 'b_100_300' WHEN o.total < 600 THEN 'c_300_600' ELSE 'd_600plus' END AS band
    FROM orders o) GROUP BY band ORDER BY band`);
  F.selfPairsRegion = await one(`SELECT COUNT(*) AS n FROM customers a JOIN customers b ON a.region = b.region AND a.id < b.id`);
  F.selfPairsCity = await one(`SELECT COUNT(*) AS n FROM customers a JOIN customers b ON a.city = b.city AND a.id < b.id`);
  F.cityDupes = await q(`SELECT city, COUNT(*) AS n FROM customers GROUP BY city HAVING COUNT(*) > 1 ORDER BY n DESC`);

  /* ---- supplier / stock facts ---- */
  F.ratingRange = await one(`SELECT MIN(rating) AS lo, MAX(rating) AS hi, ROUND(AVG(rating), 2) AS avg FROM suppliers`);
  F.stockTotal = await one(`SELECT SUM(stock) AS total, MAX(stock) AS mx FROM products`);
  F.maxStockProduct = await q(`SELECT name, stock FROM products ORDER BY stock DESC LIMIT 1`);

  /* ---- misc anchors ---- */
  F.inEuUs = await one(`SELECT COUNT(*) AS n FROM customers WHERE region IN ('EU', 'US')`);
  F.citiesCount = await one(`SELECT COUNT(DISTINCT city) AS n FROM customers`);
  F.deliveredSum = await one(`SELECT ROUND(SUM(total), 2) AS v FROM orders WHERE status = 'delivered'`);
  F.cancelledSum = await one(`SELECT ROUND(SUM(total), 2) AS v FROM orders WHERE status = 'cancelled'`);
  F.gccAlphabetical = await q(`SELECT c.name, GROUP_CONCAT(DISTINCT o.status) AS statuses FROM customers c
    JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(DISTINCT o.status) = 4`);
  F.electronicsSpend = await one(`SELECT ROUND(SUM(oi.quantity * oi.unit_price), 2) AS v FROM order_items oi
    JOIN products p ON p.id = oi.product_id WHERE p.category = 'Electronics'`);
  F.audioSpend = await one(`SELECT ROUND(SUM(oi.quantity * oi.unit_price), 2) AS v FROM order_items oi
    JOIN products p ON p.id = oi.product_id WHERE p.category = 'Audio'`);
  F.lagExample = await q(`SELECT order_date, prev_date, CAST(julianday(order_date) - julianday(prev_date) AS REAL) AS gap FROM
    (SELECT strftime('%Y-%m-%d', created_at) AS order_date,
       LAG(strftime('%Y-%m-%d', created_at)) OVER (ORDER BY created_at, id) AS prev_date
     FROM orders WHERE customer_id = 1 ORDER BY created_at, id) LIMIT 6`);

  console.log(JSON.stringify(F, (_k, v) => (typeof v === "bigint" ? Number(v) : v), 1));
  await db.$disconnect();
}
main();
