// Ground-truth probe for the 6 new diagrams (Task 7).
import { db } from "../src/lib/db";
import { ensureDatabase } from "../src/lib/sample-db";

const q = async (sql: string) => {
  try {
    const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
    const slim = rows.map((r) =>
      Object.fromEntries(
        Object.entries(r).map(([k, v]) => [k, typeof v === "bigint" ? Number(v) : v]),
      ),
    );
    console.log(sql, "\n->", JSON.stringify(slim), "\n");
  } catch (e) {
    console.log(sql, "\nERROR:", (e as Error).message.slice(0, 200), "\n");
  }
};

await ensureDatabase();
await q("SELECT o.id, c.city, o.status FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.city IN ('Dublin','Dubai') AND o.status IN ('delivered','pending','shipped') ORDER BY o.id LIMIT 9");
process.exit(0);
