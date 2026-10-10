// Fact batch 2 for Task 21 case studies. Run: bun scripts/facts-t21b.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const q = async (sql: string) =>
  (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
const one = async (sql: string) => (await q(sql))[0];

async function main() {
  await resetDatabase();
  const F: Record<string, unknown> = {};

  F.regionActive = await q(`SELECT region, SUM(active) AS act, COUNT(*) AS n FROM customers GROUP BY region ORDER BY n DESC`);
  F.euActive = await one(`SELECT COUNT(*) AS n FROM customers WHERE region = 'EU' AND active = 1`);
  F.under50 = await one(`SELECT COUNT(*) AS n FROM products WHERE price < 50`);
  F.catCounts = await q(`SELECT category, COUNT(*) AS n FROM products GROUP BY category HAVING COUNT(*) > 2 ORDER BY category`);
  F.top5price = await q(`SELECT name, price FROM products ORDER BY price DESC, name LIMIT 5`);
  F.aliceCats = await q(`SELECT DISTINCT p.category FROM orders o JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Alice Chen' ORDER BY 1`);
  F.emmaCats = await q(`SELECT DISTINCT p.category FROM orders o JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Emma Wilson' ORDER BY 1`);
  F.aliceEmmaInter = await q(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT p.category FROM orders o JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Alice Chen'
    INTERSECT SELECT DISTINCT p.category FROM orders o JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Emma Wilson')`);
  F.aliceEmmaDiff = await q(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT p.category FROM orders o JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Alice Chen'
    EXCEPT SELECT DISTINCT p.category FROM orders o JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Emma Wilson')`);
  F.pendingCustomers = await one(`SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE status = 'pending'`);
  F.aboveOwnAvgCusts = await q(`SELECT c.name, COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id
    WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)
    GROUP BY c.id ORDER BY n DESC, c.name LIMIT 4`);
  F.aboveOwnAvgCustCount = await one(`SELECT COUNT(DISTINCT customer_id) AS n FROM orders o
    WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`);
  F.avgCustSpend = await one(`SELECT ROUND(AVG(s), 2) AS avg_spend, COUNT(*) AS n_above FROM
    (SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id) WHERE s >
    (SELECT AVG(s2) FROM (SELECT SUM(total) AS s2 FROM orders GROUP BY customer_id))`);
  F.custSpendAvgOnly = await one(`SELECT ROUND(AVG(s), 2) AS v FROM (SELECT SUM(total) AS s FROM orders GROUP BY customer_id)`);
  F.gccRegions = await q(`SELECT GROUP_CONCAT(DISTINCT region ORDER BY region) AS regions FROM suppliers`);
  F.gccProducts = await q(`SELECT ROUND(SUM(total), 2) AS grand FROM orders`);
  F.topCatProduct = await q(`SELECT category, pname FROM (
    SELECT p.category, p.name AS pname, ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY SUM(oi.quantity * oi.unit_price) DESC) AS rn
    FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id) WHERE rn = 1 ORDER BY category`);
  F.monthlyRevenue = await q(`SELECT strftime('%Y-%m', created_at) AS m, ROUND(SUM(total), 2) AS rev,
    ROUND(SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS running
    FROM orders GROUP BY m ORDER BY m LIMIT 3`);
  F.inFlight = await one(`SELECT COUNT(*) AS n FROM orders WHERE status IN ('pending', 'shipped')`);
  F.statusCustomOrder = await q(`SELECT status, COUNT(*) AS n FROM orders GROUP BY status
    ORDER BY CASE status WHEN 'pending' THEN 1 WHEN 'shipped' THEN 2 WHEN 'delivered' THEN 3 ELSE 4 END`);
  F.supplierRegionPairs = await one(`SELECT COUNT(*) AS n FROM suppliers CROSS JOIN (SELECT DISTINCT region FROM customers)`);
  F.distinctRegionsSuppliers = await q(`SELECT DISTINCT region FROM suppliers ORDER BY region`);
  F.aliceTopSpend = await q(`SELECT o.id, o.total FROM orders o WHERE o.customer_id = 1 ORDER BY o.total DESC LIMIT 1`);

  console.log(JSON.stringify(F, (_k, v) => (typeof v === "bigint" ? Number(v) : v), 1));
  await db.$disconnect();
}
main();
