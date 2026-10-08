/**
 * Task 66-b6 self-check — sql-premium2-users.ts
 * bun scripts/tmp-66b6-check.ts
 *
 * Structural invariants (mirrors batch-65 conventions) + engine execution
 * against bun:sqlite with HARD-asserted columns and rows (value AND order),
 * run twice per dive for determinism.
 */
import { Database } from "bun:sqlite";
import { readFileSync } from "node:fs";
import { SQL_PREMIUM2_USERS } from "../src/lib/leetcode/content/sql-premium2-users";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { CellValue } from "../src/lib/sql-types";

function norm(v: unknown): CellValue {
  const c = v as CellValue;
  if (typeof c === "number" && !Number.isInteger(c)) return Math.round(c * 10000) / 10000;
  return c;
}

let checks = 0;
const fails: string[] = [];
function ok(cond: boolean, msg: string) {
  checks++;
  if (!cond) fails.push(msg);
}

// -- expected hand-derived contracts ----------------------------------------
const CONTRACTS: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "ad-free-sessions": {
    columns: ["customer_id"],
    rows: [[2], [4]],
  },
  "find-customers-with-positive-revenue-this-year": {
    columns: ["customer_id"],
    rows: [[11], [13]],
  },
  "convert-date-format": {
    columns: ["day"],
    rows: [
      ["1st of March, 2024"],
      ["11th of March, 2024"],
      ["2nd of April, 2024"],
      ["21st of April, 2024"],
      ["13th of May, 2024"],
      ["23rd of May, 2024"],
    ],
  },
  "orders-with-maximum-quantity-above-average": {
    columns: ["order_number"],
    rows: [[7], [9]],
  },
  "group-employees-of-the-same-salary": {
    columns: ["employee_id", "name", "salary", "team_id"],
    rows: [
      [1, "Ann", 3000, 1],
      [2, "Ben", 3000, 1],
      [4, "Dee", 2000, 2],
      [5, "Eli", 2000, 2],
      [6, "Fay", 2000, 2],
    ],
  },
  "leetcodify-friends-recommendations": {
    columns: ["user1_id", "user2_id"],
    rows: [[1, 2]],
  },
};

const EXPECTED_ORDER = [
  "ad-free-sessions",
  "find-customers-with-positive-revenue-this-year",
  "convert-date-format",
  "orders-with-maximum-quantity-above-average",
  "group-employees-of-the-same-salary",
  "leetcodify-friends-recommendations",
];
const EXPECTED_XP: Record<string, number> = {
  "ad-free-sessions": 10,
  "find-customers-with-positive-revenue-this-year": 10,
  "convert-date-format": 10,
  "orders-with-maximum-quantity-above-average": 20,
  "group-employees-of-the-same-salary": 20,
  "leetcodify-friends-recommendations": 35,
};

// -- registry slug universe ---------------------------------------------------
import { readdirSync } from "node:fs";
const dir = new URL("../src/lib/leetcode/", import.meta.url).pathname;
const registryText = readdirSync(dir)
  .filter((f) => f.startsWith("registry") && f.endsWith(".ts"))
  .map((f) => readFileSync(dir + f, "utf8"))
  .join("\n");

