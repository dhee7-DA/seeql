// Temu — kit 11 of the E-commerce & Marketplace domain (Batch K, wave 6).
// Extreme-value marketplace, gamified-funnel edition: countdown flash events,
// cart-building games, free-shipping thresholds — a growth machine where the
// session-to-order funnel is the product and the low-basket cohort is the
// base. Pool provenance: 0 tagged LC rows — theme-curated: every problem and
// topic slug below is curated from scripts/company-pools.md's theme menu to
// mirror workflows Temu screens are known to probe (funnel-stage conversion,
// burst reads around flash events, low-AOV cohort censuses, status pivots,
// gamification stickiness, cohort retention). Case studies run on the
// storefront db with probed figures from scripts/company-facts.md — mapped
// honestly as customers=accounts, orders=checkouts, order_items=cart lines,
// products=listings, status=funnel stage. Extended probe receipts (below-AOV
// cohort: 9 of 16 accounts, floor 184.42 at account 14 with 4 checkouts,
// whale account 1 at 24 checkouts and 302.60 average; 2024-07 checkout mix 2
// cancelled / 2 delivered / 1 pending / 3 shipped) live in the worklog.

import type { CompanyKit } from "../types";

export const temuKit: CompanyKit = {
  id: "temu",
  domainId: "ecom",
  name: "Temu",
  tagline: "Extreme-value marketplace: gamified funnels at scale",
  accent: "text-teal-500",

  brief: [
    "**Temu** is the extreme-value marketplace that turned shopping into a game: countdown **flash events**, cart-building rewards, free-shipping thresholds and daily check-in streaks — a growth machine where the funnel IS the product and every session is nudged toward checkout. The analyst's grain stack maps cleanly onto this kit's proxy storefront: **16 accounts** place **103 checkouts** that fan into **251 cart lines**, totaling $34,833.28 at an average basket of **$338.19**. Small enough to hold in your head; shaped exactly like the funnel read you'd run for the growth team — placed, staged, converted, cancelled, with a denominator for every stage.",
    "The funnel is read off `status`: **52 delivered**, **30 shipped**, **14 pending**, {rose:7 cancelled} — and the conversion story lives in the gaps between stages. The signature Temu read is the **low-AOV cohort**: accounts whose average basket sits below the platform-wide 338.19 — **9 of 16 accounts** qualify, with a floor of **184.42** (account 14, four checkouts) — and the twist the cohort always carries: *low basket does not mean low frequency*, because the cohort holds the 24-checkout whale (account 1, averaging 302.60) and a 14-checkout regular. The fulfillment clock closes the loop: `shipped_at` non-NULL on **82 of 103 checkouts**, **2.98 days** average, 2-to-4 range — the delivery promise the gamified checkout wrote a check for.",
    "Interview style is funnel-flavored and pivot-heavy. Screens open with a warm-up join (checkouts to accounts), escalate into a **stage pivot** — delivered/shipped/pending/cancelled as columns, region or cohort as rows, SUM(CASE …) arms stacked — then land on either a **threshold census with a HAVING gate** (the low-AOV cohort, the repeat cohort, the 3+-checkout accounts) or a **flash-event read** (which month spiked, did the spike convert, what did the tie at 9 checkouts do to the leaderboard). Follow-ups are spoken out loud: 'is that per checkout or per account?', 'what population does your conversion denominator cover?', 'your LIMIT cut — what happens at a tie?'",
    "Preparation strategy: Temu carries **zero tagged problems** in this app's registry, so the kit is fully theme-curated — sixteen problems and ten topics drawn from the band to mirror known Temu screen themes: funnel-stage conversion ratios, visit-to-order anti-joins, burst detection around events, below-average cohort censuses, status pivots, stickiness and retention grids. The two case studies run on the live db: one rebuilds the **stage-by-region pivot** the funnel review opens with, the other rebuilds the **low-AOV cohort census** growth lives by — floor, whale and all. Both are mechanically audited against the probed figures.",
  ],

  dayInLife: [
    "**08:15 —** The day opens on the funnel board, and the first query is always the same reconciliation: did last night's checkout stream land, do cart-line sums tie to checkout totals, does the stage census reconcile to `COUNT(*)` — **52 delivered, 30 shipped, 14 pending, 7 cancelled** on the current fold. The conversion tile is next: the platform's **$338.19** average basket against the low-AOV cohort's spread, because Temu's unit economics live in that gap. A pending pile that grew overnight (14 checkouts) is the day's first fire — in a gamified funnel, *pending is the stage where the free-shipping promise meets the warehouse*, and the analyst who can age it by account owns the standup.",
    "**11:00 —** Midday is the deep-dive block. The stage-by-region pivot lands first: delivered/shipped/pending/cancelled as columns per market — EU 24/12/6/3 over 45 placed, APAC 21/8/5/3 over 37 — and the eye goes straight to the US row, where **10 shipped against 5 delivered** marks an in-transit pileup the flash-event postmortem will ask about. The low-AOV census follows: accounts under the platform 338.19 average — **9 of 16**, floor **184.42**, whale at **24 checkouts and 302.60** — and the definition gets written beside the number: *average of checkout totals per account, cancelled checkouts included, because a cancelled cart still gamified*. Every deep-dive ends the same way: the population stated before the ratio.",
    "**14:00 —** The afternoon tilts to stakeholder cycles. The flash-event team wants the burst read: which months spiked — 2024-02 and 2024-09 tie at **9 checkouts** but 2024-02 banked 3609.64 against 2024-09's 3116.04 — and whether the tie on the leaderboard was broken honestly or by accident. Finance wants the settlement pass: invoices and payments store INTEGER cents, so the dollar read is `amount_cents / 100.0`, and the standing anomalies are named — a void invoice that collected (925), a paid invoice with zero payments, one partial settlement (4000 of 6148). Each ask ships with its SQL attached, because *a conversion number without its denominator is a rumor the growth review will shred*.",
    "**17:30 —** The day closes in review mode. The funnel board ships: the stage pivot with the US in-transit flag, the low-AOV cohort grid with the whale annotated, and tomorrow's two must-watch numbers written down — the pending aging pile and the cohort's share of checkout volume. The last habit of the day is the LIMIT check: the cohort's top-4 cut returns 184.42, 246.41, 274.65, 276.36, and the analyst confirms no tie sits at the boundary before the deck goes out — *a silent tie at the cut is how a leaderboard loses a player nobody argued about*. In a gamified funnel the next shift inherits queries the growth team reads at 8am sharp, so the definitions ride in the comments.",
  ],

  metrics: [
    { name: "Stage conversion", what: "Share of placed checkouts at each funnel stage — 52 delivered (50.5%), 30 shipped (29.1%), 14 pending (13.6%), 7 cancelled (6.8%). The funnel's spine, read with denominators." },
    { name: "Average basket (AOV)", what: "Platform-wide revenue per checkout — $338.19 over 103 checkouts ($34,833.28). The number every gamification experiment is judged against." },
    { name: "Low-AOV cohort size", what: "Accounts whose average basket sits below platform AOV — 9 of 16 here, floor 184.42. The base cohort extreme-value economics is built on, and a HAVING census in interview form." },
    { name: "Cohort frequency twist", what: "Checkout counts inside the low-AOV cohort — the whale runs 24 at a 302.60 average, a regular runs 14. The proof that low basket ≠ low frequency, the twist every cohort read must surface." },
    { name: "In-transit flag", what: "Shipped-vs-delivered skew per market — the US runs 10 shipped against 5 delivered. The stage-pivot cell that flags a fulfillment pileup before support tickets do." },
    { name: "Flash-event lift", what: "Event-month checkouts vs revenue — 2024-02 and 2024-09 tie at 9 checkouts but bank 3609.64 vs 3116.04. Burst reads with the tie broken deterministically." },
    { name: "Fulfillment latency", what: "Days from checkout to fulfillment on the 82 checkouts with `shipped_at` — 2.98 average, 2-to-4 range. The delivery promise the game mechanics wrote." },
    { name: "Kept-checkout share", what: "Non-cancelled checkouts ÷ placed — 7 of 103 cancel (6.8%). The denominator rule (cancelled stays in the placed base) is the whole test." },
  ],

  topics: [
    {
      name: "Funnel-stage conversion",
      why: "Placed → staged → landed is Temu's whole growth story, and conversion is a ratio with a stated denominator — the drill is computing stage-to-stage rates without integer division and without letting cancelled checkouts sneak into a 'kept' denominator. Every screen opens here; the analysts who fail are the ones whose denominators were never defined.",
      slugs: ["funnel-step-conversion", "email-engagement-funnel", "ads-funnel"],
    },
    {
      name: "Visit-to-order anti-joins",
      why: "The gamified funnel's biggest leak is the session that never checks out: accounts who browsed but never bought, listings with zero demand, carts abandoned before placement. LEFT JOIN + IS NULL and NOT EXISTS are the shapes — and the NOT IN NULL trap is the standing follow-up, because one NULL in the subquery silently reports a perfect funnel.",
      slugs: ["customer-who-visited-but-did-not-transact", "transactions-per-visit-histogram", "create-a-session-bar-chart"],
    },
    {
      name: "Flash events and burst reads",
      why: "Flash events create spikes, and the read is always 'burst vs baseline': which day or month jumped, by how much, and did it convert. New-actives-per-day and burst-detection drills pair a daily census with a threshold — the exact shape of 'did the countdown move the numbers, or just the noise'.",
      slugs: ["find-bursty-behavior", "new-users-daily-count", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Low-AOV cohorts and basket math",
      why: "The below-platform-average cohort is THE Temu segment: 9 of 16 accounts under 338.19, floor 184.42, whale at 24 checkouts. The drill is a grouped average with a HAVING gate against a global mean — and the follow-up is always frequency beside the average, because low basket with high frequency is a different business than low basket with churn.",
      slugs: ["find-expensive-cities", "spend-histogram", "calculate-compressed-mean"],
    },
    {
      name: "Stage pivots and CASE arms",
      why: "The funnel review reads stages as columns: delivered/shipped/pending/cancelled per row, SUM(CASE …) arms stacked side by side. The drills are pivot-shaped — reformatting row-wise stages into columns, per-group conditional flags — and the trap is arm order plus label drift: a column that quietly counts the wrong stage is a board that lies politely.",
      slugs: ["reformat-department-table", "weather-type-in-each-country", "triangle-judgement"],
    },
    {
      name: "Leaderboards and ladders",
      why: "Gamification runs on leaderboards, and leaderboards run on rank functions — with tie policy decided BEFORE the deck. The 9-checkout months tie, the 4-checkout accounts tie three ways in the low-AOV cohort; RANK vs DENSE_RANK vs ROW_NUMBER is the difference between a ladder players trust and one that splits ties silently.",
      slugs: ["top-earners", "compute-the-rank-as-a-percentage", "group-employees-of-the-same-salary"],
    },
    {
      name: "Streaks, repeats and loyal cohorts",
      why: "Check-in streaks and repeat carts are the gamification engine: first-session reads, cumulative reward folds, customers whose activity qualifies as loyal. The drills pair a first-event fold with a HAVING-gated loyalty census — the shapes behind 'streak intact' and 'came back this week' badges.",
      slugs: ["game-play-analysis-i", "game-play-analysis-iii", "find-loyal-customers"],
    },
    {
      name: "Cancellation optics and rate guards",
      why: "Cancelled checkouts are 6.8% of the placed base, and every rate Temu publishes can be corrupted by where they land in the denominator. Rate-guard drills — cancellation share with the honest base, quality ratios with a HAVING filter, ad-performance CTR folds — teach the same reflex: name the population before the percentage.",
      slugs: ["hopper-company-queries-ii", "low-quality-problems", "ads-performance"],
    },
    {
      name: "Sessionization and event gaps",
      why: "Burst detection needs sessions, and sessions are gaps: LAG between events, windows between bursts, same-day event pairs. The drills build the interval muscle — biggest gap between events, events stitched into sessions — that turns a checkout stream into the funnel timeline growth actually reads.",
      slugs: ["sessionize-events", "biggest-window-between-events", "same-day-sale"],
    },
    {
      name: "Retention grids and stickiness",
      why: "Gamification lives or dies on the return curve: DAU/WAU stickiness, cohort retention matrices, new-vs-resurrected-vs-churned accounting. The drills pair a cohort-offset grid with a LAG status transition — the two shapes behind the weekly 'is the game still sticky' slide.",
      slugs: ["dau-wau-stickiness", "cohort-retention-matrix", "growth-accounting"],
    },
  ],

  theory: [
    {
      id: "temu-t1",
      q: "Checkouts join to accounts on one key and to listings through cart lines. In a funnel read, when do you insist on a LEFT JOIN, and what does an INNER join silently drop?",
      a: "The join follows the spine of the question. If the question is conversion-shaped — stage counts, AOV by cohort, event lift — the checkout stream is the spine and INNER joins attaching account attributes are right, because every unmatched row would distort a rate built on checkout counts. If the question is leak-shaped — accounts who browsed but never checked out, listings with zero demand — the dimension table is the spine and LEFT JOIN + IS NULL is the only honest shape: INNER drops exactly the rows you're hunting for, and a funnel report that drops its own leaks reports a perfect funnel. The gamified-funnel discipline is saying which side is the spine before the FROM clause. One honesty note this db earns: every account HAS checked out and every checkout resolves to an account (zero never-ordered rows on both sides), so INNER and LEFT coincide here — which is exactly why the interviewer asks you to reason about the shape instead of leaning on the data to save you.",
      tag: "joins",
    },
    {
      id: "temu-t2",
      q: "Rank accounts by checkout count for the gamification leaderboard. Where do RANK, DENSE_RANK and ROW_NUMBER disagree, and which one ships?",
      a: "They disagree exactly where the metric ties, and ties are the norm in this base: the ladder sits at 24, 17, 14, 13, then a cluster of 5s, 4s, 3s and 2s — the low-AOV cohort alone ties three ways at 4 checkouts. RANK gives tied accounts the same rung and skips the next (1, 2, 2, 4) — the gap implies a missing player that doesn't exist, and on a leaderboard players WILL ask where row 3 went. DENSE_RANK shares the rung and keeps the sequence compact (1, 2, 2, 3). ROW_NUMBER splits the tie arbitrarily (1, 2, 3, 4) unless you add a deterministic tie-breaker like account id, which makes it the dedupe tool, not the ladder tool. The gamification board ships DENSE_RANK with an explicit secondary sort: players accept sharing a rung; they do not accept a ladder that reorders between the morning run and the afternoon re-run. The LIMIT-1-OFFSET-1 'second place' habit breaks on every tie; the honest second place is DENSE_RANK = 2, ties included.",
      tag: "windows",
    },
    {
      id: "temu-t3",
      q: "On the checkouts table — 103 rows, 251 cart lines after the join, 16 accounts — narrate what COUNT(*), COUNT(shipped_at) and COUNT(DISTINCT customer_id) each return, and which grain each serves.",
      a: "Three numbers, three grains, all true at once. COUNT(*) is 103 — every checkout, the placed denominator for stage-conversion work. COUNT(shipped_at) is 82 — the fulfilled subset, because COUNT skips NULLs; the gap between 103 and 82 IS the 14 pending plus 7 cancelled, and the gap is a funnel stage, not a data bug. COUNT(DISTINCT customer_id) is 16 — repeat checkouts folded back to accounts, the cohort grain. And after the cart-line join a fourth number appears: COUNT(*) becomes 251 — lines, not checkouts — which is why basket AOV (34833.28 ÷ 103 = 338.19) and line value (÷ 251) are different metrics that share a numerator. The funnel trap is reporting one grain under another's name: 'checkouts per account' computed as checkouts ÷ accounts is an intensity (6.4), not a rate, and reads as nonsense the first time the growth lead asks what it means. The strong answer assigns a grain to every COUNT out loud and refuses to let the fan-out blur them.",
      tag: "aggregation",
    },
    {
      id: "temu-t4",
      q: "`shipped_at` is NULL until fulfillment, LAG returns NULL on the first row, and a cancelled checkout never gets either. What is your NULL policy across the funnel read?",
      a: "Three surfaces, one policy: define who has the metric, state it, never launder the hole. For latency, the population is the 82 fulfilled checkouts — WHERE shipped_at IS NOT NULL, 2.98 days average, 2-to-4 range — and the subtle bug is the unfiltered version 'working anyway' because AVG skips NULLs silently, returning the same 2.98 while the denominator discipline is broken. For streak and gap analysis, LAG's first-row NULL is not missing data — it IS the first event — so COALESCE only when the business definition says so ('no prior event' and 'zero days since last event' are different badges). For the cancelled stage, a CASE arm without the population filter sweeps 21 unfulfilled checkouts into whichever ELSE bucket exists. Three behaviors to narrate: filters (NULL fails = and !=), aggregates (COUNT(col) skips, COUNT(*) keeps), comparisons (NULL <= 3 is UNKNOWN, not FALSE). In a gamified funnel a silent population swap becomes a badge players dispute — state the policy in the query, not in the ticket.",
      tag: "nulls",
    },
    {
      id: "temu-t5",
      q: "'Only show accounts averaging under the platform AOV of 338.19' — WHERE or HAVING, and why can't the other clause see the average at all?",
      a: "HAVING, because the account average is a group fact: it exists only after GROUP BY customer_id folds 103 checkouts into 16 accounts and AVG tallies each. Logical evaluation runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — WHERE executes before groups form, so the average literally does not exist yet and the engine throws 'no such column'. The split that predicts every placement: row predicates in WHERE (status = 'delivered', created_at in the event window — filters that shrink the fold's input), group predicates in HAVING (average thresholds, count floors — filters that keep or kill folds). The subtlety worth saying out loud: a WHERE on the right-table column after a LEFT JOIN silently converts the join to INNER — filter the unmatched rows' survival into the ON clause or accept the downgrade deliberately. On the low-AOV census the gate is the platform mean itself — 338.19 — which keeps 9 of 16 accounts, and the gate's value rides in the deck beside the cohort because *a threshold nobody can quote is a cohort nobody can reproduce*.",
      tag: "pipeline",
    },
    {
      id: "temu-t6",
      q: "Growth wants each account's average basket compared against the platform mean — inside one query. Walk me through the shapes: scalar, derived table, and where each breaks.",
      a: "Three shapes, escalating cost. Scalar: SELECT customer_id, AVG(total) FROM orders GROUP BY customer_id HAVING AVG(total) < (SELECT AVG(total) FROM orders) — the platform mean computed once as a scalar; clean, and the zero-row case (nobody below average is possible but verify) is the honest edge. Derived: stage the per-account averages in a FROM subquery, then filter and join the platform mean on — the shape that scales when the comparison needs window functions or multiple aggregates per account. CTE: same staging with a name, which is what you ship when the cohort feeds three dashboards. The correlated shape (mean recomputed per row) is the one to avoid — fine at 16 accounts, a full scan at 16 million. The interview is really about population: the platform mean includes cancelled checkouts unless you filter, and the cohort definition must say so — *below-average against which denominator* is the question behind the question, and 9-of-16 is only the answer to one version of it.",
      tag: "subqueries",
    },
    {
      id: "temu-t7",
      q: "Checkout and fulfillment timestamps arrive as TEXT. How do you bucket them by month, diff them in days, and where does each approach break?",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', created_at) — or SUBSTR(created_at, 1, 7) on ISO text — both give '2024-09', and the SUBSTR shortcut works only while the format stays fixed-width ISO; one loose timestamp and the flash-event read quietly mis-buckets. Diffs: JULIANDAY(shipped_at) − JULIANDAY(created_at) returns fractional days — this db's 2.98-day average is exactly that, rounded once at the END, not per row; rounding per row then averaging is a different, wrong metric. Windows: half-open intervals — created_at >= '2024-09-01' AND < '2024-10-01' — never BETWEEN on the last day, which drops the midnight checkouts the flash event was built to catch. The deeper breaks: shipped_at is NULL until fulfillment (82 of 103), so every latency fold states its population first, and event reads anchor to a stated event calendar, not to whatever the max timestamp happens to be. State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "temu-t8",
      q: "Growth publishes conversion rates weekly, and the same funnel number keeps disagreeing between teams. How do you make one funnel number that everyone trusts?",
      a: "A trusted funnel is a definitions contract, and the SQL is just its enforcement. Three clauses in the contract. Population: placed = all 103 checkouts, cancelled included in the placed base (7 of them, 6.8%) — every 'kept' rate states its exclusion explicitly. Stage edges: delivered is delivered (52), shipped is shipped (30) — no rolling in-transit into delivered for the board, because the US cluster's 10-shipped-vs-5-delivered skew is exactly the signal the board exists to show. Arithmetic: 100.0 before every division, ROUND at the display edge only — the difference between 66 and 66.67 on a conversion read is a team getting yelled at for rounding, not performance. Then enforcement: the definitions live as SQL comments beside the queries, the reconciliation check (stage sums = COUNT(*) = 103) runs before every publish, and the settlement tables keep their cents discipline (`amount_cents / 100.0`) so the money side of the funnel ties to the order side. Trust is a reproducibility property: same query, same numbers, every Monday.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "temu-mcq-1",
      prompt: "The stage pivot needs the delivered column: 103 checkouts, 4 statuses. Which arm returns 52?",
      choices: [
        "COUNT(*) FROM orders",
        "SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)",
        "COUNT(status = 'delivered')",
        "SUM(status = 'delivered') AS delivered, with no CASE",
      ],
      answer: 1,
      why: "The pivot arm is a conditional 1/0 fold summed across all 103 checkouts: 52 delivered, 30 shipped, 14 pending, 7 cancelled. It's portable SQL — every engine, every reviewer.",
      notes: [
        { choice: 2, why: "COUNT can't take a boolean predicate as an argument in standard SQL — COUNT(expr) counts non-NULL exprs, and 'status = delivered' isn't an expression form the grammar accepts. The CASE is the portable shape." },
        { choice: 3, why: "SQLite happens to fold TRUE to 1, so SUM of a bare boolean works there — but it reads as dialect luck in review and breaks on engines without boolean-to-int promotion. State the fold with CASE." },
      ],
      difficulty: "easy",
    },
    {
      id: "temu-mcq-2",
      prompt: "The EU row of the stage pivot reads 24 delivered, 12 shipped, 6 pending, 3 cancelled. What does the placed column show?",
      choices: [
        "45 — the pivot arms sum to COUNT(*)",
        "24 — placed means delivered in funnel language",
        "30 — placed is the sum of the moving stages",
        "It depends on cancelled checkouts — 42 or 45",
      ],
      answer: 0,
      why: "The placed column is COUNT(*), and the four stage arms partition it: 24 + 12 + 6 + 3 = 45. That identity — stage sums equal COUNT(*) — is the reconciliation check the funnel board runs before every publish.",
      notes: [
        { choice: 3, why: "Cancelled IS a stage here, not an exclusion — the pivot's four arms cover every checkout. Deciding 'cancelled in or out' is a definition, stated once, not a per-query coin flip." },
        { choice: 1, why: "That's the delivered column's value wearing the placed name — the fastest way to make conversion rates multiply out to nonsense." },
      ],
      difficulty: "easy",
    },
    {
      id: "temu-mcq-3",
      prompt: "Platform AOV for the funnel board: 103 checkouts summing to 34833.28. Which fold computes 338.19?",
      choices: [
        "SUM(total) / COUNT(*) — on the checkouts table",
        "SUM(total) / COUNT(*) — after joining cart lines",
        "AVG(total) — on the cart-lines table",
        "COUNT(*) / SUM(total)",
      ],
      answer: 0,
      why: "AOV is revenue per checkout: SUM(total) ÷ COUNT(*) at checkout grain — 34833.28 ÷ 103 = 338.19. After joining cart lines the denominator becomes 251 and the number silently becomes per-line value (138.78).",
      notes: [
        { choice: 1, why: "The fan-out changes the denominator — 251 lines, not 103 checkouts — and the metric drifts to 138.78 with no error raised. Grain before arithmetic, every time." },
        { choice: 2, why: "AVG on the lines table averages line values (138.78-class numbers) — a real metric, but not AOV, and the board would compare it against experiment targets built on 338.19." },
      ],
      difficulty: "easy",
    },
    {
      id: "temu-mcq-4",
      prompt: "Growth wants accounts whose average basket sits below the platform mean of 338.19. Which query returns the cohort?",
      choices: [
        "SELECT customer_id FROM orders WHERE AVG(total) < 338.19",
        "SELECT customer_id FROM orders GROUP BY customer_id HAVING AVG(total) < 338.19",
        "SELECT customer_id FROM orders GROUP BY customer_id WHERE AVG(total) < 338.19",
        "SELECT DISTINCT customer_id FROM orders WHERE total < 338.19",
      ],
      answer: 1,
      why: "The average is a group fact: GROUP BY account, then HAVING carries the threshold — 9 of 16 accounts qualify, floor 184.42. WHERE runs before groups form and can't see the average.",
      notes: [
        { choice: 0, why: "Two errors in one: no GROUP BY means AVG(total) is the platform-wide average over all rows, and WHERE can't see aggregates anyway. The error message is the pipeline order teaching itself." },
        { choice: 3, why: "That filters CHECKOUTS under the mean, not accounts — it returns accounts who had one cheap checkout, including whales whose other 23 baskets are huge. Per-row filters can't express per-account conditions." },
      ],
      difficulty: "medium",
    },
    {
      id: "temu-mcq-5",
      prompt: "The US row of the pivot shows 5 delivered and 10 shipped. What does the growth team read from that cell pair?",
      choices: [
        "The US is converting best — shipped means kept",
        "An in-transit pileup — orders left 'delivered' but haven't arrived; fulfillment pacing needs a look",
        "Data corruption — shipped can never exceed delivered",
        "US checkouts are cancelled at 10 of 19",
      ],
      answer: 1,
      why: "Shipped > delivered means the fulfillment pipeline is backing up: 10 checkouts handed off but not yet landed. It's the exact cell the stage pivot exists to flag — a funnel that only counted 'placed' would hide it entirely.",
      notes: [
        { choice: 2, why: "Nothing corrupt — new orders arrive as shipped all the time; delivered lags by construction. Status ladders have ordering in TIME, not in count." },
        { choice: 0, why: "Shipped is a mid-funnel stage, not conversion — celebrating it is how a gamified funnel ships a fulfillment problem in a green dashboard." },
      ],
      difficulty: "medium",
    },
    {
      id: "temu-mcq-6",
      prompt: "Two months tie at 9 checkouts: 2024-02 (3609.64) and 2024-09 (3116.04). Which ORDER BY breaks the tie deterministically for the event leaderboard?",
      choices: [
        "ORDER BY orders DESC — ties resolve alphabetically anyway",
        "ORDER BY orders DESC, month ASC — the count first, the month key as the stated tie-break",
        "LIMIT 1 — the engine picks the winner",
        "ORDER BY revenue — counts don't matter on a leaderboard",
      ],
      answer: 1,
      why: "A deterministic tie-break is a stated secondary key: orders DESC, then month ASC — 2024-02 leads both because it wins the count tie AND banks more revenue. The tie-break rides in the query, not in the engine's mood.",
      notes: [
        { choice: 0, why: "'Resolves alphabetically anyway' is the bug — it happens to be true here, but it's engine behavior, not a contract. One data refresh and the leaderboard reorders itself." },
        { choice: 2, why: "LIMIT 1 keeps whichever row the sort chose — arbitrary at ties. The winner should be reproducible, not lucky." },
      ],
      difficulty: "medium",
    },
    {
      id: "temu-mcq-7",
      prompt: "The low-AOV deck takes the 4 deepest-discount accounts via ORDER BY avg_basket ASC LIMIT 4. What happens if two accounts tie exactly at the 4th value?",
      choices: [
        "Both tied accounts appear — LIMIT expands for ties",
        "One of the two appears, arbitrarily — a DENSE_RANK cut with ties admitted is the honest shape",
        "The query errors — LIMIT forbids ties",
        "The 5th account appears instead",
      ],
      answer: 1,
      why: "LIMIT cuts POSITION, not rank: the engine keeps whichever tied row the sort chose first. The honest 'top 4' is a windowed cut — DENSE_RANK() OVER (ORDER BY avg_basket) <= 4 — which admits both tied accounts and tells you it did.",
      notes: [
        { choice: 0, why: "LIMIT never expands for ties — it slices a fixed number of rows. Returning 'both' requires a window function or a threshold predicate." },
        { choice: 3, why: "The 5th account never appears — it's beyond the cut. The failure is subtler: one of the TIED pair is silently missing, and nobody misses a row they never saw." },
      ],
      difficulty: "medium",
    },
    {
      id: "temu-mcq-8",
      prompt: "In SUM(checkouts) OVER (ORDER BY checkouts DESC) across months, two months tie at 9. What does the running total at the FIRST 9-checkout month include?",
      choices: [
        "Just that one row — running totals add row by row",
        "Both 9-checkout months — the default frame is RANGE, and peers ride together",
        "The whole table — an unordered window is global",
        "Nothing — window sums require an explicit ROWS BETWEEN",
      ],
      answer: 1,
      why: "The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes ordering PEERS — the running total jumps by 18 at the first 9-month. ROWS BETWEEN … CURRENT ROW counts one row. Two 9-checkout months exist on this db (2024-02, 2024-09), so this is a live case, not a corner case.",
      notes: [
        { choice: 0, why: "That's the ROWS frame's answer — and it takes an explicit ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW to get it. The default silently picks RANGE-with-peers." },
        { choice: 3, why: "Windows work fine without explicit frames — they inherit RANGE, which is precisely the surprise. State the frame; don't inherit it." },
      ],
      difficulty: "hard",
    },
    {
      id: "temu-mcq-9",
      prompt: "Streak analysis computes days-since-last-checkout via LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at). What does the first checkout of each account return — and what's the policy call?",
      choices: [
        "Zero — LAG defaults to 0 on the first row",
        "NULL — and the policy is explicit: 'no prior event' is its own badge, not a zero-day gap",
        "The account's average gap — LAG backfills from the partition mean",
        "An error — LAG requires at least two rows per partition",
      ],
      answer: 1,
      why: "LAG's first-row value is NULL by default — there IS no prior checkout. The policy call is the interview: COALESCE to 0 fakes a same-day repeat and inflates streak badges; COALESCE to the account's own created date fakes history. State 'first event, no gap' as its own category.",
      notes: [
        { choice: 0, why: "LAG's default is NULL, not 0 — and even where a default is supplied, 0 means 'same-day repeat', which is a real and different event. The badge system would award a streak day the account didn't earn." },
        { choice: 3, why: "LAG runs happily on single-row partitions — it just returns NULL. Requiring two rows would silently drop every new account from the streak read, which is the opposite of what retention analytics needs." },
      ],
      difficulty: "hard",
    },
    {
      id: "temu-mcq-10",
      prompt: "A teammate 'validates' the AOV threshold with HAVING AVG(total) = 338.19, expecting accounts clustered at the mean. How many rows return?",
      choices: [
        "Several — the mean is where accounts cluster",
        "Exactly 1 — the median account",
        "0 — no account's average equals the platform mean exactly, and equality on a computed REAL is a boundary nobody sits on",
        "All 16 — every account's average contributes to the mean",
      ],
      answer: 2,
      why: "The platform mean (34833.28 ÷ 103 = 338.19) is a property of the whole base; individual account averages scatter around it (184.42 to 705.39 on this db) and none lands exactly on it — the = gate returns an empty set while the < gate returns the 9-account cohort. Boundary operators are definitions, not vibes.",
      notes: [
        { choice: 0, why: "The mean is not a mode — nothing about an average implies mass at the average. This db's spread (184.42 floor, 705.39 ceiling) proves the scatter." },
        { choice: 3, why: "That's the definition of a mean backwards — every account CONTRIBUTES to the mean; none is AT it. An empty result from a 'reasonable' gate is the tell that the operator, not the data, is wrong." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-temu-1",
      tier: "medium",
      topic: "s7",
      universe: "funnel",
      title: "The stage-by-region pivot",
      brief:
        "Temu-flavored case on the storefront db (customers = accounts, orders = checkouts, status = funnel stage): the funnel review opens with the stage-by-region pivot — four stages as columns, markets as rows — and the growth lead is explicit about the contract: 'every stage in its own column, placed as COUNT(*), biggest market first, and the arms must reconcile: columns sum to placed.' Probed facts: 103 checkouts split 52 delivered / 30 shipped / 14 pending / 7 cancelled; by market the board reads EU 24 delivered, 12 shipped, 6 pending, 3 cancelled over 45 placed; APAC 21/8/5/3 over 37; US 5/10/3/1 over 19 — the in-transit pileup row; LATAM 2/0/0/0 over 2. The reconciliation identity (24+12+6+3 = 45) is the check the board runs before every publish.",
      ask: "Return the stage-by-market pivot: delivered, shipped, pending and cancelled as columns, placed as the checkout count — biggest market first.",
      template:
        "SELECT c.region,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS delivered,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS shipped,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS pending,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n       COUNT(*) AS placed\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY placed {3};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the landed-stage arm",
          why: "The delivered column counts stage = 'delivered' — 24 for EU, 21 for APAC, 5 for the US. 'Pending' would report 6, 5, 3 — the queue wearing the landed column's name, and the funnel board would read a conversion that never happened.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the in-transit arm",
          why: "The shipped column counts stage = 'shipped' — 12 for EU, 8 for APAC, and the US pileup of 10 against 5 delivered. 'Cancelled' would report 3, 3, 1 — real numbers in the wrong column, and the in-transit flag the review exists to catch would vanish.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-market-first direction",
          why: "The board leads with volume: EU 45, APAC 37, US 19, LATAM 2. ASC would open the funnel review on the 2-checkout market and bury the EU row the read is anchored to.",
        },
      ],
      distractors: ["'pending'", "'cancelled'", "ASC"],
      walkthrough:
        "A stage pivot is N conditional folds and one reconciliation identity. Each arm is SUM(CASE WHEN status = <stage> THEN 1 ELSE 0 END) — a 1/0 fold across every checkout in the market — and COUNT(*) is placed, so the arms must sum to placed: EU 24+12+6+3 = 45, APAC 21+8+5+3 = 37, US 5+10+3+1 = 19, LATAM 2. The join to customers attaches the market key; GROUP BY region folds 103 checkouts into 4 rows; ORDER BY placed DESC leads with EU 45. The pivot's payoff cell is the US in-transit skew — 10 shipped against 5 delivered — the pileup flag that a placed-only funnel would never surface. The distractors encode the label-drift bugs: 'pending' in the delivered arm reports queues as conversions (6/5/3), 'cancelled' in the shipped arm turns the in-transit flag into a cancellation read (3/3/1), and ASC inverts the volume order. Label each arm, sum each row, check the identity — three habits, one board that reconciles.",
    },
    {
      id: "cs-temu-2",
      tier: "easy",
      topic: "l8",
      universe: "growth",
      title: "The low-AOV cohort census",
      brief:
        "Temu-flavored case on the storefront db (orders = checkouts, customers = accounts): growth's standing segment is the low-AOV cohort — accounts whose average basket sits below the platform-wide mean of 338.19 — and the cohort lead is explicit about the contract: 'group at the account grain, threshold at the platform mean, cheapest basket first, top four for the deck — and pull the frequency column beside the average, because the whale twist is the story.' Probed facts: platform AOV is 338.19 over 103 checkouts; 9 of 16 accounts average below it, from a floor of 184.42 (account 14, four checkouts) up to 326.73 (account 7, fourteen checkouts); the cohort holds the platform's most frequent buyer — 24 checkouts at a 302.60 average. The top-four cut reads 184.42, 246.41, 274.65, 276.36.",
      ask: "Return the top four below-mean accounts: account id, checkout count, and average basket to 2 decimals — cheapest average first, gated at the platform AOV of 338.19.",
      template:
        "SELECT customer_id,\n       COUNT(*) AS orders,\n       ROUND(AVG(total), 2) AS avg_basket\nFROM orders\nGROUP BY customer_id\nHAVING AVG(total) {1} 338.19\nORDER BY avg_basket {2}\nLIMIT {3};",
      slots: [
        {
          answer: "<",
          kind: "keyword",
          label: "the below-mean operator",
          why: "The cohort is defined as BELOW the platform mean: < keeps the 9 accounts from 184.42 to 326.73. > flips to the 7 heavy-basket accounts (705.39 down to 390.62-class), and >= returns an empty set — no account sits exactly at 338.19, which is the boundary lesson the whale twist sets up.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the deepest-discount-first direction",
          why: "The deck leads with the floor: 184.42, then 246.41, 274.65, 276.36. DESC would open on the cohort's ceiling (326.73) — an account the top-4 cut no longer even contains — and the discount-depth story would headline its opposite.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the deck cut",
          why: "The ask is the top four for the deck: LIMIT 4 keeps exactly 184.42, 246.41, 274.65, 276.36 — and 4 doubles as a result cell (three accounts in the cohort run 4 checkouts), so the cut and the cohort's modal frequency are the same number. A cut of 9 would return the whole cohort; a cut of 5 adds the 280.35 account and quietly changes the deck's floor-to-ceiling span.",
        },
      ],
      distractors: [">", ">=", "DESC", "5"],
      walkthrough:
        "A cohort census is a fold, a gate, and a cut — with a twist column riding beside the metric. GROUP BY customer_id folds 103 checkouts into 16 accounts; AVG(total) prices each account's habit, rounded once at the display edge. The gate is the platform mean itself — HAVING AVG(total) < 338.19 keeps 9 of 16 accounts — and the operator is the whole lesson: > selects the 7 heavy-basket accounts instead, >= selects nobody (no account sits exactly on the mean — the mean is a property of the base, not a value accounts achieve). The twist column is COUNT(*): the cohort's floor account runs 4 checkouts, but the fold also holds the 24-checkout whale at a 302.60 average — low basket, maximum frequency, which is the segment's entire economic story. ORDER BY avg_basket ASC surfaces the floor (184.42, 246.41, 274.65, 276.36); LIMIT 4 is the deck cut, safe here because no tie sits at the boundary — 276.36 and the next account (280.35) are distinct, which is exactly the tie-check the board runs before publishing a cut. Fold, gate, twist, order, cut: five decisions, one cohort the deck can defend.",
    },
  ],

  problems: [
    { slug: "funnel-step-conversion", why: "Stage-to-stage rates with stated denominators — the gamified funnel in ratio form, the exact shape the weekly growth review reads. Curated (Temu has no registry tags)." },
    { slug: "customer-who-visited-but-did-not-transact", why: "The browse-no-buy anti-join — the funnel's biggest leak, read from the accounts who gamified but never checked out. Curated." },
    { slug: "find-bursty-behavior", why: "Flash-event spikes vs baseline — the burst read that decides whether the countdown moved demand or just the clock. Curated." },
    { slug: "find-expensive-cities", why: "Group average vs global average — the below-platform-AOV cohort shape, threshold and mean in one query. Curated." },
    { slug: "game-play-analysis-i", why: "First-event per player — the first-session read every gamification funnel opens with. Curated." },
    { slug: "game-play-analysis-iii", why: "Running totals per player — cumulative reward and spend folds, the streak-economics muscle. Curated." },
    { slug: "reformat-department-table", why: "Row-wise values pivoted into columns — the stage-pivot shape, four statuses as columns per market. Curated." },
    { slug: "weather-type-in-each-country", why: "CASE flags per group — regional stage labels folded in one pass, the pivot's little sibling. Curated." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU stickiness — the daily-check-in engagement read that decides whether the game loop holds. Curated." },
    { slug: "cohort-retention-matrix", why: "Cohort-offset retention grid — which signup months return and which churn out, the return curve as a query. Curated." },
    { slug: "growth-accounting", why: "New vs resurrected vs churned via LAG transitions — the account-movement audit behind the funnel's denominator. Curated." },
    { slug: "transactions-per-visit-histogram", why: "Visits-to-orders distribution — the zero-order-session census that sizes the conversion gap honestly. Curated." },
    { slug: "ads-performance", why: "CTR/CPA ratios with 100.0-before-division — the promo-spend read where integer division quietly prints zeros. Curated." },
    { slug: "hopper-company-queries-ii", why: "Cancellation-rate ratios with explicit denominators — the kept-checkout share discipline at cohort grain. Curated." },
    { slug: "top-earners", why: "Argmax leaderboards with tie behavior surfaced — the flash-event prize board, where the 9-checkout tie is a live case. Curated." },
    { slug: "sessionize-events", why: "Stitching event streams into sessions — the gap-and-island muscle behind every funnel timeline Temu reads. Curated." },
  ],
};
