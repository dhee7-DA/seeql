/// <reference types="bun-types" />
// m5-facts-w8b — per-fill verification for cases-w8b (cs-1481..1500).
// Pattern: copy db/custom.db → .m5w8b.db, bun:sqlite readonly, rmSync at end.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w8b.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

let n = 0;
function q(label: string, sql: string) {
  n++;
  try {
    console.log(`## ${label}\n   ${sql.replace(/\s+/g, " ").trim()}\n   ${JSON.stringify(db.query(sql).all())}`);
  } catch (e) {
    console.log(`## ${label}\n   ${sql.replace(/\s+/g, " ").trim()}\n   ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// cs-1481 ledger account census + painted 80
q("A1 census fill", `WITH c AS (SELECT account, COUNT(*) n, SUM(COUNT(*)) OVER () AS entries FROM ledger_entries GROUP BY account) SELECT account, n, entries FROM c WHERE account = 'operating_expenses' AND n = 14 AND entries = 80`);
q("A2 chip 'cash' in account", `WITH c AS (SELECT account, COUNT(*) n, SUM(COUNT(*)) OVER () AS entries FROM ledger_entries GROUP BY account) SELECT account, n, entries FROM c WHERE account = 'cash' AND n = 14 AND entries = 80`);
q("A3 chip 13/27 in n", `WITH c AS (SELECT account, COUNT(*) n, SUM(COUNT(*)) OVER () AS entries FROM ledger_entries GROUP BY account) SELECT account, n, entries FROM c WHERE account = 'operating_expenses' AND n = 27 AND entries = 80`);

// cs-1482 modal ship day
q("B1 fill", `WITH d AS (SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) AS days, COUNT(*) AS n, SUM(COUNT(*)) OVER () AS shipped_total FROM orders WHERE shipped_at IS NOT NULL GROUP BY days) SELECT days, n, shipped_total FROM d WHERE days = 3 AND n = 30`);
q("B2 chip IS NULL fence", `WITH d AS (SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) AS days, COUNT(*) AS n, SUM(COUNT(*)) OVER () AS shipped_total FROM orders WHERE shipped_at IS NULL GROUP BY days) SELECT days, n, shipped_total FROM d WHERE days = 3 AND n = 30`);
q("B3 chip 82 in days", `WITH d AS (SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) AS days, COUNT(*) AS n, SUM(COUNT(*)) OVER () AS shipped_total FROM orders WHERE shipped_at IS NOT NULL GROUP BY days) SELECT days, n, shipped_total FROM d WHERE days = 82 AND n = 30`);
q("B4 chip COUNT painter", `WITH d AS (SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) AS days, COUNT(*) AS n, COUNT(COUNT(*)) OVER () AS shipped_total FROM orders WHERE shipped_at IS NOT NULL GROUP BY days) SELECT days, n, shipped_total FROM d WHERE days = 3 AND n = 30`);

// cs-1483 running-mean rung
q("C1 fill", `WITH ladder AS (SELECT name, price, AVG(price) OVER (ORDER BY price, id) AS running FROM products) SELECT name, ROUND(running, 4) AS running FROM ladder WHERE name = 'Yoga Mat Eco 6mm' AND running = 22.62`);
q("C2 chip id-only order", `WITH ladder AS (SELECT name, price, AVG(price) OVER (ORDER BY id) AS running FROM products) SELECT name, ROUND(running, 4) AS running FROM ladder WHERE name = 'Yoga Mat Eco 6mm' AND running = 22.62`);
q("C3 chip 71.78 pin", `WITH ladder AS (SELECT name, price, AVG(price) OVER (ORDER BY price, id) AS running FROM products) SELECT name, ROUND(running, 4) AS running FROM ladder WHERE name = 'Yoga Mat Eco 6mm' AND running = 71.78`);
q("C4 chip 71.78 in ORDER BY", `WITH ladder AS (SELECT name, price, AVG(price) OVER (ORDER BY 71.78) AS running FROM products) SELECT name, ROUND(running, 4) AS running FROM ladder WHERE name = 'Yoga Mat Eco 6mm' AND running = 22.62`);

// cs-1484 unshipped aging walk
q("D1 fill 2024-10", `WITH u AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders WHERE shipped_at IS NULL GROUP BY mon), r AS (SELECT mon, n, SUM(n) OVER (ORDER BY mon) AS aging FROM u) SELECT mon, n, aging FROM r WHERE mon = '2024-10' AND aging = 14`);
q("D2 chip NOT NULL at 2024-10", `WITH u AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders WHERE shipped_at IS NOT NULL GROUP BY mon), r AS (SELECT mon, n, SUM(n) OVER (ORDER BY mon) AS aging FROM u) SELECT mon, n, aging FROM r WHERE mon = '2024-10' AND aging = 14`);
q("D3 chip 17 pin", `WITH u AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders WHERE shipped_at IS NULL GROUP BY mon), r AS (SELECT mon, n, SUM(n) OVER (ORDER BY mon) AS aging FROM u) SELECT mon, n, aging FROM r WHERE mon = '2024-10' AND aging = 17`);
q("D4 chip '2024-11' mon", `WITH u AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders WHERE shipped_at IS NULL GROUP BY mon), r AS (SELECT mon, n, SUM(n) OVER (ORDER BY mon) AS aging FROM u) SELECT mon, n, aging FROM r WHERE mon = '2024-11' AND aging = 14`);

// cs-1485 spend tiles
q("E1 fill", `WITH s AS (SELECT c.id cid, SUM(o.total) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id), t AS (SELECT spend, NTILE(4) OVER (ORDER BY spend DESC) AS band FROM s), x AS (SELECT band, COUNT(*) AS n, ROUND(SUM(spend),2) AS tile_spend, ROUND(100.0*SUM(spend)/SUM(SUM(spend)) OVER (),1) AS pct FROM t GROUP BY band) SELECT band, n, tile_spend, pct FROM x WHERE band = 1 AND pct = 63.5`);
q("E2 chip 3 NTILE", `WITH s AS (SELECT c.id cid, SUM(o.total) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id), t AS (SELECT spend, NTILE(3) OVER (ORDER BY spend DESC) AS band FROM s), x AS (SELECT band, COUNT(*) AS n, ROUND(SUM(spend),2) AS tile_spend, ROUND(100.0*SUM(spend)/SUM(SUM(spend)) OVER (),1) AS pct FROM t GROUP BY band) SELECT band, n, tile_spend, pct FROM x WHERE band = 1 AND pct = 63.5`);
q("E3 chip AVG(o.total) fold", `WITH s AS (SELECT c.id cid, AVG(o.total) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id), t AS (SELECT spend, NTILE(4) OVER (ORDER BY spend DESC) AS band FROM s), x AS (SELECT band, COUNT(*) AS n, ROUND(SUM(spend),2) AS tile_spend, ROUND(100.0*SUM(spend)/SUM(SUM(spend)) OVER (),1) AS pct FROM t GROUP BY band) SELECT band, n, tile_spend, pct FROM x WHERE band = 1 AND pct = 63.5`);
q("E4 chip 2 band", `WITH s AS (SELECT c.id cid, SUM(o.total) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id), t AS (SELECT spend, NTILE(4) OVER (ORDER BY spend DESC) AS band FROM s), x AS (SELECT band, COUNT(*) AS n, ROUND(SUM(spend),2) AS tile_spend, ROUND(100.0*SUM(spend)/SUM(SUM(spend)) OVER (),1) AS pct FROM t GROUP BY band) SELECT band, n, tile_spend, pct FROM x WHERE band = 2 AND pct = 63.5`);
q("E5 chip 63.5 in fold", `WITH s AS (SELECT c.id cid, 63.5 AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id), t AS (SELECT spend, NTILE(4) OVER (ORDER BY spend DESC) AS band FROM s), x AS (SELECT band, COUNT(*) AS n, ROUND(SUM(spend),2) AS tile_spend, ROUND(100.0*SUM(spend)/SUM(SUM(spend)) OVER (),1) AS pct FROM t GROUP BY band) SELECT band, n, tile_spend, pct FROM x WHERE band = 1 AND pct = 63.5`);

// cs-1486 supplier three-SKU tie
q("F1 fill", `WITH f AS (SELECT s.name AS name, COUNT(*) AS n FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), r AS (SELECT name, n, RANK() OVER (ORDER BY n DESC) AS rk FROM f) SELECT name, n, rk FROM r WHERE n = 3`);
q("F2 chip ASC", `WITH f AS (SELECT s.name AS name, COUNT(*) AS n FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), r AS (SELECT name, n, RANK() OVER (ORDER BY n ASC) AS rk FROM f) SELECT name, n, rk FROM r WHERE n = 3`);
q("F3 chip 2 in n-pin", `WITH f AS (SELECT s.name AS name, COUNT(*) AS n FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), r AS (SELECT name, n, RANK() OVER (ORDER BY n DESC) AS rk FROM f) SELECT name, n, rk FROM r WHERE n = 2`);
q("F4 chip SUM(p.price) fold", `WITH f AS (SELECT s.name AS name, SUM(p.price) AS n FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), r AS (SELECT name, n, RANK() OVER (ORDER BY n DESC) AS rk FROM f) SELECT name, n, rk FROM r WHERE n = 3`);
q("F5 chip 2 const fold", `WITH f AS (SELECT s.name AS name, 2 AS n FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), r AS (SELECT name, n, RANK() OVER (ORDER BY n DESC) AS rk FROM f) SELECT name, n, rk FROM r WHERE n = 3`);

// cs-1487 ledger zero landing
q("G1 fill", `WITH r AS (SELECT entry_date, id, ROUND(SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) AS bal FROM ledger_entries) SELECT id, entry_date, bal FROM r WHERE id = 80 AND bal = 0`);
q("G2 chip MAX paint", `WITH r AS (SELECT entry_date, id, ROUND(MAX(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) AS bal FROM ledger_entries) SELECT id, entry_date, bal FROM r WHERE id = 80 AND bal = 0`);
q("G3 chip 79", `WITH r AS (SELECT entry_date, id, ROUND(SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) AS bal FROM ledger_entries) SELECT id, entry_date, bal FROM r WHERE id = 79 AND bal = 0`);
q("G4 chip 7076 pin", `WITH r AS (SELECT entry_date, id, ROUND(SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100.0, 2) AS bal FROM ledger_entries) SELECT id, entry_date, bal FROM r WHERE id = 80 AND bal = 7076`);

// cs-1488 receipt fold that shrank
q("H1 fill staged 36", `WITH f AS (SELECT category, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0, 2) AS total, SUM(COUNT(*)) OVER () AS receipts FROM expenses GROUP BY category) SELECT category, n, total, receipts FROM f WHERE category = 'Rent' AND total = 16800 AND receipts = 36`);
q("H2 chip COUNT painter 4", `WITH f AS (SELECT category, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0, 2) AS total, COUNT(COUNT(*)) OVER () AS receipts FROM expenses GROUP BY category) SELECT category, n, total, receipts FROM f WHERE category = 'Rent' AND total = 16800 AND receipts = 36`);
q("H3 chip MAX painter 14", `WITH f AS (SELECT category, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0, 2) AS total, MAX(COUNT(*)) OVER () AS receipts FROM expenses GROUP BY category) SELECT category, n, total, receipts FROM f WHERE category = 'Rent' AND total = 16800 AND receipts = 36`);
q("H4 chip 14 in receipts pin", `WITH f AS (SELECT category, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0, 2) AS total, SUM(COUNT(*)) OVER () AS receipts FROM expenses GROUP BY category) SELECT category, n, total, receipts FROM f WHERE category = 'Rent' AND total = 16800 AND receipts = 14`);
q("H5 the shrunken one-liner", `SELECT category, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0, 2) AS total, SUM(COUNT(*)) OVER () AS receipts FROM expenses GROUP BY category HAVING total = 16800`);

// cs-1489 cohort staircase
q("I1 fill", `WITH f AS (SELECT customer_id, MIN(created_at) AS first_order FROM orders GROUP BY customer_id), c AS (SELECT strftime('%Y-%m', first_order) AS cohort, COUNT(*) AS n FROM f GROUP BY cohort), s AS (SELECT cohort, n, SUM(n) OVER (ORDER BY cohort) AS cum FROM c) SELECT cohort, n, cum FROM s WHERE cohort = '2025-01' AND cum = 16`);
q("I2 chip shipped_at", `WITH f AS (SELECT customer_id, MIN(shipped_at) AS first_order FROM orders GROUP BY customer_id), c AS (SELECT strftime('%Y-%m', first_order) AS cohort, COUNT(*) AS n FROM f GROUP BY cohort), s AS (SELECT cohort, n, SUM(n) OVER (ORDER BY cohort) AS cum FROM c) SELECT cohort, n, cum FROM s WHERE cohort = '2025-01' AND cum = 16`);
q("I3 chip total", `WITH f AS (SELECT customer_id, MIN(total) AS first_order FROM orders GROUP BY customer_id), c AS (SELECT strftime('%Y-%m', first_order) AS cohort, COUNT(*) AS n FROM f GROUP BY cohort), s AS (SELECT cohort, n, SUM(n) OVER (ORDER BY cohort) AS cum FROM c) SELECT cohort, n, cum FROM s WHERE cohort = '2025-01' AND cum = 16`);
q("I4 chip 15 pin", `WITH f AS (SELECT customer_id, MIN(created_at) AS first_order FROM orders GROUP BY customer_id), c AS (SELECT strftime('%Y-%m', first_order) AS cohort, COUNT(*) AS n FROM f GROUP BY cohort), s AS (SELECT cohort, n, SUM(n) OVER (ORDER BY cohort) AS cum FROM c) SELECT cohort, n, cum FROM s WHERE cohort = '2025-01' AND cum = 15`);
q("I5 chip '2024-11'", `WITH f AS (SELECT customer_id, MIN(created_at) AS first_order FROM orders GROUP BY customer_id), c AS (SELECT strftime('%Y-%m', first_order) AS cohort, COUNT(*) AS n FROM f GROUP BY cohort), s AS (SELECT cohort, n, SUM(n) OVER (ORDER BY cohort) AS cum FROM c) SELECT cohort, n, cum FROM s WHERE cohort = '2024-11' AND cum = 16`);

// cs-1490 one-line close
q("J1 fill", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS running FROM orders GROUP BY mon) SELECT mon, running FROM m WHERE mon = '2025-02' AND running = 34833.28`);
q("J2 chip COUNT painter", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(COUNT(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS running FROM orders GROUP BY mon) SELECT mon, running FROM m WHERE mon = '2025-02' AND running = 34833.28`);
q("J3 chip ROUND painter", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(ROUND(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS running FROM orders GROUP BY mon) SELECT mon, running FROM m WHERE mon = '2025-02' AND running = 34833.28`);
q("J4 chip mon in ORDER BY", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(SUM(total)) OVER (ORDER BY mon), 2) AS running FROM orders GROUP BY mon) SELECT mon, running FROM m WHERE mon = '2025-02' AND running = 34833.28`);
q("J5 chip created_at in ORDER BY", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(SUM(total)) OVER (ORDER BY created_at), 2) AS running FROM orders GROUP BY mon) SELECT mon, running FROM m WHERE mon = '2025-02' AND running = 34833.28`);
q("J6 chip total in ORDER BY", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(SUM(total)) OVER (ORDER BY total), 2) AS running FROM orders GROUP BY mon) SELECT mon, running FROM m WHERE mon = '2025-02' AND running = 34833.28`);
q("J7 chip AVG painter", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(AVG(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS running FROM orders GROUP BY mon) SELECT mon, running FROM m WHERE mon = '2025-02' AND running = 34833.28`);

