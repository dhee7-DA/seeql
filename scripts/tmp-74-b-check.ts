// Task 74-b self-check — sql-df-bank-b.ts (3 banking dives with domain primers).
// bun scripts/tmp-74-b-check.ts
import { Database } from "bun:sqlite";
import { splitStatements, countStatements } from "../src/lib/sql-statements";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL_DF_BANK_B } from "../src/lib/leetcode/content/sql-df-bank-b";
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
    out.push(p.hook, p.where, ...p.concept, ...p.worked, ...p.reallife,
      ...p.glossary.flatMap((g) => [g.term, g.def]));
  }
  return out;
};
const proseStrings = (d: LcSqlDive): string[] => {
  const out: string[] =
    [d.statement, d.approach, d.time, d.space,
      ...d.examples.flatMap((e) => [e.input, e.output, e.explanation ?? ""]),
      ...d.constraints, ...d.breakdown, ...d.edges, ...d.walkthrough,
      ...d.followUps ?? [], ...d.ladder.flatMap((r) => [r.title, r.body]),
      ...(d.schema.tables ?? []).map((t) => t.note)];
  if (d.primer) {
    const p = d.primer;
    out.push(p.hook, p.where, ...p.concept, ...p.worked, ...p.reallife);
  }
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
// Pinned output contracts (hand-derived from the seeds, confirmed by the engine).
const SPEC: Array<{
  slug: string; id: number; difficulty: "Easy" | "Medium" | "Hard"; xp: number;
  columns: string[]; rows: unknown[][]; realColumns: string[]; intColumns: string[];
}> = [
  { slug: "expected-credit-loss", id: 8028, difficulty: "Medium", xp: 20,
    columns: ["segment_name", "loan_count", "ead_total_cents", "ecl_cents"],
    rows: [
      ["subprime", 3, 400000, 14300],
      ["near-prime", 3, 700000, 6300],
      ["prime", 4, 1200000, 2400],
    ],
    realColumns: [], intColumns: ["loan_count", "ead_total_cents", "ecl_cents"] },
  { slug: "risk-based-pricing", id: 8029, difficulty: "Medium", xp: 20,
    columns: ["applicant_id", "applicant_name", "credit_score", "apr_pct", "price_source"],
    rows: [
      [1, "Dana Whitfield", 755, 7.9, "sheet"],
      [2, "Marcus Chen", 620, 12.5, "sheet"],
      [3, "Priya Natarajan", 719, 9.2, "sheet"],
      [4, "Elena Rossi", 680, 6.4, "override"],
      [5, "Tom Okafor", 780, 21.9, "override"],
      [6, "Jack Alvarez", 540, 14.4, "sheet"],
      [7, "Mei Lin", 810, 5.8, "sheet"],
    ],
    realColumns: ["apr_pct"], intColumns: ["applicant_id", "credit_score"] },
  { slug: "prepayment-detection", id: 8030, difficulty: "Hard", xp: 35,
    columns: ["loan_id", "term_months", "months_taken", "actual_interest_cents", "scheduled_interest_cents", "savings_cents"],
    rows: [
      [1, 12, 12, 3932, 3932, 0],
      [2, 6, 5, 2013, 2115, 102],
      [3, 6, 3, 1503, 2105, 602],
    ],
    realColumns: [], intColumns: ["loan_id", "term_months", "months_taken", "actual_interest_cents", "scheduled_interest_cents", "savings_cents"] },
];
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };

// related slugs may ONLY come from the brief's 12-slug pool.
const RELATED_POOL = new Set([
  "loan-amortization-schedule", "delinquency-buckets", "daily-balance-interest",
  "fx-exposure-report", "portfolio-weights", "settlement-fails-aging",
  "realized-pnl-average-cost", "gl-reconciliation", "duplicate-charge-pairs",
  "npv-queries", "calculate-product-final-price", "bank-account-summary-ii",
]);
const LC_SLUGS = new Set(LC_ALL.map((p) => p.slug));

console.log(`\n=== sql-df-bank-b.ts — ${SQL_DF_BANK_B.length} dives expected ===\n`);
ok("file exports exactly 3 dives in spec order",
  SQL_DF_BANK_B.length === 3 && SPEC.every((s, i) => SQL_DF_BANK_B[i]?.slug === s.slug),
  SQL_DF_BANK_B.map((d) => d.slug).join(" | "));

