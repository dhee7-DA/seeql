// Deep-layer batch 1: Module 2 joins (lessons 9-16) + Module 5/6 (29-34).
// Inserts `deep: [...]` after each lesson's takeaway line. Run: bunx tsx scripts/lc-deep-batch1.ts
import { readFileSync, writeFileSync } from "node:fs";

const D = (n: number, deep: string) => {
  const path = `src/lib/curriculum/lessons/lesson-${String(n).padStart(2, "0")}.ts`;
  let src = readFileSync(path, "utf8");
  if (src.includes("\n  deep: [")) {
    console.log(`skip lesson-${n} (already has deep)`);
    return;
  }
  const tail = src.lastIndexOf("};");
  if (tail === -1) throw new Error(`no tail in ${path}`);
  src = src.slice(0, tail).replace(/,\s*$/, ",\n") + `  deep: [\n${deep}  ],\n` + src.slice(tail);
  writeFileSync(path, src);
  console.log(`ok lesson-${n}`);
};

// ---------------- Lesson 9 — Two tables, one answer ----------------
D(9, `    {
      kind: "mind",
      text: "Foreign keys store a relationship **as a number, not as a copy**. When order 7 belongs to customer 3, the orders row does not clone Alice's name and city — it carries the single fact \`customer_id = 3\`. That's why the data lives apart: one customer row is the authority, and 24 order rows point at it. A JOIN is the query-time act of following those pointers — reuniting the split facts for exactly the duration of one answer. Nothing is merged, nothing is saved; the reunion exists only inside your result set. Once you internalize that, joins stop feeling like magic glue and become what they are: a bulk VLOOKUP executed for every row of the left table, with the index doing the seeking.",
    },
    {
      kind: "engine",
      title: "you run SELECT c.name, o.total FROM customers c JOIN orders o ON o.customer_id = c.id",
      steps: [
        "**Read the left side** — the planner picks the smaller or better-indexed table as the outer loop: here, 16 customer rows.",
        "**Seek per row** — for each customer, it probes orders by \`customer_id\` (the plan says \`SEARCH orders\` when an index exists; \`SCAN\` when not, as in this seed).",
        "**Emit pairs** — every (customer, order) pair that satisfies the ON test becomes one output row: 16 customers × their 24, 17, 14 … orders = 103 rows, because every customer has at least one order in this seed.",
        "**Project** — only then are the requested columns pulled; the join never materializes whole tables, just the pairs' needed fields.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"JOIN merges the tables into one big table that lives somewhere in the database.\\"",
      truth: "A join is a **virtual, per-query act** — nothing is stored. Two people can run different joins on the same tables simultaneously and neither sees the other's result. The tables remain untouched; only the answer is assembled.",
    },
    {
      kind: "edge",
      items: [
        { c: "A customer with zero orders", r: "Inner join drops them silently — this seed has none (every customer ordered at least once), but the moment one appears, INNER JOIN hides it. That's LEFT JOIN's job (lesson 12)." },
        { c: "Two customers, same name", r: "Names are not keys. Joining on name instead of id can fuse two different people into one row — join on the foreign key, which the schema guarantees to be exact." },
        { c: "An order whose customer_id points nowhere", r: "An orphan row. With the FK constraint on (this seed) it cannot exist; without it, the inner join silently drops it — a data-quality hole you'd only find by joining back." },
        { c: "Joining on a float column", r: "Floats that print identically can differ in the last bits; ON a.price = b.price can miss. Money lives in cents here precisely so joins hit exact integers." },
      ],
    },`);

