// One-off fact collection for Module 2 (Joins) prose + diagrams.
// Run: bunx tsx scripts/facts-m2.ts
import { pathToFileURL } from "node:url";
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const q = async (sql: string) =>
  (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;

async function main() {
  const counts = await resetDatabase();
  console.log("seeded:", counts);

  const out: Record<string, unknown> = {};

  // anti-join candidates
  out.customersNoOrders = await q(
    `SELECT c.id, c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`,
  );
  out.productsNeverOrdered = await q(
    `SELECT p.id, p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL`,
  );
  out.suppliersNoOrders = await q(
    `SELECT s.id, s.name FROM suppliers s
     JOIN products p ON p.supplier_id = s.id
     LEFT JOIN order_items oi ON oi.product_id = p.id
     GROUP BY s.id HAVING COUNT(oi.id) = 0`,
  );
  out.ordersNoItems = await q(
    `SELECT o.id FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id WHERE oi.id IS NULL`,
  );

  // INNER JOIN sanity + sizes
  out.distinctOrderingCustomers = await q(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT customer_id FROM orders)`);
  out.orderedProducts = await q(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT product_id FROM order_items)`);
  out.orderItemsJoined = await q(
    `SELECT COUNT(*) AS n FROM order_items oi JOIN products p ON p.id = oi.product_id`,
  );
  out.maxItemsPerOrder = await q(
    `SELECT order_id, COUNT(*) AS n FROM order_items GROUP BY order_id ORDER BY n DESC LIMIT 3`,
  );

  // three-table chain examples
  out.chainSample = await q(
    `SELECT oi.id, c.name AS customer, p.name AS product, oi.quantity, oi.unit_price
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN customers c ON c.id = o.customer_id
     JOIN products p ON p.id = oi.product_id
     ORDER BY oi.id LIMIT 5`,
  );
  out.categoryRevenue = await q(
    `SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
     FROM order_items oi JOIN products p ON p.id = oi.product_id
     GROUP BY p.category ORDER BY revenue DESC`,
  );
  out.topCustomersBySpend = await q(
    `SELECT c.name, ROUND(SUM(o.total), 2) AS spend, COUNT(o.id) AS orders
     FROM customers c JOIN orders o ON o.customer_id = c.id
     GROUP BY c.id ORDER BY spend DESC LIMIT 6`,
  );

  // LEFT JOIN + zero trap
  out.ordersPerCustomerLeft = await q(
    `SELECT c.name, COUNT(o.id) AS orders
     FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
     GROUP BY c.id ORDER BY orders ASC, c.name LIMIT 8`,
  );
  out.countStarTrap = await q(
    `SELECT COUNT(*) AS star, COUNT(o.id) AS oid FROM customers c LEFT JOIN orders o ON o.customer_id = c.id`,
  );

  // self-join: same-region customer pairs
  out.regionPairs = await q(
    `SELECT c1.name AS a, c2.name AS b, c1.region
     FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id
     ORDER BY c1.region, a LIMIT 40`,
  );
  out.regionPairsCount = await q(
    `SELECT COUNT(*) AS n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id`,
  );

  // fan-out trap numbers
  out.trueRevenue = await q(`SELECT ROUND(SUM(total), 2) AS v FROM orders`);
  out.fanoutRevenue = await q(
    `SELECT ROUND(SUM(o.total), 2) AS v FROM orders o JOIN order_items oi ON oi.order_id = o.id`,
  );
  out.itemsCount = await q(`SELECT COUNT(*) AS n FROM order_items`);
  out.avgOrderTotal = await q(`SELECT ROUND(AVG(total), 2) AS v FROM orders`);

  // Berlin + delivered join example for lesson 9 prose
  out.deliveredBerlin = await q(
    `SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id
     WHERE c.city = 'Berlin' AND o.status = 'delivered' ORDER BY o.id`,
  );
  out.euSupplierProducts = await q(
    `SELECT p.name, s.name AS supplier, p.price FROM products p
     JOIN suppliers s ON s.id = p.supplier_id
     WHERE s.region = 'EU' ORDER BY p.price DESC`,
  );

  console.log(JSON.stringify(out, (k, v) => (typeof v === "bigint" ? Number(v) : v), 2));
  await db.$disconnect();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
