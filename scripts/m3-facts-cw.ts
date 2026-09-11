// M3 CASE WHEN drill-author probes (task m3-w1c) — every number used in
// case-when.ts is verified here on a throwaway copy of db/custom.db.
// Run: bun scripts/m3-facts-cw.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m3fcw.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });
const one = (sql: string) => JSON.stringify(db.prepare(sql).all());
const err = (sql: string) => {
  try { db.prepare(sql).all(); return "NO ERROR"; }
  catch (e) { return String(e).slice(0, 100); }
};

console.log("== CW: CORE RECEIPTS (re-confirm fact sheet) ==");
console.log("orders total / by status:", one(`SELECT COUNT(*) AS n, SUM(status='delivered') AS d, SUM(status='shipped') AS s, SUM(status='pending') AS p, SUM(status='cancelled') AS c FROM orders`));
console.log("bands >=200/>=80/else:", one(`SELECT CASE WHEN total >= 200 THEN 'big' WHEN total >= 80 THEN 'mid' ELSE 'small' END AS size, COUNT(*) AS n FROM orders GROUP BY size ORDER BY n DESC`));
console.log("threshold 150 pair:", one(`SELECT SUM(CASE WHEN total >= 150 THEN 1 ELSE 0 END) AS big, SUM(CASE WHEN total < 150 THEN 1 ELSE 0 END) AS small FROM orders`));
console.log("first-match overlap a=92/b=0/c=11:", one(`SELECT CASE WHEN total >= 80 THEN 'a' WHEN total >= 200 THEN 'b' ELSE 'c' END AS band, COUNT(*) AS n FROM orders GROUP BY band`));

console.log("\n== CW: TRUTHINESS OF BARE STRING (cw-09 trap) ==");
console.log("'shipped' as boolean:", one(`SELECT CASE WHEN 'shipped' THEN 'truthy' ELSE 'falsy' END AS v`));
console.log("status='pending' OR 'shipped' count:", one(`SELECT SUM(CASE WHEN status = 'pending' OR 'shipped' THEN 1 ELSE 0 END) AS n FROM orders`));
console.log("IN ('pending','shipped') count:", one(`SELECT SUM(CASE WHEN status IN ('pending','shipped') THEN 1 ELSE 0 END) AS n FROM orders`));

console.log("\n== CW: CASE SENSITIVITY (cw-25) ==");
console.log("WHEN 'PENDING' hits:", one(`SELECT SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS hits, SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) + SUM(CASE WHEN status != 'PENDING' THEN 1 ELSE 0 END) AS else_side FROM orders`));
console.log("WHEN 'Pending' hits:", one(`SELECT SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS hits FROM orders`));

console.log("\n== CW: IMPOSSIBLE BAND, NO ELSE (cw-26) ==");
console.log("max total:", one(`SELECT MAX(total) AS mx, MIN(total) AS mn FROM orders`));
console.log("total > 100000 arm, no ELSE:", one(`SELECT SUM(CASE WHEN total > 100000 THEN 1 END) AS v FROM orders`));

console.log("\n== CW: SHORT-CIRCUIT EVALUATION (cw-27) ==");
console.log("guarded 1/0:", one(`SELECT CASE WHEN 1 = 1 THEN 'ok' ELSE 1/0 END AS v`));
console.log("unguarded 1/0 errors:", err(`SELECT 1/0`));

console.log("\n== CW: PRICE BOUNDARIES (cw-31) ==");
console.log("products at exactly 50 or 120:", one(`SELECT SUM(price = 50) AS at50, SUM(price = 120) AS at120, SUM(price < 50) AS under50, SUM(price >= 50 AND price < 120) AS mid50_120, SUM(price >= 120) AS over120 FROM products`));
console.log("price 50 through band WHEN price < 50 'lo' WHEN price < 120 'mid' ELSE 'hi':", one(`SELECT CASE WHEN price < 50 THEN 'lo' WHEN price < 120 THEN 'mid' ELSE 'hi' END AS band, COUNT(*) AS n FROM products GROUP BY band`));

