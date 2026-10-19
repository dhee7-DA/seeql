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
    "Preparation strategy: the pools file carries no Gong section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: engagement funnels, two-grain censuses, tie-heavy leaderboards, forecast-spine walks and the cents-safe billing register. Do the topics in order, then run all six case studies on the live storefront db — spaced practice rather than one sitting: the {rose:stalled-trial census} the deal-risk desk opens Monday with, the {sky:uncommitted-spend register} finance walks into every forecast call, the {emerald:engagement ladder} with its four-way tie, the one-pass {emerald:stage grid}, the {violet:never-invoiced queue} the deal desk refreshes for coverage, and the {sky:forecast spine walk} with its LAG steps. The bar to clear: *state the population and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "sessionize-events", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Two-grain market censuses",
      why: "Periods and accounts are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "number-of-rich-customers", "basket-depth-aov", "rolling-7d-actives"],
    },
    {
      name: "Joining accounts to activity",
      why: "Accounts carry region and created_at; periods inherit them through joins, and the join type decides who survives. A period without an account is corruption; an account without periods is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus", "the-most-recent-orders-for-each-product"],
    },
    {
      name: "Account leaderboards & ties",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four accounts sit at 4 periods each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer accounts, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "premier-league-table-ranking", "second-highest-salary"],
    },
    {
      name: "Deal-risk banding with CASE",
      why: "Risk tiers are CASE-classified — at-risk, watch, healthy — with fixed edges the methodology publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the risk report, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "find-churn-risk-customers", "top-percentile-fraud", "rfm-segmentation"],
    },
    {
      name: "Forecast spine & LAG deltas",
      why: "The 14-month booking spine (2024-01 to 2025-02) is the forecast call's home turf: prior month beside current, delta rounded, the 3,731.97 January peak and the 1,193.86 July trough named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine", "year-on-year-growth-rate", "customers-with-strictly-increasing-purchases", "sales-by-day-of-the-week"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — in-flight under churned, this quarter beside last — and EXCEPT answers 'which signed accounts never engaged'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Nested folds & tier gates",
      why: "Screens escalate into staging: fold per-account period counts, then judge them against a computed platform mean (6.44 here — exactly four accounts clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments", "repeat-purchase-rate"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets billed, in-flight, trial and churned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "same-day-sale"],
    },
    {
      name: "Billing register & cents discipline",
      why: "Booked is not committed — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the conversation world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the uncommitted register.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "ar-aging-schedule"],
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
    {
      id: "gong-t9",
      q: "The engagement board orders its running total by created_at and two periods share a booking day. ROWS versus RANGE — when does the difference decide money?",
      a: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE admits peers: every row tied on created_at joins the running sum in one step, so the cumulative jumps by two periods' value at once. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly row by row, which is what a period-by-period walk means. On a month spine ties are rare; at period grain they are guaranteed — this db holds same-day pairs like 2024-01-02. The rule on the floor: any running total that feeds a forecast slide states its frame explicitly, because the two frames print different money on tie days and only one of them is the number the slide claims.",
      tag: "windows",
    },
    {
      id: "gong-t10",
      q: "Walk me through stacking the in-flight register under the churned register with UNION ALL — and the comment you write above it.",
      a: "Both branches project the same columns — account, market, periods, booked value — plus a branch label ('in-flight' / 'churned') so the stack reads as one table. The label is load-bearing: it makes identical rows impossible, because a row can only carry one branch's tag. And that is the comment I write: UNION ALL chosen because the branch labels guarantee no cross-branch duplicates — bare UNION would silently dedup whole rows, and a board stack that loses an account to byte-equality loses it without an error. This db's two error modes are real: UNION would collapse any two branches that happen to emit the same counts for the same account. Set ops are correctness decisions, not style.",
      tag: "sets",
    },
    {
      id: "gong-t11",
      q: "EXCEPT just removed rows you expected to keep. Walk me through what it actually compares.",
      a: "EXCEPT is a whole-row set difference: it returns distinct rows of the left SELECT that do not appear as whole rows in the right SELECT — column count and type compatibility must match, aliases need not. Two properties bite. First, both sides dedup: a value appearing twice on the left survives once, so EXCEPT answers 'which accounts', never 'how many rows'. Second, set ops treat NULLs as equal for comparison, so NULL-bearing rows compare cleanly here while ordinary WHERE predicates would not. The canonical read on this db: shipped-accounts EXCEPT delivered-accounts returns exactly Liam O'Brien — one account with expansion and no completed term. When the result looks empty, I diff the two sides' counts and shapes before doubting the data.",
      tag: "sets",
    },
    {
      id: "gong-t12",
      q: "Three ways to find accounts above the platform mean of 6.44 periods — derived table, correlated subquery, window. When does each win?",
      a: "Derived: fold periods per account in a CTE, cross-join the scalar mean, filter in the outer WHERE — one pass per fold, the workhorse, and the empty-inner-query behavior (NULL mean, zero rows) is stated up front. Correlated: compare each account to a mean recomputed for ITS market — 5.6 in EU, 7.4 in APAC — which answers the per-market question the scalar cannot, at re-execution cost per row. Window: AVG(COUNT(*)) OVER () alongside the fold keeps every row and its mean in one result — best when the board wants the bar printed beside every account. On this db the platform bar clears exactly four accounts — the 24, 17, 14 and 13-period ladders — and I can name them, which is the real test of having run it.",
      tag: "subqueries",
    },
    {
      id: "gong-t13",
      q: "Why does the close demand the one-pass FILTER census instead of four sequential queries?",
      a: "Because the census is an identity, not four numbers: 52 delivered + 30 shipped + 14 pending + 7 cancelled must reconcile to the 103 COUNT(*) by construction, and only a single scan guarantees the branches were cut from the same rows at the same moment. Four sequential queries can drift — a retry lands between them, a filter edits in one and not the others — and a board whose branches sum to 102 or 104 ships a reconciliation incident. COUNT(*) FILTER (WHERE …) branches each aggregate independently in one pass; SUM(CASE WHEN … THEN 1 ELSE 0 END) is the portable twin when the warehouse lacks FILTER. The audit rule: the branch sum equals the row count, or the query does not ship.",
      tag: "aggregation",
    },
    {
      id: "gong-t14",
      q: "NOT IN almost shipped an empty dunning queue. NOT EXISTS or NOT IN — what do you standardize on, and why?",
      a: "NOT EXISTS, by default. NOT IN materializes the subquery's list and evaluates x NOT IN (…) as a chain of comparisons — one NULL in the list makes every row UNKNOWN, and the whole report empties while looking valid. NOT EXISTS short-circuits on the first match and treats NULLs as what they are: rows that simply do not join. The LEFT JOIN … IS NULL anti-join is the third form and reads best when the unmatched side's columns should appear; on this db the account-to-statement anti-join returns a confident zero, and I still write it as NOT EXISTS so a NULL that lands in staging tomorrow cannot silently blank the queue. If NOT IN must be used, the subquery column gets an explicit IS NOT NULL guard and a comment saying why.",
      tag: "nulls",
    },
    {
      id: "gong-t15",
      q: "How do you turn created_at and shipped_at TEXT stamps into the 2.98-day engagement clock — and where do the edges bite?",
      a: "julianday() converts both TEXT stamps to real day numbers and the difference is the latency; over the 82 stamped periods it averages 2.9756, which the deck quotes as 2.98 with a 2–4 day spread. Banding with CAST(… AS INT) gives the distribution — 27 periods at 2 days, 30 at 3, 25 at 4 — which is the histogram behind 'is onboarding drifting?'. The edges: the WHERE shipped_at IS NOT NULL ships with the query, because the 21 unstamped rows are a population definition, not missing data; and '%Y-%m' keys any monthly roll-up, since '%m' merges the two Januaries. Whole-day inputs, fractional mean — the 2.98 is a weighted center, and I can produce the 27/30/25 split that proves it.",
      tag: "dates",
    },
    {
      id: "gong-t16",
      q: "Account names arrive from the CRM as 'acme corp' and 'Acme Corp'. What breaks, and what is the hygiene pass?",
      a: "Grouping and joining by name splits one account into two: the leaderboard carries duplicate rows, period counts halve, and the two-grain census disagrees with itself — every downstream number inherits the split. The hygiene pass runs at load, not per query: trim, collapse internal whitespace, and normalize case into a canonical name column keyed by the stable account id. In queries, UPPER() or LOWER() around a join key is a bandage that also kills index use — non-sargable exactly where the volume is. The rule I state: the name is a display attribute, the id is the join key, and any report that groups by a free-text column says so in its title, because 'Acme Corp versus acme corp' is two accounts to the GROUP BY and one account to the account team.",
      tag: "casing",
    },
    {
      id: "gong-t17",
      q: "The QBR deck tiers 16 accounts into quartiles by booked value. NTILE, PERCENT_RANK or CASE bands — pick one and defend it.",
      a: "NTILE(4) when the deck wants four equal groups: over 16 accounts it deals 4/4/4/4 with tile edges at 444.80–705.39, 737.68–985.65, 1,098.60–2,667.93 and 3,644.56–7,262.35 — clean for a fixed headcount. PERCENT_RANK when the membership must stay stable as accounts come and go: it reports each account's 0–1 position, and 'top decile' survives headcount changes that would reshuffle NTILE tiles. CASE bands when the methodology publishes fixed edges — this kit's 2,000 and 3,000 concentration lines are policy constants, and a tier built on them must not move when an account churns. The defense is the failure mode: NTILE reshuffles on churn, PERCENT_RANK wobbles at ties, CASE needs its edges maintained — pick the failure you can live with.",
      tag: "windows",
    },
    {
      id: "gong-t18",
      q: "Give me each account's most recent stamped period. MAX-join, correlated subquery or ROW_NUMBER — and where do ties bite?",
      a: "The MAX-join filters orders to created_at = (SELECT MAX(created_at) …) grouped per account and then joins — fast, but it breaks when two periods share the top timestamp: both rows survive and the 'one latest period per account' claim is quietly false. The correlated version answers the same question and re-runs per account. ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) filtered to rn = 1 is the safe form: deterministic under ties, because the id tie-break is a stated policy, not scan luck. On this db all 16 accounts resolve to one row each, but same-day booking pairs exist (2024-01-02 carries two), so the tie path is live the day someone books twice. I ship ROW_NUMBER and say the tie-break out loud.",
      tag: "windows",
    },
    {
      id: "gong-t19",
      q: "The audit screen filters statements by customer_id and issued_on and the plan reads a full scan. Walk me through making it sargable.",
      a: "First read the plan: EXPLAIN QUERY PLAN showing SCAN means no index was consulted. Then shape the predicates so indexed columns stand bare — customer_id = ? is seekable; STRFTIME('%Y', issued_on) = '2024' is not, because the function wraps the column; the sargable form is issued_on >= '2024-01-01' AND issued_on < '2025-01-01'. A composite index on (customer_id, issued_on) serves both predicates in one seek — equality column first, range column second, since the range breaks further index use. The register query joins payments on invoice_id, so that FK wants its index too. On 28 statements the whole exercise is free; the habit is what transfers to the 28-million-row transcript table, where the same shape of query is the difference between a dashboard and an outage.",
      tag: "indexes",
    },
    {
      id: "gong-t20",
      q: "The account board must render identically for every analyst who runs it. What is your deterministic-ORDER-BY policy?",
      a: "Every leaderboard sorts by its metric first and a stable secondary key second: ORDER BY periods DESC, c.name — or c.id when names could ever collide. The rank window shares the same ORDER BY, so RANK's tie behavior and the row order agree. The rule exists because SQL guarantees nothing about tied rows: the four accounts tied at 4 periods will legitimately render in different sequences on different runs, and a board that flips between printouts is a board nobody trusts in the forecast call. LIMIT makes it worse — LIMIT 5 without the full tie-break can swap the last row between runs. I also write the tie-break into the query comment, because 'why does this account appear twice above that one' is a question the comment should answer before it is asked.",
      tag: "pipeline",
    },
    {
      id: "gong-t21",
      q: "Where does COALESCE belong in the engagement report — and where is it a lie?",
      a: "COALESCE belongs at the display layer, replacing NULL with a label: COALESCE(shipped_at, 'not yet engaged') is honest — it says the state out loud instead of printing a blank. It becomes a lie when it substitutes a value that participates in arithmetic: COALESCE(julianday(shipped_at) - julianday(created_at), 0) invents same-day engagements for the 14 trials and 7 churned, drags the 2.98-day average down, and pushes coverage to 100% — three fabricated claims from one function call. The spine's baseline NULL gets the same protection: COALESCE(step, 0) turns 'no prior month' into 'flat month' on the forecast sheet. Policy: NULL is 'not yet' or 'no prior', never zero; coalesce into text for humans, never into numbers for math.",
      tag: "nulls",
    },
    {
      id: "gong-t22",
      q: "The mean booked value per account is 370.15; the mean per period is 338.19. Which goes on the slide, and how do you say it?",
      a: "Whichever the slide's title claims — and the title must name the grain. 338.19 is SUM(total)/COUNT(*) over the 103 periods: every period weighs equally, so Alice Chen's 24 periods pull it toward her 7,262.35 book. 370.15 is the average of the 16 per-account means: every logo weighs equally, so Olivia Brown's single 444.80 period counts as much as Alice's 24. The gap is not an error to reconcile — it is two definitions, and 'average deal' is ambiguous until the denominator is stated. My rule: per-period means for pipeline math, per-account means for coverage and account-planning math, and the metric name carries the grain — 'mean booked per period' versus 'mean per-account lifetime value', never just 'average deal size'.",
      tag: "aggregation",
    },
    {
      id: "gong-t23",
      q: "Walk me through the four checks before the forecast register ships.",
      a: "One: the status census reconciles — 52 delivered + 30 shipped + 14 pending + 7 cancelled equals the 103 COUNT(*) by construction; a branch that breaks the identity is the incident. Two: the coverage split reads 21 exact / 1 partial / 6 none across the 28 statements, and the partial is the one worth naming — INV-2025-025's 4,000.00 paid against a 6,148.00 bill. Three: the never-settled register totals 15,217.00 across 6 statements, with INV-2025-028 flagged as the paid-claim liar — status 'paid', zero legs. Four: the ledger trial balance lands 181,080 debits against 181,080 credits, delta zero. Any check that fails holds the forecast call, because each one is a different table's claim about the same money — and the call runs on the reconciliation, not on any single table's word.",
      tag: "quality",
    },
    {
      id: "gong-t24",
      q: "The forecast call challenges your engagement rate. Defend the denominator.",
      a: "The metric is stamped periods over ALL periods booked: 82 of 103, 79.6%. The 14 pending trials stay in the base because 'not yet engaged' is precisely what the metric measures — removing them turns a coverage metric into a self-congratulation and reads 92.1%, a different number wearing this metric's name. The 7 churned stay too: they were booked, they never engaged again, and their absence of stamps is the churn story. The defense is procedural, not just arithmetic: state the population before computing ('all booked periods, including open trials'), show the branch census that reconciles to 103, and offer the alternative readings by name — 82 of 82 'of engaged accounts' is a retention stat, not coverage. On this desk the denominator is the product: Gong sells finding the accounts that have not engaged, and the denominator is where they live.",
      tag: "pipeline",
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
    {
      id: "gong-mcq-11",
      prompt: "The deal-risk desk runs SELECT COUNT(*), COUNT(shipped_at) FROM orders and gets 103 beside 82. What does the 21-row gap hold?",
      choices: ["The 7 churned periods only", "The 14 pending trials plus the 7 churned periods — every row with no seat-change stamp", "Duplicate rows a join created", "The 30 in-flight expansions, which never get stamped"],
      answer: 1,
      why: "COUNT(column) skips NULLs, so the gap is exactly the rows with no engagement stamp: 14 trials + 7 churned = 21. The 30 shipped periods all carry the stamp — shipped_at is what MAKES them in-flight.",
      notes: [
        { choice: 0, why: "Churned is only 7 of the 21. Trials miss the stamp too, and forgetting them halves the gap the desk actually monitors." },
        { choice: 3, why: "Shipped is defined BY the stamp — all 30 carry one. The unstamped population is trials and churn, never expansions." },
      ],
      difficulty: "easy",
    },
    {
      id: "gong-mcq-12",
      prompt: "A rep-coaching dashboard counts trials with COUNT(o.status = 'pending') and prints 103. Why?",
      choices: ["The column holds 103 pending rows", "The comparison returns 1 or 0 per row — never NULL — so COUNT counts every row in the table", "COUNT ignores WHERE, so the filter never applied", "SQLite rounds the boolean up to the row count"],
      answer: 1,
      why: "The boolean expression yields 1/0 integers, and COUNT counts non-NULL results — all 103. The honest one-pass forms are COUNT(CASE WHEN status='pending' THEN 1 END), SUM(CASE …), or COUNT(*) FILTER (WHERE …).",
      notes: [
        { choice: 0, why: "Pending is 14 of 103. The other 89 print 0 — and COUNT counts the zeros." },
        { choice: 2, why: "There is no WHERE here at all — and COUNT never ignores one. The bug is the boolean inside the count." },
      ],
      difficulty: "medium",
    },
    {
      id: "gong-mcq-13",
      prompt: "The market read folds each region's plan families into one cell: GROUP_CONCAT(DISTINCT p.category). The US row lists six families and never mentions Fitness. What does that tell the account team?",
      choices: ["The query dropped rows at random", "US workspaces genuinely touch 6 of the 7 families — no US line ever bought a Fitness SKU, and DISTINCT is what keeps repeat buys from masking the gap", "Fitness SKUs are out of stock in the US", "GROUP_CONCAT caps at six values"],
      answer: 1,
      why: "The roster is a distinct-value census: US covers Audio, Accessories, Video, Apparel, Electronics and Wearables — Fitness absent. EU and APAC run all 7; LATAM only 3. No error, no cap: the missing name is the finding.",
      notes: [
        { choice: 2, why: "Stock is not consulted — the fold reads order lines only. The absence is a sales fact, not an inventory one." },
        { choice: 3, why: "No cap exists. Without DISTINCT the repeats would just pad the string, hiding the very gap the roster exists to show." },
      ],
      difficulty: "easy",
    },
    {
      id: "gong-mcq-14",
      prompt: "STRFTIME('%m', created_at) collapses the 14-month booking spine to 12 rows, and January reads 5,401.47. What happened?",
      choices: ["January had a data-entry duplicate", "'%m' carries no year, so January 2024 (3,731.97) and January 2025 (1,669.50) merge into one '01' bucket", "ROUND accumulated across the year boundary", "The spine CTE deduplicated the first month"],
      answer: 1,
      why: "'%m' is month-only: two Januaries fold into one key and 3,731.97 + 1,669.50 print as a single 5,401.47. The spine shrinks from 14 buckets to 12 and every LAG step across the December-to-January boundary compares against a Frankenstein month.",
      notes: [
        { choice: 0, why: "The arithmetic is correct — on the wrong key. The sum is right; the bucket is fictional." },
        { choice: 2, why: "No rounding is involved anywhere. The fold key lost the year, which is a string-format bug, not numeric noise." },
      ],
      difficulty: "hard",
    },
    {
      id: "gong-mcq-15",
      prompt: "Every stamped period books-to-engages in a whole number of days, yet AVG(julianday(shipped_at) - julianday(created_at)) prints 2.98. Why isn't the average whole?",
      choices: ["julianday returns fractional seconds", "The 82 stamped rows split 27 at 2 days, 30 at 3 and 25 at 4 — (27×2 + 30×3 + 25×4)/82 = 2.98, a weighted mean of whole days", "NULLs were averaged as 0.5", "The engine truncates 2.9756 for display"],
      answer: 1,
      why: "The latency distribution is 27/30/25 across 2/3/4 days: 244 total days over 82 rows = 2.9756, quoted as 2.98. Whole-day inputs, fractional mean — and the 27/30/25 split is the histogram that proves it.",
      notes: [
        { choice: 0, why: "julianday differences here land on whole days — the spread is exactly 2 to 4. Fractionality comes from weighting, not precision." },
        { choice: 2, why: "The stamped-only population excludes the 21 NULLs entirely; they never enter the average, which is the point." },
      ],
      difficulty: "easy",
    },
    {
      id: "gong-mcq-16",
      prompt: "A coaching lead asks for accounts ranked outside the top three and writes WHERE RANK() OVER (ORDER BY COUNT(*)) > 3. What does SQLite say?",
      choices: ["It returns the right rows with a warning", "It errors — window results do not exist at WHERE time; rank in a CTE or derived table first, then filter the rank in the outer query", "It silently treats RANK() as 0 and returns everything", "It swaps the window for GROUP BY and still answers"],
      answer: 1,
      why: "WHERE runs before windows are computed, so the window reference is rejected outright. The fix is staging: fold and rank in a CTE, filter rn > 3 outside. Same lesson as filtering aggregates — respect the pipeline's order of operations.",
      notes: [
        { choice: 0, why: "No warning exists — this is a hard parse/eval error, which is the friendly outcome compared to a silent wrong answer." },
        { choice: 2, why: "Nothing silent happens; the parser refuses. The dangerous cousin is filtering a rank ALIAS in WHERE, which fails the same way." },
      ],
      difficulty: "medium",
    },
    {
      id: "gong-mcq-17",
      prompt: "Which accounts carry an in-flight expansion but never a completed term? The read is SELECT customer_id FROM orders WHERE status='shipped' EXCEPT SELECT customer_id FROM orders WHERE status='delivered', joined to names. What comes back?",
      choices: ["All 30 shipped-period accounts", "Exactly one account — Liam O'Brien, expansion in flight with zero delivered periods", "Every account with a pending trial", "Nothing — EXCEPT requires identical column aliases"],
      answer: 1,
      why: "EXCEPT is a distinct set difference of whole rows: 30 shipped periods collapse to their account ids, the delivered set removes everyone else, and one row survives — Liam O'Brien, the expansion pipeline's whitespace read.",
      notes: [
        { choice: 0, why: "EXCEPT dedups first: 30 periods are a handful of accounts, and most of them also carry delivered terms that get subtracted." },
        { choice: 3, why: "Aliases may differ — column count and types must match, names never do. Trial status is irrelevant to this particular set difference." },
      ],
      difficulty: "medium",
    },
    {
      id: "gong-mcq-18",
      prompt: "The leaderboard's four-way tie at 4 periods renders in a different order every run. The fix?",
      choices: ["Cast the counts to TEXT", "Add a deterministic tie-break — ORDER BY periods DESC, account name (or id) — so equal counts sort by a stable second key", "Use DENSE_RANK, which orders ties alphabetically", "Wrap the query in a transaction"],
      answer: 1,
      why: "SQL guarantees nothing about tied rows' order — the four accounts at 4 periods will legitimately shuffle between runs. A stable secondary key makes the board reproducible; the rank window should share the same ORDER BY so ties and rows agree.",
      notes: [
        { choice: 2, why: "DENSE_RANK only removes gaps after ties — it neither orders rows nor alphabetizes anything." },
        { choice: 3, why: "Transactions change durability, never presentation order. The shuffling is absent ordering, not concurrency." },
      ],
      difficulty: "medium",
    },
    {
      id: "gong-mcq-19",
      prompt: "The call-review screen filters WHERE SUBSTR(c.name, 1, 5) = 'Alice' and EXPLAIN shows a full scan. The index is on c.name. Why?",
      choices: ["SUBSTR is not allowed in WHERE", "Wrapping the indexed column in a function hides it from the index — rewrite sargably, e.g. c.name LIKE 'Alice%' or a half-open range on the column", "The index needs refreshed statistics", "Names should be stored uppercase"],
      answer: 1,
      why: "A function around the column is non-sargable: the engine cannot seek an index on expressions it must compute per row. The range-predicate rewrite lets the index do the work — same results, seekable plan.",
      notes: [
        { choice: 0, why: "It is allowed — it just cannot use the index as written. Allowed and fast are different claims." },
        { choice: 2, why: "Statistics do not rescue a rewritten expression. The predicate shape is the problem, not the planner's information." },
      ],
      difficulty: "medium",
    },
    {
      id: "gong-mcq-20",
      prompt: "Which accounts carry more periods than their OWN market's average? EU's mean is 5.6, the platform's is 6.44. Why can't one scalar subquery answer it?",
      choices: ["It can — the platform mean and the market mean are the same number", "The comparison key differs per row, so the mean must be recomputed per account's market — a correlated subquery or a market-folded derived join; the scalar platform mean answers a different question", "Correlated subqueries are unsupported in SQLite", "The market mean needs a window function or it fails"],
      answer: 1,
      why: "A scalar subquery returns one number for every row. Per-market means vary — EU 5.6, APAC 7.4, US 9.5 — so the bar must move with the row: correlate on region, or fold market means and join. On the platform bar (6.44) exactly four accounts clear; on EU's own bar (5.6) the answer set changes.",
      notes: [
        { choice: 0, why: "5.625 versus 6.44 — different baselines that clear different accounts. One number cannot serve both questions." },
        { choice: 2, why: "SQLite supports correlated subqueries fine. The limitation is conceptual: which mean the comparison uses." },
      ],
      difficulty: "hard",
    },
    {
      id: "gong-mcq-21",
      prompt: "AVG(total) over all 103 periods prints 338.19. Folding per account first and averaging the 16 per-account means prints 370.15. Which is 'the average deal', and why do they disagree?",
      choices: ["370.15 — the fold-first number; the disagreement is a rounding artifact", "338.19 weights every period equally; 370.15 weights every account equally — Alice Chen's 24 periods count once, not 24 times — so name the grain", "They must be equal by definition", "338.19 — because SQLite ignores NULLs"],
      answer: 1,
      why: "Both are real numbers answering different questions: the per-period mean is period-weighted, the per-account mean is logo-weighted. Olivia Brown's single 444.80 period counts as much as Alice's 24 in the fold-first read — a 32-point swing that decides whether 'average deal' flatters coverage or volume.",
      notes: [
        { choice: 0, why: "No artifact — a 7.9% gap from weighting. Reconciling them is impossible; naming them is the job." },
        { choice: 2, why: "Equal only when every group has the same size. Sixteen accounts carry 1 to 24 periods here." },
      ],
      difficulty: "hard",
    },
    {
      id: "gong-mcq-22",
      prompt: "The settlement audit pairs every two legs on one statement: payments p1 JOIN payments p2 ON p2.invoice_id = p1.invoice_id. Five statements carry two legs each. How many rows return, and what does the p1.id < p2.id guard change?",
      choices: ["5 rows; the guard halves it", "10 rows — each pair appears in both orders; the guard keeps one canonical ordering per pair and blocks self-pairing", "15 rows; the guard folds them to 5", "0 rows — a self-join needs a table alias per copy"],
      answer: 1,
      why: "Each 2-leg statement yields both (leg1, leg2) and (leg2, leg1) — 10 rows. p1.id < p2.id keeps exactly one orientation per pair and excludes a row pairing with itself. Without it, a duplicate-charge report double-counts and cries wolf.",
      notes: [
        { choice: 0, why: "The unguarded join doubles every pair — the audit's count is wrong before any threshold is applied." },
        { choice: 2, why: "Wrong arithmetic on both ends: 2 legs pair with 1 other leg, not 2, and nothing folds them post hoc." },
      ],
      difficulty: "hard",
    },
    {
      id: "gong-mcq-23",
      prompt: "NTILE(4) OVER (ORDER BY booked_value) tiers the 16 accounts for the QBR deck. What lands in tier 1?",
      choices: ["The four biggest accounts", "The four smallest — 444.80 to 705.39 booked — because NTILE deals tiles over ascending order by default", "A random quarter of accounts", "The accounts below the 2,000 concentration line"],
      answer: 1,
      why: "NTILE(4) over 16 rows deals 4 per tile in ORDER BY sequence, ascending by default — tile 1 is the bottom quartile. If tier 1 should mean biggest, order DESC and say so; the silent version inverts the whole QBR story.",
      notes: [
        { choice: 0, why: "That is tile 4 on the default ordering — the classic silent inversion that ships a deck arguing against itself." },
        { choice: 3, why: "NTILE never reads thresholds — fixed edges are CASE work, and the 2,000 line is policy, not a tile boundary." },
      ],
      difficulty: "hard",
    },
    {
      id: "gong-mcq-24",
      prompt: "The forecast appendix wants each month's NEXT-month value beside it instead of the prior. Which change does that, and what lands on the last row?",
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
      id: "gong-mcq-25",
      prompt: "The deal-size band reads CASE WHEN total >= 1000 THEN 'flagship' WHEN total >= 500 THEN 'core' ELSE 'long-tail' END. The db holds exactly 1 flagship (1,088.44), 24 core, 78 long-tail. What breaks if the first two arms swap?",
      choices: ["Nothing — CASE arms are independent", "The flagship arm stops firing: >= 500 is checked first and swallows the 1,088.44 deal, so the board reads 0 flagship / 25 core / 77 long-tail", "The query errors on overlapping ranges", "ELSE captures the flagship deal"],
      answer: 1,
      why: "CASE is first-match: overlapping >= arms must run big-to-small. Swapped, the flagship deal satisfies >= 500 first and the flagship count silently zeroes — same rows, wrong bands, no error.",
      notes: [
        { choice: 0, why: "Arm order IS semantics whenever ranges overlap. Independent arms are only the non-overlapping equality case." },
        { choice: 3, why: "ELSE fires only after every WHEN fails — the flagship deal never reaches it because an earlier arm already captured it." },
      ],
      difficulty: "medium",
    },
    {
      id: "gong-mcq-26",
      prompt: "The period census joins orders to order_items and COUNT(*) jumps from 103 to 251. What happened, and what re-folds it?",
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
      id: "gong-mcq-27",
      prompt: "SELECT c.name, COUNT(*) … GROUP BY c.id LIMIT 5 claims to return the 'top five accounts'. The reviewer rejects it. Why?",
      choices: ["LIMIT caps at 4 rows", "Without ORDER BY there is no top — SQLite returns whichever five rows its scan finds first, and the five can change run to run", "GROUP BY must come after LIMIT", "The count needs ROUND"],
      answer: 1,
      why: "Top-N is ORDER BY + LIMIT; without the sort, 'top' is fiction wearing a number. On this db the ladder runs 24, 17, 14, 13, 5 — but only the ORDER BY makes those the five that print.",
      notes: [
        { choice: 0, why: "LIMIT takes any non-negative n. The defect is ordering, not the count." },
        { choice: 2, why: "Clause order is fixed by the pipeline — LIMIT is last. Reordering is a syntax error, not a semantics fix." },
      ],
      difficulty: "easy",
    },
    {
      id: "gong-mcq-28",
      prompt: "The ops board wants billed, in-flight, trial and churned in one scan via COUNT(*) FILTER (WHERE status = …), with SUM(CASE …) as the portable twin. What property must the four branches hold for the board to ship?",
      choices: ["Each branch must be a separate query for speed", "The arms must be mutually exclusive and exhaustive over status — 52 + 30 + 14 + 7 must reconcile to the 103 COUNT(*) by construction, or the board flags itself", "FILTER only works on numeric columns", "The branches must be sorted DESC"],
      answer: 1,
      why: "The one-pass census is an identity: four arms cut from the same 103 rows must sum back to 103. Drift — a retry between four sequential queries, a filter edited in one arm — breaks the reconciliation, and a board that cannot reconcile flags itself before the forecast call does.",
      notes: [
        { choice: 0, why: "Four sequential queries are four ways to drift out of agreement — the exact failure the single pass exists to prevent." },
        { choice: 2, why: "FILTER takes any predicate and works on counts, sums, averages alike. The constraint is logic, not type." },
      ],
      difficulty: "hard",
    },
    {
      id: "gong-mcq-29",
      prompt: "A dashboard backfills the seat-change stamp: COALESCE(shipped_at, created_at). Engagement coverage jumps from 79.6% to 100%. What actually happened?",
      choices: ["The backfill repaired 21 broken stamps", "The 21 unstamped rows (14 trials, 7 churned) now display their booking date as their engagement date — the query stopped measuring engagement and started measuring existence", "COALESCE converted the timestamps correctly", "The coverage denominator shrank"],
      answer: 1,
      why: "The display convenience became a definitional lie: fabricated same-day engagements for every never-engaged row. Coverage's whole job is finding the unstamped cohort — the coalesce deletes the finding while the query still compiles.",
      notes: [
        { choice: 0, why: "Nothing was broken. Absence of a stamp was the finding, not a defect to repair." },
        { choice: 3, why: "The denominator is still 103 — the numerator was inflated to meet it. Same formula, inverted honesty." },
      ],
      difficulty: "hard",
    },
    {
      id: "gong-mcq-30",
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
    {
      id: "cs-gong-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The engagement ladder",
      brief:
        "Gong-flavored brief on the storefront db: the account-coverage board ranks every workspace account by subscription periods carried, because the ladder decides where account teams spend the quarter — and where the four-way tie sits decides whether the next rung is earned or phantom. Probed facts: the 103 periods spread over 16 accounts with the ladder reading 24, 17, 14, 13, 5 — Alice Chen 24 periods booking 7,262.35, Emma Wilson 17 / 6,640.56, Grace Kim 14 / 4,574.23, Maya Patel 13 / 3,644.56, Chloe Dubois 5 / 2,667.93 — then a FOUR-way tie at 4 periods (Isabella Rossi 985.65, Keiko Sato 1,098.60, Noah Meyer 737.68, Pedro Alvarez 1,686.17) and two accounts at 3 (Farid Nasser 1,458.97, Hiro Tanaka 829.09). The published policy is RANK with gaps: the tie holds rung 6 four times and the next distinct count lands on 10, not 7. The floor is 3-plus periods so the tie block and the gap both stay on the board. The board reads biggest period count first.",
      ask: "Return each account with market, period count, booked value to 2 decimals, plus both rank policies — RANK with gaps and DENSE_RANK without — computed over period count, biggest count first.",
      template:
        "WITH ladder AS (\n  SELECT c.name AS account,\n         c.region AS market,\n         COUNT(o.id) AS periods,\n         ROUND(SUM(o.total), 2) AS booked\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id\n)\nSELECT account,\n       market,\n       periods,\n       booked,\n       {2}() OVER (ORDER BY periods DESC) AS rung_gap,\n       DENSE_RANK() OVER (ORDER BY periods DESC) AS rung_ties\nFROM ladder\nWHERE periods >= {1}\nORDER BY periods {3}, account;",
      slots: [
        {
          answer: "3",
          kind: "number",
          label: "the ladder floor",
          why: "The floor keeps every rung the policy debate needs — the four-way tie at 4 AND the two 3-period accounts whose rows expose the gap (RANK jumps to 10 where DENSE_RANK reads 7). Raise the floor to 4 and the gap vanishes from the board: both columns agree and the tie policy looks like a non-issue.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the gap-preserving policy",
          why: "The published coverage policy is RANK with gaps: after the four-way tie at rung 6 the next rung is 10 — five accounts sit above the tie, so tied rung 6 costs three rungs. ROW_NUMBER hands the tie an arbitrary 6-7-8-9 and DENSE_RANK compresses the next rung to 7; neither is the board the coverage pod ships.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-count-first direction",
          why: "The board reads Alice Chen's 24 periods on top, down to the 3-period tail — coverage decisions start from the heaviest logos. ASC opens the board on Hiro Tanaka's 829.09, a correct ladder aimed at the wrong end, and the account-team allocations read bottom-up.",
        },
      ],
      distractors: ["4", "ROW_NUMBER", "ASC"],
      walkthrough:
        "Fold periods per account first, then rank twice. The ladder CTE joins periods to accounts and groups by account: 16 accounts, 103 periods, with ROUND(SUM(o.total), 2) carrying booked value beside the count — Alice Chen 24 / 7,262.35 down to Hiro Tanaka 3 / 829.09. The floor WHERE periods >= 3 keeps 11 of the 16 accounts, deliberately including the two 3-period rows: they are the whole tie-policy lesson, because RANK and DENSE_RANK only disagree when a gap follows a tie. The two windows share one ORDER BY periods DESC, so the tie block reads deterministically: the four 4-period accounts all take rung 6 in both columns, then the 3-period pair splits them — RANK 10, DENSE_RANK 7. That 10-versus-7 is the published policy: an account tied at 4 periods sits behind three phantom rungs under the gap rule, which is exactly how the coverage tier treats near-miss logos — and the deterministic ORDER BY periods DESC, account makes the whole board reproducible run to run. The distractors each break differently: 4 in the floor slot keeps 9 rows and hides the gap so both rank columns agree — the trap that makes the case look trivial; ROW_NUMBER in the policy slot prints 6-7-8-9 across the tie, an ordering nobody signed off and one that shuffles with the scan; ASC flips the board so the allocations read bottom-up. One fold, two policies, one stated floor — and say out loud which rung the tie costs.",
    },
    {
      id: "cs-gong-4",
      tier: "easy",
      topic: "s7",
      universe: "funnel",
      title: "The stage grid",
      brief:
        "Gong-flavored brief on the storefront db: the funnel board's non-negotiable is the stage grid — delivered (seats billed), shipped (expansion in flight), pending (trial/PoC) and cancelled (churned) per market in ONE pass, because the CASE arms must reconcile to the market's period count by construction. Probed facts: EU runs 45 periods (24 billed / 12 in flight / 6 trials / 3 churned, billed value 6,656.18), APAC 37 (21 / 8 / 5 / 3, billed value 6,617.68), US 19 (5 / 10 / 3 / 1, billed value 1,444.77) and LATAM 2 (2 / 0 / 0 / 0, billed value 852.44). Platform-wide the branches reconcile 52 + 30 + 14 + 7 = 103 — a grid that fails that identity is the forecast call's first incident. The board reads biggest market first, and the US row is the one the deal desk circles: only 5 of 19 periods billed while 10 sit in flight.",
      ask: "Return each market with its period count, billed / in-flight / trial / churned counts, and billed value to 2 decimals, biggest market first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS periods,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS billed,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS in_flight,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS trials,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS churned,\n       ROUND(SUM(CASE WHEN o.status = 'delivered' THEN o.total ELSE 0 END), 2) AS billed_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY periods {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the billed-stage literal",
          why: "Billed is the 'delivered' branch — 52 periods platform-wide whose seats completed a term. 'shipped' here would label the 30 in-flight expansions as revenue landed, and 'kept' is not a status on the book — the arm would silently count zero.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the trial-stage literal",
          why: "Trial/PoC rows are status 'pending' — 14 with no seat-change stamp yet, the stalled-trial queue the deal-risk desk opens Monday with. 'paid' is an invoice status, not an order status: the arm reads zero and the trial column disappears while the query still runs.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the churned-stage literal",
          why: "Churned periods are status 'cancelled' — 7 on the db, concentrated Alice Chen 3 and Maya Patel 2. 'pending' here would duplicate the trial arm and page customer success about churn that is actually stalled trials — a different intervention entirely.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-market-first direction",
          why: "The grid reads EU 45, APAC 37, US 19, LATAM 2 — biggest market first, the US row third where the deal desk circles the 10 in-flight expansions. ASC buries the US under LATAM's confident-looking zeros on a 2-period base.",
        },
      ],
      distractors: ["'shipped'", "'open'", "'paid'", "ASC", "AVG"],
      walkthrough:
        "One scan, four CASE arms, one identity. The grid folds all 103 periods by market and branches each stage inside the same pass: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) is billed, 'shipped' is in flight, 'pending' is trials, 'cancelled' is churned — EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0. Add each market's arms and you get 45, 37, 19, 2; add the markets and you get 103 — the reconciliation is by construction, which is why the funnel board ships this query and not four sequels. The money column sums order total only over the delivered arm: EU 6,656.18, APAC 6,617.68, US 1,444.77, LATAM 852.44 — footing to the 15,571.07 delivered book, 44.7% of the 34,833.28 total. The story the grid tells: the US is expansion-heavy (10 of 19 in flight, only 5 billed), LATAM's zeros ride a 2-period denominator, and APAC quietly bills more than the EU in count share. The distractors each corrupt a different arm: 'shipped' in any stage slot swaps a healthy population in — expansions masquerading as billed, trials or churn; 'open' and 'paid' are invoice statuses that zero the arm while the query keeps running; ASC flips the grid and hides the US row under the LATAM flatterer; AVG in a keyword slot is a parse error, the honest failure. CASE arms ordered, statuses spelled, 103 or it does not ship.",
    },
    {
      id: "cs-gong-5",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The never-invoiced queue",
      brief:
        "Gong-flavored brief on the storefront db: before the forecast call, the deal desk refreshes its coverage anti-join — accounts whose periods never produced a billing statement, the billing-side blind spot that mirrors the claim-vs-log probe. Probed facts: exactly 5 of 16 accounts carry zero statements — Farid Nasser (APAC, 3 periods, 2 delivered, booked 1,458.97), Keiko Sato (APAC, 4 periods, 2 delivered, 1,098.60), Bruno Silva (LATAM, 2 periods, both delivered, 852.44), Noah Meyer (EU, 4 periods, 2 delivered plus 2 in flight, 737.68) and Dmitri Volkov (EU, 2 periods, both delivered, 599.26) — 15 periods and 4,746.95 of booked value with no statement behind it. The queue reads biggest booked value first, and the floor at 2-plus periods keeps the whole queue on one board. Noah Meyer is the row the desk walks line by line: seats changed (2 in-flight stamps) and still nothing billed.",
      ask: "Return each never-invoiced account with market, period count, delivered-period count and booked value to 2 decimals, biggest booked first.",
      template:
        "SELECT c.name AS account,\n       c.region AS market,\n       COUNT(o.id) AS periods,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS delivered_periods,\n       ROUND(SUM(o.total), 2) AS booked\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nLEFT JOIN invoices i ON i.customer_id = {1}\nWHERE i.id IS {2}\nGROUP BY c.id\nHAVING COUNT(o.id) >= {5}\nORDER BY booked {4};",
      slots: [
        {
          answer: "c.id",
          kind: "keyword",
          label: "the anti-join key",
          why: "The LEFT JOIN must ride the account's own id: ON i.customer_id = c.id keeps every account and attaches its statements, leaving NULL payloads where billing never touched. i.customer_id = i.id compares a statement's reference to its own id — a pairing that means nothing — and o.id ties statements to period rows instead.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-statement guard",
          why: "Unmatched statements leave i.id NULL, and only IS NULL keeps the never-invoiced rows. IS NOT NULL flips the queue to the 11 invoiced accounts — the reconciliation list, not the coverage gap — and the forecast sheet reads committed billing as exposure.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the delivered-period literal",
          why: "The delivered count is the pressure column: Bruno Silva and Dmitri Volkov show 2 of 2 delivered with zero statements — completed terms the billing side never touched. 'pending' here would read 1, 1, 0, 0, 0 and bury the two cleanest compliance rows.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-booked-first direction",
          why: "The desk reads the biggest exposure first: Farid Nasser's 1,458.97 leads, Dmitri Volkov's 599.26 trails. ASC opens the meeting on the smallest queue and the 4,746.95 coverage gap gets argued bottom-up.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the queue floor",
          why: "The 2-period floor keeps every account on the board — the counts run 3, 4, 2, 4, 2 — while documenting that single-period accounts get reviewed separately. Raise it to 5 and the queue empties entirely; the floor is a scope statement, not a filter that bites today.",
        },
      ],
      distractors: ["c.region", "NOT NULL", "'pending'", "ASC", "5"],
      walkthrough:
        "A LEFT JOIN anti-join at the account grain, then a pressure column. Join accounts to their periods INNER — every account carries periods on this db — then LEFT JOIN statements ON i.customer_id = c.id: invoiced accounts carry their statement rows, the never-invoiced carry NULL payloads, and WHERE i.id IS NULL keeps exactly those. Five rows survive the floor: Farid Nasser 3 periods / 2 delivered / 1,458.97, Keiko Sato 4 / 2 / 1,098.60, Bruno Silva 2 / 2 / 852.44, Noah Meyer 4 / 2 / 737.68, Dmitri Volkov 2 / 2 / 599.26 — 15 periods and 4,746.95 of booked value that no statement has ever claimed. The delivered column is the read that ranks the queue: Bruno and Dmitri show completed terms with zero billing (clean compliance misses), while Noah shows 2 delivered PLUS 2 in-flight stamps — seats are changing on a period the billing side has never seen, which is the mirror image of the paid-claim liar in the register. The distractors each break differently: c.region in the join key slot compares an integer FK to text and matches nothing, so all 16 accounts flood the queue; NOT NULL flips to the 11 invoiced accounts; 'pending' zeroes the pressure column's point by counting trials instead of delivered terms; ASC reads the queue bottom-up; 5 in the floor slot empties the board because no account carries five periods. Anti-join for coverage, IS NULL for the miss, delivered count for pressure, biggest first — that is the never-invoiced refresh.",
    },
    {
      id: "cs-gong-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The forecast spine walk",
      brief:
        "Gong-flavored brief on the storefront db: the weekly forecast call opens with the booking spine walk — every month of the 14-month spine (2024-01 to 2025-02) with its month-over-month step, so cadence arguments start from one query instead of five screenshots. Probed facts: the spine opens at 3,731.97 in 2024-01 with a NULL step — the baseline row, not a zero; it sags through spring (-992.56 into March), troughs at 1,193.86 in July, then jumps +1,158.21 into August's 2,352.07; the steepest single step is -1,326.87 into November (1,648.80); the walk closes at 2,390.53 in 2025-02 on a +721.03 step. The month key is the '%Y-%m' STRFTIME format — '%m' alone is the known trap that merges January 2024 (3,731.97) into January 2025 (1,669.50) as one 5,401.47 row and silently deletes a month from the spine. The walk reads oldest month first, and the first row's NULL step is quoted as-is in the appendix, never coalesced to zero.",
      ask: "Return the monthly spine with booked value to 2 decimals, the previous month's value beside it, and the month-over-month step to 2 decimals, oldest month first.",
      template:
        "WITH spine AS (\n  SELECT STRFTIME({3}, o.created_at) AS month,\n         ROUND(SUM(o.total), 2) AS booked\n  FROM orders o\n  GROUP BY month\n), steps AS (\n  SELECT month,\n         booked,\n         {1}(booked) OVER (ORDER BY month) AS prev_booked\n  FROM spine\n)\nSELECT month,\n       booked,\n       prev_booked,\n       ROUND(booked - prev_booked, 2) AS step\nFROM steps\nORDER BY month {2};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the backward-looking offset",
          why: "A step is this month minus LAST month: LAG(booked) OVER (ORDER BY month) reaches back one row and leaves the first row NULL — the baseline by definition. LEAD reaches forward and flips every sign; SUM(booked) OVER (…) builds a running total, a different appendix entirely.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the oldest-first spine direction",
          why: "The walk reads chronologically — 2024-01's 3,731.97 opens the appendix and the 2025-02 close lands last, so the trough and the August rebound read left to right. DESC tells the same story backwards and puts the NULL baseline at the bottom, where nobody expects a baseline.",
        },
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month key format",
          why: "The spine key must carry the year: '%Y-%m' gives 14 distinct months from 2024-01 to 2025-02. '%m' alone merges the two Januaries into one 5,401.47 '01' row — the spine prints 12 rows, every LAG step across the year boundary is fiction, and nothing errors.",
        },
      ],
      distractors: ["LEAD", "DESC", "'%m'", "SUM"],
      walkthrough:
        "Two stages: fold the calendar, then step it. The spine CTE folds all 103 periods into 14 monthly rows keyed by STRFTIME('%Y-%m', created_at) — the year in the key is what keeps January 2024 and January 2025 apart. The steps CTE adds LAG(booked) OVER (ORDER BY month): each month now carries its predecessor, 2024-01's prev_booked is NULL because there is no December 2023 to reach back to, and the outer SELECT prints the step as ROUND(booked - prev_booked, 2) — -122.33 into February, -992.56 into March, the -853.57 slide into the July trough at 1,193.86, the +1,158.21 August rebound to 2,352.07, the -1,326.87 November slump, and the +721.03 close at 2,390.53. The first row's NULL is quoted, never coalesced: a zero would make the opening month look like it lost 3,731.97 overnight — a fabricated claim exactly of the kind the forecast call exists to catch. The '%m' trap deserves its horror story: the query still runs, the spine shrinks to 12 rows, January prints a merged 5,401.47, and every cadence argument that month is fiction. The distractors each break differently: LEAD flips every sign and moves the NULL to 2025-02's row; SUM builds a running total instead of steps; DESC walks the spine backwards with the baseline at the bottom; '%m' merges the Januaries and deletes a month from the board. Fold on the year-aware key, step with LAG, read oldest first, quote the NULL as the baseline it is.",
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
    { slug: "sessionize-events", why: "Calls and meetings arrive as timestamped rows; bundling them into sessions with a gap threshold is the transcript-grain read the whole engagement funnel sits on." },
    { slug: "rolling-7d-actives", why: "Trailing-window distinct accounts is the weekly engagement pulse — exactly the moving-window census the deal-risk desk refreshes every Monday." },
    { slug: "find-churn-risk-customers", why: "Churn-risk flags are conditional counts with stated thresholds — the same deal-risk inspection Gong's own warnings ship as a product." },
    { slug: "rfm-segmentation", why: "Recency-frequency-monetary tiering is the account-planning backbone: recency = latest stamp, frequency = period count, monetary = booked value." },
    { slug: "repeat-purchase-rate", why: "Renewal share — accounts with 2-plus periods over all accounts — is the repeat-booking read the forecast call opens with." },
    { slug: "sales-by-day-of-the-week", why: "Booking cadence by weekday (Mondays run 20 of 103 on this db) decides when the forecast call reviews new pipeline." },
    { slug: "year-on-year-growth-rate", why: "YoY on the 14-month spine survives only if the year is in the fold key — the January-merge trap is the whole problem." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest period per plan SKU is the argmax read behind 'when did this account last expand' — MAX-join versus ROW_NUMBER with a stated tie-break." },
    { slug: "premier-league-table-ranking", why: "Win-rate ladders with points, ties and gaps drill the exact leaderboard semantics (RANK with gaps) the coverage board publishes." },
    { slug: "top-percentile-fraud", why: "Outlier inspection by percentile band is the deal desk's too-good-to-be-true screen on booked value." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Accounts whose period value rises term over term are the expansion story — the LAG-comparison shape behind the growth board." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Two engagements inside a week is the fast-follow signal the coaching pod rewards — timestamp-pairing over a window." },
    { slug: "second-highest-salary", why: "Second-rung reads (runner-up deal, next-tier account) drill MAX-exclusion folds — the interview's favorite escalation after the top-1." },
    { slug: "same-day-sale", why: "Booked and stamped the same day — the same-day engagement flag is a conditional count the onboarding pod watches for fast wins." },
    { slug: "ar-aging-schedule", why: "Aging buckets on the never-settled register (15,217.00 across 6 statements) are the dunning calendar's backbone." },
    { slug: "basket-depth-aov", why: "Lines per period (251 across 103, 2.44) beside average period value — the depth-and-value pair that reads expansion health." },
  ],
};
