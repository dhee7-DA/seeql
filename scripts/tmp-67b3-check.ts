/**
 * Task 67-b3 self-check — sql-premium3-arena.ts
 * Structure invariants + bun:sqlite execution against hand-derived expected rows,
 * run twice per dive for determinism, plus wrong-query trap probes.
 * Run: bun scripts/tmp-67b3-check.ts
 */
import { Database } from "bun:sqlite";
import { SQL_PREMIUM3_ARENA } from "../src/lib/leetcode/content/sql-premium3-arena";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import type { LcSqlDive } from "../src/lib/leetcode/types";

let assertions = 0;
const fails: string[] = [];
const ok = (cond: boolean, msg: string) => {
  assertions++;
  if (!cond) fails.push(msg);
};

function norm(v: unknown): unknown {
  const c = v as number | string | null;
  if (typeof c === "number" && !Number.isInteger(c)) return Math.round(c * 10000) / 10000;
  return c;
}
function cellEq(a: unknown, b: unknown): boolean {
  const na = norm(a), nb = norm(b);
  if (typeof na === "number" && typeof nb === "number") return Math.abs(na - nb) < 1e-9;
  return na === nb;
}
function sentenceCount(p: string): number {
  return p
    .split(/(?<=[.!?])\s+(?=[A-Z(])/)
    .filter((s) => /[.!?]$/.test(s.trim())).length;
}
function walkStrings(v: unknown, fn: (s: string) => void) {
  if (typeof v === "string") fn(s2(v));
  function s2(x: string) { return x; }
  if (typeof v === "string") fn(v);
  else if (Array.isArray(v)) v.forEach((x) => walkStrings(x, fn));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => walkStrings(x, fn));
}

/** Remove -- comments and balanced OVER(...) spans, then look for a result-level ORDER BY. */
function stripForOrderBy(code: string): string {
  let s = code.replace(/--[^\n]*/g, " ");
  let out = "";
  let i = 0;
  const lower = s.toLowerCase();
  while (i < s.length) {
    const idx = lower.indexOf("over", i);
    if (idx === -1) { out += s.slice(i); break; }
    const before = idx > 0 ? s[idx - 1] : " ";
    let j = idx + 4;
    while (j < s.length && /\s/.test(s[j])) j++;
    if (/[A-Za-z0-9_]/.test(before) || s[j] !== "(") {
      out += s.slice(i, idx + 4);
      i = idx + 4;
      continue;
    }
    let depth = 0;
    let k = j;
    for (; k < s.length; k++) {
      if (s[k] === "(") depth++;
      else if (s[k] === ")") { depth--; if (depth === 0) break; }
    }
    out += s.slice(i, idx) + " ";
    i = k + 1;
  }
  return out;
}

const EXPECTED_KEY_ORDER = [
  "slug", "statement", "examples", "constraints", "breakdown", "edges", "ladder",
  "approach", "schema", "code", "walkthrough", "time", "space", "followUps",
  "related", "order", "xp",
];

const EXPECTED_ORDER = [
  "the-number-of-passengers-in-each-bus-i",
  "the-number-of-passengers-in-each-bus-ii",
  "longest-winning-streak",
  "the-change-in-global-rankings",
  "all-the-matches-of-the-league",
  "compute-the-rank-as-a-percentage",
];
const XP_BY_SLUG: Record<string, number> = {
  "the-number-of-passengers-in-each-bus-i": 20,
  "the-number-of-passengers-in-each-bus-ii": 35,
  "longest-winning-streak": 35,
  "the-change-in-global-rankings": 20,
  "all-the-matches-of-the-league": 10,
  "compute-the-rank-as-a-percentage": 20,
};

