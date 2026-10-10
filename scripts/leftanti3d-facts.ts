// Truth probe for the LEFT JOIN 3D scene (j4-left-space-3d) — the lesson's
// real predicate is ON o.customer_id = c.id AND o.status = 'delivered'.
// Every number/name the scene will display is verified here before it ships.
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

  // status census — how big is the 'delivered' slice?
  await q("orders.status-census", `SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY n DESC`);

  // customers with ZERO delivered orders = the NULL-filled rows of the lesson
  await q("zero-delivered.customers", `
    SELECT c.id, c.name, c.region,
           (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS orders_any,
           (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') AS orders_delivered
    FROM customers c
    WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')
    ORDER BY c.id`);

  await q("zero-delivered.count", `
    SELECT COUNT(*) AS n FROM customers c
    WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')`);

  // LEFT JOIN under the lesson predicate: delivered rows + one NULL row per zero-delivered customer
  await q("left-join.total", `
    SELECT COUNT(*) AS n
    FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'`);

  // delivered orders total (the flights)
  await q("delivered.total", `SELECT COUNT(*) AS n FROM orders WHERE status = 'delivered'`);

  // per-customer delivered counts for first 6 customers (the drawn stacks)
  await q("first6.delivered", `
    SELECT c.id, c.name,
           (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n_any,
           (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') AS n_del
    FROM customers c ORDER BY c.id LIMIT 6`);

  // the anti pattern on the lesson predicate (feeds lesson-13 next)
  await q("anti.pattern", `
    SELECT COUNT(*) AS n FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'
    WHERE o.id IS NULL`);

  await db.$disconnect();
}

main();
