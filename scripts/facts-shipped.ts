// Follow-up probe: shipped_at NULL facts (L4 NULL lesson ground truth).
import { db } from "../src/lib/db";
import { ensureDatabase } from "../src/lib/sample-db";

const q = async (label: string, sql: string) => {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  const slim = rows.map((r) =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === "bigint" ? Number(v) : v])),
  );
  console.log(`## ${label}`);
  console.log(JSON.stringify(slim));
};

async function main() {
  await ensureDatabase();
  await q("shipped_at overview", `SELECT COUNT(*) n, COUNT(shipped_at) with_ts, SUM(shipped_at IS NULL) null_ts FROM orders`);
  await q("null by status", `SELECT status, COUNT(*) n, SUM(shipped_at IS NULL) null_ts FROM orders GROUP BY status ORDER BY status`);
  await q("text minmax", `SELECT MIN(status) min_s, MAX(status) max_s, COUNT(DISTINCT status) d_status, MIN(created_at) min_d, MAX(created_at) max_d FROM orders`);
  await q("cust name minmax", `SELECT MIN(name) min_n, MAX(name) max_n, MIN(city) min_c, MAX(city) max_c FROM customers`);
  await q("product price minmax names", `SELECT (SELECT name FROM products ORDER BY price ASC LIMIT 1) cheapest, (SELECT name FROM products ORDER BY price DESC LIMIT 1) priciest`);
  await q("avg quantity", `SELECT ROUND(AVG(quantity),2) avg_q, SUM(quantity) total_units, MIN(unit_price) min_up, MAX(unit_price) max_up FROM order_items`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
