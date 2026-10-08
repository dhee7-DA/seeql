// Task 66 — inventory: how many of the built SQL problems originate from
// LeetCode (real LC ids) vs re-authored platform classics (custom 95xx+ ids),
// split free/premium — to size the remaining gap against LeetCode's live
// Database tag (~315 total incl. premium, per the user).
import { SQL50 } from "../src/lib/leetcode/registry-sql50";
import { SQL_MORE } from "../src/lib/leetcode/registry-sql-more";
import { SQL_MORE2 } from "../src/lib/leetcode/registry-sql-more2";
import { SQL_MORE3 } from "../src/lib/leetcode/registry-sql-more3";
import { SQL_PREMIUM } from "../src/lib/leetcode/registry-sql-premium";

const isLc = (id: number) => id < 9000; // custom platform re-authors use 95xx+
const batches: Array<[string, number[]]> = [
  ["SQL50 (batch 1)", SQL50.map((r) => r[0])],
  ["SQL_MORE (batch 2)", SQL_MORE.map((r) => r[0])],
  ["SQL_MORE2 (batch 3)", SQL_MORE2.map((r) => r[0])],
  ["SQL_MORE3 (batch 4)", SQL_MORE3.map((r) => r[0])],
  ["SQL_PREMIUM (batch 5)", SQL_PREMIUM.map((r) => r[0])],
];

let total = 0, lcOrigin = 0, platform = 0, lcPremium = 0;
const lcFreeIds: number[] = [];
const lcPremiumIds: number[] = [];
const seen = new Set<number>();
for (const [name, ids] of batches) {
  const lcCount = ids.filter(isLc).length;
  console.log(`${name}: ${ids.length} rows · ${lcCount} LC-origin · ${ids.length - lcCount} platform re-authors`);
  total += ids.length;
  lcOrigin += lcCount;
  platform += ids.length - lcCount;
  for (const id of ids) {
    if (seen.has(id)) console.error(`DUP id ${id} across batches!`);
    seen.add(id);
    if (isLc(id)) {
      if (name.includes("PREMIUM")) { lcPremium++; lcPremiumIds.push(id); }
      else lcFreeIds.push(id);
    }
  }
}
console.log("----");
console.log(`TOTAL built: ${total} (LC-origin ${lcOrigin} · platform re-authors ${platform})`);
console.log(`LeetCode-origin FREE built: ${lcFreeIds.length}`);
console.log(`LeetCode-origin PREMIUM built: ${lcPremium}`);
console.log(`Combined LC-origin: ${lcOrigin}`);
console.log(`\nAssuming LeetCode Database tag ≈ 315 total (incl. premium):`);
console.log(`  remaining LC free    ≈ 315 - (free+premium built) vs premium long-tail next`);
console.log(`  gap vs 315 ≈ ${315 - lcOrigin}`);
