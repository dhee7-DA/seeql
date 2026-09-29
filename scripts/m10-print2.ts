import { LESSONS } from "../src/lib/curriculum/lessons";
for (const l of LESSONS) {
  for (const p of l.problems) {
    if (["l60-p41", "l61-p7", "l63-p2", "l63-p3", "l63-p36"].includes(p.id)) {
      console.log("=== " + p.id + " ===\n" + p.solution + "\n");
    }
  }
}
