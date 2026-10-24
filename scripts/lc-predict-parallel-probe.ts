// Offline replica of lc-predict.tsx buildDrill (the PARALLEL version shipped
// in this round) — runs against the live /api/lc-sql to prove drills build.

interface ExecResult { ok: true; columns: string[]; rows: unknown[][] }
type Res = ExecResult | { ok: false; error: string };

async function execSql(slug: string, sql: string): Promise<Res> {
  const res = await fetch("http://localhost:3000/api/lc-sql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, sql }),
  });
  return (await res.json()) as Res;
}

const FULL_POOL = new Set(JSON.parse(
  (await Bun.file("src/lib/leetcode/followup-specs.ts").text())
    .match(/export const DRILL_SLUGS: string\[\] = (\[[^\]]+\])/)![1],
) as string[]);

const DRILL2 = new Set(JSON.parse(
  (await Bun.file("src/lib/leetcode/followup-specs.ts").text())
    .match(/export const DRILL2_SLUGS: string\[\] = (\[[^\]]+\])/)![1],
) as string[]);

async function main() {
  const { lcSqlDive } = await import("../src/lib/leetcode/content/content");
  const { stripComments, applyFuSpec, fuDistractorSpecs, fuDistractorLabel } =
    await import("../src/lib/leetcode/followups");

  const samples = ["not-boring-movies", "top-travellers", "rising-temperature", "department-highest-salary", "lru-cache"];
  let ok = 0;
  for (const slug of samples) {
    const dive = lcSqlDive(slug);
    if (!dive) { console.log(`${slug}: no dive (skip)`); continue; }
    const target = FULL_POOL.has(slug) ? 4 : 3;
    const truthSql = stripComments(dive.code);
    const truth = await execSql(slug, truthSql);
    if (!truth.ok) { console.log(`${slug}: TRUTH FAILED ${"error" in truth ? truth.error : ""}`); continue; }
    const specSqls = fuDistractorSpecs(dive)
      .map((spec) => ({ spec, sql: applyFuSpec(dive, spec) }))
      .filter((s): s is { spec: ReturnType<typeof fuDistractorSpecs>[number]; sql: string } => s.sql !== null);
    // PARALLEL — the shipped scheduling
    const specRes = await Promise.all(specSqls.map((s) => execSql(slug, s.sql)));
    const seen = new Set<string>([JSON.stringify(truth.rows)]);
    const out: Array<{ label: string }> = [{ label: "truth" }];
    for (let i = 0; i < specSqls.length && out.length < 4; i++) {
      const r = specRes[i];
      if (!r.ok) continue;
      const key = JSON.stringify(r.rows);
      if (seen.has(key)) continue;
      if (r.rows.length < 1 || r.rows.length > 60) continue;
      seen.add(key);
      out.push({ label: fuDistractorLabel(specSqls[i].spec) });
    }
    const pass = out.length >= target;
    if (pass) ok++;
    console.log(`${pass ? "PASS" : "FAIL"} ${slug}: ${out.length}/${target} candidates [${out.map((o) => o.label).join(", ")}]`);
  }
  console.log(`\nparallel buildDrill: ${ok}/${samples.length} drills built`);
  if (ok < samples.filter((s) => lcSqlDive(s)).length) process.exit(1);
}

main();
