// j9-c probe 2 — distractor-consequence variants + prose facts for cs-317..325.
// Readonly copy scripts/.tmp-j9c.db. RUN FROM PROJECT ROOT.
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j9c.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();
const one = (sql: string) => JSON.stringify(q(sql));
const show = (label: string, sql: string) => console.log(`\n== ${label} ==\n${one(sql)}`);

// --- prose facts ---
show("products with supplier (cs-323 prose)", `
SELECT p.id, p.name, p.category, p.price, s.name maker FROM products p JOIN suppliers s ON s.id = p.supplier_id ORDER BY p.id`);
show("orders per customer all (cs-324 prose)", `
SELECT c.name, COUNT(o.id) n FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY n DESC`);
show("pair board combined top 6 (cs-324)", `
SELECT c1.name a, c2.name b, COUNT(DISTINCT o1.id) oa, COUNT(DISTINCT o2.id) ob,
       COUNT(DISTINCT o1.id) + COUNT(DISTINCT o2.id) comb
FROM customers c1
JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id
JOIN orders o1 ON o1.customer_id = c1.id
JOIN orders o2 ON o2.customer_id = c2.id
GROUP BY c1.id, c2.id ORDER BY comb DESC LIMIT 6`);
show("gap>=40 rows (cs-317 fill shape)", `
SELECT p1.category, p1.name a, p2.name b, abs(p2.price - p1.price) gap
FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id
WHERE abs(p2.price - p1.price) >= 40 ORDER BY gap DESC`);

// --- cs-319 lineage variants ---
show("319 v: m.manager_id = e.manager_id", `
SELECT COUNT(*) n FROM employees e JOIN employees m ON m.manager_id = e.manager_id JOIN employees g ON g.id = m.manager_id`);
show("319 v: m.id = g.manager_id", `
SELECT e.name, m.name, g.name FROM employees e JOIN employees m ON m.id = e.manager_id JOIN employees g ON g.manager_id = m.id`);
show("319 v: g.id = m.id", `
SELECT COUNT(*) n FROM employees e JOIN employees m ON m.id = e.manager_id JOIN employees g ON g.id = m.id`);
show("319 v: m.id = e.id", `
SELECT COUNT(*) n FROM employees e JOIN employees m ON m.id = e.id JOIN employees g ON g.id = m.manager_id`);

// --- cs-320 colleague variants ---
show("320 v: e1.id < e2.manager_id (guard swap)", `
SELECT e1.name a, e2.name b FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.manager_id WHERE e1.region <> e2.region`);
show("320 v: m.id = e1.id", `
SELECT e1.name a, e2.name b, m.name mgr FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.id JOIN employees m ON m.id = e1.id WHERE e1.region <> e2.region`);
show("320 v: e1.manager_id = e2.manager_id as 3rd ON (m free)", `
SELECT COUNT(*) n FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.id JOIN employees m ON e1.manager_id = e2.manager_id WHERE e1.region <> e2.region`);
show("320 v: e1.manager_id in slot1 (always true)", `
SELECT COUNT(*) n FROM employees e1 JOIN employees e2 ON e1.manager_id = e1.manager_id AND e1.id < e2.id WHERE e1.region <> e2.region`);
show("320 v: e1.id = e2.manager_id + region arm", `
SELECT e1.name a, e2.name b FROM employees e1 JOIN employees e2 ON e1.id = e2.manager_id AND e1.id < e2.id WHERE e1.region <> e2.region`);

// --- cs-321 refund variants ---
show("321 v: r1.order_id = r2.id", `SELECT COUNT(*) n FROM refunds r1 JOIN refunds r2 ON r1.order_id = r2.id`);
show("321 v: r1.id < r2.order_id guard swap", `
SELECT r1.id a, r2.id b FROM refunds r1 JOIN refunds r2 ON r1.order_id = r2.order_id AND r1.id < r2.order_id WHERE r1.amount > r2.amount`);
show("321 v: r1.id = r2.id then amount cmp", `
SELECT COUNT(*) n FROM refunds r1 JOIN refunds r2 ON r1.id = r2.id WHERE r1.amount > r2.amount`);
show("321 v: r1.id = r2.order_id then amount cmp", `
SELECT r1.id a, r2.id b FROM refunds r1 JOIN refunds r2 ON r1.id = r2.order_id WHERE r1.amount > r2.amount`);
show("321 correct fill rows", `
SELECT r1.id a, r2.id b, r1.order_id t, r1.amount, r2.amount FROM refunds r1 JOIN refunds r2 ON r1.order_id = r2.order_id AND r1.id < r2.id WHERE r1.amount > r2.amount ORDER BY t`);

