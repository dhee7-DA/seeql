// Coverage census — keyword × module × practice-source for the coverage workbook.
// Sources (LIVE registries only, per the orphan rule):
//   MCQs            — LESSONS[].mcqs (module via MODULES membership)
//   Query problems  — LESSONS[].problems
//   Case files      — CASES (module via CASE_TOPICS.lessonNum; "cap" = cross-module)
//   Fills           — fills/m01..m09 FILLS_BY_LESSON (module = file, lesson = key)
//   Drill questions — DRILL_SETS (exact keyword + module fields)
// Keyword tagging: two-scope scan — sqlText (solutions / templates / answer chips)
// and proseText (prompts, briefs, whys). Drill attribution is exact via a
// curated keyword map, never scanned.
// Content dimension: the same tag() runs over each LESSON's teaching material
// (blocks + deep layer + takeaway) to build the per-keyword lesson list, and
// every diagram block inherits its lesson's keywords — so each keyword row
// also carries the lessons and SVG figures that teach it.
//
//   npx tsx scripts/coverage-census.ts --report   → distinct drill keywords + per-module volumes
//   npx tsx scripts/coverage-census.ts --emit     → scripts/coverage-data.json for the xlsx builder

import { LESSONS, MODULES } from "../src/lib/curriculum/lessons";
import type { Lesson, Block, DeepBlock, FigureId } from "../src/lib/curriculum/types";
import { prettyFigureLabel } from "../src/lib/curriculum/figure-meta";
import { CASES, CASE_TOPICS } from "../src/lib/curriculum/cases";
import { GAUNTLET_BANKS } from "../src/lib/curriculum/gauntlet";
import { KEYWORD_BANKS } from "../src/lib/curriculum/keyword-banks";
import { D, tag } from "../src/lib/curriculum/keyword-taxonomy";
import type { Tagged } from "../src/lib/curriculum/keyword-taxonomy";
import { DRILL_SETS } from "../src/lib/curriculum/drills";
import { FILLS_BY_LESSON as F1 } from "../src/lib/curriculum/fills/m01";
import { FILLS_BY_LESSON as F2 } from "../src/lib/curriculum/fills/m02";
import { FILLS_BY_LESSON as F3 } from "../src/lib/curriculum/fills/m03";
import { FILLS_BY_LESSON as F4 } from "../src/lib/curriculum/fills/m04";
import { FILLS_BY_LESSON as F5 } from "../src/lib/curriculum/fills/m05";
import { FILLS_BY_LESSON as F6 } from "../src/lib/curriculum/fills/m06";
import { FILLS_BY_LESSON as F7 } from "../src/lib/curriculum/fills/m07";
import { FILLS_BY_LESSON as F8 } from "../src/lib/curriculum/fills/m08";
import { FILLS_BY_LESSON as F9 } from "../src/lib/curriculum/fills/m09";
import { writeFileSync } from "fs";

