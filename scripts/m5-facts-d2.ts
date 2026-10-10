// M5 facts d2 — engine-verified receipts for the date-buckets drill set
// (dr5-db-*, lesson-30 "Dates & buckets"). Run: bun scripts/m5-facts-d2.ts
// Operates on a READ-ONLY COPY of db/custom.db (rmSync + copyFileSync);
// the copy .m5d2.db is removed at the end.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync, existsSync } from "node:fs";
const SRC = "db/custom.db", COPY = ".m5d2.db";
if (existsSync(COPY)) rmSync(COPY);
copyFileSync(SRC, COPY);
const db = new Database(COPY, { readonly: true });
const q = (sql: string): any => db.query(sql).all();
const one = (sql: string): any => db.query(sql).get();
// NOTE: single concatenated string — console.log format specifiers (%d, %Y …)
// would otherwise eat the value when a label contains a % code.
const L = (label: string, v: any) => console.log((label + " ").padEnd(52) + JSON.stringify(v));

console.log("== shape ==");
L("sqlite version", one(`SELECT sqlite_version() v`).v);
L("orders count", one(`SELECT COUNT(*) c FROM orders`).c);
L("created_at span", q(`SELECT MIN(created_at) a, MAX(created_at) b FROM orders`));
L("typeof created_at", q(`SELECT DISTINCT typeof(created_at) t FROM orders`));
L("distinct raw created_at values", one(`SELECT COUNT(DISTINCT created_at) c FROM orders`).c);
L("shipped_at NULL count", one(`SELECT COUNT(*) c FROM orders WHERE shipped_at IS NULL`).c);
L("shipped count", one(`SELECT COUNT(*) c FROM orders WHERE shipped_at IS NOT NULL`).c);

console.log("== year census ==");
L("year census", q(`SELECT strftime('%Y', created_at) AS y, COUNT(*) AS n, ROUND(SUM(total),2) AS rev FROM orders GROUP BY y ORDER BY y`));

console.log("== month census (strftime '%Y-%m') ==");
L("month buckets", q(`SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n, ROUND(SUM(total),2) AS spend FROM orders GROUP BY mon ORDER BY mon`));
L("month bucket count", one(`SELECT COUNT(*) c FROM (SELECT strftime('%Y-%m', created_at) m FROM orders GROUP BY m)`).c);
L("start-of-month buckets", q(`SELECT DATE(created_at, 'start of month') AS mon, COUNT(*) AS n FROM orders GROUP BY mon ORDER BY mon`));
L("start-of-month bucket count", one(`SELECT COUNT(*) c FROM (SELECT DATE(created_at,'start of month') m FROM orders GROUP BY m)`).c);
L("SUBSTR(1,7) buckets", q(`SELECT SUBSTR(created_at, 1, 7) AS mon, COUNT(*) AS n FROM orders GROUP BY mon ORDER BY mon`));
L("SUBSTR(1,7) bucket count", one(`SELECT COUNT(*) c FROM (SELECT SUBSTR(created_at,1,7) m FROM orders GROUP BY m)`).c);
L("%m alone bucket count (merges years)", one(`SELECT COUNT(*) c FROM (SELECT strftime('%m', created_at) m FROM orders GROUP BY m)`).c);
L("%m alone census", q(`SELECT strftime('%m', created_at) AS m, COUNT(*) AS n FROM orders GROUP BY m ORDER BY m`));
L("raw created_at GROUP BY bucket count", one(`SELECT COUNT(*) c FROM (SELECT created_at FROM orders GROUP BY created_at)`).c);
L("max/min month n", q(`SELECT mon, n FROM (SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM orders GROUP BY mon) WHERE n = (SELECT MAX(n) FROM (SELECT COUNT(*) n FROM orders GROUP BY strftime('%Y-%m', created_at))) ORDER BY mon`));
L("min month n rows", q(`SELECT mon, n FROM (SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM orders GROUP BY mon) WHERE n = (SELECT MIN(n) FROM (SELECT COUNT(*) n FROM orders GROUP BY strftime('%Y-%m', created_at))) ORDER BY mon`));

console.log("== per-month money stats ==");
L("avg per month top3 by avg", q(`SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n, ROUND(AVG(total),2) AS avg_total FROM orders GROUP BY mon ORDER BY avg_total DESC LIMIT 3`));
L("golden month by spend", q(`SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS spend FROM orders GROUP BY mon ORDER BY spend DESC LIMIT 1`));
L("worst month by spend", q(`SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS spend FROM orders GROUP BY mon ORDER BY spend ASC LIMIT 1`));

console.log("== weekday census (%w) ==");
L("weekday census", q(`SELECT strftime('%w', created_at) AS dow, COUNT(*) AS n FROM orders GROUP BY dow ORDER BY dow`));
L("%w of 2024-01-05", q(`SELECT strftime('%w','2024-01-05') w`));
L("%w of 2024-05-09", q(`SELECT strftime('%w','2024-05-09') w`));
L("%w of 2024-01-01", q(`SELECT strftime('%w','2024-01-01') w`));
L("typeof %w result", q(`SELECT typeof(strftime('%w','2024-01-05')) t`));
L("busiest weekday", q(`SELECT strftime('%w', created_at) AS dow, COUNT(*) AS n FROM orders GROUP BY dow ORDER BY n DESC LIMIT 1`));
L("quietest weekday", q(`SELECT strftime('%w', created_at) AS dow, COUNT(*) AS n FROM orders GROUP BY dow ORDER BY n ASC LIMIT 1`));

