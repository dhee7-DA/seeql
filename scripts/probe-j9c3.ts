// j9-c probe round 3 — corridors the crashed probe-j9c2 never reached, plus
// fresh comparative surfaces for cs-317..cs-325 (rating duel, lineage matrix,
// pair board variants, stock gaps, status contrast, order_items self-join,
// signup-month twins). Self-copies db/custom.db to scripts/.tmp-j9c.db and
// deletes the copy when done. NEVER opens db/custom.db writable.
// Run from PROJECT ROOT: bun scripts/probe-j9c3.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.tmp-j9c.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const one = (sql: string) => JSON.stringify(q(sql));
const show = (label: string, sql: string) => {
  console.log(`\n== ${label} ==`);
  try {
    const rows = q(sql);
    for (const r of rows) console.log(JSON.stringify(r));
    if (rows.length === 0) console.log("(0 rows)");
  } catch (e) {
    console.log("ERROR:", e instanceof Error ? e.message : e);
  }
};

// ---------- A. customers signup cohorts ----------
show("customers created_at all", `SELECT id, name, region, created_at FROM customers ORDER BY created_at`);
show("signup-month twins", `
SELECT c1.name a, c2.name b, strftime('%Y-%m', c1.created_at) m
FROM customers c1 JOIN customers c2
  ON strftime('%Y-%m', c1.created_at) = strftime('%Y-%m', c2.created_at) AND c1.id < c2.id
ORDER BY m, c1.id`);
show("signup-month no-guard count", `
SELECT COUNT(*) n FROM customers c1 JOIN customers c2
  ON strftime('%Y-%m', c1.created_at) = strftime('%Y-%m', c2.created_at)`);
show("signup-month <= battle", `
SELECT
 (SELECT COUNT(*) FROM customers c1 JOIN customers c2 ON strftime('%Y-%m',c1.created_at)=strftime('%Y-%m',c2.created_at) AND c1.id < c2.id) lt,
 (SELECT COUNT(*) FROM customers c1 JOIN customers c2 ON strftime('%Y-%m',c1.created_at)=strftime('%Y-%m',c2.created_at) AND c1.id <= c2.id) lte,
 (SELECT COUNT(*) FROM customers c1 JOIN customers c2 ON strftime('%Y-%m',c1.created_at)=strftime('%Y-%m',c2.created_at) AND c1.id <> c2.id) neq`);
show("signup-city twins (expect 0)", `
SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.city = c2.city AND c1.id < c2.id`);

// ---------- B. status contrast: settled history vs open exposure ----------
show("delivered x pending pairs per buyer", `
SELECT c.name, COUNT(*) pairs
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
JOIN customers c ON c.id = o1.customer_id
WHERE o1.status = 'delivered' AND o2.status = 'pending'
GROUP BY c.id ORDER BY pairs DESC, c.name`);
show("delivered x pending total", `
SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
WHERE o1.status = 'delivered' AND o2.status = 'pending'`);
show("delivered x pending guard battle", `
SELECT
 (SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o1.id < o2.id WHERE o1.status='delivered' AND o2.status='pending') strict,
 (SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o1.id <= o2.id WHERE o1.status='delivered' AND o2.status='pending') lte,
 (SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id WHERE o1.status='delivered' AND o2.status='pending') bare,
 (SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o1.id < o2.id WHERE o1.status='pending' AND o2.status='delivered') flipped`);
show("delivered x pending biggest combined", `
SELECT c.name, o1.id t1, ROUND(o1.total,2) settled, o2.id t2, ROUND(o2.total,2) open_amt,
       ROUND(o1.total + o2.total, 2) book
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
JOIN customers c ON c.id = o1.customer_id
WHERE o1.status = 'delivered' AND o2.status = 'pending'
ORDER BY book DESC LIMIT 6`);
show("shipped x pending pairs total", `
SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
WHERE o1.status = 'shipped' AND o2.status = 'pending'`);
show("shipped x pending per buyer", `
SELECT c.name, COUNT(*) pairs
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
JOIN customers c ON c.id = o1.customer_id
WHERE o1.status = 'shipped' AND o2.status = 'pending'
GROUP BY c.id ORDER BY pairs DESC`);