// cs-1491 supplier value shadow
q("K1 fill", `WITH v AS (SELECT s.name AS name, ROUND(SUM(p.price), 2) AS value FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), l AS (SELECT name, value, RANK() OVER (ORDER BY value DESC) AS rk, LAG(value) OVER (ORDER BY value DESC) AS prev FROM v) SELECT name, value, rk, prev FROM l WHERE name = 'Midwest Hardware Co' AND rk = 2 AND prev = 418.98`);
q("K2 chip LEAD", `WITH v AS (SELECT s.name AS name, ROUND(SUM(p.price), 2) AS value FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), l AS (SELECT name, value, RANK() OVER (ORDER BY value DESC) AS rk, LEAD(value) OVER (ORDER BY value DESC) AS prev FROM v) SELECT name, value, rk, prev FROM l WHERE name = 'Midwest Hardware Co' AND rk = 2 AND prev = 418.98`);
q("K3 chip 224.49 prev", `WITH v AS (SELECT s.name AS name, ROUND(SUM(p.price), 2) AS value FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), l AS (SELECT name, value, RANK() OVER (ORDER BY value DESC) AS rk, LAG(value) OVER (ORDER BY value DESC) AS prev FROM v) SELECT name, value, rk, prev FROM l WHERE name = 'Midwest Hardware Co' AND rk = 2 AND prev = 224.49`);
q("K4 chip 3 rk", `WITH v AS (SELECT s.name AS name, ROUND(SUM(p.price), 2) AS value FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), l AS (SELECT name, value, RANK() OVER (ORDER BY value DESC) AS rk, LAG(value) OVER (ORDER BY value DESC) AS prev FROM v) SELECT name, value, rk, prev FROM l WHERE name = 'Midwest Hardware Co' AND rk = 3 AND prev = 418.98`);
q("K5 chip Nordic name", `WITH v AS (SELECT s.name AS name, ROUND(SUM(p.price), 2) AS value FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), l AS (SELECT name, value, RANK() OVER (ORDER BY value DESC) AS rk, LAG(value) OVER (ORDER BY value DESC) AS prev FROM v) SELECT name, value, rk, prev FROM l WHERE name = 'Nordic Gadgets AB' AND rk = 2 AND prev = 418.98`);
q("K6 chip 224.49 const value", `WITH v AS (SELECT s.name AS name, ROUND(224.49, 2) AS value FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), l AS (SELECT name, value, RANK() OVER (ORDER BY value DESC) AS rk, LAG(value) OVER (ORDER BY value DESC) AS prev FROM v) SELECT name, value, rk, prev FROM l WHERE name = 'Midwest Hardware Co' AND rk = 2 AND prev = 418.98`);

