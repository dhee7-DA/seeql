// Airtable — Wave-9 (Task 98), saas domain, 0 tagged pool rows — theme-curated;
// facts from scripts/company-facts.md (probed 2026-10-12).
// The database-for-everyone story: the storefront db read as an Airtable world —
// customers are workspace accounts (region = market), orders are base activity
// periods (delivered = active-billed workspace-month, shipped = current period
// with shipped_at as the period-open stamp, pending = trial/pending upgrade,
// cancelled = downgraded), order_items are usage line records (records created,
// automation runs, API call packs: quantity = units, unit_price = per-unit
// rate), products are plan SKUs (Free/Team/Business/Enterprise + add-ons),
// suppliers are integration/marketplace partners, invoices are billing
// statements, payments are billing rails, expenses are platform opex,
// ledger_entries are the GL — all money tables INTEGER cents. Bases ARE tables;
// the kit leans on that: base activity as the unit of work, record-level
// telemetry, automation runs, and expansion via seats + API calls.
// Pool provenance: company-pools.md carries NO Airtable section (0 tagged
// rows, none SQL-graded), so all 10 topic slug sets and all 16 problems are
// theme-curated from the pools file's theme menu — sql rows only, no w*/d*/f*
// rows — and say so. Case briefs quote probed figures from
// scripts/company-facts.md; every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.
// NOTE for the wave-9 registry wiring agent: airtable is NOT yet in registry
// COMPANY_META — wire id "airtable", domainId "saas", name "Airtable", tagline
// "The database for everyone: bases, records, automation runs", accent
// "text-amber-300" to match this header exactly.
//
// Wave-3x expansion (Task 103, APPEND-ONLY): brief 4→6, dayInLife 3→4, metrics
// 8→12, topics 10→15, theory 8→24 (t9–t24), mcqs 10→30 (mcq-11–30), cases 2→6
// (cs-airtable-3..6 on j5/t5/q2/t7 — families distinct from the kit's existing
// s7/j6 and from each other; tiers easy/medium/medium/hard), problems 16→32.
// Every entry above this note is byte-identical to the wave-9 original.
// Probe-derived cells used by the new cases (read-only probes vs db/custom.db):
// cs-airtable-3 per-statement dunning rows with workspace names (24 Emma Wilson
// 4,937.00 / 26 Liam O'Brien 3,562.00 / 27 Isabella Rossi 2,794.00 / 28 Hiro
// Tanaka 1,756.00 / 21 Chloe Dubois 1,295.00 / 18 Pedro Alvarez 873.00);
// cs-airtable-4 RANK-grouped usage census (rank 1 @ 47 units, 2 @ 46, 3 @ 38,
// 4 shared by 2 SKUs @ 36 — rank 5 is a gap under RANK, rank 6 the 33-unit SKU);
// cs-airtable-5 per-workspace mean-period-value cells (705.39 / 533.59 / 486.32
// / 444.80 / 426.22 / 421.54 / 390.62; platform mean 338.19 → 338.2 at 1 dp);
// cs-airtable-6 month-over-month step column (-122.33 … +1,158.21 into August,
// -1,326.87 into November, +721.03 into 2025-02; first month NULL). All other
// figures verbatim from scripts/company-facts.md.

import type { CompanyKit } from "../types";

