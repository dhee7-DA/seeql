// Deep-layer batch 6: lesson 64 deep + debrief paragraphs for thin case studies (35/40/50/51).
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
  console.log(`ok deep lesson-${n}`);
};

// Insert a debrief paragraph as the last block of a case study's blocks array.
const P = (n: number, text: string) => {
  const path = `src/lib/curriculum/lessons/lesson-${String(n).padStart(2, "0")}.ts`;
  let src = readFileSync(path, "utf8");
  if (src.includes('kind: "p"') && src.includes("The debrief:")) {
    console.log(`skip debrief lesson-${n}`);
    return;
  }
  // anchor: the closing of the blocks array: "  ],\n  mcqs:"
  const anchor = src.indexOf("  ],\n  mcqs:");
  if (anchor === -1) throw new Error(`no blocks anchor in ${path}`);
  const block = `    {
      kind: "p",
      text: ${JSON.stringify(text)},
    },
`;
  src = src.slice(0, anchor) + block + "  ],\n  mcqs:" + src.slice(anchor + "  ],\n  mcqs:".length);
  writeFileSync(path, src);
  console.log(`ok debrief lesson-${n}`);
};

// ---------------- Lesson 64 — Query Performance ----------------
D(64, `    {
      kind: "mind",
      text: "Performance work is **evidence-based tuning of an evidence-based planner**: you don't make queries faster, you give the planner a cheaper ACCESS PATH and verify it took the hint. The loop is measure → design → verify: EXPLAIN QUERY PLAN names the current path (SCAN = sweep every row; SEARCH = b-tree descent), the design step adds the composite index the workload actually needs (equality columns lead, range trails, covering columns extend), and verify re-reads EQP to see the verb flip. The seed starts with ZERO secondary indexes and feels fine — 103 rows sweep in microseconds — which is exactly why module 11 drills the READING before the writing: at production volume the SCAN is the outage and the index is the fix, but only if the planner agrees.",
    },
    {
      kind: "engine",
      title: "you run the full loop on the customer-status report",
      steps: [
        "**Measure** — EQP for SELECT … WHERE customer_id = 1 AND status = 'shipped': one step, SCAN orders. Every one of 103 rows tested to keep 11.",
        "**Design** — CREATE INDEX idx_orders_cust_status ON orders (customer_id, status): equality-first so the same b-tree serves customer-only lookups; the range/filter column trails.",
        "**Verify** — EQP again: “SEARCH orders USING INDEX idx_orders_cust_status (customer_id=? AND status=?)”. The verb flipped — the planner took the path.",
        "**Own the write cost** — every future INSERT/UPDATE now maintains the extra tree. The module's closing idea: indexes are not free speed; they are a READ/WRITE trade you sign for knowingly, and EQP is the receipt on the read side.",
      ],
    },
    {
      kind: "myth",
      myth: "“EXPLAIN tells me if my query is fast.”",
      truth: "EQP tells you the **access path**, not the latency: a SEARCH over a million matching rows can be slower than a SCAN over a hundred. The plan is a structure claim; cost is structure × volume. That's why the loop ends with verify-and-measure, and why selectivity math (module 11's drills) walks beside EQP, never behind it.",
    },
    {
      kind: "edge",
      items: [
        { c: "The planner ignores your index", r: "Low selectivity (status: 4 values), stale statistics, or a function on the column — the planner sweeps instead. It is not broken; it did the math. Fix the query shape or the index design, don't fight the optimizer." },
        { c: "Covering index magic", r: "Add the referenced column (customer_id, total) and EQP says “USING COVERING INDEX”: the table is never touched — aggregation straight off the b-tree. The fastest join is the one that doesn't happen." },
        { c: "OR across columns", r: "WHERE a = 1 OR b = 2 defeats single-index descents — the planner scans. Rewrite as UNION of two indexed probes when the workload is hot, and let each branch SEARCH." },
        { c: "Index churn", r: "Every index on a hot-write table taxes every write. The measure → design → verify loop ends with a write-side check: if the INSERT path regressed and the read barely improved, the index was a bad bet — drop it and sign a smaller trade." },
      ],
    },`);

// ---------------- Case study debriefs ----------------
P(35, "The debrief: look at what the brief actually tested. Six asks, six tools, zero joins — and every answer came from naming the shape before writing the SQL. The founder's note is the analyst's daily reality: questions arrive in business language, and your first move is always translation — “how many cities” is COUNT(DISTINCT), “how deep is the warehouse” is SUM, “which categories are crowded” is a GROUP BY with a HAVING gate on the aggregate. Notice also what the single-table constraint bought you: no fan-out traps, no NULL-filled gaps, no grain decisions. Module 1's toolkit is small enough to hold in your head and honest enough to trust on day one — the next case studies will add joins, and with them, the grain discipline this course keeps returning to.");

P(40, "The debrief: this one-pager is the module-6 skill check — the exotic shapes doing real work. String aggregation produced the readable summary rows, the grand-total stack layered subtotals under detail without a UNION in sight, RIGHT/FULL OUTER preserved populations that INNER would have dropped, and the non-equi range join mapped items into price bands without a single equality. The executive takeaway matters as much as the SQL: every “unusual” shape here exists to answer a question the common shapes answer badly or not at all. When a reviewer asks “why FULL OUTER here?”, the answer is a population — “because rows with no match are the finding” — never “because it's fancier”. Expert SQL is judged by the fit between shape and question.");

P(50, "The debrief: a data-fix ticket is where the write verbs meet professional paranoia. Every mutation in this brief ran inside a transaction that could be rolled back — and that is not a testing convenience, it is the production pattern: BEGIN, preview with the SELECT twin of the WHERE, apply the UPDATE or UPSERT, verify changes() against the expected count, then COMMIT or ROLLBACK on any surprise. The ticket's subtle lesson is ordering: fix the child rows before the parents change their keys, stage the dedupe before the FK gets enforced, and never let a DELETE see data your SELECT hasn't previewed. Speed is nothing here; the audit trail is everything — a fix that can't show its work is a rumor, not a repair.");

P(51, "The debrief: building a reporting layer is schema engineering with an audience. Each view in this brief froze one definition — open invoices, customer balances, the month spine — so every downstream report inherits the logic instead of re-deriving (and re-breaking) it. Notice the layering: base tables, then views that encode one business definition each, then reports that compose them; when a definition changes (what counts as “open”?), you edit ONE view and every report updates. The discipline that keeps this honest is grain: each view documents what one row IS, and compositions that mix grains stage their aggregates first. The reporting layer is the team's shared vocabulary — views are how SQL learns to say things once.");
