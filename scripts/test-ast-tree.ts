// Smoke-test the AST tree builder against representative queries
import { buildAstTree } from "../src/lib/ast-tree";

const queries: Array<[string, string]> = [
  ["join-agg", "SELECT c.name, o.status, COUNT(*) AS n FROM customers c INNER JOIN orders o ON o.customer_id = c.id WHERE o.created_at >= '2024-01-01' GROUP BY c.name, o.status HAVING COUNT(*) > 5 ORDER BY n DESC LIMIT 10"],
  ["cte-window", "WITH monthly AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id) SELECT m.spend, RANK() OVER (PARTITION BY m.customer_id ORDER BY m.spend DESC) AS r FROM monthly m"],
  ["subquery", "SELECT p.name FROM products p WHERE p.price > (SELECT AVG(pr.price) FROM products pr WHERE pr.category = p.category)"],
  ["update", "UPDATE products SET price = price * 1.1 WHERE category = 'Audio'"],
  ["insert", "INSERT INTO suppliers (id, name, region, rating) VALUES (7, 'Test Co', 'EU', 4.2)"],
  ["error-tree", "SELECT FROM WHERE"],
];

for (const [label, sql] of queries) {
  const tree = buildAstTree(sql, "postgresql");
  if (!tree) {
    console.log(`\n=== ${label}: (null) ===`);
    continue;
  }
  const print = (node: any, indent = 0) => {
    const pad = "  ".repeat(indent);
    console.log(`${pad}${node.label}  [${node.type}]${node.detail ? ` · ${node.detail}` : ""}`);
    for (const c of node.children ?? []) {
      if (indent < 5) print(c, indent + 1);
    }
  };
  console.log(`\n=== ${label} ===`);
  print(tree);
}
