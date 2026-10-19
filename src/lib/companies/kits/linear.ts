// Linear — Wave-10 (Task 100), saas domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Issue-tracking SQL on an engineering-throughput angle (distinct from asana's project-management framing):
// the storefront db read as a seat-and-billing sandbox for Linear workspaces — customers are workspace
// accounts (region = market bucket), orders are subscription/billing periods (delivered = active seats
// billed 52, shipped = expansion in flight with shipped_at as the seat-change stamp 30, pending = trial
// awaiting conversion 14, cancelled = churned 7), order_items are seat/usage line records (quantity =
// seats on the line, unit_price = per-seat rate), products = plan SKUs (free/standard/business/enterprise;
// db category codes = SKU families), suppliers = integration/marketplace partners, invoices = subscription
// billing statements, payments = payment rails (card = self-serve, wire = invoiced/enterprise), expenses =
// platform opex, ledger_entries = GL. Finance tables store INTEGER cents — dollar read = amount_cents/100.0;
// orders.total and order_items.unit_price are REAL dollars. The throughput read maps created_at -> shipped_at
// onto the cycle clock (82 of 103 periods stamped, 2.98-day average, 2-4 spread) and the seat-band fold
// (unit_price < 55: 268 seats @ 31.01; >= 55: 230 seats @ 115.85) onto starter-vs-growth seat mix.
// Pool provenance: company-pools.md carries NO Linear section (0 tagged rows) — all 10 topic slug sets and
// all 16 problems are theme-curated from the theme menu's sql rows (no w*/d*/f* rows) and say so in brief P4.
// Case briefs quote probed figures from scripts/company-facts.md (including the wave-8+9 canonicalized
// probe-derived cells); every case slot is mechanically verified against db/custom.db by scripts/case-audit.ts.
// NOTE for the wave-10 registry wiring agent: linear is NOT yet in registry COMPANY_META — wire id "linear",
// domainId "saas", name "Linear", tagline "Issue tracking at cycle speed: triage, velocity, seats",
// accent "text-violet-400" to match this header exactly.

import type { CompanyKit } from "../types";

