import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url, { alias: { "@": "/home/z/my-project/src/" } });
const { LESSONS } = await jiti.import("@/lib/curriculum/lessons");
const banks = {
  1: (await jiti.import("@/lib/curriculum/lessons/mcq-banks/l01-extra")).L01_EXTRA_MCQS,
  2: (await jiti.import("@/lib/curriculum/lessons/mcq-banks/l02-extra")).L02_EXTRA_MCQS,
  3: (await jiti.import("@/lib/curriculum/lessons/mcq-banks/l03-extra")).L03_EXTRA_MCQS,
  4: (await jiti.import("@/lib/curriculum/lessons/mcq-banks/l04-extra")).L04_EXTRA_MCQS,
  5: (await jiti.import("@/lib/curriculum/lessons/mcq-banks/l05-extra")).L05_EXTRA_MCQS,
  6: (await jiti.import("@/lib/curriculum/lessons/mcq-banks/l06-extra")).L06_EXTRA_MCQS,
  7: (await jiti.import("@/lib/curriculum/lessons/mcq-banks/l07-extra")).L07_EXTRA_MCQS,
  8: (await jiti.import("@/lib/curriculum/lessons/mcq-banks/l08-extra")).L08_EXTRA_MCQS,
  35: (await jiti.import("@/lib/curriculum/lessons/mcq-banks/l35-extra")).L35_EXTRA_MCQS,
};
const all = new Map();
let collisions = 0;
for (const L of LESSONS) for (const q of L.mcqs) all.set(q.id, L.id);
for (const [num, bank] of Object.entries(banks)) {
  const L = LESSONS.find((l) => l.num === Number(num));
  if (!L) { console.log(`lesson-${num} NOT FOUND`); continue; }
  let dup = 0;
  for (const q of bank) {
    if (all.has(q.id)) { dup++; collisions++; console.log(`  COLLISION ${q.id} (${L.id} already has it)`); }
    all.set(q.id, L.id);
  }
  const last = bank[bank.length - 1]?.id;
  console.log(`lesson-${num}: bank ${bank.length} mcqs, ${dup} collisions, last id ${last}`);
  // structure check
  for (const q of bank) {
    if (q.choices.length < 3 || q.answer < 0 || q.answer >= q.choices.length || !q.why) { console.log(`  BAD STRUCTURE ${q.id}`); break; }
  }
}
console.log(collisions === 0 ? "NO ID COLLISIONS — safe to wire" : `${collisions} COLLISIONS`);
