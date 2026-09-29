// Keyword Practice pools — the client-side counterpart of the coverage
// census. Every practice surface (lesson MCQs/problems, case files, module
// gauntlet banks) is tagged through the SAME keyword-taxonomy tag() the
// workbook and quota tracker use, so the hub's counts can never drift from
// the reports. Built lazily once per page load; pure derivation, no db.
import type { Mcq, Problem } from "./types";
import type { CaseStudy } from "./cases/types";
import { LESSONS, MODULES } from "./lessons";
import { CASES, CASE_TOPICS } from "./cases";
import { GAUNTLET_BANKS } from "./gauntlet";
import { tag } from "./keyword-taxonomy";

export interface KeywordPool {
  mcqs: Array<{ item: Mcq; source: "lesson" | "gauntlet" }>;
  cases: Array<{ item: CaseStudy; source: "lesson" | "gauntlet" }>;
  problems: Array<{ item: Problem; source: "lesson" | "gauntlet" }>;
}

const lessonToModule = new Map<number, number>();
for (const m of MODULES) for (const l of m.lessons) lessonToModule.set(l.num, m.num);

function buildPools(): Map<string, KeywordPool> {
  const pools = new Map<string, KeywordPool>();
  const poolFor = (kw: string): KeywordPool => {
    let p = pools.get(kw);
    if (!p) {
      p = { mcqs: [], cases: [], problems: [] };
      pools.set(kw, p);
    }
    return p;
  };

  const lessonMcqs: Array<{ module: number | null; q: Mcq }> = [];
  const lessonProblems: Array<{ module: number | null; p: Problem }> = [];
  for (const l of LESSONS) {
    const mod = lessonToModule.get(l.num) ?? null;
    for (const q of l.mcqs) lessonMcqs.push({ module: mod, q });
    for (const p of l.problems) lessonProblems.push({ module: mod, p });
  }
  for (const { module, q } of lessonMcqs) {
    const why = (q.why ?? "") + " " + (q.notes ?? []).map((n) => n.why).join(" ");
    for (const kw of tag(module, `${q.prompt} ${why}`, "").kws) poolFor(kw).mcqs.push({ item: q, source: "lesson" });
  }
  for (const { module, p } of lessonProblems) {
    const hints = (p.hints ?? []).join(" ");
    for (const kw of tag(module, `${p.title} ${p.brief} ${hints}`, p.solution).kws) poolFor(kw).problems.push({ item: p, source: "lesson" });
  }
  for (const c of CASES) {
    const ln = CASE_TOPICS.find((t) => t.id === c.topic)?.lessonNum ?? null;
    const mod = ln != null ? (lessonToModule.get(ln) ?? null) : null;
    const slotText = c.slots.map((s) => `${s.answer} ${s.label} ${s.why}`).join(" ");
    for (const kw of tag(mod, `${c.title} ${c.brief} ${c.ask} ${c.walkthrough} ${slotText}`, `${c.template} ${c.slots.map((s) => s.answer).join(" ")}`).kws)
      poolFor(kw).cases.push({ item: c, source: "lesson" });
  }
  // Module gauntlet banks
  for (const bank of GAUNTLET_BANKS) {
    for (const q of bank.mcqs) {
      const why = (q.why ?? "") + " " + (q.notes ?? []).map((n) => n.why).join(" ");
      for (const kw of tag(bank.moduleNum, `${q.prompt} ${why}`, "").kws) poolFor(kw).mcqs.push({ item: q, source: "gauntlet" });
    }
    for (const p of bank.problems) {
      const hints = (p.hints ?? []).join(" ");
      for (const kw of tag(bank.moduleNum, `${p.title} ${p.brief} ${hints}`, p.solution).kws) poolFor(kw).problems.push({ item: p, source: "gauntlet" });
    }
    for (const c of bank.cases) {
      const slotText = c.slots.map((s) => `${s.answer} ${s.label} ${s.why}`).join(" ");
      for (const kw of tag(bank.moduleNum, `${c.title} ${c.brief} ${c.ask} ${c.walkthrough} ${slotText}`, `${c.template} ${c.slots.map((s) => s.answer).join(" ")}`).kws)
        poolFor(kw).cases.push({ item: c, source: "gauntlet" });
    }
  }
  return pools;
}

let cached: Map<string, KeywordPool> | null = null;

/** keyword -> practice pools (multi-label, same tagging as the census). */
export function keywordPools(): Map<string, KeywordPool> {
  if (!cached) cached = buildPools();
  return cached;
}

/** Keyword list in dictionary order (the taxonomy's canonical order). */
export async function keywordOrder(): Promise<Array<{ kw: string; cat: string }>> {
  const { D } = await import("./keyword-taxonomy");
  return D.map((d) => ({ kw: d.kw, cat: d.cat }));
}
