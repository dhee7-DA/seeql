// Deep-dives — LeetCode Premium batch II: market & platform analytics (6 problems, 1 Easy / 4 Medium / 1 Hard). Engine-verified by scripts/lc-sql-verify.ts.
// Re-authored from the canonical premium tasks: own tables, own names,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM2_MARKET: LcSqlDive[] = [
  {
    slug: "market-analysis-ii",
    statement:
      "Users holds the marketplace's accounts (user_id, join_date, favorite_brand); Items lists the goods on sale (item_id, item_brand); Orders logs every purchase (order_id, order_date, item_id, buyer_id, seller_id). A MISMATCHED order is one whose seller's favorite_brand differs from the bought item's item_brand. Report buyer_id for every user who became a buyer on or before '2019-12-31' (their join_date) AND who, during 2019, placed at least two mismatched orders on DIFFERENT days. Output one column, buyer_id, ordered ascending.",
    examples: [
      {
        input:
          "buyer 1 joined 2018-09-02 · order 901 on 2019-03-04 buys item 102 (Forge & Field) from seller 2 (favors Prime Line) · order 902 on 2019-06-17 buys item 104 (Prime Line) from seller 3 (favors Forge & Field)",
        output: "1",
        explanation:
          "Two mismatched orders on two distinct 2019 days, from an account that existed before the cutoff — every gate passed.",
      },
      {
        input:
          "buyer 3 places both mismatched orders on 2019-09-09 · buyer 2 places mismatched orders on two distinct 2019 days but joined 2020-01-15",
        output: "(neither buyer appears)",
        explanation:
          "Buyer 3 owns one distinct day, not two; buyer 2 fails the join gate — 2019 orders cannot rescue a 2020 account.",
      },
    ],
    constraints: [
      "a mismatched order is a 2019 order whose seller's favorite_brand differs from the ordered item's item_brand — the seller is a Users row too",
      "a buyer qualifies with at least two mismatched orders on two DISTINCT order_date values, and only if their join_date is on or before 2019-12-31",
      "the join-date gate applies to the user's account, never to their individual orders",
      "one column buyer_id, ordered ascending",
    ],
    breakdown: [
      "The predicate crosses three tables at once. Every order names an item and a seller; the seller is a full Users row whose favorite_brand must be laid against the bought item's item_brand. That forces Orders to join Users TWICE — once for the buyer, to fetch join_date, and once for the seller, to fetch favorite_brand — plus Items once. Two aliases over one table with two different jobs is the pattern; collapsing them into a single join is the classic first mistake, and it fails on ambiguous or missing columns before the logic is even tested.",
      "'At least two orders on different days' is not 'at least two orders'. Buyer 3's two mismatches share the single date 2019-09-09: a bare COUNT(*) sees two qualifying rows and wrongly passes them, while COUNT(DISTINCT order_date) sees one day and correctly fails them. Because the mismatch test lives in WHERE, matched orders never reach the counter at all — buyer 4's second purchase (a Prime Line item bought from a Prime Line fan) dies before grouping and cannot pad the day count. The DISTINCT is not a nicety; it is the difference between the requirement and its look-alike.",
      "Three gates stack in three different clauses, and knowing which clause owns which gate is the real exercise. The join-date test is an attribute of the USER row, so it filters joined rows in WHERE — buyer 2's otherwise-perfect order history is irrelevant because the account itself was created in 2020. The year test gates each individual ORDER, also in WHERE. The distinct-days test judges a GROUP, so it belongs to HAVING: putting a group test in WHERE is a syntax error, while hiding a user test in HAVING merely wastes groups that never had a chance.",
    ],
    edges: [
      "Users must be aliased twice — the buyer side supplies join_date, the seller side supplies favorite_brand; one alias cannot serve both roles.",
      "COUNT(DISTINCT order_date), not COUNT(*): buyer 3's two same-day mismatches make COUNT(*) = 2 but distinct days = 1 — exactly the inflation the DISTINCT prevents.",
      "The join-date gate rides on the user row: buyer 2's orders would all qualify, yet join_date 2020-01-15 removes the buyer before grouping — filtering the ORDERS by the join date instead would be a category error.",
      "Buyer 4's 2019-12-21 order matches brands (item 101, Prime Line, bought from seller 2 who favors Prime Line) — the WHERE mismatch test drops it, so it can never feed the day count.",
      "Every seed order sits inside 2019, so the year guard never fires on this data — it is not decorative in general.",
    ],
    ladder: [
      {
        title: "Brute force — a spreadsheet per buyer",
        body: "Pull Users, Items and Orders, walk each buyer's purchases, look up each seller's favorite brand and each item's brand, and tally mismatched days by hand. The three-table chase is exactly what a join chain automates.",
      },
      {
        title: "The pattern — join, filter, group, HAVING",
        body: "Orders to Users(buyer) plus Users(seller) plus Items; WHERE removes non-mismatched rows and late-joining accounts; GROUP BY buyer with HAVING COUNT(DISTINCT order_date) >= 2.",
      },
      {
        title: "The optimal idea — give each gate its own clause",
        body: "O(o log o). The durable habit: row-attribute gates go in WHERE, group-attribute gates in HAVING, and 'different days' always smells like COUNT(DISTINCT) over the date column — never a plain row count.",
      },
    ],
    approach:
      "Join Orders to Users twice (buyer + seller) and Items once, filter 2019 mismatches, GROUP BY buyer, HAVING COUNT(DISTINCT order_date) >= 2",
    schema: {
      ddl: `CREATE TABLE Users (
  user_id        INTEGER PRIMARY KEY,
  join_date      TEXT NOT NULL,  -- 'YYYY-MM-DD'
  favorite_brand TEXT NOT NULL
);
CREATE TABLE Items (
  item_id    INTEGER PRIMARY KEY,
  item_brand TEXT NOT NULL
);
CREATE TABLE Orders (
  order_id   INTEGER PRIMARY KEY,
  order_date TEXT NOT NULL,
  item_id    INTEGER NOT NULL REFERENCES Items(item_id),
  buyer_id   INTEGER NOT NULL REFERENCES Users(user_id),
  seller_id  INTEGER NOT NULL REFERENCES Users(user_id)
);`,
      seed: `INSERT INTO Users (user_id, join_date, favorite_brand) VALUES
  (1, '2018-09-02', 'Prime Line'),
  (2, '2020-01-15', 'Prime Line'),  -- joined after the gate: excluded however perfect the orders
  (3, '2019-05-10', 'Forge & Field'),
  (4, '2019-11-30', 'Northlight');
INSERT INTO Items (item_id, item_brand) VALUES
  (101, 'Prime Line'),
  (102, 'Forge & Field'),
  (103, 'Northlight'),
  (104, 'Prime Line');
INSERT INTO Orders (order_id, order_date, item_id, buyer_id, seller_id) VALUES
  (901, '2019-03-04', 102, 1, 2),  -- Forge & Field vs seller 2's Prime Line: mismatch, buyer 1 day 1
  (902, '2019-06-17', 104, 1, 3),  -- Prime Line vs seller 3's Forge & Field: mismatch, buyer 1 day 2
  (903, '2019-08-01', 102, 2, 1),  -- mismatch, buyer 2 day 1 (the join gate decides later)
  (904, '2019-10-05', 104, 2, 4),  -- mismatch, buyer 2 day 2
  (905, '2019-09-09', 102, 3, 2),  -- mismatch
  (906, '2019-09-09', 104, 3, 4),  -- mismatch, SAME day as 905: distinct days stay 1
  (907, '2019-12-20', 103, 4, 1),  -- Northlight vs Prime Line: buyer 4's only mismatched day
  -- 908's brands match (Prime Line vs Prime Line): dies in WHERE, cannot pad the day count
  (908, '2019-12-21', 101, 4, 2);`,
      tables: [
        { name: "Users", note: "4 accounts — user 2 joined in 2020, after the gate" },
        { name: "Items", note: "4 items across 3 brands — Prime Line appears twice" },
        { name: "Orders", note: "8 orders, all 2019 — buyer 3 double-books one day, buyer 4's second order matches brands" },
      ],
    },
    code: `SELECT
    o.buyer_id
FROM Orders o
JOIN Users b ON b.user_id = o.buyer_id   -- buyer side: carries the join gate
JOIN Users s ON s.user_id = o.seller_id  -- seller side: carries favorite_brand
JOIN Items i ON i.item_id = o.item_id
WHERE b.join_date <= '2019-12-31'                          -- user-level gate: the account existed
  AND o.order_date BETWEEN '2019-01-01' AND '2019-12-31'   -- order-level gate: the year
  AND s.favorite_brand <> i.item_brand                     -- the mismatch itself
GROUP BY o.buyer_id
HAVING COUNT(DISTINCT o.order_date) >= 2                   -- group-level gate: two DIFFERENT days
ORDER BY o.buyer_id;`,
    walkthrough: [
      "The join chain resolves each order three ways: order 901 (buyer 1, seller 2, item 102) — seller 2 favors Prime Line, the item is Forge & Field, and buyer 1 joined in 2018, so a mismatched 2019 row from a timely account. Order 902 repeats the shape (Prime Line against seller 3's Forge & Field) and buyer 1 now owns two mismatched days.",
      "Buyer 2's orders 903 and 904 are mismatches on distinct days, but the buyer row itself says join_date 2020-01-15 — the WHERE gate removes every buyer-2 row before any grouping. Buyer 3's 905 and 906 both sit on 2019-09-09: two rows, one day. Buyer 4's 908 matches brands and dies in WHERE, leaving 2019-12-20 as their only mismatched day.",
      "GROUP BY buyer_id forms four candidate groups; HAVING keeps only the group holding two distinct mismatched days — buyer 1. Output: the single row 1.",
    ],
    time: "O(o log o) — the join plus one grouped pass over the orders",
    space: "O(o) — the joined rows before grouping",
    followUps: [
      "Flip the predicate to MATCHED orders (seller's favorite brand equals the item's brand) — which seed buyers survive, and what does the flip teach about keeping the whole join chain while only one WHERE conjunct changes?",
      "Add a per-buyer column counting distinct mismatched days for every timely 2019 buyer, including zeros — which gate moves from HAVING into the SELECT, and who now needs a LEFT JOIN to stay visible?",
      "What changes if 'different days' becomes 'different ISO weeks' — does COUNT(DISTINCT strftime('%W', order_date)) hold up at year boundaries?",
    ],
    related: ["market-analysis-i", "product-sales-analysis-iii", "user-activity-for-the-past-30-days-i"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "page-recommendations",
    statement:
      "Friendship stores the social graph as one row per friend pair (user1_id, user2_id) — each pair is stored ONCE, in whichever direction it happened to be recorded, so user 1 may sit on either side of the row. Likes records every page like (user_id, page_id). For user_id = 1, recommend every page that at least one of user 1's friends has liked AND that user 1 has not liked. Output one column, page_id, ordered ascending.",
    examples: [
      {
        input:
          "friend 2 — recorded as the reversed row (2,1) — likes pages 21, 24 and 25 · user 1 has already liked page 21",
        output: "24 · 25 (from this friend)",
        explanation:
          "Reversed storage still makes 2 a friend of user 1; their like of page 21 collides with user 1's own and is dropped.",
      },
      {
        input: "page 24 is liked by both friend 2 and friend 3 · page 28 is liked by user 5, who is only a friend of friend 2",
        output: "24 appears once · 28 does not appear",
        explanation:
          "Two friends liking the same page print one row; a friend of a friend is two hops away and out of scope.",
      },
    ],
    constraints: [
      "user 1's friends are the OTHER endpoints of every Friendship row where user 1 sits on either side — storage direction is irrelevant",
      "a recommended page must be liked by at least one friend and must not appear in any of user 1's own Likes rows",
      "each qualifying page prints exactly once — one column page_id, ordered ascending",
    ],
    breakdown: [
      "Storage direction is a fact about the log, not about the friendship. A pair written as (2,1) means exactly what (1,2) would mean, so 'user 1's friends' is the set of OTHER endpoints over rows matching user 1 on either side. The two-armed UNION in the CTE normalizes this: one arm takes user2_id from rows where user1_id = 1, the other takes user1_id from rows where user2_id = 1. Write only one arm and the seed's reversed rows (2,1) and (4,1) vanish — half the friend graph silently disappears.",
      "The recommendation itself is an anti-join: pages from friends MINUS pages of user 1. NOT EXISTS against user 1's Likes rows expresses 'user 1 has not liked this' without any assumption about NULLs, and it composes cleanly with the join that fetches friends' likes. The seed plants the collision: friend 2 likes page 21, which user 1 also likes — the anti-join removes it so the feed never echoes the user's own taste back.",
      "Duplication comes from two directions, and DISTINCT absorbs both. Page 24 arrives twice because two different friends like it — the per-friend join fans out — while page 21's collision is already gone by the time DISTINCT runs. One hop is the boundary: user 5 likes page 28, but 5 is reachable only THROUGH friend 2, and the CTE's WHERE clauses never admit them. A two-hop recommender would need a second UNION level — a deliberate expansion, not an accident of a loose join.",
    ],
    edges: [
      "Two of the three real friendships are stored reversed ((2,1) and (4,1) with user 1 on the right); a one-armed join finds only friend 3 and outputs 2 pages instead of 4.",
      "Friend-of-friend: user 5's like of page 28 must never surface — 5 shares a Friendship row with friend 2, not with user 1.",
      "Overlap plus dedup: friend 2's like of page 21 collides with user 1's own like and dies in the anti-join, while page 24 liked by two friends collapses to one output row via DISTINCT.",
      "NOT EXISTS (rather than NOT IN) is the habit here: it is NULL-proof, so the anti-join stays correct even if Likes ever carried a NULL page_id.",
    ],
    ladder: [
      {
        title: "Brute force — hand-traced adjacency",
        body: "Scan Friendship for every row touching user 1 (both orientations), collect the other endpoints, then walk each friend's Likes and cross out pages user 1 already likes. Correct once, unrepeatable at scale.",
      },
      {
        title: "The pattern — UNION, join, anti-join",
        body: "A two-armed UNION CTE yields user 1's friends; join their Likes; NOT EXISTS removes user 1's own pages; DISTINCT and ORDER BY shape the output.",
      },
      {
        title: "The optimal idea — normalize at read time",
        body: "O(f + p). Storage may keep one arbitrary direction per pair; the read query pays once to canonicalize it. Any 'relationship stored loosely' problem — follows, friendships, request pairs — solves the same way: define the canonical edge in a CTE, then reason about the clean graph.",
      },
    ],
    approach:
      "Two-armed UNION CTE canonicalizes friend edges, join friends' Likes, NOT EXISTS drops user 1's own pages, DISTINCT dedupes",
    schema: {
      ddl: `CREATE TABLE Friendship (
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL
);
CREATE TABLE Likes (
  user_id INTEGER NOT NULL,
  page_id INTEGER NOT NULL
);`,
      seed: `INSERT INTO Friendship (user1_id, user2_id) VALUES
  (2, 1),  -- user 2 is user 1's friend: stored REVERSED
  (1, 3),  -- user 3: stored forward
  (4, 1),  -- user 4: stored REVERSED too
  (2, 5);  -- user 5 is friend-of-friend only: no row touches user 1
INSERT INTO Likes (user_id, page_id) VALUES
  (1, 21),  -- user 1's own taste
  (1, 23),
  (2, 21),  -- friend 2 likes what user 1 already likes: the overlap trap
  (2, 24),
  (2, 25),
  (3, 24),  -- a second like of page 24 from a different friend: dedup fodder
  (3, 26),
  (4, 27),
  -- user 5's like: friend-of-friend, must stay invisible
  (5, 28);`,
      tables: [
        { name: "Friendship", note: "4 edges — three touch user 1, two of them stored reversed; (2,5) is the friend-of-friend decoy" },
        { name: "Likes", note: "9 likes — page 24 liked by two friends, page 21 liked by both user 1 and friend 2" },
      ],
    },
    code: `WITH friends AS (
    SELECT user2_id AS friend_id FROM Friendship WHERE user1_id = 1  -- user 1 on the left
    UNION
    SELECT user1_id AS friend_id FROM Friendship WHERE user2_id = 1  -- user 1 on the right
)
SELECT DISTINCT l.page_id
FROM friends f
JOIN Likes l ON l.user_id = f.friend_id                  -- pages the friends like
WHERE NOT EXISTS (
    SELECT 1 FROM Likes mine
    WHERE mine.user_id = 1 AND mine.page_id = l.page_id  -- ...except user 1's own
)
ORDER BY l.page_id;`,
    walkthrough: [
      "The CTE reads Friendship both ways: row (2,1) yields friend 2, (1,3) yields 3, (4,1) yields 4; row (2,5) touches user 1 on neither side and never enters. Friends of user 1 = {2, 3, 4}.",
      "Joining Likes over those friends gathers pages 21, 24, 25 (friend 2), 24, 26 (friend 3) and 27 (friend 4) — page 24 arriving twice, page 28 absent because user 5 was never a candidate.",
      "NOT EXISTS strikes page 21 (user 1 likes it themselves); DISTINCT collapses page 24's duplicate; ORDER BY prints 24, 25, 26, 27.",
    ],
    time: "O(f + p) — one pass over friendship edges and likes",
    space: "O(f + p) — the friend set and the gathered pages",
    followUps: [
      "Rank the recommendations by how many DISTINCT friends like each page, strongest first — what replaces DISTINCT, and how do ties break deterministically?",
      "Extend to two hops (friends of friends) while still excluding pages user 1 or any direct friend already likes — how many UNION arms does the hop CTE need, and what stops a page from being recommended twice?",
    ],
    related: ["page-recommendations-ii", "strong-friendship", "customers-who-never-order"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "running-total-for-different-genders",
    statement:
      "Scores tracks tournament results (player_name, gender, day, score_points) — one row per player per day, and no two rows of the SAME gender share a day. For every row, compute the running total of score_points accumulated by that gender through and including that row's day (days ascending). Output columns gender, day, total — the female rows first, then the male rows, each block ordered by day.",
    examples: [
      {
        input:
          "female days so far: Aveline 560 (2019-02-01), Priya 380 (2019-02-05) · Sora scores 420 on 2019-02-09",
        output: "F · 2019-02-09 · 1360",
        explanation:
          "560 + 380 + 420 — Sora's row carries everything her gender has scored up to and including her day.",
      },
      {
        input:
          "male days: Dmitri 450 (2019-02-02), Kenji 510 (2019-02-06), Omar 300 (2019-02-11), Luca 770 (2019-02-16)",
        output: "M blocks run 450 · 960 · 1260 · 2030",
        explanation:
          "The male partition accumulates independently — female totals never leak in, and Luca's row equals the male grand total.",
      },
    ],
    constraints: [
      "the running total spans the row's OWN gender only, accumulated in ascending day order",
      "output columns gender, day, total — the female block precedes the male block and each block is day-ordered",
      "every input row appears exactly once in the output, beside its own running total",
    ],
    breakdown: [
      "A running total is a window aggregate, not a GROUP BY: every row survives, and each one is annotated with a sum over a SLICE of the table. PARTITION BY gender splits the eight rows into two independent streams so female totals never see male points, and ORDER BY day inside the window defines the accumulation order. The window's ORDER BY and the output's ORDER BY are two different instruments — one orders the arithmetic inside each partition, the other orders the presentation of the final rows. Conflating them is the standard beginner tangle.",
      "The default frame is doing quiet work. With an ORDER BY in the OVER clause, SQLite frames the sum as RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE treats PEERS (rows equal on the window's ORDER BY key) as one unit, adding the whole tie group to every member's total. This seed is safe by construction: no gender repeats a day, so every peer group holds exactly one row and RANGE behaves exactly like the row-at-a-time framing you intended. Let two female rows share a day and each of their totals would leap by BOTH points; the repair is an explicit ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, or a tiebreaker column inside the window's ORDER BY.",
      "Presentation wants the female block first. The reflex is ORDER BY gender DESC — descending because females come first — and the reflex is wrong: in ASCII, 'F' is 70 and 'M' is 77, so 'F' sorts BELOW 'M' and descending order parades the male block first. Plain ascending ORDER BY gender already yields females first, and an explicit CASE key (CASE gender WHEN 'F' THEN 0 ELSE 1 END) states the intent without leaning on byte values at all. Either way the secondary key, day, stays ascending so each block reads chronologically.",
    ],
    edges: [
      "ORDER BY gender DESC is the trap, not the trick: 'F' (ASCII 70) sorts below 'M' (77), so DESC would print the MALE block first — ascending order, or an explicit CASE key, is what puts females first.",
      "The seed is one-row-per-day per gender on purpose: under the default RANGE frame, two same-day rows of one gender would each swallow the whole tie group's points — ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is the pin for seeds that can tie.",
      "Equal days across the two genders can never collide: PARTITION BY gender isolates each stream before the window ORDER BY is applied (this seed keeps even the global days disjoint, but the partition alone would suffice).",
      "A built-in sanity probe: each partition's last row equals that gender's grand total — female 2000, male 2030.",
    ],
    ladder: [
      {
        title: "Brute force — sort and accumulate by hand",
        body: "Split the rows by gender, sort each pile by day, keep a tally as you walk. The window function is exactly this pile-walk, performed by the engine.",
      },
      {
        title: "The pattern — a partitioned running sum",
        body: "SUM(score_points) OVER (PARTITION BY gender ORDER BY day) annotates every row; the outer ORDER BY shapes the report.",
      },
      {
        title: "The optimal idea — control the frame, not just the order",
        body: "O(n log n). Know what the default frame is (RANGE) and when it deviates from ROWS: ties on the window ORDER BY key. Data with possible peer values demands an explicit ROWS frame or a tiebreaker — the one-line difference between a running total and a jumping one.",
      },
    ],
    approach:
      "SUM(...) OVER (PARTITION BY gender ORDER BY day) with an ascending gender key so the female block prints first",
    schema: {
      ddl: `CREATE TABLE Scores (
  player_name  TEXT NOT NULL,
  gender       TEXT NOT NULL,  -- 'F' or 'M'
  day          TEXT NOT NULL,  -- 'YYYY-MM-DD'
  score_points INTEGER NOT NULL
);`,
      seed: `INSERT INTO Scores (player_name, gender, day, score_points) VALUES
  ('Aveline', 'F', '2019-02-01', 560),
  ('Dmitri',  'M', '2019-02-02', 450),
  ('Priya',   'F', '2019-02-05', 380),
  ('Kenji',   'M', '2019-02-06', 510),
  ('Sora',    'F', '2019-02-09', 420),
  ('Omar',    'M', '2019-02-11', 300),
  ('Marta',   'F', '2019-02-14', 640),
  -- Luca closes the male partition: his running total lands on 2030
  ('Luca',    'M', '2019-02-16', 770);`,
      tables: [
        { name: "Scores", note: "8 rows — 4 female, 4 male; interleaved in storage and every (gender, day) pair is unique" },
      ],
    },
    code: `SELECT
    gender,
    day,
    SUM(score_points) OVER (
        PARTITION BY gender
        ORDER BY day  -- one row per (gender, day): default RANGE frame equals row-at-a-time here
    ) AS total
FROM Scores
ORDER BY gender ASC, day;  -- 'F' (70) sorts below 'M' (77): the female block prints first`,
    walkthrough: [
      "The window splits the eight rows into two partitions. Female, by day: 560, then 940 (560 + 380), then 1360 (560 + 380 + 420), then 2000. Male, by day: 450, then 960 (450 + 510), then 1260 (450 + 510 + 300), then 2030.",
      "Sora's row on 2019-02-09 carries the sum of every female day up to hers — 560 + 380 + 420 = 1360 — while Kenji's 960 is built from male days only; the two partitions never touch.",
      "The outer ORDER BY gender ASC, day prints the female block first (560 up to 2000), then the male block (450 up to 2030), each in day order.",
    ],
    time: "O(n log n) — one sort per partition",
    space: "O(n) — the annotated rows",
    followUps: [
      "Duplicate the 2019-02-09 female day with a second player — what does the default RANGE frame report for those two rows, and how do an explicit ROWS frame (or a player_name tiebreaker) change it?",
      "Add a per-row percentage: each day's points as a share of the gender's grand total — which window variant computes the denominator, and can the running sum and the share live in one SELECT?",
      "Restart each partition's accumulation at every month boundary — how does the window ORDER BY key change?",
    ],
    related: ["biggest-window-between-events", "monthly-transactions-i", "game-play-analysis-iv"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "students-with-invalid-departments",
    statement:
      "Departments is a school's catalogue (id, name). Students lists enrolled students (id, name, department_id), where department_id is supposed to reference Departments.id — but the data has drifted: some students point at ids that were never issued, and some carry NULL. A student is unattached when their department_id is NULL or matches no catalogue row. Report the name of every unattached student as one column, name, ordered ascending.",
    examples: [
      {
        input: "Quincy's department_id is 4; the catalogue holds ids 1, 2 and 3",
        output: "Quincy is reported",
        explanation:
          "No catalogue row carries id 4, so the reference is dead — the student is unattached.",
      },
      {
        input: "Ravi's department_id is NULL",
        output: "Ravi is reported too",
        explanation:
          "NULL matches no department row — not even another NULL — so a NULL reference is an unattached student. The popular NOT IN spelling would silently drop him (see edges).",
      },
    ],
    constraints: [
      "unattached = department_id IS NULL OR department_id matches no Departments.id",
      "one column name, ordered ascending by name",
      "every unattached student appears exactly once",
    ],
    breakdown: [
      "The request is an anti-join at heart: keep the student rows for which the lookup probe FAILS. NOT EXISTS runs that probe per student — find any Departments row whose id equals this department_id — and keeps the students whose probe returns nothing. It is the natural reading of 'references nothing', and, crucially, it gives NULL the business meaning: no department on file means the probe cannot match, and the student is reported.",
      "The reflex spelling is NOT IN: WHERE department_id NOT IN (SELECT id FROM Departments). On this seed it quietly answers a different question. Ravi's NULL department_id meets NULL NOT IN (1, 2, 3): each comparison NULL <> 1 is UNKNOWN, so the IN predicate yields UNKNOWN, NOT IN negates it to UNKNOWN again, and WHERE keeps only TRUE rows — Ravi evaporates. One student lost, no error raised, and the report is wrong in the mildest, most dangerous way.",
      "The louder version of the same poison lives inside the subquery. NOT IN is well-behaved only while the list it checks against holds zero NULLs — true here because Departments.id is a PRIMARY KEY. The moment one NULL sneaks into that list, x NOT IN (..., NULL) is UNKNOWN for EVERY x and the entire result collapses to the empty set. NOT EXISTS is immune to both directions: it probes rows with = and simply never finds a match for NULL — and LEFT JOIN Departments ... WHERE d.id IS NULL agrees, because a join condition of d.id = NULL also never fires.",
    ],
    edges: [
      "NOT IN drops Ravi: his NULL department_id turns every comparison UNKNOWN and WHERE discards the row — the NOT EXISTS form reports him.",
      "The empty-set flip: NOT IN is safe only while the subquery's list is NULL-free; a single NULL id inside the list makes the predicate UNKNOWN for every row and the whole output goes empty. NOT EXISTS has no such failure mode.",
      "Two NULL locations, two blast radii: a NULL on the student side loses ONE row; a NULL inside the NOT IN list loses ALL rows.",
      "LEFT JOIN Departments ... WHERE d.id IS NULL is equivalent here — the join never fires for Ravi's NULL, so his row survives with an all-NULL department side.",
    ],
    ladder: [
      {
        title: "Brute force — eyeball the catalogue",
        body: "Print both tables and check each student's department_id against the three issued ids. Obvious on six rows, unscalable on six thousand.",
      },
      {
        title: "The pattern — the anti-join, three spellings",
        body: "NOT IN (the reflex), NOT EXISTS (the probe), LEFT JOIN/IS NULL (the shape). They differ only in how NULL is treated — and that difference IS the answer.",
      },
      {
        title: "The optimal idea — make NULL's meaning explicit",
        body: "O(s + d) with an index probe per student. 'Not in the reference table' must include 'no reference at all'; choosing NOT EXISTS encodes that decision in the query instead of leaving it to a silent NULL mishap.",
      },
    ],
    approach: "NOT EXISTS probe of Departments per student — a NULL-proof anti-join, ORDER BY name",
    schema: {
      ddl: `CREATE TABLE Departments (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE Students (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  department_id INTEGER            -- NULL allowed: no department on file
);`,
      seed: `INSERT INTO Departments (id, name) VALUES
  (1, 'Electrical Engineering'),
  (2, 'Marine Biology'),
  (3, 'Fine Arts');
INSERT INTO Students (id, name, department_id) VALUES
  (201, 'Noor',   1),
  (202, 'Pia',    2),
  (203, 'Quincy', 4),    -- id 4 was never issued: dead reference
  (204, 'Ravi',   NULL), -- no department on file at all
  (206, 'Tomas',  7),    -- id 7: another dead reference
  (205, 'Sena',   3);`,
      tables: [
        { name: "Departments", note: "3 catalogue rows — ids 1 through 3, never NULL (PRIMARY KEY)" },
        { name: "Students", note: "6 students — Quincy and Tomas point at unissued ids, Ravi's reference is NULL" },
      ],
    },
    code: `SELECT s.name
FROM Students s
WHERE NOT EXISTS (
    SELECT 1
    FROM Departments d
    WHERE d.id = s.department_id  -- NULL never matches: Ravi's probe finds nothing
)
ORDER BY s.name;`,
    walkthrough: [
      "The probe runs per student: Noor's 1 finds Electrical Engineering, Pia's 2 finds Marine Biology, Sena's 3 finds Fine Arts — all three probes succeed, all three students stay out.",
      "Quincy probes for id 4 and Tomas for id 7 — the catalogue stops at 3, so both probes fail. Ravi's probe compares d.id against NULL: no comparison ever fires, so his probe fails too.",
      "Three unattached students survive the anti-join; ORDER BY name prints Quincy, Ravi, Tomas.",
    ],
    time: "O(s + d) — one indexed probe per student",
    space: "O(1) — nothing materializes beyond the output",
    followUps: [
      "Flip the anti-join: which departments currently have no students at all — and does the NOT IN spelling become safe there, given Departments.id is a PRIMARY KEY that can never be NULL?",
      "Attach every unattached student to the smallest existing department id in a single UPDATE — what does the write's verification SELECT look like, and does the NULL case survive it?",
      "Report each department beside its headcount, plus an 'Unassigned' bucket for the unattached students — where does the COALESCE-style mapping belong?",
    ],
    related: ["customers-who-never-order", "combine-two-tables", "employees-earning-more-than-their-managers"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "number-of-trusted-contacts-of-a-customer",
    statement:
      "Customers registers the platform's users (customer_id, customer_name, email). Contacts stores, per customer, the people they say they trust: each row is (user_id, contact_email). A contact counts as TRUSTED only when contact_email matches some registered customer's email — a row pointing at an unregistered address describes a stranger. Calls logs conversations between registered customers (caller_id, callee_id, duration). For every customer report customer_id, customer_name, trusted_contacts_count (how many of their contact rows are trusted) and total_call_duration (the sum of durations of calls whose caller AND callee are BOTH among that customer's trusted contacts). Customers with no trusted contacts still appear, with 0 and 0. Output ordered by customer_id ascending.",
    examples: [
      {
        input:
          "Ava's contact rows: ben@ (registered), cara@ (registered), zoe@ (unregistered) · calls fully inside {Ben, Cara}: Ben→Cara 14 and Cara→Ben 5",
        output: "Ava · trusted_contacts_count 2 · total_call_duration 19",
        explanation:
          "The zoe@ row is a stranger and vanishes from the count; both Ben-Cara calls have two trusted endpoints, so their durations add.",
      },
      {
        input:
          "Ben trusts Ava and Dov · Cara trusts only Dov · Dov's only contact row points at an unregistered address",
        output: "Ben · 2 · 30 / Cara · 1 · 0 / Dov · 0 · 0",
        explanation:
          "Ben's one fully-trusted call is Dov→Ava (30); a single trusted contact can never supply both ends of a call, so Cara logs 0; Dov has no trusted contacts at all and still appears — 0 and 0.",
      },
    ],
    constraints: [
      "trusted = a Contacts row whose contact_email equals some Customers.email — trust is resolved through the email, never through ids",
      "total_call_duration sums only calls where the caller AND the callee both sit in the SAME customer's trusted set",
      "every customer appears exactly once; zero trusted contacts means 0 and 0, not absence",
      "columns customer_id, customer_name, trusted_contacts_count, total_call_duration — ordered by customer_id",
    ],
    breakdown: [
      "Trust is declared by email and confirmed by the directory. That makes the trusted set a DERIVED relation: Contacts joined to Customers on contact_email = email, projected to (owner, trusted-customer-id). The Customers table consequently plays two different roles in one query — the directory that validates addresses, and the spine the report hangs from — and each role needs its own alias. Sharing one alias across both jobs, or forgetting the second, is where most attempts die at compile time.",
      "The duration figure is a both-endpoints property. A call counts toward customer C only when the caller is in T(C) AND the callee is in T(C) — two probes into the trusted relation under the same owner, which is a two-join pattern over the CTE: t1 matches the caller, t2 matches the callee for the same owner. The seed demonstrates the boundary case: Cara trusts exactly one person, and no call can have both of its ends be that one person, so her duration is legitimately 0 despite a non-zero trusted count.",
      "The two output aggregates must be computed separately. If the trusted rows and the duration rows meet in one flat join, rows multiply: Ava owns two trusted rows and one qualifying-call summary, so the call's 19 would land on both rows and SUM to 38 — a fan-out that inflates every figure. The clean shape computes one row per customer for the count, one row per customer for the duration, and LEFT JOINs both summaries onto the customer spine with COALESCE 0 — which is also what keeps Dov, whose only contact is a stranger, on the report.",
    ],
    edges: [
      "Customers is joined twice under two aliases — reg validates contact emails inside the CTE, cu is the report spine; one alias cannot do both jobs.",
      "Fan-out trap: mixing the count and the duration in a single join doubles Ava's 19 to 38 (2 trusted rows x 1 duration row) — aggregate each fact to one row per customer BEFORE joining.",
      "A lone trusted contact can never host a between-trusted call — Cara's 1/0 row is the shape, not an anomaly.",
      "LEFT JOIN plus COALESCE keeps Dov at 0/0; inner joins would delete a customer from their own report the moment their contacts are all strangers.",
    ],
    ladder: [
      {
        title: "Brute force — a pile per customer",
        body: "For each customer, circle the contact emails that appear in Customers, then walk every call checking both ends against the circle. Accurate for four customers; hopeless for four thousand.",
      },
      {
        title: "The pattern — derive the trusted set, aggregate twice, join summaries",
        body: "CTE trusted = Contacts joined to Customers on email; one grouped count, one both-endpoints grouped sum; LEFT JOIN both onto Customers.",
      },
      {
        title: "The optimal idea — one row per grain before any join",
        body: "O(k + c·t). When a report mixes aggregates of different fan-out, compute each to one row per report key FIRST, then join — the fan-out bug class never gets a chance to exist.",
      },
    ],
    approach:
      "Trusted-set CTE (Contacts joined to Customers by email), separate count and both-endpoint duration aggregates, LEFT JOIN + COALESCE onto the customer spine",
    schema: {
      ddl: `CREATE TABLE Customers (
  customer_id   INTEGER PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE
);
CREATE TABLE Contacts (
  user_id       INTEGER NOT NULL,
  contact_email TEXT NOT NULL
);
CREATE TABLE Calls (
  caller_id INTEGER NOT NULL,
  callee_id INTEGER NOT NULL,
  duration  INTEGER NOT NULL
);`,
      seed: `INSERT INTO Customers (customer_id, customer_name, email) VALUES
  (1, 'Ava Chen',  'ava@postbox.io'),
  (2, 'Ben Ode',   'ben@postbox.io'),
  (3, 'Cara Vaux', 'cara@postbox.io'),
  (4, 'Dov Lin',   'dov@postbox.io');
INSERT INTO Contacts (user_id, contact_email) VALUES
  (1, 'ben@postbox.io'),      -- registered: trusted
  (1, 'cara@postbox.io'),     -- registered: trusted
  (1, 'zoe@quickmail.com'),   -- unregistered: a stranger
  (2, 'ava@postbox.io'),      -- registered: trusted
  (2, 'dov@postbox.io'),      -- registered: trusted
  (2, 'pip@pigeonhole.net'),  -- stranger
  (3, 'dov@postbox.io'),      -- Cara's single trusted contact
  (4, 'moss@quietpost.com');  -- Dov's only contact: a stranger
INSERT INTO Calls (caller_id, callee_id, duration) VALUES
  (2, 1, 9),
  (1, 2, 6),
  (2, 3, 14),  -- both ends inside Ava's trusted set {Ben, Cara}
  (3, 2, 5),   -- both ends inside Ava's set as well
  (1, 3, 20),
  (3, 1, 11),
  (4, 1, 30),  -- both ends inside Ben's trusted set {Ava, Dov}
  (4, 2, 8);`,
      tables: [
        { name: "Customers", note: "4 registered customers with unique emails — the directory AND the report spine" },
        { name: "Contacts", note: "8 contact rows — 4 resolve to registered customers, 4 are strangers" },
        { name: "Calls", note: "8 calls between registered customers — only 3 are fully trusted by some customer's set" },
      ],
    },
    code: `WITH trusted AS (  -- one row per (owner, registered contact): email resolved to an id
    SELECT
        c.user_id       AS customer_id,
        reg.customer_id AS contact_id
    FROM Contacts c
    JOIN Customers reg ON reg.email = c.contact_email  -- Customers role 1: the directory
),
counts AS (
    SELECT customer_id, COUNT(*) AS trusted_contacts_count
    FROM trusted
    GROUP BY customer_id
),
durations AS (  -- calls whose caller AND callee are trusted by the SAME customer
    SELECT t1.customer_id, SUM(cl.duration) AS total_call_duration
    FROM Calls cl
    JOIN trusted t1 ON t1.contact_id = cl.caller_id   -- owner t1.customer_id trusts the caller
    JOIN trusted t2 ON t2.customer_id = t1.customer_id
                   AND t2.contact_id = cl.callee_id   -- the same owner also trusts the callee
    GROUP BY t1.customer_id
)
SELECT
    cu.customer_id,
    cu.customer_name,
    COALESCE(n.trusted_contacts_count, 0) AS trusted_contacts_count,
    COALESCE(d.total_call_duration, 0)    AS total_call_duration
FROM Customers cu                                    -- Customers role 2: the report spine
LEFT JOIN counts n    ON n.customer_id = cu.customer_id
LEFT JOIN durations d ON d.customer_id = cu.customer_id
ORDER BY cu.customer_id;`,
    walkthrough: [
      "The trusted CTE resolves emails through the directory: Ava's ben@ and cara@ become contacts {2, 3} (zoe@ matches nobody and vanishes); Ben's become {1, 4} (pip@ dies); Cara's {4}; Dov's moss@ dies, leaving an empty set.",
      "Counts: Ava 2, Ben 2, Cara 1, Dov 0. Durations scan the calls for both endpoints inside one owner's set: Ava's {2, 3} catches Ben→Cara 14 and Cara→Ben 5 = 19; Ben's {1, 4} catches Dov→Ava 30; Cara's singleton {4} and Dov's empty set catch nothing.",
      "The spine LEFT JOINs both summaries and COALESCEs the gaps: Ava 2/19, Ben 2/30, Cara 1/0, Dov 0/0 — four customers in, four rows out, ordered by customer_id.",
    ],
    time: "O(k + c·t) — resolve k contacts, probe each call's two ends against the trusted relation",
    space: "O(k) — the trusted (owner, contact) pairs",
    followUps: [
      "Count STRANGERS per customer next to trusted contacts — what does the count CTE look like when it must also catch Contacts rows whose email matches nobody (a LEFT JOIN inside the CTE)?",
      "Add trusted_contacts_who_called: trusted contacts appearing in at least one fully-trusted call — a third aggregate over an EXISTS probe; which customers flip from 0 to 1 on this seed?",
      "What breaks if two customers shared one email (the UNIQUE constraint gone) — where exactly does the email-to-id resolution fan out, and how would you dedupe it?",
    ],
    related: ["sales-person", "combine-two-tables", "top-travellers"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "evaluate-boolean-expression",
    statement:
      "Expressions holds boolean formulas in data form: each row is (expression_id, left_operand, operator, right_operand), where the operands name variables and operator is one of the TEXT values '<', '>' or '='. Variables holds each variable's current value (name, value). Evaluate every expression and report its truth as TEXT — 'true' or 'false'. Output columns expression_id, value, ordered by expression_id ascending.",
    examples: [
      {
        input: "Variables: x 14, y 9, z 14 · expression 3 reads ('x', '=', 'z')",
        output: "3 · true",
        explanation:
          "Both operands resolve through Variables to 14, and 14 = 14 — the stored '=' operator is applied, not compared against the numbers.",
      },
      {
        input: "expression 4 reads ('y', '=', 'z')",
        output: "4 · false",
        explanation:
          "Same operator as expression 3, different operands: 9 = 14 fails — the operator alone decides nothing; the resolved values do.",
      },
    ],
    constraints: [
      "each operand names exactly one Variables row — the lookup happens twice per expression, once per side",
      "operator is stored TEXT, one of '<', '>', '='; evaluation must CASE over it, never execute it",
      "columns expression_id, value ('true'/'false' as TEXT), ordered by expression_id",
    ],
    breakdown: [
      "The expression's operands are names, not values: 'x' must be resolved through Variables before any comparison can happen. Each expression needs the table twice — once for the left operand, once for the right — which means two joins over the SAME table under two aliases. The vl alias pins the row named by left_operand and the vr alias the row named by right_operand; after that the expression row and its two resolved values sit in one flat result row, ready to judge.",
      "The operator is DATA: the TEXT '<' in a row is not the less-than operator, it is a string that MEANS less-than. Translating data-operators into executable logic is exactly what CASE is for — each WHEN matches one stored operator and applies the corresponding real comparison. Note the glyph doing double duty in the '=' branch: e.operator = '=' compares TEXT against the literal string, while vl.value = vr.value compares the resolved integers. Same character, two different jobs inside one WHEN.",
      "The flat WHEN-chain — one WHEN per operator, each ANDing the stored operator with its comparison — has a pleasant safety property: an operator the translator never learned falls through to ELSE 'false' instead of crashing or yielding NULL. Building dynamic SQL, concatenating the stored operator into a query string, is the alternative newcomers reach for, and it buys an injection hole and a plan-cache miss for zero gain. Translation tables belong in CASE; evaluation belongs to the engine.",
    ],
    edges: [
      "Two aliases over one table: vl resolves left_operand, vr resolves right_operand — a single join cannot serve both slots, and dropping either join silently removes expressions from the report.",
      "The '=' glyph wears two hats: e.operator = '=' is a string comparison on stored DATA, while vl.value = vr.value is a numeric comparison on resolved values — conflating the two is the classic slip.",
      "The flat chain's fall-through returns 'false' for any unrecognized operator — a defensive default; a nested-CASE variant would hand back NULL instead.",
      "Expressions 3 and 4 share the '=' operator but land on opposite verdicts: the truth lives in the resolved values, never in the operator.",
    ],
    ladder: [
      {
        title: "Brute force — a human evaluator",
        body: "Read each row, look both operands up in Variables, apply the operator mentally, write the verdict. Five rows are fine; a million-row expression table is not.",
      },
      {
        title: "The pattern — double lookup plus CASE translation",
        body: "JOIN Variables twice (vl, vr), then CASE over e.operator applying the matching comparison, emitting 'true'/'false' strings.",
      },
      {
        title: "The optimal idea — translate, don't execute",
        body: "O(e) with two index probes per row. Any 'operator or verb stored as data' problem — audit rules, alert conditions, formula columns — resolves the same way: aliases for the repeated lookup, CASE for the verb, ELSE for everything you didn't anticipate.",
      },
    ],
    approach:
      "JOIN Variables twice under two aliases; CASE over the stored operator applying the matching comparison",
    schema: {
      ddl: `CREATE TABLE Expressions (
  expression_id INTEGER PRIMARY KEY,
  left_operand  TEXT NOT NULL,
  operator      TEXT NOT NULL CHECK (operator IN ('<', '>', '=')),
  right_operand TEXT NOT NULL
);
CREATE TABLE Variables (
  name  TEXT PRIMARY KEY,
  value INTEGER NOT NULL
);`,
      seed: `INSERT INTO Variables (name, value) VALUES
  ('x', 14),
  ('y', 9),
  ('z', 14),
  ('w', 3);
INSERT INTO Expressions (expression_id, left_operand, operator, right_operand) VALUES
  (1, 'x', '>', 'y'),  -- 14 > 9: the true '>'
  (2, 'x', '<', 'y'),  -- 14 < 9: the false '<'
  (3, 'x', '=', 'z'),  -- 14 = 14: the true '='
  (4, 'y', '=', 'z'),  -- 9 = 14: the false '='
  -- 5: 3 < 14, the second true '<'
  (5, 'w', '<', 'x');`,
      tables: [
        { name: "Expressions", note: "5 expressions — one of each operator plus a second '=' that flips the verdict" },
        { name: "Variables", note: "4 variables — x and z share the value 14, the seed's 'looks equal' decoy" },
      ],
    },
    code: `SELECT
    e.expression_id,
    CASE
        WHEN e.operator = '>' AND vl.value > vr.value THEN 'true'  -- string = literal, numeric = values
        WHEN e.operator = '<' AND vl.value < vr.value THEN 'true'
        WHEN e.operator = '=' AND vl.value = vr.value THEN 'true'
        ELSE 'false'  -- every false verdict AND any operator the CASE never learned
    END AS value
FROM Expressions e
JOIN Variables vl ON vl.name = e.left_operand    -- the left slot's lookup
JOIN Variables vr ON vr.name = e.right_operand   -- the right slot's lookup
ORDER BY e.expression_id;`,
    walkthrough: [
      "Each expression row doubles into two lookups: expression 1 pins vl = x (14) and vr = y (9); expression 5 pins vl = w (3) and vr = x (14). The two aliases keep the slots independent.",
      "The CASE reads the stored operator as a string: expression 1's '>' matches the first WHEN and 14 > 9 is true — 'true'. Expression 3's '=' matches the third WHEN, where e.operator = '=' compares TEXT while 14 = 14 compares numbers — 'true'.",
      "The falses land in ELSE: expression 2 ('<': 14 < 9 fails) and expression 4 ('=': 9 = 14 fails). Output by expression_id: true, false, true, false, true.",
    ],
    time: "O(e) — two indexed lookups per expression",
    space: "O(1) — one output row per expression, computed in place",
    followUps: [
      "Extend the grammar with '<>' and '>=' — which WHEN branches change, and what does the ELSE fall-through report for a row written before the migration?",
      "Compound expressions: rows may reference OTHER expressions' ids as operands — how does a recursive CTE evaluate the tree, and which of today's two joins become its base case?",
      "Cross-check each verdict against a labeled expected_value column and report the mismatch rate per operator — where does the per-operator GROUP BY sit relative to the CASE?",
    ],
    related: ["triangle-judgement", "calculate-special-bonus", "fix-names-in-a-table"],
    order: "exact",
    xp: 20,
  },
];
