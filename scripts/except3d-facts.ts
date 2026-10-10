// Truth probe for 3D #8 — EXCEPT in space (s20-except-space-3d).
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

  // arm A: distinct delivered customer ids, first-seen order (by order id)
  await q("delivered.ids", `
    SELECT customer_id, MIN(id) AS first_order
    FROM orders WHERE status = 'delivered'
    GROUP BY customer_id ORDER BY first_order`);
  // arm B: distinct cancelled customer ids, first-seen order
  await q("cancelled.ids", `
    SELECT customer_id, MIN(id) AS first_order
    FROM orders WHERE status = 'cancelled'
    GROUP BY customer_id ORDER BY first_order`);
  // the subtraction, forward direction
  await q("delivered.except.cancelled", `
    SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'
    EXCEPT
    SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'
    ORDER BY customer_id`);
  // the subtraction, reversed direction (the asymmetry story)
  await q("cancelled.except.delivered", `
    SELECT COUNT(*) AS n FROM (
      SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'
      EXCEPT
      SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered')`);
  // names of the 11 survivors (for the podium panel + aria)
  await q("survivor.names", `
    SELECT id, name FROM customers WHERE id IN (
      SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'
      EXCEPT
      SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'
    ) ORDER BY id`);
  // the shipped/delivered leftovers (lesson's other asymmetry pair)
  await q("shipped.except.delivered", `
    SELECT DISTINCT customer_id FROM orders WHERE status = 'shipped'
    EXCEPT
    SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'`);
  await q("delivered.except.shipped", `
    SELECT COUNT(*) AS n FROM (
      SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'
      EXCEPT
      SELECT DISTINCT customer_id FROM orders WHERE status = 'shipped')`);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
