// Deep-layer batch 2: lessons 29-34 (M5 Scalar & Window Toolkit, M6 Expert Clinic).
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

// ---------------- Lesson 29 — Text & type toolkit ----------------
D(29, `    {
      kind: "mind",
      text: "Scalar functions are **row-local machines**: no other rows involved, no stages, no grain — one value in, one value out, applied per row. That makes them the safest tools in SQL and the easiest to reason about: whatever the row had, the function rewrites it in place. The discipline they demand is *type honesty*: SUBSTR sees text, arithmetic sees numbers, and the seed's money-in-cents design exists so you never ask floats to be exact. The second discipline is **NULL physics** — almost every scalar function returns NULL when fed NULL. LENGTH(NULL) is NULL, not 0; UPPER(NULL) is NULL. NULL is not an empty string, not zero, not an opinion: it is \\"unknown\\", and unknown propagates. COALESCE is the one sanctioned way to decide what unknown becomes.",
    },
    {
      kind: "engine",
      title: "you run SELECT UPPER(SUBSTR(name, 1, INSTR(name, ' ') - 1)) FROM customers",
      steps: [
        "**Innermost first** — INSTR finds the space's position per name; SUBSTR cuts to just before it; UPPER capitalizes. Functions compose inside-out like arithmetic.",
        "**Per-row cost** — the engine evaluates the chain for each of the 16 customer rows. No indexes apply (see lesson 64): functions on columns are invisible to the planner's b-trees.",
        "**NULL short-circuit** — had any name been NULL, INSTR(NULL, ' ') is NULL, SUBSTR(NULL, …) is NULL, UPPER(NULL) is NULL — the whole chain returns NULL without erroring.",
        "**Result type** — everything here is TEXT. Mixing a numeric into a text context makes SQLite coerce (and often hides a bug); CAST is how you state intent instead of hoping.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"An empty string and NULL are the same thing — both mean 'nothing here'.\\"",
      truth: "An empty string is a **known value of zero length**; NULL is **absence of a value**. LENGTH('') is 0, LENGTH(NULL) is NULL. Filters behave differently too: WHERE col = '' matches empties but never NULLs. Conflating them corrupts both counts and joins.",
    },
    {
      kind: "edge",
      items: [
        { c: "CAST(199.99 AS INTEGER)", r: "SQLite **truncates toward zero** → 199, it does not round. Rounding is ROUND()'s job; CAST is a type change, not an arithmetic opinion." },
        { c: "SUBSTR past the end", r: "SUBSTR('ab', 5, 2) returns '' (empty), not an error. Text functions are forgiving about boundaries — which is exactly why silent-empty bugs survive." },
        { c: "INSTR finds nothing", r: "INSTR returns 0 when absent; SUBSTR(name, 1, 0-1) = SUBSTR(name, 1, -1) then slices weirdly. Guard with a CASE when the needle may be missing." },
        { c: "COALESCE with all-NULL inputs", r: "COALESCE(NULL, NULL) is NULL — the promise is 'first NON-NULL', not 'never NULL'. Give the last argument a real default: COALESCE(nick, name, '?')." },
      ],
    },`);

