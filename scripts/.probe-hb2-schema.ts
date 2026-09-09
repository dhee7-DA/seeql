// Pass A: schema + broad stats for cases-chb2 authoring. READ-ONLY on the copy.
import { Database } from "bun:sqlite";
const db = new Database("scripts/.probe-hb2.db", { readonly: true });

const tables = db
  .query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all() as { name: string }[];
console.log("TABLES:", tables.map((t) => t.name).join(", "));

for (const t of tables.map((t) => t.name)) {
  if (t.startsWith("sqlite")) continue;
  const cols = db.query(`PRAGMA table_info(${t})`).all() as any[];
  console.log(`\n== ${t} ==`);
  console.log(cols.map((c) => `${c.name}:${c.type}`).join(" | "));
  const n = db.query(`SELECT COUNT(*) AS n FROM ${t}`).get() as any;
  console.log("rows:", n.n);
}

// orders stats
console.log("\n-- orders by status --");
console.log(db.query("SELECT status, COUNT(*) n, COUNT(shipped_at) shipped FROM orders GROUP BY status").all());
console.log("date range:", db.query("SELECT MIN(created_at) a, MAX(created_at) b FROM orders").get());
console.log("per customer order counts:", db.query("SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id ORDER BY n DESC").all());

// customers
console.log("\n-- customers by region --");
console.log(db.query("SELECT region, COUNT(*) n FROM customers GROUP BY region").all());
const ccols = db.query("PRAGMA table_info(customers)").all() as any[];
for (const c of ccols) {
  const nn = db.query(`SELECT COUNT(*) n FROM customers WHERE ${c.name} IS NULL`).get() as any;
  if (nn.n > 0) console.log(`customers.${c.name} NULLs:`, nn.n);
}

// products
console.log("\n-- products by category --");
console.log(db.query("SELECT category, COUNT(*) n, MIN(price) mn, MAX(price) mx FROM products GROUP BY category").all());
console.log("by supplier:", db.query("SELECT supplier_id, COUNT(*) n FROM products GROUP BY supplier_id").all());
const pcols = db.query("PRAGMA table_info(products)").all() as any[];
for (const c of pcols) {
  const nn = db.query(`SELECT COUNT(*) n FROM products WHERE ${c.name} IS NULL`).get() as any;
  if (nn.n > 0) console.log(`products.${c.name} NULLs:`, nn.n);
}

// expenses schema/sample
console.log("\n-- expenses sample --");
console.log(db.query("SELECT * FROM expenses LIMIT 5").all());

// any other table NULL cols (order_items etc.)
for (const t of ["order_items"]) {
  const cols = db.query(`PRAGMA table_info(${t})`).all() as any[];
  for (const c of cols) {
    const nn = db.query(`SELECT COUNT(*) n FROM ${t} WHERE ${c.name} IS NULL`).get() as any;
    if (nn.n > 0) console.log(`${t}.${c.name} NULLs:`, nn.n);
  }
}
db.close();
