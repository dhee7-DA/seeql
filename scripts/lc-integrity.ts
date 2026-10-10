// Final integrity check: duplicate slugs across ALL dives (algorithm + SQL),
// slug<->registry cross-check, XP correctness by difficulty.
import { LC_ALL } from "../src/lib/leetcode/registry";
import { LC_CONTENT, LC_SQL_CONTENT } from "../src/lib/leetcode/content/content";

const errs: string[] = [];

// duplicate slugs within and across
const seen = new Map<string, number>();
for (const d of LC_CONTENT) seen.set(d.slug, (seen.get(d.slug) ?? 0) + 1);
for (const d of LC_SQL_CONTENT) seen.set(d.slug, (seen.get(d.slug) ?? 0) + 1);
for (const [s, n] of seen) if (n > 1) errs.push(`duplicate slug: ${s} x${n}`);

// every dive maps to a registry row
const reg = new Set(LC_ALL.map((p) => p.slug));
for (const d of LC_CONTENT) if (!reg.has(d.slug)) errs.push(`no registry row: ${d.slug}`);
for (const d of LC_SQL_CONTENT) if (!reg.has(d.slug)) errs.push(`no registry row: ${d.slug}`);

// algorithm dives: sql rows must NOT appear
const sqlRows = new Set(LC_ALL.filter((p) => p.sql).map((p) => p.slug));
for (const d of LC_CONTENT) if (sqlRows.has(d.slug)) errs.push(`sql row has algorithm dive: ${d.slug}`);

// xp correctness
const XP: Record<string, number> = { Easy: 10, Medium: 20, Hard: 35 };
const bySlug = new Map(LC_ALL.map((p) => [p.slug, p]));
for (const d of LC_CONTENT) {
  const p = bySlug.get(d.slug);
  if (p && d.xp !== XP[p.difficulty]) errs.push(`wrong xp: ${d.slug} ${d.xp} vs ${XP[p.difficulty]}`);
}
for (const d of LC_SQL_CONTENT) {
  const p = bySlug.get(d.slug);
  if (p && d.xp !== XP[p.difficulty]) errs.push(`wrong xp: ${d.slug} ${d.xp} vs ${XP[p.difficulty]}`);
}

// coverage
const algCoverage = LC_CONTENT.length;
const sqlCoverage = LC_SQL_CONTENT.length;
const nonSql = LC_ALL.filter((p) => !p.sql).length;
const sql = LC_ALL.filter((p) => p.sql).length;
console.log(`registry: ${LC_ALL.length} rows (${nonSql} non-SQL + ${sql} SQL)`);
console.log(`dives: ${algCoverage} algorithm + ${sqlCoverage} SQL = ${algCoverage + sqlCoverage}`);
const missingAlg = LC_ALL.filter((p) => !p.sql && !seen.has(p.slug));
const missingSql = LC_ALL.filter((p) => p.sql && !seen.has(p.slug));
if (missingAlg.length) errs.push(`missing algorithm dives: ${missingAlg.map((p) => p.slug).join(", ")}`);
if (missingSql.length) errs.push(`missing SQL dives: ${missingSql.map((p) => p.slug).join(", ")}`);

if (errs.length) {
  console.error(`FAIL (${errs.length}):`);
  for (const e of errs) console.error("  - " + e);
  process.exit(1);
}
console.log("INTEGRITY OK — 359/359 registry rows have deep dives, no dupes, xp correct");
