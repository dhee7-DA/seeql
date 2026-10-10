// Case-file keyword-blanking pass.
//
// User directive: the structural SQL keywords in case templates must be
// blanked into numbered slots too — the learner picks EVERY word (keywords
// *and* figures) from the chip pool, not just the figures.
//
// What it does per case:
//   1. Finds static keyword occurrences in the template (longest phrase
//      first: IS NOT NULL / ORDER BY / GROUP BY / NOT IN / NOT LIKE /
//      IS NULL, then single words). String literals are masked so
//      '2024-%' etc. are never touched.
//   2. Blanks the FIRST occurrence of each keyword that is not already an
//      answer in that case. Keywords already answered (e.g. a slotted
//      HAVING) are protected everywhere — their occurrences are masked so
//      sub-word scans (NOT inside NOT IN) can never tear them apart.
//      Idempotent: re-running a fully transformed bank is a no-op.
//   3. Renumbers all slots {1}..{n} in document order, rewrites `answers`
//      to match, renumbers authored `notes`, and appends auto-coaching
//      notes for every keyword slot that has none.
//   4. Extends `chips` with the new keyword chips (dedup, original order
//      preserved).
//   5. Verifies the completed SQL is byte-identical to the original, then
//      serializes the bank back to its file (header comments preserved).
//
// Run: bunx tsx scripts/case-blank.ts

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { CaseStudy, FillNote } from "../src/lib/curriculum/types";

/* ---- vocabulary: phrases must be listed before their sub-words ---- */
const VOCAB = [
  "IS NOT NULL",
  "ORDER BY",
  "GROUP BY",
  "NOT IN",
  "NOT LIKE",
  "IS NULL",
  "SELECT",
  "DISTINCT",
  "FROM",
  "WHERE",
  "BETWEEN",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "ASC",
  "DESC",
  "COUNT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
  "LIKE",
  "AND",
  "OR",
  "NOT",
  "IN",
  "AS",
];

/** Coaching shown when a keyword slot was filled wrong (auto-generated). */
const COACH: Record<string, string> = {
  SELECT: "Every read statement opens with SELECT — it declares the columns the answer will show.",
  FROM: "FROM names the world — the one table the rows come from. It always follows the SELECT list.",
  WHERE: "WHERE is the filter gate — it keeps only the rows that pass the predicate.",
  AS: "AS renames the output column heading; the table itself never changes.",
  "ORDER BY": "ORDER BY sorts the output rows — without it, row order is whatever the engine happens to return.",
  "GROUP BY": "GROUP BY folds the rows into buckets — one output row per distinct key.",
  HAVING: "HAVING filters the folded buckets (it runs after GROUP BY); WHERE filters raw rows.",
  LIMIT: "LIMIT caps the output — only the first N sorted rows survive.",
  OFFSET: "OFFSET skips that many rows of the sorted result before the window opens.",
  DISTINCT: "DISTINCT collapses duplicate values in the output — one row per distinct value.",
  DESC: "DESC sorts highest/latest first; ASC (the default) is lowest/earliest first.",
  ASC: "ASC sorts lowest/earliest first — it is the default direction.",
  AND: "AND narrows — both predicates must pass for a row to survive.",
  OR: "OR widens — a row survives when either predicate matches.",
  IN: "IN is a compact OR against a value list — the row matches any listed value.",
  "NOT IN": "NOT IN keeps rows whose value matches nothing in the list.",
  BETWEEN: "BETWEEN is the inclusive range shorthand — both endpoints count.",
  LIKE: "LIKE pattern-matches text: % stands for any run of characters, _ for exactly one.",
  "IS NULL": "= NULL never matches anything; IS NULL is the only probe that finds the holes.",
  "IS NOT NULL": "IS NOT NULL keeps only the rows where the column actually carries a value.",
  COUNT: "COUNT(*) counts rows; COUNT(column) counts only the non-null values.",
  SUM: "SUM adds the numeric column across all rows into one total.",
  AVG: "AVG collapses the column into one mean of its non-null values.",
  MIN: "MIN returns the smallest value in the column.",
  MAX: "MAX returns the largest value in the column.",
  NOT: "NOT flips the predicate — rows that would fail now pass.",
};

