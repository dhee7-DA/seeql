// Engine capability probes + seed facts for Modules 4/5/6 (subqueries, toolkit, clinic).
// Run: bunx tsx scripts/facts-m456.ts
import { pathToFileURL } from "node:url";
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const q = async (sql: string) =>
  (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
const n = (v: unknown) => (v === null || v === undefined ? null : typeof v === "bigint" ? Number(v) : typeof v === "number" ? Math.round(v * 100) / 100 : v);

async function main() {
  const counts = await resetDatabase();
  console.log("seeded:", JSON.stringify(counts));

  /* ---------- capability probes ---------- */
  const caps: Record<string, string> = {
    cte: `WITH t(x) AS (SELECT 1) SELECT x FROM t`,
    window_rownum: `SELECT id, ROW_NUMBER() OVER (ORDER BY total DESC) AS rn FROM orders LIMIT 1`,
    window_rank: `SELECT name, RANK() OVER (ORDER BY region) AS rk, DENSE_RANK() OVER (ORDER BY region) AS drk FROM customers LIMIT 3`,
    ntile: `SELECT NTILE(4) OVER (ORDER BY total) AS q4 FROM orders LIMIT 1`,
    lag: `SELECT id, LAG(id) OVER (ORDER BY id) AS prev, LEAD(id) OVER (ORDER BY id) AS nxt FROM orders LIMIT 2`,
    frame: `SELECT id, SUM(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS m3 FROM orders LIMIT 2`,
    right_join: `SELECT COUNT(*) AS n FROM customers c RIGHT JOIN orders o ON o.customer_id = c.id`,
    full_join: `SELECT COUNT(*) AS n FROM customers c FULL OUTER JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled'`,
    gcc_ordered: `SELECT GROUP_CONCAT(status ORDER BY status) AS s FROM orders`,
    gcc_sep: `SELECT GROUP_CONCAT(status, '; ') AS s FROM orders`,
    gcc_distinct_sep: `SELECT customer_id, GROUP_CONCAT(DISTINCT status, '|') AS s FROM orders GROUP BY customer_id LIMIT 2`,
    filter_clause: `SELECT COUNT(*) FILTER (WHERE status = 'delivered') AS d, COUNT(*) FILTER (WHERE status = 'pending') AS p FROM orders`,
    strftime: `SELECT strftime('%Y-%m', created_at) AS m, COUNT(*) AS n FROM orders GROUP BY m ORDER BY m LIMIT 2`,
    date_math: `SELECT date(created_at, '+2 days') AS d FROM orders LIMIT 1`,
    julianday: `SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) AS lead FROM orders WHERE shipped_at IS NOT NULL`,
    cast: `SELECT CAST(89.99 AS INTEGER) AS a, CAST('42' AS INTEGER) AS b, CAST(2.12999 AS REAL) AS c`,
    pipes: `SELECT 'a' || '-' || 'b' AS s`,
    strfuncs: `SELECT UPPER('ab'), LOWER('AB'), LENGTH('abcd'), SUBSTR('abcd', 2, 2), TRIM('  x  '), REPLACE('a-b', '-', '+'), INSTR('alice@x', '@')`,
    nulls_last: `SELECT id FROM orders ORDER BY shipped_at NULLS LAST, id LIMIT 1`,
    values_cte: `WITH bands(lo, hi) AS (VALUES (0, 25), (25, 50)) SELECT COUNT(*) AS n FROM bands`,
  };
  console.log("\n===== CAPABILITIES =====");
  for (const [name, sql] of Object.entries(caps)) {
    try {
      const rows = await q(sql);
      console.log(`OK   ${name}: ${JSON.stringify(rows[0] ?? {}, (_, v) => (typeof v === "bigint" ? Number(v) : v))}`);
    } catch (e) {
      console.log(`FAIL ${name}: ${e instanceof Error ? e.message.split("\n")[0] : e}`);
    }
  }

  /* ---------- M4 facts: subqueries ---------- */
  const f = async (sql: string) => (await q(sql))[0];
  const m4: Record<string, unknown> = {};
  m4.avgPrice = (await f(`SELECT ROUND(AVG(price),2) AS v FROM products`)).v;
  m4.aboveAvgPrice = await q(`SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products) ORDER BY price DESC`);
  m4.avgTotal = (await f(`SELECT ROUND(AVG(total),2) AS v FROM orders`)).v;
  m4.ordersAboveAvg = (await f(`SELECT COUNT(*) AS n FROM orders WHERE total > (SELECT AVG(total) FROM orders)`)).n;
  m4.inElectronics = await q(`SELECT c.name FROM customers c WHERE c.id IN (SELECT o.customer_id FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE p.category = 'Electronics') ORDER BY c.name`);
  m4.eleAudio = await q(`SELECT c.name FROM customers c WHERE c.id IN (SELECT o.customer_id FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE p.category = 'Electronics') AND c.id IN (SELECT o.customer_id FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE p.category = 'Audio') ORDER BY c.name`);
  m4.neverOrdered = await q(`SELECT p.name FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id) ORDER BY p.name`);
  m4.idleSuppliers = await q(`SELECT s.name FROM suppliers s WHERE NOT EXISTS (SELECT 1 FROM products p JOIN order_items oi ON oi.product_id = p.id WHERE p.supplier_id = s.id) ORDER BY s.name`);
  m4.cancelledIn = await q(`SELECT c.name FROM customers c WHERE c.id IN (SELECT customer_id FROM orders WHERE status = 'cancelled') ORDER BY c.name`);
  m4.noShipped = await q(`SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped') ORDER BY c.name`);
  m4.noDelivered = await q(`SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') ORDER BY c.name`);
  m4.corrAboveOwn = (await f(`SELECT COUNT(*) AS n FROM orders o WHERE o.total > (SELECT AVG(total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`)).n;
  m4.corrSample = await q(`SELECT o.id, c.name, ROUND(o.total,2) AS total, ROUND((SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id),2) AS cust_avg FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) ORDER BY o.total DESC LIMIT 5`);
  m4.scalarSel = await q(`SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS orders FROM customers c ORDER BY orders DESC LIMIT 4`);
  m4.custAgg = await q(`SELECT c.name, COUNT(o.id) AS orders, ROUND(AVG(o.total),2) AS avg_total, ROUND(SUM(o.total),2) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY spend DESC LIMIT 6`);
  m4.deliveredCust = (await f(`SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE status = 'delivered'`)).n;
  m4.electronicsBuyers = (await f(`SELECT COUNT(DISTINCT o.customer_id) AS n FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE p.category = 'Electronics'`)).n;
  m4.bigSpendDerived = await q(`SELECT c.name, d.spend FROM customers c JOIN (SELECT customer_id, ROUND(SUM(total),2) AS spend FROM orders GROUP BY customer_id) d ON d.customer_id = c.id WHERE d.spend > 1000 ORDER BY d.spend DESC`);
  m4.cteRegion = await q(`WITH region_spend AS (SELECT c.region, ROUND(SUM(o.total),2) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region) SELECT region, spend FROM region_spend ORDER BY spend DESC`);
  console.log("\n===== M4 SUBQUERIES =====");
  console.log(JSON.stringify(m4, (_, v) => (typeof v === "bigint" ? Number(v) : v), 1));

  /* ---------- M5 facts: text, dates, windows ---------- */
  const m5: Record<string, unknown> = {};
  m5.lenStats = await f(`SELECT (SELECT MIN(LENGTH(name)) FROM customers) AS cn_min, (SELECT MAX(LENGTH(name)) FROM customers) AS cn_max, (SELECT MIN(LENGTH(name)) FROM products) AS pn_min, (SELECT MAX(LENGTH(name)) FROM products) AS pn_max, (SELECT MIN(LENGTH(email)) FROM customers) AS em_min, (SELECT MAX(LENGTH(email)) FROM customers) AS em_max`);
  m5.emailLocal = await q(`SELECT name, SUBSTR(email, 1, INSTR(email, '@') - 1) AS handle FROM customers ORDER BY id LIMIT 4`);
  m5.castDemo = await q(`SELECT name, price, CAST(price AS INTEGER) AS whole FROM products WHERE id IN (1, 2, 3, 13) ORDER BY id`);
  m5.minStock = (await f(`SELECT MIN(stock) AS v FROM products`)).v;
  m5.coalesceSample = await q(`SELECT id, status, shipped_at, COALESCE(shipped_at, 'awaiting') AS ship_label FROM orders WHERE shipped_at IS NULL ORDER BY id LIMIT 3`);
  m5.nullShip = (await f(`SELECT COUNT(*) AS n FROM orders WHERE shipped_at IS NULL`)).n;
  m5.monthBuckets = await q(`SELECT strftime('%Y-%m', created_at) AS m, COUNT(*) AS n, ROUND(SUM(total),2) AS rev FROM orders GROUP BY m ORDER BY m`);
  m5.yearSplit = await q(`SELECT strftime('%Y', created_at) AS y, COUNT(*) AS n, ROUND(SUM(total),2) AS rev FROM orders GROUP BY y ORDER BY y`);
  m5.leadDays = await f(`SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)),2) AS avg, MIN(CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER)) AS min, MAX(CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER)) AS max FROM orders WHERE shipped_at IS NOT NULL`);
  m5.weekday = await q(`SELECT strftime('%w', created_at) AS dow, COUNT(*) AS n FROM orders GROUP BY dow ORDER BY dow`);
  m5.signups = await q(`SELECT strftime('%Y-%m', created_at) AS m, COUNT(*) AS n FROM customers GROUP BY m ORDER BY m`);
  m5.rankSpend = await q(`SELECT c.name, ROUND(SUM(o.total),2) AS spend, RANK() OVER (ORDER BY SUM(o.total) DESC) AS rk FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY rk`);
  m5.regionTie = await q(`SELECT name, region, RANK() OVER (ORDER BY region) AS rk, DENSE_RANK() OVER (ORDER BY region) AS drk FROM customers ORDER BY region, name LIMIT 12`);
  m5.topOrderPerCust = await q(`SELECT * FROM (SELECT c.name, o.id AS order_id, ROUND(o.total,2) AS total, ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.total DESC, o.id) AS rn FROM orders o JOIN customers c ON c.id = o.customer_id) WHERE rn = 1 ORDER BY total DESC LIMIT 6`);
  m5.topProductPerCat = await q(`SELECT * FROM (SELECT p.category, p.name, ROUND(SUM(oi.quantity * oi.unit_price),2) AS rev, ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY SUM(oi.quantity * oi.unit_price) DESC) AS rn FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id) WHERE rn = 1 ORDER BY rev DESC`);
  m5.monthlyLag = await q(`WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon ORDER BY mon) SELECT mon, n, LAG(n) OVER (ORDER BY mon) AS prev, n - LAG(n) OVER (ORDER BY mon) AS delta FROM m ORDER BY mon`);
  m5.monthlyRun = await q(`WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS rev FROM orders GROUP BY mon ORDER BY mon) SELECT mon, rev, ROUND(SUM(rev) OVER (ORDER BY mon),2) AS running FROM m ORDER BY mon`);
  m5.ntileDemo = await q(`SELECT name, NTILE(4) OVER (ORDER BY spend DESC) AS quartile FROM (SELECT c.name, SUM(o.total) AS spend FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id) ORDER BY quartile, spend DESC`);
  m5.movingAvg = await q(`WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon ORDER BY mon) SELECT mon, n, ROUND(AVG(n) OVER (ORDER BY mon ROWS BETWEEN 2 PRECEDING AND CURRENT ROW),2) AS ma3 FROM m ORDER BY mon LIMIT 6`);
  console.log("\n===== M5 TEXT/DATES/WINDOWS =====");
  console.log(JSON.stringify(m5, (_, v) => (typeof v === "bigint" ? Number(v) : v), 1));

  /* ---------- M6 facts: concat, rollup, join shapes ---------- */
  const m6: Record<string, unknown> = {};
  m6.gccStatuses = await q(`SELECT c.name, GROUP_CONCAT(DISTINCT o.status) AS statuses FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(DISTINCT o.status) = 4 ORDER BY c.name`);
  m6.gccAllFour = (await f(`SELECT COUNT(*) AS n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(DISTINCT status) = 4)`)).n;
  m6.gccCatsPerSupplier = await q(`SELECT s.name, GROUP_CONCAT(DISTINCT p.category) AS cats FROM suppliers s JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY s.name`);
  m6.gccProductsPerCat = await q(`SELECT category, GROUP_CONCAT(name, ', ') AS names FROM (SELECT category, name FROM products ORDER BY category, name) GROUP BY category ORDER BY category`);
  m6.filterRow = await f(`SELECT COUNT(*) FILTER (WHERE status = 'delivered') AS delivered, COUNT(*) FILTER (WHERE status = 'shipped') AS shipped, COUNT(*) FILTER (WHERE status = 'pending') AS pending, COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled, COUNT(*) AS total FROM orders`);
  m6.regionStatus = await q(`SELECT c.region, SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS d, SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS s, SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS p, SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS x, COUNT(*) AS total FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY total DESC`);
  m6.monthlyRevenue = await q(`SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS rev FROM orders GROUP BY mon ORDER BY mon`);
  m6.grandRevenue = (await f(`SELECT ROUND(SUM(total),2) AS v FROM orders`)).v;
  m6.rightJoinCancelled = (await f(`SELECT COUNT(*) AS n FROM orders o RIGHT JOIN customers c ON c.id = o.customer_id AND o.status = 'cancelled'`)).n;
  m6.fullJoinCancelled = (await f(`SELECT COUNT(*) AS n FROM orders o FULL OUTER JOIN customers c ON c.id = o.customer_id AND o.status = 'cancelled'`)).n;
  m6.rightJoinSample = await q(`SELECT c.name, o.id AS order_id FROM orders o RIGHT JOIN customers c ON c.id = o.customer_id AND o.status = 'cancelled' ORDER BY c.name LIMIT 8`);
  m6.crossProducts = (await f(`SELECT COUNT(*) AS n FROM products CROSS JOIN suppliers`)).n;
  m6.bandOrders = await q(`WITH bands(lo, hi, label) AS (VALUES (0, 50, 'small'), (50, 200, 'medium'), (200, 500, 'large'), (500, 9999, 'jumbo')) SELECT b.label, COUNT(*) AS n FROM orders o JOIN bands b ON o.total >= b.lo AND o.total < b.hi GROUP BY b.label ORDER BY MIN(b.lo)`);
  m6.bandProducts = await q(`WITH bands(lo, hi, label) AS (VALUES (0, 25, 'budget'), (25, 60, 'mid'), (60, 120, 'premium'), (120, 9999, 'flagship')) SELECT b.label, COUNT(*) AS n FROM products p JOIN bands b ON p.price >= b.lo AND p.price < b.hi GROUP BY b.label ORDER BY MIN(b.lo)`);
  m6.nonEquiPairs = (await f(`SELECT COUNT(*) AS n FROM products a JOIN products b ON a.category = b.category AND a.price > b.price`)).n;
  m6.nonEquiSample = await q(`SELECT a.name AS pricier, b.name AS cheaper, ROUND(a.price - b.price, 2) AS gap FROM products a JOIN products b ON a.category = b.category AND a.price > b.price WHERE a.category = 'Audio' ORDER BY gap DESC`);
  m6.catCounts = await q(`SELECT category, COUNT(*) AS n FROM products GROUP BY category ORDER BY category`);
  console.log("\n===== M6 CONCAT/ROLLUP/JOINS =====");
  console.log(JSON.stringify(m6, (_, v) => (typeof v === "bigint" ? Number(v) : v), 1));

  await db.$disconnect();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
