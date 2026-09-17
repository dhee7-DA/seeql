// Schema + row-shape probe for Module 3 case batches s6–s8 (CASE / pivots / capstone).
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.m3w67.db");
const db = new Database("scripts/.m3w67.db", { readonly: true });

const q = (sql: string) => db.query(sql).all();
const show = (label: string, sql: string) => {
  try {
    console.log(`\n== ${label} ==`);
    console.log(JSON.stringify(q(sql)));
  } catch (e) {
    console.log(`\n== ${label} == ERROR: ${e instanceof Error ? e.message : e}`);
  }
};

// schema
const tables = q("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name") as { name: string }[];
for (const t of tables) {
  const cols = q(`PRAGMA table_info(${t.name})`) as { name: string; type: string }[];
  const n = (q(`SELECT COUNT(*) AS n FROM ${t.name}`) as { n: number }[])[0].n;
  console.log(`-- ${t.name} (${n} rows): ${cols.map((c) => `${c.name} ${c.type}`).join(", ")}`);
}

// value censuses for CASE material
show("order status census", "SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY n DESC");
show("payment method census", "SELECT method, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM payments GROUP BY method");
show("customer region census", "SELECT region, COUNT(*) AS n FROM customers GROUP BY region");
show("product category census", "SELECT category, COUNT(*) AS n FROM products GROUP BY category");
show("expense category census", "SELECT category, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0,2) AS money FROM expenses GROUP BY category");
show("refund status census", "SELECT status, COUNT(*) AS n FROM refunds GROUP BY status");

db.close();
