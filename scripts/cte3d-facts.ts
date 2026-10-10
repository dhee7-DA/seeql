// Truth probe for 3D #9 — CTE chain conveyor (s28-cte-chain-3d).
// Every number/name baked into the scene must come from this probe.
import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "../src/lib/sample-db";

const db = new PrismaClient({ log: [] });

const q = async (label: string, sql: string) => {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  const clean = JSON.parse(JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : typeof v === "number" ? Math.round(v * 100) / 100 : v)));
  console.log(`${label}: ${JSON.stringify(clean)}`);
};

async function main() {
  await resetDatabase();

  // stage 1: the spend CTE — 16 per-customer rows (id order for the flights)
  await q("spend.all", `
    SELECT customer_id, ROUND(SUM(total), 2) AS s
    FROM orders GROUP BY customer_id ORDER BY customer_id`);
  // stage 2: the big CTE — the 5 survivors of s > 2000
  await q("big.rows", `
    SELECT customer_id, ROUND(SUM(total), 2) AS s
    FROM orders GROUP BY customer_id HAVING SUM(total) > 2000
    ORDER BY SUM(total) DESC`);
  // stage 3: the final SELECT — names joined, ORDER BY s DESC
  await q("final.rows", `
    SELECT c.name, b.s FROM (
      SELECT customer_id, SUM(total) AS s
      FROM orders GROUP BY customer_id HAVING SUM(total) > 2000
    ) b JOIN customers c ON c.id = b.customer_id
    ORDER BY b.s DESC`);
  // counts for the HUD
  await q("counts", `
    SELECT
      (SELECT COUNT(*) FROM orders) AS orders,
      (SELECT COUNT(DISTINCT customer_id) FROM orders) AS spend_rows,
      (SELECT COUNT(*) FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) > 2000)) AS big_rows`);
  // the order -> customer sequence (arrival order for the fold choreography)
  await q("order.cust", `SELECT id, customer_id FROM orders ORDER BY id`);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
