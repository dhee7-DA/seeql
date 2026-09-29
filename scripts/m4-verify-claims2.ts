// Verify active-customer facts. Run: npx tsx scripts/m4-verify-claims2.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function main() {
  await resetDatabase();
  console.log("inactive customers:", await db.$queryRawUnsafe(`SELECT name, active FROM customers WHERE active = 0`));
  console.log("orders of active customers:", await db.$queryRawUnsafe(`SELECT COUNT(*) n FROM orders o WHERE EXISTS (SELECT 1 FROM customers c WHERE c.id = o.customer_id AND c.active = 1)`));
  console.log("orders of inactive:", await db.$queryRawUnsafe(`SELECT COUNT(*) n FROM orders o INNER JOIN customers c ON c.id = o.customer_id WHERE c.active = 0`));
  await db.$disconnect();
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
