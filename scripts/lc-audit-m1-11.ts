// Audit modules 1-11 (lesson-based curriculum): depth, integrity, cross-refs.
// Run: bun scripts/lc-audit-m1-11.ts
import { MODULES } from "../src/lib/curriculum/lessons";
import { LESSONS } from "../src/lib/curriculum/lessons";

type Issue = { mod: string; lesson: string; kind: string; detail: string };
const issues: Issue[] = [];
const push = (mod: string, lesson: string, kind: string, detail: string) =>
  issues.push({ mod, lesson, kind, detail });

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

// Real figure registry: extract keys from the FIGURES objects in diagrams*.tsx
// (FIGURE_META is derived FROM lessons, so it cannot validate them).
import { readFileSync, readdirSync } from "node:fs";
const knownFigures = new Set<string>();
{
  const dir = "src/components/learn";
  for (const f of readdirSync(dir)) {
    if (!/^diagrams.*\.tsx$/.test(f)) continue;
    const src = readFileSync(`${dir}/${f}`, "utf8");
    for (const m of src.matchAll(/["']([a-z]+\d+-[a-z0-9-]+)["']\s*:/g)) {
      knownFigures.add(m[1]);
    }
  }
}
console.log(`figure registry: ${knownFigures.size} ids`);

// XP ledger keys: every mcq/problem/fill id should be unique globally
const seenMcq = new Map<string, string>();
const seenProb = new Map<string, string>();
const seenFill = new Map<string, string>();

for (const lesson of LESSONS) {
  const mod = MODULES.find((m) => m.lessons.some((l) => l.id === lesson.id));
  const modName = mod ? `M${mod.num} ${mod.title}` : "UNATTACHED";
  const L = `${lesson.num} ${lesson.title}`;

  // 1. depth: body word count from "p"/"bullets"/"steps" blocks
  let bodyWords = 0;
  for (const b of lesson.blocks) {
    if (b.kind === "p") bodyWords += words(b.text);
    if (b.kind === "bullets" || b.kind === "steps")
      bodyWords += b.items.reduce((a, t) => a + words(t), 0);
  }
  if (bodyWords < 120)
    push(modName, L, "thin-lesson", `body only ${bodyWords} words`);

  // blocks sanity
  for (const b of lesson.blocks) {
    if (b.kind === "diagram" && !knownFigures.has(b.figure))
      push(modName, L, "unknown-figure", b.figure);
    if (b.kind === "code" && !b.sql.trim()) push(modName, L, "empty-code", "code block with no sql");
    if (b.kind === "bullets" && b.items.length === 0) push(modName, L, "empty-bullets", "0 items");
  }

  // 2. MCQ sanity
  if (lesson.mcqs.length === 0) push(modName, L, "no-mcqs", "lesson has zero quiz questions");
  for (const q of lesson.mcqs) {
    if (seenMcq.has(q.id)) push(modName, L, "dup-mcq-id", `${q.id} also in ${seenMcq.get(q.id)}`);
    seenMcq.set(q.id, L);
    if (q.answer < 0 || q.answer >= q.choices.length)
      push(modName, L, "mcq-answer-oob", `${q.id} answer=${q.answer} of ${q.choices.length}`);
    if (q.choices.length < 3) push(modName, L, "mcq-thin", `${q.id} only ${q.choices.length} choices`);
    if (!q.why || words(q.why) < 6) push(modName, L, "mcq-why-thin", q.id);
    if (words(q.prompt) < 5) push(modName, L, "mcq-prompt-thin", q.id);
    if (new Set(q.choices).size !== q.choices.length) push(modName, L, "mcq-dup-choices", q.id);
  }

  // 3. Problem (graded query) sanity
  if (lesson.problems.length === 0) push(modName, L, "no-problems", "lesson has zero graded queries");
  for (const p of lesson.problems) {
    if (seenProb.has(p.id)) push(modName, L, "dup-problem-id", `${p.id} also in ${seenProb.get(p.id)}`);
    seenProb.set(p.id, L);
    if (!p.hints || p.hints.length !== 2 || p.hints.some((h) => !h.trim()))
      push(modName, L, "problem-hints-missing", p.id);
    if (!p.expected) push(modName, L, "problem-no-expected", p.id);
    else {
      const cols = p.expected.columns?.length ?? 0;
      const rows = p.expected.rows?.length ?? 0;
      const changes = p.expected.changes;
      if (p.mutating) {
        if (changes == null && rows === 0) push(modName, L, "mutating-no-target", p.id);
      } else {
        if (cols === 0) push(modName, L, "expected-empty", p.id);
        if (rows === 0) push(modName, L, "expected-zero-rows", p.id);
      }
    }
    if (p.mistakes && p.mistakes.length > 3) push(modName, L, "too-many-mistakes", p.id);
  }

  // 4. takeaway + deep layer
  if (!lesson.takeaway) push(modName, L, "no-takeaway", "missing closing takeaway");
  if (!lesson.deep || lesson.deep.length < 2)
    push(modName, L, "no-deep", `deep layer ${lesson.deep?.length ?? 0} blocks`);

  // deep blocks sanity
  for (const d of lesson.deep ?? []) {
    if (d.kind === "diagram" && !knownFigures.has(d.figure))
      push(modName, L, "unknown-figure-deep", d.figure);
    if (d.kind === "myth" && (!d.myth.trim() || !d.truth.trim())) push(modName, L, "myth-empty", d.myth);
  }
}

// 5. module shape: every module needs >=3 lessons except M11 (intentionally 1?)
for (const m of MODULES.slice(0, 11)) {
  if (m.lessons.length < 3)
    push("SHAPE", `M${m.num} ${m.title}`, "module-light", `${m.lessons.length} lessons`);
  if (m.lessons.length >= 3 && !m.lessons.some((l) => l.blurb.toLowerCase().includes("case")))
    push("SHAPE", `M${m.num} ${m.title}`, "no-case-study", "no case-study lesson in module");
}

// 6. Fills — every fill's answers array must match template slot count
import { allFills, fillsFor } from "../src/lib/curriculum/fills";
for (const f of allFills()) {
  const slots = (f.template.match(/\{(\d+)\}/g) ?? []).length;
  const uniq = new Set(f.template.match(/\{(\d+)\}/g) ?? []).size;
  if (f.answers.length !== uniq)
    push("FILLS", f.id, "fill-slot-mismatch", `${f.answers.length} answers vs ${uniq} slots`);
  if (slots === 0) push("FILLS", f.id, "fill-no-slots", "template has no slots");
  if (f.chips.length < f.answers.length) push("FILLS", f.id, "fill-chips-short", "fewer chips than answers");
  if (seenFill.has(f.id)) push("FILLS", f.id, "dup-fill-id", `also in ${seenFill.get(f.id)}`);
  seenFill.set(f.id, "fills");
  if (!f.why || words(f.why) < 6) push("FILLS", f.id, "fill-why-thin", f.id);
}

// 6b. fills coverage per lesson (1..64)
const fillLessons = new Set<number>();
for (let n = 1; n <= 64; n++) if (fillsFor(n).length) fillLessons.add(n);
for (const lesson of LESSONS) {
  if (!fillLessons.has(lesson.num))
    push("FILLS", `${lesson.num} ${lesson.title}`, "no-fills", "lesson has zero fill drills");
}

// 7. report
const byKind = new Map<string, number>();
for (const i of issues) byKind.set(i.kind, (byKind.get(i.kind) ?? 0) + 1);
console.log("=== MODULES 1-11 AUDIT ===");
console.log(`lessons: ${LESSONS.length} · modules: ${MODULES.length}`);
console.log(`issues: ${issues.length}`);
for (const [k, n] of [...byKind.entries()].sort((a, b) => b[1] - a[1]))
  console.log(`  ${k}: ${n}`);
console.log("\n--- detail (first 80) ---");
for (const i of issues.slice(0, 130)) console.log(`[${i.kind}] ${i.lesson} — ${i.detail}`);
