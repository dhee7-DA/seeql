// Round 9 — engine-verify the Retail & RFM domain pack and GENERATE the
// expected-output snapshot (content/dm-expected.ts).
//
// Queries + case steps: run each solution against the shared seed in a fresh
// :memory: db, capture columns/rows, assert the <= 60-row contract.
// Output MCQs: run the truth query + 3 mutants, assert 4-way DISTINCT
// outputs, format the 4 option strings, pin the answer index.
// Concept MCQs: options are hand-authored; nothing to run.
//
// Re-run any time content changes — dm-expected.ts is build output.
import Database from "bun:sqlite";
import { writeFileSync } from "node:fs";
import { DM_RETAIL_SCHEMA } from "../src/lib/leetcode/content/dm-retail-schema";
import { DM_RETAIL_SEED } from "../src/lib/leetcode/content/dm-retail-seed";
import { DM_RETAIL_QUERIES } from "../src/lib/leetcode/content/dm-retail-queries";
import { DM_RETAIL_MCQS } from "../src/lib/leetcode/content/dm-retail-mcqs";
import { DM_RETAIL_CASES } from "../src/lib/leetcode/content/dm-retail-cases";

const MAX_ROWS = 60;

type Out = { columns: string[]; rows: unknown[][] };

function run(db: Database, sql: string): Out {
  const list = db.prepare(sql).all() as Record<string, unknown>[];
  const columns = list.length > 0 ? Object.keys(list[0]) : [];
  const rows = list.slice(0, MAX_ROWS).map((r) => columns.map((c) => r[c]));
  if (list.length > MAX_ROWS) throw new Error(`${list.length} rows exceeds the ${MAX_ROWS}-row contract`);
  return { columns, rows };
}

const db = new Database(":memory:");
db.exec(DM_RETAIL_SCHEMA.ddl);
db.exec(DM_RETAIL_SEED);

const expected: Record<string, Out | { options: string[]; answer: number }> = {};
let fails = 0;
const fail = (msg: string) => {
  fails++;
  console.log("FAIL  " + msg);
};

// ---- queries ----
console.log(`== ${DM_RETAIL_QUERIES.length} query problems ==`);
for (const q of DM_RETAIL_QUERIES) {
  try {
    const out = run(db, q.code);
    expected[`retail-rfm:q:${q.id}`] = out;
    console.log(`ok    ${q.id} ${q.title} — ${out.rows.length} rows`);
  } catch (e) {
    fail(`${q.id} ${q.title}: ${e instanceof Error ? e.message : e}`);
  }
}

// ---- output MCQs ----
console.log(`== ${DM_RETAIL_MCQS.length} MCQs ==`);
const fmt = (out: Out): string => {
  if (out.rows.length === 0) return "no rows";
  if (out.rows.length === 1) {
    const r = out.rows[0];
    return r.map((v) => (v === null ? "NULL" : String(v))).join(" · ");
  }
  const first = out.rows[0].map((v) => (v === null ? "NULL" : String(v))).join(" · ");
  return `${out.rows.length} rows — first: ${first}`;
};
for (const m of DM_RETAIL_MCQS) {
  if (m.kind !== "output") {
    if (m.options.length !== 4) fail(`${m.id}: concept MCQ needs exactly 4 options`);
    continue;
  }
  try {
    if (!m.truthQuery || !m.mutantQueries || m.mutantQueries.length !== 3)
      throw new Error("output MCQ needs truthQuery + 3 mutants");
    const outs = [m.truthQuery, ...m.mutantQueries].map((sql) => run(db, sql));
    const strings = outs.map(fmt);
    if (new Set(strings).size !== 4) {
      throw new Error(`outputs not 4-way distinct: ${JSON.stringify(strings)}`);
    }
    expected[`retail-rfm:m:${m.id}:opts`] = { options: strings, answer: 0 };
    console.log(`ok    ${m.id} ${m.prompt.slice(0, 60)}…`);
    for (const s of strings) console.log(`        opt: ${s}`);
  } catch (e) {
    fail(`${m.id}: ${e instanceof Error ? e.message : e}`);
  }
}

// ---- case steps ----
console.log(`== ${DM_RETAIL_CASES.length} case studies ==`);
for (const c of DM_RETAIL_CASES) {
  c.steps.forEach((step, i) => {
    try {
      const out = run(db, step.code);
      expected[`retail-rfm:c:${c.id}:${i + 1}`] = out;
      console.log(`ok    ${c.id}.${i + 1} ${c.title} — ${out.rows.length} rows`);
    } catch (e) {
      fail(`${c.id}.${i + 1} ${c.title}: ${e instanceof Error ? e.message : e}`);
    }
  });
}

db.close();

// ---- spot checks against probe-verified facts ----
console.log("== spot checks ==");
const spot = (key: string, pred: (o: Out) => boolean, label: string) => {
  const o = expected[key];
  if (!o || !("rows" in o)) return fail(`spot ${key}: missing`);
  if (!pred(o)) return fail(`spot ${key}: ${label}`);
  console.log(`ok    spot ${key}: ${label}`);
};
spot("retail-rfm:q:q01", (o) => o.rows.length === 1 && o.rows[0][0] === 47, "delivered = 47");
spot("retail-rfm:q:q04", (o) => o.rows.length === 4, "4 statuses");
spot("retail-rfm:q:q07", (o) => o.rows[0][0] === 11, "11 discounted lines");
spot("retail-rfm:q:q12", (o) => o.rows.length === 3 && o.rows[0][1] === 42, "views 42 lead");
spot("retail-rfm:q:q20", (o) => o.rows[0][0] === 24, "07-20 has 24 events");
spot("retail-rfm:q:q24", (o) => o.rows.length === 12 && o.rows.some((r) => r[0] === 11 && r[1] === 0), "C11 honest zero");
spot("retail-rfm:q:q34", (o) => o.rows.length === 1 && o.rows[0][0] === 12, "USB-C Hub shelf sitter");
spot("retail-rfm:q:q53", (o) => o.rows[0][0] === "2026-06" && o.rows[0][1] === 214600, "June peak 214600");
spot("retail-rfm:q:q59", (o) => o.rows[0][0] === "Audio" && o.rows[0][1] === 127100, "Audio margin 127100");

if (fails > 0) {
  console.log(`\n${fails} FAILURE(S) — dm-expected.ts NOT written`);
  process.exit(1);
}

// ---- write dm-expected.ts ----
const banner = `// GENERATED by scripts/r9-dm-verify.ts — engine-verified expected outputs
// for the Retail & RFM domain pack. Never hand-edit; re-run the verifier.
// Keys: "<pack>:q:<id>" queries · "<pack>:m:<id>:opts" output-MCQ options ·
// "<pack>:c:<id>:<step>" case-study steps.`;
const body = Object.entries(expected)
  .map(([k, v]) => {
    if ("options" in v) {
      return `  ${JSON.stringify(k)}: { options: ${JSON.stringify(v.options, null, 2).replace(/\n/g, "\n  ")}, answer: ${v.answer} },`;
    }
    return `  ${JSON.stringify(k)}: { columns: ${JSON.stringify(v.columns)}, rows: ${JSON.stringify(v.rows)} },`;
  })
  .join("\n");
const file = `${banner}\nexport const DM_EXPECTED: Record<string, { columns?: string[]; rows?: unknown[][]; options?: string[]; answer?: number }> = {\n${body}\n};\n`;
writeFileSync("/home/z/my-project/src/lib/leetcode/content/dm-expected.ts", file);
console.log(`\ndm-expected.ts written (${Object.keys(expected).length} keys) — ALL VERIFIED`);
