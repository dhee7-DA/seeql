// M4 pre-registration validator — run: bun scripts/m4-validate.ts
// Checks every drills/m4 file: counts, sequential ids, dup ids/prompts (in-file + bank-wide),
// 4 choices, no dup choice text, answer 0-3, why >= 30, notes rules, aspect/tier/keyword validity.
import { SCALAR_SUB_DRILL } from "../src/lib/curriculum/drills/m4/scalar-subquery";
import { IN_SUB_DRILL } from "../src/lib/curriculum/drills/m4/in-subquery";
import { EXISTS_DRILL } from "../src/lib/curriculum/drills/m4/exists";
import { CORRELATED_DRILL } from "../src/lib/curriculum/drills/m4/correlated";
import { DERIVED_TABLES } from "../src/lib/curriculum/drills/m4/derived-tables";
import { CTE_BASICS } from "../src/lib/curriculum/drills/m4/cte-basics";
import { CTE_CHAINS } from "../src/lib/curriculum/drills/m4/cte-chains";
import { SUBQUERY_EDGES } from "../src/lib/curriculum/drills/m4/subquery-edges";
import { SUBQUERY_JUDGMENT } from "../src/lib/curriculum/drills/m4/subquery-judgment";
import { SUB_CAPSTONE } from "../src/lib/curriculum/drills/m4/sub-capstone";
import { DRILL_SETS, LESSON_DRILLS } from "../src/lib/curriculum/drills";
import type { DrillQ } from "../src/lib/curriculum/drills/types";

const M4: Array<[string, string, number, DrillQ[]]> = [
  ["scalar-subquery", "dr4-sc", 50, SCALAR_SUB_DRILL],
  ["in-subquery", "dr4-in", 50, IN_SUB_DRILL],
  ["exists", "dr4-ex", 50, EXISTS_DRILL],
  ["correlated", "dr4-co", 45, CORRELATED_DRILL],
  ["derived-tables", "dr4-dt", 50, DERIVED_TABLES],
  ["cte-basics", "dr4-cb", 50, CTE_BASICS],
  ["cte-chains", "dr4-cc", 45, CTE_CHAINS],
  ["subquery-edges", "dr4-se", 45, SUBQUERY_EDGES],
  ["subquery-judgment", "dr4-sj", 40, SUBQUERY_JUDGMENT],
  ["sub-capstone", "dr4-cp", 40, SUB_CAPSTONE],
];
const ASPECTS = new Set(["syntax", "semantics", "edge", "errors", "predict", "judgment"]);

let fails = 0;
const fail = (m: string) => { fails += 1; console.log("FAIL", m); };

// bank-wide prompt/id maps (existing 1390)
const bankPrompts = new Map<string, string>();
const bankIds = new Set<string>();
for (const s of DRILL_SETS) for (const q of s.questions) {
  bankPrompts.set(q.prompt.replace(/\s+/g, " ").trim(), s.keyword);
  bankIds.add(q.id);
}
const m4Prompts = new Map<string, string>();
const m4Ids = new Set<string>();

for (const [file, prefix, want, qs] of M4) {
  console.log(`-- ${file}: ${qs.length} (want ${want})`);
  if (qs.length !== want) fail(`${file} count ${qs.length} != ${want}`);
  const kw = qs[0]?.keyword;
  const tier = qs[0]?.tier;
  qs.forEach((q, i) => {
    const wantId = `${prefix}-${String(i + 1).padStart(2, "0")}`;
    if (q.id !== wantId) fail(`${file} id order: got ${q.id} want ${wantId}`);
    if (q.keyword !== kw) fail(`${q.id} keyword mismatch`);
    if (!ASPECTS.has(q.aspect)) fail(`${q.id} bad aspect ${q.aspect}`);
    if (q.tier !== tier) fail(`${q.id} tier mismatch`);
    if (!Array.isArray(q.choices) || q.choices.length !== 4) fail(`${q.id} choices != 4`);
    if (new Set(q.choices).size !== 4) fail(`${q.id} dup choice text`);
    if (q.answer < 0 || q.answer > 3) fail(`${q.id} answer range`);
    if ((q.why ?? "").length < 30) fail(`${q.id} thin why`);
    for (const n of q.notes ?? []) {
      if (n.choice === q.answer) fail(`${q.id} note points at answer`);
      if ((n.why ?? "").length < 15) fail(`${q.id} thin note`);
    }
    const key = q.prompt.replace(/\s+/g, " ").trim();
    if (m4Prompts.has(key)) fail(`${q.id} dup prompt vs ${m4Prompts.get(key)} (M4)`);
    else m4Prompts.set(key, q.id);
    if (bankPrompts.has(key)) fail(`${q.id} dup prompt vs BANK ${bankPrompts.get(key)}`);
    if (m4Ids.has(q.id)) fail(`${q.id} dup id in M4`);
    else m4Ids.add(q.id);
    if (bankIds.has(q.id)) fail(`${q.id} id already in bank`);
  });
  const hist: Record<string, number> = {};
  for (const q of qs) hist[q.aspect] = (hist[q.aspect] ?? 0) + 1;
  console.log("   aspects:", JSON.stringify(hist));
}
console.log(fails === 0 ? "\n✅ M4 PRE-VALIDATION PASS" : `\n❌ ${fails} failures`);
process.exit(fails === 0 ? 0 : 1);