// ---------------- Lesson 30 — Dates & buckets ----------------
D(30, `    {
      kind: "mind",
      text: "Dates in this course are **ISO-8601 text** — '2024-01-15' — and that is a feature: text sorts chronologically, SUBSTR slices it into year ('2024-01-15' → '2024'), month ('2024-01'), and day buckets, and SQLite's date functions read it natively. Bucketing time is the analyst's core move: revenue is a number, but *revenue per month* is a decision — and the bucket choice (day? month? rolling 7?) IS the analysis. The seed gives 14 months of history across 84 distinct order days, so day-grain views are sparse and month-grain views are honest. When a date question feels hard, the failure is almost always the grain: name the bucket before you write the GROUP BY.",
    },
    {
      kind: "engine",
      title: "you run SELECT SUBSTR(created_at, 1, 7) AS month, SUM(total) FROM orders GROUP BY month",
      steps: [
        "**Slice** — SUBSTR reads the first 7 characters of each created_at: '2024-01-15 09:…' becomes '2024-01'. Pure text work, no calendar math yet.",
        "**Fold** — GROUP BY the slice collapses 103 timestamped rows into 14 month rows; each timestamp belongs to exactly one bucket because the slice is deterministic.",
        "**Compare honestly** — date('2024-01-31', '+1 month') shows the engine's calendar brain: it does NOT produce '2024-02-31' (no such day); it spills to '2024-03-02'. Date arithmetic respects the calendar, string slicing does not — know which one you're using.",
        "**Order** — the ISO text sorts chronologically for free. The day you start formatting dates ('Jan 2024') in the DATA, sorting dies; format in the presentation layer, keep the column raw.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"Dates are numbers, so created_at = '2024-01-15' and '2024-1-15' are the same day.\\"",
      truth: "As TEXT they are different strings — and only the **ISO format sorts and compares correctly**. '2024-1-5' sorts after '2024-11-01' textually. The zero-padded ISO shape is not a style choice; it is the storage contract that makes text dates behave.",
    },
    {
      kind: "edge",
      items: [
        { c: "Month-end + 1 month", r: "Jan 31 + 1 month → Feb 31 doesn't exist → the engine lands on Mar 2 (overflow spills). Month-end arithmetic needs deliberate clamping if you want Feb 28/29 semantics." },
        { c: "julianday differences", r: "julianday('2024-01-16') - julianday('2024-01-15') = 1.0 exactly — the honest day-gap tool. Integer days, fractional parts for times; the aging ladders of module 9 are built on it." },
        { c: "Timestamps with time parts", r: "'2024-01-15 09:30:00' still slices by SUBSTR for buckets, but equality tests ('2024-01-15' = created_at) fail — the time suffix. Use ranges: >= day AND < day+1." },
        { c: "Leap-year math", r: "date('2024-02-29', '+1 year') = '2025-03-01' — the spill rule again. Calendar edge cases are not bugs to fix; they are semantics to document." },
      ],
    },`);

// ---------------- Lesson 31 — Windows I ----------------
D(31, `    {
      kind: "mind",
      text: "A window function is an aggregate that **refuses to collapse**. GROUP BY trades detail for the summary — 103 orders become 4 status rows; a window OVER the same data keeps all 103 rows AND adds the summary as a new column. The OVER clause defines a *stage* over the surviving rows: PARTITION BY draws stage boundaries, ORDER BY sequences rows inside the stage, and the function computes per row against its stage-mates. This is the shift from \\"one answer per bucket\\" to \\"one answer per row, aware of its bucket\\" — the entire family (rank, offsets, frames, distribution) is the same machinery with different functions bolted on.",
    },
    {
      kind: "engine",
      title: "you run SELECT id, status, RANK() OVER (PARTITION BY status ORDER BY total DESC) FROM orders",
      steps: [
        "**Timing** — the window pass runs AFTER WHERE and GROUP BY: it sees the surviving rows, not the tables. A WHERE can never filter on a window's output — that's what the outer-query/CTE layer is for.",
        "**Stage cutting** — PARTITION BY status deals the 103 rows into four stages: 52 delivered, 30 shipped, 14 pending, 7 cancelled. Every function restarts at each boundary.",
        "**Sequencing** — inside each stage, ORDER BY total DESC lines rows up; RANK reads the line: ties share a rank and skip after (1, 1, 3…), ROW_NUMBER never ties (1, 2, 3…), DENSE_RANK shares without skipping.",
        "**Stamping** — each row keeps its own data plus its stage rank; nothing collapsed. The output is still 103 rows — the leaderboard now lives alongside the facts.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"ROW_NUMBER, RANK and DENSE_RANK are interchangeable — they all number rows.\\"",
      truth: "They encode **three different tie contracts**: ROW_NUMBER breaks ties arbitrarily (unstable without a deterministic tiebreak), RANK skips after ties, DENSE_RANK neither skips nor repeats gaps. Picking by habit instead of contract is how \\"the top-3 query returns 4 rows\\" bug reports start.",
    },
    {
      kind: "edge",
      items: [
        { c: "Non-deterministic tiebreaks", r: "OVER (ORDER BY total) with tied totals can rank those ties differently every run — page 2 of a paginated leaderboard may repeat or skip a row. Always add the id as the final tiebreak." },
        { c: "Window in WHERE", r: "WHERE RANK() OVER … is a syntax error by design — windows run after WHERE. Filter on ranks via a CTE or subquery layer: number inside, filter outside." },
        { c: "Empty partition", r: "A stage with one row gives every ranking function 1 — but RANK on an empty OVER () across the whole set still numbers from 1. Edge: your \\"rank 2\\" can simply not exist in small stages." },
        { c: "PARTITION BY a NULL", r: "NULLs form their OWN stage — they don't vanish like in joins or comparisons. Five NULL-status rows would produce a coherent NULL-stage leaderboard all by themselves." },
      ],
    },`);

