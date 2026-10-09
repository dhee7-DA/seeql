// Task 74-d self-check — sql-df-fraud-b.ts (3 Fraud & AML dives, WITH primers).
// bun scripts/tmp-74-d-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_FRAUD_B } from "../src/lib/leetcode/content/sql-df-fraud-b";
import type { LcSqlDive } from "../src/lib/leetcode/types";

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (label: string, cond: boolean, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; failures.push(label + (detail ? ` — ${detail}` : "")); console.log(`  FAIL  ${label}${detail ? " — " + detail : ""}`); }
};
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/* ---------- helpers (b4 protocol + 74 primer audits) ---------- */
const stripComments = (sql: string) =>
  sql.split("\n").map((l) => { const i = l.indexOf("--"); return i >= 0 ? l.slice(0, i) : l; }).join("\n");

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
  const p = d.primer;
  const out: string[] = [d.slug, d.statement, d.approach, d.code, d.time, d.space,
    ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...d.constraints, ...d.breakdown, ...d.edges, ...d.walkthrough,
    ...d.followUps ?? [], ...d.related ?? [],
    ...d.ladder.flatMap((r) => [r.title, r.body]),
    d.schema.ddl, d.schema.seed, ...(d.schema.tables ?? []).flatMap((t) => [t.name, t.note])];
  if (p) out.push(p.hook, p.where, ...p.concept, ...p.worked, ...p.reallife,
    ...p.glossary.flatMap((g) => [g.term, g.def]));
  return out;
};
const proseStrings = (d: LcSqlDive): string[] => {
  const p = d.primer;
  const out = [d.statement, d.approach, d.time, d.space,
    ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
    ...d.constraints, ...d.breakdown, ...d.edges, ...d.walkthrough,
    ...d.followUps ?? [], ...d.ladder.flatMap((r) => [r.title, r.body]),
    ...(d.schema.tables ?? []).map((t) => t.note)];
  if (p) out.push(p.hook, p.where, ...p.concept, ...p.worked, ...p.reallife,
    ...p.glossary.flatMap((g) => [g.term, g.def]));
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

/** audit a primer block against the 74-batch house rules. */
const auditPrimer = (d: LcSqlDive, label: string) => {
  const p = d.primer;
  ok(`${label}: carries a primer`, !!p);
  if (!p) return;
  ok(`${label}: hook is exactly 1 sentence (got ${sentenceCount(p.hook)})`, sentenceCount(p.hook) === 1, p.hook);
  ok(`${label}: concept has 3-4 paragraphs (got ${p.concept.length})`, p.concept.length >= 3 && p.concept.length <= 4);
  p.concept.forEach((c, i) =>
    ok(`${label}: concept para ${i + 1} has >= 3 sentences (got ${sentenceCount(c)})`, sentenceCount(c) >= 3));
  ok(`${label}: worked has 3-5 steps (got ${p.worked.length})`, p.worked.length >= 3 && p.worked.length <= 5);
  ok(`${label}: glossary has 4-6 terms (got ${p.glossary.length})`, p.glossary.length >= 4 && p.glossary.length <= 6);
  p.glossary.forEach((g, i) =>
    ok(`${label}: glossary ${i + 1} '${g.term}' def has >= 5 words (got ${g.def.trim().split(/\s+/).length})`,
      g.term.trim().length > 0 && g.def.trim().split(/\s+/).length >= 5, g.def));
  ok(`${label}: reallife has 2-3 paragraphs (got ${p.reallife.length})`, p.reallife.length >= 2 && p.reallife.length <= 3);
  p.reallife.forEach((c, i) =>
    ok(`${label}: reallife para ${i + 1} has >= 3 sentences (got ${sentenceCount(c)})`, sentenceCount(c) >= 3));
  ok(`${label}: where is nonempty`, p.where.trim().length > 0);
};

/* ---------- spec ---------- */
// Pinned output contracts (hand-derived, confirmed by the engine).
// realColumns: cells whose contract type is REAL (ROUND-derived statistics —
// asserted within 1e-9 as well). intColumns: INTEGER cells; NULL allowed where
// the contract pins it (dormant_days for the never-logged account).
const SPEC: Array<{
  slug: string; id: number; difficulty: "Easy" | "Medium" | "Hard"; xp: number;
  columns: string[]; rows: unknown[][]; realColumns: string[]; intColumns: string[];
  moneyColumns: string[];
}> = [
  { slug: "amount-anomaly-zscore", id: 8034, difficulty: "Hard", xp: 35,
    columns: ["txn_id", "customer_id", "amount_cents", "baseline_mean_cents", "sigma_cents", "z_score"],
    rows: [
      [6, 21, 89000, 50000, 707.11, 55.15],
      [24, 24, 44300, 40000, 1414.21, 3.04],
      [25, 24, 44243, 40000, 1414.21, 3],
    ],
    realColumns: ["baseline_mean_cents", "sigma_cents", "z_score"],
    intColumns: ["txn_id", "customer_id", "amount_cents"],
    moneyColumns: ["amount_cents"] },
  { slug: "chargeback-rate-ranking", id: 8035, difficulty: "Easy", xp: 10,
    columns: ["merchant_id", "txn_count", "chargeback_count", "chargeback_rate_pct"],
    rows: [
      [105, 40, 2, 5],
      [101, 150, 3, 2],
      [103, 50, 1, 2],
      [106, 99, 1, 1.01],
    ],
    realColumns: ["chargeback_rate_pct"],
    intColumns: ["merchant_id", "txn_count", "chargeback_count"],
    moneyColumns: ["amount_cents"] },
  { slug: "dormant-reactivation", id: 8036, difficulty: "Medium", xp: 20,
    columns: ["account_id", "kyc_verified", "prior_login_date", "reactivation_date", "dormant_days"],
    rows: [
      [2, 0, "2026-04-30", "2026-09-01", 124],
      [1, 0, "2026-05-18", "2026-09-03", 108],
      [3, 0, "2026-03-12", "2026-09-15", 187],
      [4, 0, null, "2026-09-20", null],
    ],
    realColumns: [],
    intColumns: ["account_id", "kyc_verified", "dormant_days"],
    moneyColumns: [] },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the brief's pool (all 12 verified in the registry).
const RELATED_POOL = new Set([
  "duplicate-charge-pairs", "gl-reconciliation", "settlement-fails-aging", "delinquency-buckets",
  "loan-amortization-schedule", "fx-exposure-report", "week-over-week-churn", "feature-adoption-windows",
  "median-time-to-convert", "npv-queries", "calculate-product-final-price", "bank-account-summary-ii",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-fraud-b.ts — ${SQL_DF_FRAUD_B.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_FRAUD_B.length === 3 && SPEC.every((s, i) => SQL_DF_FRAUD_B[i]?.slug === s.slug),
  SQL_DF_FRAUD_B.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_FRAUD_B[i];
  const spec = SPEC[i];
  console.log(`\n--- dive ${i + 1}: ${d.slug} ---`);

  // statement count + result-level ORDER BY + read-only
  ok("exactly ONE statement (countStatements)", countStatements(d.code) === 1);
  ok("exactly ONE statement (splitStatements)", splitStatements(d.code).length === 1);
  ok("result-level ORDER BY after stripping comments", /order\s+by/i.test(stripComments(d.code)));
  ok("read-only statement (WITH/SELECT)", /^\s*(with|select)\b/i.test(stripComments(d.code).trim()));
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
  ok("exactly 4 edges", d.edges.length === 4, String(d.edges.length));
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
    ok(`related slug from the brief pool: ${r}`, RELATED_POOL.has(r));
    ok(`related slug exists in the registry: ${r}`, LC_SLUGS.has(r));
  });
  ok(`schema.tables has one entry per DDL table (${tableCount(d.schema.ddl)})`,
    (d.schema.tables?.length ?? 0) === tableCount(d.schema.ddl));

  // primer audits (new in batch 3)
  auditPrimer(d, d.slug);

  // hygiene: backticks / ${ / platform mention / e.g.-i.e. in any string (primer included)
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string",
    strs.every((s) => !/leetcode|hackerrank|datalemur|stratascratch/i.test(s)));
  ok('no "e.g."/"i.e." in prose (sentence heuristic safety)',
    proseStrings(d).every((s) => !/\be\.g\.|\bi\.e\./i.test(s)));

  // MONEY convention: every money column in the DDL is INTEGER; every *_cents
  // OUTPUT column is classified as declared-integer or contract-REAL (the
  // ROUND-derived mean/sigma statistics ride realColumns — REAL is reserved
  // for rates/scores/statistics by contract).
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents|\w+_minor)\s+\w+/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  ok("every *_cents/_minor DDL column is INTEGER",
    ddlMoney.every((p) => p[1] === "INTEGER"), JSON.stringify(ddlMoney));
  ok(`expected DDL money columns present as INTEGER (${spec.moneyColumns.join(", ") || "none"})`,
    spec.moneyColumns.every((c) => ddlMoney.some((p) => p[0] === c)));
  const moneyOut = spec.columns.filter((c) => /_cents$/.test(c));
  ok("every *_cents output column is classified integer or contract-REAL",
    moneyOut.every((c) => spec.intColumns.includes(c) || spec.realColumns.includes(c)),
    JSON.stringify(moneyOut));
  ok("declared REAL columns appear in the output", spec.realColumns.every((c) => spec.columns.includes(c)));

  // registry tuple: STRICT whenever the row is wired; PEND while the lead owes wiring
  const regRow = LC_ALL.find((p) => p.slug === spec.slug);
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
    ok("every declared-integer cell is an integer (NULL allowed where the contract pins it)",
      r1.every((row) => spec.intColumns.every((c) => {
        const cell = row[spec.columns.indexOf(c)];
        return cell === null || Number.isInteger(cell);
      })));
    console.log(`  SNAPSHOT  columns: ${c1.join(" | ")}`);
    r1.forEach((row, ri) => console.log(`  SNAPSHOT  row ${ri + 1}: ${JSON.stringify(row)}`));
  } catch (e) {
    ok("engine build+run", false, String(e));
  }
}

