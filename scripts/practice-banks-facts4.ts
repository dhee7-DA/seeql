// Round 4 — verify golf hole facts: region counts (g3 HAVING redundant?),
// active count (e5 receipt), g5 starter≡par equality.
const API = "http://localhost:3000/api/query";
async function run(sql: string) {
  const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sql }) });
  return (await res.json()) as { ok: boolean; error?: string; columns?: string[]; rows?: unknown[][] };
}
const g5a = "SELECT p.name,\n       (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) AS items\nFROM products p;";
const g5b = "SELECT p.name, COUNT(oi.id) AS items\nFROM products p\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY p.id;";
const Q: Array<[string, string]> = [
  ["regions", "SELECT region, COUNT(*) AS n FROM customers GROUP BY region ORDER BY region"],
  ["active", "SELECT COUNT(*) FROM customers WHERE active = 1"],
  ["inactive", "SELECT COUNT(*) FROM customers WHERE active = 0"],
  ["g5a", g5a],
  ["g5b", g5b],
];
const out: Record<string, unknown> = {};
for (const [id, sql] of Q) {
  const d = await run(sql);
  console.log(`\n[${id}] ${(d.rows ?? []).slice(0, 20).map((r) => JSON.stringify(r)).join("\n")}`);
  out[id] = d.rows;
}
const a = JSON.stringify((out.g5a as unknown[][])?.map((r) => [...r].sort((x, y) => String(x[0]).localeCompare(String(y[0])))).sort((x, y) => String(x[0]).localeCompare(String(y[0]))));
const b = JSON.stringify((out.g5b as unknown[][])?.map((r) => [...r].sort((x, y) => String(x[0]).localeCompare(String(y[0])))).sort((x, y) => String(x[0]).localeCompare(String(y[0]))));
console.log("\ng5 starter≡par:", a === b ? "EQUAL" : "DIFFER");
