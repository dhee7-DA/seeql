// Repro: drawLoop for a single-kit pool (Amazon) — how many coding problems?
import { COMPANY_KITS } from "../src/lib/companies/registry";
import { lcSqlDive } from "../src/lib/leetcode/content/content";
import { lcSqlExpected } from "../src/lib/leetcode/content/sql-expected";

const kit = COMPANY_KITS["amazon"];
const CODE_N = 2;
const problems: string[] = [];
const kits = [kit];
for (const k of kits) {
  if (problems.length >= CODE_N) break;
  const mapped = k.problems.map((p) => ({ p, dive: lcSqlDive(p.slug) }));
  console.log("mapped:", mapped.length, "with dive:", mapped.filter((x) => x.dive).length,
    "with expected:", mapped.filter((x) => lcSqlExpected(x.p.slug)).length,
    "excl first:", mapped.filter((x) => x.dive && lcSqlExpected(x.p.slug) && !problems.some((q) => q === x.p.slug)).length);
  const cand = mapped
    .find((x) => x.dive && lcSqlExpected(x.p.slug) && !problems.some((q) => q === x.p.slug));
  if (cand?.dive) problems.push(cand.p.slug);
}
console.log("problems drawn:", problems.length, problems);