// ---------------------------------------------------------------------------
// 1. Keyword dictionary — canonical rows for the workbook.
//    Each entry: prose patterns (prompts/briefs/whys) and/or sql patterns
//    (solutions/templates/answer chips). An item is tagged when either scope
//    matches; tagging is multi-label by design.
// ---------------------------------------------------------------------------
const DRILL_MAP: Record<string, string[]> = {
  // Module 1
  "select": ["SELECT & FROM"],
  "where": ["WHERE"],
  "null": ["NULL / IS NULL"],
  "order-limit": ["ORDER BY & LIMIT"],
  "aggregates": ["Aggregates (COUNT/SUM/AVG/MIN/MAX)"],
  "groupby": ["GROUP BY"],
  "having": ["HAVING"],
  "in": ["IN (list)"],
  "between": ["BETWEEN"],
  "like": ["LIKE & wildcards"],
  "and-or-not": ["AND / OR / NOT"],
  "distinct": ["DISTINCT"],
  "coalesce": ["COALESCE & NULLIF"],
  "nullif": ["COALESCE & NULLIF"],
  // Module 2
  "inner-join": ["INNER JOIN"],
  "left-join": ["LEFT JOIN"],
  "multi-join": ["INNER JOIN"],
  "join-aggregate": ["Join fan-out & grain", "INNER JOIN"],
  "anti-join": ["Anti-join"],
  "self-join": ["SELF JOIN"],
  "on-vs-where": ["ON vs WHERE"],
  "join-edges": ["INNER JOIN", "LEFT JOIN"],
  "join-syntax": ["INNER JOIN"],
  "join-judgment": ["INNER JOIN"],
  // Module 3
  "union": ["UNION & UNION ALL"],
  "intersect": ["INTERSECT"],
  "except": ["EXCEPT"],
  "set-precedence": ["UNION & UNION ALL", "INTERSECT", "EXCEPT"],
  "set-ordering": ["ORDER BY & LIMIT", "UNION & UNION ALL"],
  "set-edges": ["UNION & UNION ALL", "INTERSECT", "EXCEPT"],
  "set-judgment": ["UNION & UNION ALL", "INTERSECT", "EXCEPT"],
  "case-when": ["CASE WHEN"],
  "case-aggregate": ["CASE WHEN", "Aggregates (COUNT/SUM/AVG/MIN/MAX)"],
  "case-sorts": ["CASE WHEN", "ORDER BY & LIMIT"],
  // Module 4
  "in-subquery": ["IN subqueries"],
  "scalar-sub": ["Scalar subqueries"],
  "exists": ["EXISTS"],
  "correlated": ["Correlated subqueries"],
  "derived": ["Derived tables"],
  "cte": ["WITH (CTE)"],
  "cte-recursive": ["WITH RECURSIVE"],
  "sub-edges": ["Subqueries (umbrella)"],
  "sub-errors": ["Subqueries (umbrella)"],
  "sub-judgment": ["Subqueries (umbrella)"],
  // Module 5
  "ranking-windows": ["RANK & DENSE_RANK", "ROW_NUMBER"],
  "window-partitions": ["OVER & PARTITION BY"],
  "lag-lead": ["LAG & LEAD"],
  "window-frames": ["Window frames"],
  "ntile": ["NTILE"],
  "window-edges": ["OVER & PARTITION BY"],
  "window-judgment": ["OVER & PARTITION BY"],
  "text-toolkit": ["Text functions"],
  "cast-coercion": ["CAST & types"],
  "date-buckets": ["Date & time functions"],
  "date-math": ["Date & time functions"],
  "date-edges": ["Date & time functions"],
  "ops-calendar": ["Date & time functions"],
  "toolkit-capstone": ["OVER & PARTITION BY", "RANK & DENSE_RANK", "LAG & LEAD", "Window frames"],
  // Modules 6-8, 11 — thin-spot patch wave
  "non-equi-joins": ["Non-equi & range joins"],
  "outer-joins": ["RIGHT JOIN", "FULL OUTER JOIN"],
  "updates-deletes": ["UPDATE", "DELETE"],
  "upsert-returning": ["UPSERT (ON CONFLICT)", "RETURNING"],
  "transactions": ["Transactions"],
  "create-table": ["CREATE TABLE"],
  "indexes-explain": ["Indexes & EXPLAIN"],
};
const UNMAPPED: Record<string, number> = {};

// ---------------------------------------------------------------------------
// 3. Normalization + scan
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// 4. Walk the live sources
// ---------------------------------------------------------------------------
const lessonToModule = new Map<number, number>();
for (const m of MODULES) for (const l of m.lessons) lessonToModule.set(l.num, m.num);

const mcqItems: Tagged[] = [];
const problemItems: Tagged[] = [];
for (const lesson of LESSONS) {
  const mod = lessonToModule.get(lesson.num) ?? null;
  for (const q of lesson.mcqs) {
    const why = (q.why ?? "") + " " + (q.notes ?? []).map((n) => n.why).join(" ");
    mcqItems.push(tag(mod, `${q.prompt} ${why}`, ""));
  }
  for (const pr of lesson.problems) {
    const hints = (pr.hints ?? []).join(" ");
    problemItems.push(tag(mod, `${pr.title} ${pr.brief} ${hints}`, pr.solution));
  }
}

