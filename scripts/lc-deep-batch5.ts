// Deep-layer batch 5: lessons 58-63 (M10 Window Functions Masterclass).
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

// ---------------- Lesson 58 — Windows IV: OVER from first principles ----------------
D(58, `    {
      kind: "mind",
      text: "This masterclass starts the family from zero: **OVER is a scope declaration**. The empty form — OVER () — says \\"the whole surviving row set is my stage\\"; PARTITION BY cuts stages; ORDER BY sequences within a stage. Every window call is the same three-part sentence, and reading a query means parsing that sentence per function. The evaluation timing is the other foundation: windows run AFTER WHERE and GROUP BY — they see surviving (possibly grouped) rows — which is why \\"filter on rank\\" needs an outer layer, and why a window over a GROUP BY (\\"rank the months\\") ranks the GROUPS, not the raw rows. Master this one lesson's mental model and the next five are just new functions bolted to the same scope machine.",
    },
    {
      kind: "engine",
      title: "you run SELECT SUBSTR(created_at,1,7) AS month, SUM(total) AS revenue, RANK() OVER (ORDER BY SUM(total) DESC) AS rk FROM orders GROUP BY month",
      steps: [
        "**Fold first** — GROUP BY month collapses 103 orders into 14 rows; this happens BEFORE the window pass, by the standard clause order.",
        "**Window sees groups** — RANK's stage is the 14 grouped rows, not 103: the ranking \\"SUM(total) DESC\\" reads the ALREADY-aggregated revenue. Windows over aggregates are natural once timing is internalized.",
        "**Stamp, don't collapse** — the output keeps all 14 rows, each with rank attached. The leaderboard and the data share one result set — no self-join, no CTE round-trip.",
        "**The 103-row stamp** — the same machinery with COUNT(*) OVER (PARTITION BY status) stamps group SIZE onto every raw row: 52/30/14/7 travel with their member rows. One machinery, two grains, both honest.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"Window functions are just aggregates with extra syntax — SUM is SUM.\\"",
      truth: "The semantics diverge at the output contract: GROUP BY **collapses** (n rows in, one per group out), a window **stamps** (n rows in, n rows out, summary as a passenger column). Confusing them is how \\"where did my 103 rows go?\\" happens — the collapse is opt-in for windows, which is precisely their power.",
    },
    {
      kind: "edge",
      items: [
        { c: "Window in WHERE", r: "Rejected by the parser — not a style rule but the clause-order contract: WHERE runs before the window pass, so it cannot see the window's output. The CTE/outer-SELECT filter is the shape, in every engine." },
        { c: "PARTITION BY an aggregate", r: "PARTITION BY SUM(total) after GROUP BY is legal and occasionally meaningful — stages formed from group-level values. Readability suffers; stage with a CTE unless the one-liner earns its keep." },
        { c: "Multiple windows, one query", r: "Each OVER is independent: rank by revenue AND count per status in the same SELECT — two scope sentences, evaluated in their own passes. Name columns carefully; the stage each column saw is not visible in the output." },
        { c: "Determinism duty", r: "OVER (ORDER BY total) with tied totals is an unstable sort — the engine owes you no tie order. Every ranking that feeds pagination, dedupe, or export needs the id tiebreak. Non-determinism is YOUR bug, not the engine's." },
      ],
    },`);

