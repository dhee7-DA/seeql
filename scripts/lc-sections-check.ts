// Sections integrity check (Task 61, extended by Task 72).
// Verifies the sandbox-graded SQL bands (Module 12 "SQL 50+" + Module 13
// "Data & Finance") cover every registry SQL row exactly 1:1, and that
// every problem in every section is fully built (deep-dive + sandbox spec):
// registry row (sql=true) ↔ section slug ↔ lcSqlDive ↔ lcSqlExpected.

import { LC_ALL } from "../src/lib/leetcode/registry";
import {
  SQL50_SECTIONS,
  SQL50_SLUGS,
  DATAFIN_SECTIONS,
  DATAFIN_SLUGS,
  SQL_ALL_SECTIONS,
  sqlSectionOf,
} from "../src/lib/leetcode/sections";
import { lcSqlDive } from "../src/lib/leetcode/content/content";
import { lcSqlExpected } from "../src/lib/leetcode/content/sql-expected";

let fail = 0;
const bad = (msg: string) => {
  fail++;
  console.error(`FAIL ${msg}`);
};

// 1. The UNION of both bands covers exactly the SQL rows of the registry.
const sqlRows = LC_ALL.filter((p) => p.sql);
const sqlSlugs = new Set(sqlRows.map((p) => p.slug));
const bandSlugs = [...SQL50_SLUGS, ...DATAFIN_SLUGS];
const sectionSlugs = new Set(bandSlugs);

if (sqlRows.length !== sectionSlugs.size) bad(`registry has ${sqlRows.length} SQL rows, sections list ${sectionSlugs.size}`);
for (const s of sqlSlugs) if (!sectionSlugs.has(s)) bad(`registry SQL row "${s}" is in no section`);
for (const s of sectionSlugs) if (!sqlSlugs.has(s)) bad(`section slug "${s}" is not a SQL registry row`);

// 1b. The two bands are disjoint (a problem lives in exactly one module).
const m12 = new Set(SQL50_SLUGS);
for (const s of DATAFIN_SLUGS) if (m12.has(s)) bad(`slug "${s}" appears in BOTH band modules`);

// 2. No duplicate slugs across sections.
const seen = new Map<string, string>();
for (const sec of SQL_ALL_SECTIONS) {
  for (const s of sec.slugs) {
    if (seen.has(s)) bad(`slug "${s}" appears in "${seen.get(s)}" AND "${sec.id}"`);
    else seen.set(s, sec.id);
  }
}

// 3. Titles + ids unique, slugs resolve to rows.
const titles = SQL_ALL_SECTIONS.map((s) => s.title);
if (new Set(titles).size !== titles.length) bad("section titles are not unique");
const ids = SQL_ALL_SECTIONS.map((s) => s.id);
if (new Set(ids).size !== ids.length) bad("section ids are not unique");
for (const s of bandSlugs) if (!LC_ALL.find((p) => p.slug === s)) bad(`slug "${s}" does not resolve to a registry row`);

// 4. Fully built: deep-dive + expected spec present for every section slug.
for (const sec of SQL_ALL_SECTIONS) {
  for (const s of sec.slugs) {
    if (!lcSqlDive(s)) bad(`"${s}" (${sec.id}) has no SQL deep-dive`);
    if (!lcSqlExpected(s)) bad(`"${s}" (${sec.id}) has no expected-result spec (not gradeable)`);
    if (!sqlSectionOf(s)) bad(`"${s}" does not map back to a section`);
  }
}

// 5. Section counts sanity.
const counts = SQL_ALL_SECTIONS.map((s) => `${s.id}=${s.slugs.length}`).join(" ");
console.log(`sections: ${SQL_ALL_SECTIONS.length} (SQL50 ${SQL50_SECTIONS.length} + datafin ${DATAFIN_SECTIONS.length}) · ${counts}`);
console.log(`sql rows in registry: ${sqlRows.length} · sql deep-dives: ${sectionSlugs.size > 0 ? bandSlugs.filter((s) => lcSqlDive(s)).length : 0} · gradeable: ${bandSlugs.filter((s) => lcSqlExpected(s)).length}`);

if (fail > 0) {
  console.error(`\n${fail} FAILURES`);
  process.exit(1);
}
console.log("\nALL PASS — the SQL sections cover both bands exactly 1:1, every problem fully built and gradeable.");