const caseItems: Tagged[] = [];
for (const c of CASES) {
  const ln = CASE_TOPICS.find((t) => t.id === c.topic)?.lessonNum ?? null;
  const mod = ln != null ? (lessonToModule.get(ln) ?? null) : null;
  const slotText = c.slots.map((s) => `${s.answer} ${s.label} ${s.why}`).join(" ");
  caseItems.push(tag(mod, `${c.title} ${c.brief} ${c.ask} ${c.walkthrough} ${slotText}`, `${c.template} ${c.slots.map((s) => s.answer).join(" ")}`));
}

const fillItems: Tagged[] = [];
const FILL_MODS = [F1, F2, F3, F4, F5, F6, F7, F8, F9];
FILL_MODS.forEach((rec, i) => {
  const mod = i + 1;
  for (const [numStr, fills] of Object.entries(rec)) {
    const ln = Number(numStr);
    const modExact = lessonToModule.get(ln) ?? mod;
    for (const f of fills) {
      fillItems.push(tag(modExact, `${f.prompt} ${f.why} ${(f.notes ?? []).map((n) => n.why).join(" ")}`, `${f.template} ${f.answers.join(" ")}`));
    }
  }
});

const drillItems: Tagged[] = [];
for (const set of DRILL_SETS) {
  const mapped = DRILL_MAP[set.keyword];
  if (!mapped || mapped.length === 0) {
    UNMAPPED[set.keyword] = (UNMAPPED[set.keyword] ?? 0) + set.questions.length;
    continue;
  }
  // one item per QUESTION so counts are in question units (multi-label across mapped keywords)
  for (const _q of set.questions) {
    drillItems.push({ module: set.module, kws: new Set(mapped) });
  }
}

// Module gauntlet banks — module-end practice tiers, tagged with the same
// dictionary and attributed to their module.
for (const bank of GAUNTLET_BANKS) {
  for (const q of bank.mcqs) {
    const why = (q.why ?? "") + " " + (q.notes ?? []).map((n) => n.why).join(" ");
    mcqItems.push(tag(bank.moduleNum, `${q.prompt} ${why}`, ""));
  }
  for (const pr of bank.problems) {
    const hints = (pr.hints ?? []).join(" ");
    problemItems.push(tag(bank.moduleNum, `${pr.title} ${pr.brief} ${hints}`, pr.solution));
  }
  for (const c of bank.cases) {
    const slotText = c.slots.map((s) => `${s.answer} ${s.label} ${s.why}`).join(" ");
    caseItems.push(tag(bank.moduleNum, `${c.title} ${c.brief} ${c.ask} ${c.walkthrough} ${slotText}`, `${c.template} ${c.slots.map((s) => s.answer).join(" ")}`));
  }
}

// Keyword Mastery banks — per-keyword gap closers, tagged the same way and
// attributed to their owning module.
for (const bank of KEYWORD_BANKS) {
  for (const q of bank.mcqs) {
    const why = (q.why ?? "") + " " + (q.notes ?? []).map((n) => n.why).join(" ");
    mcqItems.push(tag(bank.moduleNum, `${q.prompt} ${why}`, ""));
  }
  for (const pr of bank.problems) {
    const hints = (pr.hints ?? []).join(" ");
    problemItems.push(tag(bank.moduleNum, `${pr.title} ${pr.brief} ${hints}`, pr.solution));
  }
  for (const c of bank.cases) {
    const slotText = c.slots.map((s) => `${s.answer} ${s.label} ${s.why}`).join(" ");
    caseItems.push(tag(bank.moduleNum, `${c.title} ${c.brief} ${c.ask} ${c.walkthrough} ${slotText}`, `${c.template} ${c.slots.map((s) => s.answer).join(" ")}`));
  }
}

