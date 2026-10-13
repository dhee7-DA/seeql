// Dump raw material for study-guide authoring: for given section ids,
// print each dive's statement + approach + first breakdown para so the
// intros and path whys are grounded in real mechanics.
import { SQL50_SECTIONS, DATAFIN_SECTIONS } from "../src/lib/leetcode/sections";
import { lcSqlDive } from "../src/lib/leetcode/content/content";

const TARGETS = process.argv.slice(2);
const all = [...SQL50_SECTIONS, ...DATAFIN_SECTIONS];

for (const sec of all) {
  if (!TARGETS.includes(sec.id)) continue;
  console.log(`\n=========== ${sec.id} — ${sec.title} (${sec.slugs.length} problems) ===========`);
  console.log(`BLURB: ${sec.blurb}`);
  for (const slug of sec.slugs) {
    const d = lcSqlDive(slug);
    if (!d) {
      console.log(`  [${slug}] NO DIVE`);
      continue;
    }
    console.log(`\n-- ${slug} (${d.difficulty ?? "?"})`);
    console.log(`   STMT: ${d.statement.replace(/\s+/g, " ").slice(0, 260)}`);
    console.log(`   APPR: ${(d.approach ?? "").replace(/\s+/g, " ").slice(0, 300)}`);
  }
}
