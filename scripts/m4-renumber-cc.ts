// Renumber dr4-cc ids sequentially in order of appearance (fixes gap at 24 + malformed 23X).
import { readFileSync, writeFileSync } from "node:fs";
const P = "src/lib/curriculum/drills/m4/cte-chains.ts";
let src = readFileSync(P, "utf8");
let n = 0;
src = src.replace(/id: "dr4-cc-[^"]*"/g, () => {
  n += 1;
  return `id: "dr4-cc-${String(n).padStart(2, "0")}"`;
});
writeFileSync(P, src);
console.log("renumbered", n, "ids");
