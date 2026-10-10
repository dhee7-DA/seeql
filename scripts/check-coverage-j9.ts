// Full-deck coverage: id completeness, duplicates, deck counts, topic spread.
import { CASES } from "../src/lib/curriculum/cases";
const ids = CASES.map((c) => c.id);
const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
console.log("total:", ids.length, "| dup ids:", dup.length ? dup : "none");
const deck1 = CASES.filter((c) => (c.deck ?? 1) === 1);
const deck2 = CASES.filter((c) => (c.deck ?? 1) === 2);
console.log("deck1:", deck1.length, "| deck2:", deck2.length);
const d2ids = deck2.map((c) => c.id).sort();
console.log("deck2 range:", d2ids[0], "->", d2ids[d2ids.length - 1]);
// j5 topic census
const j5 = deck2.filter((c) => c.topic === "j5");
console.log("j5 cases:", j5.length, "(", j5.map((c) => c.id).join(" "), ")");
// per-deck2-topic counts
const byTopic: Record<string, number> = {};
for (const c of deck2) byTopic[c.topic] = (byTopic[c.topic] ?? 0) + 1;
console.log("deck2 topics:", JSON.stringify(byTopic));
// filled-SQL + title dedupe across ALL 325
const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const fill = (t: string, v: Record<number, string>) => t.replace(/\{(\d+)\}/g, (_, n) => v[Number(n)] ?? `{${n}}`);
const seen = new Map<string, string>();
let sqlDups = 0;
for (const c of CASES) {
  const sql = norm(fill(c.template, Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer]))));
  const prev = seen.get(sql);
  if (prev) { console.log("SQL DUP:", prev, "==", c.id); sqlDups++; }
  seen.set(sql, c.id);
}
const titles = new Set<string>(); let titleDups = 0;
for (const c of CASES) { if (titles.has(c.title)) { console.log("TITLE DUP:", c.id, c.title); titleDups++; } titles.add(c.title); }
console.log("sqlDups:", sqlDups, "| titleDups:", titleDups);