export const airtableKit: CompanyKit = {
  id: "airtable",
  domainId: "saas",
  name: "Airtable",
  tagline: "The database for everyone: bases, records, automation runs",
  accent: "text-amber-300",

  brief: [
    "**Airtable** is the no-code connected-apps platform — the product that put a relational database in front of everyone and made the base the unit of work: tables, fields, views and records, stitched together by linked records and set in motion by scripts, automations and the API. Monetization rides seats and usage, so every growth number in the building is a conditional count over the same small object set. This kit maps the storefront db onto that world: the 16 customers rows are workspace accounts, the 103 orders are base activity periods worth **34,833.28**, and the 251 order_items rows are usage line records — records created, automation runs, API call packs, where quantity = units and unit_price = the per-unit rate. The status map is fixed: delivered = {emerald:active-billed} (52, 50.5%), shipped = {sky:current period} (30, 29.1%, shipped_at = the period-open stamp), pending = trial or pending upgrade (14, 13.6%), cancelled = {rose:downgraded} (7, 6.8%).",
    "The data org splits into growth, usage monetization and a small enterprise-governance pod, and all three read the same spine at different grains. Usage telemetry is the heartbeat: a period books at created_at, and `shipped_at` is stamped the day the period actually opens — **82 of 103 periods** carry the stamp, averaging **2.98 days** booking-to-open with a 2–4 day spread, and the 14 trial rows have none yet (a population definition, not a cleanup job). Money sits one layer down: 28 billing statements and 27 payment legs in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of billed value sits with workspaces whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost logo moves a quarter.",
    "Interview screens are census-then-denominator, base-flavored. A typical loop opens with a **two-grain market census** — EU runs 45 periods from just 8 workspaces (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'does a downgraded period count in your base?'*), then into the usage ladder where three SKUs sit tied at 30 units and rank semantics become a business decision. Late rounds walk the {sky:14-month period spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or pivot the fate grid with `CASE` arms that must reconcile to 103 by construction. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Airtable section — no tagged rows at all — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: activation funnels, two-grain workspace censuses, tie-heavy usage ladders, `CASE` fate pivots and the cents-safe billing spine. Do the topics in order, then run all six case studies on the live storefront db: one rebuilds the {emerald:workspace-month fate pivot} growth ops opens Monday with, the other rebuilds the {violet:linked-usage pair census} the template team runs before shipping a new base template, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting... The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
    "The finance tables are where the workspace world stops being fun and starts being owed. The 28 billing statements and 27 settlement legs sit in INTEGER cents — the dollar read is always `amount_cents / 100.0` — and the coverage census splits them **21 exact, 1 partial (4,000.00 of 6,148.00) and 6 never-collected worth 15,217.00**. The status column is a claim, not a ledger: statement #28 is marked {rose:paid} with zero settlement legs (1,756.00) while #11 is void yet carries a 925.00 leg — mirror-image errors that both land on the row-level anomaly list. The ledger referees the close: debits foot to 181,080 against 181,080, delta zero — *the close ships or the incident starts*.",
    "Deeper rounds change the stack: the screens escalate into **anti-joins** (the dunning list, the never-active census) and **window frames and staged subqueries** (ROWS versus RANGE on the running book, scalar gates, derived tables), then land on cohort reads where the denominator memo outranks the fold. Work the five new topics in order, then run the four appended cases on the live db — the {amber:dunning anti-join} billing closes with, the {violet:usage-ladder tie census} the template team ranks with, the mean-of-means pricing gate, and the board-walk step column. The bar is unchanged: *state the population and the denominator before you compute anything* — then make every census reconcile, 103 periods, 28 statements, 27 legs, by construction.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the usage telemetry refresh. A growth analyst opens the base-activity dashboard before standup: did overnight periods book, did any workspace get its `shipped_at` stamp without an owner on the upgrade, does the one-pass fate census reconcile — 52 active-billed + 30 current + 14 trial + 7 downgraded = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If period-open latency drifts off the **2.98-day** norm — the regional reads run EU 2.94, APAC 2.93, US 3.07 — the trial follow-up queue gets pulled before marketing's weekly read ships.",
    "**11:30 —** Midday is the expansion read. The monetization pod wants the usage ladder re-ranked with the three-way tie at 30 units handled honestly — shared rungs, named policy; the {amber:governance} pod wants the concentration re-cut, {rose:63.5% of billed value} from 3,000-plus workspaces; a regional VP wants periods beside workspaces (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the pipeline-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected statements worth 15,217** — before billing sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-paid statement (#11, 925.00) and a paid-status statement with zero payment legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
    "**18:00 —** The last block belongs to tomorrow's growth call. The analyst rebuilds the 14-month spine and reads the step column out loud — **+1,158.21 into August, -1,326.87 into November**, the July trough at 1,193.86 — then checks the walk's honesty: the first row is NULL because LAG has no predecessor on 2024-01, buckets are keyed by `STRFTIME('%Y-%m', created_at)`, and no BETWEEN edge ate a month-end booking. The dunning queue ships to billing with the {rose:paid-status lie} flagged on top; the ledger footing runs one last time, 181,080 against 181,080, delta zero; and the day closes the way the kit teaches it — *every census reconciled, every denominator stated, every NULL explained* — with tomorrow's ask written in one sentence no stakeholder can misread.",
  ],

  metrics: [
    { name: "Active-billed rate", what: "Delivered periods ÷ all periods booked: 52 of 103 (50.5%). The workspace-month that actually billed to term — the conditional count the growth review opens with." },
    { name: "Period-open latency", what: "Booking to period-open (created_at → shipped_at) over the 82 stamped periods only: 2.98-day average, range 2–4. Open periods have no cycle yet and must not dilute the average." },
    { name: "Trial backlog", what: "Pending periods: 14 of 103 (13.6%) with no period-open stamp yet. Trials are 'not yet', never a silent zero — they stay in every denominator the funnel reports." },
    { name: "Downgrade share", what: "Downgraded periods ÷ booked: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The churn-cohort map behind the winback calendar." },
    { name: "Billed value book", what: "Total billed across periods: 34,833.28 over 103 periods, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the plan-tiering story." },
    { name: "Usage-line depth", what: "Usage line records ÷ periods: 251 lines across 103 workspace-months. Expansion shows up here first — an automation run or API pack is a new line, not a new workspace." },
    { name: "Workspace concentration", what: "Share of billed value from workspaces spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs customer success and sizes the enterprise pod." },
    { name: "Collections coverage", what: "Billed versus collected: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. The AR anti-join the billing pod refreshes every close." },
    { name: "Close delta", what: "Ledger debits versus credits at the close: 181,080 against 181,080, delta zero. The footing the governance pod re-runs last — a nonzero delta stops the close, not the note." },
    { name: "Dunning queue composition", what: "The 6 no-leg statements worth 15,217.00 split 5 open (13,461.00) plus 1 paid-status lie (#28, 1,756.00). The split decides who chases: billing for the open cohort, governance for the status that lies." },
    { name: "Payment-leg census", what: "27 settlement legs against 28 statements: 22 statements carry legs — 17 single, 5 split — and 6 carry none. The leg distribution is the reconciliation map before any money fold." },
    { name: "Attach breadth", what: "Workload families touching workspace-months: Accessories rides in 54 of 103 periods (52.4%), Audio 46, Electronics 40. Expansion shows up as a new family line before it shows up as a new seat." },
  ],

  topics: [
    {
      name: "Trial-to-paid activation funnels",
      why: "Every Airtable growth screen opens with the funnel: period booked, trial parked, period opened (shipped_at stamped), billed to term. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a current period 'active-billed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "game-play-analysis-iv", "immediate-food-delivery-i", "consecutive-numbers", "ar-aging-schedule"],
    },
    {
      name: "Two-grain workspace censuses",
      why: "Periods and workspaces are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 workspaces while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "find-followers-count", "students-and-examinations", "customer-order-frequency"],
    },
    {
      name: "Workspaces joined to base activity",
      why: "Workspaces carry region and created_at; periods inherit them through joins, and the join type decides who survives. A period without a workspace is corruption; a workspace without periods is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employees-with-missing-information"],
    },
    {
      name: "Usage leaderboards & rank ties",
      why: "Usage-based expansion is leaderboard reporting: which plan SKUs and add-on packs carry the usage units. The ladder on this db ties constantly — 36 and 36, then 30 three times, then 21 three times — and RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung, which is a policy about peer SKUs, not syntax.",
      slugs: ["rank-scores", "top-earners", "second-highest-salary", "keep-latest-dedupe"],
    },
    {
      name: "Plan-tier banding with CASE",
      why: "Workspaces sit on Free, Team, Business and Enterprise with add-on packs riding alongside, and every tier read is CASE-classified with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store", "net-revenue-retention", "repeat-purchase-rate", "trial-balance-check", "count-salary-categories"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month period spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "running-total-for-different-genders", "mrr-waterfall", "null-blank-audit", "snapshot-delta-detect"],
    },
    {
      name: "Set algebra for segment stacks",
      why: "Board packets stack populations — current periods under downgraded, this quarter beside last — and EXCEPT answers 'which signed workspaces never opened a period'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "monthly-transactions-ii"],
    },
    {
      name: "Nested folds & usage gates",
      why: "Screens escalate into staging: fold per-workspace period counts, then judge them against a computed platform mean (6.44 here — exactly four logos clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets active-billed, current, trial and downgraded in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not collected — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the workspace world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "products-worth-over-invoices"],
    },
    {
      name: "Anti-join dunning & never-active censuses",
      why: "The AR read the close runs first is an anti-join: statements LEFT JOIN payments, keep the NULL side — 6 statements worth 15,217.00, one of them marked paid with zero legs. The same shape hunts never-active workspaces (a confident zero on this db, but proving it is the exercise) and dormant bases before a winback. The trap is filtering a status in WHERE after the LEFT JOIN and silently inner-joining the whitespace away.",
      slugs: ["find-churn-risk-customers", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "customers-who-never-order", "winback-recovery", "dormant-reactivation"],
    },
    {
      name: "Window frames & running books",
      why: "SUM(total) OVER (ORDER BY booked_at) looks like a running total until two periods tie on the order key — the default RANGE frame absorbs peers in one step and the cumulative double-jumps. Writing the frame out loud (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, or a 3-row moving average over the 14-month spine) is the difference between a book that walks and one that lurches. Frames are policy: the board reads a walk, not a jump.",
      slugs: ["last-person-to-fit-in-the-elevator", "find-cumulative-salary-of-an-employee", "account-balance", "rolling-7d-actives"],
    },
    {
      name: "Subquery shapes & empty inner queries",
      why: "Scalar, correlated and derived subqueries answer different questions at different costs, and each carries an empty-inner-query failure mode that ships silently: a scalar gate returns NULL and the comparison empties the report; a correlated gate re-runs per outer row and hides it. The staged shape — fold once in a derived table or CTE, judge it outside — is what the pricing screens actually want. Stating what the inner fold returns when it matches nothing is the unprompted follow-up.",
      slugs: ["department-highest-salary", "employees-whose-manager-left-the-company", "investments-in-2016", "deferred-revenue", "basket-depth-aov", "transaction-velocity"],
    },
    {
      name: "Cohort stickiness & retention reads",
      why: "Expansion is judged on cohorts, not totals: stickiness ratios over workspace activity, growth accounting that classifies each workspace-month as new, retained or resurrected, and retention matrices that read the fade. Every one is a conditional count over a window with the cohort month as the spine — and the denominator is the cohort size, never the platform base. The interview version is always 'which cohort, which window, stated first'.",
      slugs: ["dau-wau-stickiness", "growth-accounting", "cohort-retention-matrix", "ltv-cac-payback", "find-the-team-size", "restaurant-growth"],
    },
    {
      name: "Calendar math & clock-edge filters",
      why: "The period spine is TEXT timestamps, so date work is string surgery with sharp edges: `STRFTIME('%Y-%m', created_at)` builds the 14-bucket month key, half-open intervals (`>= '2024-01-01' AND < '2024-02-01'`) keep month-end bookings that BETWEEN drops, and weekday or seven-day-window reads need date arithmetic that survives the TEXT format. The clock edge is exactly where upgrade-driven periods land — precisely the bookings a sloppy predicate loses.",
      slugs: ["sales-by-day-of-the-week", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days", "plan-migration-paths", "fix-names-in-a-table", "group-sold-products-by-the-date"],
    },
  ],

  theory: [
    {
      id: "airtable-t1",
      q: "Your workspace report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a period column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A billed-value report joins periods to workspaces: a period with no workspace row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from workspaces: the workspaces with no base activity ARE the answer, arriving with NULL period columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload workspace row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-active workspaces, and proving that zero is itself the analyst's job: all 16 workspace accounts appear in the period table somewhere. In an Airtable world that proof matters twice — a signed workspace with zero base activity is the expansion pipeline's raw material, and losing it from the report is losing the lead list.",
      tag: "joins",
    },
    {
      id: "airtable-t2",
      q: "Three SKUs tie at 30 usage units on the expansion ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. On this db the usage ladder runs 47, 46, 38, then a two-way tie at 36, 33, 31, then the three-way tie at 30: RANK gives all three the same rank 8 and the next distinct count (28) lands on rank 11 — implying two phantom positions that do not exist. DENSE_RANK shares rungs without gaps — 8, 8, 8 and the next distinct count is 9. ROW_NUMBER splits ties arbitrarily, which silently decides whose add-on pack gets the roadmap slot. Below that, another three-way tie at 21 repeats the whole question at rank 14. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer SKUs (RANK or DENSE_RANK), or an explicitly named tie-breaker like category then id — and writing it in the query comment so the template team can reproduce the ladder.",
      tag: "windows",
    },
    {
      id: "airtable-t3",
      q: "The census shows 103 base activity periods and 16 workspaces; EU shows 45 periods and 8 workspaces. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts period rows after the join — one row per workspace-month, so a workspace with 24 periods contributes 24. COUNT(DISTINCT customer_id) folds those rows back to workspaces — EU's 45 periods collapse to 8 logos. Neither is wrong: periods measure load and usage momentum, workspaces measure installed base and coverage. The ratio — 5.6 periods per workspace in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for usage lines and COUNT(*) silently counts usage records, not periods — 251 of them. In Airtable terms that is the difference between 'workspaces active', 'bases billed' and 'records created', and a dashboard that blurs them reports three different businesses under one heading. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "airtable-t4",
      q: "shipped_at is NULL until a base period actually opens. What is your policy for the period-open latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only opened periods have a latency, so the report measures booking-to-open for the 82 of 103 periods that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. The 14 trial rows have no stamp because no cycle has started; that is a population definition, not missing data to clean. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the opened-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the opened subset; the gap between it and COUNT(*) is exactly the 14 trials plus 7 downgrades, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day period opens for cycles that have not started, and it poisons the 2.98-day norm the trial follow-up queue is staffed against.",
      tag: "nulls",
    },
    {
      id: "airtable-t5",
      q: "The growth review wants active-billed value per market for markets carrying at least ten periods. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards current, trial and downgraded rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-period floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. On this db the floor bites: EU's 45, APAC's 37 and the US's 19 periods clear it while LATAM's 2 drop out — and the report must say so, because a market vanishing from the slide reads as a data gap when it is a threshold decision. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to periods versus to billed value.",
      tag: "pipeline",
    },
    {
      id: "airtable-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 periods always produce a mean (6.4375 periods per workspace, 6.44 rounded — exactly four logos clear it, the 24/17/14/13 ladder). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each period to ITS workspace's average) re-runs per outer row and answers a different question at a different cost. And the NOT IN variant carries its own landmine: one NULL in the inner list poisons every comparison and the whole result empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "airtable-t7",
      q: "The growth trend buckets billing by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and month-end is exactly when upgrade-driven periods land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. Then read the walk like an analyst: the book opens at 3,731.97, troughs at 1,193.86 in July, jumps +1,158.21 into August and drops -1,326.87 into November — and each of those numbers is only as honest as the spine keying it.",
      tag: "dates",
    },
    {
      id: "airtable-t8",
      q: "Finance says a billing statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row.",
      tag: "quality",
    },
    {
      id: "airtable-t9",
      q: "The board packet stacks two population reports and a reviewer says a workspace row vanished. Beyond UNION's silent dedup, what does each set operator actually guarantee — and when is EXCEPT the honest anti-join?",
      a: "Set operators compare whole result sets, column by column, positionally: same column count, compatible types, and the column NAMES come from the first branch — label arms deliberately or the packet's headers lie. UNION dedups whole rows across branches, which is a deletion, not a convenience; UNION ALL keeps everything, and its correctness argument is the comment stating why duplicates are impossible. EXCEPT is the set-algebra anti-join: signed workspaces EXCEPT workspaces with base activity returns the never-active set — on this db a confident zero, and proving the zero is the exercise; NOT EXISTS is the row-by-row twin when the inner side needs its own predicates, while NOT IN over a nullable column empties the whole report on one NULL. INTERSECT answers co-presence — the pair census's cousin. And ORDER BY applies once, to the assembled stack, never per branch. In Airtable terms: the fate pivot's four arms already partition every period — an EXCEPT against the 103-row spine is how you prove no row fell through two arms, and a stack whose branch sums don't reconcile to 103 gets sent back before it reaches the deck.",
      tag: "setops",
    },
    {
      id: "airtable-t10",
      q: "Your cumulative billed-value book double-jumps whenever two periods share a booking second. Walk me through the default window frame, and when you'd write a moving frame instead.",
      a: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes PEERS: rows tied on the sort key enter the running sum in one step, so the cumulative jumps two periods at once and the board reads a bump that never happened. ROWS walks strictly row by row and is the honest default for money walks; ties then enter one at a time with an internal order you pin with a tie-breaker. The deeper move is the explicit moving frame: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW gives the 3-month smoothing the growth call reads over the 14-month spine, and EXCLUDE CURRENT ROW strips the row itself for 'peers but not me' benchmarks. Frame boundaries are policy, not syntax: UNBOUNDED PRECEDING to CURRENT ROW is a walk, 2 PRECEDING is a smoother, and the whole-partition frame is a share denominator. On the workspace book I write the frame out loud in the query comment — *the board reads a walk, not a jump* — because a default the author cannot name is a default the reviewer cannot trust.",
      tag: "frames",
    },
    {
      id: "airtable-t11",
      q: "You're asked for each workspace's cumulated automation-run usage against its plan quota. Where does PARTITION BY earn its keep, and what breaks without it?",
      a: "PARTITION BY resets the window at each workspace: SUM(quantity) OVER (PARTITION BY customer_id ORDER BY created_at) restarts the running total at every logo's first period — that is the quota-consumption read the expansion pod prices against. Drop the partition and every row inherits the platform-wide cumulative: workspace N's usage-to-date carries fourteen other logos' automation runs, and the overage forecast reads fiction. The discipline is one window, one grain: the partition key must match the grain the slide claims, exactly the way COUNT(*) versus COUNT(DISTINCT customer_id) is a grain decision. Two more habits: order inside the partition by the period-open stamp, not the row id, so the walk follows the business clock; and stage the partitioned windows in a CTE, then join plan quotas outside, so the window arithmetic stays readable and the quota join never fans the rows back out. On this db, sixteen workspaces make the mistake visible immediately — the logo with 24 periods dominates the unpartitioned book and every other workspace's line reads flat, quota-adjacent nonsense.",
      tag: "partition",
    },
    {
      id: "airtable-t12",
      q: "Growth wants churn-ahead visibility: for each period, what happened to the workspace NEXT month. LAG or LEAD — and what is your policy on the default parameter?",
      a: "LEAD reads forward: LEAD(status) OVER (PARTITION BY customer_id ORDER BY created_at) puts next month's fate beside this month's row, and the paired CASE — current delivered, next cancelled — is the downgrade follow-through cohort the winback calendar staffs against. LAG reads backward for the walk; the two are mirrors and choosing wrong just flips which end carries the NULL. My default-parameter policy is strict: LAG(revenue, 1, 0) substitutes 0 for 'no predecessor', which invents a flat zero-value month before 2024-01 and turns the first step into a fabricated 3,731.97 jump — a lie on value walks. Defaults are honest for counts (a first month with no prior legs genuinely has zero legs) and dishonest for levels. Multi-step reads — LAG(revenue, 12) for year-ago comps — are legitimate but must state their NULL window: with 14 months of spine, the year-ago column is NULL for all of 2024, and that emptiness is information. The honest walk prints its first step as NULL and labels it baseline; the moment a first step prints a real number, I check the default parameter before I believe the trend.",
      tag: "laglead",
    },
    {
      id: "airtable-t13",
      q: "The Monday review asks for the fate census per market AND a check that the arms reconcile to 103. How do you structure a query like that with CTEs, and why stage at all?",
      a: "WITH fate AS (the per-market CASE pivot), then a final SELECT that reads fate and asserts the identity: the arms' sum = COUNT(*) = 103. Staging is documentation first — each CTE is a named, testable claim — and correctness second: window outputs and folded aggregates become filterable tables, which is the only way to filter on a RANK or judge a per-workspace mean. Derived tables answer the same need inline; CTEs earn their keep when the name carries meaning ('fate', 'dunning', 'ladder') or when two later reads share one fold. The reconciliation CTE is the habit that matters here: the fate arms 52 + 30 + 14 + 7 must equal 103, the coverage arms 21 + 1 + 6 must equal 28, and if the guard query prints anything else the deck does not ship. I keep CTEs single-purpose and read them as a pipeline — census, then judge, then reconcile — because a 400-line query nobody can name a stage for is exactly where silent drift lives. In an Airtable world the base IS the documentation; the SQL should read the same way.",
      tag: "ctes",
    },
    {
      id: "airtable-t14",
      q: "WHERE can't see your SELECT alias but ORDER BY can. Walk me through the logical processing order and where that bites in a real dashboard build.",
      a: "The logical order is FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and alias visibility follows it exactly: a column named in SELECT does not exist yet when WHERE and HAVING evaluate, but ORDER BY runs after SELECT, so the alias is visible there. The bite is real: WHERE downgrade_pct > 5 errors on the very pivot that computes downgrade_pct, and the fix is either restating the expression — ROUND(100.0 * SUM(CASE …)/COUNT(*), 1) > 5 — or staging the pivot in a CTE and filtering outside, which is what I do when the expression is long enough to drift between two copies. GROUP BY works on underlying expressions, not aliases (SQLite is famously lenient and accepts aliases there; most engines refuse — I write the portable form). ORDER BY ordinals are a quick-read convenience I avoid in shipped queries: ORDER BY 2 breaks the moment a column is inserted. The habit the panel grades: when a filter references a computed name, say out loud whether that name exists at that pipeline stage — and if the answer needs a second read of the same fold, stage it rather than duplicate the expression.",
      tag: "aliases",
    },
    {
      id: "airtable-t15",
      q: "Beyond 'don't coalesce averages to zero': what are your working rules for NULLs in a shipped report — NULLIF, SUM over all-NULL groups, and NULL-safe equality?",
      a: "Four rules I actually apply. One: NULLIF guards denominators — 100.0 * SUM(x) / NULLIF(COUNT(*), 0) returns NULL instead of a divide-by-zero when a group folds empty (a market with zero downgrades in a share read), and NULL propagates into the slide as 'not applicable' rather than a crash. Two: aggregates skip NULLs but differ at the edges — COUNT(*) counts rows, COUNT(col) counts values, and SUM over an all-NULL group returns NULL, not 0, which is why 'no settlements' and 'zero settlement value' must stay distinct in the dunning read. Three: comparison policy — x = NULL is never true; IS NULL / IS NOT NULL is the only membership test, and IS NOT DISTINCT FROM is the NULL-safe equality when a join key can be NULL on both sides. Four: COALESCE is a display decision made at the outermost SELECT, never inside the arithmetic — the number and its presentation are two layers. On this db the policy ships in working form: the 14 trials' missing shipped_at stays NULL in the spine, the dunning census keeps 'no legs' as its own bucket, and the ledger's delta-zero footing is checked with IS, not with equals.",
      tag: "nullmath",
    },
    {
      id: "airtable-t16",
      q: "The settlement clock reads 28.4 days average and the terms window is 30. Show me the date arithmetic you'd use — and where TEXT timestamps help and hurt.",
      a: "Latency and aging are JULIANDAY deltas: julianday(paid_on) - julianday(issued_on) over the paid book gives the 28.4-day settlement average with a 13-to-84 spread, and julianday arithmetic is the only honest way to subtract dates — the raw TEXT subtraction would concatenate garbage. Terms are DATE arithmetic: DATE(issued_on, '+30 days') builds the due stamp this db actually stores (every statement's issue-to-due window reads exactly 30 days), and aging buckets compare julianday(reference) against julianday(due_on). Weekday reads are STRFTIME('%w', …) — 0 through 6, Sunday-first — behind the 'dunning fires Monday' claim. TEXT cuts both ways: ISO-8601 strings sort and compare lexicographically, so >= '2024-01-01' AND < '2024-02-01' is a correct, index-friendly half-open month — but any non-ISO format breaks the property, and an inclusive upper bound '2024-01-31' silently drops every timestamped row on the last night, which is exactly when upgrade-driven bookings land. On this db the period-open latency (2.98 days, range 2–4) and the settlement clock are the two numbers I can rebuild from date arithmetic in under a minute, and that is the bar.",
      tag: "datearith",
    },
    {
      id: "airtable-t17",
      q: "The finance tables store INTEGER cents. Where do units slips actually happen, and what is your fold discipline?",
      a: "The slips are unit confusion and rounding masquerade. Unit confusion: AVG(amount_cents) is a mean in CENTS — 316,395.24 cents prints as 3,163.95 only after the /100.0 fold, and this facts file itself carries a kit that shipped '≈3,164 cents' where 3,164 dollars was meant; SUM(amount_cents) / COUNT(*) is integer divided by integer and truncates before any fold ever sees the fraction. Rounding masquerade: this book's statement sums are whole multiples of cents, so a bare ROUND(amount_cents, 2) can reproduce the dollar digits by accident — 1,756.00 printed from the cents read looks right while the fold is wrong, and the bug surfaces later on an odd-cent row. My discipline: divide by 100.0 once, at the outermost fold — SUM(amount_cents) / 100.0 — promote to real BEFORE any division that needs fractions (the 100.0 goes in front, the same reflex as 1.0 in basket depth), and let ROUND(…, 2) be presentation only. In the Airtable story this is the billing spine's typing contract: INTEGER cents in the base, one explicit fold at the read layer, and every dollar figure in the deck traceable to that fold — not three conventions fighting inside one dashboard.",
      tag: "cents",
    },
    {
      id: "airtable-t18",
      q: "Nobody tunes the 16-workspace rehearsal db and then production melts. What performance instincts do you actually carry into a query review?",
      a: "Four instincts. Fold early: aggregate per workspace before joining names — a 103-row fold joined to a 16-row dimension stays 103 rows, while joining everything and folding late drags every intermediate row through the sort. Filter early: WHERE status = 'delivered' before GROUP BY shrinks the fold's input; the same predicate after a LEFT JOIN is not a filter at all, it is a join-type change. Index what you join and filter on: customer_id, invoice_id, order_id — the FKs — plus the status/date pair the dashboards slice; on this rehearsal db the planner gets away with scans, and that is precisely why the instinct must come from the review, not from EXPLAIN. And treat DISTINCT as a symptom: reaching for it usually means a fan-out nobody diagnosed — 27 legs against 28 statements means any pre-join SUM is already wrong, and DISTINCT would only hide which grain you are on. I read the plan when a shape surprises me, but the habit that transfers to Airtable-scale data is cheaper: write the query so the fold happens at the smallest correct grain, and state the grain in a comment so the next analyst does not 'optimize' it back into a fan-out.",
      tag: "performance",
    },
    {
      id: "airtable-t19",
      q: "A teammate sums invoice amounts after joining payments and gets 96,700.00 where the leg-carrying statements hold 71,760.00. Diagnose and fix.",
      a: "That is join fan-out: 27 settlement legs against 28 statements, and 5 statements settle on BOTH card and wire — so the join multiplies those 5 invoice rows, adding their 24,940.00 back in (4860 + 5284 + 4723 + 5614 + 4459). The diagnosis ritual: compare the joined row count (27) against the left table's (28) — any mismatch is a fan-out warning — then check COUNT(*) against COUNT(DISTINCT i.id) on the joined set. The fix is grain, not arithmetic: fold the many-side first (payments grouped by invoice_id: leg count and leg sum), then join that 22-row fold to invoices — 22 statements carry legs — and every invoice-side SUM stays honest. SUM(DISTINCT i.amount_cents) is NOT the fix: it dedups equal amounts, so two statements that genuinely bill the same value collapse into one. The same reflex guards the usage spine: order_items against orders multiplies by lines (251 over 103), which is exactly why basket depth is computed as a counted pair, not as a SUM after a careless join. In the Airtable world linked records fan out by design — the analyst's job is deciding which side of the link is the grain before any money fold.",
      tag: "fanout",
    },
    {
      id: "airtable-t20",
      q: "Two analysts run the same usage ladder and the board ships two different orderings. What is your contract for reproducible output?",
      a: "The contract is written, not hoped. Every query opens with a grain comment — 'one row per SKU, units = SUM(quantity)' — because 'one row per what' is the first thing a reviewer checks and the last thing an author remembers. Every ordered report carries a total tie-breaker: ORDER BY units DESC, sku — RANK already handles shared rungs as policy, but the within-tie order must be deterministic or the board reshuffles between runs and the diff review burns a day chasing a data change that never happened. Every census carries its footing identity: the fate arms sum to 103, the coverage arms to 28, the region grid to 103 — printed beside the number, not run separately. And every derived figure states its population in the alias or the slide subtitle — 'period-open latency (82 stamped periods)' — so the number survives being screenshotted away from the query. In an Airtable world this is native thinking: a base view with a hidden sort is a bug report waiting to happen, and the analysts who get hired here are the ones whose SQL reads like a view definition — sorted, named, footed, and reproducible by someone who was not in the room.",
      tag: "grain",
    },
    {
      id: "airtable-t21",
      q: "You band usage lines into plan tiers with CASE. Simple CASE or searched CASE — and what are the ordering and typing traps?",
      a: "Searched CASE — CASE WHEN unit_price < 55 THEN 'standard' WHEN unit_price >= 55 THEN 'scale' — is the only shape that handles ranges; simple CASE (CASE status WHEN 'delivered' …) matches one evaluated expression by equality and is cleaner for the fate labels. The traps are ordering and coverage. Ordering: CASE is first-match-wins, so a catch-all WHEN placed early turns later arms into dead code — the seat-band fold (268 units at a 31.01 average line price versus 230 at 115.85) collapses into one band and the tier split becomes fiction. Coverage: the ELSE is the exhaustiveness audit; I either write an ELSE that fails loudly — ELSE 'UNMAPPED:' || unit_price — or reconcile the arms' sum against the row count, because a hole in the CASE is a hole in the census. Typing: arms can return different types and SQLite will store them happily — mixed 'delivered' text and 0 numbers in one column poisons every downstream GROUP BY. And CASE works anywhere an expression fits: SELECT for labels, ORDER BY for custom fate order, and inside SUM() as the one-pass pivot that keeps the whole census to a single scan.",
      tag: "case",
    },
    {
      id: "airtable-t22",
      q: "The ops board needs active-billed, current, trial and downgraded counts side by side. Four queries, or one — and what decides it?",
      a: "One scan, four conditional aggregates: FILTER (WHERE status = 'delivered') or the portable SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), repeated per arm, all inside one GROUP BY. Four sequential queries are four WHERE clauses to drift — one gets edited, the others do not, and the board shows a fate grid that can never reconcile. The one-pass shape also makes the shared denominator explicit: the downgrade share is the conditional count divided by the same row's COUNT(*), computed in the same scan, so the population cannot silently differ between the numerator query and the denominator query. When do I NOT do this? When the arms need different grains — periods per market beside distinct workspaces per market beside distinct SKUs touched — that is where staged CTEs beat a wall of nested conditionals, because each fold is named and testable. And the derived share must still foot: 52 + 30 + 14 + 7 = 103 per platform, 45 + 37 + 19 + 2 across markets. In the Airtable world this is the base's grouped-summary view done properly: one pass over the records, every branch visible, every branch reconciling — the review trusts it because the arithmetic proves it.",
      tag: "onepass",
    },
    {
      id: "airtable-t23",
      q: "Workspace names arrive from three exports with different casing and stray whitespace, and your join splits one logo into two. What is the text-hygiene pass?",
      a: "Normalize at the read layer, never in the stored base: TRIM(name) for the invisible leading/trailing spaces that survive every eyeball check, UPPER or LOWER for case-folded comparison keys (UPPER('acme corp') = UPPER('Acme Corp') — the join that stops the split), and REPLACE for the doubled spaces that imports love. The pass is a CTE: cleaned AS (SELECT id, TRIM(UPPER(name)) AS name_key, name AS display_name FROM workspaces), then join on name_key and DISPLAY the original — the slide should show the customer's name, not the sanitized one. Substring work rides SUBSTR: SUBSTR(created_at, 1, 7) is a legitimate month key on ISO text and equivalent to STRFTIME('%Y-%m', …); choosing one convention per codebase is the point, because keys built two ways compare fine today and sort differently the moment formats drift. Pattern matching is LIKE with % and _ and an explicit decision about case sensitivity; equality is for exact keys. In the Airtable world this is the field-editing pass every base needs before a rollup: *one logo split across two rows is two customers in every downstream count* — concentration reads, dunning lists, expansion targets — and the fix costs one TRIM.",
      tag: "strings",
    },
    {
      id: "airtable-t24",
      q: "Your dashboard says 6 unpaid statements worth 15,217.00. What do you check before anyone quotes that number?",
      a: "The identities, in order. Count identity: 6 of 28 statements — the anti-join census must reconcile with the coverage split (21 exact + 1 partial + 6 none = 28) or one of the three numbers is lying. Money identity: 15,217.00 must equal the no-leg statements' cent sum folded /100.0, and the dunning split must read 5 open statements at 13,461.00 plus the one paid-status lie at 1,756.00 — a queue that foots to the aggregate but not to the split has a WHERE drift. Cross-check against the ledger: the trial balance foots 181,080 debits against 181,080 credits, delta zero, and the AR account's net (16,440.00) is a third read of the same reality — three independent derivations agreeing is what makes a number quotable. Anomaly list: #28 marked paid with no legs and #11 void with a 925.00 leg are known liars — the dashboard's definition must state that status is a claim and legs are the ledger, or the 15,217.00 quietly includes money the status column says is not owed. My rule for every shipped figure: a number without a reconciling identity is a screenshot, not a metric — literal here, because every census in this kit reconciles by construction: 103 periods, 28 statements, 27 legs, delta zero.",
      tag: "reconcile",
    },
  ],

  mcqs: [
    {
      id: "airtable-mcq-1",
      prompt: "A base activity period's status reads 'shipped'. In this kit's Airtable stage map, what happened?",
      choices: ["Current period — running, opened at shipped_at, not yet billed to term", "Active-billed — the workspace-month billed in full", "Downgraded — the workspace stepped down a plan", "Trial — awaiting first payment"],
      answer: 0,
      why: "The stage map is fixed: shipped = current period (30 of 103 periods, 29.1%), with shipped_at as the period-open stamp. It is 'running now', not 'billed to term'.",
      notes: [
        { choice: 1, why: "Active-billed is 'delivered' — 52 periods (50.5%) that billed to term. Calling current periods active-billed inflates the kept rate before a single cycle completes." },
        { choice: 3, why: "Trial is 'pending' — 14 periods with no period-open stamp yet. Trials are 'not yet', not 'running', and they stay in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "airtable-mcq-2",
      prompt: "Period-open latency averages 2.98 days. Over which population is that number computed? The db holds 82 stamped periods, 14 trials and 7 downgrades of 103 booked.",
      choices: ["All 103 booked periods", "The 82 periods carrying a shipped_at stamp", "The 52 active-billed periods only", "Distinct workspaces (82/16)"],
      answer: 1,
      why: "Only opened periods have a latency: the average runs over the 82 stamped rows — 2.98 days, range 2–4 — and the population ships with the number. Trials have no cycle to measure.",
      notes: [
        { choice: 0, why: "AVG ignores NULLs, so dividing by 103 never actually happens — the unstated version returns the same 2.98 over a silently shrunken population. The fix is saying the filter out loud." },
        { choice: 2, why: "52/82 mixes two funnel steps — active-billed is term completion, shipped_at is period-open. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "airtable-mcq-3",
      prompt: "EU carries 45 base activity periods from 8 workspaces. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to workspaces (8). The gap between them — 5.6 periods per workspace — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every period has a workspace. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not workspaces — a third grain nobody asked for. The census is periods AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "airtable-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to downgraded periods only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the downgrade share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the downgrade map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-5",
      prompt: "Keep only markets carrying at least 10 base activity periods. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY region HAVING COUNT(*) >= 10", "WHERE periods >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A period-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db EU (45), APAC (37) and the US (19) clear the bar; LATAM's 2 periods drop out — and the report should say so.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'periods' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-6",
      prompt: "The usage ladder reads 47, 46, 38, 36, 36, 33, 31, then THREE SKUs tied at 30. Under RANK, what rank does the next SKU (28 units) carry?",
      choices: ["11", "9", "8", "10"],
      answer: 0,
      why: "RANK shares rungs and then skips: the tie block consumes ranks 8, 9 and 10, so the next distinct count lands on 11. Every 30-unit SKU shows rank 8.",
      notes: [
        { choice: 1, why: "9 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 3, why: "10 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-7",
      prompt: "A whitespace report runs workspaces LEFT JOIN periods, then filters WHERE status = 'delivered' to keep it 'revenue-honest'. Signed-but-inactive workspaces vanish. Why?",
      choices: ["The workspaces genuinely have no delivered periods — the zero is correct", "Filtering a period column in WHERE after a LEFT JOIN discards the NULL-payload rows — the LEFT quietly became an INNER", "LEFT JOIN cannot carry a WHERE clause at all", "The report needs DISTINCT to preserve unmatched workspaces"],
      answer: 1,
      why: "The whitespace rows survive the LEFT JOIN with NULL period columns; status = 'delivered' is UNKNOWN against NULL, so those rows die in WHERE. Move the predicate into ON (or an outer query) and the whitespace returns — all of it, which on this db means proving the confident zero of never-active workspaces.",
      notes: [
        { choice: 0, why: "The zero CAN be correct — but this db has workspaces whose periods exist in other statuses, and the WHERE filter deletes them from consideration, not from reality." },
        { choice: 3, why: "DISTINCT dedups rows; it cannot resurrect rows the WHERE clause already discarded. Wrong tool for a predicate-placement bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-8",
      prompt: "A staging-table downgrade list uses workspace_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every period carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "airtable-mcq-9",
      prompt: "A board stack puts current periods under downgraded periods in one layout, built with UNION. A reviewer says one workspace's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same workspace, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same workspace, same counts, no market or branch label — collapse into one, and the board loses a workspace with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "airtable-mcq-10",
      prompt: "A dashboard walks billed value period by period: SUM(total) OVER (ORDER BY booked_at). Two periods share a booked_at second, and the cumulative 'jumps two periods at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on booked_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at period grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "airtable-mcq-11",
      prompt: "A QA check counts base activity periods that have actually opened. Over the 103-period table, what do COUNT(*) and COUNT(shipped_at) return?",
      choices: ["103 and 82", "82 and 82", "103 and 103", "82 and 103"],
      answer: 0,
      why: "COUNT(*) counts rows — 103 booked periods; COUNT(shipped_at) counts non-NULL values — the 82 periods carrying the period-open stamp (52 active-billed + 30 current). The 21-row gap is exactly the 14 trials plus 7 downgrades still unopened.",
      notes: [
        { choice: 2, why: "COUNT never counts a column's NULLs — 103 and 103 would mean every period opened, and the trial-backlog dashboard would silently read zero." },
        { choice: 1, why: "The 21 unopened periods still exist as rows — they sit in the funnel's denominator even though their stamp is NULL. Only the counted VALUE is filtered." },
      ],
      difficulty: "easy",
    },
    {
      id: "airtable-mcq-12",
      prompt: "The growth deck keys periods by month. What does STRFTIME('%Y-%m', created_at) return for a period booked 2024-01-15 09:30?",
      choices: ["The TEXT key '2024-01'", "The number 202401", "The full timestamp, normalized", "The TEXT key '2024-1'"],
      answer: 0,
      why: "strftime returns TEXT, zero-padded: '2024-01'. The zero-padding is what keeps the 14-bucket spine (2024-01 to 2025-02) sorting chronologically and joining to every other '%Y-%m' label.",
      notes: [
        { choice: 1, why: "A number sorts fine but is a different CELL — joins to '2024-01' text labels miss entirely, and the two conventions split one spine into two." },
        { choice: 3, why: "Without zero-padding '2024-1' collides in order with '2024-10' — lexicographically October sorts before February and the trend reads scrambled." },
      ],
      difficulty: "easy",
    },
    {
      id: "airtable-mcq-13",
      prompt: "A week-one activation read runs BETWEEN '2024-01-01' AND '2024-01-07' over TEXT timestamps. Which bookings survive?",
      choices: ["Every booking on January 7 — BETWEEN is inclusive at both ends", "Timestamped rows ON January 7 drop out — '2024-01-07 18:22' is lexically greater than the upper bound '2024-01-07', so the half-open form < '2024-01-08' is the policy", "Only the January 1 bookings survive", "TEXT dates cannot be ranged at all"],
      answer: 1,
      why: "The inclusive upper bound matches the bare string '2024-01-07' but loses '2024-01-07 18:22:00' — lexicographically longer is greater. Half-open intervals keep the last night, which is exactly when upgrade-driven periods land on this db.",
      notes: [
        { choice: 0, why: "Inclusive only helps rows stamped exactly at midnight — the 'worked in testing' bug, because test data carried midnight stamps and production does not." },
        { choice: 3, why: "ISO-8601 text ranges perfectly — lexicographic order IS chronological order. The failure is the inclusive bound, not the format." },
      ],
      difficulty: "easy",
    },
    {
      id: "airtable-mcq-14",
      prompt: "The dunning queue holds 6 no-leg statements worth 15,217.00. Billing asks how to split the chase. What does the status column actually say?",
      choices: ["All 6 read open", "5 read open (13,461.00) and 1 — #28 at 1,756.00 — reads paid with zero settlement legs", "All 6 read void", "The status column is NULL for all 6"],
      answer: 1,
      why: "The no-leg census splits 5 open statements (13,461.00) plus #28, the paid-status lie (1,756.00). Status is a claim and legs are the ledger of record — the split decides who chases: billing the opens, governance the lie.",
      notes: [
        { choice: 0, why: "'No legs' sounds like 'open', but #28 proves status and legs can disagree — folding it into the open bucket understates exactly the governance problem the anomaly list tracks." },
        { choice: 2, why: "Void is the mirror error — #11 is void WITH a 925.00 leg, so it never appears in this queue at all. The dunning list is no-leg, not by-status." },
      ],
      difficulty: "easy",
    },
    {
      id: "airtable-mcq-15",
      prompt: "The fate pivot's four branches — active-billed, current, trial, downgraded — must sum to what, and why does the growth review care?",
      choices: ["82 — the stamped periods", "103 — the four arms partition every booked period, and the sum is the pivot's footing check", "52 — the active-billed book", "Whatever the WHERE clause keeps — no fixed target"],
      answer: 1,
      why: "The four CASE arms partition all 103 periods (52 + 30 + 14 + 7). The review reads the sum as the footing check: a pivot totaling 96 means an arm ate a status, and the funnel silently shrank before anyone decided anything.",
      notes: [
        { choice: 0, why: "82 redefines the population to opened periods — the 14 trials vanish from a slide whose whole point is showing them. Different population, different name." },
        { choice: 2, why: "52 is one arm, not the population — a pivot that foots to its largest branch has lost the other three arms in a WHERE, not in arithmetic." },
      ],
      difficulty: "easy",
    },
    {
      id: "airtable-mcq-16",
      prompt: "Two plan SKUs tie at 36 usage units on a ladder you ORDER BY units DESC. What does the board print across reruns without a tie-breaker?",
      choices: ["A stable alphabetical order — SQLite guarantees it", "No guarantee: the order among tied rows is unspecified, so the board can reshuffle between runs", "An error until you add a tie-breaker", "Both SKUs collapse into one row"],
      answer: 1,
      why: "SQL does not define tie order; SQLite usually returns scan order but is free not to. Ladders ship with an explicit tie-breaker — units DESC, sku — so the template team reproduces the board byte for byte.",
      notes: [
        { choice: 0, why: "'Usually scan order' is not a contract — a plan flip or index addition reshuffles the ties, and the diff review chases a phantom data change." },
        { choice: 2, why: "No error — the silence is the bug. Undeterministic boards look like moving data, which is worse than a visible failure." },
      ],
      difficulty: "easy",
    },
    {
      id: "airtable-mcq-17",
      prompt: "A billing statement reads 'paid' but you must prove it. Which artifact settles the argument?",
      choices: ["The status column on the invoice row", "The settlement legs in payments — 27 legs against 28 statements, 22 statements carrying legs", "The ledger memo text", "The invoice number's prefix"],
      answer: 1,
      why: "Status is a claim; the legs table is the ledger of record. #28 reads paid with zero legs and #11 is void with one — mirror-image lies only the legs table exposes.",
      notes: [
        { choice: 0, why: "That is the claim under test — verifying it against itself is exactly how the 1,756.00 lie survived a close." },
        { choice: 2, why: "Memos are prose, not money. The ledger is where legs land, but the per-statement truth lives in payments." },
      ],
      difficulty: "easy",
    },
    {
      id: "airtable-mcq-18",
      prompt: "The board-walk adds LAG(revenue, 1, 0) so the first month shows a step instead of NULL. What did the analyst actually build?",
      choices: ["A cleaner walk — stakeholders read 0 steps better than NULLs", "A lie: the 0 default invents a flat zero-value month before 2024-01, so the first step prints a fabricated 3,731.97 jump instead of the NULL baseline", "A rounding fix for the first row", "A faster query — fewer NULL checks"],
      answer: 1,
      why: "LAG's third argument substitutes 0 for 'no predecessor' — but 'no prior month' is not 'prior month worth 0'. The first step must print NULL (baseline) or be excluded, never a fabricated 3,731.97 jump.",
      notes: [
        { choice: 0, why: "It does look cleaner — and downstream month-one growth math divides by the fabricated 0 and reads infinite. The lie compounds two slides later." },
        { choice: 2, why: "Nothing to round — the default parameter changes the metric's population, not its precision." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-19",
      prompt: "Signed workspaces that never opened a base period: which two shapes return the same set, and which one is the NULL landmine?",
      choices: ["LEFT JOIN … IS NULL and NOT EXISTS — both NULL-safe; NOT IN is the one that empties on a single NULL", "IN and EXISTS — they answer the same absence question", "UNION and INTERSECT — set algebra is the anti-join", "CROSS JOIN and LEFT JOIN — both keep every left row"],
      answer: 0,
      why: "Both anti-join shapes answer 'rows on one side with no match on the other' and both survive NULLs; NOT IN over a nullable subquery goes UNKNOWN on the first NULL and silently empties. On the clean core db the never-active census is a confident zero — the shape still matters on staging tables.",
      notes: [
        { choice: 1, why: "IN answers presence, not absence — the pair returns different sets here, not the same one." },
        { choice: 2, why: "Set operators compare whole result sets; the anti-join is a per-row existence test. Different questions, different shapes." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-20",
      prompt: "A dashboard gates rows on WHERE total > (SELECT AVG(total) FROM orders) — the platform mean is 338.19. How often does that inner SELECT run, and how does that differ from a correlated gate?",
      choices: ["Once — an uncorrelated scalar fold computes one value reused for every row; a correlated subquery re-runs per outer row", "Once per market group", "Never — the optimizer inlines averages before execution", "Once per join branch"],
      answer: 0,
      why: "An uncorrelated scalar subquery executes once and its value is reused for every comparison; the correlated shape (compare each period to ITS workspace's mean) re-executes per outer row and answers a different question at a different cost. Saying which one you wrote is part of the answer.",
      notes: [
        { choice: 1, why: "'Per group' is the correlated intuition — the uncorrelated contract is one population, one mean, 338.19 for everyone." },
        { choice: 2, why: "Planners may cache, but the contract you defend in review is the semantics, not the plan. 'Inlined' is not a spec." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-21",
      prompt: "Per-workspace running usage: SUM(quantity) OVER (ORDER BY created_at) versus the same with PARTITION BY customer_id — what changes?",
      choices: ["Nothing — the partition is decorative when the ORDER BY matches", "The partition resets the running sum at each workspace, so the walk is per-logo; without it every workspace inherits the platform-wide cumulative", "It reverses the walk's direction", "It dedups repeat periods"],
      answer: 1,
      why: "PARTITION BY slices the window: each workspace's cumulative restarts at its first period — the quota-consumption read the expansion pod prices. Without the partition, workspace N's row carries every earlier workspace's usage too.",
      notes: [
        { choice: 0, why: "The partition changes the arithmetic, not the shape — without it the 24-period logo dominates every other row's 'usage to date'." },
        { choice: 2, why: "Sequencing is the OVER clause's job; PARTITION BY never touches order, only grouping." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-22",
      prompt: "Tier bands: WHEN unit_price < 55 THEN 'standard' … WHEN unit_price >= 55 THEN 'scale'. A teammate reorders the WHENs so the catch-all comes first. What breaks?",
      choices: ["Nothing — CASE arms are order-independent", "CASE is first-match-wins: the catch-all swallows every row, the >= 55 arm becomes dead code, and the 230-unit scale band at 115.85 reads zero", "Only the query plan changes", "The bands round differently"],
      answer: 1,
      why: "CASE evaluates arms in order and stops at the first true WHEN. A catch-all placed early makes later arms dead code — the seat-band fold (268 units at 31.01 standard versus 230 at 115.85 scale) collapses into one band and the tier split becomes fiction.",
      notes: [
        { choice: 0, why: "Order is semantics for CASE — reordering the arms re-bands the entire base without changing a row." },
        { choice: 3, why: "Precision is downstream; the damage is classification, and no ROUND repairs a mis-band." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-23",
      prompt: "SUM(i.amount_cents) after invoices JOIN payments prints 96,700.00 where the leg-carrying statements hold 71,760.00. What happened?",
      choices: ["Cents were double-folded by the /100.0", "Five split-rail statements (paid on both card and wire) fan the join to two rows each, adding their 24,940.00 back — fold the legs per statement first, then join", "The status filter dropped the open statements", "Rounding drift on odd-cent rows"],
      answer: 1,
      why: "One-to-many joins multiply the left side: 27 legs against 28 statements, 5 statements with BOTH rails. The joined fold counts those 5 invoice amounts twice (+24,940.00). Fix the grain — aggregate payments per invoice_id — not the arithmetic.",
      notes: [
        { choice: 0, why: "The cents fold is fine; the GRAIN broke — any invoice-side SUM after a one-to-many join is suspect before a single digit rounds." },
        { choice: 3, why: "Drift is pennies; this is 24,940.00 of structural fan-out. Rounding never explains a 35% inflation." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-24",
      prompt: "Multi-month workspaces: active in at least two DISTINCT months of the 14-month spine. Where does the gate live?",
      choices: ["WHERE COUNT(DISTINCT month) >= 2, before grouping", "GROUP BY customer_id HAVING COUNT(DISTINCT STRFTIME('%Y-%m', created_at)) >= 2", "SELECT DISTINCT customer_id, then LIMIT 2", "HAVING month >= 2 on the raw rows"],
      answer: 1,
      why: "The month count only exists after folding rows per workspace — HAVING over a GROUP BY, with the month derived inside the aggregate (or staged in a CTE). This gate feeds the multi-month retention cohort the CS pod staffs against.",
      notes: [
        { choice: 0, why: "Aggregates do not exist at WHERE time — the engine rejects it before any fold forms. Same lesson as every period-count floor." },
        { choice: 2, why: "DISTINCT collapses duplicate rows but cannot apply a per-workspace threshold — and LIMIT truncates the wrong dimension entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-25",
      prompt: "The daily digest folds a workspace's record types into one cell with GROUP_CONCAT. A reviewer reports the type order jitters between runs. The fix?",
      choices: ["Wrap the column in DISTINCT", "GROUP_CONCAT's order is undefined — sort the rows in a subquery/CTE (or use the ordered-aggregate form on SQLite 3.44+) before folding", "CAST the result to TEXT", "Set the collation to NOCASE"],
      answer: 1,
      why: "Concatenation order follows row visit order, which the planner may vary between runs. Deterministic digests sort the rows first — the digest's value is its stability, not just its content.",
      notes: [
        { choice: 0, why: "DISTINCT dedups values — it neither orders them nor explains the jitter." },
        { choice: 3, why: "Collation changes deliberate sort order; the jitter comes from undefined visit order, not locale." },
      ],
      difficulty: "medium",
    },
    {
      id: "airtable-mcq-26",
      prompt: "Basket depth is 251 usage lines across 103 workspace-months — 2.44 lines per period. A teammate writes COUNT(*) / COUNT(DISTINCT order_id) over order_items and reports depth 2. Diagnosis?",
      choices: ["COUNT(DISTINCT order_id) is the wrong fold", "Both operands are INTEGER, so 251/103 truncates to 2 — promote with * 1.0 (or 100.0 in share math) before the division", "The lines table is missing rows", "Depth should be AVG(quantity) instead"],
      answer: 1,
      why: "Integer divided by integer truncates toward zero: the true 2.44 collapses to 2, and expansion-driven depth gains (2.30 to 2.44 scale) read flat. The 1.0 promotion is the same reflex as the 100.0 in share math.",
      notes: [
        { choice: 3, why: "AVG(quantity) is units per LINE — 498 units over 251 lines is about 1.98 — a different metric, not a fix." },
        { choice: 0, why: "The fold to periods is the whole point; the arithmetic TYPE is the bug." },
      ],
      difficulty: "hard",
    },
    {
      id: "airtable-mcq-27",
      prompt: "A staging import leaves some status values NULL. The tiering CASE writes WHEN status <> 'cancelled' THEN 'live' ELSE 'gone'. Where do the NULL rows land?",
      choices: ["'live' — NULL is not 'cancelled'", "'gone' — NULL <> 'cancelled' is UNKNOWN, the WHEN is not-true, and the row falls to ELSE", "The query errors on the NULL rows", "The rows land in both buckets"],
      answer: 1,
      why: "NULL comparisons are UNKNOWN and CASE treats UNKNOWN as not-true — so 'not cancelled' silently swallows NULL statuses into ELSE. Every row still lands somewhere (the census reconciles) but the labels lie. Policy: a WHEN status IS NULL arm first, or a stated import contract.",
      notes: [
        { choice: 0, why: "Reads right in prose, wrong in three-valued logic — the most expensive sentence in NULL handling." },
        { choice: 2, why: "No error — NULL flows through comparisons silently, which is exactly why the mislabeled rows survive QA." },
      ],
      difficulty: "hard",
    },
    {
      id: "airtable-mcq-28",
      prompt: "A peer benchmark wants each period's billed value against the average of the OTHER periods booked the same day — excluding itself. Which window does that?",
      choices: ["AVG(total) OVER (ORDER BY created_at)", "AVG(total) OVER (PARTITION BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING EXCLUDE CURRENT ROW)", "AVG(total) OVER ()", "AVG(total) OVER (ORDER BY total RANGE BETWEEN 1 PRECEDING AND 1 FOLLOWING)"],
      answer: 1,
      why: "The partition pins the peer group to the booking day, the unbounded frame spans the whole group, and EXCLUDE CURRENT ROW drops the row itself — the selfless average. Plain OVER () averages the platform; ORDER BY versions drift into running math.",
      notes: [
        { choice: 0, why: "That is a running average over the whole table, ordered by time — no peer group, no self-exclusion." },
        { choice: 3, why: "RANGE offsets walk VALUES, not rows — it mixes adjacent totals and still includes the row itself. Two wrongs, one clause." },
      ],
      difficulty: "hard",
    },
    {
      id: "airtable-mcq-29",
      prompt: "Record revisions pile up per record id; the report needs only each record's latest version. Which shape keeps exactly one full row per id?",
      choices: ["SELECT DISTINCT record_id, *", "ROW_NUMBER() OVER (PARTITION BY record_id ORDER BY revised_at DESC) AS rn in a CTE, then WHERE rn = 1 outside the window", "WHERE revised_at = (SELECT MAX(revised_at) FROM revisions)", "ORDER BY revised_at DESC LIMIT 1"],
      answer: 1,
      why: "The window tags each row with its recency rank inside its id group; filtering rn = 1 OUTSIDE the window (WHERE cannot see window results) keeps one complete row per id with every column intact. The staged shape is also the readable one.",
      notes: [
        { choice: 0, why: "DISTINCT collapses only whole-row duplicates — revisions differ, so nothing dedups and the fan-out survives." },
        { choice: 2, why: "One GLOBAL max stamp — only the last-touched record survives, not one per id. The report silently loses every other record." },
        { choice: 3, why: "LIMIT 1 truncates the whole table to a single row." },
      ],
      difficulty: "hard",
    },
    {
      id: "airtable-mcq-30",
      prompt: "WHERE usage_rank <= 6 — usage_rank comes from RANK() OVER (…) in the same SELECT. What happens?",
      choices: ["It works as written", "Window results don't exist at WHERE time — the query errors; stage the rank in a CTE or derived table, then filter outside", "It silently returns every row", "It returns only rank 1"],
      answer: 1,
      why: "The logical pipeline evaluates WHERE before SELECT, so window outputs do not exist at filter time — the engine rejects the unknown column. Staging the rank in a CTE is the standard fix, and it documents the two-stage build: fold and rank, then judge.",
      notes: [
        { choice: 0, why: "'Worked once' means the rank was a real column — SQLite never evaluates window expressions in WHERE." },
        { choice: 2, why: "Unknown columns raise errors; silent empty sets come from NULL comparisons, not missing columns." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-airtable-1",
      tier: "easy",
      topic: "s7",
      universe: "funnel",
      title: "The workspace-month fate pivot",
      brief:
        "Airtable-flavored brief on the storefront db: Monday's growth review opens with the workspace-month fate pivot — every base activity period lands in exactly one fate (active-billed to term, still in its current period, parked in trial, or downgraded a plan) — and the review reads the pivot per market with the downgrade share beside it, population stated on the slide. Probed facts: 103 periods worth 34,833.28; the market grid reads EU 45 = 24 active-billed + 12 current + 6 trial + 3 downgraded, APAC 37 = 21/8/5/3, US 19 = 5/10/3/1, LATAM 2 = 2/0/0/0; downgrade share reads EU 6.7%, APAC 8.1%, US 5.3%, LATAM 0. The review reads biggest period count first.",
      ask: "Return each market with its period count, the four fate branches and the downgrade share to 1 decimal, biggest period count first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS periods,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS active_billed,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS current_period,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS trials,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS downgrades,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), {4}) AS downgrade_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY periods {5};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the active-billed fate",
          why: "Active-billed workspace-months are status 'delivered' — 52 of 103 (50.5%). 'shipped' would print the 30 current periods into the active column and the census overstates the billed book before the review opens.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the trial fate",
          why: "Trials are status 'pending' — 14 periods with no period-open stamp yet, all still in the denominator. 'delivered' would read the 24/21/5/2 active arm into the trial column and invent a trial surge exactly where billing succeeded.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the downgrade fate",
          why: "Downgrades are status 'cancelled' — 7 total, concentrated APAC 3 / EU 3 / US 1. The share column folds the same literal, so a wrong chip here breaks both the downgrade arm and the 6.7/8.1/5.3 shares the review quotes.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "Downgrade share reports to 1 decimal — EU 6.7, APAC 8.1 — and the US's single downgrade (1 of 19) anchors the digit in the cells. ROUND(…, 2) prints 6.67 and the slide stops reconciling with the 6.7 the review quotes.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads biggest period count on top: EU 45, APAC 37, US 19, LATAM 2. ASC would open the meeting on LATAM's 2 periods — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'shipped'", "'void'", "0", "ASC", "2"],
      walkthrough:
        "One join, one fold, five columns at two grains. The join attaches every period to its workspace's market, GROUP BY folds 103 periods into four market rows, and the four CASE arms split each market's fate grid: EU 45 = 24 active-billed + 12 current + 6 trial + 3 downgraded, APAC 37 = 21/8/5/3, US 19 = 5/10/3/1, LATAM 2 = 2/0/0/0 — reconciling to the platform census 52 + 30 + 14 + 7 = 103 by construction. The share column runs 100.0 BEFORE the division so the downgrade share survives as real arithmetic: EU 6.7, APAC 8.1, US 5.3, LATAM 0 — and the US's single downgrade (1 of 19) is the cell that anchors the 1-decimal digit. The distractors fail honestly: 'shipped' fills the active arm with the 30 current periods; 'void' matches no status and zeroes the arm; 0 as a status literal never matches a TEXT status and zeroes the arms, while 0 as the precision truncates the shares to 7/8/5/0; ASC opens the review on LATAM; and 2 in the precision slot prints 6.67 where the deck quotes 6.7. The pivot is the read: LATAM bills both of its periods and never downgrades, while APAC carries the highest downgrade share at 8.1 — one query, two business claims.",
      },
    {
      id: "cs-airtable-2",
      tier: "medium",
      topic: "j6",
      universe: "catalog",
      title: "The linked-usage pair census",
      brief:
        "Airtable-flavored brief on the storefront db: linked records are Airtable's product DNA, and the usage-data twin is the pair census — which workload families ride together inside the same base activity period. Probed facts: the usage spine carries 251 line records across 103 workspace-months; the family fan-out reads Accessories touched in 54 periods, Audio 46, Electronics 40, Video 30, Wearables 23, Apparel 22, Fitness 13. The template team wants the recurring pairings — families sharing at least 5 workspace-months — ranked biggest first, so one-off collisions do not drive base-template decisions.",
      ask: "Return each workload-family pair with its count of shared workspace-months, keeping pairs that share at least 5, biggest count first.",
      template:
        "SELECT p1.category AS family_a,\n       p2.category AS family_b,\n       COUNT({1} a.order_id) AS shared_periods\nFROM order_items a\nJOIN order_items b\n  ON b.order_id = a.order_id\n AND a.product_id {2} b.product_id\nJOIN products p1 ON p1.id = a.product_id\nJOIN products p2 ON p2.id = {3}\nGROUP BY p1.category, p2.category\nHAVING COUNT(DISTINCT a.order_id) >= {4}\nORDER BY shared_periods {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the period deduplicator",
          why: "COUNT(DISTINCT a.order_id) folds pair-rows back to workspace-months: a period carrying three co-usage lines reads 1, not 3. Bare COUNT counts pair-rows and inflates every cell by its line depth — a different census wearing the same column name.",
        },
        {
          answer: "<",
          kind: "keyword",
          label: "the pair canonicalizer",
          why: "a.product_id < b.product_id keeps every pair to one orientation, so Audio-before-Accessories is never also counted as Accessories-before-Audio. '>' mirrors the whole census, '=' collapses it to same-SKU pairs, and '<>' re-admits same-SKU line pairs the census deliberately excludes.",
        },
        {
          answer: "b.product_id",
          kind: "keyword",
          label: "the second family's join key",
          why: "p2 must join to b's product for family_b to be the co-rider. 'a.product_id' joins both sides to the same product so every pair becomes a family paired with itself; 'p1.id' clones p1 into p2 and the off-diagonal rows collapse into diagonals.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the recurring-pair floor",
          why: "Pairs sharing at least 5 workspace-months make the template cut — and the floor is visible in the result: three pairs ride exactly at 5 (Accessories×Fitness, Video×Wearables, Wearables×Apparel). Floor 6 trims the board to 14 pairs and drops those three ties.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-pair-first direction",
          why: "The template team reads strongest pairings on top: Audio×Accessories 25 leads, then the 17/17 tie. ASC would open on the 5-cell floor ties — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", ">", "=", "p1.id", "ASC"],
      walkthrough:
        "The self-join is the linked-records move: order_items aliased twice over the same period, ON b.order_id = a.order_id AND a.product_id < b.product_id, so each co-usage pair appears once in a canonical orientation. COUNT(DISTINCT a.order_id) counts workspace-months, not pair-rows, and the census reads: Audio rides with Accessories in 25 of the 103 workspace-months — a cell re-derived independently by intersecting the two period sets, 25 both ways — then Electronics×Accessories 17 and Electronics×Audio 17 tied at rank 2, Video×Accessories 13, and the diagonals are real: Accessories×Accessories 8 means two different Accessories SKUs attached in the same month, while Fitness's single SKU makes a Fitness diagonal impossible. The HAVING floor >= 5 keeps 17 of the 27 raw pairs, anchored by the three 5-cell ties. The distractors fail honestly: SUM and MAX inside COUNT are aggregate-in-aggregate errors; '>' mirrors every pair; '=' keeps only same-SKU pairings; 'p1.id' clones family_a into family_b and collapses the off-diagonal rows; ASC flips the board onto its floor ties. Read as product: the Accessories gravity (54 periods touched, 25 shared with Audio alone) is where base templates bolt on add-ons.",
      },
    {
      id: "cs-airtable-3",
      tier: "easy",
      topic: "j5",
      universe: "month-close",
      title: "The dunning list the close refuses to ship without",
      brief:
        "Billing-close memo, Airtable flavor: before a single dunning reminder goes out, the AR pod rebuilds the no-leg census — every billing statement with ZERO settlement legs, no matter what its status column claims. Probed facts: 28 statements, 27 payment legs, 22 statements carrying legs; the anti-join returns 6 no-leg statements worth 15,217.00 — 5 open (13,461.00) plus the paid-status lie #28 at 1,756.00. The rows, biggest first: #24 Emma Wilson 4,937.00, #26 Liam O'Brien 3,562.00, #27 Isabella Rossi 2,794.00, #28 Hiro Tanaka 1,756.00, #21 Chloe Dubois 1,295.00, #18 Pedro Alvarez 873.00. Status is a claim; the legs table is the ledger of record.",
      ask: "Return every no-leg statement with its id, workspace name, status claim and dollar amount, biggest amount first — the list billing chases.",
      template:
        "SELECT i.id AS statement_id,\n       c.name AS workspace,\n       i.status AS status_claim,\n       ROUND(i.amount_cents / 100.0, 2) AS amount_due\nFROM invoices i\nJOIN customers c ON c.id = {1}\nLEFT JOIN payments p ON p.invoice_id = {2}\nWHERE p.id {3}\nORDER BY {4} {5};",
      slots: [
        {
          answer: "i.customer_id",
          kind: "keyword",
          label: "the workspace join key",
          why: "Customers carries the workspace names; the join key is the statement's customer_id. 'c.name' compares an INTEGER id to a name and empties the report — the names never arrive.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the settlement-leg key",
          why: "Legs reference statements by invoice_id, so the leg join runs p.invoice_id = i.id. 'p.id' tautologies each leg against itself — self-consistent rows match and the census empties.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the no-leg guard",
          why: "The anti-join keeps statements where no leg matched: p.id IS NULL. Writing '= NULL' is never true — the UNKNOWN shortcut that deletes the whole queue in one comparison.",
        },
        {
          answer: "amount_due",
          kind: "keyword",
          label: "the exposure sort key",
          why: "The chase reads biggest exposure first, so the sort key is the folded dollar column. 'c.name' sorts by workspace and opens the chase on Pedro Alvarez's 873.00 — correct query, wrong end of the list.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "Billing chases the 4,937.00 first: DESC puts #24 Emma Wilson on top. ASC opens on the 873.00 tail — the list still ships, the priorities invert.",
        },
      ],
      distractors: ["c.name", "ASC", "p.id", "'open'"],
      walkthrough:
        "The anti-join is the whole query: statements joined to customers for the workspace name, LEFT JOIN to payments on the leg's statement key, then the IS NULL guard keeps only statements where no leg ever matched — 6 rows worth 15,217.00. The cents fold runs once, amount_cents / 100.0, so #24 prints 4,937.00 and the queue foots to the 5-open (13,461.00) plus 1-liar (1,756.00) split the close quotes. Sorted biggest-first, #28 sits fourth with 'paid' beside it — the governance hand-off. The distractors fail honestly: c.name in the workspace join compares an INTEGER id to a name and empties the report; in the leg key it returns all 28 statements; ASC opens the chase on the 873.00 tail; p.id in the statement key re-tautologies the join against itself and the census empties to zero rows; 'open' as the sort key errors, and as the direction it is a bare literal after an expression — also an error. Read as product: 6 statements, 15,217.00 of exposure, one of them lying about being paid — the exact list the close refuses to ship without.",
      },
    {
      id: "cs-airtable-4",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The usage-ladder tie census",
      brief:
        "Template-team memo, Airtable flavor: before a new base template ships, the team ranks plan SKUs and add-on packs by usage units — records created, automation runs and API call packs folded as quantity. Probed facts: 251 usage lines carry 498 units; the ladder reads 47, 46, 38, 36, 36, 33 at the top with Desk Mat Extended leading; below, the tie structure is 36x2, 30x3, 21x3. RANK semantics are the published policy — shared rungs, gaps after ties — so the two 36-unit SKUs share rank 4, rank 5 is a gap, and the 33-unit pack lands on rank 6. The board prints the top six rungs.",
      ask: "Return each SKU inside the top six RANK rungs with its usage units and rank, biggest units first.",
      template:
        "WITH ranked AS (\n  SELECT p.name AS sku,\n         SUM({1}) AS units,\n         {2}() OVER (ORDER BY SUM(oi.quantity) {3}) AS usage_rank\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.id\n)\nSELECT sku, units, usage_rank\nFROM ranked\nWHERE usage_rank <= {4}\nORDER BY usage_rank, units DESC, sku;",
      slots: [
        {
          answer: "oi.quantity",
          kind: "keyword",
          label: "the usage counter",
          why: "Usage units are the lines' quantity — 251 lines carry 498 units. SUM(oi.unit_price) folds dollars instead of units and the ladder reorders by revenue, a different census wearing the same column.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rung policy",
          why: "The published ladder policy is RANK: shared rungs, gaps after ties. DENSE_RANK deletes the rank-5 gap and ROW_NUMBER splits the 36-tie — each a different board than the one the template team published.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-ladder direction",
          why: "Ranks run biggest usage first: 47 at rank 1. ASC inverts the ladder and the <= 6 cap then keeps the six SMALLEST SKUs — the board's mirror image.",
        },
        {
          answer: "6",
          kind: "number",
          label: "the top-rungs cap",
          why: "The board prints the top six rungs — ranks 1, 2, 3, 4, 4, 6, rank-5 gap visible. Cap 5 drops the 33-unit Running Socks row the team quotes in the review.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "oi.unit_price", "5"],
      walkthrough:
        "The fold happens first: order_items grouped per product, units = SUM(quantity), which is how 251 lines become 498 units. The window then ranks the fold — RANK() OVER (ORDER BY SUM(oi.quantity) DESC) — and the CTE stages it so the rank can be filtered outside the window where it actually exists. The census reads: Desk Mat Extended 47 at rank 1, Noise-Canceling Headset 46, HDMI 2.1 Cable 2m 38, then the two 36-unit SKUs — Laptop Stand Aluminum and Wireless Mouse M3 — sharing rank 4, rank 5 a gap under RANK, Running Socks 3-pack on rank 6 at 33; the cap keeps exactly these six rows. Distractors fail honestly: DENSE_RANK deletes the gap (the 33 lands on rank 5) and ROW_NUMBER splits the tie (Mouse 4, Laptop Stand 5) — different boards either way; ASC inverts the ladder so the cap keeps the six smallest SKUs; oi.unit_price folds dollars instead of units; 5 in the cap drops the rank-6 row the team quotes. Read as product: the shared rank-4 rung is the template decision — two SKUs at identical usage get one roadmap slot, a named policy rather than syntax.",
      },
    {
      id: "cs-airtable-5",
      tier: "medium",
      topic: "q2",
      universe: "pricing",
      title: "The mean-of-means pricing gate",
      brief:
        "Pricing-gate memo, Airtable flavor: before repricing any plan pack, the review checks which workspaces' average period value clears the platform mean. Probed facts: the platform mean is 338.19 per period over all 103 periods worth 34,833.28; exactly 7 workspaces clear it — Liam O'Brien 705.39, Chloe Dubois 533.59, Farid Nasser 486.32, Olivia Brown 444.80, Bruno Silva 426.22, Pedro Alvarez 421.54, Emma Wilson 390.62. Definition matters: each workspace's mean runs over ITS OWN periods, judged against one once-computed platform mean — the platform mean of all periods is NOT the mean of the workspace means.",
      ask: "Return each workspace whose mean period value beats the platform-wide mean, with its market, period count and mean to 2 decimals, biggest mean first.",
      template:
        "SELECT c.name AS workspace,\n       c.region AS market,\n       COUNT(*) AS periods,\n       ROUND(AVG(o.total), {1}) AS mean_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id\nHAVING AVG(o.total) {2} (SELECT {3}(total) FROM {4})\nORDER BY mean_value {5};",
      slots: [
        {
          answer: "2",
          kind: "keyword",
          label: "the mean precision",
          why: "The deck quotes 705.39 and 533.59 at 2 decimals. One decimal prints 705.4 and the cells stop reconciling with every figure the pricing review quotes.",
        },
        {
          answer: ">",
          kind: "keyword",
          label: "the clears-the-line operator",
          why: "The gate is strictly ABOVE the platform mean. '=' demands a workspace sitting exactly at 338.19 — none does — and the gate returns nothing while looking valid.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the platform-mean fold",
          why: "The line is the MEAN of all 103 periods. SUM in the inner fold returns the whole 34,833.28 book, nothing clears it, and the gate silently empties.",
        },
        {
          answer: "orders",
          kind: "keyword",
          label: "the platform-fold table",
          why: "The platform mean folds the periods table. FROM customers has no total column — the scalar errors before the gate even runs.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-mean-first direction",
          why: "The review reads the largest means first: Liam O'Brien's 705.39 on top. ASC opens on Emma Wilson's 390.62 — the gate's mirror image.",
        },
      ],
      distractors: ["1", "SUM", "customers", "=", "ASC"],
      walkthrough:
        "Two grains, one statement. The GROUP BY folds 103 periods into per-workspace means; the scalar subquery — (SELECT AVG(total) FROM orders) — computes the platform mean once, 338.19, and every HAVING comparison reuses it. The gate keeps 7 of 16 workspaces: 705.39, 533.59, 486.32, 444.80, 426.22, 421.54, 390.62 — and note Alice Chen is NOT on it: 24 periods at a 302.60 mean is the concentration story, not the pricing-gate story. Distractors fail honestly: a 1-decimal mean prints 705.4 and the cells stop matching the deck; SUM in the inner fold returns the whole book and nothing clears it; FROM customers has no total column and errors; '=' demands a workspace exactly at the mean and returns nothing; ASC inverts the read so the gate opens on 390.62. Read as product: 7 logos price-check above the line, and the mean-of-means distinction is what keeps the gate honest — averaging the 7 means would draw the line at 486.93 and wave three more workspaces through.",
      },
    {
      id: "cs-airtable-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The board-walk step column",
      brief:
        "Growth-call memo, Airtable flavor: the board reads the 14-month billed-value spine — 2024-01 through 2025-02, every status included, footing to 34,833.28 — with a step column beside it. Probed facts: the walk opens at 3,731.97 (step NULL — no predecessor), steps -122.33 into February, troughs at 1,193.86 in July, jumps +1,158.21 into August, drops -1,326.87 into November, and closes +721.03 into 2025-02 at 2,390.53. The first row's step is NULL by definition — the baseline, never a zero.",
      ask: "Return the 14-month spine with billed revenue, the prior month beside it and the 2-decimal step, oldest first, first step NULL.",
      template:
        "WITH months AS (\n  SELECT STRFTIME({1}, created_at) AS month,\n         ROUND(SUM(total), {2}) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       revenue,\n       LAG({3}) OVER (ORDER BY month) AS prior_month,\n       ROUND(revenue - LAG(revenue) OVER (ORDER BY month), 2) AS step\nFROM months\nORDER BY month {4};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month spine key",
          why: "'%Y-%m' keys 14 zero-padded month buckets. '%Y' merges the spine to 2 year-buckets and the walk dies; unquoted %Y-%m is a modulo syntax error before the spine builds.",
        },
        {
          answer: "2",
          kind: "keyword",
          label: "the revenue precision",
          why: "The spine quotes cents-safe dollars — 3,731.97, 1,193.86. Zero decimals print 3,732 and every step loses the .33 and .21 digits the deck quotes.",
        },
        {
          answer: "revenue",
          kind: "keyword",
          label: "the LAG payload",
          why: "prior_month must carry the prior month's REVENUE. LAG(month) prints the prior month's key instead — a calendar column wearing a money column's name.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the oldest-first walk",
          why: "The walk runs 2024-01 forward so the baseline NULL lands on the first row. DESC walks backwards and the NULL baseline lands on 2025-02 — the call reads the year inverted.",
        },
      ],
      distractors: ["'%Y'", "%Y-%m", "'%d'", "0", "DESC", "month"],
      walkthrough:
        "Stage, then walk. The CTE builds the spine — STRFTIME('%Y-%m', created_at) keys 14 buckets, ROUND(SUM(total), 2) folds each month to cents-safe dollars footing to 34,833.28 — and the outer SELECT carries LAG(revenue) OVER (ORDER BY month) as prior_month and the step as revenue minus that LAG, rounded to 2. The read: 3,731.97 to 3,609.64 (-122.33), the July trough 1,193.86, the August jump +1,158.21, the November drop -1,326.87, the 2025-02 close +721.03 at 2,390.53 — and 2024-01's step prints NULL, the honest baseline. Distractors fail honestly: '%Y' merges the spine to 2 year-buckets; the unquoted %Y-%m is a syntax error; 0 in the precision prints 3,732 and the cents vanish; DESC walks the board backwards so the baseline NULL lands on 2025-02; month in the LAG payload makes prior_month a calendar key instead of a revenue figure; '%d' explodes the spine to ~31 day-buckets. Read as product: the step column IS the growth call — August's +1,158.21 gets the applause slide, November's -1,326.87 gets the winback memo, and neither number survives a walk keyed on anything but the month spine.",
      },
    ],

  problems: [
    { slug: "immediate-food-delivery-i", why: "Periods opening within the promised window versus late ones — the onboarding-SLA read is a conditional rate over a timestamp comparison, exactly the shape Airtable's trial follow-up queue runs." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of workspaces that created their first record within N days of signup out of all signed — a distinct-count share with the denominator stated, the activation funnel's weekly pulse." },
    { slug: "customers-who-never-order", why: "Workspaces with zero base activity: the anti-join is whitespace hunting — and on a clean db the honest answer is a confident zero, which proving is itself the exercise." },
    { slug: "feature-adoption-windows", why: "Automation (Rules) adoption is measured in windows — did the workspace run an automated rule within N days of rollout? Conditional counts over adoption windows are the governance pod's core read." },
    { slug: "plan-migration-paths", why: "Free → Team → Business → Enterprise moves, upgrades and downgrades alike. LAG over a workspace's period history is exactly how the plan-migration report is built here." },
    { slug: "net-revenue-retention", why: "Seat adds plus usage packs roll up to NRR — the metric Airtable's board actually manages. Cohort billed-value walks with LAG are this problem's shape." },
    { slug: "mrr-waterfall", why: "Billed-value movements — new, expansion, downgrade — decompose the book month by month. A CASE-classified movement fold over the 14-month spine is the monetization pod's standing deliverable." },
    { slug: "deferred-revenue", why: "Annual plans bill upfront and earn down monthly — the statement book (28 statements, INTEGER cents) is where deferred balances live. Cents-safe folds are non-negotiable here." },
    { slug: "ltv-cac-payback", why: "Payback on acquisition spend per workspace: lifetime billed value against acquisition cost, cohort by cohort. Ratio discipline with honest denominators is the whole exercise." },
    { slug: "winback-recovery", why: "Downgraded workspaces that come back — the winback cohort is the cancelled-status read followed over time. Same anti-join-plus-window shape the CS pod ships weekly." },
    { slug: "fix-names-in-a-table", why: "Workspace name hygiene before any join: exports arrive title-case-broken, and 'acme corp' versus 'Acme Corp' silently splits one workspace into two." },
    { slug: "consecutive-numbers", why: "Consecutive billed months — streak logic over the period spine flags the never-missed cohort that expansion offers target first." },
    { slug: "repeat-purchase-rate", why: "Renewal repeat: workspaces carrying 2+ periods in a window out of all active. The 16-workspace base makes every repeat read a conditional distinct count." },
    { slug: "basket-depth-aov", why: "Usage lines per period beside average billed value — 251 lines across 103 periods is the depth story that separates seats-driven growth from usage-driven growth." },
    { slug: "trial-balance-check", why: "The close ritual: ledger debits must read 181,080 against 181,080, delta zero. A conditional-sum footing drill is exactly how the governance pod proves it." },
    { slug: "keep-latest-dedupe", why: "Record revisions pile up — keeping the latest version per record id is Airtable's revision history as a SQL drill, and a fan-out bug here double-counts billed value." },
    { slug: "rolling-7d-actives", why: "Weekly active workspaces is a rolling-window count — the stickiness panel reads actives per trailing 7 days, and a hard Monday cutoff makes the number fiction. Trailing-window conditional counts are the drill." },
    { slug: "game-play-analysis-iii", why: "Usage accumulation per workspace: a running SUM over each workspace's activity periods is how the expansion pod reads cumulated automation runs against plan quotas without losing the row grain." },
    { slug: "find-the-team-size", why: "Seats per workspace beside every workspace row — COUNT(*) OVER (PARTITION BY ...) prices the next invoice while keeping the workspace-month grain the funnel reports." },
    { slug: "point-in-time-asof", why: "Rate cards and plan prices move; invoices must bill at the price in force when the period opened. The as-of join (latest rate at or before the period-open stamp) is the billing pod's recurring build." },
    { slug: "count-salary-categories", why: "Zero-count arms must still print: a fate census that drops the empty arm hides the market where downgrades never happened. UNION ALL with literal arm labels keeps every branch on the board." },
    { slug: "group-sold-products-by-the-date", why: "Record-type rollups per day as one comma-joined cell — the template team's daily digest of which record kinds moved, GROUP_CONCAT with the order stated in the query." },
    { slug: "list-the-products-ordered-in-a-period", why: "A date-filtered usage census — which add-on packs moved in the window — is the weekly monetization pulse, and the month predicate is exactly where BETWEEN loses the last night's bookings." },
    { slug: "customer-order-frequency", why: "Workspaces active in at least two distinct months of the spine — a HAVING gate over a two-grain fold that feeds the multi-month retention cohort the CS pod staffs against." },
    { slug: "duplicate-charge-pairs", why: "Automation runs billed twice show up as same-workspace same-amount leg pairs. Self-join pair detection with a canonical orientation is the audit finance runs on payment legs before the close." },
    { slug: "ar-aging-schedule", why: "The dunning queue ages: 15,217.00 of no-leg exposure bucketed by days outstanding. CASE aging bands over the settlement clock are the AR deck's second page." },
    { slug: "null-blank-audit", why: "Record hygiene before any join — NULL versus blank versus 'none' in text fields splits workspaces and breaks every census. The audit query is this kit's data-quality stance in miniature." },
    { slug: "transaction-velocity", why: "API-call packs burst: velocity bursts over per-month line counts flag the workspace whose usage pattern just changed tier. Burst detection is a window-fold read, not a threshold guess." },
    { slug: "dormant-reactivation", why: "Signed workspaces whose activity went quiet — NOT EXISTS over recent periods finds the dormant set the winback pod targets, without a single NOT IN on a nullable key." },
    { slug: "snapshot-delta-detect", why: "Month-close reads the book twice and asks what moved: FULL OUTER JOIN between period snapshots surfaces new, gone and changed rows — the close's delta page, built in one statement." },
    { slug: "game-play-analysis-v", why: "First-activity-day cohorting — signup month beside day-N activity counts — is the activation funnel's cohort spine and a window-plus-fold build." },
    { slug: "restaurant-growth", why: "A 7-day rolling average over daily billed value smooths the spike days the raw walk overreacts to — the smoothing read behind every trend slide in the growth call." },
  ],
};