function phraseRegex(phrase: string): RegExp {
  return new RegExp(`\\b${phrase.replace(/ /g, "\\s+")}\\b`, "g");
}

/** Completed SQL: substitute answers into the template. */
function completed(template: string, answers: string[]): string {
  let sql = template;
  answers.forEach((a, i) => {
    sql = sql.replace(new RegExp(`\\{${i + 1}\\}`), a);
  });
  return sql;
}

interface Target {
  start: number;
  end: number;
  answer: string;
}

function blankTargets(template: string, answers: string[]): Target[] {
  let masked = maskLiterals(template);
  const targets: Target[] = [];
  for (const phrase of VOCAB) {
    const re = phraseRegex(phrase);
    if (answers.includes(phrase)) {
      // already slotted — protect every occurrence from sub-word scans
      masked = masked.replace(re, (m) => "\u0000".repeat(m.length));
      continue;
    }
    const m = re.exec(masked);
    if (m) {
      targets.push({ start: m.index, end: m.index + m[0].length, answer: m[0] });
      // blank only the first occurrence; mask it so shorter phrases
      // processed later cannot match inside this span
      masked =
        masked.slice(0, m.index) + "\u0000".repeat(m[0].length) + masked.slice(m.index + m[0].length);
    }
  }
  return targets.sort((a, b) => a.start - b.start);
}

/** Same-length mask of string literals so keyword scans never hit them. */
function maskLiterals(template: string): string {
  return template.replace(/'(?:[^']|'')*'/g, (m) => `'${"\u0000".repeat(m.length - 2)}'`);
}

interface SlotSeg {
  start: number;
  end: number;
  /** existing slot number when set */
  old?: number;
  /** answer text for newly blanked keyword slots */
  answer?: string;
}

function transformCase(c: CaseStudy): { next: CaseStudy; changed: boolean } {
  const targets = blankTargets(c.template, c.answers);
  if (targets.length === 0) return { next: c, changed: false };

  // collect every slot position (existing {n} + new keyword targets)
  const segs: SlotSeg[] = [];
  for (const m of c.template.matchAll(/\{(\d+)\}/g)) {
    segs.push({ start: m.index, end: m.index + m[0].length, old: Number(m[1]) });
  }
  for (const t of targets) segs.push({ start: t.start, end: t.end, answer: t.answer });
  segs.sort((a, b) => a.start - b.start);

  // rebuild template with sequential slot numbers
  let out = "";
  let cursor = 0;
  let nextSlot = 0;
  const oldToNew = new Map<number, number>();
  const newSlots: Array<{ slot: number; answer: string }> = [];
  for (const seg of segs) {
    out += c.template.slice(cursor, seg.start);
    nextSlot += 1;
    out += `{${nextSlot}}`;
    if (seg.old !== undefined) oldToNew.set(seg.old, nextSlot);
    else newSlots.push({ slot: nextSlot, answer: seg.answer! });
    cursor = seg.end;
  }
  out += c.template.slice(cursor);

  // answers: existing mapped by old number, keywords inserted at their slots
  const answers = segs.map((seg) => (seg.old !== undefined ? c.answers[seg.old - 1] : seg.answer!));

  // notes: renumber authored, auto-coach keyword slots that have none
  const notes: FillNote[] = (c.notes ?? [])
    .map((n) => ({ slot: oldToNew.get(n.slot) ?? 0, why: n.why }))
    .filter((n) => n.slot > 0);
  for (const s of newSlots) {
    if (!notes.some((n) => n.slot === s.slot) && COACH[s.answer]) {
      notes.push({ slot: s.slot, why: COACH[s.answer] });
    }
  }
  notes.sort((a, b) => a.slot - b.slot);

  // chips: keep original pool order, append the new keyword chips
  const chips = [...c.chips];
  for (const s of newSlots) if (!chips.includes(s.answer)) chips.push(s.answer);

  const next: CaseStudy = {
    ...c,
    template: out,
    answers,
    chips,
    notes: notes.length > 0 ? notes : undefined,
  };
  return { next, changed: true };
}

