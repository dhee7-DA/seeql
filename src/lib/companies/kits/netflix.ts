// Netflix — kit 1 of the Streaming & Social domain (Batch C).
// The play-event analytics company: binge runs, resume rails, watch-time
// concentration and the session-level window questions the domain is famous
// for. The pool uses ALL 8 of Netflix's registry-tagged sql rows first
// (session windows, churn windows, retention cohorts, data-quality walls)
// and theme-curates the rest from the SQL band's streaming-shaped problems —
// stated per the spec because the tagged pool (8 sql rows) is far below the
// 16-problem bar. Case studies run on the storefront db with probed figures
// from scripts/company-facts.md (orders = play sessions, customers =
// subscribers, shipped_at = session end, monthly trend = engagement trend —
// mappings declared in-world, no invented watch numbers).

import type { CompanyKit } from "../types";

export const netflixKit: CompanyKit = {
  id: "netflix",
  domainId: "media",
  name: "Netflix",
  tagline: "Play events, binge sessions, retention",
  accent: "text-red-400",

  brief: [
    "Netflix is the world's largest subscription video service — the company that turned **'hours viewed'** into the headline metric of an entire industry and treats every play, pause and finish as a row worth keeping. The unit of analysis is not the account or the title: it is the **play event**, stamped with a subscriber, a timestamp and a duration, flowing in by the billions. Everything the business decides — what to renew, what to recommend, which thumbnail you see — hangs on queries that fold those events into {sky:sessions}, sessions into viewing runs, and runs into {rose:retention} curves. The SQL reality is window-shaped before it is anything else: the questions that decide **seven-figure renewals** are 'what did this subscriber watch next' and 'how long was the gap before they came back'.",
    "The data org runs one of the biggest analytics estates in media. Playback telemetry lands in an event pipeline that feeds both the product (personalization) and the analysts (content valuation, {emerald:member retention}, experiment reads). Teams sit next to the decision: content-row analysts value shows in **watch hours**, growth teams manage the {rose:lapse-and-winback} loop, and the experimentation group reads A/B results where the metric is defined in SQL before the test ships. Dashboards are definition-heavy — 'hours viewed' means something exact, with a stated population and a stated denominator — and *an analyst who cannot restate the definition of their own metric does not survive the review*.",
    "Interview screens are session-level and window-heavy, more than any other domain in this app. A typical loop starts with a warm-up fold (sessions per subscriber per week), escalates into a **per-entity argmax** — most recent session per member, second-most-recent play, latest watch per title — and lands on either gaps-and-islands sessionization ({violet:binge runs}, {emerald:consecutive-day streaks}) or a `LAG`-driven {rose:churn} window (days since last play, week-over-week retention). The follow-ups are definition probes: 'does a re-Started session count twice?', 'is that share of subscribers or of sessions?', 'what happens to a member with one session?'. Candidates who narrate the partition, the ordering and the tie-break before writing the window consistently outperform.",
    "Preparation strategy: the kit consumes **all 8 of Netflix's tagged registry problems** — the second-most-recent-activity argmax, the churn-risk anti-join, the {emerald:cohort retention} matrix, the week-over-week churn `LAG`, the pivot wall, the `UNION` report, the collaboration census and the NULL audit — then theme-curates 22 more from the SQL band that mirror the company's known question themes: sessionization, streaks, LAG windows, per-subscriber rails and stickiness reads. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {violet:binge-run} sessionizer (a two-stage window fold), the other rebuilds the continue-watching rail (a per-subscriber argmax). The storefront mapping is declared, not hidden — orders are play sessions, order totals are minutes watched — because making the stand-in explicit is itself the habit this company's screens reward.",
  ],

  dayInLife: [
    "**08:15 —** The engagement pulse. The analyst opens the overnight dashboards: **hours viewed** by title and by row, completion rates, the resume-rail click-through, and — the number that gates everything — the {rose:churn} window: how many members crossed their lapse threshold since yesterday. The first query of the morning is almost always a per-subscriber window read: latest session per member, gap since previous session, flagged against the lapse bar. A spike in quiet gaps is the day's first fire, and the analyst who can write the `LAG` query that isolates WHICH cohort went quiet — new members versus long-tenured, mobile versus TV — is the one the growth team waits on.",
    "**11:30 —** Definition work under time pressure. A content lead wants the **second-most-watched episode** per series for the sequel decision; personalization wants the continue-watching rail rebuilt with a new tie-break rule; the experimentation group wants **week-4 retention** split by treatment arm, with the population stated before any percentage is computed. Each ask is a partitioned window, a conditional aggregate and an argument about grain — sessions versus members, plays versus finished plays. The analyst writes the query twice: once to answer, once with the definition printed beside it, because at Netflix *a number without its population is treated as marketing*.",
    "**15:00 —** The loop-closing reads. Winback lists go out to growth: members whose quiet gap crossed the bar and who came back — with the {emerald:recovery rate} the campaign is judged on. Content valuation refreshes: hours viewed concentrated per title, the {violet:top-10 share} of total watch time, run-depth distributions that say whether a series is binged or savored. The afternoon's job is closing loops: yesterday's quiet cohort becomes next week's saved member, and every list that leaves the desk carries its definition with it.",
    "**17:45 —** The rituals and the writeup. Quarterly metrics review prep: every KPI definition re-litigated, every denominator restated in the packet — the post-mortem culture treats an ambiguous denominator as a real incident. The EOD note is one screen: which cohort went quiet, which rail moved, which number survived definition stress. The best-prepared candidate knows the rhythm: Netflix SQL exists to defend **watch-time numbers** under definition stress, and the window function is the tool the defense is built with.",
  ],

  metrics: [
    { name: "Hours viewed", what: "Total watch time across the catalog — the headline the whole company reports. In query form it is a conditional SUM over play events with the population (completed? started? re-watches?) stated before the fold." },
    { name: "Completion rate", what: "Finished plays ÷ started plays, per title. The catalog-health read that decides renewals — a ratio whose denominator question (abandoned in the first minute?) is the entire interview test." },
    { name: "Binge depth", what: "Sessions per viewing run — how many plays chain together before the subscriber goes quiet. The gaps-and-islands metric this kit's first case computes end to end." },
    { name: "Quiet gap", what: "Days since a subscriber's previous session, via LAG over their partition. The lapse signal growth teams page on — and the metric where window-before-WHERE pipeline order bites hardest." },
    { name: "Week-4 retention", what: "Share of a signup cohort still playing four weeks later. The cohort-offset read that turns a session log into a retention matrix — one row per cohort-week, no exceptions." },
    { name: "Resume-rail recency", what: "Recency rank of each session within its subscriber — the argmax that powers continue-watching. The per-partition ROW_NUMBER drill Netflix screens open with." },
    { name: "Top-10 watch share", what: "Share of total hours consumed by the ten biggest titles. The concentration read — RANK windows plus a share ratio with an honest total denominator." },
    { name: "Stickiness (DAU/WAU)", what: "Daily actives ÷ weekly actives. The engagement-intensity ratio that separates the every-night subscriber from the weekend binge household — trailing-window COUNT DISTINCTs in interview form." },
  ],

  topics: [
    {
      name: "Folding play events",
      why: "Everything at Netflix starts by folding the play log: sessions per subscriber, plays per title, members per week. The screens warm up with GROUP BY + HAVING at event scale, and the trap is always the same — counting event rows when the business object is a person. The tagged collaboration census (pairs hitting a threshold) is this fold with a gating rule attached.",
      slugs: ["actors-and-directors-who-cooperated-at-least-three-times", "unique-orders-and-customers-per-month", "find-followers-count"],
    },
    {
      name: "Latest-activity argmax",
      why: "The most recent session per subscriber — and its famous sibling, the SECOND most recent — is the question Netflix is known for. MAX-joined-back breaks on timestamp ties; the surviving answer is a partitioned ROW_NUMBER with a deterministic tie-break. Two of this kit's subscribers carry a single session, which is exactly the edge case the follow-up probes.",
      slugs: ["second-most-recent-activity", "the-most-recent-three-orders", "bikes-last-time-used"],
    },
    {
      name: "Binge sessionization (gaps & islands)",
      why: "A viewing run is a chain of sessions with no gap longer than a threshold — the classic gaps-and-islands build: LAG the previous session, flag the break, run a windowed SUM to stamp run ids, then fold. This kit's first case study is that build end to end on the live db, and the tagged band's sessionize-events is its graded twin.",
      slugs: ["sessionize-events", "report-contiguous-dates", "find-loyal-customers"],
    },
    {
      name: "Streaks & consecutive behavior",
      why: "Consecutive-day watching is the engagement signal the recommender optimizes for: day-on-day runs, persistent patterns, behavior held across windows. These problems drill the streak grammar — date deltas, island keys, window-verified persistence — that Netflix asks when it wants to know whether tonight's viewer is a habit or a holiday.",
      slugs: ["active-users", "user-purchase-platform", "find-users-with-persistent-behavior-patterns"],
    },
    {
      name: "LAG/LEAD session math",
      why: "Quiet gaps, next-session lookups, week-over-week deltas — the LAG/LEAD pair is the domain's daily driver. Netflix drills it because churn is defined in gap language: the days between this session and the previous one, computed per subscriber and judged against the lapse bar. The week-over-week churn problem is the tagged version of exactly that read.",
      slugs: ["week-over-week-churn", "biggest-window-between-events", "consecutive-transactions-with-increasing-amounts"],
    },
    {
      name: "Churn-risk anti-joins",
      why: "The churn-risk screen is an anti-join wearing date math: subscribers whose most recent activity fell outside the winback window, or who never returned after a first play. The tagged problem here is Netflix's own; the curated pair adds the reactivation and never-streamed variants, which are the same LEFT JOIN + IS NULL shape pointed at the lapse window.",
      slugs: ["find-churn-risk-customers", "dormant-reactivation", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Cohorts & rolling retention",
      why: "Retention is reported as a matrix — signup cohort × week N — and measured as a trailing window — rolling 7-day actives, DAU/WAU stickiness. Both are window drills: offset arithmetic to place the cohort week, rolling COUNT DISTINCTs to keep the denominator honest. The tagged cohort-retention-matrix is the grid; the curated pair is the rolling twin.",
      slugs: ["cohort-retention-matrix", "dau-wau-stickiness", "rolling-7d-actives"],
    },
    {
      name: "Watch-time leaderboards",
      why: "Top titles by hours, top-10 share of watch time, the second-longest session per member — Netflix reporting is leaderboard reporting, and ties are everywhere when thousands of titles sit near the same view count. The rank trio (RANK, DENSE_RANK, ROW_NUMBER) is drilled until the tie semantics are a spoken reflex, not a lookup.",
      slugs: ["rank-scores", "top-five-artists", "department-top-three-salaries"],
    },
    {
      name: "CASE pivots & data-quality walls",
      why: "Engagement dashboards pivot states into columns — played / re-started / abandoned per month — and the telemetry itself gets audited: NULL session ends, blank regions, holes that silently shrink COUNT(col) reads. The tagged pivot and NULL-audit problems are the exact grammar; the salary-categories tier fold is the classification wall in graded form.",
      slugs: ["reformat-department-table", "null-blank-audit", "count-salary-categories"],
    },
    {
      name: "Stitched packets & multi-part asks",
      why: "Screens close with a composed ask: the most-watched title per member AND a platform-wide stat under the same rule; this month's packet stitched to last month's. The tagged movie-rating problem — argmax by one rule, per-person folds by another, set-op stitched — is the composition test Netflix uses to see whether the candidate holds two grains at once.",
      slugs: ["movie-rating", "team-scores-in-football-tournament", "monthly-transactions-ii"],
    },
  ],

  theory: [
    {
      id: "netflix-t1",
      q: "Build the continue-watching rail: the most recent session per subscriber. Walk me through the window you'd write — and why MAX-joined-back is the wrong first answer.",
      a: "The shape is a per-partition argmax: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) = 1. Two details carry the answer. The partition is the subscriber — one independent ladder per member, not one global sort. The ORDER BY ends with id DESC, a deterministic tie-break, because sessions can share a date: MAX(created_at) joined back returns BOTH same-date rows and the rail suddenly has two entries for one member, doubling every downstream count. The id DESC makes 'latest' mean latest-ingest instead of engine-arbitrary. And the edge case the interviewer is waiting for: a subscriber with a single session still gets a row — the ladder has one rung and rank 1 is it. Say the partition, the ordering, the tie-break and the edge case out loud, and the follow-ups have nothing left to bite.",
      tag: "windows",
    },
    {
      id: "netflix-t2",
      q: "You're sessionizing a play log: a viewing run is sessions with no gap over 30 days. How do you stamp run ids, and what does the default window frame do to your running SUM?",
      a: "Three stages. One: LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) gives the previous session; the julianday delta is the quiet gap. Two: a CASE flag — 1 when the gap is NULL or over the threshold, else 0 — marks 'a new run starts here'. Three: SUM(flag) OVER (PARTITION BY customer_id ORDER BY created_at) turns the flags into running run ids. The frame question is the senior part: with an ORDER BY, the default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW, which includes PEERS — rows sharing the ordering value. If two sessions share a date, they get the same running total and merge into one run silently. The fix is a unique tie-break in the ORDER BY (the row id), or an explicit ROWS frame. NULL gap handling is the other tell: the subscriber's FIRST session has no previous — the NULL must count as a run start, or the first run absorbs everything before the first threshold break.",
      tag: "windows",
    },
    {
      id: "netflix-t3",
      q: "The play log has 103 sessions from 16 subscribers. What do COUNT(*), COUNT(DISTINCT customer_id) and COUNT(shipped_at) each measure here — and which one does the business mean when it says 'actives'?",
      a: "Three counts, three business objects. COUNT(*) is sessions — 103 rows, the load the pipeline carries. COUNT(DISTINCT customer_id) is members — 16 people, the audience. COUNT(shipped_at) is ended sessions — the subset with a session-end stamp, which on this db is 82 of 103; the other 21 are still-open sessions with a NULL end. 'Actives' almost always means the second: the member count, because retention, churn and cohort math all key on people, not plays. The trap that ends interviews: after joining sessions to play events, COUNT(*) silently counts events, not sessions — the grain doubled under the join and every ratio shrank with it. The habit being graded is saying 'one row per WHAT?' before every COUNT, and refusing to let sessions, members and events blur into one number.",
      tag: "aggregation",
    },
    {
      id: "netflix-t4",
      q: "Sessions LEFT JOIN subscribers, then someone adds WHERE subscribers.region = 'EMEA' to scope the report. What silently changed, and how should the scoping have been written?",
      a: "The WHERE converted the LEFT JOIN into an INNER JOIN. Unmatched rows — sessions with no subscriber match — carry NULL region, and NULL = 'EMEA' is UNKNOWN, so those rows are discarded; the LEFT-ness survives only inside the ON clause. On a healthy log where every session has a member, the row count happens not to move — which is exactly why the bug ships silently and surfaces months later on a corrupted feed, when the 'all sessions' report starts dropping rows and nobody remembers the predicate is doing join-type work. The honest fix depends on intent: scope in the ON clause (LEFT JOIN subscribers s ON s.id = o.customer_id AND s.region = 'EMEA') keeps every session and marks non-EMEA as NULL payloads, or filter in an OUTER query after the join, or accept INNER semantics deliberately and say so. 'LEFT JOIN is safer' is the wrong lesson — join type is a decision about who survives, and every predicate belongs to that decision.",
      tag: "joins",
    },
    {
      id: "netflix-t5",
      q: "Session-end timestamps are NULL until a session closes. What's your policy for that NULL in a watch-duration report — filter, coalesce, or report?",
      a: "Report first, then decide. A NULL session end means the session is still open — it has no duration YET, and that is a definition, not dirt. The honest duration report filters to ended sessions and SAYS so: 'duration over the 82 of 103 sessions that have an end stamp; 21 open sessions excluded by definition.' That sentence is the difference between a metric and a rumor. The traps are the two lazy fixes. Filtering silently in WHERE is the same query without the disclosure — the population shrank and nobody knows. COALESCE(end, start) fabricates zero-duration sessions for still-open plays, which quietly drags the average down and reads as 'engagement collapsed' in the review. The one legitimate coalesce is at the display edge, for presentation, agreed with the stakeholder — never inside the pipeline, where a fake zero becomes a fake fact. NULL policy is a stated decision; the interviewer is grading whether you make one.",
      tag: "nulls",
    },
    {
      id: "netflix-t6",
      q: "A report filters 'members whose session count beats the platform average'. Which clause does the average live in — WHERE or HAVING — and where are SELECT aliases actually born?",
      a: "Two different questions hide here. Per-MEMBER gating ('members with more than 4 sessions') is HAVING COUNT(*) > 4 — a judgment on folded groups, after GROUP BY. The PLATFORM average is a different grain: a scalar subquery — HAVING COUNT(*) > (SELECT AVG(cnt) FROM (SELECT COUNT(*) cnt FROM orders GROUP BY customer_id)) — because the comparison target is computed over all members, not carried per row. The alias point is the pipeline order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. Aliases are born at SELECT, so they exist for ORDER BY but never for WHERE; SQLite pragmatically resolves them in GROUP BY and HAVING too, but the portable habit is writing the underlying expression everywhere except ORDER BY. The senior tell is separating the two grains out loud — per-member count versus platform-wide average — and staging the second in a derived table or CTE instead of nesting three levels of parentheses and hoping.",
      tag: "pipeline",
    },
    {
      id: "netflix-t7",
      q: "Correlated subquery: 'sessions longer than that subscriber's own average session.' How does it run, what does it cost, and what happens when a subscriber has one session?",
      a: "WHERE s.total > (SELECT AVG(i.total) FROM orders i WHERE i.customer_id = s.customer_id) — the inner fold re-runs per outer row, scoped to that subscriber's own history. Cost is real: one aggregation per member, fine at this scale, a rewrite-into-a-window at streaming scale (AVG(total) OVER (PARTITION BY customer_id) computes every member's average in one pass). The edge case IS the interview: a one-session subscriber's own average IS their session, so total > own-average is never true — they drop out, correctly, because 'longer than their typical' is undefined for a single observation. And the empty-inner case: if the inner query returns no rows the scalar yields NULL, the comparison is UNKNOWN, and the row vanishes without an error — which for 'their own average' can't happen (the outer row guarantees inner rows), but the same shape over a filtered inner table ships the silent-empty bug regularly. Saying who the inner fold covers, and what NULL does on the boundary, is the whole follow-up.",
      tag: "subqueries",
    },
    {
      id: "netflix-t8",
      q: "The engagement trend needs month buckets and quiet-gap days from TEXT dates. What are your three date tools here, and where does each one break?",
      a: "Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on ISO text — prints the calendar spine this db's 14-month trend (2024-01 through 2025-02) hangs on; SUBSTR works only while the format stays fixed-width ISO, and '%m' alone would fold February-2024 into February-2025. Diffs: JULIANDAY(a) - JULIANDAY(b) returns fractional days — the quiet-gap metric — and rounding happens ONCE at the display edge, not per row, or the trail drifts. Windows: half-open intervals — created_at >= '2025-02-01' AND < '2025-03-01' — never BETWEEN on the last day, which drops the final night of the month the moment timestamps gain a time component. The deeper breaks are the unstated ones: these strings carry no timezone declaration, and the session-end column is NULL for open sessions — so every date fold states its population first ('ended sessions only') and its convention ('dates are UTC by feed contract'). State the convention, then query it — never the reverse.",
      tag: "dates",
    },
  ],

  mcqs: [
    {
      id: "netflix-mcq-1",
      prompt: "The session log has 103 rows from 16 subscribers. Which expression returns 16 — the audience count the retention team keys on?",
      choices: [
        "COUNT(*)",
        "COUNT(DISTINCT customer_id)",
        "COUNT(shipped_at)",
        "COUNT(status)",
      ],
      answer: 1,
      why: "COUNT(DISTINCT customer_id) folds 103 session rows back to the 16 people behind them — the member count every retention and churn metric is built on.",
      notes: [
        { choice: 0, why: "COUNT(*) is the session count — 103. That's pipeline load, not audience; reporting it as 'actives' inflates the member base by the repeat factor." },
        { choice: 2, why: "COUNT(shipped_at) counts non-NULL session ends — 82 on this db. That's 'ended sessions', a real metric but a third thing, not the audience." },
        { choice: 3, why: "COUNT(status) counts non-NULL statuses — every row, so 103. Status is NOT NULL, so this COUNT can never distinguish anything." },
      ],
      difficulty: "easy",
    },
    {
      id: "netflix-mcq-2",
      prompt: "Two of a subscriber's sessions can share the same date. Which build returns EXACTLY one row per subscriber for the continue-watching rail?",
      choices: [
        "Join each subscriber to MAX(created_at)",
        "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) = 1",
        "ORDER BY created_at DESC LIMIT 1",
        "GROUP BY customer_id with MAX(total)",
      ],
      answer: 1,
      why: "The partitioned ROW_NUMBER with the id tie-break keeps exactly one row per subscriber even when dates tie — deterministic, per-member, edge-case-proof.",
      notes: [
        { choice: 0, why: "The MAX-join-back returns BOTH same-date sessions — two rail entries for one member, and every downstream count doubles. Ties are the whole reason the window exists." },
        { choice: 2, why: "LIMIT 1 returns one session total — the newest subscriber's session, not one per subscriber. Global sort, wrong grain." },
        { choice: 3, why: "MAX(total) finds each member's LONGEST session — a different rail. Recency is a time argmax, not a duration argmax." },
      ],
      difficulty: "medium",
    },
    {
      id: "netflix-mcq-3",
      prompt: "julianday(created_at) - julianday(LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at)) — for which row is the result NULL?",
      choices: [
        "Each subscriber's first session — no previous row exists in the partition",
        "Sessions that never ended — shipped_at is NULL",
        "Every row — LAG without an explicit frame returns NULL",
        "Sessions on the log's first date only",
      ],
      answer: 0,
      why: "LAG has nothing to look back at on the partition's first row, so the gap is NULL — which is why the binge flag must treat NULL as 'a run starts here'.",
      notes: [
        { choice: 1, why: "The gap runs on created_at, the session START — shipped_at's NULLs are a different column and a different definition entirely." },
        { choice: 2, why: "LAG is fully legal with a bare OVER; only the partition's first row lacks a previous value." },
        { choice: 3, why: "The first CALENDAR date only matters for the log's very first subscriber-session — per-partition firsts are what produce NULLs, and there are 16 of those, not one." },
      ],
      difficulty: "medium",
    },
    {
      id: "netflix-mcq-4",
      prompt: "AVG(total) over the session log prints 338.1879611650485. The dashboard needs 338.19. Which shape is correct?",
      choices: [
        "ROUND(AVG(total), 2)",
        "CAST(AVG(total) AS INTEGER)",
        "ROUND(AVG(total))",
        "SUBSTR(AVG(total), 1, 6)",
      ],
      answer: 0,
      why: "ROUND to 2 decimal places at the display edge — the one place rounding belongs. The average is 338.19 minutes; the pipeline carries the full precision until the print.",
      notes: [
        { choice: 1, why: "CAST to INTEGER truncates to 338 — a 0.19-minute leak per session, compounded across every aggregate built on top." },
        { choice: 2, why: "ROUND without a digit count rounds to 338 — integer precision, not the two decimals the dashboard specifies." },
        { choice: 3, why: "SUBSTR string-slices the number to '338.18' — truncation disguised as rounding, and now the cell is TEXT that downstream arithmetic silently mis-handles." },
      ],
      difficulty: "easy",
    },
    {
      id: "netflix-mcq-5",
      prompt: "The winback query needs: quiet_days computed with LAG, then filtered to gaps over the 45-day bar. Why does the filter have to live in an outer query (CTE or derived table)?",
      choices: [
        "LAG is not allowed inside CTEs",
        "Window functions evaluate at the SELECT stage — a same-level WHERE runs first, so the alias doesn't exist yet",
        "WHERE cannot contain arithmetic comparisons",
        "The CTE caches results for performance",
      ],
      answer: 1,
      why: "Logical evaluation runs FROM → WHERE → GROUP BY → SELECT — where windows are computed — → ORDER BY. A WHERE referencing the LAG alias is a 'no such column' error; staging the window in a CTE, then filtering outside, is the fix.",
      notes: [
        { choice: 0, why: "LAG in a CTE is perfectly legal — the staging exists for pipeline-order reasons, not permission." },
        { choice: 2, why: "WHERE takes full arithmetic expressions; the failure here is alias visibility, not expression power." },
        { choice: 3, why: "Performance may improve as a side effect, but the outer filter is required for CORRECTNESS — the same-level filter is an error, not a slow query." },
      ],
      difficulty: "hard",
    },
    {
      id: "netflix-mcq-6",
      prompt: "Run ids come from SUM(flag) OVER (PARTITION BY customer_id ORDER BY created_at). Two sessions of one subscriber share the same created_at. What happens?",
      choices: [
        "Both rows share the same running total and merge into one run — silently",
        "The query errors on the duplicate ordering value",
        "Each row gets a distinct sequential run id",
        "The second row is dropped by the window",
      ],
      answer: 0,
      why: "With ORDER BY and no explicit frame, the default is RANGE — peers (rows sharing the ordering value) are included together, so the running total jumps by the whole peer group. The two sessions get the same run id and merge; add the row id to the ORDER BY, or an explicit ROWS frame, to break the tie.",
      notes: [
        { choice: 1, why: "The query is perfectly legal — that's the danger. The bug is a silent merge, not an error message." },
        { choice: 2, why: "Sequential per-row numbering needs ROW_NUMBER — or a ROWS frame plus a unique tie-break. RANGE hands peers the same total, by definition." },
        { choice: 3, why: "Nothing is dropped — windows keep every row. Both sessions survive, wearing the same run id, which is precisely the corruption." },
      ],
      difficulty: "hard",
    },
    {
      id: "netflix-mcq-7",
      prompt: "Two titles tie for the most hours viewed; the next title has fewer. RANK() over hours DESC assigns the third title rank…",
      choices: ["1", "2", "3", "4"],
      answer: 2,
      why: "RANK gives both tied titles rank 1 and the next distinct value rank 3 — the gap is the point: it preserves the count of entries outranking it. DENSE_RANK would say 2; ROW_NUMBER would split the tie arbitrarily.",
      notes: [
        { choice: 1, why: "That's DENSE_RANK — compact, no gaps. Useful for tier counts, wrong when the business wants to know how many titles sit ahead." },
        { choice: 0, why: "Rank 1 for the third title would mean all three tied — they didn't. Only the top two share." },
        { choice: 3, why: "Rank 4 needs three distinct values ahead. Two tied firsts plus one follower is three positions: 1, 1, 3." },
      ],
      difficulty: "easy",
    },
    {
      id: "netflix-mcq-8",
      prompt: "The completion share is delivered sessions ÷ ALL sessions — 52 of 103. A teammate filters status = 'delivered' in WHERE before dividing. What prints?",
      choices: [
        "50.5 — correct",
        "100.0 — the denominator shrank to the numerator's population",
        "0.0 — the filter empties the numerator",
        "An error — you can't divide after WHERE",
      ],
      answer: 1,
      why: "Filtering delivered rows first makes COUNT(*) count delivered sessions — the denominator drifts to match the numerator, and every group reads 100%. Both sides must fold from the same unfiltered population: numerator as a conditional SUM, denominator as COUNT(*).",
      notes: [
        { choice: 0, why: "The honest 50.5 requires the full population under the fold — the WHERE already discarded 51 rows before any division happened." },
        { choice: 2, why: "Nothing empties the numerator — the delivered rows are all that's LEFT. That's exactly the drift: the share saturates at 100, not zero." },
        { choice: 3, why: "It runs fine and ships a perfect-looking number — denominator drift is the most confident-looking bug in analytics." },
      ],
      difficulty: "medium",
    },
    {
      id: "netflix-mcq-9",
      prompt: "The rail must include members whose only sessions were cancelled: sessions LEFT JOIN members, then WHERE m.name IS NOT NULL AND o.status != 'cancelled'. What happened?",
      choices: [
        "Nothing — both predicates are independent",
        "The WHERE killed the NULL payloads, so the LEFT JOIN collapsed to INNER — but the cancelled filter also works",
        "The status filter is fine, but the NULL check excludes members with no sessions",
        "The query now returns one row per member per cancelled session",
      ],
      answer: 1,
      why: "Two silent effects. The status filter sits in WHERE, so it evaluates against NULL payloads from unmatched members and discards them — LEFT collapses to INNER. And the whole premise breaks: cancelled sessions are filtered, so members with ONLY cancelled sessions lose their last surviving row and vanish from the rail. The fix: keep the status rule in the ON clause (or a staged pre-filter), and state who survives.",
      notes: [
        { choice: 2, why: "The NULL check would exclude no-session members — but on this log every member has sessions. The real damage is the WHERE-on-right-column collapse, which removes members, not just rows." },
        { choice: 3, why: "Fan-out per cancelled session is real for multi-session members, but it's a separate effect from the silent LEFT-to-INNER downgrade — and the question's bug REMOVES rows." },
        { choice: 0, why: "The predicates interact: NULL payload rows fail BOTH tests, and that's what silently changes the join type." },
      ],
      difficulty: "hard",
    },
    {
      id: "netflix-mcq-10",
      prompt: "The engagement trend needs month buckets over a 14-month window (2024-01 through 2025-02). Which bucket expression is calendar-safe?",
      choices: [
        "STRFTIME('%m', created_at)",
        "STRFTIME('%Y-%m', created_at)",
        "SUBSTR(created_at, 6, 2)",
        "created_at",
      ],
      answer: 1,
      why: "'%Y-%m' prints '2024-01' … '2025-02' — 14 distinct buckets that sort chronologically as text. The month-only variants collapse February-2024 and February-2025 into one bucket; the raw date is day-grain, not month-grain.",
      notes: [
        { choice: 0, why: "'%m' gives month numbers without the year — the 14-month trend folds into 12 buckets and the year-over-year story disappears." },
        { choice: 2, why: "SUBSTR positions 6-2 extracts the same month-only slice — same fold, same loss, just string surgery instead of STRFTIME." },
        { choice: 3, why: "The raw created_at is one bucket per DAY — 423 buckets where the trend expects 14. Grain, stated first, chooses the expression." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-netflix-1",
      tier: "hard",
      topic: "t8",
      universe: "growth",
      title: "The binge-run sessionizer",
      brief:
        "Netflix-flavored brief on the storefront db: the recommender team sessionizes the play log before it sizes anything — a viewing run is a chain of one subscriber's sessions with no gap longer than 30 days, and run depth is the binge metric the board actually reads. The db mapping is declared, not hidden: orders are play sessions, orders.total is minutes watched per session, customers are subscribers. Probed facts: 103 sessions from 16 subscribers spanning 2024-01-01 to 2025-02-27; the average session runs 338.19 minutes (range 25.47 to 1,088.44), and the census's power viewer — 24 sessions, 7,262.35 minutes — owns the log's two deepest runs. The deliverable is the top-10 leaderboard of runs by session count.",
      ask: "Return the top 10 viewing runs: subscriber, run number, session count and total minutes (2 decimals), deepest run first.",
      template:
        "WITH stamped AS (\n  SELECT customer_id, id AS seq, created_at, total AS minutes,\n         julianday(created_at) - julianday({1}(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id)) AS gap_days\n  FROM orders\n),\nruns AS (\n  SELECT customer_id, created_at, minutes, gap_days,\n         SUM(CASE WHEN gap_days IS NULL OR gap_days > {2} THEN 1 ELSE 0 END) OVER (PARTITION BY customer_id ORDER BY created_at, seq) AS run_no\n  FROM stamped\n)\nSELECT customer_id,\n       run_no,\n       COUNT(*) AS sessions,\n       ROUND(SUM(minutes), 2) AS minutes\nFROM runs\nGROUP BY customer_id, run_no\nORDER BY sessions {3}, minutes DESC, customer_id, run_no\nLIMIT {4};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the previous-session lookback",
          why: "LAG(created_at) reads the previous session start inside each subscriber's partition; the julianday delta is the quiet gap that drives the run flag. LEAD looks forward and makes every gap negative; FIRST_VALUE would measure distance from the subscriber's first-ever session — a different metric entirely.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the run-splitting threshold",
          noVerify: true,
          why: "The memo fixes the run boundary at 30 quiet days — a longer silence starts a new run. 7 would shatter the log into week-sized runs and the leaderboard would read as noise; 60 would glue distinct monthly habits into single 'runs' nobody believes.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the deepest-first direction",
          why: "The board wants the deepest runs on top, so session counts sort descending. ASC would rank the loneliest single-session runs first — a correct query answering the opposite question.",
        },
        {
          answer: "10",
          kind: "number",
          label: "the top-10 cut",
          noVerify: true,
          why: "The ask names a top-10 leaderboard, so the cut is 10. The run fold produces far more runs than that across 16 subscribers — the LIMIT exists to size the deliverable, not to define the metric.",
        },
      ],
      distractors: ["LEAD", "FIRST_VALUE", "7", "ASC", "3"],
      walkthrough:
        "Two staged windows, one fold. Stage one stamps each of the 103 sessions with its quiet gap: LAG(created_at) per subscriber partition, julianday delta in days — NULL on each subscriber's first session, which is exactly why the flag treats NULL as a run start. Stage two runs the gaps-and-islands trick: CASE flags a break when the gap clears the 30-day bar, and SUM(flag) OVER (partition, ordered) turns breaks into run ids. The outer fold groups by subscriber and run id, counts sessions and prices each run in minutes (2 decimals), and the board reads it deepest-first. The census's power viewer — 24 sessions, 7,262.35 minutes on the books — owns both of the two deepest runs; her 30-day chains are what binge depth means on this log. The distractors each break a different joint: LEAD flips the lookback so every gap goes negative and the flag fires only on partition-last rows — the log collapses into two ghost runs per subscriber; FIRST_VALUE measures every session against the subscriber's FIRST session ever, so the run count explodes into singletons; a 7-day bar shatters the run structure; ASC hands the board the loneliest runs; LIMIT 3 truncates the deliverable. State the partition, the ordering tie-break (id) and the frame, or the silent RANGE-peer merge will do it for you.",
    },
    {
      id: "cs-netflix-2",
      tier: "medium",
      topic: "t6",
      universe: "funnel",
      title: "The continue-watching rail",
      brief:
        "Netflix-flavored brief on the storefront db: the product team's continue-watching rail is a per-subscriber argmax — the most recent session per member, whatever its state, one row per member, newest session first. The db mapping: orders are play sessions, customers are subscribers, orders.total is minutes watched. Probed facts: 16 subscribers, 103 sessions, no member without at least one session; per-member session counts run from 1 to 24 — two one-session subscribers at the floor, the power viewer at 24 — and the log's newest session is dated 2025-02-27, the rail's top slot. Sessions can share a date, so the rail's definition demands a deterministic tie-break: latest ingest wins, not engine-arbitrary.",
      ask: "Return each subscriber's most recent session: name, session date, and minutes — newest session first, all 16 subscribers.",
      template:
        "SELECT name, last_play, minutes\nFROM (\n  SELECT c.name AS name,\n         o.created_at AS last_play,\n         o.total AS minutes,\n         ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY o.created_at {2}, o.id DESC) AS recency\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n)\nWHERE recency = {3}\nORDER BY {4} DESC, name;",
      slots: [
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the per-subscriber partition key",
          why: "PARTITION BY o.customer_id gives every subscriber their own recency ladder — 16 independent competitions instead of one global sort. Partitioning on o.id makes every session its own ladder; on c.region collapses the rail to one ladder per region.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the newest-first ordering",
          why: "Recency means the ladder is ordered newest-first, so rank 1 IS the most recent session. ASC would flip every ladder and serve each member's OLDEST session — the pilot watch, not the resume point.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the top-rung filter",
          noVerify: true,
          why: "The rail is the TOP of each ladder: recency = 1. The rank 2 cut is a different product — the second-most-recent session — and the two one-session subscribers drop out of it entirely, since their ladder has a single rung.",
        },
        {
          answer: "last_play",
          kind: "keyword",
          label: "the rail's display sort key",
          why: "The rail reads newest-session-first across members, so the outer sort descends on last_play with name as the deterministic tie-break. Sorting on minutes would display longest sessions instead of freshest ones; recency isn't projected outside the derived table at all.",
        },
      ],
      distractors: ["o.id", "c.region", "ASC", "minutes", "recency"],
      walkthrough:
        "One derived table, one filter, one sort. The derived table joins sessions to members and ranks each session inside its subscriber partition: ROW_NUMBER, PARTITION BY o.customer_id, ordered created_at DESC with id DESC as the deterministic tie-break for same-date sessions — the details that separate a shippable rail from a doubled or mis-scoped one. The outer query keeps rank 1: exactly one row per subscriber, 16 rows because every member has at least one session, and the two one-session members ride a one-rung ladder where rank 1 is also their only session. The display sort walks the rail on last_play descending — the top slot is the log's last session, 2025-02-27, held by the member whose census line reads 17 sessions and 6,640.56 minutes. The distractors fail instructively: partitioning on o.id makes every session its own ladder (103 'rails' of one row), and on c.region collapses the rail to one entry per region; ASC in the ladder ordering flips every member's rail entry to their oldest session; minutes as the display key shows the longest recent sessions rather than the freshest; and recency isn't visible outside the derived table — staging exists precisely so the rank filter can live somewhere legal. Partition key, ordering, tie-break, cut: say all four out loud and the rail is defined, not just written.",
    },
  ],

  problems: [
    { slug: "second-most-recent-activity", why: "Netflix's canonical screen in tagged form: the second-most-recent play per user, with the one-activity edge case — the exact argmax grammar of the kit's continue-watching case." },
    { slug: "movie-rating", why: "The multi-part composed report: argmax by one rule, per-person aggregates by another, set-op stitched — composition under pressure for the screen's final act." },
    { slug: "actors-and-directors-who-cooperated-at-least-three-times", why: "The threshold census: pairs crossing a 3-occurrence bar — 'which subscriber-title pairs hit 3+ plays' is the same HAVING read with a streaming accent." },
    { slug: "reformat-department-table", why: "The pivot wall: states folded into columns with CASE — the engagement dashboard's month × status grid in interview clothing." },
    { slug: "find-churn-risk-customers", why: "The lapse read: anti-join plus date math that flags members whose quiet window crossed the bar — Netflix's churn query, in the tagged problem it belongs to." },
    { slug: "cohort-retention-matrix", why: "The retention grid: signup cohort × week-N offset — the matrix the growth review opens with, built from raw event rows." },
    { slug: "week-over-week-churn", why: "LAG churn on a weekly spine: this week's leavers against last week's pool — the window-before-WHERE pipeline drill in its tagged form." },
    { slug: "null-blank-audit", why: "Telemetry hygiene: NULL and blank cells counted per column with conditional SUMs — the audit that keeps COUNT(col) reads honest on a log full of open sessions." },
    { slug: "sessionize-events", why: "THE sessionization problem: gap-thresholded event grouping — the kit's binge-run case in graded form, LAG to running-SUM island key." },
    { slug: "report-contiguous-dates", why: "Contiguous-day runs into paired status rows — the streak-block build Netflix uses to separate nightly habits from one-off binges." },
    { slug: "active-users", why: "Consecutive-day activity windows — the 'is this viewer a habit' question, drilled as streak counting over an event log." },
    { slug: "biggest-window-between-events", why: "LEAD's finest hour: the biggest quiet window per entity — the winback twin of the LAG gap read, pointing the lookback forward." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the 1,1,3 pattern said out loud before any leaderboard escalation." },
    { slug: "the-most-recent-three-orders", why: "Per-member latest-3 via partitioned ROW_NUMBER — the 'recently watched' rail with a depth cut, tie-break included." },
    { slug: "top-five-artists", why: "Top-N by streams — the leaderboard cut with LIMIT, and the tie-at-the-boundary conversation the case study makes explicit." },
    { slug: "dau-wau-stickiness", why: "Trailing-window actives: DAU over WAU — the stickiness ratio that separates the every-night household from the weekend binge." },
  ],
};
