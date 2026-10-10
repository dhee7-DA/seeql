// Anti-join candidates on the seeded db (all facts must be real).
import { pathToFileURL } from "node:url";
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const q = async (sql: string) =>
  (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;

async function main() {
  await resetDatabase();
  const out: Record<string, unknown> = {};

  out.noDelivered = await q(
    `SELECT c.name, COUNT(o.id) AS orders FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'
     GROUP BY c.id HAVING COUNT(o.id) = 0 ORDER BY c.name`,
  );
  out.noShipped = await q(
    `SELECT c.name, COUNT(o.id) AS n FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'
     GROUP BY c.id HAVING COUNT(o.id) = 0 ORDER BY c.name`,
  );
  out.inactiveStatuses = await q(
    `SELECT c.name, o.id, o.status FROM customers c JOIN orders o ON o.customer_id = c.id
     WHERE c.active = 0 ORDER BY c.name, o.id`,
  );
  out.productStatusMix = await q(
    `SELECT p.name,
       SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS pending
     FROM products p
     JOIN order_items oi ON oi.product_id = p.id
     JOIN orders o ON o.id = oi.order_id
     GROUP BY p.id ORDER BY delivered ASC LIMIT 6`,
  );
  out.pendingByCustomer = await q(
    `SELECT c.name, COUNT(*) AS pending FROM customers c
     JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'
     GROUP BY c.id ORDER BY pending DESC, c.name`,
  );
  console.log(JSON.stringify(out, (k, v) => (typeof v === "bigint" ? Number(v) : v), 2));
  await db.$disconnect();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
