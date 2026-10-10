// Enumerate all non-SQL registry rows lacking deep-dive content, grouped by topic.
import { LC_ALL, LC_TOPICS } from "../src/lib/leetcode/registry";
import { CONTENT_SLUGS } from "../src/lib/leetcode/content/content";

const have = new Set(CONTENT_SLUGS);
const nonSql = LC_ALL.filter((p) => !p.sql);
const missing = nonSql.filter((p) => !have.has(p.slug));
const byTopic = new Map<string, typeof missing>();
for (const p of missing) {
  const t = p.topics[0];
  if (!byTopic.has(t)) byTopic.set(t, []);
  byTopic.get(t)!.push(p);
}
console.log(`non-SQL rows: ${nonSql.length}, have content: ${nonSql.length - missing.length}, MISSING: ${missing.length}`);
for (const t of LC_TOPICS) {
  const rows = byTopic.get(t);
  if (!rows) continue;
  console.log(`\n## ${t} (${rows.length})`);
  for (const p of rows) console.log(`  ${p.num} ${p.slug} | ${p.difficulty} | ${p.free ? "free" : "premium"}`);
}
