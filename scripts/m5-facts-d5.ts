// M5 FACTS PROBE (drill-author m5-d5) — LAG/LEAD window-offset receipts.
// db/custom.db readonly copy; SQLite 3.53. Every claim in window-offsets.ts
// cites one of these labeled outputs. Run: bun scripts/m5-facts-d5.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5d5.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string, max = 30) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const shown = rows.slice(0, max).map(r => Object.values(r).map(v =>
      v === null ? "NULL" : String(v)
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

// ---------- base counts ----------
q("A1 orders count + first/last totals",
  `SELECT COUNT(*) n, (SELECT total FROM orders ORDER BY id LIMIT 1) first_total, (SELECT total FROM orders ORDER BY id DESC LIMIT 1) last_total FROM orders`);
q("A2 orders 1..4 totals", `SELECT id, total FROM orders ORDER BY id LIMIT 4`);
q("A3 pending orders", `SELECT COUNT(*) FROM orders WHERE status = 'pending'`);
q("A4 created_at ties among orders",
  `SELECT created_at, COUNT(*) n FROM orders GROUP BY created_at HAVING n > 1`);

// ---------- global LAG / LEAD ----------
q("B1 LAG(total) rows 1-3",
  `SELECT id, total, LAG(total) OVER (ORDER BY id) prev FROM orders ORDER BY id LIMIT 3`);
q("B2 LAG(total) NULL census",
  `SELECT COUNT(*) FROM (SELECT LAG(total) OVER (ORDER BY id) p FROM orders) WHERE p IS NULL`);
q("B3 LEAD(total) rows 1-3", 
  `SELECT id, total, LEAD(total) OVER (ORDER BY id) nxt FROM orders ORDER BY id LIMIT 3`);
q("B4 LEAD(total) last rows", 
  `SELECT id, total, LEAD(total) OVER (ORDER BY id) nxt FROM orders ORDER BY id DESC LIMIT 3`);
q("B5 LEAD(total) NULL census",
  `SELECT COUNT(*) FROM (SELECT LEAD(total) OVER (ORDER BY id) n FROM orders) WHERE n IS NULL`);
q("B6 LEAD(total,2) rows 100-103",
  `SELECT id, total, LEAD(total, 2) OVER (ORDER BY id) n2 FROM orders ORDER BY id DESC LIMIT 3`);

// ---------- offsets & defaults ----------
q("C1 LAG(total,1,0) rows 1-3",
  `SELECT id, total, LAG(total, 1, 0) OVER (ORDER BY id) p FROM orders ORDER BY id LIMIT 3`);
q("C2 LAG(total,2) rows 1-3",
  `SELECT id, total, LAG(total, 2) OVER (ORDER BY id) p FROM orders ORDER BY id LIMIT 3`);
q("C3 LAG(total,0) rows 1-2",
  `SELECT id, total, LAG(total, 0) OVER (ORDER BY id) p FROM orders ORDER BY id LIMIT 2`);
q("C4 LAG(total,-1) rows 1-2 (acts as LEAD?)",
  `SELECT id, total, LAG(total, -1) OVER (ORDER BY id) p FROM orders ORDER BY id LIMIT 2`);
q("C5 LEAD(total,-1) rows 1-2 (acts as LAG?)",
  `SELECT id, total, LEAD(total, -1) OVER (ORDER BY id) p FROM orders ORDER BY id LIMIT 2`);
q("C6 LAG(total,1000) non-null count",
  `SELECT COUNT(*) FROM (SELECT LAG(total, 1000) OVER (ORDER BY id) p FROM orders) WHERE p IS NOT NULL`);

// ---------- partitions ----------
q("D1 per-customer LAG NULL census",
  `SELECT COUNT(*) FROM (SELECT LAG(total) OVER (PARTITION BY customer_id ORDER BY id) p FROM orders) WHERE p IS NULL`);
q("D2 per-customer LEAD NULL census",
  `SELECT COUNT(*) FROM (SELECT LEAD(total) OVER (PARTITION BY customer_id ORDER BY id) n FROM orders) WHERE n IS NULL`);
q("D3 Alice (customer 1) LAG chain",
  `SELECT id, total, LAG(total) OVER (PARTITION BY customer_id ORDER BY id) prev
   FROM orders WHERE customer_id = 1 ORDER BY id`);
q("D4 order 32 per-partition LEAD (Alice's last order)",
  `SELECT id, customer_id, total, LEAD(total) OVER (PARTITION BY customer_id ORDER BY id) nxt
   FROM orders WHERE id = 32`);

// ---------- LAG over a NULLable column ----------
q("E1 order 5 shipped_at", `SELECT id, shipped_at FROM orders WHERE id IN (5, 6)`);
q("E2 LAG(shipped_at) rows 4-7",
  `SELECT id, shipped_at, LAG(shipped_at) OVER (ORDER BY id) prev FROM orders WHERE id BETWEEN 4 AND 7`);
q("E3 shipped_at NULL census", `SELECT COUNT(*) FROM orders WHERE shipped_at IS NULL`);
q("E4 LAG(shipped_at) NULL census",
  `SELECT COUNT(*) FROM (SELECT LAG(shipped_at) OVER (ORDER BY id) p FROM orders) WHERE p IS NULL`);

// ---------- IGNORE NULLS ----------
e("F1 LAST_VALUE IGNORE NULLS",
  `SELECT LAST_VALUE(shipped_at) IGNORE NULLS OVER (ORDER BY id) FROM orders LIMIT 1`);

// ---------- month staging + MoM ----------
q("G1 month sums (staged)",
  `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend FROM orders GROUP BY mon)
   SELECT mon, spend FROM m ORDER BY mon`, 20);
