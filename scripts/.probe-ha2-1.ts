import { Database } from "bun:sqlite";
const db = new Database("scripts/.probe-ha2.db", { readonly: true });
const tables = db.query("SELECT name, sql FROM sqlite_master WHERE type='table'").all() as any[];
for (const t of tables) console.log(t.name, "::", (t.sql as string).replace(/\s+/g," "));
console.log("---counts---");
for (const t of tables) {
  const n = (db.query(`SELECT COUNT(*) AS n FROM ${t.name}`).all() as any[])[0].n;
  console.log(t.name, n);
}
