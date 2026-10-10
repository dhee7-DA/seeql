/// <reference types="bun-types" />
// probe-j8b2.ts — fills in the gaps left by probe-j8b1 (truncated sections) +
// entity details for prose. Read-only, COPY scripts/.tmp-j8b.db, run from ROOT.
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j8b.db", { readonly: true });

function q(title: string, sql: string) {
  console.log(`\n=== ${title} ===`);
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    if (rows.length === 0) {
      console.log("(0 rows)");
      return;
    }
    const cols = Object.keys(rows[0]);
    console.log(cols.join(" | "));
    for (const r of rows) console.log(cols.map((c) => r[c]).join(" | "));
    console.log(`(${rows.length} rows)`);
  } catch (e) {
    console.log("ERR:", e instanceof Error ? e.message : String(e));
  }
}

// cs-289 category revenue per region (charged vs catalog)
for (const region of ["EU", "APAC", "US", "LATAM"]) {
  q(`cs-289 ${region}: charged vs catalog per category`, `
SELECT p.category, COUNT(oi.id) AS lines, ROUND(SUM(oi.unit_price * oi.quantity), 2) AS charged,
       ROUND(SUM(p.price * oi.quantity), 2) AS catalog
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = '${region}'
GROUP BY p.category
ORDER BY charged DESC`);
}

// cs-287 detail: per-customer raw rows vs distinct orders through the touch chain
q("cs-287 per-customer raw vs distinct (fill shape)", `
SELECT c.name, COUNT(*) AS raw_rows, COUNT(DISTINCT o.id) AS orders, ROUND(SUM(o.total), 2) AS book
FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
ORDER BY raw_rows DESC`);
q("cs-287 HAVING raw > distinct", `
SELECT c.name, COUNT(*) AS raw_rows, COUNT(DISTINCT o.id) AS orders
FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
HAVING COUNT(*) > COUNT(DISTINCT o.id)`);
q("cs-287 HAVING raw = distinct (count only)", `
SELECT COUNT(*) AS n FROM (
  SELECT c.id FROM acquisitions a
  JOIN customers c ON c.id = a.customer_id
  JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
  HAVING COUNT(*) = COUNT(DISTINCT o.id))`);
q("cs-287 Noah + Pedro orders", `
SELECT c.name, COUNT(o.id) AS orders, ROUND(SUM(o.total),2) AS book
FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
WHERE c.name IN ('Noah Meyer','Pedro Alvarez') GROUP BY c.id`);
q("cs-287 a.id = c.id collision variant (per-customer raw/distinct)", `
SELECT c.name, COUNT(*) AS raw_rows, COUNT(DISTINCT o.id) AS orders
FROM acquisitions a
JOIN customers c ON c.id = a.id
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
HAVING COUNT(*) > COUNT(DISTINCT o.id)
ORDER BY raw_rows DESC`);
q("cs-287 o.id = c.id collision variant", `
SELECT c.name, COUNT(*) AS raw_rows, COUNT(DISTINCT o.id) AS orders
FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.id = c.id
GROUP BY c.id
HAVING COUNT(*) > COUNT(DISTINCT o.id)
ORDER BY raw_rows DESC`);
q("cs-287 SUM(o.id) distractor in slot", `
SELECT c.name, COUNT(*) AS raw_rows, SUM(o.id) AS orders
FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
HAVING COUNT(*) > COUNT(DISTINCT o.id)
ORDER BY raw_rows DESC`);
q("cs-287 HAVING '<' variant", `
SELECT c.name FROM acquisitions a
JOIN customers c ON c.id = a.customer_id
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
HAVING COUNT(*) < COUNT(DISTINCT o.id)`);

// cs-290 people context
q("employee roster", `SELECT id, name, role, manager_id, region FROM employees ORDER BY id`);
q("cs-290 GROUP BY manager variant", `
SELECT m.name AS manager, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN employees e ON e.id = r.processed_by
JOIN employees m ON m.id = e.manager_id
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'late_delivery'
GROUP BY m.id
ORDER BY refunded DESC`);
q("cs-290 APAC arm per rep (fill candidate)", `
SELECT e.name, e.role, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN employees e ON e.id = r.processed_by
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'late_delivery' AND c.region = 'APAC'
GROUP BY e.id
ORDER BY refunded DESC`);
q("cs-290 EU arm per rep", `
SELECT e.name, e.role, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN employees e ON e.id = r.processed_by
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'late_delivery' AND c.region = 'EU'
GROUP BY e.id
ORDER BY refunded DESC`);
q("cs-290 all-reasons APAC per rep", `
SELECT e.name, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN employees e ON e.id = r.processed_by
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'APAC'
GROUP BY e.id ORDER BY refunded DESC`);
q("cs-290 e.id = r.id collision variant", `
SELECT e.name, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN employees e ON e.id = r.id
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'late_delivery' AND c.region = 'APAC'
GROUP BY e.id ORDER BY refunded DESC`);

