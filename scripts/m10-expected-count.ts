import { EXPECTED } from "../src/lib/curriculum/expected";
const keys = Object.keys(EXPECTED).filter(k => /^l(58|59|60|61|62|63)-p\d+$/.test(k));
const byLesson: Record<string, number> = {};
for (const k of keys) { const l = k.slice(0, 3); byLesson[l] = (byLesson[l] ?? 0) + 1; }
console.log(byLesson, "total", keys.length);
console.log("grand total EXPECTED:", Object.keys(EXPECTED).length);
// spot-check some payloads
console.log("l58-p1 rows:", EXPECTED["l58-p1"].rows.length, "cols:", EXPECTED["l58-p1"].columns);
console.log("l63-p47 (works board) rows:", EXPECTED["l63-p47"]?.rows.length ?? EXPECTED["l63-p47"]?.rows.length ?? "MISSING");
console.log("l62-p53 rows:", EXPECTED["l62-p53"]?.rows.length ?? "MISSING");
