// Duolingo — kit 14 of the Streaming & Social domain (Batch L, wave 7).
// The gamified learning company: daily lessons, streak retention, XP
// mechanics and the Super subscription that monetizes the loop. Pool
// provenance: Duolingo carries ZERO tagged registry problems (0 tagged LC —
// theme-curated, stated per spec) — all 16 problem slots and all 30 topic
// slugs are THEME-CURATED from the SQL band's streak/leaderboard/funnel-shaped
// problems. Case studies run on db/custom.db with probed figures from
// scripts/company-facts.md, mapped as: orders = daily learning sessions,
// customers = Duolingo learners, regions = the four learner regions, order
// status = session outcome (delivered = lesson completed, shipped = practice-
// hub only, pending = lesson started & unfinished, cancelled = session
// abandoned), order_items = exercise batches (quantity = exercises per
// batch), order total = XP earned per session, shipped_at = completion-sync
// stamp, products = Super plans & lesson-pack SKUs, suppliers = course-
// content partners, invoices/payments = Super & gem billing (INTEGER cents ÷
// 100), expenses = content & infra spend. Mappings declared in-world, no
// invented telemetry; every figure probed against db/custom.db (read-only).

import type { CompanyKit } from "../types";

export const duolingoKit: CompanyKit = {
  id: "duolingo",
  domainId: "media",
  name: "Duolingo",
  tagline: "Streaks, lessons and the gamified learning loop",
  accent: "text-lime-200",

  brief: [
    "Duolingo is the gamified learning app — the daily lesson is the product's atomic unit and the streak is its retention engine. The unit of analysis is the **learning session**: one learner, one sitting, one outcome — {emerald:lesson completed}, {sky:practice-hub only}, started but unfinished, or {rose:abandoned}. Everything the product teams argue about — whether the XP rework lifted real completion, which cohort lets streaks die, why July cooled — hangs on queries that fold **251 exercise batches** into **103 learning sessions** from **16 learners** across four learner regions, with a **34,833.28** XP book behind them. The population behind every ratio gets stated before it's believed.",
    "The data org runs three engines. Session telemetry folds the exercise-batch log into the lesson-health boards the curriculum team reads at 08:15 sharp. Streak analytics runs the sync math: **82 of 103 sessions carry a completion-sync stamp**, a **2.98-day average** session-to-sync lag with a 2–4 day range on the audit clock — the storefront stand-in runs a slower clock than Duolingo's same-day sync, and the kit reports the probed figures as probed — and the unstamped 21 are the unfinished-plus-abandoned tail, reported as a state, never as zero. Monetization reads Super & gem billing, where amounts live as INTEGER cents and `amount_cents / 100.0` at the display edge is house style — card rails ran **16 payments / $37,364.00** against wire rails at **11 / $32,248.00**, and the ledger ties at **181,080 = 181,080** every close.",
    "Interview screens are leaderboard- and census-shaped. A typical loop opens with a fold (exercises per session, sessions per learner — `SUM(quantity)`, not `COUNT(*)`, because batches carry retries), escalates into a **tie-aware RANK leaderboard** — pack XP folded in a CTE, ranked, ties sharing a rank and the next rank skipping — and lands on either a one-pass **outcome census** whose four arms must reconcile to 103 or a threshold subquery (*which sessions beat the book-wide XP mean?*). The follow-ups are definition probes: per what — batches or exercises, sessions or learners, RANK or DENSE_RANK when two packs tie? Candidates who state the denominator and the tie rule consistently outperform.",
    "Preparation strategy: Duolingo has **no tagged registry problems**, so this kit theme-curates all sixteen — the streak ladders (longest streak, the 15-day wall), the XP leaderboard canon, the free-to-Super conversion funnel and the quiet-learner anti-joins. Then run both case studies on the live storefront db: one rebuilds the {violet:pack-XP leaderboard} (RANK over a folded CTE, gated at the 30-XP line, ties sharing ranks 4 and 8), the other rebuilds the {emerald:streak-outcome stack} (per-outcome folds plus a UNION ALL grand total). The storefront mapping is declared, not hidden — orders are sessions, totals are XP, regions are learner regions — because making the stand-in explicit is itself the habit this screen rewards.",
  ],

  dayInLife: [
    "**08:15 —** The overnight streak board. The analyst opens telemetry's morning reads: sessions per region, the {emerald:completion share} (52 of 103 on the audit window), and the number that gates the day — the {rose:streak-risk queue}: which learners' last sync crossed the cold line overnight, and whether the July-style cool-off (**$1,193.86** month, 2 cancels) is repeating. The first query is a LAG walk over each learner's session partitions, gaps in julianday days, NULL on each learner's first session kept and labeled. A spike in breaks without a completion lift is the day's first fire, and the analyst who can split NEW breakers from CHRONIC ones — before the retention lead pings — owns the morning.",
    "**11:00 —** XP leaderboard deep work. Curriculum wants the pack board rebuilt: fold exercise batches per lesson pack in a CTE, rank by XP, gate at the 30-XP line. The board reads **47 / 46 / 38** at the top, a **tie at 36 sharing rank 4**, and a **three-way tie at 30 sharing rank 8** — RANK, not DENSE_RANK, so the next rank skips, and the tie rule is printed next to the numbers because two teams inheriting two leaderboards from one table is how the XP rework lost a week. Each ask is a fold, a rank and an argument about grain — batches versus exercises, packs versus learners. *A leaderboard without its tie rule is just a fight waiting to happen.*",
    "**15:30 —** Super conversion and EOD cycles. The monetization review: free-to-Super funnel steps with denominators stated, the {sky:sync lag} read (**82 of 103 stamped, 2.98-day average, 2–4 range** — the unstamped 21 are unfinished-plus-abandoned, reported as a state), and the billing roll-up in honest dollars (`amount_cents / 100.0`, integer division banned) with the {amber:split-payment} register (5 invoices, one partial at **4,000 of 6,148** cents) flagged for finance. The afternoon's job is closing loops: yesterday's leaderboard becomes next sprint's XP experiment, and every number that leaves the desk carries its denominator with it — the EOD note pins the SQL beside the figures it produced, because retention re-runs these blind.",
  ],

  metrics: [
    { name: "Sessions per learner", what: "103 learning sessions across 16 learners on the audit window, mean cadence 6.44. The frequency read every streak board is cut from, always with the learner region stated." },
    { name: "Completion share", what: "Sessions that ended in a completed lesson: 52 of 103 (50.5%), the delivered arm. The product's core behavior read — and the arm the curriculum team ships weekly." },
    { name: "Sync lag", what: "Session-to-completion-sync window where stamped: 82 of 103 sessions, 2.98-day average, 2–4 range. The unstamped 21 are the unfinished-plus-abandoned tail — a state to report, never a zero to invent." },
    { name: "Cold-tail share", what: "Unfinished (14) plus abandoned (7) = 20.4% of sessions. The counterweight to every streak headline, and the source list for streak-freeze experiments." },
    { name: "XP per session", what: "Session XP — 338.19 average against the 34,833.28 book (range 25.47 to 1,088.44). SUM(total) over the fold, not COUNT(*): batches are not exercises." },
    { name: "Pack XP leaderboard", what: "Exercise volume folded per lesson pack from the 251 batches — top pack 47, runner-up 46, third 38; ties at 36 and at 30 share ranks. The content read that decides which packs get shelf space." },
    { name: "Super rail mix", what: "Billing rails in honest dollars: card 16 payments / $37,364.00 vs wire 11 / $32,248.00. The mix that decides which payment-partner review gets escalated." },
    { name: "Renewal settlement clock", what: "Settlement days — 28.4 average (13–84 range) against flat 30-day terms, with 5 split-payment invoices and one partial (4,000 of 6,148 cents). The finance-team latency board." },
  ],

  topics: [
    {
      name: "First lessons & session counts",
      why: "Every learner story starts with a first session, and every board starts with a count: sessions per learner, first-session attribution, minutes per sitting. The curated trio drills the first-login fold, the distinct-viewer count and the duration roll-up that opens Duolingo's lesson-health screens.",
      slugs: ["game-play-analysis-i", "article-views-i", "find-total-time-spent-by-each-employee"],
    },
    {
      name: "Streak ladders & islands",
      why: "A streak is a gaps-and-islands problem: consecutive practice days forming an island, the break day splitting it. The curated trio is the canon — the longest winning streak, the 15-day activity wall and the loyal-customer islands read the retention board's headline hangs on.",
      slugs: ["longest-winning-streak", "fifteen-days-of-learning", "find-loyal-customers"],
    },
    {
      name: "XP censuses & conditional counts",
      why: "The exercise census counts work by kind in one pass — completed exercises, practice reps, target-met learners — and COUNT(CASE …) is the grammar. The literal snaps census is this read; the trio adds the experiment-bucket count and the zero-available gate that census reports lean on.",
      slugs: ["snaps-analysis", "count-the-number-of-experiments", "find-books-with-no-available-copies"],
    },
    {
      name: "Leaderboards & tie-aware ranks",
      why: "XP leaderboards live and die on tie handling: two packs at 36 share rank 4, and whether the next rank reads 5 or 6 is DENSE_RANK vs RANK. The trio drills the classic score ranking, the earner fold and the salary-group DENSE_RANK board that settle the tie rule before the deck ships.",
      slugs: ["rank-scores", "top-earners", "group-employees-of-the-same-salary"],
    },
    {
      name: "XP trend & calendar buckets",
      why: "The XP trend reads calendar-shaped: unique learners per month, practice spikes by weekday, sessions bucketed into XP intervals. The trio covers the month-fold grammar, the weekday pivot and the interval ladder where bucket edges are the whole audit.",
      slugs: ["unique-orders-and-customers-per-month", "sales-by-day-of-the-week", "calculate-orders-within-each-interval"],
    },
    {
      name: "Super conversion & experiments",
      why: "Free-to-Super is a funnel the experimentation team ships weekly: step conversion, A/B lift against a control split, and how long learners sit before converting. The trio drills the funnel-step grammar, the conversion-lift ratio and the median-time-to-convert read.",
      slugs: ["funnel-step-conversion", "ab-test-conversion-lift", "median-time-to-convert"],
    },
    {
      name: "Sync stamps & NULL repair",
      why: "Unstamped sessions are the streak board's blind spot: NULL sync stamps on the unfinished tail, missing attributes on legacy rows, dropped batches leaving gaps. The trio drills the forward-fill repair, the missing-info join and the NULL/trim/length arms that keep the session log trustworthy.",
      slugs: ["change-null-values-in-a-table-to-the-previous-value", "employees-with-missing-information", "invalid-tweets-ii"],
    },
    {
      name: "Quiet-learner anti-joins",
      why: "Streak risk is defined by absence: learners with sessions but no completed lesson, quiet students across every exam, accounts that never streamed. The trio drills the anti-join shapes — visited-but-didn't, quiet-student NOT EXISTS, never-streamed — that the streak-freeze team lives in.",
      slugs: ["customer-who-visited-but-did-not-transact", "find-the-quiet-students-in-all-exams", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Rolling actives & stickiness",
      why: "Streak health reads trailing-window shaped: 7-day actives, rolling averages that smooth the daily noise, and growth framed as current vs trailing periods. The trio drills the rolling distinct count, the RANGE-frame average and the trailing-period growth read.",
      slugs: ["rolling-7d-actives", "rolling-average-steps", "restaurant-growth"],
    },
    {
      name: "XP threshold subqueries",
      why: "'Which sessions beat the book-wide XP mean?' is a subquery shape: the average lives in the table, not the memo. The trio drills the high-usage gate, the group-vs-global average comparison and the relational-division read that finds learners who finished every lesson in a unit.",
      slugs: ["find-users-with-high-token-usage", "find-expensive-cities", "customers-who-bought-all-products"],
    },
  ],

  theory: [
    {
      id: "duolingo-t1",
      q: "A lesson-health report joins learning sessions to exercise batches and reports XP per session. What does the raw join do to the numbers, and what's the fold-then-join fix?",
      a: "The raw join fans out: 103 sessions meeting 251 exercise batches on the session key repeat every session-level column once per batch row — a session with four exercise batches carries its XP four times, and SUM(total) over the join re-prices the 34,833.28 XP book at 103,244.55. The fix is to fold first: GROUP BY session in a derived table with SUM(quantity) for exercises, one row per session, then join. Now the grain is sessions on both sides and every aggregate is honest; COUNT(DISTINCT session_id) is the seatbelt, but the seatbelt hides the fan-out instead of fixing it. The senior tell is naming the grain before writing the join — at Duolingo the question 'sessions or batches?' is the interview's first turn, and it decides everything downstream.",
      tag: "joins",
    },
    {
      id: "duolingo-t2",
      q: "The pack-XP leaderboard has two packs tied at 36 and three tied at 30. Walk the RANK behavior — and when would DENSE_RANK or ROW_NUMBER be the right call?",
      a: "RANK() OVER (ORDER BY xp DESC) gives tied rows the same rank and skips: on the probed board the folds read 47, 46, 38, 36, 36, 33, 31, 30, 30, 30 — ranks 1, 2, 3, 4, 4, 6, 7, 8, 8, 8. The tie at 36 is competition semantics: two packs share silver-or-nothing, and 33 lands at rank 6 because two rows precede it. DENSE_RANK would print 4, 4, 5 — no skip — which is right when the board is a tier map, not a contest. ROW_NUMBER breaks ties arbitrarily (server order, not a rule) and prints 4, 5 — the silent leaderboard lie that sparks a fight between two teams reading two boards. The senior candidate states the tie rule next to the numbers, because at Duolingo the tie IS the product: streak leaderboards, league promotions and XP crowns all inherit whichever rule the query picked.",
      tag: "windows",
    },
    {
      id: "duolingo-t3",
      q: "The outcome census needs all four session outcomes with counts that reconcile to the population. Why conditional aggregates, and what does filtering the outcome in WHERE break?",
      a: "One pass, four branches: COUNT(CASE WHEN status = 'delivered' THEN 1 END) beside its siblings folds 52 completed, 30 practice-only, 14 unfinished, 7 abandoned from the same 103 rows — numerator and denominator from one population, so 52+30+14+7 = 103 is an identity the board checks before publishing. Put status = 'delivered' in WHERE and the denominator drifts to match the numerator: every kept branch now reads against 82, the shares inflate, and the reconciliation identity dies silently. The ELSE arm matters too — a NULL-ELSE merges unfinished into abandoned, and the streak-freeze team loses the leading indicator exactly when it matters. Conditional aggregates keep the population whole and the definition printed; that discipline is the census.",
      tag: "aggregation",
    },
    {
      id: "duolingo-t4",
      q: "21 of 103 sessions carry no completion-sync stamp. How should the sync-lag report treat them, and what does COALESCE(stamp, created_at) do?",
      a: "The unstamped 21 are the 14 unfinished plus 7 abandoned sessions — sessions that never synced a completion, which is precisely the state the report exists to surface. The lag metric is julianday(stamp) - julianday(created_at) over the 82 stamped sessions only (2.98-day average, 2–4 range), with the stamped count printed beside the average so the denominator is visible. COALESCE(stamp, created_at) would fold every unstamped session into a zero-day sync — the report now claims the abandoned tail syncs instantly, and the 2.98 average collapses into a fiction. The policy: filter IS NOT NULL deliberately and say so, count the NULLs as their own arm, and never let a fallback invent a measurement. In a streak product, *a missing stamp is the story; a coalesced one is the cover-up.*",
      tag: "nulls",
    },
    {
      id: "duolingo-t5",
      q: "A streak read filters to completed lessons in WHERE, then computes LAG gaps per learner. Why do the streaks lie — and where does the status filter belong?",
      a: "Windows run after WHERE. Filter to completed sessions and each learner's partition now contains only the surviving rows — the LAG chain bridges across the deleted practice-only, unfinished and abandoned sessions, so a learner who shows up daily but completes weekly reads as a 7-day streak of 1-day gaps. The gaps are computed over a population the filter silently rewrote, which is the most honest-looking lie in streak SQL. The fix depends on the question: if the streak definition is sessions regardless of outcome, compute gaps first (CTE over all sessions), then classify; if the streak is genuinely completed-only, the filter is the definition — stated, with the denominator becoming completed sessions. At Duolingo the rule is spoken: *filter after the window, or filter as a stated definition — never as an accident of clause order.*",
      tag: "pipeline",
    },
    {
      id: "duolingo-t6",
      q: "'Which sessions beat the book-wide XP mean?' — how does the threshold query work, and why is it a subquery shape rather than a plain filter?",
      a: "The mean lives in the data: SELECT … FROM orders WHERE total > (SELECT AVG(total) FROM orders) — the scalar subquery computes the book-wide average (103 sessions priced at 34,833.28, mean 338.19) once, and the outer query compares every session against it. A plain literal CAN be written (total > 338.19) but it's a frozen snapshot: the day the XP book grows, the hardcode silently filters the wrong sessions while the query still runs. AVG(total) directly in WHERE errors — aggregates can't sit in the row filter, that's HAVING's job after a GROUP BY, and HAVING with no GROUP BY folds the whole table to one row and loses every session. The scalar subquery recomputes with the data, reads once, and states its own denominator — which is why the threshold probes in this screen are always subquery-shaped.",
      tag: "subqueries",
    },
    {
      id: "duolingo-t7",
      q: "Streak definitions: is a 'daily streak' calendar days or 24-hour gaps? How does the SQL differ, and why does the choice move the metric?",
      a: "Calendar-day streaks bucket by STRFTIME('%Y-%m-%d', created_at) and compare bucket adjacency — a 23:50 lesson and a 00:10 lesson are consecutive days. 24-hour gaps compare julianday deltas <= 1 — the same pair is a 20-minute gap, trivially alive. Same learner, same sessions, different streak: the definition IS the metric, which is why the board prints its definition next to the number. The month buckets run STRFTIME('%Y-%m') across 2024-01 through 2025-02 — 14 buckets, year included or two Februaries fold into one. The gaps-and-islands ladder (row_number minus date) is the tool for the calendar form; the julianday form is the tool for gap magnitudes. The senior candidate states which one the streak team means before writing either, because retro-fitting a definition after the dashboard ships is how two teams inherit two truths from one table.",
      tag: "dates",
    },
    {
      id: "duolingo-t8",
      q: "Client retries can ship the same exercise batch twice into the session log. How do you dedupe without losing real repeats?",
      a: "Dedupe on identity, not appearance: two batches are duplicates when learner, session, exercise kind and timestamp agree — real repeats have distinct timestamps by definition. The keep-latest pattern is ROW_NUMBER() OVER (PARTITION BY session_id, exercise_type, ts ORDER BY ingested_at DESC) = 1 in a CTE, then filter to the survivor — the newest sync wins and the audit trail of duplicates stays queryable. A plain GROUP BY with MAX would silently pick arbitrary columns from different duplicate rows (Frankenstein rows), and DISTINCT on the whole row only works when every column truly matches. The census consequence: 251 raw batches on the audit db is the RETRY-INCLUSIVE count, so the exercises-per-session fold runs on the deduped set and states the pre-dedupe count beside it. *Deduplication is a definition before it is a query* — and at Duolingo the definition ships in the memo, not in folklore.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "duolingo-mcq-1",
      prompt: "The session-outcome census over 103 learning sessions returns: 52 delivered, 30 shipped, 14 pending, 7 cancelled. In the declared mapping, how many sessions ended in a completed lesson?",
      choices: [
        "52",
        "82 — delivered plus shipped",
        "30",
        "7 — the rest were abandoned",
      ],
      answer: 0,
      why: "'delivered' is the completed arm — 52 sessions that finished the lesson. 'shipped' is the practice-hub-only arm, a different surface in the same census.",
      notes: [
        { choice: 1, why: "82 is the stamped-session count (both synced arms) — a sync-lag denominator, not a completion count." },
        { choice: 2, why: "30 is practice-hub only — the completion read exists precisely because that arm never finished a lesson." },
        { choice: 3, why: "7 is the abandoned arm — the opposite outcome from completing." },
      ],
      difficulty: "easy",
    },
    {
      id: "duolingo-mcq-2",
      prompt: "The exercise log stores 251 BATCHES with quantity = exercises per batch. Which query returns total exercises?",
      choices: [
        "SELECT COUNT(*) FROM order_items",
        "SELECT SUM(quantity) FROM order_items",
        "SELECT AVG(quantity) FROM order_items",
        "SELECT COUNT(DISTINCT quantity) FROM order_items",
      ],
      answer: 1,
      why: "SUM(quantity) folds per-batch counts into total exercises — the work volume. COUNT(*) is 251 batches, the retry-inclusive row count.",
      notes: [
        { choice: 0, why: "251 is the batch grain — the exercise census needs exercises, and batches ≠ exercises the moment quantity > 1." },
        { choice: 2, why: "AVG gives batch richness (exercises per batch) — a different KPI the telemetry team also ships, but not volume." },
        { choice: 3, why: "DISTINCT quantity counts distinct VALUES — 1, 2, 3, 4 — not exercises." },
      ],
      difficulty: "easy",
    },
    {
      id: "duolingo-mcq-3",
      prompt: "The XP trend buckets sessions by month over 2024-01 through 2025-02. Which expression is calendar-safe?",
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
      id: "duolingo-mcq-4",
      prompt: "Streak-gap SQL: LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at). For which row is prev NULL?",
      choices: [
        "Every row — LAG needs an explicit frame",
        "Each learner's first session — nothing precedes it in the partition",
        "Abandoned sessions only",
        "Only the log's globally earliest session",
      ],
      answer: 1,
      why: "LAG looks one row back within the partition; the first row of each learner's partition has no previous — 16 such NULLs on this db, reported as 'no previous session', not zero-day gaps.",
      notes: [
        { choice: 0, why: "LAG works with a bare OVER — only the partition's head row lacks a previous value." },
        { choice: 2, why: "Abandoned sessions still carry created_at — outcome never affects the window's input rows." },
        { choice: 3, why: "Every learner's first session NULLs (16 rows), not just the log's earliest — partitions, not the table, define the window." },
      ],
      difficulty: "medium",
    },
    {
      id: "duolingo-mcq-5",
      prompt: "The pack-XP leaderboard uses RANK() OVER (ORDER BY xp DESC). Two packs tie at 36 exercises; the next pack sits at 33. What rank does the 33 pack carry?",
      choices: [
        "5 — the next integer after the tie",
        "6 — RANK skips the two positions the tie consumed",
        "4 — ties propagate forward",
        "3 — RANK recomputes from the top",
      ],
      answer: 1,
      why: "RANK gives tied rows the same rank and skips ahead by the rows consumed: 4, 4 at the tie, then 6 for the 33-exercise pack. On the probed board the full ladder reads 1, 2, 3, 4, 4, 6, 7, 8, 8, 8.",
      notes: [
        { choice: 0, why: "5 is DENSE_RANK's answer — the no-skip tier map. This board is a contest: RANK skips." },
        { choice: 2, why: "Ties don't propagate forward — the row AFTER a tie inherits the skipped rank, not the tied one." },
        { choice: 3, why: "RANK counts preceding rows within the partition — it never recomputes from the top for a mid-board row." },
      ],
      difficulty: "medium",
    },
    {
      id: "duolingo-mcq-6",
      prompt: "An analyst filters WHERE status = 'delivered' in a CTE, THEN computes LAG gaps per learner in the outer query. What happened to the streaks?",
      choices: [
        "Nothing — filters commute with windows",
        "The LAG chains bridge across filtered-out sessions, so gaps skip the practice-only and unfinished rows and streaks look tighter than reality",
        "The query errors — windows can't follow WHERE",
        "Only the first session per learner is affected",
      ],
      answer: 1,
      why: "Windows run on the rows that survive WHERE: the deleted practice-only, unfinished and abandoned sessions vanish from each partition and LAG bridges straight across them — a daily opener who completes weekly reads as a clean completed-only streak.",
      notes: [
        { choice: 0, why: "Clause order is the whole point — the window sees the filtered set, and the filter rewrote each learner's timeline." },
        { choice: 2, why: "It compiles and runs — that's exactly why it ships. The lie is silent, not syntactic." },
        { choice: 3, why: "Every gap in the partition changes, not just the head — each surviving row's 'previous' may now be days further back." },
      ],
      difficulty: "medium",
    },
    {
      id: "duolingo-mcq-7",
      prompt: "A one-pass FILTER census over 103 sessions reads: completed 52, practice-only 30, unfinished 14. What must the abandoned arm read for the census to reconcile?",
      choices: [
        "21 — the sync-lag denominator",
        "7 — the four arms must sum to the 103 population",
        "0 — FILTER arms only count positive outcomes",
        "14 — abandoned mirrors unfinished",
      ],
      answer: 1,
      why: "All four arms fold the same unfiltered rows, so the counts are additive by construction: 52+30+14+7 = 103. The abandoned arm's 7 is the census's built-in audit — a sum that doesn't reconcile means an arm drifted.",
      notes: [
        { choice: 0, why: "21 is the unstamped session count (14+7) — a sync-lag population, not a census arm." },
        { choice: 2, why: "FILTER arms count whatever the WHERE matches — 'cancelled' matches 7 sessions regardless of whether it feels positive." },
        { choice: 3, why: "Both arms are 14-ish in casual reading, but the census folds counts, not vibes: 52+30+14+14 = 110 ≠ 103." },
      ],
      difficulty: "medium",
    },
    {
      id: "duolingo-mcq-8",
      prompt: "A lesson-health memo reads XP of 103,244.55 for a book the facts price at 34,833.28. The query is SELECT SUM(o.total) FROM sessions o JOIN exercise_batches b ON b.session_id = o.id. What happened?",
      choices: [
        "The exercise log double-counts retries and must be deduped first",
        "The one-to-many join repeated each session's XP once per exercise batch — SUM over the fan-out tripled-plus the book",
        "ROUND collapsed the units",
        "The join should have been on customer_id instead",
      ],
      answer: 1,
      why: "SUM(o.total) over a session-to-batch fan-out sums the session XP once per batch row — 251 rows against 103 sessions inflates the book to exactly the 103,244.55 the memo printed. Fold batches per session first, then join at session grain.",
      notes: [
        { choice: 0, why: "Retries would double-count exercises, but the inflated figure comes from the session XP repeating per batch — a grain problem, not a dedupe problem." },
        { choice: 2, why: "No rounding is involved — the raw SUM already reads 103,244.55 before any display shaping." },
        { choice: 3, why: "Joining on customer_id would fan out differently but still inflate — the fix is folding before joining, not re-keying." },
      ],
      difficulty: "hard",
    },
    {
      id: "duolingo-mcq-9",
      prompt: "'Which sessions beat the book-wide XP mean (34,833.28 across 103 sessions)?' Which WHERE clause is correct and stays correct as the book grows?",
      choices: [
        "WHERE total > AVG(total)",
        "WHERE total > 338.19",
        "WHERE total > (SELECT AVG(total) FROM orders)",
        "HAVING total > 338.19",
      ],
      answer: 2,
      why: "The scalar subquery computes the mean (338.19 today) from the live table on every run — the gate tracks the book. The subquery reads once, states its own denominator, and never goes stale.",
      notes: [
        { choice: 0, why: "Aggregates can't sit in a row-level WHERE — the query errors before it filters anything." },
        { choice: 1, why: "338.19 is today's frozen snapshot: the day the book grows, the hardcode silently filters the wrong sessions while the query still runs." },
        { choice: 3, why: "HAVING without GROUP BY folds the whole table to one row — every session disappears except an arbitrary one." },
      ],
      difficulty: "hard",
    },
    {
      id: "duolingo-mcq-10",
      prompt: "The outcome stack UNION-ALLs a TOTAL row onto the per-outcome folds and sorts ORDER BY xp DESC. Where does the TOTAL row land?",
      choices: [
        "Last — UNION ALL always appends below the detail rows",
        "First — its 34,833.28 XP tops every outcome arm",
        "The query errors — ORDER BY can't reference a UNION column",
        "The TOTAL row drops out of the sort",
      ],
      answer: 1,
      why: "ORDER BY on a compound select sorts the combined result set: the TOTAL arm's 34,833.28 is the largest XP value in the stack, so DESC puts it on top. Pin the grand row with a literal arm key or sort ascending if it must close the board.",
      notes: [
        { choice: 0, why: "UNION ALL appends in set algebra, but a trailing ORDER BY re-sorts the whole stack — append order is not display order." },
        { choice: 2, why: "ORDER BY on a compound select is legal and sorts by the shared column names — xp exists in both arms." },
        { choice: 3, why: "The TOTAL row is an ordinary result row once UNION ALL runs — it participates in every sort like the rest." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-duolingo-1",
      tier: "medium",
      topic: "t5",
      universe: "catalog",
      title: "The pack-XP leaderboard",
      brief:
        "Curriculum memo: the XP rework ships with a pack leaderboard — lesson packs ranked by exercise volume, tie rules printed, gated to packs with real traffic. The db mapping is declared: order_items are exercise batches, quantity is exercises per batch, products are the lesson-pack catalog. Probed folds (facts file, units per pack): **Desk Mat Extended 47, Noise-Canceling Headset 46, HDMI 2.1 Cable 38**, a **tie at 36** (Laptop Stand Aluminum, Wireless Mouse M3), then 33, 31, and a **three-way tie at 30**. The memo fixes the leaderboard floor at **30 exercises** — packs below the line stay off the board — and the tie rule as **RANK: ties share a rank, the next rank skips**. Deterministic read: rank first, name second.",
      ask: "Return each lesson pack clearing the 30-exercise floor with its pack name, category, XP fold and RANK over the fold (biggest first, ties sharing ranks).",
      template:
        "WITH folds AS (\n  SELECT product_id,\n         SUM(quantity) AS xp\n  FROM order_items\n  GROUP BY product_id\n)\nSELECT p.name AS pack,\n       p.category,\n       f.xp,\n       {1}() OVER (ORDER BY f.xp {2}) AS rnk\nFROM products p\nJOIN folds f ON f.product_id = p.id\nWHERE f.xp >= {3}\nORDER BY rnk, p.name;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie rule",
          why: "The memo fixes the tie rule as RANK: ties share a rank and the next skips — 4, 4 then 6 at the 36-tie; 8, 8, 8 at the 30-tie. DENSE_RANK would print 4, 4, 5 and silently re-tier the board; ROW_NUMBER breaks ties arbitrarily, the leaderboard lie that starts fights.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the XP order",
          why: "Biggest XP first, per the memo — DESC. ASC would rank the 30-exercise packs 1-2-3 and put the 47 pack at the bottom: same rows, inverted crown, wrong celebration screens.",
        },
        {
          answer: "30",
          kind: "number",
          label: "the leaderboard floor",
          why: "The memo fixes the floor at 30 exercises — exactly the three tied packs' fold, so the gate keeps 10 packs and drops the 28-and-below tail. 36 trims to five packs; 31 drops the tie; 47 leaves a single-row board.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "36", "47", "31"],
      walkthrough:
        "Fold first, rank second, ties honest. The CTE folds the 251 exercise batches to one row per pack — SUM(quantity) as xp — and the outer query joins the pack catalog, gates at the 30-exercise floor and ranks with RANK() OVER (ORDER BY xp DESC). The probed board reads 47 rank 1, 46 rank 2, 38 rank 3, 36 ranks 4-4, 33 rank 6, 31 rank 7, 30 ranks 8-8-8 — ten packs, ties sharing ranks and the next rank skipping, exactly the memo's tie rule. DENSE_RANK prints 4, 4, 5 (and 7, 7, 7 at the bottom) — a different board from the same data; ROW_NUMBER breaks both ties arbitrarily; ASC crowns the 30-pack. 36 trims the floor to five packs, 31 drops the entire 30-tie, 47 leaves one row — three quiet ways to ship a leaderboard the deck can't use. ORDER BY rnk, name keeps the tie order deterministic instead of server-mood.",
    },
    {
      id: "cs-duolingo-2",
      tier: "easy",
      topic: "x3",
      universe: "funnel",
      title: "The streak-outcome stack",
      brief:
        "Retention memo, close-out review: the outcome stack ships one row per session outcome with XP folded per arm, plus a grand-total row — counts that must reconcile to the population by construction. The db mapping is declared: orders are learning sessions, totals are XP. Probed facts: **103 sessions** split **52 / 30 / 14 / 7**, the book prices at **34,833.28 XP**, and the probed arm folds read 15,571.07 completed / 11,996.72 practice-only / 6,113.00 unfinished / 1,152.49 abandoned. The memo fixes the deck floor at **14 sessions per arm** — arms below the line stay off the detail rows (the grand-total leg still folds the full book, on purpose). Deterministic read: ascending XP, grand total closing the stack.",
      ask: "Return each outcome arm clearing the 14-session floor with its session count and XP fold (2 decimals), plus a TOTAL row folding the full 103-session book, ascending XP.",
      template:
        "SELECT status AS arm,\n       COUNT(*) AS sessions,\n       ROUND(SUM({1}), 2) AS xp\nFROM orders\nGROUP BY {2}\nHAVING COUNT(*) >= {3}\nUNION ALL\nSELECT 'TOTAL' AS arm,\n       COUNT(*) AS sessions,\n       ROUND(SUM(total), 2) AS xp\nFROM orders\nORDER BY xp {4};",
      slots: [
        {
          answer: "total",
          kind: "keyword",
          label: "the XP column",
          why: "Session XP lives in orders.total — SUM(total) folds the arm's XP. SUM(quantity) errors (batches live in order_items) and SUM(order ids) prints id arithmetic wearing XP clothing — a board finance would close the month on.",
        },
        {
          answer: "status",
          kind: "keyword",
          label: "the arm key",
          why: "One row per outcome means GROUP BY status — 52/30/14/7 fold into four arms. Grouping by created_at would dissolve the arms into day buckets and the census reconciliation dies quietly.",
        },
        {
          answer: "14",
          kind: "number",
          label: "the arm floor",
          why: "The memo fixes the deck floor at 14 sessions — exactly the unfinished arm's count, so the gate keeps three arms and drops the 7-session abandoned arm. 7 would wave it through; 30 drops the unfinished arm too.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the stack order",
          why: "Ascending XP keeps the small arms first and the 34,833.28 grand total closing the stack, per the memo. DESC would put the TOTAL row on top — right rows, wrong story for a close-out read.",
        },
      ],
      distractors: ["quantity", "created_at", "shipped_at", "7", "30", "DESC"],
      walkthrough:
        "Two folds, one honest total. The detail leg groups orders by status, folds COUNT(*) and SUM(total) per arm — pending 14/6,113.00, shipped 30/11,996.72, delivered 52/15,571.07 survive the 14-session floor while cancelled's 7 sessions stay off the detail rows. The UNION ALL leg folds the FULL book with no gate — TOTAL 103/34,833.28 — so the stack always carries its population even when an arm is floored out, and the deck's reconciliation is 6,113.00+11,996.72+15,571.07+1,152.49 = 34,833.28 with the whole book one row away. ORDER BY xp ASC keeps the TOTAL row closing the stack; DESC would hoist 34,833.28 to the top. quantity errors (no such column on orders), created_at and shipped_at dissolve the arms into timestamp buckets, 7 reads a four-arm deck the memo floored, and 30 trims the unfinished arm the floor was sized to keep.",
    },
  ],

  problems: [
    { slug: "game-play-analysis-iv", why: "The lesson after the first login — the onboarding read that decides whether a learner's first day became a habit, drilled with the install-to-first-play shape." },
    { slug: "fifteen-days-of-learning", why: "The 15-day activity wall — a long-horizon streak audit: who practiced day after day, and when the ladder broke." },
    { slug: "longest-winning-streak", why: "Longest streak via gaps-and-islands — the canonical consecutive-days read the streak board's headline hangs on." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Two sessions inside a 7-day window — the re-entry habit gate: which learners came back fast enough for a streak to survive." },
    { slug: "count-the-number-of-experiments", why: "Exercises counted per bucket — the exercise-volume census the curriculum team ships, bucket edges as stated definitions." },
    { slug: "rank-scores", why: "Score ranking with ties — the XP leaderboard's exact grammar: equal XP shares a rank and the next rank skips." },
    { slug: "top-earners", why: "Top XP earners folded with SUM and ranked — the leaderboard read that decides which learners see the celebration screens." },
    { slug: "trial-to-paid-funnel", why: "Free-to-Super conversion — the step count with honest step denominators, the funnel monetization ships monthly." },
    { slug: "analyze-subscription-conversion", why: "Super conversion with the LEFT JOIN NULL arm — who never upgraded, the non-payer list inside the billing data." },
    { slug: "rolling-7d-actives", why: "Rolling 7-day actives — the trailing-window trend line the streak team reads instead of single-day spikes." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU stickiness — is learning a habit or a rotation, computed with honest weekly denominators." },
    { slug: "cohort-retention-matrix", why: "The cohort retention matrix — which signup month keeps its learners, the board the completion share feeds." },
    { slug: "week-over-week-churn", why: "Week-over-week churn via LAG — the streak-break trend: how the abandoned-arm population moves week to week." },
    { slug: "keep-latest-dedupe", why: "Keep-latest dedupe — sync retries can double-log an exercise batch; the dedupe contract keeps the newest sync and the audit trail." },
    { slug: "group-sold-products-by-the-date", why: "GROUP_CONCAT per day — which lesson packs ran on each sync date, folded into one audit cell per day." },
    { slug: "null-blank-audit", why: "The NULL-and-blank audit — session logs with missing sync stamps or blank outcomes, the data-quality queue streak reports lean on." },
  ],
};
