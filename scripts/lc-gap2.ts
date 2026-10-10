// Find missing non-SQL rows whose primary topic is NOT in LC_TOPICS,
// plus list slugs already present in orphaned arrays-2.ts.
import { LC_ALL, LC_TOPICS } from "../src/lib/leetcode/registry";
import { CONTENT_SLUGS } from "../src/lib/leetcode/content/content";

const have = new Set(CONTENT_SLUGS);
const missing = LC_ALL.filter((p) => !p.sql && !have.has(p.slug));
const off = missing.filter((p) => !LC_TOPICS.includes(p.topics[0]));
console.log(`missing: ${missing.length}, off-canonical-topic: ${off.length}`);
const byTopic = new Map<string, string[]>();
for (const p of off) {
  const t = p.topics.join("/");
  if (!byTopic.has(t)) byTopic.set(t, []);
  byTopic.get(t)!.push(`${p.num} ${p.slug} | ${p.difficulty} | ${p.free ? "free" : "premium"}`);
}
for (const [t, rows] of [...byTopic.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n## ${t} (${rows.length})`);
  for (const r of rows) console.log(`  ${r}`);
}
