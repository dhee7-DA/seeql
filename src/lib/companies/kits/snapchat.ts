// Snapchat — kit 10 of the Streaming & Social domain (wave-6, batch C).
// The ephemeral-messaging company: opens per session, the camera-vs-chat
// split, streak retention and the session-level window questions an app that
// deletes its own content asks daily. Pool provenance: Snapchat carries ZERO
// tagged registry problems — all 16 problem slots and all 30 topic slugs are
// THEME-CURATED from the SQL band's session/streak/pivot-shaped problems
// (stated per spec). Case studies run on db/custom.db with probed figures
// from scripts/company-facts.md, mapped as: orders = app-open sessions,
// customers = Snapchatters, regions = tracked market cohorts, order status =
// session outcome (delivered = snap captured & sent, shipped = chat/story-only
// session, pending = drafted in memory, cancelled = abandoned), order_items =
// in-session event batches (quantity = events per batch), order total =
// session engagement units, shipped_at = cloud-save stamp, invoices/payments
// = premium & ads billing (INTEGER cents ÷ 100), suppliers = lens partners,
// expenses = infra spend. Mappings declared in-world, no invented telemetry.

import type { CompanyKit } from "../types";

export const snapchatKit: CompanyKit = {
  id: "snapchat",
  domainId: "media",
  name: "Snapchat",
  tagline: "Ephemeral messaging and camera engagement",
  accent: "text-yellow-300",

  brief: [
    "Snapchat is the ephemeral camera app — content that deletes itself, a chat that behaves like a conversation rather than a feed, and the **streak** as the product's own retention machine. The unit of analysis is the **open session**, stamped with a user, a market cohort and an outcome: {emerald:snap captured & sent}, {sky:chat-or-story only}, drafted in memory, or {rose:abandoned}. Everything the business decides — which lenses get resourced, where the streak-break alarms fire, what the camera-vs-chat split did after a redesign — hangs on queries that fold event batches into session outcomes, sessions into streak survival, and survival into the retention story. The SQL reality is ephemeral-shaped: the data disappears but the telemetry never does, and the population behind every ratio must be stated before it's believed.",
    "The data org runs three engines. Session telemetry folds the event log — **251 in-session event batches** against **103 open sessions** from **16 daily-active Snapchatters** on the audit db, running 2024-01 through 2025-02 — into the boards the camera team reads every morning. Retention analytics runs the streak math: gaps between consecutive opens, the alive share, the cold tail — LAG over each user's session partition, with the first open's NULL gap treated as a *no previous session* state, not zero days. And monetization reads premium & ads billing, where amounts are INTEGER cents and `amount_cents / 100.0` at the display edge is house style.",
    "Interview screens are streak- and split-heavy. A typical loop opens with a fold (events per session, sessions per cohort), escalates into a **LAG/LEAD gap read** — days between a user's consecutive opens, the streak-alive share against a stated threshold — and lands on either a **CASE pivot** (camera vs chat per market, counts that must reconcile to 103) or a threshold subquery ('which users re-opened within a week?'). The follow-ups are definition probes: *per what?* — events or batches, sessions or users, calendar days or 24-hour gaps. Candidates who state the gap definition and keep the pivot's population unfiltered consistently outperform.",
    "Preparation strategy: Snapchat has **no tagged registry problems**, so this kit theme-curates all sixteen — streak canon (active-users, longest-winning-streak, fifteen-days-of-learning), the literal snaps-analysis census, pivot drills (reformat-department-table, sales-by-day-of-the-week) and retention windows (cohort-retention-matrix, week-over-week-churn). Then run both case studies on the live storefront db: one rebuilds the {violet:streak-gap audit} (LAG plus conditional fold, thresholds stated), the other rebuilds the {emerald:camera-vs-chat pivot} (CASE branches per market cohort). The storefront mapping is declared, not hidden — orders are open sessions, order totals are engagement units, regions are the four market cohorts — because making the stand-in explicit is itself the habit this screen rewards.",
  ],

  dayInLife: [
    "**08:20 —** The overnight streak board. The analyst opens retention's morning reads: opens per cohort, {emerald:streak-alive share}, and — the number that gates the day — the **streak-break queue**: which users' last open-to-now gap crossed the cold line overnight. The first query is a LAG walk over each user's session partition, gaps in julianday days, NULL on each user's first open kept and labeled. A spike in breaks is the day's first fire, and the analyst who can split NEW breaks from CHRONIC ones — before the retention lead pings — owns the morning.",
    "**10:30 —** Camera-vs-chat deep work. The camera team wants the **split pivot** rebuilt per market — 52 camera-sent against 30 chat-only sessions on the audit window, counts that must reconcile to 103 by construction; a lens partner wants event batches per session with the retry duplicates dropped (keep-latest, stated); platform wants the drafted-in-memory arm watched after the composer redesign. Each ask is a fold, a CASE branch and an argument about grain — events versus batches, sessions versus users. *A split without its population is just a pie chart of vibes.*",
    "**14:30 —** Lens-partner stakeholder cycles. The partner review: event batches per lens with plays separated from loads, the {sky:save-lag} read (**82 of 103 sessions carry a cloud-save stamp, 2.98 days average, 2–4 range** — the unstamped 21 are the drafted-plus-abandoned tail, reported as a state, never as zero), and the billing roll-up in honest dollars (`amount_cents / 100.0`, integer division banned). The afternoon's job is closing loops: yesterday's split shift becomes next week's composer A/B, and every number that leaves the desk carries its denominator with it.",
    "**17:00 —** The writeup ritual. The EOD note is one screen: which cohort's streaks cooled, which arm of the split moved, which threshold the alive-share used (≤ 7 days — stated, not implied). Query definitions get pinned beside the numbers they produced — retention re-runs them blind, so the SQL is the contract. The best-prepared candidate knows the rhythm: Snapchat SQL exists to defend **streak stories under ephemerality stress**, and the LAG gap walk plus the CASE pivot are the tools the defense is built with.",
  ],

  metrics: [
    { name: "Opens per user", what: "Open sessions per daily-active Snapchatter — 103 sessions across 16 users on the audit window. The frequency read streaks are built from, always cut by market cohort before it's believed." },
    { name: "Camera-vs-chat split", what: "Session outcomes in one pass: 52 camera-sent, 30 chat-or-story-only, 14 drafted, 7 abandoned (6.8%). The product's core behavior split — and the four cells must reconcile to 103." },
    { name: "Streak-alive share", what: "Consecutive-open gaps within the alive threshold (≤ 7 days) — 11 of 87 inter-session gaps on the audit db. The retention headline, computed over a stated gap definition." },
    { name: "Streak-cold tail", what: "Gaps at 30+ days — 36 of 87. The reactivation pipeline's source list, and the honest counterweight to the alive share." },
    { name: "Snaps per session", what: "Camera events folded per session from the 251 event batches — SUM(quantity), not COUNT(*), because batches carry retries. The engagement-depth read the camera team ships weekly." },
    { name: "Save-lag", what: "Open-to-cloud-save lag where stamped: 82 of 103 sessions, 2.98-day average, 2–4 range. The unstamped 21 are drafted-plus-abandoned — a state to report, not a zero to invent." },
    { name: "Lens play rate", what: "Lens plays over lens loads per session batch — a conditional ratio where the denominator is loads, stated first. The read that decides which partner lenses get shelf space." },
    { name: "Re-open window", what: "Share of users with two sessions inside 7 days — the habit gate behind streak retention, drilled with the two-purchases-within-seven-days shape and an EXISTS fold." },
  ],

  topics: [
    {
      name: "First opens & session counts",
      why: "Every streak starts with a first open, and every board starts with a count: sessions per user, first-session attribution, minutes spent per open. The curated trio drills the first-login fold, the distinct-viewer count and the duration roll-up that opens Snapchat's screens.",
      slugs: ["game-play-analysis-i", "article-views-i", "find-total-time-spent-by-each-employee"],
    },
    {
      name: "Split pivots (camera vs chat)",
      why: "The camera-vs-chat split is a pivot: one pass over sessions, one CASE branch per surface, per market cohort. These drills cover the column-pivot grammar — outcome per row, weekday per column, geography per row — that the split board and its calendar cousins are written in.",
      slugs: ["reformat-department-table", "sales-by-day-of-the-week", "rearrange-products-table"],
    },
    {
      name: "Consistency windows",
      why: "A streak is behavior, not a count: users who send the same volume at the same hours, users whose patterns persist across weeks. The curated trio drills the consistent-user read, the persistent-pattern scan and the last-surface-per-user fold that streak analytics runs on.",
      slugs: ["find-emotionally-consistent-users", "find-users-with-persistent-behavior-patterns", "user-purchase-platform"],
    },
    {
      name: "LAG/LEAD gap math",
      why: "Streak gaps are window math: LAG over each user's partition, julianday deltas, the first open's NULL treated as no-previous-session. The curated trio covers the biggest-gap read, the second-day return and the day+1 comparison that streak survival hangs on.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "rising-temperature"],
    },
    {
      name: "Rolling actives & stickiness",
      why: "Retention boards run on rolling windows: 7-day actives, DAU/WAU stickiness, 30-day activity walls. These drills build the trailing-window grammar — rolling distinct counts, trailing frames, fixed 30-day filters — with the frame boundary as the usual trap.",
      slugs: ["rolling-7d-actives", "dau-wau-stickiness", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Cohort retention & churn",
      why: "Streak retention reads cohort-shaped: which signup month survives, how churn moves week over week, how new minus resurrect minus churn nets to growth. The curated trio is the retention canon — the cohort matrix, the LAG churn walk and the growth-accounting identity.",
      slugs: ["cohort-retention-matrix", "week-over-week-churn", "growth-accounting"],
    },
    {
      name: "Conditional counts (snaps census)",
      why: "The snaps census counts events by kind in one pass — plays, sends, drafts — and COUNT(CASE …) is the grammar. The literal snaps-analysis problem is this read; the trio adds the target-met conditional and the zero-available-copies gate that census reports lean on.",
      slugs: ["snaps-analysis", "number-of-employees-who-met-the-target", "find-books-with-no-available-copies"],
    },
    {
      name: "Re-open windows & golden hours",
      why: "'Did they come back within a week?' is a two-events-within-N-days question, and Snapchat asks it constantly — re-opens, confirmation loops, the golden-hour read that finds the session right after signup. The trio drills the 7-day pair scan, the golden-hour join and the confirmation-request cadence.",
      slugs: ["users-with-two-purchases-within-seven-days", "find-golden-hour-customers", "users-that-actively-request-confirmation-messages"],
    },
    {
      name: "Session histograms & buckets",
      why: "Opens-per-session distributions ship as bar charts: sessions bucketed by event count, spend by band, orders by interval. These drills cover the bucket grammar — CASE ladders, interval gates, histogram folds — where the bucket edge definitions are the whole audit.",
      slugs: ["create-a-session-bar-chart", "calculate-orders-within-each-interval", "spend-histogram"],
    },
    {
      name: "Ephemeral-data quality",
      why: "Ephemeral content means the evidence is gone but the telemetry must still reconcile: NULL stamps on unsaved sessions, missing attributes on legacy events, forward-fill gaps from dropped batches. The trio drills the fill, the missing-info join and the NULL/trim/length arms that keep the session log trustworthy.",
      slugs: ["change-null-values-in-a-table-to-the-previous-value", "employees-with-missing-information", "invalid-tweets-ii"],
    },
  ],

  theory: [
    {
      id: "snapchat-t1",
      q: "A lens-partner report joins open sessions to in-session event batches and reports engagement per session. What does the raw join do to the numbers, and what's the fold-then-join fix?",
      a: "The raw join fans out: 103 sessions meeting 251 event batches on the session key repeat every session-level column once per batch row — a session with four lens batches carries its engagement unit four times, and SUM(total) over the join overcounts by each session's own batch count. The fix is to fold first: GROUP BY session_id in a derived table with SUM(quantity) for events, one row per session, then join. Now the grain is sessions on both sides and every aggregate is honest; if the outer query still counts sessions, COUNT(DISTINCT session_id) is the seatbelt — but the seatbelt hides the fan-out instead of fixing it. The senior tell is naming the grain before writing the join: at Snapchat the question 'sessions or events?' is the interview's first turn, and it decides everything downstream.",
      tag: "joins",
    },
    {
      id: "snapchat-t2",
      q: "The streak board needs days between a user's consecutive opens. Walk the LAG shape — and what does the first open's NULL mean for the alive-share?",
      a: "LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) hangs the previous open beside each session; the gap is julianday(created_at) - julianday(prev_open), fractional days, and the partition's first row has nothing to look back at — prev is NULL. That NULL is information: it means no previous session, not a zero-day gap, and folding it with COALESCE(prev, created_at) would fabricate 87+16 fake zero-gaps and crush the average. The honest board filters WHERE prev IS NOT NULL for the gap stats (87 real gaps on the audit db) and reports the 16 first-opens as their own population. LEAD is the same walk pointed forward — next-open gaps — and mixing the two orientations on one board is how alive-shares silently become cold-tails. State the orientation and the threshold (≤ 7 days alive) next to every number the board prints.",
      tag: "windows",
    },
    {
      id: "snapchat-t3",
      q: "The camera-vs-chat census needs all four session outcomes with counts that reconcile to the population. Why conditional aggregates, and what does filtering the outcome in WHERE break?",
      a: "One pass, four branches: COUNT(CASE WHEN status = 'delivered' THEN 1 END) beside its siblings folds 52 camera-sent, 30 chat-only, 14 drafted, 7 abandoned from the same 103 rows — numerator and denominator from one population, so 52+30+14+7 = 103 is an identity the board checks before publishing. Put status = 'delivered' in WHERE and the denominator drifts to match the numerator: every kept branch now reads against 82, the shares inflate, and the reconciliation identity dies silently. The ELSE arm matters too — a NULL-ELSE merges drafted into abandoned, and the product team loses the composer-redesign signal exactly when it matters. Conditional aggregates keep the population whole and the definition printed; that discipline is the census.",
      tag: "aggregation",
    },
    {
      id: "snapchat-t4",
      q: "21 of 103 sessions carry no cloud-save stamp. How should the save-lag report treat them, and what does COALESCE(stamp, created_at) do?",
      a: "The unstamped 21 are the 14 drafted-in-memory plus 7 abandoned sessions — sessions that never saved, which is precisely the state the report exists to surface. The lag metric is julianday(stamp) - julianday(created_at) over the 82 stamped sessions only (2.98-day average, 2–4 range), with the stamped count printed beside the average so the denominator is visible. COALESCE(stamp, created_at) would fold every unsaved session into a zero-day save — the report now claims the abandoned tail saves instantly, and the 2.98 average collapses into a fiction. The policy: filter IS NOT NULL deliberately and say so, count the NULLs as their own arm, and never let a fallback invent a measurement. In an ephemeral product, *a missing stamp is the story; a coalesced one is the cover-up.*",
      tag: "nulls",
    },
    {
      id: "snapchat-t5",
      q: "A streak read filters to camera-sent sessions in WHERE, then computes LAG gaps. Why do the streaks lie — and where does the status filter belong?",
      a: "Windows run after WHERE. Filter to camera-sent sessions and each user's partition now contains only the surviving rows — the LAG chain bridges across the deleted chat-only sessions, so a user who opened daily but only camera-sent weekly reads as a 7-day streak of 1-day gaps. The gaps are computed over a population the filter silently rewrote, which is the most honest-looking lie in retention SQL. The fix depends on the question: if the streak definition is opens regardless of outcome, compute gaps first (CTE over all sessions), then classify; if the streak is genuinely camera-sent-only, the filter is the definition — but it must be stated, and the alive-share denominator becomes camera-sent sessions, not opens. At Snapchat the rule is spoken: *filter after the window, or filter as a stated definition — never as an accident of clause order.*",
      tag: "pipeline",
    },
    {
      id: "snapchat-t6",
      q: "'Which users re-opened within 7 days of a session?' — how does the threshold query work, and why is it a subquery shape rather than a plain filter?",
      a: "The condition is relational, not scalar: a user qualifies if ANY later session of theirs exists within the window — EXISTS (SELECT 1 FROM orders later WHERE later.customer_id = o.customer_id AND julianday(later.created_at) - julianday(o.created_at) BETWEEN 0 AND 7). A plain filter can't see another row; the correlated subquery can. The re-open share is then qualified users over all users — and the denominator choice (16 users here, or sessions) is the follow-up that separates candidates. The BETWEEN edges matter: 0 includes same-day re-opens, 7 is the window's closed end — off-by-one here moves users across the habit line silently. On this db the pair-count shape is exactly the users-with-two-purchases-within-seven-days drill, and the EXISTS form wins on readability and on short-circuiting at scale.",
      tag: "subqueries",
    },
    {
      id: "snapchat-t7",
      q: "Streak definitions: is a 'daily streak' calendar days or 24-hour gaps? How does the SQL differ, and why does the choice move the metric?",
      a: "Calendar-day streaks bucket by STRFTIME('%Y-%m-%d', created_at) and compare bucket equality or adjacency — an 23:50 open and a 00:10 open are consecutive days. 24-hour gaps compare julianday deltas ≤ 1 — the same two opens are a 20-minute gap, trivially alive. Same user, same opens, different streak: the definition IS the metric, which is why the board prints its definition next to the number. The month buckets run STRFTIME('%Y-%m') across 2024-01 through 2025-02 — 14 buckets, year included or two Februaries fold into one. The julianday form is the tool for gap magnitudes and the bucket form for streak ladders; the senior candidate states which one the product team means before writing either, because retro-fitting a definition after the dashboard ships is how two teams inherit two truths from one table.",
      tag: "dates",
    },
    {
      id: "snapchat-t8",
      q: "Client retries can ship the same event batch twice into the session log. How do you dedupe without losing real repeats?",
      a: "Dedupe on identity, not appearance: two batches are duplicates when user, session, event kind and timestamp agree — real repeats have distinct timestamps by definition. The keep-latest pattern is ROW_NUMBER() OVER (PARTITION BY session_id, event_type, ts ORDER BY ingested_at DESC) = 1 in a CTE, then filter to the survivor — the newest ingestion wins and the audit trail of duplicates stays queryable. A plain GROUP BY with MAX would silently pick arbitrary columns from different duplicate rows (Frankenstein rows), and DISTINCT on the whole row only works when every column truly matches. The census consequence: 251 raw batches on the audit db is the RETRY-INCLUSIVE count, so the events-per-session fold runs on the deduped set and states the pre-dedupe count beside it. *Deduplication is a definition before it is a query* — and at Snapchat the definition ships in the memo, not in folklore.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "snapchat-mcq-1",
      prompt: "The session-outcome census over 103 opens returns: 52 delivered, 30 shipped, 14 pending, 7 cancelled. In the declared mapping, how many sessions actually sent a snap from the camera?",
      choices: [
        "52",
        "82 — delivered plus shipped",
        "30",
        "7 — the rest were abandoned",
      ],
      answer: 0,
      why: "'delivered' is the camera-sent arm — 52 sessions captured and sent. 'shipped' is the chat-or-story-only arm, a different surface in the same census.",
      notes: [
        { choice: 1, why: "82 is the saved-session count (both ended arms) — a save-lag denominator, not a camera-sent count." },
        { choice: 2, why: "30 is chat/story-only — the camera-vs-chat split exists precisely because that arm didn't touch the capture button." },
        { choice: 3, why: "7 is the abandoned arm — the opposite outcome from sending." },
      ],
      difficulty: "easy",
    },
    {
      id: "snapchat-mcq-2",
      prompt: "The event log stores 251 BATCHES with quantity = events per batch. Which query returns total in-session events?",
      choices: [
        "SELECT COUNT(*) FROM order_items",
        "SELECT SUM(quantity) FROM order_items",
        "SELECT AVG(quantity) FROM order_items",
        "SELECT COUNT(DISTINCT quantity) FROM order_items",
      ],
      answer: 1,
      why: "SUM(quantity) folds per-batch counts into total events — the engagement volume. COUNT(*) is 251 batches, the retry-inclusive row count.",
      notes: [
        { choice: 0, why: "251 is the batch grain — the lens-play census needs events, and batches ≠ events the moment quantity > 1." },
        { choice: 2, why: "AVG gives batch richness (events per batch) — a different KPI the camera team also ships, but not volume." },
        { choice: 3, why: "DISTINCT quantity counts distinct VALUES — 1, 2, 3, 4 — not events." },
      ],
      difficulty: "easy",
    },
    {
      id: "snapchat-mcq-3",
      prompt: "The retention trend buckets sessions by month over 2024-01 through 2025-02. Which expression is calendar-safe?",
      choices: [
        "STRFTIME('%m', created_at)",
        "STRFTIME('%Y-%m', created_at)",
        "SUBSTR(created_at, 6, 2)",
        "created_at",
      ],
      answer: 1,
      why: "'%Y-%m' prints 14 distinct, chronologically-sortable buckets. Month-only variants fold February-2024 into February-2025 and destroy the year-over-year read.",
      notes: [
        { choice: 0, why: "'%m' drops the year — 12 buckets, two Februaries merged, the trend's spine broken." },
        { choice: 2, why: "SUBSTR(6,2) is the same month-only slice via string surgery — same fold, same loss." },
        { choice: 3, why: "The raw timestamp is day-grain — one bucket per day where the trend expects 14 months." },
      ],
      difficulty: "easy",
    },
    {
      id: "snapchat-mcq-4",
      prompt: "Streak-gap SQL: LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at). For which row is prev_open NULL?",
      choices: [
        "Every row — LAG needs an explicit frame",
        "Each user's first open — nothing precedes it in the partition",
        "Abandoned sessions only",
        "Only the log's globally earliest session",
      ],
      answer: 1,
      why: "LAG looks one row back within the partition; the first row of each user's partition has no previous — 16 such NULLs on this db, and they're reported as 'no previous session', not zero-day gaps.",
      notes: [
        { choice: 0, why: "LAG works with a bare OVER — only the partition's head row lacks a previous value." },
        { choice: 2, why: "Abandoned sessions still carry created_at — outcome never affects the window's input rows." },
        { choice: 3, why: "Every user's first open NULLs (16 rows), not just the log's earliest — partitions, not the table, define the window." },
      ],
      difficulty: "medium",
    },
    {
      id: "snapchat-mcq-5",
      prompt: "An analyst filters WHERE status = 'delivered' in a CTE, THEN computes LAG gaps per user in the outer query. What happened to the streaks?",
      choices: [
        "Nothing — filters commute with windows",
        "The LAG chains bridge across filtered-out sessions, so gaps skip the chat-only opens and streaks look longer/cleaner than reality",
        "The query errors — windows can't follow WHERE",
        "Only the first open per user is affected",
      ],
      answer: 1,
      why: "Windows run on the rows that survive WHERE: the deleted chat-only sessions vanish from each partition and LAG bridges straight across them — a daily opener who chats most days reads as a clean camera-only streak.",
      notes: [
        { choice: 0, why: "Clause order is the whole point — the window sees the filtered set, and the filter rewrote each user's timeline." },
        { choice: 2, why: "It compiles and runs — that's exactly why it ships. The lie is silent, not syntactic." },
        { choice: 3, why: "Every gap in the partition changes, not just the head — each surviving row's 'previous' may now be days further back." },
      ],
      difficulty: "medium",
    },
    {
      id: "snapchat-mcq-6",
      prompt: "The split pivot groups sessions by market cohort with one CASE branch per outcome. What guarantees EU's four cells (24, 12, 6, 3) reconcile to the census?",
      choices: [
        "ORDER BY inside each branch",
        "All branches fold the same unfiltered rows — counts from one population sum to its COUNT(*)",
        "Adding DISTINCT to each COUNT",
        "The pivot's column order",
      ],
      answer: 1,
      why: "Conditional counts over the same GROUP BY population are additive by construction: 24+12+6+3 = 45, EU's total sessions. The reconciliation identity is the pivot's built-in audit.",
      notes: [
        { choice: 0, why: "ORDER BY arranges display, not arithmetic — reconciliation comes from shared population, not sort order." },
        { choice: 2, why: "DISTINCT would UNDERCOUNT users with multiple same-outcome sessions — the cells would stop summing to the population." },
        { choice: 3, why: "Column order is cosmetic — the identity lives in the shared fold, and it survives any column permutation." },
      ],
      difficulty: "medium",
    },
    {
      id: "snapchat-mcq-7",
      prompt: "A gap read computes JULIANDAY(created_at) - JULIANDAY(prev_open) = 0.5 days. A teammate's version computes created_at - prev_open (bare strings). What does the teammate's version return?",
      choices: [
        "0.5 — same thing",
        "0 — SQLite subtracts the string prefixes and both start with the same date",
        "12 — hours as text",
        "NULL — strings can't subtract",
      ],
      answer: 1,
      why: "Bare string subtraction isn't date math: SQLite coerces the text to numbers and both timestamps start with the same '2024-…' prefix, so the difference collapses to 0. julianday() is the function that makes gaps real.",
      notes: [
        { choice: 0, why: "Only the julianday form measures elapsed time — the string form isn't parsing timestamps, it's subtracting coerced numerics." },
        { choice: 2, why: "There's no unit magic in string subtraction — it returns a numeric 0 here, not hours." },
        { choice: 3, why: "SQLite happily coerces text to number — the danger is that it succeeds and returns a confident, wrong 0." },
      ],
      difficulty: "medium",
    },
    {
      id: "snapchat-mcq-8",
      prompt: "Sessions (103) join event batches (251) on session id; the outer query counts sessions with COUNT(*). What does it actually count?",
      choices: [
        "103",
        "251 — the batch grain won",
        "354",
        "The distinct user count",
      ],
      answer: 1,
      why: "The one-to-many join fans every session out to its batches — COUNT(*) reads 251, the batch grain. Session counts need COUNT(DISTINCT session_id) or, better, a fold-then-join so the grain never leaves session level.",
      notes: [
        { choice: 0, why: "103 was true before the join; after a one-to-many fan-out the row count is the many side." },
        { choice: 2, why: "Joins don't add the two tables' counts — the fan-out replaces the base, it doesn't sum with it." },
        { choice: 3, why: "Users were never the grain of the joined rows — the count is batches wearing session clothing." },
      ],
      difficulty: "hard",
    },
    {
      id: "snapchat-mcq-9",
      prompt: "Two users each have a 5-open streak. One opened 5 consecutive CALENDAR days; the other opened 5 times within 5×24 HOURS but crossed midnight twice. One definition calls both streaks; what does the other say?",
      choices: [
        "Both definitions always agree",
        "The calendar-day definition breaks the midnight-crosser into non-adjacent buckets while the 24-hour one keeps it whole",
        "The 24-hour definition breaks the calendar streaker",
        "Streaks are counted in weeks, so both are 1",
      ],
      answer: 1,
      why: "Calendar-day streaks bucket by date and require adjacent buckets — a 23:50→00:10 pair sits in different buckets and can break the ladder even though the 24-hour gap read calls it one streak. The definition IS the metric; state it before the query.",
      notes: [
        { choice: 0, why: "They agree only when opens land mid-day — midnight-crossing patterns are exactly where the definitions diverge." },
        { choice: 2, why: "It's the reverse: five opens inside 120 hours always pass the 24-hour test; the calendar ladder is the stricter one across midnight." },
        { choice: 3, why: "Neither definition rounds to weeks — the divergence is daily-grain, and that's the grain the streak product lives on." },
      ],
      difficulty: "hard",
    },
    {
      id: "snapchat-mcq-10",
      prompt: "Premium billing stores amounts as INTEGER cents. Which expression prints a per-session billed average with 2 decimals?",
      choices: [
        "AVG(amount_cents)/100",
        "ROUND(AVG(amount_cents)/100.0, 2)",
        "ROUND(AVG(amount_cents), 2)",
        "CAST(AVG(amount_cents) AS TEXT)",
      ],
      answer: 1,
      why: "Divide by 100.0 for real division, then ROUND(…, 2) at the display edge. The pipeline keeps integer cents; only the print converts.",
      notes: [
        { choice: 0, why: "AVG of cents is REAL, so /100 divides a float here — but the pattern is fragile: the moment someone swaps AVG for integer SUM, /100 truncates every odd cent." },
        { choice: 2, why: "Rounding raw cents prints a figure 100× too large — the board would overstate billing by two orders of magnitude." },
        { choice: 3, why: "CAST to TEXT keeps raw cents with no decimal point — string money that downstream arithmetic can't use." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-snap-1",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The streak-gap audit",
      brief:
        "Retention memo, Monday: the streak board needs its gap math audited — for every pair of consecutive opens, how many days apart, what share stayed alive, what share went cold. The db mapping is declared: orders are open sessions, customers are Snapchatters, created_at is the open timestamp. Probed facts: **103 opens from 16 users across 2024-01 through 2025-02**; the definitions are fixed in the memo — gaps run in julianday days between a user's consecutive opens, each user's FIRST open carries no gap (NULL = no previous session, never zero), **alive = gap ≤ 7 days**, **cold = gap ≥ 30 days**. The board ships one row: total gaps, average gap to 2 decimals, alive count, cold count.",
      ask: "Return one row over consecutive-open gaps: total gap count, average gap in days (2 decimals), count of gaps ≤ 7 days, and count of gaps ≥ 30 days.",
      template:
        "WITH gaps AS (\n  SELECT customer_id,\n         created_at,\n         {1}(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) AS prev_open\n  FROM orders\n)\nSELECT COUNT(*) AS streak_gaps,\n       ROUND(AVG(JULIANDAY(created_at) - JULIANDAY(prev_open)), 2) AS avg_gap_days,\n       SUM(CASE WHEN JULIANDAY(created_at) - JULIANDAY(prev_open) <= {2} THEN 1 ELSE 0 END) AS streak_alive,\n       SUM(CASE WHEN JULIANDAY(created_at) - JULIANDAY(prev_open) >= {3} THEN 1 ELSE 0 END) AS streak_cold\nFROM gaps\nWHERE prev_open IS NOT NULL;",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the look-back window",
          why: "Streak gaps look BACK to the previous open: LAG hangs it beside each session. LEAD would point forward and flip every gap negative — alive and cold both read wrong while the query still runs, the most dangerous kind of wrong.",
        },
        {
          answer: "7",
          kind: "number",
          label: "the alive threshold",
          noVerify: true,
          why: "The memo fixes alive at ≤ 7 days — a weekly habit line. 14 would double the alive count by reading bi-weekly openers as streaks; the threshold is a definition, stated in the memo, not a measured figure.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the cold threshold",
          noVerify: true,
          why: "Cold starts at ≥ 30 days — the reactivation line. 60 would shrink the cold tail and hide exactly the users the winback team needs; the memo states it so the board can't drift.",
        },
      ],
      distractors: ["LEAD", "FIRST_VALUE", "14", "60"],
      walkthrough:
        "Streak math is partition math with a stated definition. The CTE walks each user's sessions in open order and LAG hangs the previous open beside each row; WHERE prev_open IS NOT NULL keeps only real gaps — 87 of them, because each of the 16 users' first opens correctly carries no gap. The julianday delta averages 41.54 days, the ≤ 7-day alive arm counts 11 gaps and the ≥ 30-day cold arm counts 36. LEAD flips the orientation: every gap goes negative and the arms invert (alive 87, cold 0) — a board that certifies a cold audience as a hot one; FIRST_VALUE anchors every row to the user's FIRST open (103 'gaps', average 159.17), inventing months of absence from the second session onward. 14 and 60 in the threshold slots move the alive/cold split (26 alive, or 16 cold) — thresholds are definitions, which is why both carry noVerify and the memo prints them.",
    },
    {
      id: "cs-snap-2",
      tier: "easy",
      topic: "s7",
      universe: "funnel",
      title: "The camera-vs-chat pivot",
      brief:
        "Product memo, redesign review: the camera-vs-chat split ships per market cohort — one pass over sessions, one CASE branch per outcome, counts that reconcile to the population by construction. The db mapping is declared: orders are open sessions, customers are Snapchatters, regions are the four market cohorts, and the status vocabulary maps {emerald:delivered} = snap captured & sent, {sky:shipped} = chat-or-story-only, {violet:pending} = drafted in memory, {rose:cancelled} = abandoned. Probed facts: **103 sessions** split **52 / 30 / 14 / 7**, and the biggest cohort shows **24 camera-sent against 12 chat-only**, with the smallest running **2 and zero** — the split the redesign review is arguing about. Unfiltered population, deterministic read order: camera-sent leaders on top.",
      ask: "Return each market cohort with four outcome counts — camera-sent, chat-only, drafted, dropped — biggest camera-sent cohort first.",
      template:
        "SELECT c.region,\n       COUNT(CASE WHEN o.status = {1} THEN 1 END) AS camera_sent,\n       COUNT(CASE WHEN o.status = {2} THEN 1 END) AS chat_only,\n       COUNT(CASE WHEN o.status = {3} THEN 1 END) AS drafted,\n       COUNT(CASE WHEN o.status = {4} THEN 1 END) AS dropped\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY camera_sent DESC;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the camera-sent flag",
          why: "delivered is the session vocabulary for a snap captured and sent — 52 overall, 24 in the biggest cohort. 'paid' belongs to the billing tables' state space and folds the branch to silent zeros.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the chat-only flag",
          why: "shipped marks chat-or-story sessions — 30 overall, and the US cohort's 10 against 5 camera-sent is the split's real story. 'void' is billing vocabulary; crossing it zeroes the arm invisibly.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the drafted flag",
          why: "pending is the drafted-in-memory arm — 14 sessions the composer team watches. 'refunded' isn't a session state; the branch would read zero and the redesign review would lose its leading indicator.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the dropped flag",
          why: "cancelled closes the census at 7 — and 24+12+6+3 = 45 reconciles the biggest cohort against its COUNT(*). Any foreign literal breaks that identity, which is the audit the review runs first.",
        },
      ],
      distractors: ["'paid'", "'void'", "'refunded'"],
      walkthrough:
        "One scan, four branches, one population. The join attaches each session to its market cohort, GROUP BY folds the four cohorts, and each COUNT(CASE …) branch counts its outcome from the SAME rows — so every cohort's four cells sum to its session total: EU 24+12+6+3 = 45, APAC 21+8+5+3 = 37, US 5+10+3+1 = 19, LATAM 2+0+0+0 = 2, and the whole board reconciles to 103. ORDER BY camera_sent DESC reads EU first, LATAM last — deterministic, no ties. The distractors are all vocabulary crossings from the billing tables — 'paid', 'void', 'refunded' are not session states — and each one folds its branch to a column of silent zeros while the query runs clean, which is exactly the failure the reconciliation identity exists to catch. No WHERE filter on status anywhere: filtering the outcome first would shrink the population and kill every cohort's reconciliation.",
    },
  ],

  problems: [
    { slug: "snaps-analysis", why: "The literal Snapchat census: conditional COUNT DISTINCT over snap events by kind — the one-pass event-census grammar the camera team's dashboards are written in." },
    { slug: "create-a-session-bar-chart", why: "Sessions bucketed into a bar chart — the opens-per-session histogram the retention review ships, with bucket edges as the stated definition." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Two events inside a 7-day window — the re-open habit gate: which users came back fast enough for a streak to form." },
    { slug: "second-day-confirmation", why: "Second-day return — the D2 read that decides whether a first open became a habit, LEAD over the user's own timeline." },
    { slug: "cohort-retention-matrix", why: "The cohort retention matrix — which signup month keeps its openers, the board the streak-alive share feeds." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU stickiness — is the audience a habit or a rotation, computed with honest weekly denominators." },
    { slug: "rolling-7d-actives", why: "Rolling 7-day actives — the trailing-window trend line retention reads instead of single-day spikes." },
    { slug: "biggest-window-between-events", why: "The biggest gap between a user's events — the streak-break finder, LEAD over each partition with the max silence named." },
    { slug: "reformat-department-table", why: "Column pivots from row outcomes — the camera-vs-chat split's exact shape: one row per cohort, one CASE branch per surface." },
    { slug: "sales-by-day-of-the-week", why: "Weekday pivots — which days the app opens spike, the calendar split that decides when streak alarms fire." },
    { slug: "find-emotionally-consistent-users", why: "Consistent-behavior users — senders whose volume holds steady week over week, the quality read behind streak integrity." },
    { slug: "user-purchase-platform", why: "Last surface per user — camera or chat or story, the most recent arm each user's sessions ran on, deduped honestly." },
    { slug: "fifteen-days-of-learning", why: "The 15-day activity wall — a long-horizon streak audit: who opened day after day, and when the ladder broke." },
    { slug: "longest-winning-streak", why: "Longest streak via gaps-and-islands — the canonical consecutive-days read the streak board's headline number hangs on." },
    { slug: "week-over-week-churn", why: "Week-over-week churn via LAG — the cold-tail trend: how the ≥ 30-day gap population moves week to week." },
    { slug: "game-play-analysis-ii", why: "Join-back to the next event — what a user did immediately after their first open, the follow-through read acquisition teams live by." },
  ],
};
