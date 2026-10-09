// Task 74-a self-check — sql-df-bank-a.ts (3 banking dives with domain primers).
// bun scripts/tmp-74-a-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_BANK_A } from "../src/lib/leetcode/content/sql-df-bank-a";
import type { LcSqlDive } from "../src/lib/leetcode/types";

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/* ---------- helpers (73-c protocol) ---------- */
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

/** ddl/seed/code must end with ';' and NOTHING after it on the same line or beyond. */
const trailingSemicolonClean = (s: string) => {
  const t = s.trimEnd();
  if (!t.endsWith(";")) return false;
  const lastNl = t.lastIndexOf("\n");
  const lastLine = t.slice(lastNl + 1);
  return lastLine.trimEnd().endsWith(";") && lastLine.indexOf(";") === lastLine.trimEnd().length - 1;
};
/** no ';' may live inside a -- comment of ddl/seed/code. */
const noSemiInComments = (s: string) =>
  s.split("\n").every((l) => { const i = l.indexOf("--"); return i < 0 || !l.slice(i + 2).includes(";"); });

/** count CREATE TABLE statements in a ddl payload. */
const tableCount = (ddl: string) => (ddl.match(/create\s+table/gi) ?? []).length;

const allStrings = (d: LcSqlDive): string[] => {
  const out: string[] = [d.slug, d.statement, d.approach, d.code, d.time, d.space,
    ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...d.constraints, ...d.breakdown, ...d.edges, ...d.walkthrough,
    ...d.followUps ?? [], ...d.related ?? [],
    ...d.ladder.flatMap((r) => [r.title, r.body]),
    d.schema.ddl, d.schema.seed, ...(d.schema.tables ?? []).flatMap((t) => [t.name, t.note])];
  if (d.primer) {
    const p = d.primer;
    out.push(p.hook, p.where,
      ...p.concept, ...p.worked, ...p.reallife,
      ...p.glossary.flatMap((g) => [g.term, g.def]));
  }
  return out;
};
const proseStrings = (d: LcSqlDive): string[] =>
  [d.statement, d.approach, d.time, d.space,
    ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...d.constraints, ...d.breakdown, ...d.edges, ...d.walkthrough,
    ...d.followUps ?? [], ...d.ladder.flatMap((r) => [r.title, r.body]),
    ...(d.schema.tables ?? []).map((t) => t.note)];

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
// Pinned output contracts (hand-derived, confirmed by the engine).
const SPEC: Array<{
  slug: string; id: number; difficulty: "Easy" | "Medium" | "Hard"; xp: number;
  columns: string[]; rows: unknown[][]; realColumns: string[]; intColumns: string[];
}> = [
  { slug: "vintage-default-curves", id: 8025, difficulty: "Medium", xp: 20,
    columns: ["origination_month", "mob", "cohort_loans", "defaults_so_far", "cum_default_pct"],
    rows: [
      ["2026-01", 1, 4, 0, 0.0], ["2026-01", 2, 4, 0, 0.0], ["2026-01", 3, 4, 1, 25.0],
      ["2026-01", 4, 4, 1, 25.0], ["2026-01", 5, 4, 2, 50.0], ["2026-01", 6, 4, 2, 50.0],
      ["2026-02", 1, 4, 0, 0.0], ["2026-02", 2, 4, 0, 0.0], ["2026-02", 3, 4, 0, 0.0],
      ["2026-02", 4, 4, 0, 0.0], ["2026-02", 5, 4, 0, 0.0], ["2026-02", 6, 4, 1, 25.0],
      ["2026-03", 1, 4, 0, 0.0], ["2026-03", 2, 4, 0, 0.0], ["2026-03", 3, 4, 0, 0.0],
      ["2026-03", 4, 4, 0, 0.0], ["2026-03", 5, 4, 0, 0.0], ["2026-03", 6, 4, 0, 0.0],
    ],
    realColumns: ["cum_default_pct"], intColumns: ["mob", "cohort_loans", "defaults_so_far"] },
  { slug: "delinquency-roll-rates", id: 8026, difficulty: "Hard", xp: 35,
    columns: ["bucket_from", "bucket_to", "transitions"],
    rows: [
      ["current", "current", 2], ["current", "d1_30", 2], ["current", "d31_60", 1],
      ["d1_30", "current", 1], ["d1_30", "d1_30", 1], ["d1_30", "d31_60", 1],
      ["d31_60", "d1_30", 1], ["d31_60", "d61_90", 1],
      ["d61_90", "current", 1], ["d61_90", "d90_plus", 1],
      ["d90_plus", "current", 1], ["d90_plus", "d90_plus", 1],
    ],
    realColumns: [], intColumns: ["transitions"] },
  { slug: "credit-utilization-bands", id: 8027, difficulty: "Easy", xp: 10,
    columns: ["card_id", "credit_limit_cents", "balance_cents", "utilization_pct", "band"],
    rows: [
      [1, 200000, 0, 0.0, "low"], [2, 100000, 24900, 24.9, "low"], [3, 100000, 30000, 30.0, "moderate"],
      [4, 200000, 123000, 61.5, "high"], [5, 100000, 90000, 90.0, "maxed"], [6, 50000, 48650, 97.3, "maxed"],
    ],
    realColumns: ["utilization_pct"], intColumns: ["card_id", "credit_limit_cents", "balance_cents"] },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the brief's verified 16-slug pool.
const RELATED_POOL: Record<string, Set<string>> = {
  "vintage-default-curves": new Set(["cohort-retention-matrix", "delinquency-buckets", "loan-amortization-schedule", "portfolio-weights", "dau-wau-stickiness", "growth-accounting", "daily-balance-interest"]),
  "delinquency-roll-rates": new Set(["delinquency-buckets", "growth-accounting", "dau-wau-stickiness", "loan-amortization-schedule", "settlement-fails-aging", "portfolio-concentration-hhi"]),
  "credit-utilization-bands": new Set(["bank-account-summary-ii", "loan-amortization-schedule", "daily-balance-interest", "duplicate-charge-pairs", "npv-queries", "calculate-product-final-price"]),
};
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-bank-a.ts — ${SQL_DF_BANK_A.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_BANK_A.length === 3 && SPEC.every((s, i) => SQL_DF_BANK_A[i]?.slug === s.slug),
  SQL_DF_BANK_A.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_BANK_A[i];
  const spec = SPEC[i];
  console.log(`\n--- dive ${i + 1}: ${d.slug} ---`);

  // statement count + result-level ORDER BY + read-only
  ok("exactly ONE statement (countStatements)", countStatements(d.code) === 1);
  ok("exactly ONE statement (splitStatements)", splitStatements(d.code).length === 1);
  const stripped = stripOver(stripComments(d.code));
  ok("result-level ORDER BY after stripping comments/OVER spans", /order\s+by/i.test(stripped));
  ok("read-only statement (WITH/SELECT, no write head)", /^\s*(with|select)\b/i.test(stripComments(d.code).trim())
    && !/\b(insert|update|delete|drop|alter|create)\b/i.test(stripComments(d.code).trim()));
  ok('order === "exact"', d.order === "exact");
  ok(`xp === ${spec.xp}`, d.xp === spec.xp);
  ok("approach is ONE line", !d.approach.includes("\n"));

  // trailing-semicolon + comment hygiene
  ok("code ends with a single trailing ';'", trailingSemicolonClean(d.code));
  ok("ddl ends with ';' and nothing after", trailingSemicolonClean(d.schema.ddl));
  ok("seed ends with ';' and nothing after", trailingSemicolonClean(d.schema.seed));
  ok("no ';' inside comments of ddl/seed/code",
    noSemiInComments(d.schema.ddl) && noSemiInComments(d.schema.seed) && noSemiInComments(d.code));

  // structure
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
  ok("exactly 4 edges", d.edges.length === 4);
  d.edges.forEach((p, j) =>
    ok(`edge ${j + 1} has >= 1 full sentence (got ${sentenceCount(p)})`, sentenceCount(p) >= 1));
  ok("3 ladder rungs (title+body)", d.ladder.length === 3 && d.ladder.every((r) => r.title.trim() && r.body.trim()));
  d.ladder.forEach((r, j) =>
    ok(`ladder rung ${j + 1} body has >= 2 sentences (got ${sentenceCount(r.body)})`, sentenceCount(r.body) >= 2));
  ok("walkthrough: one paragraph per logical chunk (3)", d.walkthrough.length === 3);
  d.walkthrough.forEach((p, j) =>
    ok(`walkthrough para ${j + 1} has >= 3 sentences (got ${sentenceCount(p)})`, sentenceCount(p) >= 3));
  ok("2-3 followUps", (d.followUps?.length ?? 0) >= 2 && (d.followUps?.length ?? 0) <= 3);
  ok("exactly 3 related slugs", d.related?.length === 3, String(d.related?.length));
  d.related?.forEach((r) => {
    ok(`related slug from the verified pool: ${r}`, RELATED_POOL[spec.slug].has(r));
    ok(`related slug exists in the registry: ${r}`, LC_SLUGS.has(r));
  });
  ok(`schema.tables has one entry per DDL table (${tableCount(d.schema.ddl)})`,
    (d.schema.tables?.length ?? 0) === tableCount(d.schema.ddl));

  // primer structure (NEW in batch 3)
  const p = d.primer;
  ok("primer present", !!p);
  if (p) {
    ok(`primer hook is exactly 1 sentence (got ${sentenceCount(p.hook)})`, sentenceCount(p.hook) === 1);
    ok(`primer concept has 3-4 paragraphs (got ${p.concept.length})`, p.concept.length >= 3 && p.concept.length <= 4);
    p.concept.forEach((c, j) =>
      ok(`primer concept para ${j + 1} has >= 3 sentences (got ${sentenceCount(c)})`, sentenceCount(c) >= 3));
    ok(`primer worked has 3-5 steps (got ${p.worked.length})`, p.worked.length >= 3 && p.worked.length <= 5);
    p.worked.forEach((s, j) => ok(`primer worked step ${j + 1} nonempty`, s.trim().length > 0));
    ok(`primer glossary has 4-6 terms (got ${p.glossary.length})`, p.glossary.length >= 4 && p.glossary.length <= 6);
    p.glossary.forEach((g, j) =>
      ok(`primer glossary ${j + 1} (${g.term}) def has >= 5 words (got ${g.def.trim().split(/\s+/).length})`,
        g.term.trim().length > 0 && g.def.trim().split(/\s+/).length >= 5));
    ok(`primer reallife has 2-3 paragraphs (got ${p.reallife.length})`, p.reallife.length >= 2 && p.reallife.length <= 3);
    p.reallife.forEach((c, j) =>
      ok(`primer reallife para ${j + 1} has >= 3 sentences (got ${sentenceCount(c)})`, sentenceCount(c) >= 3));
    ok("primer where is one nonempty sentence", p.where.trim().length > 0 && sentenceCount(p.where) === 1);
  }

  // hygiene: backticks / ${ / platform mention / e.g.-i.e. in any dive string
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string",
    strs.every((s) => !/leetcode|hackerrank|datalemur|stratascratch/i.test(s)));
  ok('no "e.g."/"i.e." in prose (sentence heuristic safety)',
    proseStrings(d).every((s) => !/\be\.g\.|\bi\.e\./i.test(s)));

  // MONEY convention: every money column present (input or output) is INTEGER
  // in DDL / declared-integer in the contract; REAL reserved for rates/pcts.
  // (D2 legitimately holds no money columns at all — no length floor here.)
  const moneyOut = spec.columns.filter((c) => /(_cents|_minor)$/.test(c));
  ok("every *_cents/_minor output column is declared integer", moneyOut.every((c) => spec.intColumns.includes(c)));
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents|\w+_minor)\s+(\w+)/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  ok(`every *_cents/_minor DDL column is INTEGER (${ddlMoney.length} money columns)`,
    ddlMoney.every((parts) => parts[1] === "INTEGER"), JSON.stringify(ddlMoney));
  ok("declared REAL columns appear in the output", spec.realColumns.every((c) => spec.columns.includes(c)));

  // registry tuple: STRICT whenever the row is wired; PEND while the lead owes wiring
  const regRow = LC_ALL.find((x) => x.slug === spec.slug);
  if (regRow) {
    ok(`registry tuple ${spec.slug}: num === ${spec.id}`, regRow.num === spec.id, String(regRow.num));
    ok(`registry tuple ${spec.slug}: difficulty === ${spec.difficulty}`, regRow.difficulty === spec.difficulty, String(regRow.difficulty));
    ok(`registry tuple ${spec.slug}: xp(${XP[regRow.difficulty]}) === ${spec.xp}`, XP[regRow.difficulty] === spec.xp);
  } else {
    console.log(`  PEND  registry tuple ${spec.id} ${spec.slug} — row not yet wired by the lead (assert is armed)`);
  }

  // engine: build from ddl+seed, run solution TWICE, hard-assert columns + every cell
  try {
    const db = buildDb(d);
    const r1 = runSql(db, d.code);
    const c1 = getCols(db, d.code);
    const r2 = runSql(db, d.code);
    db.close();
    ok("determinism: two runs identical", eq(r1, r2));
    ok(`columns === [${spec.columns.join(", ")}]`, eq(c1, spec.columns), JSON.stringify(c1));
    ok(`row count === ${spec.rows.length}`, r1.length === spec.rows.length, String(r1.length));
    r1.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        const col = spec.columns[ci];
        const exp = spec.rows[ri][ci];
        ok(`cell(${ri + 1},${ci + 1}) ${col} === ${JSON.stringify(exp)}`, eq(cell, exp), JSON.stringify(cell));
        if (spec.realColumns.includes(col)) {
          ok(`cell(${ri + 1},${ci + 1}) ${col} REAL within 1e-9 of ${exp}`,
            Math.abs(Number(cell) - Number(exp)) < 1e-9, String(cell));
        }
      });
    });
    ok("rows === spec (order-sensitive, whole-array)", eq(r1, spec.rows), JSON.stringify(r1));
    ok("every declared-integer cell is an integer",
      r1.every((row) => spec.intColumns.every((c) => Number.isInteger(row[spec.columns.indexOf(c)]))));
  } catch (e) {
    ok("engine build+run", false, String(e));
  }
}

