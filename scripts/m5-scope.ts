// M5 scope probe — which taxonomy keywords do lessons 29-32 + 39 teach?
import { LESSONS } from "../src/lib/curriculum/lessons";
import { tag } from "../src/lib/curriculum/keyword-taxonomy";

const M5_LESSONS = new Set([29, 30, 31, 32, 39]);
const counts = new Map<string, number>();
for (const l of LESSONS) {
  if (!M5_LESSONS.has(l.num)) continue;
  let prose = `${l.title} ${l.blurb} `;
  const sqlParts: string[] = [];
  const walk = (blocks: any[]) => {
    for (const b of blocks) {
      switch (b.kind) {
        case "code": sqlParts.push(b.sql, b.caption ?? ""); break;
        case "table": prose += `${b.headers.join(" ")} ${b.rows.flat().join(" ")} `; break;
        case "bullets": case "steps": prose += `${b.items.join(" ")} `; break;
        case "engine": prose += `${b.title} ${b.steps.join(" ")} `; break;
        case "myth": prose += `${b.myth} ${b.truth} `; break;
        case "edge": prose += `${b.items.map((e: any) => `${e.c} ${e.r}`).join(" ")} `; break;
        default: if ("text" in b) prose += `${(b as any).text} `;
      }
    }
  };
  walk(l.blocks); if (l.deep) walk(l.deep); if (l.takeaway) prose += l.takeaway;
  const kws = [...tag(null, prose, sqlParts.join(" ")).kws].sort();
  console.log(`lesson-${l.num} (${l.title}): ${kws.join(", ")}`);
  for (const k of kws) counts.set(k, (counts.get(k) ?? 0) + 1);
}
console.log("\nM5 union:", [...counts.keys()].sort().join(" | "));