/* ---------- per-dive hand verification ---------- */
console.log("\n=== z-scores — TS float mirror + 3.04/2.97 boundary hand-verification ===");
{
  const d = SQL_DF_FRAUD_B[0];
  const db = buildDb(d);
  // TS mirror of the pinned identity: population sigma via mean/mean-of-squares
  const mirror = (amounts: number[]) => {
    const n = amounts.length;
    const mean = amounts.reduce((a, b) => a + 1.0 * b, 0) / n;
    const sqMean = amounts.reduce((a, b) => a + 1.0 * b * b, 0) / n;
    const sigma = Math.sqrt(sqMean - mean * mean);
    return { mean, sigma };
  };
  const BASE: Record<number, number[]> = {
    21: [49000, 49500, 50000, 50500, 51000],
    22: [40000, 80000, 120000, 160000, 200000],
    23: [60000, 60000, 60000, 60000, 60000],
    24: [38000, 39000, 40000, 41000, 42000],
    25: [78000, 79500, 80000, 80500, 82000],
  };
  const SEP: Record<number, number[]> = { 21: [89000], 22: [100000], 23: [75000], 24: [44300, 44243, 44200], 25: [30000] };
  // engine raw values per September txn
  const raw = runSql(db, `WITH base AS (
      SELECT customer_id, AVG(1.0*amount_cents) AS mean_c,
             AVG(1.0*amount_cents*amount_cents) AS sq_mean_c
      FROM txns WHERE txn_date BETWEEN '2026-06-01' AND '2026-08-31' GROUP BY customer_id)
    SELECT t.txn_id, t.customer_id, t.amount_cents, b.mean_c,
           sqrt(b.sq_mean_c - b.mean_c*b.mean_c) AS sigma_c,
           (t.amount_cents - b.mean_c)/sqrt(b.sq_mean_c - b.mean_c*b.mean_c) AS raw_z
    FROM txns t JOIN base b ON b.customer_id = t.customer_id
    WHERE t.txn_date BETWEEN '2026-09-01' AND '2026-09-30'
    ORDER BY t.txn_id ASC`) as Array<[number, number, number, number, number, number]>;
  ok("engine scored exactly the 7 seeded September rows", raw.length === 7, String(raw.length));
  for (const [txnId, cid, amt, eMean, eSigma, eZ] of raw) {
    const m = mirror(BASE[cid]);
    ok(`txn ${txnId} (c${cid}) engine mean within 1e-9 of TS mirror`, Math.abs(eMean - m.mean) < 1e-9, `${eMean} vs ${m.mean}`);
    ok(`txn ${txnId} (c${cid}) engine sigma within 1e-9 of TS mirror`, Math.abs(eSigma - m.sigma) < 1e-9, `${eSigma} vs ${m.sigma}`);
    if (eZ === null) {
      // the zero-variance customer: sigma 0, raw z NULL (division by zero) — the documented guard case
      ok(`txn ${txnId} (c${cid}) zero-variance baseline: engine z is NULL and sigma is 0`, eSigma === 0 && m.sigma === 0);
      continue;
    }
    const tsZ = (amt - m.mean) / m.sigma;
    ok(`txn ${txnId} (c${cid}) engine raw z within 1e-9 of TS mirror`, Math.abs(eZ - tsZ) < 1e-9, `${eZ} vs ${tsZ}`);
  }
  // sigma identities straight from the pinned amounts
  ok("sigma(21) === sqrt(500000) within 1e-9", Math.abs(mirror(BASE[21]).sigma - Math.sqrt(500000)) < 1e-9);
  ok("sigma(24) === sqrt(2000000) within 1e-9", Math.abs(mirror(BASE[24]).sigma - Math.sqrt(2000000)) < 1e-9);
  ok("sigma(25) === sqrt(1700000) within 1e-9", Math.abs(mirror(BASE[25]).sigma - Math.sqrt(1700000)) < 1e-9);
  ok("sigma(23) === 0 (identical baseline)", mirror(BASE[23]).sigma === 0);
  // the 3.04 / 2.97 boundary pair, hand-verified
  const z44300 = raw.find((r) => r[0] === 24)![5];
  const z44243 = raw.find((r) => r[0] === 25)![5];
  const z44200 = raw.find((r) => r[0] === 26)![5];
  ok("raw z(44300) = 3.040559… > 3.0 (flagged) — TS mirror agrees within 1e-9",
    z44300 > 3.0 && Math.abs(z44300 - (44300 - mirror(BASE[24]).mean) / mirror(BASE[24]).sigma) < 1e-9, String(z44300));
  ok("raw z(44243) = 3.000254… > 3.0 (flagged, prints 3.0) — TS mirror agrees within 1e-9",
    z44243 > 3.0 && Math.abs(z44243 - (44243 - mirror(BASE[24]).mean) / mirror(BASE[24]).sigma) < 1e-9, String(z44243));
  ok("raw z(44200) = 2.969848… < 3.0 (excluded) — TS mirror agrees within 1e-9",
    z44200 < 3.0 && Math.abs(z44200 - (44200 - mirror(BASE[24]).mean) / mirror(BASE[24]).sigma) < 1e-9, String(z44200));
  const round2 = (x: number) => Math.round(x * 100) / 100;
  ok("display(z44300) rounds to 3.04 (TS round agrees with engine cell)", round2(z44300) === 3.04 && Math.abs(round2(z44300) - 3.04) < 1e-9);
  ok("display(z44243) rounds to 3.0 — the flagged row that prints ON the wall", round2(z44243) === 3.0);
  ok("display(z44200) rounds to 2.97 — the row the rounded comparison would misjudge", round2(z44200) === 2.97);
  // population vs sample: ratio sqrt(1.25), and the shipped contract is population
  const sample24 = Math.sqrt(2000000 * 5 / 4);
  ok("sample sigma(24) = sqrt(2500000) = 1581.1388…, ratio to population = sqrt(1.25)",
    Math.abs(sample24 - 1581.1388300841898) < 1e-9 && Math.abs(sample24 / mirror(BASE[24]).sigma - Math.sqrt(1.25)) < 1e-12);
  ok("customer 21 flagged-row z mirror: 39000 / sqrt(500000) = 55.1543…",
    Math.abs(39000 / Math.sqrt(500000) - 55.154328932550705) < 1e-9);
  db.close();
}