// ---------------- Lesson 32 — Windows II ----------------
D(32, `    {
      kind: "mind",
      text: "Offset and running windows answer **\\"relative to where I stand\\"**: LAG peeks backward, LEAD forward, and an ORDER-BY'd OVER turns any SUM into a snowball. The order you give OVER is not cosmetic — it IS the timeline. Change the sort spec and every \\"previous\\" and \\"running\\" value re-wires silently. That sensitivity is the family's power and its hazard: running totals demand chronological order (tiebreak by id for same-timestamp rows), per-entity resets demand the PARTITION, and forgetting either yields a number that runs or resets wrongly *without any error*. Windows fail loudly in syntax, silently in semantics — the sort spec is where the silence lives.",
    },
    {
      kind: "engine",
      title: "you run SELECT customer_id, created_at, total, SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS run FROM orders",
      steps: [
        "**Stage + timeline** — customers are stages; created_at-then-id is each stage's timeline. The engine sorts each stage once, then walks it.",
        "**Running accumulation** — with ORDER BY present, SUM's default frame ends at the CURRENT ROW: row k's sum covers stage rows 1..k. That implicit frame is why ORDER BY alone turns summary into snowball.",
        "**Offset lookups** — LAG(created_at) reads the sorted neighbor one back; the FIRST row of each stage has no neighbor and yields NULL — the honest \\"nothing before this\\".",
        "**Reset semantics** — crossing a partition boundary restarts both the accumulation and the neighbor: customer 2's first row does not inherit customer 1's snowball or NULLs from customer 1's last row.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"Running totals need a self-join or a subquery with a correlated sum.\\"",
      truth: "The pre-window idiom was exactly that — O(n²) and unreadable. SUM OVER (ORDER BY …) expresses intent in one line and the engine runs it in one sort plus one pass. The correlated-subquery version still works; it's just the horse-drawn carriage.",
    },
    {
      kind: "edge",
      items: [
        { c: "Missing tiebreak in the timeline", r: "Two orders on the same timestamp: LAG may pick either, the running sum folds them in arbitrary order, paginations shift run to run. (created_at, id) is the deterministic spine." },
        { c: "LEAD on the last row", r: "Symmetric to LAG's first-row NULL: the final row's LEAD is NULL. Deltas computed with LEAD lose their last data point by construction — plan the report around it." },
        { c: "LAG without OVER's ORDER BY", r: "LAG(revenue) OVER () is an error — \\"previous\\" is meaningless without a sequence. The error is the engine doing you a favor." },
        { c: "PARTITION BY NULL keys", r: "Rows with NULL customer_id form one stage and accumulate together — fine if NULL means \\"one unknown customer\\", wrong if NULLs are unrelated. COALESCE the key or pre-filter." },
      ],
    },`);

// ---------------- Lesson 33 — String aggregation & grand totals ----------------
D(33, `    {
      kind: "mind",
      text: "GROUP_CONCAT is the **reverse telescope**: many rows fold into one text value — the only aggregate in the core toolkit whose output is not a number. It answers the \\"show me the list\\" report: which categories does this supplier feed, which products sat in that order. Its two disciplines: the fold **loses order guarantees** (SQLite concatenates in scan order unless you stage rows in a sorted subquery first), and the fold **needs a delimiter you chose deliberately** — commas inside data wreck naive joins. Pair it with the grand-total stack (aggregate OVER ()) and you get the report pattern: detail rows, subtotal rows, one total row — one query, no spreadsheet handiwork.",
    },
    {
      kind: "engine",
      title: "you run SELECT supplier_id, GROUP_CONCAT(name, ', ') FROM products GROUP BY supplier_id",
      steps: [
        "**Group scan** — 16 products fold into 6 supplier buckets; the aggregate accumulates a text buffer per bucket, appending ', '-separated names as rows arrive.",
        "**Order caveat** — the buffer's order follows arrival, not intent. Wrap the source in ORDER BY (a sorted subquery/CTE) when the list's order is part of the deliverable.",
        "**Grand-total layer** — COUNT(*) OVER () alongside GROUP_CONCAT stamps every row with the whole-set size: detail and summary in one result set, no UNION needed.",
        "**Output type** — one TEXT cell per group; long lists hit length limits in some engines (SQLite is generous, Postgres's string_agg too, but report UIs are not). Truncate deliberately.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"GROUP_CONCAT preserves row order — it concatenates alphabetically (or by id).\\"",
      truth: "The standard provides **no order guarantee**. SQLite usually arrives in scan/rowid order and looks stable — until a plan change reorders the scan and your report's lists shuffle. Deterministic lists need a sorted stage feeding the fold.",
    },
    {
      kind: "edge",
      items: [
        { c: "Delimiters inside the data", r: "Product names containing ', ' split ambiguously downstream. Choose delimiters that cannot occur (' | ') or export structured formats instead of inventing syntax." },
        { c: "NULL members", r: "GROUP_CONCAT skips NULLs entirely — they neither appear nor leave a placeholder. A list of five rows with two NULLs reports three entries; is that the count your consumer expects?" },
        { c: "Empty groups can't exist", r: "Groups form FROM rows, so GROUP_CONCAT never returns NULL for a formed group (only for an all-NULL input column in some engines). Edge: distinguishing \\"no members\\" from \\"no group\\" matters in reports." },
        { c: "The 2× fan-out trap", r: "GROUP_CONCAT after a join inherits the join's fan-out: joined-to-items, each product name repeats per line. Fold at the right grain or the list duplicates — same disease as lesson 15, new symptom." },
      ],
    },`);

