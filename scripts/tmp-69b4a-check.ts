// Self-check for batch-9 file 4 of 6 (src/lib/leetcode/content/sql-premium5-graph.ts):
// structural asserts, bun:sqlite double-run determinism, hand-derived row
// contracts (order-sensitive), and planted-trap probes re-running WRONG queries.
// Run: bun scripts/tmp-69b4a-check.ts
import { Database } from "bun:sqlite";
import { countStatements, splitStatements } from "../src/lib/sql-statements";
import { SQL_PREMIUM5_GRAPH } from "../src/lib/leetcode/content/sql-premium5-graph";
import { LC_ALL } from "../src/lib/leetcode/registry";

type Cell = number | string | null;
type Row = Cell[];

let checks = 0;
let failures = 0;
const ok = (cond: boolean, label: string): void => {
  checks++;
  if (!cond) {
    failures++;
    console.log("    FAIL:", label);
  }
};
const eq = (a: unknown, b: unknown, label: string): void =>
  ok(JSON.stringify(a) === JSON.stringify(b), `${label} — got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);
const norm = (rows: unknown[][]): Row[] =>
  rows.map((r) => r.map((v) => (typeof v === "number" ? Math.round(v * 10000) / 10000 : (v as Cell))));

const stripComments = (sql: string): string =>
  sql
    .split("\n")
    .map((l) => l.replace(/--.*$/, ""))
    .join("\n");
const stripOver = (sql: string): string => {
  let s = stripComments(sql);
  while (/OVER\s*\(/i.test(s)) s = s.replace(/OVER\s*\([^()]*\)/gi, "OVER_SPAN");
  return s;
};
const hasResultOrderBy = (sql: string): boolean => /\bORDER\s+BY\b/i.test(stripOver(sql));
const sentences = (p: string): number =>
  p
    .split(/(?<=[.!?])\s+(?=[A-Z(])/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0).length;
const collectStrings = (d: unknown, path = "", acc: Array<[string, string]> = []): Array<[string, string]> => {
  if (typeof d === "string") acc.push([path, d]);
  else if (Array.isArray(d)) d.forEach((v, i) => collectStrings(v, `${path}[${i}]`, acc));
  else if (d && typeof d === "object")
    for (const [k, v] of Object.entries(d)) collectStrings(v, path ? `${path}.${k}` : k, acc);
  return acc;
};
const noSemicolonInComments = (sql: string): boolean =>
  sql.split("\n").every((l) => {
    const idx = l.indexOf("--");
    return idx < 0 || !l.slice(idx).includes(";");
  });
const noSemicolonThenComment = (sql: string): boolean => sql.split("\n").every((l) => !/;.*--/.test(l));
const endsClean = (sql: string): boolean => {
  const t = sql.trimEnd();
  const last = t.split("\n").pop() ?? "";
  return t.endsWith(";") && !last.includes("--");
};

const slugSet = new Set(LC_ALL.map((p) => p.slug));

interface Contract {
  cols: string[];
  rows: Row[];
}

const runContract = (ddl: string, seed: string, code: string, want: Contract, label: string): void => {
  const db = new Database(":memory:");
  db.exec(ddl);
  db.exec(seed);
  const st = db.prepare(code);
  const cols = (st.columnNames as string[]).map((c) => c);
  eq(cols, want.cols, `${label} columns`);
  const run1 = norm(st.values() as unknown[][]);
  const run2 = norm(st.values() as unknown[][]);
  eq(run2, run1, `${label} determinism (run 2 == run 1)`);
  eq(run1, want.rows, `${label} rows (order-sensitive)`);
  db.close();
};

const runProbe = (ddl: string, seed: string, sql: string, want: Row[], label: string): void => {
  const db = new Database(":memory:");
  db.exec(ddl);
  db.exec(seed);
  eq(norm(db.prepare(sql).values() as unknown[][]), want, label);
  db.close();
};

console.log("== structural + engine self-check: SQL_PREMIUM5_GRAPH ==");

const expectedOrder = ["ceo-subordinate-hierarchy", "calculate-trapping-rain-water", "bitwise-user-permissions-analysis"];
const expectedXp = [35, 35, 20];
eq(SQL_PREMIUM5_GRAPH.map((d) => d.slug), expectedOrder, "dive order");
eq(SQL_PREMIUM5_GRAPH.length, 3, "exactly 3 dives");

SQL_PREMIUM5_GRAPH.forEach((d, i) => {
  console.log(`-- dive ${i + 1}: ${d.slug}`);
  ok(d.order === "exact", "order is exact");
  ok(d.writeVerify === undefined, "no writeVerify");
  eq(d.xp, expectedXp[i], "xp matches spec");
  ok(d.statement.length > 100, "statement > 100 chars");
  eq(countStatements(d.code), 1, "exactly 1 statement (countStatements)");
  eq(splitStatements(d.code).length, 1, "exactly 1 statement (splitStatements)");
  ok(hasResultOrderBy(d.code), "result-level ORDER BY present (comments + OVER spans stripped)");
  eq(d.examples.length, 2, "exactly 2 examples");
  d.examples.forEach((e, j) => ok(e.input.length > 0 && e.output.length > 0 && (e.explanation?.length ?? 0) > 0, `example ${j + 1} fully populated`));
  eq(d.constraints.length, 3, "exactly 3 constraints");
  eq(d.breakdown.length, 3, "exactly 3 breakdown paragraphs");
  d.breakdown.forEach((p, j) => {
    const n = sentences(p);
    ok(n >= 3 && n <= 5, `breakdown para ${j + 1} has 3-5 sentences (got ${n})`);
  });
  ok(d.edges.length >= 3 && d.edges.length <= 4, `3-4 edges (got ${d.edges.length})`);
  eq(d.ladder.length, 3, "exactly 3 ladder rungs");
  d.ladder.forEach((r, j) => ok(r.title.length > 0 && r.body.length > 0, `ladder rung ${j + 1} populated`));
  ok(d.approach.length > 0 && !d.approach.includes("\n"), "approach is one line");
  ok((d.schema.tables?.length ?? 0) >= 1, "schema tables notes present");
  eq(d.walkthrough.length, 3, "exactly 3 walkthrough steps");
  ok((d.followUps?.length ?? 0) >= 2, ">= 2 followUps");
  eq(d.related?.length, 3, "exactly 3 related");
  (d.related ?? []).forEach((s) => ok(slugSet.has(s), `related slug exists in LC_ALL: ${s}`));
  const strings = collectStrings(d);
  strings.forEach(([path, v]) => {
    ok(!v.includes("`") && !v.includes("${"), `no backtick/template hole in ${path}`);
    ok(!/leetcode/i.test(v), `no platform mention in ${path}`);
  });
  for (const [name, sql] of [["ddl", d.schema.ddl], ["seed", d.schema.seed], ["code", d.code]] as const) {
    ok(noSemicolonInComments(sql), `${name}: no ';' inside comments`);
    ok(noSemicolonThenComment(sql), `${name}: no comment after a ';' on the same line`);
  }
  ok(endsClean(d.schema.ddl), "ddl ends ';' with nothing after");
  ok(endsClean(d.schema.seed), "seed ends ';' with nothing after");
});

