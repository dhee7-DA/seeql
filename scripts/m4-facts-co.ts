import { Database } from "bun:sqlite";
import { copyFileSync, rmSync, existsSync } from "node:fs";
const SRC = "db/custom.db", COPY = ".m4co3.db";
if (existsSync(COPY)) rmSync(COPY);
copyFileSync(SRC, COPY);
const db = new Database(COPY, { readonly: true });
console.log("LATAM:", JSON.stringify(db.query(`SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n FROM customers c WHERE c.region = 'LATAM'`).all()));
db.close();
