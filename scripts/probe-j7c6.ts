/// <reference types="bun-types" />
// probe-j7c6 — verifies the final WHERE-IS-NULL fill shapes for cs-267..cs-275
// (the dead predecessor's probes used GROUP BY/HAVING; this file re-verifies
// every corridor as the anti-join listing it will ship as), plus schemas,
// id-space collision checks for distractor chips, and the cs-275 threshold
// arm question. Runs against a COPY of the seed db (scripts/.tmp-j7c.db).
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

// ---- schemas ----------------------------------------------------------------
for (const t of ["customers", "products", "suppliers", "orders", "order_items", "payments", "refunds", "shipments", "acquisitions", "employees"]) {
  q(`schema ${t}`, `PRAGMA table_info(${t})`);
}

// ---- cs-275 threshold: settle arm-filter semantics ---------------------------
q("275 RAW arm-filter >=100 (who ghosts?)",
  `SELECT e.name, r.id, r.amount
   FROM employees e
   LEFT JOIN refunds r ON r.processed_by = e.id AND r.amount >= 100
   WHERE r.id IS NULL
   ORDER BY e.name`);
q("275 arm-filter >=100 DISTINCT",
  `SELECT DISTINCT e.name, e.role
   FROM employees e
   LEFT JOIN refunds r ON r.processed_by = e.id AND r.amount >= 100
   WHERE r.id IS NULL
   ORDER BY e.name`);
q("275 rollup >=100",
  `SELECT e.name, e.role
   FROM employees e
   LEFT JOIN (SELECT DISTINCT processed_by FROM refunds WHERE amount >= 100) s
     ON s.processed_by = e.id
   WHERE s.processed_by IS NULL
   ORDER BY e.name`);
q("Marcus refunds detail", `SELECT id, order_id, amount, reason, processed_by FROM refunds WHERE processed_by = 4 ORDER BY amount`);

// ---- cs-267: suppliers never hit by a cancellation (WHERE-IS-NULL) -----------
q("267 FILL suppliers never cancelled (DISTINCT)",
  `SELECT DISTINCT s.name, s.region
   FROM suppliers s
   LEFT JOIN products p ON p.supplier_id = s.id
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'cancelled'
   WHERE o.id IS NULL
   ORDER BY s.name`);
q("267 variant INNER keyword",
  `SELECT DISTINCT s.name
   FROM suppliers s
   INNER JOIN products p ON p.supplier_id = s.id
   INNER JOIN order_items oi ON oi.product_id = p.id
   INNER JOIN orders o ON o.id = oi.order_id AND o.status = 'cancelled'
   WHERE o.id IS NULL
   ORDER BY s.name`);
// distractor probes
q("267 {2}=oi.id", `SELECT DISTINCT s.name FROM suppliers s LEFT JOIN products p ON p.supplier_id = oi.id LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id AND o.status='cancelled' WHERE o.id IS NULL ORDER BY s.name`);
q("267 {2}=o.id", `SELECT DISTINCT s.name FROM suppliers s LEFT JOIN products p ON p.supplier_id = o.id LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id AND o.status='cancelled' WHERE o.id IS NULL ORDER BY s.name`);
q("267 {3}='pending'", `SELECT DISTINCT s.name FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id AND o.status='pending' WHERE o.id IS NULL ORDER BY s.name`);
q("267 {3}='delivered'", `SELECT COUNT(*) n FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id AND o.status='delivered' WHERE o.id IS NULL`);

// ---- cs-268: products never bought by US customers (WHERE-IS-NULL) -----------
q("268 FILL products never US (DISTINCT)",
  `SELECT DISTINCT p.name, p.category
   FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN customers c ON c.id = o.customer_id AND c.region = 'US'
   WHERE c.id IS NULL
   ORDER BY p.name`);
q("268 {1}=oi.id", `SELECT COUNT(DISTINCT p.name) n FROM products p LEFT JOIN order_items oi ON oi.id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN customers c ON c.id = o.customer_id AND c.region='US' WHERE c.id IS NULL`);
q("268 {1}=o.id", `SELECT COUNT(DISTINCT p.name) n FROM products p LEFT JOIN order_items oi ON o.id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN customers c ON c.id = o.customer_id AND c.region='US' WHERE c.id IS NULL`);
q("268 {2}='LATAM'", `SELECT COUNT(DISTINCT p.name) n FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN customers c ON c.id = o.customer_id AND c.region='LATAM' WHERE c.id IS NULL`);
q("268 {3}=p.id", `SELECT COUNT(*) n FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN customers c ON c.id = o.customer_id AND c.region='US' WHERE p.id IS NULL`);

// ---- cs-269: products never shipped via UPS (WHERE-IS-NULL) ------------------
q("269 FILL products never UPS (DISTINCT)",
  `SELECT DISTINCT p.name, p.category
   FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN shipments s ON s.order_id = o.id AND s.carrier = 'UPS'
   WHERE s.id IS NULL
   ORDER BY p.name`);
