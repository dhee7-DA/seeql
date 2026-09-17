// probe-j8c4.ts — cs-297 final slot battery + walkthrough context (readonly copy).
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j8c.db", { readonly: true });

function q(title: string, sql: string) {
  console.log(`\n## ${title}`);
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    if (rows.length === 0) { console.log("(0 rows)"); return; }
    const slim = rows.map((r) => Object.values(r).map((v) => typeof v === "number" ? Math.round(v * 100) / 100 : v));
    console.log(`(${rows.length} rows) ${JSON.stringify(slim)}`);
  } catch (e) {
    console.log(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}

const F297 = (c1: string, c2: string, st: string) => `
SELECT c.name, COUNT(DISTINCT ${c1}) AS settlements, COUNT(DISTINCT ${c2}) AS claims, ROUND(SUM(r.amount), 2) AS claimed
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id AND p.status = ${st}
LEFT JOIN refunds r ON r.order_id = o.id
GROUP BY c.id
ORDER BY settlements DESC, claims DESC`;

q("297 FILL (p.id, r.id, 'settled')", F297("p.id", "r.id", "'settled'"));
q("297 {1}=o.id", F297("o.id", "r.id", "'settled'"));
q("297 {1}=c.id", F297("c.id", "r.id", "'settled'"));
q("297 {2}=o.id", F297("p.id", "o.id", "'settled'"));
q("297 {2}=c.id", F297("p.id", "c.id", "'settled'"));
q("297 {3}='pending'", F297("p.id", "r.id", "'pending'"));
q("297 {3}='failed'", F297("p.id", "r.id", "'failed'"));
q("297 {3}=o.customer_id", F297("p.id", "r.id", "o.customer_id"));
q("297 {3}=o.id", F297("p.id", "r.id", "o.id"));
q("297 {1}=o.customer_id", F297("o.customer_id", "r.id", "'settled'"));

// walkthrough context
q("297 Alice claims detail", `SELECT o.id, r.id, r.amount, r.reason FROM refunds r JOIN orders o ON o.id=r.order_id JOIN customers c ON c.id=o.customer_id WHERE c.name='Alice Chen' ORDER BY o.id`);
q("297 Bruno settled+claims", `SELECT o.id, p.id pay_id, p.amount, p.status FROM payments p JOIN orders o ON o.id=p.order_id WHERE o.id=6`);
q("297 split orders refund check", `SELECT o.id, COUNT(p.id) pays, (SELECT COUNT(*) FROM refunds r WHERE r.order_id=o.id) claims FROM orders o JOIN payments p ON p.order_id=o.id WHERE o.id IN (33,81,100) GROUP BY o.id`);
q("297 totals context", `SELECT (SELECT COUNT(*) FROM payments WHERE status='settled') settled_rows, (SELECT ROUND(SUM(amount),2) FROM payments WHERE status='settled') settled_amt, (SELECT COUNT(*) FROM refunds) claims, (SELECT ROUND(SUM(amount),2) FROM refunds) claimed_amt`);

db.close();
console.log("\nDONE probe-j8c4");
