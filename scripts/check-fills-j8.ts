// j8-coord: cross-file fill dedup within batch 4 (j4a/j4b/j4c authored concurrently)
import { casesJ4a } from "../src/lib/curriculum/cases/m2/cases-j4a";
import { casesJ4b } from "../src/lib/curriculum/cases/m2/cases-j4b";
import { casesJ4c } from "../src/lib/curriculum/cases/m2/cases-j4c";

const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
const assembled = (c: (typeof casesJ4a)[number]) =>
  c.template.replace(/\{(\d+)\}/g, (_, n) => c.slots[Number(n) - 1].answer);

const files = { j4a: casesJ4a, j4b: casesJ4b, j4c: casesJ4c };
const seen = new Map<string, string>();
let collisions = 0;

for (const [name, cases] of Object.entries(files)) {
  for (const c of cases) {
    const fill = norm(assembled(c));
    const owner = seen.get(fill);
    if (owner) {
      console.log(`COLLISION: ${owner} <-> ${name} (${c.id}): ${fill}`);
      collisions++;
    } else {
      seen.set(fill, `${name} ${c.id}`);
    }
  }
}
console.log(`fills checked: ${seen.size + collisions}, distinct: ${seen.size}, collisions: ${collisions}`);