console.log("== day-of-month census ==");
L("day-of-month bucket count", one(`SELECT COUNT(*) c FROM (SELECT strftime('%d', created_at) d FROM orders GROUP BY d)`).c);
L("day-of-month census top", q(`SELECT strftime('%d', created_at) AS dom, COUNT(*) AS n FROM orders GROUP BY dom ORDER BY n DESC, dom LIMIT 5`));
L("day-of-month 12th bucket", q(`SELECT COUNT(*) c FROM orders WHERE strftime('%d', created_at) = '12'`));

console.log("== date arithmetic ==");
L("DATE +7 days on 2024-01-05", q(`SELECT DATE('2024-01-05', '+7 days') d`));
L("DATE(created_at,'+7 days') first order", q(`SELECT created_at, DATE(created_at, '+7 days') shifted FROM orders ORDER BY id LIMIT 1`));
L("DATE('2024-01-31','+1 month')", q(`SELECT DATE('2024-01-31','+1 month') d`));
L("DATE('2024-02-29','+1 year')", q(`SELECT DATE('2024-02-29','+1 year') d`));
L("DATE('2024-01-05','weekday 1')", q(`SELECT DATE('2024-01-05','weekday 1') d`));
L("DATE('2024-01-05','start of month')", q(`SELECT DATE('2024-01-05','start of month') d`));
L("'2024-01-05' + 7 (text arithmetic)", q(`SELECT '2024-01-05' + 7 r`));
L("'2024-01-12' - '2024-01-05' (text arithmetic)", q(`SELECT '2024-01-12' - '2024-01-05' r`));
L("text sort '2024-09' < '2024-10'", q(`SELECT '2024-09' < '2024-10' t`));
L("unpadded '2024-3-1' vs '2024-10-12'", q(`SELECT '2024-3-1' > '2024-10-12' u, '2024-3-1' < '2024-10-12' v`));

console.log("== julianday ==");
L("JULIANDAY('2024-01-01')", q(`SELECT JULIANDAY('2024-01-01') j`));
L("JULIANDAY('2024-01-05')", q(`SELECT JULIANDAY('2024-01-05') j`));
L("JULIANDAY('2024-01')", q(`SELECT JULIANDAY('2024-01') j`));
L("JULIANDAY('banana')", q(`SELECT JULIANDAY('banana') j`));
L("julianday diff 2024-03-20 minus 2024-03-15", q(`SELECT JULIANDAY('2024-03-20') - JULIANDAY('2024-03-15') d, CAST(JULIANDAY('2024-03-20') - JULIANDAY('2024-03-15') AS INTEGER) c`));
L("CAST floors fractional diff (5.5 -> 5)", q(`SELECT CAST(JULIANDAY('2024-03-20 12:00') - JULIANDAY('2024-03-15') AS INTEGER) c`));
L("ROUND(AVG lead days)", one(`SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) a, MIN(CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER)) mn, MAX(CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER)) mx FROM orders WHERE shipped_at IS NOT NULL`));
L("lead gap > 3 count", one(`SELECT COUNT(*) c FROM orders WHERE shipped_at IS NOT NULL AND julianday(shipped_at) - julianday(created_at) > 3`).c);
L("lead gap >= 3 count", one(`SELECT COUNT(*) c FROM orders WHERE shipped_at IS NOT NULL AND julianday(shipped_at) - julianday(created_at) >= 3`).c);
L("lead gap = 3 count", one(`SELECT COUNT(*) c FROM orders WHERE shipped_at IS NOT NULL AND julianday(shipped_at) - julianday(created_at) = 3`).c);
L("julianday(NULL)", q(`SELECT JULIANDAY(NULL) j`));
L("julianday(text-subtraction trap) sample", q(`SELECT JULIANDAY('2024-01-12' - '2024-01-05') j`));

console.log("== format codes ==");
L("format codes on 2024-05-09", q(`SELECT strftime('%Y','2024-05-09') y, strftime('%m','2024-05-09') mo, strftime('%d','2024-05-09') dom, strftime('%w','2024-05-09') wd, strftime('%j','2024-05-09') doy`));
L("%F shortcut", q(`SELECT strftime('%F','2024-05-09') f`));
L("%W week of year", q(`SELECT strftime('%W','2024-01-05') f`));
L("%y 2-digit year", q(`SELECT strftime('%y-%m-%d','2024-01-05') f`));
L("%M is MINUTE not month", q(`SELECT strftime('%Y-%M-%d','2024-01-05') f`));
L("unknown code %x passthrough?", q(`SELECT strftime('%x','2024-01-05') f`));
L("strftime 1 arg", (() => { try { return db.query(`SELECT strftime('%Y-%m') f`).all(); } catch (e: any) { return "ERR " + e.message; } })());

