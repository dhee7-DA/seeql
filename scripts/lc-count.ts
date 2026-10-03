import { NC150 } from "../src/lib/leetcode/registry-nc150";
import { TI150_EXTRAS } from "../src/lib/leetcode/registry-ti150";
import { SQL50 } from "../src/lib/leetcode/registry-sql50";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { CONTENT_SLUGS } from "../src/lib/leetcode/content/content";

const list = (name: string, arr: any[][]) => {
  const slugs = new Set(arr.map((r) => r[1]));
  console.log(`${name}: ${arr.length} rows, ${slugs.size} unique slugs`);
  return slugs;
};

console.log("=== RAW SOURCES ===");
const nc = list("NeetCode 150", NC150);
const ti = list("TI150_EXTRAS (TI150 uniques)", TI150_EXTRAS);
const sq = list("SQL 50", SQL50);

const overlapNcTi = [...ti].filter((s) => nc.has(s)).length;
const overlapNcSq = [...sq].filter((s) => nc.has(s)).length;
const overlapTiSq = [...sq].filter((s) => ti.has(s)).length;
console.log(`\noverlaps remaining in files: NC∩TIextras=${overlapNcTi}, NC∩SQL=${overlapNcSq}, TI∩SQL=${overlapTiSq}`);

console.log("\n=== FINAL REGISTRY ===");
console.log("LC_ALL total:", LC_ALL.length);

const byList: Record<string, number> = {};
const byDiff: Record<string, number> = {};
for (const p of LC_ALL) {
  for (const l of p.lists) byList[l] = (byList[l] ?? 0) + 1;
  byDiff[p.difficulty] = (byDiff[p.difficulty] ?? 0) + 1;
}
console.log("by list tag:", byList);
console.log("by difficulty:", byDiff);

console.log("\n=== COVERAGE ===");
console.log("deep-dives authored:", CONTENT_SLUGS.length, `/ ${LC_ALL.length} = ${((CONTENT_SLUGS.length / LC_ALL.length) * 100).toFixed(1)}%`);

// coverage by topic
const covered = new Set(CONTENT_SLUGS);
const byTopic: Record<string, { total: number; done: number }> = {};
for (const p of LC_ALL) {
  for (const t of p.topics) {
    byTopic[t] ??= { total: 0, done: 0 };
    byTopic[t].total++;
    if (covered.has(p.slug)) byTopic[t].done++;
  }
}
console.log("\nby topic:");
for (const [t, v] of Object.entries(byTopic).sort((a, b) => b[1].total - a[1].total))
  console.log(`  ${t}: ${v.done}/${v.total}`);
