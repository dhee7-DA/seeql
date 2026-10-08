// Task 67 — live API grading smoke test for batch-7 problems (dev server :3000).
import { SQL_PREMIUM3 } from "../src/lib/leetcode/registry-sql-premium3";
import { SQL_PREMIUM3_STATS } from "../src/lib/leetcode/content/sql-premium3-stats";
import { SQL_PREMIUM3_COMMERCE } from "../src/lib/leetcode/content/sql-premium3-commerce";
import { SQL_PREMIUM3_ARENA } from "../src/lib/leetcode/content/sql-premium3-arena";
import { SQL_PREMIUM3_MOLD } from "../src/lib/leetcode/content/sql-premium3-mold";
import { SQL_PREMIUM3_OPS } from "../src/lib/leetcode/content/sql-premium3-ops";
import { SQL_PREMIUM3_FINALS } from "../src/lib/leetcode/content/sql-premium3-finales";
import { lcSqlDive } from "../src/lib/leetcode/content/content";

const samples = [
  "drop-type-1-orders-for-customers-with-type-0-orders", // the write problem
  "find-cutoff-score-for-each-school",
  "the-number-of-passengers-in-each-bus-ii", // hardest authoring case
  "build-the-equation",
  "leetcodify-similar-friends",
];

const dives = new Map(
  [...SQL_PREMIUM3_STATS, ...SQL_PREMIUM3_COMMERCE, ...SQL_PREMIUM3_ARENA, ...SQL_PREMIUM3_MOLD, ...SQL_PREMIUM3_OPS, ...SQL_PREMIUM3_FINALS].map((d) => [d.slug, d]),
);
const rows = new Map(SQL_PREMIUM3.map((r) => [r[1], r]));

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
  console.log(`${ok ? "ok  " : "FAIL"} ${slug} (LC ${reg[0]}, ${["E", "M", "H"][reg[3]]}) — ${JSON.stringify(j).slice(0, 140)}`);
}
// every batch-7 dive must have a dive + registry row
for (const r of SQL_PREMIUM3) {
  if (!lcSqlDive(r[1])) { fails++; console.log("MISSING dive for", r[1]); }
}
console.log(fails === 0 ? `SMOKE PASS (${samples.length} graded, ${SQL_PREMIUM3.length} wired)` : `SMOKE FAIL ${fails}`);
