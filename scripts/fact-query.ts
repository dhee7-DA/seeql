import { PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();
  const r = await db.$queryRawUnsafe(
    "SELECT status, COUNT(*) AS n FROM orders WHERE total > 200 GROUP BY status ORDER BY status",
  );
  console.log(JSON.stringify(r, (_k, v) => (typeof v === "bigint" ? Number(v) : v)));
  await db.$disconnect();
}
main();
