// j9-b probe round 3 — pre-verify every risky distractor substitution in its slot context
// before authoring. Run from PROJECT ROOT: bun scripts/probe-j9b3.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.tmp-j9b.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const n = (label: string, sql: string) => {
  try {
    const rows = q(sql);
    console.log(`${label} -> ${rows.length} rows`, rows.length <= 4 ? JSON.stringify(rows) : "");
  } catch (e) {
    console.log(`${label} -> ERROR:`, (e instanceof Error ? e.message : String(e)).slice(0, 90));
  }
};

// ---- cs-309 payments template: JOIN payments p2 ON {2} = p2.order_id AND {3} ----
const t309 = (s2: string, s3: string, s1 = "p1.amount") => `
SELECT o.id AS ticket, c.name AS buyer, ROUND(${s1} + p2.amount, 2) AS pair_paid, o.total
FROM payments p1 JOIN payments p2 ON ${s2} = p2.order_id AND ${s3}
JOIN orders o ON o.id = p1.order_id JOIN customers c ON c.id = o.customer_id
ORDER BY o.id;`;
console.log("--- cs-309 substitutions (correct = 3 rows) ---");
n("309 correct", t309("p1.order_id", "p1.id < p2.id"));
n("309 {2}=p2.amount", t309("p2.amount", "p1.id < p2.id"));
n("309 {2}=p1.id <= p2.id", t309("p1.id <= p2.id", "p1.id < p2.id"));
n("309 {2}=p1.id <> p2.id", t309("p1.id <> p2.id", "p1.id < p2.id"));
n("309 {3}=p2.amount", t309("p1.order_id", "p2.amount"));
n("309 {3}=p1.id", t309("p1.order_id", "p1.id"));
n("309 {3}=p2.order_id", t309("p1.order_id", "p2.order_id"));
n("309 {1}=p1.id <= p2.id", t309("p1.order_id", "p1.id < p2.id", "p1.id <= p2.id"));
n("309 {1}=p1.id <> p2.id", t309("p1.order_id", "p1.id < p2.id", "p1.id <> p2.id"));
n("309 payments where amount = order_id", `SELECT COUNT(*) FROM payments WHERE amount = order_id`);

// ---- cs-310 acquisitions template ----
const t310 = (s1: string, s2: string, s3: string | null) => `
SELECT c.name AS account, a1.channel AS first_touch, a1.spend AS first_spend,
       a2.channel AS second_touch, a2.spend AS second_spend, ROUND(${s1}, 2) AS double_spend
FROM acquisitions a1
JOIN acquisitions a2 ON a1.customer_id = a2.customer_id AND ${s2}
JOIN customers c ON c.id = a1.customer_id
${s3 ? `WHERE ${s3}` : ""}
ORDER BY c.name;`;
console.log("--- cs-310 substitutions (correct = 1 row Alice 27.17) ---");
n("310 correct", t310("a1.spend + a2.spend", "a1.id < a2.id", "a1.channel <> a2.channel"));
n("310 {2}=a1.id <= a2.id (AMBIG RISK)", t310("a1.spend + a2.spend", "a1.id <= a2.id", "a1.channel <> a2.channel"));
n("310 {2}=a1.id <> a2.id", t310("a1.spend + a2.spend", "a1.id <> a2.id", "a1.channel <> a2.channel"));
n("310 {2}=a1.id = a2.id", t310("a1.spend + a2.spend", "a1.id = a2.id", "a1.channel <> a2.channel"));
n("310 {2}=a1.spend (truthy)", t310("a1.spend + a2.spend", "a1.spend", "a1.channel <> a2.channel"));
n("310 {2}=a2.channel (falsy text)", t310("a1.spend + a2.spend", "a2.channel", "a1.channel <> a2.channel"));
n("310 no-where bare", t310("a1.spend + a2.spend", "a1.id < a2.id", null));

