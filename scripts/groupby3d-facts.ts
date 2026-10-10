// Truth probe for the lesson-08 GROUP BY 3D scene (l8-bins-space-3d).
// Every number rendered in the scene must come from this run.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (s: string) => db.query(s).all();
const one = (s: string) => db.query(s).get() as Record<string, unknown>;

console.log("== base ==");
console.log("orders:", one(`SELECT COUNT(*) n FROM orders`));

console.log("== GROUP BY status (the 4 buckets) ==");
console.log(q(`SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY n DESC`));

console.log("== HAVING COUNT(*) > 10 (the gate) ==");
console.log(q(`SELECT status, COUNT(*) n FROM orders GROUP BY status HAVING COUNT(*) > 10 ORDER BY n DESC`));
console.log("buckets dropped by the gate:",
  q(`SELECT status, COUNT(*) n FROM orders GROUP BY status HAVING COUNT(*) <= 10 ORDER BY n DESC`));

console.log("== bucket count itself (one row per bucket) ==");
console.log("distinct statuses:", one(`SELECT COUNT(DISTINCT status) n FROM orders`));

console.log("== flavor: SUM/AVG per bucket (not drawn, cross-check only) ==");
console.log(q(`SELECT status, COUNT(*) n, ROUND(SUM(total), 2) sum_total, ROUND(AVG(total), 2) avg_total FROM orders GROUP BY status ORDER BY n DESC`));

console.log("== flavor: GROUP BY customer_id bucket count ==");
console.log(one(`SELECT COUNT(*) n FROM (SELECT customer_id FROM orders GROUP BY customer_id)`));

db.close();
