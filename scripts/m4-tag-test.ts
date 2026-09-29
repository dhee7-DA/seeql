// M4 tag test — verify every new bank item tags to its target keyword.
// Run: npx tsx scripts/m4-tag-test.ts
import { tag } from "../src/lib/curriculum/keyword-taxonomy";
import {
  inSubqueryBank,
  scalarSubqueryBank,
  existsBank,
  correlatedBank,
  derivedTableBank,
  recursiveCteBank,
} from "../src/lib/curriculum/keyword-banks/subquery-banks";
import { m04Mcqs } from "../src/lib/curriculum/gauntlet/m04-mcqs";

const TARGETS: Record<string, string> = {
  "kb-sq": "IN subqueries",
  "kb-sc": "Scalar subqueries",
  "kb-ex": "EXISTS",
  "kb-co": "Correlated subqueries",
  "kb-dt": "Derived tables",
  "kb-rc": "WITH RECURSIVE",
};

function check(kind: string, id: string, prefix: string, prose: string, sql: string, kw: string): boolean {
  const t = tag(4, prose, sql);
  if (!t.kws.has(kw)) {
    console.log(`MISS [${kind}] ${id} → "${kw}" (prose head: ${prose.slice(0, 80)})`);
    return false;
  }
  return true;
}

let pass = 0;
let fail = 0;

const banks: Array<[string, typeof inSubqueryBank]> = [
  ["kb-sq", inSubqueryBank],
  ["kb-sc", scalarSubqueryBank],
  ["kb-ex", existsBank],
  ["kb-co", correlatedBank],
  ["kb-dt", derivedTableBank],
  ["kb-rc", recursiveCteBank],
];

for (const [prefix, bank] of banks) {
  const kw = TARGETS[prefix];
  for (const q of bank.mcqs) {
    const why = (q.why ?? "") + " " + (q.notes ?? []).map((n) => n.why).join(" ");
    if (check("mcq", q.id, prefix, `${q.prompt} ${why}`, "", kw)) pass++; else fail++;
  }
  for (const pr of bank.problems) {
    const hints = (pr.hints ?? []).join(" ");
    if (check("problem", pr.id, prefix, `${pr.title} ${pr.brief} ${hints}`, pr.solution, kw)) pass++; else fail++;
  }
  for (const c of bank.cases) {
    const slotText = c.slots.map((s) => `${s.answer} ${s.label} ${s.why}`).join(" ");
    if (check("case", c.id, prefix, `${c.title} ${c.brief} ${c.ask} ${c.walkthrough} ${slotText}`, `${c.template} ${c.slots.map((s) => s.answer).join(" ")}`, kw)) pass++; else fail++;
  }
}

// gauntlet MCQs must tag to at least ONE M4 keyword
const M4_KWS = ["Subqueries (umbrella)", "IN subqueries", "Scalar subqueries", "EXISTS", "Correlated subqueries", "Derived tables", "WITH (CTE)", "WITH RECURSIVE"];
for (const q of m04Mcqs) {
  const why = (q.why ?? "") + " " + (q.notes ?? []).map((n) => n.why).join(" ");
  const t = tag(4, `${q.prompt} ${why}`, "");
  const hit = [...t.kws].some((k) => M4_KWS.includes(k));
  if (hit) pass++; else { console.log(`MISS [gm4-mcq] ${q.id} → any M4 keyword`); fail++; }
}

console.log(`\ntag test: ${pass} pass, ${fail} fail`);
process.exit(fail > 0 ? 1 : 0);
