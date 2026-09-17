/// <reference types="bun-types" />
// j9-a probe 3 — verify every planned fill + every distractor consequence,
// and harvest all prior fills (cs-001..cs-200) for the distinctness gate.
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j9a.db", { readonly: true });
const run = (sql: string) => {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const cols = rows.length ? Object.keys(rows[0]) : [];
    const canon = JSON.stringify(rows.map((r) => cols.map((c) => r[c])));
    return `OK ${rows.length} rows ${canon.length > 220 ? canon.slice(0, 220) + "…" : canon}`;
  } catch (e) {
    return `ERR ${e instanceof Error ? e.message.slice(0, 90) : e}`;
  }
};

// ---- cs-301 fills + distractors -------------------------------------------
const t301 = (j: string, r: string, i: string) =>
  `SELECT c1.name AS buyer_a, c2.name AS buyer_b
FROM customers c1
${j} customers c2
  ON c1.region = ${r} AND
     c1.id < ${i};`;
console.log("cs-301 fill      :", run(t301("JOIN", "c2.region", "c2.id")));
console.log("cs-301 d=LEFT    :", run(t301("LEFT", "c2.region", "c2.id")));
console.log("cs-301 d=INNER   :", run(t301("INNER", "c2.region", "c2.id")));
console.log("cs-301 d=CROSS   :", run(t301("CROSS", "c2.region", "c2.id")));
console.log("cs-301 d=c1.region:", run(t301("JOIN", "c1.region", "c2.id")));
console.log("cs-301 d=c2.city :", run(t301("JOIN", "c2.city", "c2.id")));
console.log("cs-301 d=c1.id   :", run(t301("JOIN", "c2.region", "c1.id")));

// ---- cs-302 ----------------------------------------------------------------
const t302 = (a: string, op: string, b: string) =>
  `SELECT p1.name AS item_a, p2.name AS item_b, p1.category
FROM products p1
JOIN products p2
  ON p1.category = p2.category
 AND ${a} ${op} ${b}
ORDER BY p1.category, p1.id;`;
console.log("cs-302 fill      :", run(t302("p1.id", "<", "p2.id")));
console.log("cs-302 d=OR      :", run(t302("p1.id", "OR", "p2.id")));
console.log("cs-302 d==       :", run(t302("p1.id", "=", "p2.id")));
console.log("cs-302 d=<>      :", run(t302("p1.id", "<>", "p2.id")));
console.log("cs-302 d=<       :", run(t302("p1.id", "<=", "p2.id")));
console.log("cs-302 d=AND     :", run(t302("p1.id", "AND", "p2.id")));
console.log("cs-302 d=p1.price:", run(t302("p1.price", "<", "p2.id")));
// cross-slot placements of the bank into each slot:
for (const d of ["OR", "=", "<>", "<=", "AND", "p1.price"]) {
  console.log(`cs-302 bank "${d}" slot1:`, run(t302(d, "<", "p2.id")));
  console.log(`cs-302 bank "${d}" slot3:`, run(t302("p1.id", "<", d)));
}

// ---- cs-303 ----------------------------------------------------------------
const t303 = (j: string, op: string, n: string) =>
  `SELECT s1.name, s1.region
FROM suppliers s1
${j} JOIN suppliers s2
  ON s1.region = s2.region
 AND s1.id ${op} s2.id
WHERE s2.id IS ${n};`;
console.log("cs-303 fill      :", run(t303("LEFT", "<>", "NULL")));
console.log("cs-303 d=INNER   :", run(t303("INNER", "<>", "NULL")));
console.log("cs-303 d=RIGHT   :", run(t303("RIGHT", "<>", "NULL")));
console.log("cs-303 d=CROSS   :", run(t303("CROSS", "<>", "NULL")));
console.log("cs-303 d==       :", run(t303("LEFT", "=", "NULL")));
console.log("cs-303 d=NOT NULL:", run(t303("LEFT", "<>", "NOT NULL")));
console.log("cs-303 d=IS      :", run(t303("LEFT", "<>", "IS")));
for (const d of ["INNER", "RIGHT", "CROSS", "=", "NOT NULL", "IS"])
  console.log(`cs-303 bank "${d}" slot2:`, run(t303("LEFT", d, "NULL")));

// ---- cs-304 ----------------------------------------------------------------
const t304 = (f: string, col: string, op: string) =>
  `SELECT ${f}(o1.customer_id) AS repeat_accounts
FROM orders o1
JOIN orders o2
  ON o1.${col} = o2.customer_id
 AND o1.id ${op} o2.id;`;
console.log("cs-304 fill      :", run(t304("COUNT", "customer_id", "<")));
console.log("cs-304 d=SUM     :", run(t304("SUM", "customer_id", "<")));
console.log("cs-304 d=AVG     :", run(t304("AVG", "customer_id", "<")));
console.log("cs-304 d=MAX     :", run(t304("MAX", "customer_id", "<")));
console.log("cs-304 d=id      :", run(t304("COUNT", "id", "<")));
console.log("cs-304 d=<       :", run(t304("COUNT", "customer_id", "<=")));
for (const d of ["SUM", "AVG", "MAX", "id", "<="])
  console.log(`cs-304 bank "${d}" slot1:`, run(t304(d, "customer_id", "<")));

// ---- cs-305 ----------------------------------------------------------------
const t305 = (d1: string, c2: string, c3: string, op: string) =>
  `SELECT COUNT(${d1} o1.customer_id) AS loyal_accounts
FROM orders o1
JOIN orders o2
  ON o1.customer_id = o2.customer_id
 AND o1.id < o2.id
JOIN orders o3
  ON o2.customer_id = ${c2}
 AND o2.id ${op} ${c3};`;
