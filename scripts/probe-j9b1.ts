// j9-b probe round 1 — self-join pair facts across every candidate table.
// Run from PROJECT ROOT: bun scripts/probe-j9b1.ts
// Probes scripts/.tmp-j9b.db (readonly copy of db/custom.db).
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.tmp-j9b.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  try {
    const rows = q(sql);
    for (const r of rows) console.log(JSON.stringify(r));
    if (rows.length === 0) console.log("(0 rows)");
  } catch (e) {
    console.log("ERROR:", e instanceof Error ? e.message : e);
  }
};

// ---------- payments: split-payment self-join ----------
show("payments per order distribution", `
SELECT n, COUNT(*) AS orders FROM (
  SELECT order_id, COUNT(*) AS n FROM payments GROUP BY order_id
) GROUP BY n ORDER BY n;`);
show("payment statuses", `SELECT status, COUNT(*) FROM payments GROUP BY status;`);
show("split-payment PAIRS p1.id < p2.id", `
SELECT p1.order_id, p1.id, p1.amount, p1.method, p1.status, p1.paid_at,
       p2.id, p2.amount, p2.method, p2.status, p2.paid_at
FROM payments p1
JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id
ORDER BY p1.order_id;`);
show("operator battle on payments pair guard", `
SELECT
  (SELECT COUNT(*) FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id) AS lt,
  (SELECT COUNT(*) FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id <= p2.id) AS lte,
  (SELECT COUNT(*) FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id <> p2.id) AS neq,
  (SELECT COUNT(*) FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id) AS bare,
  (SELECT COUNT(*) FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id = p2.id) AS eq_id;`);
show("split orders: pair sum vs ticket", `
SELECT o.id, c.name, o.status, o.total,
       ROUND(p1.amount + p2.amount, 2) AS pair_sum,
       ROUND(o.total - (p1.amount + p2.amount), 2) AS gap,
       p1.id, p1.amount, p1.method, p1.status,
       p2.id, p2.amount, p2.method, p2.status
FROM payments p1
JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id
JOIN orders o ON o.id = p1.order_id
JOIN customers c ON c.id = o.customer_id
ORDER BY o.id;`);
show("split orders — methods equal? statuses equal?", `
SELECT p1.order_id,
  p1.method = p2.method AS same_method,
  p1.status = p2.status AS same_status,
  ROUND(p2.amount - p1.amount, 2) AS amount_gap
FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id;`);
show("settled split pairs only", `
SELECT COUNT(*) AS n FROM payments p1
JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id
WHERE p1.status = 'settled' AND p2.status = 'settled';`);
show("pair sum exceeding ticket anywhere?", `
SELECT o.id, o.total, ROUND(p1.amount + p2.amount, 2) AS pair_sum
FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id
JOIN orders o ON o.id = p1.order_id
WHERE p1.amount + p2.amount > o.total;`);

// ---------- acquisitions: repeat touches ----------
show("touches per customer", `
SELECT n, COUNT(*) AS customers FROM (
  SELECT customer_id, COUNT(*) AS n FROM acquisitions GROUP BY customer_id
) GROUP BY n;`);
show("acquisition self-join pairs a1.id < a2.id", `
SELECT a1.id, a1.customer_id, c.name, a1.channel, a1.spend, a1.touched_at,
       a2.id, a2.channel, a2.spend, a2.touched_at
FROM acquisitions a1
JOIN acquisitions a2 ON a1.customer_id = a2.customer_id AND a1.id < a2.id;`);
show("operator battle on acquisitions guard", `
SELECT
  (SELECT COUNT(*) FROM acquisitions a1 JOIN acquisitions a2 ON a1.customer_id = a2.customer_id AND a1.id < a2.id) AS lt,
  (SELECT COUNT(*) FROM acquisitions a1 JOIN acquisitions a2 ON a1.customer_id = a2.customer_id AND a1.id <= a2.id) AS lte,
  (SELECT COUNT(*) FROM acquisitions a1 JOIN acquisitions a2 ON a1.customer_id = a2.customer_id AND a1.id <> a2.id) AS neq,
  (SELECT COUNT(*) FROM acquisitions a1 JOIN acquisitions a2 ON a1.customer_id = a2.customer_id) AS bare;`);
