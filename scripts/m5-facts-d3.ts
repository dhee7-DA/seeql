// M5 D3 FACTS PROBE — Date math edges receipts (db/custom.db, readonly copy).
// Every numeric claim in drills/m5/date-edges.ts cites one of these labeled outputs.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5d3.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string, max = 20) {
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

// ---------- A. NULL lead-time evaporation ----------
q("A01 shipped null census", `SELECT COUNT(*) total, COUNT(shipped_at) shipped, SUM(shipped_at IS NULL) nulls FROM orders`);
q("A02 avg lead shipped-only", `SELECT ROUND(AVG(julianday(shipped_at)-julianday(created_at)),2) avg_lead, MIN(julianday(shipped_at)-julianday(created_at)) lo, MAX(julianday(shipped_at)-julianday(created_at)) hi, COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL`);
q("A03 avg lead no filter (same?)", `SELECT ROUND(AVG(julianday(shipped_at)-julianday(created_at)),2) avg_lead, COUNT(julianday(shipped_at)-julianday(created_at)) counted FROM orders`);
q("A04 lead integer-bucket census", `SELECT CAST(julianday(shipped_at)-julianday(created_at) AS INTEGER) days, COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL GROUP BY days ORDER BY days`);
q("A05 slow boats raw diff > 3", `SELECT COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL AND julianday(shipped_at)-julianday(created_at) > 3`);
q("A06 slow boats CAST > 3", `SELECT COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL AND CAST(julianday(shipped_at)-julianday(created_at) AS INTEGER) > 3`);
q("A07 sample raw diffs first 8 shipped", `SELECT id, created_at, shipped_at, julianday(shipped_at)-julianday(created_at) d FROM orders WHERE shipped_at IS NOT NULL ORDER BY id LIMIT 8`);
q("A08 created_at format sample", `SELECT id, created_at, typeof(created_at) t FROM orders ORDER BY id LIMIT 3`);
q("A09 shipped_at format sample", `SELECT id, shipped_at, typeof(shipped_at) t FROM orders WHERE shipped_at IS NOT NULL ORDER BY id LIMIT 3`);
q("A10 null rows julianday", `SELECT id, julianday(shipped_at) jd FROM orders WHERE shipped_at IS NULL LIMIT 3`);
q("A11 exactly-3 boundary", `SELECT COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL AND julianday(shipped_at)-julianday(created_at) = 3`);
q("A12 = 3 via CAST", `SELECT COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL AND CAST(julianday(shipped_at)-julianday(created_at) AS INTEGER) = 3`);

// ---------- B. julianday input strictness ----------
q("B01 partial + padded literals", `SELECT julianday('2024-01-01') jd_full, julianday('2024-01') jd_month, julianday('2024') jd_yearonly`);
q("B02 unpadded literals", `SELECT julianday('2024-3-1') unp1, julianday('2024-01-5') unp2, julianday('2024-1-05') unp3`);
q("B03 strftime on partial", `SELECT strftime('%Y-%m','2024-01') frommonth, strftime('%Y-%m','2024-01-01') fromfull`);
q("B04 date() on partial", `SELECT date('2024-01') d, date('2024-01-01') dfull`);
q("B05 garbage input", `SELECT julianday('garbage') jd, date('garbage') d, strftime('%Y-%m','nope') s`);
q("B06 null input", `SELECT julianday(NULL) jd, strftime('%Y-%m', NULL) s, date(NULL) d`);
q("B07 text compare padded vs not", `SELECT '2024-10-12' < '2024-3-1' as text_sort, '2024-02-15' = '2024-2-15' as eq`);
q("B08 iso literal value", `SELECT julianday('2024-01-01') jd`);
q("B09 2460310.5 check frac", `SELECT julianday('2024-01-01') - CAST(julianday('2024-01-01') AS INTEGER) frac`);

