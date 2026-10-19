// Pinterest — kit 7 of the Streaming & Social domain (Batch D).
// The visual-discovery company: save/repin loops, board curation and the
// discovery-to-click funnel its data teams live in. Pool provenance: Pinterest
// has 0 tagged LC rows in the registry pools — ALL 16 problem slots and every
// topic slug are theme-curated from the SQL band's discovery-shaped material
// (argmaxes, funnel CASE folds, ratio reads, pair graphs, trend buckets),
// stated per spec. Case studies run on db/custom.db with probed figures from
// scripts/company-facts.md (orders = discovery sessions, orders.status =
// session outcome, orders.total = dwell seconds, customers = users, regions =
// home-feed cohorts, order_items = save/repin events, products = pins,
// product categories = boards — mappings declared in-world, no invented
// telemetry numbers).
//
// Expansion (Task 92-d-pinterest, 3x spec, append-only): brief 4→6 paras,
// dayInLife 4→5 beats, metrics 8→12, topics 10→15, theory 8→24 (pin-t9..t24),
// mcqs 10→30 (pin-mcq-11..30, difficulty 3/4/3 easy-medium-hard per fresh 10,
// coached distractor notes on every item), cases 2→6 (cs-pin-3..6 — topic
// families j7 + t7 + q2 + x2, all four new vs the kit's existing t6/s6 pair
// and vs each other), problems 16→32. Pinterest still has 0 tagged LC rows in
// the registry pools — the 16 new problem slots and 15 new topic slugs are
// theme-curated from the SQL band's theme menu, stated per spec. New in-world
// mappings declared with the entries that use them: suppliers = pin-source
// studios, products.price = paid-promotion budget, invoices/payments = ad
// billing recorded in INTEGER cents (dollar prints divide by 100.0 once, at
// the display edge).

import type { CompanyKit } from "../types";

