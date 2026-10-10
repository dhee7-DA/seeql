import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "../src/lib/sample-db";
const db = new PrismaClient({ log: [] });
const q = async (label: string, sql: string) => {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  console.log(`${label}: ${JSON.stringify(JSON.parse(JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : v))))}`);
};
async function main() {
  await resetDatabase();
  await q("products.total", `SELECT COUNT(*) AS n FROM products`);
  await q("pending.orders", `SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'`);
  await q("products.in-pending", `
    SELECT COUNT(DISTINCT oi.product_id) AS n FROM order_items oi
    JOIN orders o ON o.id = oi.order_id WHERE o.status = 'pending'`);
  await q("products.never-pending", `
    SELECT p.id, p.name, p.category FROM products p
    WHERE NOT EXISTS (
      SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE oi.product_id = p.id AND o.status = 'pending')
    ORDER BY p.id`);
  await q("products.in-pending.names", `
    SELECT DISTINCT p.id, p.name FROM order_items oi
    JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id
    WHERE o.status = 'pending' ORDER BY p.id`);
  await db.$disconnect();
}
main();
