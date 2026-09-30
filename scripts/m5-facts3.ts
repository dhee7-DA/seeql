// M5 pass fact probe #3 — gauntlet-authoring receipts (window tiers E/M/H).
// Run: npx tsx scripts/m5-facts3.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function q<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return (await db.$queryRawUnsafe(sql)) as T[];
}
async function one(sql: string): Promise<Record<string, unknown>> {
  const rows = await q(sql);
  return rows[0] ?? {};
}
const n = (v: unknown) => Math.round(Number(v) * 100) / 100;

async function main() {
  await resetDatabase();

  console.log("== misc split facts ==");
  console.log("NTILE(2) over 103 orders:", await q(`SELECT tile, COUNT(*) c FROM (SELECT NTILE(2) OVER (ORDER BY total) tile FROM orders) GROUP BY tile`));
  console.log("duplicate product prices?", await q(`SELECT price, COUNT(*) c FROM products GROUP BY price HAVING c > 1`));
  console.log("orders per year:", await q(`SELECT strftime('%Y', created_at) y, COUNT(*) n FROM orders GROUP BY y`));
  console.log("invoice count + sample:", await q(`SELECT id, number, amount_cents, status FROM invoices ORDER BY id LIMIT 3`));
  console.log("email domains via INSTR+SUBSTR:", await one(`SELECT COUNT(*) n FROM (SELECT SUBSTR(email, INSTR(email, '@') + 1) dom FROM customers) WHERE dom = 'example.com'`));
  console.log("duplicate created_at values (RANGE frame peers):", await q(`SELECT created_at, COUNT(*) c FROM orders GROUP BY created_at HAVING c > 1 ORDER BY created_at LIMIT 4`));
  console.log("RANGE tie demo row 1:", await q(`SELECT id, created_at, total, SUM(total) OVER (ORDER BY created_at) rt_range FROM orders ORDER BY created_at, id LIMIT 6`));

  console.log("\n== cohort + recency ==");
  console.log("first-order month per customer:", await q(`SELECT * FROM (SELECT customer_id, FIRST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id) fd FROM orders) GROUP BY customer_id ORDER BY customer_id`));
  console.log("last order date per customer:", await q(`SELECT * FROM (SELECT customer_id, LAST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) ld FROM orders) GROUP BY customer_id ORDER BY customer_id LIMIT 6`));
  console.log("max-min delta per customer:", await q(`SELECT * FROM (SELECT customer_id, MAX(total) OVER (PARTITION BY customer_id) mx, MIN(total) OVER (PARTITION BY customer_id) mn FROM orders) GROUP BY customer_id ORDER BY customer_id LIMIT 6`));

  console.log("\n== ladders + cuts ==");
  console.log("orders cd <= 0.25 (top quartile by total desc):", await one(`SELECT COUNT(*) n FROM (SELECT total, CUME_DIST() OVER (ORDER BY total DESC) cd FROM orders) WHERE cd <= 0.25`));
  console.log("orders pr >= 0.9 (bottom decile):", await one(`SELECT COUNT(*) n FROM (SELECT total, PERCENT_RANK() OVER (ORDER BY total DESC) pr FROM orders) WHERE pr >= 0.9`));
  console.log("median-order row (cd = 0.5):", await q(`SELECT id, total, ROUND(cd, 4) cd FROM (SELECT id, total, CUME_DIST() OVER (ORDER BY total) cd FROM orders) WHERE cd = 0.5`));
  console.log("region spend totals:", await q(`SELECT c.region, ROUND(SUM(o.total), 2) t FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY t DESC`));
  console.log("EU spend ladder:", await q(`SELECT name, ROUND(spend, 2) spend, NTILE(4) OVER (ORDER BY spend DESC) tile FROM (SELECT c.name, SUM(o.total) spend FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU' GROUP BY c.name) ORDER BY spend DESC`));
  console.log("category price shares:", await q(`SELECT category, ROUND(SUM(price) OVER (PARTITION BY category), 2) cat_total FROM products ORDER BY id LIMIT 5`));
  console.log("category totals distinct:", await q(`SELECT category, ROUND(SUM(price), 2) t FROM products GROUP BY category ORDER BY t DESC`));

  console.log("\n== LAG/LEAD receipts ==");
  console.log("customer 1 date walk + prev:", await q(`SELECT id, created_at, total, LAG(created_at) OVER (ORDER BY created_at, id) prev_d FROM orders WHERE customer_id = 1 ORDER BY created_at, id LIMIT 4`));
  console.log("julianday gaps cust 1:", await q(`SELECT id, created_at, ROUND(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)), 1) gap_days FROM orders WHERE customer_id = 1 ORDER BY created_at, id LIMIT 5`));
  console.log("orders whose next-by-date total is higher (global):", await one(`SELECT COUNT(*) n FROM (SELECT total, LEAD(total) OVER (ORDER BY created_at, id) nt FROM orders) WHERE nt > total`));
  console.log("jump > 100 between consecutive (by date, global):", await one(`SELECT COUNT(*) n FROM (SELECT total, LAG(total) OVER (ORDER BY created_at, id) pt FROM orders) WHERE pt IS NOT NULL AND total - pt > 100`));

  console.log("\n== frames + capstone ==");
  console.log("centered 3-row sum by date, first 5:", await q(`SELECT id, total, SUM(total) OVER (ORDER BY created_at, id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) c3 FROM orders ORDER BY created_at, id LIMIT 5`));
  console.log("partial frame (UNB PREC .. 2 FOLLOWING) first 5:", await q(`SELECT id, total, SUM(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND 2 FOLLOWING) pf FROM orders ORDER BY created_at, id LIMIT 5`));
  console.log("cust 1 trailing 2-order avg (ROWS 2 PREC..1 PREC):", await q(`SELECT id, total, ROUND(AVG(total) OVER (ORDER BY created_at, id ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING), 2) t2 FROM orders WHERE customer_id = 1 ORDER BY created_at, id LIMIT 4`));
  console.log("single-day revenue top 3:", await q(`SELECT created_at, ROUND(SUM(total), 2) rev FROM orders GROUP BY created_at ORDER BY rev DESC LIMIT 3`));
  console.log("per-status last order id:", await q(`SELECT * FROM (SELECT status, id, LAST_VALUE(id) OVER (PARTITION BY status ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) lid FROM orders) GROUP BY status ORDER BY status`));
  console.log("tile4 members excl cancelled (spend desc):", await q(`SELECT name, ROUND(spend, 2) spend, tile FROM (SELECT c.name, SUM(o.total) spend, NTILE(4) OVER (ORDER BY SUM(o.total) DESC) tile FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status <> 'cancelled' GROUP BY c.name) WHERE tile = 4 ORDER BY spend DESC`));
  console.log("monthly running + rank staged:", await q(`SELECT * FROM (SELECT strftime('%Y-%m', created_at) m, SUM(total) rev, RANK() OVER (ORDER BY SUM(total) DESC) rk, ROUND(SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) rt FROM orders GROUP BY m) ORDER BY m LIMIT 3`));
  console.log("cancelled status running count check:", await one(`SELECT COUNT(*) n FROM orders WHERE status = 'cancelled'`));
}

main().catch((e) => { console.error(e); process.exit(1); });