/* ------------------------- per-dive engine contracts ------------------------- */

console.log("-- engine contracts (double-run) + planted-trap probes");

// Dive 1: ceo-subordinate-hierarchy
{
  const d = SQL_PREMIUM5_GRAPH[0];
  const { ddl, seed } = d.schema;
  runContract(ddl, seed, d.code, { cols: ["emp_id", "name", "level"], rows: [[1, "Nadia", 1], [2, "Boris", 2], [5, "Omar", 2], [3, "Chen", 3], [6, "Dana", 3], [7, "Priya", 3], [4, "Elif", 4]] }, "dive 1");
  const eqNull = `WITH RECURSIVE chain AS (SELECT emp_id, name, 1 AS level FROM Employee WHERE manager_id = NULL UNION ALL SELECT e.emp_id, e.name, c.level + 1 FROM Employee e JOIN chain c ON e.manager_id = c.emp_id) SELECT emp_id, name, level FROM chain ORDER BY level, emp_id`;
  runProbe(ddl, seed, eqNull, [], "trap: anchor manager_id = NULL ships 0 rows");
  const zero = `WITH RECURSIVE chain AS (SELECT emp_id, name, 0 AS level FROM Employee WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, c.level + 1 FROM Employee e JOIN chain c ON e.manager_id = c.emp_id) SELECT emp_id, name, level FROM chain ORDER BY level, emp_id`;
  runProbe(ddl, seed, zero, [[1, "Nadia", 0], [2, "Boris", 1], [5, "Omar", 1], [3, "Chen", 2], [6, "Dana", 2], [7, "Priya", 2], [4, "Elif", 3]], "trap: level-0 anchor shifts every row down");
}

