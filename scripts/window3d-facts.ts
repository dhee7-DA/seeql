// Truth probe for the lesson-32 window running-total 3D scene (t32-running-space-3d).
// Every number rendered in the scene must come from this run.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (s: string) => db.query(s).all();
const one = (s: string) => db.query(s).get() as Record<string, unknown>;

console.log("== monthly revenue + running total (the scene's spine) ==");
console.log(q(`WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev
  FROM orders GROUP BY mon
)
SELECT mon, rev, SUM(rev) OVER (ORDER BY mon) AS running FROM monthly ORDER BY mon`));

console.log("== cross-checks ==");
console.log("months:", one(`SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) n FROM orders`));
console.log("lifetime revenue:", one(`SELECT ROUND(SUM(total), 2) n FROM orders`));
console.log("max month rev:", one(`SELECT ROUND(MAX(r), 2) n FROM (SELECT SUM(total) r FROM orders GROUP BY strftime('%Y-%m', created_at))`));
console.log("min month rev:", one(`SELECT ROUND(MIN(r), 2) n FROM (SELECT SUM(total) r FROM orders GROUP BY strftime('%Y-%m', created_at))`));

db.close();
