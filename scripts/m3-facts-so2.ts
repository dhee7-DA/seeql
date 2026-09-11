// M3 set-ordering follow-ups — NULL sort position in compounds + ORDER BY name resolution.
// Run: bun scripts/m3-facts-so2.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3fso2.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const err = (sql: string) => {
  try { return JSON.stringify(db.prepare(sql).all()).slice(0, 300); } catch (e) { return "ERR " + String(e).slice(0, 90); }
};

console.log("== NULL POSITION ==");
console.log("plain NULLs first (baseline):", one(`SELECT CASE WHEN status = 'pending' THEN total END AS v FROM orders WHERE status = 'pending' ORDER BY v LIMIT 3`));
console.log("tiny compound UNION ALL:", err(`SELECT NULL AS v UNION ALL SELECT 1 AS v ORDER BY v`));
console.log("tiny compound UNION:", err(`SELECT NULL AS v UNION SELECT 1 AS v ORDER BY v`));
console.log("compound NULL-clump full 21 rows:", err(`SELECT CASE WHEN status = 'pending' THEN total END AS v FROM orders WHERE status = 'pending' UNION ALL SELECT total FROM orders WHERE status = 'cancelled' ORDER BY v`));
console.log("compound NULL-clump DESC LIMIT 2:", one(`SELECT CASE WHEN status = 'pending' THEN total END AS v FROM orders WHERE status = 'pending' UNION ALL SELECT total FROM orders WHERE status = 'cancelled' ORDER BY v DESC LIMIT 2`));
console.log("compound version of plain probe:", one(`SELECT CASE WHEN status = 'pending' THEN total END AS v FROM orders WHERE status = 'pending' UNION ALL SELECT total FROM orders WHERE status = 'shipped' ORDER BY v LIMIT 2`));
console.log("shipped MIN total:", one(`SELECT MIN(total) AS v FROM orders WHERE status = 'shipped'`));
console.log("NULLs first in single-arm plain:", one(`SELECT shipped_at AS v FROM orders ORDER BY v LIMIT 1`));
console.log("shipped_at UNION ALL stack ORDER BY LIMIT 1:", one(`SELECT shipped_at AS v FROM orders UNION ALL SELECT shipped_at FROM orders WHERE status = 'pending' ORDER BY v LIMIT 1`));
console.log("pending shipped_at are NULL:", one(`SELECT COUNT(*) AS n, SUM(shipped_at IS NULL) AS nulls FROM orders WHERE status = 'pending'`));
console.log("UNION ALL of NULL arm + nonnull arm full order:", err(`SELECT shipped_at AS v FROM orders WHERE status = 'pending' UNION ALL SELECT shipped_at FROM orders WHERE status = 'delivered' ORDER BY v`));

console.log("\n== ORDER BY NAME RESOLUTION IN COMPOUNDS ==");
console.log("ORDER BY status (arm-1 input col, aliased v) — full rows:", err(`SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY status`));
console.log("ORDER BY region (arm-2 input col):", err(`SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY region`));
console.log("ORDER BY total (arm-1 input col not in output):", err(`SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY total`));
console.log("no-GROUP BY arms, ORDER BY region:", err(`SELECT status AS v FROM orders UNION ALL SELECT region FROM customers ORDER BY region`));
console.log("no-GROUP BY arms, ORDER BY status:", err(`SELECT status AS v FROM orders UNION ALL SELECT region FROM customers ORDER BY status`));
console.log("ORDER BY city (arm-2 col, grouped arm):", err(`SELECT status AS v FROM orders UNION ALL SELECT region, city FROM customers GROUP BY region, city ORDER BY city`));

console.log("\n== BOUNDARIES / EMPTY BUCKETS ==");
console.log("product price boundaries:", one(`SELECT SUM(price >= 150) AS ge, SUM(price > 150) AS gt, SUM(price = 150) AS eq, MIN(price) AS lo, MAX(price) AS hi FROM products`));
console.log("products price >= 500 empty bucket:", one(`SELECT CASE WHEN price >= 500 THEN 'luxury' WHEN price >= 120 THEN 'premium' ELSE 'everyday' END AS tier, COUNT(*) AS n FROM products GROUP BY tier`));
console.log("orders total >= 5000 empty bucket:", one(`SELECT CASE WHEN total >= 5000 THEN 'whale' WHEN total >= 200 THEN 'big' ELSE 'small' END AS size, COUNT(*) AS n FROM orders GROUP BY size`));
console.log("order totals >= 2000 / >= 1000:", one(`SELECT SUM(total >= 2000) AS ge2000, SUM(total >= 1000) AS ge1000, MAX(total) AS mx FROM orders`));

db.close();
rmSync(COPY);
console.log("done — copy removed");
