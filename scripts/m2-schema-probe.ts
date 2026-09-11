import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const tables = db.query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log("TABLES:", tables.map(t=>t.name).join(", "));
for (const t of tables.map(t=>t.name)) {
  const cols = db.query(`PRAGMA table_info(${t})`).all();
  const n = db.query(`SELECT COUNT(*) AS n FROM ${t}`).get();
  console.log(`\n-- ${t} (${n.n} rows):`);
  console.log("  " + cols.map(c => `${c.name}:${c.type}${c.pk?" PK":""}${c.notnull?" NN":""}${c.dflt_value!==null?` DEF=${c.dflt_value}`:""}`).join("\n  "));
}
const fks = db.query("SELECT * FROM pragma_foreign_key_list('orders')").all();
console.log("\norders FKs:", JSON.stringify(fks));
