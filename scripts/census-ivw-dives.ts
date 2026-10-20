// Census: for every company kit, how many of its 32 problem slugs resolve to
// an executable sandbox dive (lcSqlDive) — the interview-sim coding stage
// needs >=2 per kit. Read-only; prints the worst kits and totals.
import { COMPANY_KITS } from "../src/lib/companies/registry";
import { lcSqlDive } from "../src/lib/leetcode/content/content";
import { lcSqlExpected } from "../src/lib/leetcode/content/sql-expected";

let kits = 0, fullOk = 0, minOk = 0, totalSlugs = 0, totalDives = 0;
const worst: Array<{ id: string; n: number }> = [];
for (const kit of Object.values(COMPANY_KITS)) {
  kits += 1;
  let n = 0;
  for (const p of kit.problems) {
    totalSlugs += 1;
    if (lcSqlDive(p.slug) && lcSqlExpected(p.slug)) { n += 1; totalDives += 1; }
  }
  if (n === kit.problems.length) fullOk += 1;
  if (n >= 2) minOk += 1;
  worst.push({ id: kit.id, n });
}
worst.sort((a, b) => a.n - b.n);
console.log(`kits=${kits} full=${fullOk} min2=${minOk} slugs=${totalSlugs} executable=${totalDives}`);
console.log("worst 8:", worst.slice(0, 8).map((w) => `${w.id}:${w.n}/${COMPANY_KITS[w.id].problems.length}`).join("  "));
