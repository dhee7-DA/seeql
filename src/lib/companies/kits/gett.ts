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
    "Two more ledgers frame the economics. On the supply side, fleet partners carry the book with a heavy top: **Nordic Gadgets AB at 32%** of billed value with Midwest Hardware Co at 26.7% behind it — more than half the ground supply rides on two partners — while the tail splits thin (Shenzhen Electro 8.8%, Pacific Textiles 8.6%), which is why every partner read ships with a share column beside the revenue rank. On the cost side, the ops book runs 36 expense lines worth 25,416.00, of which {amber:Rent} alone is 14 lines and 16,800.00; and the fare catalog is barbell-shaped — 8 budget classes averaging 32.06, 8 standard classes averaging 111.5 up to the 199.99 ceiling, and a {rose:premium} band at 200-plus that is **empty**. An empty band is a finding: the honest census prints the hole beside `MAX(price)` instead of padding it.",
    "Prep roadmap for the deep cuts: sequence the work the way the screens stack. Week one, rebuild the fold family at two grains — the {amber:account billing rollup} with its HAVING floor, then the region pivot where every ride fate becomes its own conditional column. Week two, the money shapes: the settlement census in cents, the unpaid-bills anti-join, and the {sky:pace walk} where `LAG` turns 14 monthly buckets into 13 deltas. Week three, the boards: a one-pass `FILTER` census over the ops book and the fleet-partner share board staged on a derived table. Then rehearse the failure modes by name — integer division, filter-drifted denominators, `NOT IN` against a NULL-carrying set, ties without a policy — *because at this level the basics are assumed; the screen is hunting for the analyst who states populations before results*.",
  ],

  dayInLife: [
    "**08:00 —** The day opens on the SLA board. Overnight corporate pickups versus completion pings: 82 of 103 rides carry a ping, lag averaging 2.98 days, and the first query is a reconciliation — do the completed-ride counts tie to what billing invoiced overnight, did any zone's lag drift off its band (APAC runs fastest at 2.93, LATAM slowest at 3.5), are the 14 awaiting-dispatch rides still inside their pickup windows? A drift here is the standup's first fire, and the analyst who can write the diff — which side is missing rows, at which grain — *is the one everyone waits on*.",
    "**11:00 —** Midday is account-rollup surgery. A travel manager wants the month's spend by corporate account with ride counts beside it — **Alice Chen 24 rides and 7,262.35** on top, the four-account tie at 4 rides each spelled out below — and a second analyst asks the same table for distinct accounts per region, which is a different number and a different query: `COUNT(*)` versus `COUNT(DISTINCT customer_id)`. Each deliverable gets written twice: once to answer, once with the denominator and the survival rule spelled out, because *a rollup that survives the budget review is one whose population was named out loud*.",
    "**15:00 —** The afternoon is the invoice run. The monthly billing book opens: 28 `invoices`, every amount in INTEGER cents, every dollar read `amount_cents / 100.0`. The coverage census folds first — 21 settled exactly, 6 with no settlement rows at all, 1 partial at 4,000.00 of 6,148.00 — and then the anomaly sweep: #28, which *claims paid with zero settlement rows* (1,756.00) and routes to the fraud queue, beside its mirror image #11, {rose:void-but-paid} at 925.00. Settlement speed gets its own read: 20 settled bills averaging 28.4 days against uniform 30-day terms, fastest 13, slowest 84.",
    "**17:30 —** End of day is the writeup that keeps tomorrow honest. The SLA report ships with its NULL policy in the header (lag exists only for the 82 pinged rides; the 21 without one are awaiting or cancelled, not zero-lag), the rollup ships with its grain labeled per column, and the AR follow-up list carries owners, not just balances. The rhythm to internalize: Gett SQL exists to keep rides, accounts and money in one reconciled story — *the ride ledger and the invoice book are the same month told at two grains*.",
    "**21:00 —** The late window belongs to the boards that feed tomorrow morning. The fleet-partner share board rebuilds for the supply review — **Nordic Gadgets AB 11,130.25 at 32%** of the book, Midwest Hardware Co 9,294.93 at 26.7% behind it, the tail cut at the 3,049.07 revenue line — and the ops cost census folds the month's spend in one pass: 36 lines, 25,416.00, the {amber:Rent} arm counted sideways instead of queried twice. The last read is the pace file: monthly revenue on the walk, {sky:+1,922.18} into September's 3,116.04 against the {rose:-1,716.45} July hole — a delta that honestly spans the gate-skipped April and says so in the footnote. The handoff note writes itself the way everything here does: *grain, population, cents rule — three lines at the top, numbers underneath*.",
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
    { name: "Fleet-partner concentration", what: "Share of billed value folded per fleet partner: Nordic Gadgets AB 11,130.25 at 32%, Midwest Hardware Co 9,294.93 at 26.7% — the top two carry more than half the book, which is leverage before it is a commercial read. The share column rides beside the revenue rank, always against the full 34,833.28 book." },
    { name: "Ops cost base", what: "The expense book: 36 lines worth 25,416.00 — Rent 14 lines / 16,800.00, Ads 14 / 4,570.00, Travel 3 / 2,521.00, Tools 5 / 1,525.00. The deliverable is a one-pass census with category arms counted sideways; four separate grouped queries can drift apart between the runs." },
    { name: "Category fare mix", what: "Billed value by ride class: Audio 11,744.01 over 97 units on top, Wearables 6,929.12, Video 5,198.41 — while Accessories fans widest at 121 units across 54 rides. Mix is a two-axis read: where the money is, and where the fan-out is." },
    { name: "Ledger tie-out", what: "The close's integrity gate: 181,080 cents of debits against 181,080 of credits across 80 ledger entries, delta 0. A non-zero delta stops the close cold; proving the tie is the last query of the month and the first number the finance lead reads." },
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
    {
      name: "Month-over-month pace walks",
      why: "The billing curve is read as a walk: 14 monthly buckets from 2024-01 to 2025-02, each month's revenue set against the one before it with LAG. Gett drills the edges that break walks — the first row's NULL delta, gate-skipped months that make a delta span two steps, and LEAD flipping every sign on the board.",
      slugs: ["year-on-year-growth-rate", "rising-temperature", "rolling-average-steps"],
    },
    {
      name: "Fate pivots & one-pass censuses",
      why: "Ride fate is a four-column pivot — completed, in-trip, awaiting, cancelled per region — and the ops cost book is read the same way: total lines and spend per category with arms counted sideways via FILTER, one scan of the book. The drill is writing the census once instead of once per arm, so the arms can never drift apart.",
      slugs: ["count-the-number-of-experiments", "sales-by-day-of-the-week", "dynamic-pivoting-of-a-table"],
    },
    {
      name: "Fleet-partner concentration & shares",
      why: "Partner reads ship with a share column: Nordic Gadgets AB 11,130.25 is 32% of the 34,833.28 book, and that math — 100.0 times the partner fold over the full-book total — is where derived-table staging and CROSS JOIN totals earn their keep. Share of total is the shape; deciding the denominator's population is the debate.",
      slugs: ["portfolio-concentration-hhi", "compute-the-rank-as-a-percentage", "popularity-percentage"],
    },
    {
      name: "Stacked totals & set-op stitching",
      why: "Month-close wants one report with two populations — settled bills stacked beside the unpaid queue, a detail section beside a TOTAL banner — and set ops are the stitch. UNION ALL keeps both copies where UNION silently dedupes; stacked arms must line up column for column, or the report cannot print.",
      slugs: ["monthly-transactions-ii", "count-apples-and-oranges", "the-number-of-seniors-and-juniors-to-join-the-company"],
    },
    {
      name: "Self-join pairing & duplicate hunts",
      why: "Five invoices on this book carry two settlement rows each — splits that are legitimate — but the same self-join shape hunts the pairing bugs that are not: duplicate charge legs, adjacent-ride windows, symmetric relationships. Gett drills the strict-inequality self-join that pairs each row with its neighbors without doubling the population or pairing a row with itself.",
      slugs: ["consecutive-numbers", "symmetric-pairs", "number-of-calls-between-two-persons"],
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
    {
      id: "gett-t9",
      q: "Rides join to billed ride lines one-to-many: 103 rides fan out to 251 lines. What does that fan-out do to every count and average downstream, and what is the repair?",
      a: "The join multiplies the ride grain by the lines each ride carries: after order_items lands, COUNT(*) counts 251 line rows, not 103 rides, and every rate built on it — completion share, per-region ride counts — silently re-denominates in lines. SUMs of money survive only because the line values fold back to the ride total; but per-ride averages die, because AVG over the joined rows is a per-LINE mean wearing a per-ride name. The repair is deliberate: when the read must stay at ride grain after the fan-out, COUNT(DISTINCT order_id) counts rides, or the ride grain gets staged first (CTE or subquery) and lines join in after. Saying 'this query's grain is lines, not rides, and here's why that's fine/that's not' out loud is the answer the panel wants — the silent version is the bug that ships.",
      tag: "joins",
    },
    {
      id: "gett-t10",
      q: "The finance lead wants a running billed-spend column beside the monthly pace walk. How do window frames decide what a running SUM sees, and what is the default-frame trap when ORDER BY is present?",
      a: "With an ORDER BY in the OVER clause, the default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — running from the partition's start to the current row — which is the running total you asked for, until ties appear. RANGE includes PEER ROWS: every row sharing the ORDER BY value joins the frame, so a running sum over a duplicated value jumps by the whole tie group at once. The explicit form is ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which counts rows physically and makes ties irrelevant. On a month spine ordered by a unique month key the two agree; the moment the ordering column can repeat — revenue, rides, any measure — the analyst who can't say 'RANGE vs ROWS, and which I chose and why' is writing a number whose definition depends on the data. Every running column in this kit's reports ships with its frame stated.",
      tag: "windows",
    },
    {
      id: "gett-t11",
      q: "A travel manager wants each account's ride classes folded into one cell — 'Audio, Video, Audio' as a single string. What does GROUP_CONCAT actually promise, and when is the fold the wrong tool?",
      a: "GROUP_CONCAT(column) folds non-NULL values into a separator-joined string — comma by default, customizable via the second argument. Three promises it does NOT make: order is unspecified unless the aggregate carries its own ORDER BY (recent SQLite) or the input is pre-sorted in a staged subquery — an unordered fold can print the same account differently on two runs; NULLs are skipped silently, so the cell's arity is invisible — pair it with COUNT for the honest count beside it; and length is unbounded, so a 24-ride account can produce a cell no dashboard renders. The wrong-tool cases: when consumers need to filter or aggregate on the folded values (strings don't fold back cheaply), and when the fold is hiding a grain change — the account row that now carries a list is no longer the row the rollup promised. In reports it's a display edge; in data, keep the rows.",
      tag: "aggregation",
    },
    {
      id: "gett-t12",
      q: "A teammate writes WHERE account_id NOT IN (SELECT account_id FROM reviews) and the report returns nothing — on a table where dozens of accounts clearly qualify. Walk through the mechanism.",
      a: "NOT IN is a set-membership test with three-valued logic, and one NULL poisons the whole set: account_id NOT IN (5, 8, NULL) expands to account_id != 5 AND account_id != 8 AND account_id != NULL, and the last comparison is UNKNOWN for every row — so the WHERE passes nothing, and an empty report that looks like a filter bug in the outer query is actually data quality in the inner one. This is distinct from the scalar-subquery empty case, which yields a NULL comparison against ONE value; NOT IN spreads the poison across the entire set. The repairs, in order of honesty: NOT EXISTS (correlated, NULL-immune, and short-circuits per row), or a LEFT JOIN + IS NULL anti-join, or — only if the semantics truly demand it — filtering NULLs out of the inner query with a comment explaining why the answer may be incomplete. In a billing context, 'the reviews table has a NULL account_id' is the real finding; the query rewrite is triage.",
      tag: "nulls",
    },
    {
      id: "gett-t13",
      q: "SELECT ROUND(SUM(total), 2) AS revenue ... WHERE revenue > 2500 — why does that fail, and where exactly are column aliases visible in the pipeline?",
      a: "Because WHERE runs before SELECT: the pipeline is FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, and the alias revenue is created at the SELECT stage — at WHERE time the fold hasn't happened and the name doesn't exist. HAVING and ORDER BY can often see aliases (SQLite extends alias visibility there as a convenience), but WHERE cannot, and portable SQL shouldn't assume it anywhere except ORDER BY. The fixes, in order of preference: repeat the expression in WHERE (WHERE SUM(total) > 2500 is equally wrong — aggregates in WHERE fail for the same pre-fold reason, so this one becomes a HAVING clause, which is exactly what HAVING is for); or wrap the fold in a derived table or CTE and filter the outer query, which is the shape that scales to 'fold, then filter, then fold again' pipelines. The teachable sentence: WHERE is a row-level gate over raw rows, HAVING is a group-level gate over folds, and aliases live downstream of both.",
      tag: "pipeline",
    },
    {
      id: "gett-t14",
      q: "The dunning list needs accounts with invoices but ZERO settled bills. Which shape do you reach for — IN, NOT IN, EXISTS, NOT EXISTS — and what does each one cost or risk?",
      a: "NOT EXISTS is the shape: correlated per account, NULL-immune, and it short-circuits on the first paid settlement it finds. NOT IN (SELECT account_id FROM payments JOIN invoices ...) carries the NULL poison risk from the inner column and forces the engine to materialize the whole set; IN works only for the positive form (accounts WITH settled bills) and has the same materialization cost. The deeper craft is asking what 'zero settled' means at which grain: invoices staged per account first, then tested, or payments probed directly per account through the invoice bridge — different joins, same English sentence. And the population statement comes before the shape: this book has 28 invoices, 27 payment rows, and six bills with no settlements at all — the dunning list is built from bills, not accounts, and the account-level rollup of it is a second query. Candidates who pick a keyword before stating the grain are answering a different question.",
      tag: "subqueries",
    },
    {
      id: "gett-t15",
      q: "Invoices here are due exactly 30 days after issue. How do you build the due date, the overdue days, and the aging bucket without string surgery?",
      a: "DATE(issue_date, '+30 days') builds the due date as a date, not a string you'll regret comparing — this book's terms are uniform (average, min and max all 30 days), so the modifier IS the terms schedule. Overdue days are JULIANDAY(reference) - JULIANDAY(due_date): positive means late, and the reference date is a policy choice you state in the header — MAX(paid_on) for a close, CURRENT_DATE for a live list, never 'today whenever the query ran' without labeling it. The aging bucket is a CASE over that delta — current, 1-30, 31-60, 60-plus — and the buckets must count every open invoice exactly once, ELSE arm included. The reconciliation twist this book earns its keep on: the terms are uniform at 30 but settlement is not — 28.4 days average, fastest 13, slowest 84 — so the aging bucket on DUE date and the latency distribution are two different reports that superficially look like one. Name which one you wrote.",
      tag: "dates",
    },
    {
      id: "gett-t16",
      q: "Billing ops says every census must 'sum back'. What identity does the settlement-coverage census satisfy, and what query proves it?",
      a: "The coverage census folds 28 invoices into three classes — 21 settled exactly (65,612.00), 1 partial (6,148.00 billed, 4,000.00 paid), 6 with no payment rows (15,217.00) — and the identities are: class counts sum to 28, class billed amounts sum to the 86,977.00 book, and class paid amounts sum to the 69,612.00 that actually landed across 27 payment rows. The proof query is the same fold with a WITH-check or a stacked comparison: SELECT the census, SELECT the raw totals, and assert the deltas are zero — delta zero is the deliverable, the way the ledger proves itself at 181,080 debits against 181,080 credits. A census that doesn't sum back isn't a wrong number, it's an unmapped row: some status value, some NULL amount, some payment with no invoice home fell outside the arms you named. The analyst's instinct is to ask 'what did my ELSE arm catch?' before anyone else does — because in reconciliation, the unnamed row is always the story.",
      tag: "quality",
    },
    {
      id: "gett-t17",
      q: "Five invoices on this book carry two payment rows each. How do you find duplicated settlement legs with a self-join — and pair rows without matching a row to itself or double-counting each pair?",
      a: "The shape is invoices self-joined through payments on the same invoice: payment legs a and b where a.invoice_id = b.invoice_id. The join condition does the integrity work: a.id < b.id is a strict inequality that kills two birds — a row can never pair with itself (id = id fails the strict test), and each unordered pair appears exactly once (the (a,b) with a.id smaller is kept; the mirror (b,a) fails the inequality). Using != instead admits both mirrors — every pair twice — and <= admits self-pairs, which reads as a duplicate where there is none. This is the same self-join family as adjacent-ride pairing (each account's ride against its neighbor) and symmetric-relationship hunts, and the discipline transfers: define the pair's canonical order in the join, not in a post-hoc DISTINCT. On this book the five two-leg splits are legitimate — the query exists to FIND them, count them, and prove they're the expected five, because next quarter the same query catching six is the fraud alert.",
      tag: "joins",
    },
    {
      id: "gett-t18",
      q: "Growth wants fare quartiles across the 103 rides and per-region tiles. How does NTILE behave when the population doesn't divide evenly, and why is it not a rank?",
      a: "NTILE(4) assigns bucket numbers 1..4 to ordered rows, and when the count doesn't divide evenly the remainder goes to the EARLIER tiles: 103 rows tile as 26, 26, 26, 25, not 25, 25, 25, 28 — the first quartile is one row fatter, and the boundary rows are a function of arithmetic, not data. Two properties make it not-a-rank: NTILE ignores ties completely — two rides with the same fare can land in different tiles on either side of a boundary, because the function fills by row position, not by value equality — and every tile is guaranteed populated regardless of how clustered the values are, unlike a CASE over value thresholds, which can return an empty band (this catalog's premium band at 200-plus is exactly such a hole). So the honest answer names the trade: tiles for distribution slicing where peer values may legitimately split, RANK/DENSE_RANK when peers must share a rung, and an explicit value-threshold CASE when the business actually means fixed bands. NTILE is the one people reach for when they mean all three.",
      tag: "windows",
    },
    {
      id: "gett-t19",
      q: "Ops wants total spend, Rent spend, and Ads spend from the expense book in ONE query. Compare the FILTER clause against four grouped queries and against SUM(CASE WHEN ...).",
      a: "FILTER (WHERE ...) is a conditional aggregate with readable syntax: COUNT(*) FILTER (WHERE category = 'Rent') counts inside the same scan that produces COUNT(*) — 36 lines total, 14 of them Rent, in one pass. SUM(CASE WHEN category = 'Rent' THEN amount ELSE 0 END) computes the same thing with more ceremony and a whole class of copy-paste bugs (forget the ELSE and NULLs propagate; mistype the arm and the arm is silently zero). Four separate grouped queries are the real enemy, and not for speed: each is a separate population decision, and between two runs on a moving table the totals can drift — the classic month-close incident is two exports that disagree by one posting. One pass is one population, one timestamp, one truth. The phrasing habit that closes the interview: 'the census is one query because the census is one claim' — the arms are a display choice, the scan is a correctness choice.",
      tag: "aggregation",
    },
    {
      id: "gett-t20",
      q: "The close pack wants a detail section plus a grand-total row in one result set. Why UNION ALL and not UNION, and where do stacked reports go wrong?",
      a: "UNION ALL appends; UNION dedupes — it runs a distinct over the combined rows, which costs a sort and can silently delete legitimate duplicates: two identical-looking detail rows (same account, same spend, same day) collapse into one, and a close that must reconcile to the raw ledger no longer adds up. The stacked-report failure modes are structural: every arm must project the same column count with compatible types or the stack won't parse; literals pad the arms to match shape (the 'TOTAL' banner lives in a first column that detail rows fill with NULL or a real key); and ORDER BY at the end of the stack applies to the WHOLE result — an ORDER BY inside an arm is illegal, so the sort key has to work across both populations, usually a synthetic sort column. On this book the pattern shows up as the rail/method stacks: card and wire legs folded separately, then a TOTAL row appended that must tie to 69,612.00. If the total row doesn't tie, the stack printed fine and reasoned wrong.",
      tag: "set-ops",
    },
    {
      id: "gett-t21",
      q: "The partner share board needs each partner's revenue AND its share of the FULL book — while the board itself is filtered to a revenue floor. Why stage a derived table instead of writing one flat GROUP BY?",
      a: "Because the query needs two grains at once: the per-partner fold (Nordic 11,130.25) and the whole-book denominator (34,833.28) — and a flat GROUP BY can only see its own groups. The staging move: fold partners in a derived table, compute the book total in a separate aggregate (its own derived table CROSS JOINed on, or a scalar subquery), then divide in the outer SELECT — 100.0 * partner / book, rounded once, at the display edge. The trap this book taught me concretely: a window like SUM(revenue) OVER () computes over the rows that SURVIVED the WHERE, so a board filtered at 3,049.07 computes shares against 31,853.13, not the 34,833.28 book — every share overstated, and plausibly so. The denominator's population is a definition, and definitions outrank convenience: if shares are of the full book, the total comes from the unfiltered fold, staged separately. CTE versus inline derived table is house style; the staging itself is the correctness move.",
      tag: "subqueries",
    },
    {
      id: "gett-t22",
      q: "This ledger runs 2024-01-01 through 2025-02-27. SUBSTR(created_at, 1, 7) and DATE(created_at, 'start of month') both make month keys — what's the real difference, and what is the partial-month trap?",
      a: "As key-makers they agree: both produce '2024-01'-style buckets, and the 14-bucket spine from 2024-01 to 2025-02 comes out identical. The differences are practical: SUBSTR is text surgery that only works on ISO-shaped timestamps, DATE with 'start of month' is a real date you can add intervals to, compare, and join against a calendar table. The trap that actually bites is not the function — it's the EDGE BUCKETS: this ledger's last month, 2025-02, ends on the 27th, so its bucket is a partial month wearing a full month's name, and any flat comparison ('February is down 30% from January') is a range-size artifact, not a trend. The discipline: label partial buckets in the report, truncate trend comparisons to complete months, and never annualize from a partial period — '13 rides in six weeks of 2025' is the honest sentence, '2025 is running slow' is not. Date discipline here is range discipline: the spine is text, the ranges are half-open, and the edge bucket is always the suspect.",
      tag: "dates",
    },
    {
      id: "gett-t23",
      q: "Completed + in-trip + awaiting + cancelled must equal booked rides in every group. Where does that identity live in the query, and what does a violation actually mean?",
      a: "It lives in the pivot itself: each fate is a conditional arm over ALL booked rides — SUM(CASE WHEN status = ... THEN 1 ELSE 0 END) per arm — and the four arms summing to COUNT(*) per group is the identity, checkable in the same query with a fifth column or a HAVING that compares the sum to the count. A violation has exactly one meaning: a status value the arms didn't name. The pivot's arms are exhaustive only if the ELSE of the FINAL arm is zero — and the way to prove it is a GROUP BY status census first, which enumerates the states that actually exist: this book has four (52 delivered, 30 shipped, 14 pending, 7 cancelled), so four arms close the population. The junior failure is writing three arms and an ELSE labelled 'other' that quietly absorbs 14 rides; the senior failure is worse — mapping 'shipped' to in-trip for a report the desk reads as 'in-transit', a definition error no identity can catch. Idioms: enumerate first, pivot second, assert the identity third.",
      tag: "quality",
    },
    {
      id: "gett-t24",
      q: "This db is 103 rides — why would anyone care about indexes? What sargability habits do you practice at this size that matter at fleet scale?",
      a: "Because habits, not hardware, carry across four orders of magnitude, and the interview is checking the instinct, not the plan. Sargability first: a predicate that wraps the indexed column in a function — JULIANDAY(shipped_at) - JULIANDAY(created_at) <= 3, SUBSTR(created_at, 1, 7) = '2024-01' — cannot use an index on that column, because the function must run per row; the rewrite is a half-open range on the raw column (created_at >= '2024-01-01' AND created_at < '2024-02-01'), which seeks. Composite order second: an index on (customer_id, created_at) serves the account-rollup seek; the reverse order doesn't, because the rollup filters on account first. Covering third: if the fold only needs customer_id and total, an index that contains both answers from the index alone. The honesty clause the panel wants: at 103 rows a table scan is faster than any index dance, and saying so — 'I write sargable because the shape survives scale, not because this query needs it' — is the answer. The analyst who tunes the 103-row db before stating the denominator is optimizing the wrong thing.",
      tag: "performance",
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
    {
      id: "gett-mcq-11",
      prompt: "The rides table (103 rows) joins to the billed-lines table (251 rows) on ride id. What does COUNT(*) return on the joined result?",
      choices: ["103 — joins preserve the left table's row count", "251 — every billed line survives the join, repeats and all", "354 — the tables add", "It depends on the join type only"],
      answer: 1,
      why: "A one-to-many join returns one row per MATCH on the many side: 103 rides fan out to their 251 billed lines, and COUNT(*) counts line rows. The ride grain survives only as COUNT(DISTINCT order_id).",
      notes: [
        { choice: 0, why: "Joins preserve nothing about row counts — they preserve match relationships. The fan-out is the whole reason per-ride rates break after this join." },
        { choice: 2, why: "Joins intersect, not append — 354 would need a UNION ALL of the raw tables, which is a different (and meaningless) report." },
      ],
      difficulty: "easy",
    },
    {
      id: "gett-mcq-12",
      prompt: "WHERE account_id NOT IN (SELECT account_id FROM reviews) returns zero rows despite dozens of qualifying accounts. The likeliest cause?",
      choices: ["The outer table is empty", "A NULL account_id in the reviews set — one NULL poisons the whole NOT IN", "NOT IN requires a join", "The accounts column is text"],
      answer: 1,
      why: "NOT IN expands to a chain of != comparisons against every set member; against NULL the comparison is UNKNOWN, so the whole conjunction fails for every row. One NULL in the inner set empties the report.",
      notes: [
        { choice: 2, why: "NOT IN is a predicate, not a join — it needs no join clause. The empty result is three-valued logic, not missing syntax." },
        { choice: 3, why: "Column type affects comparisons but wouldn't produce a silent zero — text accounts still compare. The NULL mechanism is the one that returns NOTHING while looking valid." },
      ],
      difficulty: "easy",
    },
    {
      id: "gett-mcq-13",
      prompt: "The close pack stacks a detail section and a grand-total row into one result. Why UNION ALL rather than UNION?",
      choices: ["UNION ALL is faster and never needed here otherwise — UNION's dedupe could merge two identical detail rows into one", "UNION cannot combine SELECTs with different WHERE clauses", "UNION ALL allows ORDER BY inside each arm", "UNION requires the same table in both arms"],
      answer: 0,
      why: "UNION runs a distinct over the combined rows — legitimate duplicates (same account, same spend, same day) collapse and the pack no longer reconciles to the raw ledger. UNION ALL appends verbatim; the arms must match column-for-column either way.",
      notes: [
        { choice: 2, why: "ORDER BY inside an arm is illegal in a compound SELECT — the sort applies to the whole stack, usually via a synthetic sort column." },
        { choice: 3, why: "Set ops constrain COLUMNS, not tables — two different tables stack fine if they project the same shape. The dedupe semantics are the real difference." },
      ],
      difficulty: "easy",
    },
    {
      id: "gett-mcq-14",
      prompt: "A running billed-spend column: SUM(revenue) OVER (ORDER BY month). Two months somehow share the same revenue value. What does the default frame do at the second one?",
      choices: ["It sums only rows strictly before it", "It includes peer rows — both tied months' revenue enter the frame together, so the running total jumps by the pair", "It errors on duplicate ORDER BY values", "It restarts the running sum at zero"],
      answer: 1,
      why: "With ORDER BY present, the default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW, and RANGE includes peers: every row sharing the ORDER BY value joins the frame at once. The explicit fix is ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW.",
      notes: [
        { choice: 0, why: "That's the ROWS frame — the default is RANGE, which is exactly the difference the question is testing. Duplicate keys make the two frames diverge." },
        { choice: 2, why: "Duplicate ORDER BY values are legal in windows — they create peers. The engine doesn't error; it changes the frame's membership, which is worse." },
      ],
      difficulty: "medium",
    },
    {
      id: "gett-mcq-15",
      prompt: "GROUP_CONCAT(product_class) folds each account's ride classes into one cell. Which promise does the function NOT make?",
      choices: ["Non-NULL values are joined with commas by default", "The values appear in a deterministic order", "NULL values are skipped", "The result is a single string per group"],
      answer: 1,
      why: "Order is unspecified unless the aggregate carries its own ORDER BY or the input rows are pre-sorted — an unordered fold can print the same account differently on two runs. Default separator is a comma, NULLs are skipped, one string per group.",
      notes: [
        { choice: 2, why: "NULL-skipping is real — and it means the cell's arity is invisible, which is why the fold ships with COUNT beside it." },
        { choice: 0, why: "The comma default is true, and it's overridable with a second argument. The missing guarantee is ordering." },
      ],
      difficulty: "medium",
    },
    {
      id: "gett-mcq-16",
      prompt: "NTILE(4) over the 103 rides ordered by fare. What are the tile sizes?",
      choices: ["25, 25, 25, 28", "26, 26, 26, 25", "25, 25, 26, 27", "Undefined — NTILE errors when the count isn't divisible"],
      answer: 1,
      why: "103 = 4 x 25 remainder 3, and NTILE gives the remainder to the EARLIER tiles: 26, 26, 26, 25. The first quartile is one row fatter, and boundary placement is arithmetic, not data.",
      notes: [
        { choice: 0, why: "That's the remainder-to-the-back intuition — natural, wrong. The spec pads the front tiles, so quartile 1 and the median boundary shift." },
        { choice: 3, why: "NTILE never errors on indivisible counts — distributing the remainder IS its contract. The tie behavior (peers split across tiles) is the separate trap." },
      ],
      difficulty: "medium",
    },
    {
      id: "gett-mcq-17",
      prompt: "In one SELECT: SELECT ROUND(SUM(total),2) AS revenue FROM orders WHERE revenue > 2500. Why does this fail, and what's the minimal correct repair?",
      choices: ["Aliases are never usable anywhere — repeat ROUND(SUM(total),2) in a HAVING", "WHERE runs before SELECT, so the alias doesn't exist yet; the aggregate gate belongs in HAVING", "Aggregates cannot appear with aliases at all", "ROUND cannot wrap SUM"],
      answer: 1,
      why: "Pipeline order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. The alias is created at SELECT; at WHERE time nothing exists yet — and a threshold ON THE FOLD is a group-level gate, which is what HAVING is for.",
      notes: [
        { choice: 0, why: "Aliases ARE usable in ORDER BY (and often GROUP BY/HAVING in SQLite) — 'never' overclaims. The real rule is stage visibility: WHERE is upstream of SELECT." },
        { choice: 2, why: "Aggregates and aliases coexist fine in SELECT and HAVING. The failure is timing, not combination." },
      ],
      difficulty: "hard",
    },
    {
      id: "gett-mcq-18",
      prompt: "Invoices carry uniform 30-day terms. Which expression builds the due date, and which comparison flags a bill overdue as of a stated reference date?",
      choices: ["due = issue + 30; overdue = CURRENT_DATE > due, unstated", "DATE(issue_date, '+30 days'); overdue if JULIANDAY(reference) - JULIANDAY(due_date) > 0, reference named in the header", "SUBSTR arithmetic on the date string; overdue if the substring sorts lower", "STRFTIME('%d', issue_date) + 30; overdue if it exceeds the month length"],
      answer: 1,
      why: "DATE with a '+30 days' modifier is real date arithmetic on this book's uniform terms (avg/min/max all 30). The overdue test is a julianday delta against a reference date that is a POLICY choice — MAX(paid_on) for a close, CURRENT_DATE for a live list — and it gets named in the report header.",
      notes: [
        { choice: 0, why: "issue + 30 works in some engines as integer day math, but the unstated reference date is the buried bug: the same query prints different overdue lists depending on when it ran." },
        { choice: 3, why: "Day-of-month plus 30 is calendar illiteracy — January 40th. Date modifiers and julianday deltas are the toolkit; string day numbers are the trap." },
      ],
      difficulty: "medium",
    },
    {
      id: "gett-mcq-19",
      prompt: "You need accounts that have invoices but ZERO settled bills. The payments side can contain NULLs. Which shape is BOTH correct and NULL-immune?",
      choices: ["account_id NOT IN (SELECT account_id FROM paid-legs)", "LEFT JOIN from accounts to paid legs + IS NULL, or NOT EXISTS against the paid-legs set", "INNER JOIN to paid legs, count = 0 in HAVING", "COUNT(paid legs) = 0 in WHERE"],
      answer: 1,
      why: "The anti-join (LEFT JOIN + IS NULL) and NOT EXISTS both keep accounts whose probe finds no match and neither cares whether the inner set carries NULLs. NOT IN silently empties on a NULL, and the INNER-join forms can never see the zero-count accounts — the join already dropped them.",
      notes: [
        { choice: 2, why: "INNER JOIN discards exactly the accounts you're hunting — the ones with no paid legs. HAVING never gets a chance; the row is gone." },
        { choice: 3, why: "There is no COUNT(*) in WHERE — aggregates don't exist pre-fold. Same pipeline-order lesson wearing an anti-join costume." },
      ],
      difficulty: "hard",
    },
    {
      id: "gett-mcq-20",
      prompt: "AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) walks the billing curve as a 2-point average. What does the FIRST row return?",
      choices: ["NULL — it has no preceding row", "Its own revenue — the frame shrinks to the available row", "Zero", "The average of the whole partition"],
      answer: 1,
      why: "ROWS frames clip to the rows that exist: on the first row the frame is just that row, so the '2-point average' is a 1-point average — the row's own value, printed as if it were a smoothed number. Labeling the edge row (or widening the window) is the fix.",
      notes: [
        { choice: 0, why: "NULL edges belong to LAG/LEAD, whose offset rows don't exist. Frame boundaries shrink instead — a value, not a NULL, which is why the edge goes unnoticed." },
        { choice: 3, why: "That's the default no-frame window (RANGE UNBOUNDED..CURRENT ROW without ORDER BY). The explicit 1-PRECEDING frame is local by construction." },
      ],
      difficulty: "hard",
    },
    {
      id: "gett-mcq-21",
      prompt: "The biggest single fare on the ledger is 1,088.44 (Farid Nasser, APAC). Which query returns that ride rather than a fold of it?",
      choices: ["SELECT MAX(total) FROM orders", "SELECT c.name, o.total FROM orders o JOIN customers c ... ORDER BY o.total DESC LIMIT 1", "SELECT region, MAX(total) FROM orders GROUP BY region", "SELECT SUM(total) FROM orders WHERE total > 1000"],
      answer: 1,
      why: "MAX(total) alone returns the number without its who/where; the regional MAX returns one number per region. The argmax ride — row, rider, fare together — needs ORDER BY total DESC LIMIT 1: sort, then take the top row.",
      notes: [
        { choice: 2, why: "APAC's max happens to BE the global max here, but the shape returns 4 rows on other ledgers and never the rider's name without a join-back. Argmax per group is a window (or correlated) job." },
        { choice: 3, why: "SUM over big fares is a dollar bucket, not a ride — 1,088.44 won't appear, and if it did it would be by coincidence. The ask is a row, so the query must end in rows." },
      ],
      difficulty: "easy",
    },
    {
      id: "gett-mcq-22",
      prompt: "One-pass opex census: COUNT(*) FILTER (WHERE category = 'Rent') over the 36-line expense book returns…",
      choices: ["36 — FILTER is decorative on COUNT(*)", "14 — the Rent lines only", "16,800 — the Rent spend", "0 — FILTER works only on SUM"],
      answer: 1,
      why: "FILTER (WHERE ...) narrows the aggregate's input rows without narrowing the query's: 36 lines scanned, 14 of them Rent, in the same pass that produces the 36 and the 25,416.00 total. One scan, one population, arms counted sideways.",
      notes: [
        { choice: 0, why: "FILTER is precisely not decorative — it's the conditional-count mechanism. COUNT(*) unfiltered would erase the census's point." },
        { choice: 2, why: "16,800.00 is the Rent DOLLARS — that arm is SUM(amount_cents) FILTER (...)/100.0. Mixing the count arm and the money arm is the census's own column mix-up." },
      ],
      difficulty: "easy",
    },
    {
      id: "gett-mcq-23",
      prompt: "The ledger's global check reads 181,080 debits and 181,080 credits. What does delta = 0 certify, and what would a non-zero delta mean?",
      choices: ["Zero delta certifies the trial balance ties — every posting hit both sides; non-zero means an unbalanced or missing posting and the close stops", "Zero delta certifies revenue equals spend", "Delta is meaningless across 80 entries", "Non-zero delta just means rounding"],
      answer: 0,
      why: "The trial balance is the close's integrity gate: across all 80 ledger entries, total debits must equal total credits exactly. Any non-zero delta is an unbalanced or one-sided posting — INTEGER cents leave no rounding excuse — and the close stops until the diff query finds the row.",
      notes: [
        { choice: 1, why: "Debits and credits balancing says nothing about revenue versus spend — those are different accounts with their own nets (44,196 cash net, -86,052 revenue). The tie is structural, not thematic." },
        { choice: 3, why: "The books are INTEGER cents — rounding is impossible by construction. A delta of even one cent is a real posting error, which is exactly why the check is exact." },
      ],
      difficulty: "easy",
    },
    {
      id: "gett-mcq-24",
      prompt: "The ledger carries 90 rides in 2024 and 13 in 2025 (through Feb 27). A stakeholder reads the slide as 'volume collapsed 86%'. The strongest correction?",
      choices: ["The number is right — 13 versus 90 is 86% down", "2025's bucket is a partial year (~14% of it at the cutoff): compare like ranges — e.g. Jan 1–Feb 27 of both years — or label the bucket partial", "Recount with COUNT(DISTINCT) to fix the rate", "2025 rides are still pending, so exclude them"],
      answer: 1,
      why: "The comparison is a range-size artifact: 13 rides accumulated in under two months against twelve full months. Like-for-like windows or an explicit partial-bucket label is the honest fix — the underlying trend may be flat, down, or up, and this slide can't tell you which.",
      notes: [
        { choice: 0, why: "Arithmetically true, analytically false — the denominator is time itself, and the time ranges differ by 10 months. Accepting the number is the analyst failure the slide is testing." },
        { choice: 2, why: "DISTINCT changes the grain (rides vs accounts), not the time ranges. The flaw is the window, so the fix is a window fix." },
      ],
      difficulty: "medium",
    },
    {
      id: "gett-mcq-25",
      prompt: "Settled bills average 28.4 days against uniform 30-day terms, fastest 13, slowest 84. A stakeholder says 'we pay on time'. What does the spread add that the mean hides?",
      choices: ["Nothing — 28.4 under 30 already proves it", "The distribution: a 13..84 spread means some bills settle nearly three terms late — the mean is comfortably under 30 partly because fast payers offset the 84-day tail", "The spread only matters if the mean exceeds 30", "The spread proves the 30-day terms are violated by the vendor"],
      answer: 1,
      why: "A mean is one number wearing a distribution's clothes: 20 settled bills spanning 13 to 84 days can average 28.4 while individual bills run 2.8 terms late. Cash-flow conversations need the tail — percentiles or the min/max pair — not just the average, and 'fastest 13, slowest 84' is the honest two-line summary.",
      notes: [
        { choice: 2, why: "Tails matter before the mean crosses the line — a 84-day bill is a working-capital event at ANY mean. Waiting for the average to breach 30 is how the tail becomes a surprise." },
        { choice: 3, why: "Terms are a contract with the payer, not the vendor — settlement speed measures the corporate account's payment behavior. Direction matters: slow settlement is the customer's ledger, not the partner's." },
      ],
      difficulty: "medium",
    },
    {
      id: "gett-mcq-26",
      prompt: "Finding duplicated settlement legs: payments self-joined on invoice_id. Why is the pair condition a.id < b.id and not a.id != b.id?",
      choices: ["< is faster than != in SQLite", "!= keeps both mirror pairs (a,b) and (b,a) — every real duplicate prints twice; < keeps each unordered pair exactly once and bars self-pairs", "!= fails when ids are NULL", "They return the same rows"],
      answer: 1,
      why: "The strict inequality is the canonical-order trick: a row can't pair with itself (equal ids fail <), and of each true pair only the ordered version survives — the mirror fails the test. With != the same pair appears as (a,b) and (b,a), doubling the count and the confusion.",
      notes: [
        { choice: 2, why: "NULL ids wouldn't join on invoice_id equality anyway in the typical schema — the decisive difference is mirror duplication, which is a logic property of the predicate." },
        { choice: 3, why: "Same rows is exactly wrong: != yields twice the pairs. If they agreed, the duplicate-hunt would be immune to a classic bug — and it isn't." },
      ],
      difficulty: "medium",
    },
    {
      id: "gett-mcq-27",
      prompt: "The pace walk gates months at 8+ rides (2024-01, 02, 03, 05, 07, 09) and LAGs revenue over the month-ordered spine. July's delta prints -1,716.45. Measured against which month?",
      choices: ["June — the calendar month before July", "May — the previous row INSIDE the gate; April fell below the floor and is skipped, so the delta spans two calendar steps", "August — LAG looks forward", "The NULL first row of the walk"],
      answer: 1,
      why: "LAG pairs rows of the QUERY RESULT, not rows of the calendar: April (7 rides) never entered the gate, so July's LAG neighbor is May (2,910.31), and 1,193.86 - 2,910.31 = -1,716.45. A gated walk's deltas cross the gaps — the report says so or it lies by implication.",
      notes: [
        { choice: 0, why: "The calendar-neighbor answer would need April IN the walk — June isn't in the gate either. Every delta past March spans gate-skipped months; that's the walk's fine print." },
        { choice: 2, why: "LEAD looks forward, LAG looks back — and either way the neighbor is the previous RESULT row, not a calendar construct. August isn't in the gate at all." },
      ],
      difficulty: "hard",
    },
    {
      id: "gett-mcq-28",
      prompt: "Two accounts tie at 4 rides and land on opposite sides of an NTILE(3) boundary. The growth board wants tied accounts treated identically. Correct response?",
      choices: ["NTILE is broken — use LIMIT", "Switch to RANK or DENSE_RANK (peers share a rung), or an explicit value-threshold CASE if the business means fixed bands — NTILE fills by row position and may split peers by design", "Add more tiles so ties fall inside one tile", "Order by account name instead of rides"],
      answer: 1,
      why: "NTILE is a distributor, not a rank: it fills tiles by row position and ignores value equality, so peers can split across a boundary. When the requirement is peer-solidarity, the tool is the rank trio — or a threshold CASE when 'top third' really means 'above fare X'.",
      notes: [
        { choice: 2, why: "More tiles changes where the boundary lands, not whether ties respect it — peers can still straddle any position-based split. Tie-solidarity is a property the function must have, not a parameter you tune." },
        { choice: 3, why: "Ordering by name makes the tie-break deterministic but keeps splitting peers by position — and introduces an alphabetical judgment nobody asked for. The fix is a different function, not a different sort." },
      ],
      difficulty: "hard",
    },
    {
      id: "gett-mcq-29",
      prompt: "The partner board filters to revenue >= 3,049.07 and computes ROUND(100.0 * revenue / SUM(revenue) OVER (), 1). What's wrong with the shares?",
      choices: ["Nothing — OVER () is the whole table", "The window computes over the SURVIVING rows only (31,853.13, not the 34,833.28 book) — every share is overstated; the denominator must come from an unfiltered fold staged separately", "OVER () needs a PARTITION BY to be valid", "Rounding to 1dp loses the cents"],
      answer: 1,
      why: "Window functions evaluate after WHERE: SUM(revenue) OVER () sums the five survivors, not the six-partner book — Nordic's share reads ~34.9 instead of 32, and plausibly so. The full-book denominator is a different population: stage it from an unfiltered fold (derived table CROSS JOINed on) and the shares tie to the probed 32 / 26.7 / 13.7 / 10.4 / 8.8.",
      notes: [
        { choice: 0, why: "OVER () is the query's own result set AFTER filtering — 'whole table' is the assumption the trap is built on. The population moved when the WHERE landed." },
        { choice: 2, why: "Bare OVER () is legal — it's one partition of everything in the result. Adding PARTITION BY would slice the denominator smaller, the opposite of the fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "gett-mcq-30",
      prompt: "Why is the opex census written as ONE query with FILTER arms rather than four grouped queries run separately?",
      choices: ["One query is always faster", "One query is one population and one timestamp — four separate runs are four separate population decisions that can drift apart on a moving table, and the close must reconcile", "FILTER is the only way to count a category", "Four queries cannot compute the same totals"],
      answer: 1,
      why: "The census is one claim — 36 lines, 25,416.00, 14 Rent lines, 4,570.00 Ads — and one claim deserves one scan: same rows, same moment, arms that cannot disagree. Four runs on a table that just took a posting can disagree by that posting, which is the classic month-close incident.",
      notes: [
        { choice: 0, why: "Speed is the footnote, not the argument — on 36 rows the four queries cost nothing. The correctness argument (one population, one moment) is what survives the interview and the audit." },
        { choice: 2, why: "SUM(CASE WHEN ...) counts categories too — FILTER is readability, not capability. The one-pass case rests on population integrity, not syntax exclusivity." },
      ],
      difficulty: "medium",
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
    {
      id: "cs-gett-3",
      tier: "medium",
      topic: "t7",
      universe: "funnel",
      title: "The bookings pace walk",
      brief:
        "Gett-flavored brief on the storefront db: the weekly ops pack opens with the pace walk — monthly billed revenue on the ride ledger, each month set against the one before it. Probed facts: the ledger spans 14 monthly buckets, 2024-01 (8 rides / 3,731.97) through 2025-02 (7 / 2,390.53), and the desk's gate keeps only months with at least 8 rides — 2024-01, 02, 03, 05, 07 and 09 survive. Inside the gate the walk pairs July's 1,193.86 against May's 2,910.31, because April (7 rides) fell below the floor and never entered the walk — a delta that spans two calendar steps, and the report says so. The desk reads newest-first: September's 3,116.04 with its +1,922.18 delta on top, three rows to the pack.",
      ask: "Return the gate-qualified monthly pace walk, newest month first: month, rides, revenue and the month-over-month revenue delta — top three rows.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         COUNT(*) AS rides,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n  HAVING COUNT(*) >= {1}\n)\nSELECT month,\n       rides,\n       revenue,\n       ROUND(revenue - {2}(revenue) OVER (ORDER BY month), 2) AS delta\nFROM monthly\nORDER BY month {3}\nLIMIT {4};",
      slots: [
        {
          answer: "8",
          kind: "number",
          label: "the ride-count floor",
          why: "The desk's gate is 8 rides: 2024-01, 02, 03, 05, 07 and 09 clear it, and the gate's own value rides in the surviving rows' rides column (8, 9, 8...), so the walk self-checks. A floor of 9 keeps only the two 9-ride months and amputates the walk; a floor of 5 reads every month in, gate forgotten.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the backward window function",
          why: "The walk looks BACK one row: revenue minus LAG(revenue) — September's 3,116.04 against July's 1,193.86 is +1,922.18. LEAD flips every delta's sign and moves the NULL from the walk's tail to its head — a mirror-image report the desk would read upside down.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the newest-first direction",
          why: "The pack opens on the present: ORDER BY month DESC puts 2024-09 (+1,922.18) on row one. ASC serves the walk's founding rows — 2024-01 with its NULL baseline delta — which is the tail of the story, not the headline.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the pack's row budget",
          noVerify: true,
          why: "The pack takes three rows — the newest quarter of the walk, not the whole spine. Widening to 9 floods the pack with the gate's full six-row history; the constant is a display budget, not a data fact, which is why it's flagged as unverifiable-by-cells.",
        },
      ],
      distractors: ["LEAD", "ASC", "9", "revenue", "delta"],
      walkthrough:
        "A gated walk: fold, gate, lag, trim. The CTE buckets the ledger by SUBSTR(created_at, 1, 7) — the 14-bucket month spine — folding rides (COUNT(*)) and revenue (ROUND(SUM(total), 2)) per month, then the HAVING floor at 8 keeps 2024-01 (8 / 3,731.97), 2024-02 (9 / 3,609.64), 2024-03 (8 / 2,617.08), 2024-05 (8 / 2,910.31), 2024-07 (8 / 1,193.86) and 2024-09 (9 / 3,116.04). The window column lags revenue over the month-ordered spine and prints the delta rounded once: +1,922.18 into September (3,116.04 minus July's 1,193.86), -1,716.45 into July (1,193.86 minus May's 2,910.31 — a delta that SPANS gate-skipped April), +293.23 into May (2,910.31 minus March's 2,617.08). ORDER BY month DESC + LIMIT 3 serves the pack newest-first. The distractors each fail differently: LEAD mirrors every delta and moves the NULL to the tail; ASC reads the walk from its founding NULL; a floor of 9 amputates the walk to two rows; revenue in the gate slot turns a ride floor into a money floor that reads every month in; delta in the LAG slot names a column that does not exist inside the CTE. The habit on trial: a walk's deltas are defined by its RESULT rows — gate first, then explain what the gate did to the pairing.",
    },
    {
      id: "cs-gett-4",
      tier: "easy",
      topic: "s7",
      universe: "growth",
      title: "The corporate fate pivot",
      brief:
        "Gett-flavored brief on the storefront db: the growth board's opening grid is the fate pivot — one row per region, one conditional column per ride fate. Probed cells: EU 24 completed / 12 in-trip / 6 awaiting / 3 cancelled; APAC 21/8/5/3; US 5/10/3/1; LATAM 2/0/0/0. The board's floor is three booked rides per region, which drops LATAM's two-ride sample and keeps the three regions with real volume. The census rule: every arm counts from ALL booked rides in its region — the ELSE 0 arm is what keeps each column's denominator honest — and the grid sorts by completed rides, biggest book first. Identity to defend: the four arms sum to the region's booked total (EU 24+12+6+3 = 45).",
      ask: "Return the per-region fate pivot — completed, in-trip, awaiting and cancelled rides side by side — for regions with at least three booked rides, busiest completed book on top.",
      template:
        "SELECT c.region,\n       SUM(CASE WHEN o.status = 'delivered' THEN {1} ELSE 0 END) AS completed,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS in_trip,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS awaiting,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY {2}\nHAVING COUNT(*) >= {3}\nORDER BY completed {4};",
      slots: [
        {
          answer: "1",
          kind: "number",
          label: "the completed arm's counter",
          why: "Each matching ride contributes 1: THEN 1 ELSE 0 is the conditional count — EU's 24 completed rides are 24 ones added. THEN 2 would double every completed cell (48/42/10/6) and the identity 24+12+6+3 = 45 dies on the spot.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the pivot's grain",
          why: "One row per REGION is the board's grain: GROUP BY c.region folds 103 rides into 4 zone rows. GROUP BY o.status re-grains the whole grid to the 4 status values — the columns stop being fates and the rows stop being regions.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the booked-rides floor",
          why: "The floor keeps regions with at least three booked rides — EU (45), APAC (37), US (19) — and drops LATAM's two-ride sample, whose 0.0% cancelled share is a small-N artifact, not a finding. The gate's value shows up in the surviving cells (US awaiting 3, EU cancelled 3), so the grid self-checks.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-book-first direction",
          why: "The board leads with the biggest completed book: EU 24, APAC 21, US 5. ASC would open the review on the US's five completed rides — a correct grid aimed at the wrong end of the table.",
        },
      ],
      distractors: ["COUNT", "o.status", "2", "ASC"],
      walkthrough:
        "Four arms, one grain, an identity that must hold. The pivot folds each region's rides through four conditional SUM(CASE ...) arms over ALL booked rows: delivered counts completed (EU 24, APAC 21, US 5), shipped counts in-trip (12/8/10), pending counts awaiting (6/5/3), cancelled counts cancellations (3/3/1) — and per region the arms sum to the booked total (24+12+6+3 = 45 EU, 21+8+5+3 = 37 APAC, 5+10+3+1 = 19 US). GROUP BY c.region is the grain; HAVING COUNT(*) >= 3 is a post-fold gate that drops LATAM (2 booked, 2 completed, everything else 0) — a sample too small to read; ORDER BY completed DESC lands the biggest book on top. The distractors each break differently: COUNT in the THEN arm is a bare aggregate inside a row expression — the parse dies; o.status in GROUP BY re-grains the grid from regions to statuses (52/30/14/7 rows that answer nothing on the board); a floor of 2 re-admits the LATAM two-ride sample the desk explicitly excluded; ASC reads the grid smallest-book-first. The habit on trial: a pivot is exhaustive arms over a named population — name the population, then let the identity (arms sum to booked) prove the grid.",
    },
    {
      id: "cs-gett-5",
      tier: "medium",
      topic: "x2",
      universe: "expense",
      title: "The one-pass ops cost census",
      brief:
        "Gett-flavored brief on the storefront db: month-close folds the ops cost book in ONE pass — 36 expense lines worth 25,416.00, every amount in INTEGER cents. Probed per-category cells: Rent 14 lines / 16,800.00, Ads 14 / 4,570.00, Travel 3 / 2,521.00, Tools 5 / 1,525.00. The desk's floor is 2,521.00 of spend, which keeps Rent, Ads and Travel and drops the Tools tail. The one-pass contract: total lines and spend per category, a sideways FILTER arm counting the Rent lines, and an Ads spend arm — one scan of the book, one population, one timestamp. Four separate grouped queries can drift apart between runs on a table that just took a posting; the census cannot.",
      ask: "Return one row per expense category with at least 2,521.00 of spend: lines, total spend, the Rent line count and the Ads spend folded sideways — biggest spend first.",
      template:
        "SELECT category,\n       COUNT(*) AS lines,\n       ROUND(SUM(amount_cents) / {1}, 2) AS spend,\n       COUNT(*) FILTER (WHERE category = {2}) AS rent_lines,\n       ROUND(SUM(amount_cents) FILTER (WHERE category = 'Ads') / 100.0, 2) AS ads_spend\nFROM expenses\nGROUP BY category\nHAVING SUM(amount_cents) / 100.0 >= {3}\nORDER BY {4} DESC;",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          label: "the cents-to-dollars divisor",
          noVerify: true,
          why: "The book is INTEGER cents, so the dollar read is SUM(amount_cents) / 100.0 — Rent prints 16,800.00. Divide by 1000 and the same book re-prices at a tenth (1,680.00) while still summing 'cleanly' — which is why the divisor is named in the header, not left to taste.",
        },
        {
          answer: "'Rent'",
          kind: "keyword",
          label: "the rent arm's category literal",
          why: "The sideways arm counts the hub-lease lines: FILTER (WHERE category = 'Rent') returns 14 on the Rent row and 0 elsewhere. 'Travel' would count 3 travel lines into the rent column — a census whose arms lie about what they counted.",
        },
        {
          answer: "2521",
          kind: "number",
          label: "the spend floor",
          why: "The desk's floor keeps categories with at least 2,521.00 of spend — Rent, Ads and Travel survive, Tools (1,525.00) drops. The gate's value is Travel's own spend cell, so the census self-checks; a floor of 4,570.00 would amputate Travel and re-shape the story around two rows.",
        },
        {
          answer: "spend",
          kind: "keyword",
          label: "the biggest-spend-first sort key",
          why: "The close reads money-first: ORDER BY spend DESC lands Rent (16,800.00), Ads (4,570.00), Travel (2,521.00). Sorting by category alphabetizes — Ads on top regardless of spend — a correctly computed census read in the wrong order.",
        },
      ],
      distractors: ["1000", "10", "'Travel'", "4570", "category"],
      walkthrough:
        "One scan, four arms, a floor that names itself. The census folds the expense book per category: COUNT(*) counts lines (Rent 14, Ads 14, Travel 3, Tools 5), ROUND(SUM(amount_cents) / 100.0, 2) prices each bucket (16,800.00 / 4,570.00 / 2,521.00 / 1,525.00 — 36 lines and 25,416.00 in total), and the FILTER arms count sideways in the same pass: the Rent arm returns 14 on the Rent row (0 elsewhere), the Ads arm returns 4,570.00 on the Ads row. HAVING SUM(amount_cents)/100.0 >= 2,521.00 is a post-fold gate — the floor's value IS Travel's spend cell — keeping three rows, and ORDER BY spend DESC serves them money-first. The distractors each break differently: 1000 re-prices every bucket at a tenth and still sums; 10 inflates tenfold; 'Travel' in the rent arm makes the hub-lease column count field trips; 4,570.00 amputates Travel; category as the sort key alphabetizes the census into a different story. The habit on trial: a one-pass census is one population — the arms are display choices, the single scan is the correctness claim.",
    },
    {
      id: "cs-gett-6",
      tier: "hard",
      topic: "q5",
      universe: "supplier",
      title: "The fleet-partner concentration board",
      brief:
        "Gett-flavored brief on the storefront db: the supply review opens with the fleet-partner concentration board — each partner's completed fare value and its share of the FULL 34,833.28 book. Probed cells: Nordic Gadgets AB 11,130.25 (32%), Midwest Hardware Co 9,294.93 (26.7%), Alpine Audio GmbH 4,765.63 (13.7%), Andes Naturals SA 3,613.25 (10.4%), Shenzhen Electro 3,049.07 (8.8%), Pacific Textiles 2,980.15 (8.6%). The board's floor is 3,049.07 — Shenzhen's own revenue — so Pacific's 2,980.15 drops off the board, but the share denominator stays the FULL book: shares are measured against everything, not the survivors. The staging: a derived table folds partners, a second derived table folds the book total, CROSS JOINed so the division has both grains in one row.",
      ask: "Return the concentration board for partners with at least 3,049.07 of billed value: partner, revenue, share of the full book (1dp) — biggest share first.",
      template:
        "SELECT partner_book.name AS partner,\n       partner_book.revenue,\n       ROUND({1} * partner_book.revenue / totals.book, {2}) AS share_pct\nFROM (SELECT s.name AS name,\n             ROUND(SUM(oi.unit_price * oi.quantity), 2) AS revenue\n      FROM suppliers s\n      JOIN products pr ON pr.supplier_id = s.id\n      JOIN order_items oi ON oi.product_id = pr.id\n      GROUP BY s.id) AS partner_book\nCROSS JOIN (SELECT {3}(unit_price * quantity) AS book FROM order_items) AS totals\nWHERE partner_book.revenue >= {4}\nORDER BY share_pct {5};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          label: "the percent multiplier",
          noVerify: true,
          why: "Shares print as percentages: 100.0 * 11,130.25 / 34,833.28 = 32.0 for Nordic. The .0 forces real arithmetic before the division; a 10.0 multiplier prints every share at a tenth (3.2) — a consistent board of wrong numbers, which is the worst kind.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the display rounding",
          noVerify: true,
          why: "The board prints one decimal: Midwest 26.7, Shenzhen 8.8. Rounding to 0 republishes 26.7 as 27 and 10.4 as 10 — the board still sorts the same and nobody notices the definition changed, which is exactly why the rounding edge gets stated.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the full-book fold",
          why: "The denominator is the WHOLE book: SUM(unit_price * quantity) over all 251 lines = 34,833.28. MAX would divide every partner by the single biggest line value and shares explode past 100; AVG would divide by the per-line mean — both are folds of the wrong population.",
        },
        {
          answer: "3049.07",
          kind: "number",
          label: "the board's revenue floor",
          why: "The floor is Shenzhen's own revenue: partners at 3,049.07 or above board — Nordic, Midwest, Alpine, Andes, Shenzhen — and Pacific (2,980.15) drops. The gate's value appears in the surviving rows' revenue column, so the board self-checks while the shares stay on the full book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-share-first direction",
          why: "The concentration story leads with the top: Nordic 32%, Midwest 26.7% — more than half the book in two partners. ASC would open the supply review on Shenzhen's 8.8% and bury the dependency the review exists to discuss.",
        },
      ],
      distractors: ["MAX", "AVG", "10.0", "0", "2980.15", "ASC"],
      walkthrough:
        "Two grains staged, one division, a floor that names itself. The inner derived table folds each partner's completed fare value through the product bridge — SUM(oi.unit_price * oi.quantity) per supplier: Nordic 11,130.25, Midwest 9,294.93, Alpine 4,765.63, Andes 3,613.25, Shenzhen 3,049.07, Pacific 2,980.15. The CROSS JOINed totals row folds the FULL book — SUM over all 251 lines = 34,833.28 — unfiltered, because shares are of everything; the outer SELECT divides at both grains in one row: 100.0 * 11,130.25 / 34,833.28 = 32.0, 9,294.93 = 26.7, 4,765.63 = 13.7, 3,613.25 = 10.4, 3,049.07 = 8.8 (1dp). WHERE revenue >= 3,049.07 drops Pacific — but only from the ROWS, never from the denominator, which is the whole reason the total lives in its own staged fold. ORDER BY share_pct DESC lands Nordic on top. The distractors each fail pointedly: MAX in the totals slot divides by the biggest single line value and shares explode past 100; AVG divides by the per-line mean (~139) and shares hit five digits; 10.0 rescales every share by a tenth; a 0-dp rounding republishes 26.7 as 27; a floor of 2,980.15 re-admits Pacific; ASC buries the concentration story. The habit on trial: the denominator's population is a definition — staged separately, named in the header, immune to the board's own WHERE.",
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
    { slug: "trial-to-paid-funnel", why: "Corporate trial accounts converting to contracted ground travel — the pace read that turns Gett's pipeline census into a conversion story, denominators pinned per step." },
    { slug: "cohort-retention-matrix", why: "Account-cohort x month repeat-booking grid — which signup months keep riding after the pilot ends, and which were one-contract wonders." },
    { slug: "week-over-week-churn", why: "Dropped corporate accounts as a trend line, not a single-week panic — the board that decides when the account team escalates, with honest prior-week denominators." },
    { slug: "growth-accounting", why: "New, returning and resurrected accounts per month across the 2024-01..2025-02 window — the ledger behind every 'the book is growing' claim in the QBR deck." },
    { slug: "winback-recovery", why: "Lapsed accounts that came back — and whether the discount that recovered them held beyond the first re-booking, measured at account grain." },
    { slug: "dormant-reactivation", why: "Accounts whose last booking crossed a month gap — the reactivation worklist the account managers work, ranked by time-since-last-ride." },
    { slug: "find-churn-risk-customers", why: "Fading booking cadence flagged before the contract lapses — the retention desk's risk list built from gaps, not vibes." },
    { slug: "find-loyal-customers", why: "The repeat-booker census — accounts with 2+ bookings, the loyal core behind the 63.5% concentration figure, enumerated with a HAVING gate." },
    { slug: "mrr-waterfall", why: "Billing movements on the settlement book — settled, open ($19,609.00 across 6 books) and retracted ($925.00) folded into one movement view finance can ship." },
    { slug: "gl-reconciliation", why: "The ledger referee: 181,080.00 debits tie 181,080.00 credits, delta 0 — the self-proving query pattern every month-close pack ships inside the artifact." },
    { slug: "chargeback-rate-ranking", why: "Retraction ranking on the one void ($925.00) — small on this book, but the rank query is what scales when dispute season arrives." },
    { slug: "rolling-7d-actives", why: "Trailing-7-day active accounts — the trend line ops reads instead of single-day spikes, inclusive-window self-join discipline." },
    { slug: "dau-wau-stickiness", why: "The ratio that says whether corporate riders are a habit or a rotation — daily actives over weekly actives with honest denominators." },
    { slug: "funnel-step-conversion", why: "Request-to-confirm-to-complete drop-off per step — the ground-travel funnel board, with the 7 cancelled rides living honestly in their step." },
    { slug: "median-time-to-convert", why: "Median request-to-confirmation pace — the 2.98-day average is the mean story; the median is the one travel managers actually quote." },
    { slug: "employees-with-missing-information", why: "Rider profiles missing onboarding fields — the hygiene anti-join that keeps the corporate book's employee roster queryable before any spend fold." },
  ],
};
