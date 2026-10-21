/**
 * Follow-up Gauntlet + Predict-the-Output — build-time verifier & manifest.
 *
 * For every LcSqlDive:
 *   1. builds the problem's schema + seed in an in-memory SQLite (bun:sqlite),
 *   2. runs the original solution → the baseline snapshot,
 *   3. tries each mutation candidate (preference order), executes it, and
 *      promotes it ONLY if it runs, stays meaningful (1..300 rows) and returns
 *      a DIFFERENT result than the baseline (and than any follow-up already
 *      promoted for this problem),
 *   4. keeps up to 2 follow-ups per problem → src/lib/leetcode/followup-specs.ts
 *   5. counts Predict-the-Output coverage (needs 3 distinct distractors).
 *
 * Run: bun scripts/lc-followups-gen.ts
 */

import { Database } from "bun:sqlite";
import { LC_SQL_CONTENT } from "../src/lib/leetcode/content/content";
import { splitStatements } from "../src/lib/sql-statements";
import { fuCandidates, fuDistractorSpecs, applyFuSpec, deriveFollowUp, type FuSpec } from "../src/lib/leetcode/followups";
import type { CellValue } from "../src/lib/sql-types";

function norm(v: unknown): CellValue {
  const c = v as CellValue;
  if (typeof c === "number" && !Number.isInteger(c)) return Math.round(c * 10000) / 10000;
  return c;
}

type Snap = { cols: string[]; rows: CellValue[][] };

function snapshot(dive: { schema: { ddl: string; seed: string } }, sql: string): Snap {
  const db = new Database(":memory:");
  try {
    for (const s of splitStatements(dive.schema.ddl)) db.run(s);
    for (const s of splitStatements(dive.schema.seed)) db.run(s);
    const st = db.prepare(sql.replace(/;+\s*$/, ""));
    const rows = st.all() as Record<string, unknown>[];
    const cols = st.columnNames;
    return { cols, rows: rows.map((r) => cols.map((c) => norm(r[c]))) };
  } finally {
    db.close();
  }
}

/** Mode-aware difference: exact grades the sequence, any grades the set. */
function differs(a: Snap, b: Snap, mode: "exact" | "any"): boolean {
  if (a.cols.length !== b.cols.length) return true;
  if (mode === "exact") return JSON.stringify(a.rows) !== JSON.stringify(b.rows);
  const key = (rows: CellValue[][]) => JSON.stringify([...rows].map((r) => JSON.stringify(r)).sort());
  return key(a.rows) !== key(b.rows);
}

const kindCount = new Map<string, number>();
const specs: Record<string, FuSpec[]> = {};
const drillSlugs: string[] = [];
const drill2Slugs: string[] = [];
let two = 0;
let one = 0;
let zero = 0;
let drillOk = 0;
let drill2Ok = 0;

for (const dive of LC_SQL_CONTENT) {
  let base: Snap;
  try {
    base = snapshot(dive, dive.code);
  } catch (err) {
    console.error(`✗ [${dive.slug}] baseline failed: ${err instanceof Error ? err.message : String(err)}`);
    zero++;
    continue;
  }

  // -- follow-ups ----------------------------------------------------------
  const kept: FuSpec[] = [];
  const keptSnaps: Snap[] = [];
  for (const cand of fuCandidates(dive)) {
    if (kept.length >= 2) break;
    const derived = deriveFollowUp(dive, cand);
    if (!derived) continue;
    let snap: Snap;
    try {
      snap = snapshot(dive, derived.modelSql);
    } catch {
      continue; // mutation doesn't run — skip silently
    }
    if (snap.rows.length < 1 || snap.rows.length > 300) continue;
    // cte-wrap is a REFACTOR: it must return the SAME result (order-aware).
    // Every other mutation must return a DIFFERENT one than the baseline
    // (and than any follow-up already promoted for this problem).
    const sameAsBase = !differs(base, snap, derived.order);
    if (cand.kind === "cte-wrap" ? !sameAsBase : sameAsBase) continue;
    if (keptSnaps.some((k) => differs(k, snap, derived.order) === false)) continue;
    kept.push(cand);
    keptSnaps.push(snap);
    kindCount.set(cand.kind, (kindCount.get(cand.kind) ?? 0) + 1);
  }
  if (kept.length) {
    specs[dive.slug] = kept;
    if (kept.length === 2) two++;
    else one++;
  } else zero++;

  // -- predict-the-output coverage (informational) -------------------------
  const seen = new Set<string>([JSON.stringify(base.rows)]);
  let distractors = 0;
  for (const cand of fuDistractorSpecs(dive)) {
    if (distractors >= 3) break;
    const sql = applyFuSpec(dive, cand);
    if (!sql) continue;
    let snap: Snap;
    try {
      snap = snapshot(dive, sql);
    } catch {
      continue;
    }
    const key = JSON.stringify(snap.rows);
    if (seen.has(key)) continue;
    if (snap.rows.length < 1 || snap.rows.length > 60) continue; // tables must render
    seen.add(key);
    distractors++;
  }
  if (distractors >= 3) {
    drillOk++;
    drillSlugs.push(dive.slug);
  } else if (distractors >= 2) {
    // 2-distinct-distractor problems: the lobby serves them as 3-candidate drills
    drill2Ok++;
    drill2Slugs.push(dive.slug);
  }
}

// -- report -------------------------------------------------------------------
console.log(`\nfollow-ups: ${two} problems ×2, ${one} ×1, ${zero} none (of ${LC_SQL_CONTENT.length})`);
console.log(`predict drills: ${drillOk} with 3 distractors, +${drill2Ok} with 2 (of ${LC_SQL_CONTENT.length})`);
for (const [k, n] of [...kindCount.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(14)} ${n}`);

// -- write the manifest -------------------------------------------------------
const out = `// GENERATED by scripts/lc-followups-gen.ts — do not edit by hand.
// The Follow-up Gauntlet manifest: per problem, the interviewer push-backs
// that survived build-time verification (ran against the real seed, returned
// a different result, stayed meaningful). The runtime re-derives statement,
// model SQL and grading from these specs via lib/leetcode/followups.ts.
// DRILL_SLUGS: problems with 3 verified distinct Predict-the-Output
// distractors; DRILL2_SLUGS: 2 verified distractors — the reading-drill
// lobby draws from both (3-candidate drills for the second pool).
import type { FuSpec } from "./followups";

export const FU_SPECS: Record<string, FuSpec[]> = ${JSON.stringify(specs, null, 2)};

export const DRILL_SLUGS: string[] = ${JSON.stringify(drillSlugs)};

export const DRILL2_SLUGS: string[] = ${JSON.stringify(drill2Slugs)};
`;
await Bun.write("src/lib/leetcode/followup-specs.ts", out);
console.log("\nwrote src/lib/leetcode/followup-specs.ts");
