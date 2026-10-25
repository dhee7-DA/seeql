// Round 13 — smoke: run every HC case step, print shape.
import Database from "bun:sqlite";
import { DM_HC_SCHEMA } from "../src/lib/leetcode/content/dm-hc-schema";
import { DM_HC_SEED } from "../src/lib/leetcode/content/dm-hc-seed";
import { DM_HC_CASES } from "../src/lib/leetcode/content/dm-hc-cases";

const db = new Database(":memory:");
db.exec(DM_HC_SCHEMA.ddl);
db.exec(DM_HC_SEED);
let bad = 0;
for (const c of DM_HC_CASES) {
  c.steps.forEach((s, i) => {
    try {
      const rows = db.prepare(s.code).all() as Record<string, unknown>[];
      if (rows.length > 60) { console.log(`ROWS>60 ${c.id}.${i + 1}: ${rows.length}`); bad++; return; }
      console.log(`ok ${c.id}.${i + 1} ${rows.length}r first=${JSON.stringify(Object.values(rows[0] ?? {})).slice(0, 90)}`);
    } catch (e) {
      console.log(`ERR ${c.id}.${i + 1}: ${e instanceof Error ? e.message : e}`);
      bad++;
    }
  });
}
db.close();
console.log(bad === 0 ? "\nALL CASE STEPS RUN CLEAN" : `\n${bad} PROBLEM(S)`);
