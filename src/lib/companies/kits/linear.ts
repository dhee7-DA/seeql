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
    "Preparation strategy: the pools file carries no Linear section — **0 tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: cycle-time clocks, two-grain censuses, triage funnels, tie-heavy throughput ladders, CASE seat bands and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {violet:cycle-time clock} the Monday insights review opens with, the other rebuilds the {emerald:statement coverage census} finance reads at every close. The bar to clear: *state the stamp filter and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
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
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Two-grain workspace censuses",
      why: "Periods and workspaces are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 workspaces while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which column is load and which is coverage — is the habit being graded. The ratio (5.6 versus 9.5) is the intensity read that decides whether growth is broadening or concentrating.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Triage funnels & stage rates",
      why: "The fate census is Linear's heartbeat: active-billed, expansion-in-flight, trial, churned — each a conditional count over a status or timestamp. The trap is calling an in-flight period 'active' — 30 versus 52 on this db — and the second trap is the denominator: trials stay in a conversion base and drop out of a cycle-time base, and the panel wants you to say which before writing SQL.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Throughput leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four workspaces sit at 4 periods each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer workspaces, not syntax. Linear's own insights boards publish the policy; candidates are asked to defend it.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Seat bands with CASE",
      why: "Seat tiers are CASE-classified — the seat-band fold splits 251 lines into 268 sub-55 starter seats and 230 growth seats, and plan SKUs band into free/standard/business/enterprise the same way. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the expansion story, and a reordered WHEN quietly re-bands the base.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "count-salary-categories"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month period spine (2024-01 to 2025-02) is the velocity call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. Churned periods concentrate in July and November, 2 each of 7, and the walk is how that pattern gets defended.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "year-on-year-growth-rate"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — expansion-in-flight under churned, this quarter beside last — and EXCEPT answers 'which billed workspaces never stamped a seat change'. UNION dedups whole rows silently, which makes it a correctness question, not a style one. The billing anti-join (6 never-collected statements) is the same algebra pointed at money.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Nested throughput gates",
      why: "Screens escalate into staging: fold per-workspace period counts, then judge them against a computed platform mean (6.44 here — exactly four logos clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted. Linear's expansion targeting is exactly this: which workspaces run above the platform's cadence.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board gets active-billed, in-flight, trial and churned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The reconciliation identity (branches sum to COUNT(*)) is the correctness argument the panel listens for.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not settled — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the workspace world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away. The rails matter too: card legs (16, 37,364.00) self-serve, wire legs (11, 32,248.00) enterprise-invoiced.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
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
  ],
};
