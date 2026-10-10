// Follow-up probe: verify lesson-20's remaining numeric claims after the
// delivered EXCEPT shipped discrepancy (lesson says 0, db says 6).
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

  // size of each set involved in the lesson's claims
  await q("set.sizes", `
    SELECT
      (SELECT COUNT(DISTINCT customer_id) FROM orders WHERE status='delivered') AS delivered,
      (SELECT COUNT(DISTINCT customer_id) FROM orders WHERE status='shipped') AS shipped,
      (SELECT COUNT(DISTINCT customer_id) FROM orders WHERE status='cancelled') AS cancelled,
      (SELECT COUNT(DISTINCT customer_id) FROM orders WHERE status='pending') AS pending`);
  // delivered EXCEPT shipped — full truth (lesson claims 0)
  await q("delivered.except.shipped", `
    SELECT id FROM customers WHERE id IN (
      SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'
      EXCEPT
      SELECT DISTINCT customer_id FROM orders WHERE status = 'shipped')
    ORDER BY id`);
  // delivered ∩ shipped — how much overlap is really there
  await q("delivered.intersect.shipped", `
    SELECT COUNT(*) AS n FROM (
      SELECT DISTINCT customer_id FROM orders WHERE status='delivered'
      INTERSECT
      SELECT DISTINCT customer_id FROM orders WHERE status='shipped')`);
  // p5's claim: pending EXCEPT cancelled = 4 ids (3, 6, 7, 16)
  await q("pending.except.cancelled", `
    SELECT DISTINCT customer_id FROM orders WHERE status = 'pending'
    EXCEPT
    SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'
    ORDER BY customer_id`);
  // deep[] edge claim: order statuses vs invoice statuses
  await q("statuses", `
    SELECT DISTINCT status FROM orders ORDER BY status`);
  await q("invoice.statuses", `
    SELECT DISTINCT status FROM invoices ORDER BY status`);
  await q("statuses.except.invoices", `
    SELECT COUNT(*) AS n FROM (
      SELECT DISTINCT status FROM orders
      EXCEPT
      SELECT DISTINCT status FROM invoices)`);
  await q("invoices.except.statuses", `
    SELECT COUNT(*) AS n FROM (
      SELECT DISTINCT status FROM invoices
      EXCEPT
      SELECT DISTINCT status FROM orders)`);
  // Liam's orders (the shipped EXCEPT delivered story)
  await q("liam.orders", `
    SELECT id, status, total FROM orders WHERE customer_id = 12 ORDER BY id`);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
