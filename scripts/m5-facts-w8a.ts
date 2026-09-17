// M5-W8A probe — extra engine-verified landings for the w8 first-half wave
// (cs-1461…cs-1480): distractor consequences and painter variants that the
// committed m5-facts-w8.out sheet does not carry. Same self-deleting COPY
// pattern: works on a read-only COPY of db/custom.db, removes .m5w8a.db on exit.
// Run: bun scripts/m5-facts-w8a.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const TMP = ".m5w8a.db";
rmSync(TMP, { force: true });
copyFileSync("db/custom.db", TMP);
const db = new Database(TMP, { readonly: true });

console.log("SQLite", (db.prepare("SELECT sqlite_version() AS v").get() as any).v);

const q = (label: string, sql: string) => {
  console.log(`\n## ${label}\n   ${sql.replace(/\s+/g, " ")}`);
  try {
    const rows = db.prepare(sql).all();
    console.log("   " + JSON.stringify(rows));
  } catch (e) {
    console.log("   ERROR: " + (e as Error).message);
  }
};

// cs-1461 close calendar: the December rung the wrong month pin would grab
q("calendar rung 2024-12", `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon), r AS (SELECT mon, rev, SUM(rev) OVER (ORDER BY mon) AS running FROM m) SELECT mon, ROUND(rev,2) rev, ROUND(running,2) running FROM r WHERE mon='2024-12'`);

// cs-1462 runner-up: LAG under ASC for Emma (window over the full fold, pin after)
q("emma LAG under ASC staged", `WITH s AS (SELECT c.name name, ROUND(SUM(o.total),2) spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id), l AS (SELECT name, spend, LAG(spend) OVER (ORDER BY spend ASC) prev FROM s) SELECT * FROM l WHERE name='Emma Wilson'`);

// cs-1463 exposure ladders under the wrong status pools
q("exposure pending-only ladder", `WITH e AS (SELECT c.name name, ROUND(SUM(o.total),2) exposure FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status IN ('pending') GROUP BY c.id) SELECT name, exposure, RANK() OVER (ORDER BY exposure DESC) rk FROM e ORDER BY rk`);
q("exposure pending+shipped farid", `WITH e AS (SELECT c.name name, ROUND(SUM(o.total),2) exposure FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status IN ('pending','shipped') GROUP BY c.id) SELECT name, exposure, RANK() OVER (ORDER BY exposure DESC) rk FROM e WHERE name='Farid Nasser'`);

// cs-1464 length wall: ASC rung for the 23-char name
q("noise ASC length rank", `WITH w AS (SELECT name, LENGTH(name) len, RANK() OVER (ORDER BY LENGTH(name) ASC) rk, COUNT(*) OVER () shelf FROM products) SELECT name, len, rk, shelf FROM w WHERE name='Noise-Canceling Headset'`);

// cs-1466 rating tiles: bands paint + NTILE(2) landing + NTILE(3) census
q("rating NTILE3 bands paint", `WITH b AS (SELECT rating, NTILE(3) OVER (ORDER BY rating DESC) band FROM suppliers), x AS (SELECT band, COUNT(*) n, MIN(rating) lo, MAX(rating) hi, COUNT(*) OVER () bands FROM b GROUP BY band) SELECT * FROM x ORDER BY band`);
q("rating NTILE2 DESC", `WITH b AS (SELECT rating, NTILE(2) OVER (ORDER BY rating DESC) band FROM suppliers), x AS (SELECT band, COUNT(*) n, MIN(rating) lo, MAX(rating) hi, COUNT(*) OVER () bands FROM b GROUP BY band) SELECT * FROM x ORDER BY band`);

// cs-1467 ship-day census + wrong group key + wrong modal count
q("ship day census full", `WITH d AS (SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) days, COUNT(*) n, SUM(COUNT(*)) OVER () shipped_total FROM orders WHERE shipped_at IS NOT NULL GROUP BY days) SELECT * FROM d ORDER BY days`);
q("ship day group by created_at", `WITH d AS (SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) days, COUNT(*) n, SUM(COUNT(*)) OVER () shipped_total FROM orders WHERE shipped_at IS NOT NULL GROUP BY created_at) SELECT COUNT(*) buckets FROM d`);
q("ship day bucket n 21 check", `WITH d AS (SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) days, COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL GROUP BY days) SELECT COUNT(*) hits FROM d WHERE n = 21`);

// cs-1471 unshipped fold: MAX paint + wrong HAVING count
q("unshipped fold MAX paint", `SELECT status, COUNT(*) n, ROUND(MAX(SUM(total)) OVER (),2) pot FROM orders WHERE shipped_at IS NULL GROUP BY status HAVING COUNT(*) = 7 OR COUNT(*) = 14`);
q("unshipped fold having 21", `SELECT status, COUNT(*) n, ROUND(SUM(SUM(total)) OVER (),2) pot FROM orders WHERE shipped_at IS NULL GROUP BY status HAVING COUNT(*) = 7 OR COUNT(*) = 21`);

// cs-1472 aging: COUNT painter at 2024-10
q("aging COUNT painter 2024-10", `WITH u AS (SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM orders WHERE shipped_at IS NULL GROUP BY mon), r AS (SELECT mon, n, COUNT(n) OVER (ORDER BY mon) aging FROM u) SELECT * FROM r WHERE mon='2024-10'`);

