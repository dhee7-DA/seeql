/// <reference types="bun-types" />
// m5-c5 wave probe — frames & running case receipts not already covered by
// m5-facts-r4/r5. Read-only COPY of db/custom.db → scripts/.m5c5.db, deleted at end.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const TMP = "scripts/.m5c5.db";
rmSync(TMP, { force: true });
copyFileSync("db/custom.db", TMP);
const db = new Database(TMP, { readonly: true });
const ver = db.query("SELECT sqlite_version() AS v").get() as { v: string };
console.log(`sqlite ${ver.v}`);

function q(label: string, sql: string, cap = 40) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`\n[${label}]  (${rows.length} rows)`);
    if (rows.length) console.log("  cols: " + Object.keys(rows[0]).join(", "));
    for (const r of rows.slice(0, cap)) console.log("  " + Object.values(r).join(" | "));
    if (rows.length > cap) console.log("  ...");
  } catch (e) {
    console.log(`\n[${label}]  ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// ---- A. alias-in-WHERE support (my templates lean on it) -------------------
q("A1 alias in WHERE (simple)", "SELECT id AS k FROM orders WHERE k = 1");
q("A2 alias+window alias in WHERE",
  `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS spend
    FROM orders GROUP BY mon)
  SELECT mon, spend, SUM(spend) OVER (ORDER BY mon) AS running
  FROM m WHERE mon = '2024-03' AND running = 9958.69`);

// ---- B. staged month running (orders) --------------------------------------
q("B1 staged month running full",
  `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS spend
    FROM orders GROUP BY mon)
  SELECT mon, spend, SUM(spend) OVER (ORDER BY mon) AS run FROM m ORDER BY mon`);
q("B2 dual running at 2024-09",
  `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n, SUM(total) AS spend
    FROM orders GROUP BY mon)
  SELECT mon, n, spend, SUM(spend) OVER (ORDER BY mon) AS spend_run,
         COUNT(*) OVER (ORDER BY mon) AS orders_run
  FROM m WHERE mon = '2024-09'`);

// ---- C. payments ------------------------------------------------------------
q("C1 payments schema", "SELECT name, type FROM pragma_table_info('payments')");
q("C2 payments count+sum", "SELECT COUNT(*), SUM(amount_cents) FROM payments");
q("C3 paid_on ties", "SELECT paid_on, COUNT(*) n FROM payments GROUP BY paid_on HAVING n > 1");
q("C4 payments running ROWS by paid_on (tail 6)",
  `SELECT id, paid_on, amount_cents,
    SUM(amount_cents) OVER (ORDER BY paid_on ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run_rows
  FROM payments ORDER BY paid_on, id LIMIT 8`);
q("C5 payments running ROWS tail (last by paid_on,id)",
  `SELECT id, paid_on, amount_cents,
    SUM(amount_cents) OVER (ORDER BY paid_on ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run_rows
  FROM payments ORDER BY paid_on DESC, id DESC LIMIT 6`);
q("C6 RANGE vs ROWS at 2025-02-10 tie",
  `SELECT id, method, amount_cents,
    SUM(amount_cents) OVER (ORDER BY paid_on RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run_range,
    SUM(amount_cents) OVER (ORDER BY paid_on ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run_rows
  FROM payments WHERE paid_on = '2025-02-10' ORDER BY id`);
q("C7 method partition sums",
  `SELECT method, SUM(amount_cents) OVER (PARTITION BY method) AS method_book, COUNT(*) OVER (PARTITION BY method) AS n
  FROM payments ORDER BY id LIMIT 4`);

// ---- D. ledger ---------------------------------------------------------------
q("D1 ledger RANGE fold at 2025-02-28 rows (ORDER BY entry_date only)",
  `SELECT id, entry_date,
    SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date
      RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS bal_range,
    SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS bal_rows
  FROM ledger_entries WHERE entry_date = '2025-02-28' ORDER BY id`);
q("D2 ledger bal ORDER BY memo at id79",
  `SELECT id, SUM(debit_cents - credit_cents) OVER (ORDER BY memo) AS bal_memo
  FROM ledger_entries WHERE id = 79`);
q("D3 ledger bal ORDER BY entry_date, credit_cents at id79",
  `SELECT id, SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, credit_cents) AS bal
  FROM ledger_entries WHERE id = 79`);
q("D4 opex running by id (id45 + head2)",
  `SELECT id, entry_date, SUM(debit_cents) OVER (ORDER BY id) / 100.0 AS run
  FROM ledger_entries WHERE account = 'operating_expenses' AND id IN (1, 3, 45, 75) ORDER BY id`);
q("D5 opex credit_cents running max",
  `SELECT MAX(SUM(credit_cents) OVER (ORDER BY id)) AS max_credit_run
  FROM ledger_entries WHERE account = 'operating_expenses'`);
q("D6 cash staged running full",
  `WITH m AS (SELECT strftime('%Y-%m', entry_date) AS mon,
    SUM(debit_cents - credit_cents) AS net
    FROM ledger_entries WHERE account = 'cash' GROUP BY mon)
  SELECT mon, net, SUM(net) OVER (ORDER BY mon) / 100.0 AS cash_run FROM m ORDER BY mon`);

// ---- E. orders partitions & frames -------------------------------------------
q("E1 EU partition running by id at id27 (run + pair)",
  `SELECT o.id, o.total,
    SUM(o.total) OVER (PARTITION BY c.region ORDER BY o.id) AS eu_run,
    SUM(o.total) OVER (PARTITION BY c.region ORDER BY o.id
      ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS eu_pair
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE c.region = 'EU' AND o.id = 27`);
q("E2 Alice run by id vs created_at mismatch count",
  `WITH a AS (
    SELECT id, total,
      SUM(total) OVER (PARTITION BY customer_id ORDER BY id) AS run_id,
      SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at) AS run_date
    FROM orders WHERE customer_id = 1)
  SELECT COUNT(*) AS total_rows, SUM(run_id <> run_date) AS mismatches FROM a`);
q("E3 Alice run values at id14",
  `SELECT id, SUM(total) OVER (PARTITION BY customer_id ORDER BY id) AS run
  FROM orders WHERE customer_id = 1 AND id = 14`);
q("E4 cancelled run ORDER BY total at id95",
  `SELECT id, SUM(total) OVER (ORDER BY total) AS run_by_total
  FROM orders WHERE status = 'cancelled' AND id = 95`);
q("E5 COUNT created_at-only at id8 (default RANGE fold)",
  `SELECT id, COUNT(*) OVER (ORDER BY created_at) AS seen FROM orders WHERE id = 8`);
q("E6 pair(1 PRECEDING) at id4 + RANGE≡ROWS check on id key",
  `WITH w AS (
    SELECT id,
      SUM(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS pair_rows,
      SUM(total) OVER (ORDER BY id RANGE BETWEEN 1 PRECEDING AND CURRENT ROW) AS pair_range
    FROM orders)
  SELECT (SELECT pair_rows FROM w WHERE id = 4) AS pair_id4,
         (SELECT COUNT(*) FROM w WHERE pair_rows <> pair_range) AS range_rows_mismatches`);
q("E7 trailing-3 DESC at 101..103 + ASC at 102",
  `SELECT id,
    SUM(total) OVER (ORDER BY id DESC ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS last3_desc,
    SUM(total) OVER (ORDER BY id ASC ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS last3_asc
  FROM orders WHERE id IN (101, 102, 103) ORDER BY id`);
q("E8 before-frame at id3: SUM / MAX / COUNT / ORDER BY total",
  `SELECT
    SUM(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 PRECEDING) AS prev_sum,
    MAX(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 PRECEDING) AS prev_max,
    COUNT(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 PRECEDING) AS prev_count,
    SUM(total) OVER (ORDER BY total ROWS BETWEEN 1 PRECEDING AND 1 PRECEDING) AS prev_sum_bytotal
  FROM orders WHERE id = 3`);
q("E9 tail frame at id2 + 2 FOLLOWING at id2",
  `SELECT
    SUM(total) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) AS rest,
    SUM(total) OVER (ORDER BY id ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING) AS rest3
  FROM orders WHERE id = 2`);
q("E10 pending staged running + share",
  `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS spend
    FROM orders WHERE status = 'pending' GROUP BY mon),
  g AS (SELECT SUM(total) AS grand FROM orders WHERE status = 'pending')
  SELECT m.mon, m.spend, SUM(m.spend) OVER (ORDER BY m.mon) AS run,
    ROUND(100.0 * SUM(m.spend) OVER (ORDER BY m.mon) / g.grand, 2) AS run_share
  FROM m CROSS JOIN g WHERE m.mon = '2024-03'`);
q("E11 cancelled staged running + share",
  `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS spend
    FROM orders WHERE status = 'cancelled' GROUP BY mon),
  g AS (SELECT SUM(total) AS grand FROM orders WHERE status = 'cancelled')
  SELECT m.mon, m.spend, SUM(m.spend) OVER (ORDER BY m.mon) AS run,
    ROUND(100.0 * SUM(m.spend) OVER (ORDER BY m.mon) / g.grand, 2) AS run_share
  FROM m CROSS JOIN g WHERE m.mon = '2024-11'`);
q("E12 3-order day ROWS vs RANGE by created_at alone",
  `SELECT id, created_at,
    SUM(total) OVER (ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run_rows,
    SUM(total) OVER (ORDER BY created_at RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run_range
  FROM orders WHERE id IN (35, 39, 40) ORDER BY id`);

// ---- F. products ---------------------------------------------------------------
q("F1 price running at id11", `SELECT id, SUM(price) OVER (ORDER BY id) AS run FROM products WHERE id = 11`);
q("F2 cum share of catalog at id11",
  `SELECT id, ROUND(100.0 * SUM(price) OVER (ORDER BY price) / SUM(price) OVER (), 2) AS cum_share
  FROM products WHERE id = 11`);
q("F3 stock running at id3", `SELECT id, SUM(stock) OVER (ORDER BY id) AS run FROM products WHERE id = 3`);
q("F4 stock pair(1 PREC) at id3",
  `SELECT id, SUM(stock) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS pair
  FROM products WHERE id = 3`);
q("F5 stock smooth3 (2 PRECEDING) at id6",
  `SELECT id, ROUND(AVG(stock) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS smooth
  FROM products WHERE id = 6`);
q("F6 stock smooth4 (1 PRECEDING AND 2 FOLLOWING) at id3 + variants",
  `SELECT
    ROUND(AVG(stock) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 2 FOLLOWING), 1) AS smooth4,
    ROUND(AVG(stock) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING), 1) AS smooth3f,
    ROUND(AVG(stock) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 2 PRECEDING), 1) AS trap_empty,
    SUM(stock) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 2 FOLLOWING) AS sum4
  FROM products WHERE id = 3`);
q("F7 category RANGE vs ROWS at id10 + supplier_id partition",
  `SELECT id,
    SUM(price) OVER (PARTITION BY category ORDER BY price ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run_rows,
    SUM(price) OVER (PARTITION BY category ORDER BY price RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run_range,
    SUM(price) OVER (PARTITION BY supplier_id ORDER BY price ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run_sup
  FROM products WHERE id = 10`);
q("F8 supplier fleet at id2 + APAC region partition",
  `SELECT p.id,
    SUM(p.stock) OVER (PARTITION BY s.id) AS fleet,
    COUNT(*) OVER (PARTITION BY s.id) AS skus,
    SUM(p.stock) OVER (PARTITION BY s.region) AS region_stock
  FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE p.id = 2`);

// ---- G. invoices ------------------------------------------------------------------
q("G1 invoice running at id27/id28 by issued_on",
  `SELECT id, SUM(amount_cents) OVER (ORDER BY issued_on) / 100.0 AS run
  FROM invoices WHERE id IN (27, 28) ORDER BY id`);
q("G2 invoice running ORDER BY due_on at id27",
  `SELECT id, SUM(amount_cents) OVER (ORDER BY due_on) / 100.0 AS run
  FROM invoices WHERE id = 27`);

// ---- H. expenses ------------------------------------------------------------------
q("H1 expense day running + pair at id6",
  `SELECT id, spent_on, amount_cents,
    SUM(amount_cents) OVER (ORDER BY spent_on) / 100.0 AS run,
    SUM(amount_cents) OVER (ORDER BY spent_on ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) / 100.0 AS pair
  FROM expenses WHERE id = 6`);
q("H2 Rent running ORDER BY amount_cents at id24 (RANGE fold)",
  `SELECT id, SUM(amount_cents) OVER (ORDER BY amount_cents) / 100.0 AS run
  FROM expenses WHERE category = 'Rent' AND id = 24`);
q("H3 Rent running by spent_on at id24",
  `SELECT id, SUM(amount_cents) OVER (ORDER BY spent_on) / 100.0 AS run
  FROM expenses WHERE category = 'Rent' AND id = 24`);
q("H4 expenses GROUP BY spent_on (distractor) running at 2025-02",
  `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents)/100.0 AS spend
    FROM expenses GROUP BY spent_on)
  SELECT mon, spend, SUM(spend) OVER (ORDER BY mon) AS run FROM m WHERE mon = '2025-02' ORDER BY mon`);
q("H5 expense staged full (reconfirm)",
  `WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents)/100.0 AS spend
    FROM expenses GROUP BY mon)
  SELECT mon, spend, SUM(spend) OVER (ORDER BY mon) AS run FROM m ORDER BY mon`);
q("H6 opex staged from ledger (reconfirm)",
  `WITH m AS (SELECT strftime('%Y-%m', entry_date) AS mon, SUM(debit_cents)/100.0 AS spend
    FROM ledger_entries WHERE account = 'operating_expenses' GROUP BY mon)
  SELECT mon, spend, SUM(spend) OVER (ORDER BY mon) AS run FROM m WHERE mon IN ('2024-01','2025-02') ORDER BY mon`);

// ---- I. customers paints -----------------------------------------------------------
q("I1 region/status/name paints at id5",
  `SELECT
    SUM(o.total) OVER (PARTITION BY c.region) AS region_book,
    COUNT(*) OVER (PARTITION BY c.region) AS region_crowd,
    SUM(o.total) OVER (PARTITION BY c.name) AS cust_book,
    SUM(o.total) OVER (PARTITION BY o.status) AS status_book
  FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.id = 5`);
q("I2 created_at inside OVER over staged CTE (expect error)",
  `WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS spend FROM orders GROUP BY mon)
  SELECT SUM(spend) OVER (ORDER BY created_at) FROM m`);

// ---- J. misc determinism ------------------------------------------------------------
q("J1 created_at fold at id5/id7 (canonical pair, reverify)",
  `SELECT id,
    SUM(total) OVER (ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run_rows,
    SUM(total) OVER (ORDER BY created_at RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run_range
  FROM orders WHERE id IN (5, 7) ORDER BY id`);
q("J2 pending staged running at 2024-10 tie rows",
  `SELECT id,
    SUM(total) OVER (ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run_rows,
    SUM(total) OVER (ORDER BY created_at RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run_range
  FROM orders WHERE status = 'pending' AND id IN (74, 75) ORDER BY id`);

db.close();
rmSync(TMP, { force: true });
console.log("\nprobe done, copy removed");
