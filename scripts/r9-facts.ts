// Round 9 — authoring fact sheet: every number the pack content may cite.
// Output saved to scripts/r9-facts.txt and read while writing statements.
import Database from "bun:sqlite";
import { DM_RETAIL_SCHEMA } from "../src/lib/leetcode/content/dm-retail-schema";
import { DM_RETAIL_SEED } from "../src/lib/leetcode/content/dm-retail-seed";

const db = new Database(":memory:");
db.exec(DM_RETAIL_SCHEMA.ddl);
db.exec(DM_RETAIL_SEED);
const q = (sql: string) => db.prepare(sql).all();
const show = (title: string, sql: string) => {
  console.log(`\n## ${title}`);
  for (const r of q(sql)) console.log("  " + JSON.stringify(r));
};

show("customer order/line counts (all statuses)", `
  SELECT c.customer_id, COUNT(DISTINCT o.order_id) orders, COUNT(oi.order_item_id) lines
  FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.customer_id
  LEFT JOIN order_items oi ON oi.order_id = o.order_id
  GROUP BY c.customer_id ORDER BY c.customer_id`);

show("per-customer DELIVERED gross + net + orders + last/first order", `
  SELECT c.customer_id, COUNT(DISTINCT o.order_id) dorders,
         SUM(oi.quantity * oi.unit_price_cents) gross,
         SUM(oi.quantity * oi.unit_price_cents - COALESCE(oi.discount_cents,0)) net,
         MIN(o.order_date) first_o, MAX(o.order_date) last_o
  FROM customers c
  JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'delivered'
  JOIN order_items oi ON oi.order_id = o.order_id
  GROUP BY c.customer_id ORDER BY gross DESC`);

show("delivered revenue by day (top 8)", `
  SELECT o.order_date, SUM(oi.quantity * oi.unit_price_cents) gross, COUNT(DISTINCT o.order_id) n
  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY o.order_date ORDER BY gross DESC LIMIT 8`);

show("category units + gross (delivered)", `
  SELECT p.category, SUM(oi.quantity) units,
         SUM(oi.quantity * oi.unit_price_cents) gross,
         SUM(oi.quantity * (oi.unit_price_cents - p.cost_cents)) margin
  FROM order_items oi
  JOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'
  JOIN products p ON p.product_id = oi.product_id
  GROUP BY p.category ORDER BY gross DESC`);

show("per-product units + gross (delivered, top 14)", `
  SELECT p.product_id, p.name, p.category, SUM(oi.quantity) units,
         SUM(oi.quantity * oi.unit_price_cents) gross
  FROM order_items oi
  JOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'
  JOIN products p ON p.product_id = oi.product_id
  GROUP BY p.product_id ORDER BY gross DESC`);

show("monthly delivered gross", `
  SELECT strftime('%Y-%m', o.order_date) m, SUM(oi.quantity * oi.unit_price_cents) gross,
         COUNT(DISTINCT o.order_id) n
  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY m ORDER BY m`);

show("region delivered gross (customers)", `
  SELECT c.region, COUNT(DISTINCT o.order_id) n, SUM(oi.quantity * oi.unit_price_cents) gross
  FROM customers c
  JOIN orders o ON o.customer_id = c.customer_id AND o.status='delivered'
  JOIN order_items oi ON oi.order_id = o.order_id
  GROUP BY c.region ORDER BY gross DESC`);

show("event funnels per customer (07-20..23)", `
  SELECT customer_id,
         SUM(event_type='view') views, SUM(event_type='cart') carts,
         SUM(event_type='checkout') checkouts
  FROM events GROUP BY customer_id ORDER BY customer_id`);

show("AOV per customer (delivered, revenue/own orders)", `
  SELECT o.customer_id, SUM(oi.quantity*oi.unit_price_cents) gross, COUNT(DISTINCT o.order_id) n,
         ROUND(SUM(oi.quantity*oi.unit_price_cents)*1.0 / COUNT(DISTINCT o.order_id), 2) aov
  FROM orders o JOIN order_items oi ON oi.order_id=o.order_id
  WHERE o.status='delivered'
  GROUP BY o.customer_id ORDER BY aov DESC`);

show("discount totals per customer (delivered)", `
  SELECT o.customer_id, COUNT(*) rows_, SUM(oi.discount_cents) total_disc
  FROM order_items oi JOIN orders o ON o.order_id = oi.order_id AND o.status='delivered'
  WHERE oi.discount_cents IS NOT NULL
  GROUP BY o.customer_id ORDER BY total_disc DESC`);

show("returns per customer", `
  SELECT o.customer_id, COUNT(*) n,
         SUM(oi.quantity * oi.unit_price_cents) returned_value
  FROM returns r JOIN order_items oi ON oi.order_item_id = r.order_item_id
  JOIN orders o ON o.order_id = oi.order_id
  GROUP BY o.customer_id ORDER BY n DESC`);

show("sessions per customer (1800s gap cutoff)", `
  WITH seq AS (
    SELECT customer_id, event_ts,
           LAG(event_ts) OVER (PARTITION BY customer_id ORDER BY event_ts) prev_ts
    FROM events),
    stamps AS (
    SELECT customer_id, event_ts,
           SUM(CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800 THEN 1 ELSE 0 END)
             OVER (PARTITION BY customer_id ORDER BY event_ts ROWS UNBOUNDED PRECEDING) sess
    FROM seq)
  SELECT customer_id, COUNT(DISTINCT sess) sessions FROM stamps
  GROUP BY customer_id ORDER BY customer_id`);

show("event counts per customer per day", `
  SELECT customer_id, strftime('%Y-%m-%d', event_ts, 'unixepoch') d, COUNT(*) n
  FROM events GROUP BY customer_id, d ORDER BY customer_id, d LIMIT 40`);

show("quantity distribution", `
  SELECT quantity, COUNT(*) n FROM order_items GROUP BY quantity ORDER BY quantity`);

show("orders per customer (any status) ranked", `
  SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id ORDER BY n DESC, customer_id`);

show("distinct cities / pages", `
  SELECT (SELECT COUNT(DISTINCT city) FROM customers) cities,
         (SELECT COUNT(DISTINCT page) FROM events) pages,
         (SELECT COUNT(DISTINCT region) FROM customers) regions`);

show("category per-customer spend (delivered, C1 sample)", `
  SELECT p.category, SUM(oi.quantity*oi.unit_price_cents) gross
  FROM order_items oi JOIN orders o ON o.order_id=oi.order_id AND o.status='delivered'
  JOIN products p ON p.product_id=oi.product_id
  WHERE o.customer_id=1 GROUP BY p.category ORDER BY gross DESC`);

show("product margin rate sample (for MCQs)", `
  SELECT product_id, name, price_cents, cost_cents,
         ROUND(100.0*(price_cents-cost_cents)/price_cents, 1) margin_pct
  FROM products ORDER BY margin_pct DESC LIMIT 5`);

db.close();
console.log("\nFACT SHEET COMPLETE");
