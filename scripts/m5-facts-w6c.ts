/// <reference types="bun-types" />
// m5-c6 REPAIR probe (audit-fix loop) — read-only COPY of db/custom.db, self-deleting.
// Receipts for the 13 failing cases in cases-w6.ts: correct-fill result rows,
// distractor landing rows, and verbatim engine errors for the chips this repair
// keeps or introduces. Nothing here invents figures — everything is read back.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w6c.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  try {
    console.log(JSON.stringify(q(sql)));
  } catch (e) {
    console.log(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
};
const trap = (label: string, sql: string) => {
  try {
    const rows = q(sql);
    console.log(`\n[TRAP ${label}]  PARSES — rows: ${JSON.stringify(rows).slice(0, 300)}`);
  } catch (e) {
    console.log(`\n[TRAP ${label}]  ${e instanceof Error ? e.message : String(e)}`);
  }
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- cs-1389 status pots (marker {1} restored) ------------------------------
show("cs-1389 correct fill", `WITH s AS (SELECT status, ROUND(SUM(total), 2) AS pot FROM orders GROUP BY status)
SELECT status, pot, RANK() OVER (ORDER BY pot DESC) AS rk FROM s WHERE pot = 15571.07`);
show("cs-1389 ASC variant (slot2)", `WITH s AS (SELECT status, ROUND(SUM(total), 2) AS pot FROM orders GROUP BY status)
SELECT status, pot, RANK() OVER (ORDER BY pot ASC) AS rk FROM s WHERE pot = 15571.07`);
show("cs-1389 COUNT-paint pots", `WITH s AS (SELECT status, ROUND(COUNT(total), 2) AS pot FROM orders GROUP BY status)
SELECT status, pot, RANK() OVER (ORDER BY pot DESC) AS rk FROM s WHERE pot = 15571.07`);
trap("cs-1389 11996.72 as aggregator", `WITH s AS (SELECT status, ROUND(11996.72(total), 2) AS pot FROM orders GROUP BY status) SELECT status, pot FROM s`);

// ---- cs-1390 signup waves at 2dp --------------------------------------------
show("cs-1390 correct fill (2dp)", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM customers GROUP BY mon),
p AS (SELECT mon, n, COUNT(*) OVER () AS waves, ROUND(100.0 * n / SUM(n) OVER (), 2) AS share FROM m)
SELECT mon, n, waves, share FROM p WHERE share = 6.25`);
show("cs-1390 COUNT(n) OVER () divisor", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM customers GROUP BY mon),
p AS (SELECT mon, n, COUNT(*) OVER () AS waves, ROUND(100.0 * n / COUNT(n) OVER (), 2) AS share FROM m)
SELECT mon, n, waves, share FROM p WHERE share = 6.25`);
show("cs-1390 12.5-as-divisor shares", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM customers GROUP BY mon),
p AS (SELECT mon, n, COUNT(*) OVER () AS waves, ROUND(100.0 * n / 12.5, 2) AS share FROM m)
SELECT mon, n, waves, share FROM p`);
show("cs-1390 pin 12.5 rows", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM customers GROUP BY mon),
p AS (SELECT mon, n, COUNT(*) OVER () AS waves, ROUND(100.0 * n / SUM(n) OVER (), 2) AS share FROM m)
SELECT mon, n, waves, share FROM p WHERE share = 12.5`);
trap("cs-1390 SUM(*) stage", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(*) AS n FROM customers GROUP BY mon) SELECT mon, n FROM m`);

// ---- cs-1392 bill-count tail (rank staged before pin) ------------------------
show("cs-1392 correct fill", `WITH s AS (SELECT category, COUNT(*) AS n FROM expenses GROUP BY category),
r AS (SELECT category, n, RANK() OVER (ORDER BY n DESC) AS rk FROM s)
SELECT category, n, rk FROM r WHERE n = 3`);
show("cs-1392 ASC variant", `WITH s AS (SELECT category, COUNT(*) AS n FROM expenses GROUP BY category),
r AS (SELECT category, n, RANK() OVER (ORDER BY n ASC) AS rk FROM s)
SELECT category, n, rk FROM r WHERE n = 3`);
show("cs-1392 pin 14 rows", `WITH s AS (SELECT category, COUNT(*) AS n FROM expenses GROUP BY category),
r AS (SELECT category, n, RANK() OVER (ORDER BY n DESC) AS rk FROM s)
SELECT category, n, rk FROM r WHERE n = 14`);
trap("cs-1392 14 as direction", `WITH s AS (SELECT category, COUNT(*) AS n FROM expenses GROUP BY category),
r AS (SELECT category, n, RANK() OVER (ORDER BY n 14) AS rk FROM s) SELECT category, n, rk FROM r WHERE n = 3`);
trap("cs-1392 bare SUM in WHERE", `WITH s AS (SELECT category, COUNT(*) AS n FROM expenses GROUP BY category),
r AS (SELECT category, n, RANK() OVER (ORDER BY n DESC) AS rk FROM s) SELECT category, n, rk FROM r WHERE n = SUM`);

// ---- cs-1393 shelf tier (DESC windows) ---------------------------------------
show("cs-1393 correct fill", `WITH s AS (SELECT category, COUNT(*) AS n, RANK() OVER (ORDER BY COUNT(*) DESC) AS rk,
DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) AS drk FROM products GROUP BY category)
SELECT category, n, rk, drk FROM s WHERE n = 2 AND rk = 4`);
show("cs-1393 MAX(id) per category", `SELECT category, MAX(id) mx, COUNT(*) n FROM products GROUP BY category ORDER BY mx`);
show("cs-1393 MAX(id)-as-n fill", `WITH s AS (SELECT category, MAX(id) AS n, RANK() OVER (ORDER BY COUNT(*) DESC) AS rk,
DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) AS drk FROM products GROUP BY category)
SELECT category, n, rk, drk FROM s WHERE n = 2 AND rk = 4`);
trap("cs-1393 MAX(id) in n-pin", `WITH s AS (SELECT category, COUNT(*) AS n FROM products GROUP BY category)
SELECT category, n FROM s WHERE n = MAX(id)`);
show("cs-1393 pin n=3 rows", `WITH s AS (SELECT category, COUNT(*) AS n, RANK() OVER (ORDER BY COUNT(*) DESC) AS rk,
DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) AS drk FROM products GROUP BY category)
SELECT category, n, rk, drk FROM s WHERE n = 3 AND rk = 4`);

// ---- cs-1397 pending podium (rank staged before pin) -------------------------
show("cs-1397 correct fill", `WITH p AS (SELECT customer_id, ROUND(SUM(total), 2) AS pend, COUNT(*) AS n
FROM orders WHERE status = 'pending' GROUP BY customer_id),
q AS (SELECT c.name, p.pend, p.n, RANK() OVER (ORDER BY p.pend DESC) AS rk
FROM p JOIN customers c ON c.id = p.customer_id)
SELECT name, pend, n, rk FROM q WHERE pend = 1088.44 AND n = 1`);
show("cs-1397 ASC variant", `WITH p AS (SELECT customer_id, ROUND(SUM(total), 2) AS pend, COUNT(*) AS n
FROM orders WHERE status = 'pending' GROUP BY customer_id),
q AS (SELECT c.name, p.pend, p.n, RANK() OVER (ORDER BY p.pend ASC) AS rk
FROM p JOIN customers c ON c.id = p.customer_id)
SELECT name, pend, n, rk FROM q WHERE pend = 1088.44 AND n = 1`);
show("cs-1397 pin 1471.43 rows", `WITH p AS (SELECT customer_id, ROUND(SUM(total), 2) AS pend, COUNT(*) AS n
FROM orders WHERE status = 'pending' GROUP BY customer_id),
q AS (SELECT c.name, p.pend, p.n, RANK() OVER (ORDER BY p.pend DESC) AS rk
FROM p JOIN customers c ON c.id = p.customer_id)
SELECT name, pend, n, rk FROM q WHERE pend = 1471.43 AND n = 1`);
show("cs-1397 pin n=3 rows", `WITH p AS (SELECT customer_id, ROUND(SUM(total), 2) AS pend, COUNT(*) AS n
FROM orders WHERE status = 'pending' GROUP BY customer_id),
q AS (SELECT c.name, p.pend, p.n, RANK() OVER (ORDER BY p.pend DESC) AS rk
FROM p JOIN customers c ON c.id = p.customer_id)
SELECT name, pend, n, rk FROM q WHERE pend = 1088.44 AND n = 3`);
trap("cs-1397 1471.43 as direction", `WITH p AS (SELECT customer_id, ROUND(SUM(total), 2) AS pend, COUNT(*) AS n
FROM orders WHERE status = 'pending' GROUP BY customer_id),
q AS (SELECT c.name, p.pend, p.n, RANK() OVER (ORDER BY p.pend 1471.43) AS rk
FROM p JOIN customers c ON c.id = p.customer_id) SELECT name, pend, n, rk FROM q`);

// ---- cs-1402 champions' global league (rank staged before total pin) ---------
show("cs-1402 correct fill", `WITH c AS (SELECT status, id, total, ROW_NUMBER() OVER (PARTITION BY status ORDER BY total DESC, id) AS rn FROM orders),
g AS (SELECT status, id, total, RANK() OVER (ORDER BY total DESC) AS rk FROM c WHERE rn = 1)
SELECT status, id, total, rk FROM g WHERE total = 1088.44`);
show("cs-1402 ASC variant", `WITH c AS (SELECT status, id, total, ROW_NUMBER() OVER (PARTITION BY status ORDER BY total DESC, id) AS rn FROM orders),
g AS (SELECT status, id, total, RANK() OVER (ORDER BY total ASC) AS rk FROM c WHERE rn = 1)
SELECT status, id, total, rk FROM g WHERE total = 1088.44`);
show("cs-1402 pin 845.92 row", `WITH c AS (SELECT status, id, total, ROW_NUMBER() OVER (PARTITION BY status ORDER BY total DESC, id) AS rn FROM orders),
g AS (SELECT status, id, total, RANK() OVER (ORDER BY total DESC) AS rk FROM c WHERE rn = 1)
SELECT status, id, total, rk FROM g WHERE total = 845.92`);
show("cs-1402 rn=845.92 rows", `WITH c AS (SELECT status, id, total, ROW_NUMBER() OVER (PARTITION BY status ORDER BY total DESC, id) AS rn FROM orders),
g AS (SELECT status, id, total, RANK() OVER (ORDER BY total DESC) AS rk FROM c WHERE rn = 845.92)
SELECT status, id, total, rk FROM g`);
trap("cs-1402 845.92 as direction", `WITH c AS (SELECT status, id, total, ROW_NUMBER() OVER (PARTITION BY status ORDER BY total DESC, id) AS rn FROM orders),
g AS (SELECT status, id, total, RANK() OVER (ORDER BY total 845.92) AS rk FROM c WHERE rn = 1)
SELECT status, id, total, rk FROM g`);

// ---- cs-1406 burn board (ratio ranked before month pin) -----------------------
show("cs-1406 correct fill", `WITH r AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon),
e AS (SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) / 100.0 AS opex FROM expenses GROUP BY mon),
j AS (SELECT r.mon, ROUND(100.0 * e.opex / r.rev, 1) AS ratio, RANK() OVER (ORDER BY e.opex / r.rev DESC) AS rk
FROM r JOIN e ON e.mon = r.mon)
SELECT mon, ratio, rk FROM j WHERE mon = '2024-07'`);
show("cs-1406 ASC variant", `WITH r AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon),
e AS (SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) / 100.0 AS opex FROM expenses GROUP BY mon),
j AS (SELECT r.mon, ROUND(100.0 * e.opex / r.rev, 1) AS ratio, RANK() OVER (ORDER BY e.opex / r.rev ASC) AS rk
FROM r JOIN e ON e.mon = r.mon)
SELECT mon, ratio, rk FROM j WHERE mon = '2024-07'`);
show("cs-1406 pin 2024-08 row", `WITH r AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon),
e AS (SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) / 100.0 AS opex FROM expenses GROUP BY mon),
j AS (SELECT r.mon, ROUND(100.0 * e.opex / r.rev, 1) AS ratio, RANK() OVER (ORDER BY e.opex / r.rev DESC) AS rk
FROM r JOIN e ON e.mon = r.mon)
SELECT mon, ratio, rk FROM j WHERE mon = '2024-08'`);
show("cs-1406 '2024-08' as slicer", `WITH r AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon),
e AS (SELECT strftime('%Y-%m', '2024-08') AS mon, SUM(amount_cents) / 100.0 AS opex FROM expenses GROUP BY mon),
j AS (SELECT r.mon, ROUND(100.0 * e.opex / r.rev, 1) AS ratio, RANK() OVER (ORDER BY e.opex / r.rev DESC) AS rk
FROM r JOIN e ON e.mon = r.mon)
SELECT mon, ratio, rk FROM j WHERE mon = '2024-07'`);
trap("cs-1406 created_at slicer on expenses", `WITH r AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon),
e AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(amount_cents) / 100.0 AS opex FROM expenses GROUP BY mon) SELECT r.mon FROM r JOIN e ON e.mon = r.mon`);
trap("cs-1406 '2024-08' as direction", `WITH r AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon),
e AS (SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) / 100.0 AS opex FROM expenses GROUP BY mon),
j AS (SELECT r.mon, ROUND(100.0 * e.opex / r.rev, 1) AS ratio, RANK() OVER (ORDER BY e.opex / r.rev '2024-08') AS rk
FROM r JOIN e ON e.mon = r.mon) SELECT mon, ratio, rk FROM j`);

// ---- cs-1411 five-biggest cut (rn = pin) --------------------------------------
show("cs-1411 correct fill (rn = 5)", `WITH s AS (SELECT id, total, status, ROW_NUMBER() OVER (ORDER BY total DESC) AS rn FROM orders)
SELECT id, total, status, rn FROM s WHERE rn = 5 AND total = 785.79`);
show("cs-1411 ASC variant", `WITH s AS (SELECT id, total, status, ROW_NUMBER() OVER (ORDER BY total ASC) AS rn FROM orders)
SELECT id, total, status, rn FROM s WHERE rn = 5 AND total = 785.79`);
show("cs-1411 rn=4 variant", `WITH s AS (SELECT id, total, status, ROW_NUMBER() OVER (ORDER BY total DESC) AS rn FROM orders)
SELECT id, total, status, rn FROM s WHERE rn = 4 AND total = 785.79`);
show("cs-1411 767.64 as rn", `WITH s AS (SELECT id, total, status, ROW_NUMBER() OVER (ORDER BY total DESC) AS rn FROM orders)
SELECT id, total, status, rn FROM s WHERE rn = 767.64 AND total = 785.79`);
show("cs-1411 767.64 as total", `WITH s AS (SELECT id, total, status, ROW_NUMBER() OVER (ORDER BY total DESC) AS rn FROM orders)
SELECT id, total, status, rn FROM s WHERE rn = 5 AND total = 767.64`);
show("cs-1411 785.79 ASC rung", `WITH s AS (SELECT id, total, ROW_NUMBER() OVER (ORDER BY total ASC) AS rn FROM orders)
SELECT id, total, rn FROM s WHERE total = 785.79`);

// ---- cs-1412 payment mix (staged cents, single marker) ------------------------
show("cs-1412 correct fill", `WITH m AS (SELECT method, COUNT(*) AS n, SUM(amount_cents) AS cents FROM payments GROUP BY method),
p AS (SELECT method, n, ROUND(cents / 100.0, 2) AS paid,
ROUND(100.0 * cents / SUM(cents) OVER (), 1) AS pct FROM m)
SELECT method, n, paid, pct FROM p WHERE pct = 53.7`);
show("cs-1412 COUNT-fold variant", `WITH m AS (SELECT method, COUNT(*) AS n, COUNT(amount_cents) AS cents FROM payments GROUP BY method),
p AS (SELECT method, n, ROUND(cents / 100.0, 2) AS paid,
ROUND(100.0 * cents / SUM(cents) OVER (), 1) AS pct FROM m)
SELECT method, n, paid, pct FROM p`);
show("cs-1412 10.0 scale variant", `WITH m AS (SELECT method, COUNT(*) AS n, SUM(amount_cents) AS cents FROM payments GROUP BY method),
p AS (SELECT method, n, ROUND(cents / 100.0, 2) AS paid,
ROUND(10.0 * cents / SUM(cents) OVER (), 1) AS pct FROM m)
SELECT method, n, paid, pct FROM p WHERE pct = 53.7`);
show("cs-1412 pin 46.3 row", `WITH m AS (SELECT method, COUNT(*) AS n, SUM(amount_cents) AS cents FROM payments GROUP BY method),
p AS (SELECT method, n, ROUND(cents / 100.0, 2) AS paid,
ROUND(100.0 * cents / SUM(cents) OVER (), 1) AS pct FROM m)
SELECT method, n, paid, pct FROM p WHERE pct = 46.3`);
trap("cs-1412 COUNT as scale", `WITH m AS (SELECT method, COUNT(*) AS n, SUM(amount_cents) AS cents FROM payments GROUP BY method),
p AS (SELECT method, n, ROUND(cents / 100.0, 2) AS paid,
ROUND(COUNT * cents / SUM(cents) OVER (), 1) AS pct FROM m) SELECT method, n, paid, pct FROM p`);
trap("cs-1412 10.0 as fold", `WITH m AS (SELECT method, COUNT(*) AS n, 10.0(amount_cents) AS cents FROM payments GROUP BY method) SELECT method, n FROM m`);

// ---- cs-1414 leanest burn month (hardcoded slicer, 3 markers) ------------------
show("cs-1414 correct fill", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents) / 100.0 AS spend FROM expenses GROUP BY mo),
r AS (SELECT mo, spend, ROUND(100.0 * spend / SUM(spend) OVER (), 1) AS pct,
RANK() OVER (ORDER BY spend ASC) AS rk FROM m)
SELECT mo, spend, pct, rk FROM r WHERE rk = 1`);
show("cs-1414 full month ladder", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents) / 100.0 AS spend FROM expenses GROUP BY mo),
r AS (SELECT mo, spend, ROUND(100.0 * spend / SUM(spend) OVER (), 1) AS pct,
RANK() OVER (ORDER BY spend ASC) AS rk FROM m)
SELECT mo, spend, pct, rk FROM r ORDER BY rk LIMIT 3`);
show("cs-1414 MAX-pot variant", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents) / 100.0 AS spend FROM expenses GROUP BY mo),
r AS (SELECT mo, spend, ROUND(100.0 * spend / MAX(spend) OVER (), 1) AS pct,
RANK() OVER (ORDER BY spend ASC) AS rk FROM m)
SELECT mo, spend, pct, rk FROM r WHERE rk = 1`);
show("cs-1414 3210-divisor variant", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents) / 100.0 AS spend FROM expenses GROUP BY mo),
r AS (SELECT mo, spend, ROUND(100.0 * spend / 3210, 1) AS pct,
RANK() OVER (ORDER BY spend ASC) AS rk FROM m)
SELECT mo, spend, pct, rk FROM r WHERE rk = 1`);
show("cs-1414 DESC variant", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents) / 100.0 AS spend FROM expenses GROUP BY mo),
r AS (SELECT mo, spend, ROUND(100.0 * spend / SUM(spend) OVER (), 1) AS pct,
RANK() OVER (ORDER BY spend DESC) AS rk FROM m)
SELECT mo, spend, pct, rk FROM r WHERE rk = 1`);
trap("cs-1414 MAX(spend) OVER () as direction", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents) / 100.0 AS spend FROM expenses GROUP BY mo),
r AS (SELECT mo, spend, ROUND(100.0 * spend / SUM(spend) OVER (), 1) AS pct,
RANK() OVER (ORDER BY spend MAX(spend) OVER ()) AS rk FROM m) SELECT mo, spend, pct, rk FROM r`);
trap("cs-1414 window in rk pin", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents) / 100.0 AS spend FROM expenses GROUP BY mo),
r AS (SELECT mo, spend, ROUND(100.0 * spend / SUM(spend) OVER (), 1) AS pct,
RANK() OVER (ORDER BY spend ASC) AS rk FROM m) SELECT mo, spend, pct, rk FROM r WHERE rk = MAX(spend) OVER ()`);
trap("cs-1414 3210 as direction", `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents) / 100.0 AS spend FROM expenses GROUP BY mo),
r AS (SELECT mo, spend, ROUND(100.0 * spend / SUM(spend) OVER (), 1) AS pct,
RANK() OVER (ORDER BY spend 3210) AS rk FROM m) SELECT mo, spend, pct, rk FROM r WHERE rk = 1`);

