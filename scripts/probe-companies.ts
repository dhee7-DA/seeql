/// <reference types="bun-types" />
// Company universe probe — matrix integrity + kit content checks.
import { COMPANY_DOMAINS, COMPANY_META, COMPANY_KITS } from "../src/lib/companies/registry";
import { lcBySlug, LC_ALL } from "../src/lib/leetcode/registry";

let fail = 0;
const bad = (m: string) => { console.log("FAIL:", m); fail++; };

// 1. matrix: every domain has 20 companies (160-company universe), every company has meta
const ids = new Set<string>();
for (const d of COMPANY_DOMAINS) {
  if (d.companies.length !== 20) bad(`domain ${d.id} has ${d.companies.length} companies`);
  for (const c of d.companies) {
    if (ids.has(c)) bad(`duplicate company id ${c}`);
    ids.add(c);
    if (!COMPANY_META[c]) bad(`missing meta for ${c}`);
  }
}
console.log(`matrix: ${COMPANY_DOMAINS.length} domains, ${ids.size} companies`);

// 2. kits: slugs exist in the LC band, ids unique across theory/mcq/cases
const seenIds = new Set<string>();
let problems = 0, theory = 0, mcqs = 0, cases = 0;
for (const [id, kit] of Object.entries(COMPANY_KITS)) {
  if (!ids.has(id)) bad(`kit ${id} not in matrix`);
  if (kit.id !== id) bad(`kit id mismatch ${id}`);
  for (const p of kit.problems) {
    problems++;
    if (!lcBySlug(p.slug)) bad(`kit ${id}: slug not in band: ${p.slug}`);
  }
  for (const t of kit.topics) for (const s of t.slugs) if (!lcBySlug(s)) bad(`kit ${id} topic "${t.name}": slug not in band: ${s}`);
  for (const t of kit.theory) {
    theory++;
    if (seenIds.has(t.id)) bad(`dup theory id ${t.id}`); seenIds.add(t.id);
    if (t.a.length < 200) bad(`kit ${id}: thin theory answer ${t.id} (${t.a.length} chars)`);
  }
  for (const m of kit.mcqs) {
    mcqs++;
    if (seenIds.has(m.id)) bad(`dup mcq id ${m.id}`); seenIds.add(m.id);
    if (m.answer < 0 || m.answer >= m.choices.length) bad(`kit ${id}: mcq ${m.id} bad answer index`);
  }
  for (const c of kit.cases) {
    cases++;
    if (seenIds.has(c.id)) bad(`dup case id ${c.id}`); seenIds.add(c.id);
    if (c.slots.length < 3) bad(`kit ${id}: case ${c.id} has ${c.slots.length} slots`);
  }
  console.log(`kit ${id}: ${kit.problems.length} problems, ${kit.topics.length} topics, ${kit.theory.length} theory, ${kit.mcqs.length} mcqs, ${kit.cases.length} cases`);
}
console.log(`totals: ${problems} problems, ${theory} theory, ${mcqs} mcqs, ${cases} cases`);

// 3. Amazon pool share — how much of the registry's Amazon tags the kit covers
const amzBand = LC_ALL.filter(p => p.sql && p.companies[0] === "Amazon").length;
console.log(`Amazon signature pool in band: ${amzBand}; kit covers ${COMPANY_KITS.amazon?.problems.length ?? 0}`);

console.log(fail === 0 ? "ALL PASS" : `${fail} FAILURES`);
process.exit(fail === 0 ? 0 : 1);
