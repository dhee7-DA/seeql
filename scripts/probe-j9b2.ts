// j9-b probe round 2 — clean detail rows + every planned distractor substitution.
// Run from PROJECT ROOT: bun scripts/probe-j9b2.ts
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
const cnt = (label: string, sql: string) => {
  try {
    console.log(`${label}:`, JSON.stringify(q(sql)));
  } catch (e) {
    console.log(`${label}: ERROR`, e instanceof Error ? e.message : e);
  }
};

// ---------- clean detail rows (unique aliases!) ----------
show("payment split pairs — full detail", `
SELECT p1.order_id AS tick, o.total AS ticket_total, c.name AS buyer,
       p1.id AS pid1, p1.amount AS amt1, p1.method AS m1, p1.status AS s1,
       p2.id AS pid2, p2.amount AS amt2, p2.method AS m2, p2.status AS s2,
       ROUND(p1.amount + p2.amount, 2) AS pair_sum
FROM payments p1
JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id
JOIN orders o ON o.id = p1.order_id
JOIN customers c ON c.id = o.customer_id
ORDER BY tick;`);
show("acquisition repeat-touch pair — full detail", `
SELECT a1.id AS aid1, a1.channel AS ch1, a1.spend AS sp1, a1.acquired_at AS at1,
       a2.id AS aid2, a2.channel AS ch2, a2.spend AS sp2, a2.acquired_at AS at2,
       c.name AS buyer, ROUND(a1.spend + a2.spend, 2) AS total_spend
FROM acquisitions a1
JOIN acquisitions a2 ON a1.customer_id = a2.customer_id AND a1.id < a2.id
JOIN customers c ON c.id = a1.customer_id;`);
show("refund double-claim pairs — full detail", `
SELECT o.id AS tick, c.name AS buyer, o.total AS ticket_total, o.status AS ostatus,
       r1.id AS rid1, r1.amount AS ramt1, r1.reason AS rsn1, e1.name AS proc1,
       r2.id AS rid2, r2.amount AS ramt2, r2.reason AS rsn2, e2.name AS proc2,
       ROUND(r1.amount + r2.amount, 2) AS pair_sum
FROM refunds r1
JOIN refunds r2 ON r1.order_id = r2.order_id AND r1.id < r2.id
JOIN orders o ON o.id = r1.order_id
JOIN customers c ON c.id = o.customer_id
JOIN employees e1 ON e1.id = r1.processed_by
JOIN employees e2 ON e2.id = r2.processed_by
ORDER BY tick;`);
show("supplier-mate product pairs — full detail", `
SELECT s.name AS house, p1.id AS pid1, p1.name AS prod1, p1.price AS price1, p1.category AS cat1,
       p2.id AS pid2, p2.name AS prod2, p2.price AS price2, p2.category AS cat2,
       ROUND(p2.price - p1.price, 2) AS gap
FROM products p1
JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id
JOIN suppliers s ON s.id = p1.supplier_id
ORDER BY gap DESC;`);

// ---------- pending-pairs (receivables case) ----------
show("pending×pending pairs detail", `
SELECT c.name AS buyer, o1.id AS tick1, ROUND(o1.total,2) AS t1, o2.id AS tick2, ROUND(o2.total,2) AS t2,
       ROUND(o1.total + o2.total, 2) AS exposure
FROM orders o1
JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
JOIN customers c ON c.id = o1.customer_id
WHERE o1.status = 'pending' AND o2.status = 'pending'
ORDER BY exposure DESC;`);
cnt("pending pairs total", `SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id WHERE o1.status='pending' AND o2.status='pending';`);
cnt("cancelled pairs total", `SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id WHERE o1.status='cancelled' AND o2.status='cancelled';`);
cnt("shipped pairs total", `SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id WHERE o1.status='shipped' AND o2.status='shipped';`);
cnt("delivered pairs total", `SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id WHERE o1.status='delivered' AND o2.status='delivered';`);
show("pending orders per customer (sanity: pairs = C(k,2))", `
SELECT c.name, COUNT(*) AS pending_tickets FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'pending' GROUP BY c.id HAVING COUNT(*) > 1 ORDER BY 2 DESC;`);

// ---------- employees org-chart variants ----------
cnt("e.manager_id = m.id (correct)", `SELECT COUNT(*) FROM employees e JOIN employees m ON e.manager_id = m.id;`);
cnt("e.id = m.id (self-boss collision)", `SELECT COUNT(*) FROM employees e JOIN employees m ON e.id = m.id;`);
cnt("m.manager_id = m.id (0 expected)", `SELECT COUNT(*) FROM employees e JOIN employees m ON m.manager_id = m.id;`);
show("role='rep' org fill detail", `
SELECT m.name AS manager, m.role AS mgr_role, e.name AS report, e.role AS report_role
FROM employees e JOIN employees m ON e.manager_id = m.id
WHERE e.role = 'rep' ORDER BY m.id, e.id;`);
cnt("role='lead' count", `SELECT COUNT(*) FROM employees e JOIN employees m ON e.manager_id = m.id WHERE e.role='lead';`);
cnt("role='manager' count (INNER drops)", `SELECT COUNT(*) FROM employees e JOIN employees m ON e.manager_id = m.id WHERE e.role='manager';`);
show("org chart full 7 rows", `
SELECT m.name AS manager, m.role AS mgr_role, e.name AS report, e.role AS report_role
FROM employees e JOIN employees m ON e.manager_id = m.id ORDER BY m.id, e.id;`);

