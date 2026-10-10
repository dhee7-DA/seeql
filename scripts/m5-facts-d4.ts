// M5 D4 FACTS PROBE — window-rank drill receipts (db/custom.db, readonly copy).
// Complements scripts/m5-facts.ts (W01–W14 / E01–E13 already verified there).
// Every numeric claim in drills/m5/window-rank.ts cites one of these outputs.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5d4.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string, max = 25) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const shown = rows.slice(0, max).map(r => Object.values(r).map(v =>
      v === null ? "NULL" : typeof v === "number" ? String(v) : String(v)
    ).join(" | "));
    console.log(`\n[${label}]  (${rows.length} rows)`);
    shown.forEach(s => console.log("  " + s));
    if (rows.length > max) console.log(`  … +${rows.length - max} more`);
  } catch (e) {
    console.log(`\n[${label}]  ERROR: ${e instanceof Error ? e.message : e}`);
  }
}

function e(label: string, sql: string) {
  try {
    db.query(sql).all();
    console.log(`\n[ERR ${label}]  no error`);
  } catch (err) {
    console.log(`\n[ERR ${label}]  ${err instanceof Error ? err.message : err}`);
  }
}

// ---------- NTILE census ----------
q("N01 ntile3 over 16 spenders", `SELECT tile, COUNT(*) n FROM (SELECT NTILE(3) OVER (ORDER BY spend DESC) tile FROM (SELECT SUM(o.total) spend FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.id)) GROUP BY tile ORDER BY tile`);
q("N02 ntile3 tile-1 members", `SELECT name FROM (SELECT c.name, NTILE(3) OVER (ORDER BY SUM(o.total) DESC) t FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.id) WHERE t=1`);
q("N03 ntile5 over 103 orders", `SELECT tile, COUNT(*) n FROM (SELECT NTILE(5) OVER (ORDER BY id) tile FROM orders) GROUP BY tile ORDER BY tile`);
q("N04 ntile2.5 coerced census", `SELECT tile, COUNT(*) n FROM (SELECT NTILE(2.5) OVER (ORDER BY id) tile FROM orders) GROUP BY tile ORDER BY tile`);
q("N05 ntile4 exact quartiles", `SELECT tile, COUNT(*) n FROM (SELECT NTILE(4) OVER (ORDER BY spend DESC) tile FROM (SELECT SUM(o.total) spend FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.id)) GROUP BY tile ORDER BY tile`);

// ---------- empty OVER / no ORDER BY ----------
q("N06 row_number empty over", `SELECT MIN(rn) lo, MAX(rn) hi, COUNT(DISTINCT rn) distinct_n, COUNT(*) total FROM (SELECT ROW_NUMBER() OVER () rn FROM orders)`);
q("N07 dense_rank empty over", `SELECT MIN(drk) lo, MAX(drk) hi FROM (SELECT DENSE_RANK() OVER () drk FROM orders)`);
q("N08 rank empty over census", `SELECT rk, COUNT(*) n FROM (SELECT RANK() OVER () rk FROM orders) GROUP BY rk`);

// ---------- COUNT(*) OVER partition ----------
q("N09 count over partition alice", `SELECT DISTINCT customer_id, COUNT(*) OVER (PARTITION BY customer_id) n FROM orders WHERE customer_id=1`);
q("N10 count-over-partition distinct values", `SELECT COUNT(DISTINCT n) distinct_vals, MIN(n) lo, MAX(n) hi FROM (SELECT COUNT(*) OVER (PARTITION BY customer_id) n FROM orders)`);
q("N11 count over partition rowcount", `SELECT COUNT(*) rows_out FROM (SELECT COUNT(*) OVER (PARTITION BY customer_id) n FROM orders)`);

// ---------- window over GROUP BY: full count census + ties ----------
q("N12 order-count census ranked", `SELECT customer_id, COUNT(*) n, RANK() OVER (ORDER BY COUNT(*) DESC) rk FROM orders GROUP BY customer_id ORDER BY rk, n DESC`, 20);
q("N13 count ties", `SELECT n, COUNT(*) tied FROM (SELECT COUNT(*) n FROM orders GROUP BY customer_id) GROUP BY n HAVING COUNT(*)>1 ORDER BY n DESC`);

// ---------- top-2-per-group ----------
q("N14 top2 per customer rowcount", `SELECT COUNT(*) rows_out FROM (SELECT customer_id, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) rn FROM orders) WHERE rn<=2`);
q("N15 global top5 orders", `SELECT id, total, ROW_NUMBER() OVER (ORDER BY total DESC) rn FROM orders ORDER BY rn LIMIT 5`);