console.log("\n=== chargebacks — base counts + hand rate identity ===");
{
  const d = SQL_DF_FRAUD_B[1];
  const db = buildDb(d);
  const base = runSql(db, `SELECT merchant_id, status, COUNT(*) AS n FROM merchant_txns
    GROUP BY merchant_id, status ORDER BY merchant_id ASC, status ASC`);
  ok("planted base counts: 14 (merchant, status) groups",
    eq(base, [
      [101, "chargeback", 3], [101, "settled", 147],
      [102, "chargeback", 1], [102, "settled", 199],
      [103, "chargeback", 1], [103, "settled", 49],
      [104, "chargeback", 2], [104, "settled", 198],
      [105, "chargeback", 2], [105, "refunded", 60], [105, "settled", 38],
      [106, "chargeback", 1], [106, "refunded", 60], [106, "settled", 98],
    ]), JSON.stringify(base));
  ok("total rows = 859", (runSql(db, `SELECT COUNT(*) FROM merchant_txns`)[0][0] as number) === 859);
  // TS re-derivation of every shipped rate from the base counts
  const counted: Record<number, { cb: number; total: number }> = {};
  base.forEach(([m, st, n]) => {
    if (st === "refunded") return;
    counted[m as number] ??= { cb: 0, total: 0 };
    counted[m as number].total += n as number;
    if (st === "chargeback") counted[m as number].cb += n as number;
  });
  const round2 = (x: number) => Math.round(x * 100) / 100;
  const expectRates: Record<number, number> = { 101: 2, 102: 0.5, 103: 2, 104: 1, 105: 5, 106: round2(100.0 * 1 / 99) };
  for (const m of [101, 102, 103, 104, 105, 106]) {
    const rawRate = 100.0 * counted[m].cb / counted[m].total;
    ok(`merchant ${m}: TS raw rate ${rawRate} → display ${expectRates[m]} within 1e-9`,
      Math.abs(round2(rawRate) - expectRates[m]) < 1e-9, String(round2(rawRate)));
  }
  ok("101 and 103 tie at exactly 2.0 (the tiebreak case is real)",
    Math.abs(100.0 * counted[101].cb / counted[101].total - 2.0) < 1e-9 &&
    Math.abs(100.0 * counted[103].cb / counted[103].total - 2.0) < 1e-9);
  ok("104 lands on exactly 1.0 — the strict wall decides it",
    Math.abs(100.0 * counted[104].cb / counted[104].total - 1.0) < 1e-9);
  db.close();
}

