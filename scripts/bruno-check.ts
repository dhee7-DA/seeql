// Verify every row the flat J4LeftJoin figure displays (delivered predicate).
import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "../src/lib/sample-db";

const db = new PrismaClient({ log: [] });

async function main() {
  await resetDatabase();
  const rows = (await db.$queryRawUnsafe(`
    SELECT c.id, c.name,
           (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n_any,
           (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') AS n_del,
           (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped') AS n_ship
    FROM customers c WHERE c.name IN ('Alice Chen', 'Bruno Silva', 'Maya Patel', 'Liam O''Brien')
  `)) as Array<Record<string, unknown>>;
  console.log("figure rows:", JSON.stringify(JSON.parse(JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : v))), null, 1));

  const shippedGaps = (await db.$queryRawUnsafe(`
    SELECT COUNT(*) AS n FROM customers c
    WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped')
  `)) as Array<Record<string, unknown>>;
  console.log("customers with zero shipped:", JSON.stringify(JSON.parse(JSON.stringify(shippedGaps, (_k, v) => (typeof v === "bigint" ? Number(v) : v)))));

  await db.$disconnect();
}

main();
