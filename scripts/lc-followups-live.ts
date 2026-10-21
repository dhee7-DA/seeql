/**
 * Live E2E check for the Follow-up Gauntlet + Predict pipeline against the
 * running server: for a sample of problems, run the derived model SQL through
 * /api/lc-sql (exactly what FuCard/drills do) and confirm it executes.
 * Run: bun scripts/lc-followups-live.ts [sample]
 */
export {};
const BASE = "http://localhost:3000";

const { FU_SPECS, DRILL_SLUGS } = await import("../src/lib/leetcode/followup-specs");
const { LC_SQL_CONTENT } = await import("../src/lib/leetcode/content/content");
const { deriveFollowUp, applyFuSpec, fuDistractorSpecs } = await import("../src/lib/leetcode/followups");

const bySlug = new Map(LC_SQL_CONTENT.map((d) => [d.slug, d]));

async function exec(slug: string, sql: string) {
  const res = await fetch(`${BASE}/api/lc-sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, sql }),
  });
  return (await res.json()) as { ok: boolean; columns?: string[]; rows?: unknown[][]; error?: string };
}

const sample = process.argv[2] ? Number(process.argv[2]) : 12;
const slugs = Object.keys(FU_SPECS).filter((_, i) => i % Math.ceil(Object.keys(FU_SPECS).length / sample) === 0);

let fuOk = 0;
let fuFail = 0;
for (const slug of slugs) {
  const dive = bySlug.get(slug)!;
  for (const spec of FU_SPECS[slug]) {
    const fu = deriveFollowUp(dive, spec);
    if (!fu) continue;
    const r = await exec(slug, fu.modelSql);
    if (r.ok && (r.rows?.length ?? 0) >= 1) fuOk++;
    else {
      fuFail++;
      console.log(`FU FAIL ${slug} ${spec.kind}: ${r.error ?? JSON.stringify(r).slice(0, 80)}`);
    }
  }
}
console.log(`live follow-ups: ${fuOk} ok, ${fuFail} fail (${slugs.length} problems sampled)`);

// predict drills: build a full 4-candidate drill for 6 slugs
let drills = 0;
for (const slug of DRILL_SLUGS.slice(0, 6)) {
  const dive = bySlug.get(slug)!;
  const truth = await exec(slug, dive.code.replace(/;+\s*$/, ""));
  if (!truth.ok) continue;
  const keys = new Set([JSON.stringify(truth.rows)]);
  let n = 0;
  for (const spec of fuDistractorSpecs(dive)) {
    if (n >= 3) break;
    const sql = applyFuSpec(dive, spec);
    if (!sql) continue;
    const r = await exec(slug, sql);
    if (!r.ok || !r.rows) continue;
    const k = JSON.stringify(r.rows);
    if (keys.has(k) || r.rows.length < 1 || r.rows.length > 60) continue;
    keys.add(k);
    n++;
  }
  if (n >= 3) drills++;
  else console.log(`drill thin: ${slug} got ${n} distractors`);
}
console.log(`live drills: ${drills}/6 built with 3 distractors each`);
