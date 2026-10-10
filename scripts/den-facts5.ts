import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "../src/lib/sample-db";
const db = new PrismaClient({ log: [] });
const q = async (label: string, sql: string) => {
  try {
    const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
    console.log(`${label}: ${JSON.stringify(JSON.parse(JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : v))))}`);
  } catch (e) { console.log(`${label}: ERROR ${(e as Error).message.split("\n")[0]}`); }
};
async function main() {
  await resetDatabase();
  await q("filter.census", `SELECT COUNT(*) FILTER (WHERE status = 'delivered') AS delivered, COUNT(*) FILTER (WHERE status = 'shipped') AS shipped, COUNT(*) FILTER (WHERE status = 'pending') AS pending, COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled, COUNT(*) AS total FROM orders`);
  await q("full.115", `SELECT COUNT(*) AS n FROM orders o FULL OUTER JOIN customers c ON c.id = o.customer_id AND o.status = 'cancelled'`);
  await q("full.parts", `SELECT COUNT(*) FILTER (WHERE o.id IS NOT NULL AND c.id IS NOT NULL) AS matched, COUNT(*) FILTER (WHERE o.id IS NOT NULL AND c.id IS NULL) AS order_only, COUNT(*) FILTER (WHERE o.id IS NULL AND c.id IS NOT NULL) AS cust_only FROM orders o FULL OUTER JOIN customers c ON c.id = o.customer_id AND o.status = 'cancelled'`);
  await q("cross.96", `SELECT COUNT(*) AS n FROM products CROSS JOIN suppliers`);
  await db.$disconnect();
}
main();