// cs-1492 unfulfilled pile
q("L1 fill", `SELECT status, COUNT(*) AS n, ROUND(SUM(SUM(total)) OVER (), 2) AS unfulfilled_pot FROM orders WHERE shipped_at IS NULL GROUP BY status HAVING COUNT(*) = 7 OR COUNT(*) = 14`);
q("L2 chip AVG paint", `SELECT status, COUNT(*) AS n, ROUND(AVG(SUM(total)) OVER (), 2) AS unfulfilled_pot FROM orders WHERE shipped_at IS NULL GROUP BY status HAVING COUNT(*) = 7 OR COUNT(*) = 14`);
q("L3 chip MAX paint", `SELECT status, COUNT(*) AS n, ROUND(MAX(SUM(total)) OVER (), 2) AS unfulfilled_pot FROM orders WHERE shipped_at IS NULL GROUP BY status HAVING COUNT(*) = 7 OR COUNT(*) = 14`);
q("L4 chip NOT NULL", `SELECT status, COUNT(*) AS n, ROUND(SUM(SUM(total)) OVER (), 2) AS unfulfilled_pot FROM orders WHERE shipped_at IS NOT NULL GROUP BY status HAVING COUNT(*) = 7 OR COUNT(*) = 14`);
q("L5 chip COUNT paint", `SELECT status, COUNT(*) AS n, ROUND(COUNT(SUM(total)) OVER (), 2) AS unfulfilled_pot FROM orders WHERE shipped_at IS NULL GROUP BY status HAVING COUNT(*) = 7 OR COUNT(*) = 14`);
q("L6 chip 14 in first pin", `SELECT status, COUNT(*) AS n, ROUND(SUM(SUM(total)) OVER (), 2) AS unfulfilled_pot FROM orders WHERE shipped_at IS NULL GROUP BY status HAVING COUNT(*) = 14 OR COUNT(*) = 14`);
q("L7 chip NULL const n", `SELECT status, NULL AS n, ROUND(SUM(SUM(total)) OVER (), 2) AS unfulfilled_pot FROM orders WHERE shipped_at IS NULL GROUP BY status HAVING COUNT(*) = 7 OR COUNT(*) = 14`);

