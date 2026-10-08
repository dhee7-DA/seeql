// Task 69 — live API grading smoke test for batch-9 problems (dev server :3000).
import { SQL_PREMIUM5 } from "../src/lib/leetcode/registry-sql-premium5";
import { SQL_PREMIUM5_TRENDS } from "../src/lib/leetcode/content/sql-premium5-trends";
import { SQL_PREMIUM5_SYSTEM } from "../src/lib/leetcode/content/sql-premium5-system";
import { SQL_PREMIUM5_LEAGUE } from "../src/lib/leetcode/content/sql-premium5-league";
import { SQL_PREMIUM5_GRAPH } from "../src/lib/leetcode/content/sql-premium5-graph";
import { SQL_PREMIUM5_PASSES } from "../src/lib/leetcode/content/sql-premium5-passes";
import { SQL_PREMIUM5_MARKET } from "../src/lib/leetcode/content/sql-premium5-market";
import { SQL_PREMIUM5_FINALS } from "../src/lib/leetcode/content/sql-premium5-finales";
import { lcSqlDive } from "../src/lib/leetcode/content/content";

const samples = [
  "find-trending-hashtags-ii", // recursive tokenizer + DISTINCT authors
  "calculate-trapping-rain-water", // twin window maxes
  "find-circular-gift-exchange-chains", // bounded cycle chase
  "find-overlapping-shifts-ii", // sweep line
  "first-letter-capitalization", // recursive transform
];

const dives = new Map(
  [...SQL_PREMIUM5_TRENDS, ...SQL_PREMIUM5_SYSTEM, ...SQL_PREMIUM5_LEAGUE, ...SQL_PREMIUM5_GRAPH, ...SQL_PREMIUM5_PASSES, ...SQL_PREMIUM5_MARKET, ...SQL_PREMIUM5_FINALS].map((d) => [d.slug, d]),
);
const rows = new Map(SQL_PREMIUM5.map((r) => [r[1], r]));

let fails = 0;
for (const slug of samples) {
  const d = dives.get(slug)!;
  const reg = rows.get(slug)!;
  const res = await fetch("http://localhost:3000/api/lc-sql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, sql: d.code }),
  });
  const j: any = await res.json();
  const ok = j.ok === true;
  if (!ok) fails++;
  console.log(`${ok ? "ok  " : "FAIL"} ${slug} (LC ${reg[0]}, ${["E", "M", "H"][reg[3]]}) — ${JSON.stringify(j).slice(0, 120)}`);
}
for (const r of SQL_PREMIUM5) {
  if (!lcSqlDive(r[1])) { fails++; console.log("MISSING dive for", r[1]); }
}
console.log(fails === 0 ? `SMOKE PASS (${samples.length} graded, ${SQL_PREMIUM5.length} wired)` : `SMOKE FAIL ${fails}`);
