// Verify the whole curriculum: every solution query executes against the
// sample DB and returns sensible rows; MCQ/problem invariants, difficulty
// distribution and MCQ answer-balance are reported too.
// Run: cd /home/z/my-project && bun scripts/verify-curriculum.ts
import { db } from "../src/lib/db";
import { ensureDatabase } from "../src/lib/sample-db";
import { COURSE_MODULES } from "../src/lib/curriculum/index";

const norm = (v: unknown): unknown => (typeof v === "bigint" ? Number(v) : v);

async function main() {
  await ensureDatabase();
  const mod = COURSE_MODULES[0];
  let failures = 0;

  // ---------- content invariants ----------
  const mcqIds = new Set<string>();
  const problemIds = new Set<string>();
  let mcqTotal = 0;
  const answerPositions = [0, 0, 0, 0];
  const diffCounts: Record<string, number> = { easy: 0, medium: 0, hard: 0, unset: 0 };
  let diagramCount = 0;

  for (const l of mod.lessons) {
    for (const b of l.theory) if (b.kind === "diagram") diagramCount++;
    for (const m of l.mcqs) {
      mcqTotal++;
      if (mcqIds.has(m.id)) { console.error(`DUP MCQ id ${m.id}`); failures++; }
      mcqIds.add(m.id);
      if (m.answer < 0 || m.answer >= m.options.length) {
        console.error(`BAD answer index ${m.id}`); failures++;
      } else {
        answerPositions[m.answer]++;
      }
    }
    for (const p of l.problems) {
      if (problemIds.has(p.id)) { console.error(`DUP problem id ${p.id}`); failures++; }
      problemIds.add(p.id);
      diffCounts[p.difficulty ?? "unset"]++;
    }
  }
  let caseParts = 0;
  for (const c of mod.caseStudies) {
    for (const p of c.parts) {
      caseParts++;
      if (problemIds.has(p.id)) { console.error(`DUP part id ${p.id}`); failures++; }
      problemIds.add(p.id);
    }
  }

  console.log(
    `module: ${mod.lessons.length} lessons · ${mod.caseStudies.length} case studies · ` +
    `${diagramCount} diagrams · ${mcqTotal} MCQs · ${problemIds.size} graded queries (${caseParts} case parts)`,
  );
  console.log(
    `MCQ answer balance A/B/C/D = ${answerPositions.join("/")}` +
    ` · difficulties E/M/H/unset = ${diffCounts.easy}/${diffCounts.medium}/${diffCounts.hard}/${diffCounts.unset}`,
  );

  // ---------- solution execution ----------
  const items: Array<{ id: string; sql: string }> = [
    ...mod.lessons.flatMap((l) =>
      l.problems.map((p) => ({ id: p.id, sql: p.solution })),
    ),
    ...mod.caseStudies.flatMap((c) =>
      c.parts.map((p) => ({ id: p.id, sql: p.solution })),
    ),
  ];

  let zeroRows = 0;
  for (const item of items) {
    try {
      const rows = (await db.$queryRawUnsafe(
        item.sql.replace(/;+\s*$/, ""),
      )) as Array<Record<string, unknown>>;
      const n = rows.length;
      const flag = n === 0 ? "  ⚠ ZERO ROWS" : n > 200 ? "  ⚠ LARGE" : "";
      const sample =
        n > 0
          ? JSON.stringify(Object.fromEntries(Object.entries(rows[0]).map(([k, v]) => [k, norm(v)]))).slice(0, 110)
          : "";
      console.log(`${item.id.padEnd(9)} ${String(n).padStart(4)} rows  ${sample}${flag}`);
      if (n === 0) { failures++; zeroRows++; }
    } catch (e) {
      console.error(`${item.id} FAILED: ${(e as Error).message}`);
      failures++;
    }
  }

  console.log(
    `\n${items.length} solutions checked · ${zeroRows} zero-row · ${
      failures === 0 ? "ALL OK" : failures + " ISSUES"
    }`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
