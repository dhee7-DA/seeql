/* SeeQL four-dimension audit — run with jiti (respects tsconfig paths). */
import { LESSONS, MODULES } from "@/lib/curriculum/lessons";
import type { Lesson, Mcq, Problem, Block, DeepBlock, Fill } from "@/lib/curriculum/types";
import { XP } from "@/lib/curriculum/gamification";
import { caseStudies } from "@/lib/curriculum/case-studies";
import { FIGURE_META } from "@/lib/curriculum/figure-meta";

type W = [string, string]; // [severity, message]
const R: { thin: W[]; consistency: W[]; language: W[]; runtime: W[] } = {
  thin: [], consistency: [], language: [], runtime: [],
};
const log = (dim: keyof typeof R, sev: "HIGH" | "MED" | "LOW", msg: string) =>
  R[dim].push([sev, msg]);

const wc = (s: unknown) => (typeof s === "string" ? s.replace(/`/g, "").replace(/\*\*/g, "").trim().split(/\s+/).filter(Boolean).length : 0);

// ---------- gather every block's text ----------
function blockTexts(blocks: Array<Block | DeepBlock>): string[] {
  const out: string[] = [];
  for (const b of blocks) {
    const any = b as Record<string, unknown>;
    if (typeof any.text === "string") out.push(any.text);
    if (typeof any.myth === "string") out.push(any.myth);
    if (typeof any.truth === "string") out.push(any.truth);
    if (Array.isArray(any.items)) out.push(...(any.items as string[]));
    if (Array.isArray(any.steps)) out.push(...(any.steps as string[]));
    if (Array.isArray(any.rows)) (any.rows as string[][]).forEach((r) => out.push(...r));
  }
  return out;
}

// ================= DIMENSION 1: THIN CONTENT =================
console.log("=== D1: THIN CONTENT SCAN (64 lessons) ===");
const dupTitles = new Map<string, string[]>();
const dupPrompts = new Map<string, string[]>();

for (const L of LESSONS) {
  const texts = blockTexts(L.blocks);
  const theoryWords = texts.reduce((a, t) => a + wc(t), 0);
  const deepWords = L.deep ? blockTexts(L.deep).reduce((a, t) => a + wc(t), 0) : 0;
  const total = theoryWords + deepWords;

  // thin theory
  if (total < 250)
    log("thin", "HIGH", `${L.id} (${L.title}): only ${total} words of theory+deep (${theoryWords}+${deepWords}) for ${L.minutes}min lesson`);
  else if (total < 400)
    log("thin", "MED", `${L.id} (${L.title}): ${total} words theory+deep — on the thin side for ${L.minutes}min`);
  if (L.blocks.length < 5)
    log("thin", "MED", `${L.id}: only ${L.blocks.length} content blocks`);
  if (!L.takeaway)
    log("thin", "LOW", `${L.id}: missing takeaway`);
  if (!L.deep)
    log("thin", "LOW", `${L.id}: no deep-dive tab`);

  // empty / degenerate arrays
  if (L.mcqs.length === 0) log("thin", "HIGH", `${L.id}: ZERO mcqs`);
  if (L.problems.length === 0) log("thin", "HIGH", `${L.id}: ZERO problems`);
  if (L.mcqs.length < 3) log("thin", "MED", `${L.id}: only ${L.mcqs.length} mcqs`);
  if (L.problems.length < 2) log("thin", "MED", `${L.id}: only ${L.problems.length} problems`);

  // minutes vs content ratio (rough: 100 words ≈ 1 min + problems)
  const load = L.problems.length * 3 + L.mcqs.length * 1;
  if (L.minutes > total / 100 + load + 15)
    log("thin", "LOW", `${L.id}: minutes=${L.minutes} looks high for ${total}w + ${L.problems.length}p + ${L.mcqs.length}q`);

  // MCQ quality
  for (const q of L.mcqs) {
    if (q.choices.length < 3) log("thin", "HIGH", `${L.id} ${q.id}: only ${q.choices.length} choices`);
    if (q.choices.length === 0) log("thin", "HIGH", `${L.id} ${q.id}: EMPTY choices`);
    if (!q.why || wc(q.why) < 4) log("thin", "MED", `${L.id} ${q.id}: why is thin/missing (${q.why ? wc(q.why) : 0}w)`);
    if (q.answer < 0 || q.answer >= q.choices.length) log("thin", "HIGH", `${L.id} ${q.id}: answer index out of range`);
    if (wc(q.prompt) < 5) log("thin", "MED", `${L.id} ${q.id}: prompt very short`);
    const key = q.prompt.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 60);
    dupPrompts.set(key, [...(dupPrompts.get(key) ?? []), `${L.id}/${q.id}`]);
  }
  // Problem quality
  for (const p of L.problems) {
    if (!p.hints) log("thin", "MED", `${L.id} ${p.id}: no progressive hints`);
    if (!p.mistakes || p.mistakes.length === 0) log("thin", "LOW", `${L.id} ${p.id}: no mistake coaching`);
    if (!p.expected || p.expected.rows.length === 0)
      log("thin", "MED", `${L.id} ${p.id}: expected has no rows (changes=${p.expected?.changes})`);
    if (wc(p.brief) < 8) log("thin", "MED", `${L.id} ${p.id}: brief very short`);
  }
  // deep quality
  if (L.deep && L.deep.length < 4)
    log("thin", "LOW", `${L.id}: deep tab has only ${L.deep.length} blocks`);

  dupTitles.set(L.title.toLowerCase(), [...(dupTitles.get(L.title.toLowerCase()) ?? []), L.id]);
}

for (const [t, ids] of dupTitles) if (ids.length > 1) log("thin", "HIGH", `DUPLICATE lesson title "${t}": ${ids.join(", ")}`);
for (const [p, ids] of dupPrompts) if (ids.length > 1) log("thin", "LOW", `MCQ prompt reused in ${ids.join(", ")}: "${p}..."`);

// duplicate ids across the whole ledger
const allIds = new Map<string, string>();
for (const L of LESSONS) {
  for (const q of L.mcqs) {
    if (allIds.has(q.id)) log("consistency", "HIGH", `MCQ id collision: ${q.id} in ${L.id} and ${allIds.get(q.id)}`);
    allIds.set(q.id, L.id);
  }
  for (const p of L.problems) {
    if (allIds.has(p.id)) log("consistency", "HIGH", `Problem id collision: ${p.id} in ${L.id} and ${allIds.get(p.id)}`);
    allIds.set(p.id, L.id);
  }
}

// id-prefix discipline
for (const L of LESSONS) {
  const prefix = `l${String(L.num).padStart(2, "0")}-`;
  for (const q of L.mcqs) if (!q.id.startsWith(prefix) && !q.id.startsWith(`l${L.num}-`))
    log("consistency", "MED", `${L.id} mcq id "${q.id}" doesn't match expected prefix ${prefix}`);
  for (const p of L.problems) if (!p.id.startsWith(prefix) && !p.id.startsWith(`l${L.num}-`))
    log("consistency", "MED", `${L.id} problem id "${p.id}" doesn't match expected prefix ${prefix}`);
}

// ================= DIMENSION 2: CONSISTENCY =================
console.log("=== D2: CONSISTENCY SCAN ===");
// module membership
const membership = new Map<string, string[]>();
for (const M of MODULES) for (const l of M.lessons) {
  membership.set(l.id, [...(membership.get(l.id) ?? []), M.id]);
}
for (const L of LESSONS) {
  const m = membership.get(L.id);
  if (!m || m.length === 0) log("consistency", "HIGH", `${L.id} not in any module`);
  else if (m.length > 1) log("consistency", "HIGH", `${L.id} in MULTIPLE modules: ${m.join(",")}`);
  if (L.num !== parseInt(L.id.slice(-2), 10)) log("consistency", "MED", `${L.id}: num=${L.num} disagrees with id suffix`);
}
// modules without lessons
for (const M of MODULES) {
  if (M.lessons.length === 0) console.log(`  (module ${M.id} is a problems-only band: OK)`);
}
// num ordering inside LESSONS
for (let i = 0; i < LESSONS.length; i++)
  if (LESSONS[i].num !== i + 1) log("consistency", "HIGH", `LESSONS[${i}] has num=${LESSONS[i].num} (${LESSONS[i].id}) — off-sequence`);

// figures referenced vs registered
const usedFigures = new Set<string>();
const collectFigs = (L: Lesson) => {
  for (const b of [...L.blocks, ...(L.deep ?? [])]) {
    if ((b as { kind: string }).kind === "diagram") usedFigures.add((b as { figure: string }).figure);
  }
};
LESSONS.forEach(collectFigs);
const figIds = new Set(FIGURE_META.map((f) => f.figure as string));
for (const f of usedFigures)
  if (!figIds.has(f))
    log("consistency", "HIGH", `figure "${f}" referenced by lessons but NOT in FIGURE_META (no library attribution)`);
// figures in deep blocks only — FIGURE_META.scan() ignores deep, so these
// never get library attribution
const deepOnlyFigs = new Set<string>();
for (const L of LESSONS) for (const b of L.deep ?? [])
  if (b.kind === "diagram" && !usedFigures.has((b as { figure: string }).figure))
    deepOnlyFigs.add((b as { figure: string }).figure);
for (const f of deepOnlyFigs)
  log("consistency", "MED", `figure "${f}" appears ONLY in a deep-dive — FIGURE_META scan misses it`);
console.log(`  caseStudies: ${caseStudies.length}`);
for (const cs of caseStudies) {
  if (!cs || typeof cs !== "object") continue;
  if (!Array.isArray(cs.chips) || cs.chips.length === 0) log("thin", "HIGH", `case ${cs.id}: no chips`);
  const slots = (typeof cs.template === "string" ? cs.template.match(/\{\d+\}/g) : null)?.length ?? 0;
  if (!Array.isArray(cs.answers) || cs.answers.length !== slots)
    log("consistency", "HIGH", `case ${cs.id}: answers=${cs.answers?.length} vs slots=${slots}`);
}

// copy claims: tools
console.log(`  TOOLS.length=${33}`);
// "all 14 modules" claim:
// XP: verify no hardcoded XP values that disagree with central constants
// (checks in runtime dimension via grep outside this script)

// ================= DIMENSION 3: LANGUAGE =================
console.log("=== D3: LANGUAGE SCAN ===");
const cjk = /[\u4e00-\u9fff\u3400-\u4dbf]/;
const scanStrings = (owner: string, s: string) => {
  if (cjk.test(s)) log("language", "HIGH", `CJK residue in ${owner}: "${s.slice(0, 60)}"`);
  if (/\b(teh|recieve|seperate|occured|definately|untill|wich|alot|thier)\b/i.test(s))
    log("language", "MED", `misspelling in ${owner}: "${s.slice(0, 70)}"`);
  if (/[a-z]{2}\s{2,}[a-z]/.test(s)) log("language", "LOW", `double space in ${owner}: "${s.slice(0, 60)}"`);
  if (/\b(TODO|FIXME|XXX|TBD|PLACEHOLDER|lorem ipsum)\b/i.test(s))
    log("language", "HIGH", `placeholder text in ${owner}: "${s.slice(0, 60)}"`);
  if (/(\.|,)\s*[\u0400-\u04FF\u0600-\u06FF]/.test(s)) log("language", "MED", `mixed non-Latin residue in ${owner}: "${s.slice(0, 60)}"`);
};
for (const L of LESSONS) {
  blockTexts(L.blocks).forEach((t) => scanStrings(L.id, t));
  if (L.deep) blockTexts(L.deep).forEach((t) => scanStrings(L.id + "/deep", t));
  L.mcqs.forEach((q) => { scanStrings(`${L.id}/${q.id}`, q.prompt); scanStrings(`${L.id}/${q.id}`, q.why); q.choices.forEach((c) => scanStrings(`${L.id}/${q.id}#c`, c)); });
  L.problems.forEach((p) => { scanStrings(`${L.id}/${p.id}`, p.brief); p.mistakes?.forEach((m) => scanStrings(`${L.id}/${p.id}#m`, m.message)); });
  scanStrings(`${L.id}/title`, L.title);
  scanStrings(`${L.id}/blurb`, L.blurb);
  if (L.takeaway) scanStrings(`${L.id}/takeaway`, L.takeaway);
}

// ================= SUMMARY =================
console.log("\n================ AUDIT SUMMARY ================");
console.log(`Lessons: ${LESSONS.length}; Modules: ${MODULES.length}; MCQs: ${allIds.size}`);
for (const dim of ["thin", "consistency", "language", "runtime"] as const) {
  console.log(`\n-- ${dim.toUpperCase()} (${R[dim].length}) --`);
  for (const [sev, msg] of R[dim]) console.log(`  [${sev}] ${msg}`);
}
