// Probe: run every dm-icl query against the pack seed, print compact results.
import Database from "bun:sqlite";
import { DM_ICL_SCHEMA } from "../src/lib/leetcode/content/dm-icl-schema";
import { DM_ICL_SEED } from "../src/lib/leetcode/content/dm-icl-seed";
import { DM_ICL_QUERIES } from "../src/lib/leetcode/content/dm-icl-queries";

const db = new Database(":memory:");
db.exec(DM_ICL_SCHEMA.ddl);
db.exec(DM_ICL_SEED);

const fmt = (rows: Record<string, unknown>[]) => {
  if (rows.length === 0) return "NO ROWS";
  if (rows.length === 1)
    return Object.values(rows[0]).map((v) => (v === null ? "NULL" : String(v))).join(" · ");
  const first = Object.values(rows[0]).map((v) => (v === null ? "NULL" : String(v))).join(" · ");
  return `${rows.length}r — ${first}`;
};

let fails = 0;
for (const q of DM_ICL_QUERIES) {
  try {
    const rows = db.prepare(q.code).all() as Record<string, unknown>[];
    console.log(`${q.id}  ${fmt(rows)}`);
  } catch (e) {
    fails++;
    console.log(`${q.id}  FAIL: ${e instanceof Error ? e.message : e}`);
  }
}
console.log(fails ? `\n${fails} FAILURES` : "\nALL 60 RUN CLEAN");
