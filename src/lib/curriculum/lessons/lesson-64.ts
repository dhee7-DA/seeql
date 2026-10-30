import type { Lesson } from "../types";
import { mcqBank, probBankX } from "./banks/l64-util";
import { ROWS as MCQS } from "./banks/l64-mcqs";
import { ROWS as PROBS } from "./banks/l64-problems";

export const lesson64: Lesson = {
  id: "lesson-64",
  num: 64,
  title: "Query Performance — designing for the plan",
  blurb:
    "The discipline beyond CREATE INDEX: reading EXPLAIN QUERY PLAN like a contract, selectivity and the planner's verdict, composite and covering design, the index-hostile patterns that silently scan, and the measure → design → verify loop that keeps every index earning its keep",
  minutes: 18,
  blocks: [
    {
      kind: "p",
      text: "Lesson 48 gave you the two moves — CREATE INDEX, read EXPLAIN QUERY PLAN. This lesson makes them a **discipline**. Start with the storefront's dirty secret: the schema has **zero** secondary indexes. Every lookup that isn't by id sweeps. It feels fine — 103 rows are fast for free — and that feeling is exactly what ships to production at ten million rows. The module's habit is the fix: every hot query gets its plan read, every index gets justified, and every change gets verified.",
    },
    { kind: "h", text: "The plan is a contract, not a suggestion" },
    {
      kind: "code",
      caption: "Four verdicts the planner can hand you",
      sql: `EXPLAIN QUERY PLAN SELECT * FROM orders WHERE id = 42;
-- SEARCH orders USING INTEGER PRIMARY KEY (rowid=?)   ← the free one
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'shipped';
-- SCAN orders                                          ← the sweep
EXPLAIN QUERY PLAN SELECT id, total FROM orders ORDER BY total DESC LIMIT 3;
-- SCAN orders + USE TEMP B-TREE FOR ORDER BY           ← sweep + sort
EXPLAIN QUERY PLAN SELECT SUBSTR(created_at,1,7) AS m, COUNT(*) FROM orders GROUP BY m;
-- SCAN orders + USE TEMP B-TREE FOR GROUP BY           ← sweep + group-sort`,
    },
    {
      kind: "bullets",
      items: [
        "**SEARCH** is a descent — the engine jumps through a sorted structure to the rows it wants. **SCAN** is a sweep — every row read, tested, mostly discarded. **USE TEMP B-TREE** means the engine had to build a temporary sorted structure to sort or group — real work, paid on every run.",
        "The plan is per-query and current: the same query can flip between SEARCH and SCAN as indexes, data size, and statistics change. That's not instability — it's the planner doing arithmetic on what exists **today**.",
        "Plans don't show milliseconds. A SCAN on a small table, or over a filter that matches half the rows, may be the *cheapest* option. The plan tells you the shape; judgment decides whether the shape deserves it.",
      ],
    },
    { kind: "diagram", figure: "l64-plan-tree" },
    { kind: "h", text: "Selectivity — the planner's whole verdict in one idea" },
    {
      kind: "table",
      headers: ["Column", "Distinct values in 103 orders", "Rows per typical probe", "Index verdict"],
      rows: [
        ["`id`", "103 (it's the rowid)", "1", "already indexed — free"],
        ["`customer_id`", "16", "≈ 6 (worst 24)", "good — the app's hottest filter"],
        ["`created_at`", "84 order days", "≈ 1–2 per day", "good — dates are near-unique"],
        ["`status`", "4", "7–52", "weak alone — useful combined or for rare values"],
      ],
      caption: "Selectivity = distinct values ÷ rows. The closer a probe gets to one row, the more an index earns",
    },
    {
      kind: "bullets",
      items: [
        "A probe that matches **half the table** through an index pays: descend, then fetch half the table in random order — worse than one clean sweep. This is why the planner ignores low-selectivity indexes; it isn't broken, it's doing the math.",
        "The exception is **rare-value filters**: if 1% of rows carry a flag and that filter runs constantly, an index (or a partial index — SQLite 3.8+, a Postgres staple) turns the probe into a handful of fetches.",
        "`ANALYZE` makes the planner's estimates honest: it measures rows and distinct counts into `sqlite_stat1`, and choices stop being guesses. Run it once after real data lands; re-run when the data's shape changes.",
      ],
    },
    { kind: "h", text: "Designing the index: order, covering, sorts" },
    {
      kind: "steps",
      items: [
        "**Equality columns first, range last.** `WHERE customer_id = ? AND created_at >= ?` wants (customer_id, created_at). A range leftmost strands every column after it — inside a date window, customer_id can't prune anything.",
        "**Add the SELECT list to make it covering.** The board's `SELECT status, total … WHERE status = ?` covered by (status, total) prints SCAN orders USING COVERING INDEX — the table is never touched. Wider indexes cost more writes; spend width only on the hottest queries.",
        "**Sorts and groups can be served too.** An index on the ORDER BY column reads out pre-sorted — the temp b-tree disappears. DESC is free: the same tree is walked backwards.",
      ],
    },
    {
      kind: "code",
      caption: "One dashboard, one composite — three clauses served",
      sql: `CREATE INDEX idx_orders_customer_created
  ON orders(customer_id, created_at);

-- WHERE customer_id = 1                     → SEARCH (prefix 1)
-- WHERE customer_id = 1 AND created_at >= … → SEARCH (both columns)
-- SELECT customer_id, created_at …          → COVERING (nothing to fetch)`,
    },
    { kind: "diagram", figure: "l64-seek-vs-scan" },
    { kind: "h", text: "The index-hostile patterns — where scans sneak back" },
    {
      kind: "table",
      headers: ["Shape", "Why it can't use the index", "The fix"],
      rows: [
        ["`WHERE SUBSTR(created_at,1,7) = '2024-07'`", "function wraps the column — the tree is sorted by full values, not slices", "bare-column half-open range: `>= '2024-07-01' AND < '2024-08-01'`"],
        ["`WHERE name LIKE '%a%'`", "leading wildcard — no entry point into the sorted tree", "prefix seeks (`'A%'`) work; containment needs full-text or design change"],
        ["`WHERE status = ? OR customer_id = ?`", "each arm wants a different index; one table access uses one", "same-column OR → `IN`; cross-column OR → UNION ALL of two probes"],
        ["`WHERE price * 1.2 > 100`", "expression on the column again", "compare the bare column: `price > 100 / 1.2`"],
      ],
      caption: "The rule under all four: the bare column against a constant keeps the sort order visible",
    },
    {
      kind: "warn",
      text: "Every secondary index is a separate b-tree maintained on every write: one INSERT into orders with three indexes touches four trees; updating a status moves an entry inside the status tree. Indexes are standing costs — the discipline closes the loop by re-running EXPLAIN after each CREATE (an index that doesn't flip the plan is pure write tax) and by dropping indexes nothing uses.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "EXPLAIN (without QUERY PLAN) prints the tree with estimated costs, and EXPLAIN ANALYZE actually runs it with real row counts and milliseconds. Postgres adds partial indexes with the same WHERE syntax, covering indexes via INCLUDE, and a planner that chooses between index scans, bitmap scans and seq scans — same selectivity math underneath.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "EXPLAIN's rows carry type (ALL = scan, ref/range = search), key (the chosen index) and rows (the estimate). MySQL 8 adds EXPLAIN ANALYZE. Composite rules match: leftmost prefix, equality before range, and covering confirmed by Extra: Using index.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite supports expression indexes — CREATE INDEX ON orders(SUBSTR(created_at,1,7)) gives the monthly bucket its own sorted tree when you can't rewrite the query. ANALYZE fills sqlite_stat1; VACUUM reclaims space but has never made a predicate index-usable.",
    },
    {
      kind: "tip",
      text: "The loop: run EXPLAIN QUERY PLAN on the hot query → read the verdict → design the smallest index that flips SCAN to SEARCH (equality first, range last, covering only if it's hot) → re-run EXPLAIN and confirm the plan changed → accept the write cost knowingly. Two statements and one look, on day one and on ten million rows.",
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "Think of the database as a library. The table is the books in purchase order. A SCAN is reading every spine. An index is the card catalog: sorted by some field, each card pointing at a shelf position. A composite index is a catalog sorted by surname then first name — you can find 'Smith, J' fast, but 'everyone named John' means reading the whole catalog. A covering index is a mini-library of pamphlets: if the pamphlet has everything you asked for, you never walk to the shelves. And every new catalog must be updated every time a book moves — that's the write tax.",
    },
    {
      kind: "engine",
      title: "What the planner actually weighs",
      steps: [
        "Enumerate access paths: for each table in the query — the rowid b-tree, every secondary index, or a full scan.",
        "Estimate rows: from sqlite_stat1 (after ANALYZE) or built-in heuristics — distinct values, selectivity of each predicate, range widths.",
        "Price each path: seeks and page fetches for searches, sequential pages for scans, plus a temp b-tree if a sort/group can't be served by the chosen order.",
        "Choose the join order: nested loops — the inner table's access method matters most, which is why an index on order_items(order_id) can flip a 251-row outer scan into 103 inner probes.",
        "Emit the plan you read with EXPLAIN QUERY PLAN — and re-emit it fresh every time the schema or statistics change.",
      ],
    },
    {
      kind: "myth",
      myth: "Adding an index always makes the query faster.",
      truth:
        "Only if the planner picks it — and it picks by selectivity. A status index probing 'delivered' (52 of 103 rows) can lose to the scan, and the plan will say so. The index you're not using is still costing writes: measure the plan, don't assume the win.",
    },
    {
      kind: "myth",
      myth: "SCAN in the plan means the query is broken.",
      truth:
        "SCAN is a fact about access method, not a verdict on speed. Covering a tiny table, matching most rows, or feeding an aggregate over everything — all legitimately scan. The judgment is whether the shape is hot, big, and selective enough to deserve a tree.",
    },
    {
      kind: "edge",
      items: [
        { c: "Two indexes could serve the filter", r: "The planner picks ONE per table access — usually the more selective. Indexes compete; they don't combine (beyond SQLite's rare OR-optimization)." },
        { c: "The query is fine in dev, dies in prod", r: "Plans are data-dependent. 103 rows scan happily; ten million don't. Read EXPLAIN in an environment with production-shaped data before calling it done." },
        { c: "Index added, plan unchanged", r: "The planner kept the scan — selectivity or shape. Re-check the predicate for functions/wildcards, and run ANALYZE so the planner knows the index exists with real numbers." },
        { c: "ORDER BY still shows a temp b-tree", r: "The index must match the sort's columns AND directions, and survive your WHERE — a composite whose leftmost column isn't fixed by a constant can't serve the sort." },
        { c: "UPDATE of an unindexed column felt fast, status felt slow", r: "Exactly backwards from intuition: only indexed columns move index entries. Status has an index; the free-text note doesn't." },
      ],
    },
  ],
  mcqs: mcqBank("l64", MCQS),
  problems: probBankX("l64", PROBS),
  takeaway:
    "The plan is the contract: SEARCH beats SCAN only when selectivity says so, composite indexes put equality first and ranges last, covering indexes buy zero table fetches at a write-price, and every index-hostile pattern — functions, leading wildcards, cross-column ORs — is one rewrite away from a descent.",
};