export const linearKit: CompanyKit = {
  id: "linear",
  domainId: "saas",
  name: "Linear",
  tagline: "Issue tracking at cycle speed: triage, velocity, seats",
  accent: "text-violet-400",

  brief: [
    "**Linear** is the issue tracker software teams live in — every bug, feature and project rides through triage, cycles and a roadmap that ships or slips by the week, and the product's whole promise is that speed compounds. Monetization is per seat across free, standard, business and enterprise plans, so every growth number in the building is a conditional count over the same small set of objects. This kit maps the storefront db onto that world: the 16 customers rows are workspace accounts, the 103 orders are **subscription billing periods** worth 34,833.28, and the 251 order_items rows are seat/usage lines — quantity = seats, unit_price = per-seat rate. The status map is fixed: delivered = {emerald:active and billed} (52, 50.5%), shipped = {sky:expansion in flight} (30, 29.1%), pending = trial awaiting conversion (14, 13.6%), cancelled = {rose:churned} (7, 6.8%).",
    "The data org splits into product analytics, growth and a small finance pod, and they read the same period spine at different grains. The throughput heartbeat is the cycle clock: a billing period opens at created_at and shipped_at stamps the day the workspace's seat count actually changes — **82 of 103 periods** carry the stamp, averaging **2.98 days** open-to-change with a 2–4 day spread, and the 14 trials have none yet (a population definition, not a cleanup job). Seat mix is the second story: **268 seats** ride sub-55 starter rates (31.01 average) against **230 on growth rates** (115.85) — the expansion engine in one CASE fold. Money sits one layer down: invoices and payments in INTEGER cents, where the dollar read is `amount_cents / 100.0`.",
    "Interview screens are census-then-denominator with an engineering-throughput accent. A typical loop opens with a **two-grain workspace census** — EU runs 45 periods from just 8 workspaces (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'do trials count in your cycle-time base?'*), then into the throughput ladder where four workspaces sit tied at 4 periods and rank semantics become a policy call about peer accounts. Late rounds walk the {sky:14-month period spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or band seats into starter/growth arms with CASE and probe the arm that silently swallows rows. Candidates who state the stamp filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Linear section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: cycle-time clocks, two-grain censuses, triage funnels, tie-heavy throughput ladders, CASE seat bands and the cents-safe billing spine. Do the topics in order, then run the six case studies on the live storefront db in spaced passes rather than one sitting: the opening pair rebuilds the {violet:cycle-time clock} the Monday insights review opens with and the {emerald:statement coverage census} finance reads at every close, and the later four add the seat-band census, the one-pass fate census, the payment-rail census and the above-the-mean expansion bench. The bar to clear: *state the stamp filter and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the cycle-clock refresh. A product-analytics analyst opens the insights dashboard before standup: did overnight seat-change stamps land, does any expansion run without an owner on the workspace, does the one-pass fate census reconcile — 52 active-billed + 30 in-flight + 14 trials + 7 churned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If the **2.98-day** cycle average drifts — the US already runs 3.07 against APAC's 2.93 — the trial-conversion queue gets pulled before the velocity report ships.",
    "**11:30 —** Midday is the expansion read. Growth wants the throughput ladder with the four-way tie at 4 periods handled honestly — shared rungs, named policy; the monetization pod wants the seat-band re-cut, **268 starter seats at 31.01** against 230 growth seats at 115.85; a regional VP wants periods per workspace beside workspace counts (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the population spelled out so the number survives the pipeline-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected statements worth 15,217** — before billing sends a single dunning email; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) against net-30 terms and a 28.4-day average settlement; and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero payment legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Cycle time", what: "Period open to seat-change (created_at → shipped_at) over stamped periods only: 82 of 103, 2.98-day average, range 2–4. The engineering-throughput read the insights review opens with — the population definition ships with the number, because the 14 trials have no cycle yet." },
    { name: "Cycle clock by market", what: "Stamped periods and average cycle days per region: EU 36 at 2.94, APAC 29 at 2.93, US 15 at 3.07, LATAM 2 at 3.5. The drift map that decides where the expansion queue gets pulled before the velocity report ships." },
    { name: "Period fate census", what: "52 active-and-billed, 30 expansion-in-flight, 14 trials awaiting conversion, 7 churned — 103 by construction. Every stage is a conditional count over a status or timestamp, and the denominator question ('do trials count?') is the whole interview." },
    { name: "Seat-band mix", what: "268 seats on sub-55 starter rates (31.01 average line price) against 230 seats on growth rates (115.85). The expansion engine in one CASE fold — and the first chart the monetization pod re-cuts each week." },
    { name: "Seat lines per period", what: "251 seat/usage lines across 103 billing periods (2.44 lines per period, max 3 seats on a line). Expansion shows up here first — seats added mid-period are new line records, not new periods." },
    { name: "Churn share by market", what: "Cancelled share of booked periods: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The churn cohort map that drives the winback and dunning calendars — sliced by the same region rollup every other metric uses." },
    { name: "Book concentration", what: "Total booked value 34,833.28 across 103 periods, average 338.19 against a 25.47 to 1,088.44 spread; 63.5% of the book sits with workspaces spending 3,000-plus lifetime (71.2% above 2,000). One lost logo moves a quarter." },
    { name: "Collections coverage", what: "Billed versus settled: 21 exact settlements (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 never-collected worth 15,217.00 — against net-30 terms and a 28.4-day average settlement, fastest 13, slowest 84. The AR anti-join finance refreshes every close." },
  ],

  topics: [
    {
      name: "Cycle-time clocks",
      why: "Every Linear analytics screen opens with the clock: period opened at created_at, seat-change stamped at shipped_at, delta averaged over stamped rows only. Each stage is a conditional count or average over a timestamp, and the interviewer's first question is what the denominator holds — 82 stamped of 103 booked, with the 14 trials excluded by definition. julianday arithmetic with a stated population is the shape being graded.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days", "median-time-to-convert", "sessionize-events", "calculate-orders-within-each-interval", "classes-more-than-5-students"],
    },
    {
      name: "Two-grain workspace censuses",
      why: "Periods and workspaces are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 workspaces while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which column is load and which is coverage — is the habit being graded. The ratio (5.6 versus 9.5) is the intensity read that decides whether growth is broadening or concentrating.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Triage funnels & stage rates",
      why: "The fate census is Linear's heartbeat: active-billed, expansion-in-flight, trial, churned — each a conditional count over a status or timestamp. The trap is calling an in-flight period 'active' — 30 versus 52 on this db — and the second trap is the denominator: trials stay in a conversion base and drop out of a cycle-time base, and the panel wants you to say which before writing SQL.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "percentage-of-users-attended-a-contest", "dau-wau-stickiness", "same-day-sale", "immediate-food-delivery-ii", "confirmation-rate"],
    },
    {
      name: "Throughput leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four workspaces sit at 4 periods each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer workspaces, not syntax. Linear's own insights boards publish the policy; candidates are asked to defend it.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "find-loyal-customers", "product-sales-analysis-ii", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Seat bands with CASE",
      why: "Seat tiers are CASE-classified — the seat-band fold splits 251 lines into 268 sub-55 starter seats and 230 growth seats, and plan SKUs band into free/standard/business/enterprise the same way. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the expansion story, and a reordered WHEN quietly re-bands the base.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "count-salary-categories", "rfm-segmentation", "usage-tier-percentiles", "spend-histogram", "net-revenue-retention"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month period spine (2024-01 to 2025-02) is the velocity call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. Churned periods concentrate in July and November, 2 each of 7, and the walk is how that pattern gets defended.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "year-on-year-growth-rate", "rolling-7d-actives", "find-bursty-behavior", "cohort-repeat-revenue", "combine-two-tables", "find-churn-risk-customers", "mrr-waterfall", "growth-accounting"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — expansion-in-flight under churned, this quarter beside last — and EXCEPT answers 'which billed workspaces never stamped a seat change'. UNION dedups whole rows silently, which makes it a correctness question, not a style one. The billing anti-join (6 never-collected statements) is the same algebra pointed at money.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order", "winback-recovery", "customers-who-bought-a-and-b-not-c", "sales-analysis-i"],
    },
    {
      name: "Nested throughput gates",
      why: "Screens escalate into staging: fold per-workspace period counts, then judge them against a computed platform mean (6.44 here — exactly four logos clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted. Linear's expansion targeting is exactly this: which workspaces run above the platform's cadence.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments", "the-number-of-users-that-are-eligible-for-discount"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board gets active-billed, in-flight, trial and churned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The reconciliation identity (branches sum to COUNT(*)) is the correctness argument the panel listens for.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "queries-quality-and-percentage", "capital-gain-loss", "find-users-with-high-token-usage"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not settled — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the workspace world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away. The rails matter too: card legs (16, 37,364.00) self-serve, wire legs (11, 32,248.00) enterprise-invoiced.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "user-purchase-platform"],
    },
  ],

  theory: [
    {
      id: "linear-t1",
      q: "Your throughput report joins workspaces to billing periods. When do you INNER and when do you LEFT — and what silently breaks if you filter a period column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A velocity report joins periods to workspaces: a period with no workspace row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from workspaces: the workspaces with no periods ARE the answer, arriving with NULL period columns. The classic break: filtering status = 'shipped' in WHERE after the LEFT JOIN kills every NULL-payload workspace row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-billing workspaces — all 16 workspaces appear in the period table somewhere — and proving that zero is itself the analyst's job, because a confident zero you did not verify is how whitespace reports die in review.",
      tag: "joins",
    },
    {
      id: "linear-t2",
      q: "The throughput ladder runs 24, 17, 14, 13, 5 periods, then FOUR workspaces tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the tie block consumes ranks 6 through 9 and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose workspace gets the success pod's attention first. There is a second layer Linear candidates get asked: the same tie problem shows up inside a running seat walk — SUM OVER (ORDER BY created_at) uses a default RANGE frame, so rows tied on the same timestamp enter the cumulative together. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer workspaces, or an explicitly named tie-breaker like created_at then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "linear-t3",
      q: "The census shows 103 billing periods and 16 workspaces; EU shows 45 periods and 8 workspaces. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts period rows after the join — one row per billing period, so a workspace with 24 periods contributes 24. COUNT(DISTINCT customer_id) folds those rows back to workspaces — EU's 45 periods collapse to 8 logos. Neither is wrong: periods measure load and cadence, workspaces measure installed base and coverage. The ratio — 5.6 periods per workspace in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating, and the platform mean (6.44, with exactly four logos above it) is the gate expansion targeting actually uses. The trap that catches candidates is a third grain: join order_items for seat lines and COUNT(*) silently counts seat lines, not periods — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades, and it is the same habit Linear's own dashboards encode.",
      tag: "aggregation",
    },
    {
      id: "linear-t4",
      q: "shipped_at is NULL until a workspace's seat count changes. What is your policy for the cycle-time report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped periods have a cycle, so the report measures open-to-change for the 82 of 103 periods that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 trials plus 7 churned rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day seat changes for trials that have not converted, and it poisons the 2.98 baseline every regional drift alert keys off. A report whose WHERE clause is doing definitional work without saying so is exactly what a Linear reviewer hunts for; the strong candidate states the 82-row population before the panel asks.",
      tag: "nulls",
    },
    {
      id: "linear-t5",
      q: "The growth review wants booked value per region for regions carrying at least ten periods. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, trial and churned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-period floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to periods versus to dollars. One more placement rule Linear screens love: the percentage — 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — puts the 100.0 BEFORE the division, because SUM of 0/1 flags over COUNT is integer division and the churn share truncates toward zero; on this db it is the difference between 6.8 and a displayed 0. The strong answer places every filter by asking: is this a fact about one period, or about a region?",
      tag: "pipeline",
    },
    {
      id: "linear-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 periods always produce a mean (6.4375 periods per workspace, 6.44 rounded — exactly four logos clear it). On filtered staging tables — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each period to ITS workspace's average) re-runs per outer row and answers a different question at a different cost, and it inherits the same empty-inner behavior when a workspace's staging slice is empty. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole report empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "linear-t7",
      q: "The velocity trend buckets periods by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the velocity trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's periods, and cycle-end is exactly when seat changes land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the story the deltas tell is concrete: the book opens at 3,731.97, troughs at 1,193.86 in July, then jumps +1,158.21 into August before the steepest drop, -1,326.87, lands in November. Date discipline is velocity discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "linear-t8",
      q: "Finance says a billing statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a payment leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage census must read 21 exact (65,612.00 both sides — void-but-settled #11 folds in by construction, paid-status #28 folds out), 1 partial (4,000.00 of 6,148.00), 6 none. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Close culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "linear-t9",
      q: "A two-period moving window and a rank column both run OVER (ORDER BY …). Why does one need ROWS spelled out and the other not — and what silently changes with the wrong frame?",
      a: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes peers: rows tied on the ORDER BY key enter the cumulative together. On a period-grain walk — SUM(total) OVER (ORDER BY created_at) — two periods stamped in the same second jump the running total by two at once, which the velocity board cannot explain. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW forces a strict row-by-row walk; a bounded frame (ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) is a moving window that clips at the partition edge, printing just the first row's total where the bound falls off. Rank functions take no frames — their tie behavior is fixed by the function choice. Say the frame out loud whenever the output is a walk, and know whether the metric wants peers in (RANGE) or not (ROWS).",
      tag: "windows",
    },
    {
      id: "linear-t10",
      q: "The board stacks expanding workspaces beside churned ones, and another page needs 'billed but never churned'. When do you reach for UNION, UNION ALL, INTERSECT and EXCEPT — and which one silently deletes rows?",
      a: "All four require branches with the same column shape. UNION merges and DEDUPS whole rows — the silent row-deleter: two byte-identical rows (same workspace, same counts, no branch label) collapse into one and the board loses a workspace with no error anywhere. UNION ALL keeps everything and is the default where a comment states why duplicates are impossible. INTERSECT keeps rows present in both branches — workspaces that both expanded and churned. EXCEPT is the subtraction: left-set rows absent from the right set — 'billed in the year but never churned', a membership question no JOIN or HAVING answers as cleanly. Pick the operator by the set semantics the page claims, then defend the dedup decision in a comment, because the reviewer's first question is what the operator may have deleted.",
      tag: "sets",
    },
    {
      id: "linear-t11",
      q: "A velocity chart folds periods per month, and a month where nothing booked simply does not appear. How do you make the spine complete — and why does the answer change the denominator story?",
      a: "GROUP BY only materializes buckets that exist: a month with zero rows never forms a group, so the row vanishes and the chart misaligns with the true 14-month spine. The fix is a driver — a VALUES list or calendar spine LEFT JOINed to the facts — so unmatched months arrive with NULL payloads that COALESCE to zero, and the missing month reappears reading 0 honestly. The denominator point: 'average monthly bookings' over observed months versus over the full spine are different numbers, and the missing-bucket version overstates velocity. Zero-fill is not cosmetic — it is the difference between 'no periods' and 'no row', and a dashboard that cannot tell those apart pages the wrong incident.",
      tag: "groupby",
    },
    {
      id: "linear-t12",
      q: "Compare every period to the platform mean, to its market's mean, and to its workspace's mean — three 'above average' questions. Which query shape belongs to each?",
      a: "The platform mean is a scalar subquery folding once — WHERE total > (SELECT AVG(total) FROM orders) — cheap, failing empty only if the table is empty (NULL, empty result, silently). The market mean is a GROUP BY fold judged at group grain, or at period grain the window twin AVG(total) OVER (PARTITION BY region) — one pass, no re-execution. The workspace mean is either correlated — (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id), re-run per outer row — or the same window with PARTITION BY customer_id, which is how the insights board prefers it here and would matter at scale. The semantics differ too: 752.96 is large on the platform mean, maybe routine for a logo averaging more. State which population defines 'average' before choosing the shape — that sentence IS the interview answer.",
      tag: "subqueries",
    },
    {
      id: "linear-t13",
      q: "You must list every pair of a workspace's periods that changed seats on the same day, without double-counting. Walk me through the self-join shape and why the naive equality is wrong.",
      a: "The naive ON a.customer_id = b.customer_id pairs every period with every period of that workspace — both directions plus the self-pair diagonal — so a workspace with three periods yields nine rows and every pair appears twice. The pair-once discipline adds a strict inequality on a stable key: ON a.customer_id = b.customer_id AND a.id < b.id, keeping exactly one orientation of each pair and dropping the diagonal. The same grammar pairs the workspaces whose periods share a seat-change stamp without double-counting the cohort. Then say what survives: a workspace with one period produces no pairs — correct, not a bug. Self-joins look innocent and inflate quietly; the inequality is the correctness argument, and the reviewer wants to hear 'pair once, on a stable key, with the empty-case behavior named'.",
      tag: "joins",
    },
    {
      id: "linear-t14",
      q: "The whitespace screen must list workspaces with no billing periods this quarter. NOT IN, NOT EXISTS or LEFT JOIN … IS NULL — and what does each do when the inner list carries a NULL?",
      a: "All three express the anti-join; they differ in failure modes. NOT IN (SELECT customer_id …) materializes the list and compares every outer row against it — one NULL makes every comparison UNKNOWN and the screen silently empties. NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND quarter-predicate) is NULL-safe by construction — a per-row existence question that stops at the first match. LEFT JOIN … IS NULL is this kit's canonical shape (the never-collected statement queue is built exactly so) and lets you carry columns from the probe side. On the clean core db all three agree — the whitespace anti-join returns a confident zero because all 16 workspaces appear somewhere. The rule: never NOT IN over an unguarded column; prefer NOT EXISTS or the LEFT JOIN shape and say why.",
      tag: "subqueries",
    },
    {
      id: "linear-t15",
      q: "The cycle clock averages julianday(shipped_at) - julianday(created_at) over 82 of 103 periods. Walk me through every decision in that expression.",
      a: "Four decisions. The function: julianday() converts TEXT ISO timestamps to fractional day numbers so the delta is a real number of days — DATE() returns a string that coerces to a year integer in arithmetic and the clock explodes. The population: only the 82 stamped periods have a cycle, so WHERE shipped_at IS NOT NULL is definitional — the 14 trials plus 7 churned have none, and AVG ignoring NULLs means dropping the WHERE still prints 2.98 over an unnamed population. The spread: 2.98 with a 2-to-4 range is quoted with its range, and the regional cut (EU 2.94, APAC 2.93, US 3.07, LATAM 3.5) is how drift gets localized. The edge: julianday(NULL) is NULL so unstamped rows drop out of the arithmetic automatically — but COUNT(shipped_at) versus COUNT(*) is how the report proves 82 of 103 rather than asserting it. Every figure ships with its population or it is a rumor.",
      tag: "dates",
    },
    {
      id: "linear-t16",
      q: "Workspace names arrive from SSO, a CSV import and an old migration — 'acme inc', 'ACME INC', 'Acme Inc '. Why is string hygiene a join-integrity problem and not cosmetics?",
      a: "Because the join key IS the name wherever no stable id survives the import: 'acme inc' and 'Acme Inc ' are different strings, so one workspace silently splits into two accounts — the market census reads 9 EU logos instead of 8, seat counts and NRR cohorts shift, and every expansion target double-counts. The hygiene pass is mechanical and ordered: TRIM the whitespace, normalize case, collapse internal double spaces, canonicalize suffixes — fix-names-in-a-table is the drill shape. Then the discipline: standardize ONCE in a staging layer, not ad hoc in every dashboard, and prefer joining on the stable id — name hygiene is the fallback, not the architecture. A product-led SaaS lives on imports and SSO syncs; the analyst who says 'the trailing space moved a logo' is the one the panel remembers.",
      tag: "strings",
    },
    {
      id: "linear-t17",
      q: "The review wants the 16-workspace book cut into quartiles by period count. NTILE, or band on the value — and what happens to the four-way tie at 4?",
      a: "NTILE(4) divides ROWS: 16 workspaces over 4 tiles is four tidy tiles of 4 by count — but NTILE has no tie semantics, so the four workspaces tied at 4 periods can straddle two tiles depending on row order, splitting one cadence tier across quartiles by arithmetic accident. If the business tier is the value (a 'top quarter by cadence' tier where peers move together), band on the value instead: CASE WHEN periods >= 10 THEN 'tier 1' …, or a DENSE_RANK cut that gives tied workspaces the same rung. If tiles must exist AND reproduce, NTILE with a fully deterministic OVER (ORDER BY periods DESC, value DESC, c.id) pins the split and documents it. The honest answer names the trade: NTILE guarantees bucket sizes, value banding guarantees peer coherence — pick which guarantee the board needs and write the choice into the query comment.",
      tag: "windows",
    },
    {
      id: "linear-t18",
      q: "The fate census reads active, expanding, trial and churned in one scan and must reconcile to 103. Show me the one-pass shapes and the identity that proves them.",
      a: "Two spellings, one scan. FILTER: COUNT(*) FILTER (WHERE status = 'delivered') AS active — the readable SQL-standard form. The portable twin: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) — the ELSE 0 arm is mandatory or a branch with no matching rows prints NULL instead of 0, and NULL reads as 'unknown' on a board. The identity is the proof: 52 + 30 + 14 + 7 = 103 by construction, because every period lands in exactly one branch — a total that fails 103 means a row fell between arms (a status typo, a NULL status) and pages the pipeline review as an incident. The trap the panel adds: COUNT(status = 'pending') is not a conditional count — the comparison yields 0 or 1 for every row and COUNT counts them all, reading 103. Say the identity out loud; it is the correctness argument, not a lucky checksum.",
      tag: "aggregation",
    },
    {
      id: "linear-t19",
      q: "The velocity board's top read is 'the busiest workspace' — but the ladder has a four-way tie at 4 periods. How do you write an argmax that survives ties?",
      a: "The fold first: per-workspace period counts from a GROUP BY customer_id. The naive argmax — ORDER BY periods DESC LIMIT 1 — returns ONE arbitrary row from the tie block, so the 'busiest at 4' is whichever row the engine felt like; a rerun can name a different logo. The honest shapes: fetch all tied rows (WHERE periods = (SELECT MAX(periods) FROM fold) — the argmax set), or pick a policy tie-breaker (lifetime value DESC, then workspace id) and write it into the query comment so the pick is reproducible rather than lucky. Above the tie the ladder is strict — 24, 17, 14, 13, 5, one workspace each — so the tie policy only governs the 4-block and below. The principle: an argmax with ties is a set, not a row; whoever turns it into a row owes the board a stated rule.",
      tag: "windows",
    },
    {
      id: "linear-t20",
      q: "A month-bucket filter runs WHERE SUBSTR(created_at, 1, 7) = '2024-07' and EXPLAIN shows a full scan despite an index on created_at. Explain sargability and the rewrite.",
      a: "An index is a sorted structure on the COLUMN's values; it can only serve a predicate expressible as a range over those raw values. Wrap the column in a function — SUBSTR, STRFTIME, CAST — and the predicate becomes a computation per row: the index is blind and every row is read. That is 'non-sargable'. The rewrite compares the raw column to constants: created_at >= '2024-07-01' AND created_at < '2024-08-01' — the index range-scans straight to July, and the half-open form is incidentally the shape that never drops cycle-end rows, which BETWEEN gets wrong. On 103 rows the cost is invisible, which is exactly why the habit must be built here: the same pattern on a billion-event events table is the difference between a dashboard and an outage. EXPLAIN QUERY PLAN is how you prove the rewrite, and reading it is part of the review ritual.",
      tag: "indexes",
    },
    {
      id: "linear-t21",
      q: "The insights board must regenerate byte-identically every run. What makes an ORDER BY reproducible — and what are the sanctioned tie-breaks?",
      a: "ORDER BY is only deterministic if the key set is a total order — unique over the rows. Sort on periods DESC and tied rows can print in any order: the four workspaces at 4 periods would shuffle between runs, and a reviewer diffing yesterday's board against today's sees phantom churn. The discipline: every sort ends in a stable unique tie-break, ideally the surrogate key — periods DESC, value DESC, c.id — and the OVER(ORDER BY …) of every window column obeys the same rule, because windows are order-sensitive too. Never RANDOM(), never 'whatever the engine does'; names and timestamps can collide, ids cannot. And LIMIT without ORDER BY is not a top-N, it is a row cap over an undefined order — the top-five-expansion list does not exist until the sort does. Reproducibility is a correctness requirement on a shared board, not a style preference.",
      tag: "pipeline",
    },
    {
      id: "linear-t22",
      q: "Where does COALESCE belong in a SaaS money report — and where does it become a lie?",
      a: "Sanctioned: COALESCE at the display fold, where NULL means 'nothing to add' — folding payment legs per statement, COALESCE(SUM(p.amount_cents), 0) turns the no-legs statements' NULL into the honest 0 the coverage census prints; and COALESCE on outer-join payloads where 'no match' and 'zero' mean the same thing. Forbidden: COALESCE on the cycle clock — IFNULL(latency, 0) invents same-day seat changes for the 14 trials that have not converted, drags the 2.98 average down, and poisons the baseline every regional drift alert keys off. The same ban covers the LAG baseline: coalescing the first spine row's NULL to 0 fabricates a 100% opening jump. The rule: COALESCE is for NULLs that mean zero, never for NULLs that mean not-yet. Saying which NULLs are which — before writing the function — is the answer the panel listens for.",
      tag: "nulls",
    },
    {
      id: "linear-t23",
      q: "Walk me through the close ritual on this book — the four proofs that must land before the numbers ship.",
      a: "Four proofs, in order. The ledger tie: debits against credits across the 80 GL entries must read 181,080.00 against 181,080.00, delta 0 — a nonzero delta pages the close. The fate identity: one pass reads 52 active + 30 expanding + 14 trials + 7 churned = 103 by construction; any branch arithmetic that fails the identity means a row fell between arms. The money layer: the coverage census must read 21 exact (65,612.00), 1 partial (4,000.00 of 6,148.00), 6 none (15,217.00) — billing statuses are claims, payment legs are the ledger of record, and the two anomaly rows (void-but-settled #11, paid-status #28 with zero legs) get walked line by line. The clock: the 2.98-day cycle average over its stated 82-row population, with the regional drift cut beside it. Each proof is one query, each figure carries its population, and the numbers ship only when all four land.",
      tag: "quality",
    },
    {
      id: "linear-t24",
      q: "Every rate on this book — churn share, active share, stamped share — is a denominator argument waiting to happen. What is your discipline for stating them, and where do the wrong denominators hide?",
      a: "Say the denominator before the query, in the title and on the slide. The churn map is churned periods ÷ ALL booked in the market — APAC 8.1% on 37 booked, EU 6.7% on 45 — because 'share of fates' includes the 14 trials and 30 in-flight; divide by settled only and the map flatters every market. The active share is active ÷ booked per market — EU 24 of 45, 53.3% — never active ÷ active. The stamped share is 82 of 103 booked — the 14 trials stay in, because 'not yet stamped' is what the metric watches. The hides: AVG over a NULL-shrunken population (a filtered denominator wearing a total's name), integer division truncating the ratio before the 100.0 multiplier lands, and grand-total denominators silently replacing per-group ones. The bar: any rate quoted without its denominator is a rumor, and the interviewer's first follow-up is always 'out of what?'",
      tag: "aggregation",
    },
  ],

  mcqs: [
    {
      id: "linear-mcq-1",
      prompt: "A billing period's status reads 'shipped'. In this kit's Linear stage map, what happened?",
      choices: ["Expansion in flight — the seat-change stamp shipped_at has landed", "Active and billed — the period completed its term", "Churned — the workspace cancelled mid-period", "Trial still awaiting conversion"],
      answer: 0,
      why: "The stage map is fixed: shipped = expansion in flight (30 of 103 periods), with shipped_at as the seat-change stamp. It is stamped, running — but not a completed billed term.",
      notes: [
        { choice: 1, why: "Active-and-billed is 'delivered' — 52 periods. Calling in-flight expansions active inflates the billed base before a single term completes." },
        { choice: 3, why: "Trials are 'pending' — 14 periods with no shipped_at yet. Pending is not expansion and not churn; it is 'not yet', and it stays in the funnel denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "linear-mcq-2",
      prompt: "Cycle time is stamped periods only. The db holds 82 stamped, 14 trials and 7 churned of 103 booked. What is the stamped share, and over which population?",
      choices: ["82/89 = 92.1% — stamped over stamped-plus-churned", "82/103 = 79.6% — stamped over ALL periods booked", "52/82 — billed over stamped", "82/16 = 512.5% — stamped over workspaces"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL periods booked — the 14 trials stay in the denominator because 'not yet stamped' is exactly what the metric watches. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 trials inflates the share to 92.1% by deleting the population the clock exists to watch — the rows that convert next." },
        { choice: 2, why: "52/82 mixes two funnel steps into one ratio — delivered is term completion, shipped_at is the seat-change stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "linear-mcq-3",
      prompt: "EU carries 45 billing periods from 8 workspaces. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to workspaces (8). The gap between them — 5.6 periods per workspace — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every period carries a workspace. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not workspaces — a third grain nobody asked for. The census is periods AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "linear-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to churned periods only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the churn share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the churn map reads zero everywhere, including APAC's 8.1%." },
      ],
      difficulty: "medium",
    },
    {
      id: "linear-mcq-5",
      prompt: "Keep only workspaces carrying at least 10 billing periods. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY workspace HAVING COUNT(*) >= 10", "WHERE periods >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A period-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the top tier — 24, 17, 14 and 13 periods — clears a 10-period bar per workspace.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'periods' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "linear-mcq-6",
      prompt: "The throughput ladder runs 24, 17, 14, 13, 5 periods, then FOUR workspaces tied at 4. Under RANK, what rank do the two 3-period workspaces carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-period workspaces share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The insights board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "linear-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 unstamped rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The trials double-counted their open day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 periods.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "linear-mcq-8",
      prompt: "A staging-table triage list uses workspace_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every period carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty triage lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "linear-mcq-9",
      prompt: "A board stack puts expansion-in-flight periods under churned periods in one layout, built with UNION. A reviewer says one workspace's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same workspace, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same workspace, same counts, no region or branch label — collapse into one, and the board loses a workspace with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "linear-mcq-10",
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
      id: "linear-mcq-11",
      prompt: "The seat report joins orders to order_items to read seat lines, and the period count reads 251 instead of 45 for EU. What happened?",
      choices: ["The join duplicated workspace rows", "The join fanned out — one row per seat line, so COUNT(*) counts lines, not billing periods", "order_items contains corrupt data", "GROUP BY dropped the market filter"],
      answer: 1,
      why: "orders holds 103 billing periods; order_items holds 251 seat/usage lines against them. Joining the line table changes the grain — every seat line contributes a row, so the census folds lines while wearing the period column's name. Count lines deliberately and say so, or restore the grain with COUNT(DISTINCT o.id).",
      notes: [
        { choice: 0, why: "The workspaces join is one-to-one on id and duplicates nothing — the fan-out enters exactly when the seat-line table joins, which is where 45 became 103-ish." },
        { choice: 2, why: "Nothing is corrupt — 251 lines over 103 periods (2.44 per period) is the book's real shape, and expansion lives in those extra lines. The bug is the metric, not the data." },
      ],
      difficulty: "easy",
    },
    {
      id: "linear-mcq-12",
      prompt: "A growth pod asks for the five biggest billing periods: SELECT id, total FROM orders LIMIT 5. The reviewer reruns it and gets five different periods. Why?",
      choices: ["The table changed between runs", "LIMIT without ORDER BY returns an arbitrary five — row order is unspecified, so 'biggest five' is undefined without a sort", "LIMIT caps columns, not rows", "The query needs DISTINCT to stabilize"],
      answer: 1,
      why: "LIMIT is a row cap, not a ranking — with no ORDER BY the engine may return any five rows, and the set can differ between runs. A top-five expansion list exists only after ORDER BY total DESC, with a stable tie-break (id) appended so the dashboard regenerates identically.",
      notes: [
        { choice: 2, why: "LIMIT caps ROWS — five rows, every column. The fix is an ORDER BY clause, not a column list; the direction of the correction is the lesson." },
        { choice: 3, why: "DISTINCT dedups rows and changes nothing about which five survive an unordered cap. Stabilization comes from a total sort order." },
      ],
      difficulty: "easy",
    },
    {
      id: "linear-mcq-13",
      prompt: "A junior 'fixes' a double-counted workspace roster by adding DISTINCT, and the counts come out right. Why is the reviewer still unhappy?",
      choices: ["DISTINCT is slower and must never be used", "The dedup hides the fan-out that produced the duplicates — the join is wrong and DISTINCT only silences the symptom", "DISTINCT changes the data types", "The roster was correct before the DISTINCT"],
      answer: 1,
      why: "If DISTINCT collapsing rows restores the right count, the join fanned out upstream — the surviving count is right by accident and every other aggregate on the same rows (SUM of period value, say) is still quietly wrong. Fix the grain first; a DISTINCT bandage is how silent wrongness passes review and ships to the insights board.",
      notes: [
        { choice: 0, why: "DISTINCT is legitimate for genuine duplicates in an answer set (a distinct workspace roster). The objection is to using it as a patch over a wrong join shape." },
        { choice: 2, why: "DISTINCT never touches types — it dedups rows. The real issue is that rows existed to dedup at all." },
      ],
      difficulty: "easy",
    },
    {
      id: "linear-mcq-14",
      prompt: "SELECT COUNT(status = 'pending') FROM orders returns 103, not the 14 trials. What is the misunderstanding?",
      choices: ["COUNT ignores the WHERE-less filter", "The comparison yields 0 or 1 for EVERY row and COUNT counts all non-NULL results — both 0 and 1 are non-NULL, so every period counts", "COUNT needs DISTINCT to filter", "SQLite treats 'pending' as truthy for every row"],
      answer: 1,
      why: "status = 'pending' evaluates to 1 for the 14 trials and 0 for the other 89 — COUNT counts any non-NULL value, zeros included, so the funnel reads 103. The conditional-count forms that actually filter are SUM(CASE WHEN … THEN 1 ELSE 0 END), COUNT(CASE WHEN … THEN 1 END), or COUNT(*) FILTER (WHERE …).",
      notes: [
        { choice: 0, why: "There is no filter to ignore — a boolean expression inside COUNT is just an argument. The 103 is arithmetically correct for what was written, which is what makes it dangerous." },
        { choice: 2, why: "DISTINCT dedups values — COUNT(DISTINCT status = 'pending') reads 2 (the outcomes 0 and 1), a different wrong answer, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "linear-mcq-15",
      prompt: "The market review wants one row per market with all its workspace names in a single cell. Which fold delivers that?",
      choices: ["SUM(customer_id)", "GROUP_CONCAT(DISTINCT c.name) with GROUP BY market", "MAX(c.name) — the alphabetically last workspace", "CONCAT over the joined rows without grouping"],
      answer: 1,
      why: "GROUP_CONCAT collapses many rows into one delimited string: EU's 45 periods fold to the list of its 8 workspace names, with DISTINCT deduping the repeats the join creates. SUM over ids adds id codes together, MAX keeps one arbitrary name, and CONCAT without an aggregate cannot coexist with GROUP BY's one-row-per-market shape.",
      notes: [
        { choice: 2, why: "MAX folds to one row per market but a single name is not a roster — it is the group's extreme, the same trap as reading 'largest period' as 'the market's book'." },
        { choice: 3, why: "CONCAT is a scalar function — it glues one row's values. Without GROUP BY and a real aggregate, the market column and the workspace rows cannot coexist." },
      ],
      difficulty: "medium",
    },
    {
      id: "linear-mcq-16",
      prompt: "A velocity trend chart groups by STRFTIME('%m', created_at) and shows 12 buckets for what the kit calls a 14-month period spine. Diagnosis?",
      choices: ["Two months had no billing periods and vanished", "'%m' emits month-only keys — January 2024 and January 2025 merged into one bucket; the spine needs '%Y-%m' (or SUBSTR(created_at, 1, 7))", "The chart dropped weekends", "STRFTIME cannot format TEXT timestamps"],
      answer: 1,
      why: "The '%m' spine collision folds both years together: 14 true months (2024-01 to 2025-02) print as 12 fictional ones, and the velocity trend is unreadable across the year boundary. The year must ride in the key — STRFTIME('%Y-%m', …) or SUBSTR(created_at, 1, 7) — which is how the LAG walk keeps its baseline month distinct.",
      notes: [
        { choice: 0, why: "Every spine month carries periods on this db. The 12-vs-14 gap is a key-collision signature — the merged Januaries are the tell, not empty buckets." },
        { choice: 3, why: "STRFTIME handles TEXT ISO timestamps fine; '%Y-%m' is the correct call. Only the format string was wrong." },
      ],
      difficulty: "easy",
    },
    {
      id: "linear-mcq-17",
      prompt: "An expansion report wants, for each period, the NEXT period's booked value on the workspace's timeline. Which window call is right?",
      choices: ["LAG(total) OVER (ORDER BY created_at)", "LEAD(total) OVER (ORDER BY created_at)", "FIRST_VALUE(total) OVER (ORDER BY created_at)", "NTILE(2) OVER (ORDER BY created_at)"],
      answer: 1,
      why: "LEAD looks forward one row — the next period; LAG looks backward — the previous one. They are mirror images and swapping them is a silent direction bug that still returns numbers. FIRST_VALUE pins the partition's opening row, and NTILE cuts row-count buckets — neither fetches 'next'.",
      notes: [
        { choice: 0, why: "LAG answers 'what came before' — the right tool for the month-over-month velocity walk, the wrong one when the report asks for what follows. Direction is the entire question." },
        { choice: 2, why: "FIRST_VALUE returns the same opening value on every row — a workspace-opening column, not a next-period column. Three window functions, three different questions." },
      ],
      difficulty: "easy",
    },
    {
      id: "linear-mcq-18",
      prompt: "A two-period moving window runs SUM(total) OVER (ORDER BY created_at ROWS BETWEEN 1 PRECEDING AND CURRENT ROW). What prints on the spine's FIRST row?",
      choices: ["NULL — the frame has no preceding row", "Just that row's total — the frame clips to one row when the preceding bound falls off the edge", "The full market total", "Zero"],
      answer: 1,
      why: "ROWS frames clip at partition boundaries: on the first row the PRECEDING bound is empty, the frame shrinks to the current row, and the moving sum equals that row's total — no NULL, no padding. Honest, but it means edge cells mix one-row and two-row windows, which the velocity pack's footnotes must own.",
      notes: [
        { choice: 0, why: "LAG returns NULL on the first row; a SUM over a clipped frame does not — it sums what exists. Confusing the two edge behaviors is the classic moving-window bug." },
        { choice: 2, why: "UNBOUNDED PRECEDING reaches the full-partition total; a bounded 1-PRECEDING frame never widens past its bound, edge or not." },
      ],
      difficulty: "hard",
    },
    {
      id: "linear-mcq-19",
      prompt: "Which query returns the markets that booked billing periods in 2024 but never carried a single churned period that year?",
      choices: ["Markets INNER JOINed to churned periods on market", "SELECT market FROM booked-2024 EXCEPT SELECT market FROM churned-2024", "SELECT market FROM booked-2024 UNION SELECT market FROM churned-2024", "Markets GROUP BY market HAVING COUNT(*) > 0"],
      answer: 1,
      why: "'Booked but never churned' is set difference: EXCEPT keeps the left set's rows absent from the right set, both branches projecting the same column shape. UNION merges the populations, an inner join keeps only markets WITH churn — the complement of the question — and HAVING filters on volume, never membership.",
      notes: [
        { choice: 2, why: "UNION merges and dedups — every booked market survives even if it churned everything. EXCEPT is the subtraction UNION cannot do." },
        { choice: 3, why: "HAVING COUNT(*) > 0 is a volume gate every market passes. Presence-of-a-kind is set algebra's job, not aggregation's." },
      ],
      difficulty: "medium",
    },
    {
      id: "linear-mcq-20",
      prompt: "The ops board reads active, expanding, trial and churned in ONE scan. Why does the kit accept both COUNT(*) FILTER (WHERE …) and SUM(CASE WHEN … THEN 1 ELSE 0 END)?",
      choices: ["They are spelled differently but identical in semantics, with a portability trade-off", "FILTER is faster and CASE is deprecated", "CASE can only count two branches per query", "FILTER ignores NULLs, CASE does not"],
      answer: 0,
      why: "Both are conditional counts over one pass: FILTER is the readable SQL-standard form, SUM(CASE …) the portable twin that runs on any engine. The discipline the board enforces is the identity — 52 + 30 + 14 + 7 = 103 by construction — whichever spelling builds it; four sequential queries are four ways to drift off the fate census.",
      notes: [
        { choice: 1, why: "Neither form is deprecated, and at this db size the performance difference is noise. The real choice is readability versus portability, stated out loud." },
        { choice: 3, why: "Both handle NULLs identically inside their conditions — which is precisely why the CASE twin needs the mandatory ELSE 0 arm." },
      ],
      difficulty: "medium",
    },
    {
      id: "linear-mcq-21",
      prompt: "WHERE RANK() OVER (ORDER BY total DESC) <= 5 errors. What does the error teach about the logical pipeline?",
      choices: ["RANK needs a PARTITION BY to appear in WHERE", "Window functions are evaluated AFTER WHERE — ranking columns do not exist yet at filter time; stage the window in a derived table or CTE and filter outside", "WHERE cannot compare numbers to 5", "The query needs LIMIT 5 instead"],
      answer: 1,
      why: "The pipeline runs FROM → WHERE → GROUP BY → HAVING → SELECT (where windows live) → ORDER BY, so a window's output is unavailable to WHERE — the engine rejects it rather than lying. The fix is staging: wrap the windowed SELECT in a CTE and filter on the rank outside. LIMIT 5 without the window answers a different question and cannot display the rank column the board asked for.",
      notes: [
        { choice: 0, why: "PARTITION BY changes scope, not evaluation order — a windowed column is unavailable to WHERE with or without a partition." },
        { choice: 3, why: "LIMIT 5 with ORDER BY total DESC returns the same rows here — but the leaderboard without its rank column is not the leaderboard, which is why the window exists." },
      ],
      difficulty: "hard",
    },
    {
      id: "linear-mcq-22",
      prompt: "A 752.96 period is 'large' on the platform screen but may be routine for a workspace whose periods average more. Which query shape tests 'large for THIS workspace'?",
      choices: ["A scalar subquery over the whole table", "A correlated subquery — WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — or its window twin AVG(total) OVER (PARTITION BY customer_id)", "A GROUP BY with HAVING MAX(total) > 700", "A CROSS JOIN of periods to workspaces"],
      answer: 1,
      why: "The correlated form re-runs the mean per outer row over that workspace's own periods — a per-logo population, different from the platform's 338.19 — and the window twin computes the same per-workspace mean in one pass. HAVING filters workspaces, not periods; the whole-table scalar is the first screen, not this one.",
      notes: [
        { choice: 0, why: "The uncorrelated scalar folds 338.19 once for everyone — the platform baseline the first screen already used. The question changed populations; the query must too." },
        { choice: 2, why: "HAVING gates whole groups after folding — it can find workspaces whose biggest period clears 700 but cannot compare EACH period to its own workspace's mean." },
      ],
      difficulty: "hard",
    },
    {
      id: "linear-mcq-23",
      prompt: "The four market average period values are 335.32 (EU), 313.66 (APAC), 383.48 (US) and 426.22 (LATAM). Why is quoting 'the average period is 364.67' wrong for the platform?",
      choices: ["One market's average must be wrong", "It is the average of averages — each market weighted equally, ignoring that EU carries 45 periods and LATAM 2; the platform mean over all 103 periods is 338.19", "The market averages need rounding to 0 decimals first", "364.67 is right — the platform mean is the error"],
      answer: 1,
      why: "Averaging the four market means weights LATAM's two periods as heavily as EU's forty-five, drifting the result to 364.67 — far from the true 338.19 fold over all 103 periods. Both numbers exist but answer different questions; quoting the equal-weight one as the platform average misprices every screen built on it.",
      notes: [
        { choice: 3, why: "338.19 is the direct fold every screen in this kit uses. 364.67 is real arithmetic wearing the wrong label — exactly the failure mode pipeline reviews hunt." },
        { choice: 2, why: "Rounding is presentation. The 26.48 gap is a weighting artifact, and no rounding scheme removes it." },
      ],
      difficulty: "hard",
    },
    {
      id: "linear-mcq-24",
      prompt: "A pairing query lists every pair of periods belonging to the SAME workspace, and a junior writes FROM orders a JOIN orders b ON a.customer_id = b.customer_id. What is wrong with the shape?",
      choices: ["Self-joins are not allowed in SQLite", "It emits each pair twice plus every period paired with itself — the pair-once shape is ON a.customer_id = b.customer_id AND a.id < b.id", "It needs a WHERE clause to work at all", "The aliasing must reuse the same table name"],
      answer: 1,
      why: "The naive equality pairs every period with every period of that workspace — both directions plus the self-pair diagonal — so a workspace with three periods yields nine rows and every pair appears twice. The pair-once discipline adds a strict inequality on a stable key — a.id < b.id — keeping one orientation and dropping the diagonal. It is how you would pair a workspace's seat-change stamps without double-counting.",
      notes: [
        { choice: 0, why: "Self-joins are ordinary SQL — a table joined to itself under two aliases. The bug is the predicate's symmetry, not the self-join's legality." },
        { choice: 2, why: "The query runs fine as written — that is the danger. It returns a plausible-looking superset that inflates every downstream count." },
      ],
      difficulty: "medium",
    },
    {
      id: "linear-mcq-25",
      prompt: "WHERE SUBSTR(created_at, 1, 7) = '2024-07' runs, but EXPLAIN shows a full scan where an index on created_at exists. Why?",
      choices: ["created_at has no index", "Wrapping the indexed column in a function makes the predicate non-sargable — the index is on created_at, not on SUBSTR of it; use a half-open range on the raw column instead", "SUBSTR cannot be used in WHERE", "The index needs a VACUUM"],
      answer: 1,
      why: "An index serves a predicate only when the raw column is compared to a constant range. Apply a function to the column and the engine evaluates it per row — the index is blind. The rewrite compares the raw column: created_at >= '2024-07-01' AND created_at < '2024-08-01', which is also the half-open shape that never drops cycle-end rows.",
      notes: [
        { choice: 2, why: "SUBSTR in WHERE is legal — the query returns the right 7 periods. The complaint is cost at scale, not correctness; that distinction is what 'sargable' names." },
        { choice: 3, why: "VACUUM rebuilds the file; it does not teach the planner to see through functions. The predicate changed, not the index." },
      ],
      difficulty: "medium",
    },
    {
      id: "linear-mcq-26",
      prompt: "The velocity leaderboard can tie, and the insights board must regenerate byte-identically every run. What completes ORDER BY periods DESC, value DESC, ___?",
      choices: ["c.name", "c.id — a stable surrogate key as the final tie-break", "RANDOM()", "Nothing — two columns always suffice"],
      answer: 1,
      why: "Ties can survive both sort keys (the four workspaces tied at 4 periods have distinct values today, but the query must not depend on that), so the last key must be a stable unique column — the workspace id. RANDOM() guarantees every run differs; names can collide or rename; 'nothing' leaves tied rows free to shuffle between runs.",
      notes: [
        { choice: 0, why: "Names work until two workspaces share one or a rename lands — reproducibility wants a key that never changes, which is what surrogate ids are for." },
        { choice: 2, why: "RANDOM() is the deliberate anti-choice: it guarantees the board never matches yesterday, the opposite of the requirement." },
      ],
      difficulty: "easy",
    },
    {
      id: "linear-mcq-27",
      prompt: "A quarter-end velocity read uses BETWEEN '2024-03-01' AND '2024-03-31' on created_at and the March total looks light. Why?",
      choices: ["March periods were genuinely few", "BETWEEN is inclusive on both ends, so any period stamped later on the 31st (a time component past midnight) falls out — the half-open range created_at >= '2024-03-01' AND created_at < '2024-04-01' is the safe cut", "BETWEEN excludes the first day", "created_at must be CAST to DATE first"],
      answer: 1,
      why: "With timestamps carrying time components, '2024-03-31' as an upper bound matches only midnight-zero of that day — every later second of the 31st drops, and cycle-end is exactly when seat changes land. The half-open [start, next-start) range keeps the whole last night and composes cleanly quarter to quarter.",
      notes: [
        { choice: 0, why: "March's real total (2,617.08) is what it is — the light read is a boundary artifact, and boundary bugs always look like quiet months." },
        { choice: 2, why: "BETWEEN is inclusive on BOTH ends; the loss is at the top edge where time-of-day hides past the literal's midnight." },
      ],
      difficulty: "easy",
    },
    {
      id: "linear-mcq-28",
      prompt: "On the 14-month period spine, LAG(book) OVER (ORDER BY month) prints NULL for 2024-01. A teammate COALESCEs it to 0 so the delta column computes. What did that break?",
      choices: ["Nothing — the delta now reads correctly", "The January delta becomes 3731.97 - 0 = a 100% jump from nothing; the NULL was the honest 'no baseline', and a fabricated zero invents a movement that never happened", "NULLs propagate and blank the column", "LAG cannot be used with COALESCE"],
      answer: 1,
      why: "The first spine row has no prior month — NULL is the data saying 'baseline', not a missing value to repair. Coalescing it to zero turns the opening month into a +3,731.97 jump and every percentage built on that denominator divides by zero. Label the edge row 'baseline' or let the NULL print — the discipline the velocity walk runs on.",
      notes: [
        { choice: 0, why: "The number computes — that is the trap. It computes a fiction: an edge-row NULL is information, a 100%-from-zero delta is misinformation." },
        { choice: 2, why: "NULL propagation is real for arithmetic ON a NULL, but COALESCE already removed it here. The damage is the invented zero, not propagation." },
      ],
      difficulty: "medium",
    },
    {
      id: "linear-mcq-29",
      prompt: "NTILE(4) OVER (ORDER BY periods DESC) bands the 16-workspace book into quartiles. With four workspaces tied at 4 periods, what is the catch?",
      choices: ["NTILE errors on ties", "NTILE counts ROWS, not distinct values — tied workspaces can land in different tiles, splitting one cadence tier across quartiles arbitrarily", "NTILE requires a PARTITION BY", "The quartiles will all have exactly 4 workspaces"],
      answer: 1,
      why: "NTILE is a row-counting bucket function: 16 rows over 4 tiles gives four tidy tiles by count, but ties give NTILE no reason to keep peers together — the tie block can straddle two tiles depending on row order. If tiers must respect ties, band on the value (CASE or a DENSE_RANK cut); if tiles must reproduce, pin the OVER order with a deterministic tie-break.",
      notes: [
        { choice: 0, why: "NTILE runs happily on ties — that is the problem. It has no tie semantics at all, so it silently splits peers." },
        { choice: 3, why: "16 rows do divide 4/4/4/4 — the tile counts are clean precisely because the workspace count is divisible, which distracts from the tie-splitting inside the tiles." },
      ],
      difficulty: "hard",
    },
    {
      id: "linear-mcq-30",
      prompt: "SUM(CASE WHEN status = 'cancelled' THEN 1 END) over a market with no churned periods prints NULL, not 0. Why, and what is the fix?",
      choices: ["NULL means the query failed", "With no matching row the CASE never fires, SUM over all-NULL is NULL, and the ELSE arm is missing — SUM(CASE WHEN … THEN 1 ELSE 0 END) or COALESCE outside the fold restores the zero", "SUM cannot handle TEXT statuses", "The market needs a GROUP BY"],
      answer: 1,
      why: "A CASE without ELSE emits NULL on every non-match; sum only those and the aggregate is NULL — which prints as an empty cell the board reads as 'unknown', not 'zero'. The ELSE 0 arm is the honest zero-fill: the market genuinely retained everything, and the census must print 0 to reconcile — the same rule that keeps LATAM's churn cell reading 0 on this db.",
      notes: [
        { choice: 0, why: "The query succeeded — NULL is a legitimate aggregate over an empty match set. Reading NULL as failure is how missing-ELSE bugs survive into boards." },
        { choice: 2, why: "SUM folds numbers; the CASE converts status text to numbers first. The issue is the missing ELSE arm, not SUM's type handling." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-linear-1",
      tier: "easy",
      topic: "t3",
      universe: "funnel",
      title: "The cycle-time clock",
      brief:
        "Linear-flavored brief on the storefront db: Monday's insights review opens with the cycle-time clock — how long a billing period runs from open to its seat-change stamp, per market, with the population stated on the slide. Probed facts: 103 periods worth 34,833.28; 82 carry the shipped_at stamp (52 active-billed + 30 expansion-in-flight), averaging 2.98 days with a 2–4 spread; the 14 trials have no stamp and no cycle yet. The regional cut reads EU 36 stamps from 8 workspaces at 2.94 days, APAC 29 from 5 at 2.93, US 15 from 2 at 3.07, LATAM 2 from 1 at 3.5. The review reads slowest cycle first.",
      ask: "Return each region with its stamped period count, distinct workspace count and average cycle days to 2 decimals, slowest cycle first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS stamped_periods,\n       COUNT({1} o.customer_id) AS workspaces,\n       ROUND(AVG({2}(o.shipped_at) - julianday(o.created_at)), {3}) AS avg_cycle_days\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at IS {4} NULL\nGROUP BY c.region\nORDER BY avg_cycle_days {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the workspace deduplicator",
          why: "COUNT(DISTINCT o.customer_id) folds repeat periods back to workspaces: EU reads 8, not 36. SUM(DISTINCT …) adds the id codes together and MAX(DISTINCT …) reports the largest id — neither is a census.",
        },
        {
          answer: "julianday",
          kind: "keyword",
          label: "the day-difference function",
          why: "julianday() turns TEXT timestamps into fractional day numbers so the delta is a real number of days. DATE() returns a string that coerces to 2024 in arithmetic and the average explodes to a nonsense negative.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the cycle precision",
          why: "Cycle reports to 2 decimals — EU's 2.94 against the 2.98 platform average. ROUND(…, 1) prints 2.9 and the regional drift map stops reconciling with the number the velocity alert keys off.",
        },
        {
          answer: "NOT",
          kind: "keyword",
          label: "the stamp guard",
          why: "shipped_at IS NOT NULL keeps only the 82 stamped periods — the 14 trials have no stamp and no cycle to average. Dropping NOT flips the filter to IS NULL and the census suddenly reads the 21 never-stamped rows instead.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the slowest-first direction",
          why: "The review reads slowest cycle on top: LATAM 3.5, US 3.07, EU 2.94, APAC 2.93. ASC would open the meeting on the healthiest market — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["DATE", "SUM", "ASC", "1", "NULL"],
      walkthrough:
        "One join, one fold, four columns at two grains. The join attaches every period to its workspace's region, the WHERE keeps only the 82 stamped rows, and GROUP BY region folds them into four rows ordered slowest-first: LATAM 2 stamps from 1 workspace at 3.5 days, US 15 from 2 at 3.07, EU 36 from 8 at 2.94, APAC 29 from 5 at 2.93 — reconciling upward to the 2.98-day platform average over the stated 82-row population. The 14 trials never enter: no stamp, no seat change, no cycle. The distractors fail honestly: DATE in the clock slot returns a string that coerces to 2024 in the subtraction and the average explodes; SUM as the deduplicator adds customer ids together and reports a census of nothing; 1 in the precision slot truncates to one decimal so the drift map drifts; dropping NOT flips the filter to IS NULL and the deck counts the 21 never-stamped rows; ASC opens the review on APAC. The two-grain pairing is the read: US stamps 15 periods from just 2 workspaces (7.5 per logo) while EU spreads 36 across 8 (4.5) — US expansion is concentrated, EU's is broad, and the queue follows the concentration.",
    },
    {
      id: "cs-linear-2",
      tier: "medium",
      topic: "q6",
      universe: "month-close",
      title: "The statement coverage census",
      brief:
        "Linear-flavored brief on the storefront db: at every close, finance reconciles subscription billing statements against the payment legs that actually settled them — status is a claim, payment rows are the ledger of record. Probed facts: 28 statements — 21 settle to the cent (65,612.00 both sides; the void-but-settled #11 at 925.00 folds in by construction), 6 never-collected worth 15,217.00 (including paid-status #28 at 1,756.00 with zero legs — a status that lies), and 1 partial (#25: 4,000.00 of 6,148.00 settled). Statement tables carry INTEGER cents; the dollar read is amount_cents / 100.0.",
      ask: "Return each coverage bucket with statement count, billed total and settled total in dollars to 2 decimals, biggest bucket first.",
      template:
        "WITH legs AS (\n  SELECT i.id AS invoice_id,\n         i.amount_cents AS billed_cents,\n         COALESCE({1}(p.amount_cents), 0) AS paid_cents,\n         CASE WHEN SUM(p.amount_cents) = i.amount_cents THEN {2}\n              WHEN COALESCE(SUM(p.amount_cents), 0) = {3} THEN 'no payment'\n              ELSE 'partial' END AS coverage\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n)\nSELECT coverage,\n       COUNT(*) AS invoices,\n       ROUND(SUM(billed_cents) / {4}, 2) AS billed_total,\n       ROUND(SUM(paid_cents) / 100.0, 2) AS settled_total\nFROM legs\nGROUP BY coverage\nORDER BY invoices {5};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the leg fold",
          why: "SUM(p.amount_cents) per statement totals every settled leg; COUNT would count legs (a 2-leg statement reads 2 cents), AVG and MAX collapse the same way — three different wrong monies wearing one column name.",
        },
        {
          answer: "'exact'",
          kind: "keyword",
          label: "the to-the-cent label",
          why: "Statements whose legs sum to billed_cents are 'exact' — 21 of 28, including void-but-settled #11 (925.00), which folds in by construction. 'paid' would label by claim instead of by legs and reads a status that lies.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the no-legs boundary",
          why: "paid_cents = 0 is the never-collected arm — 6 statements whose settled total prints 0.00, the anti-join's dollar read. Any other boundary moves the 6 into partial and the coverage census stops footing to the AR line.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements and legs store INTEGER cents; /100.0 is the dollar read that prints 65,612.00 instead of 6,561,200. The .0 matters — bare 100 keeps integer arithmetic and the board reads a hundredfold-off book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bucket-first direction",
          why: "The close reads biggest bucket on top: exact 21, no payment 6, partial 1. ASC opens the close on the single partial — a correct query aimed at the wrong end of the ledger.",
        },
      ],
      distractors: ["COUNT", "AVG", "MAX", "'paid'", "ASC", "invoice_id"],
      walkthrough:
        "Two stages: fold legs per statement, then classify and roll up. The CTE LEFT JOINs 28 statements to 27 payment legs, folds SUM(p.amount_cents) per statement with a COALESCE-to-0 fallback, and CASE-classifies: legs equal billed → 'exact' (21 — void-but-settled #11 at 925.00 lands here because its one leg matches its billed cents), legs at zero → 'no payment' (6, including paid-status #28 at 1,756.00 whose status lies), else 'partial' (1 — #25 at 4,000.00 of 6,148.00). The outer SELECT rolls each bucket to statement count and dollar totals via the /100.0 read: exact 21 / 65,612.00 / 65,612.00, no payment 6 / 15,217.00 / 0.00, partial 1 / 6,148.00 / 4,000.00 — footing to the probed AR lines exactly. The distractors each break differently: COUNT folds legs into counts so a 2-leg statement reads 2 cents settled; AVG and MAX collapse the fold and every settled total drifts; 'paid' labels by claim so the census reads a status instead of legs; ASC opens the close on the partial; invoice_id in the boundary or divider slots divides by ids 1–28 or compares money to ids and the buckets dissolve. The census rule holds: classification happens at statement grain before any rollup, and the buckets must foot to 28 or the close does not ship.",
    },
    {
      id: "cs-linear-3",
      tier: "medium",
      topic: "s6",
      universe: "pricing",
      title: "The seat-band census",
      brief:
        "Linear-flavored brief on the storefront db: the monetization pod's first chart every week is the seat-band census — every seat/usage line CASE-banded into starter versus growth at the 55-dollar rate line, because the expansion story lives in the split. Probed on the storefront db: 251 seat lines carry 498 seats in total; the sub-55 starter band holds 133 lines / 268 seats averaging 31.01 a seat, the 55-plus growth band holds 118 lines / 230 seats averaging 115.85 — more seats ride cheap rates, but the growth band's rate is 3.7x the starter's. The bands must be exhaustive (every line lands in exactly one) and the fold reports lines beside seats deliberately: lines are records, seats are people, and the 251-vs-498 gap is the two-grain trap in one table. The chart reads biggest seat count first.",
      ask: "Return each seat band with its line count, seat count and average per-seat rate to 2 decimals, biggest seat count first.",
      template:
        "SELECT CASE WHEN oi.unit_price {1} {2} THEN 'starter' ELSE 'growth' END AS band,\n       COUNT(*) AS lines,\n       {3}(oi.quantity) AS seats,\n       ROUND(AVG(oi.unit_price), 2) AS avg_rate\nFROM order_items oi\nGROUP BY band\nORDER BY seats DESC;",
      slots: [
        {
          answer: "<",
          kind: "keyword",
          label: "the band comparison",
          why: "Starter is strictly below the 55-dollar line: unit_price < 55. Flipping to > bands everything above the line as 'starter' and the two rows swap seats — 230 and 268 trade places while the query still runs, the silent re-band the WHEN-order lesson warns about.",
        },
        {
          answer: "55",
          kind: "number",
          noVerify: true,
          label: "the published rate line",
          why: "55 is the published band edge the pricing page defends — the kit's seat-mix metric is defined at exactly this cut. Moving it to 100 drags the 50 mid-priced lines (55–99.99) into starter and both bands' averages shift; the edge is a business constant, not a tuning knob.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the seat fold",
          why: "Seats are the SUM of quantity across a band's lines — 268 and 230. COUNT reads line counts (133/118) into the seat column, AVG reads average lines-per-record (~2), MAX reads 3 — three plausible-looking numbers, none of them seats.",
        },
      ],
      distractors: [">", "100", "COUNT", "AVG", "MAX"],
      walkthrough:
        "One CASE, two grains, no join. The CASE bands all 251 lines at the 55-dollar edge — < 55 is starter, else growth, and the ELSE guarantees exhaustiveness: every line lands in exactly one band, so the seat counts must foot to 498 or a line fell between arms. The fold reports both grains on purpose: COUNT(*) reads lines (133 starter / 118 growth), SUM(quantity) reads seats (268 / 230) — the gap between 133 lines and 268 seats is the 2-seat average line, and conflating them is exactly the fan-out trap the seat report exists to teach. AVG(unit_price) reads the rate per seat — 31.01 starter against 115.85 growth, a 3.7x spread that IS the upsell story: the money concentrates in 118 growth lines even though 268 seats ride starter rates. The distractors each break differently: > swaps the bands while the query still runs; 100 re-draws the edge and drags 50 mid-band lines across; COUNT puts line counts in the seat column; AVG and MAX fold the wrong statistic entirely. The read for the monetization pod: band edges are published constants — the CASE must encode the pricing page, not a convenient round number.",
    },
    {
      id: "cs-linear-4",
      tier: "easy",
      topic: "x2",
      universe: "month-close",
      title: "The one-pass fate census",
      brief:
        "Linear-flavored brief on the storefront db: the ops board's non-negotiable is the fate census — active-billed, expanding, trial and churned per market in ONE scan, because four sequential queries are four ways to drift off the 103 identity. Probed facts: EU runs 45 periods (24 active / 12 expanding / 6 trials / 3 churned, billed value 6,656.18, active share 53.3), APAC 37 (21 / 8 / 5 / 3, billed 6,617.68, share 56.8), US 19 (5 / 10 / 3 / 1, billed 1,444.77, share 26.3) and LATAM 2 (2 / 0 / 0 / 0, billed 852.44, share 100.0). Platform-wide the branches reconcile 52 + 30 + 14 + 7 = 103 by construction — a branch that breaks that identity is the day's first incident. The board reads biggest market first, and the US row is the one growth circles: only 26.3 percent active, with 10 of 19 periods still expanding.",
      ask: "Return each market with its period count, active / expanding / trial / churned counts, billed value to 2 decimals and active share to 1 decimal, biggest market first.",
      template:
        "WITH census AS (\n  SELECT c.region AS market,\n         COUNT(*) AS periods,\n         COUNT(*) FILTER (WHERE o.status = {1}) AS active,\n         COUNT(*) FILTER (WHERE o.status = {2}) AS expanding,\n         COUNT(*) FILTER (WHERE o.status = 'pending') AS trials,\n         COUNT(*) FILTER (WHERE o.status = 'cancelled') AS churned,\n         ROUND(SUM(o.total) FILTER (WHERE o.status = 'delivered'), 2) AS billed_value\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n)\nSELECT market,\n       periods,\n       active,\n       expanding,\n       trials,\n       churned,\n       billed_value,\n       ROUND({3} * active / periods, 1) AS active_share\nFROM census\nORDER BY periods {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the active status literal",
          why: "'Active-and-billed' is the status-filtered conditional count: o.status = 'delivered', the 52 delivered periods. 'billed' itself is not a status on the book — the FILTER would silently count zero — and 'shipped' would label in-flight expansions as revenue landed.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the expanding literal",
          why: "Expanding is the 'shipped' branch — 30 periods platform-wide with shipped_at as the seat-change stamp — never the 'cancelled' arm, which is the 7 churned periods. Swap them and the board reports churned accounts as expansions in flight.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the real-arithmetic multiplier",
          why: "The share is 100.0 * active / periods — the .0 promotes real arithmetic before the division. A bare 100 keeps integer division: 100 * 24 / 45 truncates to 53, and every market's share reads flat while looking computed.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-market-first direction",
          why: "The board reads biggest market on top: EU 45, APAC 37, US 19, LATAM 2. ASC opens the meeting on LATAM's two periods — a market that is 1.9% of the book — a correct query aimed at the wrong end of the room.",
        },
      ],
      distractors: ["'billed'", "'trial'", "ASC", "100"],
      walkthrough:
        "One CTE, one pass, four FILTER branches per market. The CTE joins periods to their market and counts each fate conditionally: 'delivered' reads 24/21/5/2 active, 'shipped' reads 12/8/10/0 expanding, 'pending' waits 6/5/3/0, 'cancelled' churns 3/3/1/0 — and every row's branches plus the period COUNT(*) foot to 45, 37, 19 and 2, reconciling platform-wide to 52 + 30 + 14 + 7 = 103. The billed-value column folds delivered money only — 6,656.18 / 6,617.68 / 1,444.77 / 852.44 — and the share column divides active by periods with the 100.0 multiplier: EU 53.3, APAC 56.8, US 26.3, LATAM 100.0 on its n=2 base. The US row is the one growth circles: 10 of 19 periods still expanding and just 1,444.77 billed of a 7,286.16 book. The distractors each break differently: 'billed' and 'trial' are not statuses so their FILTERs silently read zero; 100 truncates every share flat; ASC opens the board on the smallest market. The census rule holds: fates are counted in ONE pass so the branches must reconcile — four queries drift, one query proves.",
    },
    {
      id: "cs-linear-5",
      tier: "medium",
      topic: "j7",
      universe: "month-close",
      title: "The payment-rail census",
      brief:
        "Linear-flavored brief on the storefront db: billing reconciles subscription statements against the two payment rails — card is the self-serve rail, wire is the enterprise-invoiced rail — and the rail census is the j7 fold: legs joined to statements, folded per method. Probed on the storefront db: the card rail carries 16 legs covering 8 distinct workspaces for 37,364.00 (average leg 2,335.25); the wire rail carries 11 legs covering 4 workspaces for 32,248.00 (average leg 2,931.64). The tell is in the shapes: card spreads 16 legs across 8 logos — two legs a logo, self-serve cadence — while wire concentrates 11 legs into 4 logos at a bigger average leg: fewer, heavier, enterprise. 27 legs in total, and five statements ride legs on BOTH rails — which is why legs never foot to distinct cycles without the join. Finance tables carry INTEGER cents; the dollar read is amount_cents / 100.0.",
      ask: "Return each rail with its leg count, distinct workspace count, settled dollars to 2 decimals and average leg to 2 decimals, biggest rail first.",
      template:
        "SELECT p.method AS rail,\n       COUNT(*) AS legs,\n       COUNT(DISTINCT i.customer_id) AS workspaces,\n       ROUND({1}(p.amount_cents) / {2}, 2) AS dollars,\n       ROUND(AVG(p.amount_cents) / 100.0, 2) AS avg_leg\nFROM payments p\nJOIN invoices i ON i.id = p.invoice_id\nGROUP BY p.method\nORDER BY dollars {3};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the money fold",
          why: "Rail dollars are SUM(p.amount_cents) — 373,640 and 322,480 cents before the divider. COUNT reads leg counts (16/11) into the money column, MAX reads the single biggest leg, AVG reads the mean — three plausible numbers, none of them the rail's settled dollars.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Payments store INTEGER cents; /100.0 is the dollar read that prints 37,364.00 instead of 3,736,400. The .0 matters — bare 100 keeps integer arithmetic and the board reads a hundredfold-off book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-rail-first direction",
          why: "The close reads the bigger rail on top: card 37,364.00 above wire 32,248.00. ASC leads with wire — a defensible enterprise story, but not the page's stated order, and a board that re-sorts itself between meetings is a board nobody trusts.",
        },
      ],
      distractors: ["COUNT", "MAX", "1000", "ASC"],
      walkthrough:
        "One join, one fold per rail, two grains on display. The join attaches every payment leg to its statement so the workspace count can ride on i.customer_id: card folds 16 legs into 37,364.00 across 8 distinct workspaces, wire folds 11 legs into 32,248.00 across 4 — legs and workspaces are different grains, and the gap (16 legs, 8 logos) is the two-legs-per-logo cadence that makes card self-serve. The dollars column is SUM over INTEGER cents divided by 100.0, and the avg_leg column divides AVG by the same read: 2,335.25 card against 2,931.64 wire — the enterprise rail's legs run heavier even though its rail runs smaller, which is the concentration story in two cells. The distractors each break differently: COUNT puts leg counts in the money column (0.16 and 0.11 dollars — absurd, but it prints); MAX reads the biggest single leg as the rail's total; 1000 rescales every cell to a tenth; ASC flips the board's order. The read for finance: the rails are a concentration map — card is breadth, wire is depth — and five statements riding both rails are exactly why the census joins to statements instead of counting payments alone.",
    },
    {
      id: "cs-linear-6",
      tier: "hard",
      topic: "q5",
      universe: "growth",
      title: "The above-the-mean bench",
      brief:
        "Linear-flavored brief on the storefront db: expansion targeting starts from the platform mean — fold lifetime value per workspace, compute the mean, and target the logos above it. Probed on the storefront db: 16 workspaces, mean lifetime 2,177.08, and exactly 5 clear the line — Alice Chen 7,262.35 (+5,085.27 over the mean), Emma Wilson 6,640.56 (+4,463.48), Grace Kim 4,574.23 (+2,397.15), Maya Patel 3,644.56 (+1,467.48) and Chloe Dubois 2,667.93 (+490.85, the nearest to the line). The other 11 logos sit below — a long tail that keeps the bench honest. The derived-table shape is the drill: fold per workspace FIRST, then judge the fold against a scalar of the fold — comparing raw period rows to a per-workspace mean is a grain error the panel listens for. The bench reads biggest gap first.",
      ask: "Return each workspace whose lifetime value clears the platform mean, with its lifetime to 2 decimals and the gap over the mean to 2 decimals, biggest gap first.",
      template:
        "WITH lifetime AS (\n  SELECT customer_id, SUM(total) AS lt\n  FROM orders\n  GROUP BY {1}\n)\nSELECT c.name AS workspace,\n       ROUND(l.lt, 2) AS lifetime,\n       ROUND(l.lt - (SELECT AVG(lt) FROM lifetime), 2) AS gap\nFROM lifetime l\nJOIN customers c ON c.id = l.customer_id\nWHERE l.lt {2} (SELECT AVG(lt) FROM lifetime)\nORDER BY gap {3};",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the per-workspace fold key",
          why: "The CTE folds 103 periods into 16 one-row workspaces — GROUP BY customer_id. GROUP BY id folds per period instead: 103 rows of one-period lifetimes, the mean drops to the 338.19 ticket average, and 'above the mean' becomes a different (wrong) population.",
        },
        {
          answer: ">",
          kind: "keyword",
          label: "the above-the-line comparison",
          why: "The bench is strictly above the mean — 5 logos. Flipping to < selects the 11-logo tail instead and the expansion bench reads like a churn-risk list; the mean itself never matches (no logo sits exactly at 2,177.08), so an equality arm would return a confident zero.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-gap-first direction",
          why: "Targeting reads biggest gap on top: Alice Chen +5,085.27 down to Chloe Dubois +490.85. ASC inverts the bench and opens the meeting on the smallest over-mean logo — a correct query aimed at the wrong end of the pipeline review.",
        },
      ],
      distractors: ["SUM", "MAX", "<", "ASC", "id"],
      walkthrough:
        "Two stages: fold per workspace, then judge the fold. The CTE groups 103 periods by customer_id into 16 one-row lifetimes — the fold whose grain IS the question — and the outer query keeps only the rows clearing the scalar (SELECT AVG(lt) FROM lifetime) = 2,177.08, the platform mean of the FOLD, not of raw periods. Five logos clear it: Alice Chen 7,262.35, Emma Wilson 6,640.56, Grace Kim 4,574.23, Maya Patel 3,644.56, Chloe Dubois 2,667.93 — and the gap column prints each logo's distance over the line, 5,085.27 down to 490.85, ordered biggest first. The scalar re-derives from the same CTE, so the mean and the comparison share one population by construction — the empty-inner-query failure mode (a filtered CTE returning no mean, silently emptying the bench) is the follow-up the panel fishes for. The distractors each break differently: SUM in the comparison breaks the query outright; MAX makes the bench empty (nothing beats the max); < selects the below-mean tail; ASC flips the targeting order; id in the fold key collapses the CTE to 103 per-period rows and the mean becomes the 338.19 ticket average. The read for growth: 5 of 16 logos carry the upside, and the bench's smallest member is 490.85 over — the pipeline conversation starts there, not at the top.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-period seat-line revenue is the monetization pod's first chart — fold line records to SKU grain and rank. This problem drills the exact fold the seat-band report re-cuts weekly." },
    { slug: "sales-analysis-i", why: "Plan-SKU revenue beside units sold is how the pricing page gets defended — 268 starter seats at 31.01 versus 230 growth seats at 115.85 is this problem's shape at db scale." },
    { slug: "queries-quality-and-percentage", why: "Cycle-time quality reads as a ratio with a stated denominator — average days beside a percentage of stamped periods. Same division-discipline drill, Linear flavor." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor is everywhere in expansion targeting — which workspaces carry at least N periods, which plans carry at least N seats. This problem drills the group-level gate." },
    { slug: "immediate-food-delivery-ii", why: "Share of seat changes stamped inside the promised window versus late — the onboarding-SLA read is a conditional rate over a timestamp comparison, exactly this shape." },
    { slug: "number-of-employees-who-met-the-target", why: "Teams hitting cycle targets is a conditional count against a bar — the velocity report's weekly pulse and this problem's fold are the same query in different clothes." },
    { slug: "capital-gain-loss", why: "Seat expansion minus contraction nets out to the movement number the board reads. This problem drills ordered buy/sell folds — the same add/drop algebra seat movements use." },
    { slug: "game-play-analysis-i", why: "First touch per workspace — the trial's first logged activity — anchors every cohort Linear builds. MIN-over-window is the shape." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-period workspace is the intensity crown on this db. Argmax with a subquery guard is exactly how the top-of-ladder read is written." },
    { slug: "find-users-with-high-token-usage", why: "Usage-line outliers flag workspaces outgrowing their plan — the expansion-signal query is a threshold fold over per-account usage, this problem's exact shape." },
    { slug: "combine-two-tables", why: "Workspaces LEFT JOINed to periods: the whitespace read. A workspace with no period is whitespace, a period with no workspace is corruption — choosing the join type is the business statement." },
    { slug: "confirmation-rate", why: "Triage outcomes arrive with gaps — COALESCE turns missing confirmation data into an explicit rate instead of a silent NULL. The drills the triage-funnel denominator needs." },
    { slug: "find-churn-risk-customers", why: "Churn risk is an anti-join over dormancy — workspaces with no recent activity against a dated cutoff. The same shape drives Linear's winback calendar." },
    { slug: "net-revenue-retention", why: "NRR is the metric Linear's board actually manages — cohort revenue walks with expansion and churn netted. This problem is that walk at practice scale." },
    { slug: "mrr-waterfall", why: "Seat adds, seat drops and churn roll into a movement waterfall — LAG over period status transitions, the expansion story in one query." },
    { slug: "growth-accounting", why: "New, retained, resurrected, churned — the workspace-accounting identity that reconciles 16 workspaces period over period. LAG status classification, exactly this problem." },
    { slug: "sessionize-events", why: "Seat changes arrive in bursts — sessionizing a workspace's stamps by gap is how triage tells one expansion wave from three. This problem drills the gap-window grammar the queue runs." },
    { slug: "dau-wau-stickiness", why: "Stickiness is a ratio of two conditional counts with the denominator stated out loud — the same discipline the fate census and the stamped share run. This problem drills it at practice scale." },
    { slug: "rolling-7d-actives", why: "Rolling windows over the period spine — the velocity call's moving baseline. This problem drills the frame discipline the two-period walk teaches, at a window width the board actually uses." },
    { slug: "find-bursty-behavior", why: "Expansion bursts versus steady cadence is a variance story per workspace — 251 seat lines over 103 periods hide both shapes. This problem drills burst detection over event streams." },
    { slug: "calculate-orders-within-each-interval", why: "Cycle-time bucketing — how many periods landed in each day band of the 2-to-4 spread — is this problem's interval fold, and the funnel's honest zeros live in the empty bands." },
    { slug: "median-time-to-convert", why: "The 2.98-day cycle average has a median the board never sees — trials converting on the tail move the mean, not the median. This problem drills the percentile fold that catches it." },
    { slug: "find-loyal-customers", why: "Repeat workspaces — logos with periods in consecutive cycles — are the retention cohort NRR is built on. This problem drills the consecutive-presence fold the growth pod runs weekly." },
    { slug: "rfm-segmentation", why: "Recency, frequency, monetary on 16 logos — the same three folds the expansion targeting deck is built from. This problem drills banded scoring that must reconcile to the base." },
    { slug: "usage-tier-percentiles", why: "Seat tiers by percentile — the seat-band census's statistical cousin. This problem drills NTILE and percentile cuts where ties can split peers, the exact trap the ladder lesson teaches." },
    { slug: "same-day-sale", why: "Same-day seat changes are the instant-expansion signal — a timestamp-equality conditional count over the stamp. This problem drills the date-truncation comparison the SLA reads use." },
    { slug: "cohort-repeat-revenue", why: "Cohort revenue walks — each signup month's logo set followed forward — are the LAG-over-cohorts shape the velocity deck runs. This problem drills the cohort spine end to end." },
    { slug: "winback-recovery", why: "Churned-to-resurrected workspaces are the growth-accounting quadrant the board reads beside NRR. This problem drills the reappearance detection the winback calendar runs on." },
    { slug: "user-purchase-platform", why: "The rail split — card self-serve 16 legs / 37,364.00 versus wire enterprise 11 / 32,248.00 — is a platform attribution fold. This problem drills per-channel revenue with the join done once." },
    { slug: "spend-histogram", why: "Spend distribution across the 16 logos — the concentration read (63.5% with the top spenders) as a histogram. This problem drills banded counts whose arms must foot to the base." },
    { slug: "the-number-of-users-that-are-eligible-for-discount", why: "Eligibility is a threshold over a fold — which workspaces clear the discount bar. This problem drills the fold-then-judge shape the expansion offers run on." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Plan-mix membership — workspaces on starter AND growth but never enterprise — is three set memberships deep. This problem drills the intersection-minus-except grammar the packaging team uses." },
  ],
};