// cs-1473 activity board: Grace under ASC (rank staged over the full fold)
q("grace ASC order-count rank staged", `WITH b AS (SELECT c.name name, COUNT(*) n FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id), x AS (SELECT name, n, RANK() OVER (ORDER BY n ASC) rk FROM b) SELECT * FROM x WHERE name='Grace Kim'`);

// cs-1474 price tiles: full NTILE(4) DESC census + ASC band1 landing
q("price tiles full", `WITH t AS (SELECT price, NTILE(4) OVER (ORDER BY price DESC) band FROM products), s AS (SELECT band, ROUND(SUM(price),2) tile_price, ROUND(100.0*SUM(price)/SUM(SUM(price)) OVER (),1) pct FROM t GROUP BY band) SELECT * FROM s ORDER BY band`);
q("price tiles ASC band1", `WITH t AS (SELECT price, NTILE(4) OVER (ORDER BY price ASC) band FROM products), s AS (SELECT band, ROUND(SUM(price),2) tile_price, ROUND(100.0*SUM(price)/SUM(SUM(price)) OVER (),1) pct FROM t GROUP BY band) SELECT * FROM s WHERE band = 1`);

// cs-1475 stock bands: fleet paint + wrong band
q("stock bands fleet paint", `WITH t AS (SELECT stock, NTILE(4) OVER (ORDER BY stock DESC) band FROM products), x AS (SELECT band, COUNT(*) n, MAX(stock) hi, SUM(COUNT(*)) OVER () fleet FROM t GROUP BY band) SELECT * FROM x ORDER BY band`);

// cs-1476 year split: the 2024 row the wrong pin grabs
q("year split 2024 row", `WITH y AS (SELECT strftime('%Y', created_at) yr, COUNT(*) n, SUM(total) spend FROM orders GROUP BY yr), p AS (SELECT yr, n, ROUND(spend,2) spend, ROUND(100.0*spend/SUM(spend) OVER (),1) pct, COUNT(n) OVER () buckets FROM y) SELECT * FROM p ORDER BY yr`);

// cs-1477 procurement league: FIRST_VALUE shadow + ASC rung
q("nordic FIRST_VALUE shadow", `WITH v AS (SELECT s.name name, ROUND(SUM(p.price),2) value FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), l AS (SELECT name, value, RANK() OVER (ORDER BY value DESC) rk, FIRST_VALUE(value) OVER (ORDER BY value DESC) prev FROM v) SELECT * FROM l WHERE name='Nordic Gadgets AB'`);
q("nordic ASC value rank staged", `WITH v AS (SELECT s.name name, ROUND(SUM(p.price),2) value FROM products p JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.id), l AS (SELECT name, value, RANK() OVER (ORDER BY value ASC) rk FROM v) SELECT * FROM l WHERE name='Nordic Gadgets AB'`);

// cs-1478 ledger opex: the September pct the wrong pin grabs
q("ledger opex 2024-09 pct", `WITH e AS (SELECT strftime('%Y-%m', entry_date) mon, SUM(debit_cents)/100.0 spend FROM ledger_entries WHERE account='operating_expenses' GROUP BY mon), p AS (SELECT mon, spend, ROUND(100.0*spend/SUM(spend) OVER (),1) pct FROM e) SELECT * FROM p WHERE mon='2024-09'`);
q("ERR spent_on on ledger", `SELECT SUM(debit_cents) FROM ledger_entries WHERE spent_on IS NOT NULL`);

// cs-1479 twins: tie-break forensics (customer_id / status keys)
q("twins tiebreak customer_id", `WITH w AS (SELECT id, created_at, LAG(created_at) OVER (ORDER BY created_at, customer_id) prev FROM orders), k AS (SELECT id, created_at, prev FROM w WHERE created_at = prev) SELECT COUNT(*) twins, MAX(id) last_twin FROM k`);
q("twins tiebreak status", `WITH w AS (SELECT id, created_at, LAG(created_at) OVER (ORDER BY created_at, status) prev FROM orders), k AS (SELECT id, created_at, prev FROM w WHERE created_at = prev) SELECT COUNT(*) twins, MAX(id) last_twin FROM k`);

// cs-1480 invoice years: SUBSTR start 28 fallback + start 6 recheck
q("invoice year substr start 28", `WITH y AS (SELECT CAST(SUBSTR(number, 28, 4) AS INTEGER) yr FROM invoices), f AS (SELECT yr, COUNT(*) n, SUM(COUNT(*)) OVER (ORDER BY yr) running, SUM(COUNT(*)) OVER () stack FROM y GROUP BY yr) SELECT * FROM f`);
q("invoice year substr start 23 detail", `WITH y AS (SELECT CAST(SUBSTR(number, 23, 4) AS INTEGER) yr FROM invoices), f AS (SELECT yr, COUNT(*) n, SUM(COUNT(*)) OVER (ORDER BY yr) running, SUM(COUNT(*)) OVER () stack FROM y GROUP BY yr) SELECT * FROM f`);

// cs-1470 mean-gap: the 49-dollar SKU's gap + AVG price exact
q("product mean and gap 49", `WITH g AS (SELECT name, price, ROUND(price - AVG(price) OVER (), 2) gap FROM products) SELECT * FROM g WHERE price = 49`);

console.log("\n(done — temp db removed)");
db.close();
rmSync(TMP, { force: true });
