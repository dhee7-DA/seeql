// Extra ground-truth for the ORDER BY / DISTINCT case batch (L4, L5).
// Run: cd /home/z/my-project && bun scripts/facts-cases-b2.ts
import { db } from "../src/lib/db";
import { ensureDatabase } from "../src/lib/sample-db";

const q = async (label: string, sql: string) => {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  const slim = rows.map((r) =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === "bigint" ? Number(v) : v])),
  );
  console.log(`## ${label}`);
  console.log(JSON.stringify(slim.slice(0, 12)));
};

async function main() {
  await ensureDatabase();
  await q("top3 delivered", `SELECT id, total FROM orders WHERE status = 'delivered' ORDER BY total DESC LIMIT 3`);
  await q("top3 shipped", `SELECT id, total FROM orders WHERE status = 'shipped' ORDER BY total DESC LIMIT 3`);
  await q("name DESC limit1", `SELECT name FROM products ORDER BY name DESC LIMIT 1`);
  await q("city ASC limit1", `SELECT city FROM customers ORDER BY city ASC LIMIT 1`);
  await q("city DESC limit1", `SELECT city FROM customers ORDER BY city DESC LIMIT 1`);
  await q("stock DESC limit1", `SELECT name, stock FROM products ORDER BY stock DESC LIMIT 1`);
  await q("stock ASC limit1", `SELECT name, stock FROM products ORDER BY stock ASC LIMIT 1`);
  await q("status,totalDESC limit3", `SELECT status, total FROM orders ORDER BY status ASC, total DESC LIMIT 3`);
  await q("rating ASC limit1", `SELECT name, rating FROM suppliers ORDER BY rating ASC LIMIT 1`);
  await q("price DESC products top2", `SELECT name, price FROM products ORDER BY price DESC LIMIT 2`);
  await q("created_at DESC limit1 orders", `SELECT id, created_at FROM orders ORDER BY created_at DESC LIMIT 1`);
  await q("page offset90 limit10", `SELECT COUNT(*) n FROM (SELECT id FROM orders ORDER BY id LIMIT 10 OFFSET 90)`);
  await q("page offset100 limit10", `SELECT COUNT(*) n FROM (SELECT id FROM orders ORDER BY id LIMIT 10 OFFSET 100)`);
  await q("pages ceil at 10", `SELECT CAST((COUNT(*) + 9) / 10 AS INT) pages FROM orders`);
  await q("distinct pairs list", `SELECT DISTINCT region, active FROM customers ORDER BY region, active`);
  await q("order by total asc limit5 (cheap5)", `SELECT id, total FROM orders ORDER BY total ASC LIMIT 5`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
