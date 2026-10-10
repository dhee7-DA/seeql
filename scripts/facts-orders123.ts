import { pathToFileURL } from "node:url";
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function main() {
  await resetDatabase();
  const rows = (await db.$queryRawUnsafe(
    `SELECT o.id, o.customer_id, o.total, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.id IN (1,2,3) ORDER BY o.id`,
  )) as Array<Record<string, unknown>>;
  console.log(JSON.stringify(rows));
  await db.$disconnect();
}
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
