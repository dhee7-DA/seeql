// Task 66-b4 self-check — structural + engine verification for SQL_PREMIUM2_ORDERS.
// Mirrors the discipline of tasks 65-a..e: real splitStatements/countStatements,
// bun:sqlite :memory:, hard assertions on columns AND full row arrays.
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { SQL_PREMIUM2_ORDERS } from "../src/lib/leetcode/content/sql-premium2-orders";
import { LC_ALL } from "../src/lib/leetcode/registry";
import type { CellValue } from "../src/lib/sql-types";

let checks = 0;
const fails: string[] = [];
function ok(cond: boolean, msg: string) {
  checks++;
  if (!cond) fails.push(msg);
}

/** Round floats to 4dp like lc-sql-verify.ts. */
function norm(v: unknown): CellValue {
  const c = v as CellValue;
  if (typeof c === "number" && !Number.isInteger(c)) return Math.round(c * 10000) / 10000;
  return c;
}

/** Strip -- comments and balanced OVER(...) spans so window ORDER BYs can't fake a result-level one. */
function resultLevel(code: string): string {
  let out = "";
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if (ch === "-" && code[i + 1] === "-") {
      while (i < code.length && code[i] !== "\n") i++;
      continue;
    }
    out += ch;
  }
  let res = "";
  for (let i = 0; i < out.length; i++) {
    if (/over\s*\(/i.test(out.slice(i, i + 6)) || /^over\s*\(/i.test(out.slice(i))) {
      const m = out.slice(i).match(/^over\s*\(/i)!;
      let depth = 0;
      let j = i + m[0].length - 1;
      for (; j < out.length; j++) {
        if (out[j] === "(") depth++;
        else if (out[j] === ")") {
          depth--;
          if (depth === 0) break;
        }
      }
      i = j; // skip the whole OVER(...) span
      continue;
    }
    res += out[i];
  }
  return res;
}

/** Split a paragraph into sentences: punctuation followed by whitespace + capital/quote. */
function sentences(p: string): string[] {
  return p.split(/(?<=[.!?])\s+(?=["A-Z])/).filter((s) => s.trim().length > 0);
}

/** Recursive walk: no backticks, no ${ holes in any string field. */
function walk(v: unknown, path: string) {
  if (typeof v === "string") {
    ok(!v.includes("`"), `${path}: contains a backtick`);
    ok(!v.includes("${"), `${path}: contains a template hole`);
  } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
  else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => walk(x, `${path}.${k}`));
}

// -- file-level ---------------------------------------------------------------
const raw = await Bun.file(new URL("../src/lib/leetcode/content/sql-premium2-orders.ts", import.meta.url)).text();
ok(!raw.includes("${"), "raw file: contains a template hole");
ok(!raw.includes("writeVerify"), "raw file: writeVerify present on a read-only batch");
ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(raw), "raw file: emoji found");
ok(raw.startsWith("// Deep-dives — LeetCode Premium batch II"), "raw file: header comment wrong");

const EXP_SLUGS = [
  "calculate-salaries",
  "the-most-recent-orders-for-each-product",
  "warehouse-manager",
  "find-the-missing-ids",
  "count-apples-and-oranges",
  "products-price-for-each-store",
];
const EXP_XP = [20, 20, 10, 20, 20, 10];

ok(SQL_PREMIUM2_ORDERS.length === 6, `expected 6 dives, got ${SQL_PREMIUM2_ORDERS.length}`);
const seenSlugs = new Set<string>();
const registrySlugs = new Set(LC_ALL.map((p) => p.slug));

// hand-derived contracts (columns + rows, order-sensitive)
const CONTRACTS: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "calculate-salaries": {
    columns: ["company_id", "employee_id", "employee_name", "salary"],
    rows: [
      [1, 1, "Iris", 29950],
      [1, 2, "Jules", 25400],
      [1, 3, "Kofi", 27800],
      [2, 4, "Lena", 27360],
      [2, 5, "Marco", 13984],
      [2, 6, "Nadia", 23575],
    ],
  },
  "the-most-recent-orders-for-each-product": {
    columns: ["product_name", "product_id", "order_id", "order_date"],
    rows: [
      ["Bookend", 1, 15, "2020-02-29"],
      ["Desk Lamp", 2, 16, "2020-02-14"],
      ["Notebook", 3, 17, "2020-02-20"],
    ],
  },
  "warehouse-manager": {
    columns: ["name", "volume"],
    rows: [
      ["Dockside", 54],
      ["Hilltop", 236],
      ["Lakeside", 375],
    ],
  },
  "find-the-missing-ids": {
    columns: ["ids"],
    rows: [[3], [5], [9], [10], [11]],
  },
  "count-apples-and-oranges": {
    columns: ["apple_count", "orange_count"],
    rows: [[158, 159]],
  },
  "products-price-for-each-store": {
    columns: ["product_id", "store", "price"],
    rows: [
      [1, "store1", 130],
      [1, "store2", 160],
      [1, "store3", 185],
      [2, "store2", 210],
      [3, "store1", 140],
    ],
  },
};

for (let i = 0; i < SQL_PREMIUM2_ORDERS.length; i++) {
  const d = SQL_PREMIUM2_ORDERS[i];
  const tag = `[${d.slug}]`;

  ok(d.slug === EXP_SLUGS[i], `${tag}: slug/order mismatch — expected ${EXP_SLUGS[i]}`);
  ok(!seenSlugs.has(d.slug), `${tag}: duplicate slug`);
  seenSlugs.add(d.slug);
  ok(d.xp === EXP_XP[i], `${tag}: xp ${d.xp} != ${EXP_XP[i]}`);
  ok(d.order === "exact", `${tag}: order must be "exact"`);
  ok(!d.writeVerify, `${tag}: read problem must not carry writeVerify`);
  ok(typeof d.approach === "string" && !d.approach.includes("\n"), `${tag}: approach must be one line`);

  // exactly one statement; result-level ORDER BY for order:"exact"
  ok(countStatements(d.code) === 1, `${tag}: solution must be exactly one statement (got ${countStatements(d.code)})`);
  ok(/\border\s+by\b/i.test(resultLevel(d.code)), `${tag}: order:"exact" but no result-level ORDER BY`);

  // structural counts
  ok(d.examples.length === 2, `${tag}: examples must be 2`);
  ok(d.constraints.length >= 3, `${tag}: constraints must be >= 3`);
  ok(d.breakdown.length === 3, `${tag}: breakdown must be 3 paragraphs`);
  d.breakdown.forEach((p, j) => {
    const n = sentences(p).length;
    ok(n >= 3, `${tag}: breakdown paragraph ${j + 1} has ${n} sentences (need >= 3)`);
  });
  ok(d.edges.length >= 3 && d.edges.length <= 4, `${tag}: edges must be 3-4`);
  ok(d.ladder.length === 3, `${tag}: ladder must be 3 rungs`);
  ok(d.walkthrough.length >= 3, `${tag}: walkthrough must be >= 3 steps`);
  ok((d.followUps?.length ?? 0) >= 2, `${tag}: followUps must be >= 2`);
  const rel = d.related ?? [];
  ok(rel.length >= 3 && rel.length <= 3, `${tag}: related must be exactly 3`);
  rel.forEach((s) => ok(registrySlugs.has(s), `${tag}: related slug not in registry: ${s}`));
  ok(d.schema.tables !== undefined && d.schema.tables!.length >= 1, `${tag}: schema.tables missing`);
  d.schema.tables!.forEach((t) => ok(typeof t.note === "string" && t.note.length > 0, `${tag}: table ${t.name} note empty`));
  walk(d, tag);

  // ddl = only CREATE TABLEs; seed = only INSERTs; both end ';' with nothing after
  const ddlStmts = splitStatements(d.schema.ddl);
  ok(ddlStmts.length >= 1 && ddlStmts.every((s) => /^create table/i.test(s)), `${tag}: ddl must be only CREATE TABLEs`);
  const seedStmts = splitStatements(d.schema.seed);
  ok(seedStmts.length >= 1 && seedStmts.every((s) => /^insert into/i.test(s)), `${tag}: seed must be only INSERTs`);
  const ddlTail = d.schema.ddl.slice(d.schema.ddl.lastIndexOf(";") + 1);
  ok(ddlTail.trim() === "", `${tag}: ddl has content after the final semicolon`);
  const seedTail = d.schema.seed.slice(d.schema.seed.lastIndexOf(";") + 1);
  ok(seedTail.trim() === "", `${tag}: seed has content after the final semicolon`);

  // engine: ddl -> seed -> solution, asserted twice (determinism) against the contract
  const contract = CONTRACTS[d.slug];
  ok(contract !== undefined, `${tag}: no hand-derived contract`);
  if (!contract) continue;
  for (let run = 1; run <= 2; run++) {
    const db = new Database(":memory:");
    try {
      for (const s of ddlStmts) db.run(s);
      for (const s of seedStmts) db.run(s);
      const st = db.prepare(d.code.replace(/;+\s*$/, ""));
      const rows = st.all() as Record<string, unknown>[];
      const cols = st.columnNames;
      ok(JSON.stringify(cols) === JSON.stringify(contract.columns), `${tag} run${run}: columns ${JSON.stringify(cols)} != ${JSON.stringify(contract.columns)}`);
      const got = rows.map((r) => cols.map((c) => norm(r[c])));
      ok(JSON.stringify(got) === JSON.stringify(contract.rows), `${tag} run${run}: rows mismatch\n  got:      ${JSON.stringify(got)}\n  expected: ${JSON.stringify(contract.rows)}`);
    } catch (err) {
      ok(false, `${tag} run${run}: engine failure — ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      db.close();
    }
  }
}

// -- registry absence is EXPECTED (lead wires rows later) — but slugs must not collide with existing registry entries
EXP_SLUGS.forEach((s) => ok(!registrySlugs.has(s), `slug collides with an existing registry row: ${s}`));

console.log(`\n${checks} assertions run`);
if (fails.length) {
  console.error(`${fails.length} FAILURE(S):`);
  for (const f of fails) console.error(`  x ${f}`);
  process.exit(1);
}
console.log("ALL CHECKS PASS 6/6 — SQL_PREMIUM2_ORDERS");
