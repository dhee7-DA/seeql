// Retool — Wave-10 (Task 100), saas domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Internal-tools SQL: the storefront db read as a build-and-govern sandbox — customers are
// workspace accounts (region = market buckets), orders are subscription/billing periods
// (delivered = active seats billed 52, shipped = expansion in flight with shipped_at as the
// seat-change stamp 30, pending = trial/PoC 14, cancelled = churned 7), order_items are
// seat/usage line records (quantity = seats, unit_price = per-seat rate), products are plan
// SKUs, suppliers are data-source/integration partners, invoices are subscription billing
// statements, payments are payment rails, expenses are platform opex, ledger_entries the GL.
// Finance tables store INTEGER cents (dollar read = amount_cents / 100.0); orders.total and
// order_items.unit_price are REAL dollars. Angle kept DISTINCT from miro (visual collaboration)
// and airtable (database-for-everyone): internal-app velocity, the governance/audit read
// (admin console claims vs the activity log), and power-user seat concentration.
// Pool provenance: company-pools.md carries NO Retool section (0 tagged rows) — all 10
// topic slug sets and all 16 problems are theme-curated from the pools file's theme menu
// (sql rows only, no w*/d*/f* rows) and say so. Case briefs quote probed figures from
// scripts/company-facts.md (probed 2026-10-12, canonical cells 2026-10-16); every case slot
// is mechanically verified against db/custom.db by scripts/case-audit.ts (probe receipts in
// the worklog).

import type { CompanyKit } from "../types";

