// Module 14 + messy-tier fact verification — the source of truth for every
// number cited in lessons 65-70. Resets the DB, then probes the warehouse
// contract (grain, SCD windows, conformance) and the dirty-log census
// (classes, fingerprint dedupe, money gate). Run: bun scripts/warehouse-facts.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

const q = async (sql: string) => db.$queryRawUnsafe(sql);
const one = async (sql: string): Promise<number> => {
  const r = (await q(sql)) as Array<Record<string, unknown>>;
  return Number(Object.values(r[0] ?? { n: 0 })[0]);
};

await resetDatabase();

console.log("== counts ==");
for (const t of ["dim_date", "dim_product", "dim_customer", "dim_store", "fact_sales", "fact_returns", "events_dirty"]) {
  console.log(t, await one(`SELECT COUNT(*) n FROM ${t}`));
}

console.log("\n== grain contracts ==");
console.log("order_lines(non-cancelled):", await one(`SELECT COUNT(*) n FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status != 'cancelled'`));
console.log("distinct order+product pairs:", await one(`SELECT COUNT(DISTINCT oi.order_id || '-' || oi.product_id) n FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status != 'cancelled'`));
console.log("fact distinct order+product:", await one(`SELECT COUNT(DISTINCT order_id || '-' || product_key) n FROM fact_sales`));

