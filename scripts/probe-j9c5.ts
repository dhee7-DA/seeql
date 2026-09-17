// j9-c probe round 5 — design details for cs-323 (month-close pair book),
// cs-324 (cash method-mix board), cs-325 (catalog cross-shelf twins) plus
// small lineage facts. Self-copies + self-cleans scripts/.tmp-j9c.db.
// Run from PROJECT ROOT: bun scripts/probe-j9c5.ts
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

// ---------- cs-323 month-close: delivered x pending pair book ----------
show("book >= 1000 full list", `
SELECT c.name AS account, o1.id AS settled_ticket, ROUND(o1.total,2) AS settled,
       o2.id AS open_ticket, ROUND(o2.total,2) AS open_amt,
       ROUND(o1.total + o2.total, 2) AS book
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
JOIN customers c ON c.id = o1.customer_id
WHERE o1.status = 'delivered' AND o2.status = 'pending' AND o1.total + o2.total >= 1000
ORDER BY book DESC`);
show("book >= 1000 count + 900 count", `
SELECT
 (SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o1.id<o2.id
   WHERE o1.status='delivered' AND o2.status='pending' AND o1.total+o2.total >= 1000) g1000,
 (SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o1.id<o2.id
   WHERE o1.status='delivered' AND o2.status='pending' AND o1.total+o2.total >= 900) g900`);
show("323 distractor: o1 shipped arm", `
SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o1.id<o2.id
WHERE o1.status='shipped' AND o2.status='pending' AND o1.total+o2.total >= 1000`);
show("323 distractor: o1 pending arm", `
SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o1.id<o2.id
WHERE o1.status='pending' AND o2.status='pending' AND o1.total+o2.total >= 1000`);
show("323 distractor: book = o1.total only", `
SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o1.id<o2.id
WHERE o1.status='delivered' AND o2.status='pending' AND o1.total >= 1000`);
show("323 distractor: flipped guard", `
SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o2.id<o1.id
WHERE o1.status='delivered' AND o2.status='pending' AND o1.total+o2.total >= 1000`);
show("323 top books over 900 (tie check)", `
SELECT ROUND(o1.total + o2.total, 2) book, COUNT(*) n
FROM orders o1 JOIN orders o2 ON o1.customer_id=o2.customer_id AND o1.id<o2.id
WHERE o1.status='delivered' AND o2.status='pending'
GROUP BY book HAVING book >= 900 ORDER BY book DESC`);

// ---------- cs-324 cash: method-mix board ----------
show("method board full (tie check)", `
SELECT c.name AS buyer, COUNT(*) AS mixed_pairs
FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id
JOIN payments p2 ON p1.id < p2.id
JOIN orders o2 ON o2.id = p2.order_id
JOIN customers c ON c.id = o1.customer_id
WHERE o1.customer_id = o2.customer_id AND p1.method <> p2.method
GROUP BY c.id ORDER BY mixed_pairs DESC, c.name`);
show("324 total pairs", `
SELECT COUNT(*) n FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id
JOIN payments p2 ON p1.id < p2.id
JOIN orders o2 ON o2.id = p2.order_id
JOIN customers c ON c.id = o1.customer_id
WHERE o1.customer_id = o2.customer_id AND p1.method <> p2.method`);
show("324 v: <= guard", `
SELECT COUNT(*) n FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id
JOIN payments p2 ON p1.id <= p2.id
JOIN orders o2 ON o2.id = p2.order_id
WHERE o1.customer_id = o2.customer_id AND p1.method <> p2.method`);
show("324 v: same-ticket only (o1.id = o2.id)", `
SELECT COUNT(*) n FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id
JOIN payments p2 ON p1.id < p2.id
JOIN orders o2 ON o2.id = p2.order_id
WHERE o1.id = o2.id AND p1.method <> p2.method`);
show("324 v: same-ticket key (order_id = order_id)", `
SELECT COUNT(*) n FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id
JOIN payments p2 ON p1.order_id = p2.order_id
JOIN orders o2 ON o2.id = p2.order_id
WHERE o1.customer_id = o2.customer_id AND p1.method <> p2.method`);
show("324 v: method = (loyal pairs)", `
SELECT COUNT(*) n FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id
JOIN payments p2 ON p1.id < p2.id
JOIN orders o2 ON o2.id = p2.order_id
WHERE o1.customer_id = o2.customer_id AND p1.method = p2.method`);
show("324 v: o1.id = o2.customer_id collision", `
SELECT COUNT(*) n FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id
JOIN payments p2 ON p1.id < p2.id
JOIN orders o2 ON o2.id = p2.order_id
WHERE o1.id = o2.customer_id AND p1.method <> p2.method`);
show("324 v: buyer key on wrong pair (o1.customer_id = o1.id)", `
SELECT COUNT(*) n FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id
JOIN payments p2 ON p1.id < p2.id
JOIN orders o2 ON o2.id = p2.order_id
WHERE o1.customer_id = o1.id AND p1.method <> p2.method`);
show("324 methods census", `SELECT method, COUNT(*) n FROM payments GROUP BY method`);

