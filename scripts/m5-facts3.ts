import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";
copyFileSync("db/custom.db", ".m5f3.db");
const db = new Database(".m5f3.db", { readonly: true });
function q(label: string, sql: string) {
  const rows = db.query(sql).all() as Record<string, unknown>[];
  console.log(`[${label}]  (${rows.length} rows)`);
  rows.forEach(r => console.log("  " + Object.values(r).map(v => v === null ? "NULL" : String(v)).join(" | ")));
}
q("N1 ntile3 over 16 customers", `SELECT t, COUNT(*) n FROM (SELECT NTILE(3) OVER (ORDER BY id) t FROM customers) GROUP BY t`);
q("N2 ntile5 over 103 orders", `SELECT t, COUNT(*) n FROM (SELECT NTILE(5) OVER (ORDER BY id) t FROM orders) GROUP BY t`);
q("N3 ntile2.5 coercion", `SELECT t, COUNT(*) n FROM (SELECT NTILE(2.5) OVER (ORDER BY id) t FROM customers) GROUP BY t`);
q("N4 ntile4 region order", `SELECT t, region, COUNT(*) n FROM (SELECT region, NTILE(4) OVER (ORDER BY region) t FROM customers) GROUP BY t, region ORDER BY t`);
db.close();
rmSync(".m5f3.db", { force: true });
