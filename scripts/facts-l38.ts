import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";
async function main() {
  await resetDatabase();
  const rows = (await db.$queryRawUnsafe(`SELECT p.name, ROUND(p.price,2) AS price, p.category, ROUND((SELECT AVG(p2.price) FROM products p2 WHERE p2.category = p.category),2) AS cat_avg FROM products p WHERE p.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category = p.category) ORDER BY p.price DESC, p.name`)) as Array<Record<string, unknown>>;
  console.log("above-category-avg:", JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : typeof v === "number" ? Math.round(v * 100) / 100 : v)));
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
