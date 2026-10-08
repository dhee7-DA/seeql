// Deep-dives — SeeQL premium batch III, file 1 of 6: stats-flavored reads —
// an admissions cutoff, experiment buckets, quiet accounts, feedback ratios,
// interview gates and store tiers (6 problems: 1 Easy, 5 Medium).
// Engine-verified by scripts/tmp-67b1-check.ts. Re-authored from the canonical
// premium tasks: own tables, own seeds, original phrasing — never copied text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM3_STATS: LcSqlDive[] = [
  {
    slug: "find-cutoff-score-for-each-school",
    statement:
      "Two tables hold an admissions round. School lists the schools: (school_id, name, capacity) — capacity is how many seats the school has. Applicant lists the pool: (student_id, name, score). Each school fills its seats from the highest score downward, whole tied blocks at a time: every applicant sharing a score is admitted together or not at all. A school's cutoff score is the score of the LAST student it seats — the lowest score s such that the number of applicants scoring s or higher still fits within capacity. A school whose capacity covers the whole pool seats everyone, and its cutoff is therefore the pool's lowest score. Report school_id, name, cutoff_score — one row per school, ordered by school_id ascending.",
    examples: [
      {
        input:
          "Northgate (capacity 2) reads the pool top-down: Ivy 95 first, then the tied pair Jonas 88 and Kira 88 — seating that pair after Ivy would need three seats",
        output: "10 · Northgate · 95",
        explanation:
          "The 88-block does not fit after Ivy's block, so the last student seated is Ivy; a cutoff set at 88 would admit 3 applicants against 2 seats.",
      },
      {
        input: "Southgate (capacity 9) faces the same seven applicants — capacity covers the entire pool",
        output: "20 · Southgate · 64",
        explanation:
          "Every block fits, so the last student seated is the pool's lowest scorer, Omar at 64.",
      },
    ],
    constraints: [
      "the cutoff is the lowest distinct score s whose load — COUNT(applicants with score >= s) — fits within capacity; a tied block is admitted whole or not at all",
      "every school has capacity >= 1 and the pool is non-empty, so the top score always fits and every school reports a cutoff",
      "columns school_id, name, cutoff_score — one row per school, ordered by school_id ascending",
    ],
    breakdown: [
      "The cutoff is a reverse-cumulative quantile of the score distribution measured against capacity. For any candidate score s, the question 'would a cutoff at s overbook?' is answered by COUNT of applicants scoring >= s — a number that only shrinks as s rises. The cutoff is the LOWEST s whose count still fits, which is why this is a counting-at-or-above problem and not a pick-the-k-th-element problem. Ties are what break the k-th reading: a block of equal scores moves in and out of range together, because a cutoff pinned inside a tied block is incoherent — it would admit the block and not admit the block.",
      "The query builds the candidate list once: every DISTINCT score, painted with its at-or-above load via a correlated count. Joining each school to the loads that fit its capacity leaves, per school, exactly the scores that could serve as its cutoff — and MIN over them picks the lowest. Two structural facts make this safe. The qualifying set is upward-closed (everything above the threshold also fits), so MIN and only MIN returns the honest threshold. And since the top score's load is 1, every school with capacity >= 1 qualifies for at least one score, so no school drops out and no NULL handling is needed.",
      "The natural shortcut — 'seat the top k applicants and report the k-th score' — fails exactly when a tie straddles the seat boundary. On this seed Northgate has 2 seats: the top-2 reading reports 88, but a cutoff at 88 admits Ivy plus BOTH 88s — three students into two seats — so the block rule pushes the cutoff up to 95. The opposite direction fails too: because the qualifying set is upward-closed, taking MAX of the qualifying scores returns the pool's top score, which for Southgate prints 95 where the true cutoff is 64. Direction and tie policy are the whole problem.",
    ],
    edges: [
      "The 88-pair (Jonas and Kira) punishes the top-k shortcut: Northgate's 2 seats make COUNT(score >= 88) = 3, so the cutoff jumps above the tie to 95 — a query reporting the 2nd-highest score prints 88 and overbooks the school by one.",
      "Southgate (capacity 9) punishes the MAX direction: all five distinct scores qualify, so MAX over them returns 95 while the cutoff — the LOWEST qualifying score — is 64, the pool minimum.",
      "Flip Northgate's capacity to 3 and the 88-pair flips admissible in one move: after Ivy's block one seat remains and the 88-block needs exactly 2, so the cutoff drops from 95 to 88 — the load test is per-school, never a global score list.",
      "Joining School to Applicant without the load test pairs every school with every applicant (14 rows), and per-school score shortcuts ignore capacity entirely: MIN(score) = 64 and MAX(score) = 95 for BOTH schools — capacity enters only as a comparison against a COUNT.",
    ],
    ladder: [
      { title: "Brute force — walk blocks by hand", body: "Sort scores descending, sweep tied block by tied block with a running seat count, and stop before the block that would overflow; the last block's score is the cutoff. Correct, but it is a manual reverse-cumulative walk the engine expresses with counts." },
      { title: "The pattern — load per distinct score", body: "A CTE computes, for every DISTINCT score, COUNT(applicants with score >= s). Each row is a possible cutoff together with the seats it needs — the rungs of a ladder." },
      { title: "The optimal idea — join rungs to capacities, take the MIN", body: "O(S·D·N) as written (D distinct scores, one count each, S schools joining). The durable rule: cutoff questions are reverse-cumulative COUNT questions — build the (score, load) ladder once, join it to every school's capacity, and each school's answer is its lowest rung that fits." },
    ],
    approach: "CTE pairs each distinct score with its at-or-above load; join to School on load <= capacity; MIN(score) per school is the cutoff",
    schema: {
      ddl: `CREATE TABLE School (
  school_id INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  capacity  INTEGER NOT NULL
);
CREATE TABLE Applicant (
  student_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  score      INTEGER NOT NULL
);`,
      seed: `INSERT INTO School (school_id, name, capacity) VALUES
  (10, 'Northgate', 2),   -- two seats against a pool that ties at 88
  (20, 'Southgate', 9);   -- capacity 9 covers the whole 7-applicant pool
INSERT INTO Applicant (student_id, name, score) VALUES
  (501, 'Ivy',   95),
  (502, 'Jonas', 88),     -- the tied pair:
  (503, 'Kira',  88),     -- jointly admissible or not at all
  (504, 'Liam',  81),
  (505, 'Mona',  76),
  (506, 'Nadia', 76),     -- a second tie further down the ladder
  (507, 'Omar',  64);`,
      tables: [
        { name: "School", note: "2 schools — Northgate seats 2, Southgate seats 9 (more than the whole pool)" },
        { name: "Applicant", note: "7 applicants — scores 95, 88, 88, 81, 76, 76, 64; ties at 88 and 76" },
      ],
    },
    code: `WITH loads AS (
    -- every distinct score with the seats it needs: COUNT(applicants >= score)
    SELECT
        d.score,
        (SELECT COUNT(*)
         FROM Applicant a
         WHERE a.score >= d.score) AS needed
    FROM (SELECT DISTINCT score FROM Applicant) d
)
SELECT
    s.school_id,
    s.name,
    MIN(l.score) AS cutoff_score   -- lowest rung that fits; ties move it in whole blocks
FROM School s
JOIN loads l
  ON l.needed <= s.capacity        -- the rung is a possible cutoff FOR THIS school
GROUP BY s.school_id, s.name
ORDER BY s.school_id;`,
    walkthrough: [
      "loads turns seven applicants into five rungs: 95 needs 1 seat, 88 needs 3, 81 needs 4, 76 needs 6, 64 needs 7 — each rung counts its whole tied block.",
      "Northgate (capacity 2) accepts only the 95 rung — 88 would need 3 seats — so its MIN, and cutoff, is 95. Southgate (capacity 9) accepts every rung, and its lowest is 64, Omar's score.",
      "ORDER BY school_id ships (10, 'Northgate', 95) then (20, 'Southgate', 64); the top-k shortcut would have printed Northgate at 88, and the MAX-direction mistake would have printed Southgate at 95.",
    ],
    time: "O(S·D·N) — D distinct scores each counted over N applicants, joined to S schools",
    space: "O(D) — one rung per distinct score",
    followUps: [
      "Report each school's cutoff beside the NUMBER of students it actually admits under that cutoff — where does that count come from, and what does it say for Southgate?",
      "Give every school its own pool instead of one shared pool (an applied_to column on Applicant) — which line of the load CTE changes, and does the tie policy survive the move?",
    ],
    related: ["the-winner-university", "rank-scores", "last-person-to-fit-in-the-elevator"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "count-the-number-of-experiments",
    statement:
      "ExperimentLog stores one row per experiment run: (experiment_id, started_at, samples), where started_at is TEXT in the form 'YYYY-MM-DD HH24:MI:SS'. Working inside each run's own day, split the day into four 6-hour blocks opening at 00:00, 06:00, 12:00 and 18:00 — a block includes its opening second and runs to the second before the next block opens. For every (day, block) that holds at least one run, report block_start — the block's opening moment as TEXT, like '2024-05-01 06:00:00' — together with experiments, the number of runs in the block, and total_samples, their samples summed. Only blocks with runs appear; order by block_start ascending.",
    examples: [
      {
        input:
          "two runs on 2024-05-01: one at 05:59:59 with 3 samples, one at exactly 06:00:00 with 7 samples",
        output: "2024-05-01 00:00:00 · 1 · 3, then 2024-05-01 06:00:00 · 1 · 7",
        explanation:
          "A one-second difference splits them: 05:59:59 closes the night block, 06:00:00 opens the next one — the opening second belongs to the block it opens.",
      },
      {
        input: "the day's last run, 2024-05-01 23:59:59 with 8 samples",
        output: "2024-05-01 18:00:00 · 1 · 8",
        explanation:
          "Hour 23 divided by 6 is 3, the evening block — the day's final second still counts into the block that opened at 18:00.",
      },
    ],
    constraints: [
      "blocks open at 00:00, 06:00, 12:00 and 18:00 and include their opening second; block_start is TEXT 'YYYY-MM-DD HH24:MI:SS' with a zero-padded opening hour",
      "one row per (day, block) holding at least one run — empty blocks are never fabricated; experiments counts runs, total_samples sums samples",
      "ordered by block_start ascending",
    ],
    breakdown: [
      "Bucketing is arithmetic before it is grouping: hour-of-day divided by 6, in INTEGER division, collapses 24 hours onto 4 buckets — 0-5 map to 0, 6-11 to 1, 12-17 to 2, 18-23 to 3. Multiplying the quotient back by 6 and formatting gives the block's opening hour. Everything the report needs (which day, which block) lives inside the timestamp string, so the bucket key can be rebuilt as TEXT: the date prefix, the zero-padded opening hour, and ':00:00'.",
      "Grouping by that rebuilt string finishes the job: COUNT(*) counts the runs and SUM(samples) totals them, and because the key carries the full date, runs from different days can never merge even at the same hour. The ordering is free — 'YYYY-MM-DD HH24:MI:SS' text sorts in true chronological order, so ORDER BY the key needs no casting. And 'only blocks with rows' is automatic: GROUP BY forms a group per key it meets, never per key that could exist.",
      "The boundaries are where the bugs live. INTEGER division is the whole mechanism: 5/6 = 0 but 6/6 = 1, so 06:00:00 sharp opens the second block while 05:59:59 closes the first — a floating-point division or an off-by-one range test flips that row. printf('%02d', ...) is not cosmetic either: the unpadded '0:00:00' sorts AFTER '06:00:00' ('6' < ':' in ASCII), so naive concatenation prints the night block last within its day. And the day itself must ride in the key: a bucket keyed on the hour alone welds the two days together, and one keyed on raw epoch spans would number six-hour windows in a single chain across midnight.",
    ],
    edges: [
      "Row 3 (2024-05-01 06:00:00, 7 samples) punishes an off-by-one bucket: hour 6 / 6 = 1 puts it in the 06:00 block — a range test that excludes the opening second drops it into 00:00 and turns the morning block into (1, 4).",
      "Row 6 (2024-05-01 23:59:59, 8 samples) is the day's last second: hour 23 / 6 = 3 keeps it in the 18:00 block — rounding the timestamp up to the next hour (or day) fabricates a bogus 2024-05-02 00:00:00 row.",
      "Rows 1, 2 and 7 (00:14 and 05:59:59 on the 1st, 03:10 on the 2nd) share the night hour but not the day: keyed by hour alone they merge into one (3, 17) group — the date prefix keeps them apart as (2, 8) and (1, 9).",
      "printf padding is load-bearing: without it the night block prints '2024-05-01 0:00:00', which sorts AFTER '2024-05-01 06:00:00' — the zero-padded key is what makes ORDER BY block_start read in true order.",
    ],
    ladder: [
      { title: "Brute force — bucket in code", body: "Parse each started_at, compute the day and floor(hour/6), and accumulate counts and sums in a dictionary keyed by (day, block). The engine expresses that dictionary as one GROUP BY over a computed key." },
      { title: "The pattern — rebuild the bucket as text", body: "INTEGER-divide the hour by 6, multiply back, zero-pad with printf, and glue the date prefix on; group by the resulting block_start string and aggregate the count and the sum." },
      { title: "The optimal idea — one computed key, one pass", body: "O(n log n) for the grouped sort (O(n) with a hash aggregate). The durable rule: bucket keys should be computed strings that carry the full date, pad to a fixed width, and sort in true order — then ORDER BY the key and never fight the calendar again." },
    ],
    approach: "derive block_start = date || padded (hour/6)*6 || ':00:00', then GROUP BY block_start with COUNT and SUM",
    schema: {
      ddl: `CREATE TABLE ExperimentLog (
  experiment_id INTEGER PRIMARY KEY,
  started_at    TEXT NOT NULL,  -- 'YYYY-MM-DD HH24:MI:SS'
  samples       INTEGER NOT NULL
);`,
      seed: `INSERT INTO ExperimentLog (experiment_id, started_at, samples) VALUES
  (1,  '2024-05-01 00:14:00', 5),  -- night block, day 1
  (2,  '2024-05-01 05:59:59', 3),  -- night block's last second
  (3,  '2024-05-01 06:00:00', 7),  -- BOUNDARY: opens the 06:00 block
  (4,  '2024-05-01 09:30:00', 4),  -- morning block, day 1
  (5,  '2024-05-01 12:45:00', 6),  -- afternoon block, day 1
  (6,  '2024-05-01 23:59:59', 8),  -- day's last second: still the 18:00 block
  (7,  '2024-05-02 03:10:00', 9),  -- night hour, day 2: different day
  (8,  '2024-05-02 11:05:00', 2),  -- morning block, day 2
  (9,  '2024-05-02 17:59:00', 1),  -- afternoon block, day 2
  (10, '2024-05-02 18:00:00', 5);`,
      tables: [
        { name: "ExperimentLog", note: "10 runs over 2024-05-01 and 2024-05-02 — boundaries at 06:00:00 and 18:00:00 exactly, plus 05:59:59 and 23:59:59" },
      ],
    },
    code: `WITH tagged AS (
    SELECT
        substr(started_at, 1, 10)
            || ' ' || printf('%02d', (CAST(strftime('%H', started_at) AS INTEGER) / 6) * 6)
            || ':00:00'
            AS block_start,    -- day prefix + zero-padded opening hour
        samples
    FROM ExperimentLog
)
SELECT
    block_start,
    COUNT(*) AS experiments,        -- runs landing in this block
    SUM(samples) AS total_samples
FROM tagged
-- a group forms only for keys that occur; padded text sorts chronologically
GROUP BY block_start
ORDER BY block_start;`,
    walkthrough: [
      "tagged stamps ten rows with eight distinct keys: day 1 contributes 00:00 (runs at 00:14 and 05:59:59), 06:00 (the 06:00:00 boundary and 09:30), 12:00 (12:45) and 18:00 (23:59:59); day 2 mirrors it with 03:10, 11:05, 17:59 and an 18:00:00 boundary of its own.",
      "GROUP BY collapses to eight groups: day 1 reads (2, 8), (2, 11), (1, 6), (1, 8) and day 2 reads (1, 9), (1, 2), (1, 1), (1, 5).",
      "ORDER BY block_start ships them day by day, block by block — the 06:00:00 run sits inside the morning block, the 23:59:59 run closes day 1 inside its 18:00 block, and the two days never touch.",
    ],
    time: "O(n log n) — one pass to compute keys, one grouped sort",
    space: "O(b) — one group per occupied (day, block)",
    followUps: [
      "Fill the gaps: report every (day, block) for the days present in the log, with 0 and 0 where nothing ran — what does a calendar side table (or WITH RECURSIVE) contribute that GROUP BY cannot?",
      "Switch to 90-minute windows instead of fixed blocks — where does the arithmetic bend, and why do fixed 6-hour divisions map cleanly onto integer division while 90 minutes needs a full timestamp difference?",
    ],
    related: ["create-a-session-bar-chart", "monthly-transactions-i", "sales-by-day-of-the-week"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "number-of-accounts-that-did-not-stream",
    statement:
      "Three tables hold an access history. Account lists members: (account_id, email). LoginSession records sign-ins: (session_id, account_id, login_date). Stream records playbacks: (stream_id, session_id, stream_date) — every stream rides the session that started it. Call an account 2024-quiet when it signed in at least once during 2024 yet started no stream at all during 2024. A stream from another year is history, not activity; and a stream belongs to an account only through that account's own session. Report a single row with a single column accounts_count: how many accounts are 2024-quiet.",
    examples: [
      {
        input:
          "account 3 signs in on 2023-11-20 and streams on that same session; she signs in again on 2024-01-15 and touches nothing",
        output: "the account counts toward accounts_count",
        explanation:
          "Her only stream is dated 2023 — outside the window. The flag asks about streams DATED in 2024, and her 2024 session started none.",
      },
      {
        input: "account 1 signs in on 2024-02-10 and starts two streams on that session",
        output: "the account does not count",
        explanation:
          "One 2024 stream — even on a single session — clears the quiet flag for good.",
      },
    ],
    constraints: [
      "'during 2024' means a date inside '2024-01-01'..'2024-12-31' (TEXT 'YYYY-MM-DD'); the login test reads login_date, the stream test reads stream_date",
      "streams attach to an account only through that account's own sessions — another account's session says nothing about it",
      "one row, one column accounts_count",
    ],
    breakdown: [
      "The report is a pair of existence tests at the account grain: a positive one over LoginSession (some 2024 login exists) and a negative one over the session-to-stream path (no 2024 stream exists). Neither test joins rows INTO the output — the first is satisfied by any qualifying row, the second by an absence — so both belong inside EXISTS / NOT EXISTS subqueries correlated back to the candidate account. The outer query then stays a plain COUNT(*) over Account with no join fan-out to reason about.",
      "Year placement is the entire correctness question. The negative test must ask: does this account own any stream DATED in 2024, reached through its own sessions? Drop the year on the stream side and account 3 — whose only stream is dated 2023-12-01 — is wrongly banished. Drop the account correlation and the test degenerates to 'did ANYONE stream in 2024', where account 1's plays erase every account at once. The LEFT JOIN with an IS NULL guard is an honest equivalent, provided the join path pins BOTH the account's sessions and the stream year — otherwise its NULL row lies about absence.",
      "The positive test is its own guard, not a formality. Account 4's only sign-in is dated 2023-08-02, and it never streamed at all — a solver who checks only quietness and forgets the login window would count it, because 'no streams' is trivially true for an account that never came back. Requiring a 2024 login first is what makes the negative test meaningful: the report counts accounts that showed up in 2024 and produced nothing, not accounts that simply went away. Both predicates must be evaluated independently against the account's own rows; neither can borrow the other's conclusion.",
    ],
    edges: [
      "Account 3's stream 203 (dated 2023-12-01 on session 103) punishes the year-less variant: a NOT EXISTS that never checks stream_date sees her 2023 play and drops her — the count prints 3 instead of 4.",
      "Account 1's session 101 carries two 2024 streams (201, 202) and poisons the uncorrelated variant: NOT EXISTS (SELECT 1 FROM Stream WHERE it is 2024) never mentions the account, so her plays banish all six accounts and the count prints 0.",
      "Account 4 (single login 2023-08-02, zero streams ever) punishes dropping the login window: without a 2024 login she cannot qualify, and a stream-only test counts her wrongly — the count prints 5.",
      "Accounts 5 and 6 are counted and have NO stream rows at all: an INNER JOIN from Account through sessions to Stream keeps only the streaming accounts (1 and 3), so Ben, Eli and Fay vanish before the quiet test can count them — the tally prints 1 instead of 4.",
    ],
    ladder: [
      { title: "Brute force — two dictionaries", body: "Walk LoginSession once collecting every account with a 2024 login; walk the session-to-stream path once collecting every account with a 2024 stream; subtract and count. The engine does both walks as correlated EXISTS tests." },
      { title: "The pattern — EXISTS and NOT EXISTS in one WHERE", body: "A positive test over the account's logins pinned to 2024, AND a negative test over the account's own session-to-stream path pinned to stream_date 2024." },
      { title: "The optimal idea — anti-join discipline", body: "O(a + s + t). The durable rules: a negative condition is proven by absence (NOT EXISTS or LEFT JOIN IS NULL), every subquery correlates back to the candidate row, and BOTH windows — the login's and the stream's — are pinned explicitly." },
    ],
    approach: "WHERE EXISTS (2024 login on own sessions) AND NOT EXISTS (2024-dated stream on own sessions); COUNT the survivors",
    schema: {
      ddl: `CREATE TABLE Account (
  account_id INTEGER PRIMARY KEY,
  email      TEXT NOT NULL
);
CREATE TABLE LoginSession (
  session_id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES Account(account_id),
  login_date TEXT NOT NULL          -- 'YYYY-MM-DD'
);
CREATE TABLE Stream (
  stream_id   INTEGER PRIMARY KEY,
  session_id  INTEGER NOT NULL REFERENCES LoginSession(session_id),
  stream_date TEXT NOT NULL         -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO Account (account_id, email) VALUES
  (1, 'ava@seeql.dev'),
  (2, 'ben@seeql.dev'),
  (3, 'cyd@seeql.dev'),
  (4, 'dee@seeql.dev'),
  (5, 'eli@seeql.dev'),
  (6, 'fay@seeql.dev');
INSERT INTO LoginSession (session_id, account_id, login_date) VALUES
  (101, 1, '2024-02-10'),  -- Ava: 2024 login
  (102, 2, '2024-03-05'),  -- Ben: 2024 login, never streams
  (103, 3, '2023-11-20'),  -- Cyd: 2023 login (streams here)
  (104, 3, '2024-01-15'),  -- Cyd again: 2024 login, no new streams
  (105, 4, '2023-08-02'),  -- Dee: 2023 only — never qualifies
  (106, 5, '2024-06-30'),  -- Eli: 2024 login, no streams
  (107, 6, '2024-07-04');  -- Fay: 2024 login, no streams
INSERT INTO Stream (stream_id, session_id, stream_date) VALUES
  (201, 101, '2024-02-10'),  -- Ava's first 2024 play
  (202, 101, '2024-02-11'),  -- Ava's second: one is enough
  -- 203 rides Cyd's 2023 session: dated 2023, history not activity
  (203, 103, '2023-12-01');`,
      tables: [
        { name: "Account", note: "6 accounts — the quiet tally lives among those with a 2024 login" },
        { name: "LoginSession", note: "7 sign-ins — account 3 holds two (2023 and 2024); account 4 never signs in during 2024" },
        { name: "Stream", note: "3 streams — two 2024 plays on Ava's session, one 2023 play on Cyd's" },
      ],
    },
    code: `SELECT COUNT(*) AS accounts_count   -- the whole report: one number
FROM Account a
WHERE EXISTS (                      -- showed up during 2024, at least once
    SELECT 1
    FROM LoginSession s
    WHERE s.account_id = a.account_id
      AND substr(s.login_date, 1, 4) = '2024'
)
AND NOT EXISTS (                    -- ...and started nothing during 2024
    SELECT 1
    FROM LoginSession s
    JOIN Stream st ON st.session_id = s.session_id
    WHERE s.account_id = a.account_id        -- this account's OWN sessions only
      AND substr(st.stream_date, 1, 4) = '2024'
)
ORDER BY accounts_count;`,
    walkthrough: [
      "The positive test keeps accounts 1, 2, 3 (via session 104), 5 and 6 — account 4's only login is 2023-08-02, so she is out before any stream is considered.",
      "The negative test runs over the survivors' own sessions: account 1's session 101 streams twice in 2024 (201, 202) and drops out; account 3's only stream (203) is dated 2023 on her 2023 session — outside the window — so she stays; accounts 2, 5 and 6 have no stream rows at all.",
      "COUNT(*) over the survivors — accounts 2, 3, 5 and 6 — ships one row: 4. The year-less variant would have printed 3, the uncorrelated one 0, the no-login-window one 5.",
    ],
    time: "O(a + s + t) — one keyed pass per table",
    space: "O(a) — the candidate set of accounts",
    followUps: [
      "List the quiet accounts' emails instead of counting them, oldest 2024 login first — what replaces COUNT(*), and what makes the ranking deterministic when two accounts logged in on the same day?",
      "Rewrite the negative test as a LEFT JOIN from Account through 2024 sessions to 2024 streams with an IS NULL guard — where must the two year filters sit (JOIN ON vs WHERE), and what happens to account 3 if the stream year lands in the WHERE?",
    ],
    related: ["customers-who-never-order", "ad-free-sessions", "sellers-with-no-sales"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "low-quality-problems",
    statement:
      "Feedback holds one row per community post: (post_id, title, likes, dislikes) — the tallies of positive and negative reactions. A post's approval rate is 100 × likes / (likes + dislikes), computed from its own tallies. A post is low-quality when its approval rate is STRICTLY below 50%. Report post_id of every low-quality post — one column, ordered by post_id ascending.",
    examples: [
      {
        input: "post 101 gathered 0 likes and 6 dislikes",
        output: "101",
        explanation:
          "0 × 100 / 6 = 0 — as low as approval gets; no special-casing is needed, the formula already places it below 50.",
      },
      {
        input: "post 102 sits at 4 likes and 4 dislikes",
        output: "(no row)",
        explanation:
          "4 / 8 is exactly 50% — 'strictly below' leaves no room; a <= comparison would wrongly report it.",
      },
    ],
    constraints: [
      "approval rate = 100 × likes / (likes + dislikes) computed per post from its own tallies — never against totals over the whole table",
      "the comparison is strict: a post at exactly 50% is NOT low-quality",
      "one column post_id, ordered by post_id ascending",
    ],
    breakdown: [
      "The arithmetic is the trap, not the filter. In SQLite, likes and dislikes are INTEGERs, and INTEGER divided by INTEGER truncates: likes / (likes + dislikes) evaluates to 0 for every post whose dislikes outweigh its likes and to 1 otherwise, so multiplying by 100 afterwards reports 0 or 100 and nothing between. Writing 100.0 (or CASTing one operand) forces the division into floating point first, and the rate becomes a real number the strict comparison can trust.",
      "The denominator is the post's own engagement: likes + dislikes for THAT row. A denominator borrowed from the table at large — COUNT(*) over Feedback, or the summed tallies of all five posts — shrinks every rate toward zero and invents low-quality posts out of thin air. The aggregation belongs to the row, not the table.",
      "Strictness is a one-character contract. Post 102's 4-and-4 split lands on exactly 50, and the problem's word 'below' excludes it: < 50 keeps it out while <= 50 (or the equivalent NOT (rate > 50)) pulls it in. It is worth knowing the algebra too — the rate falls below 50 exactly when likes < dislikes — so a comparison on the raw tallies is a division-free equivalent that also sidesteps the integer-division trap entirely.",
    ],
    edges: [
      "Post 105 (7 likes, 2 dislikes) punishes division-first arithmetic: 7 / 9 truncates to 0, times 100 is 0, and the post is 'reported' at a true 77.8% — multiplying by 100.0 first (or testing likes < dislikes) saves it.",
      "Post 102 (4 and 4) punishes the non-strict comparison: <= 50 reports the exactly-50 post; < 50 does not.",
      "Post 101 (0 likes) is the zero-numerator case: its rate is 0 under any correct formula, but any flipped ratio that divides BY likes (dislikes-to-likes readings) hits division by zero here.",
      "Posts 104 and 105 (9-3 and 7-2) are healthy: a table-wide denominator — 100 × 9 / 45 = 20 for post 104 — brands them low-quality; the denominator is the row's own likes + dislikes (12 and 9).",
    ],
    ladder: [
      { title: "Brute force — eyeball each row", body: "Compute the rate by hand for the five posts and list the ids under 50. A spreadsheet scales worse than the engine's one filtered pass." },
      { title: "The pattern — a filtered ratio", body: "One SELECT with WHERE likes * 100.0 / (likes + dislikes) < 50 — the 100.0 factor promotes the arithmetic to floating point before the division happens." },
      { title: "The optimal idea — respect operand types", body: "O(n). The durable rule: in SQLite the division's operand TYPES decide the semantics — either promote with 100.0 / CAST, or restate the comparison algebraically (likes < dislikes) and never divide at all." },
    ],
    approach: "WHERE likes * 100.0 / (likes + dislikes) < 50 — promote to float before dividing, compare strictly",
    schema: {
      ddl: `CREATE TABLE Feedback (
  post_id  INTEGER PRIMARY KEY,
  title    TEXT NOT NULL,
  likes    INTEGER NOT NULL,
  dislikes INTEGER NOT NULL
);`,
      seed: `INSERT INTO Feedback (post_id, title, likes, dislikes) VALUES
  -- rates: 0.0, exactly 50.0, 20.0, 75.0 and 77.8 percent
  (101, 'Why is my index ignored?', 0, 6),
  (102, 'Deadlock autopsies',       4, 4),
  (103, 'EXPLAIN for beginners',    2, 8),
  (104, 'Benchmark gotchas',        9, 3),
  (105, 'Sharding war stories',     7, 2);`,
      tables: [
        { name: "Feedback", note: "5 posts — only 101 (0.0%) and 103 (20.0%) sit strictly below 50%; 102 sits exactly at 50%" },
      ],
    },
    code: `SELECT post_id
FROM Feedback
WHERE likes * 100.0 / (likes + dislikes) < 50   -- 100.0 promotes: integer / would truncate to 0 or 1
ORDER BY post_id;`,
    walkthrough: [
      "The five rates resolve to 0.0, 50.0, 20.0, 75.0 and 77.8 — the 100.0 factor makes each division floating point, so nothing truncates.",
      "The strict < 50 test keeps 101 (0.0) and 103 (20.0); 102's exactly-50 misses the cut, and 104-105 clear it comfortably.",
      "ORDER BY post_id ships (101), (103) — the integer-division version would have added 104 and 105 to the report, and the <= version would have added 102.",
    ],
    time: "O(n) — one filtered scan",
    space: "O(1) beyond the output rows",
    followUps: [
      "Report post_id beside the approval rate rounded to one decimal, worst first — where does ROUND go, and does the ordering survive ties at the same rate?",
      "Restate the filter without any division (likes < dislikes) — for which posts do the two forms agree, and why does a bracket like 'rate at least 80' have no such one-line tally equivalent?",
    ],
    related: ["ads-performance", "queries-quality-and-percentage", "average-selling-price"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "accepted-candidates-from-the-interviews",
    statement:
      "Candidate lists the field: (candidate_id, name). InterviewRound lists every completed interview round: (candidate_id, round_id, score), with score an integer 1-4 and (candidate_id, round_id) unique. A candidate is ACCEPTED when they completed AT LEAST TWO rounds AND scored ABOVE 2 in EVERY round they took. Report candidate_id and name of the accepted candidates, ordered by candidate_id ascending.",
    examples: [
      {
        input: "candidate 1 finishes rounds 1 and 2, scoring 4 then 3",
        output: "1 · Ada",
        explanation:
          "Two rounds completed and both above 2 — the two guards pass together.",
      },
      {
        input: "candidate 4 also finishes two rounds, scoring 2 and 2",
        output: "(no row)",
        explanation:
          "'Above 2' is strict: a full round count of 2s still fails the quality guard.",
      },
    ],
    constraints: [
      "accepted means COUNT(*) >= 2 AND MIN(score) > 2 over the candidate's InterviewRound rows — both tests run on the FULL set of rounds",
      "a candidate with zero rounds can never be accepted; the output holds no row for them",
      "columns candidate_id, name — ordered by candidate_id ascending",
    ],
    breakdown: [
      "Both acceptance guards are statements about a GROUP, so they belong in HAVING, not WHERE. WHERE filters rows before groups exist: it can drop an individual round, but it cannot say 'this candidate took too few rounds' or 'some round was weak' — those claims quantify over the candidate's whole round set, which only exists after GROUP BY. HAVING COUNT(*) >= 2 AND MIN(score) > 2 states both guards in one breath over the intact group.",
      "MIN(score) > 2 is the every-round-strong test in disguise: 'each score above 2' is exactly 'the weakest score above 2'. It is also the cheapest place to blunder — a solver who helpfully filters weak rounds in WHERE (score > 2) never lets the group fail: candidate 2's low round vanishes, his two remaining 4s pass both tests, and he is accepted on a record that included a 1. The weak row must survive to the HAVING for the guard to see it.",
      "Strictness and the counting both have teeth on this seed. Candidate 4's two 2s show why the comparison is > 2 and not >= 2 — two rounds, both 'passing' a >= test, both actually below the bar. Candidate 3's single 4 shows why COUNT >= 2 exists: one flawless round is not two. And candidate 5, with no rows at all, forms no group under an INNER JOIN and disappears — correctly, since an empty round list satisfies neither guard.",
    ],
    edges: [
      "Candidate 2's round with score 1 punishes pre-filtering: WHERE score > 2 before grouping leaves him two 4s — count 2, min 4 — and accepts him wrongly; HAVING must see the 1.",
      "Candidate 4 (2, 2) punishes >= : MIN(score) >= 2 accepts him, MIN(score) > 2 rejects him — 'above 2' is strict.",
      "Candidate 3 (one round, score 4) punishes the missing count guard: MIN(score) > 2 alone accepts her; COUNT(*) >= 2 is what rejects the single-perfect-round candidate.",
      "Candidate 5 has no InterviewRound rows: an INNER JOIN forms no group, so she is absent without special-casing — under a LEFT JOIN her one all-NULL row makes COUNT(*) report 1 (still < 2) while MIN(score) is NULL, whose comparison is never true; every formulation must reject her, ideally for the right reason.",
    ],
    ladder: [
      { title: "Brute force — per candidate", body: "Collect each candidate's scores, count them, scan for the weakest, and apply the two rules in code. The engine does it in one grouped pass." },
      { title: "The pattern — group, then guard", body: "JOIN rounds to candidates, GROUP BY candidate, HAVING COUNT(*) >= 2 AND MIN(score) > 2 — both guards quantified over the untouched group." },
      { title: "The optimal idea — guards live with the group", body: "O(r + c). The durable rule: per-entity acceptance thresholds are HAVING predicates over UNFILTERED groups — never WHERE predicates over pre-filtered rows, which silently rewrite the record they are judging." },
    ],
    approach: "JOIN + GROUP BY candidate, HAVING COUNT(*) >= 2 AND MIN(score) > 2, ordered by candidate_id",
    schema: {
      ddl: `CREATE TABLE Candidate (
  candidate_id INTEGER PRIMARY KEY,
  name         TEXT NOT NULL
);
CREATE TABLE InterviewRound (
  candidate_id INTEGER NOT NULL REFERENCES Candidate(candidate_id),
  round_id     INTEGER NOT NULL,
  score        INTEGER NOT NULL,   -- 1..4
  PRIMARY KEY (candidate_id, round_id)
);`,
      seed: `INSERT INTO Candidate (candidate_id, name) VALUES
  (1, 'Ada'),
  (2, 'Bram'),
  (3, 'Cleo'),
  (4, 'Dmitri'),
  (5, 'Esme');   -- never interviews
INSERT INTO InterviewRound (candidate_id, round_id, score) VALUES
  (1, 1, 4), (1, 2, 3),              -- Ada: two rounds, both above 2
  (2, 1, 4), (2, 2, 4), (2, 3, 1),   -- Bram: the 1 dooms him only if HAVING sees it
  (3, 1, 4),                         -- Cleo: one perfect round -> too few
  (4, 1, 2),                         -- Dmitri: two rounds, neither ABOVE 2
  (4, 2, 2);`,
      tables: [
        { name: "Candidate", note: "5 candidates — Esme (5) never interviews" },
        { name: "InterviewRound", note: "8 rounds, (candidate, round) unique — scores 4,3 / 4,4,1 / 4 / 2,2" },
      ],
    },
    code: `SELECT
    c.candidate_id,
    c.name
FROM Candidate c
JOIN InterviewRound r ON r.candidate_id = c.candidate_id
GROUP BY c.candidate_id, c.name
HAVING COUNT(*) >= 2        -- at least two completed rounds
   AND MIN(r.score) > 2     -- weakest round still strictly above 2
ORDER BY c.candidate_id;`,
    walkthrough: [
      "The join forms four groups from eight round rows — Ada (4, 3), Bram (4, 4, 1), Cleo (4) and Dmitri (2, 2) — while Esme, with no rounds, forms none.",
      "HAVING COUNT(*) >= 2 dismisses Cleo's single-round group and keeps Ada, Bram and Dmitri.",
      "MIN(score) > 2 dismisses Bram (weakest 1) and Dmitri (weakest 2 — not ABOVE 2), leaving one row: (1, 'Ada').",
    ],
    time: "O(r + c) — one scan of rounds grouped per candidate",
    space: "O(c) — one group per candidate",
    followUps: [
      "Report every candidate with round count, weakest score and a verdict column ('accepted'/'rejected') — what shape must the SELECT take, and how does Esme's zero-round row get produced?",
      "Suppose acceptance needs the FIRST two rounds (by round_id) both above 2 — a weak opener dooms, a weak finale forgives — which window or first-two formulation replaces the plain MIN, and which seed candidate flips verdict?",
    ],
    related: ["classes-more-than-5-students", "managers-with-at-least-5-direct-reports", "active-businesses"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "the-category-of-each-member-in-the-store",
    statement:
      "Member lists the store's members: (member_id, name). Purchase lists every purchase: (purchase_id, member_id, spent), and a member's LIFETIME spend is the sum of spent over all their purchases. Tier the members: lifetime spend strictly above 1000 earns 'VIP'; strictly above 500 (and at most 1000) earns 'Preferred'; anything else — including members with no purchases at all — is 'Standard'. Report member_id, name, category for every member, ordered by member_id ascending.",
    examples: [
      {
        input: "member 2's purchases are 400 and 600 — lifetime spend exactly 1000",
        output: "2 · Ben · Preferred",
        explanation:
          "1000 is not STRICTLY above 1000; the VIP bracket opens above it.",
      },
      {
        input: "member 6 has never purchased anything",
        output: "6 · Fay · Standard",
        explanation:
          "The LEFT JOIN keeps her row and COALESCE reads her missing total as 0 — Standard without a special case.",
      },
    ],
    constraints: [
      "lifetime spend = SUM(spent) over the member's purchases, read as 0 when there are none",
      "thresholds are strict: exactly 500 is Standard, exactly 1000 is Preferred; VIP needs MORE than 1000",
      "every member appears exactly once — columns member_id, name, category, ordered by member_id ascending",
    ],
    breakdown: [
      "The category is a function of an aggregate, and the member who owns nothing is the case that shapes the query. A LEFT JOIN starting from Member threads every member through and fills the purchase side with NULLs; SUM over those NULLs is NULL, and COALESCE(SUM(p.spent), 0) states the contract — no purchases means spend 0 — instead of leaving a NULL to luck. An INNER join would simply delete member 6 from the roster, and the report would never error, just shrink.",
      "The CASE ladder must descend, because CASE is first-match-wins. Testing 'greater than 500' before 'greater than 1000' would file member 1's 1200 under the first matching bracket and print Preferred; the VIP test has to come first. Strictness rides the same comparisons — 'greater than', never 'at least': member 2's exactly-1000 total fails the VIP test and lands in Preferred, and member 3's exactly-500 total fails the Preferred test and lands in Standard.",
      "Note what the grouping does beneath the tiers: GROUP BY m.member_id, m.name produces one row per member, with the SUM spanning that member's purchase rows — member 1 contributes two purchase rows (700 and 500) to a single 1200 total. That is why a per-row CASE before aggregation cannot work: the category exists only after the member's lifetime spend is complete. The output keeps the member's identity columns and derives only the third.",
    ],
    edges: [
      "Member 2 (400 + 600 = 1000 exactly) punishes >= : 'at least 1000' brands him VIP; strict > keeps him Preferred.",
      "Member 3 (exactly 500) punishes the same slip at the lower bracket: 'at least 500' prints Preferred; strict > keeps her Standard.",
      "Member 1 (700 + 500) punishes CASE order: 'greater than 500' tested first files her 1200 as Preferred; the VIP test must be the first WHEN.",
      "Member 6 punishes both join and aggregate choices: an INNER JOIN drops her row entirely (five rows shipped), and a bare SUM(p.spent) without COALESCE leaves her spend NULL — harmless for THIS three-bracket CASE (NULL fails both comparisons) but fatal the moment the spend is displayed or a zero-spend flag is added.",
    ],
    ladder: [
      { title: "Brute force — total, then tier", body: "Sum each member's purchases into a dictionary, then walk the members applying if/else tiers. The engine does both steps as one grouped LEFT JOIN with a CASE." },
      { title: "The pattern — LEFT JOIN, COALESCE the total, descend the CASE", body: "Group per member, compute COALESCE(SUM(spent), 0), and let the first matching WHEN assign the tier — VIP test first, then Preferred, else Standard." },
      { title: "The optimal idea — aggregate before classifying", body: "O(m + p). The durable rules: classify AFTER the aggregate exists (a per-row CASE cannot see a lifetime total), keep the zero-purchase member via LEFT JOIN + COALESCE, and write strict comparisons deliberately — boundaries are where >= and > part ways." },
    ],
    approach: "LEFT JOIN + GROUP BY member, COALESCE(SUM(spent), 0), descending CASE: > 1000 VIP, > 500 Preferred, else Standard",
    schema: {
      ddl: `CREATE TABLE Member (
  member_id INTEGER PRIMARY KEY,
  name      TEXT NOT NULL
);
CREATE TABLE Purchase (
  purchase_id INTEGER PRIMARY KEY,
  member_id   INTEGER NOT NULL REFERENCES Member(member_id),
  spent       INTEGER NOT NULL
);`,
      seed: `INSERT INTO Member (member_id, name) VALUES
  (1, 'Ada'),
  (2, 'Ben'),
  (3, 'Cleo'),
  (4, 'Dov'),
  (5, 'Esme'),
  (6, 'Fay');    -- never purchases
INSERT INTO Purchase (purchase_id, member_id, spent) VALUES
  (301, 1, 700),
  (302, 1, 500),  -- Ada: 700 + 500 = 1200 -> VIP
  (303, 2, 400),
  (304, 2, 600),  -- Ben: exactly 1000 -> Preferred under strict >
  (305, 3, 500),  -- Cleo: exactly 500 -> Standard under strict >
  (306, 4, 120),
  (307, 4, 200),  -- Dov: 320 -> Standard
  -- Esme: 940 -> Preferred
  (308, 5, 940);`,
      tables: [
        { name: "Member", note: "6 members — Fay (6) has no purchase rows at all" },
        { name: "Purchase", note: "8 purchases — lifetime totals: Ada 1200, Ben 1000, Cleo 500, Dov 320, Esme 940" },
      ],
    },
    code: `SELECT
    m.member_id,
    m.name,
    CASE
        WHEN COALESCE(SUM(p.spent), 0) > 1000 THEN 'VIP'        -- strictly above 1000
        WHEN COALESCE(SUM(p.spent), 0) > 500  THEN 'Preferred'  -- strictly above 500
        ELSE 'Standard'                                          -- 0..500, including no purchases
    END AS category
FROM Member m
LEFT JOIN Purchase p ON p.member_id = m.member_id
GROUP BY m.member_id, m.name
ORDER BY m.member_id;`,
    walkthrough: [
      "The LEFT JOIN fans five members into purchase rows — Ada (700, 500), Ben (400, 600), Cleo (500), Dov (120, 200), Esme (940) — while Fay's row survives with NULLs on the purchase side.",
      "Grouping sums lifetimes: Ada 1200, Ben 1000, Cleo 500, Dov 320, Esme 940 — and COALESCE reads Fay's NULL as 0.",
      "The CASE descends: Ada 1200 > 1000 → VIP; Ben 1000 stops short of VIP but clears 500 → Preferred; Cleo 500 and Dov 320 stay Standard; Esme 940 → Preferred; Fay 0 → Standard. Six rows ship ordered 1-6.",
    ],
    time: "O(m + p) — one scan each of members and purchases, hashed on member_id",
    space: "O(m) — one group per member",
    followUps: [
      "Print the lifetime spend beside the category — which expression would be written twice, and how does a CTE (or a nested aggregate) keep it stated once?",
      "Drive the thresholds from a table of bracket rows (floor + label) instead of hardcoded CASE branches — what join keys each spend to its bracket, and how do the strict lower bounds survive a BETWEEN formulation?",
    ],
    related: ["top-travellers", "bank-account-summary-ii", "count-salary-categories"],
    order: "exact",
    xp: 20,
  },
];
