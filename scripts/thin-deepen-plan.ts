// Thin-breakdown deepening plan: list every flagged dive's short paragraphs
// (index, char count, full text) so each can be lengthened in place.
import { LC_ALL } from "../src/lib/leetcode/registry";
import { lcSqlDive } from "../src/lib/leetcode/content/content";

const sqlRows = LC_ALL.filter((p) => p.sql);
for (const p of sqlRows) {
  const d = lcSqlDive(p.slug);
  if (!d) continue;
  const short = d.breakdown
    .map((t, i) => ({ i, t, len: t.length }))
    .filter((x) => x.len < 240);
  if (short.length === 0) continue;
  console.log(`\n### ${p.slug} (${p.difficulty})`);
  for (const s of short) {
    console.log(`  [para ${s.i}] ${s.len} chars:`);
    console.log(`    "${s.t}"`);
  }
}
console.log("\nDONE");
