import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const rows = db.query(`SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`).all() as any[];
for (const r of rows) console.log(r.sql + ";\n");
