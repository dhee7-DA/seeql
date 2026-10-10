// M4-D3 drill receipts — Derived tables (L27) + CTEs / WITH (L28).
// Probed on a read-only COPY of db/custom.db (SQLite via bun:sqlite).
// Run: bun scripts/m4-facts-d3.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m4d3.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const err = (sql: string) => {
  try {
    db.prepare(sql).all();
    return "NO ERROR";
  } catch (e) {
    return String(e).slice(0, 140);
  }
};

console.log("== SCHEMA ==");
console.log("customers:", one(`SELECT sql FROM sqlite_master WHERE name='customers'`));
console.log("orders:", one(`SELECT sql FROM sqlite_master WHERE name='orders'`));

console.log("\n== FACT SHEET BASE == ");
console.log("customers rows:", one(`SELECT COUNT(*) c FROM customers`));
console.log("orders rows:", one(`SELECT COUNT(*) c FROM orders`));
console.log("customer_id NULLs:", one(`SELECT COUNT(*) c FROM orders WHERE customer_id IS NULL`));
console.log("customer_id distinct:", one(`SELECT COUNT(DISTINCT customer_id) c FROM orders`));
console.log("region counts:", one(`SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY region`));
console.log("status counts:", one(`SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY n DESC`));
console.log("per-customer histogram:", one(`SELECT n, COUNT(*) freq FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) GROUP BY n ORDER BY n`));
console.log("histogram buckets:", one(`SELECT COUNT(*) buckets FROM (SELECT n, COUNT(*) f FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) GROUP BY n)`));
console.log("top orderer:", one(`SELECT c.name, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY n DESC LIMIT 1`));
console.log("mean:", one(`SELECT AVG(n) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`));
console.log(">mean:", one(`SELECT COUNT(*) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n > 6.4375`));
console.log("<5:", one(`SELECT COUNT(*) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n < 5`));
console.log(">=20:", one(`SELECT COUNT(*) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n >= 20`));
console.log("top3 avg:", one(`SELECT ROUND(AVG(n),1) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id ORDER BY n DESC LIMIT 3)`));
console.log("HAVING >=20:", one(`SELECT COUNT(*) FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 20)`));

console.log("\n== DERIVED TABLE CORE RECEIPTS ==");
console.log("staged regions n>4:", one(`SELECT region, n FROM (SELECT region, COUNT(*) AS n FROM customers GROUP BY region) WHERE n > 4 ORDER BY n DESC`));
console.log("staged regions pass-through:", one(`SELECT region FROM (SELECT region, COUNT(*) AS n FROM customers GROUP BY region)`));
console.log("AVG over staged counts:", one(`SELECT AVG(n) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`));
console.log("ROUND(AVG,1) staged:", one(`SELECT ROUND(AVG(n),1) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`));
console.log("ROUND(AVG,2) staged:", one(`SELECT ROUND(AVG(n),2) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`));
console.log("no-alias derived runs:", one(`SELECT MAX(n) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`));
console.log("projection-is-schema error:", err(`SELECT name FROM (SELECT customer_id FROM orders)`));
console.log("outer sees inner alias:", one(`SELECT per.n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) AS per ORDER BY per.n DESC LIMIT 1`));