// cs-1493 price bands
q("M1 fill", `WITH t AS (SELECT price, NTILE(4) OVER (ORDER BY price DESC) AS band FROM products), s AS (SELECT band, ROUND(SUM(price),2) AS tile_price, ROUND(100.0*SUM(price)/SUM(SUM(price)) OVER (),1) AS pct FROM t GROUP BY band) SELECT band, tile_price, pct FROM s WHERE band = 1 AND tile_price = 597.98 AND pct = 52.1`);
q("M2 chip ASC", `WITH t AS (SELECT price, NTILE(4) OVER (ORDER BY price ASC) AS band FROM products), s AS (SELECT band, ROUND(SUM(price),2) AS tile_price, ROUND(100.0*SUM(price)/SUM(SUM(price)) OVER (),1) AS pct FROM t GROUP BY band) SELECT band, tile_price, pct FROM s WHERE band = 1 AND tile_price = 597.98 AND pct = 52.1`);
q("M3 chip MAX painter", `WITH t AS (SELECT price, NTILE(4) OVER (ORDER BY price DESC) AS band FROM products), s AS (SELECT band, ROUND(SUM(price),2) AS tile_price, ROUND(100.0*SUM(price)/MAX(SUM(price)) OVER (),1) AS pct FROM t GROUP BY band) SELECT band, tile_price, pct FROM s WHERE band = 1 AND tile_price = 597.98 AND pct = 52.1`);
q("M4 chip AVG painter", `WITH t AS (SELECT price, NTILE(4) OVER (ORDER BY price DESC) AS band FROM products), s AS (SELECT band, ROUND(SUM(price),2) AS tile_price, ROUND(100.0*SUM(price)/AVG(SUM(price)) OVER (),1) AS pct FROM t GROUP BY band) SELECT band, tile_price, pct FROM s WHERE band = 1 AND tile_price = 597.98 AND pct = 52.1`);
q("M5 chip 2 band", `WITH t AS (SELECT price, NTILE(4) OVER (ORDER BY price DESC) AS band FROM products), s AS (SELECT band, ROUND(SUM(price),2) AS tile_price, ROUND(100.0*SUM(price)/SUM(SUM(price)) OVER (),1) AS pct FROM t GROUP BY band) SELECT band, tile_price, pct FROM s WHERE band = 2 AND tile_price = 597.98 AND pct = 52.1`);

