// Truth probe for the Plan-tab upgrade (den-plan-explain): capture the EXACT
// EXPLAIN QUERY PLAN detail strings this SQLite build emits for representative
// queries, so the new parser/insights only ever match real shapes.
import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "../src/lib/sample-db";

const db = new PrismaClient({ log: [] });

const q = async (label: string, sql: string) => {
  const rows = (await db.$queryRawUnsafe(`EXPLAIN QUERY PLAN ${sql}`)) as Array<
    Record<string, unknown>
  >;
  console.log(`--- ${label}`);
  for (const r of rows) console.log(`  id=${r.id} parent=${r.parent} :: ${r.detail}`);
};

async function main() {
  await resetDatabase();

  const ver = (await db.$queryRawUnsafe(`SELECT sqlite_version() AS v`)) as Array<{
    v: string;
  }>;
  console.log(`sqlite_version: ${ver[0]?.v}`);

  await q("full-scan", `SELECT * FROM customers`);
  await q("pk-lookup", `SELECT * FROM customers WHERE id = 5`);
  await q("join-two-scans", `
    SELECT c.name, o.total FROM customers c JOIN orders o ON o.customer_id = c.id`);
  await q("join-pk-search", `
    SELECT c.name, o.total FROM customers c JOIN orders o ON o.id = c.id`);
  await q("where-non-indexed", `SELECT * FROM orders WHERE status = 'delivered'`);
  await q("order-by-temp-btree", `SELECT * FROM orders ORDER BY total`);
  await q("group-by-temp-btree", `SELECT status, COUNT(*) FROM orders GROUP BY status`);
  await q("list-subquery", `
    SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE total > 800)`);
  await q("correlated-scalar", `
    SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n FROM customers c`);
  await q("left-join-is-null", `
    SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`);
  await q("union-compound", `
    SELECT name FROM customers UNION SELECT name FROM suppliers`);
  await q("cte", `
    WITH big AS (SELECT * FROM orders WHERE total > 800) SELECT COUNT(*) FROM big`);
  await q("multi-join-3t", `
    SELECT c.name, o.id, p.name
    FROM customers c JOIN orders o ON o.customer_id = c.id
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE p.category = 'Electronics'`);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
