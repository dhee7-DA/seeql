// Round 13 — quick smoke: run every HC query solution, print shape.
import Database from "bun:sqlite";
import { DM_HC_SCHEMA } from "../src/lib/leetcode/content/dm-hc-schema";
import { DM_HC_SEED } from "../src/lib/leetcode/content/dm-hc-seed";
import { DM_HC_QUERIES } from "../src/lib/leetcode/content/dm-hc-queries";

const db = new Database(":memory:");
db.exec(DM_HC_SCHEMA.ddl);
db.exec(DM_HC_SEED);
let bad = 0;
for (const q of DM_HC_QUERIES) {
  try {
    const rows = db.prepare(q.code).all() as Record<string, unknown>[];
    if (rows.length > 60) { console.log(`ROWS>60 ${q.id}: ${rows.length}`); bad++; continue; }
    const cols = rows.length ? Object.keys(rows[0]) : [];
    console.log(`ok ${q.id} ${rows.length}r [${cols.join(",")}] first=${JSON.stringify(Object.values(rows[0] ?? {}))}`);
  } catch (e) {
    console.log(`ERR ${q.id}: ${e instanceof Error ? e.message : e}`);
    bad++;
  }
}
db.close();
console.log(bad === 0 ? "\nALL QUERIES RUN CLEAN" : `\n${bad} PROBLEM(S)`);
