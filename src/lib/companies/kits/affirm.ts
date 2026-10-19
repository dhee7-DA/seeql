// Affirm — Wave-8 (Task 96), fintech domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// BNPL underwriting SQL: the storefront db read as a financed-checkout book — customers are
// shoppers, orders are financed checkouts (delivered = paid in full at term end, shipped =
// funded and amortizing with shipped_at as the funding stamp Affirm cuts when money moves to
// the merchant, pending = approved but not yet funded, cancelled = reversed before funding),
// order_items are financed lines (quantity = units, unit_price = item price), products are the
// catalog financed, suppliers are merchant partners (GMV per merchant drives the merchant-fee
// book), invoices are billing statements cut on uniform 30-day terms and payments are the
// installment dollars received (INTEGER cents, /100.0 dollar read). Pool provenance:
// company-pools.md carries NO Affirm section — 0 tagged rows — so all 10 topic slug sets and
// all 16 problems are theme-curated from the pools file's theme menu and say so. Case briefs
// quote probed figures from scripts/company-facts.md (probed 2026-10-12); every case slot is
// mechanically verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const affirmKit: CompanyKit = {
  id: "affirm",
  domainId: "fintech",
  name: "Affirm",
  tagline: "BNPL underwriting at the checkout",
  accent: "text-sky-300",

  brief: [
    "**Affirm** is the buy-now-pay-later layer that underwrites a purchase while the checkout is still spinning — Pay in 4 biweekly at 0% APR for smaller baskets, interest-bearing monthly installments for the big ones — and earns on merchant fees plus interest, so every number in the building is a claim about *a payment schedule actually paying*. This kit maps the storefront db onto that world: 16 shoppers, 103 financed checkouts worth **34,833.28** in GMV, 251 financed lines across a 16-SKU catalog sold through 6 merchant partners. The lifecycle map is fixed: delivered = {emerald:paid in full} (52, 50.5%), shipped = funded and amortizing (30, 29.1%), pending = approved but not yet funded (14), cancelled = {rose:cancelled or returned} (7, 6.8%).",
    "The data org splits into credit risk, merchant analytics, and the collections pod both depend on. A checkout books at `created_at` and funds on `shipped_at` — the funding stamp, the day money moved to the merchant — and **82 of 103 checkouts** carry it, averaging 2.98 days to fund with a 2–4 day spread; the 14 pending rows have no stamp yet, which is a population definition, not a cleanup job. Statements sit one layer down: 28 billing statements cut on uniform 30-day terms, installment dollars landing against them in INTEGER cents, so the dollar read is `amount_cents / 100.0`. Concentration is the underwriting story: **63.5%** of GMV comes from the four shoppers whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost borrower moves the book.",
    "Interview screens are definition-first, because at a lender every number is a claim about money. A loop opens with a **two-grain census** — the US runs 19 checkouts from just 2 shoppers at a 383.48 average ticket while EU runs 45 from 8 — then escalates into a rate where the interviewer asks the denominator out loud (*'does a cancelled checkout sit in your approval base?'*), then into ticket mix: the mid band (50–200) holds 8 SKUs averaging 111.5 against budget's 8 at 32.06, and the 200-plus premium band is {rose:empty} — nothing on this catalog out-tickets the 199.99 Smart Watch S. Candidates who state the status filter, the denominator and the cents rule before writing SQL are the ones who get callbacks.",
    "Preparation strategy: company-pools.md carries no Affirm section — 0 tagged LC rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: checkout funnels with honest denominators, merchant GMV attribution, ticket-band CASE tiers, funding-spine LAG walks and the cents-safe statement books. Do the topics in order, then run all six case studies on the live storefront db: one rebuilds the {sky:financed-basket census} merchant analytics ships each month, the other rebuilds the {amber:uncollected-exposure list} collections reviews every Monday, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting... The bar to clear: *state the definition, the denominator and the units before you compute anything* — then make every lifecycle census reconcile to 103 by construction.",
    "Round-two screens go past the funnel and into the book's mechanics. The **55.00 seat-band fold** splits the 498 financed units into 268 below the line at a 31.01 average line price against 230 above it at 115.85 — volume versus ticket in one CASE; the 14-month GMV spine gets walked with `LAG`, where only three months (3,731.97 / 3,609.64 / 3,116.04) clear the 3,000 line; and a one-pass `FILTER` census prints the statement book — 21 paid for 66,443.00, 6 open for 19,609.00, {rose:1 void for 925.00} — in a single scan. The follow-ups never change: what population, what denominator, what units.",
    "Preparation for the expanded kit: the fifteen topics now run from funnel counts through statement-leg ledgers — do them in order, then work all six cases on the live storefront db, because four are rebuild-the-query drills whose distractor chips fail honestly (`ROUND` arms that re-print the cents, a `LAG` walk that flips to `LEAD` and inverts every move, a `PARTITION BY` that kills the walk's priors). The sixteen original problems stay; sixteen more stage the deeper reads — rails, legs, provision shapes, dedupe policy. *The bar does not move with the volume*: state the definition, the denominator and the units before you compute anything, and reconcile by construction — 103 checkouts, 28 statements, 498 units, 181,080 against 181,080.",
  ],

  dayInLife: [
    "**08:15 —** The day starts on the funding dashboard, not the marketing one. First query is the lifecycle census in one pass — 52 paid-in-full + 30 amortizing + 14 pending + 7 cancelled = **103 by construction** — followed by the funding-latency read over the 82 stamped checkouts: **2.98 days** average, US slowest at 3.07, APAC quickest at 2.93. A pending row that ages without a funding stamp is *the morning's first page*, not a rounding note — {rose:approved money that never funds} is scheduled money that never collects.",
    "**11:30 —** Midday is the merchant and mix read. Partnerships wants the GMV ladder: Nordic Gadgets AB carries **11,130.25 — 32% of the book** — and with Midwest Hardware Co's 9,294.93 the top two merchants hold 58.7% of GMV, so one renegotiation moves the merchant-fee math. Credit wants the category census beside it: {amber:Audio} finances 11,744.01 on 97 units while Accessories moves 121 units for just 3,294.29 — *volume without ticket is the underwriting trap this catalog is built to expose*. Each ask is a join, a fold and one argument about which grain is load and which is coverage.",
    "**15:30 —** The afternoon tilts to collections. The AR anti-join refreshes first — **6 statements worth 15,217.00 with zero installment dollars behind them** — before dunning sends a single notice; the coverage split reads 21 exact, 1 partial (#25 at 4,000.00 of 6,148.00), 6 none. The exception queue gets walked line by line: statement #11 is {rose:void} yet carries a 925.00 installment, and #28 reads paid with nothing collected at all (1,756.00 promised). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080, delta zero** — {emerald:the close ships} or tomorrow starts with an incident.",
    "**18:45 —** The writeup hour. The one-pass census drops into the risk packet in a single scan — {emerald:21 paid for 66,443.00}, {sky:6 open for 19,609.00}, {rose:1 void for 925.00} — because three sequential queries are three ways to drift between arms. The close also carries the opex note: **3,210.00 in August** against a spine that runs 1,440.00 to 3,210.00, the one 3,000-plus month the narrative has to explain. Last calendar look before the 19:00 slot: tomorrow's Nordic QBR pack gets the merchant ladder (11,130.25 — 32% of the book) beside the seat-band fold, and *a writeup that misses the slot becomes tomorrow's incident queue*.",
  ],

  metrics: [
    { name: "Funding rate", what: "Checkouts with the funding stamp ÷ ALL checkouts booked: 82 of 103 (79.6%). The top-of-funnel number credit reads every Monday — the 14 approved-but-unfunded rows stay in the denominator because 'not yet funded' is exactly what the metric measures." },
    { name: "Funding latency", what: "created_at → shipped_at over funded checkouts only: 2.98-day average, 2–4 day spread. Regional reads: APAC 2.93 on 29 checkouts, EU 2.94 on 36, US 3.07 on 15, LATAM 3.5 on 2. The population ships with the number — pending rows have no cycle yet." },
    { name: "GMV & average ticket", what: "34,833.28 across 103 financed checkouts, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the underwriting story — one 1,088.44 checkout out-tickets the smallest 42 combined, and ticket size drives both merchant fees and loss exposure." },
    { name: "Paid-in-full rate", what: "Delivered ÷ ALL checkouts booked: 52 of 103 (50.5%). Funded-and-amortizing (30) are not yet paid in full; pending (14) never entered a schedule. The status filter and the denominator are the whole interview." },
    { name: "Merchant concentration", what: "GMV per merchant partner: Nordic Gadgets AB 11,130.25 = 32% of the book, Midwest Hardware Co 9,294.93 = 26.7% — top two hold 58.7%. The merchant-fee revenue base and its single-partner dependency, read off one join and one fold." },
    { name: "Shopper concentration", what: "Share of GMV from shoppers whose lifetime spend crosses 3,000: 63.5% (71.2% above 2,000) — four borrowers carry the book. The credit-concentration number that staffs the risk pod and sizes every exposure limit." },
    { name: "Collections coverage", what: "Statements classified exact / partial / none: 21 / 1 (#25, 4,000.00 of 6,148.00) / 6 worth 15,217.00. The AR anti-join the collections pod refreshes every close — and the CASE classification must sum back to 28." },
    { name: "Ledger balance delta", what: "Total debits − total credits: 0 on 181,080 a side; per-account nets cash 44,196 and receivables 16,440 feed the close. The one metric allowed, and required, to be boring — a non-zero delta pages the close." },
    { name: "Basket depth", what: "Financed lines ÷ checkouts: 251 / 103 = 2.44 lines per basket, max line quantity 3. Depth is the cross-sell read — Accessories rides 121 units across 54 checkouts because baskets attach it, not because shoppers come for it." },
    { name: "Unit seat-band split", what: "Financed units folded at the 55.00 line: 268 below at a 31.01 average line price, 230 above at 115.85. The volume-versus-ticket fold — the cheap arm out-units the big-ticket arm while the big-ticket arm carries the money." },
    { name: "Big-month line", what: "Months clearing 3,000.00 GMV on the 14-month spine: three — the opener at 3,731.97, 3,609.64 in February 2024, 3,116.04 in September. A threshold read with the denominator attached (all 14 months), the way the growth board asks for it." },
    { name: "Opex spine", what: "Monthly operating expense run: 1,440.00 floor to 3,210.00 ceiling across 2024-01 to 2025-02, with August 2024 the single 3,000-plus spike the close narrates. The cents-side book — 36 expense rows in INTEGER cents — read in dollars with the /100.0 rule." },
  ],

  topics: [
    {
      name: "Checkout funnel counts",
      why: "Every Affirm screen opens with the lifecycle: checkouts booked, funded (shipped_at stamped), paid in full at term end. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an amortizing checkout 'paid in full' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "immediate-food-delivery-i", "loan-amortization-schedule", "funnel-step-conversion"],
    },
    {
      name: "Two-grain borrower censuses",
      why: "Checkouts and shoppers are different grains of the same join, and every census here reports both: the US runs 19 checkouts from 2 shoppers (9.5 intensity) while EU runs 45 from 8 (5.6). COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Merchant attribution joins",
      why: "GMV rides to merchant partners through products.supplier_id, and the join type decides who survives the report. A checkout line with no catalog row is corruption; a merchant with no financed GMV is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Ticket banding with CASE",
      why: "Affirm underwrites on ticket size, and the catalog bands cleanly: mid (50–200) holds 8 SKUs averaging 111.5 against budget's 8 at 32.06, while the 200-plus premium band is empty — the 199.99 Smart Watch S is the ceiling. The CASE arms must be exhaustive and ordered; a hole in the banding is a hole in the exposure map.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store", "fix-names-in-a-table", "delinquency-buckets", "amount-anomaly-zscore"],
    },
    {
      name: "Concentration ladders",
      why: "The borrower ladder is steep: 24, 17, 14, 13 checkouts, then a long tail where four shoppers sit tied at 4 each. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow — and on a book where four logos carry 63.5% of GMV, rank semantics are a credit conversation, not syntax.",
      slugs: ["rank-scores", "top-earners", "second-highest-salary", "product-sales-analysis-ii", "chargeback-rate-ranking"],
    },
    {
      name: "Funding spine & LAG deltas",
      why: "The 14-month funding spine (2024-01 to 2025-02) is the monthly business review's home turf: GMV booked per month, prior month beside current, the 1,193.86 July trough and the +1,158.21 jump into August named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine", "confirmation-rate", "delinquency-roll-rates", "null-blank-audit"],
    },
    {
      name: "Coverage set algebra",
      why: "Risk packets stack populations — funded under paid-in-full, this month beside last — and EXCEPT answers 'which funded checkouts never reached term'. UNION dedups whole rows silently, which makes it a correctness question, not a style one; one collapsed row is one borrower missing from the packet.",
      slugs: ["team-scores-in-football-tournament", "customers-who-never-order", "monthly-transactions-ii", "customers-who-bought-a-and-b-not-c", "find-churn-risk-customers"],
    },
    {
      name: "Big-ticket thresholds",
      why: "Underwriting screens compare one checkout against a number computed from the whole book — the 338.19 average ticket — via a scalar subquery in WHERE. The contract is zero-or-one rows: zero yields NULL and a silently-empty report, and saying that unprompted is the follow-up the panel is fishing for.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "find-expensive-cities", "customer-placing-the-largest-number-of-orders", "daily-balance-interest"],
    },
    {
      name: "One-pass lifecycle censuses",
      why: "The ops board gets paid-in-full, amortizing, pending and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift before the review starts.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "count-salary-categories", "npv-queries", "expected-credit-loss"],
    },
    {
      name: "Statements, cents & settlement",
      why: "Billed is not collected — the finance tables (28 statements, 27 installment rows, INTEGER cents) are where the checkout world meets money. Every dollar read is amount_cents / 100.0, the exact/partial/none coverage split (21 / 1 / 6) is one CASE away, and settlement runs 28.4 days average against uniform 30-day terms.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "monthly-transactions-i"],
    },
    // — Expansion (Task 103, wave-3x): topics 11-15 appended; new names, no slug reused from topics 1-10 or problems 1-16. Still 0 tagged Affirm rows — theme-curated from the pools file's theme menu (all sql rows).
    {
      name: "Seat-band ticket folds",
      why: "The canonical 55-line fold splits 498 financed units into 268 below the line at a 31.01 average line price and 230 above at 115.85 — one CASE, two arms, the volume-versus-ticket argument in a single scan. Underwriting lives on these folds: arms must be exhaustive, and the AVG grain (per financed line, not units-weighted) has to be stated out loud or the 31.01 stops reconciling with every other slide in the deck.",
      slugs: ["loan-types", "risk-based-pricing", "customer-purchasing-behavior-analysis", "average-selling-price", "credit-utilization-bands", "basket-depth-aov"],
    },
    {
      name: "Derived-table staging",
      why: "Threshold reads that compare a fold against a bar — the three months above 3,000 (3,731.97 / 3,609.64 / 3,116.04) — need the monthly fold staged before the filter can see it. Derived tables teach the grain discipline: WHERE runs before the fold exists, so the bar sits outside the staging SELECT (or in HAVING), and the staged fold is a thing you can audit row by row.",
      slugs: ["market-analysis-i", "investments-in-2016", "median-employee-salary", "trips-and-users", "transaction-velocity"],
    },
    {
      name: "Month-over-month opex walks",
      why: "The expense book is INTEGER cents on 36 rows, and its monthly spine (1,440.00 floor to the 3,210.00 August ceiling) is where LAG deltas get audited: the +1,416.00 move into August against July's 1,794.00 is the line the close narrates. Cents discipline rides along on every fold — /100.0 before ROUND, never after — and the first month's move stays NULL because the baseline is not a zero.",
      slugs: ["mrr-waterfall", "week-over-week-churn", "year-on-year-growth-rate", "bank-account-summary", "repeat-purchase-rate"],
    },
    {
      name: "Statement-leg ledgers",
      why: "Statements carry zero, one or two installment legs — 6 / 17 / 5 across the 28 — and five cycles settle on BOTH card and wire. Leg counts are the ledger-of-record view: a paid status with zero legs (#28, 1,756.00) is a lie the leg census catches, and the never-remitted split (5 open statements, 13,461.00 versus the single 1,756.00 paid lie) is how collections frames the same book.",
      slugs: ["number-of-calls-between-two-persons", "duplicate-charge-pairs", "ar-aging-schedule", "gl-reconciliation", "trial-balance-check"],
    },
    {
      name: "Method-rail mixes",
      why: "Installment rails split card versus wire — 16 legs for 37,364.00 against 11 for 32,248.00 — and the mix feeds settlement forecasting on the 28.4-day clock. GROUP BY method with the cents read is the easy half; the interview twist is the five split-rail cycles that ride both rails, which is why per-statement leg attribution stays a standing ask.",
      slugs: ["card-launch-success", "ads-performance", "top-travellers", "department-highest-salary", "top-percentile-fraud"],
    },
  ],

  theory: [
    {
      id: "affirm-t1",
      q: "Your dunning report LEFT JOINs statements to installments and keeps IS NULL rows. When would INNER be right instead — and what silently happens if you filter a status column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. The dunning list must be LEFT from statements: the statements with no installment rows ARE the answer — 6 of them worth 15,217.00 on this db, arriving with NULL installment columns. A collected-dollars report can be INNER honestly: a statement with no installment row contributes zero dollars, not a mystery row. The classic break: adding a right-table predicate like p.method = 'card' to WHERE after the LEFT JOIN kills every NULL-payload statement row — the LEFT quietly became an INNER and the dunning list emptied while looking valid. The fix is moving the predicate into ON or an outer query. And mind the mirror anomaly: void statement #11 carries a 925.00 installment, so it never appears in the anti-join — the two error modes need two different queries, which is exactly why the exception queue is row-level, not aggregate.",
      tag: "joins",
    },
    {
      id: "affirm-t2",
      q: "The repeat-borrower ladder runs 24, 17, 14, 13 checkouts, then four shoppers tie at 4 each. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying four phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose repayment plan gets the collections call first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer borrowers, or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. On a book where four shoppers carry 63.5% of GMV, the ladder order is a staffing decision.",
      tag: "windows",
    },
    {
      id: "affirm-t3",
      q: "The funnel shows 103 financed checkouts, 251 financed lines and 16 shoppers. Why do these three counts disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) over orders counts checkouts — 103 booked; COUNT(*) over order_items counts financed lines — 251, because baskets fan across items and categories; COUNT(DISTINCT customer_id) folds everything back to shoppers — 16, all of whom bought. Neither is wrong: lines measure basket depth and merchant mix, checkouts measure funded volume, shoppers measure installed base. The traps are silent re-graining: join order_items and COUNT(*) suddenly counts lines, not checkouts — and the category census proves it, where category checkout counts sum to 228 touches over 103 checkouts because one basket can finance Audio and Accessories together. Saying 'one row per what?' for every COUNT is the habit the panel grades, because at a lender the grain decides whether a number is exposure, volume or people.",
      tag: "aggregation",
    },
    {
      id: "affirm-t4",
      q: "shipped_at is NULL until funds move. What is your policy for the funding-latency report, and how do the aggregates treat the unstamped rows?",
      a: "Policy first: only funded checkouts have a latency, so the report measures booking-to-funding for the 82 of 103 checkouts that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL checkouts returns the funded-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the funded subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 cancelled rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day funding for checkouts whose money never moved. At a lender this is sharper than cosmetics: an approval that sits unfunded is scheduled revenue at risk, and a latency report that hides the 14 pending rows hides the early-warning signal.",
      tag: "nulls",
    },
    {
      id: "affirm-t5",
      q: "Credit wants regions with at least twenty funded checkouts and their cancel shares. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The funding rule is a row-level fact — shipped_at IS NOT NULL discards the 21 unstamped rows before any fold, in WHERE; putting it in HAVING is impossible because stamps no longer exist once rows are grouped. The twenty-checkout floor is a group-level fact — HAVING COUNT(*) >= 20 after GROUP BY; on this db EU (45) and APAC (37) clear it while the US (19) and LATAM (2) drop. The cancel share itself is 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), and the 100.0 sits before the division because integer division truncates — APAC reads 8.1%, not a displayed 8. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a risk map and an error, and between a threshold applied to checkouts versus to dollars.",
      tag: "pipeline",
    },
    {
      id: "affirm-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison — the 338.19 average ticket, in this db's case; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the big-ticket report silently returns nothing while looking valid. On the full table that is theoretical: 103 checkouts always produce a mean. On filtered staging tables — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly where it hides. The correlated cousin (compare each checkout to ITS merchant's average ticket) re-runs per outer row and answers a different question: Nordic's big-ticket mix against Nordic's own baseline, not the book's. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because at an underwriting shop the follow-up is always 'compared to what population?'",
      tag: "subqueries",
    },
    {
      id: "affirm-t7",
      q: "The funding trend buckets checkouts by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the funding trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's checkouts, and month-end is exactly when big tickets land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The spine tells the Affirm story honestly: the book opens at 3,731.97, troughs at 1,193.86 in July 2024, and jumps +1,158.21 into August — none of which survives a broken month key.",
      tag: "dates",
    },
    {
      id: "affirm-t8",
      q: "Collections says a statement is 'paid' but the installments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN installments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero installment rows: a status that lies, which is why installment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH an installment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level exception queue, not to vibes. The partial sits in between: #25 is open at 6,148.00 with 4,000.00 collected — neither exact nor none, a third class the CASE must name. The money rule: statements and installments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 truncates cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial / 6 none against 28 statements, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    // — Expansion (Task 103, wave-3x): theory t9-t24 appended; deeper cuts only —
    // window frames, set-op contracts, subquery shapes, date math, NULL policy,
    // performance instincts, and BNPL KPI definitions. No concept repeats t1-t8.
    {
      id: "affirm-t9",
      q: "You write SUM(total) OVER (ORDER BY created_at) for a running GMV line on the funded book. What frame did you just get — and when does it betray you?",
      a: "With ORDER BY and no frame clause the default is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — and RANGE treats peer rows (same created_at) as inside the frame, so the running total leaps by the whole tie group at once. On 251 financed lines sharing dates freely, that leap mid-day overstates exposure between the tied checkouts, and a deck that quotes the running line at hour granularity inherits the error. The fix is explicit: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW when the walk is row-by-row — and saying so in the query comment. At a lender the running total is a claim about cumulative exposure; the frame IS the definition, so the frame ships with the number.",
      tag: "frames",
    },
    {
      id: "affirm-t10",
      q: "Rank the six merchant partners by financed GMV but keep every checkout row on screen. Why PARTITION BY instead of GROUP BY — and what does the kept row buy?",
      a: "GROUP BY collapses 251 financed lines into six merchant folds — Nordic 11,130.25, Midwest 9,294.93 — and the biggest single checkout behind each fold is gone. RANK() OVER (PARTITION BY p.supplier_id ORDER BY oi.quantity * oi.unit_price DESC) keeps every line and marks each merchant's anchor checkout; the kept row is the drill-down the QBR asks for. The follow-up trap is filtering on the window — WHERE cannot see it, so the top-line-per-merchant read stages through a derived table or CTE and filters outside. Windows keep rows; folds keep answers; the interview question is which one the stakeholder actually needs.",
      tag: "windows",
    },
    {
      id: "affirm-t11",
      q: "You stack a funded-checkout branch over an open-statement branch with UNION for the risk packet. What must match across branches, and where does ORDER BY live?",
      a: "UNION branches match on column COUNT with positionally compatible types; output names come from the first branch, so name the first branch for the reader. ORDER BY appears exactly once, at the very end — it orders the stack, not a branch, and a branch-level ORDER BY is either an error or a lie. Both branches must fold money with the same cents rule or the stack prints two unit systems — INTEGER cents beside REAL dollars is the classic here. And label each branch with a literal source column so any row in the packet is attributable; a stacked row with no provenance is how double-counts hide. Set ops concatenate result sets; they do not reconcile semantics for you.",
      tag: "setops",
    },
    {
      id: "affirm-t12",
      q: "Funded EXCEPT delivered, delivered EXCEPT funded, and INTERSECT — what does each return on this book, and why does direction matter more than syntax?",
      a: "Funded (82 stamped checkouts) EXCEPT delivered (52) returns the 30 shipped-and-amortizing rows — funded money that has not reached term. The reverse direction returns zero, because delivered is fully contained in funded: the subtraction is a set-membership argument, not a symmetrical diff. INTERSECT returns the 52 completers; UNION stacks back to 82. Two honesty rules ride along: EXCEPT and INTERSECT dedup rows, so a staged branch with accidental duplicate ids can silently shrink the gap; and the populations must be argued — 'funded' means shipped_at IS NOT NULL, 'completed' means status = 'delivered' — before the operator fires. Direction plus membership definitions is the whole answer; syntax is the easy ten percent.",
      tag: "setops",
    },
    {
      id: "affirm-t13",
      q: "The monthly GMV fold feeds two reads — the raw 14-month spine and the months above 3,000. Derived table or CTE — what actually changes?",
      a: "Mechanically nothing: both stage the fold before the outer query can filter it, because WHERE cannot see aggregates that have not been computed. What changes is governance. WITH monthly AS (...) names the fold and can reference it twice — one definition of the 3,731.97 opener and the 1,193.86 July trough behind both the spine and the 3,000-line cut. Nested derived tables make each layer's grain implicit, and grain drift is exactly how two slides in the same deck disagree about what a month is. At Affirm the monthly fold IS the KPI everyone quotes, so it gets written once, named, and audited row by row — the CTE is the audit handle.",
      tag: "subqueries",
    },
    {
      id: "affirm-t14",
      q: "Compare each checkout against its merchant's average ticket. Scalar, correlated, or EXISTS — which shape, and what does each buy?",
      a: "Scalar for the book-wide bar: WHERE total > (SELECT AVG(total) FROM orders) — the 338.19 mean — with the 0-or-1-row contract stated out loud. Correlated when the baseline is per-group: each checkout against ITS merchant's mean re-runs the inner fold per outer row and answers a different question — Nordic's ticket mix against Nordic's baseline, not the book's. EXISTS when the ask is membership, not value: it is a semi-join that never doubles the fan-out, which matters here because joining order_items multiplies rows and a careless COUNT then counts lines as checkouts. The panel's follow-up is always 'compared to what population, at what grain?' — pick the shape that answers it, not the one that types fastest.",
      tag: "subqueries",
    },
    {
      id: "affirm-t15",
      q: "Due dates, aging buckets and weekday reads on TEXT timestamps — which functions do you reach for, and which traps eat an afternoon?",
      a: "JULIANDAY for REAL day deltas: booking-to-funding averages 2.98 days on the 82 stamped checkouts, and aging is julianday(reference) - julianday(due). DATE(created_at, '+30 days') models this book's uniform 30-day statement terms — the terms spread reads exactly 30/30/30. Month cuts are half-open ranges, never BETWEEN on the last day. STRFTIME is the trap shelf: '%m' without '%Y' merges Januaries across years; '%d' is day-of-month, so cross-month spans go negative; '%w' returns TEXT '0'..'6' and comparing it to numeric 0 silently matches nothing. Every date function here returns text or real — the failure mode is never an exception, it is a quietly wrong bucket.",
      tag: "dates",
    },
    {
      id: "affirm-t16",
      q: "A filtered staging cut leaves one region with zero checkouts. Should its cancel share read 0% or NULL — and how do you enforce whichever you choose?",
      a: "NULL. A rate over no population is not zero — zero is a claim that the funnel ran and converted perfectly, and risk decks staff collections pods off exactly that cell. Enforce it in the expression: NULLIF(COUNT(*), 0) under the division turns the empty denominator into NULL and the share prints NULL. The subtlety worth saying aloud: SQLite's x/0 already returns NULL rather than erroring, and COUNT(*) never returns NULL, so IFNULL(COUNT(*), 0) is the wrong tool twice — it no-ops on the count and 'fixes' nothing. The guard is policy made visible, and it ports to engines where division by zero raises. The same rule governs the pending rows: an absent funding stamp is NULL by definition, never a coalesced zero.",
      tag: "nulls",
    },
    {
      id: "affirm-t17",
      q: "This db is tiny — 103 checkouts, 251 lines. Why do performance instincts still matter in an Affirm screen, and which instincts are graded?",
      a: "Because the query you write at the interview is the one that runs against millions of amortizing schedules, and the instincts transfer even when the latency does not. The graded ones: keep predicates sargable — the half-open created_at range beats SUBSTR-wrapped columns, because a function on the column hides the index; filter before the fold — WHERE status first shrinks the 251-line fan-out before GROUP BY touches it; never SELECT * over a line-grain join into a stakeholder's browser; and COUNT(DISTINCT …) only where the business grain demands it, because distinct folds are the expensive part of a two-grain census. The honest answer also names the scale jump: 'on 103 rows everything is instant — I write it as if it were 103 million.'",
      tag: "performance",
    },
    {
      id: "affirm-t18",
      q: "Filter to each merchant's single biggest financed line. Why can't WHERE see the window, and what are the two honest shapes?",
      a: "The logical pipeline is FROM → WHERE → GROUP BY → HAVING → SELECT (window functions evaluate here) → ORDER BY → LIMIT. At WHERE time the window fold does not exist, so WHERE unit_price = MAX(unit_price) OVER (PARTITION BY supplier_id) is a misuse error, not a slow query. Shape one: stage the window in a derived table or CTE — SELECT …, RANK() OVER (PARTITION BY … ORDER BY line_gmv DESC) AS r — and filter r = 1 outside, which also handles ties honestly. Shape two: a correlated fold per merchant when the population is small. What is never honest is filtering on the window in the same SELECT and hoping — the same reason HAVING cannot see SELECT aliases. The pipeline order is not trivia; it is the grammar that decides which comparisons can exist.",
      tag: "pipeline",
    },
    {
      id: "affirm-t19",
      q: "Define this book's funnel — booked, approved, funded, completed — with statuses and denominators. Where do the two rate definitions usually get fought over?",
      a: "Booked = every financed checkout, 103. Approved = booked less the reversals — the 7 cancelled rows reversed before funding — so approvals read 96 and the approval rate derives to 93.2%. Funded = the 82 rows carrying the shipped_at stamp: funding rate 82/103 = 79.6%, and the 14 pending stay in the denominator because 'approved but not yet funded' is the population the metric watches. Completed = 52 delivered, 50.5%. The fights: whether cancelled belongs in the approval base (it does — a reversal is an approved-then-died checkout, not a denial) and whether the funding rate's denominator is bookings or approvals — different questions, both legitimate, only one of them the Monday metric. State the denominator before the division or the funnel is a Rorschach test.",
      tag: "kpis",
    },
    {
      id: "affirm-t20",
      q: "Merchant fees bill as take-rate × GMV per partner. Why does this fee book frighten finance, and what do you compute first?",
      a: "Concentration. Nordic Gadgets AB carries 11,130.25 — 32% of the 34,833.28 book — and with Midwest Hardware Co's 9,294.93 (26.7%) the top two partners hold 58.7% of GMV. One renegotiation, one churn event, one merchant-side refund wave and the fee line moves by double digits. First compute the ladder — GMV per merchant with share of book, one join through products.supplier_id and one fold — then fee-at-risk: partner GMV × the take-rate delta on the table. The decoy is quality: Alpine Audio GmbH's 4.8 is the best rating on the bench and its 4,765.63 is barely 13.7% — rating is a churn predictor, not exposure. The fee book is a concentration story wearing a revenue costume.",
      tag: "kpis",
    },
    {
      id: "affirm-t21",
      q: "How do you define delinquency and vintage reads when the statements are the receivables? Say what each bucket must reconcile to.",
      a: "Delinquency lives on the open book: 6 statements worth 19,609.00, aged by days past due and bucketed — current, 1–30, 31–60, 61+ — with the buckets summing back to 19,609.00 by construction, or the aging is decoration. The partial is the teaching case: #25 sits open at 6,148.00 with 4,000.00 collected — current-but-behind, and the classification must name it, not fold it into 'current' by wishful CASE ordering. Vintage reads cohort statements by issue month and tracks them forward together, so mix shift (a small February) never masquerades as deterioration. Roll rates — the share of a bucket migrating one bucket deeper — are the earliest signal; a snapshot says where the book is, a roll says where it is going.",
      tag: "kpis",
    },
    {
      id: "affirm-t22",
      q: "Define collections coverage and the settlement clock on this book — and why does the leg census sit underneath both?",
      a: "Coverage is billed versus collected, one CASE away: 21 exact, 1 partial (#25 at 4,000.00 of 6,148.00), 6 none — 28 by construction. The settlement clock runs issue-to-first-payment on the paid book: 28.4 days average against uniform 30-day terms, 13 fastest, 84 slowest — the 84 is a conversation, not a rounding note. Underneath both sits the leg census: 6 statements with zero legs, 17 with one, 5 with two — and the five split-rail cycles ride both card (16 legs, 37,364.00) and wire (11 legs, 32,248.00). A paid status with zero legs (#28, 1,756.00) breaks coverage and the clock at once, because both metrics assume legs are the ledger of record. Count legs before you trust any status.",
      tag: "kpis",
    },
    {
      id: "affirm-t23",
      q: "A statement's status says 'paid'; the installments table has no rows for it. What is your data-quality policy when a claim and the ledger disagree?",
      a: "The ledger of record wins, and the disagreement becomes a row in the exception queue — never an adjustment, never an average. This book carries both mirror anomalies: #28 reads paid with zero installment legs (1,756.00 promised, nothing collected) and #11 reads void while carrying a live 925.00 leg. The first fails silently in every coverage metric; the second hides from anti-joins, which is why the queue is row-level and bidirectional. The policy that makes this tractable: reconcile by construction — status counts sum to 103, coverage arms to 28, ledger debits to 181,080 against 181,080 credits, delta zero — and any fold that cannot be reconciled to those anchors does not ship. A close with an unexplained delta is not a close; it is tomorrow's incident.",
      tag: "quality",
    },
    {
      id: "affirm-t24",
      q: "Two analysts print different 'average prices' for the same trusted-supplier bench — 139.66 and 133.55. Who is wrong, and what is the rule?",
      a: "Neither — they computed different statistics and both called them 'average price'. 139.66 is the mean of product-row prices per supplier (AVG over the supplier's catalog rows); 133.55 is lines-weighted over financed lines. Both are legitimate; neither is interchangeable. The rule at any shop that moves money: every average ships with its grain — per financed line (the 31.01 / 115.85 seat-band arms), per checkout (the 338.19 ticket), per catalog row, units-weighted or not — stated in the title, not discovered in review. The panel's real question is never 'can you compute AVG' — it is 'average of what, over which population, weighted how?' A number without its grain is not wrong; it is meaningless.",
      tag: "reporting",
    },
  ],

  mcqs: [
    {
      id: "affirm-mcq-1",
      prompt: "A checkout row's status reads 'delivered'. In this kit's Affirm lifecycle map, what happened?",
      choices: ["Paid in full — the schedule ran to term end", "Funded and amortizing — mid-schedule", "Cancelled or returned before funding", "Approved at checkout but not yet funded"],
      answer: 0,
      why: "The lifecycle map is fixed: delivered = paid in full — 52 of 103 checkouts (50.5%). It is the only status where the payment schedule actually completed.",
      notes: [
        { choice: 1, why: "Funded-and-amortizing is 'shipped' — 30 checkouts carrying a funding stamp but no completed term. Calling them paid-in-full inflates the completion rate before a single schedule finishes." },
        { choice: 3, why: "Approved-not-funded is 'pending' — 14 checkouts with no shipped_at yet. Pending is not churn and not completion; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "affirm-mcq-2",
      prompt: "Funding rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 funded, 14 pending and 7 cancelled of 103 booked.",
      choices: ["Funded + cancelled only (82/89 = 92.1%)", "All checkouts booked (82/103 = 79.6%)", "Paid-in-full checkouts only (52/82)", "Distinct shoppers (82/16)"],
      answer: 1,
      why: "The house definition: funded ÷ ALL checkouts booked — pending approvals stay in the denominator because 'approved but not yet funded' is exactly the population the metric exists to watch. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pending inflates the rate to 92.1% by deleting the approvals still waiting to fund — the rows the funding queue exists to monitor." },
        { choice: 2, why: "52/82 mixes two lifecycle steps into one rate — delivered is term completion, shipped_at is funding. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "affirm-mcq-3",
      prompt: "The US runs 19 financed checkouts from 2 shoppers. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts checkout rows (19); COUNT(DISTINCT customer_id) folds repeats back to shoppers (2). The gap between them — 9.5 checkouts per shopper — is the intensity read that says US volume is concentrated.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 19 again, since every checkout has a shopper. Without DISTINCT both columns read 19 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not shoppers — a third grain nobody asked for. The census is checkouts AND borrowers." },
      ],
      difficulty: "easy",
    },
    {
      id: "affirm-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division? APAC's cancel share should print 8.1%.",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled checkouts only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the cancel share truncates toward 0 and every region reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1 and a displayed 8.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the regional cancel map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "affirm-mcq-5",
      prompt: "Keep only regions carrying at least 20 checkouts. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 20, before GROUP BY", "GROUP BY region HAVING COUNT(*) >= 20", "WHERE checkouts >= 20 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A checkout-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db EU (45) and APAC (37) clear the bar; the US (19) and LATAM (2) drop out by one and by eighteen.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'checkouts' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "affirm-mcq-6",
      prompt: "Why is the house dollar read ROUND(amount_cents / 100.0, 2) rather than ROUND(amount_cents / 100, 2)?",
      choices: ["100.0 forces real division so odd-cent rows don't truncate; 100 keeps INTEGER arithmetic and eats cents", "100.0 rounds the result; 100 does not", "SQLite cannot divide INTEGER columns by INTEGER literals", "No difference — both forms always print identical dollars"],
      answer: 0,
      why: "INTEGER / INTEGER is integer division in SQLite: any statement whose cents don't divide evenly by 100 truncates the fractional dollars before ROUND ever runs. The .0 promotes the whole expression to real arithmetic — the cents rule every finance query here follows.",
      notes: [
        { choice: 1, why: "The multiplier choice is about arithmetic type, not rounding. ROUND happens after — too late to recover cents the integer division already deleted." },
        { choice: 3, why: "On round-dollar amounts the two forms coincide, which is exactly why the bug survives code review — the next odd-cent row is where the books drift." },
      ],
      difficulty: "medium",
    },
    {
      id: "affirm-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending checkouts double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the funded-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 checkouts.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would drop below 2.98 and the regional map would drift with it. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "affirm-mcq-8",
      prompt: "A staging dunning list uses statement_id NOT IN (SELECT invoice_id FROM installments WHERE method = 'wire') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL invoice_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the dunning list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every installment carries an invoice_id. But staging tables are exactly where NULLs sneak in, and empty risk reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "affirm-mcq-9",
      prompt: "A board packet stacks open statements under paid statements in one layout, built with UNION. A reviewer says one statement's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same id, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same statement id, same amounts, no branch label — collapse into one, and the packet loses a statement with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate repeat exists (one statement appearing in two views), UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "affirm-mcq-10",
      prompt: "Find statements where collected dollars differ from billed: WHERE SUM(p.amount_cents) <> i.amount_cents. The query errors. Why, and what is the fix?",
      choices: ["Move the SUM into WHERE with a column alias — aliases are visible there", "Aggregates cannot live in WHERE — GROUP BY statement and use HAVING SUM(p.amount_cents) <> i.amount_cents, or fold in a derived table", "SQLite allows aggregates in WHERE; the error must be a typo elsewhere", "Cast i.amount_cents to REAL and the WHERE clause will compile"],
      answer: 1,
      why: "WHERE evaluates per row before groups exist, so an aggregate there is a misuse-of-aggregate error. The comparison needs a fold: GROUP BY the statement and compare in HAVING, or stage the per-statement sums in a derived table and join back. Both shapes surface the partial (#25: 4,000.00 collected of 6,148.00) and the paid-with-nothing (#28) honestly.",
      notes: [
        { choice: 0, why: "SELECT aliases are not visible at WHERE time — the pipeline has not reached SELECT yet. Same error, moved one clause." },
        { choice: 3, why: "The failure is semantic, not type-based. Casting changes nothing about aggregates living in a row-level clause." },
      ],
      difficulty: "hard",
    },
    // — Expansion (Task 103, wave-3x): mcqs 11-30 appended; difficulty mix 7 easy /
    // 8 medium / 5 hard. New concepts only — frames, set direction, staging, cents
    // traps, rails, servicing — grounded in Affirm's approval funnel, 0% APR vs APR
    // split, merchant-fee book and statement servicing. No prompt repeats mcq 1-10.
    {
      id: "affirm-mcq-11",
      prompt: "Merchant analytics quotes 2.44 lines per financed checkout (251 lines / 103 checkouts). Which expression produces that number?",
      choices: [
        "COUNT(*) over order_items divided by COUNT(DISTINCT order_id) over order_items",
        "AVG(quantity) over order_items",
        "COUNT(*) over order_items divided by COUNT(DISTINCT customer_id) from orders",
        "SUM(quantity) over order_items divided by COUNT(*) over orders",
      ],
      answer: 0,
      why: "251 financed lines over 103 distinct checkouts is 2.44 — lines per basket. The numerator counts lines, the denominator folds to the checkout grain; both come from order_items, folded at different keys.",
      notes: [
        { choice: 1, why: "AVG(quantity) is 498/251 = 1.98 — units per LINE, a different metric. Depth is lines per checkout, not units per line." },
        { choice: 2, why: "Folding to shoppers (16) prints 15.69 — checkouts per borrower. A true number wearing the wrong KPI's name." },
        { choice: 3, why: "498 units over 103 checkouts is 4.83 — units per checkout. quantity counts units; the line count is rows." },
      ],
      difficulty: "easy",
    },
    {
      id: "affirm-mcq-12",
      prompt: "Merchant fees bill as take-rate × GMV per partner. Which merchant partner carries the largest fee base on this book?",
      choices: [
        "Nordic Gadgets AB — 11,130.25 GMV, 32% of the book",
        "Midwest Hardware Co — 9,294.93 GMV, 26.7%",
        "Alpine Audio GmbH — the 4.8-rated partner",
        "Andes Naturals SA — 3,613.25 GMV",
      ],
      answer: 0,
      why: "The fee base rides financed GMV: Nordic's 11,130.25 is 32% of the 34,833.28 book — the largest single-partner dependency — and with Midwest the top two hold 58.7%.",
      notes: [
        { choice: 1, why: "Midwest is the #2 base — real money, but the concentration headline is Nordic's 32%, and one renegotiation there moves the whole fee line." },
        { choice: 2, why: "4.8 is the highest quality rating on the bench — rating is not revenue. Alpine's 4,765.63 is barely 13.7%." },
        { choice: 3, why: "Andes trails at 10.4% — a diversification footnote, not a fee-base leader." },
      ],
      difficulty: "easy",
    },
    {
      id: "affirm-mcq-13",
      prompt: "The 0% APR Pay-in-4 product targets smaller baskets; interest-bearing monthly plans carry the big tickets. On the 55.00 seat-line fold, which arm is the Pay-in-4 target?",
      choices: [
        "The 268 units below the line, averaging a 31.01 line price",
        "The 230 units above the line, averaging 115.85",
        "Both arms equally — the fold is product mix, not eligibility",
        "Neither — the fold only measures merchant performance",
      ],
      answer: 0,
      why: "The below-the-line arm — 268 units at a 31.01 average line price — is the small-basket population the interest-free product is built for; the 115.85 arm is where APR-bearing monthly schedules earn.",
      notes: [
        { choice: 1, why: "That is the interest-bearing arm — reversing the map books 0% economics against the tickets that pay interest." },
        { choice: 2, why: "'Equally' erases the fold's point: 268 versus 230 units is near parity, but 31.01 versus 115.85 is the whole revenue story." },
        { choice: 3, why: "The fold splits financed lines by ticket — the same split the product eligibility rules ride. Merchant attribution is a separate join." },
      ],
      difficulty: "easy",
    },
    {
      id: "affirm-mcq-14",
      prompt: "Funding latency = booking to funding stamp, averaged 2.98 days on this book. Which expression computes it correctly on TEXT timestamps?",
      choices: [
        "julianday(shipped_at) - julianday(created_at)",
        "shipped_at - created_at",
        "DATE(shipped_at, created_at)",
        "STRFTIME('%d', shipped_at) - STRFTIME('%d', created_at)",
      ],
      answer: 0,
      why: "julianday converts each TEXT stamp to a REAL day number; the delta averages 2.98 with a 2–4 day spread over the 82 stamped checkouts.",
      notes: [
        { choice: 1, why: "String minus string coerces both sides to numbers — '2024-01-04' minus '2024-01-01' is 2024 minus 2024, a silent 0. No error, no latency." },
        { choice: 2, why: "DATE() takes one date plus modifiers, not two arguments — malformed usage, not a difference function." },
        { choice: 3, why: "'%d' is day-of-MONTH — a Jan 31 → Feb 02 pair reads -29. Month boundaries corrupt every cross-month funding." },
      ],
      difficulty: "easy",
    },
    {
      id: "affirm-mcq-15",
      prompt: "A running-total read folds financed GMV with SUM(total) OVER (ORDER BY created_at). Several checkouts share the same created_at value. What does the default window frame do at those ties?",
      choices: [
        "RANGE by default — peer rows share the frame boundary, so the running total leaps by the whole tie group at once",
        "ROWS by default — one row at a time regardless of ties",
        "The default frame excludes peers — each row's total counts only itself",
        "Ties cannot occur — created_at is unique per checkout",
      ],
      answer: 0,
      why: "With ORDER BY and no frame clause the default is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — and RANGE includes peer rows. A running exposure total that leaps by the whole tie group misstates the position between tied checkouts; ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is the fix.",
      notes: [
        { choice: 1, why: "ROWS is the FIX, not the default — you have to write it. Assuming it shipped by default is how tie-leaps survive review." },
        { choice: 3, why: "On this book checkouts share dates freely — 103 checkouts over a 424-day span guarantees collisions. The tie group is real." },
      ],
      difficulty: "hard",
    },
    {
      id: "affirm-mcq-16",
      prompt: "Find each merchant's single biggest financed line. Why does WHERE unit_price = MAX(unit_price) OVER (PARTITION BY supplier_id) fail?",
      choices: [
        "Window functions evaluate after WHERE — the fold does not exist yet; stage the window in a derived table or CTE, then filter",
        "MAX() OVER () is not valid SQLite syntax",
        "It works — windows compute before WHERE, like every aggregate",
        "PARTITION BY requires a JOIN to suppliers first",
      ],
      answer: 0,
      why: "The pipeline runs FROM → WHERE → GROUP BY → HAVING → SELECT (windows evaluate here) → ORDER BY → LIMIT. At WHERE time no window value exists, so the comparison is a misuse error. Stage the window in an inner SELECT, filter outside.",
      notes: [
        { choice: 1, why: "MAX OVER is valid — the failure is pipeline position, not syntax. The error text points at aggregates, the wrong culprit." },
        { choice: 2, why: "Backwards. Windows are deliberately last-but-two in the pipeline — that is WHY they cannot be filtered in the same SELECT." },
        { choice: 3, why: "PARTITION BY works on any column already in the row set. The join is irrelevant to the error." },
      ],
      difficulty: "medium",
    },
    {
      id: "affirm-mcq-17",
      prompt: "Risk wants 'funded checkouts that never reached term' — the 30 amortizing rows. Which set operation returns them from the funded population (82) and the completed population (52)?",
      choices: [
        "funded EXCEPT completed — subtraction in that order",
        "completed EXCEPT funded",
        "funded INTERSECT completed",
        "funded UNION completed",
      ],
      answer: 0,
      why: "EXCEPT is directional: funded (82) minus delivered (52) leaves the 30 shipped-and-amortizing checkouts; the reverse direction returns zero because delivered is fully contained in funded.",
      notes: [
        { choice: 1, why: "Reversed, the subtraction returns an empty set — every completed checkout is also funded. Direction IS the answer." },
        { choice: 2, why: "INTERSECT returns the 52 completers — the population risk just subtracted away, not the gap." },
        { choice: 3, why: "UNION stacks and dedups to 82 — the whole funded book, subtraction undone." },
      ],
      difficulty: "easy",
    },
    {
      id: "affirm-mcq-18",
      prompt: "A filtered staging cut leaves one region with ZERO checkouts. What should its cancel share read, and how is that enforced?",
      choices: [
        "NULL — no population, no rate; enforced with NULLIF(COUNT(*), 0) under the division",
        "0% — no cancels were observed in that region",
        "IFNULL(COUNT(*), 0) under the division — fill the count before dividing",
        "CAST(COUNT(*) AS REAL) under the division — type is the issue",
      ],
      answer: 0,
      why: "An empty population has no rate: 0% claims the funnel ran and converted perfectly. NULLIF(COUNT(*), 0) turns the zero denominator into NULL and the share prints NULL — honest absence. SQLite's x/0 already returns NULL, but COUNT(*) is never NULL, so the IFNULL shape cannot see the problem; NULLIF states the policy and ports to engines where division by zero raises.",
      notes: [
        { choice: 1, why: "0% is the silent lie: it reports a measured conversion on a population that never existed. Risk decks staff pods off exactly this cell." },
        { choice: 2, why: "IFNULL replaces NULL with 0 — backwards. COUNT(*) never returns NULL, so the guard no-ops and the empty region still divides." },
        { choice: 3, why: "The CAST fixes integer truncation, not the empty-population claim. Right domain, wrong failure mode." },
      ],
      difficulty: "medium",
    },
    {
      id: "affirm-mcq-19",
      prompt: "The catalog sheet folds each merchant's financed SKUs into one cell with GROUP_CONCAT(p.name). A reviewer flags that SKU order inside cells is arbitrary. The fix:",
      choices: [
        "GROUP_CONCAT(p.name, ', ' ORDER BY p.price DESC) — ORDER BY inside the aggregate (SQLite 3.44+)",
        "ORDER BY p.price DESC outside the query — rows order, cells follow",
        "GROUP_CONCAT already sorts alphabetically by default",
        "ORDER BY has never been legal inside an aggregate — stage and fold manually on every engine",
      ],
      answer: 0,
      why: "Modern SQLite (3.44+) accepts ORDER BY inside aggregate bodies, so the folded cell carries a deterministic, stated order. On older engines, stage rows ordered, then fold — and say which you did.",
      notes: [
        { choice: 1, why: "An outer ORDER BY orders ROWS, not the sequence inside a folded cell — the cell order stays arbitrary." },
        { choice: 2, why: "The default is row visitation order — whatever the plan served. 'Alphabetical by default' is how two runs print different cells." },
        { choice: 3, why: "It is legal on current SQLite — the honest answer names the version, then falls back to staging only if the engine predates it." },
      ],
      difficulty: "medium",
    },
    {
      id: "affirm-mcq-20",
      prompt: "The double-charge audit pairs installment legs that hit the SAME statement on the SAME paid_on date. Which self-join shape returns each pair once?",
      choices: [
        "JOIN payments b ON a.invoice_id = b.invoice_id AND a.id < b.id AND a.paid_on = b.paid_on",
        "JOIN payments b ON a.invoice_id = b.invoice_id AND a.id <> b.id AND a.paid_on = b.paid_on",
        "JOIN payments b ON a.invoice_id = b.invoice_id",
        "JOIN payments b ON a.invoice_id = b.invoice_id AND a.paid_on <= b.paid_on",
      ],
      answer: 0,
      why: "a.id < b.id canonicalizes the unordered pair — one row per match, both dates equal. The 5 split-rail cycles carrying two legs print exactly once each.",
      notes: [
        { choice: 1, why: "<> matches both orientations — every pair prints twice and the double-charge count doubles. Canonicalize with < or fold late." },
        { choice: 2, why: "invoice_id alone pairs every leg combination across ALL dates — the date condition is the actual audit." },
        { choice: 3, why: "<= pairs every leg with itself (a.id = b.id passes) — each leg 'pairs' on every row it appears in." },
      ],
      difficulty: "medium",
    },
    {
      id: "affirm-mcq-21",
      prompt: "The board packet needs the monthly GMV fold twice — the raw 14-month spine and the months above 3,000. Why stage WITH monthly AS (...)?",
      choices: [
        "The fold is written once, audited once, and referenced twice — one definition of 'monthly GMV' behind both reads",
        "WITH always executes faster than an equivalent subquery",
        "WITH is the only way to use SUM twice in one query",
        "CTEs materialize on write, so the second read cannot drift from the first",
      ],
      answer: 0,
      why: "The monthly fold is a KPI — the 3,731.97 opener, the 1,193.86 July trough. One named definition means the spine and the 3,000-line cut cannot disagree about what a month is.",
      notes: [
        { choice: 1, why: "SQLite inlines CTEs — no guaranteed speedup. The win is single-definition correctness, not cycles." },
        { choice: 2, why: "SUM folds anywhere. WITH buys structure and a name, not new capability." },
        { choice: 3, why: "MATERIALIZED is a hint, not a contract — drift protection comes from writing the fold once, not from a keyword." },
      ],
      difficulty: "medium",
    },
    {
      id: "affirm-mcq-22",
      prompt: "The weekend-settlement read filters STRFTIME('%w', paid_on) = 0 for Sunday and returns NOTHING — but the packet says Sundays exist. Diagnosis?",
      choices: [
        "STRFTIME returns TEXT — '0' never equals numeric 0; compare against '0'",
        "%w is Monday-based — Sunday is 7, not 0",
        "STRFTIME cannot run on the paid_on column",
        "0 must be wrapped in double quotes to compare against text",
      ],
      answer: 0,
      why: "'%w' returns '0'..'6' as TEXT, and in SQLite every number sorts before every text — '0' = 0 is never true, so the Sunday rows silently vanish. Compare text to text: = '0'.",
      notes: [
        { choice: 1, why: "'%w' is Sunday-based — 0 through 6. The code was right; the TYPE was wrong." },
        { choice: 2, why: "STRFTIME takes any date-shaped text — paid_on qualifies. Nothing about the call fails." },
        { choice: 3, why: "Double quotes are an identifier fallback in SQLite — the fix is quoting the VALUE as text ('0'), not switching quote style." },
      ],
      difficulty: "medium",
    },
    {
      id: "affirm-mcq-23",
      prompt: "The growth deck wants each region's share of booked GMV in one pass over GROUP BY region. Which expression computes the denominator correctly?",
      choices: [
        "SUM(SUM(o.total)) OVER () — the window folds the group-level sums across the whole set",
        "SUM(o.total) OVER () — the window sums the raw rows",
        "COUNT(*) OVER () — the share's denominator is the checkout count",
        "Windows cannot run after GROUP BY — the share needs a second query",
      ],
      answer: 0,
      why: "With GROUP BY region, SUM(o.total) is the per-region fold; wrapping it — SUM(SUM(o.total)) OVER () — folds those group sums across all regions into one book-total denominator, and the share column reads region ÷ book.",
      notes: [
        { choice: 1, why: "After GROUP BY, o.total is not a group fold — the window over the bare column reads an arbitrary row per region and prints noise. The nested SUM(SUM(...)) is what makes the window consume the fold." },
        { choice: 2, why: "A headcount denominator answers 'share of checkouts', not 'share of GMV' — a different KPI wearing the same words." },
        { choice: 3, why: "Windows are DESIGNED to run after grouping — GROUP BY plus OVER () is exactly the share-of-partition shape." },
      ],
      difficulty: "hard",
    },
    {
      id: "affirm-mcq-24",
      prompt: "Servicing flags shoppers whose latest two financed checkouts run delivered then cancelled. What makes LAG the tool, and what breaks without PARTITION BY customer_id?",
      choices: [
        "LAG(status) OVER (PARTITION BY customer_id ORDER BY created_at) puts each checkout's predecessor beside it — the sequence becomes a column; without the partition the walk crosses shopper boundaries",
        "LAG sorts the table physically, so no partition is ever needed",
        "WHERE can compare the previous row directly if you ORDER BY first",
        "LEAD is the only function that reads the prior row",
      ],
      answer: 0,
      why: "LAG reads across a partition's logical order and hands each row its predecessor — delivered-beside-cancelled becomes a filterable pair. Without PARTITION BY customer_id, one borrower's prior becomes another's and every flag is contaminated.",
      notes: [
        { choice: 1, why: "LAG changes no storage order — it reads across the partition's logical sequence. 'Physically sorted' is the myth that hides cross-shopper leaks." },
        { choice: 2, why: "WHERE sees one row — the pipeline never hands it a predecessor. That is why the flag needs the window (or a self-join)." },
        { choice: 3, why: "LEAD reads the NEXT row; LAG reads the prior. Flipping them flips every flag on the book." },
      ],
      difficulty: "hard",
    },
    {
      id: "affirm-mcq-25",
      prompt: "The close prints coverage — exact / partial / none — in ONE pass and must sum to 28 statements. Which shape reconciles by construction?",
      choices: [
        "COUNT(*) FILTER (WHERE ...) arms over the statements-with-legs join — one scan, one denominator, arms summing to 28",
        "Three separate COUNT queries pasted into a spreadsheet",
        "SUM(CASE WHEN ... THEN 'exact' ELSE ... END) returning the label strings",
        "GROUP BY a stored coverage column on invoices",
      ],
      answer: 0,
      why: "FILTER branches per aggregate: 21 exact, 1 partial (#25 at 4,000.00 of 6,148.00), 6 none — 28 by construction, because every statement lands in exactly one arm of the same scan.",
      notes: [
        { choice: 1, why: "Three scans are three denominators that can drift between screenshots — the reconciliation exists to kill that drift, not automate it." },
        { choice: 2, why: "SUM over label strings counts nothing — the arms never materialize. The CASE must feed a COUNT or a 0/1 SUM." },
        { choice: 3, why: "There is no stored coverage column — coverage is DERIVED from billed versus collected, which is the entire exercise." },
      ],
      difficulty: "hard",
    },
    {
      id: "affirm-mcq-26",
      prompt: "Two July reads return identical rows: WHERE SUBSTR(created_at,1,7) = '2024-07' versus created_at >= '2024-07-01' AND created_at < '2024-08-01'. Why does the range shape win at BNPL scale?",
      choices: [
        "The range keeps the predicate sargable — an index on created_at stays usable; wrapping the column in SUBSTR hides it from the planner and forces a scan",
        "SUBSTR cannot use indexes at all — functions are always banned on filtered columns",
        "The range is shorter SQL, and shorter SQL is faster",
        "They are identical — SQLite rewrites SUBSTR predicates into ranges automatically",
      ],
      answer: 0,
      why: "103 checkouts hide the cost; millions of amortizing schedules do not. The half-open range lets the engine seek the index; the SUBSTR wrapper turns the column into an expression, and every row gets read.",
      notes: [
        { choice: 1, why: "SUBSTR works fine functionally — the loss is planner visibility, not legality. The term is 'unsargable', not 'banned'." },
        { choice: 2, why: "Query length is not the cost model. Index usability is." },
        { choice: 3, why: "No such rewrite exists. The planner does not peel functions off columns — that is the whole trap." },
      ],
      difficulty: "medium",
    },
    {
      id: "affirm-mcq-27",
      prompt: "Monday's collections packet quotes the open statement book. Which bucket holds 19,609.00?",
      choices: [
        "The 6 open statements",
        "The 21 paid statements",
        "The 1 void statement",
        "The 5 open statements with zero legs",
      ],
      answer: 0,
      why: "The status census reads 6 open for 19,609.00, 21 paid for 66,443.00, 1 void for 925.00 — the open book is a status cut over all 28 statements.",
      notes: [
        { choice: 1, why: "Paid is the settled book — 66,443.00. Quoting it as open understates exposure by the whole open book." },
        { choice: 2, why: "Void is the single 925.00 anomaly (#11 — void status carrying a live 925.00 installment)." },
        { choice: 3, why: "The zero-leg open subset is the dunning cut: 5 statements, 13,461.00 — a slice of the open book, not the book." },
      ],
      difficulty: "easy",
    },
    {
      id: "affirm-mcq-28",
      prompt: "Settlement forecasting separates single-rail from split-rail cycles — 5 of the 28 statements settle on BOTH card and wire. Which HAVING clause finds them?",
      choices: [
        "HAVING COUNT(DISTINCT method) = 2",
        "HAVING COUNT(*) = 2",
        "HAVING method = 'card' AND method = 'wire'",
        "WHERE COUNT(DISTINCT method) = 2",
      ],
      answer: 0,
      why: "GROUP BY invoice_id, then count rail KINDS: two distinct methods means both rails. The card book is 16 legs for 37,364.00, wire 11 for 32,248.00 — and five cycles ride both.",
      notes: [
        { choice: 1, why: "COUNT(*) counts LEGS — a statement with two card legs passes but is single-rail. Legs are not rails." },
        { choice: 2, why: "One grouped row holds one method value per row — the AND is always false and the forecast loses all five splits." },
        { choice: 3, why: "Aggregates in WHERE — the pipeline-order error. It does not compile." },
      ],
      difficulty: "medium",
    },
    {
      id: "affirm-mcq-29",
      prompt: "The dunning cut wants OPEN statements with zero installment legs — 5 worth 13,461.00 — explicitly excluding the paid-but-empty lie (#28). Which query returns exactly that?",
      choices: [
        "WHERE i.status = 'open' AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)",
        "WHERE i.status = 'open' OR p.id IS NULL",
        "the bare anti-join alone — LEFT JOIN payments, keep p.id IS NULL",
        "WHERE i.status <> 'void' AND p.id IS NULL",
      ],
      answer: 0,
      why: "Two predicates compose: the status filter (open) and the leg anti-join (no installment rows) — 5 open statements, 13,461.00. #28 is paid, so the status filter removes the lie the bare anti-join would carry.",
      notes: [
        { choice: 1, why: "OR unions the populations — every open statement plus all six zero-leg statements; remitted and never-remitted money mixes in one total." },
        { choice: 2, why: "The bare anti-join returns 6 / 15,217.00 — it includes paid #28 (1,756.00), precisely the anomaly this cut exists to exclude." },
        { choice: 3, why: "<> 'void' re-admits the paid lie: #28 still has no legs, so the cut reads 6 / 15,217.00 again. Void #11 has a leg either way." },
      ],
      difficulty: "hard",
    },
    {
      id: "affirm-mcq-30",
      prompt: "A new CASE arm adds 'premium' for price >= 200 to the catalog band census. What prints for the premium arm?",
      choices: [
        "Nothing — the arm is empty; the catalog ceiling is the 199.99 Smart Watch S",
        "One SKU — the Smart Watch S at 199.99 rounds into the band",
        "The 8 mid-band SKUs inherit into premium",
        "The query errors — CASE arms cannot be empty",
      ],
      answer: 0,
      why: "Nothing prices at or above 200.00 — the ceiling SKU is 199.99. The arm stays WRITTEN (bands must be exhaustive) and returns zero rows: honest silence, not an error.",
      notes: [
        { choice: 1, why: "199.99 < 200 — the watch stays mid. Rounding the boundary to fit the narrative is the banding bug the census exists to catch." },
        { choice: 2, why: "Mid holds 50–199.99. An arm keyed at >= 200 cannot inherit it — overlapping arms double-count SKUs." },
        { choice: 3, why: "Empty bands print zero rows quietly. Silence is the trap — the review must note the arm exists and is empty." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-affirm-1",
      tier: "easy",
      topic: "j7",
      universe: "catalog",
      title: "The financed-basket census",
      brief:
        "Affirm-flavored brief on the storefront db: merchant analytics opens the monthly mix review with the financed-basket census — per category, how much GMV the checkout financed, how many distinct SKUs that pulled, how many units moved and how many distinct checkouts carried it — biggest book first, because Affirm's underwriting economics live in ticket size, not unit count. Probed facts: Audio is the book's engine at 11,744.01 on just 97 units across 46 checkouts, while Accessories moves the most units (121) and the most checkouts (54) for only 3,294.29; Wearables holds 6,929.12 on 53 units; Fitness trails at 863.91 on 27 units and a single SKU. The catalog tops out at the 199.99 Smart Watch S — nothing sits in the 200-plus premium band.",
      ask: "Return each category with its financed GMV to 2 decimals, distinct SKUs financed, units and distinct checkouts financed, biggest GMV first.",
      template:
        "SELECT p.category AS category,\n       ROUND(SUM(oi.quantity * oi.unit_price), {1}) AS financed_gmv,\n       COUNT(DISTINCT p.id) AS skus_financed,\n       SUM(oi.quantity) AS units_financed,\n       COUNT({2} oi.{3}) AS checkouts_financed\nFROM order_items oi\nJOIN products p ON p.id = oi.{4}\nGROUP BY p.category\nORDER BY financed_gmv {5};",
      slots: [
        {
          answer: "2",
          kind: "number",
          label: "the cents precision",
          why: "Cents discipline: ROUND to 2 prints Audio's 11,744.01 exactly as the facts table reads it. ROUND(…, 1) prints 11,744.0 and the category census stops reconciling with the 34,833.28 GMV total finance quotes on the same slide.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the SKU deduplicator",
          why: "COUNT(DISTINCT p.id) folds financed lines back to SKUs: Audio reads 3, Fitness 1. SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is a census.",
        },
        {
          answer: "order_id",
          kind: "keyword",
          label: "the checkout grain",
          why: "The checkout grain is oi.order_id — DISTINCT over it counts checkouts, so Accessories reads 54, not its line count. oi.id counts lines and oi.unit_price counts distinct price points: valid SQL, wrong grains, wrong business numbers.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the catalog join key",
          why: "The catalog key is oi.product_id matching p.id. Joining oi.order_id or oi.id instead merges silently — valid SQL, garbage GMV. oi.customer_id does not exist and errors honestly, which is the better failure.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-book-first",
          why: "The review reads biggest book on top: Audio 11,744.01 leads, Fitness 863.91 closes. ASC opens the meeting on Fitness — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["1", "ALL", "SUM", "MAX", "customer_id", "ASC"],
      walkthrough:
        "One join, one fold, four columns at two grains. The join attaches every financed line to its catalog row, GROUP BY category folds the 251 lines into seven rows, and the census reads straight from the probed table: Audio 11,744.01 on 3 SKUs, 97 units, 46 checkouts; Wearables 6,929.12 (2/53/23); Video 5,198.41; Electronics 4,818.61; Accessories 3,294.29 (3/121/54); Apparel 1,984.93; Fitness 863.91 (1/27/13). The GMVs sum to the book's 34,833.28 — the reconciliation that makes the slide quotable. The two-grain read is the Affirm story: category checkout counts sum to 228 touches over 103 checkouts because baskets fan across categories, which is exactly why the checkout grain needs COUNT(DISTINCT oi.order_id) — and why Accessories can top checkout count (54) while ranking fifth on GMV. Volume without ticket is the underwriting trap: Audio earns 3.6x Accessories' GMV on 20% fewer units. The distractors fail honestly: 1 in the ROUND prints one decimal and breaks the cents reconciliation; ALL drops the dedup and counts lines; SUM and MAX nest an aggregate inside COUNT and error; customer_id is no such column in order_items; ASC opens the review on Fitness.",
    },
    {
      id: "cs-affirm-2",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The uncollected-exposure list",
      brief:
        "Affirm-flavored brief on the storefront db: Monday's collections standup opens with the dunning list — billing statements with zero installment dollars behind them — because at a lender the gap between billed and collected IS the risk book. Probed facts: 28 statements are live, 22 carry at least one of the 27 installment rows, and the anti-join leaves 6 statements worth 15,217.00: #24 open at 4,937.00, #26 at 3,562.00, #27 at 2,794.00, #21 at 1,295.00, #18 at 873.00 — and #28, which reads *paid* while carrying no installment row at all (1,756.00 promised, nothing collected). The mirror anomaly sits outside this list: void statement #11 collected a 925.00 installment. Deepest exposure first.",
      ask: "Return each statement with no installments — statement id, status and dollar exposure to 2 decimals — deepest exposure first.",
      template:
        "SELECT i.id AS statement_id,\n       i.status AS status,\n       ROUND(i.amount_cents / {1}, 2) AS exposure\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {3}\nORDER BY exposure {4};",
      slots: [
        {
          answer: "100.0",
          kind: "keyword",
          label: "the cents-to-dollars divisor",
          why: "Statements carry INTEGER cents, so the dollar read is amount_cents / 100.0 — the .0 forces real division before ROUND. Dividing by 10 or 1000 mis-scales every exposure by a factor of ten: #24 prints 49,370.00 or 4.94 instead of 4,937.00.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the survival join",
          why: "LEFT keeps every statement and NULL-fills the no-installment ones — the 6-row dunning list. INNER or CROSS keeps only matched rows: 22 collected statements, and the exposure book reads empty exactly when it is fullest.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the anti-join guard",
          why: "The survival test is p.id IS NULL — the NULL payload rows ARE the uncollected statements. Any other chip breaks the predicate: IS NOT alone does not parse, and IS 10 or IS 1000 filters on installment-row ids instead of testing for absence.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "deepest-exposure-first",
          why: "Deepest exposure first: #24 at 4,937.00 leads the dunning queue, #18 at 873.00 trails. ASC would work the smallest balance first — collections theater, not collections.",
        },
      ],
      distractors: ["INNER", "CROSS", "NOT", "10", "1000", "ASC"],
      walkthrough:
        "One LEFT JOIN, one survival test, cents read honestly. The LEFT JOIN attaches each of the 28 statements to whatever installments exist — 22 statements match at least one of the 27 installment rows — and WHERE p.id IS NULL keeps the 6 NULL-payload survivors: #24 open at 4,937.00, #26 at 3,562.00, #27 at 2,794.00, #28 PAID at 1,756.00, #21 at 1,295.00, #18 at 873.00 — summing to the probed 15,217.00. #28 is the row that makes the list worth running: a paid status with nothing behind it is a claim, not a ledger entry. The mirror anomaly never appears here: void #11 collected a 925.00 installment, so it survives the join — the coverage census (21 exact / 1 partial at 4,000.00 of 6,148.00 / 6 none) reconciles all 28 and needs its own CASE pass. The distractors fail honestly: INNER and CROSS turn the join into matched-rows-only and the risk book reads empty; NOT alone breaks the IS predicate and the query errors; dividing by 10 or 1000 mis-scales every exposure an order of magnitude; ASC works the smallest balance first while the 4,937.00 ages. Anti-join discipline is collections discipline: the list must reconcile to 6 and 15,217.00 or dunning ships blind.",
    },
    // — Expansion (Task 103, wave-3x): cases cs-affirm-3..6 appended. Topic families
    // s6/t7/q2/x2 — all different from the kit's existing j7 + j5 and from each other;
    // universes pricing/growth/fraud/expense; tiers easy/medium/medium/hard. Figures
    // from scripts/company-facts.md plus READ-ONLY probes of db/custom.db (regional
    // above-average cells, band folds, ledger account nets, monthly deltas).
    {
      id: "cs-affirm-3",
      tier: "easy",
      topic: "s6",
      universe: "pricing",
      title: "The underwriting band fold",
      brief:
        "Affirm-flavored brief on the storefront db: the pricing committee opens with the catalog band fold, because Affirm underwrites on ticket size and the catalog is the exposure map. Probed facts: split at the 50.00 line, the mid band holds 8 SKUs averaging 111.50 against budget's 8 at 32.06 — near-even SKU counts carrying wildly different money — and the 200-plus premium band is empty, the 199.99 Smart Watch S being the catalog ceiling. The review's materiality bar: a band must carry at least eight SKUs to print, so both live arms survive and any mis-banded sliver drops out. Biggest average first on the page.",
      ask: "Return each price band with its SKU count and average price to 2 decimals, biggest average first.",
      template:
        "SELECT CASE WHEN price >= {1} THEN {2} ELSE 'budget' END AS band,\n       COUNT(*) AS skus,\n       ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY {3}\nHAVING COUNT(*) >= {4}\nORDER BY avg_price {5};",
      slots: [
        {
          answer: "50",
          kind: "keyword",
          label: "the mid-band floor",
          why: "The house fold splits at 50.00: mid holds 8 SKUs averaging 111.50, budget 8 at 32.06. Move the line to 100 and mid collapses to 4 SKUs at 149.50 — a different exposure map; at 200 the arm empties entirely.",
        },
        {
          answer: "'mid'",
          kind: "keyword",
          label: "the above-line label",
          why: "The arm label is the quoted text 'mid' — unquoted mid reads as a column and errors, and 'Mid' would print a second, near-duplicate band that splits the census in two.",
        },
        {
          answer: "band",
          kind: "keyword",
          label: "the fold key",
          why: "GROUP BY band folds by the CASE output: two rows. GROUP BY category re-grains to seven category rows and the band column degenerates to one label per category; GROUP BY a constant folds everything into one row.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the materiality bar",
          why: "The review prints bands carrying at least eight SKUs — both live arms sit exactly on the bar (8 and 8) and survive. At 9 or 100 the fold prints nothing and the committee reviews an empty page.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-average-first",
          why: "The committee reads the money arm first: mid at 111.50 on top, budget 32.06 below. ASC opens the pricing review on the 32.06 arm — a correct query aimed at the wrong end of the table.",
        },
      ],
      distractors: ["100", "'Mid'", "category", "199.99", "ASC", "9"],
      walkthrough:
        "One table, one CASE, one fold — the whole banding discipline in five slots. The CASE arm fires at 50.00: 8 SKUs land mid (111.50 average), 8 stay budget (32.06), and the arm labels must be quoted text or the query errors on a phantom column. The fold key is the band alias — GROUP BY category would print seven rows with one band label each, the category census wearing band clothes, and GROUP BY a constant collapses to one row. The materiality bar sits in HAVING because it judges groups, not rows: both arms carry exactly 8 SKUs and survive; at 9 the census prints nothing, which is how a mis-banded catalog hides. The 200-plus premium arm never fires — the Smart Watch S at 199.99 stays mid — and the committee's slide notes the empty band rather than deleting it, because an unlisted arm is an unpriced exposure. Distractors fail honestly: 100 re-cuts the fold to 4/12 (149.50/45.87) and silently changes the map; 199.99 empties mid to one SKU; 'Mid' splits every band in two; category re-grains the fold; ASC opens on the cheap arm; 9 blanks the page. The averages sum-check against the brief: two bands, sixteen SKUs, one ceiling at 199.99.",
    },
    {
      id: "cs-affirm-4",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The monthly GMV spine walk",
      brief:
        "Affirm-flavored brief on the storefront db: the growth board walks the 14-month funding spine — 2024-01 to 2025-02 — with a prior-month delta column, because a BNPL book is judged on month-over-month movement, not snapshots. Probed facts: the book opens at 3,731.97, troughs at 1,193.86 in July 2024, and jumps +1,158.21 into August; only three months clear the 3,000 line (3,731.97 / 3,609.64 / 3,116.04). The walk must key months as 'YYYY-MM' — a '%Y'-only key merges the two Januaries and the spine becomes fiction — and the first row's delta is NULL by definition: the baseline, never a zero.",
      ask: "Return each month with GMV to 2 decimals and the prior-month delta to 2 decimals, calendar order.",
      template:
        "SELECT month,\n       ROUND(gmv, 2) AS gmv,\n       ROUND(gmv - LAG(gmv) OVER (ORDER BY {1}), 2) AS delta\nFROM (\n  SELECT STRFTIME('{2}', created_at) AS month,\n         SUM({3}) AS gmv\n  FROM orders\n  GROUP BY month\n)\nORDER BY {4};",
      slots: [
        {
          answer: "month",
          kind: "keyword",
          label: "the walk's order key",
          why: "LAG must walk the calendar: OVER (ORDER BY month) hands each month its predecessor. Ordering the window by gmv scrambles the priors — August's +1,158.21 becomes -38.46 — and created_at does not exist in the staged spine.",
        },
        {
          answer: "%Y-%m",
          kind: "keyword",
          label: "the month-key format",
          why: "STRFTIME('%Y-%m', created_at) keys 14 buckets, 2024-01 through 2025-02. '%Y' alone merges to 13 (both years fold), '%m' merges the two Januaries — and the merged months print blended GMVs that match no slide.",
        },
        {
          answer: "total",
          kind: "keyword",
          label: "the money column",
          why: "orders.total is REAL dollars already — SUM(total) folds to monthly GMV, no cents conversion. SUM(quantity) errors (no such column on orders) and SUM(COUNT(*)) is an aggregate inside an aggregate.",
        },
        {
          answer: "month ASC",
          kind: "keyword",
          label: "the spine order",
          why: "The board reads the walk left to right in calendar order: 3,731.97, -122.33, -992.56 … +1,158.21. DESC reverses the story; ordering by delta sorts by movement and hides the timeline entirely.",
        },
      ],
      distractors: ["gmv DESC", "created_at", "%Y", "%m", "quantity", "month DESC"],
      walkthrough:
        "Stage the fold, then walk it — the two-layer shape exists because WHERE cannot see a window. The inner SELECT keys months with STRFTIME('%Y-%m', created_at) and folds SUM(total) per month; the outer SELECT carries LAG(gmv) OVER (ORDER BY month) and prints current minus prior. The spine reads exactly as the board quotes it: 2024-01 opens at 3,731.97 with a NULL delta — the baseline is NULL by definition, never a zero — 2024-07 troughs at 1,193.86 (-853.57), and 2024-08 jumps +1,158.21 to 2,352.07, the single biggest move on the walk. The '%Y-%m' key is load-bearing: '%Y' merges to 13 buckets and '%m' merges the two Januaries into one 5,401.47 row that matches nothing in the deck. Distractors fail honestly: a gmv DESC window scrambles every prior (March reads -293.23 instead of -992.56); created_at and quantity error or collapse in the staged layer; month DESC walks the calendar backwards. The three 3,000-plus months (3,731.97 / 3,609.64 / 3,116.04) are the threshold read the growth board layers on top — same spine, same definition, one fold.",
    },
    {
      id: "cs-affirm-5",
      tier: "medium",
      topic: "q2",
      universe: "fraud",
      title: "The outsized-ticket screen",
      brief:
        "Affirm-flavored brief on the storefront db: risk ops runs a manual-review screen for outsized tickets — checkouts whose total clears the book's own average — because ticket anomalies are where bust-out fraud shows first. Probed facts: the book average is 338.19 on a 25.47 to 1,088.44 spread, and the screen flags 42 of 103 checkouts: EU 18 for 10,899.05, APAC 13 for 6,784.10, US 10 for 5,873.57, LATAM 1 for 752.96. Review capacity is region-by-region and a region only earns a pod once it books at least ten flagged checkouts, so the printed table carries the three qualifying regions, deepest flagged GMV first.",
      ask: "Return each region with at least ten above-average checkouts — region, flagged count and flagged GMV to 2 decimals, deepest GMV first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS flagged,\n       ROUND(SUM(o.total), 2) AS flagged_gmv\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.total > (SELECT AVG(total) FROM {1})\nGROUP BY {2}\nHAVING COUNT(*) >= {3}\nORDER BY flagged_gmv {4};",
      slots: [
        {
          answer: "orders",
          kind: "keyword",
          label: "the scalar's population",
          why: "The 338.19 bar is computed over ALL checkouts — FROM orders. Point the scalar at order_items or customers and there is no total column: the query errors instead of silently re-basing the screen on the wrong population.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the review grain",
          why: "The screen works region by region: GROUP BY c.region. c.city re-grains to sixteen cities and every one falls under the ten-checkout bar — a correct query that prints an empty review queue.",
        },
        {
          answer: "10",
          kind: "number",
          label: "the pod-qualification bar",
          why: "A region earns a review pod at ten flagged checkouts: EU (18), APAC (13) and US (10) qualify — the 10 itself is the US cell — while LATAM's 1 flagged checkout waits. At 13 or 18 the queue shrinks to fewer regions than staffed pods.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "deepest-GMV-first",
          why: "The deepest flagged book reviews first: EU 10,899.05, APAC 6,784.10, US 5,873.57. ASC would open the queue on the smallest book while the 10,899.05 ages.",
        },
      ],
      distractors: ["order_items", "customers", "o.region", "c.city", "ASC", "13"],
      walkthrough:
        "A scalar subquery sets the bar, the outer fold counts the flagged, and HAVING carries the staffing rule. The scalar (SELECT AVG(total) FROM orders) returns exactly one cell — 338.19 — and WHERE total > that bar flags 42 of 103 checkouts; the scalar's 0-or-1-row contract matters because an empty inner fold would return NULL and the screen would silently empty. GROUP BY c.region folds the flags: EU 18 for 10,899.05, APAC 13 for 6,784.10, US 10 for 5,873.57, LATAM 1 for 752.96 — 42 flags summing against a 34,833.28 book. HAVING COUNT(*) >= 10 is the pod rule: LATAM's single flag drops and the printed queue carries three regions, the US sitting exactly on the bar. Distractors fail honestly: pointing the scalar at order_items or customers errors — no total column — which is the better failure than a re-based screen; o.region is no such column; c.city re-grains to sixteen cities that all fall under the bar and the queue prints empty; 13 drops the US pod; ASC reviews the smallest book first. The screen quotes its definition on every deck: above the BOOK average, per region, flags not dollars.",
    },
    {
      id: "cs-affirm-6",
      tier: "hard",
      topic: "x2",
      universe: "expense",
      title: "The one-pass trial balance",
      brief:
        "Affirm-flavored brief on the storefront db: the controller will not ship the close until the ledger census prints in ONE pass — per account, entries, debit-side entries, debits, credits and net — because four sequential queries are four chances to drift between snapshots. Probed facts: the ledger holds 80 entries in INTEGER cents across four accounts — cash 27 entries netting 44,196.00, operating_expenses 14 netting 25,416.00, accounts_receivable 26 netting 16,440.00, sales_revenue 13 netting -86,052.00 — and the global trial balance ties at 181,080 debits against 181,080 credits, delta zero. Biggest net first on the page; the cents read is / 100.0, never a bare-column ROUND.",
      ask: "Return each ledger account with entries, debit-side entries, and debits, credits and net in dollars to 2 decimals — biggest net first.",
      template:
        "SELECT account,\n       COUNT(*) AS entries,\n       COUNT(*) FILTER (WHERE {1} > 0) AS debit_entries,\n       ROUND(SUM(debit_cents) / 100.0, 2) AS debits,\n       ROUND(SUM(credit_cents) / 100.0, 2) AS credits,\n       ROUND((SUM(debit_cents) - SUM(credit_cents)) / {2}, 2) AS net\nFROM ledger_entries\nGROUP BY {3}\nORDER BY {4};",
      slots: [
        {
          answer: "debit_cents",
          kind: "keyword",
          label: "the debit-side arm",
          why: "The FILTER arm counts entries that actually carry a debit: debit_cents > 0 gives cash 13, opex 14, AR 13, sales 0. Swapping in credit_cents prints the credit arm under a debit label and the two-sided accounts read mirrored.",
        },
        {
          answer: "100.0",
          kind: "keyword",
          label: "the cents divisor",
          why: "Ledger amounts are INTEGER cents: the dollar read is / 100.0 — the .0 forces real division. / 10 or / 1000 mis-scales every net by a factor of ten: cash prints 441,960.00 or 4,419.60 instead of 44,196.00.",
        },
        {
          answer: "account",
          kind: "keyword",
          label: "the ledger grain",
          why: "The trial balance is per account: GROUP BY account folds 80 entries into four rows. GROUP BY a date or memo re-grains to fourteen-plus rows that tie to no account, and the close loses its account view.",
        },
        {
          answer: "net DESC",
          kind: "keyword",
          label: "biggest-net-first",
          why: "The controller reads biggest net first: cash 44,196.00, opex 25,416.00, AR 16,440.00, sales -86,052.00. Ordering by entries or date buries the money column the close is actually about.",
        },
      ],
      distractors: ["amount_cents", "memo", "10", "1000", "debits DESC", "ASC"],
      walkthrough:
        "One scan, four accounts, six columns — the FILTER census is the close's discipline move. COUNT(*) counts entries per account (cash 27, opex 14, AR 26, sales 13); COUNT(*) FILTER (WHERE debit_cents > 0) counts the debit-side arms (13 / 14 / 13 / 0 — sales_revenue never debits); the SUM folds convert INTEGER cents with the / 100.0 rule: cash debits 69,612.00 against credits 25,416.00 for a 44,196.00 net, opex 25,416.00 net, AR 86,052.00 against 69,612.00 for 16,440.00, sales -86,052.00. The cross-foot is the close: debits 181,080.00 against credits 181,080.00 — delta zero, or the close does not ship. Distractors fail honestly: amount_cents is no such column and errors; / 10 and / 1000 mis-scale every net an order of magnitude; GROUP BY a date re-grains to fourteen rows that tie to no account; memo re-grains to the row level; an ORDER BY debits DESC re-sorts the close by gross debits (AR 86,052.00 first) instead of net; ASC opens the close on sales' -86,052.00 — the right numbers aimed at the wrong end of the page. The census prints in one pass precisely so the trial balance, the account view and the entry counts cannot drift apart between screenshots.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "The per-SKU financed-revenue fold: SUM(quantity × unit_price) per product is the line-level GMV read every category mix review at Affirm starts from." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Repeat-borrower concentration: the heaviest shopper on this book runs 24 checkouts worth 7,262.35. Finding the max-count borrower is the concentration screen in miniature." },
    { slug: "confirmation-rate", why: "Merchant funding-confirmation share: approved checkouts that actually funded, computed per merchant — a NULL-aware rate whose denominator argument never ends at a lender." },
    { slug: "immediate-food-delivery-i", why: "Same-day funding share: checkouts stamped the day they booked versus the 2–4 day funding spread. The immediate-versus-later split is Affirm's checkout-speed read." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Basket overlap: shoppers who financed Audio and Wearables but never Accessories. Conditional population logic across categories — the cross-sell read partnerships asks for." },
    { slug: "department-highest-salary", why: "Largest merchant book per region: Nordic Gadgets AB leads EU at 11,130.25. Per-group argmax is the merchant-coverage screen, and ties are the follow-up." },
    { slug: "duplicate-emails", why: "Shopper identity hygiene: a duplicate email splits one borrower's credit file into two, understating every concentration number. Dedupe before any exposure read." },
    { slug: "fix-names-in-a-table", why: "Merchant and shopper name casing before any join: 'nordic gadgets ab' versus 'Nordic Gadgets AB' silently splits one merchant partner into two in the GMV ladder." },
    { slug: "bank-account-summary", why: "Statement-plus-installment LEFT JOIN with NULL fill: billed, collected and the gap on one row per statement — the exposure rollup's little brother." },
    { slug: "npv-queries", why: "Scheduled installments discounted to present value: the credit-math shape behind every funding-cost and merchant-fee conversation at a BNPL shop." },
    { slug: "trips-and-users", why: "Cancelled-exclusion ratios: rates computed with cancelled checkouts excluded — and the denominator stated. The exclusion logic is the file every Affirm screen reenacts." },
    { slug: "average-selling-price", why: "Ticket-size read: units-weighted average line price per SKU. Big-ticket versus budget mix is the input the CASE ticket-band census consumes." },
    { slug: "find-churn-risk-customers", why: "Dormant-borrower flagging: shoppers whose checkout cadence went quiet. The repayment-risk cohort to watch before delinquency ever shows in the aging." },
    { slug: "delinquency-buckets", why: "The aging ladder: days-past-due bucketed into rungs that must reconcile back to the open book. Credit risk's Monday read, in practice form." },
    { slug: "vintage-default-curves", why: "Cohort default curves: statements issued in the same month tracked forward together. The vintage view separates mix shift from real deterioration." },
    { slug: "chargeback-rate-ranking", why: "Chargeback rate by merchant: disputed dollars over booked GMV, ranked. The merchant-risk read that gates partner fees on the 32% Nordic book." },
    // — Expansion (Task 103, wave-3x): problems 17-32 appended. Provenance: the pools
    // file now carries ONE Affirm-tagged sql row (delinquency-roll-rates) and it leads;
    // the remaining fifteen are theme-curated sql rows from company-pools.md's theme
    // menu (credit, servicing, fraud, ledger, growth themes), distinct from topics 1-15
    // and problems 1-16, no write/schema topics.
    { slug: "delinquency-roll-rates", why: "Servicing's core motion: the share of open statements rolling from one days-past-due bucket into the next each cycle. Roll direction is the earliest deterioration signal on the 19,609.00 open book." },
    { slug: "expected-credit-loss", why: "Provision math: PD × LGD × EAD per cohort folds to the loss allowance the CFO books each close — the weighted-provision shape behind every reserve conversation at a BNPL lender." },
    { slug: "credit-utilization-bands", why: "Underwriting bands: borrowers bucketed by how much of their approved line they are drawing. Band migration feeds both the limit-increase queue and the exposure map credit reviews every Monday." },
    { slug: "loan-amortization-schedule", why: "The Pay-in-4 and monthly schedules built row by row — principal, interest, remaining balance per installment. The servicing spine every statement on this book settles against." },
    { slug: "prepayment-detection", why: "Early payoff: borrowers who retire schedules ahead of term. Prepayments shrink interest revenue on the APR book — the split between 0% Pay-in-4 and interest-bearing plans turns it into a revenue question." },
    { slug: "daily-balance-interest", why: "APR accrual on interest-bearing monthly plans: interest computed on the daily balance and summed per cycle — the interest-revenue line the merchant-fee book gets compared against." },
    { slug: "basket-depth-aov", why: "The 2.44 lines-per-checkout and 338.19 ticket pair: depth and AOV are one fold apart, and cross-sell wins show up in depth before they ever show in ticket." },
    { slug: "repeat-purchase-rate", why: "Repeat-borrower share: shoppers returning for a second financed checkout. On a book where four borrowers carry 63.5% of GMV, the repeat rate is the concentration story's front door." },
    { slug: "cohort-retention-matrix", why: "Borrowers grouped by first-checkout month and tracked forward: the cohort matrix separates 'the book is shrinking' from 'January's vintage was small' — vintage discipline for the 14-month spine." },
    { slug: "funnel-step-conversion", why: "Checkout → approved → funded → paid-in-full, step by step with honest denominators: 103 booked, 82 funded, 52 completed. The funnel shape every Affirm screen reenacts." },
    { slug: "top-percentile-fraud", why: "PERCENT_RANK screens the ticket distribution for outsized applications: the top percentile of the 25.47–1,088.44 spread is where the manual-review queue starts." },
    { slug: "amount-anomaly-zscore", why: "Z-scored ticket sizes flag the checkouts that do not fit their merchant's norm — an anomaly read on the same spread the underwriting bands fold." },
    { slug: "transaction-velocity", why: "Burst detection: too many financed checkouts from one shopper in a short window is a bust-out pattern, not volume. Velocity screens run before approval, not after loss." },
    { slug: "gl-reconciliation", why: "The 181,080 = 181,080 tie-out, generalized: matching subsidiary ledgers to the general ledger line by line is the muscle behind the zero-delta close." },
    { slug: "trial-balance-check", why: "Debits against credits per account — cash netting 44,196.00, AR 16,440.00 — the conditional-SUM shape of the trial balance that must land at delta zero before the close ships." },
    { slug: "null-blank-audit", why: "The NULL policy audit: unstamped shipped_at rows, blank statuses, empty method fields — a count of holes per column, so 'pending' stays a population definition and never a cleanup job." },
  ],
};
