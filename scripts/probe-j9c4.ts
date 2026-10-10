// j9-c probe round 4 — last-two-slot corridors (fraud same-day bursts,
// logistics same-ship-day, cash cross-ticket method contrast) + cs-323
// month-close pair-book design details. Self-copies + self-cleans
// scripts/.tmp-j9c.db. Run from PROJECT ROOT: bun scripts/probe-j9c4.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.tmp-j9c.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const q = (sql: string) => db.query(sql).all();
const one = (sql: string) => JSON.stringify(q(sql));
const show = (label: string, sql: string) => {
  console.log(`\n== ${label} ==`);
  try {
    const rows = q(sql);
    for (const r of rows) console.log(JSON.stringify(r));
    if (rows.length === 0) console.log("(0 rows)");
  } catch (e) {
    console.log("ERROR:", e instanceof Error ? e.message : e);
  }
};

// ---------- A. same-day order bursts per buyer (fraud corridor) ----------
show("same-day pairs per buyer", `
SELECT c.name, COUNT(*) pairs
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
JOIN customers c ON c.id = o1.customer_id
WHERE substr(o1.created_at,1,10) = substr(o2.created_at,1,10)
GROUP BY c.id ORDER BY pairs DESC, c.name`);
show("same-day pairs total", `
SELECT COUNT(*) n FROM orders o1 JOIN orders o2
  ON o1.customer_id = o2.customer_id AND o1.id < o2.id
WHERE substr(o1.created_at,1,10) = substr(o2.created_at,1,10)`);
show("same-day bursts rows", `
SELECT c.name, o1.id t1, o2.id t2, substr(o1.created_at,1,10) day,
       ROUND(o1.total,2) a, ROUND(o2.total,2) b
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
JOIN customers c ON c.id = o1.customer_id
WHERE substr(o1.created_at,1,10) = substr(o2.created_at,1,10)
ORDER BY day, o1.id`);
show("same-day + combined exposure over 1000", `
SELECT c.name, o1.id t1, o2.id t2, substr(o1.created_at,1,10) day,
       ROUND(o1.total + o2.total, 2) burst_total
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
JOIN customers c ON c.id = o1.customer_id
WHERE substr(o1.created_at,1,10) = substr(o2.created_at,1,10)
  AND o1.total + o2.total >= 1000
ORDER BY burst_total DESC`);
show("created_at time component check", `
SELECT COUNT(*) n FROM orders WHERE created_at NOT LIKE '____-__-__ %'`);

// ---------- B. same-ship-day pairs (logistics corridor) ----------
show("shipped same-day pairs per buyer", `
SELECT c.name, COUNT(*) pairs
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
JOIN customers c ON c.id = o1.customer_id
WHERE o1.shipped_at IS NOT NULL AND o2.shipped_at IS NOT NULL
  AND substr(o1.shipped_at,1,10) = substr(o2.shipped_at,1,10)
GROUP BY c.id ORDER BY pairs DESC`);
show("shipped same-day total", `
SELECT COUNT(*) n FROM orders o1 JOIN orders o2
  ON o1.customer_id = o2.customer_id AND o1.id < o2.id
WHERE substr(o1.shipped_at,1,10) = substr(o2.shipped_at,1,10)`);
show("never-shipped census", `
SELECT status, COUNT(*) n FROM orders WHERE shipped_at IS NULL GROUP BY status`);
show("cross-status shipped x delivered pairs", `
SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id
WHERE o1.status = 'shipped' AND o2.status = 'delivered'`);

// ---------- C. cash corridor: cross-ticket method contrast ----------
show("method contrast pairs (same buyer, different methods)", `
SELECT c.name, COUNT(*) pairs
FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id
JOIN payments p2 ON p1.id < p2.id
JOIN orders o2 ON o2.id = p2.order_id
JOIN customers c ON c.id = o1.customer_id
WHERE o1.customer_id = o2.customer_id AND p1.method <> p2.method
GROUP BY c.id ORDER BY pairs DESC`);

db.close();
rmSync(COPY, { force: true });
console.log("\nprobe-j9c4 done (copy cleaned)");
