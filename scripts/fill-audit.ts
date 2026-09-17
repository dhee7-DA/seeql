// Fill-drill auditor — the mechanical safety net for authored fills.
// For every fill in the course it verifies:
//   1. unique id, well-formed "lN-fK"
//   2. template slots are exactly {1}..{n} with no gaps/duplicates
//   3. answers.length === slot count, each answer appears in chips,
//      answers are pairwise distinct (placement is by value)
//   4. 4-6 chips, all non-empty, chips pairwise distinct
//   5. completed SQL (template with answers substituted) EXECUTES on the
//      freshly seeded database without error
// Run: bunx tsx scripts/fill-audit.ts

import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";
import { allFills } from "../src/lib/curriculum/fills";

function slotNumbers(template: string): number[] {
  return [...template.matchAll(/\{(\d+)\}/g)].map((m) => Number(m[1]));
}

async function main() {
  await resetDatabase();
  const fills = allFills();
  let fails = 0;

  const seenIds = new Set<string>();
  for (const f of fills) {
    const problems: string[] = [];

    // 1 — id shape + uniqueness
    if (!/^l\d+-f\d+$/.test(f.id)) problems.push(`bad id shape "${f.id}"`);
    if (seenIds.has(f.id)) problems.push(`duplicate id "${f.id}"`);
    seenIds.add(f.id);

    // 2 — slots
    const slots = slotNumbers(f.template);
    const expected = Array.from({ length: f.answers.length }, (_, i) => i + 1);
    const sorted = [...slots].sort((a, b) => a - b);
    if (JSON.stringify(sorted) !== JSON.stringify(expected))
      problems.push(`slots [${sorted}] != expected [${expected}]`);

    // 3 — answers
    if (f.answers.length === 0) problems.push("no answers");
    if (new Set(f.answers).size !== f.answers.length)
      problems.push(`duplicate answers [${f.answers.join(" | ")}]`);
    for (const a of f.answers) {
      if (!f.chips.includes(a)) problems.push(`answer "${a}" not among chips`);
    }

    // 4 — chips
    if (f.chips.length < 4 || f.chips.length > 6)
      problems.push(`chip pool size ${f.chips.length} outside 4-6`);
    if (new Set(f.chips).size !== f.chips.length) problems.push("duplicate chips");
    if (f.chips.some((c) => c.trim() === "")) problems.push("empty chip");

    // 5 — completed SQL executes
    let sql = f.template;
    f.answers.forEach((a, i) => {
      sql = sql.replace(new RegExp(`\\{${i + 1}\\}`), a);
    });
    if (/\{\d+\}/.test(sql)) problems.push("unsubstituted slot remains");
    if (!/^\s*(SELECT|WITH|EXPLAIN)\b/i.test(sql))
      problems.push("completed SQL is not read-only (only SELECT/WITH/EXPLAIN allowed)");
    try {
      await db.$queryRawUnsafe(sql);
    } catch (err) {
      problems.push(`SQL fails on seed db: ${(err as Error).message.split("\n")[0]}`);
    }

    if (problems.length > 0) {
      fails += 1;
      console.log(`FAIL ${f.id}`);
      for (const p of problems) console.log(`   - ${p}`);
    }
  }

  console.log(`\nfill-audit: ${fills.length} fills checked, ${fails} failing`);
  if (fails > 0) process.exit(1);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
