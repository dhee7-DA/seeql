// j5-b probe 2 — nail down cs-217 ratio figures + misc verifications.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-j1b2.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const q = (sql: string) => db.query(sql).all();
const show = (label: string, rows: unknown[]) => {
  console.log(`\n== ${label}`);
  for (const r of rows) console.log(JSON.stringify(r));
};

// cs-217: explicit ratio computation
show("refund ratios explicit", q(`
  SELECT r.id, r.amount, o.total, ROUND(r.amount / o.total, 4) AS ratio, c.name
  FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
  ORDER BY ratio DESC`));
show("count ratio >= 0.5", q(`
  SELECT COUNT(*) n FROM refunds r JOIN orders o ON o.id = r.order_id
  WHERE r.amount >= o.total * 0.5`));
show("count ratio >= 0.9", q(`
  SELECT COUNT(*) n FROM refunds r JOIN orders o ON o.id = r.order_id
  WHERE r.amount >= o.total * 0.9`));
show("rows ratio >= 0.5 order by amount desc", q(`
  SELECT r.id, r.amount, o.total, c.name
  FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
  WHERE r.amount >= o.total * 0.5
  ORDER BY r.amount DESC`));
show("raw refund 2 and order 6", q(`
  SELECT r.id, r.order_id, r.amount, o.id, o.total
  FROM refunds r JOIN orders o ON o.id = r.order_id WHERE r.id = 2`));

// cs-214: cheapest product price (for p.price >= 4.5 distractor shape)
show("cheapest products", q(`SELECT name, price FROM products ORDER BY price LIMIT 4`));
show("count price >= 4.5", q(`SELECT COUNT(*) n FROM products WHERE price >= 4.5`));

// cs-212: US settled card rows + sum
show("US settled card", q(`
  SELECT p.id, p.amount, c.name, o.id AS order_id
  FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id
  WHERE p.method='card' AND p.status='settled' AND c.region='US'
  ORDER BY p.amount DESC`));
show("EU settled card count", q(`
  SELECT COUNT(*) n FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id
  WHERE p.method='card' AND p.status='settled' AND c.region='EU'`));
show("US pending card", q(`
  SELECT p.id, p.amount, c.name FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id
  WHERE p.method='card' AND p.status='pending' AND c.region='US'`));

// cs-215: rows amount >= 100
show("refunds >= 100 with processor", q(`
  SELECT e.name, e.role, r.id, r.amount, r.reason
  FROM employees e JOIN refunds r ON r.processed_by = e.id
  WHERE r.amount >= 100 ORDER BY r.amount DESC`));

// cs-211: in-transit top tickets + LEFT JOIN ghost check
show("in-transit order-by-total desc top5", q(`
  SELECT o.id, o.total, s.carrier, s.cost
  FROM orders o JOIN shipments s ON s.order_id = o.id
  WHERE s.delivered_at IS NULL ORDER BY o.total DESC LIMIT 5`));
show("LEFT JOIN version rowcount", q(`
  SELECT COUNT(*) n FROM orders o LEFT JOIN shipments s ON s.order_id = o.id
  WHERE s.delivered_at IS NULL`));

// cs-210: wrong_item rows + NATURAL JOIN sanity (audit double-checks)
show("wrong_item rows", q(`
  SELECT r.id, r.amount, e.name FROM refunds r JOIN employees e ON e.id = r.processed_by
  WHERE r.reason='wrong_item' ORDER BY r.id`));

// cs-213: order 74 verify line sum
show("order 74 sum", q(`
  SELECT ROUND(SUM(oi.quantity*oi.unit_price),2) s FROM order_items oi WHERE oi.order_id = 74`));

// cs-216: referral rows
show("referral rows", q(`
  SELECT a.id, c.name, c.city, a.spend, a.acquired_at
  FROM acquisitions a JOIN customers c ON c.id = a.customer_id
  WHERE a.channel='referral' ORDER BY a.spend DESC`));

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe2 done");
