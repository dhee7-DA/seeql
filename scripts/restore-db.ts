// Restore db/custom.db to full 9-table state after the dev-server watchdog
// wipes the finance tables (known incident — see worklog m3-full / audit-1).
// Runs the app's own self-heal path (ensureDatabase) then verifies counts.
// Run: bun scripts/restore-db.ts
import { ensureDatabase } from "../src/lib/sample-db";
import { Database } from "bun:sqlite";

await ensureDatabase();

const db = new Database("db/custom.db", { readonly: true });
const tables = db
  .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  .all()
  .map((r: Record<string, unknown>) => r.name as string);
console.log("tables:", tables.join(", "));
for (const t of tables) {
  const { n } = db.query(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number };
  console.log(`  ${t}: ${n} rows`);
}
db.close();
process.exit(0);
