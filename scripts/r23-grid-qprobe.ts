// lc-round23-redo — probe: run every dm-grid query against the pack seed,
// print compact results. Mirrors r21-icl-qprobe.ts.
import Database from "bun:sqlite";
import { DM_GRID_SCHEMA } from "../src/lib/leetcode/content/dm-grid-schema";
import { DM_GRID_SEED } from "../src/lib/leetcode/content/dm-grid-seed";
import { DM_GRID_QUERIES } from "../src/lib/leetcode/content/dm-grid-queries";
import { DM_GRID_CASES } from "../src/lib/leetcode/content/dm-grid-cases";

const db = new Database(":memory:");
db.exec(DM_GRID_SCHEMA.ddl);
db.exec(DM_GRID_SEED);

const fmt = (rows: Record<string, unknown>[]) => {
  if (rows.length === 0) return "NO ROWS";
  if (rows.length === 1)
    return Object.values(rows[0]).map((v) => (v === null ? "NULL" : String(v))).join(" · ");
  const first = Object.values(rows[0]).map((v) => (v === null ? "NULL" : String(v))).join(" · ");
  return `${rows.length}r — ${first}`;
};

let fails = 0;
for (const q of DM_GRID_QUERIES) {
  try {
    const rows = db.prepare(q.code).all() as Record<string, unknown>[];
    if (rows.length > 60) { console.log(`${q.id}  ROWS>60: ${rows.length}`); fails++; continue; }
    console.log(`${q.id}  ${fmt(rows)}`);
  } catch (e) {
    fails++;
    console.log(`${q.id}  FAIL: ${e instanceof Error ? e.message : e}`);
  }
}
console.log(`\n== case steps ==`);
for (const c of DM_GRID_CASES) {
  c.steps.forEach((step, i) => {
    try {
      const rows = db.prepare(step.code).all() as Record<string, unknown>[];
      if (rows.length > 60) { console.log(`${c.id}.${i + 1}  ROWS>60: ${rows.length}`); fails++; return; }
      console.log(`${c.id}.${i + 1}  ${fmt(rows)}`);
    } catch (e) {
      fails++;
      console.log(`${c.id}.${i + 1}  FAIL: ${e instanceof Error ? e.message : e}`);
    }
  });
}
console.log(fails ? `\n${fails} FAILURES` : `\nALL ${DM_GRID_QUERIES.length} QUERIES + ${DM_GRID_CASES.length * 2} CASE STEPS RUN CLEAN`);
