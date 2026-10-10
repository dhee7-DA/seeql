// Truth probe for the 3D join-space ribbon (j2-join-space-3d in figures3d.tsx).
// Every number baked into the scene must match the live db — re-verified before
// the ribbon re-wire (original verification was lost with the workspace restore).
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

  // table sizes
  await q("customers.total", `SELECT COUNT(*) AS n FROM customers`);
  await q("orders.total", `SELECT COUNT(*) AS n FROM orders`);

  // the four customers the scene draws (ids 1-4, name + order count + spend)
  await q("ribbon.customers", `
    SELECT c.id, c.name, COUNT(o.id) AS n, ROUND(COALESCE(SUM(o.total), 0), 2) AS spend
    FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
    WHERE c.id <= 4 GROUP BY c.id ORDER BY c.id`);

  // INNER JOIN result size — the scene claims "103 rows, none dropped"
  await q("join.result", `
    SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id`);

  // orphan orders (orders whose customer_id has no customer row) — claim: 0
  await q("orders.orphans", `
    SELECT COUNT(*) AS n FROM orders o
    WHERE o.customer_id IS NULL OR NOT EXISTS (SELECT 1 FROM customers c WHERE c.id = o.customer_id)`);

  // drawn-row arithmetic: 33 drawn of 103, so "+ 70 more" — sanity on the sum
  await q("drawn.stack-sum", `
    SELECT COUNT(*) AS n FROM orders WHERE customer_id IN (1, 2, 3, 4)`);

  await db.$disconnect();
}

main();