/* ---------- per-dive hand verification ---------- */
console.log("\n=== vintage curves — seed facts + hand reductions ===");
{
  const d = SQL_DF_BANK_A[0];
  const db = buildDb(d);
  ok("seed: 72 perf rows", eq(runSql(db, "SELECT COUNT(*) FROM perf"), [[72]]));
  ok("seed: 12 loans, mobs span 1..6", eq(runSql(db, "SELECT COUNT(DISTINCT loan_id), MIN(mob), MAX(mob) FROM perf"), [[12, 1, 6]]));
  ok("seed: mob spine complete (1..6 all present)", eq(runSql(db, "SELECT DISTINCT mob FROM perf ORDER BY mob ASC"), [[1], [2], [3], [4], [5], [6]]));
  ok("seed: 7 flag rows but only 3 defaulted loans (persistence != count)",
    eq(runSql(db, "SELECT COUNT(*) FROM perf WHERE is_default = 1"), [[7]])
    && eq(runSql(db, "SELECT COUNT(DISTINCT loan_id) FROM perf WHERE is_default = 1"), [[3]]));
  ok("hand: first_default = (1,3) (2,5) (5,6)",
    eq(runSql(db, "SELECT loan_id, MIN(mob) FROM perf WHERE is_default = 1 GROUP BY loan_id ORDER BY loan_id ASC"), [[1, 3], [2, 5], [5, 6]]));
  ok("hand: cohort sizes 4/4/4 from loans",
    eq(runSql(db, "SELECT origination_month, COUNT(*) FROM loans GROUP BY origination_month ORDER BY origination_month ASC"),
      [["2026-01", 4], ["2026-02", 4], ["2026-03", 4]]));
  ok("hand: ever-defaulted per cohort = 2 / 1 / (0 absent)",
    eq(runSql(db, `SELECT l.origination_month, COUNT(DISTINCT p.loan_id) FROM perf p
        JOIN loans l ON l.loan_id = p.loan_id WHERE p.is_default = 1
        GROUP BY l.origination_month ORDER BY l.origination_month ASC`),
      [["2026-01", 2], ["2026-02", 1]]));
  db.close();
}

