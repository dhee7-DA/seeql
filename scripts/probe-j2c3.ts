/// <reference types="bun-types" />
/** Probe pass 3 for batch j2c — ORDER BY slot variants + last ambiguity checks. */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-j2c.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function rows(sql: string): string {
  try {
    const r = db.query(sql).all() as Record<string, unknown>[];
    return JSON.stringify(r);
  } catch (e) {
    return `ERROR: ${e instanceof Error ? e.message : e}`;
  }
}

const BASE = `SELECT s.id, s.carrier, s.cost, o.total
FROM shipments s
LEFT JOIN orders o ON o.id = s.order_id
WHERE s.delivered_at IS NULL AND s.carrier = 'DHL'`;

const correct = rows(`${BASE} ORDER BY s.cost DESC`);
console.log("cs-245 correct (s.cost DESC):", correct.slice(0, 220));
for (const [label, ord] of [
  ["ORDER BY o.total DESC", "ORDER BY o.total DESC"],
  ["ORDER BY o.id", "ORDER BY o.id"],
  ["ORDER BY o.status DESC (constant)", "ORDER BY o.status DESC"],
  ["ORDER BY s.id (constant-ish)", "ORDER BY s.id"],
  ["ORDER BY 'UPS' DESC (constant literal)", "ORDER BY 'UPS' DESC"],
] as const) {
  const r = rows(`${BASE} ${ord}`);
  console.log(`cs-245 ${label}: ${r === correct ? "IDENTICAL to correct -> BANNED" : "differs -> ok"}`);
}

// cs-247 ORDER BY variants
const B247 = `SELECT c.name, a.channel, a.spend
FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.channel = 'referral'`;
const c247 = rows(`${B247} ORDER BY a.spend DESC`);
console.log("\ncs-247 correct (a.spend DESC):", c247.slice(0, 160));
for (const [label, ord] of [
  ["ORDER BY c.name", "ORDER BY c.name"],
  ["ORDER BY c.region", "ORDER BY c.region"],
  ["ORDER BY c.id", "ORDER BY c.id"],
] as const) {
  const r = rows(`${B247} ${ord}`);
  console.log(`cs-247 ${label}: ${r === c247 ? "IDENTICAL -> BANNED" : "differs -> ok"}`);
}

// cs-250: o.status = o.total cross-check (distractor o.total in the {3} slot)
const r250 = rows(`SELECT COUNT(*) n FROM shipments s
  LEFT JOIN orders o ON o.id = s.order_id
  WHERE s.delivered_at IS NOT NULL AND o.status = o.total`);
console.log("\ncs-250 o.status=o.total rows (correct=7):", r250);

// cs-249: HAVING COUNT(r.id) = r.id bare-column behaviour (distractor r.id in {3})
const r249 = rows(`SELECT o.id, c.name, COUNT(r.id) AS refund_rows, ROUND(SUM(r.amount), 2) AS refunded_total
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN refunds r ON r.order_id = o.id
GROUP BY o.id
HAVING COUNT(r.id) = r.id
ORDER BY o.id`);
console.log("cs-249 HAVING COUNT(r.id)=r.id (correct=3 rows):", r249.slice(0, 300));

// cs-243: NOT NULL postfix without IS (distractor 'NOT' dropped, but verify '=' and 'NOT NULL' behaviours)
console.log("\ncs-243 '=' (s.id = NULL):", rows(`SELECT COUNT(*) n FROM orders o LEFT JOIN shipments s ON s.order_id = o.id WHERE s.id = NULL`));
console.log("cs-243 'NOT NULL' (s.id IS NOT NULL):", rows(`SELECT COUNT(*) n FROM orders o LEFT JOIN shipments s ON s.order_id = o.id WHERE s.id IS NOT NULL`));

// cs-246: e.id as manager_name output check + m.id ON cartesian size
console.log("\ncs-246 e.id AS manager_name head:", rows(`SELECT e.name, e.role, e.id AS manager_name FROM employees e LEFT JOIN employees m ON e.manager_id = m.id ORDER BY e.id LIMIT 3`));
console.log("cs-246 ON m.id = m.id rowcount:", rows(`SELECT COUNT(*) n FROM employees e LEFT JOIN employees m ON m.id = m.id`));

// cs-244: confirm 'shipped' in {4} and 'pending' in {4} row sets differ from correct (already probed counts 6/14)
console.log("\ncs-244 {4}='pending':", rows(`SELECT o.id, o.total, p.id AS payment_id FROM orders o LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled' WHERE o.status = 'pending' AND p.id IS NULL ORDER BY o.id`));

// cs-248: '1' in {2} -> COUNT(1) check
console.log("\ncs-248 COUNT(1)=0 rows (correct=15):", rows(`SELECT COUNT(*) n FROM (SELECT o.id FROM orders o LEFT JOIN payments p ON p.order_id = o.id GROUP BY o.id HAVING COUNT(1) = 0)`));

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe copy deleted.");
