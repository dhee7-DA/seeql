// Content audit — every SQL problem in the band, structural + quality metrics.
// Verifies the teaching shape is complete and uniform across all 335 dives,
// and collects the UI-relevant stats (table/column/FK counts, code sizes)
// that size the ER + pattern diagram layer. Writes a compact MD report.

import { writeFileSync } from "node:fs";
import { LC_ALL } from "../src/lib/leetcode/registry";
import { lcSqlDive } from "../src/lib/leetcode/content/content";
import { lcSqlExpected } from "../src/lib/leetcode/content/sql-expected";
import { SQL50_SECTIONS } from "../src/lib/leetcode/sections";

interface Issue {
  slug: string;
  field: string;
  detail: string;
}
const issues: Issue[] = [];
const flag = (slug: string, field: string, detail: string) =>
  issues.push({ slug, field, detail });

const sqlRows = LC_ALL.filter((p) => p.sql);
const stats = {
  problems: sqlRows.length,
  premium: 0,
  free: 0,
  diff: { Easy: 0, Medium: 0, Hard: 0 } as Record<string, number>,
  examples: { min: 99, max: 0, avg: 0 },
  constraints: { min: 99, max: 0, avg: 0 },
  breakdown: { min: 99, max: 0, avg: 0 },
  edges: { min: 99, max: 0, avg: 0 },
  ladder: { min: 99, max: 0, avg: 0 },
  walkthrough: { min: 99, max: 0, avg: 0 },
  followUps: { min: 99, max: 0, avg: 0 },
  related: { min: 99, max: 0, avg: 0 },
  tables: { min: 99, max: 0, avg: 0 },
  problemsWithFk: 0,
  maxFk: 0,
  maxColumns: 0,
  codeLines: { min: 999, max: 0, avg: 0 },
  seedLines: { min: 999, max: 0, avg: 0 },
  withTablesNotes: 0,
  orderExact: 0,
  writeProblems: 0,
  xpTotal: 0,
  breakdownShortParas: 0,
  sectionCoverage: new Map<string, number>(),
};
const bump = (m: { min: number; max: number; avg: number }, v: number, n = 1) => {
  m.min = Math.min(m.min, v);
  m.max = Math.max(m.max, v);
  m.avg += v / n;
};
const sentences = (s: string) =>
  s.split(/(?<=[.!?])\s+(?=[A-Z0-9'"])|(?<=[.!?])$/).filter((x) => x.trim().length > 0).length;

const parseTables = (ddl: string) => {
  const out: Array<{ name: string; cols: number; fks: number; pk: boolean }> = [];
  const re = /CREATE TABLE (?:IF NOT EXISTS )?["']?(\w+)["']?\s*\(([\s\S]*?)\);/gi;
  for (const m of ddl.matchAll(re)) {
    const body = m[2];
    const lines = body
      .split(/,\n/)
      .map((l) => l.trim())
      .filter((l) => l && !/^--/.test(l));
    const cols = lines.filter(
      (l) => !/^(PRIMARY KEY|FOREIGN KEY|UNIQUE|CHECK|CONSTRAINT)\b/i.test(l),
    );
    out.push({
      name: m[1],
      cols: cols.length,
      fks: (body.match(/REFERENCES\s+"?(\w+)"?/gi) ?? []).length,
      pk: /PRIMARY KEY/i.test(body),
    });
  }
  return out;
};

for (const p of sqlRows) {
  const d = lcSqlDive(p.slug);
  if (!d) {
    flag(p.slug, "dive", "MISSING dive");
    continue;
  }
  if (!p.free) stats.premium++;
  else stats.free++;
  stats.diff[p.difficulty] = (stats.diff[p.difficulty] ?? 0) + 1;
  stats.xpTotal += d.xp;

  // teaching shape
  if (!d.statement || d.statement.length < 80) flag(p.slug, "statement", "too short");
  bump(stats.examples, d.examples.length);
  if (d.examples.length < 1) flag(p.slug, "examples", "none");
  for (const [i, ex] of d.examples.entries()) {
    if (!ex.input || !ex.output) flag(p.slug, `examples[${i}]`, "missing input/output");
  }
  bump(stats.constraints, d.constraints.length);
  if (d.constraints.length < 2) flag(p.slug, "constraints", `< ${d.constraints.length}`);
  bump(stats.breakdown, d.breakdown.length);
  if (d.breakdown.length < 3) flag(p.slug, "breakdown", `< 3 paras`);
  // Thinness = genuinely short paragraphs (sentence splitters false-positive
  // on SQL like "m.id = e.managerId"); 240 chars ≈ 3 real sentences.
  const shortParas = d.breakdown.filter((x) => x.length < 240).length;
  stats.breakdownShortParas += shortParas;
  if (shortParas > 0) flag(p.slug, "breakdown", `${shortParas} para(s) under 3 sentences`);
  bump(stats.edges, d.edges.length);
  if (d.edges.length < 3) flag(p.slug, "edges", `< 3`);
  bump(stats.ladder, d.ladder.length);
  if (d.ladder.length !== 3) flag(p.slug, "ladder", `${d.ladder.length} rungs`);
  for (const [i, r] of d.ladder.entries()) {
    if (!r.title || r.body.length < 40) flag(p.slug, `ladder[${i}]`, "thin rung");
  }
  bump(stats.walkthrough, d.walkthrough.length);
  if (d.walkthrough.length < 3) flag(p.slug, "walkthrough", `< 3`);
  bump(stats.followUps, d.followUps?.length ?? 0);
  if ((d.followUps?.length ?? 0) < 2) flag(p.slug, "followUps", `< 2`);
  bump(stats.related, d.related?.length ?? 0);
  for (const r of d.related ?? []) {
    if (!LC_ALL.some((q) => q.slug === r)) flag(p.slug, "related", `dangling slug ${r}`);
  }
  if (!d.approach) flag(p.slug, "approach", "missing");
  if (!d.time || !d.space) flag(p.slug, "complexity", "missing time/space");
  if (d.xp !== ({ Easy: 10, Medium: 20, Hard: 35 } as Record<string, number>)[p.difficulty])
    flag(p.slug, "xp", `${d.xp} vs difficulty ${p.difficulty}`);

  // schema + engine shape
  const tables = parseTables(d.schema.ddl);
  if (tables.length === 0) flag(p.slug, "ddl", "no CREATE TABLE parsed");
  bump(stats.tables, tables.length);
  const fkCount = tables.reduce((a, t) => a + t.fks, 0);
  stats.maxFk = Math.max(stats.maxFk, fkCount);
  if (fkCount > 0) stats.problemsWithFk++;
  stats.maxColumns = Math.max(stats.maxColumns, ...tables.map((t) => t.cols), 0);
  if (d.schema.tables?.length) stats.withTablesNotes++;
  if (!d.schema.seed || !/INSERT INTO/i.test(d.schema.seed)) flag(p.slug, "seed", "no INSERTs");
  const codeLines = d.code.split("\n").length;
  bump(stats.codeLines, codeLines);
  const seedLines = d.schema.seed.split("\n").length;
  bump(stats.seedLines, seedLines);
  const stmts = d.code.replace(/--[^\n]*/g, "").split(";").filter((s) => s.trim()).length;
  if (stmts !== 1 && !d.writeVerify) flag(p.slug, "code", `${stmts} statements, no writeVerify`);
  if (d.writeVerify) stats.writeProblems++;
  if (d.order === "exact") stats.orderExact++;
  const expected = lcSqlExpected(p.slug);
  if (!expected) flag(p.slug, "expected", "MISSING expected spec");
  else if (expected.columns.length === 0) flag(p.slug, "expected", "zero columns");
  else if (expected.rows.length === 0) flag(p.slug, "expected", "zero rows");
}

// section coverage
for (const sec of SQL50_SECTIONS) {
  stats.sectionCoverage.set(sec.id, sec.slugs.length);
  for (const s of sec.slugs) {
    if (!sqlRows.some((p) => p.slug === s)) flag(s, "section", `listed in ${sec.id} but not in registry`);
  }
}

// ---- report ----
const avg = (m: { avg: number }) => (m.avg / stats.problems).toFixed(1);
const lines: string[] = [];
lines.push(`# SeeQL content audit — the SQL band (${stats.problems} problems)`);
lines.push("");
lines.push(`Generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} · scripts/lc-content-audit.ts`);
lines.push("");
lines.push("## Inventory");
lines.push("");
lines.push(`| Metric | Value |`);
lines.push(`| --- | --- |`);
lines.push(`| Problems (all live LeetCode Database + platform re-authors) | ${stats.problems} |`);
lines.push(`| Free / premium | ${stats.free} / ${stats.premium} |`);
lines.push(`| Difficulty | Easy ${stats.diff.Easy} · Medium ${stats.diff.Medium} · Hard ${stats.diff.Hard} |`);
lines.push(`| Total XP on first solve | ${stats.xpTotal} |`);
lines.push(`| Sections | ${SQL50_SECTIONS.length} |`);
lines.push(`| order:exact problems | ${stats.orderExact} · write problems: ${stats.writeProblems} |`);
lines.push("");
lines.push("## Teaching-shape metrics (min / avg / max)");
lines.push("");
lines.push(`| Field | min | avg | max |`);
lines.push(`| --- | --- | --- | --- |`);
for (const [k, m] of Object.entries(stats).filter(([, v]) => typeof v === "object" && v !== null && "min" in (v as object))) {
  const mm = m as { min: number; max: number; avg: number };
  lines.push(`| ${k} | ${mm.min} | ${avg(mm)} | ${mm.max} |`);
}
lines.push("");
lines.push("## Schema / diagram-sizing stats");
lines.push("");
lines.push(`- Tables per schema: min ${stats.tables.min} · avg ${avg(stats.tables)} · max ${stats.tables.max}`);
lines.push(`- Max columns in one table: ${stats.maxColumns}`);
lines.push(`- Problems with explicit FOREIGN KEY REFERENCES: ${stats.problemsWithFk}/${stats.problems} (max ${stats.maxFk} FKs in one schema)`);
lines.push(`- Schemas with curated \`tables\` notes: ${stats.withTablesNotes}/${stats.problems}`);
lines.push(`- Solution code lines: min ${stats.codeLines.min} · avg ${avg(stats.codeLines)} · max ${stats.codeLines.max}`);
lines.push(`- Seed script lines: min ${stats.seedLines.min} · avg ${avg(stats.seedLines)} · max ${stats.seedLines.max}`);
lines.push(`- Breakdown paragraphs under 3 sentences: ${stats.breakdownShortParas}`);
lines.push("");
lines.push(`## Issues (${issues.length})`);
lines.push("");
if (issues.length === 0) lines.push("None — every dive passes the structural audit.");
else {
  const byField = new Map<string, Issue[]>();
  for (const i of issues) {
    if (!byField.has(i.field)) byField.set(i.field, []);
    byField.get(i.field)!.push(i);
  }
  for (const [f, list] of [...byField.entries()].sort((a, b) => b[1].length - a[1].length)) {
    lines.push(`- **${f}** (${list.length}): ${list.slice(0, 12).map((i) => i.slug).join(", ")}${list.length > 12 ? " …" : ""}`);
  }
}

const md = lines.join("\n") + "\n";
writeFileSync("download/lc-content-audit.md", md);
console.log(md);
const exitBad = issues.filter((i) => !["breakdown", "examples"].includes(i.field));
console.log(`\nAUDIT: ${stats.problems} problems · ${issues.length} soft flags · ${exitBad.length} hard flags`);