console.log("\n=== roll rates — seed facts + pairing identity ===");
{
  const d = SQL_DF_BANK_A[1];
  const db = buildDb(d);
  ok("seed: 28 rows = 14 customers x 2 snapshots",
    eq(runSql(db, "SELECT COUNT(*) FROM roll_states"), [[28]])
    && eq(runSql(db, "SELECT COUNT(*) FROM roll_states WHERE snapshot_month = '2026-01'"), [[14]])
    && eq(runSql(db, "SELECT COUNT(*) FROM roll_states WHERE snapshot_month = '2026-02'"), [[14]]));
  ok("seed: January buckets current 5, d1_30 3, d31_60 2, d61_90 2, d90_plus 2",
    eq(runSql(db, `SELECT bucket, COUNT(*) FROM roll_states WHERE snapshot_month = '2026-01'
        GROUP BY bucket ORDER BY bucket ASC`),
      [["current", 5], ["d1_30", 3], ["d31_60", 2], ["d61_90", 2], ["d90_plus", 2]]));
  ok("seed: February buckets current 5, d1_30 4, d31_60 2, d61_90 1, d90_plus 2",
    eq(runSql(db, `SELECT bucket, COUNT(*) FROM roll_states WHERE snapshot_month = '2026-02'
        GROUP BY bucket ORDER BY bucket ASC`),
      [["current", 5], ["d1_30", 4], ["d31_60", 2], ["d61_90", 1], ["d90_plus", 2]]));
  ok("hand: the self-join pairs exactly 14 customers",
    eq(runSql(db, `SELECT COUNT(*) FROM roll_states s1 JOIN roll_states s2
        ON s2.customer_id = s1.customer_id AND s2.snapshot_month = '2026-02'
        WHERE s1.snapshot_month = '2026-01'`), [[14]]));
  db.close();
}

