// Truth probe for the lesson-48 index 3D scene (d48-index-space-3d).
// Every number rendered in the scene must come from this run.
// The seed db is opened READONLY; the CREATE INDEX demo runs on a copy.
import { Database } from "bun:sqlite";
import { cpSync, mkdirSync } from "node:fs";

const db = new Database("db/custom.db", { readonly: true });
const q = (s: string) => db.query(s).all();
const one = (s: string) => db.query(s).get() as Record<string, unknown>;

console.log("== base facts ==");
console.log("orders:", one(`SELECT COUNT(*) n FROM orders`));
console.log("customers:", one(`SELECT COUNT(*) n FROM customers`));
console.log("orders customer_id=1:", one(`SELECT COUNT(*) n FROM orders WHERE customer_id = 1`));
console.log("distinct customer_ids in orders:", one(`SELECT COUNT(DISTINCT customer_id) n FROM orders`));
console.log("orders status='shipped':", one(`SELECT COUNT(*) n FROM orders WHERE status = 'shipped'`));

console.log("== existing indexes on orders (sqlite_master) ==");
console.log(q(`SELECT name, sql FROM sqlite_master WHERE tbl_name = 'orders' AND type = 'index'`));

console.log("== EQP pre-index (exact detail strings) ==");
console.log(q(`EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 1`));

console.log("== scatter: which of the 103 rowid positions belong to customer_id=1 ==");
const scatter = q(`SELECT ROW_NUMBER() OVER (ORDER BY id) AS pos, customer_id
                   FROM orders WHERE customer_id = 1 ORDER BY id`);
console.log("matched positions (1-based):", scatter.map((r) => r.pos).join(","));
console.log("matched count:", scatter.length);

console.log("== per-customer order counts (sorted by id — the index keys) ==");
const keys = q(`SELECT customer_id, COUNT(*) n FROM orders GROUP BY customer_id ORDER BY customer_id`);
console.log(keys);

console.log("== customer_id=1 = Alice? ==");
console.log(one(`SELECT c.name FROM customers c WHERE c.id = 1`));

db.close();

// ---- mutation demo on a throwaway copy ----
mkdirSync("scripts/tmp", { recursive: true });
cpSync("db/custom.db", "scripts/tmp/index-probe.db");
const db2 = new Database("scripts/tmp/index-probe.db");
const q2 = (s: string) => db2.query(s).all();
console.log("== EQP post CREATE INDEX (on a copy — seed untouched) ==");
db2.exec(`CREATE INDEX idx_orders_customer ON orders(customer_id)`);
console.log(q2(`EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 1`));
console.log("== status plan with idx_orders_status, for flavor ==");
db2.exec(`CREATE INDEX idx_orders_status ON orders(status)`);
console.log(q2(`EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'shipped'`));
db2.close();