// ---------------------------------------------------------------------------
// 4b. Lesson content + SVG diagrams — the "content list" dimension.
//     A lesson teaches a keyword when its teaching prose or SQL matches the
//     same dictionary via the same tag() used for every other source.
//     Each diagram block inherits its lesson's keywords.
// ---------------------------------------------------------------------------
interface LessonScan {
  num: number;
  id: string;
  title: string;
  module: number | null;
  prose: string;
  sql: string;
  figures: FigureId[];
  mcqs: number;
  problems: number;
}

function scanLesson(l: Lesson, mod: number | null): LessonScan {
  let prose = `${l.title} ${l.blurb} `;
  const sqlParts: string[] = [];
  const figures: FigureId[] = [];
  const walk = (blocks: Array<Block | DeepBlock>) => {
    for (const b of blocks) {
      switch (b.kind) {
        case "diagram":
          figures.push(b.figure);
          break;
        case "code":
          sqlParts.push(b.sql, b.caption ?? "");
          break;
        case "table":
          prose += `${b.headers.join(" ")} ${b.rows.flat().join(" ")} ${b.caption ?? ""} `;
          break;
        case "bullets":
        case "steps":
          prose += `${b.items.join(" ")} `;
          break;
        case "engine":
          prose += `${b.title} ${b.steps.join(" ")} `;
          break;
        case "myth":
          prose += `${b.myth} ${b.truth} `;
          break;
        case "edge":
          prose += `${b.items.map((e) => `${e.c} ${e.r}`).join(" ")} `;
          break;
        default:
          if ("text" in b) prose += `${(b as { text: string }).text} `;
      }
    }
  };
  walk(l.blocks);
  if (l.deep) walk(l.deep);
  if (l.takeaway) prose += l.takeaway;
  return {
    num: l.num, id: l.id, title: l.title, module: mod,
    prose, sql: sqlParts.join(" "), figures,
    mcqs: l.mcqs.length, problems: l.problems.length,
  };
}

const lessonScans: Array<LessonScan & { kws: Set<string> }> = [];
const kwLessons = new Map<string, number[]>();
const kwDiagrams = new Map<string, string[]>();
const figureRows: Array<{ figure: FigureId; label: string; module: number | null; lessonNum: number; lessonTitle: string; kws: Set<string> }> = [];
const figureSeen = new Set<FigureId>();
for (const l of LESSONS) {
  const mod = lessonToModule.get(l.num) ?? null;
  const scan = scanLesson(l, mod);
  const kws = tag(mod, scan.prose, scan.sql).kws;
  lessonScans.push({ ...scan, kws });
  for (const kw of kws) {
    const arr = kwLessons.get(kw) ?? [];
    arr.push(l.num);
    kwLessons.set(kw, arr);
  }
  for (const fig of scan.figures) {
    const label = prettyFigureLabel(fig);
    for (const kw of kws) {
      const arr = kwDiagrams.get(kw) ?? [];
      if (!arr.includes(label)) arr.push(label);
      kwDiagrams.set(kw, arr);
    }
    if (!figureSeen.has(fig)) {
      figureSeen.add(fig);
      figureRows.push({ figure: fig, label, module: mod, lessonNum: l.num, lessonTitle: l.title, kws });
    }
  }
}
const kwOrder = new Map(D.map((d, i) => [d.kw, i] as const));
const kwListSorted = (kws: Set<string>): string[] =>
  [...kws].sort((a, b) => (kwOrder.get(a) ?? 99) - (kwOrder.get(b) ?? 99));

// ---------------------------------------------------------------------------
// 5. Aggregate
// ---------------------------------------------------------------------------
interface Counts {
  mcqs: number;
  queries: number;
  cases: number;
  fills: number;
  drills: number;
}
const zero = (): Counts => ({ mcqs: 0, queries: 0, cases: 0, fills: 0, drills: 0 });

function bump(items: Tagged[], field: keyof Counts, perMod: Map<number, Map<string, number>>, crossMod: Map<string, number>) {
  for (const it of items) {
    for (const kw of it.kws) {
      if (it.module == null) {
        crossMod.set(kw, (crossMod.get(kw) ?? 0) + 1);
      } else {
        const m = perMod.get(it.module) ?? new Map<string, number>();
        m.set(kw, (m.get(kw) ?? 0) + 1);
        perMod.set(it.module, m);
      }
    }
  }
}