console.log("== strictness edges ==");
L("date('2024-3-1') leniency", q(`SELECT DATE('2024-3-1') d`));
L("date('2024-3-1','+7 days')", q(`SELECT DATE('2024-3-1','+7 days') d`));
L("date('2024-01-31','nonsense')", q(`SELECT DATE('2024-01-31','nonsense') d`));
L("strftime('%Y-%m','banana')", q(`SELECT strftime('%Y-%m','banana') f`));
L("date(NULL)", q(`SELECT DATE(NULL) d`));

console.log("== expenses ==");
L("expenses span + count", q(`SELECT MIN(spent_on) a, MAX(spent_on) b, COUNT(*) c FROM expenses`));
L("expense month buckets (cents/100)", q(`SELECT SUBSTR(spent_on,1,7) AS mon, ROUND(SUM(amount_cents)/100.0,2) AS spend, COUNT(*) AS n FROM expenses GROUP BY mon ORDER BY mon`));
L("expense category census", q(`SELECT category, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS total FROM expenses GROUP BY category ORDER BY total DESC`));
L("expense biggest month", q(`SELECT SUBSTR(spent_on,1,7) AS mon, ROUND(SUM(amount_cents)/100.0,2) AS spend FROM expenses GROUP BY mon ORDER BY spend DESC LIMIT 1`));

console.log("== invoices ==");
L("invoice count + issue buckets", q(`SELECT COUNT(*) AS total_rows, (SELECT COUNT(*) FROM (SELECT SUBSTR(issued_on,1,7) m FROM invoices GROUP BY m)) AS buckets FROM invoices`));
L("invoice issue-month census", q(`SELECT SUBSTR(issued_on,1,7) AS mon, COUNT(*) AS n FROM invoices GROUP BY mon ORDER BY mon`));
L("invoice terms gap", one(`SELECT ROUND(AVG(JULIANDAY(due_on) - JULIANDAY(issued_on)), 6) g, MIN(JULIANDAY(due_on) - JULIANDAY(issued_on)) mn, MAX(JULIANDAY(due_on) - JULIANDAY(issued_on)) mx FROM invoices`).g === null ? one(`SELECT ROUND(AVG(JULIANDAY(due_on) - JULIANDAY(issued_on)), 6) g, MIN(JULIANDAY(due_on) - JULIANDAY(issued_on)) mn, MAX(JULIANDAY(due_on) - JULIANDAY(issued_on)) mx FROM invoices`) : one(`SELECT ROUND(AVG(JULIANDAY(due_on) - JULIANDAY(issued_on)), 6) g, MIN(JULIANDAY(due_on) - JULIANDAY(issued_on)) mn, MAX(JULIANDAY(due_on) - JULIANDAY(issued_on)) mx FROM invoices`));
L("aging > 30 days count", one(`SELECT COUNT(*) c FROM invoices WHERE JULIANDAY(due_on) - JULIANDAY(issued_on) > 30`).c);

console.log("== customers signup buckets ==");
L("customer signup census", q(`SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM customers GROUP BY mon ORDER BY mon`));

console.log("== errors (verbatim) ==");
const errs: Array<[string, string]> = [
  ["DATE_TRUNC (Postgres spelling)", `SELECT DATE_TRUNC('month', created_at) FROM orders`],
  ["DATEADD (SQL Server spelling)", `SELECT DATEADD(month, 1, created_at) FROM orders`],
  ["JULIAN_DAY (Postgres spelling)", `SELECT JULIAN_DAY(created_at) FROM orders`],
  ["MONTH() (MySQL spelling)", `SELECT MONTH(created_at) FROM orders`],
  ["aggregate in WHERE", `SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders WHERE COUNT(*) > 8 GROUP BY mon`],
  ["missing comma in strftime args", `SELECT strftime('%Y-%m' created_at) FROM orders`],
  ["ORDER BY typo'd alias", `SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon ORDER BY month`],
  ["strftime('%Y-%m') single arg", `SELECT strftime('%Y-%m') FROM orders`],
  ["date() with zero args", `SELECT DATE() FROM orders`],
  ["GROUP BY alias that doesn't exist", `SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY month`],
  ["DATE_ADD (MySQL spelling)", `SELECT DATE_ADD(created_at, INTERVAL 7 DAY) FROM orders`],
];
for (const [lbl, sql] of errs) {
  try { L("OK   " + lbl, db.query(sql).all()); }
  catch (e: any) { L("ERR  " + lbl, String(e.message).slice(0, 140)); }
}

console.log("== half-open range filter (portability/judgment receipt) ==");
L("buckets >= '2024-07' count", one(`SELECT COUNT(*) c FROM (SELECT strftime('%Y-%m', created_at) m FROM orders GROUP BY m HAVING m >= '2024-07')`).c);
L("orders in months >= 2024-07", one(`SELECT COUNT(*) c FROM orders WHERE strftime('%Y-%m', created_at) >= '2024-07'`).c);

db.close();
rmSync(COPY, { force: true });
console.log("(copy removed)");