show("channel drift pair (channel changed between touches)", `
SELECT c.name, a1.channel, a1.spend, a2.channel, a2.spend,
       ROUND(a2.spend - a1.spend, 2) AS spend_delta, a1.touched_at, a2.touched_at
FROM acquisitions a1
JOIN acquisitions a2 ON a1.customer_id = a2.customer_id AND a1.id < a2.id
JOIN customers c ON c.id = a1.customer_id
WHERE a1.channel <> a2.channel;`);

// ---------- orders: repeat buyers ----------
show("orders per customer distribution", `
SELECT n, COUNT(*) AS customers FROM (
  SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id
) GROUP BY n ORDER BY n;`);
show("repeat-buyer pair totals (operator battle)", `
SELECT
  (SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id) AS lt,
  (SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id <= o2.id) AS lte,
  (SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id <> o2.id) AS neq,
  (SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id) AS bare;`);
show("repeat-buyer pairs per customer (aggregate over self-join)", `
SELECT c.name, COUNT(*) AS pairs, MIN(o1.id) AS first_o, MAX(o2.id) AS last_o
FROM orders o1
JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
JOIN customers c ON c.id = o1.customer_id
GROUP BY c.id ORDER BY pairs DESC;`);
show("exactly-one-order customers (LEFT self-join ghost)", `
SELECT c.name, o1.id AS the_only_order
FROM orders o1
LEFT JOIN orders o2 ON o2.customer_id = o1.customer_id AND o2.id <> o1.id
JOIN customers c ON c.id = o1.customer_id
WHERE o2.id IS NULL;`);
show("repeat-buyer pairs, same status both sides", `
SELECT o1.status, COUNT(*) AS same_status_pairs
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
WHERE o1.status = o2.status GROUP BY o1.status;`);
show("first vs second order: spend direction", `
SELECT
  SUM(CASE WHEN o2.total > o1.total THEN 1 ELSE 0 END) AS grew,
  SUM(CASE WHEN o2.total < o1.total THEN 1 ELSE 0 END) AS shrank,
  SUM(CASE WHEN o2.total = o1.total THEN 1 ELSE 0 END) AS same
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id;`);
show("customers whose 2nd order was bigger (top sample)", `
SELECT c.name, o1.id, ROUND(o1.total,2) AS t1, o2.id, ROUND(o2.total,2) AS t2
FROM orders o1
JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
JOIN customers c ON c.id = o1.customer_id
WHERE o2.total > o1.total ORDER BY o2.total - o1.total DESC LIMIT 6;`);

// ---------- products: shared suppliers ----------
show("products per supplier", `
SELECT s.name, COUNT(*) AS n FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id ORDER BY n DESC;`);
show("product supplier-mate pairs (operator battle)", `
SELECT
  (SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id) AS lt,
  (SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id <= p2.id) AS lte,
  (SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id <> p2.id) AS neq;`);
show("supplier-mate pairs detail", `
SELECT s.name, p1.id, p1.name, ROUND(p1.price,2), p1.category,
       p2.id, p2.name, ROUND(p2.price,2), p2.category
FROM products p1
JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id
JOIN suppliers s ON s.id = p1.supplier_id
ORDER BY s.name, p1.id;`);
show("same-category supplier-mate pairs", `
SELECT COUNT(*) AS same_cat FROM products p1
JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id
WHERE p1.category = p2.category;`);
show("price-gap pairs >= 50 within a supplier", `
SELECT s.name, p1.name, ROUND(p1.price,2), p2.name, ROUND(p2.price,2), ROUND(p2.price - p1.price,2) AS gap
FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id
JOIN suppliers s ON s.id = p1.supplier_id
WHERE p2.price - p1.price >= 50 ORDER BY gap DESC;`);
show("products with NO supplier-mate (LEFT self-join ghost)", `
SELECT p1.name, s.name AS supplier
FROM products p1
LEFT JOIN products p2 ON p2.supplier_id = p1.supplier_id AND p2.id <> p1.id
JOIN suppliers s ON s.id = p1.supplier_id
WHERE p2.id IS NULL;`);

