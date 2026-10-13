// Careem — kit 7 of the Ride-hailing & Mobility domain (Batch D, 91-d-mobility).
// The MENA super-app: rides, deliveries (Careem Food / Quik) and payments
// (Careem Pay) stacked on one captain-and-customer base. Pool provenance:
// 0 tagged LC — theme-curated. Every problem and topic slug is drawn from the
// Theme menu in scripts/company-pools.md (sql rows), picked to mirror
// Careem's known screen themes: cross-vertical order folds, captain earnings
// and acceptance rates, wallet/settlement flows in INTEGER cents, funnel and
// cohort reads, timestamp hygiene.
// Case studies run on the storefront db (db/custom.db) with probed figures
// from scripts/company-facts.md, mapped honestly: orders = service requests
// across verticals, customers = captains, products = service tiers,
// order_items = fare/fee lines, suppliers = fleet partners, shipped_at =
// request completion timestamp; invoices/payments are the settlement books
// and are INTEGER cents (divide by 100.0).
// 3x expansion (Task 92-d-careem, append-only): brief 4->6, dayInLife 4->5,
// metrics 8->12, topics 10->15, theory 8->24 (t9-t24), mcqs 10->30 (mcq-11..30,
// 3/4/3 easy/medium/hard per fresh 10), cases 2->6 (cs-cr-3..6 on t4/j5/t5/s6 —
// four topic families all new to the kit, number slots verified against
// db/custom.db), problems 16->32. All new slugs remain theme-curated sql rows
// from the Theme menu in scripts/company-pools.md.

import type { CompanyKit } from "../types";

