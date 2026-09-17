import { Parser } from "node-sql-parser";
const p = new Parser();
const queries = [
  "SELECT c.name, COUNT(o.id) AS n FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status = 'x' GROUP BY c.id HAVING COUNT(*) > 1;",
  "WITH big AS (SELECT * FROM orders WHERE total > 100) SELECT * FROM big JOIN customers c ON c.id = big.customer_id;",
  "SELECT status FROM orders;",
];
for (const q of queries) {
  try {
    const { tableList, columnList } = p.parse(q, { database: "sqlite" }) as unknown as {
      tableList: unknown[];
      columnList: unknown[];
    };
    console.log("Q:", q.slice(0, 60));
    console.log("  tableList:", JSON.stringify(tableList));
    console.log("  columnList sample:", JSON.stringify(columnList.slice(0, 4)));
  } catch (e) {
    console.log("Q failed:", (e as Error).message);
  }
}
