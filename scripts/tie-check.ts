import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";
async function main() {
  await resetDatabase();
  const rows = (await db.$queryRawUnsafe(`SELECT total, COUNT(*) AS c FROM orders GROUP BY total HAVING c > 1`)) as Array<Record<string, unknown>>;
  console.log("total ties:", JSON.stringify(rows));
  const w = (await db.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM (SELECT quantity * unit_price AS v FROM order_items GROUP BY v HAVING COUNT(*) > 1)`)) as Array<Record<string, unknown>>;
  console.log("line-value ties:", JSON.stringify(w));
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
