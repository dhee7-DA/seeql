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

// 3x EXPANSION (task 94-snapchat, append-only): brief 4→6, dayInLife 4→5,
// metrics 8→12, topics 10→15, theory 8→24, mcqs 10→30, cases 2→6, problems
// 16→32. Snapchat still carries 0 tagged registry problems — the 31 new
// slugs (15 topic + 16 problem) are theme-curated from company-pools.md's
// SQL theme menu like the originals, disjoint from every slug below. New
// cases cs-snapchat-3..6 run on db/custom.db; every number slot and every
// distractor×slot substitution was probed read-only before authoring.

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
    "Preparation strategy: Snapchat has **no tagged registry problems**, so this kit theme-curates all thirty-two — streak canon (active-users, longest-winning-streak, fifteen-days-of-learning), the literal snaps-analysis census, pivot drills (reformat-department-table, sales-by-day-of-the-week) and retention windows (cohort-retention-matrix, week-over-week-churn). Then run all six case studies on the live storefront db — built for spaced practice rather than one sitting: one rebuilds the {violet:streak-gap audit} (LAG plus conditional fold, thresholds stated), another rebuilds the {emerald:camera-vs-chat pivot} (CASE branches per market cohort). The storefront mapping is declared, not hidden — orders are open sessions, order totals are engagement units, regions are the four market cohorts — because making the stand-in explicit is itself the habit this screen rewards.",
    "The billing desk is where the cents discipline earns its keep. Premium & ads billing keeps an INTEGER-cents ledger — `amount_cents / 100.0` at the display edge, never integer division — over an invoice state space of **6 open / 21 paid / 1 void** (19,609.00 / 66,443.00 / 925.00). The coverage ladder is the desk's own audit: 21 exact settlements for 65,612.00, one {amber:partial} at 4,000-of-6,148, and **6 no-payment invoices for 15,217.00** — the AR block, whose APAC row is invoice #28, status 'paid' with zero payment rows behind it. Settlement runs 28.4 days average (13–84) against flat 30-day terms, and the reconciliation table flags #11 void-but-paid (925.00) beside #28 — two rows that break the naive status join. Partner economics fold the same way: Nordic Gadgets AB at 32% and Midwest Hardware Co at 26.7% hold ~59% of play-credit revenue across 6 lens partners, while infra burn peaks at 3,210.00 in 2024-08 under a 14-entry / 16,800.00 Rent line — and the ledger ties at **181,080 / 181,080 / 0**, the zero-delta identity every close re-asserts before anything ships.",
    "Preparation roadmap: a {violet:four-week arc} with gates. Week 1 — folds and pivots until the camera-vs-chat census and the **reconcile-to-103 identity** are reflexes (conditional counts, CASE pivots, cents discipline). Week 2 — the streak canon: LAG gap walks, the first-open NULL as a state, alive/cold thresholds printed beside every number, gaps-and-islands for consecutive-day ladders. Week 3 — set-op stacks (UNION ALL banners, EXCEPT direction, INTERSECT dedupe), argmax/latest-state reads and rank-after-fold boards. Week 4 — the billing desk: rail stacks with TOTAL cross-foots, the coverage ladder, the #11/#28 anomalies, and all six case studies rebuilt cold under time. *Gate on definitions, not recall*: if you cannot say what a denominator counts, the query is not done — and that gate, run against every board you build, is the difference this screen is buying.",
  ],

  dayInLife: [
    "**08:20 —** The overnight streak board. The analyst opens retention's morning reads: opens per cohort, {emerald:streak-alive share}, and — the number that gates the day — the **streak-break queue**: which users' last open-to-now gap crossed the cold line overnight. The first query is a LAG walk over each user's session partition, gaps in julianday days, NULL on each user's first open kept and labeled. A spike in breaks is the day's first fire, and the analyst who can split NEW breaks from CHRONIC ones — before the retention lead pings — owns the morning.",
    "**10:30 —** Camera-vs-chat deep work. The camera team wants the **split pivot** rebuilt per market — 52 camera-sent against 30 chat-only sessions on the audit window, counts that must reconcile to 103 by construction; a lens partner wants event batches per session with the retry duplicates dropped (keep-latest, stated); platform wants the drafted-in-memory arm watched after the composer redesign. Each ask is a fold, a CASE branch and an argument about grain — events versus batches, sessions versus users. *A split without its population is just a pie chart of vibes.*",
    "**14:30 —** Lens-partner stakeholder cycles. The partner review: event batches per lens with plays separated from loads, the {sky:save-lag} read (**82 of 103 sessions carry a cloud-save stamp, 2.98 days average, 2–4 range** — the unstamped 21 are the drafted-plus-abandoned tail, reported as a state, never as zero), and the billing roll-up in honest dollars (`amount_cents / 100.0`, integer division banned). The afternoon's job is closing loops: yesterday's split shift becomes next week's composer A/B, and every number that leaves the desk carries its denominator with it.",
    "**17:00 —** The writeup ritual. The EOD note is one screen: which cohort's streaks cooled, which arm of the split moved, which threshold the alive-share used (≤ 7 days — stated, not implied). Query definitions get pinned beside the numbers they produced — retention re-runs them blind, so the SQL is the contract. The best-prepared candidate knows the rhythm: Snapchat SQL exists to defend **streak stories under ephemerality stress**, and the LAG gap walk plus the CASE pivot are the tools the defense is built with.",
    "**19:40 —** The month-end reconciliation sweep, after hours. The close owns the night: the {sky:rail stack} runs first — card 16 / 37,364.00, wire 11 / 32,248.00, and the UNION ALL banner cross-footing to **27 settlements / 69,612.00** — then the ledger tie re-asserts **181,080 debits / 181,080 credits / delta 0** before anything ships. The sweep's flag list is short and sharp: invoice #11 void-but-paid at 925.00, invoice #28 paid with zero settlement legs at 1,756.00, the one {amber:partial} coverage row at 4,000-of-6,148. GROUP_CONCAT folds each cohort's unpaid invoice ids into one manifest string — EU's four ids on a single line — because the AR chase reads manifests, not result grids. *A close that can't print its own cross-foot is a close someone else will have to reopen.*",
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
    { name: "Partner concentration", what: "Play-credit revenue share by lens partner — Nordic Gadgets AB at 32% and Midwest Hardware Co at 26.7% hold ~59% of the book across 6 partners. The dependency read that decides which partner relationships get engineering time." },
    { name: "Billing rail mix", what: "Premium & ads settlements by rail: card 16 / 37,364.00 against wire 11 / 32,248.00, cross-footing to 27 / 69,612.00. The month-close stack — a UNION ALL with a TOTAL banner that must reconcile to its own rails." },
    { name: "Settlement coverage", what: "The per-invoice coverage ladder: 21 exact for 65,612.00, 1 partial at 4,000-of-6,148, 6 no-payment for 15,217.00. The AR worklist, and the honest counterweight to booked revenue." },
    { name: "Infra burn & peaks", what: "Monthly infra spend with Rent at 14 entries / 16,800.00 and the 2024-08 peak of 3,210.00 — read against the ledger tie 181,080/181,080/0 that certifies the close. Burn without the tie is just a spreadsheet." },
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
      slugs: ["biggest-window-between-events", "second-day-confirmation", "rising-temperature", "longest-winning-streak", "game-play-analysis-ii", "report-contiguous-dates", "find-the-start-and-end-number-of-continuous-ranges", "game-play-analysis-v", "the-latest-login-in-2020", "maximum-transaction-each-day", "top-travellers", "last-person-to-fit-in-the-bus"],
    },
    {
      name: "Rolling actives & stickiness",
      why: "Retention boards run on rolling windows: 7-day actives, DAU/WAU stickiness, 30-day activity walls. These drills build the trailing-window grammar — rolling distinct counts, trailing frames, fixed 30-day filters — with the frame boundary as the usual trap.",
      slugs: ["rolling-7d-actives", "dau-wau-stickiness", "user-activity-for-the-past-30-days-ii", "fifteen-days-of-learning", "sessionize-events", "active-users", "ad-free-sessions"],
    },
    {
      name: "Cohort retention & churn",
      why: "Streak retention reads cohort-shaped: which signup month survives, how churn moves week over week, how new minus resurrect minus churn nets to growth. The curated trio is the retention canon — the cohort matrix, the LAG churn walk and the growth-accounting identity.",
      slugs: ["cohort-retention-matrix", "week-over-week-churn", "growth-accounting", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Conditional counts (snaps census)",
      why: "The snaps census counts events by kind in one pass — plays, sends, drafts — and COUNT(CASE …) is the grammar. The literal snaps-analysis problem is this read; the trio adds the target-met conditional and the zero-available-copies gate that census reports lean on.",
      slugs: ["snaps-analysis", "number-of-employees-who-met-the-target", "find-books-with-no-available-copies", "customer-order-frequency", "confirmation-rate"],
    },
    {
      name: "Re-open windows & golden hours",
      why: "'Did they come back within a week?' is a two-events-within-N-days question, and Snapchat asks it constantly — re-opens, confirmation loops, the golden-hour read that finds the session right after signup. The trio drills the 7-day pair scan, the golden-hour join and the confirmation-request cadence.",
      slugs: ["users-with-two-purchases-within-seven-days", "find-golden-hour-customers", "users-that-actively-request-confirmation-messages", "game-play-analysis-iv", "find-followers-count"],
    },
    {
      name: "Session histograms & buckets",
      why: "Opens-per-session distributions ship as bar charts: sessions bucketed by event count, spend by band, orders by interval. These drills cover the bucket grammar — CASE ladders, interval gates, histogram folds — where the bucket edge definitions are the whole audit.",
      slugs: ["create-a-session-bar-chart", "calculate-orders-within-each-interval", "spend-histogram", "game-play-analysis-iii"],
    },
    {
      name: "Ephemeral-data quality",
      why: "Ephemeral content means the evidence is gone but the telemetry must still reconcile: NULL stamps on unsaved sessions, missing attributes on legacy events, forward-fill gaps from dropped batches. The trio drills the fill, the missing-info join and the NULL/trim/length arms that keep the session log trustworthy.",
      slugs: ["change-null-values-in-a-table-to-the-previous-value", "employees-with-missing-information", "invalid-tweets-ii"],
    },
    {
      name: "Set-op stacks (sent vs received)",
      why: "Ephemeral messaging lives on paired flows — sessions sent against sessions received, camera arms against chat arms — and the set-op stack is how one query reports both sides plus a banner. The trio drills UNION ALL with state labels, the zero-rows arm that must still print, and the out-vs-in flow counts a rail stack or TOTAL banner is written in.",
      slugs: ["monthly-transactions-ii", "count-salary-categories", "the-airport-with-the-most-flights"],
    },
    {
      name: "Latest-state & argmax reads",
      why: "An app that deletes content leans on latest-state reads: the most-used surface per user, the most recent session per lens, the longest stretch in the log. The trio covers per-group argmax via window or self-join, the latest-row-per-key fold and the longest-duration scan the surface boards run on.",
      slugs: ["most-frequently-ordered-product-per-customer", "the-most-recent-orders-for-each-product", "find-longest-calls"],
    },
    {
      name: "Billing rails & cents discipline",
      why: "Premium & ads billing is INTEGER cents — every display is amount_cents / 100.0, and every close cross-foots rails against a TOTAL banner. The trio drills the monthly cents fold with cancelled arms kept visible, the two-sided account summary and the rich-band count billing categorizations lean on.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "number-of-rich-customers"],
    },
    {
      name: "Manifest folds (GROUP_CONCAT)",
      why: "The AR chase and the partner review read manifests, not grids: one line per cohort with the ids folded into a comma string, one line per day with the session inventory listed. The trio drills the GROUP_CONCAT manifest, the grouped city/state rollup and the per-month distinct census those strings are built from.",
      slugs: ["group-sold-products-by-the-date", "find-cities-in-each-state", "unique-orders-and-customers-per-month"],
    },
    {
      name: "Rank-after-fold boards",
      why: "Leader boards rank folds, not raw rows: engagement per user first, RANK over the fold second — and filtering on rank needs its own staging step. The trio drills the rank-with-ties ladder, the top-N-by-value scan and the most-sessions-per-user read boards ship as a ranked five.",
      slugs: ["rank-scores", "top-earners", "customer-placing-the-largest-number-of-orders"],
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
    {
      id: "snapchat-t9",
      q: "The streak board's running total double-counts when two sessions land on the same gap value. ROWS or RANGE — and what is each frame actually doing?",
      a: "ROWS is physical: the frame counts rows. RANGE is logical: the frame includes PEERS — every row the ORDER BY key ties with — so on tied gaps a running SUM doubles without a single row being misread. The board's running engagement went from plausible to inflated the day two same-gap sessions entered a RANGE frame, and nothing in the query text announces it. ROWS BETWEEN is the fix for row-precise running math; RANGE is the deliberate choice only when tie-sharing IS the definition. The senior tell is asking whether the board's ties are real populations or sort accidents: on this db 16 users carry 16 distinct engagement totals, so the trap is invisible until the day the data grows a tie — which is precisely the day the board is wrong in front of the whole retention team.",
      tag: "windows",
    },
    {
      id: "snapchat-t10",
      q: "The settlement stack needs card, wire and a TOTAL banner in one result. Why UNION ALL and not UNION — and what does the banner arm have to repeat?",
      a: "UNION ALL is a stack; UNION is a stack plus a dedupe pass that sorts and collapses coinciding rows — and a rail row that happened to equal the TOTAL row (a single-settlement rail, say) would silently vanish from the report. The banner arm must repeat the full fold: COUNT(*) and SUM(amount_cents) / 100.0 re-computed over the whole table, same column count, same alias shape — the two arms are a contract, and a banner that rounds or divides differently from its rails is a reconciliation that cannot reconcile. The cross-foot is the audit the close runs first: card 37,364.00 + wire 32,248.00 = 69,612.00, printed by the query itself. If the two arms ever disagree, the stack is lying about one of them — and at month-end that disagreement is the finding, not a bug to patch quietly.",
      tag: "set-ops",
    },
    {
      id: "snapchat-t11",
      q: "A single engagement figure per user is needed inside a per-session query. Scalar subquery, derived table, or join — how do you choose?",
      a: "Read the grain. A scalar subquery executes per outer row and must return ONE value — right for a constant-like reference (the global average session, the top user's engagement) and dangerous when the inner query could return a row per group, because SQLite picks one arbitrarily instead of erroring. A derived table or CTE folds first and joins at the fold's grain — right when the figure varies by group. A raw-table join is right only when the fold has already happened; unjoined aggregates fan out. The Snapchat rule: sessions-to-users reads go through a fold-then-join CTE, global references ride a scalar, and anything in between gets its grain stated in a comment — because 'it happened to return one row' is luck, not design, and luck does not survive the next seed refresh.",
      tag: "subqueries",
    },
    {
      id: "snapchat-t12",
      q: "A teammate's 'invoices with no settlement' sweep uses WHERE id NOT IN (SELECT invoice_id FROM payments) and returns empty on a db that visibly has six unsettled invoices. What happened?",
      a: "The invoice_id list contains a NULL, and NOT IN against a list containing NULL is defined to return nothing: x NOT IN (1, 2, NULL) can never be proven true, because x <> NULL is UNKNOWN, not false. One NULL reference row silently deletes the entire result set — the most confident wrong answer in the building. The fixes, in order of honesty: NOT EXISTS (NULL-safe and short-circuits), a LEFT JOIN ... IS NULL anti-join, or filtering NULLs out of the subquery only if the business says a NULL reference means 'nothing here'. On this db the no-payment invoice set is 6 rows totaling 15,217.00 — and the NOT IN version of that sweep returns zero rows, which reads as 'no exposure' and ends the AR chase before it starts. Never ship NOT IN on a nullable column.",
      tag: "nulls",
    },
    {
      id: "snapchat-t13",
      q: "A streak report needs gaps, then classifications, then a fold per user. One query or staged CTEs — and what does staging buy?",
      a: "Stage it. A gaps CTE (LAG walk, prev_open kept NULL-labeled), a classify CTE (alive / cold / first-open arms from the gap), a fold CTE (per-user counts), then the final SELECT — each step one definition, each name auditable, each intermediate re-runnable when a board number gets challenged. One mega-query computes the same rows and hides every definition inside nested parentheses where nobody can pin what the alive threshold meant when the retention lead asks. Staging also de-duplicates logic: the gap expression written once in the gaps CTE is referenced three times instead of pasted three times and drifting into three definitions. The Snapchat discipline: ephemeral content means the query IS the record — and a record you can read step by step is the only kind that survives an audit of a product that deletes its own evidence.",
      tag: "pipeline",
    },
    {
      id: "snapchat-t14",
      q: "The AR chase wants one manifest line per cohort — all unpaid invoice ids in a single string. How does GROUP_CONCAT behave, and where does it lie?",
      a: "GROUP_CONCAT(x) folds a group's values into one comma-separated string — default separator ',', no spaces, and order NOT guaranteed without an ORDER BY inside the aggregate or a deterministic pre-sort of the input. Where it lies: fan-out. Run it after a join that multiplies rows and each id repeats once per joined row — the manifest reads 18,18,21,21,24... and the chase calls six invoices eighteen. The manifest is a fold like any other: dedupe first (DISTINCT inside the aggregate or a staged CTE), then concatenate. And print the count beside the string — GROUP_CONCAT has no length guard, so a truncated manifest dies quietly downstream. On this db the six unpaid ids 18/21/24/26/27/28 fold into one honest line per cohort, count 6, total 15,217.00 — string and number agree, which is the manifest's whole job.",
      tag: "aggregation",
    },
    {
      id: "snapchat-t15",
      q: "Events per session is 251 batches over 103 sessions — but the board prints 2. Walk the type-promotion bug and the house rule that prevents it.",
      a: "251 / 103 in SQLite is INTEGER division: both operands are integers, so the answer truncates to 2 — two full batches per session, which understates a 2.44 fan-out enough to hide a fifth of the event volume. The fix is promotion before the divide: 251.0 / 103 or CAST(x AS REAL), printed as ROUND(..., 2) = 2.44. The house rule is mechanical, not stylistic: any division where the numerator is a COUNT or SUM of integer columns gets an explicit real promotion — 100.0 for cents, 1.0 for ratios — because the moment one operand is REAL, SQLite divides really. The bug ships clean, passes review, and only shows up when someone multiplies the printed average back by 103 and gets 206 events from a 251-batch log. Type promotion is a data-quality policy, not a formatting preference.",
      tag: "types",
    },
    {
      id: "snapchat-t16",
      q: "A lens play rate divides plays by loads — and one session has zero loads. What does the raw division do, and what is the guard?",
      a: "Raw division by zero in SQLite does not error — it returns NULL — so the zero-load session vanishes from the ratio board without a trace, and the partner's average play rate floats up on a denominator that silently shrank. The guard is NULLIF: SUM(plays) * 1.0 / NULLIF(SUM(loads), 0) returns NULL when loads is zero, which keeps the session's state visible — NULL means 'no loads', not 0.0 rate — and lets the board coalesce to an explicit 'no loads yet' label. COALESCE(rate, 0) is the wrong reflex: a zero play rate reads as 'loads existed, nobody played', a different finding from 'no loads ever arrived'. The house pattern is three moves — NULLIF guards the denominator, 1.0 promotes the numerator to real division, and the board prints the no-loads count beside the average. Divide-by-zero is not an error to catch; it is a state to name.",
      tag: "nulls",
    },
    {
      id: "snapchat-t17",
      q: "The streak ladder needs consecutive CALENDAR days of opens, not gap magnitudes. How does the gaps-and-islands shape work over session dates?",
      a: "Flag the break, then group the unbroken runs. Bucket each open to its date (STRFTIME('%Y-%m-%d', created_at)), LAG the previous date per user, and set island_id = date minus ROW_NUMBER() over the user's open order — consecutive days share one island id because the date advances by exactly 1 while the row number advances by exactly 1 too. GROUP BY user, island_id then gives streak length per island, and MAX(length) is the headline. The definition edges are the audit: does day 1 reset after a missed day (yes), does the first open start an island (yes), do same-day re-opens extend or ignore (ignore — DISTINCT dates first). At Snapchat this shape is the streak canon — longest-winning-streak, fifteen-days-of-learning — and the wrong version, julianday deltas ≤ 1, answers a different question (24-hour gaps) that happens to agree most days and diverge exactly across midnight.",
      tag: "windows",
    },
    {
      id: "snapchat-t18",
      q: "A query filters WHERE engagement > 3000 on a SELECT that computes engagement as an alias — and errors. Why, and what are the two legal fixes?",
      a: "Because SELECT runs after WHERE. The logical evaluation order is FROM/JOIN, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — aliases born in SELECT do not exist yet when WHERE evaluates, so 'no such column: engagement' is the engine telling you the pipeline order out loud. Fix one: repeat the expression in WHERE (SUM(o.total) > 3000) — correct, duplicated, drifts when one copy changes. Fix two: stage the fold in a CTE and filter the staged column in the outer query — the Snapchat house style, because the CTE name documents the grain and the filter reads like the memo. The same order explains why aliases ARE legal in ORDER BY (SELECT already ran) and why a window function cannot be filtered in its own SELECT's WHERE. Clause order is not pedantry; it is the reason half of SQL's 'weird' errors happen.",
      tag: "pipeline",
    },
    {
      id: "snapchat-t19",
      q: "A review flags every SELECT DISTINCT in the session log as a smell. When is DISTINCT a dedupe and when is it a confession?",
      a: "DISTINCT is a dedupe when the grain is declared and duplicates are genuinely interchangeable: distinct lens ids in a partner manifest, distinct cohort names, distinct months on a trend axis. It is a confession when it papers over a fan-out — the analyst joined, the counts doubled, and DISTINCT made the number look right again without fixing the join. The tell is what disappears: DISTINCT on session ids after a batch join hides that 103 sessions became 251 rows; the right fix is fold-then-join, not dedupe-after-the-fact. The house rule: every DISTINCT ships with a comment naming the grain it protects, and any DISTINCT sitting between a JOIN and an aggregate gets interrogated first — on this db, COUNT(DISTINCT customer_id) = 16 after a fan-out is a seatbelt, while DISTINCT to rescue a SUM is a cover-up that the reconciliation identity will catch eventually.",
      tag: "quality",
    },
    {
      id: "snapchat-t20",
      q: "The re-engagement read needs each session's NEXT open, not its previous one. What changes when LAG becomes LEAD — and what does the last row of every partition carry?",
      a: "LEAD(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) hangs the next open beside each row; the gap is julianday(next) - julianday(current), and the walk's final row per partition — the user's most recent open — has nothing ahead, so next_open is NULL. That NULL is the freshest signal on the board: it is the open whose re-engagement is still pending, the cohort the winback team watches tonight. Folding it with COALESCE(next, created_at) fabricates zero-day re-engagements and declares every cold user hot; dropping the row hides exactly the tail the board exists for. The symmetric discipline from LAG applies unchanged: report the trailing NULLs as a state (16 users, 16 pending next-opens), keep orientation explicit — LAG looks back for streak survival, LEAD looks forward for re-engagement — and never mix the two on one column without renaming both.",
      tag: "windows",
    },
    {
      id: "snapchat-t21",
      q: "The leader board ranks users by lifetime engagement. Why must the rank run after the fold — and where does filtering on rank get staged?",
      a: "Rank the fold, not the raw log: SUM(o.total) per user in a staging CTE first, then RANK() OVER (ORDER BY engagement DESC) over the one-row-per-user result. Rank before the fold and each session competes against other sessions — the board ranks orders, and Alice's 24 sessions guarantee her twenty-four entries in the top ranks. Filtering on rank needs its own step, because a window function cannot sit in its own SELECT's WHERE: stage the rank in a CTE (ranked), then SELECT ... WHERE streak_rank <= 5 in the outer query. On this db the fold-then-rank board prints Alice Chen 7,262.35, Emma Wilson 6,640.56, Grace Kim 4,574.23, Maya Patel 3,644.56, Chloe Dubois 2,667.93 — five rows, one per user, each carrying its denominator. The two-step is not ceremony; it is the difference between a leader board and a session log wearing a crown.",
      tag: "aggregation",
    },
    {
      id: "snapchat-t22",
      q: "Event batches, sessions, users — three grains in one log. What keeps the joins honest when every table calls its key 'id'?",
      a: "Key hygiene: name the grain in every join and never let two tables' bare ids meet. order_items.order_id joins orders.id; orders.customer_id joins customers.id — and o.id = c.id is a join on integer coincidence that executes happily and destroys everything quietly, because both are just dense 1..N sequences. The house rules: qualify every column (oi.order_id, not order_id) so the join key's home table is visible in review; join on the relationship, not on matching value ranges; and treat any join between two surrogate keys as guilty until proven intentional. At Snapchat the event log's three grains are the whole interview — 'sessions or events?' is the first question — and the candidate who writes o.id = c.id under time pressure has just joined users to session serial numbers. The audit that catches it is embarrassingly simple: print COUNT(*) before and after every join, and demand the fan-out factor be named.",
      tag: "joins",
    },
    {
      id: "snapchat-t23",
      q: "The close ships a rail stack, a coverage ladder and a ledger tie. What makes a query self-auditing — and which identities does this db's close assert?",
      a: "A self-auditing query carries its own reconciliation: the identities are printed in the result, not checked by faith. The rail stack asserts card 16 / 37,364.00 + wire 11 / 32,248.00 = TOTAL 27 / 69,612.00 — the banner row IS the cross-foot, computed by the same query it audits. The coverage ladder asserts 21 exact / 1 partial / 6 none sums to the 28-invoice book, with the partial printed as 4,000-of-6,148 rather than rounded into the exact bucket. The ledger tie asserts debits 181,080 = credits 181,080, delta 0 — the zero that certifies everything else. The craft rule: every fold that ships with a total ships with the identity that makes the total checkable, and every population-splitting CASE board reconciles its arms to COUNT(*) — 52+30+14+7 = 103. If the query cannot print the identity, the report is asking the reader to trust arithmetic nobody ran.",
      tag: "quality",
    },
    {
      id: "snapchat-t24",
      q: "The streak board re-runs against a 100x session log and times out. What does the senior analyst reach for first — before indexes?",
      a: "Reduction before machinery. First cut the scan: the board only needs 2025 sessions? Filter to the window in a staging CTE before the window functions run — WHERE runs before SELECT, but a CTE filter runs before the whole walk. Second, kill re-computation: the gap expression written three times is computed three times; stage it once. Third, shrink the window's input: PARTITION BY customer_id with an ORDER BY on a narrow derived column beats partitioning raw text timestamps. Only then indexes: the covering index on (customer_id, created_at) turns the partition walk into a sorted scan, and it is worth exactly as much as the filter discipline that lets it be used — an index the WHERE clause cannot use is decoration. The instinct this screen rewards: at Snapchat scale the log grows every day while the boards shrink to windows, so the durable win is reading less data, not reading the same data faster.",
      tag: "performance",
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
    {
      id: "snapchat-mcq-11",
      prompt: "The settlement stack unions a TOTAL banner under the rail rows. Why UNION ALL rather than UNION?",
      choices: [
        "UNION would drop the TOTAL banner as a duplicate",
        "UNION ALL is a pure stack — no dedupe pass to collapse coinciding rows and no hidden sort",
        "UNION cannot reference the payments table twice",
        "They're identical here — UNION is just older syntax",
      ],
      answer: 1,
      why: "UNION dedupes and sorts the stacked result; UNION ALL appends verbatim. The banner must survive by construction, not by luck of differing from every rail row.",
      notes: [
        { choice: 0, why: "The TOTAL row (27 / 69,612.00) happens to differ from card and wire today, so UNION would keep it — the point is that survival should never depend on a coincidence of the data." },
        { choice: 2, why: "UNION unions the same table twice fine — the arms' shape contract, not the source, is the constraint." },
        { choice: 3, why: "The dedupe/sort pass is a real semantic and cost difference — a single-settlement rail that equals the banner would vanish under UNION." },
      ],
      difficulty: "easy",
    },
    {
      id: "snapchat-mcq-12",
      prompt: "GROUP_CONCAT(invoice_id) over a cohort's unpaid AR rows prints '18,21,24'. What does the two-argument form GROUP_CONCAT(invoice_id, '; ') change?",
      choices: [
        "Nothing — the second argument is ignored",
        "The separator becomes '; ' — '18; 21; 24' — the manifest's delimiter is a stated definition",
        "It concatenates only two rows max",
        "It returns a JSON array instead",
      ],
      answer: 1,
      why: "The second argument is the separator. Default is ',' with no space; '18; 21; 24' is the readable manifest the AR chase actually reads.",
      notes: [
        { choice: 0, why: "The separator argument is the whole feature — forgetting it exists is how manifests ship as unreadable comma walls." },
        { choice: 2, why: "GROUP_CONCAT folds every row of the group — arity of the call has nothing to do with row count." },
        { choice: 3, why: "It returns TEXT with the chosen delimiter — JSON grouping is a different function family entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "snapchat-mcq-13",
      prompt: "Sessions LEFT JOIN event batches, then COUNT(*) vs COUNT(oi.id). On 103 sessions with 251 batches, what does COUNT(*) return?",
      choices: [
        "103 — the LEFT JOIN preserves session grain",
        "251 — the join's row count, batches included",
        "354",
        "Depends on the WHERE clause only",
      ],
      answer: 1,
      why: "After a one-to-many LEFT JOIN the row grain is the many side: COUNT(*) reads 251. COUNT(*) still counts rows, not sessions — the LEFT JOIN's NULL-extended rows make the difference, not remove the fan-out.",
      notes: [
        { choice: 0, why: "LEFT JOIN preserves sessions only in the sense that unmatched sessions survive as one row each — matched sessions still fan out to their batches." },
        { choice: 2, why: "Joins multiply, they don't add — 103 + 251 is not what any join produces." },
        { choice: 3, why: "A WHERE on the right table can even kill the LEFT-ness entirely — but with no filter, the count is the fan-out: 251." },
      ],
      difficulty: "easy",
    },
    {
      id: "snapchat-mcq-14",
      prompt: "WHERE invoice_id NOT IN (SELECT ref_id FROM save_events) returns zero rows although the db has six unsettled invoices. The likeliest cause?",
      choices: [
        "The invoices table is empty",
        "save_events.ref_id contains at least one NULL — NOT IN against a NULL-containing list returns nothing",
        "NOT IN needs a JOIN to work",
        "The subquery needs DISTINCT",
      ],
      answer: 1,
      why: "x NOT IN (1, 2, NULL) can never be true — x <> NULL is UNKNOWN. One NULL in the subquery's list silently deletes the whole result set.",
      notes: [
        { choice: 0, why: "The sweep returned zero rows, not an error and not 'no data' — the invoices exist; the predicate, not the table, is broken." },
        { choice: 2, why: "NOT IN is a set-membership test — no join required. The NULL semantics, not syntax, are the trap." },
        { choice: 3, why: "DISTINCT changes performance, not NULL semantics — the list still contains NULL and still annihilates the predicate." },
      ],
      difficulty: "medium",
    },
    {
      id: "snapchat-mcq-15",
      prompt: "Set-op sweep: sessions_with_stamps EXCEPT sessions_without_stamps. A teammate swaps the arms. What changes?",
      choices: [
        "Nothing — EXCEPT is symmetric",
        "Everything — A EXCEPT B keeps rows in A absent from B; swapping returns the complement population",
        "Only the row order changes",
        "The query errors on the swapped arms",
      ],
      answer: 1,
      why: "EXCEPT is directional: stamped EXCEPT unstamped is the stamped-only population; swapped, it's the unstamped-only set. The save-lag board would silently become the abandoned-tail board.",
      notes: [
        { choice: 0, why: "INTERSECT is the symmetric one. EXCEPT direction is the whole meaning of the query." },
        { choice: 2, why: "EXCEPT also dedupes — but the headline failure is the population flip, which no ORDER BY describes." },
        { choice: 3, why: "Both arms select the same column shape either way — it compiles and runs, which is exactly why the swap ships." },
      ],
      difficulty: "medium",
    },
    {
      id: "snapchat-mcq-16",
      prompt: "A self-join pairs each user's sessions to hunt same-day re-opens. What does dropping the a.id < b.id guard do?",
      choices: [
        "Nothing — the pair logic still holds",
        "Every pair double-counts (A,B and B,A) and every row pairs with itself (A,A)",
        "The query errors — self-joins require the guard",
        "Only the first session per user is affected",
      ],
      answer: 1,
      why: "Without the ordering guard the self-join is symmetric noise: each unordered pair appears twice and each row pairs with itself. a.id < b.id keeps one representative per pair, self-pairs excluded.",
      notes: [
        { choice: 0, why: "The re-open count roughly doubles and gains false 'pairs' — the habit gate reads wrong while the query runs clean." },
        { choice: 2, why: "Self-joins are plain joins — the guard is a correctness convention, not a syntax requirement." },
        { choice: 3, why: "Every row of every user's partition is affected — the guard shapes the whole pair population." },
      ],
      difficulty: "medium",
    },
    {
      id: "snapchat-mcq-17",
      prompt: "A correlated scalar sits in the SELECT list: (SELECT AVG(total) FROM orders o2 WHERE o2.customer_id = o.customer_id). How often does it run?",
      choices: [
        "Once for the whole query",
        "Once per outer row — per session in the result",
        "Once per customer in the table",
        "Never — the planner inlines it into a join",
      ],
      answer: 1,
      why: "Correlated scalars re-execute for each outer row that references them — per session here. It's the right tool for a per-group reference in a row-shaped query, and the reason it can't be optimized like a join without rewriting.",
      notes: [
        { choice: 0, why: "That's the UNcorrelated scalar — a global constant like the all-users average. The correlation to o.customer_id makes it row-dependent." },
        { choice: 2, why: "The driving grain is the outer query's rows (sessions), not the customers table — a user with 24 sessions pays 24 evaluations." },
        { choice: 3, why: "Planners can sometimes cache, but the semantics are per-row — and reasoning 'the planner will fix it' is how per-row costs reach production." },
      ],
      difficulty: "medium",
    },
    {
      id: "snapchat-mcq-18",
      prompt: "Batches per session: SELECT COUNT(*) / (SELECT COUNT(*) FROM orders) with 251 and 103. What prints — and what should print?",
      choices: [
        "2.44 — and 2.44 is correct",
        "2 — integer division truncates; 251.0/103 or ROUND(...,2) prints the honest 2.44",
        "2.44 — and 2 is correct because sessions are the denominator",
        "0 — the subquery form is illegal",
      ],
      answer: 1,
      why: "COUNT(*) is an integer, so 251/103 is integer division: 2. The fan-out factor is 2.44 — promote before dividing (251.0, CAST, or *1.0) and round at the print edge.",
      notes: [
        { choice: 0, why: "2.44 is the honest figure but the query prints 2 — SQLite divides by operand types, not by intent." },
        { choice: 2, why: "The truncation isn't a rounding choice anyone made — it's type promotion, and it hides a fifth of the fan-out (0.44 batches/session)." },
        { choice: 3, why: "Scalar subqueries in expressions are perfectly legal — the query runs and prints a confident, wrong 2." },
      ],
      difficulty: "hard",
    },
    {
      id: "snapchat-mcq-19",
      prompt: "Running engagement per user: SUM(engagement) OVER (ORDER BY gap_days). Two sessions share a gap value and the running total jumps by both. Why?",
      choices: [
        "A join fan-out upstream duplicated rows",
        "The default frame is RANGE — peers (ties on the ORDER BY key) share the frame, so both rows' values enter together",
        "SUM over a window is nondeterministic",
        "The ORDER BY needs DESC",
      ],
      answer: 1,
      why: "Default window frames are RANGE UNBOUNDED PRECEDING TO CURRENT ROW — 'current row' includes PEERS. Tied ORDER BY keys move together; ROWS BETWEEN makes the frame row-physical.",
      notes: [
        { choice: 0, why: "Fan-out is the other classic double-count — but with ties on the ORDER BY key, RANGE alone reproduces the symptom with clean inputs." },
        { choice: 2, why: "Window sums are fully deterministic — the frame definition, not randomness, decides which rows enter." },
        { choice: 3, why: "Direction changes which rows precede; it does nothing about tie-sharing — that's ROWS vs RANGE, not ASC vs DESC." },
      ],
      difficulty: "hard",
    },
    {
      id: "snapchat-mcq-20",
      prompt: "A top-5 board does ORDER BY engagement LIMIT 5, and two users tie at the cut. What is guaranteed about which one ships?",
      choices: [
        "The user with the lower id",
        "Nothing — tie order is unspecified, so the cut can flip between runs",
        "Both users ship — LIMIT 5 keeps ties",
        "The query errors on the tie",
      ],
      answer: 1,
      why: "ORDER BY ties have no defined order; LIMIT then picks an arbitrary survivor. Deterministic cuts add a tiebreaker (engagement DESC, name) or use RANK() with an explicit tie policy.",
      notes: [
        { choice: 0, why: "Rowid order happens to be stable in tiny scans — which is exactly why the bug survives dev and flips in production." },
        { choice: 2, why: "LIMIT is a row cap, not a tie policy — WITH TIES is the (non-SQLite) construct, and SQLite's LIMIT keeps exactly 5 rows." },
        { choice: 3, why: "Ties are normal data — the query runs, and the nondeterminism is the failure." },
      ],
      difficulty: "hard",
    },
    {
      id: "snapchat-mcq-21",
      prompt: "SELECT region, SUM(total) AS eng FROM ... WHERE eng > 3000 — why does the engine reject it?",
      choices: [
        "Aggregates can't be compared to numbers",
        "WHERE runs before SELECT, so the alias eng doesn't exist yet — filter the expression or stage it in a CTE",
        "SUM needs a GROUP BY first",
        "Aliases are only legal in ORDER BY",
      ],
      answer: 1,
      why: "Logical evaluation order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. Aliases are born in SELECT — after WHERE. Repeat the expression or stage the fold.",
      notes: [
        { choice: 0, why: "SUM > 3000 is a fine comparison — the failure is naming, not the aggregate." },
        { choice: 2, why: "HAVING would need a GROUP BY — but the error here is the alias, and HAVING has its own timing rules." },
        { choice: 3, why: "Close but wrong: aliases ARE legal in ORDER BY (SELECT already ran) — the ban is on clauses that run BEFORE SELECT." },
      ],
      difficulty: "easy",
    },
    {
      id: "snapchat-mcq-22",
      prompt: "The buyer census folds COUNT(DISTINCT customer_id) per region: EU 8, APAC 5, US 2, LATAM 1. What must the four cells sum to?",
      choices: [
        "103 — sessions are the population",
        "16 — each of the 16 users opens in exactly one region, so distinct-user folds sum to the user count",
        "87 — the gap count",
        "Nothing — distinct counts never reconcile",
      ],
      answer: 1,
      why: "Region is a user attribute, so the partitions are disjoint over users: 8+5+2+1 = 16, the full user base. The reconciliation identity is what makes the census trustworthy.",
      notes: [
        { choice: 0, why: "103 is the session count — the right total for a session fold, not a distinct-user fold." },
        { choice: 2, why: "87 is inter-session gaps — a streak metric's denominator, unrelated to the buyer census." },
        { choice: 3, why: "Distinct counts reconcile exactly when the partition key is a user attribute — which is why the census ships the identity." },
      ],
      difficulty: "easy",
    },
    {
      id: "snapchat-mcq-23",
      prompt: "A set-op stack unions an arm selecting (method, COUNT(*), dollars) with an arm selecting (method, COUNT(*)). What happens?",
      choices: [
        "The missing column fills with NULL",
        "Column-count mismatch — the compound fails: both arms must select the same number of columns",
        "Only the first two columns survive",
        "The engine adds a third column of zeros",
      ],
      answer: 1,
      why: "UNION/UNION ALL/EXCEPT/INTERSECT are shape contracts: same column count, positionally aligned types. The banner arm repeats all three expressions, even when one is a literal.",
      notes: [
        { choice: 0, why: "That's OUTER JOIN behavior — set ops have no column-padding; they fail the contract outright." },
        { choice: 2, why: "There's no silent truncation — the compound statement errors before any row ships." },
        { choice: 3, why: "No engine-invented defaults — if the third slot is needed, the arm writes it ('TOTAL', COUNT(*), ROUND(SUM(amount_cents)/100.0, 2))." },
      ],
      difficulty: "easy",
    },
    {
      id: "snapchat-mcq-24",
      prompt: "WHERE RANK() OVER (ORDER BY engagement DESC) <= 5 — what does the engine say, and what's the fix?",
      choices: [
        "Runs fine — window functions are allowed in WHERE",
        "Window functions are banned in WHERE — stage the rank in a CTE (or derived table), filter in the outer query",
        "Runs but returns the bottom 5",
        "Needs DISTINCT to execute",
      ],
      answer: 1,
      why: "Windows evaluate after WHERE (with SELECT), so they can't be filtered at the same level. The two-step is the idiom: ranked CTE, then WHERE streak_rank <= 5 outside.",
      notes: [
        { choice: 0, why: "Every engine rejects this — it's clause order, not style. The error message names the rule." },
        { choice: 2, why: "Direction is irrelevant — the construct itself is illegal in WHERE." },
        { choice: 3, why: "DISTINCT dedupes rows; it cannot promote a window function into an earlier pipeline phase." },
      ],
      difficulty: "medium",
    },
    {
      id: "snapchat-mcq-25",
      prompt: "LEAD(created_at) OVER (PARTITION BY user ORDER BY created_at) on a user's 24 sessions — which row carries a NULL next_open?",
      choices: [
        "The first session",
        "The user's most recent (24th) session — nothing follows it",
        "All 24",
        "LEAD never returns NULL",
      ],
      answer: 1,
      why: "LEAD looks forward; the partition's last row has no next. That NULL is the pending-re-engagement tail — a state to report, never to coalesce into a fake zero-day gap.",
      notes: [
        { choice: 0, why: "The FIRST session's next_open is the second session — that's LAG's NULL edge, not LEAD's." },
        { choice: 2, why: "23 of 24 rows have a successor — only the tail row lacks one." },
        { choice: 3, why: "LEAD returns NULL exactly at the partition's forward edge — the edge NULL is the board's freshest signal." },
      ],
      difficulty: "medium",
    },
    {
      id: "snapchat-mcq-26",
      prompt: "Lens play rate = SUM(plays) / SUM(loads), and one session has zero loads. What does the guard look like?",
      choices: [
        "Add WHERE loads > 0",
        "SUM(plays) * 1.0 / NULLIF(SUM(loads), 0) — the zero-load session becomes an explicit NULL state, not a silent drop",
        "COALESCE(rate, 0) after the raw division",
        "CAST(plays AS REAL) alone fixes it",
      ],
      answer: 1,
      why: "NULLIF zeroes the denominator to NULL → NULL rate, keeping the state visible. The 1.0 promotion also prevents integer division when plays/loads are integers.",
      notes: [
        { choice: 0, why: "Filtering deletes the session from the board — the point is to SHOW the no-loads state, not hide it." },
        { choice: 2, why: "COALESCE(rate, 0) prints 0.0 — 'loads existed, nobody played' — a different finding from 'no loads ever arrived'." },
        { choice: 3, why: "Promotion fixes truncation, not division by zero — the denominator still needs the NULLIF guard." },
      ],
      difficulty: "medium",
    },
    {
      id: "snapchat-mcq-27",
      prompt: "Two cohorts' session-id lists run through INTERSECT. What does the result guarantee?",
      choices: [
        "All session ids from both lists, duplicates kept",
        "Ids present in BOTH lists, deduplicated — and NULLs count as equal",
        "Ids in the first list only",
        "The pair counts of shared sessions",
      ],
      answer: 1,
      why: "INTERSECT returns the shared population, deduplicated, with set-op NULL-equality (NULL matches NULL — unlike '='). The overlap read is exact by construction.",
      notes: [
        { choice: 0, why: "That's UNION — and set ops dedupe (UNION) or stack verbatim (UNION ALL); INTERSECT is specifically the overlap." },
        { choice: 2, why: "First-list-only is EXCEPT's direction — INTERSECT is the both-sides population." },
        { choice: 3, why: "INTERSECT returns rows, not counts — pair-counting is self-join territory." },
      ],
      difficulty: "medium",
    },
    {
      id: "snapchat-mcq-28",
      prompt: "EXCEPT removes rows — but with which dedupe semantics, and how do NULLs compare inside it?",
      choices: [
        "Keeps duplicates; NULLs never match",
        "Result is distinct; NULLs are treated as equal — set-op semantics, not '=' semantics",
        "Keeps duplicates; NULLs match",
        "Distinct result; NULLs never match",
      ],
      answer: 1,
      why: "All set ops (except UNION ALL) return distinct rows, and NULLs are equal to each other in set-op comparison — which is why EXCEPT-based anti-joins catch NULL rows that NOT IN annihilates.",
      notes: [
        { choice: 0, why: "Duplicates collapse silently — an EXCEPT report can never be reconciled by COUNT(*) of its inputs alone." },
        { choice: 2, why: "Half right on NULLs, wrong on dupes — the combination matters when reconciling arms." },
        { choice: 3, why: "That's '=' semantics leaking into set-op reasoning — the very confusion EXCEPT debugging lives in." },
      ],
      difficulty: "hard",
    },
    {
      id: "snapchat-mcq-29",
      prompt: "The board needs 'top 5 by engagement' where engagement = SUM(total) per user. Which query shape is correct?",
      choices: [
        "SELECT customer_id, SUM(total) t FROM orders GROUP BY customer_id HAVING RANK() OVER (ORDER BY t) <= 5",
        "Fold in a CTE, RANK() OVER (ORDER BY eng DESC) in a second stage, filter streak_rank <= 5 in the outer SELECT",
        "ORDER BY SUM(total) DESC LIMIT 5 with the rank computed by hand",
        "WHERE SUM(total) >= (SELECT MAX(SUM(total)) ...) GROUP BY customer_id",
      ],
      answer: 1,
      why: "Fold first, rank the fold second, filter the rank third — each stage one grain. Window functions can't sit in HAVING/WHERE, so the rank needs its own stage.",
      notes: [
        { choice: 0, why: "Windows in HAVING are as illegal as in WHERE — same clause-order wall." },
        { choice: 2, why: "LIMIT 5 returns the right rows but no rank column, and a tie at the cut is resolved arbitrarily — no stated tie policy." },
        { choice: 3, why: "Nested aggregates in a scalar subquery don't group that way — the shape errors, and if repaired it compares to the max, not a top-5." },
      ],
      difficulty: "hard",
    },
    {
      id: "snapchat-mcq-30",
      prompt: "A GROUP_CONCAT manifest of lens ids per cohort runs AFTER joining sessions to event batches. The ids read '5,5,5,5,9,9...'. Cause and fix?",
      choices: [
        "The data is corrupted — re-ingest the batch log",
        "The join fanned out — each lens id repeats once per joined batch row; dedupe (DISTINCT in the aggregate or a staged CTE) before concatenating",
        "GROUP_CONCAT needs an ORDER BY — sorting removes the repeats",
        "Use MAX(id) per cohort instead",
      ],
      answer: 1,
      why: "The manifest folded a fanned-out join: 251 batch rows repeated each session's lens ids. Fold-then-concat (or DISTINCT inside the aggregate) restores one id per occurrence.",
      notes: [
        { choice: 0, why: "The repeats are deterministic join arithmetic, not corruption — re-ingesting reproduces them exactly." },
        { choice: 2, why: "ORDER BY arranges the string; the duplicates survive any sort — this is a grain bug, not an ordering bug." },
        { choice: 3, why: "MAX collapses to one arbitrary id per cohort — the manifest loses every lens but the largest id." },
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
    {
      id: "cs-snapchat-3",
      tier: "easy",
      topic: "j7",
      universe: "supplier",
      title: "The lens-partner ledger fold",
      brief:
        "Partner-ops memo, quarterly review: every lens partner ships play-credit revenue through the declared storefront mapping — suppliers are lens partners, products are lens SKUs, order_items are in-session event batches carrying a quantity of plays at a unit rate. Probed facts: **Nordic Gadgets AB leads at 11,130.25 across 3 listings** (4.6 rating), Midwest Hardware Co follows at **9,294.93**, and the board is gated to partners carrying at least **3 live listings** — the review explicitly cut the two-listing tail. Biggest revenue first, one row per partner.",
      ask: "Return each lens partner with at least 3 listings: play-credit revenue, listing count, and average rating, biggest revenue first.",
      template:
        "SELECT s.name,\n       ROUND(SUM({1}), 2) AS partner_revenue,\n       COUNT(DISTINCT p.id) AS listings,\n       ROUND(AVG(s.rating), 1) AS avg_rating\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY s.name\nHAVING COUNT(DISTINCT p.id) >= {2}\nORDER BY partner_revenue {3};",
      slots: [
        {
          answer: "oi.quantity * oi.unit_price",
          kind: "keyword",
          label: "the revenue expression",
          why: "Partner revenue is plays × per-play rate: quantity folded against unit_price, rounded once at the print. SUM(oi.quantity) alone reports raw play counts — the rate card vanishes and every partner's revenue collapses to a two-digit play total (Midwest 'leads' with 109).",
        },
        {
          answer: "3",
          kind: "number",
          label: "the listing gate",
          why: "The review gates to partners with at least 3 live listings — Nordic, Midwest, Shenzhen and Pacific carry 3 each, and the gate's value appears in the board's own listings column. A gate of 2 readmits the two-listing bench partners (Alpine 4,765.63, Andes 3,613.25) the review explicitly excluded.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the revenue ordering",
          why: "Biggest partner first: DESC puts Nordic's 11,130.25 on top. ASC flips the board to lead with Pacific's 2,980.15 — the smallest partner — which is how a partner review starts an argument about the wrong partner.",
        },
      ],
      distractors: ["oi.quantity", "s.id = p.id", "2", "ASC"],
      walkthrough:
        "The three-table chain is the partner ledger's spine: suppliers → products → order_items, folded per partner after the join. Revenue is SUM(quantity × unit_price) rounded once — Nordic 11,130.25 on 3 listings at a 4.6 rating, Midwest 9,294.93, then Shenzhen 3,049.07 and Pacific 2,980.15, all clearing the 3-listing gate; COUNT(DISTINCT p.id) keeps the listings count at SKU grain while the join fans out to batch rows. Every distractor has a signature failure: oi.quantity alone folds raw plays (Midwest leads with 109 and no dollars), s.id = p.id joins SKUs to partner ids on a coincidence of integers and returns an empty board, the gate of 2 readmits Alpine (4,765.63) and Andes (3,613.25) — the two-listing partners the review cut — and ASC leads with Pacific, the smallest partner. The trap worth naming: the rating ≥ 4.5 trusted bench is Alpine plus Nordic, and the listing gate keeps only Nordic — two different quality definitions, and this board ships the listing one.",
    },
    {
      id: "cs-snapchat-4",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The engagement leader board",
      brief:
        "Growth memo, board prep: the engagement leader board ranks Snapchatters by lifetime session engagement — the declared mapping holds, order totals are engagement units, customers are users. Probed facts: **Alice Chen leads at 7,262.35 over 24 sessions**, Emma Wilson follows at **6,640.56**, and the top five closes with Chloe Dubois at 2,667.93. All 16 users carry a distinct engagement total, so the rank walk has no ties — the board wants a ranked top-5 with the rank printed beside the name and a stated tie policy.",
      ask: "Return the top 5 users by lifetime engagement, rank 1 = biggest, with a rank column that would share ranks on ties.",
      template:
        "WITH user_load AS (\n  SELECT c.id, c.name, c.region,\n         ROUND(SUM(o.total), 2) AS engagement\n  FROM orders o\n  JOIN customers c ON {1}\n  GROUP BY c.id, c.name, c.region\n),\nranked AS (\n  SELECT name, region, engagement,\n         {2}() OVER (ORDER BY engagement {3}) AS streak_rank\n  FROM user_load\n)\nSELECT name, region, engagement, streak_rank\nFROM ranked\nWHERE streak_rank <= {4};",
      slots: [
        {
          answer: "c.id = o.customer_id",
          kind: "keyword",
          label: "the user join key",
          why: "Sessions attach to their user on the user's own key: c.id = o.customer_id. Joining on o.id = c.id matches order serial numbers to user ids by integer coincidence — the board still runs and prints a leader board of entirely wrong users (Olivia Brown 'leads' at 826.03).",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the ranking window",
          why: "RANK() prints competition ranks that would share a number on ties and skip the next — the board's stated tie policy. LEAD() is a value-shift, not a rank: dropped into the rank slot it stops the query from compiling.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the engagement ordering",
          why: "Rank 1 must be the biggest load: DESC. ASC silently inverts the board into a bottom-five — Olivia's 444.80 reads as rank 1 — exactly the memo the retention team does not want handed to the board.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the cut line",
          why: "Top five: the cut appears in the board's own rank column (1 through 5), so it verifies against the result. A cut of 10 stretches the memo to Pedro's 1,686.17 at rank 6 and dilutes the five names the board actually discusses.",
        },
      ],
      distractors: ["o.id = c.id", "LEAD", "ASC", "10"],
      walkthrough:
        "Fold first, rank second: the user_load CTE collapses 103 sessions to one engagement row per user (ROUND(SUM(o.total), 2)), and only then does RANK() OVER (ORDER BY engagement DESC) walk the fold — ranking raw rows would rank sessions, not users. On this db all 16 engagement totals are distinct (16 rows, 16 distinct values), so RANK prints 1..16 with no gaps; the cut at rank ≤ 5 returns Alice Chen 7,262.35, Emma Wilson 6,640.56, Grace Kim 4,574.23, Maya Patel 3,644.56, Chloe Dubois 2,667.93 — and the literal 5 is verifiable because it appears in the result's own rank column. Distractor signatures: the wrong key o.id = c.id fabricates a board where Olivia Brown leads at 826.03; ASC inverts rank 1 to the smallest user (444.80); LEAD() is not a ranking function and the template stops compiling; a cut of 10 admits ranks 6–10 down to Bruno Silva's 852.44. And the reason the rank lives in its own CTE: a window function can't be filtered in the same SELECT's WHERE — clause order, again.",
    },
    {
      id: "cs-snapchat-5",
      tier: "medium",
      topic: "x3",
      universe: "month-close",
      title: "The settlement rail stack",
      brief:
        "Finance memo, month-close: premium & ads billing settles on two rails — card and wire — and the close needs the rail stack with a grand-total banner in one query. Probed facts: **card runs 16 settlements for 37,364.00**, **wire runs 11 for 32,248.00**, and the banner cross-foots to **27 settlements / 69,612.00**. Amounts live as INTEGER cents, so the dollars print is `amount_cents / 100.0` — the banner arm must repeat the same discipline, and the memo reads banner-first.",
      ask: "Return one stack: each payment rail with settlement count and billed dollars, plus a TOTAL banner row cross-footing both rails, banner on top.",
      template:
        "SELECT {1} AS rail,\n       COUNT(*) AS settlements,\n       ROUND(SUM(amount_cents) / {2}, 2) AS billed_usd\nFROM payments\nGROUP BY method\nUNION ALL\nSELECT 'TOTAL',\n       COUNT(*),\n       ROUND(SUM(amount_cents) / 100.0, 2)\nFROM payments\nORDER BY billed_usd {3};",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the rail fold key",
          why: "The rail identity is the payment's method column: GROUP BY method gives card and wire one row each. Folding by amount_cents instead groups every distinct cent value — the stack dissolves into a cents ladder and both rails vanish from the report.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divisor",
          why: "Amounts are INTEGER cents; 100.0 forces real division at the print edge — the house cents rule. 1000 is the classic unit slip: it prints card at 3,736.40 and understates the rail by a factor of ten while the settlements counts still look right.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the banner-first ordering",
          why: "The memo reads banner-first: DESC puts the TOTAL row (69,612.00) on top. ASC buries the banner under the rails, and the cross-foot — the one number the close depends on — becomes the last row of the report.",
        },
      ],
      distractors: ["amount_cents", "1000", "'CARD'", "ASC"],
      walkthrough:
        "A UNION ALL stack is two folds with one contract: same three columns, one alias shape, and the banner arm re-folds the whole table — COUNT(*) = 27 and SUM/100.0 = 69,612.00, which cross-foots card 16 / 37,364.00 + wire 11 / 32,248.00 exactly. ORDER BY on the unioned alias sorts the stack; DESC reads TOTAL, card, wire — banner-first as the memo asks. Distractor signatures: amount_cents as the fold key shatters the stack into a per-cent ladder (the rails dissolve, and the 'rails' stop agreeing with anything above them); the 1000 divisor prints card at 3,736.40 and wire at 3,224.80 — every dollar figure off by 10× while the settlement counts still look right; the 'CARD' literal swapped into the banner renames the TOTAL row, and the cross-foot masquerades as a card line; ASC demotes the banner to the bottom. The discipline worth stating at the close: both arms must divide the same way — a banner that rounds differently from its rails is a reconciliation that cannot reconcile.",
    },
    {
      id: "cs-snapchat-6",
      tier: "hard",
      topic: "j5",
      universe: "fraud",
      title: "The unsettled-invoice sweep",
      brief:
        "Risk memo, spot-check: premium & ads invoices with no settlement leg at all are the sweep's target — the LEFT JOIN + IS NULL anti-join, folded per market cohort. Probed facts: **6 invoices carry zero payment rows totaling 15,217.00** — EU 4 for **8,524.00**, US 1 for 4,937.00, APAC 1 for 1,756.00 — and the APAC row is invoice #28, status 'paid' with no payment rows behind it, the anomaly the reconciliation table circled. LATAM prints no row, and absence is not zero.",
      ask: "Return each market cohort with the count and dollar total of invoices that have no payment rows, biggest dollar exposure first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS unsettled,\n       ROUND(SUM(i.amount_cents) / {1}, 2) AS ar_usd\nFROM invoices i\nJOIN customers c ON {2}\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS NULL\nGROUP BY c.region\nORDER BY ar_usd {3};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divisor",
          why: "Invoice amounts are INTEGER cents; the dollars print divides by 100.0 once, at the edge — the house cents rule. 1000 understates every exposure by 10× — EU's 8,524.00 prints as 852.40 — and the sweep under-escalates precisely the balances it exists to chase.",
        },
        {
          answer: "c.id = i.customer_id",
          kind: "keyword",
          label: "the cohort join key",
          why: "Invoices carry the billed user's id; the cohort comes from customers on c.id = i.customer_id. Joining i.id = c.id keys invoices to users by integer coincidence — the sweep returns an empty set, which reads as 'no exposure' and ends the investigation before it starts.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the exposure ordering",
          why: "Biggest exposure first: DESC reads EU 8,524.00, US 4,937.00, APAC 1,756.00. ASC leads with APAC's smallest row and buries the EU block — the wrong priority order for a chase list.",
        },
      ],
      distractors: ["p.id IS NOT NULL", "i.id = c.id", "1000", "ASC"],
      walkthrough:
        "The anti-join arm is the whole case: LEFT JOIN payments keeps every invoice, and WHERE p.id IS NULL keeps only the rows where no settlement leg exists — 6 invoices, 15,217.00, folded per cohort into EU 4 / 8,524.00, US 1 / 4,937.00, APAC 1 / 1,756.00. The APAC row is invoice #28 — status 'paid', zero payment rows — the paid-without-settlement anomaly the reconciliation table flagged, and the reason a fraud sweep reads status with suspicion rather than trust. Flip the arm to IS NOT NULL and the sweep reports the settled book instead — EU 14 / 59,890.00, APAC 8 / 25,072.00, US 5 / 11,738.00 — a clean bill of health assembled from exactly the wrong population. The other signatures: the wrong key i.id = c.id joins by coincidence and empties the sweep (absence read as safety), the 1000 divisor prints EU at 852.40, and ASC chases the smallest balance first. LATAM's missing row is the last trap: absence and zero are different findings, and this query correctly refuses to invent a 0 row.",
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
    { slug: "sessionize-events", why: "Sessionizing an event stream by inactivity gaps — the canonical split of a continuous open log into engagement windows, the shape behind every session-count definition." },
    { slug: "report-contiguous-dates", why: "Collapsing consecutive active days into start/end islands — the calendar-streak ladder the streak product ships, with the day-boundary definition stated." },
    { slug: "find-the-start-and-end-number-of-continuous-ranges", why: "Numbering continuous runs — the islands arithmetic that turns gap flags into streak lengths the retention board can print." },
    { slug: "active-users", why: "Users active some minimum number of periods — the habit-depth read behind the streak-alive share, thresholds stated like the alive line." },
    { slug: "game-play-analysis-v", why: "First-open cohorts with next-day survival — the D1 retention funnel per signup date, the acquisition-side twin of the streak board." },
    { slug: "game-play-analysis-iv", why: "The fraction of players with a follow-up session the day after install — the D2 gate, drilled as a dated subquery with the denominator stated." },
    { slug: "game-play-analysis-iii", why: "Running totals per player over time — the cumulative-engagement walk windows run on, frames and peers included." },
    { slug: "the-latest-login-in-2020", why: "Latest session per user inside a window — the most-recent-open fold that powers 'last seen' surfaces and the cold-tail list." },
    { slug: "ad-free-sessions", why: "Sessions with no ads event via NOT EXISTS — the same anti-join shape as the unsettled-invoice sweep, on the session surface." },
    { slug: "number-of-accounts-that-did-not-stream", why: "Accounts with zero activity rows — never-opened-user counts by anti-join, the honest zero-population read." },
    { slug: "maximum-transaction-each-day", why: "Peak session per day via window argmax — the daily-high board with tie handling stated, the latest-state canon." },
    { slug: "customer-order-frequency", why: "Users hitting an open-count threshold in a period — the frequency gate behind streak eligibility, HAVING against a stated cutoff." },
    { slug: "find-followers-count", why: "Counts per user of a relationship edge — the friends-per-user fold that sizes each Snapchatter's audience before streak math." },
    { slug: "confirmation-rate", why: "Confirmed-over-requested ratios per user — the delivery-confirmation read messaging runs on, denominators carried explicitly." },
    { slug: "top-travellers", why: "Ranking users by a folded distance/engagement sum across joins — the rank-after-fold board the growth team ships weekly." },
    { slug: "last-person-to-fit-in-the-bus", why: "Running-sum queue fitting — capacity-constrained session batching, the cumulative window with a stated limit." },
  ],
};