// ---------------- Lesson 10 — INNER JOIN mechanics ----------------
D(10, `    {
      kind: "mind",
      text: "An inner join is a **multiplication machine with a filter bolted on**. Conceptually the engine forms every left-row × right-row combination — 16 customers × 103 orders is 1,648 candidate pairs — then keeps only the pairs that satisfy ON. The join's row count is therefore not \\"rows of A\\" or \\"rows of B\\" but \\"matching pairs\\", and when one left row matches many right rows, the left row **repeats**. That repetition is the fan-out: orders joined to order_items yields 251 rows from 103, because the average order has ~2.4 lines. Any aggregate you compute downstream inherits that grain — which is why lesson 16 exists.",
    },
    {
      kind: "engine",
      title: "you run SELECT * FROM orders o JOIN order_items oi ON oi.order_id = o.id",
      steps: [
        "**Candidate space** — nested loop: 103 outer orders, each conceptually against 251 item rows; the ON test prunes to matching pairs.",
        "**Match resolution** — order 1's three item rows become three output rows carrying identical order columns and different item columns; nothing is deduplicated.",
        "**Cost shape** — with no index on order_id this is O(103 × 251) ≈ 25,853 comparisons; the plan shows \`SCAN oi\` inside the loop. Add the index and each probe becomes a descent.",
        "**Row budget** — the result's grain is \\"line items\\" (251 rows), not orders. The engine is honest about this; the bug is always downstream, in an aggregate that assumed order grain.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"INNER JOIN returns the intersection — rows that exist in both tables.\\"",
      truth: "It returns **matching pairs**, not rows. A row with five matches appears five times; a row with none appears zero times. \\"Intersection\\" thinking breaks the moment fan-out enters — count the pairs, not the tables.",
    },
    {
      kind: "edge",
      items: [
        { c: "Duplicate join keys on both sides", r: "3 left rows × 4 right rows sharing one key = 12 output rows. The multiplicative rule never rounds down — it is the most expensive surprise in reporting SQL." },
        { c: "NULL in a join column", r: "NULL = NULL is not true (three-valued logic), so NULL keys match nothing in an inner join — including their twins. Rows with NULL keys vanish." },
        { c: "Joining on the wrong alias", r: "ON o.customer_id = o.id compiles fine and returns near-junk — always name both sides from their own tables and read the ON aloud as a sentence." },
        { c: "Self-referencing fan-out", r: "customers joined to customers on region (a.id < b.id) yields 39 pairs from 16 people — C(5,2)=10 for APAC, 28 for EU, 1 for US, 0 for LATAM's solo member. Self-joins are just joins with the same table twice." },
      ],
    },`);

// ---------------- Lesson 11 — Three-table chains ----------------
D(11, `    {
      kind: "mind",
      text: "A three-table chain is **two joins wearing a trench coat**. The schema fact you exploit: foreign keys point one hop each, so an answer spanning three tables is built hop by hop — order_items knows its order, orders knows its customer. Chain them and the grain of the FINAL result is decided by the LAST fan-out you allow in. items→orders multiplies 251 ways to 251 rows (each item has one order); orders→customers multiplies nothing further (each order has one customer). The chain's output stays at item grain — 251 rows — because the later hops were many-to-one. Name the grain out loud before you aggregate, and three-table queries lose their fear.",
    },
    {
      kind: "engine",
      title: "you run FROM order_items oi JOIN orders o ON … JOIN customers c ON …",
      steps: [
        "**Join order choice** — the planner reorders freely: it may start from the 251 item rows and probe upward, or from 16 customers downward. The ON conditions are the same; the cost is not.",
        "**Intermediate grain** — after hop one the working set is 251 rows at item grain; after hop two, still 251 (customers add columns, not rows). Intermediates are never materialized for you — but their sizes set the cost.",
        "**Column resolution** — three tables have three \`id\` columns; unqualified \`id\` is an ambiguity error. Aliases (oi, o, c) are not style — they are the disambiguator.",
        "**Filter placement** — a WHERE on customer region prunes earliest if applied during the customer hop. The engine does this automatically; your job is to not re-block it with a correlated shape it can't see through.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"The FROM order determines the join order, so I must list the biggest table first.\\"",
      truth: "The planner **reorders inner joins** based on statistics and indexes. FROM order matters for readability (and for outer joins' semantics), not for inner-join performance. Write the chain in the order the story reads; let the engine pick the loop.",
    },
    {
      kind: "edge",
      items: [
        { c: "Skipping a hop", r: "There is no orders→products FK — you cannot join two hops apart without the middle table. The chain is the schema; missing links are errors, not optimizations." },
        { c: "Two FKs to the same table", r: "If order_items also had shipper_id → shippers, you'd join shippers twice under two aliases. Each FK is its own hop with its own alias." },
        { c: "Aggregating mid-chain", r: "\\"Revenue per customer\\" wants customer grain: join all three, GROUP BY customer at the end. Folding customers too early (GROUP BY then join) is the aggregate-first fix of lesson 16 — different tool, different grain." },
        { c: "LEFT in the middle of a chain", r: "A LEFT JOIN followed by an INNER JOIN can silently demote the LEFT's preserved NULLs (the WHERE on the right table's column kills them). Check every hop's preservation survives the next." },
      ],
    },`);

