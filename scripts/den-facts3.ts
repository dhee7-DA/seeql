// Facts for den-flat-3 batch: four q-family companion figures (L25/26/27/28).
import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "../src/lib/sample-db";
const db = new PrismaClient({ log: [] });
const q = async (label: string, sql: string) => {
  try {
    const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
    console.log(`${label}: ${JSON.stringify(JSON.parse(JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : v))))}`);
  } catch (e) {
    console.log(`${label}: ERROR ${(e as Error).message.split("\n")[0]}`);
  }
};
async function main() {
  await resetDatabase();

  // -- L25 q1b-inside-out: run the inner query alone, dupes harmless -------
  await q("io.cancelled-raw", `SELECT customer_id FROM orders WHERE status = 'cancelled' ORDER BY customer_id`);
  await q("io.cancelled-distinct", `SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled' ORDER BY customer_id`);
  await q("io.electronics", `SELECT COUNT(DISTINCT c.id) AS n FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE p.category = 'Electronics'`);

  // -- L26 q2b-short-circuit: EXISTS stops at the first match --------------
  await q("sc.per-cust", `SELECT c.name, COUNT(o.id) AS total, MIN(CASE WHEN o.status = 'shipped' THEN o.id END) AS first_shipped FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY c.id`);
  await q("sc.has-shipped", `SELECT COUNT(DISTINCT customer_id) AS n FROM orders WHERE status = 'shipped'`);
  await q("sc.sum-positions", `SELECT SUM(total_orders) AS sum_all, SUM(first_shipped_rank) AS sum_stops FROM (
    SELECT c.id, COUNT(o.id) AS total_orders, (SELECT COUNT(*) FROM orders o2 WHERE o2.customer_id = c.id AND o2.id <= (SELECT MIN(o3.id) FROM orders o3 WHERE o3.customer_id = c.id AND o3.status = 'shipped')) AS first_shipped_rank FROM customers c JOIN orders o ON o.customer_id = c.id WHERE EXISTS (SELECT 1 FROM orders o4 WHERE o4.customer_id = c.id AND o4.status = 'shipped') GROUP BY c.id
  )`);

  // -- L27 q3b-fanout-tax: join-then-group inflation -----------------------
  await q("tax.true-rev", `SELECT ROUND(SUM(total), 2) AS v FROM orders`);
  await q("tax.joined-rev", `SELECT ROUND(SUM(o.total), 2) AS v FROM orders o JOIN order_items oi ON oi.order_id = o.id`);
  await q("tax.joined-rows", `SELECT COUNT(*) AS n FROM orders o JOIN order_items oi ON oi.order_id = o.id`);
  await q("tax.items-per-order", `SELECT MAX(n) AS mx, MIN(n) AS mn, ROUND(AVG(n), 2) AS avg FROM (SELECT order_id, COUNT(*) AS n FROM order_items GROUP BY order_id)`);

  // -- L28 q4b-cte-scope: forward-only chain, runnable alone ---------------
  await q("scope.spend", `SELECT COUNT(*) AS n FROM (SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id)`);
  await q("scope.big", `SELECT c.name, b.s FROM (SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id) b JOIN customers c ON c.id = b.customer_id WHERE b.s > 2000 ORDER BY b.s DESC`);

  await db.$disconnect();
}
main();
