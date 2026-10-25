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
// fraud-aml (round 11 facts)
spot("fraud-aml:q:q01", (o) => o.rows.length === 1 && o.rows[0][0] === 46, "settled = 46");
spot("fraud-aml:q:q13", (o) => o.rows.length === 1 && o.rows[0][0] === 5418000, "settled total 5418000");
spot("fraud-aml:q:q21", (o) => o.rows.length === 11 && o.rows[0][0] === 2 && o.rows[0][1] === 2015000, "U2 leads 2015000");
spot("fraud-aml:q:q24", (o) => o.rows.length === 12 && o.rows.some((r) => r[0] === 11 && r[1] === 0), "U11 honest zero");
spot("fraud-aml:q:q33", (o) => o.rows[0][0] === "wallet" && o.rows[0][2] === 4029500, "wallet volume 4029500");
spot("fraud-aml:q:q41", (o) => o.rows.length === 1 && o.rows[0][5] === 3600, "impossible pair on the 3600 line");
spot("fraud-aml:q:q44", (o) => o.rows.length === 10 && o.rows[7][2] === 8 && o.rows[9][2] === 8, "dense top-8 keeps the three-way tie");
spot("fraud-aml:q:q50", (o) => o.rows.length === 1 && o.rows[0][0] === 4880000 && o.rows[0][2] === 90.1, "risky share 4880000 / 90.1");
spot("fraud-aml:q:q56", (o) => o.rows.length === 1 && o.rows[0][0] === 8 && o.rows[0][1] === 1, "band 8 vs 1 at the EDD line");
spot("fraud-aml:q:q58", (o) => o.rows[0][0] === 2 && o.rows[0][2] === 2015000 && o.rows[0][3] === 90, "U2 RFM 2015000 / 90d");
spot("fraud-aml:q:q60", (o) => o.rows.length === 1 && o.rows[0][2] === 40000 && o.rows[0][3] === 4, "ring skim 40000 across 4 legs");
spot("fraud-aml:q:q22", (o) => o.rows.length === 1 && o.rows[0][0] === 9 && o.rows[0][1] === 1965900, "U9 leads received 1965900");
spot("fraud-aml:c:c21:1", (o) => o.rows.length === 11 && o.rows[2][1] === 581200 && o.rows[3][1] === 581200, "U5/U7 mirror tie");
spot("fraud-aml:c:c43:2", (o) => o.rows.length === 1 && o.rows[0][0] === 40000, "hand-off skim 40000");
spot("fraud-aml:c:c60:2", (o) => o.rows.length === 1 && o.rows[0][2] === 3, "enforcement memo 3 SARs");
// saas-subscriptions (round 12 facts)
spot("saas-subscriptions:q:q01", (o) => o.rows.length === 1 && o.rows[0][0] === 53, "paid = 53");
spot("saas-subscriptions:q:q10", (o) => o.rows.length === 1 && o.rows[0][0] === 1, "boundary 1 vs 0");
spot("saas-subscriptions:q:q21", (o) => o.rows.length === 11 && o.rows[0][0] === 10 && o.rows[0][1] === 100000, "whale rank 1");
spot("saas-subscriptions:q:q24", (o) => o.rows.length === 12 && o.rows.some((r) => r[0] === 3 && r[2] === 0), "A3 seatless honest zero");
spot("saas-subscriptions:q:q26", (o) => o.rows[5][0] === "2026-06" && o.rows[5][2] === 100000, "June delta = whale");
spot("saas-subscriptions:q:q28", (o) => o.rows.length === 3 && o.rows[2][3] === 17400, "3 drift rows, blend last");
spot("saas-subscriptions:q:q30", (o) => o.rows.length === 14 && o.rows[1][1] === 4900, "01-07 lone 4900 day");
spot("saas-subscriptions:q:q32", (o) => o.rows[0][1] === 6, "seat 1 = 6 sessions");
spot("saas-subscriptions:q:q41", (o) => o.rows.length === 6 && o.rows[0][2] === 60, "6 velocity pairs, min 60s");
spot("saas-subscriptions:q:q45", (o) => o.rows.length === 1 && o.rows[0][0] === 54500 && o.rows[0][1] === 4900, "naive 54500 vs true 4900");
spot("saas-subscriptions:q:q47", (o) => o.rows.length === 4 && o.rows[2][2] === "2,6,8,9", "tie registry 9900 tier");
spot("saas-subscriptions:q:q50", (o) => o.rows.length === 1 && o.rows[0][0] === 11 && o.rows[0][3] === 1, "A11 dossier 1 failed 1 open-high");
spot("saas-subscriptions:q:q53", (o) => o.rows.length === 6 && o.rows[3][1] === 0 && o.rows[4][1] === 0, "Apr+May zero months");
spot("saas-subscriptions:q:q58", (o) => o.rows.length === 1 && o.rows[0][2] === 17400, "proration blend 17400");
spot("saas-subscriptions:c:c45:1", (o) => o.rows.length === 1 && o.rows[0][1] === 4900, "churn correction true 4900");
spot("saas-subscriptions:c:c60:2", (o) => o.rows.length === 1 && o.rows[0][2] === 100000, "whale IS June's delta");
// healthcare-claims (round 13 facts)
spot("healthcare-claims:q:q01", (o) => o.rows.length === 1 && o.rows[0][0] === 37, "paid = 37");
spot("healthcare-claims:q:q21", (o) => o.rows.length === 12 && o.rows[0][0] === 10 && o.rows[0][2] === 528800, "whale leads 528800");
spot("healthcare-claims:q:q24", (o) => o.rows.length === 8 && o.rows[0][3] === "no_show", "8 claimless visits");
spot("healthcare-claims:q:q29", (o) => o.rows.length === 4 && o.rows[1][1] === 60, "aging: c28 sits ON 60");
spot("healthcare-claims:q:q41", (o) => o.rows.length === 3 && o.rows[1][3] === 30, "readmit gaps 6/30/31");
spot("healthcare-claims:q:q43", (o) => o.rows.length === 3 && o.rows[2][1] === 90 && o.rows[2][2] === "paid", "boundary survivor on 90");
spot("healthcare-claims:q:q45", (o) => o.rows.length === 1 && o.rows[0][0] === 7 && o.rows[0][1] === 6, "velocity 7 inclusive vs 6 strict");
spot("healthcare-claims:q:q46", (o) => o.rows.length === 12 && o.rows.reduce((a: number, r: unknown[]) => a + (r[1] as number), 0) === 28, "28 sessions across 12 patients");
spot("healthcare-claims:q:q47", (o) => o.rows[0][0] === "NA" && o.rows[0][2] === 360850 && o.rows[1][0] === "APAC", "whale flip NA->2nd");
spot("healthcare-claims:q:q50", (o) => o.rows[0][0] === "CO-197" && o.rows[0][1] === 540000 && o.rows[0][2] === 65.5, "CO-197 = 65.5% of denials");
spot("healthcare-claims:q:q52", (o) => o.rows.length === 1 && o.rows[0][0] === 40000 && o.rows[0][1] === "1,4", "tie registry 40000 -> '1,4'");
spot("healthcare-claims:q:q58", (o) => o.rows.length === 3 && o.rows[2][2] === 1800, "bill_pay gaps incl 1800 boundary");
spot("healthcare-claims:q:q60", (o) => o.rows.length === 9 && o.rows[5][1] === 0, "March 2026 = honest zero");
spot("healthcare-claims:c:c45:2", (o) => o.rows.length === 1 && o.rows[0][0] === 28, "total sessions 28");
spot("healthcare-claims:c:c43:2", (o) => o.rows.length === 1 && o.rows[0][0] === 25 && o.rows[0][3] === 12400, "survivor c25 paid 12400");
spot("healthcare-claims:c:c46:1", (o) => o.rows.length === 4 && o.rows[0][2] === 360850, "whale flip case NA ex 360850");

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
