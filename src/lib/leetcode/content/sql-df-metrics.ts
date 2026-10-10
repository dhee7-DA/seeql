// Deep-dives — SQL data-metrics, batch 72 file b1: the Product Analytics
// metrics trio — DAU/WAU stickiness, growth accounting and funnel step
// conversion (3 problems: 2 Medium, 1 Easy, all order:"exact" reads).
// Original content: own tables, own seeds, own phrasing — never copied text.
import type { LcSqlDive } from "../types";

export const SQL_DF_METRICS: LcSqlDive[] = [
  {
    slug: "dau-wau-stickiness",
    statement:
      "The events table logs one row per product event: (user_id, event_ts) with timestamps as 'YYYY-MM-DD HH:MM:SS'. A product-analytics team tracks stickiness — how much of the weekly audience shows up on an ordinary day. For every calendar day present in events, report the columns day (the date as 'YYYY-MM-DD'), dau (distinct users with at least one event that day), wau7 (distinct users with at least one event in the trailing 7-day window ending on that day, inclusive) and stickiness_pct = ROUND(100.0 * dau / wau7, 1). Days with no events do not exist in the output — the table itself defines the calendar. Order by day ascending.",
    examples: [
      {
        input:
          "the quietest stretch: 2026-09-08 logs only users 1 and 6, while the trailing week Sep 2–8 between them reached all ten users",
        output: "2026-09-08 · 2 · 10 · 20.0",
        explanation:
          "The day scope finds 2 distinct users but the inclusive 7-day window still holds the whole base, so the weakest day of the run reads 20.0 — a small numerator over a window-fed denominator.",
      },
      {
        input:
          "the first day, 2026-09-01: user 1 logs twice, users 2, 3 and 5 once each — and no events exist before this day",
        output: "2026-09-01 · 4 · 4 · 100.0",
        explanation:
          "With nothing before Sep 1 the trailing window is truncated to the day itself, so wau7 collapses onto dau and stickiness reads a perfect 100.0 — an artifact of the data's first day, not a healthy product.",
      },
    ],
    constraints: [
      "event_ts is 'YYYY-MM-DD HH:MM:SS' and the day is date(event_ts); every calendar day from 2026-09-01 through 2026-09-12 has at least one event, so the output holds exactly those 12 days",
      "wau7 counts distinct users with an event in [day − 6 days, day] INCLUSIVE; days before 2026-09-01 hold no events, so early windows are truncated by the data start",
      "dau counts distinct users with an event on the day itself — user 1 logs twice on 2026-09-01 and still counts once",
      "columns day, dau, wau7, stickiness_pct = ROUND(100.0 * dau / wau7, 1), ordered by day ASC; days with zero events never report",
    ],
    primer: {
      hook:
        "Stickiness is how a product team learns whether its weekly audience is turning into a daily habit or just passing through — before anyone spends another dollar acquiring users the product cannot keep.",
      concept: [
        "The first number is DAU, daily active users: the count of distinct people who fired at least one real action in the product on a given calendar day — opened the app, played a track, sent a message. Two rules hide inside that definition. The action must be logged as an event, because active is a defined behavior, not a feeling a dashboard guesses at; and the count is of users, not events, because one person firing ten actions in a morning is still one person. Every double-log, refresh and retry therefore has to collapse, which is why these reports are built on distinct-user counts rather than raw row counts.",
        "The second number is WAU, weekly active users: the distinct people who fired at least one event anywhere in the trailing 7-day window ending on the day being reported, that day itself included. Picture it as an envelope laid over the calendar — a band six days wide plus today — with today's DAU as a single dot inside it. The envelope can never be narrower than the dot, because today is part of the window: every user counted today is automatically counted this week too. On the first day of a dataset the window has nothing behind it, so the envelope collapses onto the dot — an artifact worth knowing about before anyone celebrates a perfect score.",
        "Stickiness divides the two: DAU over WAU, written as a percentage. It answers one question — of everyone who cared enough to show up this week, what share showed up today. A reading near 50 means the weekly audience tends to appear every other day; a reading near 10 means most of the week's visitors came once and moved on. The same idea scales to any window — DAU over monthly actives is the classic dashboard ratio — but the arithmetic never changes: a small daily numerator divided by a wider, window-fed denominator.",
        "The ratio is also a lie detector for traffic. A one-off marketing campaign shoves new visitors into the weekly envelope while today's habit-bound crowd barely moves, so stickiness sinks during a spike — the envelope fattened faster than the dot. Organic, habit-forming usage does the opposite: the daily dot keeps pace with the band and the gauge climbs. That is why teams read stickiness beside the raw counts instead of alone — the same percentage can describe a healthy product on a quiet day and a struggling one the morning after a big ad push.",
      ],
      worked: [
        "Walk a tiny three-user product first: user A shows up every day, user B on days 1 and 2, user C only on day 2 — and nothing exists before day 1.",
        "Day 3 by hand: the day scope finds only A, so dau reads 1; the trailing window covers days 1 through 3 and finds A, B and C, so wau7 reads 3; stickiness is 100 × 1 / 3 = 33.3.",
        "The same arithmetic on the seed's last day, 2026-09-12: the day scope finds users 1, 4 and 6, so dau is 3, while the window Sep 6–12 still holds 9 distinct users (user 5 last fired on Sep 5, one day outside) — 100.0 × 3 / 9 rounds to 33.3, the same reading from real rows.",
        "Contrast the seed's first day, 2026-09-01: no earlier data exists, so the truncated window collapses onto the day itself — dau 4 (user 1 logs twice and still counts once) against wau7 4 reads 100.0, an artifact of the data's edge, not a healthy product.",
        "And the quietest day, 2026-09-08: only users 1 and 6 fire, so dau reads 2, but the window Sep 2–8 reaches all 10 users — 100.0 × 2 / 10 = 20.0, the run's low, a small dot under a full envelope.",
      ],
      glossary: [
        { term: "DAU", def: "daily active users — distinct people who fire at least one event on a given day" },
        { term: "WAU", def: "weekly active users — distinct people with an event in the trailing 7 days, today included" },
        { term: "stickiness", def: "the DAU-over-WAU percentage — the share of the weekly audience that showed up today" },
        { term: "trailing window", def: "a range ending on the reporting day and reaching a fixed span back, both ends inclusive" },
        { term: "active", def: "a logged, meaningful action — the event that makes a user count, distinct from a raw row" },
        { term: "campaign spike", def: "a one-off burst of acquired traffic that widens the weekly envelope faster than the daily habit grows" },
      ],
      reallife: [
        "A consumer product's growth or core-analytics team computes DAU, WAU and the ratio between them every morning, usually as the first panel of the dashboard reviewed in standup. The numbers decide small daily things — whether to send the re-engagement push, whether yesterday's dip was weather or a regression — and big strategic ones, because investors read stickiness as a proxy for habit. A team watching the gauge slide week over week typically splits the audience into cohorts before reacting: organic users versus campaign-acquired, newcomers versus long-tenured.",
        "What breaks in practice: timezones, first of all — a global product has no single Tuesday, and the day boundary has to be pinned per user or the counts smear across midnight. Bot and test traffic inflates the weekly envelope while real humans hold the daily dot down, quietly sinking the ratio; and every launch, press hit or paid push lands as a spike that reads as a stickiness collapse unless the campaign cohort is split out first. The numbers drive real decisions — shifting budget from acquisition to retention, tightening onboarding, rolling back a redesign — and a good analyst can reproduce the daily query by hand before defending any of them.",
      ],
      where:
        "Product-analytics and growth interviews at consumer tech companies — Spotify, Duolingo, Netflix, Airbnb, Uber — lean on DAU/WAU stickiness for analyst, data-scientist and product-analyst roles.",
    },
    breakdown: [
      "One event stream, two windows, one ratio. Each output day asks two distinct-user questions over the same events table: who fired today (dau) and who fired sometime in the trailing seven days including today (wau7). The stickiness ratio is only honest because both counts are DISTINCT users — an event count would rise whenever a user logs twice, which measures logging behavior, not audience size. The window ending on the day itself is what makes wau7 >= dau a mathematical guarantee rather than a coincidence.",
      "The naive walk builds the calendar wrong. Hard-coding the 12 days — or generating a dense calendar from min to max date — works here only because every day happened to log an event; the contract says days with zero events do not exist, and DISTINCT date(event_ts) is the only definition that respects that for any seed. The other classic slip is the window bound: BETWEEN date(day, '-6 days') AND day is a 7-day window inclusive of both ends, and writing '< day' or '-7 days' shifts the audience — on 2026-09-12 it would read the Sep 5–11 audience (10 users) instead of the Sep 6–12 one (9 users).",
      "The join multiplies, so DISTINCT is not cosmetic. Joining each day to the day's events and to the window's events produces a cross product per day — 2026-09-01 pairs its 5 event rows against its 5 window rows for 25 intermediate rows — and any plain COUNT inflates by that multiplicity. COUNT(DISTINCT e1.user_id) and COUNT(DISTINCT e2.user_id) each collapse their scope back to users. And the ratio literal must be 100.0: with integer operands SQLite divides integrally, so 100 * 3 / 9 reads 33 before ROUND ever sees a fraction.",
    ],
    edges: [
      "User 1 fires twice on 2026-09-01 (08:05 and 20:47): a COUNT(*) dau would read 5 on a 4-user day, and inside the window join the twin rows compound the multiplicity — only COUNT(DISTINCT user_id) on both scopes survives it.",
      "The window is INCLUSIVE of the day itself: BETWEEN date(d.day, '-6 days') AND d.day. Dropping the upper bound to '< day' turns wau7 into a pure before-today count — on 2026-09-12 the audience shifts from 9 users (Sep 6–12) to 10 (Sep 5–11) and the ratio drops from 33.3 to 30.0.",
      "Integer division: '100 * dau / wau7' with INTEGER counts divides integrally in SQLite — 100*3/9 = 33, 100*5/6 = 83 — so the 100.0 literal is what makes 2026-09-12 report 33.3 and 2026-09-02 report 83.3.",
      "2026-09-01's window is truncated by the data start: no events exist before it, so wau7 collapses onto dau (4 = 4) and stickiness reads 100.0 — every later day shows wau7 strictly above dau, but the first day cannot.",
      "Days with zero events never exist in this table — the output is exactly the 12 DISTINCT date(event_ts) values; a dense-calendar generator (generate_series or a min..max loop) would be wrong the moment a real gap appeared.",
    ],
    ladder: [
      {
        title: "Brute force — two scans per day in application code",
        body: "List every distinct day, then for each day walk all 48 events twice: once to collect the day's users, once for the trailing window's users, and divide by hand. It works, but it recomputes overlapping windows from scratch and hides the DISTINCT-user requirement inside loop bookkeeping.",
      },
      {
        title: "The pattern — a days spine with two joins",
        body: "DISTINCT date(event_ts) builds the report's calendar; joining events e1 on the exact day gives the dau scope, joining events e2 on BETWEEN date(day, '-6 days') AND day gives the wau7 scope. GROUP BY day and count DISTINCT users in each scope.",
      },
      {
        title: "The optimal idea — one grouped pass, both scopes, REAL division",
        body: "O(D × E) is honest for the sandbox and needs no index; the durable rules are that the data defines the calendar, the window is inclusive of both ends, and the 100.0 literal plus ROUND(..., 1) live in the SELECT. Two scopes, one GROUP BY — no second pass over the table.",
      },
    ],
    approach:
      "days CTE from DISTINCT date(event_ts), dual join (day scope + inclusive 7-day window scope), COUNT(DISTINCT user_id) both scopes, ROUND(100.0 * dau / wau7, 1)",
    schema: {
      ddl: `CREATE TABLE events (
  user_id  INTEGER NOT NULL,
  event_ts TEXT    NOT NULL  -- 'YYYY-MM-DD HH:MM:SS'
);`,
      seed: `-- 10 users across 2026-09-01..2026-09-12: user 1 never misses a day (and
-- logs TWICE on Sep 1), user 5 churns after Sep 5, user 6 arrives Sep 7,
-- users 7/9 burst and vanish, users 3/4 alternate — wau7 feeds every window
INSERT INTO events (user_id, event_ts) VALUES
  (1, '2026-09-01 08:05:00'),
  (1, '2026-09-01 20:47:00'),  -- user 1's SAME-DAY return: one user, two events
  (2, '2026-09-01 11:20:00'),
  (3, '2026-09-01 14:12:00'),
  (5, '2026-09-01 16:40:00'),
  (1, '2026-09-02 09:10:00'),
  (2, '2026-09-02 12:05:00'),
  (4, '2026-09-02 09:47:00'),
  (5, '2026-09-02 10:52:00'),
  (9, '2026-09-02 18:33:00'),
  (1, '2026-09-03 08:55:00'),
  (2, '2026-09-03 15:40:00'),
  (3, '2026-09-03 13:27:00'),
  (5, '2026-09-03 09:16:00'),
  (7, '2026-09-03 17:02:00'),
  (1, '2026-09-04 10:02:00'),
  (5, '2026-09-04 11:29:00'),
  (7, '2026-09-04 14:26:00'),
  (1, '2026-09-05 09:31:00'),
  (5, '2026-09-05 13:44:00'),  -- user 5's last event: gone from Sep 6 on
  (8, '2026-09-05 19:58:00'),
  (1, '2026-09-06 08:44:00'),
  (2, '2026-09-06 10:18:00'),
  (4, '2026-09-06 14:33:00'),
  (8, '2026-09-06 11:07:00'),
  (10, '2026-09-06 16:21:00'),
  (1, '2026-09-07 09:03:00'),
  (2, '2026-09-07 16:02:00'),
  (3, '2026-09-07 11:54:00'),
  (6, '2026-09-07 12:31:00'),  -- user 6's first appearance: mid-window arrival
  (8, '2026-09-07 15:49:00'),
  (1, '2026-09-08 10:15:00'),
  (6, '2026-09-08 09:26:00'),  -- the quietest day: dau 2
  (1, '2026-09-09 08:22:00'),
  (3, '2026-09-09 17:36:00'),
  (6, '2026-09-09 10:07:00'),
  (9, '2026-09-09 13:14:00'),
  (10, '2026-09-09 18:02:00'),
  (1, '2026-09-10 09:48:00'),
  (4, '2026-09-10 12:21:00'),
  (6, '2026-09-10 11:38:00'),
  (7, '2026-09-10 16:55:00'),
  (1, '2026-09-11 08:36:00'),
  (6, '2026-09-11 14:52:00'),
  (7, '2026-09-11 17:29:00'),
  (1, '2026-09-12 09:59:00'),
  (4, '2026-09-12 15:08:00'),
  (6, '2026-09-12 11:15:00');`,
      tables: [
        {
          name: "events",
          note: "48 event rows from 10 users over 2026-09-01..2026-09-12 — user 1 never misses a day and logs twice on Sep 1; user 5 churns after Sep 5; user 6 arrives Sep 7",
        },
      ],
    },
    code: `WITH days AS (
    SELECT DISTINCT date(event_ts) AS day         -- the calendar the DATA defines
    FROM events
)
SELECT
    d.day,
    COUNT(DISTINCT e1.user_id) AS dau,            -- same-day users (twin logs collapse)
    COUNT(DISTINCT e2.user_id) AS wau7,           -- trailing 7 days, the day itself included
    ROUND(100.0 * COUNT(DISTINCT e1.user_id) / COUNT(DISTINCT e2.user_id), 1)
        AS stickiness_pct                         -- 100.0 forces REAL division
FROM days d
JOIN events e1
  ON date(e1.event_ts) = d.day                    -- the day scope
JOIN events e2
  ON date(e2.event_ts) BETWEEN date(d.day, '-6 days') AND d.day   -- window scope, inclusive
GROUP BY d.day
ORDER BY d.day ASC;`,
    walkthrough: [
      "The days CTE is the report's spine, and it is deliberately derived from the data: SELECT DISTINCT date(event_ts) strips the clock from every event_ts and keeps one row per calendar day that actually logged activity. On this seed that yields exactly the 12 days from '2026-09-01' to '2026-09-12' — not because a calendar was generated, but because every one of those days has at least one event. Building the spine this way means a seed with real gaps would simply report fewer rows, which is precisely what the contract demands: no synthetic zero-event days. It also pins the day column's shape — date() returns the 'YYYY-MM-DD' string the output names as day.",
      "The FROM clause joins events twice against that spine, and the two join predicates are the whole scoping story. The e1 join, ON date(e1.event_ts) = d.day, restricts to the day itself and feeds dau; the e2 join, ON date(e2.event_ts) BETWEEN date(d.day, '-6 days') AND d.day, walks the trailing window with BOTH ends inclusive — six days back through the day itself. For '2026-09-08' the window reaches '2026-09-02' through '2026-09-08' and touches all ten users, while the day scope finds only users 1 and 6. Because the two joins are independent, the intermediate result per day is a cross product of the day's rows and the window's rows — '2026-09-01' pairs its 5 rows against its 5 window rows — which is exactly why the counts below must be DISTINCT.",
      "GROUP BY d.day collapses each day to one row carrying two distinct-user counts: COUNT(DISTINCT e1.user_id) for the same-day audience and COUNT(DISTINCT e2.user_id) for the weekly audience, with user 1's twin logs on '2026-09-01' collapsing to one user in both. The ratio then divides with intent: the 100.0 literal forces REAL arithmetic before the division (100 * 3 / 9 would read 33 integrally), and ROUND(..., 1) trims 33.333… to 33.3 exactly as the contract names it. ORDER BY d.day ASC ships the 12 rows chronologically — the truncated-window 100.0 on '2026-09-01', the run's low of 20.0 on '2026-09-08', and 33.3 on the final day.",
    ],
    time: "O(D × E) — each day's window join rescans the 48 event rows, with D = 12 distinct days",
    space: "O(D + E) — the distinct days plus the join's per-day working set",
    followUps: [
      "Rank the 12 days by stickiness instead of listing them chronologically — where must the ratio be materialized (a nested CTE) before RANK can order by it, and does the truncated first day deserve a flag column?",
      "Add wau4, a trailing 4-day window, beside wau7 — how much of the query changes, and on which days does the shorter window collapse onto dau?",
      "Roll the report up to ISO weeks — one row per week with that week's wau and the average daily dau — and decide where AVG over a GROUP BY week sits relative to the daily CTE.",
    ],
    related: ["rolling-average-steps", "restaurant-growth", "year-on-year-growth-rate"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "growth-accounting",
    statement:
      "The activity table stores one row per user-month a user was active: (user_id, active_month), months as 'YYYY-MM' with no duplicate pairs. Growth accounting explains each month's active base with four levers: new users (no earlier activity at all), retained (also active in the previous CALENDAR month), resurrected (absent last month but active in some earlier month) and churned — the users active in the previous calendar month who did not come back, attributed to the month they left. For every month present in activity, report the columns month, new_users, retained, resurrected and churned. The first month in the data reports all of its actives as new and zero churned. Order by month ascending.",
    examples: [
      {
        input:
          "user 4 is active 2026-05 and 2026-07 but skips 2026-06; users 3, 5 and 8 were active in 2026-06 and did not return in July; user 9 arrives in July",
        output: "2026-07 · 1 · 4 · 1 · 3",
        explanation:
          "July's six actives split into user 9 new, users 1/2/7/12 retained and user 4 resurrected — the May-to-July skip is a resurrection, never a retention — while June's users 3, 5 and 8 land as July's three churned.",
      },
      {
        input: "user 8 is active 2026-06 and 2026-08 only — absent July and September",
        output: "2026-08 · 1 · 4 · 2 · 2",
        explanation:
          "August's seven actives are user 10 new, users 1/2/7/9 retained and users 3/8 resurrected — user 8's own second lever — while July's users 4 and 12 churned; one user can hit all four levers across the run.",
      },
    ],
    constraints: [
      "activity holds distinct (user_id, active_month) pairs with active_month as 'YYYY-MM', spanning 2026-05 through 2026-09 with every calendar month present",
      "retained demands the previous CALENDAR month: a user active 2026-05 and 2026-07 is resurrected in July, never retained",
      "churned is attributed to the month the user left; the first month reports churned = 0, and a user active only in 2026-09 (user 11) shows no churn because 2026-10 is outside the data",
      "columns month, new_users, retained, resurrected, churned, ordered by month ASC",
    ],
    primer: {
      hook:
        "Growth accounting is the audit behind an active-user chart — it names which lever moved the total, so a team knows whether growth was bought, kept or won back.",
      concept: [
        "An active-user chart that reads up and to the right hides its own explanation: the base could be swelling with newcomers, holding on to everyone it already has, or refilling a leaky bucket. Growth accounting replaces that one number with a partition. Each month's active users split three ways by their history: new users, whose first-ever activity lands this month; retained users, who were also active in the previous calendar month; and resurrected users, who were away for at least one calendar month and came back. The three buckets never overlap, so they sum exactly to the month's active base.",
        "The fourth lever, churned, is counted in the month a user left, not the month they were missed: everyone active last calendar month who did not return lands as this month's churn. That direction makes the report a system of double entries with two identities that must always balance — this month's actives equal new plus retained plus resurrected, and last month's actives equal retained plus churned. Stitch the months together and a third identity falls out: this month's actives equal last month's actives, plus new, plus resurrected, minus churned. Picture the levers as pipes around one tank — new and resurrected pour in, churned drains out, and retained is last month's water that never left.",
        "The word that separates a correct report from a plausible wrong one is calendar. A user active in May and July was not retained in July — July's previous calendar month is June, and June holds no activity for them — so July calls them resurrected. Comparing each month against the user's own previous active month instead of the previous calendar month silently converts every gap into a retention, flattering the exact number the report exists to interrogate.",
        "Why split what one total already shows? Because each lever carries a different diagnosis. Growth that is mostly new is rented — it continues only while the acquisition spend continues; growth that is mostly retained compounds on itself; a fat resurrected count means lapsed users still have a reason to come back, and win-back campaigns have something to push on. The lever mix is the strategy memo; the total is just the headline.",
      ],
      worked: [
        "Take the seed's June and July by hand: June holds 7 actives — users 1, 2, 3, 5, 7, 8 and 12 — while July holds 6 — users 1, 2, 4, 7, 9 and 12.",
        "Classify July's six by history: user 9 has no earlier row at all, so new; users 1, 2, 7 and 12 were active in June, so retained; user 4 was active in May but not June — a skipped calendar month — so resurrected. That is 1 new + 4 retained + 1 resurrected, and 1 + 4 + 1 = 6 reconciles against July's actives.",
        "Churn flows forward from June: users 3, 5 and 8 were June actives who never arrived in July, so July's churned reads 3 — and June's 7 actives reconcile as 4 retained + 3 churned.",
        "The growth identity closes the loop: July's 6 actives equal June's 7 + 1 new + 1 resurrected − 3 churned — 7 + 1 + 1 − 3 = 6.",
        "One lever per user-month is the rule, but not one per career: the seed's user 8 is new in June, churned in July, resurrected in August and churned again in September — all four levers touched by a single user.",
      ],
      glossary: [
        { term: "growth accounting", def: "splitting each period's active base into new, retained and resurrected, with churn attributed to the month the user left" },
        { term: "new user", def: "a user whose first-ever activity lands in the current month" },
        { term: "retained user", def: "a user active this month and in the previous calendar month" },
        { term: "resurrected user", def: "a lapsed user back this month after skipping at least one calendar month" },
        { term: "churned user", def: "a user active last calendar month who did not return, counted in the month they left" },
        { term: "net change", def: "new plus resurrected minus churned — the lever sum that carries last month's base into this month's" },
      ],
      reallife: [
        "A growth team at a subscription consumer app runs this report monthly, and the growth product manager opens the leadership review with it: one stacked bar per month, each lever a different color. The mix decides where next quarter's effort goes — a new-heavy chart argues for retention work before more acquisition spend, a retained-heavy chart justifies pouring fuel on the funnel, and a fat resurrected lever makes the win-back email campaign the cheapest growth in the building. Boards like the report because it audits: the four levers either reconcile last month into this month, or someone's pipeline is leaking rows.",
        "What breaks in practice: month boundaries first — teams that report on rolling 28-day windows instead of calendar months get different retentions than their finance counterparts, and the two reports stop reconciling. The first month of any dataset reads as all-new with zero churn, so dashboards anchored at the data start quietly overstate acquisition; and a December holiday spike turns into a January resurrection wave that no one should celebrate. Seasonality, bot signups and duplicate accounts each contaminate one lever or another, which is why mature teams pin the definitions — calendar month, distinct user, first-ever activity — in writing before arguing about the numbers.",
      ],
      where:
        "Growth and product-analytics interviews at consumer subscription companies — Duolingo, Spotify, Netflix, Uber, DoorDash — lean on growth accounting for data-scientist, product-analyst and growth-product-manager screens.",
    },
    breakdown: [
      "Growth accounting is a partition with a direction. Each month's actives split cleanly three ways — new (no earlier activity), retained (also active the previous calendar month), resurrected (back after skipping at least one month) — and the fourth lever, churned, belongs to the month the user LEFT, counting the previous month's actives who did not follow up. The identities hold per month: actives = new + retained + resurrected, and the previous month's actives = retained + churned. That double-entry structure is what makes the four counts auditable — May's 6 actives reappear as June's 4 retained plus 2 churned.",
      "The naive misstep trusts LAG(active_month) equality. 'Consecutive activity' is not 'the user was active last time' unless you compare against the previous CALENDAR month computed with date arithmetic — user 4's LAG on their July row is '2026-05', an earlier month that proves prior activity but not July retention. The fix anchors on day 01: date(active_month || '-01', '-1 month') lands exactly one calendar month back (the anchor also sidesteps any month-end clamping), and the CASE compares two strings of the same 'YYYY-MM' shape.",
      "Churn looks backward but must be computed forward, and the join grain bites. A user's churn month is the calendar month right after an active month they failed to follow up — visible only by looking FORWARD with LEAD or by emitting a candidate month per active row and filtering it later. The last-row case needs the data's own month list as a boundary: user 11's September-only history would otherwise report an October churn that no month row can hold. And because the status arm lives at (user, month) grain while the churn arm emits per-user candidates, joining them raw cross-multiplies — both arms must be aggregated to month grain before the final LEFT JOIN.",
    ],
    edges: [
      "User 4 is active 2026-05 and 2026-07 but NOT 2026-06: a prev-active LAG comparison sees no gap and July reads retained — the calendar comparison (July's previous month is June) is what resurrects them, and June's churned reads 2 (users 4 and 6).",
      "User 8 hits all four levers: new in 2026-06, churned in 2026-07, resurrected in 2026-08, churned again in 2026-09 — a user may be new in one month and churned the very next, twice over.",
      "User 11 is active only in 2026-09, the data's last month: their churn belongs to 2026-10, which no row of activity contains, so it reports nowhere — the churn arm must join the months spine or it would fabricate an October.",
      "Both arms live at (user, month) grain: LEFT JOINing raw status rows to raw churn rows cross-multiplies — June's 7 status rows against its 2 churn rows would count each of June's 3 new users twice. Pre-aggregating status_counts and churn_counts to month grain is what keeps 3 = 3.",
      "date(active_month || '-01', ...) anchors every month at day 01 before arithmetic: SQLite would rescue a day-31 anchor by clamping ('2026-03-31' minus a month becomes '2026-02-28'), but the anchor makes the 'YYYY-MM' predecessor exact by construction instead of by clamping behavior.",
    ],
    ladder: [
      {
        title: "Brute force — membership sets per month",
        body: "For each month, build three sets in application code: this month's actives, last calendar month's actives and every-earlier actives, then classify each user by set membership and run a second pass to find last-month users missing this month. Correct, but it rescans the whole table per month and re-derives 'previous calendar month' by hand.",
      },
      {
        title: "The pattern — per-user LAG/LEAD plus a CASE",
        body: "Ordering each user's months makes classification a per-row decision: LAG IS NULL means new; LAG equal to one calendar month back means retained; anything else is resurrected. LEAD — or a candidate month emitted per row — finds the churn month after each unfollowed-up active month.",
      },
      {
        title: "The optimal idea — sort once, classify once, aggregate to the join grain",
        body: "One window sort per user orders everything, and the CASE does the classification in the same pass; pre-aggregating both arms to month grain before the final LEFT JOIN keeps the pivot cross-product-free. O(n log n) over n activity rows, with the months spine as the report's LEFT side so no active month can vanish.",
      },
    ],
    approach:
      "per-user LAG/LEAD over ordered months, calendar-gap CASE into new/retained/resurrected, forward-emitted churn landed on the month after the gap, month-grain arms LEFT JOINed on the months spine",
    schema: {
      ddl: `CREATE TABLE activity (
  user_id      INTEGER NOT NULL,
  active_month TEXT    NOT NULL  -- 'YYYY-MM', one row per active user-month
);`,
      seed: `-- 12 users × 2026-05..2026-09: users 1-2 never miss a month (the retained
-- backbone), 5/6/12 churn hard, 3/4/8 resurrect, and each month after May
-- plants brand-new users (7, 8, 12 → 9 → 10 → 11)
INSERT INTO activity (user_id, active_month) VALUES
  (1, '2026-05'),  -- users 1 and 2: active every month, retained forever
  (1, '2026-06'),
  (1, '2026-07'),
  (1, '2026-08'),
  (1, '2026-09'),
  (2, '2026-05'),
  (2, '2026-06'),
  (2, '2026-07'),
  (2, '2026-08'),
  (2, '2026-09'),
  (3, '2026-05'),  -- user 3: churns July, resurrects August
  (3, '2026-06'),
  (3, '2026-08'),
  (3, '2026-09'),
  (4, '2026-05'),  -- user 4: May and July, NOT June — resurrection, not retention
  (4, '2026-07'),
  (5, '2026-05'),  -- user 5: churns after June, never returns
  (5, '2026-06'),
  (6, '2026-05'),  -- user 6: one-and-done May
  (7, '2026-06'),  -- user 7: brand-new in June, retained thereafter
  (7, '2026-07'),
  (7, '2026-08'),
  (7, '2026-09'),
  (8, '2026-06'),  -- user 8: new June, churned July, resurrected August, churned September
  (8, '2026-08'),
  (9, '2026-07'),  -- user 9: brand-new in July
  (9, '2026-08'),
  (9, '2026-09'),
  (10, '2026-08'), -- user 10: brand-new in August
  (10, '2026-09'),
  (11, '2026-09'), -- user 11: brand-new in September — their October churn is outside the data
  (12, '2026-06'), -- user 12: new in June, retained July, churned August
  (12, '2026-07');`,
      tables: [
        {
          name: "activity",
          note: "33 user-month rows over 2026-05..2026-09 — users 1-2 never miss; user 4 skips only June; user 11 appears once, in the final month",
        },
      ],
    },
    code: `WITH ordered AS (
    SELECT
        user_id,
        active_month,
        LAG(active_month)  OVER (PARTITION BY user_id ORDER BY active_month) AS prev_active,
        LEAD(active_month) OVER (PARTITION BY user_id ORDER BY active_month) AS next_active
    FROM activity
),
months AS (
    SELECT DISTINCT active_month AS month         -- the spine: months that exist in the data
    FROM activity
),
status AS (
    SELECT
        active_month AS month,
        CASE
            WHEN prev_active IS NULL THEN 'new'   -- no earlier activity at all
            WHEN prev_active = strftime('%Y-%m', date(active_month || '-01', '-1 month'))
                 THEN 'retained'                  -- previous CALENDAR month, not previous active
            ELSE 'resurrected'                    -- skipped at least one calendar month
        END AS status
    FROM ordered
),
status_counts AS (
    SELECT
        month,
        SUM(CASE WHEN status = 'new'         THEN 1 ELSE 0 END) AS new_users,
        SUM(CASE WHEN status = 'retained'    THEN 1 ELSE 0 END) AS retained,
        SUM(CASE WHEN status = 'resurrected' THEN 1 ELSE 0 END) AS resurrected
    FROM status
    GROUP BY month
),
churn AS (
    -- churn lands in the calendar month AFTER an active month the user did not follow up
    SELECT strftime('%Y-%m', date(active_month || '-01', '+1 month')) AS month
    FROM ordered
    WHERE next_active IS NULL
       OR next_active > strftime('%Y-%m', date(active_month || '-01', '+1 month'))
),
churn_counts AS (
    SELECT c.month, COUNT(*) AS churned
    FROM churn c
    JOIN months m ON m.month = c.month            -- drops candidates outside the data (October)
    GROUP BY c.month
)
SELECT
    m.month,
    COALESCE(sc.new_users, 0)   AS new_users,
    COALESCE(sc.retained, 0)    AS retained,
    COALESCE(sc.resurrected, 0) AS resurrected,
    COALESCE(cc.churned, 0)     AS churned
FROM months m
LEFT JOIN status_counts sc ON sc.month = m.month
LEFT JOIN churn_counts cc  ON cc.month = m.month
ORDER BY m.month ASC;`,
    walkthrough: [
      "The ordered CTE sorts each user's activity months and hangs two windows off them: LAG(active_month) fetches the user's previous ACTIVE month and LEAD(active_month) the next, both PARTITION BY user_id so users never leak into each other. For user 4, whose only rows are '2026-05' and '2026-07', LAG on the July row returns '2026-05' — an earlier month, but not the previous CALENDAR month — and that distinction is the problem's central trap. The months CTE is the report's spine: SELECT DISTINCT active_month yields the five months '2026-05' through '2026-09' that the final SELECT hangs everything on.",
      "The status CTE classifies every (user, month) row with one CASE. prev_active IS NULL means this is the user's first appearance ever, so 'new' — all six May actives land here. Otherwise the row compares prev_active against the previous CALENDAR month, computed as strftime('%Y-%m', date(active_month || '-01', '-1 month')): anchoring the month at day 01 and stepping back one month turns '2026-07' into '2026-06' exactly, so user 4's July — whose previous calendar month June holds no row for them — falls through to 'resurrected', while user 12's July (June active) reads 'retained'.",
      "The churn arm looks FORWARD: for each active month a user failed to follow up, the churn lands in the very next calendar month, strftime('%Y-%m', date(active_month || '-01', '+1 month')). The WHERE keeps a row when next_active lies beyond that next calendar month (a gap — user 3's June row emits '2026-07' because August is their next active month) or when there is no next active at all (a last row — user 6's May emits '2026-06'). Those last-row candidates then JOIN to months: user 6's June candidate survives because June exists in the data, while user 11's October candidate dies because no activity row holds October — September-only users report no churn, exactly as the definitions require.",
      "Both arms are pre-aggregated to month grain before anything joins: status_counts folds the CASE labels into three per-month columns with conditional SUM, and churn_counts counts candidates per month after the spine join. This pre-aggregation is not style — the status arm lives at (user, month) grain and the churn arm emits user-level candidates, and joining them raw would cross-multiply June's 7 status rows against its 2 churn rows, counting each of June's 3 new users twice. The final SELECT LEFT JOINs both aggregates onto months so every data month reports — May shows 6 new and zeros elsewhere — and ORDER BY m.month ASC ships '2026-05' through '2026-09' with COALESCE turning absent arms into honest 0s.",
    ],
    time: "O(n log n) over the 33 activity rows — one window sort per LAG/LEAD pass",
    space: "O(n) — the ordered rows plus the month-grain aggregates",
    followUps: [
      "Add a net_change column and prove the double-entry identity actives = prev_actives + new + resurrected − churned for all five months — which two of the four counts feed the reconciliation, and where does a violation point?",
      "Report the resurrected users' gap length in months — how must the CASE change to output the distance, and which users show the one-month gaps in this seed?",
      "Project 2026-10 from September's base and the observed lever rates — and explain why September's churn row is the last honest observation the query can make for actives like user 11.",
    ],
    related: ["analyze-subscription-conversion", "year-on-year-growth-rate", "customer-purchasing-behavior-analysis"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "funnel-step-conversion",
    statement:
      "The funnel table logs one row per step event: (user_id, step, step_ts), where step is one of 'visit', 'signup', 'cart', 'purchase' in strict chronological meaning — and a user may repeat a step. The product team reads the funnel per step: reach as users (COUNT(DISTINCT user_id)), then two conversion readings — pct_of_visitors, the step's share of the original visitors, and pct_from_prev, the step-over-step conversion against the previous step's users. Report the columns step, users, pct_of_visitors = ROUND(100.0 * users / visitors, 1) and pct_from_prev = ROUND(100.0 * users / prev_step_users, 1), with the visit row's pct_from_prev reported as 100.0. Rows report in funnel order — visit, signup, cart, purchase — which is not alphabetical.",
    examples: [
      {
        input:
          "user 3 carts twice (2026-10-02 and 2026-10-04) without ever purchasing, and user 7 visits twice without ever signing up — five distinct users have carted",
        output: "cart · 5 · 41.7 · 62.5",
        explanation:
          "Six cart rows collapse to five distinct users; 41.7 reads against the 12 original visitors while 62.5 reads against signup's 8 — one row, two different denominators.",
      },
      {
        input: "users 1, 2 and 4 reach purchase; 12 distinct users visited",
        output: "purchase · 3 · 25.0 · 60.0",
        explanation:
          "25.0 is the share of everyone who visited; 60.0 is the step-over-step rate against cart's five — the same reach tells two different stories depending on the denominator.",
      },
    ],
    constraints: [
      "step ∈ {'visit','signup','cart','purchase'} in strict chronological meaning; every step has at least one logged row",
      "users may repeat steps (user 3 carts twice, user 7 visits twice); every users figure is COUNT(DISTINCT user_id)",
      "columns step, users, pct_of_visitors = ROUND(100.0 * users / visitors, 1), pct_from_prev = ROUND(100.0 * users / prev_step_users, 1); the visit row reports pct_from_prev = 100.0",
      "rows in funnel order visit → signup → cart → purchase — semantic order, not alphabetical",
    ],
    primer: {
      hook:
        "A funnel report is how a product team finds the exact step where would-be customers give up — reach per step, and two conversion readings that agree on the counts but disagree on the story.",
      concept: [
        "A funnel is the ordered path a product expects people to walk toward its money moment: visit the site, sign up, fill the cart, purchase. The order is semantic — defined by the product's logic, never alphabetical — and each step's reach is the number of distinct users who ever logged that step, however many times they logged it. Reach should shrink or hold as you descend, because everyone at cart has, by the product's story, already visited and signed up. When the counts stop shrinking the way the story expects, the funnel is where an investigation starts.",
        "Every step carries two readings of the same reach. Overall conversion divides a step's users by the original visitors — the share of everyone who ever entered that got this far, start to finish. Stepwise conversion divides the same users by the previous step's audience — of the people who made it to the previous step, how many took this one, adjacent pair by adjacent pair. The two disagree by design, and the disagreement is information: three buyers out of twelve visitors is a modest 25.0 overall, while the same three out of five carters is a strong 60.0 stepwise.",
        "The two readings answer different management questions. Overall conversion sizes the whole pipeline — it is what a marketing dollar buys, the number that feeds revenue forecasts and acquisition budgets. Stepwise conversion localizes the leak — it points at the one seam bleeding users, the step a redesign or an experiment should target first. A funnel can convert well at every step yet lose badly overall, simply because an early seam let most of the crowd out before the good steps began.",
        "Two pieces of hygiene keep the numbers honest. Reach counts users, not rows — a shopper who carts on Tuesday and again on Thursday is still one carter, and counting both rows inflates every percentage downstream. And every row of the report divides one users figure by a different denominator — the original visitors for the overall reading, the previous step for the stepwise one — so a report that shares a single denominator across both columns has flattened the very contrast it exists to show.",
      ],
      worked: [
        "Tally the seed's reaches by hand: 12 distinct users visit (users 1 through 12), 8 of them sign up, 5 cart, and 3 purchase — users 1, 2 and 4, the only complete journeys.",
        "The overall reading divides each step by the original 12 visitors: signup 100 × 8 / 12 = 66.7, cart 100 × 5 / 12 = 41.7, purchase 100 × 3 / 12 = 25.0 — a quarter of everyone who visited ever bought.",
        "The stepwise reading divides each step by the step before it: signup 8 / 12 = 66.7 (the same number here, because visit is the top), cart 100 × 5 / 8 = 62.5, purchase 100 × 3 / 5 = 60.0.",
        "Read the disagreement: purchase is 25.0 overall yet 60.0 stepwise, so checkout is not the leak — the funnel bled early, losing 4 of its 12 visitors already at signup.",
        "Watch the repeat rows: user 3 carts twice and user 7 visits twice, so raw row counts would read 13 visits and 6 carts, while distinct users read 12 and 5 — and every percentage hangs off those.",
      ],
      glossary: [
        { term: "funnel", def: "the ordered sequence of steps a product expects users to pass through toward a goal" },
        { term: "reach", def: "the count of distinct users who ever logged a given step, repeat rows collapsed" },
        { term: "top of funnel", def: "the first step's audience — the visitors every overall percentage divides by" },
        { term: "overall conversion", def: "a step's users divided by the original visitors — the start-to-finish share" },
        { term: "stepwise conversion", def: "a step's users divided by the previous step's users, one adjacent pair at a time" },
        { term: "drop-off", def: "the users a step loses — the previous step's reach minus this step's" },
      ],
      reallife: [
        "Product-analytics teams own funnel dashboards wherever a product has a money moment: checkout at DoorDash or Airbnb, onboarding at a subscription software tool, the signup-to-first-play path at Spotify. The weekly growth review reads the two columns together — overall conversion to size the prize, stepwise to pick the seam — and each quarter's experiment backlog is largely a list of attacks on the worst stepwise rate. When one step's reading moves after a release, this report is often the first signal that a redesign helped or broke.",
        "What breaks in practice: users who skip steps or log them out of order — a returning shopper who goes straight to cart — bend the counts in ways the neat story does not expect, and the team has to decide whether the funnel is a strict sequence or a set of milestones. Window choice changes the numbers: a funnel joined within a single session reads tighter than one joined across thirty days, and the two are not comparable. Repeat events, bot traffic and steps logged by back-end jobs rather than user actions each inflate reach unless it is defined as distinct users over a curated event list — exactly the discipline the SQL has to encode.",
      ],
      where:
        "Product-analytics and e-commerce interviews — Airbnb, DoorDash, Uber, Shopify, Spotify — lean on funnel conversion for product-analyst, data-scientist and growth-engineer screens.",
    },
    breakdown: [
      "One count, two denominators. Per step the report wants reach (distinct users), the step's share of the original visitors (users / 12 here) and the step-over-step conversion (users / previous step's users) — and the same number tells two different stories: purchase's 25.0 says a quarter of everyone who visited bought, while its 60.0 says most people who carted followed through. Keeping the two apart is the whole problem: every row divides the SAME users figure by a DIFFERENT denominator.",
      "The funnel's order is semantic and must be imposed, not assumed. Alphabetical ORDER BY step ships cart, purchase, signup, visit — which scrambles the narrative and, worse, feeds LAG the wrong previous row, so every step-over-step ratio divides by the wrong step (signup would divide by purchase's 3 and read 266.7). A four-row VALUES CTE — or a CASE rank — pins visit → signup → cart → purchase before any window function runs, and ordering by that rank makes the output contract deterministic.",
      "Repeats make COUNT(DISTINCT) mandatory, and the window functions make the ratios trivial. User 3's two cart rows and user 7's two visit rows are real logs — a plain COUNT(*) reads cart as 6 and visit as 13, inflating reach and corrupting every ratio downstream. Once reach is grouped per step, FIRST_VALUE over the rank gives every row the visitors denominator and LAG gives the previous step's count, with COALESCE supplying the visit row's own 100.0 convention.",
    ],
    edges: [
      "User 3 carts twice (2026-10-02, 2026-10-04) and user 7 visits twice (2026-10-01, 2026-10-03): COUNT(*) reads cart 6 / visit 13 and inflates every ratio — COUNT(DISTINCT user_id) holds cart at 5 users and visit at 12.",
      "ORDER BY step is alphabetical — cart, purchase, signup, visit — so LAG would hand signup a denominator of 3 and read 266.7, and the report would run bottom-to-top besides.",
      "The two percentage columns must not share a denominator: purchase is 25.0 of visitors (3/12) but 60.0 of carters (3/5) — computing both against 12 turns the strongest step-over-step story into a flat share.",
      "If a middle step ever logged zero users, the inner join to funnel_order would drop its row and LAG would silently hand the NEXT step the wrong denominator (purchase would convert against signup); the seed guarantees all four steps are populated, and funnel_order is where a LEFT JOIN would go if that guarantee ever broke.",
    ],
    ladder: [
      {
        title: "Brute force — hand tally per step",
        body: "Walk the 30 rows once per step, collecting distinct user ids, then compute the two ratios on paper against 12 visitors and the neighbor counts. It works at this size and teaches exactly which denominators the engine must reproduce.",
      },
      {
        title: "The pattern — order first, then group, then window",
        body: "A VALUES CTE pins the funnel's semantic order; joining funnel to it and grouping yields COUNT(DISTINCT user_id) per step. FIRST_VALUE and LAG over that order attach the visitors denominator and the previous step's count to every row.",
      },
      {
        title: "The optimal idea — make the order DATA before any window runs",
        body: "Semantic orders belong in a relation, not in an ORDER BY expression; reach counts DISTINCT users because repeats are real logs. Both ratios come from one rounded expression with the 100.0 literal so SQLite divides REAL, never integrally — and the whole report is one grouped scan plus window work over four rows.",
      },
    ],
    approach:
      "VALUES CTE fixes funnel order, COUNT(DISTINCT user_id) reach per step, FIRST_VALUE/LAG supply the two denominators, ROUND(100.0 * ...) REAL ratios",
    schema: {
      ddl: `CREATE TABLE funnel (
  user_id INTEGER NOT NULL,
  step    TEXT    NOT NULL,  -- 'visit' | 'signup' | 'cart' | 'purchase'
  step_ts TEXT    NOT NULL   -- 'YYYY-MM-DD HH:MM:SS'
);`,
      seed: `-- 12 users, 30 rows, 2026-10-01..2026-10-07: reach strictly decreases
-- 12 visit → 8 signup → 5 cart → 3 purchase; user 3 carts twice and
-- user 7 visits twice — the repeat rows that make COUNT DISTINCT mandatory
INSERT INTO funnel (user_id, step, step_ts) VALUES
  (1, 'visit', '2026-10-01 09:00:00'),
  (1, 'signup', '2026-10-01 09:05:00'),
  (1, 'cart', '2026-10-02 10:15:00'),
  (1, 'purchase', '2026-10-02 10:40:00'),   -- user 1: the full journey
  (2, 'visit', '2026-10-01 11:20:00'),
  (2, 'signup', '2026-10-01 11:25:00'),
  (2, 'cart', '2026-10-03 14:00:00'),
  (2, 'purchase', '2026-10-03 14:22:00'),
  (3, 'visit', '2026-10-01 13:10:00'),
  (3, 'signup', '2026-10-01 13:30:00'),
  (3, 'cart', '2026-10-02 09:45:00'),
  (3, 'cart', '2026-10-04 16:30:00'),        -- repeat cart: one user, two rows
  (4, 'visit', '2026-10-02 08:40:00'),
  (4, 'signup', '2026-10-02 08:55:00'),
  (4, 'cart', '2026-10-05 12:10:00'),
  (4, 'purchase', '2026-10-05 12:35:00'),
  (5, 'visit', '2026-10-01 15:05:00'),
  (5, 'signup', '2026-10-02 10:00:00'),      -- user 5 stalls after signup
  (6, 'visit', '2026-10-02 13:25:00'),
  (6, 'signup', '2026-10-02 13:40:00'),
  (7, 'visit', '2026-10-01 10:30:00'),
  (7, 'visit', '2026-10-03 18:45:00'),       -- repeat visit: never signs up
  (8, 'visit', '2026-10-03 09:15:00'),
  (8, 'signup', '2026-10-03 09:20:00'),
  (8, 'cart', '2026-10-04 11:50:00'),        -- user 8 carts, never purchases
  (9, 'visit', '2026-10-04 14:35:00'),
  (9, 'signup', '2026-10-05 09:10:00'),
  (10, 'visit', '2026-10-05 10:25:00'),      -- users 10-12: single visits
  (11, 'visit', '2026-10-06 16:55:00'),
  (12, 'visit', '2026-10-07 08:35:00');`,
      tables: [
        {
          name: "funnel",
          note: "30 step rows from 12 users over 2026-10-01..2026-10-07 — reach falls 12 → 8 → 5 → 3; user 3 carts twice and user 7 visits twice",
        },
      ],
    },
    code: `WITH funnel_order (step_rank, step) AS (
    VALUES (1, 'visit'), (2, 'signup'), (3, 'cart'), (4, 'purchase')   -- semantic, NOT alphabetical
),
reach AS (
    SELECT
        f.step_rank,
        f.step,
        COUNT(DISTINCT e.user_id) AS users     -- repeat rows collapse: user 3's two carts count once
    FROM funnel_order f
    JOIN funnel e ON e.step = f.step
    GROUP BY f.step_rank, f.step
),
sequenced AS (
    SELECT
        step_rank,
        step,
        users,
        FIRST_VALUE(users) OVER (ORDER BY step_rank) AS visitors,  -- top-of-funnel denominator
        LAG(users)         OVER (ORDER BY step_rank) AS prev_users  -- step-over-step denominator
    FROM reach
)
SELECT
    step,
    users,
    ROUND(100.0 * users / visitors, 1) AS pct_of_visitors,
    ROUND(100.0 * users / COALESCE(prev_users, visitors), 1) AS pct_from_prev  -- visit row: 100.0
FROM sequenced
ORDER BY step_rank ASC;`,
    walkthrough: [
      "The funnel_order CTE is four VALUES rows — (1, 'visit'), (2, 'signup'), (3, 'cart'), (4, 'purchase') — and it exists to make the funnel's semantic order DATA rather than an afterthought, because alphabetical order is not funnel order. The reach CTE joins funnel to it on step and groups: COUNT(DISTINCT e.user_id) per step is the contract's users, and DISTINCT is what collapses user 3's two cart rows ('2026-10-02' and '2026-10-04') and user 7's two visit rows into single memberships. Reach comes out 12, 8, 5, 3 — strictly decreasing, each row carrying its step_rank for everything downstream.",
      "The sequenced CTE runs two window lookups over the four reach rows, both ORDER BY step_rank so the funnel's logic order drives the neighborhoods. FIRST_VALUE(users) gives every row the top-of-funnel count — the 12 visitors every pct_of_visitors divides by — and LAG(users) gives each step the count of the step before it: 12 for signup, 8 for cart, 5 for purchase. The visit row's LAG is NULL, and that NULL is meaningful: the final SELECT's COALESCE(prev_users, visitors) is the exact spot where the contract's 'visit reports 100.0' convention is implemented, dividing visit by itself.",
      "The final SELECT computes both readings with one shape: ROUND(100.0 * users / visitors, 1) for pct_of_visitors and ROUND(100.0 * users / COALESCE(prev_users, visitors), 1) for pct_from_prev, the 100.0 literal forcing REAL division in both. The numbers land as the contract describes: purchase divides 3 by 12 for 25.0 in one column and 3 by 5 for 60.0 in the other — the same reach, two different stories. ORDER BY step_rank ASC ships visit, signup, cart, purchase in funnel order, with the integer users riding alongside as the audit trail for every percentage.",
    ],
    time: "O(n + s) — one grouped scan over the 30 funnel rows, then window work over the s = 4 step rows",
    space: "O(s) — one row per step plus the fixed four-row order CTE",
    followUps: [
      "Report each user's furthest step reached and tally drop-offs per step — how does the approach flip from per-step counts to per-user maxima, and how many users stall at signup in this seed?",
      "Add median hours from visit to purchase for converters — where does the join back to the visit row sit, and do repeated steps (user 3's two carts) complicate the timestamp pairing?",
      "Split the funnel by first-visit week — does the GROUP BY grow a column, or does the whole CTE chain re-root on a cohort key?",
    ],
    related: ["analyze-subscription-conversion", "customer-purchasing-behavior-analysis", "restaurant-growth"],
    order: "exact",
    xp: 10,
  },
];
