import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";
copyFileSync("db/custom.db", ".m5f5.db");
const db = new Database(".m5f5.db", { readonly: true });
try {
  const rows = db.query(`SELECT id, LAST_VALUE(shipped_at) IGNORE NULLS OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) last_ship FROM orders ORDER BY id LIMIT 6`).all();
  rows.forEach(r => console.log(Object.values(r).map(v => v === null ? "NULL" : String(v)).join(" | ")));
} catch (e) { console.log("ERROR: " + (e instanceof Error ? e.message : e)); }
db.close(); rmSync(".m5f5.db", { force: true });