export const careemKit: CompanyKit = {
  id: "careem",
  domainId: "mobility",
  name: "Careem",
  tagline: "MENA super-app: rides, deliveries, payments",
  accent: "text-emerald-300",

  brief: [
    "Careem is the MENA region's super-app — the Dubai-born platform that built ride-hailing across a region where cards were rare and cash was king, then stacked Careem Food, Quik deliveries and Careem Pay onto the same captain-and-customer base before selling to Uber in a deal that valued the brand at **$3.1 billion**. The operating object is a service request that could be a ride, a meal or a parcel: requested, matched to a captain, priced, {emerald:completed} or {rose:cancelled}, timestamped at every hop. Super-app reality makes one habit non-negotiable: verticals share the ledger, so every count needs its grain named — requests versus customers versus fare lines. On this kit's proxy ledger that's 103 requests, 82 carrying a completion timestamp (52 delivered-status + 30 shipped-status), and 251 fare lines fanning out underneath — *three grains, one table*.",
    "The data org runs on the settlement clock. Captains earn per service and settle through an invoicing book where every row is INTEGER cents — `SUM(amount_cents) / 100.0`, never `/100`, or the fils vanish to truncation. Careem Pay rails split into wallet-style and card-style flows (probed: 16 card settlements worth 37,364.00, 11 wire settlements worth 32,248.00), and the reconciliation culture is strict: the ledger's trial balance ties to the fils (181,080 debit = 181,080 credit, delta 0), a {rose:void-but-paid} invoice (925.00) is an incident, and a partially settled invoice (4,000.00 of 6,148.00) is a follow-up with a name on it. Analysts who can walk payments back to invoices back to captains in one query are the ones the finance partners call first.",
    "Interviews are super-app-flavored: cross-vertical, cents-precise, and grain-obsessed. A screen opens with a warm-up join (attach captains to their service requests), escalates into a conditional aggregation with a status rule ({emerald:completion} share by region, {rose:cancellation} share by vertical), then either a settlement-chain query (payments → invoices → captains), a window question (rank captains by weekly earnings, LAG the acceptance-rate drift) or a funnel read (install → first order → second vertical). Follow-ups are spoken aloud: 'is that per request or per captain?', 'does a pending request sit in your denominator?', 'what does an unmatched settlement row mean here?' — because in a super-app an unmatched row is either a bug or a business line nobody onboarded yet.",
    "Preparation strategy: this kit is **theme-curated** from the SQL band — {sky:0 tagged LC} rows exist for Careem, so the 16 problems and 30 topic slugs were hand-picked from the theme menu to mirror its screens: cross-vertical folds, captain economics, wallet math in cents, funnels and cohorts, timestamp hygiene. The two case studies run on the live storefront db: one rebuilds the {emerald:Careem Pay} settlement census finance closes the month with, the other rebuilds the captain settlement chain (payments → invoices → captains) that turns raw settlement rows into per-captain payout views. Both are mechanically audited against probed figures — 103 requests, 82 completed, 27 settlement flows, 28 invoices, and a books-tie at 181,080.",
    "The expansion goes deeper, not wider: {violet:sixteen more theory answers}, twenty more screen MCQs and four more case files covering the moves the first paragraphs only named — window frames that decide whether a running Pay balance double-counts tied days, {rose:anti-joins} that turn the 15,217.00 of settlement-less invoices into a chase list with owners, `UNION ALL` stacks that append the labelled TOTAL row, and staged CTE folds that pre-collapse the five split-payment invoices before a census reads them. The four new case files climb the module ladder — a date-bucketed latency census (t4), an anti-join receivables chase (j5), a ranked fleet-partner podium (t5) and a CASE-classified coverage census (s6) — each one mechanically audited against the probed ledger, number slots included.",
    "Preparation strategy for the full kit: rehearse in the order the topic list prints, then drill under clock. The **24 theory answers** are the spoken layer — say them out loud until the grain rule, the cents rule and the spine rule come out reflexively. The **30 MCQs** are trap rehearsal: every wrong option is a real production bug pattern (integer division, NOT IN over a NULL, RANGE-frame peers, alias visibility), so read every note even on a right answer. The **6 case files** run on the live storefront db — rebuild each query twice, once for the answer and once for the *why* of every chip you rejected. And the 32 problems are the stamina block: super-app SQL is exactly this — folds over shared ledgers with the denominator named and the fils still alive at the display edge.",
  ],

  dayInLife: [
    "**08:00 —** The day opens on the settlement board: overnight service requests versus completions by vertical, {emerald:completion} share by region, and the Careem Pay rail split — card versus wire, counts and values. First query is a reconciliation: do settlement-row sums tie to invoice totals, did any {rose:void-but-paid} row sneak in (the 925.00 ghost), is the partial (4,000.00 of 6,148.00) still moving. The morning deliverable is the rail census: one row per method, settlement count, settled value — the same fold the month-close deck quotes verbatim. When a rail's numbers drift from the processor's side, the analyst who can write the two-sided diff before the second coffee owns the incident.",
    "**11:30 —** Midday tilts to the captain side. Earnings deep-dives fold requests into per-captain views: completed services, net fares, acceptance rate with unmatched requests COALESCE'd to zero *and labeled as such*. The grain rule is out loud before the join: 103 requests are 251 fare lines once items attach, so `COUNT(DISTINCT request_id)` is the only honest request counter and COUNT(*) is the fare-line census — name which one you're quoting. A cross-vertical question lands mid-block: which captains took rides AND deliveries this period — the A-and-B-not-C shape that defines super-app stickiness — and the answer needs set logic, not vibes.",
    "**15:00 —** The afternoon is stakeholder cycles. The finance partner wants the settlement chain at captain grain: payments → invoices → captains, folded per captain, top earners on top — with the population stated (captains WITH settlement flows; the anti-join of invoices with zero payments is a separate 6-row follow-up list, not a footnote). Growth wants the funnel: install → first request → second vertical, where denominators are named at every step and the second-vertical step is the whole super-app story. Every deliverable ships with its definition beside the number, because *a settlement stat without its rail named is a rumor with decimals*.",
    "**18:30 —** The day closes in review mode. The month-close checklist runs: trial balance ties (181,080 = 181,080, delta 0), coverage classes reconciled — 21 exact, 1 partial, 6 untouched — and the follow-up list carries owners, not just numbers. The writeup goes out with the rail census attached and every rate's denominator printed beside it, because *Careem SQL exists to keep rides, food and money honest in the same query — and the books tied to the fils.*",
    "**21:15 —** The quiet shift turns incident-shaped. A regional lead pings: the {rose:settlement-drift} alarm fired on the wire rail, and the nightly two-sided diff — ledger folds versus processor folds, joined on the day key with a delta column — has to be written before the night-shift coffee goes cold. The census ties; one day's row doesn't, and the delta reads exactly 4,000.00 — *the same figure as the open partial, which is why the first reply in the incident channel asks whether the partial moved*. It didn't; the diff query goes into the runbook, the follow-up gets an owner and a due date, and the day actually ends with the books still tied at 181,080.",
  ],

  metrics: [
    { name: "Service requests completed", what: "Requests across rides, Food and Quik that reached a completion timestamp: 82 of 103 on the proxy ledger (52 delivered-status + 30 shipped-status). The super-app's core count — everything else hangs on it." },
    { name: "Completion rate", what: "Completed requests ÷ ALL requested — {rose:cancelled} (7) and {sky:pending} (14) stay in the denominator. The interviewer's first check is whether your WHERE clause shrank it." },
    { name: "Careem Pay settled value", what: "Settlement value by rail: card 16 flows worth 37,364.00, wire 11 flows worth 32,248.00 — 27 flows, 69,612.00. The rail census finance closes the month with, computed in cents and divided by 100.0 at the display edge." },
    { name: "Settlement coverage", what: "Invoices classed exact / partial / untouched: 21 exact, 1 partial (4,000.00 of 6,148.00), 6 with no payment at all (15,217.00 outstanding). The receivables picture that keeps captain payouts honest." },
    { name: "Captain acceptance rate", what: "Accepted requests ÷ offered, with unmatched captains COALESCE'd to zero and labeled. The two-sided supply health read — confirmation-rate discipline in Careem's own vocabulary." },
    { name: "Captain net fares", what: "Fare sums folded per captain at captain grain, completed services only. The earnings-equity read: the moment fare lines join, COUNT(DISTINCT request_id) is the only honest request counter (251 lines ≠ 103 requests)." },
    { name: "Cross-vertical adoption", what: "Captains (and customers) active in 2+ verticals — rides AND deliveries AND Pay. The super-app stickiness number: the A-and-B-not-C set logic the whole growth story rides on." },
    { name: "Settlement cycle time", what: "Days from invoice issue to payment on settled invoices: 28.4 average, 13 fastest, 84 slowest, against fixed 30-day terms. The cash-flow clock the Pay team watches weekly." },
    { name: "Request completion latency", what: "Days from request creation to the completion timestamp over the 82-request completed population: 2.98-day average, range 2 to 4, and by region APAC 2.93 / EU 2.94 / US 3.07 / LATAM 3.5. The delivery-side SLA clock — and the first metric to rot if pending rows sneak into the fold." },
    { name: "Monthly run-rate band", what: "Requests and value per month across the 2024-01 to 2025-02 span: the order count never leaves the 6-to-9 band, opening at 8 requests / 3,731.97 in 2024-01 and closing at 7 / 2,390.53 in 2025-02. Seasonality claims start at this table, and every month-over-month quote names its bucket function." },
    { name: "Fleet-partner concentration", what: "Revenue share by fleet partner: Nordic Gadgets AB moves 32% of the book (11,130.25) and Midwest Hardware Co another 26.7% (9,294.93) — more than half of all revenue rides on two partners, with Alpine Audio GmbH third at 13.7%. The supply-diversification read the commercial team watches quarterly." },
    { name: "Books-tie delta", what: "The close gate: 181,080 debits versus 181,080 credits, delta 0 — necessary, never sufficient. Row-level classes still get chased by name: 1 void-but-paid (925.00), 1 paid-with-no-flows (1,756.00), 5 split-payment invoices and 1 partial (4,000.00 of 6,148.00)." },
  ],

  topics: [
    {
      name: "Request-grain aggregation",
      why: "The super-app folds requests into per-vertical, per-region, per-city counts without letting the fare-line join change the grain: 103 requests become 251 fare lines the moment items attach. COUNT(*) versus COUNT(DISTINCT request_id) is the difference between a request census and a line-item census.",
      slugs: ["product-sales-analysis-ii", "unique-orders-and-customers-per-month", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Captain earnings folds",
      why: "Captain economics is Careem's supply story: top earners by completed fares, most services delivered, most requests taken. Every fold is at captain grain with the completed-only population stated — gross volume flatters, completed work pays.",
      slugs: ["top-earners", "find-top-performing-driver", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Cross-vertical delivery SLAs",
      why: "Careem Food and Quik live on delivery-speed rules: which requests met the status rule on day one, which were kept, which slipped. The immediate-food-delivery series is exactly the kept-share and status-drift shape the delivery side charts daily.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "immediate-food-delivery-iii"],
    },
    {
      name: "Wallet & rails math (INTEGER cents)",
      why: "Careem Pay books are INTEGER cents: 27 settlement flows split card 16 / wire 11, values 37,364.00 and 32,248.00. The discipline is SUM-then-divide-by-100.0 at the display edge — and never integer division, which truncates fils into silence.",
      slugs: ["bank-account-summary-ii", "account-balance", "monthly-transactions-i"],
    },
    {
      name: "Acceptance & confirmation rates",
      why: "Acceptance rate is offered → accepted with unmatched captains COALESCE'd to zero and labeled; confirmation rate is the same shape one hop later. The 100.0-before-division habit and the stated denominator are the whole test.",
      slugs: ["confirmation-rate", "second-day-confirmation", "queries-quality-and-percentage"],
    },
    {
      name: "Captain–customer symmetry (joins)",
      why: "Captains are customers too — how often supply-side people appear on the demand side is a LEFT JOIN census. Combine-two-tables is the warm-up, trips-and-users the canonical two-sided screen, driver-was-passenger the symmetry read.",
      slugs: ["number-of-times-a-driver-was-a-passenger", "trips-and-users", "combine-two-tables"],
    },
    {
      name: "Super-app funnel",
      why: "The growth story is the second vertical: install → first request → first Food order → Pay activated. Funnel-step-conversion drills the stage ratios, and two-purchases-within-seven-days is the repeat-behavior gate that defines an activated user.",
      slugs: ["funnel-step-conversion", "email-engagement-funnel", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Cohorts & retention",
      why: "Super-app retention is cohort-shaped: which install month kept ordering, DAU/WAU stickiness across verticals, day-4 return gates. Cohort-retention-matrix and game-play-analysis-iv are the canonical return-on-day-N drills.",
      slugs: ["cohort-retention-matrix", "dau-wau-stickiness", "game-play-analysis-iv"],
    },
    {
      name: "Timestamp hygiene: dedupe & NULL policy",
      why: "Completion timestamps are NULL until the request ends (21 of 103 rows here) and event streams retry. Keep-latest dedupe with a deterministic tie-break plus a stated NULL policy — report, coalesce, or exclude with a reason — is the layer every dashboard stands on.",
      slugs: ["keep-latest-dedupe", "null-blank-audit", "the-latest-login-in-2020"],
    },
    {
      name: "Set ops & CASE escalation",
      why: "Screens close with composition: UNION stacks that build a bucketed report in one query, CASE branches that classify coverage (exact / partial / untouched), set ops that stitch verticals into one view. Two grains in one query, no panic.",
      slugs: ["count-salary-categories", "weather-type-in-each-country", "team-scores-in-football-tournament"],
    },
    {
      name: "Window frames & running balances",
      why: "Careem Pay's daily view and the payout leaderboard both live on ordered windows: running settled balances by day, trailing-week earnings per captain, share-of-partition reads. The frame is the whole test — the default RANGE frame rides with ordering peers, so three days tied at the same daily total make the first tied day's cell jump by 3x until you write ROWS explicitly.",
      slugs: ["find-cumulative-salary-of-an-employee", "running-total-for-different-genders", "restaurant-growth"],
    },
    {
      name: "Anti-joins & chase lists",
      why: "Every receivables follow-up is an anti-join: 6 invoices carry no settlement flow at all (15,217.00 outstanding), and the chase list is LEFT JOIN + IS NULL, not a hunch. The trap that makes the drill worth it: NOT IN over a subquery that returns one NULL empties the whole list — and on this ledger the orders-side anti-join returns 0 (every customer ordered), so receivables is where the shape actually bites.",
      slugs: ["sellers-with-no-sales", "customers-who-never-order", "find-churn-risk-customers"],
    },
    {
      name: "Reporting stacks & period composition",
      why: "The month-close deck is composed, not grouped: card row, wire row, then a labelled TOTAL row stacked with UNION ALL — and period splits that read one way per branch. League-statistics and monthly-transactions-ii drill the two-orientation fold; the airport exercise is the busiest-node argmax that picks the week's top vertical.",
      slugs: ["monthly-transactions-ii", "league-statistics", "the-airport-with-the-most-flights"],
    },
    {
      name: "Derived tables & staged folds",
      why: "Split payments (five invoices here carry two settlement rows) break naive folds — summing invoice cents across a fan-out double-counts every split invoice. The fix is staging: fold payments per invoice in a derived table or CTE first, THEN classify and group. Second-highest-salary and market-analysis-i drill exactly the stage-then-compare shape.",
      slugs: ["second-highest-salary", "managers-with-at-least-5-direct-reports", "market-analysis-i"],
    },
    {
      name: "LAG & LEAD: drift and gaps",
      why: "Acceptance-rate drift, status transitions between consecutive requests, and dead-air gaps between a captain's services are all LAG/LEAD reads: the previous row brought INTO the current row. Week-over-week churn is the retention twin — same function, business question flipped from supply to demand.",
      slugs: ["biggest-window-between-events", "consecutive-transactions-with-increasing-amounts", "week-over-week-churn"],
    },
  ],

  theory: [
    {
      id: "careem-t1",
      q: "A settlement read chains payments → invoices → captains. Where do INNER and LEFT JOIN each belong in that chain, and what does the wrong choice silently drop?",
      a: "The chain follows the money, and each hop has its own population. Payments → invoices is INNER by nature: every settlement row references its invoice, and an INNER join loses nothing because the foreign key is NOT NULL. Invoices → captains is where the decision lives: for a payout view, INNER is right because a captain with no invoice has no payout to show; for a receivables-risk view, the spine is invoices and a LEFT JOIN is mandatory — INNER would drop exactly the invoices with no captain-side resolution you're hunting for. The super-app discipline is naming the spine per question: 'this query is captain-spine, that one is invoice-spine' — and knowing that on a healthy ledger the two agree, which is precisely why the interviewer makes you reason it instead of trusting the data. On the proxy ledger the chain is clean (27 payments, 28 invoices), but the 6 unpaid invoices and the {rose:void-but-paid} row are the reason the LEFT JOIN reflex exists.",
      tag: "joins",
    },
    {
      id: "careem-t2",
      q: "Rank captains by weekly net earnings for the payout leaderboard. Where do RANK, DENSE_RANK and ROW_NUMBER disagree — and which do you hand finance?",
      a: "They disagree exactly where earnings tie. RANK gives both tied captains the same rung and skips the next (1, 2, 2, 4) — the gap implies a missing captain who doesn't exist. DENSE_RANK shares the rung and stays compact (1, 2, 2, 3). ROW_NUMBER splits the tie arbitrarily unless you add a deterministic tie-break like captain_id — which makes it the dedupe tool, not the leaderboard tool. Finance gets DENSE_RANK on ties and an explicit tie-break column (ROUND(sum,2) DESC, captain_id ASC) so the rungs are reproducible Monday-to-Monday; payouts themselves are decided by the VALUE, never by the rung — two captains at the same earnings are paid the same, whatever the window says. The screen-level tell: candidates who reach for LIMIT n with a tie in the data silently drop a captain from a leaderboard that name-checks people. At Careem's grain that's not a rounding error, it's a payroll incident.",
      tag: "windows",
    },
    {
      id: "careem-t3",
      q: "One ledger — 103 service requests, 251 fare lines, 16 captains. Narrate what COUNT(*), COUNT(DISTINCT request_id) and COUNT(completion_ts) each measure after the fare-line join.",
      a: "After the join, the row grain is fare lines — 251 of them — so COUNT(*) is the line-item census, not the request census. COUNT(DISTINCT request_id) folds back to requests: 103. COUNT(completion_ts) is the completed subset of those 103 — 82, because COUNT skips NULLs and the 14 pending plus 7 cancelled never grew a completion timestamp. The super-app trap is quoting one grain under another's name: 'average fare lines per request' (251/103 ≈ 2.4) is a real basket-depth read, but 'completion rate' computed as COUNT(completion_ts)/COUNT(*) after the join divides by 251 and ships a rate that can never reach 100% even on a perfect day. The strong answer assigns a grain to each form out loud — line rows, distinct requests, non-null completions — and picks the denominator before writing SQL. That three-grain fluency (requests, lines, completions) is the single most-drilled reflex in this kit.",
      tag: "aggregation",
    },
    {
      id: "careem-t4",
      q: "Acceptance-rate reporting COALESCEs unmatched captains to zero. When is that the right NULL policy, and when does it lie?",
      a: "COALESCE to zero is right when the NULL means 'measured and absent': the captain was offered requests and accepted none — acceptance count is genuinely zero, and surfacing it as 0 (not NULL) keeps the leaderboard complete and the coaching list honest. It lies when the NULL means 'never measured': a captain onboarded yesterday with no offers yet has no acceptance RATE at all — folding them to 0% mixes 'bad acceptance' with 'no data' and drags the fleet average down for a data reason, not a behavior reason. The policy that survives review: distinguish the two populations explicitly — active captains get COALESCE(accepted, 0), not-yet-offered captains get excluded with the exclusion stated, and the report prints both counts. The same discipline covers completion timestamps (NULL until the request ends — out of scope, not zero latency) and settlement amounts (NULL means no payment row, not a zero-value payment). At Careem the phrase that lands is: *NULL is a population statement — say which population you chose, then choose it on purpose.*",
      tag: "nulls",
    },
    {
      id: "careem-t5",
      q: "A junior filters WHERE status != 'cancelled' and then reports completion share by vertical. What did pipeline order do to the denominator, and where do status rules belong instead?",
      a: "Logical pipeline order is FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT, and WHERE runs before aggregation — so the cancelled rows left the fold before the share was computed, and the denominator shrank to delivered + shipped + pending. The share reads high everywhere, and pending requests — the ones most likely to still cancel — pollute what's left of the denominator. The fix is structural: no status filter in WHERE at all; the status rule rides INSIDE the aggregation as a CASE or FILTER arm — 100.0 * SUM(CASE WHEN status IN ('delivered','shipped') THEN 1 ELSE 0 END) / COUNT(*) — so the numerator and denominator fold over the same rows. The rule of thumb that survives any screen: WHERE is for rows every metric agrees on (dates, regions); status fates belong inside the fold, because two metrics sharing one GROUP BY must share one population. On the proxy ledger the tell is instant — a completion-share table where no vertical shows the real 21-unfulfilled-row gap is a pipeline-order bug, not a good week.",
      tag: "pipeline",
    },
    {
      id: "careem-t6",
      q: "Growth asks for 'captains whose completed request count beats the fleet average'. Scalar subquery, derived table, or window — and why?",
      a: "All three can answer it; they differ in shape and cost. The scalar subquery — WHERE completed > (SELECT AVG(completed) FROM per-captain-fold) — is the cleanest when the threshold is ONE number and the inner fold is a derived table or CTE, not a bare correlated re-aggregation per row. The derived-table/CTE shape wins when you need the compared value as a column beside each captain (captain, completed, fleet_avg, delta) — compute the average once in a CTE, CROSS JOIN it onto the fold, no re-execution per row. The window shape — AVG(completed) OVER () — computes the same grand average in one pass and keeps every row, which makes it the best default when the read is already a fold. The anti-pattern is the correlated scalar that re-aggregates the whole fleet per captain — O(n²) in interview, a production incident at scale. The Careem-flavored close: name the population in the CTE (completed requests only — 82 of 103), because a fleet average computed over gross volume bakes the 21 unfulfilled requests into every captain's bar.",
      tag: "subqueries",
    },
    {
      id: "careem-t7",
      q: "Your settlement ledger spans 2024-01 to 2025-02 with text timestamps. How do you bucket settlements by month and measure days-to-pay without quietly breaking?",
      a: "Two different operations, two different functions. Bucketing: SUBSTR(issued_on, 1, 7) for the quick group or STRFTIME('%Y-%m', issued_on) when the intent should be legible — fourteen buckets across the span, one per month, and the anchored timestamp (issued vs paid) is a business decision you state, not inherit. Duration: JULIANDAY(paid_on) - JULIANDAY(issued_on) converts both texts to fractional days per row, THEN aggregate — the probed result is 28.4 days average on settled invoices, fastest 13, slowest 84, against fixed 30-day terms, which means the slow tail (84) is nearly three terms deep and worth a named follow-up. The traps: DATEDIFF doesn't exist in SQLite; averaging the text timestamps averages strings; and STRFTIME('%Y') collapses fourteen months into two years and flattens the trend the deck needs. The strong answer names the function per operation, rounds at the display edge with ROUND(x, 2), and keeps the cents book INTEGER until that edge — /100.0 once, never /100.",
      tag: "dates",
    },
    {
      id: "careem-t8",
      q: "Finance says the books tie — 181,080 debit equals 181,080 credit — yet a captain disputes a payout. What reconciliation queries do you run before anyone calls the captain back?",
      a: "Row-level reconciliation, not the global tie — the trial balance proves nothing about a single captain. First, the settlement chain for that captain: payments → invoices → requests, joined end to end, listing every row with its status — the dispute usually dies right there (a payment attached to a different invoice than the captain remembers). Second, the known anomaly classes: {rose:void-but-paid} rows (invoice voided but a payment landed — invoice #11, 925.00 on the proxy ledger), paid-with-no-payment-rows (status paid, zero settlement rows — #28, 1,756.00), and partials (4,000.00 of 6,148.00) — each class is a query, and each is a different phone call. Third, the coverage census: exact 21 / partial 1 / untouched 6, so the dispute lands in a bucket with an owner. The Careem-flavored close: the global tie (181,080 = 181,080, delta 0) is a necessary condition, never a sufficient one — money can be in the wrong captain's column and the books still balance. Reconciliation is a row-level sport.",
      tag: "quality",
    },
    {
      id: "careem-t9",
      q: "The Pay team wants a running settled balance by day. When does the default window frame lie to you, and what do you write instead?",
      a: "With ORDER BY inside OVER, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes ordering peers. Three days tied at the same daily total make the first tied day's cell jump by three times the daily amount: the balance walk double-counts ties it never announced. The fix is to write the frame out loud — ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW counts rows, not peers — and to know which one you're shipping, because finance quotes the cell, not the intent. The deeper habit: any running-total question over money gets an explicit frame and a tie-test (feed it a day with a duplicated total and check the cell). On a settlement ledger, ties at daily grain are normal, not exotic — the frame choice is the difference between a balance and a rumor.",
      tag: "windows",
    },
    {
      id: "careem-t10",
      q: "Build the chase list: invoices with no settlement flow. NOT IN, LEFT JOIN … IS NULL, or NOT EXISTS — and which shape can silently return nothing?",
      a: "LEFT JOIN … IS NULL is the form this team ships: it keeps the invoice spine visible, reads as exactly what it means, and degrades loudly. NOT EXISTS is equally safe and often cheaper at scale — the engine can short-circuit on the first match. NOT IN is the trap: one NULL in the subquery's key column makes every comparison UNKNOWN and the whole list vanishes — an empty receivables report that looks like good news. The proxy ledger makes the stakes concrete: 6 invoices with no flow, 15,217.00 outstanding, and the orders-side anti-join returns 0 (every customer ordered at least once) — so the anti-join reflex has to live where the emptiness is real: receivables, not demand. Name the shape, name the NULL policy, ship the list with owners.",
      tag: "joins",
    },
    {
      id: "careem-t11",
      q: "Where do UNION, UNION ALL and EXCEPT each belong in the super-app's monthly reporting?",
      a: "UNION ALL is the deck's workhorse: card row, wire row, then a literal 'TOTAL' row — three folds stacked, no dedupe pass, and no chance two branches silently merge. UNION pays a full distinct across the stack; reserve it for when duplication is the actual bug. EXCEPT and INTERSECT are the set-logic layer: the cross-vertical adoption read — active in rides AND deliveries but NOT on the Pay rail — is (rides INTERSECT deliveries) EXCEPT pay, composed left to right like the sentence. The discipline that survives review: every branch of a stack carries the same column contract (count, value, label), and every set op gets read aloud as a population statement — 'this set minus that set' — because set ops are the one part of SQL where the English and the engine agree completely.",
      tag: "sets",
    },
    {
      id: "careem-t12",
      q: "Five invoices on this book settle in two payment rows. What breaks if you fold coverage directly over the join, and how do you stage it?",
      a: "The join fans each split invoice to two rows, and SUM folds rows, not invoices: the naive exact-bucket sum reads 65,612.00 plus 24,940.00 of phantom value — every split invoice counted once per payment row. The fix is staging: a derived table or CTE that folds payments per invoice first (GROUP BY i.id, SUM(p.amount_cents)), so each invoice is exactly one row with its full paid total — THEN classify with a CASE and fold the classes. Counts want COUNT(DISTINCT i.id) for the same reason. This is the general super-app reflex: 103 requests are 251 fare lines once lines attach — fold to the business grain in a stage, aggregate the stage, and never let a join's fan-out choose your numerator.",
      tag: "ctes",
    },
    {
      id: "careem-t13",
      q: "Beyond SUM-then-divide: where else do fils die in a cents-denominated ledger?",
      a: "Four quiet places. Per-row division — amount_cents/100 inside the SELECT — truncates before the fold, and sixteen small losses compound into a rail that reconciles with nothing. Integer division anywhere in the expression tree: /100 truncates, /100.0 doesn't, and the bug only shows on totals that aren't round hundreds. Casting to INTEGER mid-pipeline — a CAST 'to clean up the type' throws away the fractional fils permanently. And per-row ROUND before SUM: rounding is lossy, and summing lossy values drifts from the true fold by the cents you rounded away. The invariant that survives audit: money stays INTEGER until the display edge, converts once with /100.0, rounds once with ROUND(x, 2) — every downstream consumer sees the same number because there is exactly one place where the shape changes.",
      tag: "types",
    },
    {
      id: "careem-t14",
      q: "A junior adds WHERE outstanding > 0 to the coverage census and gets an error. Explain what happened, and place every filter in this query correctly.",
      a: "Two pipeline facts collide. First, WHERE runs before SELECT, so the alias 'outstanding' doesn't exist yet — that's the error. Second, even the underlying expression SUM(i.amount_cents) can't ride in WHERE, because WHERE runs before GROUP BY: aggregates don't exist until after the fold. The placement rules: row-level filters that every metric agrees on go in WHERE (dates, regions, the IS NOT NULL population guard); filters on folded values go in HAVING (HAVING COUNT(*) >= 1 keeps classes that exist); display-only shaping goes in SELECT; and ordering goes in ORDER BY, the one stage where aliases are visible. The census framing makes it concrete: the population guard (no settlement rows vs some) is a WHERE/ON decision made before the fold; the 'keep non-empty classes' decision is HAVING after it. Mixing the two stages is how a filter quietly edits a denominator.",
      tag: "pipeline",
    },
    {
      id: "careem-t15",
      q: "The ledger spans 2024-01 to 2025-02. What does bucketing by '%Y-%m' survive that '%Y' doesn't — and what does a week bucket need that a month bucket doesn't?",
      a: "'%Y-%m' survives the year boundary because the label is lexicographic time: '2024-12' sorts before '2025-01', the fourteen buckets stay ordered, and the trend reads straight through December into January. '%Y' collapses the whole span into two buckets — the 2024 trend flattens into one cell and the deck loses the story. Weeks are harder: '%Y-%W' has no year boundary built into the label either, but weeks STRADDLE months and years, so the anchoring decision (which day a week starts, whether week 1 is partial) becomes a business definition you state, not inherit. The habits: bucket labels that sort like time, an anchor named per grain, and a boundary test — run the bucket function across Dec 31 to Jan 1 on this ledger and check the two cells don't merge. On a 14-month span that test is free; in production it's the difference between a trend and soup.",
      tag: "dates",
    },
    {
      id: "careem-t16",
      q: "Define completion rate for me — and tell me what your version deliberately keeps in the denominator.",
      a: "Completed requests over ALL requested: 82 of 103, 79.6% — with the 14 pending and the 7 cancelled staying in the denominator on purpose. Pending is stuck work the ops floor is actively pushing; excluding it hides the queue. Cancelled is the failure the metric exists to surface; excluding it flatters the number by exactly the amount of the problem. The two common 'better' numbers are both denominator edits: counting pending as future-completed (92%) is forecasting wearing a census costume, and excluding only cancelled moves the rate seven points without moving the business. The contract that survives review: the definition is written beside every rate — population, window, anchor — and per-vertical versions (rides vs Food vs Quik) only ever differ in the population line, never in the arithmetic.",
      tag: "kpi",
    },
    {
      id: "careem-t17",
      q: "Find captains with at least one void-but-paid invoice. IN, EXISTS, or a JOIN — and what does each shape cost you?",
      a: "EXISTS is the safe default: it short-circuits on the first matching row and reads as the question ('at least one'). IN is fine at this scale but inherits the NULL trap the moment the inner key is nullable — one NULL and the list empties. A join plus DISTINCT works but computes every match before deduplicating, and forgetting the DISTINCT manufactures duplicate captains. The probed ledger keeps the answer honest: the void-but-paid class is exactly one invoice (#11, 925.00) — so the query I ship also proves uniqueness, because the follow-up differs wildly between 'one row to void' and 'a pattern'. The interview-level point: the shape follows the population question — 'at least one' wants EXISTS, 'all of them' wants relational division, and 'which ones' wants the join with the dedupe stated.",
      tag: "subqueries",
    },
    {
      id: "careem-t18",
      q: "The deck wants requested, completed, cancelled and pending per region in one read. What's the shape, and why does it beat four queries?",
      a: "One GROUP BY region with conditional arms — SUM(CASE WHEN status = … THEN 1 ELSE 0 END), or its COUNT(*) FILTER (WHERE …) spelling — folds all four counters over the same rows in one pass. The guarantee is structural: 103 requested splits into 82 + 7 + 14 inside each region row, and the columns reconcile to their own row total by construction. Four separate queries mean four scans, four WHERE clauses and four chances for a next-quarter edit to move one counter's population — the drift the census exists to make impossible. The regional read lands the point: APAC 37 split delivered 21 / shipped 8 / pending 5 / cancelled 3 — one row, four arms, zero ambiguity about who was counted where. Arms share a fold; populations never ride on separate queries.",
      tag: "aggregation",
    },
    {
      id: "careem-t19",
      q: "Ops wants status transitions: of the requests that sat pending, how many completed versus cancelled? What's the query shape on an event-per-row log?",
      a: "Stage a LAG: partition by the entity (request or captain), order by time WITH a deterministic tie-break (created_at, then id — timestamps tie more than anyone admits), and carry the previous status into the current row. Fold the transition pairs — prev to curr — and count: pending to completed and pending to cancelled fall out as rows, with every other transition as context. The traps are all ordering: without the tie-break, the same query returns different pairs across runs; without the partition, a captain's first request reads a stranger's status as its 'previous'; and the first row of every partition has no previous — LAG returns NULL, which the transition fold must treat as 'entered at' rather than a real transition. On the proxy ledger the pending bucket is 14 rows and the transition read is exactly the drill that says whether they completed or died — the ops question, one window function deep.",
      tag: "windows",
    },
    {
      id: "careem-t20",
      q: "The partial invoice reads 4,000.00 settled of 6,148.00. Where does COALESCE belong in settlement views — and where does it launder a data bug?",
      a: "COALESCE belongs at the display edge, converting a population fact into a readable default: untouched invoices (no settlement rows, paid_cents IS NULL) render as 0.00 settled — honest, because 'no money moved' and 'zero settled' agree in currency. It launders a bug when it merges populations that behave differently: COALESCE(paid_cents, 0) before a CASE means a genuinely-zero settlement and a missing settlement become indistinguishable — one is a value fact worth a fraud look, the other is an AR phone call. The policy this kit ships: keep the NULL through the fold, classify with the IS NULL arm (the untouched class survives as its own bucket — 6 of them, 15,217.00), and COALESCE only in the display column, beside a class label that still says which world the row came from. NULL is a population statement; COALESCE is a presentation act. Never let the second rewrite the first.",
      tag: "nulls",
    },
    {
      id: "careem-t21",
      q: "The settlement-chain query is instant on this 16-captain ledger and slow on production volumes. What do you reach for first?",
      a: "Sargability, indexes, then the plan. Sargable filters: no function wrapped around the filtered column (SUBSTR(created_at,1,7) = '2025-01' kills the index; created_at >= '2025-01-01' AND created_at < '2025-02-01' keeps it). Indexes that match the join-and-fold shape: payments(invoice_id) for the settlement chain, orders(customer_id, created_at) for per-captain timelines. Then the plan: a correlated scalar that re-aggregates the whole fleet per row is O(n-squared) and shows up as repeated full scans — stage it in a CTE instead and aggregate once. The honest caveat belongs in the answer: at 16 captains everything is instant, so this screen is testing INSTINCT, not measurement — name the shape you'd never ship (correlated re-aggregation), the column you'd index first (the join key), and the number you'd check before and after (rows scanned). Instinct at small scale is what keeps the production query from being written at all.",
      tag: "performance",
    },
    {
      id: "careem-t22",
      q: "Two completion events land for the same request with identical timestamps. How does keep-latest survive that — and what do you print before you dedupe?",
      a: "The tie-break must make the order total: ROW_NUMBER() OVER (PARTITION BY request_id ORDER BY event_ts DESC, event_id DESC) — the id is the umpire when time ties. Without it, 'latest' is whatever the plan served that day, and the same dedupe returns different rows across runs, which poisons every downstream metric quietly. Before deduping, print the tie pairs: how many requests even have competing events, and are the competing rows identical or meaningfully different (a retry with the same payload vs a correction with a new amount)? The audit-trail habit is what reviewers actually grade: dedupe decisions are population edits, so the query ships with the tie census beside it — '47 retries, all identical; 2 corrections, kept the higher event_id'. On this ledger the completion timestamp is the anchor (shipped_at non-NULL on exactly the 82 finished requests); the same discipline extends to any keep-latest fold that a dashboard will stand on.",
      tag: "quality",
    },
    {
      id: "careem-t23",
      q: "Flag suspected duplicate charges: same invoice, two flows, same day. Why does the self-join carry an a.id < b.id guard, and what does each alternative return?",
      a: "The guard canonicalizes the pair. a.id < b.id means each unordered pair appears exactly once, in exactly one orientation, and no row can pair with itself — one suspect pair per two-row invoice, which is the unit ops actually phones about. Drop the guard to a.id <> b.id and every pair returns twice (both orientations) — the chase list doubles and the same captain gets two calls. Drop it to b.id = a.id and nothing returns — a row can't be its own pair under an inequality. And replacing the key equality with a looser one (same amount, any invoice) matches coincidences across different invoices: a different bug wearing the same flag. On this book the splits are legitimate (five invoices settled in two rows by design), so the query's real job is enumerating them deterministically — the duplicate-charge shape, pointed at a pattern you can name. Canonical pairs are a data-modeling decision: make it once, in the join, with an inequality.",
      tag: "joins",
    },
    {
      id: "careem-t24",
      q: "Walk me through the three queries you'd ship for month-close on this books model.",
      a: "Query one is the rail census: GROUP BY method over the 27 settlement flows — card 16 / 37,364.00, wire 11 / 32,248.00 — SUM in cents, one /100.0 at the display edge, ROUND to 2, best rail first. Query two is the coverage census, staged: fold payments per invoice in a derived table (the five splits must collapse first), classify with a CASE (IS NULL becomes untouched, equal becomes exact, else partial), and fold the classes — exact 21 / 65,612.00, untouched 6 / 15,217.00, partial 1 / 6,148.00. Query three is the anomaly list with names: #11 void-but-paid (925.00), #28 paid-with-no-flows (1,756.00), #25 partial (4,000.00 of 6,148.00) — each row an owner, not a footnote. Then the gate: the trial balance ties, 181,080 = 181,080, delta 0 — necessary, never sufficient, because money can sit in the wrong captain's column while the books balance. Three queries, one deck, every number with its population printed beside it — that's the whole close.",
      tag: "workflow",
    },
  ],

  mcqs: [
    {
      id: "careem-mcq-1",
      prompt: "After joining fare lines to service requests (103 requests, 251 fare lines, 82 completed requests), which expression counts COMPLETED REQUESTS?",
      choices: ["COUNT(*) — the join doesn't change row counts", "COUNT(DISTINCT CASE WHEN status IN ('delivered','shipped') THEN request_id END)", "COUNT(status) — COUNT skips NULLs", "SUM(request_id) folded per captain"],
      answer: 1,
      why: "The join fans 103 requests out to 251 lines, so the count must fold back to request grain: COUNT(DISTINCT CASE WHEN completed THEN request_id END) counts each completed request once no matter how many fare lines it spawned — 82 on the proxy ledger. Grain naming IS the super-app's first interview question.",
      notes: [
        { choice: 0, why: "COUNT(*) after the join is 251 — a fare-line census wearing a request-shaped name. The fan-out is the bug, not the syntax." },
        { choice: 2, why: "COUNT(status) counts non-null status values — every line has a status, so it's 251 again. DISTINCT on the request id, not the status, is the fold." },
      ],
      difficulty: "easy",
    },
    {
      id: "careem-mcq-2",
      prompt: "The Careem Pay ledger stores settlement amounts as INTEGER cents. Which expression reports the card rail's settled value correctly (16 flows, total 3,736,400 cents)?",
      choices: [
        "SUM(amount_cents)/100",
        "ROUND(SUM(amount_cents)/100.0, 2)",
        "CAST(SUM(amount_cents) AS TEXT) || '00'",
        "AVG(amount_cents)*16",
      ],
      answer: 1,
      why: "SUM first, then divide by 100.0 at the display edge: 3,736,400 / 100.0 = 37,364.00. INTEGER/INTEGER division truncates, so /100 would only survive here because the total happens to be a round hundred — the next settlement breaks it. The .0 is the discipline; ROUND(x,2) is the presentation.",
      notes: [
        { choice: 0, why: "Works this month, truncates the next: 12,345/100 = 123 in SQLite integer division. The fils die quietly — the worst kind of settlement bug." },
        { choice: 2, why: "Text concatenation isn't currency — it's a label that won't sum, sort numerically, or survive the month-close deck. Money stays numeric." },
      ],
      difficulty: "easy",
    },
    {
      id: "careem-mcq-3",
      prompt: "Captain acceptance rate = accepted ÷ offered, and some captains have offers but zero accepts. Which shape reports them honestly?",
      choices: [
        "INNER JOIN offers to accepts, then divide — zero-accept captains vanish, which is fine",
        "LEFT JOIN from offers, 100.0 * SUM(accepted_flag)/COUNT(*) per captain, zero-accept captains read 0%",
        "WHERE accepted IS NOT NULL — only measured behavior counts",
        "COUNT(accepts)/COUNT(DISTINCT captain) at fleet grain",
      ],
      answer: 1,
      why: "The offers side is the spine: LEFT JOIN keeps every captain who was offered work, the CASE/SUM flag folds accepts at the same grain as COUNT(*), and a captain with zero accepts reads 0% — a coaching list, not a data hole. The 100.0 forces real division before the per-captain fold.",
      notes: [
        { choice: 0, why: "INNER silently amputates exactly the captains ops most needs to see — the zero-accept tail. 'Vanished from the report' reads as 'no problem' to the dashboard." },
        { choice: 2, why: "Filtering to accepted rows makes every surviving captain's rate 100%. That's the WHERE-shrinks-the-denominator bug in its purest form." },
      ],
      difficulty: "medium",
    },
    {
      id: "careem-mcq-4",
      prompt: "Month-close classifies every invoice as exact / partial / untouched by comparing settled cents to invoice cents. Which one-pass shape does it?",
      choices: [
        "Three separate queries for the three classes",
        "GROUP BY invoice with CASE WHEN SUM(p.amount_cents) = i.amount_cents THEN 'exact' WHEN ... > 0 THEN 'partial' ELSE 'untouched' END",
        "HAVING SUM(p.amount_cents) = i.amount_cents only",
        "A correlated subquery per invoice per class",
      ],
      answer: 1,
      why: "LEFT JOIN payments to invoices, fold SUM(amount_cents) per invoice (NULL → untouched via the ELSE arm), and let one CASE classify: exact 21, partial 1 (4,000.00 of 6,148.00), untouched 6 on the probed ledger. One scan, three classes, and the partial's shortfall falls out of the same query.",
      notes: [
        { choice: 0, why: "Three scans, three definitions to keep in sync, and the classes can silently overlap or gap when someone edits one query. The one-pass CASE is the auditable shape." },
        { choice: 2, why: "HAVING only keeps the exact class — the partial and untouched invoices vanish from the receivables view, which is precisely the 6 + 1 rows finance needs to chase." },
      ],
      difficulty: "medium",
    },
    {
      id: "careem-mcq-5",
      prompt: "The rail census groups payments by method and sorts by settled value. Why does ORDER BY settled_value work when settled_value is a SELECT alias?",
      choices: [
        "It doesn't — ORDER BY requires the raw column name",
        "ORDER BY runs after SELECT in the logical pipeline, so output aliases are visible there (but not in WHERE/HAVING)",
        "Aliases are visible everywhere in the query",
        "SQLite rewrites it into GROUP BY automatically",
      ],
      answer: 1,
      why: "Logical pipeline: FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. ORDER BY evaluates after SELECT, so the alias resolved and rounded there is fair game — while WHERE and HAVING run before SELECT and can't see it. That's why the census can sort by ROUND(SUM(...)/100.0, 2) under its friendly name.",
      notes: [
        { choice: 0, why: "Standard SQL allows output aliases in ORDER BY and SQLite does too — refusing it costs you the rounded, named sort the deck actually quotes." },
        { choice: 2, why: "Aliases in WHERE/HAVING are the classic error ('invalid column name') — pipeline order is exactly why the same alias works in one clause and not the other." },
      ],
      difficulty: "medium",
    },
    {
      id: "careem-mcq-6",
      prompt: "The captain settlement chain: payments p → invoices i → customers c. Which join keys make it a clean 3-table chain?",
      choices: [
        "p.invoice_id = i.id AND c.id = i.customer_id",
        "p.id = i.id AND c.id = p.customer_id",
        "p.invoice_id = i.customer_id AND c.id = i.id",
        "i.invoice_id = p.invoice_id AND c.name = i.customer_id",
      ],
      answer: 0,
      why: "Payments reference their invoice (p.invoice_id = i.id), invoices reference their captain (i.customer_id = c.id) — the chain walks the foreign keys in order. On the proxy ledger that folds 27 payments back to captains: the top captain shows 9 flows worth 24,481.00. Wrong keys don't error — they join, quietly, into nonsense.",
      notes: [
        { choice: 1, why: "p.id = i.id pairs payment #7 with invoice #7 — id parity, not a foreign key. And payments carry no customer_id at all; the captain arrives via the invoice." },
        { choice: 2, why: "Crossing the keys joins payments to the WRONG invoice's captain — it executes and produces plausible-looking per-captain numbers that are all wrong. Key direction is the whole game in settlement chains." },
      ],
      difficulty: "medium",
    },
    {
      id: "careem-mcq-7",
      prompt: "Growth wants each captain's FIRST completed service (the activation moment). Which shape returns exactly one row per captain, deterministically?",
      choices: [
        "GROUP BY captain with MIN(created_at) for the timestamp — and the request id comes free",
        "ROW_NUMBER() OVER (PARTITION BY captain ORDER BY created_at, request_id) = 1 in a CTE, then filter",
        "ORDER BY created_at LIMIT 16",
        "MAX(created_at) per captain — first or last, same thing",
      ],
      answer: 1,
      why: "MIN(created_at) answers 'when' but not 'which request' — any other columns in the SELECT come from an arbitrary row (SQLite's bare-column behavior), so the activation request id is a coin flip. ROW_NUMBER with a deterministic tie-break (created_at, then request_id) picks exactly one row per captain and keeps every column consistent — the keep-latest/earliest pattern this kit drills as keep-latest-dedupe.",
      notes: [
        { choice: 0, why: "The classic bare-column trap: MIN picks the timestamp, SQLite picks some row for the rest — two captains with identical timestamps get arbitrary request ids. Works in a demo, wrong in a deck." },
        { choice: 3, why: "MAX is the LAST service — the churn-risk moment, not activation. Right shape, wrong ORDER BY direction." },
      ],
      difficulty: "hard",
    },
    {
      id: "careem-mcq-8",
      prompt: "The Pay team wants a running settled balance by day. In SUM(settled) OVER (ORDER BY day), three days tie at the same daily total — what does the running value at the FIRST tied day include?",
      choices: [
        "Only that day's total",
        "All three tied days — the default frame is RANGE, and peers ride together",
        "The entire ledger — unordered windows are global",
        "Nothing — window sums need an explicit ROWS frame",
      ],
      answer: 1,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes ordering PEERS, so the first tied day's cell jumps by 3× the daily total. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW counts one day. On a settlement ledger, ties at daily grain are normal — the frame choice changes the number finance quotes.",
      notes: [
        { choice: 0, why: "That's ROWS semantics, and it costs an explicit ROWS clause. The default silently picks RANGE — a balance walk that double-counts tied days is a reconciliation meeting." },
        { choice: 3, why: "Windows never require explicit frames — they silently inherit one. The trap is precisely that the engine chooses your semantics until you do." },
      ],
      difficulty: "hard",
    },
    {
      id: "careem-mcq-9",
      prompt: "The board deck wants one report: card-rail stats, wire-rail stats, and a labelled TOTAL row. Which shape produces it in one query?",
      choices: [
        "GROUP BY method WITH ROLLUP",
        "Two grouped SELECTs (card, wire) UNION ALL a literal 'TOTAL' row computed with the same folds",
        "A CROSS JOIN of methods against a totals table",
        "GROUPING SETS over method",
      ],
      answer: 1,
      why: "UNION ALL stacks same-shaped folds: card row, wire row, then a SELECT 'TOTAL', folds FROM payments — 16/37,364.00, 11/32,248.00, 27/69,612.00. UNION ALL (not UNION) keeps all rows without a dedupe pass, and the literal label is what makes the grand row legible. It's the x3 grand-total stack, and the shape screens love because it proves folds can be composed, not just grouped.",
      notes: [
        { choice: 0, why: "SQLite has no WITH ROLLUP — that's MySQL/SQL Server syntax. Reaching for it in a SQLite screen is a dialect slip the interviewer will probe." },
        { choice: 2, why: "A CROSS JOIN manufactures method × totals pairs — rows nobody asked for, and the 'TOTAL' label still has to come from somewhere. Composition beats cross-multiplication here." },
      ],
      difficulty: "hard",
    },
    {
      id: "careem-mcq-10",
      prompt: "Overnight census: 103 service requests, 82 completed, 14 pending, 7 cancelled. A stakeholder quotes '92% completion'. What's the honest share?",
      choices: [
        "92% — 82 completed plus 14 pending will complete, so count them",
        "79.6% — 82 ÷ 103, with pending and cancelled in the denominator",
        "92.1% — 82 ÷ 89, excluding only cancelled",
        "100% — pending requests are still open, not failed",
      ],
      answer: 1,
      why: "Completion rate is completed ÷ ALL REQUESTED: 82/103 = 79.6%. Every 'better' number is a denominator edit — counting pending as future-completed is forecasting, not measuring, and excluding only cancelled hides the 14 stuck requests the ops floor is working right now. The definition (all requested) gets stated before the ratio, every time.",
      notes: [
        { choice: 0, why: "Optimistic forecasting baked into a census — the pending 14 include requests that will never complete, and the safety floor needs them visible, not pre-counted as wins." },
        { choice: 2, why: "Excluding cancelled shrinks the denominator by exactly the failures the metric exists to surface. On the probed split that edit moves the rate by 7 points — the difference between a trend and a story." },
      ],
      difficulty: "easy",
    },
    {
      id: "careem-mcq-11",
      prompt: "The chase-list pattern generalizes: 'requests with no completion event' over an event log whose request_id is nullable. WHERE request_id NOT IN (SELECT request_id FROM events) returns an EMPTY list even though requests qualify. Why?",
      choices: [
        "NOT IN can't compare integer ids — the predicate is invalid SQL",
        "One NULL in the event log's request_id poisons the whole list: every comparison against NULL is UNKNOWN, so no outer row survives the NOT IN",
        "NOT IN deduplicates the subquery first, and the dedupe collapsed the qualifying ids",
        "The optimizer rewrote NOT IN into an INNER JOIN, dropping unmatched requests",
      ],
      answer: 1,
      why: "x NOT IN (1, 2, NULL) can never be TRUE — the comparison with NULL is UNKNOWN, so every outer row drops and the report reads clean-but-empty. The safe shapes are LEFT JOIN … IS NULL or NOT EXISTS; on the settlement books the 6 flow-less invoices (15,217.00) came from exactly the LEFT JOIN form. An empty chase list is not good news — it's a NULL in the wrong column.",
      notes: [
        { choice: 0, why: "NOT IN is valid SQL and works fine on clean key sets — the failure mode is data (a NULL), not syntax. Blaming syntax is how the bug ships twice." },
        { choice: 2, why: "Deduplication is UNION's behavior, not IN's — and even deduped, the qualifying ids would survive. The emptiness comes from UNKNOWN, not collapse." },
      ],
      difficulty: "hard",
    },
    {
      id: "careem-mcq-12",
      prompt: "The month-close census folds invoices per coverage class. You want only classes with more than one invoice. Where does the filter go?",
      choices: [
        "WHERE COUNT(*) > 1 — right after FROM",
        "HAVING COUNT(*) > 1 — after GROUP BY, because HAVING sees the folded counts WHERE can't",
        "LIMIT 2 — keep the first two classes",
        "WHERE invoices > 1 — reference the SELECT alias",
      ],
      answer: 1,
      why: "Filters on folded (aggregated) values run in HAVING, after GROUP BY; WHERE runs before the fold and can only see raw rows. The alias dodge fails too — WHERE can't see SELECT aliases because SELECT runs after it. On the coverage census (exact 21 / partial 1 / untouched 6) HAVING COUNT(*) > 1 keeps exact and untouched, dropping the lone partial.",
      notes: [
        { choice: 0, why: "COUNT(*) in WHERE is a hard error in every engine — aggregates don't exist yet at that stage of the pipeline." },
        { choice: 3, why: "Aliases resolve after WHERE in the logical pipeline — 'invalid column'. The stage order is the whole question." },
      ],
      difficulty: "easy",
    },
    {
      id: "careem-mcq-13",
      prompt: "The deck's grand-total stack appends a labelled TOTAL row to the card and wire rail rows. Why UNION ALL instead of UNION?",
      choices: [
        "UNION ALL skips the dedupe pass — and the branches can't collide anyway: the literal label row differs from both rail rows",
        "UNION drops NULLs, which would lose the wire rail",
        "UNION ALL allows different column counts per branch",
        "UNION sorts the output, which the deck forbids",
      ],
      answer: 0,
      why: "UNION does a full distinct pass across the stacked result — wasted work here and a hazard: if two rails ever produced identical rows, UNION would silently merge them into one. UNION ALL keeps every row: card 16 / 37,364.00, wire 11 / 32,248.00, TOTAL 27 / 69,612.00 — three rows, no dedupe, no surprises.",
      notes: [
        { choice: 1, why: "UNION keeps NULLs — the NULL behavior claim confuses it with joins/aggregates. The real difference is the dedupe pass." },
        { choice: 2, why: "Every UNION/UNION ALL branch must carry the SAME column count and compatible types — that's the stack's contract, not a differentiator." },
      ],
      difficulty: "easy",
    },
    {
      id: "careem-mcq-14",
      prompt: "Careem Pay stores cents as INTEGER. A teammate 'simplifies' the rail census to SUM(amount_cents/100) and the card rail stops reconciling with the processor's 37,364.00. What happened?",
      choices: [
        "Integer division: each row's cents/100 truncates BEFORE the sum, so fils die row by row — sixteen flows, sixteen quiet losses",
        "SUM skips NULL rows, so some settlements were dropped from the fold",
        "The card rail's true total is lower — the processor's figure is stale",
        "ROUND was missing, so SQLite rounded the final sum down",
      ],
      answer: 0,
      why: "SUM-then-divide is the order that survives: SUM(amount_cents)/100.0 divides ONCE, on the folded total, with the .0 forcing real division. Dividing per row (amount_cents/100) is INTEGER/INTEGER — every flow's sub-100 fils truncate to zero before the fold, and sixteen small losses compound into a rail that reconciles with nothing. The display edge is the only place money changes shape.",
      notes: [
        { choice: 1, why: "SUM over a NOT NULL cents column drops nothing — the drift is arithmetic, not missing rows. Wrong diagnosis, wrong fix." },
        { choice: 2, why: "Trusting the truncated number is exactly how the deck and the processor split apart for a week. The books tie at 69,612.00 — the truncation broke it." },
      ],
      difficulty: "medium",
    },
    {
      id: "careem-mcq-15",
      prompt: "You write LAG(status) OVER (PARTITION BY captain ORDER BY created_at) to read a captain's status drift. Two of their requests share the same created_at. What's the risk?",
      choices: [
        "LAG errors — partition keys must be unique",
        "The previous-row read becomes nondeterministic: equal ORDER BY keys let the engine pick either row, so the same query can return different drift pairs on re-run",
        "LAG ignores ties — both rows read the first request's status",
        "The window needs a GROUP BY to resolve ties",
      ],
      answer: 1,
      why: "Window ORDER BY ties leave the row order within the tie to the engine — LAG's 'previous row' is then whatever the plan happened to produce. The fix is the deterministic tie-break this kit drills everywhere: ORDER BY created_at, id. Captain-level transition reads then reproduce run over run, which is the only way a drift metric earns a place in the ops review.",
      notes: [
        { choice: 0, why: "Partitions are groups, not unique keys — duplicates are normal (that's what PARTITION BY is for). The hazard is ordering, not partitioning." },
        { choice: 2, why: "Ties don't collapse — every row still gets a LAG value. The problem is WHICH value when peers tie, not whether one comes back." },
      ],
      difficulty: "medium",
    },
    {
      id: "careem-mcq-16",
      prompt: "SQLite lets GROUP BY reference the SELECT alias month (STRFTIME('%Y-%m', created_at)). What's the portable habit to carry into stricter engines?",
      choices: [
        "Repeat the full expression in GROUP BY — verbose but valid everywhere",
        "Use GROUP BY 1 — ordinals are universally standard",
        "Aliases work in GROUP BY in every engine, no habit needed",
        "Move the expression into a WHERE clause instead",
      ],
      answer: 0,
      why: "Repeating the expression is the shape that compiles anywhere: SQLite (and Postgres/MySQL) accept the alias, but stricter engines reject output aliases in GROUP BY because the fold logically precedes SELECT. Ordinals are worse — one SELECT edit silently re-buckets the report. The monthly census buckets the 14-month span either way; the habit decides whether it runs on the next warehouse.",
      notes: [
        { choice: 1, why: "Ordinals are exactly the fragility being coached out — one SELECT edit and the fold key changes silently. Verbose beats clever in a shared runbook." },
        { choice: 2, why: "SQLite's leniency is the trap: the query that buckets fine locally can fail CI on a stricter engine. Portability is a habit, not a given." },
      ],
      difficulty: "easy",
    },
    {
      id: "careem-mcq-17",
      prompt: "'Captains whose completed requests beat the fleet average' — the scalar form WHERE completed > (SELECT AVG(completed) FROM folds) throws 'more than one row returned'. What did the inner query do?",
      choices: [
        "AVG over a column always returns one row — the error must be in the outer query",
        "The inner fold lost its GROUP BY (or gained a second column), so the scalar slot received multiple rows instead of exactly one",
        "The comparison operator must be IN when comparing to averages",
        "Scalar subqueries can't contain aggregates — use COUNT instead",
      ],
      answer: 1,
      why: "A scalar subquery slot holds exactly one value: the inner query must be a single-row, single-column fold — AVG over the per-captain CTE. Drop the GROUP BY from the inner fold and it returns one row per captain; add a second column and the shape breaks. The fix is staging: fold in a CTE, compare against the one-row aggregate.",
      notes: [
        { choice: 0, why: "AVG does return one row — when it's aggregating. An ungrouped per-captain fold (or a stray second column) is what put multiple rows in the slot." },
        { choice: 2, why: "IN answers 'in the set of above-average captains' only if the subquery returns the captain list, not the average — different question, different shape." },
      ],
      difficulty: "medium",
    },
    {
      id: "careem-mcq-18",
      prompt: "One pass over requests must print requested, completed, cancelled and pending per region — and the four columns must be structurally incapable of drifting onto different populations. Which shape carries that guarantee?",
      choices: [
        "Four correlated scalar subqueries, one per status",
        "One GROUP BY region with SUM(CASE WHEN status = … THEN 1 ELSE 0 END) arms (or COUNT … FILTER (WHERE …)) — every counter folds inside the same aggregation over the same rows",
        "Four separate GROUP BY queries UNION ALL'd together",
        "GROUP BY region, status with the count, then pivot in the deck layer",
      ],
      answer: 1,
      why: "Arms inside one fold share one population by construction: 103 requested splits into 82 + 7 + 14 per region and the columns reconcile to their own row total without a single join. Four subqueries (or four queries stacked) give each counter its own scan, its own WHERE and its own chance to drift the day someone edits one of them. The FILTER spelling is the same shape with nicer syntax; the guarantee lives in the shared GROUP BY, not the keyword.",
      notes: [
        { choice: 0, why: "Each scalar subquery re-derives its own population per region — four chances for a WHERE edit to split the fold, evaluated row by row. Legal, expensive, and exactly the drift the census forbids." },
        { choice: 2, why: "Stacked GROUP BYs agree only by coincidence and cross-checking — UNION ALL merges outputs, not populations. The reconciliation becomes manual, which means eventual." },
      ],
      difficulty: "hard",
    },
    {
      id: "careem-mcq-19",
      prompt: "Split-payment detection: an invoice settled in two flows. Which self-join returns each two-row invoice as exactly ONE pair?",
      choices: [
        "JOIN payments b ON b.invoice_id = a.invoice_id AND b.id = a.id",
        "JOIN payments b ON b.invoice_id = a.invoice_id AND a.id < b.id",
        "JOIN payments b ON b.invoice_id = a.invoice_id AND a.id <> b.id",
        "JOIN payments b ON a.amount_cents = b.amount_cents AND a.id < b.id",
      ],
      answer: 1,
      why: "The a.id < b.id guard canonicalizes the pair: one orientation, no self-pairs, exactly one row per two-row invoice — the five split-payment invoices on this ledger surface as five pairs. a.id <> b.id returns both orientations (two rows per invoice — ops phones the same captain twice), b.id = a.id never matches a different row, and the amount-equality shape misses every split where the two flows differ in value.",
      notes: [
        { choice: 0, why: "b.id = a.id requires a row to pair with ITSELF — pairing needs two DIFFERENT rows, so this shape returns nothing." },
        { choice: 3, why: "Amount equality is the wrong key for splits — the partial (4,000.00 of 6,148.00) and most two-row settles break into unequal flows, so the pair never matches. Keys follow the money, not the coincidence." },
      ],
      difficulty: "hard",
    },
    {
      id: "careem-mcq-20",
      prompt: "The payout leaderboard ranks captains by net fares; two captains tie at rank 2. Finance wants the next captain printed as 3rd, not 4th. Which function — and what does the other one cost?",
      choices: [
        "DENSE_RANK — compact rungs (1,2,2,3); RANK would print 4 and imply a missing captain who doesn't exist",
        "RANK — Olympic convention; the 4 is correct and expected",
        "ROW_NUMBER — it breaks ties by id, which is what finance wants",
        "NTILE(4) — quartiles are the fairest presentation",
      ],
      answer: 0,
      why: "DENSE_RANK shares the rung and keeps the next at 3 — matching finance's ask. RANK leaves a gap (1,2,2,4) that reads as a missing captain; ROW_NUMBER hands one tied captain an arbitrary 2 and the other a 3 — a payroll argument; NTILE buckets, it doesn't rank. And the deeper rule: payouts follow the VALUE, so both tied captains are paid the same whatever the rung says.",
      notes: [
        { choice: 1, why: "Olympic convention is real — but the stakeholder defined the deliverable, and 'compact rungs' was it. Interviewers grade listening as hard as SQL." },
        { choice: 2, why: "ROW_NUMBER hides the tie entirely — one captain silently outranks the other on an id coin-flip. The worst shape to show a tie-aware reviewer." },
      ],
      difficulty: "medium",
    },
    {
      id: "careem-mcq-21",
      prompt: "AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) reads 2.98 on the ledger. Pending and cancelled requests never grew a completion timestamp — what does AVG do with those rows, and why is the answer still honest?",
      choices: [
        "AVG skips the NULLs, so the average is over the 82 measurable requests — honest, PROVIDED the label says 'completed requests only'",
        "AVG treats NULL as 0, dragging the average down — that's why 2.98 looks low",
        "AVG errors on NULL timestamps — the query must coalesce them first",
        "AVG includes NULLs as their julianday value — julianday(NULL) is 0",
      ],
      answer: 0,
      why: "Aggregate functions skip NULLs: the 14 pending plus 7 cancelled simply aren't in the latency population, and 2.98 days is the completed-request average. The honesty cost is the label — '2.98' must never travel without 'completed only' beside it, because pending requests DO carry latency eventually and mixing the populations later is how a 2.98 becomes a 3.1 with no code change. Same rule as COUNT(completion_ts) reading 82 in the grain drill.",
      notes: [
        { choice: 1, why: "NULL-as-zero is the SUM-of-column myth — AVG ignores NULLs entirely. The number isn't dragged down; it's measured over who's finished." },
        { choice: 2, why: "No error — NULLs are the one input aggregates are defined to skip. COALESCEing timestamps to 'now' would INVENT latency for unfinished requests: a much worse bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "careem-mcq-22",
      prompt: "Cross-vertical adoption: captains active in rides AND deliveries but NOT on the Pay rail. Which set-op shape answers it directly?",
      choices: [
        "(SELECT captain FROM rides INTERSECT SELECT captain FROM deliveries) EXCEPT SELECT captain FROM pay",
        "UNION of rides and deliveries, then UNION pay",
        "EXCEPT rides FROM pay, then INTERSECT deliveries",
        "INTERSECT over all three verticals",
      ],
      answer: 0,
      why: "Composition order IS the business logic: INTERSECT builds the both-verticals set, EXCEPT then removes anyone already on the Pay rail — the A-and-B-not-C shape that defines the next growth lever. INTERSECT over all three answers 'fully adopted' (a different cohort), and UNION answers 'active anywhere' — the widest, least useful set. Set ops read like set logic because they ARE set logic.",
      notes: [
        { choice: 2, why: "EXCEPT rides FROM pay = Pay users not riding — the mirror image of the target cohort. Set ops are directional; the shape must be read aloud." },
        { choice: 3, why: "That's the triple-adopted cohort — the success story, not the opportunity list. Right operator, wrong population." },
      ],
      difficulty: "medium",
    },
    {
      id: "careem-mcq-23",
      prompt: "A teammate 'simplifies' the coverage census: COALESCE(paid_cents, 0) up front, then arms paid = 0 → 'untouched', paid = invoice → 'exact', ELSE 'partial'. Which invoice now reads WRONG — and why does the bug ship anyway?",
      choices: [
        "None — COALESCE before the CASE is equivalent",
        "An invoice genuinely settled to exactly 0 fils would read 'untouched' — the guard conflates 'no settlement rows' with 'a settlement row worth zero'; the populations merged",
        "The exact count drops — COALESCE loses the matched rows",
        "The partial bucket empties — 0 never reaches the ELSE arm",
      ],
      answer: 1,
      why: "COALESCE turns a population statement (no rows) into a value statement (zero fils) — the two read the same in the census but mean different things in the follow-up: 'untouched' gets an AR phone call, 'settled to zero' gets a fraud look. On this ledger the census happens to match (no zero-value settlements exist), which is precisely why the bug ships: the shapes agree until the data changes. NULL policy is a contract — 'no rows' stays 'no rows'.",
      notes: [
        { choice: 0, why: "Equivalent today — that's the trap. The merge is invisible until a zero-value settlement (a refund artifact, a test row) lands and inherits the wrong class." },
        { choice: 3, why: "The ELSE arm catches everything that isn't 0 or exact — partials survive the rewrite. The casualty is the untouched class's meaning, not the partial count." },
      ],
      difficulty: "hard",
    },
    {
      id: "careem-mcq-24",
      prompt: "The coverage census sums invoice cents after LEFT JOINing payments. Five invoices carry TWO settlement rows. What does the naive SUM(i.amount_cents) report for the exact bucket?",
      choices: [
        "65,612.00 — joins never change sums",
        "90,552.00 — every split invoice's amount counts once per payment row, adding 24,940.00 of phantom value",
        "65,612.00 minus the 5 split invoices' amounts — LEFT JOIN drops multi-row invoices",
        "NULL — SUM over a fan-out is undefined",
      ],
      answer: 1,
      why: "The join fans each split invoice to two rows, and SUM folds rows, not invoices: 65,612.00 + (4,860.00 + 5,284.00 + 4,723.00 + 5,614.00 + 4,459.00) = 90,552.00. The fix is staging — fold payments per invoice first (the derived table in the case file), THEN classify — or COUNT(DISTINCT i.id) for counts and a pre-folded CTE for sums. Fan-out is the quietest way a reconciliation goes wrong.",
      notes: [
        { choice: 0, why: "Joins change sums exactly when rows fan out — that's the lesson. 'Never' is a word the ledger will humiliate." },
        { choice: 2, why: "LEFT JOIN keeps every invoice — multi-row ones appear MORE times, not zero. The direction of the damage matters for the fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "careem-mcq-25",
      prompt: "Where does ROUND belong in the cents-to-currency fold?",
      choices: [
        "ROUND(SUM(amount_cents) / 100.0, 2) — divide the folded total once, round once at the display edge",
        "ROUND(amount_cents / 100.0, 2) per row, then SUM the rounded values",
        "ROUND at the deck layer only — SQL should return raw cents as text",
        "No ROUND — INTEGER cents are already 2-decimal",
      ],
      answer: 0,
      why: "Fold in cents, convert once, round once: the total carries full precision until the display edge, and every consumer sees the same number. Per-row rounding bakes drift into the fold (sixteen flows, sixteen roundings — the rail census can come out a fils off the deck's number), and text money can't sum. The month-close deck quotes 37,364.00 and 32,248.00 — one ROUND each, verbatim reproducible.",
      notes: [
        { choice: 1, why: "Per-row ROUND compounds: rounding is lossy, and summing lossy values drifts from the true fold. Rounding is a presentation act, done once." },
        { choice: 3, why: "Cents are the STORAGE unit — 3,736,400 cents must render as 37,364.00. Skipping the conversion ships raw cents to a stakeholder deck." },
      ],
      difficulty: "easy",
    },
    {
      id: "careem-mcq-26",
      prompt: "ORDER BY shipped_at ASC over all 103 requests: where do the rows without a completion timestamp land in SQLite, and what does that mean for the readout?",
      choices: [
        "First — SQLite sorts NULLs smallest in ASC, so the 21 unshipped requests print above every completed one",
        "Last — NULLs always sort high",
        "They're omitted — ORDER BY drops NULL rows",
        "Randomly — NULL order is undefined per query",
      ],
      answer: 0,
      why: "SQLite treats NULL as smallest: ASC puts the 14 pending plus 7 cancelled (21 NULL completion timestamps) at the top of the readout, before the 82 timestamped ones. That's actually useful — the stuck work surfaces first — but only if the team KNOWS the convention; the same query in a NULLs-last engine reads upside-down. State the convention or encode it explicitly with an IS NULL arm in the ORDER BY.",
      notes: [
        { choice: 1, why: "Backwards for SQLite — NULLs sort FIRST in ASC (and last in DESC). Engines disagree; assuming either is how a leaderboard reads upside-down after a migration." },
        { choice: 2, why: "ORDER BY never drops rows — it orders all 103. Omission is WHERE's job, and that's exactly the population edit the census warns about." },
      ],
      difficulty: "medium",
    },
    {
      id: "careem-mcq-27",
      prompt: "The leaderboard ships page-by-page: ORDER BY settled_value DESC LIMIT 10 OFFSET 10. Two captains tie across the page boundary. What's the failure?",
      choices: [
        "None — LIMIT/OFFSET is deterministic by construction",
        "Tied values have no guaranteed order between pages, so a captain can appear on two pages (double payout run) or on none — pagination needs a total-order tie-break like (settled_value DESC, captain_id)",
        "OFFSET skips tied rows by design — ties never paginate",
        "SQLite caps OFFSET at the row count, so the second page is always empty",
      ],
      answer: 1,
      why: "OFFSET pages are stable only over a TOTAL order: ties make the boundary rows interchangeable between executions, and the same captain can straddle two pages or fall through the crack — a payout run that double-pays or skips. The fix is the deterministic keychain: (settled_value DESC, captain_id ASC). Every leaderboard this kit builds ranks with a tie-break for exactly this reason — the rung is cosmetic, the id is the contract.",
      notes: [
        { choice: 0, why: "Deterministic on THIS run is not deterministic across runs — plans change, scan orders flip. Pagination without a total order is a heisenbug in payroll." },
        { choice: 2, why: "OFFSET counts rows, blind to values — ties paginate exactly like everything else. The problem is which tied row sits on which side of the cut." },
      ],
      difficulty: "hard",
    },
    {
      id: "careem-mcq-28",
      prompt: "Settled value per invoice via LEFT JOIN payments: untouched invoices contribute NULL cents. What does SUM(p.amount_cents) return for those rows after GROUP BY invoice?",
      choices: [
        "0 — SUM defaults NULL groups to zero",
        "NULL — all inputs NULL, and SUM over an all-NULL group is NULL; that's the untouched invoice's honest signature",
        "The invoice's own amount — SUM falls back to the join key",
        "An error — SUM can't run on LEFT JOIN output",
      ],
      answer: 1,
      why: "SUM of an all-NULL group is NULL — and that NULL is information: it separates 'no settlement rows' (untouched, 6 invoices) from 'settled to zero' (a value fact). The display layer then COALESCEs to 0.00 WITH the class label preserved beside it; collapsing the NULL at the fold throws away the very signal the receivables follow-up needs. The counters agree: COUNT(p.id) reads 0 for untouched while COUNT(*) still counts the invoice.",
      notes: [
        { choice: 0, why: "SUM returns 0 for an EMPTY group (no rows survive) — an all-NULL group is different: the group exists, its inputs don't. NULL is the honest cell." },
        { choice: 2, why: "No such fallback exists — aggregates see only the column. That fantasy is how 'untouched' invoices get reported as fully paid." },
      ],
      difficulty: "medium",
    },
    {
      id: "careem-mcq-29",
      prompt: "SUBSTR(created_at, 1, 7) buckets the ledger into months. What does that expression rely on — and when does it betray you?",
      choices: [
        "ISO-8601 text ordering ('2024-01-04 10:00…' → '2024-01') — it betrays you the moment timestamps stop being zero-padded ISO text",
        "The database's locale calendar — locale changes re-bucket history",
        "The column's declared type — TEXT columns always substring into months",
        "Nothing — SUBSTR is timezone-aware",
      ],
      answer: 0,
      why: "The slice is pure string surgery: characters 1-7 of ISO text happen to be '%Y-%m'. It's fast, portable, and the 14 buckets from 2024-01 to 2025-02 sort correctly because ISO text sorts like time. The betrayal modes: non-padded formats ('2024-1-4'), locale-formatted strings, or a storage switch to epoch integers — then two buckets merge and the trend lies. STRFTIME('%Y-%m') states the intent and validates the input.",
      notes: [
        { choice: 1, why: "SUBSTR has no calendar inside — no locale, no timezone, no validation. That's its speed AND its fragility; the calendar lives in the text's format." },
        { choice: 3, why: "Timezone-awareness lives in date functions, not string slices. A UTC-shifted timestamp shifts the slice too — bucket boundaries drift with the writer's clock." },
      ],
      difficulty: "easy",
    },
    {
      id: "careem-mcq-30",
      prompt: "COUNT(*) WHERE shipped_at IS NOT NULL on requests reads 82. The status table says delivered 52 + shipped 30. What's the reconciliation?",
      choices: [
        "82 = 52 + 30 exactly — completion timestamps exist precisely for the delivered and shipped statuses; pending (14) and cancelled (7) have none, and 82 + 14 + 7 = 103 reconciles the whole table",
        "82 vs 52 — the timestamp counter is over-counting by 30",
        "The 30 shipped-status rows are pending in disguise",
        "The counts can't be reconciled — they come from different tables",
      ],
      answer: 0,
      why: "The ledger's invariant: shipped_at IS NOT NULL exactly when status is delivered or shipped. The three numbers are one fact in three costumes — 82 timestamped rows, 52+30 by status, 103 total with 14 pending and 7 cancelled completing the census. Any query that treats 'has timestamp' and 'has completed status' as independent populations will double-count or drop rows the first day the data drifts.",
      notes: [
        { choice: 1, why: "The 30 aren't duplicates — they're the in-transit bucket, timestamped at completion-of-handoff. Summing IS the reconciliation, not a discrepancy." },
        { choice: 3, why: "Same table, same rows — the counts reconcile exactly, and THAT'S the audit: 82 + 14 + 7 = 103 with no orphans. A non-reconciling census is a WHERE bug." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-cr-1",
      tier: "easy",
      topic: "l7",
      universe: "month-close",
      title: "Careem Pay rail census",
      brief:
        "Careem-flavored case on the storefront db (payments = settlement flows, amount_cents = INTEGER cents): finance closes the month with the rail census — settlement count and settled value per Pay rail (card-style versus wire-style flows), best rail on top. Probed facts: 27 settlement flows in total, split card 16 flows / wire 11 flows; settled values 37,364.00 (card) and 32,248.00 (wire) — bookkeeping is INTEGER cents, so the value fold is SUM(amount_cents) divided by 100.0 exactly once, at the display edge. The census feeds the month-close deck verbatim, so the rounding shape (ROUND to 2) and the sort direction are part of the deliverable, not styling.",
      ask: "Return the rail census: method, settlement count, settled value (2 decimals) — highest settled value first.",
      template:
        "SELECT method,\n       {1}(*) AS settlements,\n       ROUND(SUM(amount_cents) / {2}, 2) AS settled_value\nFROM payments\nGROUP BY {3}\nORDER BY settled_value {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the settlement counter",
          why: "COUNT(*) folds the number of settlement flows per rail — 16 card, 11 wire, 27 total. SUM(*) is a syntax error (SUM needs an expression), and MAX(*) would report one flow as a rail's volume.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-value divisor",
          why: "The ledger is INTEGER cents, so the value fold is SUM(amount_cents) / 100.0 — the .0 forces real division. Dividing by the integer 100 truncates fils on any total that isn't a round hundred; /1000 would shrink every rail by 10×.",
        },
        {
          answer: "method",
          kind: "keyword",
          label: "the rail grouping key",
          why: "GROUP BY method folds settlements per Pay rail — card versus wire. Grouping by a column that doesn't exist on payments (customer_id) errors, and grouping by a constant folds all 27 flows into one anonymous row.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-rail-first direction",
          why: "The deck reads best-on-top: descending settled value puts the card rail (37,364.00) ahead of wire (32,248.00). ASC would open the close with the smaller rail — a correct query answering the opposite question.",
        },
      ],
      distractors: ["SUM", "1000", "ASC", "customer_id", "MAX"],
      walkthrough:
        "A month-close census where the cents discipline IS the query. The fold is one GROUP BY method over 27 settlement rows: COUNT(*) per rail (16 card, 11 wire) and ROUND(SUM(amount_cents) / 100.0, 2) for value — 37,364.00 and 32,248.00, summing to the 69,612.00 the deck quotes. SUM-then-divide is the order that keeps cents honest: integer division (/100) would truncate on any non-round total, and dividing per-row before summing floats the money mid-pipeline. ORDER BY settled_value DESC is legal because ORDER BY runs after SELECT in the logical pipeline — the alias is visible exactly where WHERE/HAVING are not. The distractors encode the standard close-week failures: 'customer_id' isn't a payments column (the captain arrives via invoices); '1000' shrinks both rails tenfold and produces a deck that reconciles with nothing; ASC opens the close with the smaller rail; and SUM(*) dies at parse time. Two rows, both rails, books tied — that's the whole deliverable.",
    },
    {
      id: "cs-cr-2",
      tier: "medium",
      topic: "j3",
      universe: "growth",
      title: "Captain settlement chain",
      brief:
        "Careem-flavored case on the storefront db (payments = settlement flows → invoices = settlement documents → customers = captains): the finance partner wants the settlement chain at captain grain — which captains actually received flows this cycle, how many, and how much. Probed facts: 27 payment flows land against 28 invoices (21 exact, 1 partial at 4,000.00 of 6,148.00, 6 invoices with no flow at all); rail split card 16 / wire 11; and the known anomalies — a {rose:void-but-paid} invoice (925.00) and a paid-with-no-flow row (1,756.00) — stay in the reconciliation follow-up, not in this view. The ask is the top three captains by settled value, best first, values in currency (cents ÷ 100.0).",
      ask: "Return the top three captains by settled value: name, flow count, settled value (2 decimals) — best first.",
      template:
        "SELECT c.name,\n       COUNT(*) AS flows,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS settled_value\nFROM payments p\nJOIN invoices i ON i.id = {1}\nJOIN customers c ON {2} = i.customer_id\nGROUP BY c.id\nORDER BY settled_value DESC\nLIMIT {3};",
      slots: [
        {
          answer: "p.invoice_id",
          kind: "keyword",
          label: "the payment-to-invoice key",
          why: "Payments reference their settlement document via p.invoice_id = i.id — the foreign key direction of the chain. i.invoice_id doesn't exist (invoices carry the id, not reference it), and i.id = p.id pairs rows by id parity, not by money.",
        },
        {
          answer: "c.id",
          kind: "keyword",
          label: "the invoice-to-captain key",
          why: "Invoices reference their captain via i.customer_id = c.id. Joining on c.name would compare text to an integer id and return nothing; joining i.customer_id to itself matches every row and fans 27 payments out to 756 phantom flows.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the top-three cut",
          why: "The partner asked for the top three captains — LIMIT 3 keeps exactly that podium. The probed chain puts the lead captain at 9 flows / 24,481.00, then 5 / 11,542.00 and 3 / 9,071.00 — a cut short enough to phone, long enough to staff.",
        },
      ],
      distractors: ["i.invoice_id", "p.id", "c.name", "i.customer_id", "1"],
      walkthrough:
        "A settlement chain read — two joins, both riding foreign keys in the right direction. payments → invoices on p.invoice_id = i.id attaches each of the 27 flows to its document; invoices → customers on c.id = i.customer_id attaches the document to the captain; GROUP BY c.id folds to captain grain and ROUND(SUM(p.amount_cents) / 100.0, 2) converts the cents book to currency at the display edge. The probed podium: lead captain 9 flows / 24,481.00, second 5 / 11,542.00, third 3 / 9,071.00 — and the third captain's flow count is the 3 the LIMIT asked for, visible in the result as a self-check. The distractors encode the classic chain failures: i.id = p.id pairs rows by id parity and manufactures wrong sums that still look plausible; ON i.customer_id = i.customer_id is always true and fans the ledger out to 756 rows; c.name compares text to an integer id and empties the podium; and LIMIT 1 hands the partner a one-line deck. Note what this view excludes by design: the 6 flow-less invoices (15,217.00 outstanding) and the partial (4,000.00 of 6,148.00) are the receivables follow-up — a different query, a different owner.",
    },
    {
      id: "cs-cr-3",
      tier: "medium",
      topic: "t4",
      universe: "growth",
      title: "Monthly completed-request census",
      brief:
        "Growth opens the board deck with the monthly run-rate: requests that actually reached a completion timestamp — the {emerald:82-request} population, not the full 103 — bucketed by request month across the 2024-01 to 2025-02 span. The retro isolates the *heavy months*: the ones that carried exactly 8 completed requests, with average completion latency in days beside the count, `JULIANDAY(shipped_at) - JULIANDAY(created_at)` folded per bucket and rounded to 2 decimals. The deck quotes the number only when the bucket, the population and the rounding are all named — {sky:completed-only} is part of the label, not a footnote.",
      ask: "Return the census for months carrying exactly 8 completed requests: month, completed-request count, average completion latency in days (2 decimals), calendar order.",
      template:
        "SELECT STRFTIME({1}, created_at) AS month,\n       COUNT(*) AS requests,\n       ROUND(AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)), 2) AS avg_days\nFROM orders\nWHERE shipped_at IS NOT NULL\nGROUP BY {2}\nHAVING COUNT(*) = {3}\nORDER BY month;",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month-bucket format",
          why: "STRFTIME('%Y-%m', created_at) renders ISO text as '2024-01' — lexicographic order IS calendar order, so the span sorts cleanly across the 2024→2025 boundary. '%Y' collapses everything into two year buckets, and '%d' buckets by day of month, dissolving the monthly read.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the fold key",
          why: "GROUP BY month folds the 82 timestamped requests per bucket via the SELECT alias. Grouping by created_at folds per raw timestamp — one bucket per row — and grouping by shipped_at would anchor the bucket on completion rather than request, silently moving late requests into the wrong month's fold.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the heavy-month cut",
          why: "The HAVING keeps exactly the months whose completed-request count is 8 — the probe returns 2024-02 and 2024-05, both at 8, with latencies 3.25 and 3.0 days. A cut of 7 or 9 returns a different pair of months; the deck's definition of 'heavy' lives in this constant.",
        },
      ],
      distractors: ["'%Y'", "'%d'", "created_at", "shipped_at", "7", "9"],
      walkthrough:
        "A population-first latency read. WHERE shipped_at IS NOT NULL fixes the population at the 82 requests that actually completed — the 14 pending and 7 cancelled never grew a completion timestamp, so they belong to no latency fold. STRFTIME('%Y-%m', created_at) buckets by request month, ISO text sorting straight across the 2024→2025 boundary; GROUP BY month folds the count and ROUND(AVG(JULIANDAY delta), 2) converts text timestamps to fractional days before averaging. HAVING COUNT(*) = 8 keeps the heavy months the retro defined — the probe lands 2024-02 (8 requests, 3.25 days) and 2024-05 (8 requests, 3.0 days), calendar order. The distractors are the standard bucket failures: '%Y' flattens the span into 2 year rows, '%d' dissolves months into days, grouping by created_at or shipped_at re-anchors the fold per row or onto the wrong anchor, and 7 or 9 silently moves the deck's definition of 'heavy'. Denominator named, anchor named, cut named — the census survives the deck.",
    },
    {
      id: "cs-cr-4",
      tier: "medium",
      topic: "j5",
      universe: "refund-audit",
      title: "Settlement-less invoice chase list",
      brief:
        "The receivables side of the Pay close: 6 invoices carry **no settlement flow at all** — 15,217.00 outstanding — and each one becomes a row in the chase list with a named owner. The census folds them by {rose:invoice status} so the open bucket (the AR phone calls under the fixed 30-day terms) separates from the paid-status row that has no money behind it — the {rose:paid-but-flowless} anomaly class (invoice #28, 1,756.00) that reconciliation keeps an eye on. The shape is the anti-join: invoices LEFT JOINed to their settlement flows, kept only where the flow never landed, values converted once at the display edge (`SUM(amount_cents) / 100.0`).",
      ask: "Return the unpaid census: invoice status, invoice count, outstanding value in currency (2 decimals) — largest outstanding first.",
      template:
        "SELECT i.status,\n       COUNT(*) AS unpaid_invoices,\n       ROUND(SUM(i.amount_cents) / {1}, 2) AS outstanding\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = {2}\nWHERE p.id IS {3}\nGROUP BY {4}\nORDER BY outstanding {5};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-value divisor",
          why: "The book is INTEGER cents: SUM first, then one /100.0 at the display edge — the .0 forces real division. The integer 100 only survives while totals are round hundreds; the first odd-fils total truncates silently (12,345/100 = 123), and /1000 shrinks every bucket tenfold.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the anti-join key",
          why: "Payments reference their invoice via p.invoice_id = i.id — the foreign key direction of the settlement chain. p.invoice_id = p.invoice_id is always true and fans every invoice out to all 27 flows; i.customer_id joins payments to the WRONG invoices; p.id pairs rows by id parity, not by money.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-flow guard",
          why: "IS NULL keeps exactly the invoices the LEFT JOIN couldn't match — the 6 flow-less rows. IS NOT NULL inverts the census into the paid book (22 invoices), the opposite deliverable.",
        },
        {
          answer: "i.status",
          kind: "keyword",
          label: "the status fold",
          why: "GROUP BY i.status splits the chase list into the buckets the different owners call: 5 open invoices (13,461.00) and the 1 paid-status row (1,756.00) that has invoice status but no money. Folding by i.id returns one row per invoice — a list, not a census.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The AR review opens with the largest outstanding bucket — open at 13,461.00 above the 1,756.00 anomaly row. ASC buries the headline under the footnote.",
        },
      ],
      distractors: ["p.invoice_id", "p.id", "i.id", "ASC", "1000", "5"],
      walkthrough:
        "An anti-join with a ledger discipline. The spine is invoices: LEFT JOIN keeps all 28, the ON clause walks the true foreign key (p.invoice_id = i.id), and WHERE p.id IS NULL keeps only the 6 the money never reached — 15,217.00 of outstanding value. GROUP BY i.status splits them the way the follow-up actually works: 5 open invoices worth 13,461.00 (the AR calls under the 30-day terms) and the 1 paid-status row worth 1,756.00 — invoice #28, the paid-with-no-flows anomaly the reconciliation log names. ORDER BY outstanding DESC opens the review with the big bucket. The distractors are the standard anti-join wounds: the always-true ON clause fans the ledger out and empties the census; IS NOT NULL flips the deliverable into the paid book; folding by i.id dissolves the census into a per-invoice list; and the wrong divisor shrinks the book — 13,461.00 prints as 1,346.10 under /1000 — a deck that reconciles with nothing.",
    },
    {
      id: "cs-cr-5",
      tier: "hard",
      topic: "t5",
      universe: "supplier",
      title: "Fleet-partner revenue podium",
      brief:
        "The fleet team's quarter review ranks the partners that actually moved the book: revenue folded from fare lines through each partner's catalog (`SUM(unit_price * quantity)` over the partner's products), ranked {emerald:best-first}, podium only. The probe puts Nordic Gadgets AB on top at 11,130.25 — 32% of all revenue — Midwest Hardware Co second at 9,294.93, Alpine Audio GmbH third at 4,765.63; *more than half the book rides on two partners*, which is exactly why the podium cut is a business constant, not a styling choice. Values round to 2 decimals at the display edge; ranks come from the window, computed AFTER the fold.",
      ask: "Return the top three fleet partners by revenue: name, revenue (2 decimals), revenue rank — best first.",
      template:
        "SELECT * FROM (\n  SELECT s.name,\n         ROUND(SUM(oi.unit_price * oi.quantity), 2) AS revenue,\n         {1}() OVER (ORDER BY SUM(oi.unit_price * oi.quantity) {2}) AS revenue_rank\n  FROM suppliers s\n  JOIN products p ON p.supplier_id = {3}\n  JOIN order_items oi ON oi.product_id = {4}\n  GROUP BY s.id\n) WHERE revenue_rank <= {5}\nORDER BY revenue_rank;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the ranking window",
          why: "RANK() OVER (ORDER BY …) numbers the fold best-first and shares rungs on ties. SUM() OVER returns a running total and AVG() OVER a running mean — both legal windows, both wrong deliverables for a podium.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-first order",
          why: "The podium is best-revenue-first, so the window's ORDER BY folds descending — rank 1 lands on the 11,130.25 partner. ASC hands rank 1 to the smallest partner and the podium reads upside-down.",
        },
        {
          answer: "s.id",
          kind: "keyword",
          label: "the partner key",
          why: "Products belong to partners via p.supplier_id = s.id — the catalog edge of the chain. Joining on s.name compares text to an integer id and empties the fold; the id is the key, the name is the label.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the fare-line key",
          why: "Fare lines reference their product via oi.product_id = p.id — the second edge of the chain. oi.product_id = oi.order_id compares a product key to an order key and manufactures nonsense sums that still execute.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the podium cut",
          why: "The business asked for the podium, so the outer filter keeps ranks 1-3 — and the probe's cells include the rank column itself (1, 2, 3). A cut of 1 ships a one-line review; 5 is a league table, not a podium.",
        },
      ],
      distractors: ["SUM", "AVG", "ASC", "s.name", "oi.order_id", "5"],
      walkthrough:
        "A ranked podium is a fold, a window and a cut, in that order. The inner query folds fare lines to partner grain: suppliers → products on the catalog key, products → order_items on the fare-line key, GROUP BY s.id, ROUND(SUM(unit_price * quantity), 2) for the money — 11,130.25, 9,294.93, 4,765.63 for the top three. RANK() OVER (ORDER BY SUM(…) DESC) runs AFTER the fold, numbering partners best-first; the outer filter keeps the podium (ranks 1-3) and ORDER BY revenue_rank presents it. The distractors each break one stage: SUM or AVG as the window returns running totals or running means instead of rungs — and the outer cut then filters on the wrong column entirely; ASC crowns the smallest partner; text-joins on s.name empty the fold; the oi.order_id cross-key manufactures sums that execute and lie; and a cut of 5 is a league table wearing a podium's name. Concentration is the takeaway: the top two partners carry more than half the book — 32% plus 26.7%.",
    },
    {
      id: "cs-cr-6",
      tier: "hard",
      topic: "s6",
      universe: "month-close",
      title: "Settlement coverage census",
      brief:
        "The month-close artifact finance quotes verbatim: every invoice classed by what actually settled against it — {emerald:exact} (settled cents equal invoice cents), {rose:partial} (some money, not all) or 'untouched' (no flow at all). The probed census reads exact 21 / 65,612.00, untouched 6 / 15,217.00, partial 1 / 6,148.00 — and the partial is the follow-up with a name: invoice #25, 4,000.00 of 6,148.00 settled. The trap the census exists to defuse: five invoices settled in two rows (splits), so folding invoice cents across the raw join double-counts them — *stage the per-invoice fold first, then classify*.",
      ask: "Return the coverage census: coverage class, invoice count, invoice value in currency (2 decimals) — largest invoice value first.",
      template:
        "SELECT CASE\n         WHEN folded.paid_cents IS {1} THEN 'untouched'\n         WHEN folded.paid_cents = folded.invoice_cents THEN 'exact'\n         ELSE 'partial'\n       END AS coverage,\n       COUNT(*) AS invoices,\n       ROUND(SUM(folded.invoice_cents) / {2}, 2) AS invoice_value\nFROM (\n  SELECT i.id,\n         i.amount_cents AS invoice_cents,\n         SUM({3}) AS paid_cents\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n) folded\nGROUP BY {4}\nHAVING COUNT(*) >= {5}\nORDER BY invoice_value DESC;",
      slots: [
        {
          answer: "NULL",
          kind: "keyword",
          label: "the untouched arm",
          why: "The first CASE arm must catch 'no settlement rows' — paid_cents IS NULL — before any equality test. NOT NULL inverts the arm and relabels the whole paid book as untouched; skipping the arm folds NULLs into the ELSE and merges untouched into partial.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-value divisor",
          why: "The book is INTEGER cents: fold in cents, then one /100.0 at the display edge. The integer 100 survives only while totals stay round hundreds — the first odd-fils total truncates silently (12,345/100 = 123), and /10 or /1000 inflate or shrink every class tenfold.",
        },
        {
          answer: "p.amount_cents",
          kind: "keyword",
          label: "the settlement fold",
          why: "The staged fold sums the PAYMENT cents per invoice — SUM(p.amount_cents). SUM(i.amount_cents) would fold the invoice's own amount as 'paid' and mark every untouched invoice exact; SUM(p.invoice_id) folds ids as money.",
        },
        {
          answer: "coverage",
          kind: "keyword",
          label: "the class fold",
          why: "The census is one row per class: GROUP BY the CASE's output alias folds the 28 staged invoices into exact / untouched / partial. GROUP BY i.id would return 28 one-invoice classes — a list, not a census.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the existence gate",
          why: "HAVING COUNT(*) >= 1 keeps every class that exists — and the probe's receipt is the partial bucket itself, whose count of 1 appears in the result. A gate of 2 silently drops the partial row — the one row the close exists to chase.",
        },
      ],
      distractors: ["NOT NULL", "10", "i.amount_cents", "i.id", "2", "ASC"],
      walkthrough:
        "A three-stage build: stage, classify, fold. Stage one folds settlements per invoice in the derived table — LEFT JOIN, GROUP BY i.id, SUM(p.amount_cents) — so the five split-payment invoices become ONE row each with their full paid total, and the untouched six carry paid_cents IS NULL as their signature. Stage two classifies with a CASE whose arm order matters: the NULL guard first (NULL equals nothing, so the equality arm can never catch an untouched invoice), the exact equality second, ELSE partial. Stage three folds the classes: COUNT(*) gives exact 21, untouched 6, partial 1 — the probe's receipt — and ROUND(SUM(invoice_cents)/100.0, 2) gives 65,612.00, 15,217.00, 6,148.00, largest first. The distractors are the census's named enemies: NOT NULL relabels the paid book untouched; SUM(i.amount_cents) marks every invoice exact; GROUP BY i.id dissolves the census into 28 rows; a gate of 2 drops the partial — the one row the follow-up log exists for. The trial balance ties at 181,080; this census is how the close proves the tie is honest.",
    },
  ],

  problems: [
    { slug: "trips-and-users", why: "The canonical two-sided screen: cancellation share per city per day with banned users excluded — the exclusion-and-denominator drill behind every Careem completion map. Theme-curated (0 tagged LC for Careem)." },
    { slug: "hopper-company-queries-i", why: "Ride-hailing's own LC series: drivers active per reporting period — the captain-activity census that opens every supply review. Theme-curated." },
    { slug: "hopper-company-queries-ii", why: "Cancellation rate with exclusions by month — unbanned users and excluded trips move the rate, the population discipline the super-app's regional reviews run on. Theme-curated." },
    { slug: "number-of-times-a-driver-was-a-passenger", why: "Two-sided symmetry: captains appearing as customers — the cross-side identity census behind Careem's single-account vision. Theme-curated." },
    { slug: "immediate-food-delivery-ii", why: "Kept-share ratios where the denominator is the whole test — Careem Food's on-time promise in textbook clothing. Theme-curated." },
    { slug: "immediate-food-delivery-iii", why: "Delivery status drift across periods — which orders slipped from fast to slow, the SLA-decay read the Quik team charts weekly. Theme-curated." },
    { slug: "group-sold-products-by-the-date", why: "GROUP_CONCAT basket folds — items per request per day, the multi-line-order shape behind basket-depth reads on 251 fare lines. Theme-curated." },
    { slug: "bank-account-summary", why: "Ledger walk with deposits and withdrawals folded per account — the wallet-balance shape Careem Pay's daily view is built on. Theme-curated." },
    { slug: "account-balance", why: "Running balance over a transaction stream — the order-of-operations drill behind any wallet history screen. Theme-curated." },
    { slug: "count-salary-categories", why: "UNION ALL bucket reports with a labelled high/low/average fold — the settlement-band census finance quotes in the close deck. Theme-curated." },
    { slug: "confirmation-rate", why: "LEFT JOIN acceptance share with unmatched users COALESCE'd to zero — captain acceptance reporting in textbook form, NULL policy included. Theme-curated." },
    { slug: "second-day-confirmation", why: "Next-day behavior gating — which users confirmed on day two, the activation-window read growth runs on new verticals. Theme-curated." },
    { slug: "top-earners", why: "The top-earner fold with ties — highest totals, ranked, tie-aware: the captain payout leaderboard in its purest form. Theme-curated." },
    { slug: "funnel-step-conversion", why: "Stage-by-stage funnel ratios in one pass — install → request → second vertical, the super-app growth story with denominators named. Theme-curated." },
    { slug: "rolling-7d-actives", why: "Trailing-window distinct counts — one captain's ten services count once, the rolling-actives drill the growth team lives by. Theme-curated." },
    { slug: "duplicate-charge-pairs", why: "Double-charge detection over payment pairs — the refund-audit shape that keeps Careem Pay disputes short and customers un-billed twice. Theme-curated." },
    { slug: "uber-first-transaction", why: "Every captain has a first request — the activation moment. First-transaction-per-user is the keep-earliest drill behind the onboarding funnel: MIN or ROW_NUMBER with a deterministic tie-break, one row per captain. Theme-curated." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "The super-app stickiness census in textbook form: active in rides AND deliveries but NOT on Pay. The A-and-B-not-C conditional-aggregation shape is the growth team's weekly set-logic read. Theme-curated." },
    { slug: "average-time-of-process-per-machine", why: "Per-unit latency folds — start-to-end time averaged per unit — the exact JULIANDAY-delta shape behind the 2.98-day completion-latency read. Theme-curated." },
    { slug: "maximum-transaction-each-day", why: "Peak settlement per day: the argmax-per-bucket drill behind Careem Pay's daily high-water mark — ties included, which is where the drill lives. Theme-curated." },
    { slug: "rank-scores", why: "Score ranking with shared rungs: the RANK/DENSE_RANK tie discipline the payout leaderboard runs on, minus the business noise. Theme-curated." },
    { slug: "find-the-team-size", why: "Partition averages brought back onto every row — team size beside each member is fleet-pod size beside each captain: the partition-window shape, t6-flavored. Theme-curated." },
    { slug: "sessionize-events", why: "Request streams arrive as timestamps; sessions are a gap rule folded over ordered events. The gaps-and-islands drill behind any 'time on app' claim. Theme-curated." },
    { slug: "growth-accounting", why: "New / retained / resurrected / churned per period via LAG status transitions — the growth-accounting frame the super-app reports itself in. Theme-curated." },
    { slug: "suspicious-bank-account-transactions", why: "Sliding-window velocity: too many settlements inside N minutes is the Careem Pay fraud trigger — the window-frame drill with money on the line. Theme-curated." },
    { slug: "amount-anomaly-zscore", why: "Settlement amounts that sit far from their rail's mean: the z-score census that turns 'looks weird' into a ranked anomaly queue. Theme-curated." },
    { slug: "trial-balance-check", why: "Conditional SUM of debits and credits folded to a tie — the 181,080 = 181,080 gate in drill form. If this shape is slow, month-close is slow. Theme-curated." },
    { slug: "ar-aging-schedule", why: "Aging buckets over unpaid settlements: the 6 flow-less invoices (15,217.00) become a 0-30/31-60/61+ schedule — the AR view finance chases with. Theme-curated." },
    { slug: "basket-depth-aov", why: "Fare lines per request and value per request — the 251-lines-over-103-requests basket read, with AOV as the headline the deck quotes. Theme-curated." },
    { slug: "repeat-purchase-rate", why: "Share of customers with 2+ requests: the repeat-rate gate that separates a user base from a customer base — super-app retention's first cut. Theme-curated." },
    { slug: "second-day-verification", why: "Day+1 verification join: which signups verified the next day — the activation-gate drill behind every onboarding SLA Careem sets. Theme-curated." },
    { slug: "convert-date-format", why: "Deck-ready date rendering: one query, one formatted column — the presentation-edge discipline that keeps the month-close deck readable. Theme-curated." },
  ],
};
