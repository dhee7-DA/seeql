// Post each boss dive's solution to the LIVE /api/lc-sql endpoint and
// confirm the grader marks it correct end to end (sandbox + DDL + compare).
// Run: bun scripts/lc-boss-api-check.ts
const SLUGS = [
  "peak-concurrent-attendance",
  "median-order-value-by-region",
  "streak-week-bonus-ladder",
  "approval-chain-audit",
  "summary-drift-audit",
  "cohort-week-retention-grid",
];

// Pull the canonical solutions from the built content via the app's own
// registry: easier — import the dives directly.
const { SQL_BOSS_A } = await import("../src/lib/leetcode/content/sql-boss-a");
const { SQL_BOSS_B } = await import("../src/lib/leetcode/content/sql-boss-b");
const dives = [...SQL_BOSS_A, ...SQL_BOSS_B];

for (const dive of dives) {
  const post = (sql: string) =>
    fetch("http://localhost:3000/api/lc-sql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: dive.slug, sql }),
    }).then((r) => r.json() as Promise<{ ok?: boolean; rows?: unknown[][]; error?: string }>);

  const good = await post(dive.code);
  if (!good.ok || !good.rows?.length) {
    console.log(`${dive.slug}: RUN FAIL ${JSON.stringify(good).slice(0, 140)}`);
    continue;
  }
  // a wrong attempt (the real query wrapped in a never-true filter) must differ
  const wrongSql = `SELECT * FROM (\n${dive.code.trim().replace(/;+\s*$/, "")}\n) WHERE 1 = 0`;
  const bad = await post(wrongSql);
  const differs = !bad.ok || JSON.stringify(bad.rows) !== JSON.stringify(good.rows);
  console.log(`${dive.slug}: ok ${good.rows.length} rows · wrong-attempt-differs ${differs}`);
}