// ---- cs-1418 deep three (17.6 dropped) ------------------------------------------
show("cs-1418 correct fill", `WITH s AS (SELECT name, stock, ROW_NUMBER() OVER (ORDER BY stock DESC) AS rn,
ROUND(100.0 * stock / SUM(stock) OVER (), 1) AS pct FROM products)
SELECT name, stock, rn, pct FROM s WHERE rn <= 3 AND pct = 10.5`);
show("cs-1418 ASC bottom pcts", `WITH s AS (SELECT name, stock, ROW_NUMBER() OVER (ORDER BY stock ASC) AS rn,
ROUND(100.0 * stock / SUM(stock) OVER (), 1) AS pct FROM products)
SELECT name, stock, rn, pct FROM s WHERE rn <= 3`);
show("cs-1418 MAX-paint top3", `WITH s AS (SELECT name, stock, ROW_NUMBER() OVER (ORDER BY stock DESC) AS rn,
ROUND(100.0 * stock / MAX(stock) OVER (), 1) AS pct FROM products)
SELECT name, stock, rn, pct FROM s WHERE rn <= 3`);
show("cs-1418 rn<=2 rows", `WITH s AS (SELECT name, stock, ROW_NUMBER() OVER (ORDER BY stock DESC) AS rn,
ROUND(100.0 * stock / SUM(stock) OVER (), 1) AS pct FROM products)
SELECT name, stock, rn, pct FROM s WHERE rn <= 2`);
trap("cs-1418 2 as direction", `WITH s AS (SELECT name, stock, ROW_NUMBER() OVER (ORDER BY stock 2) AS rn,
ROUND(100.0 * stock / SUM(stock) OVER (), 1) AS pct FROM products) SELECT name, stock, rn, pct FROM s`);
trap("cs-1418 window in pct pin", `WITH s AS (SELECT name, stock, ROW_NUMBER() OVER (ORDER BY stock DESC) AS rn,
ROUND(100.0 * stock / SUM(stock) OVER (), 1) AS pct FROM products) SELECT name, stock, rn, pct FROM s WHERE rn <= 3 AND pct = MAX(stock) OVER ()`);

