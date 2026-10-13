// Deep-dives — the SQL FINAL CLASSICS band, part B: the last free evergreens
// (LC 602 / 608 / 1050 / 1164) — bidirectional counting, tree classification,
// the minimal GROUP BY/HAVING and the as-of price lookup. Solutions are SQLite
// dialect, one statement each, engine-verified against the per-problem seeds
// (the request-only user, the double-matching root, the boundary pairs and the
// never-changed products are the traps).
import type { LcSqlDive } from "../types";

export const SQL_FINAL_CLASSICS_B: LcSqlDive[] = [
  {
    slug: "friend-requests-ii-who-has-the-most-friends",
    statement:
      "An accepted friend request permanently connects two users — every row of RequestAccepted is one accepted request, and friendship is mutual. Find the person who has the most friends and report how many friends that is.",
    examples: [
      {
        input:
          "RequestAccepted: (1,2,06-03),(1,3,06-08),(2,3,06-08),(3,4,06-09) — official — then the traps: (5,4,06-10),(5,6,06-11): person 5 only ever SENDS requests, person 6 only ever ACCEPTS them",
        output: "id: 3 · num: 3",
        explanation:
          "Counting BOTH directions: person 3 accepts from 1 and 2 and requests 4 — 3 friends, the unique max. Person 1 and person 5 also reach 2, and 5's two friendships are both OUTGOING requests it sent — they count exactly the same. Person 6's single friendship is incoming-only. The official answer (3, 3) survives the trap rows untouched.",
      },
    ],
    constraints: [
      "(requester_id, accepter_id) is the primary key — one row per accepted friendship, ever",
      "friendship is mutual: each row grants one friend to the requester AND one to the accepter",
      "the test data guarantees exactly one person holds the maximum",
    ],
    breakdown: [
      "Friendship is mutual, but the log is not symmetric: row (1,2) means 1 requested and 2 accepted, and after acceptance BOTH are friends. So each row adds one friend to requester_id and one friend to accepter_id. 'Who has the most friends' therefore reduces to 'which id appears most often across the two id columns' — a frequency count over a two-column stream. The output is (id, num), not a name.",
      "The move is UNION ALL. Stack the requester_id column on top of the accepter_id column into one id column, then GROUP BY id and COUNT(*). UNION ALL, never UNION: plain UNION dedupes identical values, so person 1 — twice a requester in the official rows — would collapse to ONE appearance and lose a friend. The only legitimate dedupe happens at the person level, after counting; deduping the raw values is the bug.",
      "The naive one-direction read fails visibly on the official example: counting only requester_id gives person 3 a score of 1, though 1 and 2 both befriended them. The other direction alone fails the other way. And there is nothing to dedupe at the pair level — the pair is the primary key, so each friendship exists exactly once; the schema already guarantees it.",
      "With counts in hand, pick the max. The facts promise a unique winner, so ORDER BY num DESC LIMIT 1 would work — but WHERE num = (SELECT MAX(num) FROM counts) returns the same row today AND answers the official follow-up ('what if multiple people tie?') for free. One statement, two CTEs, no join anywhere.",
    ],
    edges: [
      "UNION instead of UNION ALL dedupes at the wrong grain: person 1 appears twice as a requester, and UNION would count them once — every repeat appearance silently loses a friend.",
      "One-direction counting is the mirror-image miss: requester-only gives person 3 a count of 1 (outgoing to 4) instead of 3 — half of their friendships are invisible.",
      "Duplicate accepted pairs can't exist (the pair is the PK), so pair-level dedupe is a no-op — but IF the schema ever allowed retries on different dates, the facts say each accepted row counts; you'd count rows, not DISTINCT pairs.",
      "Ties: LIMIT 1 silently drops every co-winner. The facts promise a unique max, but the MAX-subquery form doesn't need the promise — it returns all winners, which is exactly the official follow-up.",
    ],
    ladder: [
      {
        title: "Brute force — probe every candidate id",
        body: "For each id that appears in either column, run a scalar subquery counting its appearances across both columns: two scans per person, O(n²) overall, and easy to write against just one column by accident. Same answer, all re-computation.",
      },
      {
        title: "The pattern — stack both directions, then count",
        body: "UNION ALL the two id columns into one stream, GROUP BY id, COUNT(*): one pass produces the whole friend-count table. The two-column stack IS the mutual-friendship model — each row contributes both endpoints.",
      },
      {
        title: "The optimal idea — a tie-safe maximum",
        body: "Keep the counts CTE and select WHERE num = (SELECT MAX(num) FROM counts). The facts guarantee a single winner, so LIMIT 1 is legal — but the MAX form is the same cost and survives ties, which is the follow-up the problem itself asks.",
      },
    ],
    approach: "UNION ALL both directions + GROUP BY count + tie-safe MAX pick",
    schema: {
      ddl: `CREATE TABLE RequestAccepted (
  requester_id INTEGER NOT NULL,
  accepter_id  INTEGER NOT NULL,
  accept_date  TEXT NOT NULL,               -- 'YYYY-MM-DD'
  PRIMARY KEY (requester_id, accepter_id)   -- one row per accepted friendship
);`,
      seed: `INSERT INTO RequestAccepted (requester_id, accepter_id, accept_date) VALUES
  (1, 2, '2016-06-03'),  -- official rows
  (1, 3, '2016-06-08'),
  (2, 3, '2016-06-08'),
  (3, 4, '2016-06-09'),
  (5, 4, '2016-06-10'),  -- trap: person 5 only ever SENDS — still counts via outgoing
  (5, 6, '2016-06-11');  -- trap: person 6 only ever ACCEPTS — counts via incoming`,
      tables: [
        { name: "RequestAccepted", note: "6 accepted requests; person 3 tops out at 3 friends (2 incoming + 1 outgoing)" },
      ],
    },
    code: `WITH friends AS (
    -- BOTH directions: each accepted row makes the requester AND the
    -- accepter one friend richer. UNION ALL (never UNION) — deduping the
    -- stacked ids would erase repeat friendships.
    SELECT requester_id AS id FROM RequestAccepted
    UNION ALL
    SELECT accepter_id FROM RequestAccepted
),
counts AS (
    SELECT id, COUNT(*) AS num        -- friends per person = appearances in the stack
    FROM friends
    GROUP BY id
)
SELECT id, num
FROM counts
WHERE num = (SELECT MAX(num) FROM counts)  -- tie-safe pick: returns every winner
ORDER BY id;`,
    walkthrough: [
      "friends stacks 12 values from the 6 seed rows: requester side 1, 1, 2, 3, 5, 5 and accepter side 2, 3, 3, 4, 4, 6 — every row contributes both endpoints, in order.",
      "counts folds that stack to 1→2, 2→2, 3→3, 4→2, 5→2, 6→1. Person 3 gets 2 incoming (from 1 and 2) plus 1 outgoing (to 4); person 5's two friends are both requests it sent; person 6's single friend is purely incoming.",
      "The MAX subquery finds 3, and WHERE num = 3 keeps exactly one row — (3, 3). A requester-only count would have crowned nobody correctly: it scores person 3 at 1 and person 5 at 2.",
      "ORDER BY id makes the single-row snapshot deterministic: id 3, num 3 — the official answer, unbothered by the trap rows.",
    ],
    time: "O(n) — two column scans stacked into 2n ids plus one GROUP BY pass",
    space: "O(n) — the stacked id column (2n entries) and the count table",
    followUps: [
      "Multiple winners: the query already returns ALL tied champions — compare that against the LIMIT 1 form and name the input that breaks the latter.",
      "Friend recommendations: from the friends CTE, find pairs of people who share a friend but are not friends themselves — a self-join on the stacked ids with an anti-join guard.",
    ],
    related: ["customer-placing-the-largest-number-of-orders", "sales-analysis-i", "article-views-ii"],
    order: "any",
    xp: 20,
  },
  {
    slug: "tree-node",
    statement:
      "Every row of Tree names a node id and the id of its parent. Classify each node as 'Root' (no parent), 'Inner' (has a parent and children) or 'Leaf' (has a parent but no children).",
    examples: [
      {
        input:
          "Tree: (1,null),(2,1),(3,1),(4,2),(5,2) — official five — then the traps: (6,3) gives 3 a child, (7,6) extends the chain",
        output: "1 Root · 2 Inner · 3 Inner · 4 Leaf · 5 Leaf · 6 Inner · 7 Leaf",
        explanation:
          "Node 1 is the double-match: p_id IS NULL and id 1 also appears in other rows' p_id — 'Root' must win, so the CASE tests it FIRST. Adding row (6,3) flips 3 from its official 'Leaf' to 'Inner': type is a whole-tree property, not a per-row one. 4, 5 and 7 have parents but nobody calls them parent.",
      },
      {
        input: "Tree: (1,null) — one row, the whole tree (official example 2)",
        output: "1 Root",
        explanation:
          "The lone node fails the 'is a parent' test — the p_id column holds nothing at all — but passes the NULL test, so it prints Root. Drop the NULL branch and the same row would print Leaf: the degenerate tree is where branch order shows its teeth.",
      },
    ],
    constraints: [
      "id is unique; p_id is the parent's id and is NULL exactly once — for the root",
      "the input is always a valid tree: one root, no cycles",
      "every node lands in exactly one of Root / Inner / Leaf",
    ],
    breakdown: [
      "Three labels, two questions per node: does it have a parent (p_id IS NULL or not), and is it a parent (does its id appear in anyone else's p_id)? Root: no parent. Inner: parent AND parent-of-someone. Leaf: parent but never referenced. Despite the tree shape, no recursion is needed — the parent link is materialized in the table, so classification is a per-row lookup with one set membership test.",
      "The machine is a CASE expression with the tests in the right ORDER. Branch 1: p_id IS NULL → 'Root'. Branch 2: id IN (SELECT p_id FROM Tree) → 'Inner'. ELSE → 'Leaf'. CASE evaluates top-down and stops at the first true branch, and the seed's node 1 matches BOTH tests — its id sits in rows 2 and 3's p_id — so branch order is the algorithm: check Root first or the root prints Inner.",
      "The IN subquery reads the whole p_id column, NULLs included, which makes the predicate three-valued: a leaf id matches nothing, and with a NULL in the set the IN evaluates to NULL, not FALSE. CASE treats NULL as 'not true', so the ELSE still fires correctly — but never flip this into NOT IN over the raw set: the embedded NULL makes NOT IN false-or-NULL for every row and the query returns nothing. Filter the NULLs first if you ever need the complement.",
      "Assembly is one pass, zero joins: FROM Tree, the CASE, and the expression aliased exactly type — the grader compares column names. And remember the label is a property of the whole tree, not of the row: the seed adds a child to the official example's leaf 3, which promotes 3 to Inner. Same row, bigger tree, different type.",
    ],
    edges: [
      "Branch order IS the algorithm: the root matches BOTH tests (its id is other rows' p_id) — test 'Root' first, or node 1 prints 'Inner'.",
      "The p_id set contains a NULL (row 1), so id IN (...) is three-valued: unmatched ids get NULL, CASE reads that as no, and ELSE 'Leaf' fires. The complement must NOT be written as a raw NOT IN.",
      "Type is a whole-tree property: adding one child (row (6,3)) flips node 3 from Leaf to Inner — the official 'Leaf' was true of a smaller tree.",
      "Degenerate trees: a single node passes only the NULL test → Root; in a two-node tree the child already prints Leaf (parent, no children).",
    ],
    ladder: [
      {
        title: "Brute force — two probes per node",
        body: "Per row, one correlated EXISTS asking 'does anyone call me parent?' plus the IS NULL check, then map the two booleans to a label. Correct but two probes per row, and easy to swap the Inner/Leaf labels while writing the map.",
      },
      {
        title: "The pattern — the ordered CASE",
        body: "One pass with CASE: NULL parent → Root; id present in the p_id set → Inner; else Leaf. The subquery materializes the parent set once and CASE's first-match-wins semantics encode the precedence for free.",
      },
      {
        title: "The optimal idea — the same shape, join-flavored",
        body: "The CASE form is already optimal; the only refinement worth knowing is the LEFT JOIN variant (child.p_id = t.id, test child.id IS NULL) which makes 'has children' explicit — at the cost of a join and a GROUP BY guard, since a node can parent many rows.",
      },
    ],
    approach: "Ordered CASE: NULL-parent test first, then IN the parent-id set",
    schema: {
      ddl: `CREATE TABLE Tree (
  id   INTEGER PRIMARY KEY,
  p_id INTEGER                            -- NULL exactly for the root
);`,
      seed: `INSERT INTO Tree (id, p_id) VALUES
  (1, NULL),  -- official: the root — also 2 and 3's parent (matches BOTH tests)
  (2, 1),     -- official
  (3, 1),     -- official: a LEAF in the official example — promoted below
  (4, 2),     -- official leaf
  (5, 2),     -- official leaf
  (6, 3),     -- trap: gives 3 a child → 3 flips Leaf → Inner
  (7, 6);     -- trap: deep leaf at the end of the 1 → 3 → 6 → 7 chain`,
      tables: [
        { name: "Tree", note: "7 nodes, one valid tree rooted at 1; chain 1→3→6→7 plus 2's subtree" },
      ],
    },
    code: `SELECT
    id,
    CASE
        WHEN p_id IS NULL                       -- no parent: the root...
            THEN 'Root'                         -- ...and this test MUST run first:
                                                -- the root's id also appears in p_id
        WHEN id IN (SELECT p_id FROM Tree)      -- someone calls this node parent
                                                -- (set holds a NULL; unmatched ids
                                                --  yield NULL, which CASE reads as no)
            THEN 'Inner'
        ELSE 'Leaf'                             -- has a parent, is nobody's parent
    END AS type
FROM Tree
ORDER BY id;`,
    walkthrough: [
      "The CASE runs top-down per row. Node 1: p_id IS NULL fires first → 'Root' — even though id 1 appears in rows 2 and 3's p_id; branch order is what protects it from the double match.",
      "Nodes 2 and 3 have parents AND appear in someone's p_id (2 is 4 and 5's parent; 3 is 6's) → 'Inner'. Node 6 earns it the same way via the trap row (7,6).",
      "Nodes 4, 5 and 7 fail both tests — parents exist, but no row names them as p_id → ELSE 'Leaf'. The IN set contained row 1's NULL and the leaves still classified correctly, because NULL is 'not true', not an error.",
      "ORDER BY id prints the seven-row report: Root, Inner, Inner, Leaf, Leaf, Inner, Leaf — with 3's flip from its official Leaf label documented by the seed.",
    ],
    time: "O(n) — one scan; the IN-set build and ORDER BY id ride the primary key, so in practice this is table order",
    space: "O(n) — the materialized parent-id set",
    followUps: [
      "Depth and subtree size: a recursive CTE walking parent → child from the root turns this adjacency list into a real traversal — compute each node's depth and descendant count.",
      "What breaks on a FOREST (two NULL-p_id rows)? Nothing — every root prints Root; only the 'valid tree' promise makes the Root label unique.",
    ],
    related: ["employees-earning-more-than-their-managers", "managers-with-at-least-5-direct-reports", "the-number-of-employees-which-report-to-each-employee"],
    order: "any",
    xp: 20,
  },
  {
    slug: "actors-and-directors-who-cooperated-at-least-three-times",
    statement:
      "A collaboration log carries one row per actor-director joint work, stamped with a timestamp. Report every (actor_id, director_id) pair that has worked together at least three times.",
    examples: [
      {
        input:
          "ActorDirector: (1,1,0),(1,1,1),(1,1,2) · (1,2,3),(1,2,4) · (2,1,5),(2,1,6) — official — then the traps: (3,3,7..10) FOUR cooperations, (2,2,12),(2,2,13) exactly two, (1,3,11) a singleton",
        output: "actor_id: 1 · director_id: 1 / actor_id: 3 · director_id: 3",
        explanation:
          "Pair (1,1) hits EXACTLY 3 — the >= boundary. Pair (3,3) cooperated 4 times and still prints ONCE — the answer is pairs, not events. (1,2), (2,1) and (2,2) stop at 2: the reversed pair is a DIFFERENT pair, and exactly-two does not qualify. The timestamps 0–13 never enter the logic.",
      },
    ],
    constraints: [
      "timestamp is the primary key — every cooperation is exactly one row",
      "pairs are ORDERED: (1,2) and (2,1) are different pairs",
      "at least THREE cooperations qualify; a qualifying pair prints once regardless of how many times it cooperated",
    ],
    breakdown: [
      "The unit of the answer is the pair (actor_id, director_id), ordered: (1,2) and (2,1) are different collaborations and must never merge. The timestamp column identifies rows but plays no role in the rule — 'at least three times' counts cooperation rows per pair. So the whole problem is: group by the pair, count rows, keep the groups whose count crosses 3.",
      "The mechanism is the minimal GROUP BY/HAVING sentence in the catalog: GROUP BY actor_id, director_id + HAVING COUNT(*) >= 3. No join, no window, no subquery. GROUP BY collapses the seed's fourteen rows to six pairs; HAVING — not WHERE — does the gating, because the filter key (COUNT) only exists after groups form.",
      "WHERE COUNT(*) >= 3 is illegal — aggregates are invisible to WHERE and filtered in HAVING. Counting COUNT(DISTINCT timestamp) instead of * happens to agree on this data because timestamp is the primary key (every row is already distinct), but the rule counts cooperations, and rows ARE cooperations — COUNT(*) is the honest expression. And grouping by actor_id alone invents cross-director totals that never happened: the grain is the pair.",
      "Output is just the two group keys, aliased exactly actor_id and director_id. A pair with four cooperations still prints once — grouping is the dedupe. Boundary watch: the official pair (1,1) sits exactly ON 3, and the engineered (2,2) sits exactly on 2, so both edges of the >= 3 line are pinned by data.",
    ],
    edges: [
      "The boundary: (1,1) qualifies with EXACTLY three rows and (2,2) stops at exactly two — >= 3 is the whole rule; strict > drops the official answer, >= 4 drops it too.",
      "A pair with FOUR cooperations — (3,3) — prints ONCE: GROUP BY is the dedupe; the question asks for pairs, not events.",
      "(2,1) is a different pair from (1,1): the swap does not merge, and (2,1)'s own count of 2 keeps it out — grouping by the ordered pair is what makes that true.",
      "timestamp is a decoy: as the PK it's unique per row, so COUNT(*) and COUNT(DISTINCT timestamp) agree on legal data — but count cooperations (rows), and never dedupe what the schema already makes unique.",
    ],
    ladder: [
      {
        title: "Brute force — probe each pair",
        body: "Collect the distinct pairs, then run a correlated COUNT(*) per pair over the whole log: O(pairs × rows) rescans of the same table. The right answer at the wrong cost, and it re-derives a grouping the engine would do once.",
      },
      {
        title: "The pattern — group the pair, gate with HAVING",
        body: "GROUP BY actor_id, director_id + HAVING COUNT(*) >= 3: one sort collapses the log to per-pair counts and the gate keeps the qualifiers. This two-line sentence is the canonical shape of every 'at least k occurrences' request.",
      },
      {
        title: "The optimal idea — the GROUP BY form IS optimal",
        body: "Nothing beats the single grouped pass; the judgment calls are all semantic — ordered pairs (never normalize), rows as the count (timestamp is a decoy), and the >= boundary. Pin each with seed data and the query writes itself.",
      },
    ],
    approach: "GROUP BY ordered pair + HAVING COUNT(*) >= 3",
    schema: {
      ddl: `CREATE TABLE ActorDirector (
  actor_id    INTEGER NOT NULL,
  director_id INTEGER NOT NULL,
  timestamp   INTEGER PRIMARY KEY        -- one row per cooperation event
);`,
      seed: `INSERT INTO ActorDirector (actor_id, director_id, timestamp) VALUES
  (1, 1, 0), (1, 1, 1), (1, 1, 2),   -- official: pair (1,1) EXACTLY 3 → qualifies
  (1, 2, 3), (1, 2, 4),              -- official: only TWO → must not appear
  (2, 1, 5), (2, 1, 6),              -- official: REVERSED pair — different from (1,1), also 2
  (3, 3, 7), (3, 3, 8),              -- trap: FOUR cooperations...
  (3, 3, 9), (3, 3, 10),             -- ...still ONE output row
  (1, 3, 11),                        -- trap: singleton noise
  (2, 2, 12), (2, 2, 13);            -- trap: exactly 2 — the boundary guard`,
      tables: [
        { name: "ActorDirector", note: "14 cooperation rows over 6 ordered pairs; only (1,1)×3 and (3,3)×4 clear the bar" },
      ],
    },
    code: `SELECT
    actor_id,
    director_id
FROM ActorDirector
GROUP BY actor_id, director_id     -- one row per ORDERED pair — the dedupe
HAVING COUNT(*) >= 3               -- rows ARE cooperations; >=, never >
ORDER BY actor_id, director_id;    -- deterministic; the facts allow any order`,
    walkthrough: [
      "GROUP BY collapses the 14 seed rows to 6 ordered pairs with counts: (1,1)×3, (1,2)×2, (2,1)×2, (2,2)×2, (3,3)×4, (1,3)×1.",
      "HAVING COUNT(*) >= 3 keeps (1,1) — sitting exactly ON the boundary — and (3,3), whose four cooperations still form ONE group and print one row.",
      "(1,2) and (2,1) each stop at 2 and stay out: the reversed pair never merged into (1,1)'s tally, and two is not three. The engineered (2,2) is the same lesson at a different pair.",
      "The timestamps 0–13 appear nowhere in the logic — they only guarantee one row per event. Output: (1,1) then (3,3).",
    ],
    time: "O(n log n) — the GROUP BY sort over n cooperation rows",
    space: "O(p) — one row per distinct pair p",
    followUps: [
      "Return the cooperation count alongside the pair: SELECT the keys plus COUNT(*) AS cooperation_count — same grouping, one extra output column.",
      "Treat pairs as UNORDERED: normalize each row to (MIN(actor_id, director_id), MAX(...)) before grouping — then (1,2) and (2,1) merge into one bucket.",
    ],
    related: ["duplicate-emails", "classes-more-than-5-students", "percentage-of-users-attended-a-contest"],
    order: "any",
    xp: 10,
  },
  {
    slug: "product-price-at-a-given-date",
    statement:
      "A price-history table records each product's changes as (product, new price, date), and every product launched at price 10. Report every product's price as of 2019-08-16: the latest change dated on or before that day, or 10 for products never changed by then.",
    examples: [
      {
        input:
          "Products: p1 20@08-14 · p2 50@08-14 · p1 30@08-15 · p1 35@08-16 · p2 65@08-17 · p3 20@08-18 — official — then the traps: p5 99@08-01 (changed long before), p4 12@08-20 + 14@08-25 (first change AFTER the cutoff), p1 40@08-19 (post-cutoff jump)",
        output: "product_id: 1 · price: 35 / product_id: 2 · price: 50 / product_id: 3 · price: 10 / product_id: 4 · price: 10 / product_id: 5 · price: 99",
        explanation:
          "p1's latest change ON or before 08-16 is 08-16 itself — inclusive — so 35; its 08-19 jump to 40 is future history. p2 ignores its 08-17 repricing. p3 and p4 have no pre-cutoff change at all (p4's 12 and 14 exist only later) → the launch price 10. p5's lone early change still rules: 99.",
      },
    ],
    constraints: [
      "(product_id, change_date) is the primary key — at most one change per product per day",
      "every product starts life at price 10",
      "report EVERY product in the table, priced at the fixed date 2019-08-16",
    ],
    breakdown: [
      "'Price at a date' is an as-of question: for each product, take the latest change dated on or before 2019-08-16 — inclusive — and if no such change exists, fall back to the launch price 10. The output covers every product that appears in the table, including products whose entire history is in the future. Three sub-problems, then: find the latest qualifying change, fetch its price, and manufacture a default for the products with none.",
      "Step one is a cutoff CTE: SELECT product_id, MAX(change_date) WHERE change_date <= '2019-08-16' GROUP BY product_id — the last change that has happened yet, per product. Step two joins back to Products on (product_id, change_date) to fetch that row's new_price. This aggregate-then-join is the as-of join pattern; every 'latest row per group' question is this shape.",
      "The default branch is where naive answers die. An INNER JOIN to the cutoff CTE silently drops products 3 and 4 — their earliest changes are after the date, yet they must print 10. So the outer query LEFT JOINs from the full product roster (SELECT DISTINCT product_id) and wraps the price in COALESCE(new_price, 10): wherever no cutoff row exists, NULL flows through and the launch price appears. The never-changed branch falls out of the join for free instead of needing a second query.",
      "The pair PK (product_id, change_date) guarantees one change per product per day, so MAX(change_date) is unambiguous — there is no same-day tie to break, and the join-back on (product_id, change_date) matches exactly one row. The classic alternative is a two-branch UNION (changed products vs. anti-joined never-changed ones); the LEFT JOIN + COALESCE form expresses the same union inside one statement.",
    ],
    edges: [
      "The cutoff is INCLUSIVE: product 1 changed to 35 exactly ON 2019-08-16 — that's the answer; a strict < prints 30.",
      "Future history stays invisible: p2's 08-17 → 65, p1's 08-19 → 40 and p4's whole existence (08-20, 08-25) change nothing.",
      "Products with no pre-cutoff change (p3, p4) must still print — an INNER JOIN to the cutoff CTE loses them; LEFT JOIN + COALESCE(new_price, 10) is the default-branch machine.",
      "Same-day changes can't tie: the pair PK allows one change per product-day, so MAX(change_date) is well-defined and the join-back hits exactly one row.",
    ],
    ladder: [
      {
        title: "Brute force — probe and union by hand",
        body: "Per product, a correlated subquery for MAX(change_date) among rows <= cutoff, fetch that row's price, then UNION a second query for products with no qualifying row, hardcoding 10. Correct, two scans, and the default branch is the first thing to forget.",
      },
      {
        title: "The pattern — aggregate, then join back",
        body: "The cutoff CTE (MAX date per product) joined back on (product_id, change_date) fetches each product's at-cutoff price in one statement. The as-of join pattern: latest-per-group, then a key-based pickup.",
      },
      {
        title: "The optimal idea — LEFT JOIN the roster, COALESCE the default",
        body: "Drive from SELECT DISTINCT product_id, LEFT JOIN the priced CTE, and COALESCE the price to 10 — the never-changed products need no separate branch. Window alternative: ROW_NUMBER() over pre-cutoff rows, take rn = 1, UNION the defaults.",
      },
    ],
    approach: "As-of join: MAX(change_date) cutoff CTE + LEFT JOIN roster + COALESCE default",
    schema: {
      ddl: `CREATE TABLE Products (
  product_id  INTEGER NOT NULL,
  new_price   INTEGER NOT NULL,
  change_date TEXT NOT NULL,                -- 'YYYY-MM-DD'
  PRIMARY KEY (product_id, change_date)     -- at most one change per product-day
);`,
      seed: `INSERT INTO Products (product_id, new_price, change_date) VALUES
  (1, 20, '2019-08-14'),  -- official
  (2, 50, '2019-08-14'),  -- official
  (1, 30, '2019-08-15'),  -- official
  (1, 35, '2019-08-16'),  -- official: change exactly ON the cutoff — inclusive
  (2, 65, '2019-08-17'),  -- official: AFTER the cutoff — invisible
  (3, 20, '2019-08-18'),  -- official: first change after cutoff → default 10
  (5, 99, '2019-08-01'),  -- trap: changed long before the cutoff → stays 99
  (4, 12, '2019-08-20'),  -- trap: p4's FIRST change is after the cutoff → 10
  (4, 14, '2019-08-25'),  -- trap: ...and it moves again later — still 10 at cutoff
  (1, 40, '2019-08-19');  -- trap: p1 jumps to 40 AFTER the cutoff — ignored`,
      tables: [
        { name: "Products", note: "10 change rows for 5 products; cutoff 2019-08-16 → 35 / 50 / 10 / 10 / 99" },
      ],
    },
    code: `WITH cutoff AS (
    -- latest change per product ON or before the report date — inclusive
    SELECT product_id, MAX(change_date) AS change_date
    FROM Products
    WHERE change_date <= '2019-08-16'
    GROUP BY product_id
),
priced AS (
    -- each surviving product's price on 2019-08-16; the (product_id,
    -- change_date) PK makes this join-back exactly one row per product
    SELECT p.product_id, p.new_price
    FROM Products p
    JOIN cutoff c
      ON c.product_id = p.product_id
     AND c.change_date = p.change_date
),
roster AS (
    -- EVERY product in the table — even future-only histories (p3, p4)
    SELECT DISTINCT product_id FROM Products
)
SELECT
    r.product_id,
    COALESCE(pr.new_price, 10) AS price   -- no pre-cutoff change → launch price 10
FROM roster r
LEFT JOIN priced pr ON pr.product_id = r.product_id
ORDER BY r.product_id;`,
    walkthrough: [
      "cutoff keeps, per product, the latest date ≤ 2019-08-16: p1 → 08-16, p2 → 08-14, p5 → 08-01. p3 and p4 have no qualifying row and are simply absent from the CTE.",
      "The join back on (product_id, change_date) fetches exactly one price row per surviving product: 35 for p1 — the ON-the-cutoff change, not the later 40 — 50 for p2 (its 08-17 jump to 65 is future history), and 99 for p5.",
      "The roster CTE lists {1, 2, 3, 4, 5}; LEFT JOIN priced leaves p3 and p4 with NULL prices, and COALESCE turns those into the launch price 10. An INNER JOIN here is the classic silent drop.",
      "ORDER BY product_id prints 35 / 50 / 10 / 10 / 99 — the official trio plus the two engineered defaults.",
    ],
    time: "O(n log n) — the GROUP BY product over n change rows, plus cheap key-based join lookups; every CTE is one pass",
    space: "O(n) — the cutoff, priced and roster CTEs",
    followUps: [
      "Price at EVERY date: cross the calendar of distinct change dates against each product's history and take the latest change ≤ each date — the full as-of join, with windows as the speedup.",
      "Window rewrite: ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY change_date DESC) over pre-cutoff rows, keep rn = 1, and UNION the never-changed products priced 10 — same answer, no COALESCE.",
    ],
    related: ["game-play-analysis-i", "the-latest-login-in-2020", "confirmation-rate"],
    order: "any",
    xp: 20,
  },
];
