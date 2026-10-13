// Probe: study-guide coverage + batch-5 path consistency.
import { SQL50_SECTIONS, DATAFIN_SECTIONS } from '../src/lib/leetcode/sections';

const BATCH5 = new Set([
  'analytics-funnels',
  'premium5-trends', 'premium5-system', 'premium5-league', 'premium5-graph',
  'premium5-market', 'premium5-finales',
  'free-classics', 'free-windows', 'free-formats', 'free-org', 'free-pairs',
  'final-habits', 'final-ops',
]);

const all = [...SQL50_SECTIONS, ...DATAFIN_SECTIONS];
let withStudy = 0;
let whys = 0;
const problems: string[] = [];

for (const sec of all) {
  if (sec.study) {
    withStudy++;
    whys += sec.study.path.length;
    if (sec.study.intro.length !== 3) problems.push(`${sec.id}: intro paras = ${sec.study.intro.length}`);
  }
  if (BATCH5.has(sec.id)) {
    if (!sec.study) { problems.push(`${sec.id}: MISSING study`); continue; }
    if (sec.study.path.length !== sec.slugs.length) {
      problems.push(`${sec.id}: path ${sec.study.path.length} vs slugs ${sec.slugs.length}`);
    }
    const slugSet = new Set(sec.slugs);
    for (const p of sec.study.path) {
      if (!slugSet.has(p.slug)) problems.push(`${sec.id}: bad path slug ${p.slug}`);
      if (!p.why || p.why.length < 60) problems.push(`${sec.id}: thin why for ${p.slug}`);
    }
  }
}

const lc = all.filter((s) => (s as any).band !== 'df' || true); // both arrays are LC band here
console.log(`sections total: ${all.length}; with study: ${withStudy}; path whys total: ${whys}`);
console.log(`batch-5 sections found: ${all.filter((s) => BATCH5.has(s.id)).length}/14`);
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'ALL CONSISTENT');