q("G2 MoM deltas via LAG",
  `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend FROM orders GROUP BY mon)
   SELECT mon, spend, ROUND(spend - LAG(spend) OVER (ORDER BY mon), 2) delta FROM m ORDER BY mon`, 20);
q("G3 MoM pct (rounded 1dp)",
  `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend FROM orders GROUP BY mon)
   SELECT mon, ROUND(100.0 * (spend - LAG(spend) OVER (ORDER BY mon)) / LAG(spend) OVER (ORDER BY mon), 1) pct FROM m ORDER BY mon`, 20);
q("G4 delta sign census",
  `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend FROM orders GROUP BY mon)
   SELECT SUM(CASE WHEN spend - LAG(spend) OVER (ORDER BY mon) < 0 THEN 1 ELSE 0 END) neg,
          SUM(CASE WHEN spend - LAG(spend) OVER (ORDER BY mon) > 0 THEN 1 ELSE 0 END) pos
   FROM m`);
q("G5 default-0 delta first month",
  `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend FROM orders GROUP BY mon)
   SELECT mon, spend, spend - LAG(spend, 1, 0) OVER (ORDER BY mon) delta FROM m ORDER BY mon LIMIT 2`);

// ---------- customers LEAD walk ----------
q("H1 LEAD(name) walk",
  `SELECT id, name, LEAD(name) OVER (ORDER BY id) nxt FROM customers ORDER BY id LIMIT 5`);
q("H2 LEAD(name) last row",
  `SELECT id, name, LEAD(name) OVER (ORDER BY id) nxt FROM customers ORDER BY id DESC LIMIT 1`);

// ---------- invoice lag chain ----------
q("I1 customer 1 invoice LAG(issued_on)",
  `SELECT id, issued_on, LAG(issued_on) OVER (ORDER BY issued_on) prev
   FROM invoices WHERE customer_id = 1 ORDER BY issued_on`);

// ---------- error texts (verbatim) ----------
e("T1 bare LAG without OVER", `SELECT LAG(total) FROM orders LIMIT 1`);
e("T2 LAG OVER () no ORDER BY", `SELECT LAG(total) OVER () FROM orders LIMIT 1`);
e("T3 window fn in WHERE", `SELECT id FROM orders WHERE LAG(total) OVER (ORDER BY id) > 100`);
e("T4 aggregate inside LAG same level",
  `SELECT strftime('%Y-%m', created_at) mon, LAG(SUM(total)) OVER (ORDER BY mon) FROM orders GROUP BY mon`);
e("T5 PARTITION after ORDER inside OVER",
  `SELECT LAG(total) OVER (ORDER BY id PARTITION BY customer_id) FROM orders LIMIT 1`);
e("T6 WHERE sees SELECT alias",
  `SELECT id, total - LAG(total) OVER (ORDER BY id) AS d FROM orders WHERE d > 0`);
e("T7 LAG with no arguments", `SELECT LAG() OVER (ORDER BY id) FROM orders LIMIT 1`);

// ---------- round 2/3 consolidations ----------
// customer roster (verify ids/names before citing any)
q("J1 customer roster", `SELECT id, name, region FROM customers ORDER BY id`, 20);

// does the one-pass LAG(SUM(total)) really run, and what values?
e("T4b aggregate inside LAG, non-alias window order",
  `SELECT strftime('%Y-%m', created_at) AS mon, LAG(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at))
   FROM orders GROUP BY strftime('%Y-%m', created_at)`);
q("M1 one-pass LAG(SUM(total)) values",
  `SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) s,
          LAG(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) raw_lag
   FROM orders GROUP BY strftime('%Y-%m', created_at) ORDER BY mon LIMIT 4`);

// delta sign census, properly staged
q("G4b delta sign census (staged)",
  `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend FROM orders GROUP BY mon),
   d AS (SELECT spend, spend - LAG(spend) OVER (ORDER BY mon) delta FROM m)
   SELECT SUM(CASE WHEN delta < 0 THEN 1 ELSE 0 END) neg,
          SUM(CASE WHEN delta > 0 THEN 1 ELSE 0 END) pos,
          SUM(CASE WHEN delta IS NULL THEN 1 ELSE 0 END) nulls FROM d`);

// WHERE filters first: neighbors computed over survivors only
q("K1 pending-only LAG neighbors",
  `SELECT id, status, total, LAG(total) OVER (ORDER BY id) prev
   FROM orders WHERE status = 'pending' ORDER BY id LIMIT 4`);

// LEAD default on the trailing edge
q("K2 LEAD(spend,1,0) last month",
  `WITH m AS (SELECT strftime('%Y-%m', created_at) mon, ROUND(SUM(total), 2) spend FROM orders GROUP BY mon)
   SELECT mon, spend, LEAD(spend, 1, 0) OVER (ORDER BY mon) nxt FROM m ORDER BY mon DESC LIMIT 1`);

// OVER (ORDER BY alias) resolution — plain LAG
e("M3 plain LAG with OVER ORDER BY alias",
  `SELECT id, strftime('%Y-%m', created_at) AS mon, LAG(total) OVER (ORDER BY mon) p FROM orders LIMIT 3`);
e("M4 plain LAG with OVER ORDER BY expression",
  `SELECT id, LAG(total) OVER (ORDER BY strftime('%Y-%m', created_at)) p FROM orders LIMIT 3`);

// RESPECT NULLS also unsupported?
e("F2 LAST_VALUE RESPECT NULLS",
  `SELECT LAST_VALUE(shipped_at) RESPECT NULLS OVER (ORDER BY id) FROM orders LIMIT 1`);

// cross-check the text-toolkit id-16 claim (dr5-tx-45)
q("X1 id 16 identity", `SELECT id, name, region FROM customers WHERE id = 16`);

db.close();
console.log("\nprobe done");
