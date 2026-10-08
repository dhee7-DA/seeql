// Deep-dives — LeetCode Premium batch IV, file 3 of 6: the four HARD engines —
// rising-transaction runs, two-hop popularity, calendar-day streaks and the
// warehouse stocking argmax (4 problems, Hard, xp 35 each). Engine-verified by
// scripts/tmp-68b3-check.ts. Re-authored from the canonical premium tasks:
// own tables, own seeds, original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM4_STREAKS: LcSqlDive[] = [
  {
    slug: "consecutive-transactions-with-increasing-amounts",
    statement:
      "Transactions records one row per transaction: (tx_id, customer_id, amount, tx_date), with tx_date written as YYYY-MM-DD text. A customer's transactions are read in chronological order — by tx_date first, and on the same day by tx_id. A customer qualifies when at least three CONSECUTIVE transactions have strictly increasing amounts: consecutive means adjacent in that reading order, and strictly increasing means every amount is greater than the amount before it, so an equal amount ends a run. For each qualifying customer, report customer_id and best_run_start, where best_run_start is the tx_id of the first transaction of their longest qualifying run; if two runs tie in length, take the one with the smaller starting tx_id. Customers with no qualifying run appear nowhere in the output. Order by customer_id.",
    examples: [
      {
        input:
          "customer 1 transacts 10 on 2024-01-01 (tx 1), then 20 and 25 on 2024-01-02 (txs 2 and 3 — same day), then 40 on 2024-01-04 (tx 4)",
        output: "1 · 1",
        explanation:
          "Read in (tx_date, tx_id) order the amounts run 10, 20, 25, 40 — three rises in a row make a 4-transaction run that starts at tx 1, and the same-day pair stays pinned in tx_id order.",
      },
      {
        input:
          "customer 4 transacts 60 on 2024-04-01 (tx 13), then 90 and 80 on 2024-04-02 (txs 14 and 15 — same day)",
        output: "(no row)",
        explanation:
          "The chronological reading is 60, 90, 80 — the second same-day amount is LOWER than the first, so the rising run snaps at two transactions and two is short of three.",
      },
    ],
    constraints: [
      "one row per qualifying customer, ordered by customer_id ascending — customers without a run of three are absent, not zero",
      "consecutive means adjacency in (tx_date, tx_id) order, and the increase must be strict: an equal amount ends a run",
      "a run of k transactions carries k-1 rises, so qualifying needs 3 rows = 2 consecutive rises; best_run_start is the tx_id of the first of those 3+ rows, with length ties resolved to the smaller starting tx_id",
    ],
    breakdown: [
      "A rising run is a relationship between ADJACENT rows, and adjacency only exists once an ordering is fixed. LAG(amount) OVER (PARTITION BY customer_id ORDER BY tx_date, tx_id) hands each transaction its chronological predecessor, and the run test collapses to a per-row comparison: amount > prev_amount. The two-column ORDER BY is not decoration — tx_id is what makes two same-day transactions comparable at all, and without it the engine is free to read them in either order. Every later step inherits this ordering, so getting it wrong here poisons the whole pipeline.",
      "Each comparison becomes an up-flag, and runs are islands of consecutive flags. A new island starts wherever the flag is 0 — the first row of a customer, a drop, or an equal amount — and the island id is a running sum of those starts. The threshold hides an off-by-one worth stating slowly: a run of k transactions produces k-1 up-flags, so three consecutive rising transactions means TWO consecutive flags, or equivalently an island holding at least 3 ROWS. Counting flags and demanding three of them would quietly demand four rising transactions; measuring an island's rows is the safe grain.",
      "The final shape is a per-customer argmax over islands. Keep each island's first row (position 1) and its length, drop islands shorter than 3 rows, then rank each customer's survivors by length descending with the starting tx_id ascending as the tie-break. Customers whose longest island is under 3 rows simply have no survivor, so the filter delivers the absence contract for free — no spine join is needed here, because absent customers are supposed to vanish. And because the pick is a ROW_NUMBER over a fully ordered key, exactly one row per customer ships deterministically.",
    ],
    edges: [
      "The equal amount: customer 2 reads 10, 20, 20, 30 across four straight days. A flag written with >= marks the 20-then-20 pair as rising, fuses all four rows into one island of 4, and reports (2, 5) — a customer who qualifies under no honest reading; the strict > is what snaps their timeline into two 2-row islands.",
      "The total-flags misread: customer 2 also carries exactly TWO up-flags in total (10 above 10, then 30 above 20, with the break in between). An implementation that counts flags per customer and admits at 2 reports them; only CONSECUTIVE flags build a run, and customer 2's flags never touch.",
      "The same-day tie: txs 14 and 15 (customer 4) share 2024-04-02. Ordered (tx_date, tx_id) the day reads 90 then 80 and the spike dies at two rows; flipping the tie-break to tx_id DESC instead reads 60, 80, 90 — customer 1's same-day pair inverts too (10, 25, 20) — and the wrong ordering ships (3, 10) and a fabricated (4, 13) while customer 1 vanishes.",
      "Run position does not matter: customer 3 opens with 50 then 40 — a drop — and their qualifying run is the LAST three transactions (40, 45, 55 starting at tx 10). The island key puts that trailing run on equal footing with customer 1's opening run; an implementation that only inspected runs anchored at a customer's first transactions reports (1, 1) and misses customer 3 entirely.",
    ],
    ladder: [
      { title: "Brute force — walk each customer's timeline", body: "Sort each customer's rows by (tx_date, tx_id), sweep once keeping a current run length and start, and remember the best run per customer. Three moving state variables that the engine expresses as two windows and a ranking." },
      { title: "The pattern — LAG to flags, SUM to islands", body: "One window reads the predecessor amount and emits an up-flag; a second window runs a running sum of flag-0 rows to stamp an island id; a third window then measures each island's rows and marks its first row." },
      { title: "The optimal idea — measure islands in rows, not flags", body: "O(n log n). The durable rule: run detection on a flag is an islands problem, and the flag-to-row off-by-one (k rows = k-1 flags) decides the threshold — measure the island's ROWS against 3, and let the final ROW_NUMBER carry the longest-run tie-break." },
    ],
    approach: "LAG up-flags in (tx_date, tx_id) order, running-sum island keys, keep islands of 3+ rows, rank longest-first with smallest start as tie-break",
    schema: {
      ddl: `CREATE TABLE Transactions (
  tx_id       INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  amount      INTEGER NOT NULL,
  tx_date     TEXT NOT NULL   -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO Transactions (tx_id, customer_id, amount, tx_date) VALUES
  (1, 1, 10, '2024-01-01'),
  (2, 1, 20, '2024-01-02'),   -- same day as tx 3: tx_id breaks the tie
  (3, 1, 25, '2024-01-02'),
  (4, 1, 40, '2024-01-04'),
  (5, 2, 10, '2024-02-01'),
  (6, 2, 20, '2024-02-02'),
  (7, 2, 20, '2024-02-03'),   -- equal amount: the run-breaker
  (8, 2, 30, '2024-02-04'),
  (9, 3, 50, '2024-03-01'),
  (10, 3, 40, '2024-03-02'),  -- drop: a non-increasing open
  (11, 3, 45, '2024-03-03'),
  (12, 3, 55, '2024-03-04'),
  (13, 4, 60, '2024-04-01'),
  (14, 4, 90, '2024-04-02'),  -- txs 14/15 share the day: read 90 then 80, spike dies
  (15, 4, 80, '2024-04-02');`,
      tables: [
        { name: "Transactions", note: "15 transactions over 4 customers — customer 1 runs 10-20-25-40, customer 2 breaks on an equal pair, customer 3 qualifies on their last three, customer 4 spikes once" },
      ],
    },
    code: `WITH ordered AS (                    -- chronological read: tx_date, then tx_id on same-day ties
    SELECT
        customer_id,
        tx_id,
        tx_date,
        amount,
        LAG(amount) OVER (
            PARTITION BY customer_id
            ORDER BY tx_date, tx_id
        ) AS prev_amount
    FROM Transactions
),
flagged AS (                         -- up-flag: STRICTLY greater than the predecessor
    SELECT
        customer_id,
        tx_id,
        tx_date,
        CASE WHEN prev_amount IS NOT NULL AND amount > prev_amount THEN 1 ELSE 0 END AS up
    FROM ordered
),
keyed AS (                           -- island id = number of run-breaks seen so far
    SELECT
        customer_id,
        tx_id,
        tx_date,
        SUM(1 - up) OVER (
            PARTITION BY customer_id
            ORDER BY tx_date, tx_id
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS isl
    FROM flagged
),
runs AS (                            -- each island is one run of consecutively rising txs
    SELECT
        customer_id,
        tx_id,
        COUNT(*)     OVER (PARTITION BY customer_id, isl) AS run_len,
        ROW_NUMBER() OVER (PARTITION BY customer_id, isl ORDER BY tx_date, tx_id) AS pos
    FROM keyed
),
best AS (                            -- rank each customer's qualifying runs
    SELECT
        customer_id,
        tx_id,
        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY run_len DESC, tx_id ASC) AS pick
    FROM runs
    WHERE pos = 1 AND run_len >= 3   -- 3 rows = the 2 consecutive up-flags the problem demands
)
SELECT
    customer_id,
    tx_id AS best_run_start
FROM best
WHERE pick = 1
ORDER BY customer_id;`,
    walkthrough: [
      "The LAG window walks each customer's timeline in (tx_date, tx_id) order: customer 1 reads 10, 20, 25, 40 — the same-day pair in tx_id order — and emits three up-flags in a row, while customer 2 reads 10, 20, 20, 30 and the 20-to-20 pair drops a flag mid-timeline.",
      "Islands form on the breaks: customer 1 is one island of 4 rows starting at tx 1, customer 3's 50-then-40 drop isolates tx 9 and leaves {tx 10, 11, 12} as a 3-row island starting at tx 10, and customer 4's spike island {tx 13, 14} stops at 2 rows.",
      "The 3-row filter keeps customer 1's and customer 3's islands, the per-customer ranking picks each longest, and the output ships (1, 1) then (3, 10) — customers 2 and 4 hold no island of 3 rows and are absent, while a tx_id DESC tie-break would have fabricated (4, 13) and dropped customer 1.",
    ],
    time: "O(n log n) — one ordered window pass per stage over the transaction log",
    space: "O(n) — the flagged and keyed rows held between window stages",
    followUps: [
      "Return every qualifying run per customer (not just the longest) as start tx_id and length, ordered by customer then start — which filter moves from the ranking stage into the report, and what does customer 1 ship?",
      "Relax the test from strictly increasing to non-decreasing and re-run the seed — which single operator changes, and why does customer 2 flip from absent to a 4-row run?",
    ],
    related: ["customers-with-strictly-increasing-purchases", "longest-winning-streak", "consecutive-available-seats"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "popularity-percentage",
    statement:
      "Friendship stores an undirected social graph one row per friendship: (user1_id, user2_id), always stored once with user1_id < user2_id — the pair (4, 9) appears exactly once and describes both directions. A user's two-hop candidates are the DISTINCT users reachable through exactly one intermediate friend: some friend F of user U is friends with W, where W is neither U nor already a friend of U. Let total_users be the number of distinct users appearing in Friendship. For EVERY such user, report user_id and popularity_pct, where popularity_pct = ROUND(100.0 * candidates / (total_users - 1), 2) — the share of the other users they could still be introduced to. Users with zero candidates still appear, at 0. Order by user_id.",
    examples: [
      {
        input:
          "user 4 is friends with 3 and 5; user 3 is also friends with 1 and 2; user 5 has no other friends; 7 users appear in Friendship in total",
        output: "4 · 33.33",
        explanation:
          "Two hops from user 4 reach 1 and 2 through friend 3, and both are strangers — 2 candidates out of the 6 other users is ROUND(200.0 / 6, 2) = 33.33.",
      },
      {
        input: "users 6 and 7 are friends with each other and with nobody else",
        output: "6 · 0 · 7 · 0",
        explanation:
          "The only two-hop walk from user 6 is 6 to 7 to 6, which lands on user 6 itself; the self-exclusion empties the candidate set, and the spine still ships both rows at 0.",
      },
    ],
    constraints: [
      "every user appearing in Friendship appears exactly once, ordered by user_id ascending — zero-candidate users report 0, they never vanish",
      "candidates are DISTINCT users at exactly two hops, excluding the user themself and every existing friend, with friendships traversable in both directions",
      "popularity_pct is computed in floating point — 100.0 * candidates / (total_users - 1), rounded to 2 places",
    ],
    breakdown: [
      "The storage contract hides the first decision: each friendship is one row, but every walk must traverse it in both directions. UNION ALL of (user1, user2) with (user2, user1) doubles six stored rows into twelve directed edges, and every later join reads that directed form. A self-join that only follows the stored orientation does not merely run slower — it changes answers, because a user whose friendships are all stored backwards has no outgoing edge at all.",
      "Two hops are a self-join on the directed edges: paths a-to-f and f-to-b glue into (a, b) pairs, and DISTINCT collapses the many-walks-one-pair duplicates. Then two different exclusions apply, and they must not be fused: dropping candidate = user removes the user themself, since a walk home is not an introduction, while an anti-join against the directed edges removes everyone already a friend. On a dense cluster the anti-join does the heavy lifting — most two-hop landings are people the user already knows, which is exactly why crowded graphs keep these numbers small.",
      "The spine decides who survives to the output. Building FROM the candidate list directly erases users whose candidate set is empty, and a zero-candidate user is a meaningful row — the report promises every user. So start from DISTINCT users, LEFT JOIN the filtered candidates, and count a candidate-side column so the unmatched users count 0 rather than the phantom 1 that COUNT(*) would read off the NULL row. The percentage then runs in floating point (100.0 promotes the division) before ROUND, because integer-first arithmetic would floor a repeating 16.666 down to 16.0.",
    ],
    edges: [
      "The already-friends exclusion: user 1's two-hop landings are {2, 3, 4} — but 2 and 3 are already friends of user 1, so only 4 survives as a candidate. Skipping the anti-join reports 3 candidates and prints 50.0 where the truth is 16.67.",
      "The one-way graph: user 5's only friendship is stored as (4, 5), so a query that reads stored rows as directed gives user 5 no outgoing edge at all, and user 4 loses the backward walk into 3 as well — the wrong orientation prints 0.00 for users 4 and 5 instead of 33.33 and 16.67.",
      "The self-landing: users 6 and 7 each own exactly one two-hop walk — 6 to 7 to 6, and 7 to 6 to 7 — landing on themselves. Keeping those walks (dropping only the candidate = user test) reports 1 candidate each and prints 16.67 where the truth is 0.",
      "The missing spine: users 6 and 7 hold zero candidates after filtering, so a report built FROM the filtered candidates ships 5 rows instead of 7 — the two quiet users vanish instead of appearing at 0.00.",
    ],
    ladder: [
      { title: "Brute force — second-degree search per user", body: "For each user, walk each friend's friend list by hand, cross out the user and their existing friends, deduplicate, and divide by the other-user count. Correct for one graph, unrunnable for a growing one." },
      { title: "The pattern — directed edges, self-join, two filters", body: "UNION ALL both orientations once, join the edge list to itself for two-hop pairs, subtract self and friends, then aggregate over a spine that includes everyone." },
      { title: "The optimal idea — spine, anti-join, floating point", body: "O(E^2) in the directed edge count but a single pipeline. The durable rules: undirected data becomes directed data by UNION ALL before any join; who must appear is decided by the FROM clause (a LEFT JOIN spine), never by a HAVING; and percentages promote to floating point before they round." },
    ],
    approach: "UNION ALL both orientations, self-join for exact two-hop pairs, anti-join out self and friends, LEFT JOIN spine off distinct users",
    schema: {
      ddl: `CREATE TABLE Friendship (
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  PRIMARY KEY (user1_id, user2_id)
);`,
      seed: `INSERT INTO Friendship (user1_id, user2_id) VALUES
  (1, 2),   -- dense triangle: 1, 2, 3 all mutual
  (1, 3),
  (2, 3),
  (3, 4),   -- the triangle's one bridge outward
  (4, 5),   -- user 5 is a leaf hanging off user 4
  -- 6 and 7 form an isolated pair, connected to nothing else
  (6, 7);`,
      tables: [
        { name: "Friendship", note: "6 friendships over 7 users — a mutual 1-2-3 triangle plus a bridge to leaf 5, and the isolated pair 6-7" },
      ],
    },
    code: `WITH directed AS (                    -- undirected storage read in BOTH directions
    SELECT user1_id AS a, user2_id AS b FROM Friendship
    UNION ALL
    SELECT user2_id AS a, user1_id AS b FROM Friendship
),
users AS (                            -- every user the edge list mentions
    SELECT user1_id AS user_id FROM Friendship
    UNION
    SELECT user2_id FROM Friendship
),
twohop AS (                           -- exact two-hop walks, deduplicated to pairs
    SELECT DISTINCT d1.a AS user_id, d2.b AS candidate
    FROM directed d1
    JOIN directed d2 ON d2.a = d1.b
),
filtered AS (                         -- two different exclusions, kept separate
    SELECT t.user_id, t.candidate
    FROM twohop t
    WHERE t.candidate <> t.user_id    -- a walk home is not an introduction
      AND NOT EXISTS (                -- strangers only: already-friends are out
            SELECT 1 FROM directed d
            WHERE d.a = t.user_id AND d.b = t.candidate
      )
),
counts AS (                           -- the spine keeps zero-candidate users alive
    SELECT u.user_id, COUNT(f.candidate) AS candidates
    FROM users u
    LEFT JOIN filtered f ON f.user_id = u.user_id
    GROUP BY u.user_id
),
totals AS (
    SELECT COUNT(*) AS total_users FROM users
)
SELECT
    c.user_id,
    ROUND(100.0 * c.candidates / (t.total_users - 1), 2) AS popularity_pct
FROM counts c
CROSS JOIN totals t
ORDER BY c.user_id;`,
    walkthrough: [
      "directed turns 6 stored rows into 12 and users lists all 7 of them, so the denominator total_users - 1 is 6 for every user on the graph.",
      "Filtering the two-hop pairs: user 4 lands on {1, 2} — both strangers, both reached through friend 3 — user 1 shrinks to {4} because 2 and 3 are already friends, and users 6 and 7 only ever walk home, so both filter to nothing.",
      "The spine counts users 1, 2, 3 and 5 at one candidate and user 4 at two, and the output ships (1, 16.67), (2, 16.67), (3, 16.67), (4, 33.33), (5, 16.67), (6, 0), (7, 0) — the repeating sixth of 100 lands on 16.67 and 33.33 only because ROUND sees floating point.",
    ],
    time: "O(E^2) worst case for the two-hop self-join, E = directed edge count",
    space: "O(E + P) — the directed edge list plus the deduplicated pair set",
    followUps: [
      "Rank users by popularity_pct descending with user_id as the tie-break — which window replaces the final ORDER BY, and do users 6 and 7 still ship rows?",
      "Extend the walk to three hops under the same not-me-not-my-friends rule — what does a third self-join cost, and which users on this seed gain candidates first?",
    ],
    related: ["second-degree-follower", "leetcodify-similar-friends", "friend-requests-ii-who-has-the-most-friends"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "customers-with-maximum-number-of-transactions-on-consecutive-days",
    statement:
      "Purchase logs one row per purchase: (purchase_id, customer_id, purchase_date, amount), with dates as YYYY-MM-DD text. A customer may purchase several times on the same day — the DAY is the grain, not the receipt. A streak is a run of consecutive CALENDAR days that each contain at least one purchase by that customer, and a customer's longest streak is the length of their longest such run. Report customer_id and longest_streak for EVERY customer whose longest streak equals the largest streak in the whole table, ordered by customer_id.",
    examples: [
      {
        input:
          "customer 1 purchases on 2024-03-01, twice on 2024-03-02 (two receipts), and once on 2024-03-03 and 2024-03-04",
        output: "1 · 4",
        explanation:
          "Five receipts but four distinct days, all consecutive — the duplicate day collapses to one row before any numbering runs, leaving a clean 4-day streak.",
      },
      {
        input:
          "customer 4 purchases on 2024-03-01 and 2024-03-02, then again on 2024-03-08 and 2024-03-09",
        output: "(no row — their longest streak is 2)",
        explanation:
          "Four purchase days in the month but two separate 2-day runs; the empty stretch between splits the timeline, and only a single unbroken run may count.",
      },
    ],
    constraints: [
      "the streak grain is the distinct (customer_id, purchase_date) — same-day receipts count once",
      "consecutive means calendar-consecutive: the next day, across month ends and leap days",
      "the output carries every customer tied at the global maximum, ordered by customer_id ascending",
    ],
    breakdown: [
      "The dedupe is not tidiness — it is what keeps the numbering honest. The island trick needs each customer's days numbered 1, 2, 3 in date order, and two receipts on one day would take two numbers: the same date would then map to two different island keys, and one unbroken run would be reported as fragments. Deduplicating to one row per (customer_id, purchase_date) first makes the row number a pure function of the day, which is the foundation the next step stands on.",
      "The island key is date arithmetic: ROW_NUMBER per customer by date, then julianday(purchase_date) minus that row number. On a run of consecutive days both sides step by exactly 1, so the difference stays constant, and it jumps the moment a day is skipped. julianday earns its place over any home-grown day-of-month math by handling month ends and the 2024 leap day for free — 2024-02-28, 2024-02-29 and 2024-03-01 step by exactly 1.0 apiece. The CAST to INTEGER pins the key down: julianday returns a .5-suffixed float for midnight, and an exact integer key keeps GROUP BY from comparing floats.",
      "Measuring the islands is two GROUP BYs with a MAX in between: count rows per (customer, island), take each customer's MAX as their longest streak, then take the MAX of those across customers to find the global bar. The winners are found by joining back on equality with that bar — not by LIMIT 1, which survives only while the maximum is unique and silently drops every tie the day two customers match. This seed keeps the maximum unique (customer 1 at 4), but the machinery is set-based on purpose: the two customers parked one level down at 3 tie with each other, and a report aimed at any other bar must be able to return many rows.",
    ],
    edges: [
      "The same-day receipt: customer 1 buys twice on 2024-03-02 (receipts 102 and 103). Without the distinct-days step the duplicate takes row numbers 2 and 3, the same date maps to two island keys, and the 4-day run reports as a 3 — the wrong query's global bar drops to 3 and it ships three tied winners (customers 1, 2 and 3) instead of the true single champion.",
      "The split timeline: customer 4 owns four purchase days (2024-03-01, 03-02, 03-08, 03-09) but no 4-day run — the islands measure 2 and 2. A report that counts DISTINCT days per customer and calls it a streak reads 4 for customer 4, ties the champion, and ships (1, 4) plus a fabricated (4, 4).",
      "The leap boundary: customer 2's run is 2024-02-28, 2024-02-29, 2024-03-01 — two calendar edges inside one streak. Day-of-month arithmetic (or comparing the day part as a string) splits at the month end and reports 2; julianday steps 2460368.5, 2460369.5, 2460370.5 and keeps the run whole.",
      "The tie one level down: customers 2 and 3 both top out at 3, one short of the champion. A filter at streak = 3 must return both — the join-back is a set operation — while a LIMIT 1 habit works on this seed only through the luck of the unique maximum and breaks the moment the bar is shared.",
    ],
    ladder: [
      { title: "Brute force — sort and sweep", body: "Pull each customer's distinct days sorted, walk the list comparing each day to the previous day plus one, count runs, keep the max, then scan all customers for the global max. A hand-rolled island detector the engine ships as one arithmetic key." },
      { title: "The pattern — row-number island key", body: "Dedupe to (customer, day), number each customer's days in date order, and group by julianday(date) minus the row number: constant inside a run, jumping across gaps." },
      { title: "The optimal idea — dedupe before numbering, join back for winners", body: "O(d log d) over d distinct customer-days. The durable rules: the island key is only as honest as the numbering beneath it (dedupe first), date math belongs to julianday rather than day-of-month subtraction, and everyone-at-the-max is an equality join, never a LIMIT." },
    ],
    approach: "DISTINCT (customer, day) spine, ROW_NUMBER island keys via julianday minus rn, per-customer MAX, then a global-MAX join-back",
    schema: {
      ddl: `CREATE TABLE Purchase (
  purchase_id   INTEGER PRIMARY KEY,
  customer_id   INTEGER NOT NULL,
  purchase_date TEXT NOT NULL,   -- 'YYYY-MM-DD'
  amount        INTEGER NOT NULL
);`,
      seed: `INSERT INTO Purchase (purchase_id, customer_id, purchase_date, amount) VALUES
  (101, 1, '2024-03-01', 50),
  (102, 1, '2024-03-02', 30),  -- same-day double with 103: dedupe to one day
  (103, 1, '2024-03-02', 20),
  (104, 1, '2024-03-03', 10),
  (105, 1, '2024-03-04', 70),  -- champion run: 4 straight days
  (106, 2, '2024-02-28', 40),  -- run crosses the leap day
  (107, 2, '2024-02-29', 60),
  (108, 2, '2024-03-01', 80),
  (109, 3, '2024-03-20', 15),
  (110, 3, '2024-03-21', 25),
  (111, 3, '2024-03-22', 35),  -- tied with customer 2 at 3
  (112, 4, '2024-03-01', 10),  -- two separate 2-day runs
  (113, 4, '2024-03-02', 20),
  (114, 4, '2024-03-08', 30),
  (115, 4, '2024-03-09', 40),
  (116, 5, '2024-03-15', 99);`,
      tables: [
        { name: "Purchase", note: "16 receipts over 5 customers — customer 1 holds a 4-day run, customers 2 and 3 top out at 3 (customer 2 across the leap day), customer 4 owns two 2-day runs, customer 5 a single day" },
      ],
    },
    code: `WITH days AS (                        -- the grain is the DAY: same-day receipts collapse
    SELECT DISTINCT customer_id, purchase_date
    FROM Purchase
),
numbered AS (                         -- each customer's days, counted in date order
    SELECT
        customer_id,
        purchase_date,
        ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY purchase_date
        ) AS rn
    FROM days
),
islands AS (                          -- constant key inside a run of consecutive days
    SELECT
        customer_id,
        purchase_date,
        CAST(julianday(purchase_date) - rn AS INTEGER) AS isl
    FROM numbered
),
streaks AS (                          -- length of each run of consecutive days
    SELECT customer_id, isl, COUNT(*) AS streak_len
    FROM islands
    GROUP BY customer_id, isl
),
best AS (                             -- each customer's longest single run
    SELECT customer_id, MAX(streak_len) AS longest_streak
    FROM streaks
    GROUP BY customer_id
),
gmax AS (                             -- the global bar every winner must equal
    SELECT MAX(longest_streak) AS gm FROM best
)
SELECT
    b.customer_id,
    b.longest_streak
FROM best b
CROSS JOIN gmax g
WHERE b.longest_streak = g.gm         -- equality join, so ties at the top all ship
ORDER BY b.customer_id;`,
    walkthrough: [
      "days collapses 16 receipts to 15 customer-days — customer 1's twin 2024-03-02 receipts become one row, which is what lets the numbering treat each day exactly once.",
      "The island keys hold steady across customer 1's four days (streak 4), hold steady across customer 2's 02-28 to 03-01 walk through the leap day (streak 3), and split customer 4's timeline at the empty stretch into two 2-day islands.",
      "best reads 4, 3, 3, 2, 1 and the global bar is 4, so the equality join ships exactly (1, 4) — the day-counting variant would have tied customer 4 with the champion at 4, and the un-deduped variant would have crowned three customers at 3.",
    ],
    time: "O(d log d) — one sort per customer over d distinct customer-days",
    space: "O(d) — the deduplicated spine and island keys",
    followUps: [
      "Report each customer's longest streak beside the start date of that streak — which column survives the island GROUP BY, and what does customer 2 show for a run that crosses a month end?",
      "Parameterize a minimum streak length and count the customers at or above it — where does the parameter enter, and why does the equality join-back already handle a many-way tie at the bar?",
    ],
    related: ["report-contiguous-dates", "the-number-of-passengers-in-each-bus-ii", "products-with-three-or-more-orders-in-two-consecutive-years"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "maximize-items",
    statement:
      "Item catalogs products one row each: (item_id, item_type, item_category, cost), where item_type is a single letter — 'W', 'F' or 'C' — and several categories can share a type at different costs. Warehouse lists storage one row per site: (warehouse_id, square_feet). A filled warehouse stocks exactly ONE item type, every unit of it occupies 1 square foot, and a type's unit cost is the CHEAPEST cost among its Item rows — the pricier categories never set the price. For each warehouse, compute how many units of each type would fit: floor(square_feet * 1.0 / unit_cost_of_type). Report warehouse_id, item_type and max_items for the single best (type, count) per warehouse — the type filling the most units, with count ties broken by item_type alphabetically — ordered by warehouse_id.",
    examples: [
      {
        input:
          "warehouse 1 offers 1000 square feet; the cheapest W item costs 2, the cheapest F costs 5, the cheapest C costs 3",
        output: "1 · W · 500",
        explanation:
          "floor(1000.0 / 2) = 500, floor(1000.0 / 5) = 200, floor(1000.0 / 3) = 333 — the W units fit deepest and win outright.",
      },
      {
        input: "warehouse 2 offers 749 square feet against the same three unit costs",
        output: "2 · W · 374",
        explanation:
          "floor(749.0 / 2) = 374, floor(749.0 / 5) = 149, floor(749.0 / 3) = 249 — W still wins, but the tighter floor leaves 374 rather than the 500 of the bigger site, because floor(n / c) keeps the cheapest type on top at every size.",
      },
    ],
    constraints: [
      "one row per warehouse; item_type is the argmax of the three per-type capacities, ties broken by item_type ascending",
      "max_items = floor(square_feet * 1.0 / MIN(cost of that type)) — the unit cost comes from the cheapest category of the type, never an average",
      "ordered by warehouse_id ascending",
    ],
    breakdown: [
      "The unit cost is a per-type property, and the MIN has to be taken BEFORE any warehouse math. A type's rows carry decoy costs — the pricier categories exist in the catalog and must not dilute the price a bulk buyer would pay — so the pipeline starts with a per-type MIN(cost) grouped over Item alone. Reaching for AVG instead is the natural slip, and it is not a small slip: with this seed's costs the averages run 4, 7 and 5 against the true minimums 2, 5 and 3, and every capacity in the report changes.",
      "Warehouses and types live at different grains, and the report needs every pair — that is a CROSS JOIN, six combinations from two warehouses and three types. The capacity formula is floor(square_feet * 1.0 / unit_cost): the 1.0 promotion forces REAL division before the CAST to INTEGER truncates. SQLite's native integer division happens to truncate toward zero, which equals floor for positive operands — 749 / 2 is already 374 here — but writing the promotion states the intent and keeps the formula honest on engines and drivers where the implicit cast bites.",
      "Picking the winner per warehouse is an argmax over three rows, and an aggregate cannot carry its own identity: MAX(max_items) answers how many but never which type. ROW_NUMBER() OVER (PARTITION BY warehouse_id ORDER BY max_items DESC, item_type ASC) ranks the three candidates with the count first and the alphabetical type as the settled tie-break, and rn = 1 keeps exactly one row per warehouse. Note what the arithmetic guarantees: floor(n / c) is monotone in the cost, so the cheapest type tops every warehouse at every size — the winner type can never flip with square footage, only the counts move.",
    ],
    edges: [
      "The AVG dilution: the catalog's second rows cost 6 (W), 9 (F) and 7 (C), so the type averages are 4, 7 and 5 against the true unit costs 2, 5 and 3. Averaging first reports warehouse 2 as (W, 187) instead of (W, 374) and warehouse 1 as (W, 250) instead of (W, 500) — both graded rows wrong on the count.",
      "The bare integer division: 749 / 2 truncates to exactly 374 on SQLite and 1000 / 3 to 333, so on this positive-operand seed the shortcut agrees with floor row for row. The trap is portability, not today's output: the * 1.0 promotion is what says floor, and CAST(x AS INTEGER) truncates toward zero rather than rounding.",
      "The per-item join: CROSS JOINing Warehouse straight to Item (skipping the MIN CTE) competes each site against every catalog row — warehouse 2 against the cost-6 gizmo reads floor(749.0 / 6) = 124, and the argmax then ranks six per-item rows instead of three per-type ones. The winning type survives by luck while the count is wrong by 250.",
      "The missing tie-break: this seed's six capacities (500, 200, 333, 374, 149, 249) are all distinct, so the alphabetical rule never fires — but ORDER BY max_items DESC alone leaves any future tie to engine fate. The rule costs one column and decides, say, a 3-square-foot site where W and C both floor to a single unit.",
    ],
    ladder: [
      { title: "Brute force — price each type by hand", body: "Look up the cheapest product per type, divide each warehouse's area by each of the three prices on a calculator, write down the floors, and eyeball the biggest. Three divisions per site that the engine composes from one CTE and one cross join." },
      { title: "The pattern — MIN CTE, cross join, floor", body: "Group Item by type for the unit costs, CROSS JOIN against Warehouse to get the (site, type) pairs, and compute the truncated division with an explicit 1.0 promotion." },
      { title: "The optimal idea — argmax by window with a settled tie-break", body: "O(W * T). The durable rules: a per-type price is an aggregate taken before the join, floor means promote-then-truncate rather than native-division-by-luck, and the-row-that-wins-the-max is ROW_NUMBER over (value DESC, deterministic tie-break ASC)." },
    ],
    approach: "per-type MIN(cost) CTE, CROSS JOIN warehouses with types, floor division via 1.0 promotion, ROW_NUMBER argmax (count DESC, type ASC)",
    schema: {
      ddl: `CREATE TABLE Item (
  item_id       INTEGER PRIMARY KEY,
  item_type     TEXT NOT NULL,   -- 'W', 'F' or 'C'
  item_category TEXT NOT NULL,
  cost          INTEGER NOT NULL
);
CREATE TABLE Warehouse (
  warehouse_id INTEGER PRIMARY KEY,
  square_feet  INTEGER NOT NULL
);`,
      seed: `INSERT INTO Item (item_id, item_type, item_category, cost) VALUES
  (1, 'W', 'gadget', 2),   -- cheapest W: sets the type's unit cost
  (2, 'W', 'gizmo', 6),    -- pricier W category: the AVG dilution decoy
  (3, 'F', 'snack', 5),
  (4, 'F', 'meal', 9),
  (5, 'C', 'shirt', 3),
  (6, 'C', 'coat', 7);
INSERT INTO Warehouse (warehouse_id, square_feet) VALUES
  (1, 1000),
  (2, 749);`,
      tables: [
        { name: "Item", note: "6 products across 3 types — the cheapest of each type (2, 5, 3) sets its unit cost, the pricier rows are dilution decoys" },
        { name: "Warehouse", note: "2 sites — 1000 and 749 square feet, each filled with a single type" },
      ],
    },
    code: `WITH unit_cost AS (                   -- the cheapest category defines each type's price
    SELECT item_type, MIN(cost) AS cost_per_item
    FROM Item
    GROUP BY item_type
),
combinations AS (                     -- every site competes in all three types
    SELECT
        w.warehouse_id,
        w.square_feet,
        u.item_type,
        u.cost_per_item
    FROM Warehouse w
    CROSS JOIN unit_cost u
),
capacities AS (                       -- floor division: 1.0 forces REAL arithmetic
    SELECT
        warehouse_id,
        item_type,
        CAST(square_feet * 1.0 / cost_per_item AS INTEGER) AS max_items
    FROM combinations
),
ranked AS (
    SELECT
        warehouse_id,
        item_type,
        max_items,
        ROW_NUMBER() OVER (
            PARTITION BY warehouse_id
            ORDER BY max_items DESC, item_type ASC   -- count first, then alphabetical
        ) AS rn
    FROM capacities
)
SELECT
    warehouse_id,
    item_type,
    max_items
FROM ranked
WHERE rn = 1
ORDER BY warehouse_id;`,
    walkthrough: [
      "unit_cost reads the catalog down to three prices — W at 2, F at 5, C at 3 — because the 6, 9 and 7 rows lose to the MIN inside their own types.",
      "The cross join builds six pairs and the floor division fills them: warehouse 1 at 500, 200, 333 and warehouse 2 at 374, 149, 249 — 749.0 / 2 truncates to 374, not 375.",
      "The per-warehouse ranking crowns W at 500 for site 1 and W at 374 for site 2 — same type, different counts, exactly what floor's monotonicity predicts — and the output ships (1, W, 500) then (2, W, 374).",
    ],
    time: "O(I + W * T) — one grouped pass over the catalog, then a constant-size competition per warehouse",
    space: "O(W * T) — one capacity row per warehouse-type pair",
    followUps: [
      "Report all three capacities per warehouse side by side as three columns — which pivot shape replaces the argmax, and what happens to a type whose cheapest row disappears from the catalog?",
      "Cap each type by its available stock so a small warehouse can run out — where does the cap enter the floor formula, and can the winner type now flip with square footage once caps bind?",
    ],
    related: ["game-play-analysis-ii", "product-sales-analysis-iv", "highest-grade-for-each-student"],
    order: "exact",
    xp: 35,
  },
];
