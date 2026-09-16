/// <reference types="bun-types" />
/** Apply wave-5 rewrites to cases-t5.ts by block replacement. */
import { readFileSync, writeFileSync } from "node:fs";
import { RW_A } from "./t5-rw-a";
import { RW_B } from "./t5-rw-b";
import { RW_C } from "./t5-rw-c";

const MAP: Record<string, string> = { ...RW_A, ...RW_B, ...RW_C };
const PATH = "src/lib/curriculum/cases/cases-t5.ts";

const lines = readFileSync(PATH, "utf8").split("\n");
const out: string[] = [];
let i = 0;
let replaced = 0;
const replacedIds: string[] = [];

while (i < lines.length) {
  if (lines[i] === "  {") {
    // find block end: next line exactly "  },"
    let j = i + 1;
    while (j < lines.length && lines[j] !== "  },") j++;
    if (j >= lines.length) throw new Error(`unterminated block starting at line ${i + 1}`);
    const block = lines.slice(i, j + 1).join("\n");
    const idMatch = block.match(/id: "cs-(\d+)"/);
    const id = idMatch ? `cs-${idMatch[1]}` : null;
    if (id && MAP[id]) {
      out.push(...MAP[id].split("\n"));
      replaced++;
      replacedIds.push(id);
    } else {
      out.push(...lines.slice(i, j + 1));
    }
    i = j + 1;
  } else {
    out.push(lines[i]);
    i++;
  }
}

const expected = Object.keys(MAP).length;
if (replaced !== expected) {
  console.error(`expected ${expected} replacements, made ${replaced}. Missing: ${Object.keys(MAP).filter((k) => !replacedIds.includes(k)).join(", ")}`);
  process.exit(1);
}
writeFileSync(PATH, out.join("\n"));
console.log(`replaced ${replaced} blocks: ${replacedIds.join(" ")}`);
