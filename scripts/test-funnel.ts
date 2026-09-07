// Execute the funnel stage queries for the default playground sample
// against the live API and print the real counts.
import { buildStagePlan } from "../src/lib/sql-clauses";

const DEFAULT = `SELECT c.name,
       o.status,
       COUNT(*) AS order_count,
       SUM(o.total) AS revenue
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id
WHERE o.created_at >= '2024-01-01'
GROUP BY c.name, o.status
HAVING COUNT(*) > 5
ORDER BY revenue DESC;`;

const CTE = `WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) AS m, COUNT(*) AS n
  FROM orders
  GROUP BY m
)
SELECT m, n FROM monthly ORDER BY n DESC;`;

async function run(label: string, sql: string) {
  const plan = buildStagePlan(sql);
  if (!plan) return console.log(`${label}: no stage plan`);
  const out: string[] = [];
  for (const st of [...plan.stages, { kind: "out" as const, sql: plan.final }]) {
    const r = await fetch("http://localhost:3000/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql: st.sql }),
    }).then((x) => x.json());
    out.push(`${st.kind}=${r.ok ? r.rows[0][0] : `ERR ${r.error}`}`);
  }
  console.log(`${label}: ${out.join("  ")}`);
}

await run("default join+agg", DEFAULT);
await run("cte           ", CTE);
await run("no filters    ", "SELECT name FROM customers;");