// cs-1494 invoice year stack
q("N1 fill", `WITH y AS (SELECT CAST(SUBSTR(number, 5, 4) AS INTEGER) AS yr FROM invoices), f AS (SELECT yr, COUNT(*) AS n, SUM(COUNT(*)) OVER (ORDER BY yr) AS running, SUM(COUNT(*)) OVER () AS stack FROM y GROUP BY yr) SELECT yr, n, running, stack FROM f WHERE yr = 2025 AND n = 5 AND stack = 28`);
q("N2 chip COUNT painter", `WITH y AS (SELECT CAST(SUBSTR(number, 5, 4) AS INTEGER) AS yr FROM invoices), f AS (SELECT yr, COUNT(*) AS n, SUM(COUNT(*)) OVER (ORDER BY yr) AS running, COUNT(COUNT(*)) OVER () AS stack FROM y GROUP BY yr) SELECT yr, n, running, stack FROM f WHERE yr = 2025 AND n = 5 AND stack = 28`);
q("N3 chip 2024 yr", `WITH y AS (SELECT CAST(SUBSTR(number, 5, 4) AS INTEGER) AS yr FROM invoices), f AS (SELECT yr, COUNT(*) AS n, SUM(COUNT(*)) OVER (ORDER BY yr) AS running, SUM(COUNT(*)) OVER () AS stack FROM y GROUP BY yr) SELECT yr, n, running, stack FROM f WHERE yr = 2024 AND n = 5 AND stack = 28`);
q("N4 chip 23 n", `WITH y AS (SELECT CAST(SUBSTR(number, 5, 4) AS INTEGER) AS yr FROM invoices), f AS (SELECT yr, COUNT(*) AS n, SUM(COUNT(*)) OVER (ORDER BY yr) AS running, SUM(COUNT(*)) OVER () AS stack FROM y GROUP BY yr) SELECT yr, n, running, stack FROM f WHERE yr = 2025 AND n = 23 AND stack = 28`);

