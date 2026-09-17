// Audit the 9 MCQ expansion banks before wiring them into the curriculum.
// Checks: counts, id sequencing/uniqueness, structure, difficulty, prompt
// duplication, banned stale-schema columns, banned phrases.
import { LESSONS } from "../src/lib/curriculum/lessons";
import { L01_EXTRA_MCQS } from "../src/lib/curriculum/lessons/mcq-banks/l01-extra";
import { L02_EXTRA_MCQS } from "../src/lib/curriculum/lessons/mcq-banks/l02-extra";
import { L03_EXTRA_MCQS } from "../src/lib/curriculum/lessons/mcq-banks/l03-extra";
import { L04_EXTRA_MCQS } from "../src/lib/curriculum/lessons/mcq-banks/l04-extra";
import { L05_EXTRA_MCQS } from "../src/lib/curriculum/lessons/mcq-banks/l05-extra";
import { L06_EXTRA_MCQS } from "../src/lib/curriculum/lessons/mcq-banks/l06-extra";
import { L07_EXTRA_MCQS } from "../src/lib/curriculum/lessons/mcq-banks/l07-extra";
import { L08_EXTRA_MCQS } from "../src/lib/curriculum/lessons/mcq-banks/l08-extra";
import { L35_EXTRA_MCQS } from "../src/lib/curriculum/lessons/mcq-banks/l35-extra";
import type { Mcq } from "../src/lib/curriculum/types";

const BANKS: Array<{ label: string; lessonNum: number; lo: number; hi: number; items: Mcq[] }> = [
  { label: "l01", lessonNum: 1, lo: 13, hi: 58, items: L01_EXTRA_MCQS },
  { label: "l02", lessonNum: 2, lo: 12, hi: 58, items: L02_EXTRA_MCQS },
  { label: "l03", lessonNum: 3, lo: 17, hi: 62, items: L03_EXTRA_MCQS },
  { label: "l04", lessonNum: 4, lo: 16, hi: 58, items: L04_EXTRA_MCQS },
  { label: "l05", lessonNum: 5, lo: 25, hi: 60, items: L05_EXTRA_MCQS },
  { label: "l06", lessonNum: 6, lo: 12, hi: 60, items: L06_EXTRA_MCQS },
  { label: "l07", lessonNum: 7, lo: 16, hi: 60, items: L07_EXTRA_MCQS },
  { label: "l08", lessonNum: 8, lo: 15, hi: 58, items: L08_EXTRA_MCQS },
  { label: "l35", lessonNum: 35, lo: 9, hi: 26, items: L35_EXTRA_MCQS },
];

const BANNED_COLUMNS = ["country", "payment_method", "reviews", "is_gift", "loyalty_tier", "lifetime_value", "signup_date", "stock_quantity", "order_date", "total_amount", "discount", "cost", "phone", "review_date"];
const BANNED_PHRASES = ["all of the above", "none of the above", "both a and b", "all the above"];
// Manually reviewed false positives: the banned word appears as English prose
// or inside a deliberately-wrong distractor that TEACHES the column is absent
// (e.g. l1-q52 "this schema has no country column"). Verified 2026-09-04.
const REVIEWED_OK = new Set(["l1-q40", "l1-q44", "l1-q52", "l2-q30", "l5-q47", "l6-q46", "l7-q38", "l35-q16"]);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

let errors = 0;
const err = (msg: string) => { errors++; console.log(`  ✗ ${msg}`); };

const seenIds = new Map<string, string>();
const seenPrompts = new Map<string, string>();

// existing lesson mcqs
for (const l of LESSONS) {
  for (const m of l.mcqs) {
    seenIds.set(m.id, `lesson-${String(l.num).padStart(2, "0")}`);
    seenPrompts.set(norm(m.prompt), m.id);
  }
}

const diffTotals = { easy: 0, medium: 0, hard: 0 };
let grand = 0;

for (const bank of BANKS) {
  console.log(`\n== bank ${bank.label} (expect ${bank.lo}..${bank.hi}) — got ${bank.items.length} items`);
  if (bank.items.length !== bank.hi - bank.lo + 1) err(`count ${bank.items.length} != ${bank.hi - bank.lo + 1}`);
  grand += bank.items.length;
  const bankPrompts = new Set<string>();
  for (let i = 0; i < bank.items.length; i++) {
    const m = bank.items[i];
    // id sequence
    const want = `l${bank.lessonNum}-q${bank.lo + i}`;
    if (m.id !== want) err(`id position ${i}: got ${m.id}, want ${want}`);
    if (seenIds.has(m.id)) err(`duplicate id ${m.id} (also in ${seenIds.get(m.id)})`);
    seenIds.set(m.id, bank.label);
    // structure
    if (m.choices.length !== 4) err(`${m.id}: ${m.choices.length} choices`);
    if (!Number.isInteger(m.answer) || m.answer < 0 || m.answer > 3) err(`${m.id}: bad answer index`);
    if (!m.why || m.why.length < 15) err(`${m.id}: why too short`);
    for (const n of m.notes ?? []) {
      if (n.choice === m.answer) err(`${m.id}: note targets the answer`);
      if (n.choice < 0 || n.choice > 3) err(`${m.id}: note choice out of range`);
      if (!n.why || n.why.length < 15) err(`${m.id}: note why too short`);
    }
    if (!(m.notes ?? []).length) err(`${m.id}: no notes`);
    // difficulty
    if (!m.difficulty) err(`${m.id}: missing difficulty`);
    else if (!["easy", "medium", "hard"].includes(m.difficulty)) err(`${m.id}: bad difficulty ${m.difficulty}`);
    else diffTotals[m.difficulty]++;
    // prompt checks
    const p = norm(m.prompt);
    if (bankPrompts.has(p)) err(`${m.id}: duplicate prompt within bank`);
    bankPrompts.add(p);
    if (seenPrompts.has(p)) err(`${m.id}: duplicate prompt of ${seenPrompts.get(p)}`);
    seenPrompts.set(p, m.id);
    // banned content
    const allText = `${m.prompt} ${m.choices.join(" ")} ${m.why} ${(m.notes ?? []).map((n) => n.why).join(" ")}`.toLowerCase();
    for (const c of BANNED_COLUMNS) {
      if (allText.includes(c) && !REVIEWED_OK.has(m.id)) err(`${m.id}: references stale-schema column "${c}"`);
    }
    for (const ph of BANNED_PHRASES) {
      if (allText.includes(ph)) err(`${m.id}: banned phrase "${ph}"`);
    }
  }
}

// per-lesson final counts
console.log("\n== per-lesson totals after wiring ==");
for (const bank of BANKS) {
  const lesson = LESSONS.find((l) => l.num === bank.lessonNum);
  const total = (lesson?.mcqs.length ?? 0) + bank.items.length;
  console.log(`  lesson ${String(bank.lessonNum).padStart(2, "0")}: ${lesson?.mcqs.length} + ${bank.items.length} = ${total}`);
}
console.log(`\ngrand total new: ${grand}`);
console.log(`M1 total after wiring: ${LESSONS.filter((l) => [1,2,3,4,5,6,7,8,35].includes(l.num)).reduce((a, l) => a + l.mcqs.length, 0) + grand}`);
console.log(`difficulty: easy ${diffTotals.easy} · medium ${diffTotals.medium} · hard ${diffTotals.hard}`);
console.log(errors === 0 ? "\nAUDIT PASSED — 0 errors" : `\nAUDIT FAILED — ${errors} errors`);
process.exit(errors === 0 ? 0 : 1);
