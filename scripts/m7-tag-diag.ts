// Tag diagnosis — which authored write-bank items MISS their target keyword?
import { tag } from "../src/lib/curriculum/keyword-taxonomy";
import { insertBank, updateBank, deleteBank, upsertBank, returningBank, transactionsBank } from "../src/lib/curriculum/keyword-banks/write-banks";

const TARGETS: Record<string, string> = {
  "INSERT": "INSERT", "UPDATE": "UPDATE", "DELETE": "DELETE",
  "UPSERT (ON CONFLICT)": "UPSERT (ON CONFLICT)", "RETURNING": "RETURNING", "Transactions": "Transactions",
};
const banks = [insertBank, updateBank, deleteBank, upsertBank, returningBank, transactionsBank];

for (const b of banks) {
  const target = TARGETS[b.kw];
  const missMcq: string[] = [];
  for (const q of b.mcqs) {
    const { kws } = tag(b.moduleNum, `${q.prompt} ${q.why}`, "");
    if (!kws.has(target)) missMcq.push(q.id);
  }
  const missProb: string[] = [];
  for (const p of b.problems) {
    const hints = p.hints ? p.hints.join(" ") : "";
    const { kws } = tag(b.moduleNum, `${p.title} ${p.brief} ${hints}`, p.solution);
    if (!kws.has(target)) missProb.push(p.id);
  }
  const missCase: string[] = [];
  for (const c of b.cases) {
    const slotText = c.slots.map((s) => `${s.label} ${s.why}`).join(" ");
    const { kws } = tag(b.moduleNum, `${c.title} ${c.brief} ${c.ask} ${c.walkthrough} ${slotText}`, `${c.template} ${c.slots.map((s) => s.answer).join(" ")}`);
    if (!kws.has(target)) missCase.push(c.id);
  }
  console.log(`${b.kw}: mcqs ${b.mcqs.length - missMcq.length}/${b.mcqs.length} hit · problems ${b.problems.length - missProb.length}/${b.problems.length} · cases ${b.cases.length - missCase.length}/${b.cases.length}`);
  if (missMcq.length) console.log(`  mcq misses: ${missMcq.join(" ")}`);
  if (missProb.length) console.log(`  problem misses: ${missProb.join(" ")}`);
  if (missCase.length) console.log(`  case misses: ${missCase.join(" ")}`);
}
