import { execSync } from "node:child_process";
const q = `SELECT COUNT(*) AS n FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN customers c ON c.id = o.customer_id AND c.region = 'APAC'`;
const out = execSync(`curl -s -m 20 -X POST http://localhost:3000/api/query -H "Content-Type: application/json" -d '${JSON.stringify({ sql: q }).replace(/'/g, "'\\''")}'`, { encoding: "utf8" });
console.log(out);
