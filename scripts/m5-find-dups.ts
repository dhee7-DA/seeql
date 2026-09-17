const files = ["text-toolkit","type-cast","date-buckets","date-edges","window-rank","window-offsets","window-frames","window-edges","window-judgment","toolkit-capstone"];
const seen = new Map<string, string>();
const bank = new Set<string>();
const idx = await import("../src/lib/curriculum/drills/index");
for (const s of (idx as any).DRILL_SETS as any[]) for (const q of s.questions) bank.add(q.prompt.trim());
for (const f of files) {
  const m = await import(`../src/lib/curriculum/drills/m5/${f}`);
  const arr = Object.values(m).find(v => Array.isArray(v)) as any[];
  for (const q of arr) {
    const p = q.prompt.trim();
    if (bank.has(p)) console.log(`BANK-DUP ${q.id} (${f}): ${p.slice(0, 90)}`);
    if (seen.has(p)) console.log(`XFILE-DUP ${q.id} (${f}) == ${seen.get(p)}: ${p.slice(0, 90)}`);
    seen.set(p, `${q.id} (${f})`);
  }
}
console.log("total m5 prompts:", seen.size);
