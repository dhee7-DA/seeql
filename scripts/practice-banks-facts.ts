// Probe the live db (via the running dev server) for every fact the new
// practice banks will ship: predict grids, error messages, golf pars,
// interview expected results. Prints a facts receipt; banks are authored
// only from what this prints.
import { writeFileSync } from "node:fs";

const API = "http://localhost:3000/api/query";

async function run(sql: string, opts: { sandbox?: boolean; verify?: string } = {}) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql, ...opts }),
  });
  return (await res.json()) as {
    ok: boolean;
    error?: string;
    columns?: string[];
    rows?: unknown[][];
    changes?: number | null;
    plan?: Array<{ detail: string }> | null;
  };
}

function grid(d: { columns?: string[]; rows?: unknown[][] }) {
  return { columns: d.columns ?? [], rows: d.rows ?? [] };
}

function fmtGrid(g: { columns: string[]; rows: unknown[][] }): string {
  const lines = [g.columns.join(" | ")];
  for (const r of g.rows) lines.push(r.map((v) => (v === null ? "NULL" : String(v))).join(" | "));
  return lines.join("\n");
}

const facts: Record<string, unknown> = {};

// ---- 1. PREDICT banks: [id, sql, ordered?] ---------------------------------
const PREDICT: Array<[string, string]> = [
  ["p1", "SELECT COUNT(*) FROM customers WHERE region = 'north'"],
  ["p2", "SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC, city LIMIT 3"],
  ["p3", "SELECT COUNT(*) AS with_email_like FROM customers WHERE email LIKE '%@example.com'"],
  ["p4", "SELECT status, COUNT(*) AS n, ROUND(SUM(total), 2) AS value FROM orders GROUP BY status ORDER BY status"],
  ["p5", "SELECT COUNT(*) AS shipped_null FROM orders WHERE shipped_at IS NULL"],
  ["p6", "SELECT COUNT(*) AS big_orders FROM orders WHERE total >= 500"],
  ["p7", "SELECT DISTINCT region FROM customers ORDER BY region"],
  ["p8", "SELECT COUNT(*) AS pairs FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status = 'returned'"],
];
console.log("=== PREDICT ===");
facts.predict = {};
for (const [id, sql] of PREDICT) {
  const d = await run(sql);
  facts.predict[id] = { sql, ordered: /ORDER BY/.test(sql), ...grid(d) };
  console.log(`\n[${id}] ${sql}\n${d.ok ? fmtGrid(grid(d)) : "ERR " + d.error}`);
}

// ---- 2. ERROR clinic: broken SQL → real error ------------------------------
const BROKEN: Array<[string, string]> = [
  ["e1", "SELECT name FROM customers WHERE city = 'Springfield"],
  ["e2", "SELECT name FROM custumers WHERE region = 'north'"],
  ["e3", "SELECT name, region FROM customers WHERE region = 'north' AND"],
  ["e4", "SELECT COUNT(*), city FROM customers"],
  ["e5", "SELECT name FROM customers WHERE active = 'yes' LIMIT 5"],
  ["e6", "SELECT orders.id, customers.name FROM orders INNER JOIN customers"],
  ["e7", "SELECT AVG(price) AS average FROM products ORDER BY average DESC HAVING average > 10"],
  ["e8", "SELECT region COUNT(*) FROM customers GROUP BY region"],
  ["e9", "SELECT name FROM customers LIMIT 'five'"],
  ["e10", "SELECT * FROM orders WHERE shipped_at = NULL"],
  ["e11", "INSERT INTO products (name) VALUES ('Test widget')"],
  ["e12", "SELECT customer_id, SUM(total) FROM orders GROUP BY status"],
];
console.log("\n\n=== ERRORS ===");
facts.errors = {};
for (const [id, sql] of BROKEN) {
  const d = await run(sql);
  facts.errors[id] = { sql, ok: d.ok, error: d.error ?? null };
  console.log(`\n[${id}] ${sql}\n  → ${d.ok ? "RAN OK (needs rethink!)" : d.error}`);
}