// ---------------- Lesson 12 — LEFT JOIN ----------------
D(12, `    {
      kind: "mind",
      text: "LEFT JOIN is a **preservation contract**: every row of the left table appears, matched or not — unmatched left rows survive with NULL filling every right-table column. The mental flip from INNER: the left table is the *population you are studying*, the right table is *evidence you're attaching*. Flipping the tables flips the study. In this seed orders LEFT JOIN shipments-style checks surface naturally: 21 orders have shipped_at IS NULL, and NULL-shipped rows are exactly the ones an INNER JOIN on a shipment table would have erased. LEFT JOIN turns \\"show me the matches\\" into \\"show me the population, and let absence be visible as NULL.\\"",
    },
    {
      kind: "engine",
      title: "you run SELECT c.name, o.id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id",
      steps: [
        "**Left pass** — all 16 customers are queued first; they are the contract. RIGHT side rows are only retrieved on demand.",
        "**Match or pad** — each customer either finds its orders (24 for customer 1) or, finding none, emits ONE row with o.* all NULL. Unmatched left rows are never dropped — they are padded.",
        "**Count check** — the result has ≥ 103 rows (one per matching pair) plus one pad row per zero-match customer. In this seed: exactly 103, since every customer has orders — run the LEFT JOIN and the count proves the preservation.",
        "**NULL meaning** — a NULL in o.id now carries information: \\"this customer has no orders\\". The NULL is the answer, not a defect.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"LEFT JOIN is the safe join — I'll use it everywhere and lose nothing.\\"",
      truth: "LEFT JOIN trades drop-risk for **NULL-risk**: every right-side column can now be NULL, and any downstream expression (SUM of NULLs, comparisons, counts) must be NULL-aware. INNER drops rows; LEFT drops certainty. Choose per question, not per fear.",
    },
    {
      kind: "edge",
      items: [
        { c: "WHERE on the right table's column", r: "WHERE o.status = 'delivered' silently demotes the LEFT JOIN to INNER: pad rows have NULL status, NULL = 'delivered' is not true, and the preserved customer vanishes. The test belongs in the ON clause." },
        { c: "COUNT(*) vs COUNT(right column)", r: "After a LEFT JOIN, COUNT(*) counts pad rows (a customer with no orders counts as 1) but COUNT(o.id) counts matches only (0). The pair is the honest way to show both population and coverage." },
        { c: "Chained LEFT JOINs", r: "Each hop's preservation is independent; a later INNER JOIN or a WHERE on any right column can retroactively kill earlier pads. Audit the whole chain, not the first hop." },
        { c: "LEFT JOIN where the right side is unique", r: "If the right table's key is unique, LEFT JOIN behaves like a lookup: 103 orders each find ≤ 1 invoice row, fan-out impossible. Preservation still applies; multiplication can't." },
      ],
    },`);

// ---------------- Lesson 13 — Anti-join ----------------
D(13, `    {
      kind: "mind",
      text: "The anti-join answers **\\"who never…?\\"** — and its shape is a LEFT JOIN whose right side you demand to be absent: LEFT JOIN … WHERE right.id IS NULL. The preserved-and-padded row is the fingerprint of non-existence; the IS NULL test selects exactly the rows the INNER JOIN would have kept out. Every \\"customers with no delivered orders\\", \\"products never sold\\", \\"invoices without payments\\" question is this one pattern. This seed's honest twist: run it and you get ZERO rows — every customer has orders and every product has sold. That empty result is not a broken query; it is a finding. An anti-join returning nothing says \\"the hole you were hunting does not exist\\", and that is often exactly what an auditor needs in writing.",
    },
    {
      kind: "engine",
      title: "you run SELECT c.id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending' WHERE o.id IS NULL",
      steps: [
        "**Scope in ON, not WHERE** — the pending-filter lives in the ON clause, so customers with no PENDING orders are padded (kept), not dropped.",
        "**Pair or pad** — customers with pending orders emit their pairs; the rest emit one NULL-padded row each.",
        "**The filter** — WHERE o.id IS NULL keeps only pads: customers whose pending-order seek found nothing. The engine may implement this as a hash anti-join — same answer, no intermediate materialization.",
        "**Return** — the result is the complement of the INNER JOIN's population: \\"customers minus customers-with-pending\\". In this seed that set is empty — the check itself is the deliverable.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"NOT EXISTS and LEFT JOIN … IS NULL are different results.\\"",
      truth: "For this shape they return the **same rows** — NOT IN is the one that betrays you: a single NULL in the subquery's column makes NOT IN return nothing at all. Anti-join by NOT EXISTS (or the LEFT JOIN shape) is NULL-safe by construction.",
    },
    {
      kind: "edge",
      items: [
        { c: "The filter in WHERE instead of ON", r: "WHERE o.status = 'pending' after the join drops the pads first — the anti-join returns everyone, wrongly. Filter-the-evidence lives in ON; filter-the-population lives in WHERE." },
        { c: "Testing IS NULL on a nullable column", r: "Test the join KEY (o.id) — it's NOT NULL by contract, so NULL there means \\"pad row\\" unambiguously. o.shipped_at IS NULL is ambiguous: pad row, or a real order that hasn't shipped?" },
        { c: "Anti-join on both sides of a union", r: "\\"Customers with no orders\\" is the complement of \\"customers with orders\\" — the two counts must sum to 16. Reconciling a set with its complement catches most anti-join typos." },
        { c: "Empty anti-join dismissed as a bug", r: "Zero rows is a verdict, not an error. This seed's \\"products never ordered\\" is genuinely empty — say so in the report instead of re-running until something appears." },
      ],
    },`);

