// Spot-check: re-run the embedded SQL of sampled predict questions and
// compare the engine result against the marked correct choice.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";
import { LEFT_JOIN } from "../src/lib/curriculum/drills/m2/left-join";
import { MULTI_JOIN } from "../src/lib/curriculum/drills/m2/multi-join";
import { JOIN_AGGREGATE } from "../src/lib/curriculum/drills/m2/join-aggregate";
import { ANTI_JOIN } from "../src/lib/curriculum/drills/m2/anti-join";
import { JOIN_SYNTAX } from "../src/lib/curriculum/drills/m2/join-syntax";
import { JOIN_EDGES } from "../src/lib/curriculum/drills/m2/join-edges";

const COPY = "scripts/.m2spot.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

const pool = [
  ...LEFT_JOIN.filter(q => q.aspect === "predict").slice(0, 4),
  ...MULTI_JOIN.filter(q => q.aspect === "predict").slice(0, 3),
  ...JOIN_AGGREGATE.filter(q => q.aspect === "predict").slice(0, 4),
  ...ANTI_JOIN.filter(q => q.aspect === "predict").slice(0, 3),
  ...JOIN_SYNTAX.filter(q => q.aspect === "predict").slice(0, 3),
  ...JOIN_EDGES.filter(q => q.aspect === "predict").slice(0, 3),
];

let ok = 0, review = 0;
for (const q of pool) {
  const sqls = [...q.prompt.matchAll(/`([^`]+)`/g)].map(m => m[1]).filter(s => /select/i.test(s));
  if (sqls.length === 0) continue;
  try {
    const res = db.query(sqls[0]).all() as Record<string, unknown>[];
    const first = res[0] ? Object.values(res[0])[0] : "(empty)";
    const claimed = q.choices[q.answer];
    const match = String(first) === claimed.trim() || claimed.includes(String(first));
    console.log(`${match ? "OK " : "?? "} ${q.id}  engine=${JSON.stringify(first)}  claimed=${JSON.stringify(claimed)}`);
    match ? ok++ : review++;
  } catch (e) {
    console.log(`ERR ${q.id}: ${(e as Error).message}`);
    review++;
  }
}
console.log(`\n${ok} verified, ${review} need review (of ${pool.length} sampled)`);
rmSync(COPY);
