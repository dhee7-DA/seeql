// M7 write-audit — the mutating-topics twin of case-audit.ts. Every write-bank
// case (topics w1/w2/w3/w5/wcap in keyword-banks/write-cases-*.ts) is checked:
//   1. Structure: id format/uniqueness, topic/universe/tier validity, 3..7
//      slots, template markers used exactly once and matching slots, prose
//      gates (brief/ask/walkthrough/slot-why/label/title lengths), distractor
//      hygiene (2..6, no dups, no answer collisions), noVerify cap 3.
//   2. Execution: the correct fill runs on a FRESH copy of the seed db and
//      must succeed (no error).
//   3. Ambiguity: every distractor substituted into every slot must either
//      ERROR or produce a DIFFERENT aftermath (changes count + table
//      fingerprints) than the correct fill — a distractor that reproduces the
//      correct write makes the case unanswerable.
// Usage: bun scripts/m7-write-audit.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";
import type { CaseStudy } from "../src/lib/curriculum/cases/types";
import { CASE_TOPICS, CASE_UNIVERSES } from "../src/lib/curriculum/cases/types";
import { ALL_KEYWORD_BANK_CASES } from "../src/lib/curriculum/keyword-banks";

const COPY = "scripts/.m7-write-audit.db";
const TARGET_TOPICS = new Set(["w1", "w2", "w3", "w5", "wcap"]);

const cases = ALL_KEYWORD_BANK_CASES.filter((c) => TARGET_TOPICS.has(c.topic));
console.log(`Auditing ${cases.length} write-bank cases (topics w1/w2/w3/w5/wcap)`);

const TOPIC_IDS = new Set(CASE_TOPICS.map((t) => t.id));
const UNIVERSE_IDS = new Set(CASE_UNIVERSES.map((u) => u.id));

function fill(template: string, values: Record<number, string>): string {
  return template.replace(/\{(\d+)\}/g, (_, n) => values[Number(n)] ?? `{${n}}`);
}

function fingerprint(db: Database, changes: number): string {
  // Full-table dump — any data difference (prices, names, references)
  // registers, not just row counts and sums.
  const rows: unknown[] = [changes];
  for (const t of ["customers", "suppliers", "products", "orders", "order_items"]) {
    rows.push(db.query(`SELECT * FROM ${t} ORDER BY id`).all());
  }
  return JSON.stringify(rows);
}

function runFill(sql: string): { ok: true; fp: string } | { ok: false; error: string } {
  copyFileSync("db/custom.db", COPY);
  const db = new Database(COPY);
  try {
    // Play-faithful: the app's prisma connection enforces foreign keys
    // (the runtime schema declares REFERENCES clauses) — so must the audit.
    db.exec("PRAGMA foreign_keys = ON");
    const before = (db.query("SELECT total_changes() AS c").get() as any).c;
    let echoed: string = "[]";
    try {
      // query().all() executes AND captures RETURNING echo rows (empty for
      // plain writes) — the echo is part of the statement's observable result.
      const res = db.query(sql).all() as Record<string, unknown>[];
      echoed = JSON.stringify(res);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message.split("\n")[0] : String(e) };
    }
    const after = (db.query("SELECT total_changes() AS c").get() as any).c;
    return { ok: true, fp: JSON.stringify([fingerprint(db, Number(after) - Number(before)), echoed]) };
  } finally {
    db.close();
  }
}

const BRIEF_MIN = 120;
const WALK_MIN = 220;
const WHY_MIN = 40;

let pass = 0;
const failures: string[] = [];
const seen = new Map<string, string>();

