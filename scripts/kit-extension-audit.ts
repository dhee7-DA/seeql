// Kit extension validator — mechanical gate before commit.
// Checks per kit: counts (mcq/theory/cases/problems), id uniqueness across ALL kits,
// id numbering continuity, difficulty vocab, answer-index bounds, choices length,
// slug validity against the band, case topic/universe vocab, prompt duplication.
import { COMPANY_KITS } from "../src/lib/companies/registry";
import { CASE_TOPICS, CASE_UNIVERSES } from "../src/lib/curriculum/cases/types";

const band = new Set((await Bun.file("scripts/band-slugs.txt").text()).trim().split("\n"));
const topicIds = new Set(CASE_TOPICS.map(t => t.id));
const universeIds = new Set(CASE_UNIVERSES.map(u => u.id));

const args = process.argv.slice(2);
const target = args.length ? new Set(args) : null;

const seenIds = new Map<string, string>();
const seenPrompts = new Map<string, string>();
let fails = 0, warns = 0;
const fail = (msg: string) => { console.log(`FAIL ${msg}`); fails++; };
const warn = (msg: string) => { console.log(`WARN ${msg}`); warns++; };

const globalIds = new Map<string, string>();
for (const [id, k] of Object.entries(COMPANY_KITS)) {
  k.mcqs.forEach(m => globalIds.set(m.id, id));
  k.theory.forEach(t => globalIds.set(t.id, id));
  k.cases.forEach(c => globalIds.set(c.id, id));
}

for (const [id, k] of Object.entries(COMPANY_KITS)) {
  if (target && !target.has(id)) continue;
  const nMcq = k.mcqs.length, nTh = k.theory.length, nC = k.cases.length, nP = k.problems.length;
  const tag = `${id} [mcq=${nMcq} theory=${nTh} cases=${nC} probs=${nP}]`;
  if (nMcq === 30 && nTh === 24 && nC === 6 && nP >= 32) console.log(`OK   ${tag}`);
  else if (nMcq === 10 && nTh === 8 && nC === 2 && nP === 16) console.log(`BASE ${tag}`);
  else fail(`${tag} — nonstandard counts`);

  // per-kit id continuity + collisions + prompts
  const checkSeq = (label: string, ids: string[], pattern: RegExp) => {
    const nums: number[] = [];
    for (const cid of ids) {
      if (!pattern.test(cid)) fail(`${id}: ${label} id '${cid}' doesn't match pattern ${pattern}`);
      if (globalIds.get(cid) !== id) fail(`${id}: ${label} id '${cid}' collides with kit ${globalIds.get(cid)}`);
      const m = cid.match(/(\d+)$/); if (m) nums.push(Number(m[1]));
    }
    if (nums.length) {
      const max = Math.max(...nums), uniq = new Set(nums);
      if (uniq.size !== nums.length) fail(`${id}: ${label} duplicate numbers`);
      // numbers should be 1..max with no gaps
      const missing: number[] = [];
      for (let i = 1; i <= max; i++) if (!uniq.has(i)) missing.push(i);
      if (missing.length) fail(`${id}: ${label} gaps in numbering: ${missing.join(",")}`);
    }
  };
  checkSeq("mcq", k.mcqs.map(m => m.id), /-mcq-\d+$/);
  checkSeq("theory", k.theory.map(t => t.id), /-t\d+$/);
  checkSeq("case", k.cases.map(c => c.id), /^cs-[a-z0-9]+-\d+$/);

  for (const m of k.mcqs) {
    if (m.choices.length !== 4) fail(`${id}/${m.id}: ${m.choices.length} choices`);
    if (m.answer < 0 || m.answer > 3) fail(`${id}/${m.id}: answer index ${m.answer} out of range`);
    if (!["easy", "medium", "hard"].includes(m.difficulty)) fail(`${id}/${m.id}: bad difficulty '${m.difficulty}'`);
    if (!m.why || m.why.length < 60) warn(`${id}/${m.id}: thin why (${m.why?.length ?? 0} chars)`);
    const key = m.prompt.replace(/\s+/g, " ").trim().slice(0, 90).toLowerCase();
    const owner = seenPrompts.get(key);
    if (owner && owner === id) fail(`prompt dupe within ${id}: ${m.id} ≈ earlier entry`);
    seenPrompts.set(key, id);
  }
  for (const t of k.theory) {
    if (!t.tag) fail(`${id}/${t.id}: empty tag`);
    if (!t.a || t.a.length < 80) warn(`${id}/${t.id}: thin model answer (${t.a?.length ?? 0} chars)`);
  }
  for (const c of k.cases) {
    if (!topicIds.has(c.topic)) fail(`${id}/${c.id}: bad topic '${c.topic}'`);
    if (!universeIds.has(c.universe)) fail(`${id}/${c.id}: bad universe '${c.universe}'`);
    const markers = [...c.template.matchAll(/\{(\d)\}/g)].map(m => m[1]);
    if (markers.length !== c.slots.length) fail(`${id}/${c.id}: ${markers.length} markers vs ${c.slots.length} slots`);
    const uniq = new Set(markers);
    if (uniq.size !== markers.length) fail(`${id}/${c.id}: repeated template marker`);
  }
  for (const p of k.problems) {
    if (!band.has(p.slug)) fail(`${id}: problem slug not in band: '${p.slug}'`);
    if (!p.why || p.why.length < 40) warn(`${id}: thin problem why for '${p.slug}'`);
  }
}
console.log(`\n${fails} fails, ${warns} warnings`);
process.exit(fails ? 1 : 0);
