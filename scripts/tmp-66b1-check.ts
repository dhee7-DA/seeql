/**
 * Task 66-b1 self-check — sql-premium2-games.ts (SeeQL premium batch 6, file 1 of 6).
 *
 * Mirrors scripts/lc-sql-verify.ts execution semantics exactly:
 *   - bun:sqlite in-memory database,
 *   - the REAL splitStatements/countStatements from src/lib/sql-statements,
 *   - floats normalised to 4dp before comparison.
 *
 * Per dive it asserts:
 *   structural : code is exactly ONE statement; order:"exact" carries a
 *                result-level ORDER BY (comments + OVER(...) spans stripped
 *                so window ORDER BYs cannot fake it); no writeVerify on a
 *                read; no backticks / template holes in ddl, seed or code;
 *                ddl and seed end with ';' and nothing after it; xp matches
 *                the spec'd difficulty; related slugs all exist in the wired
 *                registries.
 *   engine     : ddl -> seed -> solution executed TWICE (determinism), and
 *                columns + FULL row arrays match the hand-derived expected
 *                contract by value AND order.
 *
 * Run: bun scripts/tmp-66b1-check.ts
 * (Intentionally LEFT IN PLACE as the batch's verification artifact.)
 */

import { Database } from "bun:sqlite";
import { SQL_PREMIUM2_GAMES } from "../src/lib/leetcode/content/sql-premium2-games";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { CellValue } from "../src/lib/sql-types";

/** Round floats to 4dp so comparisons are stable (same as lc-sql-verify). */
function norm(v: unknown): CellValue {
  const c = v as CellValue;
  if (typeof c === "number" && !Number.isInteger(c)) return Math.round(c * 10000) / 10000;
  return c;
}

/** Strip -- comments and balanced OVER(...) spans, so a window ORDER BY
 *  cannot satisfy the result-level ORDER BY check. */