console.log("\n== SCD ==");
console.log("versions over 16 buyers:", await one(`SELECT COUNT(DISTINCT customer_id) n FROM dim_customer`));
console.log("movers (multi-version):", await one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM dim_customer GROUP BY customer_id HAVING COUNT(*) > 1)`));
console.log("current rows:", await one(`SELECT COUNT(*) n FROM dim_customer WHERE is_current = 1`));
console.log("bruno versions:", await q(`SELECT customer_sk, region, valid_from, valid_to, is_current FROM dim_customer WHERE customer_id = 2 ORDER BY customer_sk`));
console.log("as-of probe 2024-09-15 bruno:", await q(`SELECT region FROM dim_customer WHERE customer_id = 2 AND '2024-09-15' >= valid_from AND '2024-09-15' < valid_to`));
console.log("sale-key integrity (fact sk resolves at sale date):", await one(`
  SELECT COUNT(*) n FROM fact_sales f
  JOIN orders o ON o.id = f.order_id
  JOIN dim_customer dc ON dc.customer_sk = f.customer_key
  WHERE NOT (o.created_at >= dc.valid_from AND o.created_at < dc.valid_to)`));

console.log("\n== money ==");
console.log("net total cents:", await one(`SELECT SUM(net_cents) n FROM fact_sales`));
console.log("gross total cents:", await one(`SELECT SUM(gross_cents) n FROM fact_sales`));
console.log("discount lines:", await one(`SELECT COUNT(*) n FROM fact_sales WHERE discount_cents > 0`));
console.log("net by department:", await q(`SELECT d.department, ROUND(SUM(f.net_cents)/100.0, 2) net_dollars FROM fact_sales f JOIN dim_product d ON d.product_key = f.product_key GROUP BY d.department ORDER BY net_dollars DESC`));
console.log("quarter grid cells:", await q(`SELECT dd.year, dd.quarter, d.department, ROUND(SUM(f.net_cents)/100.0, 2) net_dollars FROM fact_sales f JOIN dim_date dd ON dd.date_key = f.date_key JOIN dim_product d ON d.product_key = f.product_key GROUP BY dd.year, dd.quarter, d.department ORDER BY dd.year, dd.quarter, d.department`));
console.log("weekend share:", await q(`SELECT COUNT(*) total_lines, SUM(dd.is_weekend) weekend_lines, ROUND(AVG(dd.is_weekend)*100, 1) share_pct FROM fact_sales f JOIN dim_date dd ON dd.date_key = f.date_key`));
console.log("months with sales:", await one(`SELECT COUNT(DISTINCT dd.month) n FROM fact_sales f JOIN dim_date dd ON dd.date_key = f.date_key`));
console.log("top 4 months:", await q(`SELECT dd.month, ROUND(SUM(f.net_cents)/100.0, 2) net_dollars FROM fact_sales f JOIN dim_date dd ON dd.date_key = f.date_key GROUP BY dd.month ORDER BY net_dollars DESC, dd.month ASC LIMIT 4`));
console.log("region mix trend rows:", await q(`SELECT COUNT(*) n FROM (SELECT dd.month, dc.region FROM fact_sales f JOIN dim_date dd ON dd.date_key = f.date_key JOIN dim_customer dc ON dc.customer_sk = f.customer_key GROUP BY dd.month, dc.region)`));
console.log("top buyer per year share:", await q(`
  SELECT year, net_dollars,
         ROUND(net_dollars * 100.0 / year_total, 1) AS top_buyer_share_pct
  FROM (
    SELECT *, SUM(net_dollars) OVER (PARTITION BY year) AS year_total
    FROM (
      SELECT dd.year, dc.name, SUM(f.net_cents)/100.0 AS net_dollars,
             ROW_NUMBER() OVER (PARTITION BY dd.year ORDER BY SUM(f.net_cents) DESC) AS rn
      FROM fact_sales f
      JOIN dim_date dd ON dd.date_key = f.date_key
      JOIN dim_customer dc ON dc.customer_sk = f.customer_key
      GROUP BY dd.year, dc.customer_id
    )
  ) WHERE rn = 1 ORDER BY year`));

console.log("\n== returns / conformance ==");
console.log("returns joined to same dims ok:", await one(`SELECT COUNT(*) n FROM fact_returns r JOIN dim_product d ON d.product_key = r.product_key JOIN dim_customer c ON c.customer_sk = r.customer_key JOIN dim_date dd ON dd.date_key = r.date_key`));
console.log("refund total cents:", await one(`SELECT SUM(refund_cents) n FROM fact_returns`));
console.log("refund by department:", await q(`SELECT d.department, SUM(r.refund_cents) refund_cents FROM fact_returns r JOIN dim_product d ON d.product_key = r.product_key GROUP BY d.department`));
console.log("return rate by department:", await q(`SELECT d.department, COUNT(DISTINCT r.sales_line_id) returned_lines, (SELECT COUNT(*) FROM fact_sales fs JOIN dim_product dp ON dp.product_key = fs.product_key WHERE dp.department = d.department) sold_lines FROM fact_returns r JOIN dim_product d ON d.product_key = r.product_key GROUP BY d.department`));

console.log("\n== margin (for capstone) ==");
console.log("margin by department:", await q(`SELECT d.department, ROUND(SUM(f.net_cents - f.quantity * d.unit_cost_cents)/100.0, 2) margin_dollars FROM fact_sales f JOIN dim_product d ON d.product_key = f.product_key GROUP BY d.department ORDER BY margin_dollars DESC`));

console.log("\n== dirty census ==");
console.log("raw rows:", await one(`SELECT COUNT(*) n FROM events_dirty`));
console.log("drifted ts (space):", await one(`SELECT COUNT(*) n FROM events_dirty WHERE event_ts LIKE '% %'`));
console.log("anonymous (NULL user):", await one(`SELECT COUNT(*) n FROM events_dirty WHERE user_id IS NULL`));
console.log("bots:", await one(`SELECT COUNT(*) n FROM events_dirty WHERE user_id >= 900`));
console.log("known:", await one(`SELECT COUNT(*) n FROM events_dirty WHERE user_id IS NOT NULL AND user_id < 900`));
console.log("whitespace pages:", await one(`SELECT COUNT(*) n FROM events_dirty WHERE page != trim(page)`));
console.log("action spellings raw:", await one(`SELECT COUNT(DISTINCT action) n FROM events_dirty`));
console.log("action spellings canonical:", await one(`SELECT COUNT(DISTINCT lower(trim(action))) n FROM events_dirty`));
console.log("page spellings raw:", await one(`SELECT COUNT(DISTINCT page) n FROM events_dirty`));
console.log("page spellings canonical:", await one(`SELECT COUNT(DISTINCT trim(page)) n FROM events_dirty`));
console.log("broken money (text):", await q(`SELECT typeof(amount_cents) t, COUNT(*) n FROM events_dirty WHERE amount_cents IS NOT NULL GROUP BY t`));
console.log("purchase money (int only):", await one(`SELECT SUM(CASE WHEN typeof(amount_cents)='integer' THEN amount_cents END) n FROM events_dirty`));
console.log("fingerprint count (clean):", await one(`
  SELECT COUNT(*) n FROM (
    SELECT ROW_NUMBER() OVER (PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents ORDER BY id) rn
    FROM events_dirty) WHERE rn = 1`));
console.log("quarantined:", await one(`
  SELECT COUNT(*) n FROM (
    SELECT ROW_NUMBER() OVER (PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents ORDER BY id) rn
    FROM events_dirty) WHERE rn > 1`));
console.log("replay group sizes:", await q(`SELECT n_copies, COUNT(*) groups FROM (SELECT event_ts, user_id, lower(trim(action)) a, trim(page) p, amount_cents amt, COUNT(*) n_copies FROM events_dirty GROUP BY event_ts, user_id, a, p, amt HAVING n_copies > 1) GROUP BY n_copies ORDER BY n_copies`));
console.log("clean class census:", await q(`
  SELECT CASE WHEN user_id IS NULL THEN 'anonymous' WHEN user_id >= 900 THEN 'bot' ELSE 'known' END cls, COUNT(*) n FROM (
    SELECT user_id FROM (
      SELECT id, user_id, ROW_NUMBER() OVER (PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents ORDER BY id) rn
      FROM events_dirty) WHERE rn = 1) GROUP BY cls ORDER BY n DESC`));
console.log("raw class census:", await q(`SELECT CASE WHEN user_id IS NULL THEN 'anonymous' WHEN user_id >= 900 THEN 'bot' ELSE 'known' END cls, COUNT(*) n FROM events_dirty GROUP BY cls ORDER BY n DESC`));
console.log("replay classes (quarantine):", await q(`
  SELECT lower(trim(action)) a, COUNT(*) replays FROM (
    SELECT action FROM (
      SELECT id, action, ROW_NUMBER() OVER (PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents ORDER BY id) rn
      FROM events_dirty) WHERE rn > 1) GROUP BY a ORDER BY replays DESC, a`));
console.log("top clean users:", await q(`
  SELECT user_id, COUNT(*) events FROM (
    SELECT user_id FROM (
      SELECT id, user_id, ROW_NUMBER() OVER (PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents ORDER BY id) rn
      FROM events_dirty) WHERE rn = 1 AND user_id IS NOT NULL AND user_id < 900) GROUP BY user_id ORDER BY events DESC, user_id LIMIT 5`));
console.log("money gate clean:", await one(`
  SELECT SUM(CASE WHEN typeof(amount_cents)='integer' THEN amount_cents END) n FROM (
    SELECT amount_cents FROM (
      SELECT id, amount_cents, ROW_NUMBER() OVER (PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents ORDER BY id) rn
      FROM events_dirty) WHERE rn = 1) WHERE typeof(amount_cents)='integer'`));
console.log("julianday parses all:", await one(`SELECT COUNT(*) n FROM events_dirty WHERE julianday(replace(event_ts, ' ', 'T')) IS NULL`));

await db.$disconnect();
