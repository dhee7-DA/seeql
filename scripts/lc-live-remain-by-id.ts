// Task 66-a — definitive by-ID reconciliation against the LIVE Database tag.
// Slug matching lied (LeetCode renamed 20 of our built slugs); frontend ids
// are stable. Saves scripts/lc-live-database.json with TRUE remaining lists.
import { SQL50 } from "../src/lib/leetcode/registry-sql50";
import { SQL_MORE } from "../src/lib/leetcode/registry-sql-more";
import { SQL_MORE2 } from "../src/lib/leetcode/registry-sql-more2";
import { SQL_MORE3 } from "../src/lib/leetcode/registry-sql-more3";
import { SQL_PREMIUM } from "../src/lib/leetcode/registry-sql-premium";

const res = await fetch("https://leetcode.com/graphql/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Referer: "https://leetcode.com/problemset/database/",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
  },
  body: JSON.stringify({
    query: `query topicTag($slug: String!){topicTag(slug:$slug){questions{questionFrontendId titleSlug difficulty isPaidOnly}}}`,
    variables: { slug: "database" },
  }),
});
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const qs: Array<{ questionFrontendId: string; titleSlug: string; difficulty: string; isPaidOnly: boolean }> =
  (await (res.json() as any)).data.topicTag.questions;
console.log(`LIVE Database tag: ${qs.length} questions`);

const live = new Map<number, { questionFrontendId: string; titleSlug: string; difficulty: string; isPaidOnly: boolean }>();
for (const q of qs) live.set(Number(q.questionFrontendId), q);

const built = new Map<number, { premium: boolean; slug: string }>();
for (const r of [...SQL50, ...SQL_MORE, ...SQL_MORE2, ...SQL_MORE3]) built.set(r[0], { premium: false, slug: r[1] });
for (const r of SQL_PREMIUM) built.set(r[0], { premium: true, slug: r[1] });

let bf = 0, bp = 0;
const remainF: Array<{ id: string; slug: string; difficulty: string }> = [];
const remainP: Array<{ id: string; slug: string; difficulty: string }> = [];
const renamed: string[] = [];
for (const [id, q] of live) {
  const b = built.get(id);
  if (b) {
    if (q.isPaidOnly) bp++; else bf++;
    if (b.slug !== q.titleSlug) renamed.push(`${id}: built "${b.slug}" -> live "${q.titleSlug}"`);
  } else (q.isPaidOnly ? remainP : remainF).push({ id: q.questionFrontendId, slug: q.titleSlug, difficulty: q.difficulty });
}
const stale = [...built.keys()].filter((id) => id < 9000 && !live.has(id));
const num = (a: typeof remainF) => a.sort((x, y) => Number(x.id) - Number(y.id));
num(remainF); num(remainP);

console.log(`built & live (by id): ${bf} live-free + ${bp} live-premium = ${bf + bp} of 145 LC-origin built`);
console.log(`slug renames (built, no work needed): ${renamed.length}`);
console.log(`stale built LC ids: ${stale.length}`);
console.log(`TRUE REMAINING: ${remainF.length} free + ${remainP.length} premium = ${remainF.length + remainP.length}`);

await Bun.write(
  "/home/z/my-project/scripts/lc-live-database.json",
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      liveTotal: qs.length,
      liveFree: qs.filter((q) => !q.isPaidOnly).length,
      livePremium: qs.filter((q) => q.isPaidOnly).length,
      builtFreeLive: bf,
      builtPremiumLive: bp,
      slugRenames: renamed,
      staleBuiltIds: stale,
      remainingFree: remainF,
      remainingPremium: remainP,
    },
    null,
    2,
  ),
);
console.log("saved: scripts/lc-live-database.json (by-id, authoritative)");
