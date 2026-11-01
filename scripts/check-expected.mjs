import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url, { alias: { "@": "/home/z/my-project/src/" } });
const { LESSONS } = await jiti.import("@/lib/curriculum/lessons");
const bad = [];
for (const L of LESSONS) for (const p of L.problems) {
  const noRows = !p.expected || p.expected.rows.length === 0;
  const noChanges = p.expected.changes == null;
  if (noRows && noChanges) bad.push(p);
}
console.log("problems with EMPTY grading target (no rows, no changes):", bad.length);
for (const p of bad) console.log(" -", p.id, "|", p.title.slice(0,60), "| mutating:", !!p.mutating, "| verify:", !!p.verify);
console.log("\nsolution of first:", bad[0]?.solution?.slice(0,200));