// ---------- region rank census ----------
q("N16 region rank census", `SELECT region, MIN(rk) lo_rk, MAX(rk) hi_rk, MIN(drk) lo_drk, COUNT(*) n FROM (SELECT region, RANK() OVER (ORDER BY region) rk, DENSE_RANK() OVER (ORDER BY region) drk FROM customers) GROUP BY region ORDER BY region`);
q("N17 row_number by region blocks", `SELECT region, MIN(rn) lo, MAX(rn) hi FROM (SELECT region, ROW_NUMBER() OVER (ORDER BY region) rn FROM customers) GROUP BY region ORDER BY region`);
q("N18 region winners by spend", `SELECT region, name, spend FROM (SELECT c.region, c.name, SUM(o.total) spend, ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) rn FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.id) WHERE rn=1 ORDER BY region`);

// ---------- status rank census ----------
q("N19 status rank blocks", `SELECT status, MIN(rk) lo, MAX(rk) hi, MIN(drk) drk, COUNT(*) n FROM (SELECT status, RANK() OVER (ORDER BY status) rk, DENSE_RANK() OVER (ORDER BY status) drk FROM orders) GROUP BY status ORDER BY status`);

// ---------- percent_rank / cume_dist extremes ----------
q("N20 percent_rank full ladder", `SELECT c.name, ROUND(PERCENT_RANK() OVER (ORDER BY SUM(o.total) DESC), 4) pr FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.id ORDER BY pr DESC LIMIT 3`);
q("N21 cume_dist last", `SELECT c.name, ROUND(CUME_DIST() OVER (ORDER BY SUM(o.total) DESC), 4) cd FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.id ORDER BY cd DESC LIMIT 2`);
q("N22 percent_rank single-row partition (LATAM)", `SELECT name, ROUND(PERCENT_RANK() OVER (PARTITION BY region ORDER BY spend DESC), 4) pr, ROUND(CUME_DIST() OVER (PARTITION BY region ORDER BY spend DESC), 4) cd FROM (SELECT c.name, c.region, SUM(o.total) spend FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.id) WHERE region='LATAM'`);

// ---------- outer ORDER BY window legality ----------
q("N23 order by rank window legal", `SELECT id, total FROM orders ORDER BY RANK() OVER (ORDER BY total) LIMIT 3`);

// ---------- alias inside OVER ORDER BY ----------
e("N24 window orders by select alias", `SELECT customer_id, SUM(total) AS spend, RANK() OVER (ORDER BY spend DESC) rk FROM orders GROUP BY customer_id`);

// ---------- error verbatims ----------
e("E20 row_number in WHERE", `SELECT id FROM orders WHERE ROW_NUMBER() OVER (ORDER BY id) <= 3`);
e("E21 window alias in WHERE (no such column)", `SELECT id, ROW_NUMBER() OVER (ORDER BY total DESC) rn FROM orders WHERE rn = 1`);
e("E22 ntile missing arg", `SELECT NTILE() OVER (ORDER BY id) FROM orders LIMIT 1`);
e("E23 ntile negative", `SELECT NTILE(-2) OVER (ORDER BY id) FROM orders LIMIT 1`);
e("E24 bare rank again", `SELECT RANK() FROM orders LIMIT 1`);
e("E25 partition by in where-ish group by alias", `SELECT region, NTILE(4) OVER (ORDER BY region) t FROM customers GROUP BY t`);

q("N26 rank-vs-dense over order counts", `SELECT n, COUNT(*) rows_n, MIN(rk) rk, MIN(drk) drk FROM (SELECT COUNT(*) n, RANK() OVER (ORDER BY COUNT(*) DESC) rk, DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) drk FROM orders GROUP BY customer_id) GROUP BY n ORDER BY n DESC`);

q("N27 ntile2.5 over 16 spenders", `SELECT tile, COUNT(*) n FROM (SELECT NTILE(2.5) OVER (ORDER BY spend DESC) tile FROM (SELECT SUM(o.total) spend FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.id)) GROUP BY tile ORDER BY tile`);

q("N28 spenders above their own mean", `SELECT COUNT(*) above FROM (SELECT SUM(total) spend FROM orders GROUP BY customer_id) WHERE spend > (SELECT AVG(spend) FROM (SELECT SUM(total) spend FROM orders GROUP BY customer_id))`);
e("E26 sibling window alias inside OVER", `SELECT RANK() OVER (ORDER BY region) rk, DENSE_RANK() OVER (rk) drk FROM customers`);

db.close();
rmSync(COPY, { force: true });
console.log("\nDONE m5-facts-d4");