// ---- cs-1422 podium share (rk = pin) ---------------------------------------------
show("cs-1422 correct fill", `WITH s AS (SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
ROUND(100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (), 1) AS pct,
RANK() OVER (ORDER BY SUM(o.total) DESC) AS rk
FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)
SELECT name, spend, pct, rk FROM s WHERE rk = 3 AND pct = 13.1`);
show("cs-1422 ASC variant", `WITH s AS (SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
ROUND(100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (), 1) AS pct,
RANK() OVER (ORDER BY SUM(o.total) ASC) AS rk
FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)
SELECT name, spend, pct, rk FROM s WHERE rk = 3 AND pct = 13.1`);
show("cs-1422 ASC rungs 13..15", `WITH s AS (SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
RANK() OVER (ORDER BY SUM(o.total) ASC) AS rk
FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)
SELECT name, spend, rk FROM s WHERE rk BETWEEN 13 AND 15`);
show("cs-1422 rk=1 variant", `WITH s AS (SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
ROUND(100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (), 1) AS pct,
RANK() OVER (ORDER BY SUM(o.total) DESC) AS rk
FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)
SELECT name, spend, pct, rk FROM s WHERE rk = 1 AND pct = 13.1`);
trap("cs-1422 1 as direction", `WITH s AS (SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
ROUND(100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (), 1) AS pct,
RANK() OVER (ORDER BY SUM(o.total) 1) AS rk
FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id) SELECT name, spend, pct, rk FROM s`);

