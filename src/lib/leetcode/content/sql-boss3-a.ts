// Deep-dives — the BOSS LEVEL III band, file A of B (2 Hard, 1 Medium).
// Original recursive/graph problems authored for this app: bill-of-materials
// leaf-demand explosion, BFS min-hop flight reachability and transitive-
// closure subtree budget roll-up. Every solution is engine-verified against
// its own seed by scripts/lc-sql-verify.ts before wiring.
import type { LcSqlDive } from "../types";

export const SQL_BOSS3_A: LcSqlDive[] = [
  {
    slug: "bom-leaf-demand-explosion",
    statement:
      "A factory tracks its bill of materials in Parts (part_id, part_name, parent_id, qty_per): each row's qty_per is how many units of that part ONE unit of its parent assembly needs; the finished good is the single root assembly (the part with no parent). Build ONE unit of the root. Report every LEAF part — a part that is itself nobody's parent — with the total number of units its branch consumes: the product of qty_per down the path from the root. Columns part_name, total_demand. Order by total_demand DESC, then part_name ASC.",
    examples: [
      {
        input: "root → wing assembly (qty 2), wing assembly → wing spar (qty 3)",
        output: "wing spar appears with total_demand 6",
        explanation:
          "One root needs 2 wing assemblies, and each wing assembly needs 3 spars — the demand multiplies along the path: 2 × 3 = 6.",
      },
      {
        input: "a part with no children anywhere in the tree",
        output: "…appears exactly once with its path product",
        explanation:
          "Leaves are defined structurally (no row references them as parent), not by name or price — a part deep in the tree is a leaf if nothing hangs below it.",
      },
    ],
    constraints: [
      "exactly one output row per leaf part: part_name, total_demand",
      "the walk starts at the single root (parent_id IS NULL) with multiplier 1",
      "each step multiplies the running product by the child's qty_per",
      "a leaf is a part_id that appears in no other row's parent_id",
      "order by total_demand DESC, then part_name ASC",
    ],
    breakdown: [
      "The shape is a recursive CTE with a running multiplier. The anchor plants the root with mult = 1; each step joins children to the current row and extends mult * qty_per. Because the multiplier compounds down the path, a part at depth 3 inherits the product of all three edges above it — this is exactly the 'carry an accumulator through the recursion' pattern, and the accumulator must live in the recursive CTE's column list.",
      "'Leaf' is an anti-join, not a flag column: a part is a leaf when no row in Parts references it as parent. NOT EXISTS over parent_id expresses that directly. Writing the anti-join against the RECURSIVE set instead of the base table is a subtle bug — the recursion only visits the root's subtree, so a leaf of an unrelated assembly would be missed; the base-table test is the honest structural one.",
      "The final SELECT just projects and sorts — all the work happened in the recursion. Ordering by the numeric product DESC puts the expensive branches first, which is the whole point of a demand explosion: it answers 'which leaf do we need the most of' before answering anything else.",
    ],
    edges: [
      "Depth multiplies, it does not add: the sensor mount sits under bulkhead (4) under fuselage (1) under root — its demand is 1 × 4 × 2 = 8, and a solution that SUMS qty_per along the path reads 7 and fails. The seed's deepest chain exists precisely to catch that.",
      "A leaf directly under the root (cockpit glass, qty 2) has a trivial one-edge path — its product is just its own qty_per. Solutions that special-case depth ≥ 2 lose it.",
      "The root itself is NOT a leaf unless the assembly is empty, and intermediate assemblies (wing assembly, fuselage, bulkhead) never appear in the output even though the recursion visits them — only the anti-join survivors ship.",
      "qty_per is per ONE unit of the parent: the wing's 3 spars are per wing assembly, so the 2 assemblies make it 6. Misreading qty_per as 'total units in the build' gives 3 and fails the largest row too.",
    ],
    ladder: [
      { title: "Brute force — walk in application code", body: "Load all parts, build the tree in memory, DFS with a running product. Correct but O(n) application passes and none of it lives in SQL." },
      { title: "The pattern — recursive CTE with an accumulator", body: "Anchor at the root, step multiplies mult by qty_per per edge. The accumulator column is what turns a traversal into a demand computation." },
      { title: "The optimal idea — let the structure define the leaves", body: "NOT EXISTS against the base table is the leaf test; the recursion supplies the product. The durable rule: recursive CTEs compute per-path state cheaply, and set-level predicates (anti-joins, aggregates) belong AFTER the walk, not inside it." },
    ],
    approach: "WITH RECURSIVE anchor (root, mult 1) + step (child joins, mult * qty_per) → NOT EXISTS leaf test on the base table → project and sort by demand",
    schema: {
      ddl: `CREATE TABLE Parts (
  part_id   INTEGER PRIMARY KEY,
  part_name TEXT NOT NULL,
  parent_id INTEGER,
  qty_per   INTEGER NOT NULL
);`,
      seed: `INSERT INTO Parts (part_id, part_name, parent_id, qty_per) VALUES
  (1, 'Aircraft Frame',  NULL, 1),
  (2, 'Wing Assembly',   1, 2),
  (3, 'Fuselage',        1, 1),
  (4, 'Wing Spar',       2, 3),   -- leaf: 2*3        = 6
  (5, 'Wing Skin',       2, 5),   -- leaf: 2*5        = 10
  (6, 'Rivet Kit',       3, 50),  -- leaf: 1*50       = 50
  (7, 'Bulkhead',        3, 4),
  (8, 'Sensor Mount',    7, 2),   -- leaf: 1*4*2      = 8 (depth 3)
  (9, 'Cockpit Glass',   1, 2);   -- leaf: 2 (depth 1)`,
      tables: [
        { name: "Parts", note: "9 parts, one root (Aircraft Frame), 5 leaves — the deepest chain runs root → fuselage → bulkhead → sensor mount (3 edges)" },
      ],
    },
    code: `WITH RECURSIVE walk AS (
    SELECT part_id, part_name, 1 AS mult
    FROM Parts
    WHERE parent_id IS NULL
    UNION ALL
    SELECT p.part_id, p.part_name, w.mult * p.qty_per
    FROM Parts p
    JOIN walk w ON p.parent_id = w.part_id
)
SELECT w.part_name, w.mult AS total_demand
FROM walk w
WHERE NOT EXISTS (
    SELECT 1 FROM Parts c WHERE c.parent_id = w.part_id
)
ORDER BY total_demand DESC, w.part_name;`,
    walkthrough: [
      "The anchor plants Aircraft Frame at mult 1. The first step emits Wing Assembly (2 × 1 = 2), Fuselage (1 × 1 = 1) and Cockpit Glass (2 × 1 = 2); later steps push Wing Spar to 2 × 3 = 6, Wing Skin to 2 × 5 = 10, Rivet Kit to 1 × 50 = 50, Bulkhead to 1 × 4 = 4 and finally Sensor Mount to 4 × 2 = 8.",
      "The anti-join keeps rows whose part_id no other row names as a parent: Wing Spar, Wing Skin, Rivet Kit, Sensor Mount and Cockpit Glass survive; the root and all three intermediate assemblies drop out. Note the leaf test runs against Parts (the whole table), not against walk — the two agree here only because the tree is rooted.",
      "Five rows ship, ordered by demand: Rivet Kit 50, Wing Skin 10, Sensor Mount 8, Wing Spar 6, Cockpit Glass 2. The rivet kit dominating the list is the classic BOM punchline — the cheapest, dumbest part is the one procurement cares about.",
    ],
    time: "O(n) over the subtree edges — each part is visited once",
    space: "O(n) — one annotated row per visited part",
    followUps: [
      "Report the demand of EVERY part (not just leaves) plus its depth below the root — which rows' numbers are already correct and which need a second pass, and why can't the depth be a window function inside the recursive step?",
      "Build 25 units of the root instead of one — where exactly does the multiplier 25 enter, and does the output ordering ever change with the scale factor?",
    ],
    related: ["approval-chain-audit", "ceo-subordinate-hierarchy", "analyze-organization-hierarchy"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "min-hops-flight-reachability",
    statement:
      "An airline's route map lives in Flights (flight_id, from_city, to_city); every flight is DIRECTED — a to_city does not imply the return. Starting from 'SEA', find every OTHER city reachable within at most 3 hops. For each, report the FEWEST hops that reaches it: columns city, min_hops. Exclude SEA itself. Order by min_hops ASC, then city ASC.",
    examples: [
      {
        input: "SEA→PDX and SEA→DEN→PDX both exist",
        output: "PDX appears once with min_hops 1",
        explanation:
          "Two paths reach PDX (1 hop and 2 hops); the fewest wins. A walk that only records the FIRST arrival must still be correct here because breadth-first levels arrive in order — and a GROUP BY MIN makes it robust either way.",
      },
      {
        input: "a city first reachable on hop 4",
        output: "…does not appear at all",
        explanation:
          "The 3-hop cap is a hard filter, not a preference: cities whose shortest path is 4 hops are unreachable within the window and must be absent, even though the route map could eventually reach them.",
      },
    ],
    constraints: [
      "one row per city reachable from SEA in 1..3 hops: city, min_hops",
      "SEA itself is excluded from the output",
      "hops count edges traveled; the cap is a hard ≤ 3",
      "flights are directed; a reachable city may also have a return flight",
      "order by min_hops ASC, then city ASC",
    ],
    breakdown: [
      "Breadth-first search dressed as a recursive CTE. The anchor plants SEA at hops 0; each step joins outgoing flights and increments hops, and the step's WHERE hops < 3 is the hard cap — a row at hop 3 can still be emitted (it was produced when its parent had hops 2), but nothing extends past it. This level-by-level growth IS BFS: every city first appears at its minimum hop count, because the recursion expands ALL hop-k rows before any hop-(k+1) row.",
      "MIN(hops) GROUP BY city is the belt-and-braces on top of that BFS argument: a city reached by several routes (PDX at 1 and 2) appears in the recursive set multiple times, and the aggregate collapses them to the shortest. Skipping the GROUP BY and hoping first-arrival-wins is fragile — it depends on join order inside the engine rather than on the level structure.",
      "The step does NOT need an explicit visited-guard in this problem: the hops < 3 cap bounds every path to length 3, so even the seed's cycle (LAX→HNL→LAX) and the return flight JFK→SEA terminate on their own. Adding one anyway is fine and is the right habit for uncapped graphs — the cap here IS the guard.",
    ],
    edges: [
      "HNL is reachable only at 4 hops (SEA→PDX→SFO→LAX→HNL) and must be ABSENT — a solution that reports 'reachable, eventually' without the cap emits it and fails. The seed places LAX→HNL deliberately just past the line.",
      "The JFK→SEA return flight closes a cycle back to the anchor: SEA reappears at hop 4 (…→JFK→SEA), but the cap stops it and the WHERE city <> 'SEA' filter would drop it anyway. Two independent defenses against one trap.",
      "PDX is reached at 1 hop AND at 2 hops (via DEN): min_hops must be 1. The MIN aggregate is what makes the multi-path test safe — an implementation keeping only first arrivals also passes only if its traversal is genuinely level-ordered.",
      "Exactly-3 cities (SFO? no — LAX and JFK) sit ON the boundary: they must appear. Off-by-one in the cap (hops < 2 in the step) silently drops the whole hop-3 tier and fails four rows at once.",
    ],
    ladder: [
      { title: "Brute force — enumerate all paths", body: "Self-join Flights three times (hop 1, 2, 3) and UNION the endpoint sets with their hop counts. Correct at depth 3, explodes at depth 30, and the JOIN count hard-codes the cap." },
      { title: "The pattern — recursive CTE as BFS", body: "Anchor at the source, step joins outgoing edges, WHERE hops < 3 bounds the frontier. The recursion queue is the BFS queue; the hops column is the level number." },
      { title: "The optimal idea — aggregate after the walk", body: "MIN(hops) per city collapses multipath arrivals. The durable rule: shortest-path-by-hops in SQL = level-capped recursion + GROUP BY; Dijkstra-style weights would need a different shape entirely." },
    ],
    approach: "WITH RECURSIVE anchor (SEA, 0) + step (outgoing flights, hops + 1, WHERE hops < 3) → GROUP BY city, MIN(hops) → exclude SEA → sort",
    schema: {
      ddl: `CREATE TABLE Flights (
  flight_id INTEGER PRIMARY KEY,
  from_city TEXT NOT NULL,
  to_city   TEXT NOT NULL
);`,
      seed: `INSERT INTO Flights (flight_id, from_city, to_city) VALUES
  (1,  'SEA', 'PDX'),
  (2,  'SEA', 'DEN'),
  (3,  'PDX', 'SFO'),
  (4,  'DEN', 'CHI'),
  (5,  'DEN', 'PDX'),   -- PDX again at 2 hops: min stays 1
  (6,  'SFO', 'LAX'),
  (7,  'CHI', 'JFK'),
  (8,  'LAX', 'HNL'),
  (9,  'HNL', 'LAX'),   -- 2-cycle; depth cap ends it
  (10, 'JFK', 'SEA');   -- return flight closes a loop to the anchor`,
      tables: [
        { name: "Flights", note: "10 directed flights — every city except HNL lands within 3 hops; HNL needs exactly 4" },
      ],
    },
    code: `WITH RECURSIVE reach(city, hops) AS (
    SELECT 'SEA', 0
    UNION ALL
    SELECT f.to_city, r.hops + 1
    FROM reach r
    JOIN Flights f ON f.from_city = r.city
    WHERE r.hops < 3
)
SELECT city, MIN(hops) AS min_hops
FROM reach
WHERE city <> 'SEA'
GROUP BY city
ORDER BY min_hops ASC, city ASC;`,
    walkthrough: [
      "Hop 1 expands SEA: PDX and DEN. Hop 2 expands both: SFO (via PDX), CHI (via DEN) and PDX again (via DEN — the duplicate arrival). Hop 3 expands the frontier: LAX (via SFO), JFK (via CHI) and SFO would repeat but its own expansion emits LAX only. The cap then halts everything at hop 3.",
      "HNL never makes it: its only entry is LAX→HNL, and LAX first exists at hop 3 — extending it would be hop 4, which the WHERE hops < 3 refuses. The LAX↔HNL 2-cycle and the JFK→SEA return both die at the same cap; no city loops.",
      "The aggregate collapses PDX's two arrivals (1 and 2) to 1. Six rows ship: DEN 1, PDX 1, CHI 2, SFO 2, JFK 3, LAX 3 — alphabetized inside each hop tier.",
    ],
    time: "O(E · d) — every edge is scanned once per level it can extend, d ≤ 3 here",
    space: "O(V · d) — worst case every city at every level",
    followUps: [
      "Raise the cap to 5 and also report HOW MANY distinct routes of minimal length reach each city — which aggregate answers that, and why can't you COUNT the rows in reach without grouping first?",
      "Make the flights undirected (every route flies both ways) by unioning the reverse edges — where does that UNION go, and which of the seed's cities change their min_hops?",
    ],
    related: ["the-airport-with-the-most-flights", "bom-leaf-demand-explosion", "subtree-budget-rollup"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "subtree-budget-rollup",
    statement:
      "A company's project portfolio is a tree in Projects (project_id, project_name, parent_id, budget); parent_id IS NULL marks the portfolio root. For every project, roll up its whole subtree: subtree_total = the sum of budgets of ALL projects beneath it INCLUDING itself, and subtree_size = how many projects that subtree contains (again including itself). Report only projects whose subtree_total is at least 40000: columns project_name, subtree_total, subtree_size. Order by subtree_total DESC, then project_name ASC.",
    examples: [
      {
        input: "a leaf project with budget 45000",
        output: "subtree_total 45000, subtree_size 1",
        explanation:
          "A leaf's subtree is itself — the roll-up of a node with no children is its own budget and a size of one. Any solution that starts the closure from children only loses every leaf row.",
      },
      {
        input: "a project whose subtree sums to exactly 100000",
        output: "…appears in the output",
        explanation:
          "The threshold is inclusive: 'at least' admits the boundary value. A HAVING clause written with > drops it and fails a row that exists to catch exactly that.",
      },
    ],
    constraints: [
      "one output row per project with subtree_total ≥ 40000",
      "subtree_total includes the project's own budget; subtree_size includes the project itself",
      "the tree can be deeper than two levels — roll-up spans grandchildren and beyond",
      "order by subtree_total DESC, then project_name ASC",
    ],
    breakdown: [
      "The workhorse is a transitive closure: a recursive CTE that emits every (ancestor, descendant) pair by planting each node as its own ancestor and then joining children-to-descendants downward. Self-pairs come free from the anchor — that is what makes leaves and the root behave uniformly, with no special cases anywhere downstream.",
      "The roll-up is one GROUP BY over the closure joined back to Projects twice — once for the ancestor's name, once for the descendant's budget. SUM(budget) and COUNT(*) per ancestor are the subtree total and size. This is the standard 'aggregate a tree in SQL' shape: closure first, aggregates second, and never an aggregate inside the recursive step (SQLite forbids window functions there, and plain aggregates in the step would collapse the frontier).",
      "The HAVING clause carries the threshold because it filters AFTER aggregation — a WHERE on SUM() is a syntax error, and filtering budgets BEFORE the roll-up (WHERE budget >= 40000 on the base table) would corrupt every non-leaf total. The boundary row (iOS at exactly 40000) punishes both mistakes.",
    ],
    edges: [
      "iOS's subtree is exactly its own budget — 40000, the threshold's boundary value — and the inclusive HAVING keeps it. An off-by-one (> instead of ≥) drops it, and a budget-level WHERE keeps it while silently corrupting the non-leaf totals above it: the same row catches both mistakes from opposite directions.",
      "Leaf rows are part of the answer space: Checkout (45000) and iOS (40000) both clear the threshold as single-node subtrees. Solutions that only aggregate 'parents' lose them.",
      "Search (25000) and Sandbox (5000) stay out — and Mobile proves the filter ran AFTER the roll-up: its own budget is 15000 (far below 40000) but its subtree total 55000 qualifies. A WHERE budget >= 40000 on the base table would delete Mobile's row from the input and produce 40000 + 4000... a totally different table.",
      "The root's subtree is the entire portfolio: 180000 across 7 projects. The closure anchor's self-pair is what lets the root's own 20000 join into its total — without it the root reads 160000 and its size reads 6.",
    ],
    ladder: [
      { title: "Brute force — one recursion per node", body: "For each project, run a recursive walk of its descendants and sum. Correct, but n walks of O(n) each — quadratic, and n separate queries in application terms." },
      { title: "The pattern — transitive closure once", body: "One recursive CTE emits every (ancestor, descendant) pair including self-pairs; the tree flattens into a table that GROUP BY can chew." },
      { title: "The optimal idea — aggregate the closure, filter with HAVING", body: "SUM/COUNT per ancestor with the threshold in HAVING. The durable rule: trees want flattening before aggregating, and thresholds on aggregates always live in HAVING." },
    ],
    approach: "WITH RECURSIVE closure (self-pair anchor + child step) → join ancestors' names and descendants' budgets → GROUP BY ancestor → SUM, COUNT → HAVING ≥ 100000 → sort",
    schema: {
      ddl: `CREATE TABLE Projects (
  project_id   INTEGER PRIMARY KEY,
  project_name TEXT NOT NULL,
  parent_id    INTEGER,
  budget       INTEGER NOT NULL
);`,
      seed: `INSERT INTO Projects (project_id, project_name, parent_id, budget) VALUES
  (1, 'Platform', NULL, 20000),
  (2, 'Web',      1, 30000),
  (3, 'Mobile',   1, 15000),
  (4, 'Checkout', 2, 45000),
  (5, 'Search',   2, 25000),
  (6, 'iOS',      3, 40000),
  (7, 'Sandbox',  1, 5000);`,
      tables: [
        { name: "Projects", note: "7 projects, 3 levels — iOS's subtree lands exactly on the 40000 boundary; Search (25000) and Sandbox (5000) stay below" },
      ],
    },
    code: `WITH RECURSIVE closure(ancestor, descendant) AS (
    SELECT project_id, project_id FROM Projects
    UNION ALL
    SELECT c.ancestor, p.project_id
    FROM closure c
    JOIN Projects p ON p.parent_id = c.descendant
)
SELECT pr.project_name,
    SUM(p.budget) AS subtree_total,
    COUNT(*)      AS subtree_size
FROM closure c
JOIN Projects pr ON pr.project_id = c.ancestor
JOIN Projects p  ON p.project_id  = c.descendant
GROUP BY pr.project_id, pr.project_name
HAVING SUM(p.budget) >= 40000
ORDER BY subtree_total DESC, pr.project_name;`,
    walkthrough: [
      "The anchor plants 7 self-pairs; the step adds (1,2), (1,3), (2,4), (2,5), (3,6), (1,4), (1,5), (1,6) and finally (1,7) — 15 pairs total, which is every ancestor-descendant combination including selfs: 7 + 6 + 2 = 15 for this tree.",
      "Joining budgets through the closure: Platform absorbs all 7 budgets for 180000 at size 7; Web absorbs itself, Checkout and Search for 100000 at size 3; Mobile reads 55000 at size 2 (its own 15000 plus iOS's 40000); the leaves read their own budgets at size 1. Every number includes the node itself because the anchor's self-pair is in the set.",
      "HAVING keeps Platform (180000 · 7), Web (100000 · 3), Mobile (55000 · 2), Checkout (45000 · 1) and iOS (40000 · 1) — Search and Sandbox fall below. Five rows, sorted by total descending.",
    ],
    time: "O(n + P) — n closure anchors plus P emitted pairs (P is O(n · depth) worst case)",
    space: "O(P) — the closure table",
    followUps: [
      "Report the DEEPEST project name inside each qualifying subtree alongside the totals — can that come from the same closure, and what extra column does the walk need to carry?",
      "Add a status column and roll up only ACTIVE budgets while still counting every project in subtree_size — why must the filter sit on the budget join, not on the closure?",
    ],
    related: ["bom-leaf-demand-explosion", "analyze-organization-hierarchy", "the-number-of-employees-which-report-to-each-employee"],
    order: "exact",
    xp: 20,
  },
];