const EXPECTED_ROWS: Record<string, { columns: string[]; rows: unknown[][] }> = {
  "the-number-of-passengers-in-each-bus-i": {
    columns: ["bus_id", "riders_cnt"],
    rows: [[3, 3], [7, 0], [12, 3]],
  },
  "the-number-of-passengers-in-each-bus-ii": {
    columns: ["bus_id", "boarded_cnt", "boarded_weight"],
    rows: [[3, 2, 40], [7, 2, 100], [9, 2, 60]],
  },
  "longest-winning-streak": {
    columns: ["team_id", "longest_streak"],
    rows: [[1, 4], [2, 3], [3, 2], [4, 1]],
  },
  "the-change-in-global-rankings": {
    columns: ["team_id", "name", "total_points", "pos"],
    rows: [[1, "Atlas", 55, 1], [4, "Dunlin", 55, 2], [2, "Boldon", 50, 3], [5, "Ember", 35, 4], [3, "Cobalt", 30, 5]],
  },
  "all-the-matches-of-the-league": {
    columns: ["host_id", "guest_id"],
    rows: [[1, 2], [1, 3], [2, 1], [2, 3], [3, 1], [3, 2]],
  },
  "compute-the-rank-as-a-percentage": {
    columns: ["contestant_id", "name", "score", "pct"],
    rows: [
      [1, "Iris", 120, 0],
      [2, "Jonas", 120, 0],
      [3, "Kaya", 100, 33.33],
      [4, "Liam", 90, 50],
      [5, "Mina", 70, 66.67],
      [6, "Noor", 50, 83.33],
    ],
  },
};

// -- batch-level shape --------------------------------------------------------
ok(Array.isArray(SQL_PREMIUM3_ARENA), "export is an array");
ok(SQL_PREMIUM3_ARENA.length === 6, `exactly 6 dives (got ${SQL_PREMIUM3_ARENA.length})`);
EXPECTED_ORDER.forEach((slug, i) =>
  ok(SQL_PREMIUM3_ARENA[i]?.slug === slug, `dive ${i} slug expected ${slug}, got ${SQL_PREMIUM3_ARENA[i]?.slug}`),
);

// -- registry pool for related slugs ------------------------------------------
const REGISTRY_SLUGS = new Set(LC_ALL.map((p) => p.slug));
ok(REGISTRY_SLUGS.size > 100, `LC_ALL pool loaded (${REGISTRY_SLUGS.size} slugs)`);

// -- raw-file hygiene ---------------------------------------------------------
{
  const contentPath = new URL("../src/lib/leetcode/content/sql-premium3-arena.ts", import.meta.url).pathname;
  const raw = await Bun.file(contentPath).text();
  ok(!raw.includes("${"), "raw file must not contain a ${ template hole");
  ok(!/;[^\n]*--/.test(raw), "no comment after a semicolon on the same line (seeds/ddl/code)");
}

