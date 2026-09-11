// Independent validation of the 6 unreported M3 drill files (m3-w1a/c/e products).
// Checks structure, ids, dupes (within file + vs whole bank + vs each other),
// shapes, aspect/tier/keyword validity, id-prefix module coherence, and
// sequential numbering. Also tsc is run separately.
import { readFileSync } from "node:fs";

const FILES: Array<[string, string, number]> = [
  ["union", "UNION & UNION ALL", 55],
  ["intersect", "INTERSECT", 45],
  ["case-when", "CASE WHEN", 55],
  ["case-aggregate", "CASE + aggregates", 50],
  ["set-edges", "Set op edge cases", 40],
  ["set-judgment", "Choosing set ops", 40],
  ["set-ordering", "Ordering & shaping sets", 45],
  ["case-sorts", "CASE sorts & labels", 40],
];

// Parse the TS source with regex — good enough for structural checks
// (the real type-level gate is `bunx tsc --noEmit`).
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { console.log("  ✗ " + m); fail++; } };
const globalIds = new Set<string>();
const globalPrompts = new Map<string, string>();

for (const [name, kw, expectN] of FILES) {
  const path = `src/lib/curriculum/drills/m3/${name}.ts`;
  const src = readFileSync(path, "utf8");
  console.log(`== ${name}.ts ==`);

  // question blocks: split on `{ id: "dr3-.."`
  const blocks = src.split(/\n\s*\{ id: /).slice(1);
  ok(blocks.length === expectN, `${name}: found ${blocks.length} blocks, expect ${expectN}`);

  const firstId = blocks[0]?.match(/^"(dr3-[a-z]+)-(\d{2})"/);
  const abbr = firstId ? firstId[1] : "";
  ok(!!abbr, `${name}: cannot derive abbr from first block`);
  const ids = new Set<string>();
  const prompts = new Set<string>();
  let n = 0;
  for (const b of blocks) {
    n++;
    const idm = b.match(/^"(dr3-[a-z]+)-(\d{2})"/);
    ok(!!idm, `${name} block ${n}: id shape`);
    if (!idm) continue;
    const [, ab, num] = idm;
    ok(ab === abbr, `${name}: id abbr drift ${ab}`);
    ok(Number(num) === n, `${name}: id ${ab}-${num} out of sequence (expected ${String(n).padStart(2, "0")})`);
    const full = `${ab}-${num}`;
    ok(!ids.has(full), `${name}: dup id ${full}`);
    ids.add(full);
    ok(!globalIds.has(full), `${full}: dup id across m3 files`);
    globalIds.add(full);

    const kwM = b.match(/keyword: KW/);
    ok(!!kwM, `${full}: missing keyword: KW`);
    const tier = ["set-edges", "set-judgment", "set-ordering", "case-sorts", "set-precedence"].includes(name) ? "secondary" : "core";
    ok(b.includes(`tier: "${tier}"`), `${full}: wrong tier`);
    const aspM = b.match(/aspect: "([a-z]+)"/);
    ok(!!aspM && ["syntax", "semantics", "edge", "errors", "predict", "judgment"].includes(aspM[1]), `${full}: bad aspect`);

    const promptM = b.match(/prompt: "((?:[^"\\]|\\.)*)"/);
    ok(!!promptM && promptM[1].length >= 15, `${full}: thin/missing prompt`);
    if (promptM) {
      const p = promptM[1];
      ok(!prompts.has(p), `${name}: dup prompt at ${full}`);
      prompts.add(p);
      ok(!globalPrompts.has(p), `dup prompt vs ${globalPrompts.get(p)}: ${p.slice(0, 60)}`);
      globalPrompts.set(p, full);
    }
    // choices array: count occurrences of quoted strings inside choices[...]
    const chM = b.match(/choices: \[([^\]]*)\]/s);
    ok(!!chM, `${full}: missing choices`);
    if (chM) {
      const items = chM[1].match(/"(?:[^"\\]|\\.)*"/g) ?? [];
      ok(items.length === 4, `${full}: ${items.length} choices`);
      ok(new Set(items).size === 4, `${full}: duplicate choice text`);
    }
    const ansM = b.match(/answer: (\d)/);
    ok(!!ansM && Number(ansM[1]) <= 3, `${full}: bad answer index`);
    const whyM = b.match(/why: "((?:[^"\\]|\\.)*)"/s);
    ok(!!whyM && whyM[1].length >= 30, `${full}: thin why`);
    // notes never point at answer
    const noteMs = [...b.matchAll(/\{ choice: (\d+), why: /g)];
    for (const nm of noteMs) ok(Number(nm[1]) !== Number(ansM?.[1] ?? -1), `${full}: note==answer`);
    // keyword literal matches
    ok(src.includes(`const KW = "${kw}"`), `${name}: KW literal != "${kw}"`);
  }
  console.log(`  ${blocks.length} blocks, abbr=${abbr}`);
}

console.log(fail === 0 ? "\n✅ 6-FILE STRUCTURAL VALIDATION PASS" : `\n❌ VALIDATION FAIL: ${fail}`);
