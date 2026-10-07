// Deep-dives — SQL band expansion batch 3: the SELF-JOIN / NON-EQUI-JOIN
// angle (4 problems: tree classification, adjacency pairing, non-equi
// rectangle pairs, per-post counts). Engine-verified by
// scripts/lc-sql-verify.ts; self-checked via bun:sqlite at authoring time.
import type { LcSqlDive } from "../types";

export const SQL_MORE2_JOINS: LcSqlDive[] = [
  {
    slug: "tree-node",
    statement:
      "A Tree table stores one row per node: id, and p_id — the id of its parent, NULL for the root. Classify every node as 'Root' (no parent), 'Inner' (parent of at least one other node) or 'Leaf' (neither). Return id and type for every node, ordered by id.",
    examples: [
      {
        input: "Tree: (1, NULL), (2, 1), (3, 1), (4, 2), (5, 2)",
        output: "1 Root · 2 Inner · 3 Inner · 4 Leaf · 5 Leaf",
        explanation:
          "Node 1 has no parent → Root. Nodes 2 and 3 are parents of someone → Inner. Nodes 4 and 5 parent nobody → Leaf.",
      },
      {
        input: "Tree: (1, NULL) — a single lone node",
        output: "1 Root",
        explanation:
          "One node is trivially not a parent either — but the branches run in priority order, so Root wins over Leaf.",
      },
    ],
    constraints: [
      "each node has at most one parent (p_id); exactly one node has p_id NULL",
      "the tree has at least one node",
      "one output row per node, ordered by id",
    ],
    breakdown: [
      "The three labels are a partition of the nodes, and each label is one membership question: Root = p_id IS NULL; Inner = id appears as someone's p_id; Leaf = the remainder. A CASE with three branches expresses this directly — but CASE branches evaluate top-down and stop at the first hit, so the ORDER of the branches is the priority contract of the classification.",
      "The order matters because the tests are not mutually exclusive: the root is usually ALSO a parent (node 1 parents 2 and 3 here, so id 1 belongs to the parent set too). If the membership branch ran first, the root would be stolen and mislabeled 'Inner'. The unambiguous NULL test has to gate the whole expression first — after it fires, whatever survives is genuinely not a root, and the IN test can classify the rest. The set-of-parents subquery is the elegant half: SELECT p_id FROM Tree folds the entire 'who has a child' question into one list, and the tree becomes a lookup.",
      "The WHERE p_id IS NOT NULL inside the subquery is defensive: an id never equals NULL, so membership results are identical with or without it (a non-parent's IN simply comes back UNKNOWN and the WHEN falls through). Keeping the filter is still right — it guarantees the candidate set contains only real parent ids, and it documents that the subquery means 'the set of parents', not 'the raw column'. The full self-join alternative is worth knowing: LEFT JOIN Tree child ON child.p_id = t.id and check whether any child row exists — it lives in the ladder below, but the IN version reads like the definition instead of like counting.",
    ],
    edges: [
      "Branch order is a priority: the root often IS a parent (node 1 is in this seed's parent set) — test p_id IS NULL first or Root gets mislabeled Inner.",
      "x IN (…) never returns FALSE for a non-member when NULLs are in the list — it returns UNKNOWN. CASE treats UNKNOWN as 'no match' and falls through, so labels stay correct; the defensive WHERE keeps the set honest anyway.",
      "A single-node tree is not a parent of anyone — vacuously a leaf by the second test, but the first branch fires first: it is 'Root', never 'Leaf'.",
      "Every node appears exactly once: CASE produces one label per input row — no GROUP BY, no dedup needed.",
    ],
    ladder: [
      {
        title: "Brute force — three queries, stitched",
        body: "Query the root, query the nodes whose id appears in p_id, query the rest — then UNION the three labeled results. Three scans of the same table and the stitching is on you.",
      },
      {
        title: "The pattern — one pass, ordered CASE + membership",
        body: "One scan, CASE WHEN p_id IS NULL THEN 'Root' WHEN id IN (SELECT p_id …) THEN 'Inner' ELSE 'Leaf' END. The set-of-parents subquery turns the tree into a lookup table.",
      },
      {
        title: "The optimal idea — membership vs the self-join twin",
        body: "Same answer via self-join: LEFT JOIN Tree child ON child.p_id = t.id, then 'no child rows → Root/Leaf, some → Inner' plus the IS NULL gate on top. Also O(n) with the id index — but the join flattens the tree into parent→child pairs and forces you to reason in COUNTs, while id IN (set of parents) states the definition verbatim. The IN version reads cleaner; the join version generalizes better when you need the children themselves.",
      },
    ],
    approach: "Ordered CASE: NULL gate first, then membership in the set of parent ids",
    schema: {
      ddl: `CREATE TABLE Tree (
  id   INTEGER PRIMARY KEY,
  p_id INTEGER
);`,
      seed: `INSERT INTO Tree (id, p_id) VALUES
  (1, NULL), (2, 1), (3, 1), (4, 2), (5, 2), (6, 3);`,
      tables: [{ name: "Tree", note: "6 nodes: root 1 forks 2 and 3; 2 forks 4 and 5; 3 forks 6 — a full two-level tree" }],
    },
    code: `SELECT
    id,
    CASE
        WHEN p_id IS NULL THEN 'Root'   -- gate first: root may also be a parent
        WHEN id IN (SELECT p_id FROM Tree WHERE p_id IS NOT NULL)
            THEN 'Inner'                -- someone calls this node parent
        ELSE 'Leaf'                     -- parentless and childless
    END AS type
FROM Tree
ORDER BY id;`,
    walkthrough: [
      "The subquery collects every non-NULL p_id: {1, 2, 3} — nodes 1, 2 and 3 all have children, so those are the ids that can read 'Inner'.",
      "Row by row: node 1 trips the first branch (p_id NULL) → Root, even though 1 is also in the parent set; nodes 2 and 3 have ids in the parent set → Inner.",
      "Nodes 4, 5 and 6 fail both branches → Leaf. Output: (1,'Root'), (2,'Inner'), (3,'Inner'), (4,'Leaf'), (5,'Leaf'), (6,'Leaf'), ordered by id.",
    ],
    time: "O(n) — one scan builds the parent set, one classifies every node",
    space: "O(n) — the parent-id set",
    followUps: [
      "Depth of every node — a recursive CTE walking p_id up to the root, level by level.",
      "Write the LEFT JOIN Tree child ON child.p_id = t.id version with a COUNT — then decide honestly which one you'd defend in an interview.",
    ],
    related: ["employees-earning-more-than-their-managers", "number-of-comments-per-post"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "consecutive-available-seats",
    statement:
      "A cinema's seats are numbered 1..N; each Cinema row says whether that seat is free. Report every ADJACENT PAIR of free seats — seats numbered k and k+1 that are both free — one row per pair with the smaller seat first, ordered by the first seat of the pair.",
    examples: [
      {
        input: "free seats: 1, 2, 3 and 7, 8, 9 (seats 4–6 and 10 are taken)",
        output: "(1,2) · (2,3) · (7,8) · (8,9)",
        explanation:
          "The run 1–3 yields two overlapping pairs (seat 2 belongs to both); the run 7–9 likewise. Seat 3 is numbered next to 4, but 4 isn't free — no pair.",
      },
      {
        input: "free seats: just seat 5",
        output: "no rows",
        explanation:
          "A lone free seat has no neighbor. A pair needs BOTH rows free — one free seat between taken seats produces nothing.",
      },
    ],
    constraints: [
      "seat_id is unique and numbered 1..N consecutively",
      "a pair is two seats whose seat_id differs by exactly 1, both free (free = 1)",
      "report each unordered pair exactly once, smaller seat_id first",
    ],
    breakdown: [
      "'Consecutive' sounds vague until you write it as arithmetic: seat b is adjacent to seat a exactly when b.seat_id = a.seat_id + 1. Alias the same table twice — a is the left seat of the pair, b the right — and the self-join turns the English word 'adjacent' into an equality in the ON clause. This is the cheapest possible join: each row matches at most one other row, via the primary-key index.",
      "The +1 offset is directional by construction, and that is what canonicalizes the output: every pair is emitted once as (a, b) with a < b. Compare with the symmetric pair problems where you must impose a.id < b.id yourself (number-of-calls-between-two-persons) — here adjacency itself supplies the direction, and joining both directions would merely double every row. Recognizing when the join predicate already IS the dedupe is the transferable lesson.",
      "The free checks sit in WHERE, not ON: with an inner join the two placements are equivalent, but the reading matters — the join builds every adjacent pair in the room, then the filter keeps only the pairs that are wholly free. Boundaries take care of themselves: seat N has no successor row, so runs simply end, and no special-casing of the last seat is ever needed.",
    ],
    edges: [
      "Seat 3 pairs with seat 4 numerically, but seat 4 isn't free — every row joins against the NEXT seat only, so a free seat with a taken right neighbor silently produces no row.",
      "b.seat_id = a.seat_id + 1 already forces a < b — adding a redundant a.seat_id < b.seat_id is noise, and dropping the offset for a plain < join would return every free pair, not adjacent ones.",
      "free is an integer flag, not a boolean: compare = 1 on BOTH sides (a.free AND b.free). Checking only a.free reports pairs like (9,10) where the left seat is free and the right isn't.",
      "Overlapping pairs are wanted, not a bug: seats 1–2 and 2–3 both appear because seat 2 legitimately belongs to two pairs.",
    ],
    ladder: [
      {
        title: "Brute force — scan runs in application code",
        body: "Pull the free seat ids sorted, walk them in the app, and emit (k, k+1) whenever the next free id is exactly one greater. The database already knows adjacency — you're re-implementing it row by row.",
      },
      {
        title: "The pattern — self-join on the offset",
        body: "FROM Cinema a JOIN Cinema b ON b.seat_id = a.seat_id + 1 WHERE a.free = 1 AND b.free = 1. 'Adjacent' is now an equality; both free checks keep the wholly-free pairs.",
      },
      {
        title: "The optimal idea — one scan with LEAD()",
        body: "LEAD(seat_id) OVER (ORDER BY seat_id) and LEAD(free) OVER (…) see the next row without a join — same O(n), no self-reference. The window version earns its keep the moment 'next' gets fuzzy (next FREE seat, skipping taken ones); for strictly k and k+1 the offset join is the clearer statement of the rule.",
      },
    ],
    approach: "Self-join each seat to its +1 neighbor; keep pairs where both sides are free",
    schema: {
      ddl: `CREATE TABLE Cinema (
  seat_id INTEGER PRIMARY KEY,
  free    INTEGER NOT NULL
);`,
      seed: `INSERT INTO Cinema (seat_id, free) VALUES
  (1,1),(2,1),(3,1),(4,0),(5,0),(6,0),
  (7,1),(8,1),(9,1),(10,0);`,
      tables: [{ name: "Cinema", note: "10 seats; runs of 3 free (1–3), 3 taken (4–6), 3 free (7–9), 1 taken (10)" }],
    },
    code: `SELECT
    a.seat_id AS seat_a,
    b.seat_id AS seat_b
FROM Cinema a
JOIN Cinema b ON b.seat_id = a.seat_id + 1   -- adjacency as an equality
WHERE a.free = 1 AND b.free = 1              -- the PAIR must be free
ORDER BY seat_a;`,
    walkthrough: [
      "The join pairs every seat with its successor: (1,2), (2,3), (3,4), …, (9,10) — ten candidate pairs from ten seats, each smaller seat first by construction.",
      "The free filter keeps pairs where BOTH ends are free: (1,2) and (2,3) survive from the 1–3 run; (3,4) dies on seat 4; (4,5), (5,6), (6,7) die on their taken sides; (7,8) and (8,9) survive; (9,10) dies on seat 10.",
      "Ordered by the first seat: (1,2), (2,3), (7,8), (8,9) — four pairs, each exactly once, no pair reversed.",
    ],
    time: "O(n) — each seat joins at most its single right neighbor",
    space: "O(p) — one row per adjacent free pair",
    followUps: [
      "Longest run of consecutive free seats — the gaps-and-islands trick: seat_id − ROW_NUMBER() OVER (ORDER BY seat_id) groups each run.",
      "Rewrite with LEAD(free) and no join at all — then extend to 'every group of 3+ consecutive free seats' and see which formulation bends more easily.",
    ],
    related: ["exchange-seats", "number-of-calls-between-two-persons"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "rectangle-area",
    statement:
      "Points stores candidate corners: id, x_value, y_value. Every pair of points whose x values DIFFER and whose y values DIFFER forms an axis-aligned rectangle with the two points as opposite corners. Report each qualifying pair once — smaller id first — as id_a, id_b and its area, largest areas first.",
    examples: [
      {
        input: "P1(2,8) and P2(4,7) — different x, different y",
        output: "id_a 1 · id_b 2 · area 2",
        explanation: "Opposite corners P1 and P2: width |2−4| = 2, height |8−7| = 1, area 2×1 = 2.",
      },
      {
        input: "P2(4,7) and P3(2,7) — both at y = 7",
        output: "no row",
        explanation:
          "Equal y means the points sit on one horizontal line — degenerate, no rectangle. The pair (2,3) is correctly absent from the output.",
      },
    ],
    constraints: [
      "a qualifying pair needs x_a ≠ x_b AND y_a ≠ y_b",
      "each pair appears once, with id_a < id_b",
      "order by area DESC, then id_a, then id_b",
    ],
    breakdown: [
      "There is no join key here — pairs are manufactured, not looked up. p1 JOIN p2 ON p1.id < p2.id AND p1.x_value <> p2.x_value AND p1.y_value <> p2.y_value builds the cross product and carves the qualifying pairs out with pure predicates. No equality anywhere in the ON clause makes this a NON-EQUI join: under the hood it is a nested loop with a filter, because no hash or index fast-path exists for 'different'. That is fine at interview scale (hundreds of rows, ~n²/2 pairs) and worth fearing at millions — pair problems are the canonical place to say 'O(n²) and I know it'.",
      "p1.id < p2.id does double duty: it dedupes (each unordered pair emitted once, never also as (b,a)) and it fixes the output direction (id_a < id_b is part of the spec). Contrast the adjacency join in consecutive-available-seats, where the +1 offset supplies direction for free — here an explicit inequality does the canonicalizing. Same instinct, three different predicates: offset, less-than, both.",
      "Area is |Δx| × |Δy| — ABS on both deltas because 'opposite corners' does not promise which point is the upper-left one; the id ordering fixes which point lands in which column, and only the absolute deltas keep the product symmetric and correct. Then the ORDER BY is a three-key contract: area DESC first, and — because the seed contains THREE pairs tying at area 4 — the id_a, id_b tail is what makes the row order deterministic. An order-exact grader is a spec for your full sort-key chain; leave a tie unresolved and the engine resolves it arbitrarily.",
    ],
    edges: [
      "(2,3) is absent: P2 and P3 share y = 7. Same-x OR same-y pairs are degenerate — both coordinates must differ.",
      "ABS is non-negotiable: with fixed id order, P1(2,8) vs P5(1,3) gives Δx = 1 and Δy = 5 — but drop ABS and any pair where the larger id has the smaller coordinate flips a sign and wrecks the area.",
      "Three pairs tie at area 4 — (1,4), (2,4) and (3,5). ORDER BY area DESC alone leaves their relative order to the engine; id_a, id_b makes it exact.",
      "Indexes barely help here: x_value <> x_value cannot seek. If this ran at scale you would bucket points by x (or sort once and sweep), not add indexes.",
    ],
    ladder: [
      {
        title: "Brute force — cross everything, clean up later",
        body: "FROM Points p1, Points p2 with no ON: n² rows including both (a,b) and (b,a) and all the degenerate same-line pairs — then CASE-guard the area expression and de-duplicate by hand.",
      },
      {
        title: "The pattern — non-equi self-join as the pair contract",
        body: "ON p1.id < p2.id AND p1.x_value <> p2.x_value AND p1.y_value <> p2.y_value: the join clause itself enumerates exactly the qualifying unordered pairs — dedupe, direction and degeneracy handled in one line.",
      },
      {
        title: "The optimal idea — own the O(n²), then beat it structurally",
        body: "The engine still runs a nested loop — n(n−1)/2 candidate pairs, k survivors — and indexes cannot accelerate inequality joins, so the honest complexity is O(n²). At interview-table sizes that is the right answer; at scale the win is algorithmic (bucket by x, compare within and across adjacent buckets), not a cleverer query shape.",
      },
    ],
    approach: "Non-equi self-join: id-ordered pairs with x≠x and y≠y, area from ABS deltas",
    schema: {
      ddl: `CREATE TABLE Points (
  id      INTEGER PRIMARY KEY,
  x_value INTEGER NOT NULL,
  y_value INTEGER NOT NULL
);`,
      seed: `INSERT INTO Points (id, x_value, y_value) VALUES
  (1, 2, 8), (2, 4, 7), (3, 2, 7), (4, 6, 9), (5, 1, 3);`,
      tables: [{ name: "Points", note: "5 points; P1 and P3 share x=2, P2 and P3 share y=7 — planted degenerate pairs" }],
    },
    code: `SELECT
    p1.id AS id_a,
    p2.id AS id_b,
    ABS(p1.x_value - p2.x_value) * ABS(p1.y_value - p2.y_value) AS area
FROM Points p1
JOIN Points p2
  ON p1.id < p2.id                     -- each unordered pair once, direction fixed
 AND p1.x_value <> p2.x_value          -- else degenerate (vertical line)
 AND p1.y_value <> p2.y_value          -- else degenerate (horizontal line)
ORDER BY area DESC, id_a, id_b;        -- full tie-break chain: 3 pairs tie at area 4`,
    walkthrough: [
      "The id inequality proposes 10 pairs from 5 points; (1,3) shares x = 2 and (2,3) shares y = 7, so the coordinate predicates cut the field to 8 rectangles.",
      "Areas: (4,5) → |6−1|·|9−3| = 30; (2,5) → 3·4 = 12; (3,4) → 4·2 = 8; (1,5) → 1·5 = 5; then the three-way tie (1,4) → 4·1, (2,4) → 2·2, (3,5) → 1·4, all area 4; finally (1,2) → 2·1 = 2.",
      "Sort: area DESC, then ids — (4,5,30), (2,5,12), (3,4,8), (1,5,5), (1,4,4), (2,4,4), (3,5,4), (1,2,2). Eight rows, ties resolved by the id chain.",
    ],
    time: "O(n²) — every pair examined once (nested loop; inequality joins get no index fast-path)",
    space: "O(k) — one row per qualifying rectangle",
    followUps: [
      "Count rectangles instead of listing them — same join under COUNT(*); how would you restructure it for 10⁶ points?",
      "Minimum-area rectangle — flip to ORDER BY area ASC LIMIT 1; what breaks if duplicate points are allowed?",
    ],
    related: ["number-of-calls-between-two-persons", "consecutive-available-seats"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "number-of-comments-per-post",
    statement:
      "A submissions table holds both posts and direct comments: a row with parent_id NULL is a post, and a row whose parent_id = X is a direct comment on submission X. For each post, count its direct comments — and posts with zero comments must still appear, with 0. Order by submission_id.",
    examples: [
      {
        input: "posts 101, 102, 103; comments 111→101, 112→101, 113→102",
        output: "101 · 2 / 102 · 1 / 103 · 0",
        explanation:
          "103 has no comments yet still appears with 0 — keeping the zero is the entire difficulty of this problem.",
      },
    ],
    constraints: [
      "posts are exactly the rows with parent_id IS NULL",
      "count DIRECT comments only — one level of hierarchy",
      "every post appears exactly once, even with zero comments",
    ],
    breakdown: [
      "The shape is 'keep every post row, attach a per-row count'. A correlated subquery does this without disturbing the outer rows: for each post p, (SELECT COUNT(*) FROM submissions c WHERE c.parent_id = p.submission_id) is evaluated in place and returns one scalar. No GROUP BY appears anywhere because the aggregation never touches the outer query's rows — the count collapses the SUBQUERY's rows, not the report's. That per-row isolation is why the zero case is free: a post with no children simply counts an empty set, which is 0.",
      "The canonical alternative is LEFT JOIN + GROUP BY: FROM submissions p LEFT JOIN submissions c ON c.parent_id = p.submission_id WHERE p.parent_id IS NULL GROUP BY p.submission_id. Same numbers — until the zero case bites. LEFT JOIN stretches an unmatched post across a row whose c.* columns are all NULL, and COUNT(*) counts rows, so the comment-less post reports 1. COUNT(c.submission_id) — counting a right-side column, NULL exactly on unmatched rows — is the fix. This is the same COUNT(*)-vs-COUNT(column) fork the joins module teaches, and here the subquery formulation sidesteps the fork entirely.",
      "Scope check: only DIRECT comments count. If a comment ever parents another comment, that grandchild does not roll up into the top post's number — the count is a single parent_id equality, not a traversal. This table is a one-level hierarchy; true depth needs a recursive CTE (or a closure table), which is exactly where the follow-up goes. Recognizing 'how deep does this relationship go?' before writing any SQL is the grain question that separates a one-line count from a recursive walk.",
    ],
    edges: [
      "Posts with zero comments must appear — an INNER JOIN drops 103 entirely; only a correlated count or a LEFT JOIN keeps it.",
      "In the join version, COUNT(*) reports 1 for an empty post (the NULL-stretched left row) — COUNT(c.submission_id) reports 0. The column you count IS the answer.",
      "WHERE p.parent_id IS NULL selects the posts; forget it and every comment row joins the report as a 'post' too.",
      "Comments of comments don't roll up — parent_id equality is one level deep, not a recursive sum.",
    ],
    ladder: [
      {
        title: "Brute force — N+1 queries",
        body: "SELECT the posts, then loop in application code issuing one COUNT per post. N+1 round trips for what is one pass of the table.",
      },
      {
        title: "The pattern — LEFT JOIN + GROUP BY, counting the right key",
        body: "Keep every post with LEFT JOIN, GROUP BY the post id, count COUNT(c.submission_id). Works — but the zero case hides a COUNT(*) trap you must remember to dodge.",
      },
      {
        title: "The optimal idea — correlated count, zero case for free",
        body: "One scan of the posts; each post's count is an index lookup on parent_id. No GROUP BY bookkeeping, no empty-row accounting, and 'count this post's children' reads exactly like the spec. O(n) either way with an index on parent_id — the subquery wins on intent, not asymptotics.",
      },
    ],
    approach: "Correlated COUNT subquery per post, outer query filtered to parent_id IS NULL",
    schema: {
      ddl: `CREATE TABLE submissions (
  submission_id INTEGER PRIMARY KEY,
  parent_id     INTEGER
);`,
      seed: `INSERT INTO submissions (submission_id, parent_id) VALUES
  (101, NULL), (102, NULL), (103, NULL), (104, NULL),
  (111, 101), (112, 101), (113, 102), (114, 102), (115, 102), (116, 104);`,
      tables: [{ name: "submissions", note: "4 posts (101–104); 6 direct comments — post 103 has none, planted for the zero case" }],
    },
    code: `SELECT
    p.submission_id,
    (SELECT COUNT(*)
       FROM submissions c
      WHERE c.parent_id = p.submission_id) AS number_of_comments
FROM submissions p
WHERE p.parent_id IS NULL        -- posts only
ORDER BY p.submission_id;`,
    walkthrough: [
      "The outer WHERE keeps the four posts: 101, 102, 103, 104 — rows with parent_id NULL.",
      "Per post, the subquery counts children: 101 → {111, 112} = 2; 102 → {113, 114, 115} = 3; 103 → {} = 0; 104 → {116} = 1.",
      "Output ordered by submission_id: (101,2), (102,3), (103,0), (104,1) — 103's zero costs nothing because the count lives inside the row, not in a join that had to match.",
    ],
    time: "O(n) — posts scanned once; each count is an index probe on parent_id",
    space: "O(p) — one row per post",
    followUps: [
      "Count ALL descendant comments per post, not just direct ones — a recursive CTE walking parent_id up to each root post.",
      "Rewrite as LEFT JOIN + GROUP BY and prove to yourself why COUNT(*) lies about post 103 — then decide which version you'd ship.",
    ],
    related: ["tree-node", "npv-queries"],
    order: "exact",
    xp: 10,
  },
];