// cs-1495 waiting pile
q("O1 fill", `WITH c AS (SELECT status, COUNT(*) AS n, SUM(shipped_at IS NULL) AS waiting, SUM(COUNT(*)) OVER () AS fleet FROM orders GROUP BY status) SELECT status, n, waiting, fleet FROM c WHERE status = 'pending' AND waiting = 14`);
q("O2 chip MAX paint", `WITH c AS (SELECT status, COUNT(*) AS n, SUM(shipped_at IS NULL) AS waiting, MAX(COUNT(*)) OVER () AS fleet FROM orders GROUP BY status) SELECT status, n, waiting, fleet FROM c WHERE status = 'pending' AND waiting = 14`);
q("O3 chip COUNT paint", `WITH c AS (SELECT status, COUNT(*) AS n, SUM(shipped_at IS NULL) AS waiting, COUNT(COUNT(*)) OVER () AS fleet FROM orders GROUP BY status) SELECT status, n, waiting, fleet FROM c WHERE status = 'pending' AND waiting = 14`);
q("O4 chip COUNT(shipped_at) waiting", `WITH c AS (SELECT status, COUNT(*) AS n, COUNT(shipped_at) AS waiting, SUM(COUNT(*)) OVER () AS fleet FROM orders GROUP BY status) SELECT status, n, waiting, fleet FROM c WHERE status = 'pending' AND waiting = 14`);
q("O5 chip 52 const n", `WITH c AS (SELECT status, 52 AS n, SUM(shipped_at IS NULL) AS waiting, SUM(COUNT(*)) OVER () AS fleet FROM orders GROUP BY status) SELECT status, n, waiting, fleet FROM c WHERE status = 'pending' AND waiting = 14`);
q("O6 chip 'shipped' status", `WITH c AS (SELECT status, COUNT(*) AS n, SUM(shipped_at IS NULL) AS waiting, SUM(COUNT(*)) OVER () AS fleet FROM orders GROUP BY status) SELECT status, n, waiting, fleet FROM c WHERE status = 'shipped' AND waiting = 14`);

// cs-1496 AR foot
q("P1 fill", `WITH a AS (SELECT account, ROUND(SUM(debit_cents)/100.0, 2) AS deb, COUNT(*) AS n FROM ledger_entries WHERE debit_cents > 0 GROUP BY account) SELECT account, deb, n, SUM(n) OVER () AS postings FROM a WHERE account = 'accounts_receivable' AND deb = 86052`);
q("P2 chip MAX(debit_cents)", `WITH a AS (SELECT account, ROUND(MAX(debit_cents)/100.0, 2) AS deb, COUNT(*) AS n FROM ledger_entries WHERE debit_cents > 0 GROUP BY account) SELECT account, deb, n, SUM(n) OVER () AS postings FROM a WHERE account = 'accounts_receivable' AND deb = 86052`);
q("P3 chip 'cash'", `WITH a AS (SELECT account, ROUND(SUM(debit_cents)/100.0, 2) AS deb, COUNT(*) AS n FROM ledger_entries WHERE debit_cents > 0 GROUP BY account) SELECT account, deb, n, SUM(n) OVER () AS postings FROM a WHERE account = 'cash' AND deb = 86052`);
q("P4 chip 13 deb", `WITH a AS (SELECT account, ROUND(SUM(debit_cents)/100.0, 2) AS deb, COUNT(*) AS n FROM ledger_entries WHERE debit_cents > 0 GROUP BY account) SELECT account, deb, n, SUM(n) OVER () AS postings FROM a WHERE account = 'accounts_receivable' AND deb = 13`);

