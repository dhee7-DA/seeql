// Dump dive mechanics (title, difficulty, approach, statement) for the batch-5 sections
// so study-guide path whys are grounded in real dive content.
import { SQL50_SECTIONS } from '../src/lib/leetcode/sections';
import { LC_SQL_CONTENT, lcSqlDive } from '../src/lib/leetcode/content/content';

const BATCH = new Set([
  'analytics-funnels',
  'premium5-trends',
  'premium5-system',
  'premium5-league',
  'premium5-graph',
  'premium5-market',
  'premium5-finales',
  'free-classics',
  'free-windows',
  'free-formats',
  'free-org',
  'free-pairs',
  'final-habits',
  'final-ops',
]);

const diveBySlug = new Map<string, any>();
for (const d of LC_SQL_CONTENT as any[]) diveBySlug.set(d.slug, d);

for (const sec of SQL50_SECTIONS) {
  if (!BATCH.has(sec.id)) continue;
  console.log('\n########## SECTION ' + sec.id + ' — ' + sec.title + ' (' + sec.slugs.length + 'p) ##########');
  for (const slug of sec.slugs) {
    const d = diveBySlug.get(slug);
    if (!d) {
      console.log('  !! NO DIVE for ' + slug);
      continue;
    }
    const approach = typeof d.approach === 'string' ? d.approach : JSON.stringify(d.approach);
    console.log('\n=== ' + slug + ' | ' + d.title + ' | ' + (d.difficulty ?? '?') + ' ===');
    console.log('APPROACH: ' + approach.slice(0, 900));
    if (d.breakdown) {
      const bd = Array.isArray(d.breakdown) ? d.breakdown.join(' | ') : String(d.breakdown);
      console.log('BREAKDOWN[0..600]: ' + bd.slice(0, 600));
    }
  }
}