// -- per-dive structural invariants -------------------------------------------
for (const dive of SQL_PREMIUM3_ARENA as LcSqlDive[]) {
  const tag = `[${dive.slug}]`;

  ok(
    JSON.stringify(Object.keys(dive)) === JSON.stringify(EXPECTED_KEY_ORDER),
    `${tag} field order matches the exemplar`,
  );
  ok(
    JSON.stringify(Object.keys(dive.schema)) === JSON.stringify(["ddl", "seed", "tables"]),
    `${tag} schema field order is ddl, seed, tables`,
  );

  ok(dive.order === "exact", `${tag} order is exact`);
  ok(dive.xp === XP_BY_SLUG[dive.slug], `${tag} xp ${dive.xp} matches spec`);
  ok(dive.writeVerify === undefined, `${tag} read problem carries no writeVerify`);
  ok(countStatements(dive.code) === 1, `${tag} code is exactly one statement`);
  ok(/^(with|select)\b/i.test(dive.code.trim()), `${tag} code is a read (with/select)`);
  ok(/\border\s+by\b/i.test(stripForOrderBy(dive.code)), `${tag} result-level ORDER BY survives comment+OVER stripping`);

  // examples, constraints, breakdown, edges, ladder, walkthrough
  ok(dive.examples.length === 2, `${tag} exactly 2 examples`);
  dive.examples.forEach((e, i) => ok(!!e.input && !!e.output, `${tag} example ${i} has input+output`));
  ok(dive.constraints.length === 3, `${tag} exactly 3 constraints`);
  ok(dive.breakdown.length === 3, `${tag} breakdown has 3 paragraphs`);
  dive.breakdown.forEach((p, i) =>
    ok(
      sentenceCount(p) >= 3 && sentenceCount(p) <= 5,
      `${tag} breakdown paragraph ${i} has 3-5 sentences (got ${sentenceCount(p)})`,
    ),
  );
  ok(dive.edges.length >= 3 && dive.edges.length <= 4, `${tag} 3-4 edges`);
  ok(dive.ladder.length === 3, `${tag} ladder has 3 rungs`);
  dive.ladder.forEach((r, i) => {
    ok(!!r.title && !!r.body, `${tag} ladder rung ${i} populated`);
    ok(/brute|pattern|optimal/i.test(r.title), `${tag} ladder rung ${i} titled brute/pattern/optimal`);
  });
  ok(dive.walkthrough.length === 3, `${tag} walkthrough has exactly 3 steps`);
  ok(dive.approach !== undefined && !dive.approach.includes("\n"), `${tag} approach is a one-liner`);
  ok(dive.followUps !== undefined && dive.followUps.length === 2, `${tag} exactly 2 followUps`);
  ok(dive.related !== undefined && dive.related.length === 3, `${tag} exactly 3 related`);
  (dive.related ?? []).forEach((r) => {
    ok(REGISTRY_SLUGS.has(r), `${tag} related slug "${r}" exists in LC_ALL`);
  });

  // string hygiene (no backticks / no ${ inside any content string)
  walkStrings(
    { s: dive.statement, e: dive.examples, c: dive.constraints, b: dive.breakdown, x: dive.edges,
      l: dive.ladder, a: dive.approach, sc: dive.schema, co: dive.code, w: dive.walkthrough,
      t: dive.time, sp: dive.space, f: dive.followUps, r: dive.related },
    (s) => {
      ok(!s.includes("`"), `${tag} no backtick inside a string value`);
      ok(!s.includes("${"), `${tag} no \${ inside a string value`);
      ok(!/leetcode/i.test(s), `${tag} content string never mentions the source site`);
    },
  );

  // ddl/seed hygiene
  ok(dive.schema.ddl.trimEnd().endsWith(";"), `${tag} ddl ends with ';'`);
  ok(dive.schema.seed.trimEnd().endsWith(";"), `${tag} seed ends with ';' and nothing follows`);
  const ddlStmts = splitStatements(dive.schema.ddl);
  const seedStmts = splitStatements(dive.schema.seed);
  ok(ddlStmts.length >= 1 && ddlStmts.every((s) => /^\s*create\b/i.test(s)), `${tag} ddl is CREATE statements only`);
  ok(seedStmts.length >= 1 && seedStmts.every((s) => /^\s*insert\b/i.test(s)), `${tag} seed is INSERT statements only`);
  ok(Array.isArray(dive.schema.tables) && dive.schema.tables.length >= 1, `${tag} tables notes present`);
}

// -- execution + exact rows (twice per dive, determinism) ----------------------
function runOnce(dive: LcSqlDive): { columns: string[]; rows: unknown[][] } {
  const db = new Database(":memory:");
  try {
    for (const s of splitStatements(dive.schema.ddl)) db.run(s);
    for (const s of splitStatements(dive.schema.seed)) db.run(s);
    const st = db.prepare(dive.code.replace(/;+\s*$/, ""));
    const raw = st.all() as Record<string, unknown>[];
    const rows = raw.map((r) => st.columnNames.map((c) => r[c]));
    return { columns: [...st.columnNames], rows };
  } finally {
    db.close();
  }
}

