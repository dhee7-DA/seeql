// Census for the roadmap header: the true material volume the sprint covers,
// plus the wider practice lab (live registries only). Run: npx tsx scripts/roadmap-stats.ts
import { MODULES } from "../src/lib/curriculum/lessons/index";
import { LESSONS } from "../src/lib/curriculum/lessons";
import { CASES } from "../src/lib/curriculum/cases/index";
import { allFills } from "../src/lib/curriculum/fills/index";
import { DRILL_SETS } from "../src/lib/curriculum/drills/index";
import { CAP_SAMPLES } from "../src/lib/capstone-samples";
import { parseForTable } from "../src/lib/csv-table";
import { buildCapstone } from "../src/lib/capstone";
import { profileGym } from "../src/lib/messy-gym";
import { ROADMAP, dayMinutes } from "../src/lib/curriculum/roadmap";

let mcqs = 0;
let problems = 0;
for (const l of LESSONS) {
  mcqs += l.mcqs?.length ?? 0;
  problems += l.problems?.length ?? 0;
}

let capQ = 0;
for (const s of CAP_SAMPLES) {
  const parse = parseForTable(s.csv, s.tableName);
  if ("error" in parse) continue;
  capQ += buildCapstone(parse, profileGym(parse)).questions.length;
}

const drills = DRILL_SETS.reduce((a, s) => a + s.questions.length, 0);
const sprintMinutes = ROADMAP.reduce((a, d) => a + dayMinutes(d), 0);
const examItems = ROADMAP.reduce((a, d) => a + d.items.filter((i) => i.kind === "exam").length, 0);
const lessonItems = ROADMAP.reduce((a, d) => a + d.items.filter((i) => i.kind === "lesson").length, 0);

console.log(`lessons (curriculum):      ${LESSONS.length}`);
console.log(`modules:                   ${MODULES.length}`);
console.log(`inline lesson MCQs:        ${mcqs}`);
console.log(`hands-on graded queries:   ${problems}`);
console.log(`case files (cs-deck):      ${CASES.length}`);
console.log(`fills:                     ${allFills().length}`);
console.log(`drill questions:           ${drills}`);
console.log(`capstone projects:         ${CAP_SAMPLES.length} · ${capQ} questions`);
console.log(`roadmap lesson items:      ${lessonItems} (must equal ${LESSONS.length})`);
console.log(`roadmap exam items:        ${examItems}`);
console.log(`sprint minutes (lessons):  ~${sprintMinutes}`);
