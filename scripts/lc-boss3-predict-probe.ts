// Probe: can the 6 Boss Level III (Chains & Graphs) problems serve as
// Predict-the-Output drills? Mirrors lc-boss-predict-probe.ts (Boss I/II):
// stripComments → truth run → mutation specs via fuDistractorSpecs/applyFuSpec
// → distinct-output check through the live /api/lc-sql sandbox. Reports which
// pool each slug qualifies for (DRILL = 3+ distinct, DRILL2 = 2 distinct).

import { lcSqlDive } from "../src/lib/leetcode/content/content";
import { applyFuSpec, fuDistractorSpecs, stripComments } from "../src/lib/leetcode/followups";
import type { FuSpec } from "../src/lib/leetcode/followups";
import type { ExecResult } from "../src/lib/sql-types";

const BOSS3 = [
  "bom-leaf-demand-explosion",
  "min-hops-flight-reachability",
  "subtree-budget-rollup",
  "mutual-follow-triangles",
  "referral-generations-pivot",
  "effective-equity-ownership",
];

async function execSql(slug: string, sql: string): Promise<ExecResult | null> {
  try {
    const res = await fetch("http://localhost:3000/api/lc-sql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, sql }),
    });
    const data = (await res.json()) as ExecResult | { ok: false };
    return data.ok ? data : null;
  } catch {
    return null;
  }
}

for (const slug of BOSS3) {
  const dive = lcSqlDive(slug);
  if (!dive) {
    console.log(`${slug}: NO DIVE`);
    continue;
  }
  const truthSql = stripComments(dive.code);
  const truth = await execSql(slug, truthSql);
  if (!truth) {
    console.log(`${slug}: TRUTH FAILED`);
    continue;
  }
  const specs: FuSpec[] = fuDistractorSpecs(dive);
  const pairs = specs
    .map((spec) => ({ spec, sql: applyFuSpec(dive, spec) }))
    .filter((s): s is { spec: FuSpec; sql: string } => s.sql !== null);
  const res = await Promise.all(pairs.map((p) => execSql(slug, p.sql)));
  const seen = new Set<string>([JSON.stringify(truth.rows)]);
  let distinct = 0;
  const kinds: string[] = [];
  for (let i = 0; i < pairs.length; i++) {
    const r = res[i];
    if (!r) continue;
    const key = JSON.stringify(r.rows);
    if (seen.has(key)) continue;
    if (r.rows.length < 1 || r.rows.length > 60) continue;
    seen.add(key);
    distinct++;
    kinds.push(`${pairs[i].spec.kind}(→${String(pairs[i].spec.param)})`);
  }
  const pool = distinct >= 3 ? "DRILL (4-cand)" : distinct >= 2 ? "DRILL2 (3-cand)" : "—";
  console.log(`${slug}: truth ${truth.rows.length} rows · specs ${pairs.length} · distinct distractors ${distinct} [${kinds.join(", ")}] → ${pool}`);
}