for (let i = 0; i < SPEC.length; i++) {
  const d = SQL_DF_BANK_B[i];
  const spec = SPEC[i];
  console.log(`\n--- dive ${i + 1}: ${d.slug} ---`);

  // statement count + result-level ORDER BY + read-only
  ok("exactly ONE statement (countStatements)", countStatements(d.code) === 1);
  ok("exactly ONE statement (splitStatements)", splitStatements(d.code).length === 1);
  const stripped = stripOver(stripComments(d.code));
  ok("result-level ORDER BY after stripping comments/OVER spans", /order\s+by/i.test(stripped));
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
  ok("exactly 3 related slugs", d.related?.length === 3, String(d.related?.length));
  d.related?.forEach((r) => {
    ok(`related slug from the brief's pool: ${r}`, RELATED_POOL.has(r));
    ok(`related slug exists in the registry: ${r}`, LC_SLUGS.has(r));
  });
  ok(`schema.tables has one entry per DDL table (${tableCount(d.schema.ddl)})`,
    (d.schema.tables?.length ?? 0) === tableCount(d.schema.ddl));

  // PRIMER audits (new in batch 3)
  const p = d.primer;
  ok("primer present", !!p);
  if (p) {
    const hc = sentenceCount(p.hook);
    ok(`primer hook is exactly 1 sentence (got ${hc})`, hc === 1);
    ok(`primer concept has 3-4 paragraphs (got ${p.concept.length})`, p.concept.length >= 3 && p.concept.length <= 4);
    p.concept.forEach((c, j) =>
      ok(`primer concept para ${j + 1} has >= 3 sentences (got ${sentenceCount(c)})`, sentenceCount(c) >= 3));
    ok(`primer worked has 3-5 steps (got ${p.worked.length})`, p.worked.length >= 3 && p.worked.length <= 5);
    p.worked.forEach((w, j) =>
      ok(`primer worked step ${j + 1} is a full sentence`, w.trim().length > 0 && sentenceCount(w) >= 1));
    ok(`primer glossary has 4-6 entries (got ${p.glossary.length})`, p.glossary.length >= 4 && p.glossary.length <= 6);
    p.glossary.forEach((g, j) => {
      const words = g.def.trim().split(/\s+/).length;
      ok(`primer glossary ${j + 1} '${g.term}' def >= 5 words (got ${words})`, g.term.trim().length > 0 && words >= 5);
    });
    ok(`primer reallife has 2-3 paragraphs (got ${p.reallife.length})`, p.reallife.length >= 2 && p.reallife.length <= 3);
    p.reallife.forEach((r, j) =>
      ok(`primer reallife para ${j + 1} has >= 3 sentences (got ${sentenceCount(r)})`, sentenceCount(r) >= 3));
    ok("primer where is nonempty", p.where.trim().length > 0);
  }

  // hygiene: backticks / ${ / platform mention / e.g.-i.e. in any dive string
  const strs = allStrings(d);
  ok("no backticks in any string", strs.every((s) => !s.includes("`")));
  ok("no ${ in any string", strs.every((s) => !s.includes("${")));
  ok("no platform mention in any string",
    strs.every((s) => !/leetcode|hackerrank|datalemur|stratascratch/i.test(s)));
  ok('no "e.g."/"i.e." in prose (sentence heuristic safety)',
    proseStrings(d).every((s) => !/\be\.g\.|\bi\.e\./i.test(s)));

  // MONEY convention: money columns (name ending _cents/_minor) are INTEGER in
  // the DDL and declared-integer in the contract; REAL is reserved for rates.
  // Dive 2 is a rate-table problem with NO money columns — it must declare none
  // and output none (documented adaptation of the b3/money check).
  const moneyOut = spec.columns.filter((c) => /(_cents|_minor)$/.test(c));
  ok("every *_cents/_minor output column is declared integer", moneyOut.every((c) => spec.intColumns.includes(c)));
  const ddlMoney = (d.schema.ddl.match(/^\s*(\w+_cents|\w+_minor)\s+(\w+)/gim) ?? [])
    .map((m) => m.trim().split(/\s+/));
  if (ddlMoney.length === 0) {
    ok("no *_cents/_minor DDL columns and none in the output (rate-only schema)", moneyOut.length === 0);
  } else {
    ok(`every *_cents/_minor DDL column is INTEGER (${ddlMoney.length} money columns)`,
      ddlMoney.every((pair) => pair[1] === "INTEGER"), JSON.stringify(ddlMoney));
  }
  ok("declared REAL columns appear in the output", spec.realColumns.every((c) => spec.columns.includes(c)));

  // registry tuple: STRICT whenever the row is wired; PEND while the lead owes wiring
  const regRow = LC_ALL.find((row) => row.slug === spec.slug);
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
console.log("\n=== expected-credit-loss — hand re-pricing from the raw seed ===");
{
  const d = SQL_DF_BANK_B[0];
  const db = buildDb(d);
  const segs = runSql(db, `SELECT segment_id, segment_name, pd_pct, lgd_pct FROM segments ORDER BY segment_id ASC`);
  const loans = runSql(db, `SELECT segment_id, ead_cents FROM loans ORDER BY loan_id ASC`);
  const hand = segs.map(([sid, , pd, lgd]) => {
    const eads = loans.filter((l) => l[0] === sid).map((l) => l[1] as number);
    const sum = eads.reduce((acc, e) => acc + (e as number) * (pd as number) / 100.0 * (lgd as number) / 100.0, 0);
    return { n: eads.length, ead: eads.reduce((a, b) => a + (b as number), 0), sum };
  });
  ok("hand loan counts 4 / 3 / 3", hand.map((h) => h.n).join("/") === "4/3/3", JSON.stringify(hand.map((h) => h.n)));
  ok("hand EAD totals 1200000 / 700000 / 400000",
    eq(hand.map((h) => h.ead), [1200000, 700000, 400000]), JSON.stringify(hand.map((h) => h.ead)));
  ok("hand ECL sums within 1e-9 of 2400 / 6300 / 14300",
    hand.every((h, i) => Math.abs(h.sum - [2400, 6300, 14300][i]) < 1e-9), JSON.stringify(hand.map((h) => h.sum)));
  ok("hand ECL sums ROUND to 2400 / 6300 / 14300",
    hand.every((h, i) => Math.round(h.sum) === [2400, 6300, 14300][i]), JSON.stringify(hand.map((h) => Math.round(h.sum))));
  const p2 = (loans[1][1] as number) * 0.5 / 100.0 * 40.0 / 100.0;
  const p3 = (loans[2][1] as number) * 0.5 / 100.0 * 40.0 / 100.0;
  ok("prime tails are the exact halves 799.5 and 500.5", p2 === 799.5 && p3 === 500.5, `${p2} / ${p3}`);
  ok("per-loan-rounded prime book reads 2401 in TS too (1000+800+501+100)",
    [loans[0], loans[1], loans[2], loans[3]]
      .map((l) => Math.round((l[1] as number) * 0.5 / 100.0 * 40.0 / 100.0))
      .reduce((a, b) => a + b, 0) === 2401);
  db.close();
}

console.log("\n=== risk-based-pricing — tier membership + boundary facts ===");
{
  const d = SQL_DF_BANK_B[1];
  const db = buildDb(d);
  const sheet = runSql(db, `SELECT a.applicant_id, t.apr_pct FROM applicants a
      JOIN rate_tiers t ON t.product = a.product
        AND a.credit_score BETWEEN t.score_min AND t.score_max
      ORDER BY a.applicant_id ASC`);
  ok("sheet lookup prices all 7 (7.9 / 12.5 / 9.2 / 12.5 / 7.9 / 14.4 / 5.8)",
    eq(sheet, [[1, 7.9], [2, 12.5], [3, 9.2], [4, 12.5], [5, 7.9], [6, 14.4], [7, 5.8]]), JSON.stringify(sheet));
  const multi = runSql(db, `SELECT a.applicant_id, COUNT(*) AS c FROM applicants a
      JOIN rate_tiers t ON t.product = a.product
        AND a.credit_score BETWEEN t.score_min AND t.score_max
      GROUP BY a.applicant_id HAVING c <> 1`);
  ok("no applicant matches more than one band (tiers never overlap)", multi.length === 0, JSON.stringify(multi));
  const bounds = runSql(db, `SELECT a.applicant_id, t.score_min, t.score_max FROM applicants a
      JOIN rate_tiers t ON t.product = a.product
        AND a.credit_score BETWEEN t.score_min AND t.score_max
      WHERE a.applicant_id IN (2, 3) ORDER BY a.applicant_id ASC`);
  ok("Marcus (620) sits on his band's score_min and Priya (719) on its score_max",
    eq(bounds, [[2, 620, 719], [3, 620, 719]]), JSON.stringify(bounds));
  const overrides = runSql(db, `SELECT applicant_id, apr_pct FROM overrides ORDER BY applicant_id ASC`);
  ok("overrides read 4 -> 6.4 and 5 -> 21.9", eq(overrides, [[4, 6.4], [5, 21.9]]), JSON.stringify(overrides));
  const final = sheet.map(([id, apr]) => {
    const o = overrides.find((x) => x[0] === id);
    return [id, o ? o[1] : apr, o ? "override" : "sheet"];
  });
  ok("hand COALESCE reproduces the contract rows exactly", eq(final, SPEC[1].rows.map((r) => [r[0], r[3], r[4]])), JSON.stringify(final));
  db.close();
}

console.log("\n=== prepayment-detection — TS mirror of the recursive walk ===");
{
  const d = SQL_DF_BANK_B[2];
  const db = buildDb(d);
  const LOANS: Array<[number, number, number, number, number]> = [
    [1, 120000, 6.0, 10330, 12], [2, 60000, 12.0, 10370, 6], [3, 80000, 9.0, 13750, 6],
  ];
  const walk = (P: number, r: number, m: number) => {
    let bal = P, months = 0, interest = 0;
    const perMonth: number[] = [];
    do {
      const i = Math.round(bal * r / 1200.0);
      const princ = Math.min(m - i, bal);
      bal -= princ;
      months++; interest += i; perMonth.push(i);
    } while (bal > 0);
    return { months, interest, perMonth, endBal: bal };
  };
  const walks = LOANS.map(([id, P, r, m, term]) => ({ id, term, ...walk(P, r, m) }));
  ok("loan 1 closes at EXACTLY month 12 with ending balance 0",
    walks[0].months === 12 && walks[0].endBal === 0, JSON.stringify(walks[0]));
  ok("scheduled months read 12 / 6 / 6", eq(walks.map((w) => w.months), [12, 6, 6]), JSON.stringify(walks.map((w) => w.months)));
  ok("scheduled interest reads 3932 / 2115 / 2105", eq(walks.map((w) => w.interest), [3932, 2115, 2105]), JSON.stringify(walks.map((w) => w.interest)));
  ok("loan 1 interest sequence starts 600, 551, 502 and ends 51 (engine order)",
    walks[0].perMonth[0] === 600 && walks[0].perMonth[1] === 551 && walks[0].perMonth[2] === 502
      && walks[0].perMonth[11] === 51, JSON.stringify(walks[0].perMonth));
  const actual = runSql(db, `SELECT loan_id, COUNT(*), SUM(paid_cents) FROM payments GROUP BY loan_id ORDER BY loan_id ASC`);
  ok("payments aggregate reads (1, 12, 123932), (2, 5, 62013), (3, 3, 81503)",
    eq(actual, [[1, 12, 123932], [2, 5, 62013], [3, 3, 81503]]), JSON.stringify(actual));
  const actualInterest = actual.map(([id, , paid]) => (paid as number) - LOANS[(id as number) - 1][1]);
  ok("actual interest reads 3932 / 2013 / 1503", eq(actualInterest, [3932, 2013, 1503]), JSON.stringify(actualInterest));
  ok("months_taken < term_months for both prepaying loans",
    actual.every(([id, n]) => (n as number) < LOANS[(id as number) - 1][4] || (id as number) === 1));
  const savings = walks.map((w, i) => w.interest - actualInterest[i]);
  ok("savings reads 0 / 102 / 602", eq(savings, [0, 102, 602]), JSON.stringify(savings));
  ok("savings equals the surrendered months' interest (walk slice per loan)",
    walks.every((w, i) =>
      w.perMonth.slice(actual[i][1] as number).reduce((a, b) => a + b, 0) === savings[i]),
    JSON.stringify(walks.map((w) => w.perMonth)));
  db.close();
}

/* ---------- planted-trap probes: the WRONG queries must produce the documented wrong outputs ---------- */
console.log("\n=== planted-trap probes ===");

// D1 traps
{
  const db = buildDb(SQL_DF_BANK_B[0]);
  ok("D1 whole-book SUM then per-segment rate (product of sums at the wrong grain): 4600 / 20700 / 82225",
    eq(runSql(db, `WITH book AS (SELECT SUM(ead_cents) AS total_ead FROM loans)
        SELECT s.segment_name,
          CAST(ROUND((SELECT total_ead FROM book) * s.pd_pct / 100.0 * s.lgd_pct / 100.0) AS INTEGER) AS wrong_ecl
        FROM segments s ORDER BY s.segment_name ASC`),
      [["near-prime", 20700], ["prime", 4600], ["subprime", 82225]]));
  ok("D1 unweighted blended average rate on the whole book: 35842, not the true 23000",
    eq(runSql(db, `WITH seg AS (SELECT pd_pct / 100.0 * lgd_pct / 100.0 AS f FROM segments)
        SELECT CAST(ROUND((SELECT SUM(ead_cents) FROM loans) * (SELECT AVG(f) FROM seg)) AS INTEGER) AS wrong_ecl`),
      [[35842]]));
  ok("D1 per-loan ROUND before the SUM drifts prime to 2401 (+1 phantom cent), others unchanged",
    eq(runSql(db, `SELECT s.segment_name,
          CAST(ROUND(SUM(CAST(ROUND(1.0 * l.ead_cents * s.pd_pct / 100.0 * s.lgd_pct / 100.0) AS INTEGER))) AS INTEGER) AS wrong_ecl,
          SUM(l.ead_cents) AS ead_total_cents
        FROM segments s LEFT JOIN loans l ON l.segment_id = s.segment_id
        GROUP BY s.segment_id, s.segment_name
        ORDER BY s.segment_name ASC`),
      [["near-prime", 6300, 700000], ["prime", 2401, 1200000], ["subprime", 14300, 400000]]));
  ok("D1 dropping one /100 division inflates 100x: 240000 / 630000 / 1430000",
    eq(runSql(db, `SELECT s.segment_name,
          CAST(ROUND(SUM(1.0 * l.ead_cents * s.pd_pct / 100.0 * s.lgd_pct)) AS INTEGER) AS wrong_ecl
        FROM segments s JOIN loans l ON l.segment_id = s.segment_id
        GROUP BY s.segment_id, s.segment_name ORDER BY s.segment_name ASC`),
      [["near-prime", 630000], ["prime", 240000], ["subprime", 1430000]]));
  db.close();
}

// D2 traps
{
  const db = buildDb(SQL_DF_BANK_B[1]);
  ok("D2 sheet-wins COALESCE misprices both overrides: Elena 12.5, Tom 7.9 (labels still say override)",
    eq(runSql(db, `SELECT a.applicant_id, a.applicant_name, a.credit_score,
          COALESCE(t.apr_pct, o.apr_pct) AS apr_pct,
          CASE WHEN o.applicant_id IS NOT NULL THEN 'override' ELSE 'sheet' END AS price_source
        FROM applicants a
        LEFT JOIN rate_tiers t ON t.product = a.product
          AND a.credit_score BETWEEN t.score_min AND t.score_max
        LEFT JOIN overrides o ON o.applicant_id = a.applicant_id
        ORDER BY a.applicant_id ASC`),
      [[1, "Dana Whitfield", 755, 7.9, "sheet"], [2, "Marcus Chen", 620, 12.5, "sheet"],
       [3, "Priya Natarajan", 719, 9.2, "sheet"], [4, "Elena Rossi", 680, 12.5, "override"],
       [5, "Tom Okafor", 780, 7.9, "override"], [6, "Jack Alvarez", 540, 14.4, "sheet"],
       [7, "Mei Lin", 810, 5.8, "sheet"]]));
  ok("D2 dropping the score_max guard fans out to 16 rows — 620 reads the 619 band's 18.9 BESIDES its own 12.5",
    (() => {
      const rows = runSql(db, `SELECT a.applicant_id, t.apr_pct FROM applicants a
          JOIN rate_tiers t ON t.product = a.product AND a.credit_score >= t.score_min
          ORDER BY a.applicant_id ASC, t.apr_pct ASC`);
      const six20 = rows.filter((r) => r[0] === 2);
      return rows.length === 16 && eq(six20, [[2, 12.5], [2, 18.9]]);
    })());
  ok("D2 both bounds exclusive leaves Marcus AND Priya bandless (-1 sentinel) at exactly 620 / 719",
    eq(runSql(db, `SELECT a.applicant_id, COALESCE(t.apr_pct, -1) AS apr FROM applicants a
        LEFT JOIN rate_tiers t ON t.product = a.product
          AND a.credit_score > t.score_min AND a.credit_score < t.score_max
        ORDER BY a.applicant_id ASC`),
      [[1, 7.9], [2, -1], [3, -1], [4, 12.5], [5, 7.9], [6, 14.4], [7, 5.8]]));
  ok("D2 INNER join on tiers HAPPENS TO AGREE on the shipped seed (7 rows — every score lands in coverage)",
    eq(runSql(db, `SELECT a.applicant_id FROM applicants a
        JOIN rate_tiers t ON t.product = a.product
          AND a.credit_score BETWEEN t.score_min AND t.score_max
        ORDER BY a.applicant_id ASC`),
      [[1], [2], [3], [4], [5], [6], [7]]));
  ok("D2 with a scratch 860-score applicant the INNER variant DROPS them (7 rows) while the LEFT JOIN keeps 8 with NULL apr",
    (() => {
      db.run(`INSERT INTO applicants (applicant_id, applicant_name, credit_score, product) VALUES (8, 'Ghost Thinfile', 860, 'personal')`);
      const inner = runSql(db, `SELECT a.applicant_id FROM applicants a
          JOIN rate_tiers t ON t.product = a.product
            AND a.credit_score BETWEEN t.score_min AND t.score_max
          ORDER BY a.applicant_id ASC`);
      const left = runSql(db, `SELECT a.applicant_id,
          COALESCE(o.apr_pct, t.apr_pct) AS apr_pct,
          CASE WHEN o.applicant_id IS NOT NULL THEN 'override' ELSE 'sheet' END AS price_source
        FROM applicants a
        LEFT JOIN rate_tiers t ON t.product = a.product
          AND a.credit_score BETWEEN t.score_min AND t.score_max
        LEFT JOIN overrides o ON o.applicant_id = a.applicant_id
        ORDER BY a.applicant_id ASC`);
      return inner.length === 7 && left.length === 8 && eq(left[7], [8, null, "sheet"]);
    })());
  ok("D2 INNER join on overrides ships a 2-row price list (Elena 6.4, Tom 21.9)",
    eq(runSql(db, `SELECT a.applicant_id, a.applicant_name, o.apr_pct FROM applicants a
        JOIN overrides o ON o.applicant_id = a.applicant_id ORDER BY a.applicant_id ASC`),
      [[4, "Elena Rossi", 6.4], [5, "Tom Okafor", 21.9]]));
  db.close();
}

// D3 traps
{
  const db = buildDb(SQL_DF_BANK_B[2]);
  ok("D3 flat interest on the ORIGINAL principal every month: 7200 / 3600 / 3600",
    eq(runSql(db, `SELECT loan_id,
          CAST(ROUND(principal_cents * annual_rate_pct / 1200.0) AS INTEGER) * term_months AS wrong_interest
        FROM loans ORDER BY loan_id ASC`),
      [[1, 7200], [2, 3600], [3, 3600]]));
  ok("D3 payment x term minus principal shortcut ignores per-month rounding: 3960 / 2220 / 2500",
    eq(runSql(db, `SELECT loan_id, monthly_payment_cents * term_months - principal_cents AS wrong_interest
        FROM loans ORDER BY loan_id ASC`),
      [[1, 3960], [2, 2220], [3, 2500]]));
  ok("D3 savings sign flipped reads 0 / -102 / -602",
    eq(runSql(db, `WITH RECURSIVE sched(loan_id, interest_cents, ending_balance_cents) AS (
          SELECT loan_id,
            CAST(ROUND(principal_cents * annual_rate_pct / 1200.0) AS INTEGER),
            principal_cents - MIN(monthly_payment_cents - CAST(ROUND(principal_cents * annual_rate_pct / 1200.0) AS INTEGER), principal_cents)
          FROM loans
          UNION ALL
          SELECT s.loan_id,
            CAST(ROUND(s.ending_balance_cents * l.annual_rate_pct / 1200.0) AS INTEGER),
            s.ending_balance_cents - MIN(l.monthly_payment_cents - CAST(ROUND(s.ending_balance_cents * l.annual_rate_pct / 1200.0) AS INTEGER), s.ending_balance_cents)
          FROM sched s JOIN loans l ON l.loan_id = s.loan_id
          WHERE s.ending_balance_cents > 0),
        scheduled AS (SELECT loan_id, SUM(interest_cents) AS si FROM sched GROUP BY loan_id),
        actual AS (SELECT loan_id, SUM(paid_cents) AS tp FROM payments GROUP BY loan_id)
        SELECT l.loan_id,
          (a.tp - l.principal_cents) AS actual_interest_cents,
          sc.si AS scheduled_interest_cents,
          (a.tp - l.principal_cents) - sc.si AS flipped_savings
        FROM loans l JOIN actual a ON a.loan_id = l.loan_id JOIN scheduled sc ON sc.loan_id = l.loan_id
        ORDER BY l.loan_id ASC`),
      [[1, 3932, 3932, 0], [2, 2013, 2115, -102], [3, 1503, 2105, -602]]));
  ok("D3 months_taken read from term_months reports 12 / 6 / 6 — the prepayment signal vanishes",
    eq(runSql(db, `SELECT loan_id, term_months AS months_taken FROM loans ORDER BY loan_id ASC`),
      [[1, 12], [2, 6], [3, 6]]));
  ok("D3 scheduled built FROM the payments table collapses into actual and zeroes every savings cell",
    eq(runSql(db, `SELECT l.loan_id,
          (p.tp - l.principal_cents) AS actual_interest_cents,
          ((p.tp - l.principal_cents) - (p.tp - l.principal_cents)) AS wrong_savings
        FROM loans l
        JOIN (SELECT loan_id, SUM(paid_cents) AS tp FROM payments GROUP BY loan_id) p ON p.loan_id = l.loan_id
        ORDER BY l.loan_id ASC`),
      [[1, 3932, 0], [2, 2013, 0], [3, 1503, 0]]));
  ok("D3 months_taken via MAX(month_no) HAPPENS TO AGREE (12 / 5 / 3) — payment rows run contiguously from month 1",
    eq(runSql(db, `SELECT loan_id, MAX(month_no) FROM payments GROUP BY loan_id ORDER BY loan_id ASC`),
      [[1, 12], [2, 5], [3, 3]]));
  ok("D3 walk WITHOUT the MIN cap HAPPENS TO AGREE on scheduled interest (3932 / 2115 / 2105) — the cap only bites principal",
    eq(runSql(db, `WITH RECURSIVE nocap(loan_id, interest_cents, ending_balance_cents) AS (
          SELECT loan_id,
            CAST(ROUND(principal_cents * annual_rate_pct / 1200.0) AS INTEGER),
            principal_cents - (monthly_payment_cents - CAST(ROUND(principal_cents * annual_rate_pct / 1200.0) AS INTEGER))
          FROM loans
          UNION ALL
          SELECT n.loan_id,
            CAST(ROUND(n.ending_balance_cents * l.annual_rate_pct / 1200.0) AS INTEGER),
            n.ending_balance_cents - (l.monthly_payment_cents - CAST(ROUND(n.ending_balance_cents * l.annual_rate_pct / 1200.0) AS INTEGER))
          FROM nocap n JOIN loans l ON l.loan_id = n.loan_id
          WHERE n.ending_balance_cents > 0)
        SELECT loan_id, SUM(interest_cents) FROM nocap GROUP BY loan_id ORDER BY loan_id ASC`),
      [[1, 3932], [2, 2115], [3, 2105]]));
  db.close();
}

/* ---------- report ---------- */
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (fail) { console.log("FAILURES:"); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log(`ALL CHECKS PASS ${SQL_DF_BANK_B.length}/3`);