q("269 {2}=o.id", `SELECT COUNT(*) n FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN shipments s ON s.order_id = o.id AND s.carrier='UPS' WHERE o.id IS NULL`);
q("269 {1}='DHL'", `SELECT COUNT(*) n FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN shipments s ON s.order_id = o.id AND s.carrier='DHL' WHERE s.id IS NULL`);

// ---- cs-270: products never bought by churned (rollup) -----------------------
q("270 FILL churned rollup",
  `SELECT p.name, p.category
   FROM products p
   LEFT JOIN (SELECT DISTINCT oi.product_id AS product_id
              FROM order_items oi
              JOIN orders o ON o.id = oi.order_id
              JOIN customers c ON c.id = o.customer_id
              WHERE c.active = 0) ch
     ON ch.product_id = p.id
   WHERE ch.product_id IS NULL
   ORDER BY p.name`);
q("270 {2}=1 (active arm)", `SELECT COUNT(*) n FROM products p LEFT JOIN (SELECT DISTINCT oi.product_id AS product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id WHERE c.active = 1) ch ON ch.product_id = p.id WHERE ch.product_id IS NULL`);
q("270 {2}=2", `SELECT COUNT(*) n FROM products p LEFT JOIN (SELECT DISTINCT oi.product_id AS product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id WHERE c.active = 2) ch ON ch.product_id = p.id WHERE ch.product_id IS NULL`);
q("270 {1}=INNER", `SELECT COUNT(*) n FROM products p INNER JOIN (SELECT DISTINCT oi.product_id AS product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id WHERE c.active = 0) ch ON ch.product_id = p.id WHERE ch.product_id IS NULL`);
q("270 {3}=p.id", `SELECT COUNT(*) n FROM products p LEFT JOIN (SELECT DISTINCT oi.product_id AS product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id WHERE c.active = 0) ch ON ch.product_id = p.id WHERE p.id IS NULL`);
q("270 churned buyers + order counts", `SELECT c.name, COUNT(DISTINCT o.id) orders FROM customers c JOIN orders o ON o.customer_id = c.id WHERE c.active = 0 GROUP BY c.id`);

// ---- cs-271: suppliers with no LATAM sales (WHERE-IS-NULL, 4 joins) ----------
q("271 FILL suppliers no LATAM (DISTINCT)",
  `SELECT DISTINCT s.name, s.region
   FROM suppliers s
   LEFT JOIN products p ON p.supplier_id = s.id
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN customers c ON c.id = o.customer_id AND c.region = 'LATAM'
   WHERE c.id IS NULL
   ORDER BY s.name`);
q("271 {1}=oi.id", `SELECT COUNT(DISTINCT s.name) n FROM suppliers s LEFT JOIN products p ON oi.id = s.id LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN customers c ON c.id = o.customer_id AND c.region='LATAM' WHERE c.id IS NULL`);
q("271 {1}=o.id", `SELECT COUNT(DISTINCT s.name) n FROM suppliers s LEFT JOIN products p ON o.id = s.id LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN customers c ON c.id = o.customer_id AND c.region='LATAM' WHERE c.id IS NULL`);
q("271 {2}='US'", `SELECT COUNT(*) n FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN customers c ON c.id = o.customer_id AND c.region='US' WHERE c.id IS NULL`);
q("271 {3}=s.id", `SELECT COUNT(*) n FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN customers c ON c.id = o.customer_id AND c.region='LATAM' WHERE s.id IS NULL`);
q("271 {3}=p.id", `SELECT COUNT(*) n FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN customers c ON c.id = o.customer_id AND c.region='LATAM' WHERE p.id IS NULL`);

// ---- cs-272: products never bought by email arrivals (WHERE-IS-NULL, 4 joins) -
q("272 FILL products never email (DISTINCT)",
  `SELECT DISTINCT p.name, p.category
   FROM products p
   LEFT JOIN order_items oi ON oi.product_id = p.id
   LEFT JOIN orders o ON o.id = oi.order_id
   LEFT JOIN customers c ON c.id = o.customer_id
   LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'email'
   WHERE a.id IS NULL
   ORDER BY p.name`);
q("272 {1}='search'", `SELECT COUNT(*) n FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN customers c ON c.id = o.customer_id LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel='search' WHERE a.id IS NULL`);
q("272 {1}='referral'", `SELECT COUNT(*) n FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN customers c ON c.id = o.customer_id LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel='referral' WHERE a.id IS NULL`);
q("272 {1}='social'", `SELECT COUNT(*) n FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN customers c ON c.id = o.customer_id LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel='social' WHERE a.id IS NULL`);
q("272 {2}=c.id", `SELECT COUNT(*) n FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN customers c ON c.id = o.customer_id LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel='email' WHERE c.id IS NULL`);
q("272 {2}=p.id", `SELECT COUNT(*) n FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id LEFT JOIN customers c ON c.id = o.customer_id LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel='email' WHERE p.id IS NULL`);
q("272 email buyers detail", `SELECT c.name, a.id, a.spend, a.acquired_at FROM acquisitions a JOIN customers c ON c.id = a.customer_id WHERE a.channel = 'email'`);

