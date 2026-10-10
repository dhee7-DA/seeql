import { pathToFileURL } from "node:url";
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function main() {
  await resetDatabase();
  const rows = (await db.$queryRawUnsafe(
    "SELECT id, ROUND(total,2) AS total FROM orders WHERE total < 50 ORDER BY id LIMIT 3"
  )) as Array<Record<string, unknown>>;
  console.log(JSON.stringify(rows, (_, v) => (typeof v === "bigint" ? Number(v) : v)));
  await db.$disconnect();
}
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