for (const dive of SQL_PREMIUM3_ARENA as LcSqlDive[]) {
  const tag = `[${dive.slug}]`;
  const exp = EXPECTED_ROWS[dive.slug];
  ok(exp !== undefined, `${tag} has a hand-derived expectation`);

  let firstJson: string | null = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const run = runOnce(dive);
      const runJson = JSON.stringify(run.rows.map((r) => r.map(norm)));
      if (attempt === 1) firstJson = runJson;
      else ok(runJson === firstJson, `${tag} determinism: two runs identical`);

      ok(
        JSON.stringify(run.columns) === JSON.stringify(exp.columns),
        `${tag} attempt ${attempt}: columns ${JSON.stringify(run.columns)} expected ${JSON.stringify(exp.columns)}`,
      );
      ok(
        run.rows.length === exp.rows.length,
        `${tag} attempt ${attempt}: ${run.rows.length} rows, expected ${exp.rows.length}`,
      );
      for (let i = 0; i < Math.min(run.rows.length, exp.rows.length); i++) {
        for (let j = 0; j < exp.columns.length; j++) {
          ok(
            cellEq(run.rows[i][j], exp.rows[i][j]),
            `${tag} attempt ${attempt}: row ${i} col ${exp.columns[j]} = ${String(run.rows[i][j])}, expected ${String(exp.rows[i][j])}`,
          );
        }
      }
    } catch (err) {
      ok(false, `${tag} attempt ${attempt} execution FAILED: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

// -- trap probes: the planted wrong queries must actually differ ---------------
function runSql(ddl: string, seed: string, code: string): unknown[][] {
  const db = new Database(":memory:");
  try {
    for (const s of splitStatements(ddl)) db.run(s);
    for (const s of splitStatements(seed)) db.run(s);
    const st = db.prepare(code.replace(/;+\s*$/, ""));
    return (st.all() as Record<string, unknown>[]).map((r) => st.columnNames.map((c) => r[c]));
  } finally {
    db.close();
  }
}

{
  const d = SQL_PREMIUM3_ARENA.find((x) => x.slug === "the-number-of-passengers-in-each-bus-i")!;
  const tag = "[trap:bus-i]";
  // wrong query: raw join, no MIN, INNER — bus 3 overcounts to 6, bus 7 vanishes
  const wrong = runSql(
    d.schema.ddl, d.schema.seed,
    `SELECT b.bus_id, COUNT(*) AS c
     FROM Bus b JOIN Passenger p ON p.arrival_time <= b.arrival_time
     GROUP BY b.bus_id ORDER BY b.bus_id;`,
  );
  ok(JSON.stringify(wrong) !== JSON.stringify(EXPECTED_ROWS[d.slug].rows), `${tag} raw join differs from truth`);
  ok(JSON.stringify(wrong) === JSON.stringify([[3, 6], [12, 3]]), `${tag} raw join reports bus 3 at 6 and loses bus 7 (got ${JSON.stringify(wrong)})`);
}
{
  const d = SQL_PREMIUM3_ARENA.find((x) => x.slug === "the-number-of-passengers-in-each-bus-ii")!;
  const tag = "[trap:bus-ii]";
  // wrong queue order: arrival only, id DESC — rider 5 boards bus 9 first, rider 4 strands, bus 9 weight 45
  const wrong = runSql(
    d.schema.ddl, d.schema.seed,
    d.code.replace("ORDER BY arrival_time, passenger_id) AS ord", "ORDER BY arrival_time, passenger_id DESC) AS ord"),
  );
  ok(JSON.stringify(wrong) !== JSON.stringify(EXPECTED_ROWS[d.slug].rows), `${tag} id-DESC queue differs from truth`);
  ok(
    JSON.stringify(wrong) === JSON.stringify([[3, 2, 40], [7, 2, 100], [9, 2, 45]]),
    `${tag} id-DESC queue flips bus 9 to weight 45 (got ${JSON.stringify(wrong)})`,
  );
}
{
  const d = SQL_PREMIUM3_ARENA.find((x) => x.slug === "compute-the-rank-as-a-percentage")!;
  const tag = "[trap:pct]";
  // wrong arithmetic: integer 100 instead of 100.0 — Kaya 33, Mina 66, Noor 83
  const wrong = runSql(
    d.schema.ddl, d.schema.seed,
    d.code.replace("ROUND(100.0 *", "ROUND(100 *"),
  );
  ok(JSON.stringify(wrong) !== JSON.stringify(EXPECTED_ROWS[d.slug].rows), `${tag} integer division differs from truth`);
  const kaya = (wrong[2] as unknown[])[3];
  ok(norm(kaya) === 33, `${tag} integer division flattens Kaya to 33 (got ${String(kaya)})`);
}

// -- report ---------------------------------------------------------------------
console.log(`\n${assertions} assertions run`);
const perDive = EXPECTED_ORDER.map((slug) => {
  const diveFails = fails.filter((f) => f.startsWith(`[${slug}]`));
  return { slug, pass: diveFails.length === 0, count: diveFails.length };
});
console.log("\nPASS/FAIL table:");
for (const r of perDive) console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.slug}${r.pass ? "" : ` (${r.count} failure(s))`}`);
const otherFails = fails.filter((f) => !EXPECTED_ORDER.some((s) => f.startsWith(`[${s}]`)));
if (otherFails.length) console.log(`  FAIL  (batch-level): ${otherFails.length} failure(s)`);

if (fails.length) {
  console.error(`\n${fails.length} FAILURE(S):`);
  for (const f of fails) console.error(`  x ${f}`);
  process.exit(1);
}
console.log("\nALL CHECKS PASS 6/6");
