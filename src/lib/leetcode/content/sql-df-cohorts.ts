// Deep-dives — product-analytics SQL, task 72 file b2: cohort retention
// matrices, gap-based sessionization and A/B conversion lift (3 problems:
// 2 Medium, 1 Hard, all order:"exact" reads).
// Authored for the Product Analytics section: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_DF_COHORTS: LcSqlDive[] = [
  {
    slug: "cohort-retention-matrix",
    statement:
      "Growth tracks retention off two tables: users(user_id, signup_month) with signup_month as 'YYYY-MM', and activity(user_id, active_month) holding one row per month a user was active — a user who never activated has no activity rows at all. Each signup month forms one cohort, and cohort is the number of users signed up that month. M0 is the signup month itself, M1 one month later, M2 two months later, and a user counts as active at month offset N when one of their activity months sits exactly N months after their signup month. Report one row per signup month with the columns signup_month, cohort, m0_pct, m1_pct, m2_pct, each mN_pct = ROUND(100.0 * cohort users active at offset N / cohort, 1). Signup months with no users never appear. Order by signup_month ascending.",
    examples: [
      {
        input:
          "the 2026-06 cohort — user 101 active 2026-06, 2026-07 and 2026-08; user 102 active 2026-06 and 2026-07; user 103 active 2026-06, 2026-08 and 2027-01; user 104 signed up and logged no activity rows at all",
        output: "2026-06 · 4 · 75.0 · 50.0 · 50.0",
        explanation:
          "Three of the four users were active in their signup month (user 104 never at all), two survived to July and two were back in August — and user 103's January return sits seven months out, outside M0-M2 entirely.",
      },
      {
        input:
          "users 105 and 106 signed up 2026-07 and were active every month through 2026-09; users 107-110 signed up 2026-08 and none was ever active again",
        output: "2026-07 · 2 · 100.0 · 100.0 · 100.0, then 2026-08 · 4 · 100.0 · 0.0 · 0.0",
        explanation:
          "July is the perfect tiny cohort at 100 across the board, while August converts at signup and never again — m1 0.0 is the zero-return signature, and 2026-09's activity belongs to July's users only, so no 2026-09 row reports.",
      },
    ],
    constraints: [
      "m0_pct, m1_pct and m2_pct are ROUND(100.0 * distinct cohort users active exactly 0/1/2 month offsets after signup / cohort, 1) — the offset folds the year into the arithmetic, so 2027-01 is 7 months after 2026-06, never -5 or 95",
      "cohort counts USERS signed up that month, never activity rows; a user with no activity rows still counts toward cohort and still drags every percentage down",
      "columns signup_month, cohort, m0_pct, m1_pct, m2_pct, one row per signup month present in users, ordered by signup_month ASC",
    ],
    primer: {
      hook:
        "A retention matrix is how a growth team learns whether the users it signed up in a given month ever came back — and how quickly they drifted away.",
      concept: [
        "Product teams rarely judge users one at a time; they judge them by the month they arrived. A cohort is every user who signed up in the same calendar month, treated as one group that moves through time together — the way a school class moves through its grades together. Users from one month share the same onboarding screens, the same pricing page and the same campaign that brought them in, so comparing cohorts isolates what the product did that month from everything the users did afterwards. It is the closest thing growth has to a controlled comparison that costs nothing to run.",
        "Retention is the share of a cohort that comes back. A user counts as active in a month when their name shows up in the activity log for that month — opened the app, played a lesson, placed an order, whatever the product's heartbeat is. The matrix lays this out as a triangle: each signup month is a row, and the columns are ages, not calendar months — M0 is the signup month itself, M1 one month later, M2 two months later, always counted from each row's own start. Reading across a row shows one cohort decaying through life; reading down a column compares different cohorts at the same age, which is the apples-to-apples view that tells you whether March's onboarding rewrite held people better than February's.",
        "The picture is a triangle because of time itself: the newest cohort has only just signed up, so it has an M0 but no M1 or M2 yet, and each older row stretches one column further until the oldest rows run complete. In this report every cohort is old enough to fill all three columns, but a live dashboard keeps the triangle shape as its newest rows grow into it. The offsets are month arithmetic, not calendar labels — 2027-01 sits seven months after 2026-06, and the fold across the year has to survive the arithmetic.",
        "Two bookkeeping rules keep the numbers honest. The denominator is the signup count for that month — every user who signed up counts, including the ones who never came back at all, because the users who vanished are exactly what retention exists to measure. And active at offset N means present in that exact month, not on a streak: someone who shows up in June, skips July and returns in August is retained at M0 and M2 and lost at M1, which is why a column can tick back up instead of only decaying.",
      ],
      worked: [
        "Take the June cohort from the seed — users 101, 102, 103 and 104 signed up in 2026-06, so the row's denominator is 4.",
        "M0 is the signup month: 101, 102 and 103 were active in 2026-06 while 104 never logged a single event — 3 of 4, and 100.0 * 3 / 4 = 75.0.",
        "M1 is one month later: 101 and 102 returned, 103 sat July out, 104 is still gone — 2 of 4, so 50.0.",
        "M2 is two months later: 101 and 103 were back even though 103 had skipped a month — 2 of 4, so 50.0, and the dip-then-recover is legal because retention is membership in the month, not a streak.",
        "User 103's 2027-01 activity folds to an offset of (2027 * 12 + 1) - (2026 * 12 + 6) = 7 — far outside the M0-M2 window — so it counts toward no column and the row ships 75.0, 50.0, 50.0.",
      ],
      glossary: [
        { term: "cohort", def: "every user who signed up in the same month, followed forward as one group" },
        { term: "signup month", def: "the calendar month a user created their account — the cohort's shared starting line" },
        { term: "retention", def: "the share of a cohort that is active again at a given age" },
        { term: "month offset", def: "how many whole months after signup an activity month sits — 0, 1 or 2 here" },
        { term: "M0 / M1 / M2", def: "shorthand for offsets zero, one and two: the signup month, then one and two months later" },
        { term: "activation", def: "a user's first real action in the product — a user who never activated has no activity rows at all" },
      ],
      reallife: [
        "A growth team's weekly retention review runs on exactly this matrix, and it is usually the first dashboard an analytics group ships — Duolingo watches lesson weeks this way, Spotify watches listening weeks, Airbnb watches repeat-booking months. The report goes to the product managers and upward to whoever owns the growth model, because retention is the multiplier every forecast multiplies through. A cohort bending downward earlier than its neighbours sends the team digging — which channel fed it, which onboarding screen changed, which pricing test went live that month.",
        "What breaks in practice: tracking code that silently stops logging events makes a healthy product look like it is bleeding, duplicate activity rows inflate every numerator, and defining active too generously — counting a push notification opened by accident — flatters all three columns at once. Timezones bite too, since an event near midnight can land in the wrong month and shift an offset. The numbers drive real decisions — killing an acquisition channel whose cohorts never return, doubling down on an onboarding rewrite, pausing a paid campaign — and a wrong denominator quietly redirects all of that spend.",
      ],
      where:
        "Retention-matrix questions open growth and product-analytics interviews at consumer apps — Duolingo, Spotify, Airbnb, Netflix, Strava — because every one of those teams lives on this triangle.",
    },
    breakdown: [
      "The report runs on two grains at once: the row grain is signup months, but the counting grain is users inside a window that slides per user. The join is users LEFT JOIN activity on user_id — LEFT because a user with zero activity rows must still occupy their cohort's denominator, and an inner join would silently shrink the cohort and read m0 as a perfect 100.0. The month offset is real arithmetic, not string math: fold each 'YYYY-MM' into (year * 12 + month) and subtract, which makes 2027-01 exactly 7 months after 2026-06. Any shortcut that subtracts month numbers alone or casts the whole string to a number survives this seed by accident and corrupts the matrix the first time a cohort crosses a year.",
      "The pivot is conditional aggregation: COUNT(DISTINCT CASE WHEN month_offset = 0 THEN user_id END) counts the cohort members active in the signup month, and the = 1 and = 2 twins count the later windows. The DISTINCT matters even on clean data — the seed stores one row per user-month, but any duplicate activity row would inflate a COUNT(*) arm without it, and real event pipelines emit repeats. The denominator is COUNT(DISTINCT user_id) grouped by signup_month — the USER count, never the joined row count, which on the 2026-06 cohort is 9 rows (8 activity rows plus user 104's NULL-padded one) and would read m0 as 33.3 and m1 as 22.2. Percentages divide users by users, so the arm counts and the denominator must be computed over the same joined grain.",
      "The shape contract closes it out. GROUP BY signup_month produces one row per signup month that actually has users — 2026-09 has activity (users 105 and 106) but no signups, so it never reports, and no zero-fill machinery is wanted. ORDER BY signup_month ASC is safe on TEXT because 'YYYY-MM' is zero-padded, so '2026-06' < '2026-07' lexicographically is chronological. The final columns ship in the contract's order — signup_month, cohort, then the three rounded percentages — and the grader reads both the values and the row order literally.",
    ],
    edges: [
      "User 104 signed up 2026-06 and has no activity rows: an INNER JOIN erases them, the cohort reads 3 and m0 reads 100.0 — the LEFT JOIN keeps cohort 4 and the honest 75.0.",
      "User 103's 2027-01 row crosses the year boundary: month-only subtraction reads 1 - 6 = -5 and whole-string numeric casting reads 202701 - 202606 = 95, while the YYYY*12+MM fold reads 7 — both shortcuts dodge the M0-M2 windows on this seed by luck and will not on the next one.",
      "The 2026-06 cohort's LEFT JOIN carries 9 rows (8 activity rows plus user 104's NULL-padded one) over 4 users: dividing by the row count reads m0 as 33.3 and m1 as 22.2 — the denominator is COUNT(DISTINCT user_id), the signup count, not the join width.",
      "User 103 skips 2026-07 entirely and returns in 2026-08: retention at offset N is membership in that month, not streak logic, so m1 loses them (50.0) while m2 keeps them (50.0).",
      "2026-09 carries activity rows for users 105 and 106 but zero signups: GROUP BY signup_month over users keeps it out of the report — months with no signups never appear, and inventing a month dimension would ship phantom 0.0 rows.",
    ],
    ladder: [
      { title: "Brute force — pivot in the application", body: "Pull every user with their activity months, loop cohorts in code, and for each offset 0, 1 and 2 walk the member list testing membership. Three nested loops per cohort — the engine expresses the same walk as one join plus one grouped pass." },
      { title: "The pattern — LEFT JOIN, fold months, CASE-pivot", body: "LEFT JOIN activity onto users and compute month_offset = (YYYY*12 + MM of active) - (YYYY*12 + MM of signup) on every joined row. GROUP BY signup_month with COUNT(DISTINCT CASE WHEN month_offset = N THEN user_id END) arms over a COUNT(DISTINCT user_id) denominator." },
      { title: "The optimal idea — one grain for numerator and denominator", body: "O(U + A) over users U and activity rows A. The durable judgment: both arms of a ratio must count the same grain — users — so the LEFT JOIN lands once and the percentages stay comparable; and month offsets that can cross a year are folded arithmetic, never string subtraction." },
    ],
    approach: "LEFT JOIN activity onto users, fold YYYY-MM to year*12+month offsets, COUNT(DISTINCT CASE offset) arms over COUNT(DISTINCT user_id), GROUP BY signup_month",
    schema: {
      ddl: `CREATE TABLE users (
  user_id      INTEGER PRIMARY KEY,
  signup_month TEXT NOT NULL  -- 'YYYY-MM', one cohort per distinct month
);

CREATE TABLE activity (
  user_id      INTEGER NOT NULL REFERENCES users(user_id),
  active_month TEXT NOT NULL  -- 'YYYY-MM', one row per user-month active
);`,
      seed: `-- cohorts: 2026-06 partial decay (4 users) · 2026-07 perfect (2 users) · 2026-08 zero-return (4 users)
-- activity reaches 2026-09 and 2027-01, but NO signup months exist after 2026-08
INSERT INTO users (user_id, signup_month) VALUES
  (101, '2026-06'),
  (102, '2026-06'),
  (103, '2026-06'),
  (104, '2026-06'),  -- signs up and never logs a single activity row
  (105, '2026-07'),
  (106, '2026-07'),
  (107, '2026-08'),
  (108, '2026-08'),
  (109, '2026-08'),
  (110, '2026-08');

INSERT INTO activity (user_id, active_month) VALUES
  (101, '2026-06'),
  (101, '2026-07'),
  (101, '2026-08'),
  (102, '2026-06'),
  (102, '2026-07'),
  (103, '2026-06'),
  (103, '2026-08'),
  (103, '2027-01'),  -- late return: true offset 7 — the year-fold case
  (105, '2026-07'),
  (105, '2026-08'),
  (105, '2026-09'),
  (106, '2026-07'),
  (106, '2026-08'),
  (106, '2026-09'),
  (107, '2026-08'),
  (108, '2026-08'),
  (109, '2026-08'),
  (110, '2026-08');`,
      tables: [
        { name: "users", note: "10 users across three signup months — 2026-06 (4), 2026-07 (2), 2026-08 (4)" },
        { name: "activity", note: "18 distinct user-month rows — user 104 has none; user 103 returns in 2027-01, seven months out" },
      ],
    },
    code: `WITH spanned AS (
    SELECT
        u.user_id,
        u.signup_month,
        (CAST(substr(a.active_month, 1, 4) AS INTEGER) * 12
         + CAST(substr(a.active_month, 6, 2) AS INTEGER))
      - (CAST(substr(u.signup_month, 1, 4) AS INTEGER) * 12
         + CAST(substr(u.signup_month, 6, 2) AS INTEGER)) AS month_offset
    FROM users u
    LEFT JOIN activity a
      ON a.user_id = u.user_id          -- LEFT: a user with no rows still owns a denominator seat
)
SELECT
    signup_month,
    COUNT(DISTINCT user_id) AS cohort,  -- users signed up, never activity rows
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN month_offset = 0 THEN user_id END)
              / COUNT(DISTINCT user_id), 1) AS m0_pct,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN month_offset = 1 THEN user_id END)
              / COUNT(DISTINCT user_id), 1) AS m1_pct,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN month_offset = 2 THEN user_id END)
              / COUNT(DISTINCT user_id), 1) AS m2_pct
FROM spanned
GROUP BY signup_month
ORDER BY signup_month ASC;              -- zero-padded 'YYYY-MM' sorts chronologically as TEXT`,
    walkthrough: [
      "The spanned CTE joins each user to their activity months and folds every 'YYYY-MM' into year * 12 + month arithmetic: user 101 lands at offsets 0, 1 and 2 against 2026-06; user 103 at 0, 2 and 7 (the 2027-01 row); user 104's missing activity leaves one row with a NULL month_offset. The LEFT JOIN keeps user 104 in the set even though no a.* column survived the join. That one NULL row is what holds the 2026-06 cohort at 4 instead of letting an inner join shrink it to 3.",
      "GROUP BY signup_month folds the joined rows into three cohorts. 2026-06 counts 4 users with offset-0 arms for 101, 102 and 103 (m0 = 75.0), offset-1 for 101 and 102 (m1 = 50.0), offset-2 for 101 and 103 (m2 = 50.0). 2026-07 counts 2 users active at all three offsets for a flat 100.0 row, and 2026-08 counts 4 users active only in the signup month — m0 100.0, then 0.0 and 0.0.",
      "The 100.0 multiplier runs before the division so SQLite never truncates to integer. ROUND(..., 1) fires once per percentage at the very end, matching the contract's one-decimal shape. ORDER BY signup_month ASC ships 2026-06, 2026-07, 2026-08 — no 2026-09 row exists because that month has activity but no signups.",
    ],
    time: "O(U + A) — one LEFT JOIN scan over users U and activity rows A plus one grouped pass",
    space: "O(U + A) — the joined rows held until the pivot",
    followUps: [
      "Extend the matrix to M3 through M5 — do the CASE arms scale, or should a VALUES list of offsets drive a wider pivot, and where does the query stop being readable?",
      "Report absolute retained users beside the percentages — which column is just the CASE arm without the division, and what does the m1 count say that m1_pct hides?",
      "Split every percentage by a signup channel — where does the extra dimension enter the GROUP BY, and how does each cohort's denominator change shape?",
    ],
    related: ["restaurant-growth", "rolling-average-steps", "year-on-year-growth-rate"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "sessionize-events",
    statement:
      "The events table logs one row per user action: (user_id, event_ts) with timestamps written as 'YYYY-MM-DD HH:MM:SS', and the rows landed in whatever order the pipeline flushed them — not in time order. A session is a maximal run of one user's events in which every consecutive pair is at most 30 minutes apart; a gap strictly greater than 30 minutes closes the session, and the next event opens a new one. An event with no neighbors is a session of its own, lasting 0 minutes. Report the columns user_id, sessions (that user's session count) and avg_min = ROUND(AVG(duration), 1), where a session's duration in minutes is its last event's timestamp minus its first event's — idle stretches inside the run count toward the span. Order by user_id ascending.",
    examples: [
      {
        input:
          "user 204 fires at 2026-03-07 08:00:00 and 08:30:00 — exactly 30 minutes apart — then at 09:15:00, 09:22:00, 09:40:00 and 10:05:00 after the 45-minute lull",
        output: "204 · 2 · 40.0",
        explanation:
          "The exact 30-minute gap is 'at most 30', so 08:00-08:30 is one session with a 30-minute span; 09:15 opens the second, spanning 50 minutes — ROUND((30 + 50) / 2, 1) = 40.0.",
      },
      {
        input: "user 202 fires a single event at 2026-03-04 11:11:00 and nothing else all week",
        output: "202 · 1 · 0.0",
        explanation:
          "A lone event is a one-event session with duration 0.0 — forgetting that the FIRST event of each user starts a session (LAG IS NULL) deletes user 202's row instead.",
      },
    ],
    constraints: [
      "a new session starts at a user's first event and after any gap strictly greater than 30 minutes — a gap of exactly 30:00 stays inside the session",
      "a session's duration is its last event timestamp minus its first in minutes; a one-event session lasts 0.0 minutes and idle stretches inside the run count toward the span",
      "columns user_id, sessions, avg_min with avg_min = ROUND(AVG(duration), 1), one row per user present in events, ordered by user_id ASC",
    ],
    primer: {
      hook:
        "Sessionization is how a raw firehose of taps and pings becomes a visit a product team can reason about — how long someone stayed, and what they did while they were there.",
      concept: [
        "Every app logs its users' lives as events: one row per tap, per page view, per ping, each stamped with a timestamp — the recorded moment it happened. The log arrives as a shapeless stream, millions of rows in whatever order the servers flushed them, with no notion of a visit anywhere in it. Before anyone can ask how long people stay or where they wander, the stream has to be folded into sessions, and that folding is sessionization — the first transformation nearly every product-analytics pipeline runs.",
        "The industry's convention is a timeout wall: when one user's events sit more than 30 minutes apart, the wall falls between them, and everything on one side of the wall is a session. A session is a maximal run — it swallows events until a gap strictly over 30 minutes cuts it, which means an exactly-30-minute pause stays inside and a 30-minute-and-one-second pause cuts. The number predates most of the tools using it: web analytics settled on 30 minutes decades ago, and mobile dashboards, ad platforms and warehouses inherited it, which is why session counts from different vendors are at least arguing about the same shape.",
        "A session's duration is its span, not its activity: last event's timestamp minus first event's, idle stretches included. Someone who opens a page, reads for a few seconds, then sits idle for 25 minutes before tapping again has one 25-minute session with almost no activity in it — the span is the envelope around the behavior, and that is what makes sessions comparable across users. A lone event with no neighbors is still a session, just one that lasts 0.0 minutes.",
        "Two rules keep the cutting honest. The wall only ever compares a user against themselves — the gap between your evening tap and my midnight ping means nothing, so every comparison runs inside one user's own timeline, re-sorted by time before any gap is measured. And the wall measures elapsed time, not calendar walls: a run from 23:40 to 00:19 crosses midnight and stays one session, because 39 minutes have passed and 39 is all the rule sees.",
      ],
      worked: [
        "Sort user 204's six events into time order — 08:00, 08:30, 09:15, 09:22, 09:40, 10:05 — because the table landed them scrambled and gaps mean nothing until the timeline is straight.",
        "Measure each consecutive gap in minutes: 30, 45, 7, 18 and 25.",
        "Apply the wall — only a gap strictly over 30 minutes cuts: the 30-minute gap survives because exactly at the limit stays, the 45-minute gap cuts, and the small gaps never come close.",
        "Two sessions fall out: one running 08:00 to 08:30 with a 30-minute span, one running 09:15 to 10:05 with a 50-minute span.",
        "User 204's row reads 2 sessions averaging (30 + 50) / 2 = 40.0 minutes — and a seventh event at 14:00 would have opened a third session, not extended the second.",
      ],
      glossary: [
        { term: "event", def: "one logged user action — a tap, a page view, a ping — carrying its recorded time" },
        { term: "session", def: "a maximal run of one user's events in which every consecutive gap is 30 minutes or less" },
        { term: "sessionization", def: "folding a raw event stream into sessions by cutting wherever a long gap appears" },
        { term: "gap", def: "the elapsed time between one event and the same user's next" },
        { term: "30-minute wall", def: "the industry timeout convention — a gap strictly over 30 minutes ends the session" },
        { term: "session duration", def: "the span from a session's first event to its last, idle stretches included" },
      ],
      reallife: [
        "Every analytics organization runs this job, usually as a nightly pipeline owned by data engineering — Uber folds ride requests and app opens, Netflix folds play starts and pauses, Duolingo folds lesson events, and the 30-minute number is the same across Google Analytics, Amplitude and Mixpanel because sessions only mean something when everyone counts them the same way. The sessionized table feeds half the dashboards in the building: daily active users, average session length, feature adoption all read from it. When it is wrong, everything downstream is confidently wrong.",
        "What breaks in practice: background pings that fire every 20 minutes weld an entire day into one 24-hour session, server retries duplicate events, device clocks drift, and rows land out of order so any code that trusts arrival order measures nonsense. Teams tune the timeout too — a gaming studio may cut at 15 minutes because play bursts are short, while a banking app may stretch to 60 — which makes cross-company session counts non-comparable until the definitions are read side by side. The numbers drive real decisions — engagement targets, ad pricing, staffing for peak traffic — so a sessionization bug is never a cosmetic one.",
      ],
      where:
        "Sessionization is the canonical gaps-and-islands screen in data-engineering and product-analytics interviews at event-heavy companies — Uber, Netflix, Stripe, Duolingo, Amplitude.",
    },
    breakdown: [
      "This is gaps-and-islands over time: the table has no session column, so the query must manufacture session identities from the gaps between consecutive events. The word 'maximal' is the engine hint — a session absorbs every event until a gap strictly over 30 minutes arrives, and only then does the next event start a new island. That reduces each event to a binary question: is this event the START of a session? An event is a start when it is the user's first (no previous event at all) or when it sits more than 30 minutes after the user's previous event — LAG(event_ts) OVER (PARTITION BY user_id ORDER BY event_ts) puts the previous timestamp on every row, and the PARTITION BY is what stops one user's tail from being compared against the next user's head.",
      "Turning start flags into session ids is a running sum: SUM(is_start) OVER (PARTITION BY user_id ORDER BY event_ts) adds 1 exactly at starts, so every event inside the first session carries 1, the second session carries 2, and so on — the flag-and-running-sum pair enumerates the islands without recursion. The boundary needs the strictness call: at most 30 minutes stays in, so the flag tests gap > 1800 seconds, and the seed's user 204 fires at 08:00:00 and 08:30:00 exactly — a >= test would split that 30-minute session into two one-event sessions and read 204 as three sessions averaging 16.7 minutes. Comparing INTEGER epoch seconds (strftime('%s')) instead of julianday REAL differences is what makes 1800 > 1800 a clean false — the float path lands within a few billionths of 30 and the boundary becomes a coin flip.",
      "The last stage measures islands, not events: GROUP BY user_id, session_no with one MIN and one MAX of the timestamp gives each session its span, and the span is last-minus-first — user 205's fourth session holds three events around a 29-minute idle stretch and still measures 41 minutes, because duration is the envelope, not the sum of activity. A one-event session's MIN and MAX are the same timestamp, so it measures 0.0 without a special case. The outer GROUP BY user_id then counts sessions and averages their durations, and ORDER BY user_id ASC is the graded row order — insertion order in events is deliberately scrambled, so every stage that touches sequence must sort by event_ts explicitly.",
    ],
    edges: [
      "User 204's 08:00:00 to 08:30:00 pair is exactly 1800 seconds apart: the flag must test gap > 1800, and an >= test (or a julianday REAL difference, which lands within noise of 30.0) splits it into two one-event sessions and reads 204 as 3 sessions averaging 16.7.",
      "User 202's lone event at 2026-03-04 11:11:00 has LAG IS NULL: the first event of each user must count as a session start, or 202 vanishes from the report instead of shipping 1 session at 0.0 minutes.",
      "User 203's session runs 2026-03-05 23:40:00 to 2026-03-06 00:19:00 across midnight: epoch-second arithmetic folds the day boundary into one 2340-second span, while any bucketing by date would cut the session in half at 00:00:00.",
      "User 205's first inserted row is 12:02:00 — not their earliest event: LAG without ORDER BY event_ts (trusting insertion order) compares timestamps backwards and manufactures garbage gaps, which is why every window in the chain sorts by event_ts.",
      "User 205's fourth session spans 41 minutes but contains only 3 events around a 29-minute idle stretch: duration is MAX minus MIN of the session, not the sum of inter-event gaps, so idle time inside a session counts.",
    ],
    ladder: [
      { title: "Brute force — sort and walk in code", body: "Pull one user's events ordered by timestamp, walk the list splitting whenever a gap passes 30 minutes, and accumulate first, last and count per split. Repeat per user — the engine runs the same walk as three stacked window passes plus a grouped fold." },
      { title: "The pattern — flag starts, running-sum the islands", body: "LAG per user gives prev_ts, and a CASE stamps is_start = 1 on the first event and on any gap over 1800 seconds. SUM(is_start) OVER (PARTITION BY user_id ORDER BY event_ts) then turns the flags into per-user session numbers." },
      { title: "The optimal idea — measure islands, not events", body: "O(n log n) over n event rows, dominated by the window sorts. The durable rules: island boundaries come from a 0/1 start flag accumulated by a running sum, and a session's duration is the MIN-to-MAX envelope — a lone event is a 0.0-minute island, and idle stretches ride inside the envelope." },
    ],
    approach: "gaps-and-islands: LAG per user, 1800-second integer gap flag, running-SUM session ids, MIN/MAX epoch span per island, AVG per user",
    schema: {
      ddl: `CREATE TABLE events (
  user_id  INTEGER NOT NULL,
  event_ts TEXT    NOT NULL  -- 'YYYY-MM-DD HH:MM:SS', one row per user action
);`,
      seed: `-- 6 users · 14 sessions · inserted SCRAMBLED (never time order) · user 204's
-- first pair is exactly 30:00 apart · user 203 crosses midnight in-session
INSERT INTO events (user_id, event_ts) VALUES
  (206, '2026-03-09 22:44:00'),
  (206, '2026-03-09 21:00:00'),
  (206, '2026-03-09 23:05:00'),
  (206, '2026-03-09 21:18:00'),
  (206, '2026-03-09 22:30:00'),
  (206, '2026-03-09 22:52:00'),
  (205, '2026-03-08 12:02:00'),
  (205, '2026-03-09 09:00:00'),
  (205, '2026-03-08 07:05:00'),
  (205, '2026-03-08 18:47:00'),
  (205, '2026-03-08 12:00:00'),
  (205, '2026-03-08 07:44:00'),
  (205, '2026-03-09 09:41:00'),
  (205, '2026-03-08 18:30:00'),
  (205, '2026-03-08 12:03:00'),
  (205, '2026-03-08 07:09:00'),
  (205, '2026-03-08 18:38:00'),
  (205, '2026-03-09 09:12:00'),
  (205, '2026-03-08 07:15:00'),
  (205, '2026-03-08 07:30:00'),
  (204, '2026-03-07 10:05:00'),
  (204, '2026-03-07 08:00:00'),
  (204, '2026-03-07 09:22:00'),
  (204, '2026-03-07 08:30:00'),  -- exactly 30:00 after 08:00:00: same session
  (204, '2026-03-07 09:15:00'),
  (204, '2026-03-07 09:40:00'),
  (203, '2026-03-06 00:07:00'),
  (203, '2026-03-05 23:40:00'),
  (203, '2026-03-06 10:20:00'),
  (203, '2026-03-05 23:52:00'),
  (203, '2026-03-06 00:19:00'),
  (203, '2026-03-06 10:00:00'),
  (203, '2026-03-06 00:02:00'),  -- the run crosses midnight and stays one session
  (202, '2026-03-04 11:11:00'),  -- the lone event: 1 session, duration 0
  (201, '2026-03-02 15:01:00'),
  (201, '2026-03-02 09:00:00'),
  (201, '2026-03-03 20:25:00'),
  (201, '2026-03-02 14:35:00'),
  (201, '2026-03-02 09:04:00'),
  (201, '2026-03-02 14:30:00'),
  (201, '2026-03-02 09:07:00'),
  (201, '2026-03-03 20:10:00'),
  (201, '2026-03-02 14:52:00'),
  (201, '2026-03-02 09:12:00'),
  (201, '2026-03-02 14:38:00');`,
      tables: [
        { name: "events", note: "45 events from 6 users across 2026-03-02 to 2026-03-09 — 14 sessions, with user 202 firing once and user 203's longest run crossing midnight" },
      ],
    },
    code: `WITH ordered AS (
    SELECT
        user_id,
        event_ts,
        LAG(event_ts) OVER (PARTITION BY user_id ORDER BY event_ts) AS prev_ts
    FROM events
),
flagged AS (
    SELECT
        user_id,
        event_ts,
        CASE
            WHEN prev_ts IS NULL THEN 1   -- a user's first event always opens a session
            WHEN CAST(strftime('%s', event_ts) AS INTEGER)
               - CAST(strftime('%s', prev_ts) AS INTEGER) > 1800 THEN 1  -- gap over 30 min
            ELSE 0
        END AS is_start
    FROM ordered
),
numbered AS (
    SELECT
        user_id,
        event_ts,
        SUM(is_start) OVER (PARTITION BY user_id ORDER BY event_ts) AS session_no
    FROM flagged
),
sessions AS (
    SELECT
        user_id,
        session_no,
        (CAST(strftime('%s', MAX(event_ts)) AS INTEGER)
       - CAST(strftime('%s', MIN(event_ts)) AS INTEGER)) / 60.0 AS duration_minutes
    FROM numbered
    GROUP BY user_id, session_no
)
SELECT
    user_id,
    COUNT(*)                        AS sessions,
    ROUND(AVG(duration_minutes), 1) AS avg_min
FROM sessions
GROUP BY user_id
ORDER BY user_id ASC;`,
    walkthrough: [
      "The ordered CTE re-sequences every user's events with LAG OVER (PARTITION BY user_id ORDER BY event_ts), so each row carries its own previous timestamp regardless of insertion order — user 205's rows arrive starting at 12:02:00, but LAG sees 07:05:00 before it. prev_ts is NULL exactly at each user's first event, which the next stage turns into a session start. Because the window partitions by user_id, no row ever sees another user's timestamp as its previous.",
      "The flagged CTE stamps is_start: 1 on prev_ts IS NULL, 1 when the epoch-second gap CAST(strftime('%s', event_ts) AS INTEGER) minus the previous exceeds 1800, else 0. User 204's 08:00:00 to 08:30:00 gap is exactly 1800 seconds, so the strict > keeps it inside session 1, and user 205's 09:12:00 to 09:41:00 gap of 29 minutes stays inside their fourth session. Integer seconds make the boundary exact — a julianday REAL difference lands within noise of 30.0 and leaves the comparison to luck.",
      "The numbered CTE accumulates SUM(is_start) OVER (PARTITION BY user_id ORDER BY event_ts). Every event between two starts shares one session_no, so user 201's eleven events map to session_no 1, 2 and 3 without recursive machinery. The running sum adds 1 only where a session opens, which is what makes the island ids dense and stable.",
      "The sessions CTE groups by user_id, session_no and measures each island as MAX minus MIN of event_ts in epoch seconds over 60.0: user 203's midnight-crossing run measures 2340 seconds = 39.0 minutes, and user 202's single event measures 0.0. The outer SELECT folds the 14 islands into 6 user rows — 201: 3 sessions at 19.3; 202: 1 at 0.0; 203: 2 at 29.5; 204: 2 at 40.0; 205: 4 at 25.0; 206: 2 at 26.5. ORDER BY user_id ASC ships them in id order, the graded sequence.",
    ],
    time: "O(n log n) — the per-user window sorts (LAG, running SUM) dominate over n event rows",
    space: "O(n) — the staged CTE rows carried between window passes",
    followUps: [
      "Report each user's longest session beside the average — where does MAX(duration_minutes) sit in the final aggregation, and can a user with a 0.0 lone event still top a bursty user?",
      "Parameterize the timeout at 15 minutes — which single literal moves, and how does the session count for user 205 change once their 29-minute idle stretch starts splitting?",
      "Attach each session's event list via GROUP_CONCAT ordered by event_ts — what does the aggregation need so the concatenation follows time order inside each island?",
    ],
    related: ["customers-with-maximum-number-of-transactions-on-consecutive-days", "find-covid-recovery-patients", "rolling-average-steps"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "ab-test-conversion-lift",
    statement:
      "The assignments table records one row per experiment participant: (user_id, variant, converted), where variant is 'control' or 'treatment' and converted is 1 when the user converted inside the experiment window, 0 otherwise. Report one row per variant with the columns variant, users (participants assigned to it), conversions (the SUM of converted) and conv_pct = ROUND(100.0 * conversions / users, 1). Add lift_pp, the treatment's lift over control in percentage points: compute it from the RAW rates as ROUND(100.0 * raw_treatment_rate - 100.0 * raw_control_rate, 1) — rounded exactly once, at the end — and repeat the identical value on BOTH rows, the control row included. Order by variant ascending.",
    examples: [
      {
        input: "the control variant holds 20 users, 11 of whom converted",
        output: "control · 20 · 11 · 55.0 · 20.0",
        explanation:
          "conv_pct = ROUND(100.0 * 11 / 20, 1) = 55.0 — and the lift column reads 20.0, not 0.0 or NULL, because treatment-minus-control is an experiment-level metric repeated on every row.",
      },
      {
        input: "the treatment variant holds 20 users, 15 of whom converted",
        output: "treatment · 20 · 15 · 75.0 · 20.0",
        explanation:
          "The raw rates are 75.0 and 55.0 percentage points; their difference rounds once to 20.0 — both rows carry the same lift_pp and differ only in users, conversions and conv_pct.",
      },
    ],
    constraints: [
      "one row per variant with users = COUNT(*), conversions = SUM(converted) and conv_pct = ROUND(100.0 * conversions / users, 1)",
      "lift_pp = ROUND(100.0 * raw_treatment_rate - 100.0 * raw_control_rate, 1) computed from RAW rates and rounded once — identical on both rows, control included",
      "columns variant, users, conversions, conv_pct, lift_pp, ordered by variant ASC — 'control' sorts before 'treatment'",
    ],
    primer: {
      hook:
        "Conversion lift is the number a product team reads before shipping a change — the new experience measured against the old one, reduced to a single honest difference.",
      concept: [
        "An A/B test — most teams just call it an experiment — runs two worlds at once. Users are split at random: the control group keeps the current experience, the treatment group gets the change, and the randomization is the whole trick, because two groups drawn from the same population differ only by the change itself. Conversion is the goal action — bought the ticket, finished the subscription, clicked the button — recorded as a 1 or a 0 per participant.",
        "Each arm reports a conversion rate: conversions divided by participants, written as a percentage. Control converting 11 of 20 reads 55.0; treatment converting 15 of 20 reads 75.0. The lift is the difference between the two rates, measured in percentage points — one point is one tick of a rate, so 75.0 against 55.0 is a 20.0-point lift — and it belongs to the experiment as a whole, not to either row, which is why a report repeats the same lift on every line.",
        "The lift rides both denominators at once: each rate is a fraction whose bottom is that group's user count, so both group sizes are folded into the one shared number. That is why one extra conversion moves a small group far more than a big one — a single convert shifts a 20-user group's rate by a full 5.0 points but a 200-user group's by only 0.5 — and each rate passes its movement straight into the lift, one point for one point. In a winning readout the treatment bar is the taller one, and it is treatment's gains that push the shared number upward while control holds the baseline still — the bigger bar is where the lift's movement lives.",
        "The arithmetic has one honesty rule: subtract the raw rates — the unrounded ones — and round once at the very end. Rounding each rate first and subtracting afterwards compounds the error: a 1-in-3 rate against a 2-in-3 rate rounds to 33.3 and 66.7, whose difference reads 33.4, while the raw difference of 33.333 rounds to the honest 33.3. The same discipline guards the percentage itself — the 100.0 multiplier lands before the division, or an integer division truncates the whole rate to zero.",
      ],
      worked: [
        "Count each arm of the seed experiment: control holds 20 participants, treatment holds 20 — the equal split randomization owes you.",
        "Count conversions: 11 of the 20 control participants converted, and 15 of the 20 treatment participants did.",
        "Divide each arm's rate and keep it raw: 100.0 * 11 / 20 = 55.0 for control, 100.0 * 15 / 20 = 75.0 for treatment.",
        "Subtract the raw rates for the lift: 75.0 - 55.0 = 20.0 percentage points, rounded once — one number for the whole experiment, repeated on both report rows.",
        "Feel the denominators: one more control conversion would have read 12 of 20 = 60.0 and cut the lift to 15.0 — a single participant moved the shared number by 5.0 points, because 20 is a small group.",
      ],
      glossary: [
        { term: "A/B test", def: "an experiment that splits users at random so a change's effect can be read on its own" },
        { term: "variant", def: "one arm of the experiment — here control or treatment" },
        { term: "control", def: "the arm that keeps the current, unchanged experience" },
        { term: "treatment", def: "the arm that receives the change being tested" },
        { term: "conversion", def: "a participant completing the goal action inside the experiment window" },
        { term: "lift", def: "the treatment conversion rate minus the control rate, in percentage points" },
      ],
      reallife: [
        "Experimentation teams at Airbnb, Booking.com, Netflix, Uber and Duolingo produce hundreds of readouts like this one every week, and the table itself — users, conversions, rate, lift — is the artifact a data scientist carries into the ship-or-kill meeting. The lift decides: a large, trustworthy lift ships the new checkout flow to everyone, a flat one kills the idea, a noisy one buys another week of traffic. Guardrail metrics ride alongside — latency, unsubscribes, complaint rates — because a conversion gain that costs retention is a bad trade.",
        "What breaks in practice: teams peek at the readout on day two and ship a lift that was luck, the random split fails silently and one arm holds heavier users, bots inflate one variant, and novelty — the change being fresh rather than good — flatters the treatment in week one. A sample-ratio mismatch, where the two arms' user counts drift apart despite an assigned 50-50 split, is the classic tell that the plumbing is broken before any rate deserves trust. The numbers drive decisions worth real money, which is why the rounding and denominator rules above read as contracts, not style.",
      ],
      where:
        "Experimentation and data-science interviews at Airbnb, Booking.com, Netflix, Uber and Duolingo open with exactly this readout — rates, lift in percentage points, the rounding contract — before any talk of significance tests.",
    },
    breakdown: [
      "The readout mixes two grains in one report: per-variant aggregates (users, conversions, conv_pct) that a plain GROUP BY produces, and an experiment-level scalar — the lift — that needs BOTH variants' rates on the same row. No amount of grouping can see across groups: once the query is inside GROUP BY variant, the control row cannot read the treatment row. So the shape is two stages: aggregate once into a rates CTE with one row per variant, then join that CTE to itself so every output row carries both scalars. The join keys do the semantics — t pinned to 'treatment' and c to 'control' — and since each side is a single row, the self-join is a clean cross product of exactly two rows.",
      "The percentage arithmetic hides SQLite's favorite trap: converted is INTEGER, users is a COUNT, and SUM(converted) / COUNT(*) is INTEGER divided by INTEGER — control's 11 / 20 truncates to 0 and the whole report prints 0.0. The 100.0 must multiply FIRST: 100.0 * SUM(converted) / COUNT(*) promotes the division to float before it happens. Then the rounding order is a contract of its own: lift_pp subtracts the RAW rates (75.0 and 55.0 here) and rounds once, because subtracting already-rounded percentages compounds the error — a 1/3 vs 2/3 experiment rounds to 33.3 and 66.7, whose difference 33.4 disagrees with the raw difference's honest 33.3.",
      "The last judgment is what the control row's lift_pp means. The metric is a property of the experiment, not of the row — every row repeats ROUND(treatment - control, 1) = 20.0, and computing each row's lift as its own rate minus itself (0.0 on both) or leaving the control row NULL reads the contract backwards. ORDER BY variant ASC completes the shape: 'control' sorts before 'treatment' alphabetically, so the ASC keeps the paired rows deterministic, and the grader reads the two-row layout — same lift_pp on both — as part of the answer, not decoration.",
    ],
    edges: [
      "Control's 11 conversions over 20 users: SUM(converted) / COUNT(*) is integer division and truncates to 0 — writing ROUND(SUM(converted) / COUNT(*) * 100.0, 1) prints 0.0, so the 100.0 must come first (100.0 * SUM / COUNT).",
      "lift_pp is 20.0 on BOTH rows: a per-row self-comparison (rate minus itself) prints 0.0 twice, and a NULL arm on control breaks the two-identical-lifts contract — the experiment-level scalar rides every row.",
      "Swapping the join literals — t to 'control' and c to 'treatment' — prints -20.0: with two single-row sides the self-join never errors, it just flips the sign, so the keys must be read against the statement's direction.",
      "Misspelling a variant literal in the self-join yields zero rows with no error — the cross join matches nothing and the report silently empties, so literal spelling is load-bearing here.",
      "The round-once rule is invisible on this seed because 55.0 and 75.0 are one-decimal exact — the trap fires on repeating rates (a 1/3 vs 2/3 split rounds 33.4 where the raw difference rounds 33.3), which is why lift_pp is built from raw_pct before any ROUND.",
    ],
    ladder: [
      { title: "Brute force — two hand rates and a calculator", body: "Count users and conversions per variant in two queries, divide by hand, subtract, and paste the lift into both rows of the report. The engine version composes the same three numbers from one grouped pass and one self-join." },
      { title: "The pattern — rate CTE, then self-join the two rows", body: "GROUP BY variant into a rates CTE carrying users, conversions and the unrounded raw_pct. JOIN that CTE to itself ON the fixed literals so both scalars ride both rows, then ROUND the difference once at the end." },
      { title: "The optimal idea — an experiment-level scalar is a join, not a window", body: "O(n) over n assignment rows. The durable judgment: a metric defined BETWEEN groups cannot be computed inside GROUP BY — aggregate to one row per group first, then re-join the group rows; the conditional-aggregation twin (MAX(CASE WHEN variant = 'treatment' ...)) is the same idea flattened into one pass." },
    ],
    approach: "GROUP BY variant rate CTE cross-joined to itself, ROUND(raw difference) once, identical lift_pp on both rows, ORDER BY variant",
    schema: {
      ddl: `CREATE TABLE assignments (
  user_id   INTEGER PRIMARY KEY,
  variant   TEXT    NOT NULL,  -- 'control' or 'treatment'
  converted INTEGER NOT NULL   -- 1 converted inside the window, 0 otherwise
);`,
      seed: `-- control: 11 of 20 converted · treatment: 15 of 20 · variants interleaved by user_id
INSERT INTO assignments (user_id, variant, converted) VALUES
  (1,  'control',    1),
  (2,  'treatment',  1),
  (3,  'control',    0),
  (4,  'control',    1),
  (5,  'treatment',  1),
  (6,  'control',    1),
  (7,  'control',    0),
  (8,  'treatment',  0),
  (9,  'control',    1),
  (10, 'control',    1),
  (11, 'treatment',  1),
  (12, 'control',    0),
  (13, 'control',    1),
  (14, 'treatment',  1),
  (15, 'control',    0),
  (16, 'control',    1),
  (17, 'treatment',  1),
  (18, 'control',    0),
  (19, 'control',    1),
  (20, 'treatment',  0),
  (21, 'control',    0),
  (22, 'control',    1),
  (23, 'treatment',  1),
  (24, 'treatment',  1),
  (25, 'control',    0),
  (26, 'treatment',  1),
  (27, 'control',    1),
  (28, 'treatment',  0),
  (29, 'treatment',  1),
  (30, 'control',    0),
  (31, 'treatment',  1),
  (32, 'treatment',  0),
  (33, 'control',    1),
  (34, 'treatment',  1),
  (35, 'treatment',  1),
  (36, 'control',    0),
  (37, 'treatment',  0),
  (38, 'treatment',  1),
  (39, 'treatment',  1),
  (40, 'treatment',  1);`,
      tables: [
        { name: "assignments", note: "40 participants, 20 per variant — control converts 11 of 20, treatment 15 of 20" },
      ],
    },
    code: `WITH rates AS (
    SELECT
        variant,
        COUNT(*)       AS users,
        SUM(converted) AS conversions,
        100.0 * SUM(converted) / COUNT(*) AS raw_pct   -- RAW rate: 100.0 promotes BEFORE the divide
    FROM assignments
    GROUP BY variant
)
SELECT
    r.variant,
    r.users,
    r.conversions,
    ROUND(r.raw_pct, 1)             AS conv_pct,
    ROUND(t.raw_pct - c.raw_pct, 1) AS lift_pp      -- raw minus raw, rounded ONCE, on BOTH rows
FROM rates r
JOIN rates t ON t.variant = 'treatment'             -- the treatment rate rides every row
JOIN rates c ON c.variant = 'control'               -- ...compared against the control rate
ORDER BY r.variant ASC;                             -- 'control' sorts before 'treatment'`,
    walkthrough: [
      "The rates CTE folds 40 assignment rows into two: control arrives as users 20, conversions 11 and raw_pct 100.0 * 11 / 20 = 55.0, treatment as users 20, conversions 15 and raw_pct 75.0. The 100.0 multiplier sits BEFORE the division, so SQLite promotes to float first — the integer path 11 / 20 would have truncated to 0 and poisoned everything downstream. raw_pct stays unrounded on purpose: it is the evidence the lift needs.",
      "The self-join pins t to the 'treatment' row and c to the 'control' row, and because each side holds exactly one row, both output rows carry both raw rates. conv_pct rounds each row's own rate once (55.0 and 75.0), while lift_pp rounds the DIFFERENCE of the raw rates once — ROUND(75.0 - 55.0, 1) = 20.0 — identically on control and treatment. Subtracting the already-rounded conv_pct values would agree here only because both rates are one-decimal exact.",
      "ORDER BY r.variant ASC ships control first, then treatment, and the grader reads the pair as one shape: two rows differing only in variant, users, conversions and conv_pct, with the experiment-level 20.0 lift repeated on both. A swapped literal pair would have printed -20.0, and a self-comparison would have printed 0.0 — both silent failures the join keys exist to prevent. The shape is why the CTE carries raw_pct unrounded: the rounded conv_pct values are display, the raw rates are evidence.",
    ],
    time: "O(n) — one grouped scan over n assignment rows plus a two-row self-join",
    space: "O(v) — one rate row per variant (two here)",
    followUps: [
      "Report the lift as a relative ratio (treatment rate / control rate) instead of percentage points — where does the 100.0 multiplier move, and what happens to the rounding contract when the ratio has no natural decimal?",
      "Break the readout down per signup week — where does the extra dimension join into the rates CTE, and does lift_pp stay experiment-level or become one row per week pair?",
      "Flag reads that merit attention with a rough two-proportion z-score from users and conversions — which four aggregates feed the formula, and why can the query only flag the result rather than prove significance?",
    ],
    related: ["analyze-subscription-conversion", "customer-purchasing-behavior-analysis", "year-on-year-growth-rate"],
    order: "exact",
    xp: 20,
  },
];
