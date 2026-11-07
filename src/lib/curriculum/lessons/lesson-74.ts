import type { Lesson } from "../types";
import { mcqBank, probBankX } from "./banks/l64-util";
import { ROWS as MCQS } from "./banks/l74-mcqs";
import { ROWS as PROBS } from "./banks/l74-problems";

export const lesson74: Lesson = {
  id: "lesson-74",
  num: 74,
  title: "Indexing the firehose — measure, design, verify",
  blurb:
    "The lesson-73 sweep becomes the control group: every index decision runs the loop — read the plan, create the smallest tree that flips it, re-read, keep or drop — with covering scans, composite order, expression trees for canonical forms and partial indexes for slices, all on a million rows where the write tax is finally visible",
  minutes: 24,
  blocks: [
    {
      kind: "p",
      text: "Lesson 73 priced the sweep: ~13 ms to count a million rows, ~45 ms to filter them, ~470 ms to fold them. This lesson spends trees against those prices — each one bought with the same loop lesson 64 taught on 103 rows, now run at a scale where every decision is measurable and every mistake is expensive. The rule hasn't changed: **read the plan, create the smallest index that flips it, re-read the plan, keep it only if it earned a named customer.** What changed is the stakes: a tree over 1,010,317 rows is real disk, real build time, and a real tax on every future INSERT.",
    },
    { kind: "diagram", figure: "l74-index-economics" },
    { kind: "h", text: "The flip, witnessed" },
    {
      kind: "code",
      caption: "One CREATE INDEX, two plans — the lesson's whole argument",
      sql: `EXPLAIN QUERY PLAN SELECT COUNT(*) FROM events_scale WHERE user_id = 4321;
-- SCAN events_scale                              ← lesson 73's 45 ms sweep
CREATE INDEX idx_scale_user ON events_scale(user_id);
EXPLAIN QUERY PLAN SELECT COUNT(*) FROM events_scale WHERE user_id = 4321;
-- SEARCH events_scale USING COVERING INDEX idx_scale_user (user_id=?)
--                                                ← descent + 198 entries, table untouched`,
    },
    {
      kind: "bullets",
      items: [
        "**COVERING at scale is free money for counts.** Every index entry carries the rowid, so COUNT needs no table fetch at all — the tree alone answers. The point filter's plan flips twice: SCAN→SEARCH (access method) and table→index-only (payload).",
        "**The composite (user_id, event_ts) buys the sort.** After descending to user 4321, entries sit in event_ts order — `ORDER BY event_ts DESC LIMIT 3` walks the tree's tail instead of sorting a subset. The plan's USE TEMP B-TREE line simply disappears.",
        "**The same composite humbles the date-only filter.** `WHERE event_ts >= '2025-06-01'` can't SEARCH a tree sorted by user_id first (the leftmost rule) — but the plan now shows SCAN of the *index*, not the table: a smaller sweep. Progress without a flip, and both verdicts are honest.",
      ],
    },
    { kind: "h", text: "Three trees for three shapes" },
    {
      kind: "table",
      headers: ["query shape", "tree that serves it", "plan after"],
      rows: [
        ["`WHERE user_id = ?` (point filter)", "`(user_id)` or the composite", "`SEARCH … USING COVERING INDEX (user_id=?)`"],
        ["`WHERE user_id = ? ORDER BY event_ts`", "`(user_id, event_ts)` — equality first, sort last", "`SEARCH … (user_id=?)`, no temp b-tree"],
        ["`GROUP BY LOWER(TRIM(action))` (census)", "expression index on `LOWER(TRIM(action))`", "`SCAN … USING INDEX` — the ordered walk IS the grouping"],
        ["`WHERE user_id >= 9000` (bots)", "partial index `WHERE user_id >= 9000`", "`SEARCH … USING COVERING INDEX (user_id>?)`"],
        ["`WHERE user_id < 9000` (humans)", "none — the partial tree holds only bots", "`SCAN events_scale` — the complement can't use the slice"],
      ],
      caption: "Match the tree to the shape — the plan after each CREATE is the receipt",
    },
    {
      kind: "bullets",
      items: [
        "**Expression indexes canonicalize at write time.** The ten-spelling action column folds to five values inside the tree itself, so the census's GROUP BY reads pre-folded order — the temp b-tree's work happened once, at INSERT, instead of every query.",
        "**Partial indexes are portfolios, not features.** The bot slice costs a per-INSERT predicate test and a 9,901-entry tree; in exchange, bot probes descend. The complement (humans) gets nothing — partial trees answer only for the rows they contain.",
        "**ANALYZE makes the planner's arithmetic public.** After indexing, sqlite_stat1 reports `1010317 201` — a million rows, ≈201 rows per user probe (1,010,317 ÷ 5,040 distinct ids). The estimate matches the measured 198 for user 4321; honest stats make honest plans.",
      ],
    },
    {
      kind: "warn",
      text: "The write tax is not a metaphor. Every secondary index is a second b-tree maintained on EVERY INSERT: with two indexes, the firehose's million-row load touches three trees. A full index build reads and sorts all 1,010,317 rows once; after that, maintenance is forever. This is why the loop ends in keep-or-drop: an index without a named customer is pure standing cost — and 'we might query it someday' is not a customer.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres has the same shapes with more switches: partial indexes with arbitrary predicates, expression indexes on any IMMUTABLE function, INCLUDE for wider covering, and CONCURRENTLY builds that don't block writes. CREATE INDEX ANALYZE isn't bundled — run ANALYZE after the build.",
    },
    {
      kind: "dialect",
      db: "snowflake",
      text: "Snowflake mostly refuses this whole lesson: no secondary indexes — micro-partition pruning and cluster keys do the job, and the 'index' decision becomes 'which column to cluster on'. The loop survives; the mechanism is storage layout instead of trees.",
    },
    {
      kind: "dialect",
      db: "bigquery",
      text: "BigQuery's answer is partitioning + clustering keys, plus search indexes for point lookups. The pricing model (bytes scanned per column) makes the covering-index concept universal even where the b-tree isn't: read only the columns the query names.",
    },
    {
      kind: "tip",
      text: "The loop at any scale: plan → create the smallest flipping tree → plan → confirm → name its customer or drop it. On the firehose that's five minutes; at a billion rows it's the same five decisions with bigger numbers — which is why you practice it where the feedback is instant.",
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "Back to the library, one floor up. The card catalog you add costs real money to install (the build: read and sort every book once) and real staff time forever (every new book updates every catalog). A catalog sorted by author helps author lookups and — because it's a physical sequence — author-then-date lookups too; that's the composite. A catalog of index cards PHOTO COPIED with the answers on them (covering) means you never walk to the shelves. A catalog for ONE wing only (partial) is cheap but answers only about that wing. And the librarian's ledger (sqlite_stat1) records how thick each section is — ANALYZE updates the ledger so the librarian stops guessing.",
    },
    {
      kind: "engine",
      title: "What CREATE INDEX on 1,010,317 rows actually does",
      steps: [
        "Scan the table once, extracting (key, rowid) per row — user_id with its 1,010,317 rowids.",
        "Sort the pairs by key (external merge sort if memory is short) — the expensive step, paid once.",
        "Write the sorted pairs into a fresh b-tree: leaf pages dense with entries, interior pages as the sparse map above.",
        "Register the tree in sqlite_master; from now on, every INSERT also computes the key and splits pages as needed.",
        "Planner picks it up on the next EXPLAIN — with or without ANALYZE, though ANALYZE's measured selectivity makes its estimates honest.",
      ],
    },
    {
      kind: "myth",
      myth: "The planner didn't use my index — something is broken.",
      truth:
        "The planner declines trees on the arithmetic: a range over 98% of rows via random index fetches loses to one sequential sweep (the human count keeps its SCAN even with idx_scale_user present), and a predicate that wraps the column in a function can't even SEE the order. Read the plan, fix the predicate shape or accept the sweep.",
    },
    {
      kind: "myth",
      myth: "More indexes = faster database.",
      truth:
        "Faster for the queries they serve, slower for every write and every page-cache byte they occupy. The firehose with ten indexes inserts ten times the maintenance work — and most of those trees would never be probed. The keep-or-drop step of the loop is where databases stay fast.",
    },
    {
      kind: "edge",
      items: [
        { c: "CREATE INDEX ran twice — the second failed", r: "Good: SQLite refuses duplicate index names. The sandbox's rollback makes each attempt fresh, but in production the same statement errors instead of 'updating' — DROP INDEX first if the definition must change." },
        { c: "The expression index and ANALYZE disagree", r: "Expression trees need SQLite 3.9+, and their sqlite_stat1 rows carry the expression, not a column name. Old tooling that parses sqlite_stat1 by column breaks — parse by idx, or don't parse." },
        { c: "The partial index exists but the bot count still scans", r: "The probe must be a subset of the partial predicate: user_id >= 9000 matches the slice; user_id > 8999 does too, but a probe with an OR arm or a function-wrapped column won't. The partial tree serves only queries the planner can PROVE fit inside the slice." },
        { c: "Two composites start with the same column", r: "(user_id) is redundant next to (user_id, event_ts) for equality probes — the composite's prefix serves them. The single-column tree's only edge is size; keep it only if the composite's width hurts the write path more than the extra tree does." },
        { c: "ANALYZE made a query SLOWER", r: "It can — honest statistics sometimes change the plan from a lucky guess to a measured (worse) choice. The loop absorbs this: re-read the plan, compare the clock, and if the new plan loses, the discussion is about statistics, not about the index." },
      ],
    },
  ],
  mcqs: mcqBank("l74", MCQS),
  problems: probBankX("l74", PROBS),
  takeaway:
    "Every tree is a purchase: the plan before names the cost you're paying, the smallest flipping index buys it back, the plan after is the receipt — covering counts, composites serve their sorts, expression trees canonicalize, partial slices answer only their own complement questions — and every tree you keep pays a write tax on every INSERT forever.",
};
