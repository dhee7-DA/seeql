/**
 * Task 70-b1 self-check — sql-free-classics.ts (batch 10, file 1 of 5).
 * Mirrors scripts/lc-sql-verify.ts semantics: builds each dive's schema in
 * bun:sqlite :memory:, runs the solution TWICE (determinism), and HARD-asserts
 * the exact columns + full row arrays (order-sensitive) against hand-derived
 * contracts, plus the batch's structural invariants (field order, one
 * statement, result-level ORDER BY after stripping comments/OVER spans, no
 * writeVerify, ddl/seed trailing-';' discipline, 2 examples / 3 constraints /
 * 3 breakdown paras of 3-5 sentences / 3-4 edges / 3 rungs / 3 walkthrough /
 * 2 followUps / 3 related all present in LC_ALL) and planted-trap probes
 * (each wrong query re-run against the seed to pin its documented failure).
 *
 * Run: bun scripts/tmp-70b1-check.ts
 */
import { Database } from "bun:sqlite";
import { SQL_FREE_CLASSICS } from "../src/lib/leetcode/content/sql-free-classics";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import type { LcSqlDive } from "../src/lib/leetcode/types";

// -- hand-derived contracts (slug -> xp, columns, rows in graded order) ------
const CONTRACTS: Array<{ slug: string; xp: number; columns: string[]; rows: unknown[][] }> = [
  {
    slug: "nth-highest-salary",
    xp: 20,
    columns: ["second_highest"],
    rows: [[89000]],
  },
  {
    slug: "consecutive-numbers",
    xp: 20,
    columns: ["value"],
    rows: [[5], [7]],
  },
  {
    slug: "rising-temperature",
    xp: 10,
    columns: ["day"],
    rows: [[2], [4]],
  },
  {
    slug: "find-customer-referee",
    xp: 10,
    columns: ["name"],
    rows: [["Bo"], ["Cy"], ["Elif"]],
  },
  {
    slug: "big-countries",
    xp: 10,
    columns: ["name", "continent", "area", "population"],
    rows: [
      ["Aurelia", "Meridia", 3500000, 12000000],
      ["Borealia", "Boreala", 900000, 41000000],
      ["Cindralon", "Equatoria", 9900000, 130000000],
    ],
  },
];

const FIELD_ORDER = [
  "slug", "statement", "examples", "constraints", "breakdown", "edges",
  "ladder", "approach", "schema", "code", "walkthrough", "time", "space",
  "followUps", "related", "order", "xp",
];

// -- helpers -----------------------------------------------------------------
const stripComments = (s: string) => s.replace(/--[^\n]*/g, " ");

/** Remove balanced OVER(...) spans so window ORDER BYs stop counting. */
function stripOverSpans(sql: string): string {
  const re = /\bover\s*\(/gi;
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    const open = m.index + m[0].length - 1;
    let depth = 1;
    let j = open + 1;
    while (j < sql.length && depth > 0) {
      const ch = sql[j];
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      j++;
    }
    out += sql.slice(last, m.index) + " ";
    last = j;
    re.lastIndex = j;
  }
  return out + sql.slice(last);
}

