import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url, { alias: { "@": "/home/z/my-project/src/" } });
const { FIGURE_META } = await jiti.import("@/lib/curriculum/figure-meta");
const v = FIGURE_META.filter((f) => /^v\d/.test(f.figure));
console.log("FIGURE_META total:", FIGURE_META.length, "| v-figures now included:", v.length);
for (const f of v) console.log(`  ${f.figure} → ${f.lessonId} (M${f.moduleNum})`);