export const retoolKit: CompanyKit = {
  id: "retool",
  domainId: "saas",
  name: "Retool",
  tagline: "Internal tools in hours: apps on live data, seat expansion, governance",
  accent: "text-teal-300",

  brief: [
    "**Retool** is the internal-tools platform — drag-and-drop app canvases wired straight to live databases, APIs and admin panels, so an ops team ships a refund console or a provisioning dashboard in an afternoon instead of a sprint quarter. Governance is the second product: permission groups decide who runs what, and the audit log records everything the apps touch. It monetizes seat by seat on usage, so every growth number in the building is a conditional count over the same small object set. This kit maps the storefront db onto that world: the 16 customers rows are workspace accounts, the 103 orders are subscription periods worth **34,833.28**, and the 251 order_items rows are seat/usage lines — quantity = seats, unit_price = the per-seat rate. The stage map is fixed: delivered = {emerald:seats billed} (52, 50.5%), shipped = expansion in flight (30) with `shipped_at` as the seat-change stamp, pending = trial/PoC (14), cancelled = {rose:churned} (7, 6.8%).",
    "The data org splits into a build-velocity pod, a governance/audit pod and a small billing-analytics group, and all three read the same spine at different grains. Go-live is the heartbeat: a period books at `created_at`, and `shipped_at` is stamped the day the workspace's seats actually change — **82 of 103 periods** carry the stamp (79.6% go-live coverage), averaging **2.98 days** booking-to-go-live with a 2–4 day spread, and the 14 trial/PoC rows have none yet (a population definition, not a cleanup job). Money sits one layer down: 28 billing statements and 27 payment legs in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of the book sits with workspaces whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost logo moves a quarter.",
    "Interview screens are census-then-denominator, with an audit twist. A typical loop opens with a **two-grain workspace census** — EU runs 45 periods from just 8 workspaces (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'do PoC trials count in your base?'*), then into the power-user ladder where four workspaces sit tied at 4 periods and rank semantics become a policy call. Late rounds walk the {sky:14-month billing spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL. Retool's signature screen is the {rose:claim-vs-log probe}: an invoice marked 'paid' while the payment log holds zero rows — candidates who trust the admin console over the activity log fail the round.",
    "Preparation strategy: the pools file carries no Retool section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: go-live funnels, two-grain censuses, tie-heavy power-user ladders, CASE permission bands and the cents-safe billing register. Do the topics in order, then run all six case studies on the live storefront db — spaced practice rather than one sitting: the {emerald:one-pass governance census} the audit console runs at every close, the {violet:seat-band concentration audit} the monetization pod reads before every pricing call, the {violet:power-seat ladder} with its three tie blocks, the {rose:split-rail pair audit} billing signs off every close, the {rose:unbilled workspace register} the governance pod refreshes for compliance, and the {sky:billing spine walk} with its LAG steps. The bar to clear: *state the population and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the go-live refresh. A platform-analytics analyst opens the admin dashboard before standup: did overnight bookings land, did any workspace get its seat-change stamp without a provisioning owner, does the one-pass status census reconcile — 52 billed + 30 in flight + 14 trials + 7 churned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. The {rose:stalled-PoC queue} (14 periods worth 6,113.00) routes to solutions engineering before the meeting starts, and if time-to-go-live drifts off the **2.98-day** norm, the rollout pod gets paged before the governance packet ships.",
    "**11:30 —** Midday is the seat read. The monetization pod wants the {violet:seat-band re-cut} — **230 power seats averaging 115.85** against 268 occasional seats at 31.01 — to argue where expansion actually lives; a regional VP wants periods beside workspace counts (EU 45-from-8 versus US 19-from-2); a manager wants the ladder's four-way tie at 4 handled honestly. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the pricing-review argument*.",
    "**15:30 —** The afternoon tilts toward money and the audit. The {rose:unbilled register} refreshes first — 6 statements worth **15,217.00** with zero settlement legs, one of them claiming 'paid' (#28, 1,756.00) — before any number reaches the close packet; the void-but-settled mirror (#11, 925.00) goes to billing as the matching anomaly. Then the billing spine walks month over month on LAG deltas — the **3,731.97** January peak against the 1,193.86 July floor — with the first row's NULL stated as baseline. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — the close ships or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Go-live coverage", what: "Periods with a seat-change stamp ÷ all periods booked: 82 of 103 (79.6%). The top-of-funnel number the build-velocity pod reads every Monday — the 14 trial/PoC rows are 'not yet live', never a silent zero." },
    { name: "Time-to-go-live", what: "Booking to seat change (created_at → shipped_at) over stamped periods only: 2.98-day average, range 2–4. The population definition ships with the number — open trials have no rollout yet and must not dilute it." },
    { name: "Stalled-PoC backlog", what: "Trial/PoC periods (status 'pending'): 14 of 103 worth 6,113.00 — EU 6, APAC 5, US 3, LATAM confidently 0. The queue that routes to solutions engineering before anything else ships." },
    { name: "Market intensity", what: "Periods per workspace at two grains: EU 45-from-8 (5.6) versus US 19-from-2 (9.5), APAC 37-from-5, LATAM 2-from-1. Load versus coverage — the census that decides where the platform teams build next." },
    { name: "Logo churn", what: "Cancelled share of booked periods: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%. The churn-cohort map behind the winback calendar; LATAM's 0 rides on a 2-period base." },
    { name: "Seat depth", what: "Seat/usage lines per period: 251 lines across 103 periods (2.44), 498 seats billed. Expansion shows up as new lines on existing periods before it shows up anywhere else." },
    { name: "Seat-band mix", what: "Seats under the 55 rate line versus over: 268 occasional seats averaging 31.01 against 230 power seats averaging 115.85 — power carries 26,605.51 of the 34,833.28 book (76.4%) on 46% of the seats." },
    { name: "Unbilled exposure", what: "Statements with zero settlement legs: 6 worth 15,217.00 — 5 genuinely open (13,461.00) plus one claiming 'paid' (#28, 1,756.00). The register the governance pod walks into every close." },
  ],

  topics: [
    {
      name: "Go-live funnels & conditional counts",
      why: "Every Retool screen opens with the build funnel: periods booked, seats changed (shipped_at stamped), billed to term. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight expansion 'billed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "game-play-analysis-iv", "sessionize-events", "viewers-turned-streamers"],
    },
    {
      name: "Two-grain workspace censuses",
      why: "Periods and workspaces are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 workspaces while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "popularity-percentage", "customer-placing-the-largest-number-of-orders", "percentage-of-users-attended-a-contest", "immediate-food-delivery-ii", "find-users-with-high-token-usage", "customer-order-frequency"],
    },
    {
      name: "Workspaces joined to activity",
      why: "Workspace accounts carry region and created_at; periods inherit them through joins, and the join type decides who survives. A period without a workspace is corruption; a workspace without periods is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus", "activity-participants", "customer-who-visited-but-did-not-transact", "dormant-reactivation", "week-over-week-churn", "customers-who-bought-all-products", "dau-wau-stickiness"],
    },
    {
      name: "Power-user leaderboards & ties",
      why: "Seat concentration is leaderboard reporting: which workspaces carry the periods and the seats. The ladder on this db runs 24, 17, 14, 13, 5 with a four-way tie at 4 below it, and RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung — a policy about peer workspaces, not syntax.",
      slugs: ["rank-scores", "top-earners", "second-highest-salary", "find-bursty-behavior"],
    },
    {
      name: "Permission bands with CASE",
      why: "Retool ships access as permission groups — admin, builder, end-user — and every tier read is CASE-classified with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the governance report, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store", "plan-migration-paths"],
    },
    {
      name: "Billing spine & LAG deltas",
      why: "The 14-month billing spine (2024-01 to 2025-02) is the close call's home turf: prior month beside current, delta rounded, the 3,731.97 January peak and the 1,193.86 July trough named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine", "consecutive-transactions-with-increasing-amounts", "customers-with-strictly-increasing-purchases", "fix-names-in-a-table", "usage-tier-percentiles", "net-revenue-retention", "mrr-waterfall", "growth-accounting", "cohort-retention-matrix", "keep-latest-dedupe", "null-blank-audit"],
    },
    {
      name: "Coverage set algebra",
      why: "Governance packets stack populations — in-flight under churned, this quarter beside last — and EXCEPT answers 'which signed workspaces never went live'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Nested folds & seat gates",
      why: "Screens escalate into staging: fold per-workspace period counts, then judge them against a computed platform mean (6.44 here — exactly four workspaces clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments", "the-latest-login-in-2020", "calculate-orders-within-each-interval", "duplicate-charge-pairs"],
    },
    {
      name: "One-pass FILTER censuses",
      why: "The audit console gets billed, in-flight, trial and churned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift out of agreement with the console.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-i", "number-of-accounts-that-did-not-stream", "customers-with-maximum-number-of-transactions-on-consecutive-days", "dynamic-pivoting-of-a-table"],
    },
    {
      name: "Billing register & cents discipline",
      why: "Booked is not collected — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the app world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the unbilled register.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "retool-t1",
      q: "Your governance report joins workspace accounts to billing periods. When do you INNER and when do you LEFT — and what silently breaks if you filter a stamped column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins periods to workspaces: a period with no workspace row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from workspaces: the workspaces with no periods ARE the answer, arriving with NULL period columns. The classic break: filtering shipped_at IS NOT NULL in WHERE after the LEFT JOIN kills every NULL-payload row — the LEFT quietly became an INNER and the never-live cohort vanished while the query looked valid. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero — all 16 workspaces appear in the period table somewhere — and proving that zero is itself the analyst's job, because in a governance culture absence of activity is a finding, not an empty cell.",
      tag: "joins",
    },
    {
      id: "retool-t2",
      q: "Four workspaces tie at 4 periods on the power-user ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count lands on 10, implying phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which workspace's admin gets the builder-seat upsell email first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer workspaces (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment where the governance review can see it. On a ladder that feeds seat-allocation calls, an arbitrary tie split is a pricing decision made by accident.",
      tag: "windows",
    },
    {
      id: "retool-t3",
      q: "The census shows 103 periods and 16 workspaces; EU shows 45 periods and 8 workspaces. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts period rows after the join — one row per period, so a workspace with 24 periods contributes 24. COUNT(DISTINCT customer_id) folds those rows back to workspaces — EU's 45 periods collapse to 8 logos. Neither is wrong: periods measure load and billing cadence, workspaces measure installed base and coverage. The ratio — 5.6 periods per workspace in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items and COUNT(*) silently counts seat/usage lines — 251 of them — and SUM(quantity) climbs again to 498 seats. Retool's seat model lives exactly on that distinction: lines are app activity, seats are humans being billed, and conflating the two misprices the account. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "retool-t4",
      q: "shipped_at is NULL until the workspace's seats actually change. What is your policy for the time-to-go-live report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped periods have a go-live latency, so the report measures booking-to-seat-change for the 82 of 103 periods that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the live subset; the gap between it and COUNT(*) is exactly the 14 trials plus 7 churned rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day go-lives for rollouts that never started, and a fabricated stamp is precisely what an audit log exists to catch. On this db the 14 pending rows are a defined population ('not yet live'), not missing data to impute. A report whose WHERE clause is doing definitional work without saying so is exactly what a Retool reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "retool-t5",
      q: "The monetization review wants booked value per region for workspaces carrying at least five periods. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, trial and churned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The five-period floor is a group-level fact — HAVING COUNT(*) >= 5 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between an expansion line and an error, and between a threshold applied to periods versus to dollars. On this db the five-period floor keeps exactly five workspaces — the 24, 17, 14, 13, 5 ladder — and they carry 63.5% of the 34,833.28 book, which is why the floor is a business decision, not just a syntax gate: drop it to 4 and the four-way tie floods the board with workspaces that together move far less revenue.",
      tag: "pipeline",
    },
    {
      id: "retool-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 periods always produce a mean (6.44 periods per workspace, and exactly four workspaces clear that bar on this db). On filtered staging tables — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each period to ITS workspace's average) re-runs per outer row and answers a different question at a different cost. And when the subquery feeds NOT IN, one NULL in the inner list poisons every comparison and empties the report — EXISTS is the honest shape for existence tests, and staging tables full of partial audit exports are exactly where that NULL comes from. State the inner fold's population and its empty-case behavior unprompted; that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "retool-t7",
      q: "The billing trend buckets periods by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and month-end is exactly when seat changes and renewals land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The spine tells the whole story on this db: the book opens at 3,731.97, troughs at 1,193.86 in July, jumps +1,158.21 into August, then drops -1,326.87 into November — and every one of those cells is a fold over the same 14 buckets, so a wrong month key corrupts all of them at once.",
      tag: "dates",
    },
    {
      id: "retool-t8",
      q: "Finance says a statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the admin console is a claim. Then the anomaly flip: a void statement WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes; the coverage split must read 21 exact / 1 partial (4,000.00 of 6,148.00) / 6 never-collected. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture ends at the GL: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "retool-t9",
      q: "The admin dashboard walks a running total ordered by created_at and two periods share a booking day. ROWS versus RANGE — when does the difference decide money?",
      a: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE admits peers: rows tied on created_at join the running sum in one step, so the cumulative jumps by two periods' value at once. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly row by row, which is what a period-by-period walk means. On a month spine ties are rare; at period grain they are guaranteed — this db carries same-day booking pairs like 2024-01-02. The governance rule: any running total in a close packet states its frame explicitly, because the two frames print different money on tie days and the audit console cannot reconcile a number whose definition wobbles.",
      tag: "windows",
    },
    {
      id: "retool-t10",
      q: "Walk me through stacking the in-flight register under the churned register with UNION ALL — and the comment you write above it.",
      a: "Both branches project the same columns — workspace, market, periods, booked value — plus a branch label ('in-flight' / 'churned') so the stack reads as one table. The label is load-bearing: it makes identical rows impossible, because a row can only carry one branch's tag. And that is the comment I write: UNION ALL chosen because the branch labels guarantee no cross-branch duplicates — bare UNION would silently dedup whole rows, and a governance packet that loses a workspace to byte-equality loses it without an error, which for an audit artifact is the worst possible failure mode. Set ops are correctness decisions, not style.",
      tag: "sets",
    },
    {
      id: "retool-t11",
      q: "EXCEPT just removed rows you expected to keep. Walk me through what it actually compares.",
      a: "EXCEPT is a whole-row set difference: it returns distinct rows of the left SELECT that do not appear as whole rows in the right SELECT — column count and type compatibility must match, aliases need not. Two properties bite. First, both sides dedup: a workspace appearing twice on the left survives once, so EXCEPT answers 'which workspaces', never 'how many rows'. Second, set ops treat NULLs as equal for comparison, so NULL-bearing rows compare cleanly where ordinary WHERE predicates would not. The canonical read on this db: shipped-workspaces EXCEPT delivered-workspaces returns exactly Liam O'Brien — one workspace with an expansion in flight and no completed term. When the result looks empty, I diff the two sides' counts and shapes before doubting the data.",
      tag: "sets",
    },
    {
      id: "retool-t12",
      q: "Three ways to find workspaces above the platform mean of 6.44 periods — derived table, correlated subquery, window. When does each win?",
      a: "Derived: fold periods per workspace in a CTE, cross-join the scalar mean, filter in the outer WHERE — one pass per fold, the workhorse, with the empty-inner-query behavior (NULL mean, zero rows) stated up front. Correlated: compare each workspace to a mean recomputed for ITS market — 5.6 in EU, 7.4 in APAC — which answers the per-market question the scalar cannot, at re-execution cost per row. Window: AVG(COUNT(*)) OVER () alongside the fold keeps every row and its mean in one result — best when the admin console wants the bar printed beside every workspace. On this db the platform bar clears exactly four workspaces — the 24, 17, 14 and 13-period ladders — and I can name them, which is the real test of having run it.",
      tag: "subqueries",
    },
    {
      id: "retool-t13",
      q: "Why does the close demand the one-pass FILTER census instead of four sequential queries?",
      a: "Because the census is an identity, not four numbers: 52 billed + 30 in flight + 14 trials + 7 churned must reconcile to the 103 COUNT(*) by construction, and only a single scan guarantees the branches were cut from the same rows at the same moment. Four sequential queries can drift — a retry lands between them, a filter edits in one and not the others — and an audit console whose branches sum to 102 or 104 is the day's first incident, not a rounding note. COUNT(*) FILTER (WHERE …) branches each aggregate independently in one pass; SUM(CASE WHEN … THEN 1 ELSE 0 END) is the portable twin when a data source lacks FILTER. The rule the console enforces: the branch sum equals the row count, or the packet does not ship.",
      tag: "aggregation",
    },
    {
      id: "retool-t14",
      q: "NOT IN almost shipped an empty compliance queue. NOT EXISTS or NOT IN — what do you standardize on, and why?",
      a: "NOT EXISTS, by default. NOT IN materializes the subquery's list and evaluates x NOT IN (…) as a chain of comparisons — one NULL in the list makes every row UNKNOWN, and the whole report empties while looking valid. NOT EXISTS short-circuits on the first match and treats NULLs as what they are: rows that simply do not join. The LEFT JOIN … IS NULL anti-join is the third form and reads best when the unmatched side's columns should appear; on this db the workspace-to-statement anti-join returns a confident zero, and I still write it as NOT EXISTS so a NULL that lands in a staging import tomorrow cannot silently blank the queue. If NOT IN must be used, the subquery column gets an explicit IS NOT NULL guard and a comment saying why.",
      tag: "nulls",
    },
    {
      id: "retool-t15",
      q: "How do you turn created_at and shipped_at TEXT stamps into the 2.98-day go-live clock — and where do the edges bite?",
      a: "julianday() converts both TEXT stamps to real day numbers and the difference is the rollout latency; over the 82 stamped periods it averages 2.9756, which the deck quotes as 2.98 with a 2–4 day spread. Banding with CAST(… AS INT) gives the distribution — 27 periods at 2 days, 30 at 3, 25 at 4 — the histogram behind 'is the rollout pod drifting?'. The edges: WHERE shipped_at IS NOT NULL ships with the query, because the 21 unstamped rows are a population definition (trials and churn, not missing data); and '%Y-%m' keys any monthly roll-up, since '%m' merges the two Januaries. Whole-day inputs, fractional mean — the 2.98 is a weighted center, and the 27/30/25 split is what proves it.",
      tag: "dates",
    },
    {
      id: "retool-t16",
      q: "Data-source names arrive as 'Prod DB' and 'prod db'. What breaks, and what is the hygiene pass?",
      a: "Grouping and joining by name splits one data source into two: every app built on top of it inherits the split, usage counts halve, and the audit log's app-to-source map disagrees with itself. The hygiene pass runs at load, not per query: trim, collapse whitespace, and normalize case into a canonical name keyed by the stable source id. In queries, UPPER() or LOWER() around a join key is a bandage that also kills index use — non-sargable exactly where the volume is. The rule I state: the name is a display attribute, the id is the join key, and any report grouping by a free-text column says so in its title — 'Prod DB versus prod db' is two sources to the GROUP BY and one source to the platform team.",
      tag: "casing",
    },
    {
      id: "retool-t17",
      q: "The pricing deck tiers 16 workspaces into quartiles by booked value. NTILE, PERCENT_RANK or CASE bands — pick one and defend it.",
      a: "NTILE(4) when the deck wants four equal groups: over 16 workspaces it deals 4/4/4/4 with tile edges at 444.80–705.39, 737.68–985.65, 1,098.60–2,667.93 and 3,644.56–7,262.35 — clean for a fixed headcount. PERCENT_RANK when membership must stay stable as workspaces come and go: it reports each row's 0–1 position, and 'top decile' survives headcount changes that would reshuffle NTILE tiles. CASE bands when the pricing page publishes fixed edges — this kit's 55 rate line is a policy constant, and a band built on it must not move when a workspace churns. The defense is the failure mode: NTILE reshuffles on churn, PERCENT_RANK wobbles at ties, CASE needs its edges maintained — pick the failure you can live with and document it.",
      tag: "windows",
    },
    {
      id: "retool-t18",
      q: "Give me each workspace's most recent activity period. MAX-join, correlated subquery or ROW_NUMBER — and where do ties bite?",
      a: "The MAX-join filters periods to created_at = (SELECT MAX(created_at) …) grouped per workspace and joins — fast, but it breaks when two periods share the top timestamp: both rows survive and the 'one latest period per workspace' claim is quietly false. The correlated version answers the same question and re-runs per workspace. ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) filtered to rn = 1 is the safe form: deterministic under ties, because the id tie-break is a stated policy, not scan luck. On this db all 16 workspaces resolve to one row each, but same-day booking pairs exist (2024-01-02 carries two), so the tie path is live the day someone ships twice. I ship ROW_NUMBER and say the tie-break out loud.",
      tag: "windows",
    },
    {
      id: "retool-t19",
      q: "The audit screen filters statements by customer_id and issued_on and the plan reads a full scan. Walk me through making it sargable.",
      a: "First read the plan: EXPLAIN QUERY PLAN showing SCAN means no index was consulted. Then shape the predicates so indexed columns stand bare — customer_id = ? is seekable; STRFTIME('%Y', issued_on) = '2024' is not, because the function wraps the column; the sargable form is issued_on >= '2024-01-01' AND issued_on < '2025-01-01'. A composite index on (customer_id, issued_on) serves both predicates in one seek — equality column first, range column second, since the range breaks further index use. The audit trail joins payments on invoice_id, so that FK wants its index too. On 28 statements the exercise is free; the habit transfers to the 28-million-row audit-log table, where the same shape of query is the difference between an admin console and an outage.",
      tag: "indexes",
    },
    {
      id: "retool-t20",
      q: "The workspace board must render identically for every admin who runs it. What is your deterministic-ORDER-BY policy?",
      a: "Every leaderboard sorts by its metric first and a stable secondary key second: ORDER BY seats DESC, workspace name — or c.id when names could ever collide. The rank window shares the same ORDER BY, so RANK's tie behavior and the row order agree. The rule exists because SQL guarantees nothing about tied rows: the seat ladder's tie blocks (two workspaces at 27 seats, two at 14, two at 12) will legitimately render in different sequences on different runs, and an admin console that flips between printouts fails the audit test on presentation alone. LIMIT makes it worse — LIMIT 5 without the full tie-break can swap the last row between runs. The tie-break goes in the query comment, because 'why did this workspace move' is a ticket the comment should close.",
      tag: "pipeline",
    },
    {
      id: "retool-t21",
      q: "Where does COALESCE belong in the go-live report — and where is it a lie?",
      a: "COALESCE belongs at the display layer, replacing NULL with a label: COALESCE(shipped_at, 'not yet live') is honest — it says the state out loud instead of printing a blank. It becomes a lie when it substitutes a value that participates in arithmetic: COALESCE(julianday(shipped_at) - julianday(created_at), 0) invents same-day go-lives for the 14 trials and 7 churned, drags the 2.98-day average down, and pushes coverage to 100% — three fabricated claims from one function call, and the audit console would wave all three through. The spine's baseline NULL gets the same protection: COALESCE(step, 0) turns 'no prior month' into 'flat month' on the close packet. Policy: NULL is 'not yet' or 'no prior', never zero; coalesce into text for humans, never into numbers for math.",
      tag: "nulls",
    },
    {
      id: "retool-t22",
      q: "The mean booked value per workspace is 370.15; the mean per period is 338.19. Which goes on the slide, and how do you say it?",
      a: "Whichever the slide's title claims — and the title must name the grain. 338.19 is SUM(total)/COUNT(*) over the 103 periods: every period weighs equally, so Alice Chen's 24 periods pull it toward her 7,262.35 book. 370.15 is the average of the 16 per-workspace means: every logo weighs equally, so Olivia Brown's single 444.80 period counts as much as Alice's 24. The gap is not an error to reconcile — it is two definitions, and 'average account' is ambiguous until the denominator is stated. My rule: per-period means for usage math, per-workspace means for coverage and seat-planning math, and the metric name carries the grain — 'mean booked per period' versus 'mean per-workspace lifetime value', never just 'average account size'.",
      tag: "aggregation",
    },
    {
      id: "retool-t23",
      q: "Walk me through the four checks before the close packet ships.",
      a: "One: the status census reconciles — 52 billed + 30 in flight + 14 trials + 7 churned equals the 103 COUNT(*) by construction; a branch that breaks the identity is the incident. Two: the coverage split reads 21 exact / 1 partial / 6 none across the 28 statements, and the partial is the one worth naming — INV-2025-025's 4,000.00 paid against a 6,148.00 bill. Three: the unbilled register totals 15,217.00 across 6 statements, with INV-2025-028 flagged as the claim-vs-log liar — status 'paid', zero legs. Four: the ledger trial balance lands 181,080 debits against 181,080 credits, delta zero. Any check that fails holds the close, because each one is a different table's claim about the same money — and a governance culture ships the reconciliation, not any single table's word.",
      tag: "quality",
    },
    {
      id: "retool-t24",
      q: "The pricing call challenges your go-live coverage rate. Defend the denominator.",
      a: "The metric is stamped periods over ALL periods booked: 82 of 103, 79.6%. The 14 trial/PoC rows stay in the base because 'not yet live' is precisely what the metric measures — removing them turns a coverage metric into a self-congratulation and reads 92.1%, a different number wearing this metric's name. The 7 churned stay too: they were provisioned, they never went live again, and their absence of stamps is the churn story. The defense is procedural: state the population before computing ('all booked periods, including open trials'), show the branch census that reconciles to 103, and offer the alternative readings by name — 82 of 82 'of live workspaces' is a retention stat, not coverage. On this desk the denominator is the product: the audit console exists to find the workspaces that have not gone live, and the denominator is where they live.",
      tag: "pipeline",
    },
  ],

  mcqs: [
    {
      id: "retool-mcq-1",
      prompt: "A period row's status reads 'shipped'. In this kit's Retool stage map, what happened?",
      choices: ["Seats billed — the term completed", "Expansion in flight — the seats changed, term not finished", "Churned — cancelled mid-term", "Trial/PoC — awaiting go-live"],
      answer: 1,
      why: "The stage map is fixed: shipped = expansion in flight (30 of 103 periods), with shipped_at as the seat-change stamp. Only 'delivered' (52) means the term completed and the seats count as billed.",
      notes: [
        { choice: 0, why: "Seats billed is 'delivered' — 52 periods. Calling the 30 in-flight expansions billed inflates the installed base before a single term finishes." },
        { choice: 3, why: "Trial/PoC is 'pending' — 14 periods with no seat-change stamp. Pending is a defined 'not yet' cohort, not mid-flight expansion." },
      ],
      difficulty: "easy",
    },
    {
      id: "retool-mcq-2",
      prompt: "Go-live coverage is stamped periods ÷ which population? The db holds 82 stamped, 14 trial/PoC and 7 churned of 103 booked.",
      choices: ["Stamped + churned only (82/89 = 92.1%)", "All periods booked (82/103 = 79.6%)", "Delivered periods only (52/82)", "Distinct workspaces (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL periods booked — trial/PoC rows stay in the denominator because 'not yet live' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pending inflates the rate to 92.1% by deleting the population the funnel exists to watch — the rollout queue is the point." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is term completion, shipped_at is the seat-change stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "retool-mcq-3",
      prompt: "EU carries 45 periods from 8 workspaces. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to workspaces (8). The gap between them — 5.6 periods per workspace — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every period has a workspace. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not workspaces — a third grain nobody asked for. The census is periods AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "retool-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to churned periods only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the churn share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1 and a displayed 8.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the churn map reads zero everywhere and LATAM's real 0 becomes indistinguishable from a bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-5",
      prompt: "Keep only workspaces carrying at least 10 periods. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY workspace HAVING COUNT(*) >= 10", "WHERE periods >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A period-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the top of the ladder — 24, 17, 14 and 13 periods — clears a 10-period bar per workspace.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'periods' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-6",
      prompt: "The power-user ladder runs 24, 17, 14, 13, 5 periods, then FOUR workspaces tied at 4. Under RANK, what rank do the two 3-period workspaces carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-period workspaces share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending periods double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 periods.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-8",
      prompt: "A staging-table churn list uses workspace_id NOT IN (SELECT customer_id FROM periods WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every period carries a customer_id. But staging tables are exactly where NULLs sneak in via partial audit exports, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "retool-mcq-9",
      prompt: "A governance packet stacks in-flight periods under churned periods in one layout, built with UNION. A reviewer says one workspace's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same workspace, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same workspace, same counts, no market or branch label — collapse into one, and the packet loses a workspace with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "retool-mcq-10",
      prompt: "A dashboard walks booked value period by period: SUM(total) OVER (ORDER BY created_at). Two periods share a created_at second, and the cumulative 'jumps two periods at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at period grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "retool-mcq-11",
      prompt: "The governance desk runs SELECT COUNT(*), COUNT(shipped_at) FROM orders and gets 103 beside 82. What does the 21-row gap hold?",
      choices: ["The 7 churned periods only", "The 14 trial/PoC rows plus the 7 churned periods — every row with no seat-change stamp", "Duplicate rows a sync job created", "The 30 in-flight expansions, which never get stamped"],
      answer: 1,
      why: "COUNT(column) skips NULLs, so the gap is exactly the rows with no go-live stamp: 14 trials + 7 churned = 21. The 30 shipped periods all carry the stamp — shipped_at is what MAKES them in-flight.",
      notes: [
        { choice: 0, why: "Churned is only 7 of the 21. Trials miss the stamp too, and forgetting them halves the gap the audit console actually monitors." },
        { choice: 3, why: "Shipped is defined BY the stamp — all 30 carry one. The unstamped population is trials and churn, never expansions." },
      ],
      difficulty: "easy",
    },
    {
      id: "retool-mcq-12",
      prompt: "An admin console panel counts trials with COUNT(o.status = 'pending') and prints 103. Why?",
      choices: ["The column holds 103 pending rows", "The comparison returns 1 or 0 per row — never NULL — so COUNT counts every row in the table", "COUNT ignores WHERE, so the filter never applied", "SQLite rounds the boolean up to the row count"],
      answer: 1,
      why: "The boolean expression yields 1/0 integers, and COUNT counts non-NULL results — all 103. The honest one-pass forms are COUNT(CASE WHEN status='pending' THEN 1 END), SUM(CASE …), or COUNT(*) FILTER (WHERE …) — the exact shapes the audit console runs.",
      notes: [
        { choice: 0, why: "Trials are 14 of 103. The other 89 print 0 — and COUNT counts the zeros." },
        { choice: 2, why: "There is no WHERE here at all — and COUNT never ignores one. The bug is the boolean inside the count." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-13",
      prompt: "The data-source read folds each market's plan families into one cell: GROUP_CONCAT(DISTINCT p.category). The US row lists six families and never mentions Fitness. What does that tell the platform team?",
      choices: ["The query dropped rows at random", "US workspaces genuinely touch 6 of the 7 families — no US line ever bought a Fitness SKU, and DISTINCT is what keeps repeat buys from masking the gap", "Fitness SKUs are out of stock in the US", "GROUP_CONCAT caps at six values"],
      answer: 1,
      why: "The roster is a distinct-value census: US covers Audio, Accessories, Video, Apparel, Electronics and Wearables — Fitness absent. EU and APAC run all 7; LATAM only 3. No error, no cap: the missing name is the finding, and it is exactly how an admin console reports coverage holes.",
      notes: [
        { choice: 2, why: "Stock is not consulted — the fold reads order lines only. The absence is an adoption fact, not an inventory one." },
        { choice: 3, why: "No cap exists. Without DISTINCT the repeats would just pad the string, hiding the very gap the roster exists to show." },
      ],
      difficulty: "easy",
    },
    {
      id: "retool-mcq-14",
      prompt: "Every stamped period books-to-goes-live in a whole number of days, yet AVG(julianday(shipped_at) - julianday(created_at)) prints 2.98. Why isn't the average whole?",
      choices: ["julianday returns fractional seconds", "The 82 stamped rows split 27 at 2 days, 30 at 3 and 25 at 4 — (27×2 + 30×3 + 25×4)/82 = 2.98, a weighted mean of whole days", "NULLs were averaged as 0.5", "The engine truncates 2.9756 for display"],
      answer: 1,
      why: "The go-live latency distribution is 27/30/25 across 2/3/4 days: 244 total days over 82 rows = 2.9756, quoted as 2.98. Whole-day inputs, fractional mean — and the 27/30/25 split is the rollout histogram that proves it.",
      notes: [
        { choice: 0, why: "julianday differences here land on whole days — the spread is exactly 2 to 4. Fractionality comes from weighting, not precision." },
        { choice: 2, why: "The stamped-only population excludes the 21 NULLs entirely; they never enter the average, which is the point." },
      ],
      difficulty: "easy",
    },
    {
      id: "retool-mcq-15",
      prompt: "A governance analyst asks for workspaces ranked outside the top three and writes WHERE RANK() OVER (ORDER BY COUNT(*)) > 3. What does SQLite say?",
      choices: ["It returns the right rows with a warning", "It errors — window results do not exist at WHERE time; rank in a CTE or derived table first, then filter the rank in the outer query", "It silently treats RANK() as 0 and returns everything", "It swaps the window for GROUP BY and still answers"],
      answer: 1,
      why: "WHERE runs before windows are computed, so the window reference is rejected outright. The fix is staging: fold and rank in a CTE, filter rn > 3 outside — the same pipeline-order lesson as filtering an aggregate in WHERE.",
      notes: [
        { choice: 0, why: "No warning exists — this is a hard parse/eval error, the friendly outcome compared to a silent wrong answer." },
        { choice: 2, why: "Nothing silent happens; the parser refuses. The dangerous cousin is filtering a rank ALIAS in WHERE, which fails the same way." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-16",
      prompt: "STRFTIME('%m', created_at) collapses the 14-month billing spine to 12 rows, and January reads 5,401.47. What happened?",
      choices: ["January had a sync duplicate", "'%m' carries no year, so January 2024 (3,731.97) and January 2025 (1,669.50) merge into one '01' bucket", "ROUND accumulated across the year boundary", "The spine CTE deduplicated the first month"],
      answer: 1,
      why: "'%m' is month-only: two Januaries fold into one key and 3,731.97 + 1,669.50 print as a single 5,401.47. The spine shrinks from 14 buckets to 12 and every LAG step across the December-to-January boundary compares against a Frankenstein month — the close packet's silent killer.",
      notes: [
        { choice: 0, why: "The arithmetic is correct — on the wrong key. The sum is right; the bucket is fictional." },
        { choice: 2, why: "No rounding is involved anywhere. The fold key lost the year, which is a string-format bug, not numeric noise." },
      ],
      difficulty: "hard",
    },
    {
      id: "retool-mcq-17",
      prompt: "Which workspaces carry an expansion in flight but never a completed term? The read is SELECT customer_id FROM orders WHERE status='shipped' EXCEPT SELECT customer_id FROM orders WHERE status='delivered', joined to names. What comes back?",
      choices: ["All 30 in-flight workspaces", "Exactly one workspace — Liam O'Brien, expansion in flight with zero delivered periods", "Every workspace with an open trial", "Nothing — EXCEPT requires identical column aliases"],
      answer: 1,
      why: "EXCEPT is a distinct set difference of whole rows: 30 in-flight periods collapse to their workspace ids, the delivered set removes everyone else, and one row survives — the expansion pipeline's whitespace read, the workspace an account team should call before the term lapses.",
      notes: [
        { choice: 0, why: "EXCEPT dedups first: 30 periods are a handful of workspaces, and most of them also carry delivered terms that get subtracted." },
        { choice: 3, why: "Aliases may differ — column count and types must match, names never do. Trial status is irrelevant to this particular set difference." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-18",
      prompt: "The seat ladder's tie blocks — two workspaces at 27 seats, two at 14, two at 12 — render in a different order every run. The fix?",
      choices: ["Cast the seat counts to TEXT", "Add a deterministic tie-break — ORDER BY seats DESC, workspace name (or id) — so equal counts sort by a stable second key", "Use DENSE_RANK, which orders ties alphabetically", "Wrap the query in a transaction"],
      answer: 1,
      why: "SQL guarantees nothing about tied rows' order — the three tie blocks will legitimately shuffle between runs. A stable secondary key makes the admin console reproducible; the rank window should share the same ORDER BY so ties and rows agree.",
      notes: [
        { choice: 2, why: "DENSE_RANK only removes gaps after ties — it neither orders rows nor alphabetizes anything." },
        { choice: 3, why: "Transactions change durability, never presentation order. The shuffling is absent ordering, not concurrency." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-19",
      prompt: "The audit screen filters WHERE SUBSTR(c.name, 1, 5) = 'Bruno' and EXPLAIN shows a full scan. The index is on c.name. Why?",
      choices: ["SUBSTR is not allowed in WHERE", "Wrapping the indexed column in a function hides it from the index — rewrite sargably, e.g. c.name LIKE 'Bruno%' or a half-open range on the column", "The index needs refreshed statistics", "Names should be stored uppercase"],
      answer: 1,
      why: "A function around the column is non-sargable: the engine cannot seek an index on expressions it must compute per row. The range-predicate rewrite lets the index do the work — same rows, seekable plan, and the audit screen stays an admin tool instead of a full-table chore.",
      notes: [
        { choice: 0, why: "It is allowed — it just cannot use the index as written. Allowed and fast are different claims." },
        { choice: 2, why: "Statistics do not rescue a rewritten expression. The predicate shape is the problem, not the planner's information." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-20",
      prompt: "Which workspaces run more periods than their OWN market's average? EU's intensity is 5.6, the platform's mean is 6.44. Why can't one scalar subquery answer it?",
      choices: ["It can — the platform mean and the market mean are the same number", "The comparison key differs per row, so the mean must be recomputed per workspace's market — a correlated subquery or a market-folded derived join; the scalar platform mean answers a different question", "Correlated subqueries are unsupported in SQLite", "The market mean needs a window function or it fails"],
      answer: 1,
      why: "A scalar subquery returns one number for every row. Per-market means vary — EU 5.6, APAC 7.4, US 9.5 — so the bar must move with the row: correlate on region, or fold market means and join. On the platform bar (6.44) exactly four workspaces clear; on EU's own bar (5.6) the answer set changes.",
      notes: [
        { choice: 0, why: "5.625 versus 6.44 — different baselines that clear different workspaces. One number cannot serve both questions." },
        { choice: 2, why: "SQLite supports correlated subqueries fine. The limitation is conceptual: which mean the comparison uses." },
      ],
      difficulty: "hard",
    },
    {
      id: "retool-mcq-21",
      prompt: "AVG(total) over all 103 periods prints 338.19. Folding per workspace first and averaging the 16 per-workspace means prints 370.15. Which is 'the average account', and why do they disagree?",
      choices: ["370.15 — the fold-first number; the disagreement is a rounding artifact", "338.19 weights every period equally; 370.15 weights every workspace equally — one workspace's 24 periods count once, not 24 times — so name the grain", "They must be equal by definition", "338.19 — because SQLite ignores NULLs"],
      answer: 1,
      why: "Both are real numbers answering different questions: the per-period mean is period-weighted, the per-workspace mean is logo-weighted. The smallest workspace's single 444.80 period counts as much as the 24-period leader's two dozen — a 32-point swing that decides whether 'average account' flatters coverage or volume.",
      notes: [
        { choice: 0, why: "No artifact — a 7.9% gap from weighting. Reconciling them is impossible; naming them is the job." },
        { choice: 2, why: "Equal only when every group has the same size. Sixteen workspaces carry 1 to 24 periods here." },
      ],
      difficulty: "hard",
    },
    {
      id: "retool-mcq-22",
      prompt: "The duplicate-charge audit pairs every two settlement legs on one statement: payments p1 JOIN payments p2 ON p2.invoice_id = p1.invoice_id. Five statements carry two legs each. How many rows return, and what does the p1.id < p2.id guard change?",
      choices: ["5 rows; the guard halves it", "10 rows — each pair appears in both orders; the guard keeps one canonical ordering per pair and blocks self-pairing", "15 rows; the guard folds them to 5", "0 rows — a self-join needs a table alias per copy"],
      answer: 1,
      why: "Each 2-leg statement yields both (leg1, leg2) and (leg2, leg1) — 10 rows. p1.id < p2.id keeps exactly one orientation per pair and excludes a row pairing with itself. Without it, the duplicate-charge console double-counts and pages billing for splits that are legitimate.",
      notes: [
        { choice: 0, why: "The unguarded join doubles every pair — the audit's count is wrong before any window threshold is applied." },
        { choice: 2, why: "Wrong arithmetic on both ends: 2 legs pair with 1 other leg, not 2, and nothing folds them post hoc." },
      ],
      difficulty: "hard",
    },
    {
      id: "retool-mcq-23",
      prompt: "NTILE(4) OVER (ORDER BY seats) tiers the 16 workspaces by seat count for the pricing deck. What lands in tile 1?",
      choices: ["The four biggest seat holders", "The four smallest — 3, 7, 9 and 12 seats — because NTILE deals tiles over ascending order by default", "A random quarter of workspaces", "The workspaces below the 55 rate line"],
      answer: 1,
      why: "NTILE(4) over 16 rows deals 4 per tile in ORDER BY sequence, ascending by default — tile 1 is the bottom quartile: 3, 7, 9 and the first 12-seat workspace. If tile 1 should mean biggest, order DESC and say so; the silent version inverts the whole pricing story.",
      notes: [
        { choice: 0, why: "That is tile 4 on the default ordering — the classic silent inversion that ships a deck arguing against itself." },
        { choice: 3, why: "NTILE never reads thresholds — the 55 rate line is a policy constant, CASE work, not a tile boundary." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-24",
      prompt: "The close appendix wants each month's NEXT-month value beside it instead of the prior. Which change does that, and what lands on the last row?",
      choices: ["Keep LAG and reverse the spine; the last row stays NULL", "Swap LAG(gmv) for LEAD(gmv) — every step flips sign, and 2025-02, the spine's end, carries NULL because no next month exists", "LEAD errors on the last row", "LEAD and LAG are aliases"],
      answer: 1,
      why: "LEAD reaches forward one row: the delta column flips sign and the NULL edge moves from the first row to the last. The 2025-02 close at 2,390.53 gets no forward value — it is the baseline, and the appendix says so.",
      notes: [
        { choice: 0, why: "Reversing the spine mislabels the walk — the delta column then reads backwards against a forward-pointing key." },
        { choice: 2, why: "LEAD returns NULL at the frame's edge, exactly as LAG does at its start. Edge NULLs are the definition, not a failure." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-25",
      prompt: "The usage band reads CASE WHEN total >= 1000 THEN 'heavy' WHEN total >= 500 THEN 'core' ELSE 'light' END. The db holds exactly 1 heavy period (1,088.44), 24 core, 78 light. What breaks if the first two arms swap?",
      choices: ["Nothing — CASE arms are independent", "The heavy arm stops firing: >= 500 is checked first and swallows the 1,088.44 period, so the board reads 0 heavy / 25 core / 77 light", "The query errors on overlapping ranges", "ELSE captures the heavy period"],
      answer: 1,
      why: "CASE is first-match: overlapping >= arms must run big-to-small. Swapped, the heavy period satisfies >= 500 first and the heavy count silently zeroes — same rows, wrong bands, no error. Permission bands ship the same way: a reordered WHEN quietly re-assigns access tiers.",
      notes: [
        { choice: 0, why: "Arm order IS semantics whenever ranges overlap. Independent arms are only the non-overlapping equality case." },
        { choice: 3, why: "ELSE fires only after every WHEN fails — the heavy period never reaches it because an earlier arm already captured it." },
      ],
      difficulty: "medium",
    },
    {
      id: "retool-mcq-26",
      prompt: "The usage census joins orders to order_items in the query editor and COUNT(*) jumps from 103 to 251. What happened, and what re-folds it?",
      choices: ["The join duplicated corrupted rows; VACUUM fixes it", "The join is one-to-many — 251 seat/usage lines across 103 periods; COUNT(DISTINCT o.id) re-folds to periods while COUNT(oi.id) keeps lines", "COUNT(*) counts columns after a join", "The join dropped NULLs and padded the rest"],
      answer: 1,
      why: "Fan-out is the grain change, not corruption: each period carries 1–6 seat lines. The rule is that every COUNT states its grain — DISTINCT o.id for periods, oi.id for lines — and the 2.44 lines-per-period ratio is the expansion signal this kit reads.",
      notes: [
        { choice: 0, why: "Nothing is corrupt. The 'fix' would be worrying about data that is behaving exactly as modeled." },
        { choice: 2, why: "COUNT always counts rows. Columns are a different aggregate family entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "retool-mcq-27",
      prompt: "SELECT c.name, COUNT(*) … GROUP BY c.id LIMIT 5 claims to return the 'top five workspaces'. The reviewer rejects it. Why?",
      choices: ["LIMIT caps at 4 rows", "Without ORDER BY there is no top — SQLite returns whichever five rows its scan finds first, and the five can change run to run", "GROUP BY must come after LIMIT", "The count needs ROUND"],
      answer: 1,
      why: "Top-N is ORDER BY + LIMIT; without the sort, 'top' is fiction wearing a number. On this db the period ladder runs 24, 17, 14, 13, 5 — but only the ORDER BY makes those the five that print.",
      notes: [
        { choice: 0, why: "LIMIT takes any non-negative n. The defect is ordering, not the count." },
        { choice: 2, why: "Clause order is fixed by the pipeline — LIMIT is last. Reordering is a syntax error, not a semantics fix." },
      ],
      difficulty: "easy",
    },
    {
      id: "retool-mcq-28",
      prompt: "The audit console wants billed, in-flight, trial and churned in one scan via COUNT(*) FILTER (WHERE status = …), with SUM(CASE …) as the portable twin. What property must the four branches hold for the console to sign off?",
      choices: ["Each branch must be a separate query for speed", "The arms must be mutually exclusive and exhaustive over status — 52 + 30 + 14 + 7 must reconcile to the 103 COUNT(*) by construction, or the console flags itself", "FILTER only works on numeric columns", "The branches must be sorted DESC"],
      answer: 1,
      why: "The one-pass census is an identity: four arms cut from the same 103 rows must sum back to 103. Drift — a retry between four sequential queries, a filter edited in one arm — breaks the reconciliation, and a governance console that cannot reconcile flags itself before the close does.",
      notes: [
        { choice: 0, why: "Four sequential queries are four ways to drift out of agreement — the exact failure the single pass exists to prevent." },
        { choice: 2, why: "FILTER takes any predicate and works on counts, sums, averages alike. The constraint is logic, not type." },
      ],
      difficulty: "hard",
    },
    {
      id: "retool-mcq-29",
      prompt: "A dashboard backfills the go-live stamp: COALESCE(shipped_at, created_at). Go-live coverage jumps from 79.6% to 100%. What actually happened?",
      choices: ["The backfill repaired 21 broken stamps", "The 21 unstamped rows (14 trials, 7 churned) now display their booking date as their go-live date — the query stopped measuring rollout and started measuring existence", "COALESCE converted the timestamps correctly", "The coverage denominator shrank"],
      answer: 1,
      why: "The display convenience became a definitional lie: fabricated same-day go-lives for every never-live row. Coverage's whole job is finding the unstamped cohort — the coalesce deletes the finding while the query still compiles, and the audit console's own thesis is that absence of activity is a finding.",
      notes: [
        { choice: 0, why: "Nothing was broken. Absence of a stamp was the finding, not a defect to repair." },
        { choice: 3, why: "The denominator is still 103 — the numerator was inflated to meet it. Same formula, inverted honesty." },
      ],
      difficulty: "hard",
    },
    {
      id: "retool-mcq-30",
      prompt: "Statement INV-2025-025 bills 6,148.00 and carries one settlement leg of 4,000.00. In the register's exact/partial/none coverage split, where does it land?",
      choices: ["exact — a settlement leg exists", "partial — legs exist but SUM(payments) does not equal billed: 4,000.00 against 6,148.00, the only partial on the book", "none — the balance is still open", "void — open statements cannot carry legs"],
      answer: 1,
      why: "Coverage is a comparison, not a presence test: exact requires SUM(p.amount_cents) = i.amount_cents (21 statements), partial is the mismatch band (this one), none is zero legs (6, worth 15,217.00). One leg short of the bill is the definition of partial.",
      notes: [
        { choice: 0, why: "Presence is not settlement — exact means equality to the cent, and 4,000.00 against 6,148.00 misses by 2,148.00." },
        { choice: 2, why: "None means the payment log holds zero rows. This statement holds one — it is mid-journey, not untouched." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-retool-1",
      tier: "easy",
      topic: "x2",
      universe: "month-close",
      title: "The one-pass governance census",
      brief:
        "Retool-flavored brief on the storefront db: month-end close opens with the governance census the audit console runs in ONE pass — booked periods, seats billed, expansions in flight, trial/PoC rows, churned rows, and the booked value the census must foot to. Probed facts: 103 periods booked; 52 delivered (seats billed), 30 shipped (expansion in flight), 14 pending (trial/PoC), 7 cancelled (churned); the book totals 34,833.28. The close packet rejects any census whose branches do not reconcile to 103 by construction — four sequential queries are four ways to drift out of agreement with the console.",
      ask: "Return the one-pass census: booked periods, seats billed, in-flight expansions, trials, churned, and booked value to 2 decimals, in that column order.",
      template:
        "SELECT COUNT(*) AS periods,\n       COUNT(*) FILTER (WHERE status = {1}) AS seats_billed,\n       COUNT(*) FILTER (WHERE status = 'shipped') AS in_flight,\n       COUNT(*) FILTER (WHERE status = {2}) AS trials,\n       COUNT(*) FILTER (WHERE status = {3}) AS churned,\n       ROUND({4}(total), {5}) AS book_value\nFROM orders;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the seats-billed literal",
          why: "Seats billed are status 'delivered' — 52 of 103. 'shipped' here would count the 30 in-flight expansions as billed and overstate the installed base; the census must read 52 to reconcile.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the trial literal",
          why: "Trial/PoC rows are status 'pending' — 14 with no seat-change stamp yet. 'open' is an invoice status, not an order status: the arm would read zero and silently lose the entire trial queue.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the churned literal",
          why: "Churned periods are status 'cancelled' — 7 on the db. 'shipped' here would classify healthy in-flight expansions as churn and page customer success about accounts that are actually expanding.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the book-value fold",
          why: "Booked value folds with SUM(total) — 34,833.28 across 103 periods. AVG prints the 338.19 mean and COUNT prints 103: real numbers wearing the census's name, and neither is money.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the money precision",
          why: "Money reports to 2 decimals — 34,833.28. ROUND(…, 1) prints 34,833.3 and the census stops tying to the billing register the close packet ships beside it.",
        },
      ],
      distractors: ["'shipped'", "'open'", "AVG", "COUNT", "MAX", "1"],
      walkthrough:
        "One scan, six cells, zero joins. FILTER (WHERE …) branches the status census inside a single aggregate pass — 52 seats billed + 30 in flight + 14 trials + 7 churned reconciles to the 103 booked COUNT(*) by construction, which is the property the close packet demands before anything ships. The money cell folds SUM(total) to 34,833.28 at 2-decimal precision. The distractors each break differently: 'shipped' in a literal arm swaps a healthy population in — 30 expansions masquerading as billed or churned; 'open' is an invoice status that zeroes the arm and silently drops a queue; 1 in a literal arm compares text to a number and zeroes it the same way; AVG prints the 338.19 mean where the 34,833.28 book belongs; COUNT prints 103 twice and the value column stops being money; MAX reports the single biggest period (1,088.44) as the whole book; and 1 in the precision slot rounds past the register. The census discipline is Retool's own: one pass, one truth, branches that must sum to the COUNT(*) — the console and the query cannot be allowed to disagree.",
    },
    {
      id: "cs-retool-2",
      tier: "medium",
      topic: "q6",
      universe: "growth",
      title: "The seat-band concentration audit",
      brief:
        "Retool-flavored brief on the storefront db: before the pricing call, the monetization pod reads the seat-band audit — every seat/usage line CASE-banded at the 55 rate line the pricing page publishes, folded per band into lines, seats, average rate and billed value. Probed facts: the power band (unit_price >= 55) carries 118 lines, 230 seats at a 115.85 average rate, billing 26,605.51 — 76.4% of the 34,833.28 book; the occasional band carries 133 lines, 268 seats at 31.01, billing 8,227.77. The read is power-first: the band that carries the money leads the page.",
      ask: "Return each seat band with its line count, seat count, average rate to 2 decimals and billed value to 2 decimals, biggest average rate first.",
      template:
        "WITH seat_lines AS (\n  SELECT quantity,\n         unit_price,\n         CASE WHEN unit_price {1} {2} THEN {3} ELSE 'occasional' END AS band\n  FROM order_items\n)\nSELECT band,\n       COUNT(*) AS lines,\n       SUM(quantity) AS seats,\n       ROUND(AVG(unit_price), {4}) AS avg_rate,\n       ROUND(SUM(quantity * unit_price), 2) AS billed\nFROM seat_lines\nGROUP BY band\nORDER BY avg_rate {5};",
      slots: [
        {
          answer: ">=",
          kind: "keyword",
          label: "the power-band edge",
          why: "The published power band starts AT the 55 line — unit_price >= 55 captures the 115.85-rate seats. '<' flips the bands outright and '!=' silently swaps the labels while both rows still print — the silent lie.",
        },
        {
          answer: "55",
          kind: "number",
          noVerify: true,
          label: "the policy threshold",
          why: "55 is the pricing page's band edge — a policy constant, not a figure the result computes. Moving it to 50 drags the 59.99-rate SKUs into the power band and the concentration story inflates.",
        },
        {
          answer: "'power'",
          kind: "keyword",
          label: "the band label",
          why: "The high-rate arm is labeled 'power' — 118 lines carrying 230 seats at 115.85. 'occasional' here would swap the labels so the 26,605.51 power bill prints on the 31.01 band and the pricing call reads upside down.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the rate precision",
          why: "Rates report to 2 decimals — 31.01 against 115.85, the two cells the pricing call quotes. ROUND(…, 1) prints 31.0 and 115.9, and the band averages stop matching the price list the page publishes.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the power-first direction",
          why: "The read is power-first: 115.85 on top, 31.01 below — the concentration story leads. ASC would open the pricing call on the 8,227.77 occasional band and bury the 76.4% headline.",
        },
      ],
      distractors: ["<", "=", "!=", "'occasional'", "1", "ASC"],
      walkthrough:
        "Stage the banding, then fold. The CTE stamps every one of the 251 seat/usage lines with a band at the 55 edge; the outer SELECT folds per band: the power arm reads 118 lines, 230 seats, a 115.85 average rate and 26,605.51 billed; the occasional arm reads 133 lines, 268 seats, 31.01 and 8,227.77 — the two billed cells footing exactly to the 34,833.28 book, with power carrying 76.4% of it on 46% of the seats. That inversion is the whole pricing story: seats are broad, dollars are concentrated. The distractors each break differently: '<' flips the bands so 31.01 prints on top wearing 'power'; '=' empties the power arm because nothing is priced exactly at the edge; '!=' swaps the labels while both rows still print; 'occasional' in the label slot relabels the 26,605.51 arm and the deck argues against itself; 1 in the threshold slot bands every line as power and deletes the occasional row; 1 in the precision slot rounds the rates past the price list; ASC buries the 115.85 headline under the 31.01 tail. Ordering by average rate DESC is the read: the band that carries the money leads the page.",
    },
    {
      id: "cs-retool-3",
      tier: "medium",
      topic: "t5",
      universe: "pricing",
      title: "The power-seat ladder",
      brief:
        "Retool-flavored brief on the storefront db: before the pricing call, the monetization pod ranks every workspace by provisioned seats — the power-user ladder that decides where enterprise seat expansion actually lives. Probed facts: the 498 seats across 251 lines spread over 16 workspaces, with the seat ladder reading 100, 98, 67, 62, then a TWO-way tie at 27 (Chloe Dubois and Pedro Alvarez, both EU at 2,667.93 and 1,686.17 billed), 18, 15, another TWO-way tie at 14 (Isabella Rossi EU, Jamal Wright US), 13, and a third TWO-way tie at 12 (Farid Nasser APAC, Noah Meyer EU) — three tie blocks on one ladder. The published policy is RANK with gaps: each tie holds its rung twice and the next distinct count skips — after the 27s at rung 5, the next rung is 7, not 6. The floor is 12-plus seats so all three tie blocks stay on the board. The ladder reads biggest seat count first, and the deterministic tie-break is workspace name so the board renders identically for every admin.",
      ask: "Return each workspace with market, seat count, line count and billed value to 2 decimals, plus both rank policies — RANK with gaps and DENSE_RANK without — computed over seats, biggest seat count first.",
      template:
        "WITH ladder AS (\n  SELECT c.name AS workspace,\n         c.region AS market,\n         SUM(oi.quantity) AS seats,\n         COUNT(oi.id) AS lines,\n         ROUND(SUM(oi.quantity * oi.unit_price), 2) AS billed\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  JOIN order_items oi ON oi.order_id = o.id\n  GROUP BY c.id\n)\nSELECT workspace,\n       market,\n       seats,\n       lines,\n       billed,\n       {2}() OVER (ORDER BY seats DESC) AS rung_gap,\n       DENSE_RANK() OVER (ORDER BY seats DESC) AS rung_ties\nFROM ladder\nWHERE seats >= {1}\nORDER BY seats {3}, workspace;",
      slots: [
        {
          answer: "12",
          kind: "number",
          label: "the ladder floor",
          why: "The 12-seat floor keeps all three tie blocks on the board — 27s, 14s and 12s — so the gap policy is visible three times in one read. Raise it to 13 and the two 12-seat workspaces drop, the third tie vanishes, and the board understates how common ties are.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the gap-preserving policy",
          why: "The published pricing policy is RANK with gaps: the 27-seat tie holds rung 5 twice and the next rung is 7 — one phantom rung per tie block. ROW_NUMBER hands each tie an arbitrary split and DENSE_RANK compresses the next rung; neither is the ladder the pricing page ships.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-seat-first direction",
          why: "The read is power-first: 100 seats on top, down to the 12-seat tail — where enterprise expansion lives is the headline. ASC opens the pricing call on the smallest workspaces and the concentration story reads bottom-up.",
        },
      ],
      distractors: ["13", "ROW_NUMBER", "ASC"],
      walkthrough:
        "Fold seats per workspace first, then rank twice. The ladder CTE walks periods to their seat/usage lines and groups by workspace: 16 workspaces, 498 seats, 251 lines, with ROUND(SUM(quantity * unit_price), 2) carrying billed value beside the count — Alice Chen 100 seats / 7,262.35 down to Olivia Brown 3 / 444.80. The floor WHERE seats >= 12 keeps 13 of the 16 workspaces, deliberately including the two 12-seat rows so the third tie block stays visible. The two windows share one ORDER BY seats DESC: the 27-seat pair both take rung 5, the 14-seat pair rung 9, the 12-seat pair rung 12 — and after each tie RANK skips one phantom rung (the next distinct counts read 7, 11, 14) while DENSE_RANK counts through (6, 9, 11). That one-rung cost per tie, three times on one ladder, IS the policy the pricing page publishes, and the deterministic ORDER BY seats DESC, workspace makes every tie block render identically run to run. The distractors each break differently: 13 in the floor slot drops the 12-seat tie and flattens the story to two ties; ROW_NUMBER in the policy slot splits every tie arbitrarily — an ordering nobody signed off; ASC flips the ladder so the pricing call opens on Olivia Brown's 3 seats. One fold, two policies, one stated floor — and say out loud which rung each tie costs.",
    },
    {
      id: "cs-retool-4",
      tier: "hard",
      topic: "j6",
      universe: "fraud",
      title: "The split-rail pair audit",
      brief:
        "Retool-flavored brief on the storefront db: the audit console's duplicate-charge screen pairs every two settlement legs sharing a statement and asks one question — duplicate or split? Probed facts: exactly 5 statements carry two legs, and every pair is card-then-wire with the two legs splitting the bill in exact halves — INV-2024-001 (2,430.00 + 2,430.00 = 4,860.00 billed, legs 14 days apart), INV-2024-005 (2,642.00 × 2 = 5,284.00, 15 days), INV-2024-012 (2,361.50 × 2 = 4,723.00, 10 days), INV-2024-019 (2,807.00 × 2 = 5,614.00, 10 days) and INV-2024-022 (2,229.50 × 2 = 4,459.00, 15 days). Every pair sums exactly to its bill and lands inside the 15-day split window — all five are legitimate split payments, zero duplicates, and the audit signs off. The register reads statement number first, and the pair-once guard (p1.id < p2.id) is what keeps each statement to one row instead of two mirrored ones.",
      ask: "Return each two-leg statement with its number, first rail, second rail, first leg to 2 decimals, second leg to 2 decimals, the day gap between legs, and billed value to 2 decimals, statement number first.",
      template:
        "SELECT i.number AS statement,\n       p1.method AS first_rail,\n       p2.method AS second_rail,\n       ROUND(p1.amount_cents / {1}, 2) AS first_leg,\n       ROUND(p2.amount_cents / 100.0, 2) AS second_leg,\n       julianday(p2.paid_on) - julianday(p1.paid_on) AS gap_days,\n       ROUND(i.amount_cents / 100.0, 2) AS billed\nFROM payments p1\nJOIN payments p2 ON p2.invoice_id = p1.invoice_id AND p1.id {2} p2.id\nJOIN invoices i ON i.id = p1.invoice_id\nWHERE julianday(p2.paid_on) - julianday(p1.paid_on) <= {4}\nORDER BY i.number {3};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Legs carry INTEGER cents — 243,000 prints as 2,430.00 only under the /100.0 read. Dividing by 10.0 inflates every leg tenfold and the pair stops summing to the billed cell; dividing by 1 leaves raw cents on the audit register.",
        },
        {
          answer: "<",
          kind: "keyword",
          label: "the pair-once guard",
          why: "p1.id < p2.id keeps one canonical orientation per pair and blocks a leg from pairing with itself. Without it (or with >) each pair appears in both orders — the duplicate-charge console double-counts five splits as ten findings and pages billing for nothing.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the statement-first direction",
          why: "The register reads chronologically by statement number — INV-2024-001 opens, INV-2024-022 closes — so the 10-15 day split cadence reads top to bottom. DESC buries the earliest pair at the bottom and the cadence story reads backwards.",
        },
        {
          answer: "15",
          kind: "number",
          label: "the split-window threshold",
          why: "The 15-day window is the console's split-payment policy: legs inside 15 days on one statement are a split, legs beyond it get flagged for review. The five gaps read 14, 15, 10, 10, 15 — every pair lands inside, which is the sign-off; 10 would evict three legitimate splits and cry wolf.",
        },
      ],
      distractors: [">", "14", "DESC", "10"],
      walkthrough:
        "A self-join that pairs legs once, then a policy window. The payments table joins ITSELF on shared invoice_id with the pair-once guard p1.id < p2.id: each two-leg statement yields exactly one row — the card leg as first_rail, the wire leg as second_rail — and the join to invoices attaches the billed cell. Five rows survive: INV-2024-001 2,430.00 + 2,430.00 against a 4,860.00 bill, down to INV-2024-022 2,229.50 + 2,229.50 against 4,459.00, with gap_days reading 14, 15, 10, 10, 15. The verdict logic is two comparisons per row: legs summing to billed (all five do — exact halves) and both legs inside the 15-day window (all five are) — so the register signs off zero duplicates, five legitimate split-rail statements, 24,940.00 of paired settlement. The cents discipline holds: amount_cents / 100.0 turns 243,000 into 2,430.00, and the halves reconcile to the penny because the seed data split them evenly. The distractors each break differently: > in the guard slot flips every pair's orientation — wire prints as first_rail, the gap goes negative, and the register's rail story inverts while still returning five rows; 14 in the window slot evicts the two 15-day pairs and the console flags two legitimate splits for review; DESC buries the earliest statement and the cadence reads backwards; 10 in the window slot keeps only the two 10-day pairs and evicts three. Self-join for pairing, id guard for once-only, cents over one hundred, window stated — that is the duplicate-charge audit.",
    },
    {
      id: "cs-retool-5",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The unbilled workspace register",
      brief:
        "Retool-flavored brief on the storefront db: before the close packet ships, the governance pod refreshes its compliance anti-join — workspaces whose periods never produced a billing statement, provisioned seats with zero paper behind them, the license-compliance gap that mirrors the claim-vs-log probe. Probed facts: exactly 5 of 16 workspaces carry zero statements — Keiko Sato (APAC, 4 periods, 18 seats, booked 1,098.60), Bruno Silva (LATAM, 2 periods, 13 seats, 852.44), Farid Nasser (APAC, 3 periods, 12 seats, 1,458.97), Noah Meyer (EU, 4 periods, 12 seats, 737.68) and Dmitri Volkov (EU, 2 periods, 9 seats, 599.26) — 15 periods, 64 seats and 4,746.95 of booked value with no statement. The register reads biggest booked value first behind a 9-seat floor that keeps the whole queue on one board. Noah Meyer is the row the pod walks line by line: 2 in-flight seat-change stamps and still nothing billed.",
      ask: "Return each unbilled workspace with market, period count, seat count and booked value to 2 decimals, biggest booked first.",
      template:
        "SELECT c.name AS workspace,\n       c.region AS market,\n       COUNT(DISTINCT o.id) AS periods,\n       SUM(oi.quantity) AS seats,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS booked_value\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nLEFT JOIN invoices i ON i.customer_id = {1}\nWHERE i.id IS {2}\nGROUP BY c.id\nHAVING SUM(oi.quantity) >= {3}\nORDER BY booked_value {4};",
      slots: [
        {
          answer: "c.id",
          kind: "keyword",
          label: "the anti-join key",
          why: "The LEFT JOIN must ride the workspace's own id: ON i.customer_id = c.id keeps every workspace and attaches its statements, leaving NULL payloads where billing never touched. i.customer_id = i.id compares a statement's reference to its own id — a pairing that means nothing — and o.id ties statements to period rows instead.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-statement guard",
          why: "Unmatched statements leave i.id NULL, and only IS NULL keeps the never-billed rows. IS NOT NULL flips the register to the 11 billed workspaces — the reconciliation list, not the compliance gap — and the close packet reads committed billing as exposure.",
        },
        {
          answer: "9",
          kind: "number",
          label: "the seat floor",
          why: "The 9-seat floor keeps every unbilled workspace on the board — the seat counts run 18, 13, 12, 12, 9 — while documenting the review threshold in the query itself. Raise it to 12 and Dmitri Volkov's 9-seat workspace leaves the register while still running 2 delivered periods unbilled.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-booked-first direction",
          why: "The pod reads the biggest exposure first: Farid Nasser's 1,458.97 leads, Dmitri Volkov's 599.26 trails. ASC opens the close review on the smallest gap and the 4,746.95 compliance exposure gets argued bottom-up.",
        },
      ],
      distractors: ["c.region", "NOT NULL", "12", "ASC"],
      walkthrough:
        "A LEFT JOIN anti-join at the workspace grain, folded through the seat lines. Join workspaces to periods and their seat/usage lines INNER — every workspace carries both — then LEFT JOIN statements ON i.customer_id = c.id: billed workspaces carry statement rows, the never-billed carry NULL payloads, and WHERE i.id IS NULL keeps exactly those. Five rows survive the 9-seat floor: Keiko Sato 4 periods / 18 seats / 1,098.60, Bruno Silva 2 / 13 / 852.44, Farid Nasser 3 / 12 / 1,458.97, Noah Meyer 4 / 12 / 737.68, Dmitri Volkov 2 / 9 / 599.26 — 64 seats provisioned and 4,746.95 booked with no statement behind any of it. COUNT(DISTINCT o.id) matters here because the lines fan the row count out from periods to usage lines — the register must count workspaces' PERIODS, not lines, or the census grain drifts. The read that ranks the queue: Bruno and Dmitri show delivered terms with zero billing (clean compliance misses), while Noah shows 2 in-flight seat-change stamps — seats are moving on a workspace the billing side has never seen, the mirror image of the paid-claim liar. The distractors each break differently: c.region in the join key slot compares an integer FK to text and matches nothing, so all 16 workspaces flood the register; NOT NULL flips to the 11 billed workspaces; 12 in the floor slot evicts Dmitri's 9 seats; ASC reads the exposure bottom-up. Anti-join for coverage, IS NULL for the miss, DISTINCT for the grain, biggest first — that is the unbilled refresh.",
    },
    {
      id: "cs-retool-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The billing spine walk",
      brief:
        "Retool-flavored brief on the storefront db: the monthly close opens with the billing spine walk — every month of the 14-month spine (2024-01 to 2025-02) with its period count and month-over-month step, so cadence arguments start from one query instead of five screenshots. Probed facts: the spine opens at 3,731.97 over 8 periods in 2024-01 with a NULL step — the baseline row, not a zero; it sags through spring (-992.56 into March), troughs at 1,193.86 in July, then jumps +1,158.21 into August's 2,352.07; the steepest single step is -1,326.87 into November (1,648.80 over 6 periods); the walk closes at 2,390.53 over 7 periods in 2025-02 on a +721.03 step. The month key is the '%Y-%m' STRFTIME format — '%m' alone is the known trap that merges January 2024 (3,731.97) into January 2025 (1,669.50) as one 5,401.47 row and silently deletes a month from the spine. The walk reads oldest month first, and the first row's NULL step is quoted as-is in the appendix, never coalesced to zero.",
      ask: "Return the monthly spine with period count, booked value to 2 decimals, the previous month's value beside it, and the month-over-month step to 2 decimals, oldest month first.",
      template:
        "WITH spine AS (\n  SELECT STRFTIME({3}, o.created_at) AS month,\n         COUNT(*) AS periods,\n         ROUND(SUM(o.total), 2) AS gmv\n  FROM orders o\n  GROUP BY month\n), steps AS (\n  SELECT month,\n         periods,\n         gmv,\n         {1}(gmv) OVER (ORDER BY month) AS prev_gmv\n  FROM spine\n)\nSELECT month,\n       periods,\n       gmv,\n       prev_gmv,\n       ROUND(gmv - prev_gmv, 2) AS step\nFROM steps\nORDER BY month {2};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the backward-looking offset",
          why: "A step is this month minus LAST month: LAG(gmv) OVER (ORDER BY month) reaches back one row and leaves the first row NULL — the baseline by definition. LEAD reaches forward and flips every sign; SUM(gmv) OVER (…) builds a running total, a different appendix entirely.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the oldest-first spine direction",
          why: "The walk reads chronologically — 2024-01's 8 periods and 3,731.97 open the appendix and the 2025-02 close lands last, so the trough and the August rebound read left to right. DESC tells the same story backwards and puts the NULL baseline at the bottom, where nobody expects a baseline.",
        },
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month key format",
          why: "The spine key must carry the year: '%Y-%m' gives 14 distinct months from 2024-01 to 2025-02. '%m' alone merges the two Januaries into one 5,401.47 '01' row — the spine prints 12 rows, every LAG step across the year boundary is fiction, and nothing errors.",
        },
      ],
      distractors: ["LEAD", "DESC", "'%m'"],
      walkthrough:
        "Two stages: fold the calendar, then step it. The spine CTE folds all 103 periods into 14 monthly rows keyed by STRFTIME('%Y-%m', created_at), carrying COUNT(*) beside SUM(total) so the close can see that January's 3,731.97 rode 8 periods while July's 1,193.86 trough rode 8 too — value moved without volume, the kind of read a screenshot never shows. The steps CTE adds LAG(gmv) OVER (ORDER BY month): each month carries its predecessor, 2024-01's prev_gmv is NULL because there is no December 2023 to reach back to, and the outer SELECT prints the step as ROUND(gmv - prev_gmv, 2) — -122.33 into February, -992.56 into March, the -853.57 slide into the July trough, the +1,158.21 August rebound, the -1,326.87 November slump, the +721.03 close. The first row's NULL is quoted, never coalesced: a zero would make the opening month look like it lost 3,731.97 overnight — a fabricated claim exactly of the kind the audit console exists to catch. The '%m' trap deserves its horror story: the query still runs, the spine shrinks to 12 rows, January prints a merged 5,401.47, and every cadence argument that month is fiction. The distractors each break differently: LEAD flips every sign and moves the NULL to 2025-02's row; DESC walks the spine backwards with the baseline at the bottom; '%m' merges the Januaries and deletes a month from the board. Fold on the year-aware key, step with LAG, read oldest first, quote the NULL as the baseline it is.",
    },
  ],

  problems: [
    { slug: "percentage-of-users-attended-a-contest", why: "Adoption share: what fraction of a workspace's invited users actually touched an app this week? A distinct-actor share with the denominator stated — the weekly pulse the build-velocity pod ships." },
    { slug: "immediate-food-delivery-ii", why: "Rollouts promised inside the window versus late ones — the promptness share is a conditional rate over a timestamp comparison, the same shape as Retool's go-live SLA read." },
    { slug: "fix-names-in-a-table", why: "Data-source naming hygiene before any join: 'Prod DB' versus 'prod db' silently splits one source into two, and with it every app built on top of it." },
    { slug: "find-users-with-high-token-usage", why: "Power-user detection: which users run query volumes far above the workspace norm? A fold-then-threshold read — the exact shape of a builder-seat upsell list." },
    { slug: "usage-tier-percentiles", why: "Seat tiers cut by percentiles, not guesswork: which users land in the top usage quintile? NTILE banding is how the pricing team stages power versus occasional seats." },
    { slug: "net-revenue-retention", why: "Seat expansion and contraction roll up to NRR — the metric the pricing call actually manages. Cohort revenue walks with LAG are exactly this problem's shape." },
    { slug: "mrr-waterfall", why: "Close calls argue in movements — new, expansion, contraction, churn. Classifying period-over-period deltas into movement buckets is the LAG-waterfall shape this problem drills." },
    { slug: "growth-accounting", why: "The build board reads new minus churned with expansion in between — the accounting identity every period must satisfy. LAG-status classification is the engine behind it." },
    { slug: "week-over-week-churn", why: "The churn walk feeds the winback calendar: 7 churned periods on this db, concentrated 2 each in July and November. Weekly churn pivots are exactly this problem's shape." },
    { slug: "cohort-retention-matrix", why: "Build cohorts: workspaces that signed together, retained together? Cohort-offset pivots turn the period table into the retention matrix leadership argues over." },
    { slug: "keep-latest-dedupe", why: "Audit logs and usage syncs arrive duplicated across retries; the latest event wins. ROW_NUMBER dedupe with a tiebreak is the hygiene pass every audit export needs before it feeds a report." },
    { slug: "null-blank-audit", why: "The claim-vs-log lesson at column scale: which rows claim a state the log cannot support? Conditional SUMs over NULL and blank arms are the audit that catches them — the unbilled register's daily cousin." },
    { slug: "duplicate-charge-pairs", why: "Two settlement legs inside the same window on one statement: duplicate or split? Self-join window pairing over timestamps is how billing separates the 5 legitimate split-rail statements from double charges." },
    { slug: "customer-order-frequency", why: "Usage cadence per workspace — periods per month, workspaces going quiet. Conditional HAVING folds over billing periods are the cadence screen the platform team runs on every account plan." },
    { slug: "customers-who-bought-all-products", why: "Full plan-family coverage: which workspaces touch every SKU family they subscribe to? Relational division is the coverage-audit shape behind 'is this workspace single-threaded on one app?'." },
    { slug: "dau-wau-stickiness", why: "App stickiness — active weeks over active days — is how internal adoption is graded. Trailing-window distinct counts are exactly this shape." },
    { slug: "sessionize-events", why: "App events arrive as timestamped rows; bundling them into sessions with a gap threshold is the usage-grain read every adoption dashboard sits on." },
    { slug: "find-bursty-behavior", why: "Bursty usage spikes are the audit console's anomaly signal — variance-aware fold-then-flag is exactly how governance catches an app hammered once a quarter." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Invited users who never built anything are the onboarding gap — the visited-but-did-not-build anti-join is Retool's whitespace read." },
    { slug: "number-of-accounts-that-did-not-stream", why: "Accounts that never opened the app are the never-live cohort — a zero-activity census with the population stated, the audit console's Monday query." },
    { slug: "dormant-reactivation", why: "Workspaces that went quiet and came back drive the reactivation playbook — dormant-then-active window reads over the period table." },
    { slug: "plan-migration-paths", why: "Plan-tier migrations (starter to enterprise) are the seat-expansion story — from-to path folds over the period table are exactly this problem's shape." },
    { slug: "dynamic-pivoting-of-a-table", why: "Governance grids pivot statuses into columns — the one-pass census rendered as a matrix, the shape behind every admin console view." },
    { slug: "activity-participants", why: "Who actually touched the app versus who holds a seat — distinct-actor folds over activity rows are the license-utilization audit." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Seat counts rising period over period are the expansion signal — consecutive-increase detection is the LAG-comparison shape behind the growth board." },
    { slug: "customers-with-maximum-number-of-transactions-on-consecutive-days", why: "Consecutive-day build streaks mark the true power users — streak folding over dates is how the platform team finds them." },
    { slug: "calculate-orders-within-each-interval", why: "Usage bucketed into interval windows (first week, first month) is the time-to-value read — interval folding is the rollout pod's core shape." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The heaviest workspace by period count is the anchor logo — max-fold with a tie policy, the leaderboard read the coverage board ships." },
    { slug: "the-latest-login-in-2020", why: "Latest-activity recency per workspace is the dormancy screen — argmax with a boundary condition, the audit log's freshest-row read." },
    { slug: "viewers-turned-streamers", why: "Read-only users who started building are the conversion story — status-transition detection is exactly the builder-seat upsell shape." },
    { slug: "popularity-percentage", why: "App adoption share — an app's users over total users — is the popularity read with the denominator stated, the admin console's homepage stat." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Workspaces whose period value rises term over term are the expansion story — the strictly-increasing LAG comparison behind the pricing call." },
  ],
};