/* ---- single-quoted TS string serializer (keeps data files house-styled) ---- */
function q(s: string): string {
  return "'" + s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n") + "'";
}

function serializeBank(cases: CaseStudy[]): string {
  const blocks = cases.map((c) => {
    const lines: string[] = ["  {"];
    lines.push(`    id: ${q(c.id)},`);
    lines.push(`    title: ${q(c.title)},`);
    lines.push(`    brief: ${q(c.brief)},`);
    lines.push(`    ask: ${q(c.ask)},`);
    lines.push(`    template: ${q(c.template)},`);
    lines.push(`    chips: [${c.chips.map(q).join(", ")}],`);
    lines.push(`    answers: [${c.answers.map(q).join(", ")}],`);
    lines.push(`    why: ${q(c.why)},`);
    if (c.notes && c.notes.length > 0) {
      lines.push("    notes: [");
      for (const n of c.notes) lines.push(`      { slot: ${n.slot}, why: ${q(n.why)} },`);
      lines.push("    ],");
    }
    if (c.difficulty) lines.push(`    difficulty: ${q(c.difficulty)},`);
    lines.push("  },");
    return lines.join("\n");
  });
  return blocks.join("\n");
}

const FILES = ["l01", "l02", "l03", "l04", "l05", "l06", "l07", "l08", "l35"];

let totalChanged = 0;
let slotsBefore = 0;
let slotsAfter = 0;
const poolDist = new Map<number, number>();
let maxPool = 0;
let invariantFails = 0;

async function main() {
for (const f of FILES) {
  const path = resolve(process.cwd(), `src/lib/curriculum/case-studies/${f}.ts`);
  const src = readFileSync(path, "utf8");

  const nameMatch = src.match(/export const (CASES_L\d+): CaseStudy\[\]/);
  if (!nameMatch) throw new Error(`cannot locate array in ${f}.ts`);
  const constName = nameMatch[1];

  const mod = (await import(`../src/lib/curriculum/case-studies/${f}.ts`)) as Record<
    string,
    CaseStudy[]
  >;
  const cases = mod[constName];

  let changed = 0;
  const nextCases: CaseStudy[] = [];
  for (const c of cases) {
    slotsBefore += c.answers.length;
    const { next, changed: ch } = transformCase(c);

    // INVARIANT: the completed SQL must be byte-identical to the original
    const before = completed(c.template, c.answers);
    const after = completed(next.template, next.answers);
    if (ch && before !== after) {
      invariantFails += 1;
      console.error(`INVARIANT FAIL ${c.id}:\n  before: ${before}\n  after:  ${after}`);
      continue; // do not write broken data
    }
    if (ch) changed += 1;
    slotsAfter += next.answers.length;
    poolDist.set(next.chips.length, (poolDist.get(next.chips.length) ?? 0) + 1);
    maxPool = Math.max(maxPool, next.chips.length);
    nextCases.push(next);
  }
  totalChanged += changed;

  // preserve header comments + import, regenerate the array body
  const headerEnd = src.indexOf("export const");
  const header = src.slice(0, headerEnd);
  const banner =
    "// SQL keywords are blanked into slots too (keyword-blank pass,\n" +
    "// scripts/case-blank.ts): every word — keyword or figure — is placed\n// from the chip pool.\n";
  const doc = `${header}${banner}export const ${constName}: CaseStudy[] = [\n${serializeBank(nextCases)}];\n`;
  writeFileSync(path, doc);
  console.log(`${f}.ts: ${changed}/${cases.length} cases transformed`);
}

console.log(`\ntotal: ${totalChanged} cases transformed`);
console.log(`slots: ${slotsBefore} -> ${slotsAfter}`);
console.log(
  "pool sizes:",
  [...poolDist.entries()].sort((a, b) => a[0] - b[0]).map(([n, k]) => `${n}:${k}`).join(" "),
);
console.log(`max pool: ${maxPool}`);
if (invariantFails > 0) {
  console.error(`${invariantFails} invariant failures — fix before committing`);
  process.exit(1);
}
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
