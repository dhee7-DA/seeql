// Task 70 — live API grading smoke test for batch-10 problems (dev server :3000).
import { SQL_FINAL_FREE } from "../src/lib/leetcode/registry-sql-final-free";
import { SQL_FREE_CLASSICS } from "../src/lib/leetcode/content/sql-free-classics";
import { SQL_FREE_WINDOWS } from "../src/lib/leetcode/content/sql-free-windows";
import { SQL_FREE_PARSING } from "../src/lib/leetcode/content/sql-free-parsing";
import { SQL_FREE_ORG } from "../src/lib/leetcode/content/sql-free-org";
import { SQL_FREE_MARKET } from "../src/lib/leetcode/content/sql-free-market";
import { lcSqlDive } from "../src/lib/leetcode/content/content";

const samples = [
  "find-invalid-ip-addresses", // Hard, recursive octet splitter
  "analyze-organization-hierarchy", // Hard, recursive subtree totals
  "first-letter-capitalization-ii", // Hard, stop-word capitalizer
  "human-traffic-of-stadium", // Hard, islands
  "find-category-recommendation-pairs", // Hard, both orientations
];

const dives = new Map(
  [...SQL_FREE_CLASSICS, ...SQL_FREE_WINDOWS, ...SQL_FREE_PARSING, ...SQL_FREE_ORG, ...SQL_FREE_MARKET].map((d) => [d.slug, d]),
);
const rows = new Map(SQL_FINAL_FREE.map((r) => [r[1], r]));

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
for (const r of SQL_FINAL_FREE) {
  if (!lcSqlDive(r[1])) { fails++; console.log("MISSING dive for", r[1]); }
}
console.log(fails === 0 ? `SMOKE PASS (${samples.length} graded, ${SQL_FINAL_FREE.length} wired)` : `SMOKE FAIL ${fails}`);
