import { Database } from "bun:sqlite";
const db = new Database("/home/z/my-project/db/custom.db", { readonly: true });
console.log(db.query("SELECT COUNT(*) n FROM invoices").get());
db.close();
console.log("done");