console.log("\n== DERIVED EXTRA NUMBERS ==");
console.log("SUM staged = total orders:", one(`SELECT SUM(n) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`));
console.log("COUNT staged rows:", one(`SELECT COUNT(*) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`));
console.log("COUNT DISTINCT n:", one(`SELECT COUNT(DISTINCT n) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`));
console.log("MIN/MAX staged:", one(`SELECT MIN(n) mn, MAX(n) mx FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`));
console.log("staged n>=5 rows:", one(`SELECT COUNT(*) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n >= 5`));
console.log("staged n>5 rows:", one(`SELECT COUNT(*) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n > 5`));
console.log("staged 2<=n<=5 rows:", one(`SELECT COUNT(*) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n >= 2 AND n <= 5`));
console.log("freq of n=4:", one(`SELECT freq FROM (SELECT n, COUNT(*) AS freq FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) GROUP BY n) WHERE n = 4`));
console.log("mode n:", one(`SELECT n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) GROUP BY n ORDER BY COUNT(*) DESC LIMIT 1`));
console.log("nested stage n>=13 rows:", one(`SELECT COUNT(*) FROM (SELECT n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n >= 13)`));
console.log("nested stage n>=13 avg:", one(`SELECT ROUND(AVG(n),1) FROM (SELECT n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n >= 13)`));
console.log("empty outer (n>24):", one(`SELECT COUNT(*) c, AVG(n) a FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) WHERE n > 24`));
console.log("inner LIMIT 0:", one(`SELECT COUNT(*) FROM (SELECT customer_id FROM orders LIMIT 0)`));
console.log("inner empty status:", one(`SELECT COUNT(*) c, AVG(n) a FROM (SELECT customer_id, COUNT(*) AS n FROM orders WHERE status = 'refund' GROUP BY customer_id)`));
console.log("comma cross join:", one(`SELECT COUNT(*) FROM (SELECT region FROM customers) a, (SELECT status FROM orders) b`));
console.log("top-2 avg:", one(`SELECT ROUND(AVG(n),1) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id ORDER BY n DESC LIMIT 2)`));
console.log("dup-col derived:", one(`SELECT COUNT(*) FROM (SELECT customer_id, customer_id FROM orders)`));
console.log("region stage SUM n>4:", one(`SELECT SUM(n) FROM (SELECT region, COUNT(*) AS n FROM customers GROUP BY region) WHERE n > 4`));
console.log("top slice LIMIT 1 ASC one row:", one(`SELECT COUNT(*) FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id ORDER BY n ASC LIMIT 1)`));

console.log("\n== DERIVED ERROR TEXTS (verbatim) ==");
console.log("outer HAVING no GROUP BY:", err(`SELECT n FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) HAVING n > 4`));
console.log("inner WHERE sees alias:", err(`SELECT region FROM (SELECT region, COUNT(*) AS n FROM customers WHERE n > 4 GROUP BY region)`));
console.log("outer ORDER BY unseen col:", err(`SELECT region FROM (SELECT region, COUNT(*) AS n FROM customers GROUP BY region) ORDER BY customer_id`));
console.log("outer refs wrong alias col:", err(`SELECT per.counts FROM (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) per`));
console.log("alias inside GROUP BY:", err(`SELECT customer_id FROM orders GROUP BY customer_id AS per`));
console.log("bare SELECT after FROM:", err(`SELECT COUNT(*) FROM SELECT customer_id FROM orders`));
console.log("outer WHERE sees aggregate alias:", err(`SELECT region FROM customers WHERE COUNT(*) > 4 GROUP BY region`));
console.log("MySQL-style no-alias in SQLite (control):", err(`SELECT n FROM (SELECT COUNT(*) AS n FROM orders GROUP BY customer_id)`));

console.log("\n== CTE CORE RECEIPTS ==");
const PER = `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id)`;
console.log("CTE count rows:", one(`${PER} SELECT COUNT(*) FROM per`));
console.log("CTE n>=20:", one(`${PER} SELECT COUNT(*) FROM per WHERE n >= 20`));
console.log("CTE chain vip:", one(`${PER}, vip AS (SELECT customer_id, n FROM per WHERE n >= 20) SELECT COUNT(*) FROM vip`));
console.log("CTE twice 16/24:", one(`${PER} SELECT (SELECT COUNT(*) FROM per) total, (SELECT MAX(n) FROM per) busiest`));
console.log("CTE ROUND(AVG,2):", one(`${PER} SELECT ROUND(AVG(n),2) FROM per`));
console.log("CTE SUM:", one(`${PER} SELECT SUM(n) FROM per`));
console.log("CTE vip n>=13:", one(`${PER}, vip AS (SELECT n FROM per WHERE n >= 13) SELECT COUNT(*) FROM vip`));
console.log("CTE feeds derived n>=13:", one(`${PER} SELECT COUNT(*) FROM (SELECT n FROM per WHERE n >= 13) t`));
console.log("CTE top-3 avg:", one(`${PER}, top AS (SELECT n FROM per ORDER BY n DESC LIMIT 3) SELECT ROUND(AVG(n),1) FROM top`));
console.log("CTE top-2 avg:", one(`${PER}, top AS (SELECT n FROM per ORDER BY n DESC LIMIT 2) SELECT ROUND(AVG(n),1) FROM top`));
console.log("CTE explicit col list n=4:", one(`WITH per(customer_id, n) AS (SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id) SELECT COUNT(*) FROM per WHERE n = 4`));
console.log("CTE vip join name:", one(`${PER}, vip AS (SELECT customer_id, n FROM per WHERE n >= 20) SELECT c.name FROM vip JOIN customers c ON c.id = vip.customer_id`));
console.log("CTE shadows real table:", one(`WITH orders AS (SELECT 1 AS x) SELECT COUNT(*) FROM orders`));
console.log("unused CTE runs:", one(`${PER} SELECT COUNT(*) FROM orders`));
console.log("empty CTE refund:", one(`WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders WHERE status = 'refund' GROUP BY customer_id) SELECT COUNT(*) c, AVG(n) a FROM per`));
console.log("no RECURSIVE keyword:", one(`WITH seq(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM seq WHERE x < 5) SELECT COUNT(*) FROM seq`));

