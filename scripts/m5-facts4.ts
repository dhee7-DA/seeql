// M5 hard-tier fact check: per-customer order count distribution + rank ties.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function main() {
  await resetDatabase();
  const counts = await db.$queryRawUnsafe("SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id ORDER BY n DESC, customer_id");
  console.log("counts:", JSON.stringify(counts, (_, v) => typeof v === "bigint" ? Number(v) : v));
  const ranks = await db.$queryRawUnsafe("SELECT rk, n, c FROM (SELECT n, COUNT(*) c, RANK() OVER (ORDER BY n DESC) rk FROM (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) GROUP BY n) ORDER BY rk");
  console.log("rank ties:", JSON.stringify(ranks, (_, v) => typeof v === "bigint" ? Number(v) : v));
  const dense = await db.$queryRawUnsafe("SELECT drk, n, c FROM (SELECT n, COUNT(*) c, DENSE_RANK() OVER (ORDER BY n DESC) drk FROM (SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id) GROUP BY n) ORDER BY drk");
  console.log("dense ties:", JSON.stringify(dense, (_, v) => typeof v === "bigint" ? Number(v) : v));
}
main().catch((e) => { console.error(e); process.exit(1); });
