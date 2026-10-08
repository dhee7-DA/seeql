// Deep-dives — LeetCode Premium batch II, set 2: distances, graphs & runs
// (6 problems, 1 Easy / 4 Medium / 1 Hard = 125 xp). Engine-verified by
// scripts/lc-sql-verify.ts. Re-authored from the canonical premium tasks:
// own tables, own names, original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM2_RANKINGS: LcSqlDive[] = [
  {
    slug: "shortest-distance-in-a-plane",
    statement:
      "Point2D holds points on a plane (x, y); every (x, y) pair in the table is distinct. The shortest distance is the smallest Euclidean distance sqrt((x1-x2)^2 + (y1-y2)^2) taken over all unordered pairs of two DIFFERENT points. Return one column, shortest, holding that minimum rounded to 2 decimal places, as a single row.",
    examples: [
      {
        input: "the two closest diagonals: (2,4) is sqrt(2) from (3,3) and also sqrt(2) from (3,5)",
        output: "1.41",
        explanation:
          "Two pairs tie for the minimum, and both distances round to the same 1.41 — so the single-row answer is unambiguous no matter which tied pair a solution happens to look at.",
      },
      {
        input: "points (0,0) and (0,2) share the same x",
        output: "one candidate: 2.0",
        explanation:
          "The pairing rule falls back to y when x ties, so a vertical pair is built exactly once — not zero times, and not twice.",
      },
    ],
    constraints: [
      "distance is Euclidean: sqrt((x1-x2)^2 + (y1-y2)^2) between two distinct points",
      "every unordered pair of distinct points is one candidate — measure each pair once, not twice",
      "round the minimum to 2 decimals; one column shortest, one row",
    ],
    breakdown: [
      "A distance is a property of a PAIR, and Point2D stores points — so the join has to manufacture the pairs. A self-join of Point2D to itself builds every ORDERED pairing, which counts each unordered pair twice: (A, B) and (B, A) are the same distance measured in opposite directions. The pairing rule must therefore impose an orientation, and the natural one is lexicographic: keep the pair only when p1.x < p2.x, or when the x values tie and p1.y < p2.y. That clause is the whole dedup — without it the candidate set is doubled and the query's cost doubles with it.",
      "Inside each candidate row the distance formula is pure arithmetic: square the differences, sum, then sqrt — in that order, because sqrt(a) + sqrt(b) is not sqrt(a + b). The minimum of a monotone function is the function of the minimum, so MIN over the SQUARED distances followed by one sqrt at the end returns exactly what sqrt-per-row would, at a fraction of the work. The 1.0 multipliers keep the whole chain floating point from the first term: SQLite's SQRT returns a REAL even for an integer argument, but writing the promotion documents that shortest is a real distance, and the habit is what saves you in dialects where integer arithmetic truncates under your feet.",
      "The output contract is one number, so the query ends in an aggregate — MIN — and a ROUND applied last, after the minimum, to the thing actually reported. The seed plants a tie: two diagonal pairs, (2,4)-(3,3) and (2,4)-(3,5), are both exactly sqrt(2) apart. Because both round to 1.41, the single-row output is identical whether the engine reached the minimum through either pair — but that agreement is a property of the seed, and a report built on ties must always ask whether the rounded values collide.",
    ],
    edges: [
      "Without the lexicographic ON clause the self-join produces 30 ordered pairings for 6 points — 15 real pairs measured twice; the orientation clause halves the candidate set before any arithmetic runs.",
      "The tie: (2,4)-(3,3) and (2,4)-(3,5) are both exactly sqrt(2), and both round to 1.41 — MIN-then-ROUND and any single-pair pick agree; a seed whose tied pairs rounded differently would make a LIMIT-style answer a coin flip.",
      "1.0 promotion: the squared terms are integers on this seed; multiplying by 1.0 keeps every step REAL, so the value ROUND sees is a float — the portable habit, even though SQLite's SQRT promotes on its own.",
      "All seeded (x, y) pairs are distinct — if a point were duplicated, the lexicographic rule would silently DROP the 0-distance pair (neither x < x nor y < y holds); a rowid comparison (p1.rowid < p2.rowid) is the dedup that survives duplicate points.",
    ],
    ladder: [
      { title: "Brute force — measure everything twice", body: "Nested loops over all ordered pairs, computing sqrt each time and tracking the smallest. Correct, but every pair is built in both directions and the square root runs 30 times for 15 distances." },
      { title: "The pattern — oriented self-join, one MIN", body: "Self-join with the lexicographic pairing clause, MIN over the squared distances, then sqrt and ROUND once at the end." },
      { title: "The optimal idea — minimize before you transcend", body: "O(n^2) candidates are irreducible without a spatial index, but sqrt is monotone, so it can be pushed out of the loop: minimize squared distance, take sqrt once. The transferable rule — push monotone functions outside aggregates." },
    ],
    approach: "Oriented self-join (lexicographic pair dedup), MIN over squared distances, sqrt + ROUND once at the end",
    schema: {
      ddl: `CREATE TABLE Point2D (
  x INTEGER NOT NULL,
  y INTEGER NOT NULL
);`,
      seed: `INSERT INTO Point2D (x, y) VALUES
  (0, 0),
  (0, 2),  -- same x as (0,0): the pairing rule falls back to y
  (2, 4),
  (3, 3),  -- sqrt(2) from (2,4): a co-minimum
  (5, 1),
  -- (3,5) ties the minimum: sqrt(2) from (2,4) as well
  (3, 5);`,
      tables: [
        { name: "Point2D", note: "6 points, 15 unordered pairs — the two sqrt(2) diagonals share point (2,4)" },
      ],
    },
    code: `WITH pairs AS (
    SELECT
        1.0 * (p1.x - p2.x) * (p1.x - p2.x)      -- *1.0: keep the chain REAL
          + 1.0 * (p1.y - p2.y) * (p1.y - p2.y) AS sq_dist
    FROM Point2D p1
    JOIN Point2D p2
      ON p1.x < p2.x                            -- oriented pairing: each unordered pair
      OR (p1.x = p2.x AND p1.y < p2.y)          -- exactly once, y breaking x-ties
)
SELECT shortest
FROM (
    SELECT ROUND(SQRT(MIN(sq_dist)), 2) AS shortest  -- min of squares, one sqrt at the end
    FROM pairs
)
ORDER BY shortest;  -- single-row report: order pinned for the exact-order contract`,
    walkthrough: [
      "The oriented join builds the 15 candidates from 6 points — 30 ordered pairings minus the 15 reversed copies. Two candidates square out to 2: (2,4)-(3,3) and (2,4)-(3,5); the equal-x pairs (0,0)-(0,2) and (3,3)-(3,5) survive through the y tie-break.",
      "MIN(sq_dist) is 2.0; SQRT(2.0) is 1.4142135...; ROUND(..., 2) gives 1.41 — one square root for the whole aggregate, because sqrt never reverses an ordering.",
      "The outer wrapper orders the single row by its only column, and the report ships: shortest = 1.41.",
    ],
    time: "O(n^2) — every oriented pair is squared and summed once",
    space: "O(n^2) — the candidate pairs before aggregation",
    followUps: [
      "Report the winning pair(s) beside the distance — two pairs tie here, so an argmax shape (ROW_NUMBER or a join on the minimum) must decide whether the report carries one row or two.",
      "k nearest pairs: ORDER BY sq_dist LIMIT k — what goes wrong at the k-th slot when two pairs tie, and how would DENSE_RANK make the boundary explicit?",
      "Swap the metric to Manhattan distance |x1-x2| + |y1-y2| — the structure does not change, but which of the two tied pairs wins now?",
    ],
    related: ["all-valid-triplets-that-can-represent-a-country", "strong-friendship", "users-with-two-purchases-within-seven-days"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "shortest-distance-in-a-line",
    statement:
      "Point holds numbers on a line (one column, x); the seeded values are distinct. The shortest distance is the smallest ABS(x1 - x2) over all unordered pairs of different rows. Return one column, shortest, holding that minimum, as a single row.",
    examples: [
      {
        input: "values 7 and 9 — rows 1 and 3 of the seed, adjacent only after sorting",
        output: "2",
        explanation:
          "Nothing in insert order hints at the answer; the self-join measures every pair and MIN finds 2 wherever it hides.",
      },
      {
        input: "the ordered pair (1, 12) computes the raw difference 1 - 12 = -11",
        output: "ABS turns it into 11",
        explanation:
          "Without ABS, MIN over signed differences reports -11 — the LARGEST gap — because the most negative difference wins.",
      },
    ],
    constraints: [
      "the distance between two rows is ABS(x1 - x2); every unordered pair counts once",
      "the minimum is taken over all pairs of distinct rows",
      "one column shortest, one row",
    ],
    breakdown: [
      "One column of numbers still hides a two-column problem: the candidate set is PAIRS, and pairs come from a self-join. As on the plane, an orientation is needed or every pair gets built twice — with distinct values, p1.x < p2.x is the clean rule, and it cuts 20 ordered pairings down to 10 unordered candidates on the 5-row seed. The join is the candidate generator and the pairing rule is the dedup; keep those two jobs separate in your head and the ON clause writes itself.",
      "The measure is ABS(x1 - x2), and the ABS is not cosmetic. A signed difference inherits the join's orientation: 1 - 12 evaluates to -11, and MIN chases the most negative value it can find — on this seed the naive MIN(x1 - x2) reports -11, the pair with the LARGEST gap, a wrong answer that looks almost right because it came from the right shape. ABS erases the orientation's sign so that the minimum means closest.",
      "MIN then collapses ten candidates into one number. The winner sits between rows that are far apart in insert order (7 and 9 occupy positions 1 and 3) — a reminder that closest is a value-space notion, not a row-order notion. Sorting first would reveal a shortcut: the minimum gap always lands between sorted neighbors, and the third rung turns that observation into an O(n log n) form. The self-join remains the honest first answer and the one the constraints describe.",
    ],
    edges: [
      "Naive MIN(x1 - x2) returns -11 on this seed — the most negative signed difference belongs to the pair (1, 12), the FARTHEST apart; ABS is what makes MIN mean closest.",
      "Orientation dedup: p1.x < p2.x builds each of the 10 pairs once; a bare p1.x <> p2.x would double the candidate set to 20 and double the work.",
      "Distinct values make value-ordering a safe dedup; if x could repeat, equal-value rows would be dropped by p1.x < p2.x (a 0-distance pair lost) — p1.rowid < p2.rowid is the dedup that keeps duplicates.",
    ],
    ladder: [
      { title: "Brute force — all ordered pairs", body: "Two nested loops over the rows, tracking the smallest absolute difference. It works, and it measures every pair twice." },
      { title: "The pattern — oriented self-join + ABS + MIN", body: "JOIN Point to itself with p1.x < p2.x, select ABS(p1.x - p2.x), wrap in MIN." },
      { title: "The optimal idea — sort, then compare neighbors", body: "After sorting, the closest pair is always adjacent — any wider pair's gap is the sum of the neighbor gaps between them — so LAG(x) OVER (ORDER BY x) plus a MIN over n-1 gaps solves it in O(n log n). The self-join's O(n^2) is the price of skipping the sort." },
    ],
    approach: "Oriented self-join (p1.x < p2.x), ABS of the difference, MIN",
    schema: {
      ddl: `CREATE TABLE Point (
  x INTEGER NOT NULL
);`,
      seed: `INSERT INTO Point (x) VALUES
  (7),
  (1),
  (9),  -- 2 from the 7: the minimum gap
  (4),
  (12);`,
      tables: [
        { name: "Point", note: "5 rows — the closest values (7 and 9) sit at positions 1 and 3, not adjacent rows" },
      ],
    },
    code: `WITH pairs AS (
    SELECT ABS(p1.x - p2.x) AS gap         -- ABS: the signed difference inherits the join's sign
    FROM Point p1
    JOIN Point p2 ON p1.x < p2.x           -- oriented pairing: 10 candidates, not 20
)
SELECT shortest
FROM (
    SELECT MIN(gap) AS shortest
    FROM pairs
)
ORDER BY shortest;  -- single-row report: order pinned for the exact-order contract`,
    walkthrough: [
      "The oriented self-join builds 10 pairs from 5 rows: gaps 6 (7-1), 2 (7-9), 3 (7-4), 5 (7-12), 8 (1-9), 3 (1-4), 11 (1-12), 5 (9-4), 3 (9-12), 8 (4-12).",
      "Every gap is an ABS: the pair built as (1, 12) contributes 11, never -11, whatever order the join happened to visit it in.",
      "MIN(gap) is 2; the wrapper orders the single row by its only column and the report ships: shortest = 2.",
    ],
    time: "O(n^2) — every oriented pair examined once",
    space: "O(n^2) — the candidate gaps before aggregation",
    followUps: [
      "Return the two x values beside the gap — an argmax shape over (gap, x, paired x) with a stated tie rule; what changes if two pairs share the minimum gap?",
      "Rewrite with LAG(x) OVER (ORDER BY x): why is the closest pair always sorted-adjacent, and where does the O(n^2) go?",
    ],
    related: ["station-shortest-longest", "symmetric-pairs", "users-with-two-purchases-within-seven-days"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "second-degree-follower",
    statement:
      "Follow logs who follows whom: each row (followee, follower) means follower follows followee, and a re-followed pair can appear more than once. A follower is a user with at least one outgoing row; a followee is a user with at least one incoming row. Report every follower who is ALSO a followee — followed by at least one user — with columns follower and num, where num counts the DISTINCT users they follow. Followers who nobody follows are excluded (no marker rows), and users who follow nobody are not followers at all. Order by follower ascending.",
    examples: [
      {
        input: "user 1 follows 2 and 3 — the pair (3, 1) logged twice after a re-follow — and is followed by 2, 3 and 5",
        output: "1 · 2",
        explanation:
          "Two DISTINCT followees despite three log rows; the doubled pair counts once.",
      },
      {
        input: "user 5 follows 1, 3 and 4 but no row ever lists 5 as followee",
        output: "(no row)",
        explanation:
          "Follower yes, followee never — the two-role test excludes them.",
      },
    ],
    constraints: [
      "num = COUNT of DISTINCT followees per follower — a re-followed pair counts once",
      "only followers who appear as followee on at least one row are reported",
      "columns follower, num — ordered by follower ascending",
    ],
    breakdown: [
      "Follower and followee are ROLES a user plays on a row, not classes of user — the same user can hold both, and the output population is exactly the users who hold both: at least one outgoing row AND at least one incoming row. Testing whether a matching row exists is the job of a semi-join, and in SQL that is EXISTS (or IN): for each candidate follower, ask whether any row's followee column equals them. The filter runs on the follow side and never multiplies rows.",
      "Why not a self-join? Joining Follow to itself on follower = followee glues each follower's outgoing rows to their incoming rows — a follower with 3 outgoing and 2 incoming edges becomes 6 joined rows, and any COUNT taken over the joined result is wrong before grouping even starts. EXISTS answers a yes/no question per follower and discards the incoming rows it found; the counting then happens on the untouched outgoing rows. Filter with a semi-join, measure on the original grain — mixing the two grains in one join is the classic graph-query mistake.",
      "The measure has its own grain: num counts USERS followed, not rows logged. The seed logs the pair (3, 1) twice — a re-follow after an unfollow — so user 1's outgoing rows are {2, 3, 3} and the honest count is 2. COUNT(DISTINCT followee) states that grain; a bare COUNT(*) would report 3. And the population boundary cuts both ways: user 4 is followed by two users but follows nobody — they are not a follower, so no aggregation group exists for them at all; approaching from the followee side with a LEFT JOIN would manufacture a num = 0 row the spec never asked for.",
    ],
    edges: [
      "User 5 follows three users but appears as followee nowhere — excluded; skip the EXISTS test and the output wrongly gains a (5, 3) row.",
      "User 4 is followed twice but follows nobody — correctly absent; a LEFT JOIN from the followee side would emit a num = 0 row, and counts taken over that join would be inflated for every real follower too, because rows multiply before grouping.",
      "The (3, 1) re-follow is logged twice — COUNT(DISTINCT followee) keeps user 1 at 2; a bare COUNT(*) reports 3.",
      "A self-join on follower = followee duplicates each outgoing row once per incoming edge before grouping — the EXISTS filter checks existence without multiplying anything.",
    ],
    ladder: [
      { title: "Brute force — two lists and an intersection", body: "List the followers with their follow counts, list the users who appear as followee, keep the intersection by hand. The shape of the answer, none of the mechanics." },
      { title: "The pattern — semi-join filter, then group", body: "WHERE EXISTS (a row whose followee is the candidate follower), then GROUP BY follower with COUNT(DISTINCT followee)." },
      { title: "The optimal idea — filter on existence, measure on the original grain", body: "One pass over the follow rows with an existence probe per follower. The reusable rule: population tests that reference OTHER rows are semi-joins, and the measure is defined on rows the filter never touched." },
    ],
    approach: "EXISTS filter on the followee role, GROUP BY follower, COUNT(DISTINCT followee)",
    schema: {
      ddl: `CREATE TABLE Follow (
  followee INTEGER NOT NULL,
  follower INTEGER NOT NULL
);`,
      seed: `INSERT INTO Follow (followee, follower) VALUES
  (2, 1),
  (3, 1),
  (3, 1),  -- re-follow: the same pair logged twice
  (1, 2),
  (4, 2),
  (1, 3),
  (1, 5),
  (3, 5),
  -- user 5 follows three users and is followed by none
  (4, 5);`,
      tables: [
        { name: "Follow", note: "9 rows over 5 users — one re-followed pair logged twice, user 5 never followed, user 4 following nobody" },
      ],
    },
    code: `SELECT
    f.follower,
    COUNT(DISTINCT f.followee) AS num          -- users followed, not rows logged
FROM Follow f
WHERE EXISTS (                                  -- semi-join: keep followers who are
        SELECT 1                                -- themselves followed by someone
        FROM Follow g
        WHERE g.followee = f.follower)
GROUP BY f.follower
ORDER BY f.follower;`,
    walkthrough: [
      "The EXISTS probe runs per follower: user 1 appears as followee on rows (1,2), (1,3), (1,5) — in; user 2 in via (2,1); user 3 in via (3,1) and (3,5); user 5 finds no row with followee = 5 — out.",
      "The survivors' outgoing rows group up: 1 -> {2, 3, 3}, 2 -> {1, 4}, 3 -> {1}. DISTINCT collapses user 1's doubled pair: num = 2, 2, 1.",
      "ORDER BY follower ships (1, 2), (2, 2), (3, 1) — user 5's three outgoing rows never reach the output, and user 4 never formed a group.",
    ],
    time: "O(F) — one pass over the follow rows with an existence probe per follower",
    space: "O(u) — one group per qualifying follower",
    followUps: [
      "Earn the problem's name: report second-degree followers — users reachable as follower-of-follower but NOT already followed directly; which anti-join shape keeps the 'not already' honest?",
      "Add the marker variant: every followed user with zero outgoing follows emits one row with num = 0 — sketch the UNION ALL branch and explain why a COALESCE over a LEFT JOIN is not equivalent.",
      "Count mutual pairs (A follows B and B follows A) — does the EXISTS form extend, or does an intersection of two directed edge lists read better?",
    ],
    related: ["find-followers-count", "friend-requests-ii-who-has-the-most-friends", "all-the-pairs-with-the-maximum-number-of-common-followers"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "new-users-daily-count",
    statement:
      "Traffic logs in-app events: (user_id, activity, activity_date, activity_type). activity_type = 'login' marks a sign-in — activity records how ('password sign-in', 'magic link', 'oauth'); every other row ('feed scroll', 'checkout') is engagement noise carrying a different activity_type. A user becomes a NEW user on the date of their FIRST-EVER sign-in. For each date, report login_date and new_users = the number of users whose first-ever sign-in falls on that date. Order by login_date ascending; dates with no first-time sign-ins are absent.",
    examples: [
      {
        input: "user 8: a 'feed scroll' on 2024-06-01, first sign-in (oauth) on 2024-06-02",
        output: "2024-06-02 counts user 8",
        explanation:
          "The scroll is not a sign-in; if the MIN ran over unfiltered rows, user 8 would be claimed a day early.",
      },
      {
        input: "user 9 signs in on 2024-06-01 and again on 2024-06-04",
        output: "counts on 2024-06-01 only",
        explanation:
          "Only the first sign-in creates a new user; the return is invisible to this report.",
      },
    ],
    constraints: [
      "only activity_type = 'login' rows are sign-ins — engagement rows must not touch the minimum",
      "a user is counted on exactly one date: the date of their earliest login row",
      "columns login_date, new_users — ordered by login_date ascending; dates with zero new users are absent",
    ],
    breakdown: [
      "First-ever is a per-user MIN, and the MIN's input must already be clean: the WHERE activity_type = 'login' has to run BEFORE the minimum is taken, inside the same per-user pass. Filtering after the minimum is a different computation — the engagement rows would compete for earliest event and win whenever they precede the first real sign-in. Deriving first_login per user in a CTE pins that order of operations in the shape of the query itself: WHERE first, then aggregate.",
      "The report lives one grain up. The CTE aggregates per USER — one row per user; the outer query aggregates per DATE — one row per first-login date. Two GROUP BYs, two grains, one named concept between them, and calling the intermediate first_login is what makes the outer query read like the spec: count users per first-login date. Fusing both grains into one GROUP BY (user_id, activity_date) answers a different question — per-user-per-date activity counts — and cannot express first-ever at all.",
      "The absent-zero convention falls straight out of GROUP BY's mechanics: a group exists only where rows exist. 2024-06-04 carries a returning login (user 9) and a scroll (user 10) but no FIRST sign-in, so no group forms and the date is absent — the contract says read a missing date as zero. Same-day repeats need no special code either: user 11 signs in twice on 2024-06-03 and MIN collapses both rows to one first-login, so the outer COUNT counts users — one per CTE row — never raw login rows.",
    ],
    edges: [
      "User 7's 2024-05-30 scroll PRECEDES their first login: an unfiltered MIN invents a 2024-05-30 row for user 7, and their real 2024-06-01 arrival drops that date's count from 2 to 1.",
      "User 8's 2024-06-01 scroll is the same poison aimed at a date that matters: unfiltered, user 8's minimum becomes 06-01, inflating it to 3 users and erasing 2024-06-02 entirely, because its only new user moved.",
      "User 11 logs in twice on 2024-06-03 — two rows, one user; the CTE's MIN yields one first-login and the outer COUNT counts CTE rows, not Traffic rows.",
      "2024-06-04 has activity but no first sign-ins — absent, not zero; only a calendar spine (a follow-up) can materialize zero dates.",
    ],
    ladder: [
      { title: "Brute force — eyeball each user's earliest login", body: "Scan Traffic per user, find their first sign-in date, tally dates on paper. The CTE does exactly this, per group, in one statement." },
      { title: "The pattern — filter, MIN per user, then count per date", body: "CTE: WHERE activity_type = 'login', GROUP BY user_id, MIN(activity_date) AS first_date. Outer: GROUP BY first_date, COUNT(*)." },
      { title: "The optimal idea — one grain per stage", body: "O(n) with hash aggregation. The transferable rule: stacked aggregations must each own exactly ONE grain, and any filter that DEFINES the measure (login vs noise) belongs inside the earliest stage." },
    ],
    approach: "CTE: filter logins, MIN(activity_date) per user; outer: GROUP BY first-login date, COUNT",
    schema: {
      ddl: `CREATE TABLE Traffic (
  user_id       INTEGER NOT NULL,
  activity      TEXT NOT NULL,
  activity_date TEXT NOT NULL,  -- 'YYYY-MM-DD'
  activity_type TEXT NOT NULL   -- 'login' or 'usage'
);`,
      seed: `INSERT INTO Traffic (user_id, activity, activity_date, activity_type) VALUES
  (7, 'feed scroll', '2024-05-30', 'usage'),       -- decoy BEFORE the first login
  (7, 'password sign-in', '2024-06-01', 'login'),
  (7, 'magic link', '2024-06-03', 'login'),
  (8, 'feed scroll', '2024-06-01', 'usage'),       -- decoy ON a login date
  (8, 'oauth', '2024-06-02', 'login'),
  (9, 'password sign-in', '2024-06-01', 'login'),
  (9, 'password sign-in', '2024-06-04', 'login'),  -- returning: not new again
  (10, 'magic link', '2024-06-03', 'login'),
  (10, 'feed scroll', '2024-06-04', 'usage'),
  (11, 'password sign-in', '2024-06-03', 'login'),
  (11, 'oauth', '2024-06-03', 'login'),            -- same-day repeat: one new user
  (12, 'password sign-in', '2024-05-31', 'login');`,
      tables: [
        { name: "Traffic", note: "12 events, 6 users — two usage decoys sit before or beside first logins, one return login, one same-day repeat" },
      ],
    },
    code: `WITH first_login AS (
    SELECT
        user_id,
        MIN(activity_date) AS first_date    -- earliest SIGN-IN: the WHERE already ran
    FROM Traffic
    WHERE activity_type = 'login'           -- filter BEFORE the MIN, same pass
    GROUP BY user_id
)
SELECT
    first_date AS login_date,
    COUNT(*)   AS new_users                 -- one row per user: counts users, not logins
FROM first_login
GROUP BY first_date
ORDER BY login_date;`,
    walkthrough: [
      "The CTE keeps only the 9 login rows: user 7 -> {06-01, 06-03}, 8 -> {06-02}, 9 -> {06-01, 06-04}, 10 -> {06-03}, 11 -> {06-03, 06-03}, 12 -> {05-31} — the three usage rows never entered.",
      "MIN per user: 7 -> 2024-06-01, 8 -> 2024-06-02, 9 -> 2024-06-01, 10 -> 2024-06-03, 11 -> 2024-06-03, 12 -> 2024-05-31 — six rows, one per user.",
      "GROUP BY first_date: 05-31 -> {12} = 1, 06-01 -> {7, 9} = 2, 06-02 -> {8} = 1, 06-03 -> {10, 11} = 2; 06-04 forms no group. Ordered: (05-31, 1), (06-01, 2), (06-02, 1), (06-03, 2).",
    ],
    time: "O(n) — one filtered, grouped pass per user, then one per date",
    space: "O(u) — one first-login row per user",
    followUps: [
      "Materialize the zero dates: build a calendar spine (a recursive CTE or a dates table), LEFT JOIN the counts onto it, COALESCE to 0 — which side must drive and why?",
      "Cohort retention: for each new-user date, how many of those users signed in again within 7 days — which join pairs each user's first login with their later ones?",
      "Promote the report to monthly: truncate the first-login date to month — what does the two-stage shape gain when the report grain and the definition grain drift apart?",
    ],
    related: ["game-play-analysis-i", "uber-first-transaction", "the-latest-login-in-2020"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "tournament-winners",
    statement:
      "Players registers every entrant (player_id, group_id); MatchResults logs matches (match_id, first_player, second_player, first_score, second_score) between players of the same group. The higher score wins the match and earns 3 points; the loser takes 0; a match never draws. A player with no matches holds 0 points but still occupies a place in the standings. Each group's winner is its top-ranked player: most points, ties broken by the LOWER player_id. Report group_id and player_id, ordered by group_id.",
    examples: [
      {
        input: "group 1's round robin: 11 beat 12 (3-0), 13 beat 11 (2-1), 12 beat 13 (2-0) — all three finish on 3 points",
        output: "group 1 · player 11",
        explanation:
          "A three-way tie resolves by the lower id; the tie-break must live inside the ranking's ORDER BY, not in a filter after it.",
      },
      {
        input: "player 24 never takes the field",
        output: "0 points, ranked last in group 2",
        explanation:
          "LEFT-join semantics: the standings carry every registrant, and 24 simply cannot reach the top.",
      },
    ],
    constraints: [
      "win = higher score = 3 points, loss = 0 points; matches never draw",
      "every registered player is ranked, at 0 points when they played no matches",
      "winner per group = max points, tie-break lower player_id; columns group_id, player_id, ordered by group_id",
    ],
    breakdown: [
      "A match row is two results wearing one row: first_player's and second_player's. Any per-player tally must first split each row into two one-sided rows — UNION ALL is the unpivot — and each side must carry BOTH scores, because points are decided by comparing your score with your opponent's. Carrying the opponent's score through the UNION turns the win test into a within-row CASE; without it, the comparison needs a join back to MatchResults on match_id, a second pass the shape can avoid.",
      "Points per player fall out of conditional aggregation: SUM(CASE WHEN score > opp_score THEN 3 ELSE 0 END) over the unpivoted sides, grouped by player. Then the roster must drive: Players lists everyone, while the match-derived totals list only players who played — the LEFT JOIN from Players to the totals (COALESCE(NULL, 0)) is what honors the contract that a matchless player holds 0 points. An inner join would silently delete player 24 from the standings; the two-row winner output happens to agree on this seed, but the contract would already be broken in the intermediate the query reports from.",
      "The winner is an argmax per group, and the ordering key IS the rule: points descending, then player_id ascending. A window ROW_NUMBER over PARTITION BY group_id with that composite ORDER BY makes the ranking total — exactly one row per group carries rn = 1, ties included. RANK() over points alone would hand all three tied players of group 1 rank 1 and leak two extra rows; the tie-break belongs inside the window's ORDER BY, not in a post-filter.",
    ],
    edges: [
      "Group 1 ends in a three-way tie (11, 12, 13 all on 3 points): the composite window ordering (pts DESC, player_id ASC) hands the win to 11 — RANK() over points alone would crown all three and return three rank-1 rows.",
      "Player 24 never plays: LEFT JOIN + COALESCE ranks them at 0 per the stated contract, while an inner-join build erases them from the standings — the two-row winner output cannot tell the difference on this seed, but the full-standings report (a follow-up) can.",
      "21 and 22 meet twice (matches 4 and 5): the unpivot treats each match independently and points simply add — a rematch needs no dedup, unlike the pairing problems.",
      "Each unpivoted side carries the OPPONENT's score so score > opp_score is a within-row test; comparing after the unpivot would require a match_id join-back per side.",
    ],
    ladder: [
      { title: "Brute force — a winner column by hand", body: "Read each match, write down the winner, tally points per player per group in a spreadsheet. The mental model the SQL must reproduce: split, compare, tally, rank." },
      { title: "The pattern — UNION ALL unpivot, conditional SUM, LEFT JOIN, window argmax", body: "sides (two rows per match, each carrying both scores) -> points per player -> roster LEFT JOIN totals with COALESCE 0 -> ROW_NUMBER per group -> keep rn = 1." },
      { title: "The optimal idea — reshape to the question's grain first", body: "O(M + P log P). The question is per-player; the data is per-match-pair; one UNION ALL converts the grain and every later step is single-grain. Fighting a two-sided fact table with clever joins costs more than one honest unpivot." },
    ],
    approach: "UNION ALL unpivot with opponent scores, SUM(CASE) points per player, roster LEFT JOIN, ROW_NUMBER argmax per group",
    schema: {
      ddl: `CREATE TABLE Players (
  player_id INTEGER PRIMARY KEY,
  group_id  INTEGER NOT NULL
);
CREATE TABLE MatchResults (
  match_id      INTEGER PRIMARY KEY,
  first_player  INTEGER NOT NULL REFERENCES Players(player_id),
  second_player INTEGER NOT NULL REFERENCES Players(player_id),
  first_score   INTEGER NOT NULL,
  second_score  INTEGER NOT NULL
);`,
      seed: `INSERT INTO Players (player_id, group_id) VALUES
  (11, 1), (12, 1), (13, 1),
  (21, 2), (22, 2), (23, 2),
  -- 24 never plays: the zero-match row
  (24, 2);
INSERT INTO MatchResults (match_id, first_player, second_player, first_score, second_score) VALUES
  (1, 11, 12, 3, 0),   -- 11 wins
  (2, 13, 11, 2, 1),   -- 13 wins
  (3, 12, 13, 2, 0),   -- 12 wins: group 1 three-way tie at 3 points
  (4, 21, 22, 2, 1),   -- 21 wins
  (5, 22, 21, 3, 1),   -- the rematch: 22 wins
  -- 22 wins again: group 2 leader at 6 points
  (6, 22, 23, 1, 0);`,
      tables: [
        { name: "Players", note: "7 entrants in 2 groups — player 24 registered but matchless" },
        { name: "MatchResults", note: "6 matches — a group-1 round robin ending in a three-way points tie, a group-2 rematch, no draws" },
      ],
    },
    code: `WITH sides AS (
    -- unpivot: each match becomes two one-sided rows, each carrying BOTH scores
    SELECT first_player  AS player_id, first_score  AS score, second_score AS opp_score
    FROM MatchResults
    UNION ALL
    SELECT second_player AS player_id, second_score AS score, first_score  AS opp_score
    FROM MatchResults
),
points AS (
    SELECT
        player_id,
        SUM(CASE WHEN score > opp_score THEN 3 ELSE 0 END) AS pts  -- win 3, loss 0
    FROM sides
    GROUP BY player_id
),
ranking AS (
    SELECT
        p.group_id,
        p.player_id,
        COALESCE(pts.pts, 0) AS pts        -- zero-match players hold 0 points
    FROM Players p
    LEFT JOIN points pts ON pts.player_id = p.player_id
),
winners AS (
    SELECT
        group_id,
        player_id,
        ROW_NUMBER() OVER (
            PARTITION BY group_id
            ORDER BY pts DESC, player_id ASC   -- the tie-break lives here
        ) AS rn
    FROM ranking
)
SELECT group_id, player_id
FROM winners
WHERE rn = 1
ORDER BY group_id;`,
    walkthrough: [
      "The unpivot doubles 6 matches into 12 one-sided rows — match 1 emits (11, 3, 0) and (12, 0, 3). The CASE compares within each row: 11's side wins, 12's does not.",
      "Points per player: 11 -> 3 (won match 1), 12 -> 3 (won match 3), 13 -> 3 (won match 2), 21 -> 3, 22 -> 6 (won the rematch and match 6), 23 -> 0. The LEFT JOIN then adds 24 at 0.",
      "Group 1 ranks (11, 3), (12, 3), (13, 3) — the composite ordering puts 11 first; group 2 ranks 22 (6) on top, then 21 (3), then 23 and 24 at 0. rn = 1 picks (1, 11) and (2, 22), shipped ordered by group_id.",
    ],
    time: "O(M + P log P) — unpivot the matches, sort each group's roster once",
    space: "O(M + P) — the two-sided rows plus one ranked row per player",
    followUps: [
      "Publish the full standings: position, player_id, points per group — the zero-match row becomes observable, and position for tied points must decide between ROW_NUMBER and RANK.",
      "Allow draws (equal scores, 1 point each): rewrite the CASE so a drawn side earns 1 — and re-check whether the group-1 tie picture changes.",
      "Tie-break head-to-head instead of by id: why does one pair's result not generalize to a three-way tie, and what extra data would the rule need?",
    ],
    related: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "top-competitors"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "find-the-start-and-end-number-of-continuous-ranges",
    statement:
      "Logs is a numbered event table (log_id, num): num = 1 marks kept rows, num = 0 filler. A continuous range is a MAXIMAL run of consecutive log_id values that all carry num = 1 — it ends wherever a filler row (or the table's edge) breaks the chain. Report every range as start_id, end_id, run_length, ordered by start_id ascending. The seeded log_ids are unique and contiguous.",
    examples: [
      {
        input: "log_ids 1, 2, 3 are kept; 4 and 5 are filler",
        output: "1 · 3 · 3",
        explanation:
          "Maximality: the run starts at the table's first id and stops right before the first filler.",
      },
      {
        input: "log_id 6 is kept but 7 is filler",
        output: "6 · 6 · 1",
        explanation:
          "A single kept id between fillers is its own range: start equals end and the length is 1.",
      },
    ],
    constraints: [
      "num is 0 or 1; a range contains only num = 1 rows with no id gaps inside",
      "ranges are maximal — filler rows always split, kept rows never split",
      "columns start_id, end_id, run_length — ordered by start_id ascending",
    ],
    breakdown: [
      "The question's grain is the RUN, while the table's grain is the row — the gaps-and-islands situation, and its classic move is to hand every kept row an ISLAND KEY: a value that is constant inside a run and different across runs. One expression does it: log_id - ROW_NUMBER() OVER (ORDER BY log_id), computed over the kept rows. Inside a consecutive run the id climbs by exactly one per row, and so does the row number, so their difference cannot move.",
      "The arithmetic is worth internalizing, because it tells you when the key breaks. If the next kept id is a + 1, the next key is (a + 1) - (k + 1) = a - k — unchanged. A filler row burns an id without burning a row number, so after a break of g filler rows the key jumps by g: every filler pushes the key up, which is exactly what a new island means. The key is a per-row local invariant — no LAG, no NULL handling, no running total; the whole island structure lives in one expression.",
      "With islands named, the answer is one GROUP BY away: MIN(log_id) starts the run, MAX(log_id) ends it, COUNT(*) measures it. The make-or-break detail is filter placement: the WHERE num = 1 must precede the window computation — in the same SELECT — so the row numbers count only kept rows. Number ALL rows first and filter after, and the fillers have already consumed row numbers: on this contiguous seed every kept row's key collapses to 0 and the three real ranges fuse into one fake run of 9.",
    ],
    edges: [
      "Filter placement is the trap: ROW_NUMBER over all 12 rows and THEN filtering num = 1 leaves every kept row with key 0 (the row numbers tracked all rows), reporting one range (1, 12, 9) instead of three.",
      "Subtraction key vs LAG: the LAG route compares each kept id with the previous kept id, must special-case the first row's NULL, and needs a running SUM of new-island flags — two windows and a bridge; the key is one expression with no NULL branches.",
      "The key needs a deterministic ORDER BY log_id — duplicate ids would scramble the row numbers; the seed's ids are unique, and contiguous, so runs are value-consecutive by construction.",
      "Islands touch both edges of the seed here: the first run starts at id 1 with no row before it, the last ends at id 12 with none after — MIN and MAX per group need no boundary special-casing.",
    ],
    ladder: [
      { title: "Brute force — walk and cut", body: "Sort by log_id in application code, walk the rows, cut a run whenever the next kept id stops incrementing. Correct, sequential, and unshareable with the database." },
      { title: "The pattern — island key + GROUP BY", body: "WHERE num = 1, assign log_id - ROW_NUMBER() OVER (ORDER BY log_id), GROUP BY it, then MIN, MAX and COUNT." },
      { title: "The optimal idea — make consecutive-ness a local invariant", body: "O(n log n) for the sort, O(n) to group. The transferable rule: a sequential scan with a carry (the current run) can often be replaced by a per-row invariant that needs no carry — the island key is the canonical example." },
    ],
    approach: "Gaps-and-islands: filter kept rows, island key log_id - ROW_NUMBER(), GROUP BY with MIN/MAX/COUNT",
    schema: {
      ddl: `CREATE TABLE Logs (
  log_id INTEGER PRIMARY KEY,
  num    INTEGER NOT NULL  -- 1 = kept, 0 = filler
);`,
      seed: `INSERT INTO Logs (log_id, num) VALUES
  (1, 1),
  (2, 1),
  (3, 1),
  (4, 0),  -- filler: splits the first run
  (5, 0),  -- filler
  (6, 1),  -- a lone kept id: its own range
  (7, 0),  -- filler: splits again
  (8, 1),
  (9, 1),
  (10, 1),
  (11, 1),
  (12, 1);`,
      tables: [
        { name: "Logs", note: "12 contiguous ids — kept runs 1-3, 6 and 8-12, separated by filler runs 4-5 and 7" },
      ],
    },
    code: `WITH kept AS (
    SELECT
        log_id,
        log_id - ROW_NUMBER() OVER (ORDER BY log_id) AS island  -- constant within a run
    FROM Logs
    WHERE num = 1          -- filter FIRST: the window must count kept rows only
)
SELECT
    MIN(log_id) AS start_id,
    MAX(log_id) AS end_id,
    COUNT(*)    AS run_length
FROM kept
GROUP BY island
ORDER BY start_id;`,
    walkthrough: [
      "WHERE num = 1 keeps 9 rows — ids 1, 2, 3, 6, 8, 9, 10, 11, 12 — numbered 1 through 9 in id order.",
      "The keys: 1-1 = 0, 2-2 = 0, 3-3 = 0, then the fillers bite — 6-4 = 2, and after the lone filler at 7: 8-5 = 3, 9-6 = 3, 10-7 = 3, 11-8 = 3, 12-9 = 3. Three islands: {0}, {2}, {3}.",
      "Per island: key 0 -> start 1, end 3, length 3; key 2 -> (6, 6, 1); key 3 -> start 8, end 12, length 5 — ordered by start_id: (1, 3, 3), (6, 6, 1), (8, 12, 5).",
    ],
    time: "O(n log n) — one ordered pass for the window, one grouped pass",
    space: "O(n) — one keyed row per kept log",
    followUps: [
      "Report only the longest run, or all runs tying for longest — an argmax over run_length; which shape survives the tie?",
      "Rewrite with LAG plus a running SUM of break flags and count the moving parts against the subtraction key — where does each version bend if log_id itself has gaps?",
      "Per-user streaks: partition the island key by user_id — what must the ROW_NUMBER's PARTITION BY and ORDER BY become, and why does the key formula not change?",
    ],
    related: ["merge-overlapping-events-in-the-same-hall", "report-contiguous-dates", "consecutive-available-seats"],
    order: "exact",
    xp: 20,
  },
];