// Alice's claims detail + who processed them (prose safety for cs-285/287/291)
q("Alice Chen refund rows", `
SELECT r.id, r.order_id, r.amount, r.reason, r.refunded_at, r.processed_by
FROM refunds r JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.name = 'Alice Chen' ORDER BY r.id`);
q("double-refund tickets: full claim rows", `
SELECT r.id, r.order_id, r.amount, r.reason, r.processed_by
FROM refunds r WHERE r.order_id IN (6, 55, 86) ORDER BY r.order_id, r.id`);

// cs-284 context: settled per method overall / the split-payment orders
q("split-payment orders (settled, 2+ rows)", `
SELECT o.id, c.name, c.region, COUNT(p.id) AS rows, ROUND(SUM(p.amount),2) AS paid, o.total
FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id
WHERE p.status='settled' GROUP BY o.id HAVING COUNT(p.id) > 1`);
q("cs-284 c.id = o.id collision variant per region x method", `
SELECT c.region, p.method, COUNT(*) AS n, ROUND(SUM(p.amount), 2) AS settled
FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN customers c ON c.id = o.id
WHERE p.status = 'settled'
GROUP BY c.region, p.method
ORDER BY c.region, p.method`);
q("cs-284 GROUP BY c.region only variant", `
SELECT c.region, COUNT(*) AS n, ROUND(SUM(p.amount), 2) AS settled
FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id
WHERE p.status = 'settled' GROUP BY c.region ORDER BY c.region`);
q("cs-284 GROUP BY p.method variant numbers", `
SELECT p.method, COUNT(*) AS n FROM payments p JOIN orders o ON o.id = p.order_id
JOIN customers c ON c.id = o.customer_id WHERE p.status='settled' GROUP BY p.method`);
q("cs-284 p.method=o.method? n/a; o.total fan-out EU card detail", `
SELECT p.id, p.order_id, p.amount, o.total FROM payments p JOIN orders o ON o.id=p.order_id
JOIN customers c ON c.id=o.customer_id WHERE p.status='settled' AND c.region='EU' AND p.method='card' AND o.total <> p.amount`);

// cs-286 details
q("cs-286 carriers + freight sanity", `
SELECT carrier, COUNT(*) legs, ROUND(SUM(cost),2) freight FROM shipments GROUP BY carrier`);
q("cs-286 r.id = s.id collision variant", `
SELECT s.carrier, COUNT(s.id) AS legs, ROUND(SUM(s.cost),2) AS freight, COUNT(r.id) AS claims, ROUND(SUM(r.amount),2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
LEFT JOIN refunds r ON r.id = s.id
GROUP BY s.carrier ORDER BY s.carrier`);
q("cs-286 SUM(o.total) as freight distractor", `
SELECT s.carrier, COUNT(s.id) AS legs, ROUND(SUM(o.total),2) AS freight, COUNT(r.id) AS claims, ROUND(SUM(r.amount),2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
LEFT JOIN refunds r ON r.order_id = o.id
GROUP BY s.carrier ORDER BY s.carrier`);
q("cs-286 SUM(s.cost) as refunded distractor", `
SELECT s.carrier, COUNT(s.id) AS legs, ROUND(SUM(s.cost),2) AS freight, COUNT(r.id) AS claims, ROUND(SUM(s.cost),2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
LEFT JOIN refunds r ON r.order_id = o.id
GROUP BY s.carrier ORDER BY s.carrier`);
q("cs-286 INNER-on-refunds variant (freight collapse)", `
SELECT s.carrier, COUNT(s.id) AS legs, ROUND(SUM(s.cost),2) AS freight, COUNT(r.id) AS claims, ROUND(SUM(r.amount),2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
INNER JOIN refunds r ON r.order_id = o.id
GROUP BY s.carrier ORDER BY s.carrier`);

// cs-288 distractor variants
q("cs-288 oi.product_id = s.id variant", `
SELECT s.name, COUNT(DISTINCT r.id) AS claims, COUNT(r.id) AS joined_rows
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = s.id
JOIN orders o ON o.id = oi.order_id
JOIN refunds r ON r.order_id = o.id
GROUP BY s.id ORDER BY s.name`);
q("cs-288 p.id = s.id collision variant", `
SELECT s.name, COUNT(DISTINCT r.id) AS claims, COUNT(r.id) AS joined_rows
FROM suppliers s
JOIN products p ON p.id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN refunds r ON r.order_id = o.id
GROUP BY s.id ORDER BY s.name`);
q("cs-288 r.id = o.id collision variant", `
SELECT s.name, COUNT(DISTINCT r.id) AS claims, COUNT(r.id) AS joined_rows
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN refunds r ON r.id = o.id
GROUP BY s.id ORDER BY s.name`);
q("cs-288 oi.id = oi.order_id? and COUNT(DISTINCT o.id) distractor", `
SELECT s.name, COUNT(DISTINCT o.id) AS tickets, COUNT(r.id) AS joined_rows
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN refunds r ON r.order_id = o.id
GROUP BY s.id ORDER BY s.name`);
q("cs-288 SUM(r.id) distractor", `
SELECT s.name, COUNT(DISTINCT r.id) AS claims, SUM(r.id) AS joined_rows
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN refunds r ON r.order_id = o.id
GROUP BY s.id ORDER BY s.name`);

db.close();
console.log("\nprobe-j8b2 done");
