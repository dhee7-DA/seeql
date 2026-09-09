// Verify every runnable SQL probe embedded in Module 1 deep-dives executes.
import { execSync } from "node:child_process";

const PROBES: Array<[string, string]> = [
  ["L1 count lines", "SELECT COUNT(*) FROM order_items;"],
  ["L1 rowid", "SELECT rowid FROM customers LIMIT 3;"],
  ["L2 derived", "SELECT name, price, ROUND(price * 0.85, 2) AS sale_price\nFROM products LIMIT 5;"],
  ["L2 no-from", "SELECT 2 + 2 AS four, UPPER('hi') AS shout;"],
  ["L2 quoted alias", 'SELECT name AS "unit price" FROM products LIMIT 2;'],
  ["L2 implicit alias", "SELECT name sale_price FROM products LIMIT 2;"],
  ["L3 prec raw", "SELECT COUNT(*) AS without_parens\nFROM orders\nWHERE status = 'pending' AND total > 400 OR status = 'cancelled';"],
  ["L3 prec fixed", "SELECT COUNT(*) AS with_parens\nFROM orders\nWHERE status = 'pending' AND (total > 400 OR status = 'cancelled');"],
  ["L4 count pair", "SELECT COUNT(*) , COUNT(shipped_at) FROM orders;"],
  ["L4 nulls first", "SELECT id FROM orders ORDER BY shipped_at LIMIT 3;"],
  ["L4 poison", "SELECT name, price * NULL FROM products LIMIT 2;"],
  ["L5 nulls-last trick", "SELECT id FROM orders ORDER BY shipped_at IS NULL, shipped_at LIMIT 2;"],
  ["L5 limit comma", "SELECT id FROM orders ORDER BY id LIMIT 3, 5;"],
  ["L6 dup check", "SELECT COUNT(*) AS rows_total,\n       COUNT(DISTINCT id) AS distinct_ids\nFROM customers;"],
  ["L6 pair count", "SELECT COUNT(*) AS pairs FROM (SELECT DISTINCT status, customer_id FROM orders);"],
  ["L7 empty set", "SELECT COUNT(*) AS n_rows,\n       SUM(total) AS sum_total,\n       ROUND(AVG(total), 2) AS avg_total\nFROM orders\nWHERE total > 99999;"],
  ["L7 text min-max", "SELECT MIN(name) AS mn, MAX(name) AS mx FROM products;"],
  ["L7 bare col quirk", "SELECT status, COUNT(*) AS n FROM orders;"],
  ["L8 having solo", "SELECT COUNT(*) FROM orders HAVING COUNT(*) > 100;"],
  ["L8 full pipeline", "SELECT status, COUNT(*) AS n, ROUND(SUM(total), 2) AS revenue\nFROM orders\nGROUP BY status\nHAVING COUNT(*) >= 30\nORDER BY revenue DESC;"],
];

let fails = 0;
for (const [name, sql] of PROBES) {
  const out = execSync(
    `curl -s -m 15 -X POST http://localhost:3000/api/query -H "Content-Type: application/json" -d '${JSON.stringify({ sql }).replace(/'/g, "'\\''")}'`,
    { encoding: "utf8" },
  );
  try {
    const j = JSON.parse(out);
    if (j.ok) {
      console.log(`OK   ${name}  → ${JSON.stringify(j.rows?.[0] ?? []).slice(0, 90)}`);
    } else {
      fails++;
      console.log(`FAIL ${name}  → ${String(j.error).slice(0, 110)}`);
    }
  } catch {
    fails++;
    console.log(`ERR  ${name}  → ${out.slice(0, 110)}`);
  }
}
console.log(fails === 0 ? "ALL PROBES PASS" : `${fails} PROBE FAILURES`);