// ---------- C. order_items self-join (fresh surface) ----------
show("order_items per product dist", `
SELECT n, COUNT(*) products FROM (
  SELECT product_id, COUNT(*) n FROM order_items GROUP BY product_id
) GROUP BY n ORDER BY n`);
show("same-product pairs total + unit price const", `
SELECT
 (SELECT COUNT(*) FROM order_items i1 JOIN order_items i2 ON i1.product_id = i2.product_id AND i1.id < i2.id) pairs,
 (SELECT COUNT(*) FROM order_items i1 JOIN order_items i2 ON i1.product_id = i2.product_id AND i1.id < i2.id WHERE i1.unit_price <> i2.unit_price) price_variants`);
show("same-product pair guard battle", `
SELECT
 (SELECT COUNT(*) FROM order_items i1 JOIN order_items i2 ON i1.product_id=i2.product_id AND i1.id<i2.id) strict,
 (SELECT COUNT(*) FROM order_items i1 JOIN order_items i2 ON i1.product_id=i2.product_id AND i1.id<=i2.id) lte,
 (SELECT COUNT(*) FROM order_items i1 JOIN order_items i2 ON i1.product_id=i2.product_id) bare`);
show("same-product qty spread top", `
SELECT p.name, i1.quantity q1, i2.quantity q2, i2.quantity - i1.quantity AS delta,
       ROUND((i1.quantity*i1.unit_price),2) v1, ROUND((i2.quantity*i2.unit_price),2) v2
FROM order_items i1 JOIN order_items i2 ON i1.product_id = i2.product_id AND i1.id < i2.id
JOIN products p ON p.id = i1.product_id
ORDER BY ABS(i2.quantity - i1.quantity) DESC LIMIT 8`);
show("same-product qty spread threshold 5", `
SELECT COUNT(*) n FROM order_items i1 JOIN order_items i2 ON i1.product_id = i2.product_id AND i1.id < i2.id
WHERE ABS(i2.quantity - i1.quantity) >= 5`);
show("same-product cross-order only (drop same-order pairs)", `
SELECT COUNT(*) n FROM order_items i1 JOIN order_items i2
  ON i1.product_id = i2.product_id AND i1.id < i2.id AND i1.order_id <> i2.order_id`);
show("same-product same-order double-lines", `
SELECT i1.id, i2.id, i1.order_id, i1.product_id, p.name, i1.quantity q1, i2.quantity q2
FROM order_items i1 JOIN order_items i2 ON i1.product_id = i2.product_id AND i1.id < i2.id AND i1.order_id = i2.order_id
JOIN products p ON p.id = i1.product_id`);
show("collision i1.id = i2.product_id", `
SELECT COUNT(*) n FROM order_items i1 JOIN order_items i2 ON i1.id = i2.product_id`);
show("collision i1.order_id = i2.product_id", `
SELECT COUNT(*) n FROM order_items i1 JOIN order_items i2 ON i1.order_id = i2.product_id`);
show("same-product widest qty gap per product (LEFT anti)", `
SELECT p.name, i1.quantity, COUNT(*) AS mates
FROM order_items i1 JOIN products p ON p.id = i1.product_id
LEFT JOIN order_items i2 ON i2.product_id = i1.product_id AND i2.quantity > i1.quantity
WHERE i2.id IS NULL
GROUP BY i1.id, p.name, i1.quantity ORDER BY i1.quantity DESC LIMIT 8`);

// ---------- D. dead-corridor checks ----------
show("same-total pairs within buyer (expect 0?)", `
SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
WHERE o1.total = o2.total`);
show("payments equal amounts across ledger", `
SELECT COUNT(*) n FROM payments p1 JOIN payments p2 ON p1.id < p2.id AND p1.amount = p2.amount`);
show("payments same amount same method count", `
SELECT COUNT(*) n FROM payments p1 JOIN payments p2 ON p1.id < p2.id AND p1.amount = p2.amount AND p1.method = p2.method`);

