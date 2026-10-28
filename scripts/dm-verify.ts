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
// logistics-freight (round 14 facts)
spot("logistics-freight:q:q01", (o) => o.rows.length === 1 && o.rows[0][0] === 44, "delivered = 44");
spot("logistics-freight:q:q21", (o) => o.rows.length === 12 && o.rows[0][2] === 279000 && o.rows[11][2] === 0, "whale leads 279000, C11 honest zero");
spot("logistics-freight:q:q22", (o) => o.rows.length === 4 && o.rows[0][0] === "NA" && o.rows[0][1] === 388900, "NA leads 388900");
spot("logistics-freight:q:q27", (o) => o.rows.length === 5 && o.rows[0][1] === 259200 && o.rows[2][1] === 86400, "dwell top5: customs, Rotterdam, 86400 line");
spot("logistics-freight:q:q33", (o) => o.rows.length === 5 && o.rows[2][0] === 0 && o.rows[2][1] === 1, "delta 0 = one SLA-line survivor");
spot("logistics-freight:q:q41", (o) => o.rows.length === 11 && o.rows[7][2] === 8 && o.rows[8][2] === 8 && o.rows[9][2] === 10 && o.rows[9][3] === 9, "18000 tie rank 8, next rank 10/dense 9, 11 rows");
spot("logistics-freight:q:q42", (o) => o.rows.length === 4 && o.rows[0][0] === "EMEA" && o.rows[1][0] === "NA" && o.rows[1][1] === 109900, "whale flip NA->2nd");
spot("logistics-freight:q:q43", (o) => o.rows.length === 1 && o.rows[0][0] === 12 && o.rows[0][1] === 11 && o.rows[0][2] === 1, "velocity 12/11/1 wall");
spot("logistics-freight:q:q44", (o) => o.rows.length === 1 && o.rows[0][0] === 13 && o.rows[0][1] === 14, "D5 sessions 13 strict / 14 inclusive");
spot("logistics-freight:q:q45", (o) => o.rows.length === 8 && o.rows[0][0] === "2026-04-20" && o.rows[0][1] === 96000 && o.rows[5][1] === 33000 && o.rows[6][2] === 6, "top day 96000, 33000 pair shares rank 6");
spot("logistics-freight:q:q46", (o) => o.rows.length === 3 && o.rows[1][1] === 4, "aging buckets 1/4/1");
spot("logistics-freight:q:q47", (o) => o.rows[1][1] === 9 && o.rows[1][2] === 8, "express 9 inclusive vs 8 strict");
spot("logistics-freight:q:q48", (o) => o.rows.length === 4 && o.rows.reduce((a: number, r: unknown[]) => a + (r[1] as number), 0) === 26, "26 scanless deliveries, no June row");
spot("logistics-freight:q:q50", (o) => o.rows.length === 1 && o.rows[0][0] === 1 && o.rows[0][1] === 0, "insurance line >=1 >0");
spot("logistics-freight:q:q55", (o) => o.rows.length === 6 && o.rows[2][1] === 0 && o.rows[5][1] === 0, "LATAM March + June zeros");
spot("logistics-freight:q:q56", (o) => o.rows.length === 14 && o.rows[0][0] === 1 && o.rows[1][0] === 7 && o.rows[0][4] === 36000, "mirror pair leads at 36000");
spot("logistics-freight:q:q58", (o) => o.rows.length === 6 && o.rows[5][2] === 797400, "running curve ends 797400");
spot("logistics-freight:q:q60", (o) => o.rows.length === 1 && o.rows[0][0] === 279000 && o.rows[0][2] === 34.99 && o.rows[0][4] === 109900, "whale dossier 34.99% / flip 109900");
spot("logistics-freight:c:c42:1", (o) => o.rows.length === 1 && o.rows[0][2] === 34.99 && o.rows[0][4] === 109900, "case: whale dossier");
spot("logistics-freight:c:c53:2", (o) => o.rows.length === 1 && o.rows[0][0] === 1, "case: exactly one dark hub");
spot("logistics-freight:c:c54:1", (o) => o.rows.length === 6 && o.rows[2][1] === 0, "case: LATAM spine March zero");

