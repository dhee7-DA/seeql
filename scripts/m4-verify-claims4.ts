// Verify sweep counts for cs-2430 redesign. npx tsx scripts/m4-verify-claims4.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function main() {
  await resetDatabase();
  const r1 = await db.$queryRawUnsafe(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='pending') AND NOT EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status='delivered')`);
  const r2 = await db.$queryRawUnsafe(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='delivered') AND NOT EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status='shipped')`);
  const r3 = await db.$queryRawUnsafe(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status='pending') AND NOT EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status='shipped')`);
  console.log("pending-no-delivered:", r1);
  console.log("delivered-no-shipped:", r2);
  console.log("pending-no-shipped:", r3);
  await db.$disconnect();
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