// --- cs-322 twin variants ---
show("322 v: c.id = o1.id collision", `
SELECT COUNT(*) n FROM orders o1 JOIN customers c ON c.id = o1.id`);
show("322 v: o2.customer_id = o1.id", `
SELECT COUNT(*) n FROM orders o1 LEFT JOIN orders o2 ON o2.customer_id = o1.id AND o2.total > o1.total WHERE o2.id IS NULL`);
show("322 v: o2.customer_id = o2.customer_id", `
SELECT COUNT(*) n FROM orders o1 LEFT JOIN orders o2 ON o2.customer_id = o2.customer_id AND o2.total > o1.total WHERE o2.id IS NULL`);
show("322 v: INNER swap", `
SELECT COUNT(*) n FROM orders o1 JOIN customers c ON c.id = o1.customer_id INNER JOIN orders o2 ON o2.customer_id = o1.customer_id AND o2.total > o1.total WHERE o2.id IS NULL`);
show("322 v: CROSS swap", `
SELECT COUNT(*) n FROM orders o1 JOIN customers c ON c.id = o1.customer_id CROSS JOIN orders o2 ON o2.customer_id = o1.customer_id AND o2.total > o1.total WHERE o2.id IS NULL`);
show("322 v: >= arm", `
SELECT COUNT(*) n FROM orders o1 LEFT JOIN orders o2 ON o2.customer_id = o1.customer_id AND o2.total >= o1.total WHERE o2.id IS NULL`);
show("322 v: c.id in arm slot", `
SELECT COUNT(*) n FROM orders o1 LEFT JOIN orders o2 ON o2.customer_id = o1.customer_id AND c.id WHERE o2.id IS NULL`);

// --- cs-323 shelf ladder variants + fill ---
show("323 fill rows", `
SELECT s.name maker, p1.name a, p2.name b, ROUND(p2.price - p1.price, 2) step
FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id
JOIN suppliers s ON s.id = p1.supplier_id
ORDER BY s.name, step DESC`);
show("323 v: p1.category = p2.category arm swap", `
SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id JOIN suppliers s ON s.id = p1.supplier_id`);
show("323 v: p1.supplier_id = p2.id", `
SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.supplier_id = p2.id AND p1.id < p2.id`);
show("323 v: s.id = p1.id", `
SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id JOIN suppliers s ON s.id = p1.id`);
show("323 v: s.rating = p1.supplier_id", `
SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id JOIN suppliers s ON s.rating = p1.supplier_id`);
show("323 v: s.region = p1.supplier_id", `
SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id JOIN suppliers s ON s.region = p1.supplier_id`);

// --- cs-324 pair board variants ---
show("324 v: o1.customer_id = c2.id", `
SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id JOIN orders o1 ON o1.customer_id = c2.id JOIN orders o2 ON o2.customer_id = c2.id`);
show("324 v: o1.id = c1.id", `
SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id JOIN orders o1 ON o1.id = c1.id JOIN orders o2 ON o2.customer_id = c2.id`);
show("324 v: c1.id = c2.id in o1 ON", `
SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id JOIN orders o1 ON c1.id = c2.id JOIN orders o2 ON o2.customer_id = c2.id`);
show("324 v: c1.id = c2.id guard swap", `
SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id = c2.id JOIN orders o1 ON o1.customer_id = c1.id JOIN orders o2 ON o2.customer_id = c2.id`);

// --- cs-325 installment variants ---
show("325 fill rows", `
SELECT p1.id a, p2.id b, p1.order_id t, p1.method m1, p2.method m2, p1.status s1, ROUND(p1.amount + p2.amount, 2) addback
FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id
JOIN orders o ON o.id = p1.order_id
WHERE p1.status = 'settled'
ORDER BY t`);
show("325 v: p1.id = p2.order_id", `SELECT COUNT(*) n FROM payments p1 JOIN payments p2 ON p1.id = p2.order_id AND p1.id < p2.id WHERE p1.status = 'settled'`);
show("325 v: p1.order_id = p2.id", `SELECT COUNT(*) n FROM payments p1 JOIN payments p2 ON p1.order_id = p2.id AND p1.id < p2.id WHERE p1.status = 'settled'`);
show("325 v: o.id = p1.id", `
SELECT COUNT(*) n FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id JOIN orders o ON o.id = p1.id WHERE p1.status = 'settled'`);
show("325 v: o.id = p2.id", `
SELECT COUNT(*) n FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id JOIN orders o ON o.id = p2.id WHERE p1.status = 'settled'`);
show("325 v: o.customer_id = p1.order_id", `
SELECT COUNT(*) n FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id JOIN orders o ON o.customer_id = p1.order_id WHERE p1.status = 'settled'`);
show("325 v: p1.id = p2.id then settled", `
SELECT COUNT(*) n FROM payments p1 JOIN payments p2 ON p1.id = p2.id AND p1.id < p2.id JOIN orders o ON o.id = p1.order_id WHERE p1.status = 'settled'`);
show("325 v: diff expression", `
SELECT p1.id, ROUND(p1.amount - p2.amount, 2) d FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id WHERE p1.status = 'settled'`);

// --- cs-318 duel: full correct rows + region-arm swaps ---
show("318 fill rows", `
SELECT s1.name a, s1.rating, s2.name b, s2.rating, ROUND(s2.rating - s1.rating, 1) edge
FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.id < s2.id
ORDER BY edge DESC`);
show("318 v: s1.region = s1.rating", `SELECT COUNT(*) n FROM suppliers s1 JOIN suppliers s2 ON s1.region = s1.rating AND s1.id < s2.id`);
show("318 v: s1.region = s1.name", `SELECT COUNT(*) n FROM suppliers s1 JOIN suppliers s2 ON s1.region = s1.name AND s1.id < s2.id`);
show("318 v: s1.rating < s2.rating arm", `
SELECT s1.name a, s2.name b FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.rating < s2.rating`);

// --- cs-317 extra: threshold 40 vs 50 vs 95 vs 10 rows ---
for (const t of [10, 40, 45, 50, 95, 120]) {
  console.log(`\n== 317 threshold ${t} ==`);
  console.log(one(`SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id WHERE abs(p2.price - p1.price) >= ${t}`));
}

db.close();
console.log("\nprobe-j9c2 done");