// ---- cs-311 orders board: HAVING variants ----
const t311 = (s1: string, s2: string, s3: string) => `
SELECT c.name AS account, COUNT(*) AS repeat_pairs, ${s1} AS first_order, MAX(o2.id) AS latest_order
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND ${s2}
JOIN customers c ON c.id = o1.customer_id
GROUP BY c.id HAVING COUNT(*) >= ${s3} ORDER BY repeat_pairs DESC;`;
console.log("--- cs-311 substitutions (correct = 2 rows: Alice 276, Emma 136) ---");
n("311 correct", t311("MIN(o1.id)", "o1.id < o2.id", "100"));
n("311 {3}=MAX(o1.id)", t311("MIN(o1.id)", "o1.id < o2.id", "MAX(o1.id)"));
n("311 {3}=MIN(o2.id)", t311("MIN(o1.id)", "o1.id < o2.id", "MIN(o2.id)"));
n("311 {3}=COUNT(o2.id)", t311("MIN(o1.id)", "o1.id < o2.id", "COUNT(o2.id)"));
n("311 {3}=o1.id <= o2.id (weird)", t311("MIN(o1.id)", "o1.id < o2.id", "o1.id <= o2.id"));
n("311 {3}=10", t311("MIN(o1.id)", "o1.id < o2.id", "10"));
n("311 {3}=276", t311("MIN(o1.id)", "o1.id < o2.id", "276"));
n("311 {2}=o1.id <= o2.id", t311("MIN(o1.id)", "o1.id <= o2.id", "100"));
n("311 {2}=o1.id <> o2.id", t311("MIN(o1.id)", "o1.id <> o2.id", "100"));
n("311 {2}=o1.id > o2.id", t311("MIN(o1.id)", "o1.id > o2.id", "100"));
n("311 {1}=MAX(o1.id)", t311("MAX(o1.id)", "o1.id < o2.id", "100"));
n("311 {1}=MIN(o2.id)", t311("MIN(o2.id)", "o1.id < o2.id", "100"));
n("311 {1}=COUNT(o2.id)", t311("COUNT(o2.id)", "o1.id < o2.id", "100"));
n("311 {1}=10", t311("10", "o1.id < o2.id", "100"));
n("311 {2}=MIN(o1.id) agg in ON (error?)", t311("MIN(o1.id)", "MIN(o1.id)", "100"));

// ---- cs-312 one-and-done ----
const t312 = (s1: string, s2: string, s3: string, s4: string) => `
SELECT c.name AS account, ${s1} AS only_ticket, ROUND(o1.total, 2) AS ticket_total
FROM orders o1
${s2} JOIN orders o2 ON o2.customer_id = o1.customer_id AND ${s3}
JOIN customers c ON c.id = o1.customer_id
WHERE ${s4} IS NULL ORDER BY o1.id;`;
console.log("--- cs-312 substitutions (correct = 2 rows: Liam 20, Olivia 91) ---");
n("312 correct", t312("o1.id", "LEFT", "o2.id <> o1.id", "o2.id"));
n("312 {2}=RIGHT", t312("o1.id", "RIGHT", "o2.id <> o1.id", "o2.id"));
n("312 {2}=CROSS", t312("o1.id", "CROSS", "o2.id <> o1.id", "o2.id"));
n("312 {2}=INNER", t312("o1.id", "INNER", "o2.id <> o1.id", "o2.id"));
n("312 {3}=o2.id > o1.id", t312("o1.id", "LEFT", "o2.id > o1.id", "o2.id"));
n("312 {3}=o2.id = o1.id", t312("o1.id", "LEFT", "o2.id = o1.id", "o2.id"));
n("312 {3}=o2.id < o1.id", t312("o1.id", "LEFT", "o2.id < o1.id", "o2.id"));
n("312 {3}=o1.total (truthy)", t312("o1.id", "LEFT", "o1.total", "o2.id"));
n("312 {4}=o1.id", t312("o1.id", "LEFT", "o2.id <> o1.id", "o1.id"));
n("312 {4}=o1.total", t312("o1.id", "LEFT", "o2.id <> o1.id", "o1.total"));
n("312 {4}=c.id", t312("o1.id", "LEFT", "o2.id <> o1.id", "c.id"));
n("312 {4}=o2.id > o1.id (parse risk)", t312("o1.id", "LEFT", "o2.id <> o1.id", "o2.id > o1.id"));
n("312 {1}=o2.id", t312("o2.id", "LEFT", "o2.id <> o1.id", "o2.id"));
n("312 {1}=c.id", t312("c.id", "LEFT", "o2.id <> o1.id", "o2.id"));
n("312 {1}=o2.customer_id", t312("o2.customer_id", "LEFT", "o2.id <> o1.id", "o2.id"));

// ---- cs-313 refunds ----
const t313 = (s1: string, s2: string, s3: string) => `
SELECT o.id AS ticket, c.name AS buyer, ${s1} AS claim_one, r2.amount AS claim_two,
       ROUND(${s2}, 2) AS pair_paid, o.total
FROM refunds r1 JOIN refunds r2 ON ${s3} = r2.order_id AND r1.id < r2.id
JOIN orders o ON o.id = r1.order_id JOIN customers c ON c.id = o.customer_id
ORDER BY o.id;`;
console.log("--- cs-313 substitutions (correct = 3 rows) ---");
n("313 correct", t313("r1.amount", "r1.amount + r2.amount", "r1.order_id"));
n("313 {3}=r1.id", t313("r1.amount", "r1.amount + r2.amount", "r1.id"));
n("313 {3}=r2.amount", t313("r1.amount", "r1.amount + r2.amount", "r2.amount"));
n("313 {3}=r1.id + r2.id", t313("r1.amount", "r1.amount + r2.amount", "r1.id + r2.id"));
n("313 {3}=r1.reason", t313("r1.amount", "r1.amount + r2.amount", "r1.reason"));
n("313 {3}=r2.order_id", t313("r1.amount", "r1.amount + r2.amount", "r2.order_id"));
n("313 {1}=r2.amount", t313("r2.amount", "r1.amount + r2.amount", "r1.order_id"));
n("313 {1}=o.total", t313("o.total", "r1.amount + r2.amount", "r1.order_id"));
n("313 {1}=r1.reason", t313("r1.reason", "r1.amount + r2.amount", "r1.order_id"));
n("313 {2}=o.total", t313("r1.amount", "o.total", "r1.order_id"));
n("313 {2}=r2.amount - r1.amount", t313("r1.amount", "r2.amount - r1.amount", "r1.order_id"));
n("313 {2}=r1.id + r2.id", t313("r1.amount", "r1.id + r2.id", "r1.order_id"));