// ---------- C. Bucketing: %Y-%m vs %m vs SUBSTR vs start of month ----------
q("C01 full month census", `SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM orders GROUP BY mon ORDER BY mon`);
q("C02 year census", `SELECT strftime('%Y', created_at) y, COUNT(*) n FROM orders GROUP BY y ORDER BY y`);
q("C03 %m alone census", `SELECT strftime('%m', created_at) m, COUNT(*) n FROM orders GROUP BY m ORDER BY m`);
q("C04 jan merged", `SELECT COUNT(*) n FROM orders WHERE strftime('%m', created_at) = '01'`);
q("C05 substr bucket census", `SELECT SUBSTR(created_at, 1, 7) mon, COUNT(*) n FROM orders GROUP BY mon ORDER BY mon LIMIT 5`);
q("C06 start-of-month bucket census", `SELECT DATE(created_at, 'start of month') mon, COUNT(*) n FROM orders GROUP BY mon ORDER BY mon LIMIT 5`);
q("C07 typeof buckets", `SELECT typeof(strftime('%Y-%m', created_at)) a, typeof(SUBSTR(created_at,1,7)) b, typeof(DATE(created_at,'start of month')) c FROM orders LIMIT 1`);
q("C08 start of month sample values", `SELECT created_at, DATE(created_at, 'start of month') som FROM orders ORDER BY id LIMIT 5`);
q("C09 end-of-month recipe leap", `SELECT DATE('2024-02-11','start of month','+1 month','-1 day') eom_leap, DATE('2025-02-11','start of month','+1 month','-1 day') eom_plain`);
q("C10 date shift +7", `SELECT DATE('2024-01-05','+7 days') plus7`);
q("C11 weekday modifier", `SELECT DATE('2024-01-05','weekday 1') nextmon`);
q("C12 month overflow spill", `SELECT DATE('2024-01-31','+1 month') spill`);
q("C13 span", `SELECT MIN(created_at) lo, MAX(created_at) hi FROM orders`);
q("C14 order 1 date", `SELECT id, created_at FROM orders WHERE id = 1`);
q("C15 14 buckets count", `SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) buckets FROM orders`);

// ---------- D. Boundary filters ----------
q("D01 feb2024 >= and <", `SELECT COUNT(*) n FROM orders WHERE created_at >= '2024-02-01' AND created_at < '2024-03-01'`);
q("D02 feb2024 LIKE", `SELECT COUNT(*) n FROM orders WHERE created_at LIKE '2024-02-%'`);
q("D03 feb2024 LIKE no dash", `SELECT COUNT(*) n FROM orders WHERE created_at LIKE '2024-02%'`);
q("D04 feb2024 BETWEEN 01-28", `SELECT COUNT(*) n FROM orders WHERE created_at BETWEEN '2024-02-01' AND '2024-02-28'`);
q("D05 feb2024 BETWEEN 01-29", `SELECT COUNT(*) n FROM orders WHERE created_at BETWEEN '2024-02-01' AND '2024-02-29'`);
q("D06 feb29 rows", `SELECT COUNT(*) n FROM orders WHERE created_at >= '2024-02-29' AND created_at < '2024-03-01'`);
q("D07 feb29 ids", `SELECT id, created_at FROM orders WHERE created_at >= '2024-02-29' AND created_at < '2024-03-01' ORDER BY id`);
q("D08 LIKE unpadded", `SELECT COUNT(*) n FROM orders WHERE created_at LIKE '2024-2-%'`);
q("D09 march2024 range", `SELECT COUNT(*) n FROM orders WHERE created_at >= '2024-03-01' AND created_at < '2024-04-01'`);
q("D10 strftime filter equivalent", `SELECT COUNT(*) n FROM orders WHERE strftime('%Y-%m', created_at) = '2024-02'`);

// ---------- E. Weekday map ----------
q("E01 weekday census", `SELECT strftime('%w', created_at) dow, COUNT(*) n FROM orders GROUP BY dow ORDER BY dow`);
q("E02 order1 weekday", `SELECT strftime('%w','2024-01-05') dow, strftime('%w', created_at) dow1 FROM orders WHERE id = 1`);
q("E03 weekday typeof", `SELECT typeof(strftime('%w', created_at)) t FROM orders LIMIT 1`);
q("E04 monday vs saturday", `SELECT SUM(strftime('%w',created_at)='1') mon, SUM(strftime('%w',created_at)='6') sat FROM orders`);

