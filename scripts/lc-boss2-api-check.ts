// Post each Boss II dive's solution to the LIVE /api/lc-sql endpoint and
// confirm the grader marks it correct end to end.
// Run: bun scripts/lc-boss2-api-check.ts
const { SQL_BOSS2_A } = await import("../src/lib/leetcode/content/sql-boss2-a");
const { SQL_BOSS2_B } = await import("../src/lib/leetcode/content/sql-boss2-b");
const dives = [...SQL_BOSS2_A, ...SQL_BOSS2_B];

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
  const wrongSql = `SELECT * FROM (\n${dive.code.trim().replace(/;+\s*$/, "")}\n) WHERE 1 = 0`;
  const bad = await post(wrongSql);
  const differs = !bad.ok || JSON.stringify(bad.rows) !== JSON.stringify(good.rows);
  console.log(`${dive.slug}: ok ${good.rows.length} rows · wrong-attempt-differs ${differs}`);
}
