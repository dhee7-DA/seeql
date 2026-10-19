// HubSpot — kit 6 of the SaaS & Enterprise domain (Batch K).
// Inbound CRM SQL: the storefront db read as a CRM sandbox — customers are
// companies/accounts, orders are deals (delivered = closed-won, cancelled =
// closed-lost, pending = engaged evaluation, shipped = contract out for
// signature), order_items are quoted line items on the deal. Territory
// censuses at two grains, lifecycle-stage win rates with stated denominators,
// engagement leaderboards with honest ties, and the billing tables (INTEGER
// cents) that sit under closed-won. Pool provenance: the registry tags
// exactly 3 sql rows for HubSpot (daily-leads-and-partners, ltv-cac-payback,
// first-last-touch-attribution) — those lead the topics and problem pool, the
// rest is theme-curated and says so. Case briefs quote probed figures from
// scripts/company-facts.md (probed 2026-10-12); every case slot is
// mechanically verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const hubspotKit: CompanyKit = {
  id: "hubspot",
  domainId: "saas",
  name: "HubSpot",
  tagline: "Inbound CRM: pipelines, contacts, growth",
  accent: "text-orange-300",

  brief: [
    "HubSpot is the inbound CRM that gave the industry its funnel vocabulary — Marketing Hub, Sales Hub and Service Hub stitched together by lifecycle stages: subscriber, lead, {orange:MQL}, {orange:SQL}, opportunity, customer. The analyst reality underneath the brand is that every revenue number is a stage-aware conditional count: a deal is not pipeline until its stage says so, and 'win rate' is a population definition before it is a percentage. This kit maps that world honestly onto the storefront db: companies are accounts (16), deals are orders (**103** worth 34,833.28), quoted line items are order_items (251), and the stage map is fixed — delivered = {emerald:closed-won} (52, 50.5%), cancelled = {rose:closed-lost} (7, 6.8%), pending = engaged evaluation (14), shipped = contract out for signature (30).",
    "The data org thinks in objects and grains. The companies object (16 rows) carries region and city; the deals pipeline (103) carries stage, amount and two timestamps that matter — `created_at` when the deal entered, `shipped_at` when the contract went out for signature, NULL until it does. Line items (251) are the quoted SKUs that turn a deal into money, and the billing tables (28 invoices, 27 payments, INTEGER cents) are where closed-won meets collected. Concentration is real: **63.5%** of lifetime value sits with accounts whose spend crosses 3,000 (71.2% above 2,000), and the repeat-deal curve runs 2 one-and-done accounts, 9 at 2–4 deals, 1 at 5, and 4 embedded at 10 or more.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain territory census** — EU carries 45 deals from just 8 companies; the US, 19 from 2 — then escalates into a stage-aware rate where the interviewer asks the denominator question out loud ('does a {rose:closed-lost} deal count in your base?'), then into the engagement leaderboard where four companies are tied at 4 deals and rank semantics become a business decision. Follow-ups probe the first row of a LAG walk and the month spine (2024-01 to 2025-02, 14 buckets). Candidates who state the stage filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the registry tags 3 SQL problems for HubSpot (`daily-leads-and-partners`, `ltv-cac-payback`, `first-last-touch-attribution`) — they lead the pool, and the remaining topic slugs and problems are theme-curated to known screen shapes: two-grain censuses, conditional-count win rates, leaderboard ties, unit economics and attribution. Then run all six case studies on the live db: one rebuilds the territory pipeline census sales ops opens Monday with, the other rebuilds the engagement leaderboard with its shared rungs, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting... The bar to clear: state the *stage definition* and the *denominator* before you compute anything.",
    "Under the CRM sits the billing spine, and it carries one house rule: money is stored as INTEGER cents, so the dollar read is `amount_cents / 100.0` — the missing `.0` is how every odd-cent row quietly leaks its change. The finance objects are small enough to memorize (28 invoices, 27 payments) and dirty enough to matter: a {rose:void-but-paid} invoice (#11, 925.00), *a paid-status invoice with zero settlement rows* (#28, 1,756.00), five split-payment invoices and one partial (4,000 of 6,148 settled). Reconciliation here is row-level, not vibes: the coverage split must read **21 exact / 1 partial / 6 never-collected**, and the ledger's trial balance must land at **181,080 debits against 181,080 credits** — delta zero, or the close does not ship.",
    "Preparation at full depth: the kit now runs **fifteen topics, twenty-four theory drills, thirty MCQs and six audited case studies** on the storefront db. The two originals rebuild the territory census and the engagement leaderboard; the four additions walk a deal-size band census (`CASE` arms at the 500/100 boundary), the above-average account tier (a derived fold judged against a computed platform mean), the month-over-month revenue walk (`LAG` on the `%Y-%m` spine) and the stage census with its {emerald:TOTAL} row appended by UNION ALL. The 32-problem pool keeps the registry's 3 tagged rows up front and curates the rest to CRM screen shapes. The bar to clear: *state the stage definition and the denominator before you compute anything* — then make every stacked total reconcile against a COUNT(*).",
  ],

  dayInLife: [
    "**08:30 —** The day starts with pipeline hygiene. A revenue-operations analyst opens the territory dashboard before the standup: did overnight deal registrations land, did any stage change without an owner, does the {emerald:closed-won} total (52) reconcile with what finance billed? The first query is almost always a reconciliation — deal count by stage versus the snapshot, `orders` against `invoices` at two grains — and the two numbers must agree or the day starts with an incident. The analyst who can write that diff query — which territory is short, by how much, since when — is the one the AE org waits on.",
    "**11:00 —** Midday is deal-desk translation. A regional VP wants the territory census with deals and distinct companies side by side (EU: 45 from 8 — intensity 5.6, the coverage story); finance wants won and lost folded from the same rows so no denominator can drift; a manager wants the engagement leaderboard with the four-way tie at 4 deals handled honestly. Each ask is a join, a conditional aggregate and one judgment call about stages. The analyst writes the query twice — *once to answer, once with the stage definition spelled out so the number survives the argument in the pipeline review.*",
    "**14:30 —** The afternoon tilts toward lifecycle cohorts and money. The repeat-deal curve feeds the retention read (2 one-and-done accounts against 4 embedded at 10-plus — {orange:expansion} is where the base actually grows); the concentration re-cut goes to customer success (63.5% from 3,000-plus accounts, one lost logo moves a quarter); and the dunning list refreshes from the AR anti-join — 6 never-collected invoices worth 15,217 — before billing sends a single reminder. This is the stakeholder hour: every headline number ships with its SQL attached.",
    "**17:30 —** End of day is the writeup that makes tomorrow's numbers trustworthy. The leaderboard query gets saved with its rank policy in the comment (RANK with the tie named, not ROW_NUMBER silently splitting people's bonuses); the standing rule gets enforced — a stage change without a timestamp is a **data-quality ticket, not a rounding note**; and tomorrow's territory follow-ups are queued for the AE org. The rhythm to internalize: HubSpot SQL exists to defend pipeline numbers against *optimistic denominators*.",
    "**20:40 —** Month-end close nights belong to the billing spine. The analyst runs the AR anti-join first — **6 never-collected invoices worth 15,217** — then the coverage split: **21 exact, 1 partial** (4,000 of 6,148 settled) and the open-balance rows dunning will chase tomorrow, never today. Settlement gets its read too: 20 paid invoices averaging **28.4 days** against flat 30-day terms, fastest 13, slowest 84 — *the slowest breach terms by 54 days, and the AE org hears it before the customer does*. The gate that ends the night is the ledger trial balance reading 181,080 against 181,080, delta zero — {emerald:the close ships} or the morning starts with an incident.",
  ],

  metrics: [
    { name: "Pipeline value", what: "Total deal value entered — 34,833.28 across 103 deals on this db. The top-of-funnel number every territory review starts from, folded with the stage rule stated so cancelled deals never inflate it." },
    { name: "Win rate", what: "Closed-won ÷ ALL deals entered: 52 of 103 (50.5%). The denominator is the interview — 52 of 59 resolved (88.1%) is a different metric with a different name, and both are real." },
    { name: "Deals per company", what: "Pipeline intensity: 103 deals ÷ 16 companies platform-wide, EU 45 ÷ 8 = 5.6, US 19 ÷ 2 = 9.5. Load versus coverage — the two-grain read that decides where reps actually spend time." },
    { name: "Average deal size", what: "Value per deal — 338.19 on this db against a 25.47 to 1,088.44 spread. The spread IS the segmentation story: one 1,088.44 logo outweighs the smallest 42 deals combined." },
    { name: "Sales-cycle days", what: "Deal entry to contract-out (created_at → shipped_at): 82 signed deals average 2.98 days, range 2–4. The population definition matters — open deals have no cycle yet and must not dilute the average." },
    { name: "Account concentration", what: "Share of lifetime value from the top accounts: 63.5% sits with 3,000-plus spenders (71.2% above 2,000). The read that staffs customer success — one lost logo is a quarter." },
    { name: "Repeat-deal rate", what: "Companies holding 2+ deals ÷ all companies: 14 of 16 here. The repeat-deal ladder (2 at one, 9 at 2–4, 1 at 5, 4 at 10+) is the expansion curve leadership actually manages." },
    { name: "Billed-vs-collected", what: "Closed-won money versus settled money: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. The AR anti-join finance refreshes every close." },
    { name: "Contract-out latency by region", what: "Days from deal entry to contract-out (created_at → shipped_at) per territory, signed deals only: US 3.07 (15 deals), EU 2.94 (36), APAC 2.93 (29), LATAM 3.5 (2). The map that says where signature friction actually lives — and the population definition (shipped_at IS NOT NULL, 82 deals) ships in the same breath." },
    { name: "Territory loss rate", what: "Cancelled share of entered deals per region: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0 on just 2 deals. A 0% on a 2-deal base is absence of evidence, not a winning streak — the n travels next to every share, and rankings gate on a minimum base." },
    { name: "Days-to-settle", what: "Issue to first payment on paid invoices: 20 invoices average 28.4 days (fastest 13, slowest 84) against flat 30-day terms. The slowest settlements breach terms by 54 days — collections' weekly list, and the reason the average alone never satisfies the CFO." },
    { name: "Open-AR exposure", what: "Open invoices and their cents: 6 open worth 19,609, one already partially settled (4,000 of 6,148). The exposure number billing watches while dunning is drafted — before a single reminder sends." },
  ],

  topics: [
    {
      name: "Pipeline census aggregation",
      why: "Every HubSpot screen opens with a census: deals entered and companies covered per territory, per month, per owner. It is GROUP BY work at two grains, and the trap is letting closed-lost deals pollute a pipeline total — the stage rule rides on every fold.",
      slugs: ["daily-leads-and-partners", "list-the-products-ordered-in-a-period", "unique-orders-and-customers-per-month", "maximum-transaction-each-day"],
    },
    {
      name: "Stage-aware counting & win rates",
      why: "Closed-won, closed-lost, engaged — every rate here is a conditional count over a stage flag, and the interviewer's first question is 'what's in the denominator?'. SUM(CASE WHEN stage …) over ALL entered deals is the shape that survives scrutiny.",
      slugs: ["immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "monthly-transactions-i", "repeat-purchase-rate", "confirmation-rate", "department-highest-salary", "league-statistics"],
    },
    {
      name: "Joining companies to deals",
      why: "Deals inherit territory and account attributes through joins to the companies object, and the join type decides who survives: a deal with no company is corruption; a company with no deals is whitespace. Choosing INNER versus LEFT is a business statement.",
      slugs: ["combine-two-tables", "sales-analysis-i", "top-travellers", "customer-who-visited-but-did-not-transact", "employee-bonus"],
    },
    {
      name: "Engagement leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four companies sit at 4 deals each on this db. RANK, DENSE_RANK and ROW_NUMBER are a business decision about who shares a rung, not syntax trivia.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Deal scoring with CASE",
      why: "HubSpot's deal scores and lifecycle grading are CASE-classified buckets: hot/warm/cold, deal-size bands, engagement tiers. The arms must be exhaustive and ordered — a hole in the CASE is a hole in the forecast.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "triangle-judgement", "find-churn-risk-customers", "average-selling-price"],
    },
    {
      name: "Lifetime value & payback",
      why: "The registry-tagged unit-economics problem lives here: lifetime spend per account against acquisition cost, payback in periods. On this db the lifetime ladder runs from 7,262.35 down to 444.8 — the LTV question is always a two-stage fold.",
      slugs: ["ltv-cac-payback", "customer-purchasing-behavior-analysis", "channel-ltv-vs-cac", "dormant-reactivation", "generate-the-invoice"],
    },
    {
      name: "Attribution & first-touch",
      why: "The registry-tagged attribution problem is the marketing-team screen: which first touch created the deal, which last touch closed it. FIRST_VALUE windows and funnel steps turn the touch stream into credit — and credit is a definition, not a fact.",
      slugs: ["first-last-touch-attribution", "linear-multi-touch", "ads-funnel"],
    },
    {
      name: "Concentration & account sizing",
      why: "When 63.5% of value sits with 3,000-plus accounts, concentration reads decide the coverage model. Share-of-total windows, NTILE quintiles and spend tiers turn a deal table into a portfolio view — the denominator is always total value.",
      slugs: ["portfolio-weights", "rfm-segmentation", "spend-histogram"],
    },
    {
      name: "Subquery screens & quota gates",
      why: "Screens escalate into nested logic: deals above the company average, accounts clearing a deal-count threshold, logos covering every product line. Scalar, IN, EXISTS and HAVING-gated shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "customers-who-bought-all-products", "product-price-at-a-given-date"],
    },
    {
      name: "Billing & cents discipline",
      why: "Closed-won is not collected — the finance tables (28 invoices, 27 payments, INTEGER cents) are where CRM meets reality. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split is a CASE away.",
      slugs: ["bank-account-summary-ii", "trial-balance-check", "monthly-transactions-ii"],
    },
    {
      name: "Stage-set algebra (UNION & EXCEPT)",
      why: "Board packets stack populations side by side — won deals and lost deals in one layout, the stage census with a TOTAL row appended. EXCEPT is the set-difference read when ops asks which won accounts finance never billed. The traps are silent: UNION dedups whole rows, and branches folded at different grains stack into fiction.",
      slugs: ["team-scores-in-football-tournament", "count-salary-categories", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Two-stage folds: derived tables & CTEs",
      why: "The screens escalate into staging: fold per-account deal counts, then judge them against a computed platform mean; fold per-territory means, then join back for names. Each stage's population must be statable in one sentence — a fold you cannot name is a fold you cannot defend.",
      slugs: ["average-salary-of-departments", "last-person-to-fit-in-the-elevator", "median-employee-salary", "students-and-examinations", "find-the-team-size", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Month-over-month walks: LAG & LEAD",
      why: "The 14-month revenue spine (2024-01 to 2025-02) is the forecast call's home turf: prior month beside current, delta rounded, trough and jump named. LAG drives the walk, LEAD powers the deal-velocity reads, and edge rows are NULL by definition — the baseline, never a zero.",
      slugs: ["biggest-window-between-events", "consecutive-transactions-with-increasing-amounts", "second-day-confirmation", "growth-accounting", "customers-with-strictly-increasing-purchases"],
    },
    {
      name: "One-pass censuses: FILTER & conditional counts",
      why: "The ops board gets delivered, shipped, pending and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate and SUM(CASE …) is the portable twin. Four sequential queries drift; one pass cannot.",
      slugs: ["active-businesses", "total-traveled-distance", "create-a-session-bar-chart", "queries-quality-and-percentage"],
    },
    {
      name: "String shaping & export hygiene",
      why: "CRM exports live and die on normalization: account names title-cased before any join, field-length limits validated, month keys SUBSTR-ed off timestamps. The sync layer treats 'acme corp' and 'Acme Corp' as two companies unless SQL says otherwise.",
      slugs: ["fix-names-in-a-table", "fix-product-name-format", "invalid-tweets"],
    },
  ],

  theory: [
    {
      id: "hs-t1",
      q: "Your pipeline report joins companies to deals. When do you INNER and when do you LEFT — and what silently breaks if you filter a deal column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins deals to companies: a deal with no company row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from companies: the companies with no deals ARE the answer, arriving with NULL deal columns. The classic break: filtering status = 'closed-won' in WHERE after a LEFT JOIN kills every NULL-payload company row — the LEFT JOIN quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns zero never-touched companies, and proving a confident zero is itself the analyst's job.",
      tag: "joins",
    },
    {
      id: "hs-t2",
      q: "The territory census shows 103 deals and 16 companies; EU shows 45 deals and 8 companies. Why do the two columns disagree and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts deal rows after the join — one row per deal, so an account with 24 deals contributes 24. COUNT(DISTINCT customer_id) folds those rows back to companies — EU's 45 deals collapse to 8 logos. Neither is wrong: deals measure pipeline load and rep capacity, companies measure installed base and coverage. The ratio — 5.6 deals per company in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for quoted lines and COUNT(*) silently counts line items, not deals. Saying 'one row per what?' for every COUNT is the habit the interviewer grades.",
      tag: "aggregation",
    },
    {
      id: "hs-t3",
      q: "The pipeline review wants closed-won value per territory for territories carrying at least ten deals. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The stage rule is a row-level fact — status = 'delivered' discards open and lost deals before any fold, in WHERE; putting it in HAVING is impossible because stages no longer exist once rows are grouped. The ten-deal floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to deals versus to dollars. The strong answer places every filter by asking: is this a fact about one deal, or about a territory?",
      tag: "pipeline",
    },
    {
      id: "hs-t4",
      q: "Four accounts tie at 4 deals on the engagement leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 6, and the next distinct count (3) lands on 10, implying phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about people's bonuses. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "hs-t5",
      q: "shipped_at is NULL until the contract goes out for signature. What is your policy for the sales-cycle report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only signed deals have a cycle, so the report measures latency of shipped deals and says so — 82 of the 103 deals on this db, averaging 2.98 days, range 2 to 4. Then mechanics: AVG ignores NULLs, so AVG over ALL deals returns the shipped-only average with a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the signed subset; the gap between it and COUNT(*) IS the open-pipeline count, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day signatures for deals still in legal. A report whose WHERE clause is doing definitional work without saying so is exactly what a HubSpot reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "hs-t6",
      q: "WHERE total > (SELECT AVG(total) FROM deals) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 deals always produce an average. On filtered staging tables — one territory, one stage, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each deal to ITS company's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "hs-t7",
      q: "The pipeline trend buckets deals by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's deals, and quarter-end is exactly when deals land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. Date discipline is pipeline discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "hs-t8",
      q: "Finance says an invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money-handling rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why the payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture: counts and sums must agree between systems, and when they do not, the query that shows WHICH rows disagree is the deliverable.",
      tag: "quality",
    },
    {
      id: "hs-t9",
      q: "Two lists land on the rev-ops desk: accounts with a closed-won deal, and accounts finance has invoiced. The ask: which won accounts were never invoiced? Set ops or anti-join — and what does each silently assume?",
      a: "Both shapes answer it, and the choice is about grain. A EXCEPT B folds each side to distinct accounts and returns the difference — compact, but it dedups on the way, so it cannot tell you HOW MANY deals hide behind a won-never-invoiced account. The LEFT JOIN … IS NULL anti-join keeps row grain: one row per won deal lacking an invoice, countable, joinable to territory. Direction is the whole question — won EXCEPT billed (a billing gap) is the mirror image of billed EXCEPT won (an early invoice), and confusing them sends two different teams chasing each other's bug. On this db every won deal has billing in some form, which is exactly why the interesting anomalies live in the mirrored direction: a void invoice WITH a payment (#11, 925.00) and a paid invoice with none (#28, 1,756.00) — set differences against the anomaly list, not against vibes.",
      tag: "setops",
    },
    {
      id: "hs-t10",
      q: "The board wants a running pipeline value across the month spine: SUM(total) OVER (ORDER BY month). A reviewer says the total 'jumped by two months at once' where rows tie. What is actually happening, and what is the fix?",
      a: "The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, meaning rows tied on the ORDER BY value enter the running sum together. On a month spine, ties are rare because months are unique; the trap fires on deal-grain walks where two deals share a created_at — both land in the cumulative at the same step and the number doubles its step. The fix is saying the frame out loud: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly row by row. The third variant is no ORDER BY at all — the frame becomes the whole partition and the 'running total' is a grand total repeated on every row. Company habit: the monthly spine (14 buckets, 2024-01 to 2025-02) can lean on defaults; anything at deal grain writes the frame explicitly, because a total that jumps is a total nobody trusts in the review.",
      tag: "windows",
    },
    {
      id: "hs-t11",
      q: "How would you quartile the account base by deal count — and when would you refuse NTILE in favor of CASE bands?",
      a: "NTILE(4) OVER (ORDER BY deals DESC) deals 16 accounts into four tiles of four, top-down: quartile 1 is exactly the embedded tier — 24, 17, 14, 13 deals. NTILE is data-driven: the edges move whenever the base moves, and ties on the boundary get split by whatever hidden order the engine picked — two accounts with the same deal count can land in different tiles, which is a silent judgment call about peer accounts. CASE bands are contractual: strategic at 500 and up, core at 100, transactional below — fixed edges the deal desk publishes, immune to data drift. The rule I state out loud: tiles for exploration ('how does the base stratify this quarter?'), fixed bands for operations ('which discount ladder does this deal sit on?'). Refuse NTILE wherever a downstream process keys on the bucket value, because a bucket that renames itself when the data shifts is a join waiting to break.",
      tag: "windows",
    },
    {
      id: "hs-t12",
      q: "Deals above their OWN territory's average versus above the platform average — same-sounding asks, different queries. Walk me through both.",
      a: "Platform average: one scalar subquery computed once — on this db, 103 deals ÷ 16 accounts = 6.4375, and exactly four logos clear it (24, 17, 14, 13 deals). Territory average: the mean must be computed per territory, either as a correlated subquery (re-runs per outer row — readable, but a scan per row) or as a derived table folded once and joined back on region — which is what reviewers want at scale, because the fold's population is inspectable in its own stage. The two questions genuinely diverge here: the US runs 19 deals across 2 accounts (9.5 per account) while EU runs 45 across 8 (5.6), so an account can sit above the platform mean and still be below its own territory's bar. That divergence is the interview's real question — state which population the threshold is computed over BEFORE writing the predicate, because the predicate is identical; only the mean's denominator differs.",
      tag: "subqueries",
    },
    {
      id: "hs-t13",
      q: "EXISTS or IN for 'accounts with at least one shipped deal' — and where does the NULL landmine live?",
      a: "EXISTS is a semi-join: it stops at the first matching row and never builds a list, which makes it NULL-safe by construction — nothing is compared against a collection. IN materializes the shipped-deal set and compares each outer row against it, which is fine for small literal lists and acceptable here, but NOT IN over a nullable column is the classic landmine: one NULL in the subquery makes every x NOT IN (…) evaluate to UNKNOWN and the entire result silently vanishes — an empty report that looks valid. On clean CRM objects the join keys are NOT NULL (customer_id on every deal), but staging tables that feed dashboards are exactly where NULLs sneak in, and the empty-result bug ships precisely there. My stated policy: EXISTS for existence tests, IN for small literal sets, and NEVER NOT IN over a column that has not been explicitly NULL-guarded — the reviewer who asks 'what if the inner list holds a NULL?' is testing whether that policy is a habit or a slogan.",
      tag: "subqueries",
    },
    {
      id: "hs-t14",
      q: "When is UNION versus UNION ALL a correctness question and not just a performance one?",
      a: "UNION dedups whole rows across the stacked branches; UNION ALL keeps everything and skips the dedup pass. The correctness trap: if two branches can emit identical rows, UNION silently deletes the duplicates — two territories with the same deal count and value in a stack that forgot to carry the region column collapse into one row, and the board packet loses a territory without an error anywhere. The grand-total stack (the stage census plus its TOTAL row) must be UNION ALL: the total row legitimately equals no other row, and the discipline is knowing WHY it survives dedup, not reaching for UNION 'to be safe' — the dedup that rescues you once will eat real rows another time. Performance follows the same arrow: dedup is a sort-and-compare the engine does for free only when you asked for it. My default on this kit's stacks: UNION ALL, plus an explicit reason in the comment for why duplicates are impossible — that comment is the correctness argument, written down.",
      tag: "setops",
    },
    {
      id: "hs-t15",
      q: "An account executive wants one row per company with every deal id stitched into a single cell. Which aggregate, and what are its sharp edges?",
      a: "GROUP_CONCAT(customer_id) is the fold — default comma delimiter, and here is the first sharp edge: the order of stitched values is not guaranteed unless the query enforces it, so two runs can print the same 24 ids in a different sequence and a diff-based check will scream. Second edge: length — the biggest account on this db carries 24 deals, and a cell of 24 ids is a read, not a report; anything past a handful of values belongs back at row grain or behind a count. Third edge: the fold erases the ability to aggregate the values — once ids live in a string, SUM and COUNT on them are gone, so the stitched cell must be decorative, never load-bearing. The strong answer also offers the alternative unprompted: usually what the AE actually wants is the DEAL COUNT next to the account name and the top two deals by value — GROUP_CONCAT is the last resort when a stakeholder insists on one row, not the default shape of a report.",
      tag: "aggregation",
    },
    {
      id: "hs-t16",
      q: "Why does this shop insist on one-pass censuses — FILTER or CASE-conditional counts — over four separate queries, and what identity proves the pass is complete?",
      a: "Because four queries are four opportunities to drift: different run times against a moving db, four WHERE clauses edited by four people, and no structural force keeping their populations aligned. One pass — COUNT(*) FILTER (WHERE status = 'delivered') or the portable SUM(CASE WHEN status … THEN 1 ELSE 0 END) — reads every branch from the same scan of the same rows, so the branches cannot disagree about time or filters. The identity that proves completeness: the branch sums must equal the unconditional COUNT(*) — 52 + 30 + 14 + 7 = 103 on this db. If a status is missing a branch, the reconciliation breaks by construction, which is the cheapest audit a census can carry. The reviewer's follow-up is always 'what happens when a NEW status appears?' — and the honest answer is the ELSE branch or a null-count check that surfaces it, because a census that silently absorbs an unknown stage into zero is a census that will lie the day the pipeline grows a stage.",
      tag: "aggregation",
    },
    {
      id: "hs-t17",
      q: "AR aging needs a reference date. date('now') or MAX(paid_on) — argue both sides, then pick one.",
      a: "date('now') is 'true' aging — how overdue is everything as of this very moment — but it re-dates the report on every run: two people running the same query an hour apart get different day counts, and nobody can reproduce last Monday's number in a dispute. MAX(paid_on) pins the reference to the data itself — this db's newest settlement — so the same snapshot always yields the same aging, which is what a review and an argument need. Production warehouses usually split the difference with an as-of parameter passed in explicitly; the principle underneath all three is the same: the reference date is part of the metric's DEFINITION and must be pinned or declared, never implied. On this db the terms are flat (every invoice due exactly 30 days after issue, min = max = 30), so aging collapses to reference minus due — one subtraction — and the only thing that can make it lie is the reference date itself. I ship MAX(paid_on) for reproducibility and say so in the query header.",
      tag: "dates",
    },
    {
      id: "hs-t18",
      q: "Your monthly trend query returns 14 buckets and the business window is 14 months. When would the same shape return fewer, and how do you guarantee the full spine?",
      a: "GROUP BY only prints buckets that exist — a month with zero entered deals vanishes from the result and the chart silently compresses, which reads as demand disappearing rather than a rendering bug. (The cousin bug is the '%m' format merging January 2024 with January 2025 — 14 real months folding into 12 fictional ones.) The guarantee: build the spine from the calendar, not from the data — a recursive CTE over months or a months dimension CROSS JOINed to the territories — then LEFT JOIN the folds onto it, so absent months print as explicit zeros instead of missing rows. On this db the trap is dormant: every one of the 14 months from 2024-01 to 2025-02 carries 6 to 9 deals. It wakes up the moment a dashboard slices to one territory — LATAM entered deals in only some months — and the trend line quietly re-plots itself against a shorter axis. Staging slices is exactly where spine discipline stops being pedantry.",
      tag: "dates",
    },
    {
      id: "hs-t19",
      q: "LATAM shows a 0% cancellation rate on 2 entered deals. What does that 0% mean, and how do you keep small denominators from lying?",
      a: "0 of 2 is the absence of evidence, not evidence of absence — the arithmetic is real but the base is too small to rank by, and crowning LATAM 'safest territory' off two deals is how a coin flip becomes a strategy. The guards are mechanical: ship n next to every share (0.0% on 2 deals, not just 0.0%), gate any ranking on a minimum base (HAVING COUNT(*) >= 30 before ORDER BY), and NULLIF-guard the division so a zero denominator yields NULL rather than an error or a fake 100. The subtle part is what NOT to do: resist coalescing that NULL to 0, because NULL ('no stable estimate') and 0 ('measured zero') are different claims about the world, and dashboards that blur them manufacture false confidence. The strong answer ends with the definition: a rate is only as honest as the denominator it prints beside itself — on this db the regional loss map is APAC 8.1%, EU 6.7%, US 5.3% and LATAM 0 on 2, and every one of those four numbers carries its n in the footnote.",
      tag: "nulls",
    },
    {
      id: "hs-t20",
      q: "Where is COALESCE honest, and where is it a lie? Give me your fallback policy for a CRM export.",
      a: "COALESCE is honest when it chooses among display alternatives or equivalent sources: show '—' when no owner is set, fall back from the CRM field to its staging mirror when the sync lags. It is a lie when it manufactures data: COALESCE(shipped_at, created_at) fed into a latency calculation invents same-day signatures for every deal still in legal — the 2.98-day average would silently absorb zeros for the 21 deals that have not shipped, and the metric stops measuring what its name says. The policy I state: COALESCE may change what is DISPLAYED, never what is MEASURED; if a measure genuinely needs a default, the default is a declared business rule with an owner, not a function call buried in the SELECT. The interviewer's follow-up is 'so how do you report latency for unsigned deals?' — and the answer is: as a count beside the metric (82 signed of 103 entered), never folded back into the average that excludes them.",
      tag: "nulls",
    },
    {
      id: "hs-t21",
      q: "This db is 103 deals. Does performance thinking even matter here — and which habits transfer when it is 103 million?",
      a: "At 103 rows every query is instant, and pretending otherwise is theater — but the habits are the transfer, and interviewers probe for them precisely because small data hides their absence. Filter before you fold (WHERE before GROUP BY, so the fold does less); avoid correlated subqueries that re-run per outer row when a derived table folded once and joined back does the same work; stage window walks in CTEs so each step's population is inspectable and the engine can materialize once; index what you filter and join on (status, created_at, the FK columns); and never let the app layer issue N+1 queries where one grouped read would do. The deeper instinct underneath all of it: the ad-hoc read you ship today becomes tomorrow's dashboard dependency with your name on it, and 'it was fine on the sandbox db' is not an incident report anyone accepts. Small data is where the habits are free to build.",
      tag: "performance",
    },
    {
      id: "hs-t22",
      q: "Top account per territory — why can you not just write WHERE RANK() OVER (…) = 1, and what is the shape that works?",
      a: "Because window functions evaluate after WHERE and GROUP BY in the logical pipeline — when WHERE runs, no rank exists yet, so the predicate references a column the query has not computed: a hard error, not a subtle bug. The working shape stages the ranked rows in a CTE or derived table and filters rn = 1 outside — two steps, each inspectable, and it is the portable answer everywhere (some engines grew a QUALIFY clause to collapse the staging; the concept is identical). The second half of the question is the tie policy at the boundary: RANK = 1 can return MULTIPLE top accounts when two tie — on this db the four-way tie at 4 deals sits mid-ladder, but a tie at the top is one data refresh away. Decide out loud whether peers share the crown (RANK, two rows) or a deterministic tie-break (created_at, then id) picks one — and write the choice in the comment, because a silent tie-break inside a 'top account' query is a silent bonus decision.",
      tag: "windows",
    },
    {
      id: "hs-t23",
      q: "Finance flags an invoice marked paid with no payment rows. Beyond fixing the row, what do you build so this class of bug cannot ship silently again?",
      a: "Reconciliation assertions as scheduled queries — each one returns zero rows when healthy and the offending ids when not, and the alert fires on non-emptiness. The core set on this db: status 'paid' with zero payment rows (#28, 1,756.00 — the one that started this conversation); the mirror, status 'void' WITH payment rows (#11, 925.00); the coverage split reconciled against COUNT(*) — 21 exact, 1 partial (4,000 of 6,148), 6 none, summing to 28 invoices; and the ledger trial balance, debits equal credits, 181,080 against 181,080, delta zero. The cultural piece matters as much as the SQL: the deliverable is not the one-off fix, it is the query wired to alert with an owner — a reconciliation that runs only when someone remembers to run it is decoration. And every assertion carries a comment naming the definition it guards, because the next analyst maintaining it needs to know what 'healthy' meant.",
      tag: "quality",
    },
    {
      id: "hs-t24",
      q: "Product wants to change the win-rate definition — engaged pipeline moves out of the denominator. Walk me through how this shop ships a metric change.",
      a: "Like a code change, because a metric IS code with stakeholders. First the registry: the definition (name, denominator, owner) is edited in one place, not in dashboards. Then the dual-run: old and new series published side by side for a full cycle — 52 of 103 entered (50.5%) versus 52 of 59 resolved (88.1%), both named, both plotted — so nobody discovers the change by noticing a line jump. Then the cutover: dashboards annotate the date the definition changed, historical series stay computed under the old definition so trends do not break mid-line, and the change note links the migration query that recomputes anything comparable. What is forbidden is the quiet edit: one team's WHERE clause moving engaged deals out of the denominator while every other consumer's number means something different than it did last quarter. The interviewer is listening for one sentence: *the denominator is part of the metric's name* — 'win rate (of entered)' and 'win rate (of resolved)' are two metrics that share a nickname.",
      tag: "metrics",
    },
  ],

  mcqs: [
    {
      id: "hs-mcq-1",
      prompt: "A deal's status column reads 'delivered'. In lifecycle language, what is it?",
      choices: ["Closed-won — countersigned and booked", "Contract-out — still awaiting signature", "Closed-lost", "Engaged — still in evaluation"],
      answer: 0,
      why: "This kit's stage map is fixed: delivered = closed-won (52 of 103 deals), shipped = contract-out, pending = engaged evaluation, cancelled = closed-lost. 'Delivered' is the only stage that has happened.",
      notes: [
        { choice: 1, why: "Contract-out is 'shipped' — 30 deals signed but not countersigned. Calling commit deals won is how pipeline reviews acquire fictional revenue." },
        { choice: 3, why: "Engaged pipeline is 'pending' — 14 deals still in evaluation. Won pipeline is a contradiction, and the stage column exists to prevent it." },
      ],
      difficulty: "easy",
    },
    {
      id: "hs-mcq-2",
      prompt: "Win rate is defined as closed-won ÷ which population? The db holds 52 delivered and 7 cancelled of 103 entered.",
      choices: ["Delivered + cancelled only (52/59 = 88.1%)", "All deals entered (52/103 = 50.5%)", "Contract-out deals only", "Distinct companies (52/16)"],
      answer: 1,
      why: "The house definition: closed-won ÷ ALL deals entered, engaged pipeline included in the denominator. 50.5% is the honest read; every other denominator computes a real but differently-named metric.",
      notes: [
        { choice: 0, why: "That's the RESOLVED-deal win rate — a legitimate separate metric, but calling it 'the win rate' inflates 50.5% to 88.1% by quietly deleting engaged pipeline. Name the denominator or the number is a claim, not a metric." },
        { choice: 3, why: "52/16 is won deals per company — an intensity ratio, not a rate. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "hs-mcq-3",
      prompt: "EU carries 45 deals from 8 companies. Which column pair reports both grains?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts deal rows (45); COUNT(DISTINCT customer_id) folds repeats back to companies (8). The gap between the columns — 5.6 deals per company — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every deal has a company. Without DISTINCT both columns read 45 and the census loses the coverage story." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not companies — a third grain nobody asked for. The census is deals AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "hs-mcq-4",
      prompt: "EU carries 45 deals from 8 companies. Deals per company — and which number must never be the denominator?",
      choices: ["5.6 — and the deal count must never be the denominator", "0.18 — companies per deal", "8.0 — deals per company", "6.4 — platform-wide average"],
      answer: 0,
      why: "45 ÷ 8 = 5.6 deals per company — the EU intensity read. Flipping it answers 'companies per deal', a different question; 6.4 is the platform-wide ratio (103/16), not EU's.",
      notes: [
        { choice: 1, why: "8/45 = 0.18 is the reciprocal — real arithmetic, wrong metric. Saying the ratio's units out loud ('deals per company') catches it instantly." },
        { choice: 2, why: "8 is the number of companies, not deals per company. Ratios need a numerator from one grain and a denominator from the other." },
      ],
      difficulty: "medium",
    },
    {
      id: "hs-mcq-5",
      prompt: "100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued deals", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, SUM/COUNT of two integers is integer division — every territory's win share truncates toward 0 and the whole map reads as flat. The 100.0 multiplier forces real division first; on this db it is the difference between 50.5 and a displayed 50.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step, and it happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates first, then scales — 0.505 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "hs-mcq-6",
      prompt: "Keep only territories carrying at least 10 deals. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY territory HAVING COUNT(*) >= 10", "WHERE deals >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A deal-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the embedded ladder — 24, 17, 14, 13 deals — clears such a bar per company.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline order teaching itself." },
        { choice: 2, why: "There is no 'deals' column on the raw table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "hs-mcq-7",
      prompt: "The deal-count ladder runs 24, 17, 14, 13, 5, then FOUR companies tied at 4. Under RANK, what rank do the two 3-deal companies carry?",
      choices: ["10", "7", "6", "9"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie at 6, and the next distinct count lands on 10 — five positions were consumed by the tie, so the 3-deal pair shares rank 10.",
      notes: [
        { choice: 1, why: "7 would be DENSE_RANK's answer — ties share rungs without gaps. RANK's contract is to skip: 6,6,6,6 consumes positions 6 through 9." },
        { choice: 3, why: "9 is the last consumed position inside the tie, not the next rank issued. The next DISTINCT value always jumps past the whole tie block." },
      ],
      difficulty: "hard",
    },
    {
      id: "hs-mcq-8",
      prompt: "WHERE o.total > (SELECT AVG(total) FROM orders WHERE status = 'delivered') runs against a staging table where the delivered filter matches nothing. What does the report return?",
      choices: ["An error — scalar subqueries must return a row", "Zero rows silently — the comparison passes nothing", "Every row — NULL comparisons default to true", "Only NULL-total rows"],
      answer: 1,
      why: "The empty inner fold yields NULL, total > NULL is UNKNOWN, and WHERE passes nothing — an above-average report that ships empty-looking-but-valid. On filtered staging tables this bug is routine, which is why the population of the inner fold is stated out loud.",
      notes: [
        { choice: 0, why: "SQLite tolerates the empty case as NULL rather than erroring — worse than a crash, because the report LOOKS fine. Stricter engines error; the portable answer is to check the inner fold." },
        { choice: 2, why: "No comparison against NULL ever defaults to true — UNKNOWN is discarded by WHERE in both directions. Nothing 'passes' a NULL comparison." },
      ],
      difficulty: "hard",
    },
    {
      id: "hs-mcq-9",
      prompt: "An invoice row reads amount_cents = 175600. Which expression prints its dollar value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "INTEGER cents ÷ 100.0 promotes to real arithmetic: 1,756.00. The .0 is the entire fix — integer ÷ integer truncates, and every odd-cent invoice leaks its cents into the floor.",
      notes: [
        { choice: 0, why: "175600 / 100 is integer division = 1756 — on round-dollar invoices the bug hides; the first odd-cent row exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying gives 17,560,000 — units inverted. Sanity-check magnitude: dollars are smaller than cents." },
      ],
      difficulty: "medium",
    },
    {
      id: "hs-mcq-10",
      prompt: "A pipeline trend groups deals with STRFTIME('%m', created_at) and the chart shows 12 buckets for a 14-month window. What happened?",
      choices: ["Two months had no deals — the spine is correct", "'%m' drops the year, so January 2024 and January 2025 merged into one bucket", "The window is wrong — the db only holds 12 months", "STRFTIME cannot bucket by month"],
      answer: 1,
      why: "The db spans 2024-01 to 2025-02 — 14 monthly buckets. '%m' prints month-of-year only, so both Januaries fold into one bucket and both Februaries into another: 14 real months collapse to 12 fictional ones.",
      notes: [
        { choice: 0, why: "Every one of the 14 calendar months carries deals on this db (6 to 9 per month). The loss is a formatting bug, not a demand pattern." },
        { choice: 2, why: "The window is real — 2024-01 through 2025-02. The fix is '%Y-%m', not a shorter date range." },
      ],
      difficulty: "hard",
    },
    {
      id: "hs-mcq-11",
      prompt: "The invoice issue-to-due window reads avg 30, min 30, max 30 days. What does that flat spread mean for an aging query?",
      choices: ["The terms column is broken — terms should vary", "Due date is always issue date + 30 days, so aging is one subtraction from a pinned reference date", "All invoices are overdue by definition", "Aging cannot be computed without payment rows"],
      answer: 1,
      why: "Every invoice carries 30-day terms — min, max and average all read 30 — so due = issued + 30 uniformly, and aging collapses to reference-date minus due: one deterministic subtraction, no per-row term logic.",
      notes: [
        { choice: 0, why: "The flatness IS the finding: this book standardizes on net-30, which is exactly why the 28.4-day settlement average can be compared to terms at all." },
        { choice: 2, why: "Overdue is relative to the reference date, not a property of the terms spread — several open invoices sit inside terms on any given reference day." },
      ],
      difficulty: "easy",
    },
    {
      id: "hs-mcq-12",
      prompt: "LATAM shows a 0.0% cancellation share on 2 entered deals. The board wants regions ranked by loss rate. What do you ship?",
      choices: ["LATAM tops the ranking — 0% is the best score", "The share with n attached (LATAM: 0% on 2 deals), and a minimum-base gate before anything is ranked", "Drop LATAM from the report silently", "Report 50% — half of anything cancels"],
      answer: 1,
      why: "0 of 2 is absence of evidence, not a winning streak. The honest ship is the share WITH its denominator (2 deals) plus a minimum-base gate, so a 2-deal base never outranks a 45-deal base in a board read.",
      notes: [
        { choice: 0, why: "Ranking a 2-deal base against a 45-deal base is exactly the small-denominator trap — the gate exists to stop this decision before it ships." },
        { choice: 3, why: "Invented arithmetic: no cancelled deals means the share is 0, not 50. The problem is the base size, not the rate's value." },
      ],
      difficulty: "easy",
    },
    {
      id: "hs-mcq-13",
      prompt: "The ledger shows 181,080 in debits and 181,080 in credits. Which query proves the books balance?",
      choices: ["SELECT MAX(debits), MAX(credits) FROM ledger_entries", "SELECT SUM(debits) - SUM(credits) FROM ledger_entries — one row, expecting 0", "SELECT COUNT(*) FROM ledger_entries", "Compare the first and last ledger rows"],
      answer: 1,
      why: "Balance is a fold: SUM(debits) − SUM(credits) = 181,080 − 181,080 = 0. One row, one number, zero wiggle — the trial-balance check that gates every close.",
      notes: [
        { choice: 0, why: "Maxes prove nothing about balance — two lopsided columns can share a maximum. Balance is a property of sums, not extremes." },
        { choice: 2, why: "80 entries exist on this db; the row count says nothing about whether the two sides equal each other." },
      ],
      difficulty: "easy",
    },
    {
      id: "hs-mcq-14",
      prompt: "A deal census joins order_items to enrich each deal with quoted SKUs, and the deal count jumps from 103 rows to 251. What happened?",
      choices: ["The join duplicated data — file a data-quality ticket", "Classic fan-out: deals with multiple line items now occupy one row per item — 251 lines over 103 deals is about 2.44 rows per deal", "251 is the correct deal count; 103 was stale", "order_items contains orphan rows with no parent deal"],
      answer: 1,
      why: "One-to-many fan-out: every line item multiplies its parent deal. 251 ÷ 103 ≈ 2.44 lines per deal — the join is healthy; the COUNT grain changed. Fold deals first, or COUNT(DISTINCT o.id) after the join.",
      notes: [
        { choice: 0, why: "The db is consistent — 251 lines belong to 103 deals. The bug is counting at line grain while labeling it deals." },
        { choice: 3, why: "Every line has a parent on this db. Orphans are the wrong suspect — the surprise is grain, not integrity." },
      ],
      difficulty: "medium",
    },
    {
      id: "hs-mcq-15",
      prompt: "Set A = accounts with a closed-won deal; set B = accounts finance invoiced. What does A EXCEPT B return, and what does flipping the operands give?",
      choices: ["The same list either way — EXCEPT is symmetric", "A EXCEPT B = won-but-never-invoiced; B EXCEPT A = invoiced-but-never-won — the direction is the question", "The union of both sets", "An error — EXCEPT requires identical column names"],
      answer: 1,
      why: "EXCEPT keeps rows of the left side absent from the right. Won-without-invoice is a billing-gap investigation; invoiced-without-win is an early-invoice investigation — different teams, different tickets, mirrored queries.",
      notes: [
        { choice: 0, why: "INTERSECT is symmetric; EXCEPT is not. Flipping the operands answers the mirrored question, which is the whole point of the follow-up." },
        { choice: 3, why: "EXCEPT needs matching column counts and compatible types, not identical names — this db runs it without complaint." },
      ],
      difficulty: "medium",
    },
    {
      id: "hs-mcq-16",
      prompt: "NTILE(4) OVER (ORDER BY deals DESC) runs across all 16 accounts. What lands in quartile 1?",
      choices: ["The 4 accounts with the most deals — 24, 17, 14, 13", "All accounts holding more than 4 deals", "A random fourth of the accounts", "The 4 accounts with the FEWEST deals"],
      answer: 0,
      why: "16 rows into 4 tiles means exactly 4 per tile, dealt in ORDER BY deals DESC order — quartile 1 is the top of the ladder: Alice 24, Emma 17, Grace 14, Maya 13. The embedded tier IS Q1.",
      notes: [
        { choice: 1, why: "'More than 4 deals' is a CASE-band read (11 accounts) — data-driven tiles and contractual bands are different tools with different edges." },
        { choice: 3, why: "DESC orders the ladder top-down; ASC would put the one-and-done accounts in Q1 — the direction is part of the tile's definition." },
      ],
      difficulty: "medium",
    },
    {
      id: "hs-mcq-17",
      prompt: "HAVING COUNT(*) >= 4 runs on the per-account deal fold. How many accounts survive the gate?",
      choices: ["16 — HAVING cannot remove accounts", "11 — the ladder 24, 17, 14, 13, 5 and the four-way tie at 4", "9 — only accounts ABOVE 4 deals", "5 — one per tier"],
      answer: 1,
      why: "The fold reads 24, 17, 14, 13, 5, then four companies tied at 4 — every one clears >= 4: 5 + 4 = 11 of 16 accounts. The >= edge includes the tie; a > 4 gate would cut the count to 5.",
      notes: [
        { choice: 2, why: "That is the > 4 read — 5 accounts. The gate says >=, and the tie at exactly 4 stays in." },
        { choice: 0, why: "HAVING is precisely the clause that removes groups after the fold — it is the gate's whole job." },
      ],
      difficulty: "medium",
    },
    {
      id: "hs-mcq-18",
      prompt: "A running deal-value total uses SUM(total) OVER (ORDER BY created_at). Two deals share the same created_at and a reviewer says the total 'jumped by both at once'. Why?",
      choices: ["The rows are duplicated — dedupe first", "With ORDER BY the default frame is RANGE: peers (tied values) enter together — use ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for strict row-by-row", "OVER (ORDER BY …) cannot produce running totals", "It is rounding — ROUND at 2 decimals fixes it"],
      answer: 1,
      why: "The default frame with ORDER BY is RANGE UNBOUNDED PRECEDING TO CURRENT ROW, and RANGE includes peers — tied created_at values join the cumulative at the same step. An explicit ROWS frame walks strictly one row at a time.",
      notes: [
        { choice: 0, why: "The db rows are distinct — the frame, not duplication, groups peers. Deduping would corrupt the fold, not fix it." },
        { choice: 2, why: "Running totals are the canonical demo of window frames; the surprise is only the peer semantics of the RANGE default." },
      ],
      difficulty: "hard",
    },
    {
      id: "hs-mcq-19",
      prompt: "WHERE customer_id NOT IN (SELECT owner_id FROM territories) returns ZERO rows on a staging table, and the join keys look healthy. What do you check first?",
      choices: ["Whether the outer table is empty", "Whether the subquery returns a NULL — one NULL makes every NOT IN comparison UNKNOWN and the whole result vanishes", "Whether NOT IN should be lowercase", "Whether both columns share the same type"],
      answer: 1,
      why: "NOT IN over a list containing NULL is never TRUE — x NOT IN (1, 2, NULL) evaluates UNKNOWN for every x, and WHERE discards UNKNOWN. An empty result that looks valid is the NULL landmine's signature.",
      notes: [
        { choice: 0, why: "An empty outer table would be obvious at a glance; the classic silent failure is a healthy outer table producing zero rows." },
        { choice: 3, why: "Type mismatches usually error or coerce visibly. NULL comparisons neither error nor warn — they just erase rows." },
      ],
      difficulty: "hard",
    },
    {
      id: "hs-mcq-20",
      prompt: "The AR aging report pins its reference date to MAX(paid_on) instead of date('now'). Why?",
      choices: ["date('now') is not supported in SQLite", "MAX(paid_on) pins the report to the data snapshot — same db, same number, forever; date('now') re-dates the aging on every run", "MAX(paid_on) is always newer than today", "It makes the query faster"],
      answer: 1,
      why: "Aging is reference minus due; a moving reference makes two runs of the same snapshot disagree. Pinning to MAX(paid_on) — this db's newest settlement — makes the report reproducible. The reference date is part of the metric's definition.",
      notes: [
        { choice: 0, why: "date('now') runs fine — that is precisely the problem: it moves. The pin is about determinism, not capability." },
        { choice: 3, why: "Cost is irrelevant at 27 payments. The choice is reproducibility versus drift, never speed." },
      ],
      difficulty: "hard",
    },
    {
      id: "hs-mcq-21",
      prompt: "'63.5% of lifetime value sits with accounts above 3,000 spend.' What exactly is the denominator?",
      choices: ["The 16 accounts", "Total lifetime deal value — 34,833.28", "The 103 deals", "The accounts above 3,000 spend"],
      answer: 1,
      why: "Concentration is a share of VALUE: the 3,000-plus spenders' lifetime total divided by the 34,833.28 book = 63.5%. The 71.2% variant uses the 2,000 threshold — same denominator, wider numerator population.",
      notes: [
        { choice: 2, why: "Deals are the wrong grain — a 24-deal account and a 1-deal account weigh by their totals here, not per deal. That would be a different metric with a different name." },
        { choice: 0, why: "16 is the account count; the share is of money, not logos — logos-in-the-numerator would be a coverage metric." },
      ],
      difficulty: "easy",
    },
    {
      id: "hs-mcq-22",
      prompt: "Marketing wants a 'premium tier' of quoted products priced at 200 and up. What does the query return on this db?",
      choices: ["The Smart Watch S at 199.99 plus everything above", "Zero rows — the catalog tops out at 199.99, so the >= 200 band is empty", "All 16 products", "An error — 200 exceeds the price column's range"],
      answer: 1,
      why: "The most expensive product is 199.99 (Smart Watch S), so a >= 200 band is honestly empty — and proving a confident zero beats inventing a tier. The premium story on this catalog lives at 149.99 and below.",
      notes: [
        { choice: 0, why: "199.99 < 200 — the watch stays out of the band. Boundary arithmetic is the entire question." },
        { choice: 2, why: "No filter, no tier — calling every product premium deletes the segmentation instead of answering it." },
      ],
      difficulty: "easy",
    },
    {
      id: "hs-mcq-23",
      prompt: "Paid invoices settle in 28.4 days on average against 30-day terms (fastest 13, slowest 84). The CFO asks: 'are we getting paid on time?' What is the honest one-line answer?",
      choices: ["Yes — 28.4 is under 30", "On average yes (28.4 against 30-day terms), but the tail breaches: the slowest settlement ran 84 days — 54 over terms", "No — 84 is greater than 30", "Unanswerable without the terms column"],
      answer: 1,
      why: "The average sits inside terms, but the tail is the risk: fastest 13, slowest 84. Averages answer 'typically'; the max answers 'how bad does it get' — both ship, one line each.",
      notes: [
        { choice: 0, why: "True and incomplete — quoting the average alone hides a 54-day breach that collections already knows about." },
        { choice: 2, why: "The 84-day outlier is real but not the whole book; the 28.4 average is equally part of the truth." },
      ],
      difficulty: "easy",
    },
    {
      id: "hs-mcq-24",
      prompt: "Nordic Gadgets AB shows 32% of revenue. Which fold computes a supplier's revenue share on this db?",
      choices: ["orders → customers: SUM(total) per customer", "order_items → products → suppliers: SUM(quantity * unit_price) per supplier, divided by the total book", "suppliers.rating × COUNT(listings)", "invoices → payments: SUM(amount) per supplier"],
      answer: 1,
      why: "Supplier revenue flows through the catalog: line items carry product_id and unit_price, products carry supplier_id — fold to supplier and divide by 34,833.28. Nordic's 11,130.25 ÷ 34,833.28 ≈ 32%.",
      notes: [
        { choice: 3, why: "Invoices and payments bill CUSTOMERS — they carry no supplier reference. The finance tables are the wrong door for supplier revenue." },
        { choice: 0, why: "That folds revenue to ACCOUNTS — the concentration read (63.5%), right arithmetic, wrong join path." },
      ],
      difficulty: "medium",
    },
    {
      id: "hs-mcq-25",
      prompt: "Invoice #25 reads 6,148 with 4,000 settled against it. In the coverage classification, which class does it land in?",
      choices: ["exact — some money arrived", "partial — payments exist but payments <> amount", "no payment — the balance is outstanding", "void — open invoices with payments are voided"],
      answer: 1,
      why: "Partial is defined as settled-but-not-fully: 4,000 of 6,148. The split matters operationally — dunning chases a partial differently from a never-invoiced. The full census reads 21 exact, 1 partial, 6 none.",
      notes: [
        { choice: 0, why: "Exact means payments = amount — 6,148 against 6,148. 4,000 is 65% coverage, not exact." },
        { choice: 2, why: "Payment rows exist against this invoice, so 'no payment' is factually wrong — the classes are about payment rows, not balances." },
      ],
      difficulty: "medium",
    },
    {
      id: "hs-mcq-26",
      prompt: "COUNT(*) FILTER (WHERE status = 'delivered') reads 52. Which expression is its portable twin?",
      choices: ["SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)", "COUNT(status = 'delivered')", "SUM(status = 'delivered')", "AVG(CASE WHEN status = 'delivered' THEN 1 END)"],
      answer: 0,
      why: "A 1/0 flag summed over all rows is the conditional count — same 52, same single pass, runs on any engine. FILTER is syntax sugar over exactly this shape.",
      notes: [
        { choice: 1, why: "COUNT of an expression counts non-NULL results — the boolean is non-NULL on every row, so it counts 103. COUNT never tests truthiness." },
        { choice: 2, why: "SQLite tolerates SUM(boolean) as 0/1 arithmetic, but strict engines refuse booleans in SUM — the CASE form is the portable contract." },
      ],
      difficulty: "medium",
    },
    {
      id: "hs-mcq-27",
      prompt: "Mean deals per account is 103 ÷ 16 = 6.44, but the median account sits at 4 deals. What does the gap tell the growth board?",
      choices: ["The median is wrong — recompute it", "The base is right-skewed: four embedded accounts (24, 17, 14, 13 deals) drag the mean up; the typical account holds 4 deals", "The accounts should be deduplicated", "Mean and median must always match"],
      answer: 1,
      why: "A ladder of 1-to-5-deal accounts plus a 24/17/14/13 head is textbook right skew: the mean (6.44) reads like the base is deeper than it is, while the median (4) is the typical logo. Expansion plans run off the median; concentration reads run off the tail.",
      notes: [
        { choice: 0, why: "Both numbers are correct — the divergence IS the signal, not an arithmetic error to repair." },
        { choice: 3, why: "They coincide only on symmetric distributions; account activity is the opposite of symmetric." },
      ],
      difficulty: "medium",
    },
    {
      id: "hs-mcq-28",
      prompt: "LEAD(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) is NULL on an account's last row. What business fact does that NULL carry?",
      choices: ["The timestamp is corrupt", "No next deal exists yet — on a one-and-done account every row is a last row; 2 of 16 accounts look exactly like this", "The deal was cancelled", "LEAD evaluated before ORDER BY"],
      answer: 1,
      why: "The edge-row NULL means 'nothing after this' — for the 2 accounts holding a single deal, the only row is also the last: a built-in one-and-done flag. Coalescing it to 'now' would turn that flag into fake recency.",
      notes: [
        { choice: 0, why: "NULL at the boundary is the definition of LEAD, not corruption — the last row simply has no successor." },
        { choice: 2, why: "Stage lives on the row itself, not in the window — a cancelled deal still has a successor or not, regardless of status." },
      ],
      difficulty: "hard",
    },
    {
      id: "hs-mcq-29",
      prompt: "After joining orders to customers, COUNT(*) OVER (PARTITION BY c.region) reads 45 for EU. The analyst expected 8. What does the window count?",
      choices: ["Companies — the join lost rows", "Deal rows in the partition — the join fanned EU to 45 order rows behind its 8 companies; logos need a fold with COUNT(DISTINCT …), not a window over raw rows", "Regions — 4 was expected", "Line items — 251 in total"],
      answer: 1,
      why: "Windows count the rows they see — post-join, EU is 45 deal rows fanned out from 8 companies. A window COUNT aggregates rows and never DISTINCT values; the two-grain census needs COUNT(DISTINCT customer_id) in the fold.",
      notes: [
        { choice: 0, why: "No rows were lost — extra rows appeared. The direction of the surprise is the diagnostic." },
        { choice: 2, why: "PARTITION BY region defines the groups; the COUNT inside still counts the fanned rows, not the partition keys." },
      ],
      difficulty: "hard",
    },
    {
      id: "hs-mcq-30",
      prompt: "WHERE RANK() OVER (ORDER BY deals DESC) <= 10 fails to compile. Why — and what is the fix?",
      choices: ["RANK needs an alias first", "Window functions evaluate after WHERE in the pipeline — stage the ranked rows in a CTE or derived table, then filter the rank outside", "Use LIMIT 10 instead — identical semantics", "Wrap RANK in parentheses"],
      answer: 1,
      why: "The logical pipeline puts windows after WHERE and GROUP BY — when WHERE runs, no rank exists yet, so the predicate references a column the query has not computed. The working shape: rank in a CTE, filter rn <= 10 outside (SQLite has no QUALIFY clause).",
      notes: [
        { choice: 2, why: "LIMIT truncates rows after ordering — with ties it splits tied accounts arbitrarily, while a rank cut shares rungs deliberately (11 rows can survive a 'top 10')." },
        { choice: 3, why: "Syntax sugar changes nothing — the evaluation order, not the spelling, is the wall." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-hs-1",
      tier: "easy",
      topic: "j7",
      universe: "funnel",
      title: "The territory pipeline census",
      brief:
        "HubSpot-flavored brief on the storefront db: Monday's pipeline review opens with the territory census — deals entered, distinct companies covered, pipeline value — and sales ops is explicit that all three columns fold from the same joined rows so no denominator can drift. Probed facts: 103 deals entered worth 34,833.28, split EU 45 deals from 8 companies (15,089.23), APAC 37 from 5 (11,605.45), US 19 from 2 (7,286.16), LATAM 2 from 1 (852.44). The review reads biggest book first, and the two-grain pairing matters: load (deals) and coverage (companies) are different claims about the same territory.",
      ask: "Return each territory with its deal count, distinct company count and pipeline value to 2 decimals, biggest book first.",
      template:
        "SELECT c.region AS territory,\n       COUNT(*) AS deals,\n       {1}(DISTINCT o.customer_id) AS companies,\n       ROUND(SUM(o.total), {2}) AS pipeline_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY pipeline_value {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the company counter",
          why: "COUNT(DISTINCT customer_id) folds repeat deals back to logos: EU reads 8, not 45. SUM(DISTINCT …) adds the id codes together and MAX(DISTINCT …) reports the largest id — neither is a census.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          why: "Money reports to 2 decimals — EU's 15089.23. ROUND(…, 1) prints 15089.2 and the territory totals stop reconciling with the 34,833.28 book finance closed.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads biggest book on top: EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44. ASC would open the meeting on LATAM's 2 deals — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "ASC"],
      walkthrough:
        "One join, one fold, three columns at two grains. The join attaches every deal to its company's territory — all 103 survive — and GROUP BY region folds them into four rows where COUNT(*) reads load (45 / 37 / 19 / 2), COUNT(DISTINCT o.customer_id) reads coverage (8 / 5 / 2 / 1), and ROUND(SUM(o.total), 2) reads the book (15,089.23 / 11,605.45 / 7,286.16 / 852.44) — all straight from the probed census. Because every column folds the same joined rows, no denominator can drift between them; that is the audit sales ops asked for. The distractors fail honestly: SUM in the company slot adds customer ids together and MAX returns the largest id — a census of nothing; 1 in the precision slot truncates the book to one decimal so it stops reconciling with finance; ASC flips the board so the meeting opens on LATAM. The two-grain pairing is the read: EU's 45-from-8 (5.6 deals per company) versus the US's 19-from-2 (9.5) says the US book is concentrated while EU's is broad — one query, two business claims.",
    },
    {
      id: "cs-hs-2",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The engagement leaderboard",
      brief:
        "HubSpot-flavored brief on the storefront db: the customer-success review wants the engagement leaderboard — companies ranked by deals entered — with the ties handled by policy, not by accident. Probed facts: the deal-count ladder runs 24 (Alice Chen), 17 (Emma Wilson), 14 (Grace Kim), 13 (Maya Patel), 5, then FOUR companies tied at 4, then two tied at 3; 2 of 16 companies sit at a single deal. The board's rule: RANK semantics — tied companies share a rung and the next distinct count skips past the whole tie block — and the cut is drawn at rank 10 so every company down to the 3-deal tier stays visible.",
      ask: "Return the leaderboard of companies with deal counts and RANK ranks, cut at rank 10, ties sharing rungs deterministically by name.",
      template:
        "WITH per_account AS (\n  SELECT c.name AS account,\n         {1}(*) AS deals\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.name\n),\nranked AS (\n  SELECT account,\n         deals,\n         {2}() OVER (ORDER BY deals {3}) AS engagement_rank\n  FROM per_account\n)\nSELECT account, deals, engagement_rank\nFROM ranked\nWHERE engagement_rank <= {4}\nORDER BY engagement_rank, account;",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the deal counter",
          why: "COUNT(*) folds the joined rows into per-company deal counts — the 24 / 17 / 14 / 13 ladder. SUM(*) and MAX(*) are not SQL in that slot; the leaderboard is a count, not an extremum.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rung window",
          why: "RANK gives the four 4-deal companies the same rank (6) and skips to 10 for the 3-deal pair — the board's published policy. ROW_NUMBER would print 6, 7, 8, 9 and silently split tied accounts.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-engaged-first direction",
          why: "Leaderboards read top-down: Alice Chen's 24 deals on row one. ASC would rank the one-and-done accounts first and cut the embedded tier out of the top-10 window entirely.",
        },
        {
          answer: "10",
          kind: "number",
          label: "the rank cutoff",
          why: "Cutting at rank 10 keeps eleven rows — the two 3-deal companies SHARE rank 10, so both stay visible. A cut at 9 would drop one of them while claiming the same coverage.",
        },
      ],
      distractors: ["SUM", "ROW_NUMBER", "LEAD", "ASC", "9"],
      walkthrough:
        "Two stages: fold the ladder, then rank it. The first CTE folds 103 deals into 16 per-company counts — 24, 17, 14, 13, 5, four at 4, two at 3, three at 2, two at 1, straight from the probed repeat-deal distribution. The second CTE adds RANK() OVER (ORDER BY deals DESC): ties share rungs, so the 4-deal quartet all read rank 6 and the 3-deal pair both read rank 10 — eleven rows pass the <= 10 cut, which is the honest cost of shared rungs. The distractors each break a different way: SUM and LEAD in the window slot are argument errors (no fold, no forward-look without an argument); ROW_NUMBER prints 6, 7, 8, 9 inside the tie — a silent bonus decision about four peer accounts; ASC inverts the board so the cut lands on the embedded tier instead of the one-and-done tier; 9 in the cutoff drops Farid Nasser or Hiro Tanaka — whichever the ordering hands it — while still being called a top-10 board. Note the tie-break inside equal ranks: ORDER BY engagement_rank, account keeps Isabella, Keiko, Noah and Pedro in a deterministic order so the query is reviewable, even though the rank they share is the published fact.",
    },
    {
      id: "cs-hs-3",
      tier: "medium",
      topic: "s6",
      universe: "pricing",
      title: "The deal-size band census",
      brief:
        "HubSpot-flavored brief on the storefront db: the deal desk bands every entered deal by size — strategic (500 and up), core (100 to 499.99), transactional (under 100) — with a count and a value per band, because the discount ladder is negotiated per band, not per deal. Probed facts: 103 deals entered worth 34,833.28; the average deal runs 338.19 against a 25.47 to 1,088.44 spread, so every band will be populated. The boundary rule is fixed: a deal at exactly 500.00 is strategic, the arms are ordered high-to-low, and the ELSE arm is everything below — a hole in the CASE is a hole in the forecast.",
      ask: "Return each deal-size band with its deal count and total value to 2 decimals, biggest book first.",
      template:
        "SELECT CASE\n         WHEN total >= {1} THEN {3}\n         WHEN total >= {2} THEN 'core'\n         ELSE 'transactional'\n       END AS deal_band,\n       COUNT(*) AS deals,\n       ROUND(SUM(total), 2) AS band_value\nFROM orders\nGROUP BY deal_band\nORDER BY band_value {4};",
      slots: [
        {
          answer: "500",
          kind: "number",
          label: "the strategic floor",
          noVerify: true,
          why: "The strategic band starts at 500 — the 1,088.44 maximum and the rest of the head deals live there. A 600 edge would re-band every 500-to-599.99 deal into core and shrink the strategic book mid-review.",
        },
        {
          answer: "100",
          kind: "number",
          label: "the core floor",
          noVerify: true,
          why: "Core is 100 to 499.99 — the mid-market rung of the ladder. A 150 edge swallows the 100-to-149.99 deals into transactional and the discount ladder shifts underneath the quarter's negotiations.",
        },
        {
          answer: "'strategic'",
          kind: "keyword",
          label: "the band's published name",
          why: "The THEN literal is the band's name as the deal desk publishes it. An unquoted strategic would be read as a column and error; 'enterprise' would rename the band and silently break every downstream filter keyed on it.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads the biggest book on top — 17,379.43 strategic, then 16,585.19 core, then the 868.66 transactional tail. ASC would open the meeting on the tail — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["600", "150", "'enterprise'", "ASC"],
      walkthrough:
        "One CASE, three arms, zero holes — arms ordered high-to-low so the bands partition cleanly. The predicate splits 103 deals at 500 and 100: strategic 25 deals worth 17,379.43, core 63 deals worth 16,585.19, transactional 15 deals worth 868.66 — and the three values sum back to the 34,833.28 book, the internal audit the desk checks before publishing. COUNT(*) and SUM(total) fold the same rows per band, so count and value can never disagree about population. The arms are also self-documenting: the label in the THEN is the definition the review reads. The distractors each break differently: a 600 strategic floor re-bands the 500-to-599.99 deals into core; a 150 core floor dumps 100-to-149.99 deals into transactional; 'enterprise' relabels the band and breaks every downstream key; ASC flips the read so the 868.66 tail opens the deck. And the arm-order trap deserves its own sentence: swap the first two WHENs and every deal at 100 or above becomes strategic — exhaustive arms are not enough, ORDER matters.",
    },
    {
      id: "cs-hs-4",
      tier: "hard",
      topic: "q5",
      universe: "growth",
      title: "The above-average account tier",
      brief:
        "HubSpot-flavored brief on the storefront db: the growth board wants the embedded tier — accounts whose deal count clears the platform mean — with the mean COMPUTED by the query, never typed. Probed facts: 103 deals across 16 accounts; the per-account ladder runs 24 (Alice Chen), 17 (Emma Wilson), 14 (Grace Kim), 13 (Maya Patel), then 5 and below. The mean lands at 6.44 after rounding, and exactly four logos clear it — the same four that hold 63.5% of lifetime value (spend above 3,000). The tier is small, load-bearing, and one hardcoded constant away from fiction.",
      ask: "Return each account whose deal count exceeds the computed platform mean, with its deal count, best first.",
      template:
        "SELECT d.account,\n       d.deals\nFROM (SELECT c.name AS account,\n             {1}(*) AS deals\n      FROM orders o\n      JOIN customers c ON c.id = o.customer_id\n      GROUP BY c.name) AS d\nCROSS JOIN (SELECT ROUND(COUNT(*) * {2} / COUNT(DISTINCT customer_id), 2) AS platform_mean\n            FROM orders) AS m\n{3} d.deals > m.platform_mean\nORDER BY d.deals {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the per-account deal counter",
          why: "COUNT(*) folds the joined rows into per-account deal counts — the 24/17/14/13 ladder. SUM(*) and MAX(*) are not SQL in that slot; the tier is a count, not an extremum.",
        },
        {
          answer: "1.0",
          kind: "keyword",
          label: "the real-division promoter",
          why: "COUNT(*) * 1.0 / COUNT(DISTINCT customer_id) forces real arithmetic before the fold: 103 * 1.0 / 16 = 6.44 after rounding. Integer division would truncate the mean and shift the tier's edge.",
        },
        {
          answer: "WHERE",
          kind: "keyword",
          label: "the row-level gate",
          why: "The tier filter is a row-level fact about each folded account — WHERE d.deals > m.platform_mean. HAVING without a GROUP BY in the outer query is an error, not a stylistic variant.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-first direction",
          why: "The tier reads top-down: Alice Chen's 24 deals on row one. ASC would present the embedded tier upside down and invite the board to read Maya's 13 as the headline.",
        },
      ],
      distractors: ["SUM", "MAX", "0.0", "HAVING", "ASC"],
      walkthrough:
        "Two stages, each with a statable population. The derived table folds 103 joined deal rows into 16 per-account counts — the probed ladder 24, 17, 14, 13, 5, four at 4, and down. The CROSS JOINed mean fold computes the threshold honestly: 103 * 1.0 / 16 = 6.4375, rounded to 6.44 — computed, never typed, so the tier re-derives itself when the pipeline moves. WHERE keeps the four logos that clear it: Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13 — the same four whose spend above 3,000 carries the 63.5% concentration headline, which is why the board calls this the embedded tier. The distractors fail instructively: SUM or MAX in the counter slot are syntax errors (only COUNT takes the star); 0.0 in the promoter slot zeroes the mean and the gate admits all 16 accounts — a tier of everyone is a tier of no one; HAVING in the gate slot errors because the outer query has no GROUP BY; ASC inverts the read. The deeper lesson is the two-population discipline: the mean's denominator (16 accounts) and the tier's numerator grain (deals per account) are different populations, and the query keeps them in separate stages so neither can drift.",
    },
    {
      id: "cs-hs-5",
      tier: "hard",
      topic: "t7",
      universe: "month-close",
      title: "The month-over-month revenue walk",
      brief:
        "HubSpot-flavored brief on the storefront db: the month-close review wants the revenue walk — every '%Y-%m' bucket with its revenue, the prior month beside it, and the delta rounded to 2 decimals — so the forecast call can name troughs and jumps instead of gesturing at a chart. Probed facts: the spine runs 2024-01 (3,731.97) to 2025-02 (2,390.53); 2024-02 reads 3,609.64 against 3,731.97 — a -122.33 first step; the trough month 2024-07 sits at 1,193.86; the biggest single drop lands in 2024-11 (2,975.67 to 1,648.80, -1,326.87) and the biggest jump in 2024-08 (1,193.86 to 2,352.07, +1,158.21). The first row's prior is NULL — the baseline, not a zero.",
      ask: "Return the 14-month walk: month, revenue, prior month and mom_delta to 2 decimals, oldest first.",
      template:
        "WITH monthly AS (\n  SELECT STRFTIME({1}, created_at) AS month,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n), walked AS (\n  SELECT month,\n         revenue,\n         {2}({3}, {4}) OVER (ORDER BY month) AS prior_month\n  FROM monthly\n)\nSELECT month,\n       revenue,\n       prior_month,\n       ROUND(revenue - prior_month, 2) AS mom_delta\nFROM walked\nORDER BY month;",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month-bucket format",
          why: "'%Y-%m' prints '2024-01' — the 14-bucket spine finance expects. '%m' alone drops the year, so both Januaries merge and the walk reads 12 fictional buckets.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the backward-looking window",
          why: "LAG(revenue, 1) fetches the previous bucket's value on the same row — the walk's engine. LEAD would look forward and the 'prior month' column would become a next-month column with a different NULL edge.",
        },
        {
          answer: "revenue",
          kind: "keyword",
          label: "the walked measure",
          why: "The walk follows revenue — the folded ROUND(SUM(total), 2) — so deltas are dollar moves. LAG(month, 1) would walk the labels and 'delta' would become a string subtraction that errors.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the one-step offset",
          noVerify: true,
          why: "LAG's second argument is the step back: 1 for month-over-month. An offset of 2 silently turns the walk into a two-month comparison and every delta doubles its meaning.",
        },
      ],
      distractors: ["'%m'", "LEAD", "'month'", "2"],
      walkthrough:
        "A window walk staged in two CTEs, each with one job. The monthly CTE folds 103 deals onto the '%Y-%m' spine — 14 buckets, 3,731.97 down to the 1,193.86 trough at 2024-07, back to 2,390.53 by 2025-02, exactly the probed monthly trend. The walked CTE adds LAG(revenue, 1) OVER (ORDER BY month): prior values ride along on each row, and the outer SELECT finishes the arithmetic — ROUND(revenue - prior_month, 2) — naming the moves: -122.33 into February, -1,326.87 into November, +1,158.21 into August. The first row's prior is NULL and its delta stays NULL — that is the baseline, reported as NULL, never coalesced to zero. The distractors each corrupt a different joint: '%m' merges both Januaries and the walk loses a month; LEAD flips the walk to face forward; 'month' in the measure slot walks labels instead of values; an offset of 2 turns every delta into a two-month move. The discipline underneath: the fold's population (all 103 deals, every stage) and the window's ordering (the month spine) are stated once each, and every downstream number inherits them.",
    },
    {
      id: "cs-hs-6",
      tier: "easy",
      topic: "x3",
      universe: "funnel",
      title: "The stage census with the grand total",
      brief:
        "HubSpot-flavored brief on the storefront db: the ops board needs the full stage picture in ONE stitched report — every stage's deal count and value, plus a TOTAL row that must reconcile to 103 deals and 34,833.28 by construction. Probed facts: delivered 52 (50.5%), shipped 30, pending 14, cancelled 7 (6.8%). The stack is UNION ALL, not two queries pasted into a deck — two queries drift, one query cannot. The TOTAL label is a published convention: downstream filters key on it, and a relabeled total is a broken feed nobody notices until month-end.",
      ask: "Return one stitched report: each stage with its deal count and value to 2 decimals, plus a TOTAL row, biggest first.",
      template:
        "SELECT status,\n       {1}(*) AS deals,\n       ROUND(SUM(total), 2) AS value\nFROM orders\nGROUP BY {2}\nUNION ALL\nSELECT {3},\n       COUNT(*),\n       ROUND(SUM(total), 2)\nFROM orders\nORDER BY deals {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the stage counter",
          why: "COUNT(*) folds deal rows per stage — 52, 30, 14, 7. SUM(*) and MAX(*) are not SQL in that slot; a census counts, it does not take extrema.",
        },
        {
          answer: "status",
          kind: "keyword",
          label: "the stage column",
          why: "The census folds on orders.status — the pipeline's own grain. region lives on customers, not orders, so a region fold here errors; a customer_id fold would print 16 one-row stages and no census.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-total label",
          why: "The appended row is labeled 'TOTAL' — the published convention downstream filters key on. 'GRAND TOTAL' reads the same to a human and breaks every automated consumer of the label.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "DESC puts the 103-deal TOTAL row on top and delivered's 52 next — the board reads the whole, then its parts. ASC would bury the total at the bottom under the 7-deal cancelled row.",
        },
      ],
      distractors: ["SUM", "region", "'GRAND TOTAL'", "ASC", "MAX"],
      walkthrough:
        "One fold, one append, one reconciliation. The first branch folds 103 deals by status — delivered 52 worth 15,571.07, shipped 30 worth 11,996.72, pending 14 worth 6,113, cancelled 7 worth 1,152.49 — and the second branch appends the same table unfolded: 'TOTAL', 103, 34,833.28. The reconciliation identity is the report's audit: 52 + 30 + 14 + 7 = 103 and the four values sum to 34,833.28, so a missing stage would break the total by construction. UNION ALL is the append that cannot lie — the total row equals no other row, and no dedup pass runs to quietly eat it. ORDER BY deals DESC reads the whole first, then the stages biggest-first. The distractors each fail a different way: SUM and MAX in the counter slot are syntax errors; region is not a column of orders — territories live on customers; 'GRAND TOTAL' relabels the row and breaks every downstream filter keyed on 'TOTAL'; ASC buries the total under the cancelled tail. The habit this case drills: a stacked report ships with its reconciliation identity stated, because the total that cannot be re-derived from its parts is a total nobody should trust.",
    },
  ],

  problems: [
    { slug: "daily-leads-and-partners", why: "Two-grain daily census — deals AND distinct accounts in one GROUP BY. The registry-tagged opener and the exact muscle of this kit's territory census case." },
    { slug: "ltv-cac-payback", why: "The registry-tagged unit-economics screen: lifetime value per account against cost, payback in periods — the follow-up every HubSpot loop runs after the census." },
    { slug: "first-last-touch-attribution", why: "The registry-tagged attribution screen: FIRST_VALUE credit for the touch that created the deal — marketing's favorite argument, settled in SQL." },
    { slug: "immediate-food-delivery-ii", why: "A conditional-count ratio where the denominator is the whole test — the win-rate question in textbook clothing: 52 of 103 entered, not 52 of 59 resolved." },
    { slug: "percentage-of-users-attended-a-contest", why: "Territory adoption share — the percentage of companies a campaign touched, with the 100.0-before-division fix this kit drills." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before any engagement leaderboard ships, said out loud with the 1,2,3,4,5,6,6,6,6,10 pattern." },
    { slug: "combine-two-tables", why: "Company enrichment LEFT JOIN — account attributes attached to every deal, NULL-safe for rows the pipeline hasn't touched." },
    { slug: "unique-orders-and-customers-per-month", why: "Monthly census at two grains: deals entered and companies active per month — coverage and load in one query, the way pipeline reviews open." },
    { slug: "weather-type-in-each-country", why: "CASE-classified grading per territory — hot/warm/cold deal scores computed in one pass with exhaustive arms." },
    { slug: "portfolio-weights", why: "Each company's share of total value — the concentration read behind the 63.5%-from-3,000-plus headline, computed as a window share." },
    { slug: "repeat-purchase-rate", why: "The repeat-deal rate: companies holding 2+ deals over all companies — 14 of 16 here, the expansion curve leadership manages." },
    { slug: "managers-with-at-least-5-direct-reports", why: "The quota gate: a HAVING-counts subquery — accounts clearing a deal threshold before any leaderboard is allowed to print." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Top-account argmax by deal count — who renews most often (24 deals on this db), decided on a grouped count rather than a screenshot." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with rounding at the very end — won and lost shares that reconcile to the same denominator, the honest-denominator drill." },
    { slug: "growth-accounting", why: "New/expansion/churned classification via LAG — pipeline movements as a query rather than a slide, the walk the forecast call defends." },
    { slug: "customers-who-never-order", why: "The whitespace anti-join: companies with zero deals. On this db the honest answer is 0 — and proving a confident zero is the analyst's job." },
    { slug: "the-most-recent-three-orders", why: "The follow-up rail: each account's last three deals via a partitioned ROW_NUMBER with a deterministic tie-break — the queue the AE org actually works from, computed rather than screenshotted." },
    { slug: "find-churn-risk-customers", why: "Customer-success anti-join: accounts showing activity but no recent commitment — the churn-risk shortlist computed, not guessed, before the QBR list is drawn." },
    { slug: "customer-who-visited-but-did-not-transact", why: "MQLs that never opened a deal: engaged visitors with zero transactions — the marketing-qualified-but-stalled population every inbound CRM lives with." },
    { slug: "confirmation-rate", why: "A LEFT JOIN share where unmatched rows count honestly and rounding lands at the end — the win-rate twin, drilled to the decimal with the denominator named." },
    { slug: "students-and-examinations", why: "Zero-fill census: every subject with attendees and a fallback 0 for the untouched — accounts with no activity this month must print, not vanish from the board." },
    { slug: "employee-bonus", why: "LEFT JOIN enrichment where the unmatched side stays visible with a NULL payload — commission logic that respects missing history instead of inventing zeros." },
    { slug: "average-selling-price", why: "A weighted ratio folded per group — deal-weighted versus simple averages is exactly the argument this settle-up settles for the deal desk." },
    { slug: "product-price-at-a-given-date", why: "As-of pricing: the list price in force at quote time — the same 'which version of the truth' fork the deal desk argues every quarter." },
    { slug: "maximum-transaction-each-day", why: "Argmax per day — the largest deal per month decided on a window over the fold, the way the forecast call names its anchor deals." },
    { slug: "department-highest-salary", why: "Top account per territory with a join-back for names — DENSE_RANK staged in a derived table, the classic screen closer in CRM clothing." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Expansion detection via LAG: accounts whose deal values only climb — the upsell signal the retention team pounces on before renewal season." },
    { slug: "find-the-team-size", why: "COUNT(*) OVER (PARTITION BY …) done right: per-account deal depth attached to every row without losing the deal grain — the window-fold discipline in miniature." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Deal velocity: accounts with two entries inside a week — the date-math screen defended with either a self-join or a window, out loud." },
    { slug: "dormant-reactivation", why: "NOT EXISTS over an activity window: accounts gone quiet past a threshold — the reactivation list before the quarter closes, not after." },
    { slug: "generate-the-invoice", why: "Building the billed row: argmax per group with cents-safe aggregation — the invoice-generation shape finance asks for when CRM hands off to billing." },
    { slug: "league-statistics", why: "Played/won/lost stacked per side via UNION ALL — the two-population packet that must reconcile to the same denominator twice, the kit's stacking habit." },
  ],
};