// ---- cs-314 products ----
const t314 = (s1: string, s2: string) => `
SELECT s.name AS house, p1.name AS first_item, ${s1} AS first_price,
       p2.name AS second_item, p2.price AS second_price
FROM products p1 JOIN products p2 ON ${s2} = p2.supplier_id AND p1.id < p2.id
JOIN suppliers s ON s.id = p1.supplier_id
ORDER BY p2.price - p1.price DESC;`;
console.log("--- cs-314 substitutions (correct = 14 rows) ---");
n("314 correct", t314("p1.price", "p1.supplier_id"));
n("314 {2}=p1.id", t314("p1.price", "p1.id"));
n("314 {2}=p2.id", t314("p1.price", "p2.id"));
n("314 {2}=p2.price", t314("p1.price", "p2.price"));
n("314 {2}=p1.price - p2.price", t314("p1.price", "p1.price - p2.price"));
n("314 {2}=p1.category", t314("p1.price", "p1.category"));
n("314 {2}=p2.price - p1.price", t314("p1.price", "p2.price - p1.price"));
n("314 {1}=p2.price", t314("p2.price", "p1.supplier_id"));
n("314 {1}=p1.id", t314("p1.id", "p1.supplier_id"));
n("314 {1}=p2.id", t314("p2.id", "p1.supplier_id"));
n("314 {1}=p1.price - p2.price", t314("p1.price - p2.price", "p1.supplier_id"));
n("314 {1}=p2.price - p1.price", t314("p2.price - p1.price", "p1.supplier_id"));

// ---- cs-315 employees ----
const t315 = (s1: string, s2: string, s3: string) => `
SELECT ${s1} AS manager, m.role AS manager_role, e.name AS report, e.role AS report_role
FROM employees e JOIN employees m ON ${s2} = m.id
WHERE e.role = ${s3} ORDER BY m.id, e.id;`;
console.log("--- cs-315 substitutions (correct = 5 rows) ---");
n("315 correct", t315("m.name", "e.manager_id", "'rep'"));
n("315 {2}=e.id", t315("m.name", "e.id", "'rep'"));
n("315 {2}=m.id", t315("m.name", "m.id", "'rep'"));
n("315 {2}=m.manager_id", t315("m.name", "m.manager_id", "'rep'"));
n("315 {2}='lead'", t315("m.name", "e.manager_id", "'lead'"));
n("315 {2}=rep unquoted in {3}", t315("m.name", "e.manager_id", "rep"));
n("315 {3}='manager'", t315("m.name", "e.manager_id", "'manager'"));
n("315 {3}=e.name", t315("m.name", "e.manager_id", "e.name"));
n("315 {3}=e.id", t315("m.name", "e.manager_id", "e.id"));
n("315 {3}=m.id", t315("m.name", "e.manager_id", "m.id"));
n("315 {3}=m.manager_id", t315("m.name", "e.manager_id", "m.manager_id"));
n("315 {1}=e.name", t315("e.name", "e.manager_id", "'rep'"));
n("315 {1}=m.id", t315("m.id", "e.manager_id", "'rep'"));
n("315 {1}=m.manager_id", t315("m.manager_id", "e.manager_id", "'rep'"));

// ---- cs-316 pending pairs ----
const t316 = (s1: string, s2: string) => `
SELECT c.name AS account, o1.id AS older_ticket, o2.id AS newer_ticket,
       ROUND(${s1}, 2) AS open_exposure
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
JOIN customers c ON c.id = o1.customer_id
WHERE o1.status = ${s2} AND o2.status = ${s2}
ORDER BY open_exposure DESC;`;
console.log("--- cs-316 substitutions (correct = 8 rows) ---");
n("316 correct", t316("o1.total + o2.total", "'pending'"));
n("316 {2}=o1.status", t316("o1.total + o2.total", "o1.status"));
n("316 {2}=o1.total", t316("o1.total + o2.total", "o1.total"));
n("316 {2}=pending unquoted", t316("o1.total + o2.total", "pending"));
n("316 {1}=o1.status", t316("o1.status", "'pending'"));
n("316 {1}=o2.status", t316("o2.status", "'pending'"));
n("316 {1}=o1.id + o2.id", t316("o1.id + o2.id", "'pending'"));

db.close();
rmSync(COPY, { force: true });
console.log("\n(probe copy deleted)");
