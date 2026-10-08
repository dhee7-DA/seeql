// Task 68 — live API grading smoke test for batch-8 problems (dev server :3000).
import { SQL_PREMIUM4 } from "../src/lib/leetcode/registry-sql-premium4";
import { SQL_PREMIUM4_FLOW } from "../src/lib/leetcode/content/sql-premium4-flow";
import { SQL_PREMIUM4_MONEY } from "../src/lib/leetcode/content/sql-premium4-money";
import { SQL_PREMIUM4_STREAKS } from "../src/lib/leetcode/content/sql-premium4-streaks";
import { SQL_PREMIUM4_CITY } from "../src/lib/leetcode/content/sql-premium4-city";
import { SQL_PREMIUM4_BOARDS } from "../src/lib/leetcode/content/sql-premium4-boards";
import { SQL_PREMIUM4_SOCIAL } from "../src/lib/leetcode/content/sql-premium4-social";
import { lcSqlDive } from "../src/lib/leetcode/content/content";

const samples = [
  "viewers-turned-streamers", // Hard, first-event gate
  "maximize-items", // Hard, floor-division argmax
  "consecutive-transactions-with-increasing-amounts", // Hard, LAG islands
  "rolling-average-steps", // Medium, julianday RANGE frame
  "customers-with-maximum-number-of-transactions-on-consecutive-days", // Hard, date islands
];

const dives = new Map(
  [...SQL_PREMIUM4_FLOW, ...SQL_PREMIUM4_MONEY, ...SQL_PREMIUM4_STREAKS, ...SQL_PREMIUM4_CITY, ...SQL_PREMIUM4_BOARDS, ...SQL_PREMIUM4_SOCIAL].map((d) => [d.slug, d]),
);
const rows = new Map(SQL_PREMIUM4.map((r) => [r[1], r]));

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
  console.log(`${ok ? "ok  " : "FAIL"} ${slug} (LC ${reg[0]}, ${["E", "M", "H"][reg[3]]}) — ${JSON.stringify(j).slice(0, 130)}`);
}
for (const r of SQL_PREMIUM4) {
  if (!lcSqlDive(r[1])) { fails++; console.log("MISSING dive for", r[1]); }
}
console.log(fails === 0 ? `SMOKE PASS (${samples.length} graded, ${SQL_PREMIUM4.length} wired)` : `SMOKE FAIL ${fails}`);
