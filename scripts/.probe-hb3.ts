/// <reference types="bun-types" />
// HB probe round 3 — exact filled SQL for cs-283 / cs-286.
import { Database } from "bun:sqlite";
const db = new Database("scripts/.probe-hb.db", { readonly: true });

const Q: Array<[string, string]> = [
  ["283.filled", `SELECT supplier_id, COUNT(*) AS skus,
         ROUND(AVG(price), 2) AS avg_price,
         ROUND(MAX(price), 2) AS top_price
FROM products
GROUP BY supplier_id
HAVING MAX(price) >= 119
ORDER BY avg_price DESC;`],
  ["286.filled", `SELECT name, price, stock
FROM products
WHERE supplier_id IN (1, 2, 3, 5)
  AND price >= 45
  AND stock <= 110
ORDER BY stock ASC;`],
];

for (const [tag, sql] of Q) {
  const res = db.query(sql).all() as Record<string, unknown>[];
  const cols = res.length ? Object.keys(res[0]) : [];
  console.log(`## ${tag}`);
  for (const r of res) {
    console.log("   " + cols.map((c) => `${c}=${JSON.stringify(r[c])}`).join(" | "));
  }
}
db.close();
