// Truth probe for the case-study figure fleet (cs35..cs51).
// Every number a figure will display is verified here before it ships.
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

  await q("customers.all", `SELECT id, name, region, active FROM customers ORDER BY id`);
  await q("customers.pending-holders", `SELECT DISTINCT c.name FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status = 'pending' ORDER BY c.name`);

  await q("months.counts", `SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon ORDER BY mon`);
  await q("months.revenue-running", `SELECT mon, revenue, ROUND(SUM(revenue) OVER (ORDER BY mon), 2) AS running FROM (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS revenue FROM orders GROUP BY mon) ORDER BY mon`);

  await q("alice.gaps", `SELECT created_at AS order_date, CAST(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at)) AS INT) AS gap_days FROM orders WHERE customer_id = 1 ORDER BY created_at`);

  await q("suppliers.all", `SELECT id, name, region FROM suppliers ORDER BY id`);
  await q("products.cats", `SELECT category, COUNT(*) AS n FROM products GROUP BY category ORDER BY category`);
  await q("products.bands", `WITH bands(lo,hi,label) AS (VALUES (0,50,'budget'),(50,100,'mid'),(100,9999,'premium')) SELECT label, COUNT(*) AS n FROM products JOIN bands ON price >= lo AND price < hi GROUP BY label ORDER BY label`);

  await q("schema.inventory", `SELECT type, name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' AND type IN ('table','view','index') ORDER BY type, name`);
  await q("mouse.stock", `SELECT id, name, stock FROM products WHERE id = 2`);

  await q("l50.wearables-after", `SELECT id, name, price FROM products WHERE category = 'Wearables' ORDER BY id`);
  await q("l50.cancelled-line-items", `SELECT COUNT(*) AS n FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE status = 'cancelled')`);

  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
