// M5 FACTS PROBE round 2 — targeted follow-ups.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5f2.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string, max = 22) {
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

// 1. rank by REGION name — the engineered tie (lesson-31 claim)
q("R01 rank by region name", `SELECT name, region, RANK() OVER (ORDER BY region) rk, DENSE_RANK() OVER (ORDER BY region) drk FROM customers ORDER BY rk, name`);
// 2. rank by status on orders — big tie groups
q("R02 rank by status", `SELECT status, RANK() OVER (ORDER BY status) rk, DENSE_RANK() OVER (ORDER BY status) drk, COUNT(*) OVER (PARTITION BY status) grp_n FROM orders ORDER BY rk LIMIT 3`);
q("R03 status groups", `SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY status`);
q("R04 status rank blocks", `SELECT DISTINCT RANK() OVER (ORDER BY status) rk, DENSE_RANK() OVER (ORDER BY status) drk, status, COUNT(*) OVER (PARTITION BY status) n FROM orders ORDER BY rk`);
// 3. T07 fixed: real @ counter
q("R05 at-counter fixed", `SELECT COUNT(*) n FROM customers WHERE LENGTH(email) - LENGTH(REPLACE(email, '@', '')) = 1`);
q("R06 coercion trap", `SELECT LENGTH(email) - REPLACE(email, '@', '') broken FROM customers LIMIT 2`);
// 4. NTILE uneven
q("R07 ntile3 16 rows", `SELECT NTILE(3) OVER (ORDER BY id) t, COUNT(*) n FROM customers GROUP BY t ORDER BY t`);
q("R08 ntile5 103", `SELECT NTILE(5) OVER (ORDER BY id) t, COUNT(*) n FROM orders GROUP BY t ORDER BY t`);
// 5. LAST_VALUE default-frame trap
q("R09 last_value default trap", `SELECT id, LAST_VALUE(total) OVER (ORDER BY id) lv FROM orders ORDER BY id LIMIT 3`);
q("R10 last_value fixed frame", `SELECT id, LAST_VALUE(total) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) lv FROM orders ORDER BY id LIMIT 3`);
q("R11 first_value", `SELECT id, FIRST_VALUE(total) OVER (ORDER BY id) fv, FIRST_VALUE(total) OVER (ORDER BY id DESC) biggest FROM orders ORDER BY id LIMIT 3`);
// 6. LAG negative & zero offset values
q("R12 lag neg offset values", `SELECT id, total, LAG(total, -1) OVER (ORDER BY id) neg FROM orders ORDER BY id LIMIT 3`);
q("R13 lag zero offset", `SELECT id, total, LAG(total, 0) OVER (ORDER BY id) same FROM orders ORDER BY id LIMIT 3`);
// 7. exclude-current frame
q("R14 rows 2prec..1prec", `SELECT id, SUM(total) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING) s FROM orders ORDER BY id LIMIT 4`);
// 8. window counts filtered rows (WHERE runs before windows)
q("R15 count over after where", `SELECT COUNT(*) OVER () n FROM orders WHERE status='pending' LIMIT 1`);
q("R16 avg over after where", `SELECT ROUND(AVG(total) OVER (), 2) a FROM orders WHERE region_probe IS NULL LIMIT 1`);
// 9. per-customer running totals
q("R17 cust running totals", `SELECT customer_id, id, ROUND(SUM(total) OVER (PARTITION BY customer_id ORDER BY id), 2) run FROM orders ORDER BY customer_id, id LIMIT 6`);
// 10. dup totals in orders (window tie census)
q("R18 dup order totals", `SELECT total, COUNT(*) n FROM orders GROUP BY total HAVING n > 1 ORDER BY total DESC LIMIT 5`);
// 11. window in ORDER BY of outer query (legal?)
q("R19 order-by window", `SELECT id, total FROM orders ORDER BY RANK() OVER (ORDER BY total) LIMIT 2`);
// 12. expenses running by month
q("R20 expense running", `WITH m AS (SELECT strftime('%Y-%m', spent_on) mo, SUM(amount_cents)/100.0 spend FROM expenses GROUP BY mo) SELECT mo, ROUND(spend,0) spend, ROUND(SUM(spend) OVER (ORDER BY mo), 0) run FROM m ORDER BY mo LIMIT 5`);
// 13. rank inside GROUP BY with WHERE pre-filter
q("R21 rank filtered spenders", `SELECT c.region, ROUND(SUM(o.total),2) spend, RANK() OVER (ORDER BY SUM(o.total) DESC) rk FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.status='delivered' GROUP BY c.id ORDER BY rk LIMIT 4`);
// 14. LEAD across partition boundary — does NOT cross
q("R22 lead partition last", `WITH t AS (SELECT customer_id, id, LEAD(id) OVER (PARTITION BY customer_id ORDER BY id) nxt FROM orders) SELECT COUNT(*) n FROM t WHERE nxt IS NULL`);
// 15. ntile fractional coercion value
q("R23 ntile 2.5 buckets", `SELECT NTILE(2.5) OVER (ORDER BY id) t, COUNT(*) n FROM customers GROUP BY t`);
// 16. RANK() OVER () values
q("R24 rank empty over values", `SELECT DISTINCT RANK() OVER () v FROM orders`);
// 17. weekday name mapping check: 2024-01-05 is a Friday
q("R25 dow check", `SELECT created_at, strftime('%w', created_at) dow FROM orders WHERE id <= 5`);
// 18. invoice lag per customer
q("R26 invoice lag", `SELECT customer_id, number, issued_on, LAG(issued_on) OVER (PARTITION BY customer_id ORDER BY issued_on) prev FROM invoices ORDER BY customer_id, issued_on LIMIT 5`);
// 19. customers active flag census (for CASE-y text drills)
q("R27 active census", `SELECT active, COUNT(*) n FROM customers GROUP BY active`);
// 20. city census for text drills
q("R28 city lengths", `SELECT city, LENGTH(city) len FROM customers ORDER BY len DESC LIMIT 4`);

db.close();
rmSync(COPY, { force: true });
console.log("\nDONE m5-facts2");
