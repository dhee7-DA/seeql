// j8-coord: id coverage check for cs-201..300 (M2 deck after batch 4)
import { CASES } from "../src/lib/curriculum/cases/index";

const m2 = CASES.filter((c) => c.deck === 2).map((c) => c.id);
const expected: string[] = [];
for (let i = 201; i <= 300; i++) expected.push(`cs-${i}`);

const missing = expected.filter((id) => !m2.includes(id));
const dupes = m2.filter((id, i) => m2.indexOf(id) !== i);
const outOfRange = m2.filter((id) => !expected.includes(id));

console.log(`M2 deck-2 total: ${m2.length}`);
console.log(`expected cs-201..300: ${expected.length}`);
console.log(`missing: ${missing.length ? missing.join(",") : "none"}`);
console.log(`dupes: ${dupes.length ? dupes.join(",") : "none"}`);
console.log(`out-of-range: ${outOfRange.length ? outOfRange.join(",") : "none"}`);

// topic sanity for j4
const j4 = CASES.filter((c) => c.deck === 2 && c.topic === "j4");
console.log(`topic j4 count: ${j4.length} (${j4[0]?.id}..${j4[j4.length - 1]?.id})`);
