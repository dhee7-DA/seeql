// Plaid — kit 11 of the Fintech & Payments domain (Batch L, wave 6).
// The API layer between banks and fintech apps: the storefront db read as a
// link-operations sandbox — orders are link sessions (delivered = verified,
// shipped = linked, pending = MFA in flight, cancelled = abandoned),
// order_items are endpoint calls inside a session, products are API
// endpoints, suppliers are the institutions those endpoints run on,
// invoices/payments are the per-app usage billing (INTEGER cents), and
// expenses/ledger are internal money movement. Link conversion, per-
// institution reliability, verification latency and error taxonomy.
// Pool provenance: 0 tagged LC rows for Plaid — the whole pool is
// theme-curated to known API-reliability screen shapes and says so.
// Case briefs quote probed figures from scripts/company-facts.md (probed
// 2026-10-12); every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const plaidKit: CompanyKit = {
  id: "plaid",
  domainId: "fintech",
  name: "Plaid",
  tagline: "The API layer between banks and fintech apps",
  accent: "text-emerald-500",

  brief: [
    "Plaid is the plumbing between 8,000+ fintech apps and thousands of banks — the moment a user connects an account, Plaid's APIs authenticate, verify and stream the data both sides run on. The analytics reality is reliability engineering wearing a fintech badge: every session either completes, stalls, or abandons, and the company's whole reputation is the difference. On this storefront db the mapping is honest: `orders` are link sessions (103 of them), order_items are endpoint calls inside those sessions (251 — a session averages ~2.4 calls), products are API endpoints, and suppliers are the institutions those endpoints run against. Session outcomes mirror the status mix exactly: **52 verified** (50.5%), **30 linked** (29.1%), **14 pending** (13.6%), **7 abandoned** (6.8%) — and shipped_at is the completion timestamp, populated only for the 82 sessions that got there.",
    "The data org splits into API reliability, partner engineering, and the billing desk. Reliability owns the funnel: conversion cut by region (APAC sessions abandon at **8.1%**, EU 6.7%, US 5.3%, LATAM 0) and by institution — one institution carries **56 endpoint calls from 45 sessions**, the quietest 25 from 25. Partner engineering owns the latency clock: JULIANDAY(shipped_at) minus JULIANDAY(created_at) averages **2.98 days** across a tight 2-to-4-day range — the verification SLA every partner contract quotes. Billing owns the money side: 28 usage invoices against 27 settlement batches, INTEGER cents, with the standing exceptions — invoice #11 is {rose:void} yet carries a $925.00 settlement, #28 reads {emerald:paid} with no settlement batch behind it ($1,756.00), and one app is {amber:partial} at $4,000.00 of $6,148.00.",
    "Interview style is rate-then-denominator, then the chain. A screen opens with a conditional count (verified share — *of all sessions, or only the ones that reached a terminal state?*), moves to the three-hop chain (`orders` → `order_items` → `suppliers`, where one wrong join key pairs a session with the wrong bank), escalates into per-institution scorecards where ties need an explicit tie-break, and lands on the LAG walk: month-over-month session volume, deltas explained, first-row NULL acknowledged. The graded habits: state the denominator, resolve the tie, and never let a NULL completion timestamp into an average latency.",
    "Preparation: the registry tags zero SQL problems for Plaid — this kit is **0 tagged LC, theme-curated**: all 30 topic slugs and 16 problems are chosen to mirror reliability screens — conversion funnels, chain joins, per-institution ratios, latency math and rolling windows. Then run both case studies on the live db: one rebuilds the {emerald:institution scorecard} reliability ships to the bank partnerships meeting (Midwest 56 calls / 45 sessions leading), the other rebuilds the {violet:session-volume walk} the board deck charts month over month. Say the denominator, the join chain and the NULL policy out loud before you compute — at an API company, all three are the product.",
  ],

  dayInLife: [
    "**08:00 —** The day starts on the reliability dashboard. First query is the conversion read: overnight sessions by outcome — 52 of 103 verified all-time, the {rose:abandon} share watched hardest (APAC's 8.1% is the number the partnerships meeting quotes) — then the incident check: any institution whose session outcomes skew bad overnight? The morning artifact is a two-sided reconciliation: sessions the funnel counted versus endpoint calls that actually fired (251 across 103 sessions), because *a session with zero completed calls is an incident wearing a success status*. A mismatch pages partner engineering, not a shrug.",
    "**11:00 —** Midday is per-institution surgery. The scorecard query runs: endpoint calls and distinct sessions per institution, biggest load first — one institution carries 56 calls from 45 sessions while the quietest runs 25 from 25 — with the tie broken explicitly, because two institutions at 40 calls each and an unspecified tie-break is a scorecard that reshuffles between renders. A partner manager wants the {violet:latency clock} defended: 2.98 days average, 2-to-4 spread, computed only over sessions that completed — *NULL completion timestamps are the pending queue, not slow sessions*, and averaging them is the fastest way to fake an SLA breach. Each ask ships twice: once to answer, once with the denominator spelled out.",
    "**15:00 —** The afternoon is the board cycle. The deck charts the {violet:session-volume walk}: month buckets via SUBSTR, 6 to 9 sessions a month, LAG deltas annotated — February's +1, June's −2, September's +2 — and the first month's NULL delta handled honestly (no prior month, no delta, not a zero). Billing walks the settlement census alongside: 21 exact, 1 {amber:partial} at $4,000.00 of $6,148.00, 6 with no settlement batch, the {rose:mirror anomalies} named (#11 void-but-settled $925.00, #28 paid-but-unsettled $1,756.00). Every branch reconciles against a plain `COUNT(*)` before it ships — a number that only exists in the dashboard is a number nobody can audit.",
    "**17:30 —** EOD is the writeup. The scorecard ships with its tie-break in the comment; the latency query ships with its population filter (completed sessions only — the pending queue is a different metric); the funnel ships with its denominator in the title. The rhythm to internalize: Plaid SQL exists to prove that the funnel, the institutions and the billing agree — *the session is the promise, the endpoint call is the evidence, and the gap between them is the entire job.*",
  ],

  metrics: [
    { name: "Link conversion", what: "Verified sessions ÷ ALL sessions: 52 of 103 (50.5%). The funnel's headline — and the denominator argument ('of all sessions or only terminal ones?') is the interview before the metric." },
    { name: "Abandon rate", what: "Cancelled ÷ all sessions: 7 of 103 (6.8%) overall — cut by region, APAC 8.1% worst, LATAM 0. The number partner engineering is paged for before any SLA is formally missed." },
    { name: "Verification latency", what: "JULIANDAY(shipped_at) − JULIANDAY(created_at) over completed sessions: 2.98 days average, tight 2-to-4 spread. The SLA clock — computed over the 82 completions, never over NULL pending timestamps." },
    { name: "Institution load", what: "Endpoint calls and distinct sessions per institution: 56 calls / 45 sessions at the top of the book, 25 / 25 at the bottom. Where capacity goes and whose outage hurts most." },
    { name: "Calls per session", what: "Endpoint calls ÷ sessions: 251 ÷ 103 ≈ 2.4. The depth read — a session that fires one call and stops is a different failure mode from one that runs the full chain." },
    { name: "Region session mix", what: "Sessions and apps per region — EU 45 from 8 apps, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. The two-grain census separating traffic from audience." },
    { name: "Billing collection", what: "Usage invoices settled exact / partial / none: 21 / 1 / 6 on the db, worth reconciling to 28 every close. The money mirror of the reliability funnel." },
    { name: "Ledger balance delta", what: "Total debits − total credits: $0.00 ($181,080 = $181,080 here). The internal ledger's proof — the one metric allowed, and required, to be boring." },
  ],

  topics: [
    {
      name: "Session folds & conditional counts",
      why: "Every reliability read is a fold with a conditional count inside: sessions per day, error-flagged sessions per app, outcomes per institution. The denominator question rides on every one — COUNT(*) over all sessions versus the terminal subset is the difference between a conversion rate and a resolution rate.",
      slugs: ["reported-posts", "daily-leads-and-partners", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Chain joins: sessions → endpoints → institutions",
      why: "Institution analytics is a three-hop chain: endpoint calls attach to sessions, endpoints belong to institutions. One wrong join key pairs a session with the wrong bank and every per-institution metric downstream inherits the fiction — the chain is where Plaid's screens test join discipline hardest.",
      slugs: ["students-and-examinations", "number-of-trusted-contacts-of-a-customer", "count-artist-occurrences-on-spotify-ranking-list"],
    },
    {
      name: "Per-institution ratios & rates",
      why: "Reliability is per-institution or it's nothing: confirmation rates, dropout rates, answer rates — every one a ratio whose denominator must be stated. The hopper-style queries drill exactly the shape: rate by group, worst groups surfaced, zero-activity groups handled rather than silently dropped.",
      slugs: ["get-highest-answer-rate-question", "ads-performance", "hopper-company-queries-ii"],
    },
    {
      name: "Silent-failure anti-joins",
      why: "A session that opened but fired no completed endpoint call is the incident anti-join: sessions with no successful call row. LEFT JOIN + IS NULL (or NOT EXISTS) is the shape, and the trap is filtering the right table in WHERE — which converts the join and deletes exactly the failures you were hunting.",
      slugs: ["customer-who-visited-but-did-not-transact", "ad-free-sessions", "students-with-invalid-departments"],
    },
    {
      name: "NULL policy: missing fields & blank arms",
      why: "Staging data arrives half-filled: missing completion timestamps, blank referral fields, NULL ratings. COUNT(column) versus COUNT(*) diverges exactly there, and the policy — audit, report, or guard — is a stated decision, not a default. Plaid screens test whether NULLs are treated as findings or noise.",
      slugs: ["employees-with-missing-information", "books-with-null-ratings", "find-customer-referee"],
    },
    {
      name: "Latency math & interval logic",
      why: "The verification clock is date arithmetic: JULIANDAY deltas per session, sessions overlapping incident windows, requests whose confirmation lags by days. The NULL completion timestamp is the standing trap — pending is not slow, and averaging over it fabricates the SLA breach.",
      slugs: ["leetflex-banned-accounts", "users-that-actively-request-confirmation-messages", "find-golden-hour-customers"],
    },
    {
      name: "Rolling & trailing windows",
      why: "Reliability dashboards are trailing: 7-day actives, DAU/WAU stickiness, rolling averages that smooth the funnel. Frames and window aggregates are the mechanics, and the frame edge — does the window include today? — is the detail that makes two 'identical' dashboards disagree.",
      slugs: ["dau-wau-stickiness", "rolling-7d-actives", "restaurant-growth"],
    },
    {
      name: "Trend deltas with LAG",
      why: "The volume walk is LAG-shaped: this month's sessions minus last month's, transitions classified, growth accounting built from status changes. The first row's NULL delta is part of the story — no prior month, no delta — and hand-waving it to zero mislabels the baseline.",
      slugs: ["week-over-week-churn", "second-day-confirmation", "growth-accounting"],
    },
    {
      name: "Error taxonomy with CASE",
      why: "Session outcomes are a taxonomy, not a boolean: verified, linked, pending, abandoned — and every report classifies them with CASE arms evaluated in order. Arm ordering matters: a session the earlier arms don't catch lands in the ELSE by definition, so the ELSE is a contract, not a catch-all.",
      slugs: ["type-of-triangle", "triangle-judgement", "evaluate-boolean-expression"],
    },
    {
      name: "Scorecards & per-group argmax",
      why: "Partnership meetings read scorecards: peak hours per institution, the largest department-style leader per group, top endpoint families per class. Argmax-over-group is the shape, and the deterministic tie-break (value, then name) is what keeps the scorecard stable between renders.",
      slugs: ["find-peak-calling-hours-for-each-city", "manager-of-the-largest-department", "top-five-artists"],
    },
  ],

  theory: [
    {
      id: "plaid-t1",
      q: "A session counts as converted if it reaches the verified state. In a query reporting conversion by institution, where does that rule live — and what breaks when it lands in HAVING instead?",
      a: "The verified test is a row-level fact — the session's status on one row — so it belongs in WHERE (if converted sessions are the population) or inside the aggregate as SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) (if the share compares converted to all). Once folded by institution, the row-level comparison no longer exists: HAVING can only judge group aggregates. The classic failure is folding all sessions per institution and trying to subtract 'the unverified' in HAVING — they're already inside the total, and no post-aggregation clause can un-mix them. The strong answer recites the pipeline — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and places every rule by asking: is this a fact about one session, or about an institution? At Plaid that question is the SLA itself: a conversion rule in the wrong clause doesn't error, it reports a funnel that never existed.",
      tag: "pipeline",
    },
    {
      id: "plaid-t2",
      q: "Per-institution metrics need sessions joined to endpoint calls joined to institutions. Walk the chain — and name the failure mode when one join key is wrong.",
      a: "The chain: endpoint calls (order_items) carry the session's foreign key and the endpoint's foreign key; endpoints (products) carry the institution's foreign key. Join order is flexible, but every ON must bind the right pair: oi.product_id = p.id, then p.supplier_id = s.id, then oi.order_id = o.id. The failure mode is silent mis-pairing — s.id = p.id joins institutions to endpoints by coincidence of key values, and the query returns plausible-looking counts attributed to the wrong bank; nothing errors, and the scorecard ships wrong. Guards: verify cardinalities at each hop (251 calls, 16 endpoints, 6 institutions, 103 sessions), spot-check one known session's institution by hand, and COUNT(DISTINCT) the session grain after the chain to confirm the fan-out didn't blur it. At Plaid the chain IS the product surface — a metric with one wrong hop is worse than no metric, because someone wires it to an alert.",
      tag: "joins",
    },
    {
      id: "plaid-t3",
      q: "251 endpoint calls fired across 103 sessions. Narrate every count in that sentence — and how you'd report both grains in one query.",
      a: "COUNT(*) over endpoint calls reads 251 — call events, the rows the API logged. COUNT(DISTINCT order_id) reads 103 — sessions served, the business object. COUNT(product_id) also reads 251 because the FK is never NULL — NULL-skipping is not deduplication. The two-grain scorecard folds once and counts twice: per institution, calls AND distinct sessions side by side, because calls-per-session is the depth read (about 2.4 here) and a bank with many one-call sessions is a different operational problem from one with few deep sessions. The habit the interviewer grades: before any COUNT, say 'one row per what?' — call event, session, institution bucket. At Plaid the distinction is load: counting calls as sessions deflates per-session depth; counting sessions as calls hides the traffic a bank actually experiences. Both numbers ship, to different audiences, on purpose.",
      tag: "aggregation",
    },
    {
      id: "plaid-t4",
      q: "shipped_at is NULL for every session that hasn't completed. Your latency query averages JULIANDAY(shipped_at) - JULIANDAY(created_at) over all 103 sessions. What does that number mean — and what should it mean?",
      a: "As written it means nothing: JULIANDAY(NULL) is NULL, the difference is NULL for the 21 incomplete sessions, and AVG silently skips NULLs — so the 'all-session' average is actually the completed-only average wearing a lie in its name. That's the worst of both worlds: the number is computed over 82 rows but the report claims 103. The honest versions: average over completed sessions and SAY so ('2.98 days across the 82 completions'), or split the report — latency over completions, pending count beside it — because the pending queue (14 sessions here) is a capacity story, not a latency story. The general policy: NULL completion means 'state unknown yet', not 'zero minutes' and not 'infinite'. COALESCE to zero launders pending into instant; COALESCE to a sentinel poisons the average. At Plaid the NULL policy is the SLA — the interviewer wants it stated before the number, not defended after.",
      tag: "nulls",
    },
    {
      id: "plaid-t5",
      q: "Build the month-over-month session volume walk. Where do LAG's edges bite — the first row, ties, and the ORDER BY?",
      a: "Stage the fold first — month buckets via SUBSTR(created_at, 1, 7), COUNT(*) per bucket — then delta over it: sessions - LAG(sessions) OVER (ORDER BY month). The edges: the first month's LAG is NULL, so its delta is NULL — report it as NULL (no prior month, no delta), never COALESCE to zero, which manufactures a baseline out of nothing. The ORDER BY inside OVER is the entire meaning of 'previous': order by the month key, not by session count — ordering by the measure makes 'previous month' mean 'the month with the next-lower volume', which is a different and quietly wrong series. Ties in the sort key would need a tie-break, but a month key is unique by construction — say that, rather than assuming it. On this book the walk reads 8, 9, 8, 7 … with deltas +1, −1, −1 — small numbers, which is exactly why the edges matter: a wrong ORDER BY on a flat series is invisible until the quarter it isn't.",
      tag: "windows",
    },
    {
      id: "plaid-t6",
      q: "WHERE call_count > (SELECT AVG(call_count) FROM sessions WHERE region = 'antarctica') — no sessions run in antarctica. Walk me through what happens.",
      a: "A scalar subquery is contractually zero-or-one rows, one column. One row: its value joins the comparison. Zero rows: it yields NULL — not an error, not zero — and call_count > NULL is UNKNOWN, so WHERE passes nothing: an above-average-institution report that returns empty while looking perfectly healthy. That's the empty-inner-query bug, and it ships on filtered staging tables far more often than on full ones — 'it worked for US sessions' is the bug report. The strong answer also names the other contract edge: two rows from a scalar subquery IS an error, so 'scalar' is a promise the inner fold's GROUP BY has to keep. The correlated cousin — above THIS institution's own trailing average, re-run per outer row — is a different question with a different cost. At Plaid the follow-up is always: what population did the inner fold cover, and does the empty result mean 'nothing is above average' or 'nothing was measured'? Those are opposite incidents.",
      tag: "subqueries",
    },
    {
      id: "plaid-t7",
      q: "Verification latency averages 2.98 days with a 2-to-4 spread. How do you compute it, bucket it, and where does BETWEEN break?",
      a: "Compute: JULIANDAY(shipped_at) - JULIANDAY(created_at) per completed session, aggregate, then ROUND(..., 2) exactly once at the display edge — 2.98 is a single final round, not a per-row one. Restrict to shipped_at IS NOT NULL explicitly and say the population (82 completions) — relying on AVG's NULL-skipping hides the restriction inside the function. Bucket by SUBSTR(created_at, 1, 7) for the monthly calendar, or CASE-band the latency itself for the SLA histogram. Windows: half-open intervals — created_at >= '2024-03-01' AND < '2024-04-01' — never BETWEEN, which is inclusive both ends and double-counts exactly the midnight boundary when month-end sessions land. And the latency distribution matters more than the mean: a tight 2-to-4 spread is a stable SLA; the same mean with a 90-day tail is an incident queue — the query should print the spread, not just the average.",
      tag: "dates",
    },
    {
      id: "plaid-t8",
      q: "Your conversion dashboard shows 50.5% overall, but the per-region tiles show 94.7%, 91.9%, 89%, and 100%. Nobody believes the tiles. Diagnose it.",
      a: "The tiles and the headline are computing different fractions. Overall: 52 verified of 103 sessions — all sessions, including the 14 pending that haven't resolved. The regional tiles are almost certainly computing verified ÷ RESOLVED sessions (excluding pending from the denominator), which flatters every region and hits 100% in LATAM where nothing is parked mid-flight. Both queries are correct SQL; they disagree because the denominators disagree. The fix is definitional, not computational: pick one population (all sessions for the honest funnel; terminal-only, renamed, for the resolution rate), state it in the title, and make the tiles and the headline share it. Then verify by reconciliation: region tiles weighted by region session counts (45, 37, 19, 2) must fold back to the headline. At Plaid a denominator that silently changes between the summary and its slices isn't a rounding bug — it's the dashboard version of the funnel lying, and it's the data-quality finding the reviewer actually wants.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "plaid-mcq-1",
      prompt: "A usage settlement of 222,950 cents (real row: payment #24) is reported as ROUND(amount_cents / 100, 2). What prints?",
      choices: [
        "2229.50 — integer division keeps the cents",
        "2229 — the .50 was truncated before ROUND ran",
        "2230 — SQLite rounds the division up",
        "2229.00 — ROUND heals the truncation",
      ],
      answer: 1,
      why: "Two INTEGERs divide with truncation: 222950 / 100 = 2229 before ROUND ever runs. The house shape is amount_cents / 100.0 — real division first, ROUND last — which prints the true 2229.50.",
      notes: [
        { choice: 0, why: "Integer division discards the remainder entirely — 222950/100 is 2229, and this is a real odd-cent settlement row, so the loss is on the books." },
        { choice: 2, why: "Nothing rounds the division — SQLite truncates it. ROUND runs downstream on the already-truncated 2229 and can only leave it there." },
      ],
      difficulty: "easy",
    },
    {
      id: "plaid-mcq-2",
      prompt: "103 sessions: 52 verified, 30 linked, 14 pending, 7 abandoned. SELECT status, COUNT(*) FROM orders GROUP BY status returns how many rows?",
      choices: ["4", "103", "82", "21"],
      answer: 0,
      why: "GROUP BY folds to one row per distinct status — the 4 outcomes present — and the counts sum to 103. The fold's output grain is the group, not the input row.",
      notes: [
        { choice: 1, why: "103 is the input row count. GROUP BY collapses it; you'd only see 103 rows folding on a 103-distinct-value column." },
        { choice: 2, why: "82 is the completed-session count — a filtered population, not a fold output. The GROUP BY keeps all 4 status groups including the 21 unresolved." },
      ],
      difficulty: "easy",
    },
    {
      id: "plaid-mcq-3",
      prompt: "Which expression counts SESSIONS served (not endpoint-call rows) from the endpoint-calls table?",
      choices: ["COUNT(*)", "COUNT(product_id)", "COUNT(DISTINCT order_id)", "SUM(order_id)"],
      answer: 2,
      why: "COUNT(*) and COUNT(product_id) both read 251 — one row per call. COUNT(DISTINCT order_id) folds the calls back to 103 sessions. Both grains are real; the scorecard must name which one it prints.",
      notes: [
        { choice: 1, why: "COUNT(column) skips NULLs, not duplicates — with a NOT NULL FK it equals COUNT(*) at 251. DISTINCT is the fold; NULL-skipping isn't." },
        { choice: 3, why: "SUM adds primary keys — a meaningless number that changes when any session fires another call. Keys are for joining, never for folding." },
      ],
      difficulty: "easy",
    },
    {
      id: "plaid-mcq-4",
      prompt: "Overall conversion reads 52 of 103 (50.5%). A regional tile computes the same numerator over 82 sessions. What most likely happened?",
      choices: [
        "Rounding drift between two engines",
        "The tile's denominator excludes pending sessions — it's a resolution rate wearing the conversion name",
        "The tile double-counts abandoned sessions",
        "The tile divides by 100.0 twice",
      ],
      answer: 1,
      why: "52 of 82 is a different fraction: excluding the 14 pending sessions from the denominator turns conversion into resolution. Both are real metrics — but a dashboard where the headline and its slices use different denominators is the disagreement reviewers can't un-see.",
      notes: [
        { choice: 0, why: "50.5 versus 63.4 isn't rounding — the denominators differ by 21 sessions. Rounding drift lives in the third decimal, not 13 points." },
        { choice: 2, why: "Double-counting abandoned sessions would inflate the numerator, not shrink the denominator — and the tile's numerator matches the headline's exactly." },
      ],
      difficulty: "medium",
    },
    {
      id: "plaid-mcq-5",
      prompt: "Abandoned-session share per region: which expression is safe against integer division AND denominator drift?",
      choices: [
        "SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) * 100",
        "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*)",
        "100 * COUNT(status = 'cancelled') / COUNT(*)",
        "The same CASE share over rows pre-filtered to cancelled in WHERE",
      ],
      answer: 1,
      why: "100.0 promotes to real arithmetic BEFORE the division, and COUNT(*) runs over the same unfiltered fold as the numerator — no drift. Pre-filtering to cancelled rows makes every region's share read 100%.",
      notes: [
        { choice: 0, why: "The logic is right but the INTEGER 100 multiplies after an integer division that already truncated — APAC's 8.1% computes as 3/37 = 0, then 0 × 100." },
        { choice: 2, why: "COUNT(boolean) counts non-NULL results, and the comparison returns 0 or 1, never NULL — the 'share' reads ~100 for every region." },
      ],
      difficulty: "medium",
    },
    {
      id: "plaid-mcq-6",
      prompt: "Sessions LEFT JOIN endpoint-call folds, then WHERE s.region = 'EU' to cut to one region. What happens to sessions that fired zero completed calls?",
      choices: [
        "Nothing — the join already kept them",
        "They vanish: NULL region fails the test? No — the region survives, but the call-count filter on the right table's columns would delete them",
        "They appear once with zero calls",
        "SQLite keeps them and fills region with 'EU'",
      ],
      answer: 1,
      why: "Filtering the LEFT-joined (right) table's columns in WHERE discards the NULL-payload rows — the zero-call sessions — silently converting the join to an INNER. Region lives on the left table so it's safe; any predicate on the joined call columns belongs in ON or in a pre-aggregated fold.",
      notes: [
        { choice: 0, why: "The join kept them, but a WHERE on right-table columns un-keeps them — filter placement, not join type, decided the population." },
        { choice: 2, why: "A WHERE can't manufacture zero-rows — that's COALESCE territory, and only when the NULL genuinely means zero rather than 'no calls fired'." },
      ],
      difficulty: "medium",
    },
    {
      id: "plaid-mcq-7",
      prompt: "Two institutions tie at 40 endpoint calls each. ORDER BY calls DESC, institution_name produces a scorecard that…",
      choices: [
        "Errors on the tie",
        "Orders the tie deterministically by name — reproducible between runs",
        "Alternates the tie order on each run",
        "Merges the two institutions into one row",
      ],
      answer: 1,
      why: "The explicit secondary sort key resolves the tie deterministically: same order every run, on every engine. An unspecified tie-break leaves the order to the planner — which is usually stable and never guaranteed, exactly when the scorecard gets screenshotted into a deck.",
      notes: [
        { choice: 0, why: "Ties don't error SQL — they make the order unspecified. The failure is nondeterminism, not an exception." },
        { choice: 2, why: "Nondeterministic doesn't mean alternating — it means unguaranteed. The scorecard can look fine for weeks, which is precisely what makes it dangerous." },
      ],
      difficulty: "medium",
    },
    {
      id: "plaid-mcq-8",
      prompt: "The latency metric: AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) over all 103 sessions, where 21 have NULL shipped_at. What actually computes?",
      choices: [
        "An average over 103 sessions, pending counting as zero days",
        "An average over the 82 completed sessions — AVG skips NULLs — while the report claims 103",
        "A NULL result, because any NULL poisons AVG",
        "An error: JULIANDAY of NULL is invalid",
      ],
      answer: 1,
      why: "AVG ignores NULL rows, so the arithmetic runs over the 82 completions — but the query's name says all sessions. The honest fix is explicit: WHERE shipped_at IS NOT NULL plus a population count beside the metric, so '2.98 days' and 'over 82 completions' travel together.",
      notes: [
        { choice: 0, why: "AVG never converts NULL to zero — that's COALESCE. Zero-day pendings would drag the mean toward zero; skipping is what actually happens, silently." },
        { choice: 2, why: "NULL poisons row-level comparisons, not aggregates — SUM/AVG/COUNT(column) all skip NULLs by design. The danger is the skipped rows nobody counted." },
      ],
      difficulty: "hard",
    },
    {
      id: "plaid-mcq-9",
      prompt: "Your LAG volume walk prints NULL in the first month's delta column. The deck wants 'no blanks'. What's the right move?",
      choices: [
        "COALESCE the delta to 0 — the first month simply didn't change",
        "COALESCE the delta to 0 and label the column 'change vs prior month (0 for first month)'",
        "Keep the NULL and explain: no prior month means no delta — the blank IS the meaning",
        "Drop the first month's row entirely",
      ],
      answer: 2,
      why: "NULL here is semantic: 'no prior month exists', not 'zero change'. Coalescing to 0 manufactures a baseline and makes the first month look flat-on-purpose; dropping the row hides it from the axis. The deck label fixes the presentation complaint without lying about the data.",
      notes: [
        { choice: 0, why: "Zero is a measurement (flat month); NULL is an absence (no comparison possible). conflating them is how a baseline gets invented." },
        { choice: 1, why: "The label is honest but the value isn't — a first-month bar of 0 still reads as 'flat' in every chart the deck feeds downstream." },
      ],
      difficulty: "hard",
    },
    {
      id: "plaid-mcq-10",
      prompt: "WHERE session_id NOT IN (SELECT session_id FROM incidents) — incidents.session_id is nullable in staging. What can happen?",
      choices: [
        "It runs slower but stays correct",
        "One NULL empties the entire result — every session fails the test",
        "NULL session_ids are treated as unmatched and kept",
        "SQLite rewrites NOT IN as an anti-join automatically",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN and NOT UNKNOWN is still UNKNOWN. One stray NULL silently returns zero rows. The NULL-proof shapes: NOT EXISTS, or LEFT JOIN … IS NULL.",
      notes: [
        { choice: 0, why: "The failure is correctness, not latency — an empty 'clean sessions' report that looks like an all-clear to the on-call rotation." },
        { choice: 2, why: "NOT IN has no 'treat as unmatched' mode. UNKNOWN poisons the whole list; only NOT EXISTS or the IS NULL anti-join is NULL-safe." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-plaid-1",
      tier: "medium",
      topic: "j3",
      universe: "supplier",
      title: "Institution scorecard: endpoint calls and sessions",
      brief:
        "Partnerships memo, before the bank review: the scorecard reads per institution at two grains from one chain — endpoint calls fired and distinct sessions served. The chain is sessions → endpoint calls → endpoints → institutions. Probed scale: 251 endpoint calls across 103 sessions, 16 endpoints, 6 institutions on this book; one institution carries 56 calls from 45 sessions, the quietest 25 from 25, and two tie at 40 — hence the explicit name tie-break. Count the session grain with COUNT(DISTINCT) or the fan-out blurs it.",
      ask: "Return each institution with its endpoint-call count and distinct-session count, biggest call load first (name as tie-break).",
      template:
        "SELECT s.name AS institution,\n       COUNT(*) AS endpoint_calls,\n       COUNT(DISTINCT o.id) AS sessions\nFROM order_items oi\nJOIN products p ON p.id = oi.{1}\nJOIN suppliers s ON s.id = p.{2}\nJOIN orders o ON o.id = oi.{3}\nGROUP BY s.name\nORDER BY endpoint_calls {4}, s.name;",
      slots: [
        {
          answer: "product_id",
          kind: "keyword",
          label: "the call→endpoint key",
          why: "Each endpoint call names its endpoint: oi.product_id. Substituting oi.id joins calls to endpoints by row-id coincidence — calls 1-16 pair with endpoints 1-16 and every other call vanishes, so the scorecard reads a book that mostly never called.",
        },
        {
          answer: "supplier_id",
          kind: "keyword",
          label: "the endpoint→institution key",
          why: "Endpoints run on institutions via p.supplier_id. Substituting p.id pairs endpoints to institutions by matching key values — plausible-looking counts attributed to the wrong banks, the silent mis-pairing no error message announces.",
        },
        {
          answer: "order_id",
          kind: "keyword",
          label: "the call→session key",
          why: "Each call belongs to a session via oi.order_id. Substituting oi.product_id binds sessions to calls by endpoint number — a session 'served' wherever its endpoint number matches an order id, and COUNT(DISTINCT o.id) inherits the fiction.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-load-first direction",
          why: "The bank review opens with load: 56 calls down to 25. ASC is a correct query answering the opposite question — it leads with the quietest institution and buries the one capacity planning acts on.",
        },
      ],
      distractors: ["id", "quantity", "category", "name", "ASC"],
      walkthrough:
        "A three-hop chain, every key deliberate. The chain binds calls to endpoints (oi.product_id = p.id), endpoints to institutions (p.supplier_id = s.id), and calls back to sessions (oi.order_id = o.id) — three joins, and each substituted key fails differently: oi.id pairs the first 16 calls by coincidence and drops the rest, p.id misattributes endpoints to banks with no error, oi.product_id binds sessions by endpoint number. Folded per institution: COUNT(*) is the call grain — 56, 47, 43, 40, 40, 25 — and COUNT(DISTINCT o.id) is the session grain — 45, 41, 38, 34, 35, 25 — the fan-out can't inflate a DISTINCT, so depth-per-session reads honestly (Midwest 56/45 ≈ 1.2, Andes 25/25 = 1.0). The tie at 40 calls (Alpine, Pacific) is broken by s.name — deterministic, reproducible, screenshot-safe. ASC inverts the board and 'name' after calls without a comma is a syntax error. Two grains, one chain, a stated tie-break — the scorecard the partnerships meeting actually walks.",
    },
    {
      id: "cs-plaid-2",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "Session volume walk: the LAG calendar",
      brief:
        "Board-deck memo: the volume walk charts link sessions month over month, deltas annotated, and the chart gets quoted — so the edges must be honest. Probed calendar: 103 sessions across 14 months, 6 to 9 sessions a month, running 8, 9, 8, 7 … The build stages a month-bucket fold (SUBSTR month keys), deltas with LAG over the month order, and prints the first month's delta as NULL — *no prior month, no delta* — because coalescing that to zero manufactures a baseline the board will repeat.",
      ask: "Return each month with its session count and the month-over-month delta (NULL for the first month), in calendar order.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         COUNT(*) AS sessions\n  FROM orders\n  GROUP BY SUBSTR(created_at, 1, 7)\n)\nSELECT month,\n       sessions,\n       sessions {1} {2}(sessions) OVER (ORDER BY month) AS delta\nFROM monthly\nORDER BY {3};",
      slots: [
        {
          answer: "-",
          kind: "keyword",
          label: "the delta operator",
          why: "Month-over-month is subtraction: sessions - LAG(...). A plus prints a running sum masquerading as deltas, and multiply or divide produce series with no month-over-month meaning at all — plausible numbers, wrong question.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the previous-row lookup",
          why: "Delta = current − previous: LAG(sessions) OVER (ORDER BY month). LEAD looks the wrong way (deltas flip sign), SUM hands back a running total, ROW_NUMBER a row index — each a different series wearing the delta name.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the calendar ordering",
          why: "The walk orders by the month key — that's what makes 'previous' mean 'previous month'. Ordering by the session count makes 'previous' mean 'the next-lower volume', a different and quietly wrong series.",
        },
      ],
      distractors: ["LEAD", "SUM", "ROW_NUMBER", "FIRST_VALUE", "+", "sessions"],
      walkthrough:
        "Stage the calendar, then walk it. The CTE folds 103 sessions into 14 month buckets — SUBSTR(created_at, 1, 7) as the key, COUNT(*) as the measure: 8, 9, 8, 7, 8, 6, 8, 7, 9, 7, 6, 7, 6, 7 — the probed trend. The outer SELECT walks it: sessions − LAG(sessions) OVER (ORDER BY month) gives +1, −1, −1, +1, −2, +2, −1, +2, −2, −1, +1, −1, +1 — June's −2 and September's +2 are the only moves the deck annotates, and the first row's delta is NULL *on purpose*: no prior month, no comparison, and the board quote stays honest. The edges are where the distractors bite: + turns the delta into a running sum wearing the delta name, LEAD looks forward and flips every sign, SUM replaces the previous-row lookup with a cumulative total, ROW_NUMBER subtracts row indices, FIRST_VALUE freezes every delta to the distance from January, and ORDER BY sessions reshuffles the walk by volume — a 'trend' that no longer moves through time. Calendar, walk, honest first row — the chart the board actually sees.",
    },
  ],

  problems: [
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded confirmation share — the D+1 conversion read, where unmatched sessions count as failures and the denominator is stated in the title." },
    { slug: "customer-who-visited-but-did-not-transact", why: "The silent-failure anti-join — sessions that opened but fired no completed call: the incident list LEFT JOIN + IS NULL exists to surface." },
    { slug: "students-and-examinations", why: "The session × endpoint × subject chain with zero-filled counts — per-institution scorecards where institutions with no traffic still appear, at zero, not missing." },
    { slug: "hopper-company-queries-ii", why: "Monthly dropout rates by group — the per-institution reliability shape: rate by month, worst groups surfaced, empty groups handled rather than dropped." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU in one pass — the stickiness ratio reliability reports weekly, a two-window fold whose denominators must both be named." },
    { slug: "rolling-7d-actives", why: "Trailing 7-day actives — the smoothed traffic curve every reliability dashboard runs on, frame edges and all." },
    { slug: "week-over-week-churn", why: "LAG between weekly buckets — the WoW movement read that turns the volume calendar into a trend the partnerships meeting can act on." },
    { slug: "reported-posts", why: "Conditional error counts per day — flagged sessions folded alongside totals, the taxonomy census in its simplest graded form." },
    { slug: "daily-leads-and-partners", why: "Per-day two-grain counts — sessions and institutions per day side by side, the daily ops snapshot's exact shape." },
    { slug: "leetflex-banned-accounts", why: "Overlapping-interval incident detection — sessions whose activity crosses an incident window, pure timestamp interval logic." },
    { slug: "books-with-null-ratings", why: "COUNT(column) versus COUNT(*) on nullable fields — the staging-data audit that finds the NULLs silently shrinking every rate." },
    { slug: "find-customer-referee", why: "NULL-safe filtering on an optional field — the referral-column read where = 'x' and the NULL-safe variant disagree by exactly the missing rows." },
    { slug: "find-peak-calling-hours-for-each-city", why: "Argmax per group — peak hour per institution, the scorecard's load-planning line, tie-break included." },
    { slug: "growth-accounting", why: "LAG status transitions classified — new, retained, reactivated, churned: the growth-accounting walk applied to app sessions." },
    { slug: "second-day-confirmation", why: "D+1 confirmation retention — did the session that linked yesterday come back verified today, the follow-through metric partners ask about." },
    { slug: "ad-free-sessions", why: "The clean-population anti-join — sessions untouched by incidents, NOT EXISTS-shaped, the control group every reliability comparison needs." },
  ],
};
