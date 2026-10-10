// Facts for den-flat-4 batch: four t-family companion figures (L29/30/31/32).
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

  // -- L29 t1b-cast-truncates: CAST vs ROUND -------------------------------
  await q("cast.products", `SELECT name, price, CAST(price AS INTEGER) AS whole, ROUND(price, 0) AS rounded FROM products WHERE id IN (1, 2, 13)`);

  // -- L30 t2b-lead-days: julianday fulfillment gap ------------------------
  await q("lead.summary", `SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) AS avg, MIN(julianday(shipped_at) - julianday(created_at)) AS mn, MAX(julianday(shipped_at) - julianday(created_at)) AS mx, COUNT(*) AS n FROM orders WHERE shipped_at IS NOT NULL`);
  await q("lead.samples", `SELECT id, created_at, shipped_at, ROUND(julianday(shipped_at) - julianday(created_at), 2) AS days FROM orders WHERE shipped_at IS NOT NULL ORDER BY id LIMIT 12`);
  await q("lead.eom", `SELECT date('2024-05-09', '+1 month', '-1 day') AS eom`);

  // -- L31 t3b-three-rankers: rank by region name --------------------------
  await q("rank.regions", `SELECT name, region, ROW_NUMBER() OVER (ORDER BY region) AS rn, RANK() OVER (ORDER BY region) AS rk, DENSE_RANK() OVER (ORDER BY region) AS dr FROM customers ORDER BY region, name`);

  // -- L32 t4b-moving-avg: 3-month moving average with clipped edges -------
  await q("ma3.full", `WITH monthly AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon) SELECT mon, n, ROUND(AVG(n) OVER (ORDER BY mon ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3 FROM monthly ORDER BY mon`);

  await db.$disconnect();
}
main();
