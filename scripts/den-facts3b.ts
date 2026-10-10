import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "/home/z/my-project/src/lib/sample-db";
const db = new PrismaClient({ log: [] });
const q = async (label: string, sql: string) => {
  try {
    const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
    console.log(`${label}: ${JSON.stringify(JSON.parse(JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : v))))}`);
  } catch (e) { console.log(`${label}: ERROR ${(e as Error).message.split("\n")[0]}`); }
};
async function main() {
  await resetDatabase();
  await q("electronics", `SELECT COUNT(DISTINCT o.customer_id) AS n FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE p.category = 'Electronics'`);
  await q("elec-names", `SELECT DISTINCT c.name FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN customers c ON c.id = o.customer_id WHERE p.category = 'Electronics' ORDER BY c.name`);
  await db.$disconnect();
}
main();
