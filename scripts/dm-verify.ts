// Round 10 — engine-verify EVERY domain pack and GENERATE the expected-output
// snapshot (content/dm-expected.ts). Generalizes the round-9 verifier: any
// pack registered in DM_PACKS gets verified here, and dm-expected.ts holds
// ALL packs' keys.
//
// Queries + case steps: run each solution against the pack's shared seed in a
// fresh :memory: db, capture columns/rows, assert the <= 60-row contract.
// Output MCQs: run the truth query + 3 mutants, assert 4-way DISTINCT
// outputs, format the 4 option strings, pin the answer index.
// Concept MCQs: options are hand-authored; only the 4-option shape is checked.
//
// Re-run any time content changes — dm-expected.ts is build output.
import Database from "bun:sqlite";
import { writeFileSync } from "node:fs";
import { DM_PACKS, type DmPack } from "../src/lib/leetcode/domain-packs";

const MAX_ROWS = 60;

type Out = { columns: string[]; rows: unknown[][] };

function run(db: Database, sql: string): Out {
  const list = db.prepare(sql).all() as Record<string, unknown>[];
  const columns = list.length > 0 ? Object.keys(list[0]) : [];
  const rows = list.slice(0, MAX_ROWS).map((r) => columns.map((c) => r[c]));
  if (list.length > MAX_ROWS) throw new Error(`${list.length} rows exceeds the ${MAX_ROWS}-row contract`);
  return { columns, rows };
}

const expected: Record<string, Out | { options: string[]; answer: number }> = {};
let fails = 0;
const fail = (msg: string) => {
  fails++;
  console.log("FAIL  " + msg);
};

const fmt = (out: Out): string => {
  if (out.rows.length === 0) return "no rows";
  if (out.rows.length === 1) {
    const r = out.rows[0];
    return r.map((v) => (v === null ? "NULL" : String(v))).join(" · ");
  }
  const first = out.rows[0].map((v) => (v === null ? "NULL" : String(v))).join(" · ");
  return `${out.rows.length} rows — first: ${first}`;
};

for (const pack of DM_PACKS) {
  verifyPack(pack);
}

function verifyPack(pack: DmPack) {
  console.log(`\n########## pack: ${pack.id} (${pack.queries.length}q / ${pack.mcqs.length}m / ${pack.cases.length}c) ##########`);
  const db = new Database(":memory:");
  db.exec(pack.schema.ddl);
  db.exec(pack.schema.seed);

  // ---- queries ----
  console.log(`== ${pack.queries.length} query problems ==`);
  for (const q of pack.queries) {
    try {
      const out = run(db, q.code);
      expected[`${pack.id}:q:${q.id}`] = out;
      console.log(`ok    ${q.id} ${q.title} — ${out.rows.length} rows`);
    } catch (e) {
      fail(`${q.id} ${q.title}: ${e instanceof Error ? e.message : e}`);
    }
  }

  // ---- MCQs ----
  console.log(`== ${pack.mcqs.length} MCQs ==`);
  for (const m of pack.mcqs) {
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
      expected[`${pack.id}:m:${m.id}:opts`] = { options: strings, answer: 0 };
      console.log(`ok    ${m.id} ${m.prompt.slice(0, 60)}…`);
      for (const s of strings) console.log(`        opt: ${s}`);
    } catch (e) {
      fail(`${m.id}: ${e instanceof Error ? e.message : e}`);
    }
  }

  // ---- case steps ----
  console.log(`== ${pack.cases.length} case studies ==`);
  for (const c of pack.cases) {
    c.steps.forEach((step, i) => {
      try {
        const out = run(db, step.code);
        expected[`${pack.id}:c:${c.id}:${i + 1}`] = out;
        console.log(`ok    ${c.id}.${i + 1} ${c.title} — ${out.rows.length} rows`);
      } catch (e) {
        fail(`${c.id}.${i + 1} ${c.title}: ${e instanceof Error ? e.message : e}`);
      }
    });
  }

  db.close();
}

// ---- spot checks against probe-verified facts ----
console.log("\n== spot checks ==");
const spot = (key: string, pred: (o: Out) => boolean, label: string) => {
  const o = expected[key];
  if (!o || !("rows" in o)) return fail(`spot ${key}: missing`);
  if (!pred(o)) return fail(`spot ${key}: ${label}`);
  console.log(`ok    spot ${key}: ${label}`);
};
// retail (round 9 facts)
spot("retail-rfm:q:q01", (o) => o.rows.length === 1 && o.rows[0][0] === 47, "delivered = 47");
spot("retail-rfm:q:q07", (o) => o.rows[0][0] === 11, "11 discounted lines");
spot("retail-rfm:q:q24", (o) => o.rows.length === 12 && o.rows.some((r) => r[0] === 11 && r[1] === 0), "C11 honest zero");
spot("retail-rfm:q:q53", (o) => o.rows[0][0] === "2026-06" && o.rows[0][1] === 214600, "June peak 214600");
// finance (round 10 facts)
spot("finance-core:q:q01", (o) => o.rows.length === 1 && o.rows[0][0] === 47, "posted = 47");
spot("finance-core:q:q13", (o) => o.rows.length === 1 && o.rows[0][0] === 2354100, "posted debit total 2354100");
spot("finance-core:q:q21", (o) => o.rows.length === 11 && o.rows[0][0] === 2 && o.rows[0][1] === 1250000, "A2 leads 1250000");
spot("finance-core:q:q24", (o) => o.rows.length === 12 && o.rows.some((r) => r[0] === 11 && r[2] === 0), "A11 honest zero");
spot("finance-core:q:q27", (o) => o.rows[0][0] === "Electronics" && o.rows[0][1] === 8314.2, "Electronics fee 8314.2");
spot("finance-core:q:q33", (o) => o.rows.length === 3, "3 bps drift rows");
spot("finance-core:q:q41", (o) => o.rows.length === 1 && o.rows[0][0] === 8 && o.rows[0][3] === 2983000, "A8 structuring 2983000");
spot("finance-core:q:q46", (o) => o.rows.length === 7 && o.rows[5][2] === 6 && o.rows[6][2] === 6, "dense rank-6 tie keeps two days");
spot("finance-core:q:q56", (o) => o.rows.length === 1 && o.rows[0][0] === 1 && o.rows[0][1] === 0, "boundary 1 vs 0");
spot("finance-core:q:q58", (o) => o.rows[0][0] === "NYC" && o.rows[0][1] === 453275, "NYC avg 453275");
spot("finance-core:c:c22:1", (o) => o.rows.length === 1 && o.rows[0][0] === 101200 && o.rows[0][1] === 1659.4, "A5 mirror 101200 / 1659.4");
spot("finance-core:c:c22:2", (o) => o.rows.length === 1 && o.rows[0][0] === 101200 && o.rows[0][1] === 1659.4, "A7 mirror identical");
spot("finance-core:c:c60:2", (o) => o.rows.length === 1 && o.rows[0][6] === 2963500, "dossier net 2963500");

if (fails > 0) {
  console.log(`\n${fails} FAILURE(S) — dm-expected.ts NOT written`);
  process.exit(1);
}

// ---- write dm-expected.ts ----
const banner = `// GENERATED by scripts/dm-verify.ts — engine-verified expected outputs for
// ALL domain packs. Never hand-edit; re-run the verifier.
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
