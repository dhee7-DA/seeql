// M5 pass fact probe #2 — case-design receipts for FIRST/LAST_VALUE + CAST banks.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return (await db.$queryRawUnsafe(sql)) as T[];
}
async function one(sql: string): Promise<Record<string, unknown>> {
  const rows = await q(sql);
  return rows[0] ?? {};
}

async function main() {
  const counts = await resetDatabase();
  console.log("seeded:", counts, "\n");

  console.log("== whole-integer price products (CAST census) ==");
  console.log(await q(`SELECT name, price FROM products WHERE CAST(price AS INTEGER) = price ORDER BY price`));
  console.log("cent products:", await q(`SELECT name, price FROM products WHERE CAST(price AS INTEGER) < price ORDER BY price DESC LIMIT 4`));

  console.log("\n== FIRST_VALUE per customer (created_at, id) ==");
  console.log(await q(`SELECT c.name, FIRST_VALUE(o.total) OVER (PARTITION BY o.customer_id ORDER BY o.created_at, o.id) AS first_total FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY c.id, o.id LIMIT 6`));
  console.log("first-order dates per customer (distinct):", await q(`SELECT customer_id, MIN(created_at) d, COUNT(*) n FROM orders GROUP BY customer_id ORDER BY customer_id LIMIT 6`));
  console.log("customers whose first order > 500:", await q(`SELECT * FROM (SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) ft FROM orders) GROUP BY customer_id HAVING ft > 500`));

  console.log("\n== LAST_VALUE full-frame per customer ==");
  console.log("customer 1 walk sample:", await q(`SELECT id, created_at, total, LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) lv FROM orders WHERE customer_id = 1 ORDER BY id LIMIT 3`));
  console.log("true last order per customer count:", await one(`SELECT COUNT(*) n FROM (SELECT DISTINCT customer_id, LAST_VALUE(id) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) lid FROM orders)`));

  console.log("\n== opening-vs-latest deltas ==");
  console.log(await q(`SELECT * FROM (SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) op, LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) cl FROM orders) GROUP BY customer_id ORDER BY customer_id LIMIT 6`));

  console.log("\n== frames: running sum with 1 PRECEDING ==");
  console.log("order 6..10 totals by date:", await q(`SELECT id, total FROM orders ORDER BY created_at, id LIMIT 6`));
  console.log("global running total first 5:", await q(`SELECT id, total, SUM(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) rt FROM orders ORDER BY created_at, id LIMIT 5`));
  console.log("3-row moving sum first 5:", await q(`SELECT id, total, SUM(total) OVER (ORDER BY created_at, id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) mv FROM orders ORDER BY created_at, id LIMIT 5`));

  console.log("\n== NTILE customer spend tiles ==");
  console.log("tile 1 members (spend desc):", await q(`SELECT * FROM (SELECT c.name, SUM(o.total) spend, NTILE(4) OVER (ORDER BY SUM(o.total) DESC) tile FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) WHERE tile = 1`));
  console.log("tile 4 members:", await q(`SELECT * FROM (SELECT c.name, SUM(o.total) spend, NTILE(4) OVER (ORDER BY SUM(o.total) DESC) tile FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) WHERE tile = 4`));

  console.log("\n== CAST case receipts ==");
  console.log("whole-price products ALL:", await q(`SELECT name, price FROM products WHERE CAST(price AS INTEGER) = price ORDER BY price`));
  console.log("typeof census:", await q(`SELECT typeof(price) t, COUNT(*) n FROM products GROUP BY t`));
  console.log("typeof active:", await one(`SELECT typeof(active) t FROM customers LIMIT 1`));
  console.log("cents-slice probe:", await q(`SELECT CAST(ROUND((price - CAST(price AS INTEGER)) * 100) AS INTEGER) cents FROM products ORDER BY cents DESC LIMIT 3`));
  console.log("order 74 total as text:", await q(`SELECT CAST(total AS TEXT) t FROM orders WHERE id = 74`));

  console.log("\n== decoy-safety probes for planned slots ==");
  console.log("FIRST_VALUE desc head (priciest first):", await q(`SELECT DISTINCT FIRST_VALUE(total) OVER (ORDER BY total DESC) fv FROM orders`));
  console.log("LAST_VALUE full frame global:", await q(`SELECT DISTINCT LAST_VALUE(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) lv FROM orders`));
  console.log("first shipped order (non-null shipped):", await q(`SELECT id, created_at, shipped_at FROM orders WHERE shipped_at IS NOT NULL ORDER BY shipped_at, id LIMIT 1`));
  console.log("delivered-only first order:", await q(`SELECT id, created_at, total FROM orders WHERE status = 'delivered' ORDER BY created_at, id LIMIT 1`));
  console.log("customers with > 10 orders:", await q(`SELECT c.name, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name HAVING n > 10 ORDER BY n DESC`));
}

main().catch((e) => { console.error(e); process.exit(1); });
