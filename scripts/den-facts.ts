// Facts for den batch flat figures: L17 region pile + L22 NULL leak.
import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "../src/lib/sample-db";
const db = new PrismaClient({ log: [] });
const q = async (label: string, sql: string) => {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  console.log(`${label}: ${JSON.stringify(JSON.parse(JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : v))))}`);
};
async function main() {
  await resetDatabase();
  await q("customers.regions", `SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY n DESC`);
  await q("suppliers.regions", `SELECT region, COUNT(*) AS n FROM suppliers GROUP BY region ORDER BY n DESC`);
  await q("pile.all", `SELECT region, COUNT(*) AS n FROM (SELECT region FROM customers UNION ALL SELECT region FROM suppliers) GROUP BY region ORDER BY n DESC`);
  await q("pile.union", `SELECT COUNT(*) AS n FROM (SELECT region FROM customers UNION SELECT region FROM suppliers)`);
  await q("case.nulleak", `SELECT CASE WHEN status = 'cancelled' THEN 'dead' END AS label, COUNT(*) AS n FROM orders GROUP BY label ORDER BY n DESC`);
  await q("case.with-else", `SELECT CASE WHEN status = 'cancelled' THEN 'dead' ELSE 'alive' END AS label, COUNT(*) AS n FROM orders GROUP BY label ORDER BY n DESC`);
  await db.$disconnect();
}
main();
