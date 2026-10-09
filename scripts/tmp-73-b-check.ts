// Task 73-b self-check — sql-df-growth-b.ts (3 Data & Finance growth dives:
// usage-tier-percentiles M20, ab-sample-ratio-mismatch M20, feature-adoption-windows H35).
// bun scripts/tmp-73-b-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_GROWTH_B } from "../src/lib/leetcode/content/sql-df-growth-b";
import { LC_XP } from "../src/lib/leetcode/types";
import type { LcSqlDive } from "../src/lib/leetcode/types";

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const closeTo = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;

/* ---------- helpers (b4 protocol) ---------- */
const stripComments = (sql: string) =>
  sql.split("\n").map((l) => { const i = l.indexOf("--"); return i >= 0 ? l.slice(0, i) : l; }).join("\n");

const stripOver = (sql: string) => {
  let s = "", i = 0;
  while (i < sql.length) {
    const m = /\bover\s*\(/i.exec(sql.slice(i));
    if (!m) { s += sql.slice(i); break; }
    const start = i + m.index;
    s += sql.slice(i, start);
    let depth = 0, j = start + m[0].length - 1;
    for (; j < sql.length; j++) {
      if (sql[j] === "(") depth++;
      else if (sql[j] === ")") { depth--; if (depth === 0) { j++; break; } }
    }
    i = j;
  }
  return s;
};

const sentenceCount = (p: string) => {
  const noDecimals = p.replace(/\d+\.\d+/g, "N");
  return noDecimals.split(/[.!?]+(?:\s|$)/).map((s) => s.trim()).filter(Boolean).length;
};

const trailingSemicolonClean = (s: string) => {
  const t = s.trimEnd();
  if (!t.endsWith(";")) return false;
  const lastNl = t.lastIndexOf("\n");
  const lastLine = t.slice(lastNl + 1);
  return lastLine.trimEnd().endsWith(";") && lastLine.indexOf(";") === lastLine.trimEnd().length - 1;
};
const noSemiInComments = (s: string) =>
  s.split("\n").every((l) => { const i = l.indexOf("--"); return i < 0 || !l.slice(i + 2).includes(";"); });

const tableCount = (ddl: string) => (ddl.match(/create\s+table/gi) ?? []).length;

const allStrings = (d: LcSqlDive): string[] => {
  const out: string[] = [d.slug, d.statement, d.approach, d.code, d.time, d.space,
    ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...d.constraints, ...d.breakdown, ...d.edges, ...d.walkthrough,
    ...d.followUps ?? [], ...d.related ?? [],
    ...d.ladder.flatMap((r) => [r.title, r.body]),
    d.schema.ddl, d.schema.seed, ...(d.schema.tables ?? []).flatMap((t) => [t.name, t.note])];
  return out;
};

const runSql = (db: Database, sql: string): unknown[][] => {
  const rows = db.query(sql).all() as Record<string, unknown>[];
  return rows.map((r) => Object.values(r)); // alias order = column order
};
const getCols = (db: Database, sql: string): string[] => {
  const rows = db.query(sql).all() as Record<string, unknown>[];
  if (!rows.length) throw new Error("solution returned zero rows — cannot read columns");
  return Object.keys(rows[0]);
};

const buildDb = (d: LcSqlDive): Database => {
  const db = new Database(":memory:");
  for (const st of splitStatements(d.schema.ddl)) db.run(st);
  for (const st of splitStatements(d.schema.seed)) db.run(st);
  return db;
};

/* ---------- spec ---------- */
const SPEC: Array<{
  slug: string; id: number; diff: "Medium" | "Hard"; xp: number;
  columns: string[]; rows: unknown[][]; realCells: Array<[number, number]>;
  intCols: number[]; ddlCount: number; seedCount: number;
  related: string[]; relatedPool: string[];
}> = [
  {
    slug: "usage-tier-percentiles", id: 8016, diff: "Medium", xp: 20,
    columns: ["tier", "users", "avg_events"],
    rows: [["whale", 1, 120], ["power", 3, 75], ["core", 6, 43.8], ["casual", 10, 23.1]],
    realCells: [[0, 2], [1, 2], [2, 2], [3, 2]],
    intCols: [1],
    ddlCount: 1, seedCount: 1,
    related: ["dau-wau-stickiness", "top-percentile-fraud", "growth-accounting"],
    relatedPool: ["dau-wau-stickiness", "top-percentile-fraud", "growth-accounting", "cohort-retention-matrix"],
  },
  {
    slug: "ab-sample-ratio-mismatch", id: 8017, diff: "Medium", xp: 20,
    columns: ["experiment_id", "exp_name", "control_n", "treatment_n", "expected_control_n", "deviation_pct", "srm_flag"],
    rows: [
      [1, "checkout-v2", 100, 100, 100, 0, "ok"],
      [2, "pricing-page", 120, 80, 100, 20, "SRM"],
      [3, "onboarding-nudge", 133, 67, 140, 5, "ok"],
    ],
    realCells: [[0, 4], [0, 5], [1, 4], [1, 5], [2, 4], [2, 5]],
    intCols: [0, 2, 3],
    ddlCount: 2, seedCount: 2,
    related: ["ab-test-conversion-lift", "funnel-step-conversion", "compute-the-rank-as-a-percentage"],
    relatedPool: ["ab-test-conversion-lift", "funnel-step-conversion", "compute-the-rank-as-a-percentage", "dau-wau-stickiness"],
  },
  {
    slug: "feature-adoption-windows", id: 8018, diff: "Hard", xp: 35,
    columns: ["cohort_week", "users", "pct_7d", "pct_14d", "pct_30d"],
    rows: [
      ["2026-09-07", 6, 50, 66.7, 83.3],
      ["2026-09-14", 5, 40, 60, 60],
      ["2026-09-21", 4, 25, 50, 50],
    ],
    realCells: [[0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 2], [2, 3], [2, 4]],
    intCols: [1],
    ddlCount: 2, seedCount: 2,
    related: ["cohort-retention-matrix", "funnel-step-conversion", "growth-accounting"],
    // week-over-week-churn (batch-2, another agent) may not be registered yet —
    // the spec's named fallback growth-accounting replaces it in the pool.
    relatedPool: ["cohort-retention-matrix", "funnel-step-conversion", "analyze-subscription-conversion", "growth-accounting"],
  },
];

const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

/* ---------- file-level hygiene ---------- */
console.log(`\n=== sql-df-growth-b.ts — ${SQL_DF_GROWTH_B.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_GROWTH_B.length === 3 && SPEC.every((s, i) => SQL_DF_GROWTH_B[i]?.slug === s.slug),
  SQL_DF_GROWTH_B.map((d) => d.slug).join(" | "));
{
  const fileText = await Bun.file(import.meta.dir + "/../src/lib/leetcode/content/sql-df-growth-b.ts").text();
  ok("FILE: no platform strings (leetcode/hackerrank/datalemur/stratascratch)",
    !/leetcode|hackerrank|datalemur|stratascratch/i.test(fileText));
  ok("FILE: no ${ template interpolation", !fileText.includes("${"));
  ok("FILE: no e.g./i.e. in any prose", !/\be\.g\./i.test(fileText) && !/\bi\.e\./i.test(fileText));
}

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_GROWTH_B[i];
  const spec = SPEC[i];
  console.log(`\n--- dive ${i + 1}: ${d.slug} ---`);

  // statement count + result-level ORDER BY
  ok("exactly ONE statement (countStatements)", countStatements(d.code) === 1);
  ok("exactly ONE statement (splitStatements)", splitStatements(d.code).length === 1);
  const stripped = stripOver(stripComments(d.code));
  ok("result-level ORDER BY after stripping comments/OVER spans", /order\s+by/i.test(stripped));
  ok('order === "exact"', d.order === "exact");
  ok("approach is ONE line", !d.approach.includes("\n"));
  ok("no writeVerify (read-only problem)", (d as unknown as Record<string, unknown>).writeVerify === undefined);
  ok("code computes REALs via ROUND(", /round\s*\(/i.test(d.code));

  // trailing-semicolon + comment hygiene
  ok("code ends with a single trailing ';'", trailingSemicolonClean(d.code));
  ok("ddl ends with ';' and nothing after", trailingSemicolonClean(d.schema.ddl));
  ok("seed ends with ';' and nothing after", trailingSemicolonClean(d.schema.seed));
  ok("no ';' inside comments of ddl/seed/code",
    noSemiInComments(d.schema.ddl) && noSemiInComments(d.schema.seed) && noSemiInComments(d.code));

  // structure / sentence audit
  const sc = sentenceCount(d.statement);
  ok(`statement has 3-6 sentences (got ${sc})`, sc >= 3 && sc <= 6);
  ok("2 examples with input+output+explanation",
    d.examples.length === 2 && d.examples.every((e) => e.input.trim() && e.output.trim() && (e.explanation ?? "").trim()));
  ok("3-4 constraints", d.constraints.length >= 3 && d.constraints.length <= 4);
  ok("exactly 3 breakdown paragraphs", d.breakdown.length === 3);
  d.breakdown.forEach((p, j) => {
    const c = sentenceCount(p);
    ok(`breakdown para ${j + 1} has 3-6 sentences (got ${c})`, c >= 3 && c <= 6);
  });
  ok("3-5 edges", d.edges.length >= 3 && d.edges.length <= 5);
  d.edges.forEach((p, j) =>
    ok(`edge ${j + 1} has >= 1 full sentence (got ${sentenceCount(p)})`, sentenceCount(p) >= 1));
  ok("3 ladder rungs (title+body)", d.ladder.length === 3 && d.ladder.every((r) => r.title.trim() && r.body.trim()));
  d.ladder.forEach((r, j) =>
    ok(`ladder rung ${j + 1} body has >= 2 sentences (got ${sentenceCount(r.body)})`, sentenceCount(r.body) >= 2));
  ok("walkthrough: one paragraph per logical chunk (3)", d.walkthrough.length === 3);
  d.walkthrough.forEach((p, j) =>
    ok(`walkthrough para ${j + 1} has >= 3 sentences (got ${sentenceCount(p)})`, sentenceCount(p) >= 3));
  ok("2-3 followUps", (d.followUps?.length ?? 0) >= 2 && (d.followUps?.length ?? 0) <= 3);
  ok("exactly 3 related slugs", (d.related?.length ?? 0) === 3);
  d.related?.forEach((r) => {
    ok(`related slug from the verified pool: ${r}`, spec.relatedPool.includes(r));
    ok(`related slug exists in the registry: ${r}`, LC_SLUGS.has(r));
  });
  ok(`schema.tables has one entry per DDL table (${tableCount(d.schema.ddl)})`,
    (d.schema.tables?.length ?? 0) === tableCount(d.schema.ddl));

  // hygiene: backticks / ${ / platform mention in any dive string
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string", strs.every((s) => !/leetcode|hackerrank|datalemur|stratascratch/i.test(s)));

  // registry tuple — the lead wires 8016-8018 AFTER this file ships, so a
  // missing row is PENDING (logged, never a failure); a present row must
  // match exactly or the run goes red.
  const regRow = LC_ALL.find((p) => p.slug === spec.slug);
  if (!regRow) {
    console.log(`  PENDING  registry row for ${spec.slug} (id ${spec.id}, ${spec.diff}) — lead wiring not applied yet; re-run after wiring for the tuple assert`);
  } else {
    ok(`registry num === ${spec.id}`, regRow.num === spec.id, String(regRow.num));
    ok(`registry difficulty === ${spec.diff}`, regRow.difficulty === spec.diff, regRow.difficulty);
  }
  ok(`dive xp === ${spec.xp} (LC_XP.${spec.diff})`, d.xp === spec.xp && spec.xp === LC_XP[spec.diff]);

  // statement counts of ddl and seed via BOTH counters
  ok(`ddl carries ${spec.ddlCount} statement(s) (countStatements === splitStatements === ${spec.ddlCount})`,
    countStatements(d.schema.ddl) === spec.ddlCount && splitStatements(d.schema.ddl).length === spec.ddlCount,
    `${countStatements(d.schema.ddl)}/${splitStatements(d.schema.ddl).length}`);
  ok(`seed carries ${spec.seedCount} statement(s) (countStatements === splitStatements === ${spec.seedCount})`,
    countStatements(d.schema.seed) === spec.seedCount && splitStatements(d.schema.seed).length === spec.seedCount,
    `${countStatements(d.schema.seed)}/${splitStatements(d.schema.seed).length}`);

  // engine: build from ddl+seed, run solution TWICE, hard-assert columns + every cell
  try {
    const db = buildDb(d);
    const r1 = runSql(db, d.code);
    const c1 = getCols(db, d.code);
    const r2 = runSql(db, d.code);
    ok("determinism: two runs identical", eq(r1, r2));
    ok(`columns === [${spec.columns.join(", ")}]`, eq(c1, spec.columns), JSON.stringify(c1));
    ok(`row count === ${spec.rows.length}`, r1.length === spec.rows.length, String(r1.length));
    r1.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        ok(`cell(${ri + 1},${ci + 1}) ${spec.columns[ci]} === ${JSON.stringify(spec.rows[ri][ci])}`,
          eq(cell, spec.rows[ri][ci]), JSON.stringify(cell));
      });
    });
    spec.realCells.forEach(([ri, ci]) => {
      const cell = r1[ri][ci] as number;
      ok(`REAL cell(${ri + 1},${ci + 1}) within 1e-9 of ${spec.rows[ri][ci]} (typeof number)`,
        typeof cell === "number" && closeTo(cell, spec.rows[ri][ci] as number), String(cell));
    });
    spec.intCols.forEach((ci) => {
      ok(`integer column ${spec.columns[ci]} is integral on every row`,
        r1.every((row) => Number.isInteger(row[ci])));
    });
    ok("rows === spec (order-sensitive, whole-array)", eq(r1, spec.rows), JSON.stringify(r1));
    console.log(`  ENGINE ${spec.slug}:`);
    r1.forEach((row) => console.log("    " + JSON.stringify(row)));
    (db as Database).close();
  } catch (e) {
    ok("engine build+run", false, String(e));
  }
}

/* ================= dive 1 hand-verification: the 20-count distribution ================= */
console.log("\n=== usage-tier-percentiles — seed + percentile hand-verification ===");
{
  const d = SQL_DF_GROWTH_B[0];
  const PINNED_COUNTS: Array<[number, number]> = [
    [1, 120], [2, 90], [3, 75], [4, 60], [5, 55], [6, 50], [7, 45], [8, 40], [9, 38], [10, 35],
    [11, 33], [12, 30], [13, 28], [14, 26], [15, 24], [16, 22], [17, 20], [18, 18], [19, 15], [20, 15],
  ];
  const db = buildDb(d);
  const counts = runSql(db, "SELECT user_id, COUNT(*) AS c FROM events GROUP BY user_id ORDER BY user_id");
  ok("seed integrity: 20 users with the pinned counts (user 1..20)", eq(counts, PINNED_COUNTS), JSON.stringify(counts));
  ok("seed integrity: 839 raw event rows",
    eq(runSql(db, "SELECT COUNT(*) FROM events"), [[839]]), JSON.stringify(runSql(db, "SELECT COUNT(*) FROM events")));
  const distinctDates = runSql(db,
    "SELECT user_id, COUNT(DISTINCT event_date) AS d FROM events WHERE user_id IN (19, 20) GROUP BY user_id ORDER BY user_id");
  ok("seed integrity: users 19/20 hold 15 rows on 14 distinct dates (the double-logged day)", eq(distinctDates, [[19, 14], [20, 14]]), JSON.stringify(distinctDates));

  const ranked = runSql(db, `WITH counted AS (
      SELECT user_id, COUNT(*) AS event_count FROM events GROUP BY user_id)
    SELECT user_id, event_count,
      PERCENT_RANK() OVER (ORDER BY event_count) AS pr,
      RANK() OVER (ORDER BY event_count) AS rk,
      ROW_NUMBER() OVER (ORDER BY event_count) AS rn
    FROM counted
    ORDER BY event_count ASC, user_id ASC`);
  ok("ranked: 20 scored rows", ranked.length === 20, String(ranked.length));
  ok("the tied pair: users 19 and 20 both at RANK 1 with pr = 0 (share the smallest rank)",
    eq([ranked[0][0], ranked[0][2], ranked[0][3]], [19, 0, 1]) && eq([ranked[1][0], ranked[1][2], ranked[1][3]], [20, 0, 1]),
    JSON.stringify([ranked[0], ranked[1]]));
  ok("ROW_NUMBER splits the pair across positions 1 and 2 (deterministic via the user_id tiebreak)",
    ranked[0][4] === 1 && ranked[1][4] === 2, JSON.stringify([ranked[0][4], ranked[1][4]]));
  ok("the 18 follows at RANK 3 with pr = 2/19 (the tie consumes position 2)",
    ranked[2][3] === 3 && closeTo(ranked[2][2] as number, 2 / 19, 1e-12), JSON.stringify(ranked[2]));
  const byCount = (c: number) => ranked.find((r) => r[1] === c)!;
  const boundaries: Array<[number, number]> = [[33, 9 / 19], [35, 10 / 19], [55, 15 / 19], [60, 16 / 19], [90, 18 / 19]];
  boundaries.forEach(([c, p]) =>
    ok(`boundary count ${c} reads pr = ${p.toFixed(4)} (hand: rank0/19)`, closeTo(byCount(c)[2] as number, p, 1e-12), String(byCount(c)[2])));
  ok("the 120 tops out at pr = 19/19 = 1 (the only whale)", byCount(120)[2] === 1, String(byCount(120)[2]));
  ok("pr = 0.0 club under RANK semantics: 2 users", ranked.filter((r) => r[2] === 0).length === 2);
  db.close();
}

/* ================= dive 2 hand-verification: arms + ROUND semantics ================= */
console.log("\n=== ab-sample-ratio-mismatch — seed + arithmetic hand-verification ===");
{
  const d = SQL_DF_GROWTH_B[1];
  const db = buildDb(d);
  ok("seed integrity: 3 experiments",
    eq(runSql(db, "SELECT COUNT(*) FROM experiments"), [[3]]));
  ok("seed integrity: 605 assignment rows (605 = 202 + 202 + 201)",
    eq(runSql(db, "SELECT COUNT(*) FROM assignments"), [[605]]));
  const arms = runSql(db,
    "SELECT experiment_id, variant, COUNT(*) AS n FROM assignments GROUP BY experiment_id, variant ORDER BY experiment_id, variant IS NOT NULL, variant");
  const armMap: Record<string, number> = {};
  arms.forEach((r) => { armMap[`${r[0]}:${r[1] === null ? "NULL" : r[1]}`] = r[2] as number; });
  ok("seed integrity: E1 armed 100/100 + 2 NULL", armMap["1:control"] === 100 && armMap["1:treatment"] === 100 && armMap["1:NULL"] === 2, JSON.stringify(armMap));
  ok("seed integrity: E2 armed 120/80 + 2 NULL", armMap["2:control"] === 120 && armMap["2:treatment"] === 80 && armMap["2:NULL"] === 2, JSON.stringify(armMap));
  ok("seed integrity: E3 armed 133/67 + 1 NULL", armMap["3:control"] === 133 && armMap["3:treatment"] === 67 && armMap["3:NULL"] === 1, JSON.stringify(armMap));
  ok("SQLite ROUND is half away from zero: ROUND(2.5) = 3, ROUND(-2.5) = -3",
    eq(runSql(db, "SELECT ROUND(2.5) AS a, ROUND(-2.5) AS b"), [[3, -3]]));
  ok("expected sizes: engine ROUND(200 * 0.7) = 140 and ROUND(201 * 0.7) = 141 (the NULL-skewed total)",
    eq(runSql(db, "SELECT ROUND(200 * 0.7) AS a, ROUND(201 * 0.7) AS b"), [[140, 141]]));
  ok("E3 control-side miss: 700/140 = 5 exactly in binary (no rounding dust)", 700 / 140 === 5);
  ok("naive-NULL E3 miss: 800/141 = 5.673758865248227 (5.67 rounded)", closeTo(800 / 141, 5.673758865248227, 1e-12));
  db.close();
}

/* ================= dive 3 hand-verification: Monday spine + first-use days ================= */
console.log("\n=== feature-adoption-windows — seed + per-user hand-verification ===");
{
  const d = SQL_DF_GROWTH_B[2];
  const db = buildDb(d);
  ok("seed integrity: 15 users, 13 feature rows",
    eq(runSql(db, "SELECT (SELECT COUNT(*) FROM users) AS u, (SELECT COUNT(*) FROM feature_events) AS f"), [[15, 13]]));
  ok("spine sanity: 2026-09-07 is a Monday (%w = 1) and 2026-09-13 a Sunday (%w = 0)",
    eq(runSql(db, "SELECT strftime('%w', '2026-09-07') AS a, strftime('%w', '2026-09-13') AS b"), [["1", "0"]]));
  const perUser = runSql(db, `SELECT u.user_id,
      date(u.signup_date, '-' || ((CAST(strftime('%w', u.signup_date) AS INTEGER) + 6) % 7) || ' days') AS cw,
      CAST(julianday(f.first_used) - julianday(u.signup_date) AS INTEGER) AS fd
    FROM users u
    LEFT JOIN (SELECT user_id, MIN(used_date) AS first_used FROM feature_events GROUP BY user_id) f
      ON f.user_id = u.user_id
    ORDER BY u.user_id`);
  ok("all 15 users land on their week's Monday spine (6 / 5 / 4)",
    eq(perUser.map((r) => r[1]), Array(6).fill("2026-09-07").concat(Array(5).fill("2026-09-14"), Array(4).fill("2026-09-21"))),
    JSON.stringify(perUser.map((r) => r[1])));
  ok("first_use_days per user: 1,5,6,12,22,NULL · 0,2,9,NULL,NULL · 4,11,NULL,NULL (MIN drives)",
    eq(perUser.map((r) => r[2]), [1, 5, 6, 12, 22, null, 0, 2, 9, null, null, 4, 11, null, null]),
    JSON.stringify(perUser.map((r) => r[2])));
  db.close();
}

/* ================= planted-trap probes: the WRONG queries must produce the documented wrong outputs ================= */
console.log("\n=== planted-trap probes ===");
const probe = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};

/* ----- dive 1 probes ----- */
{
  const d = SQL_DF_GROWTH_B[0];
  const db = buildDb(d);
  probe("D1 ROW_NUMBER instead of RANK splits the tied pair: the second 15 reads pr 1/19 ≈ 0.0526 and the pr = 0.0 club shrinks 2 → 1",
    (() => {
      const rows = runSql(db, `WITH counted AS (SELECT user_id, COUNT(*) AS event_count FROM events GROUP BY user_id)
        SELECT user_id, event_count,
          1.0 * (ROW_NUMBER() OVER (ORDER BY event_count) - 1) / 19 AS pr_rn,
          PERCENT_RANK() OVER (ORDER BY event_count) AS pr
        FROM counted ORDER BY event_count ASC, user_id ASC`);
      const zerosRn = rows.filter((r) => r[2] === 0).length;   // pr_rn === 0
      const zerosPr = rows.filter((r) => r[3] === 0).length;   // real PERCENT_RANK
      const second = rows[1]; // user 20 after the (event_count, user_id) tiebreak
      return zerosPr === 2 && zerosRn === 1 && second[0] === 20 && closeTo(second[2] as number, 1 / 19, 1e-12);
    })());
  probe("D1 fixed count cutoffs ('power 50+, core 20+') kill the whale row and balloon power: 3 rows [power 6·75, core 11·31, casual 3·16]",
    eq(runSql(db, `WITH counted AS (SELECT user_id, COUNT(*) AS event_count FROM events GROUP BY user_id)
      SELECT CASE WHEN event_count >= 50 THEN 'power' WHEN event_count >= 20 THEN 'core' ELSE 'casual' END AS tier,
        COUNT(*) AS users, ROUND(AVG(event_count), 1) AS avg_events
      FROM counted GROUP BY tier
      ORDER BY CASE tier WHEN 'power' THEN 1 WHEN 'core' THEN 2 ELSE 3 END`),
      [["power", 6, 75], ["core", 11, 31], ["casual", 3, 16]]));
  probe("D1 alphabetical ORDER BY tier ships the exact reverse of the pinned reading order (casual → whale)",
    eq(runSql(db, `WITH counted AS (SELECT user_id, COUNT(*) AS event_count FROM events GROUP BY user_id),
        ranked AS (SELECT event_count, PERCENT_RANK() OVER (ORDER BY event_count) AS pr FROM counted)
      SELECT CASE WHEN pr >= 0.95 THEN 'whale' WHEN pr >= 0.80 THEN 'power' WHEN pr >= 0.50 THEN 'core' ELSE 'casual' END AS tier,
        COUNT(*) AS users, ROUND(AVG(event_count), 1) AS avg_events
      FROM ranked GROUP BY tier ORDER BY tier`),
      [["casual", 10, 23.1], ["core", 6, 43.8], ["power", 3, 75], ["whale", 1, 120]]));
  db.close();
}

/* ----- dive 2 probes ----- */
{
  const d = SQL_DF_GROWTH_B[1];
  const db = buildDb(d);
  const ARMS = `WITH arms AS (
    SELECT e.experiment_id, e.exp_name, e.expected_control_share,
      COUNT(CASE WHEN a.variant = 'control' THEN 1 END) AS control_n,
      COUNT(CASE WHEN a.variant = 'treatment' THEN 1 END) AS treatment_n
    FROM experiments e JOIN assignments a ON a.experiment_id = e.experiment_id
    WHERE a.variant IS NOT NULL
    GROUP BY e.experiment_id, e.exp_name, e.expected_control_share)`;
  probe("D2 comparing control_n against expected_control_share directly is nonsense: deviations 19900 / 23900 / 18900 scream SRM everywhere",
    eq(runSql(db, `${ARMS}
      SELECT experiment_id, exp_name, control_n,
        ROUND(100.0 * ABS(control_n - expected_control_share) / expected_control_share, 2) AS dev_pct
      FROM arms ORDER BY experiment_id ASC`),
      [[1, "checkout-v2", 100, 19900], [2, "pricing-page", 120, 23900], [3, "onboarding-nudge", 133, 18900]]));
  probe("D2 measuring the TREATMENT side flags healthy E3 'SRM' at 11.67 (control side says 5.0 'ok')",
    eq(runSql(db, `${ARMS},
      sized AS (SELECT experiment_id, exp_name, control_n, treatment_n,
        ROUND((control_n + treatment_n) * (1 - expected_control_share)) AS expected_treatment_n FROM arms)
      SELECT experiment_id, exp_name, control_n, treatment_n, expected_treatment_n,
        ROUND(100.0 * ABS(treatment_n - expected_treatment_n) / expected_treatment_n, 2) AS deviation_pct,
        CASE WHEN ROUND(100.0 * ABS(treatment_n - expected_treatment_n) / expected_treatment_n, 2) > 5.0 THEN 'SRM' ELSE 'ok' END AS srm_flag
      FROM sized ORDER BY experiment_id ASC`),
      [[1, "checkout-v2", 100, 100, 100, 0, "ok"], [2, "pricing-page", 120, 80, 100, 20, "SRM"],
       [3, "onboarding-nudge", 133, 67, 60, 11.67, "SRM"]]));
  probe("D2 dropping the NULL guard lets the 5 failed rows into a COUNT(*) total: E3 expected 141.0, dev 5.67, flips 'ok' → 'SRM'",
    eq(runSql(db, `WITH arms AS (
      SELECT e.experiment_id, e.exp_name, e.expected_control_share,
        COUNT(CASE WHEN a.variant = 'control' THEN 1 END) AS control_n,
        COUNT(CASE WHEN a.variant = 'treatment' THEN 1 END) AS treatment_n,
        COUNT(*) AS total_raw
      FROM experiments e JOIN assignments a ON a.experiment_id = e.experiment_id
      GROUP BY e.experiment_id, e.exp_name, e.expected_control_share)
      SELECT experiment_id, exp_name, control_n, treatment_n,
        ROUND(total_raw * expected_control_share) AS expected_control_n,
        ROUND(100.0 * ABS(control_n - ROUND(total_raw * expected_control_share)) / ROUND(total_raw * expected_control_share), 2) AS deviation_pct,
        CASE WHEN ROUND(100.0 * ABS(control_n - ROUND(total_raw * expected_control_share)) / ROUND(total_raw * expected_control_share), 2) > 5.0 THEN 'SRM' ELSE 'ok' END AS srm_flag
      FROM arms ORDER BY experiment_id ASC`),
      [[1, "checkout-v2", 100, 100, 101, 0.99, "ok"], [2, "pricing-page", 120, 80, 101, 18.81, "SRM"],
       [3, "onboarding-nudge", 133, 67, 141, 5.67, "SRM"]]));
  probe("D2 '>=' instead of the strict '>' flips the boundary: E3's exact 5.0 reads 'SRM' (control_n/expected/dev cells unchanged)",
    eq(runSql(db, `${ARMS},
      sized AS (SELECT experiment_id, exp_name, control_n, treatment_n,
        ROUND((control_n + treatment_n) * expected_control_share) AS expected_control_n FROM arms),
      scored AS (SELECT experiment_id, exp_name, control_n, treatment_n, expected_control_n,
        ROUND(100.0 * ABS(control_n - expected_control_n) / expected_control_n, 2) AS deviation_pct FROM sized)
      SELECT experiment_id, exp_name, control_n, treatment_n, expected_control_n, deviation_pct,
        CASE WHEN deviation_pct >= 5.0 THEN 'SRM' ELSE 'ok' END AS srm_flag
      FROM scored ORDER BY experiment_id ASC`),
      [[1, "checkout-v2", 100, 100, 100, 0, "ok"], [2, "pricing-page", 120, 80, 100, 20, "SRM"],
       [3, "onboarding-nudge", 133, 67, 140, 5, "SRM"]]));
  probe("D2 naive COUNT(variant = 'control') tallies BOTH arms (200/200 everywhere): E2's real 20.0 SRM hides behind 0.0 'ok', E3 reads 28.57",
    eq(runSql(db, `WITH arms AS (
      SELECT e.experiment_id, e.exp_name, e.expected_control_share,
        COUNT(a.variant = 'control') AS control_n,
        COUNT(a.variant = 'treatment') AS treatment_n
      FROM experiments e JOIN assignments a ON a.experiment_id = e.experiment_id
      WHERE a.variant IS NOT NULL
      GROUP BY e.experiment_id, e.exp_name, e.expected_control_share)
      SELECT experiment_id, exp_name, control_n, treatment_n,
        ROUND((control_n + treatment_n) * expected_control_share) AS expected_control_n,
        ROUND(100.0 * ABS(control_n - ROUND((control_n + treatment_n) * expected_control_share)) / ROUND((control_n + treatment_n) * expected_control_share), 2) AS deviation_pct,
        CASE WHEN ROUND(100.0 * ABS(control_n - ROUND((control_n + treatment_n) * expected_control_share)) / ROUND((control_n + treatment_n) * expected_control_share), 2) > 5.0 THEN 'SRM' ELSE 'ok' END AS srm_flag
      FROM arms ORDER BY experiment_id ASC`),
      [[1, "checkout-v2", 200, 200, 200, 0, "ok"], [2, "pricing-page", 200, 200, 200, 0, "ok"],
       [3, "onboarding-nudge", 200, 200, 280, 28.57, "SRM"]]));
  db.close();
}

/* ----- dive 3 probes ----- */
{
  const d = SQL_DF_GROWTH_B[2];
  const db = buildDb(d);
  const monday = "date(u.signup_date, '-' || ((CAST(strftime('%w', u.signup_date) AS INTEGER) + 6) % 7) || ' days')";
  const FOLD = `SELECT cohort_week, COUNT(*) AS users,
      ROUND(100.0 * AVG(CASE WHEN fd <= 7 THEN 1 ELSE 0 END), 1) AS pct_7d,
      ROUND(100.0 * AVG(CASE WHEN fd <= 14 THEN 1 ELSE 0 END), 1) AS pct_14d,
      ROUND(100.0 * AVG(CASE WHEN fd <= 30 THEN 1 ELSE 0 END), 1) AS pct_30d
    FROM dated GROUP BY cohort_week ORDER BY cohort_week ASC`;
  probe("D3 anchoring on the COHORT's Monday instead of each user's OWN signup rewrites week 1: 50.0/66.7/83.3 → 33.3/50.0/83.3 (user 3 day 6 → day 9, user 4 day 12 → day 16)",
    eq(runSql(db, `WITH first_use AS (SELECT user_id, MIN(used_date) AS first_used FROM feature_events GROUP BY user_id),
      dated AS (SELECT u.signup_date, ${monday} AS cohort_week,
        CAST(julianday(f.first_used) - julianday(${monday}) AS INTEGER) AS fd
        FROM users u LEFT JOIN first_use f ON f.user_id = u.user_id)
      ${FOLD}`),
      [["2026-09-07", 6, 33.3, 50, 83.3], ["2026-09-14", 5, 40, 60, 60], ["2026-09-21", 4, 25, 50, 50]]));
  probe("D3 INNER JOIN to first-use evicts never-users: week 2 inflates to users 3 at 66.7/100.0/100.0 (users column moves 5 → 3)",
    eq(runSql(db, `WITH first_use AS (SELECT user_id, MIN(used_date) AS first_used FROM feature_events GROUP BY user_id),
      dated AS (SELECT u.signup_date, ${monday} AS cohort_week,
        CAST(julianday(f.first_used) - julianday(u.signup_date) AS INTEGER) AS fd
        FROM users u JOIN first_use f ON f.user_id = u.user_id)
      ${FOLD}`),
      [["2026-09-07", 5, 60, 80, 100], ["2026-09-14", 3, 66.7, 100, 100], ["2026-09-21", 2, 50, 100, 100]]));
  probe("D3 bare AVG(first_use_days <= 7) lets NULL comparisons escape: same inflated shares as INNER JOIN but the users column still says 6/5/4",
    eq(runSql(db, `WITH first_use AS (SELECT user_id, MIN(used_date) AS first_used FROM feature_events GROUP BY user_id),
      dated AS (SELECT u.signup_date, ${monday} AS cohort_week,
        CAST(julianday(f.first_used) - julianday(u.signup_date) AS INTEGER) AS fd
        FROM users u LEFT JOIN first_use f ON f.user_id = u.user_id)
      SELECT cohort_week, COUNT(*) AS users,
        ROUND(100.0 * AVG(fd <= 7), 1) AS pct_7d,
        ROUND(100.0 * AVG(fd <= 14), 1) AS pct_14d,
        ROUND(100.0 * AVG(fd <= 30), 1) AS pct_30d
      FROM dated GROUP BY cohort_week ORDER BY cohort_week ASC`),
      [["2026-09-07", 6, 60, 80, 100], ["2026-09-14", 5, 66.7, 100, 100], ["2026-09-21", 4, 50, 100, 100]]));
  probe("D3 dropping the +6 %7 shift yields SUNDAY weeks: signup 6 slides into the next cohort — middle row becomes 2026-09-13 · 6 · 33.3/50.0/50.0",
    eq(runSql(db, `WITH first_use AS (SELECT user_id, MIN(used_date) AS first_used FROM feature_events GROUP BY user_id),
      dated AS (SELECT u.signup_date,
        date(u.signup_date, '-' || CAST(strftime('%w', u.signup_date) AS INTEGER) || ' days') AS cohort_week,
        CAST(julianday(f.first_used) - julianday(u.signup_date) AS INTEGER) AS fd
        FROM users u LEFT JOIN first_use f ON f.user_id = u.user_id)
      ${FOLD}`),
      [["2026-09-06", 5, 60, 80, 100], ["2026-09-13", 6, 33.3, 50, 50], ["2026-09-20", 4, 25, 50, 50]]));
  probe("D3 MAX instead of MIN pushes user 1 to its day-9 return row: week 1 pct_7d sags 50.0 → 33.3 (pct_14d survives at 66.7)",
    eq(runSql(db, `WITH first_use AS (SELECT user_id, MAX(used_date) AS first_used FROM feature_events GROUP BY user_id),
      dated AS (SELECT u.signup_date, ${monday} AS cohort_week,
        CAST(julianday(f.first_used) - julianday(u.signup_date) AS INTEGER) AS fd
        FROM users u LEFT JOIN first_use f ON f.user_id = u.user_id)
      ${FOLD}`),
      [["2026-09-07", 6, 33.3, 66.7, 83.3], ["2026-09-14", 5, 40, 60, 60], ["2026-09-21", 4, 25, 50, 50]]));
  probe("D3 raw users-times-events join (no per-user MIN) row-weights everything: week 1 degenerates to 7 rows at 57.1/85.7/100.0",
    eq(runSql(db, `SELECT ${monday} AS cohort_week, COUNT(*) AS users,
        ROUND(100.0 * AVG(CASE WHEN CAST(julianday(e.used_date) - julianday(u.signup_date) AS INTEGER) <= 7 THEN 1 ELSE 0 END), 1) AS pct_7d,
        ROUND(100.0 * AVG(CASE WHEN CAST(julianday(e.used_date) - julianday(u.signup_date) AS INTEGER) <= 14 THEN 1 ELSE 0 END), 1) AS pct_14d,
        ROUND(100.0 * AVG(CASE WHEN CAST(julianday(e.used_date) - julianday(u.signup_date) AS INTEGER) <= 30 THEN 1 ELSE 0 END), 1) AS pct_30d
      FROM users u JOIN feature_events e ON e.user_id = u.user_id
      GROUP BY cohort_week ORDER BY cohort_week ASC`),
      [["2026-09-07", 7, 57.1, 85.7, 100], ["2026-09-14", 4, 75, 100, 100], ["2026-09-21", 2, 50, 100, 100]]));
  probe("D3 ROUND instead of CAST on the day delta HAPPENS TO AGREE (documented, not live — every delta is an integral number of midnights)",
    eq(runSql(db, `WITH first_use AS (SELECT user_id, MIN(used_date) AS first_used FROM feature_events GROUP BY user_id),
      dated AS (SELECT u.signup_date, ${monday} AS cohort_week,
        CAST(ROUND(julianday(f.first_used) - julianday(u.signup_date)) AS INTEGER) AS fd
        FROM users u LEFT JOIN first_use f ON f.user_id = u.user_id)
      ${FOLD}`),
      SPEC[2].rows));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_GROWTH_B.length}/3`);
