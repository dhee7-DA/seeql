// Follow-up facts batch 2
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q(label: string, sql: string) {
  const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  console.log(`\n## ${label}`);
  console.log(JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : typeof v === "number" ? Math.round(v * 100) / 100 : v)));
}

async function main() {
  await resetDatabase();
  await q("l36: distinct buyers per product top6", `SELECT p.name, COUNT(DISTINCT o.customer_id) AS buyers FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id GROUP BY p.id ORDER BY buyers DESC, p.name LIMIT 6`);
  await q("l37: pending ages to 2025-03-01", `SELECT id, CAST(JULIANDAY('2025-03-01') - JULIANDAY(created_at) AS INTEGER) AS age FROM orders WHERE status='pending' ORDER BY age DESC`);
  await q("l39: total ties anywhere", `SELECT total, COUNT(*) AS c FROM orders GROUP BY total HAVING c > 1`);
  await q("l39: quantity * unit_price ties", `SELECT quantity * unit_price AS v, COUNT(*) AS c FROM order_items GROUP BY v ORDER BY c DESC LIMIT 3`);
  await q("l51: month count sanity", `SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) AS months FROM orders`);
  await q("l50: pending value (for story)", `SELECT ROUND(SUM(total),2) AS v, COUNT(*) AS n FROM orders WHERE status='pending'`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
