// One-shot: append problem banks into lessons + tag existing problems.
import { readFileSync, writeFileSync } from "fs";

const TAGS: Record<string, string> = {
  "l1-p1": "easy",
  "l2-p1": "easy", "l2-p2": "medium",
  "l3-p1": "easy", "l3-p2": "easy", "l3-p3": "easy",
  "l4-p1": "easy", "l4-p2": "medium", "l4-p3": "medium",
  "l5-p1": "medium", "l5-p2": "medium", "l5-p3": "medium",
  "l6-p1": "easy", "l6-p2": "medium",
  "l7-p1": "easy", "l7-p2": "medium", "l7-p3": "medium",
  "l8-p1": "medium", "l8-p2": "medium", "l8-p3": "easy",
};

for (let i = 1; i <= 8; i++) {
  const nn = String(i).padStart(2, "0");
  const p = `src/lib/curriculum/lessons/lesson-${nn}.ts`;
  let src = readFileSync(p, "utf8");

  // 1) import problem bank (after the mcq bank import)
  if (!src.includes(`problems/problems-${nn}`)) {
    src = src.replace(
      `import { mcqs${nn.replace(/^0/, "0")} } from "../mcqs/mcqs-${nn}";`,
      `import { mcqs${nn} } from "../mcqs/mcqs-${nn}";\nimport { problems${nn} } from "../problems/problems-${nn}";`,
    );
  }

  // 2) tag existing problems with difficulty (insert after their id line)
  for (const [pid, diff] of Object.entries(TAGS)) {
    if (!pid.startsWith(`l${i}-`)) continue;
    const idLine = `id: "${pid}",`;
    if (src.includes(idLine) && !src.includes(`id: "${pid}",\n      difficulty:`)) {
      src = src.replace(idLine, `${idLine}\n      difficulty: "${diff}",`);
    }
  }

  // 3) spread the new bank at the end of the problems array (file end)
  const endAnchor = `  ],\n};`;
  if (!src.includes(`...problems${nn}`)) {
    if (!src.endsWith(`];\n`) && !src.includes(endAnchor)) {
      console.error(`END ANCHOR NOT FOUND in ${p}`);
      process.exit(1);
    }
    src = src.replace(endAnchor, `    ...problems${nn},\n  ],\n};`);
  }

  writeFileSync(p, src);
  console.log(`wired ${p}`);
}
console.log("done");
