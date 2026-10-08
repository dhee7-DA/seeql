/**
 * Task 70-b3 self-check — sql-free-parsing.ts (batch 10, file 3 of 5)
 * Structure invariants + bun:sqlite execution against hand-derived expected rows.
 * Run: bun scripts/tmp-70b3-check.ts
 */
import { Database } from "bun:sqlite";
import { SQL_FREE_PARSING } from "../src/lib/leetcode/content/sql-free-parsing";
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
/** Strip -- comments and balanced OVER(...) spans so window ORDER BYs cannot
 *  fake the result-level ORDER BY requirement. */
function stripCommentsAndOver(code: string): string {
  const noComments = code.replace(/--[^\n]*/g, " ");
  const re = /\bover\s*\(/gi;
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(noComments)) !== null) {
    out += noComments.slice(last, m.index) + " ";
    let depth = 1;
    let j = m.index + m[0].length;
    while (j < noComments.length && depth > 0) {
      const ch = noComments[j];
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      j++;
    }
    last = j;
    re.lastIndex = j;
  }
  out += noComments.slice(last);
  return out;
}

// -- wired related-slug pool, straight from the registry (LC_ALL) -------------
const WIRED = new Set(LC_ALL.map((p) => p.slug));
ok(WIRED.size > 300, `LC_ALL loaded from the registry (${WIRED.size} rows)`);

const EXPECTED_ORDER = [
  "first-letter-capitalization-ii",
  "find-valid-emails",
  "find-invalid-ip-addresses",
  "find-products-with-valid-serial-numbers",
  "dna-pattern-recognition",
];
const XP_BY_SLUG: Record<string, number> = {
  "first-letter-capitalization-ii": 35,
  "find-valid-emails": 10,
  "find-invalid-ip-addresses": 35,
  "find-products-with-valid-serial-numbers": 10,
  "dna-pattern-recognition": 20,
};
const EXPECTED_ROWS: Record<string, { columns: string[]; rows: unknown[][] }> = {
  "first-letter-capitalization-ii": {
    columns: ["entry_id", "transformed"],
    rows: [
      [1, "The Lord of the Rings"],
      [2, "And"],
      [3, "Salt Water Air at"],
    ],
  },
  "find-valid-emails": {
    columns: ["email"],
    rows: [["ada@mail.com"], ["esme@a.b.com"]],
  },
  "find-invalid-ip-addresses": {
    columns: ["ip"],
    rows: [
      ["1.02.3.4"],
      ["1.2.3"],
      ["1.2.3.4.5"],
      ["256.1.1.1"],
      ["abc.def.1.2"],
    ],
  },
  "find-products-with-valid-serial-numbers": {
    columns: ["item_id"],
    rows: [[1]],
  },
  "dna-pattern-recognition": {
    columns: ["sample_id", "match_count"],
    rows: [
      [1, 2],
      [2, 2],
      [3, 2],
    ],
  },
};

// -- batch-level shape ---------------------------------------------------------
ok(Array.isArray(SQL_FREE_PARSING), "export is an array");
ok(SQL_FREE_PARSING.length === 5, `exactly 5 dives (got ${SQL_FREE_PARSING.length})`);
EXPECTED_ORDER.forEach((slug, i) =>
  ok(SQL_FREE_PARSING[i]?.slug === slug, `dive ${i} slug expected ${slug}, got ${SQL_FREE_PARSING[i]?.slug}`),
);

// -- raw-file hygiene ----------------------------------------------------------
{
  const contentPath = new URL("../src/lib/leetcode/content/sql-free-parsing.ts", import.meta.url).pathname;
  const raw = await Bun.file(contentPath).text();
  ok(!raw.includes("${"), "raw file must not contain a ${ template hole");
  ok(!/;[^\n]*--/.test(raw), "no inline comment after a semicolon on the same line (seeds/ddl/code)");
  // prose must never name the source site
  const prose = SQL_FREE_PARSING.flatMap((d) =>
    [d.statement, d.approach, d.time, d.space, ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
      ...d.constraints, ...d.breakdown, ...d.edges, ...d.ladder.map((r) => `${r.title} ${r.body}`),
      ...d.walkthrough, ...d.followUps ?? [], ...d.related ?? [], ...d.schema.tables?.map((t) => t.note) ?? []],
  );
  prose.forEach((s) => ok(!/leetcode/i.test(s), `prose must not mention the source site: ${s.slice(0, 60)}`));
}

