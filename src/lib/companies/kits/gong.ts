// Gong — Wave-10 (Task 100), saas domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Revenue-intelligence SQL: the storefront db read as a GTM-analytics sandbox — customers are
// workspace accounts (region = market buckets), orders are subscription/billing periods
// (delivered = active seats billed 52, shipped = expansion in flight with shipped_at as the
// seat-change stamp 30, pending = trial/PoC 14, cancelled = churned 7), order_items are
// seat/usage line records (quantity = seats, unit_price = per-seat rate), products are plan
// SKUs, suppliers = integration/marketplace partners, invoices = subscription billing
// statements, payments = payment rails, expenses = platform opex, ledger_entries = GL.
// Finance tables store INTEGER cents (dollar read = amount_cents / 100.0); orders.total and
// order_items.unit_price are REAL dollars. Angle kept DISTINCT from hubspot (inbound
// marketing CRM): conversation intelligence, deal-risk inspection, activity-to-outcome
// analytics and the forecast call. Pool provenance: company-pools.md carries NO Gong
// section (0 tagged rows) — all 10 topic slug sets and all 16 problems are theme-curated
// from the pools file's theme menu (sql rows only, no w*/d*/f* rows) and say so. Case
// briefs quote probed figures from scripts/company-facts.md (probed 2026-10-12, canonical
// cells 2026-10-16); every case slot is mechanically verified against db/custom.db by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const gongKit: CompanyKit = {
  id: "gong",
  domainId: "saas",
  name: "Gong",
  tagline: "Revenue intelligence: deal risk, engagement, forecast calls",
  accent: "text-cyan-300",

  brief: [
    "**Gong** is the revenue-intelligence platform that records every customer conversation — calls, emails, meetings — and turns them into pipeline analytics, deal warnings and the weekly forecast call. The analyst reality underneath the brand: a period whose buyer never engaged is a deal with no next step, and that cohort is a first-class object here, not noise. This kit maps the storefront db onto that world: 16 customers rows are workspace accounts, 103 orders are subscription periods worth **34,833.28**, and 251 order_items are seat/usage lines — quantity = seats, unit_price = per-seat rate. The stage map is fixed: delivered = {emerald:active seats billed} (52, 50.5%), shipped = expansion in flight (30) with `shipped_at` as the seat-change stamp, pending = trial/PoC (14), cancelled = {rose:churned} (7, 6.8%).",
    "The data org reads one engagement spine at three grains. A period books at `created_at` and gets stamped the day its seats actually change — **82 of 103 periods** carry the stamp (79.6% engagement coverage), averaging **2.98 days** booking-to-engagement with a 2–4 day spread, and the 14 pending trials have none yet — a population definition, not a cleanup job. Money sits one layer down in the billing tables — 28 invoices and 27 payments in INTEGER cents, where the dollar read is `amount_cents / 100.0` — and concentration is the third story: **63.5%** of the book sits with accounts whose lifetime spend crosses 3,000 (71.2% above 2,000).",
    "Interview screens are deal-inspection shaped: census, then denominator, then the follow-up that asks who never engaged. A loop opens with a **two-grain market census** — EU runs 45 periods from just 8 accounts (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into an engagement rate where the interviewer asks the denominator out loud (*'do pending trials count in your base?'*), then into the account leaderboard where four accounts sit tied at 4 periods and rank semantics become a policy call. Gong's signature twist is the {rose:status-lie probe}: an invoice claims 'paid' while the payment log holds zero rows — candidates who trust the claim over the log fail the round.",
    "Preparation strategy: the pools file carries no Gong section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: engagement funnels, two-grain censuses, tie-heavy leaderboards, forecast-spine walks and the cents-safe billing register. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {rose:stalled-trial census} the deal-risk desk opens Monday with, the other rebuilds the {sky:uncommitted-spend register} finance walks into every forecast call. The bar to clear: *state the population and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the engagement-coverage refresh. A revenue-analytics analyst opens the pipeline dashboard before standup: did overnight bookings land, did any account get its seat-change stamp without an owner, does the one-pass status census reconcile — 52 active + 30 in flight + 14 trials + 7 churned = **103 by construction**? The {rose:stalled-trial queue} (14 periods worth 6,113.00) routes to customer success before the meeting starts, because a trial with no engagement stamp is exactly what Gong's own product would flag in someone else's pipeline. If time-to-first-engagement drifts off the **2.98-day** norm, the onboarding pod gets paged before the forecast sheet ships.",
    "**11:30 —** Midday is deal inspection. A regional VP wants the market census with periods and distinct accounts side by side (EU 45-from-8 versus US 19-from-2); the monetization pod wants the seat-band re-cut — **268 seats below the 55 line at 31.01** versus 230 above at 115.85 — to argue where expansion actually lives; a manager wants the leaderboard's four-way tie at 4 handled honestly. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the forecast-call argument*.",
    "**15:30 —** The afternoon tilts toward money and the forecast. The {rose:uncommitted-spend register} refreshes first — 6 statements worth **15,217.00** with zero settlement legs, one of them claiming 'paid' (#28, 1,756.00) — before any number reaches the forecast sheet; the void-but-settled mirror (#11, 925.00) goes to billing as a matching anomaly. Then the forecast spine walks month over month on LAG deltas — the **3,731.97** January peak against the 1,193.86 July floor — with the first row's NULL stated as baseline. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — the forecast ships or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Engagement coverage", what: "Periods with a seat-change stamp ÷ all periods booked: 82 of 103 (79.6%). The top-of-funnel number Gong's own methodology would demand — the 14 pending trials are 'not yet engaged', never a silent zero." },
    { name: "Time-to-first-engagement", what: "Booking to seat change (created_at → shipped_at) over stamped periods only: 2.98-day average, range 2–4. The population definition ships with the number — open trials have no engagement yet and must not dilute it." },
    { name: "Stalled-trial count", what: "Pending (trial/PoC) share of booked periods: 14 of 103, worth 6,113.00 — EU 6, APAC 5, US 3, LATAM confidently 0. The deal-risk queue: accounts that started and never moved." },
    { name: "Market intensity", what: "Periods per account at two grains: EU 45-from-8 (5.6) versus US 19-from-2 (9.5), APAC 37-from-5, LATAM 2-from-1. Load versus coverage — the census that decides where the account teams spend time." },
    { name: "Logo churn", what: "Cancelled share of booked periods: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%. The churn cohort map that feeds the winback calendar; LATAM's 0 rides on a 2-period base." },
    { name: "Touch depth", what: "Seat/usage lines per period: 251 lines across 103 periods (2.44), 498 seats billed. Expansion shows up as new lines on existing periods before it shows up anywhere else." },
    { name: "Seat-band mix", what: "Seats below the 55 rate line versus above: 268 seats averaging 31.01 against 230 averaging 115.85. The plan-tier story that decides whether growth is broad-based or concentrated in big-rate lines." },
    { name: "Uncommitted-spend exposure", what: "Statements with zero settlement legs: 6 worth 15,217.00 — 5 genuinely open (13,461.00) plus one claiming 'paid' (#28, 1,756.00). The register finance walks into every forecast call." },
  ],

  topics: [
    {
      name: "Engagement funnels & conditional counts",
      why: "Every Gong screen opens with the funnel: periods booked, stamped as engaged, renewed to term. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight period 'billed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain market censuses",
      why: "Periods and accounts are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "number-of-rich-customers"],
    },
    {
      name: "Joining accounts to activity",
      why: "Accounts carry region and created_at; periods inherit them through joins, and the join type decides who survives. A period without an account is corruption; an account without periods is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Account leaderboards & ties",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four accounts sit at 4 periods each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer accounts, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Deal-risk banding with CASE",
      why: "Risk tiers are CASE-classified — at-risk, watch, healthy — with fixed edges the methodology publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the risk report, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Forecast spine & LAG deltas",
      why: "The 14-month booking spine (2024-01 to 2025-02) is the forecast call's home turf: prior month beside current, delta rounded, the 3,731.97 January peak and the 1,193.86 July trough named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — in-flight under churned, this quarter beside last — and EXCEPT answers 'which signed accounts never engaged'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Nested folds & tier gates",
      why: "Screens escalate into staging: fold per-account period counts, then judge them against a computed platform mean (6.44 here — exactly four accounts clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets billed, in-flight, trial and churned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Billing register & cents discipline",
      why: "Booked is not committed — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the conversation world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the uncommitted register.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "gong-t1",
      q: "Your deal-inspection report joins workspace accounts to subscription periods. When do you INNER and when do you LEFT — and what silently breaks if you filter a stamped column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins periods to accounts: a period with no account row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A deal-risk report must be LEFT from accounts: the accounts with no engagement ARE the answer, arriving with NULL period columns. The classic break: filtering shipped_at IS NOT NULL in WHERE after the LEFT JOIN kills every NULL-payload row — the LEFT quietly became an INNER and the never-engaged cohort vanished while the query looked valid. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero — all 16 accounts appear in the period table somewhere — and proving that zero is itself the analyst's job, because Gong's whole thesis is that absence of activity is a finding, not an empty cell.",
      tag: "joins",
    },
    {
      id: "gong-t2",
      q: "Four accounts tie at 4 periods on the engagement leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count lands on 10, implying phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose account team gets credit. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. On a leaderboard that feeds account-planning headcount, an arbitrary tie split is a staffing decision made by accident.",
      tag: "windows",
    },
    {
      id: "gong-t3",
      q: "The census shows 103 periods and 16 accounts; EU shows 45 periods and 8 accounts. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts period rows after the join — one row per period, so an account with 24 periods contributes 24. COUNT(DISTINCT customer_id) folds those rows back to accounts — EU's 45 periods collapse to 8 logos. Neither is wrong: periods measure load and touch volume, accounts measure installed base and coverage. The ratio — 5.6 periods per account in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for seat lines and COUNT(*) silently counts seat lines, not periods — 251 of them. Gong's analysts live on this two-grain read because the product itself distinguishes accounts-with-activity from activity-without-accounts; saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "gong-t4",
      q: "shipped_at is NULL until the seats actually change. What is your policy for the time-to-first-engagement report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped periods have an engagement latency, so the report measures booking-to-seat-change for the 82 of 103 periods that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the engaged subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 churned rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day engagements for trials that never started, and a fabricated engagement is precisely the false positive Gong's deal warnings exist to prevent. A report whose WHERE clause is doing definitional work without saying so is exactly what a Gong reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "gong-t5",
      q: "The forecast review wants billed value per market for markets carrying at least ten periods. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, trial and churned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-period floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to periods versus to dollars. On this db the floor decides which markets even appear: only EU (45), APAC (37) and US (19) clear ten periods, and LATAM's two never survive the gate. The strong answer places every filter by asking: is this a fact about one period, or about a market?",
      tag: "pipeline",
    },
    {
      id: "gong-t6",
      q: "WHERE periods > (SELECT AVG(periods) FROM per_account_fold) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and count > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 periods over 16 accounts produce a mean of 6.44, and exactly four accounts clear it — the 24, 17, 14 and 13 period ladders — so the gate is worth running. On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each account to ITS market's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "gong-t7",
      q: "The forecast trend buckets bookings by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the forecast becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and quarter-end is exactly when renewals land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month on the forecast sheet. Forecast discipline is date discipline: the spine, the window and the edge row are where trend reports go wrong, and Gong's forecast call reads all three out loud before anyone argues about the number.",
      tag: "dates",
    },
    {
      id: "gong-t8",
      q: "Finance says a renewal statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level register, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-committed, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the forecast call does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "gong-mcq-1",
      prompt: "A subscription period's status reads 'shipped'. In this kit's Gong stage map, what happened?",
      choices: ["Active seats billed — the term completed and counts as kept", "Expansion in flight — stamped the day the seats changed", "Churned — cancelled mid-term", "Trial/PoC — awaiting conversion"],
      answer: 1,
      why: "The stage map is fixed: shipped = expansion in flight (30 of 103 periods), and shipped_at is the seat-change stamp. It is engagement without term completion.",
      notes: [
        { choice: 0, why: "Active-billed is 'delivered' — 52 periods. Calling in-flight periods billed inflates the kept number before a single term finishes." },
        { choice: 3, why: "Trial/PoC is 'pending' — 14 periods with no seat-change stamp yet. Pending is not expansion; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "gong-mcq-2",
      prompt: "Engagement coverage is stamped periods ÷ which population? The db holds 82 stamped, 14 pending trials and 7 churned of 103 booked.",
      choices: ["Stamped + churned only (82/89 = 92.1%)", "All periods booked (82/103 = 79.6%)", "Delivered periods only (52/82)", "Distinct accounts (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL periods booked — pending trials stay in the denominator because 'not yet engaged' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pending inflates the rate to 92.1% by deleting the cohort the deal-risk desk exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is term completion, the stamp is engagement. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "gong-mcq-3",
      prompt: "EU carries 45 periods from 8 accounts. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to accounts (8). The gap between them — 5.6 periods per account — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every period has an account. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not accounts — a third grain nobody asked for. The census is periods AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "gong-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to churned periods only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the churn share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the churn map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "gong-mcq-5",
      prompt: "Keep only accounts carrying at least 10 subscription periods. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY account HAVING COUNT(*) >= 10", "WHERE periods >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A period-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the embedded tier — 24, 17, 14 and 13 periods — clears a 10-period bar per account.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'periods' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "gong-mcq-6",
      prompt: "The forecast spine walks booked value by month: the first row (2024-01, 3,731.97) shows NULL in the step-delta column. What goes on the slide?",
      choices: ["Coalesce it to 0.00 so the chart renders", "Report it as NULL labelled 'baseline' — there is no prior month to fetch", "Drop the first month from the spine", "Replace LAG with LEAD so the delta exists"],
      answer: 1,
      why: "LAG has nothing before the first row, so the delta is NULL by definition — the baseline. Coalescing to zero would read as a flat month; dropping the month hides the spine's start from the same chart that quotes the 3,731.97 peak.",
      notes: [
        { choice: 0, why: "A 0.00 delta reads as 'no movement', which is a fabricated forecast claim — NULL is the honest baseline." },
        { choice: 2, why: "Dropping 2024-01 removes the peak month from the walk and every cumulative total shifts. The edge row is part of the spine." },
      ],
      difficulty: "medium",
    },
    {
      id: "gong-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending trials double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 periods.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "gong-mcq-8",
      prompt: "A staging-table risk list uses account_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
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
      id: "gong-mcq-9",
      prompt: "A board stack puts in-flight periods under churned periods in one layout, built with UNION. A reviewer says one account's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same account, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same account, same counts, no market or branch label — collapse into one, and the board loses an account with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "gong-mcq-10",
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
      id: "cs-gong-1",
      tier: "easy",
      topic: "j2",
      universe: "funnel",
      title: "The stalled-trial census",
      brief:
        "Gong-flavored brief on the storefront db: Monday's deal-risk review opens with the stalled-trial census — the subscription periods sitting in trial/PoC (status 'pending') that never engaged, the distinct accounts stalling, and the booked trial value at risk. Probed facts: 14 of 103 periods are stalled trials worth 6,113.00 in total; the market cut reads EU 6 trials from 3 accounts at 2,675.29, APAC 5 from 4 at 1,966.28, US 3 from 1 at 1,471.43 — and LATAM carries zero stalled trials (its 2 periods are both delivered, so no row appears; the absence is a confident zero). The review reads biggest stall count first.",
      ask: "Return each market with its stalled-trial count, distinct stalling accounts and booked trial value to 2 decimals, biggest stall count first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS stalled_trials,\n       COUNT({1} o.customer_id) AS accounts,\n       ROUND(SUM(o.total), {2}) AS trial_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = {3}\nGROUP BY c.region\nORDER BY stalled_trials {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the account deduplicator",
          why: "COUNT(DISTINCT o.customer_id) folds repeat trials back to accounts: EU reads 3, not 6. SUM(DISTINCT …) adds the id codes together and MAX(DISTINCT …) reports the largest id — neither is a census.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the trial-value precision",
          why: "Money reports to 2 decimals — EU's 2,675.29. ROUND(…, 1) prints 2,675.3 and the register stops reconciling with the 6,113.00 trial-value foot the deal-risk desk quotes on the same slide.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the trial literal",
          why: "Stalled trials are status 'pending' — 14 periods on the db, concentrated 6 in EU, 5 in APAC, 3 in US. 'shipped' would count the 30 in-flight expansions as stalled and page customer success about healthy accounts.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-risk-first direction",
          why: "The review reads biggest stall count on top: EU 6, APAC 5, US 3. ASC would open the meeting on the US's 3 trials — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "ASC", "'shipped'", "o.status"],
      walkthrough:
        "One join, one fold, four columns at two grains. The join attaches every period to its account's market — the WHERE keeps only the 14 pending trials — and GROUP BY region folds them into three rows where COUNT(*) reads stalls (EU 6, APAC 5, US 3), COUNT(DISTINCT o.customer_id) reads stalling accounts (3 / 4 / 1), and ROUND(SUM(o.total), 2) reads booked trial value (2,675.29 / 1,966.28 / 1,471.43), footing to the probed 6,113.00 across 14 trials. LATAM never appears: its 2 periods are both delivered, so the missing row is a confident zero — worth stating on the slide, not fixing with a LEFT JOIN. The distractors fail honestly: SUM and MAX in the account slot add ids together or report the largest id — a census of nothing; 1 in the status literal compares text to 1 and returns zero rows; 'shipped' counts the 30 healthy in-flight expansions as stalled; o.status as the status literal matches every row to itself and floods the census with all 103 periods; ASC opens the review on the smallest queue. The two-grain pairing is the read: EU's 6-from-3 says concentration (few accounts stalling repeatedly) while APAC's 5-from-4 says breadth — one query, two deal-risk plays.",
    },
    {
      id: "cs-gong-2",
      tier: "medium",
      topic: "j1",
      universe: "refund-audit",
      title: "The uncommitted-spend register",
      brief:
        "Gong-flavored brief on the storefront db: before any number reaches the forecast call, finance walks the uncommitted-spend register — renewal statements with zero settlement legs, where the claimed status and the payment log disagree. Probed facts: 6 statements carry no payment rows, worth 15,217.00 — five genuinely open (#24 4,937.00, #26 3,562.00, #27 2,794.00, #21 1,295.00, #18 873.00) and one that claims 'paid' with no legs (#28, 1,756.00). The register reads biggest billed first, and #28 is the standing lesson: the status column is a claim, the payment log is the ledger of record.",
      ask: "Return each uncommitted statement with its id, claimed status and billed dollars, biggest billed first.",
      template:
        "SELECT i.id AS statement_id,\n       i.status AS claimed_status,\n       ROUND(i.amount_cents / {1}, 2) AS billed\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {3}\nORDER BY billed {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements carry INTEGER cents — 493,700 prints as 4,937.00 only under the /100.0 read. Dividing by 10.0 inflates every row tenfold, and dividing by 1 leaves raw cents on the forecast sheet.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the keep-unmatched join",
          why: "The register needs statements with NO payment rows, so payments must be LEFT-joined and the unmatched kept. INNER JOIN drops every one of the six rows — the register empties exactly when the risk is real.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-legs guard",
          why: "p.id IS NULL keeps only statements the LEFT JOIN failed to match — the six with zero legs. IS NOT NULL flips the register to the settled 22 legs and the forecast sheet reads committed spend as exposure.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The forecast call reads the biggest exposure first: #24 at 4,937.00 leads, #18 at 873.00 trails. ASC buries the 4,937.00 headline at the bottom of the sheet.",
        },
      ],
      distractors: ["INNER", "NOT NULL", "10.0", "ASC", "1", "RIGHT"],
      walkthrough:
        "One anti-join, three columns, six rows. The LEFT JOIN attaches settlement legs to statements; WHERE p.id IS NULL keeps the six statements that matched nothing — #24 4,937.00, #26 3,562.00, #27 2,794.00, #28 1,756.00, #21 1,295.00, #18 873.00 — footing to the probed 15,217.00, of which 13,461.00 is genuinely open and 1,756.00 is the 'paid' claim with no cash behind it. The cents discipline holds: amount_cents / 100.0 turns 493,700 into 4,937.00, and any other divider quietly rescales the register. The distractors fail honestly: INNER JOIN drops the unmatched rows entirely — the register empties precisely when risk exists; NOT NULL flips the filter to the settled legs, replacing exposure with committed spend; 10.0 and 1 rescale the money tenfold or leave raw cents; ASC hides the 4,937.00 headline; RIGHT JOIN keeps the payment side and loses the register's grain. The claimed_status column is the conversation-intelligence twist: five rows say 'open' and agree with the log, one row says 'paid' and the log says nothing — Gong's own product lesson, that claims without evidence are the first thing to flag.",
    },
  ],

  problems: [
    { slug: "feature-adoption-windows", why: "Engagement is measured in windows — did the account change seats within N days of booking? Conditional averages over adoption windows are exactly this shape." },
    { slug: "immediate-food-delivery-i", why: "Periods engaged within the promised window versus late ones — the promptness share is a conditional rate over a timestamp comparison, the same shape as Gong's onboarding-SLA read." },
    { slug: "fix-names-in-a-table", why: "Account-name hygiene before any join: exports arrive title-case-broken, and 'acme corp' versus 'Acme Corp' silently splits one account into two — and one pipeline into two halves." },
    { slug: "net-revenue-retention", why: "Seat expansion and contraction roll up to NRR — the metric Gong's forecast call actually manages. Cohort revenue walks with LAG are exactly this problem's shape." },
    { slug: "ltv-cac-payback", why: "The CRO org's unit-economics screen: lifetime spend per account against acquisition cost, payback in periods. On this db the lifetime ladder runs from 7,262.35 down to 444.8 — a two-stage fold." },
    { slug: "mrr-waterfall", why: "Forecast calls argue in movements — new, expansion, contraction, churn. Classifying period-over-period deltas into movement buckets is the LAG-waterfall shape this problem drills." },
    { slug: "week-over-week-churn", why: "The churn walk feeds the winback calendar: 7 churned periods on this db, concentrated 2 each in July and November. Weekly churn pivots are exactly this problem's shape." },
    { slug: "growth-accounting", why: "Gong's growth board reads new minus churned with expansion in between — the accounting identity every period must satisfy. LAG-status classification is the engine behind it." },
    { slug: "cohort-retention-matrix", why: "Engagement cohorts: accounts that booked together, retained together? Cohort-offset pivots turn the period table into the retention matrix leadership argues over." },
    { slug: "median-time-to-convert", why: "Time-to-convert is the engagement clock Gong sells itself on — booking to stamped seat change. Median emulation over a cohort is the hard-mode version of the 2.98-day read." },
    { slug: "winback-recovery", why: "Churned is not gone: which accounts came back after a cancelled period? Winback windows over the 7-churned cohort are the recovery-read shape this problem teaches." },
    { slug: "dau-wau-stickiness", why: "Engagement stickiness — active touch weeks over active touch days — is how conversation-analytics adoption is graded. Trailing-window distinct counts are exactly this shape." },
    { slug: "keep-latest-dedupe", why: "Conversation records arrive duplicated across syncs; the latest touch wins. ROW_NUMBER dedupe with a tiebreak is the hygiene pass every activity feed needs before it feeds a leaderboard." },
    { slug: "null-blank-audit", why: "The status-lie lesson at column scale: which rows claim a state the log cannot support? Conditional SUMs over NULL and blank arms are the audit that catches them — the register's daily cousin." },
    { slug: "customer-order-frequency", why: "Touch cadence per account — periods per month, accounts going quiet. Conditional HAVING folds over billing periods are the activity-cadence screen Gong runs on every account plan." },
    { slug: "customers-who-bought-all-products", why: "Full plan-family coverage: which accounts touch every SKU family they subscribe to? Relational division is the coverage-audit shape behind 'is this account single-threaded on one plan?'." },
  ],
};
