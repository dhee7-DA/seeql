import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";
async function main() {
  await resetDatabase();
  const q = async (sql: string) => (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  console.log("GROUP-MONTH:", JSON.stringify(await q(`EXPLAIN QUERY PLAN SELECT SUBSTR(created_at,1,7) AS m, COUNT(*) FROM orders GROUP BY m`), (_k, v) => (typeof v === "bigint" ? Number(v) : v)), (_k, v) => (typeof v === "bigint" ? Number(v) : v));
  console.log("ORDER-TOP3:", JSON.stringify(await q(`EXPLAIN QUERY PLAN SELECT id, total FROM orders ORDER BY total DESC LIMIT 3`), (_k, v) => (typeof v === "bigint" ? Number(v) : v)), (_k, v) => (typeof v === "bigint" ? Number(v) : v));
  console.log("PK-LOOKUP:", JSON.stringify(await q(`EXPLAIN QUERY PLAN SELECT * FROM orders WHERE id = 42`), (_k, v) => (typeof v === "bigint" ? Number(v) : v)), (_k, v) => (typeof v === "bigint" ? Number(v) : v));
  console.log("JOIN:", JSON.stringify(await q(`EXPLAIN QUERY PLAN SELECT o.id FROM orders o JOIN order_items oi ON oi.order_id = o.id`), (_k, v) => (typeof v === "bigint" ? Number(v) : v)), (_k, v) => (typeof v === "bigint" ? Number(v) : v));
  console.log("SUBQ:", JSON.stringify(await q(`EXPLAIN QUERY PLAN SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE total > 100)`), (_k, v) => (typeof v === "bigint" ? Number(v) : v)), (_k, v) => (typeof v === "bigint" ? Number(v) : v));
  console.log("LIKE-PREFIX:", JSON.stringify(await q(`EXPLAIN QUERY PLAN SELECT id FROM customers WHERE name LIKE 'A%'`), (_k, v) => (typeof v === "bigint" ? Number(v) : v)), (_k, v) => (typeof v === "bigint" ? Number(v) : v));
  console.log("OR-FILTER:", JSON.stringify(await q(`EXPLAIN QUERY PLAN SELECT id FROM orders WHERE status = 'pending' OR status = 'shipped'`), (_k, v) => (typeof v === "bigint" ? Number(v) : v)), (_k, v) => (typeof v === "bigint" ? Number(v) : v));
  console.log("SHIPPED-AVG:", JSON.stringify(await q(`SELECT status, COUNT(*) AS n, ROUND(AVG(total),2) AS avg_total FROM orders GROUP BY status ORDER BY status`), (_k, v) => (typeof v === "bigint" ? Number(v) : v)), (_k, v) => (typeof v === "bigint" ? Number(v) : v));
  console.log("CUST-TOP5:", JSON.stringify(await q(`SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id ORDER BY n DESC LIMIT 5`), (_k, v) => (typeof v === "bigint" ? Number(v) : v)), (_k, v) => (typeof v === "bigint" ? Number(v) : v));
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
