import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "../src/lib/sample-db";
const db = new PrismaClient({ log: [] });
const q = async (label: string, sql: string) => {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  console.log(`${label}: ${JSON.stringify(JSON.parse(JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : v))))}`);
};
async function main() {
  await resetDatabase();
  await q("liam.orders", `SELECT id, status, total FROM orders WHERE customer_id = 12`);
  await q("pending.per-product", `
    SELECT p.id, p.name, COUNT(DISTINCT o.id) AS pending_orders
    FROM products p
    JOIN order_items oi ON oi.product_id = p.id
    JOIN orders o ON o.id = oi.order_id AND o.status = 'pending'
    WHERE p.id IN (1, 2, 4, 5) GROUP BY p.id ORDER BY p.id`);
  await db.$disconnect();
}
main();
