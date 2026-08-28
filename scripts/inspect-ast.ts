// Inspect raw node-sql-parser AST node shapes
import { Parser } from "node-sql-parser";

const parser = new Parser();

const tests: Array<[string, string]> = [
  ["column ref", "SELECT c.name, u.* FROM customers c JOIN users u ON u.id = c.uid"],
  ["group by + order", "SELECT a, b FROM t GROUP BY a, b ORDER BY a DESC, b ASC LIMIT 10 OFFSET 5"],
  ["in list", "SELECT a FROM t WHERE a IN ('x', 'y') AND b = 2"],
  ["window fn", "SELECT RANK() OVER (PARTITION BY m ORDER BY s DESC) AS r FROM m"],
  ["cte", "WITH monthly AS (SELECT a FROM t) SELECT m.a FROM monthly m"],
];

for (const [label, sql] of tests) {
  const ast = parser.astify(sql, { database: "postgresql" }) as Record<string, unknown>;
  console.log(`\n===== ${label} =====`);
  if (label === "column ref") {
    console.log(JSON.stringify((ast as any).columns, null, 1));
    console.log("FROM:", JSON.stringify((ast as any).from, null, 1));
  } else if (label === "group by + order") {
    console.log("groupby:", JSON.stringify((ast as any).groupby, null, 1));
    console.log("orderby:", JSON.stringify((ast as any).orderby, null, 1));
    console.log("limit:", JSON.stringify((ast as any).limit, null, 1));
  } else if (label === "in list") {
    console.log("where:", JSON.stringify((ast as any).where, null, 1));
  } else if (label === "window fn") {
    console.log(JSON.stringify((ast as any).columns, null, 1));
  } else if (label === "cte") {
    console.log("with:", JSON.stringify((ast as any).with, null, 1));
    console.log("from:", JSON.stringify((ast as any).from, null, 1));
  }
}
