// One-shot: inject diagram blocks into lesson theory arrays at anchored
// positions. Idempotent (skips if the figure is already present).
import { readFileSync, writeFileSync } from "fs";

type Injection = { lesson: string; after: string; figure: string };

const INJECTIONS: Injection[] = [
  // L1
  { lesson: "01", after: 'a bit like a spreadsheet but with strict rules', figure: "l1-anatomy" },
  { lesson: "01", after: 'touches one or more of these', figure: "l1-relations" },
  { lesson: "01", after: 'which is how one order can contain several products', figure: "l1-pkfk" },
  { lesson: "01", after: 'NULLs change how filters, sorts and aggregates behave', figure: "l1-nulls" },
  // L2
  { lesson: "02", after: 'Listing columns explicitly (`SELECT full_name, city`) is the', figure: "l2-projection" },
  { lesson: "02", after: 'Explore with `*`, ship with explicit columns', figure: "l2-star" },
  { lesson: "02", after: 'The expression runs **once per row**', figure: "l2-expressions" },
  // L3
  { lesson: "03", after: "the analyst's scalpel", figure: "l3-funnel" },
  { lesson: "03", after: 'why parentheses rule', figure: "l3-venn" },
  { lesson: "03", after: '**both endpoints included**', figure: "l3-operators" },
  { lesson: "03", after: 'AND binds tighter than OR', figure: "l3-precedence" },
  // L4
  { lesson: "04", after: '`= NULL` never works', figure: "l4-isnull" },
  { lesson: "04", after: 'the silent leak', figure: "l4-blackhole" },
  { lesson: "04", after: 'returns the **first non-NULL** argu', figure: "l4-truth" },
  { lesson: "04", after: 'COUNT(*) counts rows; COUNT(column) skips NULLs', figure: "l4-aggnull" },  // L5
  { lesson: "05", after: 'promises **no particular row order**', figure: "l5-sort" },
  { lesson: "05", after: 'ties are broken by the second', figure: "l5-direction" },
  { lesson: "05", after: 'keeps the first *n* rows', figure: "l5-limit" },
  // L6
  { lesson: "06", after: "Which countries do our customers actually come from?", figure: "l6-dedupe" },
  { lesson: "06", after: 'Multi-column DISTINCT', figure: "l6-multi" },
  // L7
  { lesson: "07", after: 'Questions like *how many', figure: "l7-collapse" },
  { lesson: "07", after: 'the classic interview question', figure: "l7-counts" },
  { lesson: "07", after: 'Mixing aggregates with bare columns', figure: "l7-mix" },
  // L8
  { lesson: "08", after: 'every column in the SELECT must be either', figure: "l8-buckets" },
  { lesson: "08", after: 'the classic confusion', figure: "l8-gates" },
  { lesson: "08", after: 'why SQL feels backwards', figure: "l8-pipeline" },
  { lesson: "08", after: 'timing riddles of this mod', figure: "l8-alias" },
  { lesson: "08", after: 'treats the whole table as one group', figure: "l8-pitfall" },
];

let applied = 0;
for (const inj of INJECTIONS) {
  const p = `src/lib/curriculum/lessons/lesson-${inj.lesson}.ts`;
  let src = readFileSync(p, "utf8");
  if (src.includes(`figure: "${inj.figure}"`)) {
    console.log(`skip ${inj.figure} (already present)`);
    continue;
  }
  // find the block containing the anchor text, then insert after that block's
  // closing "}," at the same nesting level. Strategy: locate anchor, then scan
  // forward for the line that is exactly "    }," and insert after it.
  const anchorIdx = src.indexOf(inj.after);
  if (anchorIdx < 0) {
    console.error(`ANCHOR NOT FOUND for ${inj.figure}: ${inj.after.slice(0, 40)}`);
    process.exit(1);
  }
  const closeRe = /\n    \},/g;
  closeRe.lastIndex = anchorIdx;
  const m = closeRe.exec(src);
  if (!m) {
    console.error(`BLOCK END NOT FOUND for ${inj.figure}`);
    process.exit(1);
  }
  const insertAt = m.index + m[0].length;
  const block =
    inj.figure === "l6-multi" || inj.figure === "l7-counts" || inj.figure === "l7-mix" || inj.figure === "l8-gates"
      ? `\n    { kind: "diagram", figure: "${inj.figure}" },`
      : `\n    { kind: "diagram", figure: "${inj.figure}" },`;
  src = src.slice(0, insertAt) + block + src.slice(insertAt);
  writeFileSync(p, src);
  applied++;
  console.log(`injected ${inj.figure} into lesson-${inj.lesson}`);
}
console.log(`done — ${applied} injections`);