// ---- cs-273: employees never a late_delivery claim (WHERE-IS-NULL) -----------
q("273 FILL never late_delivery (DISTINCT)",
  `SELECT DISTINCT e.name, e.role
   FROM employees e
   LEFT JOIN refunds r ON r.processed_by = e.id AND r.reason = 'late_delivery'
   WHERE r.id IS NULL
   ORDER BY e.name`);
q("273 {2}='wrong_item'", `SELECT COUNT(DISTINCT e.name) n FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id AND r.reason='wrong_item' WHERE r.id IS NULL`);
q("273 {2}='changed_mind'", `SELECT COUNT(DISTINCT e.name) n FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id AND r.reason='changed_mind' WHERE r.id IS NULL`);
q("273 {2}='damaged'", `SELECT COUNT(DISTINCT e.name) n FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id AND r.reason='damaged' WHERE r.id IS NULL`);
q("273 {3}=e.id", `SELECT COUNT(*) n FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id AND r.reason='late_delivery' WHERE e.id IS NULL`);
q("273 {1}=INNER", `SELECT COUNT(*) n FROM employees e INNER JOIN refunds r ON r.processed_by = e.id AND r.reason='late_delivery' WHERE r.id IS NULL`);
q("late_delivery rows", `SELECT r.id, r.amount, e.name FROM refunds r JOIN employees e ON e.id = r.processed_by WHERE r.reason = 'late_delivery' ORDER BY r.id`);

// ---- cs-274: employees never a claim from an EU customer (WHERE-IS-NULL) -----
q("274 FILL never EU claim (DISTINCT)",
  `SELECT DISTINCT e.name, e.role
   FROM employees e
   LEFT JOIN refunds r ON r.processed_by = e.id
   LEFT JOIN orders o ON o.id = r.order_id
   LEFT JOIN customers c ON c.id = o.customer_id AND c.region = 'EU'
   WHERE c.id IS NULL
   ORDER BY e.name`);
q("274 {2}='US'", `SELECT COUNT(DISTINCT e.name) n FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id LEFT JOIN orders o ON o.id = r.order_id LEFT JOIN customers c ON c.id = o.customer_id AND c.region='US' WHERE c.id IS NULL`);
q("274 {2}='APAC'", `SELECT DISTINCT e.name FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id LEFT JOIN orders o ON o.id = r.order_id LEFT JOIN customers c ON c.id = o.customer_id AND c.region='APAC' WHERE c.id IS NULL ORDER BY e.name`);
q("274 {2}='LATAM'", `SELECT COUNT(DISTINCT e.name) n FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id LEFT JOIN orders o ON o.id = r.order_id LEFT JOIN customers c ON c.id = o.customer_id AND c.region='LATAM' WHERE c.id IS NULL`);
q("274 {3}=e.id", `SELECT COUNT(*) n FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id LEFT JOIN orders o ON o.id = r.order_id LEFT JOIN customers c ON c.id = o.customer_id AND c.region='EU' WHERE e.id IS NULL`);
q("274 {3}=o.id", `SELECT COUNT(*) n FROM employees e LEFT JOIN refunds r ON r.processed_by = e.id LEFT JOIN orders o ON o.id = r.order_id LEFT JOIN customers c ON c.id = o.customer_id AND c.region='EU' WHERE o.id IS NULL`);
q("274 EU claim rows", `SELECT r.id, r.amount, e.name, c.name buyer FROM refunds r JOIN employees e ON e.id = r.processed_by JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU' ORDER BY r.id`);

// ---- id-space collision reference table --------------------------------------
q("collisions oi.id=o.id", `SELECT COUNT(*) n FROM order_items oi JOIN orders o ON o.id = oi.id`);
q("collisions o.id=c.id", `SELECT COUNT(*) n FROM orders o JOIN customers c ON c.id = o.id`);
q("collisions oi.id=p.id", `SELECT COUNT(*) n FROM order_items oi JOIN products p ON p.id = oi.id`);
q("collisions s.id=o.id", `SELECT COUNT(*) n FROM shipments s JOIN orders o ON o.id = s.id`);
q("collisions a.id=c.id", `SELECT COUNT(*) n FROM acquisitions a JOIN customers c ON c.id = a.id`);
q("collisions r.id=e.id", `SELECT COUNT(*) n FROM refunds r JOIN employees e ON e.id = r.id`);
q("collisions o.id=s.id reversed", `SELECT COUNT(*) n FROM orders o JOIN suppliers sup ON sup.id = o.id`);
q("collisions p.id=o.id", `SELECT COUNT(*) n FROM products p JOIN orders o ON o.id = p.id`);

db.close();
console.log("\nprobe-j7c6 done");
