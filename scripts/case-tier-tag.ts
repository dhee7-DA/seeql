/// <reference types="bun-types" />
// Classify all existing case files into easy/medium/hard via a structural
// rubric, inject `tier: "…"` after each case's id line in its source file,
// and print the resulting distribution + gap to 100/100/100.
//
// Rubric (on the FILLED sql, uppercased):
//   HARD : has HAVING (stage-split teach) | slots>=6 | slots>=5 & heavy>=2
//          | slots>=5 & noVerify>=2 | nums>=2 | null trap inside grouped query
//   EASY : slots<=3 & heavy==0 & noVerify<=1 & nums<=1  (single-concept recall)
//   MEDIUM: everything else
// where heavy counts GROUP BY / HAVING / ORDER BY / LIMIT / DISTINCT.
//
// bun scripts/case-tier-tag.ts            # dry-run: print tiers only
// bun scripts/case-tier-tag.ts --write    # inject tier fields
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CASES } from "../src/lib/curriculum/cases";

function filledSql(c: (typeof CASES)[number]): string {
  return c.template.replace(/\{(\d+)\}/g, (_m, d) => c.slots[Number(d) - 1]?.answer ?? "").toUpperCase();
}

function classify(c: (typeof CASES)[number]): "easy" | "medium" | "hard" {
  const t = filledSql(c);
  const has = (s: string) => t.includes(s);
  const slots = c.slots.length;
  const nums = c.slots.filter((s) => s.kind === "number").length;
  const noVerify = c.slots.filter((s) => s.noVerify).length;
  const heavy = [has("GROUP BY"), has("HAVING"), has("ORDER BY"), has("LIMIT"), has("DISTINCT")].filter(Boolean).length;
  const hasHaving = has("HAVING");
  const hasGroup = has("GROUP BY");
  const nullTrap =
    has("IS NULL") ||
    c.distractors.some((d) => /^(=|NOT NULL|NULL|IS NOT)$/i.test(d.trim()));
  const isHard =
    hasHaving ||
    slots >= 6 ||
    (slots >= 5 && heavy >= 2) ||
    (slots >= 5 && noVerify >= 2) ||
    nums >= 2 ||
    (nullTrap && (hasGroup || hasHaving));
  if (isHard) return "hard";
  if (slots <= 3 && heavy === 0 && noVerify <= 1 && nums <= 1) return "easy";
  return "medium";
}

const tierById = new Map<string, string>();
// Manual override: cs-011 (plain LIMIT-5 row cap, l1) is the simplest shape in
// the deck — rubric calls it medium on a 4th chip, but it is single-concept.
// Medium sat at 101; this lands the existing 200 at 42/100/58 so the authoring
// gap is exactly 58 easy + 42 hard = 100 new cases.
const OVERRIDE: Record<string, "easy" | "medium" | "hard"> = { "cs-011": "easy" };
for (const c of CASES) tierById.set(c.id, OVERRIDE[c.id] ?? classify(c));

const dist = { easy: 0, medium: 0, hard: 0 };
for (const t of tierById.values()) dist[t as keyof typeof dist]++;
console.log("current 200 distribution:", dist);
console.log("gap to 100/100/100:", {
  easy: 100 - dist.easy,
  medium: 100 - dist.medium,
  hard: 100 - dist.hard,
});

// per-topic tier matrix
const topics = [...new Set(CASES.map((c) => c.topic))].sort();
for (const tp of topics) {
  const rs = CASES.filter((c) => c.topic === tp);
  const e = rs.filter((c) => tierById.get(c.id) === "easy").length;
  const m = rs.filter((c) => tierById.get(c.id) === "medium").length;
  const h = rs.filter((c) => tierById.get(c.id) === "hard").length;
  console.log(`  ${tp}: easy=${e} medium=${m} hard=${h}`);
}

if (!process.argv.includes("--write")) {
  for (const c of CASES) console.log(`${c.id} ${c.topic} -> ${tierById.get(c.id)}`);
  process.exit(0);
}

// ---- write pass: inject tier after each id line in its source file ----------
const DIR = "src/lib/curriculum/cases";
let patched = 0;
const seen = new Set<string>();
for (const f of readdirSync(DIR).filter((x) => x.endsWith(".ts") && (x.startsWith("cases-") || x === "exemplars.ts"))) {
  const path = join(DIR, f);
  let text = readFileSync(path, "utf8");
  let filePatches = 0;
  for (const c of CASES) {
    const tier = tierById.get(c.id);
    const re = new RegExp(`^(?<ind>[ \\t]*)id: "${c.id}",$`, "m");
    const m = re.exec(text);
    if (m && !seen.has(c.id)) {
      text = text.replace(re, `${m.groups!.ind}id: "${c.id}",\n${m.groups!.ind}tier: "${tier}",`);
      seen.add(c.id);
      filePatches++;
    }
  }
  if (filePatches > 0) {
    writeFileSync(path, text);
    patched += filePatches;
    console.log(`patched ${f}: ${filePatches} cases`);
  }
}
console.log(`total patched: ${patched} / ${CASES.length} (missing: ${CASES.length - patched})`);
