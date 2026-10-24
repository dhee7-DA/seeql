import { LC_ALL } from "../src/lib/leetcode/registry";
import { CONTEST_COMPANIES } from "../src/lib/leetcode/lc-meta";
console.log("contest-eligible companies — SQL pool vs the 5 needed for a Company run:");
for (const c of CONTEST_COMPANIES) {
  const sql = LC_ALL.filter((p) => p.sql && p.companies.includes(c.name)).length;
  console.log(`  ${c.name.padEnd(12)} sql:${String(sql).padStart(3)}  ${sql < 5 ? "⚠ run can't fill 5 slots" : "ok"}`);
}