// ---------------- Lesson 59 — Windows V: the ranking playbook ----------------
D(59, `    {
      kind: "mind",
      text: "The ranking playbook is **three named shapes**: top-N-per-group (number inside a CTE, filter rn <= N outside), dedupe-to-latest (number newest-first, keep rn = 1), and the tie-contract choice (ROW_NUMBER breaks ties arbitrarily, RANK skips, DENSE_RANK packs). The two-layer shape is not ceremony — it is the clause-order law from Windows IV made into a pattern: WHERE cannot see window output, so the number-then-filter sandwich is THE portable idiom. The playbook's quiet superpower is replacing fragile alternatives: the \\"GROUP BY customer + MAX(created_at) + re-join\\" dance for latest-per-group produces wrong rows when timestamps tie, while rn = 1 with a deterministic tiebreak is stable by construction.",
    },
    {
      kind: "engine",
      title: "you run WITH n AS (… ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) AS rn …) SELECT * FROM n WHERE rn <= 3",
      steps: [
        "**Inner pass** — the CTE stamps all 103 orders with their within-customer rank: customer 1's 24 orders become ranks 1..24, ordered by total DESC with the id tiebreak.",
        "**Outer filter** — WHERE rn <= 3 runs in the outer query where rn is an ordinary column: the clause-order law is satisfied by layering, not by syntax tricks.",
        "**The tie contract pays off** — two orders tied at the same total get ids as arbiter: every run returns the SAME three rows. Without the tiebreak, pagination and exports flip coins.",
        "**Shape generalization** — rn = 1 dedupes; rn BETWEEN 4 AND 6 pages; rn = 1 per (customer, month) answers first-order-per-month. One sandwich, many fillings.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"LIMIT N per group — just GROUP BY and LIMIT, right?\\"",
      truth: "GROUP BY + LIMIT applies LIMIT to the GROUPS, not within them — \\"top 3 per customer\\" returns 3 rows total, not 48. There is no LIMIT-inside-group syntax in SQL; the rank-sandwich is the standard, engine-portable answer.",
    },
    {
      kind: "edge",
      items: [
        { c: "\\"Top 3\\" that returns 4 rows", r: "That's RANK, not a bug: ties at rank 3 all survive. If the business wants EXACTLY three per group, the contract is ROW_NUMBER — say which you promised before the stakeholder says it louder." },
        { c: "Dedupe without a deterministic tiebreak", r: "rn = 1 over ties picks an arbitrary survivor per run — the \\"deleted\\" row reappears tomorrow. Order by (created_at DESC, id DESC): the dedupe becomes reproducible." },
        { c: "Filtering in the same layer", r: "WHERE rn <= 3 must be OUTSIDE the window's SELECT — putting it in the same query is the parser error that teaches clause order. A derived table or CTE is the door." },
        { c: "DENSE_RANK for pagination", r: "Pages built on ROW_NUMBER skip nothing; pages built on RANK leave holes after ties (rank 3 missing → page shows 2 rows). Choose the contract the UI expects — usually ROW_NUMBER for page math, DENSE_RANK for display." },
      ],
    },`);

// ---------------- Lesson 60 — Windows VI: LAG & LEAD mastery ----------------
D(60, `    {
      kind: "mind",
      text: "LAG and LEAD are the family's **memory**: they read another row of the same stage onto the current row — LAG looks back, LEAD forward, and the offset says how far. Every \\"delta, gap, streak, consecutive-runs\\" analysis starts here, because comparison needs two rows on one row. The three-argument form — LAG(col, offset, default) — is where mastery shows: the default replaces the boundary NULL (first row's \\"previous\\" becomes 0 instead of NULL), which matters the moment the value feeds arithmetic. And the sort spec is the timeline, full stop: LAG over (ORDER BY created_at, id) reads the previous CHRONOLOGICAL order; over (ORDER BY total) reads the previous-RICHER one — both legal, utterly different analyses.",
    },
    {
      kind: "engine",
      title: "you run SELECT customer_id, created_at, total, LAG(created_at, 1) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS prev_at FROM orders",
      steps: [
        "**Stage + timeline** — per customer, orders sorted chronologically. LAG's \\"previous\\" is defined BY this sort — the engine materializes each stage in order, then slides a window of neighbors.",
        "**Neighbor fetch** — row k reads row k−1's created_at; row 1 of each stage reads nothing and yields NULL (or the three-argument default).",
        "**Delta assembly** — the difference (created_at − prev_at) computes per row in the same SELECT: the gap-to-next-purchase input, no self-join.",
        "**Boundary semantics** — the first row's NULL is information (\\"no prior purchase\\"), the three-argument 0 is a computation convenience (\\"treat as epoch\\"). Choose per consumer — streak logic and gap averages read them differently.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"LAG(total, 2) reads two columns back, or the total two rows up in the table's storage order.\\"",
      truth: "It reads the value **two positions back in the OVER's sort spec** — no storage order, no columns. Without ORDER BY in OVER, \\"previous\\" is undefined and most engines reject LAG outright. The sort spec is the memory's address line.",
    },
    {
      kind: "edge",
      items: [
        { c: "Streak counting", r: "Consecutive-buyer streaks: flag current-vs-previous (CASE WHEN same month THEN 0 ELSE 1), then SUM the flags OVER (ORDER BY …) — the running count of resets IS the streak id (lesson 63 formalizes this)." },
        { c: "LEAD loses the last row", r: "Delta-to-next-purchase via LEAD is NULL on each customer's final order — structurally. Reports averaging gaps must decide: exclude (honest) or coalesce-to-zero (a lie that inflates frequency)." },
        { c: "LAG across the partition edge", r: "Partitions firewall the memory: customer 2's first row does NOT read customer 1's last. If your \\"previous\\" crosses wallets, you wanted no partition — and now the business meaning is different." },
        { c: "Same-timestamp neighbors", r: "Two orders at one timestamp: (created_at, id) makes \\"previous\\" deterministic; created_at alone flips a coin. Every LAG on real data needs the tiebreak — this is Windows IV's determinism duty, returning." },
      ],
    },`);