// -- helpers ------------------------------------------------------------------
const STRIP_OVER = (s: string) => s.replace(/OVER\s*\([^()]*\)/gi, "()");
function sentences(s: string): number {
  const parts = s.split(/(?<=[.!?])\s+(?=[A-Z"'])/).filter((p) => p.trim().length > 0);
  return parts.length;
}
function walkStrings(v: unknown, path: string, cb: (s: string, p: string) => void) {
  if (typeof v === "string") cb(v, path);
  else if (Array.isArray(v)) v.forEach((x, i) => walkStrings(x, `${path}[${i}]`, cb));
  else if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) walkStrings(x, `${path}.${k}`, cb);
}
function endsClean(s: string, label: string, tag: string) {
  const trimmed = s.trimEnd();
  ok(trimmed.endsWith(";"), `${tag} ${label} does not end with ';'`);
  // nothing but whitespace/comments may follow the final semicolon
  const after = trimmed.slice(trimmed.lastIndexOf(";") + 1);
  ok(after.replace(/--[^\n]*/g, "").trim() === "", `${tag} ${label} has content after the final ';'`);
}

// -- structural checks ----------------------------------------------------------
ok(SQL_PREMIUM2_USERS.length === 6, `expected 6 dives, got ${SQL_PREMIUM2_USERS.length}`);
ok(
  JSON.stringify(SQL_PREMIUM2_USERS.map((d) => d.slug)) === JSON.stringify(EXPECTED_ORDER),
  "dive order mismatch",
);

for (const dive of SQL_PREMIUM2_USERS) {
  const tag = `[${dive.slug}]`;

  ok(dive.order === "exact", `${tag} order must be "exact"`);
  ok(dive.xp === EXPECTED_XP[dive.slug], `${tag} xp ${dive.xp} != expected ${EXPECTED_XP[dive.slug]}`);
  ok(!dive.writeVerify, `${tag} read problem must not carry writeVerify`);

  // statement self-containment: names the output columns and the ordering
  ok(dive.statement.length > 200, `${tag} statement too short`);
  ok(/ordered/i.test(dive.statement), `${tag} statement does not state the ordering`);

  // examples: 2, with all three fields
  ok(dive.examples.length === 2, `${tag} needs exactly 2 examples`);
  for (const ex of dive.examples) {
    ok(ex.input.length > 0 && ex.output.length > 0, `${tag} example missing input/output`);
    ok(!!ex.explanation && ex.explanation.length > 0, `${tag} example missing explanation`);
  }

  // constraints: exactly 3
  ok(dive.constraints.length === 3, `${tag} needs exactly 3 constraints (got ${dive.constraints.length})`);

  // breakdown: 3 paragraphs x 3+ sentences
  ok(dive.breakdown.length === 3, `${tag} breakdown must be 3 paragraphs`);
  dive.breakdown.forEach((p, i) =>
    ok(sentences(p) >= 3, `${tag} breakdown paragraph ${i + 1} has ${sentences(p)} sentences (need 3+)`),
  );

  // edges: 3-4
  ok(dive.edges.length >= 3 && dive.edges.length <= 4, `${tag} edges must be 3-4 (got ${dive.edges.length})`);

  // ladder: 3 rungs
  ok(dive.ladder.length === 3, `${tag} ladder must be 3 rungs`);
  dive.ladder.forEach((r, i) => ok(r.title.length > 0 && r.body.length > 0, `${tag} rung ${i + 1} incomplete`));

  // approach: one line
  ok(!dive.approach.includes("\n"), `${tag} approach must be a single line`);

  // walkthrough: >= 3 steps
  ok(dive.walkthrough.length >= 3, `${tag} walkthrough needs >= 3 steps (got ${dive.walkthrough.length})`);

  // followUps >= 2
  ok((dive.followUps ?? []).length >= 2, `${tag} followUps need >= 2 entries`);

  // related >= 3, all present in registry files, unique, not self
  const rel = dive.related ?? [];
  ok(rel.length >= 3, `${tag} related needs >= 3 slugs (got ${rel.length})`);
  ok(new Set(rel).size === rel.length, `${tag} related has duplicates`);
  for (const s of rel) {
    ok(s !== dive.slug, `${tag} related contains itself`);
    ok(registryText.includes(`"${s}"`), `${tag} related slug not found in registry*.ts: ${s}`);
  }

  // string hygiene: no backticks, no ${ holes
  walkStrings(dive, tag, (s, p) => {
    ok(!s.includes("`"), `${p} contains a backtick`);
    ok(!s.includes("${"), `${p} contains a \${ hole`);
  });

  // schema shape
  ok(!!dive.schema.tables && dive.schema.tables.length >= 1, `${tag} schema.tables missing`);
  endsClean(dive.schema.ddl, "ddl", tag);
  endsClean(dive.schema.seed, "seed", tag);
  for (const st of splitStatements(dive.schema.ddl.replace(/--[^\n]*/g, "").trim()))
    ok(/^CREATE TABLE /i.test(st), `${tag} ddl contains a non-CREATE TABLE statement`);
  for (const st of splitStatements(dive.schema.seed.replace(/--[^\n]*/g, "").trim()))
    ok(/^INSERT INTO /i.test(st), `${tag} seed contains a non-INSERT statement`);

  // code: exactly one statement, result-level ORDER BY (comments + OVER spans stripped)
  ok(countStatements(dive.code) === 1, `${tag} code must be exactly one statement (got ${countStatements(dive.code)})`);
  const codeStripped = STRIP_OVER(dive.code.replace(/--[^\n]*/g, ""));
  ok(/\border\s+by\b/i.test(codeStripped), `${tag} order:"exact" but no result-level ORDER BY`);

  // engine: ddl -> seed -> code, twice, exact columns + rows
  const contract = CONTRACTS[dive.slug];
  ok(!!contract, `${tag} no hand-derived contract registered`);
  for (let run = 1; run <= 2; run++) {
    const db = new Database(":memory:");
    try {
      for (const s of splitStatements(dive.schema.ddl)) db.run(s);
      for (const s of splitStatements(dive.schema.seed)) db.run(s);
      const st = db.prepare(dive.code.replace(/;+\s*$/, ""));
      const rows = st.all() as Record<string, unknown>[];
      const cols = st.columnNames;
      ok(
        JSON.stringify(cols) === JSON.stringify(contract.columns),
        `${tag} run ${run}: columns ${JSON.stringify(cols)} != ${JSON.stringify(contract.columns)}`,
      );
      const got = rows.map((r) => contract.columns.map((c) => norm(r[c])));
      ok(
        JSON.stringify(got) === JSON.stringify(contract.rows),
        `${tag} run ${run}: rows ${JSON.stringify(got)} != ${JSON.stringify(contract.rows)}`,
      );
    } catch (err) {
      fails.push(`${tag} run ${run} FAILED: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      db.close();
    }
  }
}

console.log(`${checks} assertions over ${SQL_PREMIUM2_USERS.length} dives`);
if (fails.length) {
  console.error(`${fails.length} FAILURE(S):`);
  for (const f of fails) console.error(`  x ${f}`);
  process.exit(1);
}
console.log("ALL CHECKS PASS 6/6");
