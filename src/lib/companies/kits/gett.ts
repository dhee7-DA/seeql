// Gett — kit 9 of the Ride-hailing & Mobility domain (Batch L, 92-c-mobility).
// B2B ride-hailing: corporate ground travel — business accounts with cost
// centers, SLA-governed pickups, and monthly invoicing instead of card fares.
// Pool provenance: 0 tagged LC — theme-curated. Every problem and topic slug
// is drawn from the Theme menu in scripts/company-pools.md (sql rows), picked
// to mirror Gett's known screen themes: rider-to-account rollups, two-grain
// account censuses, completion-latency math, monthly invoice books in INTEGER
// cents, unsettled-invoice anti-joins, leaderboard tie policy.
// Case studies run on the storefront db (db/custom.db) with probed figures
// from scripts/company-facts.md (probed 2026-10-12), mapped honestly:
// orders = rides, shipped_at = ride-completion ping, customers = corporate
// rider accounts, products = ride products/classes, order_items = billed ride
// lines, suppliers = fleet partners, invoices/payments = the monthly corporate
// billing books (INTEGER cents — divide by 100.0). Every case slot is
// mechanically verified against the live db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const gettKit: CompanyKit = {
  id: "gett",
  domainId: "mobility",
  name: "Gett",
  tagline: "B2B ride-hailing: corporate ground travel",
  accent: "text-red-400",

  brief: [
    "Gett is the B2B side of ride-hailing — the company that built corporate ground travel as a product, where rides are booked against **corporate accounts** with cost centers and settle through {sky:monthly invoicing} instead of card fares. That changes the analytics object: the unit of value is not a tap-and-go consumer ride but a billable ride attached to an account a travel manager defends in a budget review. On this kit's proxy ledger that's 103 rides worth **34,833.28** (average 338.19, spread 25.47 to 1,088.44) across 16 corporate accounts and 251 billed ride lines. The status map is the ride lifecycle: 52 {emerald:completed} with a completion ping (50.5%), 30 in-trip (29.1%), 14 awaiting dispatch (13.6%), and 7 {rose:cancelled} (6.8%) — and the habit that gets drilled early is *completed ÷ ALL booked*, never ÷ resolved.",
    "The data org splits three ways. Account analytics owns the {amber:rollups}: every ride rolls up to an account, and the read every travel review opens with is two-grain — rides AND accounts per region (EU carries 45 rides from just 8 accounts; the US, 19 from 2). The biggest single account is **Alice Chen at 24 rides and 7,262.35 billed**, and concentration is a standing board question: 63.5% of billed spend sits with the accounts over 3,000 lifetime. Ground-ops owns the SLA reads: 82 of 103 rides carry a completion ping, lag averaging **2.98 days** on the proxy clock (range 2..4). Billing ops owns the monthly invoice book — 28 `invoices` against 27 `payments`, INTEGER cents throughout — where 6 bills worth 15,217.00 sit unsettled and one of them (#28, 1,756.00) claims paid with zero settlement rows behind it.",
    "Interviews are rollup-first, denominator-obsessed, cents-precise. A screen opens with a warm-up join (attach rides to their corporate account), escalates into a conditional aggregation with a status rule (completion share by region, cancelled share by month), then lands on either an SLA read (completion lag with the NULL policy stated) or a billing read (which accounts have invoices with no payments behind them, and what `amount_cents / 100.0` actually prints). Follow-ups are spoken aloud: *'is that per ride or per account?'*, *'does a pending ride sit in your denominator?'*, *'a voided invoice with a payment on it — what is that?'* — because in corporate travel an unmatched settlement row is a reconciliation incident, not a rounding note.",
    "Preparation strategy: Gett has **0 tagged LC** rows in this app's pool, so the kit is **theme-curated** — all 30 topic slugs and 16 problems are hand-picked from the theme menu to mirror corporate-mobility screens: rollups, two-grain censuses, latency math, invoice books in cents, anti-joins, tie-proofed leaderboards. Then run both case studies on the live db: one rebuilds the {amber:account billing rollup} the month-close opens with, the other rebuilds the {rose:settlement-status census} billing ops runs before the anomaly review. The bar to clear: state the denominator, the join's survival rule, and the cents rule before you compute anything.",
  ],

  dayInLife: [
    "**08:00 —** The day opens on the SLA board. Overnight corporate pickups versus completion pings: 82 of 103 rides carry a ping, lag averaging 2.98 days, and the first query is a reconciliation — do the completed-ride counts tie to what billing invoiced overnight, did any zone's lag drift off its band (APAC runs fastest at 2.93, LATAM slowest at 3.5), are the 14 awaiting-dispatch rides still inside their pickup windows? A drift here is the standup's first fire, and the analyst who can write the diff — which side is missing rows, at which grain — *is the one everyone waits on*.",
    "**11:00 —** Midday is account-rollup surgery. A travel manager wants the month's spend by corporate account with ride counts beside it — **Alice Chen 24 rides and 7,262.35** on top, the four-account tie at 4 rides each spelled out below — and a second analyst asks the same table for distinct accounts per region, which is a different number and a different query: `COUNT(*)` versus `COUNT(DISTINCT customer_id)`. Each deliverable gets written twice: once to answer, once with the denominator and the survival rule spelled out, because *a rollup that survives the budget review is one whose population was named out loud*.",
    "**15:00 —** The afternoon is the invoice run. The monthly billing book opens: 28 `invoices`, every amount in INTEGER cents, every dollar read `amount_cents / 100.0`. The coverage census folds first — 21 settled exactly, 6 with no settlement rows at all, 1 partial at 4,000.00 of 6,148.00 — and then the anomaly sweep: #28, which *claims paid with zero settlement rows* (1,756.00) and routes to the fraud queue, beside its mirror image #11, {rose:void-but-paid} at 925.00. Settlement speed gets its own read: 20 settled bills averaging 28.4 days against uniform 30-day terms, fastest 13, slowest 84.",
    "**17:30 —** End of day is the writeup that keeps tomorrow honest. The SLA report ships with its NULL policy in the header (lag exists only for the 82 pinged rides; the 21 without one are awaiting or cancelled, not zero-lag), the rollup ships with its grain labeled per column, and the AR follow-up list carries owners, not just balances. The rhythm to internalize: Gett SQL exists to keep rides, accounts and money in one reconciled story — *the ride ledger and the invoice book are the same month told at two grains*.",
  ],

  metrics: [
    { name: "Completed-ride rate", what: "Rides with a completion ping ÷ ALL booked rides: 52 of 103 (50.5%). The denominator is the interview — 52 of 59 resolved is a different metric with a different name." },
    { name: "Completion latency", what: "Ride-creation to completion ping on the 82 pinged rides: 2.98-day average, range 2..4. The SLA metric ground-ops reviews weekly — NULL policy stated or the read is a lie with decimals." },
    { name: "Account rollup", what: "Rides and billed dollars per corporate account — Alice Chen 24 rides / 7,262.35 on top, the four-way tie at 4 rides below. The read every travel-manager review opens with." },
    { name: "Two-grain census", what: "Rides AND distinct accounts per region: EU 45 from 8, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. Network load versus audience size — the intensity read lives in the gap." },
    { name: "Cancelled-ride share", what: "Cancelled ÷ booked: 7 of 103 (6.8%). By zone: APAC 8.1% worst, EU 6.7%, US 5.3%, LATAM 0. A conditional count where the denominator must keep the rides you're excluding." },
    { name: "Account concentration", what: "Share of billed spend from accounts over 3,000 lifetime: 63.5%. The dependency read that decides how much negotiation leverage any single travel program carries." },
    { name: "Unsettled AR", what: "Invoices with no payment rows: 6 worth 15,217.00 — including #28 (1,756.00), which claims paid with zero settlements. The anti-join the billing desk runs before reminders go out." },
    { name: "Settlement speed", what: "Issue-to-first-payment on settled bills: 20 averaging 28.4 days, fastest 13, slowest 84, against uniform 30-day terms. First payment, never last — split settlements would poison the average." },
  ],

  topics: [
    {
      name: "Rider-to-account rollups",
      why: "Corporate travel bills to accounts, so the fundamental fold here is rides → account → spend: GROUP BY the account, sum the fare, count the rides. Gett probes whether you can run that rollup without letting the grain blur — one row per account, not per ride, not per billed line.",
      slugs: ["customer-placing-the-largest-number-of-orders", "top-travellers", "product-sales-analysis-ii"],
    },
    {
      name: "Two-grain account censuses",
      why: "'Rides AND accounts per region' is the opening read of every travel review here — and the trap is counting both at the same grain. COUNT(*) counts ride rows; COUNT(DISTINCT customer_id) counts accounts; EU's 45 rides collapse to 8 accounts and the 5.6-per-account intensity is the actual story.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "find-followers-count"],
    },
    {
      name: "Completion latency & date math",
      why: "SLA reporting is date arithmetic: `JULIANDAY(shipped_at) - JULIANDAY(created_at)` over the 82 pinged rides, grouped by zone or month. Gett drills the NULL gate (lag exists only where the ping exists) and the lag-vs-count distinction that breaks averages.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-that-actively-request-confirmation-messages"],
    },
    {
      name: "Conditional counting on ride states",
      why: "Completed, in-trip, awaiting, cancelled — every rate here is a conditional count over a status flag, and the interviewer's first question is 'what's in the denominator?'. SUM(CASE WHEN status …) over ALL booked rides is the shape that survives scrutiny; filtering first is denominator drift.",
      slugs: ["immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "confirmation-rate"],
    },
    {
      name: "Monthly invoicing & integer cents",
      why: "The corporate invoice book keeps money in INTEGER cents — 28 invoices, 27 payments — so every dollar read is `amount_cents / 100.0` and every ratio sits one misplaced integer away from a truncation leak. Cents-safe folds (per-account statements, settlement counts, rails) are the closest thing this kit has to a finance round.",
      slugs: ["trial-balance-check", "bank-account-summary-ii", "monthly-transactions-i"],
    },
    {
      name: "Unsettled-invoice anti-joins",
      why: "The dunning list IS an anti-join: invoices LEFT JOIN payments, keep the NULLs — 6 bills worth 15,217.00, one claiming paid with zero rows. The follow-up nobody expects: proving a confident zero (this db has 0 never-ordered accounts), because an empty anti-join is a finding, not a failure.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Account leaderboards & tie policy",
      why: "Rank accounts by rides and a four-way tie at 4 rides is waiting for you — this db ties at 4, 3 and 2. Gett drills the rank trio because the business question 'do tied accounts share a rung?' is a policy decision, and LIMIT-with-OFFSET habits break silently on it.",
      slugs: ["rank-scores", "department-top-three-salaries", "second-highest-salary"],
    },
    {
      name: "NULL policy on in-flight rides",
      why: "A ride awaiting completion has no completion ping — shipped_at IS NULL is a state, not a bug. Gett screens check whether you treat NULL as data to report, coalesce to zero for display, or exclude with a stated reason — deliberately, because an SLA average that silently shrank its population is a number wearing the wrong name.",
      slugs: ["employee-bonus", "calculate-special-bonus", "books-with-null-ratings"],
    },
    {
      name: "Honest-denominator ride rates",
      why: "Completion shares, cancellation percentages, per-account intensity — Gett's ratios punish integer division and careless filters. The house habit: 100.0 before the division, the denominator's population decided BEFORE the ratio, rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "average-selling-price", "hopper-company-queries-ii"],
    },
    {
      name: "Above-average & first-ride screens",
      why: "Screens escalate into nested logic: which accounts beat the platform's average fare, which riders' FIRST ride landed in the corporate program, which classes clear a volume bar. The follow-up that separates candidates: what does the above-average filter return if the inner fold is empty?",
      slugs: ["orders-with-maximum-quantity-above-average", "game-play-analysis-iv", "market-analysis-i"],
    },
  ],

  theory: [
    {
      id: "gett-t1",
      q: "Every corporate account in our book has rides on it — zero never-ordered accounts. Given that, is INNER JOIN ever the wrong choice for rides-to-accounts, and what's the trap that makes a correct-looking join lie?",
      a: "The anti-join returning zero is a finding, not a safety guarantee: 'no never-ordered accounts today' doesn't make INNER JOIN a default, it makes the decision question different — what SHOULD survive if the data is ever wrong. A ride with no account row is corruption and worth a flag, so INNER is honest for spend rollups but only if someone checks the count reconciles to the raw table. The trap that makes correct-looking joins lie is filter placement: accounts LEFT JOIN rides WHERE r.status = 'completed' silently discards every account with no completed rides — the WHERE predicate on the right table converts the LEFT JOIN to an INNER. If unmatched accounts are part of the answer, the predicate moves into ON or the query gets rewritten. The strong answer states the survival rule first and proves the anti-join zero as a step, not an assumption.",
      tag: "joins",
    },
    {
      id: "gett-t2",
      q: "Your travel review must show rides AND distinct accounts per region side by side. Why do the two counts disagree, and what does the gap between them mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts rows after the join — one row per ride, so Alice Chen's 24 rides contribute 24 to EU's total. COUNT(DISTINCT customer_id) folds those rides back to one account — EU's 45 rides collapse to 8 accounts. Neither is wrong: rides measures load on the dispatch network, accounts measures the corporate book's breadth, and the ratio between them (5.6 rides per account in EU, 9.5 in the US) is the intensity signal that decides where account management spends its time. The third count that catches candidates: after joining rides to billed lines, COUNT(*) silently counts lines instead of rides — 251 lines under 103 rides. Saying 'one row per what?' out loud for every COUNT in the query is the habit the panel is listening for.",
      tag: "aggregation",
    },
    {
      id: "gett-t3",
      q: "The completion rate is 52 of 103. Where does the status filter live in the query that computes it, and what happens to the number if a teammate filters first and divides after?",
      a: "The status rule is a ROW-level fact used as a NUMERATOR, so it lives inside a conditional aggregate: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) over ALL booked rides, divided by COUNT(*) from the same fold. Filter completed rides in WHERE first and the denominator shrinks to the numerator's population — the 'rate' reads 100% everywhere, a real number wearing a wrong name. That's denominator drift: the numerator and denominator must be folded from the same rows, decided before any ratio is computed. And the sibling trap: putting the filter in HAVING judges group-level aggregates, not rows — cancelled rides are already inside every group's total by then, and no post-aggregation clause can un-mix them. The strong answer states the pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT — and places every filter by asking 'is this a fact about one row, or about a group?'",
      tag: "aggregation",
    },
    {
      id: "gett-t4",
      q: "Rank our corporate accounts by rides and four accounts tie at 4. RANK, DENSE_RANK or ROW_NUMBER for the travel board — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied accounts the same rank and skips — 1, 2, 3, 4, 5, then the tie at 6, 6, 6, 6, and the next distinct count lands at 10, implying five phantom accounts between the tie and the tail. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, a silent judgment call about which account the travel manager calls first. On this db the ties are real — four accounts at 4 rides, two at 3, three at 2 — so every leaderboard ships with its policy named. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts, or a named deterministic tie-breaker like id — and writing it into the query.",
      tag: "windows",
    },
    {
      id: "gett-t5",
      q: "A ride is awaiting dispatch with no completion ping. What is your NULL policy for the SLA latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only completed rides have a latency, so the report measures the 82 pinged rides of 103 and says so — the 14 awaiting and 7 cancelled have no lag, not zero lag. Then mechanics: AVG ignores NULLs, so AVG(lag) over ALL rides returns the pinged-only average with a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the pinged subset; the gap between it and COUNT(*) IS the outstanding count, which is a feature, not a bug. What is never acceptable is IFNULL-ing the lag to zero to 'fix' the average — that publishes instant completion for rides still in flight, and an SLA report built that way is a lie with decimals. The gate belongs in WHERE (shipped_at IS NOT NULL) with the population named in the header. A report whose WHERE clause is doing definitional work without saying so is exactly what a Gett reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "gett-t6",
      q: "WHERE total > (SELECT AVG(total) FROM rides WHERE region = 'LATAM') — what is that scalar subquery contractually allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average screen silently returns nothing while looking valid. On the full table that's theoretical: 103 rides always produce an average. On filtered staging — one region, one cost center, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly how it hides. The correlated cousin (compare each ride to ITS account's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that follow-up is what the panel is fishing for — and on a corporate book where a cost center can genuinely have zero rides in a month, it's a production bug, not a puzzle.",
      tag: "subqueries",
    },
    {
      id: "gett-t7",
      q: "The monthly billing trend buckets rides by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this ledger from 2024-01 to 2025-02; '%m' alone merges January 2024 with January 2025 and the billing curve becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's rides, and month-end is exactly when corporate travel books its heaviest volume. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first delta is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month in a spend walk. Date discipline is billing discipline: the spine, the window and the edge row are where invoice reports go wrong.",
      tag: "dates",
    },
    {
      id: "gett-t8",
      q: "Billing ops says a paid invoice has no payment rows behind it. Walk me through the reconciliation query you write first — and the money-handling rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this book that returns 6 bills worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why the payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void bill WITH a payment row (this book has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 6,644.30 print into 6,644 and quietly eats cents on every odd-cent bill. Reconciliation culture: counts and sums must agree between the ride ledger and the invoice book, and when they do not, the query that shows WHICH rows disagree is the deliverable.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "gett-mcq-1",
      prompt: "A ride's status column reads 'cancelled'. In corporate-travel language, what is it?",
      choices: ["Completed and billed to the account", "In-trip, awaiting the completion ping", "A rider-cancelled booking that never completed", "Awaiting dispatch at the fleet"],
      answer: 2,
      why: "This kit's status map is fixed: delivered = completed with a ping (52 of 103 rides), shipped = in-trip (30), pending = awaiting dispatch (14), cancelled = rider-cancelled (7). 'Cancelled' is the only state that never completed — and never bills.",
      notes: [
        { choice: 1, why: "In-trip is 'shipped' — 30 rides dispatched with pings still pending. Counting in-trip rides as completed inflates every SLA number." },
        { choice: 3, why: "Awaiting dispatch is 'pending' — 14 rides. Pending and cancelled are opposite ends of the fulfillment ledger; confusing them flips the completion rate's sign." },
      ],
      difficulty: "easy",
    },
    {
      id: "gett-mcq-2",
      prompt: "EU carries 45 rides from 8 corporate accounts. Which column pair reports both grains?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts ride rows (45); COUNT(DISTINCT customer_id) folds repeats back to accounts (8). The gap between the columns — 5.6 rides per account — is the intensity read the travel review actually runs on.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every ride has an account. Without DISTINCT both columns read 45 and the census loses the coverage story." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not accounts — a third grain nobody asked for. The census is rides AND accounts." },
      ],
      difficulty: "easy",
    },
    {
      id: "gett-mcq-3",
      prompt: "An invoice row reads amount_cents = 92500. Which expression prints its dollar value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "INTEGER cents ÷ 100.0 promotes to real arithmetic: 925.00. The .0 is the entire fix — integer ÷ integer truncates, and every odd-cent bill leaks its cents into the floor.",
      notes: [
        { choice: 0, why: "92500 / 100 is integer division = 925 — on round-dollar bills the bug hides; the first odd-cent row exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying gives 9,250,000 — units inverted. Sanity-check magnitude: dollars are smaller than cents." },
      ],
      difficulty: "easy",
    },
    {
      id: "gett-mcq-4",
      prompt: "Keep only corporate accounts carrying at least 4 rides. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 4, before GROUP BY", "GROUP BY account HAVING COUNT(*) >= 4", "WHERE rides >= 4 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A ride-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this ledger the floor keeps 9 accounts — 24, 17, 14, 13, 5 rides, then the four-way tie at 4.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order teaching itself." },
        { choice: 2, why: "There is no 'rides' column on the raw table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "gett-mcq-5",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued rides", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, SUM/COUNT of two integers is integer division — every zone's cancellation share truncates toward 0 and the whole map reads as flat. The 100.0 multiplier forces real division first; on this ledger it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step, and it happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates first, then scales — 0.068 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "gett-mcq-6",
      prompt: "The unsettled-AR list is built as invoices LEFT JOIN payments WHERE p.id IS NULL. What happens if a teammate rewrites it with INNER JOIN?",
      choices: ["Same list, faster — INNER JOIN is equivalent here", "Empty list — the bills with no payments fail the join and vanish", "All 28 invoices — the join direction flips", "An error — INNER JOIN cannot combine with IS NULL"],
      answer: 1,
      why: "The unsettled list IS the anti-join: bills whose join finds no payment row survive only under LEFT JOIN + IS NULL. INNER JOIN drops exactly those rows — the six never-settled bills disappear and the reminder cycle runs on nobody.",
      notes: [
        { choice: 0, why: "INNER and LEFT differ precisely on the unmatched rows — which are the entire answer here. The rewrite deletes the finding, not the bug." },
        { choice: 2, why: "Join type never flips direction — it changes row survival. All 28 would need a CROSS JOIN, a different (and wrong) tool." },
      ],
      difficulty: "medium",
    },
    {
      id: "gett-mcq-7",
      prompt: "Four accounts tie at 4 rides; the next distinct count is 3. DENSE_RANK assigns the 3-ride accounts rank…",
      choices: ["6", "7", "10", "11"],
      answer: 1,
      why: "DENSE_RANK gives the four-way tie rank 6 and the next distinct count rank 7 — shared rungs, no gaps. RANK would say 10 (gaps kept: 6,6,6,6 then 10); ROW_NUMBER would number them 7,8,9,10 arbitrarily.",
      notes: [
        { choice: 2, why: "That's RANK's answer: the tie consumes ranks 6-9, so the next lands at 10. DENSE_RANK never skips — peer accounts read as peers." },
        { choice: 3, why: "No scheme starts the next rung at 11 — that would skip 10 for no reason. The honest choices are 7 (dense) or 10 (ranked), and the policy gets named." },
      ],
      difficulty: "medium",
    },
    {
      id: "gett-mcq-8",
      prompt: "WHERE total > (SELECT AVG(total) FROM rides WHERE cost_center = 'LATAM-pilot') runs against a staging table where the cost-center filter matches nothing. What does the report return?",
      choices: ["An error — scalar subqueries must return a row", "Zero rows silently — the comparison passes nothing", "Every row — NULL comparisons default to true", "Only NULL-total rides"],
      answer: 1,
      why: "The empty inner fold yields NULL, total > NULL is UNKNOWN, and WHERE passes nothing — an above-average report that ships empty-looking-but-valid. On cost-center staging tables this bug is routine, which is why the inner fold's population is stated out loud.",
      notes: [
        { choice: 0, why: "SQLite tolerates the empty case as NULL rather than erroring — worse than a crash, because the report LOOKS fine. Stricter engines error; the portable answer is to check the inner fold." },
        { choice: 2, why: "No comparison against NULL ever defaults to true — UNKNOWN is discarded by WHERE in both directions. Nothing 'passes' a NULL comparison." },
      ],
      difficulty: "hard",
    },
    {
      id: "gett-mcq-9",
      prompt: "A settlement-coverage CASE classifies bills: WHEN SUM(p.amount_cents) < i.amount_cents THEN 'partial' ... runs BEFORE the no-payment arm. What happens to a bill with zero payment rows?",
      choices: ["Classified 'partial' — SUM is 0, which is less than the amount", "Falls through as NULL — SUM of no rows is NULL, NULL < amount is UNKNOWN, so it lands in the ELSE arm", "An error — SUM cannot run on an empty group", "Classified 'partial' only if the bill is also marked paid"],
      answer: 1,
      why: "A bill with no payment rows yields SUM(p.amount_cents) = NULL, and NULL < amount is UNKNOWN — the partial arm never fires, so the bill falls to ELSE and reads 'settled'. That is exactly why the no-payment arm (p.id IS NULL) must be checked FIRST — #28, the 1,756.00 bill claiming paid with zero rows, is the standing proof.",
      notes: [
        { choice: 0, why: "SUM over zero rows is NULL, not 0 — the empty-group fold is the trap. COUNT returns 0 on empty groups; SUM returns NULL. The two aggregates have different empty-case contracts." },
        { choice: 3, why: "The CASE never sees the status column — arm order and NULL semantics decide, not the claimed label. A 'paid' stamp with zero rows still folds to NULL." },
      ],
      difficulty: "hard",
    },
    {
      id: "gett-mcq-10",
      prompt: "An analyst buckets the billing trend with STRFTIME('%m', created_at) instead of '%Y-%m'. What does the 'trend' show?",
      choices: ["The same 14-month trend, just formatted differently", "13 buckets that merge every January, every February — two years folded into one calendar", "Only 2025 data — the format drops 2024", "An error — %m is not a valid SQLite specifier"],
      answer: 1,
      why: "'%m' is month-only, so 2024-01 and 2025-01 land in one bucket: the 14-month spine (2024-01..2025-02) collapses to 12 calendar buckets and the year-over-year story vanishes. '%Y-%m' is the billing spine, always.",
      notes: [
        { choice: 0, why: "The bucket COUNT changes (14 → 12) and every January/February total doubles in place — the curve is fiction from the second year on." },
        { choice: 2, why: "Nothing is dropped — it's merged, which is worse: the query keeps returning rows while quietly destroying the time axis." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-gett-1",
      tier: "easy",
      topic: "j7",
      universe: "month-close",
      title: "The account billing rollup",
      brief:
        "Gett-flavored brief on the storefront db: month-close opens with the account billing rollup — rides AND billed dollars per corporate account — and the travel desk sets the floor at 4 rides to keep the report readable. Probed facts: 103 rides worth 34,833.28 across 16 accounts; the embedded ladder runs 24 rides (Alice Chen, 7,262.35), 17 (Emma Wilson, 6,640.56), 14, 13, 5 — then a four-way tie at 4 rides (Pedro Alvarez 1,686.17, Keiko Sato 1,098.6, Isabella Rossi 985.65, Noah Meyer 737.68). The floor is a HAVING on the fold, not a WHERE on the rides — the desk wants accounts JUDGED after their rides are counted, and the biggest billed account on top.",
      ask: "Return every corporate account with at least four rides: account name, ride count and billed dollars, biggest spend first.",
      template:
        "SELECT c.name AS account,\n       {1}(*) AS rides,\n       ROUND({2}(o.total), 2) AS billed\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.name\n{3} COUNT(*) >= {4}\nORDER BY billed {5};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the ride counter",
          why: "COUNT(*) counts the ride rows folded into each account — 24, 17, 14, 13, 5, then the tie at 4. SUM(*) doesn't exist and MAX(*) is a syntax error: only COUNT takes the star to count rows rather than values.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the billed-dollar fold",
          why: "SUM(o.total) adds each account's ride fares into the billed column — Alice Chen's 24 rides fold to 7,262.35. MAX would print her single most expensive ride (767.64) and reorder the whole board; AVG would print a per-ride mean nobody asked for.",
        },
        {
          answer: "HAVING",
          kind: "keyword",
          label: "the post-fold gate",
          why: "The 4-ride floor judges a count that only exists after grouping, so HAVING follows GROUP BY. WHERE runs before any fold exists — COUNT(*) in WHERE is rejected outright, which is the pipeline-order lesson wearing an error message.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the ride-count floor",
          noVerify: true,
          why: "The desk's floor is 4 rides: 9 accounts clear it. Raising it to 5 would drop the entire four-way tie the desk explicitly wants to see — the threshold is a business decision, not a rounding detail.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend-first direction",
          why: "The review opens with the biggest billed account — Alice Chen 7,262.35 on top. ASC would open with Noah Meyer's 737.68 and the desk reads the board upside down.",
        },
      ],
      distractors: ["MAX", "AVG", "WHERE", "5", "ASC"],
      walkthrough:
        "One fold, one gate, one board. The join attaches each of the 103 rides to its corporate account; GROUP BY c.name folds them to 16 rows; COUNT(*) counts rides (24, 17, 14, 13, 5, then four accounts at 4) while ROUND(SUM(o.total), 2) prices each bucket — 7,262.35, 6,640.56, 4,574.23, 3,644.56, 2,667.93, then 1,686.17 / 1,098.6 / 985.65 / 737.68 on the tie. HAVING COUNT(*) >= 4 keeps 9 of the 16 accounts — and it must be HAVING, because the 4-ride floor judges an aggregate that does not exist until the fold completes. ORDER BY billed DESC hands the desk Alice Chen on top and the four-way tie in billed order below. The distractors each break differently: MAX in the fold prints each account's single priciest ride (Alice 767.64, not 7,262.35) and re-sorts the board around noise; AVG prints per-ride means and the concentration story evaporates; WHERE dies on the aggregate-before-fold rule; 5 silently deletes the tie block; ASC inverts the read order. The deeper habit: a rollup's gate belongs after the fold, stated in the same breath as the threshold.",
    },
    {
      id: "cs-gett-2",
      tier: "medium",
      topic: "s6",
      universe: "fraud",
      title: "The settlement-status census",
      brief:
        "Gett-flavored brief on the storefront db: before the anomaly review, billing ops classifies the corporate invoice book by CLAIMED settlement state — settled, awaiting payment, voided — with counts and billed dollars per class, most-populous first. Probed facts: 28 invoices carrying INTEGER cents — paid 21 worth 66,443.00, open 6 worth 19,609.00, void 1 worth 925.00. The census reads the label column, but the room knows the labels lie: #28 (1,756.00) claims paid with zero settlement rows behind it, and #11 (925.00) is void yet carries a payment — both are the follow-up list, not this census. Exhaustive arms are the contract: every bill lands exactly once, and the classes must sum back to the 86,977.00 book.",
      ask: "Return each claimed settlement class with its invoice count and billed dollars, most-populous class first.",
      template:
        "SELECT CASE WHEN {1} THEN 'settled'\n              WHEN status = 'void' THEN 'voided'\n              ELSE 'awaiting payment' END AS bucket,\n       COUNT(*) AS invoices,\n       ROUND(SUM(amount_cents) / {2}, 2) AS billed_dollars\nFROM invoices\nGROUP BY bucket\nORDER BY invoices {3};",
      slots: [
        {
          answer: "status = 'paid'",
          kind: "keyword",
          label: "the settled arm",
          why: "The settled arm tests the label directly: status = 'paid' catches the 21 settled bills. status != 'void' would sweep the 6 open bills into settled and the awaiting class — the whole reason for the census — would vanish.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents-to-dollars divisor",
          noVerify: true,
          why: "The book is INTEGER cents, so the dollar read is SUM(amount_cents) / 100.0 — 66,443.00 settled. Divide by 1000 and the book shrinks to 6,644.00, a wrong ledger that still sums 'cleanly'. The .0 promotes the division to real arithmetic before any truncation.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-populous-first direction",
          why: "The census reads biggest class first: settled 21, awaiting 6, voided 1. ASC would open the review on the single voided bill — the least representative row of the book.",
        },
      ],
      distractors: ["status != 'void'", "amount_cents > 0", "1000", "ASC"],
      walkthrough:
        "One table, three arms, a census that must sum back. The CASE fires per invoice in contract order: status = 'paid' settles the 21, status = 'void' voids the 1, and the exhaustive ELSE catches the 6 open bills as 'awaiting payment' — no bill escapes, so 21 + 6 + 1 = 28 and the buckets must reconcile to the book. The fold prices each class in dollars: ROUND(SUM(amount_cents) / 100.0, 2) reads 66,443.00 settled, 19,609.00 awaiting, 925.00 voided — 86,977.00 total, the invoice base intact. The distractors each break a different way: status != 'void' merges the open bills into settled (27/1, awaiting gone, the audit blind); amount_cents > 0 is true for every bill and collapses the census to one 28-row bucket; 1000 re-prices the book at a tenth of reality (6,644.00) — a wrong ledger that still sums, which is why the divisor gets named in the header; ASC leads with the lone voided bill. And the note the room repeats: this census reads CLAIMS — #28 still sits in settled on the label with zero payment rows behind it, which is exactly why the row-level anti-join is the next query, not a footnote.",
    },
  ],

  problems: [
    { slug: "trips-and-users", why: "The canonical two-sided screen: ride status rates with excluded accounts handled in the join — Gett's corporate-book version of cancellation-share-by-account." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The volume-argmax read: which account books most rides, decided on a grouped count — the rollup's leaderboard form." },
    { slug: "top-travellers", why: "Per-rider spend rollup with the big totals on top — the account billing ladder this kit's first case rebuilds at account grain." },
    { slug: "immediate-food-delivery-ii", why: "A conditional-count ratio where the denominator is the whole test — completed ÷ ALL booked, never ÷ resolved: 52 of 103, not 52 of 59." },
    { slug: "percentage-of-users-attended-a-contest", why: "Reach share across accounts with the 100.0-before-division fix — the account-penetration percentage Gett growth decks quote." },
    { slug: "bank-account-summary-ii", why: "Per-account debit/credit folds with NULL-safe arms — the corporate statement view billing ops ships monthly, cents handled honestly." },
    { slug: "customers-who-never-order", why: "The anti-join grammar itself: LEFT JOIN + IS NULL as a survival rule — and the confidence to report a verified zero never-ordered accounts." },
    { slug: "average-time-of-process-per-machine", why: "Per-entity latency folds — the completion-lag read (2.98-day average, 2..4 range) grouped by the zone or account doing the work." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before every account leaderboard, said out loud with the shared-rung policy." },
    { slug: "department-top-three-salaries", why: "Top-3 per group with a join-back for names — the per-region account ladder, tie-proofed and NULL-safe." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator drill Gett's ratio questions orbit." },
    { slug: "monthly-transactions-i", why: "Month-bucket totals with a cancelled-count alongside — status-aware aggregation on the 2024-01..2025-02 billing spine." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Above-average screens via subquery — the empty-inner-query trap in textbook clothing, and the follow-up every Gett panel is fishing for." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — the NULL-policy and rounding habits in one deliverable." },
    { slug: "duplicate-charge-pairs", why: "Self-join anomaly detection on settlement rows — the duplicate-charge hunt that pairs naturally with this book's split-settlement invoices." },
    { slug: "the-most-recent-three-orders", why: "Per-account latest-3 via window — the 'recent rides' rail travel managers open first, ROW_NUMBER with a deterministic tie-break." },
  ],
};
