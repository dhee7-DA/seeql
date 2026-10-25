/**
 * Boss Level III live API check — grade each of the 6 problems through the
 * running server's /api/lc-sql sandbox (the exact path the app uses) with
 * the model solution, and confirm (a) it grades and (b) wrong attempts do
 * NOT pass. Run: bun scripts/lc-boss3-api-check.ts
 */
export {};
const BASE = "http://localhost:3000";

const { LC_SQL_CONTENT } = await import("../src/lib/leetcode/content/content");

const bySlug = new Map(LC_SQL_CONTENT.map((d) => [d.slug, d]));
const BOSS3 = [
  "bom-leaf-demand-explosion",
  "min-hops-flight-reachability",
  "subtree-budget-rollup",
  "mutual-follow-triangles",
  "referral-generations-pivot",
  "effective-equity-ownership",
];

const WRONG: Record<string, string> = {
  "bom-leaf-demand-explosion": `SELECT part_name, qty_per AS total_demand FROM Parts WHERE parent_id IS NOT NULL ORDER BY total_demand DESC;`,
  "min-hops-flight-reachability": `SELECT 'DEN' AS city, 9 AS min_hops;`,
  "subtree-budget-rollup": `SELECT project_name, budget AS subtree_total, 1 AS subtree_size FROM Projects WHERE budget >= 40000 ORDER BY subtree_total DESC;`,
  "mutual-follow-triangles": `SELECT follower_id AS user_id, COUNT(*) AS triangle_count FROM Follows GROUP BY follower_id HAVING COUNT(*) >= 2 ORDER BY triangle_count DESC;`,
  "referral-generations-pivot": `SELECT referrer_id AS origin_id, COUNT(*) AS gen1, 0 AS gen2, 0 AS gen3plus FROM Referrals GROUP BY referrer_id ORDER BY COUNT(*) DESC;`,
  "effective-equity-ownership": `SELECT holder_id, held_id, ROUND(pct * 100, 1) AS effective_pct FROM Owns WHERE pct >= 0.10 ORDER BY effective_pct DESC;`,
};

async function exec(slug: string, sql: string) {
  const res = await fetch(`${BASE}/api/lc-sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, sql }),
  });
  return (await res.json()) as { ok: boolean; columns?: string[]; rows?: unknown[][]; error?: string };
}

let bad = 0;
for (const slug of BOSS3) {
  const dive = bySlug.get(slug);
  if (!dive) { console.log(`${slug}: DIVE MISSING`); bad++; continue; }
  const good = await exec(slug, dive.code);
  const wrong = await exec(slug, WRONG[slug]);
  const gOk = good.ok && (good.rows?.length ?? 0) >= 1;
  const wFails = !wrong.ok || JSON.stringify(wrong.rows) !== JSON.stringify(good.rows);
  console.log(`${slug}: model ${gOk ? `${good.rows?.length} rows ✓` : `FAIL ${good.error ?? "empty"}`} · wrong-attempt-differs ${wFails ? "✓" : "✗ PASSES WRONGLY"}`);
  if (!gOk || !wFails) bad++;
}
console.log(bad ? `\nFAIL ${bad}` : "\nALL BOSS3 LIVE CHECKS PASS");
process.exit(bad ? 1 : 0);
