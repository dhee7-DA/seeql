// Read-only probe for drill rewrite facts (audit fixes).
// Run: bun scripts/auditfix-facts.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.auditfix.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const queries: Array<[string, string]> = [
  ["products total", "SELECT COUNT(*) AS n FROM products"],
  ["price BETWEEN 50-100", "SELECT COUNT(*) AS n FROM products WHERE price BETWEEN 50 AND 100"],
  ["price NOT BETWEEN", "SELECT COUNT(*) AS n FROM products WHERE price NOT BETWEEN 50 AND 100"],
  ["price >= 100", "SELECT COUNT(*) AS n FROM products WHERE price >= 100"],
  ["price < 50", "SELECT COUNT(*) AS n FROM products WHERE price < 50"],
  ["orders total", "SELECT COUNT(*) AS n FROM orders"],
  ["total BETWEEN 50-100", "SELECT COUNT(*) AS n FROM orders WHERE total BETWEEN 50 AND 100"],
  ["total NOT BETWEEN", "SELECT COUNT(*) AS n FROM orders WHERE total NOT BETWEEN 50 AND 100"],
  ["total >= 100", "SELECT COUNT(*) AS n FROM orders WHERE total >= 100"],
  ["LIKE %Pro%", "SELECT COUNT(*) AS n FROM products WHERE name LIKE '%Pro%'"],
  ["NOT LIKE %Pro%", "SELECT COUNT(*) AS n FROM products WHERE name NOT LIKE '%Pro%'"],
  ["LIKE C%", "SELECT COUNT(*) AS n FROM products WHERE name LIKE 'C%'"],
  ["cd customer_id", "SELECT COUNT(DISTINCT customer_id) AS n FROM orders"],
  ["cd status", "SELECT COUNT(DISTINCT status) AS n FROM orders"],
  ["minmax price", "SELECT MIN(price) AS lo, MAX(price) AS hi FROM products"],
];
for (const [name, sql] of queries) {
  console.log(name.padEnd(22), JSON.stringify(db.prepare(sql).all()));
}
db.close();
rmSync(COPY);
