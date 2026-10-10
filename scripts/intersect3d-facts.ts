// Truth probe for 3D #7 — INTERSECT in space (s19-intersect-space-3d).
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
  // the overlap
  await q("intersect.result", `
    SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'
    INTERSECT
    SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'
    ORDER BY customer_id`);
  // counts
  await q("counts", `
    SELECT
      (SELECT COUNT(DISTINCT customer_id) FROM orders WHERE status='delivered') AS delivered,
      (SELECT COUNT(DISTINCT customer_id) FROM orders WHERE status='cancelled') AS cancelled`);
  // names for the overlap ids + all 16 (for arm labels)
  await q("overlap.names", `
    SELECT id, name FROM customers WHERE id IN (
      SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'
      INTERSECT
      SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'
    ) ORDER BY id`);
  // delivered ∩ pending (the lesson's other overlap)
  await q("delivered.pending", `
    SELECT COUNT(*) AS n FROM (
      SELECT DISTINCT customer_id FROM orders WHERE status='delivered'
      INTERSECT
      SELECT DISTINCT customer_id FROM orders WHERE status='pending')`);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
