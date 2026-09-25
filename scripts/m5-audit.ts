// Check the orphaned drills/m5/* files — are they real, complete, and unregistered?
import * as fs from "fs";
import * as path from "path";

const dir = "src/lib/curriculum/drills/m5";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts"));
console.log(`m5 drill files on disk: ${files.length}\n`);

let total = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(dir, f), "utf8");
  // count DrillQ objects: lines with `id: "w-` or aspect fields — use a heuristic:
  // each question object starts with something like  { id: "..."
  const ids = src.match(/\bid:\s*["'][^"']+["']/g) ?? [];
  const aspects = (src.match(/aspect:\s*"/g) ?? []).length;
  total += aspects;
  console.log(`${f.padEnd(22)} exports=${(src.match(/export const \w+/g) ?? []).join(",")}  questions≈${aspects}  (ids:${ids.length})`);
}
console.log(`\nTOTAL questions sitting unregistered in m5: ≈${total}`);

// where does m1 file compare (sanity: same shape?)
const m1 = fs.readFileSync("src/lib/curriculum/drills/m1/where.ts", "utf8");
console.log(`\nsanity — m1/where.ts aspect count: ${(m1.match(/aspect:\s*"/g) ?? []).length}`);