// ---------- E. rating duel (cs-317) ----------
show("duel correct fill", `
SELECT s1.name AS house_a, s1.rating AS rating_a, s2.name AS house_b, s2.rating AS rating_b,
       ROUND(s2.rating - s1.rating, 1) AS edge
FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.id < s2.id
ORDER BY edge DESC, s1.id`);
show("duel guard battle (region match)", `
SELECT
 (SELECT COUNT(*) FROM suppliers s1 JOIN suppliers s2 ON s1.region=s2.region AND s1.id < s2.id) strict,
 (SELECT COUNT(*) FROM suppliers s1 JOIN suppliers s2 ON s1.region=s2.region AND s1.id <= s2.id) lte,
 (SELECT COUNT(*) FROM suppliers s1 JOIN suppliers s2 ON s1.region=s2.region AND s1.id <> s2.id) neq,
 (SELECT COUNT(*) FROM suppliers s1 JOIN suppliers s2 ON s1.region=s2.region) bare,
 (SELECT COUNT(*) FROM suppliers s1 JOIN suppliers s2 ON s1.region=s2.region AND s1.rating <> s2.rating) rating_neq`);
show("duel flip variant", `
SELECT s1.name a, s2.name b, ROUND(s1.rating - s2.rating, 1) edge
FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.id < s2.id ORDER BY edge DESC`);
show("duel wrong-key variants", `
SELECT
 (SELECT COUNT(*) FROM suppliers s1 JOIN suppliers s2 ON s1.region = s1.rating AND s1.id < s2.id) region_rating,
 (SELECT COUNT(*) FROM suppliers s1 JOIN suppliers s2 ON s1.region = s1.name AND s1.id < s2.id) region_name,
 (SELECT COUNT(*) FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.id < s2.id WHERE s1.rating > s2.rating) left_wins,
 (SELECT COUNT(*) FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.id < s2.id WHERE s1.rating < s2.rating) right_wins`);

// ---------- F. lineage (cs-318) ----------
show("lineage strict chain (rep filter)", `
SELECT e.name AS report, e.role AS report_role, m.name AS manager, g.name AS grand_manager
FROM employees e
JOIN employees m ON m.id = e.manager_id
JOIN employees g ON g.id = m.manager_id
WHERE e.role = 'rep'
ORDER BY e.id`);
show("lineage without rep filter", `
SELECT e.name emp, e.role, m.name mgr, g.name grand
FROM employees e JOIN employees m ON m.id = e.manager_id JOIN employees g ON g.id = m.manager_id
ORDER BY e.id`);
show("lineage variants counts", `
SELECT
 (SELECT COUNT(*) FROM employees e JOIN employees m ON m.id=e.manager_id JOIN employees g ON g.id=m.manager_id WHERE e.role='rep') strict3,
 (SELECT COUNT(*) FROM employees e JOIN employees m ON m.id=e.manager_id JOIN employees g ON g.id=e.manager_id WHERE e.role='rep') grand_is_mgr,
 (SELECT COUNT(*) FROM employees e JOIN employees m ON m.id=e.manager_id JOIN employees g ON g.id=m.id WHERE e.role='rep') grand_is_mgr_row,
 (SELECT COUNT(*) FROM employees e JOIN employees m ON m.id=e.id JOIN employees g ON g.id=m.manager_id WHERE e.role='rep') self_boss,
 (SELECT COUNT(*) FROM employees e JOIN employees m ON m.manager_id=e.id JOIN employees g ON g.id=m.manager_id WHERE e.role='rep') reversed`,
);
show("lineage LEFT-extended 7 rows", `
SELECT e.name emp, m.name mgr, g.name grand
FROM employees e
JOIN employees m ON m.id = e.manager_id
LEFT JOIN employees g ON g.id = m.manager_id
ORDER BY e.id`);

