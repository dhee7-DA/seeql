/**
 * Full sweep: run every SQL dive's baseline solution through the LIVE
 * /api/lc-sql route (FK enforcement on, Prisma sandbox) and report any
 * problem whose schema/seed/solution fails there. Catches seed-vs-FK
 * bugs that bun:sqlite (FK off) silently passes at build time.
 * Run: bun scripts/lc-baseline-sweep.ts
 */
export {};
const BASE = "http://localhost:3000";

const { LC_SQL_CONTENT } = await import("../src/lib/leetcode/content/content");
const { stripComments } = await import("../src/lib/leetcode/followups");

async function exec(slug: string, sql: string) {
  const res = await fetch(`${BASE}/api/lc-sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, sql }),
  });
  return (await res.json()) as { ok: boolean; rows?: unknown[][]; error?: string };
}

let ok = 0;
const fails: string[] = [];
for (const dive of LC_SQL_CONTENT) {
  const r = await exec(dive.slug, stripComments(dive.code));
  if (r.ok) ok++;
  else fails.push(`${dive.slug}: ${r.error ?? "unknown"}`);
}

console.log(`\nbaseline sweep: ${ok}/${LC_SQL_CONTENT.length} clean`);
for (const f of fails) console.log(`  FAIL ${f}`);
