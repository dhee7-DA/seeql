// j9-c probe round 7 — exact distractor-arm row counts for coaching ("why") texts.
// Run from PROJECT ROOT: bun scripts/probe-j9c7.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.tmp-j9c.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (label: string, sql: string) => {
  try {
    console.log(`${label}: ${JSON.stringify(db.query(sql).all())}`);
  } catch (e) {
    console.log(`${label}: ERROR ${e instanceof Error ? e.message : e}`);
  }
};

// cs-317 duel arms
one("317 = self-pairs", `SELECT COUNT(*) n FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.id = s2.id`);
one("317 <= ", `SELECT COUNT(*) n FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.id <= s2.id`);
one("317 <> ", `SELECT COUNT(*) n FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.id <> s2.id`);
one("317 flip edges", `SELECT ROUND(s1.rating - s2.rating, 1) e FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.id < s2.id ORDER BY s1.id`);
one("317 sum edges", `SELECT ROUND(s2.rating + s1.rating, 1) e FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.id < s2.id ORDER BY s1.id`);

// cs-318 filter arms
one("318 m.role='rep'", `SELECT COUNT(*) n FROM employees e JOIN employees m ON m.id = e.manager_id JOIN employees g ON g.id = m.manager_id WHERE m.role = 'rep'`);
one("318 e.role<>'rep'", `SELECT COUNT(*) n FROM employees e JOIN employees m ON m.id = e.manager_id JOIN employees g ON g.id = m.manager_id WHERE e.role <> 'rep'`);
one("318 roles census", `SELECT role, COUNT(*) n FROM employees GROUP BY role`);
one("318 g.id=e.manager_id rows", `SELECT e.name, m.name mgr, g.name grand FROM employees e JOIN employees m ON m.id = e.manager_id JOIN employees g ON g.id = e.manager_id WHERE e.role='rep' ORDER BY e.id`);
one("318 g.id=m.id rows", `SELECT e.name, g.name grand FROM employees e JOIN employees m ON m.id = e.manager_id JOIN employees g ON g.id = m.id WHERE e.role='rep' ORDER BY e.id`);
one("318 m.id=e.id rows", `SELECT e.name, m.name mgr, g.name grand FROM employees e JOIN employees m ON m.id = e.id JOIN employees g ON g.id = m.manager_id WHERE e.role='rep' ORDER BY e.id`);
one("318 m.manager_id=e.id", `SELECT COUNT(*) n FROM employees e JOIN employees m ON m.manager_id = e.id JOIN employees g ON g.id = m.manager_id WHERE e.role='rep'`);

// cs-319 arms
one("319 e1.manager_id=e2.id", `SELECT COUNT(*) n FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.id AND e1.id < e2.id JOIN employees m ON m.id = e1.manager_id`);
one("319 m.id=e1.id", `SELECT e1.name a, e2.name b, m.name lead FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.id JOIN employees m ON m.id = e1.id`);
one("319 m.manager_id=e1.id", `SELECT e1.name a, e2.name b, m.name lead FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.id JOIN employees m ON m.manager_id = e1.id`);
one("319 <= rows", `SELECT COUNT(*) n FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id <= e2.id`);
one("319 <> rows", `SELECT COUNT(*) n FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id <> e2.id`);

// cs-320 WHERE arms
one("320 IS NOT NULL", `SELECT COUNT(*) n FROM orders o1 JOIN customers c ON c.id = o1.customer_id LEFT JOIN orders o2 ON o2.customer_id = o1.customer_id AND o2.total > o1.total WHERE o2.id IS NOT NULL`);
one("320 o1.id IS NULL", `SELECT COUNT(*) n FROM orders o1 JOIN customers c ON c.id = o1.customer_id LEFT JOIN orders o2 ON o2.customer_id = o1.customer_id AND o2.total > o1.total WHERE o1.id IS NULL`);

// cs-321 cross-region arm
one("321 region<> top", `SELECT c1.name a, c2.name b, COUNT(*) p FROM customers c1 JOIN customers c2 ON c1.region <> c2.region AND c1.id < c2.id JOIN orders o1 ON o1.customer_id = c1.id JOIN orders o2 ON o2.customer_id = c2.id GROUP BY c1.id, c2.id ORDER BY p DESC LIMIT 4`);

// cs-323 arms
one("323 shipped arm >=1000", `SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id WHERE o1.status = 'shipped' AND o2.status = 'pending' AND ROUND(o1.total + o2.total, 2) >= 1000`);
one("323 <> guard", `SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id <> o2.id WHERE o1.status = 'delivered' AND o2.status = 'pending' AND ROUND(o1.total + o2.total, 2) >= 1000`);

// cs-324 arms
one("324 p1.id <> p2.id", `SELECT COUNT(*) n FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id JOIN payments p2 ON p1.id <> p2.id JOIN orders o2 ON o2.id = p2.order_id JOIN customers c ON c.id = o1.customer_id WHERE o1.customer_id = o2.customer_id AND p1.method <> p2.method`);
one("324 amount arm", `SELECT COUNT(*) n FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id JOIN payments p2 ON p1.id < p2.id JOIN orders o2 ON o2.id = p2.order_id JOIN customers c ON c.id = o1.customer_id WHERE o1.customer_id = o2.customer_id AND p1.amount <> p2.amount`);
one("324 same-ticket grouped", `SELECT c.name b, COUNT(*) n FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id JOIN payments p2 ON p1.id < p2.id JOIN orders o2 ON o2.id = p2.order_id JOIN customers c ON c.id = o1.customer_id WHERE o1.id = o2.id AND p1.method <> p2.method GROUP BY c.id`);

db.close();
rmSync(COPY, { force: true });
console.log("(probe copy deleted)");