const countSentences = (p: string) =>
  p.split(/(?<=[.!?])\s+(?=[A-Z"'(])/).filter((s) => s.trim().length > 0).length;

let checks = 0;
const problems: string[] = [];
function ok(cond: boolean, label: string): boolean {
  checks++;
  if (!cond) problems.push(label);
  return cond;
}
function eq<T>(got: T, want: T, label: string): boolean {
  return ok(JSON.stringify(got) === JSON.stringify(want), `${label} — got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
}
function runStatements(db: Database, text: string): void {
  for (const stmt of splitStatements(text)) db.exec(stmt);
}

// -- per-dive structural + engine checks -------------------------------------
const lcSlugs = new Set<string>((LC_ALL as Array<{ slug: string }>).map((r) => r.slug));

ok(SQL_FREE_CLASSICS.length === 5, `file exports exactly 5 dives (got ${SQL_FREE_CLASSICS.length})`);

for (let i = 0; i < Math.min(SQL_FREE_CLASSICS.length, CONTRACTS.length); i++) {
  const d: LcSqlDive = SQL_FREE_CLASSICS[i];
  const c = CONTRACTS[i];
  const tag = c.slug;

  ok(d.slug === c.slug, `${tag}: slug at position ${i + 1} (got ${d.slug})`);
  eq(Object.keys(d), FIELD_ORDER, `${tag}: field order matches the exemplar`);
  ok(d.order === "exact", `${tag}: order is "exact"`);
  ok(!("writeVerify" in d), `${tag}: no writeVerify (READ problem)`);
  eq(d.xp, c.xp, `${tag}: xp`);
  ok(!d.approach.includes("\n"), `${tag}: approach is one line`);
  eq(countStatements(d.code), 1, `${tag}: code is exactly ONE statement`);

  const stripped = stripOverSpans(stripComments(d.code)).trim();
  ok(/order\s+by[^;]+;\s*$/i.test(stripped), `${tag}: result-level ORDER BY survives comment+OVER stripping`);

  // structural counts
  ok(d.examples.length === 2 && d.examples.every((e) => e.input.length > 0 && e.output.length > 0), `${tag}: 2 examples with input+output`);
  eq(d.constraints.length, 3, `${tag}: exactly 3 constraints`);
  eq(d.breakdown.length, 3, `${tag}: exactly 3 breakdown paragraphs`);
  d.breakdown.forEach((p, k) => {
    const n = countSentences(p);
    ok(n >= 3 && n <= 5, `${tag}: breakdown para ${k + 1} has 3-5 sentences (got ${n})`);
  });
  ok(d.edges.length >= 3 && d.edges.length <= 4, `${tag}: 3-4 edges (got ${d.edges.length})`);
  ok(d.ladder.length === 3 && d.ladder.every((r) => r.title.length > 0 && r.body.length > 0), `${tag}: 3 ladder rungs with title+body`);
  ok((d.followUps?.length ?? 0) >= 2, `${tag}: >= 2 followUps (got ${d.followUps?.length})`);
  eq(d.related?.length, 3, `${tag}: exactly 3 related slugs`);
  (d.related ?? []).forEach((s) => ok(lcSlugs.has(s), `${tag}: related slug exists in LC_ALL: ${s}`));
  eq(d.walkthrough.length, 3, `${tag}: exactly 3 walkthrough steps`);
  ok(d.time.length > 0 && d.space.length > 0, `${tag}: time + space present`);
  ok(d.schema.tables !== undefined && d.schema.tables.length > 0, `${tag}: schema tables notes present`);

  // string hygiene: no backticks, no template holes, no platform mentions
  const json = JSON.stringify(d);
  ok(!json.includes("`"), `${tag}: no backticks in any string`);
  ok(!json.includes("${"), `${tag}: no \${ template holes`);
  ok(!/leetcode/i.test(json), `${tag}: no platform mention`);

  // ddl/seed discipline: end ';' with nothing after, no comments after/before ';'
  for (const [key, text] of [["ddl", d.schema.ddl], ["seed", d.schema.seed]] as const) {
    const trimmed = text.trimEnd();
    ok(trimmed.endsWith(";"), `${tag}: ${key} ends with ';'`);
    const tail = trimmed.slice(trimmed.lastIndexOf(";") + 1);
    ok(tail.trim().length === 0, `${tag}: ${key} has NOTHING after the final ';'`);
    for (const line of text.split("\n")) {
      ok(!/;.*--/.test(line), `${tag}: ${key} line carries no comment after ';' — ${JSON.stringify(line)}`);
      const ci = line.indexOf("--");
      if (ci >= 0) ok(!line.slice(ci).includes(";"), `${tag}: ${key} comment holds no ';' — ${JSON.stringify(line)}`);
    }
  }
  for (const line of d.code.split("\n")) {
    const ci = line.indexOf("--");
    if (ci >= 0) ok(!line.slice(ci).includes(";"), `${tag}: code comment holds no ';' — ${JSON.stringify(line)}`);
  }

  // engine: build, run TWICE, hard-assert columns + full row arrays
  const db = new Database(":memory:");
  runStatements(db, d.schema.ddl);
  runStatements(db, d.schema.seed);
  const q = db.prepare(d.code);
  const cols = (q as unknown as { columnNames: string[] }).columnNames; // bun:sqlite exposes columnNames as an array
  const asRows = (recs: Record<string, unknown>[]) => recs.map((r) => cols.map((c) => r[c]));
  const rows1 = asRows(q.all() as Record<string, unknown>[]);
  const rows2 = asRows(q.all() as Record<string, unknown>[]);
  eq(rows1, rows2, `${tag}: deterministic double run`);
  eq(cols, c.columns, `${tag}: output columns`);
  eq(rows1, c.rows, `${tag}: output rows (order-sensitive)`);
  q.finalize();
  db.close();
}

// -- planted-trap probes: the WRONG query -> the documented wrong result ------
function probe(dive: LcSqlDive, label: string, sql: string, expect: unknown[]): void {
  const db = new Database(":memory:");
  runStatements(db, dive.schema.ddl);
  runStatements(db, dive.schema.seed);
  const st = db.prepare(sql);
  const cs = (st as unknown as { columnNames: string[] }).columnNames;
  const got = (st.all() as Record<string, unknown>[]).map((r) => cs.map((c) => r[c]));
  db.close();
  eq(got, expect, `probe: ${label}`);
}

const [dNth, dConsec, dRising, dReferee, dBig] = SQL_FREE_CLASSICS;

// dive 1 — nth-highest-salary
if (dNth && dNth.slug === "nth-highest-salary") {
  probe(dNth, "nth: without DISTINCT the skip lands on the duplicate top",
    `SELECT (SELECT salary FROM Income ORDER BY salary DESC LIMIT 1 OFFSET 1) AS x`, [[98000]]);
  probe(dNth, "nth: MAX is the top tier, not the runner-up",
    `SELECT MAX(salary) AS m FROM Income`, [[98000]]);
  probe(dNth, "nth: DENSE_RANK = 2 control agrees with the shipped form",
    `SELECT DISTINCT second_highest FROM (SELECT salary AS second_highest, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk FROM Income) WHERE rnk = 2 ORDER BY second_highest`, [[89000]]);
  const db = new Database(":memory:");
  db.exec(`CREATE TABLE OneTier (salary INTEGER NOT NULL);`);
  db.exec(`INSERT INTO OneTier (salary) VALUES (50000), (50000);`);
  const st = db.prepare(`SELECT (SELECT DISTINCT salary FROM OneTier ORDER BY salary DESC LIMIT 1 OFFSET 1) AS s`);
  const oneTierRows = (st.all() as Record<string, unknown>[]).map((r) => ((st as unknown as { columnNames: string[] }).columnNames).map((c) => r[c]));
  eq(oneTierRows, [[null]], `probe: nth: one distinct tier -> OFFSET past the end -> the mandated NULL row — got ${JSON.stringify(oneTierRows)}`);
  db.close();
}

// dive 2 — consecutive-numbers
if (dConsec && dConsec.slug === "consecutive-numbers") {
  probe(dConsec, "consecutive: COUNT >= 3 admits the four-times scatter (value 2)",
    `SELECT value FROM LogEntry GROUP BY value HAVING COUNT(*) >= 3 ORDER BY value`, [[2], [5], [7]]);
  probe(dConsec, "consecutive: without DISTINCT the 4-run ships twice",
    `SELECT value FROM (SELECT value, LAG(value) OVER (ORDER BY entry_id) AS p1, LAG(value, 2) OVER (ORDER BY entry_id) AS p2 FROM LogEntry) WHERE value = p1 AND value = p2 ORDER BY value`, [[5], [5], [7]]);
  probe(dConsec, "consecutive: double self-join control agrees on contiguous ids",
    `SELECT DISTINCT a.value AS value FROM LogEntry a JOIN LogEntry b ON b.entry_id = a.entry_id + 1 AND b.value = a.value JOIN LogEntry c ON c.entry_id = a.entry_id + 2 AND c.value = a.value ORDER BY a.value`, [[5], [7]]);
  probe(dConsec, "consecutive: HAVING >= 2 on anchor rows erases the exact-3 run of 7 (two anchors vs one)",
    `SELECT value FROM (SELECT value, LAG(value) OVER (ORDER BY entry_id) AS p1, LAG(value, 2) OVER (ORDER BY entry_id) AS p2 FROM LogEntry) WHERE value = p1 AND value = p2 GROUP BY value HAVING COUNT(*) >= 2 ORDER BY value`, [[5]]);
}

// dive 3 — rising-temperature
if (dRising && dRising.slug === "rising-temperature") {
  probe(dRising, "rising: >= admits the planted flat day 3",
    `SELECT today.day FROM DailyWeather today JOIN DailyWeather yesterday ON yesterday.day = today.day - 1 WHERE today.temp >= yesterday.temp ORDER BY today.day`, [[2], [3], [4]]);
  probe(dRising, "rising: flipped comparison reports the fall streak",
    `SELECT today.day FROM DailyWeather today JOIN DailyWeather yesterday ON yesterday.day = today.day - 1 WHERE today.temp < yesterday.temp ORDER BY today.day`, [[5], [6], [7], [8]]);
}

// dive 4 — find-customer-referee
if (dReferee && dReferee.slug === "find-customer-referee") {
  probe(dReferee, "referee: bare <> drops both NULL rows",
    `SELECT name FROM Shopper WHERE referee_id <> 2 ORDER BY name`, [["Bo"]]);
  probe(dReferee, "referee: NOT (referee_id = 2) drops the NULLs too",
    `SELECT name FROM Shopper WHERE NOT (referee_id = 2) ORDER BY name`, [["Bo"]]);
  probe(dReferee, "referee: SQLite null-safe IS NOT 2 agrees with the OR form",
    `SELECT name FROM Shopper WHERE referee_id IS NOT 2 ORDER BY name`, [["Bo"], ["Cy"], ["Elif"]]);
}

// dive 5 — big-countries
if (dBig && dBig.slug === "big-countries") {
  probe(dBig, "big: the AND corruption collapses the report to Cindralon",
    `SELECT name FROM Nation WHERE area >= 3000000 AND population >= 25000000 ORDER BY name`, [["Cindralon"]]);
  probe(dBig, "big: strict > changes nothing on this seed (Drakmara fails strict too)",
    `SELECT name FROM Nation WHERE area > 3000000 OR population > 25000000 ORDER BY name`, [["Aurelia"], ["Borealia"], ["Cindralon"]]);
  probe(dBig, "big: a dropped zero in the area literal (300000) admits Drakmara AND Emberton",
    `SELECT name FROM Nation WHERE area >= 300000 OR population >= 25000000 ORDER BY name`, [["Aurelia"], ["Borealia"], ["Cindralon"], ["Drakmara"], ["Emberton"]]);
}

// -- report -------------------------------------------------------------------
const perDive = CONTRACTS.map((c) => {
  const bad = problems.filter((p) => p.startsWith(`${c.slug}:`));
  return { slug: c.slug, xp: c.xp, status: bad.length === 0 ? "PASS" : "FAIL", bad };
});
const probeFails = problems.filter((p) => p.startsWith("probe:"));
const structuralFails = problems.filter((p) => !p.includes(":") || (!p.startsWith("probe:") && !CONTRACTS.some((c) => p.startsWith(`${c.slug}:`))));

console.log("=== Task 70-b1 self-check: sql-free-classics.ts ===");
for (const row of perDive) {
  console.log(`${row.status}  ${row.slug.padEnd(24)} xp=${row.xp}${row.bad.length ? `\n      - ${row.bad.join("\n      - ")}` : ""}`);
}
console.log(`probes: ${probeFails.length === 0 ? "ALL PASS" : "FAIL"}${probeFails.length ? `\n  - ${probeFails.join("\n  - ")}` : ""}`);
console.log(`file-level: ${structuralFails.length === 0 ? "PASS" : "FAIL"}${structuralFails.length ? `\n  - ${structuralFails.join("\n  - ")}` : ""}`);
console.log(`TOTAL: ${checks} assertions, ${problems.length} failures`);
console.log(problems.length === 0 ? "ALL CHECKS PASS 5/5" : "FAILURES PRESENT — iterate");
if (problems.length > 0) process.exit(1);
