/**
 * Temp self-check for Task 66-b2 — sql-premium2-rankings.ts (batch 6, file 2 of 6).
 * Mirrors the batch-5 author invariants + engine-verifies every dive's
 * ddl -> seed -> solution against a hand-derived row contract, twice.
 * Run: bun scripts/tmp-66b2-check.ts
 */
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { SQL_PREMIUM2_RANKINGS } from "../src/lib/leetcode/content/sql-premium2-rankings";
import { LC_ALL } from "../src/lib/leetcode/registry";
import type { CellValue } from "../src/lib/sql-types";

let checks = 0;
const fails: string[] = [];
function ok(cond: boolean, msg: string) {
  checks++;
  if (!cond) fails.push(msg);
}

/** Round floats to 4dp (same normalization as scripts/lc-sql-verify.ts). */
function norm(v: unknown): CellValue {
  const c = v as CellValue;
  if (typeof c === "number" && !Number.isInteger(c)) return Math.round(c * 10000) / 10000;
  return c;
}

const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-Z0-9"'(])/;

/** Strip -- and /* *\/ comments plus balanced OVER(...) spans, then look for a
 *  result-level ORDER BY (window ORDER BYs must not fake it). */
function hasResultLevelOrderBy(code: string): boolean {
  let s = code.replace(/--[^\n]*/g, " ");
  s = s.replace(/\/\*[\s\S]*?\*\//g, " ");
  let out = "";
  let i = 0;
  while (i < s.length) {
    const m = /^over\s*\(/i.exec(s.slice(i));
    if (m) {
      let depth = 0;
      let j = i + m[0].length - 1; // at the '('
      for (; j < s.length; j++) {
        if (s[j] === "(") depth++;
        else if (s[j] === ")") { depth--; if (depth === 0) { j++; break; } }
      }
      i = j;
      continue;
    }
    out += s[i++];
  }
  return /\border\s+by\b/i.test(out);
}

/** Recursively assert no backticks and no ${ inside any string value. */
function walkStrings(v: unknown, path: string) {
  if (typeof v === "string") {
    ok(!v.includes("`"), `${path}: string value contains a backtick`);
    ok(!v.includes("${"), `${path}: string value contains \${`);
  } else if (Array.isArray(v)) {
    v.forEach((x, i) => walkStrings(x, `${path}[${i}]`));
  } else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) walkStrings(x, `${path}.${k}`);
  }
}

// -- spec contracts -----------------------------------------------------------
const SPEC: Array<{ slug: string; xp: number; columns: string[]; rows: CellValue[][] }> = [
  { slug: "shortest-distance-in-a-plane", xp: 20, columns: ["shortest"], rows: [[1.41]] },
  { slug: "shortest-distance-in-a-line", xp: 10, columns: ["shortest"], rows: [[2]] },
  { slug: "second-degree-follower", xp: 20, columns: ["follower", "num"], rows: [[1, 2], [2, 2], [3, 1]] },
  {
    slug: "new-users-daily-count", xp: 20, columns: ["login_date", "new_users"],
    rows: [["2024-05-31", 1], ["2024-06-01", 2], ["2024-06-02", 1], ["2024-06-03", 2]],
  },
  { slug: "tournament-winners", xp: 35, columns: ["group_id", "player_id"], rows: [[1, 11], [2, 22]] },
  {
    slug: "find-the-start-and-end-number-of-continuous-ranges", xp: 20,
    columns: ["start_id", "end_id", "run_length"], rows: [[1, 3, 3], [6, 6, 1], [8, 12, 5]],
  },
];

const registrySlugs = new Set(LC_ALL.map((p) => p.slug));

// -- file-level ---------------------------------------------------------------
ok(SQL_PREMIUM2_RANKINGS.length === 6, `expected 6 dives, got ${SQL_PREMIUM2_RANKINGS.length}`);
{
  const contentFile = await Bun.file(
    new URL("../src/lib/leetcode/content/sql-premium2-rankings.ts", import.meta.url).pathname,
  ).text();
  ok(!contentFile.includes("${"), "content file contains a ${ interpolation");
}

