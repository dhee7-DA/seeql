// Round 8 status probe — how many companies + domains are covered
import { LC_ALL, LC_TOPICS, LC_COMPANIES } from "../src/lib/leetcode/registry";
import { TRACK_COMPANIES, companySqlTrack } from "../src/lib/leetcode/company-tracks";

// distinct companies actually tagged on problems (real interviewers)
const tag = new Map<string, number>();
for (const p of LC_ALL) {
  for (const c of p.companies) tag.set(c, (tag.get(c) ?? 0) + 1);
}
// pseudo-tags that are not employers (mirror the TRACK_COMPANIES comment)
const PSEUDO = new Set(["LeetCode", "Premium", "SQL 50", "Top Interview 150", "Ace the SQL Interview"]);
const real = [...tag.entries()].filter(([n]) => !PSEUDO.has(n));

const withSql = real.filter(([n]) => LC_ALL.some((p) => p.sql && p.companies.includes(n)));
const sqlCounts = withSql.map(([n]) => [n, LC_ALL.filter((p) => p.sql && p.companies.includes(n)).length] as const)
  .sort((a, b) => b[1] - a[1]);

console.log("LC_ALL total problems:", LC_ALL.length);
console.log("sql:true problems:", LC_ALL.filter((p) => p.sql).length);
console.log("");
console.log("distinct company tags (all):", tag.size);
console.log("real employer companies (pseudo-tags removed):", real.length);
console.log("employers with >=1 SQL problem (openable track):", withSql.length);
console.log("");
console.log("featured TRACK_COMPANIES:", TRACK_COMPANIES.length, "->", TRACK_COMPANIES.join(", "));
console.log("");
console.log("top employers by SQL pool depth (first 15):");
for (const [n, c] of sqlCounts.slice(0, 15)) console.log(`  ${n}: ${c} SQL problems`);
console.log("");
console.log("domains/topics (LC_TOPICS):", LC_TOPICS.length);
console.log("  " + LC_TOPICS.join(", "));

// how many topics actually have >=1 SQL problem
const topicCov = LC_TOPICS.filter((t) => LC_ALL.some((p) => p.sql && p.topics.includes(t)));
console.log("topics with SQL coverage:", topicCov.length, "/", LC_TOPICS.length);
