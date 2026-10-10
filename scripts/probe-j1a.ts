// j5-a probe 2 — fill remaining figure gaps for cs-202..209.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-j1a.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, rows: unknown[]) => {
  console.log(`\n== ${label}`);
  for (const r of rows) console.log(JSON.stringify(r));
};

// cs-205: employees full + leads' refunds
show("employees with hired_at", q(`SELECT id, name, role, region, hired_at FROM employees ORDER BY id`));
show("lead-processed refunds", q(`
  SELECT r.id, r.order_id, r.reason, r.amount, r.refunded_at, e.name, e.region
  FROM refunds r JOIN employees e ON r.processed_by = e.id
  WHERE e.role = 'lead' ORDER BY r.refunded_at`));
show("refund count per employee", q(`
  SELECT e.id, e.name, e.role, COUNT(r.id) n
  FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id
  GROUP BY e.id ORDER BY e.id`));

// cs-206: the exact 5 rows + supplier product detail
show("rating>=4.4 price>=60 rows", q(`
  SELECT p.name, p.category, p.price, s.name AS supplier, s.rating
  FROM products p JOIN suppliers s ON p.supplier_id = s.id
  WHERE s.rating >= 4.4 AND p.price >= 60
  ORDER BY p.price DESC`));
show("rating>=4.8 price>=60 (distractor 4.8)", q(`
  SELECT COUNT(*) n FROM products p JOIN suppliers s ON p.supplier_id=s.id WHERE s.rating>=4.8 AND p.price>=60`));
show("rating>=4.0 price>=60 (distractor 4.0)", q(`
  SELECT COUNT(*) n FROM products p JOIN suppliers s ON p.supplier_id=s.id WHERE s.rating>=4.0 AND p.price>=60`));
show("rating>=3.9 price>=60 (distractor 3.9)", q(`
  SELECT COUNT(*) n FROM products p JOIN suppliers s ON p.supplier_id=s.id WHERE s.rating>=3.9 AND p.price>=60`));
show("price>=100 (distractor 100)", q(`
  SELECT COUNT(*) n FROM products p JOIN suppliers s ON p.supplier_id=s.id WHERE s.rating>=4.4 AND p.price>=100`));
show("price>=70 (distractor 70)", q(`
  SELECT COUNT(*) n FROM products p JOIN suppliers s ON p.supplier_id=s.id WHERE s.rating>=4.4 AND p.price>=70`));
show("supplier 5/1 product detail", q(`SELECT id, name, category, price, stock, supplier_id FROM products WHERE supplier_id IN (1,4,5) ORDER BY supplier_id, price DESC`));

// cs-209: spend>=25 rows with names
show("spend>=25 rows", q(`
  SELECT a.channel, a.spend, c.name, c.city
  FROM acquisitions a JOIN customers c ON a.customer_id = c.id
  WHERE a.spend >= 25 ORDER BY a.spend DESC`));
show("spend>=40 (distractor)", q(`SELECT COUNT(*) n FROM acquisitions WHERE spend>=40`));
show("spend>=35 (distractor)", q(`SELECT COUNT(*) n FROM acquisitions WHERE spend>=35`));
show("acquired_at range", q(`SELECT MIN(acquired_at) mn, MAX(acquired_at) mx FROM acquisitions`));

// cs-207: delivered unit_price>=100 summary stats
show("delivered >=100: count + sum + max", q(`
  SELECT COUNT(*) n, ROUND(SUM(oi.quantity*oi.unit_price),2) line_value, ROUND(MAX(oi.unit_price),2) mx
  FROM order_items oi JOIN orders o ON o.id=oi.order_id
  WHERE o.status='delivered' AND oi.unit_price>=100`));
show("delivered orders count", q(`SELECT COUNT(DISTINCT o.id) n FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.status='delivered'`));
show("order 33 delivered line >=100", q(`
  SELECT o.id, p.name, oi.quantity, oi.unit_price
  FROM order_items oi JOIN orders o ON oi.order_id=o.id JOIN products p ON oi.product_id=p.id
  WHERE o.status='delivered' AND oi.unit_price>=100 AND o.id=33`));
show("total order_items value sanity (all orders)", q(`SELECT ROUND(SUM(quantity*unit_price),2) v FROM order_items`));

// cs-202: top wallet rows + format check
show("wallet settled top 3 exact", q(`
  SELECT p.id, p.amount, o.total FROM payments p JOIN orders o ON o.id=p.order_id
  WHERE p.method='wallet' AND p.status='settled' ORDER BY p.amount DESC LIMIT 3`));
show("wallet rows where amount != order total", q(`
  SELECT p.id, p.amount, o.total FROM payments p JOIN orders o ON o.id=p.order_id
  WHERE p.method='wallet' AND p.status='settled' AND p.amount != o.total`));

// cs-203: pending >=400 — customer emails + order ages
show("pending >=400 detail", q(`
  SELECT o.id, c.name, c.email, o.total, o.created_at
  FROM orders o JOIN customers c ON c.id=o.customer_id
  WHERE o.status='pending' AND o.total>=400 ORDER BY o.total DESC`));
show("pending >=600 (distractor)", q(`SELECT COUNT(*) n FROM orders WHERE status='pending' AND total>=600`));
show("pending >=300 (distractor)", q(`SELECT COUNT(*) n FROM orders WHERE status='pending' AND total>=300`));

// cs-204: DHL in transit — cost sum + oldest
show("DHL in transit detail", q(`
  SELECT s.id, s.cost, s.shipped_at, o.id AS order_id, c.name
  FROM shipments s JOIN orders o ON s.order_id=o.id JOIN customers c ON c.id=o.customer_id
  WHERE s.carrier='DHL' AND s.delivered_at IS NULL ORDER BY s.cost DESC`));
show("UPS in transit (distractor count)", q(`SELECT COUNT(*) n FROM shipments WHERE carrier='UPS' AND delivered_at IS NULL`));
show("FedEx in transit (distractor count)", q(`SELECT COUNT(*) n FROM shipments WHERE carrier='FedEx' AND delivered_at IS NULL`));
show("DHL delivered (NOT NULL count)", q(`SELECT COUNT(*) n FROM shipments WHERE carrier='DHL' AND delivered_at IS NOT NULL`));

// cs-208: damaged >=50 detail + thresholds
show("damaged>=40 (distractor)", q(`SELECT COUNT(*) n FROM refunds WHERE reason='damaged' AND amount>=40`));
show("damaged>=100 (distractor)", q(`SELECT COUNT(*) n FROM refunds WHERE reason='damaged' AND amount>=100`));
show("late_delivery>=50 (distractor literal)", q(`SELECT COUNT(*) n FROM refunds WHERE reason='late_delivery' AND amount>=50`));
show("damaged total + top", q(`
  SELECT r.id, r.amount, o.total, c.name FROM refunds r JOIN orders o ON r.order_id=o.id JOIN customers c ON o.customer_id=c.id
  WHERE r.reason='damaged' AND r.amount>=50 ORDER BY r.amount DESC LIMIT 4`));
show("refund amounts vs order totals (any refund >= total?)", q(`
  SELECT COUNT(*) n FROM refunds r JOIN orders o ON r.order_id=o.id WHERE r.amount >= o.total`));

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe2 done");