export const pinterestKit: CompanyKit = {
  id: "pinterest",
  domainId: "media",
  name: "Pinterest",
  tagline: "Visual discovery: pins, boards and save funnels",
  accent: "text-rose-200",

  brief: [
    "Pinterest is the visual discovery engine — the company whose unit of intent is not the search or the scroll but the **save**: a user pinning an idea to a board is a declared future self, and the whole product is a machine for closing the distance between saving an idea and acting on it. The unit of analysis is the **discovery session**, stamped with a user, an outcome — {emerald:clicked through}, saved to board, lingered, {rose:dismissed} — and a dwell time. Everything the business decides — which boards get curated, which pins trend, where the feed's ranking wins — hangs on queries that fold save events into repin loops and loops into **discovery-to-click funnels**. The SQL reality is funnel- and curation-shaped: the questions that decide the feed are 'what share of sessions converts to a click' and 'which pin carries each board'.",
    "The data org runs three engines. Feed ranking analytics reads the outcome census — sessions by stage, with shares that must reconcile to 100 and a stated population, because *a funnel whose denominator drifted is just a mood board*. Board curation works the argmax: **per-board top pins** by repins, curated rails per interest vertical, and the tie conversations that come with any leaderboard. And the experimentation group reads save-loop tests where the metric is defined in SQL before the test ships — repin rate, click-through share, dwell — each with a 'per what?' answered in the query, not in the meeting.",
    "Interview screens are funnel- and window-heavy. A typical loop opens with a fold (saves per user per week, repins per board), escalates into a **per-board argmax** — the most-repinned pin per category, the latest save per user — and lands on either a CASE-driven {violet:funnel census} (clicked-through / repinned / lingered / dismissed with honest shares) or a ratio read where the denominator choice is the entire test. The follow-ups are definition probes: 'is that share of sessions or of users?', 'what happens to a board with one pin?', 'does a dismissed session count in the denominator?'. Candidates who narrate the partition and the population before writing the window consistently outperform.",
    "Preparation strategy: Pinterest has **zero tagged registry problems**, so this kit is theme-curated end to end — 32 discovery-shaped SQL problems chosen to mirror the company's known question themes: curation argmaxes, funnel CASE folds, ratio discipline, repin loops, co-save pair graphs and trend buckets. Do the topics in order, then run all six case studies on the live storefront db — built for spaced practice rather than one sitting: one rebuilds the {emerald:board-curation argmax} (a partitioned ROW_NUMBER over pins and boards), another rebuilds the {violet:save-funnel census} (a CASE fold whose shares must reconcile to 100). The storefront mapping is declared, not hidden — orders are discovery sessions, order totals are dwell seconds, categories are the seven tracked boards — because making the stand-in explicit is itself the habit Pinterest's screens reward.",
    "The money side runs on the same discipline. Pinterest's ad bills live in the `invoices` and payments tables, recorded as INTEGER cents — **28 bills on the books, 21 settled for 66,443.00 against 6 open worth 19,609.00**, one {rose:void} at 925.00 — and every dollar print divides by 100.0 exactly once, at the display edge. The billing desk reads method mix — **16 card bills for 37,364.00 against 11 wires for 32,248.00**, the self-serve-versus-managed split — and settlement latency: 28.4 days average issue-to-payment, fastest 13, slowest 84. *The reconciliation reflex comes free here*: the verified anomaly ledger (a void-but-paid bill, a paid-no-receipt bill, a partial at 4,000 of 6,148) is the same claims-versus-evidence muscle every month-close needs, run as a fold, not a feeling.",
    "Round two goes deeper, and the kit's expansion mirrors it. Beyond the argmax and the funnel census sit the {violet:window frames} — running dwell totals across the 14-month trend, where RANGE and ROWS frames disagree — the {sky:audience algebra} of set ops (clicked-through ∪ saved, minus the dismissed), the subquery shapes that put a **house-average line** beside every board, and the {orange:cents folds} that keep billing honest. Four more case files carry it: a pin-source studio census (j7), a save-loop gap audit on LEAD (t7), boards riding above the promotion-budget line (q2), and the one-pass billing reconciliation (x2). *Do them in order — each assumes the discipline the last one built.*",
  ],

  dayInLife: [
    "**08:45 —** The discovery pulse. The analyst opens the feed dashboards: sessions by outcome, and — the number that gates the morning — the {emerald:click-through share}: **52 of 103 sessions clicked through, 50.5%**, with the {rose:dismissal share} (7 sessions, 6.8%) beside it as the early-warning line. The first query of the day is the outcome census: one CASE fold, four stages, shares that sum to 100 over the stated population. A dismissal spike is the day's first fire, and the analyst who can isolate WHICH cohort and WHICH board the dismissals cluster in — before the ranking team pings — owns the standup.",
    "**11:30 —** Curation deep work. A board lead wants the **most-repinned pin per board** for the curated rails — a partitioned argmax where a single-pin board must still get a row; growth wants the {violet:repin loop} read (users whose saves came back within seven days); an experiment read needs the dwell average — **338.19 seconds per session** — restated with its population, because the mean moves when lingering sessions are excluded. Each ask is a window, a conditional aggregate and an argument about grain — sessions versus users, saves versus repins. The query gets written twice: once to answer, once with the definition printed beside it.",
    "**15:00 —** Stakeholder cycles. The curation review: **47 repins on the Accessories board's top pin against 27 on Fitness** — and the conversation about whether a thin board earns a rail slot. Ranking gets the outcome census cut by home-feed cohort (the biggest cohort runs **45 sessions from 8 users**); the trends team gets the month-bucketed save calendar with the **January peak of 3,731.97 seconds** of dwell on the books. The afternoon's job is closing loops: yesterday's dismissed-heavy board becomes next week's ranking tweak, and every list that leaves the desk carries its grain with it.",
    "**17:30 —** The writeup ritual. The EOD note is one screen: which board's top pin moved, which funnel stage drifted, which experiment read survived the denominator question. Query definitions get pinned next to the numbers — the ranking team re-runs them blind, so the SQL is the contract. The best-prepared candidate knows the rhythm: Pinterest SQL exists to defend **funnel numbers under population stress**, and the CASE fold plus the partitioned argmax are the tools the defense is built with.",
    "**20:15 —** The billing close assist. Month-end pulls the analyst into the ad-billing ledger, and the shape is the day's third census: one pass with FILTER arms prices the book — **28 bills, 21 paid for 66,443.00, 6 open worth 19,609.00** — and the sweep pulls the one {rose:void} at 925.00 plus the broken rows: a void-but-paid bill and a paid-no-receipt bill, each a status claiming something the payments fold never confirmed. The six open bills go to the AR chase list — one already partial at 4,000 of 6,148, so 'open' and 'untouched' are different arms, and the census knows. *The finance partner reads this number every close*, and the query — staged in a CTE named covered, one row per bill, payment evidence folded beneath it — is the definition of 'settled' the whole company inherits.",
  ],

  metrics: [
    { name: "Click-through share", what: "Sessions that clicked through ÷ all sessions — 52 of 103 (50.5%) here. The funnel's headline, a conditional SUM over the full population with the denominator stated before the division." },
    { name: "Save rate", what: "Sessions that ended in a save ÷ all sessions — 30 of 103 (29.1%). The declared-intent signal the whole product optimizes for, always read beside click-through." },
    { name: "Dismissal share", what: "Dismissed sessions ÷ all sessions — 7 of 103 (6.8%). The early-warning line: rising dismissal is the feed's first honest signal that curation drifted." },
    { name: "Board-curation argmax", what: "Most-repinned pin per board — 47 on Accessories down to 27 on Fitness. The metric this kit's first case computes end to end, one row per board regardless of pin count." },
    { name: "Repin loop depth", what: "Saves that trigger downstream repins per user — the loop that separates browsing from collecting. Counted with conditional aggregation so the user denominator never drifts." },
    { name: "Dwell seconds", what: "Average seconds per discovery session — 338.19 here (range 25.47 to 1,088.44). The engagement-intensity read whose population rule (lingering sessions in or out) is the interview." },
    { name: "Feed cohort breadth", what: "Sessions and distinct users per home-feed cohort — 45 sessions from 8 users in the biggest. The concentration read that keeps a power user from impersonating a trend." },
    { name: "Save-loop latency", what: "Days from first save to the follow-through session, via LAG over the user partition — the window metric that measures how fast intention becomes action." },
    { name: "Closed-session share", what: "Sessions carrying an end stamp ÷ all sessions — 82 of the 103 here, with the other 21 open by definition, not missing. The count that forces the 'per what?' question before every dwell average ships." },
    { name: "Dwell concentration", what: "Share of lifetime dwell held by users past 3,000 seconds — 63.5% here, 71.2% past 2,000. The power-user lens that keeps a handful of collectors from impersonating a trend." },
    { name: "Ad-bill settlement days", what: "Days from invoice issue to payment over paid bills — 28.4 average, fastest 13, slowest 84. The billing-ops clock that decides when open AR gets escalated instead of waited on." },
    { name: "Billing method mix", what: "Card bills versus wire bills — 16 for 37,364.00 against 11 for 32,248.00. The self-serve/managed split that frames every revenue-mix conversation the ads org has." },
  ],

  topics: [
    {
      name: "Folding the save log",
      why: "Everything at Pinterest starts by folding the session log: saves per user per week, sessions per board, repins per pin. The screens warm up with GROUP BY + HAVING at event scale, and the trap is always the same — counting event rows when the business object is a person. The followers census is this fold with a social accent.",
      slugs: ["unique-orders-and-customers-per-month", "find-followers-count", "article-views-ii"],
    },
    {
      name: "Board-curation argmax",
      why: "The curated rails hang on per-board argmaxes: the most-repinned pin per category, the latest save per user, the top pin per vertical. MAX-joined-back breaks on ties; the surviving answer is a partitioned ROW_NUMBER with a deterministic tie-break. The most-recent-orders-per-product drill is this exact grammar, and the single-pin board edge case is the follow-up.",
      slugs: ["the-most-recent-orders-for-each-product", "bikes-last-time-used", "highest-grade-for-each-student"],
    },
    {
      name: "Save-funnel CASE census",
      why: "Session outcome is a funnel: clicked-through, repinned, lingered, dismissed — and the census must reconcile to 100 over a stated population. CASE-driven conditional SUMs are the grammar, with two classic traps: filtering the stage in WHERE (denominator drift) and letting the ELSE arm swallow a stage. The trio covers the day-one share fold, the per-surface ratio and the classification wall.",
      slugs: ["immediate-food-delivery-i", "ads-performance", "weather-type-in-each-country", "percentage-of-users-attended-a-contest", "classes-more-than-5-students", "customer-order-frequency", "group-sold-products-by-the-date", "count-salary-categories"],
    },
    {
      name: "Discovery-to-click ratios",
      why: "The feed's core rates are ratios with teeth: click-through share, save rate, follow-through per impression. Each is a denominator argument before it is a number — the 100.0-before-division fix, the NULL-coalesce zero-fill and the honest per-impression base are drilled until they are reflexes, because a funnel whose denominator drifted reads exactly as healthy as one that didn't.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "friend-requests-i-overall-acceptance-rate"],
    },
    {
      name: "Repin loops & repeat saves",
      why: "A save that returns — a repin within days, a second save of the same idea — is the loop the product lives on. These problems drill repeat behavior: repeat-purchase rate as the repin-rate twin, two-saves-within-seven-days as the burst detector, same-day events as the loop's fastest edge. The window and self-join grammar here powers every loop metric Pinterest reports.",
      slugs: ["repeat-purchase-rate", "users-with-two-purchases-within-seven-days", "same-day-sale"],
    },
    {
      name: "Trending pins & time buckets",
      why: "Trends are bucketed folds: the month-bucketed save calendar (14 months, January's 3,731.97-second dwell peak against July's 1,193.86 trough), last-touch recency folds, and the tokenizer reads that surface what users actually save. The year-collision trap — month-only buckets folding two Februaries — is the follow-up that ends loops.",
      slugs: ["monthly-transactions-i", "the-latest-login-in-2020", "find-trending-hashtags"],
    },
    {
      name: "Leaderboards & tie math",
      why: "Top pins by repins, top boards by sessions, the second-most-saved pin per user — Pinterest reporting is leaderboard reporting, and ties are everywhere when pins cluster near the same count. RANK, DENSE_RANK and ROW_NUMBER are drilled until the 1,2,3,4,4,6 gap semantics are a spoken reflex, and the LIMIT-versus-rank-filter conversation is rehearsed out loud.",
      slugs: ["rank-scores", "top-five-artists", "group-employees-of-the-same-salary", "biggest-window-between-events", "running-total-for-different-genders", "department-highest-salary"],
    },
    {
      name: "Sparse-board anti-joins",
      why: "The empty-result discipline: boards with no saves in a window, pins never repinned, users who browse but never save. The anti-join shape (LEFT JOIN + IS NULL, or NOT EXISTS) matters even where this db returns zero never-saved pins — the day the count isn't zero is the day the query is already written, and the WHERE-on-right-column collapse is the trap that hides it.",
      slugs: ["sellers-with-no-sales", "unpopular-books", "number-of-accounts-that-did-not-stream", "project-employees-iii", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "Co-save pairs & graphs",
      why: "Recommendation rails hang on pair reads: pins saved together, users who share board taste, canonicalized pair keys that survive self-join fan-out. These problems drill the co-occurrence grammar — least/greatest pair keys, shared-count gates, symmetric dedupe — that turns a save log into a 'more like this' column.",
      slugs: ["find-product-recommendation-pairs", "all-the-pairs-with-the-maximum-number-of-common-followers", "symmetric-pairs"],
    },
    {
      name: "Feed experiments & denominators",
      why: "Pinterest ships feed changes behind experiments, and the reads are ratio tests: conversion lift between arms, sample-ratio checks that catch broken traffic splits, stickiness ratios over trailing windows. Each is a denominator story — the arm split checked BEFORE the lift is computed is the habit that separates a shipped decision from a shipped bug.",
      slugs: ["ab-test-conversion-lift", "ab-sample-ratio-mismatch", "dau-wau-stickiness"],
    },
    {
      name: "Window frames & rolling reads",
      why: "The trend desk lives beyond ROW_NUMBER: running dwell totals across the 14-month save calendar, rolling averages that smooth a spiky log, cumulative pacing for experiments. Frames are where windows get honest — the default RANGE frame quietly merges rows that share an ORDER BY value, and a running total that double-counts tied rows is wrong in a way nobody catches on stage. These three drill frame choice and the cumulative grammar until the defaults are a decision, not an accident.",
      slugs: ["restaurant-growth", "find-cumulative-salary-of-an-employee", "rolling-average-steps"],
    },
    {
      name: "NULL drills & fallback policy",
      why: "Open sessions carry no dwell, unmatched rows carry NULL payloads, and every fallback is a policy decision: COALESCE to zero fabricates engagement, filtering silently shrinks the population. The kit's first NULL theory said 'report, then decide'; these problems drill the mechanics — NULL-safe filters, COUNT(col) versus COUNT(*), the LEFT-JOIN NULL arm — that make the policy implementable without lying.",
      slugs: ["find-customer-referee", "books-with-null-ratings", "analyze-subscription-conversion", "second-day-confirmation", "user-activity-for-the-past-30-days-i", "create-a-session-bar-chart", "fix-product-name-format", "keep-latest-dedupe", "null-blank-audit"],
    },
    {
      name: "Audience algebra & set ops",
      why: "Growth questions are set questions: users who clicked through OR saved, the treatment audience EXCEPT the control, the overlap of two board-interest cohorts. UNION versus UNION ALL, stacked reports and set chains drill the column-shape contract — same columns, same order, compatible types — and the dedupe cost nobody prices until the audience board counts a user twice.",
      slugs: ["movie-rating", "monthly-transactions-ii", "team-scores-in-football-tournament"],
    },
    {
      name: "Subquery shapes & the house line",
      why: "Every benchmark needs a comparison target computed over the whole population — the house average no GROUP BY can carry. Scalar subqueries in WHERE, derived tables staged in FROM, and the nested-average pattern (you cannot average an average) are the three shapes; the second-highest drill is the screen's favorite because it breaks on ties and on empty sets at the same time.",
      slugs: ["second-highest-salary", "market-analysis-i", "orders-with-maximum-quantity-above-average"],
    },
    {
      name: "Cents folds & billing arithmetic",
      why: "The billing tables are INTEGER cents, and the fold is where money goes to die: a bare /100 floors the moment a sub-dollar amount lands, /100.0 preserves, and ROUND belongs once, at the display edge. Weighted averages across date ranges, conditional-SUM trial balances and general-ledger reconciliation drill the exact arithmetic the ads-finance close runs — divide in REAL space, reconcile always, never let a missing payment read as zero dollars.",
      slugs: ["average-selling-price", "trial-balance-check", "gl-reconciliation"],
    },
  ],

  theory: [
    {
      id: "pin-t1",
      q: "The curation rail needs the most-repinned pin per board. Walk me through the window you'd write — and why MAX-joined-back is the wrong first answer.",
      a: "The shape is a per-board argmax: ROW_NUMBER() OVER (PARTITION BY category ORDER BY SUM(quantity) DESC, product_id) = 1 over a pre-folded save log. Three details carry it. The partition is the board — seven independent competitions, not one global sort. The ORDER BY ends with product_id DESC, a deterministic tie-break, because two pins can share a repin count and a rail with two entries for one board is a bug the design team will find before you do. And the fold comes FIRST: joining save events raw and windowing per event row ranks the fan-out, not the pins — SUM(quantity) grouped by pin, then ranked per board, in a derived table. The edge case the interviewer waits for: a board with a single pin still gets a row — its ladder has one rung and rank 1 is it. Partition, ordering, tie-break, edge case: say all four and the rail is defined, not just written.",
      tag: "windows",
    },
    {
      id: "pin-t2",
      q: "The save funnel must show clicked-through, repinned, lingered and dismissed with shares. Why is the CASE fold written over the whole population, and what does a WHERE filter do to the shares?",
      a: "The census is one conditional aggregate per group: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) beside COUNT(*), both folding the SAME rows, so the shares are shares of the true population — 52 of 103 clicked through (50.5), 30 repinned (29.1), 14 lingered (13.6), 7 dismissed (6.8). Put status = 'delivered' in WHERE and the denominator drifts to the numerator's population — every stage reads 100% and the funnel declares total victory exactly where the feed should worry. The ELSE arm is the second trap: it names the exhaust stage (dismissed), and pointing it at a surviving stage silently merges two stages into one number that reconciles to nothing. Fold-first, filter never: the stage is a column you compute, not a row you delete. That discipline is the difference between Pinterest's funnel board and a mood board with percentages on it.",
      tag: "aggregation",
    },
    {
      id: "pin-t3",
      q: "Click-through share is 50.5% here. Someone computes it as SUM(clicked) / COUNT(save_events) after joining sessions to save events. Why is that number wrong before anyone runs it?",
      a: "Because the join changed the denominator's grain. Sessions (103) joined to save events (251 rows, many sessions carrying several saves) fans every session out by its save count — the denominator is now save events, not sessions, and the share reads lower by a factor no stakeholder can explain. The fix is stating the unit: sessions in the numerator's world get a session-grain denominator (COUNT(*) over sessions, with the click flag as a conditional SUM), or the save events pre-aggregate into a derived table of one row per session before any ratio forms. The general law the interviewer wants said out loud: every ratio names its population — 'per session' and 'per save event' are different metrics that happen to share a word. Pinterest screens end loops over this, because the funnel board ships to the ranking team and a grain slip there reorders the feed.",
      tag: "joins",
    },
    {
      id: "pin-t4",
      q: "You need saves LEFT JOIN users, then someone adds WHERE users.locale = 'en-US' to scope the read. What silently changed?",
      a: "The WHERE converted the LEFT JOIN into an INNER JOIN. Unmatched rows — saves with no user match — carry NULL locale, NULL = 'en-US' is UNKNOWN, and those rows are discarded; the LEFT-ness survives only inside the ON clause. On a healthy log where every save has a user the row count happens not to move — which is exactly why the bug ships silently and surfaces months later on a corrupted feed, when the 'all saves' report starts dropping rows nobody remembers agreeing to drop. The honest fixes: scope in the ON clause (LEFT JOIN users u ON u.id = s.user_id AND u.locale = 'en-US') keeps every save and marks non-matching locales as NULL payloads; or filter after the join in an outer query; or accept INNER semantics deliberately and say so. 'LEFT JOIN is safer' is the wrong lesson — join type is a decision about who survives, and every predicate belongs to that decision.",
      tag: "joins",
    },
    {
      id: "pin-t5",
      q: "Dwell seconds are NULL until a session closes. What's your policy for that NULL in the dwell report — filter, coalesce, or report?",
      a: "Report first, then decide. A NULL dwell means the session is still open — it has no duration YET, and that is a definition, not dirt. The honest report filters to closed sessions and SAYS so: 'dwell over the 82 of 103 sessions that have an end stamp; 21 open sessions excluded by definition.' That sentence is the difference between a metric and a rumor. The two lazy fixes are the traps. Filtering silently in WHERE is the same query without the disclosure — the population shrank and nobody knows. COALESCE(dwell, 0) fabricates zero-second sessions that drag the 338.19 average down and read as 'engagement collapsed' in the review. The one legitimate coalesce is at the display edge, agreed with the stakeholder, never inside the pipeline where a fake zero becomes a fake fact. NULL policy is a stated decision; the interviewer grades whether you make one.",
      tag: "nulls",
    },
    {
      id: "pin-t6",
      q: "A report filters 'boards whose save count beats the platform average board'. Which clause does the average live in — WHERE or HAVING — and where are SELECT aliases actually born?",
      a: "Two different questions hide here. Per-BOARD gating ('boards with more than 14 saves') is HAVING COUNT(*) >= 14 — a judgment on folded groups, after GROUP BY. The PLATFORM average is a different grain: a scalar subquery — HAVING COUNT(*) > (SELECT AVG(cnt) FROM (SELECT COUNT(*) cnt FROM orders GROUP BY board)) — because the comparison target is computed over all boards, not carried per row. The alias point is the pipeline order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. Aliases are born at SELECT, so they exist for ORDER BY but never for WHERE; SQLite pragmatically resolves them in GROUP BY and HAVING too, but the portable habit is writing the underlying expression everywhere except ORDER BY. The senior tell is staging the platform average in a derived table with its grain named — 'average saves per board across all seven' — instead of nesting three levels of parentheses and hoping.",
      tag: "pipeline",
    },
    {
      id: "pin-t7",
      q: "The trends team wants month buckets and save-loop latencies from TEXT dates. What are your three date tools here, and where does each one break?",
      a: "Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on ISO text — prints the calendar spine this db's 14-month trend (2024-01 through 2025-02) hangs on; SUBSTR only works while the format stays fixed-width ISO, and '%m' alone folds February-2024 into February-2025. Diffs: JULIANDAY(a) - JULIANDAY(b) returns fractional days — the save-loop latency — and rounding happens ONCE at the display edge, not per row. Windows: half-open intervals — created_at >= '2025-02-01' AND < '2025-03-01' — never BETWEEN on the last day, which drops the final night the moment timestamps gain a time component. The deeper breaks are the unstated ones: these strings carry no timezone declaration, and the session-end column is NULL for open sessions — so every date fold states its population first ('closed sessions only') and its convention ('dates are UTC by feed contract'). State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "pin-t8",
      q: "The save log has 103 sessions, 251 save events and 16 users. What do COUNT(*), COUNT(DISTINCT user_id) and COUNT(shipped_at) each measure — and which one does the funnel board mean by 'traffic'?",
      a: "Three counts, three business objects. COUNT(*) over sessions is sessions — 103 rows, the funnel's population. COUNT(DISTINCT user_id) is users — 16 people, the audience. COUNT(shipped_at) is closed sessions — the subset with an end stamp, 82 of 103 here; the other 21 are still-open sessions with a NULL end. 'Traffic' for the funnel board means the first: sessions, because click-through and save rates are defined per session — 'per user' rates would let one power user's 24 sessions dwarf fifteen others' browsing. The trap that ends interviews: after joining sessions to save events, COUNT(*) silently counts events — the grain doubled under the join and every funnel share shrank with it. The habit being graded is saying 'one row per WHAT?' before every COUNT, and refusing to let sessions, users and events blur into one number.",
      tag: "aggregation",
    },
    {
      id: "pin-t9",
      q: "The save-loop cadence metric needs the days between a user's consecutive sessions. LAG or LEAD — which do you reach for, and what breaks first?",
      a: "Either — they price the same 102 edges between the 103 sessions, and the choice is which row CARRIES the gap. LAG looks back, so the gap lands on the later session and each user's FIRST session reads NULL — no previous row, no gap. LEAD looks forward, the gap lands on the earlier session, and each user's LAST session is the NULL. The failures are deterministic ones: ORDER BY created_at alone leaves same-day sessions in engine roulette, so the id rides along as the tie-break; and the NULL edge is a definition, not dirt — 'no next session' is not 'zero days', so the average runs in a staged pass WHERE gap IS NOT NULL, never COALESCE(gap, 0) inside it, which fabricates sixteen zero-day loops and drags the cohort average toward a busyness nobody exhibited. Say the anchor row, say the tie-break, say the NULL policy — the loop metric is those three sentences wearing a window function.",
      tag: "windows",
    },
    {
      id: "pin-t10",
      q: "The trends desk wants a cumulative dwell total across the 14-month calendar. When does the default window frame betray you?",
      a: "The default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW, and RANGE peers by VALUE — rows sharing an ORDER BY value are peers and ride into the running total together. Over the 14 distinct month keys (2024-01 through 2025-02) the default is safe: no two rows tie, so RANGE and ROWS agree. The betrayal starts the moment the ORDER BY is a non-unique column — weekday, status, board — where the cumulative sum leaps by the whole tie group at the second tied row and the pacing chart shows a cliff that is really a merge. When you want row-by-row, write it: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. When you want a trailing window — a 7-month rolling average for the trend line — ROWS BETWEEN 6 PRECEDING AND CURRENT ROW says the width out loud instead of hoping the reader counts. Frame is a definition; the interviewer is grading whether you know you made one.",
      tag: "windows",
    },
    {
      id: "pin-t11",
      q: "Growth stacks two audience legs — clicked-through and saved — into one list. UNION or UNION ALL, and what does the column contract demand?",
      a: "UNION when the metric is people, UNION ALL when it's events. The two legs can overlap — a user who saved then clicked — so the audience count needs UNION's dedupe, which sorts or hashes the stack and collapses a user riding both legs to one row. UNION ALL appends raw: right for the funnel stages, which are mutually exclusive by construction, and for event counts where the double-presence IS the truth. The column contract is non-negotiable either way: same number of columns, same order, compatible types — a leg with 3 columns stacked on 4 is a syntax error, and the quieter crime is stacking seconds against text and letting coercion 'work'. The habit that ships: stage each leg as a CTE named for its population (clicked_users, saved_users), stack with UNION, and count — because a count over a deliberately deduped stack is a definition, while a count over an accidentally duplicated one is a bug with a dashboard.",
      tag: "set-ops",
    },
    {
      id: "pin-t12",
      q: "Every board needs to be compared against the house-average budget line. Where can that scalar subquery live, and where does it break?",
      a: "A scalar subquery returns exactly one cell, so it lives anywhere an expression can: the SELECT list, printing the house line beside every board as the comparison target; the WHERE clause, keeping pins that beat it; the HAVING clause, keeping folded groups that beat it. It breaks three ways. More than one row — an ungrouped AVG is safe, a bare column is not, and 'subquery returned more than one row' is the error that teaches this. The correlated trap — reference an outer column and the subquery re-runs per row, invisible at seven boards, fatal at a million save events. And the aggregate-of-aggregate wall: 'boards whose session load beats the average BOARD' cannot be written as HAVING COUNT(*) > AVG(COUNT(*)) — the average of per-board counts needs its own pass, staged as a derived table inside the scalar subquery. One number, computed once, compared many times: that is the whole point of the shape.",
      tag: "subqueries",
    },
    {
      id: "pin-t13",
      q: "Boards with no saves this week. NOT EXISTS, NOT IN, or LEFT JOIN + IS NULL — pick one and defend it.",
      a: "NOT EXISTS — it is the only one of the three that is NULL-proof by construction. NOT IN (SELECT board FROM saves) collapses to zero rows the moment the subquery returns a single NULL: x NOT IN (a, b, NULL) can never be TRUE — the comparison against NULL is UNKNOWN, never FALSE — so the sparse-board report returns nothing, which reads as 'no sparse boards', the most dangerous sentence in analytics. LEFT JOIN + IS NULL works and reads fine, but carries the classic trap: any predicate on the right table's columns in WHERE converts the join to INNER and the anti-join silently vanishes. And on this db the all-time version returns zero anyway — every board has movement — so the honest read targets a window: no saves in the trailing 30 days, staged before the anti-join. Prefer NOT EXISTS because it reads like the question ('no save exists for this board in the window') and fails loud, not silent.",
      tag: "subqueries",
    },
    {
      id: "pin-t14",
      q: "Billing amounts are recorded as INTEGER cents. Where do the division, the rounding and the type trap live?",
      a: "Every dollar print is SUM(amount_cents) / 100.0, and the .0 is load-bearing: SQLite divides INTEGER by INTEGER with integer arithmetic, which floors — the failure is silent, the query still runs, and the total just reads low by the dropped fraction the moment any bill carries a sub-dollar amount. The cents-to-dollars fold happens once, in REAL space; ROUND comes once, at the display edge, printing 925.00 where the column holds cents — round inside the pipeline and the drift bakes into every downstream fold. The canary is the ledger: SUM(debit_cents) against SUM(credit_cents), 181,080.00 on both sides, delta 0 — an equality that only survives if every fold divided in the same space. The company twist: this is the same reflex as the dwell averages — divide where the unit changes, round where the human reads, and never in between.",
      tag: "data-quality",
    },
    {
      id: "pin-t15",
      q: "One pass, many stages: FILTER (WHERE …) versus SUM(CASE …) — when do you reach for each?",
      a: "They fold the same rows to the same numbers: COUNT(*) FILTER (WHERE status = 'open') is SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) with better manners. FILTER wins on readability and on the guarded count — COUNT(amount) FILTER (WHERE status = 'paid') counts only matched rows without inventing an ELSE arm, while the CASE fold counts by adding ones. CASE wins on portability and on multi-arm folds where each arm returns a different expression, not just a count. The billing census runs FILTER arms — paid, broken, untouched-open — in ONE pass over ONE population of 28 bills, because four separate queries are four chances for the population to drift and a reconciliation built from drifting arms reconciles nothing. The discipline I interview for outranks the syntax: one row source, one pass, every arm folding the same rows — the denominator never moves between arms.",
      tag: "aggregation",
    },
    {
      id: "pin-t16",
      q: "The rail memo wants one row per board with its pin list folded into a string. How do you fold a list without folding the truth?",
      a: "GROUP_CONCAT(name) is the fold, and its three silent failures are order, separator and length. Default order is engine-dependent — a rail whose pin order shuffles between runs is noise, so the ORDER BY rides inside the aggregate (SQLite 3.44+ takes GROUP_CONCAT(name ORDER BY repins DESC, ', '); older builds stage the sort in a subquery before folding). The default comma separator eats pin titles that contain commas — pin titles do. And the fold truncates silently at a length limit: a 500-pin board folds into a lying string, not an error. The senior shape folds LAST — after every number is computed and the grain is one row per board, strings are for humans — and the moment a string fold feeds another aggregate you have left SQL's type system for vibes. Rails read top-down; make the fold say so, and keep the numbers in columns where the next query can find them.",
      tag: "aggregation",
    },
    {
      id: "pin-t17",
      q: "Where do window functions actually run in the pipeline — and why can't you filter one in WHERE?",
      a: "Logical order: FROM, WHERE, GROUP BY, HAVING, then the windows, then SELECT, then ORDER BY. Windows run after grouping — that's why a window can see folded aggregates (SUM(COUNT(*)) OVER () prices the total in the same pass) — and after WHERE, which is why WHERE cannot see a window's output: the column it would filter on does not exist yet. The fix is staging: compute the rank in a CTE or derived table, filter rank = 1 outside it — the rail query is a pipeline wearing one statement: fold saves per pin, rank per board, cut at the crown, sort. Two consequences worth saying out loud. HAVING runs before windows too, so 'boards whose top pin beats 40 repins' is two stages, not one clause. And ORDER BY is the only clause that sees SELECT aliases and window outputs natively — everywhere else, stage it or write the expression. Name the stages and the debugging writes itself.",
      tag: "pipeline",
    },
    {
      id: "pin-t18",
      q: "Week buckets and weekend reads from TEXT dates: what do STRFTIME's codes and returns do to a save log?",
      a: "Three codes, three traps. '%Y-%m' is the month spine — 14 distinct buckets, 2024-01 through 2025-02 — while bare '%m' folds two Februaries into one and kills the year-over-year story. '%W' is week-of-year and collides across years unless the year rides along: '%Y-%W', the same year-collision lesson twice. And '%w' returns day-of-week as TEXT — '0' for Sunday through '6' for Saturday — so the weekend filter must be IN ('0', '6'): write IN (0, 6) with numbers and SQLite's type ordering makes TEXT-versus-NUMBER comparisons never match, the query returns zero rows, and the 'nobody saves on weekends' headline ships on a type error. The deeper habit: every date function here returns TEXT or REAL, so comparisons either sort correctly as ISO strings or mislead silently — state the format, sanity-check the bucket count (14, not 12), and let the calendar's shape confirm the expression before the dashboard repeats it.",
      tag: "dates",
    },
    {
      id: "pin-t19",
      q: "SUM, AVG, COUNT(col) and NULL: what does the engine skip, and where does the skip become a lie?",
      a: "The aggregate family skips NULLs: COUNT(col) counts non-NULL values, SUM and AVG ignore NULL rows entirely, and only COUNT(*) counts rows. The honest case here is dwell: 103 sessions, 82 carrying an end stamp — AVG over the closed sessions is the closed-session average, and the 21 open sessions are not zero-dwell, they are not-yet-dwell; the report names its population in the same breath or it is a rumor. The lies start when the skip is silent: AVG over a flag column re-bases by whatever rows carry NULL for that flag, and two stages of one funnel can end up averaged over different populations with no error anywhere. COALESCE inside the aggregate — AVG(COALESCE(dwell, 0)) — is fabrication with a function call around it: fabricated zeros drag the mean and read as an engagement collapse. Policy: filter to the population, say so, count rows with COUNT(*) when the business object is a row, and let the skip be a stated decision instead of an accident.",
      tag: "nulls",
    },
    {
      id: "pin-t20",
      q: "Sessions joined to save events: what happens to SUM(dwell) over the join, and what is the fix?",
      a: "The join fans sessions out by their save count — 103 sessions against 251 save events — and SUM(o.total) over the fan-out multiplies every session's dwell by the number of saves it produced; the board that attracts multi-save sessions looks proportionally more 'engaging' than it is. The fix is ordering: fold first, join second. Stage the per-session save count in a derived table or CTE, then join it to the session grain, and the additive measure stays additive. The same bug wears different clothes everywhere: a revenue report that joins orders to line items and sums order totals pays each order once per item. The diagnostic reflex is asking, before any SUM over a join, what one row IS — if the answer is not the grain the measure lives at, pre-aggregate until it is. Ratios drift and sums inflate under fan-out: same disease, same cure, and the cure is a staged fold with its grain in its name.",
      tag: "joins",
    },
    {
      id: "pin-t21",
      q: "Co-save pair rails: how does a self-join become a recommendation, and what does canonicalization actually prevent?",
      a: "Pin A and pin B saved by the same user in the same window is an edge, and the raw self-join over the save log emits every ordered combination — (A,B), (B,A) and (A,A) — so the rail's input triple-counts each edge and feeds the 'more like this' column noise. Canonicalization is one predicate: a.id < b.id — one orientation, no self-pairs, and it is a comparison the engine pushes into the join itself instead of a post-hoc dedupe. Then the gate: GROUP BY the canonical pair key, HAVING COUNT(DISTINCT user_id) >= 2 — one shared user is a coincidence, two is a signal — and the counter is DISTINCT because a user saving both pins five times is one edge, not five. The whole grammar: self-join, canonicalize, gate on shared audience, sort, cut. Every step is a decision an interviewer can ask you to defend, starting with why A < B and ending with why DISTINCT — say both and the rail is a defined artifact, not a coincidence generator.",
      tag: "joins",
    },
    {
      id: "pin-t22",
      q: "The close asserts debits equal credits. Which queries prove the books, and which anomalies do they catch?",
      a: "The trial balance is one fold: SUM(debit_cents) against SUM(credit_cents) — 181,080.00 on both sides, delta 0 — and that single equality is the strongest cheap invariant in the building. It proves nothing about row-level truth, which is why the anomaly census rides behind it: LEFT JOIN payments under invoices, fold paid cents per bill, then FILTER for the broken shapes — a void bill with money against it (925.00: voided, but the payment moved), a paid bill with zero payment rows (1,756.00: status says paid, the ledger never saw money), a partial where 4,000.00 moved against a 6,148.00 bill. The mapping is the same muscle at Pinterest: billing status is a CLAIM, the payments fold is the EVIDENCE, and the close ships only when claims and evidence reconcile per bill, not on average. Data quality is not a dashboard — it is a census of claims versus evidence, written in one pass, with FILTER arms, over one population.",
      tag: "data-quality",
    },
    {
      id: "pin-t23",
      q: "The funnel board runs every morning. What performance instincts keep these queries honest AND fast?",
      a: "Filter early on what partitions the world — the month key, the cohort, the status — a WHERE on the base table shrinks every downstream fold for free. Index the join keys the queries actually live on (user id, pin id, bill id); at 103-row scale the engine hash-joins everything, but the instinct is what scales past the demo data. Pre-aggregate before joining: the save fold staged as one row per session turns a 251-row fan-out into 103 — smaller AND correct, which is the part people forget. Know that LIMIT does not cheapen a window: the full ladder computes before the cut, so ranking 103 sessions to show 5 costs the ranking, not the showing. Refuse SELECT * — it is a lie you pay for on every column you did not need. And the instinct above all of them: correctness first, because a fast wrong funnel is worse than a slow right one — it ships daily.",
      tag: "performance",
    },
    {
      id: "pin-t24",
      q: "How do you write a query so the KPI definition ships WITH the number?",
      a: "The definition lives in the shape. CTE names carry the population — clicked_sessions, closed_sessions, covered_bills — so the query reads as its own documentation and the reviewer argues with a name, not a WHERE clause. The 'per what?' is answered by the grain of the outermost GROUP BY: one row per session, user, board or bill, and the metric is per exactly that. Shared folds beat repeated filters: one pass, one population, FILTER arms for each stage, so the funnel's stages cannot drift into different denominators even by accident. Rounding happens once, at the display edge, with the digit count visible in the SELECT. And the contract test: hand the query to the stakeholder who owns the number — if they can point at the line that defines 'clicked through' (status = 'delivered', 52 of 103) and at the line that defines the denominator, the metric is contract-grade. Numbers ship with their definitions here, or they do not ship at all.",
      tag: "definitions",
    },
  ],

  mcqs: [
    {
      id: "pin-mcq-1",
      prompt: "The session log has 103 rows from 16 users. Which expression returns 16 — the audience count the growth team keys on?",
      choices: [
        "COUNT(*)",
        "COUNT(DISTINCT customer_id)",
        "COUNT(shipped_at)",
        "COUNT(status)",
      ],
      answer: 1,
      why: "COUNT(DISTINCT customer_id) folds 103 session rows back to the 16 people behind them — the user count every cohort and funnel metric is built on.",
      notes: [
        { choice: 0, why: "COUNT(*) is the session count — 103. That's traffic, not audience; reporting it as 'users' inflates the base by the repeat-session factor." },
        { choice: 2, why: "COUNT(shipped_at) counts non-NULL session ends — 82 on this db. That's 'closed sessions', a third thing, not the audience." },
        { choice: 3, why: "COUNT(status) counts non-NULL statuses — every row, so 103. Status is never NULL, so this COUNT distinguishes nothing." },
      ],
      difficulty: "easy",
    },
    {
      id: "pin-mcq-2",
      prompt: "The funnel census computes click-through share as 52 of 103 (50.5%). A teammate adds WHERE status = 'delivered' before the fold. What prints?",
      choices: [
        "50.5 — correct",
        "100.0 — the denominator shrank to the numerator's population",
        "0.0 — the filter empties the numerator",
        "An error — you can't filter before a CASE fold",
      ],
      answer: 1,
      why: "Filtering delivered rows first makes COUNT(*) count delivered sessions — the denominator drifts to match the numerator and every stage reads 100%. Numerator and denominator must fold from the same unfiltered population.",
      notes: [
        { choice: 0, why: "The honest 50.5 needs the full 103 under the fold — the WHERE discarded 51 rows before any division happened." },
        { choice: 2, why: "Nothing empties the numerator — delivered rows are all that's LEFT. That IS the drift: the share saturates at 100, not zero." },
        { choice: 3, why: "It runs fine and ships a perfect-looking funnel — denominator drift is the most confident-looking bug in feed analytics." },
      ],
      difficulty: "medium",
    },
    {
      id: "pin-mcq-3",
      prompt: "Two pins tie at 36 repins within one board; the next pin has 33. What does ROW_NUMBER() OVER (PARTITION BY board ORDER BY repins DESC) assign the third pin — and what's the leaderboard-safe alternative?",
      choices: [
        "3 — and ROW_NUMBER is fine for rails",
        "3 — but the tie inside the top rungs needs a stated tie-break or RANK",
        "5 — ROW_NUMBER preserves the gap",
        "2 — ROW_NUMBER compacts ties",
      ],
      answer: 1,
      why: "ROW_NUMBER prints 1, 2, 3 — the tie is split arbitrarily (engine order), which on a curated rail means which pin is 'first' is luck. RANK would give both tied pins rank 1 and the next rank 3; a deterministic tie-break (pin id) makes ROW_NUMBER contractual instead of accidental.",
      notes: [
        { choice: 0, why: "The 3 is right but 'fine for rails' isn't — a rail's first slot decided by engine whim is a bug the design team files for you." },
        { choice: 2, why: "That's RANK's gap behavior — ROW_NUMBER never skips a number." },
        { choice: 3, why: "That's DENSE_RANK — compact, no gaps, and still arbitrary about which tied pin sits first." },
      ],
      difficulty: "medium",
    },
    {
      id: "pin-mcq-4",
      prompt: "The curation argmax runs ROW_NUMBER() OVER (PARTITION BY category ...). A board holds exactly one pin. What does the rail return for that board?",
      choices: [
        "Nothing — argmax needs at least two rows",
        "The pin, at rank 1 — a one-rung ladder still crowns a winner",
        "The pin, at rank 0",
        "The query errors on the empty partition",
      ],
      answer: 1,
      why: "Window partitions of size one still produce a rank 1 — the single-pin board keeps its row, which is why the argmax shape beats MAX-joined-back (which also survives here but fails on ties elsewhere). The edge case is the definition: every board gets exactly one rail row.",
      notes: [
        { choice: 0, why: "Windows never require competition — a partition of one is ranked, not skipped." },
        { choice: 2, why: "Ranks start at 1 — rank 0 isn't a thing in any of the ranking functions." },
        { choice: 3, why: "Empty partitions are the only thing windows skip — a partition with one row is not empty." },
      ],
      difficulty: "easy",
    },
    {
      id: "pin-mcq-5",
      prompt: "Sessions LEFT JOIN users, then someone adds WHERE users.locale = 'en-US' to scope the report. What silently changed?",
      choices: [
        "Nothing — both predicates are independent",
        "The WHERE killed the NULL payloads, so the LEFT JOIN collapsed to INNER",
        "The locale filter is fine, but NULL users appear twice",
        "The query now returns one row per locale",
      ],
      answer: 1,
      why: "Unmatched saves carry NULL locale and fail the WHERE test, so the LEFT JOIN silently became INNER — the report's population changed without a word. Predicates on the right table belong in ON, or the collapse must be a stated decision.",
      notes: [
        { choice: 0, why: "The predicates interact: NULL-payload rows fail the locale test, and that interaction IS the join-type change." },
        { choice: 2, why: "No duplication happens — the failure is silent loss of unmatched rows, the exact rows a LEFT JOIN exists to keep." },
        { choice: 3, why: "The row count moves by dropped rows, not by locale groups — the shape stays per-save, the population shrinks." },
      ],
      difficulty: "hard",
    },
    {
      id: "pin-mcq-6",
      prompt: "Save-loop latency: julianday(created_at) - julianday(LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at)). For which row is the result NULL?",
      choices: [
        "Each user's first session — no previous row exists in the partition",
        "Sessions that never closed — shipped_at is NULL",
        "Every row — LAG without an explicit frame returns NULL",
        "Sessions on the log's first date only",
      ],
      answer: 0,
      why: "LAG has nothing to look back at on the partition's first row, so the latency is NULL — which is why loop reports must treat NULL as 'no previous save', not as zero days.",
      notes: [
        { choice: 1, why: "The loop runs on created_at, the session start — shipped_at's NULLs are a different column and a different definition entirely." },
        { choice: 2, why: "LAG is fully legal with a bare OVER; only the partition's first row lacks a previous value." },
        { choice: 3, why: "The log's first date matters for one user only — per-partition firsts produce the NULLs, and there are 16 of those." },
      ],
      difficulty: "medium",
    },
    {
      id: "pin-mcq-7",
      prompt: "Dwell per session averages 338.1879611650485. The dashboard needs 338.19. Which shape is correct?",
      choices: [
        "ROUND(AVG(total), 2)",
        "CAST(AVG(total) AS INTEGER)",
        "ROUND(AVG(total))",
        "SUBSTR(AVG(total), 1, 6)",
      ],
      answer: 0,
      why: "ROUND to 2 decimal places at the display edge — the one place rounding belongs. The pipeline carries full precision; only the print is rounded.",
      notes: [
        { choice: 1, why: "CAST to INTEGER truncates to 338 — a 0.19-second leak per session, compounded across every aggregate built on top." },
        { choice: 2, why: "ROUND without a digit count rounds to integer — 338, not the two decimals the dashboard specifies." },
        { choice: 3, why: "SUBSTR string-slices to '338.18' — truncation disguised as rounding, and the cell is now TEXT that downstream arithmetic mishandles." },
      ],
      difficulty: "easy",
    },
    {
      id: "pin-mcq-8",
      prompt: "The trends report buckets saves by month over a 14-month window (2024-01 through 2025-02). Which bucket expression is calendar-safe?",
      choices: [
        "STRFTIME('%m', created_at)",
        "STRFTIME('%Y-%m', created_at)",
        "SUBSTR(created_at, 6, 2)",
        "created_at",
      ],
      answer: 1,
      why: "'%Y-%m' prints '2024-01' … '2025-02' — 14 distinct buckets that sort chronologically as text. Month-only variants collapse February-2024 and February-2025 into one bucket; the raw date is day-grain, not month-grain.",
      notes: [
        { choice: 0, why: "'%m' drops the year — the 14-month trend folds into 12 buckets and the year-over-year story disappears." },
        { choice: 2, why: "SUBSTR 6,2 extracts the same month-only slice — same fold, same loss, just string surgery." },
        { choice: 3, why: "The raw created_at is one bucket per DAY — hundreds of buckets where the trend expects 14. Grain, stated first, chooses the expression." },
      ],
      difficulty: "medium",
    },
    {
      id: "pin-mcq-9",
      prompt: "An experiment read computes conversion lift between two feed arms. A teammate checks arm sizes AFTER computing the lift. Why is the order wrong?",
      choices: [
        "It isn't — the lift is valid regardless of arm sizes",
        "A broken traffic split (sample-ratio mismatch) can manufacture the lift — arm balance is checked first",
        "Arm sizes only matter for revenue metrics",
        "Checking sizes first doubles the query cost",
      ],
      answer: 1,
      why: "If the traffic split broke — 60/40 instead of the designed 50/50 — the arms differ in composition before any treatment effect, and the 'lift' measures the skew. The sample-ratio check is a precondition, not a footnote; the honest read checks the split, then computes the lift on the balanced population.",
      notes: [
        { choice: 0, why: "Composition bias and treatment effect are indistinguishable until the split is verified — that's why the check comes first." },
        { choice: 2, why: "Every ratio metric inherits the denominator problem — arm size governs any share, not just revenue." },
        { choice: 3, why: "Cost isn't the issue — the lift computed on a broken split isn't slow, it's wrong." },
      ],
      difficulty: "hard",
    },
    {
      id: "pin-mcq-10",
      prompt: "A co-save pair query joins the save log to itself and counts pairs. Without canonicalization, what does the raw self-join produce?",
      choices: [
        "Each pair once — joins dedupe naturally",
        "Both (A,B) and (B,A), plus (A,A) self-pairs — double-counting and noise",
        "An error — a table can't join to itself",
        "Only pairs with equal save counts",
      ],
      answer: 1,
      why: "A raw self-join emits every ordered combination: both orientations of each pair and each row paired with itself. The canonical fix is a < comparison on the pair key (a.id < b.id) — one orientation, no self-pairs — which is exactly what the recommendation-pair drills teach.",
      notes: [
        { choice: 0, why: "Joins pair rows, they don't dedupe — the fan-out is the default, canonicalization is the craft." },
        { choice: 2, why: "Self-joins are ordinary SQL — aliases make the two copies independent." },
        { choice: 3, why: "Equal counts are a coincidence, not a join property — the self-join pairs on the key you give it, counts regardless." },
      ],
      difficulty: "hard",
    },
    {
      id: "pin-mcq-11",
      prompt: "The board census needs the number of distinct boards tracked in the pin catalog. Which expression returns 7?",
      choices: [
        "COUNT(*)",
        "COUNT(DISTINCT category)",
        "COUNT(category)",
        "SUM(category)",
      ],
      answer: 1,
      why: "COUNT(DISTINCT category) folds the 16 pin rows back to their 7 distinct boards — the population every per-board rail and curation read hangs on.",
      notes: [
        { choice: 0, why: "COUNT(*) is the pin count — 16 catalog rows. Most boards carry two or three pins; counting rows reports inventory, not boards." },
        { choice: 2, why: "COUNT(category) counts non-NULL category values — every pin carries a board, so this is 16 too. It distinguishes nothing here." },
        { choice: 3, why: "SUM(category) tries to add text — SQLite coerces each board name to 0 and returns 0, a number that means nothing twice over." },
      ],
      difficulty: "easy",
    },
    {
      id: "pin-mcq-12",
      prompt: "The billing fold prints settled ad revenue from an INTEGER-cents column. Which expression prints dollars correctly?",
      choices: [
        "SUM(amount_cents)/100",
        "SUM(amount_cents)/100.0",
        "CAST(SUM(amount_cents) AS TEXT) || '.' || '00'",
        "ROUND(SUM(amount_cents), 2)",
      ],
      answer: 1,
      why: "SUM/100.0 forces REAL division before the print — the /100.0 is the unit change, and ROUND to 2 belongs once, right there at the display edge.",
      notes: [
        { choice: 0, why: "INTEGER/INTEGER is integer division in SQLite — it floors silently the moment a sub-dollar amount lands. No error, just a shaved total." },
        { choice: 2, why: "String surgery fakes the decimals and the cell becomes TEXT — the next arithmetic step over it breaks or coerces unpredictably." },
        { choice: 3, why: "ROUND(x, 2) on an INTEGER rounds nothing — there is no decimal to keep until something divides in REAL space." },
      ],
      difficulty: "medium",
    },
    {
      id: "pin-mcq-13",
      prompt: "Growth stacks two audience legs — users who clicked through, users who saved — into one list. The legs can overlap. Which operator guarantees each user appears once?",
      choices: [
        "UNION ALL",
        "UNION",
        "INTERSECT",
        "JOIN",
      ],
      answer: 1,
      why: "UNION dedupes the stacked result — a user riding both legs collapses to one row, which is what an audience count means.",
      notes: [
        { choice: 0, why: "UNION ALL appends raw — the overlapping user counts twice and the audience number lies upward." },
        { choice: 2, why: "INTERSECT keeps only the overlap — the opposite ask; everyone who did exactly one of the two vanishes." },
        { choice: 3, why: "JOIN pairs rows across the legs — it doesn't stack sets, and the grain multiplies instead of merging." },
      ],
      difficulty: "easy",
    },
    {
      id: "pin-mcq-14",
      prompt: "The benchmark needs 'boards whose session load beats the average BOARD'. A teammate writes HAVING COUNT(*) > AVG(COUNT(*)) OVER (). Why does this fail?",
      choices: [
        "Windows can't run in HAVING, and the average of per-board counts can't nest inline anyway — stage the per-board counts in a derived table and compare with a scalar subquery",
        "It works — window functions are allowed in HAVING",
        "AVG(COUNT(*)) just needs a GROUP BY inside the OVER clause",
        "The comparison needs WHERE, not HAVING",
      ],
      answer: 0,
      why: "Two walls: window functions are rejected in HAVING at parse time, and even in a subquery the aggregate-of-aggregates can't be written at one query level — the shape is HAVING COUNT(*) > (SELECT AVG(cnt) FROM (SELECT COUNT(*) cnt FROM ... GROUP BY ...)).",
      notes: [
        { choice: 1, why: "SQLite rejects window functions in HAVING — the query never parses, which at least fails louder than the drift bugs." },
        { choice: 2, why: "Aggregates can't nest inside a window's OVER — the per-board counts need their own query level, staged first." },
        { choice: 3, why: "WHERE runs before folding — the per-board count doesn't exist there; HAVING is the right clause, the subquery is the missing piece." },
      ],
      difficulty: "hard",
    },
    {
      id: "pin-mcq-15",
      prompt: "The monthly save calendar must keep only months with at least 7 sessions. Where does the floor go?",
      choices: [
        "WHERE COUNT(*) >= 7",
        "HAVING COUNT(*) >= 7",
        "ORDER BY COUNT(*) >= 7",
        "LIMIT 7",
      ],
      answer: 1,
      why: "The floor judges folded groups — months logged 6 sessions in 2024-06, 2024-11 and 2025-01, and HAVING (which runs after GROUP BY) is the clause that can see and drop them.",
      notes: [
        { choice: 0, why: "WHERE runs before folding — COUNT(*) doesn't exist yet; the query errors, or worse, an alias 'resolves' and filters nothing you meant." },
        { choice: 2, why: "ORDER BY sorts, never filters — the thin months still ride, just parked at the bottom of the calendar." },
        { choice: 3, why: "LIMIT 7 cuts the LIST to 7 rows by position — 11 qualifying months become 7 by accident, a different lie with the same shape." },
      ],
      difficulty: "medium",
    },
    {
      id: "pin-mcq-16",
      prompt: "The billing census counts open bills in the same pass as the total. Which pair is equivalent?",
      choices: [
        "COUNT(*) FILTER (WHERE status='open') and SUM(CASE WHEN status='open' THEN 1 ELSE 0 END)",
        "COUNT(status) FILTER (WHERE status='open') and COUNT(*)",
        "SUM(status='open') and COUNT(*)",
        "COUNT(*) FILTER (WHERE status='open') and COUNT(DISTINCT status)",
      ],
      answer: 0,
      why: "Both fold the same rows to the same number: FILTER counts matching rows, the CASE fold adds ones for matches and zeros elsewhere — 6 open bills either way.",
      notes: [
        { choice: 1, why: "COUNT(*) counts ALL rows regardless of the arm — 28, not 6; the FILTER on the left is exactly what the right side lacks." },
        { choice: 2, why: "SUM(boolean) adds 0/1s and works numerically, but COUNT(*) counts rows, not matches — they only agree when every row matches." },
        { choice: 3, why: "COUNT(DISTINCT status) counts distinct STATUS VALUES — 3, not the open-bill count; a census of the vocabulary, not the book." },
      ],
      difficulty: "medium",
    },
    {
      id: "pin-mcq-17",
      prompt: "A cumulative dwell total runs SUM(total) OVER (ORDER BY status). Two sessions share a status. What does the default frame do at the second of them?",
      choices: [
        "Jumps by both rows — the default RANGE frame peers by value, so tied rows ride into the total together",
        "Adds one row — frames are always row-by-row",
        "Errors — ORDER BY in a window must be unique",
        "Returns NULL — ties can't be summed",
      ],
      answer: 0,
      why: "The default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW, and RANGE includes peer rows — the running total leaps by the whole tie group. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW makes it row-by-row; which one you want is a definition, so state it.",
      notes: [
        { choice: 1, why: "That's ROWS semantics — the default is RANGE, and ties are exactly where the two frames diverge." },
        { choice: 2, why: "It runs fine — ORDER BY uniqueness governs determinism, not legality; the total is just wrong-shaped." },
        { choice: 3, why: "NULL only enters via NULL inputs — a tie is a framing event, not an error and not a NULL." },
      ],
      difficulty: "hard",
    },
    {
      id: "pin-mcq-18",
      prompt: "The EOD note sorts a computed column: SELECT board, COUNT(*) AS saves ... — which clause may reference saves directly?",
      choices: [
        "WHERE saves > 14",
        "HAVING saves > 14, on every engine",
        "ORDER BY saves DESC",
        "GROUP BY saves",
      ],
      answer: 2,
      why: "Aliases are born at SELECT, and ORDER BY runs last — it's the one clause that sees them natively. WHERE runs before the SELECT list exists; HAVING resolves aliases in SQLite but not portably.",
      notes: [
        { choice: 0, why: "WHERE runs before SELECT — 'no such column: saves' on most engines, and the SQLite quirk that resolves it is not a habit to learn." },
        { choice: 1, why: "SQLite resolves it, PostgreSQL doesn't — the portable habit is HAVING COUNT(*) > 14: expression everywhere except ORDER BY." },
        { choice: 3, why: "GROUP BY the folded count groups by each distinct count value — the board grain is destroyed before any of it is computed." },
      ],
      difficulty: "easy",
    },
    {
      id: "pin-mcq-19",
      prompt: "Sparse-board audit: WHERE board NOT IN (SELECT board FROM saves WHERE week = 12). The save log carries one NULL board that week. What prints?",
      choices: [
        "The sparse boards, minus the NULL edge",
        "Empty result — NOT IN against a set containing NULL can never be TRUE",
        "An error — NULLs are illegal in IN lists",
        "All boards — the NULL only fails its own row",
      ],
      answer: 1,
      why: "x NOT IN (a, b, NULL) can never be satisfied: the comparison against NULL is UNKNOWN, never FALSE, so NOT IN is never TRUE and the WHERE discards every row. The fix is NOT EXISTS — or an explicit board IS NOT NULL in the inner query.",
      notes: [
        { choice: 0, why: "The NULL doesn't get excluded — it poisons the whole comparison set; the result isn't 'minus one board', it's nothing at all." },
        { choice: 2, why: "It runs silently — that's the trap: no error, no warning, just a report whose answer is 'nothing exists'." },
        { choice: 3, why: "The inner NULL doesn't filter itself out — nothing here wrote IS NOT NULL, so it rides in the set and sinks every comparison." },
      ],
      difficulty: "hard",
    },
    {
      id: "pin-mcq-20",
      prompt: "The rail memo folds pin names per board with GROUP_CONCAT. What's the missing discipline?",
      choices: [
        "GROUP_CONCAT is unordered by default — pin order changes between runs unless ORDER BY rides inside the fold",
        "GROUP_CONCAT dedupes by default",
        "GROUP_CONCAT errors on lists over 100 items",
        "GROUP_CONCAT requires the string column to be indexed",
      ],
      answer: 0,
      why: "Default order is engine-dependent — a rail whose pin order shuffles between runs reads as noise. SQLite 3.44+ accepts GROUP_CONCAT(name ORDER BY repins DESC, ', '); older builds sort in a staged subquery first.",
      notes: [
        { choice: 1, why: "Duplicates ride — GROUP_CONCAT never dedupes; republished pins appear twice until you fold a DISTINCT." },
        { choice: 2, why: "It truncates silently at a length limit rather than erroring — a long board folds into a lying string, not a stack trace." },
        { choice: 3, why: "No index requirement — the failure modes are order, separator and silent truncation, none of them planning." },
      ],
      difficulty: "medium",
    },
    {
      id: "pin-mcq-21",
      prompt: "AVG(dwell) runs over a column that is NULL for the 21 still-open sessions. What does the engine average over?",
      choices: [
        "All 103 rows, counting NULLs as 0",
        "The 82 rows with a dwell value — aggregates skip NULLs",
        "Nothing — any NULL makes AVG return NULL",
        "The 21 open rows only",
      ],
      answer: 1,
      why: "AVG ignores NULL rows entirely — the mean re-bases to the 82 closed sessions. That's the honest closed-session average, but only if the report SAYS 'closed sessions'; the silent re-base is the lie.",
      notes: [
        { choice: 0, why: "That's COALESCE(dwell, 0) behavior — fabricated zeros drag the average down and read as an engagement collapse in the review." },
        { choice: 2, why: "SUM returns NULL only on all-NULL input; a partially-NULL column just skips — which is exactly why the skip is silent." },
        { choice: 3, why: "The open rows contribute nothing — they're the skipped ones, not the population." },
      ],
      difficulty: "easy",
    },
    {
      id: "pin-mcq-22",
      prompt: "'Second-most-repinned pin per board' — two pins tie at the top with 47. Which shape returns an actual runner-up?",
      choices: [
        "ROW_NUMBER = 2 — it always exists",
        "DENSE_RANK = 2 — the first rank below the shared crown",
        "RANK = 1, take the second row",
        "MAX(repins) - 1, join back",
      ],
      answer: 1,
      why: "With a tie at the crown, both pins share rank 1 and the next rung is rank 2 by DENSE_RANK — the true 'next best'. ROW_NUMBER = 2 arbitrarily splits the tie and returns one of the co-leaders.",
      notes: [
        { choice: 0, why: "ROW_NUMBER = 2 is one of the two 47-repin co-leaders — you shipped a co-champion as the runner-up, and which one depends on engine mood." },
        { choice: 2, why: "RANK = 1 returns BOTH co-leaders; taking 'the second row' is an ORDER BY coin flip, not a definition." },
        { choice: 3, why: "Counts aren't contiguous — nothing sits at 46, the join-back returns nothing, and the rail goes blank." },
      ],
      difficulty: "medium",
    },
    {
      id: "pin-mcq-23",
      prompt: "The growth deck claims users who browse but never save. On this db, every one of the 16 users has sessions. What does the honest all-time anti-join return?",
      choices: [
        "16 — everyone browses",
        "0 — and the zero is the finding: no dead demand in the user base",
        "NULL — the anti-join can't resolve",
        "It errors — anti-joins need unmatched rows to exist",
      ],
      answer: 1,
      why: "LEFT JOIN + IS NULL (or NOT EXISTS) over users to saves returns 0 — every user saved at least once. The zero is a verified fact, not a bug; the deck's claim needs a window ('no saves in the trailing 30 days'), not an all-time anti-join, to find anyone.",
      notes: [
        { choice: 0, why: "That's the user count, not the anti-join — the join kept only unmatched rows, and there are none to keep." },
        { choice: 2, why: "Anti-joins resolve fine over empty sets — they return zero rows, which IS the resolution." },
        { choice: 3, why: "Empty results are legitimate — the real error would be shipping a 'never saved' claim without running the check." },
      ],
      difficulty: "medium",
    },
    {
      id: "pin-mcq-24",
      prompt: "A board review sums session dwell per board: SUM(o.total) over sessions joined to save events. Sessions carry multiple saves. What happens and what's the fix?",
      choices: [
        "Nothing — SUM is order-independent",
        "Every board's dwell inflates by its saves-per-session factor — fold saves per session in a staged CTE, THEN join and sum",
        "SQLite dedupes duplicate totals automatically",
        "Cast the total to DISTINCT before summing",
      ],
      answer: 1,
      why: "The join fans 103 sessions out to 251 save rows, and each session's dwell repeats once per save — SUM multiplies dwell by fan-out. Pre-fold to one row per session, then join, then sum: additive measures inflate under fan-out exactly the way ratios drift.",
      notes: [
        { choice: 0, why: "Order-independence doesn't touch duplication — the same dwell value is IN the sum once per save it produced." },
        { choice: 2, why: "No engine dedupes sums — that instinct is usually someone reaching for SUM(DISTINCT ...), which dedupes VALUES and collapses different sessions that share a dwell." },
        { choice: 3, why: "SUM(DISTINCT total) is a quieter lie: identical dwell values from different sessions merge into one contribution." },
      ],
      difficulty: "hard",
    },
    {
      id: "pin-mcq-25",
      prompt: "The month-close sweep hunts bills whose status contradicts their payments. How many rows ride the void-but-paid flag on this db?",
      choices: [
        "0",
        "1 — the 925.00 void bill with a payment against it",
        "6",
        "28",
      ],
      answer: 1,
      why: "Exactly one: the void bill at 925.00 carries a payment row — status says void, the money moved. The census is a LEFT JOIN fold plus a FILTER arm: status = 'void' AND paid_cents > 0.",
      notes: [
        { choice: 0, why: "Zero is the honest answer for books in perfect health — this db deliberately carries the one contradiction the sweep exists to catch." },
        { choice: 2, why: "6 is the OPEN bill count — a different arm of the same census, not the contradiction." },
        { choice: 3, why: "28 is every bill — the sweep exists precisely because nobody can eyeball them all." },
      ],
      difficulty: "easy",
    },
    {
      id: "pin-mcq-26",
      prompt: "The save-loop audit orders by created_at inside OVER (PARTITION BY user). Two sessions share a timestamp. What's at risk?",
      choices: [
        "Nothing — same timestamp, same order",
        "The gap assignment becomes engine roulette — add the row id as the deterministic tie-break",
        "The partition splits at ties",
        "Windows refuse duplicate timestamps",
      ],
      answer: 1,
      why: "With a tied ORDER BY key, which row is 'previous' is unspecified — LAG/LEAD can assign the gap across the tie either way, and the audit's numbers wobble between runs. ORDER BY created_at, id makes the ladder deterministic; when the same query backs a shipped metric, determinism is a contract.",
      notes: [
        { choice: 0, why: "The engine picks an order — 'same timestamp' means you abdicated the choice, not that there isn't one." },
        { choice: 2, why: "PARTITION BY user is untouched by ties — the risk is ordering INSIDE the partition, not partition membership." },
        { choice: 3, why: "Duplicate keys are legal everywhere in windows — legality was never the question; run-to-run stability is." },
      ],
      difficulty: "medium",
    },
    {
      id: "pin-mcq-27",
      prompt: "Billing coverage: which shape flags the one partial bill (4,000 paid against 6,148) without losing the bills that have no payments at all?",
      choices: [
        "INNER JOIN payments, HAVING SUM(p.amount_cents) < i.amount_cents",
        "LEFT JOIN payments folded per bill, then HAVING SUM(p.amount_cents) < i.amount_cents AND SUM(p.amount_cents) > 0 — with a separate arm for the zeros",
        "WHERE p.amount_cents < i.amount_cents",
        "HAVING COUNT(p.id) = 1",
      ],
      answer: 1,
      why: "The LEFT JOIN keeps payment-less bills alive (their fold is 0, not a dropped row), the per-bill fold prices coverage, and the HAVING separates partial (0 < paid < due) from untouched (paid = 0). The INNER version silently deletes the untouched opens — exactly the rows the AR queue needs most.",
      notes: [
        { choice: 0, why: "INNER JOIN drops the no-payment bills first — the partial you find is real, but the untouched AR vanished from the report." },
        { choice: 2, why: "WHERE filters payment ROWS before folding — the comparison misfires per-row instead of per-bill, and the bill-level fold never forms." },
        { choice: 3, why: "Row-count = 1 fires on the wrong shape — split-payment bills carry 2 rows and are exact, while the partial is defined by amount, not arity." },
      ],
      difficulty: "hard",
    },
    {
      id: "pin-mcq-28",
      prompt: "The session log joins to the save-event log: 103 sessions, 251 save events. What does COUNT(*) return over the joined rows?",
      choices: [
        "103",
        "251 — the join's grain is the event, not the session",
        "354",
        "16",
      ],
      answer: 1,
      why: "Every session repeats once per save it produced — the joined table has one row per save event, 251. The count silently changed grain under the join, and every funnel share computed over it shrank with it.",
      notes: [
        { choice: 0, why: "103 is the session count BEFORE the join — the fan-out already happened by the time COUNT(*) runs." },
        { choice: 2, why: "354 is the arithmetic of adding two populations — joins multiply grain, they don't add tables." },
        { choice: 3, why: "16 is the user count — a third grain entirely; COUNT(DISTINCT customer_id) over the join would still return it." },
      ],
      difficulty: "easy",
    },
    {
      id: "pin-mcq-29",
      prompt: "Weekend reads: which filter actually catches Saturday and Sunday sessions?",
      choices: [
        "STRFTIME('%w', created_at) IN (0, 6)",
        "STRFTIME('%w', created_at) IN ('0', '6')",
        "STRFTIME('%W', created_at) IN ('0', '6')",
        "created_at LIKE '%Sat%'",
      ],
      answer: 1,
      why: "'%w' returns day-of-week as TEXT — '0' for Sunday through '6' for Saturday — and the list must be TEXT: SQLite's type ordering makes NUMBER-versus-TEXT comparisons never match, so the numeric list returns zero rows and the 'no weekend saves' headline ships on a type error.",
      notes: [
        { choice: 0, why: "The numeric list never matches text codes — the filter runs, returns nothing, and looks like a finding instead of a bug." },
        { choice: 2, why: "'%W' is week-of-year (00–53) — '00' ≠ '0', so even the text list matches nothing; wrong code entirely." },
        { choice: 3, why: "ISO timestamps carry no weekday name — the LIKE matches nothing by construction." },
      ],
      difficulty: "medium",
    },
    {
      id: "pin-mcq-30",
      prompt: "The close checklist asserts the ledger balances. Which single-pass query actually PROVES it for this db?",
      choices: [
        "SELECT SUM(debit_cents), SUM(credit_cents) FROM ledger_entries — both sides 181,080.00, delta 0",
        "GROUP BY account and check each account's net is zero",
        "SELECT COUNT(*) FROM ledger_entries — an even count means balanced",
        "ORDER BY amount and check the first and last rows cancel",
      ],
      answer: 0,
      why: "The trial balance is a global fold: total debits against total credits — 181,080.00 on both sides, delta 0. Per-account nets are NOT zero by design (cash nets 44,196.00, sales revenue nets negative) — balancing is a property of the whole, and only the global fold tests it.",
      notes: [
        { choice: 1, why: "Per-account nets aren't zero on any healthy ledger — that check fires constantly and trains the team to ignore alarms." },
        { choice: 2, why: "Row count says nothing about balance — parity of rows is numerology, not accounting." },
        { choice: 3, why: "Sorted endpoints cancelling is numerology with extra steps — the invariant is the SUM equality, and it's one line." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-pin-1",
      tier: "medium",
      topic: "t6",
      universe: "catalog",
      title: "The board-curation argmax",
      brief:
        "Curation memo, Tuesday: the discovery team refreshes the per-board top-pin rails, and the rail's contract is one row per board — the most-repinned pin, whatever the board's depth. The db mapping is declared: order_items are save events, quantity is the repin batch carried per save, products are pins, and product categories are the seven tracked boards. Probed facts: 251 save events across the catalog; the board crowns read 47 repins (Accessories' Desk Mat Extended), 46 (Audio's Noise-Canceling Headset), 36 (Electronics' Wireless Mouse M3), 33 (Apparel's Running Socks 3-pack), 31 (Video's 4K Webcam Pro), 30 (Wearables' Fitness Band X2) and 27 (Fitness' Yoga Mat Eco 6mm) — every board crowned, including single-pin Fitness.",
      ask: "Return each board's most-repinned pin: board, pin name and total repins — biggest repin count first, exactly one row per board.",
      template:
        "SELECT board,\n       pin,\n       repins\nFROM (\n  SELECT p.category AS board,\n         p.name AS pin,\n         SUM(oi.quantity) AS repins,\n         ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY SUM(oi.quantity) {2}, p.id) AS pick_rank\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.id\n)\nWHERE pick_rank = {3}\nORDER BY {4} DESC;",
      slots: [
        {
          answer: "p.category",
          kind: "keyword",
          label: "the board partition key",
          why: "PARTITION BY p.category runs one independent ladder per board — seven competitions instead of one global sort. Partitioning on p.id makes every pin its own board (16 crowns of one row); the rail's whole contract is per-board, so the partition is the board.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-repinned-first ladder",
          why: "The rail crowns the TOP pin, so each board's ladder orders repins descending — rank 1 IS the crown. ASC would crown every board's WEAKEST pin, a correct query answering the opposite question and the exact mistake a rushed window ORDER BY makes.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the crown cut",
          noVerify: true,
          why: "The rail takes the top of each ladder: pick_rank = 1. The constant is a rank cut that never appears in the projected columns, so the audit skips its value check — but the reasoning doesn't: rank 2 is a different product (the runner-up rail), and Fitness's single-pin board has only a rung 1.",
        },
        {
          answer: "repins",
          kind: "keyword",
          label: "the display sort key",
          why: "The rails read strongest-first, so the outer query sorts the seven crowns by repins descending — 47 on top, 27 at the bottom. Sorting on pin alphabetizes the showcase; sorting on board groups by partition order and buries the comparison the review exists to make.",
        },
      ],
      distractors: ["p.id", "ASC", "2", "5"],
      walkthrough:
        "A fold, a partitioned ladder, a cut — in that order, and the order is the lesson. The derived table folds 251 save events into per-pin repin totals (SUM(quantity) GROUP BY p.id — pre-aggregating first, so the window ranks pins and not the fan-out), then stamps each pin inside its board partition: ROW_NUMBER, PARTITION BY p.category, ordered by repins DESC with p.id as the deterministic tie-break. The outer query keeps rank 1 — exactly seven rows, one per board, because every board has at least one pin: Accessories 47, Audio 46, Electronics 36, Apparel 33, Video 31, Wearables 30, Fitness 27 — and sorts the crowns by repins DESC for the strongest-first read. The distractors fail instructively: partitioning on p.id makes every pin its own board — sixteen 'rails' of one row each; ASC crowns each board's weakest pin; rank 2 is the runner-up rail, a different product; rank 5 ships empty because no board carries five pins — and the empty result is the definition working, not a crash; and sorting the display on anything but repins buries the board-to-board comparison. Fold first, partition per board, tie-break deterministic, cut at the crown: say all four and the rail is defined, not just written.",
    },
    {
      id: "cs-pin-2",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The save-funnel census",
      brief:
        "Ranking memo, 9am: the weekly funnel census reads discovery sessions by outcome — clicked-through, repinned, lingered, dismissed — with each stage's share of the full 103-session population, and the shares must reconcile to 100 or the net has a hole. The db mapping is declared: orders are discovery sessions, status is the session outcome — delivered = clicked through to the pin's destination, shipped = saved to a board, pending = lingered on the pin, cancelled = dismissed. Probed facts: 52 sessions clicked through (50.5), 30 repinned (29.1), 14 lingered (13.6), 7 dismissed (6.8). The census carries every stage clearing the 7-session floor and prints each stage's share of all sessions — one population, one denominator, no exceptions.",
      ask: "Census the funnel: every stage clearing the 7-session floor with session count and share of all sessions (1 decimal), biggest stage first.",
      template:
        "SELECT CASE o.status\n         WHEN 'delivered' THEN 'clicked_through'\n         WHEN 'shipped'   THEN 'repinned'\n         WHEN 'pending'   THEN 'feed_linger'\n         ELSE {1}\n       END AS stage,\n       COUNT(*) AS sessions,\n       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS stage_share\nFROM orders o\nGROUP BY stage\nHAVING COUNT(*) >= {2}\nORDER BY sessions {3};",
      slots: [
        {
          answer: "'dismissed'",
          kind: "keyword",
          label: "the exhaust-stage name",
          why: "The ELSE arm catches 'cancelled' — the funnel's exit stage — and names it 'dismissed'. Pointing ELSE at a surviving stage ('clicked_through') merges the exit into a winning stage: 53 sessions where 52 belong, and the census reconciles to 103 while lying about every share.",
        },
        {
          answer: "7",
          kind: "number",
          label: "the stage floor",
          why: "The memo carries every stage clearing the 7-session floor — 52, 30, 14 and 7 all ride, so the census shows the full funnel with shares over the true 103. A floor of 8 or 14 would drop the dismissed stage and the shares would re-base to the survivors — a different census wearing the same name.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-stage-first direction",
          why: "The census reads worst-case-first for capacity: 52, 30, 14, 7 descending. ASC would open the review with the 7-session exit stage — a correct query answering the opposite question.",
        },
      ],
      distractors: ["'clicked_through'", "'repinned'", "SUM", "ASC", "8", "14"],
      walkthrough:
        "One fold, one denominator, one sort — and the discipline is that the denominator never moves. The CASE maps the four statuses to funnel stages (the ELSE arm names the exit stage 'dismissed'), COUNT(*) folds each stage's sessions, and the windowed SUM(COUNT(*)) OVER () prices the total — 103 — in the same pass, so stage_share is each stage's honest slice: 52 (50.5), 30 (29.1), 14 (13.6), 7 (6.8), reconciling to 100.0. The floor at 7 keeps all four stages riding — drop it lower and nothing changes; raise it to 8 or 14 and the dismissed stage vanishes while the shares silently re-base to the surviving 96, which is how a funnel board starts lying without an error. The distractors each break a different joint: ELSE 'clicked_through' merges the exit into the win (53 and a story the numbers don't support), ELSE 'repinned' merges it into the save (37), SUM can't take the star, ASC serves the exit stage first, and the raised floors re-base the denominator. One population, one denominator, every stage named — that's the 9am census.",
    },
    {
      id: "cs-pin-3",
      tier: "easy",
      topic: "j7",
      universe: "supplier",
      title: "The pin-source studio census",
      brief:
        "Partner memo, Thursday: the content-partnership review re-ranks pin-source studios — the suppliers table mapped in-world as the studios pins originate from — by verified save movement, not by vibes. The db mapping is declared: products are pins, order_items are save events, quantity is the repin batch carried per save, and each studio's listings are its live pins. Probed facts: the 6 studios hold the 16 pins (listings 3, 3, 3, 3, 2, 2), and the revenue crown reads Nordic Gadgets AB at 11,130.25 — a 32% share — with Midwest Hardware Co at 9,294.93 close behind; but the review's ask is repin batches, a different fold over the same fan-out. Every studio clears the 2-live-pin floor, so nobody drops.",
      ask: "Census the studios: studio name, live pin count and total repin batches — strongest movement first, every studio clearing the 2-pin floor.",
      template:
        "SELECT s.name AS studio,\n       COUNT(DISTINCT p.id) AS pins,\n       SUM(oi.quantity) AS repins\nFROM suppliers s\nJOIN products p ON p.supplier_id = {1}\nJOIN order_items oi ON oi.product_id = {2}\nGROUP BY s.id\nHAVING COUNT(DISTINCT p.id) >= {3}\nORDER BY repins {4}, pins DESC, studio;",
      slots: [
        {
          answer: "s.id",
          kind: "keyword",
          label: "the studio join key",
          why: "p.supplier_id = s.id is the pin-to-studio edge; joining on anything else (an event column, a constant) silently re-pairs rows and the census counts a graph that doesn't exist. The join key IS the relationship.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the pin join key",
          why: "oi.product_id = p.id attaches each save event to its pin. Keying to s.id or oi.id instead joins across grains — studios don't have event ids, events don't have studio ids — and the fold collapses or inflates without an error.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the live-pin floor",
          why: "The review carries studios with at least 2 live pins: 4 studios ride at 3 pins, 2 at 2, so the floor keeps all six. A floor of 3 drops the two 2-pin studios; a floor of 4 empties the census, since no studio lists 4 pins.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the strongest-first direction",
          why: "The partner review opens with the busiest studio, so repins sort descending. ASC opens with the quietest — a correct query answering the opposite question, and a partner conversation that starts sideways.",
        },
      ],
      distractors: ["oi.product_id", "COUNT(*)", "3", "4", "ASC"],
      walkthrough:
        "Three joins, one fold, one floor — and the grain is the studio. The join chain walks save events to pins (oi.product_id = p.id) and pins to their source studios (p.supplier_id = s.id); GROUP BY s.id folds the fan-out into one row per studio with COUNT(DISTINCT p.id) pricing live pins and SUM(oi.quantity) pricing repin batches. Six studios ride the 2-pin floor: Midwest Hardware Co leads the movement read at 109 repin batches on its 3 pins, Shenzhen Electro 99, Nordic Gadgets AB 82, Pacific Textiles 80, Alpine Audio GmbH 77, Andes Naturals SA 51 — and the tension is the story: Nordic crowns REVENUE at 11,130.25 (a 32% share) yet sits third by batches, while Alpine — the 4.8-rated bench — moves the fewest. The distractors fail at the joints: oi.product_id in the studio join re-pairs rows by id collision and the census counts a graph that doesn't exist; COUNT(*) as the floor compares pins to fanned event rows and empties the census; a floor of 3 drops Alpine and Andes; a floor of 4 ships empty because no studio lists 4 pins; ASC opens the partner review with the quietest studio. The floor keeps everyone; the sort does the ranking.",
    },
    {
      id: "cs-pin-4",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The save-loop gap audit",
      brief:
        "Growth memo, Monday: retention wants the save-loop cadence census — for every pair of consecutive discovery sessions a user runs, how many days pass between them, and how many loop edges went cold past the 60-day cutoff. The mapping is declared: orders are discovery sessions, created_at stamps the session start, and the 16 users own the 103 sessions. The fold runs on LEAD: each session looks one row forward inside its user partition, the gap is a julianday difference, and a user's last session simply has no next row — a definition, not dirt. The cohort read must survive the ask 'is 60 days the right cold line?' — the census prints the edges, the cold count and the average in one pass, so the threshold conversation happens against numbers, not memory.",
      ask: "Census the loop: total loop edges, edges gone cold past the 60-day cutoff, and the average gap in days (2 decimals) — one pass over the 16-user partition.",
      template:
        "WITH edges AS (\n  SELECT julianday({1}(o.created_at) OVER (PARTITION BY o.customer_id ORDER BY o.created_at, o.id)) - julianday({4}) AS gap_days\n  FROM orders o\n)\nSELECT COUNT(*) AS loop_edges,\n       {2}(CASE WHEN gap_days >= {3} THEN 1 ELSE 0 END) AS cold_edges,\n       ROUND(AVG(gap_days), 2) AS avg_gap_days\nFROM edges\nWHERE gap_days IS NOT NULL;",
      slots: [
        {
          answer: "LEAD",
          kind: "keyword",
          label: "the forward-looking window",
          why: "Each session looks one row FORWARD to its next session — LEAD. LAG measures the same edges anchored one row back and prices every gap negative; MAX collapses each row to the partition's running maximum and prices every gap at zero. The function choice is the metric's direction.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the cold-edge fold",
          why: "The census counts edges past the cutoff — SUM of the 1/0 flag. COUNT counts every non-NULL row (all 87 edges read cold), MAX collapses to 1, AVG returns a fraction. Only SUM turns the flag into the cold count.",
        },
        {
          answer: "60",
          kind: "number",
          label: "the cold-line cutoff",
          noVerify: true,
          why: "The cold line is the memo's definition — 60 days between consecutive sessions and the loop counts as dormant. The constant lives in the comparison, never in the result, so the audit skips its value check — but the read doesn't: 30 days re-counts the cold edges, 90 shrinks them, and the threshold conversation needs the census to arbitrate.",
        },
        {
          answer: "o.created_at",
          kind: "keyword",
          label: "the gap's anchor column",
          why: "The gap is julianday(next) minus julianday(this) — created_at on BOTH sides. Anchoring on o.id prices the difference against a row number instead of a date, and o.status isn't a date at all — julianday of a status string is NULL and the census goes empty.",
        },
      ],
      distractors: ["LAG", "MAX", "COUNT", "30", "o.id"],
      walkthrough:
        "One window, one fold, one threshold — staged in a CTE so the grain is explicit. Inside `edges`, LEAD(created_at) walks each user's session log forward one row over the 103-session, 16-user population: 87 edges survive (103 sessions minus the 16 last sessions with no next row — the NULL-edge definition), the julianday difference prices each edge in days, and the outer pass folds them: 87 loop edges, 16 cold past the 60-day line, averaging 41.54 days between consecutive sessions. The distractors fail at the joints: LAG anchors backwards and prices every gap negative; MAX as the window collapses each edge to the running maximum — a zero-gap log; COUNT folds all 87 edges as cold; the 30-day line re-counts 36 edges cold and changes the story the memo ships; o.id as the anchor treats a row number as a julian date and the average stops being time. Fold the edges, name the cutoff, print the average — that's the loop census growth ships.",
    },
    {
      id: "cs-pin-5",
      tier: "medium",
      topic: "q2",
      universe: "pricing",
      title: "Pins above the house budget line",
      brief:
        "Promotion memo: the ads team sets each pin's paid-promotion budget — the products.price column, mapped in-world as budget dollars per pin — and the review wants every board whose pins ride above the house line, where the house line is the average budget across ALL 16 pins, not any board's own. Probed facts: the catalog splits 8 budget pins (average 32.06) against 8 mid-band pins (average 111.5), the priciest pin is Smart Watch S at 199.99, and the premium band at 200+ is empty — nothing rides it, which is itself a finding. The line is a scalar subquery: one cell, computed once, compared per board. Boards below the line are the negotiation list; the census prints each riding board's pin count and average budget beside the house line itself.",
      ask: "Return each board whose pins ride above the house budget line: board, pin count, board average and the house line itself (2 decimals) — strongest board average first.",
      template:
        "SELECT p.category AS board,\n       COUNT(*) AS pins,\n       ROUND(AVG(p.price), 2) AS board_avg,\n       (SELECT ROUND(AVG(price), 2) FROM products) AS house_avg\nFROM products p\nWHERE p.price > (SELECT {1} FROM products)\nGROUP BY p.category\nHAVING COUNT(*) >= {2}\nORDER BY board_avg {3};",
      slots: [
        {
          answer: "AVG(price)",
          kind: "keyword",
          label: "the house-line fold",
          why: "The line is the average budget across all 16 pins — AVG(price) over the ungrouped table. SUM prices the line at the whole catalog and nothing rides; MAX sets it at the priciest pin, which can't clear itself; MIN lets the budget band ride. The fold choice IS the line.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the riding-board floor",
          why: "Every board with even one above-line pin rides — 4 boards qualify (two with 2 pins, two with 1). A floor of 2 drops the single-pin boards; a floor of 3 empties the census, since no board lands 3 above-line pins.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the strongest-average direction",
          why: "The negotiation list opens with the priciest board average, so board_avg sorts descending. ASC opens with Electronics at 89.99 — a correct query serving the review bottom-first.",
        },
      ],
      distractors: ["SUM(price)", "MAX(price)", "MIN(price)", "2", "3", "ASC"],
      walkthrough:
        "The house line is the definition, so it's written once and compared many times. The scalar subquery folds AVG(price) over all 16 pins — 71.78, the line — and the WHERE keeps pins above it: 6 of 16 (Smart Watch S at 199.99, the Headset at 149.99, the Webcam at 129, the Mic at 119, the Keyboard at 89.99, the Band at 79). Grouped per board: Wearables rides 2 pins averaging 139.5, Audio 2 at 134.5, Video 1 at 129, Electronics 1 at 89.99 — four boards, with house_avg printed beside every row as the comparison target, and the floor at 1 keeps single-pin boards in the conversation. The distractors each redraw the line: SUM(price) strands the whole catalog below 1,148.48 — an empty census; MAX sets the line at the priciest pin, which cannot clear itself; MIN at 14.99 waves the budget band through and the list grows to 7 boards; floors of 2 or 3 reshape the census; ASC serves the weakest board first. One cell, computed once, compared per board — that's the house line.",
    },
    {
      id: "cs-pin-6",
      tier: "hard",
      topic: "x2",
      universe: "month-close",
      title: "The billing reconciliation census",
      brief:
        "Close memo, day 2: ads-finance needs the billing reconciliation census in ONE pass — every ad bill (`invoices`, INTEGER cents) folded against its payment evidence (`payments`, joined per bill), with every arm counted from the same population so no stage can drift. Probed facts: 28 bills on the books — 21 marked paid for 66,443.00, 6 open worth 19,609.00, 1 void at 925.00 — and the verified anomalies name the shapes this census must catch: a void-but-paid bill (#11, 925.00), a paid-no-receipt bill (#28, 1,756.00), and one open partial where 4,000.00 moved against a 6,148.00 bill. Coverage is a fold, not a status: what the bill CLAIMS is the status column; what the payments fold PROVES is the evidence. The close ships only when claims and evidence reconcile.",
      ask: "One pass over the 28 bills: paid count, broken-claim count with their combined value (2 decimals), and untouched open bills — every arm folding the same population, gated so an undercount fails loud.",
      template:
        "WITH covered AS (\n  SELECT i.id, i.status, i.amount_cents AS amount,\n         COALESCE(SUM(p.amount_cents), 0) AS paid_cents\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n),\nflagged AS (\n  SELECT covered.*,\n         ({2}) AS broken\n  FROM covered\n)\nSELECT COUNT(*) AS bills,\n       COUNT(*) FILTER (WHERE {1}) AS paid_bills,\n       COUNT(*) FILTER (WHERE broken) AS broken_bills,\n       ROUND(SUM(amount) FILTER (WHERE broken) / 100.0, 2) AS broken_amount,\n       COUNT(*) FILTER (WHERE {4}) AS untouched_open\nFROM flagged\nHAVING COUNT(*) FILTER (WHERE broken) >= {3};",
      slots: [
        {
          answer: "status = 'paid'",
          kind: "keyword",
          label: "the paid arm",
          why: "The paid arm counts bills whose STATUS claims paid — 21 of 28. A bare 'open' is a falsy string in SQLite and zeroes the arm, 'void' counts the one voided bill, and amount > 0 counts the whole book. The arm is the claim; the evidence arms hold it accountable.",
        },
        {
          answer: "(status = 'void' AND paid_cents > 0) OR (status = 'paid' AND paid_cents = 0)",
          kind: "keyword",
          label: "the broken-claim predicate",
          why: "Broken means claim and evidence disagree in either direction: void status with money moved, or paid status with zero payment rows — the 925.00 void-but-paid bill and the 1,756.00 paid-no-receipt bill. Either half alone catches one shape and misses the other.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the close gate",
          why: "The gate demands both known broken bills ride — fewer means the fold lost evidence and the census row drops, failing loud instead of quiet. A gate of 3 or 4 empties the census (there are exactly 2), a different failure mode than a silent undercount.",
        },
        {
          answer: "status = 'open' AND paid_cents = 0",
          kind: "keyword",
          label: "the untouched-open arm",
          why: "Open with zero payments is the AR chase list — 5 bills; the sixth open bill already has 4,000.00 against its 6,148.00, so it's partial, not untouched. Dropping the paid_cents = 0 guard counts the partial as untouched and the chase list lies.",
        },
      ],
      distractors: ["status = 'void'", "4", "'open'", "amount > 0", "3"],
      walkthrough:
        "One CTE folds the evidence: LEFT JOIN payments under invoices, COALESCE the fold to zero — a bill with no payments folds to 0, not to a dropped row, because the INNER version deletes exactly the untouched-open bills the close most needs. A second stage flags the broken shape ONCE — void with money moved, or paid with nothing moved — so the count, the value and the gate all test the same predicate instead of three drifting copies of it. Then one pass, four arms, one population of 28: 21 paid by claim, 2 broken — the void-but-paid 925.00 and the paid-no-receipt 1,756.00, worth 2,681.00 together — and 5 untouched opens, with the partial at 4,000 of 6,148 correctly landing outside (money moved, so it is not untouched). The close gate at 2 makes an undercount fail loud: a gate of 3 or 4 drops the census row entirely — the close does not ship on partial evidence. The distractors: 'void' as the paid arm counts 1; a bare 'open' is falsy in SQLite and zeroes every arm it touches; amount > 0 counts the whole book into every arm at once — three lies in one row; and the raised gates fail loud rather than quietly undercounting. Claims are the status column, evidence is the fold, and the census is where they reconcile.",
    },
  ],

  problems: [
    { slug: "the-most-recent-orders-for-each-product", why: "The board-curation argmax in graded form: per-entity latest via partitioned ROW_NUMBER with a deterministic tie-break — the rail's exact grammar." },
    { slug: "bikes-last-time-used", why: "Last-touch per group via MAX-fold — the 'when was this pin last saved' recency read that keeps stale rails honest." },
    { slug: "immediate-food-delivery-i", why: "The conditional-share warm-up: share of sessions meeting an outcome rule on day one — the save-funnel census's denominator drill in miniature." },
    { slug: "ads-performance", why: "Click-funnel ratios per surface with CTR and CPC in one pass — discovery-to-click economics where the denominator choice is the whole test." },
    { slug: "queries-quality-and-percentage", why: "Two rates folded in one pass with the 100.0-before-division fix — the honest-denominator muscle every funnel share here needs." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — the follow-through rate with its NULL policy baked into the shape." },
    { slug: "repeat-purchase-rate", why: "The repin-loop rate in its cleanest form: users who came back, over users who came at all — the loop metric Pinterest optimizes the feed for." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Burst saves inside a sliding window — the 'this user is collecting, not browsing' detector, date math plus self-join." },
    { slug: "monthly-transactions-i", why: "Month-bucket totals with a status-conditional count alongside — the save calendar the trends review opens with, '%Y-%m' and all." },
    { slug: "the-latest-login-in-2020", why: "Last-touch recency folded per user with a year gate — the 'last time this board was touched' read, deduped to one row per user." },
    { slug: "find-trending-hashtags", why: "The tokenizer trend read: what's spiking in the text stream — trending pins and rising interests, extracted not eyeballed." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the 1,1,3 pattern said out loud before any pin leaderboard ships to a rail." },
    { slug: "top-five-artists", why: "Top-N by volume with the tie-at-the-boundary conversation — the rail cut where LIMIT stops being the answer when a tie straddles it." },
    { slug: "sellers-with-no-sales", why: "The sparse-inventory anti-join: entities with zero movement in the window — dead pins and starving boards, LEFT JOIN + IS NULL." },
    { slug: "find-product-recommendation-pairs", why: "Co-save pairs canonicalized with a < key — the 'more like this' graph edge, self-joined without double-counting." },
    { slug: "dau-wau-stickiness", why: "Trailing-window actives: DAU over WAU — the stickiness ratio that separates the daily pinner from the Sunday mood-boarder." },
    { slug: "biggest-window-between-events", why: "LEAD-measured gap between a user's consecutive sessions — the dormant-loop detector that finds who stopped coming back, the growth team's winback list." },
    { slug: "second-day-confirmation", why: "Day-2 follow-through per user — did the save become a second session within 48 hours, the loop's fastest honest edge." },
    { slug: "user-activity-for-the-past-30-days-i", why: "Trailing-window actives with a date filter — the 30-day save-window read the weekly feed review opens with." },
    { slug: "percentage-of-users-attended-a-contest", why: "Audience share with the 100.0-before-division fix — what fraction of the 16 users a curated rail actually reached." },
    { slug: "classes-more-than-5-students", why: "HAVING group-size floors — boards above a save-count threshold, the thin-board cut the curation review argues about." },
    { slug: "customer-order-frequency", why: "Per-user save cadence in a window with a HAVING gate — who's collecting weekly versus who drifted." },
    { slug: "group-sold-products-by-the-date", why: "GROUP_CONCAT daily pin lists — the rail memo's one-string-per-board fold, order stated or it's noise." },
    { slug: "count-salary-categories", why: "CASE tiers stacked with UNION ALL — the billing-tier census that must label every row exactly once." },
    { slug: "create-a-session-bar-chart", why: "Session-length buckets — the dwell histogram that turns 103 sessions into the bar chart leadership actually reads." },
    { slug: "running-total-for-different-genders", why: "Cumulative totals per cohort — pacing reads across home-feed cohorts where the frame is the whole question." },
    { slug: "department-highest-salary", why: "Argmax by join-back — the 'top pin per board' alternative shape, and the tie conversation it starts." },
    { slug: "project-employees-iii", why: "Per-group AVG beside a global AVG — pin pace versus board pace, the comparison read that needs both grains at once." },
    { slug: "fix-product-name-format", why: "Title hygiene for curated rails — TRIM and case fixes so 'smart watch s' never ships to a board header." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Set-membership audience: saved A and B but never C — the interest-overlap read behind 'more like this' rails." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER keep-latest dedupe — republished pins collapsing to one current row per pin id." },
    { slug: "null-blank-audit", why: "The pre-board NULL/blank audit — the data-quality pass that runs before any funnel number ships." },
  ],
};
