// M3 case-sorts drill receipts — CASE as sort key + display labels.
// Run: bun scripts/m3-facts-cso.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3fcso.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const err = (sql: string) => {
  try { db.prepare(sql).all(); return "NO ERROR"; } catch (e) { return String(e).slice(0, 90); }
};

console.log("== CASE-SORTS RECEIPTS ==");

console.log("custom sort (closed switch):", one(`SELECT status FROM orders GROUP BY status ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'shipped' THEN 1 WHEN 'delivered' THEN 2 ELSE 3 END`));
console.log("no-ELSE sort key + status tiebreak:", one(`SELECT status FROM orders GROUP BY status ORDER BY CASE status WHEN 'pending' THEN 0 END, status`));
console.log("no-ELSE sort key raw (informational):", one(`SELECT status FROM orders GROUP BY status ORDER BY CASE status WHEN 'pending' THEN 0 END`));
console.log("EU pinned first, rest alphabetical:", one(`SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY CASE WHEN region = 'EU' THEN 0 ELSE 1 END, region`));
console.log("category custom order:", one(`SELECT category FROM products GROUP BY category ORDER BY CASE category WHEN 'Electronics' THEN 0 WHEN 'Audio' THEN 1 ELSE 2 END, category`));
console.log("NULLs pushed last, latest first:", one(`SELECT shipped_at FROM orders ORDER BY CASE WHEN shipped_at IS NULL THEN 1 ELSE 0 END, shipped_at DESC LIMIT 3`));
console.log("NULLs-last check (any NULL in first 3?):", one(`SELECT COUNT(*) AS n FROM (SELECT shipped_at FROM orders ORDER BY CASE WHEN shipped_at IS NULL THEN 1 ELSE 0 END, shipped_at LIMIT 3) WHERE shipped_at IS NULL`));
console.log("parity-first ids:", one(`SELECT id FROM orders ORDER BY id % 2, id LIMIT 4`));
console.log("text keys '1'<'10'<'2':", one(`SELECT status FROM orders GROUP BY status ORDER BY CASE status WHEN 'pending' THEN '2' WHEN 'shipped' THEN '10' ELSE '1' END, status`));
console.log("numeric keys before text keys:", one(`SELECT status FROM orders GROUP BY status ORDER BY CASE status WHEN 'pending' THEN 'zz' WHEN 'shipped' THEN 10 ELSE 0 END, status`));
console.log("top-3 totals:", one(`SELECT total FROM orders ORDER BY total DESC LIMIT 3`));
console.log("top-3 labeled:", one(`SELECT total, CASE WHEN total >= 200 THEN 'big' WHEN total >= 80 THEN 'mid' ELSE 'small' END AS size FROM orders ORDER BY total DESC LIMIT 3`));
console.log("pivot custom region order:", one(`SELECT c.region, COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY CASE c.region WHEN 'EU' THEN 0 WHEN 'APAC' THEN 1 WHEN 'US' THEN 2 ELSE 3 END`));
console.log("reverse funnel:", one(`SELECT status FROM orders GROUP BY status ORDER BY CASE status WHEN 'pending' THEN 3 WHEN 'shipped' THEN 2 WHEN 'delivered' THEN 1 ELSE 0 END`));
console.log("capitalized WHEN never matches:", one(`SELECT CASE status WHEN 'Pending' THEN 'x' ELSE 'other' END AS lbl, COUNT(*) AS n FROM orders GROUP BY lbl`));
console.log("label NULL when no ELSE:", one(`SELECT CASE status WHEN 'pending' THEN 'wait' END AS lbl, COUNT(*) AS n FROM orders GROUP BY lbl`));
console.log("sold/shelf census:", one(`SELECT CASE WHEN id IN (SELECT product_id FROM order_items) THEN 'sold' ELSE 'shelf' END AS state, COUNT(*) AS n FROM products GROUP BY state`));
console.log("waiting vs out:", one(`SELECT CASE WHEN shipped_at IS NULL THEN 'waiting' ELSE 'out' END AS lbl, COUNT(*) AS n FROM orders GROUP BY lbl ORDER BY lbl`));
console.log("lowest pending id via CASE sort:", one(`SELECT id, created_at FROM orders ORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, id LIMIT 1`));
console.log("lowest pending id direct (cross-check):", one(`SELECT id, created_at FROM orders WHERE status = 'pending' ORDER BY id LIMIT 1`));
console.log("boundary totals: =200 / =80 / =150:", one(`SELECT SUM(total = 200) AS at200, SUM(total = 80) AS at80, SUM(total = 150) AS at150, SUM(total = 599.91) AS atmax FROM orders`));
console.log("> 150 vs >= 150:", one(`SELECT SUM(total > 150) AS gt, SUM(total >= 150) AS ge FROM orders`));
console.log("jumbo band never appears:", one(`SELECT CASE WHEN total >= 1000 THEN 'jumbo' WHEN total >= 200 THEN 'big' ELSE 'small' END AS size, COUNT(*) AS n FROM orders GROUP BY size`));
console.log("animal labels sort alphabetically:", one(`SELECT CASE WHEN total >= 200 THEN 'whale' WHEN total >= 80 THEN 'dolphin' ELSE 'minnow' END AS size, COUNT(*) AS n FROM orders GROUP BY size ORDER BY size`));
console.log("missing END:", err(`SELECT CASE WHEN 1 = 1 THEN 'x' FROM orders`));
console.log("operator inside simple CASE:", err(`SELECT CASE status WHEN = 'pending' THEN 'x' ELSE 'y' END FROM orders LIMIT 1`));
console.log("ELSE without WHEN:", err(`SELECT CASE status ELSE 'x' END FROM orders LIMIT 1`));
console.log("ORDER BY alias typo:", err(`SELECT status, CASE WHEN total >= 150 THEN 'big' ELSE 'small' END AS size FROM orders ORDER BY siz`));
console.log("distinct labels census:", one(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT CASE WHEN total >= 150 THEN 'big' ELSE 'small' END AS lbl FROM orders)`));
console.log("label groups sort by count DESC:", one(`SELECT CASE WHEN total >= 200 THEN 'big' WHEN total >= 80 THEN 'mid' ELSE 'small' END AS size, COUNT(*) AS n FROM orders GROUP BY size ORDER BY n DESC`));
console.log("sort by derived label (double CASE):", one(`SELECT CASE WHEN total >= 200 THEN 'big' WHEN total >= 80 THEN 'mid' ELSE 'small' END AS size, COUNT(*) AS n FROM orders GROUP BY size ORDER BY CASE size WHEN 'big' THEN 0 WHEN 'mid' THEN 1 ELSE 2 END`));
console.log("oldest pending order:", one(`SELECT id, created_at FROM orders WHERE status = 'pending' ORDER BY created_at, id LIMIT 1`));

db.close();
rmSync(COPY);
console.log("done — copy removed");
