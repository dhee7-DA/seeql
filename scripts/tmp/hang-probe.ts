/// <reference types="bun-types" />
/** Minimal per-case audit repro for the cs-1081 hang. */
import { Database } from "bun:sqlite";
import { casesQ4 } from "/home/z/my-project/src/lib/curriculum/cases/cases-q4";

const COPY = "scripts/tmp/hang.db";
import { copyFileSync } from "node:fs";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const c = casesQ4.find((x) => x.id === "cs-1081")!;
console.log("case:", c.id, "slots:", c.slots.length, "distractors:", c.distractors.length);

function fill(template: string, values: Record<number, string>): string {
  return template.replace(/\{(\d+)\}/g, (_, n) => values[Number(n)] ?? `{${n}}`);
}
function runSql(sql: string) {
  const t0 = Date.now();
  try {
    const res = db.query(sql).all();
    console.log(`  ok ${Date.now() - t0}ms rows=${res.length}`);
    return { ok: true as const, rows: res as unknown[][] };
  } catch (e) {
    console.log(`  err ${Date.now() - t0}ms: ${e instanceof Error ? e.message : String(e)}`);
    return { ok: false as const, error: String(e) };
  }
}

const values: Record<number, string> = {};
c.slots.forEach((s, i) => (values[i + 1] = s.answer));
console.log("correct fill:");
runSql(fill(c.template, values));

for (const d of c.distractors) {
  for (let i = 0; i < c.slots.length; i++) {
    if (d === c.slots[i].answer) { console.log(`skip ${d}@${i + 1}`); continue; }
    const v = { ...values, [i + 1]: d };
    console.log(`distractor "${d}" @ slot ${i + 1}:`);
    runSql(fill(c.template, v));
  }
}
console.log("DONE");
db.close();
