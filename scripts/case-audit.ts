/// <reference types="bun-types" />
/**
 * Case-file audit — mechanically verifies case studies against the seed db.
 *
 * Per case:
 *  1. Structure: id format/uniqueness, topic/universe validity, slot count,
 *     template markers used exactly once and matching slots, distractor rules,
 *     prose-quality gates (brief/ask/walkthrough/slot-why lengths).
 *  2. Query honesty: filled SQL is a single read-only statement (Module 1
 *     topics [l-topics and cap]: no JOIN; Module 2 topics [j-topics]: JOIN
 *     required; neither allows subqueries), and executes without error on a
 *     READ-ONLY COPY of db/custom.db.
 *  3. Number slots: the claimed figure must appear in the query's result cells
 *     (unless slot.noVerify — capped at 3 per case).
 *  4. Ambiguity: every distractor substituted into every slot must either fail
 *     to execute or produce a DIFFERENT result than the correct fill. A
 *     distractor that reproduces the correct result makes the case unanswerable.
 *  5. Bank hygiene: distractors must not duplicate any slot answer.
 *
 * Usage:
 *   bun scripts/case-audit.ts                        # audit the assembled index
 *   bun scripts/case-audit.ts src/lib/curriculum/cases/cases-batch-a.ts
 *   bun scripts/case-audit.ts file1.ts file2.ts      # audit specific batches
 */
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";
import type { CaseStudy } from "../src/lib/curriculum/cases/types";
import { CASE_TOPICS, CASE_UNIVERSES } from "../src/lib/curriculum/cases/types";

const COPY = process.env.AUDIT_COPY ?? "scripts/.audit.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

// ---- load cases -----------------------------------------------------------

const args = process.argv.slice(2);
let cases: CaseStudy[] = [];
if (args.length === 0) {
  const mod = await import("../src/lib/curriculum/cases/index");
  cases = [...mod.CASES];
  // Module gauntlet banks ride the default audit too (module-end practice tiers).
  const gau = await import("../src/lib/curriculum/gauntlet");
  cases.push(...gau.ALL_GAUNTLET_CASES);
  // Keyword Mastery banks — per-keyword gap closers (audit under their topic grammar).
  const kb = await import("../src/lib/curriculum/keyword-banks");
  cases.push(...kb.ALL_KEYWORD_BANK_CASES);
  console.log(
    `Auditing assembled index: ${cases.length} cases (${mod.CASES.length} core + ${gau.ALL_GAUNTLET_CASES.length} gauntlet + ${kb.ALL_KEYWORD_BANK_CASES.length} keyword-bank)`,
  );
} else {
  for (const p of args) {
    const mod = await import(`../${p}`);
    const arr = Object.values(mod).find((v) => Array.isArray(v)) as CaseStudy[] | undefined;
    if (arr) {
      cases.push(...arr);
    } else {
      // Company kits export a CompanyKit OBJECT with a .cases array.
      const kit = Object.values(mod).find(
        (v) => v && typeof v === "object" && Array.isArray((v as { cases?: unknown }).cases),
      ) as { cases: CaseStudy[] } | undefined;
      if (!kit) {
        console.error(`FAIL loading ${p}: no exported array or kit object found`);
        process.exit(1);
      }
      cases.push(...kit.cases);
    }
  }
  console.log(`Auditing ${args.length} file(s): ${cases.length} cases`);
}

const TOPIC_IDS = new Set(CASE_TOPICS.map((t) => t.id));
const UNIVERSE_IDS = new Set(CASE_UNIVERSES.map((u) => u.id));

// ---- helpers ---------------------------------------------------------------

function fill(template: string, values: Record<number, string>): string {
  return template.replace(/\{(\d+)\}/g, (_, n) => values[Number(n)] ?? `{${n}}`);
}

function normalizeCell(c: unknown): string {
  if (c === null) return "NULL";
  if (typeof c === "number") {
    // 34833.28 -> "34833.28", 52 -> "52", 0.79 -> "0.79"
    return Number.isInteger(c) ? String(c) : String(c);
  }
  if (c instanceof Uint8Array) return "<blob>";
  return String(c);
}

function canonRows(rows: unknown[][]): string {
  return JSON.stringify(rows.map((r) => r.map(normalizeCell)));
}

