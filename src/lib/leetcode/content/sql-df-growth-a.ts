// Deep-dives — Data & Finance growth file A: week-over-week churn, median
// time-to-convert and rolling 7-day actives (3 problems: 2 Medium, 1 Hard,
// all order:"exact"). Original product-analytics phrasing — never copied
// problem text; dates are fixed literals so the engine snapshot is stable.
// Registry wiring (lead): 8013 week-over-week-churn ·
// 8014 median-time-to-convert · 8015 rolling-7d-actives.
import type { LcSqlDive } from "../types";

export const SQL_DF_GROWTH_A: LcSqlDive[] = [
  {
    slug: "week-over-week-churn",
    statement:
      "The events table logs one row per user-active day: (user_id, event_date), and one user can log several rows inside the same week. A growth team reads the product week-over-week: every week starts on a Monday (the Monday of each event_date, via the date arithmetic pinned in the constraints), and week 0 — the first week present in the data, starting 2026-08-03 — is the baseline and reports nothing. Every later week reports against the immediately preceding week: actives is the distinct users active that week, retained is the distinct users active that week AND the prior week, churned is the distinct users active in the prior week but NOT that week, and churn_rate = ROUND(100.0 * churned / prior-week actives, 1) divides by the prior week's actives. Report the columns week_start, actives, retained, churned and churn_rate for every week after the baseline, ordered by week_start ascending.",
    examples: [
      {
        input:
          "week 1 (Monday 2026-08-10): week 0's ten users 1-10 — users 9 and 10 do not return, users 11, 12 and 13 arrive",
        output: "2026-08-10 · 11 · 8 · 2 · 20.0",
        explanation:
          "actives 11 = the 8 returning users 1-8 plus newcomers 11/12/13; retained 8, churned 2 (users 9 and 10), and the rate divides by WEEK 0's 10 actives — the population at risk: 100.0 * 2 / 10 = 20.0.",
      },
      {
        input:
          "week 2 (Monday 2026-08-17): users 1-7 and 12 come back, user 9 (a week-0 user who skipped week 1) returns, users 14 and 15 arrive — week-1 users 8 and 11 are gone",
        output: "2026-08-17 · 12 · 9 · 2 · 18.2",
        explanation:
          "retained counts only week-1 actives back (9), so user 9's return is NOT a retention; churned 2 includes newcomer user 11, and the rate divides by week 1's 11 actives: 100.0 * 2 / 11 = 18.1818 → 18.2.",
      },
    ],
    constraints: [
      "events holds one row per user-active day and a user may log several rows inside one week (user 1 triples inside week 0, users 2, 9 and 12 double), so every count is over DISTINCT users; all event dates fall Tue–Sun inside the three weeks starting Monday 2026-08-03, 2026-08-10 and 2026-08-17",
      "week_start = date(event_date, '-' || ((CAST(strftime('%w', event_date) AS INTEGER) + 6) % 7) || ' days') — the Monday that opens each date's week — and churn_rate = ROUND(100.0 * churned / prior-week actives, 1) divides by the PRIOR week's actives, never this week's",
      "the first week present (2026-08-03) is the baseline and reports nothing; every later week reports actives, retained (active that week AND the prior week) and churned (active in the prior week but not that week) against the immediately preceding week — the seed's weeks are consecutive Mondays",
      "columns week_start, actives, retained, churned, churn_rate — actives/retained/churned INTEGER, churn_rate a REAL rounded to 1 decimal — ORDER BY week_start ASC",
    ],
    primer: {
      hook:
        "Week-over-week churn is the growth team's smoke alarm — it counts the users who stood on the porch last week and never came back this week, while they can still be won back.",
      concept: [
        "Growth teams read products at week grain because a single day is mostly noise — a phone died, a holiday happened, a push notification misfired. The unit of account is the active week: a user is active in a week if they log at least one event between its Monday and its Sunday, however many rows they log. Picture each week as a porch: the users active last week are standing on it when the new week opens, and by its end each of them has either stepped back inside or walked away. The walkers are churn, and churn is always defined against the week that just departed — users active in week W-1 but absent from week W.",
        "The churn rate divides churned by the prior week's actives, and that denominator is not a stylistic choice — it is the population at risk. Only users who were around last week had the option of leaving this week, so they are the only ones who can count as churned; a newcomer who never returns cannot churn in the week they arrived, because there is no prior week to leave. Dividing by this week's actives instead folds newcomers into the denominator and understates the rate. The audit identity falls straight out of the definition: prior actives = retained + churned, because everyone on the porch either came back or did not.",
        "Retention and churn are two readings of the same two sets, and both demand adjacency — the immediately preceding week, not merely some earlier activity. The seed's user 9 shows the trap: active in week 0, gone all of week 1, back in week 2, they count toward week 2's actives but not its retained, because their previous activity week is week 0, not week 1. A return like that is a resurrection, and growth teams track it as its own lever; folding resurrections into retention flatters the number and hides a re-engagement win.",
        "One bookkeeping rule keeps every count honest: the events table logs one row per user-active day, so a user can appear several times inside one week and every count must be over distinct users — user 1 logs three rows in week 0 and still counts once. Churn also has a direction problem: an absent user leaves no row behind in the week they miss, so the number is attributed forward. Users 9 and 10 quit after week 0, and their churn lands on week 1, the first week they could have shown up and did not.",
      ],
      worked: [
        "Week 0 — Monday 2026-08-03 — is the baseline: the seed logs users 1 through 10, so the porch holds ten actives and the baseline week itself reports nothing.",
        "Week 1 — Monday 2026-08-10 — users 1-8 log again and newcomers 11, 12 and 13 arrive: actives = 8 + 3 = 11.",
        "Retained reads the overlap: users 1-8 stood on both porches, so retained = 8. Churned reads the departure: users 9 and 10 never logged in week 1, so churned = 2, and the identity audits: 10 = 8 + 2.",
        "The rate divides by the week that just departed: 100.0 * 2 / 10 = 20.0 — dividing by this week's 11 instead would read 18.2, a rate about a pool that was never at risk.",
        "Week 2 sharpens both edges: users 8 and 11 leave (churned = 2 against week 1's 11 actives, 100.0 * 2 / 11 = 18.2), while user 9 — active in week 0, absent in week 1, back in week 2 — lifts actives to 12 while retained stays 9, because their previous activity week is week 0, not week 1.",
      ],
      glossary: [
        { term: "churn", def: "users active last week who logged nothing this week" },
        { term: "retention", def: "users active this week and the week before, two weeks running" },
        { term: "population at risk", def: "the prior week's actives — the only users who could churn this week" },
        { term: "baseline week", def: "the first week in the data, which reports nothing because it has no prior week" },
        { term: "resurrection", def: "a user back after skipping at least one full week — active again, not retained" },
        { term: "week-over-week", def: "comparing a week's number against the immediately preceding week rather than a fixed start" },
      ],
      reallife: [
        "At a consumer app this report is run by the growth data team and read first in the weekly growth meeting, where the product lead opens with the same slide: actives, retained, churned, rate. Each lever under the number gets an owner — newcomers arrive, retained stay, resurrected come back, churned leave — and a rising rate sends the team into the segments before it sends them into the code. Consumer apps from Duolingo to Bumble run this exact cut every Monday, because a churn problem caught at week 2 is a campaign, and a churn problem caught at quarter-end is a replatform.",
        "What breaks in practice: event pipelines that double-log inflate every count unless the queries are distinct-safe; a week boundary defined by server time instead of user time silently moves users between porches; and resurrected users folded into retention make a fading product look stable. The sharpest argument is always the denominator — a dashboard dividing by the current week's actives reads calmer every week exactly when things are worst, because the shrinking base hides the losses. The numbers drive real decisions: pausing a paid channel whose cohorts churn out, sizing a win-back campaign from the churned count, and re-cutting onboarding when week-1 churn climbs.",
      ],
      where:
        "Growth and product-analytics interviews at consumer apps — Duolingo, Spotify, Bumble, Calm — open with week-over-week churn and retention before moving on to cohort matrices.",
    },
    breakdown: [
      "Week-over-week churn is a set story told at week grain: each output week asks three questions about two sets — who was active this week, who of this week's users were also active last week (retained), and who of LAST week's users vanished (churned). The churn rate then divides churned by the prior week's actives, because the prior week's population is the population at risk — those are the only users who could have churned. That denominator choice is the contract's sharpest edge: week 2 churns 2 of week 1's 11 actives for 18.2, while dividing by this week's 12 actives reads a phantom 16.7. The identity prior actives = retained + churned (10 = 8 + 2, then 11 = 9 + 2) audits every row the query ships.",
      "Retention is adjacency, and adjacency is where the resurrected user lives. User 9 is active in week 0, skips week 1 entirely and returns in week 2 — user 9 WAS active before week 2, but the immediately preceding week is week 1, so the return is a resurrection and retained must not count it. A LAG(week_start) comparison against exactly seven days back encodes adjacency: a user whose previous activity week sits fourteen days back reads 0 and lands in actives only. Churn needs the mirror image and cannot be read off any single row — a user absent from week 2 leaves no week-2 row behind — so the pivot emits churn forward: each row whose NEXT activity week is not exactly seven days ahead declares its user departed after this week, and the departure lands on week + 7.",
      "The pivot is the centerpiece: weeks collapses the 39 event rows to 33 (user, week) pairs, and LAG and LEAD over each user's ordered weeks turn every pair into a classification. The weekly CTE counts actives and retained per week with conditional aggregation, the departed CTE lands churned counts on week + 7, and rated's LAG(actives) fetches the prior-week denominator without a self-join. The baseline falls out naturally: week 0 has no prior week in the data, so WHERE week_start > MIN(week_start) drops it — and week 2's departed rows (users whose next week never comes) land on 2026-08-24, a week the report never emits.",
    ],
    edges: [
      "User 9 resurrects: active week 0, absent week 1, back in week 2 — they count toward week 2's actives (12) but not retained (9), because retained counts week-1 actives only; any read that credits prior activity in general ships 10.",
      "The rate divides by the PRIOR week: week 2 is 100.0 * 2 / 11 = 18.2, while this week's 12 as denominator reads 16.7 — the denominator is the population at risk, pinned by the contract.",
      "Churn counts newcomers: user 11 arrives brand-new in week 1 and churns in week 2 — a prior-week active is a prior-week active, regardless of tenure.",
      "Week 0 is the baseline and reports nothing: it has no prior week to compare against, and its own churn (users 9 and 10) belongs to week 1, attributed forward — while week 2's departures land on 2026-08-24, outside the data.",
      "A COUNT of rows is not a COUNT of users: user 1 logs three week-0 rows and user 2 doubles in weeks 0 and 1 — a naive COUNT(*) reads 13/12/14 weekly rows where the truth is 10/11/12 distinct users.",
    ],
    ladder: [
      {
        title: "Brute force — two sets per week in application code",
        body: "For each week, build this week's user set and last week's user set, intersect for retained, diff for churned, then divide. Three weeks is doable by hand, but the sets get rebuilt from scratch every week and the Monday arithmetic hides in date bookkeeping.",
      },
      {
        title: "The pattern — a per-user week pivot with LAG",
        body: "Collapse events to one (user, week) row per active week, then LAG each user's weeks: exactly-seven-days-back marks active_prev, and LEAD exposes the next activity week. Per-week conditional counts read actives and retained, and rows whose next week skips forward land churn on week + 7.",
      },
      {
        title: "The optimal idea — sort once per user, aggregate once per week",
        body: "One window sort per user plus one GROUP BY per week, O(n log n) over the n event rows. The durable rules: adjacency is a seven-day comparison, churn is attributed forward to the week after the gap, and the rate divides by the prior week — the identity prior actives = retained + churned audits every row for free.",
      },
    ],
    approach:
      "per-user week pivot with LAG (active_prev = previous activity week exactly 7 days back), conditional counts per week, forward-attributed churn landed on week + 7, LAG(actives) feeding ROUND(100.0 * churned / prior_actives, 1)",
    schema: {
      ddl: `CREATE TABLE events (
  user_id    INTEGER NOT NULL,
  event_date TEXT    NOT NULL  -- 'YYYY-MM-DD', one row per user-active day
);`,
      seed: `-- 15 users over three Monday weeks: week 0 (Aug 4-9) holds users 1-10,
-- week 1 (Aug 11-16) brings back 1-8 and adds newcomers 11/12/13, week 2
-- (Aug 18-23) keeps 1-7 and 12/13, resurrects user 9 (a week-0 user who
-- skipped week 1) and adds 14/15 — users 8 and 11 leave after week 1.
-- Users 1, 2, 9 and 12 log multiple rows inside one week: count DISTINCT
INSERT INTO events (user_id, event_date) VALUES
  (1, '2026-08-04'),
  (1, '2026-08-06'),
  (1, '2026-08-08'),  -- user 1: three week-0 rows, still ONE user
  (2, '2026-08-05'),
  (2, '2026-08-09'),
  (3, '2026-08-04'),
  (4, '2026-08-05'),
  (5, '2026-08-06'),
  (6, '2026-08-07'),
  (7, '2026-08-08'),
  (8, '2026-08-09'),
  (9, '2026-08-05'),
  (10, '2026-08-07'),
  (1, '2026-08-11'),
  (2, '2026-08-12'),
  (2, '2026-08-15'),  -- user 2: two week-1 rows
  (3, '2026-08-13'),
  (4, '2026-08-14'),
  (5, '2026-08-16'),
  (6, '2026-08-11'),
  (7, '2026-08-12'),
  (8, '2026-08-14'),
  (11, '2026-08-13'), -- brand-new in week 1, churns in week 2
  (12, '2026-08-15'), -- brand-new in week 1, retained in week 2
  (13, '2026-08-16'), -- brand-new in week 1, retained in week 2
  (1, '2026-08-18'),
  (9, '2026-08-19'),  -- user 9 resurrects: week 0, skipped week 1, back in week 2
  (9, '2026-08-22'),
  (2, '2026-08-18'),
  (3, '2026-08-19'),
  (4, '2026-08-20'),
  (5, '2026-08-21'),
  (6, '2026-08-22'),
  (7, '2026-08-23'),
  (12, '2026-08-20'),
  (12, '2026-08-23'), -- user 12: two week-2 rows
  (13, '2026-08-19'),
  (14, '2026-08-21'), -- users 14 and 15: brand-new in week 2
  (15, '2026-08-22');`,
      tables: [
        {
          name: "events",
          note: "39 event rows from 15 users across the three Monday weeks of 2026-08-03/10/17 — user 1 triples inside week 0 and users 2, 9 and 12 double inside their weeks",
        },
      ],
    },
    code: `WITH weeks AS (
    -- one row per (user, week): the Monday-shift expression folds every
    -- event date onto the Monday that opens its week, and DISTINCT
    -- collapses a user's multi-row weeks to one activity row
    SELECT DISTINCT
        user_id,
        date(event_date, '-' || ((CAST(strftime('%w', event_date) AS INTEGER) + 6) % 7) || ' days') AS week_start
    FROM events
),
pivoted AS (
    -- the per-user week timeline: LAG(week_start) is this user's PREVIOUS
    -- activity week — exactly 7 days back means they were active last week
    SELECT
        user_id,
        week_start,
        CASE WHEN LAG(week_start) OVER (PARTITION BY user_id ORDER BY week_start)
                  = date(week_start, '-7 days') THEN 1 ELSE 0 END AS active_prev,
        LEAD(week_start) OVER (PARTITION BY user_id ORDER BY week_start) AS next_week
    FROM weeks
),
weekly AS (
    -- actives and retained read straight off this week's pivot rows
    SELECT
        week_start,
        COUNT(*) AS actives,
        SUM(active_prev) AS retained
    FROM pivoted
    GROUP BY week_start
),
departed AS (
    -- churn is computed FORWARD: a pivot row whose next activity week is
    -- not exactly 7 days ahead means the user left after this week
    SELECT date(week_start, '+7 days') AS week_start
    FROM pivoted
    WHERE next_week IS NULL
       OR next_week > date(week_start, '+7 days')
),
churned AS (
    -- the departures land on week + 7 and group per leaving week
    SELECT week_start, COUNT(*) AS churned
    FROM departed
    GROUP BY week_start
),
rated AS (
    -- the churn denominator is the PRIOR week's actives, via LAG
    SELECT
        w.week_start,
        w.actives,
        w.retained,
        COALESCE(c.churned, 0) AS churned,
        LAG(w.actives) OVER (ORDER BY w.week_start) AS prior_actives
    FROM weekly w
    LEFT JOIN churned c ON c.week_start = w.week_start
)
SELECT
    week_start,
    actives,
    retained,
    churned,
    ROUND(100.0 * churned / prior_actives, 1) AS churn_rate  -- 100.0 forces REAL division
FROM rated
WHERE week_start > (SELECT MIN(week_start) FROM weeks)       -- week 0 is the baseline
ORDER BY week_start ASC;`,
    walkthrough: [
      "The weeks CTE folds every event date onto its Monday: strftime('%w') reads 0 on Sunday through 6 on Saturday, so (w + 6) % 7 days back lands each date on its week's Monday — Aug 9 (Sunday) folds 6 days back to Aug 3, Aug 11 (Tuesday) 1 day back to Aug 10, Aug 16 back to Aug 10, Aug 18 back to Aug 17 and Aug 23 back to Aug 17. DISTINCT then collapses the 39 event rows to 33 (user, week) pairs — 10 users in week 0, 11 in week 1, 12 in week 2 — because users 1, 2, 9 and 12 log several rows inside single weeks. The output column week_start is born here as the 'YYYY-MM-DD' string the contract reports.",
      "The pivot hangs a LAG and a LEAD off each user's ordered weeks. Users 1-8 carry a 7-day gap week over week and read active_prev = 1; user 9's previous activity week is Aug 3 while week 2 minus 7 days is Aug 10, so their week-2 row reads 0 — resurrected, not retained; users 11, 12 and 13 have no previous week at all and read 0. The departed CTE works the forward direction: user 9's and user 10's week-0 rows have no activity exactly 7 days ahead, so their churn lands on 2026-08-10; user 11's week-1 row lands on 2026-08-17; user 8's week-1 row points exactly 7 days ahead (Aug 17) and departs nobody — and every week-2 row lands on 2026-08-24, a week the spine never reports.",
      "The rated CTE joins the per-week arms and fetches the denominator with LAG(actives): week 1 reads actives 11, retained 8, churned 2, prior actives 10 — 100.0 * 2 / 10 = 20.0 — and week 2 reads actives 12, retained 9, churned 2, prior actives 11 — 100.0 * 2 / 11 = 18.1818 → 18.2. The identity holds on both rows: 10 = 8 + 2 and 11 = 9 + 2. WHERE week_start > MIN(week_start) drops the 2026-08-03 baseline, and ORDER BY week_start ASC ships the two rows — (2026-08-10, 11, 8, 2, 20.0) then (2026-08-17, 12, 9, 2, 18.2).",
    ],
    time: "O(n log n) over the n event rows — one window sort per user for the pivot plus the GROUP BY per week",
    space: "O(u × w) — one pivot row per active user-week (33 here) plus the per-week aggregates",
    followUps: [
      "Extend the pivot to full growth accounting: add new (no earlier week at all) and resurrected columns beside retained — which CASE arm splits, and what does week 2 read for each lever?",
      "Report monthly churn with the same shape — where does the Monday-shift expression break (month lengths vary), and how do users active in both edge months anchor the calendar comparison?",
      "Build a recursive week spine from MIN to MAX so a zero-activity week reports 0 actives — what happens to LAG(actives) and the churn denominator when a week is missing from the data?",
    ],
    related: ["growth-accounting", "dau-wau-stickiness", "cohort-retention-matrix"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "median-time-to-convert",
    statement:
      "The users table holds one row per account: (user_id, signup_date), and the orders table logs purchases: (order_id, user_id, order_date, amount_cents). A growth team reads time-to-convert per signup-month cohort: cohort_month is strftime('%Y-%m', signup_date), cohort_size counts EVERY user who signed up that month, converted counts users with at least one order, and unconverted = cohort_size - converted. For converted users only, days_to_first_order = CAST(julianday(first_order_date) - julianday(signup_date) AS INTEGER) with first_order_date = MIN(order_date) of that user, and median_days is the median of those day counts — computed WITHOUT a MEDIAN function, via the row-number emulation pinned in the constraints. Report the columns cohort_month, cohort_size, converted, unconverted and median_days (the median rounded to 1 decimal place) for every cohort, ordered by cohort_month ascending.",
    examples: [
      {
        input:
          "cohort 2026-07 signs up 5 users; users 1/2/3/4 convert after 0, 2, 3 and 10 days (user 2 orders again on day 25), user 5 never orders",
        output: "2026-07 · 5 · 4 · 1 · 2.5",
        explanation:
          "n = 4 converted days (0, 2, 3, 10) puts the middles at ranks 2 and 3: AVG(2, 3) = 2.5 — and user 2's day-25 second order is ignored because MIN(order_date) pins the clock at day 2.",
      },
      {
        input:
          "cohort 2026-09 signs up 6 users; users 10-14 convert after 3, 7, 12, 14 and 30 days, user 15 never orders",
        output: "2026-09 · 6 · 5 · 1 · 12.0",
        explanation:
          "odd n = 5 collapses the mirror to the single middle rank 3 — day 12 — because (n+1)/2 and (n+2)/2 both read 3 under INTEGER division.",
      },
    ],
    constraints: [
      "cohort_month = strftime('%Y-%m', signup_date); cohort_size counts EVERY user signed up that month, converted counts users with at least one order, unconverted = cohort_size - converted — every seeded cohort converts at least one user, so no median is NULL",
      "days_to_first_order = CAST(julianday(MIN(order_date)) - julianday(signup_date) AS INTEGER), over CONVERTED users only — the FIRST order pins the clock and later orders never move it; median_days = ROUND(median of those day counts, 1)",
      "the median is emulated WITHOUT a MEDIAN function: rn = ROW_NUMBER() OVER (PARTITION BY cohort_month ORDER BY days, user_id), n = COUNT(*) OVER (PARTITION BY cohort_month), and the median averages the rows where rn IN ((n+1)/2, (n+2)/2) under INTEGER division — the two middles for even n, the single middle for odd n",
      "columns cohort_month, cohort_size, converted, unconverted, median_days — the first four INTEGER, median_days a REAL rounded to 1 decimal — ORDER BY cohort_month ASC",
    ],
    primer: {
      hook:
        "Time-to-convert is the growth team's stopwatch — it measures how many days a new signup needs to reach a first order, and the median keeps the stopwatch honest when a few stragglers take forever.",
      concept: [
        "Every product that turns visitors into buyers has a moment worth measuring: the conversion, a signup's first order. Growth teams group signups into signup-month cohorts — everyone who created an account in the same calendar month is one cohort — and follow each cohort forward. The cohort's size counts every signup, converted or not; the converted count only those who have ordered; the rest are the unconverted, still waiting. Reading by cohort rather than by order month keeps the story straight: user 9 in the seed signs up on 2026-08-21 and first orders on 2026-09-01, and that conversion belongs to the August cohort no matter which month the order lands in.",
        "The clock starts at signup and stops at the first order — later orders never move it. The seed's user 2 orders on day 2 and again on day 25, and only the first order pins the stopwatch at 2; a report built on the latest order would read the same user differently every time they buy again. Days are counted as whole days between the two dates, so a same-day order converts at day 0. One clock per user, one number per user — that is what makes the list behind the median well-defined.",
        "Now the median, and why growth teams report it instead of the mean. The median is the middle of the sorted day list — half the converted users got there faster, half slower. The mean, the plain average, has no such armor: one straggler who converts 90 days after signup drags the mean upward while leaving the median exactly where it was. Take the tiny list 0, 2, 3, 10: the median is 2.5 and the mean 3.75; swap that 10 for a 90 and the mean jumps to 23.75 while the median stays 2.5. Medians answer what the typical buyer experiences, and onboarding decisions — when to fire the reminder email, how long a trial should run — are made about the typical buyer.",
        "SQLite has no MEDIAN function, so the report builds one from row numbers: sort each cohort's day list, number the rows, and keep the middle rank — or the two middle ranks when the list holds an even number of users. The trick that covers both parities with one filter is integer division: for a list of n values, the ranks (n+1)/2 and (n+2)/2 name the same row when n is odd and the two neighboring middles when n is even, so averaging whatever the filter keeps always lands on the median. The unconverted never enter the list at all — a user with no order has no days to contribute, and inventing a placeholder like 0 would pretend they converted instantly, dragging the median down.",
      ],
      worked: [
        "Cohort 2026-07 from the seed signs up five users; users 1, 2, 3 and 4 convert, and user 5 never orders.",
        "Read each converter's clock off the seed: user 1 orders the day they sign up (day 0), user 2's first order lands on day 2 — their day-25 second order is ignored — user 3 on day 3, user 4 on day 10.",
        "Sort the four day counts: 0, 2, 3, 10 — an even list, so the middles sit at ranks 2 and 3: the days 2 and 3.",
        "Average the two middles: (2 + 3) / 2 = 2.5 — the median this cohort reports.",
        "Feel the median's armor: the mean of the same list is 15 / 4 = 3.75, already dragged above the median by user 4's 10-day tail — a straggler converting on day 90 would push the mean to 23.75 while the median never budges from 2.5.",
      ],
      glossary: [
        { term: "cohort", def: "every user who signed up in the same month, followed together" },
        { term: "conversion", def: "a user's first order — the moment a signup becomes a buyer" },
        { term: "time-to-convert", def: "whole days between signup and that first order" },
        { term: "median", def: "the middle of a sorted list — half the values sit below it, half above" },
        { term: "mean", def: "the plain average, sum divided by count, dragged upward by extreme values" },
        { term: "unconverted", def: "a user with no order yet — counted in the cohort, absent from the day list" },
      ],
      reallife: [
        "At a marketplace or subscription business this report belongs to the growth or product-analytics team, run on a fixed weekly cadence and sliced by signup cohort and channel. The number decides where onboarding effort goes: a median that stretches from 2 days to 9 sends the team walking the funnel step by step, comparing this month's signup-to-first-order path against the last. Marketing reads the same table the other way — channels are judged not by how many signups they buy but by how fast those signups reach a first order, because a cheap signup that never converts is expensive.",
        "What breaks in practice: the newest cohort always looks slowest, because its members have had the least calendar time to convert — a report that forgets this censoring declares an onboarding emergency every month-end. Duplicate or refunded orders can move a careless first-order clock, time zones can turn a same-day conversion into day minus one, and tiny cohorts make the median jumpy, one new signup swinging it by days. Teams that survive these traps publish the median beside the converted count and the cohort size, so every reader can see how much behavior stands behind the middle.",
      ],
      where:
        "Product-analytics and growth interviews at Notion, Spotify, Robinhood and marketplace teams lean on this pairing — time-to-convert plus build-a-percentile-without-a-PERCENTILE-function.",
    },
    breakdown: [
      "Time-to-convert is a cohort metric, so the first question is who belongs in each denominator: cohort_size counts EVERY user who signed up that month, converted or not — users 5 and 15 never order and still sit in their cohorts as unconverted. The median then narrows to converted users only, because a never-ordered user has no days-to-first-order to contribute; inventing a sentinel (days = 0) drags cohort 2026-07's median from 2.5 to 2.0 and cohort 2026-09's from 12.0 to 9.5. The clock is the FIRST order: user 2 orders on day 2 and again on day 25, and only MIN(order_date) keeps the clock at 2.",
      "SQLite has no MEDIAN aggregate, so the report builds one from row numbers: order each cohort's day list ascending, number the rows with ROW_NUMBER, size the cohort with COUNT(*) OVER, and keep the rows whose rank hits (n+1)/2 or (n+2)/2 under INTEGER division. The two expressions are a mirror trick — for even n they read different ranks (n = 4 gives ranks 2 and 3, whose days average to the median), for odd n both read the same rank (n = 5 gives 3 and 3, and the single middle day survives the AVG). The unconditional shortcut rn IN (n/2, n/2+1) breaks exactly the odd case: cohort 2026-09's n = 5 would average ranks 2 and 3 — days 7 and 12 — and report 9.5 instead of 12.0. ORDER BY days, user_id inside the window makes the ranking deterministic when days tie (users 6 and 7 both convert in 2 days), even though the median itself is order-insensitive among tied values.",
      "Cohorts own their users, not their orders: user 4 signs up in July, orders in July and again in August, and both orders feed the 2026-07 cohort's story; user 9 signs up Aug 21 and first orders Sep 1, an 11-day gap that still counts for 2026-08. User 14's first order lands 30 days after a Sep 15 signup — Oct 15 — and converts the September cohort all the same. julianday differences of midnight dates are exact, so CAST(... AS INTEGER) truncates nothing on this seed, but the CAST is the contract's guarantee that the AVG averages whole days — AVG over raw julianday diffs happens to agree here only because every diff is a whole number.",
    ],
    edges: [
      "User 2 converts in 2 days and orders again on day 25; user 4 converts in 10 days and orders again on day 19 — MAX(order_date) (or any non-first order) shifts their clocks and reads cohort 2026-07's median as 11.0 instead of 2.5.",
      "The mirror must keep INTEGER division: (n+1)/2 and (n+2)/2 read 3 and 3 for n = 5, but the unconditional rn IN (n/2, n/2+1) averages ranks 2 and 3 and reports 9.5 for cohort 2026-09 instead of 12.0.",
      "Users 6 and 7 tie at 2 days: ORDER BY days, user_id makes rn deterministic (6 before 7), and the probe asserts the tie-broken and untied queries report the same medians — the median is order-insensitive among tied values, the RANKING is not.",
      "Orders belong to the USER's cohort, never the order's month: user 9's first order fires Sep 1 for an Aug 21 signup (day 11, credited to 2026-08), and user 14's first order fires Oct 15 for a Sep 15 signup (day 30, credited to 2026-09).",
      "Unconverted users are excluded from the day list, not given a sentinel: treating users 5 and 15 as days = 0 reports 2.0 and 9.5 medians for cohorts 2026-07 and 2026-09 — the day list holds converted users only.",
    ],
    ladder: [
      {
        title: "Brute force — sort each cohort's day list by hand",
        body: "Write down each converted user's days-to-first-order, sort the list, and pick the middle (or average the two middles). Thirteen converted users is manageable, but the pick-by-hand step is exactly the parity logic the SQL must encode.",
      },
      {
        title: "The pattern — first-order CTE, day diff, window ranking",
        body: "MIN(order_date) per user builds the conversion clock, julianday math with a CAST yields whole days, and ROW_NUMBER plus COUNT(*) OVER (PARTITION BY cohort_month) rank and size each cohort's day list. Filtering ranks (n+1)/2 through (n+2)/2 and averaging selects the median.",
      },
      {
        title: "The optimal idea — percentiles without PERCENTILE: the row-number mirror trick",
        body: "One sort per cohort, O(m log m) over the m converted rows, and one filter that handles both parities: (n+1)/2 and (n+2)/2 collapse to the same rank when n is odd and straddle the middle when n is even. The durable rule: any percentile is a rank filter plus an aggregate — swap the rank formula and the same shape computes a P90.",
      },
    ],
    approach:
      "first-order CTE (MIN(order_date) per user), CAST julianday diff to whole days, ROW_NUMBER/COUNT(*) OVER (PARTITION BY cohort_month) ranks the day list, the (n+1)/2 and (n+2)/2 mirror picks the middle, AVG + ROUND(median, 1)",
    schema: {
      ddl: `CREATE TABLE users (
  user_id     INTEGER PRIMARY KEY,
  signup_date TEXT    NOT NULL  -- 'YYYY-MM-DD'
);
CREATE TABLE orders (
  order_id     INTEGER PRIMARY KEY,
  user_id      INTEGER NOT NULL,
  order_date   TEXT    NOT NULL,  -- 'YYYY-MM-DD'
  amount_cents INTEGER NOT NULL
);`,
      seed: `-- 3 signup cohorts: 2026-07 (5 users, 4 convert), 2026-08 (4 users, all
-- 4 convert) and 2026-09 (6 users, 5 convert) — users 5 and 15 never order.
-- User 2 and user 4 hold TWO orders each: the conversion clock must use
-- MIN(order_date), and user 4's second order crosses into August
INSERT INTO users (user_id, signup_date) VALUES
  (1, '2026-07-02'),
  (2, '2026-07-05'),
  (3, '2026-07-09'),
  (4, '2026-07-14'),
  (5, '2026-07-20'),  -- never orders
  (6, '2026-08-01'),
  (7, '2026-08-03'),
  (8, '2026-08-10'),
  (9, '2026-08-21'),
  (10, '2026-09-01'),
  (11, '2026-09-03'),
  (12, '2026-09-06'),
  (13, '2026-09-10'),
  (14, '2026-09-15'),
  (15, '2026-09-22'); -- never orders
INSERT INTO orders (order_id, user_id, order_date, amount_cents) VALUES
  (101, 1, '2026-07-02', 1500),   -- same-day conversion: day 0
  (102, 2, '2026-07-07', 4200),   -- day 2 — the FIRST order pins the clock
  (105, 2, '2026-07-30', 5100),   -- day 25 — a later order, ignored
  (103, 3, '2026-07-12', 2300),   -- day 3
  (104, 4, '2026-07-24', 9900),   -- day 10
  (110, 4, '2026-08-02', 3200),   -- day 19, crossing into August — ignored
  (106, 6, '2026-08-03', 7800),   -- day 2, tied with user 7
  (107, 7, '2026-08-05', 1200),   -- day 2
  (108, 8, '2026-08-15', 6400),   -- day 5
  (109, 9, '2026-09-01', 8900),   -- day 11, order month AFTER the signup cohort
  (111, 10, '2026-09-04', 3050),  -- day 3
  (112, 11, '2026-09-10', 4750),  -- day 7
  (113, 12, '2026-09-18', 2200),  -- day 12 — the single middle
  (114, 13, '2026-09-24', 9800),  -- day 14
  -- day 30, order in October — still 2026-09's conversion
  (115, 14, '2026-10-15', 5600);`,
      tables: [
        { name: "users", note: "15 signups across 2026-07..2026-09 — 5, 4 and 6 per cohort, with users 5 and 15 never ordering" },
        { name: "orders", note: "14 orders — user 2 and user 4 hold two each and their LATER orders must never move the first-order clock" },
      ],
    },
    code: `WITH first_orders AS (
    -- one row per CONVERTED user: the FIRST order date per user — later
    -- orders exist in the seed and must never move this clock
    SELECT
        u.user_id,
        u.signup_date,
        strftime('%Y-%m', u.signup_date) AS cohort_month,
        MIN(o.order_date) AS first_order_date
    FROM users u
    JOIN orders o ON o.user_id = u.user_id
    GROUP BY u.user_id, u.signup_date
),
timed AS (
    -- whole days from signup to first order, CAST per the contract
    SELECT
        cohort_month,
        user_id,
        CAST(julianday(first_order_date) - julianday(signup_date) AS INTEGER) AS days
    FROM first_orders
),
ranked AS (
    -- the median emulation: rn orders each cohort's day list, n sizes it —
    -- ORDER BY days, user_id breaks ties deterministically
    SELECT
        cohort_month,
        days,
        ROW_NUMBER() OVER (PARTITION BY cohort_month ORDER BY days, user_id) AS rn,
        COUNT(*) OVER (PARTITION BY cohort_month) AS n
    FROM timed
),
middle AS (
    -- INTEGER division: (n+1)/2 and (n+2)/2 name the SAME row for odd n and
    -- the TWO middles for even n — one filter covers both parities
    SELECT cohort_month, days
    FROM ranked
    WHERE rn IN ((n + 1) / 2, (n + 2) / 2)
),
medians AS (
    SELECT cohort_month, AVG(days) AS median_days
    FROM middle
    GROUP BY cohort_month
),
sizes AS (
    -- EVERY user signed up that month, converted or not
    SELECT strftime('%Y-%m', signup_date) AS cohort_month, COUNT(*) AS cohort_size
    FROM users
    GROUP BY 1
),
converted_counts AS (
    SELECT cohort_month, COUNT(*) AS converted
    FROM first_orders
    GROUP BY cohort_month
)
SELECT
    cs.cohort_month,
    cs.cohort_size,
    cc.converted,
    cs.cohort_size - cc.converted AS unconverted,
    ROUND(m.median_days, 1) AS median_days
FROM sizes cs
JOIN converted_counts cc ON cc.cohort_month = cs.cohort_month
JOIN medians m ON m.cohort_month = cs.cohort_month
ORDER BY cs.cohort_month ASC;`,
    walkthrough: [
      "The first_orders CTE reduces every user to their first order: user 1 orders the same day they sign up (day 0), user 2's MIN reads 2026-07-07 (day 2) with the 07-30 order ignored, user 4's reads 2026-07-24 (day 10) with the August order ignored, and users 6 and 7 both land on day 2 — the tie the ranking must survive. Users 5 and 15 appear in no order row at all, so the JOIN itself drops them from the day lists. The timed CTE CASTs each julianday difference to a whole day: cohort 2026-07 holds 0, 2, 3, 10; cohort 2026-08 holds 2, 2, 5, 11; cohort 2026-09 holds 3, 7, 12, 14, 30.",
      "The ranked CTE orders each list and sizes it: cohort 2026-07's n = 4 makes the mirror read ranks 2 and 3 — days 2 and 3 — and AVG(2, 3) = 2.5. Cohort 2026-08's n = 4 reads ranks 2 and 3 over the tie-broken list (user 6 rank 1, user 7 rank 2, user 8 rank 3, user 9 rank 4) — days 2 and 5 — and AVG(2, 5) = 3.5. Cohort 2026-09's n = 5 collapses the mirror to rank 3 twice — day 12 — and the AVG of a single row is 12.0: the odd-count case needs no branch, only the same filter.",
      "The counting CTEs split the cohorts' populations: sizes reads 5, 4, 6 and converted_counts reads 4, 4, 5, so unconverted lands at 1, 0, 1. The final SELECT joins the three arms on cohort_month, ROUNDs each median to 1 decimal, and ORDER BY cs.cohort_month ASC ships (2026-07, 5, 4, 1, 2.5), then (2026-08, 4, 4, 0, 3.5), then (2026-09, 6, 5, 1, 12.0). Every cell is an INTEGER except the medians, which leave the integers exactly once, as rounded REALs.",
    ],
    time: "O(m log m) over the m converted users — one sort per cohort for the ranking plus the final ORDER BY",
    space: "O(m) — the ranked day lists (13 converted rows here) held until the middle filter",
    followUps: [
      "Report the P90 of days-to-convert beside the median — which rank formula keeps the percentile stable under ties, and what does cohort 2026-09's P90 read?",
      "Exclude day-0 conversions as accidental (user 1 orders the moment they sign up) — how do cohort 2026-07's median and converted count move, and does the mirror still pick the same ranks?",
      "For the fixed as-of date '2026-10-01', report each cohort's median over first orders placed in the 30 days before the as-of — where does the date filter sit, and which cohorts survive it?",
    ],
    related: ["funnel-step-conversion", "cohort-retention-matrix", "restaurant-growth"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "rolling-7d-actives",
    statement:
      "The events table logs one row per user-active day: (user_id, event_date), and some users log more than one row on the same day. A product team watches the ROLLING weekly audience: for a given day, rolling_actives is the distinct users with at least one event in the inclusive trailing window [date(day, '-6 days'), day] — seven calendar days, both ends counted. The report covers the last 10 days of the seeded span (2026-09-01 through 2026-09-17, so the rows run 2026-09-08 through 2026-09-17), and delta = rolling_actives(day) - rolling_actives(previous day) — an INTEGER that may be negative; every reported day has a previous day in the data. Report the columns day, rolling_actives and delta, ordered by day ascending.",
    examples: [
      {
        input:
          "2026-09-15: the trailing window 2026-09-09..2026-09-15 touches users 1-8 and 12 — users 9, 10 and 11 have no event inside it (their last logs sit on Sep 7 and Sep 8)",
        output: "2026-09-15 · 9 · -2",
        explanation:
          "the day before reads 11, so delta = 9 - 11 = -2 — the burst users' absences have finally aged out of the window; a negative delta is a first-class output.",
      },
      {
        input:
          "2026-09-17: the window 2026-09-11..2026-09-17 catches the return wave — all 12 users log somewhere inside it, and user 5 logs twice that day",
        output: "2026-09-17 · 12 · 3",
        explanation:
          "user 5's duplicate row collapses under COUNT(DISTINCT user_id), the day before reads 9, and delta = 12 - 9 = 3 — one event is enough to enter a window, and 8 users return at once.",
      },
    ],
    constraints: [
      "events spans exactly 17 consecutive days, 2026-09-01 through 2026-09-17 — no user is active outside the span; 12 distinct users appear, users 1 and 2 on all 17 days, and four user-days carry a duplicate row (user 1 on 2026-09-08, user 2 on 2026-09-10, user 6 on 2026-09-14, user 5 on 2026-09-17)",
      "rolling_actives(day) = COUNT(DISTINCT user_id) with at least one event in [date(day, '-6 days'), day] — a 7-day window inclusive at both ends; a SUM of per-day distinct counts over a 7-row frame overcounts and is NOT this metric",
      "the report covers the last 10 days of the span — day > date((SELECT MAX(day) FROM days), '-10 days'), which reads 2026-09-08..2026-09-17 on this seed; delta = rolling_actives(day) - rolling_actives(previous day) with the LAG running over the FULL 17-day spine, so every reported day has a predecessor and delta is never NULL",
      "columns day, rolling_actives, delta — all INTEGER, delta may be negative — ORDER BY day ASC",
    ],
    primer: {
      hook:
        "The rolling 7-day actives is a product's heartbeat monitor — it counts how many people touched the product in the last seven days while smoothing away the weekday noise that makes any single day look like a trend.",
      concept: [
        "One day of traffic is a terrible witness: Mondays spike, Fridays sag, one enthusiastic user can bend the line. The rolling window fixes this by making every day ask about a week instead of a day — for any date, the trailing 7-day window is that date plus the six days before it, inclusive at both ends. A user is a rolling active if they logged at least one event anywhere inside the window; one event in seven days is enough. Slide the window forward one day at a time and the count becomes a series — calm in the middle, jumpy only where users enter and age out, and far more honest than any single day.",
        "The rule that keeps the number honest is distinct inside the window: a user who logs five of the seven days counts once, not five times, because the count is over people, not rows and not days. That sounds obvious and is violated constantly, because the cheapest implementation — add up seven daily distinct counts — is exactly the wrong one. The seed's users 1 and 2 log every single day, so any sum of daily counts scores each of them seven times inside a week they occupied once.",
        "Why can the rolling count never be rebuilt by summing? Because distinct collapses across days: the union of seven daily user sets is smaller than the sum of their sizes whenever the same users repeat. On 2026-09-15 the seed's seven daily sets hold 5, 3, 3, 2, 3, 3 and 4 users — a sum of 23 — but the union is 9 people. The honest computation re-slices the raw events for every window, collecting each window's users from scratch; the window that never sums is the picture, and the sum of daily actives is the trap drawn right beside it.",
        "The delta — today's rolling count minus yesterday's — turns the level into a story. Negative deltas are normal and meaningful: a user ages out of the window when their last event becomes eight days old, so a burst inflates the rolling count for a full week after daily traffic has thinned, then lets go all at once. That lag is the metric's character: it saturates after good weeks and decays slowly after bad ones, and a sudden swing means a whole group of users crossed the seven-day line together — or came back together.",
      ],
      worked: [
        "Pick day 2026-09-15 from the seed: its trailing window runs 2026-09-09 through 2026-09-15 — six days back plus today, seven calendar days, both ends counted.",
        "List the daily distinct sets inside it: Sep 9 holds users 1, 2, 7, 8, 12; Sep 10 users 1, 2, 3; Sep 11 users 1, 2, 4; Sep 12 users 1, 2; Sep 13 users 1, 2, 5; Sep 14 users 1, 2, 6; Sep 15 users 1, 2, 3, 7.",
        "Take the union: users 1 through 8 plus user 12 — nine people — so rolling_actives reads 9, and user 1's seven daily rows collapse into a single count.",
        "Run the trap beside it: the daily counts sum to 5 + 3 + 3 + 2 + 3 + 3 + 4 = 23, more than double the truth, because users 1 and 2 alone are counted fourteen times between them.",
        "The delta closes the story: the day before, the window Sep 8-14 touches users 1-8 plus 10, 11 and 12 — eleven people — so 9 - 11 = -2, the negative delta of users 9, 10 and 11 aging out.",
      ],
      glossary: [
        { term: "rolling window", def: "the trailing seven calendar days ending today, inclusive at both ends" },
        { term: "actives", def: "users with at least one event in the period — a single log is enough" },
        { term: "distinct count", def: "counting each user once, no matter how many rows or days they log" },
        { term: "daily actives", def: "the distinct users of one single day — a building block that must never be summed" },
        { term: "date spine", def: "one row per calendar day, so every window has a neighbor for comparisons" },
        { term: "delta", def: "today's rolling count minus yesterday's — direction, not just level" },
      ],
      reallife: [
        "At a consumer product the rolling audience is the most-watched number in the building — a small data or product-analytics team maintains the dashboard, and product managers, founders and the board all read it. Weekly actives is the heartbeat metric at Spotify, Duolingo and every subscription app because it ignores the weekday wiggle yet still moves fast enough to show a launch landing: the seed's return wave on 2026-09-17 adds three actives in a single day. The delta line under the level is what gets watched in reviews — a run of small negatives is decay to investigate, a sudden positive is a campaign to double down on.",
        "What breaks in practice: the classic dashboard bug sums daily actives into a weekly number and reports an audience two or three times its true size, which then fails to match revenue and starts arguments in every meeting. Time-zone cutoffs split one user's week across two reporting days, duplicate event rows push counts up unless everything is distinct-safe, and one missing day silently breaks yesterday comparisons unless the date spine is rebuilt from a calendar rather than from the data. The numbers drive real decisions — staffing support ahead of a rising curve, pausing ads when the rolling audience decays for a week straight, and judging whether a re-engagement email truly brought anyone back or merely moved existing users' logging days around.",
      ],
      where:
        "Product-analytics interviews at consumer apps — Spotify, Duolingo, Calm, Robinhood — use rolling-window metrics to test whether a candidate spots the sum-versus-distinct trap on sight.",
    },
    breakdown: [
      "A rolling distinct audience is the one window metric that refuses the cheap shortcut: the trailing 7-day distinct count CANNOT be rebuilt from the daily distinct counts, because DISTINCT collapses users ACROSS days — user 1 sits inside every window seven times over and counts once. Summing the daily distincts over a seven-row frame reads 28 on 2026-09-17 where the truth is 12; users 1 and 2 alone contribute 14 phantom counts between them. The honest computation re-scopes the raw events for every window: each output day needs its own seven-day slice of the events table.",
      "The engine shape is a date spine self-joined to the events: one row per day the data touched (DISTINCT event_date yields all 17 span days), each joined to every event falling in [date(day, '-6 days'), day] — the BETWEEN makes the window inclusive at both ends, and COUNT(DISTINCT e2.user_id) collapses each slice to an audience. The delta column needs yesterday's rolling figure, so LAG(rolling_actives) runs over the FULL 17-day spine inside a CTE, and only the outer query filters to the last 10 days — filter first and the first reported day's LAG turns NULL, because WHERE prunes rows before the window pass sees them. The boundary itself is data-driven: day > MAX(day) - 10 days keeps exactly 2026-09-08 through 2026-09-17 on this seed.",
      "The seed tells a burst-and-decay story through the rolling lens: the Sep 5-9 burst inflates the trailing audience to 12 by Sep 10 and the count saturates there for days after daily traffic has thinned, because every user keeps re-appearing within a week of their last log. The decay arrives late and hard — Sep 14 slips to 11 once user 9's Sep 7 log leaves the window, Sep 15 to 9 — and a single return wave on Sep 17 snaps the audience back to 12, a +3 delta. Negative deltas are first-class output: the contract says so, and Sep 14 and 15 both carry them.",
    ],
    edges: [
      "The frame trap: SUM(daily distincts) OVER a 7-row frame reads 28 on 2026-09-17 while the true rolling distinct is 12 — distinct collapses ACROSS the window, and users 1 and 2 alone are counted 14 times between them.",
      "The off-by-one: date(day, '-7 days') widens the window to 8 days — 2026-09-14 reads 12 instead of 11 (user 9's Sep 7 event sneaks back in) and 2026-09-15 reads 11 instead of 9.",
      "COUNT(user_id) without DISTINCT inflates: 2026-09-08's window holds 7 event rows from 6 users (user 1 double-logs), so the naive count reads 29 event rows across the window where the audience is 11.",
      "Delta goes negative: 2026-09-15 reads 9 against the day before's 11 — delta -2 — because users 9, 10 and 11 have no event left inside the window.",
      "The spine must be gap-free for LAG: all 17 days have events, so DISTINCT event_date yields a contiguous spine and every reported day's LAG is the true previous day — a missing day would make LAG silently skip a step.",
    ],
    ladder: [
      {
        title: "Brute force — re-scan the window per day",
        body: "For each of the 10 reported days, walk all 69 event rows, collect the users with a date in the trailing week, count the set, and diff against yesterday's set. Correct, but every day rescans everything from scratch.",
      },
      {
        title: "The pattern — date spine, self-join, COUNT DISTINCT",
        body: "A DISTINCT event_date spine joined to events on BETWEEN date(day, '-6 days') AND day scopes each window in one predicate, and COUNT(DISTINCT user_id) per spine day produces the rolling series. LAG over the full spine, then a filter to the last 10 days, yields the delta.",
      },
      {
        title: "The optimal idea — re-slice the raw events, never sum the daily counts",
        body: "O(D × E) for D spine days against E event rows — honest for the sandbox, and the DISTINCT inside the count is the whole ballgame. The durable rule: a trailing distinct audience needs the events re-sliced per window; any SUM over pre-aggregated daily counts double-counts everyone who repeats inside the window.",
      },
    ],
    approach:
      "date spine (DISTINCT event_date) self-joined over the inclusive trailing window [day - 6 days, day], COUNT(DISTINCT user_id) per spine day, LAG delta over the full spine, last-10-days filter applied outside the window pass",
    schema: {
      ddl: `CREATE TABLE events (
  user_id    INTEGER NOT NULL,
  event_date TEXT    NOT NULL  -- 'YYYY-MM-DD', one row per user-active day
);`,
      seed: `-- 12 users over 2026-09-01..2026-09-17: users 1 and 2 never miss a day,
-- users 3-12 arrive in bursts and gap out (user 9 vanishes after Sep 7,
-- users 10 and 11 after Sep 8, everyone back in the Sep 17 return wave).
-- Four user-days double-log: user 1 on Sep 8, user 2 on Sep 10,
-- user 6 on Sep 14, user 5 on Sep 17 — counts must be DISTINCT
INSERT INTO events (user_id, event_date) VALUES
  (1, '2026-09-01'), (2, '2026-09-01'),
  (1, '2026-09-02'), (2, '2026-09-02'), (3, '2026-09-02'),
  (1, '2026-09-03'), (2, '2026-09-03'),
  (1, '2026-09-04'), (2, '2026-09-04'), (4, '2026-09-04'),
  (1, '2026-09-05'), (2, '2026-09-05'), (3, '2026-09-05'), (5, '2026-09-05'), (6, '2026-09-05'),
  (1, '2026-09-06'), (2, '2026-09-06'), (7, '2026-09-06'), (8, '2026-09-06'),
  (1, '2026-09-07'), (2, '2026-09-07'), (3, '2026-09-07'), (4, '2026-09-07'), (9, '2026-09-07'),
  (1, '2026-09-08'), (1, '2026-09-08'), (2, '2026-09-08'), (5, '2026-09-08'),
  (6, '2026-09-08'), (10, '2026-09-08'), (11, '2026-09-08'),
  (1, '2026-09-09'), (2, '2026-09-09'), (7, '2026-09-09'), (8, '2026-09-09'), (12, '2026-09-09'),
  (1, '2026-09-10'), (2, '2026-09-10'), (2, '2026-09-10'), (3, '2026-09-10'),
  (1, '2026-09-11'), (2, '2026-09-11'), (4, '2026-09-11'),
  (1, '2026-09-12'), (2, '2026-09-12'),
  (1, '2026-09-13'), (2, '2026-09-13'), (5, '2026-09-13'),
  (1, '2026-09-14'), (2, '2026-09-14'), (6, '2026-09-14'), (6, '2026-09-14'),
  (1, '2026-09-15'), (2, '2026-09-15'), (3, '2026-09-15'), (7, '2026-09-15'),
  (1, '2026-09-16'), (2, '2026-09-16'), (8, '2026-09-16'), (12, '2026-09-16'),
  (1, '2026-09-17'), (2, '2026-09-17'), (4, '2026-09-17'), (5, '2026-09-17'),
  (5, '2026-09-17'), (6, '2026-09-17'), (9, '2026-09-17'), (10, '2026-09-17'),
  (11, '2026-09-17');`,
      tables: [
        {
          name: "events",
          note: "69 event rows from 12 users over 2026-09-01..2026-09-17 — users 1 and 2 never miss a day and four user-days double-log",
        },
      ],
    },
    code: `WITH days AS (
    -- the spine: one row per day the data actually touched — all 17 span
    -- days have events, so the spine is gap-free and every LAG below sees
    -- the true previous day
    SELECT DISTINCT event_date AS day
    FROM events
),
windowed AS (
    -- the per-day self-join: each spine day against every event inside the
    -- INCLUSIVE trailing week, then DISTINCT users — a SUM of daily counts
    -- can never reproduce this, distinct collapses across the window
    SELECT
        d.day,
        COUNT(DISTINCT e2.user_id) AS rolling_actives
    FROM days d
    JOIN events e2
      ON e2.event_date BETWEEN date(d.day, '-6 days') AND d.day
    GROUP BY d.day
),
deltas AS (
    -- LAG runs over the FULL spine so the first reported day still has a
    -- predecessor, and delta may be negative
    SELECT
        day,
        rolling_actives,
        rolling_actives - LAG(rolling_actives) OVER (ORDER BY day) AS delta
    FROM windowed
)
SELECT
    day,
    rolling_actives,
    delta
FROM deltas
WHERE day > date((SELECT MAX(day) FROM days), '-10 days')  -- the last 10 days of the span
ORDER BY day ASC;`,
    walkthrough: [
      "The days spine reads the calendar off the data: SELECT DISTINCT event_date over the 69 event rows yields exactly the 17 consecutive days 2026-09-01 through 2026-09-17. All span days have events, so the spine is contiguous and LAG's 'previous day' is honest. The population is 12 users; users 1 and 2 log all 17 days and four user-days carry a duplicate row (user 1 on Sep 8, user 2 on Sep 10, user 6 on Sep 14, user 5 on Sep 17), which is why every count downstream must be DISTINCT.",
      "The windowed CTE slices the events once per spine day. 2026-09-08's window 2026-09-02..2026-09-08 touches users 1 through 11 (user 12 does not exist yet) and reads 11. 2026-09-15's window 2026-09-09..2026-09-15 touches users 1-8 plus user 12 — user 12's Sep 9 log keeps them inside — and reads 9, while users 9, 10 and 11 have aged out; 2026-09-17's window 2026-09-11..2026-09-17 catches the return wave and reads 12, with user 5's double row collapsing to one user. The series runs 11, 12, 12, 12, 12, 12, 11, 9, 9, 12 across the ten reported days — saturation, decay, recovery.",
      "The deltas CTE subtracts each day's LAG over the full spine: the first reported row, 2026-09-08, reads 11 - 9 (Sep 7's rolling figure, computed but never reported) = +2, and the tail goes -1 (Sep 14), -2 (Sep 15), 0, then +3 on Sep 17. The outer WHERE keeps day > MAX(day) - 10 days — 2026-09-08 through 2026-09-17, ten rows — and ORDER BY day ASC ships them chronologically. Every cell is an INTEGER: counts and their differences, with the only REAL-free guarantee coming from COUNT DISTINCT and integer subtraction.",
    ],
    time: "O(D × E) — each of the 17 spine days rescans the 69 event rows for its window",
    space: "O(D + E) — the 17-day spine plus the per-day window groups",
    followUps: [
      "Add a week-over-week column — each day's rolling actives against the same weekday one week earlier — and decide which span days lack a full prior window on this 17-day seed.",
      "Publish a 28-day rolling audience beside the 7-day one: the spine self-join grows linearly in window length — at what point does a per-user bitmap or a recursive accumulator beat it?",
      "Rank the 10 reported days by delta instead of listing them chronologically — where must delta materialize before ORDER BY can touch it, and which tie-break keeps the ranking deterministic when deltas repeat?",
    ],
    related: ["dau-wau-stickiness", "rolling-average-steps", "sessionize-events"],
    order: "exact",
    xp: 20,
  },
];
