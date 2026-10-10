/// <reference types="bun-types" />
// probe-j8b3.ts — last prose facts + risky distractor variants + prior-fill dump.
// Read-only, COPY scripts/.tmp-j8b.db, run from PROJECT ROOT.
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

// cs-286 deep dive
q("orders 6/55/86 shipment rows", `SELECT id, order_id, carrier, cost FROM shipments WHERE order_id IN (6,55,86)`);
q("cs-286 rollup fill (final shape)", `
SELECT s.carrier, COUNT(s.id) AS legs, ROUND(SUM(s.cost), 2) AS freight,
       SUM(r.claims) AS claims, ROUND(SUM(r.refunded), 2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
LEFT JOIN (SELECT order_id, COUNT(*) AS claims, SUM(amount) AS refunded
           FROM refunds GROUP BY order_id) r ON r.order_id = o.id
GROUP BY s.carrier
ORDER BY freight DESC`);
q("cs-286 rollup + INNER variant", `
SELECT s.carrier, COUNT(s.id) AS legs, ROUND(SUM(s.cost), 2) AS freight,
       SUM(r.claims) AS claims, ROUND(SUM(r.refunded), 2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
INNER JOIN (SELECT order_id, COUNT(*) AS claims, SUM(amount) AS refunded
           FROM refunds GROUP BY order_id) r ON r.order_id = o.id
GROUP BY s.carrier
ORDER BY freight DESC`);
q("cs-286 rollup + r.refunded in claims slot", `
SELECT s.carrier, COUNT(s.id) AS legs, ROUND(SUM(s.cost), 2) AS freight,
       SUM(r.refunded) AS claims, ROUND(SUM(r.refunded), 2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
LEFT JOIN (SELECT order_id, COUNT(*) AS claims, SUM(amount) AS refunded
           FROM refunds GROUP BY order_id) r ON r.order_id = o.id
GROUP BY s.carrier ORDER BY freight DESC`);
q("cs-286 rollup + r.claims in money slot", `
SELECT s.carrier, COUNT(s.id) AS legs, ROUND(SUM(s.cost), 2) AS freight,
       SUM(r.claims) AS claims, ROUND(SUM(r.claims), 2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
LEFT JOIN (SELECT order_id, COUNT(*) AS claims, SUM(amount) AS refunded
           FROM refunds GROUP BY order_id) r ON r.order_id = o.id
GROUP BY s.carrier ORDER BY freight DESC`);
q("cs-286 rollup + o.total in claims slot", `
SELECT s.carrier, COUNT(s.id) AS legs, ROUND(SUM(s.cost), 2) AS freight,
       SUM(o.total) AS claims, ROUND(SUM(r.refunded), 2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
LEFT JOIN (SELECT order_id, COUNT(*) AS claims, SUM(amount) AS refunded
           FROM refunds GROUP BY order_id) r ON r.order_id = o.id
GROUP BY s.carrier ORDER BY freight DESC`);
q("cs-286 rollup + o.total in money slot", `
SELECT s.carrier, COUNT(s.id) AS legs, ROUND(SUM(s.cost), 2) AS freight,
       SUM(r.claims) AS claims, ROUND(SUM(o.total), 2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
LEFT JOIN (SELECT order_id, COUNT(*) AS claims, SUM(amount) AS refunded
           FROM refunds GROUP BY order_id) r ON r.order_id = o.id
GROUP BY s.carrier ORDER BY freight DESC`);
q("cs-286 rollup + s.cost in money slot", `
SELECT s.carrier, COUNT(s.id) AS legs, ROUND(SUM(s.cost), 2) AS freight,
       SUM(r.claims) AS claims, ROUND(SUM(s.cost), 2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
LEFT JOIN (SELECT order_id, COUNT(*) AS claims, SUM(amount) AS refunded
           FROM refunds GROUP BY order_id) r ON r.order_id = o.id
GROUP BY s.carrier ORDER BY freight DESC`);
q("cs-286 rollup + s.cost in claims slot", `
SELECT s.carrier, COUNT(s.id) AS legs, ROUND(SUM(s.cost), 2) AS freight,
       SUM(s.cost) AS claims, ROUND(SUM(r.refunded), 2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
LEFT JOIN (SELECT order_id, COUNT(*) AS claims, SUM(amount) AS refunded
           FROM refunds GROUP BY order_id) r ON r.order_id = o.id
GROUP BY s.carrier ORDER BY freight DESC`);
q("cs-286 rollup + ON s.order_id = o.id", `
SELECT s.carrier, COUNT(s.id) AS legs, ROUND(SUM(s.cost), 2) AS freight,
       SUM(r.claims) AS claims, ROUND(SUM(r.refunded), 2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
LEFT JOIN (SELECT order_id, COUNT(*) AS claims, SUM(amount) AS refunded
           FROM refunds GROUP BY order_id) r ON s.order_id = o.id
GROUP BY s.carrier ORDER BY freight DESC`);
q("cs-286 rollup + ON o.id = o.id", `
SELECT s.carrier, COUNT(s.id) AS legs, ROUND(SUM(s.cost), 2) AS freight,
       SUM(r.claims) AS claims, ROUND(SUM(r.refunded), 2) AS refunded
FROM shipments s
JOIN orders o ON o.id = s.order_id
LEFT JOIN (SELECT order_id, COUNT(*) AS claims, SUM(amount) AS refunded
           FROM refunds GROUP BY order_id) r ON o.id = o.id
GROUP BY s.carrier ORDER BY freight DESC`);

