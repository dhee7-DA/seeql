// One-shot: re-id the 5 secondary-generation m5 drill files so they can be
// merged into their primary twins without XP-ledger id collisions, and align
// each file's KW constant to the primary's keyword string.
import * as fs from "fs";

const JOBS = [
  // [file, oldPrefix, newPrefix, startNum, newKW]
  ["rank-family.ts", "dr5-rk", "dr5-wr", 51, "Ranking windows"],
  ["lag-lead.ts", "dr5-lag", "dr5-wo", 51, "LAG & LEAD"],
  ["frames.ts", "dr5-fr", "dr5-wf", 46, "Frames & running totals"],
  ["type-cast.ts", "dr5-cs", "dr5-cast", 46, "CAST & coercion"],
  ["text-functions.ts", "dr5-tx", "dr5-tx", 51, "Text toolkit"],
] as const;

const dir = "src/lib/curriculum/drills/m5";

for (const [file, oldPfx, newPfx, start, kw] of JOBS) {
  const path = `${dir}/${file}`;
  let src = fs.readFileSync(path, "utf8");
  let n = start - 1;
  src = src.replace(/id:\s*"dr5-[a-z]+-(\d+)"/g, (_m, _num) => {
    n += 1;
    return `id: "${newPfx}-${String(n).padStart(2, "0")}"`;
  });
  const kwBefore = src.match(/const KW = "([^"]+)"/)?.[1];
  src = src.replace(/const KW = "[^"]+"/, `const KW = "${kw}"`);
  fs.writeFileSync(path, src);
  console.log(`${file}: ${n - start + 1} ids renumbered → ${newPfx}-${String(start).padStart(2, "0")}..${String(n).padStart(2, "0")}  (KW: "${kwBefore}" → "${kw}")`);
}

// verify: no cross-file id collisions remain across ALL m5 files
const seen = new Map<string, string>();
let collisions = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".ts"))) {
  const src = fs.readFileSync(`${dir}/${f}`, "utf8");
  for (const m of src.matchAll(/id:\s*"(dr5-[a-z]+-\d+)"/g)) {
    if (seen.has(m[1])) { console.log(`COLLISION ${m[1]}: ${seen.get(m[1])} vs ${f}`); collisions++; }
    seen.set(m[1], f);
  }
}
console.log(`\ntotal unique ids: ${seen.size}, collisions: ${collisions}`);
