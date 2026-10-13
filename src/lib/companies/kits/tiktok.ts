// TikTok — kit 5 of the Streaming & Social domain (Batch C).
// The For You funnel (impression → watch → like → share) and session
// velocity: every post is a test, every session is a race, and the
// denominator of every rate is the whole argument.
// Registry tags exactly ONE sql row for TikTok (budget-pacing) — the pool
// is THEME-CURATED: topics and problems mirror For You funnel analytics,
// session/streak windows and creator-side reads.
// Case studies run on the storefront db with probed figures from
// scripts/company-facts.md, mapped as: orders = engagement events,
// customers = users, suppliers = creators, shipped_at = event completion
// (delivered = watched through, shipped = engaged, pending = impression
// not yet watched, cancelled = skipped).

import type { CompanyKit } from "../types";

export const tiktokKit: CompanyKit = {
  id: "tiktok",
  domainId: "media",
  name: "TikTok",
  tagline: "The For You funnel, session by session",
  accent: "text-fuchsia-400",

  brief: [
    "TikTok is the shortest feedback loop in media: every post is pushed to a test audience of strangers, and the **For You funnel** — {orange:impression}, watch, like, share — decides within hours whether that audience grows or the post dies quietly. Distribution is algorithmic, so there is no follower floor to hide behind: a first-time creator and a household name live or die by the same {rose:watch-through} rate. The company's two obsessions follow directly. First, the funnel: each stage's rate is computed against a **named denominator** — likes over WATCHES, not impressions; shares over watches; completion over ALL impressions — because moving the denominator moves the story. Second, session velocity: the app is built to be reopened, so events per session and sessions per user per day are the compounding metrics every surface change is judged on.",
    "The data org works at event-stream tempo. Engagement events carry a user, a video, a creator, a start stamp and a completion stamp; incomplete events are the top of the funnel, not garbage — an impression that never became a watch is the cheapest signal the platform has. Analysts sit in **three loops**: the funnel loop (stage censuses, drop-off deltas, per-region completion reads), the session loop (stitching events into sessions with a gap threshold, burst detection against the hourly baseline, {emerald:streaks} of consecutive-day activity), and the creator loop (leaderboards, follower roll-ups, pacing of distribution against plan). In this kit's toy warehouse: orders are engagement events, customers are users, suppliers are creators, products are videos, and `shipped_at` is the event completion stamp — `delivered` means watched through.",
    "The SQL screens are funnel arithmetic at speed. Warmups are conditional folds — {emerald:watched}, engaged, queued and skipped events in ONE scan with branch sums that reconcile to `COUNT(*)` — and the **two-grain read**: events versus distinct users, because intensity (events per user) is the velocity signal. Middles are window work: `LAG` for the gap between a user's events, `ROW_NUMBER` for stitching sessions, RANK for the feed ladder where ties are routine. Back ends are the denominator gauntlet — watch-through by region, like-rate by creator, first-breach reads on pacing — where filtering before the ratio silently rebuilds the population and a 100% region on a two-event sample is the trap the interviewer is waiting for you to catch.",
    "Prepare by saying denominators out loud and staging windows before filtering them. The drill list: one-pass stage censuses (`SUM(CASE …)` or `FILTER (WHERE …)`) whose branches sum to the census; the two-stage session stitch (`LAG` in an inner query, gap filter outside); the rank trio with a stated tie rule; honest rates with **100.0** before the division and the denominator's population named; and running sums for pacing with the **FIRST breach row**, not every breach row. If you can explain — before running anything — what result would falsify your query, you are speaking TikTok's language.",
  ],

  dayInLife: [
    "**09:10 —** The funnel read. Overnight events land and the first query is a one-pass census: watched-through, engaged, queued, skipped — branch sums reconciled against `COUNT(*)` before the number goes anywhere, because *a census that doesn't reconcile is a rumor with a chart*. Next comes the {rose:drop-off}: which stage moved since yesterday — fewer impressions (a distribution change), or the same impressions converting worse (a packaging or content change)? The diff query that splits those two is the morning's deliverable, and it is always a conditional aggregate over one population, never two queries with two denominators.",
    "**11:40 —** Velocity work. The session team wants events-per-session and sessions-per-user with the stitch definition attached — `LAG` inside an inner query, the 30-minute gap rule stated, the NULL first session handled as 'first', not zero. The growth team wants the {violet:velocity cohort}: users above an events threshold, their watch value, and the share of total value that cohort holds — a fold, a gate, and a concentration stat. The creator loop wants leaderboards with a tie rule named in advance, follower roll-ups per creator, and pacing reads where the running sum catches the **FIRST breach day**, because 'we overspent all week' and 'we overspent Tuesday' are different incidents.",
    "**15:00 —** Stakeholder defense with denominators pinned. The regional funnel read ships with every share's population named — completed of ALL events in region, not of dispatched events — and the two-event region's **100%** carries its sample size beside it or it doesn't ship. Burst reads go out against the hourly baseline: peak hour versus average hour, *computed from buckets, not eyeballed*. The room argues about definitions; the packet settles them, because every rate arrives with its denominator in the first row.",
    "**17:40 —** Reconciliation and definition hygiene. Branch sums to census one last time, stage vocabularies checked against the event store's actual status domain — *the 'liked' literal that returned zeros forever is a folk tale here* — and **every metric change reviewed like a code change**. The EOD note records which stages moved, which denominators were defended, and which pacing breach was real. TikTok SQL exists to keep funnel numbers honest at a tempo where dishonest ones compound by lunch.",
  ],

  metrics: [
    { name: "Watch-through rate", what: "Watched-through events ÷ ALL impressions. The For You gate — the denominator is the offered population, and filtering it before the ratio is the cardinal sin." },
    { name: "Like rate", what: "Likes ÷ WATCHED events — not impressions. The denominator ladder is the metric: each stage's rate is computed against the stage before it, never the top of the funnel." },
    { name: "Share rate", what: "Shares ÷ watched events. The amplification multiplier — the strongest distribution signal per view, and a conditional count over a named population." },
    { name: "Session velocity", what: "Events per session and sessions per user per day. The compounding metric — session stitching with a stated gap threshold is its daily driver." },
    { name: "Funnel drop-off", what: "Stage-to-stage deltas: impression → watch → like → share. The largest delta is where the product team looks first, and computing it is one census with reconciling branches." },
    { name: "First-hour engagement", what: "Engagement in a post's first hour against its eventual total. The early-signal read that decides distribution — an hour-bucketed conditional fold." },
    { name: "Return-visit rate", what: "Users back within 7 days ÷ all users in the window. The habit read — a two-event-inside-a-window query with the window named." },
    { name: "Pacing breach", what: "Distribution (or spend) against plan through the day, caught by a running sum and the FIRST breach row. Overspend is an incident with a timestamp, not a weekly total." },
  ],

  topics: [
    {
      name: "Impression-to-watch ratios",
      why: "The For You gate is a ratio with a fixed denominator: completion over ALL impressions. TikTok drills rate expressions — 100.0 before division, same-fold numerator and denominator — because the wrong denominator turns a packaging problem into a distribution story.",
      slugs: ["get-highest-answer-rate-question", "ads-performance", "immediate-food-delivery-ii"],
    },
    {
      name: "Funnel-stage censuses",
      why: "Watched, engaged, queued, skipped — the stage picture must come out of ONE scan, with CASE branches that reconcile to COUNT(*). Bucketing events into stages and counting the buckets is the single most-repeated query family here.",
      slugs: ["calculate-orders-within-each-interval", "count-salary-categories", "active-businesses"],
    },
    {
      name: "Velocity & participation",
      why: "Events per user is the intensity signal: who watches most, what share of users participate at all, how sticky the loop is. The velocity reads are argmax-on-counts and participation shares — grouped folds where the grain is the whole question.",
      slugs: ["customer-placing-the-largest-number-of-orders", "percentage-of-users-attended-a-contest", "dau-wau-stickiness"],
    },
    {
      name: "Bursts & sessions",
      why: "A session is stitched from an ordered stream: LAG for the gap, a threshold for the cut, then per-session metrics. Burst detection compares peak buckets against the average — TikTok's rhythm reads all start with time-bucketed folds and two-stage windows.",
      slugs: ["sessionize-events", "find-bursty-behavior", "count-the-number-of-experiments"],
    },
    {
      name: "Streaks & consecutive engagement",
      why: "Habit is measured in consecutive days: active-day streaks, contiguous spans, winning runs. Gaps-and-islands machinery — ROW_NUMBER against the date, GROUP BY the difference — decides who counts, and the ordering rules decide what counts.",
      slugs: ["active-users", "report-contiguous-dates", "longest-winning-streak"],
    },
    {
      name: "Creator-side reads",
      why: "Suppliers are creators here: earnings leaderboards, like-distribution histograms, follower roll-ups per channel. The creator loop lives on grouped folds with honest orderings — and a stated tie rule before any leaderboard ships.",
      slugs: ["top-earners", "ratings-histogram", "find-followers-count"],
    },
    {
      name: "Feed ladders & rank shares",
      why: "The feed ladder is competition semantics: ties share a rung and the next rung skips, or the ladder is dense — a business decision, not a default. Rank-as-percentage reads turn the ladder into shares of the surfaced population.",
      slugs: ["rank-scores", "second-most-recent-activity", "compute-the-rank-as-a-percentage"],
    },
    {
      name: "Return windows & first sessions",
      why: "The habit loop is a window: users back within seven days, first-session cohorts, daily new-user counts. First-occurrence subqueries and two-events-inside-a-window reads are the shapes — and the empty-cohort edge case is the follow-up.",
      slugs: ["users-with-two-purchases-within-seven-days", "new-users-daily-count", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Honest denominators",
      why: "Every TikTok rate is one filter away from a different story: acceptance rates, quality ratios, per-watch shares. The house habit — decide the denominator's population BEFORE the ratio, promote the division with 100.0, round at the end — is drilled as a reflex.",
      slugs: ["queries-quality-and-percentage", "friend-requests-i-overall-acceptance-rate", "low-quality-problems"],
    },
    {
      name: "Pacing & running sums",
      why: "Distribution against plan is a running sum with a breach timestamp: cumulative totals per day, the first crossing, the frame that makes 'first' mean first. The tagged pacing problem is the exact shape — ROWS frames and staged gates decide the answer.",
      slugs: ["budget-pacing", "game-play-analysis-iii", "running-total-for-different-genders"],
    },
  ],

  theory: [
    {
      id: "tiktok-t1",
      q: "The For You census needs watched, engaged, queued and skipped events in one scan — and the branches must sum to the total. How do you build and audit it?",
      a: "One population, one pass, one aggregate per branch: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) — or COUNT(*) FILTER (WHERE …) — for each stage, with COUNT(*) beside them as the census. Reconciliation is then structural: 52 + 30 + 14 + 7 must equal 103, so a census that reads 104 has a branch double-counting or a population that drifted. Two failure classes to name out loud: vocabulary drift — 'liked' is not an event-store status, so a branch holding it reads a silent zero forever; and exhaustiveness — a new status value lands in the data and no branch catches it, which is why the ELSE arm or the reconciling identity is non-negotiable. The CASE-SUM twin exists for engines without FILTER; the discipline that matters is one scan, one population, and branches that must sum.",
      tag: "aggregation",
    },
    {
      id: "tiktok-t2",
      q: "The creator leaderboard joins events to videos to creators. Why does COUNT(*) stop meaning 'events' after that chain, and what's the fix?",
      a: "Because joins change grain. Events to videos is many-to-one and safe; any one-to-many hop — line items per event, multiple videos per creator path — multiplies rows, and COUNT(*) starts counting the fan-out product: 103 events become 251 rows and the 'event count' inflates silently. The fix is purposeful, not reflexive: COUNT(DISTINCT event_id) folds the fan-out back to events when the census is the ask, while an aggregate over the fanned grain (SUM of line-item value) is correct AS line-item value and should be labeled so. The habit the interviewer listens for: after every JOIN, say 'one row per what?' — because on the For You funnel, an inflated event count inflates every stage rate that divides by it.",
      tag: "joins",
    },
    {
      id: "tiktok-t3",
      q: "Sessions-per-user requires stitching events with a 30-minute gap rule. Sketch the query, and explain where the streak logic differs.",
      a: "Two stages, because window results can't be filtered in WHERE. Inner: LAG(created_at) OVER (PARTITION BY user_id ORDER BY created_at) hands each event its predecessor; a flag marks a new session when julianday(created_at) - julianday(prev) crosses 30.0/1440 days. Outer: SUM over the flag per user counts sessions, and events-per-session divides the event census by it. The NULL first row is 'first session', not a bug — COALESCE it only with intent. Streak logic differs at the grouping step: consecutive-DAY runs use the gaps-and-islands trick, day minus ROW_NUMBER() OVER (ORDER BY day), which is constant inside an island and jumps at every gap — then GROUP BY that value and COUNT the run. Session stitching measures time between events; streaks measure calendar adjacency. Confusing the two is how '7-day streaks' quietly become '7 events'.",
      tag: "windows",
    },
    {
      id: "tiktok-t4",
      q: "Average completion lag reads 2.98 on the event store — but 21 events carry a NULL completion stamp. What population produced that number, and how do you ship it honestly?",
      a: "AVG(julianday(shipped_at) - julianday(created_at)) runs over completed events only: the 21 NULL stamps drop out of the aggregate silently, so 82 of 103 events produced the 2.98. That can be the right number, but it ships labeled 'average over completed events' — never as 'average event duration'. The honest shapes: filter WHERE shipped_at IS NOT NULL and say so in the column name or footnote, or split the read — AVG over completed beside COUNT over all — so the population rides with the mean. The sin is COALESCE(shipped_at, created_at) to 'fix' the NULLs: that stamps every in-flight impression with a zero-day completion and drags the average toward a number that describes nobody. On the For You funnel, where in-flight volume IS the top of the funnel, NULL is a state to report — not a zero to fabricate.",
      tag: "nulls",
    },
    {
      id: "tiktok-t5",
      q: "Watch-through rate by region: where does the 'watched' filter live, and what does every region read if it lives in WHERE first?",
      a: "The watched condition belongs inside the numerator's conditional aggregate — SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) — while COUNT(*) stays unfiltered as the denominator, because the definition is watched share of ALL events. Put the filter in WHERE and the denominator shrinks to the numerator's population: every region reads 100.0, a query that executes perfectly and answers nothing. HAVING is the same trap later — it judges post-aggregation groups and can only drop whole regions, never recover the rows the filter discarded. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT — is the checklist: row-level facts fold into conditional aggregates, group-level facts gate in HAVING, and the rate's two folds must touch identical rows. On a funnel metric, the denominator IS the definition; everything else is arithmetic.",
      tag: "pipeline",
    },
    {
      id: "tiktok-t6",
      q: "The 'first-session cohort' — users whose first event landed in a launch window — needs building. What query shapes do you reach for, and what does the empty inner query do?",
      a: "First occurrence is a fold-then-join problem with three honest shapes. The scalar route: a correlated subquery SELECT MIN(created_at) FROM events e2 WHERE e2.user_id = e1.user_id — correct, re-executed per row. The derived route: fold first stamps grouped by user in an inner query, then join back on user and first stamp — one pass, the workhorse for cohort windows. The window route: ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) = 1 keeps first rows without a join and extends cleanly to 'first event per day'. The empty-case answer is the differentiator: if the inner fold returns nobody (the launch window had no traffic), an INNER join silently ships an empty cohort — correct but indistinguishable from a bug — while the OUTER join keeps every user with NULL cohort columns. Say which you want before you run it; on funnel metrics, an empty cohort and a broken cohort must not look alike.",
      tag: "subqueries",
    },
    {
      id: "tiktok-t7",
      q: "First-hour engagement decides distribution. How do you bucket events by hour of day, and where do the date bugs hide?",
      a: "STRFTIME('%H', created_at) is the hour bucket — capital %H is the two-digit 00-23 hour, and it is the only format here that answers 'what hour does engagement peak'. The traps: '%h' is the month abbreviation and merges a year of data into twelve buckets labeled Jan-Dec; '%Y-%H' crosses day boundaries while collapsing dates, so 2am from every day lands in one bucket; and HOUR(created_at) simply doesn't exist in SQLite — it errors, which is at least honest. For first-hour reads the shape is a two-stage window: bucket by hour since the post's created_at (julianday difference, floored), then filter to the first bucket — a half-open range (>= start AND < start + interval), because BETWEEN on timestamps swallows the boundary and double-counts the hour handoff. And name the time zone the stamp claims: a global funnel read in one naive zone is a trend, not a truth.",
      tag: "dates",
    },
    {
      id: "tiktok-t8",
      q: "The morning census and the regional funnel disagree by three events. Walk me through your debug, and the guard that prevents the next one.",
      a: "Trust the reconciliation identity before any theory: run COUNT(*) alone, then each stage branch alone, then the branch sums — whichever pair disagrees localizes the bug. The usual suspects, in order of frequency: vocabulary drift (a branch holds a literal from another table's domain — 'paid' on an event table reads zero forever), a WHERE that rebuilt one query's population but not the other's, and a JOIN that fanned the grain so one side counts events while the other counts line items. The guard is structural, not procedural: build the census so its branches are exhaustive over the status column's actual domain, assert branch-sum-equals-census inside the query itself, and dedupe replayed events with a ROW_NUMBER key (user, video, timestamp) before any stage counts. At TikTok the census is the source of truth for the whole funnel — a census that can't reconcile doesn't get corrected, it gets replaced by one that asserts its own arithmetic.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "tiktok-mcq-1",
      prompt: "The event store logs 103 For You events; 52 are watched-through (status 'delivered'). Which expression computes the watch-through rate?",
      choices: [
        "SUM(status = 'delivered') * 100 / COUNT(*)",
        "100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*)",
        "COUNT(status = 'delivered') * 100.0 / 103",
        "100.0 * COUNT(*) / SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)",
      ],
      answer: 1,
      why: "The conditional sum counts watched-through events at the same fold as COUNT(*) counts ALL impressions, and 100.0 forces real division: 50.49 — the watch-through rate the funnel dashboard prints at one decimal.",
      notes: [
        { choice: 0, why: "The boolean-as-0/1 trick works in SQLite, but INTEGER 100 forces integer division: 5200/103 truncates to 50 before rounding ever sees it." },
        { choice: 3, why: "That's the reciprocal — impressions per watch-through, ~198. A plausible-looking number for a metric nobody defined." },
      ],
      difficulty: "easy",
    },
    {
      id: "tiktok-mcq-2",
      prompt: "APAC served 37 events to 5 users. Which expression returns the velocity read — events per user?",
      choices: [
        "COUNT(*) / COUNT(DISTINCT customer_id)",
        "COUNT(DISTINCT customer_id) / COUNT(*)",
        "COUNT(*) / 5",
        "AVG(customer_id)",
      ],
      answer: 0,
      why: "Events per user is the event census over the people census: 37.0/5 = 7.4 — the intensity signal that says this region re-watches. The 100.0 promotion (or a ::REAL cast) keeps the division honest.",
      notes: [
        { choice: 1, why: "That's users per event — 0.14, the reciprocal. Right idea, inverted fraction, wrong story." },
        { choice: 2, why: "Hardcoding the 5 rots the moment a sixth user arrives — and skips the DISTINCT count that makes the query self-updating." },
      ],
      difficulty: "easy",
    },
    {
      id: "tiktok-mcq-3",
      prompt: "The stage census folds events into buckets; the review wants only stages with at least 20 events. Which clause keeps them?",
      choices: [
        "WHERE COUNT(*) >= 20",
        "HAVING COUNT(*) >= 20",
        "LIMIT 20",
        "ORDER BY COUNT(*) DESC TOP 20",
      ],
      answer: 1,
      why: "The 20-event bar judges a group aggregate, so it lives in HAVING — the only clause that runs after GROUP BY. WHERE filters rows before the fold and can't even see COUNT(*).",
      notes: [
        { choice: 0, why: "A syntax error at best: aggregates are illegal in WHERE. The gate must wait until the buckets exist." },
        { choice: 2, why: "LIMIT 20 keeps 20 ROWS — of four stage buckets, that's all of them. It caps output, it doesn't filter groups." },
      ],
      difficulty: "medium",
    },
    {
      id: "tiktok-mcq-4",
      prompt: "Posting-hour reads: which expression buckets each event by hour of day (00-23)?",
      choices: [
        "STRFTIME('%h', created_at)",
        "STRFTIME('%H', created_at)",
        "HOUR(created_at)",
        "STRFTIME('%Y-%H', created_at)",
      ],
      answer: 1,
      why: "Capital %H is the two-digit hour — the bucket the peak-hour chart needs. The format string is the whole metric: one wrong letter and the chart silently re-buckets a year of traffic.",
      notes: [
        { choice: 0, why: "Lowercase %h is the month abbreviation — the query runs, the chart shows 'Jan, Feb, Mar' and every day of the year collapses into it." },
        { choice: 2, why: "There is no HOUR() function in SQLite — it errors. The strftime idiom is the only route." },
      ],
      difficulty: "medium",
    },
    {
      id: "tiktok-mcq-5",
      prompt: "21 of 103 events carry a NULL completion stamp. `AVG(julianday(shipped_at) - julianday(created_at))` treats them how?",
      choices: [
        "As zero-day completions, dragging the average down",
        "Excluded — NULL rows drop out of the aggregate silently",
        "Replaced with the column's mean",
        "The query errors on the first NULL",
      ],
      answer: 1,
      why: "AVG skips NULLs by definition: the 2.98 is an average over the 82 completed events only. That's why the metric ships labeled 'average over completed' — the population is part of the number.",
      notes: [
        { choice: 0, why: "Zeros require COALESCE(shipped_at, created_at) — which fabricates instant completions for every in-flight event. NULL is exclusion, not zero." },
        { choice: 3, why: "No error — aggregates are NULL-tolerant, which is exactly why this population drift ships so quietly." },
      ],
      difficulty: "medium",
    },
    {
      id: "tiktok-mcq-6",
      prompt: "Like rate is defined as likes ÷ WATCHED events. `liked` is a 1/0 flag. Which expression keeps the definition?",
      choices: [
        "AVG(liked) over rows WHERE status = 'delivered'",
        "AVG(liked) over all rows",
        "SUM(liked) / COUNT(DISTINCT customer_id)",
        "COUNT(liked) / COUNT(*)",
      ],
      answer: 0,
      why: "The mean of a 1/0 flag over the WATCHED population IS likes per watched event — numerator and denominator fold from identical rows. The WHERE is part of the definition here, stated before the ratio.",
      notes: [
        { choice: 1, why: "All rows puts impressions in the denominator — that's the impression-to-like rate, a different rung of the denominator ladder." },
        { choice: 3, why: "COUNT(liked) counts non-NULL flags, not likes — with any NULL flags present it drifts toward a rate of 1." },
      ],
      difficulty: "medium",
    },
    {
      id: "tiktok-mcq-7",
      prompt: "Daily spend accrues against a constant plan P. Which query returns the FIRST day cumulative spend crosses P?",
      choices: [
        "WHERE running_total > P — filtered on the running sum",
        "Stage it: compute the running sum per day, keep breach days, then ROW_NUMBER() OVER (ORDER BY day) = 1",
        "HAVING MAX(running_total) > P",
        "ORDER BY running_total DESC LIMIT 1",
      ],
      answer: 1,
      why: "Three stages, stated in order: the running sum (a window), the breach population (a filter on that window), the first row (a rank). Each stage exists because the previous one's output can't be filtered in place.",
      notes: [
        { choice: 0, why: "That returns EVERY breach day — the ask was the first. The incident report needs a timestamp, not a wall of dates." },
        { choice: 3, why: "Biggest breach, not first breach — Thursday's overshoot hides Tuesday's, and the postmortem interviews the wrong day." },
      ],
      difficulty: "hard",
    },
    {
      id: "tiktok-mcq-8",
      prompt: "A teammate computes regional watch-through as: filter WHERE status = 'delivered', then delivered ÷ delivered per region. What prints?",
      choices: [
        "The true regional rates",
        "50.5 everywhere",
        "100.0 for every region — the denominator shrank to the numerator's population",
        "NULL for regions with no delivered events",
      ],
      answer: 2,
      why: "Filtering before the ratio rebuilds the population: every surviving row is delivered, so the share is 100% by construction. The honest fold keeps the numerator conditional and the denominator unfiltered — same rows, two folds.",
      notes: [
        { choice: 0, why: "The query executes and looks plausible — which is why denominator drift is the most expensive silent bug in funnel reporting." },
        { choice: 2, why: "Careful: LATAM reads 100.0 even in the honest version (2 of 2) — a small sample wearing a perfect rate. Sample size rides beside every share." },
      ],
      difficulty: "hard",
    },
    {
      id: "tiktok-mcq-9",
      prompt: "events JOIN event_items fans 103 events to 251 rows. Which expression still reports the true event count?",
      choices: [
        "COUNT(*) — 251",
        "COUNT(e.id) — the join keeps event ids on every row",
        "COUNT(DISTINCT e.id) — folds the fan-out back to events",
        "COUNT(DISTINCT i.item_id) — items are what multiplied",
      ],
      answer: 2,
      why: "The join multiplied each event by its line items, so plain COUNTs read 251. COUNT(DISTINCT e.id) folds back to 103 events — the census every stage rate divides by.",
      notes: [
        { choice: 1, why: "COUNT(e.id) still counts one row per line item — 251. DISTINCT is what folds, not the column choice alone." },
        { choice: 3, why: "Distinct items is a different census — item variety per join, not event count. Right tool, different question." },
      ],
      difficulty: "hard",
    },
    {
      id: "tiktok-mcq-10",
      prompt: "The For You ladder uses RANK() (competition semantics). Two creators tie at 46 watched events; the next has 31. What rank does the 31-event creator get?",
      choices: ["2", "3", "4", "31"],
      answer: 1,
      why: "RANK lets ties share the rung and then SKIPS: both 46-event creators take rank 1, and the next distinct value takes rank 3 — the gap is competition scoring telling you a slot was contested. DENSE_RANK would say 2; ROW_NUMBER would say 3 with an arbitrary tie order.",
      notes: [
        { choice: 0, why: "That's DENSE_RANK's answer — no gap. If the ladder's tie rule is competition semantics, the gap is the feature." },
        { choice: 2, why: "Ranks reach 4 only after a third distinct value. Two tied firsts plus one follower is 1, 1, 3." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-tiktok-1",
      tier: "medium",
      topic: "s6",
      universe: "funnel",
      title: "The For You funnel census, region by region",
      brief:
        "TikTok-flavored brief on the storefront db: the growth review wants the funnel census cut by region — watched-through and engaged events beside each other, with the watch-through share computed the only honest way. Probed facts: 103 events; overall 52 watched-through of 103 (50.5); by region APAC 21 watched of 37, EU 24 of 45, US 5 of 19, LATAM 2 of 2. The definitions are fixed before any SQL: watched = the event store's delivered completion state; engaged = shipped (in-progress); the share's denominator is ALL events in the region — dispatched-only denominators are how a 26% region learns to call itself healthy. The read sorts by watched count, biggest first, because the review argues about load before it argues about rates.",
      ask: "Return per region: watched events, engaged events, and the watch-through share (1 decimal), biggest watched count first.",
      template:
        "SELECT c.region,\n       SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS watched,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS engaged,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) / {2}(*), 1) AS watched_share\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY watched {3};",
      slots: [
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the engaged-stage literal",
          why: "Engaged means in-progress, and the event store spells that 'shipped' — 12 EU, 8 APAC, 10 US, 0 LATAM. A 'liked' or 'completed' literal compiles and reads zeros forever: vocabulary drift is the funnel census's classic silent failure.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the all-events denominator",
          why: "COUNT(*) folds every event in the region — 37, 45, 19, 2 — so numerator and denominator fold from identical rows. SUM(*) doesn't exist, and MAX(*) would report one event, not the population the share is defined against.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-load-first direction",
          why: "The review opens on load: EU 24 watched, APAC 21, US 5, LATAM 2 — descending. ASC would lead with LATAM's two-event sample wearing a 100.0 share, the exact misread the sample-size caution exists for.",
        },
      ],
      distractors: ["'liked'", "'completed'", "SUM", "ASC"],
      walkthrough:
        "One scan, two conditional folds, one unfiltered denominator. The join attaches every event to its region — all 103 survive — and each SUM(CASE) folds a stage inside the same GROUP BY: watched reads 24/21/5/2 and engaged reads 12/8/10/0 per region. The share divides the watched fold by COUNT(*) — the SAME rows the numerator folded — so EU reads 53.3, APAC 56.8, US 26.3 and LATAM 100.0, and the story lands where the denominator says it should: US is the soft spot (five of nineteen), LATAM's perfect rate is two events, and APAC out-converts the bigger EU load. The literal slot is where reports die quietly: 'liked' is a reaction, not an event-store status, and 'completed' isn't either — both compile, both read zeros in the engaged column forever, and nothing errors. Filter the delivered rows in WHERE first and every region's share becomes 100.0 — the denominator-drift failure this census is built to make impossible. Branch sums (24+21+5+2 = 52 watched) reconcile against the 52-event overall read: the census audits itself.",
    },
    {
      id: "cs-tiktok-2",
      tier: "hard",
      topic: "q6",
      universe: "growth",
      title: "The velocity cohort",
      brief:
        "TikTok-flavored brief on the storefront db: the retention review's headline is concentration — probed fact: viewers whose watch value crosses 3000 hold 63.5% of ALL watch value. The velocity cohort is the retention team's version of that read: users with at least TEN engagement events in the window, listed with their event count and watch value, busiest first. Probed facts: 103 events across 16 users; the leaders are Alice Chen at 24 events (7262.35), Emma Wilson at 17 (6640.56), Grace Kim at 14 (4574.23) and Maya Patel at 13 (3644.56) — the same four users the concentration stat crowns. The threshold is a definition: ten events, not nine, not eleven — and the fold must happen per user BEFORE the gate, because a gate on raw rows is a different population entirely.",
      ask: "Return the velocity cohort: name, region, event count, and watch value (2 decimals) for users with at least ten events, busiest first.",
      template:
        "WITH per_user AS (\n  SELECT c.name AS name,\n         c.region AS region,\n         {1}(*) AS events,\n         ROUND(SUM(o.total), 2) AS watch_value\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name, c.region\n)\nSELECT name, region, events, watch_value\nFROM per_user\nWHERE events >= {2}\nORDER BY events {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the velocity counter",
          why: "Velocity is event COUNT per user — COUNT(*) folds 103 events to per-user tallies (24, 17, 14, 13 at the top). SUM(*) doesn't exist, and AVG(*) would report one event per user, erasing the velocity signal entirely.",
        },
        {
          answer: "10",
          kind: "number",
          label: "the cohort threshold",
          noVerify: true,
          why: "The retention team fixed the bar at ten events: four users clear it. A 5 would pull Chloe Dubois in at five events and 2667.93 — one rung down, a different cohort, a different headline.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The cohort reads Alice 24, Emma 17, Grace 14, Maya 13 — busiest first. ASC would open the review with Maya, a correct query aimed at the wrong end of the leaderboard.",
        },
      ],
      distractors: ["SUM", "AVG", "ASC", "5"],
      walkthrough:
        "A fold, then a gate on the folded grain — the CTE is what makes the gate honest. The inner query joins all 103 events to their users and GROUP BY folds to one row per user: COUNT(*) is the velocity tally, ROUND(SUM(o.total), 2) is watch value — Alice Chen 24 / 7262.35, Emma Wilson 17 / 6640.56, Grace Kim 14 / 4574.23, Maya Patel 13 / 3644.56, down to the two one-event users at the bottom. The outer query applies the definition — events >= 10 — on the folded column, which is WHERE-on-a-CTE semantics doing HAVING's job with a name the reviewer can read. Four users survive; ordered DESC they read 24, 17, 14, 13. The threshold is where the story lives: drop it to 5 and Chloe Dubois (5 events, 2667.93) walks in — the cohort grows to five and the concentration headline waters down; the retention team chose 10 because it lands exactly on the four users holding 63.5% of watch value. AVG in the counter slot is the sneaky one — it compiles, returns a uniform 1, and the cohort empties to nobody, a silent zero where a leaderboard should be.",
    },
  ],

  problems: [
    { slug: "budget-pacing", why: "The tagged row and the pacing flagship: a running sum against plan with the first breach flagged — distribution-pacing reads, one ROWS frame at a time." },
    { slug: "sessionize-events", why: "Stitching an ordered stream into sessions with a gap threshold — the two-stage LAG-then-regroup shape behind every events-per-session metric." },
    { slug: "find-bursty-behavior", why: "Peak bucket against the average — the burst factor read that separates a viral hour from a flat baseline." },
    { slug: "immediate-food-delivery-ii", why: "The completed-share ratio over ALL events — the watch-through question with its denominator welded on." },
    { slug: "active-users", why: "Consecutive-day activity detection — the streak logic that decides whether a session loop is becoming a habit." },
    { slug: "rank-scores", why: "Pure ranking semantics on ties — the 1,1,3 versus 1,1,2 vocabulary check before any feed ladder ships." },
    { slug: "top-earners", why: "The creator earnings leaderboard — a grouped fold ordered by value, the supplier-side read with a tie rule attached." },
    { slug: "find-followers-count", why: "Follower roll-ups per creator — the commitment-stage census of the creator loop." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Two events inside a seven-day window — the return-visit definition retention reports live on." },
    { slug: "get-highest-answer-rate-question", why: "Rate-per-entity argmax — the 'which post converted best' read with the ratio folded before the rank." },
    { slug: "percentage-of-users-attended-a-contest", why: "Participation share of the whole population — the challenge-funnel read where the denominator is everyone, stated." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The velocity argmax: who fired the most events — a grouped count decided before any ORDER BY drama." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator drill behind every funnel rate." },
    { slug: "create-a-session-bar-chart", why: "Session counts bucketed into ranges — the histogram read that turns raw velocity into a distribution the review can read." },
    { slug: "new-users-daily-count", why: "First-event users per day — the first-session cohort census that anchors every retention curve." },
    { slug: "count-the-number-of-experiments", why: "Time-bucketed volume folds — the hour-of-day baseline that burst detection measures peaks against." },
  ],
};