// ---- 3. GOLF holes: verbose starter vs par solution ------------------------
const GOLF: Array<[string, string, string]> = [
  ["g1",
    // starter: SELECT * then filter in the head — clause count 4
    "SELECT * FROM customers WHERE region = 'north' ORDER BY name LIMIT 10",
    "SELECT id, name FROM customers WHERE region = 'north' ORDER BY name LIMIT 5"],
  ["g2",
    "SELECT city FROM customers WHERE active = 1 GROUP BY city",
    "SELECT DISTINCT city FROM customers WHERE active = 1"],
  ["g3",
    "SELECT region, COUNT(*) AS n FROM customers GROUP BY region HAVING n >= 2 ORDER BY n DESC",
    "SELECT region, COUNT(*) n FROM customers GROUP BY region HAVING COUNT(*) >= 2 ORDER BY 2 DESC"],
  ["g4",
    "SELECT c.name, SUM(o.total) AS spent FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.name HAVING SUM(o.total) > 1000 ORDER BY spent DESC",
    "SELECT c.name, SUM(o.total) spent FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING SUM(o.total) > 1000"],
  ["g5",
    "SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE total > 800)",
    "SELECT DISTINCT c.name FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.total > 800"],
  ["g6",
    "SELECT products.name FROM products WHERE price > 100 AND stock > 0 ORDER BY price DESC",
    "SELECT name FROM products WHERE price > 100 AND stock > 0 ORDER BY price DESC LIMIT 3"],
];
console.log("\n\n=== GOLF ===");
facts.golf = {};
for (const [id, starter, par] of GOLF) {
  const a = await run(starter);
  const b = await run(par);
  const same = a.ok && b.ok && JSON.stringify(a.rows) === JSON.stringify(b.rows)
    ? "identical-ordered"
    : a.ok && b.ok && JSON.stringify([...(a.rows ?? [])].sort()) === JSON.stringify([...(b.rows ?? [])].sort())
      ? "same-unordered"
      : "DIFFERENT";
  const planB = (b.plan ?? []).length;
  console.log(`\n[${id}] starter rows=${a.rows?.length} par rows=${b.rows?.length} → ${same} · par plan steps=${planB}\n  par: ${par}\n  starter: ${starter}`);
  facts.golf[id] = { starter, par, starterRows: a.rows?.length ?? 0, parRows: b.rows?.length ?? 0, same, planSteps: planB, parPlan: b.plan?.map((p) => p.detail) ?? [] };
}

// ---- 4. INTERVIEW track: solutions → expected grids ------------------------
const INTERVIEW: Array<[string, string]> = [
  ["i1", "SELECT name, lifetime FROM (SELECT 1)"], // placeholder replaced below
];
const IV: Array<[string, string]> = [
  ["i1", "SELECT name, price FROM products p WHERE price = (SELECT MAX(price) FROM products)"],
  ["i2", "SELECT MAX(price) AS second_price FROM products WHERE price < (SELECT MAX(price) FROM products)"],
  ["i3", "SELECT city, COUNT(*) AS members FROM customers GROUP BY city HAVING COUNT(*) > 1 ORDER BY members DESC, city"],
  ["i4", "SELECT c.name, c.email FROM customers c WHERE c.id NOT IN (SELECT customer_id FROM orders) ORDER BY c.name"],
  ["i5", "SELECT p.name, SUM(oi.quantity) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id ORDER BY units DESC, p.name LIMIT 3"],
  ["i6", "SELECT customer_id, total, created_at, ROUND(AVG(total) OVER (PARTITION BY customer_id), 2) AS cust_avg FROM orders WHERE customer_id = 1 ORDER BY created_at"],
  ["i7", "SELECT status, COUNT(*) AS n FROM orders WHERE status = 'returned' GROUP BY status"],
  ["i8", "SELECT ROUND(AVG(days), 2) AS avg_days FROM (SELECT JULIANDAY(shipped_at) - JULIANDAY(created_at) AS days FROM orders WHERE shipped_at IS NOT NULL)"],
];
console.log("\n\n=== INTERVIEW ===");
facts.interview = {};
for (const [id, sql] of IV) {
  const d = await run(sql);
  console.log(`\n[${id}] ${sql}\n${d.ok ? fmtGrid(grid(d)) : "ERR " + d.error}`);
  facts.interview[id] = { sql, ...grid(d), rows: d.rows ?? [], columns: d.columns ?? [] };
}

writeFileSync("/home/z/my-project/tool-results/practice-banks-facts.json", JSON.stringify(facts, null, 2));
console.log("\n\nfacts saved → tool-results/practice-banks-facts.json");
