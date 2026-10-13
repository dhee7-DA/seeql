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
    "Preparation strategy: company-pools.md carries no Affirm section — 0 tagged LC rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: checkout funnels with honest denominators, merchant GMV attribution, ticket-band CASE tiers, funding-spine LAG walks and the cents-safe statement books. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {sky:financed-basket census} merchant analytics ships each month, the other rebuilds the {amber:uncollected-exposure list} collections reviews every Monday. The bar to clear: *state the definition, the denominator and the units before you compute anything* — then make every lifecycle census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts on the funding dashboard, not the marketing one. First query is the lifecycle census in one pass — 52 paid-in-full + 30 amortizing + 14 pending + 7 cancelled = **103 by construction** — followed by the funding-latency read over the 82 stamped checkouts: **2.98 days** average, US slowest at 3.07, APAC quickest at 2.93. A pending row that ages without a funding stamp is *the morning's first page*, not a rounding note — {rose:approved money that never funds} is scheduled money that never collects.",
    "**11:30 —** Midday is the merchant and mix read. Partnerships wants the GMV ladder: Nordic Gadgets AB carries **11,130.25 — 32% of the book** — and with Midwest Hardware Co's 9,294.93 the top two merchants hold 58.7% of GMV, so one renegotiation moves the merchant-fee math. Credit wants the category census beside it: {amber:Audio} finances 11,744.01 on 97 units while Accessories moves 121 units for just 3,294.29 — *volume without ticket is the underwriting trap this catalog is built to expose*. Each ask is a join, a fold and one argument about which grain is load and which is coverage.",
    "**15:30 —** The afternoon tilts to collections. The AR anti-join refreshes first — **6 statements worth 15,217.00 with zero installment dollars behind them** — before dunning sends a single notice; the coverage split reads 21 exact, 1 partial (#25 at 4,000.00 of 6,148.00), 6 none. The exception queue gets walked line by line: statement #11 is {rose:void} yet carries a 925.00 installment, and #28 reads paid with nothing collected at all (1,756.00 promised). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080, delta zero** — {emerald:the close ships} or tomorrow starts with an incident.",
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
  ],

  topics: [
    {
      name: "Checkout funnel counts",
      why: "Every Affirm screen opens with the lifecycle: checkouts booked, funded (shipped_at stamped), paid in full at term end. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an amortizing checkout 'paid in full' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest"],
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
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Concentration ladders",
      why: "The borrower ladder is steep: 24, 17, 14, 13 checkouts, then a long tail where four shoppers sit tied at 4 each. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow — and on a book where four logos carry 63.5% of GMV, rank semantics are a credit conversation, not syntax.",
      slugs: ["rank-scores", "top-earners", "second-highest-salary"],
    },
    {
      name: "Funding spine & LAG deltas",
      why: "The 14-month funding spine (2024-01 to 2025-02) is the monthly business review's home turf: GMV booked per month, prior month beside current, the 1,193.86 July trough and the +1,158.21 jump into August named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine"],
    },
    {
      name: "Coverage set algebra",
      why: "Risk packets stack populations — funded under paid-in-full, this month beside last — and EXCEPT answers 'which funded checkouts never reached term'. UNION dedups whole rows silently, which makes it a correctness question, not a style one; one collapsed row is one borrower missing from the packet.",
      slugs: ["team-scores-in-football-tournament", "customers-who-never-order", "monthly-transactions-ii"],
    },
    {
      name: "Big-ticket thresholds",
      why: "Underwriting screens compare one checkout against a number computed from the whole book — the 338.19 average ticket — via a scalar subquery in WHERE. The contract is zero-or-one rows: zero yields NULL and a silently-empty report, and saying that unprompted is the follow-up the panel is fishing for.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "find-expensive-cities"],
    },
    {
      name: "One-pass lifecycle censuses",
      why: "The ops board gets paid-in-full, amortizing, pending and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift before the review starts.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "count-salary-categories"],
    },
    {
      name: "Statements, cents & settlement",
      why: "Billed is not collected — the finance tables (28 statements, 27 installment rows, INTEGER cents) are where the checkout world meets money. Every dollar read is amount_cents / 100.0, the exact/partial/none coverage split (21 / 1 / 6) is one CASE away, and settlement runs 28.4 days average against uniform 30-day terms.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "monthly-transactions-i"],
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
  ],
};
