// Verify cancelled-order tallies per customer. Run: npx tsx scripts/m4-verify-claims3.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function main() {
  await resetDatabase();
  console.log("cancelled tally per customer:", await db.$queryRawUnsafe(`SELECT c.name, COUNT(*) n FROM orders o INNER JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' GROUP BY c.id ORDER BY n DESC`));
  console.log("customers with <= 1 cancelled:", await db.$queryRawUnsafe(`SELECT COUNT(*) n FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled') <= 1`));
  console.log("customers with >=1 order above 800:", await db.$queryRawUnsafe(`SELECT COUNT(*) n FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.total > 800)`));
  await db.$disconnect();
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
