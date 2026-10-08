// Deep-dives — LeetCode Premium batch I: the warmups (6 problems, all Easy / 10 xp). Engine-verified by scripts/lc-sql-verify.ts.
// Re-authored from the canonical premium tasks: own tables, own names,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM_WARMUPS: LcSqlDive[] = [
  {
    slug: "friend-requests-i-overall-acceptance-rate",
    statement:
      "Two tables track friend requests: FriendRequest logs every sent request (sender_id, send_to_id, request_date) and RequestAccepted logs every acceptance (requester_id, accepter_id, accept_date). Resends and re-synced acceptances mean both tables can hold the same pair more than once. The overall acceptance rate is the number of DISTINCT accepted (requester_id, accepter_id) pairs divided by the number of DISTINCT sent (sender_id, send_to_id) pairs. Return one column, accept_rate, rounded to 2 decimal places, as a single row — no ordering applies to a one-row result.",
    examples: [
      {
        input: "9 sends forming 8 distinct pairs — the (1,2) pair was sent twice · 7 accepts forming 6 distinct pairs — the (1,2) pair was accepted twice",
        output: "0.75",
        explanation:
          "Raw row counts would divide 7 by 9 = 0.78. Both sides must be pair-distinct first: 6 accepted pairs over 8 sent pairs = 0.75.",
      },
      {
        input: "the pair (5,2) is sent but never accepted",
        output: "it counts in the denominator only",
        explanation:
          "Unanswered requests are legitimate sends: they depress the rate rather than disappearing from it.",
      },
    ],
    constraints: [
      "the rate is distinct accepted pairs divided by distinct sent pairs — a pair is (sender_id, send_to_id) on the send side and (requester_id, accepter_id) on the accept side",
      "round the final rate to 2 decimals; the division must be floating point",
      "one column accept_rate, one row, no ordering required",
    ],
    breakdown: [
      "A rate is only as honest as its unit, and here the unit is the REQUEST, not the row. FriendRequest and RequestAccepted both log events, and events repeat: a resend and a re-synced acceptance each add a row without adding a request. So before any division, each table must be reduced to its distinct pairs — (sender_id, send_to_id) on the send side, (requester_id, accepter_id) on the accept side. COUNT(DISTINCT ...) over one column cannot express a pair, so the reliable move is a subquery of DISTINCT pairs counted with COUNT(*).",
      "The division itself hides the batch's favorite trap: integer division. COUNT returns integers, and in SQLite 6/8 evaluates to 0 — a perfectly shaped query that reports 0.00 forever. Multiplying the numerator by 1.0 promotes the whole division to floating point before ROUND sees it. ROUND(x, 2) then trims the tail: 0.75 stays 0.75, while a messier seed such as 5/7 would print 0.71 rather than a ten-digit tail.",
      "Structurally this is two scalar subqueries — each returning a single number — feeding one arithmetic expression in the outer SELECT. No join is needed, and that is deliberate: numerator and denominator live in different tables at different grains, and forcing them through a JOIN would pair rows that have nothing to do with each other. When two aggregates come from different tables, scalar subqueries keep each computation local and readable; reserve joins for when row-level relationships genuinely matter.",
    ],
    edges: [
      "Both sides must be pair-distinct BEFORE dividing: raw counts give 7/9 = 0.78 on this seed, pair-distinct counts give 6/8 = 0.75.",
      "Integer division trap: COUNT returns integers and 6/8 is 0 in SQLite — the 1.0 multiplier promotes the division to floating point.",
      "Pair (5,2) was sent and never accepted: it inflates only the denominator — unanswered requests are how the rate drops below 1.",
      "COUNT(DISTINCT a || '-' || b) is a common shortcut, but '1-23' and '12-3' collide on multi-digit ids — the dedup-then-count subquery has no such hazard.",
    ],
    ladder: [
      { title: "Brute force — eyeball two lists", body: "Dump both tables and count pairs by hand, or divide raw row counts and hope nothing repeats. Both break the moment a pair is sent or accepted twice, which the seed guarantees." },
      { title: "The pattern — dedup, then divide", body: "Two scalar subqueries each SELECT DISTINCT the pair and COUNT the survivors; the outer SELECT divides and rounds." },
      { title: "The optimal idea — define the unit, then count it", body: "O(s + a), one distinct pass per table. The transferable rule: any ratio of 'requests' must define its unit first — here the pair — and deduplicate on that unit on BOTH sides." },
    ],
    approach: "Two pair-deduplicated COUNT subqueries, floating-point division, ROUND to 2",
    schema: {
      ddl: `CREATE TABLE FriendRequest (
  sender_id    INTEGER NOT NULL,
  send_to_id   INTEGER NOT NULL,
  request_date TEXT NOT NULL  -- 'YYYY-MM-DD'
);
CREATE TABLE RequestAccepted (
  requester_id INTEGER NOT NULL,
  accepter_id  INTEGER NOT NULL,
  accept_date  TEXT NOT NULL
);`,
      seed: `INSERT INTO FriendRequest (sender_id, send_to_id, request_date) VALUES
  (1, 2, '2024-03-01'),
  (1, 3, '2024-03-02'),
  (2, 3, '2024-03-03'),
  (2, 4, '2024-03-04'),
  (1, 2, '2024-03-05'),  -- resend of the (1,2) pair: the distinct-count trap
  (3, 4, '2024-03-06'),
  (4, 1, '2024-03-07'),
  (5, 1, '2024-03-08'),  -- sent, never accepted: denominator only
  (5, 2, '2024-03-09');  -- sent, never accepted
INSERT INTO RequestAccepted (requester_id, accepter_id, accept_date) VALUES
  (1, 2, '2024-03-10'),
  (1, 3, '2024-03-11'),
  (2, 3, '2024-03-12'),
  (2, 4, '2024-03-14'),
  (1, 2, '2024-03-13'),  -- the (1,2) pair accepted a second time
  (3, 4, '2024-03-15'),
  (4, 1, '2024-03-16');`,
      tables: [
        { name: "FriendRequest", note: "9 sends forming 8 distinct pairs — (1,2) sent twice, two pairs never answered" },
        { name: "RequestAccepted", note: "7 accepts forming 6 distinct pairs — (1,2) accepted twice" },
      ],
    },
    code: `SELECT
    ROUND(
        1.0 * (SELECT COUNT(*) FROM (
                   SELECT DISTINCT requester_id, accepter_id  -- one row per accepted PAIR
                   FROM RequestAccepted))
      / (SELECT COUNT(*) FROM (
                   SELECT DISTINCT sender_id, send_to_id      -- one row per sent PAIR
                   FROM FriendRequest)),
        2) AS accept_rate;  -- single-row report: nothing to order`,
    walkthrough: [
      "The denominator subquery deduplicates FriendRequest to its 8 distinct pairs from 9 raw rows — the (1,2) resend collapses. The numerator deduplicates RequestAccepted to 6 distinct pairs from 7 raw rows, the (1,2) double-accept collapsing the same way.",
      "1.0 promotes the division: 6.0 / 8 = 0.75. Written bare, 6/8 is integer division and evaluates to 0 — the most common wrong answer on this problem.",
      "ROUND(0.75, 2) is already 0.75 — one row, one column, accept_rate, shipped without an ORDER BY because a single row has no order to fix.",
    ],
    time: "O(s + a) — one distinct-count pass over each table",
    space: "O(p) — one row per distinct pair while deduplicating",
    followUps: [
      "Split the rate by month — GROUP BY the send month of each pair and recompute both distinct counts per bucket; what happens to a pair sent in one month and accepted in the next?",
      "Report the per-pair outcome (accepted or pending) beside the overall rate — which join pairs a twice-sent pair with its single acceptance without duplicating rows?",
    ],
    related: ["confirmation-rate", "percentage-of-users-attended-a-contest", "queries-quality-and-percentage"],
    order: "any",
    xp: 10,
  },
  {
    slug: "users-that-actively-request-confirmation-messages",
    statement:
      "Signups records when each user registered (user_id, time); Confirmations records each confirmation message they received (confirm_id, user_id, time). A user's confirmation lag is the number of HOURS between their signup and each confirmation. Report user_id for every user whose AVERAGE lag is strictly less than 24 hours. Output one column, user_id, ordered ascending.",
    examples: [
      {
        input: "user 7 signed up 2024-05-01 09:00 · confirmations at 11:00 (+2h) and 14:00 (+5h)",
        output: "7",
        explanation:
          "Average lag (2 + 5) / 2 = 3.5 hours — comfortably under the 24-hour bar.",
      },
      {
        input: "user 8 signed up 2024-05-01 08:00 · one confirmation at 2024-05-02 08:00",
        output: "(no row)",
        explanation:
          "The lag is exactly 24.0 hours and the comparison is strict — a boundary value must fail.",
      },
    ],
    constraints: [
      "lag = Confirmations.time minus Signups.time, converted to hours, averaged per user",
      "a user qualifies when their average lag is strictly below 24 hours — 24.0 itself fails",
      "one column user_id, one row per qualifying user, ordered ascending by user_id",
    ],
    breakdown: [
      "The lag is a derived quantity: for each confirmation row, the hours elapsed since that user's signup. SQLite stores the timestamps as TEXT, but in 'YYYY-MM-DD HH:MM:SS' form, and julianday() reads that format natively — converting a timestamp to a fractional day count. The difference of two julian days is days, so multiplying by 24 converts to hours. That per-row expression is computed for every confirmation, and only then averaged per user.",
      "Averaging per user means grouping per user, and judging the group's average means HAVING — WHERE runs before grouping and cannot see an aggregate at all. HAVING AVG(...) < 24 is the whole filter, and its strictness is the problem's bite: user 8's single confirmation arrives at exactly 24.0 hours, and 24.0 < 24 is false. Specifications that say 'under 24 hours' mean strict inequality; the boundary row exists precisely to catch a >= reading.",
      "The join direction decides who can appear. An inner join keeps only users who HAVE confirmations — user 11, who signed up and was never confirmed, produces no joined row, no group, and no output row; their average lag is undefined, not zero. And because Confirmations rows drive the join, a user with several confirmations contributes several lag measurements to one mean: user 7's 2h and 5h average to 3.5h, a fractional result the *24 conversion makes routine.",
    ],
    edges: [
      "The 24-hour bar is strict: user 8's single confirmation lands at exactly 24.0h and is excluded — read 'less than 24' literally.",
      "User 11 signed up but never confirmed: with no Confirmations rows there is no group to average, so they are absent from the output — not zero.",
      "Mixed lags average out: user 10's 1h and 11h lags average to 6.0h — the mean is taken over all of a user's confirmations, not the best one.",
      "(julianday(b) - julianday(a)) yields DAYS — forgetting the *24 compares day-fractions against 24 and passes everyone; whole-day lags compute exactly (24.0), while sub-day hour diffs carry millisecond-rounding noise around 1e-9, harmless far from a knife edge.",
    ],
    ladder: [
      { title: "Brute force — diff timestamps by hand", body: "Pull both tables and compute each user's lags in a spreadsheet. Fine once; unmaintainable as a recurring report." },
      { title: "The pattern — join, group, HAVING on the mean", body: "JOIN signups to confirmations, GROUP BY user, HAVING AVG(hours-lag) < 24." },
      { title: "The optimal idea — aggregate filters belong to HAVING", body: "O(c) with a hash join. The durable rules: WHERE judges rows while HAVING judges aggregates, strict comparisons make the boundary value itself fail, and users with no measurements drop out of inner-join groups by construction." },
    ],
    approach: "Join, GROUP BY user, HAVING AVG(hours lag) < 24 with a strict comparison",
    schema: {
      ddl: `CREATE TABLE Signups (
  user_id INTEGER PRIMARY KEY,
  time    TEXT NOT NULL  -- 'YYYY-MM-DD HH:MM:SS'
);
CREATE TABLE Confirmations (
  confirm_id INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES Signups(user_id),
  time       TEXT NOT NULL
);`,
      seed: `INSERT INTO Signups (user_id, time) VALUES
  (7, '2024-05-01 09:00:00'),
  (8, '2024-05-01 08:00:00'),
  (9, '2024-05-01 10:00:00'),
  (10, '2024-05-02 06:00:00'),
  (11, '2024-05-03 12:00:00');  -- never confirmed: no group, no row
INSERT INTO Confirmations (confirm_id, user_id, time) VALUES
  (41, 7, '2024-05-01 11:00:00'),   -- lag 2h
  (42, 7, '2024-05-01 14:00:00'),   -- lag 5h -> user 7 avg 3.5h
  (43, 8, '2024-05-02 08:00:00'),   -- lag exactly 24h: strict < excludes user 8
  (44, 9, '2024-05-02 16:00:00'),   -- lag 30h: over the bar
  (45, 10, '2024-05-02 07:00:00'),  -- lag 1h
  -- lag 11h -> user 10 avg 6.0h
  (46, 10, '2024-05-02 17:00:00');`,
      tables: [
        { name: "Signups", note: "5 users — user 11 never receives a confirmation" },
        { name: "Confirmations", note: "6 confirmations — lags 2h/5h (user 7), exactly 24h (user 8), 30h (user 9), 1h/11h (user 10)" },
      ],
    },
    code: `SELECT
    s.user_id
FROM Signups s
JOIN Confirmations c ON c.user_id = s.user_id  -- inner join: no confirmations, no group
GROUP BY s.user_id
HAVING AVG((julianday(c.time) - julianday(s.time)) * 24) < 24  -- strict: exactly 24.0 fails
ORDER BY s.user_id;`,
    walkthrough: [
      "The join pairs each confirmation with its signup row: user 7 gets two (2h, 5h), user 8 one (24h), user 9 one (30h), user 10 two (1h, 11h). User 11 has no confirmation, so there is no joined row and no group to evaluate.",
      "julianday converts each timestamp to a day count; the difference times 24 is hours. Per-user averages: 7 -> 3.5, 8 -> 24.0, 9 -> 30.0, 10 -> 6.0.",
      "HAVING keeps strictly-below-24 groups: 3.5 and 6.0 pass, 24.0 fails the strict comparison, and 30.0 overshoots. Output: 7 then 10, ascending.",
    ],
    time: "O(c + u log u) — scan confirmations, group per user",
    space: "O(u) — one group per user",
    followUps: [
      "Use the median lag instead of the average — how do you build a median in SQLite without a MEDIAN function (a counted ordered subquery or a percent-rank window)?",
      "Classify users into fast (under 1h), normal (1-24h) and slow (over 24h) buckets — one CASE over the same AVG, and decide where user 11, who has no average at all, should land.",
    ],
    related: ["average-time-of-process-per-machine", "the-latest-login-in-2020", "user-activity-for-the-past-30-days-i"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "the-winner-university",
    statement:
      "Two campuses sat the same exam: NewYork and California each hold (student_id, score), and a sync glitch duplicated some score rows. Compute each campus's average score over its DISTINCT students, then report the campus with the strictly greater average as one column, winner ('New York' or 'California'), in a single row. If the two averages are equal, output 'No Winner' instead.",
    examples: [
      {
        input: "New York rows: 60, 70, 80, 86, 86 (student 4 synced twice) · California rows: 80, 72, 90, 68, 68 (student 4 synced twice)",
        output: "California",
        explanation:
          "Student-level averages are 74.0 vs 77.5 — but the raw averages, 76.4 vs 75.6, would crown New York. The dedup decides the winner.",
      },
      {
        input: "both campuses average exactly 74.0 after dedup",
        output: "No Winner",
        explanation:
          "Neither strict comparison fires on equality; the ELSE branch exists so a tie has a verdict instead of an accident.",
      },
    ],
    constraints: [
      "each campus's average is computed over distinct (student_id, score) pairs — duplicated sync rows must not double-weight a student",
      "the winner has the strictly greater average; equal averages output 'No Winner'",
      "one column winner, one row: 'New York', 'California' or 'No Winner'",
    ],
    breakdown: [
      "The sync glitch is the whole problem. New York's rows contain student 4 twice and California's contain student 4 twice, so a raw AVG(score) counts one student's performance with double weight: the raw averages come out 76.4 vs 75.6 and crown New York, while the student-level truth is 74.0 vs 77.5 — California. The fix is to deduplicate to one row per student before averaging: SELECT DISTINCT student_id, score collapses the exact duplicate copies, and AVG runs over the clean set.",
      "Comparing two aggregates that live in different tables is scalar-subquery territory: each subquery returns one number, and the CTE pins both into a single row of named columns. The CASE then reads like the specification — strictly greater, strictly less, otherwise nobody wins. Writing BOTH comparisons explicitly matters: a single WHEN with an ELSE 'California' would silently hand a tie to California, and 'No Winner' would become unreachable.",
      "Notice what DISTINCT operates on: the PAIR (student_id, score), not student_id alone. In this seed each student has exactly one score, so pair-distinct and student-distinct coincide — but the pair form is the honest general shape, because a future retake (same student, second score) would survive a pair-level dedup as a legitimate second measurement. Deduplication always needs a stated grain; here the grain is the student's score row.",
    ],
    edges: [
      "The duplicated rows are the trap: raw averages (76.4 vs 75.6) crown New York, student-distinct averages (74.0 vs 77.5) crown California — the dedup flips the verdict.",
      "SUM(score) / COUNT(DISTINCT student_id) is NOT the fix — the sum still double-counts the duplicated score while the count ignores it; dedup must precede the average.",
      "Both strict comparisons must be written: CASE checks branches in order, and equality lands in ELSE 'No Winner' only because neither > nor < fired.",
      "AVG over an empty dedup set is NULL, and NULL > NULL is not true — the CASE would fall through to 'No Winner', a graceful degradation for an empty campus.",
    ],
    ladder: [
      { title: "Brute force — two averages by hand", body: "Run an AVG per state, eyeball which is bigger, type the winner as a literal. Works once, breaks the moment the data changes or the duplicate rows arrive." },
      { title: "The pattern — scalar subqueries inside CASE", body: "One CTE pins each state's deduplicated average; a CASE with two strict comparisons and an ELSE renders the verdict." },
      { title: "The optimal idea — make the tie branch explicit", body: "O(n log n) per state. The durable idea: when a spec says 'or equal', the equality branch is a first-class output — write it deliberately instead of assuming it never fires." },
    ],
    approach: "WITH pins two deduplicated averages; a CASE with strict comparisons and a 'No Winner' ELSE",
    schema: {
      ddl: `CREATE TABLE NewYork (
  student_id INTEGER NOT NULL,  -- no PK: a sync log may hold a student's row twice
  score      INTEGER NOT NULL
);
CREATE TABLE California (
  student_id INTEGER NOT NULL,
  score      INTEGER NOT NULL
);`,
      seed: `INSERT INTO NewYork (student_id, score) VALUES
  (1, 60), (2, 70), (3, 80),
  -- student 4's row synced twice: the dedup trap
  (4, 86), (4, 86);
INSERT INTO California (student_id, score) VALUES
  (1, 80), (2, 72), (3, 90),
  -- student 4's row synced twice: same trap, other campus
  (4, 68), (4, 68);`,
      tables: [
        { name: "NewYork", note: "5 rows, 4 students — student 4's 86 is duplicated; distinct avg 74.0, raw avg 76.4" },
        { name: "California", note: "5 rows, 4 students — student 4's 68 is duplicated; distinct avg 77.5, raw avg 75.6" },
      ],
    },
    code: `WITH avgs AS (
    SELECT
        (SELECT AVG(score) FROM (
             SELECT DISTINCT student_id, score FROM NewYork      -- dedup: one row per student
         )) AS ny_avg,
        (SELECT AVG(score) FROM (
             SELECT DISTINCT student_id, score FROM California   -- dedup: one row per student
         )) AS ca_avg
)
SELECT CASE
           WHEN ny_avg > ca_avg THEN 'New York'   -- strictly greater takes the win
           WHEN ny_avg < ca_avg THEN 'California'
           ELSE 'No Winner'                       -- equality: nobody wins
       END AS winner
FROM avgs;`,
    walkthrough: [
      "The two scalar subqueries each deduplicate first: New York's five rows collapse to four students (60, 70, 80, 86 -> avg 74.0); California's five to four (80, 72, 90, 68 -> avg 77.5).",
      "The CTE pins both averages into one row so the CASE compares named columns: 74.0 > 77.5 is false, 74.0 < 77.5 is true -> 'California'.",
      "Had the averages been equal, neither strict comparison fires and ELSE returns 'No Winner' — the third branch the seed's clear winner never shows but the query must still carry.",
    ],
    time: "O(n log n) — two dedup + average passes",
    space: "O(n) — the deduplicated score sets",
    followUps: [
      "Return both campuses' averages next to the verdict — how do you project the two scalar aggregates beside the CASE in the same single row?",
      "Extend to three campuses — does the CASE chain stay readable, or does a greatest-of-three shape (ORDER BY avg DESC LIMIT 1) scale better, and what does IT return on a tie?",
    ],
    related: ["triangle-judgement", "apples-and-oranges", "classes-more-than-5-students"],
    order: "any",
    xp: 10,
  },
  {
    slug: "all-valid-triplets-that-can-represent-a-country",
    statement:
      "Three schools each pick one representative: SchoolA, SchoolB and SchoolC each hold (id, student_name). List every triplet of names — one from each school — in which all three names are PAIRWISE DIFFERENT: no two of the three representatives share a name. Output columns student_name_a, student_name_b, student_name_c, ordered by student_name_a, then student_name_b, then student_name_c.",
    examples: [
      {
        input: "SchoolA: Alba, Nia, Ravi · SchoolB: Nia, Ravi, Tomas · SchoolC: Ravi, Zoe",
        output: "10 triplets, e.g. (Alba, Nia, Ravi) · (Nia, Tomas, Zoe)",
        explanation:
          "Nia sits in SchoolA and SchoolB and Ravi in all three, so any seating repeating a name dies; every survivor uses three different names.",
      },
      {
        input: "SchoolA also logs a second 'Alba' row (id 4)",
        output: "still 10 rows — not 15",
        explanation:
          "The within-school repeat is a data artifact: DISTINCT in the CTE collapses it before the cross join, so Alba's five valid triplets print once each.",
      },
    ],
    constraints: [
      "a triplet picks exactly one representative from each school; all three names must be pairwise different",
      "output columns student_name_a, student_name_b, student_name_c",
      "ordered by student_name_a, then student_name_b, then student_name_c",
    ],
    breakdown: [
      "The candidate space is a cross product: every choice of one A-name, one B-name and one C-name. With no join key between schools, CROSS JOIN is the honest operator — it says 'every combination' outright, with no ON clause pretending a relationship exists. Three small schools multiply fast — here 3 x 3 x 2 = 18 candidates from 9 source rows — so the validity rule has to be stated exactly.",
      "The rule is PAIRWISE difference, and pairwise means all three pairs: a <> b, a <> c and b <> c, ANDed. Two conjuncts would leave a triplet in which B and C share a name — invisible if you only ever test against A. And note who is ALLOWED to repeat: each school contributes exactly one member per triplet, so 'Alba' appearing twice inside SchoolA violates nothing — it is a data artifact that risks duplicate output rows, which the DISTINCT inside each CTE absorbs before the cross join ever runs.",
      "That splits the seed's two duplicate flavors into two different treatments, and the split is the transferable lesson. Within-school repetition is data quality: collapse it with DISTINCT so the same seating chart does not print twice — without it, SchoolA's doubled Alba row would push the output from 10 rows to 15. Cross-school repetition is the business rule itself: Nia in both A and B, Ravi in all three — genuinely different people who must be filtered by <> at join time. Deduplicate what is the same fact; filter what merely shares a value.",
    ],
    edges: [
      "SchoolA logs Alba twice (ids 1 and 4): the DISTINCT-in-CTE collapses them — without it the Alba triplets would print twice (15 rows, not 10).",
      "Nia sits in both SchoolA and SchoolB and Ravi in all three schools: the three <> clauses kill every seating that repeats a name — 18 raw pairings shrink to 10.",
      "Each school contributes exactly ONE member per triplet, so a within-school name repeat never violates the rule — it only risks duplicate output rows.",
      "CROSS JOIN with no ON is deliberate: the candidate set is every combination, and validity is a WHERE concern, not a join-key concern.",
    ],
    ladder: [
      { title: "Brute force — three nested loops", body: "Iterate A, B and C in application code, testing name equality per triplet. The database already has the machinery: one cross join plus a WHERE." },
      { title: "The pattern — CROSS JOIN plus pairwise <>", body: "A three-way cross join for the candidate space, three <> conjuncts for the rule, one three-key ORDER BY for determinism." },
      { title: "The optimal idea — dedupe inputs, filter outputs", body: "O(|A| x |B| x |C|) candidates — irreducible when every combination is requested. The lesson: duplicate WITHIN a source is a data-quality bug (DISTINCT it away); equality ACROSS sources is a business rule (filter it)." },
    ],
    approach: "DISTINCT-name CTEs, three-way CROSS JOIN, three pairwise <> filters, three-key ORDER BY",
    schema: {
      ddl: `CREATE TABLE SchoolA (
  id           INTEGER PRIMARY KEY,
  student_name TEXT NOT NULL
);
CREATE TABLE SchoolB (
  id           INTEGER PRIMARY KEY,
  student_name TEXT NOT NULL
);
CREATE TABLE SchoolC (
  id           INTEGER PRIMARY KEY,
  student_name TEXT NOT NULL
);`,
      seed: `INSERT INTO SchoolA (id, student_name) VALUES
  (1, 'Alba'),
  (2, 'Nia'),
  (3, 'Ravi'),
  -- a second row for Alba: within-school duplication (a data artifact)
  (4, 'Alba');
INSERT INTO SchoolB (id, student_name) VALUES
  (1, 'Nia'),    -- repeats SchoolA: cross-school duplicate
  (2, 'Ravi'),   -- repeats SchoolA too
  (3, 'Tomas');
INSERT INTO SchoolC (id, student_name) VALUES
  (1, 'Ravi'),   -- repeats BOTH other schools
  (2, 'Zoe');`,
      tables: [
        { name: "SchoolA", note: "4 rows, 3 distinct names — 'Alba' logged twice (ids 1 and 4)" },
        { name: "SchoolB", note: "3 rows — 'Nia' and 'Ravi' repeat SchoolA's names" },
        { name: "SchoolC", note: "2 rows — 'Ravi' repeats both other schools" },
      ],
    },
    code: `WITH a_names AS (SELECT DISTINCT student_name FROM SchoolA),  -- within-school dupes collapse
     b_names AS (SELECT DISTINCT student_name FROM SchoolB),
     c_names AS (SELECT DISTINCT student_name FROM SchoolC)
SELECT
    a.student_name AS student_name_a,
    b.student_name AS student_name_b,
    c.student_name AS student_name_c
FROM a_names a
CROSS JOIN b_names b                     -- every A/B pairing...
CROSS JOIN c_names c                     -- ...times every C name
WHERE a.student_name <> b.student_name   -- pairwise-different rule:
  AND a.student_name <> c.student_name   -- all three pairs must differ
  AND b.student_name <> c.student_name
ORDER BY student_name_a, student_name_b, student_name_c;`,
    walkthrough: [
      "The three CTEs reduce each school to its DISTINCT names: SchoolA's duplicated Alba row collapses, leaving 3 x 3 x 2 = 18 candidate triplets from 9 source rows.",
      "The two CROSS JOINs build all 18 combinations; the WHERE then strikes every triplet repeating a name — Nia twice or Ravi twice or thrice — and 8 combinations die.",
      "Ten triplets survive, ORDER BY sorts them by all three name columns, and the output reads as a clean seating chart.",
    ],
    time: "O(|A| x |B| x |C|) — the cross product, then filtered",
    space: "O(|A| x |B| x |C|) — the candidate triplets before filtering",
    followUps: [
      "Count the REJECTED triplets per clause — how many of the 18 raw pairings does each <> conjunct kill alone, and which pair is responsible for the biggest share?",
      "Add a fourth school — how do the cross join and the pairwise filter grow, and at what point does a NOT EXISTS formulation read better than six <> conjuncts?",
    ],
    related: ["triangle-judgement", "customers-who-bought-a-and-b-not-c", "sales-analysis-i"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "products-worth-over-invoices",
    statement:
      "Item lists products (product_id, name); InvoiceLines records each invoiced line (invoice_id, product_id, rest, paid, canceled, refunded). A product's worth is the sum of rest + paid - canceled - refunded across all of its lines — money still owed plus money collected, minus canceled and refunded amounts. Report every product's name and worth as columns name, worth, ordered by worth descending, then name ascending.",
    examples: [
      {
        input: "Trail Pack lines: 120 rest + 80 paid · 60 + 40 with 100 canceled",
        output: "Trail Pack · 200",
        explanation:
          "The second line nets to exactly 0 — cancellation erases its own value; the product's worth stays the first line's 200.",
      },
      {
        input: "Water Filter line: 30 rest, 20 paid, 150 canceled, 40 refunded",
        output: "Water Filter · -140",
        explanation:
          "Canceled plus refunded (190) outweigh the collected 50 — the report shows the net loss and sorts it last.",
      },
    ],
    constraints: [
      "worth per product = SUM(rest + paid - canceled - refunded) over its invoice lines",
      "report every seeded product; a product's worth can be negative or zero",
      "columns name, worth — ordered by worth descending, then name ascending",
    ],
    breakdown: [
      "Four money columns per line, two adding and two subtracting: worth is a NET figure, and netting is per-row algebra before it is an aggregation. The expression rest + paid - canceled - refunded evaluates line by line — Trail Pack's second line nets to exactly 0 because a full cancel erases its own value — and only then does SUM add the per-line results per product. Getting the algebra right per row first is what makes the aggregate meaningful; a sum is only as good as the expression it sums.",
      "GROUP BY i.product_id, i.name groups by identity and carries the display name along. Grouping by name alone would work on this seed — the names are unique — but it is a landmine: two products may share a name, and a name-only grouping would merge two real products into one worth. Grouping by the id (with the name in the GROUP BY so it may appear in the SELECT) is the invariant-preserving habit: report by name, group by identity.",
      "The output's ORDER BY does double duty. worth DESC puts the biggest earners first — and by the same token the biggest LOSER last, because descending order does not stop at zero: Water Filter's -140 sorts below a hypothetical 0, exactly where a ledger should show it. The name ASC tiebreaker exists for the 140 tie between Camp Stove and Sleeping Bag; without it, two equal worths would ship in engine-dependent order and the report would differ run to run.",
    ],
    edges: [
      "Water Filter nets to -140: canceled + refunded (190) exceed rest + paid (50) — the report shows the loss instead of hiding it.",
      "Trail Pack's second line nets to exactly 0 (60 + 40 - 100): a fully canceled line contributes nothing but still counts as a line.",
      "Camp Stove and Sleeping Bag tie at 140 — ORDER BY worth DESC, name ASC resolves the tie alphabetically, keeping the output deterministic.",
      "GROUP BY i.product_id, i.name, not name alone: two products sharing a name would merge into one row under a name-only grouping.",
    ],
    ladder: [
      { title: "Brute force — a calculator per product", body: "Pull all lines and net them in a spreadsheet, one column per product. The engine nets them in one GROUP BY." },
      { title: "The pattern — SUM of a per-row expression", body: "JOIN lines to items, GROUP BY product, SUM(rest + paid - canceled - refunded)." },
      { title: "The optimal idea — net per row, then aggregate", body: "O(l), one scan. Netting per ROW before SUMming keeps the algebra honest — summing each column separately and combining afterwards would work here but invites NULL-poisoning the moment any money column can be NULL." },
    ],
    approach: "GROUP BY product with SUM(rest + paid - canceled - refunded), ordered by worth DESC then name",
    schema: {
      ddl: `CREATE TABLE Item (
  product_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL
);
CREATE TABLE InvoiceLines (
  invoice_id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES Item(product_id),
  rest       INTEGER NOT NULL,
  paid       INTEGER NOT NULL,
  canceled   INTEGER NOT NULL,
  refunded   INTEGER NOT NULL
);`,
      seed: `INSERT INTO Item (product_id, name) VALUES
  (1, 'Trail Pack'), (2, 'Camp Stove'), (3, 'Water Filter'), (4, 'Sleeping Bag');
INSERT INTO InvoiceLines (invoice_id, product_id, rest, paid, canceled, refunded) VALUES
  (501, 1, 120, 80, 0, 0),    -- nets +200
  (502, 1, 60, 40, 100, 0),   -- nets exactly 0: fully canceled
  (503, 2, 90, 30, 0, 0),     -- nets +120
  (504, 2, 40, 10, 0, 30),    -- nets +20 -> Camp Stove 140
  (505, 3, 30, 20, 150, 40),  -- nets -140: canceled + refunded outweigh
  -- nets +140: ties Camp Stove
  (506, 4, 75, 65, 0, 0);`,
      tables: [
        { name: "Item", note: "4 products — all carry invoice lines" },
        { name: "InvoiceLines", note: "6 lines — one nets exactly 0, one drags Water Filter to -140, Camp Stove ties Sleeping Bag at 140" },
      ],
    },
    code: `SELECT
    i.name,
    SUM(l.rest + l.paid - l.canceled - l.refunded) AS worth  -- net the four money columns per line
FROM Item i
JOIN InvoiceLines l ON l.product_id = i.product_id
GROUP BY i.product_id, i.name     -- group by identity; the name rides along
ORDER BY worth DESC, name ASC;    -- biggest earner first, name breaks ties`,
    walkthrough: [
      "The join attaches each of the six invoice lines to its product name; GROUP BY product_id, name builds four groups.",
      "Each line nets rest + paid - canceled - refunded: Trail Pack 200 + 0 = 200, Camp Stove 120 + 20 = 140, Water Filter -140, Sleeping Bag 140.",
      "ORDER BY worth DESC, name ASC: Trail Pack's 200 first, then the 140 tie (Camp Stove before Sleeping Bag), and Water Filter's -140 last.",
    ],
    time: "O(p + l) — one scan of lines joined to items",
    space: "O(p) — one group per product",
    followUps: [
      "Report every product, including any with no invoice lines, as a 0 or NULL worth — swap the JOIN for a LEFT JOIN and decide which version the report should show.",
      "Split worth into gross (rest + paid) and clawback (canceled + refunded) columns — when is the two-column version more diagnostic than a single net number?",
    ],
    related: ["top-travellers", "average-selling-price", "capital-gain-loss"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "find-latest-salaries",
    statement:
      "SalaryHistory stores salary snapshots (sync_id, employee_id, amount, effective_year); a sync glitch wrote some records multiple times under different sync_ids. Deduplicate: keep exactly ONE row per distinct (employee_id, amount, effective_year) triple — the copy with the MAX sync_id. Output columns employee_id, amount, effective_year, ordered by employee_id ascending, then effective_year ascending.",
    examples: [
      {
        input: "employee 102, 65000, 2022 — synced as sync_id 3, then again as sync_id 4",
        output: "one row: 102 · 65000 · 2022",
        explanation:
          "Both copies carry identical values; the dedup keeps exactly one — the MAX(sync_id) copy.",
      },
      {
        input: "employee 103, 91000, 2024 — synced three times (sync_ids 5, 6, 7)",
        output: "one row: 103 · 91000 · 2024",
        explanation:
          "Three copies still collapse to one; nine synced rows become six distinct salary records.",
      },
    ],
    constraints: [
      "a distinct salary record is the full triple (employee_id, amount, effective_year); keep exactly one row per distinct triple",
      "when a triple was synced multiple times, the copy with the largest sync_id wins",
      "columns employee_id, amount, effective_year — ordered by employee_id, then effective_year",
    ],
    breakdown: [
      "A sync log appends; it does not update. When the pipeline re-sent a record it had already delivered, SalaryHistory grew by a row rather than changing one, so the same (employee_id, amount, effective_year) triple now exists under several sync_ids. The deduplication target is therefore the TRIPLE — all three business columns together — and the arbiter is sync_id, the only column that knows which copy arrived last. GROUP BY the triple and MAX(sync_id) finds each group's newest delivery.",
      "The grouped query answers 'which copy wins', while the report needs the copy itself — hence the join-back. The CTE holds one keep_id per triple; joining SalaryHistory on sync_id = keep_id retrieves exactly the winning rows, six in all. On THIS seed the join-back changes no values, because the duplicated copies are value-identical — a bare SELECT DISTINCT employee_id, amount, effective_year would print the same six rows. The join-back is not decoration; it is the shape that survives harder data.",
      "Consider the generalization now: suppose the glitch had written a DIFFERENT amount the second time — same employee, same year, conflicting numbers under sync 3 and sync 4. DISTINCT would dutifully keep both phantom histories, but MAX(sync_id) still names one winner, and the join-back still returns exactly one row per employee and year. Latest-write-wins by synthetic key is one of the most reusable dedup shapes in operational SQL: group by the business key, take MAX(version), join back — and fall back to plain DISTINCT only when every duplicate column is guaranteed identical.",
    ],
    edges: [
      "Both duplicated triples carry identical values, so a bare DISTINCT yields the same six rows on this seed — the MAX(sync_id) join-back earns its keep the moment duplicates disagree.",
      "The dedup key is the FULL triple — grouping by (employee_id, effective_year) alone answers a different question (one row per employee-year) and would silently merge two real records if a mid-year raise ever appeared.",
      "MAX(sync_id), not MIN: sync_id grows with each sync, so the maximum is the most recent write — the choice only becomes visible when duplicated rows disagree on values.",
      "The two-key ORDER BY is unique on this seed — no surviving pair shares both employee_id and effective_year — so the output is fully deterministic.",
    ],
    ladder: [
      { title: "Brute force — eyeball the duplicates", body: "Scan for repeated triples and delete stragglers by hand. Fine for nine rows, hopeless for a sync log that grows every hour." },
      { title: "The pattern — GROUP BY the triple, keep MAX(sync_id)", body: "One grouped pass finds each distinct triple's newest sync; a join-back retrieves exactly those rows." },
      { title: "The optimal idea — latest-write-wins as a reusable shape", body: "O(n log n). DISTINCT deduplicates identical copies, but GROUP BY + MAX(id) + join-back survives the harder case where duplicates disagree — that is the version worth memorizing." },
    ],
    approach: "GROUP BY the triple with MAX(sync_id), join back to keep the winning copy",
    schema: {
      ddl: `CREATE TABLE SalaryHistory (
  sync_id        INTEGER PRIMARY KEY,
  employee_id    INTEGER NOT NULL,
  amount         INTEGER NOT NULL,
  effective_year INTEGER NOT NULL
);`,
      seed: `INSERT INTO SalaryHistory (sync_id, employee_id, amount, effective_year) VALUES
  (1, 101, 72000, 2022),
  (2, 101, 78000, 2023),
  (3, 102, 65000, 2022),  -- duplicated triple: copy 1 of 2
  (4, 102, 65000, 2022),  -- copy 2 of 2: MAX(sync_id) keeps this one
  (5, 103, 91000, 2024),  -- triple synced three times: copy 1 of 3
  (6, 103, 91000, 2024),  -- copy 2 of 3
  (7, 103, 91000, 2024),  -- copy 3 of 3: MAX(sync_id) keeps this one
  (8, 102, 71000, 2023),
  (9, 104, 88000, 2023);`,
      tables: [
        { name: "SalaryHistory", note: "9 syncs, 6 distinct triples — (102, 65000, 2022) twice and (103, 91000, 2024) three times" },
      ],
    },
    code: `WITH latest AS (
    SELECT
        employee_id,
        amount,
        effective_year,
        MAX(sync_id) AS keep_id          -- the newest sync wins per triple
    FROM SalaryHistory
    GROUP BY employee_id, amount, effective_year
)
SELECT
    h.employee_id,
    h.amount,
    h.effective_year
FROM SalaryHistory h
JOIN latest l ON l.keep_id = h.sync_id   -- join back to the surviving copy
ORDER BY h.employee_id, h.effective_year;`,
    walkthrough: [
      "GROUP BY the full triple builds six groups; the two glitched triples hold two and three rows respectively, everything else one.",
      "MAX(sync_id) marks the surviving copy per group: sync 4 for employee 102's 2022 row, sync 7 for employee 103's 2024 row.",
      "The join-back keeps exactly those rows — six in total — ordered by employee then year: 101's two history rows, 102's two, 103's one, 104's one.",
    ],
    time: "O(n log n) — one grouped pass plus a join-back",
    space: "O(t) — one row per distinct triple",
    followUps: [
      "Rewrite the dedup with ROW_NUMBER() OVER (PARTITION BY employee_id, amount, effective_year ORDER BY sync_id DESC) — compare readability and plan against the MAX join-back.",
      "Suppose the glitch wrote a DIFFERENT amount under a second sync_id for the same (employee_id, effective_year) — why does plain DISTINCT now keep a phantom row, and why does MAX(sync_id) still pick exactly one?",
    ],
    related: ["duplicate-emails", "delete-duplicate-emails", "the-latest-login-in-2020"],
    order: "exact",
    xp: 10,
  },
];