function runSql(sql: string): { ok: true; rows: unknown[][] } | { ok: false; error: string } {
  try {
    const res = db.query(sql).all() as Record<string, unknown>[];
    if (res.length === 0) return { ok: true, rows: [] };
    const cols = Object.keys(res[0]);
    return { ok: true, rows: res.map((r) => cols.map((c) => r[c])) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function valueInResults(answer: string, rows: unknown[][]): boolean {
  const a = answer.trim();
  const aNum = Number(a);
  for (const row of rows) {
    for (const cell of row) {
      const s = normalizeCell(cell);
      if (s === a) return true;
      if (!Number.isNaN(aNum) && a !== "" && Number(s) === aNum) return true;
    }
  }
  return false;
}

const BRIEF_MIN = 120;
const WALK_MIN = 220;
const WHY_MIN = 40;

let passCount = 0;
let skipped = 0;
const failures: string[] = [];

// Topics outside this read-only harness's reach: writes/DDL (Task 31's write-audit
// path) and finance cases that depend on runtime-created finance tables (validated
// at play-time by the app's SQL runner).
const MUTATING_TOPICS = new Set(["w1", "w2", "w3", "w4", "w5", "wcap", "d1", "d2", "d3", "d4", "d5", "dcap", "f1", "f2", "f3", "f4", "f5", "fcap"]);

function auditCase(c: CaseStudy, seen: Map<string, string>): string[] {
  const errs: string[] = [];
  const add = (m: string) => errs.push(m);
  if (MUTATING_TOPICS.has(c.topic)) {
    add("__SKIP_MUTATING__"); // write/schema cases are verified by the write-audit path (Task 31), not this read-only harness
    return errs;
  }

  // ids
  if (!/^cs-\d{3,4}$/.test(c.id) && !/^cs-[a-z]{2,12}-\d{1,2}$/.test(c.id))
    add(`id "${c.id}" does not match cs-### or cs-<company>-<n>`);
  if (seen.has(c.id)) add(`duplicate id — also defined in ${seen.get(c.id)}`);
  else seen.set(c.id, "this audit set");
  if (!TOPIC_IDS.has(c.topic)) add(`unknown topic "${c.topic}"`);
  if (!UNIVERSE_IDS.has(c.universe)) add(`unknown universe "${c.universe}"`);
  if (!c.tier || !("easy" === c.tier || "medium" === c.tier || "hard" === c.tier))
    add(`missing/invalid tier "${(c as { tier?: string }).tier}" — must be easy | medium | hard`);

  // slots + markers
  const n = c.slots.length;
  if (n < 3 || n > 7) add(`${n} slots — must be 3..7`);
  const used = new Set<number>();
  for (const m of c.template.matchAll(/\{(\d+)\}/g)) {
    const k = Number(m[1]);
    if (used.has(k)) add(`template marker {${k}} used more than once`);
    used.add(k);
  }
  if (used.size !== n) add(`template has ${used.size} distinct markers but ${n} slots`);
  for (let i = 1; i <= n; i++) if (!used.has(i)) add(`template missing marker {${i}}`);

  // prose gates
  if (c.brief.replace(/\s+/g, " ").trim().length < BRIEF_MIN) add(`brief too thin (${c.brief.length} chars, need ${BRIEF_MIN}+)`);
  if (c.ask.trim().length < 30) add(`ask too thin (${c.ask.length} chars, need 30+)`);
  if (c.walkthrough.replace(/\s+/g, " ").trim().length < WALK_MIN) add(`walkthrough too thin (${c.walkthrough.length} chars, need ${WALK_MIN}+)`);
  c.slots.forEach((s, i) => {
    if (!s.label || s.label.trim().length < 3) add(`slot ${i + 1} label missing/too short`);
    if (!s.why || s.why.trim().length < WHY_MIN) add(`slot ${i + 1} why too thin (${(s.why ?? "").length} chars, need ${WHY_MIN}+)`);
    if (!s.answer || s.answer.trim().length === 0) add(`slot ${i + 1} empty answer`);
  });
  if (c.title.trim().length < 10) add("title too short");

  // distractor hygiene
  const answers = c.slots.map((s) => s.answer.trim());
  const dupAnswers = answers.filter((a, i) => answers.indexOf(a) !== i);
  if (dupAnswers.length) add(`duplicate slot answers: ${[...new Set(dupAnswers)].join(", ")}`);
  const dups = c.distractors.filter((d, i) => c.distractors.indexOf(d) !== i);
  if (dups.length) add(`duplicate distractors: ${dups.join(", ")}`);
  if (c.distractors.length < 2 || c.distractors.length > 6) add(`${c.distractors.length} distractors — must be 2..6`);

  // noVerify cap
  const noVerify = c.slots.filter((s) => s.noVerify).length;
  if (noVerify > 3) add(`${noVerify} noVerify slots — cap is 3`);

  // single read-only statement (M1/M2), compound/CASE-select (M3), or
  // subquery/CTE-driven (M4) — M4 queries legitimately carry several SELECTs
  // (outer + nested) and may start with WITH.
  const filledCorrect = fill(c.template, Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer])));
  if (/;/.test(filledCorrect.replace(/;\s*$/, ""))) add("template contains an internal statement separator");
  const selects = (filledCorrect.match(/\bSELECT\b/gi) ?? []).length;
  const isM2 = c.topic.startsWith("j");
  const isM79 = /^(w|d|f)/.test(c.topic); // Modules 7-9: writes, schema, finance — joins allowed
  const isM3 = c.topic.startsWith("s") || c.topic === "gm3";
  const isM4 = c.topic.startsWith("q") || c.topic === "gm4";
  const isM5 = c.topic.startsWith("t") || c.topic === "gm5";
  const isM6 = c.topic.startsWith("x");
  const hasJoin = /\bJOIN\b/i.test(filledCorrect);
  const hasSetOp = /\bUNION\b|\bINTERSECT\b|\bEXCEPT\b/i.test(filledCorrect);
  const hasCase = /\bCASE\b/i.test(filledCorrect);
  const hasSubquery = /\(\s*SELECT\b/i.test(filledCorrect);
  const hasWith = /\bWITH\b/i.test(filledCorrect);
  const hasOver = /\bOVER\s*\(/i.test(filledCorrect);
  if (isM3) {
    if (["s1", "s2", "s3", "s4", "s5"].includes(c.topic) && !hasSetOp)
      add("Module 3 set-op topic but no UNION/INTERSECT/EXCEPT — these cases must compare or combine result sets");
    if (c.topic === "gm3" && !hasSetOp && !hasCase)
      add("M3 gauntlet cases must stack sets (UNION/INTERSECT/EXCEPT) or branch with CASE");
    if (["s6", "s7", "s8"].includes(c.topic) && !hasCase)
      add("Module 3 CASE topic but no CASE keyword — these cases must branch");
    if (selects >= 2 && !hasSetOp && !hasCase)
      add(`${selects} SELECT keywords with no set operator or CASE — only compounds (UNION/INTERSECT/EXCEPT) or CASE-driven segmentation may use multiple SELECTs`);
  } else if (isM4) {
    if (["q1", "q2", "q3", "q4", "q5"].includes(c.topic) && !hasSubquery)
      add("Module 4 subquery topic but no nested (SELECT …) — these cases must embed a subquery");
    if (["q6", "q7"].includes(c.topic) && !hasWith)
      add("Module 4 CTE topic but no WITH clause — these cases must stage a CTE");
    if (c.topic === "q7" && !/\bRECURSIVE\b/i.test(filledCorrect))
      add("q7 cases must use WITH RECURSIVE");
    if (c.topic === "q8" && !hasSubquery && !hasWith)
      add("q8 capstone must embed a subquery or stage a CTE");
    if (c.topic === "gm4" && !hasSubquery && !hasWith)
      add("M4 gauntlet cases must embed a subquery or stage a CTE");
  } else if (isM5) {
    if (["t1"].includes(c.topic) && !/\b(SUBSTR|SUBSTRING|INSTR|UPPER|LOWER|LENGTH|TRIM|REPLACE|CAST)\b/i.test(filledCorrect))
      add("t1 text topic but no SUBSTR/INSTR/UPPER/LOWER/LENGTH/TRIM/REPLACE/CAST — these cases must reshape values");
    if (c.topic === "t2" && !/\b(COALESCE|IFNULL|NULLIF)\b/i.test(filledCorrect))
      add("t2 fallback topic but no COALESCE/IFNULL/NULLIF — these cases must guard NULLs");
    if (["t3", "t4"].includes(c.topic) && !/\b(STRFTIME|JULIANDAY|DATE|DATETIME)\s*\(/i.test(filledCorrect))
      add("Module 5 date topic but no date function — t3/t4 cases must slice the calendar");
    if (["t5", "t6", "t7", "t8"].includes(c.topic) && !hasOver)
      add("Module 5 window topic but no OVER() — window cases must keep every row (forced OVER())");
    if (c.topic === "t5" && !/\b(ROW_NUMBER|RANK|DENSE_RANK)\s*\(/i.test(filledCorrect))
      add("t5 cases must use ROW_NUMBER/RANK/DENSE_RANK");
    if (c.topic === "t6" && !/\bPARTITION\s+BY\b/i.test(filledCorrect))
      add("t6 cases must use PARTITION BY");
    if (c.topic === "t7" && !/\b(LAG|LEAD)\s*\(/i.test(filledCorrect))
      add("t7 cases must use LAG or LEAD");
    if (c.topic === "gm5" && !hasOver)
      add("M5 gauntlet cases must keep every row — the toolkit tier is window-first (OVER() required)");
    if (selects >= 2 && !hasSubquery && !hasWith)
      add(`${selects} SELECT keywords with no subquery or WITH — M5 window queries stage via derived tables or CTEs, not bare compounds`);
  } else if (isM6) {
    if (c.topic === "x1" && !/\bGROUP_CONCAT\s*\(/i.test(filledCorrect))
      add("x1 fold topic but no GROUP_CONCAT — these cases must fold rows into a string cell");
    if (c.topic === "x2" && !/\bFILTER\s*\(\s*WHERE\b/i.test(filledCorrect))
      add("x2 census topic but no FILTER (WHERE …) — these cases must count in one pass");
    if (c.topic === "x3") {
      if (!/\bUNION\s+ALL\b/i.test(filledCorrect))
        add("x3 stack topic but no UNION ALL — these cases must append a grand-total row");
      if (!/\bTOTAL\b/i.test(filledCorrect))
        add("x3 stack topic but no TOTAL literal — the grand row must be labelled");
    }
    if (c.topic === "x4" && !/\bRIGHT\s+(OUTER\s+)?JOIN\b/i.test(filledCorrect))
      add("x4 topic but no RIGHT JOIN");
    if (c.topic === "x5" && !/\bFULL\s+(OUTER\s+)?JOIN\b/i.test(filledCorrect))
      add("x5 topic but no FULL OUTER JOIN");
    if (c.topic === "x6" && !/\bCROSS\s+JOIN\b/i.test(filledCorrect))
      add("x6 topic but no CROSS JOIN — these cases must pair deliberately");
    if (c.topic === "x7" && (!hasJoin || !/[<>]|\bBETWEEN\b/i.test(filledCorrect)))
      add("x7 topic must join on a range (JOIN + </>/BETWEEN), not equality");
    if (c.topic === "x8" && !hasSubquery && !hasWith && !hasSetOp && !hasOver)
      add("x8 capstone must stack a clinic move (subquery/WITH/set-op/window)");
  } else {
    if (!isM79 && selects !== 1) add(`${selects} SELECT keywords — subqueries not allowed in Module 1–2 cases`);
  }
  if (isM2 && !hasJoin) add("Module 2 topic but no JOIN keyword — join cases must join");
  if (!isM2 && !isM3 && !isM4 && !isM5 && !isM6 && !isM79 && hasJoin) add("JOIN found — Module 1 cases are single-table");
  if (!/^\s*(SELECT|WITH|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i.test(filledCorrect)) add("filled query does not start with an expected statement keyword");

  // execution + number verification
  const res = runSql(filledCorrect);
  if (!res.ok) {
    add(`filled SQL fails to execute: ${res.error}`);
  } else {
    if (res.rows.length > 1000) add(`result too large (${res.rows.length} rows) — cap 1000`);
    c.slots.forEach((s, i) => {
      if (s.kind === "number" && !s.noVerify) {
        if (!valueInResults(s.answer, res.rows)) {
          add(`slot ${i + 1} (${s.label}): figure "${s.answer}" NOT found in result cells. Cells: ${canonRows(res.rows).slice(0, 400)}`);
        }
      }
    });
  }

  // ambiguity / consequence per distractor
  for (const d of c.distractors) {
    for (let i = 0; i < n; i++) {
      const values: Record<number, string> = {};
      for (let j = 0; j < n; j++) values[j + 1] = c.slots[j].answer;
      values[i + 1] = d;
      if (d === c.slots[i].answer) continue;
      const probe = fill(c.template, values);
      const pres = runSql(probe);
      if (!pres.ok) continue; // consequential (error) — good
      if (res.ok && canonRows(pres.rows) === canonRows(res.rows)) {
        add(`ambiguous: distractor "${d}" in slot ${i + 1} (${c.slots[i].label}) produces the SAME result as the correct fill`);
      }
    }
  }

  return errs;
}

const seen = new Map<string, string>();
for (const c of cases) {
  const errs = auditCase(c, seen);
  if (errs.length === 1 && errs[0] === "__SKIP_MUTATING__") {
    skipped++;
    console.log(`SKIP ${c.id}  ${c.title} (write/schema — verified by the write-audit path)`);
  } else if (errs.length === 0) {
    passCount++;
    console.log(`PASS ${c.id}  ${c.title}`);
  } else {
    failures.push(c.id);
    console.log(`FAIL ${c.id}  ${c.title}`);
    for (const e of errs) console.log(`     - ${e}`);
  }
}

console.log("\n==== SUMMARY ====");
console.log(`cases: ${cases.length}  pass: ${passCount}  skipped: ${skipped}  fail: ${cases.length - passCount - skipped}`);
const tierDist = { easy: 0, medium: 0, hard: 0 } as Record<string, number>;
for (const c of cases) if (c.tier) tierDist[c.tier]++;
console.log(`tiers: easy=${tierDist.easy} medium=${tierDist.medium} hard=${tierDist.hard}`);
if (failures.length) console.log(`failing: ${failures.join(", ")}`);

db.close();
rmSync(COPY, { force: true });
const realFailures = failures.filter((f) => !f.startsWith("__SKIP"));
process.exit(realFailures.length ? 1 : 0);
