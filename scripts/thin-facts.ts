// Thin-spot patch probe — facts for drills (M6/M7/M8/M11), l34 non-equi
// problems, w5 upsert cases, n4 FIRST/LAST_VALUE cases.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

async function main() {
  await resetDatabase();
  const q = async (sql: string) => (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
  const one = async (sql: string) => (await q(sql))[0];
  const dump = (label: string, rows: Record<string, unknown> | Array<Record<string, unknown>>) => {
    console.log(label, JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? Number(v) : v)));
  };

  console.log("== SCHEMA ==");
  dump("tables", await q(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%' ORDER BY name`));
  for (const t of ["customers","products","suppliers","orders","order_items","expenses","invoices","payments"]) {
    try { dump(`cols ${t}`, await q(`PRAGMA table_info(${t})`)); } catch (e) { console.log(`cols ${t}: none`); }
  }

  console.log("\n== CORE CENSUS ==");
  for (const t of ["customers","products","suppliers","orders","order_items","expenses","invoices","payments"]) {
    try { console.log(t, (await one(`SELECT COUNT(*) AS n FROM ${t}`)).n); } catch (e) { console.log(t, "absent"); }
  }

  console.log("\n== NON-EQUI PROBLEM CANDIDATES (lesson-34) ==");
  // P17: product price ladder via VALUES bands (BETWEEN variant, inclusive bounds — teach the boundary contract)
  dump("price bands 0-50/50-100/100-200/200+ (>= lo AND < hi):", await q(`
    WITH bands(lo, hi, label) AS (VALUES (0, 50, 'budget'), (50, 100, 'standard'), (100, 200, 'premium'), (200, 99999, 'flagship'))
    SELECT b.label, COUNT(*) AS n FROM products p JOIN bands b ON p.price >= b.lo AND p.price < b.hi GROUP BY b.label ORDER BY MIN(b.lo)`));
  dump("price exactly 50 or 100 (boundary check):", await q(`SELECT id, name, price FROM products WHERE price IN (50, 100, 200)`));
  // P18: non-equi self-join — same supplier, price ratio
  dump("same-supplier price pairs p1.price < p2.price:", await q(`
    SELECT COUNT(*) AS n FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.price < p2.price`));
  dump("same-supplier pairs ratio < 1.5:", await q(`
    SELECT COUNT(*) AS n FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.price < p2.price AND p2.price < p1.price * 1.5`));
  dump("sample rows same-supplier cheaper->pricier:", await q(`
    SELECT p1.name AS cheaper, ROUND(p1.price,2) AS lo, p2.name AS pricier, ROUND(p2.price,2) AS hi
    FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.price < p2.price
    ORDER BY p1.price LIMIT 6`));
  dump("supplier product counts:", await q(`SELECT supplier_id, COUNT(*) AS n FROM products GROUP BY supplier_id ORDER BY supplier_id`));
  // P19: order total vs shipping-fee ladder? no shipping col. Instead: orders vs expense bands? Expenses are cents.
  dump("expenses census:", await one(`SELECT COUNT(*) AS n, MIN(amount_cents) AS lo, MAX(amount_cents) AS hi, ROUND(AVG(amount_cents),2) AS avg_c FROM expenses`));
  dump("expense bands (cents):", await q(`
    WITH bands(lo, hi, label) AS (VALUES (0, 2000, 'petty'), (2000, 10000, 'modest'), (10000, 50000, 'serious'), (50000, 999999999, 'major'))
    SELECT b.label, COUNT(*) AS n FROM expenses e JOIN bands b ON e.amount_cents >= b.lo AND e.amount_cents < b.hi GROUP BY b.label ORDER BY MIN(b.lo)`));
  // P20: customers matched to a discount-tier ladder on lifetime spend (non-equi join orders->spend bands? needs rollup)
  dump("customer lifetime spend bands:", await q(`
    WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id),
         tiers(lo, hi, label) AS (VALUES (0, 200, 'bronze'), (200, 500, 'silver'), (500, 900, 'gold'), (900, 999999, 'platinum'))
    SELECT t.label, COUNT(*) AS n FROM spend s JOIN tiers t ON s.s >= t.lo AND s.s < t.hi GROUP BY t.label ORDER BY MIN(t.lo)`));
  // P21: fanout demo — overlapping bands deliberately
  dump("overlapping bands fanout census (0-100 & 50-150):", await q(`
    WITH bands(lo, hi, label) AS (VALUES (0, 100, 'under-100'), (50, 150, 'mid-band'))
    SELECT b.label, COUNT(*) AS n FROM products p JOIN bands b ON p.price >= b.lo AND p.price < b.hi GROUP BY b.label ORDER BY b.label`));
  dump("products in BOTH overlapping bands:", await q(`
    SELECT COUNT(*) AS n FROM products p
    WHERE p.price >= 50 AND p.price < 100`));
  // P22: order totals BETWEEN self-pairs? orders o1/o2 where o1.total BETWEEN o2.total ± small window (near-twins)
  dump("near-twin orders (within 1.00 of each other, o1.id < o2.id):", await q(`
    SELECT COUNT(*) AS n FROM orders o1 JOIN orders o2 ON o1.id < o2.id AND ABS(o1.total - o2.total) <= 1.0`));
  dump("distinct totals:", await one(`SELECT COUNT(DISTINCT total) AS n, COUNT(*) AS rows_total FROM orders`));
  dump("min/max total:", await one(`SELECT ROUND(MIN(total),2) AS lo, ROUND(MAX(total),2) AS hi FROM orders`));

  console.log("\n== W5 UPSERT FACTS ==");
  dump("products 1-4:", await q(`SELECT id, name, price, stock FROM products WHERE id IN (1,2,3,4) ORDER BY id`));
  dump("product count:", await one(`SELECT COUNT(*) AS n FROM products`));
  dump("max product id:", await one(`SELECT MAX(id) AS n FROM products`));
  dump("expenses max id:", await one(`SELECT MAX(id) AS n FROM expenses`));
  dump("customers count/max:", await one(`SELECT COUNT(*) AS n, MAX(id) AS mx FROM customers`));
  dump("suppliers:", await q(`SELECT id, name FROM suppliers ORDER BY id`));
  dump("invoices max:", await one(`SELECT MAX(id) AS n FROM invoices`));
  dump("invoice 1:", await q(`SELECT * FROM invoices WHERE id = 1`));
  dump("order_items count:", await one(`SELECT COUNT(*) AS n FROM order_items`));

  console.log("\n== N4 FIRST/LAST_VALUE TEMPLATE CANDIDATES ==");
  // canonical: first/last order total per customer (full frame for LAST)
  dump("first/last per customer (5 rows):", await q(`
    SELECT customer_id,
      ROUND(FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id), 2) AS first_total,
      ROUND(LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING), 2) AS last_total
    FROM orders WHERE customer_id IN (1,2) ORDER BY created_at, id`));
  dump("default-frame LAST_VALUE lies (cust 1):", await q(`
    SELECT id, ROUND(total,2) AS total,
      ROUND(LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id), 2) AS lying_last
    FROM orders WHERE customer_id = 1 ORDER BY created_at, id LIMIT 5`));
  dump("cust1 order count:", await one(`SELECT COUNT(*) AS n FROM orders WHERE customer_id = 1`));
  dump("first_order per customer census (max per partition = own total when full frame):", await q(`
    SELECT COUNT(*) AS n FROM (
      SELECT DISTINCT customer_id,
        FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS f
      FROM orders)`));
  dump("region first-value via customers join? (no join allowed in n cases — use orders only):", await one(`SELECT COUNT(DISTINCT customer_id) AS n FROM orders`));
  dump("month first order totals (partition by month):", await q(`
    SELECT m, first_total FROM (
      SELECT SUBSTR(created_at,1,7) AS m,
        ROUND(FIRST_VALUE(total) OVER (PARTITION BY SUBSTR(created_at,1,7) ORDER BY created_at, id), 2) AS first_total
      FROM orders) WHERE m = '2024-01' ORDER BY first_total LIMIT 3`));
  dump("2024-01 first order:", await one(`SELECT id, ROUND(total,2) AS t FROM orders WHERE created_at LIKE '2024-01%' ORDER BY created_at, id LIMIT 1`));

  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
