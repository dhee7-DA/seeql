/// <reference types="bun-types" />
// probe-j2b3.ts — final figures for j2-b prose (cs-240 list, remaining variants).
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.probe-j2b.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string, max = 30) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`\n## ${label}  (${rows.length} rows)`);
    for (const r of rows.slice(0, max)) console.log(JSON.stringify(r));
  } catch (e) {
    console.log(`\n## ${label} — ERROR: ${e instanceof Error ? e.message : e}`);
  }
}

q("cs-240 correct list (delivered, refund-free, >=500)", `
SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id
LEFT JOIN refunds r ON r.order_id = o.id WHERE o.status = 'delivered' AND r.id IS NULL AND o.total >= 500 ORDER BY o.total DESC`);
q("cs-240 'shipped' variant count", `
SELECT COUNT(*) n FROM orders o LEFT JOIN refunds r ON r.order_id = o.id WHERE o.status = 'shipped' AND r.id IS NULL AND o.total >= 500`);
q("cs-240 {4}=o.id variant", `
SELECT COUNT(*) n FROM orders o LEFT JOIN refunds r ON r.order_id = o.id WHERE o.status = 'delivered' AND r.id IS NULL AND o.total >= o.id`);
q("cs-240 {4}=o.customer_id variant", `
SELECT COUNT(*) n FROM orders o LEFT JOIN refunds r ON r.order_id = o.id WHERE o.status = 'delivered' AND r.id IS NULL AND o.total >= o.customer_id`);
q("orders 6 and 68 detail", `
SELECT o.id, c.name, o.total, o.status FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.id IN (6, 68)`);
q("refunds on 6 and 68", `
SELECT r.id, r.order_id, r.amount, r.reason FROM refunds r WHERE r.order_id IN (6, 68)`);
q("cs-240 >=500 delivered all (9)", `
SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'delivered' AND o.total >= 500 ORDER BY o.total DESC`);
q("cs-235 status mix recheck + order 74 context", `
SELECT o.id, c.name, o.status, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.id = 74`);
q("cs-239 refund money total", `SELECT COUNT(*) n, ROUND(SUM(amount),2) s FROM refunds`);
q("cs-242 never-settled by status + delivered two", `
SELECT o.id, c.name, o.status, o.total FROM orders o JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'settled' WHERE p.id IS NULL AND o.status = 'delivered' ORDER BY o.id`);

db.close();
rmSync(COPY, { force: true });
console.log("\n(probe copy deleted)");
