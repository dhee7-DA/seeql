/**
 * Order-flip mutation sweep — for EVERY order-flip FU spec across all dives,
 * run base solution and derived mutant through the live /api/lc-sql sandbox
 * and verify the mutant output differs AS AN ORDERED LIST (that's the whole
 * point of the flip: gradeSqlResult uses order "exact" for these dives).
 * Catches: no-op mutants (DESC after `;`), degenerate 1-row flips, ties that
 * collapse to the same presentation.
 * Run: bun scripts/lc-order-flip-sweep.ts
 */
export {};
const BASE = "http://localhost:3000";

const { FU_SPECS } = await import("../src/lib/leetcode/followup-specs");
const { LC_SQL_CONTENT } = await import("../src/lib/leetcode/content/content");
const { deriveFollowUp } = await import("../src/lib/leetcode/followups");

const bySlug = new Map(LC_SQL_CONTENT.map((d) => [d.slug, d]));

async function exec(slug: string, sql: string) {
  const res = await fetch(`${BASE}/api/lc-sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, sql }),
  });
  return (await res.json()) as { ok: boolean; columns?: string[]; rows?: unknown[][]; error?: string };
}

let total = 0;
let distinct = 0;
const same: string[] = [];
const broken: string[] = [];

for (const slug of Object.keys(FU_SPECS)) {
  const dive = bySlug.get(slug);
  if (!dive) continue;
  for (const spec of FU_SPECS[slug]) {
    if (spec.kind !== "order-flip") continue;
    total++;
    const fu = deriveFollowUp(dive, spec);
    if (!fu) {
      broken.push(`${slug}: deriveFollowUp returned null`);
      continue;
    }
    // structural check: the mutant's top-level ORDER BY direction must differ
    // from the original's (a DESC->ASC flip correctly removes "desc", so we
    // compare the clause itself rather than keyword presence)
    const obClause = (s: string) => {
      const m = /order\s+by[^;]*?(?=limit\b|$)/i.exec(s.split(";")[0]);
      return m ? m[0].replace(/\s+/g, " ").trim().toLowerCase() : "";
    };
    const structOk = obClause(dive.code) !== obClause(fu.modelSql);
    const base = await exec(slug, dive.code);
    const mut = await exec(slug, fu.modelSql);
    if (!base.ok || !mut.ok) {
      broken.push(`${slug}: sandbox fail — base=${base.ok} mut=${mut.ok} err=${mut.error ?? base.error}`);
      continue;
    }
    const a = JSON.stringify(base.rows ?? []);
    const b = JSON.stringify(mut.rows ?? []);
    if (a !== b) {
      distinct++;
      if (!structOk) broken.push(`${slug}: differs but DESC outside first statement — inspect`);
    } else {
      same.push(`${slug} (${(base.rows ?? []).length} rows)`);
    }
  }
}

console.log(`\norder-flip specs: ${total} | distinct output: ${distinct} | identical: ${same.length} | broken: ${broken.length}`);
if (same.length) console.log(`\nIDENTICAL (degenerate — flip is a no-op):\n  ${same.join("\n  ")}`);
if (broken.length) console.log(`\nBROKEN:\n  ${broken.join("\n  ")}`);
process.exit(same.length || broken.length ? 1 : 0);
