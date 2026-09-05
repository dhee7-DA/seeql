/// <reference types="bun-types" />
/**
 * Case-deck coverage check — verifies the assembled CASES registry is a
 * complete, non-redundant cs-001..cs-200 deck:
 *   1. id coverage: exactly cs-001..cs-200, no gaps, no duplicates
 *   2. no two cases share the same filled SQL (whitespace-normalized)
 *   3. no two cases share the same title
 *   4. per-topic and per-universe distribution report
 */
import { CASES } from "../src/lib/curriculum/cases/index";

function fill(template: string, values: Record<number, string>): string {
  return template.replace(/\{(\d+)\}/g, (_, n) => values[Number(n)] ?? `{${n}}`);
}

let problems = 0;

// 1. id coverage
const ids = CASES.map((c) => c.id).sort();
const expected = Array.from({ length: 200 }, (_, i) => `cs-${String(i + 1).padStart(3, "0")}`);
const missing = expected.filter((e) => !ids.includes(e));
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
if (missing.length) { console.log(`MISSING IDS (${missing.length}):`, missing.join(", ")); problems++; }
if (dupIds.length) { console.log("DUPLICATE IDS:", [...new Set(dupIds)].join(", ")); problems++; }
if (!missing.length && !dupIds.length) console.log(`id coverage: cs-001..cs-200 complete (${CASES.length} cases)`);

// 2. duplicate filled SQL
const bySql = new Map<string, string[]>();
for (const c of CASES) {
  const sql = fill(c.template, Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer])))
    .replace(/\s+/g, " ").trim();
  bySql.set(sql, [...(bySql.get(sql) ?? []), c.id]);
}
const sqlDupes = [...bySql.entries()].filter(([, v]) => v.length > 1);
if (sqlDupes.length) { console.log("DUPLICATE FILLED SQL:", sqlDupes.map(([k, v]) => `${v.join("+")}`)?.join(" | ")); problems++; }
else console.log("filled SQL: all 200 distinct");

// 3. duplicate titles
const byTitle = new Map<string, string[]>();
for (const c of CASES) byTitle.set(c.title.trim().toLowerCase(), [...(byTitle.get(c.title.trim().toLowerCase()) ?? []), c.id]);
const titleDupes = [...byTitle.entries()].filter(([, v]) => v.length > 1);
if (titleDupes.length) { console.log("DUPLICATE TITLES:", titleDupes.map(([k, v]) => `"${k}" -> ${v.join("+")}`).join(" | ")); problems++; }
else console.log("titles: all distinct");

// 4. distribution
const byTopic: Record<string, number> = {};
const byUniverse: Record<string, number> = {};
for (const c of CASES) {
  byTopic[c.topic] = (byTopic[c.topic] ?? 0) + 1;
  byUniverse[c.universe] = (byUniverse[c.universe] ?? 0) + 1;
}
console.log("\nper-topic:", JSON.stringify(byTopic));
console.log("per-universe:", JSON.stringify(byUniverse));

const slotCounts: Record<number, number> = {};
for (const c of CASES) slotCounts[c.slots.length] = (slotCounts[c.slots.length] ?? 0) + 1;
console.log("slot-count distribution:", JSON.stringify(slotCounts));

const noVerifyTotal = CASES.reduce((n, c) => n + c.slots.filter((s) => s.noVerify).length, 0);
console.log("noVerify slots total:", noVerifyTotal, `(${(noVerifyTotal / CASES.length).toFixed(2)} per case)`);

if (problems > 0) process.exit(1);
console.log("\nCOVERAGE OK");
