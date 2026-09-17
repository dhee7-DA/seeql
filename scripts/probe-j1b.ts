// j5-b probe — verify every figure before it goes into cases-j1b.ts (cs-210..217).
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-j1b.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, rows: unknown[]) => {
  console.log(`\n== ${label}`);
  for (const r of rows) console.log(JSON.stringify(r));
};

// --- global sanity (known figures) ---
show("settled payments total", q(`SELECT COUNT(*) n, ROUND(SUM(amount),2) t FROM payments WHERE status='settled'`));
show("refund reasons", q(`SELECT reason, COUNT(*) n, ROUND(SUM(amount),2) t FROM refunds GROUP BY reason ORDER BY t DESC`));
show("carrier counts", q(`SELECT carrier, COUNT(*) n FROM shipments GROUP BY carrier ORDER BY n DESC`));
show("payment statuses", q(`SELECT status, COUNT(*) n FROM payments GROUP BY status`));

// --- cs-210 refunds -> employees (wrong_item) ---
show("wrong_item refunds + processor", q(`
  SELECT r.id, r.amount, r.reason, r.processed_by, e.name, e.role
  FROM refunds r JOIN employees e ON e.id = r.processed_by
  WHERE r.reason = 'wrong_item' ORDER BY r.id`));
show("refund counts per employee", q(`
  SELECT e.id, e.name, e.role, COUNT(r.id) AS n, ROUND(SUM(r.amount),2) AS total
  FROM employees e JOIN refunds r ON r.processed_by = e.id
  GROUP BY e.id ORDER BY e.id`));
show("all employees", q(`SELECT id, name, role, manager_id, region FROM employees ORDER BY id`));

// --- cs-211 shipments ---
show("shipments in transit (delivered_at NULL)", q(`
  SELECT s.id, s.order_id, s.carrier, s.cost, o.status, o.total
  FROM shipments s JOIN orders o ON o.id = s.order_id
  WHERE s.delivered_at IS NULL ORDER BY s.cost DESC`));
show("shipments count/distinct", q(`SELECT COUNT(*) n, COUNT(DISTINCT order_id) d FROM shipments`));
show("orders w/o shipment (unshipped)", q(`
  SELECT COUNT(*) n FROM orders o
  JOIN shipments s ON s.order_id = o.id
  WHERE o.shipped_at IS NULL`));
show("orders count vs orders-with-shipment", q(`
  SELECT (SELECT COUNT(*) FROM orders) o_n,
         (SELECT COUNT(DISTINCT order_id) FROM shipments) s_d`));
show("LocalPost shipments joined", q(`
  SELECT s.id, s.carrier, s.cost, o.id AS order_id, o.status
  FROM shipments s JOIN orders o ON o.id = s.order_id
  WHERE s.carrier = 'LocalPost' ORDER BY s.cost DESC`));

// --- cs-212 payments -> orders -> customers ---
show("settled card by region", q(`
  SELECT c.region, c.name, p.id, p.amount, p.method, o.id AS order_id
  FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id
  WHERE p.status='settled' AND p.method='card' ORDER BY c.region, p.amount DESC`));
show("regions", q(`SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY region`));
show("settled method counts", q(`SELECT method, COUNT(*) n, ROUND(SUM(amount),2) t FROM payments WHERE status='settled' GROUP BY method`));

// --- cs-213 order_items -> products ---
show("biggest orders", q(`SELECT id, customer_id, status, total FROM orders ORDER BY total DESC LIMIT 6`));
show("order 74 lines", q(`
  SELECT oi.id, oi.product_id, p.name, p.category, oi.quantity, oi.unit_price, p.price
  FROM order_items oi JOIN products p ON p.id = oi.product_id
  WHERE oi.order_id = 74 ORDER BY oi.id`));
show("unit_price vs price mismatch count", q(`
  SELECT COUNT(*) n FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.unit_price != p.price`));
show("items per order for big orders", q(`
  SELECT oi.order_id, o.total, COUNT(*) lines, ROUND(SUM(oi.quantity*oi.unit_price),2) lines_sum
  FROM order_items oi JOIN orders o ON o.id = oi.order_id
  GROUP BY oi.order_id ORDER BY o.total DESC LIMIT 6`));

// --- cs-214 products -> suppliers ---
show("suppliers", q(`SELECT * FROM suppliers ORDER BY id`));
show("products per supplier", q(`
  SELECT s.id, s.name, s.region, s.rating, COUNT(p.id) n, ROUND(MAX(p.price),2) mx
  FROM suppliers s JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY s.id`));
show("products of top-rated suppliers", q(`
  SELECT p.id, p.name, p.price, p.category, s.name AS supplier, s.rating
  FROM products p JOIN suppliers s ON s.id = p.supplier_id
  WHERE s.rating >= 4.5 ORDER BY p.price DESC`));

// --- cs-215 employees -> refunds (INNER drops) ---
show("employees x refunds all", q(`
  SELECT e.id, e.name, e.role, r.id AS refund_id, r.amount, r.reason
  FROM employees e JOIN refunds r ON r.processed_by = e.id
  ORDER BY e.id, r.id`));
show("rep-filtered version", q(`
  SELECT e.name, e.role, r.id, r.amount, r.reason
  FROM employees e JOIN refunds r ON r.processed_by = e.id
  WHERE e.role = 'rep' ORDER BY r.id`));

// --- cs-216 acquisitions -> customers ---
show("acquisitions joined", q(`
  SELECT a.id, a.customer_id, c.name, c.city, a.channel, a.spend, a.acquired_at
  FROM acquisitions a JOIN customers c ON c.id = a.customer_id ORDER BY a.id`));
show("channel breakdown", q(`SELECT channel, COUNT(*) n, ROUND(SUM(spend),2) t, ROUND(AVG(spend),2) avg FROM acquisitions GROUP BY channel ORDER BY channel`));
show("customers without acquisition rows", q(`
  SELECT c.id, c.name FROM customers c
  LEFT JOIN acquisitions a ON a.customer_id = c.id
  WHERE a.id IS NULL`));

// --- cs-217 refunds -> orders -> customers (fraud) ---
show("refunds with buyer, amount desc", q(`
  SELECT r.id, r.amount, r.reason, o.id AS order_id, o.total, c.name, c.city
  FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
  ORDER BY r.amount DESC`));
show("refund share of order (>=50%)", q(`
  SELECT r.id, r.amount, o.total, c.name
  FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
  WHERE r.amount >= o.total * 0.5 ORDER BY r.amount DESC`));

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done");