// ---------- F. Invoices & expenses (other tables' calendars) ----------
q("F01 invoice month census", `SELECT strftime('%Y-%m', issued_on) mon, COUNT(*) n FROM invoices GROUP BY mon ORDER BY mon`);
q("F02 invoice buckets count", `SELECT COUNT(DISTINCT strftime('%Y-%m', issued_on)) buckets, MIN(issued_on) lo, MAX(issued_on) hi FROM invoices`);
q("F03 invoice terms gap", `SELECT ROUND(AVG(julianday(due_on)-julianday(issued_on)),2) avg_gap, MIN(julianday(due_on)-julianday(issued_on)) lo, MAX(julianday(due_on)-julianday(issued_on)) hi, COUNT(*) n FROM invoices`);
q("F04 expenses month census", `SELECT strftime('%Y-%m', spent_on) mon, ROUND(SUM(amount_cents)/100.0, 2) dollars FROM expenses GROUP BY mon ORDER BY mon`);
q("F05 expenses category census", `SELECT category, ROUND(SUM(amount_cents)/100.0,2) dollars, COUNT(*) n FROM expenses GROUP BY category ORDER BY dollars DESC`);
q("F06 expenses bucket count", `SELECT COUNT(DISTINCT strftime('%Y-%m', spent_on)) buckets, MIN(spent_on) lo, MAX(spent_on) hi, COUNT(*) n FROM expenses`);
q("F07 expenses aug 2024", `SELECT ROUND(SUM(amount_cents)/100.0,2) dollars FROM expenses WHERE strftime('%Y-%m', spent_on) = '2024-08'`);

// ---------- G. Verbatim error receipts ----------
e("G01 no such function YEAR", `SELECT YEAR(created_at) FROM orders LIMIT 1`);
e("G02 no such function MONTH", `SELECT MONTH(created_at) FROM orders LIMIT 1`);
e("G03 no such function DATEDIFF", `SELECT DATEDIFF(shipped_at, created_at) FROM orders LIMIT 1`);
e("G04 no such function DATE_TRUNC", `SELECT DATE_TRUNC('month', created_at) FROM orders LIMIT 1`);

// ---------- H. Float exactness, raw coercion, silent NULLs ----------
q("H01 partial + bare-number literals", `SELECT julianday('2024-01-01') jd_full, julianday('2024-01') jd_month, julianday('2024') jd_bare, julianday('1000000') jd_big`);
q("H02 float exactness literals", `SELECT PRINTF('%.10f', julianday('2024-03-20') - julianday('2024-03-15')) d5, PRINTF('%.10f', julianday('2024-01-18') - julianday('2024-01-15')) d3, PRINTF('%.10f', julianday('2024-01-05')) jd`);
q("H03 any non-integer order diff?", `SELECT COUNT(*) n FROM orders WHERE shipped_at IS NOT NULL AND (julianday(shipped_at)-julianday(created_at)) <> CAST(julianday(shipped_at)-julianday(created_at) AS INTEGER)`);
q("H04 cast avg vs round avg", `SELECT ROUND(AVG(julianday(shipped_at)-julianday(created_at)), 2) r2, ROUND(AVG(julianday(shipped_at)-julianday(created_at)), 0) r0, CAST(AVG(julianday(shipped_at)-julianday(created_at)) AS INTEGER) cut, PRINTF('%.6f', AVG(julianday(shipped_at)-julianday(created_at))) raw FROM orders WHERE shipped_at IS NOT NULL`);
q("H05 raw text subtraction", `SELECT SUM(shipped_at - created_at = 0) zeros, SUM(shipped_at - created_at > 3) over3 FROM orders WHERE shipped_at IS NOT NULL`);
q("H06 silent-NULL modifier family", `SELECT DATE('2024-01-05','nonsense') m1, DATE('2024-01-05','%Y-%m') m2, julianday('2024-01-05','2024-01-10') m3, strftime('%Y-%m','2024-01') m4, date('2024-01') m5`);

// ---------- I. Rollover / normalization of impossible dates ----------
q("I01 roll over", `SELECT date('2023-02-29') roll_leap, date('2024-02-30') roll_day, julianday('2023-03-01') jd_mar1, julianday('2023-02-29') jd_badleap, strftime('%Y-%m', '2024-02-30') mon`);
q("I02 valid leap receipt", `SELECT julianday('2024-02-29') jd, strftime('%j','2024-02-29') doy60, strftime('%j','2025-02-28') doy59, strftime('%j','2024-12-31') d366, strftime('%j','2023-12-31') d365`);
q("I03 bare julian day as calendar date", `SELECT DATE(2024) d, DATE(1000000) d2`);

