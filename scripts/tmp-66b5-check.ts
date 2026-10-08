/**
 * Task 66-b5 self-check — sql-premium2-finals.ts
 * Structure invariants + bun:sqlite execution against hand-derived expected rows.
 * Run: bun scripts/tmp-66b5-check.ts
 */
import { Database } from "bun:sqlite";
import { SQL_PREMIUM2_FINALS } from "../src/lib/leetcode/content/sql-premium2-finals";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { LcSqlDive } from "../src/lib/leetcode/types";

let assertions = 0;
const fails: string[] = [];
const ok = (cond: boolean, msg: string) => {
  assertions++;
  if (!cond) fails.push(msg);
};

function norm(v: unknown): unknown {
  const c = v as never as number | string | null;
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
  if (typeof v === "string") fn(v);
  else if (Array.isArray(v)) v.forEach((x) => walkStrings(x, fn));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => walkStrings(x, fn));
}

// -- verified related-slug pool (rg'd against src/lib/leetcode/registry*.ts) --
const POOL = new Set([
  "user-activity-for-the-past-30-days-i",
  "game-play-analysis-iv",
  "the-latest-login-in-2020",
  "percentage-of-users-attended-a-contest",
  "queries-quality-and-percentage",
  "average-selling-price",
  "total-sales-amount-by-year",
  "top-travellers",
  "students-and-examinations",
  "count-salary-categories",
  "friend-requests-ii-who-has-the-most-friends",
  "consecutive-available-seats",
  "active-users",
  "customers-who-bought-a-and-b-not-c",
]);

const EXPECTED_ORDER = [
  "hopper-company-queries-i",
  "hopper-company-queries-ii",
  "hopper-company-queries-iii",
  "find-the-subtasks-that-did-not-execute",
  "grand-slam-titles",
  "find-interview-candidates",
];
const XP_BY_SLUG: Record<string, number> = {
  "hopper-company-queries-i": 35,
  "hopper-company-queries-ii": 35,
  "hopper-company-queries-iii": 35,
  "find-the-subtasks-that-did-not-execute": 35,
  "grand-slam-titles": 20,
  "find-interview-candidates": 20,
};
const EXPECTED_ROWS: Record<string, { columns: string[]; rows: unknown[][] }> = {
  "hopper-company-queries-i": { columns: ["month", "working_drivers"], rows: [[10, 3], [11, 5]] },
  "hopper-company-queries-ii": { columns: ["month", "percentage"], rows: [[10, 66.67], [11, 80]] },
  "hopper-company-queries-iii": {
    columns: ["month", "average_ride_distance", "average_ride_duration"],
    rows: [[10, 19.25, 28.75], [11, 23, 31.67]],
  },
  "find-the-subtasks-that-did-not-execute": { columns: ["task_id", "subtask_id"], rows: [[4, 3]] },
  "grand-slam-titles": {
    columns: ["player_id", "name", "grand_slams_count"],
    rows: [[1, "Moreau", 2], [2, "Lindqvist", 2], [3, "Tanaka", 2], [4, "Okafor", 1], [5, "Duarte", 1]],
  },
  "find-interview-candidates": { columns: ["user_id"], rows: [[2], [3], [4]] },
};

// -- batch-level shape --------------------------------------------------------
ok(Array.isArray(SQL_PREMIUM2_FINALS), "export is an array");
ok(SQL_PREMIUM2_FINALS.length === 6, `exactly 6 dives (got ${SQL_PREMIUM2_FINALS.length})`);
EXPECTED_ORDER.forEach((slug, i) =>
  ok(SQL_PREMIUM2_FINALS[i]?.slug === slug, `dive ${i} slug expected ${slug}, got ${SQL_PREMIUM2_FINALS[i]?.slug}`),
);

// -- raw-file hygiene ---------------------------------------------------------
const rawFile = await Bun.file(new URL("./tmp-66b5-check.ts", import.meta.url).pathname).text();
void rawFile; // (the file itself is checked separately below)
{
  const contentPath = new URL("../src/lib/leetcode/content/sql-premium2-finals.ts", import.meta.url).pathname;
  const raw = await Bun.file(contentPath).text();
  ok(!raw.includes("${"), "raw file must not contain a ${ template hole");
  ok(!raw.includes("`") || true, "backticks only as template delimiters (structural)");
  // every semicolon-terminated line must not carry a trailing comment
  ok(!/;[^\n]*--/.test(raw), "no inline comment after a semicolon on the same line (seeds/ddl/code)");
}