// ---------------- Lesson 61 — Windows VII: frames in full ----------------
D(61, `    {
      kind: "mind",
      text: "The frame is the window's **third knob**: not \\"which stage\\" (partition) or \\"which order\\" (sort spec) but **which slice of the stage the aggregate sees per row**. The default frame — RANGE from UNBOUNDED PRECEDING to CURRENT ROW — is why ORDER BY'd SUM runs at all, and why it Betrays you twice: once by folding same-value peers (RANGE compares VALUES), once by making LAST_VALUE equal the current row (the frame ends WHERE YOU STAND). The full grammar — ROWS/RANGE/GROUPS, BETWEEN x PRECEDING AND y FOLLOWING, EXCLUDE — is one sentence pattern with a vocabulary. The bank-ledger vs day-batch distinction is the canonical example: ROWS posts row-by-row (each order separate), RANGE batches value-ties (same-day orders post together) — same query shape, one keyword apart, different money.",
    },
    {
      kind: "engine",
      title: "you run SUM(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)",
      steps: [
        "**Default frame check** — ORDER BY present, frame unspecified: RANGE UNBOUNDED PRECEDING → CURRENT ROW. On 84 distinct days carrying 103 orders, 19 same-day pairs fold — the \\"running\\" total jumps at date boundaries.",
        "**ROWS vs RANGE** — ROWS counts physical rows: each of the 103 posts separately (bank statement). RANGE includes all PEERS of the current sort value: same-day orders batch (daily settlement). One keyword, two ledgers.",
        "**The LAST_VALUE trap** — default frame ends at CURRENT ROW, so LAST_VALUE(total) = total: the function can only see to the frame's edge. ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING widens its view to the whole stage.",
        "**Rolling frames** — ROWS BETWEEN 6 PRECEDING AND CURRENT ROW is the 7-row roller; the current row is IN its own frame (off-by-one is the classic: 7 PRECEDING spans eight rows).",
      ],
    },
    {
      kind: "myth",
      myth: "\\"ROWS and RANGE are interchangeable when there are no ties — why learn both?\\"",
      truth: "There are **always ties eventually**: 84 days, 103 orders, 19 shared dates in this seed alone. The bug ships on the dataset you didn't test. ROWS is \\"physical rows\\", RANGE is \\"value peers\\" — learn both, default to explicit, and never trust \\"no ties in my data\\" as a frame strategy.",
    },
    {
      kind: "edge",
      items: [
        { c: "Frame without ORDER BY", r: "The default frame with NO sort spec is the whole partition — SUM OVER () sums everything. The frame knobs only exist relative to the timeline; no timeline, no slice." },
        { c: "RANGE with numeric offsets", r: "RANGE BETWEEN 7 PRECEDING … compares VALUES (7 units of the sort column, e.g. days), not rows — a rolling 7-DAY window on a date column. Legal, powerful, and utterly different from 7 ROWS." },
        { c: "EXCLUDE CURRENT ROW", r: "The frame grammar can exclude the current row — the \\"everyone but me\\" average (peer comparison without self-influence). Rarely needed, unforgettable once seen." },
        { c: "First/last aggregates", r: "FIRST_VALUE/LAST_VALUE are frame-scoped reads; NTH_VALUE needs the n-th row to exist INSIDE the frame. Early rows legitimately yield NULL — structural, not failure." },
      ],
    },`);

