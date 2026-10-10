// Task 75 — structural audit of the Data & Finance teaching-layer retrofit:
// EVERY Data & Finance dive (48) must now carry a complete, house-shaped
// primer; every section (8) a complete study guide; every slug an art entry
// and a label. Fails loudly with per-problem detail.
import { DATAFIN_SECTIONS } from "../src/lib/leetcode/sections";
import { lcSqlDive, LC_SQL_CONTENT } from "../src/lib/leetcode/content/content";
import type { LcSqlDive } from "../src/lib/leetcode/types";

let fails = 0;
const bad = (msg: string) => { fails += 1; console.log(`  FAIL ${msg}`); };

const bySlug = new Map(LC_SQL_CONTENT.map((p) => [p.slug, p]));
const datafinSlugs = DATAFIN_SECTIONS.flatMap((s) => s.slugs);

console.log(`Data & Finance: ${DATAFIN_SECTIONS.length} sections, ${datafinSlugs.length} problems`);

for (const sec of DATAFIN_SECTIONS) {
  // study guide completeness
  if (!sec.study) bad(`${sec.id}: missing study`);
  else {
    if (sec.study.intro.length < 3) bad(`${sec.id}: study.intro ${sec.study.intro.length} < 3`);
    if (!sec.study.flow) bad(`${sec.id}: study.flow missing`);
    if (sec.study.path.length !== sec.slugs.length) bad(`${sec.id}: study.path ${sec.study.path.length} != ${sec.slugs.length}`);
    const pathSet = new Set(sec.study.path.map((p) => p.slug));
    for (const s of sec.slugs) if (!pathSet.has(s)) bad(`${sec.id}: study.path missing ${s}`);
    for (const p of sec.study.path) if (!bySlug.has(p.slug)) bad(`${sec.id}: study.path ghost slug ${p.slug}`);
    if (!pathSet) bad(`${sec.id}: path set`);
  }
  for (const slug of sec.slugs) {
    const dive = lcSqlDive(slug) as LcSqlDive | undefined;
    if (!dive) { bad(`${slug}: NO DIVE`); continue; }
    const primer = dive.primer;
    if (!primer) { bad(`${slug}: primer MISSING`); continue; }
    const n = (x: unknown) => (Array.isArray(x) ? x.length : -1);
    if (n(primer.concept) < 3 || n(primer.concept) > 4) bad(`${slug}: concept ${n(primer.concept)}`);
    if (n(primer.worked) < 3 || n(primer.worked) > 5) bad(`${slug}: worked ${n(primer.worked)}`);
    if (n(primer.glossary) < 4 || n(primer.glossary) > 6) bad(`${slug}: glossary ${n(primer.glossary)}`);
    if (n(primer.reallife) < 2 || n(primer.reallife) > 3) bad(`${slug}: reallife ${n(primer.reallife)}`);
    const hookSents = (primer.hook.match(/[.!?](\s|$)/g) ?? []).length;
    if (hookSents !== 1) bad(`${slug}: hook sentences ${hookSents} != 1`);
    const whereSents = (primer.where.match(/[.!?](\s|$)/g) ?? []).length;
    if (whereSents !== 1) bad(`${slug}: where sentences ${whereSents} != 1`);
    const terms = new Set(primer.glossary.map((g) => g.term.toLowerCase()));
    if (terms.size !== primer.glossary.length) bad(`${slug}: duplicate glossary terms`);
    for (const g of primer.glossary) if (g.def.trim().length < 10) bad(`${slug}: thin def for ${g.term}`);
    for (const [label, arr, min] of [["concept", primer.concept, 12], ["reallife", primer.reallife, 12], ["worked", primer.worked, 5]] as const)
      if (arr.some((s) => s.trim().split(/\s+/).length < min)) bad(`${slug}: thin ${label} paragraph`);
  }
}

// art + label coverage — regex-parse the wired files (no React import needed)
import { readFileSync } from "node:fs";
const artSrc = readFileSync("src/components/learn/lc-df-art.tsx", "utf8");
const primerSrc = readFileSync("src/components/learn/lc-primer.tsx", "utf8");
for (const slug of datafinSlugs) {
  if (!new RegExp(`"${slug}":\\s*Art`, "m").test(artSrc)) bad(`${slug}: no PRIMER_ART entry in lc-df-art.tsx`);
  if (!new RegExp(`"${slug}":\\s*"concept`, "m").test(primerSrc)) bad(`${slug}: no PRIMER_ART_LABEL in lc-primer.tsx`);
}
for (const sec of DATAFIN_SECTIONS) if (sec.study && !artSrc.includes(`"${sec.study.flow}": ArtStudy`)) bad(`${sec.id}: flow ${sec.study.flow} not in STUDY_FLOW`);

console.log(fails === 0 ? "ALL PRIMER AUDITS PASS" : `${fails} FAILURES`);
if (fails > 0) process.exit(1);
