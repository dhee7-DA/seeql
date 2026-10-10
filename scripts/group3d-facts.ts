// Truth probe for l8-buckets-space-3d (GROUP BY + HAVING in space).
import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "../src/lib/sample-db";
const db = new PrismaClient({ log: [] });
const q = async (label: string, sql: string) => {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  console.log(`${label}: ${JSON.stringify(JSON.parse(JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : typeof v === "number" ? Math.round(v * 100) / 100 : v))))}`);
};
async function main() {
  await resetDatabase();
  await q("buckets", `SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY n DESC`);
  await q("having20", `SELECT status, COUNT(*) AS n FROM orders GROUP BY status HAVING COUNT(*) >= 20 ORDER BY n DESC`);
  await q("having20.rows", `SELECT SUM(n) AS kept FROM (SELECT COUNT(*) AS n FROM orders GROUP BY status HAVING COUNT(*) >= 20)`);
  await db.$disconnect();
}
main();