console.log("\n=== dormancy — TS date mirror of every dormant_days ===");
{
  const d = SQL_DF_FRAUD_B[2];
  const db = buildDb(d);
  const days = (a: string, b: string) =>
    (Date.UTC(Number(a.slice(0, 4)), Number(a.slice(5, 7)) - 1, Number(a.slice(8, 10)))
      - Date.UTC(Number(b.slice(0, 4)), Number(b.slice(5, 7)) - 1, Number(b.slice(8, 10)))) / 86400000;
  ok("TS date mirror: 2026-09-01 minus 2026-04-30 = 124", days("2026-09-01", "2026-04-30") === 124);
  ok("TS date mirror: 2026-09-03 minus 2026-05-18 = 108", days("2026-09-03", "2026-05-18") === 108);
  ok("TS date mirror: 2026-09-15 minus 2026-03-12 = 187", days("2026-09-15", "2026-03-12") === 187);
  ok("engine julianday diffs are exact integers on date-only strings",
    eq(runSql(db, `SELECT CAST(julianday('2026-09-01') - julianday('2026-04-30') AS INTEGER),
         CAST(julianday('2026-09-03') - julianday('2026-05-18') AS INTEGER),
         CAST(julianday('2026-09-15') - julianday('2026-03-12') AS INTEGER)`),
      [[124, 108, 187]]));
  ok("summer window scan: only account 6 holds a June-August login",
    eq(runSql(db, `SELECT DISTINCT account_id FROM logins
        WHERE login_date BETWEEN '2026-06-01' AND '2026-08-31' ORDER BY account_id ASC`), [[6]]));
  ok("prior window: accounts 4, 7, 9 have no pre-June login group",
    eq(runSql(db, `SELECT DISTINCT account_id FROM logins WHERE login_date < '2026-06-01'
        ORDER BY account_id ASC`), [[1], [2], [3], [5], [6], [8]]));
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 traps
{
  const db = buildDb(SQL_DF_FRAUD_B[0]);
  const WRONG_WINDOW = `WITH base AS (
      SELECT customer_id, AVG(1.0*amount_cents) AS mean_c,
             AVG(1.0*amount_cents*amount_cents) AS sq_mean_c
      FROM txns WHERE txn_date <= '2026-09-30' GROUP BY customer_id)
    SELECT t.txn_id, t.customer_id, t.amount_cents,
           ROUND(b.mean_c, 2) AS baseline_mean_cents,
           ROUND(sqrt(b.sq_mean_c - b.mean_c*b.mean_c), 2) AS sigma_cents,
           ROUND((t.amount_cents - b.mean_c)/sqrt(b.sq_mean_c - b.mean_c*b.mean_c), 2) AS z_score
    FROM txns t JOIN base b ON b.customer_id = t.customer_id
    WHERE t.txn_date BETWEEN '2026-09-01' AND '2026-09-30'
      AND sqrt(b.sq_mean_c - b.mean_c*b.mean_c) > 0
      AND (t.amount_cents - b.mean_c)/sqrt(b.sq_mean_c - b.mean_c*b.mean_c) > 3.0
    ORDER BY z_score DESC, t.txn_id ASC`;
  ok("D1 wrong-window baseline (September included) flags NOTHING — c21's own 89000 deflates its z to 2.33",
    eq(runSql(db, WRONG_WINDOW), []), JSON.stringify(runSql(db, WRONG_WINDOW)));
  const TWO_SIDED = SQL_DF_FRAUD_B[0].code.replace(
    "AND (amount_cents - mean_c) / sigma_c > 3.0",
    "AND abs((amount_cents - mean_c) / sigma_c) > 3.0");
  ok("D1 two-sided |z| ships a 4th row: c25's 30000 at −38.35 sigmas BELOW its 80000 norm",
    eq(runSql(db, TWO_SIDED),
      [[6, 21, 89000, 50000, 707.11, 55.15], [24, 24, 44300, 40000, 1414.21, 3.04],
       [25, 24, 44243, 40000, 1414.21, 3], [32, 25, 30000, 80000, 1303.84, -38.35]]),
    JSON.stringify(runSql(db, TWO_SIDED)));
  const ROUNDED_COMPARE = SQL_DF_FRAUD_B[0].code.replace(
    "AND (amount_cents - mean_c) / sigma_c > 3.0",
    "AND ROUND((amount_cents - mean_c) / sigma_c, 2) > 3.0");
  ok("D1 rounding BEFORE the comparison drops the raw-3.00025 row (its display 3.0 fails 3.0 > 3.0): 2 rows",
    eq(runSql(db, ROUNDED_COMPARE),
      [[6, 21, 89000, 50000, 707.11, 55.15], [24, 24, 44300, 40000, 1414.21, 3.04]]),
    JSON.stringify(runSql(db, ROUNDED_COMPARE)));
  const SAMPLE = `WITH base AS (
      SELECT customer_id,
             AVG(1.0*amount_cents) AS mean_c,
             (SUM(1.0*amount_cents*amount_cents) - SUM(1.0*amount_cents)*AVG(1.0*amount_cents)) / (COUNT(*) - 1) AS var_c
      FROM txns WHERE txn_date BETWEEN '2026-06-01' AND '2026-08-31' GROUP BY customer_id)
    SELECT t.txn_id, t.customer_id, t.amount_cents,
           ROUND(b.mean_c, 2) AS baseline_mean_cents,
           ROUND(sqrt(b.var_c), 2) AS sigma_cents,
           ROUND((t.amount_cents - b.mean_c)/sqrt(b.var_c), 2) AS z_score
    FROM txns t JOIN base b ON b.customer_id = t.customer_id
    WHERE t.txn_date BETWEEN '2026-09-01' AND '2026-09-30'
      AND b.var_c > 0 AND (t.amount_cents - b.mean_c)/sqrt(b.var_c) > 3.0
    ORDER BY z_score DESC, t.txn_id ASC`;
  ok("D1 sample sigma (n−1) keeps only c21 — at 790.57 / 49.33 — and drops all three of c24's rows",
    eq(runSql(db, SAMPLE), [[6, 21, 89000, 50000, 790.57, 49.33]]),
    JSON.stringify(runSql(db, SAMPLE)));
  const NO_GUARD = SQL_DF_FRAUD_B[0].code.replace("WHERE sigma_c > 0\n  AND (amount_cents", "WHERE (amount_cents");
  ok("D1 dropping the sigma > 0 guard HAPPENS TO AGREE on this engine — 75000/0 returns NULL and NULL > 3.0 is not true, so c23 vanishes identically; the guard stays the stated contract",
    eq(runSql(db, NO_GUARD), [[6, 21, 89000, 50000, 707.11, 55.15], [24, 24, 44300, 40000, 1414.21, 3.04], [25, 24, 44243, 40000, 1414.21, 3]]),
    JSON.stringify(runSql(db, NO_GUARD)));
  db.close();
}

// D2 traps
{
  const db = buildDb(SQL_DF_FRAUD_B[1]);
  const NAIVE = `WITH counted AS (
      SELECT merchant_id, COUNT(*) AS txn_count,
             SUM(CASE WHEN status = 'chargeback' THEN 1 ELSE 0 END) AS chargeback_count
      FROM merchant_txns
      GROUP BY merchant_id
      HAVING 100.0 * SUM(CASE WHEN status = 'chargeback' THEN 1 ELSE 0 END) / COUNT(*) > 1.0)
    SELECT merchant_id, txn_count, chargeback_count,
           ROUND(100.0 * chargeback_count / txn_count, 2) AS chargeback_rate_pct
    FROM counted
    ORDER BY chargeback_rate_pct DESC, merchant_id ASC`;
  ok("D2 refunds in the denominator: 105 reads 2.0 not 5.0 and 106 vanishes (1 of 159 = 0.63) — 3 rows",
    eq(runSql(db, NAIVE), [[101, 150, 3, 2], [103, 50, 1, 2], [105, 100, 2, 2]]),
    JSON.stringify(runSql(db, NAIVE)));
  const GTE = SQL_DF_FRAUD_B[1].code.replace("> 1.0", ">= 1.0");
  ok("D2 >= instead of > leaks merchant 104's exactly-1.0 in as a 5th row behind 106",
    eq(runSql(db, GTE),
      [[105, 40, 2, 5], [101, 150, 3, 2], [103, 50, 1, 2], [106, 99, 1, 1.01], [104, 200, 2, 1]]),
    JSON.stringify(runSql(db, GTE)));
  const SETTLED_ONLY = `WITH counted AS (
      SELECT merchant_id,
             SUM(CASE WHEN status = 'chargeback' THEN 1 ELSE 0 END) AS chargeback_count,
             SUM(CASE WHEN status = 'settled' THEN 1 ELSE 0 END) AS txn_count
      FROM merchant_txns
      GROUP BY merchant_id)
    SELECT merchant_id, txn_count, chargeback_count,
           ROUND(100.0 * chargeback_count / txn_count, 2) AS chargeback_rate_pct
    FROM counted
    WHERE 100.0 * chargeback_count / txn_count > 1.0
    ORDER BY chargeback_rate_pct DESC, merchant_id ASC`;
  ok("D2 settled-only denominator: 5 rows, rates 5.26/2.04/2.04/1.02/1.01 — 104's 1.0 becomes 1.0101 and crosses the wall",
    eq(runSql(db, SETTLED_ONLY),
      [[105, 38, 2, 5.26], [101, 147, 3, 2.04], [103, 49, 1, 2.04], [106, 98, 1, 1.02], [104, 198, 2, 1.01]]),
    JSON.stringify(runSql(db, SETTLED_ONLY)));
  const TIE_DESC = SQL_DF_FRAUD_B[1].code.replace("merchant_id ASC;", "merchant_id DESC;");
  ok("D2 reversed tiebreak flips the 101/103 tie — 103 ships first: the ASC key is part of the contract",
    eq(runSql(db, TIE_DESC),
      [[105, 40, 2, 5], [103, 50, 1, 2], [101, 150, 3, 2], [106, 99, 1, 1.01]]),
    JSON.stringify(runSql(db, TIE_DESC)));
  const ROUNDED_GATE = SQL_DF_FRAUD_B[1].code.replace(
    "HAVING 100.0 * SUM(CASE WHEN status = 'chargeback' THEN 1 ELSE 0 END) / COUNT(*) > 1.0",
    "HAVING ROUND(100.0 * SUM(CASE WHEN status = 'chargeback' THEN 1 ELSE 0 END) / COUNT(*), 2) > 1.0");
  ok("D2 rounding inside the HAVING HAPPENS TO AGREE on this seed — no raw rate sits in the 1.0-to-1.005 seam (a 3-in-299 merchant would flip); the raw gate stays the contract",
    eq(runSql(db, ROUNDED_GATE), [[105, 40, 2, 5], [101, 150, 3, 2], [103, 50, 1, 2], [106, 99, 1, 1.01]]),
    JSON.stringify(runSql(db, ROUNDED_GATE)));
  db.close();
}

// D3 traps
{
  const d = SQL_DF_FRAUD_B[2];
  const db = buildDb(d);
  const INNER = d.code.replace("LEFT JOIN prior p", "JOIN prior p");
  ok("D3 INNER JOIN to the prior aggregate drops the never-logged account 4: 3 rows",
    eq(runSql(db, INNER),
      [[2, 0, "2026-04-30", "2026-09-01", 124], [1, 0, "2026-05-18", "2026-09-03", 108], [3, 0, "2026-03-12", "2026-09-15", 187]]),
    JSON.stringify(runSql(db, INNER)));
  const INVERTED = d.code.replace("AND NOT EXISTS", "AND EXISTS");
  ok("D3 EXISTS instead of NOT EXISTS inverts the dormancy check: only summer-active account 6 survives, at 151 days",
    eq(runSql(db, INVERTED), [[6, 0, "2026-04-14", "2026-09-12", 151]]),
    JSON.stringify(runSql(db, INVERTED)));
  const NO_KYC = d.code.replace("a.kyc_verified = 0", "1 = 1");
  ok("D3 dropping the kyc gate leaks verified accounts 5 (127 days) and 7 (NULL prior): 6 rows",
    eq(runSql(db, NO_KYC),
      [[2, 0, "2026-04-30", "2026-09-01", 124], [1, 0, "2026-05-18", "2026-09-03", 108],
       [5, 1, "2026-05-05", "2026-09-09", 127], [3, 0, "2026-03-12", "2026-09-15", 187],
       [4, 0, null, "2026-09-20", null], [7, 1, null, "2026-09-25", null]]),
    JSON.stringify(runSql(db, NO_KYC)));
  const NO_OPENED = d.code.replace("  AND a.opened_date < '2026-06-01'", "");
  ok("D3 dropping the opened-date guard leaks the September opening 9 (never dormant, two logins): 5 rows",
    eq(runSql(db, NO_OPENED),
      [[2, 0, "2026-04-30", "2026-09-01", 124], [1, 0, "2026-05-18", "2026-09-03", 108],
       [9, 0, null, "2026-09-06", null], [3, 0, "2026-03-12", "2026-09-15", 187],
       [4, 0, null, "2026-09-20", null]]),
    JSON.stringify(runSql(db, NO_OPENED)));
  const MAX_REACT = d.code.replace("MIN(login_date) AS reactivation_date", "MAX(login_date) AS reactivation_date");
  ok("D3 MAX instead of MIN for reactivation: account 2 reads 09-08/131 and account 4 reads 09-26 — the order reshuffles",
    eq(runSql(db, MAX_REACT),
      [[1, 0, "2026-05-18", "2026-09-03", 108], [2, 0, "2026-04-30", "2026-09-08", 131],
       [3, 0, "2026-03-12", "2026-09-15", 187], [4, 0, null, "2026-09-26", null]]),
    JSON.stringify(runSql(db, MAX_REACT)));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_FRAUD_B.length}/3`);
