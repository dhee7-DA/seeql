/// <reference types="bun-types" />
// probe-j7c7 — final verification of the rollup-derived-table fills for
// cs-267/268/269/271/272/274 plus every arm-literal variant quoted in prose
// and every INNER/CROSS keyword substitution. Runs against a COPY of the db.
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j7c.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all();
    console.log(`\n== ${label} ==`);
    console.log(JSON.stringify(rows));
  } catch (e) {
    console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// ---- cs-267 rollup: suppliers never hit by a cancellation --------------------
const roll267 = (arm: string, join: string, ghost: string) => `SELECT s.name, s.region
FROM suppliers s
${join} JOIN (SELECT DISTINCT p.supplier_id AS supplier_id
              FROM products p
              JOIN order_items oi ON oi.product_id = p.id
              JOIN orders o ON o.id = oi.order_id
              WHERE o.status = '${arm}') x
ON x.supplier_id = s.id
WHERE ${ghost} IS NULL
ORDER BY s.name`;
for (const arm of ["cancelled", "pending", "delivered", "shipped"]) {
  q(`267 rollup arm='${arm}'`, roll267(arm, "LEFT", "x.supplier_id"));
}
q("267 rollup INNER", roll267("cancelled", "INNER", "x.supplier_id"));
q("267 rollup ghost=s.id", roll267("cancelled", "LEFT", "s.id"));

// ---- cs-268 rollup: products never bought by US customers --------------------
const roll268 = (arm: string, join: string, ghost: string) => `SELECT p.name, p.category
FROM products p
${join} JOIN (SELECT DISTINCT oi.product_id AS product_id
              FROM order_items oi
              JOIN orders o ON o.id = oi.order_id
              JOIN customers c ON c.id = o.customer_id
              WHERE c.region = '${arm}') us
ON us.product_id = p.id
WHERE ${ghost} IS NULL
ORDER BY p.name`;
for (const arm of ["US", "LATAM", "EU", "APAC"]) {
  q(`268 rollup arm='${arm}'`, roll268(arm, "LEFT", "us.product_id"));
}
q("268 rollup INNER", roll268("US", "INNER", "us.product_id"));
q("268 rollup ghost=p.id", roll268("US", "LEFT", "p.id"));

// ---- cs-269 rollup: products never shipped via UPS ---------------------------
const roll269 = (arm: string, join: string, ghost: string) => `SELECT p.name, p.category
FROM products p
${join} JOIN (SELECT DISTINCT oi.product_id AS product_id
              FROM order_items oi
              JOIN orders o ON o.id = oi.order_id
              JOIN shipments s ON s.order_id = o.id
              WHERE s.carrier = '${arm}') up
ON up.product_id = p.id
WHERE ${ghost} IS NULL
ORDER BY p.name`;
for (const arm of ["UPS", "DHL", "FedEx", "LocalPost"]) {
  q(`269 rollup arm='${arm}'`, roll269(arm, "LEFT", "up.product_id"));
}
q("269 rollup INNER", roll269("UPS", "INNER", "up.product_id"));
q("269 rollup ghost=p.id", roll269("UPS", "LEFT", "p.id"));

// ---- cs-271 rollup: suppliers with no LATAM sales ----------------------------
const roll271 = (arm: string, join: string, ghost: string) => `SELECT s.name, s.region
FROM suppliers s
${join} JOIN (SELECT DISTINCT p.supplier_id AS supplier_id
              FROM products p
              JOIN order_items oi ON oi.product_id = p.id
              JOIN orders o ON o.id = oi.order_id
              JOIN customers c ON c.id = o.customer_id
              WHERE c.region = '${arm}') lat
ON lat.supplier_id = s.id
WHERE ${ghost} IS NULL
ORDER BY s.name`;
for (const arm of ["LATAM", "US", "EU", "APAC"]) {
  q(`271 rollup arm='${arm}'`, roll271(arm, "LEFT", "lat.supplier_id"));
}
q("271 rollup INNER", roll271("LATAM", "INNER", "lat.supplier_id"));
q("271 rollup ghost=s.id", roll271("LATAM", "LEFT", "s.id"));
q("LATAM line detail", `SELECT s.name supplier, c.name buyer, p.name product, oi.quantity FROM order_items oi JOIN orders o ON o.id=oi.order_id JOIN customers c ON c.id=o.customer_id JOIN products p ON p.id=oi.product_id JOIN suppliers s ON s.id=p.supplier_id WHERE c.region='LATAM' ORDER BY oi.id`);

// ---- cs-272 rollup: products never bought by email arrivals ------------------
const roll272 = (arm: string, join: string, ghost: string) => `SELECT p.name, p.category
FROM products p
${join} JOIN (SELECT DISTINCT oi.product_id AS product_id
              FROM order_items oi
              JOIN orders o ON o.id = oi.order_id
              JOIN customers c ON c.id = o.customer_id
              JOIN acquisitions a ON a.customer_id = c.id
              WHERE a.channel = '${arm}') em
ON em.product_id = p.id
WHERE ${ghost} IS NULL
ORDER BY p.name`;
for (const arm of ["email", "search", "referral", "social"]) {
  q(`272 rollup arm='${arm}'`, roll272(arm, "LEFT", "em.product_id"));
}
q("272 rollup INNER", roll272("email", "INNER", "em.product_id"));
q("272 rollup ghost=p.id", roll272("email", "LEFT", "p.id"));

// ---- cs-274 rollup: employees never a claim from an EU customer --------------
const roll274 = (arm: string, join: string, ghost: string) => `SELECT e.name, e.role
FROM employees e
${join} JOIN (SELECT DISTINCT r.processed_by AS processed_by
              FROM refunds r
              JOIN orders o ON o.id = r.order_id
              JOIN customers c ON c.id = o.customer_id
              WHERE c.region = '${arm}') eu
ON eu.processed_by = e.id
WHERE ${ghost} IS NULL
ORDER BY e.name`;
for (const arm of ["EU", "US", "APAC", "LATAM"]) {
  q(`274 rollup arm='${arm}'`, roll274(arm, "LEFT", "eu.processed_by"));
}
q("274 rollup INNER", roll274("EU", "INNER", "eu.processed_by"));
q("274 rollup ghost=e.id", roll274("EU", "LEFT", "e.id"));

// ---- cs-273/275 direct fills, no-DISTINCT sanity -----------------------------
q("273 direct no-DISTINCT", `SELECT e.name, e.role FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id AND r.reason = 'late_delivery' WHERE r.id IS NULL ORDER BY e.name`);
q("275 direct >=50", `SELECT e.name FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id AND r.amount >= 50 WHERE r.id IS NULL ORDER BY e.name`);
q("275 direct >=150", `SELECT e.name FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id AND r.amount >= 150 WHERE r.id IS NULL ORDER BY e.name`);
q("275 NOT NULL flip", `SELECT COUNT(*) n FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id AND r.amount >= 100 WHERE r.id IS NOT NULL`);

// ---- prose context ------------------------------------------------------------
q("273 late claim ids/orders", `SELECT r.id, r.order_id, r.amount, e.name FROM refunds r JOIN employees e ON e.id=r.processed_by WHERE r.reason='late_delivery' ORDER BY r.id`);
q("Marcus refund total", `SELECT COUNT(*) n, ROUND(SUM(amount),2) total FROM refunds WHERE processed_by = 4`);
q("275 Tomas claims", `SELECT id, amount, reason FROM refunds WHERE processed_by = 9`);
q("275 Carla claims", `SELECT id, amount, reason FROM refunds WHERE processed_by = 10`);
q("268 US buyer names", `SELECT DISTINCT c.name FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.region='US'`);
q("270 Laptop Stand churned lines", `SELECT c.name FROM products p JOIN order_items oi ON oi.product_id=p.id JOIN orders o ON o.id=oi.order_id JOIN customers c ON c.id=o.customer_id WHERE p.name='Laptop Stand Aluminum' AND c.active=0`);
q("274 EU processor tally", `SELECT e.name, COUNT(*) n FROM refunds r JOIN employees e ON e.id=r.processed_by JOIN orders o ON o.id=r.order_id JOIN customers c ON c.id=o.customer_id WHERE c.region='EU' GROUP BY e.id ORDER BY n DESC`);
q("274 Tomas claims detail", `SELECT r.id, r.amount, c.region FROM refunds r JOIN orders o ON o.id=r.order_id JOIN customers c ON c.id=o.customer_id WHERE r.processed_by = 9`);

db.close();
console.log("\nprobe-j7c7 done");