for (const c of cases) {
  const errs: string[] = [];
  const add = (m: string) => errs.push(m);

  // ids / registry
  if (!/^cs-\d{3,4}$/.test(c.id)) add(`id "${c.id}" does not match cs-###`);
  if (seen.has(c.id)) add(`duplicate id — also in ${seen.get(c.id)}`);
  seen.set(c.id, "this audit");
  if (!TOPIC_IDS.has(c.topic)) add(`unknown topic "${c.topic}"`);
  if (!UNIVERSE_IDS.has(c.universe)) add(`unknown universe "${c.universe}"`);
  if (!c.tier || !["easy", "medium", "hard"].includes(c.tier)) add(`bad tier "${c.tier}"`);

  // slots + markers (write-bank cases may carry 2 slots — echo-projection
  // cases read naturally at 2; ambiguity + prose gates stay fully enforced)
  const n = c.slots.length;
  if (n < 2 || n > 7) add(`${n} slots — must be 2..7`);
  const used = new Set<number>();
  for (const m of c.template.matchAll(/\{(\d+)\}/g)) {
    const k = Number(m[1]);
    if (used.has(k)) add(`marker {${k}} used more than once`);
    used.add(k);
  }
  if (used.size !== n) add(`template has ${used.size} distinct markers but ${n} slots`);
  for (let i = 1; i <= n; i++) if (!used.has(i)) add(`template missing marker {${i}}`);

  // prose gates
  if (c.brief.replace(/\s+/g, " ").trim().length < BRIEF_MIN) add(`brief too thin (${c.brief.length})`);
  if (c.ask.trim().length < 30) add(`ask too thin (${c.ask.length})`);
  if (c.walkthrough.replace(/\s+/g, " ").trim().length < WALK_MIN) add(`walkthrough too thin (${c.walkthrough.length})`);
  if (c.title.trim().length < 10) add("title too short");
  c.slots.forEach((s, i) => {
    if (!s.label || s.label.trim().length < 3) add(`slot ${i + 1} label missing/short`);
    if (!s.why || s.why.trim().length < WHY_MIN) add(`slot ${i + 1} why too thin (${(s.why ?? "").length})`);
    if (s.answer === undefined || s.answer === null) add(`slot ${i + 1} missing answer`);
  });

  // distractor hygiene (empty answers allowed as deliberate no-op scopes)
  const answers = c.slots.map((s) => (s.answer ?? "").trim());
  const dupAnswers = answers.filter((a, i) => a !== "" && answers.indexOf(a) !== i);
  if (dupAnswers.length) add(`duplicate slot answers: ${[...new Set(dupAnswers)].join(", ")}`);
  const dups = c.distractors.filter((d, i) => c.distractors.indexOf(d) !== i);
  if (dups.length) add(`duplicate distractors: ${dups.join(", ")}`);
  if (c.distractors.length < 2 || c.distractors.length > 6) add(`${c.distractors.length} distractors — must be 2..6`);
  for (const d of c.distractors) {
    if (answers.includes(d.trim()) && d.trim() !== "") add(`distractor "${d}" collides with a slot answer`);
  }
  const noVerify = c.slots.filter((s) => s.noVerify).length;
  if (noVerify > 3) add(`${noVerify} noVerify slots — cap 3`);
  if (/(?:^|[^;]);[^;\s]*\S/.test(fill(c.template, Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer]))).replace(/;\s*$/, ""))) add("internal statement separator");

  // execution + ambiguity
  const correct = fill(c.template, Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer])));
  const base = runFill(correct);
  if (!base.ok) add(`correct fill ERRORS: ${base.error}`);
  else {
    for (let i = 0; i < c.slots.length; i++) {
      for (const d of c.distractors) {
        if (d.trim() === answers[i]) continue;
        const values = Object.fromEntries(c.slots.map((s, j) => [j + 1, s.answer]));
        values[i + 1] = d;
        const tryFill = fill(c.template, values);
        const got = runFill(tryFill);
        if (got.ok && got.fp === base.fp) {
          add(`slot ${i + 1}: distractor "${d}" reproduces the correct aftermath`);
        }
      }
    }
  }

  if (errs.length === 0) pass++;
  else for (const e of errs) failures.push(`${c.id} (${c.title}): ${e}`);
}

rmSync(COPY, { force: true });
for (const f of failures) console.log(`FAIL — ${f}`);
console.log(`\n${pass}/${cases.length} write-bank cases pass · ${failures.length} failures`);
process.exit(failures.length === 0 ? 0 : 1);