// cs-1497 budget band
q("Q1 fill", `WITH b AS (SELECT price, NTILE(4) OVER (ORDER BY price DESC) AS band FROM products) SELECT band, COUNT(*) AS n, MIN(price) AS lo, MAX(price) AS hi FROM b GROUP BY band HAVING MIN(price) = 14.99 AND MAX(price) = 32 AND COUNT(*) = 4`);
q("Q2 chip ASC", `WITH b AS (SELECT price, NTILE(4) OVER (ORDER BY price ASC) AS band FROM products) SELECT band, COUNT(*) AS n, MIN(price) AS lo, MAX(price) AS hi FROM b GROUP BY band HAVING MIN(price) = 14.99 AND MAX(price) = 32 AND COUNT(*) = 4`);
q("Q3 chip 119 lo", `WITH b AS (SELECT price, NTILE(4) OVER (ORDER BY price DESC) AS band FROM products) SELECT band, COUNT(*) AS n, MIN(price) AS lo, MAX(price) AS hi FROM b GROUP BY band HAVING MIN(price) = 119 AND MAX(price) = 32 AND COUNT(*) = 4`);
q("Q4 chip 5 count", `WITH b AS (SELECT price, NTILE(4) OVER (ORDER BY price DESC) AS band FROM products) SELECT band, COUNT(*) AS n, MIN(price) AS lo, MAX(price) AS hi FROM b GROUP BY band HAVING MIN(price) = 14.99 AND MAX(price) = 32 AND COUNT(*) = 5`);

// cs-1498 leaky bucket
q("R1 fill", `SELECT c.name, ROUND(SUM(o.total), 2) AS exposure, ROUND(SUM(SUM(o.total)) OVER (), 2) AS leak_pot FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status IN ('pending','cancelled') GROUP BY c.id HAVING exposure = 1615.29`);
q("R2 chip shipped,delivered", `SELECT c.name, ROUND(SUM(o.total), 2) AS exposure, ROUND(SUM(SUM(o.total)) OVER (), 2) AS leak_pot FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status IN ('shipped','delivered') GROUP BY c.id HAVING exposure = 1615.29`);
q("R3 chip COUNT(o.total) fold", `SELECT c.name, ROUND(COUNT(o.total), 2) AS exposure, ROUND(SUM(SUM(o.total)) OVER (), 2) AS leak_pot FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status IN ('pending','cancelled') GROUP BY c.id HAVING exposure = 1615.29`);
q("R4 chip AVG(o.total) fold", `SELECT c.name, ROUND(AVG(o.total), 2) AS exposure, ROUND(SUM(SUM(o.total)) OVER (), 2) AS leak_pot FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status IN ('pending','cancelled') GROUP BY c.id HAVING exposure = 1615.29`);
q("R5 chip MAX(o.total) fold", `SELECT c.name, ROUND(MAX(o.total), 2) AS exposure, ROUND(SUM(SUM(o.total)) OVER (), 2) AS leak_pot FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status IN ('pending','cancelled') GROUP BY c.id HAVING exposure = 1615.29`);
q("R6 chip COUNT paint", `SELECT c.name, ROUND(SUM(o.total), 2) AS exposure, ROUND(COUNT(SUM(o.total)) OVER (), 2) AS leak_pot FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status IN ('pending','cancelled') GROUP BY c.id HAVING exposure = 1615.29`);

