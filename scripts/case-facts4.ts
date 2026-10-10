// Facts batch 4 — the tail queries that got cut off.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q(label: string, sql: string) {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  console.log(`\n## ${label}`);
  console.log(
    JSON.stringify(
      rows,
      (_k, v) => (typeof v === "bigint" ? Number(v) : typeof v === "number" ? Math.round(v * 100) / 100 : v),
    ),
  );
}

async function main() {
  await resetDatabase();
  await q("l50: customers 1/7/16", `SELECT id, name, city, region FROM customers WHERE id IN (1, 7, 16)`);
  await q("l50: latest created_at", `SELECT MAX(created_at) AS latest, MIN(created_at) AS earliest FROM orders`);
  await q("l50: alice orders", `SELECT COUNT(*) AS n, ROUND(SUM(total),2) AS v FROM orders WHERE customer_id = 1`);
  await q("l51: delivered month count", `SELECT COUNT(*) AS n FROM (SELECT strftime('%Y-%m', created_at) AS mon FROM orders WHERE status = 'delivered' GROUP BY mon)`);
  await q("l51: delivered buckets first4", `SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS rev, COUNT(*) AS n FROM orders WHERE status = 'delivered' GROUP BY mon ORDER BY mon LIMIT 4`);
  await q("l51: two worst months", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon) SELECT mon, ROUND(rev,2) AS rev FROM m ORDER BY rev ASC, mon ASC LIMIT 2`);
  await q("l51: items+suppliers counts", `SELECT (SELECT COUNT(*) FROM order_items) AS items, (SELECT COUNT(*) FROM suppliers) AS suppliers`);
  await q("l51: existing non-auto indexes", `SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%'`);
  await q("l51: weekday of worst month sanity", `SELECT COUNT(*) AS orders_in_jul24 FROM orders WHERE strftime('%Y-%m', created_at) = '2024-07'`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