// ---- cs-1423 champion's global cut (rk staged, two number pins) -------------------
show("cs-1423 correct fill", `WITH best AS (SELECT customer_id, id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) AS rn FROM orders),
g AS (SELECT customer_id, id, total, RANK() OVER (ORDER BY total DESC) AS rk FROM best WHERE rn = 1)
SELECT c.name, g.id, g.total, g.rk FROM g JOIN customers c ON c.id = g.customer_id WHERE g.total = 767.64 AND g.rk = 5`);
show("cs-1423 id-partition variant", `WITH best AS (SELECT customer_id, id, total, ROW_NUMBER() OVER (PARTITION BY id ORDER BY total DESC, id) AS rn FROM orders),
g AS (SELECT customer_id, id, total, RANK() OVER (ORDER BY total DESC) AS rk FROM best WHERE rn = 1)
SELECT c.name, g.id, g.total, g.rk FROM g JOIN customers c ON c.id = g.customer_id WHERE g.total = 767.64 AND g.rk = 5`);
show("cs-1423 id-partition rk of 767.64", `WITH best AS (SELECT customer_id, id, total, ROW_NUMBER() OVER (PARTITION BY id ORDER BY total DESC, id) AS rn FROM orders),
g AS (SELECT customer_id, id, total, RANK() OVER (ORDER BY total DESC) AS rk FROM best WHERE rn = 1)
SELECT c.name, g.id, g.total, g.rk FROM g JOIN customers c ON c.id = g.customer_id WHERE g.total = 767.64`);
show("cs-1423 status-partition variant", `WITH best AS (SELECT customer_id, id, total, ROW_NUMBER() OVER (PARTITION BY status ORDER BY total DESC, id) AS rn FROM orders),
g AS (SELECT customer_id, id, total, RANK() OVER (ORDER BY total DESC) AS rk FROM best WHERE rn = 1)
SELECT c.name, g.id, g.total, g.rk FROM g JOIN customers c ON c.id = g.customer_id WHERE g.total = 767.64 AND g.rk = 5`);
show("cs-1423 ASC variant", `WITH best AS (SELECT customer_id, id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) AS rn FROM orders),
g AS (SELECT customer_id, id, total, RANK() OVER (ORDER BY total ASC) AS rk FROM best WHERE rn = 1)
SELECT c.name, g.id, g.total, g.rk FROM g JOIN customers c ON c.id = g.customer_id WHERE g.total = 767.64 AND g.rk = 5`);
trap("cs-1423 PARTITION BY customer_id ASC", `WITH best AS (SELECT customer_id, id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ASC ORDER BY total DESC, id) AS rn FROM orders) SELECT customer_id FROM best LIMIT 1`);
trap("cs-1423 ORDER BY total id", `WITH best AS (SELECT customer_id, id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) AS rn FROM orders),
g AS (SELECT customer_id, id, total, RANK() OVER (ORDER BY total id) AS rk FROM best WHERE rn = 1) SELECT * FROM g LIMIT 1`);
trap("cs-1423 total = id (ambiguous col)", `WITH best AS (SELECT customer_id, id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) AS rn FROM orders),
g AS (SELECT customer_id, id, total, RANK() OVER (ORDER BY total DESC) AS rk FROM best WHERE rn = 1)
SELECT c.name, g.id, g.total, g.rk FROM g JOIN customers c ON c.id = g.customer_id WHERE g.total = id AND g.rk = 5`);
trap("cs-1423 status in direction", `WITH best AS (SELECT customer_id, id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) AS rn FROM orders),
g AS (SELECT customer_id, id, total, RANK() OVER (ORDER BY total status) AS rk FROM best WHERE rn = 1) SELECT * FROM g LIMIT 1`);
show("cs-1423 customers columns", `SELECT * FROM customers LIMIT 0`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe done, copy removed");
