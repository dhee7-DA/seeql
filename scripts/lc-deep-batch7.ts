// Deep-layer batch 7: compact deep layers for the 6 case studies (35/36/39/40/50/51).
import { readFileSync, writeFileSync } from "node:fs";

const D = (n: number, deep: string) => {
  const path = `src/lib/curriculum/lessons/lesson-${String(n).padStart(2, "0")}.ts`;
  let src = readFileSync(path, "utf8");
  if (src.includes("\n  deep: [")) {
    console.log(`skip lesson-${n}`);
    return;
  }
  const tail = src.lastIndexOf("};");
  src = src.slice(0, tail).replace(/,\s*$/, ",\n") + `  deep: [\n${deep}  ],\n` + src.slice(tail);
  writeFileSync(path, src);
  console.log(`ok lesson-${n}`);
};

const brief = (topic: string, body: string) => `    {
      kind: "mind",
      text: "A case study is **requirements engineering in miniature**: the brief arrives in stakeholder language and your job is to translate it into ${topic} — ${body} The professional habit this trains: before any SQL, restate each ask as a shape (\\"that's a filter\\", \\"that's a fold at month grain\\", \\"that's a preservation problem\\") and name the grain of the promised output. Most wrong answers in real analyst work are not syntax errors; they are right answers to a slightly different question — the translation step is where they die. Work the brief top to bottom, reconcile every number you can against another (count vs sum, detail vs summary), and treat any mismatch as a finding, not a nuisance.",
    },
    {
      kind: "edge",
      items: [
        { c: "The ask behind the ask", r: "\\"How many customers do we have?\\" often means \\"how many can we market to\\" — the active flag, the region filter, the dedupe. Ask which population the stakeholder means; the SQL is easy once the noun is exact." },
        { c: "Empty results are findings", r: "A brief that expects holes may find none (this seed's anti-joins return zero rows). Report \\"checked, none found\\" with the query attached — silence in the result set is evidence too." },
        { c: "Grain mixing in one report", r: "Customer counts beside order sums in one table: stage each grain in its own CTE and join on the shared dimension. One query, two grains, no fan-out — the case studies quietly drill this every time." },
        { c: "The reproducibility test", r: "Hard-code the as-of date, avoid date('now'), and keep every number re-derivable from the seed. A founder-facing snapshot that can't be re-run and matched is a screenshot, not a report." },
      ],
    },`;

D(35, brief("Module 1's shapes — filters, collapses, sorts and buckets", "no joins, one table at a time, and every number live-graded against the real store."));
D(36, brief("Module 2's join shapes — inner matching, LEFT preservation, anti-joins and honest aggregates", "retention, region mates and the COUNT trap, all on two-table queries."));
D(39, brief("Module 5's function toolkit — text reshaping, calendar slicing and the first window stamps", "the ops calendar brief, where every ask is a bucket or an offset."));
D(40, brief("Module 6's expert shapes — string aggregation, grand-total stacks and every join variant", "the executive one-pager, where exotic shapes answer questions common ones can't."));
D(50, brief("the write verbs under transactional discipline — INSERT, UPDATE, UPSERT and the staged DELETE", "preview before every write, reconcile changes() after, roll back on any surprise."));
D(51, brief("view design as vocabulary — one business definition per view, composed into reports", "the reporting layer brief, where grain documentation keeps every layer honest."));