// marketing-attribution (round 15 facts)
spot("marketing-attribution:q:q01", (o) => o.rows.length === 1 && o.rows[0][0] === 44, "confirmed = 44");
spot("marketing-attribution:q:q21", (o) => o.rows.length === 12 && o.rows.some((r) => r[0] === 11 && r[2] === 0), "C11 honest zero");
spot("marketing-attribution:q:q22", (o) => o.rows[0][0] === "search" && o.rows[0][1] === 461000, "search leads 461000");
spot("marketing-attribution:q:q23", (o) => o.rows[0][0] === "social" && o.rows[0][1] === 190500, "flip: social first ex-whale");
spot("marketing-attribution:q:q27", (o) => o.rows.length === 3 && o.rows[0][1] === 62 && o.rows[1][1] === 62, "device tie 62/62/1");
spot("marketing-attribution:q:q30", (o) => o.rows.length === 1 && o.rows[0][0] === 6 && o.rows[0][1] === 5, "budget wall 6 vs 5");
spot("marketing-attribution:q:q31", (o) => o.rows.length === 3 && o.rows[2][4] === "paid", "drift trio, last one PAID");
spot("marketing-attribution:q:q36", (o) => o.rows.length === 3 && o.rows[0][0] === 21 && o.rows[0][1] === 5 && o.rows[0][2] === 9, "mismatch trio 21/24/39");
spot("marketing-attribution:q:q37", (o) => o.rows.length === 1 && o.rows[0][1] === "5,6", "closer registry '5,6'");
spot("marketing-attribution:q:q38", (o) => o.rows.length === 14, "retention gap = 14");
spot("marketing-attribution:q:q39", (o) => o.rows.length === 4 && o.rows[0][3] === 120, "burst pairs, first 120s");
spot("marketing-attribution:q:q41", (o) => o.rows.length === 9 && o.rows[6][2] === 7 && o.rows[6][3] === 6, "C9 rank 7 vs dense 6");
spot("marketing-attribution:q:q42", (o) => o.rows.length === 1 && o.rows[0][2] === 39.69 && o.rows[0][3] === 165000, "whale dossier 39.69% / flip 165000");
spot("marketing-attribution:q:q43", (o) => o.rows.length === 1 && o.rows[0][0] === 42 && o.rows[0][1] === 41 && o.rows[0][2] === 44, "window wall 42/41/c44");
spot("marketing-attribution:q:q44", (o) => o.rows.length === 3 && o.rows[0][0] === "search" && o.rows[0][2] === 94200, "cookie vs linear: search first");
spot("marketing-attribution:q:q45", (o) => o.rows.length === 1 && o.rows[0][0] === 14 && o.rows[0][3] === 14 && o.rows[0][4] === 1, "sessionization 14/13/13/14/1");
spot("marketing-attribution:q:q47", (o) => o.rows.length === 1 && o.rows[0][0] === 42000 && o.rows[0][1] === "3,6", "tie registry 42000 -> '3,6'");
spot("marketing-attribution:q:q49", (o) => o.rows.length === 1 && o.rows[0][0] === 3 && o.rows[0][1] === 28, "closers 3 views / 28 clicks");
spot("marketing-attribution:q:q53", (o) => o.rows.length === 6 && o.rows[0][1] === 0 && o.rows[3][1] === 6000, "email spine zeros then 6000");
spot("marketing-attribution:q:q56", (o) => o.rows[0][0] === 4000 && o.rows[0][1] === 7, "biggest tie: 7-way 4000");
spot("marketing-attribution:q:q59", (o) => o.rows.length === 1 && o.rows[0][5] === 221000, "whale net 221000");
spot("marketing-attribution:c:c42:1", (o) => o.rows.length === 1 && o.rows[0][2] === 39.69 && o.rows[0][3] === 165000, "case: whale flip row");
spot("marketing-attribution:c:c60:2", (o) => o.rows.length === 1 && o.rows[0][0] === 296000 && o.rows[0][1] === 39.69, "case: executive whale row");
// insurance-claims-ops (round 21 facts)
spot("insurance-claims-ops:q:q01", (o) => o.rows.length === 1 && o.rows[0][0] === 77, "paid = 77");
spot("insurance-claims-ops:q:q11", (o) => o.rows.length === 1 && o.rows[0][0] === 12, "referrals inclusive = 12");
spot("insurance-claims-ops:q:q23", (o) => o.rows[0][1] === 45.29 && o.rows[0][2] === 61300000, "whale 45.29% / liability ex 61300000");
spot("insurance-claims-ops:q:q25", (o) => o.rows[0][1] === 100, "Ivy closed EXACTLY 100");
spot("insurance-claims-ops:q:q28", (o) => o.rows.length === 1 && o.rows[0][0] === 12 && o.rows[0][1] === 10, "FRS wall 12 vs 10");
spot("insurance-claims-ops:q:q29", (o) => o.rows.length === 4 && o.rows[2][1] === 0, "aging spine keeps empty 61-90");
spot("insurance-claims-ops:q:q30", (o) => o.rows.length === 3 && o.rows[0][2] === 30 && o.rows[2][2] === 91, "aging boundary rows 30/91");
spot("insurance-claims-ops:q:q32", (o) => o.rows.length === 1 && o.rows[0][0] === 2 && o.rows[0][1] === 1, "reopen ceiling 2 vs 1");
spot("insurance-claims-ops:q:q33", (o) => o.rows.length === 1 && o.rows[0][0] === 44 && o.rows[0][1] === 9800000, "the leak: 44 / 9800000");
spot("insurance-claims-ops:q:q34", (o) => o.rows.length === 1 && o.rows[0][0] === 0, "savings hard 0");
spot("insurance-claims-ops:q:q35", (o) => o.rows.length === 1 && o.rows[0][0] === 7 && o.rows[0][1] === 4 && o.rows[0][2] === 6, "ring clocks 7/4/6");
spot("insurance-claims-ops:q:q37", (o) => o.rows[0][0] === "RC-4471,RC-4472,RC-4473,RC-4474,RC-4475,RC-4476,RC-4477", "ring registry contiguous");
spot("insurance-claims-ops:q:q38", (o) => o.rows.length === 1 && o.rows[0][0] === 2, "velocity pairs inclusive 2");
spot("insurance-claims-ops:q:q39", (o) => o.rows.length === 1 && o.rows[0][0] === 1, "velocity strict 1");
spot("insurance-claims-ops:q:q40", (o) => o.rows.length === 2 && o.rows[0][2] === 180 && o.rows[1][2] === 300, "gaps 180 then EXACTLY 300");
spot("insurance-claims-ops:q:q51", (o) => o.rows.length === 1 && o.rows[0][0] === 100000000 && o.rows[0][2] === 0, "property IS the whale (ex 0)");
spot("insurance-claims-ops:q:q52", (o) => o.rows[0][0] === 13000000 && o.rows[0][1] === 207800000, "ring 13000000 / book 207800000");
spot("insurance-claims-ops:q:q53", (o) => o.rows[1][1] === 7 && o.rows[1][2] === 4 && o.rows[1][3] === 6, "cohort board: ring row 7/4/6");
spot("insurance-claims-ops:q:q56", (o) => o.rows[0][1] === 0, "dark carrier sorts first");
spot("insurance-claims-ops:q:q59", (o) => o.rows[0][4] === 2, "leak paid 2 days after SIU open");
spot("insurance-claims-ops:q:q60", (o) => o.rows[0][0] === 220800000 && o.rows[0][1] === 45.29 && o.rows[0][2] === 12 && o.rows[0][3] === 3 && o.rows[0][4] === 9800000, "exec memo row");
spot("insurance-claims-ops:c:c42:1", (o) => o.rows.length === 1 && o.rows[0][1] === 45.29, "case: whale memo share");
spot("insurance-claims-ops:c:c60:2", (o) => o.rows.length === 1 && o.rows[0][2] === 13000000, "case: containment ring_paid");

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
