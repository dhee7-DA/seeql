// Task 66-c — live grading smoke test for batch-6 problems through the real
// /api/lc-sql route: submit each dive's reference solution and assert ok:true.
import { lcSqlDive } from "../src/lib/leetcode/content/content";

const slugs = process.argv.slice(2);
const targets = slugs.length ? slugs : ["winning-candidate", "leetcodify-friends-recommendations", "hopper-company-queries-iii"];

let fail = 0;
for (const slug of targets) {
  const dive = lcSqlDive(slug);
  if (!dive) { console.error(`FAIL ${slug}: no dive`); fail++; continue; }
  const res = await fetch("http://localhost:3000/api/lc-sql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, sql: dive.code }),
  });
  const json: any = await res.json();
  const ok = json?.ok === true;
  const meta = json?.meta ?? json?.result?.meta ?? "";
  console.log(`${ok ? "PASS" : "FAIL"} ${slug} → ${JSON.stringify(json).slice(0, 220)}${meta ? ` · ${JSON.stringify(meta)}` : ""}`);
  if (!ok) fail++;
}
process.exit(fail ? 1 : 0);
