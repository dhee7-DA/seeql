import { FILLS_BY_LESSON } from "../src/lib/curriculum/fills/m02";
const keys = Object.keys(FILLS_BY_LESSON).map(Number).sort((a, b) => a - b);
for (const k of keys) {
  const fills = FILLS_BY_LESSON[k];
  const multi = fills.filter((f) => f.answers.length >= 2).length;
  const ids = fills.map((f) => f.id).join(",");
  console.log(`lesson ${k}: ${fills.length} fills (${multi} multi-slot) [${ids}]`);
}
