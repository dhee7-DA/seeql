/// <reference types="bun-types" />
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
let n = 246;
const q = (label: string, sql: string) => {
  n++;
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const cells = rows.map((r) => Object.values(r).map((v) => (v === null ? "NULL" : typeof v === "number" ? (Number.isInteger(v) ? v : Number(v.toFixed(6))) : v)).join(" | "));
    console.log(`T${String(n).padStart(2, "0")} ${label}`);
    console.log(`   ${cells.slice(0, 22).join("  ;;  ") || "(0 rows)"}`);
  } catch (e) {
    console.log(`T${String(n).padStart(2, "0")} ${label} ERROR: ${e instanceof Error ? e.message : e}`);
  }
};
q("order-count distribution", `SELECT n_orders, COUNT(*) members FROM (SELECT customer_id, COUNT(*) n_orders FROM orders GROUP BY customer_id) GROUP BY n_orders ORDER BY n_orders`);
q("per-status busiest month by count", `SELECT status, mo, n FROM (SELECT status, strftime('%Y-%m', created_at) mo, COUNT(*) n, ROW_NUMBER() OVER (PARTITION BY status ORDER BY COUNT(*) DESC) rn FROM orders GROUP BY status, mo) WHERE rn = 1`);
q("top-2 per category price count", `SELECT COUNT(*) FROM (SELECT category, ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) rn FROM products) WHERE rn <= 2`);
q("top-2 per category price>30 count", `SELECT COUNT(*) FROM (SELECT category, ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) rn FROM products WHERE price > 30) WHERE rn <= 2`);
q("bruno order gaps max", `SELECT MAX(g) FROM (SELECT julianday(created_at) - LAG(julianday(created_at)) OVER (ORDER BY created_at) g FROM orders WHERE customer_id = 2)`);
q("gaps exactly 30", `SELECT COUNT(*) FROM (SELECT julianday(created_at) - LAG(julianday(created_at)) OVER (PARTITION BY customer_id ORDER BY created_at) g FROM orders) WHERE g = 30`);
q("signup gaps distinct", `SELECT COUNT(*) FROM (SELECT julianday(created_at) - LAG(julianday(created_at)) OVER (ORDER BY created_at) g FROM customers)`);
q("delivered leaderboard top3", `WITH s AS (SELECT c.name, ROUND(SUM(o.total),2) spend FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status = 'delivered' GROUP BY c.id) SELECT name, spend FROM s ORDER BY spend DESC LIMIT 3`);
q("running 25000 crossings", `WITH m AS (SELECT strftime('%Y-%m', created_at) mo, SUM(total) rev FROM orders GROUP BY mo), r AS (SELECT mo, SUM(rev) OVER (ORDER BY mo) run FROM m) SELECT COUNT(*) FROM r WHERE run < 25000`);
db.close();
