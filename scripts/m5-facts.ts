// M5 pass fact probe — engine receipts for the Scalar & Window Toolkit keyword
// banks and the Module-5 gauntlet (OVER/PARTITION, ROW_NUMBER, NTILE,
// FIRST/LAST_VALUE, PERCENT_RANK/CUME_DIST, running totals, text functions,
// CAST & types, math & rounding).
// Run: bun scripts/m5-facts.ts
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
  const counts = await resetDatabase();
  console.log("seeded:", counts, "\n");

  console.log("== OVER & PARTITION BY ==");
  console.log("customers per region (partition counts):", await q(`SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY region`));
  console.log("orders per status:", await q(`SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY status`));
  console.log("window keeps every row (COUNT(*) OVER()):", await one(`SELECT COUNT(*) OVER() AS total_rows, COUNT(*) AS plain FROM orders LIMIT 1`));
  console.log("partition count per row (status):", await q(`SELECT id, status, COUNT(*) OVER (PARTITION BY status) AS status_n FROM orders ORDER BY id LIMIT 4`));
  console.log("distinct partition sizes on customer:", await q(`SELECT COUNT(*) AS parts, SUM(cnt) AS total FROM (SELECT customer_id, COUNT(*) cnt FROM orders GROUP BY customer_id)`));
  console.log("customers ranked inside region (EU sample):", await q(`SELECT name, region, RANK() OVER (PARTITION BY region ORDER BY id) AS rk FROM customers WHERE region = 'EU' ORDER BY rk LIMIT 4`));

  console.log("\n== ROW_NUMBER ==");
  console.log("top-3 orders by total (ROW_NUMBER):", await q(`SELECT row_num, id, total FROM (SELECT id, total, ROW_NUMBER() OVER (ORDER BY total DESC) AS row_num FROM orders) r WHERE row_num <= 3`));
  console.log("top order:", await q(`SELECT id, customer_id, total FROM orders ORDER BY total DESC LIMIT 1`));
  console.log("ROW_NUMBER vs LIMIT equivalence:", await one(`SELECT COUNT(*) n FROM (SELECT ROW_NUMBER() OVER (ORDER BY total DESC) rn FROM orders) WHERE rn <= 5`));
  console.log("rn per customer, own top order (sample):", await q(`SELECT * FROM (SELECT customer_id, id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) rn FROM orders) WHERE rn = 1 ORDER BY customer_id LIMIT 5`));
  console.log("rn=1 rows count (one per customer):", await one(`SELECT COUNT(*) n FROM (SELECT customer_id, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) rn FROM orders) WHERE rn = 1`));
  console.log("non-determinism probe: two orders with same total?", await q(`SELECT total, COUNT(*) c FROM orders GROUP BY total HAVING c > 1 ORDER BY total DESC LIMIT 3`));

  console.log("\n== NTILE ==");
  console.log("NTILE(4) over 16 customers:", await q(`SELECT tile, COUNT(*) c FROM (SELECT NTILE(4) OVER (ORDER BY id) tile FROM customers) GROUP BY tile ORDER BY tile`));
  console.log("NTILE(5) over 16 customers:", await q(`SELECT tile, COUNT(*) c FROM (SELECT NTILE(5) OVER (ORDER BY id) tile FROM customers) GROUP BY tile ORDER BY tile`));
  console.log("NTILE(3) over 103 orders:", await q(`SELECT tile, COUNT(*) c FROM (SELECT NTILE(3) OVER (ORDER BY id) tile FROM orders) GROUP BY tile ORDER BY tile`));
  console.log("NTILE(4) over 103 orders:", await q(`SELECT tile, COUNT(*) c FROM (SELECT NTILE(4) OVER (ORDER BY id) tile FROM orders) GROUP BY tile ORDER BY tile`));
  console.log("NTILE(4) by total desc, top tile min:", await q(`SELECT tile, MIN(total) mn, MAX(total) mx FROM (SELECT total, NTILE(4) OVER (ORDER BY total DESC) tile FROM orders) GROUP BY tile ORDER BY tile`));
  console.log("NTILE(10) over 16:", await q(`SELECT tile, COUNT(*) c FROM (SELECT NTILE(10) OVER (ORDER BY id) tile FROM customers) GROUP BY tile ORDER BY tile`));
  console.log("spend quartiles (customer lifetime, NTILE(4) desc):", await q(`SELECT tile, COUNT(*) c, ROUND(MIN(spend),2) mn, ROUND(MAX(spend),2) mx FROM (SELECT customer_id, SUM(total) spend, NTILE(4) OVER (ORDER BY SUM(total) DESC) tile FROM orders GROUP BY customer_id) GROUP BY tile ORDER BY tile`));

  console.log("\n== FIRST_VALUE & LAST_VALUE ==");
  console.log("first order by date (min):", await q(`SELECT id, created_at, total FROM orders ORDER BY created_at, id LIMIT 1`));
  console.log("last order by date (max):", await q(`SELECT id, created_at, total FROM orders ORDER BY created_at DESC, id DESC LIMIT 1`));
  console.log("LAST_VALUE default frame trap:", await q(`SELECT DISTINCT lv FROM (SELECT LAST_VALUE(total) OVER (ORDER BY created_at) lv FROM orders ORDER BY created_at LIMIT 3) LIMIT 1`));
  console.log("LAST_VALUE with full frame:", await q(`SELECT DISTINCT lv FROM (SELECT LAST_VALUE(total) OVER (ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) lv FROM orders ORDER BY created_at LIMIT 3)`));
  console.log("FIRST_VALUE per customer by date (sample):", await q(`SELECT customer_id, fv FROM (SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) fv FROM orders) GROUP BY customer_id ORDER BY customer_id LIMIT 5`));
  console.log("first order per customer count = partitions:", await one(`SELECT COUNT(*) n FROM (SELECT customer_id, FIRST_VALUE(id) OVER (PARTITION BY customer_id ORDER BY created_at, id) fid FROM orders) GROUP BY customer_id`));

  console.log("\n== PERCENT_RANK & CUME_DIST ==");
  console.log("customer spend ranking with percentiles:", await q(`SELECT name, ROUND(spend,2) spend, pr, cd FROM (SELECT c.name, SUM(o.total) spend, ROUND(PERCENT_RANK() OVER (ORDER BY SUM(o.total) DESC),4) pr, ROUND(CUME_DIST() OVER (ORDER BY SUM(o.total) DESC),4) cd FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) ORDER BY spend DESC LIMIT 4`));
  console.log("percent_rank of top row is always:", await one(`SELECT ROUND(PERCENT_RANK() OVER (ORDER BY total DESC),4) pr FROM orders ORDER BY total DESC LIMIT 1`));
  console.log("cume_dist of top row (103 orders):", await one(`SELECT ROUND(CUME_DIST() OVER (ORDER BY total DESC),6) cd FROM orders ORDER BY total DESC LIMIT 1`));
  console.log("cume_dist distinct values:", await q(`SELECT COUNT(DISTINCT cd) n FROM (SELECT CUME_DIST() OVER (ORDER BY total) cd FROM orders)`));
  console.log("percent_rank distinct values:", await one(`SELECT COUNT(DISTINCT pr) n FROM (SELECT PERCENT_RANK() OVER (ORDER BY total) pr FROM orders)`));

  console.log("\n== Running totals ==");
  console.log("month spine:", await q(`SELECT strftime('%Y-%m', created_at) m, COUNT(*) n, ROUND(SUM(total),2) rev FROM orders GROUP BY m ORDER BY m`));
  console.log("running revenue total by month:", await q(`SELECT m, ROUND(rev,2) rev, ROUND(rt,2) rt FROM (SELECT strftime('%Y-%m', created_at) m, SUM(total) rev, SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) rt FROM orders GROUP BY m) ORDER BY m`));
  console.log("grand revenue:", await one(`SELECT ROUND(SUM(total),2) v FROM orders`));
  console.log("month when running total first crosses 20000:", await q(`SELECT m, ROUND(rt,2) FROM (SELECT strftime('%Y-%m', created_at) m, SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) rt FROM orders GROUP BY m) WHERE rt > 20000 ORDER BY m LIMIT 1`));
  console.log("per-customer running order count (Alice sample):", await q(`SELECT id, total, rt FROM (SELECT id, total, COUNT(*) OVER (PARTITION BY customer_id ORDER BY created_at, id) rt FROM orders o WHERE customer_id = 1) ORDER BY id`));

  console.log("\n== Text functions ==");
  console.log("handles:", await q(`SELECT name, SUBSTR(email, 1, INSTR(email, '@') - 1) handle FROM customers ORDER BY id LIMIT 4`));
  console.log("domains:", await q(`SELECT DISTINCT SUBSTR(email, INSTR(email, '@') + 1) dom FROM customers ORDER BY dom`));
  console.log("gmail customers:", await one(`SELECT COUNT(*) n FROM customers WHERE email LIKE '%@gmail.com'`));
  console.log("outlook customers:", await one(`SELECT COUNT(*) n FROM customers WHERE email LIKE '%@outlook.com'`));
  console.log("name lengths:", await q(`SELECT name, LENGTH(name) len FROM customers ORDER BY len DESC, name LIMIT 3`));
  console.log("shortest names:", await q(`SELECT name, LENGTH(name) len FROM customers ORDER BY len, name LIMIT 3`));
  console.log("upper/lower sample:", await q(`SELECT UPPER(name) u, LOWER(name) l FROM customers LIMIT 2`));
  console.log("replace sample:", await q(`SELECT REPLACE('2024-05-09', '-', '/') v`));
  console.log("trim sample:", await q(`SELECT TRIM('  padded  ') v, LENGTH(TRIM('  padded  ')) l`));
  console.log("concat sample:", await q(`SELECT name || ' (' || region || ')' v FROM customers LIMIT 3`));
  console.log("customers per domain:", await q(`SELECT SUBSTR(email, INSTR(email, '@') + 1) dom, COUNT(*) n FROM customers GROUP BY dom ORDER BY n DESC, dom`));

  console.log("\n== CAST & types ==");
  console.log("cast decimal to int truncates:", await q(`SELECT CAST(89.99 AS INTEGER) a, CAST(3.9 AS INTEGER) b, CAST(1088.44 AS INTEGER) c`));
  console.log("typeof probes:", await q(`SELECT typeof(1) a, typeof(1.5) b, typeof('x') c, typeof(NULL) d`));
  console.log("cast text to int:", await q(`SELECT CAST('42' AS INTEGER) a, CAST(' 7 ' AS INTEGER) b`));
  console.log("cast non-numeric text:", await q(`SELECT CAST('abc' AS INTEGER) a, CAST('12abc' AS INTEGER) b`));
  console.log("cast price int (truncation census):", await q(`SELECT COUNT(*) n FROM products WHERE CAST(price AS INTEGER) < price`));
  console.log("products where CAST(price AS INTEGER)=price:", await one(`SELECT COUNT(*) n FROM products WHERE CAST(price AS INTEGER) = price`));
  console.log("sample prices:", await q(`SELECT name, price, CAST(price AS INTEGER) ip FROM products ORDER BY id LIMIT 5`));
  console.log("sqlite arith on text:", await q(`SELECT '5' + 2 v, 'abc' + 2 v`));

  console.log("\n== Math & rounding ==");
  console.log("round samples:", await q(`SELECT ROUND(1088.44) a, ROUND(338.187, 1) b, ROUND(71.7769, 2) c`));
  console.log("avg total:", await one(`SELECT ROUND(AVG(total),2) a FROM orders`));
  console.log("avg price 4dp:", await one(`SELECT ROUND(AVG(price),4) a FROM products`));
  console.log("abs:", await q(`SELECT ABS(-5) a, ABS(5.5) b`));
  console.log("ceil/floor (3.35+):", await q(`SELECT CEIL(3.2) a, FLOOR(3.8) b, CEIL(-3.2) c, FLOOR(-3.8) d`).catch((e) => `ERROR (math functions not compiled in): ${String(e).slice(-60)}`));
  console.log("discount math:", await q(`SELECT ROUND(price * 0.9, 2) d FROM products ORDER BY price DESC LIMIT 3`));
  console.log("round-half probes:", await q(`SELECT ROUND(2.5) a, ROUND(3.5) b, ROUND(-2.5) c`));
  console.log("totals needing rounding (total != ROUND(total,2)):", await one(`SELECT COUNT(*) n FROM orders WHERE ABS(total - ROUND(total,2)) > 0.001`));
  console.log("int division truncates:", await q(`SELECT 7 / 2 a, 7.0 / 2 b, 103 / 16 c`));
}

main().catch((e) => { console.error(e); process.exit(1); });
