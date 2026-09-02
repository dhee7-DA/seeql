// Second fact harvest for Modules 7-8 content.
// Run: bunx tsx scripts/facts-m78b.ts

import { pathToFileURL } from "node:url";
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const q = async (sql: string) =>
  (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;

async function main() {
  await resetDatabase();
  const f: Record<string, unknown> = {};

  f.categoryRevenue = await q(
    `SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
     FROM order_items oi JOIN products p ON p.id = oi.product_id
     GROUP BY p.category ORDER BY revenue DESC`);
  f.cancelledItems = await q(
    `SELECT COUNT(*) AS n FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE status='cancelled')`);
  f.cancelledItemsDistinct = await q(
    `SELECT COUNT(DISTINCT order_id) AS n FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE status='cancelled')`);
  f.product9Items = await q(
    `SELECT COUNT(*) AS n FROM order_items WHERE product_id = 9`);
  f.zeroOrderCustomers = await q(
    `SELECT id, name, active FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`);
  f.monthlyRevenue = await q(
    `SELECT substr(created_at, 1, 7) AS month, ROUND(SUM(total), 2) AS revenue, COUNT(*) AS n
     FROM orders GROUP BY month ORDER BY month`);
  f.inactiveWithOrders = await q(
    `SELECT c.id, c.name, COUNT(o.id) AS n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
     WHERE c.active = 0 GROUP BY c.id`);
  f.emailsDistinct = await q(`SELECT COUNT(DISTINCT email) AS n FROM customers`);
  f.miceAndKeyboard = await q(`SELECT id, name, price, stock, supplier_id FROM products WHERE id IN (1, 2)`);
  f.wearables = await q(`SELECT id, name, price FROM products WHERE category = 'Wearables' ORDER BY id`);
  f.apparel = await q(`SELECT id, name, supplier_id FROM products WHERE category = 'Apparel' ORDER BY id`);
  f.customer3 = await q(`SELECT id, name FROM customers WHERE id = 3`);

  const J = (v: unknown) => JSON.stringify(v, (_, x) => (typeof x === "bigint" ? Number(x) : x));
  console.log(J(f));
  await db.$disconnect();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
