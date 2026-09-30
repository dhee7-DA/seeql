// M5 tag test — every new bank item must tag its owning keyword (M3 standing
// hook: run BEFORE gen-expected). MCQs are prose-tagged only (census passes
// sql=""), problems tag via title+brief+hints+solution, cases via prose+template.
import { KEYWORD_BANKS } from "../src/lib/curriculum/keyword-banks";
import { tag } from "../src/lib/curriculum/keyword-taxonomy";

const M5_KWS = new Set([
  "OVER & PARTITION BY", "ROW_NUMBER", "NTILE", "FIRST_VALUE & LAST_VALUE",
  "PERCENT_RANK & CUME_DIST", "Running totals", "Text functions",
  "CAST & types", "Math & rounding",
]);

let total = 0, ok = 0;
const misses: string[] = [];
for (const bank of KEYWORD_BANKS) {
  if (bank.moduleNum !== 5) continue;
  for (const q of bank.mcqs) {
    total++;
    const why = (q.why ?? "") + " " + (q.notes ?? []).map((n) => n.why).join(" ");
    const kws = tag(bank.moduleNum, `${q.prompt} ${why}`, "").kws;
    if (kws.has(bank.kw)) ok++; else misses.push(`MCQ ${q.id} → ${bank.kw}`);
  }
  for (const pr of bank.problems) {
    total++;
    const hints = (pr.hints ?? []).join(" ");
    const kws = tag(bank.moduleNum, `${pr.title} ${pr.brief} ${hints}`, pr.solution).kws;
    if (kws.has(bank.kw)) ok++; else misses.push(`PROBLEM ${pr.id} → ${bank.kw}`);
  }
  for (const c of bank.cases) {
    total++;
    const slotText = c.slots.map((s) => `${s.answer} ${s.label} ${s.why}`).join(" ");
    const kws = tag(bank.moduleNum, `${c.title} ${c.brief} ${c.ask} ${c.walkthrough} ${slotText}`, `${c.template} ${c.slots.map((s) => s.answer).join(" ")}`).kws;
    if (kws.has(bank.kw)) ok++; else misses.push(`CASE ${c.id} → ${bank.kw}`);
  }
}
console.log(`tag test: ${ok}/${total} tagged`);
if (misses.length) { console.log("MISSES:"); for (const m of misses) console.log(" " + m); process.exit(1); }
