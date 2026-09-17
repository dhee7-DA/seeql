// j9-c probe 1 — batch 5 (topic j5 self-joins) corridor facts, cs-317..325 axis:
// comparative self-joins + deep lineages. Readonly copy scripts/.tmp-j9c.db.
// RUN FROM PROJECT ROOT: bun scripts/probe-j9c1.ts
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j9c.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label} ==`);
  for (const r of q(sql)) console.log(JSON.stringify(r));
};

// 1. products per supplier — solo catalogs alive?
show("products per supplier", `
SELECT s.id, s.name, s.region, s.rating, COUNT(p.id) AS skus, MIN(p.price) lo, MAX(p.price) hi
FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id
GROUP BY s.id ORDER BY s.id`);

// 2. category pairs + price gaps (the cs-317 board)
show("category pairs gap desc", `
SELECT p1.name a, p2.name b, p1.category, ROUND(p2.price - p1.price, 2) AS gap
FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id
ORDER BY gap DESC, p1.id`);

show("category pairs count by category", `
SELECT p1.category, COUNT(*) AS pairs
FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id
GROUP BY p1.category ORDER BY pairs DESC`);

// 3. supplier rating duel (same region)
show("supplier same-region pairs", `
SELECT s1.name a, s1.rating ra, s2.name b, s2.rating rb, s1.region,
       s2.rating - s1.rating raw_diff, ROUND(s2.rating - s1.rating, 1) rounded
FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.id < s2.id
ORDER BY s1.id`);

// 4. three-alias lineage e->m->g
show("lineage 3-alias rows", `
SELECT e.name emp, e.role, m.name mgr, g.name grand
FROM employees e
JOIN employees m ON m.id = e.manager_id
JOIN employees g ON g.id = m.manager_id
ORDER BY e.id`);

show("2-alias reports", `
SELECT e.name emp, m.name mgr, m.manager_id AS mgrs_mgr
FROM employees e JOIN employees m ON m.id = e.manager_id
ORDER BY e.id`);

// lineage distractor variants
show("lineage variant g.id = e.manager_id (grand=manager)", `
SELECT e.name emp, m.name mgr, g.name grand
FROM employees e
JOIN employees m ON m.id = e.manager_id
JOIN employees g ON g.id = e.manager_id
ORDER BY e.id`);
show("lineage variant m.manager_id = e.id (reversed 2nd hop)", `
SELECT e.name emp, m.name mgr, g.name grand
FROM employees e
JOIN employees m ON m.manager_id = e.id
JOIN employees g ON g.id = m.manager_id
ORDER BY e.id`);

// 5. colleague pairs under one manager
show("same-manager sibling pairs", `
SELECT e1.name a, e1.region ra, e2.name b, e2.region rb, e1.manager_id
FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.id
ORDER BY e1.id`);
show("cross-region colleagues only", `
SELECT e1.name a, e1.region ra, e2.name b, e2.region rb, m.name mgr, m.region mr
FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.id
JOIN employees m ON m.id = e1.manager_id
WHERE e1.region <> e2.region
ORDER BY e1.id`);
show("same-region colleagues only", `
SELECT e1.name a, e2.name b, e1.region
FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.id
WHERE e1.region = e2.region
ORDER BY e1.id`);
show("collision e1.id = e2.manager_id (mgr-report pairs, id<id)", `
SELECT e1.name a, e2.name b FROM employees e1 JOIN employees e2 ON e1.id = e2.manager_id AND e1.id < e2.id`);
show("collision e1.manager_id = e2.id (report-mgr, id<id)", `
SELECT e1.name a, e2.name b FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.id AND e1.id < e2.id`);
show("no-guard same-manager count", `
SELECT COUNT(*) n FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id`);

// 6. repeat-refund pairs r1/r2 on same order
show("refund self-pairs", `
SELECT r1.id a, r1.order_id t, r1.amount a_amt, r1.reason a_reason, r1.processed_by a_by,
       r2.id b, r2.amount b_amt, r2.reason b_reason, r2.processed_by b_by,
       o.total, o.customer_id
