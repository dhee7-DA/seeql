import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";
copyFileSync("db/custom.db", ".peek.db");
const db = new Database(".peek.db", { readonly: true });
const tables = db.query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log(tables.map(t => t.name).join(", "));
for (const t of tables) {
  const cols = db.query(`PRAGMA table_info(${t.name})`).all();
  console.log(`\n${t.name}: ${cols.map(c => `${c.name}:${c.type}`).join(", ")}`);
  console.log(`  rows: ${db.query(`SELECT COUNT(*) n FROM ${t.name}`).get().n}`);
}
db.close();