console.log("\n=== utilization — seed facts + hand ratios ===");
{
  const d = SQL_DF_BANK_A[2];
  const db = buildDb(d);
  ok("seed: 6 cards, 9 statements",
    eq(runSql(db, "SELECT COUNT(*) FROM cards"), [[6]])
    && eq(runSql(db, "SELECT COUNT(*) FROM statements"), [[9]]));
  ok("seed: latest statement per card — card 5 is 2026-02, others 2026-03",
    eq(runSql(db, "SELECT card_id, MAX(stmt_month) FROM statements GROUP BY card_id ORDER BY card_id ASC"),
      [[1, "2026-03"], [2, "2026-03"], [3, "2026-03"], [4, "2026-03"], [5, "2026-02"], [6, "2026-03"]]));
  ok("hand: latest balances = 0 / 24900 / 30000 / 123000 / 90000 / 48650",
    eq(runSql(db, `SELECT s.card_id, s.balance_cents FROM statements s
        JOIN (SELECT card_id, MAX(stmt_month) AS mm FROM statements GROUP BY card_id) m
          ON m.card_id = s.card_id AND m.mm = s.stmt_month ORDER BY s.card_id ASC`),
      [[1, 0], [2, 24900], [3, 30000], [4, 123000], [5, 90000], [6, 48650]]));
  // TS double mirror of the one-step ratio, per card
  const limits = [200000, 100000, 100000, 200000, 100000, 50000];
  const balances = [0, 24900, 30000, 123000, 90000, 48650];
  const expectPct = [0.0, 24.9, 30.0, 61.5, 90.0, 97.3];
  balances.forEach((b, i) => {
    const raw = (100.0 * b) / limits[i];
    ok(`hand: card ${i + 1} ratio 100.0 * ${b} / ${limits[i]} within 1e-9 of ${expectPct[i]}`,
      Math.abs(raw - expectPct[i]) < 1e-9, String(raw));
  });
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 traps
{
  const db = buildDb(SQL_DF_BANK_A[0]);
  const SIZES = `WITH cohort_sizes AS (
      SELECT origination_month, COUNT(*) AS cohort_loans FROM loans GROUP BY origination_month),
    first_default AS (
      SELECT loan_id, MIN(mob) AS default_mob FROM perf WHERE is_default = 1 GROUP BY loan_id),
    new_defaults AS (
      SELECT l.origination_month, fd.default_mob AS mob, COUNT(*) AS new_defaults
      FROM first_default fd JOIN loans l ON l.loan_id = fd.loan_id
      GROUP BY l.origination_month, fd.default_mob)`;
  const SPINE = `CROSS JOIN (SELECT DISTINCT mob FROM perf) m
    LEFT JOIN new_defaults nd ON nd.origination_month = cs.origination_month AND nd.mob = m.mob`;
  ok("D1 mob-exact (non-cumulative) reading sawtooths: 2026-01 reads 25.0/0.0/25.0/0.0 at mobs 3-6",
    eq(runSql(db, `${SIZES}
      SELECT cs.origination_month, m.mob, cs.cohort_loans,
        COALESCE(nd.new_defaults, 0) AS defaults_so_far,
        ROUND(100.0 * COALESCE(nd.new_defaults, 0) / cs.cohort_loans, 2) AS cum_default_pct
      FROM cohort_sizes cs ${SPINE}
      ORDER BY cs.origination_month ASC, m.mob ASC`),
      [["2026-01", 1, 4, 0, 0.0], ["2026-01", 2, 4, 0, 0.0], ["2026-01", 3, 4, 1, 25.0],
       ["2026-01", 4, 4, 0, 0.0], ["2026-01", 5, 4, 1, 25.0], ["2026-01", 6, 4, 0, 0.0],
       ["2026-02", 1, 4, 0, 0.0], ["2026-02", 2, 4, 0, 0.0], ["2026-02", 3, 4, 0, 0.0],
       ["2026-02", 4, 4, 0, 0.0], ["2026-02", 5, 4, 0, 0.0], ["2026-02", 6, 4, 1, 25.0],
       ["2026-03", 1, 4, 0, 0.0], ["2026-03", 2, 4, 0, 0.0], ["2026-03", 3, 4, 0, 0.0],
       ["2026-03", 4, 4, 0, 0.0], ["2026-03", 5, 4, 0, 0.0], ["2026-03", 6, 4, 0, 0.0]]));
  ok("D1 book-total denominator (12 loans) shrinks the curve: 50.0 final reads 16.67, mob-3 reads 8.33",
    eq(runSql(db, `${SIZES},
      curved AS (
        SELECT cs.origination_month, m.mob, cs.cohort_loans,
          SUM(COALESCE(nd.new_defaults, 0)) OVER (PARTITION BY cs.origination_month ORDER BY m.mob) AS defaults_so_far
        FROM cohort_sizes cs ${SPINE})
      SELECT origination_month, mob, cohort_loans, defaults_so_far,
        ROUND(100.0 * defaults_so_far / (SELECT COUNT(*) FROM loans), 2) AS cum_default_pct
      FROM curved ORDER BY origination_month ASC, mob ASC`),
      [["2026-01", 1, 4, 0, 0.0], ["2026-01", 2, 4, 0, 0.0], ["2026-01", 3, 4, 1, 8.33],
       ["2026-01", 4, 4, 1, 8.33], ["2026-01", 5, 4, 2, 16.67], ["2026-01", 6, 4, 2, 16.67],
       ["2026-02", 1, 4, 0, 0.0], ["2026-02", 2, 4, 0, 0.0], ["2026-02", 3, 4, 0, 0.0],
       ["2026-02", 4, 4, 0, 0.0], ["2026-02", 5, 4, 0, 0.0], ["2026-02", 6, 4, 1, 8.33],
       ["2026-03", 1, 4, 0, 0.0], ["2026-03", 2, 4, 0, 0.0], ["2026-03", 3, 4, 0, 0.0],
       ["2026-03", 4, 4, 0, 0.0], ["2026-03", 5, 4, 0, 0.0], ["2026-03", 6, 4, 0, 0.0]]));
  ok("D1 counting flag ROWS instead of DISTINCT loans double-counts: 2026-01 reaches 6/4 = 150.0",
    eq(runSql(db, `WITH cohort_sizes AS (
        SELECT origination_month, COUNT(*) AS cohort_loans FROM loans GROUP BY origination_month),
      flag_rows AS (
        SELECT l.origination_month, p.mob, COUNT(*) AS defaulted_rows
        FROM perf p JOIN loans l ON l.loan_id = p.loan_id
        WHERE p.is_default = 1
        GROUP BY l.origination_month, p.mob),
      curved AS (
        SELECT cs.origination_month, m.mob, cs.cohort_loans,
          SUM(COALESCE(fr.defaulted_rows, 0)) OVER (PARTITION BY cs.origination_month ORDER BY m.mob) AS defaults_so_far
        FROM cohort_sizes cs
        CROSS JOIN (SELECT DISTINCT mob FROM perf) m
        LEFT JOIN flag_rows fr ON fr.origination_month = cs.origination_month AND fr.mob = m.mob)
      SELECT origination_month, mob, cohort_loans, defaults_so_far,
        ROUND(100.0 * defaults_so_far / cohort_loans, 2) AS cum_default_pct
      FROM curved ORDER BY origination_month ASC, mob ASC`),
      [["2026-01", 1, 4, 0, 0.0], ["2026-01", 2, 4, 0, 0.0], ["2026-01", 3, 4, 1, 25.0],
       ["2026-01", 4, 4, 2, 50.0], ["2026-01", 5, 4, 4, 100.0], ["2026-01", 6, 4, 6, 150.0],
       ["2026-02", 1, 4, 0, 0.0], ["2026-02", 2, 4, 0, 0.0], ["2026-02", 3, 4, 0, 0.0],
       ["2026-02", 4, 4, 0, 0.0], ["2026-02", 5, 4, 0, 0.0], ["2026-02", 6, 4, 1, 25.0],
       ["2026-03", 1, 4, 0, 0.0], ["2026-03", 2, 4, 0, 0.0], ["2026-03", 3, 4, 0, 0.0],
       ["2026-03", 4, 4, 0, 0.0], ["2026-03", 5, 4, 0, 0.0], ["2026-03", 6, 4, 0, 0.0]]));
  ok("D1 perf-derived cohort size HAPPENS TO AGREE on the intact seed (4/4/4) — the all-6-rows constraint is why",
    eq(runSql(db, `SELECT l.origination_month, COUNT(DISTINCT p.loan_id) AS cohort_loans
        FROM loans l JOIN perf p ON p.loan_id = l.loan_id
        GROUP BY l.origination_month ORDER BY l.origination_month ASC`),
      [["2026-01", 4], ["2026-02", 4], ["2026-03", 4]]));
  // mutate a COPY of the database: loan 3 loses its entire perf history
  const db2 = buildDb(SQL_DF_BANK_A[0]);
  db2.run("DELETE FROM perf WHERE loan_id = 3");
  ok("D1 after loan 3 loses its perf rows the perf-derived cohort reads 3 for 2026-01 — silent drift",
    eq(runSql(db2, `SELECT l.origination_month, COUNT(DISTINCT p.loan_id) AS cohort_loans
        FROM loans l JOIN perf p ON p.loan_id = l.loan_id
        GROUP BY l.origination_month ORDER BY l.origination_month ASC`),
      [["2026-01", 3], ["2026-02", 4], ["2026-03", 4]]));
  ok("D1 while the loans-derived contract denominator still reads 4 — the entity table is the truth",
    eq(runSql(db2, "SELECT origination_month, COUNT(*) FROM loans GROUP BY origination_month ORDER BY origination_month ASC"),
      [["2026-01", 4], ["2026-02", 4], ["2026-03", 4]]));
  db.close();
  db2.close();
}

// D2 traps
{
  const db = buildDb(SQL_DF_BANK_A[1]);
  const PAIRS = `SELECT s1.bucket AS bucket_from, s2.bucket AS bucket_to
    FROM roll_states s1
    JOIN roll_states s2 ON s2.customer_id = s1.customer_id AND s2.snapshot_month = '2026-02'
    WHERE s1.snapshot_month = '2026-01'`;
  const CONTRACT_ROWS = [["current", "current", 2], ["current", "d1_30", 2], ["current", "d31_60", 1],
    ["d1_30", "current", 1], ["d1_30", "d1_30", 1], ["d1_30", "d31_60", 1],
    ["d31_60", "d1_30", 1], ["d31_60", "d61_90", 1],
    ["d61_90", "current", 1], ["d61_90", "d90_plus", 1],
    ["d90_plus", "current", 1], ["d90_plus", "d90_plus", 1]];
  ok("D2 alphabetical ORDER BY HAPPENS TO AGREE on these labels (digits 1/3/6/9 sort) — the CASE guards a charged_off future",
    eq(runSql(db, `SELECT p.bucket_from, p.bucket_to, COUNT(*) AS transitions
        FROM (${PAIRS}) p GROUP BY p.bucket_from, p.bucket_to
        ORDER BY p.bucket_from ASC, p.bucket_to ASC`),
      CONTRACT_ROWS));
  ok("D2 COUNT(DISTINCT customer_id) HAPPENS TO AGREE (PK = one row per customer-month) — COUNT(*) is the honest transition count",
    eq(runSql(db, `SELECT s1.bucket AS bucket_from, s2.bucket AS bucket_to,
          COUNT(DISTINCT s1.customer_id) AS transitions
        FROM roll_states s1
        JOIN roll_states s2 ON s2.customer_id = s1.customer_id AND s2.snapshot_month = '2026-02'
        WHERE s1.snapshot_month = '2026-01'
        GROUP BY s1.bucket, s2.bucket
        ORDER BY CASE s1.bucket WHEN 'current' THEN 1 WHEN 'd1_30' THEN 2 WHEN 'd31_60' THEN 3 WHEN 'd61_90' THEN 4 WHEN 'd90_plus' THEN 5 END ASC,
                 CASE s2.bucket WHEN 'current' THEN 1 WHEN 'd1_30' THEN 2 WHEN 'd31_60' THEN 3 WHEN 'd61_90' THEN 4 WHEN 'd90_plus' THEN 5 END ASC`),
      CONTRACT_ROWS));
  ok("D2 one-step-only filter (rank distance <= 1) deletes the jump and both deep cures: 9 rows, not 12",
    eq(runSql(db, `WITH severity(rk, bucket) AS (
        VALUES (1, 'current'), (2, 'd1_30'), (3, 'd31_60'), (4, 'd61_90'), (5, 'd90_plus')),
      pairs AS (${PAIRS})
      SELECT p.bucket_from, p.bucket_to, COUNT(*) AS transitions
      FROM pairs p
      JOIN severity f ON f.bucket = p.bucket_from
      JOIN severity t ON t.bucket = p.bucket_to
      WHERE ABS(t.rk - f.rk) <= 1
      GROUP BY p.bucket_from, p.bucket_to
      ORDER BY f.rk ASC, t.rk ASC`),
      [["current", "current", 2], ["current", "d1_30", 2],
       ["d1_30", "current", 1], ["d1_30", "d1_30", 1], ["d1_30", "d31_60", 1],
       ["d31_60", "d1_30", 1], ["d31_60", "d61_90", 1], ["d61_90", "d90_plus", 1],
       ["d90_plus", "d90_plus", 1]]));
  ok("D2 month predicate pinned to 2026-01 on BOTH sides freezes the book: the matrix collapses to its 5-cell diagonal",
    eq(runSql(db, `SELECT s1.bucket AS bucket_from, s2.bucket AS bucket_to, COUNT(*) AS transitions
        FROM roll_states s1
        JOIN roll_states s2 ON s2.customer_id = s1.customer_id AND s2.snapshot_month = '2026-01'
        WHERE s1.snapshot_month = '2026-01'
        GROUP BY s1.bucket, s2.bucket
        ORDER BY CASE s1.bucket WHEN 'current' THEN 1 WHEN 'd1_30' THEN 2 WHEN 'd31_60' THEN 3 WHEN 'd61_90' THEN 4 WHEN 'd90_plus' THEN 5 END ASC,
                 CASE s2.bucket WHEN 'current' THEN 1 WHEN 'd1_30' THEN 2 WHEN 'd31_60' THEN 3 WHEN 'd61_90' THEN 4 WHEN 'd90_plus' THEN 5 END ASC`),
      [["current", "current", 5], ["d1_30", "d1_30", 3], ["d31_60", "d31_60", 2],
       ["d61_90", "d61_90", 2], ["d90_plus", "d90_plus", 2]]));
  ok("D2 grouping by bucket_from alone collapses the matrix to 5 row-totals: 5/3/2/2/2",
    eq(runSql(db, `SELECT s1.bucket AS bucket_from, COUNT(*) AS movers
        FROM roll_states s1 WHERE s1.snapshot_month = '2026-01'
        GROUP BY s1.bucket
        ORDER BY CASE s1.bucket WHEN 'current' THEN 1 WHEN 'd1_30' THEN 2 WHEN 'd31_60' THEN 3 WHEN 'd61_90' THEN 4 WHEN 'd90_plus' THEN 5 END ASC`),
      [["current", 5], ["d1_30", 3], ["d31_60", 2], ["d61_90", 2], ["d90_plus", 2]]));
  ok("D2 movers-only filter (bucket_from <> bucket_to) drops the whole diagonal: 9 rows, no stays",
    eq(runSql(db, `SELECT p.bucket_from, p.bucket_to, COUNT(*) AS transitions
        FROM (${PAIRS}) p
        WHERE p.bucket_from <> p.bucket_to
        GROUP BY p.bucket_from, p.bucket_to
        ORDER BY CASE p.bucket_from WHEN 'current' THEN 1 WHEN 'd1_30' THEN 2 WHEN 'd31_60' THEN 3 WHEN 'd61_90' THEN 4 WHEN 'd90_plus' THEN 5 END ASC,
                 CASE p.bucket_to WHEN 'current' THEN 1 WHEN 'd1_30' THEN 2 WHEN 'd31_60' THEN 3 WHEN 'd61_90' THEN 4 WHEN 'd90_plus' THEN 5 END ASC`),
      [["current", "d1_30", 2], ["current", "d31_60", 1],
       ["d1_30", "current", 1], ["d1_30", "d31_60", 1],
       ["d31_60", "d1_30", 1], ["d31_60", "d61_90", 1],
       ["d61_90", "current", 1], ["d61_90", "d90_plus", 1],
       ["d90_plus", "current", 1]]));
  db.close();
}

// D3 traps
{
  const db = buildDb(SQL_DF_BANK_A[2]);
  const BAND = (ratio: string) => `CASE
      WHEN ${ratio} < 30 THEN 'low'
      WHEN ${ratio} < 60 THEN 'moderate'
      WHEN ${ratio} < 90 THEN 'high'
      ELSE 'maxed' END`;
  const RAW = "100.0 * s.balance_cents / c.credit_limit_cents";
  ok("D3 reading the OLDEST statement instead of the latest flips cards 1 and 2: 75.0 high / 98.0 maxed",
    eq(runSql(db, `SELECT c.card_id, c.credit_limit_cents, s.balance_cents,
          ROUND(${RAW}, 1) AS utilization_pct, ${BAND(RAW)} AS band
        FROM cards c
        JOIN statements s ON s.card_id = c.card_id
        WHERE s.stmt_month = (SELECT MIN(stmt_month) FROM statements m2 WHERE m2.card_id = c.card_id)
        ORDER BY c.card_id ASC`),
      [[1, 200000, 150000, 75.0, "high"], [2, 100000, 98000, 98.0, "maxed"],
       [3, 100000, 30000, 30.0, "moderate"], [4, 200000, 123000, 61.5, "high"],
       [5, 100000, 90000, 90.0, "maxed"], [6, 50000, 48650, 97.3, "maxed"]]));
  ok("D3 no rn filter (any month will do) fans 6 cards out to 9 rows — cards 1, 2 and 5 double",
    (() => {
      const rows = runSql(db, `SELECT c.card_id, s.balance_cents FROM cards c
          JOIN statements s ON s.card_id = c.card_id ORDER BY c.card_id ASC, s.balance_cents DESC`);
      const card1 = rows.filter((r) => r[0] === 1).length;
      return rows.length === 9 && card1 === 2;
    })());
  ok("D3 a GLOBAL month filter (2026-03) silently drops card 5, whose newest statement is 2026-02: 5 rows",
    eq(runSql(db, `SELECT c.card_id FROM cards c
        JOIN statements s ON s.card_id = c.card_id
        WHERE s.stmt_month = '2026-03' ORDER BY c.card_id ASC`),
      [[1], [2], [3], [4], [6]]));
  ok("D3 integer division truncates the ratio: 24 / 61 / 97 instead of 24.9 / 61.5 / 97.3",
    eq(runSql(db, `WITH ranked AS (
        SELECT c.card_id, c.credit_limit_cents, s.balance_cents,
          ROW_NUMBER() OVER (PARTITION BY s.card_id ORDER BY s.stmt_month DESC) AS rn
        FROM cards c JOIN statements s ON s.card_id = c.card_id)
      SELECT card_id, credit_limit_cents, balance_cents,
        ROUND(100 * balance_cents / credit_limit_cents, 1) AS utilization_pct
      FROM ranked WHERE rn = 1 ORDER BY card_id ASC`),
      [[1, 200000, 0, 0.0], [2, 100000, 24900, 24.0], [3, 100000, 30000, 30.0],
       [4, 200000, 123000, 61.0], [5, 100000, 90000, 90.0], [6, 50000, 48650, 97.0]]));
  ok("D3 <= 30 boundary flip demotes exactly-30 card 3 from moderate to low (contract: < 30)",
    eq(runSql(db, `WITH ranked AS (
        SELECT c.card_id, c.credit_limit_cents, s.balance_cents,
          ROW_NUMBER() OVER (PARTITION BY s.card_id ORDER BY s.stmt_month DESC) AS rn
        FROM cards c JOIN statements s ON s.card_id = c.card_id)
      SELECT card_id, band FROM (
        SELECT card_id, ${BAND("100.0 * balance_cents / credit_limit_cents").replace("< 30", "<= 30")} AS band, rn
        FROM ranked) WHERE rn = 1 AND card_id = 3 ORDER BY card_id ASC`),
      [[3, "low"]]));
  ok("D3 ORDER BY utilization instead of card_id reverses the report: cards read 6, 5, 4, 3, 2, 1",
    eq(runSql(db, `WITH ranked AS (
        SELECT c.card_id, c.credit_limit_cents, s.balance_cents,
          ROW_NUMBER() OVER (PARTITION BY s.card_id ORDER BY s.stmt_month DESC) AS rn
        FROM cards c JOIN statements s ON s.card_id = c.card_id)
      SELECT card_id FROM ranked WHERE rn = 1
      ORDER BY ROUND(100.0 * balance_cents / credit_limit_cents, 1) DESC`),
      [[6], [5], [4], [3], [2], [1]]));
  db.close();
  // raw-vs-rounded banding: a synthetic card whose raw ratio is 29.96
  const db3 = new Database(":memory:");
  for (const st of splitStatements(SQL_DF_BANK_A[2].schema.ddl)) db3.run(st);
  db3.run("INSERT INTO cards (card_id, customer_id, credit_limit_cents) VALUES (9, 201, 100000)");
  db3.run("INSERT INTO statements (card_id, stmt_month, balance_cents) VALUES (9, '2026-03', 29960)");
  ok("D3 synthetic raw 29.96 bands LOW on the raw ratio even though it DISPLAYS 30.0 — the contract's raw rule",
    eq(runSql(db3, `SELECT c.card_id, ROUND(100.0 * s.balance_cents / c.credit_limit_cents, 1) AS utilization_pct,
          ${BAND(RAW)} AS band
        FROM cards c JOIN statements s ON s.card_id = c.card_id`),
      [[9, 30.0, "low"]]));
  ok("D3 the same card bands MODERATE when the CASE tests the ROUNDED value — the documented misstep",
    eq(runSql(db3, `SELECT ${BAND("ROUND(100.0 * s.balance_cents / c.credit_limit_cents, 1)")} AS band
        FROM cards c JOIN statements s ON s.card_id = c.card_id`),
      [["moderate"]]));
  db3.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_BANK_A.length}/3`);
