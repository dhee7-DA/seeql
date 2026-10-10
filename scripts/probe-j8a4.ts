/// <reference types="bun-types" />
// probe-j8a4 — pre-audit simulation of the two riskiest cs-276 substitutions
// (full result-set equality check, audit-style). Read-only COPY only.
import { Database } from "bun:sqlite";
const db = new Database("scripts/.tmp-j8a.db", { readonly: true });
function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all();
    console.log(`\n== ${label} ==\n${JSON.stringify(rows)}`);
  } catch (e) {
    console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}
const base = (s3: string, who: string) => `SELECT s.name, s.region, COUNT(*) AS lines
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON ${s3} = p.supplier_id
WHERE c.name = '${who}'
GROUP BY s.id ORDER BY s.name`;
q("fill (s.id, Emma)", base("s.id", "Emma Wilson"));
q("sub s.id=p.id (Emma)", base("s.id".replace("s.id", "p.id"), "Emma Wilson"));
q("sub c.id (Emma)", base("c.id", "Emma Wilson"));
q("sub oi.id (Emma)", base("oi.id", "Emma Wilson"));
q("Alice bench", base("s.id", "Alice Chen"));
q("Grace bench", base("s.id", "Grace Kim"));
db.close();
console.log("\nprobe-j8a4 done");
