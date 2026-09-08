// Sanity test for src/lib/sql-clauses.ts — spans, stripping, stage plans.
import {
  findClauses,
  clauseAtOffset,
  buildStagePlan,
  stripClauses,
} from "../src/lib/sql-clauses";

const cases = [
  // [label, sql]
  ["join+where+group+having+order+limit",
   `SELECT c.region, COUNT(*) AS n, SUM(o.total) AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'delivered'
GROUP BY c.region
HAVING COUNT(*) >= 2
ORDER BY revenue DESC
LIMIT 5;`],
  ["cte", `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) AS m, COUNT(*) AS n
  FROM orders
  GROUP BY m
)
SELECT m, n FROM monthly ORDER BY n DESC;`],
  ["simple", `SELECT * FROM orders LIMIT 5;`],
  ["distinct", `SELECT DISTINCT city FROM customers WHERE active = 1 ORDER BY city;`],
  ["setop-unsupported", `SELECT id FROM customers UNION SELECT id FROM suppliers;`],
  ["subquery-ignored-keywords", `SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE total > 400);`],
  ["comment+string", `-- WHERE inside a comment
SELECT name /* GROUP BY in comment */ FROM customers WHERE city = 'WHERE';`],
  ["no-from", `SELECT 1 + 2;`],
  ["offset", `SELECT * FROM orders ORDER BY total LIMIT 10 OFFSET 3;`],
] as const;

for (const [label, sql] of cases) {
  const { spans, supported } = findClauses(sql);
  console.log(`\n=== ${label} (supported=${supported}) ===`);
  for (const s of spans) {
    console.log(`  ${s.kind.padEnd(7)} [${s.start},${s.end}) kw=${s.keyword} text="${sql.slice(s.start, Math.min(s.end, s.start + 40)).replace(/\n/g, "⏎")}..."`);
  }
  const plan = buildStagePlan(sql);
  if (plan) {
    for (const st of plan.stages) console.log(`  stage ${st.kind}: ${st.sql.replace(/\n+/g, " ")}`);
  } else {
    console.log("  (no stage plan)");
  }
}

// clauseAtOffset boundary behavior
const sql2 = `SELECT a FROM t WHERE x > 1`;
const r2 = findClauses(sql2);
console.log("\nboundary checks:");
console.log("  at WHERE kw:", clauseAtOffset(r2.spans, sql2.indexOf("WHERE")));
console.log("  inside FROM:", clauseAtOffset(r2.spans, sql2.indexOf("FROM") + 1));
console.log("  end of text:", clauseAtOffset(r2.spans, sql2.length));

// strip smoke
const s3 = findClauses(`SELECT c.name FROM customers c WHERE c.active = 1 ORDER BY c.name;`);
console.log("\nstrip where+order:", stripClauses(`SELECT c.name FROM customers c WHERE c.active = 1 ORDER BY c.name;`, s3.spans, ["where", "order"]));
