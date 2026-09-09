// Structural stats over the existing 200 case files — input to the tier rubric.
// bun scripts/case-tier-stats.ts
import { CASES } from "../src/lib/curriculum/cases";

interface Row {
  id: string;
  topic: string;
  slots: number;
  nums: number;
  noVerify: number;
  distractors: number;
  hasWhere: boolean;
  hasGroup: boolean;
  hasHaving: boolean;
  hasOrder: boolean;
  hasLimit: boolean;
  hasDistinct: boolean;
  nullTrap: boolean; // IS NULL present OR '=' / 'NOT NULL' style decoys present
  strLit: number; // string literal slots
}

function filledSql(c: (typeof CASES)[number]): string {
  return c.template.replace(/\{(\d+)\}/g, (_m, d) => c.slots[Number(d) - 1]?.answer ?? "").toUpperCase();
}

const rows: Row[] = CASES.map((c) => {
  const t = filledSql(c);
  const numSlots = c.slots.filter((s) => s.kind === "number").length;
  const noVerify = c.slots.filter((s) => s.noVerify).length;
  const strLit = c.slots.filter((s) => /^['"]/.test(s.answer)).length;
  const nullTrap =
    /\bIS NULL\b/.test(t) ||
    c.distractors.some((d) => /^(=|NOT NULL|NULL|IS NOT)$/i.test(d.trim())) ||
    c.slots.some((s) => /^IS NOT$/.test(s.answer));
  return {
    id: c.id,
    topic: c.topic,
    slots: c.slots.length,
    nums: numSlots,
    noVerify,
    distractors: c.distractors.length,
    hasWhere: /\bWHERE\b/.test(t),
    hasGroup: /\bGROUP BY\b/.test(t),
    hasHaving: /\bHAVING\b/.test(t),
    hasOrder: /\bORDER BY\b/.test(t),
    hasLimit: /\bLIMIT\b/.test(t),
    hasDistinct: /\bDISTINCT\b/.test(t),
    nullTrap,
    strLit,
  };
});

function dist(key: keyof Row) {
  const m = new Map<string, number>();
  for (const r of rows) {
    const v = String(r[key]);
    m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => (Number(a[0]) || 0) - (Number(b[0]) || 0));
}

console.log("total:", rows.length);
console.log("slots:", dist("slots"));
console.log("numSlots:", dist("nums"));
console.log("noVerify:", dist("noVerify"));
console.log("distractors:", dist("distractors"));
console.log("strLit:", dist("strLit"));
console.log("WHERE:", rows.filter((r) => r.hasWhere).length);
console.log("GROUP BY:", rows.filter((r) => r.hasGroup).length);
console.log("HAVING:", rows.filter((r) => r.hasHaving).length);
console.log("ORDER BY:", rows.filter((r) => r.hasOrder).length);
console.log("LIMIT:", rows.filter((r) => r.hasLimit).length);
console.log("DISTINCT:", rows.filter((r) => r.hasDistinct).length);
console.log("nullTrap:", rows.filter((r) => r.nullTrap).length);

// topic × slot-count matrix
const topics = [...new Set(rows.map((r) => r.topic))].sort();
for (const tp of topics) {
  const rs = rows.filter((r) => r.topic === tp);
  const bySlots = [3, 4, 5, 6].map((n) => rs.filter((r) => r.slots === n).length);
  console.log(`topic ${tp}: n=${rs.length} slots3/4/5/6=${bySlots.join("/")}`);
}

// clause-stack complexity: how many "heavy" clauses co-occur
const heavy = rows.map((r) => [r.hasGroup, r.hasHaving, r.hasOrder, r.hasLimit, r.hasDistinct].filter(Boolean).length);
console.log("heavy-clause count dist:", dist("noVerify" as never) && [0, 1, 2, 3, 4, 5].map((n) => `${n}:${heavy.filter((h) => h === n).length}`).join(" "));

// dump per-case structural fingerprint for the classifier
for (const r of rows) {
  const flags = [
    r.hasWhere && "W",
    r.hasGroup && "G",
    r.hasHaving && "H",
    r.hasOrder && "O",
    r.hasLimit && "L",
    r.hasDistinct && "D",
    r.nullTrap && "N",
  ].filter(Boolean).join("");
  console.log(`${r.id} ${r.topic} s${r.slots} n${r.nums} nv${r.noVerify} dx${r.distractors} q${r.strLit} ${flags}`);
}