// cs-285 variants
q("cs-285 damaged + SUM(o.total)", `
SELECT c.region, COUNT(r.id) AS claims, ROUND(SUM(o.total), 2) AS refunded
FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'damaged' GROUP BY c.region ORDER BY refunded DESC`);
q("cs-285 changed_mind arm", `
SELECT c.region, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'changed_mind' GROUP BY c.region ORDER BY refunded DESC`);
q("cs-285 GROUP BY r.reason variant", `
SELECT r.reason, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'damaged' GROUP BY r.reason ORDER BY refunded DESC`);
q("cs-285 GROUP BY o.status variant", `
SELECT o.status, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'damaged' GROUP BY o.status ORDER BY refunded DESC`);
q("cs-285 ON o.id = r.id collision", `
SELECT c.region, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r JOIN orders o ON o.id = r.id JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'damaged' GROUP BY c.region ORDER BY refunded DESC`);

// cs-284 variants
q("cs-284 failed arm", `
SELECT c.region, p.method, COUNT(*) AS n, ROUND(SUM(p.amount),2) AS settled
FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id
WHERE p.status = 'failed' GROUP BY c.region, p.method`);
q("cs-284 GROUP BY p.status variant", `
SELECT p.status, COUNT(*) AS n, ROUND(SUM(p.amount),2) AS settled
FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id
WHERE p.status = 'settled' GROUP BY p.status`);
q("cs-284 SUM(p.id) variant top rows", `
SELECT c.region, p.method, COUNT(*) AS n, ROUND(SUM(p.id), 2) AS settled
FROM payments p JOIN orders o ON o.id = p.order_id JOIN customers c ON c.id = o.customer_id
WHERE p.status = 'settled' GROUP BY c.region, p.method ORDER BY c.region, p.method`);

// cs-287 variants
q("cs-287 MAX(o.id) variant", `
SELECT c.name, COUNT(*) AS raw_rows, MAX(o.id) AS orders
FROM acquisitions a JOIN customers c ON c.id = a.customer_id JOIN orders o ON o.customer_id = c.id
GROUP BY c.id HAVING COUNT(*) > COUNT(DISTINCT o.id)`);
q("cs-287 c.id join variant raw rows", `
SELECT COUNT(*) AS n FROM acquisitions a JOIN customers c ON c.id = c.id JOIN orders o ON o.customer_id = c.id`);
q("cs-287 >= variant", `
SELECT c.name, COUNT(*) AS raw_rows, COUNT(DISTINCT o.id) AS orders
FROM acquisitions a JOIN customers c ON c.id = a.customer_id JOIN orders o ON o.customer_id = c.id
GROUP BY c.id HAVING COUNT(*) >= COUNT(DISTINCT o.id)`);