console.log("\n== RECURSIVE COUNTERS ==");
console.log("1..5 count:", one(`WITH RECURSIVE seq(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM seq WHERE x < 5) SELECT COUNT(*) FROM seq`));
console.log("1..5 sum:", one(`WITH RECURSIVE seq(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM seq WHERE x < 5) SELECT SUM(x) FROM seq`));
console.log("guard 10 sum:", one(`WITH RECURSIVE seq(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM seq WHERE x < 10) SELECT SUM(x) FROM seq`));
console.log("guard 10 count:", one(`WITH RECURSIVE seq(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM seq WHERE x < 10) SELECT COUNT(*) FROM seq`));
console.log("guard x<0 (anchor only):", one(`WITH RECURSIVE seq(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM seq WHERE x < 0) SELECT COUNT(*) FROM seq`));
console.log("anchor 3 guard x<5:", one(`WITH RECURSIVE seq(x) AS (SELECT 3 UNION ALL SELECT x+1 FROM seq WHERE x < 5) SELECT COUNT(*) FROM seq`));
console.log("step 2 guard x<9:", one(`WITH RECURSIVE seq(x) AS (SELECT 1 UNION ALL SELECT x+2 FROM seq WHERE x < 9) SELECT COUNT(*) c, SUM(x) s FROM seq`));

console.log("\n== CTE ERROR TEXTS (verbatim) ==");
console.log("stmt1 WITH per:", one(`WITH per AS (SELECT 1 AS x) SELECT x FROM per`));
try {
  db.prepare(`SELECT COUNT(*) FROM per`).all();
  console.log("stmt2 after semicolon: NO ERROR");
} catch (e) {
  console.log("stmt2 after semicolon:", String(e).slice(0, 140));
}
console.log("missing AS:", err(`WITH per (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) SELECT COUNT(*) FROM per`));
console.log("missing comma:", err(`WITH a AS (SELECT 1 AS x) b AS (SELECT 2 AS y) SELECT COUNT(*) FROM b`));
console.log("backward chain runs? value:", one(`WITH vip AS (SELECT customer_id, n FROM per WHERE n >= 20), per AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) SELECT COUNT(*) FROM vip`));
console.log("backward chain value 2:", one(`WITH b AS (SELECT x FROM a), a AS (SELECT 42 AS x) SELECT * FROM b`));
console.log("outer refs unseen col:", err(`${PER} SELECT name FROM per`));
console.log("WITH mid-statement:", err(`SELECT COUNT(*) FROM orders WITH per AS (SELECT 1 AS x)`));

console.log("CTE self-join on equal n:", one(`${PER} SELECT COUNT(*) FROM per p1 JOIN per p2 ON p1.n = p2.n`));
console.log("CTE sub MAX n:", one(`${PER} SELECT COUNT(*) FROM per WHERE n = (SELECT MAX(n) FROM per)`));
console.log("CTE twice in FROM:", one(`${PER} SELECT COUNT(*) FROM per, per per2`));


db.close();
rmSync(COPY, { force: true });
console.log("\nDONE");
