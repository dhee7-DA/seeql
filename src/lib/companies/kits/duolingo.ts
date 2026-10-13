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
//
// EXPANSION (Task 95, 3x spec, APPEND-ONLY — every original entry above the
// new ones stays byte-identical): brief 4→6, dayInLife 3→4, metrics 8→12,
// topics 10→15, theory 8→24 (duolingo-t9..t24), mcqs 10→30 (duolingo-mcq-11..30),
// cases 2→6 (cs-duolingo-3..6 on topic families j7 / t7 / s6 / q5 — distinct
// from the original t5 + x3 pair and pairwise distinct), problems 16→32. The
// new problem slots and topic slugs remain THEME-CURATED sql-graded rows from
// scripts/company-pools.md (Duolingo still carries zero tagged problems);
// case number slots quote probed facts-file figures verbatim (19-session
// region floor = US sessions, 14-line spend floor = Rent/Ads line counts,
// 50.5 = completion share) plus declared in-world constants (the 1.0-day cold
// line, the 100.0 percent base) marked noVerify; distractor consequences and
// result cells re-probed against db/custom.db read-only.

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
    "The screens' deeper half is definitional, and the expansion tier probes four KPI builds end to end. The {orange:streak-length distribution} — consecutive-session islands folded per learner, reported as a shape, never just a max. The {pink:daily-goal completion} share, whose denominator is active learner-days, not enrolled learners. The `lesson-start-to-finish` funnel — 103 started, 52 finished, **50.5%**, with the 51 exits split practice-only 30 / unfinished 14 / abandoned 7 and reconciling by construction. And the {violet:league promotion cut}, where top-3 meets its tie rule at the boundary and ROW_NUMBER-versus-RANK decides whether a tied learner promotes, loses to a coin flip, or overfills the league. Every one of these is a definition fight before it is a query fight — *the denominator is the answer's first half*.",
    "Preparation, round two, runs the four expansion cases on the live db. The {emerald:regional streak-health fold} — join, fold, gate at the 19-session floor, order by average XP. The {sky:cold-transition walk} — LAG over the 103-session log, 16 learners, 16 labeled first sessions, a 1.0-day cold line. The {amber:spend census} — CASE buckets over the cents ledger in honest dollars, 16,800 fixed against 4,570 growth. And the {violet:completion funnel} — a derived per-learner table printing 16 / 103 / 52 / 50.5 in cells, not prose. Then drill the trap tier in the theory bank: window frames, set-op dedupe, the NOT IN NULL poisoning, integer division on cents, the half-open interval. The mock-loop habit stands — state the grain, print the tie rule, carry the denominator — because the expansion screens grade the definitions as hard as the syntax.",
  ],

  dayInLife: [
    "**08:15 —** The overnight streak board. The analyst opens telemetry's morning reads: sessions per region, the {emerald:completion share} (52 of 103 on the audit window), and the number that gates the day — the {rose:streak-risk queue}: which learners' last sync crossed the cold line overnight, and whether the July-style cool-off (**$1,193.86** month, 2 cancels) is repeating. The first query is a LAG walk over each learner's session partitions, gaps in julianday days, NULL on each learner's first session kept and labeled. A spike in breaks without a completion lift is the day's first fire, and the analyst who can split NEW breakers from CHRONIC ones — before the retention lead pings — owns the morning.",
    "**11:00 —** XP leaderboard deep work. Curriculum wants the pack board rebuilt: fold exercise batches per lesson pack in a CTE, rank by XP, gate at the 30-XP line. The board reads **47 / 46 / 38** at the top, a **tie at 36 sharing rank 4**, and a **three-way tie at 30 sharing rank 8** — RANK, not DENSE_RANK, so the next rank skips, and the tie rule is printed next to the numbers because two teams inheriting two leaderboards from one table is how the XP rework lost a week. Each ask is a fold, a rank and an argument about grain — batches versus exercises, packs versus learners. *A leaderboard without its tie rule is just a fight waiting to happen.*",
    "**15:30 —** Super conversion and EOD cycles. The monetization review: free-to-Super funnel steps with denominators stated, the {sky:sync lag} read (**82 of 103 stamped, 2.98-day average, 2–4 range** — the unstamped 21 are unfinished-plus-abandoned, reported as a state), and the billing roll-up in honest dollars (`amount_cents / 100.0`, integer division banned) with the {amber:split-payment} register (5 invoices, one partial at **4,000 of 6,148** cents) flagged for finance. The afternoon's job is closing loops: yesterday's leaderboard becomes next sprint's XP experiment, and every number that leaves the desk carries its denominator with it — the EOD note pins the SQL beside the figures it produced, because retention re-runs these blind.",
    "**18:00 —** The restatement window. Late syncs landed during the afternoon: sessions that printed {rose:unfinished} at 08:15 now carry completion stamps, and the completion share moves if the board re-runs. The analyst does not re-run — they stamp the note as-of: figures on the 08:15 clock, restated arms marked, the {emerald:2.98-day sync lag} printed beside every completion number so nobody reads yesterday's board as today's truth. The EOD writeup pins three artifacts — the cold-walk query, the promotion-cut tie rule, the funnel denominators — because *tomorrow's argument is won by whoever kept the SQL next to the number*. **82 of 103** stamped is the population; the unstamped 21 are tomorrow morning's first look.",
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
    { name: "Streak-length distribution", what: "Consecutive-session islands folded per learner from the 103-session log — gaps-and-islands on the calendar-day definition, reported as median and max, never just the max. The definition (calendar-day vs 24-hour gap) ships beside the number, because the two disagree at every midnight crossing." },
    { name: "Daily goal completion", what: "Share of active learner-days whose folded session XP crossed the learner's daily goal — a CASE gate per learner-day, denominator = active learner-days, not enrolled learners. The 338.19 average is context, not the goal line." },
    { name: "League promotion cut", what: "Top-3 XP per league diamond advances; 16 learners tile into four diamonds of four. Ties at the cut are the whole audit — ROW_NUMBER promotes one by coin flip, RANK promotes both and overfills — so the tie rule prints beside the cut." },
    { name: "Learner stickiness", what: "Distinct learners per day over distinct learners per month — the DAU/MAU read. All 16 learners appear in the log (never-ordered = 0), so the ceiling is 16/16 on the audit window; the interesting number is the daily curve beneath it." },
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
    {
      name: "Session spacing & recency",
      why: "Streak risk is a spacing read: how far apart a learner's sessions land, and how stale the latest one has gone. The trio drills the LEAD gap walk between events, the latest-session-in-period filter and the second-most-recent argmax that powers the cold-learner queue.",
      slugs: ["biggest-window-between-events", "the-latest-login-in-2020", "second-most-recent-activity"],
    },
    {
      name: "League tables & promotion cuts",
      why: "Leagues are top-N boards with a cut line, and the cut is where tie rules earn their keep: two learners at rank 3 either both promote, or one loses to a coin flip. The trio drills per-group top-N with DENSE_RANK, rate-ranked boards with a HAVING floor, and the home-and-away UNION that assembles a full league table.",
      slugs: ["department-top-three-salaries", "chargeback-rate-ranking", "team-scores-in-football-tournament"],
    },
    {
      name: "Learner movement & growth accounting",
      why: "The retention org reads movement, not snapshots: who is new, returning, resurrected, gone. The trio drills the LAG status-transition walk, the winback-recovery rate and the NOT EXISTS dormant pool that feeds winback targeting.",
      slugs: ["growth-accounting", "winback-recovery", "dormant-reactivation"],
    },
    {
      name: "Zero-bucket histograms & tiles",
      why: "Exercise-volume histograms must print the empty bands — a bucket with zero sessions is a finding, not an absence. The trio drills the recursive zero-fill spine, the UNION ALL zero-bucket ladder and the month-grain stack that keeps quiet months visible.",
      slugs: ["transactions-per-visit-histogram", "count-salary-categories", "monthly-transactions-ii"],
    },
    {
      name: "Multi-arm conditions & experiment hygiene",
      why: "Curriculum asks compound questions — learners who finished unit A and unit B but quit unit C — and experimentation asks whether the split itself is honest. The trio drills the conditional-aggregation AND/AND/NOT pattern, the sample-ratio check that guards every A/B read and the COALESCE confirmation-rate fold.",
      slugs: ["customers-who-bought-a-and-b-not-c", "ab-sample-ratio-mismatch", "confirmation-rate"],
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
    {
      id: "duolingo-t9",
      q: "The pack leaderboard must gate to packs with real traffic. Where does the gate live — WHERE or HAVING — and why does the answer change if the gate compares a fold?",
      a: "Clause order is the pipeline: FROM builds the rows, WHERE filters them pre-aggregation, GROUP BY folds, HAVING filters the folds, SELECT shapes, ORDER BY sorts. A gate on a raw column (status = 'delivered') lives in WHERE — filtering before the fold is cheaper and the fold then runs on the survivors. A gate on a fold (total exercise volume >= 30, folded across the 251 batches) can't live in WHERE — aggregates don't exist there yet, the query errors — it belongs in HAVING after the GROUP BY, or in an outer query over the fold CTE. The alias trap rides along: WHERE can't see SELECT aliases either, because SELECT hasn't run. At Duolingo the leaderboard's floor is a fold comparison, so the house pattern is fold-in-CTE, gate-in-outer-WHERE — HAVING works too, but the CTE form keeps the gate inspectable next to the tie rule.",
      tag: "pipeline",
    },
    {
      id: "duolingo-t10",
      q: "The running XP read uses OVER (PARTITION BY customer_id ORDER BY created_at). What frame does that default to, and when do ROWS and RANGE disagree?",
      a: "With ORDER BY present and no frame clause, the default is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. RANGE frames by value: rows tying on the ORDER BY key are peers and join the frame together. Two sessions sharing a timestamp (sync clock collision) enter the running total in one jump — honest to the tie, wrong for a row-by-row accumulation promise. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is strictly row-by-row, but with ties it needs a deterministic tiebreak (ORDER BY created_at, id) or the split is server-mood. The other default matters too: no ORDER BY at all means the frame is the whole partition — SUM over it prints the learner's book total on every row. State the frame when the board's arithmetic is the product; at Duolingo the running-XP read is exactly that.",
      tag: "frames",
    },
    {
      id: "duolingo-t11",
      q: "The close-out stack UNIONs the completed arm and the stamped arm. Why is UNION the wrong operator, and what does UNION ALL promise instead?",
      a: "UNION dedupes whole rows across both arms. The completed arm (52 sessions) is a subset of the stamped arm (82) — every delivered session carries a stamp — so UNION collapses the stack to 82 rows and the completed arm silently vanishes. UNION ALL appends without dedupe: 52 + 82 rows, overlap and all, which is what a stack means. The cost story cuts the other way at scale — UNION sorts or hashes to find duplicates, UNION ALL doesn't — but the correctness story is primary: set-op arms must be populations you mean to combine, and dedupe must be a stated intent, never a side effect. Also remember set ops align columns by position, not name — the two arms' column lists must match in order and type, or the stack compares apples to sessions.",
      tag: "setops",
    },
    {
      id: "duolingo-t12",
      q: "Learners with sessions EXCEPT learners with completed lessons — walk the semantics, including what happens with duplicate learner ids and with NULLs.",
      a: "EXCEPT keeps left-set rows that never appear in the right set, deduplicating on the way: learners with any session, minus learners with any delivered session, one row each — the no-completion population that feeds the streak-freeze queue. Reverse the arms and you get the completion-havers; direction is the whole query. Duplicates collapse (EXCEPT is distinct by definition; EXCEPT ALL, where supported, keeps multiplicity), and NULLs compare as equal inside set ops — unlike join equality, where NULL never matches anything — so a stray NULL learner id would subtract cleanly here but never join-match. That NULL-as-equal behavior is also why the anti-join-by-set-op is safer than NOT IN when the driving column can carry NULLs. At Duolingo the population definition — any session vs any completion — ships beside the count, because the two read very different sizes off the same log.",
      tag: "setops",
    },
    {
      id: "duolingo-t13",
      q: "'Which learners beat their region's average session XP?' — correlated subquery or derived table, and how do you choose?",
      a: "Both compute a per-group average and compare each session against it; the difference is execution shape and scale behavior. The correlated form — (SELECT AVG(o2.total) FROM orders o2 JOIN customers c2 … WHERE c2.region = c1.region) — re-runs for every outer row: fine at 103 sessions, quadratic-ish at billions of exercise events. The derived form computes each region's average once (GROUP BY region in a CTE or FROM-subquery) and joins it back on region — one pass, then a cheap equality. The instinct: correlated for point lookups and tiny outer sets, derived or CTE for set-wide comparisons, and the join-back form whenever the outer query itself aggregates. The book-wide mean (338.19) is the degenerate case — one scalar subquery, no correlation at all. Name the shape before you write it; at Duolingo the follow-up question is always 'how many times does that subquery run?'",
      tag: "subqueries",
    },
    {
      id: "duolingo-t14",
      q: "Why does the team's SQL style guide ban NOT IN for anti-joins, and what does it prescribe instead?",
      a: "NOT IN executes as a chain of <> tests against the subquery's result. Any NULL in that result poisons the chain: x <> NULL is UNKNOWN, never true, so every NOT IN test turns UNKNOWN and the query returns zero rows — silently, on data that looked fine. The session log's learner ids are NOT NULL today, but one legacy backfill changes that and the streak-freeze queue empties overnight. The prescriptions: NOT EXISTS (correlated, NULL-safe, stops at the first match), or LEFT JOIN … WHERE right.key IS NULL with the join key guaranteed non-NULL on the right. Both say 'learners with sessions and no completed lesson' and both survive NULLs. The style-guide rule generalizes: anti-join semantics belong to anti-join constructs, not to comparison chains wearing them — and the reviewer who sees NOT IN on a nullable column asks for the rewrite.",
      tag: "subqueries",
    },
    {
      id: "duolingo-t15",
      q: "Two learners: one session at 23:50 and the next at 00:10. Is that a streak step? Walk how the SQL decides.",
      a: "The definitions disagree and the SQL must pick one. Calendar-day streaks bucket by STRFTIME('%Y-%m-%d', created_at): the pair lands in adjacent day buckets — a step, streak alive. The 24-hour definition compares julianday deltas <= 1: 20 minutes is about 0.0139 days — trivially a step, and also a step for two sessions 20 hours apart that the calendar calls different days. The reverse case bites harder: 25 hours apart is one calendar step (adjacent buckets) but fails the 24-hour gate. Neither is wrong; unstated, both are. The house pattern: compute the day bucket and the julianday delta in the same walk CTE, name the definition in the board header, and let the freeze-email job read the column its definition matches. Date math is policy — at Duolingo the policy is the product.",
      tag: "dates",
    },
    {
      id: "duolingo-t16",
      q: "The monthly XP trend shows buckets from 2024-01 to 2025-02, but one quiet month is missing from the GROUP BY output. What happened and what's the fix?",
      a: "GROUP BY only prints buckets that exist: a month with zero sessions has no rows to fold, so it vanishes and the trend line silently skips a step — the chart reads a plateau where the truth is a zero. The fix is a calendar spine: generate every month in range (a recursive CTE of first-of-month dates, or a months dimension), LEFT JOIN the fold onto it, COALESCE the folds to 0. Now the full 2024-01-to-2025-02 span prints every bucket and the July-style cool-off ($1,193.86, 2 cancels) shows as the dip it was. Same discipline for day-grain streak boards — missing days make ROWS frames reach further than their label claims, so the spine doubles as the window's density guarantee. The audit habit: after any time fold, assert the bucket count against the calendar before the chart ships.",
      tag: "dates",
    },
    {
      id: "duolingo-t17",
      q: "COUNT(*), COUNT(shipped_at), SUM(total) over an empty group, AVG over a column with NULLs — walk what each returns on this session log.",
      a: "COUNT(*) counts rows: 103. COUNT(shipped_at) counts non-NULL stamps: 82 — the difference, 21, is the unstamped tail, and it's the cheapest census the board owns. SUM over a group with no rows returns NULL, not 0 — the zero must be demanded (COALESCE(SUM(...), 0) or the ELSE-0 CASE arm). AVG divides by the non-NULL count, not the row count: AVG over the 82 stamped sessions reads 2.98 with an invisible denominator — print the 82 beside it or the board overstates coverage. SUM and AVG ignore NULLs entirely; COUNT(col) ignores them; COUNT(*) doesn't. The policy: every aggregate on a nullable column carries its non-NULL denominator in the same row, and every empty-group fold carries its COALESCE. Averages without denominators are the NULL policy's first casualty.",
      tag: "nulls",
    },
    {
      id: "duolingo-t18",
      q: "Billing stores INTEGER cents. Where does integer division bite, and what's the house rule?",
      a: "SQLite divides integer by integer to an integer, truncating toward zero. amount_cents / 100 turns 4,000 cents into 40 (fine) but 6,148 into 61 — the partial payment reads as underpaid by a full dollar and the reconciliation flags the wrong invoice. The house rule: divide by 100.0 (a REAL forces float math) or CAST to REAL first, at the display edge only — storage stays INTEGER because cents have no rounding drift and sums stay exact. The card rail read is the showcase: 16 payments folding to 3,736,400 cents prints as $37,364.00 only because the fold ran in cents and the division happened last. Divide early and every intermediate sum inherits float wobble; divide late and the ledger reconciles to the cent. Money math is a pipeline-order question wearing a formatting costume.",
      tag: "money",
    },
    {
      id: "duolingo-t19",
      q: "Define the streak-length distribution — not the max streak, the distribution. What are the SQL moves and the definitional traps?",
      a: "Three stages. First, the day fold: distinct learner-days (STRFTIME('%Y-%m-%d')) per learner, because two sessions on one day are one streak day. Second, gaps-and-islands: the day's calendar row number minus ROW_NUMBER() over (partition by learner order by day) is constant on consecutive runs; that constant is the island id. Third, GROUP BY learner + island, COUNT(*) = island length; then the distribution: histogram, median, P90 over the lengths. The traps: calendar-day vs 24-hour definitions change island boundaries at every midnight crossing; the 15-day wall is a HAVING length >= 15 on the island fold; and the distribution must include length-1 islands — learners whose streak is a single day are the freeze campaign's real audience, and a max-only read hides them entirely. Report the shape, not the crown.",
      tag: "kpi",
    },
    {
      id: "duolingo-t20",
      q: "Define daily goal completion for this product. What's the numerator, what's the denominator, and which denominator mistake makes the metric lie?",
      a: "Numerator: learner-days where the day's folded session XP crossed that learner's daily goal — SUM(total) per learner-day in a CTE, then a CASE (or a join to the goals table, because goals are per-learner config) marking goal_met. Denominator: active learner-days — learner-days with at least one session. The classic lie is swapping in enrolled learners: 16 learners on the log, but a given day may have 6 actives — dividing by 16 buries the metric under everyone who didn't open the app and makes a healthy habit look dead. The second lie is grain confusion: the goal applies to the day's fold, not to each session — a 200-goal learner hitting 120 + 130 met the goal in two sessions neither of which cleared it alone. Print both counts (met / active) so the ratio carries its own audit.",
      tag: "kpi",
    },
    {
      id: "duolingo-t21",
      q: "Define the lesson-start-to-finish funnel on this data. What are the steps, what are the exits, and what must reconcile?",
      a: "One population, one pass: every session starts a lesson, so the funnel's top is 103 — the started count, not enrolled learners. The finish step is the delivered arm: 52, a 50.5% completion share. Everything else is an exit, not a middle step: 30 practice-hub-only (engaged but left the lesson surface), 14 unfinished (started, stalled), 7 abandoned — 51 exits, and 52 + 51 = 103 is the identity the census checks before publishing. The traps: the exits are mutually exclusive statuses, so the census is conditional aggregation (or FILTER) over unfiltered rows — filter in WHERE and the denominator drifts to match whichever arm you kept. And 'completion share' must state its population: 52 of 103 over all sessions is the product read; 52 of 82 over stamped sessions is a different, larger number that will get quoted as the first if the denominators aren't printed. Funnel math is reconciliation math.",
      tag: "kpi",
    },
    {
      id: "duolingo-t22",
      q: "League promotion: top 3 advance. Two learners tie at the cut. Walk the three ways to cut, and what each does to the league.",
      a: "ROW_NUMBER <= 3 promotes exactly three, but the tie is broken arbitrarily — one learner advances on server order, and the loser's complaint is unanswerable because no rule exists. RANK <= 3 gives both tied learners rank 3 and promotes four — the accepted-overfill league, generous and defensible ('nobody lost to a coin flip'), but the league size wobbles. DENSE_RANK's numbering differs but the cut behaves the same way at the boundary — ties share a tier and both pass a tier-based gate. The deterministic third way: ROW_NUMBER with a stated tiebreak (ORDER BY xp DESC, created_at ASC — earlier session wins, printed beside the cut). What's forbidden is unstated arbitrariness: at Duolingo the cut rule ships in the memo next to the boundary, because two analysts with two tie rules is how league disputes start.",
      tag: "kpi",
    },
    {
      id: "duolingo-t23",
      q: "The batch fold is fast on 251 rows. What changes at production scale, and which instincts transfer?",
      a: "The shapes transfer; the margins don't. On the audit db, fold-then-join versus join-then-fold is a style choice; at billions of exercise events it's the SLA. The instincts: fold early (aggregate batches to session grain before joining, shrinking the fan-out from 251-row joins to 103), filter early but only when the filter is the stated definition (a status filter before a window rewrites the timeline — that's correctness, not just speed), and keep window partitions on indexed keys (learner id, then time — the sort inside OVER is the cost). COUNT(DISTINCT) is the expensive aggregate at scale — rolling distinct actives wants a day-bucket self-join or a pre-aggregated spine. And dedupe once, upstream: the keep-latest ROW_NUMBER pass on the ingest side is cheaper than every downstream query paying for retries. The habit that transfers from 251 rows to a billion: state the grain first — the wrong-grain query is slow AND wrong.",
      tag: "performance",
    },
    {
      id: "duolingo-t24",
      q: "The 08:15 streak board says one thing; the same query re-run at noon says another. No new sessions arrived. What class of problem is this and what's the policy?",
      a: "Restatement — late-arriving telemetry meeting a board that read an unfinished world. The sync lag is 2.98 days on average (2–4 range): a session can sit unstamped at 08:15, stamp by noon, and every fold it belongs to moves — the completion share, the cold tail, the streak walk. The policy: publish with a clock label. Figures carry 'as of' stamps and the watermark they were read at; boards don't silently overwrite history — the day's snapshot is kept so restatements are diffs, not rewrites. Queries that must be stable pin their own as-of predicate (created_at <= watermark) instead of trusting run time. And the analyst's tell: when two runs disagree, first check whether the world changed (late stamps) before suspecting the SQL — the sync lag makes 'the same query, different answer' the normal case, and the clock label is what keeps it from reading as a bug.",
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
    {
      id: "duolingo-mcq-11",
      prompt: "The morning board prints SELECT COUNT(*) - COUNT(shipped_at) FROM orders over the 103-session log. What is the unstamped-tail number it reads?",
      choices: [
        "21 — the unstamped tail",
        "82 — the stamped sessions",
        "103 — COUNT ignores NULLs",
        "7 — only abandoned sessions lack stamps",
      ],
      answer: 0,
      why: "COUNT(*) counts rows (103); COUNT(shipped_at) skips NULL stamps (82). The difference is the 21 unstamped sessions — 14 unfinished plus 7 abandoned — the exact tail the sync-lag report names.",
      notes: [
        { choice: 1, why: "82 is COUNT(shipped_at) itself — the subtraction's second operand, not the difference." },
        { choice: 2, why: "COUNT(*) counts 103 rows; only COUNT(column) skips NULLs." },
        { choice: 3, why: "Abandoned is 7; the unstamped tail also carries the 14 unfinished sessions." },
      ],
      difficulty: "easy",
    },
    {
      id: "duolingo-mcq-12",
      prompt: "The region census must print LATAM's cancelled count — LATAM ran 2 sessions, 0 cancelled. Which fold prints 0 instead of NULL?",
      choices: [
        "SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)",
        "SUM(CASE WHEN status = 'cancelled' THEN 1 END)",
        "COUNT(status = 'cancelled')",
        "MAX(CASE WHEN status = 'cancelled' THEN 1 END)",
      ],
      answer: 0,
      why: "The ELSE 0 arm gives the fold a zero for every non-cancelled row, so LATAM's all-zero population sums to 0. Drop the ELSE and the CASE yields NULL per row — SUM over all-NULLs returns NULL, and the census prints a hole instead of a zero.",
      notes: [
        { choice: 1, why: "No ELSE means NULL for every non-match — SUM of all-NULLs is NULL, not 0. This is the arm the ELSE exists to fix." },
        { choice: 2, why: "COUNT(status = 'cancelled') counts non-NULL results of a boolean — every row — printing 2, LATAM's session count." },
        { choice: 3, why: "MAX over an all-NULL CASE is NULL — a presence check, not a count." },
      ],
      difficulty: "medium",
    },
    {
      id: "duolingo-mcq-13",
      prompt: "The XP board stacks two arms: sessions with total >= 300 and sessions with total >= 400, combined with UNION. Why does the stacked total undercount?",
      choices: [
        "UNION dedupes whole rows, and every >= 400 session also appears in the >= 300 arm",
        "UNION caps the stack at two arms",
        "The arms sort differently and cancel out",
        "UNION requires the arms to have different column names",
      ],
      answer: 0,
      why: "UNION removes duplicate whole rows across arms. Every session clearing 400 also clears 300, so the overlap collapses into one copy and the stack loses the second arm's population. The census wanted UNION ALL.",
      notes: [
        { choice: 1, why: "UNION ALL is the fix — it appends without dedupe. The two-arm cap is invented." },
        { choice: 2, why: "Sort order never removes rows; the undercount is set-algebra dedupe." },
        { choice: 3, why: "UNION aligns columns by position, not name — and that's not what dropped the rows." },
      ],
      difficulty: "medium",
    },
    {
      id: "duolingo-mcq-14",
      prompt: "Anti-join by set ops: SELECT customer_id FROM orders EXCEPT SELECT customer_id FROM orders WHERE status = 'delivered'. In the declared mapping, who survives?",
      choices: [
        "Learners with sessions but no completed lesson",
        "Learners with completed lessons",
        "Every learner — EXCEPT keeps everything",
        "No one — EXCEPT with the same column always empties",
      ],
      answer: 0,
      why: "EXCEPT keeps the left set's rows that never appear in the right set: session-having learners minus delivered-having learners — the no-completion population the streak-freeze queue targets. Reversing the arms flips the answer.",
      notes: [
        { choice: 1, why: "That's the reverse direction — delivered-having learners minus the rest." },
        { choice: 2, why: "EXCEPT is a subtraction, not a union — rows present in the right arm drop out." },
        { choice: 3, why: "It empties only when the left set is a subset of the right — exactly what the query is testing." },
      ],
      difficulty: "medium",
    },
    {
      id: "duolingo-mcq-15",
      prompt: "A legacy backfill leaves one NULL customer_id in the session log. What does WHERE customer_id NOT IN (SELECT customer_id FROM orders WHERE status = 'delivered') return?",
      choices: [
        "Zero rows — the NULL poisons the whole NOT IN",
        "All rows except the NULL one",
        "Only the NULL row",
        "A syntax error — NOT IN can't take a subquery",
      ],
      answer: 0,
      why: "NOT IN is a chain of <> comparisons; anything compared against NULL yields UNKNOWN, never true. One NULL in the subquery makes every NOT IN test UNKNOWN and the result set empties. The house anti-join is NOT EXISTS or LEFT JOIN … IS NULL.",
      notes: [
        { choice: 1, why: "The NULL row isn't excluded — every row is. UNKNOWN isn't false, but it isn't kept either." },
        { choice: 2, why: "The NULL row is never returned by this predicate either — it fails the inner IN, so it fails the NOT IN." },
        { choice: 3, why: "NOT IN (SELECT …) is legal SQL; the failure is semantic, and silent." },
      ],
      difficulty: "hard",
    },
    {
      id: "duolingo-mcq-16",
      prompt: "Per-learner XP vs that learner's own mean: the analyst writes (SELECT AVG(total) FROM orders o2 WHERE o2.customer_id = o1.customer_id) inside the outer loop over 16 learners. How many times does the correlated subquery execute?",
      choices: [
        "16 — once per outer row",
        "1 — SQLite caches scalar subqueries",
        "103 — once per session",
        "251 — once per exercise batch",
      ],
      answer: 0,
      why: "A correlated subquery re-runs for every outer row it references — 16 learners, 16 executions, each computing that learner's own mean. A derived table with GROUP BY customer_id computes all 16 means in one pass and joins them back.",
      notes: [
        { choice: 1, why: "The cache claim only holds when the correlation is provably constant — a per-learner correlation re-runs per learner." },
        { choice: 2, why: "103 would be per-session correlation — this one correlates on customer_id, the 16-row grain." },
        { choice: 3, why: "The batch table never enters this query — the correlation is learner-grained." },
      ],
      difficulty: "medium",
    },
    {
      id: "duolingo-mcq-17",
      prompt: "A learner runs a lesson at 23:50 on Jan 5 and the next at 00:10 on Jan 6. What does julianday(next_at) - julianday(prev_at) read?",
      choices: [
        "About 0.0139 — 20 minutes in fractional days",
        "1.0 — one calendar day",
        "2.0 — two dates crossed",
        "NULL — julianday can't cross midnight",
      ],
      answer: 0,
      why: "julianday measures elapsed time: 20 minutes is 20/1440, about 0.0139 days. The calendar-day streak definition would call this a 1-day step; the 24-hour definition calls it a 0.0139-day gap. Same pair, two definitions — the board prints which clock it uses.",
      notes: [
        { choice: 1, why: "1.0 is the STRFTIME('%Y-%m-%d') bucket answer — a different definition than the julianday delta." },
        { choice: 2, why: "Days-crossed is a calendar count; julianday never rounds." },
        { choice: 3, why: "julianday handles any timestamp pair — the NULL claim is invented." },
      ],
      difficulty: "hard",
    },
    {
      id: "duolingo-mcq-18",
      prompt: "January's lesson-health slice: which predicate keeps every January 2024 session, timestamps included?",
      choices: [
        "created_at >= '2024-01-01' AND created_at < '2024-02-01'",
        "created_at BETWEEN '2024-01-01' AND '2024-01-31'",
        "STRFTIME('%Y-%m', created_at) = '2024-01' AND created_at <= '2024-01-31'",
        "created_at LIKE '2024-01%' AND created_at < '2024-01-31'",
      ],
      answer: 0,
      why: "The half-open interval [Jan 1, Feb 1) keeps the whole month. BETWEEN '2024-01-01' AND '2024-01-31' string-compares against midnight Jan 31 — every session later that day sorts above the bound and drops. The trend loses a day's tail and nobody notices.",
      notes: [
        { choice: 1, why: "The upper bound '2024-01-31' excludes '2024-01-31 14:22' — string compare, not date semantics." },
        { choice: 2, why: "The month function is right, but the <= '2024-01-31' bound re-introduces the same midnight trap." },
        { choice: 3, why: "LIKE is fine; the < '2024-01-31' bound still cuts Jan 31." },
      ],
      difficulty: "medium",
    },
    {
      id: "duolingo-mcq-19",
      prompt: "The rolling-7-day actives tile uses AVG(...) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) over the learner-day fold. A learner skipped three days mid-week. What breaks?",
      choices: [
        "The window spans 7 ROWS, which now reach back 10+ calendar days",
        "Nothing — ROWS and days are the same in a daily fold",
        "The window errors when days are missing",
        "The average skips the skipped days automatically",
      ],
      answer: 0,
      why: "ROWS counts rows, not days: with gaps, 7 rows reach 10+ calendar days back and the '7-day' average silently widens. The fix stages a calendar spine (every day present, zero-filled) so 7 rows = 7 days — then the frame means what it says.",
      notes: [
        { choice: 1, why: "Same only when the day grain is dense — a skipped day is exactly the case that breaks it." },
        { choice: 2, why: "Missing days don't error; the window just reaches further back than its label claims." },
        { choice: 3, why: "Nothing skips — the average includes whatever rows the frame captures, gap or no gap." },
      ],
      difficulty: "hard",
    },
    {
      id: "duolingo-mcq-20",
      prompt: "Running XP per learner: SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW). Two sessions share one timestamp. What happens at that step?",
      choices: [
        "The running total jumps by both sessions' XP — RANGE includes timestamp peers",
        "The running total adds one arbitrarily",
        "The query errors on the duplicate sort key",
        "The second session overwrites the first's contribution",
      ],
      answer: 0,
      why: "RANGE frames by value, and peers — rows equal on the ORDER BY key — are included together. The running total jumps by two sessions at once, which is honest to the tie but wrong if the board promises row-by-row accumulation. ROWS splits them but needs a tiebreak column to be deterministic.",
      notes: [
        { choice: 1, why: "That's ROWS behavior without a tiebreak — arbitrary and unreproducible." },
        { choice: 2, why: "Duplicate sort keys are legal in windows; no error is raised." },
        { choice: 3, why: "Windows never overwrite — they aggregate over frames." },
      ],
      difficulty: "hard",
    },
    {
      id: "duolingo-mcq-21",
      prompt: "League cut: top 3 promote. Two learners tie for the third-highest XP. The analyst filters WHERE rnk <= 3 on RANK() OVER (ORDER BY xp DESC). How many promote?",
      choices: [
        "4 — both tied learners carry rank 3",
        "3 — RANK breaks the tie",
        "5 — the tie doubles the cut",
        "The query errors — ties need a tiebreak",
      ],
      answer: 0,
      why: "RANK gives tied rows the same rank: both tied learners read 3, the filter keeps four, and the league overfills by one. ROW_NUMBER <= 3 promotes exactly three but picks the survivor arbitrarily; the business rule — deterministic tiebreak or accepted overfill — must be printed beside the cut.",
      notes: [
        { choice: 1, why: "RANK never breaks ties — that's its contract; DENSE_RANK wouldn't either." },
        { choice: 2, why: "The cut doubles only the tied position — 4, not 5." },
        { choice: 3, why: "It runs fine; the failure is a quiet overfill, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "duolingo-mcq-22",
      prompt: "League diamonds: NTILE(4) OVER (ORDER BY xp DESC) over the 16-learner log. How many learners land in the top diamond?",
      choices: [
        "4 — 16 learners tile into four groups of four",
        "3 — the promotion cut size",
        "16 — NTILE keeps every learner in tile 1",
        "It depends on the XP ties",
      ],
      answer: 0,
      why: "NTILE(4) divides the partition into four near-equal tiles: 16 learners means 4 per tile, tile 1 holding the top four by the ORDER BY. Ties at a tile boundary are split arbitrarily — NTILE is a bucketing tool, not a promotion rule.",
      notes: [
        { choice: 1, why: "3 is the promotion cut from the league memo — a different rule than NTILE's even split." },
        { choice: 2, why: "NTILE assigns every learner a tile from 1 to 4 — tile 1 stays size 4." },
        { choice: 3, why: "Tile sizes are fixed by the count; ties affect which learner lands where, not how many." },
      ],
      difficulty: "easy",
    },
    {
      id: "duolingo-mcq-23",
      prompt: "The MAU-style read: SELECT COUNT(DISTINCT customer_id) FROM orders over the full log. What prints?",
      choices: [
        "16 — every learner has at least one session",
        "103 — one per session",
        "15 — one learner never showed",
        "251 — the batch count leaks in",
      ],
      answer: 0,
      why: "All 16 learners have sessions on this db (never-ordered = 0), so the distinct-learner count is the full population, 16. COUNT(customer_id) would read 103 — the session count, not the learner count.",
      notes: [
        { choice: 1, why: "103 is the session count — the DISTINCT is the whole point of the read." },
        { choice: 2, why: "The db's never-ordered census is 0; no learner is missing from the log." },
        { choice: 3, why: "251 is the exercise-batch count from order_items — a different table entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "duolingo-mcq-24",
      prompt: "The census computes APAC's cancelled share — 3 of 37 sessions, printed 8.1 in the facts. Which expression reproduces it, and which silently zeroes it?",
      choices: [
        "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*)",
        "SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) * 100.0",
        "ROUND(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 2) * 100",
        "SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) * 100 / COUNT(*)",
      ],
      answer: 0,
      why: "Multiplying by the REAL 100.0 before the division forces float math: 3 becomes 300.0, and 300.0 / 37 = 8.1. Dividing first — 3 / 37 — is integer division in SQLite: 0, and the share prints 0. The 100.0 placement IS the metric.",
      notes: [
        { choice: 1, why: "Integer division happens first: 3/37 truncates to 0, and 0 * 100.0 stays 0." },
        { choice: 2, why: "The inner fold truncates to 0 before ROUND ever sees it." },
        { choice: 3, why: "3 * 100 = 300 (integer), 300 / 37 = 8 — integer division again, printing 8 where 8.1 belongs." },
      ],
      difficulty: "medium",
    },
    {
      id: "duolingo-mcq-25",
      prompt: "SELECT customer_id, total, COUNT(*) FROM orders GROUP BY customer_id runs without error in SQLite. What does total contain?",
      choices: [
        "An arbitrary total from somewhere in each learner's group — a Frankenstein row",
        "The learner's average total",
        "The learner's maximum total",
        "The learner's first chronological total",
      ],
      answer: 0,
      why: "SQLite allows bare columns alongside aggregates and picks an unspecified row's value — deterministic per build, guaranteed wrong per contract. Postgres errors on the same query. The fix is explicit: MAX(total), AVG(total), or join the fold back at learner grain.",
      notes: [
        { choice: 1, why: "That's a different aggregate — and the query didn't ask for one." },
        { choice: 2, why: "MAX is a guess; SQLite's pick is documented as arbitrary." },
        { choice: 3, why: "First-chronological needs ORDER BY inside an aggregate or a window — not this." },
      ],
      difficulty: "hard",
    },
    {
      id: "duolingo-mcq-26",
      prompt: "One-pass tail census: COUNT(*) FILTER (WHERE status IN ('pending', 'cancelled')) over the 103-session log. What prints?",
      choices: [
        "21 — the unstamped tail: 14 unfinished + 7 abandoned",
        "7 — only cancelled",
        "82 — the complement",
        "0 — FILTER can't take IN",
      ],
      answer: 0,
      why: "FILTER counts the rows where the predicate holds: 14 pending + 7 cancelled = 21 — exactly the sessions with no completion-sync stamp, the sync-lag report's missing denominator.",
      notes: [
        { choice: 1, why: "7 is the cancelled arm alone; the IN predicate captures both tail arms." },
        { choice: 2, why: "82 is the stamped complement — 103 minus this census." },
        { choice: 3, why: "FILTER takes any WHERE-shaped predicate; IN is standard." },
      ],
      difficulty: "easy",
    },
    {
      id: "duolingo-mcq-27",
      prompt: "The gap walk uses LAG(created_at, 1, created_at) — the third argument fills each learner's first session with its own timestamp. What does that do to the streak read?",
      choices: [
        "First sessions read as zero-gap — the cohort's true first-day behavior is masked",
        "First sessions error out",
        "Nothing — the default is NULL anyway",
        "Only the global first session changes",
      ],
      answer: 0,
      why: "The default makes every head row look like a same-instant repeat: gap 0, streak alive. The 16 first sessions stop being identifiable and the 'time since first session' read collapses. House policy: let LAG return NULL, count the heads, label them 'no previous'.",
      notes: [
        { choice: 1, why: "The default is a value, not an error — the harm is silent." },
        { choice: 2, why: "Without a third argument LAG returns NULL — the default explicitly replaces that." },
        { choice: 3, why: "Every learner's head row is filled — 16 rows, not 1." },
      ],
      difficulty: "medium",
    },
    {
      id: "duolingo-mcq-28",
      prompt: "A regional board runs RANK() OVER (ORDER BY xp DESC) over the joined session log and one learner from each region should top their region. What's missing?",
      choices: [
        "PARTITION BY region — the board ranked globally",
        "An index — windows need one to partition",
        "DENSE_RANK — RANK can't rank regions",
        "Nothing — ORDER BY c.region in the outer query fixes it",
      ],
      answer: 0,
      why: "Without PARTITION BY, the window is one partition: the whole log ranked as a single board, and every region's crown except the global top is absent. PARTITION BY region re-starts the rank per region — the leaderboard the memo asked for.",
      notes: [
        { choice: 1, why: "Indexes don't change window semantics — the single global partition is the bug." },
        { choice: 2, why: "RANK and DENSE_RANK both work with PARTITION BY; the function isn't the problem." },
        { choice: 3, why: "Sorting the output doesn't re-rank within regions — the ranks themselves are global." },
      ],
      difficulty: "easy",
    },
    {
      id: "duolingo-mcq-29",
      prompt: "A source feed starts writing dates as '2024-1-5' — no zero padding. Which month-bucket expression survives?",
      choices: [
        "STRFTIME('%Y-%m', created_at)",
        "SUBSTR(created_at, 1, 7)",
        "SUBSTR(created_at, 1, 4) || SUBSTR(created_at, 6, 2)",
        "created_at LIKE '2024-__'",
      ],
      answer: 0,
      why: "STRFTIME parses the date and normalizes: '2024-1-5' still buckets as 2024-01. SUBSTR is string surgery on position — the unpadded month shifts every slice, so January reads '2024-1' and the bucket grammar breaks exactly when the format does. Format drift is a data-quality event; the parse wins.",
      notes: [
        { choice: 1, why: "SUBSTR(1,7) reads '2024-1-' for unpadded months — the bucket breaks with the format." },
        { choice: 2, why: "Same string surgery, two cuts — the unpadded month lands in the wrong slice." },
        { choice: 3, why: "LIKE matches shape, not semantics, and '2024-1-' fails the two-character month pattern." },
      ],
      difficulty: "medium",
    },
    {
      id: "duolingo-mcq-30",
      prompt: "The completion share printed 50.5% (52 of 103) at 08:15. The afternoon re-run prints 79.6% on the same log, same day, no new sessions. Which definition drifted?",
      choices: [
        "The completed arm — 'shipped' practice-hub sessions joined it, 52 became 82",
        "The denominator — cancelled sessions left the population",
        "XP inflated the average",
        "The log re-sorted and RANK changed the count",
      ],
      answer: 0,
      why: "79.6 is 82 of 103 — the stamped population. The completed arm absorbed the practice-hub sessions: a definition change wearing a metric's clothes. The census grammar (52 + 30 + 14 + 7 = 103) is the audit: when one arm eats another, the reconciliation is the first place it shows.",
      notes: [
        { choice: 1, why: "Dropping cancelled would make the denominator 96 and the share about 54.2 — not 79.6." },
        { choice: 2, why: "XP never enters a completion share — wrong axis entirely." },
        { choice: 3, why: "Sort order can't change a COUNT — the arm definition is the only lever that moves 52 to 82." },
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
    {
      id: "cs-duolingo-3",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The regional streak-health board",
      brief:
        "Growth board memo: the regional tile needs the streak-health fold rebuilt — sessions, learners and XP per learner region, gated and ordered. Mapping declared: orders are learning sessions, totals are XP, customers are learners, regions are the four learner regions. Probed census: **EU 45 sessions / 8 learners / 15,089.23 XP (335.32 avg)**, **APAC 37 / 5 / 11,605.45 (313.66)**, **US 19 / 2 / 7,286.16 (383.48)**, LATAM 2 / 1 / 852.44 (426.22). The memo fixes the floor at **19 sessions** — regions below the line stay off the tile — and the read as *average XP per session*, biggest first: the US punches above its session weight and the board must show it.",
      ask: "Return each region clearing the 19-session floor with session count, distinct learners, XP fold (2 decimals) and average XP per session (2 decimals), ordered by average XP descending.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS sessions,\n       COUNT(DISTINCT o.{1}) AS learners,\n       ROUND(SUM(o.total), 2) AS xp,\n       ROUND(AVG(o.total), 2) AS avg_xp\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {2}\nORDER BY {3}(o.total) DESC;",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the learner key",
          why: "Learners are COUNT(DISTINCT o.customer_id) — the distinct-learner read, not a repeat of the session count. o.id collapses learners into sessions (19/45/37 on this board), o.product_id has no such column on orders, and anything else breaks the join's grain promise.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the session floor",
          why: "The memo fixes the floor at 19 — exactly the US arm's session count, so the gate keeps EU (45), APAC (37) and US (19) and drops LATAM's 2-session row. 2 waves everyone through; 37 drops the US arm the floor was sized to keep.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the health metric",
          why: "The board reads average XP per session — AVG(o.total), which puts the US (383.48) above EU (335.32) and APAC (313.66). SUM re-sorts to EU-first (15,089.23 tops the fold) and hides the punch-above-weight story; COUNT re-sorts to session volume.",
        },
      ],
      distractors: ["product_id", "id", "region", "2", "37", "SUM"],
      walkthrough:
        "Fold at region grain, gate, then order by the health metric. The join is sessions-to-learners on customer_id; GROUP BY c.region folds 103 sessions to four rows; the HAVING gate at 19 keeps EU (45 sessions / 8 learners / 15,089.23 / 335.32), APAC (37 / 5 / 11,605.45 / 313.66) and US (19 / 2 / 7,286.16 / 383.48), dropping LATAM (2 sessions, 852.44). ORDER BY AVG(o.total) DESC prints US, EU, APAC — the point of the tile: the US runs the fewest kept sessions but the richest, 383.48 against APAC's 313.66. COUNT(DISTINCT o.customer_id) is the learner arm (8 / 5 / 2), not a repeat of the session count. product_id has no such column on orders; id collapses learners into sessions (19/45/37); region isn't on orders; a floor of 2 keeps LATAM, 37 drops the US; SUM orders the board EU-first and buries the story. The gate and the metric are two different decisions — the memo fixes both so two analysts can't ship two boards.",
    },
    {
      id: "cs-duolingo-4",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The cold-transition walk",
      brief:
        "Retention memo: the streak team wants the cold-transition census — for each learner, the gap to their previous session in days, and how many transitions cross the {rose:1.0-day cold line} (the 24-hour wall). Mapping declared: orders are learning sessions. Probed facts: **103 sessions across 16 learners**, so the walk carries **16 first sessions** with no previous (NULL, labeled — never zero), and the sync context is the **82-of-103 stamped** board with its **2.98-day average**. The memo fixes the cold line at **1.0 days** and the walk ordered by session time, partitioned per learner. Deterministic read: learners, first sessions, then cold transitions.",
      ask: "Return one row: distinct learners on the walk, first sessions (no previous), and sessions whose gap to the previous session exceeds 1.0 days.",
      template:
        "WITH walk AS (\n  SELECT customer_id,\n         created_at,\n         {1}(created_at) OVER (PARTITION BY {2} ORDER BY created_at) AS prev_at\n  FROM orders\n)\nSELECT COUNT(DISTINCT customer_id) AS learners,\n       COUNT(CASE WHEN prev_at IS NULL THEN 1 END) AS first_sessions,\n       SUM(CASE WHEN julianday(created_at) - julianday(prev_at) > {3} THEN 1 ELSE 0 END) AS cold_transitions\nFROM walk;",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the look-back",
          why: "The walk compares each session to the PREVIOUS one — LAG(created_at). LEAD looks forward: every gap flips negative, the cold census collapses to 0, and first_sessions silently starts counting last sessions instead. ROW_NUMBER and DENSE_RANK take no argument here and error out.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the partition key",
          why: "Per-learner timelines mean PARTITION BY customer_id — 16 partitions, 16 first sessions. Partitioning by region errors (no such column on orders); partitioning by created_at dissolves the per-learner grain and the head count stops reading 16; id isn't on the walk at all.",
        },
        {
          answer: "1.0",
          kind: "number",
          noVerify: true,
          label: "the cold line",
          why: "The memo fixes the cold line at 1.0 days — the 24-hour wall in fractional-day units (julianday deltas). 0.5 flags sub-day stumbles as cold and pads the census (87 vs the probed 86); 3.0 starves it (82) and hides the 82-to-86 band. The line is a definition, printed next to the count.",
        },
      ],
      distractors: ["LEAD", "created_at", "ROW_NUMBER", "id", "0.5", "3.0"],
      walkthrough:
        "Stage the walk, then fold it. The CTE walks each learner's sessions in time order — LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) — and julianday deltas turn timestamps into fractional days. The outer fold reads the probed board: 16 learners, 16 first sessions (each partition's head has no previous — NULL is a state, labeled), and 86 cold transitions at the 1.0-day line on this window. LEAD inverts every gap — the census collapses to 0 and 'first sessions' starts counting last sessions, same 16, wrong meaning; partitioning by created_at dissolves the per-learner grain (the head count stops reading 16); id isn't on the walk; 0.5 pads the census to 87, 3.0 starves it to 82. The 16 first sessions are the audit's anchor: a walk whose head count isn't 16 has silently lost a learner.",
    },
    {
      id: "cs-duolingo-5",
      tier: "medium",
      topic: "s6",
      universe: "month-close",
      title: "The content-spend census",
      brief:
        "Month-close memo: finance wants the content & infra spend census bucketed in one pass — fixed studio cost, growth marketing, everything else — with honest dollars from INTEGER cents. Probed ledger: **Rent 14 lines / 16,800**, **Ads 14 / 4,570**, Travel 3 / 2,521, Tools 5 / 1,525 (cents ÷ 100.0 at the display edge). The memo fixes the buckets — `Rent` → fixed, `Ads` → growth, ELSE tooling — and the census floor at **14 lines**, so the tooling bucket (8 lines folded from Travel + Tools) stays off the detail rows while its cents still sit in the ledger. One pass, one population, buckets that reconcile.",
      ask: "Return each spend bucket clearing the 14-line floor with its line count and dollar fold (2 decimals), biggest dollars first.",
      template:
        "SELECT CASE WHEN category = {1} THEN 'fixed'\n            WHEN category = {2} THEN 'growth'\n            ELSE 'tooling' END AS bucket,\n       COUNT(*) AS lines,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS spend_dollars\nFROM expenses\nGROUP BY bucket\nHAVING COUNT(*) >= {3}\nORDER BY spend_dollars DESC;",
      slots: [
        {
          answer: "'Rent'",
          kind: "keyword",
          label: "the fixed bucket key",
          why: "Fixed studio cost is category 'Rent' — 14 lines folding to 16,800 dollars. Lowercase 'rent' matches nothing in this ledger and silently empties the bucket into tooling; 'Travel' re-keys the bucket to 3 lines and the census stops reconciling.",
        },
        {
          answer: "'Ads'",
          kind: "keyword",
          label: "the growth bucket key",
          why: "Growth marketing is category 'Ads' — 14 lines, 4,570 dollars. 'Tools' would re-key growth to 5 lines and fold Ads into tooling; 'vendor' compares the wrong column (vendor names are never 'Ads') and the bucket dies.",
        },
        {
          answer: "14",
          kind: "number",
          label: "the census floor",
          why: "The memo floors the census at 14 lines — exactly the fixed and growth arms' count, so tooling (8 folded lines) stays off the detail rows. 3 or 5 waves tooling through; 15 empties the census entirely.",
        },
      ],
      distractors: ["'rent'", "'Travel'", "'Tools'", "'vendor'", "3", "15"],
      walkthrough:
        "One pass, three buckets, cents divided once. The CASE maps Rent to fixed (14 lines, 16,800.00), Ads to growth (14 lines, 4,570.00) and everything else to tooling (8 lines, 4,046.00 — Travel's 2,521 plus Tools' 1,525). The 14-line floor keeps the two named arms on the detail rows and leaves tooling in the ledger, on purpose — the memo's reconciliation is 16,800 + 4,570 + 4,046 = 25,416 across all 36 lines. GROUP BY bucket folds by the CASE's alias; ORDER BY spend_dollars DESC keeps the big arm on top. Lowercase 'rent' or a vendor-keyed match empties fixed into tooling (22 lines, 20,846.00 — the census lies by folding); gates of 3 or 5 print the tooling row the memo floored; 15 ships an empty tile. The division is amount_cents / 100.0 at the display edge, house style — integer dollars are coincidence-proof, and the day an odd-cent line lands, the divide-by-100 fold would truncate.",
    },
    {
      id: "cs-duolingo-6",
      tier: "hard",
      topic: "q5",
      universe: "funnel",
      title: "The lesson-start-to-finish funnel",
      brief:
        "Curriculum memo: the lesson-start-to-finish funnel needs its population math rebuilt from the fold up — one row per learner first, then the book-level shares. Mapping declared: orders are learning sessions, `delivered` is a completed lesson. Probed funnel: **103 sessions started by 16 learners, 52 finished as completed lessons — a 50.5% completion share**, the exits splitting 30 practice-only / 14 unfinished / 7 abandoned. The memo fixes the share at one decimal and the multiplier at 100.0 — integer division rounds the funnel to a lie — and wants the per-learner fold staged as a derived table so the learner count is a cell, not an afterthought.",
      ask: "Return one row: learners who started, sessions started, lessons completed, and the completion share in percent to one decimal, staged through a per-learner fold.",
      template:
        "WITH per_learner AS (\n  SELECT customer_id AS learner,\n         COUNT(*) AS started,\n         SUM(CASE WHEN status = {1} THEN 1 ELSE 0 END) AS completed\n  FROM orders\n  GROUP BY {2}\n)\nSELECT COUNT(*) AS learners,\n       SUM(started) AS sessions_started,\n       SUM(completed) AS lessons_completed,\n       ROUND({3} * SUM(completed) / SUM(started), {4}) AS completion_pct\nFROM per_learner;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed arm",
          why: "A completed lesson is status 'delivered' — 52 of 103 sessions. 'shipped' is the practice-hub arm (the funnel would print 29.1%), 'pending' the unfinished arm (13.6%), and a wrong-case literal folds every arm to zero and the share to 0.0.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the fold grain",
          why: "The fold is one row per learner — GROUP BY customer_id stages 16 rows. GROUP BY id folds to one row per session (103 learners of one session each), GROUP BY status dissolves to four arms, and region isn't on orders.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the percent base",
          why: "The multiplier is 100.0 — a REAL. 100 (integer) makes 100 * 52 / 103 integer division and prints 50; 10.0 prints 5.0; 1000.0 prints 504.9. The memo fixes 100.0 so the share reads 50.5.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the decimal place",
          why: "One decimal, per the memo — ROUND(x, 1) prints 50.5. Zero digits prints 50, two prints 50.49; the funnel's precision is a printed definition, not a rounding mood.",
        },
      ],
      distractors: ["'shipped'", "'pending'", "id", "region", "100", "10.0"],
      walkthrough:
        "Stage the fold, then share it. The derived table folds 103 sessions to 16 learner rows — started and completed per learner — and the outer query rolls the book: 16 learners, 103 sessions started, 52 lessons completed, 50.5% completion share on one row, the funnel's population math in cells rather than prose. The exits reconcile in the census grammar: 30 practice-only + 14 unfinished + 7 abandoned = 51 exits against 52 finishes. 'shipped' re-keys the funnel to the practice arm (29.1%); folding by id triples the learner count to 103 and quietly keeps the share — the population cell is the tell. 100 instead of 100.0 integer-divides the share to 50; 10.0 re-scales it to 5.0. A funnel whose learner cell isn't 16 has been folded at the wrong grain — the share can look right while the population is fiction.",
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
    { slug: "game-play-analysis-v", why: "First-session cohorts: who logged a session the day after their first — the D1 habit census the streak board opens with, folded per install date." },
    { slug: "active-users", why: "Streak runs over the activity log — the consecutive-active-period read that decides which learners get the streak-freeze nudge." },
    { slug: "report-contiguous-dates", why: "Contiguous practice days as islands — the gaps-and-islands shape behind the streak-length distribution, with the period start/end printer." },
    { slug: "find-students-with-study-spiral-pattern", why: "Spiral study patterns via windows — the persistent-but-broken practice rhythm the curriculum team calls an oscillating learner." },
    { slug: "immediate-food-delivery-ii", why: "First-session completion share — sessions whose lesson finished the day they started, the funnel's top step with its first-order denominator." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each learner's favorite lesson pack — the argmax-window read that personalizes the practice hub's pack shelf." },
    { slug: "last-person-to-fit-in-the-elevator", why: "Cumulative XP within a league week — the running-sum gate that decides who clears the promotion zone before the week closes." },
    { slug: "students-and-examinations", why: "Learners who sat every exam in the unit — relational division, the perfect-attendance read curriculum ships per unit." },
    { slug: "movie-rating", why: "Two boards, one stack — the UNION of top-by-XP and top-by-streak boards, column-alignment discipline included." },
    { slug: "mrr-waterfall", why: "Super MRR movement waterfall — new, expansion, contraction, churn classified by LAG, the subscription board finance reads monthly." },
    { slug: "net-revenue-retention", why: "Super cohort NRR — does a signup month's billing grow or shrink as streaks lapse, the retention-revenue fold." },
    { slug: "email-engagement-funnel", why: "Nudge-to-lesson funnel — email opens to clicks to session starts, the funnel pivot with per-step rates the growth pod reads weekly." },
    { slug: "feature-adoption-windows", why: "Streak-freeze adoption windows — who adopts the freeze feature after a near-miss, conditional averages over adoption windows." },
    { slug: "user-purchase-platform", why: "Cross-platform goal consistency — learners hitting their daily goal on app and web the same day, the hard streak-window read." },
    { slug: "find-users-with-persistent-behavior-patterns", why: "Persistent practice patterns via gaps-and-islands — the hard read behind 'is this learner actually streaking or just noisy'." },
    { slug: "duplicate-charge-pairs", why: "Duplicate Super charges inside a window — the self-join fraud pairs the billing team sweeps before month-close." },
  ],
};
