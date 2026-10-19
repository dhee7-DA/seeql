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
    "The full drill is built for spaced practice rather than one sitting: thirty-two theme-curated problems across streak islands, return windows, rank shares and pacing frames; thirty scenario MCQs that make the denominator argument before the arithmetic; and six case studies on the live storefront db — the funnel census, the velocity cohort, the per-video watch-through read, the creator watch ladder, the monthly pacing census and the stage-materiality gate. Rotate them; the interview is a tempo test, and tempo comes from reps.",
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
      slugs: ["get-highest-answer-rate-question", "ads-performance", "immediate-food-delivery-ii", "ad-free-sessions"],
    },
    {
      name: "Funnel-stage censuses",
      why: "Watched, engaged, queued, skipped — the stage picture must come out of ONE scan, with CASE branches that reconcile to COUNT(*). Bucketing events into stages and counting the buckets is the single most-repeated query family here.",
      slugs: ["calculate-orders-within-each-interval", "count-salary-categories", "active-businesses", "snaps-analysis"],
    },
    {
      name: "Velocity & participation",
      why: "Events per user is the intensity signal: who watches most, what share of users participate at all, how sticky the loop is. The velocity reads are argmax-on-counts and participation shares — grouped folds where the grain is the whole question.",
      slugs: ["customer-placing-the-largest-number-of-orders", "percentage-of-users-attended-a-contest", "dau-wau-stickiness", "find-users-with-high-token-usage", "leetcodify-similar-friends", "number-of-comments-per-post"],
    },
    {
      name: "Bursts & sessions",
      why: "A session is stitched from an ordered stream: LAG for the gap, a threshold for the cut, then per-session metrics. Burst detection compares peak buckets against the average — TikTok's rhythm reads all start with time-bucketed folds and two-stage windows.",
      slugs: ["sessionize-events", "find-bursty-behavior", "count-the-number-of-experiments", "human-traffic-of-stadium", "create-a-session-bar-chart"],
    },
    {
      name: "Streaks & consecutive engagement",
      why: "Habit is measured in consecutive days: active-day streaks, contiguous spans, winning runs. Gaps-and-islands machinery — ROW_NUMBER against the date, GROUP BY the difference — decides who counts, and the ordering rules decide what counts.",
      slugs: ["active-users", "report-contiguous-dates", "longest-winning-streak", "consecutive-numbers", "customers-with-maximum-number-of-transactions-on-consecutive-days", "find-the-start-and-end-number-of-continuous-ranges"],
    },
    {
      name: "Creator-side reads",
      why: "Suppliers are creators here: earnings leaderboards, like-distribution histograms, follower roll-ups per channel. The creator loop lives on grouped folds with honest orderings — and a stated tie rule before any leaderboard ships.",
      slugs: ["top-earners", "ratings-histogram", "find-followers-count", "second-degree-follower", "count-artist-occurrences-on-spotify-ranking-list", "leetcodify-friends-recommendations"],
    },
    {
      name: "Feed ladders & rank shares",
      why: "The feed ladder is competition semantics: ties share a rung and the next rung skips, or the ladder is dense — a business decision, not a default. Rank-as-percentage reads turn the ladder into shares of the surfaced population.",
      slugs: ["rank-scores", "second-most-recent-activity", "compute-the-rank-as-a-percentage", "movie-rating"],
    },
    {
      name: "Return windows & first sessions",
      why: "The habit loop is a window: users back within seven days, first-session cohorts, daily new-user counts. First-occurrence subqueries and two-events-inside-a-window reads are the shapes — and the empty-cohort edge case is the follow-up.",
      slugs: ["users-with-two-purchases-within-seven-days", "new-users-daily-count", "user-activity-for-the-past-30-days-i", "rolling-7d-actives", "game-play-analysis-v", "game-play-analysis-iv"],
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
    {
      id: "tiktok-t9",
      q: "The regional read needs two columns — events and users — out of one scan. How do you build the two-grain census, and what does the gap between the columns tell you?",
      a: "One GROUP BY region, two folds with different grains: COUNT(*) folds event rows — APAC's 37 — and COUNT(DISTINCT customer_id) folds people — APAC's 5. The columns are not duplicates; the gap between them IS the metric: 37.0/5 = 7.4 events per user, the intensity signal that says a region re-watches rather than widens. The failure mode is printing the same number twice — two COUNT(*)s read 37 and 37, a census that lost its audience read. Say 'one row per what?' for each column out loud: events for the first, users for the second. On this platform the two-grain census is the daily opening read, because distribution changes show up in the events column while habit changes show up in the gap.",
      tag: "aggregation",
    },
    {
      id: "tiktok-t10",
      q: "The creator loop wants creators whose videos drew zero events in the window. Sketch the anti-join and say what survives.",
      a: "Walk the chain LEFT: suppliers LEFT JOIN products ON p.supplier_id = s.id LEFT JOIN order_items ON oi.product_id = p.id LEFT JOIN orders ON o.id = oi.order_id, then keep only the unmatched — WHERE o.id IS NULL. The rows that survive are creators whose catalog exists but drew nothing this window: a distribution hole, not a data hole. The trap is window predicates in WHERE — o.created_at >= cutoff there converts the LEFT JOIN into an INNER and deletes exactly the zero-event creators the read exists to find; the window belongs in the ON clause. On this warehouse every creator drew at least one event, so an honest run returns an empty set — and an empty set that reconciles is a finding: say so, don't debug it into existence.",
      tag: "joins",
    },
    {
      id: "tiktok-t11",
      q: "WHERE gap > 30 minutes on a LAG-computed gap errors out. Where do window results live in the pipeline, and how do you filter them?",
      a: "Windows evaluate at SELECT time — after FROM, WHERE, GROUP BY and HAVING have already run — so a column computed by LAG does not exist when WHERE is evaluated; referencing it is a compile error, which is at least honest. The fix is staging: put the LAG in an inner query or CTE, then filter the gap in the outer query. The two-stage session stitch is exactly this — LAG inside, the 30-minute gap filter and the session count outside. The follow-up the interviewer wants: the same wall applies to window results in HAVING and to ranking functions in WHERE — anything computed over the folded set must be staged first. Say the pipeline order out loud — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and place every filter by asking whether its fact exists yet.",
      tag: "windows",
    },
    {
      id: "tiktok-t12",
      q: "Streak runs and stitched sessions both 'group activity', but the machinery differs. When is date minus ROW_NUMBER the right key, and when is a LAG gap?",
      a: "Streaks measure calendar adjacency: day minus ROW_NUMBER() OVER (ORDER BY day) is constant inside a run of consecutive days and jumps at every gap — GROUP BY that value and COUNT to get run lengths. Sessions measure time between events: LAG(created_at) over the ordered stream, then a threshold on the julianday difference cuts sessions. Conflating them is the classic silent bug — '7-day streaks' computed as 7 events, or sessions counted as calendar runs. The tell is the definition you were handed: consecutive DAYS is islands; a gap threshold in MINUTES is stitching. On the For You funnel both exist — the habit board runs streaks, the session team runs stitches — and the strong answer names which machinery each board is buying before writing either.",
      tag: "windows",
    },
    {
      id: "tiktok-t13",
      q: "The pacing read accumulates daily events against a constant plan and must flag the FIRST breach day. Which window frame, and why not the default?",
      a: "SUM(events) OVER (ORDER BY day ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) — an explicit ROWS frame. The default frame is RANGE, which with ORDER BY day includes peer rows — duplicates on the same day fold into the same cumulative step, and the pacing line stutters instead of stepping. ROWS makes the accumulation physical: one row at a time, in order. The breach is then a staged filter — cumulative > plan in an outer query — and 'first' means ROW_NUMBER() OVER (ORDER BY day) = 1 over the breach population, because the incident needs a timestamp, not a wall of dates. 'We overspent all week' and 'we overspent Tuesday' are different incidents; the frame choice is what makes the difference computable.",
      tag: "windows",
    },
    {
      id: "tiktok-t14",
      q: "The moderation sweep wants users with at least one dismissed session. EXISTS or IN — and where does NOT IN explode?",
      a: "EXISTS probes per outer user and short-circuits at the first dismissed row — average work is one match; IN materializes the full dismissed set first and then compares. Same results, different cost curve, and at For You event volumes the difference is a production incident waiting for a dashboard. The explosion is the negation: NOT IN with a single NULL in the inner list returns NOTHING — x NOT IN (…, NULL) can never be proven true — so 'users with no dismissed session' written as NOT IN quietly ships an empty register the day one dismissed row carries a NULL key. NOT EXISTS is the negation that survives NULLs; the LEFT JOIN … IS NULL anti-join is its set-based twin. The habit: for existence, EXISTS; for negation, never bare NOT IN over a nullable column.",
      tag: "subqueries",
    },
    {
      id: "tiktok-t15",
      q: "The planning deck needs the last 14 monthly buckets with zero-traffic months preserved. What does the calendar spine look like?",
      a: "GROUP BY STRFTIME('%Y-%m', created_at) builds the buckets traffic touched — but a month with no sessions simply doesn't exist in the orders table, so the fold silently drops it and the deck reads a hole as calm. The honest spine is a calendar side: a CTE or table of the 14 month keys from 2024-01 to 2025-02, LEFT JOINed to the event fold, COALESCE(count, 0) for the empty months. Zeros are the story in planning — a zero month is a distribution decision, not an absence of rows. The follow-up: state the bucket boundary convention (month keys as text sort correctly; julianday ranges need half-open edges), and name the calendar's time zone before any global read.",
      tag: "dates",
    },
    {
      id: "tiktok-t16",
      q: "Impression backlog: 21 events never completed. What are the honest ways to report them, and the dishonest one everyone reaches for?",
      a: "Honest, three ways: report the backlog as a state — COUNT(*) minus COUNT(shipped_at) is the in-flight census, a first-class funnel stage; exclude them with stated scope — 'completion lag over the 82 completed events'; or split the columns — AVG over completed beside the open census, so the population rides with the mean. Dishonest: COALESCE(shipped_at, created_at) to 'clean' the NULLs — that fabricates 21 zero-day completions, drags the average toward a number that describes nobody, and makes the backlog unreadable exactly when the top of the funnel is the story. On this platform in-flight volume IS the top of the funnel; NULL is a state to report, never a zero to fabricate.",
      tag: "nulls",
    },
    {
      id: "tiktok-t17",
      q: "Two charts print the same watch-through as 50 and 50.49. Same data. What class of bug is this, and where do you fix it?",
      a: "Integer arithmetic leaking into a rate: 52/103 in INTEGER math is 0, 52*100/103 is 50, and only 100.0 * 52 / 103 is 50.49 — the .0 promotion is the whole fix, applied before the division, not a ROUND after the truncation. The second variant is definition drift: one chart rounds at the query, the other at the display edge, so the same metric differs by a decimal across decks. The house rule: promote to real arithmetic at the ratio (100.0 * numerator / denominator), round once at the display edge, and compute both folds from identical rows. Rates are the product here — a truncation that eats half a point on every region is a story-changing bug, not a rounding note.",
      tag: "quality",
    },
    {
      id: "tiktok-t18",
      q: "After joining events to videos through event_items, a per-video watch-through can exceed 100% if you're careless. Explain the two DISTINCT folds that keep the share honest.",
      a: "The event_items join is one-to-many: one event touching two videos becomes two rows, so a row-level COUNT inflates by the fan-out. The numerator must fold watched EVENTS — COUNT(DISTINCT CASE WHEN status = 'delivered' THEN o.id END) — and the denominator must fold touched EVENTS — COUNT(DISTINCT o.id) — the same grain, the same population, so the share is bounded by 100 and means what it says. COUNT(*) in the denominator measures event-video PAIRS, a different census wearing the same column name; mixing the pair count with the event count is how a share drifts past 100 or below truth. The spoken habit after every one-to-many hop: 'one row per what?' — and both folds must answer identically before any rate ships.",
      tag: "joins",
    },
    {
      id: "tiktok-t19",
      q: "The rate gate: keep only months whose watch-through clears 50%. Why can't you write HAVING watch_through >= 50, and what are the fixes?",
      a: "Because SELECT aliases are assigned after HAVING runs — at gate time the column watch_through doesn't exist yet, only the underlying folds do. Fix one: repeat the expression — HAVING 100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) >= 50 — verbose, single-pass, and the only shape some engines accept. Fix two: stage it — fold the monthly census in a CTE, then WHERE watch_through >= 50 outside, which reads like the metric you meant. The deeper point the interviewer is probing: HAVING judges group facts, WHERE judges row facts, and a RATE is a group fact built from two folds over identical rows — the gate belongs after the fold, whichever syntax carries it. An alias that works in ORDER BY but not HAVING isn't an engine quirk; it's the pipeline order showing you where things are computed.",
      tag: "pipeline",
    },
    {
      id: "tiktok-t20",
      q: "FILTER (WHERE …) versus SUM(CASE …) — when do you reach for each, and what does FILTER buy that CASE doesn't?",
      a: "They're twins — both fold a subset of the same population in one scan — so the choice is mostly readability and portability. COUNT(*) FILTER (WHERE status = 'delivered') states the branch where the predicate lives and composes naturally with COUNT, SUM and AVG; SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) is the portable twin that runs on any engine and makes the ELSE arm visible — which is also its audit value, because the ELSE is where exhaustiveness lives. FILTER buys: one aggregate, one condition, no ELSE to forget. The non-negotiable either way: branches must reconcile to COUNT(*), and a branch holding a literal from another table's vocabulary ('liked' on an event store) reads a silent zero forever. Pick one idiom per team, write the census once, assert the identity in the query.",
      tag: "aggregation",
    },
    {
      id: "tiktok-t21",
      q: "Annotate every event row with its video's watch-through share without collapsing rows. Which shape, and what must stay DISTINCT?",
      a: "Fold first, annotate second: a derived table or CTE groups by video and computes COUNT(DISTINCT watched events) over COUNT(DISTINCT touched events), then joins back on video id — every event row keeps its grain and carries its video's share as a passenger column. The window shortcut — AVG over a window partitioned by video — computes over the JOINED rows, where fan-out has already multiplied events, and window aggregates can't take DISTINCT in this engine, so the share silently becomes a pair-weighted number. Annotate, don't amputate: the join-back keeps all events and adds context; a GROUP BY in the outer query would collapse the event stream the analyst still needs. The rule of thumb the screen rewards: windows for annotation over the CURRENT grain, fold-then-join for annotation over a DIFFERENT grain.",
      tag: "subqueries",
    },
    {
      id: "tiktok-t22",
      q: "The morning census and the engagement ledger disagree by one event. Walk the reconciliation and the guard that keeps it from recurring.",
      a: "Localize before theorizing: run COUNT(*) alone on each side, then each stage branch alone — whichever pair disagrees names the bug class. The usual suspects: vocabulary drift (a branch holds a literal from another table's domain and reads zero forever), a WHERE that rebuilt one query's population but not the other's, a JOIN that fanned one side to line-item grain while the other counts events, and replayed rows — the same event landed twice from the stream. The guard is structural: dedupe on a ROW_NUMBER key over (user, video, timestamp) before any stage counts, keep branches exhaustive over the status column's real domain, and assert branch-sum-equals-census inside the census query itself. At this tempo a census that can't self-audit doesn't get corrected — it gets replaced.",
      tag: "quality",
    },
    {
      id: "tiktok-t23",
      q: "First-hour engagement decides distribution. On julianday stamps, how do you floor elapsed time into hour buckets, and where does the boundary bug hide?",
      a: "Elapsed days are julianday(event) - julianday(post); multiply by 24 and CAST to INTEGER to floor into hour buckets — CAST truncates toward zero, which IS the floor for non-negative elapsed time. The boundary bug lives in the first-bucket filter: 'within the first hour' must be a half-open range — elapsed >= 0 AND elapsed < 1.0 days, or bucket = 0 — because BETWEEN on the boundary double-counts the handoff and a closed right edge swallows the 60th-minute event into hour two's definition. The follow-ups write themselves: name the time zone the stamps claim (a global funnel in one naive zone is a trend, not a truth), and state that bucket zero is the only bucket distribution actually reads.",
      tag: "dates",
    },
    {
      id: "tiktok-t24",
      q: "'Two events within 7 days' — self-join or LAG? When does each shape lie?",
      a: "The self-join is the definition: events e1 JOIN events e2 ON e1.customer_id = e2.customer_id AND e2.created_at > e1.created_at AND julianday(e2.created_at) - julianday(e1.created_at) <= 7.0 — any pair, and DISTINCT on the user if the ask is a user list. LAG answers a narrower question: adjacent pairs only — the gap between consecutive events. They diverge the moment three events interleave: a user with events on day 1, day 5 and day 40 has a qualifying PAIR (1,5) that LAG's consecutive-gap read still finds, but a user with day 1, day 4, day 12 has a pair LAG misses (4→12 is 8 days apart as adjacent, yet 1→4 qualifies... actually adjacent 1→4 qualifies too) — the clean divergence: 'two events at most 7 apart with ANY events between them' needs the self-join; 'the gap between consecutive sessions' needs LAG. Using LAG for the pair definition silently shrinks the population to consecutive-only returns, and the habit read undercounts exactly the bursty users the metric exists to catch.",
      tag: "joins",
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
    {
      id: "tiktok-mcq-11",
      prompt: "The planning deck buckets the event stream by calendar month. Which expression builds the month grain?",
      choices: [
        "STRFTIME('%Y', created_at)",
        "STRFTIME('%Y-%m', created_at)",
        "STRFTIME('%m', created_at)",
        "MONTH(created_at)",
      ],
      answer: 1,
      why: "'%Y-%m' yields the 14 distinct monthly buckets from 2024-01 to 2025-02 — the grain the pacing read needs. The format string is the metric: one wrong letter and the calendar re-buckets itself.",
      notes: [
        { choice: 0, why: "'%Y' runs fine and collapses the calendar into two year-long buckets — a valid query that no longer contains a month." },
        { choice: 2, why: "'%m' merges January-2024 with January-2025 — twelve buckets, each wearing two years of traffic." },
      ],
      difficulty: "easy",
    },
    {
      id: "tiktok-mcq-12",
      prompt: "APAC served 37 events to 5 users. The regional read needs BOTH columns in one row. Which SELECT list is right?",
      choices: [
        "COUNT(*), COUNT(*)",
        "COUNT(*), COUNT(DISTINCT customer_id)",
        "COUNT(DISTINCT customer_id), COUNT(DISTINCT customer_id)",
        "SUM(customer_id), COUNT(*)",
      ],
      answer: 1,
      why: "COUNT(*) folds event rows (37), COUNT(DISTINCT customer_id) folds people (5) — the gap between the columns is the 7.4 events-per-user intensity signal. Two folds, two grains, one scan.",
      notes: [
        { choice: 0, why: "Two COUNT(*)s print 37 twice — the census loses its audience read and the intensity story is uncomputable from the output." },
        { choice: 3, why: "SUM(customer_id) adds id values — a magnitude with no meaning. Fold DISTINCT keys for people, never their values." },
      ],
      difficulty: "easy",
    },
    {
      id: "tiktok-mcq-13",
      prompt: "The 7-day return window is written created_at BETWEEN '2025-01-01' AND '2025-01-07'. Stamps are midnight-pure today. What's the latent flaw?",
      choices: [
        "None — BETWEEN with date strings is the recommended shape for day windows",
        "BETWEEN is closed at both ends: any time-of-day on Jan 7 ('2025-01-07 09:14') sorts AFTER '2025-01-07' and leaks out — the window shrinks the moment stamps gain intraday time",
        "BETWEEN drops the first day of the range",
        "BETWEEN errors on text timestamps",
      ],
      answer: 1,
      why: "String comparison: '2025-01-07 09:14' > '2025-01-07', so the closed right edge excludes the very day it names. The durable shape is half-open — >= '2025-01-01' AND < '2025-01-08' — which survives time-of-day forever.",
      notes: [
        { choice: 0, why: "It works only while stamps stay midnight-pure — a latent bug that fires the day the event store writes real times, and it fires silently." },
        { choice: 2, why: "The LEFT edge is inclusive too — BETWEEN is closed on both ends, which is exactly the problem on the right." },
      ],
      difficulty: "easy",
    },
    {
      id: "tiktok-mcq-14",
      prompt: "The session stitch gives each event LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at). Each user's first event reads NULL for prev. What is that NULL?",
      choices: [
        "A bug — COALESCE it to created_at",
        "The session START — it opens a session, it is not a zero gap",
        "A row to drop before counting sessions",
        "A duplicate to dedupe",
      ],
      answer: 1,
      why: "NULL prev means no predecessor: the first touch of the stream, and the first session of every user. Counting it as a session-start is correct; dropping it undercounts sessions-per-user by exactly one per user — a systematic bias the session team would catch in a day.",
      notes: [
        { choice: 0, why: "COALESCE(prev, created_at) makes the gap arithmetic safe (zero), but the semantics must stay 'first session' — the label matters more than the value." },
        { choice: 2, why: "Dropping firsts is the fastest way to make every user look less sticky than they are — the NULL carries information, not noise." },
      ],
      difficulty: "easy",
    },
    {
      id: "tiktok-mcq-15",
      prompt: "The streak query folds active days into consecutive runs. Which expression is the island key — constant inside a run, jumping at every gap?",
      choices: [
        "julianday(day) - LAG(julianday(day)) OVER (ORDER BY day)",
        "day - ROW_NUMBER() OVER (ORDER BY day)",
        "COUNT(*) OVER (PARTITION BY day)",
        "day % 7",
      ],
      answer: 1,
      why: "date minus row-number advances by exactly 1 per row and per calendar day — so consecutive days hold the same value and every gap breaks it. GROUP BY that value and COUNT for run lengths: the gaps-and-islands canon.",
      notes: [
        { choice: 0, why: "That's the gap measure from session stitching — it detects a break, it doesn't key the run. Right tool from the neighboring drill." },
        { choice: 2, why: "A window partitioned by day counts events within a day — no run structure survives, every day is its own group." },
      ],
      difficulty: "medium",
    },
    {
      id: "tiktok-mcq-16",
      prompt: "The 30-minute session cut, on julianday timestamps. Which gap expression is correct?",
      choices: [
        "julianday(created_at) - julianday(prev) > 30",
        "julianday(created_at) - julianday(prev) > 30.0 / 1440",
        "created_at - prev > 30 / 1440",
        "julianday(created_at) - prev > 1800",
      ],
      answer: 1,
      why: "julianday differences are in DAYS; 30 minutes is 30.0/1440 of one. The unit conversion is the whole expression — everything else is a different threshold wearing the same comment.",
      notes: [
        { choice: 0, why: "30 DAYS: almost no gap crosses it, so every user collapses into one endless session — velocity reads zero." },
        { choice: 3, why: "Unit soup — julianday diffs in days compared against 1800 seconds. The comparison compiles and measures nothing." },
      ],
      difficulty: "medium",
    },
    {
      id: "tiktok-mcq-17",
      prompt: "Watched (52) and events (103) are both INTEGER counts. Which expression yields the honest one-decimal watch-through share?",
      choices: [
        "ROUND(SUM(watched) / COUNT(*), 1)",
        "ROUND(100.0 * SUM(watched) / COUNT(*), 1)",
        "ROUND(100 * SUM(watched) / COUNT(*), 1)",
        "CAST(SUM(watched) / COUNT(*) AS REAL)",
      ],
      answer: 1,
      why: "100.0 promotes the division to real arithmetic BEFORE any truncation: 52*100.0/103 = 50.49. Promotion placement is the metric — after the fact it's a cast of a truncated integer.",
      notes: [
        { choice: 0, why: "52/103 in integer math is 0 — the share ships as 0.0 everywhere and the funnel reads dead." },
        { choice: 2, why: "INTEGER 100 forces integer division: 5200/103 truncates to 50, and ROUND reports a confident, wrong 50.0." },
      ],
      difficulty: "medium",
    },
    {
      id: "tiktok-mcq-18",
      prompt: "Longest consecutive-day streak per user: after the island key exists, what's the fold?",
      choices: [
        "GROUP BY user, island key, COUNT days — then the longest run is an argmax over that",
        "GROUP BY user_id, COUNT(DISTINCT day)",
        "ORDER BY day LIMIT 1",
        "GROUP BY island key alone, ignoring user",
      ],
      answer: 0,
      why: "Two stages: islands are per-user runs, so the run length is COUNT grouped by user AND island key; 'longest' is then a MAX over run lengths. Skipping the user in the grouping merges everyone's calendars into one Frankenstein streak.",
      notes: [
        { choice: 1, why: "Distinct active days is activity volume, not adjacency — a user with 30 scattered days would beat a 14-day streak." },
        { choice: 2, why: "ORDER BY plus LIMIT reads the first row, not the longest run — no fold, no answer." },
      ],
      difficulty: "medium",
    },
    {
      id: "tiktok-mcq-19",
      prompt: "Return-visit read: users with events on two days at most 7 apart. Which shape IS the definition?",
      choices: [
        "GROUP BY customer_id HAVING COUNT(*) > 7",
        "A self-join: e2 on the same user with e2.created_at > e1.created_at and julianday(e2.created_at) - julianday(e1.created_at) <= 7.0",
        "WHERE julianday(created_at) < 7",
        "COUNT(DISTINCT customer_id) > 2",
      ],
      answer: 1,
      why: "The pair test is the definition — two rows, same user, inside the window. A self-join states it directly; the population is DISTINCT users having at least one qualifying pair.",
      notes: [
        { choice: 0, why: "More than 7 events total says nothing about adjacency — a daily user and a bursty one are indistinguishable to a bare count." },
        { choice: 2, why: "Comparing a timestamp to the number 7 is a unit error — days since epoch, unconverted." },
      ],
      difficulty: "medium",
    },
    {
      id: "tiktok-mcq-20",
      prompt: "The pacing read needs a cumulative daily total against plan — one row per day, sum growing by day. Which window?",
      choices: [
        "SUM(events) OVER (ORDER BY day ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)",
        "SUM(events) OVER ()",
        "SUM(events) OVER (ORDER BY day ROWS BETWEEN 7 PRECEDING AND CURRENT ROW)",
        "SUM(events) OVER (PARTITION BY day)",
      ],
      answer: 0,
      why: "Unbounded-preceding-to-current IS the running total — each day's plan check reads everything to date. The explicit ROWS frame also pins the accumulation against duplicate-order surprises.",
      notes: [
        { choice: 1, why: "Bare OVER() is the grand total — the same number on every row, a pacing line that's flat forever." },
        { choice: 2, why: "That's a 7-day rolling window — a smoothing read, not a cumulative one; the plan comparison needs everything to date." },
      ],
      difficulty: "medium",
    },
    {
      id: "tiktok-mcq-21",
      prompt: "The ladder-share read: each creator's RANK position expressed as a percentage of the surfaced pool, kept on every row. Which expression?",
      choices: [
        "100.0 * watched / MAX(watched) OVER ()",
        "100.0 * RANK() OVER (ORDER BY watched DESC) / COUNT(*) OVER ()",
        "watched / SUM(watched) OVER () * 100.0",
        "PERCENT_RANK() OVER (ORDER BY watched DESC) * 100",
      ],
      answer: 1,
      why: "Two windows, two jobs: RANK over the ordered pool places the creator, COUNT(*) OVER () sizes the pool, and 100.0 promotes before the division. The result is the ladder share the distribution review reads.",
      notes: [
        { choice: 0, why: "Share-of-max is a different read — distance to the leader, not position in the pool." },
        { choice: 3, why: "PERCENT_RANK is (rank−1)/(n−1), a 0-to-1 relative position — close-looking, definitionally different, and it still needs the 100.0." },
      ],
      difficulty: "hard",
    },
    {
      id: "tiktok-mcq-22",
      prompt: "Burst detection over the monthly census: peak month carried 9 events, the 14-month average is 7.36. Which outer expression computes the burst factor?",
      choices: [
        "MAX(n) / AVG(n) over the bucket rows",
        "MAX(n) - AVG(n)",
        "MAX(n) * COUNT(*)",
        "n / SUM(n)",
      ],
      answer: 0,
      why: "The burst FACTOR is a ratio — peak over baseline — 9/7.36 ≈ 1.22x here. Ratios are unit-free, so a 1.22 month and a 1.22 hour mean the same thing: a fifth above rhythm.",
      notes: [
        { choice: 1, why: "The difference (1.64 events) is absolute — it can't be compared across surfaces with different volumes, which is the entire point of a factor." },
        { choice: 3, why: "Share of total is concentration, not burst — a quiet month in a busy calendar reads high for the wrong reason." },
      ],
      difficulty: "hard",
    },
    {
      id: "tiktok-mcq-23",
      prompt: "First-session cohort: users whose FIRST event landed in the launch week — and next sprint, 'first event per day'. Which shape extends to both?",
      choices: [
        "A correlated subquery computing MIN(created_at) per row",
        "A derived table folding MIN(created_at) per customer, joined back on user and first stamp",
        "HAVING created_at = MIN(created_at)",
        "MAX(created_at) in the WHERE clause",
      ],
      answer: 1,
      why: "The derived fold computes first stamps once, then joins back — one pass, and changing the cohort window means changing one WHERE on the folded column. The workhorse shape for every first-occurrence cohort here.",
      notes: [
        { choice: 0, why: "Correct but re-executed per row — fine on 16 users, a different story at stream volume." },
        { choice: 2, why: "HAVING can't see row-level created_at beside a fold — mixing row facts with group facts in one clause." },
      ],
      difficulty: "hard",
    },
    {
      id: "tiktok-mcq-24",
      prompt: "The audit needs events NOT in the posted-stamp list: WHERE shipped_at NOT IN (SELECT shipped_at FROM orders). The list carries 21 NULLs. What returns?",
      choices: [
        "The 21 unstamped events",
        "No rows — one NULL in the list defeats every NOT IN comparison",
        "All 103 events",
        "A type error",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be proven true — each comparison with NULL is unknown, so the whole predicate fails. The register ships empty and looks like good news; NOT EXISTS or an inner IS NOT NULL filter is the fix.",
      notes: [
        { choice: 0, why: "That's the intent — and why the bug ships so quietly: an empty audit reads as a clean audit." },
        { choice: 2, why: "Backwards: plain IN over NULLs yields what it can prove; NOT IN over NULLs yields nothing." },
      ],
      difficulty: "hard",
    },
    {
      id: "tiktok-mcq-25",
      prompt: "Each event carries a LAG-computed gap g. WHERE g > 0.5 in the same query errors. Why — and the fix?",
      choices: [
        "Windows compute at SELECT time, after WHERE — stage the LAG in a CTE or inner query, filter outside",
        "Windows compute before WHERE — the filter must use the raw timestamp column",
        "Wrap g in ROUND to make it comparable",
        "Use HAVING g > 0.5 instead",
      ],
      answer: 0,
      why: "Logical processing order: FROM, WHERE, GROUP BY, HAVING, then SELECT — window expressions don't exist until SELECT. The two-stage stitch is the canonical fix: LAG inside, gap filter outside.",
      notes: [
        { choice: 3, why: "HAVING runs before SELECT too — same wall, one stage later. Anything computed over the folded set must be staged." },
        { choice: 1, why: "Backwards — the window result doesn't exist at WHERE time; that's precisely why the error fires." },
      ],
      difficulty: "hard",
    },
    {
      id: "tiktok-mcq-26",
      prompt: "21 events carry NULL completion stamps. A teammate runs COALESCE(shipped_at, created_at) 'to clean the data'. The completion-lag average then…",
      choices: [
        "Barely moves — 21 rows out of 103 is noise",
        "Drops — 21 synthetic zero-day completions drag the average toward a number that describes nobody",
        "Rises — NULLs were undercounting",
        "Errors on the mixed types",
      ],
      answer: 1,
      why: "COALESCE fabricates instant completions for every in-flight event: 21 zero-day lags out of 103 pull the 2.98-day average materially downward. NULL is a funnel state — the top of the funnel — not a zero to backfill.",
      notes: [
        { choice: 0, why: "20% of the population reset to zero is not noise — it's a quarter-day of drift on the platform's headline latency metric." },
        { choice: 3, why: "COALESCE is perfectly legal — that's the trap: the corruption ships as a clean query with a plausible number." },
      ],
      difficulty: "easy",
    },
    {
      id: "tiktok-mcq-27",
      prompt: "The one-pass stage census in modern SQLite: which branch counts watched-through events beside COUNT(*)?",
      choices: [
        "COUNT(*) FILTER (WHERE status = 'delivered')",
        "COUNT(status = 'delivered')",
        "FILTER COUNT(WHERE status = 'delivered')",
        "SUM(*) WHERE status = 'delivered'",
      ],
      answer: 0,
      why: "FILTER (WHERE …) counts a subset in the same scan as the unfiltered COUNT(*) — one population, reconciling branches, no ELSE arm to forget. The CASE-SUM twin does the same job on engines without FILTER.",
      notes: [
        { choice: 1, why: "COUNT(expr) counts non-NULLs — the boolean is never NULL, so it reads COUNT(*) and the census flattens to one number." },
        { choice: 3, why: "SUM(*) doesn't exist, and WHERE inside an aggregate isn't SQL — the conditional fold is FILTER or CASE, nothing else." },
      ],
      difficulty: "easy",
    },
    {
      id: "tiktok-mcq-28",
      prompt: "Per-video watch-through: events reach videos through event_items, and one event can touch two videos. The denominator of the share must be…",
      choices: [
        "COUNT(*) over the joined rows",
        "COUNT(DISTINCT o.id) — the same DISTINCT event fold as the numerator",
        "COUNT(DISTINCT oi.id)",
        "SUM(quantity)",
      ],
      answer: 1,
      why: "Numerator folds watched EVENTS (DISTINCT CASE WHEN delivered THEN o.id END); denominator folds touched EVENTS — same grain, so the share stays bounded by 100 and means what it says.",
      notes: [
        { choice: 0, why: "COUNT(*) measures event-video PAIRS — the fan-out inflates the denominator by the multi-video factor and the share deflates silently." },
        { choice: 2, why: "Distinct items is the batch census — a different population wearing the same join; mixing it with the event numerator is how shares drift." },
      ],
      difficulty: "hard",
    },
    {
      id: "tiktok-mcq-29",
      prompt: "Three creators tie at 17 watched events. The ladder ships with ROW_NUMBER() OVER (ORDER BY watched DESC). What prints?",
      choices: [
        "3, 3, 3 — ties share the rung",
        "3, 4, 5 — an arbitrary engine order splits the tie",
        "4, 4, 4",
        "3, 3, 4",
      ],
      answer: 1,
      why: "ROW_NUMBER never shares: the tie splits by whatever order the engine happens to scan. Rerun the query tomorrow and the podium permutes — which is why leaderboards here ship with RANK or a stated deterministic tiebreak, never naked ROW_NUMBER.",
      notes: [
        { choice: 0, why: "That's RANK or DENSE_RANK behavior — the sharing functions. ROW_NUMBER's contract is strict sequence." },
        { choice: 3, why: "No function shares partway — either the tie shares (RANK family) or it splits in sequence (ROW_NUMBER)." },
      ],
      difficulty: "medium",
    },
    {
      id: "tiktok-mcq-30",
      prompt: "The review wants the monthly census PLUS a grand-total row labeled ALL. Which shape appends it honestly?",
      choices: [
        "UNION ALL of the monthly fold with a grand fold, the label column carrying a 'TOTAL' literal on the second branch",
        "ORDER BY month, then a summary row manufactured by the ORDER BY",
        "GROUP BY month WITH ROLLUP — SQLite labels the grand row automatically",
        "A second GROUP BY appended after a comma",
      ],
      answer: 0,
      why: "Appending a row is a set operation — UNION ALL — and the 'TOTAL' literal is what stops the grand row from impersonating a month in every downstream filter. Two folds, one population, one explicit label.",
      notes: [
        { choice: 2, why: "ROLLUP isn't in SQLite's toolkit — and an unlabeled grand row that sorts into the months is a reconciliation bug wearing a feature's clothes." },
        { choice: 1, why: "ORDER BY orders rows; it never creates them. The census needs a second SELECT stacked beneath the first." },
      ],
      difficulty: "hard",
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
    {
      id: "cs-tiktok-3",
      tier: "medium",
      topic: "j3",
      universe: "catalog",
      title: "The video watch-through read",
      brief:
        "TikTok-flavored brief on the storefront db: the packaging review wants watch-through per VIDEO — because distribution lives or dies at the video grain, not the region grain. The mapping is declared: orders are engagement events, event_items are the videos an event touched (one event can touch two videos — the fan-out is real), products are videos. Probed facts: Desk Mat Extended drew 24 events, 11 watched-through (45.8); Noise-Canceling Headset 24 / 10 (41.7); Laptop Stand Aluminum 19 / 8 (42.1); HDMI 2.1 Cable 2m 19 / 8 (42.1); Wireless Mouse M3 18 / 7 (38.9); 4K Webcam Pro 17 / 8 (47.1). The read carries a 17-event materiality bar so the ladder never leads with a five-event sample wearing a perfect rate, and sorts by load, biggest first, because the review argues about reach before it argues about rates.",
      ask: "Return per video: events touched, watched-through events, and the watch-through share (1 decimal) for videos with at least 17 events, biggest load first.",
      template:
        "SELECT p.name AS video,\n       COUNT(DISTINCT o.id) AS events,\n       COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) AS watched,\n       ROUND(100.0 * COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) / {1}(DISTINCT o.id), 1) AS watch_through\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = {2}\nGROUP BY p.id, p.name\nHAVING COUNT(DISTINCT o.id) >= {3}\nORDER BY events {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the denominator fold",
          why: "The share's denominator must fold DISTINCT EVENTS — the same grain as the numerator's watched fold. SUM(DISTINCT o.id) compiles and returns id arithmetic: 100.0 times a watched count over a sum of ids is a share that describes nothing.",
        },
        {
          answer: "oi.product_id",
          kind: "keyword",
          label: "the video join key",
          why: "Each event-item attaches to its video on the product key — the only join that lands events on the right video. Matching p.id to o.id scrambles the chain: order ids and product ids are both integers, so the query runs and attributes events to videos that were never touched.",
        },
        {
          answer: "17",
          kind: "number",
          label: "the materiality bar",
          why: "The bar keeps exactly the six videos from Desk Mat Extended (24) down to 4K Webcam Pro (17) — the webcam sits ON the bar at 17 events, so the threshold's own number is visible in the output. A 13 would wave in the 15- and 16-event videos and lead the ladder with samples the packaging review can't defend.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-load-first direction",
          why: "The review opens on reach: 24, 24, 19, 19, 18, 17. ASC would open with the webcam's 17 events and its tempting 47.1 share — a five-rung-smaller sample leading the read the sample-size caution exists for.",
        },
      ],
      distractors: ["SUM", "p.id = o.id", "13", "ASC"],
      walkthrough:
        "A three-table chain, two DISTINCT folds, one honest share. The chain walks events to their touched videos — order_items is the one-to-many edge, so the joined rows are event-video PAIRS, and every fold that means events must carry DISTINCT o.id: the events column reads 24 for Desk Mat Extended, the watched column folds the same DISTINCT over the delivered arm (11), and the share divides watched by touched — 45.8 — with both folds answering 'events' before any division. The story lands on the ladder: the two 24-event videos convert at 45.8 and 41.7 while the 17-event webcam converts at 47.1 — a smaller sample out-converting the leaders is exactly the read the 17-event bar exists to contextualize, and ORDER BY events DESC keeps reach first so the share is read against its load. SUM in the denominator compiles into id arithmetic that looks like a share; the wrong join key p.id = o.id runs and misattributes events across the catalog because both id columns are integers — the silent-scramble failure this case is built to make visible; dropping the bar to 13 invites the small-sample rates to lead; ASC hands the ladder to the smallest sample first. Grain, key, bar, order — the four checks every per-video read must survive.",
    },
    {
      id: "cs-tiktok-4",
      tier: "medium",
      topic: "t5",
      universe: "supplier",
      title: "The creator watch ladder",
      brief:
        "TikTok-flavored brief on the storefront db: the creator loop ships its watch-through leaderboard, and the tie rule is the whole test. Mapping: orders are events, event_items touch videos, products are videos, suppliers are creators. Probed facts, watched-through events per creator: Shenzhen Electro 23, Midwest Hardware Co 20, then a three-way tie — Nordic Gadgets AB 17, Pacific Textiles 17, Alpine Audio GmbH 17 — and Andes Naturals SA 12. The ladder uses competition semantics: ties share a rung, the next rung skips, and a deterministic name tiebreak keeps the three tied creators from permuting between runs. Probed with the tie intact: the ranks print 1, 2, 3, 3, 3, 6 — and the 6 after the tie is the feature the community lead checks first, because a dense ladder (1, 2, 3, 3, 3, 4) tells a different story about how many creators the tie displaced.",
      ask: "Return per creator: watched-through events and competition rank (ties shared, gaps kept), tied creators broken by name, best first.",
      template:
        "WITH per_creator AS (\n  SELECT s.name AS creator,\n         {1}(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) AS watched\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  JOIN suppliers s ON s.id = p.supplier_id\n  GROUP BY s.id, s.name\n)\nSELECT creator, watched, {2}() OVER (ORDER BY watched {3}) AS ladder\nFROM per_creator\nORDER BY ladder, creator;",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the watch fold",
          why: "Watched-through is DISTINCT EVENTS folded over the delivered arm — the event_items fan-out makes plain COUNT(*) read pairs, not events. SUM(DISTINCT o.id) compiles and sums id values: a leaderboard sorted by id arithmetic wearing a watch column.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the competition rank",
          why: "RANK shares the rung and skips: 1, 2, 3, 3, 3, then 6 for Andes — the gap is the ladder telling you three creators contested rank 3. DENSE_RANK would print 4 after the tie, and ROW_NUMBER would split the 17s into 3, 4, 5 by engine mood.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-first direction",
          why: "The ladder opens at the top: Shenzhen Electro's 23. ASC would rank the 12-event creator first — a correct query aimed at the bottom of the leaderboard, and the tie permutation the community lead would catch within the hour.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "SUM", "ASC"],
      walkthrough:
        "Fold, then rank — and the tie rule ships with the query. The CTE walks events through their videos to creators and folds DISTINCT watched events per creator: Shenzhen Electro 23, Midwest Hardware Co 20, then Nordic Gadgets AB, Pacific Textiles and Alpine Audio GmbH sharing 17, Andes Naturals SA at 12. The window ranks with competition semantics — RANK() OVER (ORDER BY watched DESC): the three 17s all take rank 3, Andes takes 6, and the outer ORDER BY ladder, creator is the deterministic tiebreak that keeps Nordic, Pacific and Alpine in a stable alphabetical order so the ladder doesn't permute between the morning run and the packet (the tiebreak must live OUTSIDE the window — put creator inside the OVER's ORDER BY and the tie vanishes: every rank turns unique, 1 through 6, and the tie rule audits as a no-op). The outer ORDER BY ladder, creator prints the leaderboard top-down. DENSE_RANK is the near-miss: it prints 1, 2, 3, 3, 3, 4 — erasing the gap, implying nobody was displaced by the tie, a different story about the same numbers. ROW_NUMBER is the silent erasure: 3, 4, 5 across the 17s by engine scan order, a podium decided by luck. SUM in the fold compiles into id arithmetic — a leaderboard of id sums. ASC flips the ladder to its worst performer first. The interview point: the tie rule is a business decision stated BEFORE the window, and this ladder's rule — share the rung, keep the gap, break by name — is now executable and auditable.",
    },
    {
      id: "cs-tiktok-5",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The monthly pacing census",
      brief:
        "TikTok-flavored brief on the storefront db: the pacing review opens with the monthly volume census — one row per month, the stage arms folded in one pass with FILTER, so the census and its branches share a single scan and can't drift apart. Probed facts across the 14-month calendar (2024-01 to 2025-02): every month carried 6 to 9 events; 2024-09 is the peak at 9 events (7 watched, 2 engaged) and 2024-02 matches the 9-event load (4 watched, 4 engaged); the six 8-event months are 2024-01, 03, 05, 07; the floor months read 6. The review flags the over-plan months — 9 or more events — and reads newest-first, because pacing is judged against the most recent load first. Branch sums must reconcile against the 103-event book: the arms are the same population the pace is measured on.",
      ask: "Return per month: total events, watched-through events, and engaged events — for months carrying at least 9 events, newest first.",
      template:
        "SELECT STRFTIME('%Y-%m', created_at) AS month,\n       COUNT(*) AS events,\n       COUNT(*) FILTER (WHERE status = {1}) AS watched,\n       COUNT(*) FILTER (WHERE status = {2}) AS engaged\nFROM orders\nGROUP BY month\nHAVING COUNT(*) >= {3}\nORDER BY month {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the watched-stage literal",
          why: "Watched-through is the event store's delivered completion state — 7 of 2024-09's nine events. 'liked' is a reaction, not a status: the branch compiles and reads zero forever, the classic vocabulary-drift hole.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the engaged-stage literal",
          why: "Engaged means in-progress, spelled 'shipped' in the event store — 2 of the peak month's events. A cross-table literal like 'paid' (an invoice state) reads a silent zero and the engaged column ships empty where a stage should be.",
        },
        {
          answer: "9",
          kind: "number",
          label: "the over-plan bar",
          why: "The plan is 8 events a month; the review flags over-plan, so the bar is 9 — keeping 2024-09 and 2024-02, whose 9-event loads appear in the output. An 8 would wave all six on-plan months through and the flag would mean nothing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the newest-first direction",
          why: "Pacing is judged against the most recent load: 2024-09 leads, 2024-02 behind it. ASC would open the packet on February 2024 — a correct census aimed fourteen months away from the decision.",
        },
      ],
      distractors: ["'liked'", "'paid'", "8", "ASC"],
      walkthrough:
        "One scan, three folds, one reconciliation. The %Y-%m spine buckets the book into 14 months; COUNT(*) folds the load; the two FILTER arms fold the stages from the same rows — so 2024-09 reads 9 events / 7 watched / 2 engaged and 2024-02 reads 9 / 4 / 4, and the arms can never disagree with the total because they never left the scan. The HAVING bar at 9 keeps only the over-plan months — both carry a visible 9 in the events column, so the gate audits itself — and ORDER BY month DESC reads newest-first for the pacing review. The two-stage peak is the story: September's 9-event load converted 7 to watched while February's matched load converted only 4 — same volume, different packaging, which is why the census carries the stage arms beside the total instead of two queries with two populations. 'liked' and 'paid' are the vocabulary-drift distractors — a reaction and an invoice state, both legal SQL, both silent zeros in a funnel column. The bar at 8 would dissolve the over-plan flag into the on-plan crowd. ASC aims the read at the oldest month. The FILTER census is the one-scan discipline: every arm, every month, one population, branches that must sum.",
    },
    {
      id: "cs-tiktok-6",
      tier: "easy",
      topic: "l8",
      universe: "growth",
      title: "The stage ladder with a materiality bar",
      brief:
        "TikTok-flavored brief on the storefront db: the growth review wants the stage ladder — one row per funnel stage — with a materiality gate so the meeting doesn't chase a seven-event tail. Probed facts: the 103-event book splits delivered (watched-through) 52, shipped (engaged) 30, pending (drafting) 14, cancelled (skipped) 7. The bar is 14 events: the drafting queue sits EXACTLY on it, so the gate keeps the three stages that carry the funnel and drops the dismissed tail — and the threshold's own number is visible in the output, which is how the review knows the bar did what it claims. Sorted by load, biggest first. The reconciliation identity rides along: 52 + 30 + 14 + 7 = 103, so any arm that drifts is visible before the gate, not after.",
      ask: "Return per stage: the stage name and its event count, keeping only stages with at least 14 events, biggest count first.",
      template:
        "SELECT status,\n       {1}(*) AS events\nFROM orders\nGROUP BY status\n{2} COUNT(*) >= {3}\nORDER BY events {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the stage counter",
          why: "A stage's load is its row count — COUNT(*) folds 52, 30, 14 per stage. SUM(*) doesn't exist, and any aggregate over the status column itself counts text, not events.",
        },
        {
          answer: "HAVING",
          kind: "keyword",
          label: "the group gate",
          why: "The 14-event bar judges a folded group, so it lives in HAVING — the only clause that runs after GROUP BY. WHERE can't see COUNT(*) at all, and a WHERE holding this predicate is rejected before the query runs.",
        },
        {
          answer: "14",
          kind: "number",
          label: "the materiality bar",
          why: "The bar keeps delivered (52), shipped (30) and the drafting queue exactly at its own number — pending's 14 appears in the output — and drops the 7-event dismissed tail. A 20 would drop drafting too and the review would lose the queue that's still moving; a 7 would read the tail as a stage worth chasing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The review opens on load: 52, 30, 14. ASC would open with the drafting queue's 14 — a correct query aimed at the smallest arm the gate kept.",
        },
      ],
      distractors: ["SUM", "WHERE", "20", "ASC"],
      walkthrough:
        "One table, one fold, one gate — the ladder in its plainest form. GROUP BY status folds the 103-event book into four rows — 52 delivered, 30 shipped, 14 pending, 7 cancelled — and the HAVING bar at 14 keeps the three stages that carry the funnel while the dismissed tail drops below it. The bar is auditable by construction: pending's 14 sits in the output, so a reviewer can see the gate did exactly what the brief claims, and the reconciliation identity (52+30+14+7 = 103) is checkable in one mental sum before the gate ever runs. ORDER BY events DESC leads with the watched-through arm, which is where the review's attention belongs. WHERE in the gate slot is the classic rejection: the predicate references COUNT(*) before any group exists, and the engine says so loudly — the pipeline-order lesson teaching itself. The bar at 20 is the sneaky one: it executes, drops the drafting queue, and the review loses the one stage still in motion — a materiality gate tuned too high amputates live signal. SUM in the counter slot errors out loud; ASC aims the read at the smallest survivor. The interview point: a materiality bar is a definition, stated with its own number visible in the output.",
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
    { slug: "rolling-7d-actives", why: "Rolling 7-day actives — the habit denominator TikTok reads daily; a window over the activity log that every return-visit metric divides by." },
    { slug: "consecutive-numbers", why: "Pure adjacency detection — the is-this-run-actually-consecutive check that underlies every streak claim before it ships to the habit board." },
    { slug: "customers-with-maximum-number-of-transactions-on-consecutive-days", why: "Who kept the longest consecutive-day habit — streaks with an argmax on top, the retention board's headline query." },
    { slug: "find-the-start-and-end-number-of-continuous-ranges", why: "Island boundaries: turn consecutive-day runs into start/end spans — the gaps-and-islands output retention decks are built from." },
    { slug: "game-play-analysis-v", why: "Day-one drop-off — the first-session-to-return funnel read computed per cohort date, the D1 curve in one query." },
    { slug: "game-play-analysis-iv", why: "First-event date per user — the acquisition stamp every day-one retention curve hangs on." },
    { slug: "leetcodify-friends-recommendations", why: "Recommendation candidates who did everything but the target action — anti-join candidates, the distribution queue's raw material." },
    { slug: "leetcodify-similar-friends", why: "Shared-taste pairs above an overlap threshold — the similarity join behind 'watched like you' surfaces." },
    { slug: "second-degree-follower", why: "The second-degree walk — followers of followers, the reach read distribution experiments are measured on." },
    { slug: "number-of-comments-per-post", why: "Engagement per post — a grouped count that must survive the zero-comment LEFT JOIN tail with its zeros intact." },
    { slug: "find-users-with-high-token-usage", why: "Heavy-tail usage census — the velocity outliers a session-integrity review starts from." },
    { slug: "human-traffic-of-stadium", why: "Three consecutive crowded buckets — burst detection as a consecutive-rows problem, the viral-hour read." },
    { slug: "movie-rating", why: "Rated-entity ladders mixing volume and recency — the leaderboard arithmetic the creator loop runs weekly." },
    { slug: "count-artist-occurrences-on-spotify-ranking-list", why: "Chart presence per entity — appearances folded per creator across the ladder, a distribution-depth read." },
    { slug: "snaps-analysis", why: "Per-sender engagement shares — a conditional-count rate over a social log with denominators named." },
    { slug: "ad-free-sessions", why: "The clean-session denominator — sessions excluding an interference condition, the honest base every surface rate needs." },
  ],
};
