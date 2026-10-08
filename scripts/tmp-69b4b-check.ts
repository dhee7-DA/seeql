/**
 * Task 69-b4b self-check — sql-premium5-passes.ts (batch 9, PART B, 3 dives)
 * Mirrors scripts/lc-sql-verify.ts semantics: builds each dive's schema in
 * bun:sqlite :memory:, runs the solution TWICE (determinism), and HARD-asserts
 * the exact columns + full row arrays (order-sensitive) against hand-derived
 * contracts, plus the batch's structural invariants and planted-trap probes
 * (each wrong query re-run against the seed to pin its documented failure).
 * Related slugs are verified against LC_ALL (imported from the registry).
 *
 * Run: bun scripts/tmp-69b4b-check.ts
 */
import { Database } from "bun:sqlite";
import { SQL_PREMIUM5_PASSES } from "../src/lib/leetcode/content/sql-premium5-passes";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { CellValue } from "../src/lib/sql-types";
import type { LcSqlDive } from "../src/lib/leetcode/types";

// -- hand-derived contracts (slug -> columns, rows in graded order) ---------
const CONTRACTS: Record<string, { columns: string[]; rows: CellValue[][] }> = {
  "find-circular-gift-exchange-chains": {
    columns: ["giver_id", "receiver_id", "cycle_size"],
    rows: [
      [1, 2, 3],
      [2, 3, 3],
      [3, 1, 3],
      [4, 5, 5],
      [5, 6, 5],
      [6, 7, 5],
      [7, 8, 5],
      [8, 4, 5],
    ],
  },
  "team-dominance-by-pass-success": {
    columns: ["team", "completion_pct"],
    rows: [["home", 83.33]],
  },
  "longest-team-pass-streak": {
    columns: ["team", "longest_streak"],
    rows: [
      ["away", 3],
      ["home", 5],
    ],
  },
};

const XP_BY_SLUG: Record<string, number> = {
  "find-circular-gift-exchange-chains": 35,
  "team-dominance-by-pass-success": 35,
  "longest-team-pass-streak": 35,
};

// -- planted-trap probes: wrong query -> the documented wrong result --------
const PROBES: Record<string, Array<{ label: string; sql: (code: string) => string; expect: CellValue[][] }>> = {
  "find-circular-gift-exchange-chains": [
    {
      label: "step cap tighter than the 5-ring (step < 3) truncates ring two",
      sql: (c) => c.replace("(SELECT COUNT(DISTINCT giver_id) FROM GiftExchange)", "3"),
      expect: [[1, 2, 3], [2, 3, 3], [3, 1, 3]],
    },
    {
      label: "step-0 seeding shifts every cycle_size down (3-ring reads 2, 5-ring reads 4)",
      sql: (c) => c.replace("giver_id, receiver_id, 1", "giver_id, receiver_id, 0"),
      expect: [
        [1, 2, 2],
        [2, 3, 2],
        [3, 1, 2],
        [4, 5, 4],
        [5, 6, 4],
        [6, 7, 4],
        [7, 8, 4],
        [8, 4, 4],
      ],
    },
  ],
  "team-dominance-by-pass-success": [
    {
      label: "integer division floors: home ships 83.0, not 83.33",
      sql: (c) => c.replace("* 100.0", "* 100"),
      expect: [["home", 83]],
    },
    {
      label: "whole-table denominator halves both teams (41.67 / 37.5)",
      sql: () =>
        `SELECT team, ROUND(SUM(CASE WHEN outcome = 'complete' THEN 1 ELSE 0 END) * 100.0 /
  (SELECT COUNT(*) FROM PassAction), 2) AS pct
FROM PassAction
GROUP BY team
ORDER BY team ASC`,
      expect: [
        ["away", 37.5],
        ["home", 41.67],
      ],
    },
    {
      label: "a 60-floor leaderboard leaks the runner-up (away 75.0 behind home 83.33)",
      sql: (c) => c.replace("completion_pct = (SELECT MAX(completion_pct) FROM scored)", "completion_pct > 60"),
      expect: [
        ["away", 75],
        ["home", 83.33],
      ],
    },
  ],
  "longest-team-pass-streak": [
    {
      label: "PARTITION BY team first welds away's rows 2-3 and 9-11 into a fake 5",
      sql: (c) =>
        c
          .replace("LAG(team) OVER (ORDER BY pass_id)", "LAG(team) OVER (PARTITION BY team ORDER BY pass_id)")
          .replace("LAG(outcome) OVER (ORDER BY pass_id)", "LAG(outcome) OVER (PARTITION BY team ORDER BY pass_id)"),
      expect: [
        ["away", 5],
        ["home", 5],
      ],
    },
    {
      label: "flag without the prev_outcome check welds away's failed 15 to 16-18 (reads 4)",
      sql: (c) =>
        c.replace(
          "WHEN team = prev_team AND outcome = 'complete' AND prev_outcome = 'complete' THEN 0",
          "WHEN team = prev_team AND outcome = 'complete' THEN 0",
        ),
      expect: [
        ["away", 4],
        ["home", 5],
      ],
    },
  ],
};

