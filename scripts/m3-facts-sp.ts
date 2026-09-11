// Set precedence & parens drill receipts (m3-w1b) — probed on read-only copy.
// Run: bun scripts/m3-facts-sp.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3fsp.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const err = (sql: string) => {
  try {
    db.prepare(sql).all();
    return "NO ERROR";
  } catch (e) {
    return String(e).slice(0, 110);
  }
};

const STATUSES = `SELECT status FROM orders`;
const REGIONS = `SELECT region FROM customers`;
const CITIES = `SELECT city FROM customers`;

console.log("== LEFT-ASSOC RECEIPTS (SQLite 3.x, all four ops equal precedence) ==");
console.log("statuses UNION regions INTERSECT cities:", one(`SELECT COUNT(*) AS n FROM (${STATUSES} UNION ${REGIONS} INTERSECT ${CITIES})`));
console.log("statuses EXCEPT regions UNION cities:", one(`SELECT COUNT(*) AS n FROM (${STATUSES} EXCEPT ${REGIONS} UNION ${CITIES})`));
console.log("statuses UNION regions EXCEPT cities:", one(`SELECT COUNT(*) AS n FROM (${STATUSES} UNION ${REGIONS} EXCEPT ${CITIES})`));
console.log("statuses EXCEPT regions INTERSECT cities:", one(`SELECT COUNT(*) AS n FROM (${STATUSES} EXCEPT ${REGIONS} INTERSECT ${CITIES})`));
console.log("statuses INTERSECT regions UNION cities:", one(`SELECT COUNT(*) AS n FROM (${STATUSES} INTERSECT ${REGIONS} UNION ${CITIES})`));
console.log("statuses INTERSECT statuses UNION regions:", one(`SELECT COUNT(*) AS n FROM (${STATUSES} INTERSECT ${STATUSES} UNION ${REGIONS})`));
console.log("regions UNION cities EXCEPT statuses:", one(`SELECT COUNT(*) AS n FROM (${REGIONS} UNION ${CITIES} EXCEPT ${STATUSES})`));
console.log("regions UNION suppliers-regions INTERSECT cities:", one(`SELECT COUNT(*) AS n FROM (SELECT region FROM customers UNION SELECT region FROM suppliers INTERSECT SELECT city FROM customers)`));
console.log("toy: 1 UNION 2 INTERSECT 2:", one(`SELECT v FROM (SELECT 1 AS v UNION SELECT 2 INTERSECT SELECT 2) ORDER BY v`));
console.log("toy: 2 EXCEPT 1 UNION 3:", one(`SELECT v FROM (SELECT 2 AS v EXCEPT SELECT 1 UNION SELECT 3) ORDER BY v`));
console.log("toy: 2 EXCEPT 1 INTERSECT 1:", one(`SELECT v FROM (SELECT 2 AS v EXCEPT SELECT 1 INTERSECT SELECT 1)`));

console.log("\n== GROUPING WORKAROUNDS ==");
console.log("subquery-wrap grouping (statuses ∖ (regions ∪ cities)):", one(`SELECT COUNT(*) AS n FROM (${STATUSES} EXCEPT SELECT v FROM (SELECT region AS v FROM customers UNION SELECT city AS v FROM customers))`));
console.log("subquery-wrap INTERSECT grouping:", one(`SELECT COUNT(*) AS n FROM (${STATUSES} INTERSECT SELECT v FROM (SELECT region AS v FROM customers UNION SELECT city AS v FROM customers))`));

console.log("\n== ERROR TEXTS ==");
console.log("parens compound arm:", err(`${STATUSES} EXCEPT (SELECT region FROM customers UNION ${CITIES})`));
console.log("parens simple arm:", err(`${STATUSES} EXCEPT (${REGIONS})`));
console.log("mid-arm ORDER BY:", err(`${STATUSES} UNION ${REGIONS} ORDER BY 1 UNION ${CITIES}`));
console.log("mid-arm LIMIT:", err(`${STATUSES} UNION ${REGIONS} LIMIT 5 UNION ${CITIES}`));
console.log("col count mismatch EXCEPT msg:", err(`SELECT status FROM orders EXCEPT SELECT region, city FROM customers`));
console.log("col count mismatch UNION ALL msg:", err(`SELECT status FROM orders UNION ALL SELECT region, city FROM customers`));
console.log("col count mismatch INTERSECT msg:", err(`${STATUSES} INTERSECT SELECT region, city FROM customers`));

console.log("\n== TAIL CLAUSES & CHAIN ARITHMETIC ==");
console.log("UNION ALL then UNION collapses:", one(`SELECT COUNT(*) AS n FROM (${STATUSES} UNION ALL ${STATUSES} UNION ${REGIONS})`));
console.log("statuses UNION ALL statuses rows:", one(`SELECT COUNT(*) AS n FROM (${STATUSES} UNION ALL ${STATUSES})`));
console.log("statuses UNION ALL statuses UNION ALL regions:", one(`SELECT COUNT(*) AS n FROM (${STATUSES} UNION ALL ${STATUSES} UNION ALL ${REGIONS})`));
console.log("EXCEPT ... UNION ALL chain:", one(`SELECT COUNT(*) AS n FROM (${STATUSES} EXCEPT ${REGIONS} UNION ALL ${CITIES})`));
console.log("ORDER BY whole compound:", one(`SELECT status AS v FROM orders UNION SELECT region FROM customers ORDER BY v LIMIT 3`));
console.log("ORDER BY left-arm alias works:", one(`SELECT status AS v FROM orders UNION SELECT region FROM customers ORDER BY v LIMIT 1`));
console.log("ORDER BY right-arm-only column:", err(`SELECT status FROM orders UNION SELECT region FROM customers ORDER BY city`));
console.log("GROUP BY per-arm fine:", one(`SELECT COUNT(*) AS n FROM (SELECT status FROM orders GROUP BY status UNION SELECT region FROM customers GROUP BY region)`));
console.log("WHERE per-arm fine:", one(`SELECT COUNT(*) AS n FROM (SELECT city FROM customers WHERE region = 'EU' UNION SELECT city FROM customers WHERE region = 'APAC')`));
console.log("EU cities:", one(`SELECT COUNT(DISTINCT city) AS n FROM customers WHERE region = 'EU'`));
console.log("APAC cities:", one(`SELECT COUNT(DISTINCT city) AS n FROM customers WHERE region = 'APAC'`));

console.log("\n== MISC (second pass) ==");
console.log("ORDER BY 3 on 2-col compound:", err(`SELECT status AS v, COUNT(*) AS n FROM orders GROUP BY status UNION SELECT region, COUNT(*) FROM customers GROUP BY region ORDER BY 3`));
console.log("LIMIT binds whole compound:", one(`SELECT status AS v FROM orders UNION SELECT region FROM customers ORDER BY v LIMIT 3`));
console.log("left-assoc with 4 ops (union union union except):", one(`SELECT COUNT(*) AS n FROM (${STATUSES} UNION ${REGIONS} UNION ${CITIES} EXCEPT SELECT method FROM payments)`));

db.close();
rmSync(COPY);
