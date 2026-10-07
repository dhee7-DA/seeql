// Task 61 — sections integrity check.
// Verifies the 7 SQL 50 sections cover the SQL band exactly 1:1, and that
// every problem in every section is fully built (deep-dive + sandbox spec):
// registry row (sql=true) ↔ section slug ↔ lcSqlDive ↔ lcSqlExpected.

import { LC_ALL } from "../src/lib/leetcode/registry";
import { SQL50_SECTIONS, SQL50_SLUGS, sqlSectionOf } from "../src/lib/leetcode/sections";
import { lcSqlDive } from "../src/lib/leetcode/content/content";
import { lcSqlExpected } from "../src/lib/leetcode/content/sql-expected";

let fail = 0;
const bad = (msg: string) => {
  fail++;
  console.error(`FAIL ${msg}`);
};

// 1. Sections cover exactly the SQL rows of the registry.
const sqlRows = LC_ALL.filter((p) => p.sql);
const sqlSlugs = new Set(sqlRows.map((p) => p.slug));
const sectionSlugs = new Set(SQL50_SLUGS);

if (sqlRows.length !== SQL50_SLUGS.length) bad(`registry has ${sqlRows.length} SQL rows, sections list ${SQL50_SLUGS.length}`);
for (const s of sqlSlugs) if (!sectionSlugs.has(s)) bad(`registry SQL row "${s}" is in no section`);
for (const s of sectionSlugs) if (!sqlSlugs.has(s)) bad(`section slug "${s}" is not a SQL registry row`);

// 2. No duplicate slugs across sections.
const seen = new Map<string, string>();
for (const sec of SQL50_SECTIONS) {
  for (const s of sec.slugs) {
    if (seen.has(s)) bad(`slug "${s}" appears in "${seen.get(s)}" AND "${sec.id}"`);
    else seen.set(s, sec.id);
  }
}

// 3. Titles + ids unique, slugs resolve to rows.
const titles = SQL50_SECTIONS.map((s) => s.title);
if (new Set(titles).size !== titles.length) bad("section titles are not unique");
const ids = SQL50_SECTIONS.map((s) => s.id);
if (new Set(ids).size !== ids.length) bad("section ids are not unique");
for (const s of SQL50_SLUGS) if (!LC_ALL.find((p) => p.slug === s)) bad(`slug "${s}" does not resolve to a registry row`);

// 4. Fully built: deep-dive + expected spec present for every section slug.
for (const sec of SQL50_SECTIONS) {
  for (const s of sec.slugs) {
    if (!lcSqlDive(s)) bad(`"${s}" (${sec.id}) has no SQL deep-dive`);
    if (!lcSqlExpected(s)) bad(`"${s}" (${sec.id}) has no expected-result spec (not gradeable)`);
    if (!sqlSectionOf(s)) bad(`"${s}" does not map back to a section`);
  }
}

// 5. Section counts sanity.
const counts = SQL50_SECTIONS.map((s) => `${s.id}=${s.slugs.length}`).join(" ");
console.log(`sections: ${SQL50_SECTIONS.length} · ${counts}`);
console.log(`sql rows in registry: ${sqlRows.length} · sql deep-dives: ${SQL50_SLUGS.filter((s) => lcSqlDive(s)).length} · gradeable: ${SQL50_SLUGS.filter((s) => lcSqlExpected(s)).length}`);

if (fail > 0) {
  console.error(`\n${fail} FAILURES`);
  process.exit(1);
}
console.log("\nALL PASS — 7 sections cover the SQL 50 exactly 1:1, every problem fully built and gradeable.");