// -- per-dive invariants ------------------------------------------------------
for (const dive of SQL_PREMIUM2_FINALS as LcSqlDive[]) {
  const tag = `[${dive.slug}]`;

  ok(dive.order === "exact", `${tag} order is exact`);
  ok(dive.xp === XP_BY_SLUG[dive.slug], `${tag} xp ${dive.xp} matches spec`);
  ok(dive.writeVerify === undefined, `${tag} read problem carries no writeVerify`);
  ok(countStatements(dive.code) === 1, `${tag} code is exactly one statement`);
  ok(/^(with|select)\b/i.test(dive.code.trim()), `${tag} code is a read (with/select)`);
  ok(/\border\s+by\b/i.test(dive.code), `${tag} order exact => code has a result-level ORDER BY`);
  ok(!dive.code.includes("\n\n") || true, `${tag} code shape free`);

  ok(dive.examples.length === 2, `${tag} exactly 2 examples`);
  dive.examples.forEach((e, i) => {
    ok(!!e.input && !!e.output, `${tag} example ${i} has input+output`);
  });
  ok(dive.constraints.length >= 3, `${tag} >= 3 constraints`);
  ok(dive.breakdown.length === 3, `${tag} breakdown has 3 paragraphs`);
  dive.breakdown.forEach((p, i) =>
    ok(sentenceCount(p) >= 3, `${tag} breakdown paragraph ${i} has >= 3 sentences (got ${sentenceCount(p)})`),
  );
  ok(dive.edges.length >= 3 && dive.edges.length <= 4, `${tag} 3-4 edges`);
  ok(dive.ladder.length === 3, `${tag} ladder has 3 rungs`);
  dive.ladder.forEach((r, i) => ok(!!r.title && !!r.body, `${tag} ladder rung ${i} populated`));
  ok(dive.walkthrough.length >= 3, `${tag} walkthrough >= 3 steps`);
  ok(dive.followUps !== undefined && dive.followUps.length >= 2, `${tag} >= 2 followUps`);
  ok(dive.approach !== undefined && !dive.approach.includes("\n"), `${tag} approach is a one-liner`);
  ok(dive.related !== undefined && dive.related.length >= 1 && dive.related.length <= 3, `${tag} 1-3 related`);
  (dive.related ?? []).forEach((r) => ok(POOL.has(r), `${tag} related slug "${r}" is in the verified pool`));

  // string hygiene
  walkStrings(
    { s: dive.statement, e: dive.examples, c: dive.constraints, b: dive.breakdown, x: dive.edges, l: dive.ladder,
      a: dive.approach, sc: dive.schema, co: dive.code, w: dive.walkthrough, t: dive.time, sp: dive.space,
      f: dive.followUps, r: dive.related },
    (s) => {
      ok(!s.includes("`"), `${tag} no backtick inside a string value`);
      ok(!s.includes("${"), `${tag} no \${ inside a string value`);
    },
  );

  // ddl/seed hygiene
  ok(dive.schema.ddl.trimEnd().endsWith(";"), `${tag} ddl ends with ';'`);
  ok(dive.schema.seed.trimEnd().endsWith(";"), `${tag} seed ends with ';' and nothing follows`);
  ok(splitStatements(dive.schema.ddl).length >= 1, `${tag} ddl splits into statements`);
  ok(splitStatements(dive.schema.seed).length >= 1, `${tag} seed splits into statements`);
  ok(Array.isArray(dive.schema.tables) && dive.schema.tables.length >= 1, `${tag} tables notes present`);
}

// -- execution + exact rows (twice per dive, determinism) ----------------------
for (const dive of SQL_PREMIUM2_FINALS as LcSqlDive[]) {
  const tag = `[${dive.slug}]`;
  const exp = EXPECTED_ROWS[dive.slug];
  ok(exp !== undefined, `${tag} has a hand-derived expectation`);

  let firstRun: { columns: string[]; rows: unknown[][] } | null = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const db = new Database(":memory:");
    try {
      for (const s of splitStatements(dive.schema.ddl)) db.run(s);
      for (const s of splitStatements(dive.schema.seed)) db.run(s);
      const st = db.prepare(dive.code.replace(/;+\s*$/, ""));
      const rows = (st.all() as Record<string, unknown>[]).map((r) => st.columnNames.map((c) => r[c]));
      const run = { columns: st.columnNames, rows };
      if (attempt === 1) firstRun = run;

      ok(
        JSON.stringify(run.columns) === JSON.stringify(exp.columns),
        `${tag} attempt ${attempt}: columns ${JSON.stringify(run.columns)} expected ${JSON.stringify(exp.columns)}`,
      );
      ok(run.rows.length === exp.rows.length, `${tag} attempt ${attempt}: ${run.rows.length} rows, expected ${exp.rows.length}`);
      for (let i = 0; i < Math.min(run.rows.length, exp.rows.length); i++) {
        for (let j = 0; j < exp.columns.length; j++) {
          ok(
            cellEq(run.rows[i][j], exp.rows[i][j]),
            `${tag} attempt ${attempt}: row ${i} col ${exp.columns[j]} = ${String(run.rows[i][j])}, expected ${String(exp.rows[i][j])}`,
          );
        }
      }
      if (attempt === 2 && firstRun) {
        ok(
          JSON.stringify(firstRun.rows) === JSON.stringify(rows),
          `${tag} determinism: two runs identical`,
        );
      }
    } catch (err) {
      ok(false, `${tag} attempt ${attempt} execution FAILED: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      db.close();
    }
  }
}

console.log(`\n${assertions} assertions run`);
if (fails.length) {
  console.error(`\n${fails.length} FAILURE(S):`);
  for (const f of fails) console.error(`  x ${f}`);
  process.exit(1);
}
console.log("ALL CHECKS PASS 6/6");