// ---------- G. biggest ticket per account (cs-320) ----------
show("biggest ticket fill", `
SELECT c.name AS account, o1.id AS ticket, ROUND(o1.total, 2) AS ticket_total
FROM orders o1
JOIN customers c ON c.id = o1.customer_id
LEFT JOIN orders o2 ON o2.customer_id = o1.customer_id AND o2.total > o1.total
WHERE o2.id IS NULL
ORDER BY o1.total DESC`);
show("biggest ticket variants", `
SELECT
 (SELECT COUNT(*) FROM orders o1 LEFT JOIN orders o2 ON o2.customer_id=o1.customer_id AND o2.total > o1.total WHERE o2.id IS NULL) no_customer_join,
 (SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o2.customer_id=o1.customer_id AND o2.total > o1.total WHERE o2.id IS NULL) inner_swap,
 (SELECT COUNT(*) FROM orders o1 LEFT JOIN orders o2 ON o2.customer_id=o1.customer_id AND o2.total >= o1.total WHERE o2.id IS NULL) gte_arm,
 (SELECT COUNT(*) FROM orders o1 LEFT JOIN orders o2 ON o2.customer_id=o1.customer_id AND o2.total < o1.total WHERE o2.id IS NULL) lt_arm,
 (SELECT COUNT(*) FROM orders o1 LEFT JOIN orders o2 ON o2.customer_id=o1.id AND o2.total > o1.total WHERE o2.id IS NULL) id_collision,
 (SELECT COUNT(*) FROM orders o1 LEFT JOIN orders o2 ON o2.customer_id=o1.customer_id AND o2.id > o1.id WHERE o2.id IS NULL) later_not_dearer`);

// ---------- H. pair board (cs-321) ----------
show("pair board top 4 (COUNT(*))", `
SELECT c1.name AS account_a, c2.name AS account_b, c1.region, COUNT(*) AS pairings
FROM customers c1
JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id
JOIN orders o1 ON o1.customer_id = c1.id
JOIN orders o2 ON o2.customer_id = c2.id
GROUP BY c1.id, c2.id
ORDER BY pairings DESC LIMIT 4`);
show("pair board variants", `
SELECT
 (SELECT COUNT(*) FROM customers c1 JOIN customers c2 ON c1.region=c2.region AND c1.id<c2.id JOIN orders o1 ON o1.customer_id=c2.id JOIN orders o2 ON o2.customer_id=c2.id) o1_wrong_side,
 (SELECT COUNT(*) FROM customers c1 JOIN customers c2 ON c1.region=c2.region AND c1.id<c2.id JOIN orders o1 ON o1.id=c1.id JOIN orders o2 ON o2.customer_id=c2.id) o1_id_collision,
 (SELECT COUNT(*) FROM customers c1 JOIN customers c2 ON c1.region=c2.region AND c1.id=c2.id JOIN orders o1 ON o1.customer_id=c1.id JOIN orders o2 ON o2.customer_id=c2.id) guard_eq,
 (SELECT COUNT(*) FROM customers c1 JOIN customers c2 ON c1.region=c2.region AND c1.id<>c2.id JOIN orders o1 ON o1.customer_id=c1.id JOIN orders o2 ON o2.customer_id=c2.id) guard_neq,
 (SELECT COUNT(*) FROM customers c1 JOIN customers c2 ON c1.region=c2.region AND c1.id<c2.id JOIN orders o1 ON o1.customer_id=c1.id JOIN orders o2 ON o2.customer_id=o1.id) o2_on_o1,
 (SELECT COUNT(*) FROM customers c1 JOIN customers c2 ON c1.region=c2.region AND c1.id<c2.id JOIN orders o1 ON o1.customer_id=c1.id JOIN orders o2 ON o2.id=c1.id) o2_id_collision`);
show("pair board grace maya detail", `
SELECT COUNT(*) pairings, COUNT(DISTINCT o1.id) ga, COUNT(DISTINCT o2.id) mb
FROM customers c1 JOIN customers c2 ON c1.region=c2.region AND c1.id < c2.id
JOIN orders o1 ON o1.customer_id = c1.id JOIN orders o2 ON o2.customer_id = c2.id
WHERE c1.name = 'Grace Kim' AND c2.name = 'Maya Patel'`);

// ---------- I. stock gaps (cs-322) ----------
show("stock gap all 12 pairs", `
SELECT p1.name a, p2.name b, p1.category, p2.stock - p1.stock AS units_behind
FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id
ORDER BY units_behind DESC`);
show("stock gap thresholds", `
SELECT
 (SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.category=p2.category AND p1.id<p2.id WHERE p2.stock - p1.stock >= 100) g100,
 (SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.category=p2.category AND p1.id<p2.id WHERE p2.stock - p1.stock >= 50) g50,
 (SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.category=p2.category AND p1.id<p2.id WHERE p2.stock - p1.stock >= 150) g150,
 (SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.category=p2.category AND p1.id<p2.id WHERE ABS(p2.stock - p1.stock) >= 100) abs100`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe-j9c3 done (copy cleaned)");