// cs-288 MAX variant + ORDER check
q("cs-288 MAX(DISTINCT r.id) variant", `
SELECT s.name, MAX(DISTINCT r.id) AS claims, COUNT(r.id) AS joined_rows
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN refunds r ON r.order_id = o.id
GROUP BY s.id ORDER BY claims DESC, s.name`);
q("cs-288 SUM(DISTINCT r.id) variant", `
SELECT s.name, SUM(DISTINCT r.id) AS claims, COUNT(r.id) AS joined_rows
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN refunds r ON r.order_id = o.id
GROUP BY s.id ORDER BY claims DESC, s.name`);
q("cs-288 oi.order_id = p.id variant", `
SELECT s.name, COUNT(DISTINCT r.id) AS claims, COUNT(r.id) AS joined_rows
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.order_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN refunds r ON r.order_id = o.id
GROUP BY s.id ORDER BY claims DESC, s.name`);
q("cs-288 r.processed_by = o.id variant", `
SELECT s.name, COUNT(DISTINCT r.id) AS claims, COUNT(r.id) AS joined_rows
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN refunds r ON r.processed_by = o.id
GROUP BY s.id ORDER BY claims DESC, s.name`);
q("cs-288 oi.id = p.id variant", `
SELECT s.name, COUNT(DISTINCT r.id) AS claims, COUNT(r.id) AS joined_rows
FROM suppliers s
JOIN products p ON p.supplier_id = s.id
JOIN order_items oi ON oi.id = p.id
JOIN orders o ON o.id = oi.order_id
JOIN refunds r ON r.order_id = o.id
GROUP BY s.id ORDER BY claims DESC, s.name`);

// cs-289 totals per region + variants
q("cs-289 charged totals per region", `
SELECT c.region, COUNT(oi.id) AS lines, ROUND(SUM(oi.unit_price * oi.quantity), 2) AS charged,
       ROUND(SUM(p.price * oi.quantity), 2) AS catalog
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
GROUP BY c.region`);
q("cs-289 p.id = oi.id collision variant (EU)", `
SELECT p.category, COUNT(oi.id) AS lines, ROUND(SUM(oi.unit_price * oi.quantity), 2) AS charged
FROM order_items oi
JOIN products p ON p.id = oi.id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'EU'
GROUP BY p.category ORDER BY charged DESC`);
q("cs-289 p.supplier_id = oi.product_id variant (EU)", `
SELECT p.category, COUNT(oi.id) AS lines, ROUND(SUM(oi.unit_price * oi.quantity), 2) AS charged
FROM order_items oi
JOIN products p ON p.supplier_id = oi.product_id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'EU'
GROUP BY p.category ORDER BY charged DESC`);
q("cs-289 oi.product_id = oi.order_id variant (EU)", `
SELECT p.category, COUNT(oi.id) AS lines, ROUND(SUM(oi.unit_price * oi.quantity), 2) AS charged
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'EU' AND 1=1
GROUP BY p.category HAVING 1=1 ORDER BY charged DESC`);
q("cs-289 SUM(oi.unit_price) no-qty variant (EU)", `
SELECT p.category, COUNT(oi.id) AS lines, ROUND(SUM(oi.unit_price), 2) AS charged
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'EU'
GROUP BY p.category ORDER BY charged DESC`);
q("cs-289 SUM(o.total) variant (EU)", `
SELECT p.category, COUNT(oi.id) AS lines, ROUND(SUM(o.total), 2) AS charged
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'EU'
GROUP BY p.category ORDER BY charged DESC`);

