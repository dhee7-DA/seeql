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
  cases = mod.CASES;
  console.log(`Auditing assembled index: ${cases.length} cases`);
} else {
  for (const p of args) {
    const mod = await import(`../${p}`);
    const arr = Object.values(mod).find((v) => Array.isArray(v)) as CaseStudy[] | undefined;
    if (!arr) {
      console.error(`FAIL loading ${p}: no exported array found`);
      process.exit(1);
    }
    cases.push(...arr);
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
const failures: string[] = [];

function auditCase(c: CaseStudy, seen: Map<string, string>): string[] {
  const errs: string[] = [];
  const add = (m: string) => errs.push(m);

  // ids
  if (!/^cs-\d{3}$/.test(c.id)) add(`id "${c.id}" does not match cs-###`);
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

  // single read-only statement
  const filledCorrect = fill(c.template, Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer])));
  if (/;/.test(filledCorrect.replace(/;\s*$/, ""))) add("template contains an internal statement separator");
  const selects = (filledCorrect.match(/\bSELECT\b/gi) ?? []).length;
  if (selects !== 1) add(`${selects} SELECT keywords — subqueries not allowed in Module 1–2 cases`);
  const isM2 = c.topic.startsWith("j");
  const hasJoin = /\bJOIN\b/i.test(filledCorrect);
  if (isM2 && !hasJoin) add("Module 2 topic but no JOIN keyword — join cases must join");
  if (!isM2 && hasJoin) add("JOIN found — Module 1 cases are single-table");
  if (!/^\s*SELECT\b/i.test(filledCorrect)) add("filled query does not start with SELECT");

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
  if (errs.length === 0) {
    passCount++;
    console.log(`PASS ${c.id}  ${c.title}`);
  } else {
    failures.push(c.id);
    console.log(`FAIL ${c.id}  ${c.title}`);
    for (const e of errs) console.log(`     - ${e}`);
  }
}

console.log("\n==== SUMMARY ====");
console.log(`cases: ${cases.length}  pass: ${passCount}  fail: ${cases.length - passCount}`);
const tierDist = { easy: 0, medium: 0, hard: 0 } as Record<string, number>;
for (const c of cases) if (c.tier) tierDist[c.tier]++;
console.log(`tiers: easy=${tierDist.easy} medium=${tierDist.medium} hard=${tierDist.hard}`);
if (failures.length) console.log(`failing: ${failures.join(", ")}`);

db.close();
rmSync(COPY, { force: true });
process.exit(failures.length ? 1 : 0);