// -- per dive -----------------------------------------------------------------
for (let d = 0; d < SQL_PREMIUM2_RANKINGS.length; d++) {
  const dive = SQL_PREMIUM2_RANKINGS[d];
  const spec = SPEC[d];
  const tag = `[${dive.slug}]`;

  ok(dive.slug === spec.slug, `dive ${d}: slug ${dive.slug} != ${spec.slug}`);
  ok(dive.xp === spec.xp, `${tag} xp ${dive.xp} != ${spec.xp}`);
  ok(dive.order === "exact", `${tag} order must be "exact"`);
  walkStrings(dive, tag);

  // one statement, read-only, no writeVerify
  ok(countStatements(dive.code) === 1, `${tag} solution must be exactly 1 statement (got ${countStatements(dive.code)})`);
  ok(!/^(delete|update|insert)\b/i.test(dive.code.trim()), `${tag} solution must be a read`);
  ok(dive.writeVerify === undefined, `${tag} read dive must not carry writeVerify`);
  ok(hasResultLevelOrderBy(dive.code), `${tag} order:"exact" needs a result-level ORDER BY`);

  // teaching structure
  ok(dive.examples.length === 2, `${tag} needs exactly 2 examples`);
  dive.examples.forEach((e, i) => {
    ok(!!e.input && !!e.output, `${tag} example ${i} missing input/output`);
  });
  ok(dive.constraints.length >= 3, `${tag} needs >= 3 constraints`);
  ok(dive.breakdown.length === 3, `${tag} breakdown must be 3 paragraphs`);
  dive.breakdown.forEach((p, i) => {
    const sentences = p.split(SENTENCE_SPLIT).filter((s) => s.trim().length > 0);
    ok(sentences.length >= 3, `${tag} breakdown para ${i} has ${sentences.length} sentences (need >= 3)`);
  });
  ok(dive.edges.length >= 3 && dive.edges.length <= 4, `${tag} edges must be 3-4 (got ${dive.edges.length})`);
  ok(dive.ladder.length === 3, `${tag} ladder must be 3 rungs`);
  dive.ladder.forEach((r, i) => ok(!!r.title && r.body.length > 20, `${tag} ladder rung ${i} too thin`));
  ok(dive.walkthrough.length >= 3, `${tag} walkthrough needs >= 3 steps`);
  ok(!!dive.approach && !dive.approach.includes("\n"), `${tag} approach must be one line`);
  ok(!!dive.time && !!dive.space, `${tag} time/space required`);
  ok((dive.followUps?.length ?? 0) >= 2, `${tag} needs >= 2 followUps`);
  const rel = dive.related ?? [];
  ok(rel.length >= 1 && rel.length <= 3, `${tag} related must be 1-3 (got ${rel.length})`);
  for (const r of rel) ok(registrySlugs.has(r), `${tag} related slug not in registry: ${r}`);
  ok(!!dive.schema.tables && dive.schema.tables.length >= 1, `${tag} schema.tables required`);

  // ddl/seed hygiene: only CREATEs / only INSERTs, semicolon-terminated, nothing after
  const ddlStmts = splitStatements(dive.schema.ddl);
  ok(ddlStmts.length >= 1, `${tag} ddl empty`);
  for (const s of ddlStmts) ok(/^create table\b/i.test(s), `${tag} ddl holds a non-CREATE statement: ${s.slice(0, 40)}`);
  const seedStmts = splitStatements(dive.schema.seed);
  ok(seedStmts.length >= 1, `${tag} seed empty`);
  for (const s of seedStmts) ok(/^insert into\b/i.test(s), `${tag} seed holds a non-INSERT statement: ${s.slice(0, 40)}`);
  ok(/;\s*$/.test(dive.schema.ddl.trimEnd()), `${tag} ddl does not end with ';'`);
  ok(/;\s*$/.test(dive.schema.seed.trimEnd()), `${tag} seed does not end with ';'`);
  // nothing but whitespace between the final ';' and EOF (no trailing comments)
  const ddlTail = dive.schema.ddl.slice(dive.schema.ddl.lastIndexOf(";") + 1);
  const seedTail = dive.schema.seed.slice(dive.schema.seed.lastIndexOf(";") + 1);
  ok(ddlTail.trim() === "", `${tag} ddl has text after the final semicolon`);
  ok(seedTail.trim() === "", `${tag} seed has text after the final semicolon`);

  // engine: build, seed, solve — TWICE, determinism + exact contract
  for (let run = 0; run < 2; run++) {
    const db = new Database(":memory:");
    try {
      for (const s of ddlStmts) db.run(s);
      for (const s of seedStmts) db.run(s);
      const st = db.prepare(dive.code.replace(/;+\s*$/, ""));
      const rows = st.all() as Record<string, unknown>[];
      const columns = st.columnNames;
      const got = rows.map((r) => columns.map((c) => norm(r[c])));
      ok(JSON.stringify(columns) === JSON.stringify(spec.columns),
        `${tag} run${run} columns ${JSON.stringify(columns)} != ${JSON.stringify(spec.columns)}`);
      ok(JSON.stringify(got) === JSON.stringify(spec.rows.map((r) => r.map(norm))),
        `${tag} run${run} rows ${JSON.stringify(got)} != ${JSON.stringify(spec.rows)}`);
    } catch (err) {
      ok(false, `${tag} run${run} FAILED: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      db.close();
    }
  }
}

console.log(`${checks} assertions run`);
if (fails.length) {
  console.error(`${fails.length} FAILURE(S):`);
  for (const f of fails) console.error("  x " + f);
  process.exit(1);
}
console.log("ALL CHECKS PASS 6/6");