function stripForOrderByCheck(sql: string): string {
  const noComments = sql.replace(/--[^\n]*/g, "");
  let out = "", depth = 0, i = 0;
  while (i < noComments.length) {
    const m = /^over\s*\(/i.exec(noComments.slice(i));
    if (m) { depth = 1; i += m[0].length; continue; }
    const ch = noComments[i];
    if (depth > 0) {
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      i++;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

/** Hand-derived output contracts (columns + rows, in graded order). */
const EXPECTED: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "game-play-analysis-ii": {
    columns: ["player_id", "device_id", "first_login"],
    rows: [
      [1001, 2, "2024-03-01"],
      [1002, 1, "2024-03-02"],
      [1003, 2, "2024-03-04"],
    ],
  },
  "game-play-analysis-iii": {
    columns: ["player_id", "event_date", "games_played_so_far"],
    rows: [
      [2001, "2024-03-01", 5],
      [2001, "2024-03-04", 7],
      [2001, "2024-03-09", 11],
      [2002, "2024-03-02", 3],
      [2002, "2024-03-03", 9],
      [2003, "2024-03-05", 7],
    ],
  },
  "winning-candidate": {
    columns: ["name"],
    rows: [["Ada"]],
  },
  "find-cumulative-salary-of-an-employee": {
    columns: ["id", "month", "salary"],
    rows: [
      [1, 1, 20000],
      [1, 2, 50000],
      [1, 3, 90000],
      [2, 1, 35000],
      [2, 2, 73000],
    ],
  },
  "count-student-number-in-departments": {
    columns: ["dept_name", "student_number"],
    rows: [
      ["Engineering", 3],
      ["Science", 2],
      ["Arts", 0],
    ],
  },
};

const XP_BY_SLUG: Record<string, number> = {
  "game-play-analysis-ii": 10, // Easy
  "game-play-analysis-iii": 20, // Medium
  "winning-candidate": 20, // Medium
  "find-cumulative-salary-of-an-employee": 35, // Hard
  "count-student-number-in-departments": 20, // Medium
};

/** Related slugs — every one must exist in a wired registry file. */
const RELATED_SLUGS = new Set<string>(
  SQL_PREMIUM2_GAMES.flatMap((d) => d.related ?? []),
);

let failures = 0;
const failsFor = (slug: string, msg: string) => {
  failures++;
  console.log(`   FAIL ${slug}: ${msg}`);
};

for (const dive of SQL_PREMIUM2_GAMES) {
  const tag = `[${dive.slug}]`;
  let ok = true;
  const fail = (msg: string) => {
    ok = false;
    failsFor(dive.slug, msg);
  };

  // -- structural ----------------------------------------------------------
  if (countStatements(dive.code) !== 1)
    fail(`code must be exactly one statement (got ${countStatements(dive.code)})`);
  if (dive.order !== "exact") fail(`order must be "exact" (got "${dive.order}")`);
  if (dive.order === "exact" && !/\border\s+by\b/i.test(stripForOrderByCheck(dive.code)))
    fail(`order:"exact" needs a result-level ORDER BY`);
  if (dive.writeVerify) fail(`read solution must not carry writeVerify`);
  if (dive.xp !== XP_BY_SLUG[dive.slug])
    fail(`xp ${dive.xp} != spec ${XP_BY_SLUG[dive.slug]}`);
  for (const [field, s] of [
    ["ddl", dive.schema.ddl],
    ["seed", dive.schema.seed],
    ["code", dive.code],
  ] as const) {
    if (s.includes("`") || s.includes("${")) fail(`${field} contains backtick or template hole`);
    if (!s.trimEnd().endsWith(";")) fail(`${field} must end with ';'`);
    if (/[;\s]+\S/.test(s.trimEnd().slice(s.trimEnd().lastIndexOf(";") + 1)))
      fail(`${field} has content after the final semicolon`);
  }
  if (dive.examples.length !== 2) fail(`needs exactly 2 examples`);
  if (dive.constraints.length < 3) fail(`needs >= 3 constraints`);
  if (dive.breakdown.length !== 3) fail(`needs exactly 3 breakdown paragraphs`);
  if (dive.edges.length < 3) fail(`needs >= 3 edges`);
  if (dive.ladder.length !== 3) fail(`needs exactly 3 ladder rungs`);
  if (dive.walkthrough.length < 3) fail(`needs >= 3 walkthrough steps`);
  if ((dive.followUps?.length ?? 0) < 2) fail(`needs >= 2 followUps`);
  if ((dive.related?.length ?? 0) < 3) fail(`needs >= 3 related slugs`);
  if (dive.approach.includes("\n")) fail(`approach must be one line`);

  // -- engine --------------------------------------------------------------
  try {
    const db = new Database(":memory:");
    for (const s of splitStatements(dive.schema.ddl)) db.run(s);
    for (const s of splitStatements(dive.schema.seed)) db.run(s);

    const cleanCode = dive.code.replace(/;+\s*$/, "");
    const exp = EXPECTED[dive.slug];
    if (!exp) fail(`no expected contract registered`);

    let columns: string[] = [], rows: CellValue[][] = [];
    for (let run = 1; run <= 2; run++) {
      const st = db.prepare(cleanCode);
      const got = st.all() as Record<string, unknown>[];
      const runRows = got.map((r) => st.columnNames.map((c) => norm(r[c])));
      if (run === 2 && JSON.stringify(runRows) !== JSON.stringify(rows))
        fail(`non-deterministic output between runs`);
      columns = st.columnNames;
      rows = runRows;
    }
    db.close();

    if (JSON.stringify(columns) !== JSON.stringify(exp.columns))
      fail(`columns ${JSON.stringify(columns)} != expected ${JSON.stringify(exp.columns)}`);
    if (JSON.stringify(rows) !== JSON.stringify(exp.rows)) {
      fail(
        `rows mismatch:\n     got      ${JSON.stringify(rows)}\n     expected ${JSON.stringify(exp.rows)}`,
      );
    }
  } catch (err) {
    fail(`engine error: ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log(ok ? `PASS ${tag} ${dive.slug} (${EXPECTED[dive.slug].rows.length} rows)` : `     ${tag} ${dive.slug} — see failures above`);
  if (ok) process.stdout.write("");
  if (!ok) failures = failures; // counted in fail()
}

// -- related slug existence (against wired registries) ------------------------
import { readdirSync, readFileSync } from "node:fs";
const regDir = new URL("../src/lib/leetcode", import.meta.url).pathname;
const registryText = readdirSync(regDir)
  .filter((f) => f.startsWith("registry") && f.endsWith(".ts"))
  .map((f) => readFileSync(`${regDir}/${f}`, "utf8"))
  .join("\n");
for (const slug of RELATED_SLUGS) {
  if (!registryText.includes(`"${slug}"`)) failsFor(slug, `related slug not found in any wired registry`);
}
console.log(`related slugs checked: ${RELATED_SLUGS.size} — ${[...RELATED_SLUGS].join(", ")}`);

console.log(
  failures === 0
    ? `\nALL CHECKS PASS ${SQL_PREMIUM2_GAMES.length}/${SQL_PREMIUM2_GAMES.length}`
    : `\n${failures} FAILURE(S)`,
);
process.exit(failures === 0 ? 0 : 1);
