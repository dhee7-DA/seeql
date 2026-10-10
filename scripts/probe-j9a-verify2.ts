/// <reference types="bun-types" />
// j9-a probe 4 — cs-304 corrected shape (DISTINCT baked into template),
// cs-301 with ORDER BY, and exact per-manager-analog numbers for prose.
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j9a.db", { readonly: true });
const run = (sql: string) => {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const cols = rows.length ? Object.keys(rows[0]) : [];
    const canon = JSON.stringify(rows.map((r) => cols.map((c) => r[c])));
    return `OK ${rows.length} rows ${canon.length > 240 ? canon.slice(0, 240) + "…" : canon}`;
  } catch (e) {
    return `ERR ${e instanceof Error ? e.message.slice(0, 90) : e}`;
  }
};

// ---- cs-304 final shape: 3 slots {1} DISTINCT {2} customer_id {3} < --------
const t304 = (d: string, col: string, op: string) =>
  `SELECT COUNT(${d} o1.customer_id) AS repeat_accounts
FROM orders o1
JOIN orders o2
  ON o1.${col} = o2.customer_id
 AND o1.id ${op} o2.id;`;
console.log("cs-304 fill          :", run(t304("DISTINCT", "customer_id", "<")));
for (const d of ["ALL", "SUM", "id", "<=", "="]) {
  console.log(`cs-304 bank "${d}" slot1:`, run(t304(d, "customer_id", "<")));
  console.log(`cs-304 bank "${d}" slot2:`, run(t304("DISTINCT", d, "<")));
  console.log(`cs-304 bank "${d}" slot3:`, run(t304("DISTINCT", "customer_id", d)));
}
// prose facts: how many accounts have >=2 orders (distinct), pair rows total
console.log("accounts with >=2 orders:", run("SELECT COUNT(*) n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 2)"));
console.log("pair rows (o1.id<o2.id, same cust):", run("SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id"));
console.log("fabricated o1.id=o2.customer_id rows:", run("SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.id = o2.customer_id"));

// ---- cs-301 with ORDER BY ---------------------------------------------------
const t301 = (j: string, r: string, i: string) =>
  `SELECT c1.name AS buyer_a, c2.name AS buyer_b
FROM customers c1
${j} customers c2
  ON c1.region = ${r} AND
     c1.id < ${i}
ORDER BY c1.id, c2.id;`;
console.log("cs-301 fill w/ ORDER :", run(t301("JOIN", "c2.region", "c2.id")));
for (const d of ["LEFT", "INNER", "CROSS", "c1.region", "c2.city", "c1.id"]) {
  console.log(`cs-301 bank "${d}" slot1:`, run(t301(d, "c2.region", "c2.id")));
  console.log(`cs-301 bank "${d}" slot2:`, run(t301("JOIN", d, "c2.id")));
  console.log(`cs-301 bank "${d}" slot3:`, run(t301("JOIN", "c2.region", d)));
}

// ---- prose facts for walkthroughs -------------------------------------------
console.log("\n== prose facts ==");
console.log("EU customers:", run("SELECT COUNT(*) n FROM customers WHERE region = 'EU'"));
console.log("APAC customers:", run("SELECT COUNT(*) n FROM customers WHERE region = 'APAC'"));
console.log("US customers:", run("SELECT COUNT(*) n FROM customers WHERE region = 'US'"));
console.log("LATAM customers:", run("SELECT COUNT(*) n FROM customers WHERE region = 'LATAM'"));
console.log("regions pair counts:", run("SELECT r1.region, COUNT(*) n FROM customers r1 JOIN customers r2 ON r1.region = r2.region AND r1.id < r2.id GROUP BY r1.region ORDER BY n DESC"));
console.log("orders total:", run("SELECT COUNT(*) n FROM orders"));
console.log("accounts with >=3 orders:", run("SELECT COUNT(*) n FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) >= 3)"));
console.log("categories:", run("SELECT COUNT(DISTINCT category) n FROM products"));
console.log("c1.region=c1.region trivial-true pairs (id<):", run("SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.region = c1.region AND c1.id < c2.id"));
console.log("products per top category:", run("SELECT category, COUNT(*) n FROM products GROUP BY category ORDER BY n DESC, category"));
console.log("same-supplier same-category pairs:", run("SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.category = p2.category AND p1.id < p2.id"));
console.log("suppliers feeding >=2 shelves:", run("SELECT COUNT(*) n FROM (SELECT supplier_id FROM products GROUP BY supplier_id HAVING COUNT(DISTINCT category) >= 2)"));

db.close();
console.log("\nprobe-4 done");
