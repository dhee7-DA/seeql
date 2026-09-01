// Task 16 (more visualizations) — canonical facts for the 23 new figures.
// Run: bunx tsx scripts/facts-viz.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const q = async (sql: string) =>
  (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
const one = async (sql: string) => (await q(sql))[0];

async function main() {
  await resetDatabase();
  const F: Record<string, unknown> = {};

  /* row counts */
  F.counts = await one(`SELECT
    (SELECT COUNT(*) FROM customers) AS customers,
    (SELECT COUNT(*) FROM suppliers) AS suppliers,
    (SELECT COUNT(*) FROM products) AS products,
    (SELECT COUNT(*) FROM orders) AS orders,
    (SELECT COUNT(*) FROM order_items) AS order_items`);

  /* l2 — per-row expressions: real product rows */
  F.exprRows = await q(`SELECT name, price, ROUND(price * 0.85, 2) AS sale
    FROM products WHERE id IN (1, 4, 9) ORDER BY id`);

  /* l3 — LIKE matching on real names */
  F.likeKeyboard = await q(`SELECT name FROM products WHERE name LIKE '%headset%' OR name LIKE '%keyboard%'`);
  F.likeCase = await q(`SELECT COUNT(*) AS n FROM products WHERE name LIKE '%HEADSET%'`);

  /* l4 — NULL spread */
  F.nullCounts = await one(`SELECT COUNT(*) AS all_rows, COUNT(shipped_at) AS with_ship,
    COUNT(DISTINCT customer_id) AS customers, COUNT(DISTINCT status) AS statuses FROM orders`);
  F.nullMath = await q(`SELECT id, total, total * 1.0, shipped_at FROM orders WHERE id IN (1, 2, 3)`);
  F.nullPendingCancelled = await one(`SELECT
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled FROM orders`);

  /* l5 — multi-key sort sample */
  F.multiSort = await q(`SELECT c.region, o.total, c.name FROM orders o
    JOIN customers c ON c.id = o.customer_id
    ORDER BY c.region ASC, o.total DESC LIMIT 6`);

  /* l6 — DISTINCT mechanics */
  F.distinctRegions = await q(`SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY region`);
  F.distinctStatusCities = await one(`SELECT
    (SELECT COUNT(*) FROM (SELECT DISTINCT status FROM orders)) AS statuses,
    (SELECT COUNT(*) FROM (SELECT DISTINCT city FROM customers)) AS cities,
    (SELECT COUNT(*) FROM (SELECT DISTINCT region, city FROM customers)) AS region_city`);

  /* l7 — aggregates */
  F.agg = await one(`SELECT COUNT(*) AS n, SUM(total) AS sum_total,
    ROUND(AVG(total), 2) AS avg_total, MIN(total) AS min_total, MAX(total) AS max_total FROM orders`);

  /* l9 — FK walk sample: one real order + its customer */
  F.fkSample = await q(`SELECT o.id, o.customer_id, c.name, c.city, o.total
    FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.id IN (1, 2)`);

  /* l10 — cartesian */
  F.cartesian = await one(`SELECT (SELECT COUNT(*) FROM orders) * (SELECT COUNT(*) FROM customers) AS product`);

  /* l11 — chain funnel: customers → orders → order_items */
  F.chain = await one(`SELECT
    (SELECT COUNT(*) FROM customers) AS a,
    (SELECT COUNT(*) FROM orders) AS b,
    (SELECT COUNT(*) FROM order_items) AS c`);

  /* l12 — WHERE vs ON placement (pending filter) */
  F.whereVsOn = await one(`SELECT
    (SELECT COUNT(*) FROM orders o LEFT JOIN customers c ON c.id = o.customer_id AND c.region = 'EU') AS in_on,
    (SELECT COUNT(*) FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU') AS in_where`);
  F.euOrders = await one(`SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU'`);

  /* l13 — products never ordered */
  F.neverOrdered = await q(`SELECT p.name FROM products p
    WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id)`);
  F.neverOrderedN = await one(`SELECT COUNT(*) AS n FROM products p
    WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id)`);

  /* l14 — self-join pairs (same region, both sides ordered) */
  F.selfPairsN = await one(`SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2
    ON c1.region = c2.region AND c1.id < c2.id`);
  F.selfPairsSample = await q(`SELECT c1.name AS a, c2.name AS b, c1.region
    FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id
    ORDER BY c1.region, c1.id LIMIT 8`);

  /* l15/16 — fanout: joined rows, per-order line counts */
  F.joinedRows = await one(`SELECT COUNT(*) AS joined FROM orders o JOIN order_items oi ON oi.order_id = o.id`);
  F.maxLines = await one(`SELECT MAX(n) AS max_lines FROM (SELECT COUNT(*) AS n FROM order_items GROUP BY order_id)`);
  F.fanoutSum = await one(`SELECT
    (SELECT ROUND(SUM(total), 2) FROM orders) AS honest,
    (SELECT ROUND(SUM(o.total), 2) FROM orders o JOIN order_items oi ON oi.order_id = o.id) AS inflated`);
  F.fanoutCount = await one(`SELECT
    (SELECT COUNT(DISTINCT o.id) FROM orders o JOIN order_items oi ON oi.order_id = o.id) AS distinct_orders,
    (SELECT COUNT(*) FROM orders o JOIN order_items oi ON oi.order_id = o.id) AS joined_rows`);

  /* l17 — UNION vs UNION ALL */
  F.unionStatus = await one(`SELECT
    (SELECT COUNT(*) FROM (SELECT status FROM orders UNION ALL SELECT status FROM orders)) AS all_n,
    (SELECT COUNT(*) FROM (SELECT status FROM orders UNION SELECT status FROM orders)) AS uniq_n`);

  /* l18 — two-arm label stack (status counts + supplier regions) */
  F.armStatus = await q(`SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY n DESC`);
  F.armSuppliers = await q(`SELECT region, COUNT(*) AS n FROM suppliers GROUP BY region ORDER BY n DESC`);

  /* l19 — INTERSECT: regions present in both customers and suppliers */
  F.intersectRegions = await q(`SELECT region FROM customers INTERSECT SELECT region FROM suppliers ORDER BY region`);
  F.onlyCustomers = await q(`SELECT region FROM customers EXCEPT SELECT region FROM suppliers ORDER BY region`);

  /* l20 — EXCEPT: customers with no delivered order */
  F.exceptNoDelivered = await one(`SELECT COUNT(*) AS n FROM (
    SELECT customer_id FROM orders
    EXCEPT
    SELECT customer_id FROM orders WHERE status = 'delivered')`);

  /* l21 — precedence: statuses mini sets */
  F.statusList = await q(`SELECT DISTINCT status FROM orders ORDER BY status`);

  /* l22 — CASE routing */
  F.statusCounts = await q(`SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY n DESC`);

  /* l23 — pivot matrix region × (delivered, shipped) */
  F.pivot = await q(`SELECT c.region,
    SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
    SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS shipped,
    COUNT(*) AS total
    FROM orders o JOIN customers c ON c.id = o.customer_id
    GROUP BY c.region ORDER BY c.region`);

  /* l24 — two-stage tiering (customer lifetime value) */
  F.tiers = await q(`SELECT tier, COUNT(*) AS n, ROUND(SUM(value), 2) AS value FROM (
    SELECT customer_id, SUM(total) AS value,
      CASE WHEN SUM(total) >= 3000 THEN 'high' WHEN SUM(total) >= 1000 THEN 'mid' ELSE 'low' END AS tier
    FROM orders GROUP BY customer_id)
  GROUP BY tier ORDER BY value DESC`);

  console.log(JSON.stringify(F, (_, v) => (typeof v === "bigint" ? Number(v) : v), 2));
  await db.$disconnect();
}
main();
