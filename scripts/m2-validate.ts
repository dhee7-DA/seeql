// Validate the whole M2 drill bank: counts, ids, dupes, shapes, aspects.
import { INNER_JOIN } from "../src/lib/curriculum/drills/m2/inner-join";
import { LEFT_JOIN } from "../src/lib/curriculum/drills/m2/left-join";
import { MULTI_JOIN } from "../src/lib/curriculum/drills/m2/multi-join";
import { JOIN_AGGREGATE } from "../src/lib/curriculum/drills/m2/join-aggregate";
import { ANTI_JOIN } from "../src/lib/curriculum/drills/m2/anti-join";
import { SELF_JOIN } from "../src/lib/curriculum/drills/m2/self-join";
import { ON_VS_WHERE } from "../src/lib/curriculum/drills/m2/on-vs-where";
import { JOIN_EDGES } from "../src/lib/curriculum/drills/m2/join-edges";
import { JOIN_SYNTAX } from "../src/lib/curriculum/drills/m2/join-syntax";
import { JOIN_JUDGMENT } from "../src/lib/curriculum/drills/m2/join-judgment";
import { DRILL_SETS } from "../src/lib/curriculum/drills";

const sets: Array<[string, typeof INNER_JOIN]> = [
  ["inner-join", INNER_JOIN], ["left-join", LEFT_JOIN], ["multi-join", MULTI_JOIN],
  ["join-aggregate", JOIN_AGGREGATE], ["anti-join", ANTI_JOIN], ["self-join", SELF_JOIN],
  ["on-vs-where", ON_VS_WHERE], ["join-edges", JOIN_EDGES], ["join-syntax", JOIN_SYNTAX],
  ["join-judgment", JOIN_JUDGMENT],
];

let fail = 0;
const allIds = new Map<string, string>();
const allPrompts = new Map<string, string>();
const aspects: Record<string, number> = {};

for (const [name, qs] of sets) {
  const ids = new Set<string>();
  const prompts = new Set<string>();
  for (const q of qs) {
    if (ids.has(q.id)) { console.log(`DUP id in ${name}: ${q.id}`); fail++; }
    ids.add(q.id);
    if (allIds.has(q.id)) { console.log(`CROSS-FILE dup id ${q.id}: ${name} vs ${allIds.get(q.id)}`); fail++; }
    allIds.set(q.id, name);
    const pk = q.prompt;
    if (prompts.has(pk)) { console.log(`DUP prompt in ${name}: ${pk}`); fail++; }
    prompts.add(pk);
    if (allPrompts.has(pk)) { console.log(`CROSS-SET dup prompt ${name} vs ${allPrompts.get(pk)}: ${pk}`); fail++; }
    allPrompts.set(pk, name);
    if (q.choices.length !== 4) { console.log(`BAD choices ${q.id}: ${q.choices.length}`); fail++; }
    if (q.answer < 0 || q.answer > 3) { console.log(`BAD answer ${q.id}`); fail++; }
    if (!q.why || q.why.length < 30) { console.log(`THIN why ${q.id}`); fail++; }
    if (q.notes) for (const n of q.notes) if (n.choice === q.answer) { console.log(`NOTE=ANSWER ${q.id}`); fail++; }
    aspects[q.aspect] = (aspects[q.aspect] ?? 0) + 1;
  }
  console.log(`${name.padEnd(16)} ${String(qs.length).padStart(3)} questions`);
}
console.log("\nM2 total:", sets.reduce((a, [, s]) => a + s.length, 0));
console.log("Aspect mix:", JSON.stringify(aspects));
console.log("Whole bank (DRILL_SETS):", DRILL_SETS.reduce((a, s) => a + s.questions.length, 0), "in", DRILL_SETS.length, "sets");
console.log(fail === 0 ? "\nVALIDATION PASS" : `\nVALIDATION FAIL: ${fail}`);
