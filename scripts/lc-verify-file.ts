// Per-file LeetCode solution verifier — verifies ONLY the dives in the given
// content files, without wiring them into content.ts. Used during parallel
// content authoring so each agent can prove its own file is green.
//
// Run: bunx tsx scripts/lc-verify-file.ts src/lib/leetcode/content/trees.ts:TREES [...]
// (export name optional if the file has exactly one exported array)

import { verifyDives } from "./lc-verify-lib";
import type { LcDeepDive } from "../src/lib/leetcode/types";

const args = process.argv.slice(2);
if (!args.length) {
  console.error("usage: tsx scripts/lc-verify-file.ts <file.ts>[:EXPORT] [...]");
  process.exit(2);
}

(async () => {
  const dives: LcDeepDive[] = [];
  for (const arg of args) {
    const [file, exportName] = arg.split(":");
    const mod = await import(`../${file.replace(/^\/+/, "").replace(/\.ts$/, "")}`);
    if (exportName) {
      const arr = mod[exportName];
      if (!Array.isArray(arr)) {
        console.error(`no array export '${exportName}' in ${file}`);
        process.exit(2);
      }
      dives.push(...(arr as LcDeepDive[]));
    } else {
      const arrays = Object.values(mod).filter((v) => Array.isArray(v) && v.length && (v[0] as LcDeepDive).slug !== undefined && (v[0] as LcDeepDive).verify !== undefined);
      if (arrays.length !== 1) {
        console.error(`${file}: expected exactly one dive array export, found ${arrays.length} — pass :EXPORT`);
        process.exit(2);
      }
      dives.push(...(arrays[0] as LcDeepDive[]));
    }
  }
  // duplicate slug guard
  const seen = new Map<string, number>();
  for (const d of dives) seen.set(d.slug, (seen.get(d.slug) ?? 0) + 1);
  const dupes = [...seen.entries()].filter(([, n]) => n > 1);
  if (dupes.length) {
    console.error(`duplicate slugs: ${dupes.map(([s, n]) => `${s}x${n}`).join(", ")}`);
    process.exit(1);
  }
  console.log(`verifying ${dives.length} dives...`);
  const report = verifyDives(dives, "lc-verify-file");
  if (report.failures.length) process.exit(1);
})();