// ---------------- Lesson 14 — Self-join ----------------
D(14, `    {
      kind: "mind",
      text: "A self-join is **one table wearing two name tags**. The rows of customers become two independent populations — \\"a\\" and \\"b\\" — because the question needs *pairs from one set*: who shares my region, which orders are older than which, which invoices mirror each other. The aliases are not cosmetics; they are the only thing keeping the two roles apart. The classic discipline is the asymmetric pair test \`a.id < b.id\`: it keeps each unordered pair exactly once and forbids self-pairing. Drop the inequality and every pair doubles (a,b) and (b,a) while (a,a) sneaks in too — 39 true region pairs become 88 rows of noise. Self-joins are where alias discipline stops being style and becomes correctness.",
    },
    {
      kind: "engine",
      title: "you run FROM customers a JOIN customers b ON a.region = b.region AND a.id < b.id",
      steps: [
        "**Two passes over one table** — the engine scans customers as \\"a\\" and, per a-row, scans it again as \\"b\\". One physical table, two logical roles; 16 × 16 = 256 candidate pairs.",
        "**ON prunes** — region equality keeps same-region pairs (5 APAC, 8 EU, 2 US, 1 LATAM members), and \`a.id < b.id\` kills mirrors and self-pairs.",
        "**Emit** — 10 + 28 + 1 + 0 = 39 rows, each a unique unordered pair. The count C(n,2) per region is your reconciliation check.",
        "**Cost warning** — self-joins scale quadratically without indexes: 256 pairs here is trivial, 100k × 100k is not. The ON columns need indexes in production.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"You can't join a table to itself — SQL will complain about the duplicate name.\\"",
      truth: "SQL only complains if you **reuse the same alias**. Two distinct aliases make the engine treat it as two independent row sources; the \\"same table\\" restriction exists only in your head, not in the engine's.",
    },
    {
      kind: "edge",
      items: [
        { c: "Forgetting the inequality", r: "Without \`a.id < b.id\`, every pair appears twice (a,b) and (b,a), plus 16 self-pairs (a,a): 39 becomes 94. The pair count doubles and pollutes — the inequality is the dedupe." },
        { c: "Using ≠ instead of <", r: "\`a.id <> b.id\` still allows both directions — 78 rows. The directionless pair needs a directionless test: order the ids and keep one orientation." },
        { c: "Pairs across a hierarchy", r: "Employee → manager is a self-join on reports_to = e.id. Managers are also employees, so LEFT JOIN from employees to their manager keeps the CEO's NULL — preservation matters inside the org chart too." },
        { c: "Three-role self-join", r: "\\"Customers in the same city as someone in the same region as…\\" chains a.id < b.id AND b.city = c.city — legal, but read it aloud or the roles blur. Name tags exist to be read." },
      ],
    },`);

