/**
 * Targeted probe for the lc-round3 changes: previously-broken problems,
 * the new mutation kinds, and a 3-candidate drill from DRILL2_SLUGS.
 * Run: bun scripts/lc-round3-probe.ts
 */
export {};
const BASE = "http://localhost:3000";

const { FU_SPECS, DRILL_SLUGS, DRILL2_SLUGS } = await import("../src/lib/leetcode/followup-specs");
const { LC_SQL_CONTENT } = await import("../src/lib/leetcode/content/content");
const { deriveFollowUp, applyFuSpec, fuDistractorSpecs, stripComments } = await import("../src/lib/leetcode/followups");

const bySlug = new Map(LC_SQL_CONTENT.map((d) => [d.slug, d]));

async function exec(slug: string, sql: string) {
  const res = await fetch(`${BASE}/api/lc-sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, sql }),
  });
  return (await res.json()) as { ok: boolean; rows?: unknown[][]; error?: string };
}

let pass = 0;
let fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

// 1. the five previously-broken problems run again
for (const slug of [
  "employees-whose-manager-left-the-company",
  "shortest-distance-in-a-plane",
  "calculate-parking-fees-and-duration",
  "amount-anomaly-zscore",
  "sharpe-ratio",
]) {
  const r = await exec(slug, stripComments(bySlug.get(slug)!.code));
  check(`baseline ${slug}`, r.ok && (r.rows?.length ?? 0) >= 1, r.ok ? `${r.rows?.length} rows` : r.error);
}

// 2. new kinds: run every promoted having-add + a sample of cte-wrap
let hav = 0;
let havOk = 0;
let wrap = 0;
let wrapOk = 0;
for (const [slug, specs] of Object.entries(FU_SPECS)) {
  const dive = bySlug.get(slug)!;
  for (const spec of specs) {
    const fu = deriveFollowUp(dive, spec);
    if (!fu) continue;
    if (spec.kind === "having-add") {
      hav++;
      const r = await exec(slug, fu.modelSql);
      if (r.ok) havOk++;
      else console.log(`  having-add fail ${slug}: ${r.error}`);
    }
    if (spec.kind === "cte-wrap" && wrap < 25) {
      wrap++;
      const r = await exec(slug, fu.modelSql);
      if (r.ok) wrapOk++;
      else console.log(`  cte-wrap fail ${slug}: ${r.error}`);
    }
  }
}
check(`having-add live (${hav} promoted)`, havOk === hav, `${havOk}/${hav} ok`);
check(`cte-wrap live (sample 25 of ${232})`, wrapOk === wrap, `${wrapOk}/${wrap} ok`);

// 3. a 3-candidate drill from the DRILL2 pool
const slug2 = DRILL2_SLUGS[0];
const dive2 = bySlug.get(slug2)!;
const truth = await exec(slug2, stripComments(dive2.code));
const keys = new Set([JSON.stringify(truth.rows)]);
let n = 0;
for (const spec of fuDistractorSpecs(dive2)) {
  if (n >= 2) break;
  const sql = applyFuSpec(dive2, spec);
  if (!sql) continue;
  const r = await exec(slug2, sql);
  if (!r.ok || !r.rows) continue;
  const k = JSON.stringify(r.rows);
  if (keys.has(k) || r.rows.length < 1 || r.rows.length > 60) continue;
  keys.add(k);
  n++;
}
check(`3-candidate drill from DRILL2 (${slug2})`, n >= 2, `${n} distractors (pool: ${DRILL_SLUGS.length} 4-opt + ${DRILL2_SLUGS.length} 3-opt)`);

console.log(`\n${pass} pass, ${fail} fail`);
