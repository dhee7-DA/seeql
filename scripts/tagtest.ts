import { tag } from "../src/lib/curriculum/keyword-taxonomy";
import { nonEquiMcqs } from "../src/lib/curriculum/keyword-banks/non-equi-mcqs";
import { nonEquiCases } from "../src/lib/curriculum/keyword-banks/non-equi-cases";
import { nonEquiJoinsBank } from "../src/lib/curriculum/keyword-banks/non-equi-joins";

let mcqHits = 0, caseHits = 0, probHits = 0;
const misses: string[] = [];
for (const q of nonEquiMcqs) {
  const why = (q.why ?? "") + " " + (q.notes ?? []).map(n => n.why).join(" ");
  const kws = tag(2, `${q.prompt} ${why}`, "").kws;
  if (kws.has("Non-equi & range joins")) mcqHits++; else misses.push(q.id);
}
console.log("mcq hits:", mcqHits, "/", nonEquiMcqs.length, "misses:", misses.join(","));
const caseMisses: string[] = [];
for (const c of nonEquiCases) {
  const slotText = c.slots.map(s => `${s.answer} ${s.label} ${s.why}`).join(" ");
  const kws = tag(2, `${c.title} ${c.brief} ${c.ask} ${c.walkthrough} ${slotText}`, `${c.template} ${c.slots.map(s => s.answer).join(" ")}`).kws;
  if (kws.has("Non-equi & range joins")) caseHits++; else caseMisses.push(c.id);
}
console.log("case hits:", caseHits, "/", nonEquiCases.length, "misses:", caseMisses.join(","));
const probMisses: string[] = [];
for (const p of nonEquiJoinsBank.problems) {
  const hints = (p.hints ?? []).join(" ");
  const kws = tag(2, `${p.title} ${p.brief} ${hints}`, p.solution).kws;
  if (kws.has("Non-equi & range joins")) probHits++; else probMisses.push(p.id);
}
console.log("prob hits:", probHits, "/", nonEquiJoinsBank.problems.length, "misses:", probMisses.join(","));