console.log("cs-305 fill      :", run(t305("DISTINCT", "o3.customer_id", "o3.id", "<")));
console.log("cs-305 d=ALL     :", run(t305("ALL", "o3.customer_id", "o3.id", "<")));
console.log("cs-305 d=o2.cust.:", run(t305("DISTINCT", "o2.customer_id", "o3.id", "<")));
console.log("cs-305 d=o2.id   :", run(t305("DISTINCT", "o2.id", "o3.id", "<")));
console.log("cs-305 d=o1.id   :", run(t305("DISTINCT", "o1.id", "o3.id", "<")));
console.log("cs-305 d=>       :", run(t305("DISTINCT", "o3.customer_id", "o3.id", ">")));
for (const d of ["ALL", "o2.customer_id", "o2.id", "o1.id", ">"]) {
  console.log(`cs-305 bank "${d}" slot1:`, run(t305(d, "o3.customer_id", "o3.id", "<")));
  console.log(`cs-305 bank "${d}" slot3:`, run(t305("DISTINCT", "o3.customer_id", d, "<")));
}

// ---- cs-306 ----------------------------------------------------------------
const t306 = (thr: string, op: string, dir: string) =>
  `SELECT p1.name AS premium_item, p2.name AS budget_item,
       ROUND(p1.price - p2.price, 2) AS gap
FROM products p1
JOIN products p2
  ON p1.category = p2.category
 AND p1.price ${op} p2.price + ${thr}
ORDER BY gap ${dir};`;
console.log("cs-306 fill      :", run(t306("40", ">", "DESC")));
console.log("cs-306 d=20      :", run(t306("20", ">", "DESC")));
console.log("cs-306 d=60      :", run(t306("60", ">", "DESC")));
console.log("cs-306 d=10      :", run(t306("10", ">", "DESC")));
console.log("cs-306 d=100     :", run(t306("100", ">", "DESC")));
console.log("cs-306 d=<       :", run(t306("40", "<", "DESC")));
console.log("cs-306 d==       :", run(t306("40", "=", "DESC")));
console.log("cs-306 d=>=      :", run(t306("40", ">=", "DESC")));
console.log("cs-306 d=ASC     :", run(t306("40", ">", "ASC")));
console.log("cs-306 rows:", run(t306("40", ">", "DESC")));

// ---- cs-307 ----------------------------------------------------------------
const t307 = (j: string, op: string, n: string) =>
  `SELECT p1.name, p1.category, p1.price
FROM products p1
${j} JOIN products p2
  ON p2.category = p1.category
 AND p2.price ${op} p1.price
WHERE p2.id IS ${n}
ORDER BY p1.price DESC;`;
console.log("cs-307 fill      :", run(t307("LEFT", ">", "NULL")));
console.log("cs-307 d=INNER   :", run(t307("INNER", ">", "NULL")));
console.log("cs-307 d=CROSS   :", run(t307("CROSS", ">", "NULL")));
console.log("cs-307 d=RIGHT   :", run(t307("RIGHT", ">", "NULL")));
console.log("cs-307 d=<       :", run(t307("LEFT", "<", "NULL")));
console.log("cs-307 d=>=      :", run(t307("LEFT", ">=", "NULL")));
console.log("cs-307 d=NOT NULL:", run(t307("LEFT", ">", "NOT NULL")));
for (const d of ["INNER", "CROSS", "RIGHT", "<", ">=", "NOT NULL"])
  console.log(`cs-307 bank "${d}" slot2:`, run(t307("LEFT", d, "NULL")));

// ---- cs-308 ----------------------------------------------------------------
const t308 = (c1: string, s2: string, op: string) =>
  `SELECT p1.category,
       p1.name AS shelf_a, s1.name AS source_a,
       p2.name AS shelf_b, s2.name AS source_b
FROM products p1
JOIN products p2
  ON p1.category = ${c1}
 AND p1.id < p2.id
JOIN suppliers s1 ON s1.id = p1.supplier_id
JOIN suppliers s2 ON ${s2} = p2.supplier_id
WHERE p1.supplier_id ${op} p2.supplier_id
ORDER BY p1.category, p1.id;`;
console.log("cs-308 fill      :", run(t308("p2.category", "s2.id", "<>")));
console.log("cs-308 d=p2.name :", run(t308("p2.name", "s2.id", "<>")));
console.log("cs-308 d=p1.cat. :", run(t308("p1.category", "s2.id", "<>")));
console.log("cs-308 d=s1.id   :", run(t308("p2.category", "s1.id", "<>")));
console.log("cs-308 d=p2.id   :", run(t308("p2.category", "p2.id", "<>")));
console.log("cs-308 d==       :", run(t308("p2.category", "s2.id", "=")));
console.log("cs-308 d=<       :", run(t308("p2.category", "s2.id", "<")));
console.log("cs-308 d=>       :", run(t308("p2.category", "s2.id", ">")));
for (const d of ["p2.name", "p1.category", "s1.id", "p2.id", "=", "<", ">"]) {
  console.log(`cs-308 bank "${d}" slot2:`, run(t308("p2.category", d, "<>")));
  console.log(`cs-308 bank "${d}" slot3:`, run(t308("p2.category", "s2.id", d)));
}

db.close();
console.log("\nprobe-3 done");
