import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url, { alias: { "@": "/home/z/my-project/src/" } });
const { LESSONS } = await jiti.import("@/lib/curriculum/lessons");
for (const id of ["lesson-35","lesson-36","lesson-39","lesson-40","lesson-50","lesson-51"]) {
  const L = LESSONS.find((l) => l.id === id);
  const kinds = L.deep?.map((b) => b.kind).join(",") ?? "none";
  const dw = (L.deep ?? []).reduce((a, b) => a + ("text" in b ? b.text.split(/\s+/).length : 0), 0);
  console.log(`${id}: deep=[${kinds}] ${dw}w | blocks=${L.blocks.length} mcqs=${L.mcqs.length} problems=${L.problems.length}`);
}
