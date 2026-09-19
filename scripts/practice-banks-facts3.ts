// Round 3 — golf g6 rewrite (redundant subquery starter), invoice anti-join, MoM growth.
const API = "http://localhost:3000/api/query";
async function run(sql: string) {
  const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sql }) });
  return (await res.json()) as { ok: boolean; error?: string; columns?: string[]; rows?: unknown[][]; plan?: Array<{ detail: string }> | null };
}
const Q: Array<[string, string]> = [
  ["g6-starter", "SELECT name, price FROM (SELECT name, price FROM products WHERE price > 100 AND stock > 0 ORDER BY price LIMIT 3) ORDER BY price"],
  ["g6-par", "SELECT name, price FROM products WHERE price > 100 AND stock > 0 ORDER BY price LIMIT 3"],
  ["g6-starter-plan", "EXPLAIN QUERY PLAN SELECT name, price FROM (SELECT name, price FROM products WHERE price > 100 AND stock > 0 ORDER BY price LIMIT 3) ORDER BY price"],
  ["g6-par-plan", "EXPLAIN QUERY PLAN SELECT name, price FROM products WHERE price > 100 AND stock > 0 ORDER BY price LIMIT 3"],
  ["iv-anti", "SELECT i.number, i.amount_cents FROM invoices i WHERE i.id NOT IN (SELECT invoice_id FROM payments) ORDER BY i.amount_cents DESC"],
  ["iv-anti2", "SELECT i.number, i.amount_cents FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL ORDER BY i.amount_cents DESC"],
  ["iv-mom", "SELECT month, revenue, ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct FROM (SELECT SUBSTR(created_at, 1, 7) AS month, ROUND(SUM(total), 2) AS revenue FROM orders WHERE status != 'cancelled' GROUP BY month) WHERE month >= '2024-03' ORDER BY month LIMIT 6"],
  ["iv-mom-row1", "SELECT SUBSTR(created_at, 1, 7) AS month, ROUND(SUM(total), 2) AS revenue FROM orders WHERE status != 'cancelled' GROUP BY month ORDER BY month LIMIT 14"],
];
for (const [id, sql] of Q) {
  const d = await run(sql);
  console.log(`\n[${id}] ${sql}`);
  console.log(d.ok ? `cols: ${(d.columns ?? []).join(" | ")}\n${(d.rows ?? []).slice(0, 16).map((r) => r.join(" | ")).join("\n")}\nplan: ${(d.plan ?? []).map((p) => p.detail).join(" ;; ")}` : "ERR: " + d.error);
}