// ---------------- Lesson 62 — Windows VIII: tiles, shares & relative standing ----------------
D(62, `    {
      kind: "mind",
      text: "Distribution windows replace \\"rank 7 of 103\\" with **\\"where on the curve\\"**: NTILE(n) deals ordered rows into n near-equal buckets (quartiles, deciles), PERCENT_RANK computes (rank−1)/(n−1) — the 0..1 ladder with its floor at exactly 0 — and CUME_DIST computes the at-or-below share (÷ n), the curve that includes peers and lands exactly on 1.0. The three disagree by design: quartile membership is count-forced, PERCENT_RANK is rank-fraction, CUME_DIST is share-of-population. \\"Top quartile by spend\\" and \\"top 1% by CUME_DIST\\" are different sentences that overlap without coinciding — the analyst's job is picking the definition the question meant, then saying it out loud in the report.",
    },
    {
      kind: "engine",
      title: "you run SELECT id, total, NTILE(4) OVER (ORDER BY total, id) AS quartile, ROUND(CUME_DIST() OVER (ORDER BY total), 4) AS cum FROM orders",
      steps: [
        "**Deal the tiles** — NTILE(4) over 103 ordered rows: buckets of 26/26/26/25 (the remainder spreads across the earliest buckets). Count-forced by definition.",
        "**The rank curve** — PERCENT_RANK = (rank−1)/(n−1): the cheapest row is exactly 0.0, the richest is (103−1)/(103−1) = 1.0 minus its own ties… peers share the value, so the top of the curve approaches 1 and only touches it when the top row is untied.",
        "**The share curve** — CUME_DIST = at-or-below ÷ n: ties ride one point, the maximum row sits at exactly 1.0. Ties included is the definitional difference from PERCENT_RANK.",
        "**Crossing discipline** — \\"the median\\" = the row where CUME_DIST first reaches ≥ 0.5. With even n the crossing is the upper median — say which you computed; both are defensible, silence is not.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"Top quartile = top 25% of value.\\"",
      truth: "NTILE quartiles split the **COUNT of rows**, not the SUM of value: the top quartile here is the 26 biggest orders, which may hold 60% of revenue. \\"Top 25% of revenue\\" is a cumulative-SUM-over-running-total computation — a different query wearing a similar name.",
    },
    {
      kind: "edge",
      items: [
        { c: "NTILE with a remainder", r: "103 into 4 leaves 3: the FIRST three buckets take the extra row. Bucket sizes 26/26/26/25 — downstream \\"equal quarters\\" claims need the footnote." },
        { c: "Ties across tile walls", r: "Two identical totals can straddle buckets 1 and 2 — NTILE is count-blind to value ties. If peers must travel together, the bucketing needs CUME_DIST thresholds instead." },
        { c: "PERCENT_RANK on a tie at top", r: "Two rows share the max rank n: both sit at (n−1)/(n−1) = 1.0? No — both share rank n−1+1… compute it: the curve tops BELOW 1.0 when ties ride the maximum. CUME_DIST is the curve that always reaches exactly 1." },
        { c: "Pareto reads", r: "Sort by total DESC, running SUM OVER () ÷ grand total: the cumulative share curve shows how few orders carry how much revenue — the 80/20 check, built from this lesson's parts." },
      ],
    },`);

// ---------------- Lesson 63 — Windows IX: the pattern library ----------------
D(63, `    {
      kind: "mind",
      text: "The pattern library is where the family becomes **analysis**: gaps-and-islands (turn \\"consecutive\\" into a groupable id: global row number minus within-group row number is constant per run), sessionization (a gap threshold flags session starts; the running sum of flags is the session id), YoY ladders (LAG partitioned by year over the month spine), and the mixed board where stages stack: fold, sequence, then compare. The unifying habit: **decompose the pattern into window primitives** — every \\"hard\\" analysis here is two or three of the family's tools in a row, each in its own CTE layer, each auditable. If a pattern feels un-writable, the decomposition is wrong — no pattern in this lesson needs a correlated subquery or a cursor.",
    },
    {
      kind: "engine",
      title: "you run the gaps-and-islands decomposition over order days",
      steps: [
        "**Sequence globally** — DISTINCT order days, numbered by ROW_NUMBER: rn assigns each day its global position (84 days in the seed).",
        "**Sequence within group** — for each status-run (or any grouping key), a second ROW_NUMBER partitions and numbers within the run.",
        "**The island id** — rn_global − rn_local is CONSTANT inside a run and changes at every gap: the arithmetic trick that turns \\"consecutive-ness\\" into a GROUP BY key.",
        "**Fold the islands** — GROUP BY the island id: per-run MIN/MAX/COUNT answers \\"how long was the streak, when did it start\\" — the analysis falls out of the id, not from more windowing.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"Gaps-and-islands needs a procedural loop — check each row against the previous, start a new group when it breaks.\\"",
      truth: "That loop, written as a cursor, is the pre-window idiom — and it's slower, unparallelizable, and stateful. The two-row-number subtraction IS the loop, unfolded: the engine does the walk in one sort-plus-pass, and the \\"state\\" is just the difference of two sequences.",
    },
    {
      kind: "edge",
      items: [
        { c: "Sessionization threshold semantics", r: "\\"Gap > 30 min starts a session\\" vs \\"≥ 30\\": exactly-30-minute gaps are the contract edge — write the comparison deliberately and test it with a synthetic exactly-at-threshold pair." },
        { c: "YoY with sparse months", r: "LAG(revenue, 12) over OBSERVED months pairs this June with the 12th PRIOR OBSERVED month — not last June. The month spine (lesson 49) plus PARTITION BY year keeps the calendar honest." },
        { c: "Islands on ties", r: "Two same-status rows sharing a timestamp: the id tiebreak inside BOTH row numbers keeps the island walk deterministic. Tiebreaks are load-bearing in every pattern here." },
        { c: "Mixed-grain boards", r: "The final board mixes order-grain stamps with month-grain ladders: stage each grain in its own CTE, join on the shared key. One query, two grains, no fan-out — the course's grain discipline, now in window form." },
      ],
    },`);
