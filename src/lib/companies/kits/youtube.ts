// YouTube — kit 3 of the Streaming & Social domain (Batch C).
// Watch time as the north star, the creator funnel (upload → distribution →
// watch → subscriber) and the recommendation surface that decides both.
// No registry tags exist for YouTube — the pool is THEME-CURATED: every
// problem mirrors a workflow YouTube analytics screens are known to probe.
// Case studies run on the storefront db with probed figures from
// scripts/company-facts.md, mapped as: orders = engagement events,
// customers = viewers, suppliers = channels, shipped_at = event completion.

import type { CompanyKit } from "../types";

export const youtubeKit: CompanyKit = {
  id: "youtube",
  domainId: "media",
  name: "YouTube",
  tagline: "Watch time, creators and the recommendation funnel",
  accent: "text-red-400",

  brief: [
    "YouTube is the largest video platform on earth and the purest **watch-time** business ever built: creators upload, the recommendation surface decides who sees the upload, and the viewer's decision to keep watching is the only vote that counts. Every role in the funnel is a data object — the {orange:impression} (the recommendation surface offered the video), the {sky:view} (the viewer accepted), the like and share (the viewer amplified), the {pink:subscriber} (the viewer committed). The platform lives or dies on the gap between consecutive stages: a video with huge impressions and thin watch-through is a packaging problem, a video with huge watch-through and thin impressions is a distribution problem, and telling those two apart is a SQL question before it is a product question.",
    "The data org thinks in event streams, not page views. An engagement event carries a viewer, a video, a channel, a start stamp and a completion stamp; incomplete events are a first-class population, not garbage — an impression that never became a watch is the top of the funnel, not noise. Analysts sit in **three loops**: the creator-partner loop (channel funnels, subscriber conversion, upload cadence), the viewer loop (sessions, {emerald:returning-viewer share}, streaks), and the surface loop (what the recommendation surface showed, what it earned, what it displaced). In this kit's toy warehouse the mapping is one-to-one: orders are engagement events, customers are viewers, suppliers are channels, products are videos, and `shipped_at` is the event's completion stamp.",
    "The SQL screens are grain discipline under funnel pressure. Warmups ask for a **two-grain census** — events AND distinct viewers per region — because repeat viewing is the intensity signal. Middles ask for conditional folds — {emerald:completed}, {sky:in-progress}, queued and skipped events in one scan, with branch sums that reconcile to the total — and for ladders on the recommendation surface where tie handling is a stated business rule. Back ends ask for momentum: month-over-month deltas on the calendar spine, `LAG`/`LEAD` between a viewer's events, and the honest-denominator questions (completed share, returning-viewer share) where filtering before the ratio silently changes the answer.",
    "Prepare by making your definitions audible. Before every ratio, say the denominator out loud: completed of ALL events, not of shipped events. Before every `COUNT`, say the grain: events, viewers, or line items after a fan-out join. Drill the window trio until ties are a decision, not a surprise; drill `LAG` until a NULL first row reads as 'no prior event', not as a bug. And rehearse the completion-gate: `shipped_at IS NOT NULL` selects the **82 finished events of 103** — knowing what an aggregate silently excludes is the difference between a number and a rumor.",
  ],

  dayInLife: [
    "**09:05 —** The freshness read. Overnight engagement events land in the warehouse and the first query is a reconciliation: event count versus the trailing band, completion stamps versus expectation, and the funnel census — **completed, in-progress, queued, skipped** — in one pass, branch sums checked against `COUNT(*)` before anyone says a number out loud. The analyst who spots a {rose:completion-rate} drop must immediately split it: is the denominator drifting (more queued events) or the numerator (fewer completions)? The diff query — which slice moved, by how much — is the morning's deliverable.",
    "**11:45 —** The creator-partner loop owns midday. A channel team wants the **channel leaderboard** by watch-time value with the recommendation-surface share beside it; a partner manager wants each creator's upload cadence — gaps between uploads, `LAG` between events — because cadence is the leading indicator of session decay; the monetization read wants creator revenue and the within-region share, staged through a fold and a window, because *a raw number without its peer group is a number nobody can act on*. Each ask is a join chain, a conditional aggregate and one judgment call about which population the denominator names.",
    "**15:20 —** Stakeholder translation with definitions attached. The weekly review reads off a calendar spine — months as text buckets, momentum as a `LAG` delta — and every headline ships with its query: the completed share's denominator spelled out, the returning-viewer roll call's `HAVING` threshold documented, the tie rule on any ladder stated before the tie happens. Every headline is read twice in that room: once as a number, once as its definition.",
    "**18:00 —** The writeup and the post-mortem culture. A mis-defined metric is an incident: if the completed-share denominator quietly became 'shipped events', the fix is a **query diff and a definition note**, not a dashboard patch. The EOD packet records what moved, which denominator each headline used, and which tie rule was invoked — the paper trail is the deliverable. The best-prepared candidate knows the rhythm: YouTube SQL exists to defend **watch-time numbers** under recommendation-scale ambiguity.",
  ],

  metrics: [
    { name: "Watch time", what: "The north star — hours the audience stayed. Every recommendation decision is judged against it, and nearly every query here is a status-aware version of a watch-time fold." },
    { name: "Impressions CTR", what: "Views ÷ impressions — the packaging gate. A drop here indicts thumbnail and title before it indicts content, and computing it is a ratio where the denominator is the offered population." },
    { name: "Average view duration", what: "Mean seconds watched per started view. The honesty trap: incomplete events carry NULL durations and AVG silently drops them — the population must be stated with the number." },
    { name: "Returning-viewer share", what: "Viewers with 2+ events ÷ all viewers in the window. The loyalty read the case study rebuilds as a HAVING-gated roll call on the live db." },
    { name: "Subscriber conversion", what: "New subscribers ÷ viewers of the video. The commitment stage of the funnel — a conditional count whose numerator lives downstream of the denominator's population." },
    { name: "Upload cadence", what: "Uploads per channel per week, and the gaps between them. The creator-health leading indicator; the LAG-between-events query is its daily driver." },
    { name: "Session velocity", what: "Events per viewer per session. The compounding metric — recommendation surfaces are judged on whether the next watch happens inside the same session." },
    { name: "Completion latency", what: "Time from event start to event completion. The pipeline health read — julianday arithmetic over completed events only, with the excluded population named." },
  ],

  topics: [
    {
      name: "Watch-time folds",
      why: "Watch time is the currency, and every channel review opens with a fold: events grouped by day or video, duration summed, totals compared. YouTube probes whether you can fold event rows into per-video and per-day aggregates without letting incomplete events or fan-out joins pollute the total.",
      slugs: ["group-sold-products-by-the-date", "product-sales-analysis-ii", "find-total-time-spent-by-each-employee"],
    },
    {
      name: "The impression-to-watch gate",
      why: "The funnel's first gate is conditional: of all impressions, how many became watches, and how many skipped? YouTube drills SUM(CASE WHEN …) and FILTER (WHERE …) because the completed-share, the skip-share and the queued pool must all come out of one scan over one population — denominator drift here mislabels a packaging problem as a distribution problem.",
      slugs: ["immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "The two-grain viewer census",
      why: "'Events AND viewers per region' is the opening read of every audience review — COUNT(*) counts event load while COUNT(DISTINCT viewer) counts people, and the ratio between them is viewing intensity. The interview checks that you can hold both grains in one query and say which is which.",
      slugs: ["daily-leads-and-partners", "article-views-i", "find-followers-count"],
    },
    {
      name: "Event-to-channel enrichment",
      why: "Channel reporting means attaching creator attributes to every event — a join chain from events through videos to channels where the mapping can be stale. YouTube's follow-up is always about grain: after the chain, is COUNT(*) still counting events, or something else?",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Recommendation-surface ladders",
      why: "Trending, top-per-channel, next-up slots — surface reporting is leaderboard reporting. YouTube drills the rank trio because ties are routine when videos share completion counts, and the LIMIT-1-OFFSET-1 habit breaks silently on them.",
      slugs: ["rank-scores", "second-highest-salary", "department-top-three-salaries"],
    },
    {
      name: "Viewer-graph pairs",
      why: "Co-viewing and shared-subscriber reads are self-join work: viewers who watched the same video, subscribers shared between channels, second-degree reach through the follower graph. The pairing rule — a.role < b.role — halves the symmetric fan-out, and the interviewer asks you to predict the row count before you run it.",
      slugs: ["number-of-calls-between-two-persons", "strong-friendship", "second-degree-follower"],
    },
    {
      name: "NULL policy on incomplete events",
      why: "An event without a completion stamp is real demand in flight, not garbage. YouTube screens check whether you treat the NULL as a population to report, coalesce it for display, or exclude it with a stated reason — deliberately, never by accident of AVG's NULL-dropping.",
      slugs: ["employee-bonus", "calculate-special-bonus", "books-with-null-ratings"],
    },
    {
      name: "Return-visit windows",
      why: "Habit is the product: viewers back within seven days, streaks of consecutive-day watching, the biggest gap between two events. LAG and date arithmetic decide all three, and the window's NULL first row is where sloppy queries call a first session a churn signal.",
      slugs: ["users-with-two-purchases-within-seven-days", "biggest-window-between-events", "active-users"],
    },
    {
      name: "Sessionization & gaps",
      why: "A session is a stitched artifact: events ordered per viewer, a new-session flag when the gap crosses a threshold, then session-level metrics. YouTube drills the LAG-flag-then-REGROUP pattern because 'events per session' is meaningless until the stitch is honest.",
      slugs: ["sessionize-events", "create-a-session-bar-chart", "friendly-movies-streamed-last-month"],
    },
    {
      name: "Honest rates & denominators",
      why: "Completed share, CTR, returning share — every YouTube ratio punishes integer division and careless filters. The house habit: 100.0 before the division, the denominator's filter decided before the ratio, rounding only at the end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "ads-performance"],
    },
  ],

  theory: [
    {
      id: "youtube-t1",
      q: "The channel leaderboard joins events to videos to channels. Why does COUNT(*) stop counting events after that chain — and what do you do about it?",
      a: "Because joins change the grain. Events join videos one-to-one on video id, but the moment any hop is one-to-many — one event touching multiple line items, one channel with multiple videos per event path — COUNT(*) counts the fan-out product, not the event. The strong answer states the grain after every hop: 'events, still events, now line items.' The repair depends on the question: COUNT(DISTINCT event_id) folds the fan-out back to events when you need the census, while a revenue-style SUM over line-item grain is correct AS line-item revenue and should be labeled that way. The interviewer is listening for the reflex of saying 'one row per what?' after every JOIN — at YouTube that reflex is the difference between a watch-time total and a meaningless one.",
      tag: "joins",
    },
    {
      id: "youtube-t2",
      q: "Two videos tie at the top of the trending ladder. Walk me through what RANK, DENSE_RANK and ROW_NUMBER each do to the third video — and which one the surface should ship.",
      a: "ROW_NUMBER hands the tie an arbitrary order and numbers straight through: 1, 2, 3 — the tie erased, and with it the fact that two videos tied. RANK lets the tie share a rung and then skips: 1, 1, 3 — honest about the tie, but the gap implies a third-place video that doesn't exist. DENSE_RANK shares the rung and stays compact: 1, 1, 2 — ties visible, no phantom gap. The business rule decides: a 'top videos' module with N slots wants ROW_NUMBER (slots are physical, someone must win), an editorial 'tier' view wants DENSE_RANK (tiers are definitions, not slots), and RANK is for competition scoring where skipped rungs carry meaning. Saying 'the choice is a decision, not a default' — and naming which the surface needs before writing the OVER clause — is the answer that lands.",
      tag: "windows",
    },
    {
      id: "youtube-t3",
      q: "A region logged 45 events from 8 viewers. Explain what each count means to the business and why both belong in the report.",
      a: "COUNT(*) folds to 45 — event load, the demand the recommendation surface and the CDN actually served. COUNT(DISTINCT viewer_id) folds to 8 — audience size, the number of humans behind the load. Neither replaces the other: 45 events from 8 viewers is 5.6 events per viewer, an intensity signal that says this region re-watches and binge-views, versus a region where load tracks headcount. The trap one level up: after joining events to line items or channel attributes, COUNT(*) silently counts the fanned grain and the 'intensity' ratio collapses to 1. The habit the interviewer wants: for every COUNT in the query, say the grain out loud — events, viewers, or join product — and let the two-grain census keep both columns because the gap between them IS the analytics.",
      tag: "aggregation",
    },
    {
      id: "youtube-t4",
      q: "Average view duration reads 2.98 days on our toy warehouse. What population produced that number, and how do you make the query honest about it?",
      a: "AVG(julianday(shipped_at) - julianday(created_at)) averages over completed events only — every row with a NULL completion stamp drops out of the aggregate silently, so 82 of 103 events produced the 2.98 while 21 in-flight or skipped events contributed nothing. That can be the right number, but it must ship labeled 'average over completed events', not 'average view duration'. The honest shapes: filter WHERE shipped_at IS NOT NULL and say so in the column name or the footnote; or split the read — AVG over completed, COUNT over all — so the denominator rides beside the mean. The sin is COALESCE(shipped_at, created_at) to 'fix' the NULLs: that pins every incomplete event's duration to zero and drags the average toward a number that describes nobody. NULL is a state here, not a zero.",
      tag: "nulls",
    },
    {
      id: "youtube-t5",
      q: "For the completed-watch share, where does the completion filter live — WHERE, HAVING, or an outer query — and what breaks if it lives in the wrong one?",
      a: "Completion is a row-level fact, so the numerator's filter lives in the conditional aggregate — SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) — while the denominator deliberately has NO filter: COUNT(*) over all events is the population the share is defined against. A WHERE clause would discard rows before the fold, shrinking the denominator to the numerator's population and reading 100% or 0% per group — the classic denominator drift. A HAVING clause is worse: it judges post-aggregation groups, so it can only drop whole groups, never recover the rows you already excluded. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is the mental checklist: place each filter by asking 'is this a fact about one row, or about a group?', and keep the share's denominator population identical to the census population.",
      tag: "pipeline",
    },
    {
      id: "youtube-t6",
      q: "The 'first-session cohort' report needs each viewer's first event and everything that happened in the 7 days after it. Sketch the query shapes you'd reach for.",
      a: "First-occurrence is a fold-then-join problem, and there are three honest shapes. The scalar route: a correlated subquery SELECT MIN(created_at) FROM events e2 WHERE e2.viewer_id = e1.viewer_id finds each row's viewer-first stamp, correct but re-executed per row. The derived route: fold first stamps in an inner query grouped by viewer, then join back on viewer and first stamp — one pass over the fold, the workhorse for cohort windows. The window route: ROW_NUMBER() OVER (PARTITION BY viewer ORDER BY created_at) = 1 keeps the first row without a join at all, and extends cleanly to 'first event of each calendar week'. The interviewer's follow-up is the empty case — what if a viewer has no event in the window? — which decides whether the outer join is INNER (cohort members only) or LEFT (everyone, cohort columns NULL). Pick the shape by data size and the next question you'll be asked, and say why.",
      tag: "subqueries",
    },
    {
      id: "youtube-t7",
      q: "You're asked for 'the biggest gap between consecutive events per viewer'. How do you build it, and where do the classic date bugs hide?",
      a: "LAG is the tool: in an inner query, LAG(created_at) OVER (PARTITION BY viewer_id ORDER BY created_at) hands each event its predecessor; outside, julianday(created_at) - julianday(prev) is the gap in days, and MAX per viewer finds the biggest. The window cannot live in WHERE — it executes at SELECT time — so the two-stage shape (compute, then filter) is mandatory, via a derived table or CTE. The classic bugs: ordering by a text timestamp that isn't ISO (silent misordering), forgetting the PARTITION so viewers' gaps cross-contaminate, and treating the first row's NULL gap as a zero — it is 'no prior event', and MAX ignores it correctly while a COALESCE to zero would corrupt the read. For day-grained reads, STRFTIME('%Y-%m', …) buckets months safely because ISO text sorts; for hour-of-day, STRFTIME('%H', …) — and say which time zone the stamp claims to be in.",
      tag: "dates",
    },
    {
      id: "youtube-t8",
      q: "The morning funnel census reads 52 completed, 30 in-progress, 14 queued, 7 skipped — but the total shows 104. What's your move?",
      a: "Trust the reconciliation identity first: branch sums must equal COUNT(*) over the same population, so 104 against a census table of 103 means one branch is double-counting or the population differs — a stale filter, a JOIN that fanned the grain, or a branch whose literal matches two states. The debug sequence: run COUNT(*) alone (103), then each branch alone (52, 30, 14, 7), then the branch sums — whichever pair disagrees is the guilty clause. The second-class bug is vocabulary drift: 'complete' on the event table versus 'paid' on the billing table are different vocabularies, and a branch holding the wrong word reads a silent zero forever. The strong answer ends with prevention: build the census so the branches are exhaustive over the status column's actual domain, assert the identity in the query itself, and treat any future schema value as a census change, not a query bug.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "youtube-mcq-1",
      prompt: "The event store logs 103 engagement events; 52 carry the completion state 'delivered'. Which expression computes the completed share?",
      choices: [
        "SUM(status = 'delivered') * 100 / COUNT(*)",
        "100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*)",
        "COUNT(status = 'delivered') * 100.0 / 103",
        "COUNT(status) * 100.0 / COUNT(*)",
      ],
      answer: 1,
      why: "The conditional sum counts completions at the same fold as COUNT(*) counts events, and 100.0 forces real division: 50.49, which the one-decimal report prints as 50.5. Both guards — same-grain denominator, float promotion — in one expression.",
      notes: [
        { choice: 0, why: "SQLite evaluates the boolean as 0/1, but the INTEGER 100 forces integer division: 5200/103 truncates to 50 before any rounding sees it." },
        { choice: 2, why: "COUNT over a boolean expression counts non-NULL results — essentially every row — reporting ~100% for almost any input." },
      ],
      difficulty: "easy",
    },
    {
      id: "youtube-mcq-2",
      prompt: "EU logged 45 events from 8 viewers. What does COUNT(DISTINCT customer_id) capture that COUNT(*) does not?",
      choices: [
        "The region's watch-time total",
        "The number of unique viewers — repeat events folded back to people",
        "The average events per viewer",
        "Nothing — DISTINCT never changes a joined count",
      ],
      answer: 1,
      why: "COUNT(*) counts event rows (45); COUNT(DISTINCT customer_id) counts people (8). The gap — 5.6 events per viewer — is the viewing-intensity signal the two-grain census exists to expose.",
      notes: [
        { choice: 2, why: "That ratio is 45.0/8 — a different expression. DISTINCT folds rows to people; it never divides." },
        { choice: 3, why: "DISTINCT changes everything under fan-out: five events from one viewer contribute 5 to COUNT(*) and 1 to COUNT(DISTINCT …)." },
      ],
      difficulty: "easy",
    },
    {
      id: "youtube-mcq-3",
      prompt: "`SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.shipped_at IS NOT NULL` — what silently happened?",
      choices: [
        "Nothing — the LEFT JOIN still keeps every customer",
        "The WHERE turned it into an INNER JOIN and dropped every incomplete event (NULL shipped_at fails the test)",
        "It now returns only skipped events",
        "Each viewer appears once per completed event — duplicates are the bug",
      ],
      answer: 1,
      why: "Filtering the right table's column in WHERE kills the NULL-payload rows — 21 events with NULL shipped_at (14 pending, 7 cancelled) vanish, and any viewer left with zero surviving rows goes with them. The LEFT-ness survives only in the ON clause.",
      notes: [
        { choice: 0, why: "NULL IS NOT NULL evaluates to UNKNOWN, which is discarded. Unmatched or incomplete rows never survive a WHERE on the right table." },
        { choice: 3, why: "Fan-out duplication is real for multi-event viewers — but it's a separate effect. This predicate removes rows; it doesn't duplicate them." },
      ],
      difficulty: "medium",
    },
    {
      id: "youtube-mcq-4",
      prompt: "Two videos tie at 46 completed views for the trending slot; the next has 31. `DENSE_RANK() OVER (ORDER BY views DESC)` assigns the 31-view video rank…",
      choices: ["1", "2", "3", "4"],
      answer: 1,
      why: "DENSE_RANK gives both 46-view videos rank 1 and the next distinct value rank 2 — ties share a rung, no gaps. RANK would say 3 (gap kept); ROW_NUMBER would say 3 with an arbitrary tie order.",
      notes: [
        { choice: 2, why: "That's RANK's answer: ties share 1, the next jumps to 3. DENSE_RANK never skips — tier logic wants the compact sequence." },
        { choice: 3, why: "Ranks only reach 4 with four distinct values. Two tied firsts plus one follower is three positions, densely numbered 1, 1, 2." },
      ],
      difficulty: "easy",
    },
    {
      id: "youtube-mcq-5",
      prompt: "A momentum report computes `ROUND(watch_value - LAG(watch_value) OVER (ORDER BY month), 2)`. What does the first month's momentum read?",
      choices: [
        "0 — LAG falls back to the current row",
        "The first month's own watch_value",
        "NULL — there is no prior row for LAG to fetch",
        "A runtime error — LAG cannot appear in SELECT",
      ],
      answer: 2,
      why: "LAG on the very first row of the frame has no predecessor and returns NULL — the honest reading is 'no prior month to differ from'. A default can be requested explicitly with LAG(x, 1, 0) if the business wants a zero-based first row.",
      notes: [
        { choice: 0, why: "LAG defaults to NULL, not to the current row. A silent 0 would print the first month's full value as 'momentum' — a misread the review would repeat forever." },
        { choice: 3, why: "Window functions are legal in the SELECT list precisely so they can see neighbor rows; only their results can't be filtered in WHERE." },
      ],
      difficulty: "medium",
    },
    {
      id: "youtube-mcq-6",
      prompt: "You must flag a new session whenever a viewer's gap since their previous event tops 30 minutes. Which shape is correct?",
      choices: [
        "WHERE julianday(created_at) - LAG(julianday(created_at)) OVER (PARTITION BY viewer ORDER BY created_at) > 30.0/1440",
        "Compute LAG(created_at) in an inner query, then filter the gap in the outer WHERE",
        "HAVING COUNT(*) > 30 per viewer",
        "CASE WHEN created_at > '30 minutes' THEN 1 ELSE 0 END",
      ],
      answer: 1,
      why: "Window functions execute at SELECT time, so their results can't be filtered in WHERE — the LAG must run in a derived table or CTE first, and the outer query applies the 30-minute threshold to the computed gap.",
      notes: [
        { choice: 0, why: "This errors or misbehaves: LAG isn't available to WHERE at all — the classic 'just filter on the window' bug." },
        { choice: 2, why: "HAVING judges group aggregates like COUNT, not row-to-row gaps. It counts events, never measures time between them." },
      ],
      difficulty: "medium",
    },
    {
      id: "youtube-mcq-7",
      prompt: "flag is a 1/0 completion indicator that can be NULL for in-flight events. Which pair of expressions ALWAYS agrees (ignoring scale)?",
      choices: [
        "AVG(flag) and SUM(flag) / COUNT(*)",
        "COUNT(flag) and COUNT(*)",
        "SUM(flag) / COUNT(*) and SUM(flag) / COUNT(flag)",
        "AVG(flag) and 100.0 * SUM(flag) / COUNT(*)",
      ],
      answer: 0,
      why: "The mean of a 1/0 indicator IS the sum of 1s divided by the row count — AVG ignores NULLs exactly like SUM, and COUNT(*) holds the same population. The completed-share has an elegant twin: 100.0 * AVG(flag).",
      notes: [
        { choice: 1, why: "COUNT(flag) skips NULLs, COUNT(*) doesn't — with in-flight events present the two diverge by exactly the in-flight pool." },
        { choice: 2, why: "COUNT(flag) shrinks the denominator to completed rows, inflating the share — the denominator-drift bug in expression form." },
      ],
      difficulty: "hard",
    },
    {
      id: "youtube-mcq-8",
      prompt: "The event store has 103 rows; shipped_at is NOT NULL for exactly 82. What does `COUNT(DISTINCT shipped_at)` return?",
      choices: ["103", "82", "21", "82 only if two events completed at the same second — otherwise fewer"],
      answer: 1,
      why: "COUNT — plain or DISTINCT — skips NULLs, so the 21 incomplete events drop out and the count runs over the 82 completion stamps. If two events shared an identical stamp string, DISTINCT would fold them too, which is why the completion census uses COUNT(shipped_at), never DISTINCT.",
      notes: [
        { choice: 0, why: "103 is COUNT(*)'s answer — it counts rows, NULLs included. The moment a column goes inside, NULLs are gone." },
        { choice: 2, why: "21 is the incomplete pool — the population COUNT(DISTINCT shipped_at) excludes, not the one it returns." },
      ],
      difficulty: "hard",
    },
    {
      id: "youtube-mcq-9",
      prompt: "events JOIN event_items turns 103 events into 251 rows. What does `COUNT(*)` report after the join, and what reports the true event count?",
      choices: [
        "103 either way — joins never change counts",
        "251 line items; the true count is COUNT(DISTINCT e.id)",
        "251 events — the join added events",
        "103; the extra rows are deduplicated automatically",
      ],
      answer: 1,
      why: "The join fanned each event to its line items — one row per item — so COUNT(*) counts 251 line items, not events. COUNT(DISTINCT e.id) folds the fan-out back to the 103 events the census expects.",
      notes: [
        { choice: 2, why: "The join didn't create events — it multiplied event rows per item. Calling 251 'events' is exactly how watch-time totals inflate." },
        { choice: 3, why: "SQL never auto-deduplicates joins. The 251 rows are all real; only the COUNT's grain is wrong." },
      ],
      difficulty: "hard",
    },
    {
      id: "youtube-mcq-10",
      prompt: "Completion lag reads `ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2)` = 2.98. Which events fed that average?",
      choices: [
        "All 103 events — NULL lags count as zero",
        "Only the 82 events with shipped_at NOT NULL",
        "Only delivered events, not shipped ones",
        "Only the events from the last month",
      ],
      answer: 1,
      why: "AVG skips NULLs, so the 21 events without a completion stamp contribute nothing and the 2.98 is an average over the 82 completed events — which is why the metric ships labeled 'average over completed'.",
      notes: [
        { choice: 0, why: "NULL is not zero — it's exclusion. Counting in-flight events as zero-day completions would be a fabricated 2.29." },
        { choice: 2, why: "Both delivered and shipped rows carry a completion stamp in this store — 52 + 30 = 82. The excluded population is pending plus cancelled." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-youtube-1",
      tier: "easy",
      topic: "j1",
      universe: "growth",
      title: "The returning-viewer roll call",
      brief:
        "YouTube-flavored brief on the storefront db: the partner-analytics review opens with the returning-viewer roll call — the loyalty list — and the creator-ops lead is explicit: 'one-off impressions are noise; habit is the product. Show me the viewers with at least FOUR engagement events, name, region, event count, busiest first.' Probed facts: the event store holds 103 events from 16 viewers, only 2 of them one-off; the leaders are Alice Chen at 24 events (EU), Emma Wilson at 17 (US), Grace Kim at 14 and Maya Patel at 13 (both APAC). The threshold is a definition, not a suggestion: it decides who makes the loyalty list and who doesn't.",
      ask: "Return the viewers with at least four engagement events: name, region, event count — busiest first.",
      template:
        "SELECT c.name,\n       c.region,\n       {1}(*) AS events\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name, c.region\n{2} COUNT(*) >= {3}\nORDER BY events {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the event counter",
          why: "COUNT(*) folds the event rows joined to each viewer — Alice Chen reads 24, Emma Wilson 17. SUM(*) doesn't exist and MAX(*) would report one event, not the viewer's load.",
        },
        {
          answer: "HAVING",
          kind: "keyword",
          label: "the post-fold gate",
          why: "The threshold judges COUNT(*), a group aggregate that only exists after the fold — so the gate is HAVING. WHERE runs before aggregation, can't see COUNT(*), and errors in this position.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the loyalty threshold",
          why: "The lead fixed the bar at four events: nine of the sixteen viewers clear it, and the four-event rung is shared by four viewers — Isabella Rossi, Keiko Sato, Noah Meyer and Pedro Alvarez. A 2 would flood the list with 14 viewers; 10 would cut it to the four leaders.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The roll call opens with Alice Chen's 24: descending. ASC would lead with the four-viewer tie — a correct query answering the opposite question.",
        },
      ],
      distractors: ["SUM", "WHERE", "ASC", "2"],
      walkthrough:
        "A two-stage read: fold, then gate. The join attaches each of the 103 events to its viewer — every event survives — and GROUP BY folds them to one row per viewer, COUNT(*) reading Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13, down to the two one-off viewers the threshold excludes. HAVING is the only clause that can judge COUNT(*), because it runs after the fold; WHERE would be a syntax error here, which is why 'HAVING for aggregates, WHERE for rows' is the drill. The bar of 4 passes nine viewers and exposes a four-way tie at the bottom rung — ORDER BY events DESC makes the leaders deterministic while the tied 4s read in arbitrary order, a reminder that the roll call is rank-agnostic by design. Swap the threshold to 2 and the list swells to 14 of 16 — the loyalty story dissolves into the whole audience, which is exactly what the threshold exists to prevent.",
    },
    {
      id: "cs-youtube-2",
      tier: "medium",
      topic: "t7",
      universe: "month-close",
      title: "The month-over-month watch-time momentum",
      brief:
        "YouTube-flavored brief on the storefront db: the monthly review opens on the 14-month calendar spine and the CFO's eye goes to momentum — 'not the level, the DELTA: which way is watch-time value moving, and how hard?' Probed facts: the spine runs 2024-01 (peak, 3731.97) through 2025-02 (2390.53), and the floor sits at 2024-07 with 8 events but only 1193.86 of watch-time value — the trough the momentum read must recover from. The deliverable is the calendar's opening three months with a momentum column: each month's value minus the prior month's, two decimals, in month order. The first month has no prior — the definition says that row's momentum is not zero, it is unknown.",
      ask: "Return the first three months on the '%Y-%m' spine with event count, watch-time value, and the month-over-month momentum (2 decimals).",
      template:
        "SELECT month,\n       watches,\n       watch_value,\n       ROUND(watch_value - LAG({1}) OVER (ORDER BY month), 2) AS momentum\nFROM (\n  SELECT STRFTIME('%Y-%m', created_at) AS month,\n         COUNT(*) AS watches,\n         ROUND(SUM(total), 2) AS watch_value\n  FROM orders\n  GROUP BY month\n)\nORDER BY month {2}\nLIMIT {3};",
      slots: [
        {
          answer: "watch_value",
          kind: "keyword",
          label: "the momentum operand",
          why: "Momentum is defined on watch-time VALUE, so LAG fetches the prior month's watch_value. 'total' doesn't exist in the folded table (it errors), and LAG(watches) would momentum the event count — a different report.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar direction",
          why: "The spine reads 2024-01 forward — ascending, which for ISO '%Y-%m' text is also numeric order. DESC would open the review at 2025-02 and compute momentum backwards.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the three-month cut",
          noVerify: true,
          why: "The ask names the first three months: the peak (3731.97), the first delta (-122.33) and the March slide (-992.56). LIMIT 3 keeps exactly that window; LIMIT 5 would hand the review a quarter nobody requested.",
        },
      ],
      distractors: ["watches", "total", "DESC", "5"],
      walkthrough:
        "Two stages because LAG can't sit on an aggregate. The inner query folds 103 events onto the '%Y-%m' spine — COUNT(*) per month, ROUND(SUM(total), 2) as watch_value — producing one row per month from 2024-01 (8 events, 3731.97) to 2025-02 (7, 2390.53), with the 1193.86 July floor somewhere the review will scroll to. The outer query walks the spine in ASC order and LAG(watch_value) hands each month its predecessor: 2024-01 gets NULL (no prior month — and the definition says NULL, not 0), 2024-02 reads -122.33, 2024-03 reads -992.56, the two-month slide the CFO actually asked about. The slot that kills reports is the operand: LAG(watches) compiles and produces a perfectly reasonable-looking count momentum that no one asked for, which is why the definition — momentum OF WHAT — must be stated before the OVER clause is written. ISO month text makes ORDER BY month safe; the day anyone stores '2024-1', the spine reorders silently.",
    },
  ],

  problems: [
    { slug: "find-total-time-spent-by-each-employee", why: "The watch-time fold: sum a duration column per actor — the exact shape of 'watch time per channel' before any funnel logic touches it." },
    { slug: "product-sales-analysis-ii", why: "Per-video totals from event lines — the video census every creator-partner review opens with." },
    { slug: "article-views-i", why: "Distinct viewers per video — the two-grain read (events vs people) that separates load from audience." },
    { slug: "find-followers-count", why: "Per-channel subscriber roll-ups — the commitment stage of the creator funnel, counted with a plain grouped fold." },
    { slug: "immediate-food-delivery-ii", why: "The completed-share ratio: a conditional count over ALL events — YouTube's watch-through question with the denominator built in." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before any trending ladder ships, said out loud with the 1,1,2 pattern." },
    { slug: "department-top-three-salaries", why: "Top-3 per group with names joined back — the per-vertical video ladder, tie-proofed and NULL-safe." },
    { slug: "active-users", why: "Consecutive-day habit detection — the returning-viewer streak read that decides whether a surface is building a routine." },
    { slug: "users-with-two-purchases-within-seven-days", why: "The return-visit window: two events inside seven days — the re-watch definition retention reports live on." },
    { slug: "biggest-window-between-events", why: "Largest gap between consecutive events per actor — upload-cadence and session-decay analysis in one LAG." },
    { slug: "sessionize-events", why: "Stitching events into sessions with a gap threshold — the two-stage LAG-then-regroup pattern behind every 'events per session' metric." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator drill behind CTR and completed-share." },
    { slug: "confirmation-rate", why: "LEFT JOIN plus a rounded share where unmatched actors count as zero — the NULL-policy and rounding habits in one channel-health deliverable." },
    { slug: "employee-bonus", why: "Conditional display over a possibly-NULL column — the completion-stamp read where in-flight events must show as in-flight, not zero." },
    { slug: "user-activity-for-the-past-30-days-i", why: "Window-filtered actives: distinct viewers in a trailing 30-day band — the rolling-audience read on the event spine." },
    { slug: "movie-rating", why: "The multi-part composition: argmax by one rule, grouped stats by another — the two-question screen closer that tests composure." },
  ],
};
