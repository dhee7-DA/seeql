import { ROWS as P58 } from "../src/lib/curriculum/lessons/banks/l58-problems";
import { ROWS as P59 } from "../src/lib/curriculum/lessons/banks/l59-problems";
import { ROWS as P60 } from "../src/lib/curriculum/lessons/banks/l60-problems";
import { ROWS as P61 } from "../src/lib/curriculum/lessons/banks/l61-problems";
import { ROWS as P62 } from "../src/lib/curriculum/lessons/banks/l62-problems";
import { ROWS as P63 } from "../src/lib/curriculum/lessons/banks/l63-problems";
const all = [...P58, ...P59, ...P60, ...P61, ...P62, ...P63];
const seenT = new Map<string, string>();
const seenS = new Map<string, string>();
for (const [i, r] of all.entries()) {
  if (seenT.has(r[0])) console.log("DUP TITLE:", r[0], "<->", seenT.get(r[0]));
  else seenT.set(r[0], r[0]);
  const key = r[4].replace(/\s+/g, " ").trim();
  if (seenS.has(key)) console.log("DUP SOLUTION:", r[0], "<->", seenS.get(key));
  else seenS.set(key, r[0]);
}
console.log("checked", all.length);
