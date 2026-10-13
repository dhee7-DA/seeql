// Spotify — kit 2 of the Streaming & Social domain (Batch C).
// Listening-session analytics: streams, streaks, listening-run sessionization,
// lapse windows and the free-to-premium funnel. The pool uses ALL 5 of
// Spotify's registry-tagged sql rows first (churn risk, growth accounting,
// median time-to-convert, winback recovery, NULL audit) and theme-curates the
// rest from the SQL band's session/streak/cohort-shaped problems — stated per
// the spec because the tagged pool (5 sql rows) is far below the 16-problem
// bar. Case studies run on the storefront db with probed figures from
// scripts/company-facts.md (orders = listening sessions, customers =
// subscribers, order_items = play events, products = track catalog,
// monthly trend = listening trend — mappings declared in-world, no invented
// listening numbers).

import type { CompanyKit } from "../types";

export const spotifyKit: CompanyKit = {
  id: "spotify",
  domainId: "media",
  name: "Spotify",
  tagline: "Streams, playlists and listening streaks",
  accent: "text-green-400",

  brief: [
    "Spotify is the world's largest audio streaming service — **hundreds of millions of listeners**, a catalog measured in the hundreds of millions of tracks, and a business that lives or dies on two behaviors: the daily listening habit ({emerald:streaks}, session depth, {sky:retention}) and the **free-to-premium conversion** the whole model funds. Where video services talk about watch hours, Spotify talks about streams and streaks — play events folded into listening sessions, sessions into day-on-day runs, runs into the lapse-and-winback loop that guards the subscriber base. The SQL reality is event-shaped and window-heavy: the questions that decide {rose:churn} interventions are 'how long since this listener's previous session' and 'which listeners held a consecutive-day streak this month'.",
    "The data org is personalization-adjacent and experiment-dense. Playlist and recommendation teams read skip-and-completion telemetry; the subscription team runs {sky:growth accounting} — **new, retained, resurrected and churned** listeners folded month by month; marketplace teams value artists in stream counts. Like every event-driven shop, the dashboards are definitions first: a 'stream' is counted at a stated threshold, a 'streak' has a stated gap tolerance, and a 'churned listener' has a stated quiet window. Analysts who cannot restate the denominator of their own rate do not survive the metrics review — *the culture treats a drifted denominator as a real incident, not a nuance*.",
    "Interview screens start at the session grain and climb into windows fast. A typical loop: a warm-up fold (streams per track, sessions per listener), then a per-entity argmax (most-played track per playlist, latest session per listener), then the signature escalations — {emerald:consecutive-day streak} counting (`LAG` + flag + running SUM), {violet:median time-to-convert} on the free-to-premium funnel, and the {rose:lapse} window (days since last session, judged against the winback bar). The follow-ups probe definitions out loud: 'is that share of listeners or of sessions?', 'what happens to a listener with one session?', 'does a skipped stream count?'. Candidates who state the grain and the window before writing the `OVER` clause consistently outperform.",
    "Preparation strategy: the kit consumes **all 5 of Spotify's tagged registry problems** — churn risk, growth accounting, median time-to-convert, winback recovery and the NULL audit — then theme-curates **25 more** from the SQL band that mirror the company's known question themes: sessionization, streaks, `LAG` windows, rolling actives, leaderboards and tiered-listener `CASE` walls. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the winback window (a LAG quiet-gap read with the bar applied after the window), the other rebuilds the most-played-tracks census (a plays fold with an honest tie at the top-5 cut). The storefront mapping is declared, not hidden — orders are listening sessions, `order_items` are play events, product names are placeholder track names — because stating the stand-in is the same definition-first habit Spotify's screens grade.",
  ],

  dayInLife: [
    "**08:40 —** The habit pulse. A growth analyst opens the overnight dashboards: **daily actives**, session starts, the {emerald:streak} wall — how many listeners extended a consecutive-day run versus broke one — and the lapse counter: listeners whose quiet gap crossed the winback bar since yesterday. The first query is almost always a `LAG` read: previous session per listener, gap in days, bucketed against the lapse thresholds. A spike in broken streaks is the day's first fire, and the analyst who can isolate WHICH cohort went quiet — new signups versus long-tenured, playlist listeners versus search starters — is the one the subscription team waits on.",
    "**11:15 —** Funnel and catalog work. The subscription team wants the {violet:median time-to-convert} refreshed for the new-market cohort; playlist editorial wants the most-added tracks per mood list; the artist-marketing group wants the stream census with the tie behavior stated, because two tracks sharing a play count is a weekly occurrence at catalog scale. Each ask is a fold, a window and an argument about grain — streams versus listeners, sessions versus days. The analyst writes the query twice: once to answer, once with the definition printed beside it, because Spotify's review culture treats '*what population is this over?*' as the first question, not the last.",
    "**14:30 —** The loop closes. Winback lists ship to CRM: listeners who crossed the lapse bar and came back, with the {emerald:recovery rate} the campaign is judged on. Growth accounting refreshes on the monthly spine: **new, retained, resurrected, churned** — four `CASE` branches over a `LAG`'d status column, reconciling to the listener census. The quiet discipline of the hour is reconciliation: if the four branches don't sum to the census, nothing else ships today.",
    "**17:30 —** Rituals and the writeup. The weekly metrics review reads every rate's denominator aloud, and the post-mortem culture treats a streak definition that drifted mid-quarter like *a production bug*. The EOD note is definition-first: which cohort broke streaks, which campaign recovered listeners, which rate changed its denominator and why. The best-prepared candidate knows the rhythm: Spotify SQL exists to defend **habit numbers** under definition stress, and the window function is where the defense lives.",
  ],

  metrics: [
    { name: "Streams", what: "Total play events over a window — the headline volume metric. In query form a conditional SUM over play events with the counting rule (threshold, skips excluded?) stated before the fold." },
    { name: "Listening streak", what: "Consecutive-day session runs per listener — the habit metric the retention team manages. Gaps-and-islands in interview form: LAG the previous day, flag the break, run a windowed SUM." },
    { name: "Quiet gap", what: "Days since a listener's previous session, via LAG over their partition. The lapse signal that feeds every churn and winback read — and the metric where window-before-WHERE order bites." },
    { name: "DAU/WAU stickiness", what: "Daily actives ÷ weekly actives. The intensity ratio separating the commute-hour daily from the weekend-only listener — trailing COUNT DISTINCTs with honest denominators." },
    { name: "Time-to-convert (median)", what: "Days from signup to premium, reported as a MEDIAN because the mean is dragged by never-converters. The funnel metric that made median-emulation a Spotify interview staple." },
    { name: "Winback recovery rate", what: "Lapsed listeners who resumed within the winback window ÷ all lapsed. A two-window ratio where both populations must be folded before either percentage is computed." },
    { name: "Growth accounting mix", what: "New / retained / resurrected / churned listeners per month — a LAG'd status classification that must reconcile to the listener census. The CASE-over-window wall the subscription team ships monthly." },
    { name: "Completion rate", what: "Streams played through ÷ streams started, per track. The catalog-quality read that feeds recommendations — a ratio whose skip-definition is the entire interview conversation." },
  ],

  topics: [
    {
      name: "Folding stream events",
      why: "Everything starts by folding the play log: sessions per listener, streams per track, listeners per week. Spotify screens warm up with GROUP BY + HAVING at event scale, and the trap is grain — counting event rows when the business object is a listener. The per-listener census (who holds the most sessions) is the warm-up before any window appears.",
      slugs: ["customer-placing-the-largest-number-of-orders", "unique-orders-and-customers-per-month", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Track & artist leaderboards",
      why: "Charts are GROUP BY with a rank: streams per track, top-N cuts, ties at the boundary. The band's top-five-artists problem is literally this read, and the tie conversation (RANK vs ROW_NUMBER vs LIMIT) is the follow-up Spotify uses to separate memorized queries from understood ones.",
      slugs: ["top-five-artists", "product-sales-analysis-ii", "rank-scores"],
    },
    {
      name: "Per-listener session windows",
      why: "Latest session per listener, most-recent three plays, running context per row — the partitioned window toolkit that powers every 'continue where you left off' surface. Spotify drills ROW_NUMBER partitions with deterministic tie-breaks because session dates tie constantly at event scale.",
      slugs: ["the-most-recent-three-orders", "active-users", "compressed-mode"],
    },
    {
      name: "LAG gaps & streak counting",
      why: "The signature Spotify build: LAG the previous session, flag the break in the day chain, run a windowed SUM to stamp streak ids, fold. Growth accounting — the tagged problem here — is the same LAG grammar applied to monthly status instead of daily dates, and both drill the window-before-WHERE pipeline order.",
      slugs: ["growth-accounting", "biggest-window-between-events", "find-loyal-customers"],
    },
    {
      name: "Lapse & winback windows",
      why: "Churn is defined in gap language: days since last session, judged against the winback bar. The tagged churn-risk and winback-recovery problems are the exact reads — anti-joins over quiet windows and recovery rates over lapsed populations — and the dormant-reactivation variant is the same shape pointed at re-engagement.",
      slugs: ["winback-recovery", "find-churn-risk-customers", "dormant-reactivation"],
    },
    {
      name: "Conversion & duration math",
      why: "The free-to-premium funnel reports MEDIAN time-to-convert — not the mean, which stragglers drag — and duration reads (average session length, time between events) test julianday arithmetic with rounding discipline. The median-emulation problem is the tagged interview classic; the duration folds are its supporting cast.",
      slugs: ["median-time-to-convert", "average-time-of-process-per-machine", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Rolling actives & cohorts",
      why: "Stickiness is a trailing window: rolling 7-day actives, DAU over WAU, new-listener counts by first-ever session. These drills teach the rolling COUNT DISTINCT shape and the first-occurrence gate — the two builds behind every engagement dashboard Spotify ships weekly.",
      slugs: ["dau-wau-stickiness", "rolling-7d-actives", "new-users-daily-count"],
    },
    {
      name: "CASE walls for listener tiers",
      why: "Listener states are classified in SQL: light / standard / heavy by session count, free / premium by plan, engaged / lapsing by quiet gap. The CASE-tier problems drill exhaustive branches and boundary rules — the classification walls that turn a session log into the segments every other query filters on.",
      slugs: ["the-category-of-each-member-in-the-store", "weather-type-in-each-country", "count-salary-categories"],
    },
    {
      name: "NULL hygiene on session telemetry",
      why: "Play logs are full of holes: sessions without ends, listeners without plans, blank regions after a feed merge. Spotify drills COUNT(col) versus COUNT(*) semantics and the COALESCE-at-the-display-edge policy — because a coalesced zero in the middle of a pipeline reads as 'engagement collapsed' in the review.",
      slugs: ["null-blank-audit", "employee-bonus", "calculate-special-bonus"],
    },
    {
      name: "Stitched packets & multi-part asks",
      why: "Screens close composed: the top track per playlist AND a platform-wide stat under the same rule; premium-versus-free packets stitched into one deliverable. The tagged movie-rating problem — argmax by one rule, per-person folds by another, set-op stitched — is the composition test, and the UNION-ALL packet builders are its warm-up.",
      slugs: ["movie-rating", "monthly-transactions-ii", "team-scores-in-football-tournament"],
    },
  ],

  theory: [
    {
      id: "spotify-t1",
      q: "Count listening streaks: a streak is consecutive-day sessions, and you need each streak's length. Walk me through the build — and why ROW_NUMBER alone can't do it.",
      a: "Three stages, the gaps-and-islands grammar. Stage one: per listener, LAG(session_date) OVER (PARTITION BY listener ORDER BY session_date) and the julianday delta — the day gap. Stage two: a flag — CASE WHEN gap IS NULL OR gap > 1 THEN 1 ELSE 0 — marking 'a new streak starts here' (the NULL matters: the listener's first session starts a streak). Stage three: SUM(flag) OVER (PARTITION BY listener ORDER BY session_date) turns flags into streak ids; then GROUP BY listener, streak_id and COUNT. ROW_NUMBER alone can't do it because it numbers rows, not membership: it can't tell you that sessions 4, 5 and 6 BELONG TOGETHER while 7 starts fresh — the streak id needs a running count of breaks, which is exactly what the windowed SUM computes. The frame is the senior detail: with ORDER BY the default frame includes PEERS, so two same-date sessions share the running total and merge — add the row id to the ordering, or an explicit ROWS frame, and say so out loud.",
      tag: "windows",
    },
    {
      id: "spotify-t2",
      q: "The stream census: each play-event row carries quantity — plays per queued batch. Why is the fold SUM(quantity) and not COUNT(*), and what does AVG of per-track averages actually measure?",
      a: "SUM(quantity) adds PLAYS; COUNT(*) counts EVENT ROWS. A queued batch of three plays is one row and three streams — COUNT understates every track whose listeners queue in batches, and the leaderboard reorders accordingly: the two errors are not proportional across tracks, so the RANKING itself changes, which is the part executives notice. The COUNT-shaped cousin, COUNT(quantity), is the same row count with NULL-blindness bolted on — no help. And AVG-of-averages is a third, different number: averaging per-track averages gives a 100-stream track and a 2-stream track the same vote, so the 'average' drifts toward whichever tracks happen to be numerous. The honest single-level fold is total plays ÷ total event rows — a weighted mean — or, better, refusing to average across grains at all and reporting plays per track plus listeners per track as the pair. State which grain the number lives at, out loud, before the division — at Spotify the denominator IS the metric.",
      tag: "aggregation",
    },
    {
      id: "spotify-t3",
      q: "You join sessions to play events and the session-count column doubles. What happened, and what's the discipline that keeps grain intact across a fan-out join?",
      a: "Classic fan-out: sessions joined to play events at event grain — 103 sessions fan to 251 play rows — so any session-level COUNT or SUM now repeats per event row. SUM(o.total) over the joined rows doesn't total session minutes; it totals session-minutes-times-events, a number owned by no business question. The discipline has three moves. One: decide the grain BEFORE joining and aggregate at the smallest grain first — fold play events to session id, then join the folded result to sessions. Two: after any join, re-run the two-count sanity check — COUNT(*) versus COUNT(DISTINCT session_id); the moment they diverge, the grain moved. Three: if a single query must carry two grains, stage them — CTE or derived table per grain, joined at the end — instead of hoping DISTINCT patches the damage. 'The join did it' is not an analysis; 'one row per WHAT, at every stage of this query' is the answer the interviewer is waiting to hear.",
      tag: "joins",
    },
    {
      id: "spotify-t4",
      q: "Session-end timestamps are NULL until a session closes. Where does COUNT(shipped_at) belong in your toolkit, and what's the COALESCE policy?",
      a: "COUNT(shipped_at) is a feature, not a bug: it counts non-NULL values, so on a log where 82 of 103 sessions carry an end stamp it returns exactly the ENDED-session count — the gap between COUNT(*) and COUNT(shipped_at) is the still-open picture, and a dashboard reporting both is reporting demand AND completion. The policy questions start where the display begins. Filter to ended sessions for duration math and SAY so — 'duration over ended sessions; open sessions excluded by definition' — because a WHERE doing definitional work without disclosure is how metrics drift. COALESCE(end, start) inside the pipeline fabricates zero-duration sessions, drags every average down, and ships a fake fact; the only legitimate coalesce is at the display edge, agreed with the stakeholder, for presentation. And the NULL-bar interaction is the sharp edge: WHERE quiet_days > bar silently drops NULL-gap rows — a listener's FIRST session — which is correct for lapse logic and catastrophic if the same shape leaks into a census. NULL policy is a stated decision, made once, out loud.",
      tag: "nulls",
    },
    {
      id: "spotify-t5",
      q: "The engagement filter 'listeners with at least 20 sessions this quarter' — WHERE or HAVING? And where do CASE filters belong relative to the fold?",
      a: "Per-LISTENER gating is HAVING: COUNT(*) >= 20 judges folded groups, after GROUP BY. A per-SESSION predicate — this quarter's sessions only — is WHERE, applied before the fold so the discarded rows never enter any aggregate. The classic failure is a row-level rule placed in HAVING (it can't see rows after folding) or a group-level rule placed in WHERE (it can't see aggregates that don't exist yet). CASE filters fold INTO the aggregation: SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) computes completed plays AND total plays from the same population — numerator and denominator from one fold, so they can never drift apart. The anti-pattern is filtering in WHERE first and dividing — the denominator shrinks to the numerator's population and every rate saturates at 100%. The evaluation order sentence is the whole answer: FROM, WHERE, GROUP BY, HAVING, SELECT — where aliases and windows are born — ORDER BY. Place every filter by asking whether it judges a row or a group.",
      tag: "pipeline",
    },
    {
      id: "spotify-t6",
      q: "Which tracks beat the platform's average play count — and how do the scalar, correlated and EXISTS shapes differ on this question?",
      a: "Three shapes, three questions. The platform-average compare — WHERE plays > (SELECT AVG(plays) FROM track_census) — is a scalar subquery over a STAGED fold: you can't average a per-track aggregate in the same query level that computes it, so the fold lives in a derived table or CTE first. Empty-inner semantics are part of the answer: a scalar over an empty filtered set yields NULL, every comparison goes UNKNOWN, and the report silently returns zero rows — fine when the platform always has an average, dangerous when the inner table is filtered to one playlist. The correlated shape — beats THAT TRACK'S PLAYLIST average — re-runs per outer row and answers a different question at a different cost. EXISTS answers membership, not magnitude: 'tracks that appear in playlist X' short-circuits on the first match and never aggregates. The interviewer's follow-up — 'what happens when the inner query is empty?' — has one honest answer per shape, and knowing which is which is the entire test.",
      tag: "subqueries",
    },
    {
      id: "spotify-t7",
      q: "The winback desk needs days since each listener's previous session, from TEXT dates. What are your date tools, and where does each break?",
      a: "Buckets: STRFTIME('%Y-%m', session_date) — or SUBSTR(date, 1, 7) on ISO text — builds the monthly spine growth accounting hangs on; SUBSTR survives only while the format stays fixed-width ISO, and '%m' alone folds this February into last February. Diffs: JULIANDAY(a) - JULIANDAY(b) returns fractional days — the quiet-gap metric — rounded once at the display edge, never per row. Windows: half-open intervals — date >= '2025-02-01' AND < '2025-03-01' — never BETWEEN on the last day, which drops the final night the moment timestamps gain time components. The unstated traps are the ones to volunteer: these strings carry no timezone declaration, so 'day' is a feed convention, not a physical fact; and the FIRST session per listener has no previous — LAG yields NULL, which fails any comparison and drops out of the lapse bar silently. That NULL is correct for winback logic (a first-ever listener cannot have lapsed) and is worth saying out loud before someone 'fixes' it with a COALESCE and manufactures a fake 999-day gap.",
      tag: "dates",
    },
    {
      id: "spotify-t8",
      q: "Growth accounting ships monthly: new, retained, resurrected, churned — and the four branches must reconcile to the listener census. How do you build it, and what makes the reconciliation more than arithmetic?",
      a: "Stage it. CTE one: per listener per month, an activity row from the session log. CTE two: LAG the status over the monthly spine — last month's state beside this month's. Then the CASE classification: active-now AND no prior month = new; active-now AND active-last-month = retained; active-now AND gap-month(s) = resurrected; active-last-month AND not-now = churned. Fold the four branches with conditional SUMs in one pass so the branch totals MUST sum to the census — the reconciliation identity is the build's built-in audit, and the month it fails is the month a definition drifted. The judgment calls are where the review lives: does 'new' mean first-ever activity or first-in-window (the answer changes the resurrection arm); does a one-session listener count as churned at month end or wait for the lapse bar; and the dedupe — ROW_NUMBER per listener-month with a deterministic tie-break — that keeps a double-fired session from manufacturing a phantom 'new'. Definition-first, window-second, reconciliation-third: that order is the whole discipline.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "spotify-mcq-1",
      prompt: "Each play-event row carries quantity — the plays in that queued batch. Which expression returns a track's total STREAMS?",
      choices: [
        "COUNT(*)",
        "SUM(quantity)",
        "COUNT(quantity)",
        "MAX(quantity)",
      ],
      answer: 1,
      why: "SUM(quantity) adds plays across batch rows — a batch of 3 is one row and three streams. The stream census folds play events with SUM, always.",
      notes: [
        { choice: 0, why: "COUNT(*) counts batch rows, not plays — tracks whose listeners queue in batches get systematically understated and the chart reorders silently." },
        { choice: 2, why: "COUNT(quantity) is the same row count with NULL-blindness — identical to COUNT(*) on a NOT NULL column. No version of COUNT adds anything up." },
        { choice: 3, why: "MAX(quantity) is the single biggest batch ever queued — a per-row extreme, not a total. Every track caps at the same batch ceiling." },
      ],
      difficulty: "easy",
    },
    {
      id: "spotify-mcq-2",
      prompt: "Streak ids come from SUM(flag) OVER (PARTITION BY listener ORDER BY session_date). What is the flag expression that marks 'a new streak starts here'?",
      choices: [
        "CASE WHEN gap IS NULL OR gap > 1 THEN 1 ELSE 0 END, where gap is the julianday delta to LAG(session_date)",
        "CASE WHEN quantity > 1 THEN 1 ELSE 0 END",
        "ROW_NUMBER() OVER (PARTITION BY listener ORDER BY session_date)",
        "CASE WHEN status = 'delivered' THEN 1 ELSE 0 END",
      ],
      answer: 0,
      why: "A new streak starts on the listener's FIRST session (gap NULL) or after a non-consecutive day (gap > 1). The windowed SUM of that flag is the streak id; GROUP BY listener, streak_id then counts streak length.",
      notes: [
        { choice: 1, why: "Batch size has nothing to do with day adjacency — a quantity flag measures queued volume, not streak breaks." },
        { choice: 2, why: "ROW_NUMBER numbers rows, not streak membership — it can't express 'these three sessions belong together, the next starts fresh'." },
        { choice: 3, why: "Status flags classify sessions, they don't detect breaks in a day chain. The streak grammar runs on the date delta." },
      ],
      difficulty: "medium",
    },
    {
      id: "spotify-mcq-3",
      prompt: "The winback desk wants the gap BEFORE each comeback session. Which window reads the previous session's date?",
      choices: [
        "LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at)",
        "LEAD(created_at) OVER (PARTITION BY customer_id ORDER BY created_at)",
        "FIRST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at)",
        "MAX(created_at) OVER (PARTITION BY customer_id)",
      ],
      answer: 0,
      why: "LAG looks one row BACK inside the listener's partition — exactly the previous session. The julianday delta to it is the quiet gap the winback bar judges.",
      notes: [
        { choice: 1, why: "LEAD looks FORWARD — the gap to the NEXT session, negative-or-zero for most rows, and the winback bar filters the whole report into silence." },
        { choice: 2, why: "FIRST_VALUE anchors to the listener's FIRST-ever session — it measures distance from the beginning, not from the previous session, and inflates every comeback." },
        { choice: 3, why: "MAX over the whole partition is the listener's LATEST session date — the same value on every row, and no gap at all." },
      ],
      difficulty: "medium",
    },
    {
      id: "spotify-mcq-4",
      prompt: "Time-to-convert is heavily right-skewed: most convert fast, a tail takes months, some never. Why does the funnel report the MEDIAN?",
      choices: [
        "The median is cheaper to compute than the mean",
        "The median ignores the exact values entirely, so skew can't move it",
        "The median resists the tail: one 300-day straggler moves the mean, not the median",
        "The median is required because SQL has no AVG for days",
      ],
      answer: 2,
      why: "The mean is dragged by the long tail — a handful of stragglers shifts it while the typical listener's experience barely changes. The median tracks the TYPICAL converter, which is the number the funnel team manages; in SQL it's emulated with ROW_NUMBER or PERCENT_RANK over the sorted cohort.",
      notes: [
        { choice: 0, why: "Cost is irrelevant — SQL has no native MEDIAN, so emulation is actually MORE work. The choice is statistical, not computational." },
        { choice: 1, why: "The median uses the middle ORDERED value — ordering is everything; it does not ignore values, it resists extremes." },
        { choice: 3, why: "AVG works fine on days — the refusal is about skew, not capability." },
      ],
      difficulty: "easy",
    },
    {
      id: "spotify-mcq-5",
      prompt: "Growth accounting: a listener active THIS month, not active last month, but active in earlier months. The classification is…",
      choices: [
        "New",
        "Retained",
        "Resurrected",
        "Churned",
      ],
      answer: 2,
      why: "Resurrected: back after a quiet month (or more), with prior history. New means first-EVER activity this month; retained means active in both months; churned means last month but not this one.",
      notes: [
        { choice: 0, why: "New is reserved for first-ever activity — calling a returning listener 'new' double-counts acquisitions and corrupts the funnel story." },
        { choice: 1, why: "Retained requires BOTH months active — this listener has a gap month, which is precisely what the resurrection arm exists to catch." },
        { choice: 3, why: "Churned is the mirror: active LAST month, inactive now. This listener is active NOW — the label is backward." },
      ],
      difficulty: "medium",
    },
    {
      id: "spotify-mcq-6",
      prompt: "Sessions join play events (103 sessions → 251 event rows). What does SUM(o.total) over the joined rows measure?",
      choices: [
        "Total session minutes, unchanged by the join",
        "A number owned by no business question — every session's total repeats per event row",
        "Total plays",
        "NULL — SUM fails after a one-to-many join",
      ],
      answer: 1,
      why: "The fan-out repeats each session row once per play event, so the SUM counts session-minutes-times-events — roughly triple-weighted on this db. Fold play events to session grain first, or aggregate sessions alone.",
      notes: [
        { choice: 0, why: "The join multiplies rows — that's its job. Any per-session value summed over the fan-out is inflated by the event count." },
        { choice: 2, why: "Total plays is SUM(quantity) over the event rows — a different expression entirely, and one that does NOT touch o.total." },
        { choice: 3, why: "SUM is perfectly legal after a one-to-many join — the danger is that it SUCCEEDS silently and ships a confident, wrong total." },
      ],
      difficulty: "hard",
    },
    {
      id: "spotify-mcq-7",
      prompt: "82 of 103 sessions carry a session-end stamp; the rest are open. Which expression counts ENDED sessions?",
      choices: [
        "COUNT(*)",
        "COUNT(shipped_at)",
        "COUNT(DISTINCT shipped_at)",
        "COUNT(status = 'delivered')",
      ],
      answer: 1,
      why: "COUNT(column) skips NULLs — it returns exactly the sessions with an end stamp. The gap between COUNT(*) (103) and COUNT(shipped_at) (82) IS the open-session picture.",
      notes: [
        { choice: 0, why: "COUNT(*) counts rows — all 103 sessions, open or not. Useful, but this question asked for the ended subset." },
        { choice: 2, why: "DISTINCT folds repeated end DATES to unique values — a count of distinct calendar days, not of sessions. Two sessions ending the same day collapse to one." },
        { choice: 3, why: "The status test is a 0/1 expression that is never NULL, so COUNT sees a value on every row and returns 103." },
      ],
      difficulty: "easy",
    },
    {
      id: "spotify-mcq-8",
      prompt: "Completion share = delivered sessions ÷ ALL sessions = 52 of 103. Which expression prints 50.5?",
      choices: [
        "100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*)",
        "100 * SUM(status = 'delivered') / COUNT(*)",
        "(SUM(status = 'delivered') / COUNT(*)) * 100",
        "COUNT(status = 'delivered') / COUNT(*)",
      ],
      answer: 0,
      why: "The conditional SUM folds the numerator from the same rows COUNT(*) uses for the denominator, and the 100.0 forces real division before truncation: 52/103 as a share prints 50.5.",
      notes: [
        { choice: 1, why: "INTEGER 100 divides first: 5200/103 floors to 50 — the .5 vanishes and every rate under 1% would floor to 0 outright." },
        { choice: 2, why: "The inner division happens in integers: 52/103 truncates to 0, times 100 prints 0. The share didn't just lose precision — it died." },
        { choice: 3, why: "COUNT of a 0/1 expression counts non-NULL values — all 103 rows — so this prints 103/103 = 1. It reports the population, not the share." },
      ],
      difficulty: "medium",
    },
    {
      id: "spotify-mcq-9",
      prompt: "Top 5 tracks by plays: 47, 46, 38, then a tie — 36 and 36 — with the next track at 33. What does ORDER BY plays DESC LIMIT 5 return?",
      choices: [
        "Five rows, including BOTH 36-play tracks — the tie sits inside the cut",
        "Five rows with ONE of the 36s, chosen arbitrarily",
        "Six rows — ties always extend a LIMIT",
        "An error — LIMIT refuses tied values",
      ],
      answer: 0,
      why: "LIMIT 5 keeps exactly five rows; the two 36s occupy ranks 4 and 5, both inside the cut, and 33 is sixth. Ties bite only when they straddle the boundary — here the boundary row (33) is untied.",
      notes: [
        { choice: 1, why: "Engine tie ORDER is arbitrary, but tie MEMBERSHIP isn't — nothing is cut when both tied rows fit inside the LIMIT. The arbitrary pick happens only when a tie straddles the cut." },
        { choice: 2, why: "LIMIT never grows for ties — six rows requires DENSE_RANK-plus-filter logic, a different build with a different definition of 'top 5'." },
        { choice: 3, why: "LIMIT is indifferent to duplicates — it's a row cap, not a value comparison. It can't error on ties." },
      ],
      difficulty: "hard",
    },
    {
      id: "spotify-mcq-10",
      prompt: "The listening window is 'the last 30 days'. Which predicate is both calendar-safe and index-shaped?",
      choices: [
        "created_at >= date('now', '-30 day')",
        "STRFTIME('%Y-%m-%d', created_at) >= date('now', '-30 day')",
        "JULIANDAY('now') - JULIANDAY(created_at) <= 30",
        "created_at BETWEEN date('now', '-30 day') AND date('now')",
      ],
      answer: 0,
      why: "A bare comparison against a computed constant keeps the predicate sargable — the index on created_at still works — and a half-open lower bound with no upper bound stays correct as 'now' advances.",
      notes: [
        { choice: 1, why: "Wrapping the column in a function forfeits the index — the engine scans every row. Same calendar, worse plan, and at event scale the difference is minutes." },
        { choice: 2, why: "Same function-wrapped column on the flipped side — unsargable again, plus a per-row julianday conversion. Correct answer, wrong cost profile." },
        { choice: 3, why: "BETWEEN is inclusive on both ends — midnight-boundary rows double-count when timestamps gain time components, and the upper bound freezes a moving 'now'." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-spotify-1",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The winback window",
      brief:
        "Spotify-flavored brief on the storefront db: the winback desk works from silences, not sessions — a comeback is a session that starts after more than 45 quiet days, and the longest silences get the first outreach. The db mapping is declared: orders are listening sessions, customers are subscribers, created_at is the session date. Probed facts: 16 subscribers, 103 sessions across 2024-01-01 to 2025-02-27; per-listener session counts run from 1 to 24, and the quiet gaps between one listener's consecutive sessions stretch far enough that the 45-day bar keeps a real outreach queue. The deliverable: the top 10 comebacks, longest silence first. Listeners with a single session have no previous session to measure from — the definition excludes them by construction.",
      ask: "Return comeback sessions: subscriber id, session date, and quiet days (1 decimal) — longest silence first, top 10.",
      template:
        "WITH spans AS (\n  SELECT customer_id,\n         created_at,\n         julianday(created_at) - julianday({1}(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id)) AS quiet_days\n  FROM orders\n)\nSELECT customer_id, created_at, ROUND(quiet_days, 1) AS quiet_days\nFROM spans\nWHERE quiet_days > {2}\nORDER BY quiet_days {3}\nLIMIT {4};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the previous-session lookback",
          why: "LAG(created_at) reads the previous session inside the listener's partition; the julianday delta is the quiet gap the winback bar judges. LEAD looks forward and drives every gap negative; FIRST_VALUE anchors to the listener's first-ever session and inflates every comeback.",
        },
        {
          answer: "45",
          kind: "number",
          label: "the winback bar",
          noVerify: true,
          why: "The desk fixes the lapse bar at 45 quiet days — the campaign's definition of 'came back after a silence'. A 120-day bar would cut the queue to the extreme tail and the outreach list would starve.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the longest-first direction",
          why: "Outreach starts with the longest silence, so quiet days sort descending. ASC would rank the freshest comebacks first — the listeners who need no winback at all.",
        },
        {
          answer: "10",
          kind: "number",
          label: "the outreach-queue cut",
          noVerify: true,
          why: "The deliverable is a top-10 queue — the CRM batch size, not a metric definition. The bar decides WHO qualifies; the LIMIT decides how many the desk calls this week.",
        },
      ],
      distractors: ["LEAD", "FIRST_VALUE", "120", "365", "ASC"],
      walkthrough:
        "A window, then a bar — in that order, and the order is the lesson. The CTE stamps every one of the 103 sessions with its quiet gap: LAG(created_at) per listener partition, julianday delta in days, NULL on each listener's first session. The bar then filters in the OUTER query, because windows evaluate at the SELECT stage — a same-level WHERE can't see the alias and errors out; staging first is the pipeline-order habit the whole kit drills. NULL gaps fail the bar silently, which is the definition working: the two one-session listeners have no previous session, cannot have lapsed, and correctly drop out. ROUND once at the display edge, longest first, cut to the CRM batch. The distractors each break a different joint: LEAD points the lookback forward — every gap goes negative and the 45-day bar empties the report to zero rows; FIRST_VALUE measures every session against the listener's first-ever session, manufacturing comebacks out of ordinary week-one activity; a 120- or 365-day bar starves the queue; ASC serves the shortest silences first — the exact opposite of the outreach order. LAG for before, LEAD for after, FIRST_VALUE for anchors: three windows, three different business questions.",
    },
    {
      id: "cs-spotify-2",
      tier: "easy",
      topic: "j1",
      universe: "catalog",
      title: "The most-played tracks census",
      brief:
        "Spotify-flavored brief on the storefront db: the content team's weekly read is the play census — tracks ranked by total plays, with the tie behavior stated because the top-5 boundary sits on a shared count. The db mapping is declared: products are the track catalog (names are placeholders; the counts are real), order_items are play events, and quantity is the plays carried per event batch. Probed facts: 251 play events across 103 listening sessions; the play census reads 47, 46 and 38 plays for the top three tracks, then a tie — 36 and 36 — with the next track at 33. The top-5 cut must keep both 36s: the tie occupies ranks 4 and 5, inside the cut, and the boundary row is untied.",
      ask: "Return the top 5 tracks by total plays: track name and play count, most-played first.",
      template:
        "SELECT p.name AS track,\n       {1}(oi.quantity) AS plays\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.id\nORDER BY plays {2}\nLIMIT {3};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the plays fold",
          why: "Plays are SUM(quantity): batch quantities add up across event rows. COUNT would count event rows and shrink every total — the chart reorders, silently; MAX would print the biggest single batch on every track.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-played-first direction",
          why: "A chart reads best at the top: 47, 46, 38, 36, 36 descending. ASC would serve the catalog's least-played tracks — a correct query answering the opposite question, and the exact mistake a rushed ORDER BY makes.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the chart cut",
          noVerify: true,
          why: "The deliverable is a top-5 chart, so the cut is 5. The tie at 36 sits inside the cut — both tracks ride — and the boundary row at 33 is untied, so no track is arbitrarily dropped.",
        },
      ],
      distractors: ["COUNT", "AVG", "MAX", "ASC", "3"],
      walkthrough:
        "A fold, a sort, a cut — and the tie conversation that makes it a Spotify question. The join attaches each of the 251 play-event rows to its track, GROUP BY track folds them, and the census reads 47, 46, 38, then 36 and 36 sharing ranks four and five, with the next track at 33 — the exact figures the content brief quoted. SUM is the whole game: quantity is plays per batch, so SUM(quantity) counts PLAYS while COUNT would count batch rows and quietly shrink every total by a different factor per track — enough to reorder the chart, which is why the fold is the interview's first follow-up. MAX prints the largest single batch (a per-row extreme, identical ceiling everywhere); AVG prints the batch average — neither is a play count. DESC points the chart best-first and LIMIT 5 sizes the deliverable; the tie rides inside the cut because both 36s fit above the untied 33 boundary. When a tie DOES straddle the cut, LIMIT stops being the answer — DENSE_RANK plus a rank filter, and a stated definition of what 'top 5' owes a tied track. Fold, direction, cut: three chips, one honest chart.",
    },
  ],

  problems: [
    { slug: "find-churn-risk-customers", why: "Spotify's tagged churn read: anti-join plus date math that flags listeners whose quiet window crossed the lapse bar — the winback desk's qualifying query." },
    { slug: "growth-accounting", why: "The tagged monthly build: LAG'd listener status classified new / retained / resurrected / churned — the subscription team's reconciliation wall." },
    { slug: "median-time-to-convert", why: "The tagged funnel classic: median-emulated time-to-convert per cohort — the free-to-premium read where the mean lies and the median manages." },
    { slug: "winback-recovery", why: "The tagged campaign metric: lapsed listeners who returned inside the winback window — a two-population rate with the recovery definition baked in." },
    { slug: "null-blank-audit", why: "The tagged telemetry audit: NULL and blank cells per column via conditional SUMs — the hygiene pass that keeps COUNT(col) reads trustworthy." },
    { slug: "sessionize-events", why: "Listening-run sessionization: gap-thresholded grouping of an event log — the streak build's industrial-strength sibling." },
    { slug: "find-loyal-customers", why: "Consecutive-day loyal runs via islands — the day-on-day listening habit, counted the way the streak wall counts it." },
    { slug: "active-users", why: "Consecutive-day activity windows — 'is this listener a habit' drilled as streak counting over raw events." },
    { slug: "user-purchase-platform", why: "Behavior held across two platforms with windows — the free-versus-premium switch detection Spotify's subscription team actually runs." },
    { slug: "biggest-window-between-events", why: "LEAD's finest hour: the biggest quiet window per listener — the forward-looking twin of the kit's LAG gap read." },
    { slug: "rolling-7d-actives", why: "Trailing-7 distinct actives — the rolling window that keeps the stickiness denominator honest without double-counting the week." },
    { slug: "dau-wau-stickiness", why: "DAU over WAU — the intensity ratio separating the commute-hour daily from the weekend-only listener." },
    { slug: "top-five-artists", why: "Top-N by streams — the chart cut with LIMIT and the tie-at-the-boundary conversation the case study makes explicit." },
    { slug: "the-most-recent-three-orders", why: "Per-listener latest-3 via partitioned ROW_NUMBER — the 'recently played' rail with a depth cut and a deterministic tie-break." },
    { slug: "count-salary-categories", why: "CASE tiers plus UNION ALL totals — the listener-tier census where branch totals must reconcile to COUNT(*)." },
    { slug: "dormant-reactivation", why: "NOT EXISTS over a reactivation window — the dormant-listener variant of the churn anti-join, pointed at who's worth winning back." },
  ],
};
