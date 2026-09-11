// M3 set-ordering drill receipts — ordering & shaping stacked (compound) results.
// Run: bun scripts/m3-facts-so.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3fso.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const err = (sql: string) => {
  try { db.prepare(sql).all(); return "NO ERROR"; } catch (e) { return String(e).slice(0, 90); }
};

console.log("== SET-ORDERING RECEIPTS ==");

console.log("orders 1-3 scan statuses:", one(`SELECT id, status FROM orders ORDER BY id LIMIT 3`));
console.log("ORDER BY inside an arm:", err(`SELECT status FROM orders ORDER BY 1 UNION ALL SELECT region FROM customers`));
console.log("full 8-row ORDER BY v (ASC):", one(`SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY v`));
console.log("full 8-row ORDER BY 2 DESC, 1:", one(`SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY 2 DESC, 1`));
console.log("full 8-row ORDER BY v DESC:", one(`SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY v DESC`));
console.log("ORDER BY n (arm-1 alias, arm-2 no alias):", one(`SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY n DESC`));
console.log("ORDER BY status when arm-1 aliased v:", err(`SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY status`));
console.log("trailing GROUP BY binds to LAST arm:", one(`SELECT status, COUNT(*) FROM orders UNION ALL SELECT region, COUNT(*) FROM customers GROUP BY region`));
console.log("per-arm sort via subquery wraps:", one(`SELECT v FROM (SELECT status AS v FROM orders GROUP BY status ORDER BY v LIMIT 2) UNION ALL SELECT v FROM (SELECT region AS v FROM customers GROUP BY region ORDER BY v LIMIT 1)`));
console.log("UNION distinct + ORDER BY 1:", one(`SELECT status FROM orders UNION SELECT region FROM customers ORDER BY 1`));
console.log("UNION distinct + ORDER BY 1 LIMIT 3:", one(`SELECT status FROM orders UNION SELECT region FROM customers ORDER BY 1 LIMIT 3`));
console.log("LIMIT 3 no ORDER BY (scan order):", one(`SELECT status AS v FROM orders UNION ALL SELECT region FROM customers LIMIT 3`));
console.log("NULL clump: pending CASE-NULL + cancelled totals, ORDER BY v LIMIT 3:", one(`SELECT CASE WHEN status = 'pending' THEN total END AS v FROM orders WHERE status = 'pending' UNION ALL SELECT total FROM orders WHERE status = 'cancelled' ORDER BY v LIMIT 3`));
console.log("NULL clump row count:", one(`SELECT COUNT(*) AS n FROM (SELECT CASE WHEN status = 'pending' THEN total END AS v FROM orders WHERE status = 'pending' UNION ALL SELECT total FROM orders WHERE status = 'cancelled')`));
console.log("cancelled totals (for why text):", one(`SELECT total FROM orders WHERE status = 'cancelled' ORDER BY total`));
console.log("ledger leaderboard ORDER BY cents DESC:", one(`SELECT 'invoices' AS ledger, SUM(amount_cents) AS cents FROM invoices UNION ALL SELECT 'payments', SUM(amount_cents) FROM payments ORDER BY cents DESC`));
console.log("ORDER BY 0:", err(`SELECT status FROM orders UNION SELECT region FROM customers ORDER BY 0`));
console.log("double ORDER BY:", err(`SELECT status FROM orders UNION ALL SELECT region FROM customers ORDER BY 1 ORDER BY 1`));
console.log("4-source leaderboard ORDER BY n DESC, 1:", one(`SELECT 'orders' AS src, COUNT(*) AS n FROM orders UNION ALL SELECT 'customers', COUNT(*) FROM customers UNION ALL SELECT 'products', COUNT(*) FROM products UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers ORDER BY n DESC, 1`));
console.log("ids UNION dedup (affinity ok):", one(`SELECT COUNT(*) AS n FROM (SELECT id FROM orders UNION SELECT id FROM customers)`));
console.log("ids stack ORDER BY 1 DESC LIMIT 3:", one(`SELECT id AS v FROM orders UNION SELECT id FROM customers ORDER BY 1 DESC LIMIT 3`));
console.log("mixed-type arm values + ORDER BY v:", one(`SELECT CAST(active AS TEXT) AS v FROM customers UNION SELECT status FROM invoices ORDER BY v`));
console.log("empty arm vanishes, rest still sorts:", one(`SELECT status AS v FROM orders WHERE status = 'returned' UNION ALL SELECT region AS v FROM customers ORDER BY v`));
console.log("NULL dedups to one, sorts first:", one(`SELECT shipped_at AS v FROM orders UNION SELECT shipped_at FROM orders ORDER BY v LIMIT 2`));
console.log("shipped_at UNION distinct count + nulls:", one(`SELECT COUNT(*) AS n, SUM(v IS NULL) AS nulls FROM (SELECT shipped_at AS v FROM orders UNION SELECT shipped_at FROM orders)`));
console.log("WHERE over wrapped stack (v='EU'):", one(`SELECT COUNT(*) AS n FROM (SELECT status AS v FROM orders UNION ALL SELECT region AS v FROM customers) WHERE v = 'EU'`));
console.log("stack then ORDER BY id-less column error:", err(`SELECT status FROM orders UNION SELECT region FROM customers ORDER BY city`));

db.close();
rmSync(COPY);
console.log("done — copy removed");