// -- per-dive invariants --------------------------------------------------------
for (const dive of SQL_FREE_PARSING as LcSqlDive[]) {
  const tag = `[${dive.slug}]`;

  ok(dive.order === "exact", `${tag} order is exact`);
  ok(dive.xp === XP_BY_SLUG[dive.slug], `${tag} xp ${dive.xp} matches spec`);
  ok(dive.writeVerify === undefined, `${tag} read problem carries no writeVerify`);
  ok(countStatements(dive.code) === 1, `${tag} code is exactly one statement`);
  ok(/^(with|select)\b/i.test(dive.code.trim()), `${tag} code is a read (with/select)`);
  ok(
    /\border\s+by\b/i.test(stripCommentsAndOver(dive.code)),
    `${tag} order exact => result-level ORDER BY survives stripping comments/OVER spans`,
  );
  ok(dive.statement.trim().length > 100, `${tag} statement is a real paragraph`);

  ok(dive.examples.length === 2, `${tag} exactly 2 examples`);
  dive.examples.forEach((e, i) => {
    ok(!!e.input && !!e.output && !!e.explanation, `${tag} example ${i} has input+output+explanation`);
  });
  ok(dive.constraints.length === 3, `${tag} exactly 3 constraints (got ${dive.constraints.length})`);
  ok(dive.breakdown.length === 3, `${tag} breakdown has 3 paragraphs`);
  dive.breakdown.forEach((p, i) => {
    const n = sentenceCount(p);
    ok(n >= 3 && n <= 5, `${tag} breakdown paragraph ${i} has 3-5 sentences (got ${n})`);
  });
  ok(dive.edges.length >= 3 && dive.edges.length <= 4, `${tag} 3-4 edges`);
  ok(dive.ladder.length === 3, `${tag} ladder has 3 rungs`);
  dive.ladder.forEach((r, i) => ok(!!r.title && !!r.body && r.body.length > 40, `${tag} ladder rung ${i} populated`));
  ok(dive.walkthrough.length === 3, `${tag} exactly 3 walkthrough steps`);
  ok(dive.approach !== undefined && !dive.approach.includes("\n"), `${tag} approach is a one-liner`);
  ok(dive.followUps !== undefined && dive.followUps.length === 2, `${tag} exactly 2 followUps`);
  ok(dive.related !== undefined && dive.related.length === 3, `${tag} exactly 3 related`);
  (dive.related ?? []).forEach((r) =>
    ok(WIRED.has(r), `${tag} related slug "${r}" exists in LC_ALL (wired registry)`),
  );

  // string hygiene
  walkStrings(
    { s: dive.statement, e: dive.examples, c: dive.constraints, b: dive.breakdown, x: dive.edges, l: dive.ladder,
      a: dive.approach, sc: dive.schema, co: dive.code, w: dive.walkthrough, t: dive.time, sp: dive.space,
      f: dive.followUps, r: dive.related },
    (s) => {
      ok(!s.includes("`"), `${tag} no backtick inside a string value`);
      ok(!s.includes("${"), `${tag} no \${ inside a string value`);
      ok(!/;[^\n]*--/.test(s), `${tag} no semicolon-then-comment on one line inside a string value`);
    },
  );
  // no ';' may live inside a -- comment of ddl/seed/code
  for (const [name, sql] of [["ddl", dive.schema.ddl], ["seed", dive.schema.seed], ["code", dive.code]] as const) {
    const comments = sql.match(/--[^\n]*/g) ?? [];
    comments.forEach((c) => ok(!c.includes(";"), `${tag} ${name} comment holds a ';': ${c.slice(0, 50)}`));
  }

  // ddl/seed hygiene: end with ';' and NOTHING after (not even a comment line)
  ok(/;\s*$/.test(dive.schema.ddl), `${tag} ddl ends with ';' and nothing follows`);
  ok(/;\s*$/.test(dive.schema.seed), `${tag} seed ends with ';' and nothing follows`);
  ok(dive.schema.ddl.trimEnd().endsWith(";"), `${tag} ddl ends with ';'`);
  ok(dive.schema.seed.trimEnd().endsWith(";"), `${tag} seed ends with ';'`);
  ok(splitStatements(dive.schema.ddl).length >= 1, `${tag} ddl splits into statements`);
  ok(splitStatements(dive.schema.seed).length >= 1, `${tag} seed splits into statements`);
  ok(Array.isArray(dive.schema.tables) && dive.schema.tables.length >= 1, `${tag} tables notes present`);
  dive.schema.tables?.forEach((t) => ok(!!t.note && t.note.length > 10, `${tag} table note for ${t.name} populated`));
}

// -- execution + exact rows (twice per dive — determinism) -----------------------
for (const dive of SQL_FREE_PARSING as LcSqlDive[]) {
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
      if (attempt > 1 && firstRun) {
        ok(
          JSON.stringify(firstRun.rows) === JSON.stringify(rows),
          `${tag} determinism: run ${attempt} identical to run 1`,
        );
      }
    } catch (err) {
      ok(false, `${tag} attempt ${attempt} execution FAILED: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      db.close();
    }
  }
}

// -- PASS/FAIL table --------------------------------------------------------------
console.log(`\n${assertions} assertions run\n`);
const perDive = EXPECTED_ORDER.map((slug) => {
  const diveFails = fails.filter((f) => f.startsWith(`[${slug}]`));
  return { slug, pass: diveFails.length === 0, rows: EXPECTED_ROWS[slug].rows.length };
});
for (const d of perDive) console.log(`  ${d.pass ? "PASS" : "FAIL"}  ${d.slug} (${d.rows} expected rows)`);
if (fails.length) {
  console.error(`\n${fails.length} FAILURE(S):`);
  for (const f of fails) console.error(`  x ${f}`);
  process.exit(1);
}
console.log("\nALL CHECKS PASS 5/5");