// ---------------- Lesson 15 — Joins + aggregates ----------------
D(15, `    {
      kind: "mind",
      text: "Aggregates over a join inherit the **join's grain, not the table's** — that single sentence is the whole lesson. Join customers to orders (many-to-one) and revenue per region is safe: each order row survives exactly once. Join orders to order_items and then SUM orders.total, and every order's total is paid once per line item — the 251-line fan-out re-charges 103 orders' totals by ~2.4× on average. The COUNT trap is the same disease in mild form: after LEFT JOIN, COUNT(*) counts pad rows but COUNT(o.id) counts matches. The fix is not \\"be careful\\" — it is structural: aggregate at the grain you report (distinct keys, pre-aggregated stages, or the aggregate-first shape of lesson 16).",
    },
    {
      kind: "engine",
      title: "you run SELECT c.region, SUM(o.total) FROM customers c JOIN orders o ON … GROUP BY c.region",
      steps: [
        "**Join phase** — the engine materializes the pair set at order grain: 103 rows, each customer's columns repeated onto their orders.",
        "**Group phase** — GROUP BY region folds the 103 pairs into 4 stage buckets (APAC 5, EU 8, US 2, LATAM 1 customers — but order counts, not customer counts, drive the sums).",
        "**Aggregate phase** — SUM runs per bucket over order totals: no fan-out, because the join was many-to-one toward orders. The number is honest.",
        "**The counterfactual** — swap the join for orders ⋈ order_items and SUM(o.total): the same SUM now runs over 251 rows where order totals repeat per line. Revenue ≈ 2.4× truth — the engine did nothing wrong; the grain was wrong.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"COUNT(*) after a LEFT JOIN counts the left table's rows.\\"",
      truth: "It counts **output rows** — a customer with three orders contributes three, a customer with none contributes one (the pad). Count the left table's KEY (COUNT(c.id)) to count population, or COUNT(o.id) to count matches.",
    },
    {
      kind: "edge",
      items: [
        { c: "SUM over a duplicated money column", r: "The fan-out double-charge: 34,833.28 of true revenue becomes ~84,000 through the items join. Any \\"revenue looks inflated\\" bug report starts here." },
        { c: "DISTINCT as a bandage", r: "COUNT(DISTINCT o.id) fixes counts but not SUMs — there is no SUM(DISTINCT total) that survives repeated identical totals. Distinct treats the symptom and hides the shape." },
        { c: "Averaging averages", r: "AVG(per-customer averages) ≠ overall average: customer 1's 24 orders outweigh LATAM's lone buyer in the true mean but count equally in the average-of-averages. Weight or re-aggregate at raw grain." },
        { c: "Two many-to-one hops", r: "items→orders→customers stays at 251 rows: safe for SUM(oi.quantity*oi.unit_price) per region. Fan-out is per hop; two safe hops make a safe chain." },
      ],
    },`);

// ---------------- Lesson 16 — Capstone: join pitfalls ----------------
D(16, `    {
      kind: "mind",
      text: "The capstone's one idea: **the join decides the grain, the aggregate must pay for it**. The fan-out trap and the aggregate-first fix are the same coin's two faces. Trap: join orders to order_items, SUM(o.total) — 3×-style inflation because order dollars repeat per line. Fix: fold order_items to order grain FIRST (one row per order), THEN join. The aggregate-first shape is not an optimization trick; it is the only arithmetic that is true. When a stakeholder's \\"revenue is wrong\\" ticket lands, the debugging order is: state the intended grain, count the actual rows at each stage, find the hop that multiplied, and re-stage the aggregate to before that hop.",
    },
    {
      kind: "engine",
      title: "you run the aggregate-first fix",
      steps: [
        "**Stage one (fold)** — FROM order_items GROUP BY order_id: 251 lines become ≤103 rows, each carrying that order's true line sum. Grain: orders.",
        "**Stage two (reunite)** — JOIN orders ON id: one-to-one now; the totals repeat ZERO times. SUM over the joined result equals SUM over order_items — the reconciliation that proves the fix.",
        "**Stage three (report)** — GROUP BY the reporting dimension (region, month, status) at the grain you promised. Every layer has one job and one grain.",
        "**The audit** — compare SUM at stage one vs stage three; equality is the receipt. When they differ, a hop multiplied between them — find it before anyone asks.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"The fan-out is the database's fault — the join is buggy.\\"",
      truth: "The join is **doing exactly what the keys say**: one order really does have three lines. The bug is asking an order-grain question of a line-grain result. The schema is honest; the query's grain assumption was not.",
    },
    {
      kind: "edge",
      items: [
        { c: "Fan-out hidden by coincidence", r: "One-line orders dominate in small samples and the inflated SUM looks plausible. The error grows with lines-per-order — test on the fan-out-heaviest order before trusting any joined SUM." },
        { c: "Two fixes that disagree", r: "SUM(DISTINCT total) and aggregate-first agree ONLY when no two orders share a total. Seed data with duplicate totals silently breaks the DISTINCT bandage — another reason it's not a fix." },
        { c: "Counting things that were never rows", r: "\\"Orders per region\\" after joining items counts LINES per region unless the fold happened first. Name the noun (orders? lines?) in the ticket, then build to its grain." },
        { c: "The report that must mix grains", r: "Order count AND line count in one report: two CTEs, one per grain, joined on the shared dimension. Mixing grains in one query without staging is how the 3× bug ships." },
      ],
    },`);
