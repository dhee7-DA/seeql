// Test all sample queries against /api/query
const BASE = "http://localhost:3000";

const samples = [
  ["join-agg", "SELECT c.name,\n o.status,\n COUNT(*) AS order_count,\n SUM(o.total) AS revenue\nFROM customers c\nINNER JOIN orders o ON o.customer_id = c.id\nWHERE o.created_at >= '2024-01-01'\nGROUP BY c.name, o.status\nHAVING COUNT(*) > 5\nORDER BY revenue DESC;"],
  ["star-schema", "SELECT c.region,\n p.category,\n COUNT(DISTINCT o.id) AS orders,\n SUM(oi.quantity * oi.unit_price) AS sales\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nLEFT JOIN customers c ON c.id = o.customer_id\nWHERE o.status IN ('shipped', 'delivered')\nGROUP BY c.region, p.category\nORDER BY sales DESC\nLIMIT 25;"],
  ["cte-window", "WITH monthly AS (\n SELECT customer_id,\n strftime('%Y-%m', created_at) AS month,\n SUM(total) AS spend\n FROM orders\n GROUP BY customer_id, strftime('%Y-%m', created_at)\n)\nSELECT m.month,\n m.customer_id,\n m.spend,\n RANK() OVER (PARTITION BY m.month ORDER BY m.spend DESC) AS spend_rank\nFROM monthly m\nWHERE m.spend > 100\nORDER BY m.month, spend_rank;"],
  ["subquery", "SELECT p.name, p.price\nFROM products p\nWHERE p.price > (\n SELECT AVG(pr.price)\n FROM products pr\n WHERE pr.category = p.category\n)\nORDER BY p.price DESC;"],
  ["union", "SELECT name, 'customer' AS source\nFROM customers\nWHERE region = 'EU'\nUNION\nSELECT name, 'supplier' AS source\nFROM suppliers\nWHERE region = 'EU'\nORDER BY name;"],
  ["simple", "SELECT id, name, email, city\nFROM customers\nWHERE active = 1 AND created_at > '2024-06-01'\nORDER BY name\nLIMIT 20;"],
  ["catalog", "SELECT s.name AS supplier,\n p.name AS product,\n p.category,\n p.price,\n p.stock,\n p.stock * p.price AS stock_value\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id\nWHERE p.stock > 100\nORDER BY stock_value DESC\nLIMIT 15;"],
];

for (const [name, sql] of samples) {
  const exec = await fetch(`${BASE}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  }).then((r) => r.json());
  const parse = await fetch(`${BASE}/api/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql, dialect: "sqlite" }),
  }).then((r) => r.json());
  const execOk = exec.ok ? `rows=${exec.rowCount} ${exec.durationMs}ms plan=${exec.plan?.length ?? 0}` : `ERR: ${exec.error.slice(0, 80)}`;
  const parseOk = parse.ok ? `tables=${parse.stats.tables} tree=${parse.tree ? "yes" : "NO"}` : `PARSE ERR: ${parse.error.slice(0, 80)}`;
  console.log(`${name.padEnd(12)} exec → ${execOk}\n${" ".repeat(12)} parse → ${parseOk}`);
}