// ---------- J. Boundary filters, exact ----------
q("J01 feb2024 variants", `SELECT (SELECT COUNT(*) FROM orders WHERE created_at >= '2024-02-01' AND created_at < '2024-03-01') halfopen, (SELECT COUNT(*) FROM orders WHERE created_at LIKE '2024-02-%') likedash, (SELECT COUNT(*) FROM orders WHERE created_at BETWEEN '2024-02-01' AND '2024-02-28') between28, (SELECT COUNT(*) FROM orders WHERE created_at BETWEEN '2024-02-01' AND '2024-03-01') betweenmar1`);
q("J02 feb29/mar1 rows", `SELECT (SELECT COUNT(*) FROM orders WHERE created_at = '2024-02-29') feb29, (SELECT COUNT(*) FROM orders WHERE created_at = '2024-03-01') mar1`);
q("J03 march window", `SELECT COUNT(*) n FROM orders WHERE created_at >= '2024-03-01' AND created_at < '2024-04-01'`);
q("J04 LIKE unpadded / year", `SELECT (SELECT COUNT(*) FROM orders WHERE created_at LIKE '2024-2-%') unpadded, (SELECT COUNT(*) FROM orders WHERE created_at LIKE '2024-%') year2024`);

// ---------- K. Raw-instant grouping ----------
q("K01 distinct instants", `SELECT COUNT(*) rows, COUNT(DISTINCT created_at) instants FROM orders`);
q("K02 two-order day count", `SELECT COUNT(*) n FROM (SELECT created_at FROM orders GROUP BY created_at HAVING COUNT(*) = 2) twos`);
q("K03 triple days", `SELECT created_at, COUNT(*) c FROM orders GROUP BY created_at ORDER BY c DESC LIMIT 2`);

// ---------- L. Bucket spellings identical ----------
q("L01 distinct bucket spellings", `SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) a, COUNT(DISTINCT SUBSTR(created_at, 1, 7)) b, COUNT(DISTINCT DATE(created_at, 'start of month')) c, COUNT(DISTINCT strftime('%m', created_at)) d FROM orders`);

// ---------- M. Shift modifiers & eom recipe ----------
q("M01 shift receipts", `SELECT DATE('2024-01-05','+7 days') plus7, DATE('2024-01-05','+30 days') plus30, DATE('2024-01-05','weekday 1') nextmon, DATE('2024-01-31','+1 month') spill, DATE('2024-02-11','start of month','+1 month','-1 day') eom24, DATE('2025-02-11','start of month','+1 month','-1 day') eom25`);

// ---------- N. Text-order traps ----------
q("N01 text compares", `SELECT '2024-10-12' < '2024-3-1' sortbreak, '2024-02-15' = '2024-2-15' eqbreak, typeof(strftime('%Y-%m', created_at)) t FROM orders LIMIT 1`);

// ---------- O. Weekday map ----------
q("O01 weekday census", `SELECT strftime('%w', created_at) dow, COUNT(*) n FROM orders GROUP BY dow ORDER BY dow`);
q("O02 weekday anchors", `SELECT strftime('%w','2024-01-05') fri, strftime('%w','2024-01-07') sun, strftime('%w','2024-01-08') mon, typeof(strftime('%w','2024-01-05')) t`);

// ---------- P. CAST truncation on timed literals ----------
q("P01 truncation receipts", `SELECT julianday('2024-03-20 06:00:00') - julianday('2024-03-15 12:00:00') raw, CAST(julianday('2024-03-20 06:00:00') - julianday('2024-03-15 12:00:00') AS INTEGER) cut, ROUND(julianday('2024-03-20 06:00:00') - julianday('2024-03-15 12:00:00'), 0) rnd, CAST(-4.75 AS INTEGER) neg, CAST(-0.25 AS INTEGER) neg2`);

db.close();
rmSync(COPY);
console.log("\nDONE — copy removed.");
