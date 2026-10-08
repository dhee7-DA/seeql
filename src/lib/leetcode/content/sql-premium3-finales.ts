// Deep-dives — premium SQL batch 7, file 6 of 6: the HARD finale file — taste
// graphs, hiring budgets, purchase runs and chart tallies (4 Hard, 1 Medium,
// 1 Easy). Engine-verified by scripts/tmp-67b6-check.ts.
// Re-authored from the canonical premium tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM3_FINALS: LcSqlDive[] = [
  {
    slug: "leetcodify-similar-friends",
    statement:
      "Two tables describe a music app's social graph. Friendship stores each friendship exactly once as (user1_id, user2_id) with the smaller id in user1_id — the pair is undirected, so (1, 2) and (2, 1) are the same bond. Listen logs every play as (user_id, song_id, played_at). Two users are taste-alikes when at least 3 DISTINCT songs appear in both of their listening histories — replays of one song by the same user add plays, not songs. Report every pair that is BOTH a friendship AND taste-alikes: columns user1_id, user2_id, each qualifying pair once with the smaller id first, ordered by user1_id ascending then user2_id ascending.",
    examples: [
      {
        input:
          "users 1 and 2 are friends, and their histories overlap on songs 101, 102, 103 and 104 — four distinct songs",
        output: "1 · 2",
        explanation:
          "The self-join on song_id matches four row pairs on four different songs, so COUNT(DISTINCT song_id) reads 4 ≥ 3, and Friendship row (1, 2) confirms the bond.",
      },
      {
        input:
          "users 2 and 4 are friends; user 2 played song 112 three times, user 4 played it once, and both played song 113 once",
        output: "(not reported)",
        explanation:
          "The join matches 4 rows, but only 2 distinct songs — replays are not new songs, so the pair falls under the threshold despite the row count.",
      },
    ],
    constraints: [
      "a pair ships once, as (smaller_id, larger_id) — mirrored duplicates never appear",
      "taste-alike requires at least 3 distinct shared songs; repeated plays of one song by either user contribute that song once",
      "both conditions must hold — the pair appears in Friendship AND shares ≥ 3 distinct songs — and the output is columns user1_id, user2_id ordered by user1_id, then user2_id",
    ],
    breakdown: [
      "Counting a shared-song overlap is a self-join before it is anything else: Listen joined to itself on song_id produces one row for every way two users' plays meet on the same song, and GROUP BY the user pair collapses that pile into one row per pair. The inequality l1.user_id < l2.user_id does two jobs at once. It discards the degenerate matches where a user joins to their own plays, and it hands every pair a canonical orientation — (1, 2) but never (2, 1) — so the report cannot double-count. Without it, every qualifying pair ships twice, mirrored, and the ORDER BY dutifully prints both copies.",
      "The threshold counts SONGS, not plays, and that distinction is where a naive row count dies. The join produces, per pair, the sum over shared songs of (plays by one user) × (plays by the other) — replays multiply it. Pair (2, 4) shows the failure in miniature: song 112 alone contributes three join rows because user 2 played it three times against user 4's one, and with song 113 the pair reads four matched rows while sharing only two distinct songs. COUNT(DISTINCT l1.song_id) is what turns 'rows that matched' into 'songs they actually share', and the HAVING then enforces the real threshold of three.",
      "The taste test alone is not the report — the friendship gate turns a taste graph into a social one, and it must accept the pair in either orientation. An EXISTS with an OR over both column orders (or a UNION ALL that normalizes Friendship into canonical (min, max) pairs before joining) states the undirectedness outright. On this seed every Friendship row happens to be stored smaller-id-first, so a single-orientation join would survive — but that is the seed's discipline, not a guarantee the query should lean on. Pair (5, 6) is the gate made visible: five shared songs, the strongest taste overlap in the table, and no friendship row anywhere.",
    ],
    edges: [
      "Drop the friendship gate and (5, 6) — five shared songs, no Friendship row in either column — joins the output: three rows where two are correct.",
      "COUNT(*) instead of COUNT(DISTINCT song_id) reads 4 for pair (2, 4) — three of those rows are the same song 112, replayed — and wrongly admits a pair that shares exactly two songs.",
      "Remove l1.user_id < l2.user_id and every pair ships mirrored: (1, 2) also appears as (2, 1), and the output doubles from two rows to four.",
      "A join written backwards (l1 matching f.user2_id, l2 matching f.user1_id) returns ZERO rows on this seed even though (1, 2) and (3, 5) are friends — orientation matters, and the EXISTS-with-OR is the form that forgets nothing.",
    ],
    ladder: [
      {
        title: "Brute force — intersect song sets per pair",
        body: "Pull each user's distinct songs into a set, walk every pair of users, intersect the sets, then look the pair up in Friendship by hand. Correct, but it is O(U^2) set work the engine's join-key grouping already does in one pass.",
      },
      {
        title: "The pattern — canonical self-join, HAVING the distinct count",
        body: "Join Listen to itself on song_id with the user inequality, GROUP BY the canonical pair, HAVING COUNT(DISTINCT song_id) >= 3 — the overlap threshold lives in one clause, and the join key does the pairing.",
      },
      {
        title: "The optimal idea — threshold first, gate second",
        body: "O(L log L) in practice. The durable shape: let the join and group compute the expensive semantic (shared distinct songs), then filter by the cheap relational fact (friendship) with a semi-join — EXISTS never multiplies rows, no matter how wide the gate table is.",
      },
    ],
    approach:
      "self-join Listen on song_id with canonical user order, HAVING COUNT(DISTINCT song_id) >= 3, then EXISTS-check Friendship in either orientation",
    schema: {
      ddl: `CREATE TABLE Friendship (
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  PRIMARY KEY (user1_id, user2_id)
);
CREATE TABLE Listen (
  user_id   INTEGER NOT NULL,
  song_id   INTEGER NOT NULL,
  played_at TEXT NOT NULL  -- 'YYYY-MM-DD HH:MM:SS'
);`,
      seed: `INSERT INTO Friendship (user1_id, user2_id) VALUES
  (1, 2),  -- friends sharing 4 distinct songs: IN
  (2, 4),  -- friends, but replays shrink the distinct overlap to 2: OUT
  (3, 4),  -- friends sharing 2 songs: below the threshold
  -- (3, 5) shares exactly 3 distinct songs: IN
  (3, 5);
INSERT INTO Listen (user_id, song_id, played_at) VALUES
  (1, 101, '2024-05-01 08:00:00'),
  (1, 102, '2024-05-01 09:30:00'),
  (1, 103, '2024-05-02 10:00:00'),
  (1, 104, '2024-05-03 11:15:00'),
  (2, 101, '2024-05-01 12:00:00'),
  (2, 102, '2024-05-02 08:45:00'),
  (2, 103, '2024-05-02 18:20:00'),
  (2, 104, '2024-05-04 07:10:00'),
  (2, 112, '2024-05-01 07:00:00'),
  (2, 112, '2024-05-01 19:00:00'),
  (2, 112, '2024-05-03 21:30:00'),  -- song 112 replayed by user 2 three times
  (2, 113, '2024-05-02 13:00:00'),
  (3, 105, '2024-05-01 09:00:00'),
  (3, 106, '2024-05-02 10:30:00'),
  (3, 114, '2024-05-03 12:00:00'),
  (3, 115, '2024-05-04 14:00:00'),
  (3, 116, '2024-05-05 16:00:00'),
  (4, 105, '2024-05-01 11:00:00'),
  (4, 106, '2024-05-03 09:40:00'),
  (4, 112, '2024-05-02 20:00:00'),
  (4, 113, '2024-05-04 10:20:00'),
  (5, 107, '2024-05-01 06:30:00'),
  (5, 108, '2024-05-02 07:30:00'),
  (5, 109, '2024-05-03 08:30:00'),
  (5, 110, '2024-05-04 09:30:00'),
  (5, 111, '2024-05-05 10:30:00'),
  (5, 114, '2024-05-01 15:00:00'),
  (5, 115, '2024-05-02 16:30:00'),
  (5, 116, '2024-05-04 17:45:00'),
  (6, 107, '2024-05-02 05:15:00'),
  (6, 108, '2024-05-03 06:25:00'),
  (6, 109, '2024-05-04 07:35:00'),
  (6, 110, '2024-05-05 08:45:00'),
  (6, 111, '2024-05-06 09:55:00');`,
      tables: [
        { name: "Friendship", note: "4 undirected pairs, each stored once with the smaller id first" },
        {
          name: "Listen",
          note: "34 plays over 6 users — 1+2 share 4 songs, 3+4 share 2, 3+5 share 3, 5+6 share 5 (not friends), 2+4 share 2 distinct (song 112 replayed)",
        },
      ],
    },
    code: `WITH shared AS (
    SELECT
        l1.user_id AS a,
        l2.user_id AS b,
        COUNT(DISTINCT l1.song_id) AS shared_songs  -- replays collapse to one song
    FROM Listen l1
    JOIN Listen l2
      ON l2.song_id = l1.song_id
     AND l2.user_id > l1.user_id          -- canonical order: no mirrors, no self-matches
    GROUP BY l1.user_id, l2.user_id
    HAVING COUNT(DISTINCT l1.song_id) >= 3
)
SELECT s.a AS user1_id, s.b AS user2_id
FROM shared s
WHERE EXISTS (                        -- the bond may sit in either column
        SELECT 1 FROM Friendship f
        WHERE f.user1_id = s.a AND f.user2_id = s.b
    )
   OR EXISTS (
        SELECT 1 FROM Friendship f
        WHERE f.user1_id = s.b AND f.user2_id = s.a
    )
ORDER BY user1_id, user2_id;`,
    walkthrough: [
      "The self-join reduces 34 plays to candidate pairs, and the HAVING keeps three of them: (1, 2) with 4 distinct shared songs, (3, 5) with 3, and (5, 6) with 5. Pair (2, 4) reads 4 join rows but only 2 distinct songs, and pair (3, 4) reads 2 — both fall.",
      "The EXISTS gates what remains: (1, 2) finds Friendship row (1, 2), (3, 5) finds (3, 5), and (5, 6) finds nothing in either orientation and drops — the friendship filter bites on the seed's strongest taste overlap.",
      "ORDER BY user1_id, user2_id ships (1, 2) then (3, 5) — two rows from three taste-alike pairs.",
    ],
    time: "O(L log L) — the song-keyed join and its grouping, L = play rows",
    space: "O(U^2) worst case — one grouped row per candidate user pair",
    followUps: [
      "Make the taste test harder: a shared song counts only when BOTH users played it on the SAME day — where does played_at enter the join, and what does COUNT(DISTINCT song_id) do when one song qualifies on two different days?",
      "Recommend pairs who share at least 3 songs but are NOT friends — which anti-join shape replaces the EXISTS gate, and which seed pair becomes the only answer?",
    ],
    related: ["leetcodify-friends-recommendations", "friend-requests-ii-who-has-the-most-friends", "the-airport-with-the-most-flights"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "the-number-of-seniors-and-juniors-to-join-the-company",
    statement:
      "Candidate lists applicants as (candidate_id, name, role, salary), with role 'senior' or 'junior'. Hiring runs separately within each role against that role's own budget — 50000 for seniors, 30000 for juniors — and always from the cheapest candidate up: consider candidates in ascending salary order (salary ties break by candidate_id ascending) and hire each one whose running total, meaning every earlier salary in that order plus their own, stays within the role's budget. Report columns role, accepted_candidates — how many candidates each role hired — one row per role, ordered senior first.",
    examples: [
      {
        input: "senior salaries 15000 (Ruth, id 1), 15000 (Sven, id 2), 25000 (Tova, id 3) — senior budget 50000",
        output: "senior · 2",
        explanation:
          "The running totals read 15000, 30000, 55000 — Tova's crosses the line, and everyone behind her only climbs higher.",
      },
      {
        input: "junior salaries 8000, 10000, 12000, 13000 — junior budget 30000",
        output: "junior · 3",
        explanation:
          "The total lands exactly on 30000 for the third candidate; 'within the budget' includes equality, so only the fourth is rejected.",
      },
    ],
    constraints: [
      "each role runs its own race — budgets, ordering and running sums never mix across roles",
      "salary ties break by candidate_id ascending, so each member of a tie sits inside the other's running sum",
      "columns role, accepted_candidates — one row per role, 'senior' first, then 'junior'",
    ],
    breakdown: [
      "The hiring rule reads like a loop — sort, accumulate, stop — but every piece of it is a window clause in disguise. PARTITION BY role gives each role a private race, so no junior salary ever touches a senior's running total. ORDER BY salary, candidate_id encodes both the cheapest-first order and the tie policy in one line: tied salaries are still distinct rows, and candidate_id picks which one is 'earlier'. The running total itself is SUM(salary) over that ordering with a frame from the partition's first row through the current one — a candidate is hired exactly when that total, which includes their own salary, is at most their role's budget.",
      "The tie-break is not cosmetic; it decides each tie member's running sum. Ruth (id 1) and Sven (id 2) share salary 15000: under ROWS with candidate_id ordering, Ruth's window holds 15000 and Sven's holds 30000 — each tie member rides inside the other's sum. Order the same window by salary alone with the default RANGE frame and both peers get stamped with 30000, erasing the difference between 'first of the tie' and 'second of the tie'. On this seed both survive either way because the boundary sits elsewhere, but at a 20000 budget the candidate_id form hires exactly one of them and the RANGE form hires neither — the frames are not interchangeable, and the explicit ROWS clause is where the determinism gets written down.",
      "What remains is a flagged count pivoted into two rows. The window marks every candidate with their running total, a WHERE compares it to a per-role budget through a CASE (a join to a tiny budgets list works the same), and GROUP BY role counts the survivors. The output order needs its own thought — alphabetically 'junior' sorts before 'senior', so ORDER BY role would print the junior row first and break the contract; a CASE ranking 'senior' 0 and 'junior' 1 states the intended order instead. Counting surviving rows is safe because the running total only grows: once it passes the budget, every later candidate in that partition has passed it too.",
    ],
    edges: [
      "Xena (id 7, 12000) pushes the junior total to exactly 30000 — the test is <=, so she is hired; a strict less-than filter reports 2 juniors instead of 3.",
      "The senior boundary lands on Tova (id 3), a unique salary: 30000 + 25000 = 55000 over the 50000 budget. Keeping the boundary off the tie pair means the verdict never depends on tie handling.",
      "Umar (id 4, 40000) is rejected although 40000 alone is under 50000 — his running total carries the whole cheaper pool (95000); the budget tests the cumulative, never the lone salary.",
      "The senior tie gets running sums 15000 and 30000 under ROWS + candidate_id but 30000 for BOTH under a salary-only RANGE frame — at a 20000 budget the first form hires one senior and the second hires none.",
    ],
    ladder: [
      {
        title: "Brute force — sort, accumulate, stop, twice",
        body: "Sort each role's candidates by (salary, id), walk the list adding salaries until the budget would break, and write the count down — once per budget. The engine expresses the walk as one windowed sum per partition.",
      },
      {
        title: "The pattern — per-role running sum against a per-role budget",
        body: "SUM(salary) OVER (PARTITION BY role ORDER BY salary, candidate_id) tags every candidate with their cumulative cost; comparing it to a CASE-mapped budget flags the hired rows.",
      },
      {
        title: "The optimal idea — the window sequences, the GROUP BY reports",
        body: "O(n log n). The durable rule: 'hire while the cumulative fits' is a running-sum flag, and 'how many fit' is COUNT over the flagged rows — the tie policy lives in the OVER's ORDER BY, where the engine applies it before any sum runs.",
      },
    ],
    approach:
      "SUM(salary) OVER (PARTITION BY role ORDER BY salary, candidate_id) <= per-role budget, then COUNT per role with senior ordered first",
    schema: {
      ddl: `CREATE TABLE Candidate (
  candidate_id INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL,  -- 'senior' | 'junior'
  salary       INTEGER NOT NULL
);`,
      seed: `INSERT INTO Candidate (candidate_id, name, role, salary) VALUES
  (1, 'Ruth', 'senior', 15000),  -- tie pair, cheaper id considered first
  (2, 'Sven', 'senior', 15000),  -- running 30000, both tie members hired
  (3, 'Tova', 'senior', 25000),  -- running 55000: the boundary, on a unique salary
  (4, 'Umar', 'senior', 40000),  -- running 95000: out despite salary under budget
  (5, 'Vera', 'junior', 8000),   -- running 8000
  (6, 'Wale', 'junior', 10000),  -- running 18000
  -- Xena lands the junior total on exactly 30000: <= keeps her
  (7, 'Xena', 'junior', 12000),
  -- Yuri's 13000 lifts the total to 43000: out
  (8, 'Yuri', 'junior', 13000);`,
      tables: [
        {
          name: "Candidate",
          note: "8 applicants, 4 per role — senior budget 50000 hires 2, junior budget 30000 hires 3",
        },
      ],
    },
    code: `WITH pool AS (
    SELECT
        role,
        SUM(salary) OVER (
            PARTITION BY role
            ORDER BY salary, candidate_id  -- ties break by id: each tie member
                                           -- rides in the other's running sum
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS running_total
    FROM Candidate
)
SELECT
    role,
    COUNT(*) AS accepted_candidates        -- rows that survived the budget
FROM pool
WHERE running_total <= CASE role
        WHEN 'senior' THEN 50000
        ELSE 30000                         -- 'junior'
    END
GROUP BY role
-- senior first ('junior' sorts before 'senior' alphabetically)
ORDER BY CASE role WHEN 'senior' THEN 0 ELSE 1 END;`,
    walkthrough: [
      "Seniors in (salary, candidate_id) order: Ruth 15000, Sven 30000, Tova 55000, Umar 95000 — the 50000 budget keeps Ruth and Sven, count 2.",
      "Juniors: Vera 8000, Wale 18000, Xena 30000 (exactly the budget, kept by <=), Yuri 43000 — count 3.",
      "The pivot ships ('senior', 2) then ('junior', 3) — the CASE ordering, not alphabetical role order, puts the senior row first.",
    ],
    time: "O(n log n) — one partitioned sort feeding the running sum",
    space: "O(n) — every candidate flagged before the count",
    followUps: [
      "Set the junior budget to 0 and the 'junior' row must still ship, as 0 — which scaffold (a VALUES CTE + LEFT JOIN + COALESCE) keeps a role that hired nobody on the report?",
      "Report the HIRED NAMES in hiring order instead of counts — what changes in the projection, and why does the monotone running-total flag make a LIMIT unnecessary?",
    ],
    related: ["find-cumulative-salary-of-an-employee", "rank-scores", "department-top-three-salaries"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "the-number-of-seniors-and-juniors-to-join-the-company-ii",
    statement:
      "The same Candidate table (candidate_id, name, role, salary) now hires from ONE shared budget of 70000 covering the whole pool. Candidates are considered in ascending salary order across both roles at once — salary ties break by candidate_id ascending, and role plays no part in the ordering — and a candidate is hired when every earlier salary in that order plus their own stays within the budget. Report columns role, accepted_candidates for 'senior' and 'junior' — ordered senior first — and keep both roles in the output even if one hired nobody.",
    examples: [
      {
        input: "the pool opens junior 10000 (Ana), senior 11000 (Ben), junior 12000 (Cleo) — shared budget 70000",
        output: "all three hired — the shared total runs 10000, 21000, 33000",
        explanation:
          "One pool, one running sum: roles interleave by salary and the total never resets between them.",
      },
      {
        input: "Cleo (id 3, junior) and Dee (id 4, senior) both list salary 12000",
        output: "Cleo is considered first — her total includes Dee's 12000, and Dee's includes hers",
        explanation:
          "candidate_id, not role, orders a tie; on this seed both fit anyway, but each one's running sum carries the other.",
      },
    ],
    constraints: [
      "one shared budget of 70000: the running sum spans the whole pool, with no role partition",
      "ties break by candidate_id ascending across roles — the role counts can depend on that order near the boundary",
      "columns role, accepted_candidates — both roles always present (0 when a role hires nobody), senior row first",
    ],
    breakdown: [
      "The whole diff from a per-role hiring race is one clause: there is no PARTITION BY. SUM(salary) OVER (ORDER BY salary, candidate_id) accumulates across seniors and juniors alike, because the budget is shared and the consideration order is shared. Every other piece — the explicit ROWS frame, the tie-break inside the OVER's ORDER BY, the <= comparison — survives unchanged. Dropping the partition is the fix, and re-adding it out of habit is the bug: on this seed a partitioned sum would hand each role a fresh 70000 and report eight hires where five exist.",
      "Mixed-role ties are where the single pool earns its subtlety. Cleo (id 3, junior) and Dee (id 4, senior) share salary 12000; candidate_id orders Cleo first, so her running total is 33000 and Dee's is 45000 — each tie member's sum carries the other. Both fit under 70000, but squeeze the budget to 40000 and the tie alone decides the report: the candidate_id order keeps one junior and drops the senior, while a role-first tie policy would swap which of the two survives and change both counts. Sorting by salary and hoping the engine agrees is not a spec — the tie-break lives inside the OVER clause or nowhere.",
      "The reporting side must keep a promise the grouped data cannot: both roles appear, even a role that hired nobody. A bare GROUP BY over hired candidates only forms groups from rows that exist, so a zero-hire role would vanish from a two-row report. The robust shape scaffolds the roles from a two-row VALUES CTE and LEFT JOINs the tallied counts onto it, with COALESCE turning a missing group into 0. The senior-first ordering again needs a CASE — alphabetical order puts 'junior' first — and it applies to the scaffold, not the tally.",
    ],
    edges: [
      "Fay (id 6, senior, 13000) takes the shared total to 70500 — 500 over budget — and is the boundary; Gus (20000) and Hana (21000) are rejected too, because the running total never comes back down.",
      "The tie pair Cleo (id 3, junior) / Dee (id 4, senior) at 12000 runs 33000 then 45000 under candidate_id order — a role-first tie policy would swap those sums and, at a 40000 budget, flip the senior and junior counts.",
      "Both roles hire on this seed by design, but the shape still owes the zero: a bare GROUP BY drops an empty role, and only the VALUES scaffold + LEFT JOIN + COALESCE keeps 'senior' or 'junior' reporting 0.",
      "Eli (id 5, junior, 12500) is the last hire at 57500, leaving a 12500 gap that makes Fay's 13000 the crossing — the seed places the boundary on a unique salary so the verdict never rides on tie handling.",
    ],
    ladder: [
      {
        title: "Brute force — one list, one accumulator",
        body: "Sort all eight candidates by (salary, id) into a single list, run one accumulator against 70000, then tally the hired per role by hand. Works, but re-sorts and re-accumulates for every budget change.",
      },
      {
        title: "The pattern — the missing PARTITION BY is the whole semantic",
        body: "One windowed SUM over the whole table with ORDER BY salary, candidate_id (no role partition), then a WHERE against 70000 flags the hired rows.",
      },
      {
        title: "The optimal idea — shared budget, shared partition, scaffolded report",
        body: "O(n log n). The durable rules: a shared budget means one partition; the tie policy lives in the OVER clause; and 'report every group, even empty' means scaffolding the keys and LEFT JOINing the counts, never trusting GROUP BY to invent absent rows.",
      },
    ],
    approach:
      "SUM(salary) OVER (ORDER BY salary, candidate_id) <= 70000 over the WHOLE pool, then a VALUES role scaffold LEFT JOINed to per-role counts",
    schema: {
      ddl: `CREATE TABLE Candidate (
  candidate_id INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL,  -- 'senior' | 'junior'
  salary       INTEGER NOT NULL
);`,
      seed: `INSERT INTO Candidate (candidate_id, name, role, salary) VALUES
  (1, 'Ana', 'junior', 10000),   -- running 10000
  (2, 'Ben', 'senior', 11000),   -- running 21000
  (3, 'Cleo', 'junior', 12000),  -- tie with Dee, cheaper id: running 33000
  (4, 'Dee', 'senior', 12000),   -- tie, second: running 45000
  (5, 'Eli', 'junior', 12500),   -- running 57500, the last hire
  (6, 'Fay', 'senior', 13000),   -- running 70500: the boundary, 500 over
  (7, 'Gus', 'junior', 20000),   -- running 90500: out
  -- Hana's 21000 lifts the total to 111500: out
  (8, 'Hana', 'senior', 21000);`,
      tables: [
        {
          name: "Candidate",
          note: "8 applicants, 4 per role — one shared 70000 budget hires 3 juniors and 2 seniors",
        },
      ],
    },
    code: `WITH pool AS (
    SELECT
        role,
        SUM(salary) OVER (
            ORDER BY salary, candidate_id  -- ONE pool: no PARTITION BY role
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS running_total
    FROM Candidate
),
hired AS (
    SELECT role, COUNT(*) AS n
    FROM pool
    WHERE running_total <= 70000           -- the single shared budget
    GROUP BY role
),
roles(role) AS (VALUES ('senior'), ('junior'))
SELECT
    r.role,
    COALESCE(h.n, 0) AS accepted_candidates  -- an empty role still reports
FROM roles r
LEFT JOIN hired h ON h.role = r.role
-- senior first ('junior' sorts before 'senior' alphabetically)
ORDER BY CASE r.role WHEN 'senior' THEN 0 ELSE 1 END;`,
    walkthrough: [
      "One shared timeline in (salary, candidate_id) order: 10000 Ana, 11000 Ben, 12000 Cleo, 12000 Dee, 12500 Eli, 13000 Fay, 20000 Gus, 21000 Hana — running totals 10000, 21000, 33000, 45000, 57500, 70500, 90500, 111500.",
      "The 70000 filter keeps the first five: seniors Ben and Dee (2), juniors Ana, Cleo and Eli (3). Fay misses by 500 and drags Gus and Hana down with her, since the total only grows.",
      "The scaffold LEFT JOINs those tallies onto ('senior', 'junior') and the CASE ordering ships ('senior', 2) then ('junior', 3) — the same two-row contract the per-role version had, fed by one pool instead of two.",
    ],
    time: "O(n log n) — one pool-wide sort feeding the running sum",
    space: "O(n) — the flagged pool plus a two-row role scaffold",
    followUps: [
      "Squeeze the budget to 40000 — which role's count changes, and why does the candidate_id tie-break alone decide it?",
      "Return the hired NAMES in hiring order beside each role's count — what window or sort feeds the list, and why does the monotone flag make a LIMIT unnecessary?",
    ],
    related: ["rank-scores", "count-salary-categories", "second-highest-salary"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "customers-with-strictly-increasing-purchases",
    statement:
      "Purchase logs every transaction as (purchase_id, customer_id, amount, purchase_date), and Customer maps (customer_id, name). A customer qualifies when at least three of their purchases IN A ROW — consecutive in their purchase order, which sorts by purchase_date with purchase_id breaking same-day ties — carry strictly increasing amounts. Report columns customer_id, name for every qualifying customer, ordered by customer_id ascending.",
    examples: [
      {
        input: "customer 1 buys on four straight days, amounts 5, 7, 9, 12",
        output: "1 · Rita",
        explanation:
          "Three consecutive steps, each strictly up — the run here is four purchases long, and four subsumes three.",
      },
      {
        input: "customer 2 spends 30, then 10 and 15 on the same day (purchase_ids 6 and 7), then 20",
        output: "2 · Sana",
        explanation:
          "The 3-run sits at the end — 10 < 15 < 20 — and it only exists because the same-day pair orders by purchase_id, 10 before 15.",
      },
    ],
    constraints: [
      "consecutive means consecutive in (purchase_date, purchase_id) order per customer — calendar gaps never break a run, and run position (start, middle, end) is irrelevant",
      "strictly increasing: an equal amount breaks a run even though nothing decreased",
      "columns customer_id, name, ordered by customer_id",
    ],
    breakdown: [
      "A run of rising amounts is a property of STEPS, not of rows: purchase i rises when its amount beats the purchase before it, and a 3-purchase run is two consecutive rising steps. LAG(amount) OVER (PARTITION BY customer_id ORDER BY purchase_date, purchase_id) places each purchase's predecessor beside it, no matter how the rows sit in the table. The flag is then one comparison — amount > prev_amount — with each customer's first purchase flagged 0, because its LAG is NULL and a comparison against NULL is never true. From there, 'does this customer have a 3-run' has become 'does this customer have two consecutive 1-flags'.",
      "Consecutive flags are an islands problem wearing a GROUP BY's clothes. Give each purchase its per-customer sequence number, then subtract the running count of up-flags: the difference is a group key that holds still while flags stay up and jumps whenever a step fails, so one key collects one rising run. Counting up-flagged rows per (customer, key) counts consecutive ups — the down-flagged rows that can land on a shared key are filtered out before the count — and a customer qualifies the moment any island reaches two ups, because two consecutive ups are exactly three strictly rising purchases.",
      "The tempting shortcut — 'three increasing amounts somewhere in the history' — answers a different question, and the seed punishes it. Customer 4 spends 10, 20, 20, 30: three amounts rise across the sequence, but the equal 20 breaks the run, so no three CONSECUTIVE purchases increase and the customer is out. Customer 3 shows the twin failure: two separate 2-runs produce two up-flags in total, and a query counting all flags instead of consecutive ones would wrongly admit them. The report then joins Customer for the name — a lookup that cannot multiply rows, since customer_id keys the table — and DISTINCT plus ORDER BY customer_id close out the contract.",
    ],
    edges: [
      "Customer 4 (Omar): 10, 20, 20, 30 — three rising amounts, but the equal 20 snaps the chain; an 'increasing subsequence' reading reports him, the consecutive-run reading does not.",
      "Customer 2 (Sana) qualifies only if the same-day pair orders 10 before 15 — an ORDER BY purchase_date alone leaves the tie to the engine and can flip her row; purchase_id is the tie-break the contract names.",
      "Customer 3 (Nils): 5, 8, 3, 6, 2 gives two up-flags in two separate islands — counting flags instead of CONSECUTIVE flags reports him wrongly.",
      "Customer 5 (Pia) descends 9, 7, 5, 3 — zero up-flags, an empty islands set, and she vanishes without a single special case.",
    ],
    ladder: [
      {
        title: "Brute force — slide a triple window per customer",
        body: "For each customer, sort their purchases by (date, id) and slide a window of three, testing two comparisons per window. Fine for five customers, painful at a million rows, and it re-derives what one flagged pass already knows.",
      },
      {
        title: "The pattern — LAG flags, islands key, per-island count",
        body: "LAG plus a CASE builds the up-flags; the sequence-minus-running-flag-sum key turns flags into islands; a per-island COUNT finds any run of at least two ups.",
      },
      {
        title: "The optimal idea — flag, group, aggregate",
        body: "O(n log n). The durable shape: convert 'a consecutive property over rows' into 'a flag per row', convert flags into groups with the islands key, and aggregate per group — the same skeleton solves streaks, gaps and consecutive-day reports of every flavor.",
      },
    ],
    approach:
      "LAG-based up-flags per customer in (date, id) order, islands via seq minus running flag sum, any island of two or more ups qualifies",
    schema: {
      ddl: `CREATE TABLE Customer (
  customer_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL
);
CREATE TABLE Purchase (
  purchase_id   INTEGER PRIMARY KEY,
  customer_id   INTEGER NOT NULL REFERENCES Customer(customer_id),
  amount        INTEGER NOT NULL,
  purchase_date TEXT NOT NULL  -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO Customer (customer_id, name) VALUES
  (1, 'Rita'),
  (2, 'Sana'),
  (3, 'Nils'),
  (4, 'Omar'),
  (5, 'Pia');
INSERT INTO Purchase (purchase_id, customer_id, amount, purchase_date) VALUES
  (1, 1, 5, '2024-03-01'),
  (2, 1, 7, '2024-03-02'),
  (3, 1, 9, '2024-03-03'),
  (4, 1, 12, '2024-03-04'),
  (5, 2, 30, '2024-03-01'),
  (6, 2, 10, '2024-03-02'),  -- same day as id 7: id order puts 10 before 15
  (7, 2, 15, '2024-03-02'),
  (8, 2, 20, '2024-03-03'),
  (9, 3, 5, '2024-03-01'),
  (10, 3, 8, '2024-03-02'),
  (11, 3, 3, '2024-03-03'),
  (12, 3, 6, '2024-03-04'),
  (13, 3, 2, '2024-03-05'),
  (14, 4, 10, '2024-03-01'),
  (15, 4, 20, '2024-03-02'),
  (16, 4, 20, '2024-03-03'),  -- the equal amount that snaps the run
  (17, 4, 30, '2024-03-04'),
  (18, 5, 9, '2024-03-01'),
  (19, 5, 7, '2024-03-02'),
  (20, 5, 5, '2024-03-03'),
  (21, 5, 3, '2024-03-04');`,
      tables: [
        { name: "Customer", note: "5 customers — 1 and 2 qualify, 3, 4 and 5 each fail for a different reason" },
        { name: "Purchase", note: "21 rows — customer 1 has a 4-run, customer 2 a 3-run at the end, customer 3 two 2-runs, customer 4 a run broken by an equal amount, customer 5 a descent" },
      ],
    },
    code: `WITH stepped AS (
    SELECT
        customer_id,
        amount,
        ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY purchase_date, purchase_id  -- same-day ties break by id
        ) AS seq,
        LAG(amount) OVER (
            PARTITION BY customer_id
            ORDER BY purchase_date, purchase_id
        ) AS prev_amount
    FROM Purchase
),
flagged AS (
    SELECT
        customer_id,
        seq,
        CASE WHEN amount > prev_amount THEN 1 ELSE 0 END AS up  -- NULL prev lands on ELSE
    FROM stepped
),
islands AS (
    SELECT
        customer_id,
        up,
        seq - SUM(up) OVER (
            PARTITION BY customer_id
            ORDER BY seq
        ) AS grp  -- the key holds still while flags stay up
    FROM flagged
),
runs AS (
    SELECT customer_id, grp, COUNT(*) AS ups
    FROM islands
    WHERE up = 1
    GROUP BY customer_id, grp
)
SELECT DISTINCT c.customer_id, c.name
FROM Customer c
JOIN runs r ON r.customer_id = c.customer_id
           AND r.ups >= 2        -- two consecutive ups = three rising purchases
ORDER BY c.customer_id;`,
    walkthrough: [
      "Flags per customer: 1 turns 5, 7, 9, 12 into [0, 1, 1, 1]; 2 turns 30, 10, 15, 20 into [0, 0, 1, 1]; 3 gives [0, 1, 0, 1, 0]; 4 gives [0, 1, 0, 1]; 5 gives [0, 0, 0, 0].",
      "Islands of up-flags: customer 1 one island of 3, customer 2 one island of 2 (the 10, 15, 20 run at the end), customer 3 two islands of 1 each, customer 4 two islands of 1, customer 5 none.",
      "Customers 1 and 2 reach two consecutive ups and ship as (1, 'Rita') then (2, 'Sana') — customers 3, 4 and 5 fail on consecutiveness, equality and direction respectively.",
    ],
    time: "O(n log n) — one partitioned sort feeding the LAG and island passes",
    space: "O(n) — the flagged rows held until the final join",
    followUps: [
      "Report each qualifying customer alongside their LONGEST run length — what window over the islands adds it, and does the seed's maximum change who qualifies?",
      "Allow one equal amount inside a run (non-strict steps) — which flag comparison changes, and which customer's verdict flips on this seed?",
    ],
    related: ["find-interview-candidates", "consecutive-available-seats", "active-users"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "products-with-three-or-more-orders-in-two-consecutive-years",
    statement:
      "Orders records each purchase as (order_id, product_id, quantity, order_date), with order_date stored as 'YYYY-MM-DD' text. A product is a repeat performer when it draws at least 3 orders in some calendar year AND at least 3 orders in the year immediately after — both counts taken from order_date's year alone. Report a single column product_id listing every qualifying product, ordered by product_id ascending.",
    examples: [
      {
        input: "product 1 logs 3 orders in 2023 — the last on 2023-12-31 — and 3 in 2024, the first on 2024-01-01",
        output: "1",
        explanation:
          "Each year independently clears 3; the New Year pair of rows lands on opposite sides of the boundary and both years still count.",
      },
      {
        input: "product 2 logs 3 orders in 2023 but only 2 in 2024",
        output: "(not reported)",
        explanation: "The successor year misses the bar — a strong first year buys nothing without its repeat.",
      },
    ],
    constraints: [
      "the two counts are per calendar year and per product — a total-order count across years decides nothing",
      "the years must be consecutive: 2023 followed by 2024 qualifies, 2023 followed by 2025 does not",
      "one column product_id, one row per qualifying product, ordered by product_id",
    ],
    breakdown: [
      "The report lives at a grain the base table does not have: one row per (product, year) with that year's order count. GROUP BY product_id plus the extracted year builds it in one pass, and the year itself is CAST(strftime('%Y', order_date) AS INTEGER) — strftime pulls the leading four characters and the CAST turns them into a number, so the successor test can be arithmetic. Grouping by the raw year text would even produce correct counts, but the successor test needs a real integer: the string '2023' plus one is not a year.",
      "The consecutive-pair test is then a self-join of the summary against itself: same product, and the right side's year exactly one more than the left's. Both sides must independently clear the 3-order bar — filtering only one side is the classic half-filter, and product 2 (three orders in 2023, two in 2024) exists precisely to punish it. The join also makes 'no successor' visible by absence: product 4's five orders in 2024 form a proud single-year summary row that never matches anything on the right, and inner-join semantics drop it without a special case.",
      "One subtlety keeps the output honest: a product that cleared the bar in three straight years would match twice — once as (2023, 2024) and once as (2024, 2025) — and the join would print it twice. DISTINCT collapses those into the single row per product the contract asks for; this seed stays at one qualifying pair per product, so the collapse is invisible, but the keyword is what makes the query survive richer data. Ordering falls to ORDER BY product_id, and the single-column shape leaves nothing else to tie on.",
    ],
    edges: [
      "Product 1's rows on 2023-12-31 and 2024-01-01 straddle the boundary — strftime files them into 2023 and 2024 correctly, while any grouping that mixes the two years silently miscounts both.",
      "Product 2 has 3 orders in 2023 and 2 in 2024 — filtering only the left side of the self-join reports it; BOTH sides must clear 3.",
      "Product 4 logs 5 orders in 2024 and nothing else — the loudest year in the seed — and still drops out: no successor row exists to meet it on the right.",
      "Product 3 qualifies on 2024 + 2025, the later pair — the check is 'some consecutive pair', not 'the earliest year seen'.",
    ],
    ladder: [
      {
        title: "Brute force — bucket by year, check the neighbor",
        body: "For each product, bucket its orders by year in application code, find a bucket holding at least three, and check the next bucket over. The engine's GROUP BY builds every bucket at once and the self-join does the neighbor check.",
      },
      {
        title: "The pattern — summary grain, successor join",
        body: "Aggregate to (product, year) counts with a CAST(strftime(...)) year key, then join the summary to itself on product and year + 1 with both counts >= 3.",
      },
      {
        title: "The optimal idea — lift the grain, join on the successor key",
        body: "O(n log n). The durable shape: lift the grain (orders to product-year), then express the temporal predicate as a join on the successor key — 'period X and period X + 1' generalizes to weeks, months and any interval the key can represent.",
      },
    ],
    approach:
      "GROUP BY (product, strftime year) to per-year counts, self-join year = year + 1 with both sides >= 3, DISTINCT + ORDER BY product_id",
    schema: {
      ddl: `CREATE TABLE Orders (
  order_id   INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  quantity   INTEGER NOT NULL,
  order_date TEXT NOT NULL  -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO Orders (order_id, product_id, quantity, order_date) VALUES
  (1, 1, 2, '2023-02-10'),
  (2, 1, 1, '2023-11-05'),
  (3, 1, 4, '2023-12-31'),  -- the boundary: still 2023
  (4, 1, 3, '2024-01-01'),  -- the boundary: already 2024
  (5, 1, 2, '2024-06-15'),
  (6, 1, 1, '2024-12-30'),
  (7, 2, 5, '2023-03-20'),
  (8, 2, 1, '2023-07-08'),
  (9, 2, 2, '2023-10-14'),
  (10, 2, 1, '2024-04-02'),
  (11, 2, 2, '2024-09-19'),  -- only 2 in 2024: product 2 out
  (12, 3, 1, '2024-01-15'),
  (13, 3, 2, '2024-03-03'),
  (14, 3, 1, '2024-08-21'),
  (15, 3, 3, '2024-11-11'),
  (16, 3, 2, '2025-02-07'),
  (17, 3, 1, '2025-05-30'),
  (18, 3, 4, '2025-10-12'),
  (19, 4, 2, '2024-01-09'),
  (20, 4, 1, '2024-02-11'),
  (21, 4, 3, '2024-05-06'),
  (22, 4, 2, '2024-08-17'),
  -- product 4: 5 orders in 2024 alone, no successor year
  (23, 4, 1, '2024-12-24');`,
      tables: [
        {
          name: "Orders",
          note: "23 orders over 4 products — product 1 pairs 2023+2024, product 2 fails 2024, product 3 pairs 2024+2025, product 4 has a single loud year",
        },
      ],
    },
    code: `WITH per_year AS (
    SELECT
        product_id,
        CAST(strftime('%Y', order_date) AS INTEGER) AS yr,  -- numeric year
        COUNT(*) AS orders_in_year
    FROM Orders
    GROUP BY product_id, CAST(strftime('%Y', order_date) AS INTEGER)
)
SELECT DISTINCT a.product_id           -- a 3-year streak would match twice
FROM per_year a
JOIN per_year b
  ON b.product_id = a.product_id
 AND b.yr = a.yr + 1                   -- the NEXT calendar year
WHERE a.orders_in_year >= 3
  AND b.orders_in_year >= 3            -- both sides clear the bar
ORDER BY a.product_id;`,
    walkthrough: [
      "The summary holds seven rows: (1, 2023, 3), (1, 2024, 3), (2, 2023, 3), (2, 2024, 2), (3, 2024, 4), (3, 2025, 3), (4, 2024, 5).",
      "The successor join matches (1, 2023) to (1, 2024) with 3 and 3, rejects (2, 2023) to (2, 2024) on the 2, matches (3, 2024) to (3, 2025) with 4 and 3, and leaves (4, 2024) unmatched.",
      "DISTINCT and ORDER BY ship product_id 1 then 3 — two rows from four products.",
    ],
    time: "O(n log n) — one grouped pass plus a keyed self-join",
    space: "O(P × Y) — one summary row per product-year",
    followUps: [
      "Report the qualifying pairs as columns product_id, yr, next_yr — which rows appear for a product strong in three straight years, and does DISTINCT still belong?",
      "Require at least 3 orders in EVERY year from a product's first to last — how does a NOT EXISTS per year (or a LAG over the summary) invert the test?",
    ],
    related: ["total-sales-amount-by-year", "product-sales-analysis-iii", "list-the-products-ordered-in-a-period"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "count-artist-occurrences-on-spotify-ranking-list",
    statement:
      "DailyChart stores one row per song appearance: (chart_date, position, song_id). Song bridges songs to artists as (song_id, artist_id), and Artist names them as (artist_id, name). Report columns artist_name, chart_appearances — the number of DailyChart rows belonging to that artist's songs — for the artists on the chart, ordered by chart_appearances descending, then artist_name ascending. Every chart row counts: a song that charts on several days, or twice in one day, adds an appearance each time.",
    examples: [
      {
        input:
          "Aurora holds songs 9 and 10; song 9 charts once on 2024-06-01, and song 10 charts on 2024-06-01 and again on 2024-06-03",
        output: "Aurora · 3",
        explanation:
          "Three chart rows across two songs and two days — two of them share one date, and both count.",
      },
      {
        input: "Caspian's only song is 15, which charts on 2024-06-02 and again on 2024-06-04",
        output: "Caspian · 2",
        explanation: "One song, two appearances — the count follows chart rows, not distinct songs.",
      },
    ],
    constraints: [
      "chart_appearances counts DailyChart ROWS per artist — not distinct songs, not distinct days",
      "the count walks the two-hop path chart to song to artist; Song is the only bridge",
      "columns artist_name, chart_appearances — ordered by count descending, then name ascending",
    ],
    breakdown: [
      "No DailyChart row names an artist, so the join has a mandatory middle: chart rows reach Song by song_id and Song reaches Artist by artist_id. Two inner joins in that order are the whole topology — skipping the bridge is impossible, because there is nothing to join on, and walking the chain from the artist end reads the same three tables. Each chart row survives exactly one path to exactly one artist, so the joins never multiply or lose rows on this seed, and COUNT(*) over the joined rows is the appearance tally.",
      "What COUNT counts is the entire exercise. COUNT(DISTINCT c.song_id) would count distinct songs and report Aurora as 2 — she has two songs — instead of 3. COUNT(DISTINCT c.chart_date) would count days and report her as 2 again, because two of her three rows share 2024-06-01 at positions 1 and 2. The seed plants one song twice (song 15, two different days) and one artist twice in a single day (Aurora on 2024-06-01) precisely so that every wrong grain produces a different, wrong number.",
      "The grouping key and the ordering key finish the report. GROUP BY a.artist_id, a.name groups by identity and lets the display name ride along — two artists sharing a name would merge under a name-only key. The ORDER BY is composite: chart_appearances DESC puts the busiest artist first, and artist_name ASC breaks the tie between Bloom and Caspian, who both sit at 2 — without the name tie-break their relative order would be whatever the engine feels like. The position column is a decoy: the ask never touches it.",
    ],
    edges: [
      "COUNT(DISTINCT c.song_id) reports Aurora 2 and Caspian 1 — song 10 charts twice and song 15 charts twice, and a distinct-song count throws those repeats away.",
      "COUNT(DISTINCT c.chart_date) reports Aurora 2, not 3 — her rows on 2024-06-01 (positions 1 and 2) collapse to one day.",
      "Bloom and Caspian tie at 2 — artist_name ASC is what makes Bloom precede Caspian deterministically.",
      "Dune appears on exactly one row (song 13, position 9) — a HAVING or LIMIT that trimmed 'small' artists would drop her row from the four-row contract.",
    ],
    ladder: [
      {
        title: "Brute force — tally per artist by hand",
        body: "For each artist, list their songs, walk the chart collecting rows that mention any of them, and tally. Three lookups the two joins already perform once over the whole table.",
      },
      {
        title: "The pattern — bridge join, group, count",
        body: "JOIN DailyChart to Song to Artist, GROUP BY the artist's identity, COUNT(*) for the tally.",
      },
      {
        title: "The optimal idea — match the aggregate to the ask's grain",
        body: "O(C + S + A). The durable points: route joins across the bridge table the schema gives you, and pick the counting aggregate that matches the ask — rows, songs and days are three different COUNTs over the same joined rows.",
      },
    ],
    approach:
      "chart to song to artist inner-join chain, GROUP BY artist identity, COUNT(*) ordered by count DESC then name ASC",
    schema: {
      ddl: `CREATE TABLE DailyChart (
  chart_date TEXT NOT NULL,     -- 'YYYY-MM-DD'
  position   INTEGER NOT NULL,
  song_id    INTEGER NOT NULL
);
CREATE TABLE Song (
  song_id   INTEGER PRIMARY KEY,
  artist_id INTEGER NOT NULL REFERENCES Artist(artist_id)
);
CREATE TABLE Artist (
  artist_id INTEGER PRIMARY KEY,
  name      TEXT NOT NULL
);`,
      seed: `INSERT INTO Artist (artist_id, name) VALUES
  (1, 'Aurora'),
  (2, 'Bloom'),
  (3, 'Caspian'),
  (4, 'Dune');
INSERT INTO Song (song_id, artist_id) VALUES
  (9, 1),
  (10, 1),
  (11, 2),
  (13, 4),
  (14, 2),
  (15, 3);
INSERT INTO DailyChart (chart_date, position, song_id) VALUES
  ('2024-06-01', 1, 9),
  ('2024-06-01', 2, 10),   -- Aurora twice on one day
  ('2024-06-03', 5, 10),   -- song 10 again on a later day
  ('2024-06-01', 4, 11),
  ('2024-06-02', 2, 14),
  ('2024-06-02', 7, 15),
  ('2024-06-04', 3, 15),   -- song 15 again, a different day
  ('2024-06-03', 9, 13);`,
      tables: [
        { name: "Artist", note: "4 artists — Aurora ends at 3 appearances, Bloom and Caspian tie at 2, Dune has 1" },
        { name: "Song", note: "6 songs — Aurora holds two of them, which is how 3 chart rows become 3 appearances across 2 songs" },
        { name: "DailyChart", note: "8 rows — song 10 and song 15 each appear twice, and Aurora fills two rows on 2024-06-01" },
      ],
    },
    code: `SELECT
    a.name AS artist_name,
    COUNT(*) AS chart_appearances          -- one per chart ROW, not per day
FROM DailyChart c
JOIN Song  s ON s.song_id   = c.song_id    -- the bridge table
JOIN Artist a ON a.artist_id = s.artist_id
GROUP BY a.artist_id, a.name               -- id groups; the name rides along
ORDER BY chart_appearances DESC, artist_name ASC;`,
    walkthrough: [
      "The two joins thread all 8 chart rows to their artists: rows 1 through 3 land on Aurora (song 9 once, song 10 twice), rows 4 and 5 on Bloom, rows 6 and 7 on Caspian (song 15 twice), row 8 on Dune.",
      "COUNT(*) per artist reads 3, 2, 2, 1 — Aurora's same-day pair on 2024-06-01 counts as two, and song 15's two days count as two for Caspian.",
      "ORDER BY chart_appearances DESC, artist_name ASC ships ('Aurora', 3), ('Bloom', 2), ('Caspian', 2), ('Dune', 1) — the name tie-break visibly orders the 2-2 pair.",
    ],
    time: "O(C + S + A) — one pass per table, hashed on the join keys",
    space: "O(A) — one row per artist",
    followUps: [
      "Include artists whose songs never charted, at 0 — which join direction keeps them, and what does COUNT read for their row?",
      "Add each artist's best (lowest) chart position — does MIN ride the same GROUP BY, and what extra care does a tie for best position need?",
    ],
    related: ["movie-rating", "percentage-of-users-attended-a-contest", "group-sold-products-by-the-date"],
    order: "exact",
    xp: 10,
  },
];