// ---------------- Lesson 34 — Every join shape ----------------
D(34, `    {
      kind: "mind",
      text: "INNER and LEFT cover 95% of work; the remaining shapes exist for the **remaining 5% of questions**. RIGHT JOIN is LEFT JOIN with the tables swapped (preserve the right population) — SQLite makes you rewrite it as a LEFT, which is why left-first habit matters. FULL OUTER preserves BOTH populations, each padding the other's absences — the \\"show me everything and mark who's missing\\" audit. CROSS JOIN is the deliberate explosion: every pair, no ON clause, n×m rows — 16 products × 6 suppliers = 96 combos, the honest backbone for grid reports and price-matrix comparisons. Non-equi joins (ON a.x BETWEEN b.lo AND b.hi) generalize the machinery beyond equality — and inherit fan-out in its most dramatic form.",
    },
    {
      kind: "engine",
      title: "you run SELECT p.name, s.name FROM products p CROSS JOIN suppliers s",
      steps: [
        "**No ON, no pruning** — the nested loop emits every combination: 16 outer rows × 6 inner rows = 96. The join IS the product; the filter would come later, in WHERE, if wanted.",
        "**RIGHT by rewrite** — SQLite's RIGHT JOIN support arrived late; the portable form flips the tables: A RIGHT JOIN B ≡ B LEFT JOIN A. Reading right-joins as \\"swapped lefts\\" keeps one mental model.",
        "**FULL OUTER mechanics** — match pairs emit once; unmatched lefts pad right columns with NULL; unmatched rights pad left columns. Two pad sources, one result — the audit's microscope.",
        "**Non-equi cost** — range conditions can't use hash probes: nested loops with per-pair tests, 251 × 103 at worst. Bounds discipline (narrowing ranges, staging) keeps it survivable.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"FULL OUTER JOIN and UNION of two LEFT JOINs are the same.\\"",
      truth: "The UNION rewrite (A LEFT JOIN B UNION A RIGHT JOIN B) approximates it but **can drop matched pairs' duplicates** or double them depending on UNION vs UNION ALL — correctness depends on the data, which is exactly what you don't want in an edge-case tool. Use the real FULL OUTER where the engine has one; here, stage it explicitly.",
    },
    {
      kind: "edge",
      items: [
        { c: "Accidental cross join", r: "Comma-FROM with a WHERE typo, or an ON that's always true (1 = 1 pasted in) — the result set silently multiplies: 251 × 103 = 25,853 rows here. Row-count sanity checks exist for this." },
        { c: "CROSS JOIN as a generator", r: "The legit use: months × regions grids so empty cells appear as 0 instead of vanishing. 14 months × 4 regions = 56 spine rows — the LEFT JOIN onto facts fills the rest." },
        { c: "Non-equi fan-out", r: "A BETWEEN join where one row's range swallows 50 rows yields 50 output rows from 1 — sums inflate exactly like lesson 15's trap, times fifty. Range joins demand narrow, non-overlapping bounds." },
        { c: "RIGHT JOIN readability", r: "Right-joins read backwards to most humans; reviewers mis-eyetrack them. Rewrite as LEFT — same plan, same rows, fewer confused code reviews." },
      ],
    },`);