// ---------- cs-325 catalog: cross-shelf price twins ----------
show("cross-shelf twins <= 5", `
SELECT p1.name AS twin_a, p1.category AS shelf_a, p2.name AS twin_b, p2.category AS shelf_b,
       ROUND(ABS(p2.price - p1.price), 2) AS gap
FROM products p1 JOIN products p2 ON p1.id < p2.id AND p1.category <> p2.category
WHERE ABS(p2.price - p1.price) <= 5
ORDER BY gap`);
show("325 threshold battle", `
SELECT
 (SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.id<p2.id AND p1.category<>p2.category WHERE ABS(p2.price-p1.price) <= 5) g5,
 (SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.id<p2.id AND p1.category<>p2.category WHERE ABS(p2.price-p1.price) <= 3) g3,
 (SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.id<p2.id AND p1.category<>p2.category WHERE ABS(p2.price-p1.price) <= 1) g1,
 (SELECT COUNT(*) FROM products p1 JOIN products p2 ON p1.id<p2.id AND p1.category<>p2.category WHERE ABS(p2.price-p1.price) <= 10) g10`);
show("325 v: same-shelf twins (category =)", `
SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.id < p2.id AND p1.category = p2.category
WHERE ABS(p2.price - p1.price) <= 5`);
show("325 v: same-house twins (supplier_id =)", `
SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.id < p2.id AND p1.supplier_id = p2.supplier_id
WHERE ABS(p2.price - p1.price) <= 5`);
show("325 v: signed p2 - p1 <= 5", `
SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.id < p2.id AND p1.category <> p2.category
WHERE p2.price - p1.price <= 5`);
show("325 v: signed p1 - p2 <= 5", `
SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.id < p2.id AND p1.category <> p2.category
WHERE p1.price - p2.price <= 5`);
show("325 all cross pairs count", `
SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.id < p2.id AND p1.category <> p2.category`);
show("325 near-miss 5.01/5.49 pair", `
SELECT p1.name, p1.price, p2.name, p2.price, ROUND(ABS(p2.price-p1.price),2) gap
FROM products p1 JOIN products p2 ON p1.id < p2.id
WHERE ROUND(ABS(p2.price-p1.price),2) IN (5.01, 5.49)`);

// ---------- lineage extras ----------
show("4th hop exists?", `
SELECT COUNT(*) n FROM employees e
JOIN employees m ON m.id = e.manager_id
JOIN employees g ON g.id = m.manager_id
JOIN employees h ON h.id = g.manager_id`);
show("g.id = g.manager_id (own-manager)", `
SELECT COUNT(*) n FROM employees e
JOIN employees m ON m.id = e.manager_id
JOIN employees g ON g.id = g.manager_id
WHERE e.role = 'rep'`);
show("grand column = m.name rows (cs-318 slot1 variant)", `
SELECT e.name report, m.name manager, m.name AS grand
FROM employees e JOIN employees m ON m.id = e.manager_id JOIN employees g ON g.id = m.manager_id
WHERE e.role = 'rep' ORDER BY e.id`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe-j9c5 done (copy cleaned)");
