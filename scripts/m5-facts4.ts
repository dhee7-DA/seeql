import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";
copyFileSync("db/custom.db", ".m5f4.db");
const db = new Database(".m5f4.db", { readonly: true });
function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`[${label}]  (${rows.length} rows)`);
    rows.slice(0, 20).forEach(r => console.log("  " + Object.values(r).map(v => v === null ? "NULL" : String(v)).join(" | ")));
  } catch (e) { console.log(`[${label}]  ERROR: ${e instanceof Error ? e.message : e}`); }
}
q("X1 ntile4 over 14 months", `SELECT t, COUNT(*) n FROM (SELECT NTILE(4) OVER (ORDER BY mo) t FROM (SELECT strftime('%Y-%m', created_at) mo FROM orders GROUP BY mo)) GROUP BY t`);
q("X2 null concat poisons", `SELECT id, 'on ' || shipped_at tag FROM orders WHERE shipped_at IS NULL LIMIT 2`);
q("X3 julianday on bucket text", `SELECT JULIANDAY('2024-01') jd_bucket, JULIANDAY('2024-01-01') jd_full`);
q("X4 orders in 2024-01 for capstone", `SELECT o.id, c.name, o.total, o.created_at FROM orders o JOIN customers c ON c.id=o.customer_id WHERE strftime('%Y-%m', o.created_at)='2024-01' ORDER BY o.total DESC LIMIT 3`);
q("X5 avg per month orders", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, AVG(total) a, COUNT(*) n FROM orders GROUP BY mo) SELECT mo, ROUND(a,2) a, n FROM m ORDER BY a DESC LIMIT 3`);
q("X6 region MoM for capstone", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, c.region, SUM(o.total) spend FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY mo, c.region) SELECT mo, region, ROUND(spend,2) spend FROM m WHERE mo='2024-08' ORDER BY spend DESC`);
db.close();
rmSync(".m5f4.db", { force: true });
