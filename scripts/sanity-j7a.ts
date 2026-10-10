// j7-a sanity — filled-query distinctness vs ALL prior M2 cases + shape checks.
import type { CaseStudy } from "../src/lib/curriculum/cases/types";
import { casesExemplarsM2 } from "../src/lib/curriculum/cases/m2/exemplars-m2";
import { casesJ1a } from "../src/lib/curriculum/cases/m2/cases-j1a";
import { casesJ1b } from "../src/lib/curriculum/cases/m2/cases-j1b";
import { casesJ1c } from "../src/lib/curriculum/cases/m2/cases-j1c";
import { casesJ2a } from "../src/lib/curriculum/cases/m2/cases-j2a";
import { casesJ2b } from "../src/lib/curriculum/cases/m2/cases-j2b";
import { casesJ2c } from "../src/lib/curriculum/cases/m2/cases-j2c";
import { casesJ3a } from "../src/lib/curriculum/cases/m2/cases-j3a";

function fill(t: string, s: CaseStudy["slots"]): string {
  return t.replace(/\{(\d+)\}/g, (_, n) => s[Number(n) - 1]?.answer ?? `{${n}}`).replace(/\s+/g, " ").trim();
}

const prior = [...casesExemplarsM2, ...casesJ1a, ...casesJ1b, ...casesJ1c, ...casesJ2a, ...casesJ2b, ...casesJ2c];
const priorFills = new Map<string, string>();
for (const c of prior) priorFills.set(fill(c.template, c.slots), c.id);

console.log(`prior M2 cases loaded: ${prior.length}`);
let ok = true;
const ids = casesJ3a.map((c) => c.id);
console.log(`j3a ids: ${ids.join(",")}`);
if (ids.join(",") !== "cs-251,cs-252,cs-253,cs-254,cs-255,cs-256,cs-257,cs-258") { console.log("ID SEQUENCE MISMATCH"); ok = false; }

const myFills = new Map<string, string>();
for (const c of casesJ3a) {
  const f = fill(c.template, c.slots);
  if (myFills.has(f)) { console.log(`DUP WITHIN FILE: ${c.id}`); ok = false; }
  myFills.set(f, c.id);
  if (priorFills.has(f)) { console.log(`DUP vs PRIOR ${priorFills.get(f)}: ${c.id}`); ok = false; }
  if (c.deck !== 2 || c.topic !== "j3") { console.log(`BAD deck/topic: ${c.id}`); ok = false; }
  if (!/LEFT JOIN/i.test(f)) { console.log(`NO LEFT JOIN: ${c.id}`); ok = false; }
  if (!/IS NULL/i.test(f)) { console.log(`NO IS NULL GHOST: ${c.id}`); ok = false; }
  if (!/\bNOT EXISTS\b/i.test(f) === false) { console.log(`uses NOT EXISTS: ${c.id}`); ok = false; }
  const joins = (f.match(/\bJOIN\b/gi) ?? []).length;
  if (joins < 1 || joins > 3) { console.log(`JOIN count ${joins}: ${c.id}`); ok = false; }
  const selects = (f.match(/\bSELECT\b/gi) ?? []).length;
  if (selects > 2) { console.log(`${selects} SELECTs: ${c.id}`); ok = false; }
  const slots = c.slots.length;
  if (slots < 3 || slots > 4) { console.log(`${slots} slots: ${c.id}`); ok = false; }
  const d = c.distractors.length;
  if (d < 5 || d > 6) { console.log(`${d} distractors: ${c.id}`); ok = false; }
  console.log(`${c.id} [${c.universe}] joins=${joins} selects=${selects} slots=${slots} distractors=${d} :: ${f.slice(0, 110)}...`);
}
const universes = new Set(casesJ3a.map((c) => c.universe));
console.log(`distinct universes in file: ${universes.size} -> ${[...universes].join(", ")}`);
if (universes.size !== 8) { console.log("UNIVERSES NOT DISTINCT"); ok = false; }
console.log(ok ? "\nSANITY: ALL OK" : "\nSANITY: PROBLEMS FOUND");
