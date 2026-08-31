// Seed sanity check: reset the sample DB, print counts and dirt statistics.

import { resetDatabase, ensureDatabase } from "../src/lib/sample-db";
import { db } from "../src/lib/db";

async function main() {
  const counts = await resetDatabase();
  console.log("counts:", counts);

  const q = async (label: string, sql: string) => {
    const res = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
    console.log(label, JSON.stringify(res[0] ?? res, (_k, v) => (typeof v === "bigint" ? Number(v) : v)));
  };

  await q("null emails      :", `SELECT COUNT(*) AS n FROM customers WHERE email IS NULL`);
  await q("invalid emails   :", `SELECT COUNT(*) AS n FROM customers WHERE email IS NOT NULL AND email NOT LIKE '%_@_%._%'`);
  await q("orphan orders    :", `SELECT COUNT(*) AS n FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE o.customer_id IS NOT NULL AND c.id IS NULL`);
  await q("null customer_id :", `SELECT COUNT(*) AS n FROM orders WHERE customer_id IS NULL`);
  await q("orphan items     :", `SELECT SUM(CASE WHEN order_id IS NOT NULL AND o.id IS NULL THEN 1 ELSE 0 END) AS orphan_order, SUM(CASE WHEN product_id IS NOT NULL AND p.id IS NULL THEN 1 ELSE 0 END) AS orphan_product FROM order_items i LEFT JOIN orders o ON o.id = i.order_id LEFT JOIN products p ON p.id = i.product_id`);
  await q("impossible dates :", `SELECT COUNT(*) AS n FROM customers WHERE signup_date IS NOT NULL AND date(signup_date) IS NULL`);
  await q("future reviews   :", `SELECT COUNT(*) AS n FROM reviews WHERE review_date IS NOT NULL AND date(review_date) > date('now')`);
  await q("status variants  :", `SELECT COUNT(DISTINCT status) AS n FROM orders`);
  await q("category variants:", `SELECT COUNT(DISTINCT category) AS n FROM products`);
  await q("discount >1      :", `SELECT COUNT(*) AS n FROM order_items WHERE discount IS NOT NULL AND discount > 1`);
  await q("neg totals       :", `SELECT COUNT(*) AS n FROM orders WHERE total_amount IS NOT NULL AND total_amount < 0`);
  await q("join-agg sample  :", `SELECT c.full_name, o.status, COUNT(*) AS order_count, SUM(o.total_amount) AS revenue FROM customers c INNER JOIN orders o ON o.customer_id = c.id WHERE o.order_date >= '2024-06-01' GROUP BY c.full_name, o.status HAVING COUNT(*) > 3 ORDER BY revenue DESC LIMIT 3`);
  await q("never ordered    :", `SELECT COUNT(*) AS n FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL`);
  await q("revenue by month :", `SELECT COUNT(*) AS months FROM (SELECT strftime('%Y-%m', order_date) m FROM orders WHERE order_date IS NOT NULL GROUP BY m)`);
  await ensureDatabase();
  process.exit(0);
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
