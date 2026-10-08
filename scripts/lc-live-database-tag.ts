// Live reconciliation v3: the classic topicTag query still works.
// Pull every Database-tagged question from LeetCode's public GraphQL and diff
// against our built LC-origin slugs → exact remaining free/premium gap lists.
import { SQL50 } from "../src/lib/leetcode/registry-sql50";
import { SQL_MORE } from "../src/lib/leetcode/registry-sql-more";
import { SQL_MORE2 } from "../src/lib/leetcode/registry-sql-more2";
import { SQL_MORE3 } from "../src/lib/leetcode/registry-sql-more3";
import { SQL_PREMIUM } from "../src/lib/leetcode/registry-sql-premium";
import { SQL_PREMIUM2 } from "../src/lib/leetcode/registry-sql-premium2";
// future registries (batches 8/9) are picked up automatically once they exist
async function tryImport(path: string): Promise<any[]> {
  try { const m: any = await import(path); return Object.values(m)[0] as any[] ?? []; }
  catch { return []; }
}

const QUERY = `
query topicTag($slug: String!) {
  topicTag(slug: $slug) {
    name
    slug
    questions {
      questionFrontendId
      title
      titleSlug
      difficulty
      isPaidOnly
    }
  }
}`;

type Q = {
  questionFrontendId: string;
  title: string;
  titleSlug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isPaidOnly: boolean;
};

const res = await fetch("https://leetcode.com/graphql/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Referer: "https://leetcode.com/problemset/database/",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
  },
  body: JSON.stringify({ query: QUERY, variables: { slug: "database" } }),
});
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const json: any = await res.json();
const tag = json?.data?.topicTag;
if (!tag) throw new Error(`no topicTag data: ${JSON.stringify(json).slice(0, 300)}`);
const all: Q[] = tag.questions as Q[];
console.log(`LIVE Database tag: ${all.length} questions`);

// ---- built slugs (LC-origin only: real LC ids < 9000) ----
const built = new Map<string, { id: number; premium: boolean }>();
for (const r of [...SQL50, ...SQL_MORE, ...SQL_MORE2, ...SQL_MORE3]) built.set(r[1], { id: r[0], premium: false });
for (const r of SQL_PREMIUM) built.set(r[1], { id: r[0], premium: true });
for (const r of SQL_PREMIUM2) built.set(r[1], { id: r[0], premium: true });
for (const r of await tryImport("../src/lib/leetcode/registry-sql-premium3.ts")) built.set(r[1], { id: r[0], premium: true });
for (const r of await tryImport("../src/lib/leetcode/registry-sql-premium4.ts")) built.set(r[1], { id: r[0], premium: true });
for (const r of await tryImport("../src/lib/leetcode/registry-sql-final-free.ts")) built.set(r[1], { id: r[0], premium: false });

const seen = new Set<string>();
const free: Q[] = [], prem: Q[] = [];
for (const q of all) {
  if (seen.has(q.titleSlug)) console.error(`LIVE DUP ${q.titleSlug}`);
  seen.add(q.titleSlug);
  (q.isPaidOnly ? prem : free).push(q);
}
console.log(`LIVE free: ${free.length} · premium: ${prem.length}`);
console.log(`LIVE difficulty: E${all.filter((q) => q.difficulty === "Easy").length} / M${all.filter((q) => q.difficulty === "Medium").length} / H${all.filter((q) => q.difficulty === "Hard").length}`);

let builtFree = 0, builtPrem = 0, stale = 0;
const remainFree: Q[] = [], remainPrem: Q[] = [];
for (const q of all) {
  const b = built.get(q.titleSlug);
  if (b) { if (b.premium) builtPrem++; else builtFree++; }
  else (q.isPaidOnly ? remainPrem : remainFree).push(q);
}
for (const [slug, b] of built) if (!seen.has(slug)) { stale++; console.error(`BUILT NOT IN LIVE TAG: ${slug} (${b.id})`); }

console.log(`---- RECONCILIATION ----`);
console.log(`built & live: ${builtFree} free + ${builtPrem} premium = ${builtFree + builtPrem} built LC-origin (${stale} built slugs not in the live Database tag)`);
console.log(`REMAINING: ${remainFree.length} free · ${remainPrem.length} premium · ${remainFree.length + remainPrem.length} total`);

const fmt = (q: Q) => `${q.questionFrontendId}|${q.titleSlug}|${q.difficulty[0]}`;
const byDiff = (a: Q, b: Q) => Number(a.questionFrontendId) - Number(b.questionFrontendId);
remainPrem.sort(byDiff); remainFree.sort(byDiff);
console.log(`\n-- REMAINING PREMIUM (${remainPrem.length}) --`);
console.log(remainPrem.map(fmt).join("\n"));

const out = { fetchedAt: new Date().toISOString(), liveTotal: all.length, liveFree: free.length, livePremium: prem.length, builtFree, builtPremium: builtPrem, staleBuilt: stale, remainingFree: remainFree, remainingPremium: remainPrem };
await Bun.write("/home/z/my-project/scripts/lc-live-database.json", JSON.stringify(out, null, 2));
console.log(`\nremaining free list (${remainFree.length}) saved to scripts/lc-live-database.json`);
console.log(remainFree.map(fmt).join("\n"));
