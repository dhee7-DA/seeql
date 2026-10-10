// Deep-dives — the SQL 50+ "dates & reporting" extras: daily activity windows,
// spam-report pipelines, monthly transaction rollups and datetime boundary
// filters. Solutions are SQLite dialect, one statement each, and are
// engine-verified by scripts/lc-sql-verify.ts against the per-problem seed.
import type { LcSqlDive } from "../types";

export const SQL_EXTRAS_DATES: LcSqlDive[] = [
  {
    slug: "user-activity-for-the-past-30-days-i",
    statement:
      "A social app's Activity log records each activity a user performed together with the day it started and the day it ended; the table may contain duplicate rows. Considering only activities that STARTED in the 30-day window ending 2019-07-27 inclusive — that is, 2019-06-28 through 2019-07-27 — report each day on which at least one activity started and the number of different users who were active that day.",
    examples: [
      {
        input:
          "Activity: (Alice,Travel,2019-08-10,2019-08-15) · (Alice,Dance,2019-08-01,2019-08-02) · (Alice,Search,2019-07-20,2019-07-20) · (Bob,Travel,2019-08-10,2019-08-15) · (Bob,Dance,2019-08-01,2019-08-02) · (Bob,Search,2019-07-20,2019-07-20) ×3 duplicate rows · (Carol,Browse,2019-07-20,2019-07-21) · (Carol,Browse,2019-06-28,2019-06-29) · (Dave,Paint,2019-07-27,2019-07-28) · (Eve,Sketch,2019-06-25,2019-06-26)",
        output: "2019-06-28 · 1 / 2019-07-20 · 3 / 2019-07-27 · 1",
        explanation:
          "Seven rows start inside the window. 2019-07-20 carries five rows (Alice 1, Bob 3, Carol 1) but only 3 distinct users; 2019-06-28 and 2019-07-27 survive as the window's inclusive edges; the August rows and Eve's 2019-06-25 row sit outside and vanish.",
      },
    ],
    constraints: [
      "startDate <= endDate in every row",
      "the window is the 30 calendar days ending 2019-07-27, both endpoints inclusive",
      "Activity may contain duplicate rows",
      "output columns exactly: day, active_users",
    ],
    breakdown: [
      "The window arithmetic comes first: '30 days ending 2019-07-27 inclusive' means the left edge is 2019-06-28 — 2019-07-27 minus 29 days, not 30, because both endpoints count. BETWEEN '2019-06-28' AND '2019-07-27' expresses that exactly, and it works on plain TEXT columns because ISO 'YYYY-MM-DD' strings sort lexicographically in the same order as chronologically. Drop an endpoint and the boundary rows (Carol's 06-28 Browse, Dave's 07-27 Paint) silently fall out of the answer.",
      "The grain of the output is one row per DAY. GROUP BY startDate builds those buckets, and 'active users' counts PEOPLE, not sessions: Bob's three Search rows on 2019-07-20 are three sessions of one user, so COUNT(DISTINCT username) is the aggregate — COUNT(*) would report 5 active 'users' on a day that has 3. This problem is the canonical COUNT(DISTINCT …) drill for exactly that reason.",
      "Days with zero activity simply don't appear. There is no Activity row for 2019-07-01, so GROUP BY creates no bucket for it — and the spec asks for observed days, not a full calendar. Building a 30-day scaffold (the students-and-examinations cross-join move) would ADD rows the grader doesn't want; absence here is correct, not a gap to fill.",
      "endDate is a decoy. Carol's Browse starts 2019-07-20 and ends 2019-07-21, yet it counts once, on its start day — the spec attributes every activity to startDate only. Multi-day activities never contribute to their end day, and endDate never appears in the WHERE clause either.",
    ],
    edges: [
      "Both window endpoints are inclusive: 2019-06-28 (Carol) and 2019-07-27 (Dave) must survive BETWEEN — my seed's boundary rows prove it.",
      "Same user many times on one day still counts once: Bob's three duplicate Search rows collapse into one active user.",
      "A day with zero activity never appears — 2019-07-01 is absent, not a row of 0s.",
      "endDate never enters the filter or the bucket — attribution is by startDate alone.",
    ],
    ladder: [
      {
        title: "Brute force — tally in application code",
        body: "Read every Activity row, keep the ones whose startDate falls in the window, bucket them by day in a map, and dedupe usernames with a Set per bucket. The manual algorithm IS the query — the exercise is recognizing that WHERE + GROUP BY + COUNT(DISTINCT) express all three steps.",
      },
      {
        title: "The pattern — filter, bucket, count distinctly",
        body: "WHERE picks the window, GROUP BY startDate picks the grain, COUNT(DISTINCT username) counts the people. Three clauses, each doing exactly one job — this shape reappears in every reporting problem of the band.",
      },
      {
        title: "The optimal idea — one filtered pass",
        body: "A single scan with a cheap string-range predicate, hashing day buckets as it goes. O(n) with a d-row output; at this table size nothing further can be optimized — the craft is in the DISTINCT and the inclusive bounds, not the engine plan.",
      },
    ],
    approach: "Date-range WHERE + GROUP BY day + COUNT(DISTINCT username)",
    schema: {
      ddl: `CREATE TABLE Activity (
  username  TEXT NOT NULL,
  activity  TEXT NOT NULL,
  startDate TEXT NOT NULL,
  endDate   TEXT NOT NULL
);`,
      seed: `INSERT INTO Activity (username, activity, startDate, endDate) VALUES
  ('Alice','Travel','2019-08-10','2019-08-15'),
  ('Alice','Dance','2019-08-01','2019-08-02'),
  ('Alice','Search','2019-07-20','2019-07-20'),
  ('Bob','Travel','2019-08-10','2019-08-15'),
  ('Bob','Dance','2019-08-01','2019-08-02'),
  ('Bob','Search','2019-07-20','2019-07-20'),
  ('Bob','Search','2019-07-20','2019-07-20'),   -- duplicate row: still ONE active user
  ('Bob','Search','2019-07-20','2019-07-20'),   -- 5 rows on 07-20, only 3 distinct users
  ('Carol','Browse','2019-07-20','2019-07-21'),
  ('Carol','Browse','2019-06-28','2019-06-29'), -- left window edge — must survive BETWEEN
  ('Dave','Paint','2019-07-27','2019-07-28'),   -- right window edge — must survive BETWEEN
  ('Eve','Sketch','2019-06-25','2019-06-26');   -- one day before the window: excluded`,
      tables: [
        { name: "Activity", note: "12 rows — 7 start inside the window; Bob has 3 duplicate Search rows on 2019-07-20; Eve's row starts one day before the window" },
      ],
    },
    code: `SELECT
    startDate AS day,                          -- attribute each activity to the day it STARTED
    COUNT(DISTINCT username) AS active_users   -- people, not sessions: Bob's 3 rows count once
FROM Activity
WHERE startDate BETWEEN '2019-06-28' AND '2019-07-27'  -- 30 days ending 2019-07-27, both ends in
GROUP BY startDate
ORDER BY day;`,
    walkthrough: [
      "WHERE discards the 5 rows outside the window — both 2019-08-10 Travels, both 2019-08-01 Dances and Eve's 2019-06-25 Sketch — leaving 7 rows.",
      "GROUP BY startDate makes three buckets: 2019-06-28 (Carol), 2019-07-20 (five rows) and 2019-07-27 (Dave). 2019-07-01 and the other quiet days create nothing.",
      "COUNT(DISTINCT username) collapses 2019-07-20's five rows to 3 users (Alice, Bob, Carol); the boundary buckets each hold one user. COUNT(*) would have printed 5 there.",
      "ORDER BY day prints calendar order for readability; grading compares the rows as a set, so the alias day is the contract, not the sort.",
    ],
    time: "O(n) — one scan with a string-range filter, plus at most O(d log d) to emit the d day buckets",
    space: "O(d) — one row per day that has activity",
    followUps: [
      "Part II averages sessions per user per day — same WHERE clause, one CTE deeper.",
      "Make the window dynamic: compute the left edge from MAX(startDate) with date(..., '-29 days') instead of hard-coding 2019-06-28.",
      "What if zero-activity days HAD to appear? A calendar scaffold (a recursive CTE of dates) LEFT JOINed to the log — the students-and-examinations move.",
    ],
    related: ["user-activity-for-the-past-30-days-ii", "monthly-transactions-i", "students-and-examinations"],
    order: "any",
    xp: 10,
  },
  {
    slug: "user-activity-for-the-past-30-days-ii",
    statement:
      "Same Activity log — username, activity, startDate, endDate, duplicates possible. Over the 30 days ending 2019-07-27 inclusive, find the average number of sessions per user, rounded to 2 decimal places. Each row is one session; for every day that has sessions, divide that day's session count by that day's distinct-user count, then average those daily figures across the days that have them.",
    examples: [
      {
        input:
          "Activity: (Alice,Search,2019-07-20,2019-07-20) · (Bob,Search,2019-07-20,2019-07-20) ×3 duplicate rows · (Carol,Browse,2019-07-20,2019-07-21) · (Carol,Browse,2019-06-28,2019-06-29) · (Dave,Paint,2019-06-28,2019-06-28) · (Alice,Dance,2019-08-01,2019-08-02) · (Bob,Travel,2019-08-10,2019-08-15) · (Eve,Sketch,2019-06-25,2019-06-26)",
        output: "1.33",
        explanation:
          "Two days have sessions: 2019-07-20 → 5 sessions / 3 users = 1.6667, 2019-06-28 → 2 sessions / 2 users = 1.0. Average of the daily ratios = (1.6667 + 1.0) / 2 = 1.3333 → 1.33. The three out-of-window rows and the 28 zero-session days of the window count for nothing.",
      },
    ],
    constraints: [
      "each Activity row is one session (a username active on a startDate)",
      "same 30-day window as Part I, both endpoints inclusive",
      "the average runs over days that have sessions, not over the window's 30 days",
      "output: exactly one column, average_sessions_per_user, rounded to 2dp",
    ],
    breakdown: [
      "'Average sessions per user' is a ratio of ratios, and the wording alone doesn't pin the math down: the grader's definition is (sessions ÷ distinct users) PER DAY, averaged over the days that have sessions. On this seed that's (5/3 + 2/2) ÷ 2 = 1.33. The competing definitions — total sessions ÷ total distinct users (7/3 = 2.33) or sessions ÷ 30 window days (0.23) — are both plausible readings and both wrong. This problem grades careful reading as much as SQL.",
      "Mechanically it's two aggregation stages, and the order is forced: first GROUP BY startDate to get each day's COUNT(*) and COUNT(DISTINCT username), then AVG over those daily ratios. SQLite (like every engine) refuses to nest aggregates — AVG(COUNT(*)) is a syntax error — so the daily stage must live in a CTE, exactly why product-sales-analysis-iii needed its ranked CTE.",
      "The integer-division trap fires on the very first day: 5 / 3 in SQLite's integer math is 1, not 1.6667. Multiplying one operand by 1.0 (sessions * 1.0 / users) forces floating-point division — the same 100.0-before-dividing habit as trips-and-users, in miniature.",
      "The averaging denominator is the days WITH sessions — two here, not the window's 30. WHERE + GROUP BY produce only observed days for free; the classic bug is mentally padding the quiet days with zeros and dividing by 30, which flushes the answer toward 0.",
    ],
    edges: [
      "Only days with sessions enter the average — 2019-07-01 and the window's other empty days contribute nothing (dividing by 30 is the classic wrong answer).",
      "sessions * 1.0 / users — without the 1.0, SQLite's integer division flattens 5/3 to 1 and the final digit shifts.",
      "The user denominator is COUNT(DISTINCT username): Bob's triple row is 3 sessions but 1 user on 2019-07-20.",
      "ROUND exactly once, after the outer AVG — rounding the daily ratios first bakes avoidable error into the inputs.",
    ],
    ladder: [
      {
        title: "Brute force — per-day tallies by hand",
        body: "Bucket the in-window rows by day, count sessions and distinct users per bucket, form each day's ratio, average the ratios over non-empty days. Every step is mechanical — the risk is misreading which denominator the spec wants.",
      },
      {
        title: "The pattern — aggregate, then aggregate the aggregates",
        body: "Stage 1 (CTE daily): GROUP BY startDate, emit COUNT(*) and COUNT(DISTINCT username). Stage 2: AVG of the ratio. Two small steps, each independently checkable against the seed.",
      },
      {
        title: "The optimal idea — CTE + AVG + ROUND once",
        body: "The two-stage shape is already optimal: one scan builds the buckets, one pass over at most d rows averages them. sessions * 1.0 / users guards division; ROUND(..., 2) pins the output format at the very end.",
      },
    ],
    approach: "Two-stage aggregation — daily sessions/users CTE, then AVG of the per-day ratios",
    schema: {
      ddl: `CREATE TABLE Activity (
  username  TEXT NOT NULL,
  activity  TEXT NOT NULL,
  startDate TEXT NOT NULL,
  endDate   TEXT NOT NULL
);`,
      seed: `INSERT INTO Activity (username, activity, startDate, endDate) VALUES
  ('Alice','Search','2019-07-20','2019-07-20'),
  ('Bob','Search','2019-07-20','2019-07-20'),
  ('Bob','Search','2019-07-20','2019-07-20'),
  ('Bob','Search','2019-07-20','2019-07-20'),   -- 07-20: 5 sessions but only 3 users
  ('Carol','Browse','2019-07-20','2019-07-21'),
  ('Carol','Browse','2019-06-28','2019-06-29'), -- 06-28: 2 sessions, 2 users → ratio 1.0
  ('Dave','Paint','2019-06-28','2019-06-28'),
  ('Alice','Dance','2019-08-01','2019-08-02'),  -- outside the window: must not dilute
  ('Bob','Travel','2019-08-10','2019-08-15'),   -- outside
  ('Eve','Sketch','2019-06-25','2019-06-26');   -- outside; 2019-07-01 has NO rows at all`,
      tables: [
        { name: "Activity", note: "10 rows — two in-window days: 2019-07-20 (5 sessions / 3 users) and 2019-06-28 (2 / 2); 3 rows sit outside; the window's other 28 days have no rows" },
      ],
    },
    code: `WITH daily AS (
    -- stage 1: one row per day WITH sessions — its count and its distinct users
    SELECT
        startDate,
        COUNT(*) AS sessions,                  -- every row is one session
        COUNT(DISTINCT username) AS users      -- Bob's triple row: 3 sessions, 1 user
    FROM Activity
    WHERE startDate BETWEEN '2019-06-28' AND '2019-07-27'
    GROUP BY startDate
)
SELECT
    ROUND(AVG(sessions * 1.0 / users), 2)      -- * 1.0: 5/3 in integer math would be 1
        AS average_sessions_per_user
FROM daily;`,
    walkthrough: [
      "daily buckets the 7 in-window rows into two groups — 2019-07-20 (five rows) and 2019-06-28 (two rows); the three out-of-window rows died in WHERE, and the window's empty days never existed as rows.",
      "Per bucket: 2019-07-20 → sessions 5, users 3 (Alice, Bob, Carol); 2019-06-28 → sessions 2, users 2 (Carol, Dave).",
      "sessions * 1.0 / users computes 1.6667 and 1.0; AVG over the two days gives 1.3333 — had the 1.0 been missing, the first ratio would have been integer 1 and the answer 1.0.",
      "ROUND(..., 2) fires once at the end → 1.33, emitted as the single column average_sessions_per_user: one row, one number, matching the documented output.",
    ],
    time: "O(n) — one scan to build the daily buckets, one pass over at most d rows to average them",
    space: "O(d) — the daily CTE",
    followUps: [
      "Surface the per-day ratios next to the average: move sessions * 1.0 / users into the CTE's SELECT and report both.",
      "Compare the grader's definition with total sessions ÷ total users: on this seed that's 7/3 = 2.33 vs 1.33 — an average of ratios vs a ratio of aggregates.",
      "Part I of this pair counts distinct users per day — reuse its query as the inner block and extend it with the session count.",
    ],
    related: ["user-activity-for-the-past-30-days-i", "average-selling-price", "percentage-of-users-attended-a-contest"],
    order: "any",
    xp: 10,
  },
  {
    slug: "reported-posts",
    statement:
      "A content platform's Actions table logs one row per user action on a post — view, like, share, report and so on. The extra column carries a reason only when the action is a report (e.g. 'spam', 'nudity'); for every other action it is NULL. For each calendar day, count how many actions were reports flagged as spam. Days whose actions include no spam reports contribute nothing.",
    examples: [
      {
        input:
          "Actions: (1,3,2019-07-01,report,spam) · (1,4,2019-07-04,report,spam) · (2,4,2019-07-04,report,spam) · (3,4,2019-07-04,report,spam) · (2,4,2019-07-04,view,NULL) · (3,1,2019-07-04,like,NULL) · (4,2,2019-07-05,report,nudity) · (4,2,2019-07-05,share,NULL) · (5,5,2019-07-06,report,spam) · (1,3,2019-07-06,report,spam)",
        output: "2019-07-01 · 1 / 2019-07-04 · 3 / 2019-07-06 · 2",
        explanation:
          "2019-07-04 has three spam reports for post 4 — the view of post 4 that day never counts. 2019-07-05 has actions (a nudity report, a share) but zero spam reports, so it emits no row at all.",
      },
    ],
    constraints: [
      "action is one of view, like, reaction, comment, report, share",
      "extra is NULL except on report rows, where it names the reason (spam, nudity, …)",
      "Actions may contain duplicate rows; there is no primary key",
      "output columns exactly: day, reports_count",
    ],
    breakdown: [
      "Two predicates decide everything: action = 'report' AND extra = 'spam'. Because the output contains ONLY spam counts, both can live in WHERE as a pre-filter — the cleanest shape here. Contrast monthly-transactions-i, where approved and total must coexist in one output row and the condition has to move INSIDE a conditional SUM: the placement of the predicate is dictated by what else the row must carry.",
      "extra's NULL semantics are worth naming: extra is NULL on every view, like and share, and NULL = 'spam' evaluates to NULL (not true), so non-report rows fail the extra test naturally — even the action = 'report' guard alone would leave the count unchanged. Keep both predicates anyway: the guard documents intent and future-proofs against a non-report action that one day carries an extra.",
      "The grain is one row per action_date that has at least one qualifying report. Days with other actions only — 2019-07-05's nudity report and share — produce no group after the WHERE, which is exactly what 'days with zero spam reports don't appear' means mechanically. COUNT(*) then counts surviving rows; after that filter, each row IS one spam report.",
      "The aliases are part of the contract: the grader compares column names, so AS day and AS reports_count are not cosmetic. A numerically perfect query with the alias reports fails on name — the same discipline as Part I's day / active_users.",
    ],
    edges: [
      "extra = 'spam' is NULL-safe by accident (NULL fails the test) — but keep action = 'report' as the explicit, self-documenting guard.",
      "2019-07-05 has activity but zero spam reports — it must NOT appear, not even as a 0 row.",
      "On this seed COUNT(*) and COUNT(DISTINCT post_id) agree because no post is spam-reported twice on one day — if duplicates were possible and the spec counted posts, switch the counter.",
      "Aliases are graded: day then reports_count, in that column order.",
    ],
    ladder: [
      {
        title: "Brute force — eyeball and tally",
        body: "Scan the log, keep rows whose action is a report and whose reason is spam, tally per date. The manual filter is literally the WHERE clause — the lesson is trusting the engine to do the scanning.",
      },
      {
        title: "The pattern — pre-filter, bucket, count",
        body: "WHERE both predicates, GROUP BY action_date, COUNT(*). When the output is a single flavor, pre-filtering beats conditional aggregation on readability — reserve CASE-in-SUM for multi-flavor rows.",
      },
      {
        title: "The optimal idea — one scan, cheap predicates",
        body: "O(n): every row is tested with two string comparisons and either dropped or dropped into a day bucket. Nothing further to optimize; ORDER BY day is presentation for humans.",
      },
    ],
    approach: "Two-predicate WHERE pre-filter + GROUP BY day + COUNT(*)",
    schema: {
      ddl: `CREATE TABLE Actions (
  user_id     INTEGER NOT NULL,
  post_id     INTEGER NOT NULL,
  action_date TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('view','like','reaction','comment','report','share')),
  extra       TEXT
);`,
      seed: `INSERT INTO Actions (user_id, post_id, action_date, action, extra) VALUES
  (1, 3, '2019-07-01', 'report', 'spam'),
  (1, 4, '2019-07-04', 'report', 'spam'),
  (2, 4, '2019-07-04', 'report', 'spam'),
  (3, 4, '2019-07-04', 'report', 'spam'),
  (2, 4, '2019-07-04', 'view',   NULL),     -- same post/day, but a view: never counts
  (3, 1, '2019-07-04', 'like',   NULL),
  (4, 2, '2019-07-05', 'report', 'nudity'), -- a report — but not spam
  (4, 2, '2019-07-05', 'share',  NULL),     -- 07-05 therefore has zero spam reports
  (5, 5, '2019-07-06', 'report', 'spam'),
  (1, 3, '2019-07-06', 'report', 'spam');   -- post 3 flagged again on a later day`,
      tables: [
        { name: "Actions", note: "10 rows — 6 spam reports across 3 days; views, a like and a nudity report are decoys; 2019-07-05 has actions but no spam" },
      ],
    },
    code: `SELECT
    action_date AS day,          -- a report counts on the day it was filed
    COUNT(*) AS reports_count    -- each surviving row IS one spam report
FROM Actions
WHERE action = 'report'          -- extra only means anything on reports
  AND extra = 'spam'             -- NULL extras (views, likes) fail this test naturally
GROUP BY action_date
ORDER BY day;`,
    walkthrough: [
      "WHERE removes 7 of the 10 rows: the two views, the like, the nudity report and the share — only the six report+spam rows survive.",
      "2019-07-04 keeps its three spam rows for post 4 (users 1, 2, 3); the view of post 4 that day was filtered before grouping, not counted and then subtracted.",
      "GROUP BY action_date emits three groups; COUNT(*) reads 1 on 2019-07-01, 3 on 2019-07-04 and 2 on 2019-07-06 — post 3's second flagging on 07-06 counts as a new report.",
      "2019-07-05 produced no group at all (its report was nudity, not spam), so the output has exactly three rows; ORDER BY day lays them out in calendar order for the snapshot.",
    ],
    time: "O(n) — single scan; the two predicates are per-row string comparisons",
    space: "O(d) — one row per day that has spam reports",
    followUps: [
      "Report spam AND non-spam reports side by side: the predicates must move into conditional COUNTs (SUM(CASE WHEN extra = 'spam' ...)) because WHERE can only keep one flavor.",
      "Which posts get flagged repeatedly? GROUP BY post_id with HAVING COUNT(*) >= 2.",
      "reported-posts-ii turns these counts into removal rates via a join to Removals — same WHERE, one join deeper.",
    ],
    related: ["reported-posts-ii", "monthly-transactions-i", "queries-quality-and-percentage"],
    order: "any",
    xp: 10,
  },
  {
    slug: "reported-posts-ii",
    statement:
      "Alongside the Actions log lives Removals, which records the date each taken-down post was removed. For every day that received at least one spam report, work out what percentage of that day's spam reports eventually led to a removal (the post appears in Removals), then average those daily percentages and round to 2 decimal places.",
    examples: [
      {
        input:
          "Actions: (1,3,2019-07-01,report,spam) · (1,4,2019-07-04,report,spam) · (2,4,2019-07-04,report,spam) ×2 duplicate rows · (2,4,2019-07-04,view,NULL) · (3,1,2019-07-02,report,nudity) · (3,1,2019-07-02,view,NULL) · (2,5,2019-07-05,report,spam) ×2 · (5,7,2019-07-05,report,spam) — Removals: (3,2019-07-02),(7,2019-07-20),(6,2019-07-10)",
        output: "44.44",
        explanation:
          "2019-07-01: 1 spam report, post 3 removed → 100%. 2019-07-04: 3 spam-report rows for post 4, never removed → 0%. 2019-07-05: 3 spam-report rows (post 5 twice, post 7 once), only post 7 removed → 33.33%. Average (100 + 0 + 33.3333)/3 = 44.44. The nudity report, the views and Removals' post 6 (never spam-reported) all count for nothing.",
      },
    ],
    constraints: [
      "a report 'led to removal' when its post_id appears in Removals",
      "Actions may contain duplicate rows — each spam report ROW counts",
      "Removals.post_id is the primary key; removals may exist for posts never spam-reported",
      "output: exactly one column, average_daily_percent, rounded to 2dp",
    ],
    breakdown: [
      "The definition stacks two aggregations: per report-day, rate = removed spam reports ÷ all spam reports that day × 100; then the answer is the AVG of those daily rates over the days that HAVE spam reports. As in Part II of the activity pair, the inner aggregate (per-day rate) must exist before the outer one (the average) — that's the daily CTE, not optional style.",
      "'Led to removal' is a join question, and the join type is the whole exam: LEFT JOIN Removals on post_id, then flag r.post_id IS NOT NULL. An INNER JOIN here is the fatal bug — it deletes every report whose post was never removed, so 2019-07-04 (all three reports unremoved) would vanish instead of contributing a true 0%, and the average would jump to a plausible-but-wrong 66.67. Optional-on-the-right ⇒ LEFT JOIN, the employee-bonus lesson feeding a denominator.",
      "The rate counts report ROWS, so duplicates widen the denominator: post 5's duplicate report makes 2019-07-05 three reports (one removed), not two posts (one removed). The official spec lets Actions carry duplicate rows and grades the row-weighted reading — a COUNT(DISTINCT post_id) variant is a legitimate different question, and on this seed it would change 07-05 from 33.33% to 50%.",
      "Arithmetic discipline, twice over: 100.0 must multiply BEFORE the division or integer math flattens 1/3 to 0 — and ROUND fires exactly once, on the final average. Rounding each day's percentage first is the classic composition bug: 07-05's true rate is 33.3333…, and pre-rounding bakes that error into a number that hasn't been averaged yet.",
    ],
    edges: [
      "Days with zero spam reports are excluded entirely — 2019-07-02 has a nudity report and a view but produces no group and no 0% row.",
      "INNER JOIN is the trap: it deletes the 0% day (2019-07-04) and inflates the average to (100 + 33.33)/2 = 66.67.",
      "100.0 before dividing: 100 * 1 / 3 is 0 in integer math, which would zero out every partial day.",
      "Removals rows for posts never spam-reported (post 6) and non-spam actions must both be inert — they touch neither numerator nor denominator.",
    ],
    ladder: [
      {
        title: "Brute force — check every report against Removals",
        body: "Per day, list the spam reports, look up each post in Removals, count the hits, divide, then average the days. Correct and instructive — and exactly the shape the CTEs will formalize.",
      },
      {
        title: "The pattern — LEFT JOIN flag, then two-stage aggregation",
        body: "Stage 1 attaches a 0/1 removed flag per spam report via LEFT JOIN. Stage 2 groups by day: SUM(flag)/COUNT(*) × 100. Stage 3 averages the rates. Each stage is one clause deep and independently checkable.",
      },
      {
        title: "The optimal idea — boolean SUM over flagged rows",
        body: "SUM(removed) where removed is r.post_id IS NOT NULL turns the numerator into a plain aggregate — no second join, no CASE. One pass over Actions with primary-key lookups into Removals, then two cheap group passes. Round once, at the end.",
      },
    ],
    approach: "LEFT JOIN removal flag + per-day rate CTE + final AVG (round once)",
    schema: {
      ddl: `CREATE TABLE Actions (
  user_id     INTEGER NOT NULL,
  post_id     INTEGER NOT NULL,
  action_date TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('view','like','reaction','comment','report','share')),
  extra       TEXT
);
CREATE TABLE Removals (
  post_id     INTEGER PRIMARY KEY,
  remove_date TEXT NOT NULL
);`,
      seed: `INSERT INTO Actions (user_id, post_id, action_date, action, extra) VALUES
  (1, 3, '2019-07-01', 'report', 'spam'),
  (1, 4, '2019-07-04', 'report', 'spam'),
  (2, 4, '2019-07-04', 'report', 'spam'),
  (2, 4, '2019-07-04', 'report', 'spam'),   -- duplicate row: report ROWS count, not posts
  (2, 4, '2019-07-04', 'view',   NULL),
  (3, 1, '2019-07-02', 'report', 'nudity'), -- 07-02 has actions but zero SPAM reports
  (3, 1, '2019-07-02', 'view',   NULL),
  (2, 5, '2019-07-05', 'report', 'spam'),
  (2, 5, '2019-07-05', 'report', 'spam'),   -- duplicate again: 07-05 has 3 spam rows
  (5, 7, '2019-07-05', 'report', 'spam');
INSERT INTO Removals (post_id, remove_date) VALUES
  (3, '2019-07-02'),   -- post 3: reported spam 07-01, removed
  (7, '2019-07-20'),   -- post 7: reported spam 07-05, removed
  (6, '2019-07-10');   -- post 6: removed but never spam-reported — inert noise`,
      tables: [
        { name: "Actions", note: "10 rows — 7 spam-report rows across 3 days (post 4 ×3 and post 5 ×2 include duplicates); a nudity report and views are decoys" },
        { name: "Removals", note: "3 rows — posts 3 and 7 were spam-reported and later removed; post 6 was removed but never spam-reported" },
      ],
    },
    code: `WITH spam AS (
    -- stage 1: every spam report, flagged with whether its post ended up removed
    SELECT
        a.action_date,
        r.post_id IS NOT NULL AS removed    -- 1 = led to removal, 0 = still up
    FROM Actions a
    LEFT JOIN Removals r ON r.post_id = a.post_id
    WHERE a.action = 'report'
      AND a.extra = 'spam'
),
daily AS (
    -- stage 2: per-day rate — removed reports over all reports that day
    SELECT
        action_date,
        100.0 * SUM(removed) / COUNT(*) AS pct   -- 100.0 BEFORE dividing: no integer drop
    FROM spam
    GROUP BY action_date
)
SELECT
    ROUND(AVG(pct), 2) AS average_daily_percent   -- round ONCE, after the averaging
FROM daily;`,
    walkthrough: [
      "spam reduces Actions to its 7 spam-report rows, each flagged: post 3 on 07-01 → 1; the three post-4 rows on 07-04 → 0, 0, 0 (post 4 is not in Removals); post 5 twice and post 7 once on 07-05 → 0, 0, 1. The nudity report and the views never enter.",
      "daily collapses to three rates: 2019-07-01 → 100.0 × 1/1 = 100.0; 2019-07-04 → 100.0 × 0/3 = 0.0; 2019-07-05 → 100.0 × 1/3 = 33.3333. 2019-07-02 has no spam rows, so it forms no group.",
      "The LEFT JOIN is what keeps 07-04 in the picture as a true 0% — an INNER JOIN would drop the day and answer (100 + 33.33)/2 = 66.67, a wrong answer that looks right.",
      "AVG(100, 0, 33.3333) = 44.4444, and ROUND(..., 2) fires exactly once → 44.44, the single documented value under the alias average_daily_percent.",
    ],
    time: "O(n + m) — one pass over Actions with primary-key lookups into Removals, then two cheap group passes",
    space: "O(d) — the daily rate CTE",
    followUps: [
      "Emit the per-day table (day + pct) — the daily CTE already is the answer; only the outer AVG disappears.",
      "Distinct-post variant: COUNT(DISTINCT post_id) in numerator and denominator — which seed day's rate changes, and why?",
      "How would you also report zero-spam days as 0%? Scaffold DISTINCT action_date over ALL Actions LEFT JOINed to the daily rates — the zero-fill move.",
    ],
    related: ["reported-posts", "average-selling-price", "bank-account-summary-ii"],
    order: "any",
    xp: 20,
  },
  {
    slug: "monthly-transactions-i",
    statement:
      "A payments warehouse stores every transaction with its country, approval state ('approved' or 'declined'), amount and date. Produce a monthly report per country: for each (month, country) pair, how many transactions moved and their total amount — and, in the same output row, the count and total amount of just the approved ones. Months are labeled YYYY-MM.",
    examples: [
      {
        input:
          "Transactions: (101,US,approved,1000,2019-05-18) · (102,US,declined,2000,2019-05-19) · (103,US,approved,3000,2019-06-10) · (104,US,approved,1000,2019-06-13) · (105,DE,declined,2000,2019-05-15) · (106,DE,approved,500,2019-05-15) · (107,DE,declined,700,2019-06-01) · (108,US,approved,400,2018-12-31) · (109,US,declined,600,2019-01-01) · (110,UK,approved,250,2019-07-04)",
        output:
          "2018-12 · US · 1 · 1 · 400 · 400 / 2019-01 · US · 1 · 0 · 600 · 0 / 2019-05 · DE · 2 · 1 · 2500 · 500 / 2019-05 · US · 2 · 1 · 3000 · 1000 / 2019-06 · DE · 1 · 0 · 700 · 0 / 2019-06 · US · 2 · 2 · 4000 · 4000 / 2019-07 · UK · 1 · 1 · 250 · 250",
        explanation:
          "US 2019-05 holds rows 101–102: 2 transactions totalling 3000, of which only 101 is approved (count 1, amount 1000). Declined-only buckets (2019-01 US, 2019-06 DE) still print with approved 0 / 0. The year boundary splits 2018-12-31 and 2019-01-01 into different month buckets.",
      },
    ],
    constraints: [
      "state is 'approved' or 'declined'; id is the primary key",
      "trans_date is a YYYY-MM-DD date; buckets are '%Y-%m' month labels",
      "every (month, country) present in the data appears exactly once",
      "output columns exactly: month, country, trans_count, approved_count, trans_total_amount, approved_total_amount",
    ],
    breakdown: [
      "Bucketing is a computed column: strftime('%Y-%m', trans_date) stamps every row with its month label, and GROUP BY that label plus country builds the report grid. strftime is the SQLite idiom and prints exactly the YYYY-MM the output names; the '%Y' part is what keeps December 2018 and January 2019 in different buckets — a naive month-only extraction would merge them across years.",
      "The approved figures must coexist with the totals in ONE row, so WHERE can't do the job — filtering state = 'approved' would zero the total columns. This is the canonical conditional-aggregation setup: COUNT/SUM with the condition inside, either SUM(state = 'approved') (booleans are 1/0 in SQLite) or SUM(CASE WHEN state = 'approved' THEN …). queries-quality-and-percentage and reported-posts-ii are the same pattern wearing different hats.",
      "Zero still prints: 2019-01 US contains one declined transaction, and its approved_count and approved_total_amount must be 0, not NULL. That's why the amount CASE carries ELSE 0 — without it, an all-declined group would SUM the ignored rows to NULL and print NULL in a column the grader expects to hold 0. (COUNT is naturally 0 on an empty set.)",
      "Pairs with no transactions at all still can't appear — there's no row to group. The report covers observed (month, country) combinations only; manufacturing empty months would need a calendar scaffold, which this spec does not want. And id, despite being the primary key, plays no role: the grouping keys are month and country.",
    ],
    edges: [
      "Months with transactions but zero approved still emit a row with 0 / 0 — 2019-01 US and 2019-06 DE prove it.",
      "Year boundary: 2018-12-31 and 2019-01-01 are different buckets — '%Y-%m' handles it; a month-only extraction would not.",
      "SUM(CASE … ) without ELSE 0 returns NULL for all-declined groups — the ELSE keeps 0 a 0.",
      "Two rows may share a date and country with mixed states (105/106 on 2019-05-15) — they land in one bucket with the approved one picked out.",
    ],
    ladder: [
      {
        title: "Brute force — two passes in application code",
        body: "Loop the transactions once to total count and amount per (month, country), again (or a second accumulator) for the approved-only figures. Two accumulation maps per bucket is exactly what two conditional aggregates do in one pass.",
      },
      {
        title: "The pattern — GROUP BY a computed date label + conditional SUMs",
        body: "strftime stamps the month, GROUP BY month + country sets the grain, and the four aggregates ride side by side — two unconditional, two filtered internally by CASE/boolean. One scan, one output row per bucket.",
      },
      {
        title: "The optimal idea — one scan, four aggregates",
        body: "Everything is a single pass: the date label is a constant-time string op per row and the GROUP BY hashes at most months × countries buckets. No CTE needed here — the query is flat because every output column is a peer aggregate of the same grain.",
      },
    ],
    approach: "strftime month bucketing + conditional SUM/COUNT in one GROUP BY",
    schema: {
      ddl: `CREATE TABLE Transactions (
  id         INTEGER PRIMARY KEY,
  country    TEXT NOT NULL,
  state      TEXT NOT NULL CHECK (state IN ('approved','declined')),
  amount     INTEGER NOT NULL,
  trans_date TEXT NOT NULL
);`,
      seed: `INSERT INTO Transactions (id, country, state, amount, trans_date) VALUES
  (101, 'US', 'approved', 1000, '2019-05-18'),
  (102, 'US', 'declined', 2000, '2019-05-19'),   -- US 2019-05: 2 txns, only 1 approved
  (103, 'US', 'approved', 3000, '2019-06-10'),
  (104, 'US', 'approved', 1000, '2019-06-13'),
  (105, 'DE', 'declined', 2000, '2019-05-15'),
  (106, 'DE', 'approved',  500, '2019-05-15'),   -- same day, mixed states
  (107, 'DE', 'declined',  700, '2019-06-01'),   -- DE 2019-06: zero approved → 0 row
  (108, 'US', 'approved',  400, '2018-12-31'),   -- previous year: its own 2018-12 bucket
  (109, 'US', 'declined',  600, '2019-01-01'),   -- next day: 2019-01, zero approved → 0 row
  (110, 'UK', 'approved',  250, '2019-07-04');`,
      tables: [
        { name: "Transactions", note: "10 rows across 5 months and 3 countries — two (month, country) buckets have zero approved transactions" },
      ],
    },
    code: `SELECT
    strftime('%Y-%m', trans_date) AS month,   -- the YYYY-MM bucket; '%Y' handles year rollovers
    country,
    COUNT(*) AS trans_count,                  -- approved AND declined
    SUM(state = 'approved') AS approved_count,   -- 1/0 per row: a conditional COUNT
    SUM(amount) AS trans_total_amount,
    SUM(CASE WHEN state = 'approved' THEN amount ELSE 0 END)   -- ELSE 0: all-declined → 0, not NULL
        AS approved_total_amount
FROM Transactions
GROUP BY strftime('%Y-%m', trans_date), country
ORDER BY month, country;`,
    walkthrough: [
      "strftime stamps each row with its YYYY-MM label — 2019-05-18 → '2019-05', 2018-12-31 → '2018-12' — and GROUP BY label + country collapses the 10 rows into 7 buckets.",
      "US 2019-05 holds rows 101 and 102: trans_count 2, trans_total_amount 3000; only 101 is approved, so SUM(state = 'approved') = 1 and the amount CASE picks up just its 1000.",
      "The declined-only buckets show the zero-fill working: 2019-01 US prints 1 · 0 · 600 · 0 and 2019-06 DE prints 1 · 0 · 700 · 0 — the ELSE 0 branch keeps those sums at 0 instead of NULL.",
      "The year boundary lands where it should: row 108 sits in 2018-12 US and row 109 in 2019-01 US, one day apart but in different months. ORDER BY month, country lays the seven rows out chronologically; grading treats them as a set.",
    ],
    time: "O(n) — one scan; strftime is a constant-time string op per row and the GROUP BY hashes at most months × countries buckets",
    space: "O(g) — one row per (month, country) group",
    followUps: [
      "Monthly Transactions II compares each country's approved share against the overall average — today's query becomes the CTE it is computed from.",
      "Add an approved_share column: 100.0 * approved_count / trans_count — and note which buckets would divide by a nonzero count only because zero-approved months still have trans_count > 0.",
      "Swap strftime for date(trans_date, 'start of month') and confirm the buckets match — two SQLite idioms, one answer.",
    ],
    related: ["reported-posts-ii", "queries-quality-and-percentage", "the-latest-login-in-2020"],
    order: "any",
    xp: 20,
  },
  {
    slug: "the-latest-login-in-2020",
    statement:
      "An audit table records every login: which user and when, as a datetime string. Report each user's most recent login made during the year 2020, with the alias last_stamp. Users who never logged in that year get no row at all — the answer contains only users with at least one 2020 login.",
    examples: [
      {
        input:
          "Logins: (8,108,'2020-12-30 02:07:01') · (4,108,'2020-01-01 00:00:00') · (18,108,'2020-11-25 02:14:55') · (2,108,'2020-01-07 23:59:59') · (3,108,'2019-08-15 09:00:00') · (1,102,'2020-06-12 12:00:00') · (12,102,'2020-07-14 07:00:00') · (9,102,'2020-06-25 00:00:00') · (11,102,'2020-12-31 23:59:59') · (15,101,'2019-12-31 23:59:59') · (21,101,'2021-01-01 00:00:00') · (7,105,'2021-06-20 11:11:11')",
        output: "102 · 2020-12-31 23:59:59 / 108 · 2020-12-30 02:07:01",
        explanation:
          "User 102's 2020 logins peak at the year's last second; user 108's at 2020-12-30 02:07:01. User 101 has only 2019 and 2021 rows and user 105 only a 2021 row — both excluded entirely, and 108's 2019 login is ignored.",
      },
    ],
    constraints: [
      "time_stamp is a 'YYYY-MM-DD HH:MM:SS' datetime string",
      "login_id is the primary key; a user may log in many times",
      "users with no 2020 login appear nowhere in the output",
      "output columns exactly: user_id, last_stamp",
    ],
    breakdown: [
      "Two idioms filter a year: strftime('%Y', time_stamp) = '2020' reads like the question, while time_stamp >= '2020-01-01' AND time_stamp < '2021-01-01' reads like an interval. They select the same rows here, but the range form is the professional one — it leaves the bare column on the left of the comparison, so an index on time_stamp stays usable, whereas wrapping the column in a function forces a scan of every row.",
      "The range is half-open for a reason. BETWEEN '2020-01-01' AND '2020-12-31' silently excludes the year's last second: '2020-12-31 23:59:59' compares GREATER than '2020-12-31' as strings, so BETWEEN's inclusive upper bound misses it. The seed's row 11 (user 102 at 2020-12-31 23:59:59) is exactly this trap — the strict < '2021-01-01' is what keeps it. Symmetrically, <= '2021-01-01' would leak row 21's 2021-01-01 00:00:00 into the answer.",
      "With the window fixed, the aggregation is the friendliest shape in SQL: MAX(time_stamp) GROUP BY user_id. MAX works on text here ONLY because the format is zero-padded, fixed-width ISO — lexicographic order equals chronological order. '2020-9-1'-style strings would sort '2020-9-1' after '2020-10-1' and corrupt the answer; keep datetimes in ISO or compare through datetime().",
      "The exclusion of user 101 and user 105 is not a special case — it's WHERE running before GROUP BY. A user with no row in the filtered set forms no group, so they simply have no output row. No LEFT JOIN scaffold, no COALESCE, no zero-fill: the spec wants absence, and the clause order delivers it.",
    ],
    edges: [
      "The last second of 2020 (2020-12-31 23:59:59) must be IN — BETWEEN '2020-01-01' AND '2020-12-31' drops it; < '2021-01-01' keeps it.",
      "2021-01-01 00:00:00 must stay OUT — an upper bound of <= '2021-01-01' would leak it (seed row 21).",
      "Users with no 2020 logins (101: only 2019 + 2021, 105: only 2021) appear nowhere — absence, not NULL.",
      "MAX-as-text is correct only for fixed-format ISO strings; zero-padded fields make lexicographic = chronological.",
    ],
    ladder: [
      {
        title: "Brute force — bucket logins per user in app code",
        body: "Pull all logins, throw away non-2020 timestamps, group by user in a map, take each map's max. Three loops and a filter — the query expresses the same pipeline in four lines.",
      },
      {
        title: "The pattern — filter the window, then GROUP BY + MAX",
        body: "A WHERE that carves out exactly 2020, GROUP BY user_id, MAX(time_stamp) as last_stamp. This 'latest event per entity' shape (MAX/MIN + GROUP BY) is game-play-analysis-i in reverse gear.",
      },
      {
        title: "The optimal idea — sargable half-open range",
        body: "Keep the column bare: time_stamp >= '2020-01-01' AND time_stamp < '2021-01-01' lets an index on time_stamp serve the filter (a strftime-wrapped column cannot). One scan, one aggregate pass — O(n) with the boundary correctness carried by the strict <.",
      },
    ],
    approach: "Half-open datetime range + GROUP BY user_id + MAX(time_stamp)",
    schema: {
      ddl: `CREATE TABLE Logins (
  login_id   INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  time_stamp TEXT NOT NULL
);`,
      seed: `INSERT INTO Logins (login_id, user_id, time_stamp) VALUES
  (8,  108, '2020-12-30 02:07:01'),
  (4,  108, '2020-01-01 00:00:00'),
  (18, 108, '2020-11-25 02:14:55'),
  (2,  108, '2020-01-07 23:59:59'),
  (3,  108, '2019-08-15 09:00:00'),   -- pre-2020: ignored for 108
  (1,  102, '2020-06-12 12:00:00'),
  (12, 102, '2020-07-14 07:00:00'),
  (9,  102, '2020-06-25 00:00:00'),
  (11, 102, '2020-12-31 23:59:59'),   -- the year's last second: BETWEEN '...-12-31' would lose it
  (15, 101, '2019-12-31 23:59:59'),   -- user 101: no 2020 login → no output row
  (21, 101, '2021-01-01 00:00:00'),   -- 2021 must NOT leak into the 2020 answer
  (7,  105, '2021-06-20 11:11:11');   -- user 105: 2021 only → no output row`,
      tables: [
        { name: "Logins", note: "12 rows — users 101 and 105 have no 2020 logins; row 11 is the last second of 2020; rows 21 and 7 are 2021 decoys" },
      ],
    },
    code: `SELECT
    user_id,
    MAX(time_stamp) AS last_stamp   -- ISO datetimes sort as text, so MAX is the latest
FROM Logins
WHERE time_stamp >= '2020-01-01'    -- half-open year window [2020-01-01, 2021-01-01):
  AND time_stamp <  '2021-01-01'    -- keeps 2020-12-31 23:59:59, drops 2021-01-01 00:00:00
GROUP BY user_id
ORDER BY user_id;`,
    walkthrough: [
      "WHERE keeps the eight timestamps starting '2020-' and rejects user 108's 2019 login, both of user 101's rows (2019-12-31 23:59:59 and 2021-01-01 00:00:00) and user 105's 2021 login.",
      "The boundary rows show why the bounds are shaped this way: '2020-12-31 23:59:59' < '2021-01-01' survives (it becomes user 102's last stamp), while '2021-01-01 00:00:00' fails the strict < by the smallest possible margin.",
      "GROUP BY user_id makes two groups; MAX(time_stamp) picks '2020-12-31 23:59:59' for 102 and '2020-12-30 02:07:01' for 108 — string comparison suffices because the format is zero-padded.",
      "Users 101 and 105 never formed a group, so they're absent rather than NULL — the clause order (WHERE before GROUP BY) is the exclusion mechanism. ORDER BY user_id orders the two survivors for the snapshot.",
    ],
    time: "O(n) — one scan; the range predicate is index-friendly (a time_stamp index applies — a strftime-wrapped column would force a full scan)",
    space: "O(u) — one row per user who logged in during 2020",
    followUps: [
      "Rewrite the filter as strftime('%Y', time_stamp) = '2020' — same rows on this seed, but the function wraps the column and any index on time_stamp goes unused.",
      "Add a login count per user: COUNT(*) rides in the same GROUP BY as MAX with no extra pass.",
      "Latest login per user across ALL years, with the year it fell in labeled — MAX in a CTE, strftime in the SELECT list.",
    ],
    related: ["game-play-analysis-i", "user-activity-for-the-past-30-days-i", "customers-who-never-order"],
    order: "any",
    xp: 10,
  },
];
