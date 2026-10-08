// Deep-dives — LeetCode Premium batch I: friend graphs & community (5 problems, 4 Medium / 1 Hard). Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM_COMMUNITY: LcSqlDive[] = [
  {
    slug: "friend-requests-ii-who-has-the-most-friends",
    statement:
      "RequestAccepted logs one row per accepted friend request: requester_id, accepter_id and the acceptance date. Both directions are logged separately — if two users sent each other requests that were both accepted, the table holds two rows. Every accepted request leaves each side one friend richer: the requester gains 1 and the accepter gains 1. A user's friend count is therefore the number of accepted rows where they were the requester PLUS the number where they were the accepter. Report every user's id and friend count num — the full leaderboard, ordered by num descending, then id ascending.",
    examples: [
      {
        input:
          "user 1 sends accepted requests to 2, 3 and 5, and has accepted requests from 2 and 4",
        output: "(1,5)",
        explanation:
          "Three sent plus two received — five accepted rows credit user 1, even though one pair (the 1-2 exchange) was accepted in both directions; the metric counts accepted requests, not distinct partners.",
      },
      {
        input:
          "user 5 never sends a request but has three requests accepted by 1, 3 and 4",
        output: "(5,3)",
        explanation:
          "The receiving side alone builds the count — a user can rank high without ever appearing in requester_id.",
      },
    ],
    constraints: [
      "friend count = accepted rows as requester + accepted rows as accepter; each accepted row credits BOTH ids exactly once",
      "only users appearing in RequestAccepted (either column) are reported — a user with no rows has nothing to count",
      "output columns id, num ordered by num DESC then id ASC — every user, not just the winner",
    ],
    breakdown: [
      "The table is an edge list, and every row touches two users who each deserve credit. Reading it as 'group by requester' counts only half of each acceptance: the accepter's gain lives in the same row, under a different column. The canonical move is to explode the table into one tall list of user ids — UNION ALL the requester_id column with the accepter_id column — so a row (a, b) contributes one row for a and one for b. Counting friends then collapses into the plainest aggregation there is: GROUP BY id, COUNT(*).",
      "UNION ALL is load-bearing: UNION would dedupe the tall list, and repeated ids here are not noise — they are separate credits. User 1 in the seed appears five times across the two legs; a UNION would collapse those rows into one and report a count of 1. The other classic wrong turn is treating the table as a friendship graph and counting DISTINCT partners via a join: user 1 has 4 distinct neighbors but 5 accepted credits, because the 1-2 exchange was accepted twice — once in each direction — and each acceptance counts. The metric is 'accepted requests credited', not 'unique people met', so the count keeps duplicates.",
      "Population matters as much as arithmetic: the two UNION ALL legs are the entire universe of ids, so a user who never appears in either column — seed user 6 — never forms a group and must not appear in the output. There is no separate users table to LEFT JOIN from, and inventing one would be wrong: zero rows means zero friends, and the report covers the people the log actually knows about. Presentation is the leaderboard: ORDER BY num DESC puts the winner first, and id ASC breaks the seed's three-way tie at 2 (users 2, 3 and 4) deterministically — the exact-order grader reads that tiebreak as part of the answer.",
    ],
    edges: [
      "UNION ALL, never UNION — the tall list must keep repeated ids, because each repeat is one credit; deduping would shrink user 1's count from 5 to 1.",
      "Counting DISTINCT neighbors is a different metric: user 1 has 4 distinct partners but 5 accepted credits — the two-way 1-2 exchange counts once per direction.",
      "User 6 never appears in either column and is absent from the output — the union's legs define the population, and there is no users table to pad from.",
      "The tie at 2 is three users wide (2, 3, 4) — ORDER BY num DESC, id ASC resolves it by id, and 'exact' grades that order.",
    ],
    ladder: [
      { title: "Brute force — two counts and a stitch", body: "GROUP BY requester_id once, GROUP BY accepter_id again, then merge the two reports — which is a full outer join in disguise, emulated with two LEFT JOINs and an orphans branch. More passes, more COALESCE, same answer." },
      { title: "The pattern — explode the edge list", body: "UNION ALL the two id columns into one tall list: a row (a, b) becomes 'a' and 'b'. Both roles of an edge become rows of the same shape, and the merge disappears." },
      { title: "The optimal idea — one GROUP BY over the tall list", body: "COUNT(*) per id is the friend count; ORDER BY num DESC, id ASC finishes the leaderboard. Two linear scans and one grouping sort — and a third role would be one more SELECT in the union." },
    ],
    approach: "UNION ALL the requester and accepter columns into a tall id list, then GROUP BY id with COUNT(*) — every accepted row credits both endpoints once",
    schema: {
      ddl: `CREATE TABLE RequestAccepted (
  id           INTEGER PRIMARY KEY,
  requester_id INTEGER NOT NULL,
  accepter_id  INTEGER NOT NULL,
  accept_date  TEXT NOT NULL
);`,
      seed: `INSERT INTO RequestAccepted (id, requester_id, accepter_id, accept_date) VALUES
  (1,1,2,'2024-03-01'),
  (2,2,1,'2024-03-02'),  -- the 1-2 pair accepted in BOTH directions: two credits per side
  (3,1,3,'2024-03-04'),
  (4,4,1,'2024-03-04'),  -- same date as id 3 — only the ids tell the rows apart
  (5,1,5,'2024-03-07'),
  (6,3,5,'2024-03-09'),
  (7,4,5,'2024-03-11');`,
      tables: [
        { name: "RequestAccepted", note: "7 accepted requests over users 1-5 — user 1 mixes both roles (3 sent, 2 received); user 5 is receive-only, user 4 send-only; user 6 NEVER appears and must be absent from the output" },
      ],
    },
    code: `WITH sides AS (
    SELECT requester_id AS id   -- credit one endpoint of every accepted request
    FROM RequestAccepted
    UNION ALL
    SELECT accepter_id          -- ...and the other: keep ALL repeats, never UNION
    FROM RequestAccepted
)
SELECT
    id,
    COUNT(*) AS num             -- repeats are credits, not duplicates
FROM sides
GROUP BY id
ORDER BY num DESC, id ASC;      -- leaderboard: most friends first, ties by id`,
    walkthrough: [
      "Leg one (requesters) streams 1, 2, 1, 4, 1, 3, 4; leg two (accepters) streams 2, 1, 3, 1, 5, 5, 5 — fourteen credits from seven accepted rows.",
      "GROUP BY tallies them: user 1 reaches 5 (three sent, two received), user 5 reaches 3 (all received), users 2, 3 and 4 sit at 2 each; user 6 is in neither leg, so no group forms.",
      "ORDER BY num DESC, id ASC emits (1,5), (5,3), (2,2), (3,2), (4,2) — the tie at 2 breaks by ascending id.",
    ],
    time: "O(n log n) — two linear scans plus the GROUP BY sort over 2n ids",
    space: "O(n) — the tall list, one row per accepted-request endpoint",
    followUps: [
      "Report only the leader(s) without LIMIT — compare a MAX scalar subquery against RANK() OVER (ORDER BY num DESC) and say which one survives more ties.",
      "Split each user's count into sent and received columns while keeping users with a zero on one side — where does the tall-list shape stop being enough?",
    ],
    related: ["number-of-calls-between-two-persons", "find-followers-count"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "strong-friendship",
    statement:
      "Friendship lists the pairs under audit: each mutual friendship stored ONCE, with the smaller id in user1_id. Friends is the FULL social graph — every friendship edge stored once, smaller id first — and it is the graph you count against. A pair of users forms a strong friendship when they are friends AND at least 3 OTHER users are connected to both of them; those shared connections are the pair's common friends. For every pair in Friendship whose common-follower count reaches 3, report user1_id, user2_id and common_cnt, ordered by common_cnt descending, then user1_id, then user2_id.",
    examples: [
      {
        input: "pair (1,2): users 3, 4, 5 and 6 are each connected to both 1 and 2",
        output: "(1,2,4)",
        explanation:
          "Four shared neighbors clear the bar with room to spare — the COUNT decides, not merely the existence of common friends.",
      },
      {
        input: "pair (5,6): the pair is friends, but only users 1 and 2 are connected to both",
        output: "excluded — 2 is below the bar of 3",
        explanation:
          "Strong needs the count to reach 3; a real friendship with 2 common friends stays off the report.",
      },
    ],
    constraints: [
      "Friends stores each edge once with user1_id < user2_id — adjacency must be read in BOTH orientations",
      "common friends are third users connected to both members; the pair's own edge and the endpoints themselves never count",
      "a pair qualifies when common_cnt >= 3; output user1_id, user2_id, common_cnt ordered by common_cnt DESC, user1_id, user2_id",
    ],
    breakdown: [
      "The graph is stored one edge per row with the smaller id first — compact and canonical, but hostile to reads: 'who is user u friends with?' now means rows where user1_id = u OR user2_id = u, a two-branch scan for every question. Asking that twice per candidate pair, inside a join, is where mistakes breed. The fix is to normalize the adjacency once: UNION ALL the two orientations so the edge list becomes directed rows (u, f) meaning 'f is a friend of u', with every edge present in both directions. After that single normalization, every downstream question is a plain single-condition lookup.",
      "Common friends are a set intersection: users reachable from BOTH endpoints. With adjacency normalized, the intersection is a join — neighbors of a joined to neighbors of b on the shared friend id — and COUNT(*) per pair sizes it. The strong bar is applied after aggregation with HAVING COUNT(*) >= 3, and the boundary is the point: seed pair (2,3) sits at exactly 3, so the predicate must be >=, never >. HAVING also leaves the count available for the projection for free, because common_cnt is part of the requested output.",
      "Iterating candidate pairs from Friendship is what makes 'friend AND 3 common' a two-part test. The pair (5,6) IS friends — it is in Friendship — but its intersection counts 2, so the HAVING drops it. The louder trap runs the other way: users 7 and 8 share 4 common friends, the biggest overlap in the whole seed, yet they are not friends at all, so (7,8) never appears in Friendship and is never evaluated. Strong friendship requires membership AND mass; either condition alone produces a wrong row.",
    ],
    edges: [
      "Each edge is stored once — joining Friends to itself without UNION ALLing the mirror orientation misses half of every neighbor set.",
      "Pair (2,3) sits exactly ON the bar with 3 common friends — HAVING COUNT(*) >= 3 must be inclusive.",
      "Pair (5,6) is friends with only 2 common — friendship alone does not qualify.",
      "Pair (7,8) shares 4 common friends, the seed's largest overlap, but is absent from Friendship — 'friend AND common >= 3' is a conjunction, not an OR.",
    ],
    ladder: [
      { title: "Brute force — intersect per pair", body: "For each pair, collect friends of a with a two-branch scan, friends of b the same way, intersect the two lists in application code, then keep the pairs with 3 or more. Correct, but every pair pays two OR-scans and hand-rolled set logic." },
      { title: "The pattern — normalize, then join the neighborhoods", body: "UNION ALL both orientations of Friends into a directed adjacency; for each candidate pair, join neighbors-of-a with neighbors-of-b on the shared id and count. Intersection becomes a join." },
      { title: "The optimal idea — aggregate once, filter with HAVING", body: "One GROUP BY per pair sizes every intersection, HAVING >= 3 applies the bar, and the surviving counts ARE the output column. The join touches only deg(a) × deg(b) rows per pair." },
    ],
    approach: "UNION ALL both orientations of Friends into a directed adjacency, join each Friendship pair's two neighbor sets on the shared id, then HAVING COUNT(*) >= 3",
    schema: {
      ddl: `CREATE TABLE Friendship (
  id       INTEGER PRIMARY KEY,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  CHECK (user1_id < user2_id)
);
CREATE TABLE Friends (
  id       INTEGER PRIMARY KEY,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  CHECK (user1_id < user2_id),
  UNIQUE (user1_id, user2_id)   -- each edge exactly once, smaller id first
);`,
      seed: `INSERT INTO Friends (id, user1_id, user2_id) VALUES
  (1,1,2),(2,1,3),(3,1,4),(4,1,5),(5,1,6),
  (6,2,3),(7,2,4),(8,2,5),(9,2,6),
  (10,3,4),(11,3,5),
  (12,5,6),
  (13,1,7),(14,1,8),(15,3,7),(16,3,8),
  (17,4,7),(18,4,8),(19,5,7),(20,5,8);  -- 20 edges over 8 users
INSERT INTO Friendship (id, user1_id, user2_id) VALUES
  (1,1,2),  -- strong: 4 common friends (3, 4, 5, 6)
  (2,2,3),  -- strong: exactly 3 common (1, 4, 5) — the >= boundary
  (3,5,6);`,
      tables: [
        { name: "Friends", note: "the full graph — 20 edges over users 1-8; users 7 and 8 connect only to 1, 3, 4 and 5, and never to each other" },
        { name: "Friendship", note: "3 audited pairs — (1,2) and (2,3) are strong (4 and 3 common), (5,6) is friends but 2-short; (7,8) is NOT here despite sharing 4 common friends" },
      ],
    },
    code: `WITH adj AS (
    SELECT user1_id AS u, user2_id AS f   -- edge read forward: u -> f
    FROM Friends
    UNION ALL
    SELECT user2_id, user1_id             -- ...and mirrored: f -> u
    FROM Friends
),
shared AS (
    SELECT
        fr.user1_id,
        fr.user2_id,
        COUNT(*) AS common_cnt            -- ids reachable from BOTH endpoints
    FROM Friendship fr
    JOIN adj x ON x.u = fr.user1_id       -- neighbors of the first member
    JOIN adj y ON y.u = fr.user2_id       -- neighbors of the second...
              AND y.f = x.f               -- ...that point at the SAME third user
    GROUP BY fr.user1_id, fr.user2_id
    HAVING COUNT(*) >= 3                  -- inclusive: exactly 3 IS strong
)
SELECT user1_id, user2_id, common_cnt
FROM shared
ORDER BY common_cnt DESC, user1_id, user2_id;`,
    walkthrough: [
      "adj doubles the 20 canonical edges into 40 directed rows — edge (1,3) exists as 1->3 and 3->1 — so neighbors(u) is one lookup per user.",
      "Pair (1,2): neighbors(1) = {2,3,4,5,6,7,8} and neighbors(2) = {1,3,4,5,6}; the join keeps ids in both sets, {3,4,5,6}, so common_cnt = 4. Pair (2,3): the intersection of {1,3,4,5,6} and {1,2,4,5,7,8} is {1,4,5} → 3. Pair (5,6): intersection {1,2} → 2, dropped by HAVING.",
      "Survivors are (1,2) with 4 and (2,3) with 3 — ORDER BY common_cnt DESC, user1_id, user2_id emits (1,2,4) then (2,3,3); (7,8)'s 4-way overlap never surfaces because the pair is absent from Friendship.",
    ],
    time: "O(E + Σ deg(a)·deg(b)) — the adjacency build, then per-pair neighborhood joins",
    space: "O(E) — the doubled directed adjacency",
    followUps: [
      "Extend the report to strong pairs NOT listed in Friendship — what replaces the candidate list, and how do you keep (7,8) out of it?",
      "Rank the strong pairs within each user's neighborhood — which window PARTITION expresses 'user 1's strongest friendships'?",
      "Prove the adjacency needs no DISTINCT — which two seed schema properties guarantee the directed (u, f) rows are unique before the UNION ALL?",
    ],
    related: ["triangle-judgement", "number-of-calls-between-two-persons", "confirmation-rate"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "all-the-pairs-with-the-maximum-number-of-common-followers",
    statement:
      "Relations records directed follows: each row says follower_id follows followee_id — following is one-way, and nothing implies reciprocity. For an unordered pair of users (reported as user1_id < user2_id), their common followers are the users who follow BOTH members. Across all such pairs, find the maximum common-follower count achieved anywhere in the data and report EVERY pair that reaches it — all ties, not one winner. Output columns user1_id and user2_id, ordered by user1_id then user2_id.",
    examples: [
      {
        input: "users 5, 6 and 7 each follow both user 1 and user 2",
        output: "(1,2)",
        explanation:
          "Three shared followers tie this pair for the global maximum; nothing requires the pair members to follow each other — the direction flows INTO the pair.",
      },
      {
        input: "no row in Relations has followee_id 7, yet user 7 follows four people",
        output: "user 7 is in no reported pair",
        explanation:
          "Pairs are keyed on who is FOLLOWED; user 7 is a common follower of other pairs but, having no followers, can never be a pair member.",
      },
    ],
    constraints: [
      "follows are directed: a common follower of a pair is a user with rows pointing at BOTH members",
      "pairs are unordered — emit each qualifying pair once, with user1_id < user2_id",
      "every pair tied at the global maximum is reported; output user1_id, user2_id ordered by user1_id then user2_id",
    ],
    breakdown: [
      "Direction is the whole flavor of this problem. A friendship row speaks of both endpoints equally, but a follow row speaks of exactly one: (5 -> 1) says user 5 follows user 1 and is silent about user 1's feelings. The common followers of a pair are therefore the users whose out-edges hit both members — the intersection of followers(u1) and followers(u2) — and the seed plants user 9, who follows 3 and 4 but is followed by nobody, to make the asymmetry visible: 9 helps pair (3,4) and can never sit inside a pair itself.",
      "Pairs do not exist in the table — only follows do — so they must be manufactured. The self-join of Relations a with Relations b ON the same follower_id lines up two rows by the same follower, and their two followees name a candidate pair; a.followee_id < b.followee_id does three jobs at once, killing self-pairs, killing the mirrored duplicate, and imposing the canonical smaller-id-first orientation. Each join row is one follower contributing to one pair, so GROUP BY the pair with COUNT(*) sizes every pair's shared-follower set in one aggregation.",
      "'All pairs with the maximum' is a global argmax, and the seed is built to punish a per-pair reading: (1,2) and (3,4) BOTH reach 3 common followers, while (5,6) manages only 2. Compute the per-pair counts in a CTE, then filter with follower_cnt = (SELECT MAX(follower_cnt) FROM shared) — a scalar subquery over the whole CTE, not the current group. RANK() OVER (ORDER BY follower_cnt DESC) restricted to rank 1 is the equivalent window move; the MAX filter is plainer, and its failure mode (correlating it to the current group) is a loud error rather than a silent wrong answer. The final ORDER BY user1_id, user2_id is not cosmetic — two tied pairs must come back in a graded order.",
    ],
    edges: [
      "Follows point one way — user 9 follows 3 and 4 but has no followers, so 9 contributes to pair (3,4) and can never appear as a pair member.",
      "a.followee_id < b.followee_id prevents self-pairs and mirrors and re-orients the pair, all in one predicate.",
      "Pairs with zero shared followers never form a join row — harmless here because the max is 3, but a seed whose best pair had 0 would return an empty set.",
      "(5,6) tops every pair except the tied leaders with 2 — if the filter were '>= 2' or a per-group max, it would leak into the output.",
    ],
    ladder: [
      { title: "Brute force — build follower sets, intersect", body: "Pull all rows, bucket follower ids per followee in application code, then for every pair of followees intersect the two buckets and track the best count. All the set logic lives outside SQL." },
      { title: "The pattern — the follower self-join", body: "Relations a JOIN Relations b ON the same follower and followee1 < followee2 manufactures each unordered pair once per shared follower; GROUP BY the pair and COUNT." },
      { title: "The optimal idea — aggregate, then a global MAX filter", body: "The grouped CTE holds every pair's count; one scalar MAX subquery and an equality filter keep the argmax WITH ties. Swapping in RANK() OVER (ORDER BY cnt DESC) generalizes to top-k." },
    ],
    approach: "self-join Relations on follower_id with followee1 < followee2, GROUP BY the pair to count shared followers, keep pairs equal to the global MAX",
    schema: {
      ddl: `CREATE TABLE Relations (
  id          INTEGER PRIMARY KEY,
  follower_id INTEGER NOT NULL,
  followee_id INTEGER NOT NULL,
  UNIQUE (follower_id, followee_id)
);`,
      seed: `INSERT INTO Relations (id, follower_id, followee_id) VALUES
  (1,5,1),(2,6,1),(3,7,1),
  (4,5,2),(5,6,2),(6,7,2),
  (7,5,3),(8,8,3),(9,9,3),
  (10,5,4),(11,8,4),(12,9,4),
  (13,7,5),(14,8,5),
  (15,7,6),(16,8,6);`,
      tables: [
        { name: "Relations", note: "16 directed follows — followers 5-9 point at followees 1-6; users 7, 8 and 9 are followed by NOBODY (no row points at them) while user 5 follows four people and is followed by two" },
      ],
    },
    code: `WITH shared AS (
    SELECT
        a.followee_id AS user1_id,
        b.followee_id AS user2_id,
        COUNT(*)      AS follower_cnt   -- one row per shared follower
    FROM Relations a
    JOIN Relations b
      ON b.follower_id = a.follower_id  -- the SAME user follows both members
     AND a.followee_id < b.followee_id  -- unordered pair once, smaller id first
    GROUP BY a.followee_id, b.followee_id
)
SELECT user1_id, user2_id
FROM shared
WHERE follower_cnt = (SELECT MAX(follower_cnt) FROM shared)  -- argmax, ties kept
ORDER BY user1_id, user2_id;`,
    walkthrough: [
      "Follower 5 alone manufactures six pairs — (1,2), (1,3), (1,4), (2,3), (2,4), (3,4) — one join row each; followers 6, 7, 8 and 9 stack more rows onto the same pairs.",
      "Grouped counts: (1,2) reaches 3 (followers 5, 6, 7), (3,4) reaches 3 (followers 5, 8, 9), (5,6) reaches 2 (followers 7, 8), and every other pair sits at 1.",
      "The global MAX is 3, so the equality filter keeps exactly (1,2) and (3,4), emitted in that order — the 2-count pair stays out, proving the comparison is against the true maximum.",
    ],
    time: "O(R log R + J) — the grouping sort plus the self-join's shared-follower rows",
    space: "O(J) — one row per (follower, pair) contribution",
    followUps: [
      "Solve it with RANK() OVER (ORDER BY follower_cnt DESC) instead of the MAX subquery — then predict what rank 2 returns on this seed before running it.",
      "Report each tied pair's common followers as a comma-joined list beside the pair — which aggregation grain does that list need?",
      "Count common FOLLOWEES instead of common followers — what changes in the join key, and does direction flip the answer?",
    ],
    related: ["find-followers-count", "department-highest-salary"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "page-recommendations-ii",
    statement:
      "Friendship stores mutual friendships one row per pair, with no canonical order — either user may be listed first. Likes records that a user likes a page: one row per (user, page). Build page recommendations for user 1: report every page that AT LEAST ONE of user 1's friends likes AND that user 1 does not like themself. A page liked by several friends is still one recommendation, not several. Output one column, page_id, ordered ascending.",
    examples: [
      {
        input: "user 2 and user 4 are both friends of user 1, and both like page 11",
        output: "(11)",
        explanation:
          "Two friends liking the same page still yield a single row — the output is the set of recommended pages, not a count of likes.",
      },
      {
        input: "page 12 is liked by friend 2 and by user 1 themself",
        output: "excluded",
        explanation:
          "The anti-join removes pages already in user 1's own Likes; recommending a page the user already likes is noise.",
      },
    ],
    constraints: [
      "friendship edges are single-orientation: a friend of user 1 may sit in user1_id or user2_id, and both must be checked",
      "a candidate page needs at least one FRIEND of user 1 to like it — likes by strangers contribute nothing",
      "output a single column page_id, one row per qualifying page, ordered ascending",
    ],
    breakdown: [
      "The first trap is storage, not logic: each friendship is one row with no canonical order, so user 1 sits in user1_id for some edges and user2_id for others — the seed flips it twice out of three edges. Reading friends with WHERE user1_id = 1 silently loses user 2 and user 4 and leaves a lone recommendation. The read rule for undirected edges stored once: for every row that touches the target, emit the OTHER endpoint, which CASE WHEN user1_id = 1 THEN user2_id ELSE user1_id END does in one expression. Orientation is a storage detail, and the reader pays for it, not the writer.",
      "Candidates are pages, but the join produces likes: friend 2 and friend 4 both like page 11, so the raw join emits two rows for it. GROUP BY page_id turns the multiset of friends' likes into the SET of candidate pages — and that dedupe IS the 'one recommendation, not two' requirement. HAVING COUNT(*) >= 1 is a deliberate no-op, since a group exists only if someone liked the page, kept to state the 'at least one friend' contract in SQL; the honest work of the aggregation is collapsing the fan-out.",
      "'User 1 does not like it' is a negation, and negations in SQL are joins that must fail: NOT EXISTS probes Likes for (user 1, page) and keeps only rows where the probe finds nothing; LEFT JOIN ... IS NULL is the equivalent shape. The seed separates the two exclusion reasons cleanly — page 12 passes candidate generation (friend 2 likes it) and dies at the anti-join because user 1 also likes it, while page 16, liked by user 1 alone, never becomes a candidate at all because no friend likes it. Page 15 fails even earlier: only strangers 5 and 6 like it, so no join row ever forms. Three gates, three different pages, one pipeline.",
    ],
    edges: [
      "User 1 appears on both sides of Friendship — rows (2,1) and (4,1) store the target SECOND, so a user1_id-only read loses two of the three friends.",
      "Page 11 is liked by two friends — GROUP BY page_id keeps it as one row; counting without grouping would emit it twice.",
      "Page 12 is liked by a friend AND by user 1 — a valid candidate that only the anti-join can remove.",
      "Pages 15 (strangers only) and 16 (user 1 only) fail before the anti-join — no friend likes either, so no candidate row exists.",
    ],
    ladder: [
      { title: "Brute force — sets in application code", body: "List user 1's friends (checking both columns), dump every page they like, subtract the pages user 1 likes with a set difference, dedupe. All doable outside SQL, all fragile the moment the friendship orientation shifts." },
      { title: "The pattern — candidates, then anti-join", body: "A friends CTE normalizes orientation; joining Likes on friend ids and grouping by page_id builds the candidate set; a NOT EXISTS probe against user 1's Likes removes the already-liked." },
      { title: "The optimal idea — probe, don't spill", body: "NOT EXISTS evaluates per candidate row and short-circuits on the first hit, mirroring the sentence 'no row exists where user 1 likes this page'. One join, one grouping, one probe." },
    ],
    approach: "normalize friendship orientation into a friends list, join and GROUP BY their liked pages into candidates, then NOT EXISTS removes the pages user 1 already likes",
    schema: {
      ddl: `CREATE TABLE Friendship (
  id       INTEGER PRIMARY KEY,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  UNIQUE (user1_id, user2_id)
);
CREATE TABLE Likes (
  user_id INTEGER NOT NULL,
  page_id INTEGER NOT NULL,
  PRIMARY KEY (user_id, page_id)
);`,
      seed: `INSERT INTO Friendship (id, user1_id, user2_id) VALUES
  (1,2,1),  -- the target stored second: a user1_id-only read loses this edge
  (2,1,3),
  (3,4,1),  -- flipped again — user 1's friends are exactly {2, 3, 4}
  (4,2,5),
  (5,6,3);
INSERT INTO Likes (user_id, page_id) VALUES
  (2,11),(2,12),
  (3,12),(3,13),
  (4,11),(4,14),
  (1,12),  -- liked by friend 2 as well: the anti-join's reason to exist
  (1,16),  -- liked ONLY by user 1 — never a candidate at all
  (5,15),  -- page 15: liked only by strangers of user 1 (5 and 6)
  (6,15);`,
      tables: [
        { name: "Friendship", note: "5 undirected edges, one row each, NO canonical order — user 1 is user1_id once and user2_id twice; friends of user 1 = {2, 3, 4}" },
        { name: "Likes", note: "10 likes over pages 11-16 — page 11 has two friends of user 1, page 12 a friend AND user 1, page 15 only strangers, page 16 only user 1" },
      ],
    },
    code: `WITH my_friends AS (
    -- one row per friend of user 1, whichever side the edge names them on
    SELECT CASE WHEN user1_id = 1 THEN user2_id ELSE user1_id END AS friend_id
    FROM Friendship
    WHERE 1 IN (user1_id, user2_id)
),
candidates AS (
    SELECT l.page_id
    FROM my_friends f
    JOIN Likes l ON l.user_id = f.friend_id   -- pages my friends like
    GROUP BY l.page_id                        -- two friends, one page: one row
    HAVING COUNT(*) >= 1                      -- 'at least one friend' — stated in SQL
)
SELECT c.page_id
FROM candidates c
WHERE NOT EXISTS (                    -- the anti-join: I must not already like it
    SELECT 1
    FROM Likes mine
    WHERE mine.user_id = 1
      AND mine.page_id = c.page_id
)
ORDER BY c.page_id ASC;`,
    walkthrough: [
      "my_friends reads the three edges touching user 1: (2,1) yields 2, (1,3) yields 3 and (4,1) yields 4 — the CASE unpacks the flipped rows.",
      "Joining Likes: friend 2 likes 11 and 12, friend 3 likes 12 and 13, friend 4 likes 11 and 14 — GROUP BY page_id collapses the seven rows to candidates {11, 12, 13, 14}.",
      "The anti-join probes user 1's own Likes {12, 16}: page 12 is dropped, page 16 was never a candidate, and the output is 11, 13, 14 — one row per page, ascending.",
    ],
    time: "O(E + F·L) — one edge scan, the friends-likes join, then a probe per candidate",
    space: "O(C) — the candidate page set",
    followUps: [
      "Recommend for EVERY user at once instead of a hardcoded 1 — re-shape the friends CTE so the target user becomes a column, and check the output size against the seed.",
      "Order recommendations by how many friends like each page — move COUNT(*) into the projection and decide whether the anti-join happens before or after the ranking.",
      "Swap NOT EXISTS for a LEFT JOIN ... IS NULL and argue which version survives duplicate Likes rows better.",
    ],
    related: ["customers-who-never-order", "sales-analysis-ii"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "the-airport-with-the-most-flights",
    statement:
      "Flights logs one row per flight leg: departure airport and destination airport. When two airports are connected in both directions, the log holds TWO rows — and each row is a separate movement. An airport's traffic is the number of legs departing from it plus the number of legs arriving at it. Report the id of every airport whose traffic equals the maximum traffic in the log — all tied airports, not one. Output one column, id, ordered ascending.",
    examples: [
      {
        input: "the log contains 1->2 and also 2->1",
        output: "airport 1 gains 2, airport 2 gains 2",
        explanation:
          "Two rows, four credits: each airport departs once and arrives once — direction duplication is real traffic, not double counting.",
      },
      {
        input: "airport 5 never departs anything but receives one flight",
        output: "traffic 1 — airport 5 is in scope",
        explanation:
          "Arriving alone puts an airport in the population; the union's second leg exists precisely for it.",
      },
    ],
    constraints: [
      "traffic = departures + arrivals; each leg credits exactly 1 to each of its endpoints",
      "every airport appearing in Flights (either column) is in scope",
      "report ALL airports tied at the maximum; output a single column id ordered ascending",
    ],
    breakdown: [
      "A flight row is one movement touching two airports, and both halves count. Grouping the departure column alone measures only the outbound story: hub 3 in the seed departs just twice but receives three flights, and those arrivals are exactly what lift it into the tie. The explode-then-group move fits perfectly — UNION ALL the departure column with the destination column into one tall list of airport ids, so row (a, b) becomes one row for a and one for b, and COUNT(*) per id is the traffic.",
      "Direction duplication deserves a word: 1->3 and 3->1 are two rows, and each legitimately credits both of its endpoints once — this is not double counting, it is two real movements. What WOULD be wrong is counting a row twice for the same airport, which the two-leg union never does: the departure leg credits a, the arrival leg credits b, one each. The seed plants 1->3, a leg whose departure AND destination both end up at maximum traffic; it moves each tally by exactly 1 and changes nothing about who leads.",
      "The tie is the headline: airports 1 and 3 both reach traffic 5, and the answer must report BOTH ids — a peeled MAX, a LIMIT 1 or a window that keeps only the first row would each drop one. Compute traffic in a CTE, then filter with total = (SELECT MAX(total) FROM traffic): a global scalar subquery, one comparison, every leader kept. RANK() OVER (ORDER BY total DESC) = 1 is the equivalent window form and generalizes to top-k; for 'the maximum and everything on it', the scalar MAX is the simpler tool. ORDER BY id ASC makes the two-row answer deterministic for the exact-order grader, and airport 2's traffic of 3 shows the filter is exact equality, not a threshold.",
    ],
    edges: [
      "Departures alone would crown airport 1 (3 vs 2) and hide the tie — the arrivals leg is what ties airport 3 at 5.",
      "The 1->3 and 3->1 pair is two movements, not a duplicate — each airport still gains exactly 1 per leg per endpoint role.",
      "Airport 5's only touch is one arrival (traffic 1): appearing in either column puts an airport in scope, and airports absent from both columns are out.",
      "The MAX filter reads the WHOLE CTE — a per-group max or LIMIT 1 would silently drop one of the two tied airports.",
    ],
    ladder: [
      { title: "Brute force — two reports and a stitch", body: "Group departures, group arrivals, then merge the two reports per airport — a full outer join in disguise, plus a third pass to find the max in code. Works; three scans and merge logic it did not need." },
      { title: "The pattern — the two-leg union", body: "UNION ALL departure and destination into one tall list; a row (a, b) contributes one row to each endpoint. Traffic becomes a single GROUP BY COUNT(*)." },
      { title: "The optimal idea — one grouping, one scalar MAX", body: "The grouped CTE is the leaderboard; an equality filter against a global MAX subquery keeps every airport at the peak. Swap in RANK() OVER (ORDER BY total DESC) when top-k is the next question." },
    ],
    approach: "UNION ALL departure and destination legs into a tall airport list, GROUP BY for traffic, keep ids equal to the global MAX, ORDER BY id",
    schema: {
      ddl: `CREATE TABLE Flights (
  id          INTEGER PRIMARY KEY,
  departure   INTEGER NOT NULL,
  destination INTEGER NOT NULL
);`,
      seed: `INSERT INTO Flights (id, departure, destination) VALUES
  (1,1,2),(2,2,1),   -- the 1-2 pair served both ways: two rows, two movements
  (3,1,3),           -- departure AND destination are both max-traffic airports
  (4,3,1),
  (5,3,4),(6,4,3),
  (7,1,5),           -- airport 5's only touch: one arrival, traffic 1
  (8,2,3);`,
      tables: [
        { name: "Flights", note: "8 legs over airports 1-5 — 1 and 3 tie at traffic 5 (airport 1: three departures + two arrivals; airport 3: two + three), airport 2 sits at 3, airport 4 at 2, airport 5 arrives once" },
      ],
    },
    code: `WITH legs AS (
    SELECT departure AS id    -- one endpoint of every movement
    FROM Flights
    UNION ALL
    SELECT destination        -- ...and the other: arrivals count too
    FROM Flights
),
traffic AS (
    SELECT id, COUNT(*) AS total   -- departures + arrivals, in one count
    FROM legs
    GROUP BY id
)
SELECT id
FROM traffic
WHERE total = (SELECT MAX(total) FROM traffic)  -- global peak, every tie kept
ORDER BY id ASC;`,
    walkthrough: [
      "Eight flights explode into sixteen legs — departures 1, 2, 1, 3, 3, 4, 1, 2 and arrivals 2, 1, 3, 1, 4, 3, 5, 3.",
      "GROUP BY tallies each airport: 1 reaches 5 (three departures, two arrivals), 2 reaches 3, 3 reaches 5 (two departures, three arrivals), 4 reaches 2, and 5 reaches 1.",
      "The global MAX is 5 — the equality filter keeps BOTH leaders and ORDER BY id emits (1), (3); airport 2's 3 and airport 5's 1 fall below, and no LIMIT or first-row window was needed to keep the tie.",
    ],
    time: "O(n log n) — the leg explosion plus the GROUP BY sort over 2n rows",
    space: "O(n) — the tall leg list, one row per endpoint",
    followUps: [
      "Solve it with RANK() OVER (ORDER BY total DESC) instead of the scalar MAX — then state what changes if the request becomes 'the two busiest airports' and ties spill.",
      "Add a route-level report: which ordered pair (departure, destination) carries the most legs, counting each direction separately — where does the union approach stop fitting?",
      "What would the query return on a log where every airport has identical traffic, and why is the equality filter the only part that cares?",
    ],
    related: ["department-highest-salary", "rank-scores", "top-travellers"],
    order: "exact",
    xp: 20,
  },
];