// ---------- refunds: same-order pairs ----------
show("refunds per order distribution", `
SELECT n, COUNT(*) AS orders FROM (
  SELECT order_id, COUNT(*) AS n FROM refunds GROUP BY order_id
) GROUP BY n;`);
show("double-refund PAIRS r1.id < r2.id detail", `
SELECT o.id AS ticket, c.name, o.total,
       r1.id, r1.amount, r1.reason, r1.processed_by, r1.refunded_at,
       r2.id, r2.amount, r2.reason, r2.processed_by, r2.refunded_at,
       ROUND(r1.amount + r2.amount, 2) AS pair_sum
FROM refunds r1
JOIN refunds r2 ON r1.order_id = r2.order_id AND r1.id < r2.id
JOIN orders o ON o.id = r1.order_id
JOIN customers c ON c.id = o.customer_id
ORDER BY o.id;`);
show("refund pair comparisons", `
SELECT
  SUM(r1.reason = r2.reason) AS same_reason,
  SUM(r1.processed_by = r2.processed_by) AS same_processor,
  SUM(r1.amount = r2.amount) AS same_amount,
  COUNT(*) AS pairs
FROM refunds r1 JOIN refunds r2 ON r1.order_id = r2.order_id AND r1.id < r2.id;`);
show("refund pair operator battle", `
SELECT
  (SELECT COUNT(*) FROM refunds r1 JOIN refunds r2 ON r1.order_id = r2.order_id AND r1.id < r2.id) AS lt,
  (SELECT COUNT(*) FROM refunds r1 JOIN refunds r2 ON r1.order_id = r2.order_id AND r1.id <= r2.id) AS lte,
  (SELECT COUNT(*) FROM refunds r1 JOIN refunds r2 ON r1.order_id = r2.order_id AND r1.id <> r2.id) AS neq;`);

// ---------- customers: shared city / region ----------
show("customers per city", `SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC;`);
show("city-mate pairs", `
SELECT c1.city, COUNT(*) AS pairs
FROM customers c1 JOIN customers c2 ON c1.city = c2.city AND c1.id < c2.id
GROUP BY c1.city ORDER BY pairs DESC;`);
show("region-mate pairs (reverify 39 = EU28/APAC10/US1/LATAM0)", `
SELECT c1.region, COUNT(*) AS pairs
FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id
GROUP BY c1.region ORDER BY pairs DESC;`);
show("city pairs detail (small tables only)", `
SELECT c1.name, c1.city, c2.name, c2.city, c1.region
FROM customers c1 JOIN customers c2 ON c1.city = c2.city AND c1.id < c2.id
ORDER BY c1.city, c1.id;`);

// ---------- employees: org chart ----------
show("employees table", `SELECT id, name, role, manager_id FROM employees ORDER BY id;`);
show("manager → report pairs", `
SELECT m.name AS manager, m.role AS mgr_role, e.name AS report, e.role
FROM employees e JOIN employees m ON e.manager_id = m.id ORDER BY m.id, e.id;`);
show("employees with no manager (ghost side)", `
SELECT e.name, e.role FROM employees e LEFT JOIN employees m ON m.id = e.manager_id WHERE m.id IS NULL;`);
show("siblings: pairs sharing a manager", `
SELECT m.name AS manager, COUNT(*) AS sibling_pairs
FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.id
JOIN employees m ON m.id = e1.manager_id
GROUP BY m.id ORDER BY sibling_pairs DESC;`);
show("role-mate pairs", `
SELECT e1.role, COUNT(*) AS pairs
FROM employees e1 JOIN employees e2 ON e1.role = e2.role AND e1.id < e2.id
GROUP BY e1.role;`);

db.close();
rmSync(COPY, { force: true });
console.log("\n(probe copy deleted)");
