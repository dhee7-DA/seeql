// Slack — kit 2 of the SaaS & Enterprise domain (Batch G).
// Workplace activity telemetry: the storefront db read as a workspace
// sandbox — customers are workspaces, orders are renewal events (one order =
// one quarter on the platform), order_items are seat/channel lines, and the
// status column is the lifecycle ladder (pending = trial/open evaluation,
// shipped = onboarding in flight, delivered = activated, cancelled = churned
// before activation). Activation ladders, DAU/WAU-style stickiness counts,
// message funnels, week-over-week movement and churn-risk collections.
// Pool provenance: the registry tags only 2 sql rows for Slack
// (feature-adoption-windows, trial-to-paid-funnel) — those lead the topics
// and problem pool, the rest is theme-curated and says so. Case briefs quote
// probed figures from scripts/company-facts.md (probed 2026-10-12); every
// case slot is mechanically verified against db/custom.db by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const slackKit: CompanyKit = {
  id: "slack",
  domainId: "saas",
  name: "Slack",
  tagline: "Workplace activity and retention telemetry",
  accent: "text-violet-300",

  brief: [
    "Slack is workplace telemetry: channels, messages, huddles and workflows — and a product culture that treats usage as the truth and license counts as the lagging echo. The analyst reality is that every Slack number is a distinct-count over an event stream: DAU and WAU are `COUNT(DISTINCT user)` at two windows, stickiness is their ratio, activation is a first-event timestamp, and churn is a workspace whose signal went quiet. This kit maps that world honestly onto the storefront db: the **16 customers** are workspaces, the **103 orders** are renewal events (one order = one quarter on the platform), the 251 `order_items` are seat and channel lines, and the status ladder reads pending = trial, shipped = onboarding in flight, {emerald:delivered} = activated, cancelled = churned before activation.",
    "The telemetry stack has three grains and the db carries all three. Workspace grain: the repeat-renewal curve is the {emerald:retention} curve — 2 workspaces with a single renewal, 9 sitting at 2–4, 1 at 5, and 4 embedded accounts at 10+ (13, 14, 17 and 24 renewals). Event grain: the **14-month calendar** (2024-01 to 2025-02) is the activity spine, with a July trough at 1,193.86 that every trend read has to survive. Money grain: 28 renewal invoices and 27 settlements in INTEGER cents — where **6 invoices carrying 15,217 cents** have no settlement row at all, the {rose:churn-risk} queue the collections review reads first.",
    "Interview screens are funnel-shaped and denominator-obsessed. A typical loop walks from an **activation census** (workspaces per lifecycle stage in one pass) into a stickiness or conversion ratio where the two counts must come from the same population, then escalates into either a week-over-week movement (`LAG` across the activity spine, first row NULL by definition) or a {rose:churn-window} read: workspaces whose renewals stopped, invoices without settlements, *status columns that lie*. Follow-ups sound like product reviews: 'does a cancelled-before-activation workspace count in your funnel?', 'is that per workspace or per seat?', 'what does the first row of your LAG return?'",
    "Preparation strategy: the registry tags only 2 SQL problems for Slack (`feature-adoption-windows`, `trial-to-paid-funnel`) — they lead the pool, and the remaining 30 topic slugs and 16 problems are theme-curated to known screen shapes: activation funnels, rolling distinct counts, streaks and gaps, plan-migration LAG paths and collection anti-joins. Then run both case studies on the live db: one rebuilds the workspace activation ladder growth reviews open with, the other rebuilds the renewal-collection gap finance reads before the board meets. The bar to clear: state **the window, the distinct grain and the denominator** before you compute anything.",
  ],

  dayInLife: [
    "**08:45 —** The day starts with the telemetry pulse. A product analyst opens the usage dashboard before standup: did last night's activity events land, does the weekly active count reconcile with the daily folds that compose it, are any workspaces {rose:going dark}? The first query is almost always a distinct-count check — WAU rebuilt from DAU-shaped folds, row counts versus the trailing band — because a telemetry number that can't reconcile against its own parts is *a page, not a slide*. The analyst who can write that diff query is the one product reviews wait on.",
    "**11:30 —** Midday is funnel translation. A growth PM wants the trial-to-activated ladder with **honest denominators**; customer success wants workspaces whose renewal signal went quiet; finance wants the renewal-collection queue — `invoices` with no settlement rows, however their status column reads. Each ask is a join, a conditional count and one judgment call about windows: does 'activated' mean first delivered renewal, and does the denominator include workspaces still in trial? The analyst writes the query twice — once to answer, once with the definition spelled out so the number survives the product review.",
    "**15:00 —** The afternoon tilts toward movement and risk. Week-over-week active counts go out with `LAG` deltas; the July trough in the activity spine gets annotated rather than explained away; and the churn-risk queue — **6 renewal invoices, 15,217 cents unsettled**, one of them status 'paid' with zero settlement rows — goes to collections with the anti-join SQL attached. This is the stakeholder hour: a weekly product review where every headline carries its population definition, and a workspace going quiet is presented as a lifecycle event, not a data gap.",
    "**17:15 —** End of day closes the loop the morning opened. The distinct-count reconciliation from standup gets logged with its window definition; the churn-risk anti-join ships to collections with its population spelled out — every `invoices` row considered, settled or not; and tomorrow's review queue is already staged with queries that state the window, the distinct grain and the denominator. The best-prepared candidate knows this rhythm: Slack SQL exists to keep activity numbers honest *while everyone quotes them from memory*.",
  ],

  metrics: [
    { name: "DAU/WAU stickiness", what: "Daily distinct actives ÷ weekly distinct actives — two COUNT(DISTINCT) folds over one population. The single number that says whether the workspace is a habit or a login." },
    { name: "Workspace activation rate", what: "Activated workspaces ÷ all workspaces ever provisioned. On this db 'activated' maps to a delivered renewal — 52 of 103 events — and the denominator is every workspace, not every event." },
    { name: "Trial-to-paid conversion", what: "Workspaces that moved pending → paid renewal ÷ all that entered pending. The registry-tagged funnel: conditional counts over a staged population, denominators stated out loud." },
    { name: "Message funnel completion", what: "Share of workspaces completing each step of the send-first-session ladder — join, post, react. Each step's denominator is the previous step's survivors, never the raw install base." },
    { name: "Seats per renewal", what: "Line items (251) folded back to renewals (103) — the expansion signal that says a workspace is deepening, not just renewing. The fan-out trap lives here: COUNT(*) after the join counts lines, not renewals." },
    { name: "Churn-risk exposure", what: "Renewal invoices with no settlement row: 6 invoices, 15,217 cents on this db — including one marked 'paid' with zero payment rows. The anti-join queue collections reads first." },
    { name: "Week-over-week actives", what: "This week's distinct actives beside last week's, delta attached via LAG. The first week's movement is NULL by definition — baseline, never a fabricated zero." },
    { name: "Streak depth", what: "Longest run of consecutive active periods per workspace — gaps-and-islands over the activity spine. Depth separates the 4 embedded workspaces (10+ renewals) from the 2 single-touch ones." },
  ],

  topics: [
    {
      name: "Workspace activation counts",
      why: "Activation is a count with a definition: workspaces that reached their first delivered renewal, folded per period. The screen checks whether you can census a lifecycle (trial, onboarding, activated, churned) without letting cancelled events pollute the activated total.",
      slugs: ["trial-to-paid-funnel", "game-play-analysis-i", "article-views-ii"],
    },
    {
      name: "Activation & message funnels",
      why: "Funnel reporting is chained conditional counts: each step's denominator is the previous step's survivors. Slack screens drill step-to-step conversion because a funnel that silently resets denominators mid-ladder reports a conversion story that never happened.",
      slugs: ["funnel-step-conversion", "ads-funnel", "email-engagement-funnel"],
    },
    {
      name: "Adoption windows & feature uptake",
      why: "A feature launch is judged inside a window: uptake among workspaces exposed, conditional averages over a staged population. The registry-tagged adoption-windows shape — conditional AVG over event ladders — is the deliverable feature teams live on.",
      slugs: ["feature-adoption-windows", "user-activity-for-the-past-30-days-i", "new-users-daily-count"],
    },
    {
      name: "Streaks & the retention curve",
      why: "Engagement depth is streaks and curves, not snapshots: consecutive active runs, strictly increasing renewal counts, first-event cohorts joined back. Gaps-and-islands and first-event shapes are how 'engaged workspace' becomes a query instead of an adjective.",
      slugs: ["active-users", "find-loyal-customers", "customers-with-strictly-increasing-purchases"],
    },
    {
      name: "Rolling windows & stickiness",
      why: "DAU/WAU stickiness, rolling 7-day distinct actives and trailing averages are the telemetry toolkit: two distinct-count folds over windows that must be stated, because a rolling window that drifts a day changes the number without changing the dashboard.",
      slugs: ["dau-wau-stickiness", "rolling-7d-actives", "restaurant-growth"],
    },
    {
      name: "Workspace ↔ billing joins",
      why: "Renewals inherit workspace attributes through joins, and billing truth lives one join deeper in invoices and payments. The screen checks survival rules: which workspaces survive an INNER join to renewals, and what a LEFT JOIN keeps when the renewal never came.",
      slugs: ["top-travellers", "confirmation-rate", "bank-account-summary-ii"],
    },
    {
      name: "Lifecycle tiers with CASE",
      why: "Lifecycle ladders are CASE buckets: single-renewal, engaged, expanding, embedded — cut on renewal counts with exhaustive, ordered arms. Ordering matters twice: inside the CASE (first match wins) and in the report (biggest tier first).",
      slugs: ["the-winner-university", "calculate-orders-within-each-interval", "delinquency-buckets"],
    },
    {
      name: "Churn-risk anti-joins",
      why: "Churn detection is absence modeling: workspaces with no recent event, renewals with no settlement. LEFT JOIN + IS NULL and its NOT EXISTS twin are the shapes — and the db's 6 unsettled invoices show why the status column cannot be trusted over the payment rows.",
      slugs: ["find-churn-risk-customers", "customer-who-visited-but-did-not-transact", "dormant-reactivation"],
    },
    {
      name: "First-event subqueries",
      why: "Activation date, first-channel-joined, day-1 cohort membership — every 'first' is a subquery or a window staged before the join back. Screens probe the empty-inner case: a cohort definition that matches nothing must return a confident zero, not a silent hole.",
      slugs: ["game-play-analysis-iv", "market-analysis-i", "employees-whose-manager-left-the-company"],
    },
    {
      name: "Movement waterfalls & plan paths",
      why: "Week-over-week movement and plan migrations are LAG stories: this period beside last, transitions classified, first row NULL. The screen wants the movement named (new, returning, lapsing) and the edge row handled, because telemetry boards live on deltas.",
      slugs: ["week-over-week-churn", "plan-migration-paths", "the-change-in-global-rankings"],
    },
  ],

  theory: [
    {
      id: "slack-t1",
      q: "Define DAU/WAU stickiness in SQL terms — and why does the ratio have to be two DISTINCT counts over the same workspace population?",
      a: "Stickiness is the share of a week's actives who showed up on an average day: COUNT(DISTINCT user_id) per day ÷ COUNT(DISTINCT user_id) per week. Both counts are DISTINCT because the raw event stream has many rows per person per window — 251 line items against 103 orders on this db is the same fan-out in miniature. And both folds must run over the SAME population and window definition: a daily fold over one day set against a weekly fold over a different workspace set produces a plausible-looking ratio of two different things. The strong answer names all three decisions — window, grain, population — before writing the fold, because stickiness is a definition pretending to be a number, and the reviewer is checking whether you know it.",
      tag: "aggregation",
    },
    {
      id: "slack-t2",
      q: "You LEFT JOIN workspaces to their renewal events, then write WHERE r.total > 0 in the same query. What did you just do to the join — and what is the fix?",
      a: "You silently converted the LEFT JOIN into an INNER one. Every workspace whose renewal never arrived carries NULL renewal columns after the LEFT JOIN; total > NULL is UNKNOWN, so WHERE discards those rows — and the never-renewed workspaces, often the population of interest, vanish from a report that still says LEFT JOIN in the text. The fixes, in order of preference: move the predicate into the ON clause where it constrains the match without filtering the left side; or filter in an outer query after the join has done its preserving work; or accept inner-join semantics deliberately and say so in the metric's name. On lifecycle data this trap is the whole game — the workspaces with no renewals ARE the churn-risk population, and one WHERE clause deletes them.",
      tag: "joins",
    },
    {
      id: "slack-t3",
      q: "The weekly actives board shows this week beside last week with the delta attached. How does LAG build that, and what does the first row return?",
      a: "Stage the weekly fold — GROUP BY week, COUNT(DISTINCT workspace) — then LAG(active_workspaces) OVER (ORDER BY week) reaches one row back, and the delta is this week minus that. The first row returns NULL: there is no prior week, so the movement is baseline, not zero. Coalescing that NULL to 0 is the classic board lie — it reads as 'flat week' when the truth is 'no comparison exists', and every downstream week-over-week average inherits the fiction. The rest of the discipline is ordering: the window's ORDER BY week must match the spine exactly, because LAG over a mis-ordered spine compares against the wrong week and the delta becomes a random number with a confident label. Telemetry boards are delta boards, and deltas are only as honest as the row they reach back to.",
      tag: "windows",
    },
    {
      id: "slack-t4",
      q: "In the trial-to-activated funnel, which filters live in WHERE and which live in HAVING — and what breaks when they swap?",
      a: "Row-level facts live in WHERE: the entry-window predicate, the lifecycle stage that defines the population — applied before any fold, so the funnel's denominator is fixed once and honestly. Group-level facts live in HAVING: 'cohorts with at least 30 workspaces', 'weeks that cleared the activity bar' — judgments that only exist after GROUP BY forms the groups. Swap them and two different failures follow: an aggregate in WHERE errors outright (COUNT does not exist before groups form), and a row filter in HAVING can only see group-level columns, so the stage predicate either errors or silently does nothing useful. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is the funnel's plumbing: population first, fold second, gate third. Saying that out loud is what the interviewer is listening for.",
      tag: "pipeline",
    },
    {
      id: "slack-t5",
      q: "Your retention matrix shows NULLs where a cohort had no renewals in a period. Zero-fill them or leave them — and what does each choice claim about the data?",
      a: "NULL and zero are different claims. NULL says 'this cohort-period cell was never observed' — the cohort had not yet reached that tenure, so the question does not apply. Zero says 'observed and empty' — the cohort existed and produced nothing. Zero-filling pre-tenure cells fabricates engagement history that never happened and drags every row-average down; leaving post-tenure gaps as NULL hides true dormancy behind an absence. The policy: COALESCE only where the cell was observable (tenure reached), leave pre-tenure as NULL, and label which is which in the query. The mechanical backing: COUNT(col) skips NULLs while COUNT(*) keeps the row, so the same matrix computed both ways disagrees exactly at the unobserved cells — which is why the fill decision is made in the query, not in the chart tool.",
      tag: "nulls",
    },
    {
      id: "slack-t6",
      q: "How do you compute each workspace's activation date — its first delivered renewal — and then join it back for a day-1 cohort read? Name the shapes and their failure modes.",
      a: "Two honest shapes. The grouped subquery: fold MIN(event_time) per workspace, then join back on workspace id — readable, one pass over the fold, but it must re-apply any stage filter in BOTH places or the 'first delivered' becomes 'first ever'. The window shape: MIN(event_time) OVER (PARTITION BY workspace) keeps every row and attaches the first event to each — no join-back needed, no double filter, at the cost of carrying the full row count. The failure modes are shared: an empty inner fold (no delivered events in the window) yields NULL activation dates that silently empty every downstream comparison, and forgetting the stage filter double-counts trial events as activation. On this db the activation read is 52 delivered events folded back to 16 workspaces — and the 2 single-renewal workspaces it surfaces are exactly the cohort CS wants named.",
      tag: "subqueries",
    },
    {
      id: "slack-t7",
      q: "A workspace is 'engaged' when it has been active in consecutive periods. How do you compute streaks in SQL — and where does the calendar spine earn its keep?",
      a: "Streaks are gaps-and-islands: sort each workspace's active periods, number them with ROW_NUMBER, and subtract — active_period minus row_number is constant within a streak, so GROUP BY workspace, that constant, and take MAX(COUNT(*)). The arithmetic is JULIANDAY (or a date-diff) either side of the fold. Where it breaks: the calendar must be dense. If a workspace's quiet periods simply have no rows, the gap-detection never sees the gap — the spine (a generated series of every period in range) LEFT JOINed to the events is what turns absence into a row that breaks a streak. The second discipline is the window definition: consecutive DAYS is not consecutive BUSINESS days is not consecutive renewals; each definition produces a different streak for the same workspace. The strong answer builds the spine, states the period definition, and lets the islands arithmetic do the rest.",
      tag: "dates",
    },
    {
      id: "slack-t8",
      q: "Finance reads 6 renewal invoices with no settlement rows; one of them is statused 'paid'. Which query do you trust, how do you write it, and what does that say about status columns?",
      a: "Trust the payment rows — the anti-join: invoices LEFT JOIN payments ON p.invoice_id = i.id WHERE p.id IS NULL. On this db that returns 6 invoices carrying 15,217 cents, and inside them sits the paid-with-no-payments anomaly: a status column making a claim the ledger never recorded. The mirror anomaly exists too — a void invoice WITH a settlement row (925 cents) — which is why the check runs both directions: settlements without valid invoices, and invoices without settlements. Status columns are assertions by some upstream system; payment rows are events that happened, and reconciliation culture here treats the event stream as the ledger of record. The money rule rides along: amount_cents / 100.0, never /100, or the 15,217 cents prints as 152 and the exposure report loses its cents to integer truncation. The deliverable is the row-level query that shows WHICH invoices disagree — not a summed apology.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "slack-mcq-1",
      prompt: "A renewal order's status reads 'pending'. Where does that workspace sit in the lifecycle ladder?",
      choices: ["Trial / open evaluation — 14 of 103 events on this db", "Activated — the renewal completed", "Onboarding in flight", "Churned before activation"],
      answer: 0,
      why: "This kit's lifecycle mapping: pending = trial, shipped = onboarding in flight, delivered = activated (52 events), cancelled = churned before activation. Pending is the funnel's widest open gate.",
      notes: [
        { choice: 2, why: "Onboarding is 'shipped' — the contract is moving but not landed. Calling pending workspaces onboarded inflates the activation funnel's middle step." },
        { choice: 3, why: "Churn-before-activation is 'cancelled' — 7 events. Pending is BEFORE the decision; cancelled is the decision going the other way." },
      ],
      difficulty: "easy",
    },
    {
      id: "slack-mcq-2",
      prompt: "How many renewal invoices on this db carry NO settlement row at all — the churn-risk collections queue?",
      choices: ["6 — carrying 15,217 cents unsettled", "21 — the invoices with a payment", "1 — the void invoice", "28 — every renewal invoice"],
      answer: 0,
      why: "The anti-join (invoices LEFT JOIN payments, keep the NULL side) returns 6 invoices worth 15,217 cents. 21 is the complement; the void invoice actually HAS a settlement row, so it never appears in this queue.",
      notes: [
        { choice: 1, why: "That's the IS NOT NULL read — the settled population. Flip the predicate and you've queued the healthy accounts for collections." },
        { choice: 2, why: "The void-but-paid invoice (925 cents) has a payment row, so the anti-join skips it. Status columns and settlement facts are different layers — the queue is built on the payments." },
      ],
      difficulty: "easy",
    },
    {
      id: "slack-mcq-3",
      prompt: "You're building the 14-month activity spine from TEXT timestamps. Which expression makes the month bucket?",
      choices: ["STRFTIME('%Y-%m', created_at)", "STRFTIME('%m', created_at)", "SUBSTR(created_at, 4, 2)", "DATE(created_at, 'month')"],
      answer: 0,
      why: "%Y-%m prints year plus zero-padded month — '2024-07' — giving the 14 distinct buckets from 2024-01 to 2025-02 that every trend read hangs on.",
      notes: [
        { choice: 1, why: "%m alone gives '07' — January 2024 and January 2025 merge into one bucket and the spine loses a year. The activity trend becomes fiction with plausible axes." },
        { choice: 2, why: "SUBSTR from position 4 grabs the month digits and drops the year — same merge bug, and it breaks the moment the timestamp format drifts off fixed-width ISO." },
      ],
      difficulty: "easy",
    },
    {
      id: "slack-mcq-4",
      prompt: "The retention curve: of 16 workspaces, 2 have 1 renewal, 9 sit at 2–4, 1 at 5, and 4 are embedded at 10+. What share has renewed at least twice?",
      choices: ["87.5% — 14 of 16", "12.5% — 2 of 16", "75% — 12 of 16", "100% — every workspace renewed"],
      answer: 0,
      why: "14 of 16 workspaces hold 2+ renewals: 9 + 1 + 4 = 14, and 14/16 = 87.5%. The 2 single-renewal workspaces are the activation-funnel's leakage — the cohort CS reads first.",
      notes: [
        { choice: 1, why: "12.5% is the inverse share — the single-touch cohort, not the retained one. Saying the metric's population out loud ('workspaces with 2+ renewals') catches the flip." },
        { choice: 2, why: "That drops the 2 workspaces at 3 renewals from the middle tier — a fold that forgot two rows. Tier sums must reconcile to 16 before any share is computed." },
      ],
      difficulty: "medium",
    },
    {
      id: "slack-mcq-5",
      prompt: "Which query shape computes weekly DAU/WAU stickiness correctly?",
      choices: ["COUNT(event rows daily) ÷ COUNT(event rows weekly)", "COUNT(DISTINCT workspace) per day ÷ COUNT(DISTINCT workspace) per week, same population", "COUNT(DISTINCT events) per week ÷ workspaces", "SUM(daily actives) ÷ COUNT(workspaces)"],
      answer: 1,
      why: "Stickiness is a ratio of two DISTINCT-count folds over the same workspace population: how much of the week's actives show up on a typical day. Row counts measure event volume, not people — the fan-out (251 lines on 103 renewals) makes them different numbers entirely.",
      notes: [
        { choice: 0, why: "Row counts overcount heavy workspaces — a power user with 50 events counts as much as a lurker with 1. Distinct counts are the people fold; rows are the activity fold." },
        { choice: 3, why: "Summing daily distinct counts double-counts anyone active on multiple days — the sum exceeds WAU and stickiness can exceed 100%, which should end the argument." },
      ],
      difficulty: "medium",
    },
    {
      id: "slack-mcq-6",
      prompt: "The 6 never-settled renewal invoices: what is their status split, and why does the void-but-paid invoice NOT appear in the queue?",
      choices: ["6 open — the void one lacks payments too", "5 open + 1 statused 'paid' — the void invoice has a settlement row, so the anti-join skips it", "5 open + 1 void — voids always lack payments", "6 paid — status lies about all of them"],
      answer: 1,
      why: "The anti-join is built on payment rows, not status claims: five open invoices plus the paid-no-payments anomaly (1,756 cents). The void invoice DOES have a settlement row (925 cents), so p.id IS NULL never matches it.",
      notes: [
        { choice: 0, why: "Status is an upstream claim, not a settlement fact — one of the six open-status invoices is actually statused 'paid'. Building the queue on status would miss the anomaly and include the wrong rows." },
        { choice: 2, why: "The void invoice has a payment row — the mirror anomaly. Voids and settlements are independent facts, which is exactly why reconciliation runs both directions." },
      ],
      difficulty: "hard",
    },
    {
      id: "slack-mcq-7",
      prompt: "Workspaces ⋈ renewals ⋈ renewal line items: 16 ⋈ 103 ⋈ 251 rows. What does COUNT(*) count after all three joins?",
      choices: ["Workspaces — the joins preserve one row per workspace", "Renewals — the middle grain wins", "Line items — 251; the last join's grain is what COUNT(*) sees", "Seats — COUNT(*) is always the smallest table"],
      answer: 2,
      why: "After the fan-out, COUNT(*) counts rows at the LAST join's grain — line items (251), not renewals (103) or workspaces (16). Every grain below the fold needs COUNT(DISTINCT …) to recover.",
      notes: [
        { choice: 0, why: "Joins don't preserve the first table's grain — they multiply. A workspace with 24 renewals and 60 line items contributes 60 rows to COUNT(*)." },
        { choice: 1, why: "The middle grain is also gone once line items join. 'One row per what?' must be asked after EVERY join, not once at the start." },
      ],
      difficulty: "hard",
    },
    {
      id: "slack-mcq-8",
      prompt: "One pass over orders must produce the four lifecycle counts (52 delivered / 30 shipped / 14 pending / 7 cancelled). Which expression is NOT a valid branch?",
      choices: ["COUNT(*) FILTER (WHERE status = 'delivered')", "SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)", "COUNT(status = 'delivered')", "AVG(CASE WHEN status = 'delivered' THEN 1.0 ELSE 0 END) * COUNT(*)"],
      answer: 2,
      why: "COUNT(status = 'delivered') counts NON-NULL results of the comparison — SQLite renders TRUE/FALSE as 1/0, both non-NULL, so every row counts and the branch returns 103, not 52. FILTER, the CASE-SUM flag and the AVG×COUNT identity all isolate the 1s correctly.",
      notes: [
        { choice: 0, why: "FILTER (WHERE …) is the one-pass idiom — per-aggregate row selection in a single scan, exactly what the lifecycle census wants." },
        { choice: 3, why: "The mean of a 1/0 indicator IS the share; times COUNT(*) it's the count. Roundabout, but arithmetically sound — 52 either way." },
      ],
      difficulty: "hard",
    },
    {
      id: "slack-mcq-9",
      prompt: "Workspaces LEFT JOIN renewals, then WHERE r.created_at >= '2024-01-01'. What happened to workspaces whose first renewal never came?",
      choices: ["They appear with NULL renewals — LEFT JOIN keeps them", "They vanish — the WHERE predicate discarded their NULL payloads, making the join an INNER", "They appear once, with the workspace's first event", "The query errors — NULL payloads can't be compared"],
      answer: 1,
      why: "NULL >= anything is UNKNOWN, so WHERE drops every never-renewed workspace — the LEFT JOIN silently became an INNER and the churn-risk population disappeared from its own report. The fix: move the predicate into ON, or filter in an outer query.",
      notes: [
        { choice: 0, why: "LEFT JOIN keeps the rows, but WHERE then evicts them — the join type in the text stops being the join type in the plan. Both clauses must agree on who survives." },
        { choice: 2, why: "No coalescing happens implicitly. NULL payload comparisons are UNKNOWN, and UNKNOWN rows are discarded — not defaulted, not rescued." },
      ],
      difficulty: "medium",
    },
    {
      id: "slack-mcq-10",
      prompt: "The collections queue holds 15,217 unsettled cents. Which expression prints the exposure in dollars?",
      choices: ["SUM(amount_cents) / 100", "ROUND(SUM(amount_cents) / 100.0, 2)", "SUM(amount_cents) * 100", "ROUND(SUM(amount_cents), 2)"],
      answer: 1,
      why: "15,217 cents ÷ 100.0 = 152.17 dollars — real division first, rounding last. The .0 is the whole fix: integer ÷ integer truncates, and odd-cent exposures leak their cents into the floor.",
      notes: [
        { choice: 0, why: "15217 / 100 in integer math is 152 — two cents vanish from every such row. On round-dollar sums the bug hides; the first odd-cent invoice exposes it." },
        { choice: 2, why: "Multiplying gives 1,521,700 — units inverted. Dollars are smaller than cents; if the number grew, the units flipped." },
      ],
      difficulty: "medium",
    },
    {
      id: "slack-mcq-11",
      prompt: "Workspace activation rate = workspaces with at least one delivered renewal ÷ ALL workspaces. On this db, what is it?",
      choices: ["15 of 16 — 93.75%", "52 of 103 — 50.5% (event share)", "16 of 16 — everyone activated", "103 of 16 — events per workspace"],
      answer: 0,
      why: "Fifteen of the 16 workspaces have reached a delivered renewal; exactly one has never activated. The denominator is WORKSPACES, not events — 52 of 103 is the delivered-event share, a different metric that folds people and renewals into one number.",
      notes: [
        { choice: 1, why: "52/103 is the share of renewal events that delivered — an event-side rate. Activation is population-side: one activated workspace with 24 events counts once, not 24 times." },
        { choice: 2, why: "That's the optimistic fold — one workspace has zero delivered renewals and IS the activation-funnel leak CS reads first. Claiming 100% erases the only churn-risk account." },
      ],
      difficulty: "easy",
    },
    {
      id: "slack-mcq-12",
      prompt: "A dashboard sums each day's distinct active workspaces to make a weekly active count. What is wrong with that roll-up?",
      choices: [
        "Nothing — distinct counts commute across sums",
        "It double-counts workspaces active on multiple days — the sum exceeds the true weekly distinct count, and stickiness can exceed 100%",
        "It undercounts because NULLs are ignored",
        "It errors when a day has zero events",
      ],
      answer: 1,
      why: "A workspace active Monday and Friday appears in both daily folds and twice in the sum — the weekly distinct count must re-dedupe with COUNT(DISTINCT workspace) over the whole window. The tell is arithmetic: if summing dailies ever yields a WAU, then daily ÷ weekly stickiness can exceed 100%, which should end the argument.",
      notes: [
        { choice: 0, why: "DISTINCT is window-scoped: distinct-in-a-day is not distinct-in-a-week. Telemetry reconciliation starts exactly here — WAU rebuilt from DAU-shaped folds disagrees until the fold re-dedupes." },
        { choice: 3, why: "Zero-event days are a real problem, but a different one — they need a zero-fill from a calendar spine. The sum's bug fires even on dense weeks." },
      ],
      difficulty: "easy",
    },
    {
      id: "slack-mcq-13",
      prompt: "Customer success wants workspaces whose renewal signal went QUIET — no renewal event in the trailing window. Which shape finds absence?",
      choices: [
        "INNER JOIN orders to workspaces, filtered to old dates",
        "NOT EXISTS (a renewal in the window) — or LEFT JOIN … WHERE the renewal id IS NULL",
        "GROUP BY workspace with MAX(total)",
        "WHERE status = 'cancelled'",
      ],
      answer: 1,
      why: "Absence is an anti-join: the workspaces you want are the ones with NO matching row in the window, and only NOT EXISTS or LEFT JOIN + IS NULL can see them. On this db the same shape builds the collections queue — 6 invoices with no settlement row — because 'nothing happened' is data only anti-joins can return.",
      notes: [
        { choice: 0, why: "An inner join keeps only workspaces WITH events — the quiet ones are deleted by construction. You cannot filter your way to rows that never matched." },
        { choice: 3, why: "Cancelled is a status claim, not an absence proof — and on this db a 'paid'-status invoice sits in the no-settlement queue. The lifecycle column and the event stream are different layers." },
      ],
      difficulty: "easy",
    },
    {
      id: "slack-mcq-14",
      prompt: "Growth wants workspaces that renewed in BOTH halves of 2024. Which operator returns the overlap directly?",
      choices: ["UNION", "INTERSECT", "EXCEPT", "CROSS JOIN"],
      answer: 1,
      why: "INTERSECT returns rows present in both branches: the H1 renewal set ∩ the H2 renewal set — on this db, 10 of the 16 workspaces. It is the set-level answer to an overlap question, with no join gymnastics and no fan-out.",
      notes: [
        { choice: 0, why: "UNION merges the halves into the anyone-active-anytime set — the opposite of both. The distinct pass then hides which workspaces repeated." },
        { choice: 2, why: "EXCEPT answers first-minus-second — workspaces active in H1 but silent in H2, a churn read, not the overlap the PM asked for." },
      ],
      difficulty: "easy",
    },
    {
      id: "slack-mcq-15",
      prompt: "The weekly trend line must show a week with ZERO renewal events as a 0 — not as a gap. Which construction prints it?",
      choices: [
        "GROUP BY week over the events — every week appears",
        "A generated week spine LEFT JOINed to events, with COALESCE(count, 0)",
        "WHERE count IS NULL replaced by 0 in the chart tool",
        "ORDER BY week — ordering fills the gaps",
      ],
      answer: 1,
      why: "GROUP BY can only fold weeks that exist as rows; the empty week is absent, and the trend line draws a straight line across the hole. The spine — every week in range, generated or from a calendar table — LEFT JOINed to events turns absence into a row, and COALESCE prints the honest 0.",
      notes: [
        { choice: 0, why: "That's the lie by omission: the missing week silently shortens the trend and every moving average computed over it drifts." },
        { choice: 2, why: "Fixing NULLs in the chart tool means the query's own consumers disagree — the fill decision belongs in the SQL, where the definition ships with the number." },
      ],
      difficulty: "easy",
    },
    {
      id: "slack-mcq-16",
      prompt: "Keep only months with at least 8 renewal events. Where does the threshold live?",
      choices: [
        "WHERE COUNT(*) >= 8, before GROUP BY",
        "GROUP BY month HAVING COUNT(*) >= 8",
        "WHERE events >= 8 on the raw table",
        "HAVING before GROUP BY, wherever it fits",
      ],
      answer: 1,
      why: "The 8-event floor judges a per-month aggregate, so it lives in HAVING after GROUP BY — four of the fourteen months clear it on this db. WHERE runs before groups exist: COUNT isn't there yet, and the engine rejects the query outright.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The rejection is the pipeline order teaching itself." },
        { choice: 2, why: "There's no 'events' column on the raw table — the count materializes only at the fold. Same error, different disguise." },
      ],
      difficulty: "easy",
    },
    {
      id: "slack-mcq-17",
      prompt: "The lifecycle ladder is written with the arms out of order: WHEN n >= 2 'engaged' comes BEFORE WHEN n >= 10 'embedded'. What happens to the 24-renewal workspace?",
      choices: [
        "It lands in 'embedded' — CASE picks the most specific arm",
        "It lands in 'engaged' — first match wins, and the embedded tier silently empties",
        "It errors — the arms conflict",
        "It gets both labels",
      ],
      answer: 1,
      why: "CASE arms fire in order: n = 24 satisfies n >= 2 first, so every workspace with 2 or more renewals — 14 of 16 — labels 'engaged', and 'embedded' catches nothing. The ladder still reconciles to 16, which is why the bug survives review; only the read knows the top tier vanished.",
      notes: [
        { choice: 0, why: "CASE has no specificity rule — it is strictly first-match-wins. Ordering from most-specific to most-general is the discipline, not an engine behavior." },
        { choice: 2, why: "Overlapping arms are legal SQL, not an error — which is exactly the danger. The engine can't know which tier the business meant." },
      ],
      difficulty: "medium",
    },
    {
      id: "slack-mcq-18",
      prompt: "Time-to-activate is being reported as an average. A stakeholder asks why the median is shown next to it. What is the honest answer?",
      choices: [
        "They are always identical — the median is cosmetic",
        "The mean is dragged by outlier workspaces — one slow activation shifts it; the median reports the middle workspace and survives the tail",
        "The median is the mean rounded",
        "Averages cannot be computed on durations",
      ],
      answer: 1,
      why: "Duration distributions skew: a handful of stalled workspaces pulls the mean up while the median holds the middle, and the gap between them IS the tail's story. On this db activations run 2–4 days so the two sit close — the pairing matters the day a legal stall lands. Reporting both, with the population named, is the telemetry habit.",
      notes: [
        { choice: 0, why: "Identical only in symmetric data — activation times are not symmetric. Claiming they're the same erases the tail exactly when the tail is the news." },
        { choice: 2, why: "Rounding never produces a median — it is an order-statistic computed from ranks. The distinction matters when the PM asks 'what does the typical workspace see?'" },
      ],
      difficulty: "medium",
    },
    {
      id: "slack-mcq-19",
      prompt: "Product ops is sessionizing the event stream: a gap over 30 minutes starts a new session. Which function reads the PREVIOUS event's timestamp?",
      choices: ["LEAD", "LAG", "MIN", "NTILE"],
      answer: 1,
      why: "LAG(event_time) OVER (PARTITION BY workspace ORDER BY event_time) reaches one row back, and event_time − LAG(event_time) > 30 minutes becomes the session-break flag. LEAD reaches forward — it works, but the flag names the wrong row's boundary; MIN has no row context at all.",
      notes: [
        { choice: 0, why: "LEAD reads the NEXT row, so the same comparison flags the gap but attached to the later event — session counts survive, session boundaries get attributed to the wrong row, and downstream per-session joins inherit the confusion." },
        { choice: 3, why: "NTILE buckets rows into ranked tiles — it knows nothing about time gaps. Sessionization is a gaps problem, and gaps are LAG's job." },
      ],
      difficulty: "medium",
    },
    {
      id: "slack-mcq-20",
      prompt: "workspaces ⋈ renewals ⋈ line items, then GROUP BY month. What do COUNT(DISTINCT customer_id) and COUNT(*) count respectively?",
      choices: [
        "Both count renewal events",
        "Workspaces (up to 16) and line items (251 total) — DISTINCT folds the fan-out back to people, COUNT(*) stays at the finest grain",
        "Line items and workspaces — the order of the joins reverses the counts",
        "Both count months",
      ],
      answer: 1,
      why: "After the fan-out, COUNT(*) counts rows at the last join's grain — line items — while COUNT(DISTINCT customer_id) folds duplicates back to workspaces. The pair in one pass is the DAU/WAU habit: two grains, one scan, populations that cannot drift apart.",
      notes: [
        { choice: 0, why: "Renewal events are the middle grain — gone once line items join. 'One row per what?' must be re-asked after every join, not once at the start." },
        { choice: 2, why: "Join order changes which tables multiply, but COUNT(*) always lands on the FINEST grain in the result and DISTINCT always folds toward people — the orientation never reverses." },
      ],
      difficulty: "medium",
    },
    {
      id: "slack-mcq-21",
      prompt: "Plan-migration paths: for each workspace, which tier it sat on LAST month. Which window is correct?",
      choices: [
        "LAG(tier) OVER (ORDER BY month)",
        "LAG(tier) OVER (PARTITION BY workspace ORDER BY month)",
        "LEAD(tier) OVER (PARTITION BY month ORDER BY workspace)",
        "MIN(tier) OVER (ORDER BY workspace)",
      ],
      answer: 1,
      why: "The comparison must never cross workspaces: PARTITION BY workspace fences each workspace's timeline, and LAG inside it reads that workspace's own previous month. Without the partition, LAG walks the whole month-ordered table and hands every workspace some OTHER workspace's tier — a migration read where nobody migrated.",
      notes: [
        { choice: 0, why: "Ordering by month alone interleaves all 16 workspaces; the previous row is whoever sorted before you. The missing PARTITION BY is the single most common LAG bug in telemetry work." },
        { choice: 2, why: "PARTITION BY month fences the wrong axis — each partition holds one month across all workspaces, so 'previous row' is an alphabetical neighbor, not last month." },
      ],
      difficulty: "medium",
    },
    {
      id: "slack-mcq-22",
      prompt: "Second-day confirmation: workspaces active on day 1 AND day 2 after provisioning. What is the correct denominator for the confirmation rate?",
      choices: [
        "All workspaces ever provisioned",
        "Workspaces active on day 1 — each step's denominator is the previous step's survivors",
        "Workspaces active on day 2",
        "All renewal events in the window",
      ],
      answer: 1,
      why: "A funnel step's conversion is measured against the population that REACHED the previous step: day-2 actives ÷ day-1 actives. Against all provisioning, a workspace that never showed up on day 1 counts as a day-2 failure — and the read blames onboarding for traffic the product never had.",
      notes: [
        { choice: 0, why: "That's the activation rate's denominator, not the funnel's. Chained counts that reset to the raw base mid-ladder report a conversion story that never happened." },
        { choice: 2, why: "Day-2 actives as denominator answers 'share of day-2 actives who were also day-1 actives' — the reciprocal. Say the ratio's units out loud and the flip is obvious." },
      ],
      difficulty: "medium",
    },
    {
      id: "slack-mcq-23",
      prompt: "Streak depth — the longest run of consecutive active periods per workspace. Which fragment is the heart of the gaps-and-islands trick?",
      choices: [
        "MAX(event_time) per workspace — the latest active period",
        "active_period minus ROW_NUMBER() — constant within a streak, so GROUP BY workspace, that constant",
        "COUNT(DISTINCT active_period) per workspace — distinct periods are streaks",
        "WHERE active_period = active_period + 1 — self-join each period to its successor",
      ],
      answer: 1,
      why: "Sort each workspace's active periods, number them with ROW_NUMBER, and subtract: inside an unbroken run the difference never changes, so GROUP BY workspace, that difference collapses each island, and MAX(COUNT(*)) over the islands is the streak depth. The arithmetic turns 'consecutive' into an equality — countable, groupable, defensible.",
      notes: [
        { choice: 0, why: "Latest activity says nothing about continuity — a workspace active 4 quarters straight and one active once 2 years ago can share a MAX. Depth is about runs, not recency." },
        { choice: 2, why: "Distinct counts ignore adjacency: periods 1, 2, 9 and 10 are 4 distinct periods but two streaks. The row_number delta is what encodes adjacency." },
      ],
      difficulty: "hard",
    },
    {
      id: "slack-mcq-24",
      prompt: "A rolling 7-day active-workspace metric is written as COUNT(DISTINCT workspace) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW). What happens in SQLite?",
      choices: [
        "It computes the rolling WAU correctly",
        "It errors — SQLite rejects DISTINCT inside window aggregates; rolling distinct counts need a staged daily fold or a range self-join",
        "It silently drops the DISTINCT and counts event rows",
        "It returns the same number for every row",
      ],
      answer: 1,
      why: "Window aggregates in SQLite don't accept DISTINCT, so the query fails to parse — a hard stop, not a silent wrong answer. The honest builds: fold per-day distinct counts first and accept that the rolling sum double-counts multi-day workspaces (label it 'activity volume'), or self-join events to the 7-day range and COUNT(DISTINCT) on the joined rows.",
      notes: [
        { choice: 0, why: "The wish is reasonable — and the grammar says no. Engines that DO support it still make the frame's semantics a definition to state, not a default to trust." },
        { choice: 2, why: "That's the dangerous version: a silent semantic change that turns a people-count into an event-count. SQLite refuses loudly, which is the safer failure." },
      ],
      difficulty: "hard",
    },
    {
      id: "slack-mcq-25",
      prompt: "A webhook retry ingested the same renewal event twice — identical event_id, different ingested_at. Which fragment keeps exactly the freshest copy per event?",
      choices: [
        "GROUP BY event_id and keep the row with MAX(ingested_at) — aggregation returns whole rows",
        "ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY ingested_at DESC) = 1",
        "SELECT DISTINCT event_id — distinct removes duplicates by definition",
        "DELETE both copies and let the next sync re-ingest",
      ],
      answer: 1,
      why: "ROW_NUMBER numbers each event_id's copies newest-first, and rn = 1 is the freshest ingest — deterministic (the ORDER BY names the tie-break), per-key (the PARTITION BY), and it keeps whole rows. Every telemetry pipeline retries, so keep-latest is not a cleanup step; it is the ingestion contract.",
      notes: [
        { choice: 0, why: "Aggregates fold — MAX(ingested_at) returns a timestamp, not the row that owns it; other selected columns come from arbitrary group members. The classic whole-row-from-an-aggregate bug." },
        { choice: 3, why: "Deleting both copies throws away the signal and bets on a retry that may never come. Dedupe keeps ONE row; it never deletes the fact." },
      ],
      difficulty: "hard",
    },
    {
      id: "slack-mcq-26",
      prompt: "'Workspaces whose average renewal beats the population mean' — on the full db it returns 7 rows. The query runs against a staging slice where the inner mean's fold matches NOTHING. What does the report return?",
      choices: [
        "All workspaces — no mean means no filter",
        "Zero rows silently — the empty fold yields NULL, and value > NULL is UNKNOWN",
        "An error — the subquery is mandatory",
        "The 7 rows from the full db — cached",
      ],
      answer: 1,
      why: "A scalar subquery over zero rows returns NULL, comparisons against NULL are UNKNOWN, and WHERE discards everything — an above-average report that ships empty while looking valid. On filtered staging slices this is routine, which is why the inner fold's population gets stated out loud before the outer comparison is trusted.",
      notes: [
        { choice: 0, why: "No comparison against NULL defaults to true — UNKNOWN is discarded in both directions. The absence of a mean filters everything, not nothing." },
        { choice: 3, why: "Nothing caches — the query re-runs against the slice it was given. Empty-in, empty-out, silently: the most expensive failure mode in a product review." },
      ],
      difficulty: "hard",
    },
    {
      id: "slack-mcq-27",
      prompt: "A rolling 7-day window built with ROWS BETWEEN 6 PRECEDING AND CURRENT ROW shifts by a day whenever the events table is missing a day's rows. Which construction is drift-proof?",
      choices: [
        "Add more ROWS to the frame to compensate",
        "A calendar day-spine LEFT JOINed to events with a julianday range condition (day − 6 to day) — calendar-true regardless of gaps",
        "ORDER BY week instead of day",
        "Use RANGE instead of ROWS on the day column",
      ],
      answer: 1,
      why: "ROWS counts physical rows, so missing days shorten the window and the metric drifts without the dashboard changing. The spine guarantees every day exists as a row, and the julianday range (>= day−6, <= day) defines the window in calendar terms — the same 7 days whether or not events landed. On telemetry data, gaps are a WHEN.",
      notes: [
        { choice: 2, why: "Ordering by week changes the grain to 7-day buckets — a different metric. The drift inside each week survives untouched." },
        { choice: 3, why: "RANGE peers by VALUE of the ORDER BY key — with one row per day it would be calendar-true, but the missing days are exactly the rows that don't exist to peer from. The spine is the fix; the frame unit is the symptom." },
      ],
      difficulty: "hard",
    },
    {
      id: "slack-mcq-28",
      prompt: "The void invoice on this db carries a 92,500-cent settlement row. What does that prove?",
      choices: [
        "The invoice was never really voided — status wins",
        "Status and settlements are independent facts — a voided invoice can carry money, so reconciliation must run both directions",
        "The payments table is corrupted and must be re-imported",
        "Void invoices are excluded from all financial reads",
      ],
      answer: 1,
      why: "One anomaly proves the two layers are independent: status columns are upstream claims, payment rows are events that happened. The mirror anomaly exists too — a 'paid' invoice with zero settlements in the collections queue — which is why reconciliation checks settlements-without-valid-invoices AND invoices-without-settlements, both directions, every close.",
      notes: [
        { choice: 0, why: "Trusting status over the ledger is exactly the habit the anomaly exists to break. The money moved; the claim says it didn't — the event stream is the ledger of record." },
        { choice: 2, why: "The payment row is real money against a voided bill — an audit finding, not corrupt data. Re-importing would faithfully reproduce the truth the status column disagrees with." },
      ],
      difficulty: "easy",
    },
    {
      id: "slack-mcq-29",
      prompt: "NTILE(4) OVER (ORDER BY renewals DESC) runs over the 16 workspaces to build engagement quartiles. Where do the 4 embedded workspaces (13, 14, 17, 24 renewals) land?",
      choices: [
        "Tile 4 — NTILE puts the busiest last",
        "Tile 1 — the first four rows in the window's ORDER BY, which with DESC are the four embedded accounts",
        "Tile 2 — NTILE skips the first tile for ties",
        "One per tile — NTILE spreads tied rows apart",
      ],
      answer: 1,
      why: "NTILE stamps tiles 1..4 in the window's ORDER BY sequence: with 16 workspaces and DESC ordering, the first four rows — exactly the four embedded accounts — take tile 1. The quartile is the coverage list customer success staffs against; the renewal ladder (24, 17, 14, 13 at the top) makes this db's tile 1 unusually deep.",
      notes: [
        { choice: 0, why: "Tile numbers follow the window order: DESC means the biggest arrive first and get LOW tile numbers. Flip to ASC and the single-renewal workspaces become tile 1 — the semantics flip with the sort." },
        { choice: 3, why: "Ties share a tile whenever they fall inside one; NTILE never deliberately spreads them. With 16 rows and 4 tiles the split is exactly 4-4-4-4 here, ties or not." },
      ],
      difficulty: "medium",
    },
    {
      id: "slack-mcq-30",
      prompt: "'Workspaces that renewed in EVERY month of H1-2024' — relational division. Which shape answers it?",
      choices: [
        "GROUP BY workspace HAVING COUNT(*) >= 6 — six renewals means six months",
        "NOT EXISTS (a month m in the spine WHERE NOT EXISTS a renewal by that workspace in month m)",
        "WHERE month IN ('2024-01','2024-02','2024-03') — the quarters that matter",
        "COUNT(DISTINCT month) = 6 per workspace, with no other condition",
      ],
      answer: 1,
      why: "Division asks 'for every m, exists a renewal' — which SQL says by double negation: no month in the spine lacks a renewal from this workspace. The spine (the six H1 months) is generated or calendar-sourced, and the shape survives any spine change — add July and the definition extends without a rewrite.",
      notes: [
        { choice: 0, why: "Six renewals can all land in January — count never proves coverage. This is the classic division-by-count bug, and it inflates engagement reads whenever renewal volume concentrates." },
        { choice: 2, why: "An IN list checks membership in a subset of months, not ALL months — and a hardcoded list expires the moment the review window moves. Division is a for-every, not an in-some." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-slack-1",
      tier: "medium",
      topic: "s6",
      universe: "growth",
      title: "The workspace activation ladder",
      brief:
        "Slack-flavored brief on the storefront db: the growth review opens with the activation ladder — every workspace tiered by renewal count, because a renewal is a quarter of tenancy and depth of tenancy is the retention story. Probed facts: 16 workspaces fold from 103 renewal events into a curve of 2 single-renewal workspaces, 3 at 2, 2 at 3, 4 at 4, 1 at 5, and 4 embedded accounts at 13, 14, 17 and 24. The tier definitions are fixed: single-renewal below 2, engaged at 2–4, expanding at 5–9, embedded at 10 and up. Growth wants the census in one pass, biggest tiers first, with tier counts that reconcile to 16.",
      ask: "Return each activation tier with its workspace count, biggest tiers first.",
      template:
        "SELECT CASE WHEN n >= {1} THEN 'embedded'\n            WHEN n >= 5 THEN 'expanding'\n            WHEN n >= {2} THEN 'engaged'\n            ELSE 'single-renewal' END AS tier,\n       COUNT(*) AS workspaces\nFROM (SELECT customer_id, COUNT(*) AS n\n      FROM orders\n      GROUP BY customer_id)\nGROUP BY tier\nORDER BY workspaces {3};",
      slots: [
        {
          answer: "10",
          kind: "number",
          label: "the embedded threshold",
          noVerify: true,
          why: "Embedded starts at 10 renewals: exactly the 4 workspaces at 13, 14, 17 and 24. A threshold of 5 would swallow the expanding tier's only member into embedded and the ladder loses its middle rung.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the engaged threshold",
          noVerify: true,
          why: "Engaged opens at the second renewal — the 9 workspaces at 2–4. A threshold of 3 would push the three 2-renewal workspaces into single-touch and understate retention by three accounts.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-tier-first direction",
          why: "The read is biggest tiers first: engaged 9, embedded 4, single-renewal 2, expanding 1. ASC would open the review with the tier holding one workspace — a correct query aimed at the wrong end of the ladder.",
        },
      ],
      distractors: ["15", "5", "3", "ASC"],
      walkthrough:
        "One derived fold, one CASE, one census. The inner query folds 103 renewal events to one row per workspace with its renewal count; the outer CASE cuts the ladder at 2, 5 and 10 — single-renewal 2, engaged 9, expanding 1, embedded 4 — and the four tier counts reconcile to the 16 workspaces by construction, which is the audit growth checks before publishing. CASE arms fire in order: embedded is judged before expanding, so a 13-renewal workspace never double-counts, and the thresholds are definitions, not arithmetic — move the embedded cut to 15 and two of the four embedded accounts silently demote. The distractors each reshape the ladder: 15 in the embedded slot leaves 17 and 24 alone at the top; 5 in the engaged slot collides with the expanding arm (first match wins) and empties engaged entirely; 3 pushes the three 2-renewal workspaces into single-touch, understating retention; and ASC flips the read so the thinnest tier opens the review. The takeaway the reviewer grades: a lifecycle ladder is a set of definitions with an exhaustiveness check — the ELSE arm is the audit, not a default.",
    },
    {
      id: "cs-slack-2",
      tier: "hard",
      topic: "j5",
      universe: "month-close",
      title: "The renewal-collection gap",
      brief:
        "Slack-flavored brief on the storefront db: before the board meets, finance reads the collections queue — renewal invoices with no settlement row, because a workspace that stops paying is a churn event whether or not its status column admits it. Probed facts: 28 renewal invoices; 6 carry no payment row at all, worth 15,217 cents unsettled; the row-level anomaly list pins one of the six as status 'paid' with zero payment rows (1,756 cents), while the void-but-paid invoice (925 cents) does NOT appear because a settlement row exists. Finance wants the exposure grouped by status, in dollars to 2 decimals, biggest exposure first — built on settlement facts, not status claims.",
      ask: "Return each invoice status with its count of never-settled renewal invoices and the unsettled dollars (2 decimals), biggest exposure first.",
      template:
        "SELECT i.status,\n       COUNT(*) AS unpaid_invoices,\n       ROUND({1}(i.amount_cents) / 100.0, 2) AS unpaid_dollars\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = {2}\nWHERE {3} IS NULL\nGROUP BY i.status\nORDER BY unpaid_dollars {4};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the exposure aggregator",
          why: "SUM(amount_cents) prices the unsettled exposure per status — 13,461 cents open, 1,756 cents mis-statused as paid. COUNT would count invoice rows (5 and 1) and print them as dollars: 0.05 and 0.01 — a queue that looks settled because the units collapsed.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the invoice-side join key",
          why: "The join must match each settlement to ITS invoice: p.invoice_id = i.id. Keying to anything on the payments side self-references the join into a tautology or a mismatch, and the anti-join stops measuring what it claims to.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the unmatched-side probe",
          why: "The anti-join keeps rows where the settlement side never matched: p.id IS NULL. Probing an invoice-side column instead finds no NULLs — every renewal invoice has an id — and the queue floods with all 28 invoices.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first direction",
          why: "Collections works biggest exposure first: open status on top, the mis-statused 'paid' row below. ASC would lead the meeting with the 17.56-dollar footnote instead of the 134.61-dollar exposure.",
        },
      ],
      distractors: ["COUNT", "ASC", "1", "i.amount_cents"],
      walkthrough:
        "An anti-join where the definition is 'absence of a match'. The LEFT JOIN keeps all 28 renewal invoices and attaches settlements where they exist; p.id IS NULL keeps the 6 with none — 15,217 cents, printed honestly as dollars by dividing by 100.0 before rounding: 134.61 across the five open invoices, plus 17.56 for the one statused 'paid' with zero payment rows, the anomaly finance wants named, not smoothed over. The void-but-paid invoice never appears — it HAS a settlement row — which is the whole point: the queue is built on settlement facts, and status columns are claims that get audited, not trusted. The distractors fail loudly: COUNT in the aggregate slot prints row counts as dollars; joining on 1 collapses every settlement onto invoice #1 and floods the queue with 27 false unmatched; probing i.amount_cents for NULL finds none and returns all 28 invoices as churn risk; ASC inverts the queue so the smallest exposure leads. The money rule rides along: INTEGER cents ÷ 100.0 — the missing .0 is how a 152.17-dollar exposure prints as 152 and the board's cents go missing.",
    },
  ],

  problems: [
    { slug: "feature-adoption-windows", why: "The registry-tagged adoption read: conditional AVG of uptake inside a post-launch window — the feature-team deliverable, verbatim." },
    { slug: "trial-to-paid-funnel", why: "The registry-tagged activation funnel: conditional counts over a staged population — trial → paid with denominators stated out loud." },
    { slug: "active-users", why: "Consecutive-day activity streaks — the telemetry definition of an engaged workspace, computed rather than asserted." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU as a ratio of two distinct-count folds — the stickiness number this domain lives by, with the population question built in." },
    { slug: "rolling-7d-actives", why: "Rolling 7-day distinct actives — smoothing the weekend dip out of telemetry before anyone reads a cliff into a Tuesday." },
    { slug: "funnel-step-conversion", why: "Step-to-step conversion with honest denominators — the message-funnel read that opens every product review here." },
    { slug: "find-churn-risk-customers", why: "The churn-risk queue: workspaces whose renewal signal went quiet — the same population this kit's collection-gap case hunts." },
    { slug: "confirmation-rate", why: "Rate per workspace with LEFT JOIN zero-fill — reply-rate reads where silence is data, not absence, and the NULL policy is the metric." },
    { slug: "game-play-analysis-iv", why: "Day-1 activation cohort: workspaces whose FIRST delivered renewal landed in-window — the activation date computed, then joined back." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Onboarded-but-never-renewed anti-join — the workspace-health check that fills the CS queue every Monday." },
    { slug: "week-over-week-churn", why: "LAG week-over-week movement with the first row NULL — the churn window the retention review reads out loud." },
    { slug: "plan-migration-paths", why: "Plan-transition LAG paths — which tier a workspace lands on after a migration, and what the move did to its renewal value." },
    { slug: "dormant-reactivation", why: "NOT EXISTS reactivation reads — workspaces quiet long enough to be written off, surfaced before the write-off happens." },
    { slug: "the-change-in-global-rankings", why: "Period-over-period deltas — last week's numbers beside this week's, movement made visible instead of memoralized in slides." },
    { slug: "article-views-ii", why: "HAVING-gated weekly census — which periods cleared the activity bar, folded in one GROUP BY, the telemetry pulse check." },
    { slug: "bank-account-summary-ii", why: "Credit/debit folds per holder — the billing-ledger shape behind renewal invoices and settlements, cents handled honestly." },
  ],
};