// ---------- operator/collision probes for coaching text ----------
cnt("payments: p1.id = p2.order_id join key", `SELECT COUNT(*) FROM payments p1 JOIN payments p2 ON p1.id = p2.order_id AND p1.id < p2.id;`);
cnt("payments: p2.order_id tautology", `SELECT COUNT(*) FROM payments p1 JOIN payments p2 ON p2.order_id = p2.order_id;`);
cnt("acquisitions: a1.id = a2.id guard", `SELECT COUNT(*) FROM acquisitions a1 JOIN acquisitions a2 ON a1.customer_id = a2.customer_id AND a1.id = a2.id;`);
cnt("acquisitions: a1.id = a2.customer_id", `SELECT COUNT(*) FROM acquisitions a1 JOIN acquisitions a2 ON a1.id = a2.customer_id;`);
cnt("orders: o1.id = o2.id", `SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id = o2.id;`);
cnt("refunds: r1.id = r2.order_id", `SELECT COUNT(*) FROM refunds r1 JOIN refunds r2 ON r1.id = r2.order_id;`);
cnt("refunds: r2.order_id tautology", `SELECT COUNT(*) FROM refunds r1 JOIN refunds r2 ON r2.order_id = r2.order_id;`);
cnt("products: p1.id = p2.supplier_id", `SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.id = p2.supplier_id AND p1.id < p2.id;`);
cnt("products: p2.supplier_id tautology", `SELECT COUNT(*) FROM products p1 JOIN products p2 ON p2.supplier_id = p2.supplier_id;`);
cnt("employees LEFT ghost: managers via LEFT+IS NULL", `SELECT COUNT(*) FROM employees e LEFT JOIN employees m ON m.id = e.manager_id WHERE m.id IS NULL;`);
show("repeat-buyer board with HAVING >= 100", `
SELECT c.name AS buyer, COUNT(*) AS repeat_pairs, MIN(o1.id) AS first_order, MAX(o2.id) AS latest_order
FROM orders o1
JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
JOIN customers c ON c.id = o1.customer_id
GROUP BY c.id HAVING COUNT(*) >= 100 ORDER BY repeat_pairs DESC;`);
show("repeat-buyer board with HAVING >= 90", `
SELECT c.name AS buyer, COUNT(*) AS repeat_pairs, MIN(o1.id) AS first_order, MAX(o2.id) AS latest_order
FROM orders o1
JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
JOIN customers c ON c.id = o1.customer_id
GROUP BY c.id HAVING COUNT(*) >= 90 ORDER BY repeat_pairs DESC;`);
show("one-and-done fill detail", `
SELECT c.name AS buyer, o1.id AS only_ticket, ROUND(o1.total,2) AS ticket_total, o1.status AS ostatus
FROM orders o1
LEFT JOIN orders o2 ON o2.customer_id = o1.customer_id AND o2.id <> o1.id
JOIN customers c ON c.id = o1.customer_id
WHERE o2.id IS NULL;`);
cnt("one-and-done with INNER (0 expected)", `SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o2.customer_id = o1.customer_id AND o2.id <> o1.id JOIN customers c ON c.id = o1.customer_id WHERE o2.id IS NULL;`);
cnt("one-and-done guard 'o2.id > o1.id' (latest-order 16 rows)", `SELECT COUNT(*) FROM orders o1 LEFT JOIN orders o2 ON o2.customer_id = o1.customer_id AND o2.id > o1.id JOIN customers c ON c.id = o1.customer_id WHERE o2.id IS NULL;`);
cnt("one-and-done guard dropped 'o2.id = o1.id' (0)", `SELECT COUNT(*) FROM orders o1 LEFT JOIN orders o2 ON o2.customer_id = o1.customer_id AND o2.id = o1.id JOIN customers c ON c.id = o1.customer_id WHERE o2.id IS NULL;`);
cnt("channel drift with '=' (0 expected)", `SELECT COUNT(*) FROM acquisitions a1 JOIN acquisitions a2 ON a1.customer_id = a2.customer_id AND a1.id < a2.id WHERE a1.channel = a2.channel;`);
cnt("channel drift with spend<>=spend (ambiguous check!)", `SELECT COUNT(*) FROM acquisitions a1 JOIN acquisitions a2 ON a1.customer_id = a2.customer_id AND a1.id < a2.id WHERE a1.spend <> a2.spend;`);
cnt("split pairs: p1.id <= p2.id", `SELECT COUNT(*) FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id <= p2.id;`);
cnt("split pairs by ticket (aggregate shape)", `SELECT o.id, COUNT(*) AS payment_pairs FROM payments p1 JOIN payments p2 ON p1.order_id = p2.order_id AND p1.id < p2.id JOIN orders o ON o.id = p1.order_id GROUP BY o.id;`);
cnt(" Liam/Olivia customer ids + order 20/91", `SELECT c.id, c.name, o.id AS oid, o.status FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.id IN (20, 91);`);
cnt("city-pair corridor (EMPTY check)", `SELECT COUNT(*) FROM customers c1 JOIN customers c2 ON c1.city = c2.city AND c1.id < c2.id;`);
cnt("US region pair detail", `SELECT c1.name AS n1, c2.name AS n2, c1.city AS city1, c2.city AS city2 FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id WHERE c1.region = 'US';`);

db.close();
rmSync(COPY, { force: true });
console.log("\n(probe copy deleted)");
