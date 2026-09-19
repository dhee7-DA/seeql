// Round 2 — fix the empties: silent-bug results, alternative interview items,
// predict misconception grids.
const API = "http://localhost:3000/api/query";
async function run(sql: string) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });
  return (await res.json()) as { ok: boolean; error?: string; columns?: string[]; rows?: unknown[][]; changes?: number | null; plan?: Array<{ detail: string }> | null };
}
function fmt(d: { ok: boolean; error?: string; columns?: string[]; rows?: unknown[][]; changes?: number | null }) {
  if (!d.ok) return "ERR: " + d.error;
  const head = (d.columns ?? []).join(" | ");
  const body = (d.rows ?? []).slice(0, 30).map((r) => r.map((v) => (v === null ? "NULL" : String(v))).join(" | ")).join("\n");
  const chg = d.changes != null ? `  (changes=${d.changes})` : "";
  return `${head}\n${body}${chg}\n  [${d.rows?.length ?? 0} rows]`;
}
const Q: Array<[string, string]> = [
  // silent-bug clinic evidence
  ["e4r", "SELECT COUNT(*), city FROM customers"],
  ["e5r", "SELECT COUNT(*) AS n FROM customers WHERE active = 'yes'"],
  ["e6r", "SELECT COUNT(*) AS cartesian FROM orders INNER JOIN customers"],
  ["e10r", "SELECT COUNT(*) AS n FROM orders WHERE shipped_at = NULL"],
  ["e12r", "SELECT customer_id, SUM(total) FROM orders GROUP BY status LIMIT 6"],
  // predict fixes + misconception grids
  ["p1b", "SELECT COUNT(*) FROM customers WHERE region = 'US'"],
  ["p1b-wrong1", "SELECT COUNT(*) FROM customers WHERE region = 'US' AND active = 1"],
  ["p1b-wrong2", "SELECT COUNT(*) FROM customers"],
  ["p2-wrong-dupes", "SELECT city, COUNT(*) AS n FROM customers GROUP BY city HAVING COUNT(*) > 1"],
  ["p8b", "SELECT COUNT(*) AS pairs FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status = 'pending'"],
  ["p8b-wrong", "SELECT COUNT(*) AS orders_pending FROM orders WHERE status = 'pending'"],
  ["p4-nullsum", "SELECT status, COUNT(*) AS n, ROUND(SUM(total), 2) AS value FROM orders WHERE shipped_at IS NULL GROUP BY status ORDER BY status"],
  // interview replacements
  ["i3b", "SELECT p.name, p.category, p.price FROM products p WHERE p.price = (SELECT MAX(price) FROM products WHERE category = p.category) ORDER BY p.category"],
  ["i4b", "SELECT p.id, p.name FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.id IS NULL ORDER BY p.id"],
  ["i9", "SELECT category, name, price, RANK() OVER (PARTITION BY category ORDER BY price DESC) AS rnk FROM (SELECT 'x' AS x) WHERE 0"],
  ["i9b", "SELECT name, category, price FROM (SELECT name, category, price, RANK() OVER (PARTITION BY category ORDER BY price DESC) AS rnk FROM products) WHERE rnk = 1 ORDER BY category"],
  ["i10", "SELECT status, COUNT(*) AS orders, ROUND(SUM(total), 2) AS revenue FROM orders GROUP BY status ORDER BY revenue DESC"],
  ["i11", "SELECT s.name, s.rating FROM suppliers s WHERE s.rating >= (SELECT AVG(rating) FROM suppliers) ORDER BY s.rating DESC"],
  ["i12", "SELECT number, amount_cents FROM invoices WHERE amount_cents > (SELECT AVG(amount_cents) FROM invoices) ORDER BY amount_cents DESC LIMIT 4"],
  // golf g6 sanity: how many products > 100 & in stock
  ["g6c", "SELECT name, price FROM products WHERE price > 100 AND stock > 0 ORDER BY price DESC"],
];
console.log("=== ROUND 2 ===");
for (const [id, sql] of Q) {
  const d = await run(sql);
  console.log(`\n[${id}] ${sql}\n${fmt(d)}`);
}
