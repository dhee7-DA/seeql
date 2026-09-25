// Compare suspected duplicate m5 pairs: id prefixes + prompt overlap.
import * as fs from "fs";

const files = [
  ["lag-lead.ts", "window-offsets.ts"],
  ["frames.ts", "window-frames.ts"],
  ["cast-coercion.ts", "type-cast.ts"],
  ["text-functions.ts", "text-toolkit.ts"],
  ["rank-family.ts", "window-rank.ts"],
  ["date-math.ts", "date-edges.ts"],
  ["ops-calendar.ts", "toolkit-capstone.ts"],
] as const;

const prompts = (f: string) =>
  (fs.readFileSync(`src/lib/curriculum/drills/m5/${f}`, "utf8").match(/prompt:\s*\n?\s*"([^"]+)"/g) ?? [])
    .map((p) => p.replace(/prompt:\s*\n?\s*"/, "").replace(/"$/, "").toLowerCase().replace(/[^a-z0-9 ]/g, "").slice(0, 60));

for (const [a, b] of files) {
  const pa = prompts(a), pb = prompts(b);
  const setb = new Set(pb);
  const overlap = pa.filter((p) => setb.has(p)).length;
  const ida = fs.readFileSync(`src/lib/curriculum/drills/m5/${a}`, "utf8").match(/id:\s*"(dr5-[^-]+)-/)?.[1];
  const idb = fs.readFileSync(`src/lib/curriculum/drills/m5/${b}`, "utf8").match(/id:\s*"(dr5-[^-]+)-/)?.[1];
  console.log(`${a} (${ida}, ${pa.length}q)  vs  ${b} (${idb}, ${pb.length}q)  → identical prompts: ${overlap}`);
}
