// One-shot wiring: append MCQ banks + problem banks into lesson files.
import { readFileSync, writeFileSync } from "fs";

for (let i = 1; i <= 8; i++) {
  const nn = String(i).padStart(2, "0");
  const p = `src/lib/curriculum/lessons/lesson-${nn}.ts`;
  let src = readFileSync(p, "utf8");

  // 1) import mcq bank after the type import
  if (!src.includes(`mcqs/mcqs-${nn}`)) {
    src = src.replace(
      `import type { Lesson } from "../types";`,
      `import type { Lesson } from "../types";\nimport { mcqs${nn.replace("0", "")} } from "../mcqs/mcqs-${nn}";`,
    );
  }

  // 2) spread bank before the closing of the mcqs array
  const anchor = `  ],\n  problems: [`;
  if (!src.includes(`...mcqs${nn.replace("0", "")}`)) {
    if (!src.includes(anchor)) {
      console.error(`ANCHOR NOT FOUND in ${p}`);
      process.exit(1);
    }
    src = src.replace(anchor, `    ...mcqs${nn.replace("0", "")},\n  ],\n  problems: [`);
  }

  writeFileSync(p, src);
  console.log(`wired ${p}`);
}
console.log("done");