// Dive 2: calculate-trapping-rain-water
{
  const d = SQL_PREMIUM5_GRAPH[1];
  const { ddl, seed } = d.schema;
  runContract(ddl, seed, d.code, { cols: ["position", "water"], rows: [[2, 3], [3, 1], [4, 3], [9, 1], [10, 2]] }, "dive 2");
  const exclusive = `SELECT position, MIN(lb, rb) - height AS raw FROM (
    SELECT position, height,
      MAX(height) OVER (ORDER BY position ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS lb,
      MAX(height) OVER (ORDER BY position ROWS BETWEEN 1 FOLLOWING AND UNBOUNDED FOLLOWING) AS rb
    FROM Terrain) ORDER BY position`;
  runProbe(ddl, seed, exclusive, [[1, null], [2, 3], [3, 1], [4, 3], [5, -1], [6, -1], [7, -1], [8, 0], [9, 1], [10, 2], [11, 0], [12, -2], [13, null]], "trap: exclusive frames fabricate -1/-2/NULL rows");
  const noClampInclusive = `SELECT position, MIN(lb, rb) - height AS raw FROM (
    SELECT position, height,
      MAX(height) OVER (ORDER BY position ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS lb,
      MAX(height) OVER (ORDER BY position ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) AS rb
    FROM Terrain) ORDER BY position`;
  const db = new Database(":memory:");
  db.exec(ddl);
  db.exec(seed);
  const raws = db.prepare(noClampInclusive).all() as Array<{ position: number; raw: number }>;
  ok(raws.every((r) => r.raw >= 0), "inclusive frames: raw difference provably non-negative (no clamp needed)");
  eq(raws.filter((r) => r.raw === 0).length, 8, "exactly 8 dry positions at 0");
  db.close();
  const geZero = `WITH banks AS (SELECT position, height, MAX(height) OVER (ORDER BY position ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS left_bank, MAX(height) OVER (ORDER BY position ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) AS right_bank FROM Terrain), flood AS (SELECT position, CASE WHEN MIN(left_bank, right_bank) - height < 0 THEN 0 ELSE MIN(left_bank, right_bank) - height END AS water FROM banks) SELECT position, water FROM flood WHERE water >= 0 ORDER BY position`;
  runProbe(ddl, seed, geZero, [[1, 0], [2, 3], [3, 1], [4, 3], [5, 0], [6, 0], [7, 0], [8, 0], [9, 1], [10, 2], [11, 0], [12, 0], [13, 0]], "trap: >= 0 filter prints 8 junk rows");
}

// Dive 3: bitwise-user-permissions-analysis
{
  const d = SQL_PREMIUM5_GRAPH[2];
  const { ddl, seed } = d.schema;
  runContract(ddl, seed, d.code, { cols: ["user_id", "combined_mask"], rows: [[1, 7], [5, 15]] }, "dive 3");
  const noDistinctFold = `SELECT user_id, SUM(perm_mask) AS m FROM UserGrant GROUP BY user_id ORDER BY user_id`;
  runProbe(ddl, seed, noDistinctFold, [[1, 7], [2, 5], [3, 4], [4, 6], [5, 15]], "trap: plain SUM folds user 3 to the lie 4");
  const noDistinctGate = `SELECT user_id, m FROM (SELECT user_id, SUM(perm_mask) AS m FROM UserGrant GROUP BY user_id) WHERE (m & 7) = 7 ORDER BY user_id`;
  runProbe(ddl, seed, noDistinctGate, [[1, 7], [5, 15]], "trap: without DISTINCT the final gate output coincides here — the folded mask is the lie");
  const eqGate = `WITH per_user AS (SELECT user_id, SUM(DISTINCT perm_mask) AS combined_mask FROM UserGrant GROUP BY user_id) SELECT user_id, combined_mask FROM per_user WHERE combined_mask = 7 ORDER BY user_id`;
  runProbe(ddl, seed, eqGate, [[1, 7]], "trap: naive gate combined_mask = 7 drops user 5");
  const posGate = `WITH per_user AS (SELECT user_id, SUM(DISTINCT perm_mask) AS combined_mask FROM UserGrant GROUP BY user_id) SELECT user_id, combined_mask FROM per_user WHERE (combined_mask & 7) > 0 ORDER BY user_id`;
  runProbe(ddl, seed, posGate, [[1, 7], [2, 5], [3, 3], [4, 6], [5, 15]], "trap: > 0 gate admits every user");
  try {
    const db = new Database(":memory:");
    db.exec(ddl);
    db.exec(seed);
    db.prepare("SELECT BIT_OR(perm_mask) AS m FROM UserGrant").all();
    console.log("    info: engine HAS a BIT_OR aggregate");
    db.close();
  } catch {
    console.log("    info: engine has NO BIT_OR aggregate (sum-of-distinct-powers is the honest fold)");
  }
}

console.log(`\n${failures === 0 ? "ALL CHECKS PASS" : "CHECKS FAILED"} — ${checks} assertions, ${failures} failures, ${SQL_PREMIUM5_GRAPH.length}/3 dives`);
if (failures > 0) process.exit(1);
