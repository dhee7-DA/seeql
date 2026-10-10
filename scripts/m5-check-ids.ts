import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";
copyFileSync("db/custom.db", ".m5chk.db");
const db = new Database(".m5chk.db", { readonly: true });
console.log(db.query("SELECT id, name, region FROM customers WHERE id IN (14,15,16)").all());
db.close(); rmSync(".m5chk.db", { force: true });