const REQUIRED_ORDER = Object.keys(CONTRACTS);

// -- registry pool for related-slug verification (LC_ALL per task spec) ------
const registrySlugs = new Set(LC_ALL.map((r) => r.slug));

// -- helpers -----------------------------------------------------------------
function norm(v: unknown): CellValue {
  const c = v as CellValue;
  if (typeof c === "number" && !Number.isInteger(c)) return Math.round(c * 10000) / 10000;
  return c;
}

function stripCommentsAndOver(sql: string): string {
  let s = sql.replace(/--[^\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");
  let prev: string;
  do {
    prev = s;
    s = s.replace(/over\s*\([^()]*\)/gi, " ");
  } while (s !== prev);
  return s;
}

function sentences(text: string): number {
  return text.split(/(?<=[.!?])\s+(?=[A-Z"'(])/).filter((p) => p.trim().length > 0).length;
}

function walkStrings(v: unknown, path: string, hits: string[]): void {
  if (typeof v === "string") {
    if (v.includes("`") || v.includes("${")) hits.push(`${path}`);
  } else if (Array.isArray(v)) {
    v.forEach((x, i) => walkStrings(x, `${path}[${i}]`, hits));
  } else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) walkStrings(x, `${path}.${k}`, hits);
  }
}

/** The single executable statement: split, then cut at the last top-level ';'
 *  so any absorbed trailing-comment run never reaches prepare(). */
function executable(sql: string): string {
  const s = splitStatements(sql)[0] ?? "";
  const cut = s.lastIndexOf(";");
  return cut === -1 ? s : s.slice(0, cut + 1);
}

// -- run ---------------------------------------------------------------------
const fails: string[] = [];
let checks = 0;
const ok = (cond: boolean, msg: string) => {
  checks++;
  if (!cond) fails.push(msg);
};

// deliverable shape: exactly the 3 prescribed slugs, in the prescribed order
ok(SQL_PREMIUM5_PASSES.length === 3, `expected 3 dives, got ${SQL_PREMIUM5_PASSES.length}`);
ok(
  JSON.stringify(SQL_PREMIUM5_PASSES.map((d) => d.slug)) === JSON.stringify(REQUIRED_ORDER),
  `dive order mismatch: ${SQL_PREMIUM5_PASSES.map((d) => d.slug).join(", ")}`,
);

const perDive: Array<{ slug: string; pass: boolean; probes: number }> = [];

for (const dive of SQL_PREMIUM5_PASSES as LcSqlDive[]) {
  const tag = `[${dive.slug}]`;
  const before = fails.length;

  // xp / order / no writes
  ok(dive.xp === XP_BY_SLUG[dive.slug], `${tag} xp ${dive.xp} != ${XP_BY_SLUG[dive.slug]}`);
  ok(dive.order === "exact", `${tag} order must be "exact"`);
  ok(dive.writeVerify === undefined, `${tag} read problem must not carry writeVerify`);

  // exactly one statement + result-level ORDER BY (comments and OVER spans stripped)
  ok(countStatements(dive.code) === 1, `${tag} code must be exactly 1 statement (got ${countStatements(dive.code)})`);
  ok(/\border\s+by\b/i.test(stripCommentsAndOver(dive.code)), `${tag} order:"exact" but no result-level ORDER BY`);

  // approach: ONE line
  ok(!dive.approach.includes("\n"), `${tag} approach must be a single line`);
  ok(dive.approach.trim().length > 0 && dive.approach.trim() === dive.approach, `${tag} approach not trimmed`);

  // no backticks / template holes anywhere in string values
  const hits: string[] = [];
  walkStrings(dive, dive.slug, hits);
  ok(hits.length === 0, `${tag} backtick or \${ found in: ${hits.join(", ")}`);

  // no platform mention in any prose/SQL string of the dive
  const prose: string[] = [];
  walkStrings(dive, dive.slug, prose);
  ok(!prose.some((p) => /leetcode/i.test(p)), `${tag} platform mention inside dive strings`);

  // ddl/seed end with ';' and nothing after (incl. the trailing-comment bug class)
  for (const [key, val] of [["ddl", dive.schema.ddl], ["seed", dive.schema.seed]] as const) {
    const t = val.trim();
    ok(t.endsWith(";"), `${tag} ${key} does not end with ';'`);
    ok(/;\s*$/.test(val), `${tag} ${key} has content after the final semicolon`);
    ok(countStatements(val) >= 1, `${tag} ${key} holds no statements`);
    for (const line of val.split("\n")) {
      ok(!/;.*--/.test(line), `${tag} ${key} has a trailing comment after a semicolon: ${line.trim()}`);
    }
  }
  // no ';' inside any comment of ddl/seed/code
  for (const [key, val] of [["ddl", dive.schema.ddl], ["seed", dive.schema.seed], ["code", dive.code]] as const) {
    for (const line of val.split("\n")) {
      const ci = line.indexOf("--");
      if (ci !== -1) ok(!line.slice(ci).includes(";"), `${tag} ${key} comment holds a ';': ${line.trim()}`);
    }
  }
  ok((dive.schema.tables?.length ?? 0) >= 1, `${tag} schema.tables missing`);

  // structural counts
  ok(dive.examples.length === 2, `${tag} needs exactly 2 examples (got ${dive.examples.length})`);
  ok(dive.examples.every((e) => e.input.trim() && e.output.trim()), `${tag} an example has empty input/output`);
  ok(dive.constraints.length === 3, `${tag} needs exactly 3 constraints (got ${dive.constraints.length})`);
  ok(dive.breakdown.length === 3, `${tag} needs exactly 3 breakdown paragraphs`);
  dive.breakdown.forEach((p, i) => {
    const n = sentences(p);
    ok(n >= 3 && n <= 5, `${tag} breakdown para ${i} has ${n} sentences (want 3-5)`);
  });
  ok(dive.edges.length >= 3 && dive.edges.length <= 4, `${tag} edges must be 3-4 (got ${dive.edges.length})`);
  ok(dive.ladder.length === 3, `${tag} ladder needs exactly 3 rungs`);
  ok(dive.walkthrough.length === 3, `${tag} walkthrough needs exactly 3 steps (got ${dive.walkthrough.length})`);
  ok((dive.followUps?.length ?? 0) >= 2, `${tag} needs >= 2 followUps`);
  ok((dive.related?.length ?? 0) === 3, `${tag} needs exactly 3 related slugs`);
  for (const r of dive.related ?? []) ok(registrySlugs.has(r), `${tag} related slug not in LC_ALL: ${r}`);

  // contract presence (internal cross-check)
  const contract = CONTRACTS[dive.slug];
  ok(!!contract, `${tag} no hand contract (internal)`);
  const probes = PROBES[dive.slug] ?? [];

  // -- engine execution: twice, for determinism ------------------------------
  let first: { columns: string[]; rows: CellValue[][] } | null = null;
  for (let pass = 0; pass < 2; pass++) {
    const db = new Database(":memory:");
    try {
      for (const s of splitStatements(dive.schema.ddl)) db.run(s);
      for (const s of splitStatements(dive.schema.seed)) db.run(s);
      const st = db.prepare(executable(dive.code));
      const rows = st.all() as Record<string, unknown>[];
      const columns = st.columnNames;
      const normed = rows.map((r) => columns.map((c) => norm(r[c])));
      if (pass === 0) {
        first = { columns, rows: normed };
        ok(
          JSON.stringify(columns) === JSON.stringify(contract.columns),
          `${tag} columns ${JSON.stringify(columns)} != ${JSON.stringify(contract.columns)}`,
        );
        ok(
          JSON.stringify(normed) === JSON.stringify(contract.rows),
          `${tag} rows mismatch:\n  got      ${JSON.stringify(normed)}\n  expected ${JSON.stringify(contract.rows)}`,
        );
      } else {
        ok(
          JSON.stringify(first) === JSON.stringify({ columns, rows: normed }),
          `${tag} non-deterministic across runs`,
        );
      }
    } catch (err) {
      fails.push(`${tag} FAILED: ${err instanceof Error ? err.message : String(err)}`);
      checks++;
    } finally {
      db.close();
    }
  }

  // -- planted-trap probes: the WRONG query yields the documented wrong rows --
  for (const probe of probes) {
    const db = new Database(":memory:");
    try {
      for (const s of splitStatements(dive.schema.ddl)) db.run(s);
      for (const s of splitStatements(dive.schema.seed)) db.run(s);
      const st = db.prepare(executable(probe.sql(dive.code)));
      const rows = st.all() as Record<string, unknown>[];
      const columns = st.columnNames;
      const normed = rows.map((r) => columns.map((c) => norm(r[c])));
      ok(
        JSON.stringify(normed) === JSON.stringify(probe.expect),
        `${tag} probe [${probe.label}] mismatch:\n  got      ${JSON.stringify(normed)}\n  expected ${JSON.stringify(probe.expect)}`,
      );
    } catch (err) {
      fails.push(`${tag} probe [${probe.label}] FAILED: ${err instanceof Error ? err.message : String(err)}`);
      checks++;
    } finally {
      db.close();
    }
  }

  perDive.push({ slug: dive.slug, pass: fails.length === before, probes: probes.length });
}

// -- PASS/FAIL table ----------------------------------------------------------
console.log("\ndive                                          result  probes");
console.log("---------------------------------------------------------------");
for (const d of perDive) {
  console.log(`${d.slug.padEnd(46)}${d.pass ? "PASS" : "FAIL"}    ${d.probes}`);
}
console.log(`\n${checks} assertions across ${SQL_PREMIUM5_PASSES.length} dives`);
if (fails.length) {
  console.error(`\n${fails.length} FAILURE(S):`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("ALL CHECKS PASS 3/3");