// cs-1499 below-mean extremes
q("S1 fill", `WITH k AS (SELECT name, stock, ROUND(AVG(stock) OVER (), 1) AS avg_stock FROM products), f AS (SELECT name, stock, avg_stock, ROUND(stock - avg_stock, 1) AS gap FROM k WHERE stock < avg_stock) SELECT COUNT(*) AS below, MIN(gap) AS worst, MAX(gap) AS shallowest FROM f`);
q("S2 chip SUM paint", `WITH k AS (SELECT name, stock, ROUND(SUM(stock) OVER (), 1) AS avg_stock FROM products), f AS (SELECT name, stock, avg_stock, ROUND(stock - avg_stock, 1) AS gap FROM k WHERE stock < avg_stock) SELECT COUNT(*) AS below, MIN(gap) AS worst, MAX(gap) AS shallowest FROM f`);
q("S3 chip MAX worst", `WITH k AS (SELECT name, stock, ROUND(AVG(stock) OVER (), 1) AS avg_stock FROM products), f AS (SELECT name, stock, avg_stock, ROUND(stock - avg_stock, 1) AS gap FROM k WHERE stock < avg_stock) SELECT COUNT(*) AS below, MAX(gap) AS worst, MAX(gap) AS shallowest FROM f`);
q("S4 chip > fence", `WITH k AS (SELECT name, stock, ROUND(AVG(stock) OVER (), 1) AS avg_stock FROM products), f AS (SELECT name, stock, avg_stock, ROUND(stock - avg_stock, 1) AS gap FROM k WHERE stock > avg_stock) SELECT COUNT(*) AS below, MIN(gap) AS worst, MAX(gap) AS shallowest FROM f`);
q("S5 chip 9 const worst", `WITH k AS (SELECT name, stock, ROUND(AVG(stock) OVER (), 1) AS avg_stock FROM products), f AS (SELECT name, stock, avg_stock, ROUND(stock - avg_stock, 1) AS gap FROM k WHERE stock < avg_stock) SELECT COUNT(*) AS below, 9 AS worst, MAX(gap) AS shallowest FROM f`);

// cs-1500 calendar dealing flip
q("T1 fill ASC", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon), t AS (SELECT mon, rev, NTILE(4) OVER (ORDER BY mon ASC) AS band FROM m), s AS (SELECT band, ROUND(SUM(rev),2) AS band_spend FROM t GROUP BY band) SELECT band, band_spend FROM s WHERE band = 1 AND band_spend = 12427.6`);
q("T2 chip DESC", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon), t AS (SELECT mon, rev, NTILE(4) OVER (ORDER BY mon DESC) AS band FROM m), s AS (SELECT band, ROUND(SUM(rev),2) AS band_spend FROM t GROUP BY band) SELECT band, band_spend FROM s WHERE band = 1 AND band_spend = 12427.6`);
q("T3 chip 3 NTILE", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon), t AS (SELECT mon, rev, NTILE(3) OVER (ORDER BY mon ASC) AS band FROM m), s AS (SELECT band, ROUND(SUM(rev),2) AS band_spend FROM t GROUP BY band) SELECT band, band_spend FROM s WHERE band = 1 AND band_spend = 12427.6`);
q("T4 chip AVG paint", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon), t AS (SELECT mon, rev, NTILE(4) OVER (ORDER BY mon ASC) AS band FROM m), s AS (SELECT band, ROUND(AVG(rev),2) AS band_spend FROM t GROUP BY band) SELECT band, band_spend FROM s WHERE band = 1 AND band_spend = 12427.6`);

// extras for prose
q("U1 ledger entries total", `SELECT COUNT(*) n FROM ledger_entries`);
q("U2 ship day census", `WITH d AS (SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) AS days, COUNT(*) AS n FROM orders WHERE shipped_at IS NOT NULL GROUP BY days) SELECT days, n FROM d ORDER BY n DESC, days LIMIT 5`);

// round two — replacement distractor landings
q("I6 chip MAX in MIN(created_at)", `WITH f AS (SELECT customer_id, MIN(MAX) AS first_order FROM orders GROUP BY customer_id), c AS (SELECT strftime('%Y-%m', first_order) AS cohort, COUNT(*) AS n FROM f GROUP BY cohort), s AS (SELECT cohort, n, SUM(n) OVER (ORDER BY cohort) AS cum FROM c) SELECT cohort, n, cum FROM s WHERE cohort = '2025-01' AND cum = 16`);
q("I7 chip 15 const first_order", `WITH f AS (SELECT customer_id, MIN(15) AS first_order FROM orders GROUP BY customer_id), c AS (SELECT strftime('%Y-%m', first_order) AS cohort, COUNT(*) AS n FROM f GROUP BY cohort), s AS (SELECT cohort, n, SUM(n) OVER (ORDER BY cohort) AS cum FROM c) SELECT cohort, n, cum FROM s WHERE cohort = '2025-01' AND cum = 16`);
q("J8 chip COUNT(total) inner fold", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(COUNT(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS running FROM orders GROUP BY mon) SELECT mon, running FROM m WHERE mon = '2025-02' AND running = 34833.28`);
q("J9 chip COUNT(total) in ORDER BY", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(SUM(total)) OVER (ORDER BY COUNT(total)), 2) AS running FROM orders GROUP BY mon) SELECT mon, running FROM m WHERE mon = '2025-02' AND running = 34833.28`);
q("V1 chip ASC into 1483 order", `WITH ladder AS (SELECT name, price, AVG(price) OVER (ORDER BY price, id ASC) AS running FROM products) SELECT name, ROUND(running, 4) AS running FROM ladder WHERE name = 'Yoga Mat Eco 6mm' AND running = 22.62`);
db.close();
rmSync(".m5w8b.db", { force: true });
