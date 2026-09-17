/// <reference types="bun-types" />
// m5-c2 addendum probe tool — receipts not covered by m5-facts-w2.out /
// r2.out / r4.out. Read-only COPY of db/custom.db, self-deleting.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5w2b.db";
rmSync(COPY, { force: true });
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  console.log(`\n== ${label}`);
  console.log(JSON.stringify(q(sql)));
};
const attempt = (label: string, sql: string) => {
  try { console.log(`${label} OK`, JSON.stringify(q(sql))); }
  catch (e) { console.log(`${label} THROWS:`, e instanceof Error ? e.message : String(e)); }
};

console.log("sqlite", db.query("SELECT sqlite_version() AS v").get());

// ---- cs-1270: October day composition + SUM(DISTINCT created_at) trap ----
show("october per-day census", "SELECT created_at d, COUNT(*) n FROM orders WHERE strftime('%Y-%m', created_at) = '2024-10' GROUP BY d ORDER BY d");
show("october SUM(DISTINCT created_at)", "SELECT SUM(DISTINCT created_at) s FROM orders WHERE strftime('%Y-%m', created_at) = '2024-10'");
attempt("october SUM(created_at) no distinct", "SELECT SUM(created_at) s FROM orders WHERE strftime('%Y-%m', created_at) = '2024-10'");
show("november per-day census", "SELECT COUNT(DISTINCT created_at) days, COUNT(*) n FROM orders WHERE strftime('%Y-%m', created_at) = '2024-11'");

// ---- cs-1278: %j bucket count + %d bucket composition ----
show("%j distinct buckets + counts", "SELECT COUNT(*) buckets, MIN(n) mn, MAX(n) mx FROM (SELECT strftime('%j', created_at) j, COUNT(*) n FROM orders GROUP BY j)");
show("%j census", "SELECT strftime('%j', created_at) j, COUNT(*) n FROM orders GROUP BY j ORDER BY n DESC LIMIT 6");
show("%d '04' bucket dates", "SELECT created_at d, COUNT(*) n FROM orders WHERE strftime('%d', created_at) = '04' GROUP BY d ORDER BY d");
show("%d '13' bucket dates", "SELECT created_at d, COUNT(*) n FROM orders WHERE strftime('%d', created_at) = '13' GROUP BY d ORDER BY d");
show("%d '19' bucket dates", "SELECT created_at d, COUNT(*) n FROM orders WHERE strftime('%d', created_at) = '19' GROUP BY d ORDER BY d");
show("%d 04/13/19 weekday codes", "SELECT strftime('%d', created_at) d, strftime('%w', created_at) dow, COUNT(*) n FROM orders WHERE strftime('%d', created_at) IN ('04','13','19') GROUP BY d, dow ORDER BY d, dow");

// ---- cs-1276: Shenzhen line rows (44 claimed vs r2's 47) ----
show("shenzhen storewide rows vs orders", "SELECT COUNT(*) rows_pulled, COUNT(DISTINCT o.id) orders FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Shenzhen Electro'");
show("shenzhen distinct line ids", "SELECT COUNT(DISTINCT oi.id) lines FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id WHERE s.name = 'Shenzhen Electro'");

// ---- cs-1255: '%d' quarter-formula shredding on customers ----
show("customers %d-quarter census", "SELECT ((CAST(strftime('%d', created_at) AS INTEGER) + 2) / 3) q, strftime('%Y', created_at) yr, COUNT(*) n FROM customers GROUP BY yr, q ORDER BY yr, q");
show("customers %d-quarter group count", "SELECT COUNT(*) groups, MIN(n) mn, MAX(n) mx FROM (SELECT ((CAST(strftime('%d', created_at) AS INTEGER) + 2) / 3) q, strftime('%Y', created_at) yr, COUNT(*) n FROM customers GROUP BY yr, q)");
show("customers 2023-Q4 SUM(id)", "SELECT SUM(id) s FROM customers WHERE strftime('%Y', created_at) = '2023'");
show("customers H1-2024 SUM(id)", "SELECT SUM(id) s FROM customers WHERE strftime('%Y-%m', created_at) BETWEEN '2024-01' AND '2024-06'");

// ---- cs-1259/cs-1249: julianday floats + weekdays ----
show("julianday pinned day", "SELECT julianday('2024-05-12') j12, julianday('2024-01-01') j1, MIN(created_at) mn FROM orders");
show("weekday of 2024-10-04", "SELECT strftime('%w', '2024-10-04') dow");

// ---- cs-1269: date('%H', …) silent NULL ----
attempt("date('%H') probe", "SELECT date('%H', created_at) hh, COUNT(*) n FROM orders GROUP BY hh");

// ---- cs-1264: distractor chains for the CTE snap shape ----
attempt("snap chain distractor weekday 1", "SELECT date('2024-02-11', 'start of month', '+1 month', 'weekday 1') e");
attempt("snap chain distractor +2 months", "SELECT date('2024-02-11', 'start of month', '+1 month', '+2 months') e");
attempt("snap chain distractor -2 day", "SELECT date('2024-02-11', 'start of month', '+1 month', '-2 day') e");

// ---- cs-1254: CTE-shaped window probe (marker once) ----
attempt("cs-1254 CTE shape", "WITH w AS (SELECT '2024-02-01' AS start_day) SELECT COUNT(*) AS n, MIN(created_at) AS first_day, MAX(created_at) AS last_day FROM orders, w WHERE created_at >= start_day AND created_at < date(start_day, 'start of month', '+1 month')");
attempt("cs-1264 CTE shape", "WITH batch AS (SELECT '2024-02-11' AS d) SELECT date(d, 'start of month') AS anchor, date(d, 'start of month', '+1 month', '-1 day') AS month_end FROM batch");

rmSync(COPY, { force: true });
console.log("\n(copy removed)");