const perModKW = new Map<number, Map<string, number>>();
const crossKW = new Map<string, number>();
bump(mcqItems, "mcqs", perModKW, crossKW);
bump(problemItems, "queries", perModKW, crossKW);
bump(caseItems, "cases", perModKW, crossKW);
bump(fillItems, "fills", perModKW, crossKW);
bump(drillItems, "drills", perModKW, crossKW);

// --- report mode -----------------------------------------------------------
if (process.argv.includes("--report")) {
  console.log("== modules ==");
  for (const m of MODULES) {
    const lessons = m.lessons.length;
    const minutes = m.lessons.reduce((a, l) => a + l.minutes, 0);
    const mcqs = m.lessons.reduce((a, l) => a + l.mcqs.length, 0);
    const problems = m.lessons.reduce((a, l) => a + l.problems.length, 0);
    const cases = caseItems.filter((c) => c.module === m.num).length;
    console.log(`M${m.num} ${m.title}: lessons=${lessons} mcqs=${mcqs} queries=${problems} cases=${cases} minutes=${minutes}`);
  }
  const gauntletCaseCount = GAUNTLET_BANKS.reduce((a, b) => a + b.cases.length, 0);
  const bankCaseCount = KEYWORD_BANKS.reduce((a, b) => a + b.cases.length, 0);
  const capCases = CASES.length - (caseItems.filter((c) => c.module != null).length - gauntletCaseCount - bankCaseCount);
  console.log(`cross-module (cap) cases: ${capCases} · total cases ${CASES.length}`);
  console.log(`fills: ${fillItems.length} · drill sets: ${DRILL_SETS.length} · drill questions: ${DRILL_SETS.reduce((a, s) => a + s.questions.length, 0)}`);
  console.log("\n== distinct DRILL_SETS keywords (verbatim) ==");
  const seen = new Map<string, { n: number; mods: Set<number> }>();
  for (const s of DRILL_SETS) {
    const e = seen.get(s.keyword) ?? { n: 0, mods: new Set<number>() };
    e.n += s.questions.length;
    e.mods.add(s.module);
    seen.set(s.keyword, e);
  }
  for (const [k, v] of [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  "${k}" — ${v.n}q · M${[...v.mods].join(",M")}`);
  }
  console.log("\n== UNMAPPED drill keywords ==");
  const un = Object.entries(UNMAPPED);
  if (un.length === 0) console.log("  (none)");
  for (const [k, n] of un) console.log(`  "${k}" — ${n}q`);
  process.exit(0);
}

// --- emit mode -------------------------------------------------------------
// The merged per-module map loses the source dimension — aggregate per source
// for exactness.
const perSource: Array<{ field: keyof Counts; items: Tagged[] }> = [
  { field: "mcqs", items: mcqItems },
  { field: "queries", items: problemItems },
  { field: "cases", items: caseItems },
  { field: "fills", items: fillItems },
  { field: "drills", items: drillItems },
];

const kwRows = D.map((def) => {
  const counts = zero();
  const byModule: Record<string, number> = {};
  for (const { field, items } of perSource) {
    for (const it of items) {
      if (!it.kws.has(def.kw)) continue;
      counts[field] += 1;
      const key = it.module == null ? "cross" : String(it.module);
      byModule[key] = (byModule[key] ?? 0) + 1;
    }
  }
  const total = counts.mcqs + counts.queries + counts.cases + counts.fills + counts.drills;
  let primaryModule: number | null = null;
  let best = -1;
  for (const m of MODULES) {
    const v = byModule[String(m.num)] ?? 0;
    if (v > best) {
      best = v;
      primaryModule = m.num;
    }
  }
  return {
    keyword: def.kw,
    category: def.cat,
    ...counts,
    total,
    primaryModule: best > 0 ? primaryModule : null,
    byModule,
  };
});

const moduleRows = MODULES.map((m) => {
  const lessons = m.lessons.length;
  const minutes = m.lessons.reduce((a, l) => a + l.minutes, 0);
  const mcqs = m.lessons.reduce((a, l) => a + l.mcqs.length, 0);
  const queries = m.lessons.reduce((a, l) => a + l.problems.length, 0);
  const cases = caseItems.filter((c) => c.module === m.num).length;
  const fills = fillItems.filter((f) => f.module === m.num).length;
  const drills = DRILL_SETS.filter((s) => s.module === m.num).reduce((a, s) => a + s.questions.length, 0);
  return { num: m.num, id: m.id, title: m.title, level: m.level, lessons, minutes, mcqs, queries, cases, fills, drills };
});

const gauntletCaseCount = GAUNTLET_BANKS.reduce((a, b) => a + b.cases.length, 0);
const bankCaseCount = KEYWORD_BANKS.reduce((a, b) => a + b.cases.length, 0);
const capCases = CASES.length - (caseItems.filter((c) => c.module != null).length - gauntletCaseCount - bankCaseCount);

const perModuleKeywords: Record<string, Array<{ keyword: string; category: string } & Counts & { total: number }>> = {};
// per-module with source split
for (const m of MODULES) {
  const rows: Array<{ keyword: string; category: string } & Counts & { total: number }> = [];
  for (const def of D) {
    const c = zero();
    for (const { field, items } of perSource) {
      for (const it of items) {
        if (it.module === m.num && it.kws.has(def.kw)) c[field] += 1;
      }
    }
    const total = c.mcqs + c.queries + c.cases + c.fills + c.drills;
    if (total > 0) rows.push({ keyword: def.kw, category: def.cat, ...c, total });
  }
  rows.sort((a, b) => b.total - a.total || a.keyword.localeCompare(b.keyword));
  perModuleKeywords[String(m.num)] = rows;
}

const out = {
  generatedAt: new Date().toISOString(),
  sources: {
    lessons: LESSONS.length,
    mcqs: mcqItems.length,
    queries: problemItems.length,
    cases: caseItems.length,
    fills: fillItems.length,
    drillQuestions: drillItems.length,
    drillSets: DRILL_SETS.length,
    crossModuleCases: capCases,
  },
  modules: moduleRows,
  keywords: kwRows.map((r) => ({
    keyword: r.keyword,
    category: r.category,
    mcqs: r.mcqs,
    queries: r.queries,
    cases: r.cases,
    fills: r.fills,
    drills: r.drills,
    total: r.total,
    primaryModule: r.primaryModule,
    lessons: [...(kwLessons.get(r.keyword) ?? [])].sort((a, b) => a - b),
    lessonCount: (kwLessons.get(r.keyword) ?? []).length,
    diagrams: kwDiagrams.get(r.keyword) ?? [],
    diagramCount: (kwDiagrams.get(r.keyword) ?? []).length,
  })),
  lessonMap: lessonScans
    .slice()
    .sort((a, b) => a.num - b.num)
    .map((ls) => ({
      num: ls.num,
      id: ls.id,
      title: ls.title,
      module: ls.module,
      keywords: kwListSorted(ls.kws),
      diagrams: ls.figures.map((f) => prettyFigureLabel(f)),
      mcqs: ls.mcqs,
      problems: ls.problems,
    })),
  figures: figureRows.map((f) => ({
    figure: f.figure,
    label: f.label,
    module: f.module,
    lessonNum: f.lessonNum,
    lessonTitle: f.lessonTitle,
    keywords: kwListSorted(f.kws),
  })),
  perModuleKeywords,
};

writeFileSync(new URL("./coverage-data.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(`emitted scripts/coverage-data.json — ${kwRows.length} keywords · ${mcqItems.length} mcqs · ${problemItems.length} queries · ${caseItems.length} cases (${capCases} cross-module) · ${fillItems.length} fills · ${drillItems.length} drill questions · ${lessonScans.length} lessons mapped · ${figureRows.length} distinct figures`);
if (Object.keys(UNMAPPED).length > 0) {
  console.log("WARNING — unmapped drill keywords (excluded from keyword rows):");
  for (const [k, n] of Object.entries(UNMAPPED)) console.log(`  "${k}" — ${n}q`);
}