console.log("\n== CW: ERROR MESSAGES (cw-32..36, 38) ==");
console.log("missing END:", err(`SELECT id, CASE WHEN total >= 200 THEN 'big' ELSE 'small' FROM orders`));
console.log("missing THEN:", err(`SELECT CASE WHEN status = 'pending' THEN 'open' WHEN status = 'cancelled' 'dead' ELSE 'closed' END FROM orders`));
console.log("two ELSEs:", err(`SELECT CASE WHEN 1=1 THEN 'a' ELSE 'b' ELSE 'c' END`));
console.log("mixed forms (subject + bare condition):", err(`SELECT CASE status = 'pending' THEN 1 ELSE 0 END FROM orders`));
console.log("CASE with only ELSE:", err(`SELECT CASE ELSE 'no match' END`));
console.log("alias in WHERE:", err(`SELECT CASE WHEN total >= 200 THEN 'big' ELSE 'small' END AS size FROM orders WHERE size = 'big'`));
console.log("alias in WHERE works in ORDER BY?:", one(`SELECT CASE WHEN total >= 200 THEN 'big' ELSE 'small' END AS size, COUNT(*) AS n FROM orders GROUP BY size ORDER BY size`));

console.log("\n== CW: FILTER VIA CASE (cw-28) ==");
console.log("WHERE CASE ... = 1 on IS NULL:", one(`SELECT COUNT(*) AS n FROM orders WHERE CASE WHEN shipped_at IS NULL THEN 1 ELSE 0 END = 1`));

console.log("\n== CW: SIMPLE CASE WITH NULL SUBJECT (cw-29) ==");
console.log("CASE shipped_at WHEN NULL:", one(`SELECT SUM(CASE shipped_at WHEN NULL THEN 1 ELSE 0 END) AS matched, COUNT(*) AS n FROM orders`));

console.log("\n== CW: EMPTY INPUT (cw-30) ==");
console.log("WHERE status='flying' + CASE:", one(`SELECT COUNT(*) AS n FROM (SELECT CASE WHEN status = 'flying' THEN 'x' ELSE 'y' END AS b FROM orders WHERE status = 'flying')`));

console.log("\n== CW: ELSE CATCH-ALL (cw-13) ==");
console.log("pending vs else:", one(`SELECT CASE WHEN status = 'pending' THEN 'awaiting' ELSE 'moving' END AS tag, COUNT(*) AS n FROM orders GROUP BY tag`));
console.log("not-pending census:", one(`SELECT SUM(status = 'pending') AS pending, SUM(status != 'pending') AS else_catches FROM orders`));

console.log("\n== CW: REGION PIVOT (cw-45/46) ==");
console.log("pivot counts:", one(`SELECT c.region, SUM(CASE WHEN o.status='pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN o.status='shipped' THEN 1 ELSE 0 END) AS shipped, SUM(CASE WHEN o.status='delivered' THEN 1 ELSE 0 END) AS delivered, SUM(CASE WHEN o.status='cancelled' THEN 1 ELSE 0 END) AS cancelled FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region`));
console.log("pivot money EU:", one(`SELECT c.region, ROUND(SUM(CASE WHEN o.status='pending' THEN o.total ELSE 0 END),2) AS pending_money, ROUND(SUM(CASE WHEN o.status='delivered' THEN o.total ELSE 0 END),2) AS delivered_money FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region ORDER BY c.region`));

console.log("\n== CW: ORDER BY CASE (cw-47) ==");
console.log("custom sort:", one(`SELECT status FROM orders GROUP BY status ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'shipped' THEN 1 WHEN 'delivered' THEN 2 ELSE 3 END`));

console.log("\n== CW: PARITY (cw-44) ==");
console.log("even/odd:", one(`SELECT SUM(CASE WHEN id % 2 = 0 THEN 1 ELSE 0 END) AS even, SUM(CASE WHEN id % 2 = 1 THEN 1 ELSE 0 END) AS odd FROM orders`));

console.log("\n== CW: PRODUCT PIVOT TOP (cw-48) ==");
console.log("times_sold top:", one(`SELECT p.name, SUM(CASE WHEN oi.id IS NULL THEN 0 ELSE 1 END) AS times_sold FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id GROUP BY p.id ORDER BY times_sold DESC, p.name LIMIT 4`));

console.log("\n== CW: IIF (cw-49) ==");
console.log("IIF count:", one(`SELECT COUNT(*) AS n FROM orders WHERE IIF(total >= 150, 1, 0) = 1`));

console.log("\n== CW: NULLS NEVER MATCH (cw-17/24) ==");
console.log("= NULL vs IS NULL:", one(`SELECT SUM(CASE WHEN shipped_at = NULL THEN 1 ELSE 0 END) AS eq_null, SUM(CASE WHEN shipped_at IS NULL THEN 1 ELSE 0 END) AS is_null, SUM(CASE WHEN shipped_at = NULL THEN 'unsent' ELSE 'sent' END = 'sent') AS all_sent FROM orders`));

db.close();
rmSync(COPY);
console.log("\nCW probes done.");