// cs-290 US/LATAM arms + damaged/wrong_item arms on APAC
q("cs-290 late_delivery US arm", `
SELECT e.name, COUNT(r.id) AS claims FROM refunds r
JOIN employees e ON e.id = r.processed_by
JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'late_delivery' AND c.region = 'US' GROUP BY e.id`);
q("cs-290 late_delivery LATAM arm", `
SELECT e.name, COUNT(r.id) AS claims FROM refunds r
JOIN employees e ON e.id = r.processed_by
JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'late_delivery' AND c.region = 'LATAM' GROUP BY e.id`);
q("cs-290 damaged APAC arm", `
SELECT e.name, COUNT(r.id) AS claims, ROUND(SUM(r.amount),2) AS refunded FROM refunds r
JOIN employees e ON e.id = r.processed_by
JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'damaged' AND c.region = 'APAC' GROUP BY e.id`);
q("cs-290 wrong_item APAC arm", `
SELECT e.name, COUNT(r.id) AS claims, ROUND(SUM(r.amount),2) AS refunded FROM refunds r
JOIN employees e ON e.id = r.processed_by
JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'wrong_item' AND c.region = 'APAC' GROUP BY e.id`);
q("cs-290 changed_mind APAC arm", `
SELECT e.name, COUNT(r.id) AS claims, ROUND(SUM(r.amount),2) AS refunded FROM refunds r
JOIN employees e ON e.id = r.processed_by
JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'changed_mind' AND c.region = 'APAC' GROUP BY e.id`);
q("cs-290 e.manager_id = r.processed_by variant", `
SELECT e.name, COUNT(r.id) AS claims, ROUND(SUM(r.amount),2) AS refunded FROM refunds r
JOIN employees e ON e.manager_id = r.processed_by
JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'late_delivery' AND c.region = 'APAC' GROUP BY e.id`);
q("cs-290 SUM(o.total) in money slot (APAC late_delivery)", `
SELECT e.name, e.role, COUNT(r.id) AS claims, ROUND(SUM(o.total), 2) AS refunded
FROM refunds r
JOIN employees e ON e.id = r.processed_by
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'late_delivery' AND c.region = 'APAC'
GROUP BY e.id ORDER BY refunded DESC`);
q("cs-290 SUM(r.id) in money slot", `
SELECT e.name, e.role, COUNT(r.id) AS claims, ROUND(SUM(r.id), 2) AS refunded
FROM refunds r
JOIN employees e ON e.id = r.processed_by
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
WHERE r.reason = 'late_delivery' AND c.region = 'APAC'
GROUP BY e.id ORDER BY refunded DESC`);

// cs-291 variants
q("cs-291 c.id = o.id collision in customer join", `
SELECT o.id, c.name, o.status, o.total, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.id
GROUP BY o.id HAVING COUNT(r.id) > 1 ORDER BY o.id`);
q("cs-291 c.id = c.id variant row count", `
SELECT COUNT(*) AS n FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = c.id
GROUP BY o.id HAVING COUNT(r.id) > 1`);
q("cs-291 c.id = r.order_id variant", `
SELECT o.id, c.name, o.status, o.total, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = r.order_id
GROUP BY o.id HAVING COUNT(r.id) > 1 ORDER BY o.id`);
q("cs-291 GROUP BY o.customer_id variant", `
SELECT o.id, c.name, o.status, o.total, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
GROUP BY o.customer_id HAVING COUNT(r.id) > 1 ORDER BY o.id`);
q("cs-291 GROUP BY r.id variant", `
SELECT COUNT(*) AS n FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
GROUP BY r.id HAVING COUNT(r.id) > 1`);
q("cs-291 GROUP BY 2 ordinal variant", `
SELECT o.id, c.name, o.status, o.total, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
GROUP BY 2 HAVING COUNT(r.id) > 1 ORDER BY o.id`);
q("cs-291 HAVING > 2 variant", `
SELECT o.id, c.name, COUNT(r.id) AS claims FROM refunds r
JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
GROUP BY o.id HAVING COUNT(r.id) > 2`);
q("cs-291 HAVING > c.id variant", `
SELECT o.id, c.name, o.status, COUNT(r.id) AS claims FROM refunds r
JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
GROUP BY o.id HAVING COUNT(r.id) > c.id ORDER BY o.id`);
q("cs-291 HAVING > r.id variant", `
SELECT COUNT(*) AS n FROM refunds r
JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
GROUP BY o.id HAVING COUNT(r.id) > r.id`);
q("cs-291 MAX claims variant", `
SELECT o.id, c.name, MAX(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
GROUP BY o.id HAVING MAX(r.id) > 1 ORDER BY o.id`);
q("cs-291 SUM claims variant", `
SELECT o.id, c.name, SUM(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id
GROUP BY o.id HAVING SUM(r.id) > 1 ORDER BY o.id`);
q("cs-291 c.id = 2 variant", `
SELECT o.id, c.name, o.status, o.total, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM refunds r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = 2
GROUP BY o.id HAVING COUNT(r.id) > 1 ORDER BY o.id`);

db.close();
console.log("\nprobe-j8b3 done");
