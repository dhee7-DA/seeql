import { LC_ALL, LC_COMPANIES } from "../src/lib/leetcode/registry";
import { CONTEST_COMPANIES, LC_FILTER_COMPANIES } from "../src/lib/leetcode/lc-meta";

const total = LC_ALL.length;
const tagged = LC_ALL.filter((p) => p.companies.length > 0).length;
console.log(`registry: ${total} problems · ${tagged} with ≥1 company tag (${Math.round((tagged / total) * 100)}%)`);
console.log(`distinct companies: ${LC_COMPANIES.length}`);
console.log(`filter companies: ${LC_FILTER_COMPANIES.length} · contest-eligible (≥12): ${CONTEST_COMPANIES.length}`);
console.log("\ntop 15 pools:");
for (const c of [...LC_FILTER_COMPANIES].sort((a, b) => b.count - a.count).slice(0, 15))
  console.log(`  ${c.name.padEnd(18)} ${c.count}`);
console.log("\nsmallest 8 pools:");
for (const c of [...LC_FILTER_COMPANIES].sort((a, b) => a.count - b.count).slice(0, 8))
  console.log(`  ${c.name.padEnd(18)} ${c.count}`);
// SQL-only view: contest company runs pull from the whole registry — how much of each pool is actually SQL?
const sqlOnly = CONTEST_COMPANIES.slice(0, 10).map((c) => {
  const probs = LC_ALL.filter((p) => p.companies.includes(c.name));
  const sql = probs.filter((p) => p.sql).length;
  return `${c.name}: ${sql}/${probs.length} SQL`;
});
console.log("\nSQL share of top-10 pools:"); for (const s of sqlOnly) console.log("  " + s);