FROM refunds r1 JOIN refunds r2 ON r1.order_id = r2.order_id AND r1.id < r2.id
JOIN orders o ON o.id = r1.order_id
ORDER BY r1.id`);
show("refund pairs where first claim bigger", `
SELECT r1.id FROM refunds r1 JOIN refunds r2 ON r1.order_id = r2.order_id AND r1.id < r2.id
WHERE r1.amount > r2.amount`);
show("refund pairs where first claim smaller", `
SELECT r1.id FROM refunds r1 JOIN refunds r2 ON r1.order_id = r2.order_id AND r1.id < r2.id
WHERE r1.amount < r2.amount`);
show("refund pairs same reason", `
SELECT r1.id, r1.reason FROM refunds r1 JOIN refunds r2 ON r1.order_id = r2.order_id AND r1.id < r2.id
WHERE r1.reason = r2.reason`);
show("refund pairs diff reason", `
SELECT r1.id, r1.reason, r2.reason FROM refunds r1 JOIN refunds r2 ON r1.order_id = r2.order_id AND r1.id < r2.id
WHERE r1.reason <> r2.reason`);
show("refund pairs no-guard count", `
SELECT COUNT(*) n FROM refunds r1 JOIN refunds r2 ON r1.order_id = r2.order_id`);

// 7. per-customer biggest ticket via LEFT anti self-join
show("expensive twin per customer (LEFT anti)", `
SELECT c.name, o1.total
FROM orders o1
JOIN customers c ON c.id = o1.customer_id
LEFT JOIN orders o2 ON o2.customer_id = o1.customer_id AND o2.total > o1.total
WHERE o2.id IS NULL
ORDER BY o1.total DESC`);
show("ties within customer at max?", `
SELECT COUNT(*) n FROM orders o1 WHERE EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = o1.customer_id AND o2.id <> o1.id AND o2.total = o1.total)`);
show("reversed: smallest twin per customer", `
SELECT c.name, o1.total
FROM orders o1
JOIN customers c ON c.id = o1.customer_id
LEFT JOIN orders o2 ON o2.customer_id = o1.customer_id AND o2.total < o1.total
WHERE o2.id IS NULL
ORDER BY o1.total`);
show("INNER version of twin query (should be 0)", `
SELECT COUNT(*) n FROM orders o1
JOIN orders o2 ON o2.customer_id = o1.customer_id AND o2.total > o1.total
WHERE o2.id IS NULL`);

// 8. customer-pair order-count board (aggregate over self-join)
show("pair board top pairings", `
SELECT c1.name a, c2.name b, c1.region, COUNT(*) pairings, COUNT(DISTINCT o1.id) o1n, COUNT(DISTINCT o2.id) o2n
FROM customers c1
JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id
JOIN orders o1 ON o1.customer_id = c1.id
JOIN orders o2 ON o2.customer_id = c2.id
GROUP BY c1.id, c2.id
ORDER BY pairings DESC LIMIT 10`);
show("pair board US row", `
SELECT c1.name a, c2.name b, COUNT(*) pairings, COUNT(DISTINCT o1.id) o1n, COUNT(DISTINCT o2.id) o2n
FROM customers c1
JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id
JOIN orders o1 ON o1.customer_id = c1.id
JOIN orders o2 ON o2.customer_id = c2.id
WHERE c1.region = 'US'
GROUP BY c1.id, c2.id`);
show("pair board total rows + per region", `
SELECT c1.region, COUNT(*) pairs FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id GROUP BY c1.region ORDER BY pairs DESC`);
show("no-guard join row count c1.region=c2.region", `
SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.region = c2.region`);
show("orders per customer (top)", `
SELECT c.name, COUNT(o.id) n FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY n DESC LIMIT 6`);

// 9. split-payment self pairs
show("split-payment pairs", `
SELECT p1.id a, p1.order_id t, p1.amount a_amt, p1.method m1, p2.id b, p2.amount b_amt, p2.method m2, o.total
FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id
JOIN orders o ON o.id = p1.order_id
ORDER BY p1.id`);
show("split pairs first bigger?", `
SELECT p1.id FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id WHERE p1.amount > p2.amount`);
show("split pairs sum vs total", `
SELECT p1.order_id, ROUND(p1.amount + p2.amount, 2) s, o.total FROM payments p1
JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id JOIN orders o ON o.id = p1.order_id`);

// 10. collision reference in self-join contexts
show("collision p1.id = p2.supplier_id pairs", `
SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.id = p2.supplier_id`);
show("category guard with id=id (self rows)", `
SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id = p2.id`);
show("o1.id = o2.customer_id same-customer collision", `
SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.id = o2.customer_id`);
show("r1.id = r2.order_id refund collision", `
SELECT COUNT(*) n FROM refunds r1 JOIN refunds r2 ON r1.id = r2.order_id`);
show("p1.id = p2.supplier_id under supplier guard", `
SELECT p1.name, p2.name FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id = p2.supplier_id`);

// 11. stock gaps within category (inventory fallback) + same-supplier ladder
show("category stock gap top", `
SELECT p1.name a, p2.name b, p1.category, p2.stock - p1.stock AS sdiff
FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id
ORDER BY sdiff DESC LIMIT 6`);
show("same-supplier pairs count per supplier", `
SELECT s.name, COUNT(*) pairs FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id JOIN suppliers s ON s.id = p1.supplier_id GROUP BY s.id ORDER BY pairs DESC`);
show("same-supplier same-category pairs", `
SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.category = p2.category AND p1.id < p2.id`);

// 12. supplier pair facts for cs-318 (rating duel)
show("supplier pairs no-guard (incl self)", `
SELECT s1.name a, s2.name b FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region ORDER BY s1.id, s2.id`);
show("supplier duel diff-flip variant", `
SELECT s1.name a, s2.name b, ROUND(s1.rating - s2.rating, 1) d FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.id < s2.id`);

db.close();
console.log("\nprobe-j9c1 done");
