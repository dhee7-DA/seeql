// Facts for 3D #6 — UNION in space (lesson-17): the exact arm sequences and
// dedupe behavior that the scene will animate.
// Run: bun scripts/union3d-facts.ts
import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "../src/lib/sample-db";
const db = new PrismaClient({ log: [] });
const q = async (label: string, sql: string) => {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  console.log(`${label}: ${JSON.stringify(JSON.parse(JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : v))))}`);
};
async function main() {
  await resetDatabase();
  await q("arm.customers", `SELECT id, region FROM customers ORDER BY id`);
  await q("arm.suppliers", `SELECT id, region FROM suppliers ORDER BY id`);
  await q("pile.unionall.count", `SELECT COUNT(*) AS n FROM (SELECT region FROM customers UNION ALL SELECT region FROM suppliers)`);
  await q("pile.unionall.byregion", `SELECT region, COUNT(*) AS n FROM (SELECT region FROM customers UNION ALL SELECT region FROM suppliers) GROUP BY region ORDER BY n DESC, region`);
  await q("pile.union.rows", `SELECT region FROM (SELECT region FROM customers UNION SELECT region FROM suppliers)`);
  await q("pile.union.raw", `SELECT region FROM customers UNION SELECT region FROM suppliers`);
  await db.$disconnect();
}
main();
